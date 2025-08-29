import React, { useState, useEffect } from "react";
import { Cloud, Wind, Droplet, Sun, MapPin } from "lucide-react";
import { NodeHandles } from "./NodeHandles";
import type { NodeData } from "../types";

interface GeoResult {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
}

export interface WeatherNodeProps {
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

export const WeatherNode: React.FC<WeatherNodeProps> = ({
  node,
  style,
  onConnectStart,
  onConnectEnd,
  alwaysShowHandles = false,
}) => {
  const [query, setQuery] = useState("San Francisco, US");
  const [suggestions, setSuggestions] = useState<GeoResult[]>([]);
  const [selected, setSelected] = useState<GeoResult | null>({
    name: "San Francisco",
    country: "United States",
    latitude: 37.7749,
    longitude: -122.4194
  });
  const [weather, setWeather] = useState<{
    temperature: number;
    windspeed: number;
    winddirection: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const nodeWidth = node.style?.width || 280;
  const nodeHeight = node.style?.height || 300;

  // 1) Fetch city autocomplete
  useEffect(() => {
    if (!query) return setSuggestions([]);
    const id = setTimeout(() => {
      fetch(`/api/weather/geocoding?query=${encodeURIComponent(query)}`)
        .then((r) => r.json())
        .then((data) => setSuggestions(data.results || []))
        .catch(() => setSuggestions([]));
    }, 300);
    return () => clearTimeout(id);
  }, [query]);

  // 2) When a city is picked, fetch current weather
  useEffect(() => {
    if (!selected) return;
    setLoading(true);
    fetch(`/api/weather/forecast?latitude=${selected.latitude}&longitude=${selected.longitude}`)
      .then((r) => r.json())
      .then((data) => setWeather(data.current_weather))
      .finally(() => setLoading(false));
  }, [selected]);

  const handleConnectStart = (
    position: "top" | "bottom" | "left" | "right",
    event: React.MouseEvent,
  ) => {
    if (event && event.stopPropagation) {
      event.stopPropagation();
    }
    onConnectStart?.(node.id, position, event);
  };

  const handleConnectEnd = (
    position: "top" | "bottom" | "left" | "right",
    event: React.MouseEvent,
  ) => {
    if (event && event.stopPropagation) {
      event.stopPropagation();
    }
    onConnectEnd?.(node.id, position, event);
  };

  return (
    <div
      className="group relative bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
      style={{
        width: nodeWidth,
        height: 250,
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
        <div className="flex items-center space-x-2">
          <Cloud className="w-5 h-5" />
          <div>
            <div className="font-semibold text-sm">Weather</div>
            <div className="text-xs opacity-80">Live weather data</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 space-y-3 relative">
        {/* City search */}
        <input
          type="text"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Search city..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelected(null);
            setWeather(null);
          }}
          onClick={(e) => e.stopPropagation()}
        />

        {/* Suggestions dropdown */}
        {suggestions.length > 0 && (
          <div className="absolute top-16 left-3 right-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 max-h-32 overflow-auto rounded-lg z-50 shadow-lg">
            {suggestions.map((loc) => (
              <div
                key={`${loc.latitude}-${loc.longitude}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelected(loc);
                  setQuery(`${loc.name}, ${loc.country}`);
                  setSuggestions([]);
                }}
                className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 last:border-b-0"
              >
                <div className="flex items-center space-x-2">
                  <MapPin className="w-3 h-3 text-gray-400" />
                  <span className="text-sm">
                    {loc.name}, {loc.country}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Weather display */}
        {weather && selected && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {selected.name}
              </h3>
              <Sun className="w-5 h-5 text-yellow-500" />
            </div>
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Cloud className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Temperature
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {weather.temperature}°C
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Wind className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Wind Speed
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {weather.windspeed} m/s
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Droplet className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Wind Direction
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {weather.winddirection}°
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
