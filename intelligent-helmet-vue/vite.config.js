import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    hmr: {
      overlay: false
    },
    proxy: {
      '/ws': {
        target: 'http://localhost:8082',
        changeOrigin: true,
        ws: true
      },
      '/qweather': {
        target: 'https://mf2vhfh2af.re.qweatherapi.com',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/qweather/, ''),
        secure: true
      },
      '/gaodemap': {
        target: 'https://restapi.amap.com',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/gaodemap/, ''),
        secure: true
      },
      '/api': {
        target: 'http://localhost:8082',
        changeOrigin: true
      }
    }
  }
})