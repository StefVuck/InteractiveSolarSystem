import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createSpotTexture } from '../../utils/textureGenerators';

/**
 * Component for Jupiter's Great Red Spot 
 */
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

export default RedSpot;