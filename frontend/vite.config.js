import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1000,
    cssCodeSplit: true,
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:4040',
        changeOrigin: true,
      }
    }
  }
})
