import React, { useRef, useEffect, useState } from 'react';
import Globe, { GlobeMethods } from 'react-globe.gl';

interface VisitedCountry {
  name: string;
  year?: number;
  color?: string;
}

interface SimpleGlobeGLProps {
  visitedCountries: VisitedCountry[];
  width?: number;
  height?: number;
  showLabels?: boolean;
}

// Create Earth texture with continents
const createEarthTexture = () => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.width = 1024;
  canvas.height = 512;
  
  if (!context) return null;
  
  // Ocean background
  context.fillStyle = '#1E40AF'; // Ocean blue
  context.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw continents in green/brown colors
  const continents = [
    // North America
    { x: 60, y: 150, w: 180, h: 120, color: '#22C55E' },    // USA/Canada
    { x: 40, y: 220, w: 80, h: 60, color: '#16A34A' },     // Mexico
    
    // South America  
    { x: 220, y: 280, w: 80, h: 150, color: '#15803D' },   // Brazil
    { x: 200, y: 350, w: 60, h: 80, color: '#22C55E' },    // Argentina
    
    // Europe
    { x: 480, y: 140, w: 120, h: 70, color: '#16A34A' },
    
    // Africa
    { x: 500, y: 200, w: 100, h: 200, color: '#CA8A04' },  // Main Africa
    { x: 520, y: 180, w: 80, h: 50, color: '#EAB308' },    // Sahara
    
    // Asia
    { x: 620, y: 100, w: 280, h: 150, color: '#15803D' },  // Siberia/Asia
    { x: 680, y: 200, w: 150, h: 100, color: '#22C55E' },  // China/India
    
    // Australia
    { x: 820, y: 320, w: 120, h: 70, color: '#EAB308' },
    
    // Greenland
    { x: 350, y: 80, w: 60, h: 80, color: '#F0F8FF' },
  ];
  
  // Draw continents
  continents.forEach(continent => {
    context.fillStyle = continent.color;
    context.fillRect(continent.x, continent.y, continent.w, continent.h);
    
    // Add some texture variation
    context.globalAlpha = 0.3;
    for (let i = 0; i < 8; i++) {
      context.beginPath();
      context.arc(
        continent.x + Math.random() * continent.w,
        continent.y + Math.random() * continent.h,
        Math.random() * 10 + 3,
        0,
        Math.PI * 2
      );
      context.fillStyle = i % 2 === 0 ? '#166534' : '#A16207'; // Darker variations
      context.fill();
    }
    context.globalAlpha = 1.0;
  });
  
  // Add islands
  const islands = [
    // British Isles
    { x: 465, y: 125, size: 8 },
    // Japan
    { x: 900, y: 180, size: 6 },
    // Madagascar  
    { x: 620, y: 360, size: 5 },
    // New Zealand
    { x: 980, y: 420, size: 4 },
    // Caribbean islands
    { x: 260, y: 250, size: 3 },
    { x: 270, y: 255, size: 2 },
    // Indonesia
    { x: 800, y: 280, size: 4 },
    { x: 820, y: 285, size: 3 },
    { x: 840, y: 290, size: 3 },
  ];
  
  context.fillStyle = '#22C55E';
  islands.forEach(island => {
    context.beginPath();
    context.arc(island.x, island.y, island.size, 0, Math.PI * 2);
    context.fill();
  });
  
  // Add ice caps
  context.fillStyle = '#F0F8FF';
  context.fillRect(0, 0, canvas.width, 25); // North pole
  context.fillRect(0, canvas.height - 25, canvas.width, 25); // South pole
  
  // Convert to data URL
  return canvas.toDataURL('image/png');
};

// Country coordinates
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

const SimpleGlobeGL: React.FC<SimpleGlobeGLProps> = ({ 
  visitedCountries, 
  width = 600, 
  height = 400, 
  showLabels = false 
}) => {
  const globeRef = useRef<GlobeMethods | undefined>(undefined);

  // Transform visited countries to globe points
  const globePoints = visitedCountries
    .map((country, index) => {
      const coords = COUNTRY_COORDINATES[country.name];
      if (!coords) return null;
      
      return {
        id: `${country.name}-${index}`,
        lat: coords[0],
        lng: coords[1],
        name: country.name,
        year: country.year,
        color: country.color || '#ff4444',
      };
    })
    .filter(Boolean);

  useEffect(() => {
    if (globeRef.current) {
      globeRef.current.controls().autoRotate = true;
      globeRef.current.controls().autoRotateSpeed = 0.5;
      globeRef.current.pointOfView({ altitude: 2.5 });
    }
  }, []);

  return (
    <div className="relative rounded overflow-hidden bg-gradient-to-b from-blue-50 to-indigo-100 dark:from-slate-800 dark:to-slate-900" style={{ width, height }}>
      <Globe
        ref={globeRef}
        width={width}
        height={height}
        // Earth texture with continents and oceans
        globeImageUrl={createEarthTexture()}
        backgroundColor="rgba(0,0,0,0)" // Transparent so container background shows
        
        // Points for visited countries
        pointsData={globePoints}
        pointColor={(point: any) => point.color}
        pointAltitude={0.1}
        pointRadius={1.0}
        pointResolution={12}
        pointLabel={(point: any) => `
          <div style="
            background: rgba(0,0,0,0.9); 
            padding: 6px 10px; 
            border-radius: 6px; 
            color: white; 
            font-size: 12px;
            border: 1px solid ${point.color};
          ">
            <strong>${point.name}</strong>
            ${point.year ? `<br/>Visited: ${point.year}` : ''}
          </div>
        `}
        
        // Simple blue atmosphere
        atmosphereColor="#3b82f6"
        atmosphereAltitude={0.15}
        
        // Enable interaction
        enablePointerInteraction={true}
      />
      
      {/* Simple legend */}
      {visitedCountries.length > 0 && (
        <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-black/80 backdrop-blur-sm rounded p-3 max-w-64 shadow-lg border border-gray-200 dark:border-gray-700">
          <h4 className="font-semibold text-sm mb-2 text-gray-900 dark:text-white">
            Countries Visited ({visitedCountries.length})
          </h4>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {visitedCountries.map((country, index) => (
              <div key={`legend-${country.name}-${index}`} className="flex items-center gap-2 text-xs">
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: country.color || '#ff4444' }}
                />
                <span className="text-gray-700 dark:text-gray-200">
                  {country.name} {country.year && `(${country.year})`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Controls */}
      <div className="absolute top-4 right-4 bg-white/90 dark:bg-black/70 backdrop-blur-sm rounded p-2 text-xs text-gray-700 dark:text-white border border-gray-200 dark:border-gray-600">
        Drag to rotate • Scroll to zoom
      </div>
    </div>
  );
};

export default SimpleGlobeGL;