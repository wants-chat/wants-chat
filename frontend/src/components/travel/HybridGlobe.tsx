import React, { useRef, useEffect, useState } from 'react';
import Globe, { GlobeMethods } from 'react-globe.gl';

interface VisitedCountry {
  name: string;
  year?: number;
  color?: string;
}

interface GlobePoint {
  id: string;
  lat: number;
  lng: number;
  name: string;
  year?: number;
  color: string;
}

interface HybridGlobeProps {
  visitedCountries: VisitedCountry[];
  width?: number;
  height?: number;
  showLabels?: boolean;
}

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

const HybridGlobe: React.FC<HybridGlobeProps> = ({ 
  visitedCountries, 
  width, 
  height = 400 
}) => {
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const [globeImageUrl, setGlobeImageUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [actualWidth, setActualWidth] = useState(width || 600);

  // Transform visited countries to globe points
  const globePoints: GlobePoint[] = visitedCountries
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
    .filter((point): point is NonNullable<typeof point> => point !== null) as GlobePoint[];

  // Try to load NASA image, fallback to our custom texture
  useEffect(() => {
    const tryLoadNASAImage = () => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        console.log('NASA Earth image loaded successfully');
        setGlobeImageUrl('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg');
        setIsLoading(false);
      };
      
      img.onerror = () => {
        console.log('NASA image failed, using custom Earth texture');
        createCustomEarthTexture().then(customUrl => {
          setGlobeImageUrl(customUrl);
          setIsLoading(false);
        });
      };
      
      // Try multiple sources
      const sources = [
        'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
        'https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg',
        'https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg'
      ];
      
      img.src = sources[0];
    };

    tryLoadNASAImage();
  }, []);

  // Create custom Earth texture as fallback
  const createCustomEarthTexture = async (): Promise<string> => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 2048;
    canvas.height = 1024;
    
    if (!context) return Promise.resolve('');
    
    // Ocean gradient background
    const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#4A90E2');
    gradient.addColorStop(0.5, '#1E40AF');
    gradient.addColorStop(1, '#4A90E2');
    
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // More realistic continent shapes
    const continents = [
      // North America - more accurate shape
      { 
        path: [
          [100, 200], [150, 180], [220, 160], [280, 180], [320, 220],
          [310, 280], [280, 320], [240, 340], [180, 350], [120, 330],
          [80, 300], [70, 250], [90, 220]
        ], 
        color: '#228B22' 
      },
      // South America
      {
        path: [
          [320, 350], [360, 340], [380, 380], [390, 450], [395, 520],
          [380, 580], [360, 600], [340, 590], [320, 560], [310, 500],
          [305, 440], [310, 380]
        ],
        color: '#32CD32'
      },
      // Europe
      {
        path: [
          [960, 180], [1040, 170], [1080, 190], [1070, 220], [1040, 240],
          [1000, 245], [970, 230], [950, 210], [955, 190]
        ],
        color: '#228B22'
      },
      // Africa
      {
        path: [
          [1000, 250], [1080, 240], [1120, 280], [1140, 350], [1145, 420],
          [1140, 480], [1120, 520], [1080, 540], [1040, 535], [1000, 520],
          [980, 480], [975, 420], [980, 360], [990, 300], [995, 270]
        ],
        color: '#CD853F'
      },
      // Asia
      {
        path: [
          [1200, 140], [1400, 120], [1600, 140], [1700, 180], [1720, 220],
          [1700, 260], [1650, 300], [1580, 320], [1500, 330], [1420, 325],
          [1350, 310], [1280, 280], [1220, 240], [1190, 190], [1195, 160]
        ],
        color: '#2E8B57'
      },
      // Australia
      {
        path: [
          [1680, 520], [1780, 510], [1820, 530], [1830, 560], [1820, 590],
          [1780, 600], [1720, 595], [1690, 580], [1675, 550], [1675, 530]
        ],
        color: '#DEB887'
      }
    ];
    
    // Draw continents with smooth paths
    continents.forEach(continent => {
      context.fillStyle = continent.color;
      context.beginPath();
      
      const path = continent.path;
      if (path.length > 0) {
        context.moveTo(path[0][0], path[0][1]);
        
        for (let i = 1; i < path.length; i++) {
          context.lineTo(path[i][0], path[i][1]);
        }
        
        context.closePath();
        context.fill();
        
        // Add texture detail
        context.globalAlpha = 0.3;
        for (let i = 0; i < 20; i++) {
          const randomPoint = path[Math.floor(Math.random() * path.length)];
          context.beginPath();
          context.arc(
            randomPoint[0] + (Math.random() - 0.5) * 50,
            randomPoint[1] + (Math.random() - 0.5) * 50,
            Math.random() * 8 + 2,
            0,
            Math.PI * 2
          );
          context.fillStyle = i % 2 === 0 ? '#1F5F3F' : '#8B4513';
          context.fill();
        }
        context.globalAlpha = 1.0;
      }
    });
    
    // Ice caps
    const iceGradient = context.createLinearGradient(0, 0, 0, 60);
    iceGradient.addColorStop(0, '#FFFFFF');
    iceGradient.addColorStop(1, 'rgba(255,255,255,0.3)');
    
    context.fillStyle = iceGradient;
    context.fillRect(0, 0, canvas.width, 60);
    context.fillRect(0, canvas.height - 60, canvas.width, 60);
    
    return canvas.toDataURL('image/jpeg', 0.8);
  };

  // Calculate actual width based on container
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        setActualWidth(width || containerWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, [width]);

  useEffect(() => {
    if (globeRef.current && !isLoading) {
      const controls = globeRef.current.controls();
      if (controls) {
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.5;
      }
      globeRef.current.pointOfView({ altitude: 2.5 });
    }
  }, [isLoading]);

  return (
    <div ref={containerRef} className="relative rounded-xl overflow-hidden bg-transparent flex items-center justify-center w-full" style={{ height }}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-400" />
          <div className="absolute mt-16 text-white/60 text-sm">
            Loading realistic Earth...
          </div>
        </div>
      )}

      {!isLoading && (
        <Globe
          ref={globeRef}
          width={actualWidth}
          height={height}
          globeImageUrl={globeImageUrl}
          bumpImageUrl="https://unpkg.com/three-globe/example/img/earth-topology.png"
          backgroundColor="rgba(0,0,0,0)"

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

          // Enhanced atmosphere
          atmosphereColor="#14b8a6"
          atmosphereAltitude={0.15}

          // Enable interaction
          enablePointerInteraction={true}
        />
      )}

      {/* Legend */}
      {visitedCountries.length > 0 && (
        <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-xl rounded-xl p-3 max-w-64 shadow-lg border border-white/20">
          <h4 className="font-semibold text-sm mb-2 text-white">
            Countries Visited ({visitedCountries.length})
          </h4>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {visitedCountries.map((country, index) => (
              <div key={`legend-${country.name}-${index}`} className="flex items-center gap-2 text-xs">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: country.color || '#ff4444' }}
                />
                <span className="text-white/80">
                  {country.name} {country.year && `(${country.year})`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-xl rounded-xl p-2 text-xs text-white/70 border border-white/20">
        Drag to rotate • Scroll to zoom
      </div>
    </div>
  );
};

export default HybridGlobe;