import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createDetailedRedSpotTexture } from '../../utils/textureGenerators';

/**
 * Jupiter's Great Red Spot component for the detailed Jupiter page
 */
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

export default JupiterRedSpot;