import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateTravelHotelDetailPage = (
  resolved: ResolvedComponent,
  variant: 'standard' | 'minimal' | 'enhanced' = 'standard'
) => {
  const dataSource = resolved.dataSource;

  // Parse data source for clean prop naming (sanitize to camelCase)
  const sanitizeVariableName = (name: string): string => {
    return name
      .split(/[._]/)
      .map((part, index) => {
        if (index === 0) return part;
        return part.charAt(0).toUpperCase() + part.slice(1);
      })
      .join('');
  };

  const getDataPath = () => {
    if (!dataSource || dataSource.trim() === '') return 'data';
    const parts = dataSource.split('.');
    const lastPart = parts[parts.length - 1];
    return lastPart ? sanitizeVariableName(lastPart) : 'data';
  };

  const dataName = getDataPath();

  // Get the resolved field names from the field resolver service
  const getField = (fieldName: string): string => {
    const mapping = resolved.fieldMappings?.find(m => m.targetField === fieldName);
    if (mapping?.sourceField) {
      return `propData?.${mapping.sourceField}`;
    }
    // Return undefined/empty for missing data - let component handle gracefully
    if (fieldName === 'id' || fieldName.endsWith('Id')) {
      return `propData?.id || propData?._id`;
    }
    // For array fields
    if (fieldName.match(/images|amenities|rooms|policies/i)) {
      return `propData?.${fieldName} || ([] as any[])`;
    }
    // For scalar values - return empty string as fallback
    return `propData?.${fieldName} || ''`;
  };

  // Get API routes from serverFunction
  const getApiRoutes = () => {
    if (!resolved.actions || resolved.actions.length === 0) {
      return { fetch: null };
    }

    const fetchAction = resolved.actions.find(
      action => action.type === 'fetch' && action.trigger === 'onLoad' && action.serverFunction
    );

    return {
      fetch: fetchAction?.serverFunction?.route?.replace(/^\/api\/v1\//, '') || null
    };
  };

  const apiRoutes = getApiRoutes();
  const useApiForData = !!apiRoutes.fetch;

  const commonImports = `
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, MapPin, Star, Heart, Share2, Wifi, Car, Coffee, Dumbbell, Waves, Utensils, Check, Calendar, Users, ChevronRight, Phone, Mail, Globe, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';${useApiForData ? `
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';` : ''}`;

  const variants = {
    standard: `
${commonImports}

interface HotelDetailPageProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const TravelHotelDetailPage: React.FC<HotelDetailPageProps> = ({
  ${dataName}: propData,
  className
}) => {
  const navigate = useNavigate();
  const { id } = useParams();
  ${useApiForData ? `
  // Fetch hotel from API
  const { data: apiData, isLoading, error } = useQuery({
    queryKey: ['hotel', id],
    queryFn: async () => {
      const route = '${apiRoutes.fetch}'.replace(':id', id || '');
      const response = await api.get<any>(route);
      return response.data?.data || response.data;
    },
    enabled: !!id
  });

  // Fetch rooms for this hotel
  const { data: roomsData } = useQuery({
    queryKey: ['hotel-rooms', id],
    queryFn: async () => {
      const response = await api.get<any>(\`rooms?hotel_id=\${id}\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !!id
  });

  const hotelData = apiData || propData;
  const rooms = roomsData || [];` : `
  const hotelData = propData;
  const rooms: any[] = [];`}

  // Default hotel data - matches create form fields from catalog
  const defaultHotel = {
    id: '1',
    destination_id: '',
    name: 'Luxury Hotel & Spa',
    description: 'Experience luxury at its finest with our world-class amenities and exceptional service.',
    address: '123 Main Street',
    city: 'New York',
    country: 'USA',
    latitude: 40.7128,
    longitude: -74.0060,
    star_rating: 5,
    price_per_night: 299,
    currency: 'USD',
    phone: '+1 234 567 8900',
    email: 'info@luxuryhotel.com',
    website: 'https://luxuryhotel.com',
    check_in_time: '14:00',
    check_out_time: '12:00',
    cover_image: '',
    is_featured: false,
    rating: 8.9,
    review_count: 1250,
    images: [],
    amenities: ['WiFi', 'Parking', 'Pool', 'Gym', 'Restaurant', 'Room Service'],
  };

  // Extract hotel from various possible data structures
  let hotel: any = defaultHotel;
  const sourceData = hotelData;

  if (sourceData) {
    if (sourceData.id || sourceData.name) {
      hotel = { ...defaultHotel, ...sourceData };
    } else if (sourceData.data) {
      if (sourceData.data.id || sourceData.data.name) {
        hotel = { ...defaultHotel, ...sourceData.data };
      }
    }
  }

  // Field mappings from catalog
  const destinationId = ${getField('destination_id')} || hotel.destination_id;
  const name = ${getField('name')} || hotel.name;
  const description = ${getField('description')} || hotel.description;
  const address = ${getField('address')} || hotel.address;
  const city = ${getField('city')} || hotel.city;
  const country = ${getField('country')} || hotel.country;
  const latitude = ${getField('latitude')} || hotel.latitude;
  const longitude = ${getField('longitude')} || hotel.longitude;
  const starRating = ${getField('star_rating')} || hotel.star_rating;
  const pricePerNight = ${getField('price_per_night')} || hotel.price_per_night;
  const currency = ${getField('currency')} || hotel.currency;
  const phone = ${getField('phone')} || hotel.phone;
  const email = ${getField('email')} || hotel.email;
  const website = ${getField('website')} || hotel.website;
  const checkInTime = ${getField('check_in_time')} || hotel.check_in_time;
  const checkOutTime = ${getField('check_out_time')} || hotel.check_out_time;
  const coverImage = ${getField('cover_image')} || hotel.cover_image;
  const isFeatured = ${getField('is_featured')} || hotel.is_featured;
  const rating = hotel.rating;
  const reviewCount = hotel.review_count;

  // Safely parse array fields - handle string, JSON string, or array
  const parseArrayField = (value: any): string[] => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return value.split(',').map((s: string) => s.trim()).filter(Boolean);
      }
    }
    return [];
  };

  const amenities = parseArrayField(hotel.amenities);

  const [isSaved, setIsSaved] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState<'overview' | 'rooms' | 'amenities'>('overview');
  const [guests, setGuests] = useState(2);

  const rawImages = parseArrayField(hotel.images);
  const images = rawImages.length > 0 ? rawImages : (coverImage ? [coverImage] : []);

  const amenityIcons: Record<string, any> = {
    wifi: Wifi,
    parking: Car,
    breakfast: Coffee,
    gym: Dumbbell,
    pool: Waves,
    restaurant: Utensils,
  };

  const getCurrencySymbol = (curr: string) => {
    const symbols: Record<string, string> = { USD: '$', EUR: '€', GBP: '£', BDT: '৳' };
    return symbols[curr] || curr;
  };

  // Event handlers
  const handleSave = () => {
    setIsSaved(!isSaved);
    toast.success(isSaved ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: name,
        text: description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  const handleBookNow = () => {
    toast.success('Proceeding to booking...');
    navigate(\`/booking/hotel/\${hotel.id}\`);
  };

  ${useApiForData ? `
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
        <p className="text-xl mb-4">Failed to load hotel</p>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }` : ''}

  return (
    <div className={cn("min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pb-24", className)}>
      {/* Header with Image */}
      <div className="relative h-72">
        {images.length > 0 ? (
          <img
            src={images[selectedImage]}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
            <MapPin className="w-16 h-16 text-white/50" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />

        {/* Top buttons */}
        <div className="absolute top-4 left-4 right-4 flex justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-full hover:bg-white/20"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </Button>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSave}
              className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-full hover:bg-white/20"
            >
              <Heart className={\`w-6 h-6 \${isSaved ? 'fill-red-500 text-red-500' : 'text-white'}\`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-full hover:bg-white/20"
            >
              <Share2 className="w-6 h-6 text-white" />
            </Button>
          </div>
        </div>

        {/* Image counter */}
        {images.length > 1 && (
          <div className="absolute bottom-20 right-4 bg-black/50 backdrop-blur-xl px-3 py-1 rounded-full">
            <span className="text-white text-sm">{selectedImage + 1}/{images.length}</span>
          </div>
        )}

        {/* Hotel info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-center gap-2 mb-2">
            {starRating && (
              <Badge variant="secondary" className="bg-yellow-500/80 backdrop-blur-xl border-0">
                <span className="text-white font-medium">{starRating}★</span>
              </Badge>
            )}
            {rating && (
              <Badge variant="secondary" className="bg-white/20 backdrop-blur-xl border-0">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                <span className="text-white font-medium">{Number(rating).toFixed(1)}</span>
                {reviewCount && <span className="text-white/70 ml-1">({reviewCount})</span>}
              </Badge>
            )}
            {isFeatured && (
              <Badge variant="secondary" className="bg-purple-500/80 backdrop-blur-xl border-0 text-white">
                Featured
              </Badge>
            )}
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">{name}</h1>
          <div className="flex items-center gap-1 text-white/80">
            <MapPin className="w-4 h-4" />
            <span>{city}{country ? \`, \${country}\` : ''}</span>
          </div>
        </div>
      </div>

      {/* Image thumbnails */}
      {images.length > 1 && (
        <div className="px-4 mt-3">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {images.slice(0, 5).map((img: string, index: number) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={\`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all \${selectedImage === index ? 'border-purple-400' : 'border-transparent'}\`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
            {images.length > 5 && (
              <button className="flex-shrink-0 w-16 h-16 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center">
                <span className="text-white text-sm">+{images.length - 5}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="px-4 mt-4">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
          <TabsList className="w-full bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl p-1">
            <TabsTrigger value="overview" className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-600 data-[state=active]:text-white text-gray-400">
              Overview
            </TabsTrigger>
            <TabsTrigger value="rooms" className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-600 data-[state=active]:text-white text-gray-400">
              Rooms
            </TabsTrigger>
            <TabsTrigger value="amenities" className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-600 data-[state=active]:text-white text-gray-400">
              Amenities
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4 space-y-4">
            {/* Quick Info */}
            <div className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl p-4">
              <div className="grid grid-cols-2 gap-4">
                {checkInTime && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Check-in</p>
                      <p className="text-white text-sm">{checkInTime}</p>
                    </div>
                  </div>
                )}
                {checkOutTime && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Check-out</p>
                      <p className="text-white text-sm">{checkOutTime}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {description && (
              <div className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl p-4">
                <h3 className="font-semibold text-white mb-2">About this hotel</h3>
                <p className="text-gray-300 text-sm leading-relaxed">{description}</p>
              </div>
            )}

            {/* Popular Amenities */}
            {amenities && amenities.length > 0 && (
              <div className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-white">Popular Amenities</h3>
                  <button onClick={() => setActiveTab('amenities')} className="text-cyan-400 text-sm flex items-center gap-1">
                    See all <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {amenities.slice(0, 6).map((amenity: string, i: number) => {
                    const IconComponent = amenityIcons[amenity.toLowerCase()] || Check;
                    return (
                      <div key={i} className="flex items-center gap-2 text-gray-300 text-sm">
                        <IconComponent className="w-4 h-4 text-cyan-400" />
                        <span>{amenity}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Location */}
            {(address || city) && (
              <div className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl p-4">
                <h3 className="font-semibold text-white mb-3">Location</h3>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    {address && <p className="text-white text-sm">{address}</p>}
                    <p className="text-gray-400 text-sm">{city}{country ? \`, \${country}\` : ''}</p>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="rooms" className="mt-4 space-y-4">
            {rooms && rooms.length > 0 ? (
              <div className="space-y-4">
                {rooms.map((room: any) => (
                  <div key={room.id} className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl overflow-hidden">
                    <div className="flex">
                      {room.images && room.images.length > 0 ? (
                        <img
                          src={Array.isArray(room.images) ? room.images[0] : room.images}
                          alt={room.name}
                          className="w-32 h-32 object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                          <Users className="w-8 h-8 text-white/50" />
                        </div>
                      )}
                      <div className="flex-1 p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-white">{room.name}</h4>
                            {room.room_type && (
                              <Badge className="mt-1 bg-purple-500/20 text-purple-300 border-0 text-xs">
                                {room.room_type}
                              </Badge>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-white font-bold">
                              {getCurrencySymbol(room.currency || currency)}{Number(room.price_per_night).toFixed(0)}
                            </p>
                            <p className="text-gray-400 text-xs">/night</p>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center gap-4 text-gray-400 text-sm">
                          {room.max_guests && (
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {room.max_guests} guests
                            </span>
                          )}
                          {room.bed_type && (
                            <span>{room.bed_type}</span>
                          )}
                          {room.size_sqm && (
                            <span>{room.size_sqm} m²</span>
                          )}
                        </div>
                        {room.is_available && (
                          <Button
                            onClick={() => navigate(\`/booking/room/\${room.id}?guests=\${guests}\`)}
                            className="mt-3 w-full bg-gradient-to-r from-purple-500 to-blue-600 text-white text-sm py-2"
                          >
                            Select Room
                          </Button>
                        )}
                        {!room.is_available && (
                          <p className="mt-3 text-center text-red-400 text-sm">Not Available</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl p-8 text-center">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-400">No rooms available</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="amenities" className="mt-4 space-y-4">
            {amenities && amenities.length > 0 ? (
              <div className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl p-4">
                <h3 className="font-semibold text-white mb-4">All Amenities</h3>
                <div className="grid grid-cols-2 gap-3">
                  {amenities.map((amenity: string, i: number) => {
                    const IconComponent = amenityIcons[amenity.toLowerCase()] || Check;
                    return (
                      <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                        <IconComponent className="w-5 h-5 text-cyan-400" />
                        <span className="text-white text-sm">{amenity}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl p-8 text-center">
                <p className="text-gray-400">No amenities information available</p>
              </div>
            )}
          </TabsContent>

        </Tabs>
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-white/10 p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <p className="text-gray-400 text-sm">From</p>
            <p className="text-white font-bold text-xl">
              {getCurrencySymbol(currency)}{Number(pricePerNight).toFixed(0)}
              <span className="text-gray-400 text-sm font-normal">/night</span>
            </p>
          </div>
          <Button
            onClick={handleBookNow}
            className="px-8 py-3 bg-gradient-to-r from-purple-500 to-blue-600 text-white font-semibold rounded-xl"
          >
            Book Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TravelHotelDetailPage;
    `,

    minimal: `
${commonImports}

interface HotelDetailPageProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const TravelHotelDetailPage: React.FC<HotelDetailPageProps> = ({
  ${dataName}: propData,
  className
}) => {
  const navigate = useNavigate();
  const hotelData = propData;

  const defaultHotel = {
    id: '1',
    name: 'Luxury Hotel & Spa',
    city: 'New York',
    country: 'USA',
    price_per_night: 299,
    currency: 'USD',
    cover_image: '',
    star_rating: 5,
  };

  let hotel: any = defaultHotel;
  if (hotelData?.id || hotelData?.name) {
    hotel = { ...defaultHotel, ...hotelData };
  }

  const name = ${getField('name')} || hotel.name;
  const city = ${getField('city')} || hotel.city;
  const pricePerNight = ${getField('price_per_night')} || hotel.price_per_night;
  const coverImage = ${getField('cover_image')} || hotel.cover_image;
  const starRating = ${getField('star_rating')} || hotel.star_rating;

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900", className)}>
      <div className="relative h-64">
        {coverImage ? (
          <img src={coverImage} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
            <MapPin className="w-12 h-12 text-white/50" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 bg-white/20 backdrop-blur-xl rounded-full"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </Button>
        <div className="absolute bottom-4 left-4">
          {starRating && <Badge className="bg-yellow-500 mb-2">{starRating}★</Badge>}
          <h1 className="text-2xl font-bold text-white">{name}</h1>
          <p className="text-white/80">{city}</p>
        </div>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-center">
          <p className="text-gray-600 dark:text-gray-300">\${pricePerNight}/night</p>
          <Button onClick={() => navigate('/booking')}>Book Now</Button>
        </div>
      </div>
    </div>
  );
};

export default TravelHotelDetailPage;
    `,

    enhanced: `
${commonImports}

interface HotelDetailPageProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const TravelHotelDetailPage: React.FC<HotelDetailPageProps> = ({
  ${dataName}: propData,
  className
}) => {
  const navigate = useNavigate();
  const { id } = useParams();
  ${useApiForData ? `
  const { data: apiData, isLoading } = useQuery({
    queryKey: ['hotel', id],
    queryFn: async () => {
      const route = '${apiRoutes.fetch}'.replace(':id', id || '');
      const response = await api.get<any>(route);
      return response.data?.data || response.data;
    },
    enabled: !!id
  });
  const hotelData = apiData || propData;` : `const hotelData = propData;`}

  const defaultHotel = {
    id: '1',
    destination_id: '',
    name: 'Luxury Hotel & Spa',
    description: 'Experience luxury at its finest.',
    address: '123 Main Street',
    city: 'New York',
    country: 'USA',
    latitude: 40.7128,
    longitude: -74.0060,
    star_rating: 5,
    price_per_night: 299,
    currency: 'USD',
    phone: '+1 234 567 8900',
    email: 'info@luxuryhotel.com',
    website: 'https://luxuryhotel.com',
    check_in_time: '14:00',
    check_out_time: '12:00',
    cover_image: '',
    is_featured: false,
    rating: 8.9,
    review_count: 1250,
    amenities: ['WiFi', 'Parking', 'Pool', 'Gym', 'Restaurant'],
  };

  let hotel: any = defaultHotel;
  if (hotelData?.id || hotelData?.name) {
    hotel = { ...defaultHotel, ...hotelData };
  } else if (hotelData?.data) {
    hotel = { ...defaultHotel, ...hotelData.data };
  }

  const name = ${getField('name')} || hotel.name;
  const description = ${getField('description')} || hotel.description;
  const city = ${getField('city')} || hotel.city;
  const country = ${getField('country')} || hotel.country;
  const address = ${getField('address')} || hotel.address;
  const starRating = ${getField('star_rating')} || hotel.star_rating;
  const pricePerNight = ${getField('price_per_night')} || hotel.price_per_night;
  const currency = ${getField('currency')} || hotel.currency;
  const phone = ${getField('phone')} || hotel.phone;
  const email = ${getField('email')} || hotel.email;
  const website = ${getField('website')} || hotel.website;
  const checkInTime = ${getField('check_in_time')} || hotel.check_in_time;
  const checkOutTime = ${getField('check_out_time')} || hotel.check_out_time;
  const coverImage = ${getField('cover_image')} || hotel.cover_image;
  const rating = hotel.rating;
  const amenities = hotel.amenities || [];

  const [isSaved, setIsSaved] = useState(false);

  const getCurrencySymbol = (curr: string) => {
    const symbols: Record<string, string> = { USD: '$', EUR: '€', GBP: '£', BDT: '৳' };
    return symbols[curr] || curr;
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    toast.success(isSaved ? 'Removed from wishlist' : 'Added to wishlist');
  };

  ${useApiForData ? `if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
      </div>
    );
  }` : ''}

  return (
    <div className={cn("min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pb-24", className)}>
      <div className="relative h-80">
        {coverImage || hotel.images?.[0] ? (
          <img src={coverImage || hotel.images[0]} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
            <MapPin className="w-16 h-16 text-white/50" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />

        <div className="absolute top-4 left-4 right-4 flex justify-between">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="bg-white/10 backdrop-blur-xl rounded-full">
            <ChevronLeft className="w-6 h-6 text-white" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleSave} className="bg-white/10 backdrop-blur-xl rounded-full">
            <Heart className={\`w-6 h-6 \${isSaved ? 'fill-red-500 text-red-500' : 'text-white'}\`} />
          </Button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex items-center gap-2 mb-2">
            {starRating && <Badge className="bg-yellow-500 border-0">{starRating}★</Badge>}
            {rating && (
              <Badge className="bg-white/20 backdrop-blur-xl border-0">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                {Number(rating).toFixed(1)}
              </Badge>
            )}
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">{name}</h1>
          <p className="text-white/80 flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {city}{country ? \`, \${country}\` : ''}
          </p>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {description && (
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6">
            <h3 className="text-xl font-semibold text-white mb-3">About</h3>
            <p className="text-gray-300 leading-relaxed">{description}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4">
            <Clock className="w-6 h-6 text-cyan-400 mb-2" />
            <p className="text-gray-400 text-sm">Check-in</p>
            <p className="text-white font-medium">{checkInTime}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4">
            <Clock className="w-6 h-6 text-purple-400 mb-2" />
            <p className="text-gray-400 text-sm">Check-out</p>
            <p className="text-white font-medium">{checkOutTime}</p>
          </div>
        </div>

        {amenities.length > 0 && (
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Amenities</h3>
            <div className="flex flex-wrap gap-2">
              {amenities.map((amenity: string, i: number) => (
                <Badge key={i} variant="secondary" className="bg-white/10 text-white border-0">
                  <Check className="w-3 h-3 mr-1" />
                  {amenity}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {(phone || email || website) && (
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Contact</h3>
            <div className="space-y-3">
              {phone && (
                <a href={\`tel:\${phone}\`} className="flex items-center gap-3 text-gray-300">
                  <Phone className="w-5 h-5 text-cyan-400" />
                  {phone}
                </a>
              )}
              {email && (
                <a href={\`mailto:\${email}\`} className="flex items-center gap-3 text-gray-300">
                  <Mail className="w-5 h-5 text-purple-400" />
                  {email}
                </a>
              )}
              {website && (
                <a href={website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-gray-300">
                  <Globe className="w-5 h-5 text-green-400" />
                  {website}
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-white/10 p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <p className="text-gray-400 text-sm">From</p>
            <p className="text-white font-bold text-xl">
              {getCurrencySymbol(currency)}{Number(pricePerNight).toFixed(0)}
              <span className="text-gray-400 text-sm font-normal">/night</span>
            </p>
          </div>
          <Button onClick={() => navigate('/booking')} className="px-8 py-3 bg-gradient-to-r from-purple-500 to-blue-600 text-white font-semibold rounded-xl">
            Book Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TravelHotelDetailPage;
    `
  };

  return variants[variant] || variants.standard;
};
