
import React, { useEffect, useState } from 'react';
import { ModelPicker } from '../../../src/components/ModelPicker';
import { saveAiConfig, loadAiConfig, type DemoAiConfig } from '../aiConfig';
import { OpenAICompatClient } from '@ai/OpenAICompatClient';

export const AISettingsModal: React.FC<{
  open: boolean;
  onClose: () => void;
  onConfigured?: (cfg: DemoAiConfig, key: string | null) => void;
}> = ({ open, onClose, onConfigured }) => {
  const { cfg: loadedCfg, key: loadedKey } = loadAiConfig();
  const [cfg, setCfg] = useState<DemoAiConfig>(loadedCfg || { provider: 'openai-compat', baseURL: 'https://api.openai.com', model: 'gpt-4o-mini', rememberKey: false });
  const [apiKey, setApiKey] = useState<string>(loadedKey || '');
  const [testPrompt, setTestPrompt] = useState('Say hello from KiteFrame.');
  const [testOut, setTestOut] = useState<string>('');
  const [testing, setTesting] = useState(false);

  useEffect(()=>{
    if (!open) { setTestOut(''); setTesting(false); }
  }, [open]);

  if (!open) return null;

  const save = () => {
    saveAiConfig(cfg, cfg.rememberKey ? apiKey : null);
    onConfigured?.(cfg, cfg.rememberKey ? apiKey : null);
    onClose();
  };

  const runTest = async () => {
    if (!cfg.baseURL) { alert('Base URL required'); return; }
    setTesting(true); setTestOut('');
    try {
      const client = new OpenAICompatClient({ baseURL: cfg.baseURL, apiKey: apiKey || undefined });
      const res = await client.chat({ model: cfg.model, messages: [{ role: 'user', content: testPrompt }] });
      setTestOut(res.text || '(no content)');
    } catch (e:any) {
      setTestOut('Error: ' + (e?.message || String(e)));
    } finally {
      setTesting(false);
    }
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.35)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50 }} onClick={onClose}>
      <div style={{ width: 520, maxWidth:'95vw', background:'#fff', border:'1px solid #e2e8f0', borderRadius:10, boxShadow:'0 10px 30px rgba(0,0,0,.15)' }} onClick={e=>e.stopPropagation()}>
        <div style={{ padding:12, borderBottom:'1px solid #e2e8f0', fontSize:14, fontWeight:700 }}>AI Settings (Demo)</div>
        <div style={{ padding:12 }}>
          <div style={{ marginBottom:12, fontSize:12, color:'#475569' }}>
            <b>Warning:</b> This demo allows a <i>temporary</i> API key for testing. Do not commit keys to source control.
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:12 }}>
            <ModelPicker
              initial={{ provider: cfg.provider, baseURL: cfg.baseURL, model: cfg.model }}
              onSave={(v)=> setCfg(c => ({ ...c, provider: v.provider, baseURL: v.baseURL, model: v.model }))}
            />
            <div>
              <div style={{ fontSize:12, fontWeight:600, marginBottom:4 }}>Temporary API Key</div>
              <input type="password" value={apiKey} onChange={e=>setApiKey(e.target.value)} placeholder="sk-..." style={{ width:'100%', border:'1px solid #e2e8f0', borderRadius:6, padding:'8px' }} />
              <label style={{ display:'flex', alignItems:'center', gap:8, marginTop:6, fontSize:12 }}>
                <input type="checkbox" checked={!!cfg.rememberKey} onChange={e=>setCfg(c=>({ ...c, rememberKey: e.target.checked }))} />
                Remember key in this browser (localStorage)
              </label>
            </div>
            <div style={{ borderTop:'1px solid #e2e8f0', paddingTop:12 }}>
              <div style={{ fontSize:12, fontWeight:600, marginBottom:6 }}>Quick Test</div>
              <textarea rows={3} value={testPrompt} onChange={e=>setTestPrompt(e.target.value)} style={{ width:'100%', border:'1px solid #e2e8f0', borderRadius:6, padding:'8px', resize:'vertical' }} />
              <div style={{ display:'flex', gap:8, marginTop:8 }}>
                <button onClick={runTest} disabled={testing} style={{ border:'1px solid #e2e8f0', borderRadius:6, padding:'6px 10px', background:'#3b82f6', color:'#fff' }}>{testing ? 'Testing…' : 'Send test'}</button>
                <button onClick={()=>setTestOut('')} style={{ border:'1px solid #e2e8f0', borderRadius:6, padding:'6px 10px', background:'#fff' }}>Clear</button>
              </div>
              <div style={{ fontSize:12, color:'#0f172a', whiteSpace:'pre-wrap', marginTop:8, minHeight:48, background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:6, padding:8 }}>
                {testOut || 'Response will appear here.'}
              </div>
            </div>
          </div>
        </div>
        <div style={{ padding:12, borderTop:'1px solid #e2e8f0', display:'flex', justifyContent:'flex-end', gap:8 }}>
          <button onClick={onClose} style={{ border:'1px solid #e2e8f0', borderRadius:6, padding:'6px 10px', background:'#fff' }}>Cancel</button>
          <button onClick={save} style={{ border:'1px solid #e2e8f0', borderRadius:6, padding:'6px 10px', background:'#10b981', color:'#fff' }}>Save</button>
        </div>
      </div>
    </div>
  );
};
