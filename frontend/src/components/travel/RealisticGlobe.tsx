import React, { useRef, useEffect, useState } from 'react';
import Globe, { GlobeMethods } from 'react-globe.gl';

interface VisitedCountry {
  name: string;
  year?: number;
  color?: string;
}

interface RealisticGlobeProps {
  visitedCountries: VisitedCountry[];
  width?: number;
  height?: number;
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

const RealisticGlobe: React.FC<RealisticGlobeProps> = ({ 
  visitedCountries, 
  width = 600, 
  height = 400, 
  showLabels = false 
}) => {
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Transform visited countries to globe points format
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
        size: 0.8
      };
    })
    .filter((point): point is NonNullable<typeof point> => point !== null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (globeRef.current) {
        try {
          // Enable auto rotation
          globeRef.current.controls().autoRotate = true;
          globeRef.current.controls().autoRotateSpeed = 0.3;
          globeRef.current.controls().enableZoom = true;
          
          // Set initial view
          globeRef.current.pointOfView({ altitude: 2.5 });
          
          // Mark as loaded
          setIsLoading(false);
        } catch (error) {
          console.error('Globe initialization error:', error);
          setHasError(true);
          setIsLoading(false);
        }
      } else {
        // If globe doesn't load after 5 seconds, show error
        setTimeout(() => {
          if (isLoading) {
            setHasError(true);
            setIsLoading(false);
          }
        }, 5000);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isLoading]);

  if (hasError) {
    // Fallback to simple colored globe
    return (
      <div className="relative" style={{ width, height }}>
        <div className="rounded overflow-hidden bg-gray-900">
          <Globe
            ref={globeRef}
            width={width}
            height={height}
            // Simple fallback - no external images
            globeImageUrl={undefined}
            backgroundColor="rgba(0,0,0,1)"
            
            // Points for visited countries
            pointsData={globePoints}
            pointColor={(point: any) => point.color}
            pointAltitude={0.15}
            pointRadius={1.2}
            pointResolution={16}
            pointLabel={(point: any) => showLabels ? `
              <div style="
                background: rgba(0,0,0,0.8); 
                padding: 8px 12px; 
                border-radius: 8px; 
                color: white; 
                font-size: 14px;
                border: 2px solid ${point.color};
              ">
                <strong>${point.name}</strong>
                ${point.year ? `<br/>Visited: ${point.year}` : ''}
              </div>
            ` : point.name}
            
            // Simple atmosphere
            atmosphereColor="#4A90E2"
            atmosphereAltitude={0.25}
            
            // Control settings
            enablePointerInteraction={true}
          />
        </div>
        
        {/* Error notice */}
        <div className="absolute top-2 left-2 bg-yellow-600/80 text-white text-xs px-2 py-1 rounded">
          Simple Mode (Images failed to load)
        </div>
        
        {/* Include legend and other elements */}
        {visitedCountries.length > 0 && (
          <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-sm rounded p-3 max-w-xs">
            <h4 className="font-semibold text-sm mb-2 text-white">
              Visited Countries ({visitedCountries.length})
            </h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {visitedCountries.slice(0, 8).map((country, index) => (
                <div key={`legend-${country.name}-${index}`} className="flex items-center gap-2 text-xs">
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: country.color || '#ff4444' }}
                  />
                  <span className="text-gray-200 truncate">
                    {country.name} {country.year && `(${country.year})`}
                  </span>
                </div>
              ))}
              {visitedCountries.length > 8 && (
                <div className="text-xs text-gray-400 pt-1">
                  +{visitedCountries.length - 8} more...
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative" style={{ width, height }}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 rounded">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400" />
          <div className="absolute mt-16 text-white text-sm">Loading Earth...</div>
        </div>
      )}
      
      <div className="rounded overflow-hidden bg-gray-900">
        <Globe
          ref={globeRef}
          width={width}
          height={height}
          // Try the most reliable NASA image source
          globeImageUrl="https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
          bumpImageUrl="https://unpkg.com/three-globe/example/img/earth-topology.png"
          backgroundImageUrl="https://unpkg.com/three-globe/example/img/night-sky.png"
          backgroundColor="rgba(0,0,0,0)"
          
          // Points for visited countries
          pointsData={globePoints}
          pointColor={(point: any) => point.color}
          pointAltitude={0.15}
          pointRadius={0.8}
          pointResolution={16}
          pointLabel={(point: any) => showLabels ? `
            <div style="
              background: rgba(0,0,0,0.8); 
              padding: 8px 12px; 
              border-radius: 8px; 
              color: white; 
              font-size: 14px;
              border: 2px solid ${point.color};
            ">
              <strong>${point.name}</strong>
              ${point.year ? `<br/>Visited: ${point.year}` : ''}
            </div>
          ` : point.name}
          
          // Enhanced visual effects
          atmosphereColor="#4A90E2"
          atmosphereAltitude={0.25}
          
          // Animation settings
          animateIn={true}
          waitForGlobeReady={true}
          
          // Control settings
          enablePointerInteraction={true}
        />
      </div>
      
      {/* Controls hint */}
      <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm rounded p-2">
        <div className="text-xs text-white">
          🖱️ Drag to rotate<br />
          🔍 Scroll to zoom
        </div>
      </div>
      
      {/* Legend */}
      {visitedCountries.length > 0 && (
        <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-sm rounded p-3 max-w-xs">
          <h4 className="font-semibold text-sm mb-2 text-white">
            Visited Countries ({visitedCountries.length})
          </h4>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {visitedCountries.slice(0, 8).map((country, index) => (
              <div key={`legend-${country.name}-${index}`} className="flex items-center gap-2 text-xs">
                <div 
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: country.color || '#ff4444' }}
                />
                <span className="text-gray-200 truncate">
                  {country.name} {country.year && `(${country.year})`}
                </span>
              </div>
            ))}
            {visitedCountries.length > 8 && (
              <div className="text-xs text-gray-400 pt-1">
                +{visitedCountries.length - 8} more...
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Empty state */}
      {visitedCountries.length === 0 && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white bg-black/50 rounded p-6">
            <div className="text-4xl mb-4">🌍</div>
            <h3 className="text-lg font-semibold mb-2">Start Your Journey</h3>
            <p className="text-sm text-gray-300">
              Complete some travel plans to see them on your globe!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealisticGlobe;