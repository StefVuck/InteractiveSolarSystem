import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { 
  createJupiterBandsTexture, 
  createEarthTexture,
  createCloudTexture,
  createDetailedSaturnRingsTexture,
  createMoonTexture
} from '../../utils/textureGenerators';

/**
 * Enhanced planet detail component for individual planet pages
 */
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
  
  // Create Earth's land regions using procedural textures
  const earthTexture = useMemo(() => {
    if (isEarth) {
      return createEarthTexture();
    }
    return null;
  }, [isEarth]);
  
  // Create cloud texture with minimal clouds using polygon shapes
  const cloudTexture = useMemo(() => {
    if (isEarth) {
      return createCloudTexture();
    }
    return null;
  }, [isEarth]);
  
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

export default DetailedPlanet;