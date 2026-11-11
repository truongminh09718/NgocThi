import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? '/NgocThi/' : '/',
  plugins: [react()],
  optimizeDeps: {
    entries: ['src/main.tsx'],
  },
})
