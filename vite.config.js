import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api/auth': {
        target: 'http://auth-service:3007',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/auth/, '/api/auth')
      },
      '/api/users': {
        target: 'http://user-service:8080',
        changeOrigin: true,
        secure: false
      },
      '/locations': {
        target: 'http://location-service:3003',
        changeOrigin: true,
        secure: false
      },
      '/directions': {
        target: 'http://route-service:3004',
        changeOrigin: true,
        secure: false
      },
      '/socket.io': {
        target: 'ws://websocket-service:3002',
        ws: true,
        changeOrigin: true,
        secure: false
      },
    }
  }
});
