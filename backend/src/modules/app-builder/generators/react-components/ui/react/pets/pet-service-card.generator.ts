/**
 * Pet Service Card Generator
 *
 * Generates service listing cards for pet care businesses.
 */

import { ResolvedComponent } from '../../../types/resolved-component.interface';
import { getStyleClasses } from '../../../helpers/style-helpers';

export const generatePetServiceCard = (
  resolved: ResolvedComponent,
  variant: 'grid' | 'horizontal' | 'pricing' = 'grid'
): string => {
  const styles = getStyleClasses(resolved.uiStyle);
  const dataSource = resolved.dataSource;

  // Parse data source for clean prop naming (sanitize to camelCase)
  const sanitizeVariableName = (name: string): string => {
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
    if (!dataSource || dataSource.trim() === '') return 'service';
    const parts = dataSource.split('.');
    const lastPart = parts[parts.length - 1];
    return lastPart ? sanitizeVariableName(lastPart) : 'service';
  };

  const dataName = getDataPath();

  // Get API route for data fetching
  const getApiRoute = () => {
    if (resolved.actions && resolved.actions.length > 0) {
      const fetchAction = resolved.actions.find((a: any) => a.type === 'fetch');
      if (fetchAction?.serverFunction?.route) {
        return fetchAction.serverFunction.route.replace(/^\/api\/v1\//, '/');
      }
    }
    return `/${dataSource || 'pet-services'}`;
  };

  const apiRoute = getApiRoute();
  const entity = dataSource?.split('.').pop() || 'petService';

  if (variant === 'horizontal') {
    return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Loader2 } from 'lucide-react';

interface PetServiceCardProps {
  ${dataName}?: any;
  id?: string;
  name?: string;
  description?: string;
  price?: number;
  duration?: string;
  icon?: string;
  forSpecies?: string[];
  onBook?: () => void;
}

export const PetServiceCard: React.FC<PetServiceCardProps> = ({
  ${dataName}: propData,
  id: propId,
  name: propName,
  description: propDescription,
  price: propPrice,
  duration: propDuration,
  icon: propIcon,
  forSpecies: propForSpecies,
  onBook,
}) => {
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${entity}', propId],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData && !propId,
    retry: 1,
  });

  const serviceData = propData || fetchedData || {};
  const id = propId || serviceData.id || '';
  const name = propName || serviceData.name || 'Service';
  const description = propDescription || serviceData.description || '';
  const price = propPrice ?? serviceData.price ?? 0;
  const duration = propDuration || serviceData.duration || '';
  const icon = propIcon || serviceData.icon || '\ud83d\udc3e';
  const forSpecies = propForSpecies || serviceData.forSpecies;

  if (isLoading && !propData && !propId) {
    return (
      <div className="flex items-center justify-center min-h-[80px]">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="${styles.card} p-4 rounded-xl ${styles.cardShadow} flex items-center gap-4">
      <div className="w-14 h-14 ${styles.background} rounded-xl flex items-center justify-center text-2xl shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="${styles.textPrimary} font-semibold">{name}</h3>
        <p className="${styles.textMuted} text-sm line-clamp-1">{description}</p>
        {forSpecies && (
          <p className="${styles.textMuted} text-xs mt-1">
            For: {forSpecies.join(', ')}
          </p>
        )}
      </div>
      <div className="text-right shrink-0">
        <p className="${styles.primary} font-bold">\${price}</p>
        <p className="${styles.textMuted} text-sm">{duration}</p>
      </div>
      <button
        onClick={onBook}
        className="${styles.button} text-white px-4 py-2 rounded-lg text-sm font-medium shrink-0"
      >
        Book
      </button>
    </div>
  );
};

export default PetServiceCard;
`;
  }

  if (variant === 'pricing') {
    return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Loader2 } from 'lucide-react';

interface PriceOption {
  name: string;
  price: number;
  description?: string;
}

interface PetServiceCardProps {
  ${dataName}?: any;
  id?: string;
  name?: string;
  description?: string;
  icon?: string;
  prices?: PriceOption[];
  popular?: boolean;
  features?: string[];
  onSelect?: (option: PriceOption) => void;
}

export const PetServiceCard: React.FC<PetServiceCardProps> = ({
  ${dataName}: propData,
  id: propId,
  name: propName,
  description: propDescription,
  icon: propIcon,
  prices: propPrices,
  popular: propPopular,
  features: propFeatures,
  onSelect,
}) => {
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${entity}', propId],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData && !propId,
    retry: 1,
  });

  const serviceData = propData || fetchedData || {};
  const id = propId || serviceData.id || '';
  const name = propName || serviceData.name || 'Service';
  const description = propDescription || serviceData.description || '';
  const icon = propIcon || serviceData.icon || '\ud83d\udc3e';
  const prices = propPrices || serviceData.prices || [];
  const popular = propPopular ?? serviceData.popular ?? false;
  const features = propFeatures || serviceData.features || [];

  if (isLoading && !propData && !propId) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className={\`${styles.card} rounded-2xl overflow-hidden ${styles.cardShadow} \${popular ? 'ring-2 ${styles.primary}' : ''}\`}>
      {popular && (
        <div className="${styles.button} text-white text-center py-1.5 text-sm font-medium">
          Most Popular
        </div>
      )}

      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 ${styles.background} rounded-xl flex items-center justify-center text-2xl">
            {icon}
          </div>
          <div>
            <h3 className="${styles.textPrimary} font-bold text-lg">{name}</h3>
            <p className="${styles.textMuted} text-sm">{description}</p>
          </div>
        </div>

        {/* Price Options */}
        {prices.length > 0 && (
          <div className="space-y-3 mb-6">
            {prices.map((option, idx) => (
              <button
                key={idx}
                onClick={() => onSelect?.(option)}
                className="w-full p-3 rounded-lg border ${styles.cardBorder} hover:${styles.background} transition-colors text-left"
              >
                <div className="flex items-center justify-between">
                  <span className="${styles.textPrimary} font-medium">{option.name}</span>
                  <span className="${styles.primary} font-bold">\${option.price}</span>
                </div>
                {option.description && (
                  <p className="${styles.textMuted} text-sm mt-1">{option.description}</p>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Features */}
        {features.length > 0 && (
          <div className="space-y-2">
            {features.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm">
                <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="${styles.textSecondary}">{feature}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PetServiceCard;
`;
  }

  // Default grid variant
  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Loader2 } from 'lucide-react';

interface PetServiceCardProps {
  ${dataName}?: any;
  id?: string;
  name?: string;
  description?: string;
  price?: number;
  duration?: string;
  icon?: string;
  image?: string;
  forSpecies?: string[];
  popular?: boolean;
  onBook?: () => void;
  onLearnMore?: () => void;
}

export const PetServiceCard: React.FC<PetServiceCardProps> = ({
  ${dataName}: propData,
  id: propId,
  name: propName,
  description: propDescription,
  price: propPrice,
  duration: propDuration,
  icon: propIcon,
  image: propImage,
  forSpecies: propForSpecies,
  popular: propPopular,
  onBook,
  onLearnMore,
}) => {
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${entity}', propId],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData && !propId,
    retry: 1,
  });

  const serviceData = propData || fetchedData || {};
  const id = propId || serviceData.id || '';
  const name = propName || serviceData.name || 'Service';
  const description = propDescription || serviceData.description || '';
  const price = propPrice ?? serviceData.price ?? 0;
  const duration = propDuration || serviceData.duration || '';
  const icon = propIcon || serviceData.icon || '\ud83d\udc3e';
  const image = propImage || serviceData.image;
  const forSpecies = propForSpecies || serviceData.forSpecies;
  const popular = propPopular ?? serviceData.popular ?? false;

  if (isLoading && !propData && !propId) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="${styles.card} rounded-xl overflow-hidden ${styles.cardShadow} hover:${styles.cardHoverShadow} transition-all">
      {image ? (
        <div className="relative h-40">
          <img src={image} alt={name} className="w-full h-full object-cover" />
          {popular && (
            <span className="absolute top-3 left-3 ${styles.button} text-white px-2 py-1 text-xs font-medium rounded">
              Popular
            </span>
          )}
        </div>
      ) : (
        <div className="relative h-32 ${styles.background} flex items-center justify-center">
          <span className="text-5xl">{icon}</span>
          {popular && (
            <span className="absolute top-3 left-3 ${styles.button} text-white px-2 py-1 text-xs font-medium rounded">
              Popular
            </span>
          )}
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="${styles.textPrimary} font-semibold">{name}</h3>
          <div className="text-right">
            <p className="${styles.primary} font-bold">\${price}</p>
            <p className="${styles.textMuted} text-xs">{duration}</p>
          </div>
        </div>

        <p className="${styles.textMuted} text-sm mb-3 line-clamp-2">{description}</p>

        {forSpecies && forSpecies.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {forSpecies.map((species) => (
              <span
                key={species}
                className="px-2 py-0.5 ${styles.background} ${styles.textSecondary} text-xs rounded-full capitalize"
              >
                {species}
              </span>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={onBook}
            className="${styles.button} text-white px-4 py-2 rounded-lg text-sm font-medium flex-1 hover:${styles.buttonHover} transition-colors"
          >
            Book Now
          </button>
          {onLearnMore && (
            <button
              onClick={onLearnMore}
              className="border ${styles.cardBorder} ${styles.textSecondary} px-4 py-2 rounded-lg text-sm hover:${styles.background} transition-colors"
            >
              Details
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PetServiceCard;
`;
};
