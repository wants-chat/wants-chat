import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { usePublicRecipes } from '../../hooks/useRecipes';
import { PublicRecipeCard } from './PublicRecipeCard';
import { Skeleton } from '../ui/skeleton';

export const AllRecipesList: React.FC = () => {
  const navigate = useNavigate();

  // Filter states
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [search, setSearch] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [mealType, setMealType] = useState('');
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to first page on search change
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  // Fetch public recipes with filters (but not search or pagination)
  const queryParams = useMemo(() => {
    const params: any = {
      page: 1,
      limit: 100, // API max limit
      sort_by: sortBy,
      sort_order: sortOrder,
      public_only: true,
    };

    // Apply filters to API call
    if (cuisine) params.cuisine = cuisine;
    if (difficulty) params.difficulty = difficulty;
    if (mealType) params.meal_type = mealType;
    if (dietaryRestrictions.length > 0) params.dietary_restrictions = dietaryRestrictions;

    return params;
  }, [cuisine, difficulty, mealType, dietaryRestrictions, sortBy, sortOrder]);

  const { data, isLoading, error } = usePublicRecipes(queryParams);

  const allRecipes = data?.data || [];

  // Apply search filter on frontend
  const filteredRecipes = useMemo(() => {
    if (!debouncedSearch) return allRecipes;

    const searchLower = debouncedSearch.toLowerCase();
    return allRecipes.filter(recipe =>
      recipe.title?.toLowerCase().includes(searchLower) ||
      recipe.description?.toLowerCase().includes(searchLower) ||
      recipe.tags?.some(tag => tag.toLowerCase().includes(searchLower)) ||
      recipe.cuisine?.toLowerCase().includes(searchLower)
    );
  }, [allRecipes, debouncedSearch]);

  // Paginate filtered recipes on frontend
  const totalPages = Math.ceil(filteredRecipes.length / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const recipes = filteredRecipes.slice(startIndex, endIndex);

  const handleClearFilters = () => {
    setSearch('');
    setCuisine('');
    setDifficulty('');
    setMealType('');
    setDietaryRestrictions([]);
    setSortBy('created_at');
    setSortOrder('desc');
    setPage(1);
  };

  const toggleDietaryRestriction = (restriction: string) => {
    setDietaryRestrictions(prev =>
      prev.includes(restriction)
        ? prev.filter(r => r !== restriction)
        : [...prev, restriction]
    );
    setPage(1);
  };

  const hasActiveFilters = search || cuisine || difficulty || mealType || dietaryRestrictions.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">All Recipes</h2>
          <p className="text-white/60">
            {filteredRecipes.length} recipe{filteredRecipes.length !== 1 ? 's' : ''} found
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="rounded-xl bg-transparent border-white/20 text-white hover:bg-white/10"
        >
          <Filter className="h-4 w-4 mr-2" />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </Button>
      </div>

      {/* Search and Filter Section */}
      <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 border-l-4 border-l-teal-500 p-6">
        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-white/40" />
            <Input
              type="text"
              placeholder="Search recipes by name, ingredients, or tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/40"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-3 text-white/40 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Filter Controls */}
          {showFilters && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Cuisine Filter */}
                <div>
                  <label className="text-sm font-medium text-white mb-2 block">
                    Cuisine
                  </label>
                  <Select value={cuisine} onValueChange={(value) => { setCuisine(value); setPage(1); }}>
                    <SelectTrigger className="h-10 rounded-xl bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="All cuisines" />
                    </SelectTrigger>
                    <SelectContent className="bg-teal-800/90 border-teal-400/30">
                      <SelectItem value="" className="text-white hover:bg-white/10 focus:bg-white/10">All Cuisines</SelectItem>
                      <SelectItem value="Italian" className="text-white hover:bg-white/10 focus:bg-white/10">Italian</SelectItem>
                      <SelectItem value="Chinese" className="text-white hover:bg-white/10 focus:bg-white/10">Chinese</SelectItem>
                      <SelectItem value="Mexican" className="text-white hover:bg-white/10 focus:bg-white/10">Mexican</SelectItem>
                      <SelectItem value="Indian" className="text-white hover:bg-white/10 focus:bg-white/10">Indian</SelectItem>
                      <SelectItem value="Japanese" className="text-white hover:bg-white/10 focus:bg-white/10">Japanese</SelectItem>
                      <SelectItem value="American" className="text-white hover:bg-white/10 focus:bg-white/10">American</SelectItem>
                      <SelectItem value="Mediterranean" className="text-white hover:bg-white/10 focus:bg-white/10">Mediterranean</SelectItem>
                      <SelectItem value="Thai" className="text-white hover:bg-white/10 focus:bg-white/10">Thai</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Difficulty Filter */}
                <div>
                  <label className="text-sm font-medium text-white mb-2 block">
                    Difficulty
                  </label>
                  <Select value={difficulty} onValueChange={(value) => { setDifficulty(value); setPage(1); }}>
                    <SelectTrigger className="h-10 rounded-xl bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="All levels" />
                    </SelectTrigger>
                    <SelectContent className="bg-teal-800/90 border-teal-400/30">
                      <SelectItem value="" className="text-white hover:bg-white/10 focus:bg-white/10">All Levels</SelectItem>
                      <SelectItem value="easy" className="text-white hover:bg-white/10 focus:bg-white/10">Easy</SelectItem>
                      <SelectItem value="medium" className="text-white hover:bg-white/10 focus:bg-white/10">Medium</SelectItem>
                      <SelectItem value="hard" className="text-white hover:bg-white/10 focus:bg-white/10">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Meal Type Filter */}
                <div>
                  <label className="text-sm font-medium text-white mb-2 block">
                    Meal Type
                  </label>
                  <Select value={mealType} onValueChange={(value) => { setMealType(value); setPage(1); }}>
                    <SelectTrigger className="h-10 rounded-xl bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="All meals" />
                    </SelectTrigger>
                    <SelectContent className="bg-teal-800/90 border-teal-400/30">
                      <SelectItem value="" className="text-white hover:bg-white/10 focus:bg-white/10">All Meals</SelectItem>
                      <SelectItem value="breakfast" className="text-white hover:bg-white/10 focus:bg-white/10">Breakfast</SelectItem>
                      <SelectItem value="lunch" className="text-white hover:bg-white/10 focus:bg-white/10">Lunch</SelectItem>
                      <SelectItem value="dinner" className="text-white hover:bg-white/10 focus:bg-white/10">Dinner</SelectItem>
                      <SelectItem value="snack" className="text-white hover:bg-white/10 focus:bg-white/10">Snack</SelectItem>
                      <SelectItem value="dessert" className="text-white hover:bg-white/10 focus:bg-white/10">Dessert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort By */}
                <div>
                  <label className="text-sm font-medium text-white mb-2 block">
                    Sort By
                  </label>
                  <Select value={sortBy} onValueChange={(value) => setSortBy(value)}>
                    <SelectTrigger className="h-10 rounded-xl bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-teal-800/90 border-teal-400/30">
                      <SelectItem value="created_at" className="text-white hover:bg-white/10 focus:bg-white/10">Newest First</SelectItem>
                      <SelectItem value="title" className="text-white hover:bg-white/10 focus:bg-white/10">Title</SelectItem>
                      <SelectItem value="average_rating" className="text-white hover:bg-white/10 focus:bg-white/10">Rating</SelectItem>
                      <SelectItem value="total_time_minutes" className="text-white hover:bg-white/10 focus:bg-white/10">Cooking Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Dietary Restrictions */}
              <div className="col-span-full">
                <label className="text-sm font-medium text-white mb-2 block">
                  Dietary Restrictions
                </label>
                <div className="flex flex-wrap gap-2">
                  {['vegetarian', 'vegan', 'gluten_free', 'dairy_free', 'nut_free', 'low_carb', 'keto', 'paleo'].map((restriction) => (
                    <Badge
                      key={restriction}
                      className={`cursor-pointer transition-colors ${
                        dietaryRestrictions.includes(restriction)
                          ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white'
                          : 'bg-white/10 text-white/60 border border-white/20 hover:bg-white/20'
                      }`}
                      onClick={() => toggleDietaryRestriction(restriction)}
                    >
                      {restriction.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden bg-white/5 border border-white/10">
              <Skeleton className="h-48 w-full bg-white/10" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-6 w-3/4 bg-white/10" />
                <Skeleton className="h-4 w-full bg-white/10" />
                <Skeleton className="h-4 w-2/3 bg-white/10" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="rounded-2xl p-12 text-center bg-red-500/10 border border-red-500/20">
          <p className="text-red-400">
            Failed to load recipes. Please try again later.
          </p>
        </div>
      )}

      {/* Recipes Grid */}
      {!isLoading && !error && recipes.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recipes.map((recipe) => (
              <PublicRecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                disabled={page === 1}
                className="rounded-xl bg-transparent border-white/20 text-white hover:bg-white/10 disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      size="sm"
                      onClick={() => setPage(pageNum)}
                      className={`rounded-xl min-w-[40px] ${
                        page === pageNum
                          ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white'
                          : 'bg-transparent border border-white/20 text-white hover:bg-white/10'
                      }`}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                disabled={page === totalPages}
                className="rounded-xl bg-transparent border-white/20 text-white hover:bg-white/10 disabled:opacity-50"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}

      {/* Empty State */}
      {!isLoading && !error && recipes.length === 0 && (
        <div className="rounded-2xl p-12 text-center bg-white/5 border border-white/10">
          <h3 className="text-xl font-semibold mb-2 text-white">No recipes found</h3>
          <p className="text-white/60 mb-6">
            Try adjusting your filters or search criteria
          </p>
          {hasActiveFilters && (
            <Button onClick={handleClearFilters} variant="outline" className="rounded-xl bg-transparent border-white/20 text-white hover:bg-white/10">
              Clear Filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
