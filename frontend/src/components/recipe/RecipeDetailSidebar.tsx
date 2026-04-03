import React from 'react';
import { Clock, Timer, Users, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { LegacyRecipe } from '../../types/recipe';

interface RecipeDetailSidebarProps {
  recipe: LegacyRecipe;
  completedIngredients: boolean[];
  onToggleIngredient: (index: number) => void;
}

export const RecipeDetailSidebar: React.FC<RecipeDetailSidebarProps> = ({
  recipe,
  completedIngredients,
  onToggleIngredient
}) => {
  return (
    <div className="space-y-6">
      {/* Recipe Info */}
      <Card className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20">
        <CardHeader>
          <CardTitle className="text-lg text-white">Recipe Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl">
              <Clock className="h-5 w-5 mx-auto mb-1 text-primary" />
              <p className="text-xs text-white/60">Prep Time</p>
              <p className="font-semibold text-white">{recipe.prepTime}m</p>
            </div>
            <div className="text-center p-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl">
              <Timer className="h-5 w-5 mx-auto mb-1 text-primary" />
              <p className="text-xs text-white/60">Cook Time</p>
              <p className="font-semibold text-white">{recipe.cookTime}m</p>
            </div>
          </div>
          <div className="text-center p-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl">
            <Users className="h-5 w-5 mx-auto mb-1 text-primary" />
            <p className="text-xs text-white/60">Servings</p>
            <p className="font-semibold text-white">{recipe.servings}</p>
          </div>
        </CardContent>
      </Card>

      {/* Ingredients */}
      <Card className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-white">
            <span className="text-lg">Ingredients</span>
            <Badge variant="secondary" className="text-xs bg-white/10 text-white border border-white/20">
              {completedIngredients.filter(Boolean).length} / {recipe.ingredients.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recipe.ingredients.map((ingredient, index) => (
              <div
                key={index}
                className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                  completedIngredients[index]
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                    : 'hover:bg-white/5 hover:backdrop-blur-sm hover:border hover:border-white/10'
                }`}
                onClick={() => onToggleIngredient(index)}
              >
                <div className="flex-shrink-0">
                  {completedIngredients[index] ? (
                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <div className="w-5 h-5 border-2 border-white/30 rounded-full"></div>
                  )}
                </div>
                <span
                  className={`text-sm text-white/80 ${
                    completedIngredients[index] ? 'line-through' : ''
                  }`}
                >
                  {ingredient}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Nutrition Info - Hidden for now */}
      {/* {recipe.nutrition && (
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg">Nutrition (per serving)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Calories</span>
                <span className="font-semibold">{recipe.nutrition.calories}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Protein</span>
                <span className="font-semibold">{recipe.nutrition.protein}g</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Carbs</span>
                <span className="font-semibold">{recipe.nutrition.carbs}g</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Fat</span>
                <span className="font-semibold">{recipe.nutrition.fat}g</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )} */}
    </div>
  );
};