import React, { useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { Sphere, Text } from '@react-three/drei';
import * as THREE from 'three';

interface VisitedCountry {
  name: string;
  year?: number;
  color?: string;
}

interface EarthWithNASATexturesProps {
  visitedCountries: VisitedCountry[];
  showLabels?: boolean;
}

// Country coordinates (latitude, longitude) for major destinations
const COUNTRY_COORDINATES: { [key: string]: [number, number] } = {
  'France': [46.6034, 1.8883],
  'Japan': [36.2048, 138.2529],
  'Indonesia': [-0.7893, 113.9213],
  'USA': [37.0902, -95.7129],
  'Italy': [41.8719, 12.5674],
  'UAE': [23.4241, 53.8478],
  'UK': [55.3781, -3.4360],
  'Spain': [40.4637, -3.7492],
  'Thailand': [15.8700, 100.9925],
  'Germany': [51.1657, 10.4515],
  'Australia': [-25.2744, 133.7751],
  'Brazil': [-14.2350, -51.9253],
  'India': [20.5937, 78.9629],
  'China': [35.8617, 104.1954],
  'Canada': [56.1304, -106.3468],
  'Mexico': [23.6345, -102.5528]
};

// Convert lat/lng to 3D coordinates on a sphere
const latLngToVector3 = (lat: number, lng: number, radius: number = 5): THREE.Vector3 => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  
  const x = radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  
  return new THREE.Vector3(x, y, z);
};

// NASA Earth textures - using publicly available earth texture URLs
const EARTH_TEXTURE_URLS = {
  // Blue Marble texture from NASA (public domain)
  day: 'https://unpkg.com/three@latest/examples/textures/planets/earth_atmos_2048.jpg',
  night: 'https://unpkg.com/three@latest/examples/textures/planets/earth_lights_2048.png',
  normal: 'https://unpkg.com/three@latest/examples/textures/planets/earth_normal_2048.jpg',
  specular: 'https://unpkg.com/three@latest/examples/textures/planets/earth_specular_2048.jpg',
  clouds: 'https://unpkg.com/three@latest/examples/textures/planets/earth_clouds_1024.png'
};

const EarthWithNASATextures: React.FC<EarthWithNASATexturesProps> = ({ 
  visitedCountries, 
  showLabels = false 
}) => {
  const earthRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);

  // Load NASA textures with fallback
  let dayTexture: THREE.Texture | null = null;
  let nightTexture: THREE.Texture | null = null;
  let normalTexture: THREE.Texture | null = null;
  let specularTexture: THREE.Texture | null = null;
  let cloudsTexture: THREE.Texture | null = null;

  try {
    dayTexture = useLoader(THREE.TextureLoader, EARTH_TEXTURE_URLS.day);
    nightTexture = useLoader(THREE.TextureLoader, EARTH_TEXTURE_URLS.night);
    normalTexture = useLoader(THREE.TextureLoader, EARTH_TEXTURE_URLS.normal);
    specularTexture = useLoader(THREE.TextureLoader, EARTH_TEXTURE_URLS.specular);
    cloudsTexture = useLoader(THREE.TextureLoader, EARTH_TEXTURE_URLS.clouds);
  } catch (error) {
    console.log('Failed to load NASA textures, will use procedural textures');
  }

  useFrame((_, delta) => {
    if (earthRef.current) {
      earthRef.current.rotation.y += delta * 0.05;
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * 0.03;
    }
    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y += delta * 0.02;
    }
  });

  // Fallback procedural texture if NASA textures fail
  const fallbackTexture = React.useMemo(() => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 2048;
    canvas.height = 1024;
    
    if (!context) return new THREE.CanvasTexture(canvas);
    
    // Create a more detailed earth texture
    const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#1e40af');
    gradient.addColorStop(0.3, '#3b82f6');
    gradient.addColorStop(0.7, '#22c55e');
    gradient.addColorStop(1, '#eab308');
    
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add continents as simplified shapes
    const continents = [
      // Rough continent shapes
      { x: 200, y: 300, w: 400, h: 200, color: '#16a34a' }, // North America
      { x: 400, y: 600, w: 200, h: 300, color: '#15803d' }, // South America
      { x: 900, y: 250, w: 300, h: 500, color: '#ca8a04' }, // Africa
      { x: 950, y: 150, w: 200, h: 200, color: '#22c55e' }, // Europe
      { x: 1200, y: 100, w: 600, h: 400, color: '#16a34a' }, // Asia
      { x: 1500, y: 650, w: 200, h: 100, color: '#eab308' } // Australia
    ];
    
    continents.forEach(continent => {
      context.fillStyle = continent.color;
      context.globalAlpha = 0.8;
      context.fillRect(continent.x, continent.y, continent.w, continent.h);
    });
    
    return new THREE.CanvasTexture(canvas);
  }, []);

  // Atmosphere shader
  const atmosphereMaterial = React.useMemo(() => new THREE.ShaderMaterial({
    vertexShader: `
      varying vec3 vNormal;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vNormal;
      void main() {
        float intensity = pow(0.7 - dot(vNormal, vec3(0, 0, 1.0)), 2.0);
        gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0) * intensity;
      }
    `,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    transparent: true
  }), []);

  return (
    <group>
      {/* Atmospheric glow */}
      <mesh ref={atmosphereRef}>
        <sphereGeometry args={[5.3, 64, 32]} />
        <primitive object={atmosphereMaterial} />
      </mesh>
      
      {/* Main Earth */}
      <Sphere ref={earthRef} args={[5, 128, 64]}>
        <meshPhongMaterial 
          map={dayTexture || fallbackTexture}
          normalMap={normalTexture}
          specularMap={specularTexture}
          emissiveMap={nightTexture}
          emissive="#ffff88"
          emissiveIntensity={nightTexture ? 0.1 : 0.05}
          shininess={100}
        />
      </Sphere>
      
      {/* Clouds */}
      <Sphere ref={cloudsRef} args={[5.01, 64, 32]}>
        <meshLambertMaterial 
          map={cloudsTexture}
          transparent
          opacity={cloudsTexture ? 0.4 : 0.2}
          color={cloudsTexture ? "#ffffff" : "#ffffff"}
        />
      </Sphere>
      
      {/* Country markers */}
      {visitedCountries.map((country, index) => {
        const coords = COUNTRY_COORDINATES[country.name];
        if (!coords) return null;
        
        const position = latLngToVector3(coords[0], coords[1], 5.15);
        const color = country.color || '#ff4444';
        
        return (
          <group key={`${country.name}-${index}`}>
            {/* Main marker */}
            <Sphere position={[position.x, position.y, position.z]} args={[0.08, 16, 16]}>
              <meshBasicMaterial
                color={color}
              />
            </Sphere>
            
            {/* Glow ring */}
            <Sphere position={[position.x, position.y, position.z]} args={[0.2, 16, 16]}>
              <meshBasicMaterial 
                color={color} 
                transparent 
                opacity={0.1}
                side={THREE.DoubleSide}
              />
            </Sphere>
            
            {/* Vertical beam */}
            <mesh position={[position.x, position.y, position.z]}>
              <cylinderGeometry args={[0.01, 0.01, 1.5, 8]} />
              <meshBasicMaterial
                color={color}
                transparent
                opacity={0.4}
              />
            </mesh>
            
            {/* Country labels */}
            {showLabels && (
              <Text
                position={[position.x * 1.3, position.y * 1.3, position.z * 1.3]}
                fontSize={0.2}
                color="#ffffff"
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.01}
                outlineColor="#000000"
              >
                {country.name}
                {country.year && `\n${country.year}`}
              </Text>
            )}
          </group>
        );
      })}
    </group>
  );
};

export default EarthWithNASATextures;