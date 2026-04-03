import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Droplets, Sparkles, Info, Scale, Shirt, AlertTriangle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

type DetergentType = 'liquid' | 'powder' | 'pods';
type LoadSize = 'small' | 'medium' | 'large' | 'xlarge';
type SoilLevel = 'light' | 'normal' | 'heavy' | 'extra-heavy';
type WaterHardness = 'soft' | 'medium' | 'hard' | 'very-hard';

interface DetergentCalculatorToolProps {
  uiConfig?: UIConfig;
}

export const DetergentCalculatorTool: React.FC<DetergentCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [detergentType, setDetergentType] = useState<DetergentType>('liquid');
  const [loadSize, setLoadSize] = useState<LoadSize>('medium');
  const [soilLevel, setSoilLevel] = useState<SoilLevel>('normal');
  const [waterHardness, setWaterHardness] = useState<WaterHardness>('medium');
  const [isHE, setIsHE] = useState(true);
  const [usesColdWater, setUsesColdWater] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;

      if (params.detergentType) {
        setDetergentType(params.detergentType as DetergentType);
        setIsPrefilled(true);
      }
      if (params.loadSize) {
        setLoadSize(params.loadSize as LoadSize);
        setIsPrefilled(true);
      }
      if (params.soilLevel) {
        setSoilLevel(params.soilLevel as SoilLevel);
        setIsPrefilled(true);
      }
      if (params.isHE !== undefined) {
        setIsHE(Boolean(params.isHE));
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const loadSizes = {
    small: { name: 'Small', weight: '3-5 lbs', items: '2-4 items' },
    medium: { name: 'Medium', weight: '6-8 lbs', items: '5-7 items' },
    large: { name: 'Large', weight: '9-12 lbs', items: '8-12 items' },
    xlarge: { name: 'Extra Large', weight: '12+ lbs', items: '12+ items' },
  };

  const soilLevels = {
    light: { name: 'Light', description: 'Worn briefly, minimal stains' },
    normal: { name: 'Normal', description: 'Average daily wear' },
    heavy: { name: 'Heavy', description: 'Visible stains, odors' },
    'extra-heavy': { name: 'Extra Heavy', description: 'Grease, mud, sports gear' },
  };

  const waterHardnessLevels = {
    soft: { name: 'Soft', ppm: '0-60 ppm' },
    medium: { name: 'Medium', ppm: '61-120 ppm' },
    hard: { name: 'Hard', ppm: '121-180 ppm' },
    'very-hard': { name: 'Very Hard', ppm: '180+ ppm' },
  };

  const calculations = useMemo(() => {
    // Base amounts for medium load, normal soil, medium water hardness
    const baseAmounts = {
      liquid: { amount: 2, unit: 'tbsp', ml: 30 },
      powder: { amount: 0.25, unit: 'cup', grams: 45 },
      pods: { amount: 1, unit: 'pod', count: 1 },
    };

    // Multipliers
    const loadMultiplier = {
      small: 0.5,
      medium: 1,
      large: 1.5,
      xlarge: 2,
    }[loadSize];

    const soilMultiplier = {
      light: 0.75,
      normal: 1,
      heavy: 1.25,
      'extra-heavy': 1.5,
    }[soilLevel];

    const hardnessMultiplier = {
      soft: 0.85,
      medium: 1,
      hard: 1.2,
      'very-hard': 1.4,
    }[waterHardness];

    // HE machines use less detergent
    const heMultiplier = isHE ? 0.5 : 1;

    // Cold water needs slightly more detergent for some types
    const coldWaterMultiplier = usesColdWater && detergentType !== 'pods' ? 1.1 : 1;

    const totalMultiplier = loadMultiplier * soilMultiplier * hardnessMultiplier * heMultiplier * coldWaterMultiplier;
    const base = baseAmounts[detergentType];

    let recommendedAmount: number;
    let displayAmount: string;
    let altAmount: string;

    if (detergentType === 'liquid') {
      recommendedAmount = base.amount * totalMultiplier;
      const ml = base.ml * totalMultiplier;
      displayAmount = `${recommendedAmount.toFixed(1)} tablespoons`;
      altAmount = `${ml.toFixed(0)} ml`;
    } else if (detergentType === 'powder') {
      recommendedAmount = base.amount * totalMultiplier;
      const grams = base.grams * totalMultiplier;
      if (recommendedAmount >= 1) {
        displayAmount = `${recommendedAmount.toFixed(2)} cups`;
      } else {
        displayAmount = `${(recommendedAmount * 4).toFixed(1)} tablespoons`;
      }
      altAmount = `${grams.toFixed(0)} grams`;
    } else {
      // Pods - always whole numbers
      recommendedAmount = Math.max(1, Math.round(base.amount * loadMultiplier * (soilLevel === 'extra-heavy' ? 2 : 1)));
      displayAmount = `${recommendedAmount} pod${recommendedAmount > 1 ? 's' : ''}`;
      altAmount = '';
    }

    // Visual representation (filling level)
    const fillLevel = Math.min(100, (totalMultiplier / 2) * 100);

    // Cost estimate (per load)
    const costPerUnit = {
      liquid: 0.15, // per tbsp
      powder: 0.12, // per tbsp equivalent
      pods: 0.25, // per pod
    };

    const costPerLoad = detergentType === 'pods'
      ? recommendedAmount * costPerUnit.pods
      : recommendedAmount * (detergentType === 'liquid' ? costPerUnit.liquid : costPerUnit.powder * 4);

    return {
      amount: recommendedAmount,
      displayAmount,
      altAmount,
      fillLevel,
      costPerLoad,
      tips: generateTips(),
    };

    function generateTips(): string[] {
      const tips: string[] = [];

      if (isHE) {
        tips.push('HE machines need less detergent - using too much can cause residue buildup');
      }

      if (waterHardness === 'hard' || waterHardness === 'very-hard') {
        tips.push('Hard water may require more detergent or a water softener');
      }

      if (usesColdWater) {
        tips.push('Use cold-water formulated detergent for best results');
      }

      if (soilLevel === 'extra-heavy') {
        tips.push('Consider pre-treating heavily stained items');
      }

      if (detergentType === 'pods') {
        tips.push('Always place pods at the bottom of the drum before adding clothes');
      }

      return tips;
    }
  }, [detergentType, loadSize, soilLevel, waterHardness, isHE, usesColdWater]);

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500/10 rounded-lg"><Droplets className="w-5 h-5 text-teal-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.detergentCalculator.detergentCalculator', 'Detergent Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.detergentCalculator.getTheRightAmountFor', 'Get the right amount for your load')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-teal-500/10 rounded-xl border border-teal-500/20">
            <Sparkles className="w-4 h-4 text-teal-500" />
            <span className="text-sm text-teal-500 font-medium">{t('tools.detergentCalculator.valuesLoadedFromAiResponse', 'Values loaded from AI response')}</span>
          </div>
        )}

        {/* Detergent Type */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.detergentCalculator.detergentType', 'Detergent Type')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'liquid', name: 'Liquid', icon: '🧴' },
              { id: 'powder', name: 'Powder', icon: '📦' },
              { id: 'pods', name: 'Pods', icon: '💊' },
            ].map((type) => (
              <button
                key={type.id}
                onClick={() => setDetergentType(type.id as DetergentType)}
                className={`py-3 px-3 rounded-lg text-sm flex flex-col items-center gap-1 ${
                  detergentType === type.id
                    ? 'bg-teal-500 text-white'
                    : isDark
                    ? 'bg-gray-800 text-gray-300'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                <span className="text-xl">{type.icon}</span>
                <span className="font-medium">{type.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Load Size */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Shirt className="w-4 h-4 inline mr-1" />
            {t('tools.detergentCalculator.loadSize', 'Load Size')}
          </label>
          <div className="grid grid-cols-4 gap-2">
            {(Object.keys(loadSizes) as LoadSize[]).map((size) => (
              <button
                key={size}
                onClick={() => setLoadSize(size)}
                className={`py-2 px-2 rounded-lg text-sm text-center ${
                  loadSize === size
                    ? 'bg-teal-500 text-white'
                    : isDark
                    ? 'bg-gray-800 text-gray-300'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {loadSizes[size].name}
              </button>
            ))}
          </div>
          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            {loadSizes[loadSize].weight} | {loadSizes[loadSize].items}
          </p>
        </div>

        {/* Soil Level */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.detergentCalculator.soilLevel', 'Soil Level')}
          </label>
          <div className="grid grid-cols-4 gap-2">
            {(Object.keys(soilLevels) as SoilLevel[]).map((level) => (
              <button
                key={level}
                onClick={() => setSoilLevel(level)}
                className={`py-2 px-2 rounded-lg text-sm text-center ${
                  soilLevel === level
                    ? 'bg-teal-500 text-white'
                    : isDark
                    ? 'bg-gray-800 text-gray-300'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {soilLevels[level].name}
              </button>
            ))}
          </div>
          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            {soilLevels[soilLevel].description}
          </p>
        </div>

        {/* Water Hardness */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Scale className="w-4 h-4 inline mr-1" />
            {t('tools.detergentCalculator.waterHardness', 'Water Hardness')}
          </label>
          <div className="grid grid-cols-4 gap-2">
            {(Object.keys(waterHardnessLevels) as WaterHardness[]).map((level) => (
              <button
                key={level}
                onClick={() => setWaterHardness(level)}
                className={`py-2 px-2 rounded-lg text-sm text-center ${
                  waterHardness === level
                    ? 'bg-teal-500 text-white'
                    : isDark
                    ? 'bg-gray-800 text-gray-300'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {waterHardnessLevels[level].name}
              </button>
            ))}
          </div>
          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            {waterHardnessLevels[waterHardness].ppm}
          </p>
        </div>

        {/* Machine & Water Options */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.detergentCalculator.washerType', 'Washer Type')}
            </label>
            <button
              onClick={() => setIsHE(!isHE)}
              className={`w-full py-2 rounded-lg ${isHE ? 'bg-teal-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
            >
              {isHE ? t('tools.detergentCalculator.heHighEfficiency', 'HE (High Efficiency)') : t('tools.detergentCalculator.standard', 'Standard')}
            </button>
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.detergentCalculator.waterTemperature', 'Water Temperature')}
            </label>
            <button
              onClick={() => setUsesColdWater(!usesColdWater)}
              className={`w-full py-2 rounded-lg ${usesColdWater ? 'bg-teal-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
            >
              {usesColdWater ? t('tools.detergentCalculator.coldWater', 'Cold Water') : t('tools.detergentCalculator.warmHotWater', 'Warm/Hot Water')}
            </button>
          </div>
        </div>

        {/* Result */}
        <div className={`p-6 rounded-xl text-center ${isDark ? 'bg-teal-900/20 border-teal-800' : 'bg-teal-50 border-teal-200'} border`}>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.detergentCalculator.recommendedAmount', 'Recommended Amount')}</div>
          <div className="text-4xl font-bold text-teal-500 my-2">
            {calculations.displayAmount}
          </div>
          {calculations.altAmount && (
            <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
              ({calculations.altAmount})
            </div>
          )}
        </div>

        {/* Visual Representation */}
        {detergentType !== 'pods' && (
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <h4 className={`font-medium mb-3 text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.detergentCalculator.measuringCupFillLevel', 'Measuring Cup Fill Level')}
            </h4>
            <div className="flex justify-center">
              <div className={`w-24 h-32 rounded-b-xl border-2 ${isDark ? 'border-gray-600' : 'border-gray-300'} relative overflow-hidden`}>
                <div
                  className="absolute bottom-0 left-0 right-0 bg-teal-500/50 transition-all duration-300"
                  style={{ height: `${calculations.fillLevel}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {Math.round(calculations.fillLevel)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cost Estimate */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.detergentCalculator.estCostLoad', 'Est. Cost/Load')}</div>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              ${calculations.costPerLoad.toFixed(2)}
            </div>
          </div>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.detergentCalculator.estCostYear', 'Est. Cost/Year')}</div>
            <div className="text-2xl font-bold text-teal-500">
              ${(calculations.costPerLoad * 4 * 52).toFixed(0)}
            </div>
            <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {t('tools.detergentCalculator.4LoadsWeek', '(4 loads/week)')}
            </div>
          </div>
        </div>

        {/* Dynamic Tips */}
        {calculations.tips.length > 0 && (
          <div className={`p-4 rounded-lg ${isDark ? 'bg-yellow-900/20 border-yellow-800' : 'bg-yellow-50 border-yellow-200'} border`}>
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 mt-0.5 text-yellow-500" />
              <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <strong>{t('tools.detergentCalculator.tipsForYourSettings', 'Tips for Your Settings:')}</strong>
                <ul className="mt-1 space-y-1">
                  {calculations.tips.map((tip, index) => (
                    <li key={index}>- {tip}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* General Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.detergentCalculator.generalGuidelines', 'General Guidelines:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>- More detergent is not always better - it can leave residue</li>
                <li>- Always follow your detergent brand's instructions</li>
                <li>- Add detergent before clothes for best distribution</li>
                <li>- Store detergent in a cool, dry place</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetergentCalculatorTool;
