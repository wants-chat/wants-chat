import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Flame, User, Ruler, Weight, Activity, Target } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

type Gender = 'male' | 'female';
type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive';
type Goal = 'lose' | 'maintain' | 'gain';
type UnitSystem = 'metric' | 'imperial';

interface CalorieCalculatorToolProps {
  uiConfig?: UIConfig;
}

export const CalorieCalculatorTool: React.FC<CalorieCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [unitSystem, setUnitSystem] = useState<UnitSystem>('imperial');
  const [gender, setGender] = useState<Gender>('male');
  const [age, setAge] = useState(30);
  const [weight, setWeight] = useState(unitSystem === 'metric' ? 70 : 154);
  const [height, setHeight] = useState(unitSystem === 'metric' ? 175 : 70);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('moderate');
  const [goal, setGoal] = useState<Goal>('maintain');
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params && !isPrefilled) {
      const params = uiConfig.params as ToolPrefillData & {
        gender?: string;
        age?: number;
        weight?: number;
        height?: number;
        activityLevel?: string;
        goal?: string;
        unitSystem?: string;
      };
      if (params.gender && (params.gender === 'male' || params.gender === 'female')) {
        setGender(params.gender);
      }
      if (params.age) setAge(params.age);
      if (params.weight) setWeight(params.weight);
      if (params.height) setHeight(params.height);
      if (params.activityLevel) setActivityLevel(params.activityLevel as ActivityLevel);
      if (params.goal) setGoal(params.goal as Goal);
      if (params.unitSystem) setUnitSystem(params.unitSystem as UnitSystem);
      setIsPrefilled(true);
    }
  }, [uiConfig?.params, isPrefilled]);

  const activityLevels: { value: ActivityLevel; label: string; multiplier: number; description: string }[] = [
    { value: 'sedentary', label: 'Sedentary', multiplier: 1.2, description: 'Little or no exercise' },
    { value: 'light', label: 'Lightly Active', multiplier: 1.375, description: 'Light exercise 1-3 days/week' },
    { value: 'moderate', label: 'Moderately Active', multiplier: 1.55, description: 'Moderate exercise 3-5 days/week' },
    { value: 'active', label: 'Very Active', multiplier: 1.725, description: 'Hard exercise 6-7 days/week' },
    { value: 'veryActive', label: 'Extra Active', multiplier: 1.9, description: 'Very hard exercise, physical job' },
  ];

  const calculations = useMemo(() => {
    // Convert to metric if needed
    let weightKg = weight;
    let heightCm = height;

    if (unitSystem === 'imperial') {
      weightKg = weight * 0.453592; // lbs to kg
      heightCm = height * 2.54; // inches to cm
    }

    // Mifflin-St Jeor Equation
    let bmr: number;
    if (gender === 'male') {
      bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
    } else {
      bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
    }

    const activityMultiplier = activityLevels.find(a => a.value === activityLevel)?.multiplier || 1.55;
    const tdee = bmr * activityMultiplier;

    // Goal-based calories
    let targetCalories = tdee;
    let deficit = 0;
    switch (goal) {
      case 'lose':
        targetCalories = tdee - 500; // 1 lb/week loss
        deficit = -500;
        break;
      case 'gain':
        targetCalories = tdee + 300; // Lean bulk
        deficit = 300;
        break;
    }

    // Macros (based on typical recommendations)
    const proteinPerKg = goal === 'gain' ? 2.2 : 1.8;
    const protein = Math.round(weightKg * proteinPerKg);
    const fat = Math.round((targetCalories * 0.25) / 9);
    const carbs = Math.round((targetCalories - protein * 4 - fat * 9) / 4);

    // BMI
    const heightM = heightCm / 100;
    const bmi = weightKg / (heightM * heightM);

    let bmiCategory = '';
    if (bmi < 18.5) bmiCategory = 'Underweight';
    else if (bmi < 25) bmiCategory = 'Normal';
    else if (bmi < 30) bmiCategory = 'Overweight';
    else bmiCategory = 'Obese';

    return {
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      targetCalories: Math.round(targetCalories),
      deficit,
      protein,
      carbs,
      fat,
      bmi: bmi.toFixed(1),
      bmiCategory,
      weightKg,
      weeklyChange: goal === 'lose' ? -0.45 : goal === 'gain' ? 0.27 : 0,
    };
  }, [unitSystem, gender, age, weight, height, activityLevel, goal]);

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-orange-900/20' : 'bg-gradient-to-r from-white to-orange-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-500/10 rounded-lg">
            <Flame className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.calorieCalculator.calorieCalculator', 'Calorie Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.calorieCalculator.calculateYourDailyCalorieNeeds', 'Calculate your daily calorie needs')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Unit System Toggle */}
        <div className="flex justify-center">
          <div className={`inline-flex rounded-lg overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <button
              onClick={() => setUnitSystem('imperial')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                unitSystem === 'imperial'
                  ? 'bg-orange-500 text-white'
                  : isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t('tools.calorieCalculator.imperialLbIn', 'Imperial (lb/in)')}
            </button>
            <button
              onClick={() => setUnitSystem('metric')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                unitSystem === 'metric'
                  ? 'bg-orange-500 text-white'
                  : isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t('tools.calorieCalculator.metricKgCm', 'Metric (kg/cm)')}
            </button>
          </div>
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <User className="w-4 h-4 inline mr-1" />
              {t('tools.calorieCalculator.gender', 'Gender')}
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value as Gender)}
              className={`w-full px-4 py-2.5 rounded-lg border ${
                isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="male">{t('tools.calorieCalculator.male', 'Male')}</option>
              <option value="female">{t('tools.calorieCalculator.female', 'Female')}</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.calorieCalculator.age', 'Age')}
            </label>
            <input
              type="number"
              min="15"
              max="100"
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
              className={`w-full px-4 py-2.5 rounded-lg border ${
                isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Weight className="w-4 h-4 inline mr-1" />
              Weight ({unitSystem === 'metric' ? 'kg' : 'lbs'})
            </label>
            <input
              type="number"
              min="30"
              max="500"
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
              className={`w-full px-4 py-2.5 rounded-lg border ${
                isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Ruler className="w-4 h-4 inline mr-1" />
              Height ({unitSystem === 'metric' ? 'cm' : 'in'})
            </label>
            <input
              type="number"
              min="100"
              max="250"
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              className={`w-full px-4 py-2.5 rounded-lg border ${
                isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
        </div>

        {/* Activity Level */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Activity className="w-4 h-4 inline mr-1" />
            {t('tools.calorieCalculator.activityLevel', 'Activity Level')}
          </label>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
            {activityLevels.map((level) => (
              <button
                key={level.value}
                onClick={() => setActivityLevel(level.value)}
                className={`p-3 rounded-lg text-left transition-all ${
                  activityLevel === level.value
                    ? 'bg-orange-500 text-white'
                    : isDark
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <p className="font-medium text-sm">{level.label}</p>
                <p className={`text-xs ${activityLevel === level.value ? 'text-orange-100' : isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  {level.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Goal */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Target className="w-4 h-4 inline mr-1" />
            {t('tools.calorieCalculator.goal', 'Goal')}
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: 'lose', label: 'Lose Weight', icon: '📉', desc: '-500 cal/day' },
              { value: 'maintain', label: 'Maintain', icon: '⚖️', desc: 'No change' },
              { value: 'gain', label: 'Build Muscle', icon: '💪', desc: '+300 cal/day' },
            ].map((g) => (
              <button
                key={g.value}
                onClick={() => setGoal(g.value as Goal)}
                className={`p-4 rounded-xl text-center transition-all ${
                  goal === g.value
                    ? 'bg-orange-500 text-white'
                    : isDark
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <span className="text-2xl">{g.icon}</span>
                <p className="font-medium mt-1">{g.label}</p>
                <p className={`text-xs ${goal === g.value ? 'text-orange-100' : isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  {g.desc}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-4 rounded-xl ${isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-100'} border`}>
            <p className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>{t('tools.calorieCalculator.basalMetabolicRate', 'Basal Metabolic Rate')}</p>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {calculations.bmr.toLocaleString()} cal
            </p>
            <p className={`text-xs ${isDark ? 'text-blue-400' : 'text-blue-500'}`}>{t('tools.calorieCalculator.caloriesAtRest', 'Calories at rest')}</p>
          </div>
          <div className={`p-4 rounded-xl ${isDark ? 'bg-purple-900/20 border-purple-800' : 'bg-purple-50 border-purple-100'} border`}>
            <p className={`text-sm ${isDark ? 'text-purple-300' : 'text-purple-600'}`}>{t('tools.calorieCalculator.maintenanceCalories', 'Maintenance Calories')}</p>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {calculations.tdee.toLocaleString()} cal
            </p>
            <p className={`text-xs ${isDark ? 'text-purple-400' : 'text-purple-500'}`}>{t('tools.calorieCalculator.tdeeWithActivity', 'TDEE with activity')}</p>
          </div>
          <div className={`p-4 rounded-xl ${isDark ? 'bg-orange-900/20 border-orange-800' : 'bg-orange-50 border-orange-100'} border`}>
            <p className={`text-sm ${isDark ? 'text-orange-300' : 'text-orange-600'}`}>{t('tools.calorieCalculator.targetDailyCalories', 'Target Daily Calories')}</p>
            <p className={`text-2xl font-bold ${goal === 'lose' ? 'text-green-500' : goal === 'gain' ? 'text-blue-500' : isDark ? 'text-white' : 'text-gray-900'}`}>
              {calculations.targetCalories.toLocaleString()} cal
            </p>
            <p className={`text-xs ${isDark ? 'text-orange-400' : 'text-orange-500'}`}>
              {calculations.deficit > 0 ? `+${calculations.deficit}` : calculations.deficit} cal/day
            </p>
          </div>
        </div>

        {/* Macros */}
        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.calorieCalculator.recommendedMacros', 'Recommended Macros')}</h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${isDark ? 'bg-red-900/30' : 'bg-red-100'}`}>
                <span className="text-xl font-bold text-red-500">{calculations.protein}g</span>
              </div>
              <p className={`mt-2 font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.calorieCalculator.protein', 'Protein')}</p>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{calculations.protein * 4} cal</p>
            </div>
            <div className="text-center">
              <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${isDark ? 'bg-yellow-900/30' : 'bg-yellow-100'}`}>
                <span className="text-xl font-bold text-yellow-500">{calculations.carbs}g</span>
              </div>
              <p className={`mt-2 font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.calorieCalculator.carbs', 'Carbs')}</p>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{calculations.carbs * 4} cal</p>
            </div>
            <div className="text-center">
              <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${isDark ? 'bg-green-900/30' : 'bg-green-100'}`}>
                <span className="text-xl font-bold text-green-500">{calculations.fat}g</span>
              </div>
              <p className={`mt-2 font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.calorieCalculator.fat', 'Fat')}</p>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{calculations.fat * 9} cal</p>
            </div>
          </div>
        </div>

        {/* BMI */}
        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex justify-between items-center">
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.calorieCalculator.yourBmi', 'Your BMI')}</p>
              <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {calculations.bmi} - {calculations.bmiCategory}
              </p>
            </div>
            {calculations.weeklyChange !== 0 && (
              <div className="text-right">
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.calorieCalculator.expectedWeeklyChange', 'Expected Weekly Change')}</p>
                <p className={`text-xl font-bold ${calculations.weeklyChange < 0 ? 'text-green-500' : 'text-blue-500'}`}>
                  {calculations.weeklyChange > 0 ? '+' : ''}{calculations.weeklyChange.toFixed(2)} kg
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalorieCalculatorTool;
