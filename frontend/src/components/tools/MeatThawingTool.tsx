import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { Snowflake, Clock, AlertTriangle, Thermometer, Calendar, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface MeatThawingToolProps {
  uiConfig?: UIConfig;
}

type MeatType = 'beef' | 'pork' | 'chicken' | 'turkey' | 'fish';
type ThawingMethod = 'refrigerator' | 'cold_water' | 'microwave';
type WeightUnit = 'lbs' | 'kg';

interface ThawingResult {
  meatType: MeatType;
  weight: number;
  weightUnit: WeightUnit;
  method: ThawingMethod;
  thawingTimeHours: number;
  thawingTimeMinutes: number;
  startTime: Date | null;
  safetyTips: string[];
  temperatureGuidelines: string[];
}

interface MealPlanResult {
  mealTime: Date;
  startThawingTime: Date;
  thawingDuration: string;
}

const MEAT_TYPES: { value: MeatType; label: string; icon: string }[] = [
  { value: 'beef', label: 'Beef', icon: '🥩' },
  { value: 'pork', label: 'Pork', icon: '🐷' },
  { value: 'chicken', label: 'Chicken', icon: '🐔' },
  { value: 'turkey', label: 'Turkey', icon: '🦃' },
  { value: 'fish', label: 'Fish/Seafood', icon: '🐟' },
];

const THAWING_METHODS: { value: ThawingMethod; label: string; description: string }[] = [
  { value: 'refrigerator', label: 'Refrigerator', description: 'Safest method, plan ahead' },
  { value: 'cold_water', label: 'Cold Water', description: 'Faster, requires attention' },
  { value: 'microwave', label: 'Microwave', description: 'Quickest, cook immediately after' },
];

// Thawing times in hours per pound for each method
const THAWING_RATES: Record<MeatType, Record<ThawingMethod, number>> = {
  beef: {
    refrigerator: 5, // 5 hours per pound
    cold_water: 0.5, // 30 minutes per pound
    microwave: 0.1, // 6 minutes per pound
  },
  pork: {
    refrigerator: 5,
    cold_water: 0.5,
    microwave: 0.1,
  },
  chicken: {
    refrigerator: 5,
    cold_water: 0.5,
    microwave: 0.08, // slightly faster for chicken
  },
  turkey: {
    refrigerator: 24, // 24 hours per 4-5 lbs (so ~5 hours per pound)
    cold_water: 0.5,
    microwave: 0.12, // larger pieces take longer
  },
  fish: {
    refrigerator: 4, // Fish thaws faster
    cold_water: 0.33, // 20 minutes per pound
    microwave: 0.07, // 4 minutes per pound
  },
};

const SAFETY_TIPS: Record<ThawingMethod, string[]> = {
  refrigerator: [
    'Keep meat in original packaging or place on a plate to catch drips',
    'Store on the lowest shelf to prevent cross-contamination',
    'Thawed meat can stay in refrigerator 1-2 days before cooking',
    'Can be refrozen without cooking (quality may decrease)',
    'Maintain refrigerator temperature at 40°F (4°C) or below',
  ],
  cold_water: [
    'Keep meat in leak-proof packaging or sealed plastic bag',
    'Submerge in cold tap water (not warm or hot)',
    'Change water every 30 minutes to keep it cold',
    'Cook immediately after thawing - do not refreeze',
    'Never leave meat at room temperature for more than 2 hours',
  ],
  microwave: [
    'Remove all packaging and foam trays before microwaving',
    'Use the defrost setting based on weight',
    'Cook immediately after thawing - do not refreeze',
    'Some areas may begin to cook during defrosting',
    'Rotate meat during thawing for even defrosting',
  ],
};

const TEMPERATURE_GUIDELINES: Record<MeatType, string[]> = {
  beef: [
    'Safe minimum internal temperature: 145°F (63°C)',
    'Ground beef: 160°F (71°C)',
    'Let rest 3 minutes before serving',
  ],
  pork: [
    'Safe minimum internal temperature: 145°F (63°C)',
    'Ground pork: 160°F (71°C)',
    'Let rest 3 minutes before serving',
  ],
  chicken: [
    'Safe minimum internal temperature: 165°F (74°C)',
    'Applies to all parts including ground chicken',
    'No resting time required',
  ],
  turkey: [
    'Safe minimum internal temperature: 165°F (74°C)',
    'Check temperature in thickest part of thigh',
    'Stuffing must also reach 165°F (74°C)',
  ],
  fish: [
    'Safe minimum internal temperature: 145°F (63°C)',
    'Fish should be opaque and flake easily',
    'Shellfish: shells should open during cooking',
  ],
};

export const MeatThawingTool: React.FC<MeatThawingToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [meatType, setMeatType] = useState<MeatType>('chicken');
  const [weight, setWeight] = useState('');
  const [weightUnit, setWeightUnit] = useState<WeightUnit>('lbs');
  const [method, setMethod] = useState<ThawingMethod>('refrigerator');
  const [result, setResult] = useState<ThawingResult | null>(null);
  const [showMealPlanner, setShowMealPlanner] = useState(false);
  const [mealDate, setMealDate] = useState('');
  const [mealTime, setMealTime] = useState('');
  const [mealPlanResult, setMealPlanResult] = useState<MealPlanResult | null>(null);
  const [showSafetyTips, setShowSafetyTips] = useState(true);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.prefillData && !isPrefilled) {
      const data = uiConfig.prefillData;
      if (data.meatType) setMeatType(data.meatType as MeatType);
      if (data.weight) setWeight(String(data.weight));
      if (data.weightUnit) setWeightUnit(data.weightUnit as WeightUnit);
      if (data.method) setMethod(data.method as ThawingMethod);
      setIsPrefilled(true);
    }
  }, [uiConfig, isPrefilled]);

  const calculateThawingTime = () => {
    const weightValue = parseFloat(weight);

    if (isNaN(weightValue) || weightValue <= 0) {
      setValidationMessage('Please enter a valid weight');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    // Convert kg to lbs if needed
    const weightInLbs = weightUnit === 'kg' ? weightValue * 2.20462 : weightValue;

    // Get thawing rate (hours per pound)
    const rate = THAWING_RATES[meatType][method];
    const totalHours = weightInLbs * rate;

    // Convert to hours and minutes
    const hours = Math.floor(totalHours);
    const minutes = Math.round((totalHours - hours) * 60);

    const now = new Date();
    const startTime = new Date(now.getTime() - (totalHours * 60 * 60 * 1000));

    setResult({
      meatType,
      weight: weightValue,
      weightUnit,
      method,
      thawingTimeHours: hours,
      thawingTimeMinutes: minutes,
      startTime,
      safetyTips: SAFETY_TIPS[method],
      temperatureGuidelines: TEMPERATURE_GUIDELINES[meatType],
    });
  };

  const calculateMealPlan = () => {
    if (!mealDate || !mealTime) {
      setValidationMessage('Please enter both date and time for your meal');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const weightValue = parseFloat(weight);
    if (isNaN(weightValue) || weightValue <= 0) {
      setValidationMessage('Please enter a valid weight first');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    // Convert kg to lbs if needed
    const weightInLbs = weightUnit === 'kg' ? weightValue * 2.20462 : weightValue;
    const rate = THAWING_RATES[meatType][method];
    const totalHours = weightInLbs * rate;

    // Parse meal datetime
    const mealDateTime = new Date(`${mealDate}T${mealTime}`);

    // Add 30 minutes buffer for prep time
    const prepBuffer = 0.5; // 30 minutes
    const startThawingTime = new Date(mealDateTime.getTime() - ((totalHours + prepBuffer) * 60 * 60 * 1000));

    const hours = Math.floor(totalHours);
    const minutes = Math.round((totalHours - hours) * 60);

    setMealPlanResult({
      mealTime: mealDateTime,
      startThawingTime,
      thawingDuration: hours > 0
        ? `${hours} hour${hours > 1 ? 's' : ''} ${minutes > 0 ? `${minutes} min` : ''}`
        : `${minutes} minutes`,
    });
  };

  const reset = () => {
    setWeight('');
    setResult(null);
    setMealPlanResult(null);
    setMealDate('');
    setMealTime('');
  };

  const formatTime = (hours: number, minutes: number): string => {
    if (hours === 0) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
    if (minutes === 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    }
    return `${hours} hour${hours !== 1 ? 's' : ''} ${minutes} min`;
  };

  const formatDateTime = (date: Date): string => {
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-3xl mx-auto">
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-[#0D9488] rounded-lg">
              <Snowflake className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.meatThawing.meatThawingCalculator', 'Meat Thawing Calculator')}
              </h1>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.meatThawing.calculateSafeThawingTimesFor', 'Calculate safe thawing times for frozen meats')}
              </p>
            </div>
          </div>

          {/* Food Safety Warning */}
          <div className={`mb-6 p-4 rounded-lg border-l-4 border-amber-500 ${
            theme === 'dark' ? 'bg-amber-900/20' : 'bg-amber-50'
          }`}>
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className={`font-semibold ${theme === 'dark' ? 'text-amber-400' : 'text-amber-700'}`}>
                  {t('tools.meatThawing.foodSafetyNotice', 'Food Safety Notice')}
                </h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-amber-300' : 'text-amber-600'}`}>
                  Never thaw meat at room temperature. Bacteria grow rapidly between 40°F-140°F (4°C-60°C).
                  Always use safe thawing methods to prevent foodborne illness.
                </p>
              </div>
            </div>
          </div>

          {/* Meat Type Selection */}
          <div className="mb-6">
            <label className={`block text-sm font-medium mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.meatThawing.selectMeatType', 'Select Meat Type')}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {MEAT_TYPES.map((meat) => (
                <button
                  key={meat.value}
                  onClick={() => setMeatType(meat.value)}
                  className={`p-3 rounded-lg text-center transition-all ${
                    meatType === meat.value
                      ? 'bg-[#0D9488] text-white ring-2 ring-[#0D9488] ring-offset-2'
                      : theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } ${theme === 'dark' ? 'ring-offset-gray-800' : 'ring-offset-white'}`}
                >
                  <div className="text-2xl mb-1">{meat.icon}</div>
                  <div className="text-sm font-medium">{meat.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Weight Input */}
          <div className="mb-6">
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.meatThawing.weight', 'Weight')}
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder={t('tools.meatThawing.enterWeight', 'Enter weight')}
                step="0.1"
                min="0"
                className={`flex-1 px-4 py-3 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              />
              <div className="flex">
                <button
                  onClick={() => setWeightUnit('lbs')}
                  className={`px-4 py-3 rounded-l-lg font-medium transition-colors ${
                    weightUnit === 'lbs'
                      ? 'bg-[#0D9488] text-white'
                      : theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  lbs
                </button>
                <button
                  onClick={() => setWeightUnit('kg')}
                  className={`px-4 py-3 rounded-r-lg font-medium transition-colors ${
                    weightUnit === 'kg'
                      ? 'bg-[#0D9488] text-white'
                      : theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  kg
                </button>
              </div>
            </div>
          </div>

          {/* Thawing Method Selection */}
          <div className="mb-6">
            <label className={`block text-sm font-medium mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.meatThawing.thawingMethod', 'Thawing Method')}
            </label>
            <div className="space-y-2">
              {THAWING_METHODS.map((methodOption) => (
                <button
                  key={methodOption.value}
                  onClick={() => setMethod(methodOption.value)}
                  className={`w-full p-4 rounded-lg text-left transition-all flex items-center justify-between ${
                    method === methodOption.value
                      ? 'bg-[#0D9488] text-white'
                      : theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <div>
                    <div className="font-medium">{methodOption.label}</div>
                    <div className={`text-sm ${
                      method === methodOption.value
                        ? 'text-white/80'
                        : theme === 'dark'
                        ? 'text-gray-400'
                        : 'text-gray-500'
                    }`}>
                      {methodOption.description}
                    </div>
                  </div>
                  {method === methodOption.value && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={calculateThawingTime}
              className="flex-1 bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Clock className="w-5 h-5" />
              {t('tools.meatThawing.calculateThawingTime', 'Calculate Thawing Time')}
            </button>
            <button
              onClick={reset}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {t('tools.meatThawing.reset', 'Reset')}
            </button>
          </div>

          {/* Result Display */}
          {result && (
            <div className="space-y-4 mb-6">
              {/* Main Result */}
              <div className={`p-6 rounded-lg border-l-4 border-[#0D9488] ${
                theme === 'dark' ? 'bg-gray-700' : t('tools.meatThawing.bg0d94885', 'bg-[#0D9488]/5')
              }`}>
                <div className="text-center">
                  <div className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.meatThawing.estimatedThawingTime', 'Estimated Thawing Time')}
                  </div>
                  <div className="text-4xl font-bold text-[#0D9488] mb-2">
                    {formatTime(result.thawingTimeHours, result.thawingTimeMinutes)}
                  </div>
                  <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    for {result.weight} {result.weightUnit} of {MEAT_TYPES.find(m => m.value === result.meatType)?.label}
                    {' '}using {THAWING_METHODS.find(m => m.value === result.method)?.label.toLowerCase()} method
                  </div>
                </div>
              </div>

              {/* Temperature Guidelines */}
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className="flex items-center gap-2 mb-3">
                  <Thermometer className={`w-5 h-5 ${theme === 'dark' ? 'text-red-400' : 'text-red-500'}`} />
                  <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.meatThawing.cookingTemperatureGuidelines', 'Cooking Temperature Guidelines')}
                  </h3>
                </div>
                <ul className={`space-y-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {result.temperatureGuidelines.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-[#0D9488] font-bold">-</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Safety Tips */}
              <button
                onClick={() => setShowSafetyTips(!showSafetyTips)}
                className={`w-full p-4 rounded-lg flex items-center justify-between transition-colors ${
                  theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Info className={`w-5 h-5 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-500'}`} />
                  <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Safety Tips for {THAWING_METHODS.find(m => m.value === result.method)?.label} Method
                  </span>
                </div>
                {showSafetyTips ? (
                  <ChevronUp className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                ) : (
                  <ChevronDown className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                )}
              </button>

              {showSafetyTips && (
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <ul className={`space-y-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {result.safetyTips.map((tip, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-green-500 font-bold">-</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Meal Planner Section */}
          <div className={`border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} pt-6`}>
            <button
              onClick={() => setShowMealPlanner(!showMealPlanner)}
              className={`w-full p-4 rounded-lg flex items-center justify-between transition-colors ${
                theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <Calendar className={`w-5 h-5 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-500'}`} />
                <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.meatThawing.planFromMealTime', 'Plan From Meal Time')}
                </span>
              </div>
              {showMealPlanner ? (
                <ChevronUp className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
              ) : (
                <ChevronDown className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
              )}
            </button>

            {showMealPlanner && (
              <div className={`mt-4 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.meatThawing.enterWhenYouWantTo', 'Enter when you want to cook, and we will calculate when to start thawing.')}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.meatThawing.mealDate', 'Meal Date')}
                    </label>
                    <input
                      type="date"
                      value={mealDate}
                      onChange={(e) => setMealDate(e.target.value)}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-600 border-gray-500 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.meatThawing.cookingTime', 'Cooking Time')}
                    </label>
                    <input
                      type="time"
                      value={mealTime}
                      onChange={(e) => setMealTime(e.target.value)}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-600 border-gray-500 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                </div>

                <button
                  onClick={calculateMealPlan}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Calendar className="w-5 h-5" />
                  {t('tools.meatThawing.calculateStartTime', 'Calculate Start Time')}
                </button>

                {mealPlanResult && (
                  <div className={`mt-4 p-4 rounded-lg border-l-4 border-purple-500 ${
                    theme === 'dark' ? 'bg-gray-600' : 'bg-purple-50'
                  }`}>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                          {t('tools.meatThawing.plannedMealTime', 'Planned Meal Time:')}
                        </span>
                        <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {formatDateTime(mealPlanResult.mealTime)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                          {t('tools.meatThawing.thawingDuration', 'Thawing Duration:')}
                        </span>
                        <span className="font-semibold text-[#0D9488]">
                          {mealPlanResult.thawingDuration}
                        </span>
                      </div>
                      <div className={`border-t ${theme === 'dark' ? 'border-gray-500' : 'border-gray-300'} pt-3`}>
                        <div className="flex justify-between items-center">
                          <span className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            {t('tools.meatThawing.startThawing', 'Start Thawing:')}
                          </span>
                          <span className="font-bold text-lg text-purple-500">
                            {formatDateTime(mealPlanResult.startThawingTime)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Reference Guide */}
          <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <h3 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.meatThawing.quickReferenceGuide', 'Quick Reference Guide')}
            </h3>
            <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-600' : 'bg-white'}`}>
                  <div className="font-medium text-blue-500 mb-1">{t('tools.meatThawing.refrigerator', 'Refrigerator')}</div>
                  <div className="text-xs">~5 hours per pound</div>
                  <div className="text-xs">{t('tools.meatThawing.safestMethod', 'Safest method')}</div>
                </div>
                <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-600' : 'bg-white'}`}>
                  <div className="font-medium text-green-500 mb-1">{t('tools.meatThawing.coldWater', 'Cold Water')}</div>
                  <div className="text-xs">~30 min per pound</div>
                  <div className="text-xs">{t('tools.meatThawing.changeWaterEvery30Min', 'Change water every 30 min')}</div>
                </div>
                <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-600' : 'bg-white'}`}>
                  <div className="font-medium text-orange-500 mb-1">{t('tools.meatThawing.microwave', 'Microwave')}</div>
                  <div className="text-xs">~6 min per pound</div>
                  <div className="text-xs">{t('tools.meatThawing.cookImmediatelyAfter', 'Cook immediately after')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Validation Toast */}
      {validationMessage && (
        <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto bg-amber-100 border border-amber-400 text-amber-800 px-4 py-3 rounded-lg shadow-lg">
          {validationMessage}
        </div>
      )}

      <ConfirmDialog />
    </div>
  );
};

export default MeatThawingTool;
