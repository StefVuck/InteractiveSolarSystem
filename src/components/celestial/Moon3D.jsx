import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createMoonTexture } from '../../utils/textureGenerators';

/**
 * Detailed 3D Moon component for the dedicated Moon page
 */
const Moon3D = () => {
  const moonRef = useRef();
  
  // Use the same createMoonTexture function for consistency
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

export default Moon3D;