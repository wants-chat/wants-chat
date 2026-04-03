import React from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import Icon from '@mdi/react';
import { 
  mdiClockOutline, 
  mdiAccount, 
  mdiStar,
  mdiHeart,
  mdiHeartOutline
} from '@mdi/js';

export interface Recipe {
  id: string;
  name: string;
  description: string;
  category: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: string[];
  instructions: string[];
  imageUrl?: string;
  tags: string[];
  rating: number;
  reviews: number;
  isFavorite?: boolean;
}

interface RecipeCardProps {
  recipe: Recipe;
  onRecipeClick: (recipeId: string) => void;
  onToggleFavorite: (recipeId: string) => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  onRecipeClick,
  onToggleFavorite
}) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-emerald-100 text-emerald-800';
      case 'Medium':
        return 'bg-orange-100 text-orange-800';
      case 'Hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card 
      className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => onRecipeClick(recipe.id)}
    >
      {/* Recipe Image */}
      <div className="h-48 bg-gradient-to-br from-primary/10 to-primary/20 relative">
        <div className="absolute top-3 right-3">
          <Button
            variant="ghost"
            size="icon"
            className="bg-white/90 hover:bg-white"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(recipe.id);
            }}
          >
            <Icon 
              path={recipe.isFavorite ? mdiHeart : mdiHeartOutline} 
              size={0.8} 
              className={recipe.isFavorite ? 'text-red-500' : 'text-gray-600'}
            />
          </Button>
        </div>
        
        <div className="absolute bottom-3 left-3">
          <Badge className={getDifficultyColor(recipe.difficulty)}>
            {recipe.difficulty}
          </Badge>
        </div>
      </div>

      {/* Recipe Content */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-foreground flex-1">
            {recipe.name}
          </h3>
          <div className="flex items-center gap-1">
            <Icon path={mdiStar} size={0.6} className="text-yellow-500" />
            <span className="text-sm font-medium">{recipe.rating}</span>
            <span className="text-xs text-muted-foreground">({recipe.reviews})</span>
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground mb-4">
          {recipe.description}
        </p>

        {/* Recipe Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Icon path={mdiClockOutline} size={0.8} className="text-muted-foreground" />
            <span className="text-sm text-foreground">
              {recipe.prepTime + recipe.cookTime} min
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Icon path={mdiAccount} size={0.8} className="text-muted-foreground" />
            <span className="text-sm text-foreground">
              {recipe.servings} {recipe.servings === 1 ? 'serving' : 'servings'}
            </span>
          </div>
        </div>

        {/* Nutrition Info */}
        <div className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg">
          <div className="text-center">
            <p className="text-lg font-bold text-primary">{recipe.calories}</p>
            <p className="text-xs text-muted-foreground">calories</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-blue-600">{recipe.protein}g</p>
            <p className="text-xs text-muted-foreground">protein</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-emerald-600">{recipe.carbs}g</p>
            <p className="text-xs text-muted-foreground">carbs</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-orange-600">{recipe.fat}g</p>
            <p className="text-xs text-muted-foreground">fat</p>
          </div>
        </div>

        {/* Tags */}
        <div className="flex gap-2 mt-4 flex-wrap">
          {recipe.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default RecipeCard;