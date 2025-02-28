import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Stars, Text, Html } from '@react-three/drei';
import { useParams, useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import OrbitingFacts from '../components/OrbitingFacts';
import astronomyFacts from '../data/astronomyFacts';

// HorizontalText component - text that only rotates horizontally to face camera
const HorizontalText = ({ children, position, ...props }) => {
  const textRef = useRef();
  const cameraPosition = new THREE.Vector3();
  
  useFrame(({ camera }) => {
    if (textRef.current) {
      // Get camera position
      camera.getWorldPosition(cameraPosition);
      
      // Create a position where the camera is at the same height as the text
      const targetPosition = new THREE.Vector3(
        cameraPosition.x,
        position[1], // Keep the same Y (height)
        cameraPosition.z
      );
      
      // Make text look at the camera horizontally only
      textRef.current.lookAt(targetPosition);
    }
  });
  
  return (
    <Text ref={textRef} position={position} {...props}>
      {children}
    </Text>
  );
};

// ISS Component with information dialog
const ISS = ({ orbitRadius = 3, orbitSpeed = 0.005 }) => {
  const [angle, setAngle] = useState(0);
  const [showDialog, setShowDialog] = useState(false);
  const issRef = useRef();
  
  // Update orbital position
  useEffect(() => {
    const interval = setInterval(() => {
      setAngle((prevAngle) => (prevAngle + orbitSpeed) % (Math.PI * 2));
    }, 50);
    
    return () => clearInterval(interval);
  }, [orbitSpeed]);
  
  // Get position
  const x = Math.cos(angle) * orbitRadius;
  const z = Math.sin(angle) * orbitRadius;
  
  // Toggle info dialog
  const handleClick = (e) => {
    e.stopPropagation();
    setShowDialog(!showDialog);
  };
  
  // Close dialog
  const handleCloseClick = (e) => {
    e.stopPropagation();
    setShowDialog(false);
  };
  
  return (
    <group>
      {/* ISS orbit path */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[orbitRadius - 0.02, orbitRadius + 0.02, 64]} />
        <meshBasicMaterial color="#777" transparent opacity={0.3} />
      </mesh>
      
      {/* ISS model */}
      <group 
        ref={issRef} 
        position={[x, 0, z]}
        onClick={handleClick}
      >
        {/* Main truss */}
        <mesh>
          <boxGeometry args={[0.3, 0.01, 0.01]} />
          <meshStandardMaterial color="#CCC" />
        </mesh>
        
        {/* Solar panels */}
        <mesh position={[-0.12, 0, 0]} rotation={[0, 0, Math.PI/2]}>
          <boxGeometry args={[0.1, 0.01, 0.02]} />
          <meshStandardMaterial color="#447" />
        </mesh>
        <mesh position={[0.12, 0, 0]} rotation={[0, 0, Math.PI/2]}>
          <boxGeometry args={[0.1, 0.01, 0.02]} />
          <meshStandardMaterial color="#447" />
        </mesh>
        
        {/* Modules */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.04, 0.04, 0.04]} />
          <meshStandardMaterial color="#AAA" />
        </mesh>
        
        {/* Small point light for visibility */}
        <pointLight intensity={0.3} distance={0.5} color="#88CCFF" />
        
        {/* Label with horizontal-only rotation */}
        <HorizontalText
          position={[0, 0.1, 0]} // Slightly higher position
          fontSize={0.04}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.005}
          outlineColor="#000000"
          renderOrder={10} // Ensure text renders on top
        >
          ISS
        </HorizontalText>
      </group>
      
      {/* Information dialog */}
      {showDialog && (
        <Html position={[x, 0.3, z]}>
          <div style={{
            background: 'rgba(0, 20, 40, 0.8)',
            color: 'white',
            padding: '0.8rem',
            borderRadius: '0.5rem',
            width: '280px',
            boxShadow: '0 0 10px rgba(0, 100, 200, 0.5)',
            backdropFilter: 'blur(5px)',
            border: '1px solid rgba(100, 180, 255, 0.3)',
            fontFamily: 'Arial, sans-serif',
            position: 'relative'
          }}>
            <button
              onClick={handleCloseClick}
              style={{
                position: 'absolute',
                top: '0.5rem',
                right: '0.5rem',
                background: 'none',
                border: 'none',
                color: 'white',
                fontSize: '1rem',
                cursor: 'pointer'
              }}
            >
              ✕
            </button>
            <h3 style={{ 
              margin: '0 0 0.5rem 0', 
              borderBottom: '1px solid rgba(100, 180, 255, 0.5)',
              paddingBottom: '0.3rem'
            }}>International Space Station</h3>
            <p style={{ fontSize: '0.9rem', lineHeight: '1.4' }}>
              The ISS is a modular space station in low Earth orbit. A joint project by five space agencies (NASA, Roscosmos, JAXA, ESA, and CSA), it orbits at approximately 400 km above Earth and travels at 28,000 km/h, completing 15.5 orbits per day. It has been continuously occupied since November 2000 and serves as a laboratory for scientific research in microgravity.
            </p>
          </div>
        </Html>
      )}
    </group>
  );
};

// Create Jupiter's texture with distinctive bands
const createJupiterBandsTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  
  // Base color - light tan base
  ctx.fillStyle = '#E3B982';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Define the horizontal bands with varying colors - softened edges
  const bands = [
    { y: 0.05, height: 0.05, color: '#ddb277' },   // North polar region - light tan
    { y: 0.1, height: 0.1, color: '#c19865' },     // North temperate belt - darker brown
    { y: 0.2, height: 0.05, color: '#e8c090' },    // North temperate zone - lighter
    { y: 0.25, height: 0.08, color: '#ba8550' },   // North tropical belt - dark orange-brown
    { y: 0.33, height: 0.1, color: '#e8c090' },    // Equatorial zone - light tan
    { y: 0.43, height: 0.07, color: '#9a7550' },   // South equatorial belt - dark brown (widest)
    { y: 0.5, height: 0.08, color: '#e3b982' },    // South tropical zone - medium tan
    { y: 0.58, height: 0.07, color: '#ba8550' },   // South temperate belt - orange-brown
    { y: 0.65, height: 0.15, color: '#ddb277' },   // South temperate zone - light tan
    { y: 0.8, height: 0.15, color: '#c19865' }     // South polar region - medium tan
  ];
  
  // Draw the bands with gradient transitions to avoid hard edges
  bands.forEach((band, index) => {
    // For each band, create a gradient transition to the next band
    const yStart = canvas.height * band.y;
    const yEnd = yStart + (canvas.height * band.height);
    
    // Create gradient for smooth transition between bands
    const gradient = ctx.createLinearGradient(0, yStart, 0, yEnd);
    gradient.addColorStop(0, band.color);
    
    // Blend with next band color at the edge (if not the last band)
    if (index < bands.length - 1) {
      gradient.addColorStop(1, bands[index + 1].color);
    } else {
      gradient.addColorStop(1, band.color);
    }
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, yStart, canvas.width, yEnd - yStart);
  });
  
  // Add subtle turbulence and swirls to each band - softer than before
  bands.forEach(band => {
    const yStart = canvas.height * band.y;
    const height = canvas.height * band.height;
    
    // Parse the band color and determine a slightly lighter and darker shade
    const r = parseInt(band.color.slice(1, 3), 16);
    const g = parseInt(band.color.slice(3, 5), 16);
    const b = parseInt(band.color.slice(5, 7), 16);
    
    // Add swirls and turbulence within each band - fewer, more subtle
    const numSwirls = Math.floor(height / 15); // Fewer swirls
    for (let i = 0; i < numSwirls; i++) {
      const y = yStart + Math.random() * height;
      
      // Use more subtle color variations
      const shade = Math.random() < 0.5 ? 10 : -10; // Less contrast
      const swirl_r = Math.min(255, Math.max(0, r + shade));
      const swirl_g = Math.min(255, Math.max(0, g + shade)); 
      const swirl_b = Math.min(255, Math.max(0, b + shade));
      
      // Draw elongated ellipse for turbulent flow pattern with reduced opacity
      ctx.fillStyle = `rgba(${swirl_r}, ${swirl_g}, ${swirl_b}, 0.7)`; // More transparent
      ctx.beginPath();
      
      // Vary the width of swirls a lot, but keep them very flat
      const width = Math.random() * 250 + 100;
      const swirlHeight = Math.random() * 6 + 2; // Much flatter
      
      ctx.ellipse(
        Math.random() * canvas.width,
        y,
        width,
        swirlHeight,
        0, 0, Math.PI * 2
      );
      ctx.fill();
    }
  });
  
  // Create texture from canvas
  const texture = new THREE.CanvasTexture(canvas);
  return texture;
};

// Jupiter's Great Red Spot component - more direct rendering
const JupiterRedSpot = () => {
  const spotRef = useRef();
  
  useFrame(() => {
    if (spotRef.current) {
      // Slowly rotate the spot
      spotRef.current.rotation.y += 0.008;
    }
  });
  
  return (
    <mesh ref={spotRef}>
      <sphereGeometry args={[2.07, 32, 32]} /> {/* Slightly larger to ensure it appears on top */}
      <meshBasicMaterial 
        color="#cc2200" 
        transparent={true}
        opacity={0.9}
        map={createDetailedRedSpotTexture()}
        depthWrite={false} // Prevents z-fighting with the bands
        polygonOffset={true} // Helps prevent z-fighting
        polygonOffsetFactor={-1}
      />
    </mesh>
  );
};

// Create a better texture for Jupiter's Great Red Spot
const createDetailedRedSpotTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  
  // Clear the canvas and make transparent
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'rgba(0, 0, 0, 0)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Create the red spot with more vibrant color and proper shape/position
  ctx.fillStyle = 'rgba(204, 34, 0, 0.9)';
  
  // Draw a more circular spot below the equator
  ctx.beginPath();
  ctx.ellipse(
    canvas.width * 0.25,     // x position - quarter from left
    canvas.height * 0.65,    // below equator (65% down)
    canvas.width * 0.09,     // x radius - more circular
    canvas.height * 0.085,   // y radius - more circular
    0, 0, Math.PI * 2        // rotation, start angle, end angle
  );
  ctx.fill();
  
  // Add a highlight to give it some depth
  ctx.fillStyle = 'rgba(240, 60, 30, 0.6)';
  ctx.beginPath();
  ctx.ellipse(
    canvas.width * 0.24,     // slightly offset from center
    canvas.height * 0.64,    // slightly offset from center
    canvas.width * 0.05,     // smaller radius
    canvas.height * 0.045,   // smaller radius
    0, 0, Math.PI * 2
  );
  ctx.fill();
  
  // Create texture from canvas
  const texture = new THREE.CanvasTexture(canvas);
  texture.premultiplyAlpha = true;
  
  return texture;
};

// Create lunar surface texture with craters
const createMoonTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  
  // Base color - brighter white/gray
  ctx.fillStyle = '#E8E8E8';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Add darker base regions for maria (lunar seas)
  const maria = [
    { x: 400, y: 200, radius: 120 }, // Mare Imbrium
    { x: 550, y: 280, radius: 80 },  // Mare Serenitatis
    { x: 600, y: 380, radius: 70 },  // Mare Tranquillitatis
    { x: 650, y: 200, radius: 60 },  // Mare Frigoris
    { x: 480, y: 350, radius: 90 },  // Mare Nubium
  ];
  
  // Fill maria with slightly darker color - lighter than before
  ctx.fillStyle = '#C0C0C0';
  maria.forEach(mare => {
    ctx.beginPath();
    ctx.arc(mare.x, mare.y, mare.radius, 0, Math.PI * 2);
    ctx.fill();
  });
  
  // Add craters
  const craters = 100;
  for (let i = 0; i < craters; i++) {
    const size = Math.random() * 30 + 5;
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    
    // Crater outer rim - slightly brighter
    ctx.fillStyle = '#DDDDDD';
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
    
    // Crater inner area - darker
    ctx.fillStyle = '#999999';
    ctx.beginPath();
    ctx.arc(x, y, size * 0.85, 0, Math.PI * 2);
    ctx.fill();
    
    // Crater floor - darkest
    ctx.fillStyle = '#888888';
    ctx.beginPath();
    ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Add some small craters for detail
  for (let i = 0; i < 200; i++) {
    const size = Math.random() * 8 + 1;
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    
    // Small crater with simple design
    ctx.fillStyle = '#999999';
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Create texture from canvas
  const texture = new THREE.CanvasTexture(canvas);
  return texture;
};

// Enhanced orbiting Moon component with crater texture
const Moon = () => {
  const moonRef = useRef();
  const [angle, setAngle] = useState(0);
  const orbitRadius = 6; // Increased from 4 to 6 for more distance
  
  // Create moon texture with craters
  const moonTexture = useMemo(() => createMoonTexture(), []);
  
  // Simple orbit update using useState instead of useFrame
  useEffect(() => {
    const interval = setInterval(() => {
      setAngle((prevAngle) => (prevAngle + 0.008) % (Math.PI * 2)); // Slightly slower rotation
    }, 50); // Update every 50ms for smoother animation
    
    return () => clearInterval(interval);
  }, []);
  
  // Calculate position based on angle
  const x = Math.cos(angle) * orbitRadius;
  const z = Math.sin(angle) * orbitRadius;
  
  // Update rotation to face Earth
  useFrame(() => {
    if (moonRef.current) {
      moonRef.current.rotation.y += 0.001; // Slow rotation
    }
  });
  
  return (
    <group>
      {/* Main moon with crater texture */}
      <mesh ref={moonRef} position={[x, 0, z]}>
        <sphereGeometry args={[0.5, 32, 32]} /> {/* Increased detail */}
        <meshStandardMaterial 
          map={moonTexture}
          color="#F0F0F0" // Much brighter/whiter color
          roughness={0.8}
          metalness={0.2}
          bumpScale={0.05}
          emissive="#FFFFFF" // Add slight glow
          emissiveIntensity={0.05} // Subtle emissive effect
        />
      </mesh>
      
      {/* Small point light to make the moon glow slightly */}
      <pointLight position={[x, 0, z]} intensity={0.2} distance={2} color="#FFFFFF" />
    </group>
  );
};

// Create detailed Saturn ring texture for planet detail view
const createDetailedSaturnRingsTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 2048; // Higher resolution for detail view
  canvas.height = 2048;
  const ctx = canvas.getContext('2d');
  
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Define Saturn's rings with scientifically accurate structure
  const rings = [
    { radius: 0.45, width: 0.02, color: 'rgba(170, 140, 110, 0.05)', name: 'D Ring' },
    { radius: 0.47, width: 0.06, color: 'rgba(200, 170, 130, 0.15)', name: 'C Ring' },
    { radius: 0.53, width: 0.01, color: 'rgba(100, 90, 70, 0.05)', name: 'Maxwell Gap' },
    { radius: 0.54, width: 0.09, color: 'rgba(230, 200, 150, 0.7)', name: 'B Ring' },
    { radius: 0.63, width: 0.03, color: 'rgba(140, 120, 100, 0.2)', name: 'Cassini Division' },
    { radius: 0.66, width: 0.08, color: 'rgba(220, 190, 145, 0.6)', name: 'A Ring' },
    { radius: 0.74, width: 0.01, color: 'rgba(130, 110, 90, 0.1)', name: 'Encke Gap' },
    { radius: 0.75, width: 0.02, color: 'rgba(200, 170, 130, 0.4)', name: 'A Ring (outer)' },
    { radius: 0.78, width: 0.01, color: 'rgba(150, 130, 100, 0.05)', name: 'Keeler Gap' },
    { radius: 0.8, width: 0.03, color: 'rgba(190, 160, 120, 0.2)', name: 'F Ring' },
    { radius: 0.84, width: 0.02, color: 'rgba(170, 150, 120, 0.08)', name: 'G Ring' },
    { radius: 0.87, width: 0.04, color: 'rgba(160, 140, 110, 0.03)', name: 'E Ring' }
  ];
  
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const maxRadius = Math.min(centerX, centerY);
  
  // Draw rings with gradients
  rings.forEach((ring, index) => {
    const innerRadius = ring.radius * maxRadius;
    const outerRadius = (ring.radius + ring.width) * maxRadius;
    
    // Create gradient for smooth transition
    const gradient = ctx.createRadialGradient(
      centerX, centerY, innerRadius,
      centerX, centerY, outerRadius
    );
    
    // Extract base color components for variations
    const baseColor = ring.color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
    if (!baseColor) return;
    
    const r = parseInt(baseColor[1]);
    const g = parseInt(baseColor[2]);
    const b = parseInt(baseColor[3]);
    const a = parseFloat(baseColor[4]);
    
    // Add gradient stops with subtle variations
    gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${a})`);
    gradient.addColorStop(0.2, `rgba(${r+10}, ${g+5}, ${b}, ${a*0.9})`);
    gradient.addColorStop(0.5, `rgba(${r+5}, ${g}, ${b-5}, ${a*1.1})`);
    gradient.addColorStop(0.8, `rgba(${r}, ${g+8}, ${b+5}, ${a*0.95})`);
    gradient.addColorStop(1, `rgba(${r-5}, ${g-5}, ${b}, ${a*0.8})`);
    
    // Draw ring
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
    ctx.arc(centerX, centerY, outerRadius, 0, Math.PI * 2, true);
    ctx.fill();
  });
  
  // Add particles for texture detail
  const numParticles = 12000; // More particles for detail view
  for (let i = 0; i < numParticles; i++) {
    const angle = Math.random() * Math.PI * 2;
    const minRadius = 0.45 * maxRadius; // Inner edge of rings
    const maxRingRadius = 0.91 * maxRadius; // Outer edge of rings
    const distance = minRadius + Math.random() * (maxRingRadius - minRadius);
    
    // Position
    const x = centerX + Math.cos(angle) * distance;
    const y = centerY + Math.sin(angle) * distance;
    
    // Match particle to the ring section it's in
    const ringSection = rings.find(ring => {
      const r = distance / maxRadius;
      return r >= ring.radius && r < (ring.radius + ring.width);
    });
    
    // Vary opacity based on ring section
    let opacity = 0.5;
    let r = 225, g = 200, b = 170;
    
    if (ringSection) {
      const match = ringSection.color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
      if (match) {
        r = parseInt(match[1]);
        g = parseInt(match[2]);
        b = parseInt(match[3]);
        opacity = parseFloat(match[4]) * (Math.random() * 0.8 + 0.6);
      }
    }
    
    // Add slight color variation to particles
    const variation = Math.random() * 30 - 15;
    r = Math.min(255, Math.max(0, r + variation));
    g = Math.min(255, Math.max(0, g + variation));
    b = Math.min(255, Math.max(0, b + variation));
    
    // Draw particle
    const size = Math.random() * 2 + 0.5;
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
    ctx.fillRect(x - size/2, y - size/2, size, size);
  }
  
  // Add concentric streaking patterns
  for (let i = 0; i < 500; i++) {
    const angle = Math.random() * Math.PI * 2;
    const ringIndex = Math.floor(Math.random() * rings.length);
    const ring = rings[ringIndex];
    const radius = (ring.radius + Math.random() * ring.width) * maxRadius;
    
    // Calculate arc length and position
    const arcLength = Math.random() * 0.2 + 0.05; // 5-25% of the circle
    const startAngle = angle;
    const endAngle = angle + arcLength * Math.PI * 2;
    
    const match = ring.color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
    if (!match) continue;
    
    const r = parseInt(match[1]);
    const g = parseInt(match[2]);
    const b = parseInt(match[3]);
    const a = parseFloat(match[4]) * (Math.random() * 0.5 + 0.3);
    
    // Draw arc
    ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
    ctx.lineWidth = Math.random() * 2 + 0.5;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.stroke();
  }
  
  // Clear center for planet
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath();
  ctx.arc(centerX, centerY, 0.4 * maxRadius, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.globalCompositeOperation = 'source-over';
  
  // Create texture
  const texture = new THREE.CanvasTexture(canvas);
  return texture;
};

// Enhanced planet detail component
const DetailedPlanet = ({ color, planetId, onMoonClick }) => {
  const meshRef = useRef();
  const ringsRef = useRef();
  const cloudsRef = useRef();
  
  // Special rendering for Earth with continents and clouds or Jupiter with bands
  const isEarth = planetId === 'earth';
  const isJupiter = planetId === 'jupiter';
  const isSaturn = planetId === 'saturn';
  const isDwarfPlanet = ['pluto', 'ceres', 'haumea', 'makemake'].includes(planetId);
  
  // Create textures based on planet type
  const jupiterTexture = useMemo(() => {
    if (isJupiter) {
      return createJupiterBandsTexture();
    }
    return null;
  }, [isJupiter]);
  
  // Create Saturn's rings texture
  const saturnRingsTexture = useMemo(() => {
    if (isSaturn) {
      return createDetailedSaturnRingsTexture();
    }
    return null;
  }, [isSaturn]);
  
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
  
  // Create simple texture for dwarf planets
  const createDwarfPlanetTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    // Base color
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add some basic features based on which dwarf planet
    if (planetId === 'pluto') {
      // Create Pluto's heart-shaped region (Tombaugh Regio)
      ctx.fillStyle = '#f0f0f0';
      ctx.beginPath();
      // Draw simplified heart shape
      ctx.arc(canvas.width/2-100, canvas.height/2, 100, 0, Math.PI, true);
      ctx.arc(canvas.width/2+100, canvas.height/2, 100, 0, Math.PI, true);
      ctx.bezierCurveTo(
        canvas.width/2+200, canvas.height/2+100,
        canvas.width/2, canvas.height/2+200,
        canvas.width/2-200, canvas.height/2+100
      );
      ctx.fill();
    } else if (planetId === 'ceres') {
      // Add some crater-like features
      for (let i = 0; i < 30; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const radius = Math.random() * 30 + 10;
        
        ctx.fillStyle = `rgba(100, 100, 100, 0.3)`;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (planetId === 'haumea') {
      // For Haumea's elongated shape, we'll simulate it with shading
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop(0, 'rgba(0,0,0,0.4)');
      gradient.addColorStop(0.3, 'rgba(255,255,255,0.1)');
      gradient.addColorStop(0.7, 'rgba(255,255,255,0.1)');
      gradient.addColorStop(1, 'rgba(0,0,0,0.4)');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (planetId === 'makemake') {
      // Reddish surface features
      for (let i = 0; i < 40; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const radius = Math.random() * 40 + 20;
        
        ctx.fillStyle = `rgba(150, 80, 50, 0.2)`;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    // Create a texture from the canvas
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  };
  
  // Create dwarf planet texture if needed
  const dwarfPlanetTexture = useMemo(() => {
    if (isDwarfPlanet) {
      return createDwarfPlanetTexture();
    }
    return null;
  }, [isDwarfPlanet, planetId, color]);
  
  // Create vertex displacement for surface detail
  useEffect(() => {
    if (meshRef.current && !isEarth && !isDwarfPlanet) {  // Skip for Earth and dwarf planets
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
  }, [planetId, isEarth, isDwarfPlanet]);
  
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
        'mercury': 0.002, // Very slow
        'pluto': 0.001,   // Very slow rotation
        'ceres': 0.003,   // Medium-slow rotation
        'haumea': 0.01,   // Fast rotation (in reality, Haumea rotates very quickly)
        'makemake': 0.002 // Slow rotation
      };
      
      meshRef.current.rotation.y += rotationSpeeds[planetId] || 0.005;
      
      // Add a slight wobble for gas giants
      if (['jupiter', 'saturn'].includes(planetId)) {
        meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.02;
      }
      
      // Add more pronounced wobble for Haumea, the egg-shaped dwarf planet
      if (planetId === 'haumea') {
        meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
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
    // Dwarf planets are smaller
    if (isDwarfPlanet) {
      const sizes = {
        'pluto': 1.3,
        'ceres': 1.0,
        'haumea': 1.1,
        'makemake': 1.2
      };
      return sizes[planetId] || 1.0;
    }
    return 2; // Regular planets are same size in detail view
  };
  
  // Configure detail level based on planet
  const getDetailLevel = () => {
    if (planetId === 'earth') return 64; // Higher resolution sphere for Earth
    if (isDwarfPlanet) return 32; // Good resolution for dwarf planets
    return 3; // Lower polygon count for other planets with displacement
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
        opacity: 1.0, // Fully opaque for Saturn
        texture: saturnRingsTexture
      };
    } else if (planetId === 'uranus') {
      return {
        innerRadius: 2.3,
        outerRadius: 3,
        color: '#AAD3F2',
        rotation: [0, 0, Math.PI / 2], // Vertical rings for Uranus
        opacity: 0.15 // More transparent for Uranus
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
          
          {/* International Space Station */}
          <ISS orbitRadius={2.5} orbitSpeed={0.01} />
          
          {/* Static Moon */}
          <Moon />
          
          {/* Moon orbit path */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[6 - 0.05, 6 + 0.05, 64]} />
            <meshBasicMaterial color="#444444" transparent opacity={0.3} />
          </mesh>

          {/* Moon button */}
          <group position={[0, 4.5, 0]}>
            <mesh onClick={(e) => {
              e.stopPropagation();
              if (onMoonClick) onMoonClick();
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
        </>
      ) : isJupiter ? (
        // Jupiter with banded texture and high detail
        <mesh ref={meshRef}>
          <sphereGeometry args={[getSize(), 64, 64]} />
          <meshStandardMaterial 
            map={jupiterTexture}
            roughness={0.7}
            metalness={0.2}
            emissive="#E3B982"
            emissiveIntensity={0.1}
          />
        </mesh>
      ) : isDwarfPlanet ? (
        // Dwarf planets with simplified texture
        <mesh ref={meshRef}>
          <sphereGeometry args={[getSize(), 32, 32]} />
          <meshStandardMaterial 
            map={dwarfPlanetTexture}
            color={color}
            emissive={color} 
            emissiveIntensity={0.2}
            roughness={0.7}
            metalness={0.3}
          />
        </mesh>
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
          <ringGeometry args={[ringProps.innerRadius, ringProps.outerRadius, 256]} /> {/* Higher segment count */}
          {isSaturn ? (
            <meshBasicMaterial 
              map={ringProps.texture}
              side={THREE.DoubleSide} 
              transparent={true} 
              opacity={ringProps.opacity}
              alphaTest={0.05}
            />
          ) : (
            <meshPhongMaterial 
              color={ringProps.color} 
              side={THREE.DoubleSide} 
              transparent={true} 
              opacity={ringProps.opacity}
              flatShading={true}
            />
          )}
        </mesh>
      )}
    </group>
  );
};

// Moon component for the 3D canvas
const Moon3D = () => {
  const moonRef = useRef();
  
  // Use the same createMoonTexture function we defined earlier
  const moonTexture = useMemo(() => createMoonTexture(), []);
  
  // Slowly rotate the moon
  useFrame(() => {
    if (moonRef.current) {
      moonRef.current.rotation.y += 0.002;
    }
  });
  
  return (
    <group>
      <mesh ref={moonRef}>
        <sphereGeometry args={[2.2, 64, 64]} /> {/* Larger size for detail view */}
        <meshStandardMaterial 
          map={moonTexture}
          color="#F0F0F0" // Very bright white
          roughness={0.7}
          metalness={0.3}
          emissive="#FFFFFF" 
          emissiveIntensity={0.1} // Subtle glow
        />
      </mesh>
      
      {/* Subtle ambient glow around the moon */}
      <mesh scale={[1.05, 1.05, 1.05]}>
        <sphereGeometry args={[2.2, 32, 32]} />
        <meshBasicMaterial 
          color="#FFFFFF" 
          transparent={true} 
          opacity={0.07} 
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
};

// Enhanced 3D Moon page using a separate canvas component
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
      
      <div style={{ width: '100%', height: 'calc(100vh - 140px)' }}>
        <Canvas 
          camera={{ position: [0, 0, 5], fov: 45 }}
          gl={{ 
            powerPreference: 'default', 
            antialias: true,
            depth: true
          }}>
          {/* Ambient and directional lights */}
          <ambientLight intensity={0.4} />
          <pointLight position={[10, 10, 10]} intensity={0.6} color="#FFFFFF" />
          <pointLight position={[-10, -10, -10]} intensity={0.2} color="#C0C8FF" />
          
          {/* Moon 3D component */}
          <Moon3D />
          
          {/* Small distant stars */}
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} />
          
          {/* Controls */}
          <OrbitControls 
            autoRotate={false} 
            enablePan={false}
            minDistance={3.5}
            maxDistance={10}
          />
        </Canvas>
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
              <DetailedPlanet 
                color={planet.color} 
                planetId={planet.id} 
                onMoonClick={planet.id === 'earth' ? handleMoonClick : undefined} 
              />
              
              {/* Add Jupiter's Great Red Spot if on Jupiter's page */}
              {planet.id === 'jupiter' && <JupiterRedSpot />}
              
              {/* Filter facts for this planet */}
              <OrbitingFacts 
                facts={astronomyFacts.filter(fact => 
                  fact.toLowerCase().includes(planet.id.toLowerCase()) || 
                  fact.toLowerCase().includes(planet.name.toLowerCase())
                )} 
                maxActive={3} 
                scene="planet-detail" 
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