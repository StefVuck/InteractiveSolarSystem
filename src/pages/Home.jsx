import React, { useState, useMemo, useRef, useEffect, Suspense, lazy } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Line } from '@react-three/drei';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';

// Performance Component
function PerformanceMonitor() {
  const { gl } = useThree();
  
  useEffect(() => {
    // Keep sRGB encoding for color correctness but optimize other settings
    gl.outputEncoding = THREE.sRGBEncoding;
    gl.physicallyCorrectLights = false;
    
    // Enable WebGL optimizations for texture loading
    const renderer = gl.getContext();
    if (renderer) {
      renderer.powerPreference = 'high-performance';
    }
  }, [gl]);
  
  return null;
}

// Import components - with code splitting for less essential components
import EnhancedPlanet from '../components/celestial/EnhancedPlanet';
const AsteroidBelt = lazy(() => import('../components/celestial/AsteroidBelt'));
const RedSpot = lazy(() => import('../components/celestial/RedSpot'));
const MiniMoon = lazy(() => import('../components/celestial/MiniMoon'));
const Spacecraft = lazy(() => import('../components/spacecraft/Spacecraft'));
const OrbitingFacts = lazy(() => import('../components/OrbitingFacts'));
import HorizontalText from '../components/common/HorizontalText';

// Import data and utilities
import astronomyFacts from '../data/astronomyFacts';
import { dwarfPlanets } from '../data/planets';
import { createDetailedSaturnRingsTexture } from '../utils/textureGenerators';

/**
 * Planet Animation component for planetary rotation
 */
function PlanetOrbit({ planetId, planetIndex, orbitRadius, orbitalSpeed, children }) {
  const ref = useRef();
  const angle = useRef((planetIndex / 8) * Math.PI * 2); // Initial angle based on planet position
  
  useFrame(() => {
    // Update angle
    angle.current += orbitalSpeed;
    
    // Calculate position on orbit
    const x = Math.cos(angle.current) * orbitRadius;
    const z = Math.sin(angle.current) * orbitRadius;
    
    // Update position
    if (ref.current) {
      ref.current.position.x = x;
      ref.current.position.z = z;
    }
  });
  
  return (
    <group ref={ref} position={[Math.cos(angle.current) * orbitRadius, 0, Math.sin(angle.current) * orbitRadius]}>
      {children}
    </group>
  );
}

/**
 * Dwarf Planet Animation component with inclined orbit
 */
function DwarfPlanetOrbit({ dwarfPlanet, orbitalSpeed, children }) {
  const ref = useRef();
  
  // Starting angle based on dwarf planet ID
  const angle = useRef(
    dwarfPlanet.id === 'pluto' ? Math.PI * 0.3 : 
    dwarfPlanet.id === 'ceres' ? Math.PI * 0.8 :
    dwarfPlanet.id === 'haumea' ? Math.PI * 1.2 :
    Math.PI * 1.7 // Makemake
  );
  
  const baseY = dwarfPlanet.id === 'ceres' ? 3 : 
              dwarfPlanet.id === 'pluto' ? -4 :
              dwarfPlanet.id === 'haumea' ? 6 :
              -7; // Makemake
              
  const inclination = dwarfPlanet.id === 'pluto' ? Math.PI * 0.1 : // 17-degree inclination
                     dwarfPlanet.id === 'haumea' ? Math.PI * 0.14 : // ~25-degree inclination
                     dwarfPlanet.id === 'makemake' ? Math.PI * 0.12 : // ~22-degree inclination
                     0; // Ceres has nearly 0 inclination
  
  useFrame(() => {
    // Update angle
    angle.current += orbitalSpeed;
    
    // Calculate position with inclination
    const x = Math.cos(angle.current) * dwarfPlanet.orbitRadius;
    const z = Math.sin(angle.current) * dwarfPlanet.orbitRadius;
    const adjustedY = baseY + Math.sin(angle.current) * Math.sin(inclination) * dwarfPlanet.orbitRadius * 0.2;
    
    // Update position
    if (ref.current) {
      ref.current.position.x = x;
      ref.current.position.y = adjustedY;
      ref.current.position.z = z;
    }
  });
  
  // Calculate initial position with inclination for first render
  const initialX = Math.cos(angle.current) * dwarfPlanet.orbitRadius;
  const initialZ = Math.sin(angle.current) * dwarfPlanet.orbitRadius;
  const initialY = baseY + Math.sin(angle.current) * Math.sin(inclination) * dwarfPlanet.orbitRadius * 0.2;
  
  return (
    <group ref={ref} position={[initialX, initialY, initialZ]}>
      {children}
    </group>
  );
}

/**
 * Home component showing the entire solar system
 */
function Home({ planets, dwarfMenuOpen }) {
  const navigate = useNavigate();
  const [cameraPosition, setCameraPosition] = useState([0, 10, 30]); // Moved further back
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showOrbitLines, setShowOrbitLines] = useState(true); // Toggle for orbit lines
  const [showFacts, setShowFacts] = useState(true); // Toggle for astronomy facts
  
  // Get planet size based on relative real-world sizes
  const getPlanetSize = (planetId) => {
    const sizes = {
      'mercury': 0.38,   // 0.38× Earth's diameter
      'venus': 0.95,     // 0.95× Earth's diameter
      'earth': 1.0,      // Reference size
      'mars': 0.53,      // 0.53× Earth's diameter
      'jupiter': 11.2,   // 11.2× Earth's diameter
      'saturn': 9.5,     // 9.5× Earth's diameter
      'uranus': 4.0,     // 4.0× Earth's diameter
      'neptune': 3.9     // 3.9× Earth's diameter
    };
    
    // We need to scale the sizes to fit the scene
    // Use 0.5 scaling for terrestrial planets, but even smaller for gas giants
    const baseScaleFactor = 0.5;
    const gasGiantScaleFactor = 0.12; // Much smaller scale for gas giants to fit in scene
    
    if (['jupiter', 'saturn', 'uranus', 'neptune'].includes(planetId)) {
      return sizes[planetId] * gasGiantScaleFactor;
    } else {
      return (sizes[planetId] || 1.0) * baseScaleFactor;
    }
  };
  
  // Get planet orbit distance from sun
  const getPlanetOrbitRadius = (index) => {
    // More spaced out orbits - increased by 1.5x
    const distances = [
      11.25,   // Mercury - closer to sun (was 7.5)
      16.875,  // Venus (was 11.25)
      22.5,    // Earth (was 15)
      29.25,   // Mars (was 19.5)
      47.25,   // Jupiter (after asteroid belt) (was 31.5)
      58.5,    // Saturn (was 39)
      72,      // Uranus (was 48)
      85.5     // Neptune (was 57)
    ];
    
    return distances[index] || (11.25 + index * 9); // Also adjusted the fallback calculation
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
  
  // Toggle orbit lines visibility
  const toggleOrbitLines = () => {
    setShowOrbitLines(!showOrbitLines);
  };

  // Toggle astronomy facts visibility
  const toggleFacts = () => {
    setShowFacts(!showFacts);
  };

  // Button style creator to maintain consistent styling
  const createButtonStyle = (isActive) => ({
    background: isActive ? '#3366cc' : '#444',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '6px 12px',
    cursor: 'pointer',
    fontSize: '12px',
    fontFamily: 'sans-serif',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    marginLeft: '5px'
  });

  return (
    <div style={{ width: '100%', height: 'calc(100vh - 60px)' }}>
      {/* Toggle Buttons - adjust position when dwarf menu is open */}
      <div style={{ 
        position: 'absolute', 
        top: '5px', 
        right: dwarfMenuOpen ? '170px' : '10px', // Move left when menu is open
        zIndex: 100,
        display: 'flex',
        gap: '5px',
        transition: 'right 0.3s ease-in-out' // Smooth transition effect
      }}>
        <button 
          onClick={toggleOrbitLines}
          style={createButtonStyle(showOrbitLines)}
        >
          {showOrbitLines ? 'Hide Orbits' : 'Show Orbits'}
        </button>
        <button 
          onClick={toggleFacts}
          style={createButtonStyle(showFacts)}
        >
          {showFacts ? 'Hide Facts' : 'Show Facts'}
        </button>
      </div>

      <Canvas 
        camera={{ position: cameraPosition, fov: 40 }}  // Reduced FOV to see more
        gl={{ 
          powerPreference: 'high-performance', 
          antialias: false,  // Disabled for initial load performance
          depth: true,
          stencil: false,
          alpha: false
        }}
        dpr={[1, 2]} // Limit pixel ratio for better performance
        performance={{ min: 0.5 }} // Allow frame rate to drop during heavy loads
        >
        <PerformanceMonitor />
        <ambientLight intensity={0.3} /> {/* Reduced to make night side darker */}
        <pointLight position={[10, 10, 10]} intensity={1.0} color="#FFF8E0" />
        <pointLight position={[-10, -10, -10]} intensity={0.3} color="#C0C8FF" />
        
        {/* Sun - bright yellow with combined approaches */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[2.8, 32, 32]} />
          <meshStandardMaterial 
            emissive="#FFCC00" 
            emissiveIntensity={2.5} 
            color="#FFCC00" 
            toneMapped={false} 
          />
        </mesh>
        
        {/* Enhanced sun glow - multiple layers with increased brightness but yellower */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[3.2, 32, 32]} />
          <meshBasicMaterial color="#FFCC00" transparent opacity={0.6} toneMapped={false} />
        </mesh>
        
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[3.8, 32, 32]} />
          <meshBasicMaterial color="#FFD700" transparent opacity={0.4} toneMapped={false} />
        </mesh>
        
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[4.5, 24, 24]} />
          <meshBasicMaterial color="#FFEE44" transparent opacity={0.2} toneMapped={false} />
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
        
        {/* Add multiple point lights at the sun's position for stronger illumination */}
        <pointLight position={[0, 0, 0]} intensity={1.5} distance={120} decay={1.8} color="#FFCC00" />
        <pointLight position={[0, 0, 0]} intensity={1.0} distance={80} decay={1.5} color="#FFD700" />
        
        {/* Background stars - minimal count for stability */}
        <Stars radius={100} depth={50} count={1500} factor={3} saturation={0} fade={true} />
        
        {/* Asteroid Belts */}
        <Suspense fallback={null}>
          {/* Main Belt between Mars and Jupiter */}
          <AsteroidBelt 
            innerRadius={36} 
            outerRadius={42.75} 
            count={140} 
            name="Main Asteroid Belt" 
          />
          
          {/* Kuiper Belt beyond Neptune */}
          <AsteroidBelt 
            innerRadius={94.5} 
            outerRadius={112.5} 
            count={80} 
            name="Kuiper Belt" 
            color="#777777"
          />
        </Suspense>
        
        {/* Orbiting Facts - conditionally rendered */}
        {showFacts && (
          <Suspense fallback={null}>
            <OrbitingFacts facts={astronomyFacts} maxActive={5} scene="solar-system" />
          </Suspense>
        )}
        
        {/* Orbit paths for regular planets - using Line component for consistency */}
        {showOrbitLines && planets.map((planet, index) => {
          const distance = getPlanetOrbitRadius(index);
          
          // Create points for a circular path
          const segments = 128;
          const points = [];
          
          for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            const x = Math.cos(angle) * distance;
            const z = Math.sin(angle) * distance;
            // Regular planets have zero inclination
            points.push([x, 0, z]);
          }
          
          return (
            <Line
              key={`orbit-path-${planet.id}`}
              points={points}
              color="#AAAAAA"
              lineWidth={1}
              transparent
              opacity={0.3}
            />
          );
        })}
        
        {/* Orbit paths for dwarf planets - only visible when dwarf menu is open */}
        {showOrbitLines && dwarfMenuOpen && dwarfPlanets.map((dwarfPlanet) => {
          const distance = dwarfPlanet.orbitRadius;
          
          // Get base Y position for each dwarf planet
          const baseY = dwarfPlanet.id === 'ceres' ? 3 : 
                       dwarfPlanet.id === 'pluto' ? -4 :
                       dwarfPlanet.id === 'haumea' ? 6 :
                       -7; // Makemake
                       
          // Add inclination to the orbit rings
          const inclination = dwarfPlanet.id === 'pluto' ? Math.PI * 0.1 : // 17-degree inclination
                              dwarfPlanet.id === 'haumea' ? Math.PI * 0.14 : // ~25-degree inclination
                              dwarfPlanet.id === 'makemake' ? Math.PI * 0.12 : // ~22-degree inclination
                              0; // Ceres has nearly 0 inclination
          
          // Create points for a circular path with the correct inclination
          const segments = 128;
          const points = [];
          
          for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            const x = Math.cos(angle) * distance;
            const z = Math.sin(angle) * distance;
            // Apply inclination to y coordinate - this creates the tilted orbit
            const y = baseY + Math.sin(angle) * Math.sin(inclination) * distance * 0.2;
            points.push([x, y, z]);
          }
          
          return (
            <Line
              key={`orbit-path-${dwarfPlanet.id}`}
              points={points}
              color="#555555"
              lineWidth={1}
              transparent
              opacity={0.3}
            />
          );
        })}
        
        {/* Planets */}
        {planets.map((planet, index) => {
          // Get orbital properties
          const orbitRadius = getPlanetOrbitRadius(index);
          
          // Get orbital speeds based on real astronomical data (scaled for animation)
          const getOrbitalSpeed = (planetId) => {
            // These values are scaled for visible animation
            // Actual orbital periods range from 88 days (Mercury) to 165 years (Neptune)
            const orbitalSpeeds = {
              'mercury': 0.003, // Fastest
              'venus': 0.002,
              'earth': 0.0015,
              'mars': 0.00125,
              'jupiter': 0.00075,
              'saturn': 0.0005,
              'uranus': 0.0004,
              'neptune': 0.0003 // Slowest
            };
            
            return orbitalSpeeds[planetId] || 0.001;
          };
          
          // Determine planet size based on its actual relative size
          const planetSize = getPlanetSize(planet.id);
          
          // Get ring properties if applicable
          const ringProps = hasRings(planet.id) ? getRingProps(planet.id) : {};
          
          return (
            <PlanetOrbit
              key={`planet-orbit-${planet.id}`}
              planetId={planet.id}
              planetIndex={index}
              orbitRadius={orbitRadius}
              orbitalSpeed={getOrbitalSpeed(planet.id)}
            >
              <EnhancedPlanet 
                position={[0, 0, 0]} 
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
                <Suspense fallback={null}>
                  <MiniMoon 
                    parentPosition={[0, 0, 0]} 
                    parentSize={planetSize}
                  />
                </Suspense>
              )}
              
              {/* Add Great Red Spot to Jupiter */}
              {planet.id === 'jupiter' && (
                <Suspense fallback={null}>
                  <RedSpot 
                    parentPosition={[0, 0, 0]} 
                    parentSize={planetSize}
                  />
                </Suspense>
              )}
            </PlanetOrbit>
          );
        })}
        
        {/* Easter Egg: Dwarf Planets - Hidden from UI */}
        {dwarfPlanets.map((dwarfPlanet) => {
          // Get dwarf planet orbital speeds
          const getDwarfPlanetOrbitalSpeed = (dwarfPlanetId) => {
            const orbitalSpeeds = {
              'pluto': 0.0002,
              'ceres': 0.0009,
              'haumea': 0.00018,
              'makemake': 0.00015
            };
            
            return orbitalSpeeds[dwarfPlanetId] || 0.0005;
          };
          
          return (
            <DwarfPlanetOrbit
              key={dwarfPlanet.id}
              dwarfPlanet={dwarfPlanet}
              orbitalSpeed={getDwarfPlanetOrbitalSpeed(dwarfPlanet.id)}
            >
              {/* Ambient glow to make them more visible */}
              <pointLight 
                intensity={0.5} 
                distance={3} 
                color={dwarfPlanet.id === 'pluto' ? "#B8C0FF" : 
                       dwarfPlanet.id === 'ceres' ? "#FFD580" :
                       dwarfPlanet.id === 'haumea' ? "#E0F0FF" :
                       "#FFAA80"} 
              />
              
              <mesh
                onClick={() => handlePlanetClick(dwarfPlanet.id)}
                scale={[1.5, 1.5, 1.5]} // Make them slightly larger to be more visible
                userData={{ isEasterEgg: true }}
                onPointerOver={(e) => {
                  // Find the label and make it more visible
                  const textElement = e.object.parent.children.find(
                    child => child.type === 'Object3D' && child.userData.isLabel
                  );
                  if (textElement && textElement.material) {
                    textElement.material.opacity = 1.0;
                    textElement.material.color.set('#FFFFFF');
                  }
                }}
                onPointerOut={(e) => {
                  // Find the label and reset visibility
                  const textElement = e.object.parent.children.find(
                    child => child.type === 'Object3D' && child.userData.isLabel
                  );
                  if (textElement && textElement.material) {
                    textElement.material.opacity = 0.5;
                    textElement.material.color.set('#777777');
                  }
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
              <mesh scale={[1.8, 1.8, 1.8]}>
                <sphereGeometry args={[dwarfPlanet.size, 8, 8]} />
                <meshBasicMaterial
                  color={dwarfPlanet.color}
                  transparent={true}
                  opacity={0.15}
                  side={THREE.BackSide}
                />
              </mesh>
              
              {/* Always visible but very subtle name - with horizontal-only rotation */}
              <HorizontalText
                position={[0, dwarfPlanet.size*1.5 + 0.5, 0]} // Relative position to parent group
                fontSize={0.25} // Much smaller text
                color="#777777" // Gray color to blend with background
                anchorX="center"
                anchorY="middle"
                material-opacity={0.5} // Apply opacity directly to material
                material-transparent={true} // Ensure transparency works
                visible={true} // Always visible but hard to see
                userData={{ isLabel: true, id: dwarfPlanet.id }}
                renderOrder={10} // Ensure text renders on top
              >
                {dwarfPlanet.name}
              </HorizontalText>
            </DwarfPlanetOrbit>
          );
        })}
        
        {/* Spacecraft section - wrapped in Suspense and only loaded after main scene renders */}
        <Suspense fallback={null}>
          {/* Voyager 1 - Position relative to Jupiter's distance */}
          <Spacecraft
            position={[
              Math.cos(Math.PI * 0.2) * (getPlanetOrbitRadius(4) * 2.5), // 2.5x Jupiter's distance (automatically scaled with the new orbits)
              12, // Above the plane (increased from 8)
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
              Math.cos(Math.PI * 1.7) * (getPlanetOrbitRadius(4) * 2.2), // 2.2x Jupiter's distance (automatically scaled with the new orbits)
              -9, // Below the plane (increased from -6)
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
        </Suspense>
        
        <OrbitControls enableRotate={!isTransitioning} />
      </Canvas>
    </div>
  );
}

export default Home;