import React, { useState, useEffect } from 'react';
import { Html } from '@react-three/drei';

/**
 * Asteroid belt component that renders a ring of randomly generated asteroid particles
 */
const AsteroidBelt = ({ innerRadius, outerRadius, count, name, color = "#AAA" }) => {
  const [asteroids, setAsteroids] = useState([]);
  
  // Generate random asteroids in a belt - limit count to avoid crashes
  useEffect(() => {
    const newAsteroids = [];
    // Limit to a maximum of 1000 asteroids for performance
    const safeCount = Math.min(count, 1000);
    for (let i = 0; i < safeCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = innerRadius + Math.random() * (outerRadius - innerRadius);
      const size = Math.random() * 0.2 + 0.05;
      
      newAsteroids.push({
        id: i,
        angle,
        distance,
        size,
        orbitSpeed: 0.0001 + Math.random() * 0.0002,
        y: (Math.random() - 0.5) * 1.0 // Some vertical distribution
      });
    }
    setAsteroids(newAsteroids);
  }, [innerRadius, outerRadius, count]);

  // Update asteroid positions - slower updates for better stability
  useEffect(() => {
    const interval = setInterval(() => {
      setAsteroids(prev => prev.map(asteroid => ({
        ...asteroid,
        angle: (asteroid.angle + asteroid.orbitSpeed) % (Math.PI * 2)
      })));
    }, 200); // Even slower update for stability
    
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Belt name */}
      <Html position={[0, 2, (innerRadius + outerRadius) / 2]} center>
        <div style={{
          color: 'white',
          padding: '4px',
          fontSize: '14px',
          opacity: 0.7
        }}>
          {name}
        </div>
      </Html>
    
      {/* Individual asteroids - limit for performance */}
      {asteroids.map(asteroid => {
        const x = Math.cos(asteroid.angle) * asteroid.distance;
        const z = Math.sin(asteroid.angle) * asteroid.distance;
        
        return (
          <mesh 
            key={asteroid.id} 
            position={[x, asteroid.y, z]}
          >
            <boxGeometry args={[asteroid.size, asteroid.size, asteroid.size]} />
            <meshBasicMaterial color={color} />
          </mesh>
        );
      })}
    </>
  );
};

export default AsteroidBelt;