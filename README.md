# Planetary System Explorer

An interactive 3D solar system visualization built with React, Three.js and WebGL. This application offers a scientifically accurate model of our solar system with realistic planets, orbits, and astronomical features. The home page displays the entire solar system with proper orbital distances, while individual pages provide detailed views of each planet with their unique characteristics.

## Features

- Interactive 3D solar system using Three.js and React Three Fiber
- Scientifically accurate planet models with custom textures and features:
  - Earth with realistic continents, clouds, orbiting moon, and International Space Station
  - Jupiter with animated cloud bands and the Great Red Spot
  - Saturn with detailed ring system showing gaps and particle distribution
  - Uranus with vertical ring system
- Properly spaced orbital distances following astronomical scales
- Asteroid belts (Main Belt between Mars and Jupiter, Kuiper Belt beyond Neptune)
- Voyager 1 and Voyager 2 spacecraft with glowing effects and information panels
- Orbiting astronomy facts that appear as glowing text boxes
- Advanced lighting with sun glow and day/night planet sides
- Swiss-style navigation with planetary icons
- Easter eggs: 
  - Hidden dwarf planets (Pluto, Ceres, Haumea, Makemake) that can be discovered
  - Secret menu accessible via double-click on a hidden button
- Responsive design that works on different screen sizes
- Interactive 3D Moon page with high-resolution cratered surface

## Technologies Used

- React for UI components and state management
- Vite for fast development and optimized builds
- Three.js for WebGL-based 3D rendering
- React Three Fiber for React integration with Three.js
- React Router for navigation and routing
- Custom-built canvas-based texturing for planet surfaces
- Advanced WebGL techniques for lighting and effects
- Custom physics calculations for orbital mechanics
- Procedural texture generation for planetary features

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
- Click on Voyager spacecraft to see information about their missions
- On Earth's page, you can see the ISS orbiting and visit the detailed Moon page
- Use the navigation menu at the top with planetary icons to quickly jump to any planet
- On individual planet pages, you can rotate and zoom in/out to explore the 3D models
- Look for interesting facts orbiting in the system - they periodically change!
- Find the hidden dwarf planets in the far reaches of the solar system
- For a hidden easter egg: look for a tiny dot in the top-right corner of the navigation bar and double-click it

### Easter Eggs

1. **Dwarf Planets**: There are four hidden dwarf planets in the solar system that aren't in the main menu:
   - Pluto: Located in the Kuiper Belt beyond Neptune
   - Ceres: Located in the asteroid belt between Mars and Jupiter
   - Haumea and Makemake: Located in the outer regions of the solar system
   
2. **Secret Menu**: Double-click the nearly invisible dot in the top-right corner of the navigation bar to reveal a hidden menu with direct access to the dwarf planets

3. **Spacecraft**: Find the glowing Voyager 1 and 2 spacecraft in the outer regions of the solar system

## Project Structure

```
src/
├── components/
│   ├── celestial/        # Celestial body components (planets, moons, etc.)
│   ├── common/           # Shared UI components
│   ├── pages/            # Page-level components
│   ├── spacecraft/       # Spacecraft and satellite components
│   └── OrbitingFacts.jsx # Astronomy facts display system
├── data/                 # Data sources for planets and facts
├── pages/                # Main route pages (Home, PlanetPage)
├── utils/                # Utility functions for textures and calculations
└── App.jsx               # Main application with routing
```

The modular component architecture makes the code more maintainable and easier to extend with new features.

See the `STRUCTURE.md` file for detailed information on how to add new celestial bodies or modify existing ones.

## Customization

You can easily modify planets by editing the planets array in `src/data/planets.js`. Each planet has properties like:
- `id` - Unique identifier for routing
- `name` - Display name
- `color` - The color of the planet
- `description` - Detailed text about the planet

Add new astronomy facts in `src/data/astronomyFacts.js`.
Add new spacecraft or satellites by following the pattern in the `Spacecraft` component.

### Performance Tuning

The application has been optimized for stable WebGL performance by:
- Limiting asteroid and particle counts
- Optimizing lighting and shadow calculations
- Reducing geometry complexity where appropriate
- Using efficient texturing techniques
- Properly managing animations and transitions
- Separating complex rendering into dedicated components

## License
GPLv3

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.