import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Flame, Droplets, Scale, Thermometer, Clock, Info, Palette, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

type WaxType = 'soy' | 'paraffin' | 'beeswax' | 'coconut' | 'palm' | 'blend';
type ContainerShape = 'cylinder' | 'square' | 'mason' | 'tin';

interface WaxConfig {
  name: string;
  densityFactor: number; // oz per cubic inch
  pourTempF: { min: number; max: number };
  maxFragranceLoad: number; // percentage
  burnRate: number; // hours per oz
  description: string;
}

interface WickSize {
  name: string;
  diameterRange: { min: number; max: number }; // inches
  series: string;
}

interface CandleMakingToolProps {
  uiConfig?: UIConfig;
}

export const CandleMakingTool: React.FC<CandleMakingToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  const [waxType, setWaxType] = useState<WaxType>('soy');
  const [containerShape, setContainerShape] = useState<ContainerShape>('cylinder');
  const [diameter, setDiameter] = useState('3');
  const [height, setHeight] = useState('4');
  const [width, setWidth] = useState('3'); // for square containers
  const [fragranceLoad, setFragranceLoad] = useState('8');
  const [dyeAmount, setDyeAmount] = useState('0.1');
  const [useMetric, setUseMetric] = useState(false);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      let hasChanges = false;

      if (params.waxType && ['soy', 'paraffin', 'beeswax', 'coconut', 'palm', 'blend'].includes(params.waxType)) {
        setWaxType(params.waxType as WaxType);
        hasChanges = true;
      }
      if (params.containerShape && ['cylinder', 'square', 'mason', 'tin'].includes(params.containerShape)) {
        setContainerShape(params.containerShape as ContainerShape);
        hasChanges = true;
      }
      if (params.diameter) {
        setDiameter(String(params.diameter));
        hasChanges = true;
      }
      if (params.height) {
        setHeight(String(params.height));
        hasChanges = true;
      }
      if (params.fragranceLoad) {
        setFragranceLoad(String(params.fragranceLoad));
        hasChanges = true;
      }

      if (hasChanges) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const waxTypes: Record<WaxType, WaxConfig> = {
    soy: {
      name: 'Soy Wax',
      densityFactor: 0.52,
      pourTempF: { min: 120, max: 140 },
      maxFragranceLoad: 10,
      burnRate: 7,
      description: 'Natural, clean-burning, great scent throw',
    },
    paraffin: {
      name: 'Paraffin Wax',
      densityFactor: 0.54,
      pourTempF: { min: 170, max: 180 },
      maxFragranceLoad: 12,
      burnRate: 5,
      description: 'Strong scent throw, vibrant colors',
    },
    beeswax: {
      name: 'Beeswax',
      densityFactor: 0.58,
      pourTempF: { min: 145, max: 160 },
      maxFragranceLoad: 6,
      burnRate: 8,
      description: 'Natural honey scent, air purifying',
    },
    coconut: {
      name: 'Coconut Wax',
      densityFactor: 0.50,
      pourTempF: { min: 100, max: 120 },
      maxFragranceLoad: 10,
      burnRate: 7,
      description: 'Creamy texture, excellent scent throw',
    },
    palm: {
      name: 'Palm Wax',
      densityFactor: 0.53,
      pourTempF: { min: 185, max: 200 },
      maxFragranceLoad: 8,
      burnRate: 6,
      description: 'Crystal patterns, firm texture',
    },
    blend: {
      name: 'Soy-Coconut Blend',
      densityFactor: 0.51,
      pourTempF: { min: 115, max: 135 },
      maxFragranceLoad: 10,
      burnRate: 7,
      description: 'Best of both worlds, smooth finish',
    },
  };

  const wickSizes: WickSize[] = [
    { name: 'Small (CD 4-6)', diameterRange: { min: 0, max: 2 }, series: 'CD' },
    { name: 'Medium (CD 8-10)', diameterRange: { min: 2, max: 3 }, series: 'CD' },
    { name: 'Large (CD 12-14)', diameterRange: { min: 3, max: 4 }, series: 'CD' },
    { name: 'X-Large (CD 16-20)', diameterRange: { min: 4, max: 5 }, series: 'CD' },
    { name: 'ECO 2-4', diameterRange: { min: 0, max: 2 }, series: 'ECO' },
    { name: 'ECO 6-10', diameterRange: { min: 2, max: 3 }, series: 'ECO' },
    { name: 'ECO 12-14', diameterRange: { min: 3, max: 4 }, series: 'ECO' },
  ];

  const config = waxTypes[waxType];

  const calculations = useMemo(() => {
    const d = parseFloat(diameter) || 0;
    const h = parseFloat(height) || 0;
    const w = parseFloat(width) || 0;
    const fragPercent = parseFloat(fragranceLoad) || 0;
    const dyeOz = parseFloat(dyeAmount) || 0;

    // Calculate volume in cubic inches
    let volumeCubicIn = 0;
    let effectiveDiameter = d;

    switch (containerShape) {
      case 'cylinder':
      case 'mason':
      case 'tin':
        volumeCubicIn = Math.PI * Math.pow(d / 2, 2) * h;
        effectiveDiameter = d;
        break;
      case 'square':
        volumeCubicIn = w * w * h;
        effectiveDiameter = w * 0.9; // approximate equivalent diameter
        break;
    }

    // Convert to fluid ounces (1 cubic inch = 0.554 fl oz)
    const volumeFlOz = volumeCubicIn * 0.554;

    // Calculate wax weight in ounces
    const waxWeightOz = volumeCubicIn * config.densityFactor;

    // Calculate fragrance oil needed
    const fragranceOz = (waxWeightOz * fragPercent) / 100;

    // Total weight
    const totalWeightOz = waxWeightOz + fragranceOz + dyeOz;

    // Convert to grams
    const waxWeightGrams = waxWeightOz * 28.35;
    const fragranceGrams = fragranceOz * 28.35;
    const totalWeightGrams = totalWeightOz * 28.35;

    // Calculate burn time
    const burnTimeHours = waxWeightOz * config.burnRate;

    // Recommend wick size based on diameter
    const recommendedWick = wickSizes.find(
      (wick) =>
        effectiveDiameter >= wick.diameterRange.min &&
        effectiveDiameter < wick.diameterRange.max
    );

    // Fragrance warning
    const fragranceWarning = fragPercent > config.maxFragranceLoad;

    return {
      volumeCubicIn: volumeCubicIn.toFixed(2),
      volumeFlOz: volumeFlOz.toFixed(1),
      volumeMl: (volumeFlOz * 29.57).toFixed(0),
      waxWeightOz: waxWeightOz.toFixed(2),
      waxWeightGrams: waxWeightGrams.toFixed(0),
      waxWeightLbs: (waxWeightOz / 16).toFixed(2),
      fragranceOz: fragranceOz.toFixed(2),
      fragranceGrams: fragranceGrams.toFixed(1),
      fragranceMl: (fragranceOz * 29.57).toFixed(1),
      totalWeightOz: totalWeightOz.toFixed(2),
      totalWeightGrams: totalWeightGrams.toFixed(0),
      burnTimeHours: burnTimeHours.toFixed(0),
      recommendedWick: recommendedWick?.name || 'Test multiple sizes',
      fragranceWarning,
      effectiveDiameter: effectiveDiameter.toFixed(1),
    };
  }, [containerShape, diameter, height, width, fragranceLoad, dyeAmount, config, wickSizes]);

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-orange-900/20' : 'bg-gradient-to-r from-white to-orange-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-500/10 rounded-lg"><Flame className="w-5 h-5 text-orange-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.candleMaking.candleMakingCalculator', 'Candle Making Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.candleMaking.calculateWaxFragranceAndWick', 'Calculate wax, fragrance, and wick sizes')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Prefill indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-orange-500/10 rounded-xl border border-orange-500/20">
            <Sparkles className="w-4 h-4 text-orange-500" />
            <span className="text-sm text-orange-500 font-medium">{t('tools.candleMaking.prefilledFromAiResponse', 'Prefilled from AI response')}</span>
          </div>
        )}

        {/* Wax Type Selection */}
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(waxTypes) as WaxType[]).map((w) => (
            <button
              key={w}
              onClick={() => setWaxType(w)}
              className={`py-2 px-3 rounded-lg text-sm ${waxType === w ? 'bg-orange-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
            >
              {waxTypes[w].name}
            </button>
          ))}
        </div>

        {/* Wax Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-orange-900/20 border-orange-800' : 'bg-orange-50 border-orange-200'} border`}>
          <div className="flex items-center justify-between mb-2">
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{config.name}</h4>
            <span className="text-orange-500 font-bold">Max {config.maxFragranceLoad}% fragrance</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              <span className="font-medium">{t('tools.candleMaking.pourTemp', 'Pour Temp:')}</span> {config.pourTempF.min}-{config.pourTempF.max}°F
            </div>
            <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              <span className="font-medium">{t('tools.candleMaking.burnRate', 'Burn Rate:')}</span> ~{config.burnRate} hrs/oz
            </div>
          </div>
          <p className={`mt-2 text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            {config.description}
          </p>
        </div>

        {/* Container Shape */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.candleMaking.containerShape', 'Container Shape')}
          </label>
          <div className="flex gap-2">
            {(['cylinder', 'square', 'mason', 'tin'] as ContainerShape[]).map((shape) => (
              <button
                key={shape}
                onClick={() => setContainerShape(shape)}
                className={`flex-1 py-2 rounded-lg capitalize ${containerShape === shape ? 'bg-orange-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {shape}
              </button>
            ))}
          </div>
        </div>

        {/* Container Dimensions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.candleMaking.containerDimensions', 'Container Dimensions')}
            </label>
            <button
              onClick={() => setUseMetric(!useMetric)}
              className={`text-xs px-2 py-1 rounded ${isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
            >
              {useMetric ? 'cm' : 'inches'}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {containerShape === 'square' ? (
              <div className="space-y-1">
                <label className={`block text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Width ({useMetric ? 'cm' : 'in'})
                </label>
                <input
                  type="number"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  step="0.1"
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
            ) : (
              <div className="space-y-1">
                <label className={`block text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Diameter ({useMetric ? 'cm' : 'in'})
                </label>
                <input
                  type="number"
                  value={diameter}
                  onChange={(e) => setDiameter(e.target.value)}
                  step="0.1"
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
            )}
            <div className="space-y-1">
              <label className={`block text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Height ({useMetric ? 'cm' : 'in'})
              </label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                step="0.1"
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
          </div>
        </div>

        {/* Fragrance Load */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Droplets className="w-4 h-4 inline mr-1" />
              {t('tools.candleMaking.fragranceLoad', 'Fragrance Load (%)')}
            </label>
            <span className={`text-sm ${calculations.fragranceWarning ? 'text-red-500 font-bold' : isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {calculations.fragranceWarning ? 'Exceeds max!' : `Max: ${config.maxFragranceLoad}%`}
            </span>
          </div>
          <div className="flex gap-2">
            {[6, 8, 10, 12].map((percent) => (
              <button
                key={percent}
                onClick={() => setFragranceLoad(percent.toString())}
                className={`flex-1 py-2 rounded-lg ${parseInt(fragranceLoad) === percent ? 'bg-orange-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {percent}%
              </button>
            ))}
          </div>
          <input
            type="number"
            value={fragranceLoad}
            onChange={(e) => setFragranceLoad(e.target.value)}
            step="0.5"
            min="0"
            max="15"
            className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} ${calculations.fragranceWarning ? 'border-red-500' : ''}`}
          />
        </div>

        {/* Dye Amount */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Palette className="w-4 h-4 inline mr-1" />
            {t('tools.candleMaking.dyeAmountOz', 'Dye Amount (oz)')}
          </label>
          <input
            type="number"
            value={dyeAmount}
            onChange={(e) => setDyeAmount(e.target.value)}
            step="0.05"
            min="0"
            className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
          />
          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            {t('tools.candleMaking.typically00502', 'Typically 0.05-0.2 oz per pound of wax')}
          </p>
        </div>

        {/* Results */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Scale className="w-4 h-4 text-orange-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.candleMaking.waxNeeded', 'Wax Needed')}</span>
            </div>
            <div className="text-3xl font-bold text-orange-500">{calculations.waxWeightOz} oz</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {calculations.waxWeightGrams}g | {calculations.waxWeightLbs} lbs
            </div>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Droplets className="w-4 h-4 text-purple-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.candleMaking.fragranceOil', 'Fragrance Oil')}</span>
            </div>
            <div className="text-3xl font-bold text-purple-500">{calculations.fragranceOz} oz</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {calculations.fragranceGrams}g | {calculations.fragranceMl} mL
            </div>
          </div>
        </div>

        {/* Wick Recommendation */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-4 h-4 text-yellow-500" />
            <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.candleMaking.recommendedWick', 'Recommended Wick')}</span>
          </div>
          <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {calculations.recommendedWick}
          </div>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            For {calculations.effectiveDiameter}" diameter container
          </div>
        </div>

        {/* Pour Temperature */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-2 mb-2">
            <Thermometer className="w-4 h-4 text-red-500" />
            <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.candleMaking.pourTemperature', 'Pour Temperature')}</span>
          </div>
          <div className="text-2xl font-bold text-red-500">
            {config.pourTempF.min}°F - {config.pourTempF.max}°F
          </div>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {Math.round((config.pourTempF.min - 32) * 5 / 9)}°C - {Math.round((config.pourTempF.max - 32) * 5 / 9)}°C
          </div>
        </div>

        {/* Burn Time Estimate */}
        <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center justify-center gap-2 mb-1">
            <Clock className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.candleMaking.estimatedBurnTime', 'Estimated Burn Time')}</span>
          </div>
          <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            ~{calculations.burnTimeHours} hours
          </div>
          <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            Based on {config.burnRate} hrs/oz for {config.name}
          </div>
        </div>

        {/* Total Weight */}
        <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-orange-900/20' : 'bg-orange-50'}`}>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.candleMaking.totalCandleWeight', 'Total Candle Weight')}</div>
          <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {calculations.totalWeightOz} oz ({calculations.totalWeightGrams}g)
          </div>
        </div>

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.candleMaking.tips', 'Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>- Always test wicks before making large batches</li>
                <li>- Add fragrance at 180-185°F for best results</li>
                <li>- Cure candles 1-2 weeks for optimal scent throw</li>
                <li>- Keep wax at least 2" from container rim</li>
                <li>- Use a thermometer for consistent results</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandleMakingTool;
