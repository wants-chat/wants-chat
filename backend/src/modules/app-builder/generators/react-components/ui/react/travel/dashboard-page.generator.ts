import { AppBlueprint, Page } from '../../../../../interfaces/app-builder.types';

export function generateTravelDashboardPage(
  blueprint: AppBlueprint,
  page: Page,
): string {
  return `import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Star, ChevronRight, Building2, Plane, Calendar, Heart, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import BottomNav from '../../components/BottomNav';

interface Destination {
  id: string;
  name: string;
  country: string;
  cover_image?: string;
  rating?: number;
  tags?: string[];
}

interface Hotel {
  id: string;
  name: string;
  city?: string;
  country?: string;
  cover_image?: string;
  star_rating?: number;
  rating?: number;
  price_per_night?: number;
  currency?: string;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: destinations = [], isLoading: loadingDestinations } = useQuery({
    queryKey: ['destinations', 'dashboard'],
    queryFn: async () => {
      const response = await api.get<any>('/destinations?limit=8&orderBy=rating&order=desc');
      return Array.isArray(response) ? response : (response?.data || []);
    },
    retry: 1,
  });

  const { data: hotels = [], isLoading: loadingHotels } = useQuery({
    queryKey: ['hotels', 'dashboard'],
    queryFn: async () => {
      const response = await api.get<any>('/hotels?limit=8&orderBy=rating&order=desc');
      return Array.isArray(response) ? response : (response?.data || []);
    },
    retry: 1,
  });

  const loading = loadingDestinations || loadingHotels;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(\`/destinations?search=\${encodeURIComponent(searchQuery)}\`);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={\`w-3 h-3 \${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'}\`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pb-24">
      {/* Hero Section */}
      <div className="relative h-80 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/30 via-blue-600/30 to-purple-600/30" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800')] bg-cover bg-center opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />

        <div className="relative h-full flex flex-col justify-end p-6">
          <div className="mb-4">
            <p className="text-cyan-400 text-sm font-medium mb-1">
              {user ? \`Welcome back, \${user.name || 'Traveler'}!\` : 'Welcome!'}
            </p>
            <h1 className="text-3xl font-bold text-white mb-2">
              Explore the World
            </h1>
            <p className="text-gray-300 text-sm">
              Find your next adventure destination
            </p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="relative">
            <div className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-2xl p-1">
              <div className="flex items-center gap-2 px-4 py-3">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search destinations, hotels..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none"
                />
                <button
                  type="submit"
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-2 rounded-xl font-medium"
                >
                  Search
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 -mt-2 relative z-10">
        <div className="grid grid-cols-4 gap-3">
          <button
            onClick={() => navigate('/hotels/search')}
            className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl p-3 text-center"
          >
            <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Building2 className="w-5 h-5 text-purple-400" />
            </div>
            <span className="text-white text-xs">Hotels</span>
          </button>
          <button
            onClick={() => navigate('/flights/search')}
            className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl p-3 text-center"
          >
            <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Plane className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-white text-xs">Flights</span>
          </button>
          <button
            onClick={() => navigate('/trips')}
            className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl p-3 text-center"
          >
            <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Calendar className="w-5 h-5 text-green-400" />
            </div>
            <span className="text-white text-xs">My Trips</span>
          </button>
          <button
            onClick={() => navigate('/saved')}
            className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl p-3 text-center"
          >
            <div className="w-10 h-10 bg-pink-500/20 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Heart className="w-5 h-5 text-pink-400" />
            </div>
            <span className="text-white text-xs">Saved</span>
          </button>
        </div>
      </div>

      {/* Popular Destinations */}
      <div className="px-4 mt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Popular Destinations</h2>
          <button
            onClick={() => navigate('/destinations')}
            className="text-cyan-400 text-sm flex items-center gap-1"
          >
            See all <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-40 flex-shrink-0 animate-pulse">
                <div className="h-48 bg-white/10 rounded-xl mb-2" />
                <div className="h-4 bg-white/10 rounded w-3/4 mb-1" />
                <div className="h-3 bg-white/10 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : destinations.length === 0 ? (
          <div className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl p-8 text-center">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-400">No destinations found</p>
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
            {destinations.map((destination) => (
              <div
                key={destination.id}
                onClick={() => navigate(\`/destinations/\${destination.id}\`)}
                className="w-40 flex-shrink-0 cursor-pointer"
              >
                <div className="relative h-48 rounded-xl overflow-hidden mb-2">
                  {destination.cover_image ? (
                    <img
                      src={destination.cover_image}
                      alt={destination.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                      <MapPin className="w-10 h-10 text-white/50" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  {destination.rating && (
                    <div className="absolute top-2 right-2 bg-white/10 backdrop-blur-xl px-2 py-1 rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-white text-xs">{Number(destination.rating).toFixed(1)}</span>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h3 className="text-white font-semibold text-sm">{destination.name}</h3>
                    <p className="text-gray-300 text-xs">{destination.country}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Featured Hotels */}
      <div className="px-4 mt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Featured Hotels</h2>
          <button
            onClick={() => navigate('/hotels/search')}
            className="text-cyan-400 text-sm flex items-center gap-1"
          >
            See all <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {hotels.length === 0 ? (
          <div className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl p-8 text-center">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-400">No hotels found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {hotels.slice(0, 4).map((hotel) => (
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
                      {hotel.star_rating && renderStars(hotel.star_rating)}
                    </div>
                    <h4 className="text-white font-medium text-sm line-clamp-1">{hotel.name}</h4>
                    <p className="text-gray-400 text-xs mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {hotel.city}{hotel.country ? \`, \${hotel.country}\` : ''}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      {hotel.rating && (
                        <div className="flex items-center gap-1">
                          <span className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded">
                            {Number(hotel.rating).toFixed(1)}
                          </span>
                        </div>
                      )}
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

            {hotels.length > 4 && (
              <button
                onClick={() => navigate('/hotels/search')}
                className="w-full py-3 bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl text-cyan-400 font-medium"
              >
                View all {hotels.length} hotels
              </button>
            )}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
`;
}
