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
  createTitanTexture,
  createPhobosTexture,
  createDeimosTexture,
  createCharonTexture
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
    } else if (['phobos', 'deimos'].includes(moonId)) {
      setParentPlanetId('mars');
      setParentPlanetName('Mars');
    } else if (['charon'].includes(moonId)) {
      setParentPlanetId('pluto');
      setParentPlanetName('Pluto');
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
    
    // Mars' moons
    if (moonId === 'phobos') {
      return {
        name: 'Phobos',
        description: "The larger and innermost of Mars' two moons. Phobos is heavily cratered and has a distinctive large impact crater called Stickney. It orbits extremely close to Mars and completes an orbit in less than 8 hours. Due to tidal forces, Phobos is slowly spiraling inward toward Mars and will eventually either crash into the planet or break apart into a ring in about 50 million years. Its irregular shape and grooved surface suggest it may be a captured asteroid.",
        color: '#8F7A6A',
        textureGenerator: createPhobosTexture
      };
    }
    
    if (moonId === 'deimos') {
      return {
        name: 'Deimos',
        description: "The smaller and outermost of Mars' two moons. Deimos has a smoother appearance with fewer craters than Phobos, suggesting a younger surface. Like Phobos, it is thought to be a captured asteroid with a composition similar to C-type or D-type asteroids. Deimos orbits Mars about every 30 hours and is gradually spiraling away from the planet, similar to how Earth's Moon is slowly moving away from Earth.",
        color: '#9A8A7A',
        textureGenerator: createDeimosTexture
      };
    }
    
    // Pluto's moon
    if (moonId === 'charon') {
      return {
        name: 'Charon',
        description: "Pluto's largest moon, discovered in 1978, which has a diameter just over half that of Pluto. Charon is so large relative to Pluto that the system's center of mass lies outside Pluto, making them a true binary system where they orbit a point in space between them. Charon's surface features a distinctive reddish north polar region known as Mordor Macula, as well as canyons, mountains, and craters. The New Horizons mission in 2015 provided the first detailed images of this distant world.",
        color: '#B8BCC0',
        textureGenerator: createCharonTexture
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
          
          {/* Moon with texture - handle irregular shapes differently */}
          {moonId === 'phobos' || moonId === 'deimos' ? (
            // Irregular shape for Phobos and Deimos
            <group rotation={[0, 0, 0]}>
              {/* Main body with low poly for lumpy appearance */}
              <mesh>
                <icosahedronGeometry args={[2, 1]} /> {/* Low poly count for irregular shape */}
                <meshStandardMaterial 
                  map={texture}
                  color={moonData.color}
                  roughness={0.9}
                  metalness={0.1}
                  bumpScale={0.2}
                  flatShading={true}
                />
              </mesh>
              
              {/* Additional lumps for Phobos */}
              {moonId === 'phobos' && (
                <>
                  {/* Large Stickney crater depression */}
                  <mesh position={[-1.2, 0.5, 0.7]} rotation={[0.2, 0.5, 0.1]}>
                    <sphereGeometry args={[0.9, 16, 16]} />
                    <meshStandardMaterial 
                      map={texture}
                      color={moonData.color}
                      roughness={0.9}
                      metalness={0.1}
                      side={THREE.BackSide}
                      flatShading={true}
                    />
                  </mesh>
                  
                  {/* Additional lumps to create potato shape */}
                  <mesh position={[1.0, 0.3, 0.2]} rotation={[0.3, 0.7, 0.4]}>
                    <sphereGeometry args={[1.1, 8, 8]} />
                    <meshStandardMaterial 
                      map={texture}
                      color={moonData.color}
                      roughness={0.9}
                      metalness={0.1}
                      flatShading={true}
                    />
                  </mesh>
                  
                  <mesh position={[-0.7, -0.5, -0.8]} rotation={[0.5, 0.2, 0.6]}>
                    <sphereGeometry args={[0.8, 8, 8]} />
                    <meshStandardMaterial 
                      map={texture}
                      color={moonData.color}
                      roughness={0.9}
                      metalness={0.1}
                      flatShading={true}
                    />
                  </mesh>
                </>
              )}
              
              {/* More subtle lumps for Deimos */}
              {moonId === 'deimos' && (
                <>
                  <mesh position={[0.8, 0.6, 0.3]} rotation={[0.1, 0.2, 0.3]}>
                    <sphereGeometry args={[1.0, 8, 8]} />
                    <meshStandardMaterial 
                      map={texture}
                      color={moonData.color}
                      roughness={0.8}
                      metalness={0.1}
                      flatShading={true}
                    />
                  </mesh>
                  
                  <mesh position={[-0.5, -0.3, 0.5]} rotation={[0.4, 0.3, 0.1]}>
                    <sphereGeometry args={[0.9, 8, 8]} />
                    <meshStandardMaterial 
                      map={texture}
                      color={moonData.color}
                      roughness={0.8}
                      metalness={0.1}
                      flatShading={true}
                    />
                  </mesh>
                </>
              )}
            </group>
          ) : (
            // Regular spherical shape for other moons
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
          )}
          
          {/* Enhanced glow effect layer */}
          <mesh>
            <sphereGeometry args={[2.5, 32, 32]} />
            <meshBasicMaterial
              color={moonData.color}
              transparent={true}
              opacity={moonId === 'phobos' || moonId === 'deimos' ? 0.15 : 0.08}
              side={THREE.BackSide}
              depthWrite={false}
            />
          </mesh>
          
          {/* Second closer glow layer */}
          <mesh>
            <sphereGeometry args={[2.25, 48, 48]} />
            <meshBasicMaterial
              color={moonData.color}
              transparent={true}
              opacity={moonId === 'phobos' || moonId === 'deimos' ? 0.2 : 0.12}
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