import { useRef, useState, forwardRef, useImperativeHandle } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'

const Planet = forwardRef((
  { position, color, size = 0.5, planetId, onClick, rotationSpeed = 0.01 }, 
  ref
) => {
  const meshRef = useRef()
  const [hovered, setHovered] = useState(false)
  const materialRef = useRef()
  
  // Handle hover state
  const handlePointerOver = () => setHovered(true)
  const handlePointerOut = () => setHovered(false)
  
  // Expose the mesh reference to parent components
  useImperativeHandle(ref, () => meshRef.current)
  
  // Only apply rotation if rotationSpeed is not 0 (backward compatibility)
  useFrame(() => {
    if (meshRef.current && rotationSpeed !== 0) {
      meshRef.current.rotation.y += rotationSpeed
    }
  })

  // Generate surface texture for planet
  const getDisplacementMap = () => {
    const displacementStrength = {
      'mercury': 0.15,
      'venus': 0.05,
      'earth': 0.1,
      'mars': 0.2,
      'jupiter': 0.08,
      'saturn': 0.06,
      'uranus': 0.03,
      'neptune': 0.04
    }
    
    return displacementStrength[planetId] || 0.1
  }

  return (
    <group>
      <mesh
        ref={meshRef}
        position={position}
        onClick={(e) => {
          e.stopPropagation()
          onClick(planetId)
        }}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        {/* Use icosahedron for better division of faces than sphere */}
        <icosahedronGeometry args={[size, 2]} />
        <meshPhongMaterial 
          ref={materialRef}
          color={color} 
          emissive={hovered ? new THREE.Color(color).multiplyScalar(0.4) : undefined}
          shininess={30}
          flatShading={true}
          displacementScale={getDisplacementMap()}
          wireframe={false}
        />
      </mesh>

      {/* Label that appears on hover */}
      {hovered && (
        <Text
          position={[position[0], position[1] + size + 0.3, position[2]]}
          fontSize={0.3}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          {planetId.charAt(0).toUpperCase() + planetId.slice(1)}
        </Text>
      )}
    </group>
  )
})

export default Planet