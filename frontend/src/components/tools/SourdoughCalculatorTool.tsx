import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Wheat, Scale, Clock, Thermometer, Calculator, Plus, Minus, Info } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface IngredientResult {
  flour: number;
  water: number;
  starter: number;
  salt: number;
}

interface TimelineStep {
  step: string;
  time: string;
  duration: string;
  description: string;
}

interface FeedingScheduleStep {
  time: string;
  action: string;
  flour: number;
  water: number;
}

type HydrationLevel = 65 | 70 | 75 | 80 | 85;
type TemperatureUnit = 'celsius' | 'fahrenheit';

interface SourdoughCalculatorToolProps {
  uiConfig?: UIConfig;
}

export const SourdoughCalculatorTool: React.FC<SourdoughCalculatorToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  // Input states
  const [targetWeight, setTargetWeight] = useState<string>('900');
  const [numberOfLoaves, setNumberOfLoaves] = useState<number>(1);
  const [hydrationPercent, setHydrationPercent] = useState<HydrationLevel>(75);
  const [starterPercent, setStarterPercent] = useState<string>('20');
  const [saltPercent, setSaltPercent] = useState<string>('2');
  const [roomTemperature, setRoomTemperature] = useState<string>('22');
  const [temperatureUnit, setTemperatureUnit] = useState<TemperatureUnit>('celsius');
  const [bakeStartTime, setBakeStartTime] = useState<string>('18:00');

  // UI states
  const [showTimeline, setShowTimeline] = useState<boolean>(false);
  const [showFeedingSchedule, setShowFeedingSchedule] = useState<boolean>(false);
  const [showFormula, setShowFormula] = useState<boolean>(false);
  const [calculated, setCalculated] = useState<boolean>(false);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.prefillData && !isPrefilled) {
      const data = uiConfig.prefillData;
      if (data.targetWeight) setTargetWeight(String(data.targetWeight));
      if (data.loaves) setNumberOfLoaves(Number(data.loaves));
      if (data.hydration) setHydrationPercent(Number(data.hydration) as HydrationLevel);
      if (data.starterPercent) setStarterPercent(String(data.starterPercent));
      if (data.saltPercent) setSaltPercent(String(data.saltPercent));
      if (data.roomTemperature) setRoomTemperature(String(data.roomTemperature));
      if (data.temperatureUnit) setTemperatureUnit(data.temperatureUnit as TemperatureUnit);
      setIsPrefilled(true);
    }
  }, [uiConfig, isPrefilled]);

  // Calculate ingredients based on baker's percentages
  const calculateIngredients = useMemo((): IngredientResult | null => {
    const weight = parseFloat(targetWeight);
    const starter = parseFloat(starterPercent);
    const salt = parseFloat(saltPercent);

    if (isNaN(weight) || weight <= 0 || isNaN(starter) || isNaN(salt)) {
      return null;
    }

    const totalWeight = weight * numberOfLoaves;

    // Baker's percentages are based on flour weight = 100%
    // Total dough = flour + water + starter + salt
    // Let flour = 100%, water = hydration%, starter = starter%, salt = salt%
    // Starter is typically 100% hydration (equal parts flour and water)
    // So starter contributes: starter% / 2 to flour and starter% / 2 to water

    const starterFlourContribution = starter / 2;
    const starterWaterContribution = starter / 2;

    // Total flour percentage = 100 (base flour) + starterFlourContribution
    // Total water percentage = hydration + starterWaterContribution
    // Total percentage = 100 + hydration + starter + salt

    const totalPercentage = 100 + hydrationPercent + starter + salt;

    // Calculate flour weight (base flour, not including what's in starter)
    const flourWeight = (totalWeight / totalPercentage) * 100;

    // Calculate other ingredients
    const waterWeight = (flourWeight * hydrationPercent) / 100;
    const starterWeight = (flourWeight * starter) / 100;
    const saltWeight = (flourWeight * salt) / 100;

    return {
      flour: Math.round(flourWeight),
      water: Math.round(waterWeight),
      starter: Math.round(starterWeight),
      salt: Math.round(saltWeight * 10) / 10,
    };
  }, [targetWeight, numberOfLoaves, hydrationPercent, starterPercent, saltPercent]);

  // Calculate fermentation times based on temperature
  const getFermentationTimes = useMemo(() => {
    let tempCelsius = parseFloat(roomTemperature);

    if (temperatureUnit === 'fahrenheit') {
      tempCelsius = (tempCelsius - 32) * 5 / 9;
    }

    if (isNaN(tempCelsius)) {
      tempCelsius = 22; // Default
    }

    // Base times at 22C (72F)
    const baseBulkHours = 4;
    const baseProofHours = 2;

    // Adjust based on temperature (fermentation doubles/halves every ~8-10 degrees C)
    const tempDiff = tempCelsius - 22;
    const factor = Math.pow(0.92, tempDiff);

    const bulkHours = Math.round(baseBulkHours * factor * 10) / 10;
    const proofHours = Math.round(baseProofHours * factor * 10) / 10;

    return {
      bulkFermentation: bulkHours,
      proofing: proofHours,
      totalHours: bulkHours + proofHours + 2, // +2 for autolyse, shaping, etc.
      temperature: tempCelsius,
    };
  }, [roomTemperature, temperatureUnit]);

  // Generate baking timeline
  const generateTimeline = useMemo((): TimelineStep[] => {
    const times = getFermentationTimes;
    const [hours, minutes] = bakeStartTime.split(':').map(Number);
    const bakeTime = new Date();
    bakeTime.setHours(hours, minutes, 0, 0);

    // Work backwards from bake time
    const timeline: TimelineStep[] = [];

    // Bake
    const bakeStart = new Date(bakeTime);
    timeline.unshift({
      step: 'Bake',
      time: formatTime(bakeStart),
      duration: '45-60 min',
      description: 'Bake at 250C/480F with lid for 30 min, then 220C/425F without lid for 15-30 min',
    });

    // Preheat oven (1 hour before bake)
    const preheatTime = new Date(bakeStart);
    preheatTime.setHours(preheatTime.getHours() - 1);
    timeline.unshift({
      step: 'Preheat Oven',
      time: formatTime(preheatTime),
      duration: '60 min',
      description: 'Preheat oven with Dutch oven inside to 250C/480F',
    });

    // Cold proof (optional - overnight in fridge)
    const proofEnd = new Date(preheatTime);
    const proofStart = new Date(proofEnd);
    proofStart.setMinutes(proofStart.getMinutes() - times.proofing * 60);
    timeline.unshift({
      step: 'Final Proof',
      time: formatTime(proofStart),
      duration: `${times.proofing} hours`,
      description: 'Proof at room temperature or 8-12 hours in refrigerator',
    });

    // Shape
    const shapeTime = new Date(proofStart);
    shapeTime.setMinutes(shapeTime.getMinutes() - 30);
    timeline.unshift({
      step: 'Shape',
      time: formatTime(shapeTime),
      duration: '30 min',
      description: 'Pre-shape, rest 20 min, final shape and place in banneton',
    });

    // Bulk fermentation end
    const bulkEnd = new Date(shapeTime);
    const bulkStart = new Date(bulkEnd);
    bulkStart.setMinutes(bulkStart.getMinutes() - times.bulkFermentation * 60);
    timeline.unshift({
      step: 'Bulk Fermentation',
      time: formatTime(bulkStart),
      duration: `${times.bulkFermentation} hours`,
      description: 'Perform 3-4 sets of stretch and folds every 30-45 min, then rest',
    });

    // Mix/add starter
    const mixTime = new Date(bulkStart);
    mixTime.setMinutes(mixTime.getMinutes() - 10);
    timeline.unshift({
      step: 'Add Starter & Salt',
      time: formatTime(mixTime),
      duration: '10 min',
      description: 'Add levain and salt, mix until incorporated',
    });

    // Autolyse
    const autolyseStart = new Date(mixTime);
    autolyseStart.setMinutes(autolyseStart.getMinutes() - 45);
    timeline.unshift({
      step: 'Autolyse',
      time: formatTime(autolyseStart),
      duration: '30-60 min',
      description: 'Mix flour and water, rest to develop gluten',
    });

    // Feed starter (8-12 hours before mix)
    const feedTime = new Date(mixTime);
    feedTime.setHours(feedTime.getHours() - 10);
    timeline.unshift({
      step: 'Feed Starter',
      time: formatTime(feedTime),
      duration: '8-12 hours to peak',
      description: 'Feed starter at 1:5:5 ratio (starter:flour:water)',
    });

    return timeline;
  }, [bakeStartTime, getFermentationTimes]);

  // Generate feeding schedule for starter
  const generateFeedingSchedule = useMemo((): FeedingScheduleStep[] => {
    if (!calculateIngredients) return [];

    const starterNeeded = calculateIngredients.starter;
    // We need about 20% extra for what sticks to container
    const starterToMake = Math.round(starterNeeded * 1.2);

    // 1:5:5 feeding ratio
    const feedFlour = Math.round(starterToMake / 11 * 5);
    const feedWater = Math.round(starterToMake / 11 * 5);
    const seedStarter = Math.round(starterToMake / 11);

    return [
      {
        time: '8-12 hours before mixing',
        action: 'Final Feed',
        flour: feedFlour,
        water: feedWater,
      },
      {
        time: '24 hours before mixing',
        action: 'Refresh Feed (if starter was dormant)',
        flour: Math.round(feedFlour / 2),
        water: Math.round(feedWater / 2),
      },
      {
        time: 'Maintenance',
        action: `Keep ${seedStarter}g of starter, discard rest`,
        flour: feedFlour,
        water: feedWater,
      },
    ];
  }, [calculateIngredients]);

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleCalculate = () => {
    setCalculated(true);
  };

  const reset = () => {
    setTargetWeight('900');
    setNumberOfLoaves(1);
    setHydrationPercent(75);
    setStarterPercent('20');
    setSaltPercent('2');
    setRoomTemperature('22');
    setTemperatureUnit('celsius');
    setBakeStartTime('18:00');
    setCalculated(false);
    setShowTimeline(false);
    setShowFeedingSchedule(false);
  };

  const incrementLoaves = () => setNumberOfLoaves(prev => Math.min(prev + 1, 10));
  const decrementLoaves = () => setNumberOfLoaves(prev => Math.max(prev - 1, 1));

  const hydrationOptions: HydrationLevel[] = [65, 70, 75, 80, 85];

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-4xl mx-auto">
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-[#0D9488] rounded-lg">
              <Wheat className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.sourdoughCalculator.sourdoughCalculator', 'Sourdough Calculator')}
              </h1>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.sourdoughCalculator.calculateIngredientsUsingBakerS', 'Calculate ingredients using baker\'s percentages')}
              </p>
            </div>
          </div>

          {/* Input Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Target Weight */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.sourdoughCalculator.targetLoafWeightG', 'Target Loaf Weight (g)')}
              </label>
              <div className="relative">
                <Scale className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <input
                  type="number"
                  value={targetWeight}
                  onChange={(e) => setTargetWeight(e.target.value)}
                  placeholder={t('tools.sourdoughCalculator.enterTargetWeight', 'Enter target weight')}
                  min="200"
                  step="50"
                  className={`w-full pl-11 pr-4 py-3 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
            </div>

            {/* Number of Loaves */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.sourdoughCalculator.numberOfLoaves', 'Number of Loaves')}
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={decrementLoaves}
                  className={`p-3 rounded-lg transition-colors ${
                    theme === 'dark'
                      ? 'bg-gray-700 hover:bg-gray-600 text-white'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className={`text-2xl font-bold min-w-[3rem] text-center ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {numberOfLoaves}
                </span>
                <button
                  onClick={incrementLoaves}
                  className={`p-3 rounded-lg transition-colors ${
                    theme === 'dark'
                      ? 'bg-gray-700 hover:bg-gray-600 text-white'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Hydration */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.sourdoughCalculator.hydration', 'Hydration (%)')}
              </label>
              <div className="grid grid-cols-5 gap-2">
                {hydrationOptions.map((percent) => (
                  <button
                    key={percent}
                    onClick={() => setHydrationPercent(percent)}
                    className={`py-2 px-3 rounded-lg font-medium transition-colors ${
                      hydrationPercent === percent
                        ? 'bg-[#0D9488] text-white'
                        : theme === 'dark'
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {percent}%
                  </button>
                ))}
              </div>
              <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                {hydrationPercent < 70 ? 'Stiffer dough, easier to handle' :
                 hydrationPercent > 78 ? t('tools.sourdoughCalculator.wetterDoughMoreOpenCrumb', 'Wetter dough, more open crumb') : t('tools.sourdoughCalculator.balancedHydration', 'Balanced hydration')}
              </p>
            </div>

            {/* Starter Percentage */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.sourdoughCalculator.starterLevain', 'Starter/Levain (%)')}
              </label>
              <input
                type="number"
                value={starterPercent}
                onChange={(e) => setStarterPercent(e.target.value)}
                placeholder={t('tools.sourdoughCalculator.enterStarter', 'Enter starter %')}
                min="5"
                max="50"
                step="1"
                className={`w-full px-4 py-3 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              />
              <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                {t('tools.sourdoughCalculator.typicalRange1525', 'Typical range: 15-25%')}
              </p>
            </div>

            {/* Salt Percentage */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.sourdoughCalculator.salt', 'Salt (%)')}
              </label>
              <input
                type="number"
                value={saltPercent}
                onChange={(e) => setSaltPercent(e.target.value)}
                placeholder={t('tools.sourdoughCalculator.enterSalt', 'Enter salt %')}
                min="1"
                max="3"
                step="0.1"
                className={`w-full px-4 py-3 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              />
              <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                {t('tools.sourdoughCalculator.typical1822', 'Typical: 1.8-2.2%')}
              </p>
            </div>

            {/* Room Temperature */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.sourdoughCalculator.roomTemperature', 'Room Temperature')}
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Thermometer className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                  <input
                    type="number"
                    value={roomTemperature}
                    onChange={(e) => setRoomTemperature(e.target.value)}
                    placeholder={t('tools.sourdoughCalculator.temperature', 'Temperature')}
                    className={`w-full pl-11 pr-4 py-3 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
                <div className="flex">
                  <button
                    onClick={() => setTemperatureUnit('celsius')}
                    className={`px-3 py-3 rounded-l-lg font-medium transition-colors ${
                      temperatureUnit === 'celsius'
                        ? 'bg-[#0D9488] text-white'
                        : theme === 'dark'
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    C
                  </button>
                  <button
                    onClick={() => setTemperatureUnit('fahrenheit')}
                    className={`px-3 py-3 rounded-r-lg font-medium transition-colors ${
                      temperatureUnit === 'fahrenheit'
                        ? 'bg-[#0D9488] text-white'
                        : theme === 'dark'
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    F
                  </button>
                </div>
              </div>
            </div>

            {/* Bake Time */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.sourdoughCalculator.targetBakeTime', 'Target Bake Time')}
              </label>
              <div className="relative">
                <Clock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <input
                  type="time"
                  value={bakeStartTime}
                  onChange={(e) => setBakeStartTime(e.target.value)}
                  className={`w-full pl-11 pr-4 py-3 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={handleCalculate}
              className="flex-1 bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Calculator className="w-5 h-5" />
              {t('tools.sourdoughCalculator.calculateRecipe', 'Calculate Recipe')}
            </button>
            <button
              onClick={reset}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {t('tools.sourdoughCalculator.reset', 'Reset')}
            </button>
          </div>

          {/* Results Section */}
          {calculated && calculateIngredients && (
            <div className="space-y-6">
              {/* Ingredients Card */}
              <div className={`p-6 rounded-lg border-l-4 border-[#0D9488] ${
                theme === 'dark' ? 'bg-gray-700' : t('tools.sourdoughCalculator.bg0d948810', 'bg-[#0D9488]/10')
              }`}>
                <h3 className={`font-semibold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  <Scale className="w-5 h-5 text-[#0D9488]" />
                  Ingredients for {numberOfLoaves} {numberOfLoaves === 1 ? t('tools.sourdoughCalculator.loaf', 'Loaf') : t('tools.sourdoughCalculator.loaves', 'Loaves')} ({numberOfLoaves * parseFloat(targetWeight)}g total)
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className={`text-3xl font-bold text-[#0D9488]`}>
                      {calculateIngredients.flour}g
                    </div>
                    <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('tools.sourdoughCalculator.flour', 'Flour')}
                    </div>
                    <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                      100%
                    </div>
                  </div>
                  <div className="text-center">
                    <div className={`text-3xl font-bold text-blue-500`}>
                      {calculateIngredients.water}g
                    </div>
                    <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('tools.sourdoughCalculator.water', 'Water')}
                    </div>
                    <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                      {hydrationPercent}%
                    </div>
                  </div>
                  <div className="text-center">
                    <div className={`text-3xl font-bold text-orange-500`}>
                      {calculateIngredients.starter}g
                    </div>
                    <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('tools.sourdoughCalculator.starter', 'Starter')}
                    </div>
                    <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                      {starterPercent}%
                    </div>
                  </div>
                  <div className="text-center">
                    <div className={`text-3xl font-bold text-pink-500`}>
                      {calculateIngredients.salt}g
                    </div>
                    <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('tools.sourdoughCalculator.salt2', 'Salt')}
                    </div>
                    <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                      {saltPercent}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Fermentation Times */}
              <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h3 className={`font-semibold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  <Thermometer className="w-5 h-5 text-[#0D9488]" />
                  Fermentation Times (at {Math.round(getFermentationTimes.temperature)}C / {Math.round(getFermentationTimes.temperature * 9/5 + 32)}F)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-600' : 'bg-white'}`}>
                    <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {getFermentationTimes.bulkFermentation} hrs
                    </div>
                    <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('tools.sourdoughCalculator.bulkFermentation', 'Bulk Fermentation')}
                    </div>
                  </div>
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-600' : 'bg-white'}`}>
                    <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {getFermentationTimes.proofing} hrs
                    </div>
                    <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('tools.sourdoughCalculator.finalProof', 'Final Proof')}
                    </div>
                  </div>
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-600' : 'bg-white'}`}>
                    <div className={`text-2xl font-bold text-[#0D9488]`}>
                      ~{Math.round(getFermentationTimes.totalHours)} hrs
                    </div>
                    <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('tools.sourdoughCalculator.totalTime', 'Total Time')}
                    </div>
                  </div>
                </div>
                <p className={`text-xs mt-3 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                  {t('tools.sourdoughCalculator.noteTimesAreEstimatesWatch', 'Note: Times are estimates. Watch for 50-75% rise during bulk, and the dough should pass the poke test before baking.')}
                </p>
              </div>

              {/* Timeline Toggle */}
              <button
                onClick={() => setShowTimeline(!showTimeline)}
                className={`w-full py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                  theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <Clock className="w-5 h-5" />
                {showTimeline ? t('tools.sourdoughCalculator.hide', 'Hide') : t('tools.sourdoughCalculator.show', 'Show')} Baking Timeline
              </button>

              {/* Timeline */}
              {showTimeline && (
                <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Timeline for {bakeStartTime} Bake
                  </h3>
                  <div className="space-y-4">
                    {generateTimeline.map((step, index) => (
                      <div
                        key={index}
                        className={`flex gap-4 p-4 rounded-lg ${
                          theme === 'dark' ? 'bg-gray-600' : 'bg-white'
                        }`}
                      >
                        <div className="flex-shrink-0">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            index === generateTimeline.length - 1
                              ? 'bg-[#0D9488] text-white'
                              : theme === 'dark' ? 'bg-gray-500' : 'bg-gray-200'
                          }`}>
                            <span className={`text-sm font-bold ${
                              index === generateTimeline.length - 1
                                ? 'text-white'
                                : theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                            }`}>
                              {index + 1}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-1">
                            <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {step.step}
                            </span>
                            <span className="text-[#0D9488] font-medium">
                              {step.time}
                            </span>
                          </div>
                          <div className={`text-sm mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            Duration: {step.duration}
                          </div>
                          <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {step.description}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Feeding Schedule Toggle */}
              <button
                onClick={() => setShowFeedingSchedule(!showFeedingSchedule)}
                className={`w-full py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                  theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <Wheat className="w-5 h-5" />
                {showFeedingSchedule ? t('tools.sourdoughCalculator.hide2', 'Hide') : t('tools.sourdoughCalculator.show2', 'Show')} Starter Feeding Schedule
              </button>

              {/* Feeding Schedule */}
              {showFeedingSchedule && (
                <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Starter Feeding Schedule (for {calculateIngredients.starter}g needed)
                  </h3>
                  <div className="space-y-3">
                    {generateFeedingSchedule.map((feed, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-600' : 'bg-white'}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {feed.action}
                          </span>
                          <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {feed.time}
                          </span>
                        </div>
                        <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          Flour: {feed.flour}g | Water: {feed.water}g
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Formula Explanation */}
              <button
                onClick={() => setShowFormula(!showFormula)}
                className={`w-full flex items-center justify-between p-4 rounded-lg ${
                  theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                } transition-colors`}
              >
                <div className="flex items-center gap-2">
                  <Info className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                  <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.sourdoughCalculator.bakerSPercentageFormula', 'Baker\'s Percentage Formula')}
                  </span>
                </div>
                <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                  {showFormula ? '-' : '+'}
                </span>
              </button>

              {showFormula && (
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <div className={`text-sm space-y-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    <p className="font-semibold">{t('tools.sourdoughCalculator.bakerSPercentages', 'Baker\'s Percentages:')}</p>
                    <p>{t('tools.sourdoughCalculator.allIngredientsAreExpressedAs', 'All ingredients are expressed as a percentage of the total flour weight.')}</p>
                    <p className="font-mono mt-2">Flour = 100% (always the baseline)</p>
                    <p className="font-mono">Water = {hydrationPercent}% (hydration)</p>
                    <p className="font-mono">Starter = {starterPercent}% (of flour)</p>
                    <p className="font-mono">Salt = {saltPercent}% (of flour)</p>
                    <div className="border-t border-gray-500 my-3 pt-3">
                      <p className="font-semibold">{t('tools.sourdoughCalculator.calculation', 'Calculation:')}</p>
                      <p className="font-mono text-xs">
                        Total % = 100 + {hydrationPercent} + {starterPercent} + {saltPercent} = {100 + hydrationPercent + parseFloat(starterPercent) + parseFloat(saltPercent)}%
                      </p>
                      <p className="font-mono text-xs">
                        Flour = {numberOfLoaves * parseFloat(targetWeight)}g / {100 + hydrationPercent + parseFloat(starterPercent) + parseFloat(saltPercent)}% * 100 = {calculateIngredients.flour}g
                      </p>
                    </div>
                    <p className="mt-3 text-xs italic">
                      {t('tools.sourdoughCalculator.noteStarterIsTypically100', 'Note: Starter is typically 100% hydration (equal parts flour and water), which contributes to both flour and water totals in the final dough.')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tips Section */}
          <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <h3 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.sourdoughCalculator.sourdoughTips', 'Sourdough Tips')}
            </h3>
            <div className={`space-y-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              <div className="flex gap-2">
                <span className="text-[#0D9488] font-bold">65-68%:</span>
                <span>{t('tools.sourdoughCalculator.greatForBeginnersEasierTo', 'Great for beginners, easier to handle, tighter crumb')}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-[#0D9488] font-bold">70-75%:</span>
                <span>{t('tools.sourdoughCalculator.balancedHydrationGoodOvenSpring', 'Balanced hydration, good oven spring, moderate open crumb')}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-[#0D9488] font-bold">78-85%:</span>
                <span>{t('tools.sourdoughCalculator.advancedLevelVeryOpenCrumb', 'Advanced level, very open crumb, requires strong gluten development')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SourdoughCalculatorTool;
