/**
 * Property Card Generator
 *
 * Generates property listing cards for real estate applications.
 */

import { ResolvedComponent } from '../../../types/resolved-component.interface';
import { getStyleClasses } from '../../../helpers/style-helpers';

export const generatePropertyCard = (
  resolved: ResolvedComponent,
  variant: 'grid' | 'horizontal' | 'featured' = 'grid'
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
    return `/${dataSource || 'properties'}`;
  };

  const apiRoute = getApiRoute();
  const entity = dataSource?.split('.').pop() || 'properties';

  if (variant === 'horizontal') {
    return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Loader2 } from 'lucide-react';

interface PropertyCardProps {
  property?: any;
  id?: string;
  title?: string;
  address?: string;
  city?: string;
  state?: string;
  price?: number;
  beds?: number;
  baths?: number;
  sqft?: number;
  images?: string[];
  type?: 'sale' | 'rent';
  status?: 'active' | 'pending' | 'sold';
  featured?: boolean;
  onClick?: () => void;
  onSave?: () => void;
  isSaved?: boolean;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property: propData,
  id: propId,
  title: propTitle,
  address: propAddress,
  city: propCity,
  state: propState,
  price: propPrice,
  beds: propBeds,
  baths: propBaths,
  sqft: propSqft,
  images: propImages,
  type: propType,
  status: propStatus = 'active',
  featured: propFeatured,
  onClick,
  onSave,
  isSaved,
}) => {
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response[0] : (response?.data?.[0] || response || {});
    },
    enabled: !propData && !propId,
    retry: 1,
  });

  const property = propData || fetchedData || {};
  const id = propId || property.id;
  const title = propTitle || property.title || '';
  const address = propAddress || property.address || '';
  const city = propCity || property.city || '';
  const state = propState || property.state || '';
  const price = propPrice || property.price || 0;
  const beds = propBeds || property.beds || 0;
  const baths = propBaths || property.baths || 0;
  const sqft = propSqft || property.sqft || 0;
  const images = propImages || property.images || [];
  const type = propType || property.type || 'sale';
  const status = propStatus || property.status || 'active';
  const featured = propFeatured || property.featured;

  if (isLoading && !propData && !propId) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  const formatPrice = (p: number) => {
    return type === 'rent'
      ? \`\$\${p.toLocaleString()}/mo\`
      : \`\$\${p.toLocaleString()}\`;
  };

  return (
    <div
      onClick={onClick}
      className="${styles.card} rounded-xl overflow-hidden cursor-pointer hover:${styles.cardHoverShadow} transition-all flex flex-col md:flex-row"
    >
      <div className="relative w-full md:w-72 h-48 md:h-auto shrink-0">
        <img
          src={images[0] || '/placeholder-property.jpg'}
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={\`px-2 py-1 text-xs font-medium rounded \${
            type === 'rent' ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'
          }\`}>
            For {type === 'rent' ? 'Rent' : 'Sale'}
          </span>
          {featured && (
            <span className="px-2 py-1 bg-amber-500 text-white text-xs font-medium rounded">
              Featured
            </span>
          )}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onSave?.(); }}
          className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform"
        >
          <svg className={\`w-5 h-5 \${isSaved ? 'text-red-500 fill-current' : '${styles.textMuted}'}\`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      <div className="flex-1 p-5">
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="${styles.primary} text-xl font-bold">{formatPrice(price)}</p>
            <h3 className="${styles.textPrimary} font-semibold mt-1">{title}</h3>
          </div>
          {status !== 'active' && (
            <span className={\`px-2 py-1 text-xs font-medium rounded \${
              status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
            }\`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          )}
        </div>

        <p className="${styles.textMuted} text-sm mb-4">
          {address}, {city}, {state}
        </p>

        <div className="flex items-center gap-6 ${styles.textSecondary}">
          <div className="flex items-center gap-1.5">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="font-medium">{beds}</span>
            <span className="text-sm">Beds</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
            </svg>
            <span className="font-medium">{baths}</span>
            <span className="text-sm">Baths</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
            <span className="font-medium">{sqft.toLocaleString()}</span>
            <span className="text-sm">Sqft</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
`;
  }

  if (variant === 'featured') {
    return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Loader2 } from 'lucide-react';

interface PropertyCardProps {
  property?: any;
  id?: string;
  title?: string;
  address?: string;
  city?: string;
  state?: string;
  price?: number;
  beds?: number;
  baths?: number;
  sqft?: number;
  lotSize?: string;
  yearBuilt?: number;
  images?: string[];
  type?: 'sale' | 'rent';
  propertyType?: string;
  description?: string;
  agent?: {
    name: string;
    photo?: string;
    phone?: string;
  };
  onClick?: () => void;
  onContact?: () => void;
  onScheduleTour?: () => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property: propData,
  id: propId,
  title: propTitle,
  address: propAddress,
  city: propCity,
  state: propState,
  price: propPrice,
  beds: propBeds,
  baths: propBaths,
  sqft: propSqft,
  lotSize: propLotSize,
  yearBuilt: propYearBuilt,
  images: propImages,
  type: propType,
  propertyType: propPropertyType,
  description: propDescription,
  agent: propAgent,
  onClick,
  onContact,
  onScheduleTour,
}) => {
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response[0] : (response?.data?.[0] || response || {});
    },
    enabled: !propData && !propId,
    retry: 1,
  });

  const property = propData || fetchedData || {};
  const id = propId || property.id;
  const title = propTitle || property.title || '';
  const address = propAddress || property.address || '';
  const city = propCity || property.city || '';
  const state = propState || property.state || '';
  const price = propPrice || property.price || 0;
  const beds = propBeds || property.beds || 0;
  const baths = propBaths || property.baths || 0;
  const sqft = propSqft || property.sqft || 0;
  const lotSize = propLotSize || property.lotSize;
  const yearBuilt = propYearBuilt || property.yearBuilt;
  const images = propImages || property.images || [];
  const type = propType || property.type || 'sale';
  const propertyType = propPropertyType || property.propertyType;
  const description = propDescription || property.description;
  const agent = propAgent || property.agent;

  if (isLoading && !propData && !propId) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  const formatPrice = (p: number) => {
    return type === 'rent'
      ? \`\$\${p.toLocaleString()}/mo\`
      : \`\$\${p.toLocaleString()}\`;
  };

  return (
    <div className="${styles.card} rounded-2xl overflow-hidden ${styles.cardShadow}">
      <div className="relative h-80">
        <img
          src={images[0] || '/placeholder-property.jpg'}
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        <div className="absolute top-4 left-4 flex gap-2">
          <span className="${styles.button} text-white px-3 py-1 text-sm font-medium rounded-full">
            Featured
          </span>
          <span className={\`px-3 py-1 text-sm font-medium rounded-full \${
            type === 'rent' ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'
          }\`}>
            For {type === 'rent' ? 'Rent' : 'Sale'}
          </span>
        </div>

        <div className="absolute bottom-4 left-4 right-4 text-white">
          <p className="text-3xl font-bold mb-1">{formatPrice(price)}</p>
          <h3 className="text-xl font-semibold">{title}</h3>
          <p className="text-white/80">{address}, {city}, {state}</p>
        </div>

        {images.length > 1 && (
          <div className="absolute bottom-4 right-4 flex gap-1">
            {images.slice(0, 4).map((_, idx) => (
              <div key={idx} className="w-2 h-2 rounded-full bg-white/50" />
            ))}
          </div>
        )}
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-8">
            <div className="text-center">
              <p className="${styles.textPrimary} text-2xl font-bold">{beds}</p>
              <p className="${styles.textMuted} text-sm">Bedrooms</p>
            </div>
            <div className="text-center">
              <p className="${styles.textPrimary} text-2xl font-bold">{baths}</p>
              <p className="${styles.textMuted} text-sm">Bathrooms</p>
            </div>
            <div className="text-center">
              <p className="${styles.textPrimary} text-2xl font-bold">{sqft.toLocaleString()}</p>
              <p className="${styles.textMuted} text-sm">Sq Ft</p>
            </div>
          </div>
          {propertyType && (
            <span className="${styles.background} ${styles.textSecondary} px-3 py-1 rounded-full text-sm">
              {propertyType}
            </span>
          )}
        </div>

        {description && (
          <p className="${styles.textSecondary} mb-6 line-clamp-2">{description}</p>
        )}

        <div className="grid grid-cols-3 gap-4 mb-6 text-sm">
          {lotSize && (
            <div>
              <p className="${styles.textMuted}">Lot Size</p>
              <p className="${styles.textPrimary} font-medium">{lotSize}</p>
            </div>
          )}
          {yearBuilt && (
            <div>
              <p className="${styles.textMuted}">Year Built</p>
              <p className="${styles.textPrimary} font-medium">{yearBuilt}</p>
            </div>
          )}
        </div>

        {agent && (
          <div className="flex items-center justify-between pt-4 border-t ${styles.cardBorder}">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full ${styles.background} overflow-hidden">
                {agent.photo ? (
                  <img src={agent.photo} alt={agent.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center ${styles.textMuted}">
                    {agent.name.charAt(0)}
                  </div>
                )}
              </div>
              <div>
                <p className="${styles.textPrimary} font-medium">{agent.name}</p>
                {agent.phone && <p className="${styles.textMuted} text-sm">{agent.phone}</p>}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onContact}
                className="border ${styles.cardBorder} ${styles.textPrimary} px-4 py-2 rounded-lg text-sm font-medium hover:${styles.background} transition-colors"
              >
                Contact
              </button>
              <button
                onClick={onScheduleTour}
                className="${styles.button} text-white px-4 py-2 rounded-lg text-sm font-medium hover:${styles.buttonHover} transition-colors"
              >
                Schedule Tour
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyCard;
`;
  }

  // Default grid variant
  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Loader2 } from 'lucide-react';

interface PropertyCardProps {
  property?: any;
  id?: string;
  title?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  price?: number;
  beds?: number;
  baths?: number;
  sqft?: number;
  images?: string[];
  type?: 'sale' | 'rent';
  propertyType?: string;
  status?: 'active' | 'pending' | 'sold' | 'off-market';
  featured?: boolean;
  onClick?: () => void;
  onSave?: () => void;
  isSaved?: boolean;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property: propData,
  id: propId,
  title: propTitle,
  address: propAddress,
  city: propCity,
  state: propState,
  zipCode: propZipCode,
  price: propPrice,
  beds: propBeds,
  baths: propBaths,
  sqft: propSqft,
  images: propImages,
  type: propType,
  propertyType: propPropertyType,
  status: propStatus = 'active',
  featured: propFeatured,
  onClick,
  onSave,
  isSaved,
}) => {
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response[0] : (response?.data?.[0] || response || {});
    },
    enabled: !propData && !propId,
    retry: 1,
  });

  const property = propData || fetchedData || {};
  const id = propId || property.id;
  const title = propTitle || property.title || '';
  const address = propAddress || property.address || '';
  const city = propCity || property.city || '';
  const state = propState || property.state || '';
  const zipCode = propZipCode || property.zipCode;
  const price = propPrice || property.price || 0;
  const beds = propBeds || property.beds || 0;
  const baths = propBaths || property.baths || 0;
  const sqft = propSqft || property.sqft || 0;
  const images = propImages || property.images || [];
  const type = propType || property.type || 'sale';
  const propertyType = propPropertyType || property.propertyType;
  const status = propStatus || property.status || 'active';
  const featured = propFeatured || property.featured;

  if (isLoading && !propData && !propId) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  const formatPrice = (p: number) => {
    return type === 'rent'
      ? \`\$\${p.toLocaleString()}/mo\`
      : \`\$\${p.toLocaleString()}\`;
  };

  const statusColors = {
    active: '',
    pending: 'bg-amber-100 text-amber-700',
    sold: 'bg-red-100 text-red-700',
    'off-market': 'bg-gray-100 text-gray-600',
  };

  return (
    <div
      onClick={onClick}
      className="${styles.card} rounded-xl overflow-hidden cursor-pointer hover:${styles.cardHoverShadow} transition-all group"
    >
      <div className="relative h-52">
        <img
          src={images[0] || '/placeholder-property.jpg'}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          <span className={\`px-2.5 py-1 text-xs font-semibold rounded-md \${
            type === 'rent' ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'
          }\`}>
            For {type === 'rent' ? 'Rent' : 'Sale'}
          </span>
          {featured && (
            <span className="px-2.5 py-1 bg-amber-500 text-white text-xs font-semibold rounded-md">
              Featured
            </span>
          )}
          {status !== 'active' && (
            <span className={\`px-2.5 py-1 text-xs font-semibold rounded-md \${statusColors[status]}\`}>
              {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
            </span>
          )}
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); onSave?.(); }}
          className="absolute top-3 right-3 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
        >
          <svg
            className={\`w-5 h-5 \${isSaved ? 'text-red-500 fill-current' : '${styles.textMuted}'}\`}
            fill={isSaved ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>

        {images.length > 1 && (
          <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded">
            1/{images.length}
          </div>
        )}
      </div>

      <div className="p-4">
        <p className="${styles.primary} text-xl font-bold mb-1">{formatPrice(price)}</p>

        <div className="flex items-center gap-3 mb-2 ${styles.textSecondary} text-sm">
          <span className="flex items-center gap-1">
            <strong>{beds}</strong> bd
          </span>
          <span className="w-1 h-1 rounded-full bg-current opacity-40" />
          <span className="flex items-center gap-1">
            <strong>{baths}</strong> ba
          </span>
          <span className="w-1 h-1 rounded-full bg-current opacity-40" />
          <span className="flex items-center gap-1">
            <strong>{sqft.toLocaleString()}</strong> sqft
          </span>
        </div>

        <p className="${styles.textPrimary} font-medium truncate">{title}</p>
        <p className="${styles.textMuted} text-sm truncate">
          {address}, {city}, {state} {zipCode}
        </p>

        {propertyType && (
          <p className="${styles.textMuted} text-xs mt-2">{propertyType}</p>
        )}
      </div>
    </div>
  );
};

export default PropertyCard;
`;
};
