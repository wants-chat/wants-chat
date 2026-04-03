import React from 'react';
import { Card } from '../../ui/card';
import { Progress } from '../../ui/progress';
import Icon from '@mdi/react';
import { 
  mdiFire,
  mdiGrass,
  mdiDumbbell,
  mdiWater,
  mdiCheckCircle
} from '@mdi/js';

interface NutrientPreviewProps {
  dailyCalories: number;
  carbs: number;
  protein: number;
  fat: number;
  carbsGrams: number;
  proteinGrams: number;
  fatGrams: number;
}

const NutrientPreview: React.FC<NutrientPreviewProps> = ({
  dailyCalories,
  carbs,
  protein,
  fat,
  carbsGrams,
  proteinGrams,
  fatGrams
}) => {
  const totalPercentage = carbs + protein + fat;
  const isBalanced = Math.abs(totalPercentage - 100) < 0.1;

  const macronutrients = [
    {
      name: 'Carbohydrates',
      percentage: carbs,
      grams: carbsGrams,
      color: 'emerald',
      icon: mdiGrass,
      colorClasses: 'text-emerald-600 bg-emerald-50 border-emerald-200'
    },
    {
      name: 'Protein',
      percentage: protein,
      grams: proteinGrams,
      color: 'blue',
      icon: mdiDumbbell,
      colorClasses: 'text-blue-600 bg-blue-50 border-blue-200'
    },
    {
      name: 'Fat',
      percentage: fat,
      grams: fatGrams,
      color: 'orange',
      icon: mdiWater,
      colorClasses: 'text-orange-600 bg-orange-50 border-orange-200'
    }
  ];

  const getProgressColor = (color: string) => {
    switch (color) {
      case 'emerald':
        return 'bg-emerald-500';
      case 'blue':
        return 'bg-blue-500';
      case 'orange':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getSampleMeals = () => {
    if (carbs < 20) {
      // Low carb/Keto meals
      return {
        breakfast: 'Scrambled eggs with avocado and spinach',
        lunch: 'Grilled chicken Caesar salad (no croutons)',
        dinner: 'Salmon with asparagus and butter sauce',
        snack: 'Mixed nuts and cheese'
      };
    } else if (protein > 30) {
      // High protein meals
      return {
        breakfast: 'Protein smoothie with Greek yogurt',
        lunch: 'Grilled chicken breast with quinoa',
        dinner: 'Lean beef stir-fry with vegetables',
        snack: 'Protein bar and almonds'
      };
    } else {
      // Balanced meals
      return {
        breakfast: 'Oatmeal with berries and nuts',
        lunch: 'Turkey sandwich with sweet potato',
        dinner: 'Grilled fish with rice and vegetables',
        snack: 'Apple with peanut butter'
      };
    }
  };

  const sampleMeals = getSampleMeals();

  return (
    <div className="space-y-6">
      {/* Plan Summary */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isBalanced ? 'bg-emerald-50' : 'bg-orange-50'}`}>
              <Icon 
                path={isBalanced ? mdiCheckCircle : mdiFire} 
                size={1.2} 
                className={isBalanced ? 'text-emerald-600' : 'text-orange-600'} 
              />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Plan Summary</h3>
              <p className="text-sm text-muted-foreground">
                {isBalanced ? 'Balanced and ready' : `${totalPercentage.toFixed(1)}% total`}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-center p-4 bg-primary/5 rounded-lg border border-primary/20">
              <p className="text-3xl font-bold text-primary">{dailyCalories}</p>
              <p className="text-sm text-muted-foreground">Daily Calories</p>
            </div>

            {/* Macro Breakdown */}
            {macronutrients.map((macro, index) => (
              <div key={index} className={`p-4 rounded-lg border ${macro.colorClasses}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon path={macro.icon} size={0.8} className={`text-${macro.color}-600`} />
                    <span className="font-medium text-foreground">{macro.name}</span>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-${macro.color}-600`}>{macro.percentage.toFixed(1)}%</p>
                    <p className="text-xs text-muted-foreground">{macro.grams}g</p>
                  </div>
                </div>
                <div className="h-2 bg-white rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${getProgressColor(macro.color)} transition-all duration-500`}
                    style={{ width: `${macro.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Sample Day */}
      <Card className="p-6">
        <div className="space-y-4">
          <h3 className="font-semibold text-foreground">Sample Day</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg">
              <div>
                <p className="font-medium text-foreground">Breakfast</p>
                <p className="text-sm text-muted-foreground">{sampleMeals.breakfast}</p>
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                ~{Math.round(dailyCalories * 0.25)} cal
              </p>
            </div>

            <div className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg">
              <div>
                <p className="font-medium text-foreground">Lunch</p>
                <p className="text-sm text-muted-foreground">{sampleMeals.lunch}</p>
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                ~{Math.round(dailyCalories * 0.30)} cal
              </p>
            </div>

            <div className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg">
              <div>
                <p className="font-medium text-foreground">Dinner</p>
                <p className="text-sm text-muted-foreground">{sampleMeals.dinner}</p>
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                ~{Math.round(dailyCalories * 0.35)} cal
              </p>
            </div>

            <div className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg">
              <div>
                <p className="font-medium text-foreground">Snack</p>
                <p className="text-sm text-muted-foreground">{sampleMeals.snack}</p>
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                ~{Math.round(dailyCalories * 0.10)} cal
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Tips */}
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
        <div className="space-y-3">
          <h3 className="font-semibold text-foreground">Success Tips</h3>
          <div className="text-sm text-muted-foreground space-y-2">
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
              <p>Start with whole, minimally processed foods for better nutrition</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
              <p>Track consistently for the first few weeks to build habits</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
              <p>Adjust portions based on hunger and energy levels</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
              <p>Stay hydrated - aim for at least 8 glasses of water daily</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default NutrientPreview;