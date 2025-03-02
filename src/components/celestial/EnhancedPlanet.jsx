import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import HorizontalText from '../common/HorizontalText';
import { 
  createJupiterTexture, 
  createEnhancedEarthTexture, 
  createEnhancedCloudTexture 
} from '../../utils/textureGenerators';

/**
 * Enhanced Planet component with hover effect and possible rings
 */
function EnhancedPlanet({ 
  position, 
  color, 
  size = 1, 
  name, 
  onClick, 
  hasRings, 
  ringsColor, 
  ringsRotation, 
  ringsTexture, 
  ringsOpacity, 
  planetId 
}) {
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
    return createEnhancedEarthTexture();
  }, [isEarth]);
  
  // Create cloud texture with minimal clouds using polygon shapes
  const cloudTexture = useMemo(() => {
    if (!isEarth) return null;
    return createEnhancedCloudTexture();
  }, [isEarth]);
  
  // Track day/night cycle for Earth
  const dayNightRef = useRef(0);
  
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
      
      {/* Always show planet name with horizontal-only rotation - higher position for Uranus to avoid ring clipping */}
      <HorizontalText
        position={[
          position[0], 
          position[1] + size + (planetId === 'uranus' ? 2.0 : 0.5), // Higher position for Uranus
          position[2]
        ]}
        fontSize={0.5}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.05}
        outlineColor="#000000"
        renderOrder={10} // Ensure text renders on top of all other objects
      >
        {name}
      </HorizontalText>
    </group>
  );
}

export default EnhancedPlanet;