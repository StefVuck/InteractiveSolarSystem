import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Suspense, lazy } from 'react';
// Removed AnimatePresence import
import planets from './data/planets';
import './App.css';

// Lazy load components for better performance
const Home = lazy(() => import('./pages/Home'));
const PlanetPage = lazy(() => import('./pages/PlanetPage'));

function App() {
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
        </nav>
        
        <main>
          <Suspense fallback={<div className="loading">Loading...</div>}>
            {/* Removed AnimatePresence which could cause extra renders */}
            <Routes>
              <Route path="/" element={<Home planets={planets} />} />
              <Route path="/planet/:planetId" element={<PlanetPage planets={planets} />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </Router>
  );
}

export default App;