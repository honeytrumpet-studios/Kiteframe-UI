
# KiteFrame Demo (Vite + React)

## Run
```bash
cd demo
npm install
npm run dev
```

Open the printed local URL. You should be able to:
- Pan by dragging background (no Shift)
- Zoom with trackpad/wheel (cursor-anchored)
- Drag nodes
- Connect nodes via handles
- Shift+Drag to multi-select
- Fit view via toolbar
- Toggle settings
- **AI Settings** → open the modal, choose provider/base URL/model, and (optionally) enter a **temporary** API key to send a test prompt.

> **Security note:** The demo supports a temporary key for development. Use a test key and do not commit it. In production, route AI calls via your backend or a secure proxy; do not ship raw keys to browsers.
