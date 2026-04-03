import React from 'react';
import { Card } from '../../ui/card';
import { Recipe } from './RecipeCard';

interface RecipeStatsProps {
  recipes: Recipe[];
}

const RecipeStats: React.FC<RecipeStatsProps> = ({ recipes }) => {
  const favoriteCount = recipes.filter(r => r.isFavorite).length;
  const avgCalories = recipes.length > 0 
    ? Math.round(recipes.reduce((sum, r) => sum + r.calories, 0) / recipes.length)
    : 0;

  return (
    <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-2xl font-bold text-blue-600">{recipes.length}</p>
          <p className="text-sm text-muted-foreground">Total Recipes</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-primary">{favoriteCount}</p>
          <p className="text-sm text-muted-foreground">Favorites</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-emerald-600">{avgCalories}</p>
          <p className="text-sm text-muted-foreground">Avg Calories</p>
        </div>
      </div>
    </Card>
  );
};

export default RecipeStats;