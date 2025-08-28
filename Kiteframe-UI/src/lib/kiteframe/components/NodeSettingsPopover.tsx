
import React from 'react';
import type { Node } from '../types';

export const NodeSettingsPopover: React.FC<{
  node: Node; open: boolean; onOpenChange: (o:boolean)=>void;
  onSave: (nodeId:string, patch:any)=>void;
}> = ({ node, open, onOpenChange, onSave }) => {
  if (!open) return null;
  return (
    <div className="fixed top-16 right-6 z-50 bg-white border rounded shadow p-3 w-64">
      <div className="text-sm font-semibold mb-2">Node Settings</div>
      <label className="text-xs">Label</label>
      <input className="w-full border rounded p-1 text-sm mb-2" defaultValue={node.data?.label||''} onBlur={(e)=>onSave(node.id, { label: e.target.value })} />
      <label className="text-xs">Color</label>
      <input className="w-full border rounded p-1 text-sm mb-2" defaultValue={node.data?.color||''} onBlur={(e)=>onSave(node.id, { color: e.target.value })} />
      <div className="flex justify-end gap-2">
        <button className="px-2 py-1 text-sm bg-gray-100 rounded" onClick={()=>onOpenChange(false)}>Close</button>
      </div>
    </div>
  );
};
