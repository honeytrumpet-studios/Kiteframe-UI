
import React from 'react';

export const LayersPanel: React.FC<{
  nodes: { id: string; label: string; color?: string }[];
  edges: { id: string; source: string; target: string; label?: string }[];
  groups: { id: string; name: string; nodes: string[] }[];
  selectedId?: string|null;
  onSelect?: (id: string)=>void;
  onToggleVisibility?: (id:string)=>void;
  onToggleLock?: (id:string)=>void;
}> = ({ nodes, edges, groups, selectedId, onSelect }) => {
  return (
    <div className="text-sm">
      <div className="font-semibold mb-2">Layers</div>
      <div className="space-y-1 max-h-80 overflow-auto">
        {groups.map(g => (
          <div key={g.id} className="border rounded">
            <div className="px-2 py-1 bg-slate-50 font-medium">{g.name}</div>
            {g.nodes.map(id => {
              const n = nodes.find(x => x.id === id);
              if (!n) return null;
              return (
                <div key={id} className={`px-2 py-1 cursor-pointer hover:bg-slate-50 ${selectedId===id?'bg-blue-50':''}`} onClick={()=>onSelect?.(id)}>
                  {n.label}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
