import React, { useState, useEffect, useRef } from 'react';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

const OrbitingFacts = ({ facts, maxActive = 5, scene = 'solar-system' }) => {
  const [activeFacts, setActiveFacts] = useState([]);
  const rotationRef = useRef(0);
  
  // Generate a new fact orbit
  const generateNewOrbit = (factIndex) => {
    // Create random orbit parameters
    const orbitRadius = Math.random() * 40 + 30; // More central orbits (30-70 range)
    const orbitHeight = (Math.random() - 0.5) * 20; // Random height from -10 to 10
    const orbitTilt = Math.random() * Math.PI; // Random tilt angle
    const orbitSpeed = 0.0005 + Math.random() * 0.0005; // 5x faster orbit speed
    const initialAngle = Math.random() * Math.PI * 2; // Random starting position
    const lifespan = 30000 + Math.random() * 15000; // 30-45 seconds lifespan (faster cycle)
    
    return {
      id: Date.now() + factIndex,
      factIndex,
      text: facts[factIndex],
      orbitRadius,
      orbitHeight,
      orbitTilt,
      orbitSpeed,
      angle: initialAngle,
      startTime: Date.now(),
      lifespan,
      opacity: 0, // Start transparent for fade-in
      fadeState: 'fadingIn', // Track fade state: fadingIn, visible, fadingOut
      glowColor: getRandomGlowColor(),
      fontSize: 18 + Math.floor(Math.random() * 6) // Larger font size between 18-23px
    };
  };
  
  // Get a random glow color for the fact
  const getRandomGlowColor = () => {
    const colors = [
      '#69f0ae', // Teal
      '#64b5f6', // Light Blue
      '#ba68c8', // Purple
      '#fff176', // Yellow
      '#ffb74d', // Orange
      '#4fc3f7', // Sky Blue
      '#aed581', // Light Green
      '#f06292', // Pink
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };
  
  // Initial setup - create first facts
  useEffect(() => {
    // Create initial facts
    const initialFacts = [];
    const numInitialFacts = Math.min(maxActive, facts.length);
    
    // Make sure we don't repeat facts initially
    const initialIndices = [];
    while (initialIndices.length < numInitialFacts) {
      const randomIndex = Math.floor(Math.random() * facts.length);
      if (!initialIndices.includes(randomIndex)) {
        initialIndices.push(randomIndex);
      }
    }
    
    // Create fact objects with orbits
    for (let i = 0; i < numInitialFacts; i++) {
      initialFacts.push(generateNewOrbit(initialIndices[i]));
    }
    
    setActiveFacts(initialFacts);
  }, [facts, maxActive]);
  
  // Update fact positions and lifecycle
  useEffect(() => {
    const updateFactsInterval = setInterval(() => {
      setActiveFacts(currentFacts => {
        return currentFacts.map(fact => {
          const now = Date.now();
          const elapsed = now - fact.startTime;
          
          // Handle fading states
          let opacity = fact.opacity;
          let fadeState = fact.fadeState;
          
          if (fadeState === 'fadingIn' && elapsed < 2000) {
            // Fade in during first 2 seconds
            opacity = Math.min(1, elapsed / 2000);
          } else if (fadeState === 'fadingIn') {
            // Fully visible after fade in
            opacity = 1;
            fadeState = 'visible';
          } else if (elapsed > fact.lifespan - 2000) {
            // Begin fading out in last 2 seconds
            fadeState = 'fadingOut';
            opacity = Math.max(0, 1 - (elapsed - (fact.lifespan - 2000)) / 2000);
          }
          
          // Update orbit angle
          const angle = (fact.angle + fact.orbitSpeed) % (Math.PI * 2);
          
          return { 
            ...fact, 
            angle, 
            opacity,
            fadeState
          };
        });
      });
    }, 50); // Update every 50ms for smooth movement
    
    return () => clearInterval(updateFactsInterval);
  }, []);
  
  // Replace facts that have completed their lifecycle
  useEffect(() => {
    const lifecycleInterval = setInterval(() => {
      setActiveFacts(currentFacts => {
        // Find facts that need to be replaced (completed their lifecycle)
        const factsToKeep = currentFacts.filter(fact => {
          const elapsed = Date.now() - fact.startTime;
          return elapsed < fact.lifespan;
        });
        
        // Create new facts to replace completed ones
        const newFacts = [];
        const numNewFacts = maxActive - factsToKeep.length;
        
        if (numNewFacts > 0) {
          // Track used indices to avoid repetition
          const usedIndices = factsToKeep.map(fact => fact.factIndex);
          
          for (let i = 0; i < numNewFacts; i++) {
            // Find an unused fact index
            let newFactIndex;
            do {
              newFactIndex = Math.floor(Math.random() * facts.length);
            } while (usedIndices.includes(newFactIndex));
            
            usedIndices.push(newFactIndex);
            newFacts.push(generateNewOrbit(newFactIndex));
          }
        }
        
        return [...factsToKeep, ...newFacts];
      });
    }, 2000); // Check every 2 seconds
    
    return () => clearInterval(lifecycleInterval);
  }, [facts, maxActive]);
  
  // Calculate positions in 3D space based on orbital parameters
  const calculatePosition = (fact) => {
    // Apply orbit tilt
    const tiltMatrix = new THREE.Matrix4().makeRotationX(fact.orbitTilt);
    
    // Calculate position on tilted orbital plane
    const x = Math.cos(fact.angle) * fact.orbitRadius;
    const z = Math.sin(fact.angle) * fact.orbitRadius;
    
    // Apply the tilt transformation
    const position = new THREE.Vector3(x, fact.orbitHeight, z);
    position.applyMatrix4(tiltMatrix);
    
    return position;
  };
  
  return (
    <group>
      {activeFacts.map((fact) => {
        // Only render if not completely transparent
        if (fact.opacity <= 0) return null;
        
        const position = calculatePosition(fact);
        
        return (
          <group key={fact.id} position={[position.x, position.y, position.z]}>
            <Html
              center
              distanceFactor={10} // Brings text closer to camera for easier reading
              sprite
              transform
              // Ensure the fact always faces the camera
              occlude={false}
            >
              <div 
                style={{
                  background: 'rgba(0, 0, 0, 0.8)',
                  padding: '14px 18px',
                  borderRadius: '10px',
                  color: 'white',
                  fontFamily: 'Arial, sans-serif',
                  fontSize: `${fact.fontSize}px`,
                  fontWeight: 'bold',
                  maxWidth: '350px',
                  textAlign: 'center',
                  boxShadow: `0 0 25px ${fact.glowColor}`,
                  border: `2px solid ${fact.glowColor}`,
                  opacity: fact.opacity,
                  transition: 'opacity 0.5s ease',
                  pointerEvents: 'none',
                  textShadow: `0 0 8px ${fact.glowColor}`
                }}
              >
                {fact.text}
              </div>
            </Html>
            
            {/* Larger glowing point to indicate the fact in 3D space */}
            <mesh>
              <sphereGeometry args={[1.0, 8, 8]} />
              <meshBasicMaterial color={fact.glowColor} transparent opacity={fact.opacity * 0.8} />
            </mesh>
            
            {/* Additional glow halo */}
            <mesh>
              <sphereGeometry args={[1.5, 8, 8]} />
              <meshBasicMaterial color={fact.glowColor} transparent opacity={fact.opacity * 0.3} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

export default OrbitingFacts;