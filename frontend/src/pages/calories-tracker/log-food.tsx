// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCalories } from '../../contexts/CaloriesContext';
import caloriesApi from '../../services/caloriesApi';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Alert, AlertDescription } from '../../components/ui/alert';
import {
  ChevronLeft,
  Plus,
  Minus,
  Clock,
  Calculator,
  CheckCircle,
  Scale,
  Apple,
  Flame,
  Beef,
  Wheat,
  Droplet,
  Info as InfoIcon,
  Calendar,
  Tag,
  Barcode as BarcodeIcon,
  AlertCircle
} from 'lucide-react';
import { Food } from '../../components/calories-tracker/food-search/FoodItem';
import { FoodEntry } from '../../components/calories-tracker/diary/MealSection';
import BackgroundEffects from '../../components/ui/BackgroundEffects';

interface LocationState {
  food: Food;
  meal?: string;
  editEntry?: FoodEntry;
}

const LogFoodPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { refreshFoodLogs, refreshDashboard } = useCalories();
  const { food, meal: selectedMeal, editEntry } = (location.state as LocationState) || {};

  const [quantity, setQuantity] = useState(editEntry?.quantity || 100);
  const [selectedUnit, setSelectedUnit] = useState(editEntry?.unit || food?.servingUnit || 'g');
  const [meal, setMeal] = useState(selectedMeal || editEntry?.mealType || 'breakfast');
  const [logTime, setLogTime] = useState(() => {
    if (editEntry) {
      return editEntry.time.toTimeString().slice(0, 5);
    }
    const now = new Date();
    return now.toTimeString().slice(0, 5);
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  const meals = [
    { id: 'breakfast', name: 'Breakfast', emoji: '🌅', color: 'from-orange-500/20 to-yellow-500/20' },
    { id: 'lunch', name: 'Lunch', emoji: '☀️', color: 'from-blue-500/20 to-cyan-500/20' },
    { id: 'dinner', name: 'Dinner', emoji: '🌙', color: 'from-purple-500/20 to-pink-500/20' },
    { id: 'snacks', name: 'Snacks', emoji: '🍎', color: 'from-green-500/20 to-emerald-500/20' }
  ];

  const commonUnits = [
    { id: 'g', name: 'grams (g)', multiplier: 1 },
    { id: 'oz', name: 'ounces (oz)', multiplier: 28.35 },
    { id: 'cup', name: 'cup', multiplier: food?.category === 'beverages' ? 240 : 150 },
    { id: 'tbsp', name: 'tablespoon', multiplier: 15 },
    { id: 'tsp', name: 'teaspoon', multiplier: 5 },
    { id: 'piece', name: 'piece/whole', multiplier: food?.servingSize || 100 }
  ];

  useEffect(() => {
    if (!food) {
      navigate('/calories-tracker/food-search');
    }
  }, [food, navigate]);

  if (!food) {
    return null;
  }

  // Helper to safely display numbers
  const safeNumber = (value: any, defaultVal: number = 0): number => {
    const num = Number(value);
    return isNaN(num) || !isFinite(num) ? defaultVal : num;
  };

  // Normalized food data with safe values
  const safeFoodData = {
    calories: safeNumber(food.calories),
    protein: safeNumber(food.protein),
    carbs: safeNumber(food.carbs),
    fat: safeNumber(food.fat),
    fiber: food.fiber != null ? safeNumber(food.fiber) : undefined,
    sugar: food.sugar != null ? safeNumber(food.sugar) : undefined,
    sodium: food.sodium != null ? safeNumber(food.sodium) : undefined,
    servingSize: safeNumber(food.servingSize, 100),
    servingUnit: food.servingUnit || 'g'
  };

  const getUnitMultiplier = (unit: string): number => {
    const unitData = commonUnits.find(u => u.id === unit);
    return unitData?.multiplier || 1;
  };

  const calculateNutrition = () => {
    const baseServingSize = safeFoodData.servingSize;
    const unitMultiplier = getUnitMultiplier(selectedUnit) || 1;
    const totalGrams = (Number(quantity) || 100) * unitMultiplier;
    const servingMultiplier = baseServingSize > 0 ? totalGrams / baseServingSize : 1;

    // Helper to safely calculate and round numbers
    const safeCalc = (value: number, decimals: number = 0): number => {
      const result = value * servingMultiplier;
      if (isNaN(result) || !isFinite(result)) return 0;
      return decimals > 0 ? Math.round(result * Math.pow(10, decimals)) / Math.pow(10, decimals) : Math.round(result);
    };

    return {
      calories: safeCalc(safeFoodData.calories),
      protein: safeCalc(safeFoodData.protein, 1),
      carbs: safeCalc(safeFoodData.carbs, 1),
      fat: safeCalc(safeFoodData.fat, 1),
      fiber: safeFoodData.fiber != null ? safeCalc(safeFoodData.fiber, 1) : undefined,
      sugar: safeFoodData.sugar != null ? safeCalc(safeFoodData.sugar, 1) : undefined,
      sodium: safeFoodData.sodium != null ? safeCalc(safeFoodData.sodium) : undefined
    };
  };

  const nutrition = calculateNutrition();

  const handleQuantityChange = (change: number) => {
    const newQuantity = Math.max(0.1, quantity + change);
    setQuantity(Math.round(newQuantity * 10) / 10);
  };

  const handleLogFood = async () => {
    setIsSubmitting(true);
    setApiError('');
    
    try {
      const [hours, minutes] = logTime.split(':').map(Number);
      const logDate = new Date();
      logDate.setHours(hours, minutes, 0, 0);

      if (isAuthenticated) {
        // Use API for authenticated users
        if (editEntry) {
          // Update existing entry
          await caloriesApi.updateFoodLog(editEntry.id, {
            quantity: quantity,
            unit: selectedUnit
          });
        } else {
          // Create new entry
          if (!food || !food.id) {
            throw new Error('Invalid food data: missing food ID');
          }

          console.log('Logging food entry:', {
            food_id: food.id,
            food_name: food.name,
            quantity,
            unit: selectedUnit,
            meal_type: meal,
            consumed_at: logDate.toISOString()
          });

          await caloriesApi.logFoodEntry({
            food_id: food.id,
            quantity: quantity,
            unit: selectedUnit,
            meal_type: meal as 'breakfast' | 'lunch' | 'dinner' | 'snacks',
            consumed_at: logDate.toISOString()
          });
        }
        
        // Refresh food logs and dashboard to update the UI
        await Promise.all([refreshFoodLogs(), refreshDashboard()]);
      } else {
        // Fallback to localStorage for non-authenticated users
        const foodEntry: FoodEntry = {
          id: editEntry?.id || `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
          name: food.name,
          brand: food.brand,
          calories: nutrition.calories,
          carbs: nutrition.carbs,
          protein: nutrition.protein,
          fat: nutrition.fat,
          fiber: nutrition.fiber,
          sugar: nutrition.sugar,
          sodium: nutrition.sodium,
          quantity: quantity,
          unit: selectedUnit,
          time: logDate,
          mealType: meal
        };

        const existingEntries = JSON.parse(localStorage.getItem('foodEntries') || '[]');
        
        if (editEntry) {
          // Update existing entry
          const updatedEntries = existingEntries.map((entry: FoodEntry) => 
            entry.id === editEntry.id ? foodEntry : entry
          );
          localStorage.setItem('foodEntries', JSON.stringify(updatedEntries));
        } else {
          // Add new entry
          existingEntries.push(foodEntry);
          localStorage.setItem('foodEntries', JSON.stringify(existingEntries));
        }

        // Also update recent foods
        const recentFoods = JSON.parse(localStorage.getItem('recentFoods') || '[]');
        const updatedRecent = [food, ...recentFoods.filter((f: Food) => f.id !== food.id)].slice(0, 10);
        localStorage.setItem('recentFoods', JSON.stringify(updatedRecent));
      }

      toast.success('Food logged successfully!');
      navigate('/calories-tracker/diary');
    } catch (error) {
      console.error('Failed to log food:', error);
      setApiError('Failed to log food. Please try again.');
      toast.error('Failed to log food. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative">
      <BackgroundEffects variant="subtle" />
      <header className="relative z-10 bg-white/10 backdrop-blur-xl border-b border-white/20 shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="mr-2 text-white hover:bg-white/10"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Apple className="h-6 w-6 text-teal-400" />
              <span className="text-xl font-semibold text-white">
                {editEntry ? 'Edit Food Entry' : 'Log Food'}
              </span>
            </div>
          </div>
        </nav>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8 p-8 rounded-3xl bg-teal-500/20 border border-teal-400/30">
          <h1 className="text-3xl font-bold text-white mb-2">
            {editEntry ? 'Edit Food Entry' : 'Log Your Food'}
          </h1>
          <p className="text-lg text-white/60">
            Track your nutrition by adding this food to your diary
          </p>
        </div>

        {apiError && (
          <Alert className="mb-8 bg-red-500/10 border border-red-500/20">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-400">{apiError}</AlertDescription>
          </Alert>
        )}

        {/* Food Information */}
        <Card className="mb-8 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 border-l-4 border-teal-400">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-white">
              <Apple className="h-5 w-5 text-teal-400" />
              Food Information
            </CardTitle>
            <CardDescription className="text-white/60">
              Nutritional details per {safeFoodData.servingSize} {safeFoodData.servingUnit}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-white">{food.name}</h2>
                {food.brand && (
                  <div className="flex items-center gap-2 mt-1">
                    <Tag className="h-4 w-4 text-white/40" />
                    <p className="text-sm text-white/60">{food.brand}</p>
                  </div>
                )}
                {food.barcode && (
                  <div className="flex items-center gap-2 mt-2">
                    <BarcodeIcon className="h-4 w-4 text-white/40" />
                    <Badge variant="outline" className="text-xs border-white/20 text-white/80">
                      {food.barcode}
                    </Badge>
                  </div>
                )}
              </div>
              <Badge variant="secondary" className="ml-4 bg-teal-500/20 text-teal-400">
                {food.category}
              </Badge>
            </div>

            <div className="grid grid-cols-4 gap-6 p-6 bg-white/5 border border-white/10 rounded-xl">
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <div className="p-2 bg-teal-500/20 rounded-lg">
                    <Flame className="h-5 w-5 text-teal-400" />
                  </div>
                </div>
                <p className="text-xs text-white/60">Calories</p>
                <p className="text-xl font-bold text-white">{safeFoodData.calories}</p>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <div className="p-2 bg-cyan-500/20 rounded-lg">
                    <Beef className="h-5 w-5 text-cyan-400" />
                  </div>
                </div>
                <p className="text-xs text-white/60">Protein</p>
                <p className="text-xl font-bold text-white">{safeFoodData.protein}g</p>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <div className="p-2 bg-emerald-500/20 rounded-lg">
                    <Wheat className="h-5 w-5 text-emerald-400" />
                  </div>
                </div>
                <p className="text-xs text-white/60">Carbs</p>
                <p className="text-xl font-bold text-white">{safeFoodData.carbs}g</p>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <div className="p-2 bg-orange-500/20 rounded-lg">
                    <Droplet className="h-5 w-5 text-orange-400" />
                  </div>
                </div>
                <p className="text-xs text-white/60">Fat</p>
                <p className="text-xl font-bold text-white">{safeFoodData.fat}g</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Serving Size */}
        <Card className="mb-8 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 border-l-4 border-teal-400">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-white">
              <Scale className="h-5 w-5 text-teal-400" />
              Serving Size
            </CardTitle>
            <CardDescription className="text-white/60">
              Adjust the quantity and unit to match what you ate
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="quantity" className="text-sm font-semibold text-white/80">
                  Quantity
                </Label>
                <div className="flex items-center gap-2 mt-1">
                  <Button
                    size="icon"
                    onClick={() => handleQuantityChange(-0.5)}
                    disabled={quantity <= 0.5}
                    className="h-12 w-12 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20 disabled:opacity-50"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    id="quantity"
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
                    step="0.1"
                    min="0.1"
                    className="text-center h-12 rounded-xl font-semibold text-lg bg-white/10 border-white/20 text-white"
                  />
                  <Button
                    size="icon"
                    onClick={() => handleQuantityChange(0.5)}
                    className="h-12 w-12 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="unit" className="text-sm font-semibold text-white/80">
                  Unit
                </Label>
                <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                  <SelectTrigger id="unit" className="mt-1 h-12 rounded-xl bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-teal-800/90 border-teal-400/30">
                    {commonUnits.map((unit) => (
                      <SelectItem key={unit.id} value={unit.id} className="text-white hover:bg-white/10">
                        {unit.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Quick amount buttons */}
            <div className="flex gap-2 flex-wrap items-center">
              <p className="text-sm text-white/60 mr-2">Quick amounts:</p>
              {[50, 100, 150, 200].map((amount) => (
                <Button
                  key={amount}
                  size="sm"
                  onClick={() => setQuantity(amount)}
                  className={`h-8 px-3 rounded-lg transition-all ${
                    quantity === amount
                      ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white border-transparent'
                      : 'bg-white/10 border border-white/20 text-white hover:bg-teal-500/20 hover:border-teal-400'
                  }`}
                >
                  {amount}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Calculated Nutrition */}
        <Card className="mb-8 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 border-l-4 border-teal-400">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-white">
              <Calculator className="h-5 w-5 text-teal-400" />
              Nutrition Summary
              <Badge variant="secondary" className="ml-2 bg-teal-500/20 text-teal-400">
                {quantity} {selectedUnit}
              </Badge>
            </CardTitle>
            <CardDescription className="text-white/60">
              Total nutritional values for your serving
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Main macros */}
              <div className="grid grid-cols-4 gap-4 p-6 bg-teal-500/10 rounded-xl border border-teal-400/30">
                <div className="text-center">
                  <p className="text-2xl font-bold text-teal-400">{nutrition.calories}</p>
                  <p className="text-xs text-white/60">Calories</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-cyan-400">{nutrition.protein}g</p>
                  <p className="text-xs text-white/60">Protein</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-emerald-400">{nutrition.carbs}g</p>
                  <p className="text-xs text-white/60">Carbs</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-400">{nutrition.fat}g</p>
                  <p className="text-xs text-white/60">Fat</p>
                </div>
              </div>

              {/* Additional nutrients */}
              {(nutrition.fiber !== undefined || nutrition.sugar !== undefined || nutrition.sodium !== undefined) && (
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
                  {nutrition.fiber !== undefined && (
                    <div className="text-center">
                      <p className="text-lg font-semibold text-white">{nutrition.fiber}g</p>
                      <p className="text-xs text-white/60">Fiber</p>
                    </div>
                  )}
                  {nutrition.sugar !== undefined && (
                    <div className="text-center">
                      <p className="text-lg font-semibold text-white">{nutrition.sugar}g</p>
                      <p className="text-xs text-white/60">Sugar</p>
                    </div>
                  )}
                  {nutrition.sodium !== undefined && (
                    <div className="text-center">
                      <p className="text-lg font-semibold text-white">{nutrition.sodium}mg</p>
                      <p className="text-xs text-white/60">Sodium</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Meal & Time Selection */}
        <Card className="mb-8 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 border-l-4 border-teal-400">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-white">
              <Clock className="h-5 w-5 text-teal-400" />
              When did you eat this?
            </CardTitle>
            <CardDescription className="text-white/60">
              Select the meal and time for accurate tracking
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-sm font-semibold text-white/80 mb-3 block">
                Select Meal
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {meals.map((mealOption) => (
                  <button
                    key={mealOption.id}
                    onClick={() => setMeal(mealOption.id)}
                    className={`
                      relative p-4 rounded-xl border-2 transition-all duration-200
                      ${meal === mealOption.id
                        ? 'border-teal-400 bg-teal-500/20'
                        : 'border-white/20 bg-white/5 hover:border-teal-400/50'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{mealOption.emoji}</span>
                      <span className={`font-medium ${meal === mealOption.id ? 'text-white' : 'text-white/80'}`}>
                        {mealOption.name}
                      </span>
                    </div>
                    {meal === mealOption.id && (
                      <div className="absolute top-2 right-2">
                        <CheckCircle className="h-5 w-5 text-teal-400" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="time" className="text-sm font-semibold text-white/80">
                Time
              </Label>
              <div className="relative mt-1">
                <Clock className="absolute left-4 top-3.5 h-5 w-5 text-teal-400" />
                <Input
                  id="time"
                  type="time"
                  value={logTime}
                  onChange={(e) => setLogTime(e.target.value)}
                  className="pl-12 h-12 rounded-xl bg-white/10 border-white/20 text-white [&::-webkit-calendar-picker-indicator]:invert"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-4 mb-8">
          <Button
            onClick={() => navigate(-1)}
            className="h-12 px-8 rounded-xl bg-white/10 border-2 border-white/20 text-white hover:bg-white/20"
          >
            Cancel
          </Button>
          <Button
            onClick={handleLogFood}
            disabled={isSubmitting}
            className="h-12 px-8 rounded-xl text-white font-semibold bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="h-5 w-5 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                {editEntry ? 'Updating...' : 'Logging...'}
              </>
            ) : (
              <>
                <CheckCircle className="h-5 w-5 mr-2" />
                {editEntry ? 'Update Entry' : 'Log Food'}
              </>
            )}
          </Button>
        </div>

        {/* Tips */}
        <Card className="rounded-2xl border-2 border-teal-400/30 bg-teal-500/10">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-teal-500/20">
                <InfoIcon className="h-6 w-6 text-teal-400" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">Logging Tips</h4>
                <ul className="text-sm text-white/70 space-y-1">
                  <li>• Use a food scale for most accurate measurements</li>
                  <li>• Log foods immediately after eating for better accuracy</li>
                  <li>• Be consistent with your units (grams vs ounces)</li>
                  <li>• Remember to include cooking oils and condiments</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default LogFoodPage;