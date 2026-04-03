import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Utensils, Droplet, Scale, Clock, Info, Flame } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

type PastaType = 'spaghetti' | 'penne' | 'fettuccine' | 'fusilli' | 'farfalle' | 'rigatoni' | 'linguine' | 'macaroni';

interface PastaConfig {
  name: string;
  cookingTime: number; // minutes for al dente
  caloriesPer100g: number;
  waterPerServing: number; // ml per serving
  saltPerLiter: number; // grams per liter of water
  description: string;
  servingSize: number; // grams per serving (dry)
}

interface PastaPortionToolProps {
  uiConfig?: UIConfig;
}

export const PastaPortionTool: React.FC<PastaPortionToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [pastaType, setPastaType] = useState<PastaType>('spaghetti');
  const [servings, setServings] = useState('2');
  const [preference, setPreference] = useState<'al-dente' | 'soft'>('al-dente');
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.prefillData && !isPrefilled) {
      const data = uiConfig.prefillData;
      if (data.pastaType) setPastaType(data.pastaType as PastaType);
      if (data.servings) setServings(String(data.servings));
      if (data.preference) setPreference(data.preference as 'al-dente' | 'soft');
      setIsPrefilled(true);
    }
  }, [uiConfig, isPrefilled]);

  const pastaTypes: Record<PastaType, PastaConfig> = {
    spaghetti: {
      name: 'Spaghetti',
      cookingTime: 9,
      caloriesPer100g: 158,
      waterPerServing: 1000,
      saltPerLiter: 10,
      description: 'Long, thin, cylindrical pasta',
      servingSize: 100,
    },
    penne: {
      name: 'Penne',
      cookingTime: 11,
      caloriesPer100g: 157,
      waterPerServing: 1000,
      saltPerLiter: 10,
      description: 'Tube-shaped pasta with diagonal cuts',
      servingSize: 100,
    },
    fettuccine: {
      name: 'Fettuccine',
      cookingTime: 10,
      caloriesPer100g: 160,
      waterPerServing: 1000,
      saltPerLiter: 10,
      description: 'Flat, thick ribbon pasta',
      servingSize: 100,
    },
    fusilli: {
      name: 'Fusilli',
      cookingTime: 12,
      caloriesPer100g: 157,
      waterPerServing: 1000,
      saltPerLiter: 10,
      description: 'Spiral or corkscrew-shaped pasta',
      servingSize: 100,
    },
    farfalle: {
      name: 'Farfalle',
      cookingTime: 11,
      caloriesPer100g: 157,
      waterPerServing: 1000,
      saltPerLiter: 10,
      description: 'Bow-tie or butterfly-shaped pasta',
      servingSize: 100,
    },
    rigatoni: {
      name: 'Rigatoni',
      cookingTime: 13,
      caloriesPer100g: 157,
      waterPerServing: 1000,
      saltPerLiter: 10,
      description: 'Large ridged tube pasta',
      servingSize: 100,
    },
    linguine: {
      name: 'Linguine',
      cookingTime: 10,
      caloriesPer100g: 159,
      waterPerServing: 1000,
      saltPerLiter: 10,
      description: 'Flat, narrow pasta similar to spaghetti',
      servingSize: 100,
    },
    macaroni: {
      name: 'Macaroni',
      cookingTime: 8,
      caloriesPer100g: 157,
      waterPerServing: 1000,
      saltPerLiter: 10,
      description: 'Small curved tubes, perfect for cheese',
      servingSize: 100,
    },
  };

  const config = pastaTypes[pastaType];

  const calculations = useMemo(() => {
    const numServings = parseFloat(servings) || 0;

    // Dry pasta weight
    const dryWeight = numServings * config.servingSize;
    const dryWeightOz = dryWeight / 28.35;

    // Water calculation (1 liter per 100g of pasta is standard)
    const waterLiters = (dryWeight / 100) * (config.waterPerServing / 1000);
    const waterMl = waterLiters * 1000;
    const waterCups = waterMl / 237;

    // Salt calculation
    const saltGrams = waterLiters * config.saltPerLiter;
    const saltTsp = saltGrams / 6; // ~6g per tsp of table salt

    // Cooking time adjustment
    const cookingTime = preference === 'soft' ? config.cookingTime + 2 : config.cookingTime;

    // Calories calculation
    const totalCalories = (dryWeight / 100) * config.caloriesPer100g;
    const caloriesPerServing = numServings > 0 ? totalCalories / numServings : 0;

    // Cooked weight (pasta roughly doubles when cooked)
    const cookedWeight = dryWeight * 2.2;
    const cookedWeightOz = cookedWeight / 28.35;

    return {
      dryWeight: dryWeight.toFixed(0),
      dryWeightOz: dryWeightOz.toFixed(1),
      waterMl: waterMl.toFixed(0),
      waterLiters: waterLiters.toFixed(1),
      waterCups: waterCups.toFixed(1),
      saltGrams: saltGrams.toFixed(0),
      saltTsp: saltTsp.toFixed(1),
      cookingTime: cookingTime,
      totalCalories: totalCalories.toFixed(0),
      caloriesPerServing: caloriesPerServing.toFixed(0),
      cookedWeight: cookedWeight.toFixed(0),
      cookedWeightOz: cookedWeightOz.toFixed(1),
    };
  }, [servings, config, preference]);

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-orange-900/20' : 'bg-gradient-to-r from-white to-orange-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-500/10 rounded-lg"><Utensils className="w-5 h-5 text-orange-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.pastaPortion.pastaPortionCalculator', 'Pasta Portion Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.pastaPortion.perfectPortionsAndCookingTimes', 'Perfect portions and cooking times')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Pasta Type Selection */}
        <div className="grid grid-cols-4 gap-2">
          {(Object.keys(pastaTypes) as PastaType[]).map((p) => (
            <button
              key={p}
              onClick={() => setPastaType(p)}
              className={`py-2 px-3 rounded-lg text-sm ${pastaType === p ? 'bg-orange-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
            >
              {pastaTypes[p].name}
            </button>
          ))}
        </div>

        {/* Pasta Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-orange-900/20 border-orange-800' : 'bg-orange-50 border-orange-200'} border`}>
          <div className="flex items-center justify-between mb-2">
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{config.name}</h4>
            <span className="text-orange-500 font-bold">{config.caloriesPer100g} cal/100g</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              <span className="font-medium">{t('tools.pastaPortion.cookTime', 'Cook time:')}</span> {config.cookingTime} min
            </div>
            <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              <span className="font-medium">{t('tools.pastaPortion.serving', 'Serving:')}</span> {config.servingSize}g dry
            </div>
          </div>
          <p className={`mt-2 text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            {config.description}
          </p>
        </div>

        {/* Servings Input */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.pastaPortion.numberOfServings', 'Number of Servings')}
          </label>
          <div className="flex gap-2">
            {[1, 2, 4, 6, 8].map((n) => (
              <button
                key={n}
                onClick={() => setServings(n.toString())}
                className={`flex-1 py-2 rounded-lg ${parseInt(servings) === n ? 'bg-orange-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {n}
              </button>
            ))}
          </div>
          <input
            type="number"
            value={servings}
            onChange={(e) => setServings(e.target.value)}
            placeholder={t('tools.pastaPortion.customServings', 'Custom servings')}
            className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
          />
        </div>

        {/* Cooking Preference */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.pastaPortion.cookingPreference', 'Cooking Preference')}
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setPreference('al-dente')}
              className={`flex-1 py-2 rounded-lg ${preference === 'al-dente' ? 'bg-orange-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
            >
              {t('tools.pastaPortion.alDente', 'Al Dente')}
            </button>
            <button
              onClick={() => setPreference('soft')}
              className={`flex-1 py-2 rounded-lg ${preference === 'soft' ? 'bg-orange-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
            >
              {t('tools.pastaPortion.soft', 'Soft')}
            </button>
          </div>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Scale className="w-4 h-4 text-orange-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.pastaPortion.dryPasta', 'Dry Pasta')}</span>
            </div>
            <div className="text-3xl font-bold text-orange-500">{calculations.dryWeight}g</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {calculations.dryWeightOz} oz
            </div>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Droplet className="w-4 h-4 text-blue-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.pastaPortion.water', 'Water')}</span>
            </div>
            <div className="text-3xl font-bold text-blue-500">{calculations.waterLiters}L</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {calculations.waterMl} mL / {calculations.waterCups} cups
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Scale className="w-4 h-4 text-purple-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.pastaPortion.salt', 'Salt')}</span>
            </div>
            <div className="text-3xl font-bold text-purple-500">{calculations.saltGrams}g</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              ~{calculations.saltTsp} tsp
            </div>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-green-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.pastaPortion.cookTime2', 'Cook Time')}</span>
            </div>
            <div className="text-3xl font-bold text-green-500">{calculations.cookingTime}</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              minutes ({preference === 'al-dente' ? t('tools.pastaPortion.alDente2', 'al dente') : 'soft'})
            </div>
          </div>
        </div>

        {/* Calories Summary */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-2 mb-3">
            <Flame className="w-4 h-4 text-red-500" />
            <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.pastaPortion.calories', 'Calories')}</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.pastaPortion.perServing', 'Per Serving')}</div>
              <div className="text-2xl font-bold text-red-500">{calculations.caloriesPerServing} cal</div>
            </div>
            <div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.pastaPortion.total', 'Total')}</div>
              <div className="text-2xl font-bold text-red-400">{calculations.totalCalories} cal</div>
            </div>
          </div>
        </div>

        {/* Yield Info */}
        <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.pastaPortion.cookedPastaYield', 'Cooked pasta yield')}</div>
          <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            ~{calculations.cookedWeight}g ({calculations.cookedWeightOz} oz)
          </div>
          <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            for {servings} serving{parseFloat(servings) !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.pastaPortion.tips', 'Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>{t('tools.pastaPortion.usePlentyOfWaterPasta', 'Use plenty of water - pasta needs room to move')}</li>
                <li>{t('tools.pastaPortion.saltTheWaterGenerouslyIt', 'Salt the water generously - it should taste like the sea')}</li>
                <li>{t('tools.pastaPortion.saveSomePastaWaterFor', 'Save some pasta water for your sauce')}</li>
                <li>{t('tools.pastaPortion.test12MinutesBefore', 'Test 1-2 minutes before suggested time')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PastaPortionTool;
