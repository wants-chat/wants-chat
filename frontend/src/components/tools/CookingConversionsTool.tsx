import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChefHat, ArrowRightLeft, Scale, Droplet, Thermometer, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

type ConversionCategory = 'volume' | 'weight' | 'temperature';

interface ConversionUnit {
  id: string;
  name: string;
  shortName: string;
  toBase: number; // Conversion factor to base unit
}

interface CookingConversionsToolProps {
  uiConfig?: UIConfig;
}

export const CookingConversionsTool: React.FC<CookingConversionsToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [category, setCategory] = useState<ConversionCategory>('volume');
  const [value, setValue] = useState('1');
  const [fromUnit, setFromUnit] = useState('cup');
  const [toUnit, setToUnit] = useState('ml');

  // Temperature state (different logic)
  const [tempValue, setTempValue] = useState('350');
  const [tempUnit, setTempUnit] = useState<'f' | 'c' | 'gas'>('f');
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params && !isPrefilled) {
      const params = uiConfig.params as ToolPrefillData & {
        category?: ConversionCategory;
        value?: string;
        fromUnit?: string;
        toUnit?: string;
        tempValue?: string;
        tempUnit?: 'f' | 'c' | 'gas';
      };
      if (params.category) setCategory(params.category);
      if (params.value) setValue(params.value);
      if (params.fromUnit) setFromUnit(params.fromUnit);
      if (params.toUnit) setToUnit(params.toUnit);
      if (params.tempValue) setTempValue(params.tempValue);
      if (params.tempUnit) setTempUnit(params.tempUnit);
      setIsPrefilled(true);
    }
  }, [uiConfig?.params, isPrefilled]);

  const volumeUnits: ConversionUnit[] = [
    { id: 'tsp', name: 'Teaspoon', shortName: 'tsp', toBase: 4.929 },
    { id: 'tbsp', name: 'Tablespoon', shortName: 'tbsp', toBase: 14.787 },
    { id: 'floz', name: 'Fluid Ounce', shortName: 'fl oz', toBase: 29.574 },
    { id: 'cup', name: 'Cup (US)', shortName: 'cup', toBase: 236.588 },
    { id: 'pint', name: 'Pint (US)', shortName: 'pt', toBase: 473.176 },
    { id: 'quart', name: 'Quart (US)', shortName: 'qt', toBase: 946.353 },
    { id: 'gallon', name: 'Gallon (US)', shortName: 'gal', toBase: 3785.41 },
    { id: 'ml', name: 'Milliliter', shortName: 'mL', toBase: 1 },
    { id: 'l', name: 'Liter', shortName: 'L', toBase: 1000 },
  ];

  const weightUnits: ConversionUnit[] = [
    { id: 'oz', name: 'Ounce', shortName: 'oz', toBase: 28.3495 },
    { id: 'lb', name: 'Pound', shortName: 'lb', toBase: 453.592 },
    { id: 'g', name: 'Gram', shortName: 'g', toBase: 1 },
    { id: 'kg', name: 'Kilogram', shortName: 'kg', toBase: 1000 },
    { id: 'mg', name: 'Milligram', shortName: 'mg', toBase: 0.001 },
  ];

  const units = category === 'volume' ? volumeUnits : weightUnits;

  const conversion = useMemo(() => {
    if (category === 'temperature') return null;

    const numValue = parseFloat(value) || 0;
    const from = units.find((u) => u.id === fromUnit);
    const to = units.find((u) => u.id === toUnit);

    if (!from || !to) return null;

    // Convert to base unit (mL or g), then to target
    const baseValue = numValue * from.toBase;
    const result = baseValue / to.toBase;

    return {
      result,
      baseValue,
      from,
      to,
    };
  }, [category, value, fromUnit, toUnit, units]);

  const temperatureConversion = useMemo(() => {
    const temp = parseFloat(tempValue) || 0;
    let celsius: number;
    let fahrenheit: number;
    let gasMark: number;

    switch (tempUnit) {
      case 'f':
        fahrenheit = temp;
        celsius = (temp - 32) * 5 / 9;
        break;
      case 'c':
        celsius = temp;
        fahrenheit = (temp * 9 / 5) + 32;
        break;
      case 'gas':
        gasMark = temp;
        celsius = (temp - 1) * 14 + 135;
        fahrenheit = celsius * 9 / 5 + 32;
        break;
      default:
        celsius = 0;
        fahrenheit = 32;
    }

    // Calculate gas mark from Celsius
    if (tempUnit !== 'gas') {
      gasMark = Math.round((celsius - 135) / 14 + 1);
      if (gasMark < 1) gasMark = 1;
      if (gasMark > 10) gasMark = 10;
    }

    return {
      celsius: Math.round(celsius),
      fahrenheit: Math.round(fahrenheit),
      gasMark: gasMark!,
    };
  }, [tempValue, tempUnit]);

  const swapUnits = () => {
    const temp = fromUnit;
    setFromUnit(toUnit);
    setToUnit(temp);
  };

  const commonConversions = [
    { from: '1 cup', to: '236.6 mL' },
    { from: '1 tbsp', to: '14.8 mL' },
    { from: '1 tsp', to: '4.9 mL' },
    { from: '1 oz', to: '28.35 g' },
    { from: '1 lb', to: '453.6 g' },
    { from: '350°F', to: '175°C' },
  ];

  const temperaturePresets = [
    { label: 'Low', f: 275, c: 135 },
    { label: 'Moderate', f: 350, c: 175 },
    { label: 'Hot', f: 425, c: 220 },
    { label: 'Very Hot', f: 475, c: 245 },
  ];

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-orange-900/20' : 'bg-gradient-to-r from-white to-orange-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-500/10 rounded-lg"><ChefHat className="w-5 h-5 text-orange-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.cookingConversions.cookingConversions', 'Cooking Conversions')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.cookingConversions.convertCookingMeasurementsEasily', 'Convert cooking measurements easily')}</p>
          </div>
        </div>
      </div>

      {/* Prefill indicator */}
      {isPrefilled && (
        <div className="mx-6 mt-4 flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
          <Sparkles className="w-4 h-4 text-[#0D9488]" />
          <span className="text-sm text-[#0D9488] font-medium">{t('tools.cookingConversions.settingsLoadedFromYourConversation', 'Settings loaded from your conversation')}</span>
        </div>
      )}

      <div className="p-6 space-y-6">
        {/* Category Selection */}
        <div className="flex gap-2">
          <button
            onClick={() => { setCategory('volume'); setFromUnit('cup'); setToUnit('ml'); }}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 ${category === 'volume' ? 'bg-orange-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
          >
            <Droplet className="w-4 h-4" /> Volume
          </button>
          <button
            onClick={() => { setCategory('weight'); setFromUnit('oz'); setToUnit('g'); }}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 ${category === 'weight' ? 'bg-orange-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
          >
            <Scale className="w-4 h-4" /> Weight
          </button>
          <button
            onClick={() => setCategory('temperature')}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 ${category === 'temperature' ? 'bg-orange-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
          >
            <Thermometer className="w-4 h-4" /> Temp
          </button>
        </div>

        {category !== 'temperature' ? (
          <>
            {/* Unit Conversion */}
            <div className="flex items-center gap-4">
              <div className="flex-1 space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.cookingConversions.from', 'From')}</label>
                <input
                  type="number"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
                <select
                  value={fromUnit}
                  onChange={(e) => setFromUnit(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                >
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>{u.name} ({u.shortName})</option>
                  ))}
                </select>
              </div>

              <button
                onClick={swapUnits}
                className={`mt-6 p-3 rounded-lg ${isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                <ArrowRightLeft className="w-5 h-5" />
              </button>

              <div className="flex-1 space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>To</label>
                <div className={`px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {conversion?.result.toFixed(4).replace(/\.?0+$/, '')}
                  </div>
                </div>
                <select
                  value={toUnit}
                  onChange={(e) => setToUnit(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                >
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>{u.name} ({u.shortName})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Result Display */}
            <div className={`p-4 rounded-xl text-center ${isDark ? 'bg-orange-900/20 border-orange-800' : 'bg-orange-50 border-orange-200'} border`}>
              <div className="text-lg">
                <span className="font-bold text-orange-500">{value} {conversion?.from.shortName}</span>
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}> = </span>
                <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {conversion?.result.toFixed(4).replace(/\.?0+$/, '')} {conversion?.to.shortName}
                </span>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Temperature Conversion */}
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setTempUnit('f')}
                  className={`py-2 rounded-lg ${tempUnit === 'f' ? 'bg-orange-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                >
                  °F
                </button>
                <button
                  onClick={() => setTempUnit('c')}
                  className={`py-2 rounded-lg ${tempUnit === 'c' ? 'bg-orange-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                >
                  °C
                </button>
                <button
                  onClick={() => setTempUnit('gas')}
                  className={`py-2 rounded-lg ${tempUnit === 'gas' ? 'bg-orange-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                >
                  {t('tools.cookingConversions.gasMark2', 'Gas Mark')}
                </button>
              </div>

              <input
                type="number"
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border text-lg text-center ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />

              {/* Temperature Presets */}
              <div className="flex gap-2">
                {temperaturePresets.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => {
                      setTempValue(tempUnit === 'f' ? preset.f.toString() : preset.c.toString());
                    }}
                    className={`flex-1 py-2 rounded-lg text-sm ${isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Temperature Results */}
              <div className="grid grid-cols-3 gap-3">
                <div className={`p-4 rounded-lg text-center ${tempUnit === 'f' ? 'ring-2 ring-orange-500' : ''} ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {temperatureConversion.fahrenheit}°F
                  </div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.cookingConversions.fahrenheit', 'Fahrenheit')}</div>
                </div>
                <div className={`p-4 rounded-lg text-center ${tempUnit === 'c' ? 'ring-2 ring-orange-500' : ''} ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {temperatureConversion.celsius}°C
                  </div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.cookingConversions.celsius', 'Celsius')}</div>
                </div>
                <div className={`p-4 rounded-lg text-center ${tempUnit === 'gas' ? 'ring-2 ring-orange-500' : ''} ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Gas {temperatureConversion.gasMark}
                  </div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.cookingConversions.gasMark', 'Gas Mark')}</div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Quick Reference */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.cookingConversions.quickReference', 'Quick Reference')}</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {commonConversions.map((c, idx) => (
              <div key={idx} className={`flex justify-between ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <span>{c.from}</span>
                <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{c.to}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookingConversionsTool;
