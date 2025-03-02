import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFrame } from '@react-three/fiber';
import HorizontalText from '../common/HorizontalText';
import * as THREE from 'three';
import {
  createIoTexture,
  createEuropaTexture,
  createGanymedeTexture,
  createCallistoTexture,
  createTitanTexture,
  createPhobosTexture,
  createDeimosTexture,
  createCharonTexture
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
    // Saturn's moons
    else if (planetId === 'saturn') {
      return [
        { 
          id: 'titan', 
          name: 'Titan', 
          color: '#E8A952', 
          description: 'The largest moon of Saturn and the only moon in our solar system with a dense atmosphere and liquid on its surface.', 
          orbitRadius: 10.0, 
          orbitSpeed: 0.005, 
          size: 0.5, 
          startAngle: Math.PI * 0.25,
          textureGenerator: createTitanTexture,
          glowColor: '#FFCE7A'
        }
        // More Saturn moons like Enceladus can be added in the future
      ];
    }
    // Mars' moons
    else if (planetId === 'mars') {
      return [
        { 
          id: 'phobos', 
          name: 'Phobos', 
          color: '#B9A69A', // Brightened color for better visibility
          description: 'The larger and innermost of Mars\' two moons, heavily cratered and irregularly shaped. It orbits extremely close to Mars and will eventually crash into the planet or break apart into a ring.', 
          orbitRadius: 3.5, // Brought closer to Mars
          orbitSpeed: 0.03, // Fast orbital period (< 8 hours)
          size: 0.3, // Increased size for visibility
          startAngle: Math.PI * 0.75,
          textureGenerator: createPhobosTexture,
          glowColor: '#FFDA9F', // Brighter glow
          isIrregular: true // Flag for irregular shape rendering
        },
        { 
          id: 'deimos', 
          name: 'Deimos', 
          color: '#C9BAA9', // Brightened color for better visibility
          description: 'The smaller and outermost of Mars\' two moons. Less cratered than Phobos with a smoother appearance.', 
          orbitRadius: 6.0, // Brought a bit closer
          orbitSpeed: 0.008, // Slower than Phobos
          size: 0.2, // Increased size for visibility
          startAngle: Math.PI * 1.5,
          textureGenerator: createDeimosTexture,
          glowColor: '#FFE8C8', // Brighter glow
          isIrregular: true // Flag for irregular shape rendering
        }
      ];
    }
    // Pluto's moons (when pluto is accessed as a dwarf planet)
    else if (planetId === 'pluto') {
      return [
        { 
          id: 'charon', 
          name: 'Charon', 
          color: '#B8BCC0', 
          description: 'Pluto\'s largest moon, nearly half the size of Pluto itself. Charon and Pluto orbit around a common center of gravity (barycenter) that lies between them, making them a binary system. Charon\'s north pole has a distinctive dark reddish region known as Mordor Macula.', 
          orbitRadius: 4.0, 
          orbitSpeed: 0.007, 
          size: 0.5, // Relatively large compared to Pluto
          startAngle: Math.PI * 0.5,
          textureGenerator: createCharonTexture,
          glowColor: '#C8CCD0',
          // Charon is more spherical than Mars' moons, so we don't set isIrregular
        }
        // Add more of Pluto's moons in the future (Nix, Hydra, Kerberos, Styx)
      ];
    }
    return [];
  };
  
  const moons = useMemo(() => getMoonData(), [planetId]);
  const [moonAngles, setMoonAngles] = useState({});
  const [hoveredMoon, setHoveredMoon] = useState(null);
  const moonRefs = useRef({});
  
  // Early return if no moons are defined for this planet or for "problem" dwarf planets
  // We have a specific whitelist of planets we know are safe
  const safeWithMoons = ['earth', 'jupiter', 'saturn', 'mars', 'pluto'];
  
  if (!safeWithMoons.includes(planetId) || moons.length === 0) {
    console.log(`Skipping moons for planet ${planetId} - either not in whitelist or no moons defined`);
    return null;
  }
  
  // Initialize moon angles - this will only run if we have moons
  useEffect(() => {
    const initialAngles = {};
    moons.forEach(moon => {
      initialAngles[moon.id] = moon.startAngle || 0;
      moonRefs.current[moon.id] = React.createRef();
    });
    setMoonAngles(initialAngles);
  }, [moons]);
  
  // Create textures for each moon (once) with caching
  const moonTextures = useMemo(() => {
    const textures = {};
    moons.forEach(moon => {
      if (moon.textureGenerator) {
        // Check for cached texture first
        const cacheKey = `moon-${moon.id}`;
        if (window.cachedTextures && window.cachedTextures[cacheKey]) {
          textures[moon.id] = window.cachedTextures[cacheKey];
        } else {
          // Generate and cache the texture
          textures[moon.id] = moon.textureGenerator();
          
          // Store in global cache
          if (!window.cachedTextures) window.cachedTextures = {};
          window.cachedTextures[cacheKey] = textures[moon.id];
        }
      }
    });
    return textures;
  }, [moons, planetId]);
  
  // Update moon positions - ensure we have moon angles set first
  useEffect(() => {
    if (Object.keys(moonAngles).length === 0) return; // Skip if moonAngles isn't initialized yet
    
    const intervalIds = moons.map(moon => {
      return setInterval(() => {
        setMoonAngles(prev => ({
          ...prev,
          [moon.id]: (prev[moon.id] + moon.orbitSpeed) % (Math.PI * 2)
        }));
      }, 50);
    });
    
    return () => intervalIds.forEach(id => clearInterval(id));
  }, [moons, moonAngles]);
  
  // Update moon rotations - with additional safety checks
  useFrame(() => {
    // Only run this if moons is not empty and moonRefs is set up
    if (moons.length === 0 || Object.keys(moonRefs.current).length === 0) return;
    
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
            <group 
              ref={moonRefs.current[moon.id]}
              position={[x, 0, z]}
              onClick={() => handleMoonClick(moon.id)}
              onPointerOver={() => setHoveredMoon(moon.id)}
              onPointerOut={() => setHoveredMoon(null)}
            >
              {/* For irregular moons like Phobos and Deimos, use shapes that look less spherical */}
              {moon.isIrregular ? (
                <>
                  {/* Main body - using lower poly for more "lumpy" look */}
                  <mesh rotation={[Math.random(), Math.random(), Math.random()]}>
                    <icosahedronGeometry args={[moon.size, 1]} /> {/* Low poly count for irregular shape */}
                    <meshStandardMaterial 
                      map={moonTextures[moon.id]}
                      color={moon.color}
                      roughness={0.8}
                      metalness={0.1}
                      bumpScale={0.2} 
                      flatShading={true} /* Important for irregular look */
                    />
                  </mesh>
                  
                  {/* Add some lumps to make it more irregular */}
                  <mesh rotation={[Math.PI/3, Math.PI/4, Math.PI/5]} position={[moon.size * 0.3, moon.size * 0.3, 0]}>
                    <sphereGeometry args={[moon.size * 0.5, 6, 6]} />
                    <meshStandardMaterial 
                      color={moon.color}
                      roughness={0.8}
                      metalness={0.1}
                      map={moonTextures[moon.id]}
                      flatShading={true}
                    />
                  </mesh>
                  
                  {/* Another lump for more irregularity */}
                  <mesh rotation={[Math.PI/5, Math.PI/2, Math.PI/3]} position={[-moon.size * 0.2, -moon.size * 0.2, moon.size * 0.2]}>
                    <sphereGeometry args={[moon.size * 0.4, 6, 6]} />
                    <meshStandardMaterial 
                      color={moon.color}
                      roughness={0.8}
                      metalness={0.1}
                      map={moonTextures[moon.id]}
                      flatShading={true}
                    />
                  </mesh>
                </>
              ) : (
                <mesh>
                  <sphereGeometry args={[moon.size, 32, 32]} />
                  <meshStandardMaterial 
                    map={moonTextures[moon.id]}
                    color={moon.color}
                    roughness={0.6}
                    metalness={0.2}
                  />
                </mesh>
              )}
            </group>
            
            {/* Enhanced glow effect layer */}
            <mesh position={[x, 0, z]}>
              <sphereGeometry args={[moon.size * 1.35, 16, 16]} />
              <meshBasicMaterial
                color={moon.glowColor || moon.color}
                transparent={true}
                opacity={0.15} /* Increased opacity for better visibility */
                side={THREE.BackSide}
                depthWrite={false}
              />
            </mesh>
            
            {/* Second glow layer for subtle inner glow */}
            <mesh position={[x, 0, z]}>
              <sphereGeometry args={[moon.size * 1.15, 24, 24]} />
              <meshBasicMaterial
                color={moon.glowColor || moon.color}
                transparent={true}
                opacity={0.25} /* Increased opacity for better visibility */
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