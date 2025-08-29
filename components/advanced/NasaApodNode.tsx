import React, { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  RefreshCw,
  ExternalLink,
  Calendar,
  User,
  Copyright,
} from "lucide-react";
import { NodeHandles } from "./NodeHandles";
import { ResizeHandle } from "./ResizeHandle";
import type { NodeData } from "../types";

export interface NasaApodNodeProps {
  node: NodeData;
  style?: React.CSSProperties;
  onResize?: (width: number, height: number) => void;
  onConnectStart?: (
    nodeId: string,
    handlePosition: "top" | "bottom" | "left" | "right",
    event: React.MouseEvent,
  ) => void;
  onConnectEnd?: (
    nodeId: string,
    handlePosition: "top" | "bottom" | "left" | "right",
    event: React.MouseEvent,
  ) => void;
  alwaysShowHandles?: boolean;
}

export const NasaApodNode: React.FC<NasaApodNodeProps> = ({
  node,
  style,
  onResize,
  onConnectStart,
  onConnectEnd,
  alwaysShowHandles = false,
}) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const nodeRef = useRef<HTMLDivElement>(null);
  const [nodeSize, setNodeSize] = useState({
    width: node.style?.width || 320,
    height: node.style?.height || 400,
  });

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["nasa-apod", refreshKey],
    queryFn: async () => {
      const response = await fetch("/api/nasa/apod");
      if (!response.ok) {
        throw new Error("Failed to fetch NASA APOD");
      }
      return response.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
    refetch();
  };

  const nodeWidth = nodeSize.width;
  const nodeHeight = nodeSize.height;

  const handleConnectStart = (
    position: "top" | "bottom" | "left" | "right",
    event: React.MouseEvent,
  ) => {
    event.stopPropagation();
    onConnectStart?.(node.id, position, event);
  };

  const handleConnectEnd = (
    position: "top" | "bottom" | "left" | "right",
    event: React.MouseEvent,
  ) => {
    event.stopPropagation();
    onConnectEnd?.(node.id, position, event);
  };

  const handleResize = (width: number, height: number) => {
    setNodeSize({ width, height });
  };

  const handleResizeEnd = () => {
    onResize?.(nodeSize.width, nodeSize.height);
  };

  return (
    <div
      ref={nodeRef}
      className="group relative bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
      style={{
        width: nodeWidth,
        height: nodeHeight,
        ...style,
      }}
    >
      <NodeHandles
        node={node}
        onConnectStart={handleConnectStart}
        onConnectEnd={handleConnectEnd}
        alwaysShow={alwaysShowHandles}
        nodeWidth={nodeWidth}
        nodeHeight={nodeHeight}
      />

      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="flex items-center space-x-2">
          <div className="text-lg">🚀</div>
          <div>
            <div className="font-semibold text-sm">NASA APOD</div>
            <div className="text-xs opacity-80">
              Astronomy Picture of the Day
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          className="text-white hover:bg-white/20"
          disabled={isLoading}
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Content */}
      <div
        className="p-3 space-y-3 overflow-y-auto scrollbar-none"
        style={{ height: nodeHeight - 60 }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 text-sm text-center p-4">
            <div className="font-medium">Failed to load NASA APOD</div>
            <div className="text-xs mt-1">
              Check your connection and try again
            </div>
          </div>
        ) : data ? (
          <div className="space-y-3">
            {/* Title */}
            <div className="font-semibold text-gray-900 dark:text-white text-sm leading-tight">
              {data.title}
            </div>

            {/* Date */}
            <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
              <Calendar className="w-3 h-3" />
              <span>{data.date}</span>
            </div>

            {/* Image */}
            {data.media_type === "image" && (
              <div className="relative">
                <img
                  src={data.url}
                  alt={data.title}
                  className="w-full rounded-lg"
                  onError={(e) => {
                    e.currentTarget.src =
                      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDIwMCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTI4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgNjRMMTEwIDU0SDE0MEwxMzAgNzRMMTIwIDg0TDEwMCA2NFoiIGZpbGw9IiNEMUQ1REIiLz4KPC9zdmc+";
                  }}
                  style={{ height: "fit-content" }}
                />
                <a
                  href={data.hdurl || data.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}

            {/* Copyright */}
            {data.copyright && (
              <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                <Copyright className="w-3 h-3" />
                <span>{data.copyright.trim()}</span>
              </div>
            )}

            {/* Explanation */}
            <div className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              {data.explanation.length > 200
                ? `${data.explanation.substring(0, 200)}...`
                : data.explanation}
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-1">
              <Badge variant="secondary" className="text-xs">
                {data.media_type}
              </Badge>
              <Badge variant="outline" className="text-xs">
                NASA
              </Badge>
            </div>
          </div>
        ) : null}
      </div>

      {/* Resize Handles */}
      {node.resizable !== false && (
        <>
          <ResizeHandle
            position="top-left"
            visibility="hover"
            nodeRef={nodeRef}
            resizable={node.resizable !== false}
            onResize={handleResize}
            onResizeEnd={handleResizeEnd}
          />
          <ResizeHandle
            position="top-right"
            visibility="hover"
            nodeRef={nodeRef}
            resizable={node.resizable !== false}
            onResize={handleResize}
            onResizeEnd={handleResizeEnd}
          />
          <ResizeHandle
            position="bottom-left"
            visibility="hover"
            nodeRef={nodeRef}
            resizable={node.resizable !== false}
            onResize={handleResize}
            onResizeEnd={handleResizeEnd}
          />
          <ResizeHandle
            position="bottom-right"
            visibility="hover"
            nodeRef={nodeRef}
            resizable={node.resizable !== false}
            onResize={handleResize}
            onResizeEnd={handleResizeEnd}
          />
        </>
      )}
    </div>
  );
};
