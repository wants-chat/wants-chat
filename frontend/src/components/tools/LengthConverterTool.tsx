import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeftRight, Info, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

type LengthUnit = 'millimeter' | 'centimeter' | 'meter' | 'kilometer' | 'inch' | 'foot' | 'yard' | 'mile';

interface ConversionRate {
  [key: string]: number;
}

interface LengthConverterToolProps {
  uiConfig?: UIConfig;
}

const LengthConverterTool: React.FC<LengthConverterToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  const [inputValue, setInputValue] = useState<string>('1');
  const [fromUnit, setFromUnit] = useState<LengthUnit>('meter');
  const [toUnit, setToUnit] = useState<LengthUnit>('foot');
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

  // Conversion rates to meters (base unit)
  const conversionToMeters: ConversionRate = {
    millimeter: 0.001,
    centimeter: 0.01,
    meter: 1,
    kilometer: 1000,
    inch: 0.0254,
    foot: 0.3048,
    yard: 0.9144,
    mile: 1609.34,
  };

  const units: LengthUnit[] = ['millimeter', 'centimeter', 'meter', 'kilometer', 'inch', 'foot', 'yard', 'mile'];

  const unitLabels: Record<LengthUnit, string> = {
    millimeter: 'Millimeter (mm)',
    centimeter: 'Centimeter (cm)',
    meter: 'Meter (m)',
    kilometer: 'Kilometer (km)',
    inch: 'Inch (in)',
    foot: 'Foot (ft)',
    yard: 'Yard (yd)',
    mile: 'Mile (mi)',
  };

  useEffect(() => {
    const value = parseFloat(inputValue);
    if (!isNaN(value)) {
      // Convert to meters first, then to target unit
      const inMeters = value * conversionToMeters[fromUnit];
      const converted = inMeters / conversionToMeters[toUnit];
      setResult(converted);
    } else {
      setResult(0);
    }
  }, [inputValue, fromUnit, toUnit]);

  const handleSwapUnits = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  };

  const getFormula = () => {
    const value = parseFloat(inputValue) || 0;
    const fromRate = conversionToMeters[fromUnit];
    const toRate = conversionToMeters[toUnit];
    const ratio = fromRate / toRate;

    return `${value} ${fromUnit} × ${ratio.toFixed(6)} = ${result.toFixed(6)} ${toUnit}`;
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-4xl mx-auto">
        <div className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} rounded-lg shadow-lg p-8`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-lg bg-[#0D9488] flex items-center justify-center">
              <ArrowLeftRight className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{t('tools.lengthConverter.lengthConverter', 'Length Converter')}</h1>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.lengthConverter.convertBetweenDifferentLengthUnits', 'Convert between different length units')}
              </p>
            </div>
          </div>

          {isPrefilled && (
            <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
              <Sparkles className="w-4 h-4 text-[#0D9488]" />
              <span className="text-sm text-[#0D9488] font-medium">{t('tools.lengthConverter.valueLoadedFromAiResponse', 'Value loaded from AI response')}</span>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* From Section */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.lengthConverter.from', 'From')}
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
                placeholder={t('tools.lengthConverter.enterValue', 'Enter value')}
              />
              <select
                value={fromUnit}
                onChange={(e) => setFromUnit(e.target.value as LengthUnit)}
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
                title={t('tools.lengthConverter.swapUnits', 'Swap units')}
              >
                <ArrowLeftRight className="w-5 h-5" />
              </button>
            </div>

            {/* To Section */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.lengthConverter.to', 'To')}
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
                onChange={(e) => setToUnit(e.target.value as LengthUnit)}
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

          {/* Formula Display */}
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} flex items-start gap-3`}>
            <Info className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
            <div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                {t('tools.lengthConverter.conversionFormula', 'Conversion Formula')}
              </p>
              <p className={`text-sm font-mono ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {getFormula()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LengthConverterTool;
