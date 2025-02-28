# Planetary System Explorer

An interactive 3D solar system visualization built with React, Three.js and WebGL. This application offers a scientifically accurate model of our solar system with realistic planets, orbits, and astronomical features. The home page displays the entire solar system with proper orbital distances, while individual pages provide detailed views of each planet with their unique characteristics.

## Features

- Interactive 3D solar system using Three.js and React Three Fiber
- Scientifically accurate planet models with custom textures and features:
  - Earth with realistic continents, clouds, and orbiting moon
  - Jupiter with animated cloud bands and the Great Red Spot
  - Saturn with detailed ring system showing gaps and particle distribution
  - Uranus with vertical ring system
- Properly spaced orbital distances following astronomical scales
- Asteroid belts (Main Belt between Mars and Jupiter, Kuiper Belt beyond Neptune)
- Orbiting astronomy facts that appear as glowing text boxes
- Advanced lighting with sun glow and day/night planet sides
- Swiss-style navigation with planetary icons
- Easter eggs: 
  - Hidden dwarf planets (Pluto, Ceres, Haumea, Makemake) that can be discovered
  - Secret menu accessible via double-click on a hidden button
- Responsive design that works on different screen sizes

## Technologies Used

- React for UI components and state management
- Vite for fast development and optimized builds
- Three.js for WebGL-based 3D rendering
- React Three Fiber for React integration with Three.js
- React Router for navigation and routing
- Custom-built canvas-based texturing for planet surfaces
- Advanced WebGL techniques for lighting and effects
- Custom physics calculations for orbital mechanics

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
- Use the navigation menu at the top with planetary icons to quickly jump to any planet
- On individual planet pages, you can rotate and zoom in/out to explore the planet model
- Look for interesting facts orbiting in the system - they periodically change!
- Find the hidden dwarf planets in the far reaches of the solar system
- For a hidden easter egg: look for a tiny dot in the top-right corner of the navigation bar and double-click it

### Easter Eggs

1. **Dwarf Planets**: There are four hidden dwarf planets in the solar system that aren't in the main menu:
   - Pluto: Located in the Kuiper Belt beyond Neptune
   - Ceres: Located in the asteroid belt between Mars and Jupiter
   - Haumea and Makemake: Located in the outer regions of the solar system
   
2. **Secret Menu**: Double-click the nearly invisible dot in the top-right corner of the navigation bar to reveal a hidden menu with direct access to the dwarf planets

## Project Structure

- `src/components/` - Reusable React components including 3D models and the fact system
- `src/pages/` - Page components for the home page and individual planet pages
- `src/data/` - Data files including planet information and astronomy facts
- `App.jsx` - Main application component with routing configuration and navigation
- `main.jsx` - Application entry point with WebGL configuration

## Customization

You can easily modify planets by editing the planets array in `src/data/planets.js`. Each planet has properties like:
- `id` - Unique identifier for routing
- `name` - Display name
- `color` - The color of the planet
- `description` - Detailed text about the planet

Add new astronomy facts in `src/data/astronomyFacts.js`.

### Performance Tuning

The application has been optimized for stable WebGL performance by:
- Limiting asteroid and particle counts
- Optimizing lighting and shadow calculations
- Reducing geometry complexity where appropriate
- Using efficient texturing techniques
- Properly managing animations and transitions

## License

MIT