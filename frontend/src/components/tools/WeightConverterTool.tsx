import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeftRight, Scale, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

type WeightUnit = 'milligram' | 'gram' | 'kilogram' | 'ounce' | 'pound' | 'ton';

interface ConversionRate {
  [key: string]: number;
}

interface WeightConverterToolProps {
  uiConfig?: UIConfig;
}

const WeightConverterTool: React.FC<WeightConverterToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  const [inputValue, setInputValue] = useState<string>('1');
  const [fromUnit, setFromUnit] = useState<WeightUnit>('kilogram');
  const [toUnit, setToUnit] = useState<WeightUnit>('pound');
  const [result, setResult] = useState<number>(0);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;

      if (params.amount !== undefined) {
        setInputValue(String(params.amount));
        setIsPrefilled(true);
      }
      const textContent = params.text || params.content || '';
      if (textContent && !params.amount) {
        const numMatch = textContent.match(/[\d.]+/);
        if (numMatch) {
          setInputValue(numMatch[0]);
          setIsPrefilled(true);
        }
      }
    }
  }, [uiConfig?.params]);

  // Conversion rates to grams (base unit)
  const conversionToGrams: ConversionRate = {
    milligram: 0.001,
    gram: 1,
    kilogram: 1000,
    ounce: 28.3495,
    pound: 453.592,
    ton: 1000000,
  };

  const units: WeightUnit[] = ['milligram', 'gram', 'kilogram', 'ounce', 'pound', 'ton'];

  const unitLabels: Record<WeightUnit, string> = {
    milligram: 'Milligram (mg)',
    gram: 'Gram (g)',
    kilogram: 'Kilogram (kg)',
    ounce: 'Ounce (oz)',
    pound: 'Pound (lb)',
    ton: 'Metric Ton (t)',
  };

  useEffect(() => {
    const value = parseFloat(inputValue);
    if (!isNaN(value)) {
      // Convert to grams first, then to target unit
      const inGrams = value * conversionToGrams[fromUnit];
      const converted = inGrams / conversionToGrams[toUnit];
      setResult(converted);
    } else {
      setResult(0);
    }
  }, [inputValue, fromUnit, toUnit]);

  const handleSwapUnits = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-4xl mx-auto">
        <div className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} rounded-lg shadow-lg p-8`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-lg bg-[#0D9488] flex items-center justify-center">
              <Scale className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{t('tools.weightConverter.weightConverter', 'Weight Converter')}</h1>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.weightConverter.convertBetweenDifferentWeightUnits', 'Convert between different weight units')}
              </p>
            </div>
          </div>

          {isPrefilled && (
            <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
              <Sparkles className="w-4 h-4 text-[#0D9488]" />
              <span className="text-sm text-[#0D9488] font-medium">{t('tools.weightConverter.valueLoadedFromAiResponse', 'Value loaded from AI response')}</span>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* From Section */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.weightConverter.from', 'From')}
              </label>
              <input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488] mb-3`}
                placeholder={t('tools.weightConverter.enterValue', 'Enter value')}
              />
              <select
                value={fromUnit}
                onChange={(e) => setFromUnit(e.target.value as WeightUnit)}
                className={`w-full px-4 py-3 rounded-lg border ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              >
                {units.map((unit) => (
                  <option key={unit} value={unit}>
                    {unitLabels[unit]}
                  </option>
                ))}
              </select>
            </div>

            {/* Swap Button */}
            <div className="flex items-center justify-center md:col-span-2 md:order-none order-last">
              <button
                onClick={handleSwapUnits}
                className="p-3 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white transition-colors"
                title={t('tools.weightConverter.swapUnits', 'Swap units')}
              >
                <ArrowLeftRight className="w-5 h-5" />
              </button>
            </div>

            {/* To Section */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.weightConverter.to', 'To')}
              </label>
              <div
                className={`w-full px-4 py-3 rounded-lg border ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-gray-100 border-gray-300 text-gray-900'
                } mb-3 font-semibold text-lg`}
              >
                {result.toFixed(6)}
              </div>
              <select
                value={toUnit}
                onChange={(e) => setToUnit(e.target.value as WeightUnit)}
                className={`w-full px-4 py-3 rounded-lg border ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              >
                {units.map((unit) => (
                  <option key={unit} value={unit}>
                    {unitLabels[unit]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Reference */}
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              {t('tools.weightConverter.quickReference', 'Quick Reference')}
            </p>
            <div className={`grid grid-cols-2 gap-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <div>1 kg = 1000 g</div>
              <div>1 lb = 16 oz</div>
              <div>1 kg ≈ 2.205 lb</div>
              <div>1 ton = 1000 kg</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeightConverterTool;
