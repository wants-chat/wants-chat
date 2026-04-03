import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Beef, Thermometer, Clock, Timer, Info } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

type SteakCut = 'ribeye' | 'filet' | 'sirloin' | 'nystrip';
type Doneness = 'rare' | 'mediumRare' | 'medium' | 'mediumWell' | 'wellDone';

interface CutConfig {
  name: string;
  description: string;
  fatContent: string;
  cookingTip: string;
}

interface DonenessConfig {
  name: string;
  tempF: { min: number; max: number };
  tempC: { min: number; max: number };
  color: string;
  colorName: string;
  description: string;
}

interface SteakDonenessToolProps {
  uiConfig?: UIConfig;
}

export const SteakDonenessTool: React.FC<SteakDonenessToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [cut, setCut] = useState<SteakCut>('ribeye');
  const [doneness, setDoneness] = useState<Doneness>('mediumRare');
  const [thickness, setThickness] = useState('1');
  const [unit, setUnit] = useState<'inches' | 'cm'>('inches');
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.prefillData && !isPrefilled) {
      const data = uiConfig.prefillData;
      if (data.cut) setCut(data.cut as SteakCut);
      if (data.doneness) setDoneness(data.doneness as Doneness);
      if (data.thickness) setThickness(String(data.thickness));
      if (data.unit) setUnit(data.unit as 'inches' | 'cm');
      setIsPrefilled(true);
    }
  }, [uiConfig, isPrefilled]);

  const cuts: Record<SteakCut, CutConfig> = {
    ribeye: {
      name: 'Ribeye',
      description: 'Rich marbling, intense beefy flavor',
      fatContent: 'High',
      cookingTip: 'Let the fat render slowly for best flavor',
    },
    filet: {
      name: 'Filet Mignon',
      description: 'Tender, lean, buttery texture',
      fatContent: 'Low',
      cookingTip: 'Wrap with bacon or baste with butter for moisture',
    },
    sirloin: {
      name: 'Sirloin',
      description: 'Lean, robust flavor, firm texture',
      fatContent: 'Medium',
      cookingTip: 'Don\'t overcook - best at medium or below',
    },
    nystrip: {
      name: 'NY Strip',
      description: 'Bold flavor, good marbling, firm bite',
      fatContent: 'Medium-High',
      cookingTip: 'Leave fat cap on while cooking for flavor',
    },
  };

  const donenessLevels: Record<Doneness, DonenessConfig> = {
    rare: {
      name: 'Rare',
      tempF: { min: 120, max: 125 },
      tempC: { min: 49, max: 52 },
      color: 'bg-gradient-to-r from-red-700 via-red-600 to-red-500',
      colorName: 'Bright red center',
      description: 'Cool red center, very soft texture',
    },
    mediumRare: {
      name: 'Medium Rare',
      tempF: { min: 130, max: 135 },
      tempC: { min: 54, max: 57 },
      color: 'bg-gradient-to-r from-red-600 via-red-400 to-pink-400',
      colorName: 'Warm red center',
      description: 'Warm red center, soft with some resistance',
    },
    medium: {
      name: 'Medium',
      tempF: { min: 140, max: 145 },
      tempC: { min: 60, max: 63 },
      color: 'bg-gradient-to-r from-pink-500 via-pink-400 to-pink-300',
      colorName: 'Pink throughout',
      description: 'Warm pink center, firmer texture',
    },
    mediumWell: {
      name: 'Medium Well',
      tempF: { min: 150, max: 155 },
      tempC: { min: 66, max: 68 },
      color: 'bg-gradient-to-r from-pink-300 via-pink-200 to-gray-300',
      colorName: 'Slight pink center',
      description: 'Slightly pink center, firm texture',
    },
    wellDone: {
      name: 'Well Done',
      tempF: { min: 160, max: 165 },
      tempC: { min: 71, max: 74 },
      color: 'bg-gradient-to-r from-gray-400 via-gray-500 to-gray-600',
      colorName: 'No pink',
      description: 'Brown throughout, very firm',
    },
  };

  const cutConfig = cuts[cut];
  const donenessConfig = donenessLevels[doneness];

  const calculations = useMemo(() => {
    const thicknessValue = parseFloat(thickness) || 1;
    const thicknessInches = unit === 'cm' ? thicknessValue / 2.54 : thicknessValue;

    // Base cooking times per side (in minutes) for a 1-inch steak at high heat
    const baseTimes: Record<Doneness, number> = {
      rare: 2,
      mediumRare: 3,
      medium: 4,
      mediumWell: 5,
      wellDone: 6,
    };

    // Adjust for thickness (roughly 1.5x time per additional 0.5 inch)
    const thicknessMultiplier = 1 + (thicknessInches - 1) * 1.5;
    const baseTime = baseTimes[doneness];
    const cookTimePerSide = Math.round(baseTime * thicknessMultiplier * 10) / 10;

    // Cut adjustments (filet cooks slightly faster, ribeye slightly slower due to fat)
    const cutMultiplier: Record<SteakCut, number> = {
      ribeye: 1.1,
      filet: 0.9,
      sirloin: 1.0,
      nystrip: 1.0,
    };

    const adjustedCookTime = Math.round(cookTimePerSide * cutMultiplier[cut] * 10) / 10;

    // Rest time is typically 5-10 minutes, or half the cooking time for thicker cuts
    const totalCookTime = adjustedCookTime * 2;
    const restTime = Math.max(5, Math.round(totalCookTime * 0.5));

    // Remove from heat temperature (5-10 degrees below target)
    const carryoverDegrees = thicknessInches >= 1.5 ? 10 : 5;
    const pullTempF = donenessConfig.tempF.min - carryoverDegrees;
    const pullTempC = donenessConfig.tempC.min - Math.round(carryoverDegrees / 1.8);

    return {
      cookTimePerSide: adjustedCookTime,
      totalCookTime: adjustedCookTime * 2,
      restTime,
      pullTempF,
      pullTempC,
      thicknessInches: thicknessInches.toFixed(2),
    };
  }, [thickness, unit, doneness, cut, donenessConfig]);

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-red-900/20' : 'bg-gradient-to-r from-white to-red-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-500/10 rounded-lg"><Beef className="w-5 h-5 text-red-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.steakDoneness.steakDonenessCalculator', 'Steak Doneness Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.steakDoneness.perfectSteakEveryTime', 'Perfect steak every time')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Steak Cut Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.steakDoneness.selectCut', 'Select Cut')}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(cuts) as SteakCut[]).map((c) => (
              <button
                key={c}
                onClick={() => setCut(c)}
                className={`py-2 px-3 rounded-lg text-sm ${cut === c ? 'bg-red-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {cuts[c].name}
              </button>
            ))}
          </div>
        </div>

        {/* Cut Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'} border`}>
          <div className="flex items-center justify-between mb-2">
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{cutConfig.name}</h4>
            <span className="text-red-500 font-semibold text-sm">Fat: {cutConfig.fatContent}</span>
          </div>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {cutConfig.description}
          </p>
          <p className={`mt-2 text-sm italic ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            {cutConfig.cookingTip}
          </p>
        </div>

        {/* Thickness Input */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.steakDoneness.steakThickness', 'Steak Thickness')}
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              step="0.25"
              min="0.5"
              max="3"
              value={thickness}
              onChange={(e) => setThickness(e.target.value)}
              className={`flex-1 px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
            <button
              onClick={() => setUnit('inches')}
              className={`px-4 py-2 rounded-lg ${unit === 'inches' ? 'bg-red-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
            >
              in
            </button>
            <button
              onClick={() => setUnit('cm')}
              className={`px-4 py-2 rounded-lg ${unit === 'cm' ? 'bg-red-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
            >
              cm
            </button>
          </div>
          <div className="flex gap-2 mt-2">
            {[0.5, 0.75, 1, 1.25, 1.5, 2].map((t) => (
              <button
                key={t}
                onClick={() => {
                  setThickness(t.toString());
                  setUnit('inches');
                }}
                className={`flex-1 py-1 text-xs rounded-lg ${parseFloat(thickness) === t && unit === 'inches' ? 'bg-red-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {t}"
              </button>
            ))}
          </div>
        </div>

        {/* Doneness Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.steakDoneness.targetDoneness', 'Target Doneness')}
          </label>
          <div className="space-y-2">
            {(Object.keys(donenessLevels) as Doneness[]).map((d) => {
              const level = donenessLevels[d];
              return (
                <button
                  key={d}
                  onClick={() => setDoneness(d)}
                  className={`w-full p-3 rounded-lg flex items-center gap-3 ${doneness === d
                    ? 'ring-2 ring-red-500 ring-offset-2 ' + (isDark ? 'ring-offset-gray-900' : 'ring-offset-white')
                    : ''
                  } ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}
                >
                  <div className={`w-12 h-8 rounded ${level.color}`} />
                  <div className="flex-1 text-left">
                    <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{level.name}</div>
                    <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{level.colorName}</div>
                  </div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {level.tempF.min}-{level.tempF.max}°F
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Temperature Guide */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Thermometer className="w-4 h-4 text-red-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.steakDoneness.targetTemp', 'Target Temp')}</span>
            </div>
            <div className="text-2xl font-bold text-red-500">
              {donenessConfig.tempF.min}-{donenessConfig.tempF.max}°F
            </div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {donenessConfig.tempC.min}-{donenessConfig.tempC.max}°C
            </div>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Thermometer className="w-4 h-4 text-orange-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.steakDoneness.pullAt', 'Pull at')}</span>
            </div>
            <div className="text-2xl font-bold text-orange-500">
              {calculations.pullTempF}°F
            </div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {calculations.pullTempC}°C (carryover cooking)
            </div>
          </div>
        </div>

        {/* Cooking Times */}
        <div className="grid grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Timer className="w-4 h-4 text-amber-500" />
              <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.steakDoneness.perSide', 'Per Side')}</span>
            </div>
            <div className="text-xl font-bold text-amber-500">
              {calculations.cookTimePerSide} min
            </div>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Timer className="w-4 h-4 text-amber-500" />
              <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.steakDoneness.totalCook', 'Total Cook')}</span>
            </div>
            <div className="text-xl font-bold text-amber-500">
              {calculations.totalCookTime} min
            </div>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-blue-500" />
              <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.steakDoneness.restTime', 'Rest Time')}</span>
            </div>
            <div className="text-xl font-bold text-blue-500">
              {calculations.restTime} min
            </div>
          </div>
        </div>

        {/* Doneness Description */}
        <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className={`w-full h-6 rounded-lg mb-3 ${donenessConfig.color}`} />
          <div className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {donenessConfig.name}
          </div>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {donenessConfig.description}
          </div>
        </div>

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.steakDoneness.proTips', 'Pro Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>- Bring steak to room temperature 30-45 min before cooking</li>
                <li>- Pat dry with paper towels for better sear</li>
                <li>- Use high heat for the initial sear</li>
                <li>- Always rest your steak - juices redistribute for better flavor</li>
                <li>- Use an instant-read thermometer for accuracy</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SteakDonenessTool;
