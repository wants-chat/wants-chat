import React from 'react';
import TravelStats from '../../components/travel/TravelStats';
import { useTravelPlans } from '../../hooks/useTravelPlans';

const TravelStatsPage: React.FC = () => {
  const { travelPlans } = useTravelPlans();
  
  // Transform plans for stats component
  const statsData = travelPlans.map((plan) => {
    // Handle endDate parsing safely
    const endDate = plan.endDate ? new Date(plan.endDate) : null;
    const isValidDate = endDate && !isNaN(endDate.getTime());
    const visitedYear = isValidDate ? endDate.getFullYear() : new Date().getFullYear();
    const isCompleted = isValidDate && endDate < new Date();

    return {
      id: plan.id,
      destination: plan.destination,
      visitedYear,
      isFavorite: plan.isFavorite || false,
      duration: plan.duration || 0,
      status: isCompleted ? 'completed' as const : 'planned' as const,
    };
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <TravelStats travelPlans={statsData} />
    </div>
  );
};

export default TravelStatsPage;