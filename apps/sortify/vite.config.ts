import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // The visualizer uses Vite's default 5173, so both can run at once.
  server: { port: 5174 },
})
