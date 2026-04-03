import React, { useState } from 'react';
import { Card } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Progress } from '../../ui/progress';
import { Button } from '../../ui/button';
import { Apple, Beef, Wheat, Droplets, Plus } from 'lucide-react';

interface NutrientData {
  name: string;
  current: number;
  target: number;
  unit: string;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface MealEntry {
  id: string;
  name: string;
  calories: number;
  time: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

interface NutritionTrackerProps {
  dailyCalorieGoal?: number;
  onAddMeal?: () => void;
}

const NutritionTracker: React.FC<NutritionTrackerProps> = ({
  dailyCalorieGoal = 2000,
  onAddMeal
}) => {
  const [nutrients] = useState<NutrientData[]>([
    { name: 'Protein', current: 85, target: 120, unit: 'g', color: 'text-destructive', icon: Beef },
    { name: 'Carbs', current: 210, target: 250, unit: 'g', color: 'text-primary', icon: Wheat },
    { name: 'Fat', current: 45, target: 65, unit: 'g', color: 'text-emerald-600', icon: Apple },
    { name: 'Water', current: 1.8, target: 2.5, unit: 'L', color: 'text-primary', icon: Droplets }
  ]);

  const [meals] = useState<MealEntry[]>([
    { id: '1', name: 'Oatmeal with berries', calories: 320, time: '8:00 AM', type: 'breakfast' },
    { id: '2', name: 'Grilled chicken salad', calories: 450, time: '12:30 PM', type: 'lunch' },
    { id: '3', name: 'Protein shake', calories: 180, time: '3:00 PM', type: 'snack' }
  ]);

  const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
  const remainingCalories = dailyCalorieGoal - totalCalories;
  const calorieProgress = (totalCalories / dailyCalorieGoal) * 100;

  const getMealTypeColor = (type: MealEntry['type']) => {
    switch (type) {
      case 'breakfast': return 'bg-primary/10 text-primary';
      case 'lunch': return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400';
      case 'dinner': return 'bg-destructive/10 text-destructive';
      case 'snack': return 'bg-muted/20 text-muted-foreground';
      default: return 'bg-muted/10 text-muted-foreground';
    }
  };

  const getNutrientProgress = (nutrient: NutrientData) => {
    return Math.min((nutrient.current / nutrient.target) * 100, 100);
  };

  return (
    <Card className="p-6 bg-card border">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1">Nutrition Tracker</h3>
          <p className="text-sm text-muted-foreground">Monitor your daily nutrition intake</p>
        </div>
        <Button size="sm" onClick={onAddMeal} className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600">
          <Plus className="h-4 w-4 mr-1" />
          Add Meal
        </Button>
      </div>

      {/* Calorie Progress */}
      <div className="mb-6 p-4 bg-secondary/20 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Daily Calories</p>
            <p className="text-2xl font-bold text-foreground">
              {totalCalories} <span className="text-sm font-normal text-muted-foreground">/ {dailyCalorieGoal} cal</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-muted-foreground">Remaining</p>
            <p className={`text-xl font-bold ${remainingCalories > 0 ? 'text-emerald-600' : 'text-destructive'}`}>
              {Math.abs(remainingCalories)}
            </p>
          </div>
        </div>
        <Progress value={calorieProgress} className="h-3" />
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>{calorieProgress.toFixed(0)}% consumed</span>
          <span>{remainingCalories > 0 ? 'Under target' : 'Over target'}</span>
        </div>
      </div>

      {/* Nutrient Breakdown */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-foreground mb-3">Nutrient Breakdown</h4>
        <div className="space-y-3">
          {nutrients.map((nutrient) => {
            const Icon = nutrient.icon;
            const progress = getNutrientProgress(nutrient);
            
            return (
              <div key={nutrient.name} className="flex items-center gap-3">
                <div className={`p-1.5 rounded ${nutrient.color} bg-current/10`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-foreground">{nutrient.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {nutrient.current}{nutrient.unit} / {nutrient.target}{nutrient.unit}
                    </span>
                  </div>
                  <Progress value={progress} className="h-1.5" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Meals */}
      <div>
        <h4 className="text-sm font-medium text-foreground mb-3">Today's Meals</h4>
        <div className="space-y-2">
          {meals.map((meal) => (
            <div key={meal.id} className="flex items-center justify-between p-3 bg-secondary/10 rounded-lg">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className={`text-xs ${getMealTypeColor(meal.type)}`}>
                  {meal.type}
                </Badge>
                <div>
                  <p className="text-sm font-medium text-foreground">{meal.name}</p>
                  <p className="text-xs text-muted-foreground">{meal.time}</p>
                </div>
              </div>
              <span className="text-sm font-semibold text-foreground">{meal.calories} cal</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="mt-4 p-3 bg-primary/10 rounded-lg">
        <p className="text-xs text-primary font-medium mb-1">💡 Nutrition Tip</p>
        <p className="text-xs text-muted-foreground">
          Aim to consume protein within 30 minutes after your workout for optimal muscle recovery.
        </p>
      </div>
    </Card>
  );
};

export default NutritionTracker;