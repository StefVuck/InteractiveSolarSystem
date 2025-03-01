import { createRoot } from 'react-dom/client'
import App from './App.jsx'

// Now imported in index.html directly
// import './index.css'

// Optimization: Reduce initial console output
const isDev = import.meta.env.DEV
if (isDev) console.log('Main.jsx is running')

// Configure error handling for WebGL context loss
window.addEventListener('webglcontextlost', function(event) {
  console.log('WebGL context lost. Please refresh the page.');
  event.preventDefault();
}, false);

// Performance optimization: Preload textures and setup
// Create single offscreen canvas for efficiency
const offscreenCanvas = document.createElement('canvas');
offscreenCanvas.width = 512;
offscreenCanvas.height = 512;
window.sharedOffscreenCanvas = offscreenCanvas;

// Mount app
const rootElement = document.getElementById('root')

if (rootElement) {
  if (isDev) console.log('Root element found, mounting app')
  
  // Removed StrictMode which can cause components to render twice
  createRoot(rootElement).render(<App />)
  
  // Clean up initial loader after React hydrates
  setTimeout(() => {
    const initialLoader = document.getElementById('initial-loader')
    if (initialLoader) initialLoader.remove()
  }, 1500)
} else {
  console.error('Root element not found! Check your index.html')
}