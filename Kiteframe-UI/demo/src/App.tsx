
import React, { useEffect, useRef, useState } from 'react';
import { KiteFrameCanvas } from '@lib/components/KiteFrameCanvas';
import type { Node, Edge } from '@lib/types';
import { getBounds } from '@lib/utils/flowUtils';
import '@lib/styles/kiteframe.css';
import { Settings } from 'lucide-react';
import { AISettingsModal } from './components/AISettingsModal';
import { AiProvider } from '@ai/AiProvider';
import { OpenAICompatClient } from '@ai/OpenAICompatClient';
import type { AiClient } from '@ai/types';
import { loadAiConfig } from './aiConfig';

function fitToView(container: HTMLDivElement, nodes: Node[]) {
  if (!nodes.length) return;
  const rect = container.getBoundingClientRect();
  const { minX, minY, maxX, maxY } = getBounds(nodes);
  const contentW = (maxX - minX) + 100;
  const contentH = (maxY - minY) + 100;
  const scaleX = rect.width / Math.max(1, contentW);
  const scaleY = rect.height / Math.max(1, contentH);
  const zoom = Math.min(scaleX, scaleY, 1);
  const centerX = minX + (maxX - minX) / 2;
  const centerY = minY + (maxY - minY) / 2;
  const x = rect.width/2 - centerX * zoom;
  const y = rect.height/2 - centerY * zoom;
  container.dispatchEvent(new CustomEvent('fit-view', { detail: { x, y, zoom } } as any));
}

export default function App(){
  const containerRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<Node[]>([
    { id: '1', position: {x:100,y:160}, data: { label: 'Input', description: 'Starting point' }, showHandles: true },
    { id: '2', position: {x:360,y:160}, data: { label: 'Transform', description: 'Do work' }, showHandles: true },
    { id: '3', position: {x:620,y:160}, data: { label: 'Output', description: 'Finish' }, showHandles: true },
  ]);
  const [edges, setEdges] = useState<Edge[]>([
    { id: 'e1', source: '1', target: '2', type: 'bezier', label: 'flow' },
    { id: 'e2', source: '2', target: '3', type: 'bezier', label: 'flow' }
  ]);
  const [selected, setSelected] = useState<string[]>([]);
  const [edgePopover, setEdgePopover] = useState<{ edge: Edge; pos:{x:number;y:number} }|null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiClient, setAiClient] = useState<AiClient | null>(null);

  useEffect(()=>{
    const id = setTimeout(()=>{
      if (containerRef.current) fitToView(containerRef.current, nodes);
    }, 50);
    return ()=>clearTimeout(id);
  }, []);

  useEffect(()=>{
    const { cfg, key } = loadAiConfig();
    if (cfg) {
      setAiClient(new OpenAICompatClient({ baseURL: cfg.baseURL, apiKey: key || undefined }));
    }
  }, []);

  const addNode = () => {
    const id = `n${Date.now()}`;
    setNodes(ns => [...ns, { id, position: { x: 120 + ns.length*220, y: 160 }, data: { label: `Node ${ns.length+1}` }, showHandles: true }]);
  };
  const clearAll = () => { setNodes([]); setEdges([]); };
  const onConnect = (c: { source:string; target:string }) => {
    setEdges(es => [...es, { id: `e${Date.now()}`, source: c.source, target: c.target, type: 'bezier' }]);
  };

  const appUI = (
    <div className="app">
      <div className="toolbar">
        <button onClick={addNode}>+ Node</button>
        <button onClick={()=>containerRef.current && fitToView(containerRef.current, nodes)}>Fit</button>
        <button onClick={clearAll}>Clear</button>
        <span style={{flex:1}} />
        <button onClick={()=>setAiOpen(true)}>AI Settings</button>
        <button onClick={()=>setSettingsOpen(s=>!s)} style={{ display:'flex', alignItems:'center', gap:6 }}><Settings size={16}/> Settings</button>
      </div>
      <div ref={containerRef} className="canvas-wrap">
        <KiteFrameCanvas
          className="w-full h-full"
          nodes={nodes}
          edges={edges}
          onNodesChange={setNodes}
          onEdgesChange={setEdges}
          onConnect={onConnect}
          gridType="lines"
          minZoom={0.1}
          maxZoom={3}
          showMiniMap
          selectedNodes={selected}
          onNodeClick={(e,n)=>{ setSelected([n.id]); }}
          onCanvasClick={()=>setSelected([])}
          onEdgeClick={(e, edge)=> setEdgePopover({ edge, pos: { x: e.clientX, y: e.clientY } })}
        />
      </div>

      {edgePopover && (
        <div style={{ position:'fixed', left: edgePopover.pos.x, top: edgePopover.pos.y, background:'#fff', border:'1px solid #e2e8f0', borderRadius:6, padding:8 }}>
          <div style={{ fontSize:12, fontWeight:600, marginBottom:6 }}>Edge</div>
          <div style={{ fontSize:12, marginBottom:6 }}>{edgePopover.edge.source} → {edgePopover.edge.target}</div>
          <button onClick={()=>setEdgePopover(null)}>Close</button>
        </div>
      )}

      {settingsOpen && (
        <div style={{ position:'fixed', right:16, top:56, background:'#fff', border:'1px solid #e2e8f0', borderRadius:8, padding:12, width:320 }}>
          <div style={{ fontSize:14, fontWeight:700, marginBottom:8 }}>Demo Settings</div>
          <p style={{ fontSize:12, color:'#475569' }}>This demo uses the local library source. In your app, wrap with <code>AiProvider</code> and route to your backend.</p>
        </div>
      )}

      <AISettingsModal
        open={aiOpen}
        onClose={()=>setAiOpen(false)}
        onConfigured={(cfg, key)=>{
          setAiClient(new OpenAICompatClient({ baseURL: cfg.baseURL, apiKey: key || undefined }));
        }}
      />
    </div>
  );

  return aiClient ? <AiProvider client={aiClient}>{appUI}</AiProvider> : appUI;
}
