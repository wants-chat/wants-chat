import { ResolvedComponent } from '../../../types/resolved-component.interface';

export function generateTravelFlightsGrid(resolved: ResolvedComponent, variant?: string): string {
  const { title, props, data } = resolved;
  const limit = props?.limit || 6;
  const showSeeMore = props?.showSeeMore !== false;
  const seeMoreRoute = props?.seeMoreRoute || '/flights/search';
  const layout = props?.layout || 'list';

  // Dynamic API route extraction
  const getApiRoute = () => {
    if (resolved.actions && resolved.actions.length > 0) {
      const fetchAction = resolved.actions.find((a: any) => a.type === 'fetch');
      if (fetchAction?.serverFunction?.route) {
        return fetchAction.serverFunction.route.replace(/^\/api\/v1\//, '/');
      }
    }
    return '/flights';
  };
  const apiRoute = getApiRoute();

  if (layout === 'grid') {
    return `import { useNavigate } from 'react-router-dom';
import { Plane, ChevronRight, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface TravelFlightsGridProps {
  data?: any[];
  title?: string;
  variant?: string;
  colorScheme?: string;
  layout?: string;
  showSeeMore?: boolean;
  limit?: number;
  seeMoreRoute?: string;
  [key: string]: any;
}

export default function TravelFlightsGrid({ data: propData = [], title, variant, colorScheme, ...rest }: TravelFlightsGridProps) {
  const navigate = useNavigate();

  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['flights'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !propData || propData.length === 0,
    retry: 1,
  });

  const flights = propData && propData.length > 0 ? propData : (fetchedData || []);

  if (isLoading && (!propData || propData.length === 0)) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div className="px-4 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900">{title || '${title || 'Available Flights'}'}</h2>
        ${showSeeMore ? `
        <a href="${seeMoreRoute}" className="text-cyan-600 text-sm flex items-center gap-1 hover:underline">
          Search flights <ChevronRight className="w-4 h-4" />
        </a>
        ` : ''}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {flights.slice(0, ${limit}).map((flight) => (
          <div
            key={flight.id}
            onClick={() => navigate(\`/flights/\${flight.id}\`)}
            className="bg-white border border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
          >
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3">
                {flight.airline_logo ? (
                  <img src={flight.airline_logo} alt={flight.airline} className="w-8 h-8 rounded" />
                ) : (
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center">
                    <Plane className="w-4 h-4 text-white" />
                  </div>
                )}
                <div>
                  <p className="text-gray-900 font-medium text-sm">{flight.airline}</p>
                  <p className="text-gray-500 text-xs">{flight.flight_number}</p>
                </div>
              </div>

              <div className="flex items-center justify-between mb-3">
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900">
                    {new Date(flight.departure_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                  </p>
                  <p className="text-gray-500 text-xs">{flight.departure_airport}</p>
                </div>

                <div className="flex-1 px-3">
                  <div className="flex items-center gap-1">
                    <div className="flex-1 border-t border-gray-200 border-dashed"></div>
                    <Plane className="w-4 h-4 text-gray-400 rotate-90" />
                    <div className="flex-1 border-t border-gray-200 border-dashed"></div>
                  </div>
                  <p className="text-gray-400 text-xs text-center mt-1">
                    {flight.stops === 0 ? 'Direct' : \`\${flight.stops} stop\${flight.stops > 1 ? 's' : ''}\`}
                  </p>
                </div>

                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900">
                    {new Date(flight.arrival_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                  </p>
                  <p className="text-gray-500 text-xs">{flight.arrival_airport}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <span className="bg-gray-100 px-2 py-1 rounded text-xs text-gray-600 capitalize">
                  {(flight.cabin_class || 'economy').replace('_', ' ')}
                </span>
                <p className="font-bold text-lg text-gray-900">
                  {flight.currency || '$'}{flight.price}
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

  // Default list layout (dark theme for mobile)
  return `import { useNavigate } from 'react-router-dom';
import { Plane, ChevronRight, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface TravelFlightsGridProps {
  data?: any[];
  title?: string;
  variant?: string;
  colorScheme?: string;
  layout?: string;
  showSeeMore?: boolean;
  limit?: number;
  seeMoreRoute?: string;
  [key: string]: any;
}

export default function TravelFlightsGrid({ data: propData = [], title, variant, colorScheme, ...rest }: TravelFlightsGridProps) {
  const navigate = useNavigate();

  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['flights'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !propData || propData.length === 0,
    retry: 1,
  });

  const flights = propData && propData.length > 0 ? propData : (fetchedData || []);

  if (isLoading && (!propData || propData.length === 0)) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div className="px-4 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">{title || '${title || 'Featured Flights'}'}</h2>
        ${showSeeMore ? `
        <a href="${seeMoreRoute}" className="text-cyan-400 text-sm flex items-center gap-1">
          Search <ChevronRight className="w-4 h-4" />
        </a>
        ` : ''}
      </div>

      <div className="space-y-3">
        {flights.slice(0, ${limit}).map((flight) => (
          <div
            key={flight.id}
            onClick={() => navigate(\`/flights/\${flight.id}\`)}
            className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl p-4 cursor-pointer hover:scale-[1.02] transition-transform"
          >
            <div className="flex items-center gap-2 mb-3">
              {flight.airline_logo ? (
                <img src={flight.airline_logo} alt={flight.airline} className="w-8 h-8 rounded" />
              ) : (
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center">
                  <Plane className="w-4 h-4 text-white" />
                </div>
              )}
              <div>
                <p className="text-white font-medium text-sm">{flight.airline}</p>
                <p className="text-gray-400 text-xs">{flight.flight_number}</p>
              </div>
              {flight.is_refundable && (
                <span className="ml-auto px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                  Refundable
                </span>
              )}
            </div>

            <div className="flex items-center justify-between mb-3">
              <div className="text-center">
                <p className="text-lg font-bold text-white">
                  {new Date(flight.departure_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                </p>
                <p className="text-gray-400 text-xs">{flight.departure_airport}</p>
              </div>

              <div className="flex-1 px-4">
                <div className="flex items-center gap-2">
                  <div className="flex-1 border-t border-white/20 border-dashed"></div>
                  <div className="flex flex-col items-center">
                    <Plane className="w-4 h-4 text-gray-400 rotate-90" />
                    {flight.duration_minutes && (
                      <span className="text-gray-400 text-xs">
                        {Math.floor(flight.duration_minutes / 60)}h {flight.duration_minutes % 60}m
                      </span>
                    )}
                  </div>
                  <div className="flex-1 border-t border-white/20 border-dashed"></div>
                </div>
                <p className="text-gray-400 text-xs text-center mt-1">
                  {flight.stops === 0 ? 'Direct' : \`\${flight.stops} stop\${flight.stops > 1 ? 's' : ''}\`}
                </p>
              </div>

              <div className="text-center">
                <p className="text-lg font-bold text-white">
                  {new Date(flight.arrival_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                </p>
                <p className="text-gray-400 text-xs">{flight.arrival_airport}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <div className="flex items-center gap-2">
                <span className="bg-white/5 px-2 py-1 rounded text-xs text-white capitalize">
                  {(flight.cabin_class || 'economy').replace('_', ' ')}
                </span>
                <span className="text-gray-400 text-xs">
                  {flight.departure_city} → {flight.arrival_city}
                </span>
              </div>
              <p className="font-bold text-lg text-white">
                {flight.currency || '$'}{flight.price}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}`;
}
