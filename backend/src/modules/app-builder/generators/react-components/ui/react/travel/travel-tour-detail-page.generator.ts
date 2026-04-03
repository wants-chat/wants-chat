import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateTravelTourDetailPage = (
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
    if (fieldName.match(/images|highlights|inclusions|exclusions|languages|itinerary/i)) {
      return `propData?.${fieldName} || ([] as any[])`;
    }
    // For scalar values - return empty string as fallback
    return `propData?.${fieldName} || ''`;
  };

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
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, MapPin, Calendar, Users, Clock, Star, Heart, Share2, Check, X, Camera, Globe, Mountain, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';${useApiForData ? `
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';` : ''}`;

  const variants = {
    standard: `
${commonImports}

interface TourDetailPageProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const TravelTourDetailPage: React.FC<TourDetailPageProps> = ({
  ${dataName}: propData,
  className
}) => {
  const navigate = useNavigate();
  const { id } = useParams();
  ${useApiForData ? `
  const { data: apiData, isLoading, error } = useQuery({
    queryKey: ['tour', id],
    queryFn: async () => {
      const route = '${apiRoutes.fetch}'.replace(':id', id || '');
      const response = await api.get<any>(route);
      return response.data?.data || response.data;
    },
    enabled: !!id
  });
  const tourData = apiData || propData;` : `
  const tourData = propData;`}

  // Default tour data - matches create form fields from catalog
  const defaultTour = {
    id: '1',
    name: 'Mountain Adventure Tour',
    description: 'Experience the breathtaking mountain landscapes and local culture in this unforgettable adventure tour.',
    short_description: 'An unforgettable mountain adventure',
    duration_days: 5,
    duration_nights: 4,
    tour_type: 'adventure',
    difficulty_level: 'moderate',
    group_size_min: 2,
    group_size_max: 12,
    price: 599,
    currency: 'USD',
    cover_image: '',
    is_featured: false,
    is_active: true,
    rating: 4.8,
    review_count: 124,
    images: [],
    highlights: ['Professional guide', 'Scenic routes', 'Local cuisine', 'Cultural experiences'],
    inclusions: ['Accommodation', 'Transportation', 'Breakfast & Dinner', 'Entry fees'],
    exclusions: ['International flights', 'Travel insurance', 'Personal expenses', 'Tips'],
    itinerary: '',
    start_location: 'City Center',
    end_location: 'City Center',
    languages: ['English', 'Spanish'],
  };

  let tour: any = defaultTour;
  const sourceData = tourData;
  if (sourceData) {
    if (sourceData.id || sourceData.name) {
      tour = { ...defaultTour, ...sourceData };
    } else if (sourceData.data) {
      tour = { ...defaultTour, ...sourceData.data };
    }
  }

  // Field mappings from catalog
  const name = ${getField('name')} || tour.name;
  const description = ${getField('description')} || tour.description;
  const shortDescription = ${getField('short_description')} || tour.short_description;
  const durationDays = ${getField('duration_days')} || tour.duration_days;
  const durationNights = ${getField('duration_nights')} || tour.duration_nights;
  const tourType = ${getField('tour_type')} || tour.tour_type;
  const difficultyLevel = ${getField('difficulty_level')} || tour.difficulty_level;
  const groupSizeMin = ${getField('group_size_min')} || tour.group_size_min;
  const groupSizeMax = ${getField('group_size_max')} || tour.group_size_max;
  const price = ${getField('price')} || tour.price;
  const currency = ${getField('currency')} || tour.currency;
  const coverImage = ${getField('cover_image')} || tour.cover_image;
  const isFeatured = ${getField('is_featured')} || tour.is_featured;
  const isActive = ${getField('is_active')} || tour.is_active;
  const rating = tour.rating;
  const reviewCount = tour.review_count;

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

  const highlights = parseArrayField(tour.highlights);
  const inclusions = parseArrayField(tour.price_includes || tour.inclusions);
  const exclusions = parseArrayField(tour.price_excludes || tour.exclusions);
  const languages = parseArrayField(tour.languages);
  const startLocation = tour.start_location || '';

  // Parse itinerary - can be string, JSON string, or array of day objects
  const parseItinerary = (value: any): Array<{ day: number; title?: string; description: string }> => {
    if (!value) return [];
    if (Array.isArray(value)) {
      return value.map((item, idx) => {
        if (typeof item === 'string') {
          return { day: idx + 1, description: item };
        }
        return { day: item.day || idx + 1, title: item.title, description: item.description || item.activities || '' };
      });
    }
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          return parsed.map((item, idx) => {
            if (typeof item === 'string') {
              return { day: idx + 1, description: item };
            }
            return { day: item.day || idx + 1, title: item.title, description: item.description || item.activities || '' };
          });
        }
        return [];
      } catch {
        // Plain text itinerary - split by newlines or return as single item
        const lines = value.split('\\n').filter(Boolean);
        if (lines.length > 1) {
          return lines.map((line, idx) => ({ day: idx + 1, description: line }));
        }
        return value ? [{ day: 1, description: value }] : [];
      }
    }
    return [];
  };

  const itineraryDays = parseItinerary(tour.itinerary);

  const [isSaved, setIsSaved] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState<'overview' | 'itinerary' | 'inclusions'>('overview');
  const [participants, setParticipants] = useState(2);

  const rawImages = parseArrayField(tour.images);
  const images = rawImages.length > 0 ? rawImages : (coverImage ? [coverImage] : []);

  const getCurrencySymbol = (curr: string) => {
    const symbols: Record<string, string> = { USD: '$', EUR: '€', GBP: '£', BDT: '৳' };
    return symbols[curr] || curr;
  };

  const getDifficultyColor = (level: string) => {
    const colors: Record<string, string> = {
      easy: 'bg-green-500/20 text-green-400',
      moderate: 'bg-yellow-500/20 text-yellow-400',
      challenging: 'bg-orange-500/20 text-orange-400',
      difficult: 'bg-red-500/20 text-red-400'
    };
    return colors[level] || 'bg-gray-500/20 text-gray-400';
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    toast.success(isSaved ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: name, text: shortDescription || description, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  const handleBookNow = () => {
    toast.success('Proceeding to booking...');
    navigate(\`/booking/tour/\${tour.id}\`);
  };

  ${useApiForData ? `
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
        <p className="text-xl mb-4">Failed to load tour</p>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }` : ''}

  return (
    <div className={cn("min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pb-24", className)}>
      {/* Header with Image */}
      <div className="relative h-72">
        {images.length > 0 ? (
          <img src={images[selectedImage]} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
            <Mountain className="w-16 h-16 text-white/50" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />

        <div className="absolute top-4 left-4 right-4 flex justify-between">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-full hover:bg-white/20">
            <ChevronLeft className="w-6 h-6 text-white" />
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={handleSave} className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-full hover:bg-white/20">
              <Heart className={\`w-6 h-6 \${isSaved ? 'fill-red-500 text-red-500' : 'text-white'}\`} />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleShare} className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-full hover:bg-white/20">
              <Share2 className="w-6 h-6 text-white" />
            </Button>
          </div>
        </div>

        {images.length > 1 && (
          <div className="absolute bottom-20 right-4 bg-black/50 backdrop-blur-xl px-3 py-1 rounded-full">
            <span className="text-white text-sm">{selectedImage + 1}/{images.length}</span>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {rating && (
              <Badge variant="secondary" className="bg-white/20 backdrop-blur-xl border-0">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                <span className="text-white font-medium">{Number(rating).toFixed(1)}</span>
                {reviewCount && <span className="text-white/70 ml-1">({reviewCount})</span>}
              </Badge>
            )}
            {isFeatured && (
              <Badge variant="secondary" className="bg-orange-500/80 backdrop-blur-xl border-0 text-white">Featured</Badge>
            )}
            {difficultyLevel && (
              <Badge variant="secondary" className={\`backdrop-blur-xl border-0 \${getDifficultyColor(difficultyLevel)}\`}>
                {difficultyLevel.charAt(0).toUpperCase() + difficultyLevel.slice(1)}
              </Badge>
            )}
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">{name}</h1>
          {shortDescription && <p className="text-white/70 text-sm mb-2">{shortDescription}</p>}
          <div className="flex items-center gap-4 text-white/80 text-sm flex-wrap">
            {(durationDays || durationNights) && (
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {durationDays} days{durationNights ? \` / \${durationNights} nights\` : ''}
              </span>
            )}
            {groupSizeMax && (
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {groupSizeMin || 1}-{groupSizeMax} people
              </span>
            )}
            {startLocation && (
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {startLocation}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Image thumbnails */}
      {images.length > 1 && (
        <div className="px-4 mt-3">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {images.slice(0, 5).map((img: string, index: number) => (
              <button key={index} onClick={() => setSelectedImage(index)}
                className={\`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all \${selectedImage === index ? 'border-orange-400' : 'border-transparent'}\`}>
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
            <TabsTrigger value="overview" className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white text-gray-400">
              Overview
            </TabsTrigger>
            <TabsTrigger value="itinerary" className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white text-gray-400">
              Itinerary
            </TabsTrigger>
            <TabsTrigger value="inclusions" className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white text-gray-400">
              Details
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4 space-y-4">
            {/* Quick Info */}
            <div className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl p-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Duration</p>
                    <p className="text-white text-sm">{durationDays || 1} days{durationNights ? \` / \${durationNights} nights\` : ''}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Group Size</p>
                    <p className="text-white text-sm">{groupSizeMin || 1}-{groupSizeMax || '?'} people</p>
                  </div>
                </div>
                {languages.length > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center">
                      <Globe className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Languages</p>
                      <p className="text-white text-sm">{languages.join(', ')}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center">
                    <Camera className="w-5 h-5 text-pink-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Tour Type</p>
                    <p className="text-white text-sm capitalize">{tourType || '-'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            {description && (
              <div className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl p-4">
                <h3 className="font-semibold text-white mb-2">About this tour</h3>
                <p className="text-gray-300 text-sm leading-relaxed">{description}</p>
              </div>
            )}

            {/* Highlights */}
            {highlights.length > 0 && (
              <div className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl p-4">
                <h3 className="font-semibold text-white mb-3">Highlights</h3>
                <div className="space-y-2">
                  {highlights.map((highlight: string, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-gray-300 text-sm">
                      <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <span>{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Participants selector */}
            <div className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl p-4">
              <h3 className="font-semibold text-white mb-3">Select Participants</h3>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Number of travelers</span>
                <div className="flex items-center gap-3">
                  <button onClick={() => setParticipants(Math.max(groupSizeMin || 1, participants - 1))} className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white">-</button>
                  <span className="text-white w-6 text-center">{participants}</span>
                  <button onClick={() => setParticipants(Math.min(groupSizeMax || 15, participants + 1))} className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white">+</button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="itinerary" className="mt-4 space-y-4">
            <div className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl p-4">
              <h3 className="font-semibold text-white mb-4">Day by Day Itinerary</h3>
              {itineraryDays.length > 0 ? (
                <div className="space-y-4">
                  {itineraryDays.map((dayItem, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold">{dayItem.day}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium">{dayItem.title || \`Day \${dayItem.day}\`}</p>
                        <p className="text-gray-300 text-sm mt-1">{dayItem.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-400">No itinerary details available yet</p>
                  <p className="text-gray-500 text-sm mt-1">Contact us for the detailed day-by-day schedule</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="inclusions" className="mt-4 space-y-4">
            {/* Inclusions */}
            <div className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl p-4">
              <h3 className="font-semibold text-white mb-3">What's Included</h3>
              {inclusions.length > 0 ? (
                <div className="space-y-2">
                  {inclusions.map((item: string, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-gray-300 text-sm">
                      <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">Contact us for details about what's included</p>
              )}
            </div>

            {/* Exclusions */}
            <div className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl p-4">
              <h3 className="font-semibold text-white mb-3">What's Not Included</h3>
              {exclusions.length > 0 ? (
                <div className="space-y-2">
                  {exclusions.map((item: string, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-gray-300 text-sm">
                      <X className="w-4 h-4 text-red-400 flex-shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">Contact us for details about exclusions</p>
              )}
            </div>
          </TabsContent>

        </Tabs>
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-white/10 p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <p className="text-gray-400 text-sm">Total ({participants} traveler{participants > 1 ? 's' : ''})</p>
            <p className="text-white font-bold text-xl">
              {getCurrencySymbol(currency)}{(Number(price) * participants).toFixed(0)}
            </p>
          </div>
          <Button onClick={handleBookNow} className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl">
            Book Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TravelTourDetailPage;
    `,

    minimal: `
${commonImports}

interface TourDetailPageProps {
  ${dataName}?: any;
  className?: string;
}

const TravelTourDetailPage: React.FC<TourDetailPageProps> = ({ ${dataName}: propData, className }) => {
  const navigate = useNavigate();
  const tour = propData || {
    name: 'Mountain Adventure', duration_days: 5, price: 599, currency: 'USD', rating: 4.8
  };

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900", className)}>
      <div className="p-4">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4"><ChevronLeft className="w-4 h-4 mr-2" />Back</Button>
        <h1 className="text-2xl font-bold">{tour.name}</h1>
        <div className="flex items-center gap-4 mt-2 text-gray-600">
          <span>{tour.duration_days} days</span>
          {tour.rating && <span className="flex items-center gap-1"><Star className="w-4 h-4 fill-yellow-400" />{tour.rating}</span>}
        </div>
        <div className="mt-4 flex justify-between items-center">
          <span className="text-xl font-bold">\${tour.price}</span>
          <Button onClick={() => navigate('/booking')}>Book Now</Button>
        </div>
      </div>
    </div>
  );
};

export default TravelTourDetailPage;
    `,

    enhanced: `
${commonImports}

interface TourDetailPageProps {
  ${dataName}?: any;
  className?: string;
}

const TravelTourDetailPage: React.FC<TourDetailPageProps> = ({ ${dataName}: propData, className }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  ${useApiForData ? `
  const { data: apiData, isLoading } = useQuery({
    queryKey: ['tour', id],
    queryFn: async () => {
      const route = '${apiRoutes.fetch}'.replace(':id', id || '');
      const response = await api.get<any>(route);
      return response.data?.data || response.data;
    },
    enabled: !!id
  });
  const tourData = apiData || propData;` : `const tourData = propData;`}

  const defaultTour = {
    id: '1', name: 'Mountain Adventure Tour', description: 'Experience breathtaking landscapes.',
    short_description: 'An unforgettable adventure', duration_days: 5, duration_nights: 4,
    tour_type: 'adventure', difficulty_level: 'moderate', group_size_min: 2, group_size_max: 12,
    price: 599, currency: 'USD', cover_image: '', is_featured: false, rating: 4.8, review_count: 124,
    highlights: ['Professional guide', 'Scenic routes'], inclusions: ['Accommodation', 'Meals'],
    exclusions: ['Flights', 'Insurance'],
  };

  let tour = { ...defaultTour };
  if (tourData?.id || tourData?.name) {
    tour = { ...defaultTour, ...tourData };
  } else if (tourData?.data) {
    tour = { ...defaultTour, ...tourData.data };
  }

  const [isSaved, setIsSaved] = useState(false);
  const getCurrencySymbol = (c: string) => ({ USD: '$', EUR: '€', GBP: '£', BDT: '৳' }[c] || c);

  ${useApiForData ? `if (isLoading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400"></div></div>;` : ''}

  return (
    <div className={cn("min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pb-24", className)}>
      <div className="relative h-72 bg-gradient-to-br from-orange-500 to-red-600">
        {tour.cover_image && <img src={tour.cover_image} alt={tour.name} className="absolute inset-0 w-full h-full object-cover" />}
        <div className="absolute inset-0 bg-black/40" />
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="absolute top-4 left-4 bg-white/10 backdrop-blur-xl rounded-full">
          <ChevronLeft className="w-6 h-6 text-white" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => { setIsSaved(!isSaved); toast.success(isSaved ? 'Removed' : 'Saved'); }} className="absolute top-4 right-4 bg-white/10 backdrop-blur-xl rounded-full">
          <Heart className={\`w-6 h-6 \${isSaved ? 'fill-red-500 text-red-500' : 'text-white'}\`} />
        </Button>
        <div className="absolute bottom-4 left-4 right-4">
          <h1 className="text-2xl font-bold text-white">{tour.name}</h1>
          {tour.short_description && <p className="text-white/70 text-sm">{tour.short_description}</p>}
          <div className="flex items-center gap-3 mt-2 text-white/80 text-sm">
            <span><Calendar className="w-4 h-4 inline mr-1" />{tour.duration_days} days / {tour.duration_nights} nights</span>
            {tour.rating && <span><Star className="w-4 h-4 inline mr-1 fill-yellow-400 text-yellow-400" />{tour.rating}</span>}
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {tour.description && (
          <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4">
            <h3 className="text-white font-semibold mb-2">About</h3>
            <p className="text-gray-300 text-sm">{tour.description}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4">
            <Users className="w-6 h-6 text-cyan-400 mb-2" />
            <p className="text-gray-400 text-xs">Group Size</p>
            <p className="text-white">{tour.group_size_min}-{tour.group_size_max}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4">
            <Mountain className="w-6 h-6 text-orange-400 mb-2" />
            <p className="text-gray-400 text-xs">Difficulty</p>
            <p className="text-white capitalize">{tour.difficulty_level}</p>
          </div>
        </div>

        {tour.highlights?.length > 0 && (
          <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4">
            <h3 className="text-white font-semibold mb-3">Highlights</h3>
            {tour.highlights.map((h: string, i: number) => (
              <div key={i} className="flex items-center gap-2 text-gray-300 text-sm mb-1">
                <Check className="w-4 h-4 text-green-400" />{h}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-white/10 p-4">
        <div className="flex justify-between items-center">
          <p className="text-white font-bold text-xl">{getCurrencySymbol(tour.currency)}{tour.price}<span className="text-gray-400 text-sm">/person</span></p>
          <Button onClick={() => navigate('/booking')} className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl">Book</Button>
        </div>
      </div>
    </div>
  );
};

export default TravelTourDetailPage;
    `
  };

  return variants[variant] || variants.standard;
};
