import React from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import Icon from '@mdi/react';
import { 
  mdiPlus,
  mdiFoodApple,
  mdiInformation,
  mdiHeart,
  mdiDelete
} from '@mdi/js';
import { Food } from '../../../types/calories-tracker';

interface FoodCardProps {
  food: Food;
  onAdd?: (food: Food) => void;
  onInfo?: (food: Food) => void;
  onFavorite?: (food: Food) => void;
  onDelete?: (food: Food) => void;
  showActions?: boolean;
  compact?: boolean;
}

const FoodCard: React.FC<FoodCardProps> = ({
  food,
  onAdd,
  onInfo,
  onFavorite,
  onDelete,
  showActions = true,
  compact = false
}) => {
  const getFoodCategoryColor = (category: string) => {
    switch (category) {
      case 'vegetables':
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-200';
      case 'fruits':
        return 'bg-orange-500/10 text-orange-600 border-orange-200';
      case 'protein':
        return 'bg-red-500/10 text-red-600 border-red-200';
      case 'grains':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-200';
      case 'dairy':
        return 'bg-blue-500/10 text-blue-600 border-blue-200';
      case 'fats':
        return 'bg-purple-500/10 text-purple-600 border-purple-200';
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-200';
    }
  };

  if (compact) {
    return (
      <Card className="p-3 hover:shadow-md transition-all duration-200 border-l-4 border-l-primary">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Icon path={mdiFoodApple} size={0.8} className="text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">{food.name}</h4>
              {food.brand && (
                <p className="text-xs text-muted-foreground">{food.brand}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-sm font-bold text-foreground">{food.calories} cal</p>
              <p className="text-xs text-muted-foreground">{food.servingSize}</p>
            </div>
            {showActions && onAdd && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onAdd(food)}
                className="h-8 w-8 p-0"
              >
                <Icon path={mdiPlus} size={0.6} />
              </Button>
            )}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 hover:shadow-lg transition-all duration-200 group">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-primary/20 rounded-xl flex items-center justify-center">
              {food.imageUrl ? (
                <img
                  src={food.imageUrl}
                  alt={food.name}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <Icon path={mdiFoodApple} size={1} className="text-primary" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                {food.name}
              </h3>
              {food.brand && (
                <p className="text-sm text-muted-foreground">{food.brand}</p>
              )}
              <Badge variant="outline" className={`text-xs mt-1 ${getFoodCategoryColor(food.category)}`}>
                {food.category.replace('_', ' ')}
              </Badge>
            </div>
          </div>
          
          {showActions && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {onInfo && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onInfo(food)}
                  className="h-8 w-8 p-0"
                >
                  <Icon path={mdiInformation} size={0.6} />
                </Button>
              )}
              {onFavorite && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onFavorite(food)}
                  className="h-8 w-8 p-0"
                >
                  <Icon path={mdiHeart} size={0.6} />
                </Button>
              )}
              {onDelete && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDelete(food)}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                >
                  <Icon path={mdiDelete} size={0.6} />
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Nutrition Info */}
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="p-2 bg-secondary/30 rounded-lg">
            <p className="text-lg font-bold text-foreground">{food.calories}</p>
            <p className="text-xs text-muted-foreground">Calories</p>
          </div>
          <div className="p-2 bg-secondary/30 rounded-lg">
            <p className="text-lg font-bold text-foreground">{food.protein}g</p>
            <p className="text-xs text-muted-foreground">Protein</p>
          </div>
          <div className="p-2 bg-secondary/30 rounded-lg">
            <p className="text-lg font-bold text-foreground">{food.carbs}g</p>
            <p className="text-xs text-muted-foreground">Carbs</p>
          </div>
          <div className="p-2 bg-secondary/30 rounded-lg">
            <p className="text-lg font-bold text-foreground">{food.fat}g</p>
            <p className="text-xs text-muted-foreground">Fat</p>
          </div>
        </div>

        {/* Serving Size */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Per {food.servingSize} {food.servingUnit}</span>
          {showActions && onAdd && (
            <Button
              size="sm"
              onClick={() => onAdd(food)}
              className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-primary-foreground"
            >
              <Icon path={mdiPlus} size={0.6} className="mr-1" />
              Add
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default FoodCard;