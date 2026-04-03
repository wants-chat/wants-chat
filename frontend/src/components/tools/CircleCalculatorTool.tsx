import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Circle, Info, Copy, Check, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface CircleCalculatorToolProps {
  uiConfig?: UIConfig;
}

type CalculationMode = 'radius' | 'diameter' | 'circumference' | 'area';

interface CalculationResults {
  radius: number;
  diameter: number;
  circumference: number;
  area: number;
}

const CircleCalculatorTool: React.FC<CircleCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  const [inputValue, setInputValue] = useState<string>('5');
  const [mode, setMode] = useState<CalculationMode>('radius');
  const [results, setResults] = useState<CalculationResults | null>(null);
  const [copied, setCopied] = useState<string>('');
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

  const calculateFromRadius = (r: number): CalculationResults => ({
    radius: r,
    diameter: r * 2,
    circumference: 2 * Math.PI * r,
    area: Math.PI * r * r,
  });

  const calculateFromDiameter = (d: number): CalculationResults => {
    const r = d / 2;
    return calculateFromRadius(r);
  };

  const calculateFromCircumference = (c: number): CalculationResults => {
    const r = c / (2 * Math.PI);
    return calculateFromRadius(r);
  };

  const calculateFromArea = (a: number): CalculationResults => {
    const r = Math.sqrt(a / Math.PI);
    return calculateFromRadius(r);
  };

  useEffect(() => {
    const value = parseFloat(inputValue);
    if (isNaN(value) || value <= 0) {
      setResults(null);
      return;
    }

    switch (mode) {
      case 'radius':
        setResults(calculateFromRadius(value));
        break;
      case 'diameter':
        setResults(calculateFromDiameter(value));
        break;
      case 'circumference':
        setResults(calculateFromCircumference(value));
        break;
      case 'area':
        setResults(calculateFromArea(value));
        break;
    }
  }, [inputValue, mode]);

  const formatNumber = (num: number): string => {
    return num.toFixed(6).replace(/\.?0+$/, '');
  };

  const copyToClipboard = (value: string, label: string) => {
    navigator.clipboard.writeText(value);
    setCopied(label);
    setTimeout(() => setCopied(''), 2000);
  };

  const modes: { key: CalculationMode; label: string; symbol: string }[] = [
    { key: 'radius', label: 'Radius', symbol: 'r' },
    { key: 'diameter', label: 'Diameter', symbol: 'd' },
    { key: 'circumference', label: 'Circumference', symbol: 'C' },
    { key: 'area', label: 'Area', symbol: 'A' },
  ];

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-4xl mx-auto">
        <div className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} rounded-lg shadow-lg p-8`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-lg bg-[#0D9488] flex items-center justify-center">
              <Circle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{t('tools.circleCalculator.circleCalculator', 'Circle Calculator')}</h1>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.circleCalculator.calculateAreaCircumferenceAndDiameter', 'Calculate area, circumference, and diameter from any circle property')}
              </p>
            </div>
          </div>

          {isPrefilled && (
            <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
              <Sparkles className="w-4 h-4 text-[#0D9488]" />
              <span className="text-sm text-[#0D9488] font-medium">{t('tools.circleCalculator.valueLoadedFromAiResponse', 'Value loaded from AI response')}</span>
            </div>
          )}

          {/* Mode Selection */}
          <div className="mb-6">
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.circleCalculator.calculateFrom', 'Calculate From')}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {modes.map((m) => (
                <button
                  key={m.key}
                  onClick={() => setMode(m.key)}
                  className={`px-4 py-3 rounded-lg border transition-colors ${
                    mode === m.key
                      ? 'bg-[#0D9488] text-white border-[#0D9488]'
                      : isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-sm font-medium">{m.label}</div>
                  <div className="text-xs opacity-75">({m.symbol})</div>
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="mb-6">
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Enter {modes.find((m) => m.key === mode)?.label}
            </label>
            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              min="0"
              step="any"
              className={`w-full px-4 py-3 rounded-lg border ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-[#0D9488] font-mono text-lg`}
              placeholder={t('tools.circleCalculator.enterValue', 'Enter value')}
            />
          </div>

          {/* Results */}
          {results && (
            <div className="mb-6">
              <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                {t('tools.circleCalculator.results', 'Results')}
              </h3>
              <div className="grid gap-4">
                {/* Radius */}
                <div
                  className={`p-4 rounded-lg border ${
                    mode === 'radius' ? 'ring-2 ring-[#0D9488]' : ''
                  } ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.circleCalculator.radiusR', 'Radius (r)')}
                    </span>
                    <button
                      onClick={() => copyToClipboard(formatNumber(results.radius), 'radius')}
                      className={`p-1.5 rounded ${
                        copied === 'radius' ? 'text-green-500' : isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {copied === 'radius' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="font-mono text-xl text-[#0D9488] font-bold">
                    {formatNumber(results.radius)}
                  </div>
                </div>

                {/* Diameter */}
                <div
                  className={`p-4 rounded-lg border ${
                    mode === 'diameter' ? 'ring-2 ring-[#0D9488]' : ''
                  } ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Diameter (d = 2r)
                    </span>
                    <button
                      onClick={() => copyToClipboard(formatNumber(results.diameter), 'diameter')}
                      className={`p-1.5 rounded ${
                        copied === 'diameter' ? 'text-green-500' : isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {copied === 'diameter' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="font-mono text-xl text-[#0D9488] font-bold">
                    {formatNumber(results.diameter)}
                  </div>
                </div>

                {/* Circumference */}
                <div
                  className={`p-4 rounded-lg border ${
                    mode === 'circumference' ? 'ring-2 ring-[#0D9488]' : ''
                  } ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Circumference (C = 2πr)
                    </span>
                    <button
                      onClick={() => copyToClipboard(formatNumber(results.circumference), 'circumference')}
                      className={`p-1.5 rounded ${
                        copied === 'circumference' ? 'text-green-500' : isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {copied === 'circumference' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="font-mono text-xl text-[#0D9488] font-bold">
                    {formatNumber(results.circumference)}
                  </div>
                </div>

                {/* Area */}
                <div
                  className={`p-4 rounded-lg border ${
                    mode === 'area' ? 'ring-2 ring-[#0D9488]' : ''
                  } ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Area (A = πr²)
                    </span>
                    <button
                      onClick={() => copyToClipboard(formatNumber(results.area), 'area')}
                      className={`p-1.5 rounded ${
                        copied === 'area' ? 'text-green-500' : isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {copied === 'area' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="font-mono text-xl text-[#0D9488] font-bold">
                    {formatNumber(results.area)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Visual Representation */}
          {results && (
            <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} mb-6`}>
              <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                {t('tools.circleCalculator.visualRepresentation', 'Visual Representation')}
              </h3>
              <div className="flex justify-center">
                <div className="relative">
                  <svg width="200" height="200" viewBox="0 0 200 200">
                    {/* Circle */}
                    <circle
                      cx="100"
                      cy="100"
                      r="80"
                      fill={isDarkMode ? 'rgba(13, 148, 136, 0.2)' : 'rgba(13, 148, 136, 0.1)'}
                      stroke="#0D9488"
                      strokeWidth="2"
                    />
                    {/* Radius line */}
                    <line x1="100" y1="100" x2="180" y2="100" stroke="#0D9488" strokeWidth="2" strokeDasharray="5,5" />
                    {/* Center dot */}
                    <circle cx="100" cy="100" r="4" fill="#0D9488" />
                    {/* Radius label */}
                    <text x="140" y="95" fill={isDarkMode ? '#fff' : '#333'} fontSize="12" textAnchor="middle">
                      r = {formatNumber(results.radius).substring(0, 6)}
                    </text>
                  </svg>
                </div>
              </div>
            </div>
          )}

          {/* Formulas */}
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} flex items-start gap-3`}>
            <Info className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <p className="mb-2">
                <strong>{t('tools.circleCalculator.formulas', 'Formulas:')}</strong>
              </p>
              <p className="mb-1 font-mono">Diameter: d = 2r</p>
              <p className="mb-1 font-mono">Circumference: C = 2πr = πd</p>
              <p className="mb-1 font-mono">Area: A = πr² = πd²/4</p>
              <p className="mt-2 text-xs">
                {t('tools.circleCalculator.wherePi314159265359', 'Where π (pi) ≈ 3.14159265359')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CircleCalculatorTool;
