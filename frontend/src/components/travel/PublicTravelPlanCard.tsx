import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, DollarSign } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import type { TravelPlan } from '../../services/travelPlannerService';

interface PublicTravelPlanCardProps {
  plan: TravelPlan;
  onClick: (planId: string) => void;
  index?: number;
}

const PublicTravelPlanCard: React.FC<PublicTravelPlanCardProps> = ({ plan, onClick, index = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
    >
      <Card className="overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer h-full border-0 shadow-lg">
        <div
          onClick={() => onClick(plan.id)}
          className="h-full flex flex-col"
        >
          {plan.image && (
            <div className="relative h-48 overflow-hidden">
              <img
                src={plan.image}
                alt={plan.destination}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>
          )}
          <CardContent className="p-6 flex-1 flex flex-col">
            <h3 className="text-xl font-bold text-white mb-2">
              {plan.title || plan.destination}
            </h3>
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-white/80">
                <MapPin className="h-4 w-4" />
                <span>{plan.destination}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/80">
                <Calendar className="h-4 w-4" />
                <span>{plan.duration} days</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/80">
                <DollarSign className="h-4 w-4" />
                <span>
                  {plan.currency} {plan.budget.toLocaleString()}
                </span>
              </div>
            </div>
            {plan.tags && plan.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-auto">
                {plan.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
                {plan.tags.length > 3 && (
                  <span className="px-2 py-1 bg-white/10 backdrop-blur-xl border border-white/20 text-white/80 text-xs rounded-full">
                    +{plan.tags.length - 3}
                  </span>
                )}
              </div>
            )}
          </CardContent>
        </div>
      </Card>
    </motion.div>
  );
};

export default PublicTravelPlanCard;
