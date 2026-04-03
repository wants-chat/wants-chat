import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateRestaurantDetailHeader = (
  resolved: ResolvedComponent,
  variant: 'standard' | 'minimal' = 'standard'
) => {
  const dataSource = resolved.dataSource;

  // Generate API route from resolved actions
  const getApiRoute = () => {
    if (resolved.actions && resolved.actions.length > 0) {
      const fetchAction = resolved.actions.find((a: any) => a.type === 'fetch');
      if (fetchAction?.serverFunction?.route) {
        return fetchAction.serverFunction.route.replace(/^\/api\/v1\//, '/');
      }
    }
    return `/${dataSource || 'restaurant'}`;
  };

  const apiRoute = getApiRoute();
  const entity = dataSource?.split('.').pop() || 'restaurant';

  // Get the resolved field names from the field resolver service
  const getField = (fieldName: string): string => {
    const mapping = resolved.fieldMappings.find(m => m.targetField === fieldName);
    if (mapping?.sourceField) {
      return `propData?.${mapping.sourceField}`;
    }
    // Return undefined/empty for missing data - let component handle gracefully
    // For ID fields
    if (fieldName === 'id' || fieldName.endsWith('Id')) {
      return `propData?.id || ${dataName}?._id`;
    }
    // For array fields
    if (fieldName.match(/items|steps|updates|timeline|list|array|images|hours|tags/i)) {
      return `propData?.${fieldName} || ([] as any[])`;
    }
    // For object fields
    if (fieldName.match(/address|metadata|config|settings/i)) {
      return `propData?.${fieldName} || ({} as any)`;
    }
    // For boolean fields
    if (fieldName.match(/is_|has_|can_|should_/i)) {
      return `propData?.${fieldName} || false`;
    }
    // For scalar values - return empty string as fallback
    return `propData?.${fieldName} || ''`;
  };

  // Parse data source for clean prop naming (sanitize to camelCase)
  const sanitizeVariableName = (name: string): string => {
    // Replace dots and underscores with camelCase
    return name
      .split(/[._]/)
      .map((part, index) => {
        if (index === 0) {
          return part;
        }
        return part.charAt(0).toUpperCase() + part.slice(1);
      })
      .join('');
  };

  const getDataPath = () => {
    if (!dataSource || dataSource.trim() === '') return 'data';
    const parts = dataSource.split('.');
    const lastPart = parts[parts.length - 1];
    return lastPart ? sanitizeVariableName(lastPart) : 'data';
  };

  const dataName = getDataPath();

  const getRatingStars = `(rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

    return (
      <>
        {Array(fullStars).fill(0).map((_, i) => (
          <Star key={\`full-\${i}\`} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        ))}
        {hasHalf && <Star key="half" className="w-4 h-4 fill-yellow-400/50 text-yellow-400" />}
        {Array(emptyStars).fill(0).map((_, i) => (
          <Star key={\`empty-\${i}\`} className="w-4 h-4 text-gray-300" />
        ))}
      </>
    );
  }`;

  const formatCurrency = `(amount: number | string) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numAmount);
  }`;

  const variants = {
    standard: `
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Phone, Clock, DollarSign, Utensils, Loader2 } from 'lucide-react';

interface RestaurantDetailHeaderProps {
  [key: string]: any;
  className?: string;
}

const RestaurantDetailHeader: React.FC<RestaurantDetailHeaderProps> = ({ ${dataName}: propData, className }) => {
  // Dynamic data fetching with react-query
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return response?.data || response;
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData;

  const getRatingStars = ${getRatingStars};
  const formatCurrency = ${formatCurrency};

  // Loading state
  if (isLoading && !propData) {
    return (
      <div className={className}>
        <div className="flex items-center justify-center min-h-[300px] bg-gray-100 rounded-lg">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  // Helper to safely convert values to displayable strings
  const toDisplayString = (value: any, fallback: string = ''): string => {
    if (value === null || value === undefined) return fallback;
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return String(value);
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (Array.isArray(value)) return value.filter(v => v).join(', ');
    if (typeof value === 'object') {
      // Try common property names for objects
      return value.name || value.text || value.value || JSON.stringify(value);
    }
    return fallback;
  };

  // Restaurant fields - safely extract and convert
  const restaurantId = ${getField('id')};
  const name = toDisplayString(${getField('name')}, 'Restaurant Name');
  const description = toDisplayString(${getField('description')}, 'Restaurant description');
  const logoUrl = toDisplayString(${getField('logo_url')} || ${getField('logo')}, '');
  const coverImage = toDisplayString(${getField('cover_image')} || ${getField('image')}, 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200');
  const cuisineTypes = toDisplayString(${getField('cuisine_types')} || ${getField('cuisine')}, 'Various');
  const location = toDisplayString(${getField('location')} || ${getField('address')}, '');
  const phone = toDisplayString(${getField('phone')}, '');
  const rating = Number(${getField('rating')}) || 0;
  const reviewCount = Number(${getField('review_count')} || ${getField('reviews_count')}) || 0;
  const deliveryFee = Number(${getField('delivery_fee')}) || 0;
  const minimumOrder = Number(${getField('minimum_order')} || ${getField('min_order')}) || 0;
  const estimatedDeliveryTime = Number(${getField('estimated_delivery_time')} || ${getField('delivery_time')}) || 30;
  const isOpen = (${getField('is_open')} !== undefined && ${getField('is_open')} !== null) ? Boolean(${getField('is_open')}) : ((${getField('open')} !== undefined && ${getField('open')} !== null) ? Boolean(${getField('open')}) : true);
  const openingHours = toDisplayString(${getField('opening_hours')} || ${getField('hours')}, 'Mon-Sun: 9:00 AM - 10:00 PM');

  return (
    <div className={className}>
      {/* Cover Image */}
      <div className="relative w-full h-64 md:h-80 bg-gray-200 rounded-t-lg overflow-hidden">
        <img
          src={coverImage}
          alt={name}
          className="w-full h-full object-cover"
        />
        {logoUrl && (
          <div className="absolute bottom-4 left-4 md:left-6">
            <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-lg shadow-lg overflow-hidden border-4 border-white">
              <img
                src={logoUrl}
                alt={\`\${name} logo\`}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}
        <div className="absolute top-4 right-4">
          <Badge className={\`\${isOpen ? 'bg-green-600' : 'bg-red-600'} text-white font-semibold px-3 py-1\`}>
            {isOpen ? 'Open Now' : 'Closed'}
          </Badge>
        </div>
      </div>

      {/* Restaurant Info */}
      <Card className="rounded-t-none shadow-lg">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Header */}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                {name}
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                <div className="flex items-center gap-1">
                  <Utensils className="w-4 h-4" />
                  <span>{cuisineTypes}</span>
                </div>
                {location && (
                  <>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{location}</span>
                    </div>
                  </>
                )}
              </div>
              {description && (
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {description}
                </p>
              )}
            </div>

            {/* Rating & Reviews */}
            {rating > 0 && (
              <div className="flex items-center gap-3 py-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {getRatingStars(rating)}
                  </div>
                  <span className="font-semibold text-lg">{rating.toFixed(1)}</span>
                </div>
                {reviewCount > 0 && (
                  <span className="text-gray-500 dark:text-gray-400">
                    ({reviewCount.toLocaleString()} reviews)
                  </span>
                )}
              </div>
            )}

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 py-4 border-t border-gray-200 dark:border-gray-700">
              {/* Delivery Fee */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Delivery Fee</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {deliveryFee === 0 ? 'Free' : formatCurrency(deliveryFee)}
                  </p>
                </div>
              </div>

              {/* Minimum Order */}
              {minimumOrder > 0 && (
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Minimum Order</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(minimumOrder)}
                    </p>
                  </div>
                </div>
              )}

              {/* Delivery Time */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Delivery Time</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {estimatedDeliveryTime} min
                  </p>
                </div>
              </div>

              {/* Phone */}
              {phone && (
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {phone}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Opening Hours */}
            {openingHours && (
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    Opening Hours:
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {openingHours}
                  </span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RestaurantDetailHeader;
    `,

    minimal: `
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Clock, Loader2 } from 'lucide-react';

interface RestaurantDetailHeaderProps {
  [key: string]: any;
  className?: string;
}

const RestaurantDetailHeader: React.FC<RestaurantDetailHeaderProps> = ({ ${dataName}: propData, className }) => {
  // Dynamic data fetching with react-query
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return response?.data || response;
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData;

  const getRatingStars = ${getRatingStars};

  // Loading state
  if (isLoading && !propData) {
    return (
      <div className={className}>
        <div className="flex items-center justify-center min-h-[200px] bg-gray-100 rounded-lg">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  // Helper to safely convert values to displayable strings
  const toDisplayString = (value: any, fallback: string = ''): string => {
    if (value === null || value === undefined) return fallback;
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return String(value);
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (Array.isArray(value)) return value.filter(v => v).join(', ');
    if (typeof value === 'object') {
      // Try common property names for objects
      return value.name || value.text || value.value || JSON.stringify(value);
    }
    return fallback;
  };

  // Restaurant fields - safely extract and convert
  const name = toDisplayString(${getField('name')}, 'Restaurant Name');
  const description = toDisplayString(${getField('description')}, '');
  const cuisineTypes = toDisplayString(${getField('cuisine_types')} || ${getField('cuisine')}, '');
  const location = toDisplayString(${getField('location')} || ${getField('address')}, '');
  const rating = Number(${getField('rating')}) || 0;
  const reviewCount = Number(${getField('review_count')} || ${getField('reviews_count')}) || 0;
  const estimatedDeliveryTime = Number(${getField('estimated_delivery_time')} || ${getField('delivery_time')}) || 30;
  const isOpen = (${getField('is_open')} !== undefined && ${getField('is_open')} !== null) ? Boolean(${getField('is_open')}) : ((${getField('open')} !== undefined && ${getField('open')} !== null) ? Boolean(${getField('open')}) : true);

  return (
    <div className={className}>
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {name}
            </h1>
            {cuisineTypes && (
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                {cuisineTypes}
              </p>
            )}
          </div>
          <Badge className={\`\${isOpen ? 'bg-green-600' : 'bg-red-600'} text-white\`}>
            {isOpen ? 'Open' : 'Closed'}
          </Badge>
        </div>

        {description && (
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          {rating > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {getRatingStars(rating)}
              </div>
              <span className="font-semibold">{rating.toFixed(1)}</span>
              {reviewCount > 0 && <span>({reviewCount})</span>}
            </div>
          )}
          {location && (
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{location}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{estimatedDeliveryTime} min</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantDetailHeader;
    `
  };

  return variants[variant] || variants.standard;
};
