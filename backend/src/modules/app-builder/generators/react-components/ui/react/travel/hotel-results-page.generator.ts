import { AppBlueprint, Page } from '../../../../../interfaces/app-builder.types';

export function generateHotelResultsPage(
  blueprint: AppBlueprint,
  page: Page,
): string {
  return `import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, Star, MapPin, Wifi, Car, Coffee, Dumbbell, Filter, SortAsc, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import BottomNav from '../../components/BottomNav';

interface Hotel {
  id: string;
  name: string;
  description?: string;
  address?: string;
  city?: string;
  country?: string;
  star_rating?: number;
  rating?: number;
  review_count?: number;
  price_per_night?: number;
  currency?: string;
  amenities?: string[];
  cover_image?: string;
  is_featured?: boolean;
}

const amenityIcons: Record<string, any> = {
  wifi: Wifi,
  parking: Car,
  breakfast: Coffee,
  gym: Dumbbell,
};

export default function HotelResultsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { token } = useAuth();
  const [sortBy, setSortBy] = useState<'price' | 'rating' | 'stars'>('rating');
  const [showFilters, setShowFilters] = useState(false);
  const [starFilter, setStarFilter] = useState<number | null>(null);

  const destination = searchParams.get('destination') || '';
  const checkIn = searchParams.get('checkIn') || '';
  const checkOut = searchParams.get('checkOut') || '';

  const { data: hotels = [], isLoading: loading } = useQuery({
    queryKey: ['hotels', 'results', destination],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (destination) params.append('city', destination);
      const response = await api.get<any>(\`/hotels?\${params.toString()}\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
    retry: 1,
  });

  const filteredHotels = hotels.filter((hotel) => {
    if (starFilter && hotel.star_rating !== starFilter) return false;
    return true;
  });

  const sortedHotels = [...filteredHotels].sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return (a.price_per_night || 0) - (b.price_per_night || 0);
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'stars':
        return (b.star_rating || 0) - (a.star_rating || 0);
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pb-24">
      {/* Header */}
      <div className="bg-white/10 border-b border-white/20 backdrop-blur-xl px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-white/5">
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-white">{destination || 'Hotels'}</h1>
            {checkIn && checkOut && (
              <p className="text-gray-400 text-sm">{checkIn} - {checkOut}</p>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 rounded-full bg-white/5"
          >
            <Filter className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Sort options */}
        <div className="flex gap-2">
          {(['rating', 'price', 'stars'] as const).map((option) => (
            <button
              key={option}
              onClick={() => setSortBy(option)}
              className={\`px-3 py-1.5 rounded-full text-sm font-medium transition-all \${
                sortBy === option
                  ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white'
                  : 'bg-white/5 text-gray-400'
              }\`}
            >
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </button>
          ))}
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-3 pt-3 border-t border-white/10">
            <p className="text-gray-400 text-sm mb-2">Star Rating</p>
            <div className="flex gap-2">
              <button
                onClick={() => setStarFilter(null)}
                className={\`px-3 py-1 rounded-full text-sm \${
                  starFilter === null ? 'bg-purple-500 text-white' : 'bg-white/5 text-gray-400'
                }\`}
              >
                All
              </button>
              {[5, 4, 3].map((stars) => (
                <button
                  key={stars}
                  onClick={() => setStarFilter(stars)}
                  className={\`px-3 py-1 rounded-full text-sm flex items-center gap-1 \${
                    starFilter === stars ? 'bg-purple-500 text-white' : 'bg-white/5 text-gray-400'
                  }\`}
                >
                  {stars} <Star className="w-3 h-3 fill-current" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="px-4 py-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-400"></div>
          </div>
        ) : sortedHotels.length === 0 ? (
          <div className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl p-8 text-center">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-400">No hotels found</p>
            <button
              onClick={() => navigate('/hotels/search')}
              className="mt-4 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl"
            >
              Modify Search
            </button>
          </div>
        ) : (
          sortedHotels.map((hotel) => (
            <div
              key={hotel.id}
              onClick={() => navigate(\`/hotels/\${hotel.id}\`)}
              className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform"
            >
              {/* Hotel Image */}
              <div className="relative h-40">
                {hotel.cover_image ? (
                  <img src={hotel.cover_image} alt={hotel.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                    <span className="text-4xl">🏨</span>
                  </div>
                )}
                {hotel.is_featured && (
                  <span className="absolute top-3 left-3 px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs rounded-full">
                    Featured
                  </span>
                )}
                {hotel.star_rating && (
                  <div className="absolute top-3 right-3 flex">
                    {[...Array(hotel.star_rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                )}
              </div>

              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-white font-semibold">{hotel.name}</h3>
                    {(hotel.city || hotel.country) && (
                      <p className="text-gray-400 text-sm flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {[hotel.city, hotel.country].filter(Boolean).join(', ')}
                      </p>
                    )}
                  </div>
                  {hotel.rating && (
                    <div className="flex items-center gap-1 bg-green-500/20 px-2 py-1 rounded-lg">
                      <Star className="w-4 h-4 fill-green-400 text-green-400" />
                      <span className="text-green-400 font-semibold">{Number(hotel.rating).toFixed(1)}</span>
                    </div>
                  )}
                </div>

                {/* Amenities */}
                {hotel.amenities && hotel.amenities.length > 0 && (
                  <div className="flex gap-2 mb-3">
                    {hotel.amenities.slice(0, 4).map((amenity, index) => {
                      const Icon = amenityIcons[amenity.toLowerCase()] || Coffee;
                      return (
                        <div key={index} className="flex items-center gap-1 text-gray-400 text-xs">
                          <Icon className="w-3 h-3" />
                          <span className="capitalize">{amenity}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Price */}
                <div className="flex items-center justify-between pt-3 border-t border-white/10">
                  <div>
                    {hotel.review_count && (
                      <span className="text-gray-400 text-sm">{hotel.review_count} reviews</span>
                    )}
                  </div>
                  {hotel.price_per_night && (
                    <div className="text-right">
                      <span className="text-xl font-bold text-white">
                        {hotel.currency || '$'}{hotel.price_per_night}
                      </span>
                      <span className="text-gray-400 text-sm">/night</span>
                    </div>
                  )}
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
