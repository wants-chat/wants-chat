import React, { useState, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  Star, 
  DollarSign, 
  Calendar, 
  Thermometer,
  Clock,
  Globe,
  Filter,
  Heart,
  Camera,
  Info,
  ChevronRight
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useDestinations } from '../../hooks/useServices';
import type { Destination } from '../../services/travelService';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorDisplay from '../ui/ErrorDisplay';

interface TravelDestinationSearchProps {
  onDestinationSelect?: (destination: Destination) => void;
  className?: string;
}

const TravelDestinationSearch: React.FC<TravelDestinationSearchProps> = ({
  onDestinationSelect,
  className = ''
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [costLevelFilter, setCostLevelFilter] = useState('');
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);

  // Fetch destinations with search parameters
  const { 
    data: destinations, 
    isLoading, 
    error,
    refetch 
  } = useDestinations({
    search: searchQuery,
    country: countryFilter,
    region: regionFilter
  });

  // Filter destinations based on cost level
  const filteredDestinations = destinations?.filter(dest => {
    if (!costLevelFilter) return true;
    return dest.costLevel === costLevelFilter;
  }) || [];

  // Get unique countries and regions for filters
  const uniqueCountries = [...new Set(destinations?.map(dest => dest.country) || [])];
  const uniqueRegions = [...new Set(destinations?.map(dest => dest.region).filter(Boolean) || [])];

  const handleDestinationClick = (destination: Destination) => {
    setSelectedDestination(destination);
    onDestinationSelect?.(destination);
  };

  const getCostLevelColor = (costLevel: Destination['costLevel']) => {
    switch (costLevel) {
      case 'budget':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'expensive':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'luxury':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getCostLevelIcon = (costLevel: Destination['costLevel']) => {
    switch (costLevel) {
      case 'budget':
        return '$';
      case 'moderate':
        return '$$';
      case 'expensive':
        return '$$$';
      case 'luxury':
        return '$$$$';
      default:
        return '$';
    }
  };

  if (error) {
    return (
      <div className={className}>
        <ErrorDisplay 
          message="Failed to load destinations" 
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold mb-2">Discover Destinations</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Explore amazing destinations for your next adventure
        </p>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search destinations, cities, or countries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select value={countryFilter} onValueChange={setCountryFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Countries</SelectItem>
              {uniqueCountries.map(country => (
                <SelectItem key={country} value={country}>{country}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={regionFilter} onValueChange={setRegionFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Regions</SelectItem>
              {uniqueRegions.map(region => region && (
                <SelectItem key={region} value={region}>{region}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={costLevelFilter} onValueChange={setCostLevelFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by cost" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Price Ranges</SelectItem>
              <SelectItem value="budget">Budget ($)</SelectItem>
              <SelectItem value="moderate">Moderate ($$)</SelectItem>
              <SelectItem value="expensive">Expensive ($$$)</SelectItem>
              <SelectItem value="luxury">Luxury ($$$$)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Active Filters */}
        {(searchQuery || countryFilter || regionFilter || costLevelFilter) && (
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Filters:</span>
            {searchQuery && (
              <Badge variant="secondary" className="gap-1">
                Search: "{searchQuery}"
                <button
                  onClick={() => setSearchQuery('')}
                  className="ml-1 hover:text-red-500"
                >
                  ×
                </button>
              </Badge>
            )}
            {countryFilter && (
              <Badge variant="secondary" className="gap-1">
                Country: {countryFilter}
                <button
                  onClick={() => setCountryFilter('')}
                  className="ml-1 hover:text-red-500"
                >
                  ×
                </button>
              </Badge>
            )}
            {regionFilter && (
              <Badge variant="secondary" className="gap-1">
                Region: {regionFilter}
                <button
                  onClick={() => setRegionFilter('')}
                  className="ml-1 hover:text-red-500"
                >
                  ×
                </button>
              </Badge>
            )}
            {costLevelFilter && (
              <Badge variant="secondary" className="gap-1">
                Cost: {costLevelFilter}
                <button
                  onClick={() => setCostLevelFilter('')}
                  className="ml-1 hover:text-red-500"
                >
                  ×
                </button>
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setCountryFilter('');
                setRegionFilter('');
                setCostLevelFilter('');
              }}
              className="h-6 px-2 text-xs"
            >
              Clear All
            </Button>
          </div>
        )}
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="large" />
        </div>
      ) : filteredDestinations.length === 0 ? (
        <Card className="p-8 text-center">
          <Globe className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold mb-2">No destinations found</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Try adjusting your search criteria to find more destinations
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDestinations.map((destination) => (
            <DestinationCard
              key={destination.id}
              destination={destination}
              onClick={() => handleDestinationClick(destination)}
              isSelected={selectedDestination?.id === destination.id}
            />
          ))}
        </div>
      )}

      {/* Selected Destination Details */}
      {selectedDestination && (
        <DestinationDetail 
          destination={selectedDestination}
          onClose={() => setSelectedDestination(null)}
        />
      )}
    </div>
  );
};

// Destination Card Component
interface DestinationCardProps {
  destination: Destination;
  onClick: () => void;
  isSelected?: boolean;
}

const DestinationCard: React.FC<DestinationCardProps> = ({
  destination,
  onClick,
  isSelected = false
}) => {
  const getCostLevelColor = (costLevel: Destination['costLevel']) => {
    switch (costLevel) {
      case 'budget':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'expensive':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'luxury':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getCostLevelIcon = (costLevel: Destination['costLevel']) => {
    switch (costLevel) {
      case 'budget': return '$';
      case 'moderate': return '$$';
      case 'expensive': return '$$$';
      case 'luxury': return '$$$$';
      default: return '$';
    }
  };

  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${
        isSelected ? 'ring-2 ring-primary' : ''
      }`}
      onClick={onClick}
    >
      <div className="relative">
        {destination.images && destination.images.length > 0 ? (
          <div className="h-48 rounded-t-lg overflow-hidden">
            <img 
              src={destination.images[0]} 
              alt={destination.name}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="h-48 bg-gradient-to-r from-primary/20 to-primary/10 rounded-t-lg flex items-center justify-center">
            <Camera className="h-12 w-12 text-primary opacity-50" />
          </div>
        )}
        
        {/* Cost Level Badge */}
        <div className="absolute top-3 right-3">
          <Badge className={getCostLevelColor(destination.costLevel)}>
            <DollarSign className="h-3 w-3 mr-1" />
            {getCostLevelIcon(destination.costLevel)}
          </Badge>
        </div>

        {/* Safety Rating */}
        {destination.safetyRating && (
          <div className="absolute top-3 left-3">
            <Badge variant="secondary" className="bg-white/90 text-gray-800">
              <Star className="h-3 w-3 mr-1" />
              {destination.safetyRating}/10
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-lg">{destination.name}</h3>
            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400 text-sm">
              <MapPin className="h-4 w-4" />
              <span>{destination.country}</span>
              {destination.region && (
                <>
                  <span>•</span>
                  <span>{destination.region}</span>
                </>
              )}
            </div>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {destination.description}
          </p>

          {/* Quick Info */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {destination.bestTimeToVisit && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-primary" />
                <span>Best: {destination.bestTimeToVisit}</span>
              </div>
            )}
            
            {destination.averageTemperature && (
              <div className="flex items-center gap-1">
                <Thermometer className="h-3 w-3 text-primary" />
                <span>
                  {destination.averageTemperature.low}°-{destination.averageTemperature.high}°
                  {destination.averageTemperature.unit === 'celsius' ? 'C' : 'F'}
                </span>
              </div>
            )}
            
            <div className="flex items-center gap-1">
              <Globe className="h-3 w-3 text-primary" />
              <span>{destination.currency}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-primary" />
              <span>{destination.timeZone}</span>
            </div>
          </div>

          {/* Tags */}
          {destination.tags && destination.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {destination.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {destination.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{destination.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Top Attractions */}
          {destination.attractions && destination.attractions.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Top Attractions:
              </p>
              <div className="space-y-1">
                {destination.attractions.slice(0, 2).map((attraction, index) => (
                  <div key={index} className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <span className="w-1 h-1 bg-primary rounded-full" />
                    <span className="flex-1">{attraction.name}</span>
                    {attraction.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500 fill-current" />
                        <span>{attraction.rating}</span>
                      </div>
                    )}
                  </div>
                ))}
                {destination.attractions.length > 2 && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    +{destination.attractions.length - 2} more attractions
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <ChevronRight className="h-4 w-4 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Destination Detail Modal Component
interface DestinationDetailProps {
  destination: Destination;
  onClose: () => void;
}

const DestinationDetail: React.FC<DestinationDetailProps> = ({
  destination,
  onClose
}) => {
  const getCostLevelColor = (costLevel: Destination['costLevel']) => {
    switch (costLevel) {
      case 'budget':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'expensive':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'luxury':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl">{destination.name}</CardTitle>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <MapPin className="h-4 w-4" />
              <span>{destination.country}</span>
              {destination.region && (
                <>
                  <span>•</span>
                  <span>{destination.region}</span>
                </>
              )}
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Image Gallery */}
          {destination.images && destination.images.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {destination.images.slice(0, 6).map((image, index) => (
                <div key={index} className="aspect-video rounded overflow-hidden">
                  <img 
                    src={image} 
                    alt={`${destination.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Quick Info Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <DollarSign className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Cost Level</p>
                <Badge className={getCostLevelColor(destination.costLevel)}>
                  {destination.costLevel}
                </Badge>
              </CardContent>
            </Card>

            {destination.safetyRating && (
              <Card>
                <CardContent className="p-4 text-center">
                  <Star className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">Safety</p>
                  <p className="font-semibold">{destination.safetyRating}/10</p>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="p-4 text-center">
                <Globe className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Currency</p>
                <p className="font-semibold">{destination.currency}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <Clock className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Time Zone</p>
                <p className="font-semibold text-xs">{destination.timeZone}</p>
              </CardContent>
            </Card>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold mb-3">About {destination.name}</h3>
            <p className="text-gray-600 dark:text-gray-400">{destination.description}</p>
          </div>

          {/* Weather & Best Time */}
          {(destination.bestTimeToVisit || destination.averageTemperature) && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Climate & Weather</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {destination.bestTimeToVisit && (
                  <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                    <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    <div>
                      <p className="font-medium text-blue-800 dark:text-blue-200">Best Time to Visit</p>
                      <p className="text-blue-600 dark:text-blue-300">{destination.bestTimeToVisit}</p>
                    </div>
                  </div>
                )}
                
                {destination.averageTemperature && (
                  <div className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded">
                    <Thermometer className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                    <div>
                      <p className="font-medium text-orange-800 dark:text-orange-200">Temperature Range</p>
                      <p className="text-orange-600 dark:text-orange-300">
                        {destination.averageTemperature.low}° - {destination.averageTemperature.high}°
                        {destination.averageTemperature.unit === 'celsius' ? 'C' : 'F'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Languages */}
          {destination.languages && destination.languages.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Languages</h3>
              <div className="flex flex-wrap gap-2">
                {destination.languages.map((language, index) => (
                  <Badge key={index} variant="outline">
                    {language}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Attractions */}
          {destination.attractions && destination.attractions.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Top Attractions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {destination.attractions.map((attraction, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium">{attraction.name}</h4>
                        {attraction.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span className="text-sm">{attraction.rating}</span>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {attraction.description}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {attraction.type}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {destination.tags && destination.tags.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Highlights</h3>
              <div className="flex flex-wrap gap-2">
                {destination.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TravelDestinationSearch;