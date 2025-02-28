import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Suspense, lazy } from 'react';
// Removed AnimatePresence import
import planets, { dwarfPlanets } from './data/planets';
import './App.css';

// Lazy load components for better performance
const Home = lazy(() => import('./pages/Home'));
const PlanetPage = lazy(() => import('./pages/PlanetPage'));

function App() {
  // State for the dwarf planet menu
  const [dwarfMenuOpen, setDwarfMenuOpen] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);
  
  // Handle clicks on the hidden dwarf planet button
  const handleDwarfButtonClick = () => {
    const now = Date.now();
    
    // Check for double click (two clicks within 300ms)
    if (now - lastClickTime < 300) {
      setDwarfMenuOpen(!dwarfMenuOpen);
      setClickCount(0);
    } else {
      setClickCount(clickCount + 1);
    }
    
    setLastClickTime(now);
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
              <li key={planet.id}>
                <Link to={`/planet/${planet.id}`}>
                  <span 
                    className="planet-icon" 
                    style={{ 
                      backgroundColor: planet.color,
                      boxShadow: planet.id === 'saturn' ? `0 0 8px ${planet.color}` : 'none'
                    }}
                  ></span>
                  {planet.name}
                </Link>
              </li>
            ))}
          </ul>
          
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
        </nav>
        
        <main>
          <Suspense fallback={<div className="loading">Loading...</div>}>
            {/* Removed AnimatePresence which could cause extra renders */}
            <Routes>
              <Route path="/" element={<Home planets={planets} />} />
              <Route 
                path="/planet/:planetId" 
                element={<PlanetPage 
                  planets={[...planets, ...dwarfPlanets]} 
                />} 
              />
            </Routes>
          </Suspense>
        </main>
      </div>
    </Router>
  );
}

export default App;