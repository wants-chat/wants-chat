import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Wine, Thermometer, Clock, GlassWater, Users, Utensils, Info } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

type WineType = 'red-full' | 'red-medium' | 'red-light' | 'white-full' | 'white-light' | 'rose' | 'sparkling' | 'dessert' | 'fortified';

interface WineConfig {
  name: string;
  servingTemp: string;
  tempRange: { min: number; max: number };
  decantTime: string;
  decantMinutes: number;
  glassType: string;
  pourSize: number; // ml
  description: string;
  pairings: string[];
}

interface WineServingToolProps {
  uiConfig?: UIConfig;
}

export const WineServingTool: React.FC<WineServingToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [wineType, setWineType] = useState<WineType>('red-full');
  const [calculationMode, setCalculationMode] = useState<'pour' | 'party'>('pour');
  const [pourMl, setPourMl] = useState('150');
  const [guests, setGuests] = useState('10');
  const [drinksPerPerson, setDrinksPerPerson] = useState('3');
  const [bottleSize, setBottleSize] = useState('750');
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.prefillData && !isPrefilled) {
      const data = uiConfig.prefillData;
      if (data.wineType) setWineType(data.wineType as WineType);
      if (data.calculationMode) setCalculationMode(data.calculationMode as 'pour' | 'party');
      if (data.pourMl) setPourMl(String(data.pourMl));
      if (data.guests) setGuests(String(data.guests));
      if (data.drinksPerPerson) setDrinksPerPerson(String(data.drinksPerPerson));
      if (data.bottleSize) setBottleSize(String(data.bottleSize));
      setIsPrefilled(true);
    }
  }, [uiConfig, isPrefilled]);

  const wines: Record<WineType, WineConfig> = {
    'red-full': {
      name: 'Full-Bodied Red',
      servingTemp: '60-65°F (15-18°C)',
      tempRange: { min: 15, max: 18 },
      decantTime: '1-2 hours',
      decantMinutes: 90,
      glassType: 'Bordeaux Glass',
      pourSize: 150,
      description: 'Cabernet Sauvignon, Malbec, Syrah, Barolo',
      pairings: ['Grilled steak', 'Lamb', 'Hard aged cheeses', 'Dark chocolate'],
    },
    'red-medium': {
      name: 'Medium-Bodied Red',
      servingTemp: '55-60°F (13-15°C)',
      tempRange: { min: 13, max: 15 },
      decantTime: '30-60 minutes',
      decantMinutes: 45,
      glassType: 'Burgundy Glass',
      pourSize: 150,
      description: 'Merlot, Sangiovese, Tempranillo, Grenache',
      pairings: ['Roasted chicken', 'Pasta with red sauce', 'Mushroom dishes', 'Medium cheeses'],
    },
    'red-light': {
      name: 'Light-Bodied Red',
      servingTemp: '50-55°F (10-13°C)',
      tempRange: { min: 10, max: 13 },
      decantTime: '15-30 minutes',
      decantMinutes: 20,
      glassType: 'Burgundy Glass',
      pourSize: 150,
      description: 'Pinot Noir, Gamay, Beaujolais',
      pairings: ['Salmon', 'Duck', 'Soft cheeses', 'Charcuterie'],
    },
    'white-full': {
      name: 'Full-Bodied White',
      servingTemp: '50-55°F (10-13°C)',
      tempRange: { min: 10, max: 13 },
      decantTime: '15-20 minutes',
      decantMinutes: 15,
      glassType: 'White Wine Glass',
      pourSize: 150,
      description: 'Oaked Chardonnay, Viognier, White Burgundy',
      pairings: ['Lobster', 'Creamy pasta', 'Rich fish dishes', 'Poultry with sauce'],
    },
    'white-light': {
      name: 'Light-Bodied White',
      servingTemp: '45-50°F (7-10°C)',
      tempRange: { min: 7, max: 10 },
      decantTime: 'No decanting needed',
      decantMinutes: 0,
      glassType: 'White Wine Glass',
      pourSize: 150,
      description: 'Sauvignon Blanc, Pinot Grigio, Riesling',
      pairings: ['Seafood', 'Salads', 'Light appetizers', 'Goat cheese'],
    },
    'rose': {
      name: 'Rosé',
      servingTemp: '45-55°F (7-13°C)',
      tempRange: { min: 7, max: 13 },
      decantTime: 'No decanting needed',
      decantMinutes: 0,
      glassType: 'White Wine Glass',
      pourSize: 150,
      description: 'Provence Rosé, White Zinfandel',
      pairings: ['Mediterranean cuisine', 'Light salads', 'Grilled vegetables', 'Sushi'],
    },
    'sparkling': {
      name: 'Sparkling Wine',
      servingTemp: '40-50°F (4-10°C)',
      tempRange: { min: 4, max: 10 },
      decantTime: 'Never decant',
      decantMinutes: 0,
      glassType: 'Champagne Flute',
      pourSize: 120,
      description: 'Champagne, Prosecco, Cava, Crémant',
      pairings: ['Oysters', 'Caviar', 'Fried foods', 'Celebrations'],
    },
    'dessert': {
      name: 'Dessert Wine',
      servingTemp: '43-46°F (6-8°C)',
      tempRange: { min: 6, max: 8 },
      decantTime: '15-30 minutes for aged',
      decantMinutes: 20,
      glassType: 'Dessert Wine Glass',
      pourSize: 60,
      description: 'Sauternes, Ice Wine, Late Harvest',
      pairings: ['Fruit desserts', 'Blue cheese', 'Foie gras', 'Crème brûlée'],
    },
    'fortified': {
      name: 'Fortified Wine',
      servingTemp: '55-65°F (13-18°C)',
      tempRange: { min: 13, max: 18 },
      decantTime: '30 min - 2 hours for Vintage Port',
      decantMinutes: 60,
      glassType: 'Port Glass / Copita',
      pourSize: 60,
      description: 'Port, Sherry, Madeira, Marsala',
      pairings: ['Nuts', 'Aged cheeses', 'Chocolate', 'Dried fruits'],
    },
  };

  const config = wines[wineType];
  const STANDARD_BOTTLE = 750; // ml

  const calculations = useMemo(() => {
    const pour = parseFloat(pourMl) || config.pourSize;
    const numGuests = parseFloat(guests) || 0;
    const drinks = parseFloat(drinksPerPerson) || 0;
    const bottle = parseFloat(bottleSize) || STANDARD_BOTTLE;

    // Pours per bottle
    const poursPerBottle = Math.floor(bottle / pour);

    // Party calculations
    const totalDrinks = numGuests * drinks;
    const bottlesNeeded = Math.ceil(totalDrinks / poursPerBottle);
    const totalWineMl = totalDrinks * pour;
    const totalWineLiters = totalWineMl / 1000;

    // Single bottle info
    const wastedMl = bottle - (poursPerBottle * pour);

    return {
      poursPerBottle,
      wastedMl: wastedMl.toFixed(0),
      totalDrinks: totalDrinks.toFixed(0),
      bottlesNeeded,
      totalWineMl: totalWineMl.toFixed(0),
      totalWineLiters: totalWineLiters.toFixed(1),
      pourOz: (pour / 29.57).toFixed(1),
    };
  }, [pourMl, guests, drinksPerPerson, bottleSize, config.pourSize]);

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-purple-900/20' : 'bg-gradient-to-r from-white to-purple-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/10 rounded-lg"><Wine className="w-5 h-5 text-purple-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.wineServing.wineServingGuide', 'Wine Serving Guide')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.wineServing.temperatureDecantingPartyPlanning', 'Temperature, decanting & party planning')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Wine Type Selection */}
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(wines) as WineType[]).map((w) => (
            <button
              key={w}
              onClick={() => setWineType(w)}
              className={`py-2 px-3 rounded-lg text-sm ${wineType === w ? 'bg-purple-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
            >
              {wines[w].name}
            </button>
          ))}
        </div>

        {/* Wine Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-purple-900/20 border-purple-800' : 'bg-purple-50 border-purple-200'} border`}>
          <div className="flex items-center justify-between mb-2">
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{config.name}</h4>
            <span className="text-purple-500 font-bold">{config.pourSize}ml pour</span>
          </div>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-3`}>
            {config.description}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className={`flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <Thermometer className="w-4 h-4 text-purple-500" />
              <span className="text-sm">{config.servingTemp}</span>
            </div>
            <div className={`flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <Clock className="w-4 h-4 text-purple-500" />
              <span className="text-sm">{config.decantTime}</span>
            </div>
            <div className={`flex items-center gap-2 col-span-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <GlassWater className="w-4 h-4 text-purple-500" />
              <span className="text-sm">{config.glassType}</span>
            </div>
          </div>
        </div>

        {/* Food Pairings */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-2 mb-3">
            <Utensils className="w-4 h-4 text-purple-500" />
            <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.wineServing.foodPairings', 'Food Pairings')}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {config.pairings.map((pairing, index) => (
              <span
                key={index}
                className={`px-3 py-1 rounded-full text-sm ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-white text-gray-700 border border-gray-200'}`}
              >
                {pairing}
              </span>
            ))}
          </div>
        </div>

        {/* Calculation Mode */}
        <div className="flex gap-2">
          <button
            onClick={() => setCalculationMode('pour')}
            className={`flex-1 py-2 rounded-lg ${calculationMode === 'pour' ? 'bg-purple-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
          >
            {t('tools.wineServing.pourCalculator', 'Pour Calculator')}
          </button>
          <button
            onClick={() => setCalculationMode('party')}
            className={`flex-1 py-2 rounded-lg ${calculationMode === 'party' ? 'bg-purple-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
          >
            {t('tools.wineServing.partyPlanner', 'Party Planner')}
          </button>
        </div>

        {/* Pour Calculator */}
        {calculationMode === 'pour' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.wineServing.pourSizeMl', 'Pour Size (mL)')}
              </label>
              <div className="flex gap-2">
                {[60, 90, 120, 150, 180].map((size) => (
                  <button
                    key={size}
                    onClick={() => setPourMl(size.toString())}
                    className={`flex-1 py-2 rounded-lg text-sm ${parseInt(pourMl) === size ? 'bg-purple-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                  >
                    {size}ml
                  </button>
                ))}
              </div>
              <input
                type="number"
                value={pourMl}
                onChange={(e) => setPourMl(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>

            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.wineServing.bottleSizeMl', 'Bottle Size (mL)')}
              </label>
              <div className="flex gap-2">
                {[375, 750, 1500, 3000].map((size) => (
                  <button
                    key={size}
                    onClick={() => setBottleSize(size.toString())}
                    className={`flex-1 py-2 rounded-lg text-sm ${parseInt(bottleSize) === size ? 'bg-purple-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                  >
                    {size === 375 ? 'Half' : size === 750 ? 'Standard' : size === 1500 ? t('tools.wineServing.magnum', 'Magnum') : t('tools.wineServing.jeroboam', 'Jeroboam')}
                  </button>
                ))}
              </div>
            </div>

            {/* Pour Results */}
            <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.wineServing.poursPerBottle', 'Pours per bottle')}</div>
              <div className={`text-4xl font-bold text-purple-500`}>
                {calculations.poursPerBottle}
              </div>
              <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                {calculations.pourOz} oz per pour • {calculations.wastedMl}ml remaining
              </div>
            </div>
          </div>
        )}

        {/* Party Planner */}
        {calculationMode === 'party' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  <Users className="w-4 h-4 inline mr-1" />
                  {t('tools.wineServing.numberOfGuests', 'Number of Guests')}
                </label>
                <input
                  type="number"
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  <GlassWater className="w-4 h-4 inline mr-1" />
                  {t('tools.wineServing.drinksPerPerson', 'Drinks per Person')}
                </label>
                <input
                  type="number"
                  value={drinksPerPerson}
                  onChange={(e) => setDrinksPerPerson(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
            </div>

            <div className="flex gap-2">
              {[2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setDrinksPerPerson(n.toString())}
                  className={`flex-1 py-2 rounded-lg text-sm ${parseInt(drinksPerPerson) === n ? 'bg-purple-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                >
                  {n} drinks
                </button>
              ))}
            </div>

            {/* Party Results */}
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Wine className="w-4 h-4 text-purple-500" />
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.wineServing.bottlesNeeded', 'Bottles Needed')}</span>
                </div>
                <div className="text-3xl font-bold text-purple-500">{calculations.bottlesNeeded}</div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.wineServing.standard750mlBottles', 'standard 750ml bottles')}
                </div>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <GlassWater className="w-4 h-4 text-purple-500" />
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.wineServing.totalPours', 'Total Pours')}</span>
                </div>
                <div className="text-3xl font-bold text-purple-500">{calculations.totalDrinks}</div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {calculations.totalWineLiters}L total
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Temperature Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.wineServing.servingTips', 'Serving Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>• Chill reds 15 min before serving if stored at room temp</li>
                <li>• Remove whites from fridge 15 min before serving</li>
                <li>• Hold wine glass by the stem to avoid warming</li>
                <li>• Open red wine 30 min before serving to let it breathe</li>
                <li>• For parties, plan ~1 bottle per 2 guests for dinner</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WineServingTool;
