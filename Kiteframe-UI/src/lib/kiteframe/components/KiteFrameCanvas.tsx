
import React, { useEffect, useRef, useState } from 'react';
import '../styles/kiteframe.css';
import type { Node, Edge } from '../types';
import { clientToWorld, zoomAroundPoint } from '../utils/geometry';
import { getBounds } from '../utils/flowUtils';
import { NodeHandles } from './NodeHandles';
import { ConnectionEdge } from './ConnectionEdge';

type Props = {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: (n: Node[]) => void;
  onEdgesChange: (e: Edge[]) => void;
  onConnect: (c: { source: string; target: string }) => void;
  gridType?: 'dots'|'lines'|'none';
  minZoom?: number;
  maxZoom?: number;
  fitView?: boolean;
  showMiniMap?: boolean;
  selectedNodes?: string[];
  onNodeClick?: (e: React.MouseEvent, node: Node) => void;
  onCanvasClick?: () => void;
  onNodeDoubleClick?: (e: React.MouseEvent, node: Node) => void;
  onNodeRightClick?: (e: React.MouseEvent, node: Node) => void;
  onEdgeClick?: (e: React.MouseEvent, edge: Edge) => void;
  onNodeResize?: (id: string, w: number, h: number) => void;
  smartConnect?: boolean;
  snapToGuides?: boolean;
  snapToGrid?: boolean;
  className?: string;
  onImageUpload?: (id:string, data:string)=>void;
  onImageUrlSet?: (id:string, url:string)=>void;
  disablePan?: boolean;
};

type Viewport = { x: number; y: number; zoom: number };

export const KiteFrameCanvas: React.FC<Props> = (props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState<Viewport>({ x: 0, y: 0, zoom: 1 });
  const [panning, setPanning] = useState(false);
  const panStart = useRef<{x:number;y:number}|null>(null);
  const [selectRect, setSelectRect] = useState<null | {x:number;y:number;w:number;h:number}>(null);
  const selectStart = useRef<{x:number;y:number}|null>(null);
  const [connecting, setConnecting] = useState<null | { sourceId:string; sourcePos:'top'|'bottom'|'left'|'right'; wx:number; wy:number }>(null);

  const minZoom = props.minZoom ?? 0.1;
  const maxZoom = props.maxZoom ?? 3;

  // External fit-view
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (ev: Event) => {
      const { x, y, zoom } = (ev as CustomEvent<any>).detail || {};
      if (typeof x === 'number' && typeof y === 'number' && typeof zoom === 'number') {
        setViewport({ x, y, zoom });
      }
    };
    el.addEventListener('fit-view', handler as any);
    return () => el.removeEventListener('fit-view', handler as any);
  }, []);

  // wheel zoom
  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const rect = containerRef.current!.getBoundingClientRect();
    const old = viewport;
    const newZoom = zoomAroundPoint(old.zoom, e.deltaY * 0.001, minZoom, maxZoom);
    const mouseWorld = clientToWorld(e.clientX, e.clientY, old, rect);
    const newX = e.clientX - rect.left - mouseWorld.x * newZoom;
    const newY = e.clientY - rect.top - mouseWorld.y * newZoom;
    setViewport({ x: newX, y: newY, zoom: newZoom });
  };

  // background interactions
  const onBackgroundDown = (e: React.MouseEvent) => {
    const isShift = e.shiftKey;
    if (!isShift && !props.disablePan) {
      setPanning(true);
      panStart.current = { x: e.clientX - viewport.x, y: e.clientY - viewport.y };
    } else if (isShift) {
      selectStart.current = { x: e.clientX, y: e.clientY };
      setSelectRect({ x: e.clientX, y: e.clientY, w: 0, h: 0 });
    }
  };
  const onBackgroundMove = (e: React.MouseEvent) => {
    if (panning && panStart.current) {
      setViewport(v => ({ ...v, x: e.clientX - panStart.current!.x, y: e.clientY - panStart.current!.y }));
    } else if (selectStart.current) {
      const sx = selectStart.current.x, sy = selectStart.current.y;
      setSelectRect({ x: Math.min(sx, e.clientX), y: Math.min(sy, e.clientY), w: Math.abs(e.clientX - sx), h: Math.abs(e.clientY - sy) });
    } else if (connecting) {
      const rect = containerRef.current!.getBoundingClientRect();
      const wpos = clientToWorld(e.clientX, e.clientY, viewport, rect);
      setConnecting(c => c ? { ...c, wx: wpos.x, wy: wpos.y } : null);
    }
  };
  const onBackgroundUp = (e: React.MouseEvent) => {
    if (panning) {
      setPanning(false); panStart.current = null;
    }
    if (selectStart.current) {
      const rect = containerRef.current!.getBoundingClientRect();
      const r = selectRect!;
      const x1 = (r.x - rect.left - viewport.x) / viewport.zoom;
      const y1 = (r.y - rect.top - viewport.y) / viewport.zoom;
      const x2 = ((r.x + r.w) - rect.left - viewport.x) / viewport.zoom;
      const y2 = ((r.y + r.h) - rect.top - viewport.y) / viewport.zoom;
      const nx1 = Math.min(x1,x2), ny1=Math.min(y1,y2), nx2=Math.max(x1,x2), ny2=Math.max(y1,y2);
      const updated = props.nodes.map(n => {
        const w = n.style?.width ?? n.width ?? 200;
        const h = n.style?.height ?? n.height ?? 100;
        const inside = n.position.x >= nx1 && n.position.y >= ny1 && (n.position.x + w) <= nx2 && (n.position.y + h) <= ny2;
        return { ...n, selected: inside };
      });
      props.onNodesChange(updated);
      setSelectRect(null); selectStart.current = null;
    }
    if (connecting) {
      const srcId = connecting.sourceId;
      const rect = containerRef.current!.getBoundingClientRect();
      const world = clientToWorld(e.clientX, e.clientY, viewport, rect);
      const threshold = 16;
      let best: { id:string; dist:number } | null = null;
      for (const n of props.nodes) {
        if (n.id === srcId) continue;
        const w = n.style?.width ?? n.width ?? 200;
        const h = n.style?.height ?? n.height ?? 100;
        const handles = [
          { x: n.position.x + w/2, y: n.position.y },
          { x: n.position.x + w/2, y: n.position.y + h },
          { x: n.position.x,       y: n.position.y + h/2 },
          { x: n.position.x + w,   y: n.position.y + h/2 },
        ];
        for (const pt of handles) {
          const d = Math.hypot(pt.x - world.x, pt.y - world.y);
          if (d < threshold && (!best || d < best.dist)) best = { id: n.id, dist: d };
        }
      }
      if (best) props.onConnect({ source: srcId, target: best.id });
      setConnecting(null);
    }
  };

  // node drag
  const dragInfo = useRef<{ id:string; start:{x:number;y:number}; origin:{x:number;y:number} }|null>(null);
  const onNodeMouseDown = (e: React.MouseEvent, node: Node) => {
    e.stopPropagation();
    const rect = containerRef.current!.getBoundingClientRect();
    const wp = clientToWorld(e.clientX, e.clientY, viewport, rect);
    dragInfo.current = { id: node.id, start: wp, origin: { ...node.position } };
  };
  const onMouseMoveWindow = (e: MouseEvent) => {
    if (!dragInfo.current) return;
    const rect = containerRef.current!.getBoundingClientRect();
    const wp = clientToWorld(e.clientX, e.clientY, viewport, rect);
    const dx = wp.x - dragInfo.current.start.x;
    const dy = wp.y - dragInfo.current.start.y;
    const id = dragInfo.current.id;
    const updated = props.nodes.map(n => n.id === id ? { ...n, position: { x: dragInfo.current!.origin.x + dx, y: dragInfo.current!.origin.y + dy } } : n);
    props.onNodesChange(updated);
  };
  const onMouseUpWindow = () => { dragInfo.current = null; };
  useEffect(() => {
    window.addEventListener('mousemove', onMouseMoveWindow);
    window.addEventListener('mouseup', onMouseUpWindow);
    return () => {
      window.removeEventListener('mousemove', onMouseMoveWindow);
      window.removeEventListener('mouseup', onMouseUpWindow);
    };
  }, [viewport, props.nodes]);

  // Grid
  const Grid = () => {
    if (props.gridType === 'none') return null;
    return (
      <svg className="kiteframe-grid">
        {props.gridType === 'lines' && (
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="1"/>
          </pattern>
        )}
        <rect width="100%" height="100%" fill={props.gridType==='lines' ? 'url(#grid)' : 'none'} />
      </svg>
    );
  };

  // MiniMap
  const MiniMap = () => {
    if (!props.showMiniMap) return null;
    const bounds = getBounds(props.nodes);
    const w = 160, h = 100;
    const scaleX = w / Math.max(1, bounds.maxX - bounds.minX + 200);
    const scaleY = h / Math.max(1, bounds.maxY - bounds.minY + 200);
    const s = Math.min(scaleX, scaleY);
    return (
      <div className="kiteframe-minimap">
        <svg width={w} height={h}>
          {props.nodes.map(n => {
            const nx = (n.position.x - bounds.minX + 100) * s;
            const ny = (n.position.y - bounds.minY + 100) * s;
            const nw = (n.style?.width ?? n.width ?? 200) * s;
            const nh = (n.style?.height ?? n.height ?? 100) * s;
            return <rect key={n.id} x={nx} y={ny} width={nw} height={nh} fill="#94a3b8" opacity="0.6" rx="2" />;
          })}
        </svg>
      </div>
    );
  };

  const worldStyle = { transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})` };

  return (
    <div
      ref={containerRef}
      className={`kiteframe-canvas ${props.className||''} ${panning ? 'kiteframe-hand': ''}`}
      onWheel={onWheel}
      onMouseDown={onBackgroundDown}
      onMouseMove={onBackgroundMove}
      onMouseUp={onBackgroundUp}
      onClick={() => props.onCanvasClick?.()}
    >
      <Grid />
      <div className="kiteframe-world" style={worldStyle}>
        {/* Edges */}
        <svg className="kiteframe-edge-layer" style={{ width: '100%', height: '100%' }}>
          {props.edges.map(e => {
            const s = props.nodes.find(n => n.id === e.source);
            const t = props.nodes.find(n => n.id === e.target);
            if (!s || !t) return null;
            return <ConnectionEdge key={e.id} edge={e} sourceNode={s} targetNode={t} onClick={props.onEdgeClick} />;
          })}
        </svg>

        {/* Nodes */}
        {props.nodes.filter(n=>!n.hidden).map(n => {
          const w = n.style?.width ?? n.width ?? 200;
          const h = n.style?.height ?? n.height ?? 100;
          const color = n.data?.color || 'white';
          const border = n.data?.borderColor || '#e2e8f0';
          const txt = n.data?.textColor || '#0f172a';
          return (
            <div
              key={n.id}
              className={`kiteframe-node group ${n.selected?'selected':''}`}
              style={{ left: n.position.x, top: n.position.y, width: w, height: h, background: color, borderColor: border, color: txt }}
              onMouseDown={(e)=>{
                e.stopPropagation();
                const rect = containerRef.current!.getBoundingClientRect();
                const wp = clientToWorld(e.clientX, e.clientY, viewport, rect);
                (window as any).__kf_drag = { id: n.id, start: wp, origin: { ...n.position } };
              }}
              onDoubleClick={(e)=>props.onNodeDoubleClick?.(e, n)}
              onContextMenu={(e)=>{ e.preventDefault(); props.onNodeRightClick?.(e, n); }}
              onClick={(e)=>props.onNodeClick?.(e, n)}
            >
              <div className="title">{n.data?.label || n.type || n.id}</div>
              <div className="body">
                {n.type === 'image' && n.data?.src ? <img src={n.data.src} alt="" style={{ maxWidth: '100%', maxHeight: '100%' }} />: (n.data?.description || 'Drop content here…')}
              </div>
              {n.showHandles !== false && <NodeHandles node={n} onHandleConnect={(p, e)=>{
                const rect = containerRef.current!.getBoundingClientRect();
                const wp = clientToWorld(e.clientX, e.clientY, viewport, rect);
                setConnecting({ sourceId: n.id, sourcePos: p, wx: wp.x, wy: wp.y });
              }} />}
            </div>
          );
        })}
      </div>

      {selectRect && (
        <div className="kiteframe-select-rect" style={{ left: selectRect.x, top: selectRect.y, width: selectRect.w, height: selectRect.h }} />
      )}

      <MiniMap />
    </div>
  );
};
