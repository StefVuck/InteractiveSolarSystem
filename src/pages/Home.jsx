import React, { useState, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';

// Import components
import EnhancedPlanet from '../components/celestial/EnhancedPlanet';
import AsteroidBelt from '../components/celestial/AsteroidBelt';
import RedSpot from '../components/celestial/RedSpot';
import MiniMoon from '../components/celestial/MiniMoon';
import Spacecraft from '../components/spacecraft/Spacecraft';
import OrbitingFacts from '../components/OrbitingFacts';

// Import data and utilities
import astronomyFacts from '../data/astronomyFacts';
import { dwarfPlanets } from '../data/planets';
import { createDetailedSaturnRingsTexture } from '../utils/textureGenerators';

/**
 * Home component showing the entire solar system
 */
function Home({ planets }) {
  const navigate = useNavigate();
  const [cameraPosition, setCameraPosition] = useState([0, 10, 20]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Get planet size based on relative real-world sizes
  const getPlanetSize = (planetId) => {
    const sizes = {
      'mercury': 0.38,  // Smallest
      'venus': 0.95,    // Similar to Earth
      'earth': 1.0,     // Reference size
      'mars': 0.53,     // About half of Earth
      'jupiter': 2.5,   // Much larger
      'saturn': 2.2,    // Second largest
      'uranus': 1.8,    // Ice giant
      'neptune': 1.7    // Ice giant
    };
    return (sizes[planetId] || 1.0) * 0.5; // Base scale factor of 0.5
  };
  
  // Get planet orbit distance from sun
  const getPlanetOrbitRadius = (index) => {
    // More spaced out orbits
    const distances = [
      7.5,    // Mercury - closer to sun
      11.25,  // Venus
      15,     // Earth
      19.5,   // Mars
      31.5,   // Jupiter (after asteroid belt)
      39,     // Saturn
      48,     // Uranus
      57      // Neptune
    ];
    
    return distances[index] || (7.5 + index * 6); // Also adjusted the fallback calculation
  };
  
  // Check if planet has rings
  const hasRings = (planetId) => {
    return ['saturn', 'uranus'].includes(planetId);
  };
  
  // Create Saturn's ring texture once for reuse
  const saturnRingsTexture = useMemo(() => createDetailedSaturnRingsTexture(), []);
  
  // Get ring properties
  const getRingProps = (planetId) => {
    if (planetId === 'saturn') {
      return {
        ringsColor: '#F4D59C',
        ringsRotation: [Math.PI / 4, 0, 0],
        ringsTexture: saturnRingsTexture,
        ringsOpacity: 1.0 // More opaque for Saturn
      };
    } else if (planetId === 'uranus') {
      return {
        ringsColor: '#AAD3F2',
        ringsRotation: [0, 0, Math.PI / 2], // Vertical rings for Uranus
        ringsOpacity: 0.15 // Less opaque for Uranus
      };
    }
    return {};
  };
  
  // Handle planet click
  const handlePlanetClick = (planetId) => {
    // Find the clicked planet
    const planetIndex = planets.findIndex(p => p.id === planetId);
    const angle = (planetIndex / planets.length) * Math.PI * 2;
    const distance = 4 + planetIndex * 1.5;
    const x = Math.cos(angle) * distance;
    const z = Math.sin(angle) * distance;
    
    // Start transition animation
    setIsTransitioning(true);
    
    // Move camera closer to the planet
    setCameraPosition([x, 2, z + 5]);
    
    // After animation completes, navigate to the planet page
    setTimeout(() => {
      navigate(`/planet/${planetId}`);
    }, 1000);
  };
  
  return (
    <div style={{ width: '100%', height: 'calc(100vh - 60px)' }}>
      <Canvas 
        camera={{ position: cameraPosition, fov: 45 }}
        gl={{ 
          powerPreference: 'default', 
          antialias: false,
          depth: true,
          stencil: false,
          alpha: false
        }}>
        <ambientLight intensity={0.3} /> {/* Reduced to make night side darker */}
        <pointLight position={[10, 10, 10]} intensity={1.0} color="#FFF8E0" />
        <pointLight position={[-10, -10, -10]} intensity={0.3} color="#C0C8FF" />
        
        {/* Sun */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[2.8, 32, 32]} />
          <meshBasicMaterial color="#FFFF00" />
        </mesh>
        
        {/* Enhanced sun glow - multiple layers */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[3.2, 32, 32]} />
          <meshBasicMaterial color="#FFFF00" transparent opacity={0.4} />
        </mesh>
        
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[3.8, 32, 32]} />
          <meshBasicMaterial color="#FFFF55" transparent opacity={0.2} />
        </mesh>
        
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[4.5, 24, 24]} />
          <meshBasicMaterial color="#FFFFAA" transparent opacity={0.1} />
        </mesh>
        
        {/* Hint for the easter egg - subtle glow in the distance */}
        <mesh position={[77 * Math.cos(Math.PI * 0.3), -4, 77 * Math.sin(Math.PI * 0.3)]}>
          <sphereGeometry args={[0.5, 8, 8]} />
          <meshBasicMaterial color="#FFCC00" transparent opacity={0.03} />
        </mesh>
        <mesh position={[29 * Math.cos(Math.PI * 0.8), 3, 29 * Math.sin(Math.PI * 0.8)]}>
          <sphereGeometry args={[0.4, 8, 8]} />
          <meshBasicMaterial color="#FFCC00" transparent opacity={0.04} />
        </mesh>
        
        {/* Add a point light at the sun's position */}
        <pointLight position={[0, 0, 0]} intensity={0.8} distance={100} decay={2} />
        
        {/* Background stars - minimal count for stability */}
        <Stars radius={100} depth={50} count={1500} factor={3} saturation={0} />
        
        {/* Asteroid Belts */}
        {/* Main Belt between Mars and Jupiter */}
        <AsteroidBelt 
          innerRadius={24} 
          outerRadius={28.5} 
          count={140} 
          name="Main Asteroid Belt" 
        />
        
        {/* Kuiper Belt beyond Neptune */}
        <AsteroidBelt 
          innerRadius={63} 
          outerRadius={75} 
          count={80} 
          name="Kuiper Belt" 
          color="#777777"
        />
        
        {/* Orbiting Facts */}
        <OrbitingFacts facts={astronomyFacts} maxActive={5} scene="solar-system" />
        
        {/* Orbit rings */}
        {planets.map((planet, index) => {
          const distance = getPlanetOrbitRadius(index);
          return (
            <mesh 
              key={`orbit-${planet.id}`} 
              position={[0, 0, 0]} 
              rotation={[Math.PI / 2, 0, 0]}
            >
              <ringGeometry args={[distance - 0.05, distance + 0.05, 64]} />
              <meshBasicMaterial color="#444444" transparent opacity={0.3} />
            </mesh>
          );
        })}
        
        {/* Planets */}
        {planets.map((planet, index) => {
          // Calculate position in a circle around the sun
          const angle = (index / planets.length) * Math.PI * 2;
          const distance = getPlanetOrbitRadius(index); // More spaced out distances
          const x = Math.cos(angle) * distance;
          const z = Math.sin(angle) * distance;
          
          // Determine planet size based on its actual relative size
          const planetSize = getPlanetSize(planet.id);
          
          // Get ring properties if applicable
          const ringProps = hasRings(planet.id) ? getRingProps(planet.id) : {};
          
          return (
            <group key={planet.id}>
              <EnhancedPlanet 
                position={[x, 0, z]} 
                color={planet.color} 
                size={planetSize}
                name={planet.name}
                onClick={() => handlePlanetClick(planet.id)}
                hasRings={hasRings(planet.id)}
                planetId={planet.id}
                ringsColor={ringProps.ringsColor}
                ringsRotation={ringProps.ringsRotation}
                ringsTexture={ringProps.ringsTexture}
                ringsOpacity={ringProps.ringsOpacity}
              />
              
              {/* Add moon to Earth */}
              {planet.id === 'earth' && (
                <MiniMoon 
                  parentPosition={[x, 0, z]} 
                  parentSize={planetSize} 
                />
              )}
              
              {/* Add Great Red Spot to Jupiter */}
              {planet.id === 'jupiter' && (
                <RedSpot 
                  parentPosition={[x, 0, z]} 
                  parentSize={planetSize}
                />
              )}
            </group>
          );
        })}
        
        {/* Easter Egg: Dwarf Planets - Hidden from UI */}
        {dwarfPlanets.map((dwarfPlanet) => {
          // Use the orbit radius directly from the dwarf planet data
          // Each dwarf planet gets a fixed position on their orbit for consistency
          const angle = dwarfPlanet.id === 'pluto' ? Math.PI * 0.3 : 
                       dwarfPlanet.id === 'ceres' ? Math.PI * 0.8 :
                       dwarfPlanet.id === 'haumea' ? Math.PI * 1.2 :
                       Math.PI * 1.7; // Makemake
                       
          const x = Math.cos(angle) * dwarfPlanet.orbitRadius;
          const z = Math.sin(angle) * dwarfPlanet.orbitRadius;
          const y = dwarfPlanet.id === 'ceres' ? 3 : 
                   dwarfPlanet.id === 'pluto' ? -4 :
                   dwarfPlanet.id === 'haumea' ? 6 :
                   -7; // Distinct heights to make them more noticeable
          
          return (
            <group key={dwarfPlanet.id}>
              {/* Ambient glow to make them more visible */}
              <pointLight 
                position={[x, y, z]} 
                intensity={0.5} 
                distance={3} 
                color={dwarfPlanet.id === 'pluto' ? "#B8C0FF" : 
                       dwarfPlanet.id === 'ceres' ? "#FFD580" :
                       dwarfPlanet.id === 'haumea' ? "#E0F0FF" :
                       "#FFAA80"} 
              />
              
              <mesh
                position={[x, y, z]}
                onClick={() => handlePlanetClick(dwarfPlanet.id)}
                scale={[1.5, 1.5, 1.5]} // Make them slightly larger to be more visible
                userData={{ isEasterEgg: true }}
                onPointerOver={(e) => {
                  // Find and show the label
                  e.object.parent.children.forEach(child => {
                    if (child.isText && child.userData.isDwarfPlanet && 
                        child.userData.id === dwarfPlanet.id) {
                      child.visible = true;
                    }
                  });
                }}
                onPointerOut={(e) => {
                  // Hide the label again
                  e.object.parent.children.forEach(child => {
                    if (child.isText && child.userData.isDwarfPlanet) {
                      child.visible = false;
                    }
                  });
                }}
              >
                <sphereGeometry args={[dwarfPlanet.size, 16, 16]} />
                <meshStandardMaterial
                  color={dwarfPlanet.color}
                  roughness={0.6}
                  metalness={0.2}
                  emissive={dwarfPlanet.color}
                  emissiveIntensity={0.3} // Add some self-illumination
                />
              </mesh>
              
              {/* Add glow effect around the dwarf planet */}
              <mesh position={[x, y, z]} scale={[1.8, 1.8, 1.8]}>
                <sphereGeometry args={[dwarfPlanet.size, 8, 8]} />
                <meshBasicMaterial
                  color={dwarfPlanet.color}
                  transparent={true}
                  opacity={0.15}
                  side={THREE.BackSide}
                />
              </mesh>
            </group>
          );
        })}
        
        {/* Voyager 1 - Position relative to Jupiter's distance */}
        <Spacecraft
          position={[
            Math.cos(Math.PI * 0.2) * (getPlanetOrbitRadius(4) * 2.5), // 2.5x Jupiter's distance
            8, // Above the plane
            Math.sin(Math.PI * 0.2) * (getPlanetOrbitRadius(4) * 2.5)
          ]}
          name="Voyager 1"
          description="Launched in 1977, Voyager 1 is the farthest human-made object from Earth. It has crossed into interstellar space in 2012 and continues to send back data from beyond our solar system. It carries the Golden Record, containing sounds and images of Earth for any extraterrestrial intelligence that might find it."
          icon={
            <group>
              {/* Main body - Gold foil covered bus */}
              <mesh>
                <boxGeometry args={[0.3, 0.1, 0.3]} />
                <meshStandardMaterial color="#D4AF37" emissive="#D4AF37" emissiveIntensity={0.4} />
              </mesh>
              
              {/* Large dish antenna */}
              <mesh position={[0, 0.15, 0]} rotation={[0, 0, Math.PI/2]}>
                <cylinderGeometry args={[0.25, 0.25, 0.02, 16]} />
                <meshStandardMaterial color="#CCC" emissive="#FFFFFF" emissiveIntensity={0.3} />
              </mesh>
              
              {/* RTG power source */}
              <mesh position={[-0.2, 0, 0]} rotation={[Math.PI/2, 0, 0]}>
                <cylinderGeometry args={[0.05, 0.05, 0.2, 8]} />
                <meshStandardMaterial color="#555" emissive="#FF6622" emissiveIntensity={0.6} />
              </mesh>
              
              {/* Additional outer glow spheres */}
              <mesh>
                <sphereGeometry args={[0.6, 8, 8]} />
                <meshBasicMaterial color="#88CCFF" transparent={true} opacity={0.15} />
              </mesh>
              <mesh>
                <sphereGeometry args={[1.0, 8, 8]} />
                <meshBasicMaterial color="#88CCFF" transparent={true} opacity={0.07} />
              </mesh>
              
              {/* Additional point light */}
              <pointLight position={[0, 0, 0]} intensity={2} distance={15} color="#AADDFF" />
            </group>
          }
        />
        
        {/* Voyager 2 - Position relative to Jupiter's distance, different direction */}
        <Spacecraft
          position={[
            Math.cos(Math.PI * 1.7) * (getPlanetOrbitRadius(4) * 2.2), // 2.2x Jupiter's distance
            -6, // Below the plane
            Math.sin(Math.PI * 1.7) * (getPlanetOrbitRadius(4) * 2.2)
          ]}
          name="Voyager 2"
          description="Launched in 1977, Voyager 2 is the only spacecraft to have visited all four gas giant planets: Jupiter, Saturn, Uranus, and Neptune. It crossed into interstellar space in 2018 and continues its journey outward. Like its twin, it carries the Golden Record with Earth's sounds and images."
          icon={
            <group>
              {/* Main body - Gold foil covered bus */}
              <mesh>
                <boxGeometry args={[0.3, 0.1, 0.3]} />
                <meshStandardMaterial color="#D4AF37" emissive="#D4AF37" emissiveIntensity={0.4} />
              </mesh>
              
              {/* Large dish antenna */}
              <mesh position={[0, 0.15, 0]} rotation={[0, 0, Math.PI/2]}>
                <cylinderGeometry args={[0.25, 0.25, 0.02, 16]} />
                <meshStandardMaterial color="#CCC" emissive="#FFFFFF" emissiveIntensity={0.3} />
              </mesh>
              
              {/* RTG power source */}
              <mesh position={[-0.2, 0, 0]} rotation={[Math.PI/2, 0, 0]}>
                <cylinderGeometry args={[0.05, 0.05, 0.2, 8]} />
                <meshStandardMaterial color="#555" emissive="#FF6622" emissiveIntensity={0.6} />
              </mesh>
              
              {/* Additional outer glow spheres - slightly different color tint */}
              <mesh>
                <sphereGeometry args={[0.6, 8, 8]} />
                <meshBasicMaterial color="#88DDFF" transparent={true} opacity={0.15} />
              </mesh>
              <mesh>
                <sphereGeometry args={[1.0, 8, 8]} />
                <meshBasicMaterial color="#88DDFF" transparent={true} opacity={0.07} />
              </mesh>
              
              {/* Additional point light - slightly different color tint */}
              <pointLight position={[0, 0, 0]} intensity={2} distance={15} color="#AAEEFF" />
            </group>
          }
        />
        
        <OrbitControls enableRotate={!isTransitioning} />
      </Canvas>
    </div>
  );
}

export default Home;