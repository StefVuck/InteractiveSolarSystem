import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFrame } from '@react-three/fiber';
import HorizontalText from '../common/HorizontalText';
import * as THREE from 'three';
import {
  createIoTexture,
  createEuropaTexture,
  createGanymedeTexture,
  createCallistoTexture
} from '../../utils/textureGenerators';

/**
 * Component to render a system of moons orbiting a planet
 * Each moon can be clicked to navigate to a detail page
 */
const PlanetaryMoons = ({ 
  planetId, // Parent planet ID (e.g., 'jupiter')
  onMoonClick // Optional callback when a moon is clicked
}) => {
  const navigate = useNavigate();
  
  // Define moons based on the parent planet
  const getMoonData = () => {
    if (planetId === 'jupiter') {
      return [
        { 
          id: 'io', 
          name: 'Io', 
          color: '#E8D14C', 
          description: 'The most volcanically active body in the solar system, covered in sulfur compounds.', 
          orbitRadius: 6.5, 
          orbitSpeed: 0.015, 
          size: 0.35, 
          startAngle: 0,
          textureGenerator: createIoTexture,
          glowColor: '#FFD166'
        },
        { 
          id: 'europa', 
          name: 'Europa', 
          color: '#F0F8FF', 
          description: 'Has a smooth icy surface hiding a subsurface ocean with potential for life.', 
          orbitRadius: 9.0, 
          orbitSpeed: 0.01, 
          size: 0.32, 
          startAngle: Math.PI * 0.5,
          textureGenerator: createEuropaTexture,
          glowColor: '#B8F3FF'
        },
        { 
          id: 'ganymede', 
          name: 'Ganymede', 
          color: '#C0C8D0', 
          description: 'The largest moon in the solar system with its own magnetic field.', 
          orbitRadius: 12.0, 
          orbitSpeed: 0.006, 
          size: 0.45, 
          startAngle: Math.PI,
          textureGenerator: createGanymedeTexture,
          glowColor: '#D8EEFF'
        },
        { 
          id: 'callisto', 
          name: 'Callisto', 
          color: '#9A9AA0', 
          description: 'One of the most heavily cratered bodies in the solar system.', 
          orbitRadius: 15.5, 
          orbitSpeed: 0.003, 
          size: 0.42, 
          startAngle: Math.PI * 1.5,
          textureGenerator: createCallistoTexture,
          glowColor: '#B0B0C0'
        }
      ];
    }
    // Saturn's moons could be added here in the future
    else if (planetId === 'saturn') {
      return [
        // Saturn's moons like Titan, Enceladus, etc.
      ];
    }
    return [];
  };
  
  const moons = useMemo(() => getMoonData(), [planetId]);
  const [moonAngles, setMoonAngles] = useState({});
  const [hoveredMoon, setHoveredMoon] = useState(null);
  const moonRefs = useRef({});
  
  // Initialize moon angles
  useEffect(() => {
    const initialAngles = {};
    moons.forEach(moon => {
      initialAngles[moon.id] = moon.startAngle || 0;
      moonRefs.current[moon.id] = React.createRef();
    });
    setMoonAngles(initialAngles);
  }, [moons]);
  
  // Create textures for each moon (once)
  const moonTextures = useMemo(() => {
    const textures = {};
    moons.forEach(moon => {
      if (moon.textureGenerator) {
        textures[moon.id] = moon.textureGenerator();
      }
    });
    return textures;
  }, [moons]);
  
  // Update moon positions
  useEffect(() => {
    const intervalIds = moons.map(moon => {
      return setInterval(() => {
        setMoonAngles(prev => ({
          ...prev,
          [moon.id]: (prev[moon.id] + moon.orbitSpeed) % (Math.PI * 2)
        }));
      }, 50);
    });
    
    return () => intervalIds.forEach(id => clearInterval(id));
  }, [moons]);
  
  // Update moon rotations
  useFrame(() => {
    moons.forEach(moon => {
      if (moonRefs.current[moon.id]?.current) {
        moonRefs.current[moon.id].current.rotation.y += 0.003;
      }
    });
  });
  
  // Handle moon click
  const handleMoonClick = (moonId) => {
    if (onMoonClick) {
      onMoonClick(moonId);
    } else {
      // Navigate to moon detail page
      navigate(`/moon/${moonId}`);
    }
  };
  
  return (
    <group>
      {/* Orbit paths */}
      {moons.map(moon => (
        <mesh 
          key={`orbit-${moon.id}`} 
          position={[0, 0, 0]} 
          rotation={[Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[moon.orbitRadius - 0.03, moon.orbitRadius + 0.03, 64]} />
          <meshBasicMaterial color="#444444" transparent opacity={0.3} />
        </mesh>
      ))}
      
      {/* Moons */}
      {moons.map(moon => {
        const angle = moonAngles[moon.id] || 0;
        const x = Math.cos(angle) * moon.orbitRadius;
        const z = Math.sin(angle) * moon.orbitRadius;
        
        return (
          <group key={moon.id}>
            {/* Moon body */}
            <mesh
              ref={moonRefs.current[moon.id]}
              position={[x, 0, z]}
              onClick={() => handleMoonClick(moon.id)}
              onPointerOver={() => setHoveredMoon(moon.id)}
              onPointerOut={() => setHoveredMoon(null)}
            >
              <sphereGeometry args={[moon.size, 32, 32]} />
              <meshStandardMaterial 
                map={moonTextures[moon.id]}
                color={moon.color}
                roughness={0.6}
                metalness={0.2}
              />
            </mesh>
            
            {/* Subtle glow effect layer */}
            <mesh position={[x, 0, z]}>
              <sphereGeometry args={[moon.size * 1.25, 16, 16]} />
              <meshBasicMaterial
                color={moon.glowColor || moon.color}
                transparent={true}
                opacity={0.08}
                side={THREE.BackSide}
                depthWrite={false}
              />
            </mesh>
            
            {/* Second glow layer for subtle inner glow */}
            <mesh position={[x, 0, z]}>
              <sphereGeometry args={[moon.size * 1.08, 24, 24]} />
              <meshBasicMaterial
                color={moon.glowColor || moon.color}
                transparent={true}
                opacity={0.12}
                side={THREE.BackSide}
                depthWrite={false}
              />
            </mesh>
            
            {/* Moon name label - only visible when hovered */}
            <HorizontalText
              position={[x, moon.size * 2, z]}
              fontSize={0.15}
              color="white"
              anchorX="center"
              anchorY="middle"
              renderOrder={10}
              visible={hoveredMoon === moon.id}
            >
              {moon.name}
            </HorizontalText>
            
            {/* Small point light for each moon */}
            <pointLight 
              position={[x, 0, z]} 
              intensity={0.4} 
              distance={3} 
              color={moon.glowColor || "#FFFFFF"} 
            />
          </group>
        );
      })}
    </group>
  );
};

export default PlanetaryMoons;