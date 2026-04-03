import React from 'react';
import SearchAndFilter from '../../components/ai-travel-planner/SearchAndFilter';
import TravelPlanCard from '../../components/ai-travel-planner/TravelPlanCard';
import EmptyState from '../../components/ai-travel-planner/EmptyState';
import type { TravelPlan, FilterState } from '../../types/ai-travel-planner';

interface TravelPlansListPageProps {
  travelPlans: TravelPlan[];
  filters: FilterState;
  onFilterChange: (filters: Partial<FilterState>) => void;
  onSelectPlan: (plan: TravelPlan) => void;
  onDeletePlan: (planId: string) => void;
  onToggleFavorite: (planId: string) => void;
}

const TravelPlansListPage: React.FC<TravelPlansListPageProps> = ({
  travelPlans,
  filters,
  onFilterChange,
  onSelectPlan,
  onDeletePlan,
  onToggleFavorite,
}) => {
  // Get all unique tags from travel plans
  const allTags = Array.from(new Set(travelPlans.flatMap((plan) => plan.tags)));

  // Filter and sort plans
  const filteredAndSortedPlans = travelPlans
    .filter((plan) => {
      const matchesSearch =
        plan.destination.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        plan.tags.some((tag) => tag.toLowerCase().includes(filters.searchQuery.toLowerCase()));
      const matchesFilter = filters.filterTag === 'all' || plan.tags.includes(filters.filterTag);
      const matchesFavorites =
        filters.filterFavorites === 'all' ||
        (filters.filterFavorites === 'favorites' && plan.isFavorite) ||
        (filters.filterFavorites === 'non-favorites' && !plan.isFavorite);
      return matchesSearch && matchesFilter && matchesFavorites;
    })
    .sort((a, b) => {
      switch (filters.sortBy) {
        case 'destination':
          return a.destination.localeCompare(b.destination);
        case 'budget':
          return b.budget - a.budget; // High to low
        case 'duration':
          return b.duration - a.duration; // Long to short
        case 'created':
        default:
          return new Date(b.created).getTime() - new Date(a.created).getTime(); // Newest first
      }
    });

  const handleClearFilters = () => {
    onFilterChange({
      searchQuery: '',
      filterTag: 'all',
      filterFavorites: 'all',
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">
            Your Travel Plans
          </h1>
          <p className="text-sm sm:text-base text-white/60">
            AI-generated personalized travel itineraries ({filteredAndSortedPlans.length} of{' '}
            {travelPlans.length})
          </p>
        </div>
      </div>

      {/* Search and Filter Section */}
      <SearchAndFilter
        filters={filters}
        onFilterChange={onFilterChange}
        allTags={allTags}
        totalPlans={travelPlans.length}
        filteredCount={filteredAndSortedPlans.length}
      />

      {/* Travel Plans Grid or Empty State */}
      {travelPlans.length === 0 ? (
        <EmptyState type="no-plans" />
      ) : filteredAndSortedPlans.length === 0 ? (
        <EmptyState type="no-results" onClearFilters={handleClearFilters} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredAndSortedPlans.map((plan) => (
            <TravelPlanCard
              key={plan.id}
              plan={plan}
              onSelect={onSelectPlan}
              onDelete={onDeletePlan}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TravelPlansListPage;