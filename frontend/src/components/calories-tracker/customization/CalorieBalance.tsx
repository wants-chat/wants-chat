import React from 'react';
import { Card } from '../../ui/card';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Button } from '../../ui/button';
import Icon from '@mdi/react';
import { 
  mdiFire, 
  mdiCalculator, 
  mdiInformation,
  mdiPlus,
  mdiMinus
} from '@mdi/js';

interface CalorieBalanceProps {
  dailyCalories: number;
  onCaloriesChange: (calories: number) => void;
}

const CalorieBalance: React.FC<CalorieBalanceProps> = ({
  dailyCalories,
  onCaloriesChange
}) => {
  const handleInputChange = (value: string) => {
    const numValue = parseInt(value) || 0;
    if (numValue >= 800 && numValue <= 5000) {
      onCaloriesChange(numValue);
    }
  };

  const handleQuickAdjust = (amount: number) => {
    const newValue = dailyCalories + amount;
    if (newValue >= 800 && newValue <= 5000) {
      onCaloriesChange(newValue);
    }
  };

  const getCalorieCategory = (calories: number) => {
    if (calories < 1200) return { text: 'Very Low', color: 'text-red-600', bg: 'bg-red-50 border-red-200' };
    if (calories < 1500) return { text: 'Low', color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' };
    if (calories < 2500) return { text: 'Moderate', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' };
    if (calories < 3500) return { text: 'High', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' };
    return { text: 'Very High', color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' };
  };

  const category = getCalorieCategory(dailyCalories);

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Icon path={mdiFire} size={1.2} className="text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Daily Calorie Target</h2>
            <p className="text-sm text-muted-foreground">Adjust your daily calorie goal</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Calorie Input */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="calories">Daily Calories</Label>
              <div className="relative">
                <Input
                  id="calories"
                  type="number"
                  value={dailyCalories}
                  onChange={(e) => handleInputChange(e.target.value)}
                  min="800"
                  max="5000"
                  className="text-2xl font-bold text-center pr-16"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                  cal
                </span>
              </div>
            </div>

            {/* Quick Adjustments */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Quick Adjust</p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAdjust(-100)}
                  disabled={dailyCalories <= 800}
                >
                  <Icon path={mdiMinus} size={0.6} className="mr-1" />
                  -100
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAdjust(-50)}
                  disabled={dailyCalories <= 800}
                >
                  <Icon path={mdiMinus} size={0.6} className="mr-1" />
                  -50
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAdjust(50)}
                  disabled={dailyCalories >= 5000}
                >
                  <Icon path={mdiPlus} size={0.6} className="mr-1" />
                  +50
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAdjust(100)}
                  disabled={dailyCalories >= 5000}
                >
                  <Icon path={mdiPlus} size={0.6} className="mr-1" />
                  +100
                </Button>
              </div>
            </div>
          </div>

          {/* Calorie Information */}
          <div className="space-y-4">
            <div className={`p-4 rounded-lg border ${category.bg}`}>
              <div className="flex items-center gap-2 mb-2">
                <Icon path={mdiCalculator} size={0.8} className={category.color} />
                <span className={`font-medium ${category.color}`}>
                  {category.text} Calorie Level
                </span>
              </div>
              <p className="text-sm text-foreground">
                {dailyCalories < 1200 && 'Very restrictive - consult healthcare provider'}
                {dailyCalories >= 1200 && dailyCalories < 1500 && 'Moderate restriction for weight loss'}
                {dailyCalories >= 1500 && dailyCalories < 2500 && 'Balanced approach for most adults'}
                {dailyCalories >= 2500 && dailyCalories < 3500 && 'Higher intake for active individuals'}
                {dailyCalories >= 3500 && 'Very high intake for athletes or bulking'}
              </p>
            </div>

            {/* Calorie Breakdown Preview */}
            <div className="space-y-3">
              <h4 className="font-medium text-foreground">Daily Meal Distribution</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Breakfast (25%)</span>
                  <span className="font-medium">{Math.round(dailyCalories * 0.25)} cal</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Lunch (30%)</span>
                  <span className="font-medium">{Math.round(dailyCalories * 0.30)} cal</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dinner (35%)</span>
                  <span className="font-medium">{Math.round(dailyCalories * 0.35)} cal</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Snacks (10%)</span>
                  <span className="font-medium">{Math.round(dailyCalories * 0.10)} cal</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Safety Warning */}
        {dailyCalories < 1200 && (
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <Icon path={mdiInformation} size={1} className="text-red-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-red-800">
                Very Low Calorie Warning
              </p>
              <div className="text-xs text-red-700 space-y-1">
                <p>• Calories below 1,200 may not provide adequate nutrition</p>
                <p>• Can lead to muscle loss, nutritional deficiencies, and metabolic slowdown</p>
                <p>• Consult with a healthcare professional before continuing</p>
              </div>
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <strong>Note:</strong> This is your base calorie target. Exercise calories will be added to your daily allowance when you log workouts.
        </div>
      </div>
    </Card>
  );
};

export default CalorieBalance;