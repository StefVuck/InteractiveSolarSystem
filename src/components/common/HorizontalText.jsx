import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Text component that only rotates horizontally to face the camera
 * This ensures text is always readable while maintaining its vertical position
 */
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

export default HorizontalText;