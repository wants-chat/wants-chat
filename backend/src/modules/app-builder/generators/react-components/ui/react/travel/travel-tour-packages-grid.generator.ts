import { ResolvedComponent } from '../../../types/resolved-component.interface';

export function generateTravelTourPackagesGrid(resolved: ResolvedComponent, variant?: string): string {
  const { title, props, data } = resolved;
  const limit = props?.limit || 8;
  const showSeeMore = props?.showSeeMore !== false;
  const seeMoreRoute = props?.seeMoreRoute || '/tours';
  const layout = props?.layout || 'list';

  // Dynamic API route extraction
  const getApiRoute = () => {
    if (resolved.actions && resolved.actions.length > 0) {
      const fetchAction = resolved.actions.find((a: any) => a.type === 'fetch');
      if (fetchAction?.serverFunction?.route) {
        return fetchAction.serverFunction.route.replace(/^\/api\/v1\//, '/');
      }
    }
    return '/tour-packages';
  };
  const apiRoute = getApiRoute();

  if (layout === 'grid') {
    return `import { useNavigate } from 'react-router-dom';
import { Star, MapPin, Calendar, Users, ChevronRight, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface TravelTourPackagesGridProps {
  data?: any[];
  title?: string;
  variant?: string;
  colorScheme?: string;
  showPrice?: boolean;
  showRating?: boolean;
  detailRoute?: string;
  clickable?: boolean;
  layout?: string;
  showSeeMore?: boolean;
  limit?: number;
  seeMoreRoute?: string;
  [key: string]: any;
}

export default function TravelTourPackagesGrid({ data: propData = [], title, variant, colorScheme, ...rest }: TravelTourPackagesGridProps) {
  const navigate = useNavigate();

  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['tour-packages'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !propData || propData.length === 0,
    retry: 1,
  });

  const tour_packages = propData && propData.length > 0 ? propData : (fetchedData || []);

  if (isLoading && (!propData || propData.length === 0)) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-orange-400" />
      </div>
    );
  }

  return (
    <div className="px-4 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900">{title || '${title || 'Tour Packages'}'}</h2>
        ${showSeeMore ? `
        <a href="${seeMoreRoute}" className="text-cyan-600 text-sm flex items-center gap-1 hover:underline">
          See all <ChevronRight className="w-4 h-4" />
        </a>
        ` : ''}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tour_packages.slice(0, ${limit}).map((pkg) => (
          <div
            key={pkg.id}
            onClick={() => navigate(\`/tours/\${pkg.id}\`)}
            className="bg-white border border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
          >
            <div className="relative h-40">
              {pkg.cover_image ? (
                <img
                  src={pkg.cover_image}
                  alt={pkg.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                  <MapPin className="w-10 h-10 text-white/50" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              {pkg.tour_type && (
                <span className="absolute top-2 left-2 bg-white/20 backdrop-blur-xl px-2 py-1 rounded-full text-white text-xs capitalize">
                  {pkg.tour_type}
                </span>
              )}
              {pkg.is_featured && (
                <span className="absolute top-2 right-2 bg-yellow-500 px-2 py-1 rounded-full text-white text-xs font-medium">
                  Featured
                </span>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 line-clamp-1">{pkg.name}</h3>
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                {pkg.duration_days && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {pkg.duration_days} days
                  </span>
                )}
                {pkg.group_size_max && (
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    Up to {pkg.group_size_max}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between mt-3">
                {pkg.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{Number(pkg.rating).toFixed(1)}</span>
                  </div>
                )}
                {pkg.price && (
                  <p className="font-bold text-lg text-gray-900">
                    {pkg.currency || '$'}{pkg.price}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}`;
  }

  // Default list layout
  return `import { useNavigate } from 'react-router-dom';
import { Star, MapPin, Calendar, Users, ChevronRight, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface TravelTourPackagesGridProps {
  data?: any[];
  title?: string;
  variant?: string;
  colorScheme?: string;
  showPrice?: boolean;
  showRating?: boolean;
  detailRoute?: string;
  clickable?: boolean;
  layout?: string;
  showSeeMore?: boolean;
  limit?: number;
  seeMoreRoute?: string;
  [key: string]: any;
}

export default function TravelTourPackagesGrid({ data: propData = [], title, variant, colorScheme, ...rest }: TravelTourPackagesGridProps) {
  const navigate = useNavigate();

  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['tour-packages'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !propData || propData.length === 0,
    retry: 1,
  });

  const tour_packages = propData && propData.length > 0 ? propData : (fetchedData || []);

  if (isLoading && (!propData || propData.length === 0)) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-orange-400" />
      </div>
    );
  }

  return (
    <div className="px-4 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">{title || '${title || 'Tour Packages'}'}</h2>
        ${showSeeMore ? `
        <a href="${seeMoreRoute}" className="text-cyan-400 text-sm flex items-center gap-1">
          See all <ChevronRight className="w-4 h-4" />
        </a>
        ` : ''}
      </div>

      <div className="space-y-4">
        {tour_packages.slice(0, ${limit}).map((pkg) => (
          <div
            key={pkg.id}
            onClick={() => navigate(\`/tours/\${pkg.id}\`)}
            className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform"
          >
            <div className="flex">
              <div className="w-28 h-24 flex-shrink-0">
                {pkg.cover_image ? (
                  <img
                    src={pkg.cover_image}
                    alt={pkg.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                    <MapPin className="w-8 h-8 text-white/50" />
                  </div>
                )}
              </div>
              <div className="flex-1 p-3">
                {pkg.tour_type && (
                  <span className="text-cyan-400 text-xs capitalize">{pkg.tour_type}</span>
                )}
                <h4 className="text-white font-medium text-sm line-clamp-1">{pkg.name}</h4>
                <div className="flex items-center gap-2 mt-1 text-gray-400 text-xs">
                  {pkg.duration_days && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {pkg.duration_days} days
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between mt-2">
                  {pkg.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-white text-xs">{Number(pkg.rating).toFixed(1)}</span>
                    </div>
                  )}
                  {pkg.price && (
                    <p className="text-white font-semibold text-sm">
                      {pkg.currency || '$'}{pkg.price}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}`;
}
