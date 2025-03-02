import React, { useState, useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import EnhancedEarth from './EnhancedEarth';
import DetailedEarth from './DetailedEarth';

/**
 * Earth View Controller
 * Handles seamless transitions between solar system view and detailed view
 */
const EarthViewController = ({ 
  initialPosition = [0, 0, 0],
  initialSize = 1,
  name = "Earth",
  onMoonClick
}) => {
  // View state
  const [viewMode, setViewMode] = useState("solar"); // "solar" or "detailed"
  
  // Reference for the entire Earth group
  const groupRef = useRef();
  
  // Camera animation state
  const [cameraTarget, setCameraTarget] = useState(new THREE.Vector3(...initialPosition));
  const [cameraDistance, setCameraDistance] = useState(10);
  const cameraAnimating = useRef(false);
  
  // Access Three.js camera
  const { camera } = useThree();
  
  // Handle click on Earth to navigate to Earth page
  const handleEarthClick = () => {
    // Prevent multiple clicks from causing problems
    if (cameraAnimating.current) return;
    
    // Navigate to the Earth page
    window.location.href = "/planet/earth";
  };
  
  // Handle camera animation for smooth transitions
  useFrame(() => {
    if (cameraAnimating.current) {
      // Calculate current camera position
      const cameraDirection = new THREE.Vector3().subVectors(camera.position, cameraTarget).normalize();
      
      // Prevent NaN issues if vectors are too close
      if (isNaN(cameraDirection.x) || isNaN(cameraDirection.y) || isNaN(cameraDirection.z)) {
        cameraAnimating.current = false;
        return;
      }
      
      // Limit how far the camera can move in a single frame to prevent jumping
      const currentDist = camera.position.distanceTo(cameraTarget);
      const maxStepDistance = Math.max(currentDist * 0.05, 0.05);
      
      // Target camera position
      const targetPosition = new THREE.Vector3().copy(cameraTarget).add(
        cameraDirection.multiplyScalar(cameraDistance)
      );
      
      // Smoothly interpolate camera position with damping
      camera.position.lerp(targetPosition, 0.03);
      
      // Ensure camera is looking at the Earth
      camera.lookAt(cameraTarget);
      
      // Check if animation is complete
      if (camera.position.distanceTo(targetPosition) < 0.1) {
        cameraAnimating.current = false;
      }
    }
  });
  
  // Update group position when initialPosition changes
  useEffect(() => {
    if (groupRef.current && viewMode === "solar") {
      groupRef.current.position.set(...initialPosition);
    }
  }, [initialPosition, viewMode]);
  
  // Just show Enhanced Earth in solar view
  return (
    <group ref={groupRef} position={initialPosition}>
      <EnhancedEarth 
        position={[0, 0, 0]} 
        size={initialSize} 
        name={name} 
        onClick={handleEarthClick} 
      />
    </group>
  );
};

export default EarthViewController;