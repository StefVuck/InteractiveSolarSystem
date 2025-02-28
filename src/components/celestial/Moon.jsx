import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { createMoonTexture } from '../../utils/textureGenerators';

/**
 * Enhanced orbiting Moon component with crater texture
 */
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

export default Moon;