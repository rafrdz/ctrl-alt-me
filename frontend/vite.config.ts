import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  envDir: path.resolve(__dirname, '..'), // Load .env from project root
  server: {
    port: parseInt(process.env.FRONTEND_PORT || '5173'),
    host: true,
    strictPort: true,
  },
  preview: {
    port: 8080,
    host: '0.0.0.0',
    strictPort: true,
  },
  define: {
    'process.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL),
  },
})
