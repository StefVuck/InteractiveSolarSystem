import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import HorizontalText from '../common/HorizontalText';
import { 
  createEnhancedEarthTexture, 
  createEnhancedCloudTexture,
  createEarthBumpMap,
  createEarthSpecularMap,
  createEarthLightsMap
} from '../../utils/textureGenerators';

/**
 * Enhanced Earth component for Solar System View
 * Features high-resolution textures, cloud layer, atmosphere, and day/night cycle
 */
function EnhancedEarth({ 
  position, 
  size = 1, 
  name, 
  onClick
}) {
  // References for animation and interaction
  const earthRef = useRef();
  const cloudsRef = useRef();
  const hovered = useRef(false);
  
  // Time tracking for day/night cycle
  const timeRef = useRef(0);
  
  // Create enhanced textures using memo to prevent recreation on each render
  const earthTexture = useMemo(() => createEnhancedEarthTexture(), []);
  const bumpMap = useMemo(() => createEarthBumpMap(), []);
  const specularMap = useMemo(() => createEarthSpecularMap(), []);
  const cloudTexture = useMemo(() => createEnhancedCloudTexture(), []);
  const nightLightsTexture = useMemo(() => createEarthLightsMap(), []);
  
  // Set up shader uniforms for day/night cycle and atmosphere
  const dayNightUniforms = useMemo(() => ({
    dayTexture: { value: earthTexture },
    nightTexture: { value: nightLightsTexture },
    mixValue: { value: 0.0 }
  }), [earthTexture, nightLightsTexture]);
  
  // Earth rotation animation and time-based effects
  useFrame((state, delta) => {
    if (earthRef.current) {
      // Earth rotation - realistic speed for Earth (one rotation per day)
      earthRef.current.rotation.y += 0.004;
      
      // Update time reference
      timeRef.current += delta * 0.1;
      const time = timeRef.current;
      
      // Update day/night cycle
      if (earthRef.current.material.uniforms) {
        // Smoothly transition between day and night based on rotation
        const dayNightMix = (Math.sin(time) + 1) * 0.5;
        earthRef.current.material.uniforms.mixValue.value = dayNightMix;
      }
    }
    
    // Rotate clouds slightly faster than the Earth
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += 0.0045;
    }
  });

  // Custom day/night shader for Earth
  const earthShader = useMemo(() => {
    return {
      uniforms: {
        ...dayNightUniforms,
        bumpMap: { value: bumpMap },
        specularMap: { value: specularMap },
        bumpScale: { value: 0.05 }
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D dayTexture;
        uniform sampler2D nightTexture;
        uniform sampler2D specularMap;
        uniform sampler2D bumpMap;
        uniform float bumpScale;
        uniform float mixValue;
        
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        void main() {
          // Sample day and night textures
          vec4 dayColor = texture2D(dayTexture, vUv);
          vec4 nightColor = texture2D(nightTexture, vUv);
          
          // Apply bump mapping
          vec3 normal = normalize(vNormal);
          
          // Determine day/night mix factor based on surface normal and light direction
          // This creates a smooth terminator (day/night boundary)
          vec3 lightDir = normalize(vec3(cos(mixValue * 6.28), 0.0, sin(mixValue * 6.28)));
          float lambertian = max(0.0, dot(normal, lightDir));
          
          // Adjust transition sharpness
          float dayFactor = smoothstep(0.0, 0.3, lambertian);
          
          // Mix day and night textures
          vec4 finalColor = mix(nightColor * 0.2, dayColor, dayFactor);
          
          // Add specular highlight on water
          float specularIntensity = texture2D(specularMap, vUv).r;
          float specular = pow(max(0.0, dot(reflect(-lightDir, normal), vec3(0.0, 0.0, 1.0))), 10.0);
          finalColor.rgb += specularIntensity * specular * 0.5 * dayFactor;
          
          // Add atmospheric scattering at edges (Fresnel effect)
          float fresnel = pow(1.0 - abs(dot(normal, vec3(0.0, 0.0, 1.0))), 2.0);
          finalColor.rgb += vec3(0.1, 0.4, 0.8) * fresnel * 0.3;
          
          gl_FragColor = finalColor;
        }
      `
    };
  }, [dayNightUniforms, bumpMap, specularMap]);

  return (
    <group>
      {/* Earth mesh with custom day/night shader */}
      <mesh 
        ref={earthRef}
        position={position}
        onClick={onClick}
        onPointerOver={() => { hovered.current = true; }}
        onPointerOut={() => { hovered.current = false; }}
      >
        <sphereGeometry args={[size, 64, 32]} />
        <shaderMaterial 
          attach="material"
          uniforms={earthShader.uniforms}
          vertexShader={earthShader.vertexShader}
          fragmentShader={earthShader.fragmentShader}
          bumpScale={0.05}
        />
      </mesh>
      
      {/* Cloud layer */}
      <mesh 
        ref={cloudsRef} 
        position={position}
      >
        <sphereGeometry args={[size * 1.02, 48, 24]} />
        <meshStandardMaterial
          map={cloudTexture}
          transparent={true}
          opacity={0.4}
          depthWrite={false}
          alphaTest={0.1}
        />
      </mesh>
      
      {/* Aurora and atmosphere glow effects removed */}
      
      {/* Planet name label */}
      <HorizontalText
        position={[
          position[0], 
          position[1] + size + 0.5, 
          position[2]
        ]}
        fontSize={0.5}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.05}
        outlineColor="#000000"
        renderOrder={10} // Ensure text renders on top of all other objects
      >
        {name}
      </HorizontalText>
    </group>
  );
}

export default EnhancedEarth;