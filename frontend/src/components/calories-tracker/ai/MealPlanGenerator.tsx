import React, { useState } from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Label } from '../../ui/label';
import { RadioGroup, RadioGroupItem } from '../../ui/radio-group';
import { Checkbox } from '../../ui/checkbox';
import {
  Clock,
  DollarSign,
  ChefHat,
  Loader2,
  Download,
  Share2,
  RefreshCw,
  CheckCircle,
  Info,
  CalendarDays,
  Utensils
} from 'lucide-react';
import caloriesApi from '../../../services/caloriesApi';
import { useAuth } from '../../../contexts/AuthContext';
import { useCalories } from '../../../contexts/CaloriesContext';
import { Badge } from '../../ui/badge';
import { Alert, AlertDescription } from '../../ui/alert';
import { useConfirm } from '../../../contexts/ConfirmDialogContext';

interface MealPlanDay {
  date: string;
  meals: {
    breakfast: MealPlanMeal;
    lunch: MealPlanMeal;
    dinner: MealPlanMeal;
    snacks?: MealPlanMeal;
  };
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

interface MealPlanMeal {
  name: string;
  description?: string;
  ingredients: string[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  prepTime: number;
  cookTime: number;
  servings: number;
  instructions?: string[];
}

interface GenerationPreferences {
  duration: 'day' | 'week' | 'month';
  dietaryRestrictions: string[];
  excludedFoods: string[];
  budget: 'low' | 'medium' | 'high';
  cookingTime: 'quick' | 'moderate' | 'elaborate';
}

interface MealPlanGeneratorProps {
  onPlanGenerated?: (plan: MealPlanDay[]) => void;
  className?: string;
}

const MealPlanGenerator: React.FC<MealPlanGeneratorProps> = ({ onPlanGenerated, className }) => {
  const { alert } = useConfirm();
  const { isAuthenticated } = useAuth();
  const { profile } = useCalories();
  const [generating, setGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<MealPlanDay[] | null>(null);
  const [preferences, setPreferences] = useState<GenerationPreferences>({
    duration: 'week',
    dietaryRestrictions: [],
    excludedFoods: [],
    budget: 'medium',
    cookingTime: 'moderate'
  });

  const dietaryOptions = [
    { value: 'vegetarian', label: 'Vegetarian' },
    { value: 'vegan', label: 'Vegan' },
    { value: 'gluten_free', label: 'Gluten Free' },
    { value: 'dairy_free', label: 'Dairy Free' },
    { value: 'nut_free', label: 'Nut Free' },
    { value: 'low_carb', label: 'Low Carb' },
    { value: 'keto', label: 'Keto' },
    { value: 'paleo', label: 'Paleo' }
  ];

  const handleGeneratePlan = async () => {
    if (!isAuthenticated) {
      await alert({
        title: 'Login Required',
        message: 'Please login to generate meal plans',
        variant: 'info'
      });
      return;
    }

    setGenerating(true);
    try {
      const response = await caloriesApi.generateMealPlan({
        duration: preferences.duration,
        dietary_restrictions: preferences.dietaryRestrictions,
        excluded_foods: preferences.excludedFoods,
        budget: preferences.budget,
        cooking_time: preferences.cookingTime
      });

      if (response && response.mealPlan) {
        setGeneratedPlan(response.mealPlan);
        onPlanGenerated?.(response.mealPlan);
      }
    } catch (error) {
      console.error('Failed to generate meal plan:', error);
      // Set empty plan on error
      setGeneratedPlan([]);
    } finally {
      setGenerating(false);
    }
  };

  // Removed mock meal plan function - plans should come from API only

  const handleDietaryRestrictionToggle = (restriction: string) => {
    setPreferences(prev => ({
      ...prev,
      dietaryRestrictions: prev.dietaryRestrictions.includes(restriction)
        ? prev.dietaryRestrictions.filter(r => r !== restriction)
        : [...prev.dietaryRestrictions, restriction]
    }));
  };

  const downloadMealPlan = () => {
    if (!generatedPlan) return;
    
    // Convert meal plan to JSON and download
    const dataStr = JSON.stringify(generatedPlan, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `meal-plan-${preferences.duration}-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const shareMealPlan = async () => {
    if (!generatedPlan) return;

    // Simple share functionality - copy to clipboard
    const planText = generatedPlan.map(day =>
      `Date: ${new Date(day.date).toLocaleDateString()}\n` +
      `Breakfast: ${day.meals.breakfast.name} (${day.meals.breakfast.calories} cal)\n` +
      `Lunch: ${day.meals.lunch.name} (${day.meals.lunch.calories} cal)\n` +
      `Dinner: ${day.meals.dinner.name} (${day.meals.dinner.calories} cal)\n` +
      `Total: ${day.totals.calories} calories\n`
    ).join('\n---\n');

    navigator.clipboard.writeText(planText);
    await alert({
      title: 'Success',
      message: 'Meal plan copied to clipboard!',
      variant: 'success'
    });
  };

  return (
    <Card className={`p-6 ${className}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
            <ChefHat className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">AI Meal Plan Generator</h3>
            <p className="text-sm text-muted-foreground">Create personalized meal plans instantly</p>
          </div>
        </div>

        {!generatedPlan ? (
          <>
            {/* Duration Selection */}
            <div className="space-y-3">
              <Label>Plan Duration</Label>
              <RadioGroup
                value={preferences.duration}
                onValueChange={(value) => setPreferences(prev => ({ ...prev, duration: value as GenerationPreferences['duration'] }))}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="day" id="day" />
                  <Label htmlFor="day" className="cursor-pointer">1 Day</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="week" id="week" />
                  <Label htmlFor="week" className="cursor-pointer">1 Week</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="month" id="month" />
                  <Label htmlFor="month" className="cursor-pointer">1 Month</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Dietary Restrictions */}
            <div className="space-y-3">
              <Label>Dietary Restrictions</Label>
              <div className="grid grid-cols-2 gap-3">
                {dietaryOptions.map(option => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={option.value}
                      checked={preferences.dietaryRestrictions.includes(option.value)}
                      onCheckedChange={() => handleDietaryRestrictionToggle(option.value)}
                    />
                    <Label htmlFor={option.value} className="cursor-pointer text-sm">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Budget Selection */}
            <div className="space-y-3">
              <Label>Budget Level</Label>
              <RadioGroup
                value={preferences.budget}
                onValueChange={(value) => setPreferences(prev => ({ ...prev, budget: value as GenerationPreferences['budget'] }))}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="low" id="low" />
                  <Label htmlFor="low" className="cursor-pointer flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    Budget
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medium" id="medium" />
                  <Label htmlFor="medium" className="cursor-pointer flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    <DollarSign className="h-4 w-4" />
                    Moderate
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="high" id="high" />
                  <Label htmlFor="high" className="cursor-pointer flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    <DollarSign className="h-4 w-4" />
                    <DollarSign className="h-4 w-4" />
                    Premium
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Cooking Time */}
            <div className="space-y-3">
              <Label>Cooking Time Preference</Label>
              <RadioGroup
                value={preferences.cookingTime}
                onValueChange={(value) => setPreferences(prev => ({ ...prev, cookingTime: value as GenerationPreferences['cookingTime'] }))}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="quick" id="quick" />
                  <Label htmlFor="quick" className="cursor-pointer flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Quick (15-30 min)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="moderate" id="moderate" />
                  <Label htmlFor="moderate" className="cursor-pointer flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Moderate (30-60 min)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="elaborate" id="elaborate" />
                  <Label htmlFor="elaborate" className="cursor-pointer flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Elaborate (60+ min)
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGeneratePlan}
              disabled={generating}
              className="w-full"
              size="lg"
            >
              {generating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Your Meal Plan...
                </>
              ) : (
                <>
                  <ChefHat className="mr-2 h-4 w-4" />
                  Generate Meal Plan
                </>
              )}
            </Button>

            {/* Info Alert */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Your meal plan will be tailored to your nutrition goals: {profile?.goals?.daily_calories || '2000'} calories daily
              </AlertDescription>
            </Alert>
          </>
        ) : (
          <>
            {/* Generated Meal Plan Display */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold">Your Personalized Meal Plan</h4>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={downloadMealPlan}>
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                  <Button variant="outline" size="sm" onClick={shareMealPlan}>
                    <Share2 className="h-4 w-4 mr-1" />
                    Share
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setGeneratedPlan(null)}>
                    <RefreshCw className="h-4 w-4 mr-1" />
                    New Plan
                  </Button>
                </div>
              </div>

              {/* Meal Plan Days */}
              {generatedPlan.map((day, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {new Date(day.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <Badge variant="secondary">
                      {day.totals.calories} cal
                    </Badge>
                  </div>

                  {/* Meals */}
                  <div className="space-y-2">
                    {Object.entries(day.meals).map(([mealType, meal]) => (
                      <div key={mealType} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                        <Utensils className="h-4 w-4 mt-1 text-muted-foreground" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-xs text-muted-foreground capitalize">{mealType}</span>
                              <h5 className="font-medium">{meal.name}</h5>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium">{meal.calories} cal</div>
                              <div className="text-xs text-muted-foreground">
                                {meal.prepTime + meal.cookTime} min
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                            <span>P: {meal.protein}g</span>
                            <span>C: {meal.carbs}g</span>
                            <span>F: {meal.fat}g</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Daily Totals */}
                  <div className="flex justify-between pt-3 border-t text-sm">
                    <span className="text-muted-foreground">Daily Totals:</span>
                    <div className="flex gap-3 font-medium">
                      <span>P: {day.totals.protein}g</span>
                      <span>C: {day.totals.carbs}g</span>
                      <span>F: {day.totals.fat}g</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Success Message */}
            <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription>
                Your meal plan has been generated successfully! Each meal is balanced to meet your nutritional goals.
              </AlertDescription>
            </Alert>
          </>
        )}
      </div>
    </Card>
  );
};

export default MealPlanGenerator;