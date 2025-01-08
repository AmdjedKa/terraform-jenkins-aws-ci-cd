import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api/auth': 'http://auth-service:3001',
      '/api/projects': 'http://project-service:3002',
      '/api/tasks': 'http://task-service:3003',
      '/api/users': 'http://user-service:3004',
    },
  },
})
