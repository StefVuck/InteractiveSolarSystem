import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { splitVendorChunkPlugin } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    splitVendorChunkPlugin() // Split chunks for better loading performance
  ],
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
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'three-vendor': ['three', '@react-three/fiber', '@react-three/drei'],
        }
      }
    }
  },
  // Configure to allow more detailed errors 
  esbuild: {
    logOverride: { 
      'this-is-undefined-in-esm': 'silent' 
    },
    legalComments: 'none', // Remove legal comments to reduce size
  },
  // Optimize deps for faster startup
  optimizeDeps: {
    include: ['react', 'react-dom', 'three', '@react-three/fiber', '@react-three/drei']
  }
})