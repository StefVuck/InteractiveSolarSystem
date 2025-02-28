import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import planets, { dwarfPlanets } from './data/planets';
import './App.css';

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home'));
const PlanetPage = lazy(() => import('./pages/PlanetPage'));
const MoonDetailPage = lazy(() => import('./components/pages/MoonDetailPage'));

/**
 * Main application component with routing and navigation
 */
function App() {
  // State for the dwarf planet menu and moons dropdown
  const [dwarfMenuOpen, setDwarfMenuOpen] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);
  const [moonsDropdownFor, setMoonsDropdownFor] = useState(null);
  
  // Data for which planets have moons and what those moons are
  const planetMoons = {
    'earth': [{ id: 'moon', name: 'The Moon' }],
    'jupiter': [
      { id: 'io', name: 'Io' },
      { id: 'europa', name: 'Europa' },
      { id: 'ganymede', name: 'Ganymede' },
      { id: 'callisto', name: 'Callisto' }
    ]
  };
  
  // Handle clicks on the hidden dwarf planet button
  const handleDwarfButtonClick = () => {
    const now = Date.now();
    
    // Check for double click (two clicks within 300ms)
    if (now - lastClickTime < 300) {
      setDwarfMenuOpen(!dwarfMenuOpen);
      setClickCount(0);
      // Close any open moons dropdown
      setMoonsDropdownFor(null);
    } else {
      setClickCount(clickCount + 1);
    }
    
    setLastClickTime(now);
  };
  
  // Track click timing for detecting double clicks
  const [planetClickData, setPlanetClickData] = useState({ 
    planetId: null, 
    lastClickTime: 0 
  });
  
  // Handle click on a planet in the navigation
  const handlePlanetClick = (e, planetId) => {
    e.preventDefault();
    const now = Date.now();
    const isDoubleClick = planetClickData.planetId === planetId && 
                          now - planetClickData.lastClickTime < 300;
    
    // Update the click tracking data
    setPlanetClickData({ 
      planetId: planetId, 
      lastClickTime: now 
    });
    
    // If this planet has moons
    if (planetMoons[planetId]) {
      if (isDoubleClick) {
        // Double click - navigate to the planet
        navigate(`/planet/${planetId}`);
        // Close any open dropdowns
        setMoonsDropdownFor(null);
      } else {
        // Single click - toggle dropdown
        setMoonsDropdownFor(moonsDropdownFor === planetId ? null : planetId);
        // Close dwarf planets menu if open
        if (dwarfMenuOpen) setDwarfMenuOpen(false);
      }
    } else {
      // For planets without moons, navigate directly
      navigate(`/planet/${planetId}`);
    }
  };
  
  // For use with useNavigate hook
  const navigate = (path) => {
    window.location.href = path;
  };
  
  return (
    <Router>
      <div className="app">
        <nav>
          <ul>
            <li>
              <Link to="/">
                <span className="solar-system-icon"></span>
                Solar System
              </Link>
            </li>
            {planets.map(planet => (
              <li key={planet.id} className={planetMoons[planet.id] ? 'has-moons' : ''}>
                <a 
                  href={`/planet/${planet.id}`}
                  onClick={(e) => handlePlanetClick(e, planet.id)}
                  className={moonsDropdownFor === planet.id ? 'active' : ''}
                >
                  <span 
                    className="planet-icon" 
                    style={{ 
                      backgroundColor: planet.color,
                      boxShadow: planet.id === 'saturn' ? `0 0 8px ${planet.color}` : 'none'
                    }}
                  ></span>
                  {planet.name}
                  {planetMoons[planet.id] && (
                    <span className="dropdown-indicator">▾</span>
                  )}
                </a>
                
              </li>
            ))}
          </ul>
          
          {/* Other Projects button */}
          <a 
            href="https://github.com/StefVuck" 
            target="_blank" 
            rel="noopener noreferrer"
            className="other-projects-button"
          >
            Other Projects
          </a>
          
          {/* Hidden dwarf planet button (easter egg) */}
          <button 
            className={`dwarf-button ${dwarfMenuOpen ? 'active' : ''}`}
            onClick={handleDwarfButtonClick}
            aria-label="Dwarf Planets"
            style={{ backgroundColor: dwarfMenuOpen ? '#FFCC00' : '#444' }}
          />
          
          {/* Dropdown menu for dwarf planets */}
          <div className={`dwarf-menu ${dwarfMenuOpen ? 'open' : ''}`}>
            <ul>
              {dwarfPlanets.map(dwarfPlanet => (
                <li key={dwarfPlanet.id}>
                  <Link 
                    to={`/planet/${dwarfPlanet.id}`}
                    onClick={() => setDwarfMenuOpen(false)}
                  >
                    <span 
                      className="dwarf-planet-icon" 
                      style={{ backgroundColor: dwarfPlanet.color }}
                    ></span>
                    {dwarfPlanet.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Dropdown menus for planets with moons */}
          {Object.keys(planetMoons).map(planetId => (
            <div 
              key={`moons-dropdown-${planetId}`}
              className={`moons-dropdown ${moonsDropdownFor === planetId ? 'open' : ''}`}
              data-planet-id={planetId}
            >
              <ul>
                {planetMoons[planetId].map(moon => (
                  <li key={moon.id}>
                    <Link 
                      to={`/moon/${moon.id}`}
                      onClick={() => setMoonsDropdownFor(null)}
                    >
                      <span 
                        className="moon-icon" 
                        style={{ 
                          backgroundColor: moon.id === 'io' ? '#E8D14C' : 
                                          moon.id === 'europa' ? '#F0F8FF' :
                                          moon.id === 'ganymede' ? '#C0C8D0' :
                                          moon.id === 'callisto' ? '#9A9AA0' : '#E0E0E0' 
                        }}
                      ></span>
                      {moon.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
        
        <main>
          <Suspense fallback={<div className="loading">Loading...</div>}>
            <Routes>
              <Route path="/" element={<Home planets={planets} />} />
              <Route 
                path="/planet/:planetId" 
                element={<PlanetPage 
                  planets={[...planets, ...dwarfPlanets]} 
                />} 
              />
              <Route 
                path="/moon/:moonId" 
                element={<Suspense fallback={<div className="loading">Loading moon details...</div>}>
                  <MoonDetailPage planets={[...planets, ...dwarfPlanets]} />
                </Suspense>} 
              />
            </Routes>
          </Suspense>
        </main>
      </div>
    </Router>
  );
}

export default App;