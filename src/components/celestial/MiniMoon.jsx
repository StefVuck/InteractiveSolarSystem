import React, { useRef, useState, useEffect } from 'react';

/**
 * Simple orbiting Moon component for the solar system view
 */
const MiniMoon = ({ parentPosition, parentSize }) => {
  const moonRef = useRef();
  const [angle, setAngle] = useState(0);
  const orbitRadius = parentSize * 2.5;
  
  // Simple orbit update using useState instead of useFrame
  useEffect(() => {
    const interval = setInterval(() => {
      setAngle((prevAngle) => (prevAngle + 0.02) % (Math.PI * 2));
    }, 50); // Update every 50ms
    
    return () => clearInterval(interval);
  }, []);
  
  // Calculate moon position based on angle
  const moonX = parentPosition[0] + Math.cos(angle) * orbitRadius;
  const moonY = parentPosition[1];
  const moonZ = parentPosition[2] + Math.sin(angle) * orbitRadius;
  
  return (
    <group>
      {/* Moon orbit path */}
      <mesh position={parentPosition} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[orbitRadius - 0.02, orbitRadius + 0.02, 32]} />
        <meshBasicMaterial color="#444444" transparent opacity={0.2} />
      </mesh>
      
      {/* Orbiting Moon */}
      <mesh ref={moonRef} position={[moonX, moonY, moonZ]}>
        <sphereGeometry args={[parentSize * 0.27, 8, 8]} />
        <meshBasicMaterial color="#C0C0C0" />
      </mesh>
    </group>
  );
};

export default MiniMoon;