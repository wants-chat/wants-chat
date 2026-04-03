import { ResolvedComponent } from '../../../types/resolved-component.interface';

export function generateTravelHotelsGrid(resolved: ResolvedComponent, variant?: string): string {
  const { title, props, data } = resolved;
  const limit = props?.limit || 8;
  const showSeeMore = props?.showSeeMore !== false;
  const seeMoreRoute = props?.seeMoreRoute || '/hotels';
  const layout = props?.layout || 'list';

  // Dynamic API route extraction
  const getApiRoute = () => {
    if (resolved.actions && resolved.actions.length > 0) {
      const fetchAction = resolved.actions.find((a: any) => a.type === 'fetch');
      if (fetchAction?.serverFunction?.route) {
        return fetchAction.serverFunction.route.replace(/^\/api\/v1\//, '/');
      }
    }
    return '/hotels';
  };
  const apiRoute = getApiRoute();

  if (layout === 'grid') {
    return `import { useNavigate } from 'react-router-dom';
import { Star, MapPin, Building2, ChevronRight, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface TravelHotelsGridProps {
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

export default function TravelHotelsGrid({ data: propData = [], title, variant, colorScheme, ...rest }: TravelHotelsGridProps) {
  const navigate = useNavigate();

  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['hotels'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !propData || propData.length === 0,
    retry: 1,
  });

  const hotels = propData && propData.length > 0 ? propData : (fetchedData || []);

  if (isLoading && (!propData || propData.length === 0)) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    );
  }

  return (
    <div className="px-4 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900">{title || '${title || 'Hotels'}'}</h2>
        ${showSeeMore ? `
        <a href="${seeMoreRoute}" className="text-cyan-600 text-sm flex items-center gap-1 hover:underline">
          See all <ChevronRight className="w-4 h-4" />
        </a>
        ` : ''}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {hotels.slice(0, ${limit}).map((hotel) => (
          <div
            key={hotel.id}
            onClick={() => navigate(\`/hotels/\${hotel.id}\`)}
            className="bg-white border border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
          >
            <div className="relative h-40">
              {hotel.cover_image ? (
                <img
                  src={hotel.cover_image}
                  alt={hotel.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                  <Building2 className="w-10 h-10 text-white/50" />
                </div>
              )}
              {hotel.star_rating && (
                <div className="absolute top-2 left-2 bg-white/90 backdrop-blur px-2 py-1 rounded-full flex items-center gap-1">
                  {Array.from({ length: hotel.star_rating }, (_, i) => (
                    <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 line-clamp-1">{hotel.name}</h3>
              <p className="text-gray-500 text-sm mt-1 flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {hotel.city}{hotel.country ? \`, \${hotel.country}\` : ''}
              </p>
              <div className="flex items-center justify-between mt-3">
                {hotel.amenities && (
                  <span className="text-xs text-gray-500">
                    {Array.isArray(hotel.amenities) ? hotel.amenities.slice(0, 2).join(', ') : ''}
                  </span>
                )}
                {hotel.price_per_night && (
                  <p className="font-bold text-lg text-gray-900">
                    {hotel.currency || '$'}{hotel.price_per_night}
                    <span className="text-gray-400 text-xs font-normal">/night</span>
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

  // Default list layout (dark theme for mobile)
  return `import { useNavigate } from 'react-router-dom';
import { Star, MapPin, Building2, ChevronRight, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface TravelHotelsGridProps {
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

export default function TravelHotelsGrid({ data: propData = [], title, variant, colorScheme, ...rest }: TravelHotelsGridProps) {
  const navigate = useNavigate();

  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['hotels'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !propData || propData.length === 0,
    retry: 1,
  });

  const hotels = propData && propData.length > 0 ? propData : (fetchedData || []);

  if (isLoading && (!propData || propData.length === 0)) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    );
  }

  return (
    <div className="px-4 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">{title || '${title || 'Featured Hotels'}'}</h2>
        ${showSeeMore ? `
        <a href="${seeMoreRoute}" className="text-cyan-400 text-sm flex items-center gap-1">
          See all <ChevronRight className="w-4 h-4" />
        </a>
        ` : ''}
      </div>

      <div className="space-y-4">
        {hotels.slice(0, ${limit}).map((hotel) => (
          <div
            key={hotel.id}
            onClick={() => navigate(\`/hotels/\${hotel.id}\`)}
            className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform"
          >
            <div className="flex">
              <div className="w-28 h-24 flex-shrink-0">
                {hotel.cover_image ? (
                  <img
                    src={hotel.cover_image}
                    alt={hotel.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                    <Building2 className="w-8 h-8 text-white/50" />
                  </div>
                )}
              </div>
              <div className="flex-1 p-3">
                <div className="flex items-center gap-1 mb-1">
                  {hotel.star_rating && Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} className={\`w-3 h-3 \${i < hotel.star_rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'}\`} />
                  ))}
                </div>
                <h4 className="text-white font-medium text-sm line-clamp-1">{hotel.name}</h4>
                <p className="text-gray-400 text-xs mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {hotel.city}{hotel.country ? \`, \${hotel.country}\` : ''}
                </p>
                <div className="flex items-center justify-end mt-2">
                  {hotel.price_per_night && (
                    <p className="text-white font-semibold text-sm">
                      {hotel.currency || '$'}{hotel.price_per_night}
                      <span className="text-gray-400 text-xs font-normal">/night</span>
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
