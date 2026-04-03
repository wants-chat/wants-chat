import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Coffee, Droplet, Scale, Clock, Info, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface BrewRatioToolProps {
  uiConfig?: UIConfig;
}

type BrewMethod = 'pourover' | 'frenchpress' | 'aeropress' | 'espresso' | 'coldbrew' | 'drip';

interface MethodConfig {
  name: string;
  ratio: number; // grams of water per gram of coffee
  grind: string;
  brewTime: string;
  temp: string;
  description: string;
}

export const BrewRatioTool: React.FC<BrewRatioToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  const [method, setMethod] = useState<BrewMethod>('pourover');

  // Handle prefill data
  useEffect(() => {
    if (uiConfig?.prefillData) {
      const data = uiConfig.prefillData as ToolPrefillData;
      if (data.brewMethod) setMethod(data.brewMethod as BrewMethod);
      setIsPrefilled(true);
    }
  }, [uiConfig]);
  const [calculationMode, setCalculationMode] = useState<'coffee' | 'water' | 'cups'>('cups');
  const [coffeeGrams, setCoffeeGrams] = useState('30');
  const [waterMl, setWaterMl] = useState('500');
  const [cups, setCups] = useState('2');
  const [customRatio, setCustomRatio] = useState('');

  const methods: Record<BrewMethod, MethodConfig> = {
    pourover: {
      name: 'Pour Over',
      ratio: 16,
      grind: 'Medium-Fine',
      brewTime: '3-4 minutes',
      temp: '195-205°F (90-96°C)',
      description: 'Clean, bright, nuanced flavors',
    },
    frenchpress: {
      name: 'French Press',
      ratio: 15,
      grind: 'Coarse',
      brewTime: '4 minutes',
      temp: '195-205°F (90-96°C)',
      description: 'Full-bodied, rich, bold',
    },
    aeropress: {
      name: 'AeroPress',
      ratio: 12,
      grind: 'Fine to Medium',
      brewTime: '1-2 minutes',
      temp: '175-185°F (80-85°C)',
      description: 'Smooth, low acidity, versatile',
    },
    espresso: {
      name: 'Espresso',
      ratio: 2,
      grind: 'Very Fine',
      brewTime: '25-30 seconds',
      temp: '195-205°F (90-96°C)',
      description: 'Concentrated, intense, crema',
    },
    coldbrew: {
      name: 'Cold Brew',
      ratio: 8,
      grind: 'Extra Coarse',
      brewTime: '12-24 hours',
      temp: 'Cold/Room Temp',
      description: 'Smooth, sweet, low acidity',
    },
    drip: {
      name: 'Drip Machine',
      ratio: 17,
      grind: 'Medium',
      brewTime: '5-6 minutes',
      temp: '195-205°F (90-96°C)',
      description: 'Balanced, consistent, easy',
    },
  };

  const config = methods[method];
  const ratio = customRatio ? parseFloat(customRatio) : config.ratio;
  const CUP_SIZE = 237; // ml per cup (8 oz)

  const calculations = useMemo(() => {
    let coffee = parseFloat(coffeeGrams) || 0;
    let water = parseFloat(waterMl) || 0;
    let numCups = parseFloat(cups) || 0;

    switch (calculationMode) {
      case 'coffee':
        // Given coffee, calculate water
        water = coffee * ratio;
        numCups = water / CUP_SIZE;
        break;
      case 'water':
        // Given water, calculate coffee
        coffee = water / ratio;
        numCups = water / CUP_SIZE;
        break;
      case 'cups':
        // Given cups, calculate both
        water = numCups * CUP_SIZE;
        coffee = water / ratio;
        break;
    }

    // Convert to other units
    const coffeeOz = coffee / 28.35;
    const coffeeTbsp = coffee / 5; // ~5g per tablespoon
    const waterOz = water / 29.57;
    const waterCups = water / CUP_SIZE;

    return {
      coffee: coffee.toFixed(1),
      coffeeOz: coffeeOz.toFixed(2),
      coffeeTbsp: coffeeTbsp.toFixed(1),
      water: water.toFixed(0),
      waterOz: waterOz.toFixed(1),
      waterCups: waterCups.toFixed(1),
      cups: numCups.toFixed(1),
    };
  }, [calculationMode, coffeeGrams, waterMl, cups, ratio, CUP_SIZE]);

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-amber-900/20' : 'bg-gradient-to-r from-white to-amber-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 rounded-lg"><Coffee className="w-5 h-5 text-amber-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.brewRatio.coffeeBrewRatioCalculator', 'Coffee Brew Ratio Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.brewRatio.perfectRatiosForAnyBrew', 'Perfect ratios for any brew method')}</p>
          </div>
        </div>
      </div>

      {isPrefilled && (
        <div className={`mx-6 mt-4 p-3 rounded-lg flex items-center gap-2 ${isDark ? 'bg-amber-900/20 border border-amber-800' : 'bg-amber-50 border border-amber-200'}`}>
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span className={`text-sm ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
            {t('tools.brewRatio.preFilledBasedOnYour', 'Pre-filled based on your request')}
          </span>
        </div>
      )}

      <div className="p-6 space-y-6">
        {/* Brew Method Selection */}
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(methods) as BrewMethod[]).map((m) => (
            <button
              key={m}
              onClick={() => setMethod(m)}
              className={`py-2 px-3 rounded-lg text-sm ${method === m ? 'bg-amber-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
            >
              {methods[m].name}
            </button>
          ))}
        </div>

        {/* Method Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-amber-900/20 border-amber-800' : 'bg-amber-50 border-amber-200'} border`}>
          <div className="flex items-center justify-between mb-2">
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{config.name}</h4>
            <span className="text-amber-500 font-bold">1:{ratio}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              <span className="font-medium">{t('tools.brewRatio.grind', 'Grind:')}</span> {config.grind}
            </div>
            <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              <span className="font-medium">{t('tools.brewRatio.time', 'Time:')}</span> {config.brewTime}
            </div>
            <div className={`col-span-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <span className="font-medium">{t('tools.brewRatio.temp', 'Temp:')}</span> {config.temp}
            </div>
          </div>
          <p className={`mt-2 text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            {config.description}
          </p>
        </div>

        {/* Custom Ratio */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.brewRatio.customRatioOptional', 'Custom Ratio (optional)')}
          </label>
          <div className="flex items-center gap-2">
            <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>1:</span>
            <input
              type="number"
              value={customRatio}
              onChange={(e) => setCustomRatio(e.target.value)}
              placeholder={config.ratio.toString()}
              className={`flex-1 px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
        </div>

        {/* Calculation Mode */}
        <div className="flex gap-2">
          <button
            onClick={() => setCalculationMode('cups')}
            className={`flex-1 py-2 rounded-lg ${calculationMode === 'cups' ? 'bg-amber-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
          >
            {t('tools.brewRatio.byCups', 'By Cups')}
          </button>
          <button
            onClick={() => setCalculationMode('coffee')}
            className={`flex-1 py-2 rounded-lg ${calculationMode === 'coffee' ? 'bg-amber-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
          >
            {t('tools.brewRatio.byCoffee', 'By Coffee')}
          </button>
          <button
            onClick={() => setCalculationMode('water')}
            className={`flex-1 py-2 rounded-lg ${calculationMode === 'water' ? 'bg-amber-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
          >
            {t('tools.brewRatio.byWater', 'By Water')}
          </button>
        </div>

        {/* Input */}
        {calculationMode === 'cups' && (
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.brewRatio.numberOfCups8Oz', 'Number of Cups (8 oz each)')}
            </label>
            <div className="flex gap-2">
              {[1, 2, 4, 6, 8].map((n) => (
                <button
                  key={n}
                  onClick={() => setCups(n.toString())}
                  className={`flex-1 py-2 rounded-lg ${parseInt(cups) === n ? 'bg-amber-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                >
                  {n}
                </button>
              ))}
            </div>
            <input
              type="number"
              value={cups}
              onChange={(e) => setCups(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
        )}

        {calculationMode === 'coffee' && (
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Scale className="w-4 h-4 inline mr-1" />
              {t('tools.brewRatio.coffeeGrams', 'Coffee (grams)')}
            </label>
            <input
              type="number"
              value={coffeeGrams}
              onChange={(e) => setCoffeeGrams(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
        )}

        {calculationMode === 'water' && (
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Droplet className="w-4 h-4 inline mr-1" />
              {t('tools.brewRatio.waterMl', 'Water (mL)')}
            </label>
            <input
              type="number"
              value={waterMl}
              onChange={(e) => setWaterMl(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
        )}

        {/* Results */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Scale className="w-4 h-4 text-amber-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.brewRatio.coffee', 'Coffee')}</span>
            </div>
            <div className="text-3xl font-bold text-amber-500">{calculations.coffee}g</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {calculations.coffeeOz} oz • ~{calculations.coffeeTbsp} tbsp
            </div>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Droplet className="w-4 h-4 text-blue-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.brewRatio.water', 'Water')}</span>
            </div>
            <div className="text-3xl font-bold text-blue-500">{calculations.water}mL</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {calculations.waterOz} oz • {calculations.waterCups} cups
            </div>
          </div>
        </div>

        {/* Yield */}
        <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.brewRatio.thisWillMakeApproximately', 'This will make approximately')}</div>
          <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {calculations.cups} cups
          </div>
          <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>at 1:{ratio} ratio</div>
        </div>

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.brewRatio.tips', 'Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>• Use a scale for consistent results</li>
                <li>• Adjust ratio to taste: lower = stronger</li>
                <li>• Fresh, quality beans make the difference</li>
                <li>• Grind just before brewing when possible</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrewRatioTool;
