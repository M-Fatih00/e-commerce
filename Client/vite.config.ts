import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
//   server: {
//     port: 5175,
//     strictPort: true,
//   }
// })


export default defineConfig({
  plugins: [react()],
  server: {
    port: 5175,
    strictPort: true,
  },
  preview: {
    port: 5175,
    proxy: {
      '/api': {
        target: 'http://localhost:5115',
        changeOrigin: true,
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          antd: ['antd'],
          redux: ['@reduxjs/toolkit', 'react-redux'],
          charts: ['apexcharts', 'react-apexcharts'],
        }
      }
    }
  }
})