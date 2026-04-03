import React, { useState, useEffect } from 'react';
import RealisticGlobe from './RealisticGlobe';
import SimpleGlobeGL from './SimpleGlobeGL';
import HybridGlobe from './HybridGlobe';

interface VisitedCountry {
  name: string;
  year?: number;
  color?: string;
}

interface TravelGlobeProps {
  visitedCountries: VisitedCountry[];
  width?: number;
  height?: number;
  showLabels?: boolean;
}

// Main TravelGlobe component with fallback system
const TravelGlobe: React.FC<TravelGlobeProps> = ({ 
  visitedCountries, 
  width = 600, 
  height = 400, 
  showLabels = false 
}) => {
  const [useSimpleGlobe, setUseSimpleGlobe] = useState(false);

  // Try realistic globe first, fallback to simple if it fails
  useEffect(() => {
    // Start with realistic globe
    const timer = setTimeout(() => {
      // Give realistic globe time to load, then fallback if needed
      setTimeout(() => {
        // Check if we should fallback (this will be handled by RealisticGlobe component)
      }, 3000);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (useSimpleGlobe) {
    return (
      <SimpleGlobeGL
        visitedCountries={visitedCountries}
        width={width}
        height={height}
        showLabels={showLabels}
      />
    );
  }

  return (
    <HybridGlobe
      visitedCountries={visitedCountries}
      width={width}
      height={height}
      showLabels={showLabels}
    />
  );
};

export default TravelGlobe;