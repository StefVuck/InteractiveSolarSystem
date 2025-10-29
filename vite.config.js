import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    open: true,
    hmr: {
      overlay: true,
    },
  },
  preview: {
    allowedHosts: ['solar.stefvuck.dev'],
  },
  build: {
    sourcemap: true,
    reportCompressedSize: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules/react') || 
              id.includes('node_modules/react-dom') || 
              id.includes('node_modules/react-router-dom')) {
            return 'react-vendor';
          }
          if (id.includes('node_modules/three') || 
              id.includes('node_modules/@react-three/fiber') || 
              id.includes('node_modules/@react-three/drei')) {
            return 'three-vendor';
          }
        }
      }
    }
  },
  esbuild: {
    logOverride: { 
      'this-is-undefined-in-esm': 'silent' 
    },
    legalComments: 'none',
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'three', '@react-three/fiber', '@react-three/drei']
  }
})
