import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import Moon3D from '../celestial/Moon3D';

/**
 * Enhanced 3D Moon page using a separate canvas component
 */
const MoonPage = ({ onBackClick }) => {
  return (
    <div className="planet-page moon-page">
      <div className="planet-info">
        <h1>The Moon</h1>
        <p>Earth's only natural satellite and the fifth largest moon in the solar system. The Moon's presence helps stabilize our planet's wobble and moderate our climate. Its surface is cratered and barren with regolith covering a rocky surface.</p>
        <button className="back-button" onClick={onBackClick}>
          ← Back to Earth
        </button>
      </div>
      
      <div style={{ width: '100%', height: 'calc(100vh - 140px)' }}>
        <Canvas 
          camera={{ position: [0, 0, 5], fov: 45 }}
          gl={{ 
            powerPreference: 'default', 
            antialias: true,
            depth: true
          }}>
          {/* Ambient and directional lights */}
          <ambientLight intensity={0.4} />
          <pointLight position={[10, 10, 10]} intensity={0.6} color="#FFFFFF" />
          <pointLight position={[-10, -10, -10]} intensity={0.2} color="#C0C8FF" />
          
          {/* Moon 3D component */}
          <Moon3D />
          
          {/* Small distant stars */}
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} />
          
          {/* Controls */}
          <OrbitControls 
            autoRotate={false} 
            enablePan={false}
            minDistance={3.5}
            maxDistance={10}
          />
        </Canvas>
      </div>
    </div>
  );
};

export default MoonPage;