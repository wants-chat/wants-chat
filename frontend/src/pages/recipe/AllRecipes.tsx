import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { usePublicRecipes } from '../../hooks/useRecipes';
import { PublicRecipeCard } from '../../components/recipe/PublicRecipeCard';
import { Skeleton } from '../../components/ui/skeleton';
import { useTheme } from '../../contexts/ThemeContext';
import { RecipeHeader } from '../../components/recipe/RecipeHeader';
import { RecipeTabs } from '../../components/recipe/RecipeTabs';
import { BackgroundEffects } from '../../components/ui/BackgroundEffects';
import { GlassCard } from '../../components/ui/GlassCard';

const AllRecipes: React.FC = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  // Redirect to the tab view
  useEffect(() => {
    navigate('/recipe-builder?tab=all-recipes', { replace: true });
  }, [navigate]);

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

  // Fetch public recipes
  const queryParams: any = {
    page,
    limit,
    sort_by: sortBy,
    sort_order: sortOrder,
    public_only: true,
  };

  // Only add filters if they have values
  if (debouncedSearch) queryParams.search = debouncedSearch;
  if (cuisine) queryParams.cuisine = cuisine;
  if (difficulty) queryParams.difficulty = difficulty;
  if (mealType) queryParams.meal_type = mealType;
  if (dietaryRestrictions.length > 0) queryParams.dietary_restrictions = dietaryRestrictions;

  const { data, loading, error } = usePublicRecipes(queryParams);

  const recipes = data?.data || [];
  const totalPages = data?.total_pages || 1;

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

  const handleTabChange = (tab: 'dashboard' | 'recipes' | 'all-recipes' | 'categories' | 'meal-plan' | 'ai-chat') => {
    if (tab === 'all-recipes') return; // Already on this page
    navigate(`/recipe-builder?tab=${tab}`);
  };

  return (
    <div className="min-h-screen relative">
      <BackgroundEffects />

      <div className="relative z-10">
        {/* Header */}
        <RecipeHeader
          title="Recipe Builder"
          subtitle="Create, manage and discover amazing recipes"
          theme={theme}
          toggleTheme={toggleTheme}
        />

        {/* Tabs Navigation */}
        <div className="bg-white/10 backdrop-blur-xl border-b border-white/20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <RecipeTabs activeTab="all-recipes" onTabChange={handleTabChange} />
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">All Recipes</h2>
                <p className="text-white/60">
                  {data?.total || 0} recipe{data?.total !== 1 ? 's' : ''} found
                </p>
              </div>

              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white border-white/20 hover:from-teal-600 hover:to-cyan-600"
              >
                <Filter className="h-4 w-4 mr-2" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </Button>
            </div>
          </div>

          {/* Search and Filter Section */}
          <GlassCard className="p-6 mb-6" glow={true}>
          <div className="space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-white/60" />
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
                  className="absolute right-3 top-3 text-white/60 hover:text-white"
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
                  <SelectTrigger className="h-10 rounded-xl">
                    <SelectValue placeholder="All cuisines" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Cuisines</SelectItem>
                    <SelectItem value="Italian">Italian</SelectItem>
                    <SelectItem value="Chinese">Chinese</SelectItem>
                    <SelectItem value="Mexican">Mexican</SelectItem>
                    <SelectItem value="Indian">Indian</SelectItem>
                    <SelectItem value="Japanese">Japanese</SelectItem>
                    <SelectItem value="American">American</SelectItem>
                    <SelectItem value="Mediterranean">Mediterranean</SelectItem>
                    <SelectItem value="Thai">Thai</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Difficulty Filter */}
              <div>
                <label className="text-sm font-medium text-white mb-2 block">
                  Difficulty
                </label>
                <Select value={difficulty} onValueChange={(value) => { setDifficulty(value); setPage(1); }}>
                  <SelectTrigger className="h-10 rounded-xl">
                    <SelectValue placeholder="All levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Levels</SelectItem>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Meal Type Filter */}
              <div>
                <label className="text-sm font-medium text-white mb-2 block">
                  Meal Type
                </label>
                <Select value={mealType} onValueChange={(value) => { setMealType(value); setPage(1); }}>
                  <SelectTrigger className="h-10 rounded-xl">
                    <SelectValue placeholder="All meals" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Meals</SelectItem>
                    <SelectItem value="breakfast">Breakfast</SelectItem>
                    <SelectItem value="lunch">Lunch</SelectItem>
                    <SelectItem value="dinner">Dinner</SelectItem>
                    <SelectItem value="snack">Snack</SelectItem>
                    <SelectItem value="dessert">Dessert</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort By */}
              <div>
                <label className="text-sm font-medium text-white mb-2 block">
                  Sort By
                </label>
                <Select value={sortBy} onValueChange={(value) => setSortBy(value)}>
                  <SelectTrigger className="h-10 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="created_at">Newest First</SelectItem>
                    <SelectItem value="title">Title</SelectItem>
                    <SelectItem value="average_rating">Rating</SelectItem>
                    <SelectItem value="total_time_minutes">Cooking Time</SelectItem>
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
                        variant={dietaryRestrictions.includes(restriction) ? 'default' : 'outline'}
                        className="cursor-pointer hover:bg-white/20 transition-colors bg-white/10 text-white border-white/20"
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
        </GlassCard>

          {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <GlassCard key={i} className="overflow-hidden" hover={false}>
                  <Skeleton className="h-48 w-full bg-white/10" />
                  <div className="p-4 space-y-3">
                    <Skeleton className="h-6 w-3/4 bg-white/10" />
                    <Skeleton className="h-4 w-full bg-white/10" />
                    <Skeleton className="h-4 w-2/3 bg-white/10" />
                  </div>
                </GlassCard>
              ))}
            </div>
          )}

          {/* Error State */}
          {error && (
            <GlassCard className="p-12 text-center" hover={false}>
              <p className="text-red-400">
                Failed to load recipes. Please try again later.
              </p>
            </GlassCard>
          )}

          {/* Recipes Grid */}
          {!loading && !error && recipes.length > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {recipes.map((recipe) => (
                  <PublicRecipeCard key={recipe.id} recipe={recipe} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(prev => Math.max(1, prev - 1))}
                    disabled={page === 1}
                    className="rounded-xl bg-white/10 border-white/20 text-white hover:bg-white/20"
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
                          variant={page === pageNum ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setPage(pageNum)}
                          className={`rounded-xl min-w-[40px] ${page === pageNum ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'}`}
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
                    className="rounded-xl bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}

          {/* Empty State */}
          {!loading && !error && recipes.length === 0 && (
            <GlassCard className="p-12 text-center" hover={false}>
              <h3 className="text-xl font-semibold mb-2 text-white">No recipes found</h3>
              <p className="text-white/60 mb-6">
                Try adjusting your filters or search criteria
              </p>
              {hasActiveFilters && (
                <Button onClick={handleClearFilters} variant="outline" className="rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white border-white/20">
                  Clear Filters
                </Button>
              )}
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllRecipes;
