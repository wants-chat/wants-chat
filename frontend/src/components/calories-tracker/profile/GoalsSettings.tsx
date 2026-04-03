import React, { useState } from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { toast } from 'sonner';
import caloriesApi from '../../../services/caloriesApi';

interface GoalsSettingsProps {
  currentGoals: {
    dailyCalories: number;
    proteinPercentage: number;
    carbsPercentage: number;
    fatPercentage: number;
  };
  onGoalsUpdated: () => void;
  isAuthenticated: boolean;
}

const GoalsSettings: React.FC<GoalsSettingsProps> = ({ 
  currentGoals, 
  onGoalsUpdated,
  isAuthenticated 
}) => {
  // Using Sonner toast directly
  const [isEditing, setIsEditing] = useState(false);
  const [goals, setGoals] = useState(currentGoals);
  const [isSaving, setIsSaving] = useState(false);

  // Calculate grams from percentages
  const calculateGrams = (percentage: number, calories: number, caloriesPerGram: number) => {
    return Math.round((calories * percentage / 100) / caloriesPerGram);
  };

  const proteinGrams = calculateGrams(goals.proteinPercentage, goals.dailyCalories, 4);
  const carbsGrams = calculateGrams(goals.carbsPercentage, goals.dailyCalories, 4);
  const fatGrams = calculateGrams(goals.fatPercentage, goals.dailyCalories, 9);
  
  const totalPercentage = goals.proteinPercentage + goals.carbsPercentage + goals.fatPercentage;
  const isBalanced = Math.abs(totalPercentage - 100) < 0.1;

  const handleSave = async () => {
    if (!isBalanced) {
      toast.error("Macronutrient percentages must add up to 100%");
      return;
    }

    setIsSaving(true);
    try {
      if (isAuthenticated) {
        await caloriesApi.updateUserProfile({
          daily_calories: goals.dailyCalories,
          protein_percentage: goals.proteinPercentage,
          carbs_percentage: goals.carbsPercentage,
          fat_percentage: goals.fatPercentage
        });
        
        toast.success("Your nutrition goals have been successfully updated.");
        
        onGoalsUpdated();
      } else {
        // Update localStorage for non-authenticated users
        const onboardingData = localStorage.getItem('caloriesTrackerOnboarding');
        if (onboardingData) {
          const data = JSON.parse(onboardingData);
          data.dailyCalories = goals.dailyCalories;
          data.finalMacros = {
            ...data.finalMacros,
            protein: goals.proteinPercentage,
            carbs: goals.carbsPercentage,
            fat: goals.fatPercentage,
            proteinGrams,
            carbsGrams,
            fatGrams
          };
          localStorage.setItem('caloriesTrackerOnboarding', JSON.stringify(data));
        }
        
        toast.success("Your nutrition goals have been updated locally.");
      }
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating goals:', error);
      toast.error('Failed to update goals. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setGoals(currentGoals);
    setIsEditing(false);
  };

  const adjustMacro = (macro: 'protein' | 'carbs' | 'fat', newValue: number) => {
    const oldValue = goals[`${macro}Percentage` as keyof typeof goals] as number;
    const difference = newValue - oldValue;
    
    // Update the changed macro
    const newGoals = { ...goals };
    newGoals[`${macro}Percentage` as keyof typeof goals] = newValue as any;
    
    // Distribute the difference among the other two macros proportionally
    const otherMacros = (['protein', 'carbs', 'fat'] as const).filter(m => m !== macro);
    const otherTotal = otherMacros.reduce((sum, m) => sum + (goals[`${m}Percentage` as keyof typeof goals] as number), 0);
    
    if (otherTotal > 0) {
      let remainingToDistribute = -difference;
      
      otherMacros.forEach((otherMacro, index) => {
        const key = `${otherMacro}Percentage` as keyof typeof goals;
        const currentValue = goals[key] as number;
        
        if (index === otherMacros.length - 1) {
          // Last macro gets the remainder to ensure exact 100%
          newGoals[key] = Math.max(5, Math.min(70, currentValue + remainingToDistribute)) as any;
        } else {
          const proportion = currentValue / otherTotal;
          const adjustment = remainingToDistribute * proportion;
          const adjustedValue = Math.max(5, Math.min(70, currentValue + adjustment));
          newGoals[key] = Math.round(adjustedValue) as any;
          remainingToDistribute -= (adjustedValue - currentValue);
        }
      });
    }
    
    // Final validation to ensure total is exactly 100%
    const total = newGoals.proteinPercentage + newGoals.carbsPercentage + newGoals.fatPercentage;
    if (Math.abs(total - 100) > 0.1) {
      const adjustment = (100 - total);
      // Apply adjustment to the macro with the most room to adjust
      const adjustableValue = Math.max(newGoals.fatPercentage + adjustment, 5);
      if (adjustableValue <= 70) {
        newGoals.fatPercentage = Math.round(adjustableValue);
      }
    }
    
    setGoals(newGoals);
  };

  const resetToDefaults = () => {
    setGoals({
      dailyCalories: 2000,
      proteinPercentage: 25,
      carbsPercentage: 45,
      fatPercentage: 30
    });
  };

  if (!isEditing) {
    return (
      <Card className="p-6 bg-white/5 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Nutrition Goals</h3>
          <Button size="sm" onClick={() => setIsEditing(true)} className="bg-white/10 border border-white/20 text-white hover:bg-white/20">
            Edit Goals
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <span className="text-lg">🔥</span>
            </div>
            <div>
              <p className="text-sm text-white/60">Daily Calories</p>
              <p className="text-lg font-semibold text-white">{goals.dailyCalories} cal</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/20 rounded-lg">
              <span className="text-lg">💪</span>
            </div>
            <div>
              <p className="text-sm text-white/60">Protein</p>
              <p className="text-lg font-semibold text-white">{proteinGrams}g ({goals.proteinPercentage}%)</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              <span className="text-lg">🍎</span>
            </div>
            <div>
              <p className="text-sm text-white/60">Carbs</p>
              <p className="text-lg font-semibold text-white">{carbsGrams}g ({goals.carbsPercentage}%)</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <span className="text-lg">🥑</span>
            </div>
            <div>
              <p className="text-sm text-white/60">Fat</p>
              <p className="text-lg font-semibold text-white">{fatGrams}g ({goals.fatPercentage}%)</p>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-white/5 border border-white/10">
      <h3 className="text-lg font-semibold text-white mb-4">Edit Nutrition Goals</h3>
      <div className="space-y-4">

        {/* Daily Calories */}
        <div>
          <Label htmlFor="dailyCalories" className="text-white/80">Daily Calorie Target</Label>
          <Input
            id="dailyCalories"
            type="number"
            min="1200"
            max="4000"
            step="50"
            value={goals.dailyCalories}
            onChange={(e) => setGoals({ ...goals, dailyCalories: Number(e.target.value) })}
            placeholder="Enter daily calorie target"
            className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
          />
          <p className="text-xs text-white/60 mt-1">
            Healthy range: 1200-4000 calories per day
          </p>
        </div>

        {/* Macronutrient Distribution */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-base font-medium text-white">Macronutrient Distribution</h4>
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                onClick={resetToDefaults}
                type="button"
                className="bg-white/10 border border-white/20 text-white hover:bg-white/20"
              >
                Reset to Default
              </Button>
              <span className={`text-sm px-3 py-1 rounded-full font-medium ${
                isBalanced
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-orange-500/20 text-orange-400'
              }`}>
                Total: {totalPercentage.toFixed(1)}%
              </span>
            </div>
          </div>

          {!isBalanced && (
            <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
              <p className="text-sm text-orange-400">
                ⚠️ Macronutrients must add up to exactly 100% to save changes
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Protein */}
            <div>
              <Label htmlFor="protein" className="text-white/80">Protein (%)</Label>
              <Input
                id="protein"
                type="number"
                min="10"
                max="40"
                step="1"
                value={goals.proteinPercentage}
                onChange={(e) => adjustMacro('protein', Number(e.target.value))}
                placeholder="Protein %"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
              />
              <p className="text-xs text-white/60 mt-1">
                {proteinGrams}g • Recommended: 15-35%
              </p>
            </div>

            {/* Carbs */}
            <div>
              <Label htmlFor="carbs" className="text-white/80">Carbohydrates (%)</Label>
              <Input
                id="carbs"
                type="number"
                min="20"
                max="65"
                step="1"
                value={goals.carbsPercentage}
                onChange={(e) => adjustMacro('carbs', Number(e.target.value))}
                placeholder="Carbs %"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
              />
              <p className="text-xs text-white/60 mt-1">
                {carbsGrams}g • Recommended: 45-65%
              </p>
            </div>

            {/* Fat */}
            <div>
              <Label htmlFor="fat" className="text-white/80">Fat (%)</Label>
              <Input
                id="fat"
                type="number"
                min="15"
                max="45"
                step="1"
                value={goals.fatPercentage}
                onChange={(e) => adjustMacro('fat', Number(e.target.value))}
                placeholder="Fat %"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
              />
              <p className="text-xs text-white/60 mt-1">
                {fatGrams}g • Recommended: 20-35%
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          <Button
            onClick={handleSave}
            disabled={!isBalanced || isSaving}
            className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-600 hover:to-cyan-600 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Goals'}
          </Button>
          <Button
            onClick={handleCancel}
            disabled={isSaving}
            className="flex-1 bg-white/10 border border-white/20 text-white hover:bg-white/20"
          >
            Cancel
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default GoalsSettings;