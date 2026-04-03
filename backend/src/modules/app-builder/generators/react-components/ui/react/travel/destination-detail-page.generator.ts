import { AppBlueprint, Page } from '../../../../../interfaces/app-builder.types';

export function generateDestinationDetailPage(
  blueprint: AppBlueprint,
  page: Page,
): string {
  return `import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, MapPin, Globe, Clock, DollarSign, Languages, Heart, Share2, Star, Thermometer, Building2, Compass, Map, Wifi, Car, Coffee, Utensils, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import BottomNav from '../../components/BottomNav';

interface Destination {
  id: string;
  name: string;
  country: string;
  region?: string;
  description?: string;
  short_description?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  currency?: string;
  language?: string;
  best_time_to_visit?: string;
  average_temperature?: Record<string, number>;
  images?: string[];
  cover_image?: string;
  rating?: number;
  tags?: string[];
}

interface Hotel {
  id: string;
  name: string;
  description?: string;
  address?: string;
  city?: string;
  star_rating?: number;
  rating?: number;
  review_count?: number;
  price_per_night?: number;
  currency?: string;
  amenities?: string[];
  images?: string[];
  cover_image?: string;
}

interface Attraction {
  id: string;
  name: string;
  category: string;
  description?: string;
  rating?: number;
  images?: string[];
}

const amenityIcons: Record<string, any> = {
  wifi: Wifi,
  parking: Car,
  breakfast: Coffee,
  restaurant: Utensils,
};

export default function DestinationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'hotels' | 'attractions' | 'tours'>('overview');
  const [isSaved, setIsSaved] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  const { data: destination, isLoading: loadingDestination } = useQuery({
    queryKey: ['destination', id],
    queryFn: async () => {
      const response = await api.get<any>(\`/destinations/\${id}\`);
      return response?.data || response;
    },
    enabled: !!id,
    retry: 1,
  });

  const { data: hotels = [], isLoading: loadingHotels } = useQuery({
    queryKey: ['hotels', 'destination', id],
    queryFn: async () => {
      const response = await api.get<any>(\`/hotels?destination_id=\${id}\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !!id,
    retry: 1,
  });

  const { data: attractions = [], isLoading: loadingAttractions } = useQuery({
    queryKey: ['attractions', 'destination', id],
    queryFn: async () => {
      const response = await api.get<any>(\`/attractions?destination_id=\${id}\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !!id,
    retry: 1,
  });

  const loading = loadingDestination;

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={\`w-3 h-3 \${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'}\`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <p className="text-gray-400">Destination not found</p>
      </div>
    );
  }

  const images = destination.images?.length ? destination.images : (destination.cover_image ? [destination.cover_image] : []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pb-24">
      {/* Header with Image */}
      <div className="relative h-72">
        {images.length > 0 ? (
          <img
            src={images[selectedImage]}
            alt={destination.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <span className="text-8xl">🌍</span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />

        {/* Top buttons */}
        <div className="absolute top-4 left-4 right-4 flex justify-between">
          <button
            onClick={() => navigate(-1)}
            className="bg-white/10 border border-white/20 backdrop-blur-xl p-2 rounded-full"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => setIsSaved(!isSaved)}
              className="bg-white/10 border border-white/20 backdrop-blur-xl p-2 rounded-full"
            >
              <Heart className={\`w-6 h-6 \${isSaved ? 'fill-red-500 text-red-500' : 'text-white'}\`} />
            </button>
            <button className="bg-white/10 border border-white/20 backdrop-blur-xl p-2 rounded-full">
              <Share2 className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        {/* Destination info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-center gap-2 mb-2">
            {destination.rating && (
              <div className="flex items-center gap-1 bg-white/20 backdrop-blur-xl px-2 py-1 rounded-full">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-white font-medium">{Number(destination.rating).toFixed(1)}</span>
              </div>
            )}
            {destination.tags?.slice(0, 2).map((tag, index) => (
              <span key={index} className="bg-white/20 backdrop-blur-xl px-2 py-1 rounded-full text-white text-xs">
                {tag}
              </span>
            ))}
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">{destination.name}</h1>
          <div className="flex items-center gap-1 text-white/80">
            <MapPin className="w-4 h-4" />
            <span>{destination.country}{destination.region ? \`, \${destination.region}\` : ''}</span>
          </div>
        </div>

        {/* Image dots */}
        {images.length > 1 && (
          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={\`w-2 h-2 rounded-full transition-all \${
                  index === selectedImage ? 'bg-white w-6' : 'bg-white/50'
                }\`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="px-4 mt-4">
        <div className="flex gap-2 bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl p-1 overflow-x-auto">
          {(['overview', 'hotels', 'attractions', 'tours'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={\`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all whitespace-nowrap \${
                activeTab === tab
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                  : 'text-gray-400'
              }\`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === 'hotels' && hotels.length > 0 && (
                <span className="ml-1 bg-white/20 px-1.5 py-0.5 rounded-full text-xs">{hotels.length}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-4 mt-4">
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Description */}
            {destination.description && (
              <div className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl p-4">
                <h3 className="font-semibold text-white mb-2">About</h3>
                <p className="text-gray-300 text-sm leading-relaxed">{destination.description}</p>
              </div>
            )}

            {/* Quick Info */}
            <div className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl p-4">
              <h3 className="font-semibold text-white mb-3">Essential Info</h3>
              <div className="grid grid-cols-2 gap-4">
                {destination.language && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center">
                      <Languages className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Language</p>
                      <p className="text-white">{destination.language}</p>
                    </div>
                  </div>
                )}
                {destination.currency && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Currency</p>
                      <p className="text-white">{destination.currency}</p>
                    </div>
                  </div>
                )}
                {destination.timezone && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Timezone</p>
                      <p className="text-white">{destination.timezone}</p>
                    </div>
                  </div>
                )}
                {destination.best_time_to_visit && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center">
                      <Thermometer className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Best Time</p>
                      <p className="text-white">{destination.best_time_to_visit}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl p-3 text-center">
                <Building2 className="w-6 h-6 text-purple-400 mx-auto mb-1" />
                <p className="text-white font-semibold">{hotels.length}</p>
                <p className="text-gray-400 text-xs">Hotels</p>
              </div>
              <div className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl p-3 text-center">
                <Compass className="w-6 h-6 text-cyan-400 mx-auto mb-1" />
                <p className="text-white font-semibold">{attractions.length}</p>
                <p className="text-gray-400 text-xs">Attractions</p>
              </div>
              <div
                onClick={() => navigate(\`/maps?lat=\${destination.latitude}&lng=\${destination.longitude}\`)}
                className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl p-3 text-center cursor-pointer"
              >
                <Map className="w-6 h-6 text-green-400 mx-auto mb-1" />
                <p className="text-white font-semibold">View</p>
                <p className="text-gray-400 text-xs">Map</p>
              </div>
            </div>

            {/* Featured Hotels Preview */}
            {hotels.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-white">Top Hotels</h3>
                  <button
                    onClick={() => setActiveTab('hotels')}
                    className="text-cyan-400 text-sm"
                  >
                    See all
                  </button>
                </div>
                <div className="space-y-3">
                  {hotels.slice(0, 2).map((hotel) => (
                    <div
                      key={hotel.id}
                      onClick={() => navigate(\`/hotels/\${hotel.id}\`)}
                      className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform"
                    >
                      <div className="flex">
                        <div className="w-28 h-24 flex-shrink-0">
                          {hotel.cover_image || hotel.images?.[0] ? (
                            <img src={hotel.cover_image || hotel.images?.[0]} alt={hotel.name} className="w-full h-full object-cover" />
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
                          <h4 className="text-white font-medium text-sm">{hotel.name}</h4>
                          <div className="flex items-center justify-between mt-2">
                            {hotel.rating && (
                              <div className="flex items-center gap-1">
                                <span className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded">{Number(hotel.rating).toFixed(1)}</span>
                                <span className="text-gray-400 text-xs">{hotel.review_count} reviews</span>
                              </div>
                            )}
                            {hotel.price_per_night && (
                              <p className="text-white font-semibold text-sm">
                                {hotel.currency || '$'}{hotel.price_per_night}<span className="text-gray-400 text-xs font-normal">/night</span>
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'hotels' && (
          <div className="space-y-4">
            {hotels.length === 0 ? (
              <div className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl p-8 text-center">
                <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-400">No hotels found in {destination.name}</p>
              </div>
            ) : (
              <>
                <p className="text-gray-400 text-sm">{hotels.length} hotels in {destination.name}</p>
                {hotels.map((hotel) => (
                  <div
                    key={hotel.id}
                    onClick={() => navigate(\`/hotels/\${hotel.id}\`)}
                    className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform"
                  >
                    <div className="relative h-40">
                      {hotel.cover_image || hotel.images?.[0] ? (
                        <img src={hotel.cover_image || hotel.images?.[0]} alt={hotel.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                          <Building2 className="w-12 h-12 text-white/50" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        <button className="bg-white/10 backdrop-blur-xl p-1.5 rounded-full">
                          <Heart className="w-4 h-4 text-white" />
                        </button>
                      </div>
                      {hotel.rating && (
                        <div className="absolute bottom-2 left-2 bg-blue-600 text-white text-sm font-semibold px-2 py-1 rounded">
                          {Number(hotel.rating).toFixed(1)}
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-1 mb-1">
                        {hotel.star_rating && renderStars(hotel.star_rating)}
                        <span className="text-gray-400 text-xs ml-1">{hotel.star_rating}-star hotel</span>
                      </div>
                      <h4 className="text-white font-semibold">{hotel.name}</h4>
                      {hotel.address && (
                        <p className="text-gray-400 text-sm mt-1 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {hotel.address}
                        </p>
                      )}

                      {/* Amenities */}
                      {hotel.amenities && hotel.amenities.length > 0 && (
                        <div className="flex gap-2 mt-2">
                          {hotel.amenities.slice(0, 4).map((amenity, i) => (
                            <span key={i} className="bg-white/5 px-2 py-1 rounded text-gray-300 text-xs">
                              {amenity}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
                        <div>
                          {hotel.review_count && (
                            <p className="text-gray-400 text-xs">{hotel.review_count} reviews</p>
                          )}
                        </div>
                        <div className="text-right">
                          {hotel.price_per_night && (
                            <>
                              <p className="text-white font-bold text-lg">
                                {hotel.currency || '$'}{hotel.price_per_night}
                              </p>
                              <p className="text-gray-400 text-xs">per night</p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {activeTab === 'attractions' && (
          <div className="space-y-4">
            {attractions.length === 0 ? (
              <div className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl p-8 text-center">
                <Compass className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-400">No attractions found</p>
              </div>
            ) : (
              attractions.map((attraction) => (
                <div
                  key={attraction.id}
                  onClick={() => navigate(\`/attractions/\${attraction.id}\`)}
                  className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform"
                >
                  <div className="flex">
                    <div className="w-24 h-24 flex-shrink-0">
                      {attraction.images?.[0] ? (
                        <img src={attraction.images[0]} alt={attraction.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                          <Compass className="w-8 h-8 text-white/50" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 p-3">
                      <span className="text-cyan-400 text-xs capitalize">{attraction.category}</span>
                      <h4 className="text-white font-medium">{attraction.name}</h4>
                      {attraction.rating && (
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-white text-sm">{Number(attraction.rating).toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'tours' && (
          <div className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl p-8 text-center">
            <Compass className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-400 mb-4">Explore tours in {destination.name}</p>
            <button
              onClick={() => navigate(\`/tours?destination=\${destination.id}\`)}
              className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl"
            >
              View Tours
            </button>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
`;
}
