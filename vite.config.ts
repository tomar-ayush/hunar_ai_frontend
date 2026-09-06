import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv, type ProxyOptions } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode`. Set third parameter to '' to load all envs
  const env = loadEnv(mode, process.cwd(), '')
  
  const targetUrl = env.VITE_API_URL

  // Proxy /api to the local Hunar voice backend so the browser
  // never talks cross-origin in dev or preview.
  const hunarApiProxy: Record<string, ProxyOptions> = {
    '/api': {
      target: targetUrl,
      changeOrigin: true,
      rewrite: path => path.replace(/^\/api/, ''),
    },
  }

  return {
    plugins: [
      tailwindcss(),
      react(),
      babel({ presets: [reactCompilerPreset()] })
    ],
    server: { proxy: hunarApiProxy },
    preview: { proxy: hunarApiProxy },
  }
})
