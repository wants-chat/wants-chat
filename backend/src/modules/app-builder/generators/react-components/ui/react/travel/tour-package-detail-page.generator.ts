import { AppBlueprint, Page } from '../../../../../interfaces/app-builder.types';

export function generateTourPackageDetailPage(
  blueprint: AppBlueprint,
  page: Page,
): string {
  return `import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, MapPin, Calendar, Users, Star, Clock, Heart, Share2, Check, X, ChevronRight, Compass, DollarSign, Mountain, Info, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import BottomNav from '../../components/BottomNav';

interface TourPackage {
  id: string;
  destination_id?: string;
  name: string;
  description?: string;
  short_description?: string;
  duration_days: number;
  duration_nights?: number;
  tour_type?: string;
  difficulty_level?: string;
  group_size_min?: number;
  group_size_max?: number;
  price: number;
  currency?: string;
  price_includes?: string[];
  price_excludes?: string[];
  itinerary?: { day: number; title: string; description: string; meals?: string[] }[];
  highlights?: string[];
  images?: string[];
  cover_image?: string;
  rating?: number;
  review_count?: number;
  departure_dates?: string[];
  is_featured?: boolean;
  is_active?: boolean;
}

interface Destination {
  id: string;
  name: string;
  country: string;
}

const tourTypeColors: Record<string, string> = {
  adventure: 'from-orange-500 to-red-500',
  cultural: 'from-purple-500 to-pink-500',
  beach: 'from-cyan-500 to-blue-500',
  wildlife: 'from-green-500 to-emerald-500',
  city: 'from-gray-500 to-slate-500',
};

const difficultyColors: Record<string, string> = {
  easy: 'bg-green-500/20 text-green-400',
  moderate: 'bg-yellow-500/20 text-yellow-400',
  challenging: 'bg-orange-500/20 text-orange-400',
  difficult: 'bg-red-500/20 text-red-400',
};

export default function TourPackageDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'itinerary' | 'includes' | 'reviews'>('overview');
  const [isSaved, setIsSaved] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [travelers, setTravelers] = useState(1);

  const { data: tourPackage, isLoading: loadingPackage } = useQuery({
    queryKey: ['tour-package', id],
    queryFn: async () => {
      const response = await api.get<any>(\`/tour-packages/\${id}\`);
      return response?.data || response;
    },
    enabled: !!id,
    retry: 1,
  });

  const { data: destination } = useQuery({
    queryKey: ['destination', tourPackage?.destination_id],
    queryFn: async () => {
      const response = await api.get<any>(\`/destinations/\${tourPackage?.destination_id}\`);
      return response?.data || response;
    },
    enabled: !!tourPackage?.destination_id,
    retry: 1,
  });

  const loading = loadingPackage;

  const handleBookTour = async () => {
    if (!token) {
      navigate('/login');
      return;
    }

    if (!selectedDate) {
      alert('Please select a departure date');
      return;
    }

    try {
      const response = await fetch(\`\${import.meta.env.VITE_API_URL}/api/v1/bookings\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: \`Bearer \${token}\`,
        },
        body: JSON.stringify({
          booking_type: 'activity',
          provider: tourPackage?.name,
          provider_id: tourPackage?.id,
          start_date: selectedDate,
          end_date: new Date(new Date(selectedDate).getTime() + (tourPackage?.duration_days || 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          location: destination?.name,
          details: {
            tour_package_id: tourPackage?.id,
            tour_name: tourPackage?.name,
            travelers: travelers,
            duration_days: tourPackage?.duration_days,
          },
          cost: (tourPackage?.price || 0) * travelers,
          currency: tourPackage?.currency || 'USD',
          status: 'pending',
        }),
      });

      if (response.ok) {
        setShowBookingModal(false);
        alert('Tour booked successfully!');
        navigate('/trips');
      }
    } catch (error) {
      console.error('Failed to book tour:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  if (!tourPackage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <p className="text-gray-400">Tour package not found</p>
      </div>
    );
  }

  const images = tourPackage.images?.length ? tourPackage.images : (tourPackage.cover_image ? [tourPackage.cover_image] : []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pb-24">
      {/* Header with Image */}
      <div className="relative h-72">
        {images.length > 0 ? (
          <img
            src={images[selectedImage]}
            alt={tourPackage.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className={\`w-full h-full bg-gradient-to-br \${tourTypeColors[tourPackage.tour_type || ''] || 'from-blue-500 to-purple-600'} flex items-center justify-center\`}>
            <Compass className="w-20 h-20 text-white/50" />
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

        {/* Tour info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {tourPackage.is_featured && (
              <span className="px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-semibold rounded-full">
                Featured
              </span>
            )}
            {tourPackage.tour_type && (
              <span className={\`px-2 py-1 bg-gradient-to-r \${tourTypeColors[tourPackage.tour_type] || 'from-blue-500 to-purple-600'} text-white text-xs rounded-full capitalize\`}>
                {tourPackage.tour_type}
              </span>
            )}
            {tourPackage.difficulty_level && (
              <span className={\`px-2 py-1 rounded-full text-xs capitalize \${difficultyColors[tourPackage.difficulty_level] || 'bg-gray-500/20 text-gray-400'}\`}>
                {tourPackage.difficulty_level}
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">{tourPackage.name}</h1>
          {destination && (
            <div className="flex items-center gap-1 text-white/80">
              <MapPin className="w-4 h-4" />
              <span>{destination.name}, {destination.country}</span>
            </div>
          )}
        </div>

        {/* Image dots */}
        {images.length > 1 && (
          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex gap-2">
            {images.slice(0, 5).map((_, index) => (
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

      {/* Tour Stats */}
      <div className="px-4 -mt-4 relative z-10">
        <div className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl p-4">
          <div className="grid grid-cols-4 gap-3 text-center">
            <div>
              <Calendar className="w-5 h-5 text-blue-400 mx-auto mb-1" />
              <p className="text-white font-semibold text-sm">{tourPackage.duration_days}D</p>
              <p className="text-gray-400 text-xs">{tourPackage.duration_nights ? \`\${tourPackage.duration_nights}N\` : 'Days'}</p>
            </div>
            <div>
              <Users className="w-5 h-5 text-green-400 mx-auto mb-1" />
              <p className="text-white font-semibold text-sm">{tourPackage.group_size_max || '∞'}</p>
              <p className="text-gray-400 text-xs">Max</p>
            </div>
            <div>
              <Star className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
              <p className="text-white font-semibold text-sm">{Number(tourPackage.rating).toFixed(1) || '-'}</p>
              <p className="text-gray-400 text-xs">{tourPackage.review_count || 0} reviews</p>
            </div>
            <div>
              <DollarSign className="w-5 h-5 text-purple-400 mx-auto mb-1" />
              <p className="text-white font-semibold text-sm">{tourPackage.currency || '$'}{tourPackage.price}</p>
              <p className="text-gray-400 text-xs">/person</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 mt-4">
        <div className="flex gap-2 bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl p-1 overflow-x-auto">
          {(['overview', 'itinerary', 'includes', 'reviews'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={\`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all whitespace-nowrap \${
                activeTab === tab
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                  : 'text-gray-400'
              }\`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-4 mt-4">
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Description */}
            {tourPackage.description && (
              <div className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl p-4">
                <h3 className="font-semibold text-white mb-2">About This Tour</h3>
                <p className="text-gray-300 text-sm leading-relaxed">{tourPackage.description}</p>
              </div>
            )}

            {/* Highlights */}
            {tourPackage.highlights && tourPackage.highlights.length > 0 && (
              <div className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl p-4">
                <h3 className="font-semibold text-white mb-3">Tour Highlights</h3>
                <div className="space-y-2">
                  {tourPackage.highlights.map((highlight, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300 text-sm">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Departure Dates */}
            {tourPackage.departure_dates && tourPackage.departure_dates.length > 0 && (
              <div className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl p-4">
                <h3 className="font-semibold text-white mb-3">Upcoming Departures</h3>
                <div className="flex flex-wrap gap-2">
                  {tourPackage.departure_dates.slice(0, 6).map((date, index) => (
                    <span key={index} className="bg-white/5 px-3 py-1.5 rounded-lg text-gray-300 text-sm">
                      {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'itinerary' && (
          <div className="space-y-4">
            {tourPackage.itinerary && tourPackage.itinerary.length > 0 ? (
              tourPackage.itinerary.map((day, index) => (
                <div key={index} className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-sm">{day.day}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-semibold mb-1">{day.title}</h4>
                      <p className="text-gray-300 text-sm">{day.description}</p>
                      {day.meals && day.meals.length > 0 && (
                        <div className="flex gap-2 mt-2">
                          {day.meals.map((meal, i) => (
                            <span key={i} className="bg-white/5 px-2 py-0.5 rounded text-gray-400 text-xs capitalize">
                              {meal}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl p-8 text-center">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-400">Itinerary details coming soon</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'includes' && (
          <div className="space-y-4">
            {/* Price Includes */}
            {tourPackage.price_includes && tourPackage.price_includes.length > 0 && (
              <div className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl p-4">
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-400" />
                  Price Includes
                </h3>
                <div className="space-y-2">
                  {tourPackage.price_includes.map((item: any, index: number) => (
                    <div key={index} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300 text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Price Excludes */}
            {tourPackage.price_excludes && tourPackage.price_excludes.length > 0 && (
              <div className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl p-4">
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <X className="w-5 h-5 text-red-400" />
                  Not Included
                </h3>
                <div className="space-y-2">
                  {tourPackage.price_excludes.map((item: any, index: number) => (
                    <div key={index} className="flex items-start gap-2">
                      <X className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300 text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(!tourPackage.price_includes?.length && !tourPackage.price_excludes?.length) && (
              <div className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl p-8 text-center">
                <Info className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-400">Inclusion details not available</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl p-8 text-center">
            <Star className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-white text-lg font-semibold mb-1">
              {Number(tourPackage.rating).toFixed(1) || 'No'} Rating
            </p>
            <p className="text-gray-400">{tourPackage.review_count || 0} reviews</p>
          </div>
        )}
      </div>

      {/* Fixed Book Button */}
      <div className="fixed bottom-20 left-0 right-0 px-4 z-20">
        <div className="bg-slate-900/95 backdrop-blur-xl border border-white/20 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">From</p>
            <p className="text-white text-xl font-bold">
              {tourPackage.currency || '$'}{tourPackage.price}
              <span className="text-gray-400 text-sm font-normal">/person</span>
            </p>
          </div>
          <button
            onClick={() => setShowBookingModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl"
          >
            Book Now
          </button>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-end">
          <div className="bg-slate-900 w-full rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Book Tour</h3>
              <button onClick={() => setShowBookingModal(false)}>
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <div className="bg-white/10 border border-white/20 rounded-xl p-4 mb-4">
              <h4 className="text-white font-medium">{tourPackage.name}</h4>
              <p className="text-gray-400 text-sm">{tourPackage.duration_days} days tour</p>
              <p className="text-white text-lg font-bold mt-2">
                {tourPackage.currency || '$'}{tourPackage.price}
                <span className="text-gray-400 text-sm font-normal">/person</span>
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Departure Date</label>
                {tourPackage.departure_dates && tourPackage.departure_dates.length > 0 ? (
                  <select
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                  >
                    <option value="">Select a date</option>
                    {tourPackage.departure_dates.map((date, i) => (
                      <option key={i} value={date}>
                        {new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                  />
                )}
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Number of Travelers</label>
                <select
                  value={travelers}
                  onChange={(e) => setTravelers(Number(e.target.value))}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                >
                  {Array.from({ length: tourPackage.group_size_max || 10 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1} Traveler{i > 0 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="bg-white/10 border border-white/20 rounded-xl p-4 mb-6">
              <div className="flex justify-between text-gray-400 text-sm mb-2">
                <span>{travelers} x {tourPackage.currency || '$'}{tourPackage.price}</span>
                <span>{tourPackage.currency || '$'}{tourPackage.price * travelers}</span>
              </div>
              <div className="flex justify-between text-white font-bold text-lg pt-2 border-t border-white/10">
                <span>Total</span>
                <span>{tourPackage.currency || '$'}{tourPackage.price * travelers}</span>
              </div>
            </div>

            <button
              onClick={handleBookTour}
              disabled={!selectedDate}
              className={\`w-full py-4 rounded-xl font-semibold text-lg \${
                selectedDate
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }\`}
            >
              Confirm Booking
            </button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
`;
}
