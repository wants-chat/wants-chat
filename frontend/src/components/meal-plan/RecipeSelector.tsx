import React, { useState } from 'react';
import { Search, X, Clock, Users, Star, ChefHat, Filter } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { useRecipes } from '../../hooks/useRecipes';
import { Recipe } from '../../types/recipe';

interface RecipeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRecipe: (recipe: Recipe) => void;
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  selectedDate?: string;
}

interface RecipeFilters {
  cuisine?: string;
  difficulty?: string;
  maxPrepTime?: number;
  mealType?: string;
}

export const RecipeSelector: React.FC<RecipeSelectorProps> = ({
  isOpen,
  onClose,
  onSelectRecipe,
  mealType,
  selectedDate
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<RecipeFilters>({
    mealType: mealType
  });
  const [showFilters, setShowFilters] = useState(false);

  // Fetch recipes with filters
  const { data: recipesData, loading } = useRecipes({
    search: searchQuery,
    cuisine: filters.cuisine,
    difficulty: filters.difficulty as 'easy' | 'medium' | 'hard'
  });

  const recipes = recipesData?.data || [];

  // Filter recipes based on prep time and meal type locally
  const filteredRecipes = recipes.filter(recipe => {
    if (filters.maxPrepTime && (recipe.prepTime || 0) > filters.maxPrepTime) {
      return false;
    }
    
    // Basic meal type filtering logic
    if (filters.mealType) {
      const mealTypeKeywords = {
        breakfast: ['breakfast', 'cereal', 'oatmeal', 'pancake', 'waffle', 'egg', 'toast', 'smoothie'],
        lunch: ['lunch', 'sandwich', 'salad', 'soup', 'wrap'],
        dinner: ['dinner', 'pasta', 'rice', 'chicken', 'beef', 'fish', 'steak', 'roast'],
        snack: ['snack', 'cookie', 'chip', 'fruit', 'nuts', 'bar']
      };
      
      const keywords = mealTypeKeywords[filters.mealType as keyof typeof mealTypeKeywords] || [];
      const titleLower = recipe.title.toLowerCase();
      const hasKeyword = keywords.some(keyword => titleLower.includes(keyword));
      
      // Include recipe if it has relevant keywords or no specific meal type filtering
      if (!hasKeyword && filters.mealType !== 'snack') {
        // For snack, be more lenient
        if (filters.mealType === 'snack') {
          return true;
        }
      }
    }
    
    return true;
  });

  const cuisines = ['Italian', 'Mexican', 'Asian', 'American', 'Mediterranean', 'Indian'];
  const difficulties = ['easy', 'medium', 'hard'];
  const prepTimes = [15, 30, 45, 60];

  const handleSelectRecipe = (recipe: Recipe) => {
    onSelectRecipe(recipe);
    onClose();
  };

  const clearFilters = () => {
    setFilters({ mealType: mealType });
    setSearchQuery('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <div>
            <h2 className="text-2xl font-bold text-white">Select Recipe</h2>
            <p className="text-white/60 mt-1">
              {mealType && `Choose a recipe for ${mealType}`}
              {selectedDate && ` on ${new Date(selectedDate).toLocaleDateString()}`}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full text-white hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="p-6 border-b border-white/20 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search recipes..."
              className="w-full pl-10 pr-3 py-2 bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Filter Toggle */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2 text-white border-white/20 hover:bg-white/10"
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>

            {(searchQuery || Object.values(filters).some(Boolean)) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-white/60 hover:bg-white/10"
              >
                Clear all
              </Button>
            )}
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Cuisine Filter */}
              <div>
                <label className="block text-sm font-medium mb-2 text-white">Cuisine</label>
                <select
                  value={filters.cuisine || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, cuisine: e.target.value || undefined }))}
                  className="w-full p-2 bg-white/10 border-white/20 text-white rounded-lg focus:ring-2 focus:ring-primary"
                >
                  <option value="">Any</option>
                  {cuisines.map(cuisine => (
                    <option key={cuisine} value={cuisine}>{cuisine}</option>
                  ))}
                </select>
              </div>

              {/* Difficulty Filter */}
              <div>
                <label className="block text-sm font-medium mb-2 text-white">Difficulty</label>
                <select
                  value={filters.difficulty || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, difficulty: e.target.value || undefined }))}
                  className="w-full p-2 bg-white/10 border-white/20 text-white rounded-lg focus:ring-2 focus:ring-primary"
                >
                  <option value="">Any</option>
                  {difficulties.map(difficulty => (
                    <option key={difficulty} value={difficulty}>
                      {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Prep Time Filter */}
              <div>
                <label className="block text-sm font-medium mb-2 text-white">Max Prep Time</label>
                <select
                  value={filters.maxPrepTime || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, maxPrepTime: e.target.value ? Number(e.target.value) : undefined }))}
                  className="w-full p-2 bg-white/10 border-white/20 text-white rounded-lg focus:ring-2 focus:ring-primary"
                >
                  <option value="">Any</option>
                  {prepTimes.map(time => (
                    <option key={time} value={time}>{time} min</option>
                  ))}
                </select>
              </div>

              {/* Meal Type Filter */}
              <div>
                <label className="block text-sm font-medium mb-2 text-white">Meal Type</label>
                <select
                  value={filters.mealType || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, mealType: e.target.value || undefined }))}
                  className="w-full p-2 bg-white/10 border-white/20 text-white rounded-lg focus:ring-2 focus:ring-primary"
                >
                  <option value="">Any</option>
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="snack">Snack</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Recipe Grid */}
        <div className="flex-1 p-6 overflow-y-auto">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-xl mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : filteredRecipes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRecipes.map((recipe) => (
                <Card
                  key={recipe.id}
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 group bg-white/10 backdrop-blur-xl border border-white/20"
                  onClick={() => handleSelectRecipe(recipe)}
                >
                  <div className="h-48 relative overflow-hidden rounded-t-xl">
                    {recipe.imageUrl ? (
                      <img
                        src={recipe.imageUrl}
                        alt={recipe.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                        <ChefHat className="h-12 w-12 text-primary" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                    
                    {/* Recipe badges */}
                    <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                      <div className="flex gap-2">
                        <Badge className={`text-xs px-2 py-1 rounded-lg backdrop-blur-sm ${
                          recipe.difficulty === 'easy' ? 'bg-emerald-500/90 text-white' :
                          recipe.difficulty === 'medium' ? 'bg-yellow-500/90 text-white' :
                          'bg-red-500/90 text-white'
                        }`}>
                          {recipe.difficulty.charAt(0).toUpperCase() + recipe.difficulty.slice(1)}
                        </Badge>
                        {recipe.cuisine && (
                          <Badge className="text-xs px-2 py-1 rounded-lg backdrop-blur-sm bg-blue-500/90 text-white">
                            {recipe.cuisine}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Recipe info overlay */}
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="text-lg font-bold text-white mb-2 leading-tight line-clamp-2">
                        {recipe.title}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-white/90">
                        <span className="flex items-center gap-1 bg-black/20 rounded-lg px-2 py-1 backdrop-blur-sm">
                          <Clock className="h-3 w-3" />
                          {(recipe.cookTime || 0) + (recipe.prepTime || 0)}m
                        </span>
                        <span className="flex items-center gap-1 bg-black/20 rounded-lg px-2 py-1 backdrop-blur-sm">
                          <Users className="h-3 w-3" />
                          {recipe.servings}
                        </span>
                        {recipe.rating > 0 && (
                          <span className="flex items-center gap-1 bg-black/20 rounded-lg px-2 py-1 backdrop-blur-sm">
                            <Star className="h-3 w-3 fill-current text-yellow-400" />
                            {recipe.rating}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <p className="text-sm text-white/60 leading-relaxed line-clamp-2">
                      {recipe.description}
                    </p>

                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/20">
                      <div className="flex flex-wrap gap-1">
                        {(recipe.tags || []).slice(0, 2).map(tag => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-xs px-2 py-1 bg-primary/10 text-primary border-0"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <ChefHat className="h-16 w-16 text-white/40 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-white">No Recipes Found</h3>
              <p className="text-white/60 mb-6">
                Try adjusting your search or filters to find the perfect recipe.
              </p>
              <Button variant="outline" onClick={clearFilters} className="text-white border-white/20 hover:bg-white/10">
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};