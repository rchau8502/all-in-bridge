import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// GH_PAGES=1 → build for https://<user>.github.io/all-in-bridge/
export default defineConfig({
  plugins: [react()],
  base: process.env.GH_PAGES ? '/all-in-bridge/' : '/',
})
