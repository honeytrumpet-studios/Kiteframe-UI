
export type DemoAiConfig = {
  provider: 'openai-compat' | 'custom';
  baseURL: string;
  model: string;
  rememberKey?: boolean;
};

const CFG_KEY = 'kf_demo_ai';
const KEY_KEY = 'kf_demo_ai_key';

export function loadAiConfig(): { cfg: DemoAiConfig | null; key: string | null } {
  try {
    const raw = localStorage.getItem(CFG_KEY);
    const cfg = raw ? JSON.parse(raw) as DemoAiConfig : null;
    const key = cfg?.rememberKey ? localStorage.getItem(KEY_KEY) : null;
    return { cfg, key };
  } catch {
    return { cfg: null, key: null };
  }
}

export function saveAiConfig(cfg: DemoAiConfig, key?: string | null) {
  localStorage.setItem(CFG_KEY, JSON.stringify(cfg));
  if (cfg.rememberKey && key) {
    localStorage.setItem(KEY_KEY, key);
  } else {
    localStorage.removeItem(KEY_KEY);
  }
}
