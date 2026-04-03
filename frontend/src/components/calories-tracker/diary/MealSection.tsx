import React from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import Icon from '@mdi/react';
import { 
  mdiPlus, 
  mdiPencil, 
  mdiDelete,
  mdiCoffee,
  mdiWhiteBalanceSunny,
  mdiWeatherNight,
  mdiFoodApple,
  mdiFire,
  mdiBarley,
  mdiDumbbell,
  mdiOilTemperature
} from '@mdi/js';

export interface FoodEntry {
  id: string;
  name: string;
  brand?: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  quantity: number;
  unit: string;
  time: Date;
  mealType?: string;
}

interface MealSectionProps {
  mealName: string;
  mealId: string;
  entries: FoodEntry[];
  goalCalories: number;
  onAddFood: () => void;
  onEditFood: (entry: FoodEntry) => void;
  onDeleteFood: (entryId: string) => void;
}

const MealSection: React.FC<MealSectionProps> = ({
  mealName,
  mealId,
  entries,
  goalCalories,
  onAddFood,
  onEditFood,
  onDeleteFood
}) => {
  const mealTotals = entries.reduce(
    (totals, entry) => ({
      calories: totals.calories + entry.calories,
      carbs: totals.carbs + entry.carbs,
      protein: totals.protein + entry.protein,
      fat: totals.fat + entry.fat
    }),
    { calories: 0, carbs: 0, protein: 0, fat: 0 }
  );

  const caloriesProgress = Math.min((mealTotals.calories / goalCalories) * 100, 100);

  const getMealIcon = () => {
    switch(mealName) {
      case 'Breakfast': return mdiCoffee;
      case 'Lunch': return mdiWhiteBalanceSunny;
      case 'Dinner': return mdiWeatherNight;
      case 'Snacks': return mdiFoodApple;
      default: return mdiPlus;
    }
  };

  return (
    <Card className="p-6 bg-white/5 border border-white/10">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg">
              <Icon path={getMealIcon()} size={1} className="text-white" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-white">{mealName}</h3>
            <div className="flex items-center gap-2">
              <p className="text-sm text-white/60">
                {mealTotals.calories} of {goalCalories} calories
              </p>
              <Badge className={`text-xs ${caloriesProgress >= 90 ? "bg-teal-500/20 text-teal-400 border border-teal-500/30" : "bg-white/10 text-white/70 border border-white/20"}`}>
                {Math.round(caloriesProgress)}%
              </Badge>
            </div>
          </div>
          </div>

          <Button size="sm" onClick={onAddFood} className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-600 hover:to-cyan-600">
            <Icon path={mdiPlus} size={0.6} className="mr-1" />
            Add Food
          </Button>
        </div>

        {entries.length > 0 ? (
          <div className="space-y-3">
            {entries.map((entry) => (
              <div key={entry.id} className="p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-white">{entry.name}</h4>
                      {entry.brand && (
                        <Badge className="text-xs bg-teal-500/20 text-teal-400 border border-teal-500/30">
                          {entry.brand}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-white/60">
                        {entry.quantity} {entry.unit} • <span className="font-medium text-white">{entry.calories} cal</span> •
                        <span className="text-emerald-400"> C: {entry.carbs}g</span> •
                        <span className="text-blue-400"> P: {entry.protein}g</span> •
                        <span className="text-orange-400"> F: {entry.fat}g</span>
                      </p>
                      <p className="text-xs text-white/60">
                        {entry.time.toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-1 ml-4">
                    <Button size="sm" onClick={() => onEditFood(entry)} className="h-8 w-8 p-0 bg-transparent hover:bg-white/10 text-white/60 hover:text-white">
                      <Icon path={mdiPencil} size={0.6} />
                    </Button>
                    <Button size="sm" onClick={() => onDeleteFood(entry.id)} className="h-8 w-8 p-0 bg-transparent hover:bg-red-500/20 text-white/60 hover:text-red-400">
                      <Icon path={mdiDelete} size={0.6} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 space-y-3">
            <div className="p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg">
              <p className="text-white/60">No foods logged for {mealName.toLowerCase()}</p>
              <Button className="mt-2 bg-transparent text-teal-400 hover:text-teal-300 hover:bg-transparent underline" onClick={onAddFood}>
                Add your first food
              </Button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-4 gap-3">
          <div className="text-center p-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg">
            <Icon path={mdiFire} size={0.8} className="text-orange-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-white">{mealTotals.calories}</p>
            <p className="text-xs text-white/60">Calories</p>
          </div>
          <div className="text-center p-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg">
            <Icon path={mdiBarley} size={0.8} className="text-emerald-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-emerald-400">{mealTotals.carbs}g</p>
            <p className="text-xs text-white/60">Carbs</p>
          </div>
          <div className="text-center p-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg">
            <Icon path={mdiDumbbell} size={0.8} className="text-blue-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-blue-400">{mealTotals.protein}g</p>
            <p className="text-xs text-white/60">Protein</p>
          </div>
          <div className="text-center p-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg">
            <Icon path={mdiOilTemperature} size={0.8} className="text-orange-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-orange-400">{mealTotals.fat}g</p>
            <p className="text-xs text-white/60">Fat</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default MealSection;