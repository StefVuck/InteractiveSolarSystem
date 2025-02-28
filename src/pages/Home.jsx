import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Text, Html } from '@react-three/drei';
import { useNavigate } from 'react-router-dom';
// Removed framer-motion import
import * as THREE from 'three';

// Asteroid Belt Component with visible particles
const AsteroidBelt = ({ innerRadius, outerRadius, count, name, color = "#AAA" }) => {
  const [asteroids, setAsteroids] = useState([]);
  
  // Generate random asteroids in a belt - limit count to avoid crashes
  useEffect(() => {
    const newAsteroids = [];
    // Limit to a maximum of 100 asteroids for performance
    const safeCount = Math.min(count, 100);
    for (let i = 0; i < safeCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = innerRadius + Math.random() * (outerRadius - innerRadius);
      const size = Math.random() * 0.1 + 0.05;
      
      newAsteroids.push({
        id: i,
        angle,
        distance,
        size,
        orbitSpeed: 0.0001 + Math.random() * 0.0002,
        y: (Math.random() - 0.5) * 1.0 // Some vertical distribution
      });
    }
    setAsteroids(newAsteroids);
  }, [innerRadius, outerRadius, count]);

  // Update asteroid positions - slower updates for better stability
  useEffect(() => {
    const interval = setInterval(() => {
      setAsteroids(prev => prev.map(asteroid => ({
        ...asteroid,
        angle: (asteroid.angle + asteroid.orbitSpeed) % (Math.PI * 2)
      })));
    }, 200); // Even slower update for stability
    
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Belt name */}
      <Html position={[0, 2, (innerRadius + outerRadius) / 2]} center>
        <div style={{
          color: 'white',
          padding: '4px',
          fontSize: '14px',
          opacity: 0.7
        }}>
          {name}
        </div>
      </Html>
    
      {/* Individual asteroids - limit to 50 for performance */}
      {asteroids.slice(0, 50).map(asteroid => {
        const x = Math.cos(asteroid.angle) * asteroid.distance;
        const z = Math.sin(asteroid.angle) * asteroid.distance;
        
        return (
          <mesh 
            key={asteroid.id} 
            position={[x, asteroid.y, z]}
          >
            <boxGeometry args={[asteroid.size, asteroid.size, asteroid.size]} />
            <meshBasicMaterial color={color} />
          </mesh>
        );
      })}
    </>
  );
};

// Facts component disabled - we'll replace it later when we've identified the stability issue
function RandomAsteroids() {
  return null;
}

// Red Spot component commented out to fix stability issues
// const RedSpot = ({ parentSize, parentPosition }) => {
//   return (
//     <mesh
//       position={[
//         parentPosition[0] + parentSize * 0.6, 
//         parentPosition[1] + parentSize * 0.1, 
//         parentPosition[2]
//       ]}
//       rotation={[0, Math.PI/2, 0]}
//     >
//       <planeGeometry args={[parentSize * 0.6, parentSize * 0.35]} />
//       <meshBasicMaterial 
//         color="#DD2200" 
//         opacity={0.9}
//         transparent
//         side={THREE.DoubleSide}
//       />
//     </mesh>
//   );
// };

// Simple orbiting Moon component
const MiniMoon = ({ parentPosition, parentSize }) => {
  const moonRef = useRef();
  const [angle, setAngle] = useState(0);
  const orbitRadius = parentSize * 2.5;
  
  // Simple orbit update using useState instead of useFrame
  useEffect(() => {
    const interval = setInterval(() => {
      setAngle((prevAngle) => (prevAngle + 0.02) % (Math.PI * 2));
    }, 50); // Update every 50ms
    
    return () => clearInterval(interval);
  }, []);
  
  // Calculate moon position based on angle
  const moonX = parentPosition[0] + Math.cos(angle) * orbitRadius;
  const moonY = parentPosition[1];
  const moonZ = parentPosition[2] + Math.sin(angle) * orbitRadius;
  
  return (
    <group>
      {/* Moon orbit path */}
      <mesh position={parentPosition} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[orbitRadius - 0.02, orbitRadius + 0.02, 32]} />
        <meshBasicMaterial color="#444444" transparent opacity={0.2} />
      </mesh>
      
      {/* Orbiting Moon */}
      <mesh ref={moonRef} position={[moonX, moonY, moonZ]}>
        <sphereGeometry args={[parentSize * 0.27, 8, 8]} />
        <meshBasicMaterial color="#C0C0C0" />
      </mesh>
    </group>
  );
};

// Enhanced Planet component with hover effect and possible rings
function EnhancedPlanet({ position, color, size = 1, name, onClick, hasRings, ringsColor, ringsRotation, planetId }) {
  // Use useRef for hover state instead of useState to avoid potential race conditions
  const hovered = useRef(false);
  const meshRef = useRef();
  const ringsRef = useRef();
  const cloudsRef = useRef();
  
  // Special treatment for Earth
  const isEarth = planetId === 'earth';
  
  // Create Earth's land regions using procedural textures with polygon style and day/night cycle
  const earthTexture = useMemo(() => {
    if (!isEarth) return null;
    
    // Create a canvas to draw on
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    // Base ocean color - deeper blue
    ctx.fillStyle = '#0a3d67';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Land masses with polygon style
    ctx.fillStyle = '#3c8c52'; // Brighter green land
    
    // North America
    ctx.beginPath();
    ctx.moveTo(190, 110);
    ctx.lineTo(225, 90);
    ctx.lineTo(260, 100);
    ctx.lineTo(285, 125);
    ctx.lineTo(280, 165);
    ctx.lineTo(250, 200);
    ctx.lineTo(225, 190);
    ctx.lineTo(200, 175);
    ctx.lineTo(190, 160);
    ctx.lineTo(185, 130);
    ctx.closePath();
    ctx.fill();
    
    // South America
    ctx.beginPath();
    ctx.moveTo(260, 275);
    ctx.lineTo(275, 300);
    ctx.lineTo(285, 350);
    ctx.lineTo(270, 390);
    ctx.lineTo(250, 410);
    ctx.lineTo(235, 395);
    ctx.lineTo(225, 340);
    ctx.lineTo(235, 300);
    ctx.lineTo(250, 275);
    ctx.closePath();
    ctx.fill();
    
    // Europe
    ctx.beginPath();
    ctx.moveTo(425, 125);
    ctx.lineTo(450, 115);
    ctx.lineTo(475, 125);
    ctx.lineTo(490, 145);
    ctx.lineTo(475, 160);
    ctx.lineTo(450, 170);
    ctx.lineTo(425, 160);
    ctx.lineTo(420, 140);
    ctx.closePath();
    ctx.fill();
    
    // Africa
    ctx.beginPath();
    ctx.moveTo(450, 190);
    ctx.lineTo(475, 175);
    ctx.lineTo(500, 185);
    ctx.lineTo(515, 225);
    ctx.lineTo(520, 275);
    ctx.lineTo(500, 325);
    ctx.lineTo(475, 350);
    ctx.lineTo(450, 335);
    ctx.lineTo(435, 300);
    ctx.lineTo(430, 260);
    ctx.lineTo(440, 225);
    ctx.closePath();
    ctx.fill();
    
    // Asia
    ctx.beginPath();
    ctx.moveTo(490, 150);
    ctx.lineTo(525, 135);
    ctx.lineTo(575, 125);
    ctx.lineTo(650, 140);
    ctx.lineTo(700, 165);
    ctx.lineTo(725, 190);
    ctx.lineTo(710, 225);
    ctx.lineTo(675, 235);
    ctx.lineTo(625, 225);
    ctx.lineTo(575, 215);
    ctx.lineTo(540, 200);
    ctx.lineTo(500, 175);
    ctx.closePath();
    ctx.fill();
    
    // Australia
    ctx.beginPath();
    ctx.moveTo(775, 325);
    ctx.lineTo(800, 315);
    ctx.lineTo(840, 325);
    ctx.lineTo(860, 350);
    ctx.lineTo(850, 375);
    ctx.lineTo(825, 390);
    ctx.lineTo(800, 380);
    ctx.lineTo(785, 360);
    ctx.lineTo(780, 340);
    ctx.closePath();
    ctx.fill();
    
    // Ice caps with polygon style
    ctx.fillStyle = '#f0f0f0'; // Snow white
    
    // Antarctica - polygon ring around the bottom
    ctx.beginPath();
    const centerX = 512;
    const centerY = 450;
    const radius = 60;
    const sides = 12; // Number of sides for the polygon
    
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
    const npCenterX = 512;
    const npCenterY = 60;
    const npRadius = 75;
    const npSides = 12;
    
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
    ctx.moveTo(350, 90);
    ctx.lineTo(375, 80);
    ctx.lineTo(390, 90);
    ctx.lineTo(395, 105);
    ctx.lineTo(385, 120);
    ctx.lineTo(370, 125);
    ctx.lineTo(355, 115);
    ctx.lineTo(350, 100);
    ctx.closePath();
    ctx.fill();
    
    // Create a texture from the canvas
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    
    return texture;
  }, [isEarth]);
  
  // Track day/night cycle for Earth
  const dayNightRef = useRef(0);
  
  // Create cloud texture with minimal clouds using polygon shapes
  const cloudTexture = useMemo(() => {
    if (!isEarth) return null;
    
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
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
          [250, 150], [275, 140], [300, 150], 
          [310, 170], [290, 190], [260, 185], [245, 170]
        ]
      },
      // Formation 2 - South Atlantic
      {
        points: [
          [325, 300], [350, 290], [370, 300], 
          [365, 325], [345, 335], [320, 325]
        ]
      },
      // Formation 3 - Europe/Atlantic
      {
        points: [
          [400, 150], [420, 140], [440, 145],
          [445, 165], [430, 175], [410, 170], [395, 160]
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
    const smallClouds = 4; // Very few clouds
    for (let i = 0; i < smallClouds; i++) {
      const centerX = Math.random() * canvas.width;
      const centerY = Math.random() * canvas.height;
      const sides = Math.floor(Math.random() * 3) + 5; // 5-7 sides
      const radius = Math.random() * 20 + 10;
      
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
  }, [isEarth]);
  
  // Add rotation animation and day/night cycle
  useFrame((state) => {
    if (meshRef.current) {
      // Different rotation speeds for different planets based on real-world data
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
      
      meshRef.current.rotation.y += rotationSpeeds[planetId] || 0.01;
      
      // We're keeping this simple now
      if (isEarth && meshRef.current && meshRef.current.material) {
        // Plain Earth with fixed appearance
        meshRef.current.material.emissiveIntensity = 0.15;
      }
    }
    
    // Rotate rings if present
    if (ringsRef.current) {
      ringsRef.current.rotation.z += 0.002;
    }
    
    // Rotate clouds a bit faster than the planet
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += 0.006;
    }
  });
  
  return (
    <group>
      {isEarth ? (
        // Earth with textures
        <>
          <mesh 
            ref={meshRef}
            position={position} 
            onClick={onClick}
            onPointerOver={() => { hovered.current = true }}
            onPointerOut={() => { hovered.current = false }}
          >
            <sphereGeometry args={[size, 32, 32]} />
            <meshStandardMaterial 
              map={earthTexture}
              roughness={0.6}
              metalness={0.1}
              emissive="#6B93D6" 
              emissiveIntensity={0.15}
            />
          </mesh>
          
          {/* Cloud layer with fewer, polygon clouds */}
          <mesh 
            ref={cloudsRef} 
            position={position}
          >
            <sphereGeometry args={[size * 1.02, 32, 32]} />
            <meshStandardMaterial 
              map={cloudTexture}
              transparent={true}
              opacity={0.4}
              depthWrite={false}
            />
          </mesh>
          
          {/* Atmosphere glow */}
          <mesh position={position}>
            <sphereGeometry args={[size * 1.05, 16, 16]} />
            <meshBasicMaterial 
              color="#6ca6ff" 
              transparent={true} 
              opacity={0.1} 
              side={THREE.BackSide}
            />
          </mesh>
        </>
      ) : (
        // Regular planet
        <mesh 
          ref={meshRef}
          position={position} 
          onClick={onClick}
          onPointerOver={() => { hovered.current = true }}
          onPointerOut={() => { hovered.current = false }}
        >
          <icosahedronGeometry args={[size, 1]} />
          <meshLambertMaterial 
            color={color} 
            emissive={color} 
            emissiveIntensity={0.25}
          />
        </mesh>
      )}
      
      {/* Rings if applicable */}
      {hasRings && (
        <mesh 
          ref={ringsRef}
          position={position} 
          rotation={ringsRotation || [Math.PI / 4, 0, 0]}
        >
          <ringGeometry args={[size * 1.3, size * 2.2, 64]} />
          <meshBasicMaterial 
            color={ringsColor || color} 
            side={THREE.DoubleSide}
            transparent={true}
            opacity={0.7}
          />
        </mesh>
      )}
      
      {/* Show planet name on hover */}
      {hovered && (
        <Text
          position={[position[0], position[1] + size + 0.5, position[2]]}
          fontSize={0.5}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.05}
          outlineColor="#000000"
        >
          {name}
        </Text>
      )}
    </group>
  );
}

// Home component with solar system
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
      5,      // Mercury - closer to sun
      7.5,    // Venus
      10,     // Earth
      13,     // Mars
      21,     // Jupiter (after asteroid belt)
      26,     // Saturn
      32,     // Uranus
      38      // Neptune
    ];
    
    return distances[index] || (5 + index * 4);
  };
  
  // Check if planet has rings
  const hasRings = (planetId) => {
    return ['saturn', 'uranus'].includes(planetId);
  };
  
  // Get ring properties
  const getRingProps = (planetId) => {
    if (planetId === 'saturn') {
      return {
        ringsColor: '#F4D59C',
        ringsRotation: [Math.PI / 4, 0, 0]
      };
    } else if (planetId === 'uranus') {
      return {
        ringsColor: '#AAD3F2',
        ringsRotation: [0, 0, Math.PI / 2] // Vertical rings for Uranus
      };
    }
    return {};
  };
  
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
        <ambientLight intensity={1.0} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        
        {/* Sun */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[2.8, 32, 32]} />
          <meshBasicMaterial color="#FFFF00" />
        </mesh>
        
        {/* Subtle sun glow */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[3.2, 32, 32]} />
          <meshBasicMaterial color="#FFFF00" transparent opacity={0.2} />
        </mesh>
        
        {/* Background stars - minimal count for stability */}
        <Stars radius={100} depth={50} count={800} factor={2} saturation={0} />
        
        {/* Asteroid Belts */}
        {/* Main Belt between Mars and Jupiter */}
        <AsteroidBelt 
          innerRadius={16} 
          outerRadius={19} 
          count={40} 
          name="Main Asteroid Belt" 
        />
        
        {/* Kuiper Belt beyond Neptune */}
        <AsteroidBelt 
          innerRadius={42} 
          outerRadius={50} 
          count={30} 
          name="Kuiper Belt" 
          color="#777777"
        />
        
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
                {...ringProps}
              />
              
              {/* Add moon to Earth */}
              {planet.id === 'earth' && (
                <MiniMoon 
                  parentPosition={[x, 0, z]} 
                  parentSize={planetSize} 
                />
              )}
            </group>
          );
        })}
        
        <OrbitControls enableRotate={!isTransitioning} />
      </Canvas>
    </div>
  );
}

export default Home;