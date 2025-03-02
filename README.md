# Planetary System Explorer

An interactive 3D solar system visualization built with React, Three.js and WebGL. This application offers a scientifically accurate model of our solar system with realistic planets, orbits, and astronomical features. The home page displays the entire solar system with proper orbital distances, while individual pages provide detailed views of each planet with their unique characteristics.

![Solar System Overview (Far View)](https://github.com/StefVuck/InteractiveSolarSystem/blob/main/preview/SolarFar.gif)

![Solar System Overview (Close View)](https://github.com/StefVuck/InteractiveSolarSystem/blob/main/preview/SolarClose.gif)

![Saturn with Detailed Ring System](https://github.com/StefVuck/InteractiveSolarSystem/blob/main/preview/Saturn.gif)

## Features

- Interactive 3D solar system using Three.js and React Three Fiber
- Scientifically accurate planet models with custom textures and features:
  - Earth with realistic continents, clouds, orbiting moon, and International Space Station
  - Jupiter with animated cloud bands, the Great Red Spot, and all four Galilean moons (Io, Europa, Ganymede, Callisto)
  - Saturn with detailed ring system showing gaps and particle distribution, and Titan moon with orange atmosphere
  - Mars with cratered surface and two irregular moons (Phobos with Stickney crater and smaller Deimos)
  - Pluto with Charon moon featuring its distinctive Mordor Macula (reddish north polar region)
  - Uranus with vertical ring system
- Properly spaced orbital distances following astronomical scales
- Asteroid belts (Main Belt between Mars and Jupiter, Kuiper Belt beyond Neptune)
- Voyager 1 and Voyager 2 spacecraft with glowing effects and information panels
- Orbiting astronomy facts that appear as glowing text boxes (with visibility toggle)
- Advanced lighting with sun glow and day/night planet sides
- Toggle buttons for orbit line visualization and astronomy facts
- Planet orbits shown with accurate relative orbital periods
- Dwarf planet orbits shown with accurate inclinations (visible only when dwarf planet menu is open)
- Swiss-style navigation with planetary icons and dropdown menus for moons
- Each moon has a detailed page with interactive 3D model and scientific information
- Easter eggs: 
  - Hidden dwarf planets (Pluto, Ceres, Haumea, Makemake) that can be discovered
  - Secret menu accessible via double-click on a hidden button
- Responsive design that works on different screen sizes
- Interactive 3D Moon page with high-resolution cratered surface

![Earth with Moon and International Space Station](https://github.com/StefVuck/InteractiveSolarSystem/blob/main/preview/Earth.gif)

![Jupiter and Mars with Their Moons](https://github.com/StefVuck/InteractiveSolarSystem/blob/main/preview/JupiterMars.gif)

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
- Use the toggle buttons in the top right to show/hide orbit lines and astronomy facts
- The orbit lines show the path each planet follows, with accurate relative orbital speeds
- Click on any planet to navigate to its detailed page
- Click on Voyager spacecraft to see information about their missions
- On Earth's page, you can see the ISS orbiting and visit the detailed Moon page
- On Jupiter's page, you can see all four Galilean moons orbiting and explore their details
- On Saturn's page, you can explore Titan with its distinctive orange atmosphere and methane lakes
- On Mars' page, you can see its two irregularly shaped moons, Phobos and Deimos
- On Pluto's page, you can see its large moon Charon, which forms a binary system with Pluto
- Use the navigation menu at the top with planetary icons to quickly jump to any planet
- Click once on planets with moons (Earth, Jupiter, Saturn, Mars, and Pluto) to open a dropdown menu of their moons
- Double-click on these planets to go directly to the planet page
- On individual planet pages, you can rotate and zoom in/out to explore the 3D models
- Look for interesting facts orbiting in the system - they periodically change! (Toggle them off if you want to focus on the planets)
- Find the hidden dwarf planets in the far reaches of the solar system
- For a hidden easter egg: look for a tiny dot in the top-right corner of the navigation bar and double-click it
- Once the dwarf planet menu is open, you'll see the inclined orbits of the dwarf planets if orbit lines are enabled

### Easter Eggs

1. **Dwarf Planets**: There are four hidden dwarf planets in the solar system that aren't in the main menu:
   - Pluto: Located in the Kuiper Belt beyond Neptune
   - Ceres: Located in the asteroid belt between Mars and Jupiter
   - Haumea and Makemake: Located in the outer regions of the solar system
   
   ![Hidden Dwarf Planet](https://github.com/StefVuck/InteractiveSolarSystem/blob/main/preview/DwarfPlanet.gif)

2. **Secret Menu**: Double-click the nearly invisible dot in the top-right corner of the navigation bar to reveal a hidden menu with direct access to the dwarf planets

3. **Spacecraft**: Find the glowing Voyager 1 and 2 spacecraft in the outer regions of the solar system

## Project Structure

```
src/
├── components/
│   ├── celestial/        # Celestial body components (planets, moons, etc.)
│   │   ├── DetailedPlanet.jsx   # Enhanced planet rendering
│   │   ├── PlanetaryMoons.jsx   # System for rendering planet's moons
│   │   ├── Moon.jsx             # Earth's moon component
│   │   └── JupiterRedSpot.jsx   # Jupiter's Great Red Spot feature
│   ├── common/           # Shared UI components
│   │   └── HorizontalText.jsx   # Text that always faces camera horizontally
│   ├── pages/            # Page-level components
│   │   ├── MoonPage.jsx         # Earth's moon detail page
│   │   └── MoonDetailPage.jsx   # Generic moon detail page for all moons
│   ├── spacecraft/       # Spacecraft and satellite components
│   │   ├── Spacecraft.jsx       # Generic spacecraft component
│   │   └── ISS.jsx              # International Space Station
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

Moons are defined with similar properties and are associated with their parent planets. Each moon has its own detailed texture, orbital characteristics, and scientific information.

Add new astronomy facts in `src/data/astronomyFacts.js`.
Add new spacecraft or satellites by following the pattern in the `Spacecraft` component.

### Performance Tuning

The application has been optimized for stable WebGL performance by:
- Implementing fast initial loading with direct component rendering
- Using effective texture caching and reuse through shared canvas
- Disabling unnecessary Three.js features like shadows during load
- Setting appropriate device pixel ratios for balance of quality and speed
- Limiting asteroid and particle counts
- Optimizing lighting and shadow calculations
- Reducing geometry complexity where appropriate
- Using efficient texturing techniques with procedural generation
- Properly managing animations and transitions
- Separating complex rendering into dedicated components
- Adding subtle glow effects that enhance visibility without impacting performance
- Implementing adaptive detail levels based on viewing distance and device capabilities
- Using continuous rendering with proper optimization for WebGL context
- Fallback loader removal to ensure smooth user experience

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