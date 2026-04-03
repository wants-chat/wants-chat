import { ResolvedComponent } from '../../../types/resolved-component.interface';

export function generateTravelDestinationsGrid(resolved: ResolvedComponent, variant?: string): string {
  const { title, props, data } = resolved;
  const limit = props?.limit || 8;
  const showSeeMore = props?.showSeeMore !== false;
  const seeMoreRoute = props?.seeMoreRoute || '/destinations';

  // Dynamic API route extraction
  const getApiRoute = () => {
    if (resolved.actions && resolved.actions.length > 0) {
      const fetchAction = resolved.actions.find((a: any) => a.type === 'fetch');
      if (fetchAction?.serverFunction?.route) {
        return fetchAction.serverFunction.route.replace(/^\/api\/v1\//, '/');
      }
    }
    return '/destinations';
  };
  const apiRoute = getApiRoute();

  return `import { useNavigate } from 'react-router-dom';
import { Star, MapPin, ChevronRight, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface TravelDestinationsGridProps {
  data?: any[];
  title?: string;
  variant?: string;
  colorScheme?: string;
  showRating?: boolean;
  limit?: number;
  seeMoreRoute?: string;
  [key: string]: any;
}

export default function TravelDestinationsGrid({ data: propData = [], title, variant, colorScheme, ...rest }: TravelDestinationsGridProps) {
  const navigate = useNavigate();

  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['destinations'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !propData || propData.length === 0,
    retry: 1,
  });

  const destinations = propData && propData.length > 0 ? propData : (fetchedData || []);

  if (isLoading && (!propData || propData.length === 0)) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="px-4 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">{title || '${title || 'Popular Destinations'}'}</h2>
        ${showSeeMore ? `
        <a href="${seeMoreRoute}" className="text-cyan-400 text-sm flex items-center gap-1">
          See all <ChevronRight className="w-4 h-4" />
        </a>
        ` : ''}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {destinations.slice(0, ${limit}).map((destination) => (
          <div
            key={destination.id}
            onClick={() => navigate(\`/destinations/\${destination.id}\`)}
            className="cursor-pointer group"
          >
            <div className="relative aspect-[4/5] rounded-xl overflow-hidden">
              {destination.cover_image ? (
                <img
                  src={destination.cover_image}
                  alt={destination.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                  <MapPin className="w-12 h-12 text-white/50" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              {destination.rating && (
                <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-xl px-2 py-1 rounded-full flex items-center gap-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-white text-xs font-medium">{Number(destination.rating).toFixed(1)}</span>
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-white font-semibold text-base mb-1">{destination.name}</h3>
                <p className="text-gray-300 text-sm flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {destination.country}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}`;
}
