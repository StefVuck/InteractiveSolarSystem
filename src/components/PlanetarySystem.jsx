import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import Planet from './Planet'

function PlanetarySystem({ planets, onPlanetClick, systemView = false, isAnimating = false }) {
  const groupRef = useRef()
  const sunRef = useRef()
  const planetRefs = useRef({})
  
  // Create a pulsing effect for the sun
  const sunEmissiveIntensity = useRef(1.0)
  const sunDirection = useRef(1)
  
  // Rotate the entire system slowly
  useFrame((state) => {
    // Only rotate when not animating transition between views
    if (groupRef.current && !isAnimating) {
      groupRef.current.rotation.y += 0.001
    }
    
    // Pulsating sun effect
    if (sunRef.current) {
      // Update the pulsing direction
      if (sunEmissiveIntensity.current > 1.2) sunDirection.current = -1
      if (sunEmissiveIntensity.current < 0.8) sunDirection.current = 1
      
      // Update the emissive intensity
      sunEmissiveIntensity.current += 0.005 * sunDirection.current
      
      // Apply to material
      if (sunRef.current.material) {
        sunRef.current.material.emissiveIntensity = sunEmissiveIntensity.current
      }
    }
    
    // Rotate individual planets at their actual rotation speeds
    planets.forEach((planet, index) => {
      if (planetRefs.current[planet.id]) {
        // Real-world relative rotation speeds
        const rotationSpeeds = {
          'mercury': 0.0017, // 58.6 Earth days
          'venus': -0.00004, // 243 Earth days (retrograde rotation)
          'earth': 0.001,    // Base reference (1 Earth day)
          'mars': 0.0009,    // 1.03 Earth days
          'jupiter': 0.0024, // 0.41 Earth days
          'saturn': 0.0022,  // 0.45 Earth days
          'uranus': 0.0015,  // 0.72 Earth days
          'neptune': 0.0016  // 0.67 Earth days
        };
        
        planetRefs.current[planet.id].rotation.y += rotationSpeeds[planet.id] || 0.001;
      }
    });
  })

  // Calculate orbit radius for each planet
  const getOrbitRadius = (index) => {
    // Start with Mercury at radius 4, increase by 2 for each planet
    return 4 + index * 2
  }

  return (
    <group ref={groupRef}>
      {/* Sun at the center */}
      <mesh ref={sunRef} position={[0, 0, 0]}>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshStandardMaterial 
          color="#FFFF00" 
          emissive="#FFAA00"
          emissiveIntensity={1}
        />
      </mesh>
      
      {/* Subtle sun glow */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[1.8, 32, 32]} />
        <meshBasicMaterial color="#FFFF00" transparent opacity={0.1} />
      </mesh>
      
      {/* Planets */}
      {planets.map((planet, index) => {
        const orbitRadius = getOrbitRadius(index)
        const angle = (index * (Math.PI / 4)) % (2 * Math.PI) // Distribute planets around the sun
        const x = Math.sin(angle) * orbitRadius
        const z = Math.cos(angle) * orbitRadius
        
        return (
          <group key={planet.id}>
            {/* Orbit path (only in system view) */}
            {systemView && (
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
                <ringGeometry args={[orbitRadius - 0.05, orbitRadius + 0.05, 64]} />
                <meshBasicMaterial color="#444444" transparent opacity={0.3} />
              </mesh>
            )}
            
            {/* Planet itself */}
            <Planet 
              ref={(el) => planetRefs.current[planet.id] = el}
              position={[x, 0, z]}
              color={planet.color}
              size={index === 4 || index === 5 ? 0.8 : 0.5} // Jupiter and Saturn slightly larger
              planetId={planet.id}
              onClick={() => onPlanetClick(planet.id)}
              rotationSpeed={0} // Rotation is now handled in the useFrame hook above
            />
          </group>
        )
      })}
    </group>
  )
}

export default PlanetarySystem