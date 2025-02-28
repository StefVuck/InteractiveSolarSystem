# Planetary System Explorer

A React application that uses Three.js and WebGL to render a 3D polygon model of a planetary system. Each planet corresponds to a specific page within the application, while the home page provides a zoomed-out view of the entire solar system.

## Features

- Interactive 3D solar system using Three.js and React Three Fiber
- Polygon-based planet models with custom colors and properties
- Clickable planets that navigate to detailed planet pages
- Responsive design that works on different screen sizes
- Navigation menu for quick access to each planet

## Technologies Used

- React
- Vite (for fast development and building)
- Three.js (WebGL-based 3D rendering)
- React Three Fiber (React renderer for Three.js)
- React Router (for page navigation)

## Getting Started

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```
4. Open your browser and navigate to the URL displayed in the terminal (usually http://localhost:5173)

## How to Use

- On the home page, you'll see the entire solar system with planets orbiting the sun
- Click on any planet to navigate to its detailed page
- Use the navigation menu at the top to quickly jump to any planet
- On individual planet pages, you can rotate and zoom in/out to explore the planet model

## Project Structure

- `src/components/` - Reusable React components including 3D models
- `src/pages/` - Page components for the home page and individual planet pages
- `App.jsx` - Main application component with routing configuration
- `main.jsx` - Application entry point

## Customization

You can easily modify planets by editing the planets array in `App.jsx`. Each planet has properties like:
- `id` - Unique identifier for routing
- `name` - Display name
- `color` - The color of the planet

## License

MIT