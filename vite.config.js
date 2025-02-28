import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    open: true,
    // Log more detailed errors
    hmr: {
      overlay: true,
    },
  },
  build: {
    sourcemap: true,
    // Report more detailed bundle info
    reportCompressedSize: true,
  },
  // Configure to allow more detailed errors 
  esbuild: {
    logOverride: { 
      'this-is-undefined-in-esm': 'silent' 
    },
  },
})