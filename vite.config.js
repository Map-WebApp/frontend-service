import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api/auth': 'http://localhost:3001',
      '/api/users': 'http://localhost:8080',
      '/locations': 'http://localhost:3003',
      '/directions': 'http://localhost:3004',
      '/socket.io': {
        target: 'ws://localhost:3002',
        ws: true,
      },
    }
  }
});
