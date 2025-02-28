import React, { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import HorizontalText from '../common/HorizontalText';

/**
 * Spacecraft component that displays a 3D spacecraft model with name label and information dialog
 */
const Spacecraft = ({ position, name, description, icon }) => {
  const [showDialog, setShowDialog] = useState(false);
  const meshRef = useRef();
  
  // Toggle dialog visibility
  const handleClick = (e) => {
    e.stopPropagation();
    setShowDialog(!showDialog);
  };
  
  // Close dialog when clicking outside
  const handleCloseClick = (e) => {
    e.stopPropagation();
    setShowDialog(false);
  };
  
  // Add slight rotation to make it more interesting
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
    }
  });
  
  return (
    <group position={position}>
      {/* Spacecraft icon */}
      <group ref={meshRef} onClick={handleClick}>
        {icon ? icon : (
          <mesh>
            <boxGeometry args={[0.3, 0.1, 0.3]} />
            <meshStandardMaterial color="#DDD" />
          </mesh>
        )}
        
        {/* Small gold antenna */}
        <mesh position={[0.2, 0.05, 0]}>
          <cylinderGeometry args={[0.01, 0.01, 0.2]} />
          <meshStandardMaterial color="#FFD700" />
        </mesh>
        
        {/* Enhanced glow */}
        <pointLight position={[0, 0, 0]} intensity={1.5} distance={5} color="#88CCFF" />
      </group>
      
      {/* Label always visible with horizontal-only rotation */}
      <HorizontalText
        position={[0, 0.3, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
        renderOrder={10} // Ensure text renders on top
      >
        {name}
      </HorizontalText>
      
      {/* Dialog that appears when clicked */}
      {showDialog && (
        <Html position={[0, 0.6, 0]}>
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
            }}>{name}</h3>
            <p style={{ fontSize: '0.9rem', lineHeight: '1.4' }}>{description}</p>
          </div>
        </Html>
      )}
    </group>
  );
};

export default Spacecraft;