import React, { useState } from 'react';
import { Clock, Users, Trash2, Edit, ChefHat, Star } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { MealPlanMeal } from '../../types/mealPlan';
import { useRecipe } from '../../hooks/useRecipes';

interface MealSlotProps {
  meal: MealPlanMeal;
  isEditing?: boolean;
  onRemove?: () => void;
  onEdit?: () => void;
  onCook?: () => void;
}

export const MealSlot: React.FC<MealSlotProps> = ({
  meal,
  isEditing = false,
  onRemove,
  onEdit,
  onCook
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  console.log('MealSlot rendering with meal:', meal);
  
  const { data: recipe, loading } = useRecipe(meal.recipeId);

  if (loading) {
    return (
      <Card className="h-20 rounded-xl animate-pulse bg-white/10 backdrop-blur-xl border border-white/20">
        <CardContent className="p-3 h-full">
          <div className="bg-white/20 rounded h-4 w-3/4 mb-2"></div>
          <div className="bg-white/20 rounded h-3 w-1/2"></div>
        </CardContent>
      </Card>
    );
  }

  if (!recipe) {
    return (
      <Card className="h-20 rounded-xl border-red-400/50 bg-white/10 backdrop-blur-xl">
        <CardContent className="p-3 h-full flex items-center justify-center">
          <span className="text-red-400 text-sm">Recipe not found</span>
        </CardContent>
      </Card>
    );
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'hard': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  return (
    <Card
      className="rounded-xl hover:shadow-lg transition-all duration-200 cursor-pointer group bg-white/10 backdrop-blur-xl border border-white/20"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-3">
        <div className="flex items-start gap-3">
          {/* Recipe Image */}
          <div className="relative w-12 h-12 flex-shrink-0">
            {recipe.imageUrl ? (
              <img
                src={recipe.imageUrl}
                alt={recipe.title}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center">
                <ChefHat className="h-6 w-6 text-primary/50" />
              </div>
            )}

            {/* Servings Badge */}
            <Badge
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
              variant="secondary"
            >
              {meal.servings}
            </Badge>
          </div>

          {/* Recipe Info */}
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm line-clamp-1 mb-1 text-white">
              {recipe.title}
            </h4>

            <div className="flex items-center gap-2 text-xs text-white/60 mb-2">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {recipe.prepTime + recipe.cookTime}m
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {meal.servings}
              </span>
              {recipe.rating && (
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-current text-yellow-400" />
                  {recipe.rating.toFixed(1)}
                </span>
              )}
            </div>

            {/* Tags */}
            <div className="flex items-center gap-1">
              {recipe.difficulty && (
                <Badge className={`text-xs px-1.5 py-0.5 ${getDifficultyColor(recipe.difficulty)}`}>
                  {recipe.difficulty}
                </Badge>
              )}
              {meal.mealType && (
                <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                  {meal.mealType}
                </Badge>
              )}
            </div>

            {/* Notes */}
            {meal.notes && (
              <p className="text-xs text-white/60 mt-1 line-clamp-1">
                {meal.notes}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons - Show on hover or when editing */}
        {(isHovered || isEditing) && (
          <div className="flex items-center justify-end gap-1 mt-2 pt-2 border-t border-white/20">
            {onCook && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs text-white hover:bg-white/10"
                onClick={(e) => {
                  e.stopPropagation();
                  onCook();
                }}
              >
                Cook
              </Button>
            )}
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs text-white hover:bg-white/10"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
              >
                <Edit className="h-3 w-3" />
              </Button>
            )}
            {isEditing && onRemove && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs hover:bg-red-500/20 hover:text-red-400"
                onClick={(e) => {
                  e.stopPropagation();
                  console.log('Delete button clicked for meal:', meal);
                  onRemove();
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};