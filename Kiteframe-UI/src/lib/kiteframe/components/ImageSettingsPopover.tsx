
import React from 'react';
import type { Node } from '../types';

export const ImageSettingsPopover: React.FC<{
  node: Node; open: boolean; onOpenChange:(o:boolean)=>void;
  onSave:(id:string, patch:any)=>void;
  onImageUpload?:(id:string, data:string)=>void;
  onImageUrlSet?:(id:string, url:string)=>void;
}> = ({ node, open, onOpenChange, onSave, onImageUpload, onImageUrlSet }) => {
  if (!open) return null;
  return (
    <div className="fixed top-16 right-6 z-50 bg-white border rounded shadow p-3 w-64">
      <div className="text-sm font-semibold mb-2">Image Settings</div>
      <label className="text-xs">Image URL</label>
      <input className="w-full border rounded p-1 text-sm mb-2" defaultValue={node.data?.src||''} onBlur={(e)=>{ onImageUrlSet?.(node.id, e.target.value); onSave(node.id, { src: e.target.value }); }} />
      <div className="text-xs text-gray-600 mb-2">Or upload:</div>
      <input type="file" accept="image/*" onChange={async (e)=>{
        const f = e.target.files?.[0]; if(!f) return;
        const buf = await f.arrayBuffer(); const b64 = `data:${f.type};base64,` + btoa(String.fromCharCode(...new Uint8Array(buf)));
        onImageUpload?.(node.id, b64); onSave(node.id, { src: b64 });
      }} />
      <div className="flex justify-end mt-2">
        <button className="px-2 py-1 text-sm bg-gray-100 rounded" onClick={()=>onOpenChange(false)}>Close</button>
      </div>
    </div>
  );
};
