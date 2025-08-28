
import React, { useState } from 'react';
export const ModelPicker: React.FC<{ initial?: { provider: string; baseURL?: string; model?: string }; onSave: (cfg:any)=>void }> = ({ initial, onSave }) => {
  const [provider, setProvider] = useState(initial?.provider || 'openai-compat');
  const [baseURL, setBaseURL] = useState(initial?.baseURL || 'https://api.openai.com');
  const [model, setModel] = useState(initial?.model || 'gpt-4o-mini');
  return (
    <div className="space-y-2">
      <div>
        <div className="text-sm font-medium">Provider</div>
        <select className="border p-2 rounded w-full" value={provider} onChange={e=>setProvider(e.target.value)}>
          <option value="openai-compat">OpenAI-compatible</option>
          <option value="custom">Custom Internal</option>
        </select>
      </div>
      <div>
        <div className="text-sm font-medium">Base URL</div>
        <input className="border p-2 rounded w-full" value={baseURL} onChange={e=>setBaseURL(e.target.value)} />
      </div>
      <div>
        <div className="text-sm font-medium">Model</div>
        <input className="border p-2 rounded w-full" value={model} onChange={e=>setModel(e.target.value)} />
      </div>
      <button className="px-3 py-2 bg-blue-600 text-white rounded" onClick={()=>onSave({ provider, baseURL, model })}>Save</button>
    </div>
  );
};
