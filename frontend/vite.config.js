import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api/auth': 'http://localhost:3001' || 'http://auth-service:3001',
      '/api/projects': 'http://localhost:3002' || 'http://project-service:3002',
      '/api/tasks': 'http://localhost:3003' || 'http://task-service:3003',
    },
  },
})
