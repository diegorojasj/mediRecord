import path from 'path'
import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: process.env.API_GATEWAY_URL ?? 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  plugins: [
    tanstackRouter({
      autoCodeSplitting: true,
      routesDirectory: './src/pages',
      routeFileIgnorePrefix: '-',
      routeFileIgnorePattern: '^(?!__root\\.tsx$)(?!.*\\.route\\.tsx$)(?!.*\\.lazy\\.tsx$).*\\.(tsx|ts|js|jsx)$',
    }),
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
