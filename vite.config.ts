import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, type ProxyOptions } from 'vite'

// Proxy /api to the local Hunar voice backend so the browser
// never talks cross-origin in dev or preview.
const hunarApiProxy: Record<string, ProxyOptions> = {
  '/api': {
    target: 'http://localhost:8000',
    changeOrigin: true,
    rewrite: path => path.replace(/^\/api/, ''),
  },
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  server: { proxy: hunarApiProxy },
  preview: { proxy: hunarApiProxy },
})
