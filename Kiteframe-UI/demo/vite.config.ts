
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    fs: { allow: ['..'] }
  },
  resolve: {
    alias: {
      '@lib': resolve(__dirname, '../src/lib/kiteframe'),
      '@ai': resolve(__dirname, '../src/ai')
    }
  }
})
