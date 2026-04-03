import React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import type { FilterState } from '../../types/ai-travel-planner';

interface SearchAndFilterProps {
  filters: FilterState;
  onFilterChange: (filters: Partial<FilterState>) => void;
  allTags: string[];
  totalPlans: number;
  filteredCount: number;
}

const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  filters,
  onFilterChange,
  allTags,
  totalPlans: _totalPlans,
  filteredCount: _filteredCount,
}) => {
  const handleClearFilters = () => {
    onFilterChange({
      searchQuery: '',
      filterTag: 'all',
      filterFavorites: 'all',
    });
  };

  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Label
            htmlFor="search"
            className="text-sm font-medium text-white/80 mb-2 block"
          >
            Search Plans
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 sm:h-5 sm:w-5 text-white/40" />
            <Input
              id="search"
              type="text"
              placeholder="Search destinations or tags..."
              value={filters.searchQuery}
              onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
              className="pl-9 sm:pl-10 h-10 sm:h-12 rounded-xl text-sm bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-teal-500"
            />
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {/* Filter by Tag */}
          <div className="w-full">
            <Label
              htmlFor="tag-filter"
              className="text-sm font-medium text-white/80 mb-2 block"
            >
              Filter by Tag
            </Label>
            <Select
              value={filters.filterTag}
              onValueChange={(value) => onFilterChange({ filterTag: value })}
            >
              <SelectTrigger id="tag-filter" className="h-10 sm:h-12 rounded-xl text-sm bg-white/5 border-white/20 text-white">
                <SelectValue placeholder="All tags" />
              </SelectTrigger>
              <SelectContent className="bg-teal-800/90 backdrop-blur-xl border-white/20">
                <SelectItem value="all" className="text-white hover:bg-white/10 focus:bg-white/10">All Tags</SelectItem>
                {allTags.map((tag) => (
                  <SelectItem key={tag} value={tag} className="text-white hover:bg-white/10 focus:bg-white/10">
                    {tag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filter by Favorites */}
          <div className="w-full">
            <Label
              htmlFor="favorites-filter"
              className="text-sm font-medium text-white/80 mb-2 block"
            >
              Filter by Status
            </Label>
            <Select
              value={filters.filterFavorites}
              onValueChange={(value) =>
                onFilterChange({ filterFavorites: value as FilterState['filterFavorites'] })
              }
            >
              <SelectTrigger id="favorites-filter" className="h-10 sm:h-12 rounded-xl text-sm bg-white/5 border-white/20 text-white">
                <SelectValue placeholder="All plans" />
              </SelectTrigger>
              <SelectContent className="bg-teal-800/90 backdrop-blur-xl border-white/20">
                <SelectItem value="all" className="text-white hover:bg-white/10 focus:bg-white/10">All Plans</SelectItem>
                <SelectItem value="favorites" className="text-white hover:bg-white/10 focus:bg-white/10">⭐ Favorites Only</SelectItem>
                <SelectItem value="non-favorites" className="text-white hover:bg-white/10 focus:bg-white/10">Regular Plans</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort By */}
          <div className="w-full sm:col-span-2 lg:col-span-1">
            <Label
              htmlFor="sort-by"
              className="text-sm font-medium text-white/80 mb-2 block"
            >
              Sort By
            </Label>
            <Select
              value={filters.sortBy}
              onValueChange={(value) =>
                onFilterChange({ sortBy: value as FilterState['sortBy'] })
              }
            >
              <SelectTrigger id="sort-by" className="h-10 sm:h-12 rounded-xl text-sm bg-white/5 border-white/20 text-white">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-teal-800/90 backdrop-blur-xl border-white/20">
                <SelectItem value="created" className="text-white hover:bg-white/10 focus:bg-white/10">Newest First</SelectItem>
                <SelectItem value="destination" className="text-white hover:bg-white/10 focus:bg-white/10">Destination A-Z</SelectItem>
                <SelectItem value="budget" className="text-white hover:bg-white/10 focus:bg-white/10">Highest Budget</SelectItem>
                <SelectItem value="duration" className="text-white hover:bg-white/10 focus:bg-white/10">Longest Duration</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {(filters.searchQuery ||
        filters.filterTag !== 'all' ||
        filters.filterFavorites !== 'all') && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs sm:text-sm text-white/60">
            Active filters:
          </span>
          {filters.searchQuery && (
            <Badge variant="secondary" className="gap-1 text-xs bg-white/10 text-white border-white/20">
              <span className="hidden sm:inline">Search: </span>"
              {filters.searchQuery.length > 15
                ? filters.searchQuery.substring(0, 15) + '...'
                : filters.searchQuery}
              "
              <X
                className="h-3 w-3 cursor-pointer hover:text-red-400"
                onClick={() => onFilterChange({ searchQuery: '' })}
              />
            </Badge>
          )}
          {filters.filterTag !== 'all' && (
            <Badge variant="secondary" className="gap-1 text-xs bg-white/10 text-white border-white/20">
              <span className="hidden sm:inline">Tag: </span>
              {filters.filterTag}
              <X
                className="h-3 w-3 cursor-pointer hover:text-red-400"
                onClick={() => onFilterChange({ filterTag: 'all' })}
              />
            </Badge>
          )}
          {filters.filterFavorites !== 'all' && (
            <Badge variant="secondary" className="gap-1 text-xs bg-white/10 text-white border-white/20">
              {filters.filterFavorites === 'favorites' ? '⭐ Favorites' : 'Regular'}
              <X
                className="h-3 w-3 cursor-pointer hover:text-red-400"
                onClick={() => onFilterChange({ filterFavorites: 'all' })}
              />
            </Badge>
          )}
          <Button variant="ghost" size="sm" onClick={handleClearFilters} className="text-xs h-6 px-2 text-white/60 hover:text-white hover:bg-white/10">
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
};

export default SearchAndFilter;