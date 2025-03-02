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

// Preload critical resources before mounting
const preloadCriticalAssets = () => {
  // Safer preloading with try-catch around each import
  const promises = [];
  
  // Only preload the main THREE module
  try {
    promises.push(import('three'));
  } catch (err) {
    console.warn('Error preloading THREE module:', err);
  }
  
  return promises.length ? Promise.all(promises) : Promise.resolve();
};

// Mount app with eager initialization
const rootElement = document.getElementById('root')

if (rootElement) {
  if (isDev) console.log('Root element found, mounting app')
  
    // Don't wait for preloading to complete - render immediately
  const root = createRoot(rootElement);
  root.render(<App />);
  
  // Continue preloading in background
  preloadCriticalAssets();
  
  // Simplified loader removal - just wait for a bit
  setTimeout(() => {
    const initialLoader = document.getElementById('initial-loader');
    if (initialLoader && initialLoader.parentNode) {
      initialLoader.style.opacity = '0';
      initialLoader.style.transition = 'opacity 0.4s ease';
      
      setTimeout(() => {
        if (initialLoader.parentNode) {
          initialLoader.parentNode.removeChild(initialLoader);
        }
      }, 400);
    }
  }, 500);
} else {
  console.error('Root element not found! Check your index.html')
}