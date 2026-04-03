import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Pizza, Droplet, Scale, Clock, Info, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface PizzaDoughToolProps {
  uiConfig?: UIConfig;
}

type PizzaSize = 'personal' | 'medium' | 'large' | 'extraLarge';
type DoughStyle = 'neapolitan' | 'newYork' | 'pan';

interface SizeConfig {
  name: string;
  flourGrams: number; // base flour per pizza
  diameter: string;
}

interface StyleConfig {
  name: string;
  hydration: number; // default hydration percentage
  saltPercent: number; // baker's percentage
  yeastPercent: number; // baker's percentage
  riseTime: string;
  description: string;
}

export const PizzaDoughTool: React.FC<PizzaDoughToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [numberOfPizzas, setNumberOfPizzas] = useState('2');
  const [pizzaSize, setPizzaSize] = useState<PizzaSize>('medium');
  const [doughStyle, setDoughStyle] = useState<DoughStyle>('neapolitan');
  const [customHydration, setCustomHydration] = useState('');
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Handle prefill from conversation
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.amount) {
        setNumberOfPizzas(params.amount.toString());
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const sizes: Record<PizzaSize, SizeConfig> = {
    personal: {
      name: 'Personal',
      flourGrams: 100,
      diameter: '8" (20cm)',
    },
    medium: {
      name: 'Medium',
      flourGrams: 150,
      diameter: '10" (25cm)',
    },
    large: {
      name: 'Large',
      flourGrams: 200,
      diameter: '12" (30cm)',
    },
    extraLarge: {
      name: 'Extra Large',
      flourGrams: 275,
      diameter: '14" (35cm)',
    },
  };

  const styles: Record<DoughStyle, StyleConfig> = {
    neapolitan: {
      name: 'Neapolitan',
      hydration: 60,
      saltPercent: 2.5,
      yeastPercent: 0.2,
      riseTime: '8-24 hours',
      description: 'Soft, puffy cornicione with leopard-spotted char. Best baked at very high heat.',
    },
    newYork: {
      name: 'New York',
      hydration: 65,
      saltPercent: 2,
      yeastPercent: 0.5,
      riseTime: '24-72 hours',
      description: 'Thin, crispy, foldable slices. Oil and sugar added for browning.',
    },
    pan: {
      name: 'Pan / Detroit',
      hydration: 70,
      saltPercent: 2,
      yeastPercent: 0.8,
      riseTime: '2-4 hours',
      description: 'Thick, fluffy, crispy bottom. Baked in an oiled pan.',
    },
  };

  const sizeConfig = sizes[pizzaSize];
  const styleConfig = styles[doughStyle];
  const hydration = customHydration ? parseFloat(customHydration) : styleConfig.hydration;

  const calculations = useMemo(() => {
    const numPizzas = parseInt(numberOfPizzas) || 0;
    const flourPerPizza = sizeConfig.flourGrams;

    // Total flour needed
    const totalFlour = flourPerPizza * numPizzas;

    // Water based on hydration percentage
    const totalWater = (totalFlour * hydration) / 100;

    // Salt based on baker's percentage
    const totalSalt = (totalFlour * styleConfig.saltPercent) / 100;

    // Yeast based on baker's percentage
    const totalYeast = (totalFlour * styleConfig.yeastPercent) / 100;

    // Total dough weight
    const totalDoughWeight = totalFlour + totalWater + totalSalt + totalYeast;

    // Per pizza weight
    const doughPerPizza = totalDoughWeight / (numPizzas || 1);

    return {
      flour: totalFlour.toFixed(0),
      flourOz: (totalFlour / 28.35).toFixed(1),
      flourCups: (totalFlour / 125).toFixed(1), // ~125g per cup of flour
      water: totalWater.toFixed(0),
      waterOz: (totalWater / 29.57).toFixed(1),
      waterCups: (totalWater / 237).toFixed(2),
      salt: totalSalt.toFixed(1),
      saltTsp: (totalSalt / 6).toFixed(1), // ~6g per tsp of salt
      yeast: totalYeast.toFixed(1),
      yeastTsp: (totalYeast / 3).toFixed(2), // ~3g per tsp of instant yeast
      totalWeight: totalDoughWeight.toFixed(0),
      perPizza: doughPerPizza.toFixed(0),
    };
  }, [numberOfPizzas, sizeConfig.flourGrams, hydration, styleConfig.saltPercent, styleConfig.yeastPercent]);

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-orange-900/20' : 'bg-gradient-to-r from-white to-orange-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-500/10 rounded-lg"><Pizza className="w-5 h-5 text-orange-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.pizzaDough.pizzaDoughCalculator', 'Pizza Dough Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.pizzaDough.perfectDoughForAnyStyle', 'Perfect dough for any style pizza')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.pizzaDough.contentLoadedFromYourConversation', 'Content loaded from your conversation')}</span>
          </div>
        )}

        {/* Number of Pizzas */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.pizzaDough.numberOfPizzas', 'Number of Pizzas')}
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 6].map((n) => (
              <button
                key={n}
                onClick={() => setNumberOfPizzas(n.toString())}
                className={`flex-1 py-2 rounded-lg ${parseInt(numberOfPizzas) === n ? 'bg-orange-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {n}
              </button>
            ))}
          </div>
          <input
            type="number"
            value={numberOfPizzas}
            onChange={(e) => setNumberOfPizzas(e.target.value)}
            min="1"
            max="20"
            className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
          />
        </div>

        {/* Pizza Size Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.pizzaDough.pizzaSize', 'Pizza Size')}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(sizes) as PizzaSize[]).map((size) => (
              <button
                key={size}
                onClick={() => setPizzaSize(size)}
                className={`py-2 px-3 rounded-lg text-sm ${pizzaSize === size ? 'bg-orange-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                <div className="font-medium">{sizes[size].name}</div>
                <div className="text-xs opacity-75">{sizes[size].diameter}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Dough Style Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.pizzaDough.doughStyle', 'Dough Style')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(styles) as DoughStyle[]).map((style) => (
              <button
                key={style}
                onClick={() => setDoughStyle(style)}
                className={`py-2 px-3 rounded-lg text-sm ${doughStyle === style ? 'bg-orange-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {styles[style].name}
              </button>
            ))}
          </div>
        </div>

        {/* Style Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-orange-900/20 border-orange-800' : 'bg-orange-50 border-orange-200'} border`}>
          <div className="flex items-center justify-between mb-2">
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{styleConfig.name} Style</h4>
            <span className="text-orange-500 font-bold">{hydration}% Hydration</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              <span className="font-medium">{t('tools.pizzaDough.salt', 'Salt:')}</span> {styleConfig.saltPercent}%
            </div>
            <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              <span className="font-medium">{t('tools.pizzaDough.yeast', 'Yeast:')}</span> {styleConfig.yeastPercent}%
            </div>
            <div className={`col-span-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <span className="font-medium">{t('tools.pizzaDough.riseTime', 'Rise Time:')}</span> {styleConfig.riseTime}
            </div>
          </div>
          <p className={`mt-2 text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            {styleConfig.description}
          </p>
        </div>

        {/* Custom Hydration */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.pizzaDough.customHydrationOptional', 'Custom Hydration % (optional)')}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={customHydration}
              onChange={(e) => setCustomHydration(e.target.value)}
              placeholder={styleConfig.hydration.toString()}
              min="50"
              max="80"
              className={`flex-1 px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
            <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>%</span>
          </div>
        </div>

        {/* Results */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Scale className="w-4 h-4 text-orange-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.pizzaDough.flour', 'Flour')}</span>
            </div>
            <div className="text-3xl font-bold text-orange-500">{calculations.flour}g</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {calculations.flourOz} oz | ~{calculations.flourCups} cups
            </div>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Droplet className="w-4 h-4 text-blue-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.pizzaDough.water', 'Water')}</span>
            </div>
            <div className="text-3xl font-bold text-blue-500">{calculations.water}g</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {calculations.waterOz} oz | {calculations.waterCups} cups
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Scale className="w-4 h-4 text-gray-400" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.pizzaDough.salt2', 'Salt')}</span>
            </div>
            <div className={`text-2xl font-bold ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{calculations.salt}g</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              ~{calculations.saltTsp} tsp
            </div>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-green-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.pizzaDough.yeast2', 'Yeast')}</span>
            </div>
            <div className="text-2xl font-bold text-green-500">{calculations.yeast}g</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              ~{calculations.yeastTsp} tsp (instant)
            </div>
          </div>
        </div>

        {/* Total Dough */}
        <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.pizzaDough.totalDoughWeight', 'Total dough weight')}</div>
          <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {calculations.totalWeight}g
          </div>
          <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            ~{calculations.perPizza}g per pizza | Rise: {styleConfig.riseTime}
          </div>
        </div>

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.pizzaDough.tips', 'Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>- Use bread flour (high protein) for best results</li>
                <li>- Room temp water for same-day dough, cold for long rise</li>
                <li>- Longer cold fermentation develops better flavor</li>
                <li>- Let dough rest at room temp 1-2 hours before shaping</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PizzaDoughTool;
