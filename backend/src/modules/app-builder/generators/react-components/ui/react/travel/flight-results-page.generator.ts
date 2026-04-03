import { AppBlueprint, Page } from '../../../../../interfaces/app-builder.types';

export function generateFlightResultsPage(
  blueprint: AppBlueprint,
  page: Page,
): string {
  return `import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, Plane, Clock, ArrowRight, Filter, SortAsc, Luggage, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import BottomNav from '../../components/BottomNav';

interface Flight {
  id: string;
  flight_number: string;
  airline: string;
  airline_logo?: string;
  departure_airport: string;
  departure_city: string;
  arrival_airport: string;
  arrival_city: string;
  departure_time: string;
  arrival_time: string;
  duration_minutes?: number;
  stops: number;
  stop_details?: any[];
  cabin_class: string;
  price: number;
  currency?: string;
  baggage_allowance?: any;
  is_refundable?: boolean;
}

export default function FlightResultsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { token } = useAuth();
  const [sortBy, setSortBy] = useState<'price' | 'duration' | 'departure'>('price');

  const from = searchParams.get('from') || '';
  const to = searchParams.get('to') || '';
  const date = searchParams.get('date') || '';

  const { data: flights = [], isLoading: loading } = useQuery({
    queryKey: ['flights', from, to, date],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (from) params.append('departure_city', from);
      if (to) params.append('arrival_city', to);

      const response = await api.get<any>(\`/flights?\${params.toString()}\`, { requireAuth: !!token });
      return Array.isArray(response) ? response : (response?.data || []);
    },
    retry: 1,
  });

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return \`\${hours}h \${mins}m\`;
  };

  const sortedFlights = [...flights].sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return a.price - b.price;
      case 'duration':
        return (a.duration_minutes || 0) - (b.duration_minutes || 0);
      case 'departure':
        return new Date(a.departure_time).getTime() - new Date(b.departure_time).getTime();
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pb-24">
      {/* Header */}
      <div className="bg-white/10 border-b border-white/20 backdrop-blur-xl px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-white/5">
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-white">
              {from} → {to}
            </h1>
            {date && <p className="text-gray-400 text-sm">{date}</p>}
          </div>
        </div>

        {/* Sort options */}
        <div className="flex gap-2">
          {(['price', 'duration', 'departure'] as const).map((option) => (
            <button
              key={option}
              onClick={() => setSortBy(option)}
              className={\`px-3 py-1.5 rounded-full text-sm font-medium transition-all \${
                sortBy === option
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                  : 'bg-white/5 text-gray-400'
              }\`}
            >
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="px-4 py-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-blue-400" />
          </div>
        ) : sortedFlights.length === 0 ? (
          <div className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl p-8 text-center">
            <Plane className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-400">No flights found</p>
            <button
              onClick={() => navigate('/flights/search')}
              className="mt-4 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl"
            >
              Modify Search
            </button>
          </div>
        ) : (
          sortedFlights.map((flight) => (
            <div
              key={flight.id}
              onClick={() => navigate(\`/flights/\${flight.id}\`)}
              className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl p-4 cursor-pointer hover:scale-[1.02] transition-transform"
            >
              {/* Airline */}
              <div className="flex items-center gap-2 mb-3">
                {flight.airline_logo ? (
                  <img src={flight.airline_logo} alt={flight.airline} className="w-8 h-8 rounded" />
                ) : (
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center">
                    <Plane className="w-4 h-4 text-white" />
                  </div>
                )}
                <div>
                  <p className="text-white font-medium">{flight.airline}</p>
                  <p className="text-gray-400 text-xs">{flight.flight_number}</p>
                </div>
                {flight.is_refundable && (
                  <span className="ml-auto px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                    Refundable
                  </span>
                )}
              </div>

              {/* Flight Times */}
              <div className="flex items-center justify-between mb-3">
                <div className="text-center">
                  <p className="text-xl font-bold text-white">{formatTime(flight.departure_time)}</p>
                  <p className="text-gray-400 text-sm">{flight.departure_airport}</p>
                </div>

                <div className="flex-1 px-4">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 border-t border-white/20 border-dashed"></div>
                    <div className="flex flex-col items-center">
                      <Plane className="w-4 h-4 text-gray-400 rotate-90" />
                      {flight.duration_minutes && (
                        <span className="text-gray-400 text-xs">{formatDuration(flight.duration_minutes)}</span>
                      )}
                    </div>
                    <div className="flex-1 border-t border-white/20 border-dashed"></div>
                  </div>
                  <p className="text-gray-400 text-xs text-center mt-1">
                    {flight.stops === 0 ? 'Direct' : \`\${flight.stops} stop\${flight.stops > 1 ? 's' : ''}\`}
                  </p>
                </div>

                <div className="text-center">
                  <p className="text-xl font-bold text-white">{formatTime(flight.arrival_time)}</p>
                  <p className="text-gray-400 text-sm">{flight.arrival_airport}</p>
                </div>
              </div>

              {/* Price & Class */}
              <div className="flex items-center justify-between pt-3 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <span className="bg-white/5 px-2 py-1 rounded text-xs text-white capitalize">
                    {flight.cabin_class.replace('_', ' ')}
                  </span>
                  {flight.baggage_allowance && (
                    <span className="flex items-center gap-1 text-gray-400 text-xs">
                      <Luggage className="w-3 h-3" />
                      Baggage included
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold text-white">
                    {flight.currency || '$'}{flight.price}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <BottomNav />
    </div>
  );
}
`;
}
