import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  envDir: path.resolve(__dirname, '..'), // Load .env from project root
  server: {
    port: parseInt(process.env.VITE_PORT || '5173'),
    host: true,
  },
  define: {
    'process.env.API_URL': JSON.stringify(process.env.API_URL),
  },
})
