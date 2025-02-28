import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Text, Html } from '@react-three/drei';
import { useNavigate } from 'react-router-dom';
// Removed framer-motion import
import * as THREE from 'three';
import OrbitingFacts from '../components/OrbitingFacts';
import astronomyFacts from '../data/astronomyFacts';

// Asteroid Belt Component with visible particles
const AsteroidBelt = ({ innerRadius, outerRadius, count, name, color = "#AAA" }) => {
  const [asteroids, setAsteroids] = useState([]);
  
  // Generate random asteroids in a belt - limit count to avoid crashes
  useEffect(() => {
    const newAsteroids = [];
    // Limit to a maximum of 1000 asteroids for performance
    const safeCount = Math.min(count, 1000);
    for (let i = 0; i < safeCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = innerRadius + Math.random() * (outerRadius - innerRadius);
      const size = Math.random() * 0.2 + 0.05;
      
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
      {asteroids.map(asteroid => {
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

// Jupiter's Great Red Spot component - simpler implementation
const RedSpot = ({ parentSize, parentPosition }) => {
  const spotRef = useRef();
  
  useFrame(() => {
    if (spotRef.current) {
      // Adjust spot position to maintain position relative to Jupiter
      spotRef.current.position.set(
        parentPosition[0], 
        parentPosition[1], 
        parentPosition[2]
      );
      
      // Slowly rotate the spot to simulate Jupiter's rotation
      spotRef.current.rotation.y += 0.0075;
    }
  });
  
  return (
    // Use a simple mesh with direct material and color for stability
    <mesh ref={spotRef} position={parentPosition}>
      <sphereGeometry args={[parentSize * 1.015, 16, 16]} /> {/* Slightly larger to ensure visibility */}
      <meshBasicMaterial 
        color="#aa2211"
        transparent
        opacity={0.9}
        alphaTest={0.1}
        side={THREE.FrontSide}
        map={createSpotTexture()}
        depthWrite={false} // Prevents z-fighting with the bands
      />
    </mesh>
  );
};

// Create a simple texture for Jupiter's Great Red Spot
const createSpotTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  
  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Set background transparent
  ctx.fillStyle = 'rgba(0, 0, 0, 0)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw a more circular spot shape below the equator
  ctx.fillStyle = 'rgba(170, 34, 17, 1.0)';
  ctx.beginPath();
  ctx.ellipse(
    canvas.width * 0.18,    // x at 18% position
    canvas.height * 0.65,   // y at 65% (below center/equator)
    canvas.width * 0.07,    // radiusX - more circular width
    canvas.height * 0.065,  // radiusY - more circular height
    0,                      // rotation
    0,                      // start angle
    Math.PI * 2             // end angle
  );
  ctx.fill();
  
  // Create a texture from the canvas
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  
  return texture;
};

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

// Create texture for Jupiter's bands
const createJupiterTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  
  // Base color
  ctx.fillStyle = '#E3B982';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Create horizontal bands with varying colors
  const bands = [
    { y: 0.15, height: 0.1, color: '#d6ae79' },    // Lighter band near top
    { y: 0.3, height: 0.05, color: '#c19055' },    // Darker band
    { y: 0.4, height: 0.05, color: '#e8c090' },    // Light band
    { y: 0.5, height: 0.05, color: '#c19055' },    // Dark band at equator
    { y: 0.6, height: 0.05, color: '#e8c090' },    // Light band
    { y: 0.7, height: 0.1, color: '#c19055' },     // Darker band
    { y: 0.85, height: 0.1, color: '#d6ae79' }     // Lighter band near bottom
  ];
  
  // Draw the bands
  bands.forEach(band => {
    ctx.fillStyle = band.color;
    ctx.fillRect(0, canvas.height * band.y, canvas.width, canvas.height * band.height);
  });
  
  // Add some subtle texture/turbulence to the bands
  for (let i = 0; i < 100; i++) {
    const y = Math.random() * canvas.height;
    const bandIndex = bands.findIndex(band => 
      y >= band.y * canvas.height && y < (band.y + band.height) * canvas.height
    );
    
    if (bandIndex >= 0) {
      // Determine which band we're in and use a slightly lighter/darker color
      const bandColor = bands[bandIndex].color;
      const shade = Math.random() < 0.5 ? 20 : -20;
      
      // Convert hex to RGB and adjust
      const r = parseInt(bandColor.slice(1, 3), 16) + shade;
      const g = parseInt(bandColor.slice(3, 5), 16) + shade;
      const b = parseInt(bandColor.slice(5, 7), 16) + shade;
      
      // Draw a small turbulence swirl
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.beginPath();
      const width = Math.random() * 100 + 50;
      const height = Math.random() * 10 + 5;
      ctx.ellipse(
        Math.random() * canvas.width,
        y,
        width,
        height,
        0, 0, Math.PI * 2
      );
      ctx.fill();
    }
  }
  
  // Create the texture
  return new THREE.CanvasTexture(canvas);
};

// Enhanced Planet component with hover effect and possible rings
function EnhancedPlanet({ position, color, size = 1, name, onClick, hasRings, ringsColor, ringsRotation, ringsTexture, ringsOpacity, planetId }) {
  // Use useRef for hover state instead of useState to avoid potential race conditions
  const hovered = useRef(false);
  const meshRef = useRef();
  const ringsRef = useRef();
  const cloudsRef = useRef();
  const rotation = useRef(0); // Track rotation for the Great Red Spot
  
  // Create Jupiter's texture with bands if this is Jupiter
  const jupiterTexture = useMemo(() => {
    if (planetId === 'jupiter') {
      return createJupiterTexture();
    }
    return null;
  }, [planetId]);
  
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
      
      const rotationSpeed = rotationSpeeds[planetId] || 0.01;
      meshRef.current.rotation.y += rotationSpeed;
      rotation.current = meshRef.current.rotation.y; // Track current rotation
      
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
      ) : planetId === 'jupiter' ? (
        // Jupiter with banded texture
        <mesh 
          ref={meshRef}
          position={position} 
          onClick={onClick}
          onPointerOver={() => { hovered.current = true }}
          onPointerOut={() => { hovered.current = false }}
        >
          <sphereGeometry args={[size, 32, 32]} />
          <meshStandardMaterial 
            map={jupiterTexture}
            roughness={0.8}
            metalness={0.1}
            emissive="#E3B982" 
            emissiveIntensity={0.1}
          />
        </mesh>
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
          <meshStandardMaterial 
            color={color} 
            emissive={color} 
            emissiveIntensity={0.15}
            roughness={0.8}
            metalness={0.1}
            side={THREE.FrontSide}
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
          <ringGeometry args={[size * 1.3, size * 2.2, 128]} />
          {planetId === 'saturn' ? (
            <meshBasicMaterial 
              map={ringsTexture}
              color="#FFFFFF" 
              side={THREE.DoubleSide}
              transparent={true}
              opacity={ringsOpacity || 1.0}
              alphaTest={0.1} // Prevents rendering fully transparent pixels
            />
          ) : (
            <meshBasicMaterial 
              color={ringsColor || color} 
              side={THREE.DoubleSide}
              transparent={true}
              opacity={ringsOpacity || 0.7}
            />
          )}
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
  
  // Create Saturn's ring texture
  const createSaturnRingsTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas with full transparency
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Create ring bands with varying opacities and colors
    const rings = [
      { radius: 0.55, width: 0.03, color: 'rgba(180, 140, 100, 0.05)', name: 'D Ring' },
      { radius: 0.58, width: 0.03, color: 'rgba(210, 180, 130, 0.1)', name: 'C Ring' },
      { radius: 0.61, width: 0.01, color: 'rgba(100, 80, 60, 0.15)', name: 'Maxwell Gap' },
      { radius: 0.62, width: 0.05, color: 'rgba(210, 180, 130, 0.3)', name: 'B Ring (inner)' },
      { radius: 0.67, width: 0.05, color: 'rgba(240, 220, 170, 0.7)', name: 'B Ring (middle)' },
      { radius: 0.72, width: 0.03, color: 'rgba(220, 190, 140, 0.5)', name: 'B Ring (outer)' },
      { radius: 0.75, width: 0.02, color: 'rgba(150, 130, 100, 0.1)', name: 'Cassini Division' },
      { radius: 0.77, width: 0.08, color: 'rgba(240, 210, 160, 0.4)', name: 'A Ring' },
      { radius: 0.85, width: 0.01, color: 'rgba(120, 100, 80, 0.05)', name: 'Encke Gap' },
      { radius: 0.86, width: 0.04, color: 'rgba(220, 190, 150, 0.2)', name: 'A Ring (outer)' },
      { radius: 0.91, width: 0.04, color: 'rgba(200, 170, 130, 0.05)', name: 'F Ring' }
    ];
    
    // Draw center of the canvas as transparent
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const maxRadius = Math.min(centerX, centerY);
    
    // Draw the ring bands as concentric circles
    rings.forEach(ring => {
      const innerRadius = ring.radius * maxRadius;
      const outerRadius = (ring.radius + ring.width) * maxRadius;
      
      // Create a radial gradient for each ring
      const gradient = ctx.createRadialGradient(
        centerX, centerY, innerRadius,
        centerX, centerY, outerRadius
      );
      
      gradient.addColorStop(0, ring.color);
      
      // Add some variation within each ring - safely parse colors
      const colorMatch = ring.color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
      if (colorMatch) {
        const r = parseInt(colorMatch[1]);
        const g = parseInt(colorMatch[2]);
        const b = parseInt(colorMatch[3]);
        const a = parseFloat(colorMatch[4]);
        
        // Safely create middle color with adjusted opacity
        gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${a * 0.9})`);
        
        // Safely create end color with adjusted opacity
        gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, ${a * 0.7})`);
      } else {
        // Fallback if parsing fails
        gradient.addColorStop(0.5, ring.color);
        gradient.addColorStop(1, ring.color);
      }
      
      // Draw the ring
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
      ctx.arc(centerX, centerY, outerRadius, 0, Math.PI * 2, true);
      ctx.fill();
    });
    
    // Add some particle detail/grain to the rings
    const numParticles = 5000;
    for (let i = 0; i < numParticles; i++) {
      // Random angle and distance from center
      const angle = Math.random() * Math.PI * 2;
      const minRadius = 0.55 * maxRadius; // Inner edge of rings
      const maxRingRadius = 0.95 * maxRadius; // Outer edge of rings
      const distance = minRadius + Math.random() * (maxRingRadius - minRadius);
      
      // Calculate position
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;
      
      // Vary particle brightness based on ring section
      const ringSection = rings.find(ring => {
        const r = distance / maxRadius;
        return r >= ring.radius && r < (ring.radius + ring.width);
      });
      
      let opacity = 0.7;
      if (ringSection) {
        // Extract opacity from the rgba color - safer parsing
        const match = ringSection.color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
        if (match) {
          opacity = parseFloat(match[4]) * (Math.random() * 0.5 + 0.5);
        }
      }
      
      // Draw a small particle
      const size = Math.random() * 1.5 + 0.5;
      ctx.fillStyle = `rgba(255, 240, 220, ${opacity})`;
      ctx.fillRect(x - size/2, y - size/2, size, size);
    }
    
    // Add radial streaks for a more dynamic appearance
    const numStreaks = 200;
    for (let i = 0; i < numStreaks; i++) {
      const angle = Math.random() * Math.PI * 2;
      const minRadius = 0.55 * maxRadius;
      const maxRingRadius = 0.95 * maxRadius;
      
      // Create streaks of varying lengths
      const startDistance = minRadius + Math.random() * (maxRingRadius - minRadius);
      const length = Math.random() * 20 + 5;
      const endDistance = Math.min(startDistance + length, maxRingRadius);
      
      // Starting and ending points
      const startX = centerX + Math.cos(angle) * startDistance;
      const startY = centerY + Math.sin(angle) * startDistance;
      const endX = centerX + Math.cos(angle) * endDistance;
      const endY = centerY + Math.sin(angle) * endDistance;
      
      // Draw the streak
      ctx.strokeStyle = `rgba(255, 240, 220, ${Math.random() * 0.2})`;
      ctx.lineWidth = Math.random() * 1.5 + 0.5;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    }
    
    // Clear center hole for the planet
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 0.4 * maxRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // Reset composite operation
    ctx.globalCompositeOperation = 'source-over';
    
    // Create texture
    const texture = new THREE.CanvasTexture(canvas);
    texture.rotation = Math.PI / 2;
    texture.center = new THREE.Vector2(0.5, 0.5);
    
    return texture;
  };
  
  // Get ring properties
  // Create saturnRingsTexture once and reuse it
  const saturnRingsTexture = useMemo(() => createSaturnRingsTexture(), []);
  
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
        
        <OrbitControls enableRotate={!isTransitioning} />
      </Canvas>
    </div>
  );
}

export default Home;