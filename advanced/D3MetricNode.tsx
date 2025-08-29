import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { NodeData } from '../types';
import { ResizeHandle } from './ResizeHandle';

interface D3MetricNodeProps {
  node: NodeData & {
    data: {
      series?: number[];
      data?: Array<{ [key: string]: any }>;
      title?: string;
      chartType?: 'bar' | 'line';
      color?: string;
    };
  };
  style?: React.CSSProperties;
  onNodeResize?: (nodeId: string, width: number, height: number) => void;
}

export const D3MetricNode: React.FC<D3MetricNodeProps> = ({ node, style, onNodeResize }) => {
  const ref = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!ref.current) return;
    
    const svg = d3.select(ref.current);
    svg.selectAll('*').remove();
    
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };
    const width = (node.style?.width || 200) - margin.left - margin.right;
    const height = (node.style?.height || 150) - margin.top - margin.bottom;
    
    // Extract numeric series from either format
    let series: number[] = [];
    if (node.data.series) {
      series = node.data.series;
    } else if (node.data.data) {
      // Extract values from the data array - look for numeric values
      series = node.data.data.map(item => {
        // Find the first numeric value in the object
        const values = Object.values(item).filter(val => typeof val === 'number');
        return values[0] || 0;
      });
    } else {
      series = [10, 20, 30, 25, 40, 35, 45];
    }
    
    const chartType = node.data.chartType || 'bar';
    
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    if (chartType === 'bar') {
      // Bar chart
      const x = d3.scaleBand()
        .domain(series.map((_, i) => i.toString()))
        .range([0, width])
        .padding(0.1);
      
      const y = d3.scaleLinear()
        .domain([0, d3.max(series) || 0])
        .range([height, 0]);
      
      g.selectAll('rect')
        .data(series)
        .enter().append('rect')
        .attr('x', (_, i) => x(i.toString())!)
        .attr('y', d => y(d))
        .attr('width', x.bandwidth())
        .attr('height', d => height - y(d))
        .attr('fill', node.data.color || '#3b82f6')
        .attr('rx', 2);
    } else {
      // Line chart
      const x = d3.scaleLinear()
        .domain([0, series.length - 1])
        .range([0, width]);
      
      const y = d3.scaleLinear()
        .domain([0, d3.max(series) || 0])
        .range([height, 0]);
      
      const line = d3.line<number>()
        .x((_, i) => x(i))
        .y(d => y(d))
        .curve(d3.curveMonotoneX);
      
      g.append('path')
        .datum(series)
        .attr('fill', 'none')
        .attr('stroke', node.data.color || '#3b82f6')
        .attr('stroke-width', 2)
        .attr('d', line);
      
      // Add dots
      g.selectAll('circle')
        .data(series)
        .enter().append('circle')
        .attr('cx', (_, i) => x(i))
        .attr('cy', d => y(d))
        .attr('r', 3)
        .attr('fill', node.data.color || '#3b82f6');
    }
    
  }, [node.data.series, node.data.data, node.data.chartType, node.data.color, node.style?.width, node.style?.height]);
  
  return (
    <div 
      ref={containerRef}
      className="d3-metric-node bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg overflow-hidden relative group"
      style={{
        width: node.style?.width || 200,
        height: node.style?.height || 150,
        ...style,
      }}
    >
      <div className="p-2 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
        <div className="flex items-center gap-2">
          <div className="text-lg">📊</div>
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {node.data.title || 'Metrics'}
          </div>
        </div>
      </div>
      
      <div className="p-2">
        <svg 
          ref={ref} 
          width={node.style?.width || 200} 
          height={(node.style?.height || 150) - 40}
          className="w-full"
        />
      </div>
      
      {/* Resize handles */}
      {node.resizable !== false && (
        <div className="absolute inset-0 pointer-events-none">
          <ResizeHandle
            position="bottom-right"
            nodeRef={containerRef}
            resizable={node.resizable}
            onResize={(width, height) => {
              console.log('D3MetricNode resize event:', node.id, width, height);
              onNodeResize?.(node.id, width, height);
            }}
          />
        </div>
      )}
    </div>
  );
};