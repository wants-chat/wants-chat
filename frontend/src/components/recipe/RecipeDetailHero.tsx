import React from 'react';
import { Clock, Users, Heart, Share, ChefHat, Sparkles, Play, Edit, Download, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { LegacyRecipe } from '../../types/recipe';
import { RecipeRatingDisplay } from './RecipeRatingDisplay';
import { exportRecipeToPDF } from '../../utils/recipePdfExport';
import { toast } from '../ui/use-toast';
import { useAuth } from '../../contexts/AuthContext';

interface RecipeDetailHeroProps {
  recipe: LegacyRecipe & { userId?: string };
  onToggleFavorite: () => void;
  onStartCooking: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const RecipeDetailHero: React.FC<RecipeDetailHeroProps> = ({
  recipe,
  onToggleFavorite,
  onStartCooking,
  onEdit,
  onDelete
}) => {
  const { user, isAuthenticated } = useAuth();

  // Check if current user is the recipe owner
  const isOwner = isAuthenticated && user?.id && recipe.userId && user.id === recipe.userId;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'Hard': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const handleExportPDF = () => {
    try {
      exportRecipeToPDF(recipe);
      toast({
        title: 'Recipe exported!',
        description: 'Your recipe has been downloaded as a PDF.',
      });
    } catch (error) {
      console.error('Failed to export recipe:', error);
      toast({
        title: 'Export failed',
        description: 'Failed to export the recipe. Please try again.',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="mb-8">
      <div className="relative h-64 sm:h-80 lg:h-96 rounded-2xl overflow-hidden mb-6">
        {recipe.image ? (
          <img 
            src={recipe.image} 
            alt={recipe.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-primary/20 to-primary/10 flex items-center justify-center">
            <ChefHat className="h-24 w-24 text-primary/50" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent"></div>
        
        {/* Floating badges */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
          <div className="flex gap-2 flex-wrap">
            {recipe.aiAnalyzed && (
              <Badge className="bg-purple-500/90 text-white">
                <Sparkles className="h-3 w-3 mr-1" />
                AI Generated
              </Badge>
            )}
            <Badge className={`${getDifficultyColor(recipe.difficulty)}`}>
              {recipe.difficulty}
            </Badge>
            {recipe.cuisine && (
              <Badge variant="secondary" className="bg-white/20 text-white border border-white/30">
                {recipe.cuisine}
              </Badge>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleFavorite}
              className="bg-white/20 hover:bg-white/30 h-10 w-10"
            >
              {recipe.isFavorite ? (
                <Heart className="h-5 w-5 text-red-500 fill-current" />
              ) : (
                <Heart className="h-5 w-5 text-white" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="bg-white/20 hover:bg-white/30 h-10 w-10"
            >
              <Share className="h-5 w-5 text-white" />
            </Button>
          </div>
        </div>

        {/* Recipe info overlay */}
        <div className="absolute bottom-4 left-4 right-4">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 leading-tight">
            {recipe.title}
          </h1>
          <div className="flex items-center gap-4 text-white/90 text-sm sm:text-base">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {recipe.prepTime + recipe.cookTime}m
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {recipe.servings} servings
            </span>
            <RecipeRatingDisplay
              recipeId={recipe.id}
              averageRating={recipe.rating || 0}
              totalRatings={0}
              showFullDetails={false}
            />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
        <Button
          onClick={onStartCooking}
          className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white rounded-xl h-12 flex-1"
        >
          <Play className="h-4 w-4 mr-2" />
          Start Cooking
        </Button>
        {isOwner && (
          <Button
            variant="ghost"
            className="rounded-xl h-12 px-6 border border-white/20 text-white hover:bg-white/10"
            onClick={onEdit}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Recipe
          </Button>
        )}
        <Button
          variant="ghost"
          className="rounded-xl h-12 px-6 border border-white/20 text-white hover:bg-white/10"
          onClick={handleExportPDF}
        >
          <Download className="h-4 w-4 mr-2" />
          Export PDF
        </Button>
        {isOwner && onDelete && (
          <Button
            variant="ghost"
            className="rounded-xl h-12 px-6 border border-red-500/30 text-red-400 hover:bg-red-500/20 hover:text-red-300"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        )}
      </div>
    </div>
  );
};