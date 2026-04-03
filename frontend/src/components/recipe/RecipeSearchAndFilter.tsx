import React from 'react';
import { Search, Filter, SortAsc } from 'lucide-react';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface RecipeSearchAndFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: 'rating' | 'time' | 'name' | 'date';
  onSortChange: (sortBy: 'rating' | 'time' | 'name' | 'date') => void;
  filterDifficulty: string;
  onFilterChange: (difficulty: string) => void;
  filteredCount: number;
  totalCount: number;
}

// Type guard to ensure valid sort values
const isValidSortValue = (value: string): value is 'rating' | 'time' | 'name' | 'date' => {
  return ['rating', 'time', 'name', 'date'].includes(value);
};

export const RecipeSearchAndFilter: React.FC<RecipeSearchAndFilterProps> = ({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  filterDifficulty,
  onFilterChange,
  filteredCount,
  totalCount
}) => {
  return (
    <div className="mb-8 space-y-4">
      <div className="flex flex-col gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-5 w-5 text-white/40" />
          <Input
            type="text"
            placeholder="Search recipes in this category..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/40"
          />
        </div>

        {/* Filter and Sort Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="w-full">
            <label className="text-sm font-medium text-white mb-2 block">
              <Filter className="h-4 w-4 inline mr-1" />
              Difficulty
            </label>
            <Select value={filterDifficulty} onValueChange={onFilterChange}>
              <SelectTrigger className="h-10 rounded-xl bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="All levels" />
              </SelectTrigger>
              <SelectContent className="bg-teal-800/90 backdrop-blur-xl border-teal-400/30">
                <SelectItem value="all" className="text-white hover:bg-white/10 focus:bg-white/10">All Levels</SelectItem>
                <SelectItem value="Easy" className="text-white hover:bg-white/10 focus:bg-white/10">Easy</SelectItem>
                <SelectItem value="Medium" className="text-white hover:bg-white/10 focus:bg-white/10">Medium</SelectItem>
                <SelectItem value="Hard" className="text-white hover:bg-white/10 focus:bg-white/10">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-full">
            <label className="text-sm font-medium text-white mb-2 block">
              <SortAsc className="h-4 w-4 inline mr-1" />
              Sort by
            </label>
            <Select value={sortBy} onValueChange={(value: string) => {
              // Type-safe conversion using type guard
              if (isValidSortValue(value)) {
                onSortChange(value);
              }
            }}>
              <SelectTrigger className="h-10 rounded-xl bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-teal-800/90 backdrop-blur-xl border-teal-400/30">
                <SelectItem value="rating" className="text-white hover:bg-white/10 focus:bg-white/10">Highest Rated</SelectItem>
                <SelectItem value="time" className="text-white hover:bg-white/10 focus:bg-white/10">Cooking Time</SelectItem>
                <SelectItem value="name" className="text-white hover:bg-white/10 focus:bg-white/10">Name A-Z</SelectItem>
                <SelectItem value="date" className="text-white hover:bg-white/10 focus:bg-white/10">Newest First</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-full sm:col-span-2 lg:col-span-2 flex items-end">
            <div className="w-full">
              <label className="text-sm font-medium text-white mb-2 block">
                Results
              </label>
              <div className="h-10 flex items-center px-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white/80">
                {filteredCount} of {totalCount} recipes
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};