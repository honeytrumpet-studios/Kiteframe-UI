import React, { useEffect, useRef, useState } from 'react';
import { NodeData } from '../types';
import * as d3 from 'd3';
import { ResizeHandle } from './ResizeHandle';

export interface ChartNodeProps {
  node: NodeData;
  style?: React.CSSProperties;
  onResize?: (width: number, height: number) => void;
}

export const ChartNode: React.FC<ChartNodeProps> = ({ node, style, onResize }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const nodeRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<number[][]>(node.data.points || []);
  const [chartType, setChartType] = useState<'line' | 'bar' | 'area'>(node.data.chartType || 'line');
  const [nodeSize, setNodeSize] = useState({
    width: node.style?.width || 280,
    height: node.style?.height || 220
  });

  // Generate sample data if none provided
  useEffect(() => {
    if (!node.data.points || node.data.points.length === 0) {
      const sampleData = Array.from({ length: 10 }, (_, i) => [
        i,
        Math.sin(i * 0.5) * 50 + 100 + Math.random() * 20
      ]);
      setData(sampleData);
    }
  }, [node.data.points]);

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = (nodeSize.width - 40) || 240;
    const height = (nodeSize.height - 80) || 160;
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const xScale = d3.scaleLinear()
      .domain(d3.extent(data, d => d[0]) as [number, number])
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain(d3.extent(data, d => d[1]) as [number, number])
      .range([innerHeight, 0]);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Add axes
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(5))
      .selectAll('text')
      .style('font-size', '10px')
      .style('fill', 'currentColor');

    g.append('g')
      .call(d3.axisLeft(yScale).ticks(5))
      .selectAll('text')
      .style('font-size', '10px')
      .style('fill', 'currentColor');

    // Render based on chart type
    if (chartType === 'line') {
      const line = d3.line<number[]>()
        .x(d => xScale(d[0]))
        .y(d => yScale(d[1]))
        .curve(d3.curveMonotoneX);

      g.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', '#3b82f6')
        .attr('stroke-width', 2)
        .attr('d', line);

      // Add dots
      g.selectAll('.dot')
        .data(data)
        .enter().append('circle')
        .attr('class', 'dot')
        .attr('cx', d => xScale(d[0]))
        .attr('cy', d => yScale(d[1]))
        .attr('r', 3)
        .attr('fill', '#3b82f6');
    } else if (chartType === 'bar') {
      const barWidth = innerWidth / data.length * 0.8;
      
      g.selectAll('.bar')
        .data(data)
        .enter().append('rect')
        .attr('class', 'bar')
        .attr('x', d => xScale(d[0]) - barWidth / 2)
        .attr('y', d => yScale(d[1]))
        .attr('width', barWidth)
        .attr('height', d => innerHeight - yScale(d[1]))
        .attr('fill', '#10b981');
    } else if (chartType === 'area') {
      const area = d3.area<number[]>()
        .x(d => xScale(d[0]))
        .y0(innerHeight)
        .y1(d => yScale(d[1]))
        .curve(d3.curveMonotoneX);

      g.append('path')
        .datum(data)
        .attr('fill', '#8b5cf6')
        .attr('fill-opacity', 0.6)
        .attr('d', area);

      // Add line on top
      const line = d3.line<number[]>()
        .x(d => xScale(d[0]))
        .y(d => yScale(d[1]))
        .curve(d3.curveMonotoneX);

      g.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', '#8b5cf6')
        .attr('stroke-width', 2)
        .attr('d', line);
    }
  }, [data, chartType, nodeSize]);

  const generateNewData = () => {
    const newData = Array.from({ length: 10 }, (_, i) => [
      i,
      Math.sin(i * 0.5) * 50 + 100 + Math.random() * 20
    ]);
    setData(newData);
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
      style={{ ...style, width: nodeSize.width, height: nodeSize.height }}
      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-3 min-w-[280px] relative"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">📊</span>
          <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
            D3 Chart
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value as 'line' | 'bar' | 'area')}
            className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
          >
            <option value="line">Line</option>
            <option value="bar">Bar</option>
            <option value="area">Area</option>
          </select>
          <button
            onClick={generateNewData}
            className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
          >
            ↻
          </button>
        </div>
      </div>
      
      <div className="flex justify-center">
        <svg
          ref={svgRef}
          width={nodeSize.width - 40}
          height={nodeSize.height - 80}
          className="text-gray-600 dark:text-gray-400"
        />
      </div>
      
      <div className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
        D3.js Chart • {data.length} data points
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