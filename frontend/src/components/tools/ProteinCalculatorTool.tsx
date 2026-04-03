import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Beef, Dumbbell, Copy, Check, Info, Clock, Utensils } from 'lucide-react';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { useTheme } from '../../contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

type BodyType = 'ectomorph' | 'mesomorph' | 'endomorph';
type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
type Goal = 'muscle_gain' | 'maintenance' | 'weight_loss';
type CalculationMethod = 'rda' | 'bodybuilder' | 'athlete';

interface ProteinResult {
  dailyProtein: number;
  proteinPerMeal: number;
  mealsPerDay: number;
  timingSuggestions: string[];
  proteinSources: ProteinSource[];
  methodComparison: MethodComparison[];
  mealPlan: MealSuggestion[];
}

interface ProteinSource {
  name: string;
  proteinPer100g: number;
  amountNeeded: number;
}

interface MethodComparison {
  method: string;
  multiplier: string;
  dailyProtein: number;
  description: string;
}

interface MealSuggestion {
  meal: string;
  time: string;
  protein: number;
  suggestions: string[];
}

const bodyTypeMultipliers: Record<BodyType, number> = {
  ectomorph: 1.1,
  mesomorph: 1.0,
  endomorph: 0.9,
};

const activityMultipliers: Record<ActivityLevel, number> = {
  sedentary: 0.8,
  light: 0.9,
  moderate: 1.0,
  active: 1.1,
  very_active: 1.2,
};

const goalMultipliers: Record<Goal, number> = {
  muscle_gain: 1.2,
  maintenance: 1.0,
  weight_loss: 1.1,
};

const baseProteinRates: Record<CalculationMethod, number> = {
  rda: 0.8,
  bodybuilder: 2.2,
  athlete: 1.6,
};

const proteinSources: { name: string; proteinPer100g: number }[] = [
  { name: 'Chicken Breast', proteinPer100g: 31 },
  { name: 'Eggs (whole)', proteinPer100g: 13 },
  { name: 'Greek Yogurt', proteinPer100g: 10 },
  { name: 'Salmon', proteinPer100g: 25 },
  { name: 'Lean Beef', proteinPer100g: 26 },
  { name: 'Tofu', proteinPer100g: 8 },
  { name: 'Whey Protein', proteinPer100g: 80 },
  { name: 'Lentils (cooked)', proteinPer100g: 9 },
];

interface ProteinCalculatorToolProps {
  uiConfig?: UIConfig;
}

export function ProteinCalculatorTool({ uiConfig }: ProteinCalculatorToolProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [weight, setWeight] = useState('');
  const [bodyType, setBodyType] = useState<BodyType>('mesomorph');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('moderate');
  const [goal, setGoal] = useState<Goal>('maintenance');
  const [mealsPerDay, setMealsPerDay] = useState(4);
  const [result, setResult] = useState<ProteinResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params && !isPrefilled) {
      const params = uiConfig.params as ToolPrefillData & {
        weight?: number | string;
        bodyType?: string;
        activityLevel?: string;
        goal?: string;
        mealsPerDay?: number;
      };
      if (params.weight) setWeight(String(params.weight));
      if (params.bodyType) setBodyType(params.bodyType as BodyType);
      if (params.activityLevel) setActivityLevel(params.activityLevel as ActivityLevel);
      if (params.goal) setGoal(params.goal as Goal);
      if (params.mealsPerDay) setMealsPerDay(params.mealsPerDay);
      setIsPrefilled(true);
    }
  }, [uiConfig?.params, isPrefilled]);

  const calculateProtein = () => {
    const weightKg = parseFloat(weight);

    if (!weightKg || weightKg <= 0) {
      setValidationMessage('Please enter a valid weight');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    // Calculate using bodybuilder method as primary
    const baseMultiplier = baseProteinRates.bodybuilder;
    const bodyTypeModifier = bodyTypeMultipliers[bodyType];
    const activityModifier = activityMultipliers[activityLevel];
    const goalModifier = goalMultipliers[goal];

    const dailyProtein = Math.round(
      weightKg * baseMultiplier * bodyTypeModifier * activityModifier * goalModifier
    );

    const proteinPerMeal = Math.round(dailyProtein / mealsPerDay);

    // Calculate method comparison
    const methodComparison: MethodComparison[] = [
      {
        method: 'RDA (Minimum)',
        multiplier: '0.8g/kg',
        dailyProtein: Math.round(weightKg * 0.8),
        description: 'Minimum to prevent deficiency',
      },
      {
        method: 'Active Adult',
        multiplier: '1.2-1.4g/kg',
        dailyProtein: Math.round(weightKg * 1.3),
        description: 'Regular exercisers',
      },
      {
        method: 'Athlete',
        multiplier: '1.4-2.0g/kg',
        dailyProtein: Math.round(weightKg * 1.6),
        description: 'Endurance & strength athletes',
      },
      {
        method: 'Bodybuilder',
        multiplier: '1.8-2.2g/kg',
        dailyProtein: Math.round(weightKg * 2.2),
        description: 'Maximum muscle synthesis',
      },
    ];

    // Calculate protein sources amounts
    const sourcesWithAmounts: ProteinSource[] = proteinSources.map((source) => ({
      ...source,
      amountNeeded: Math.round((dailyProtein / source.proteinPer100g) * 100),
    }));

    // Timing suggestions based on goal
    const timingSuggestions = getTimingSuggestions(goal, mealsPerDay);

    // Generate meal plan
    const mealPlan = generateMealPlan(proteinPerMeal, mealsPerDay, goal);

    setResult({
      dailyProtein,
      proteinPerMeal,
      mealsPerDay,
      timingSuggestions,
      proteinSources: sourcesWithAmounts,
      methodComparison,
      mealPlan,
    });
  };

  const getTimingSuggestions = (goal: Goal, meals: number): string[] => {
    const suggestions: string[] = [];

    if (goal === 'muscle_gain') {
      suggestions.push('Consume 20-40g protein within 2 hours post-workout');
      suggestions.push('Include protein in every meal, especially breakfast');
      suggestions.push('Consider a casein protein source before bed for overnight recovery');
      suggestions.push('Spread protein intake evenly across all meals');
    } else if (goal === 'weight_loss') {
      suggestions.push('Prioritize protein at breakfast to reduce hunger throughout the day');
      suggestions.push('Include protein with every meal to maintain satiety');
      suggestions.push('Have a protein-rich snack between meals to prevent overeating');
      suggestions.push('Consume most protein earlier in the day');
    } else {
      suggestions.push('Distribute protein evenly across all meals');
      suggestions.push('Include a protein source at each meal for steady energy');
      suggestions.push('Post-workout protein helps maintain muscle mass');
      suggestions.push('Aim for 25-35g protein per meal for optimal absorption');
    }

    return suggestions;
  };

  const generateMealPlan = (proteinPerMeal: number, meals: number, goal: Goal): MealSuggestion[] => {
    const mealPlan: MealSuggestion[] = [];
    const times = ['7:00 AM', '10:00 AM', '1:00 PM', '4:00 PM', '7:00 PM', '9:00 PM'];
    const mealNames = ['Breakfast', 'Mid-Morning Snack', 'Lunch', 'Afternoon Snack', 'Dinner', 'Evening Snack'];

    const mealSuggestions: Record<string, string[]> = {
      Breakfast: ['3 eggs with whole grain toast', 'Greek yogurt with nuts and berries', 'Protein smoothie with oats'],
      'Mid-Morning Snack': ['Cottage cheese with fruit', 'Protein bar', 'Hard-boiled eggs'],
      Lunch: ['Grilled chicken salad', 'Salmon with quinoa', 'Turkey wrap with vegetables'],
      'Afternoon Snack': ['Protein shake', 'Greek yogurt', 'Almonds and cheese'],
      Dinner: ['Lean beef stir-fry', 'Grilled fish with vegetables', 'Chicken breast with rice'],
      'Evening Snack': ['Casein protein shake', 'Cottage cheese', 'Greek yogurt'],
    };

    for (let i = 0; i < meals; i++) {
      const index = Math.floor((i / meals) * 6);
      const mealName = mealNames[Math.min(index, mealNames.length - 1)];

      mealPlan.push({
        meal: mealName,
        time: times[Math.min(index, times.length - 1)],
        protein: proteinPerMeal,
        suggestions: mealSuggestions[mealName] || ['Protein-rich meal'],
      });
    }

    return mealPlan;
  };

  const reset = () => {
    setWeight('');
    setBodyType('mesomorph');
    setActivityLevel('moderate');
    setGoal('maintenance');
    setMealsPerDay(4);
    setResult(null);
  };

  const copyResults = () => {
    if (!result) return;

    const text = `
Protein Calculator Results
==========================
Daily Protein Needed: ${result.dailyProtein}g
Protein Per Meal: ${result.proteinPerMeal}g (${result.mealsPerDay} meals/day)

Method Comparison:
${result.methodComparison.map(m => `- ${m.method}: ${m.dailyProtein}g (${m.multiplier})`).join('\n')}

Timing Suggestions:
${result.timingSuggestions.map(s => `- ${s}`).join('\n')}

Meal Plan:
${result.mealPlan.map(m => `- ${m.meal} (${m.time}): ${m.protein}g protein`).join('\n')}

Protein Sources (amount needed for daily goal):
${result.proteinSources.slice(0, 5).map(s => `- ${s.name}: ${s.amountNeeded}g (${s.proteinPer100g}g per 100g)`).join('\n')}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-4xl mx-auto">
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <Beef className="w-6 h-6 text-white" />
              </div>
              <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.proteinCalculator.proteinCalculator', 'Protein Calculator')}
              </h1>
            </div>
            <button
              onClick={() => setShowInfo(!showInfo)}
              className={`p-2 rounded-lg transition-colors ${
                theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
            >
              <Info className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
            </button>
          </div>

          {/* Info Panel */}
          {showInfo && (
            <div className={`mb-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-blue-50'}`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                This calculator estimates your daily protein needs based on your weight, body type, activity level, and fitness goals.
                The calculation uses evidence-based recommendations from sports nutrition research.
              </p>
            </div>
          )}

          {/* Input Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Weight Input */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.proteinCalculator.weightKg', 'Weight (kg)')}
              </label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder={t('tools.proteinCalculator.enterYourWeight', 'Enter your weight')}
                className={`w-full px-4 py-3 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              />
            </div>

            {/* Meals Per Day */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.proteinCalculator.mealsPerDay', 'Meals Per Day')}
              </label>
              <select
                value={mealsPerDay}
                onChange={(e) => setMealsPerDay(parseInt(e.target.value))}
                className={`w-full px-4 py-3 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              >
                {[3, 4, 5, 6].map((num) => (
                  <option key={num} value={num}>
                    {num} meals
                  </option>
                ))}
              </select>
            </div>

            {/* Body Type */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.proteinCalculator.bodyType', 'Body Type')}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['ectomorph', 'mesomorph', 'endomorph'] as BodyType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => setBodyType(type)}
                    className={`py-2 px-3 rounded-lg font-medium text-sm transition-colors ${
                      bodyType === type
                        ? 'bg-[#0D9488] text-white'
                        : theme === 'dark'
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Activity Level */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.proteinCalculator.activityLevel', 'Activity Level')}
              </label>
              <select
                value={activityLevel}
                onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)}
                className={`w-full px-4 py-3 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              >
                <option value="sedentary">{t('tools.proteinCalculator.sedentaryLittleOrNoExercise', 'Sedentary (little or no exercise)')}</option>
                <option value="light">{t('tools.proteinCalculator.light13DaysWeek', 'Light (1-3 days/week)')}</option>
                <option value="moderate">{t('tools.proteinCalculator.moderate35DaysWeek', 'Moderate (3-5 days/week)')}</option>
                <option value="active">{t('tools.proteinCalculator.active67DaysWeek', 'Active (6-7 days/week)')}</option>
                <option value="very_active">{t('tools.proteinCalculator.veryActive2xPerDay', 'Very Active (2x per day)')}</option>
              </select>
            </div>
          </div>

          {/* Goal Selection */}
          <div className="mb-6">
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.proteinCalculator.fitnessGoal', 'Fitness Goal')}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'muscle_gain', label: 'Muscle Gain', icon: Dumbbell },
                { value: 'maintenance', label: 'Maintenance', icon: Utensils },
                { value: 'weight_loss', label: 'Weight Loss', icon: Beef },
              ].map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setGoal(value as Goal)}
                  className={`py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                    goal === value
                      ? 'bg-[#0D9488] text-white'
                      : theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={calculateProtein}
              className="flex-1 bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Beef className="w-5 h-5" />
              {t('tools.proteinCalculator.calculateProteinNeeds', 'Calculate Protein Needs')}
            </button>
            <button
              onClick={reset}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {t('tools.proteinCalculator.reset', 'Reset')}
            </button>
          </div>

          {/* Results */}
          {result && (
            <div className="space-y-6">
              {/* Main Result */}
              <div
                className={`p-6 rounded-lg border-l-4 border-[#0D9488] ${
                  theme === 'dark' ? 'bg-gray-700' : t('tools.proteinCalculator.bg0d948810', 'bg-[#0D9488]/10')
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className={`text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('tools.proteinCalculator.recommendedDailyProtein', 'Recommended Daily Protein')}
                    </div>
                    <div className="text-5xl font-bold text-[#0D9488]">{result.dailyProtein}g</div>
                  </div>
                  <button
                    onClick={copyResults}
                    className={`p-2 rounded-lg transition-colors ${
                      theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
                    }`}
                  >
                    {copied ? (
                      <Check className="w-5 h-5 text-green-500" />
                    ) : (
                      <Copy className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                    )}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-600' : 'bg-white'}`}>
                    <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.proteinCalculator.perMeal', 'Per Meal')}</div>
                    <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {result.proteinPerMeal}g
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-600' : 'bg-white'}`}>
                    <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.proteinCalculator.mealsDay', 'Meals/Day')}</div>
                    <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {result.mealsPerDay}
                    </div>
                  </div>
                </div>
              </div>

              {/* Method Comparison */}
              <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h3 className={`font-semibold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  <Dumbbell className="w-5 h-5 text-[#0D9488]" />
                  {t('tools.proteinCalculator.calculationMethodsComparison', 'Calculation Methods Comparison')}
                </h3>
                <div className="space-y-3">
                  {result.methodComparison.map((method, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        theme === 'dark' ? 'bg-gray-600' : 'bg-white'
                      }`}
                    >
                      <div>
                        <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {method.method}
                        </div>
                        <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {method.description}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-[#0D9488]">{method.dailyProtein}g</div>
                        <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {method.multiplier}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Timing Suggestions */}
              <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h3 className={`font-semibold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  <Clock className="w-5 h-5 text-[#0D9488]" />
                  {t('tools.proteinCalculator.proteinTimingSuggestions', 'Protein Timing Suggestions')}
                </h3>
                <ul className="space-y-2">
                  {result.timingSuggestions.map((suggestion, index) => (
                    <li
                      key={index}
                      className={`flex items-start gap-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
                    >
                      <span className="text-[#0D9488] mt-1">&#8226;</span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Protein Sources */}
              <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h3 className={`font-semibold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  <Beef className="w-5 h-5 text-[#0D9488]" />
                  {t('tools.proteinCalculator.proteinSourcesAmountForDaily', 'Protein Sources (Amount for Daily Goal)')}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {result.proteinSources.map((source, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        theme === 'dark' ? 'bg-gray-600' : 'bg-white'
                      }`}
                    >
                      <div>
                        <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {source.name}
                        </div>
                        <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {source.proteinPer100g}g per 100g
                        </div>
                      </div>
                      <div className="text-xl font-bold text-[#0D9488]">{source.amountNeeded}g</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Meal Plan */}
              <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h3 className={`font-semibold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  <Utensils className="w-5 h-5 text-[#0D9488]" />
                  {t('tools.proteinCalculator.sampleMealPlan', 'Sample Meal Plan')}
                </h3>
                <div className="space-y-3">
                  {result.mealPlan.map((meal, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-600' : 'bg-white'}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {meal.time}
                          </span>
                          <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {meal.meal}
                          </span>
                        </div>
                        <span className="text-lg font-bold text-[#0D9488]">{meal.protein}g</span>
                      </div>
                      <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Suggestions: {meal.suggestions.join(' | ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Disclaimer */}
              <div className={`p-4 rounded-lg text-sm ${theme === 'dark' ? 'bg-gray-700 text-gray-400' : 'bg-yellow-50 text-gray-600'}`}>
                <strong>{t('tools.proteinCalculator.note', 'Note:')}</strong> These calculations are estimates based on general guidelines. Individual protein
                needs may vary based on factors like age, health conditions, and specific training goals. Consult a
                registered dietitian or healthcare provider for personalized nutrition advice.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    <ConfirmDialog />
    {validationMessage && (
      <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50">
        {validationMessage}
      </div>
    )}
    </>
  );
}

export default ProteinCalculatorTool;
