import React, { useState, lazy, Suspense, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import planets, { dwarfPlanets } from './data/planets';

// Lazy load pages with preload hints to improve loading performance
// Direct imports for immediate loading
import Home from './pages/Home';
const PlanetPage = lazy(() => import('./pages/PlanetPage'));
const MoonDetailPage = lazy(() => import('./components/pages/MoonDetailPage'));

/**
 * Main application component with routing and navigation
 */
// Main application component
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

// Create a wrapper component that has access to useNavigate
function AppContent() {
  const navigate = useNavigate();
  
  // State for the dwarf planet menu, moons dropdown, and help modal
  const [dwarfMenuOpen, setDwarfMenuOpen] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);
  const [moonsDropdownFor, setMoonsDropdownFor] = useState(null);
  const [showHelpModal, setShowHelpModal] = useState(false);
  
  // Create a global state for the help modal that other components can check
  useEffect(() => {
    // Make the modal state available globally
    window.isHelpModalOpen = showHelpModal;
    
    // Dispatch a custom event so other components can react
    const event = new CustomEvent('helpModalStateChange', { 
      detail: { isOpen: showHelpModal } 
    });
    document.dispatchEvent(event);
    
    return () => {
      window.isHelpModalOpen = false;
    };
  }, [showHelpModal]);
  
  // Data for which planets have moons and what those moons are
  const planetMoons = {
    'earth': [{ id: 'moon', name: 'The Moon' }],
    'jupiter': [
      { id: 'io', name: 'Io' },
      { id: 'europa', name: 'Europa' },
      { id: 'ganymede', name: 'Ganymede' },
      { id: 'callisto', name: 'Callisto' }
    ],
    'saturn': [
      { id: 'titan', name: 'Titan' }
    ],
    'mars': [
      { id: 'phobos', name: 'Phobos' },
      { id: 'deimos', name: 'Deimos' }
    ]
  };
  
  // Handle clicks on the hidden dwarf planet button
  const handleDwarfButtonClick = () => {
    const now = Date.now();
    
    // Check for double click (two clicks within 300ms)
    if (now - lastClickTime < 300) {
      // Toggle the dwarf menu without affecting other states
      setDwarfMenuOpen(!dwarfMenuOpen);
      setClickCount(0);
      // Only close moon dropdown, but preserve other UI states
      if (moonsDropdownFor) {
        setMoonsDropdownFor(null);
      }
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
        
        // Position the dropdown correctly under the planet
        setTimeout(() => {
          const planetElement = e.currentTarget;
          const dropdown = document.querySelector(`.moons-dropdown[data-planet-id="${planetId}"]`);
          
          if (planetElement && dropdown) {
            const rect = planetElement.getBoundingClientRect();
            dropdown.style.left = `${rect.left}px`;
          }
        }, 0);
        
        // Close dwarf planets menu if open
        if (dwarfMenuOpen) setDwarfMenuOpen(false);
      }
    } else {
      // For planets without moons, navigate directly
      navigate(`/planet/${planetId}`);
    }
  }
  
  return (
    <div className="app">
      <nav>
        <div className="nav-container">
          {/* Solar System button - highest priority */}
          <div className="nav-left">
            <Link to="/" className="solar-system-link">
              <span className="solar-system-icon"></span>
              Solar System
            </Link>
          </div>
          
          {/* Scrollable planets list */}
          <div className="planets-scroll-container">
            <ul>
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
          </div>
          
          {/* Right nav buttons - next priority */}
          <div className="nav-right">
            {/* Help button (question mark icon) */}
            <button 
              className="help-button"
              onClick={() => setShowHelpModal(true)}
              aria-label="Help"
            >
              ?
            </button>
            
            {/* Other Projects button */}
            <a 
              href="https://github.com/StefVuck" 
              target="_blank" 
              rel="noopener noreferrer"
              className="other-projects-button"
            >
              Other Projects
            </a>
            
            {/* Dwarf planet button */}
            <button 
              className={`dwarf-button ${dwarfMenuOpen ? 'active' : ''}`}
              onClick={handleDwarfButtonClick}
              aria-label="Dwarf Planets"
              style={{ backgroundColor: dwarfMenuOpen ? '#FFCC00' : '#444' }}
            />
          </div>
        </div>
        
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
                                        moon.id === 'callisto' ? '#9A9AA0' :
                                        moon.id === 'titan' ? '#E8A952' :
                                        moon.id === 'phobos' ? '#8F7A6A' :
                                        moon.id === 'deimos' ? '#9A8A7A' : '#E0E0E0' 
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
        <Routes>
          <Route path="/" element={<Home planets={planets} dwarfMenuOpen={dwarfMenuOpen} />} />
          <Route 
            path="/planet/:planetId" 
            element={
              <Suspense fallback={
                <div className="loading">
                  <div className="loader-spinner" style={{
                    border: '5px solid #333',
                    borderTop: '5px solid #3498db',
                    borderRadius: '50%',
                    width: '50px',
                    height: '50px',
                    animation: 'spin 1s linear infinite',
                    margin: '20px auto'
                  }}></div>
                  <div>Loading planet details...</div>
                </div>
              }>
                <PlanetPage planets={[...planets, ...dwarfPlanets]} />
              </Suspense>
            } 
          />
          <Route 
            path="/moon/:moonId" 
            element={
              <Suspense fallback={
                <div className="loading">
                  <div className="loader-spinner" style={{
                    border: '5px solid #333',
                    borderTop: '5px solid #3498db',
                    borderRadius: '50%',
                    width: '50px',
                    height: '50px',
                    animation: 'spin 1s linear infinite',
                    margin: '20px auto'
                  }}></div>
                  <div>Loading moon details...</div>
                </div>
              }>
                <MoonDetailPage planets={[...planets, ...dwarfPlanets]} />
              </Suspense>
            } 
          />
        </Routes>
      </main>
      
      {/* This renderer will create an absolutely positioned overlay over everything */}
      {showHelpModal && (
        <div 
          id="help-modal-wrapper" 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(5, 10, 36, 0.85)',
            backdropFilter: 'blur(5px)',
            WebkitBackdropFilter: 'blur(5px)',
            zIndex: 10000000,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            animation: 'fadeIn 0.3s ease'
          }}
          onClick={() => setShowHelpModal(false)}
        >
          <div 
            className="help-modal"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'rgba(16, 25, 55, 0.95)',
              borderRadius: '8px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
              width: '90%',
              maxWidth: '700px',
              maxHeight: '90vh',
              overflowY: 'auto',
              border: '1px solid rgba(100, 100, 150, 0.2)',
              animation: 'scaleIn 0.3s ease',
              position: 'relative',
              zIndex: 10000001
            }}
          >
            <div className="help-header">
              <h2>Interactive Solar System</h2>
              <button className="close-button" onClick={() => setShowHelpModal(false)}>×</button>
            </div>
            
            <div className="help-content">
              <div className="help-version">
                <p>Version: 1.0.0</p>
                <p>Released: March 2, 2025</p>
              </div>
              
              <h3>About</h3>
              <p>
                An interactive 3D visualization of our solar system, allowing you to explore 
                planets, moons, and other celestial bodies with accurate scale and orbital mechanics.
              </p>
              
              <h3>How to Use</h3>
              <ul>
                <li>Use the top navigation to select planets and moons</li>
                <li>Click and drag to rotate the view</li>
                <li>Scroll to zoom in and out</li>
                <li>Double-click on planets with moons to view directly</li>
                <li>Discover the secret dwarf planets menu (hint: look for a small dot)</li>
              </ul>
              
              <h3>Features</h3>
              <ul>
                <li>Accurate 3D models of all planets and major moons</li>
                <li>Realistic textures and surface features</li>
                <li>Dynamic lighting and shadow effects</li>
                <li>Educational facts about each celestial body</li>
                <li>Orbit visualization with accurate orbital mechanics</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Using default export for compatibility
export default App;