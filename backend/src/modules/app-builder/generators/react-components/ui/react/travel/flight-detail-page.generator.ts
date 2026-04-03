import { AppBlueprint, Page } from '../../../../../interfaces/app-builder.types';

export function generateFlightDetailPage(
  blueprint: AppBlueprint,
  page: Page,
): string {
  return `import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Plane, Clock, MapPin, Luggage, Wifi, Utensils, Tv, Zap, Check, AlertCircle, Loader2 } from 'lucide-react';
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
  departure_country?: string;
  arrival_airport: string;
  arrival_city: string;
  arrival_country?: string;
  departure_time: string;
  arrival_time: string;
  duration_minutes?: number;
  stops: number;
  stop_details?: Array<{
    airport: string;
    city: string;
    duration_minutes: number;
  }>;
  aircraft?: string;
  cabin_class: string;
  price: number;
  currency?: string;
  baggage_allowance?: {
    cabin?: string;
    checked?: string;
  };
  amenities?: string[];
  available_seats?: number;
  is_refundable?: boolean;
}

const amenityIcons: Record<string, any> = {
  wifi: Wifi,
  meal: Utensils,
  entertainment: Tv,
  power: Zap,
};

export default function FlightDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [passengers, setPassengers] = useState(1);

  const { data: flight, isLoading: loading } = useQuery({
    queryKey: ['flight', id],
    queryFn: async () => {
      const response = await api.get<any>(\`/flights/\${id}\`, { requireAuth: !!token });
      return response?.data || response;
    },
    enabled: !!id,
    retry: 1,
  });

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return \`\${hours}h \${mins}m\`;
  };

  const handleBook = () => {
    navigate(\`/booking/flight?flightId=\${id}&passengers=\${passengers}\`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-400" />
      </div>
    );
  }

  if (!flight) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <p className="text-gray-400">Flight not found</p>
      </div>
    );
  }

  const totalPrice = flight.price * passengers;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pb-32">
      {/* Header */}
      <div className="bg-white/10 border-b border-white/20 backdrop-blur-xl px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-white/5">
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-white">Flight Details</h1>
            <p className="text-gray-400 text-sm">{flight.flight_number}</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Airline Info */}
        <div className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl p-4">
          <div className="flex items-center gap-3 mb-4">
            {flight.airline_logo ? (
              <img src={flight.airline_logo} alt={flight.airline} className="w-12 h-12 rounded-lg" />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Plane className="w-6 h-6 text-white" />
              </div>
            )}
            <div className="flex-1">
              <h2 className="text-white font-semibold">{flight.airline}</h2>
              <p className="text-gray-400 text-sm">{flight.flight_number} • {flight.aircraft || 'Aircraft'}</p>
            </div>
            <div className="text-right">
              <span className="px-2 py-1 bg-white/5 rounded-lg text-white text-sm capitalize">
                {flight.cabin_class.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Flight Route */}
          <div className="flex items-center justify-between py-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{formatTime(flight.departure_time)}</p>
              <p className="text-white font-medium">{flight.departure_airport}</p>
              <p className="text-gray-400 text-sm">{flight.departure_city}</p>
              <p className="text-gray-500 text-xs">{formatDate(flight.departure_time)}</p>
            </div>

            <div className="flex-1 px-4">
              <div className="flex flex-col items-center">
                <span className="text-gray-400 text-sm mb-2">{formatDuration(flight.duration_minutes)}</span>
                <div className="flex items-center w-full">
                  <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                  <div className="flex-1 border-t border-dashed border-white/30 mx-2"></div>
                  <Plane className="w-5 h-5 text-blue-400 rotate-90" />
                  <div className="flex-1 border-t border-dashed border-white/30 mx-2"></div>
                  <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                </div>
                <span className="text-gray-400 text-xs mt-2">
                  {flight.stops === 0 ? 'Direct Flight' : \`\${flight.stops} Stop\${flight.stops > 1 ? 's' : ''}\`}
                </span>
              </div>
            </div>

            <div className="text-center">
              <p className="text-2xl font-bold text-white">{formatTime(flight.arrival_time)}</p>
              <p className="text-white font-medium">{flight.arrival_airport}</p>
              <p className="text-gray-400 text-sm">{flight.arrival_city}</p>
              <p className="text-gray-500 text-xs">{formatDate(flight.arrival_time)}</p>
            </div>
          </div>

          {/* Stops */}
          {flight.stop_details && flight.stop_details.length > 0 && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <h3 className="text-white font-medium mb-2">Layovers</h3>
              {flight.stop_details.map((stop, index) => (
                <div key={index} className="flex items-center gap-2 py-2 text-gray-400 text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>{stop.city} ({stop.airport})</span>
                  <span className="ml-auto">{formatDuration(stop.duration_minutes)} layover</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Baggage */}
        {flight.baggage_allowance && (
          <div className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl p-4">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Luggage className="w-5 h-5" />
              Baggage Allowance
            </h3>
            <div className="space-y-2">
              {flight.baggage_allowance.cabin && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Cabin Baggage</span>
                  <span className="text-white">{flight.baggage_allowance.cabin}</span>
                </div>
              )}
              {flight.baggage_allowance.checked && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Checked Baggage</span>
                  <span className="text-white">{flight.baggage_allowance.checked}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Amenities */}
        {flight.amenities && flight.amenities.length > 0 && (
          <div className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl p-4">
            <h3 className="text-white font-semibold mb-3">Amenities</h3>
            <div className="grid grid-cols-2 gap-3">
              {flight.amenities.map((amenity, index) => {
                const Icon = amenityIcons[amenity.toLowerCase()] || Check;
                return (
                  <div key={index} className="flex items-center gap-2 text-gray-300">
                    <Icon className="w-4 h-4 text-green-400" />
                    <span className="capitalize text-sm">{amenity}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Policies */}
        <div className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl p-4">
          <h3 className="text-white font-semibold mb-3">Fare Rules</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {flight.is_refundable ? (
                <>
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 text-sm">Refundable</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-yellow-400" />
                  <span className="text-yellow-400 text-sm">Non-refundable</span>
                </>
              )}
            </div>
            {flight.available_seats && (
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-orange-400" />
                <span className="text-orange-400 text-sm">Only {flight.available_seats} seats left</span>
              </div>
            )}
          </div>
        </div>

        {/* Passengers Selection */}
        <div className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl p-4">
          <h3 className="text-white font-semibold mb-3">Passengers</h3>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Number of passengers</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setPassengers(Math.max(1, passengers - 1))}
                className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center"
              >
                -
              </button>
              <span className="text-white font-semibold w-8 text-center">{passengers}</span>
              <button
                onClick={() => setPassengers(Math.min(9, passengers + 1))}
                className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Book Bar */}
      <div className="fixed bottom-16 left-0 right-0 bg-white/10 border-t border-white/20 backdrop-blur-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">{passengers} passenger{passengers > 1 ? 's' : ''}</p>
            <p className="text-2xl font-bold text-white">
              {flight.currency || '$'}{totalPrice.toLocaleString()}
            </p>
          </div>
          <button
            onClick={handleBook}
            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold"
          >
            Book Now
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
`;
}
