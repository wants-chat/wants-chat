import React, { useState, useMemo } from 'react';
import { Search, X, Clock, Users, Star, Heart } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Recipe } from '../../types/recipe';
import { MealType } from '../../types/mealPlan';
import { useFavoriteRecipes } from '../../hooks/useRecipes';

interface RecipePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRecipe: (recipe: Recipe) => void;
  recipes: Recipe[];
  mealType?: MealType;
}

export const RecipePicker: React.FC<RecipePickerProps> = ({
  isOpen,
  onClose,
  onSelectRecipe,
  recipes,
  mealType
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedCuisine, setSelectedCuisine] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('all');

  const { data: favoriteRecipes } = useFavoriteRecipes();

  // Get suggested recipes based on meal type
  const suggestedRecipes = useMemo(() => {
    if (!mealType) return recipes;
    
    // Filter recipes that match the meal type or are suitable for the meal
    return recipes.filter(recipe => {
      // Check if recipe category or tags match the meal type
      if (recipe.category?.toLowerCase() === mealType) return true;
      
      // Additional logic for meal type matching
      switch (mealType) {
        case 'breakfast':
          return recipe.tags?.some(tag => 
            ['breakfast', 'morning', 'cereal', 'eggs', 'pancakes'].includes(tag.toLowerCase())
          );
        case 'lunch':
          return recipe.tags?.some(tag =>
            ['lunch', 'salad', 'sandwich', 'soup'].includes(tag.toLowerCase())
          );
        case 'dinner':
          return recipe.tags?.some(tag =>
            ['dinner', 'main course', 'pasta', 'meat', 'fish'].includes(tag.toLowerCase())
          );
        case 'snack':
          return (recipe.prepTime + recipe.cookTime) <= 30 || recipe.tags?.some(tag =>
            ['snack', 'appetizer', 'quick'].includes(tag.toLowerCase())
          );
        case 'dessert':
          return recipe.tags?.some(tag =>
            ['dessert', 'sweet', 'cake', 'cookies'].includes(tag.toLowerCase())
          );
        default:
          return true;
      }
    });
  }, [recipes, mealType]);

  // Filter recipes based on search and filters
  const filteredRecipes = useMemo(() => {
    let filtered = recipes;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(recipe =>
        recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.ingredients?.some(ingredient =>
          ingredient.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply difficulty filter
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(recipe => recipe.difficulty === selectedDifficulty);
    }

    // Apply cuisine filter
    if (selectedCuisine !== 'all') {
      filtered = filtered.filter(recipe => recipe.cuisine === selectedCuisine);
    }

    return filtered;
  }, [recipes, searchTerm, selectedDifficulty, selectedCuisine]);

  // Get unique cuisines for filter
  const cuisines = useMemo(() => {
    const uniqueCuisines = [...new Set(recipes.map(r => r.cuisine).filter(Boolean))];
    return uniqueCuisines;
  }, [recipes]);

  const handleRecipeSelect = (recipe: Recipe) => {
    onSelectRecipe(recipe);
    setSearchTerm('');
    setSelectedDifficulty('all');
    setSelectedCuisine('all');
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'hard': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const RecipeCard: React.FC<{ recipe: Recipe }> = ({ recipe }) => (
    <Card
      className="cursor-pointer hover:shadow-lg transition-shadow rounded-xl bg-white/10 backdrop-blur-xl border border-white/20"
      onClick={() => handleRecipeSelect(recipe)}
    >
      <CardContent className="p-4">
        <div className="flex gap-3">
          {/* Recipe Image */}
          <div className="w-16 h-16 flex-shrink-0">
            {recipe.imageUrl ? (
              <img
                src={recipe.imageUrl}
                alt={recipe.title}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center">
                <span className="text-xs font-medium text-primary">
                  {recipe.title.charAt(0)}
                </span>
              </div>
            )}
          </div>

          {/* Recipe Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-medium text-sm line-clamp-2 text-white">{recipe.title}</h4>
              {recipe.isFavorited && (
                <Heart className="h-4 w-4 text-red-500 fill-current flex-shrink-0 ml-2" />
              )}
            </div>

            {recipe.description && (
              <p className="text-xs text-white/60 line-clamp-1 mb-2">
                {recipe.description}
              </p>
            )}

            {/* Recipe Stats */}
            <div className="flex items-center gap-3 text-xs text-white/60 mb-2">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {recipe.prepTime + recipe.cookTime}m
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {recipe.servings}
              </span>
              {recipe.rating && (
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-current text-yellow-400" />
                  {recipe.rating.toFixed(1)}
                </span>
              )}
            </div>

            {/* Tags */}
            <div className="flex items-center gap-1 flex-wrap">
              {recipe.difficulty && (
                <Badge className={`text-xs px-1.5 py-0.5 ${getDifficultyColor(recipe.difficulty)}`}>
                  {recipe.difficulty}
                </Badge>
              )}
              {recipe.cuisine && (
                <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                  {recipe.cuisine}
                </Badge>
              )}
              {recipe.category && (
                <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                  {recipe.category}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Choose a Recipe {mealType && `for ${mealType}`}</span>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 flex-1 overflow-hidden">
          {/* Search and Filters */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search recipes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedCuisine} onValueChange={setSelectedCuisine}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Cuisine" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cuisines</SelectItem>
                {cuisines.map(cuisine => (
                  <SelectItem key={cuisine} value={cuisine!}>
                    {cuisine}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Recipe Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="suggestions">
                Suggestions ({suggestedRecipes.length})
              </TabsTrigger>
              <TabsTrigger value="favorites">
                Favorites ({favoriteRecipes?.data?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="popular">
                Popular (0)
              </TabsTrigger>
              <TabsTrigger value="all">
                All ({filteredRecipes.length})
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto">
              <TabsContent value="suggestions" className="mt-4 space-y-3">
                {suggestedRecipes.length > 0 ? (
                  suggestedRecipes.map(recipe => (
                    <RecipeCard key={recipe.id} recipe={recipe} />
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-white/60">No recipe suggestions for this meal type</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="favorites" className="mt-4 space-y-3">
                {favoriteRecipes?.data && favoriteRecipes.data.length > 0 ? (
                  favoriteRecipes.data.map(recipe => (
                    <RecipeCard key={recipe.id} recipe={recipe} />
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-white/60">No favorite recipes yet</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="popular" className="mt-4 space-y-3">
                <div className="text-center py-8">
                  <p className="text-white/60">No popular recipes available</p>
                </div>
              </TabsContent>

              <TabsContent value="all" className="mt-4 space-y-3">
                {filteredRecipes.length > 0 ? (
                  filteredRecipes.map(recipe => (
                    <RecipeCard key={recipe.id} recipe={recipe} />
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-white/60">No recipes found</p>
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};