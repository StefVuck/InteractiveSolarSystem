import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// For debugging
console.log('Main.jsx is running')

// Configure error handling for WebGL context loss
window.addEventListener('webglcontextlost', function(event) {
  console.log('WebGL context lost. Please refresh the page.');
  event.preventDefault();
}, false);

const rootElement = document.getElementById('root')

if (rootElement) {
  console.log('Root element found, mounting app')
  // Removed StrictMode which can cause components to render twice
  createRoot(rootElement).render(<App />)
} else {
  console.error('Root element not found! Check your index.html')
}