import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@designcodeio/threeui/style.css": path.resolve(__dirname, "./src/shaders/threeui.css"),
      "@designcodeio/threeui": path.resolve(__dirname, "./src/threeui/index.ts"),
    },
  },
  build: {
    target: 'es2020',
    outDir: 'dist',
    assetsDir: 'assets',
  }
})
