import React from 'react';
import { Star, LocationOn } from '@mui/icons-material';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import type { HotelRecommendation } from '../../types/ai-travel-planner';

interface HotelCardProps {
  hotel: HotelRecommendation;
}

const HotelCard: React.FC<HotelCardProps> = ({ hotel }) => {
  return (
    <Card className="rounded-2xl overflow-hidden bg-white/10 backdrop-blur-xl border border-white/20 hover:border-teal-500/50 transition-all">
      <div className="h-32 sm:h-40 relative">
        {hotel.image ? (
          <img src={hotel.image} alt={hotel.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-teal-500/20 to-cyan-500/20"></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
      </div>
      <CardContent className="p-3 sm:p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-base sm:text-lg leading-tight text-white">{hotel.name}</h3>
          <div className="flex items-center gap-1 flex-shrink-0 ml-2">
            <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500 fill-current" />
            <span className="text-xs sm:text-sm font-medium text-white">{hotel.rating}</span>
          </div>
        </div>
        <p className="text-white/60 text-xs sm:text-sm mb-2">
          <LocationOn className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1 text-teal-400" />
          {hotel.location}
        </p>
        <p className="text-base sm:text-lg font-semibold text-teal-400 mb-2">
          ${hotel.pricePerNight}/night
        </p>
        <div className="flex flex-wrap gap-1">
          {hotel.amenities.slice(0, 3).map((amenity) => (
            <Badge key={amenity} variant="secondary" className="text-xs bg-white/10 text-white/70 border-white/20">
              {amenity}
            </Badge>
          ))}
          {hotel.amenities.length > 3 && (
            <Badge variant="secondary" className="text-xs bg-white/10 text-white/70 border-white/20">
              +{hotel.amenities.length - 3}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default HotelCard;