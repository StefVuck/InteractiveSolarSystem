import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { useNavigate, useParams } from 'react-router-dom';
import * as THREE from 'three';
import {
  createIoTexture,
  createEuropaTexture,
  createGanymedeTexture,
  createCallistoTexture,
  createMoonTexture,
  createTitanTexture
} from '../../utils/textureGenerators';

/**
 * Component for rendering a detailed view of a moon
 * Used for Earth's moon, Jupiter's moons, and Saturn's moons
 */
const MoonDetailPage = ({ planets, onBackClick, parentPlanetId: propParentId, parentPlanetName: propParentName, moonId: propMoonId }) => {
  console.log('MoonDetailPage props:', { planets, onBackClick, propParentId, propParentName, propMoonId });
  
  const navigate = useNavigate();
  // Get moonId from either props or URL params
  const { moonId: urlMoonId } = useParams();
  const moonId = propMoonId || urlMoonId;
  
  console.log('moonId used:', moonId);
  
  const [parentPlanetId, setParentPlanetId] = useState(propParentId || 'jupiter');
  const [parentPlanetName, setParentPlanetName] = useState(propParentName || 'Jupiter');
  
  // Determine parent planet based on moon ID
  useEffect(() => {
    if (moonId === 'moon') {
      setParentPlanetId('earth');
      setParentPlanetName('Earth');
    } else if (['io', 'europa', 'ganymede', 'callisto'].includes(moonId)) {
      setParentPlanetId('jupiter');
      setParentPlanetName('Jupiter');
    } else if (['titan'].includes(moonId)) {
      setParentPlanetId('saturn');
      setParentPlanetName('Saturn');
    }
  }, [moonId]);
  
  // Get moon data based on ID
  const getMoonData = () => {
    console.log('Moon ID in getMoonData:', moonId);
    
    // Earth's moon
    if (moonId === 'moon') {
      return {
        name: 'The Moon',
        description: "Earth's only natural satellite and the fifth largest moon in the solar system. The Moon's presence helps stabilize our planet's wobble and moderate our climate. Its surface is cratered and barren with regolith covering a rocky surface.",
        color: '#E0E0E0',
        textureGenerator: createMoonTexture
      };
    }
    
    // Jupiter's moons
    if (moonId === 'io') {
      return {
        name: 'Io',
        description: 'The most volcanically active body in the solar system due to tidal heating from Jupiter. Io is covered in sulfur compounds that give it a distinctive yellow-orange-red appearance. Its surface is constantly being reshaped by hundreds of active volcanoes.',
        color: '#E8D14C',
        textureGenerator: createIoTexture
      };
    }
    
    if (moonId === 'europa') {
      return {
        name: 'Europa',
        description: 'Europa has a smooth icy surface covering a subsurface ocean of liquid water. The reddish-brown lines crisscrossing the surface are fractures in the ice called "linea." Scientists believe Europa may have conditions suitable for life in its subsurface ocean.',
        color: '#F0F8FF',
        textureGenerator: createEuropaTexture
      };
    }
    
    if (moonId === 'ganymede') {
      return {
        name: 'Ganymede',
        description: 'The largest moon in the solar system, even bigger than the planet Mercury. Ganymede is the only moon with its own magnetic field. Its surface has two main types of terrain: dark, heavily cratered regions and lighter, grooved areas.',
        color: '#C0C8D0',
        textureGenerator: createGanymedeTexture
      };
    }
    
    if (moonId === 'callisto') {
      return {
        name: 'Callisto',
        description: 'The most heavily cratered object in the solar system, with a surface that has remained largely unchanged for over 4 billion years. Callisto is the third largest moon in the solar system and likely has a subsurface ocean beneath its icy crust. Its surface has a mix of dark and bright regions with numerous impact craters.',
        color: '#9A9AA0',
        textureGenerator: createCallistoTexture
      };
    }
    
    // Saturn's moons
    if (moonId === 'titan') {
      console.log('Rendering Titan!');
      return {
        name: 'Titan',
        description: "Saturn's largest moon and the second largest in the solar system. Titan is the only moon with a dense atmosphere, composed mainly of nitrogen with clouds of methane and ethane. Its surface features lakes and seas of liquid hydrocarbons, making it the only place besides Earth known to have stable liquid on its surface. Beneath its thick orange haze, Titan has a landscape with mountains, dunes, and river networks that eerily resembles Earth.",
        color: '#E8A952',
        textureGenerator: createTitanTexture
      };
    }
    
    // Log if we're falling back to default case
    console.log('Using default case for moon:', moonId);
    
    // Default case
    return {
      name: 'Unknown Moon',
      description: 'No data available for this moon.',
      color: '#CCCCCC',
      textureGenerator: null
    };
  };
  
  const moonData = getMoonData();
  const texture = moonData.textureGenerator ? moonData.textureGenerator() : null;
  
  // Handle back button click
  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      navigate(`/planet/${parentPlanetId}`);
    }
  };
  
  return (
    <div className="planet-page moon-page">
      <div className="planet-info">
        <h1>{moonData.name}</h1>
        <p>{moonData.description}</p>
        <button className="back-button" onClick={handleBackClick}>
          ← Back to {parentPlanetName || 'Earth'}
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
          
          {/* Moon with texture */}
          <mesh rotation={[0, 0, 0]}>
            <sphereGeometry args={[2, 64, 64]} />
            <meshStandardMaterial 
              map={texture}
              color={moonData.color}
              roughness={0.8}
              metalness={0.2}
              bumpScale={0.05}
            />
          </mesh>
          
          {/* Subtle glow effect layer */}
          <mesh>
            <sphereGeometry args={[2.3, 32, 32]} />
            <meshBasicMaterial
              color={moonData.color}
              transparent={true}
              opacity={0.08}
              side={THREE.BackSide}
              depthWrite={false}
            />
          </mesh>
          
          {/* Second closer glow layer */}
          <mesh>
            <sphereGeometry args={[2.15, 48, 48]} />
            <meshBasicMaterial
              color={moonData.color}
              transparent={true}
              opacity={0.12}
              side={THREE.BackSide}
              depthWrite={false}
            />
          </mesh>
          
          {/* Small distant stars */}
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} />
          
          {/* Controls */}
          <OrbitControls 
            autoRotate={true}
            autoRotateSpeed={0.5}
            enablePan={false}
            minDistance={3.5}
            maxDistance={10}
          />
        </Canvas>
      </div>
    </div>
  );
};

export default MoonDetailPage;