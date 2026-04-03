import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateTravelDestinationDetailPage = (
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
    if (fieldName.match(/images|tags|popular_attractions|activities|highlights|amenities/i)) {
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
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, MapPin, Globe, DollarSign, Languages, Heart, Share2, Star, Thermometer, Building2, Compass, Plane } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';${useApiForData ? `
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';` : ''}`;

  const variants = {
    standard: `
${commonImports}

interface DestinationDetailPageProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const TravelDestinationDetailPage: React.FC<DestinationDetailPageProps> = ({
  ${dataName}: propData,
  className
}) => {
  const navigate = useNavigate();
  const { id } = useParams();
  ${useApiForData ? `
  // Fetch destination from API
  const { data: apiData, isLoading, error } = useQuery({
    queryKey: ['destination', id],
    queryFn: async () => {
      const route = '${apiRoutes.fetch}'.replace(':id', id || '');
      const response = await api.get<any>(route);
      return response.data?.data || response.data;
    },
    enabled: !!id
  });

  // Use API data or prop data
  const destinationData = apiData || propData;` : `
  const destinationData = propData;`}

  // Default destination data - matches create form fields from catalog
  const defaultDestination = {
    id: '1',
    name: 'Paris',
    country: 'France',
    region: 'Europe',
    description: 'The City of Light, known for its iconic Eiffel Tower, world-class museums, charming cafes, and romantic atmosphere.',
    short_description: 'The romantic capital of France',
    latitude: 48.8566,
    longitude: 2.3522,
    timezone: 'CET (UTC+1)',
    currency: 'EUR',
    language: 'French',
    best_time_to_visit: 'April - June, Sept - Nov',
    images: [],
    cover_image: '',
    rating: 4.8,
    is_featured: false,
    tags: ['Romantic', 'Cultural', 'Historic'],
    popular_attractions: ['Eiffel Tower', 'Louvre Museum', 'Notre-Dame', 'Champs-Élysées'],
    weather_info: 'Mild climate with warm summers and cool winters',
    visa_requirements: 'Schengen visa for most nationalities',
  };

  // Extract destination from various possible data structures
  let destination: any = defaultDestination;
  const sourceData = destinationData;

  if (sourceData) {
    if (sourceData.id || sourceData.name) {
      destination = { ...defaultDestination, ...sourceData };
    } else if (sourceData.data) {
      if (sourceData.data.id || sourceData.data.name) {
        destination = { ...defaultDestination, ...sourceData.data };
      }
    }
  }

  // Field mappings from catalog
  const name = ${getField('name')} || destination.name;
  const country = ${getField('country')} || destination.country;
  const region = ${getField('region')} || destination.region;
  const description = ${getField('description')} || destination.description;
  const shortDescription = ${getField('short_description')} || destination.short_description;
  const latitude = ${getField('latitude')} || destination.latitude;
  const longitude = ${getField('longitude')} || destination.longitude;
  const timezone = ${getField('timezone')} || destination.timezone;
  const currency = ${getField('currency')} || destination.currency;
  const language = ${getField('language')} || destination.language;
  const bestTimeToVisit = ${getField('best_time_to_visit')} || destination.best_time_to_visit;
  const coverImage = ${getField('cover_image')} || destination.cover_image;
  const rating = ${getField('rating')} || destination.rating;
  const isFeatured = ${getField('is_featured')} || destination.is_featured;
  // Safely parse array fields - handle string, JSON string, or array
  const parseArrayField = (value: any): string[] => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        // If not JSON, treat as comma-separated string
        return value.split(',').map((s: string) => s.trim()).filter(Boolean);
      }
    }
    return [];
  };

  const tags = parseArrayField(destination.tags);

  const [isSaved, setIsSaved] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  const rawImages = parseArrayField(destination.images);
  const images = rawImages.length > 0 ? rawImages : (coverImage ? [coverImage] : []);

  // Event handlers
  const handleSave = () => {
    setIsSaved(!isSaved);
    toast.success(isSaved ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: name,
        text: shortDescription || description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  const handleFindHotels = () => {
    navigate(\`/hotels?destination=\${destination.id}\`);
  };

  const handleBookFlights = () => {
    navigate(\`/flights?destination=\${destination.id}\`);
  };

  const handleViewTours = () => {
    navigate(\`/tours?destination=\${destination.id}\`);
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
        <p className="text-xl mb-4">Failed to load destination</p>
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
          <div className="w-full h-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
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

        {/* Destination info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-center gap-2 mb-2">
            {rating && (
              <Badge variant="secondary" className="bg-white/20 backdrop-blur-xl border-0">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                <span className="text-white font-medium">{Number(rating).toFixed(1)}</span>
              </Badge>
            )}
            {isFeatured && (
              <Badge variant="secondary" className="bg-cyan-500/80 backdrop-blur-xl border-0 text-white">
                Featured
              </Badge>
            )}
            {tags?.slice(0, 2).map((tag: string, index: number) => (
              <Badge key={index} variant="secondary" className="bg-white/20 backdrop-blur-xl border-0 text-white text-xs">
                {tag}
              </Badge>
            ))}
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">{name}</h1>
          <div className="flex items-center gap-1 text-white/80">
            <MapPin className="w-4 h-4" />
            <span>{country}{region ? \`, \${region}\` : ''}</span>
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
                className={\`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all \${selectedImage === index ? 'border-cyan-400' : 'border-transparent'}\`}
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

      {/* Content */}
      <div className="px-4 mt-4 space-y-4">
        {/* Description */}
        {description && (
          <div className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl p-4">
            <h3 className="font-semibold text-white mb-2">About {name}</h3>
            <p className="text-gray-300 text-sm leading-relaxed">{description}</p>
          </div>
        )}

        {/* Quick Info */}
        <div className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl p-4">
          <h3 className="font-semibold text-white mb-3">Essential Info</h3>
          <div className="grid grid-cols-2 gap-4">
            {language && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center">
                  <Languages className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Language</p>
                  <p className="text-white">{language}</p>
                </div>
              </div>
            )}
            {currency && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Currency</p>
                  <p className="text-white">{currency}</p>
                </div>
              </div>
            )}
            {bestTimeToVisit && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center">
                  <Thermometer className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Best Time</p>
                  <p className="text-white text-sm">{bestTimeToVisit}</p>
                </div>
              </div>
            )}
            {rating && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center">
                  <Star className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Rating</p>
                  <p className="text-white">{Number(rating).toFixed(1)}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3">
          <Button
            variant="ghost"
            onClick={handleFindHotels}
            className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl p-4 h-auto flex flex-col items-center gap-2 hover:bg-white/20"
          >
            <Building2 className="w-6 h-6 text-purple-400" />
            <span className="text-white text-xs">Find Hotels</span>
          </Button>
          <Button
            variant="ghost"
            onClick={handleBookFlights}
            className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl p-4 h-auto flex flex-col items-center gap-2 hover:bg-white/20"
          >
            <Plane className="w-6 h-6 text-blue-400" />
            <span className="text-white text-xs">Book Flights</span>
          </Button>
          <Button
            variant="ghost"
            onClick={handleViewTours}
            className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl p-4 h-auto flex flex-col items-center gap-2 hover:bg-white/20"
          >
            <Compass className="w-6 h-6 text-orange-400" />
            <span className="text-white text-xs">Join Tours</span>
          </Button>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-white/10 p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <p className="text-white font-semibold">{name}</p>
            <p className="text-gray-400 text-sm">{country}</p>
          </div>
          <Button
            onClick={handleFindHotels}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl flex items-center gap-2"
          >
            <Building2 className="w-5 h-5" />
            Find Hotels
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TravelDestinationDetailPage;
    `,

    minimal: `
${commonImports}

interface DestinationDetailPageProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const TravelDestinationDetailPage: React.FC<DestinationDetailPageProps> = ({
  ${dataName}: propData,
  className
}) => {
  const navigate = useNavigate();
  const destinationData = propData;

  const defaultDestination = {
    id: '1',
    name: 'Paris',
    country: 'France',
    description: 'The City of Light',
    cover_image: '',
    rating: 4.8,
  };

  let destination: any = defaultDestination;
  if (destinationData?.id || destinationData?.name) {
    destination = { ...defaultDestination, ...destinationData };
  }

  const name = ${getField('name')} || destination.name;
  const country = ${getField('country')} || destination.country;
  const description = ${getField('description')} || destination.description;
  const coverImage = ${getField('cover_image')} || destination.cover_image;
  const rating = ${getField('rating')} || destination.rating;

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900", className)}>
      <div className="relative h-64">
        {coverImage ? (
          <img src={coverImage} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
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
          <h1 className="text-2xl font-bold text-white">{name}</h1>
          <p className="text-white/80">{country}</p>
        </div>
      </div>
      <div className="p-4">
        <p className="text-gray-600 dark:text-gray-300">{description}</p>
        {rating && (
          <div className="flex items-center gap-1 mt-4">
            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold">{Number(rating).toFixed(1)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TravelDestinationDetailPage;
    `,

    enhanced: `
${commonImports}

interface DestinationDetailPageProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const TravelDestinationDetailPage: React.FC<DestinationDetailPageProps> = ({
  ${dataName}: propData,
  className
}) => {
  const navigate = useNavigate();
  const { id } = useParams();
  ${useApiForData ? `
  const { data: apiData, isLoading } = useQuery({
    queryKey: ['destination', id],
    queryFn: async () => {
      const route = '${apiRoutes.fetch}'.replace(':id', id || '');
      const response = await api.get<any>(route);
      return response.data?.data || response.data;
    },
    enabled: !!id
  });
  const destinationData = apiData || propData;` : `const destinationData = propData;`}

  const defaultDestination = {
    id: '1',
    name: 'Paris',
    country: 'France',
    region: 'Europe',
    description: 'The City of Light, known for its iconic Eiffel Tower, world-class museums, charming cafes, and romantic atmosphere.',
    short_description: 'The romantic capital of France',
    latitude: 48.8566,
    longitude: 2.3522,
    timezone: 'CET (UTC+1)',
    currency: 'EUR',
    language: 'French',
    best_time_to_visit: 'April - June, Sept - Nov',
    images: [],
    cover_image: '',
    rating: 4.8,
    is_featured: false,
    tags: ['Romantic', 'Cultural', 'Historic'],
    popular_attractions: ['Eiffel Tower', 'Louvre Museum', 'Notre-Dame', 'Champs-Élysées'],
  };

  let destination: any = defaultDestination;
  if (destinationData?.id || destinationData?.name) {
    destination = { ...defaultDestination, ...destinationData };
  } else if (destinationData?.data) {
    destination = { ...defaultDestination, ...destinationData.data };
  }

  const name = ${getField('name')} || destination.name;
  const country = ${getField('country')} || destination.country;
  const region = ${getField('region')} || destination.region;
  const description = ${getField('description')} || destination.description;
  const coverImage = ${getField('cover_image')} || destination.cover_image;
  const rating = ${getField('rating')} || destination.rating;
  const language = ${getField('language')} || destination.language;
  const currency = ${getField('currency')} || destination.currency;
  const timezone = ${getField('timezone')} || destination.timezone;
  const bestTimeToVisit = ${getField('best_time_to_visit')} || destination.best_time_to_visit;

  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    setIsSaved(!isSaved);
    toast.success(isSaved ? 'Removed from wishlist' : 'Added to wishlist');
  };

  ${useApiForData ? `if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
      </div>
    );
  }` : ''}

  return (
    <div className={cn("min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900", className)}>
      <div className="relative h-80">
        {coverImage || destination.images?.[0] ? (
          <img src={coverImage || destination.images[0]} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
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
            {rating && (
              <Badge className="bg-white/20 backdrop-blur-xl border-0">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                {Number(rating).toFixed(1)}
              </Badge>
            )}
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">{name}</h1>
          <p className="text-white/80 flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {country}{region ? \`, \${region}\` : ''}
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
          {language && (
            <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4">
              <Languages className="w-6 h-6 text-cyan-400 mb-2" />
              <p className="text-gray-400 text-sm">Language</p>
              <p className="text-white font-medium">{language}</p>
            </div>
          )}
          {currency && (
            <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4">
              <DollarSign className="w-6 h-6 text-green-400 mb-2" />
              <p className="text-gray-400 text-sm">Currency</p>
              <p className="text-white font-medium">{currency}</p>
            </div>
          )}
          {timezone && (
            <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4">
              <Clock className="w-6 h-6 text-purple-400 mb-2" />
              <p className="text-gray-400 text-sm">Timezone</p>
              <p className="text-white font-medium">{timezone}</p>
            </div>
          )}
          {bestTimeToVisit && (
            <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4">
              <Calendar className="w-6 h-6 text-orange-400 mb-2" />
              <p className="text-gray-400 text-sm">Best Time</p>
              <p className="text-white font-medium text-sm">{bestTimeToVisit}</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Button onClick={() => navigate('/hotels')} className="bg-white/10 hover:bg-white/20 text-white flex flex-col h-auto py-4">
            <Building2 className="w-6 h-6 mb-2 text-purple-400" />
            <span className="text-xs">Hotels</span>
          </Button>
          <Button onClick={() => navigate('/flights')} className="bg-white/10 hover:bg-white/20 text-white flex flex-col h-auto py-4">
            <Plane className="w-6 h-6 mb-2 text-blue-400" />
            <span className="text-xs">Flights</span>
          </Button>
          <Button onClick={() => navigate('/tours')} className="bg-white/10 hover:bg-white/20 text-white flex flex-col h-auto py-4">
            <Compass className="w-6 h-6 mb-2 text-orange-400" />
            <span className="text-xs">Tours</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TravelDestinationDetailPage;
    `
  };

  return variants[variant] || variants.standard;
};
