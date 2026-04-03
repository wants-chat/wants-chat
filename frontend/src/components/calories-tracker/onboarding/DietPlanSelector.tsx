import React, { useState, useEffect } from 'react';
import { Card } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Button } from '../../ui/button';
import {
  Target,
  Zap,
  Dumbbell,
  Wheat,
  Beef,
  Calculator,
  Settings,
  TrendingUp,
  Info,
  Plus,
  Minus,
  RotateCcw,
  Apple,
  Flame
} from 'lucide-react';
import { OnboardingData } from '../../../pages/calories-tracker/onboarding';
import { cn } from '../../../lib/utils';

interface DietPlanSelectorProps {
  selectedPlan: OnboardingData['dietPlan'];
  onPlanSelect: (plan: NonNullable<OnboardingData['dietPlan']>) => void;
  userGoal: OnboardingData['goal'];
  userBMI?: number;
  recommendedCalories?: number;
  onCustomNutrition?: (nutrition: CustomNutrition) => void;
}

interface CustomNutrition {
  dailyCalories: number;
  proteinPercentage: number;
  carbsPercentage: number;
  fatPercentage: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
}

const DietPlanSelector: React.FC<DietPlanSelectorProps> = ({ 
  selectedPlan, 
  onPlanSelect, 
  userGoal,
  userBMI,
  recommendedCalories = 2000,
  onCustomNutrition
}) => {
  const [customMode, setCustomMode] = useState(false);
  const [dailyCalories, setDailyCalories] = useState(recommendedCalories);
  const [proteinPercentage, setProteinPercentage] = useState(25);
  const [carbsPercentage, setCarbsPercentage] = useState(45);
  const [fatPercentage, setFatPercentage] = useState(30);

  // Quick diet plan presets
  const dietPlans = [
    {
      id: 'balanced' as const,
      name: 'Balanced',
      description: 'Well-rounded nutrition',
      icon: Apple,
      iconColor: 'text-emerald-400',
      macros: { carbs: 45, protein: 25, fat: 30 }
    },
    {
      id: 'high_protein' as const,
      name: 'High Protein',
      description: 'Muscle building focus',
      icon: Beef,
      iconColor: 'text-teal-400',
      macros: { carbs: 30, protein: 40, fat: 30 }
    },
    {
      id: 'low_carb' as const,
      name: 'Low Carb',
      description: 'Reduced carbohydrates',
      icon: Wheat,
      iconColor: 'text-orange-400',
      macros: { carbs: 20, protein: 35, fat: 45 }
    },
    {
      id: 'keto' as const,
      name: 'Ketogenic',
      description: 'Very low carb, high fat',
      icon: Zap,
      iconColor: 'text-purple-400',
      macros: { carbs: 5, protein: 25, fat: 70 }
    }
  ];

  // Calculate grams from percentages
  const calculateGrams = (percentage: number, calories: number, caloriesPerGram: number) => {
    return Math.round((calories * percentage / 100) / caloriesPerGram);
  };

  const proteinGrams = calculateGrams(proteinPercentage, dailyCalories, 4);
  const carbsGrams = calculateGrams(carbsPercentage, dailyCalories, 4);
  const fatGrams = calculateGrams(fatPercentage, dailyCalories, 9);

  const totalPercentage = proteinPercentage + carbsPercentage + fatPercentage;
  const isBalanced = totalPercentage === 100;

  // Update custom nutrition when values change
  useEffect(() => {
    if (customMode && onCustomNutrition) {
      onCustomNutrition({
        dailyCalories,
        proteinPercentage,
        carbsPercentage,
        fatPercentage,
        proteinGrams,
        carbsGrams,
        fatGrams
      });
    }
  }, [customMode, dailyCalories, proteinPercentage, carbsPercentage, fatPercentage, proteinGrams, carbsGrams, fatGrams, onCustomNutrition]);

  const applyPreset = (preset: typeof dietPlans[0]) => {
    setProteinPercentage(preset.macros.protein);
    setCarbsPercentage(preset.macros.carbs);
    setFatPercentage(preset.macros.fat);
    onPlanSelect(preset.id);
  };

  const resetToRecommended = () => {
    setDailyCalories(recommendedCalories);
    setProteinPercentage(25);
    setCarbsPercentage(45);
    setFatPercentage(30);
  };

  const adjustPercentage = (
    type: 'protein' | 'carbs' | 'fat',
    change: number
  ) => {
    const current = type === 'protein' ? proteinPercentage : type === 'carbs' ? carbsPercentage : fatPercentage;
    const newValue = Math.max(5, Math.min(70, current + change));
    const difference = newValue - current;
    
    // Auto-balance the other macros to maintain 100%
    if (type === 'protein') {
      setProteinPercentage(newValue);
      // Distribute the difference between carbs and fat
      const carbsNew = Math.max(5, Math.min(70, carbsPercentage - difference/2));
      const fatNew = Math.max(5, Math.min(70, fatPercentage - difference/2));
      setCarbsPercentage(carbsNew);
      setFatPercentage(fatNew);
      
      // Ensure total is exactly 100%
      const total = newValue + carbsNew + fatNew;
      if (total !== 100) {
        const adjustment = 100 - total;
        setFatPercentage(fatNew + adjustment);
      }
    } else if (type === 'carbs') {
      setCarbsPercentage(newValue);
      // Distribute the difference between protein and fat
      const proteinNew = Math.max(5, Math.min(70, proteinPercentage - difference/2));
      const fatNew = Math.max(5, Math.min(70, fatPercentage - difference/2));
      setProteinPercentage(proteinNew);
      setFatPercentage(fatNew);
      
      // Ensure total is exactly 100%
      const total = proteinNew + newValue + fatNew;
      if (total !== 100) {
        const adjustment = 100 - total;
        setFatPercentage(fatNew + adjustment);
      }
    } else {
      setFatPercentage(newValue);
      // Distribute the difference between protein and carbs
      const proteinNew = Math.max(5, Math.min(70, proteinPercentage - difference/2));
      const carbsNew = Math.max(5, Math.min(70, carbsPercentage - difference/2));
      setProteinPercentage(proteinNew);
      setCarbsPercentage(carbsNew);
      
      // Ensure total is exactly 100%
      const total = proteinNew + carbsNew + newValue;
      if (total !== 100) {
        const adjustment = 100 - total;
        setCarbsPercentage(carbsNew + adjustment);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-teal-500/20 rounded-full">
            <Target className="h-8 w-8 text-teal-400" />
          </div>
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">
          Customize Your Nutrition Plan
        </h2>
        <p className="text-white/60">
          Set your daily calorie target and macronutrient balance
        </p>
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-2 p-1 bg-white/10 rounded-lg">
        <Button
          size="sm"
          onClick={() => setCustomMode(false)}
          className={`flex-1 ${!customMode ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white' : 'bg-transparent text-white/60 hover:text-white hover:bg-white/10'}`}
        >
          Quick Presets
        </Button>
        <Button
          size="sm"
          onClick={() => setCustomMode(true)}
          className={`flex-1 ${customMode ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white' : 'bg-transparent text-white/60 hover:text-white hover:bg-white/10'}`}
        >
          <Settings className="h-4 w-4 mr-1" />
          Custom
        </Button>
      </div>

      {!customMode ? (
        /* Quick Presets Mode */
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {dietPlans.map((plan) => {
              const Icon = plan.icon;
              const isSelected = selectedPlan === plan.id;

              return (
                <Card
                  key={plan.id}
                  className={cn(
                    "p-4 cursor-pointer transition-all duration-300 border-2",
                    isSelected
                      ? "bg-gradient-to-br from-teal-500/30 to-cyan-500/30 border-teal-400 shadow-xl shadow-teal-500/30 scale-[1.02]"
                      : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                  )}
                  onClick={() => applyPreset(plan)}
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "p-2 rounded-lg",
                        isSelected ? "bg-teal-500/40" : "bg-white/10"
                      )}>
                        <Icon className={cn("h-5 w-5", isSelected ? "text-teal-300" : plan.iconColor)} />
                      </div>
                      <div>
                        <h3 className={cn(
                          "font-semibold transition-colors",
                          isSelected ? "text-teal-300" : "text-white"
                        )}>
                          {plan.name}
                        </h3>
                        <p className={cn("text-xs", isSelected ? "text-white/80" : "text-white/60")}>
                          {plan.description}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-white/60">Carbs</span>
                        <span className="font-medium text-white">{plan.macros.carbs}%</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-white/60">Protein</span>
                        <span className="font-medium text-white">{plan.macros.protein}%</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-white/60">Fat</span>
                        <span className="font-medium text-white">{plan.macros.fat}%</span>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="flex items-center gap-2 pt-2">
                        <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" />
                        <span className="text-xs font-medium text-teal-400">Selected</span>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
          
          <div className="text-center pt-4">
            <Button
              onClick={() => setCustomMode(true)}
              className="gap-2 bg-white/10 border border-white/20 text-white hover:bg-white/20"
            >
              <Settings className="h-4 w-4" />
              Need more control? Customize manually
            </Button>
          </div>
        </div>
      ) : (
        /* Custom Mode */
        <div className="space-y-6">
          {/* Daily Calories */}
          <Card className="p-4 space-y-3 bg-white/5 border border-white/10">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium text-white flex items-center gap-2">
                <Flame className="h-4 w-4 text-orange-400" />
                Daily Calorie Target
              </Label>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => setDailyCalories(Math.max(1200, dailyCalories - 50))}
                  className="bg-white/10 border border-white/20 text-white hover:bg-white/20"
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <Badge className="font-mono text-base px-3 py-1 bg-teal-500/20 text-teal-400 border border-teal-500/30">
                  {dailyCalories} cal
                </Badge>
                <Button
                  size="sm"
                  onClick={() => setDailyCalories(Math.min(4000, dailyCalories + 50))}
                  className="bg-white/10 border border-white/20 text-white hover:bg-white/20"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div className="relative w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="absolute h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${((dailyCalories - 1200) / (4000 - 1200)) * 100}%` }}
              />
              <Input
                type="range"
                min="1200"
                max="4000"
                step="50"
                value={dailyCalories}
                onChange={(e) => setDailyCalories(Number(e.target.value))}
                className="absolute inset-0 w-full opacity-0 cursor-pointer"
              />
            </div>

            <div className="flex justify-between text-xs text-white/60">
              <span>1200 cal</span>
              <span>Recommended: {recommendedCalories} cal</span>
              <span>4000 cal</span>
            </div>
          </Card>

          {/* Macronutrient Customization */}
          <Card className="p-4 space-y-4 bg-white/5 border border-white/10">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-white">Macronutrient Balance</h3>
              <div className={cn(
                "text-sm font-medium px-2 py-1 rounded",
                isBalanced
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-orange-500/20 text-orange-400"
              )}>
                {totalPercentage}%
              </div>
            </div>

            {/* Protein */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-white flex items-center gap-2">
                  <Beef className="h-4 w-4 text-teal-400" />
                  Protein
                </Label>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => adjustPercentage('protein', -5)}
                    disabled={proteinPercentage <= 5}
                    className="bg-white/10 border border-white/20 text-white hover:bg-white/20 disabled:opacity-50"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <Badge className="font-mono min-w-[60px] text-center bg-teal-500/20 text-teal-400 border border-teal-500/30">
                    {proteinPercentage}%
                  </Badge>
                  <Button
                    size="sm"
                    onClick={() => adjustPercentage('protein', 5)}
                    disabled={proteinPercentage >= 70}
                    className="bg-white/10 border border-white/20 text-white hover:bg-white/20 disabled:opacity-50"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="relative w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="absolute h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${(proteinPercentage / 70) * 100}%` }}
                />
                <Input
                  type="range"
                  min="5"
                  max="70"
                  step="5"
                  value={proteinPercentage}
                  onChange={(e) => {
                    const newValue = Number(e.target.value);
                    const difference = newValue - proteinPercentage;
                    setProteinPercentage(newValue);
                    // Auto-balance carbs and fat
                    const carbsNew = Math.max(5, Math.min(70, carbsPercentage - difference/2));
                    const fatNew = Math.max(5, Math.min(70, fatPercentage - difference/2));
                    setCarbsPercentage(carbsNew);
                    setFatPercentage(fatNew);
                    // Ensure total is 100%
                    const total = newValue + carbsNew + fatNew;
                    if (total !== 100) {
                      setFatPercentage(fatNew + (100 - total));
                    }
                  }}
                  className="absolute inset-0 w-full opacity-0 cursor-pointer"
                />
              </div>
              <div className="text-xs text-white/60 text-center">
                {proteinGrams}g protein per day
              </div>
            </div>

            {/* Carbohydrates */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-white flex items-center gap-2">
                  <Wheat className="h-4 w-4 text-emerald-400" />
                  Carbohydrates
                </Label>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => adjustPercentage('carbs', -5)}
                    disabled={carbsPercentage <= 5}
                    className="bg-white/10 border border-white/20 text-white hover:bg-white/20 disabled:opacity-50"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <Badge className="font-mono min-w-[60px] text-center bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {carbsPercentage}%
                  </Badge>
                  <Button
                    size="sm"
                    onClick={() => adjustPercentage('carbs', 5)}
                    disabled={carbsPercentage >= 70}
                    className="bg-white/10 border border-white/20 text-white hover:bg-white/20 disabled:opacity-50"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="relative w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="absolute h-full bg-emerald-500 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${(carbsPercentage / 70) * 100}%` }}
                />
                <Input
                  type="range"
                  min="5"
                  max="70"
                  step="5"
                  value={carbsPercentage}
                  onChange={(e) => {
                    const newValue = Number(e.target.value);
                    const difference = newValue - carbsPercentage;
                    setCarbsPercentage(newValue);
                    // Auto-balance protein and fat
                    const proteinNew = Math.max(5, Math.min(70, proteinPercentage - difference/2));
                    const fatNew = Math.max(5, Math.min(70, fatPercentage - difference/2));
                    setProteinPercentage(proteinNew);
                    setFatPercentage(fatNew);
                    // Ensure total is 100%
                    const total = proteinNew + newValue + fatNew;
                    if (total !== 100) {
                      setFatPercentage(fatNew + (100 - total));
                    }
                  }}
                  className="absolute inset-0 w-full opacity-0 cursor-pointer"
                />
              </div>
              <div className="text-xs text-white/60 text-center">
                {carbsGrams}g carbs per day
              </div>
            </div>

            {/* Fat */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-white flex items-center gap-2">
                  <Zap className="h-4 w-4 text-orange-400" />
                  Fat
                </Label>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => adjustPercentage('fat', -5)}
                    disabled={fatPercentage <= 5}
                    className="bg-white/10 border border-white/20 text-white hover:bg-white/20 disabled:opacity-50"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <Badge className="font-mono min-w-[60px] text-center bg-orange-500/20 text-orange-400 border border-orange-500/30">
                    {fatPercentage}%
                  </Badge>
                  <Button
                    size="sm"
                    onClick={() => adjustPercentage('fat', 5)}
                    disabled={fatPercentage >= 70}
                    className="bg-white/10 border border-white/20 text-white hover:bg-white/20 disabled:opacity-50"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="relative w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="absolute h-full bg-orange-500 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${(fatPercentage / 70) * 100}%` }}
                />
                <Input
                  type="range"
                  min="5"
                  max="70"
                  step="5"
                  value={fatPercentage}
                  onChange={(e) => {
                    const newValue = Number(e.target.value);
                    const difference = newValue - fatPercentage;
                    setFatPercentage(newValue);
                    // Auto-balance protein and carbs
                    const proteinNew = Math.max(5, Math.min(70, proteinPercentage - difference/2));
                    const carbsNew = Math.max(5, Math.min(70, carbsPercentage - difference/2));
                    setProteinPercentage(proteinNew);
                    setCarbsPercentage(carbsNew);
                    // Ensure total is 100%
                    const total = proteinNew + carbsNew + newValue;
                    if (total !== 100) {
                      setCarbsPercentage(carbsNew + (100 - total));
                    }
                  }}
                  className="absolute inset-0 w-full opacity-0 cursor-pointer"
                />
              </div>
              <div className="text-xs text-white/60 text-center">
                {fatGrams}g fat per day
              </div>
            </div>

            {!isBalanced && (
              <div className="p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-orange-400 mt-0.5" />
                  <div className="text-sm text-white/80">
                    <p className="font-medium text-orange-400">Percentages don't add up to 100%</p>
                    <p className="text-xs mt-1 text-white/60">
                      Current total: {totalPercentage}%. Adjust the sliders to balance your macros.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button
                size="sm"
                onClick={resetToRecommended}
                className="gap-2 bg-white/10 border border-white/20 text-white hover:bg-white/20"
              >
                <RotateCcw className="h-3 w-3" />
                Reset to Recommended
              </Button>
            </div>
          </Card>

          {/* Summary Card */}
          {isBalanced && (
            <Card className="p-4 bg-gradient-to-r from-teal-500/10 to-cyan-500/10 border border-teal-500/20">
              <div className="space-y-3">
                <h3 className="font-medium text-white flex items-center gap-2">
                  <Calculator className="h-4 w-4 text-teal-400" />
                  Your Custom Nutrition Plan
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-white/60">Daily Calories</p>
                    <p className="text-lg font-bold text-teal-400">{dailyCalories}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-white/60">Protein</p>
                    <p className="text-lg font-bold text-teal-400">{proteinGrams}g</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-white/60">Carbs</p>
                    <p className="text-lg font-bold text-emerald-400">{carbsGrams}g</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-white/60">Fat</p>
                    <p className="text-lg font-bold text-orange-400">{fatGrams}g</p>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Info Card */}
      <Card className="p-4 bg-cyan-500/10 border border-cyan-500/20">
        <div className="flex items-start gap-3">
          <TrendingUp className="h-4 w-4 text-cyan-400 mt-0.5" />
          <div className="text-sm text-white/80 space-y-1">
            <p>
              <strong className="text-cyan-400">Tip:</strong> You can adjust these targets anytime in your dashboard.
            </p>
            <p className="text-xs text-white/60">
              Recommended ranges: Protein 10-35%, Carbs 45-65%, Fat 20-35%
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DietPlanSelector;