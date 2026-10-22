import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// GH_PAGES=1 → build for https://<user>.github.io/all-in-bridge/
// A Pages build without a baked-in game server (VITE_WS_URL) is a demo:
// it shows the banner explaining multiplayer needs the server.
export default defineConfig(() => {
  const gh = !!process.env.GH_PAGES
  const demo = gh && !process.env.VITE_WS_URL
  return {
    plugins: [react()],
    base: gh ? '/all-in-bridge/' : '/',
    define: demo ? { 'import.meta.env.VITE_DEMO': '"1"' } : {},
  }
})
