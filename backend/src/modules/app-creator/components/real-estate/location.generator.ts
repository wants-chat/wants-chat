/**
 * Location Map Component Generator
 */

export interface LocationMapOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateLocationMap(options: LocationMapOptions = {}): string {
  const { componentName = 'LocationMap', endpoint = '/locations' } = options;

  return `import React, { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, MapPin, Navigation, ZoomIn, ZoomOut, Layers, X, ExternalLink, Phone, Clock, Star } from 'lucide-react';
import { api } from '@/lib/api';

interface Location {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  type?: string;
  rating?: number;
  phone?: string;
  hours?: string;
  description?: string;
  image_url?: string;
}

interface ${componentName}Props {
  propertyId?: string;
  center?: { lat: number; lng: number };
  zoom?: number;
  height?: string;
  showControls?: boolean;
  showNearbyPlaces?: boolean;
  nearbyTypes?: string[];
}

const ${componentName}: React.FC<${componentName}Props> = ({
  propertyId,
  center = { lat: 40.7128, lng: -74.0060 },
  zoom = 14,
  height = '400px',
  showControls = true,
  showNearbyPlaces = true,
  nearbyTypes = ['school', 'hospital', 'restaurant', 'shopping', 'transit'],
}) => {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [mapZoom, setMapZoom] = useState(zoom);
  const [mapCenter, setMapCenter] = useState(center);

  const { data: locations, isLoading } = useQuery({
    queryKey: ['locations', propertyId, activeFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (propertyId) params.append('property_id', propertyId);
      if (activeFilter !== 'all') params.append('type', activeFilter);
      params.append('lat', String(mapCenter.lat));
      params.append('lng', String(mapCenter.lng));
      const url = '${endpoint}' + (params.toString() ? '?' + params.toString() : '');
      const response = await api.get<any>(url);
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: showNearbyPlaces,
  });

  const handleZoomIn = () => setMapZoom((z) => Math.min(z + 1, 20));
  const handleZoomOut = () => setMapZoom((z) => Math.max(z - 1, 1));

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      school: 'bg-blue-500',
      hospital: 'bg-red-500',
      restaurant: 'bg-orange-500',
      shopping: 'bg-purple-500',
      transit: 'bg-green-500',
      park: 'bg-emerald-500',
      gym: 'bg-pink-500',
    };
    return icons[type] || 'bg-gray-500';
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      school: 'Schools',
      hospital: 'Healthcare',
      restaurant: 'Dining',
      shopping: 'Shopping',
      transit: 'Transit',
      park: 'Parks',
      gym: 'Fitness',
    };
    return labels[type] || type;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Map Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            Location & Nearby Places
          </h3>
          {showNearbyPlaces && (
            <div className="flex items-center gap-2 overflow-x-auto">
              <button
                onClick={() => setActiveFilter('all')}
                className={\`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors \${
                  activeFilter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }\`}
              >
                All
              </button>
              {nearbyTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setActiveFilter(type)}
                  className={\`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors \${
                    activeFilter === type
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }\`}
                >
                  {getTypeLabel(type)}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Map Container */}
      <div className="relative" style={{ height }}>
        {/* Placeholder Map Background */}
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700">
          <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
            <div className="text-center">
              <MapPin className="w-12 h-12 mx-auto mb-2" />
              <p className="text-sm">Interactive Map</p>
              <p className="text-xs opacity-75">Integrate with your preferred map provider</p>
            </div>
          </div>
        </div>

        {/* Map Controls */}
        {showControls && (
          <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
            <button
              onClick={handleZoomIn}
              className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600"
            >
              <ZoomIn className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600"
            >
              <ZoomOut className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
            <button className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600">
              <Layers className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
            <button className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600">
              <Navigation className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
          </div>
        )}

        {/* Property Marker */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="relative">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-blue-600 rotate-45" />
          </div>
        </div>

        {/* Selected Location Popup */}
        {selectedLocation && (
          <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-20">
            <div className="relative">
              {selectedLocation.image_url && (
                <img
                  src={selectedLocation.image_url}
                  alt={selectedLocation.name}
                  className="w-full h-32 object-cover"
                />
              )}
              <button
                onClick={() => setSelectedLocation(null)}
                className="absolute top-2 right-2 p-1 bg-black/50 rounded-full hover:bg-black/70"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">{selectedLocation.name}</h4>
                  {selectedLocation.type && (
                    <span className={\`inline-block px-2 py-0.5 rounded text-xs text-white mt-1 \${getTypeIcon(selectedLocation.type)}\`}>
                      {getTypeLabel(selectedLocation.type)}
                    </span>
                  )}
                </div>
                {selectedLocation.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedLocation.rating}</span>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-start gap-1 mb-2">
                <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                {selectedLocation.address}
              </p>
              {selectedLocation.phone && (
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mb-2">
                  <Phone className="w-4 h-4" />
                  {selectedLocation.phone}
                </p>
              )}
              {selectedLocation.hours && (
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mb-3">
                  <Clock className="w-4 h-4" />
                  {selectedLocation.hours}
                </p>
              )}
              <a
                href={\`https://www.google.com/maps/dir/?api=1&destination=\${selectedLocation.lat},\${selectedLocation.lng}\`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 text-sm font-medium"
              >
                <Navigation className="w-4 h-4" />
                Get Directions
              </a>
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 flex items-center justify-center z-30">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        )}
      </div>

      {/* Nearby Places List */}
      {showNearbyPlaces && locations && locations.length > 0 && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Nearby Places ({locations.length})
          </h4>
          <div className="grid gap-2 max-h-48 overflow-y-auto">
            {locations.map((location: Location) => (
              <button
                key={location.id}
                onClick={() => setSelectedLocation(location)}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 text-left transition-colors"
              >
                <div className={\`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs \${getTypeIcon(location.type || 'default')}\`}>
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900 dark:text-white truncate">{location.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{location.address}</p>
                </div>
                {location.rating && (
                  <div className="flex items-center gap-1 text-xs">
                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                    <span className="text-gray-600 dark:text-gray-400">{location.rating}</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}

export function generatePropertyLocation(options: LocationMapOptions = {}): string {
  const { componentName = 'PropertyLocation', endpoint = '/properties' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, MapPin, Navigation, Building, TreePine, Train, ShoppingBag, GraduationCap, Utensils } from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  propertyId: string;
}

interface NearbyPlace {
  name: string;
  type: string;
  distance: string;
  walk_time?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ propertyId }) => {
  const { data: property, isLoading } = useQuery({
    queryKey: ['property-location', propertyId],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + propertyId);
      return response?.data || response;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!property) return null;

  const getPlaceIcon = (type: string) => {
    switch (type) {
      case 'school':
        return <GraduationCap className="w-4 h-4" />;
      case 'restaurant':
        return <Utensils className="w-4 h-4" />;
      case 'shopping':
        return <ShoppingBag className="w-4 h-4" />;
      case 'transit':
        return <Train className="w-4 h-4" />;
      case 'park':
        return <TreePine className="w-4 h-4" />;
      default:
        return <Building className="w-4 h-4" />;
    }
  };

  const nearbyPlaces: NearbyPlace[] = property.nearby_places || [];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-600" />
          Location
        </h3>

        {property.address && (
          <div className="mb-4">
            <p className="text-gray-600 dark:text-gray-400">{property.address}</p>
            {property.city && property.state && (
              <p className="text-gray-500 dark:text-gray-500">
                {property.city}, {property.state} {property.zip_code}
              </p>
            )}
          </div>
        )}

        {(property.lat && property.lng) && (
          <a
            href={\`https://www.google.com/maps/dir/?api=1&destination=\${property.lat},\${property.lng}\`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium mb-6"
          >
            <Navigation className="w-4 h-4" />
            Get Directions
          </a>
        )}

        {nearbyPlaces.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">What's Nearby</h4>
            <div className="space-y-3">
              {nearbyPlaces.map((place, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white dark:bg-gray-600 rounded-lg text-gray-600 dark:text-gray-300">
                      {getPlaceIcon(place.type)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">{place.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{place.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{place.distance}</p>
                    {place.walk_time && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">{place.walk_time} walk</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Map Preview */}
      {(property.lat && property.lng) && (
        <div className="h-48 bg-gray-200 dark:bg-gray-700 relative">
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-500">
            <div className="text-center">
              <MapPin className="w-8 h-8 mx-auto mb-1" />
              <p className="text-xs">Map Preview</p>
            </div>
          </div>
          {/* Property Marker */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
              <MapPin className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}

export function generateNeighborhoodInfo(options: LocationMapOptions = {}): string {
  const { componentName = 'NeighborhoodInfo', endpoint = '/neighborhoods' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, MapPin, Users, TrendingUp, Shield, TreePine, Building, Star, ChevronRight } from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  neighborhoodId?: string;
  zipCode?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ neighborhoodId, zipCode }) => {
  const { data: neighborhood, isLoading } = useQuery({
    queryKey: ['neighborhood', neighborhoodId, zipCode],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (neighborhoodId) params.append('id', neighborhoodId);
      if (zipCode) params.append('zip_code', zipCode);
      const url = '${endpoint}' + (params.toString() ? '?' + params.toString() : '');
      const response = await api.get<any>(url);
      return response?.data || response;
    },
    enabled: !!(neighborhoodId || zipCode),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!neighborhood) return null;

  const getRatingColor = (rating: number) => {
    if (rating >= 8) return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
    if (rating >= 6) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
    return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
  };

  const stats = [
    { icon: Shield, label: 'Safety Score', value: neighborhood.safety_score, suffix: '/10' },
    { icon: TreePine, label: 'Walkability', value: neighborhood.walk_score, suffix: '/100' },
    { icon: Building, label: 'Transit Score', value: neighborhood.transit_score, suffix: '/100' },
    { icon: Users, label: 'Population', value: neighborhood.population?.toLocaleString(), suffix: '' },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{neighborhood.name}</h3>
          {neighborhood.city && (
            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {neighborhood.city}, {neighborhood.state}
            </p>
          )}
        </div>
        {neighborhood.overall_rating && (
          <div className={\`px-3 py-1 rounded-lg font-bold \${getRatingColor(neighborhood.overall_rating)}\`}>
            {neighborhood.overall_rating}/10
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {stats.map((stat, index) => (
          stat.value && (
            <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                <stat.icon className="w-4 h-4" />
                <span className="text-xs">{stat.label}</span>
              </div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {stat.value}{stat.suffix}
              </p>
            </div>
          )
        ))}
      </div>

      {neighborhood.description && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">About this area</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">{neighborhood.description}</p>
        </div>
      )}

      {neighborhood.median_home_price && (
        <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-4">
          <div>
            <p className="text-sm text-blue-600 dark:text-blue-400">Median Home Price</p>
            <p className="text-xl font-bold text-blue-700 dark:text-blue-300">
              \${neighborhood.median_home_price.toLocaleString()}
            </p>
          </div>
          {neighborhood.price_trend && (
            <div className="flex items-center gap-1 text-sm">
              <TrendingUp className={\`w-4 h-4 \${neighborhood.price_trend > 0 ? 'text-green-600' : 'text-red-600'}\`} />
              <span className={\`font-medium \${neighborhood.price_trend > 0 ? 'text-green-600' : 'text-red-600'}\`}>
                {neighborhood.price_trend > 0 ? '+' : ''}{neighborhood.price_trend}% YoY
              </span>
            </div>
          )}
        </div>
      )}

      {neighborhood.schools && neighborhood.schools.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Top Schools</h4>
          <div className="space-y-2">
            {neighborhood.schools.slice(0, 3).map((school: any, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
              >
                <div>
                  <p className="font-medium text-sm text-gray-900 dark:text-white">{school.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{school.type} - {school.grades}</p>
                </div>
                <div className="flex items-center gap-2">
                  {school.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{school.rating}</span>
                    </div>
                  )}
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}
