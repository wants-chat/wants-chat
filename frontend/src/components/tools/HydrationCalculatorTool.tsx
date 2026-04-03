import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Droplets, GlassWater, Plus, Minus, RotateCcw, Lightbulb, Bell, Coffee, Wine, Sun, Dumbbell } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';

type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
type Climate = 'cold' | 'temperate' | 'warm' | 'hot';
type UnitSystem = 'metric' | 'imperial';

interface HydrationResult {
  baseIntake: number;
  adjustedIntake: number;
  consumed: number;
  remaining: number;
  percentage: number;
  glassesRemaining: number;
  adjustments: {
    exercise: number;
    climate: number;
    caffeine: number;
    alcohol: number;
  };
}

interface IntakeEntry {
  id: string;
  amount: number;
  type: 'glass' | 'bottle' | 'custom';
  timestamp: Date;
}

const GLASS_SIZE_ML = 250;
const BOTTLE_SIZE_ML = 500;
const GLASS_SIZE_OZ = 8;
const BOTTLE_SIZE_OZ = 16.9;

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.0,
  light: 1.1,
  moderate: 1.2,
  active: 1.3,
  very_active: 1.4,
};

const CLIMATE_ADDITIONS_ML: Record<Climate, number> = {
  cold: 0,
  temperate: 0,
  warm: 500,
  hot: 1000,
};

const HYDRATION_TIPS = [
  "Start your day with a glass of water to kickstart your metabolism.",
  "Carry a reusable water bottle to make drinking water convenient.",
  "Set reminders on your phone to drink water throughout the day.",
  "Drink a glass of water before each meal to aid digestion.",
  "Eat water-rich foods like cucumbers, watermelon, and oranges.",
  "Monitor your urine color - pale yellow indicates good hydration.",
  "Replace sugary drinks with water for better health.",
  "Drink water before, during, and after exercise.",
  "Keep water by your bedside for easy access.",
  "Infuse water with fruits for natural flavor without added sugars.",
];

const COLUMNS = [
  { key: 'timestamp', label: 'Time' },
  { key: 'amount', label: 'Amount' },
  { key: 'type', label: 'Type' },
];

interface HydrationCalculatorToolProps {
  uiConfig?: UIConfig;
}

export function HydrationCalculatorTool({ uiConfig }: HydrationCalculatorToolProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('metric');
  const [weight, setWeight] = useState('');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('moderate');
  const [climate, setClimate] = useState<Climate>('temperate');
  const [exerciseMinutes, setExerciseMinutes] = useState('0');
  const [caffeineServings, setCaffeineServings] = useState('0');
  const [alcoholServings, setAlcoholServings] = useState('0');
  const [result, setResult] = useState<HydrationResult | null>(null);
  const [intakeHistory, setIntakeHistory] = useState<IntakeEntry[]>([]);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params && !isPrefilled) {
      const params = uiConfig.params as ToolPrefillData & {
        weight?: number | string;
        activityLevel?: string;
        climate?: string;
        exerciseMinutes?: number | string;
        unitSystem?: string;
      };
      if (params.weight) setWeight(String(params.weight));
      if (params.activityLevel) setActivityLevel(params.activityLevel as ActivityLevel);
      if (params.climate) setClimate(params.climate as Climate);
      if (params.exerciseMinutes) setExerciseMinutes(String(params.exerciseMinutes));
      if (params.unitSystem) setUnitSystem(params.unitSystem as UnitSystem);
      setIsPrefilled(true);
    }
  }, [uiConfig?.params, isPrefilled]);
  const [customAmount, setCustomAmount] = useState('');
  const [showTips, setShowTips] = useState(false);
  const [showReminders, setShowReminders] = useState(false);

  const calculateHydration = () => {
    const weightValue = parseFloat(weight);

    if (!weightValue || weightValue <= 0) {
      setValidationMessage('Please enter a valid weight');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    // Convert to kg if imperial
    const weightKg = unitSystem === 'imperial' ? weightValue * 0.453592 : weightValue;

    // Base calculation: ~35ml per kg of body weight
    const baseIntakeMl = weightKg * 35;

    // Apply activity multiplier
    let adjustedIntakeMl = baseIntakeMl * ACTIVITY_MULTIPLIERS[activityLevel];

    // Climate adjustment
    const climateAdjustment = CLIMATE_ADDITIONS_ML[climate];
    adjustedIntakeMl += climateAdjustment;

    // Exercise adjustment: ~350ml per 30 minutes of exercise
    const exerciseMins = parseInt(exerciseMinutes) || 0;
    const exerciseAdjustment = Math.floor(exerciseMins / 30) * 350;
    adjustedIntakeMl += exerciseAdjustment;

    // Caffeine adjustment: ~150ml extra per caffeinated drink
    const caffeine = parseInt(caffeineServings) || 0;
    const caffeineAdjustment = caffeine * 150;
    adjustedIntakeMl += caffeineAdjustment;

    // Alcohol adjustment: ~250ml extra per alcoholic drink
    const alcohol = parseInt(alcoholServings) || 0;
    const alcoholAdjustment = alcohol * 250;
    adjustedIntakeMl += alcoholAdjustment;

    // Calculate consumed amount from history
    const consumed = intakeHistory.reduce((total, entry) => total + entry.amount, 0);

    // Convert to display units if imperial
    const displayBase = unitSystem === 'imperial' ? baseIntakeMl / 29.5735 : baseIntakeMl;
    const displayAdjusted = unitSystem === 'imperial' ? adjustedIntakeMl / 29.5735 : adjustedIntakeMl;
    const displayConsumed = unitSystem === 'imperial' ? consumed / 29.5735 : consumed;
    const displayRemaining = Math.max(0, displayAdjusted - displayConsumed);

    const percentage = Math.min(100, (consumed / adjustedIntakeMl) * 100);
    const glassSize = unitSystem === 'imperial' ? GLASS_SIZE_OZ : GLASS_SIZE_ML;
    const glassesRemaining = Math.ceil(displayRemaining / glassSize);

    setResult({
      baseIntake: Math.round(displayBase),
      adjustedIntake: Math.round(displayAdjusted),
      consumed: Math.round(displayConsumed),
      remaining: Math.round(displayRemaining),
      percentage: Math.round(percentage),
      glassesRemaining: Math.max(0, glassesRemaining),
      adjustments: {
        exercise: unitSystem === 'imperial' ? Math.round(exerciseAdjustment / 29.5735) : exerciseAdjustment,
        climate: unitSystem === 'imperial' ? Math.round(climateAdjustment / 29.5735) : climateAdjustment,
        caffeine: unitSystem === 'imperial' ? Math.round(caffeineAdjustment / 29.5735) : caffeineAdjustment,
        alcohol: unitSystem === 'imperial' ? Math.round(alcoholAdjustment / 29.5735) : alcoholAdjustment,
      },
    });
  };

  const addWater = (type: 'glass' | 'bottle' | 'custom', customMl?: number) => {
    let amount: number;

    if (type === 'custom' && customMl) {
      amount = unitSystem === 'imperial' ? customMl * 29.5735 : customMl;
    } else if (type === 'glass') {
      amount = unitSystem === 'imperial' ? GLASS_SIZE_OZ * 29.5735 : GLASS_SIZE_ML;
    } else {
      amount = unitSystem === 'imperial' ? BOTTLE_SIZE_OZ * 29.5735 : BOTTLE_SIZE_ML;
    }

    const newEntry: IntakeEntry = {
      id: Date.now().toString(),
      amount,
      type,
      timestamp: new Date(),
    };

    setIntakeHistory([...intakeHistory, newEntry]);

    // Recalculate if result exists
    if (result) {
      const newConsumed = intakeHistory.reduce((total, entry) => total + entry.amount, 0) + amount;
      const adjustedIntakeMl = unitSystem === 'imperial' ? result.adjustedIntake * 29.5735 : result.adjustedIntake;
      const displayConsumed = unitSystem === 'imperial' ? newConsumed / 29.5735 : newConsumed;
      const displayRemaining = Math.max(0, result.adjustedIntake - displayConsumed);
      const percentage = Math.min(100, (newConsumed / adjustedIntakeMl) * 100);
      const glassSize = unitSystem === 'imperial' ? GLASS_SIZE_OZ : GLASS_SIZE_ML;

      setResult({
        ...result,
        consumed: Math.round(displayConsumed),
        remaining: Math.round(displayRemaining),
        percentage: Math.round(percentage),
        glassesRemaining: Math.max(0, Math.ceil(displayRemaining / glassSize)),
      });
    }
  };

  const removeLastEntry = () => {
    if (intakeHistory.length === 0) return;

    const newHistory = intakeHistory.slice(0, -1);
    setIntakeHistory(newHistory);

    // Recalculate if result exists
    if (result) {
      const newConsumed = newHistory.reduce((total, entry) => total + entry.amount, 0);
      const adjustedIntakeMl = unitSystem === 'imperial' ? result.adjustedIntake * 29.5735 : result.adjustedIntake;
      const displayConsumed = unitSystem === 'imperial' ? newConsumed / 29.5735 : newConsumed;
      const displayRemaining = Math.max(0, result.adjustedIntake - displayConsumed);
      const percentage = Math.min(100, (newConsumed / adjustedIntakeMl) * 100);
      const glassSize = unitSystem === 'imperial' ? GLASS_SIZE_OZ : GLASS_SIZE_ML;

      setResult({
        ...result,
        consumed: Math.round(displayConsumed),
        remaining: Math.round(displayRemaining),
        percentage: Math.round(percentage),
        glassesRemaining: Math.max(0, Math.ceil(displayRemaining / glassSize)),
      });
    }
  };

  const resetDay = () => {
    setIntakeHistory([]);
    if (result) {
      setResult({
        ...result,
        consumed: 0,
        remaining: result.adjustedIntake,
        percentage: 0,
        glassesRemaining: Math.ceil(result.adjustedIntake / (unitSystem === 'imperial' ? GLASS_SIZE_OZ : GLASS_SIZE_ML)),
      });
    }
  };

  const resetAll = () => {
    setWeight('');
    setActivityLevel('moderate');
    setClimate('temperate');
    setExerciseMinutes('0');
    setCaffeineServings('0');
    setAlcoholServings('0');
    setResult(null);
    setIntakeHistory([]);
    setCustomAmount('');
  };

  const getProgressColor = (percentage: number): string => {
    if (percentage >= 100) return '#10b981';
    if (percentage >= 75) return '#22c55e';
    if (percentage >= 50) return '#eab308';
    if (percentage >= 25) return '#f97316';
    return '#ef4444';
  };

  const getRandomTip = (): string => {
    return HYDRATION_TIPS[Math.floor(Math.random() * HYDRATION_TIPS.length)];
  };

  const exportToCSV = () => {
    const headers = COLUMNS.map(col => col.label).join(',');
    const rows = intakeHistory.map(entry =>
      `"${entry.timestamp.toISOString()}","${Math.round(unitSystem === 'imperial' ? entry.amount / 29.5735 : entry.amount)}","${entry.type}"`
    );
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hydration-intake-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToExcel = () => {
    const data = intakeHistory.map(entry => ({
      Time: entry.timestamp.toISOString(),
      Amount: Math.round(unitSystem === 'imperial' ? entry.amount / 29.5735 : entry.amount),
      Type: entry.type,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Hydration Log');
    XLSX.writeFile(wb, `hydration-intake-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportToJSON = () => {
    const data = {
      date: new Date().toISOString(),
      settings: {
        unitSystem,
        weight,
        activityLevel,
        climate,
        exerciseMinutes,
        caffeineServings,
        alcoholServings,
      },
      result,
      intakeHistory: intakeHistory.map(entry => ({
        id: entry.id,
        timestamp: entry.timestamp.toISOString(),
        amount: Math.round(unitSystem === 'imperial' ? entry.amount / 29.5735 : entry.amount),
        type: entry.type,
      })),
    };

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hydration-intake-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const unit = unitSystem === 'imperial' ? 'oz' : 'ml';
  const weightUnit = unitSystem === 'imperial' ? 'lbs' : 'kg';

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-2xl mx-auto">
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <Droplets className="w-6 h-6 text-white" />
              </div>
              <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.hydrationCalculator.hydrationCalculator', 'Hydration Calculator')}
              </h1>
            </div>
            <ExportDropdown
              onExportCSV={exportToCSV}
              onExportExcel={exportToExcel}
              onExportJSON={exportToJSON}
              showImport={false}
              disabled={intakeHistory.length === 0}
              theme={theme}
            />
          </div>

          {/* Unit System Toggle */}
          <div className="mb-6">
            <div className="flex gap-2">
              <button
                onClick={() => setUnitSystem('metric')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  unitSystem === 'metric'
                    ? 'bg-[#0D9488] text-white'
                    : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {t('tools.hydrationCalculator.metricMlKg', 'Metric (ml, kg)')}
              </button>
              <button
                onClick={() => setUnitSystem('imperial')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  unitSystem === 'imperial'
                    ? 'bg-[#0D9488] text-white'
                    : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {t('tools.hydrationCalculator.imperialOzLbs', 'Imperial (oz, lbs)')}
              </button>
            </div>
          </div>

          {/* Input Fields */}
          <div className="space-y-4 mb-6">
            {/* Weight */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Weight ({weightUnit})
              </label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder={`Enter your weight in ${weightUnit}`}
                className={`w-full px-4 py-3 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              />
            </div>

            {/* Activity Level */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.hydrationCalculator.activityLevel', 'Activity Level')}
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
                <option value="sedentary">{t('tools.hydrationCalculator.sedentaryLittleOrNoExercise', 'Sedentary (little or no exercise)')}</option>
                <option value="light">{t('tools.hydrationCalculator.lightExercise13Days', 'Light (exercise 1-3 days/week)')}</option>
                <option value="moderate">{t('tools.hydrationCalculator.moderateExercise35Days', 'Moderate (exercise 3-5 days/week)')}</option>
                <option value="active">{t('tools.hydrationCalculator.activeExercise67Days', 'Active (exercise 6-7 days/week)')}</option>
                <option value="very_active">{t('tools.hydrationCalculator.veryActiveIntenseExerciseDaily', 'Very Active (intense exercise daily)')}</option>
              </select>
            </div>

            {/* Climate */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.hydrationCalculator.climateEnvironment', 'Climate / Environment')}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['cold', 'temperate', 'warm', 'hot'] as Climate[]).map((c) => (
                  <button
                    key={c}
                    onClick={() => setClimate(c)}
                    className={`py-2 px-3 rounded-lg font-medium transition-colors capitalize ${
                      climate === c
                        ? 'bg-[#0D9488] text-white'
                        : theme === 'dark'
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {c === 'hot' && <Sun className="w-4 h-4 inline mr-1" />}
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Adjustments Section */}
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <h3 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.hydrationCalculator.additionalFactors', 'Additional Factors')}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Exercise */}
                <div>
                  <label className={`block text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    <Dumbbell className="w-3 h-3 inline mr-1" />
                    {t('tools.hydrationCalculator.exerciseMinutes', 'Exercise (minutes)')}
                  </label>
                  <input
                    type="number"
                    value={exerciseMinutes}
                    onChange={(e) => setExerciseMinutes(e.target.value)}
                    min="0"
                    className={`w-full px-3 py-2 rounded-lg border text-sm ${
                      theme === 'dark'
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>

                {/* Caffeine */}
                <div>
                  <label className={`block text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    <Coffee className="w-3 h-3 inline mr-1" />
                    {t('tools.hydrationCalculator.caffeineCups', 'Caffeine (cups)')}
                  </label>
                  <input
                    type="number"
                    value={caffeineServings}
                    onChange={(e) => setCaffeineServings(e.target.value)}
                    min="0"
                    className={`w-full px-3 py-2 rounded-lg border text-sm ${
                      theme === 'dark'
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>

                {/* Alcohol */}
                <div>
                  <label className={`block text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    <Wine className="w-3 h-3 inline mr-1" />
                    {t('tools.hydrationCalculator.alcoholDrinks', 'Alcohol (drinks)')}
                  </label>
                  <input
                    type="number"
                    value={alcoholServings}
                    onChange={(e) => setAlcoholServings(e.target.value)}
                    min="0"
                    className={`w-full px-3 py-2 rounded-lg border text-sm ${
                      theme === 'dark'
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={calculateHydration}
              className="flex-1 bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Droplets className="w-5 h-5" />
              {t('tools.hydrationCalculator.calculate', 'Calculate')}
            </button>
            <button
              onClick={resetAll}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {t('tools.hydrationCalculator.reset', 'Reset')}
            </button>
          </div>

          {/* Result Display */}
          {result && (
            <div className="space-y-4">
              {/* Progress Section */}
              <div
                className="p-6 rounded-lg"
                style={{
                  backgroundColor: `${getProgressColor(result.percentage)}15`,
                  borderLeft: `4px solid ${getProgressColor(result.percentage)}`
                }}
              >
                <div className="text-center mb-4">
                  <div className="text-5xl font-bold mb-2" style={{ color: getProgressColor(result.percentage) }}>
                    {result.percentage}%
                  </div>
                  <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.hydrationCalculator.ofDailyGoalReached', 'of daily goal reached')}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className={`w-full h-4 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} overflow-hidden`}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, result.percentage)}%`,
                      backgroundColor: getProgressColor(result.percentage)
                    }}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="text-center">
                    <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.hydrationCalculator.goal', 'Goal')}</div>
                    <div className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {result.adjustedIntake} {unit}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.hydrationCalculator.consumed', 'Consumed')}</div>
                    <div className="text-lg font-bold text-[#0D9488]">
                      {result.consumed} {unit}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.hydrationCalculator.remaining', 'Remaining')}</div>
                    <div className="text-lg font-bold text-orange-500">
                      {result.remaining} {unit}
                    </div>
                  </div>
                </div>

                {result.glassesRemaining > 0 && (
                  <div className={`text-center mt-4 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    <GlassWater className="w-4 h-4 inline mr-1" />
                    {result.glassesRemaining} {result.glassesRemaining === 1 ? 'glass' : 'glasses'} remaining to reach your goal
                  </div>
                )}
              </div>

              {/* Track Water Intake */}
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h3 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.hydrationCalculator.trackYourIntake', 'Track Your Intake')}
                </h3>

                <div className="flex flex-wrap gap-2 mb-3">
                  <button
                    onClick={() => addWater('glass')}
                    className="flex-1 min-w-[100px] bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <GlassWater className="w-4 h-4" />
                    <Plus className="w-3 h-3" />
                    Glass ({unitSystem === 'imperial' ? GLASS_SIZE_OZ : GLASS_SIZE_ML}{unit})
                  </button>
                  <button
                    onClick={() => addWater('bottle')}
                    className="flex-1 min-w-[100px] bg-cyan-500 hover:bg-cyan-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Droplets className="w-4 h-4" />
                    <Plus className="w-3 h-3" />
                    Bottle ({unitSystem === 'imperial' ? BOTTLE_SIZE_OZ : BOTTLE_SIZE_ML}{unit})
                  </button>
                </div>

                {/* Custom Amount */}
                <div className="flex gap-2 mb-3">
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder={`Custom amount (${unit})`}
                    className={`flex-1 px-3 py-2 rounded-lg border text-sm ${
                      theme === 'dark'
                        ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                  <button
                    onClick={() => {
                      const amount = parseFloat(customAmount);
                      if (amount > 0) {
                        addWater('custom', amount);
                        setCustomAmount('');
                      }
                    }}
                    className="bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Undo and Reset */}
                <div className="flex gap-2">
                  <button
                    onClick={removeLastEntry}
                    disabled={intakeHistory.length === 0}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                      intakeHistory.length === 0
                        ? 'opacity-50 cursor-not-allowed'
                        : ''
                    } ${
                      theme === 'dark'
                        ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    <Minus className="w-4 h-4" />
                    {t('tools.hydrationCalculator.undoLast', 'Undo Last')}
                  </button>
                  <button
                    onClick={resetDay}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                      theme === 'dark'
                        ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    <RotateCcw className="w-4 h-4" />
                    {t('tools.hydrationCalculator.newDay', 'New Day')}
                  </button>
                </div>

                {/* Intake History */}
                {intakeHistory.length > 0 && (
                  <div className="mt-3">
                    <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                      Today's Log ({intakeHistory.length} entries)
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {intakeHistory.slice(-10).map((entry) => (
                        <span
                          key={entry.id}
                          className={`text-xs px-2 py-1 rounded ${
                            theme === 'dark' ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          {Math.round(unitSystem === 'imperial' ? entry.amount / 29.5735 : entry.amount)}{unit}
                        </span>
                      ))}
                      {intakeHistory.length > 10 && (
                        <span className={`text-xs px-2 py-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          +{intakeHistory.length - 10} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Adjustments Breakdown */}
              {(result.adjustments.exercise > 0 || result.adjustments.climate > 0 ||
                result.adjustments.caffeine > 0 || result.adjustments.alcohol > 0) && (
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <h3 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.hydrationCalculator.goalAdjustments', 'Goal Adjustments')}
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                        {t('tools.hydrationCalculator.baseIntake', 'Base intake:')}
                      </span>
                      <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {result.baseIntake} {unit}
                      </span>
                    </div>
                    {result.adjustments.exercise > 0 && (
                      <div className="flex justify-between items-center">
                        <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                          <Dumbbell className="w-3 h-3 inline mr-1" />
                          {t('tools.hydrationCalculator.exercise', 'Exercise:')}
                        </span>
                        <span className="font-medium text-orange-500">
                          +{result.adjustments.exercise} {unit}
                        </span>
                      </div>
                    )}
                    {result.adjustments.climate > 0 && (
                      <div className="flex justify-between items-center">
                        <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                          <Sun className="w-3 h-3 inline mr-1" />
                          {t('tools.hydrationCalculator.hotWeather', 'Hot weather:')}
                        </span>
                        <span className="font-medium text-yellow-500">
                          +{result.adjustments.climate} {unit}
                        </span>
                      </div>
                    )}
                    {result.adjustments.caffeine > 0 && (
                      <div className="flex justify-between items-center">
                        <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                          <Coffee className="w-3 h-3 inline mr-1" />
                          {t('tools.hydrationCalculator.caffeine', 'Caffeine:')}
                        </span>
                        <span className="font-medium text-amber-600">
                          +{result.adjustments.caffeine} {unit}
                        </span>
                      </div>
                    )}
                    {result.adjustments.alcohol > 0 && (
                      <div className="flex justify-between items-center">
                        <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                          <Wine className="w-3 h-3 inline mr-1" />
                          {t('tools.hydrationCalculator.alcohol', 'Alcohol:')}
                        </span>
                        <span className="font-medium text-purple-500">
                          +{result.adjustments.alcohol} {unit}
                        </span>
                      </div>
                    )}
                    <div className={`border-t pt-2 ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}>
                      <div className="flex justify-between items-center">
                        <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {t('tools.hydrationCalculator.totalDailyGoal', 'Total daily goal:')}
                        </span>
                        <span className="font-bold text-[#0D9488]">
                          {result.adjustedIntake} {unit}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Hydration Tips */}
          <div className="mt-6">
            <button
              onClick={() => setShowTips(!showTips)}
              className={`w-full flex items-center justify-between p-4 rounded-lg ${
                theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
              } transition-colors`}
            >
              <div className="flex items-center gap-2">
                <Lightbulb className={`w-5 h-5 ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`} />
                <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.hydrationCalculator.hydrationTips', 'Hydration Tips')}
                </span>
              </div>
              <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                {showTips ? '-' : '+'}
              </span>
            </button>

            {showTips && (
              <div className={`mt-2 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <ul className={`space-y-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {HYDRATION_TIPS.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-[#0D9488] mt-1">*</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Reminder Suggestions */}
          <div className="mt-4">
            <button
              onClick={() => setShowReminders(!showReminders)}
              className={`w-full flex items-center justify-between p-4 rounded-lg ${
                theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
              } transition-colors`}
            >
              <div className="flex items-center gap-2">
                <Bell className={`w-5 h-5 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.hydrationCalculator.reminderSuggestions', 'Reminder Suggestions')}
                </span>
              </div>
              <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                {showReminders ? '-' : '+'}
              </span>
            </button>

            {showReminders && (
              <div className={`mt-2 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <p className={`text-sm mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.hydrationCalculator.setRemindersAtTheseTimes', 'Set reminders at these times for optimal hydration:')}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {['7:00 AM', '10:00 AM', '1:00 PM', '4:00 PM', '7:00 PM', '9:00 PM'].map((time) => (
                    <div
                      key={time}
                      className={`text-center py-2 px-3 rounded-lg ${
                        theme === 'dark' ? 'bg-gray-600 text-gray-300' : 'bg-white text-gray-700'
                      }`}
                    >
                      <Bell className="w-3 h-3 inline mr-1" />
                      {time}
                    </div>
                  ))}
                </div>
                <p className={`text-xs mt-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.hydrationCalculator.tipDrink12Glasses', 'Tip: Drink 1-2 glasses at each reminder to evenly distribute intake throughout the day.')}
                </p>
              </div>
            )}
          </div>

          {/* Disclaimer */}
          <div className={`mt-6 p-3 rounded-lg text-xs ${
            theme === 'dark' ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600'
          }`}>
            <strong>{t('tools.hydrationCalculator.note', 'Note:')}</strong> This calculator provides general hydration recommendations.
            Individual needs may vary based on health conditions, medications, and other factors.
            Consult a healthcare provider for personalized advice.
          </div>

          {/* Validation Message Toast */}
          {validationMessage && (
            <div className={`mt-4 p-3 rounded-lg text-sm ${
              theme === 'dark' ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800'
            }`}>
              {validationMessage}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog />
    </div>
  );
}

export default HydrationCalculatorTool;
