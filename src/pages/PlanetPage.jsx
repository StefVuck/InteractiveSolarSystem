import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { useParams, useNavigate } from 'react-router-dom';
import * as THREE from 'three';

// Import Components
import DetailedPlanet from '../components/celestial/DetailedPlanet';
import DetailedEarth from '../components/celestial/DetailedEarth';
import JupiterRedSpot from '../components/celestial/JupiterRedSpot';
import ISS from '../components/spacecraft/ISS';
import Moon from '../components/celestial/Moon';
import MoonPage from '../components/pages/MoonPage';
import MoonDetailPage from '../components/pages/MoonDetailPage';
import PlanetaryMoons from '../components/celestial/PlanetaryMoons';
import OrbitingFacts from '../components/OrbitingFacts';
import HorizontalText from '../components/common/HorizontalText';

// Import data
import astronomyFacts from '../data/astronomyFacts';

/**
 * Planet detail page component
 */
function PlanetPage({ planets }) {
  const { planetId } = useParams();
  const navigate = useNavigate();
  const [showMoon, setShowMoon] = useState(false);
  const [selectedMoonId, setSelectedMoonId] = useState(null);
  const planet = planets.find(p => p.id === planetId) || planets[0];
  
  // Add animation effect when leaving the page
  const handleBackClick = () => {
    navigate('/');
  };
  
  // Toggle moon view
  const handleMoonClick = (moonId = 'moon') => {
    setSelectedMoonId(moonId);
    setShowMoon(true);
  };
  
  // Return from moon to planet
  const handleBackFromMoon = () => {
    setShowMoon(false);
    setSelectedMoonId(null);
  };
  
  // Determines if current planet should have moons system
  const hasMoons = (planetId) => {
    // Check if this is a planet with known moons or a dwarf planet with hasMoons flag
    const isPlanetWithMoons = ['earth', 'jupiter', 'saturn', 'mars'].includes(planetId);
    
    // For dwarf planets, check if they have the hasMoons flag set to true
    const isDwarfPlanetWithMoons = planet.hasMoons === true;
    
    return isPlanetWithMoons || isDwarfPlanetWithMoons;
  };
  
  return (
    <div className="planet-page">
      {showMoon ? (
        // Show appropriate moon page when moon is selected
        selectedMoonId === 'moon' ? (
          // Earth's moon uses old MoonPage
          <MoonPage onBackClick={handleBackFromMoon} />
        ) : (
          // Galilean moons use new MoonDetailPage
          <MoonDetailPage 
            moonId={selectedMoonId}
            onBackClick={handleBackFromMoon}
            parentPlanetId={planetId}
            parentPlanetName={planet.name}
          />
        )
      ) : (
        // Regular planet view
        <>
          <div className="planet-info">
            <h1>{planet.name}</h1>
            <p>{planet.description}</p>
            <button className="back-button" onClick={handleBackClick}>
              ← Back to Solar System
            </button>
          </div>
          
          <div style={{ width: '100%', height: 'calc(100vh - 140px)' }}>
            <Canvas 
              camera={{ position: [0, 0, 5], fov: 45 }}
              gl={{ 
                powerPreference: 'default', 
                antialias: false,
                depth: true,
                stencil: false,
                alpha: false,
                // Add WebGL context loss handling
                onContextLost: (event) => {
                  console.warn('WebGL context lost, preventing default', event);
                  event.preventDefault();
                },
                // Attempt to restore context
                onContextRestored: () => {
                  console.log('WebGL context restored');
                }
              }}>
              <ambientLight intensity={0.3} /> {/* Darker ambient for better contrast */}
              <pointLight position={[5, 5, 5]} intensity={1.2} color="#FFF8E0" />
              <pointLight position={[-5, -5, -5]} intensity={0.3} color="#C0C8FF" />
              
              {/* Add distant sun glow - moved farther away */}
              <mesh position={[25, 15, 25]}>
                <sphereGeometry args={[3, 24, 24]} />
                <meshBasicMaterial color="#FFFF88" />
              </mesh>
              <pointLight position={[25, 15, 25]} intensity={1.2} distance={50} />
              
              {/* Atmospheric glow for some planets */}
              {['venus', 'jupiter', 'saturn', 'uranus', 'neptune'].includes(planet.id) && (
                <mesh>
                  <sphereGeometry args={[2.1, 32, 32]} />
                  <meshBasicMaterial 
                    color={planet.color} 
                    transparent={true} 
                    opacity={0.2} 
                    side={THREE.BackSide}
                  />
                </mesh>
              )}
              
              {/* Detailed planet */}
              {planet.id === 'earth' ? (
                <DetailedEarth 
                  onMoonClick={() => handleMoonClick('moon')} 
                />
              ) : (
                <DetailedPlanet 
                  color={planet.color} 
                  planetId={planet.id} 
                  onMoonClick={handleMoonClick}
                  simplifiedRendering={planet.simplifiedRendering || false}
                />
              )}
              
              {/* Add Jupiter's Great Red Spot if on Jupiter's page */}
              {planet.id === 'jupiter' && <JupiterRedSpot />}
              
              {/* Add ISS orbiting Earth */}
              {planet.id === 'earth' && <ISS orbitRadius={2.5} orbitSpeed={0.01} />}
              
              {/* Add moons to planets that have them */}
              {planet.id === 'earth' && <Moon />}
              {planet.id === 'jupiter' && <PlanetaryMoons planetId="jupiter" onMoonClick={handleMoonClick} />}
              {planet.id === 'saturn' && <PlanetaryMoons planetId="saturn" onMoonClick={handleMoonClick} />}
              {planet.id === 'mars' && <PlanetaryMoons planetId="mars" onMoonClick={handleMoonClick} />}
              {planet.id === 'pluto' && <PlanetaryMoons planetId="pluto" onMoonClick={handleMoonClick} />}
              {/* Do not attempt to render PlanetaryMoons for other dwarf planets */}
              
              {/* Moon visit button for Earth */}
              {planet.id === 'earth' && (
                <group position={[0, 4.5, 0]}>
                  <mesh onClick={(e) => {
                    e.stopPropagation();
                    handleMoonClick('moon');
                  }}>
                    <planeGeometry args={[3, 0.7]} />
                    <meshBasicMaterial transparent opacity={0.7} color="#111133" />
                  </mesh>
                  <HorizontalText
                    position={[0, 0, 0.1]}
                    fontSize={0.3}
                    color="white"
                    anchorX="center"
                    anchorY="middle"
                    renderOrder={11} // Ensure text renders on top with higher priority
                  >
                    Visit Moon
                  </HorizontalText>
                </group>
              )}
              
              {/* Filter facts for this planet, with reduced count for simplified dwarf planets */}
              <OrbitingFacts 
                facts={astronomyFacts.filter(fact => 
                  fact.toLowerCase().includes(planet.id.toLowerCase()) || 
                  fact.toLowerCase().includes(planet.name.toLowerCase())
                )} 
                maxActive={planet.simplifiedRendering ? 1 : 3} 
                scene="planet-detail" 
              />
              
              {/* Fewer stars for simplified dwarf planets */}
              <Stars 
                radius={100} 
                depth={50} 
                count={planet.simplifiedRendering ? 100 : 500} 
                factor={2} 
              />
              {/* Use simpler controls with slower rotation for problematic dwarf planets */}
              {planet.simplifiedRendering ? (
                <OrbitControls 
                  autoRotate={true} 
                  autoRotateSpeed={0.2} // Slower rotation for simplified planets
                  enableZoom={true}
                  enableRotate={true}
                  enablePan={false}
                  minDistance={3}
                  maxDistance={10}
                />
              ) : (
                <OrbitControls autoRotate={true} autoRotateSpeed={0.5} />
              )}
            </Canvas>
          </div>
        </>
      )}
    </div>
  );
}

export default PlanetPage;