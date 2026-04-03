import React from 'react';
import {
  CalendarMonth,
  AttachMoney,
  Hotel,
  ChevronRight,
  Delete,
  Favorite,
  FavoriteBorder,
} from '@mui/icons-material';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import type { TravelPlan } from '../../types/ai-travel-planner';

interface TravelPlanCardProps {
  plan: TravelPlan;
  onSelect: (plan: TravelPlan) => void;
  onDelete: (planId: string) => void;
  onToggleFavorite: (planId: string) => void;
}

const TravelPlanCard: React.FC<TravelPlanCardProps> = ({
  plan,
  onSelect,
  onDelete,
  onToggleFavorite,
}) => {
  return (
    <Card
      className="cursor-pointer rounded-2xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden bg-white/10 backdrop-blur-xl border border-white/20 hover:border-teal-500/50"
      onClick={() => onSelect(plan)}
    >
      <div className="h-40 sm:h-48 relative overflow-hidden">
        {plan.image ? (
          <img src={plan.image} alt={plan.destination} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-teal-500/20 to-cyan-500/20"></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
        <div className="absolute top-2 sm:top-4 right-2 sm:right-4 flex gap-1 sm:gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(plan.id);
            }}
            className="bg-white/20 backdrop-blur-sm hover:bg-red-500/30 h-8 w-8 sm:h-10 sm:w-10 rounded-xl"
          >
            <Delete className="h-4 w-4 sm:h-5 sm:w-5 text-white hover:text-red-400" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(plan.id);
            }}
            className="bg-white/20 backdrop-blur-sm hover:bg-white/30 h-8 w-8 sm:h-10 sm:w-10 rounded-xl"
          >
            {plan.isFavorite ? (
              <Favorite className="h-4 w-4 sm:h-5 sm:w-5 text-red-400" />
            ) : (
              <FavoriteBorder className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            )}
          </Button>
        </div>
        <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-4">
          <h3 className="text-lg sm:text-2xl font-bold text-white mb-1 sm:mb-2 leading-tight">
            {plan.destination}
          </h3>
          <div className="flex gap-1 sm:gap-2 flex-wrap">
            {plan.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="secondary" className="bg-white/20 backdrop-blur-sm text-white text-xs border-0">
                {tag}
              </Badge>
            ))}
            {plan.tags.length > 2 && (
              <Badge variant="secondary" className="bg-white/20 backdrop-blur-sm text-white text-xs border-0">
                +{plan.tags.length - 2}
              </Badge>
            )}
          </div>
        </div>
      </div>
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-center gap-2 text-white/70">
            <CalendarMonth className="h-3 w-3 sm:h-4 sm:w-4 text-teal-400 flex-shrink-0" />
            <span className="text-xs sm:text-sm">
              {plan.duration} days • {plan.startDate}
            </span>
          </div>
          <div className="flex items-center gap-2 text-white/70">
            <AttachMoney className="h-3 w-3 sm:h-4 sm:w-4 text-teal-400 flex-shrink-0" />
            <span className="text-xs sm:text-sm">
              Budget: ${plan.budget} {plan.currency}
            </span>
          </div>
          <div className="flex items-center gap-2 text-white/70">
            <Hotel className="h-3 w-3 sm:h-4 sm:w-4 text-teal-400 flex-shrink-0" />
            <span className="text-xs sm:text-sm">{plan.hotels.length} hotels recommended</span>
          </div>
        </div>
        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-white/10 flex justify-between items-center">
          <span className="text-xs sm:text-sm text-white/50 truncate">Created {plan.created}</span>
          <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-teal-400 flex-shrink-0" />
        </div>
      </CardContent>
    </Card>
  );
};

export default TravelPlanCard;