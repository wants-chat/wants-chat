import React from 'react';
import { Card } from '../../ui/card';
import Icon from '@mdi/react';
import FoodItem, { Food } from './FoodItem';

interface FoodSectionProps {
  title: string;
  icon: string;
  iconColor?: string;
  foods: Food[];
  favoriteFoods: Food[];
  emptyMessage: string;
  onSelectFood: (food: Food) => void;
  onToggleFavorite: (foodId: string) => void;
  showTime?: boolean;
}

const FoodSection: React.FC<FoodSectionProps> = ({
  title,
  icon,
  iconColor,
  foods,
  favoriteFoods,
  emptyMessage,
  onSelectFood,
  onToggleFavorite,
  showTime
}) => {
  return (
    <Card className="p-6 bg-white/5 border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <Icon path={icon} size={1} className={iconColor || 'text-white/60'} />
      </div>

      {foods.length > 0 ? (
        <div className="space-y-2">
          {foods.map((food: any) => (
            <FoodItem
              key={food.id}
              food={food}
              onSelect={onSelectFood}
              onToggleFavorite={onToggleFavorite}
              isFavorite={favoriteFoods.some(f => f.id === food.id)}
              showTime={showTime ? food.lastUsed : undefined}
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-white/60 py-4">{emptyMessage}</p>
      )}
    </Card>
  );
};

export default FoodSection;