import React, { useRef, useState, useEffect } from 'react';
import { Html } from '@react-three/drei';
import HorizontalText from '../common/HorizontalText';

/**
 * ISS Component with orbital movement and information dialog
 */
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

export default ISS;