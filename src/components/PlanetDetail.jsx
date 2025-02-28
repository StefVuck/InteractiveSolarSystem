import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Simple noise function for geometry displacement
function simpleNoise(x, y, z) {
  return Math.sin(x * 5) * Math.cos(y * 3) * Math.sin(z * 2) * 0.5;
}

function PlanetDetail({ planet, position }) {
  const meshRef = useRef()
  const ringsRef = useRef()
  
  // Generate a displacement map for the planet's surface
  const displacementMap = useMemo(() => {
    // Different planets have different terrain characteristics
    const terrainTypes = {
      'mercury': { frequency: 0.8, amplitude: 0.2, octaves: 4 },
      'venus': { frequency: 0.4, amplitude: 0.1, octaves: 2 },
      'earth': { frequency: 0.5, amplitude: 0.15, octaves: 3 },
      'mars': { frequency: 0.6, amplitude: 0.3, octaves: 4 },
      'jupiter': { frequency: 0.2, amplitude: 0.08, octaves: 2 },
      'saturn': { frequency: 0.25, amplitude: 0.05, octaves: 2 },
      'uranus': { frequency: 0.3, amplitude: 0.06, octaves: 2 },
      'neptune': { frequency: 0.35, amplitude: 0.07, octaves: 2 }
    }
    
    const terrain = terrainTypes[planet.id] || { frequency: 0.5, amplitude: 0.1, octaves: 3 }
    
    // Create terrain using vertex displacement
    const modifyGeometry = (geometry) => {
      const positionAttribute = geometry.getAttribute('position')
      const vertex = new THREE.Vector3()
      
      // Apply noise to each vertex
      for (let i = 0; i < positionAttribute.count; i++) {
        vertex.fromBufferAttribute(positionAttribute, i)
        
        const originalLength = vertex.length()
        
        // Normalize to get direction
        vertex.normalize()
        
        // Apply noise to get terrain
        let displacement = 0
        let amplitude = terrain.amplitude
        let frequency = terrain.frequency
        
        // Add multiple octaves of noise for more detail
        for (let j = 0; j < terrain.octaves; j++) {
          displacement += amplitude * simpleNoise(
            vertex.x * frequency, 
            vertex.y * frequency, 
            vertex.z * frequency
          )
          amplitude *= 0.5
          frequency *= 2
        }
        
        // Apply displacement
        vertex.multiplyScalar(originalLength * (1 + displacement))
        
        // Set new position
        positionAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z)
      }
      
      geometry.computeVertexNormals()
    }
    
    return modifyGeometry
  }, [planet.id])
  
  // Create a more detailed planet for the individual page
  useFrame((state) => {
    if (meshRef.current) {
      // Rotate the planet
      meshRef.current.rotation.y += 0.005
      
      // Add a slight wobble for gas giants
      if (['jupiter', 'saturn', 'uranus', 'neptune'].includes(planet.id)) {
        meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.05
      }
    }
    
    // Rotate Saturn's rings
    if (ringsRef.current) {
      ringsRef.current.rotation.z += 0.001
    }
  })

  // Determine planet characteristics
  const getSize = () => {
    const sizes = {
      'mercury': 2,
      'venus': 2.2,
      'earth': 2.3,
      'mars': 2.1,
      'jupiter': 4,
      'saturn': 3.8,
      'uranus': 3,
      'neptune': 3
    }
    return sizes[planet.id] || 2.5
  }

  const getRings = () => {
    return planet.id === 'saturn'
  }
  
  // Add atmospheric glow for planets with atmospheres
  const getAtmosphere = () => {
    if (['earth', 'venus', 'jupiter', 'saturn', 'uranus', 'neptune'].includes(planet.id)) {
      const atmosphereColors = {
        'earth': '#6ca6ff',
        'venus': '#ffeb99',
        'jupiter': '#e8d8a0',
        'saturn': '#e8d8a0',
        'uranus': '#c1efff',
        'neptune': '#88bce8'
      }
      
      return atmosphereColors[planet.id]
    }
    return null
  }
  
  const atmosphereColor = getAtmosphere()
  const size = getSize()
  
  // Configure detail level based on planet size
  const getDetailLevel = () => {
    return planet.id === 'earth' ? 6 : 5
  }

  return (
    <group position={position}>
      {/* Atmosphere glow effect if applicable */}
      {atmosphereColor && (
        <mesh>
          <sphereGeometry args={[size * 1.05, 32, 32]} />
          <meshBasicMaterial 
            color={atmosphereColor} 
            transparent={true} 
            opacity={0.3}
            side={THREE.BackSide}
          />
        </mesh>
      )}
      
      {/* Planet */}
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[size, getDetailLevel()]} />
        <meshStandardMaterial 
          color={planet.color} 
          roughness={0.7}
          metalness={0.2}
          flatShading={true}
          onBeforeCompile={(shader) => {
            // Apply the displacement map to the geometry
            const geometry = meshRef.current.geometry
            displacementMap(geometry)
          }}
        />
      </mesh>
      
      {/* Saturn's rings */}
      {getRings() && (
        <mesh ref={ringsRef} rotation={[Math.PI / 4, 0, 0]}>
          <ringGeometry args={[size * 1.3, size * 1.8, 128]} />
          <meshPhongMaterial 
            color="#DDCC88" 
            side={THREE.DoubleSide} 
            transparent={true}
            opacity={0.7}
            flatShading={true}
          />
        </mesh>
      )}
    </group>
  )
}

export default PlanetDetail