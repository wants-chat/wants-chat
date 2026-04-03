import React from 'react';
import { Search, Plus, ChefHat } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { RecipeGrid } from './RecipeGrid';
import { Recipe } from '../../types/recipe';

interface RecipeListProps {
  recipes: Recipe[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterCuisine: string;
  onCuisineChange: (cuisine: string) => void;
  filterDifficulty: string;
  onDifficultyChange: (difficulty: string) => void;
  cuisines: string[];
  onToggleFavorite: (recipeId: string, isCurrentlyFavorited: boolean) => void;
  onNavigate: (path: string) => void;
}

export const RecipeList: React.FC<RecipeListProps> = ({
  recipes,
  searchQuery,
  onSearchChange,
  filterCuisine,
  onCuisineChange,
  filterDifficulty,
  onDifficultyChange,
  cuisines,
  onToggleFavorite,
  onNavigate
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">My Recipes</h2>
          <p className="text-white/80">
            {recipes.length} recipe{recipes.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <Button
          onClick={() => onNavigate('/recipe-builder/add')}
          className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white rounded-xl h-12 px-6"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Recipe
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
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/40"
            />
          </div>

          {/* Filter Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-white mb-2 block">
                Cuisine
              </label>
              <Select value={filterCuisine} onValueChange={onCuisineChange}>
                <SelectTrigger className="h-10 rounded-xl bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="All cuisines" />
                </SelectTrigger>
                <SelectContent className="bg-teal-800/90 border-teal-400/30">
                  <SelectItem value="all" className="text-white hover:bg-white/10 focus:bg-white/10">All Cuisines</SelectItem>
                  {cuisines.map(cuisine => (
                    <SelectItem key={cuisine} value={cuisine} className="text-white hover:bg-white/10 focus:bg-white/10">{cuisine}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-white mb-2 block">
                Difficulty
              </label>
              <Select value={filterDifficulty} onValueChange={onDifficultyChange}>
                <SelectTrigger className="h-10 rounded-xl bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="All levels" />
                </SelectTrigger>
                <SelectContent className="bg-teal-800/90 border-teal-400/30">
                  <SelectItem value="all" className="text-white hover:bg-white/10 focus:bg-white/10">All Levels</SelectItem>
                  <SelectItem value="easy" className="text-white hover:bg-white/10 focus:bg-white/10">Easy</SelectItem>
                  <SelectItem value="medium" className="text-white hover:bg-white/10 focus:bg-white/10">Medium</SelectItem>
                  <SelectItem value="hard" className="text-white hover:bg-white/10 focus:bg-white/10">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <div className="w-full">
                <label className="text-sm font-medium text-white mb-2 block">
                  Results
                </label>
                <div className="h-10 flex items-center px-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white/80">
                  {recipes.length} recipe{recipes.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recipe Grid */}
      <RecipeGrid
        recipes={recipes}
        onToggleFavorite={(recipeId) => {
          const recipe = recipes.find(r => r.id === recipeId);
          if (recipe) {
            onToggleFavorite(recipeId, recipe.isFavorited);
          }
        }}
        emptyStateConfig={{
          title: 'No Recipes Found',
          description: recipes.length === 0 
            ? "You haven't created any recipes yet. Start by adding your first recipe!"
            : 'No recipes match your current filters. Try adjusting your search criteria.',
          actionLabel: 'Add New Recipe',
          onAction: () => onNavigate('/recipe-builder/add')
        }}
      />
    </div>
  );
};