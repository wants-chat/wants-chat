import React from 'react';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import Icon from '@mdi/react';
import { mdiStar, mdiChevronRight } from '@mdi/js';

export interface Food {
  id: string;
  name: string;
  brand?: string;
  category: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  servingSize: number;
  servingUnit: string;
  isCommon?: boolean;
  isFavorite?: boolean;
  barcode?: string;
}

interface FoodItemProps {
  food: Food;
  onSelect: (food: Food) => void;
  onToggleFavorite: (foodId: string) => void;
  isFavorite: boolean;
  showTime?: Date;
}

const FoodItem: React.FC<FoodItemProps> = ({
  food,
  onSelect,
  onToggleFavorite,
  isFavorite,
  showTime
}) => {
  return (
    <div
      className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg cursor-pointer transition-colors"
      onClick={() => onSelect(food)}
    >
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-white">{food.name}</h4>
          {food.brand && (
            <Badge className="text-xs bg-white/10 text-white/80 border border-white/20">
              {food.brand}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-4 mt-1">
          <p className="text-sm text-white/60">
            {food.calories} cal / {food.servingSize}{food.servingUnit}
          </p>
          {showTime && (
            <p className="text-xs text-white/60">
              {new Date(showTime).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
              })}
            </p>
          )}
        </div>

        <div className="flex gap-3 mt-1 text-xs text-white/60">
          <span key="carbs">C: {food.carbs}g</span>
          <span key="protein">P: {food.protein}g</span>
          <span key="fat">F: {food.fat}g</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          size="icon"
          className="h-8 w-8 bg-transparent hover:bg-white/10"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(food.id);
          }}
        >
          <Icon
            path={mdiStar}
            size={0.7}
            className={isFavorite ? 'text-yellow-400' : 'text-white/40'}
          />
        </Button>

        <Icon path={mdiChevronRight} size={0.8} className="text-white/40" />
      </div>
    </div>
  );
};

export default FoodItem;