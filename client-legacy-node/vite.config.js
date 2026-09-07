import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// En dev, le proxy évite le CORS entre le client (5173) et l'API (4000) et
// garde les cookies same-origin. En prod, VITE_API_URL (voir .env.example)
// pointe directement vers l'API déployée.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': { target: 'http://localhost:4000', changeOrigin: true },
      '/uploads': { target: 'http://localhost:4000', changeOrigin: true },
    },
  },
})
