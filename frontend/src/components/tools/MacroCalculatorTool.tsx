import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Calculator, Copy, Check, Info, Target, Flame, Wheat, Droplets } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useConfirmDialog } from '../ui/ConfirmDialog';

type Gender = 'male' | 'female';
type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive';
type Goal = 'lose' | 'maintain' | 'gain';
type DietPreset = 'balanced' | 'lowCarb' | 'keto' | 'highProtein';

interface MacroResult {
  calories: number;
  protein: { grams: number; percentage: number; calories: number };
  carbs: { grams: number; percentage: number; calories: number };
  fat: { grams: number; percentage: number; calories: number };
}

interface DietRatio {
  protein: number;
  carbs: number;
  fat: number;
  name: string;
  description: string;
}

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, { value: number; label: string; description: string }> = {
  sedentary: { value: 1.2, label: 'Sedentary', description: 'Little or no exercise' },
  light: { value: 1.375, label: 'Lightly Active', description: 'Light exercise 1-3 days/week' },
  moderate: { value: 1.55, label: 'Moderately Active', description: 'Moderate exercise 3-5 days/week' },
  active: { value: 1.725, label: 'Very Active', description: 'Hard exercise 6-7 days/week' },
  veryActive: { value: 1.9, label: 'Extremely Active', description: 'Very hard exercise, physical job' },
};

const DIET_PRESETS: Record<DietPreset, DietRatio> = {
  balanced: { protein: 30, carbs: 40, fat: 30, name: 'Balanced', description: 'Standard balanced diet' },
  lowCarb: { protein: 35, carbs: 25, fat: 40, name: 'Low-Carb', description: 'Reduced carbohydrates' },
  keto: { protein: 25, carbs: 5, fat: 70, name: 'Keto', description: 'Very low carb, high fat' },
  highProtein: { protein: 40, carbs: 35, fat: 25, name: 'High-Protein', description: 'Muscle building focus' },
};

const GOAL_ADJUSTMENTS: Record<Goal, { multiplier: number; label: string; description: string }> = {
  lose: { multiplier: 0.8, label: 'Lose Weight', description: '20% calorie deficit' },
  maintain: { multiplier: 1.0, label: 'Maintain Weight', description: 'Maintain current weight' },
  gain: { multiplier: 1.15, label: 'Gain Muscle', description: '15% calorie surplus' },
};

interface MacroCalculatorToolProps {
  uiConfig?: UIConfig;
}

export function MacroCalculatorTool({ uiConfig }: MacroCalculatorToolProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<Gender>('male');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('moderate');
  const [goal, setGoal] = useState<Goal>('maintain');
  const [dietPreset, setDietPreset] = useState<DietPreset>('balanced');
  const [result, setResult] = useState<MacroResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [showFormula, setShowFormula] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params && !isPrefilled) {
      const params = uiConfig.params as ToolPrefillData & {
        weight?: number | string;
        height?: number | string;
        age?: number | string;
        gender?: string;
        activityLevel?: string;
        goal?: string;
        dietPreset?: string;
      };
      if (params.weight) setWeight(String(params.weight));
      if (params.height) setHeight(String(params.height));
      if (params.age) setAge(String(params.age));
      if (params.gender && (params.gender === 'male' || params.gender === 'female')) {
        setGender(params.gender);
      }
      if (params.activityLevel) setActivityLevel(params.activityLevel as ActivityLevel);
      if (params.goal) setGoal(params.goal as Goal);
      if (params.dietPreset) setDietPreset(params.dietPreset as DietPreset);
      setIsPrefilled(true);
    }
  }, [uiConfig?.params, isPrefilled]);

  const calculateMacros = () => {
    const weightKg = parseFloat(weight);
    const heightCm = parseFloat(height);
    const ageYears = parseInt(age);

    if (isNaN(weightKg) || isNaN(heightCm) || isNaN(ageYears)) {
      setValidationMessage('Please enter valid numbers for weight, height, and age');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    if (weightKg <= 0 || heightCm <= 0 || ageYears <= 0) {
      setValidationMessage('Weight, height, and age must be greater than 0');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    // Calculate BMR using Mifflin-St Jeor Equation
    let bmr: number;
    if (gender === 'male') {
      bmr = 10 * weightKg + 6.25 * heightCm - 5 * ageYears + 5;
    } else {
      bmr = 10 * weightKg + 6.25 * heightCm - 5 * ageYears - 161;
    }

    // Calculate TDEE (Total Daily Energy Expenditure)
    const tdee = bmr * ACTIVITY_MULTIPLIERS[activityLevel].value;

    // Apply goal adjustment
    const targetCalories = Math.round(tdee * GOAL_ADJUSTMENTS[goal].multiplier);

    // Get macro ratios from diet preset
    const ratios = DIET_PRESETS[dietPreset];

    // Calculate macros
    const proteinCalories = (targetCalories * ratios.protein) / 100;
    const carbsCalories = (targetCalories * ratios.carbs) / 100;
    const fatCalories = (targetCalories * ratios.fat) / 100;

    // Convert to grams (protein: 4 cal/g, carbs: 4 cal/g, fat: 9 cal/g)
    const proteinGrams = Math.round(proteinCalories / 4);
    const carbsGrams = Math.round(carbsCalories / 4);
    const fatGrams = Math.round(fatCalories / 9);

    setResult({
      calories: targetCalories,
      protein: { grams: proteinGrams, percentage: ratios.protein, calories: Math.round(proteinCalories) },
      carbs: { grams: carbsGrams, percentage: ratios.carbs, calories: Math.round(carbsCalories) },
      fat: { grams: fatGrams, percentage: ratios.fat, calories: Math.round(fatCalories) },
    });
  };

  const reset = () => {
    setWeight('');
    setHeight('');
    setAge('');
    setGender('male');
    setActivityLevel('moderate');
    setGoal('maintain');
    setDietPreset('balanced');
    setResult(null);
    setCopied(false);
  };

  const copyMacros = () => {
    if (!result) return;

    const text = `Daily Macros (${DIET_PRESETS[dietPreset].name} Diet - ${GOAL_ADJUSTMENTS[goal].label})
Calories: ${result.calories} kcal
Protein: ${result.protein.grams}g (${result.protein.percentage}%)
Carbs: ${result.carbs.grams}g (${result.carbs.percentage}%)
Fat: ${result.fat.grams}g (${result.fat.percentage}%)`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getMacroColor = (macro: 'protein' | 'carbs' | 'fat') => {
    switch (macro) {
      case 'protein':
        return '#ef4444'; // Red
      case 'carbs':
        return '#3b82f6'; // Blue
      case 'fat':
        return '#f59e0b'; // Amber
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-3xl mx-auto">
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-[#0D9488] rounded-lg">
              <Target className="w-6 h-6 text-white" />
            </div>
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.macroCalculator.macroCalculator', 'Macro Calculator')}
            </h1>
          </div>

          {/* Personal Information */}
          <div className="space-y-4 mb-6">
            <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.macroCalculator.personalInformation', 'Personal Information')}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.macroCalculator.weightKg', 'Weight (kg)')}
                </label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="e.g., 70"
                  min="0"
                  step="0.1"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.macroCalculator.heightCm', 'Height (cm)')}
                </label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="e.g., 175"
                  min="0"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.macroCalculator.ageYears', 'Age (years)')}
                </label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="e.g., 30"
                  min="0"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
            </div>

            {/* Gender Selection */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.macroCalculator.gender', 'Gender')}
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setGender('male')}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                    gender === 'male'
                      ? 'bg-[#0D9488] text-white'
                      : theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {t('tools.macroCalculator.male', 'Male')}
                </button>
                <button
                  onClick={() => setGender('female')}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                    gender === 'female'
                      ? 'bg-[#0D9488] text-white'
                      : theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {t('tools.macroCalculator.female', 'Female')}
                </button>
              </div>
            </div>
          </div>

          {/* Activity Level */}
          <div className="mb-6">
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.macroCalculator.activityLevel', 'Activity Level')}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {(Object.keys(ACTIVITY_MULTIPLIERS) as ActivityLevel[]).map((level) => (
                <button
                  key={level}
                  onClick={() => setActivityLevel(level)}
                  className={`p-3 rounded-lg font-medium transition-colors text-left ${
                    activityLevel === level
                      ? 'bg-[#0D9488] text-white'
                      : theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <div className="font-semibold text-sm">{ACTIVITY_MULTIPLIERS[level].label}</div>
                  <div className={`text-xs mt-1 ${activityLevel === level ? 'text-white/80' : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {ACTIVITY_MULTIPLIERS[level].description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Goal Selection */}
          <div className="mb-6">
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.macroCalculator.goal', 'Goal')}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {(Object.keys(GOAL_ADJUSTMENTS) as Goal[]).map((g) => (
                <button
                  key={g}
                  onClick={() => setGoal(g)}
                  className={`p-3 rounded-lg font-medium transition-colors text-left ${
                    goal === g
                      ? 'bg-[#0D9488] text-white'
                      : theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <div className="font-semibold text-sm">{GOAL_ADJUSTMENTS[g].label}</div>
                  <div className={`text-xs mt-1 ${goal === g ? 'text-white/80' : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {GOAL_ADJUSTMENTS[g].description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Diet Preset */}
          <div className="mb-6">
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.macroCalculator.dietPreset', 'Diet Preset')}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(Object.keys(DIET_PRESETS) as DietPreset[]).map((preset) => (
                <button
                  key={preset}
                  onClick={() => setDietPreset(preset)}
                  className={`p-3 rounded-lg font-medium transition-colors text-left ${
                    dietPreset === preset
                      ? 'bg-[#0D9488] text-white'
                      : theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <div className="font-semibold text-sm">{DIET_PRESETS[preset].name}</div>
                  <div className={`text-xs mt-1 ${dietPreset === preset ? 'text-white/80' : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    P: {DIET_PRESETS[preset].protein}% C: {DIET_PRESETS[preset].carbs}% F: {DIET_PRESETS[preset].fat}%
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={calculateMacros}
              className="flex-1 bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Calculator className="w-5 h-5" />
              {t('tools.macroCalculator.calculateMacros', 'Calculate Macros')}
            </button>
            <button
              onClick={reset}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {t('tools.macroCalculator.reset', 'Reset')}
            </button>
          </div>

          {/* Results */}
          {result && (
            <div className="space-y-6">
              {/* Total Calories */}
              <div
                className="p-6 rounded-lg text-center"
                style={{ backgroundColor: '#0D948815', borderLeft: '4px solid #0D9488' }}
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Flame className="w-6 h-6 text-[#0D9488]" />
                  <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    {t('tools.macroCalculator.dailyCalories', 'Daily Calories')}
                  </span>
                </div>
                <div className="text-5xl font-bold text-[#0D9488] mb-1">
                  {result.calories.toLocaleString()}
                </div>
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.macroCalculator.kcalDay', 'kcal/day')}
                </div>
              </div>

              {/* Macro Distribution - Visual Pie Chart Representation */}
              <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h3 className={`font-semibold mb-4 text-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.macroCalculator.macroDistribution', 'Macro Distribution')}
                </h3>

                {/* Visual Pie Chart using conic-gradient */}
                <div className="flex justify-center mb-6">
                  <div
                    className="w-48 h-48 rounded-full relative"
                    style={{
                      background: `conic-gradient(
                        ${getMacroColor('protein')} 0deg ${result.protein.percentage * 3.6}deg,
                        ${getMacroColor('carbs')} ${result.protein.percentage * 3.6}deg ${(result.protein.percentage + result.carbs.percentage) * 3.6}deg,
                        ${getMacroColor('fat')} ${(result.protein.percentage + result.carbs.percentage) * 3.6}deg 360deg
                      )`,
                    }}
                  >
                    <div
                      className={`absolute inset-4 rounded-full flex items-center justify-center ${
                        theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                      }`}
                    >
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {result.calories}
                        </div>
                        <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          calories
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex justify-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getMacroColor('protein') }} />
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{t('tools.macroCalculator.protein', 'Protein')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getMacroColor('carbs') }} />
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{t('tools.macroCalculator.carbs', 'Carbs')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getMacroColor('fat') }} />
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{t('tools.macroCalculator.fat', 'Fat')}</span>
                  </div>
                </div>
              </div>

              {/* Macro Details with Progress Bars */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Protein */}
                <Card className={theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}>
                  <CardHeader className="pb-2">
                    <CardTitle className={`text-sm flex items-center gap-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      <div className="p-1.5 rounded" style={{ backgroundColor: `${getMacroColor('protein')}20` }}>
                        <Target className="w-4 h-4" style={{ color: getMacroColor('protein') }} />
                      </div>
                      {t('tools.macroCalculator.protein2', 'Protein')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-1" style={{ color: getMacroColor('protein') }}>
                      {result.protein.grams}g
                    </div>
                    <div className={`text-sm mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {result.protein.percentage}% ({result.protein.calories} kcal)
                    </div>
                    <div className="h-2 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-600">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${result.protein.percentage}%`,
                          backgroundColor: getMacroColor('protein'),
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Carbs */}
                <Card className={theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}>
                  <CardHeader className="pb-2">
                    <CardTitle className={`text-sm flex items-center gap-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      <div className="p-1.5 rounded" style={{ backgroundColor: `${getMacroColor('carbs')}20` }}>
                        <Wheat className="w-4 h-4" style={{ color: getMacroColor('carbs') }} />
                      </div>
                      {t('tools.macroCalculator.carbohydrates', 'Carbohydrates')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-1" style={{ color: getMacroColor('carbs') }}>
                      {result.carbs.grams}g
                    </div>
                    <div className={`text-sm mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {result.carbs.percentage}% ({result.carbs.calories} kcal)
                    </div>
                    <div className="h-2 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-600">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${result.carbs.percentage}%`,
                          backgroundColor: getMacroColor('carbs'),
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Fat */}
                <Card className={theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}>
                  <CardHeader className="pb-2">
                    <CardTitle className={`text-sm flex items-center gap-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      <div className="p-1.5 rounded" style={{ backgroundColor: `${getMacroColor('fat')}20` }}>
                        <Droplets className="w-4 h-4" style={{ color: getMacroColor('fat') }} />
                      </div>
                      {t('tools.macroCalculator.fat2', 'Fat')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-1" style={{ color: getMacroColor('fat') }}>
                      {result.fat.grams}g
                    </div>
                    <div className={`text-sm mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {result.fat.percentage}% ({result.fat.calories} kcal)
                    </div>
                    <div className="h-2 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-600">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${result.fat.percentage}%`,
                          backgroundColor: getMacroColor('fat'),
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Copy Button */}
              <button
                onClick={copyMacros}
                className={`w-full py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                  copied
                    ? 'bg-green-500 text-white'
                    : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-5 h-5" />
                    {t('tools.macroCalculator.copiedToClipboard', 'Copied to Clipboard!')}
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    {t('tools.macroCalculator.copyMacros', 'Copy Macros')}
                  </>
                )}
              </button>
            </div>
          )}

          {/* Formula Explanation */}
          <button
            onClick={() => setShowFormula(!showFormula)}
            className={`w-full flex items-center justify-between p-4 rounded-lg mt-6 ${
              theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
            } transition-colors`}
          >
            <div className="flex items-center gap-2">
              <Info className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
              <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.macroCalculator.howItWorks', 'How It Works')}
              </span>
            </div>
            <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
              {showFormula ? '-' : '+'}
            </span>
          </button>

          {showFormula && (
            <div className={`mt-2 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className={`text-sm space-y-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                <div>
                  <p className="font-semibold mb-1">1. Calculate BMR (Mifflin-St Jeor Equation):</p>
                  <p className="font-mono text-xs">
                    Male: BMR = 10 x weight(kg) + 6.25 x height(cm) - 5 x age + 5
                  </p>
                  <p className="font-mono text-xs">
                    Female: BMR = 10 x weight(kg) + 6.25 x height(cm) - 5 x age - 161
                  </p>
                </div>
                <div>
                  <p className="font-semibold mb-1">2. Calculate TDEE:</p>
                  <p className="font-mono text-xs">TDEE = BMR x Activity Multiplier</p>
                </div>
                <div>
                  <p className="font-semibold mb-1">3. Apply Goal Adjustment:</p>
                  <p className="font-mono text-xs">Target Calories = TDEE x Goal Multiplier</p>
                </div>
                <div>
                  <p className="font-semibold mb-1">4. Calculate Macros:</p>
                  <p className="font-mono text-xs">{t('tools.macroCalculator.protein4CaloriesPerGram', 'Protein: 4 calories per gram')}</p>
                  <p className="font-mono text-xs">{t('tools.macroCalculator.carbs4CaloriesPerGram', 'Carbs: 4 calories per gram')}</p>
                  <p className="font-mono text-xs">{t('tools.macroCalculator.fat9CaloriesPerGram', 'Fat: 9 calories per gram')}</p>
                </div>
                <p className="text-xs mt-3 opacity-80">
                  Note: These calculations provide estimates. Individual needs may vary based on metabolism,
                  body composition, and other factors. Consult a nutritionist for personalized advice.
                </p>
              </div>
            </div>
          )}

          {/* Quick Reference */}
          <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <h3 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.macroCalculator.dietPresetGuide', 'Diet Preset Guide')}
            </h3>
            <div className={`space-y-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {(Object.keys(DIET_PRESETS) as DietPreset[]).map((preset) => (
                <div key={preset} className="flex justify-between items-center">
                  <span className="font-medium">{DIET_PRESETS[preset].name}:</span>
                  <span>
                    P: {DIET_PRESETS[preset].protein}% | C: {DIET_PRESETS[preset].carbs}% | F: {DIET_PRESETS[preset].fat}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Validation Toast */}
        {validationMessage && (
          <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg">
            {validationMessage}
          </div>
        )}

        <ConfirmDialog />
      </div>
    </div>
  );
}

export default MacroCalculatorTool;
