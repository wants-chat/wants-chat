import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy, RefreshCw, Dices, AlertCircle, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';

interface RandomNumberGeneratorToolProps {
  uiConfig?: UIConfig;
}

interface GeneratedNumber {
  number: number;
  index: number;
}

const COLUMNS: ColumnConfig[] = [
  { key: 'index', header: 'Index' },
  { key: 'number', header: 'Number' },
];

export const RandomNumberGeneratorTool = ({ uiConfig }: RandomNumberGeneratorToolProps) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [minValue, setMinValue] = useState(1);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);
  const [maxValue, setMaxValue] = useState(100);
  const [count, setCount] = useState(1);
  const [allowDuplicates, setAllowDuplicates] = useState(true);
  const [sortResults, setSortResults] = useState(false);
  const [results, setResults] = useState<number[]>([]);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const generateRandomNumbers = (): number[] => {
    setError('');

    // Validation
    if (minValue >= maxValue) {
      setError('Minimum value must be less than maximum value');
      return [];
    }

    const range = maxValue - minValue + 1;

    if (!allowDuplicates && count > range) {
      setError(`Cannot generate ${count} unique numbers in range ${minValue}-${maxValue} (only ${range} possible values)`);
      return [];
    }

    if (count < 1 || count > 10000) {
      setError('Count must be between 1 and 10,000');
      return [];
    }

    const numbers: number[] = [];

    if (allowDuplicates) {
      // Generate with duplicates allowed
      for (let i = 0; i < count; i++) {
        const randomNum = Math.floor(Math.random() * range) + minValue;
        numbers.push(randomNum);
      }
    } else {
      // Generate without duplicates using Fisher-Yates shuffle
      const available = Array.from({ length: range }, (_, i) => i + minValue);

      for (let i = 0; i < count; i++) {
        const randomIndex = Math.floor(Math.random() * (available.length - i));
        [available[randomIndex], available[available.length - 1 - i]] =
          [available[available.length - 1 - i], available[randomIndex]];
      }

      numbers.push(...available.slice(-count));
    }

    // Sort if requested
    if (sortResults) {
      numbers.sort((a, b) => a - b);
    }

    return numbers;
  };

  const handleGenerate = () => {
    const nums = generateRandomNumbers();
    if (nums.length > 0) {
      setResults(nums);

      // Call onSaveCallback if editing from gallery
      const params = uiConfig?.params as Record<string, any>;
      if (params?.onSaveCallback && typeof params.onSaveCallback === 'function') {
        params.onSaveCallback();
      }
    }
  };

  const handleCopy = async () => {
    if (results.length === 0) return;
    try {
      await navigator.clipboard.writeText(results.join(', '));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleCopyAsArray = async () => {
    if (results.length === 0) return;
    try {
      await navigator.clipboard.writeText(`[${results.join(', ')}]`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleCopyAsNewlines = async () => {
    if (results.length === 0) return;
    try {
      await navigator.clipboard.writeText(results.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleClear = () => {
    setResults([]);
    setError('');
  };

  const getExportData = (): GeneratedNumber[] => {
    return results.map((number, index) => ({
      number,
      index: index + 1,
    }));
  };

  const handleExportCSV = () => {
    exportToCSV(getExportData(), COLUMNS, { filename: 'random-numbers' });
  };

  const handleExportExcel = () => {
    exportToExcel(getExportData(), COLUMNS, { filename: 'random-numbers' });
  };

  const handleExportJSON = () => {
    exportToJSON(getExportData(), { filename: 'random-numbers' });
  };

  const handleExportPDF = async () => {
    await exportToPDF(getExportData(), COLUMNS, {
      filename: 'random-numbers',
      title: 'Random Numbers',
      subtitle: `Generated ${results.length} random numbers between ${minValue} and ${maxValue}`,
    });
  };

  const handlePrint = () => {
    printData(getExportData(), COLUMNS, { title: 'Random Numbers' });
  };

  const handleCopyToClipboard = async () => {
    return await copyUtil(getExportData(), COLUMNS, 'tab');
  };

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      // Random number generator can prefill min/max if specified
      if (params.numbers && params.numbers.length >= 2) {
        setMinValue(params.numbers[0]);
        setMaxValue(params.numbers[1]);
        setIsPrefilled(true);
      } else if (params.amount) {
        setMaxValue(params.amount);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Handle prefill from gallery edit (uiConfig.params)
  useEffect(() => {
    const params = uiConfig?.params as Record<string, any>;
    if (params?.isEditFromGallery) {
      // Restore form state from saved params
      if (params.minValue !== undefined) setMinValue(params.minValue);
      if (params.maxValue !== undefined) setMaxValue(params.maxValue);
      if (params.count !== undefined) setCount(params.count);
      if (params.allowDuplicates !== undefined) setAllowDuplicates(params.allowDuplicates);
      if (params.sortResults !== undefined) setSortResults(params.sortResults);
      if (params.results) setResults(params.results);
      setIsEditFromGallery(true);
    }
  }, [uiConfig?.params]);

  const sum = results.reduce((acc, num) => acc + num, 0);
  const average = results.length > 0 ? (sum / results.length).toFixed(2) : 0;
  const min = results.length > 0 ? Math.min(...results) : 0;
  const max = results.length > 0 ? Math.max(...results) : 0;

  return (
    <div className={`max-w-4xl mx-auto p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      <h2 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        {t('tools.randomNumberGenerator.randomNumberGenerator', 'Random Number Generator')}
      </h2>

      <div className="space-y-6">
        {/* Input Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Min Value */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
              Minimum Value
              {isPrefilled && (
                <span className="ml-2 inline-flex items-center gap-1 text-xs text-[#0D9488]">
                  <Sparkles className="w-3 h-3" />
                  {t('tools.randomNumberGenerator.prefilledFromAi', 'Prefilled from AI')}
                </span>
              )}
            </label>
            <input
              type="number"
              value={minValue}
              onChange={(e) => {
                setMinValue(Number(e.target.value));
                setError('');
              }}
              className={`w-full px-4 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
            />
          </div>

          {/* Max Value */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.randomNumberGenerator.maximumValue', 'Maximum Value')}
            </label>
            <input
              type="number"
              value={maxValue}
              onChange={(e) => {
                setMaxValue(Number(e.target.value));
                setError('');
              }}
              className={`w-full px-4 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
            />
          </div>

          {/* Count */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.randomNumberGenerator.howManyNumbers', 'How Many Numbers')}
            </label>
            <input
              type="number"
              min="1"
              max="10000"
              value={count}
              onChange={(e) => {
                setCount(Number(e.target.value));
                setError('');
              }}
              className={`w-full px-4 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
            />
          </div>
        </div>

        {/* Options */}
        <div className="space-y-3">
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
            Options
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={allowDuplicates}
                onChange={(e) => setAllowDuplicates(e.target.checked)}
                className="w-5 h-5 rounded accent-[#0D9488] cursor-pointer"
              />
              <span className={theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}>
                {t('tools.randomNumberGenerator.allowDuplicateNumbers', 'Allow duplicate numbers')}
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={sortResults}
                onChange={(e) => setSortResults(e.target.checked)}
                className="w-5 h-5 rounded accent-[#0D9488] cursor-pointer"
              />
              <span className={theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}>
                {t('tools.randomNumberGenerator.sortResultsAscending', 'Sort results (ascending)')}
              </span>
            </label>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-800">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleGenerate}
            className="flex items-center gap-2 px-6 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors font-medium"
          >
            <RefreshCw className="w-4 h-4" />
            {t('tools.randomNumberGenerator.generateNumbers', 'Generate Numbers')}
          </button>
          <button
            onClick={handleClear}
            className={`px-6 py-2 rounded-lg transition-colors font-medium ${
              theme === 'dark'
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            {t('tools.randomNumberGenerator.clear', 'Clear')}
          </button>
        </div>

        {/* Results Display */}
        {results.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                Generated Numbers ({results.length})
              </label>
              <div className="flex gap-2">
                {results.length > 0 && (
                  <ExportDropdown
                    onExportCSV={handleExportCSV}
                    onExportExcel={handleExportExcel}
                    onExportJSON={handleExportJSON}
                    onExportPDF={handleExportPDF}
                    onPrint={handlePrint}
                    onCopyToClipboard={handleCopyToClipboard}
                    showImport={false}
                    theme={theme}
                  />
                )}
                <button
                  onClick={handleCopy}
                  className={`flex items-center gap-2 px-3 py-1 rounded-lg transition-colors text-sm ${
                    copied
                      ? 'bg-green-500 text-white'
                      : theme === 'dark'
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  <Copy className="w-4 h-4" />
                  {copied ? t('tools.randomNumberGenerator.copied', 'Copied!') : t('tools.randomNumberGenerator.copy', 'Copy')}
                </button>
              </div>
            </div>

            {/* Results Grid */}
            <div className={`p-4 rounded-lg border ${
              theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'
            }`}>
              <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto">
                {results.map((num, index) => (
                  <span
                    key={index}
                    className={`px-3 py-1 rounded-lg font-mono text-sm ${
                      theme === 'dark'
                        ? 'bg-gray-600 text-white'
                        : 'bg-white text-gray-900 border border-gray-300'
                    }`}
                  >
                    {num}
                  </span>
                ))}
              </div>
            </div>

            {/* Copy Format Options */}
            <div className="flex flex-wrap gap-2 mt-3">
              <button
                onClick={handleCopyAsArray}
                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                  theme === 'dark'
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {t('tools.randomNumberGenerator.copyAsArray', 'Copy as Array')}
              </button>
              <button
                onClick={handleCopyAsNewlines}
                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                  theme === 'dark'
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {t('tools.randomNumberGenerator.copyAsList', 'Copy as List')}
              </button>
            </div>

            {/* Statistics */}
            <div className={`mt-4 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <h3 className={`text-sm font-semibold mb-3 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.randomNumberGenerator.statistics', 'Statistics')}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.randomNumberGenerator.sum', 'Sum')}</div>
                  <div className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {sum.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.randomNumberGenerator.average', 'Average')}</div>
                  <div className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {average}
                  </div>
                </div>
                <div>
                  <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.randomNumberGenerator.minimum', 'Minimum')}</div>
                  <div className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {min}
                  </div>
                </div>
                <div>
                  <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.randomNumberGenerator.maximum', 'Maximum')}</div>
                  <div className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {max}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Presets */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.randomNumberGenerator.quickPresets', 'Quick Presets')}
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => { setMinValue(1); setMaxValue(6); setCount(1); }}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <Dices className="w-4 h-4 inline mr-1" />
              {t('tools.randomNumberGenerator.dice16', 'Dice (1-6)')}
            </button>
            <button
              onClick={() => { setMinValue(1); setMaxValue(100); setCount(1); }}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {t('tools.randomNumberGenerator.percentage1100', 'Percentage (1-100)')}
            </button>
            <button
              onClick={() => { setMinValue(1); setMaxValue(49); setCount(6); setAllowDuplicates(false); setSortResults(true); }}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {t('tools.randomNumberGenerator.lottery6Of49', 'Lottery (6 of 49)')}
            </button>
            <button
              onClick={() => { setMinValue(0); setMaxValue(1); setCount(10); }}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {t('tools.randomNumberGenerator.coinFlips01', 'Coin Flips (0-1)')}
            </button>
          </div>
        </div>

        {/* Info Section */}
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <h3 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.randomNumberGenerator.aboutRandomNumberGeneration', 'About Random Number Generation')}
          </h3>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            {t('tools.randomNumberGenerator.thisToolUsesJavascriptS', 'This tool uses JavaScript\'s Math.random() function to generate pseudo-random numbers. For cryptographic purposes or high-security applications, use a cryptographically secure random number generator instead.')}
          </p>
        </div>
      </div>
    </div>
  );
};
