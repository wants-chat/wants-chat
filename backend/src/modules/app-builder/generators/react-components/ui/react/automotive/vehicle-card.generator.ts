/**
 * Vehicle Card Generator
 *
 * Generates vehicle listing cards for automotive applications.
 */

import { ResolvedComponent } from '../../../types/resolved-component.interface';
import { getStyleClasses } from '../../../helpers/style-helpers';

export const generateVehicleCard = (
  resolved: ResolvedComponent,
  variant: 'grid' | 'horizontal' | 'compact' = 'grid'
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
    return `/${dataSource || 'vehicles'}`;
  };

  const apiRoute = getApiRoute();
  const entity = dataSource?.split('.').pop() || 'vehicles';

  if (variant === 'horizontal') {
    return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Loader2 } from 'lucide-react';

interface VehicleCardProps {
  vehicle?: any;
  id?: string;
  make?: string;
  model?: string;
  year?: number;
  price?: number;
  mileage?: number;
  fuelType?: string;
  transmission?: string;
  images?: string[];
  condition?: 'new' | 'used' | 'certified';
  onClick?: () => void;
  onSave?: () => void;
  isSaved?: boolean;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({
  vehicle: propData,
  id: propId,
  make: propMake,
  model: propModel,
  year: propYear,
  price: propPrice,
  mileage: propMileage,
  fuelType: propFuelType,
  transmission: propTransmission,
  images: propImages,
  condition: propCondition,
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

  const vehicle = propData || fetchedData || {};
  const id = propId || vehicle.id;
  const make = propMake || vehicle.make || '';
  const model = propModel || vehicle.model || '';
  const year = propYear || vehicle.year || 0;
  const price = propPrice || vehicle.price || 0;
  const mileage = propMileage || vehicle.mileage || 0;
  const fuelType = propFuelType || vehicle.fuelType || '';
  const transmission = propTransmission || vehicle.transmission || '';
  const images = propImages || vehicle.images || [];
  const condition = propCondition || vehicle.condition || 'used';

  if (isLoading && !propData && !propId) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  const conditionColors = {
    new: 'bg-green-100 text-green-700',
    used: 'bg-gray-100 text-gray-700',
    certified: 'bg-blue-100 text-blue-700',
  };

  return (
    <div
      onClick={onClick}
      className="${styles.card} rounded-xl overflow-hidden cursor-pointer hover:${styles.cardHoverShadow} transition-all flex flex-col md:flex-row"
    >
      <div className="relative w-full md:w-72 h-48 md:h-auto shrink-0">
        <img
          src={images[0] || '/placeholder-car.jpg'}
          alt={\`\${year} \${make} \${model}\`}
          className="w-full h-full object-cover"
        />
        <span className={\`absolute top-3 left-3 px-2 py-1 text-xs font-medium rounded \${conditionColors[condition]}\`}>
          {condition.charAt(0).toUpperCase() + condition.slice(1)}
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); onSave?.(); }}
          className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md"
        >
          <svg className={\`w-5 h-5 \${isSaved ? 'text-red-500 fill-current' : '${styles.textMuted}'}\`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      <div className="flex-1 p-5">
        <p className="${styles.primary} text-xl font-bold">\${price.toLocaleString()}</p>
        <h3 className="${styles.textPrimary} font-semibold mt-1">{year} {make} {model}</h3>

        <div className="flex items-center gap-4 mt-3 ${styles.textSecondary} text-sm">
          <span>{mileage.toLocaleString()} mi</span>
          <span>{transmission}</span>
          <span>{fuelType}</span>
        </div>
      </div>
    </div>
  );
};

export default VehicleCard;
`;
  }

  if (variant === 'compact') {
    return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Loader2 } from 'lucide-react';

interface VehicleCardProps {
  vehicle?: any;
  id?: string;
  make?: string;
  model?: string;
  year?: number;
  price?: number;
  image?: string;
  onClick?: () => void;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({
  vehicle: propData,
  id: propId,
  make: propMake,
  model: propModel,
  year: propYear,
  price: propPrice,
  image: propImage,
  onClick,
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

  const vehicle = propData || fetchedData || {};
  const id = propId || vehicle.id;
  const make = propMake || vehicle.make || '';
  const model = propModel || vehicle.model || '';
  const year = propYear || vehicle.year || 0;
  const price = propPrice || vehicle.price || 0;
  const image = propImage || vehicle.image;

  if (isLoading && !propData && !propId) {
    return (
      <div className="flex items-center justify-center min-h-[80px]">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  return (
    <div
      onClick={onClick}
      className="${styles.card} p-3 rounded-lg cursor-pointer hover:${styles.cardHoverShadow} transition-all flex items-center gap-3"
    >
      <div className="w-16 h-12 rounded overflow-hidden shrink-0">
        <img
          src={image || '/placeholder-car.jpg'}
          alt={\`\${year} \${make} \${model}\`}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="${styles.textPrimary} font-medium truncate">{year} {make} {model}</p>
        <p className="${styles.primary} font-bold">\${price.toLocaleString()}</p>
      </div>
    </div>
  );
};

export default VehicleCard;
`;
  }

  // Default grid variant
  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Loader2 } from 'lucide-react';

interface VehicleCardProps {
  vehicle?: any;
  id?: string;
  make?: string;
  model?: string;
  year?: number;
  trim?: string;
  price?: number;
  mileage?: number;
  fuelType?: string;
  transmission?: string;
  drivetrain?: string;
  exteriorColor?: string;
  interiorColor?: string;
  images?: string[];
  condition?: 'new' | 'used' | 'certified';
  featured?: boolean;
  onClick?: () => void;
  onSave?: () => void;
  isSaved?: boolean;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({
  vehicle: propData,
  id: propId,
  make: propMake,
  model: propModel,
  year: propYear,
  trim: propTrim,
  price: propPrice,
  mileage: propMileage,
  fuelType: propFuelType,
  transmission: propTransmission,
  drivetrain: propDrivetrain,
  exteriorColor: propExteriorColor,
  images: propImages,
  condition: propCondition,
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

  const vehicle = propData || fetchedData || {};
  const id = propId || vehicle.id;
  const make = propMake || vehicle.make || '';
  const model = propModel || vehicle.model || '';
  const year = propYear || vehicle.year || 0;
  const trim = propTrim || vehicle.trim;
  const price = propPrice || vehicle.price || 0;
  const mileage = propMileage || vehicle.mileage || 0;
  const fuelType = propFuelType || vehicle.fuelType || '';
  const transmission = propTransmission || vehicle.transmission || '';
  const drivetrain = propDrivetrain || vehicle.drivetrain;
  const exteriorColor = propExteriorColor || vehicle.exteriorColor;
  const images = propImages || vehicle.images || [];
  const condition = propCondition || vehicle.condition || 'used';
  const featured = propFeatured || vehicle.featured;

  if (isLoading && !propData && !propId) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  const conditionLabels = {
    new: { label: 'New', color: 'bg-green-500 text-white' },
    used: { label: 'Used', color: 'bg-gray-500 text-white' },
    certified: { label: 'CPO', color: 'bg-blue-500 text-white' },
  };

  return (
    <div
      onClick={onClick}
      className="${styles.card} rounded-xl overflow-hidden cursor-pointer hover:${styles.cardHoverShadow} transition-all group"
    >
      <div className="relative h-52">
        <img
          src={images[0] || '/placeholder-car.jpg'}
          alt={\`\${year} \${make} \${model}\`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        <div className="absolute top-3 left-3 flex gap-2">
          <span className={\`px-2 py-1 text-xs font-semibold rounded \${conditionLabels[condition].color}\`}>
            {conditionLabels[condition].label}
          </span>
          {featured && (
            <span className="px-2 py-1 bg-amber-500 text-white text-xs font-semibold rounded">
              Featured
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
            +{images.length - 1} photos
          </div>
        )}
      </div>

      <div className="p-4">
        <p className="${styles.primary} text-xl font-bold">\${price.toLocaleString()}</p>
        <h3 className="${styles.textPrimary} font-semibold mt-1">
          {year} {make} {model}
          {trim && <span className="${styles.textMuted} font-normal"> {trim}</span>}
        </h3>

        <div className="flex items-center gap-2 mt-2 text-sm ${styles.textSecondary}">
          <span>{mileage.toLocaleString()} mi</span>
          <span className="w-1 h-1 rounded-full bg-current opacity-40" />
          <span>{transmission}</span>
          <span className="w-1 h-1 rounded-full bg-current opacity-40" />
          <span>{fuelType}</span>
        </div>

        {(drivetrain || exteriorColor) && (
          <div className="flex items-center gap-2 mt-2 text-sm ${styles.textMuted}">
            {drivetrain && <span>{drivetrain}</span>}
            {exteriorColor && (
              <>
                <span className="w-1 h-1 rounded-full bg-current opacity-40" />
                <span>{exteriorColor}</span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleCard;
`;
};
