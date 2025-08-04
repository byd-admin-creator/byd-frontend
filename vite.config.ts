// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',       // expose to your network
    port: 5173,
    strictPort: true,      // fail if 5173 is already in use
    allowedHosts: [
      // To allow all loca.lt tunnels:
      '.loca.lt',
      // Or to allow only your specific host:
      // 'ready-wombats-walk.loca.lt',
    ],
  },
})
