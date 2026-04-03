import React from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Plus, Coffee, Sun, Sunset, Cookie } from 'lucide-react';

interface Meal {
  id: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  time?: string;
}

interface TodaysMealsProps {
  meals: Meal[];
  onAddMeal: (mealType: string) => void;
}

const TodaysMeals: React.FC<TodaysMealsProps> = ({
  meals,
  onAddMeal
}) => {
  const mealTypes = [
    { type: 'breakfast', name: 'Breakfast', icon: Coffee, color: 'blue' },
    { type: 'lunch', name: 'Lunch', icon: Sun, color: 'yellow' },
    { type: 'dinner', name: 'Dinner', icon: Sunset, color: 'orange' },
    { type: 'snack', name: 'Snacks', icon: Cookie, color: 'purple' }
  ];

  const getMealsByType = (type: string) => {
    return meals.filter(meal => meal.type === type);
  };

  const getMealTypeTotal = (type: string) => {
    const typeMeals = getMealsByType(type);
    return typeMeals.reduce((sum, meal) => sum + meal.calories, 0);
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Today's Meals</h3>
          <Badge variant="secondary">
            {meals.length} items logged
          </Badge>
        </div>

        <div className="space-y-4">
          {mealTypes.map(({ type, name, icon: Icon, color }) => {
            const mealItems = getMealsByType(type);
            const totalCalories = getMealTypeTotal(type);
            
            return (
              <div key={type} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 bg-${color}-100 dark:bg-${color}-950/20 rounded`}>
                      <Icon className={`h-4 w-4 text-${color}-600`} />
                    </div>
                    <h4 className="font-medium text-foreground">{name}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      {totalCalories} cal
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onAddMeal(type)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {mealItems.length > 0 ? (
                  <div className="space-y-2 pl-8">
                    {mealItems.map((meal) => (
                      <div key={meal.id} className="flex items-center justify-between p-2 bg-secondary/10 rounded-lg">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">{meal.name}</p>
                          {meal.time && (
                            <p className="text-xs text-muted-foreground">{meal.time}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{meal.calories} cal</p>
                          <p className="text-xs text-muted-foreground">
                            P:{meal.protein}g C:{meal.carbs}g F:{meal.fat}g
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground pl-8">No items logged</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};

export default TodaysMeals;