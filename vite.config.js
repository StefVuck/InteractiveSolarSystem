import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// Removed the splitVendorChunkPlugin since we're using manualChunks as a function

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react()
    // Removed the splitVendorChunkPlugin since it's not compatible with manualChunks
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
        // Use function form for manualChunks instead of object form
        manualChunks: (id) => {
          // React and related libraries
          if (id.includes('node_modules/react') || 
              id.includes('node_modules/react-dom') || 
              id.includes('node_modules/react-router-dom')) {
            return 'react-vendor';
          }
          
          // Three.js and related libraries
          if (id.includes('node_modules/three') || 
              id.includes('node_modules/@react-three/fiber') || 
              id.includes('node_modules/@react-three/drei')) {
            return 'three-vendor';
          }
          
          // Other dependencies will be auto-chunked by Vite
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