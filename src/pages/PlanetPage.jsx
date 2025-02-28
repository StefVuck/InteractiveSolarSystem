import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Stars, Text } from '@react-three/drei';
import { useParams, useNavigate } from 'react-router-dom';
// Removed framer-motion import
import * as THREE from 'three';

// Simplified orbiting Moon component
const Moon = () => {
  const moonRef = useRef();
  const [angle, setAngle] = useState(0);
  const orbitRadius = 4;
  
  // Simple orbit update using useState instead of useFrame
  useEffect(() => {
    const interval = setInterval(() => {
      setAngle((prevAngle) => (prevAngle + 0.01) % (Math.PI * 2));
    }, 50); // Update every 50ms for smoother animation
    
    return () => clearInterval(interval);
  }, []);
  
  // Calculate position based on angle
  const x = Math.cos(angle) * orbitRadius;
  const z = Math.sin(angle) * orbitRadius;
  
  return (
    <mesh ref={moonRef} position={[x, 0, z]}>
      <sphereGeometry args={[0.5, 16, 16]} />
      <meshBasicMaterial color="#C0C0C0" />
    </mesh>
  );
};

// Enhanced planet detail component
const DetailedPlanet = ({ color, planetId, onMoonClick }) => {
  const meshRef = useRef();
  const ringsRef = useRef();
  const cloudsRef = useRef();
  
  // Special rendering for Earth with continents and clouds
  const isEarth = planetId === 'earth';
  
  // Create Earth's land regions using procedural textures with polygon style
  const createEarthTexture = () => {
    // Create a canvas to draw on
    const canvas = document.createElement('canvas');
    canvas.width = 2048; // Higher resolution
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    
    // Base ocean color - deeper blue
    ctx.fillStyle = '#0a3d67';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Land masses with polygon style
    ctx.fillStyle = '#3c8c52'; // Brighter green land
    
    // North America
    ctx.beginPath();
    ctx.moveTo(380, 220);  // Starting point
    ctx.lineTo(450, 180);  // Upper part
    ctx.lineTo(520, 200);
    ctx.lineTo(570, 250);  // East coast
    ctx.lineTo(560, 330);
    ctx.lineTo(500, 400);  // Mexico
    ctx.lineTo(450, 380);
    ctx.lineTo(400, 350);  // West coast
    ctx.lineTo(380, 320);
    ctx.lineTo(370, 260);
    ctx.closePath();       // Complete the shape
    ctx.fill();
    
    // South America
    ctx.beginPath();
    ctx.moveTo(520, 550);
    ctx.lineTo(550, 600);
    ctx.lineTo(570, 700);
    ctx.lineTo(540, 780);
    ctx.lineTo(500, 820);
    ctx.lineTo(470, 790);
    ctx.lineTo(450, 680);
    ctx.lineTo(470, 600);
    ctx.lineTo(500, 550);
    ctx.closePath();
    ctx.fill();
    
    // Europe
    ctx.beginPath();
    ctx.moveTo(850, 250);
    ctx.lineTo(900, 230);
    ctx.lineTo(950, 250);
    ctx.lineTo(980, 290);
    ctx.lineTo(950, 320);
    ctx.lineTo(900, 340);
    ctx.lineTo(850, 320);
    ctx.lineTo(840, 280);
    ctx.closePath();
    ctx.fill();
    
    // Africa
    ctx.beginPath();
    ctx.moveTo(900, 380);
    ctx.lineTo(950, 350);
    ctx.lineTo(1000, 370);
    ctx.lineTo(1030, 450);
    ctx.lineTo(1040, 550);
    ctx.lineTo(1000, 650);
    ctx.lineTo(950, 700);
    ctx.lineTo(900, 670);
    ctx.lineTo(870, 600);
    ctx.lineTo(860, 520);
    ctx.lineTo(880, 450);
    ctx.closePath();
    ctx.fill();
    
    // Asia
    ctx.beginPath();
    ctx.moveTo(980, 300);
    ctx.lineTo(1050, 270);
    ctx.lineTo(1150, 250);
    ctx.lineTo(1300, 280);
    ctx.lineTo(1400, 330);
    ctx.lineTo(1450, 380);
    ctx.lineTo(1420, 450);
    ctx.lineTo(1350, 470);
    ctx.lineTo(1250, 450);
    ctx.lineTo(1150, 430);
    ctx.lineTo(1080, 400);
    ctx.lineTo(1000, 350);
    ctx.closePath();
    ctx.fill();
    
    // India
    ctx.beginPath();
    ctx.moveTo(1150, 430);
    ctx.lineTo(1200, 450);
    ctx.lineTo(1220, 500);
    ctx.lineTo(1200, 550);
    ctx.lineTo(1150, 570);
    ctx.lineTo(1120, 530);
    ctx.lineTo(1130, 470);
    ctx.closePath();
    ctx.fill();
    
    // Australia
    ctx.beginPath();
    ctx.moveTo(1550, 650);
    ctx.lineTo(1600, 630);
    ctx.lineTo(1680, 650);
    ctx.lineTo(1720, 700);
    ctx.lineTo(1700, 750);
    ctx.lineTo(1650, 780);
    ctx.lineTo(1600, 760);
    ctx.lineTo(1570, 720);
    ctx.lineTo(1560, 680);
    ctx.closePath();
    ctx.fill();
    
    // Ice caps with polygon style
    ctx.fillStyle = '#f0f0f0'; // Snow white
    
    // Antarctica - polygon ring around the bottom
    ctx.beginPath();
    const centerX = 1024;
    const centerY = 900;
    const radius = 120;
    const sides = 16; // Number of sides for the polygon
    
    for (let i = 0; i < sides; i++) {
      const angle = (i / sides) * Math.PI * 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    
    ctx.closePath();
    ctx.fill();
    
    // North pole - polygon
    ctx.beginPath();
    const npCenterX = 1024;
    const npCenterY = 120;
    const npRadius = 150;
    const npSides = 16;
    
    for (let i = 0; i < npSides; i++) {
      const angle = (i / npSides) * Math.PI * 2;
      const x = npCenterX + Math.cos(angle) * npRadius;
      const y = npCenterY + Math.sin(angle) * npRadius;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    
    ctx.closePath();
    ctx.fill();
    
    // Greenland - polygon
    ctx.beginPath();
    ctx.moveTo(700, 180);
    ctx.lineTo(750, 160);
    ctx.lineTo(780, 180);
    ctx.lineTo(790, 210);
    ctx.lineTo(770, 240);
    ctx.lineTo(740, 250);
    ctx.lineTo(710, 230);
    ctx.lineTo(700, 200);
    ctx.closePath();
    ctx.fill();
    
    // Create a texture from the canvas
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    
    return texture;
  };
  
  // Create cloud texture with minimal clouds using polygon shapes
  const createCloudTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    
    // Clear background to transparent
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw polygonal cloud formations
    ctx.fillStyle = '#ffffff';
    
    // Just a few cloud formations with sharp polygon shapes
    const cloudFormations = [
      // Formation 1 - North Pacific
      {
        points: [
          [500, 300], [550, 280], [600, 300], 
          [620, 340], [580, 380], [520, 370], [490, 340]
        ]
      },
      // Formation 2 - South Atlantic
      {
        points: [
          [650, 600], [700, 580], [740, 600], 
          [730, 650], [690, 670], [640, 650]
        ]
      },
      // Formation 3 - Europe/Atlantic
      {
        points: [
          [800, 300], [840, 280], [880, 290],
          [890, 330], [860, 350], [820, 340], [790, 320]
        ]
      },
      // Formation 4 - Indian Ocean
      {
        points: [
          [1100, 600], [1150, 580], [1200, 590],
          [1220, 630], [1180, 660], [1130, 650], [1090, 630]
        ]
      },
      // Formation 5 - Pacific
      {
        points: [
          [1500, 400], [1550, 380], [1600, 400],
          [1580, 450], [1520, 470], [1480, 440]
        ]
      }
    ];
    
    // Draw each cloud formation as a polygon
    cloudFormations.forEach(formation => {
      ctx.beginPath();
      const { points } = formation;
      
      ctx.moveTo(points[0][0], points[0][1]);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i][0], points[i][1]);
      }
      
      ctx.closePath();
      ctx.fill();
    });
    
    // Add a few smaller polygon clouds
    const smallClouds = 8; // Very few clouds
    for (let i = 0; i < smallClouds; i++) {
      const centerX = Math.random() * canvas.width;
      const centerY = Math.random() * canvas.height;
      const sides = Math.floor(Math.random() * 3) + 5; // 5-7 sides
      const radius = Math.random() * 40 + 20;
      
      ctx.beginPath();
      
      for (let j = 0; j < sides; j++) {
        const angle = (j / sides) * Math.PI * 2;
        // Add some randomness to the radius for each point
        const pointRadius = radius * (0.8 + Math.random() * 0.4);
        const x = centerX + Math.cos(angle) * pointRadius;
        const y = centerY + Math.sin(angle) * pointRadius;
        
        if (j === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      
      ctx.closePath();
      ctx.fill();
    }
    
    // Create a texture from the canvas
    const texture = new THREE.CanvasTexture(canvas);
    texture.transparent = true;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    
    return texture;
  };
  
  // Create vertex displacement for surface detail
  useEffect(() => {
    if (meshRef.current && !isEarth) {  // Skip for Earth as it uses textures
      const geometry = meshRef.current.geometry;
      const positionAttribute = geometry.getAttribute('position');
      const vertex = new THREE.Vector3();
      
      // Different displacement patterns for different planet types
      const getDisplacement = (x, y, z) => {
        if (['mercury', 'mars', 'moon'].includes(planetId)) {
          // Rocky planets have more craters
          return Math.sin(x * 8) * Math.cos(y * 8) * Math.sin(z * 8) * 0.15;
        } else if (['venus'].includes(planetId)) {
          // Venus has volcanic features
          return Math.sin(x * 5) * Math.cos(y * 5) * Math.sin(z * 5) * 0.1;
        } else if (['jupiter', 'saturn'].includes(planetId)) {
          // Gas giants have bands
          return Math.sin(y * 15) * 0.05;
        } else {
          // Ice giants
          return Math.sin(x * 3) * Math.cos(z * 3) * 0.08;
        }
      };
      
      // Apply noise to each vertex
      for (let i = 0; i < positionAttribute.count; i++) {
        vertex.fromBufferAttribute(positionAttribute, i);
        const originalLength = vertex.length();
        
        // Generate displacement based on position
        const displacement = getDisplacement(
          vertex.x, 
          vertex.y, 
          vertex.z
        );
        
        // Apply displacement
        vertex.normalize().multiplyScalar(originalLength * (1 + displacement));
        positionAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
      }
      
      geometry.computeVertexNormals();
    }
  }, [planetId, isEarth]);
  
  // Rotate the planet
  useFrame((state) => {
    if (meshRef.current) {
      // Different rotation speeds for different planets based on real data
      const rotationSpeeds = {
        'jupiter': 0.009, // Fast spinner
        'saturn': 0.008,  // Also fast
        'uranus': 0.006,  // Medium
        'neptune': 0.005, // Medium
        'earth': 0.004,   // Slower
        'mars': 0.004,    // Similar to Earth
        'venus': -0.001,  // Very slow, retrograde rotation
        'mercury': 0.002  // Very slow
      };
      
      meshRef.current.rotation.y += rotationSpeeds[planetId] || 0.005;
      
      // Add a slight wobble for gas giants
      if (['jupiter', 'saturn'].includes(planetId)) {
        meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.02;
      }
      
      // Simplified day/night cycle
      if (isEarth && meshRef.current.material) {
        // Just update emissive intensity for a subtle day/night effect
        meshRef.current.material.emissiveIntensity = 0.2;
      }
    }
    
    // Rotate rings if present
    if (ringsRef.current) {
      ringsRef.current.rotation.z += 0.001;
    }
    
    // Rotate clouds a bit faster than the planet
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += 0.006;
    }
  });
  
  // Get size for the planet
  const getSize = () => {
    return 2; // All planets are same size in detail view
  };
  
  // Configure detail level based on planet
  const getDetailLevel = () => {
    return planetId === 'earth' ? 64 : 3; // Higher resolution sphere for Earth
  };
  
  // Determine if planet has rings
  const hasRings = () => {
    return ['saturn', 'uranus'].includes(planetId);
  };
  
  // Get ring properties
  const getRingProps = () => {
    if (planetId === 'saturn') {
      return {
        innerRadius: 2.5,
        outerRadius: 4,
        color: '#F4D59C',
        rotation: [Math.PI / 4, 0, 0],
        opacity: 0.7
      };
    } else if (planetId === 'uranus') {
      return {
        innerRadius: 2.3,
        outerRadius: 3,
        color: '#AAD3F2',
        rotation: [0, 0, Math.PI / 2], // Vertical rings for Uranus
        opacity: 0.25 // Fainter rings
      };
    }
    return null;
  };
  
  const ringProps = hasRings() ? getRingProps() : null;
  
  // Day/night cycle for Earth
  const dayNightRef = useRef(0);
  
  // Create Earth textures
  const earthTexture = isEarth ? createEarthTexture() : null;
  const cloudTexture = isEarth ? createCloudTexture() : null;
  
  return (
    <group>
      {/* Planet */}
      {isEarth ? (
        // Earth with textures
        <>
          <mesh ref={meshRef}>
            <sphereGeometry args={[getSize(), 64, 64]} />
            <meshStandardMaterial 
              map={earthTexture}
              roughness={0.7}
              metalness={0.2}
              emissive="#6ca6ff"
              emissiveIntensity={0.2}
            />
          </mesh>
          
          {/* Cloud layer - with fewer, polygon-shaped clouds */}
          <mesh ref={cloudsRef} position={[0, 0, 0]}>
            <sphereGeometry args={[getSize() * 1.02, 64, 64]} />
            <meshStandardMaterial 
              map={cloudTexture}
              transparent={true}
              opacity={0.5}
              depthWrite={false}
            />
          </mesh>
          
          {/* Atmosphere glow */}
          <mesh>
            <sphereGeometry args={[getSize() * 1.1, 32, 32]} />
            <meshBasicMaterial 
              color="#6ca6ff" 
              transparent={true} 
              opacity={0.15} 
              side={THREE.BackSide}
            />
          </mesh>
          
          {/* Static Moon */}
          <Moon />
          
          {/* Moon orbit path */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[4 - 0.05, 4 + 0.05, 32]} />
            <meshBasicMaterial color="#444444" transparent opacity={0.3} />
          </mesh>

          {/* Moon button */}
          <group position={[0, 3.5, 0]}>
            <mesh onClick={(e) => {
              e.stopPropagation();
              if (onMoonClick) onMoonClick();
            }}>
              <planeGeometry args={[3, 0.7]} />
              <meshBasicMaterial transparent opacity={0.7} color="#111133" />
            </mesh>
            <Text
              position={[0, 0, 0.1]}
              fontSize={0.3}
              color="white"
              anchorX="center"
              anchorY="middle"
            >
              Visit Moon
            </Text>
          </group>
        </>
      ) : (
        // Other planets with procedural geometry
        <mesh ref={meshRef}>
          <icosahedronGeometry args={[getSize(), getDetailLevel()]} />
          <meshStandardMaterial 
            color={color} 
            emissive={color} 
            emissiveIntensity={0.2}
            roughness={0.8}
            metalness={0.2}
            flatShading
          />
        </mesh>
      )}
      
      {/* Rings if applicable */}
      {ringProps && (
        <mesh 
          ref={ringsRef} 
          rotation={ringProps.rotation}
        >
          <ringGeometry args={[ringProps.innerRadius, ringProps.outerRadius, 128]} />
          <meshPhongMaterial 
            color={ringProps.color} 
            side={THREE.DoubleSide} 
            transparent={true} 
            opacity={ringProps.opacity}
            flatShading={true}
          />
        </mesh>
      )}
    </group>
  );
};

// Moon page with more 3D-like styling to match other pages
const MoonPage = ({ onBackClick }) => {
  return (
    <div className="planet-page moon-page">
      <div className="planet-info">
        <h1>The Moon</h1>
        <p>Earth's only natural satellite and the fifth largest moon in the solar system. The Moon's presence helps stabilize our planet's wobble and moderate our climate. Its surface is cratered and barren with regolith covering a rocky surface.</p>
        <button className="back-button" onClick={onBackClick}>
          ← Back to Earth
        </button>
      </div>
      
      <div style={{ width: '100%', height: 'calc(100vh - 140px)', backgroundColor: '#000', overflow: 'hidden', position: 'relative' }}>
        {/* Stars background */}
        {Array.from({ length: 200 }, (_, i) => (
          <div 
            key={i}
            style={{
              position: 'absolute',
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
              backgroundColor: '#fff',
              borderRadius: '50%',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.8 + 0.2
            }}
          />
        ))}
        
        {/* Moon with craters */}
        <div style={{ 
          position: 'absolute', 
          left: '50%', 
          top: '50%', 
          transform: 'translate(-50%, -50%)', 
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, #DDDDDD 10%, #AAAAAA 70%, #888888 100%)',
          boxShadow: '0 0 20px 5px rgba(255,255,255,0.3)'
        }}>
          {/* Render some craters */}
          {Array.from({ length: 20 }, (_, i) => {
            const size = Math.random() * 30 + 10;
            const left = Math.random() * 80 + 10; 
            const top = Math.random() * 80 + 10;
            const opacity = Math.random() * 0.2 + 0.1;
            
            return (
              <div 
                key={i}
                style={{
                  position: 'absolute',
                  width: `${size}px`,
                  height: `${size}px`,
                  borderRadius: '50%',
                  backgroundColor: '#888',
                  left: `${left}%`,
                  top: `${top}%`,
                  opacity,
                  boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.3)'
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Planet detail page
function PlanetPage({ planets }) {
  const { planetId } = useParams();
  const navigate = useNavigate();
  const [showMoon, setShowMoon] = useState(false);
  const planet = planets.find(p => p.id === planetId) || planets[0];
  
  // Add animation effect when leaving the page
  const handleBackClick = () => {
    navigate('/');
  };
  
  // Toggle moon view
  const handleMoonClick = () => {
    setShowMoon(true);
  };
  
  // Return from moon to Earth
  const handleBackFromMoon = () => {
    setShowMoon(false);
  };
  
  return (
    <div className="planet-page">
      {showMoon ? (
        // Show Moon page when moon is selected
        <MoonPage onBackClick={handleBackFromMoon} />
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
                alpha: false
              }}>
              <ambientLight intensity={0.8} />
              <pointLight position={[5, 5, 5]} intensity={1.0} />
              <pointLight position={[-5, -5, -5]} intensity={0.5} />
              
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
              <DetailedPlanet 
                color={planet.color} 
                planetId={planet.id} 
                onMoonClick={planet.id === 'earth' ? handleMoonClick : undefined} 
              />
              
              <Stars radius={100} depth={50} count={500} factor={2} />
              <OrbitControls autoRotate={true} autoRotateSpeed={0.5} />
            </Canvas>
          </div>
        </>
      )}
    </div>
  );
}

export default PlanetPage;