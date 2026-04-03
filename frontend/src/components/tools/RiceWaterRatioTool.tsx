import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Wheat, Droplets, Timer, ChefHat, Sparkles, Mountain, Clock, Info } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useConfirmDialog } from '../ui/ConfirmDialog';

type RiceType = 'long-grain-white' | 'short-grain-sushi' | 'basmati' | 'jasmine' | 'brown' | 'wild';
type CookingMethod = 'stovetop' | 'rice-cooker' | 'instant-pot';

interface RiceData {
  name: string;
  waterRatio: number;
  cookTime: number;
  restTime: number;
  yield: number;
  rinseInstructions: string;
  tips: string[];
  methodAdjustments: {
    'stovetop': { waterRatio: number; cookTime: number };
    'rice-cooker': { waterRatio: number; cookTime: number };
    'instant-pot': { waterRatio: number; cookTime: number };
  };
}

interface CalculationResult {
  riceCups: number;
  waterCups: number;
  waterMl: number;
  cookTime: number;
  restTime: number;
  yieldCups: number;
  servings: number;
  riceType: RiceType;
  method: CookingMethod;
}

const RICE_DATA: Record<RiceType, RiceData> = {
  'long-grain-white': {
    name: 'Long Grain White Rice',
    waterRatio: 1.5,
    cookTime: 18,
    restTime: 5,
    yield: 3,
    rinseInstructions: 'Rinse 2-3 times until water runs mostly clear. This removes excess starch for fluffier rice.',
    tips: [
      'Do not lift the lid while cooking',
      'Fluff with a fork after resting',
      'For extra flavor, toast rice in butter before adding water',
      'Use broth instead of water for more flavor'
    ],
    methodAdjustments: {
      'stovetop': { waterRatio: 1.5, cookTime: 18 },
      'rice-cooker': { waterRatio: 1.5, cookTime: 20 },
      'instant-pot': { waterRatio: 1, cookTime: 3 }
    }
  },
  'short-grain-sushi': {
    name: 'Short Grain / Sushi Rice',
    waterRatio: 1.1,
    cookTime: 15,
    restTime: 10,
    yield: 2.5,
    rinseInstructions: 'Rinse thoroughly 4-5 times until water is completely clear. Soak for 30 minutes before cooking for best results.',
    tips: [
      'Soaking is crucial for proper texture',
      'Season with rice vinegar, sugar, and salt after cooking for sushi',
      'Use a wooden paddle to fold in seasonings',
      'Cover with damp cloth while cooling'
    ],
    methodAdjustments: {
      'stovetop': { waterRatio: 1.1, cookTime: 15 },
      'rice-cooker': { waterRatio: 1.1, cookTime: 18 },
      'instant-pot': { waterRatio: 1, cookTime: 4 }
    }
  },
  'basmati': {
    name: 'Basmati Rice',
    waterRatio: 1.5,
    cookTime: 15,
    restTime: 5,
    yield: 3,
    rinseInstructions: 'Rinse 3-4 times until water is clear. Optional: soak for 30 minutes for longer grains.',
    tips: [
      'Soaking helps grains elongate during cooking',
      'Add a bay leaf or cardamom pods for authentic flavor',
      'Use ghee instead of oil for traditional taste',
      'Aged basmati has longer grains and better aroma'
    ],
    methodAdjustments: {
      'stovetop': { waterRatio: 1.5, cookTime: 15 },
      'rice-cooker': { waterRatio: 1.5, cookTime: 18 },
      'instant-pot': { waterRatio: 1, cookTime: 4 }
    }
  },
  'jasmine': {
    name: 'Jasmine Rice',
    waterRatio: 1.25,
    cookTime: 18,
    restTime: 5,
    yield: 3,
    rinseInstructions: 'Rinse 2-3 times gently. Do not over-rinse as this removes the aromatic oils.',
    tips: [
      'Less water than regular white rice for stickier texture',
      'The fragrance is best when freshly cooked',
      'Great for Thai and Southeast Asian dishes',
      'Can be cooked with coconut milk for coconut rice'
    ],
    methodAdjustments: {
      'stovetop': { waterRatio: 1.25, cookTime: 18 },
      'rice-cooker': { waterRatio: 1.25, cookTime: 20 },
      'instant-pot': { waterRatio: 1, cookTime: 3 }
    }
  },
  'brown': {
    name: 'Brown Rice',
    waterRatio: 2.25,
    cookTime: 45,
    restTime: 10,
    yield: 3,
    rinseInstructions: 'Rinse once. Optional: soak overnight to reduce cooking time and improve digestibility.',
    tips: [
      'Takes significantly longer to cook than white rice',
      'Soaking overnight can reduce cook time by 15 minutes',
      'Has a nuttier flavor and chewier texture',
      'Store in refrigerator as the bran oils can go rancid'
    ],
    methodAdjustments: {
      'stovetop': { waterRatio: 2.25, cookTime: 45 },
      'rice-cooker': { waterRatio: 2.25, cookTime: 50 },
      'instant-pot': { waterRatio: 1.25, cookTime: 22 }
    }
  },
  'wild': {
    name: 'Wild Rice',
    waterRatio: 3,
    cookTime: 50,
    restTime: 10,
    yield: 3.5,
    rinseInstructions: 'Rinse thoroughly in a fine mesh strainer. No soaking needed but optional overnight soak can reduce cook time.',
    tips: [
      'Wild rice is actually a grass, not true rice',
      'Grains should split open when done',
      'Great mixed with other rice types',
      'Has a strong, earthy, nutty flavor'
    ],
    methodAdjustments: {
      'stovetop': { waterRatio: 3, cookTime: 50 },
      'rice-cooker': { waterRatio: 3, cookTime: 55 },
      'instant-pot': { waterRatio: 1.5, cookTime: 30 }
    }
  }
};

const ALTITUDE_ADJUSTMENTS = [
  { altitude: 0, label: 'Sea Level (0-3,000 ft)', waterAdjust: 0, timeAdjust: 0 },
  { altitude: 3000, label: 'Moderate (3,000-5,000 ft)', waterAdjust: 0.125, timeAdjust: 2 },
  { altitude: 5000, label: 'High (5,000-7,500 ft)', waterAdjust: 0.25, timeAdjust: 4 },
  { altitude: 7500, label: 'Very High (7,500-10,000 ft)', waterAdjust: 0.375, timeAdjust: 6 },
  { altitude: 10000, label: 'Extreme (10,000+ ft)', waterAdjust: 0.5, timeAdjust: 8 }
];

interface RiceWaterRatioToolProps {
  uiConfig?: UIConfig;
}

export function RiceWaterRatioTool({ uiConfig }: RiceWaterRatioToolProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [riceType, setRiceType] = useState<RiceType>('long-grain-white');
  const [inputMode, setInputMode] = useState<'cups' | 'servings'>('cups');
  const [cupsOfRice, setCupsOfRice] = useState('1');
  const [servings, setServings] = useState('4');
  const [cookingMethod, setCookingMethod] = useState<CookingMethod>('stovetop');
  const [altitudeIndex, setAltitudeIndex] = useState(0);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.prefillData && !isPrefilled) {
      const data = uiConfig.prefillData;
      if (data.riceType) setRiceType(data.riceType as RiceType);
      if (data.cups) setCupsOfRice(String(data.cups));
      if (data.servings) setServings(String(data.servings));
      if (data.cookingMethod) setCookingMethod(data.cookingMethod as CookingMethod);
      if (data.inputMode) setInputMode(data.inputMode as 'cups' | 'servings');
      setIsPrefilled(true);
    }
  }, [uiConfig, isPrefilled]);

  const calculate = () => {
    const riceData = RICE_DATA[riceType];
    const altitudeData = ALTITUDE_ADJUSTMENTS[altitudeIndex];
    const methodData = riceData.methodAdjustments[cookingMethod];

    let riceCupsValue: number;
    let servingsValue: number;

    if (inputMode === 'cups') {
      riceCupsValue = parseFloat(cupsOfRice);
      if (isNaN(riceCupsValue) || riceCupsValue <= 0) {
        setValidationMessage('Please enter a valid number of cups');
        setTimeout(() => setValidationMessage(null), 3000);
        return;
      }
      servingsValue = Math.round(riceCupsValue * riceData.yield * 2);
    } else {
      servingsValue = parseInt(servings);
      if (isNaN(servingsValue) || servingsValue <= 0) {
        setValidationMessage('Please enter a valid number of servings');
        setTimeout(() => setValidationMessage(null), 3000);
        return;
      }
      riceCupsValue = servingsValue / (riceData.yield * 2);
    }

    const baseWaterRatio = methodData.waterRatio + altitudeData.waterAdjust;
    const waterCups = riceCupsValue * baseWaterRatio;
    const waterMl = waterCups * 236.588;
    const cookTime = methodData.cookTime + altitudeData.timeAdjust;
    const yieldCups = riceCupsValue * riceData.yield;

    setResult({
      riceCups: parseFloat(riceCupsValue.toFixed(2)),
      waterCups: parseFloat(waterCups.toFixed(2)),
      waterMl: Math.round(waterMl),
      cookTime,
      restTime: riceData.restTime,
      yieldCups: parseFloat(yieldCups.toFixed(2)),
      servings: servingsValue,
      riceType,
      method: cookingMethod
    });
  };

  const reset = () => {
    setRiceType('long-grain-white');
    setInputMode('cups');
    setCupsOfRice('1');
    setServings('4');
    setCookingMethod('stovetop');
    setAltitudeIndex(0);
    setResult(null);
  };

  const riceData = RICE_DATA[riceType];

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-2xl mx-auto">
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-[#0D9488] rounded-lg">
              <Wheat className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.riceWaterRatio.riceWaterRatioCalculator', 'Rice Water Ratio Calculator')}
              </h1>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.riceWaterRatio.calculatePerfectRiceToWater', 'Calculate perfect rice to water ratios for any rice type')}
              </p>
            </div>
          </div>

          {/* Input Fields */}
          <div className="space-y-4 mb-6">
            {/* Rice Type Selection */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.riceWaterRatio.riceType', 'Rice Type')}
              </label>
              <select
                value={riceType}
                onChange={(e) => setRiceType(e.target.value as RiceType)}
                className={`w-full px-4 py-3 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              >
                <option value="long-grain-white">{t('tools.riceWaterRatio.longGrainWhiteRice', 'Long Grain White Rice')}</option>
                <option value="short-grain-sushi">{t('tools.riceWaterRatio.shortGrainSushiRice', 'Short Grain / Sushi Rice')}</option>
                <option value="basmati">{t('tools.riceWaterRatio.basmatiRice', 'Basmati Rice')}</option>
                <option value="jasmine">{t('tools.riceWaterRatio.jasmineRice', 'Jasmine Rice')}</option>
                <option value="brown">{t('tools.riceWaterRatio.brownRice', 'Brown Rice')}</option>
                <option value="wild">{t('tools.riceWaterRatio.wildRice', 'Wild Rice')}</option>
              </select>
            </div>

            {/* Input Mode Toggle */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.riceWaterRatio.calculateBy', 'Calculate By')}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['cups', 'servings'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setInputMode(mode)}
                    className={`py-2 px-4 rounded-lg font-medium transition-colors capitalize ${
                      inputMode === mode
                        ? 'bg-[#0D9488] text-white'
                        : theme === 'dark'
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {mode === 'cups' ? t('tools.riceWaterRatio.cupsOfRice', 'Cups of Rice') : t('tools.riceWaterRatio.servings2', 'Servings')}
                  </button>
                ))}
              </div>
            </div>

            {/* Amount Input */}
            {inputMode === 'cups' ? (
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.riceWaterRatio.cupsOfUncookedRice', 'Cups of Uncooked Rice')}
                </label>
                <input
                  type="number"
                  value={cupsOfRice}
                  onChange={(e) => setCupsOfRice(e.target.value)}
                  placeholder={t('tools.riceWaterRatio.enterCupsOfRice', 'Enter cups of rice')}
                  step="0.25"
                  min="0.25"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
            ) : (
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.riceWaterRatio.numberOfServings', 'Number of Servings')}
                </label>
                <input
                  type="number"
                  value={servings}
                  onChange={(e) => setServings(e.target.value)}
                  placeholder={t('tools.riceWaterRatio.enterNumberOfServings', 'Enter number of servings')}
                  min="1"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
                <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  1 serving = approximately 1/2 cup cooked rice
                </p>
              </div>
            )}

            {/* Cooking Method */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.riceWaterRatio.cookingMethod', 'Cooking Method')}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { value: 'stovetop', label: 'Stovetop' },
                  { value: 'rice-cooker', label: 'Rice Cooker' },
                  { value: 'instant-pot', label: 'Instant Pot' }
                ] as const).map((method) => (
                  <button
                    key={method.value}
                    onClick={() => setCookingMethod(method.value)}
                    className={`py-2 px-3 rounded-lg font-medium transition-colors text-sm ${
                      cookingMethod === method.value
                        ? 'bg-[#0D9488] text-white'
                        : theme === 'dark'
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {method.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Altitude Adjustment */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                <div className="flex items-center gap-2">
                  <Mountain className="w-4 h-4" />
                  {t('tools.riceWaterRatio.altitudeAdjustment', 'Altitude Adjustment')}
                </div>
              </label>
              <select
                value={altitudeIndex}
                onChange={(e) => setAltitudeIndex(parseInt(e.target.value))}
                className={`w-full px-4 py-3 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              >
                {ALTITUDE_ADJUSTMENTS.map((alt, index) => (
                  <option key={index} value={index}>
                    {alt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={calculate}
              className="flex-1 bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <ChefHat className="w-5 h-5" />
              {t('tools.riceWaterRatio.calculate', 'Calculate')}
            </button>
            <button
              onClick={reset}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {t('tools.riceWaterRatio.reset', 'Reset')}
            </button>
          </div>

          {/* Result Display */}
          {result && (
            <div className="space-y-4">
              {/* Main Results */}
              <div className={`p-6 rounded-lg border-l-4 border-[#0D9488] ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-teal-50'
              }`}>
                <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {RICE_DATA[result.riceType].name} - {result.method === 'stovetop' ? 'Stovetop' : result.method === 'rice-cooker' ? t('tools.riceWaterRatio.riceCooker', 'Rice Cooker') : t('tools.riceWaterRatio.instantPot', 'Instant Pot')}
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Wheat className="w-5 h-5 text-amber-500" />
                      <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {t('tools.riceWaterRatio.uncookedRice', 'Uncooked Rice')}
                      </span>
                    </div>
                    <div className="text-3xl font-bold text-amber-500">
                      {result.riceCups} cups
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Droplets className="w-5 h-5 text-blue-500" />
                      <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {t('tools.riceWaterRatio.waterNeeded', 'Water Needed')}
                      </span>
                    </div>
                    <div className="text-3xl font-bold text-blue-500">
                      {result.waterCups} cups
                    </div>
                    <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      ({result.waterMl} ml)
                    </div>
                  </div>
                </div>
              </div>

              {/* Cooking Times */}
              <div className={`p-6 rounded-lg border-l-4 border-orange-500 ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-orange-50'
              }`}>
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-orange-500" />
                  <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.riceWaterRatio.cookingTimes', 'Cooking Times')}
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className={`text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('tools.riceWaterRatio.cookingTime', 'Cooking Time')}
                    </div>
                    <div className="text-2xl font-bold text-orange-500">
                      {result.cookTime} min
                    </div>
                  </div>
                  <div className="text-center">
                    <div className={`text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('tools.riceWaterRatio.restingTime', 'Resting Time')}
                    </div>
                    <div className="text-2xl font-bold text-orange-500">
                      {result.restTime} min
                    </div>
                  </div>
                </div>
              </div>

              {/* Expected Yield */}
              <div className={`p-6 rounded-lg border-l-4 border-green-500 ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-green-50'
              }`}>
                <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.riceWaterRatio.expectedYield', 'Expected Yield')}
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className={`text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('tools.riceWaterRatio.cookedRice', 'Cooked Rice')}
                    </div>
                    <div className="text-2xl font-bold text-green-500">
                      {result.yieldCups} cups
                    </div>
                  </div>
                  <div className="text-center">
                    <div className={`text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('tools.riceWaterRatio.servings', 'Servings')}
                    </div>
                    <div className="text-2xl font-bold text-green-500">
                      ~{result.servings}
                    </div>
                  </div>
                </div>
              </div>

              {/* Ratio Summary */}
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                  {t('tools.riceWaterRatio.waterRatio', 'Water Ratio:')}
                </div>
                <div className={`font-mono text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  1 cup rice : {(result.waterCups / result.riceCups).toFixed(2)} cups water
                </div>
              </div>
            </div>
          )}

          {/* Rinse Instructions */}
          <div className={`mt-6 p-4 rounded-lg border-l-4 border-blue-500 ${theme === 'dark' ? 'bg-gray-700' : 'bg-blue-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Droplets className="w-5 h-5 text-blue-500" />
              <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.riceWaterRatio.rinseInstructions', 'Rinse Instructions')}
              </h3>
            </div>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {riceData.rinseInstructions}
            </p>
          </div>

          {/* Tips for Selected Rice Type */}
          <div className={`mt-4 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-5 h-5 text-[#0D9488]" />
              <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Tips for {riceData.name}
              </h3>
            </div>
            <ul className={`space-y-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {riceData.tips.map((tip, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-[#0D9488] mt-1">-</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Altitude Info */}
          {altitudeIndex > 0 && (
            <div className={`mt-4 p-4 rounded-lg border-l-4 border-purple-500 ${theme === 'dark' ? 'bg-gray-700' : 'bg-purple-50'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Mountain className="w-5 h-5 text-purple-500" />
                <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.riceWaterRatio.altitudeAdjustmentApplied', 'Altitude Adjustment Applied')}
                </h3>
              </div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                At higher altitudes, water boils at a lower temperature. We've added +{ALTITUDE_ADJUSTMENTS[altitudeIndex].waterAdjust} cups water per cup of rice and +{ALTITUDE_ADJUSTMENTS[altitudeIndex].timeAdjust} minutes cooking time to compensate.
              </p>
            </div>
          )}

          {/* General Cooking Guide */}
          <div className={`mt-4 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <h3 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.riceWaterRatio.generalCookingSteps', 'General Cooking Steps')}
            </h3>
            <ol className={`space-y-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {cookingMethod === 'stovetop' && (
                <>
                  <li>1. Rinse rice according to instructions above</li>
                  <li>2. Combine rice and water in a pot with a tight-fitting lid</li>
                  <li>3. Bring to a boil over high heat</li>
                  <li>4. Reduce heat to low, cover, and simmer</li>
                  <li>5. Do not lift the lid during cooking</li>
                  <li>6. Remove from heat and let rest covered</li>
                  <li>7. Fluff with a fork and serve</li>
                </>
              )}
              {cookingMethod === 'rice-cooker' && (
                <>
                  <li>1. Rinse rice according to instructions above</li>
                  <li>2. Add rice and water to the rice cooker pot</li>
                  <li>3. Close the lid and select the appropriate setting</li>
                  <li>4. Let the cooker switch to "warm" mode automatically</li>
                  <li>5. Let rest for the recommended time</li>
                  <li>6. Fluff with the rice paddle and serve</li>
                </>
              )}
              {cookingMethod === 'instant-pot' && (
                <>
                  <li>1. Rinse rice according to instructions above</li>
                  <li>2. Add rice and water to the Instant Pot</li>
                  <li>3. Close lid and set valve to "Sealing"</li>
                  <li>4. Cook on "Pressure Cook/Manual" for the time shown</li>
                  <li>5. Natural pressure release for 10 minutes</li>
                  <li>6. Quick release remaining pressure</li>
                  <li>7. Fluff with a fork and serve</li>
                </>
              )}
            </ol>
          </div>
        </div>
      </div>
      <ConfirmDialog />
      {validationMessage && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50">
          {validationMessage}
        </div>
      )}
    </div>
  );
}

export default RiceWaterRatioTool;
