import React, { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { 
  createEnhancedEarthTexture, 
  createEnhancedCloudTexture,
  createEarthBumpMap,
  createEarthSpecularMap,
  createEarthLightsMap
} from '../../utils/textureGenerators';

/**
 * Detailed Earth component for high-fidelity close-up view
 * Features topographical detail, realistic clouds, weather patterns, and day/night cycle
 */
const DetailedEarth = ({ onMoonClick }) => {
  const earthRef = useRef();
  const cloudsRef = useRef();
  const timeRef = useRef(0);
  
  // Season state (0 = winter, 0.5 = summer in northern hemisphere)
  const [season, setSeason] = useState(0.2);
  
  // Create high-resolution textures
  const earthTexture = useMemo(() => createEnhancedEarthTexture(), []);
  const bumpMap = useMemo(() => createEarthBumpMap(), []);
  const specularMap = useMemo(() => createEarthSpecularMap(), []);
  const cloudTexture = useMemo(() => createEnhancedCloudTexture(), []);
  const nightLightsTexture = useMemo(() => createEarthLightsMap(), []);
  
  // Setup shader uniforms for advanced rendering effects
  const earthUniforms = useMemo(() => ({
    dayTexture: { value: earthTexture },
    nightTexture: { value: nightLightsTexture },
    bumpMap: { value: bumpMap },
    specularMap: { value: specularMap },
    bumpScale: { value: 0.12 },    // Stronger displacement for detailed view
    time: { value: 0.0 },
    season: { value: season },
    lightPosition: { value: new THREE.Vector3(5, 2, 4) },
    mixValue: { value: 0.0 }      // Day/night cycle mix parameter
  }), [earthTexture, nightLightsTexture, bumpMap, specularMap, season]);
  
  
  // Earth rotation and animation
  useFrame((state, delta) => {
    if (earthRef.current) {
      // Slower rotation for close-up view
      earthRef.current.rotation.y += 0.002;
      
      // Update time reference
      timeRef.current += delta * 0.1;
      const time = timeRef.current;
      
      // Update shader uniforms
      if (earthRef.current.material.uniforms) {
        earthRef.current.material.uniforms.time.value = time;
        
        // Update light direction based on time for day/night cycle
        const lightAngle = time * 0.1;
        const lightX = Math.cos(lightAngle) * 5;
        const lightZ = Math.sin(lightAngle) * 5;
        earthRef.current.material.uniforms.lightPosition.value.set(lightX, 2, lightZ);
        
        // Update day/night cycle mix factor
        const dayNightMix = (Math.sin(time) + 1) * 0.5;
        earthRef.current.material.uniforms.mixValue.value = dayNightMix;
      }
    }
    
    // Cloud layer animation - clouds move and evolve over time
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += 0.002; // Base cloud movement
      
      // Subtle cloud layer deformation for more realistic movement
      if (cloudsRef.current.material.uniforms) {
        cloudsRef.current.material.uniforms.time.value = timeRef.current;
      }
    }
  });
  
  // Advanced shaders for realistic Earth rendering
  const earthShader = useMemo(() => {
    return {
      uniforms: earthUniforms,
      vertexShader: `
        uniform sampler2D bumpMap;
        uniform float bumpScale;
        
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec3 vViewPosition;
        
        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          
          // Apply displacement mapping for mountains using bump map
          vec4 bumpData = texture2D(bumpMap, uv);
          float displacement = bumpData.r * bumpScale;
          
          // Apply displacement along normal direction
          vec3 newPosition = position + normal * displacement;
          vPosition = newPosition;
          
          // Calculate view position for specular highlights
          vec4 mvPosition = modelViewMatrix * vec4(newPosition, 1.0);
          vViewPosition = -mvPosition.xyz;
          
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform sampler2D dayTexture;
        uniform sampler2D nightTexture;
        uniform sampler2D specularMap;
        uniform sampler2D bumpMap;
        uniform float time;
        uniform float season;
        uniform float bumpScale;
        uniform vec3 lightPosition;
        uniform float mixValue;
        
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec3 vViewPosition;
        
        void main() {
          // Sample textures
          vec4 dayColor = texture2D(dayTexture, vUv);
          vec4 nightColor = texture2D(nightTexture, vUv);
          float specularValue = texture2D(specularMap, vUv).r;
          
          // Adjust normal using bump map for better lighting
          vec3 normal = normalize(vNormal);
          vec4 bumpData = texture2D(bumpMap, vUv);
          
          // Calculate normal perturbation from bump map
          vec3 bumpNormal = normal;
          bumpNormal.z += bumpData.r * bumpScale * 0.5;
          bumpNormal = normalize(bumpNormal);
          
          // Calculate light direction based on mixValue for day/night cycle
          vec3 lightDir = normalize(vec3(cos(mixValue * 6.28), 0.0, sin(mixValue * 6.28)));
          float lambertian = max(0.0, dot(bumpNormal, lightDir));
          
          // Apply seasonal variations
          float latitude = (vUv.y - 0.5) * 2.0; // -1 to 1 from south to north pole
          
          // Ice caps affected by season
          float polarEffect = abs(latitude) > 0.7 ? (abs(latitude) - 0.7) / 0.3 : 0.0;
          
          // Winter in northern hemisphere when season is 0
          // Summer in northern hemisphere when season is 0.5
          float northHemisphereTemp = mix(-0.2, 0.3, season);
          float southHemisphereTemp = mix(0.3, -0.2, season);
          
          // Adjust color based on season and latitude
          vec4 seasonalColor = dayColor;
          
          // Apply ice caps based on season
          if (latitude > 0.0) {
            // Northern hemisphere
            float snowFactor = max(0.0, polarEffect * (1.0 - northHemisphereTemp * 2.0));
            seasonalColor = mix(seasonalColor, vec4(0.95, 0.95, 1.0, 1.0), snowFactor);
          } else {
            // Southern hemisphere
            float snowFactor = max(0.0, polarEffect * (1.0 - southHemisphereTemp * 2.0));
            seasonalColor = mix(seasonalColor, vec4(0.95, 0.95, 1.0, 1.0), snowFactor);
          }
          
          // Apply day/night transition with smooth terminator
          float dayFactor = smoothstep(-0.1, 0.3, lambertian);
          vec4 finalColor = mix(nightColor * 0.4, seasonalColor, dayFactor);
          
          // Add specular highlight for water surfaces
          vec3 viewDir = normalize(vViewPosition);
          vec3 halfDir = normalize(lightDir + viewDir);
          float specular = pow(max(0.0, dot(bumpNormal, halfDir)), 50.0) * specularValue;
          finalColor.rgb += specular * vec3(1.0, 0.98, 0.9) * dayFactor * 0.5;
          
          // Add subtle subsurface scattering effect for oceans
          float oceanMask = 1.0 - texture2D(specularMap, vUv).g; // Use specular map's green channel as land mask
          float sss = oceanMask * pow(max(0.0, dot(normal, lightDir)), 1.0) * 0.2;
          finalColor.rgb += sss * vec3(0.0, 0.2, 0.4) * dayFactor;
          
          // Add atmospheric rim lighting (Fresnel effect)
          float rim = 1.0 - max(0.0, dot(normalize(-vViewPosition), normal));
          rim = pow(rim, 4.0);
          finalColor.rgb += rim * vec3(0.2, 0.5, 1.0) * 0.2;
          
          gl_FragColor = finalColor;
        }
      `
    };
  }, [earthUniforms]);
  
  // Cloud shader for dynamic cloud behavior
  const cloudShader = useMemo(() => {
    return {
      uniforms: {
        cloudTexture: { value: cloudTexture },
        time: { value: 0.0 }
      },
      vertexShader: `
        varying vec2 vUv;
        
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D cloudTexture;
        uniform float time;
        
        varying vec2 vUv;
        
        // Simple noise function for cloud movement
        float noise(vec2 p) {
          return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
        }
        
        void main() {
          // Add subtle time-based UV offset for cloud movement
          vec2 uv = vUv;
          uv.x += time * 0.002;
          
          // Sample base cloud texture
          vec4 cloudColor = texture2D(cloudTexture, uv);
          
          // Apply subtle distortion for dynamic cloud behavior
          float distortion = noise(uv * 10.0 + time * 0.1) * 0.03;
          vec2 distortedUV = uv + vec2(distortion, distortion * 0.5);
          vec4 distortedCloud = texture2D(cloudTexture, distortedUV);
          
          // Mix original and distorted cloud patterns
          vec4 finalCloud = mix(cloudColor, distortedCloud, 0.3);
          
          // Add subtle variation in opacity
          float opacityVariation = noise(uv * 5.0 + time * 0.05) * 0.2 + 0.8;
          finalCloud.a *= opacityVariation;
          
          gl_FragColor = finalCloud;
        }
      `
    };
  }, [cloudTexture]);
  

  // Update season periodically to show seasonal variation
  useEffect(() => {
    const seasonInterval = setInterval(() => {
      setSeason(prevSeason => {
        const newSeason = (prevSeason + 0.001) % 1;
        return newSeason;
      });
    }, 100); // Update every 100ms
    
    return () => clearInterval(seasonInterval);
  }, []);

  return (
    <group>
      {/* Earth with advanced shader and displacement mapping */}
      <mesh ref={earthRef}>
        <sphereGeometry args={[2, 192, 96]} /> {/* Higher resolution for detailed view */}
        <shaderMaterial
          uniforms={earthShader.uniforms}
          vertexShader={earthShader.vertexShader}
          fragmentShader={earthShader.fragmentShader}
        />
      </mesh>
      
      {/* Cloud layer with dynamic cloud movement */}
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[2.03, 96, 48]} />
        <shaderMaterial
          uniforms={cloudShader.uniforms}
          vertexShader={cloudShader.vertexShader}
          fragmentShader={cloudShader.fragmentShader}
          transparent={true}
          depthWrite={false}
          alphaTest={0.01}
        />
      </mesh>
    </group>
  );
};

export default DetailedEarth;