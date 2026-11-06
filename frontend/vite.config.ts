import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // O build final é publicado diretamente pelo Spring Boot.
  build: {
    outDir: '../src/main/resources/static',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    proxy: {
      '/auth': { target: 'http://localhost:3000', changeOrigin: true },
      '/users': { target: 'http://localhost:3000', changeOrigin: true },
      '/maquinas': { target: 'http://localhost:3000', changeOrigin: true },
      '/exercicios': { target: 'http://localhost:3000', changeOrigin: true },
      '/treinos': { target: 'http://localhost:3000', changeOrigin: true },
    },
  },
})
