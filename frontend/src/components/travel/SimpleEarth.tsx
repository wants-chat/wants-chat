import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Text } from '@react-three/drei';
import * as THREE from 'three';

interface VisitedCountry {
  name: string;
  year?: number;
  color?: string;
}

interface SimpleEarthProps {
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

const SimpleEarth: React.FC<SimpleEarthProps> = ({ visitedCountries, showLabels = false }) => {
  const earthRef = useRef<THREE.Mesh>(null);
  
  useFrame((_, delta) => {
    if (earthRef.current) {
      earthRef.current.rotation.y += delta * 0.05;
    }
  });

  // Create a very simple Earth texture for testing
  const earthTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 1024;
    canvas.height = 512;
    
    if (!context) return null;
    
    // Ocean with realistic gradient
    const oceanGradient = context.createLinearGradient(0, 0, 0, canvas.height);
    oceanGradient.addColorStop(0, '#6BB6FF');      // Lighter blue at top (Arctic)
    oceanGradient.addColorStop(0.15, '#4A90E2');   // Light blue
    oceanGradient.addColorStop(0.4, '#1E40AF');    // Deep blue (Atlantic/Pacific)
    oceanGradient.addColorStop(0.6, '#1E40AF');    // Deep blue equatorial
    oceanGradient.addColorStop(0.85, '#4A90E2');   // Light blue
    oceanGradient.addColorStop(1, '#6BB6FF');      // Lighter blue at bottom (Antarctic)
    
    context.fillStyle = oceanGradient;
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Realistic world geography - using equirectangular projection coordinates
    const drawContinent = (path: {x: number, y: number}[], color: string) => {
      if (path.length < 3) return;
      
      context.fillStyle = color;
      context.beginPath();
      context.moveTo(path[0].x, path[0].y);
      
      for (let i = 1; i < path.length; i++) {
        context.lineTo(path[i].x, path[i].y);
      }
      context.closePath();
      context.fill();
    };
    
    // North America (more accurate shape)
    drawContinent([
      {x: 50, y: 180}, {x: 120, y: 160}, {x: 180, y: 140}, {x: 220, y: 150},
      {x: 280, y: 170}, {x: 300, y: 200}, {x: 290, y: 240}, {x: 270, y: 270},
      {x: 240, y: 280}, {x: 200, y: 285}, {x: 160, y: 280}, {x: 120, y: 270},
      {x: 80, y: 250}, {x: 50, y: 220}
    ], '#2d5016');
    
    // South America
    drawContinent([
      {x: 280, y: 290}, {x: 320, y: 300}, {x: 340, y: 320}, {x: 350, y: 360},
      {x: 355, y: 400}, {x: 350, y: 440}, {x: 340, y: 470}, {x: 320, y: 480},
      {x: 300, y: 470}, {x: 285, y: 450}, {x: 275, y: 420}, {x: 270, y: 380},
      {x: 275, y: 340}, {x: 280, y: 310}
    ], '#228b22');
    
    // Europe
    drawContinent([
      {x: 480, y: 130}, {x: 520, y: 125}, {x: 560, y: 130}, {x: 580, y: 140},
      {x: 570, y: 160}, {x: 550, y: 170}, {x: 520, y: 175}, {x: 490, y: 170},
      {x: 470, y: 155}, {x: 475, y: 140}
    ], '#4a7c59');
    
    // Africa (more accurate shape)
    drawContinent([
      {x: 500, y: 180}, {x: 540, y: 175}, {x: 580, y: 185}, {x: 600, y: 210},
      {x: 605, y: 250}, {x: 600, y: 290}, {x: 590, y: 330}, {x: 580, y: 360},
      {x: 570, y: 380}, {x: 550, y: 395}, {x: 520, y: 400}, {x: 490, y: 395},
      {x: 470, y: 380}, {x: 460, y: 350}, {x: 465, y: 320}, {x: 470, y: 290},
      {x: 480, y: 260}, {x: 490, y: 230}, {x: 495, y: 200}
    ], '#cd853f');
    
    // Asia (main landmass)
    drawContinent([
      {x: 600, y: 120}, {x: 700, y: 100}, {x: 800, y: 110}, {x: 880, y: 125},
      {x: 920, y: 140}, {x: 940, y: 160}, {x: 930, y: 180}, {x: 900, y: 200},
      {x: 860, y: 220}, {x: 820, y: 240}, {x: 780, y: 250}, {x: 740, y: 255},
      {x: 700, y: 250}, {x: 660, y: 240}, {x: 620, y: 220}, {x: 590, y: 200},
      {x: 580, y: 170}, {x: 590, y: 145}
    ], '#2d5016');
    
    // India subcontinent
    drawContinent([
      {x: 680, y: 240}, {x: 720, y: 235}, {x: 740, y: 260}, {x: 730, y: 290},
      {x: 710, y: 300}, {x: 690, y: 295}, {x: 675, y: 275}, {x: 675, y: 250}
    ], '#228b22');
    
    // China/Southeast Asia
    drawContinent([
      {x: 750, y: 200}, {x: 800, y: 190}, {x: 840, y: 200}, {x: 860, y: 220},
      {x: 850, y: 240}, {x: 820, y: 250}, {x: 780, y: 245}, {x: 750, y: 235}
    ], '#4a7c59');
    
    // Australia
    drawContinent([
      {x: 840, y: 340}, {x: 900, y: 335}, {x: 940, y: 345}, {x: 950, y: 365},
      {x: 940, y: 380}, {x: 900, y: 385}, {x: 860, y: 380}, {x: 840, y: 365}
    ], '#deb887');
    
    // Greenland
    drawContinent([
      {x: 350, y: 80}, {x: 380, y: 75}, {x: 390, y: 100}, {x: 380, y: 120},
      {x: 360, y: 125}, {x: 340, y: 115}, {x: 345, y: 95}
    ], '#f0f8ff');
    
    // Madagascar
    drawContinent([
      {x: 620, y: 360}, {x: 630, y: 355}, {x: 635, y: 380}, {x: 625, y: 390}, {x: 615, y: 385}
    ], '#228b22');
    
    // Japan
    drawContinent([
      {x: 870, y: 180}, {x: 875, y: 175}, {x: 880, y: 185}, {x: 875, y: 190}
    ], '#4a7c59');
    
    // British Isles
    drawContinent([
      {x: 465, y: 125}, {x: 470, y: 120}, {x: 475, y: 130}, {x: 470, y: 135}
    ], '#4a7c59');
    
    // Indonesia/Southeast Asian islands
    const seaIslands = [
      {x: 790, y: 280}, {x: 810, y: 285}, {x: 830, y: 290}, 
      {x: 850, y: 285}, {x: 870, y: 290}, {x: 820, y: 300}
    ];
    seaIslands.forEach(island => {
      context.fillStyle = '#228b22';
      context.beginPath();
      context.arc(island.x, island.y, 4, 0, Math.PI * 2);
      context.fill();
    });
    
    // Add Caribbean and Pacific islands
    const islands = [
      // Caribbean
      {x: 260, y: 250, size: 3}, {x: 270, y: 255, size: 2}, {x: 275, y: 248, size: 2},
      // Hawaii
      {x: 120, y: 250, size: 2}, {x: 125, y: 252, size: 1},
      // Philippines
      {x: 810, y: 270, size: 4}, {x: 815, y: 275, size: 3}, {x: 820, y: 272, size: 2},
      // New Zealand
      {x: 980, y: 420, size: 5}, {x: 985, y: 430, size: 4},
      // Cyprus
      {x: 560, y: 165, size: 1}
    ];
    
    context.fillStyle = '#228b22';
    context.globalAlpha = 0.9;
    islands.forEach(island => {
      context.beginPath();
      context.arc(island.x, island.y, island.size, 0, Math.PI * 2);
      context.fill();
    });
    context.globalAlpha = 1.0;
    
    // Ice caps with gradient for realism
    const arcticGradient = context.createLinearGradient(0, 0, 0, 40);
    arcticGradient.addColorStop(0, '#FFFFFF');
    arcticGradient.addColorStop(0.7, '#E6F3FF');
    arcticGradient.addColorStop(1, 'rgba(230, 243, 255, 0)');
    context.fillStyle = arcticGradient;
    context.fillRect(0, 0, canvas.width, 40);
    
    const antarcticGradient = context.createLinearGradient(0, canvas.height - 40, 0, canvas.height);
    antarcticGradient.addColorStop(0, 'rgba(230, 243, 255, 0)');
    antarcticGradient.addColorStop(0.3, '#E6F3FF');
    antarcticGradient.addColorStop(1, '#FFFFFF');
    context.fillStyle = antarcticGradient;
    context.fillRect(0, canvas.height - 40, canvas.width, 40);
    
    // Subtle ocean depth variation
    context.globalAlpha = 0.05;
    context.fillStyle = '#1E40AF';
    for (let i = 0; i < 50; i++) {
      context.beginPath();
      context.arc(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        Math.random() * 25 + 10,
        0,
        Math.PI * 2
      );
      context.fill();
    }
    context.globalAlpha = 1.0;
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.needsUpdate = true;
    
    console.log('Simple Earth texture created successfully:', canvas.width, 'x', canvas.height);
    
    return texture;
  }, []);

  return (
    <group>
      {/* Simple Earth sphere */}
      <Sphere ref={earthRef} args={[5, 64, 32]}>
        {earthTexture ? (
          <meshLambertMaterial map={earthTexture} />
        ) : (
          <meshLambertMaterial color="#4A90E2" />
        )}
      </Sphere>
      
      {/* Country markers */}
      {visitedCountries.map((country, index) => {
        const coords = COUNTRY_COORDINATES[country.name];
        if (!coords) return null;
        
        const position = latLngToVector3(coords[0], coords[1], 5.1);
        const color = country.color || '#ff4444';
        
        return (
          <group key={`${country.name}-${index}`}>
            {/* Simple marker */}
            <Sphere position={[position.x, position.y, position.z]} args={[0.1, 16, 16]}>
              <meshBasicMaterial
                color={color}
              />
            </Sphere>
            
            {/* Glow ring */}
            <Sphere position={[position.x, position.y, position.z]} args={[0.2, 16, 16]}>
              <meshBasicMaterial 
                color={color} 
                transparent 
                opacity={0.2}
              />
            </Sphere>
            
            {/* Country labels */}
            {showLabels && (
              <Text
                position={[position.x * 1.3, position.y * 1.3, position.z * 1.3]}
                fontSize={0.2}
                color="#ffffff"
                anchorX="center"
                anchorY="middle"
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

export default SimpleEarth;