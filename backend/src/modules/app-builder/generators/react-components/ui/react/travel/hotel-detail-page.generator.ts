import { AppBlueprint, Page } from '../../../../../interfaces/app-builder.types';

export function generateHotelDetailPage(
  blueprint: AppBlueprint,
  page: Page,
): string {
  return `import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeft, Star, MapPin, Wifi, Car, Coffee, Dumbbell, Waves,
  Heart, Share2, Phone, Mail, Globe, Clock, Users, Bed, Maximize,
  Check, X, Wind, Tv, BedDouble, Building2, ChevronRight, Calendar,
  CreditCard, Shield, Award, ThumbsUp, Camera, Grid3X3, Loader2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface Hotel {
  id: string;
  name: string;
  description?: string;
  address?: string;
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  star_rating?: number;
  rating?: number;
  review_count?: number;
  price_per_night?: number;
  currency?: string;
  amenities?: string[];
  images?: string[];
  cover_image?: string;
  phone?: string;
  email?: string;
  website?: string;
  check_in_time?: string;
  check_out_time?: string;
  policies?: Record<string, any>;
  is_featured?: boolean;
}

interface Room {
  id: string;
  hotel_id: string;
  name: string;
  description?: string;
  room_type: string;
  bed_type?: string;
  max_guests: number;
  size_sqm?: number;
  price_per_night: number;
  currency?: string;
  amenities?: string[];
  images?: string[];
  is_available: boolean;
  quantity: number;
}

const amenityIcons: Record<string, any> = {
  wifi: Wifi,
  'free wifi': Wifi,
  parking: Car,
  'free parking': Car,
  breakfast: Coffee,
  'free breakfast': Coffee,
  gym: Dumbbell,
  fitness: Dumbbell,
  pool: Waves,
  'swimming pool': Waves,
  'air conditioning': Wind,
  ac: Wind,
  tv: Tv,
  television: Tv,
};

export default function HotelDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [selectedImage, setSelectedImage] = useState(0);
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);

  const { data: hotel, isLoading: loadingHotel } = useQuery({
    queryKey: ['hotel', id],
    queryFn: async () => {
      const response = await api.get<any>(\`/hotels/\${id}\`);
      return response?.data || response;
    },
    enabled: !!id,
    retry: 1,
  });

  const { data: rooms = [], isLoading: loadingRooms } = useQuery({
    queryKey: ['rooms', id],
    queryFn: async () => {
      const response = await api.get<any>(\`/rooms?hotel_id=\${id}\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !!id,
    retry: 1,
  });

  const loading = loadingHotel || loadingRooms;

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={\`w-4 h-4 \${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}\`}
      />
    ));
  };

  const getAmenityIcon = (amenity: string) => {
    const lowerAmenity = amenity.toLowerCase();
    for (const [key, Icon] of Object.entries(amenityIcons)) {
      if (lowerAmenity.includes(key)) {
        return Icon;
      }
    }
    return Check;
  };

  const getRatingLabel = (rating: number) => {
    if (rating >= 9) return 'Exceptional';
    if (rating >= 8) return 'Excellent';
    if (rating >= 7) return 'Very Good';
    if (rating >= 6) return 'Good';
    return 'Pleasant';
  };

  const handleBookRoom = (room: Room) => {
    if (!token) {
      navigate('/login');
      return;
    }
    setSelectedRoom(room);
  };

  const confirmBooking = async () => {
    if (!selectedRoom || !checkIn || !checkOut) return;

    const nights = Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24));

    try {
      const response = await fetch(\`\${import.meta.env.VITE_API_URL}/api/v1/bookings\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: \`Bearer \${token}\`,
        },
        body: JSON.stringify({
          booking_type: 'hotel',
          provider: hotel?.name,
          provider_id: hotel?.id,
          start_date: checkIn,
          end_date: checkOut,
          location: hotel?.city,
          details: {
            room_id: selectedRoom.id,
            room_name: selectedRoom.name,
            room_type: selectedRoom.room_type,
            guests: guests,
          },
          cost: selectedRoom.price_per_night * nights,
          currency: selectedRoom.currency || hotel?.currency || 'USD',
          status: 'pending',
        }),
      });

      if (response.ok) {
        setSelectedRoom(null);
        alert('Booking successful!');
        navigate('/trips');
      }
    } catch (error) {
      console.error('Failed to create booking:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Hotel not found</p>
          <button onClick={() => navigate('/hotels')} className="mt-4 text-blue-600 hover:underline">
            Browse all hotels
          </button>
        </div>
      </div>
    );
  }

  const images = hotel.images?.length ? hotel.images : (hotel.cover_image ? [hotel.cover_image] : []);
  const lowestPrice = rooms.length > 0 ? Math.min(...rooms.map(r => r.price_per_night)) : hotel.price_per_night;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-600">
            <button onClick={() => navigate('/')} className="hover:text-blue-600">Home</button>
            <ChevronRight className="w-4 h-4" />
            <button onClick={() => navigate('/hotels')} className="hover:text-blue-600">Hotels</button>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium truncate">{hotel.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {hotel.star_rating && (
                <div className="flex items-center gap-0.5">
                  {renderStars(hotel.star_rating)}
                </div>
              )}
              <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded">
                {hotel.star_rating}-star hotel
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{hotel.name}</h1>
            <div className="flex items-center gap-4 text-gray-600">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {hotel.address || hotel.city}{hotel.country ? \`, \${hotel.country}\` : ''}
              </span>
              {hotel.rating && (
                <div className="flex items-center gap-2">
                  <div className="bg-blue-600 text-white font-bold px-2 py-1 rounded">
                    {Number(hotel.rating).toFixed(1)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{getRatingLabel(hotel.rating)}</p>
                    <p className="text-sm text-gray-500">{hotel.review_count || 0} reviews</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSaved(!isSaved)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Heart className={\`w-5 h-5 \${isSaved ? 'fill-red-500 text-red-500' : 'text-gray-600'}\`} />
              <span className="hidden sm:inline">Save</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Share2 className="w-5 h-5 text-gray-600" />
              <span className="hidden sm:inline">Share</span>
            </button>
          </div>
        </div>

        {/* Photo Gallery */}
        <div className="mb-8">
          {images.length > 0 ? (
            <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[400px] rounded-xl overflow-hidden">
              <div
                className="col-span-2 row-span-2 relative cursor-pointer"
                onClick={() => setShowAllPhotos(true)}
              >
                <img src={images[0]} alt={hotel.name} className="w-full h-full object-cover" />
              </div>
              {images.slice(1, 5).map((img, idx) => (
                <div
                  key={idx}
                  className="relative cursor-pointer"
                  onClick={() => setShowAllPhotos(true)}
                >
                  <img src={img} alt={\`\${hotel.name} \${idx + 2}\`} className="w-full h-full object-cover" />
                  {idx === 3 && images.length > 5 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white font-semibold">+{images.length - 5} photos</span>
                    </div>
                  )}
                </div>
              ))}
              <button
                onClick={() => setShowAllPhotos(true)}
                className="absolute bottom-4 right-4 bg-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 hover:bg-gray-50"
              >
                <Grid3X3 className="w-4 h-4" />
                Show all photos
              </button>
            </div>
          ) : (
            <div className="h-[400px] bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Building2 className="w-24 h-24 text-white/30" />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Highlights */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Property highlights</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {hotel.amenities?.slice(0, 8).map((amenity, i) => {
                  const Icon = getAmenityIcon(amenity);
                  return (
                    <div key={i} className="flex items-center gap-2">
                      <Icon className="w-5 h-5 text-blue-600" />
                      <span className="text-gray-700 text-sm">{amenity}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Description */}
            {hotel.description && (
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <h2 className="text-xl font-bold text-gray-900 mb-4">About this property</h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">{hotel.description}</p>
              </div>
            )}

            {/* Available Rooms */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Choose your room</h2>
              {rooms.length === 0 ? (
                <div className="text-center py-8">
                  <BedDouble className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No rooms available at the moment</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {rooms.map((room) => (
                    <div key={room.id} className="border rounded-xl overflow-hidden hover:border-blue-300 transition-colors">
                      <div className="flex flex-col md:flex-row">
                        {/* Room Image */}
                        <div className="md:w-48 h-40 md:h-auto flex-shrink-0">
                          {room.images?.[0] ? (
                            <img src={room.images[0]} alt={room.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                              <BedDouble className="w-10 h-10 text-gray-400" />
                            </div>
                          )}
                        </div>

                        {/* Room Details */}
                        <div className="flex-1 p-4">
                          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg text-gray-900 mb-2">{room.name}</h3>
                              <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-3">
                                <span className="flex items-center gap-1">
                                  <Users className="w-4 h-4" />
                                  {room.max_guests} guests
                                </span>
                                {room.bed_type && (
                                  <span className="flex items-center gap-1">
                                    <Bed className="w-4 h-4" />
                                    {room.bed_type}
                                  </span>
                                )}
                                {room.size_sqm && (
                                  <span className="flex items-center gap-1">
                                    <Maximize className="w-4 h-4" />
                                    {room.size_sqm} m²
                                  </span>
                                )}
                              </div>
                              {room.amenities && room.amenities.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                  {room.amenities.slice(0, 4).map((amenity, i) => (
                                    <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                      {amenity}
                                    </span>
                                  ))}
                                  {room.amenities.length > 4 && (
                                    <span className="text-xs text-blue-600">+{room.amenities.length - 4} more</span>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Price & Book */}
                            <div className="text-right">
                              <p className="text-2xl font-bold text-gray-900">
                                {room.currency || hotel.currency || '$'}{room.price_per_night}
                              </p>
                              <p className="text-sm text-gray-500 mb-3">per night</p>
                              {room.quantity <= 3 && room.is_available && (
                                <p className="text-red-600 text-sm mb-2">Only {room.quantity} left!</p>
                              )}
                              <button
                                onClick={() => handleBookRoom(room)}
                                disabled={!room.is_available}
                                className={\`w-full md:w-auto px-6 py-2 rounded-lg font-semibold transition-colors \${
                                  room.is_available
                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                }\`}
                              >
                                {room.is_available ? 'Select' : 'Sold out'}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* House Rules */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h2 className="text-xl font-bold text-gray-900 mb-4">House rules</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-gray-500 text-sm mb-1">Check-in</p>
                  <p className="font-semibold text-gray-900">From {hotel.check_in_time || '14:00'}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm mb-1">Check-out</p>
                  <p className="font-semibold text-gray-900">Until {hotel.check_out_time || '12:00'}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm mb-1">Cancellation</p>
                  <p className="font-semibold text-gray-900">Free cancellation</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <div className="bg-white rounded-xl p-6 shadow-lg border">
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-3xl font-bold text-gray-900">
                    {hotel.currency || '$'}{lowestPrice || '---'}
                  </span>
                  <span className="text-gray-500">/ night</span>
                </div>

                {hotel.rating && (
                  <div className="flex items-center gap-2 mb-4 pb-4 border-b">
                    <div className="bg-blue-600 text-white font-bold px-2 py-1 rounded text-sm">
                      {Number(hotel.rating).toFixed(1)}
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900">{getRatingLabel(hotel.rating)}</span>
                      <span className="text-gray-500 text-sm ml-1">· {hotel.review_count || 0} reviews</span>
                    </div>
                  </div>
                )}

                <div className="space-y-3 mb-4">
                  <div>
                    <label className="text-gray-700 text-sm font-medium mb-1 block">Check-in</label>
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-gray-700 text-sm font-medium mb-1 block">Check-out</label>
                    <input
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      min={checkIn || new Date().toISOString().split('T')[0]}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-gray-700 text-sm font-medium mb-1 block">Guests</label>
                    <select
                      value={guests}
                      onChange={(e) => setGuests(Number(e.target.value))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {[1, 2, 3, 4, 5, 6].map((n) => (
                        <option key={n} value={n}>{n} Guest{n > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  onClick={() => {
                    const roomsSection = document.querySelector('h2');
                    roomsSection?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors mb-3"
                >
                  Check availability
                </button>

                <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Shield className="w-4 h-4" />
                    Secure booking
                  </span>
                  <span className="flex items-center gap-1">
                    <CreditCard className="w-4 h-4" />
                    No payment now
                  </span>
                </div>
              </div>

              {/* Contact Card */}
              {(hotel.phone || hotel.email) && (
                <div className="bg-white rounded-xl p-4 shadow-sm border mt-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Contact property</h3>
                  <div className="space-y-2">
                    {hotel.phone && (
                      <a href={\`tel:\${hotel.phone}\`} className="flex items-center gap-2 text-blue-600 hover:underline">
                        <Phone className="w-4 h-4" />
                        {hotel.phone}
                      </a>
                    )}
                    {hotel.email && (
                      <a href={\`mailto:\${hotel.email}\`} className="flex items-center gap-2 text-blue-600 hover:underline">
                        <Mail className="w-4 h-4" />
                        {hotel.email}
                      </a>
                    )}
                    {hotel.website && (
                      <a href={hotel.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline">
                        <Globe className="w-4 h-4" />
                        Visit website
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Photo Gallery Modal */}
      {showAllPhotos && (
        <div className="fixed inset-0 bg-black z-50 overflow-y-auto">
          <div className="sticky top-0 bg-black/90 backdrop-blur-sm p-4 flex justify-between items-center">
            <h2 className="text-white font-semibold">{hotel.name} - Photos</h2>
            <button onClick={() => setShowAllPhotos(false)} className="text-white p-2 hover:bg-white/10 rounded-full">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="max-w-5xl mx-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {images.map((img, idx) => (
              <img key={idx} src={img} alt={\`\${hotel.name} \${idx + 1}\`} className="w-full rounded-lg" />
            ))}
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {selectedRoom && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">Complete your booking</h3>
              <button onClick={() => setSelectedRoom(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {/* Room Summary */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <h4 className="font-semibold text-gray-900">{selectedRoom.name}</h4>
                <p className="text-gray-500 text-sm">{selectedRoom.room_type}</p>
                <p className="text-xl font-bold text-gray-900 mt-2">
                  {selectedRoom.currency || hotel.currency || '$'}{selectedRoom.price_per_night}
                  <span className="text-gray-500 text-sm font-normal"> / night</span>
                </p>
              </div>

              {/* Booking Form */}
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-700 text-sm font-medium mb-1 block">Check-in</label>
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="text-gray-700 text-sm font-medium mb-1 block">Check-out</label>
                    <input
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      min={checkIn || new Date().toISOString().split('T')[0]}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-gray-700 text-sm font-medium mb-1 block">Guests</label>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    {Array.from({ length: selectedRoom.max_guests }, (_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1} Guest{i > 0 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Price Summary */}
              {checkIn && checkOut && new Date(checkOut) > new Date(checkIn) && (
                <div className="border-t pt-4 mb-6">
                  <div className="flex justify-between text-gray-600 mb-2">
                    <span>
                      {selectedRoom.currency || hotel.currency || '$'}{selectedRoom.price_per_night} × {Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24))} nights
                    </span>
                    <span>
                      {selectedRoom.currency || hotel.currency || '$'}{selectedRoom.price_per_night * Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24))}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-gray-900">
                    <span>Total</span>
                    <span>
                      {selectedRoom.currency || hotel.currency || '$'}{selectedRoom.price_per_night * Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24))}
                    </span>
                  </div>
                </div>
              )}

              <button
                onClick={confirmBooking}
                disabled={!checkIn || !checkOut || new Date(checkOut) <= new Date(checkIn)}
                className={\`w-full py-3 rounded-lg font-semibold text-lg transition-colors \${
                  checkIn && checkOut && new Date(checkOut) > new Date(checkIn)
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }\`}
              >
                Confirm booking
              </button>

              <p className="text-center text-sm text-gray-500 mt-4">
                <Shield className="w-4 h-4 inline mr-1" />
                Free cancellation before check-in
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
`;
}
