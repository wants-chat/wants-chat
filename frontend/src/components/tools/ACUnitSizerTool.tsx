import React, { useState, useMemo, useEffect } from 'react';
import { Thermometer, Home, Sun, Wind, Layers, Info, Snowflake, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

type ClimateZone = 'hot-humid' | 'hot-dry' | 'mixed-humid' | 'mixed-dry' | 'cold' | 'very-cold' | 'marine';
type SunExposure = 'heavy' | 'moderate' | 'light' | 'shaded';
type InsulationQuality = 'poor' | 'average' | 'good' | 'excellent';

interface ClimateConfig {
  name: string;
  baseBtuPerSqFt: number;
  description: string;
}

interface SunExposureConfig {
  name: string;
  multiplier: number;
  description: string;
}

interface InsulationConfig {
  name: string;
  multiplier: number;
  description: string;
}

interface ACUnitSizerToolProps {
  uiConfig?: UIConfig;
}

export const ACUnitSizerTool: React.FC<ACUnitSizerToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [squareFootage, setSquareFootage] = useState('1000');
  const [ceilingHeight, setCeilingHeight] = useState('8');
  const [climateZone, setClimateZone] = useState<ClimateZone>('mixed-humid');
  const [windowCount, setWindowCount] = useState('4');
  const [windowSize, setWindowSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [sunExposure, setSunExposure] = useState<SunExposure>('moderate');
  const [insulation, setInsulation] = useState<InsulationQuality>('average');
  const [occupants, setOccupants] = useState('2');
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Apply prefill data from uiConfig.params
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      let hasPrefill = false;

      if (params.numbers && params.numbers.length >= 1) {
        setSquareFootage(params.numbers[0].toString());
        hasPrefill = true;
      }
      if (params.amount) {
        setSquareFootage(params.amount.toString());
        hasPrefill = true;
      }

      setIsPrefilled(hasPrefill);
    }
  }, [uiConfig?.params]);

  const climateZones: Record<ClimateZone, ClimateConfig> = {
    'hot-humid': {
      name: 'Hot-Humid',
      baseBtuPerSqFt: 25,
      description: 'Florida, Gulf Coast, Hawaii',
    },
    'hot-dry': {
      name: 'Hot-Dry',
      baseBtuPerSqFt: 22,
      description: 'Arizona, Nevada, Desert Southwest',
    },
    'mixed-humid': {
      name: 'Mixed-Humid',
      baseBtuPerSqFt: 20,
      description: 'Southeast, Mid-Atlantic states',
    },
    'mixed-dry': {
      name: 'Mixed-Dry',
      baseBtuPerSqFt: 18,
      description: 'Texas, Oklahoma, Kansas',
    },
    'cold': {
      name: 'Cold',
      baseBtuPerSqFt: 15,
      description: 'Midwest, Northeast',
    },
    'very-cold': {
      name: 'Very Cold',
      baseBtuPerSqFt: 12,
      description: 'Minnesota, Montana, Alaska',
    },
    'marine': {
      name: 'Marine',
      baseBtuPerSqFt: 14,
      description: 'Pacific Northwest, Coastal California',
    },
  };

  const sunExposureLevels: Record<SunExposure, SunExposureConfig> = {
    heavy: {
      name: 'Heavy Sun',
      multiplier: 1.15,
      description: 'South/West facing, minimal shade',
    },
    moderate: {
      name: 'Moderate Sun',
      multiplier: 1.0,
      description: 'Mixed exposure, some shade',
    },
    light: {
      name: 'Light Sun',
      multiplier: 0.9,
      description: 'North/East facing, partial shade',
    },
    shaded: {
      name: 'Heavily Shaded',
      multiplier: 0.85,
      description: 'Trees, overhangs, minimal direct sun',
    },
  };

  const insulationLevels: Record<InsulationQuality, InsulationConfig> = {
    poor: {
      name: 'Poor',
      multiplier: 1.2,
      description: 'Old home, drafty, no insulation',
    },
    average: {
      name: 'Average',
      multiplier: 1.0,
      description: 'Standard insulation, some air leaks',
    },
    good: {
      name: 'Good',
      multiplier: 0.9,
      description: 'Well insulated, double-pane windows',
    },
    excellent: {
      name: 'Excellent',
      multiplier: 0.8,
      description: 'New construction, energy star rated',
    },
  };

  const windowSizeMultipliers = {
    small: { name: 'Small (< 15 sq ft)', btuPerWindow: 800 },
    medium: { name: 'Medium (15-30 sq ft)', btuPerWindow: 1200 },
    large: { name: 'Large (> 30 sq ft)', btuPerWindow: 1800 },
  };

  const calculations = useMemo(() => {
    const sqFt = parseFloat(squareFootage) || 0;
    const ceiling = parseFloat(ceilingHeight) || 8;
    const windows = parseInt(windowCount) || 0;
    const people = parseInt(occupants) || 2;

    // Base BTU calculation from climate zone
    const climate = climateZones[climateZone];
    let baseBtu = sqFt * climate.baseBtuPerSqFt;

    // Adjust for ceiling height (standard is 8 feet)
    const ceilingFactor = ceiling / 8;
    baseBtu *= ceilingFactor;

    // Add BTU for windows
    const windowBtu = windows * windowSizeMultipliers[windowSize].btuPerWindow;
    baseBtu += windowBtu;

    // Apply sun exposure multiplier
    baseBtu *= sunExposureLevels[sunExposure].multiplier;

    // Apply insulation multiplier
    baseBtu *= insulationLevels[insulation].multiplier;

    // Add BTU for occupants (600 BTU per person above 2)
    if (people > 2) {
      baseBtu += (people - 2) * 600;
    }

    // Calculate tonnage (12,000 BTU = 1 ton)
    const tonnage = baseBtu / 12000;

    // Round to nearest standard AC size
    const standardTons = [1, 1.5, 2, 2.5, 3, 3.5, 4, 5];
    const recommendedTons = standardTons.reduce((prev, curr) =>
      Math.abs(curr - tonnage) < Math.abs(prev - tonnage) ? curr : prev
    );

    // Calculate energy estimates
    const estimatedWatts = recommendedTons * 1200; // Approximate watts per ton
    const hoursPerDay = 8; // Average cooling hours
    const daysPerMonth = 30;
    const kwhPerMonth = (estimatedWatts * hoursPerDay * daysPerMonth) / 1000;

    return {
      totalBtu: Math.round(baseBtu),
      exactTonnage: tonnage.toFixed(2),
      recommendedTons,
      recommendedBtu: recommendedTons * 12000,
      estimatedWatts,
      kwhPerMonth: Math.round(kwhPerMonth),
      efficiency: tonnage <= recommendedTons ? 'Optimal' : 'Consider larger unit',
    };
  }, [squareFootage, ceilingHeight, climateZone, windowCount, windowSize, sunExposure, insulation, occupants]);

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-cyan-900/20' : 'bg-gradient-to-r from-white to-cyan-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/10 rounded-lg"><Snowflake className="w-5 h-5 text-cyan-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.aCUnitSizer.acUnitSizeCalculator', 'AC Unit Size Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.aCUnitSizer.calculateTheRightBtuAnd', 'Calculate the right BTU and tonnage for your space')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Prefill indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.aCUnitSizer.valuesLoadedFromYourConversation', 'Values loaded from your conversation')}</span>
          </div>
        )}
        {/* Room Dimensions */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Home className="w-4 h-4 inline mr-1" />
              {t('tools.aCUnitSizer.roomSizeSqFt', 'Room Size (sq ft)')}
            </label>
            <input
              type="number"
              value={squareFootage}
              onChange={(e) => setSquareFootage(e.target.value)}
              placeholder="1000"
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Layers className="w-4 h-4 inline mr-1" />
              {t('tools.aCUnitSizer.ceilingHeightFt', 'Ceiling Height (ft)')}
            </label>
            <input
              type="number"
              value={ceilingHeight}
              onChange={(e) => setCeilingHeight(e.target.value)}
              placeholder="8"
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
        </div>

        {/* Climate Zone Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Thermometer className="w-4 h-4 inline mr-1" />
            {t('tools.aCUnitSizer.climateZone', 'Climate Zone')}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(Object.keys(climateZones) as ClimateZone[]).map((zone) => (
              <button
                key={zone}
                onClick={() => setClimateZone(zone)}
                className={`py-2 px-3 rounded-lg text-sm ${climateZone === zone ? 'bg-cyan-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {climateZones[zone].name}
              </button>
            ))}
          </div>
          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            {climateZones[climateZone].description}
          </p>
        </div>

        {/* Windows */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.aCUnitSizer.numberOfWindows', 'Number of Windows')}
            </label>
            <input
              type="number"
              value={windowCount}
              onChange={(e) => setWindowCount(e.target.value)}
              placeholder="4"
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.aCUnitSizer.windowSize', 'Window Size')}
            </label>
            <div className="flex gap-2">
              {(['small', 'medium', 'large'] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => setWindowSize(size)}
                  className={`flex-1 py-2 px-2 rounded-lg text-sm capitalize ${windowSize === size ? 'bg-cyan-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sun Exposure */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Sun className="w-4 h-4 inline mr-1" />
            {t('tools.aCUnitSizer.sunExposure', 'Sun Exposure')}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(Object.keys(sunExposureLevels) as SunExposure[]).map((level) => (
              <button
                key={level}
                onClick={() => setSunExposure(level)}
                className={`py-2 px-3 rounded-lg text-sm ${sunExposure === level ? 'bg-cyan-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {sunExposureLevels[level].name}
              </button>
            ))}
          </div>
          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            {sunExposureLevels[sunExposure].description}
          </p>
        </div>

        {/* Insulation Quality */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Wind className="w-4 h-4 inline mr-1" />
            {t('tools.aCUnitSizer.insulationQuality', 'Insulation Quality')}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(Object.keys(insulationLevels) as InsulationQuality[]).map((level) => (
              <button
                key={level}
                onClick={() => setInsulation(level)}
                className={`py-2 px-3 rounded-lg text-sm ${insulation === level ? 'bg-cyan-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {insulationLevels[level].name}
              </button>
            ))}
          </div>
          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            {insulationLevels[insulation].description}
          </p>
        </div>

        {/* Occupants */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.aCUnitSizer.numberOfOccupants', 'Number of Occupants')}
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <button
                key={n}
                onClick={() => setOccupants(n.toString())}
                className={`flex-1 py-2 rounded-lg ${parseInt(occupants) === n ? 'bg-cyan-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-cyan-900/20 border-cyan-800' : 'bg-cyan-50 border-cyan-200'} border`}>
          <h4 className={`font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.aCUnitSizer.recommendedAcSize', 'Recommended AC Size')}</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Snowflake className="w-4 h-4 text-cyan-500" />
                <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.aCUnitSizer.tonnage', 'Tonnage')}</span>
              </div>
              <div className="text-3xl font-bold text-cyan-500">{calculations.recommendedTons} Ton</div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Calculated: {calculations.exactTonnage} tons
              </div>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Thermometer className="w-4 h-4 text-orange-500" />
                <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.aCUnitSizer.btuRequired', 'BTU Required')}</span>
              </div>
              <div className="text-3xl font-bold text-orange-500">{calculations.totalBtu.toLocaleString()}</div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Unit: {calculations.recommendedBtu.toLocaleString()} BTU
              </div>
            </div>
          </div>
        </div>

        {/* Energy Estimates */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.aCUnitSizer.estimatedEnergyUsage', 'Estimated Energy Usage')}</h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{calculations.estimatedWatts.toLocaleString()}W</div>
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.aCUnitSizer.powerDraw', 'Power Draw')}</div>
            </div>
            <div>
              <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{calculations.kwhPerMonth} kWh</div>
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.aCUnitSizer.monthlyEst', 'Monthly (est.)')}</div>
            </div>
            <div>
              <div className={`text-lg font-bold text-green-500`}>{calculations.efficiency}</div>
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.aCUnitSizer.sizing', 'Sizing')}</div>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.aCUnitSizer.tips', 'Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>{t('tools.aCUnitSizer.anOversizedUnitCyclesToo', 'An oversized unit cycles too frequently, reducing efficiency')}</li>
                <li>{t('tools.aCUnitSizer.anUndersizedUnitRunsConstantly', 'An undersized unit runs constantly and struggles on hot days')}</li>
                <li>{t('tools.aCUnitSizer.considerASlightlyLargerUnit', 'Consider a slightly larger unit for rooms with kitchens')}</li>
                <li>{t('tools.aCUnitSizer.lookForSeerRatingsOf', 'Look for SEER ratings of 14+ for better energy efficiency')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ACUnitSizerTool;
