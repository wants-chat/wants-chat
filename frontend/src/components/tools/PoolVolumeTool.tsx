import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Droplets, Calculator, Ruler, Info, Clock, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useConfirmDialog } from '../ui/ConfirmDialog';

interface PoolVolumeToolProps {
  uiConfig?: UIConfig;
}

type PoolShape = 'rectangular' | 'oval' | 'kidney' | 'irregular';
type UnitSystem = 'imperial' | 'metric';

interface PoolDimensions {
  length: string;
  width: string;
  shallowDepth: string;
  deepDepth: string;
}

interface PoolPreset {
  name: string;
  shape: PoolShape;
  length: number;
  width: number;
  shallowDepth: number;
  deepDepth: number;
}

interface PoolResult {
  volumeGallons: number;
  volumeLiters: number;
  fillTimeHours: number;
  fillTimeDays: number;
  estimatedCost: number;
  chlorineOunces: number;
  phAdjusterPounds: number;
  algaecideOunces: number;
  evaporationGallonsPerWeek: number;
  evaporationLitersPerWeek: number;
}

const POOL_PRESETS: PoolPreset[] = [
  { name: 'Small Rectangular', shape: 'rectangular', length: 20, width: 10, shallowDepth: 3, deepDepth: 5 },
  { name: 'Medium Rectangular', shape: 'rectangular', length: 30, width: 15, shallowDepth: 3, deepDepth: 6 },
  { name: 'Large Rectangular', shape: 'rectangular', length: 40, width: 20, shallowDepth: 3.5, deepDepth: 8 },
  { name: 'Olympic Size', shape: 'rectangular', length: 164, width: 82, shallowDepth: 6.5, deepDepth: 6.5 },
  { name: 'Small Oval', shape: 'oval', length: 18, width: 12, shallowDepth: 3, deepDepth: 5 },
  { name: 'Medium Oval', shape: 'oval', length: 24, width: 16, shallowDepth: 3.5, deepDepth: 6 },
  { name: 'Kidney Shape', shape: 'kidney', length: 28, width: 14, shallowDepth: 3, deepDepth: 8 },
];

const SHAPE_MULTIPLIERS: Record<PoolShape, number> = {
  rectangular: 1.0,
  oval: 0.785, // pi/4 approximation
  kidney: 0.75,
  irregular: 0.7,
};

export const PoolVolumeTool: React.FC<PoolVolumeToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('imperial');
  const [poolShape, setPoolShape] = useState<PoolShape>('rectangular');
  const [dimensions, setDimensions] = useState<PoolDimensions>({
    length: '',
    width: '',
    shallowDepth: '',
    deepDepth: '',
  });
  const [waterPressureGPM, setWaterPressureGPM] = useState('10');
  const [waterCostPerGallon, setWaterCostPerGallon] = useState('0.004');
  const [result, setResult] = useState<PoolResult | null>(null);
  const [showMaintenanceSchedule, setShowMaintenanceSchedule] = useState(false);
  const [showChemicalInfo, setShowChemicalInfo] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Handle prefill from conversation
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.numbers && params.numbers.length >= 3) {
        setDimensions({
          length: params.numbers[0].toString(),
          width: params.numbers[1].toString(),
          shallowDepth: params.numbers[2].toString(),
          deepDepth: params.numbers[3]?.toString() || params.numbers[2].toString(),
        });
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const calculateVolume = () => {
    let length = parseFloat(dimensions.length);
    let width = parseFloat(dimensions.width);
    let shallowDepth = parseFloat(dimensions.shallowDepth);
    let deepDepth = parseFloat(dimensions.deepDepth);
    const gpm = parseFloat(waterPressureGPM);
    const costPerGallon = parseFloat(waterCostPerGallon);

    if (isNaN(length) || isNaN(width) || isNaN(shallowDepth) || isNaN(deepDepth)) {
      setValidationMessage('Please enter valid dimensions');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    if (length <= 0 || width <= 0 || shallowDepth <= 0 || deepDepth <= 0) {
      setValidationMessage('All dimensions must be greater than 0');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    // Convert metric to imperial for calculations if needed
    if (unitSystem === 'metric') {
      // Convert meters to feet
      length = length * 3.28084;
      width = width * 3.28084;
      shallowDepth = shallowDepth * 3.28084;
      deepDepth = deepDepth * 3.28084;
    }

    // Calculate average depth
    const averageDepth = (shallowDepth + deepDepth) / 2;

    // Calculate base volume in cubic feet
    const baseCubicFeet = length * width * averageDepth;

    // Apply shape multiplier
    const shapeMultiplier = SHAPE_MULTIPLIERS[poolShape];
    const adjustedCubicFeet = baseCubicFeet * shapeMultiplier;

    // Convert to gallons (1 cubic foot = 7.48052 gallons)
    const volumeGallons = adjustedCubicFeet * 7.48052;

    // Convert to liters (1 gallon = 3.78541 liters)
    const volumeLiters = volumeGallons * 3.78541;

    // Calculate fill time
    const fillTimeMinutes = volumeGallons / gpm;
    const fillTimeHours = fillTimeMinutes / 60;
    const fillTimeDays = fillTimeHours / 24;

    // Estimate cost
    const estimatedCost = volumeGallons * costPerGallon;

    // Chemical dosing calculations (per 10,000 gallons)
    const dosageMultiplier = volumeGallons / 10000;

    // Chlorine: approximately 1-3 oz per 10,000 gallons for maintenance
    const chlorineOunces = 2 * dosageMultiplier;

    // pH adjuster: approximately 1.5 lbs per 10,000 gallons to raise pH by 0.1
    const phAdjusterPounds = 1.5 * dosageMultiplier;

    // Algaecide: approximately 4 oz per 10,000 gallons weekly
    const algaecideOunces = 4 * dosageMultiplier;

    // Evaporation estimate: approximately 1/4 inch per day in warm weather
    // Surface area in sq ft * 0.0208 (1/4 inch in feet) * 7.48 = gallons per day
    const surfaceArea = length * width * shapeMultiplier;
    const evaporationGallonsPerDay = surfaceArea * 0.0208 * 7.48052;
    const evaporationGallonsPerWeek = evaporationGallonsPerDay * 7;
    const evaporationLitersPerWeek = evaporationGallonsPerWeek * 3.78541;

    setResult({
      volumeGallons: parseFloat(volumeGallons.toFixed(0)),
      volumeLiters: parseFloat(volumeLiters.toFixed(0)),
      fillTimeHours: parseFloat(fillTimeHours.toFixed(1)),
      fillTimeDays: parseFloat(fillTimeDays.toFixed(2)),
      estimatedCost: parseFloat(estimatedCost.toFixed(2)),
      chlorineOunces: parseFloat(chlorineOunces.toFixed(1)),
      phAdjusterPounds: parseFloat(phAdjusterPounds.toFixed(2)),
      algaecideOunces: parseFloat(algaecideOunces.toFixed(1)),
      evaporationGallonsPerWeek: parseFloat(evaporationGallonsPerWeek.toFixed(0)),
      evaporationLitersPerWeek: parseFloat(evaporationLitersPerWeek.toFixed(0)),
    });
  };

  const applyPreset = (preset: PoolPreset) => {
    setPoolShape(preset.shape);
    if (unitSystem === 'metric') {
      // Convert feet to meters
      setDimensions({
        length: (preset.length / 3.28084).toFixed(2),
        width: (preset.width / 3.28084).toFixed(2),
        shallowDepth: (preset.shallowDepth / 3.28084).toFixed(2),
        deepDepth: (preset.deepDepth / 3.28084).toFixed(2),
      });
    } else {
      setDimensions({
        length: preset.length.toString(),
        width: preset.width.toString(),
        shallowDepth: preset.shallowDepth.toString(),
        deepDepth: preset.deepDepth.toString(),
      });
    }
  };

  const reset = () => {
    setDimensions({
      length: '',
      width: '',
      shallowDepth: '',
      deepDepth: '',
    });
    setPoolShape('rectangular');
    setWaterPressureGPM('10');
    setWaterCostPerGallon('0.004');
    setResult(null);
    setShowMaintenanceSchedule(false);
    setShowChemicalInfo(false);
  };

  const updateDimension = (field: keyof PoolDimensions, value: string) => {
    setDimensions(prev => ({ ...prev, [field]: value }));
  };

  const lengthUnit = unitSystem === 'metric' ? 'm' : 'ft';
  const depthUnit = unitSystem === 'metric' ? 'm' : 'ft';

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-4xl mx-auto">
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-[#0D9488] rounded-lg">
              <Waves className="w-6 h-6 text-white" />
            </div>
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.poolVolume.poolVolumeCalculator', 'Pool Volume Calculator')}
            </h1>
          </div>

          {/* Prefill Indicator */}
          {isPrefilled && (
            <div className="flex items-center gap-2 px-4 py-2 mb-6 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
              <Sparkles className="w-4 h-4 text-[#0D9488]" />
              <span className="text-sm text-[#0D9488] font-medium">{t('tools.poolVolume.dimensionsLoadedFromYourConversation', 'Dimensions loaded from your conversation')}</span>
            </div>
          )}

          {/* Unit System Toggle */}
          <div className="mb-6">
            <div className="flex gap-2">
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
                {t('tools.poolVolume.imperialFtGal', 'Imperial (ft, gal)')}
              </button>
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
                {t('tools.poolVolume.metricML', 'Metric (m, L)')}
              </button>
            </div>
          </div>

          {/* Pool Shape Selection */}
          <div className="mb-6">
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.poolVolume.poolShape', 'Pool Shape')}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['rectangular', 'oval', 'kidney', 'irregular'] as PoolShape[]).map((shape) => (
                <button
                  key={shape}
                  onClick={() => setPoolShape(shape)}
                  className={`py-2 px-4 rounded-lg font-medium capitalize transition-colors ${
                    poolShape === shape
                      ? 'bg-[#0D9488] text-white'
                      : theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {shape}
                </button>
              ))}
            </div>
          </div>

          {/* Common Pool Presets */}
          <div className="mb-6">
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.poolVolume.commonPoolSizes', 'Common Pool Sizes')}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {POOL_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => applyPreset(preset)}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Dimension Inputs */}
          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Length ({lengthUnit})
                </label>
                <input
                  type="number"
                  value={dimensions.length}
                  onChange={(e) => updateDimension('length', e.target.value)}
                  placeholder={`Enter length in ${lengthUnit}`}
                  step="0.1"
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
                  Width ({lengthUnit})
                </label>
                <input
                  type="number"
                  value={dimensions.width}
                  onChange={(e) => updateDimension('width', e.target.value)}
                  placeholder={`Enter width in ${lengthUnit}`}
                  step="0.1"
                  min="0"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Shallow End Depth ({depthUnit})
                </label>
                <input
                  type="number"
                  value={dimensions.shallowDepth}
                  onChange={(e) => updateDimension('shallowDepth', e.target.value)}
                  placeholder={t('tools.poolVolume.shallowDepth', 'Shallow depth')}
                  step="0.1"
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
                  Deep End Depth ({depthUnit})
                </label>
                <input
                  type="number"
                  value={dimensions.deepDepth}
                  onChange={(e) => updateDimension('deepDepth', e.target.value)}
                  placeholder={t('tools.poolVolume.deepDepth', 'Deep depth')}
                  step="0.1"
                  min="0"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
            </div>

            {/* Optional Parameters */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.poolVolume.waterFlowRateGpm', 'Water Flow Rate (GPM)')}
                </label>
                <input
                  type="number"
                  value={waterPressureGPM}
                  onChange={(e) => setWaterPressureGPM(e.target.value)}
                  placeholder={t('tools.poolVolume.gallonsPerMinute', 'Gallons per minute')}
                  step="1"
                  min="1"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.poolVolume.waterCostGallon', 'Water Cost ($/gallon)')}
                </label>
                <input
                  type="number"
                  value={waterCostPerGallon}
                  onChange={(e) => setWaterCostPerGallon(e.target.value)}
                  placeholder={t('tools.poolVolume.costPerGallon', 'Cost per gallon')}
                  step="0.001"
                  min="0"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={calculateVolume}
              className="flex-1 bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Calculator className="w-5 h-5" />
              {t('tools.poolVolume.calculate', 'Calculate')}
            </button>
            <button
              onClick={reset}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {t('tools.poolVolume.reset', 'Reset')}
            </button>
          </div>

          {/* Results */}
          {result && (
            <div className="space-y-4">
              {/* Volume Display */}
              <div className={`p-6 rounded-lg border-l-4 border-[#0D9488] ${
                theme === 'dark' ? 'bg-gray-700' : t('tools.poolVolume.bg0d948810', 'bg-[#0D9488]/10')
              }`}>
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className={`text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('tools.poolVolume.volumeGallons', 'Volume (Gallons)')}
                    </div>
                    <div className="text-4xl font-bold text-[#0D9488]">
                      {result.volumeGallons.toLocaleString()}
                    </div>
                    <div className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('tools.poolVolume.usGallons', 'US Gallons')}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className={`text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('tools.poolVolume.volumeLiters', 'Volume (Liters)')}
                    </div>
                    <div className="text-4xl font-bold text-blue-500">
                      {result.volumeLiters.toLocaleString()}
                    </div>
                    <div className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('tools.poolVolume.liters', 'Liters')}
                    </div>
                  </div>
                </div>
              </div>

              {/* Fill Time & Cost */}
              <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h3 className={`font-semibold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  <Clock className="w-5 h-5 text-[#0D9488]" />
                  {t('tools.poolVolume.fillTimeCostEstimates', 'Fill Time & Cost Estimates')}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="text-center p-3 rounded-lg bg-opacity-50" style={{ backgroundColor: theme === 'dark' ? '#374151' : '#e5e7eb' }}>
                    <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.poolVolume.fillTime', 'Fill Time')}</div>
                    <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {result.fillTimeHours < 24
                        ? `${result.fillTimeHours} hrs`
                        : `${result.fillTimeDays} days`
                      }
                    </div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-opacity-50" style={{ backgroundColor: theme === 'dark' ? '#374151' : '#e5e7eb' }}>
                    <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.poolVolume.estimatedCost', 'Estimated Cost')}</div>
                    <div className="text-2xl font-bold text-green-500">
                      ${result.estimatedCost.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-opacity-50" style={{ backgroundColor: theme === 'dark' ? '#374151' : '#e5e7eb' }}>
                    <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.poolVolume.weeklyEvaporation', 'Weekly Evaporation')}</div>
                    <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {result.evaporationGallonsPerWeek} gal
                    </div>
                  </div>
                </div>
              </div>

              {/* Chemical Dosing */}
              <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h3 className={`font-semibold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  <Droplets className="w-5 h-5 text-blue-500" />
                  {t('tools.poolVolume.recommendedChemicalAmounts', 'Recommended Chemical Amounts')}
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 rounded-lg" style={{ backgroundColor: theme === 'dark' ? '#374151' : '#dbeafe' }}>
                    <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.poolVolume.chlorine', 'Chlorine')}</div>
                    <div className="text-xl font-bold text-blue-600">
                      {result.chlorineOunces} oz
                    </div>
                    <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>{t('tools.poolVolume.dailyMaintenance', 'Daily maintenance')}</div>
                  </div>
                  <div className="text-center p-3 rounded-lg" style={{ backgroundColor: theme === 'dark' ? '#374151' : '#fef3c7' }}>
                    <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.poolVolume.phAdjuster', 'pH Adjuster')}</div>
                    <div className="text-xl font-bold text-yellow-600">
                      {result.phAdjusterPounds} lbs
                    </div>
                    <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>{t('tools.poolVolume.per01PhChange', 'Per 0.1 pH change')}</div>
                  </div>
                  <div className="text-center p-3 rounded-lg" style={{ backgroundColor: theme === 'dark' ? '#374151' : '#d1fae5' }}>
                    <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.poolVolume.algaecide', 'Algaecide')}</div>
                    <div className="text-xl font-bold text-green-600">
                      {result.algaecideOunces} oz
                    </div>
                    <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>{t('tools.poolVolume.weeklyTreatment', 'Weekly treatment')}</div>
                  </div>
                </div>
              </div>

              {/* Evaporation Details */}
              <div className={`p-6 rounded-lg border-l-4 border-orange-500 ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-orange-50'
              }`}>
                <h3 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.poolVolume.waterEvaporationEstimate', 'Water Evaporation Estimate')}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{t('tools.poolVolume.weeklyLoss', 'Weekly Loss:')}</span>
                    <span className={`ml-2 font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {result.evaporationGallonsPerWeek.toLocaleString()} gallons ({result.evaporationLitersPerWeek.toLocaleString()} L)
                    </span>
                  </div>
                  <div>
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{t('tools.poolVolume.monthlyLoss', 'Monthly Loss:')}</span>
                    <span className={`ml-2 font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {(result.evaporationGallonsPerWeek * 4).toLocaleString()} gallons
                    </span>
                  </div>
                </div>
                <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.poolVolume.basedOnAverageWarmWeather', 'Based on average warm weather conditions. Actual evaporation may vary with temperature, humidity, and wind.')}
                </p>
              </div>

              {/* Maintenance Schedule Toggle */}
              <button
                onClick={() => setShowMaintenanceSchedule(!showMaintenanceSchedule)}
                className={`w-full flex items-center justify-between p-4 rounded-lg ${
                  theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                } transition-colors`}
              >
                <div className="flex items-center gap-2">
                  <Calendar className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                  <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.poolVolume.maintenanceScheduleSuggestions', 'Maintenance Schedule Suggestions')}
                  </span>
                </div>
                <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                  {showMaintenanceSchedule ? '-' : '+'}
                </span>
              </button>

              {showMaintenanceSchedule && (
                <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <div className="space-y-4">
                    <div>
                      <h4 className={`font-semibold text-green-500 mb-2`}>{t('tools.poolVolume.daily', 'Daily')}</h4>
                      <ul className={`list-disc list-inside text-sm space-y-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        <li>{t('tools.poolVolume.checkAndEmptySkimmerBaskets', 'Check and empty skimmer baskets')}</li>
                        <li>{t('tools.poolVolume.runPumpFor812', 'Run pump for 8-12 hours')}</li>
                        <li>{t('tools.poolVolume.checkWaterLevelAndTop', 'Check water level and top off if needed')}</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className={`font-semibold text-blue-500 mb-2`}>{t('tools.poolVolume.weekly', 'Weekly')}</h4>
                      <ul className={`list-disc list-inside text-sm space-y-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        <li>{t('tools.poolVolume.testWaterChemistryPhChlorine', 'Test water chemistry (pH, chlorine, alkalinity)')}</li>
                        <li>Add chlorine as needed ({result.chlorineOunces} oz recommended)</li>
                        <li>{t('tools.poolVolume.brushWallsAndFloor', 'Brush walls and floor')}</li>
                        <li>{t('tools.poolVolume.vacuumPool', 'Vacuum pool')}</li>
                        <li>Add algaecide ({result.algaecideOunces} oz)</li>
                        <li>{t('tools.poolVolume.cleanPumpStrainerBasket', 'Clean pump strainer basket')}</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className={`font-semibold text-yellow-500 mb-2`}>{t('tools.poolVolume.monthly', 'Monthly')}</h4>
                      <ul className={`list-disc list-inside text-sm space-y-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        <li>{t('tools.poolVolume.testCalciumHardnessAndCyanuric', 'Test calcium hardness and cyanuric acid')}</li>
                        <li>{t('tools.poolVolume.checkFilterPressureAndClean', 'Check filter pressure and clean if needed')}</li>
                        <li>{t('tools.poolVolume.inspectEquipmentForWear', 'Inspect equipment for wear')}</li>
                        <li>{t('tools.poolVolume.cleanTileLine', 'Clean tile line')}</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className={`font-semibold text-purple-500 mb-2`}>{t('tools.poolVolume.seasonally', 'Seasonally')}</h4>
                      <ul className={`list-disc list-inside text-sm space-y-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        <li>{t('tools.poolVolume.deepCleanFilter', 'Deep clean filter')}</li>
                        <li>{t('tools.poolVolume.inspectAndLubricateORings', 'Inspect and lubricate o-rings')}</li>
                        <li>{t('tools.poolVolume.checkForLeaksInPlumbing', 'Check for leaks in plumbing')}</li>
                        <li>{t('tools.poolVolume.serviceHeaterIfApplicable', 'Service heater (if applicable)')}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Chemical Info Toggle */}
              <button
                onClick={() => setShowChemicalInfo(!showChemicalInfo)}
                className={`w-full flex items-center justify-between p-4 rounded-lg ${
                  theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                } transition-colors`}
              >
                <div className="flex items-center gap-2">
                  <Info className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                  <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.poolVolume.chemicalGuidelines', 'Chemical Guidelines')}
                  </span>
                </div>
                <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                  {showChemicalInfo ? '-' : '+'}
                </span>
              </button>

              {showChemicalInfo && (
                <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{t('tools.poolVolume.phLevel', 'pH Level')}</span>
                      <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>7.2 - 7.6</span>
                    </div>
                    <div className={`border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`} />
                    <div className="flex justify-between items-center">
                      <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{t('tools.poolVolume.freeChlorine', 'Free Chlorine')}</span>
                      <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>1 - 3 ppm</span>
                    </div>
                    <div className={`border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`} />
                    <div className="flex justify-between items-center">
                      <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{t('tools.poolVolume.totalAlkalinity', 'Total Alkalinity')}</span>
                      <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>80 - 120 ppm</span>
                    </div>
                    <div className={`border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`} />
                    <div className="flex justify-between items-center">
                      <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{t('tools.poolVolume.calciumHardness', 'Calcium Hardness')}</span>
                      <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>200 - 400 ppm</span>
                    </div>
                    <div className={`border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`} />
                    <div className="flex justify-between items-center">
                      <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{t('tools.poolVolume.cyanuricAcidStabilizer', 'Cyanuric Acid (Stabilizer)')}</span>
                      <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>30 - 50 ppm</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Info Section */}
          <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <h3 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.poolVolume.aboutPoolVolumeCalculation', 'About Pool Volume Calculation')}
            </h3>
            <div className={`space-y-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              <p>
                <strong>{t('tools.poolVolume.rectangular', 'Rectangular:')}</strong> Length x Width x Average Depth x 7.48 = Gallons
              </p>
              <p>
                <strong>{t('tools.poolVolume.oval', 'Oval:')}</strong> Length x Width x Average Depth x 5.9 = Gallons
              </p>
              <p>
                <strong>{t('tools.poolVolume.kidneyIrregular', 'Kidney/Irregular:')}</strong> Uses adjusted multiplier based on shape complexity
              </p>
              <p className="text-xs mt-2 italic">
                {t('tools.poolVolume.noteChemicalRecommendationsAreEstimates', 'Note: Chemical recommendations are estimates. Always test your water and follow product instructions.')}
              </p>
            </div>
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
};

export default PoolVolumeTool;
