import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeftRight, Thermometer, Info, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

type TemperatureUnit = 'celsius' | 'fahrenheit' | 'kelvin';

interface TemperatureConverterToolProps {
  uiConfig?: UIConfig;
}

const TemperatureConverterTool: React.FC<TemperatureConverterToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  const [inputValue, setInputValue] = useState<string>('0');
  const [fromUnit, setFromUnit] = useState<TemperatureUnit>('celsius');
  const [toUnit, setToUnit] = useState<TemperatureUnit>('fahrenheit');
  const [result, setResult] = useState<number>(0);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;

      // Set value from prefill data
      if (params.amount !== undefined) {
        setInputValue(String(params.amount));
        setIsPrefilled(true);
      }
      // Or try text/content
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

  const units: TemperatureUnit[] = ['celsius', 'fahrenheit', 'kelvin'];

  const unitLabels: Record<TemperatureUnit, string> = {
    celsius: 'Celsius (°C)',
    fahrenheit: 'Fahrenheit (°F)',
    kelvin: 'Kelvin (K)',
  };

  const convertTemperature = (value: number, from: TemperatureUnit, to: TemperatureUnit): number => {
    if (from === to) return value;

    // Convert to Celsius first
    let celsius: number;
    switch (from) {
      case 'celsius':
        celsius = value;
        break;
      case 'fahrenheit':
        celsius = (value - 32) * (5 / 9);
        break;
      case 'kelvin':
        celsius = value - 273.15;
        break;
    }

    // Convert from Celsius to target unit
    switch (to) {
      case 'celsius':
        return celsius;
      case 'fahrenheit':
        return celsius * (9 / 5) + 32;
      case 'kelvin':
        return celsius + 273.15;
    }
  };

  useEffect(() => {
    const value = parseFloat(inputValue);
    if (!isNaN(value)) {
      const converted = convertTemperature(value, fromUnit, toUnit);
      setResult(converted);
    } else {
      setResult(0);
    }
  }, [inputValue, fromUnit, toUnit]);

  const handleSwapUnits = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  };

  const getFormula = (): string => {
    const value = parseFloat(inputValue) || 0;

    if (fromUnit === 'celsius' && toUnit === 'fahrenheit') {
      return `(${value}°C × 9/5) + 32 = ${result.toFixed(2)}°F`;
    } else if (fromUnit === 'fahrenheit' && toUnit === 'celsius') {
      return `(${value}°F - 32) × 5/9 = ${result.toFixed(2)}°C`;
    } else if (fromUnit === 'celsius' && toUnit === 'kelvin') {
      return `${value}°C + 273.15 = ${result.toFixed(2)}K`;
    } else if (fromUnit === 'kelvin' && toUnit === 'celsius') {
      return `${value}K - 273.15 = ${result.toFixed(2)}°C`;
    } else if (fromUnit === 'fahrenheit' && toUnit === 'kelvin') {
      return `(${value}°F - 32) × 5/9 + 273.15 = ${result.toFixed(2)}K`;
    } else if (fromUnit === 'kelvin' && toUnit === 'fahrenheit') {
      return `(${value}K - 273.15) × 9/5 + 32 = ${result.toFixed(2)}°F`;
    }
    return `${value} = ${result.toFixed(2)}`;
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-4xl mx-auto">
        <div className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} rounded-lg shadow-lg p-8`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-lg bg-[#0D9488] flex items-center justify-center">
              <Thermometer className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{t('tools.temperatureConverter.temperatureConverter', 'Temperature Converter')}</h1>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.temperatureConverter.convertBetweenCelsiusFahrenheitAnd', 'Convert between Celsius, Fahrenheit, and Kelvin')}
              </p>
            </div>
          </div>

          {isPrefilled && (
            <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
              <Sparkles className="w-4 h-4 text-[#0D9488]" />
              <span className="text-sm text-[#0D9488] font-medium">{t('tools.temperatureConverter.valueLoadedFromAiResponse', 'Value loaded from AI response')}</span>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* From Section */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.temperatureConverter.from', 'From')}
              </label>
              <input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                step="0.01"
                className={`w-full px-4 py-3 rounded-lg border ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488] mb-3`}
                placeholder={t('tools.temperatureConverter.enterTemperature', 'Enter temperature')}
              />
              <select
                value={fromUnit}
                onChange={(e) => setFromUnit(e.target.value as TemperatureUnit)}
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
                title={t('tools.temperatureConverter.swapUnits', 'Swap units')}
              >
                <ArrowLeftRight className="w-5 h-5" />
              </button>
            </div>

            {/* To Section */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.temperatureConverter.to', 'To')}
              </label>
              <div
                className={`w-full px-4 py-3 rounded-lg border ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-gray-100 border-gray-300 text-gray-900'
                } mb-3 font-semibold text-lg`}
              >
                {result.toFixed(2)}
              </div>
              <select
                value={toUnit}
                onChange={(e) => setToUnit(e.target.value as TemperatureUnit)}
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
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} mb-4 flex items-start gap-3`}>
            <Info className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
            <div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                {t('tools.temperatureConverter.conversionFormula', 'Conversion Formula')}
              </p>
              <p className={`text-sm font-mono ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {getFormula()}
              </p>
            </div>
          </div>

          {/* Reference Points */}
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              {t('tools.temperatureConverter.commonReferencePoints', 'Common Reference Points')}
            </p>
            <div className={`grid grid-cols-2 gap-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <div>Water freezes: 0°C / 32°F / 273.15K</div>
              <div>Water boils: 100°C / 212°F / 373.15K</div>
              <div>Absolute zero: -273.15°C / -459.67°F / 0K</div>
              <div>Room temperature: ~20°C / ~68°F / ~293K</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemperatureConverterTool;
