import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Home, Bird, Square, Ruler, Wind, Info, Box } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface ChickenCoopCalculatorToolProps {
  uiConfig?: UIConfig;
}

type ChickenSize = 'bantam' | 'standard' | 'large';

interface SizeConfig {
  name: string;
  coopSqFt: number; // sq ft per chicken in coop
  runSqFt: number; // sq ft per chicken in run
  roostingInches: number; // inches of roosting bar per chicken
  chickensPerNestBox: number; // chickens per nesting box
  description: string;
}

export const ChickenCoopCalculatorTool: React.FC<ChickenCoopCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [isPrefilled, setIsPrefilled] = useState(false);
  const [chickenCount, setChickenCount] = useState('6');
  const [chickenSize, setChickenSize] = useState<ChickenSize>('standard');
  const [hasFreeRange, setHasFreeRange] = useState(false);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.toolPrefillData && !isPrefilled) {
      const prefillData = uiConfig.toolPrefillData;
      if (prefillData.chickenCount) setChickenCount(String(prefillData.chickenCount));
      if (prefillData.chickenSize) setChickenSize(prefillData.chickenSize as ChickenSize);
      if (prefillData.hasFreeRange !== undefined) setHasFreeRange(Boolean(prefillData.hasFreeRange));
      setIsPrefilled(true);
    }
  }, [uiConfig, isPrefilled]);

  const sizeConfigs: Record<ChickenSize, SizeConfig> = {
    bantam: {
      name: 'Bantam',
      coopSqFt: 2,
      runSqFt: 4,
      roostingInches: 6,
      chickensPerNestBox: 4,
      description: 'Small breeds like Silkies, Sebrights',
    },
    standard: {
      name: 'Standard',
      coopSqFt: 4,
      runSqFt: 10,
      roostingInches: 10,
      chickensPerNestBox: 3,
      description: 'Most common breeds like Rhode Island Red, Leghorn',
    },
    large: {
      name: 'Large/Heavy',
      coopSqFt: 5,
      runSqFt: 15,
      roostingInches: 12,
      chickensPerNestBox: 3,
      description: 'Large breeds like Brahma, Jersey Giant, Orpington',
    },
  };

  const config = sizeConfigs[chickenSize];

  const calculations = useMemo(() => {
    const count = parseInt(chickenCount) || 0;

    // Coop size calculations
    const coopSqFt = count * config.coopSqFt;
    const coopDimensions = {
      small: { width: Math.ceil(Math.sqrt(coopSqFt)), length: Math.ceil(coopSqFt / Math.ceil(Math.sqrt(coopSqFt))) },
    };

    // Run size (reduced if free range)
    const runMultiplier = hasFreeRange ? 0.5 : 1;
    const runSqFt = count * config.runSqFt * runMultiplier;

    // Nesting boxes (1 per 3-4 chickens, minimum 1)
    const nestBoxCount = Math.max(1, Math.ceil(count / config.chickensPerNestBox));

    // Roosting bar length
    const roostingInches = count * config.roostingInches;
    const roostingFeet = roostingInches / 12;

    // Ventilation (1 sq ft per 10 sq ft of floor space, minimum 1 sq ft)
    const ventilationSqFt = Math.max(1, Math.ceil(coopSqFt / 10));

    // Door size recommendation
    const doorWidth = chickenSize === 'large' ? 14 : chickenSize === 'standard' ? 12 : 10;
    const doorHeight = chickenSize === 'large' ? 16 : chickenSize === 'standard' ? 14 : 12;

    // Feeder space (3-4 inches per chicken)
    const feederInches = count * 4;

    // Waterer capacity (1 quart per chicken per day in hot weather)
    const waterQuarts = count;
    const waterGallons = waterQuarts / 4;

    return {
      coopSqFt: coopSqFt.toFixed(0),
      coopWidth: coopDimensions.small.width,
      coopLength: coopDimensions.small.length,
      runSqFt: runSqFt.toFixed(0),
      nestBoxCount,
      roostingFeet: roostingFeet.toFixed(1),
      roostingInches: roostingInches.toFixed(0),
      ventilationSqFt: ventilationSqFt.toFixed(1),
      doorWidth,
      doorHeight,
      feederInches,
      waterGallons: waterGallons.toFixed(1),
    };
  }, [chickenCount, chickenSize, hasFreeRange, config]);

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-orange-900/20' : 'bg-gradient-to-r from-white to-orange-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-500/10 rounded-lg"><Home className="w-5 h-5 text-orange-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.chickenCoopCalculator.chickenCoopCalculator', 'Chicken Coop Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.chickenCoopCalculator.calculateSpaceRequirementsForYour', 'Calculate space requirements for your flock')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Chicken Count Input */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Bird className="w-4 h-4 inline mr-1" />
            {t('tools.chickenCoopCalculator.numberOfChickens', 'Number of Chickens')}
          </label>
          <div className="flex gap-2 mb-2">
            {[3, 6, 10, 15, 20].map((n) => (
              <button
                key={n}
                onClick={() => setChickenCount(n.toString())}
                className={`flex-1 py-2 rounded-lg ${parseInt(chickenCount) === n ? 'bg-orange-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {n}
              </button>
            ))}
          </div>
          <input
            type="number"
            value={chickenCount}
            onChange={(e) => setChickenCount(e.target.value)}
            min="1"
            className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
          />
        </div>

        {/* Chicken Size Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.chickenCoopCalculator.chickenSizeBreedType', 'Chicken Size/Breed Type')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(sizeConfigs) as ChickenSize[]).map((size) => (
              <button
                key={size}
                onClick={() => setChickenSize(size)}
                className={`py-2 px-3 rounded-lg text-sm ${chickenSize === size ? 'bg-orange-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {sizeConfigs[size].name}
              </button>
            ))}
          </div>
        </div>

        {/* Size Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-orange-900/20 border-orange-800' : 'bg-orange-50 border-orange-200'} border`}>
          <div className="flex items-center justify-between mb-2">
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{config.name} Chickens</h4>
            <span className="text-orange-500 font-bold">{config.coopSqFt} sq ft/bird</span>
          </div>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {config.description}
          </p>
        </div>

        {/* Free Range Option */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setHasFreeRange(!hasFreeRange)}
            className={`relative w-12 h-6 rounded-full transition-colors ${hasFreeRange ? 'bg-orange-500' : isDark ? 'bg-gray-700' : 'bg-gray-300'}`}
          >
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${hasFreeRange ? 'left-7' : 'left-1'}`} />
          </button>
          <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            {t('tools.chickenCoopCalculator.chickensWillHaveDailyFree', 'Chickens will have daily free-range time (reduces run size needs)')}
          </span>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Coop Size */}
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Home className="w-4 h-4 text-orange-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.chickenCoopCalculator.coopSize', 'Coop Size')}</span>
            </div>
            <div className="text-3xl font-bold text-orange-500">{calculations.coopSqFt} sq ft</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              ~{calculations.coopWidth} x {calculations.coopLength} ft
            </div>
          </div>

          {/* Run Size */}
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Square className="w-4 h-4 text-green-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.chickenCoopCalculator.runSize', 'Run Size')}</span>
            </div>
            <div className="text-3xl font-bold text-green-500">{calculations.runSqFt} sq ft</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {hasFreeRange ? t('tools.chickenCoopCalculator.reducedForFreeRange', 'Reduced for free-range') : t('tools.chickenCoopCalculator.enclosedRunArea', 'Enclosed run area')}
            </div>
          </div>

          {/* Nesting Boxes */}
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Box className="w-4 h-4 text-amber-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.chickenCoopCalculator.nestingBoxes', 'Nesting Boxes')}</span>
            </div>
            <div className="text-3xl font-bold text-amber-500">{calculations.nestBoxCount}</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.chickenCoopCalculator.12x12x12InchesEach', '12x12x12 inches each')}
            </div>
          </div>

          {/* Roosting Bar */}
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Ruler className="w-4 h-4 text-purple-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.chickenCoopCalculator.roostingBar', 'Roosting Bar')}</span>
            </div>
            <div className="text-3xl font-bold text-purple-500">{calculations.roostingFeet} ft</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {calculations.roostingInches} inches total
            </div>
          </div>
        </div>

        {/* Additional Requirements */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.chickenCoopCalculator.additionalRequirements', 'Additional Requirements')}</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Wind className="w-4 h-4 text-blue-500" />
                <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{t('tools.chickenCoopCalculator.ventilation', 'Ventilation')}</span>
              </div>
              <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {calculations.ventilationSqFt} sq ft minimum
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Square className="w-4 h-4 text-indigo-500" />
                <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{t('tools.chickenCoopCalculator.popDoorSize', 'Pop Door Size')}</span>
              </div>
              <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {calculations.doorWidth}" x {calculations.doorHeight}"
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Ruler className="w-4 h-4 text-pink-500" />
                <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{t('tools.chickenCoopCalculator.feederSpace', 'Feeder Space')}</span>
              </div>
              <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {calculations.feederInches}" linear space
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Bird className="w-4 h-4 text-cyan-500" />
                <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{t('tools.chickenCoopCalculator.waterCapacity', 'Water Capacity')}</span>
              </div>
              <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {calculations.waterGallons} gallons/day
              </div>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.chickenCoopCalculator.tips', 'Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>• Place roosting bars higher than nesting boxes</li>
                <li>• Provide 1 sq ft ventilation per 10 sq ft floor space</li>
                <li>• Nesting boxes should be 12"x12"x12" minimum</li>
                <li>• Consider predator protection for the run</li>
                <li>• Add more space in cold climates where birds stay inside</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChickenCoopCalculatorTool;
