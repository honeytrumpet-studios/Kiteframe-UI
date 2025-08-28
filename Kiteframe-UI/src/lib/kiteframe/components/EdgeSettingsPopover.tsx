
import React from 'react';
import type { Edge } from '../types';

export const EdgeSettingsPopover: React.FC<{
  edge: Edge;
  position: { x:number; y:number };
  onClose: ()=>void;
  onSave: (patch:any)=>void;
}> = ({ edge, position, onClose, onSave }) => {
  return (
    <div className="fixed z-50 bg-white border rounded shadow p-3 w-56"
         style={{ left: position.x, top: position.y }}>
      <div className="text-sm font-semibold mb-2">Edge Settings</div>
      <label className="text-xs">Type</label>
      <select className="w-full border rounded p-1 text-sm mb-2" defaultValue={edge.type ?? 'bezier'} onChange={(e)=>onSave({ type: e.target.value })}>
        <option value="straight">Straight</option>
        <option value="step">Step</option>
        <option value="bezier">Bezier</option>
      </select>
      <label className="text-xs">Label</label>
      <input className="w-full border rounded p-1 text-sm mb-2" defaultValue={edge.label || ''} onBlur={(e)=>onSave({ label: e.target.value })} />
      <div className="flex justify-end">
        <button className="px-2 py-1 text-sm bg-gray-100 rounded" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};
