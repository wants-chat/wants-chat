import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Hash, ArrowRightLeft, Copy, Check, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface RomanNumeralsToolProps {
  uiConfig?: UIConfig;
}

export const RomanNumeralsTool: React.FC<RomanNumeralsToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  const [mode, setMode] = useState<'toRoman' | 'toNumber'>('toRoman');
  const [input, setInput] = useState('');
  const [copied, setCopied] = useState(false);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.text || params.content) {
        setInput(params.text || params.content || '');
        setIsPrefilled(true);
      }
      if (params.amount) {
        setInput(String(params.amount));
        setMode('toRoman');
        setIsPrefilled(true);
      }
      if (params.formData) {
        if (params.formData.input) setInput(params.formData.input);
        if (params.formData.mode) setMode(params.formData.mode as 'toRoman' | 'toNumber');
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const romanNumerals: [number, string][] = [
    [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
    [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
    [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']
  ];

  const toRoman = (num: number): string => {
    if (num <= 0 || num > 3999) return 'Invalid (1-3999 only)';

    let result = '';
    let remaining = num;

    for (const [value, symbol] of romanNumerals) {
      while (remaining >= value) {
        result += symbol;
        remaining -= value;
      }
    }

    return result;
  };

  const toNumber = (roman: string): number | string => {
    const input = roman.toUpperCase().trim();
    if (!input) return '';

    const romanValues: Record<string, number> = {
      I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000
    };

    // Validate input
    if (!/^[IVXLCDM]+$/.test(input)) {
      return 'Invalid characters';
    }

    let result = 0;
    let prev = 0;

    for (let i = input.length - 1; i >= 0; i--) {
      const current = romanValues[input[i]];
      if (current < prev) {
        result -= current;
      } else {
        result += current;
      }
      prev = current;
    }

    // Validate by converting back
    if (toRoman(result) !== input) {
      return 'Invalid numeral format';
    }

    return result;
  };

  const result = useMemo(() => {
    if (!input.trim()) return '';

    if (mode === 'toRoman') {
      const num = parseInt(input, 10);
      if (isNaN(num)) return 'Enter a valid number';
      return toRoman(num);
    } else {
      return toNumber(input);
    }
  }, [input, mode]);

  const handleCopy = () => {
    navigator.clipboard.writeText(String(result));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSwapMode = () => {
    setMode(mode === 'toRoman' ? 'toNumber' : 'toRoman');
    setInput('');
  };

  const examples = mode === 'toRoman'
    ? ['1', '4', '9', '42', '100', '500', '1999', '2024', '3999']
    : ['I', 'IV', 'IX', 'XLII', 'C', 'D', 'MCMXCIX', 'MMXXIV', 'MMMCMXCIX'];

  const referenceTable = [
    { numeral: 'I', value: 1 },
    { numeral: 'V', value: 5 },
    { numeral: 'X', value: 10 },
    { numeral: 'L', value: 50 },
    { numeral: 'C', value: 100 },
    { numeral: 'D', value: 500 },
    { numeral: 'M', value: 1000 },
  ];

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-amber-900/20' : 'bg-gradient-to-r from-white to-amber-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 rounded-lg">
            <Hash className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.romanNumerals.romanNumeralsConverter', 'Roman Numerals Converter')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.romanNumerals.convertBetweenNumbersAndRoman', 'Convert between numbers and Roman numerals')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.romanNumerals.contentLoadedFromYourConversation', 'Content loaded from your conversation')}</span>
          </div>
        )}

        {/* Mode Toggle */}
        <div className="flex items-center justify-center gap-4">
          <span className={`text-sm font-medium ${mode === 'toRoman' ? isDark ? 'text-amber-400' : 'text-amber-600' : isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {t('tools.romanNumerals.numberRoman', 'Number → Roman')}
          </span>
          <button
            onClick={handleSwapMode}
            className={`p-2 rounded-lg transition-colors ${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            <ArrowRightLeft className={`w-5 h-5 ${isDark ? 'text-gray-300' : 'text-gray-600'}`} />
          </button>
          <span className={`text-sm font-medium ${mode === 'toNumber' ? isDark ? 'text-amber-400' : 'text-amber-600' : isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {t('tools.romanNumerals.romanNumber', 'Roman → Number')}
          </span>
        </div>

        {/* Input */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            Enter {mode === 'toRoman' ? t('tools.romanNumerals.number13999', 'Number (1-3999)') : t('tools.romanNumerals.romanNumeral', 'Roman Numeral')}
          </label>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === 'toRoman' ? 'e.g., 2024' : t('tools.romanNumerals.eGMmxxiv', 'e.g., MMXXIV')}
            className={`w-full px-4 py-3 rounded-lg border text-2xl text-center font-mono ${
              isDark
                ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:ring-2 focus:ring-amber-500 focus:border-transparent`}
          />
        </div>

        {/* Quick Examples */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.romanNumerals.examples', 'Examples')}
          </label>
          <div className="flex flex-wrap gap-2">
            {examples.map((ex) => (
              <button
                key={ex}
                onClick={() => setInput(ex)}
                className={`px-3 py-1.5 text-sm rounded-lg font-mono transition-colors ${
                  isDark
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {ex}
              </button>
            ))}
          </div>
        </div>

        {/* Result */}
        <div className={`p-6 rounded-xl text-center ${isDark ? 'bg-amber-900/20 border-amber-800' : 'bg-amber-50 border-amber-100'} border`}>
          <div className={`text-sm font-medium mb-2 ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>
            {mode === 'toRoman' ? t('tools.romanNumerals.romanNumeral2', 'Roman Numeral') : 'Number'}
          </div>
          <div className={`text-5xl font-bold tracking-wider ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {result || '...'}
          </div>
          {result && typeof result !== 'string' || (typeof result === 'string' && !result.includes('Invalid')) ? (
            <button
              onClick={handleCopy}
              className={`mt-4 px-6 py-2 rounded-lg flex items-center gap-2 mx-auto transition-colors ${
                copied
                  ? 'bg-green-500 text-white'
                  : 'bg-amber-500 hover:bg-amber-600 text-white'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? t('tools.romanNumerals.copied', 'Copied!') : t('tools.romanNumerals.copyResult', 'Copy Result')}
            </button>
          ) : null}
        </div>

        {/* Reference Table */}
        <div className="space-y-3">
          <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.romanNumerals.referenceChart', 'Reference Chart')}
          </h4>
          <div className="grid grid-cols-7 gap-2">
            {referenceTable.map((item) => (
              <div
                key={item.numeral}
                className={`p-3 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}
              >
                <div className={`text-xl font-bold text-amber-500`}>{item.numeral}</div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Special Numbers */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.romanNumerals.commonExamples', 'Common Examples')}
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { num: 4, roman: 'IV' },
              { num: 9, roman: 'IX' },
              { num: 40, roman: 'XL' },
              { num: 90, roman: 'XC' },
              { num: 400, roman: 'CD' },
              { num: 900, roman: 'CM' },
              { num: 1999, roman: 'MCMXCIX' },
              { num: 2024, roman: 'MMXXIV' },
            ].map((item) => (
              <div
                key={item.num}
                onClick={() => setInput(mode === 'toRoman' ? String(item.num) : item.roman)}
                className={`p-2 rounded-lg cursor-pointer transition-colors ${
                  isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-100'
                }`}
              >
                <span className={`font-mono ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {item.num} = {item.roman}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <strong>{t('tools.romanNumerals.rules', 'Rules:')}</strong> Smaller numerals before larger ones are subtracted (IV = 4).
            Range is 1-3999 as Romans didn't have a symbol for zero or numbers above 3999.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RomanNumeralsTool;
