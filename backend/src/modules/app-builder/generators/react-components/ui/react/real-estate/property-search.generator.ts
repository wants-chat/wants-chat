/**
 * Property Search Generator
 *
 * Generates property search and filter components for real estate applications.
 */

import { ResolvedComponent } from '../../../types/resolved-component.interface';
import { getStyleClasses } from '../../../helpers/style-helpers';

export const generatePropertySearch = (
  resolved: ResolvedComponent,
  variant: 'hero' | 'sidebar' | 'inline' = 'hero'
): string => {
  const styles = getStyleClasses(resolved.uiStyle);
  const dataSource = resolved.dataSource;

  // Get API route for data fetching
  const getApiRoute = () => {
    if (resolved.actions && resolved.actions.length > 0) {
      const fetchAction = resolved.actions.find((a: any) => a.type === 'fetch');
      if (fetchAction?.serverFunction?.route) {
        return fetchAction.serverFunction.route.replace(/^\/api\/v1\//, '/');
      }
    }
    return `/${dataSource || 'search-config'}`;
  };

  const apiRoute = getApiRoute();
  const entity = dataSource?.split('.').pop() || 'searchConfig';

  if (variant === 'sidebar') {
    return `import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Loader2 } from 'lucide-react';

interface PropertySearchProps {
  config?: any;
  onSearch: (filters: SearchFilters) => void;
  initialFilters?: Partial<SearchFilters>;
}

interface SearchFilters {
  location: string;
  type: 'sale' | 'rent' | 'all';
  propertyType: string[];
  minPrice: number;
  maxPrice: number;
  beds: number;
  baths: number;
  minSqft: number;
  maxSqft: number;
}

export const PropertySearch: React.FC<PropertySearchProps> = ({
  config: propData,
  onSearch,
  initialFilters,
}) => {
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const config = propData || fetchedData || {};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  const [filters, setFilters] = useState<SearchFilters>({
    location: '',
    type: 'all',
    propertyType: [],
    minPrice: 0,
    maxPrice: 0,
    beds: 0,
    baths: 0,
    minSqft: 0,
    maxSqft: 0,
    ...initialFilters,
  });

  const propertyTypes = ['House', 'Condo', 'Townhouse', 'Multi-Family', 'Land', 'Commercial'];

  const handlePropertyTypeToggle = (type: string) => {
    setFilters(prev => ({
      ...prev,
      propertyType: prev.propertyType.includes(type)
        ? prev.propertyType.filter(t => t !== type)
        : [...prev.propertyType, type],
    }));
  };

  const handleReset = () => {
    setFilters({
      location: '',
      type: 'all',
      propertyType: [],
      minPrice: 0,
      maxPrice: 0,
      beds: 0,
      baths: 0,
      minSqft: 0,
      maxSqft: 0,
    });
  };

  return (
    <div className="${styles.card} rounded-xl p-6 ${styles.cardShadow}">
      <div className="flex items-center justify-between mb-6">
        <h3 className="${styles.textPrimary} font-semibold text-lg">Filters</h3>
        <button
          onClick={handleReset}
          className="${styles.textMuted} text-sm hover:${styles.textPrimary} transition-colors"
        >
          Reset All
        </button>
      </div>

      <div className="space-y-6">
        {/* Location */}
        <div>
          <label className="${styles.textSecondary} text-sm font-medium block mb-2">Location</label>
          <input
            type="text"
            placeholder="City, neighborhood, ZIP..."
            value={filters.location}
            onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
            className="w-full px-4 py-2.5 border ${styles.cardBorder} rounded-lg ${styles.textPrimary} focus:ring-2 focus:ring-${styles.primary}"
          />
        </div>

        {/* Listing Type */}
        <div>
          <label className="${styles.textSecondary} text-sm font-medium block mb-2">Listing Type</label>
          <div className="flex gap-2">
            {(['all', 'sale', 'rent'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilters(prev => ({ ...prev, type }))}
                className={\`flex-1 py-2 rounded-lg text-sm font-medium transition-colors \${
                  filters.type === type
                    ? '${styles.button} text-white'
                    : '${styles.background} ${styles.textSecondary} hover:${styles.textPrimary}'
                }\`}
              >
                {type === 'all' ? 'All' : type === 'sale' ? 'For Sale' : 'For Rent'}
              </button>
            ))}
          </div>
        </div>

        {/* Property Type */}
        <div>
          <label className="${styles.textSecondary} text-sm font-medium block mb-2">Property Type</label>
          <div className="flex flex-wrap gap-2">
            {propertyTypes.map((type) => (
              <button
                key={type}
                onClick={() => handlePropertyTypeToggle(type)}
                className={\`px-3 py-1.5 rounded-full text-sm transition-colors \${
                  filters.propertyType.includes(type)
                    ? '${styles.button} text-white'
                    : 'border ${styles.cardBorder} ${styles.textSecondary} hover:${styles.background}'
                }\`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div>
          <label className="${styles.textSecondary} text-sm font-medium block mb-2">Price Range</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min"
              value={filters.minPrice || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, minPrice: parseInt(e.target.value) || 0 }))}
              className="flex-1 px-3 py-2 border ${styles.cardBorder} rounded-lg ${styles.textPrimary} text-sm"
            />
            <span className="${styles.textMuted}">-</span>
            <input
              type="number"
              placeholder="Max"
              value={filters.maxPrice || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: parseInt(e.target.value) || 0 }))}
              className="flex-1 px-3 py-2 border ${styles.cardBorder} rounded-lg ${styles.textPrimary} text-sm"
            />
          </div>
        </div>

        {/* Beds & Baths */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="${styles.textSecondary} text-sm font-medium block mb-2">Beds</label>
            <select
              value={filters.beds}
              onChange={(e) => setFilters(prev => ({ ...prev, beds: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border ${styles.cardBorder} rounded-lg ${styles.textPrimary}"
            >
              <option value={0}>Any</option>
              {[1, 2, 3, 4, 5].map(n => (
                <option key={n} value={n}>{n}+</option>
              ))}
            </select>
          </div>
          <div>
            <label className="${styles.textSecondary} text-sm font-medium block mb-2">Baths</label>
            <select
              value={filters.baths}
              onChange={(e) => setFilters(prev => ({ ...prev, baths: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border ${styles.cardBorder} rounded-lg ${styles.textPrimary}"
            >
              <option value={0}>Any</option>
              {[1, 2, 3, 4].map(n => (
                <option key={n} value={n}>{n}+</option>
              ))}
            </select>
          </div>
        </div>

        {/* Square Footage */}
        <div>
          <label className="${styles.textSecondary} text-sm font-medium block mb-2">Square Feet</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min"
              value={filters.minSqft || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, minSqft: parseInt(e.target.value) || 0 }))}
              className="flex-1 px-3 py-2 border ${styles.cardBorder} rounded-lg ${styles.textPrimary} text-sm"
            />
            <span className="${styles.textMuted}">-</span>
            <input
              type="number"
              placeholder="Max"
              value={filters.maxSqft || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, maxSqft: parseInt(e.target.value) || 0 }))}
              className="flex-1 px-3 py-2 border ${styles.cardBorder} rounded-lg ${styles.textPrimary} text-sm"
            />
          </div>
        </div>

        <button
          onClick={() => onSearch(filters)}
          className="w-full ${styles.button} text-white py-3 rounded-lg font-medium hover:${styles.buttonHover} transition-colors"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
};

export default PropertySearch;
`;
  }

  if (variant === 'inline') {
    return `import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Loader2 } from 'lucide-react';

interface PropertySearchProps {
  config?: any;
  onSearch: (query: string, type: 'sale' | 'rent' | 'all') => void;
  placeholder?: string;
}

export const PropertySearch: React.FC<PropertySearchProps> = ({
  config: propData,
  onSearch,
  placeholder: propPlaceholder,
}) => {
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const config = propData || fetchedData || {};
  const placeholder = propPlaceholder || config.placeholder || 'Search by location, address, or ZIP...';

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[60px]">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  const [query, setQuery] = useState('');
  const [type, setType] = useState<'sale' | 'rent' | 'all'>('all');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query, type);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="flex-1 relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2.5 border ${styles.cardBorder} rounded-lg ${styles.textPrimary} focus:ring-2 focus:ring-${styles.primary}"
        />
        <svg className="w-5 h-5 ${styles.textMuted} absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <select
        value={type}
        onChange={(e) => setType(e.target.value as typeof type)}
        className="px-4 py-2.5 border ${styles.cardBorder} rounded-lg ${styles.textPrimary}"
      >
        <option value="all">All</option>
        <option value="sale">For Sale</option>
        <option value="rent">For Rent</option>
      </select>
      <button
        type="submit"
        className="${styles.button} text-white px-6 py-2.5 rounded-lg font-medium hover:${styles.buttonHover} transition-colors"
      >
        Search
      </button>
    </form>
  );
};

export default PropertySearch;
`;
  }

  // Default hero variant
  return `import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Loader2 } from 'lucide-react';

interface PropertySearchProps {
  config?: any;
  onSearch: (filters: SearchFilters) => void;
  backgroundImage?: string;
  title?: string;
  subtitle?: string;
}

interface SearchFilters {
  location: string;
  type: 'sale' | 'rent';
  minPrice: number;
  maxPrice: number;
  beds: number;
  propertyType: string;
}

export const PropertySearch: React.FC<PropertySearchProps> = ({
  config: propData,
  onSearch,
  backgroundImage: propBackgroundImage,
  title: propTitle,
  subtitle: propSubtitle,
}) => {
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const config = propData || fetchedData || {};
  const backgroundImage = propBackgroundImage || config.backgroundImage;
  const title = propTitle || config.title || 'Find Your Dream Home';
  const subtitle = propSubtitle || config.subtitle || 'Search properties for sale and rent';

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  const [activeTab, setActiveTab] = useState<'sale' | 'rent'>('sale');
  const [location, setLocation] = useState('');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(0);
  const [beds, setBeds] = useState(0);
  const [propertyType, setPropertyType] = useState('');

  const handleSearch = () => {
    onSearch({
      location,
      type: activeTab,
      minPrice,
      maxPrice,
      beds,
      propertyType,
    });
  };

  return (
    <div
      className="relative py-20 px-4"
      style={{
        backgroundImage: backgroundImage ? \`url(\${backgroundImage})\` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {backgroundImage && (
        <div className="absolute inset-0 bg-black/50" />
      )}

      <div className="relative z-10 max-w-4xl mx-auto text-center mb-10">
        <h1 className={\`text-4xl md:text-5xl font-bold mb-4 \${backgroundImage ? 'text-white' : '${styles.textPrimary}'}\`}>
          {title}
        </h1>
        <p className={\`text-lg \${backgroundImage ? 'text-white/80' : '${styles.textSecondary}'}\`}>
          {subtitle}
        </p>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="${styles.card} rounded-2xl ${styles.cardShadow} overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b ${styles.cardBorder}">
            <button
              onClick={() => setActiveTab('sale')}
              className={\`flex-1 py-4 text-center font-medium transition-colors \${
                activeTab === 'sale'
                  ? '${styles.primary} border-b-2 border-current'
                  : '${styles.textMuted} hover:${styles.textPrimary}'
              }\`}
            >
              For Sale
            </button>
            <button
              onClick={() => setActiveTab('rent')}
              className={\`flex-1 py-4 text-center font-medium transition-colors \${
                activeTab === 'rent'
                  ? '${styles.primary} border-b-2 border-current'
                  : '${styles.textMuted} hover:${styles.textPrimary}'
              }\`}
            >
              For Rent
            </button>
          </div>

          {/* Search Fields */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* Location */}
              <div className="lg:col-span-2">
                <label className="${styles.textSecondary} text-sm font-medium block mb-2">Location</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="City, neighborhood, ZIP, or address"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border ${styles.cardBorder} rounded-lg ${styles.textPrimary}"
                  />
                  <svg className="w-5 h-5 ${styles.textMuted} absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </div>

              {/* Property Type */}
              <div>
                <label className="${styles.textSecondary} text-sm font-medium block mb-2">Property Type</label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full px-4 py-3 border ${styles.cardBorder} rounded-lg ${styles.textPrimary}"
                >
                  <option value="">All Types</option>
                  <option value="house">House</option>
                  <option value="condo">Condo</option>
                  <option value="townhouse">Townhouse</option>
                  <option value="multi-family">Multi-Family</option>
                  <option value="land">Land</option>
                </select>
              </div>

              {/* Beds */}
              <div>
                <label className="${styles.textSecondary} text-sm font-medium block mb-2">Bedrooms</label>
                <select
                  value={beds}
                  onChange={(e) => setBeds(parseInt(e.target.value))}
                  className="w-full px-4 py-3 border ${styles.cardBorder} rounded-lg ${styles.textPrimary}"
                >
                  <option value={0}>Any</option>
                  <option value={1}>1+</option>
                  <option value={2}>2+</option>
                  <option value={3}>3+</option>
                  <option value={4}>4+</option>
                  <option value={5}>5+</option>
                </select>
              </div>
            </div>

            {/* Price Range */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="${styles.textSecondary} text-sm font-medium block mb-2">Min Price</label>
                <select
                  value={minPrice}
                  onChange={(e) => setMinPrice(parseInt(e.target.value))}
                  className="w-full px-4 py-3 border ${styles.cardBorder} rounded-lg ${styles.textPrimary}"
                >
                  <option value={0}>No Min</option>
                  {activeTab === 'sale' ? (
                    <>
                      <option value={100000}>$100,000</option>
                      <option value={200000}>$200,000</option>
                      <option value={300000}>$300,000</option>
                      <option value={500000}>$500,000</option>
                      <option value={750000}>$750,000</option>
                      <option value={1000000}>$1,000,000</option>
                    </>
                  ) : (
                    <>
                      <option value={500}>$500</option>
                      <option value={1000}>$1,000</option>
                      <option value={1500}>$1,500</option>
                      <option value={2000}>$2,000</option>
                      <option value={2500}>$2,500</option>
                      <option value={3000}>$3,000</option>
                    </>
                  )}
                </select>
              </div>
              <div>
                <label className="${styles.textSecondary} text-sm font-medium block mb-2">Max Price</label>
                <select
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                  className="w-full px-4 py-3 border ${styles.cardBorder} rounded-lg ${styles.textPrimary}"
                >
                  <option value={0}>No Max</option>
                  {activeTab === 'sale' ? (
                    <>
                      <option value={200000}>$200,000</option>
                      <option value={300000}>$300,000</option>
                      <option value={500000}>$500,000</option>
                      <option value={750000}>$750,000</option>
                      <option value={1000000}>$1,000,000</option>
                      <option value={2000000}>$2,000,000</option>
                    </>
                  ) : (
                    <>
                      <option value={1000}>$1,000</option>
                      <option value={1500}>$1,500</option>
                      <option value={2000}>$2,000</option>
                      <option value={2500}>$2,500</option>
                      <option value={3000}>$3,000</option>
                      <option value={5000}>$5,000</option>
                    </>
                  )}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleSearch}
                  className="w-full ${styles.button} text-white py-3 rounded-lg font-medium hover:${styles.buttonHover} transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search Properties
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertySearch;
`;
};
