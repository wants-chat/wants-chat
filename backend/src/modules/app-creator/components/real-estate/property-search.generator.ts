/**
 * Property Search Component Generator
 */

export interface PropertySearchOptions {
  componentName?: string;
  endpoint?: string;
}

export function generatePropertySearch(options: PropertySearchOptions = {}): string {
  const { componentName = 'PropertySearch', endpoint = '/properties' } = options;

  return `import React, { useState } from 'react';
import { Search, MapPin, Home, DollarSign } from 'lucide-react';

interface ${componentName}Props {
  onSearch?: (filters: any) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({ onSearch }) => {
  const [filters, setFilters] = useState({
    location: '',
    type: '',
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    bathrooms: '',
  });

  const handleSearch = () => {
    onSearch?.(filters);
  };

  const propertyTypes = ['Any', 'House', 'Apartment', 'Condo', 'Townhouse', 'Land', 'Commercial'];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <MapPin className="w-4 h-4 inline mr-1" /> Location
          </label>
          <input
            type="text"
            value={filters.location}
            onChange={(e) => setFilters({ ...filters, location: e.target.value })}
            placeholder="City, ZIP, or Address"
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Home className="w-4 h-4 inline mr-1" /> Property Type
          </label>
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
          >
            {propertyTypes.map((type) => (
              <option key={type} value={type === 'Any' ? '' : type}>{type}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <DollarSign className="w-4 h-4 inline mr-1" /> Price Range
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={filters.minPrice}
              onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
              placeholder="Min"
              className="w-1/2 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
            />
            <input
              type="number"
              value={filters.maxPrice}
              onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
              placeholder="Max"
              className="w-1/2 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Beds & Baths
          </label>
          <div className="flex gap-2">
            <select
              value={filters.bedrooms}
              onChange={(e) => setFilters({ ...filters, bedrooms: e.target.value })}
              className="w-1/2 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
            >
              <option value="">Beds</option>
              {[1, 2, 3, 4, 5, '6+'].map((n) => (
                <option key={n} value={n}>{n}+</option>
              ))}
            </select>
            <select
              value={filters.bathrooms}
              onChange={(e) => setFilters({ ...filters, bathrooms: e.target.value })}
              className="w-1/2 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
            >
              <option value="">Baths</option>
              {[1, 2, 3, 4, '5+'].map((n) => (
                <option key={n} value={n}>{n}+</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <button
        onClick={handleSearch}
        className="mt-4 w-full sm:w-auto px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
      >
        <Search className="w-5 h-5" />
        Search Properties
      </button>
    </div>
  );
};

export default ${componentName};
`;
}

export function generatePropertyGrid(options: PropertySearchOptions = {}): string {
  const { componentName = 'PropertyGrid', endpoint = '/properties' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Loader2, Bed, Bath, Square, MapPin, Heart } from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  filters?: any;
}

const ${componentName}: React.FC<${componentName}Props> = ({ filters }) => {
  const { data: properties, isLoading } = useQuery({
    queryKey: ['properties', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, String(value));
        });
      }
      const url = '${endpoint}' + (params.toString() ? '?' + params.toString() : '');
      const response = await api.get<any>(url);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {properties && properties.length > 0 ? (
        properties.map((property: any) => (
          <Link
            key={property.id}
            to={\`/properties/\${property.id}\`}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow group"
          >
            <div className="relative">
              {property.images?.[0] || property.image_url ? (
                <img
                  src={property.images?.[0] || property.image_url}
                  alt={property.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <Square className="w-12 h-12 text-gray-400" />
                </div>
              )}
              <button className="absolute top-3 right-3 p-2 bg-white dark:bg-gray-800 rounded-full shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700">
                <Heart className="w-5 h-5 text-gray-500" />
              </button>
              {property.status && (
                <span className={\`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium \${
                  property.status === 'for-sale' ? 'bg-green-600 text-white' :
                  property.status === 'for-rent' ? 'bg-blue-600 text-white' :
                  'bg-gray-600 text-white'
                }\`}>
                  {property.status === 'for-sale' ? 'For Sale' : property.status === 'for-rent' ? 'For Rent' : property.status}
                </span>
              )}
            </div>
            <div className="p-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">\${property.price?.toLocaleString()}</p>
              <h3 className="font-medium text-gray-900 dark:text-white mt-1 truncate">{property.title}</h3>
              {property.address && (
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                  <MapPin className="w-4 h-4" />
                  {property.address}
                </p>
              )}
              <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                {property.bedrooms && (
                  <span className="flex items-center gap-1">
                    <Bed className="w-4 h-4" />
                    {property.bedrooms} bd
                  </span>
                )}
                {property.bathrooms && (
                  <span className="flex items-center gap-1">
                    <Bath className="w-4 h-4" />
                    {property.bathrooms} ba
                  </span>
                )}
                {property.sqft && (
                  <span className="flex items-center gap-1">
                    <Square className="w-4 h-4" />
                    {property.sqft.toLocaleString()} sqft
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))
      ) : (
        <div className="col-span-full text-center py-12 text-gray-500">
          <Square className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          No properties found
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}

export function generatePropertyFilters(options: { componentName?: string } = {}): string {
  const componentName = options.componentName || 'PropertyFilters';

  return `import React from 'react';
import { SlidersHorizontal, X } from 'lucide-react';

interface ${componentName}Props {
  filters: any;
  onChange: (filters: any) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({ filters, onChange }) => {
  const amenities = ['Pool', 'Garage', 'Garden', 'Gym', 'Security', 'Parking', 'Balcony', 'Fireplace'];

  const toggleAmenity = (amenity: string) => {
    const current = filters.amenities || [];
    const updated = current.includes(amenity)
      ? current.filter((a: string) => a !== amenity)
      : [...current, amenity];
    onChange({ ...filters, amenities: updated });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5" />
          Filters
        </h3>
        <button onClick={() => onChange({})} className="text-sm text-blue-600 hover:text-blue-700">
          Clear All
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
          <div className="flex flex-wrap gap-2">
            {['All', 'For Sale', 'For Rent', 'Sold'].map((status) => (
              <button
                key={status}
                onClick={() => onChange({ ...filters, status: status === 'All' ? '' : status.toLowerCase().replace(' ', '-') })}
                className={\`px-3 py-1 rounded-full text-sm \${
                  (status === 'All' && !filters.status) || filters.status === status.toLowerCase().replace(' ', '-')
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }\`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Amenities</label>
          <div className="flex flex-wrap gap-2">
            {amenities.map((amenity) => (
              <button
                key={amenity}
                onClick={() => toggleAmenity(amenity)}
                className={\`px-3 py-1 rounded-full text-sm \${
                  (filters.amenities || []).includes(amenity)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }\`}
              >
                {amenity}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Square Feet</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={filters.minSqft || ''}
              onChange={(e) => onChange({ ...filters, minSqft: e.target.value })}
              placeholder="Min"
              className="w-1/2 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-sm"
            />
            <input
              type="number"
              value={filters.maxSqft || ''}
              onChange={(e) => onChange({ ...filters, maxSqft: e.target.value })}
              placeholder="Max"
              className="w-1/2 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}
