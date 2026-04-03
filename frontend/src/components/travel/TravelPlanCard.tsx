import React from 'react';
import { Calendar, MapPin, DollarSign, Users, Clock, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import type { TravelPlan } from '../../services/travelService';

interface TravelPlanCardProps {
  plan: TravelPlan;
  onClick: (plan: TravelPlan) => void;
  className?: string;
}

const TravelPlanCard: React.FC<TravelPlanCardProps> = ({ plan, onClick, className = '' }) => {
  const getStatusColor = (status: TravelPlan['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'ongoing':
        return 'bg-blue-100 text-blue-800';
      case 'booked':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-white/10 backdrop-blur-xl border border-white/20 text-white';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysUntilTrip = () => {
    const today = new Date();
    const startDate = new Date(plan.startDate);
    const diffTime = startDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return null;
    if (diffDays === 0) return 'Today!';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays <= 7) return `${diffDays} days`;
    if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} weeks`;
    return `${Math.ceil(diffDays / 30)} months`;
  };

  const daysUntil = getDaysUntilTrip();

  return (
    <Card 
      className={`cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02] ${className}`}
      onClick={() => onClick(plan)}
    >
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <h3 className="font-semibold text-lg text-white line-clamp-2">
                {plan.name}
              </h3>
              <div className="flex items-center gap-1 text-white/80">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">
                  {plan.destination.city}, {plan.destination.country}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge className={getStatusColor(plan.status)}>
                {plan.status}
              </Badge>
              {daysUntil && plan.status !== 'completed' && plan.status !== 'cancelled' && (
                <span className="text-xs text-primary font-medium">
                  {daysUntil}
                </span>
              )}
            </div>
          </div>

          {/* Trip Details */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-white/80">
              <Calendar className="h-4 w-4 text-primary flex-shrink-0" />
              <div>
                <p className="font-medium text-white">{formatDate(plan.startDate)}</p>
                <p className="text-xs">{plan.duration} days</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-white/80">
              <DollarSign className="h-4 w-4 text-primary flex-shrink-0" />
              <div>
                <p className="font-medium text-white">
                  {plan.budget?.total
                    ? `${plan.budget.total} ${plan.budget.currency}`
                    : 'No budget set'
                  }
                </p>
                {plan.budget?.spent && (
                  <p className="text-xs">
                    {Math.round((plan.budget.spent / plan.budget.total) * 100)}% spent
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Progress Indicators */}
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="flex items-center gap-2 text-white/80">
              <Users className="h-4 w-4 text-primary flex-shrink-0" />
              <span>{plan.travelers.length} travelers</span>
            </div>

            <div className="flex items-center gap-2 text-white/80">
              <Clock className="h-4 w-4 text-primary flex-shrink-0" />
              <span>{plan.activities.length} activities</span>
            </div>
            
            <div className="flex items-center justify-end">
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </div>
          </div>

          {/* Budget Progress Bar (if budget is set) */}
          {plan.budget?.total && plan.budget?.spent && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-white/80">
                <span>Budget Progress</span>
                <span>
                  {plan.budget.spent} / {plan.budget.total} {plan.budget.currency}
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full h-2 transition-all duration-300"
                  style={{
                    width: `${Math.min((plan.budget.spent / plan.budget.total) * 100, 100)}%`
                  }}
                />
              </div>
            </div>
          )}

          {/* Notes preview */}
          {plan.notes && (
            <div className="pt-2 border-t border-white/10">
              <p className="text-xs text-white/80 line-clamp-2">
                {plan.notes}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TravelPlanCard;