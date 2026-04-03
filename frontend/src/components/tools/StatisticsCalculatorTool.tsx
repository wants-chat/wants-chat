import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart3, Copy, Check, Trash2, Plus, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface StatisticsCalculatorToolProps {
  uiConfig?: UIConfig;
}

export const StatisticsCalculatorTool: React.FC<StatisticsCalculatorToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [numbers, setNumbers] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.numbers && params.numbers.length > 0) {
        setNumbers(params.numbers.join(', '));
        setIsPrefilled(true);
      } else if (params.text || params.content) {
        setNumbers(params.text || params.content || '');
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const parsedNumbers = useMemo(() => {
    return numbers
      .split(/[\s,;]+/)
      .map(n => parseFloat(n.trim()))
      .filter(n => !isNaN(n));
  }, [numbers]);

  const statistics = useMemo(() => {
    if (parsedNumbers.length === 0) return null;

    const sorted = [...parsedNumbers].sort((a, b) => a - b);
    const n = sorted.length;
    const sum = sorted.reduce((a, b) => a + b, 0);
    const mean = sum / n;

    // Median
    const median = n % 2 === 0
      ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
      : sorted[Math.floor(n / 2)];

    // Mode
    const frequency: Record<number, number> = {};
    let maxFreq = 0;
    sorted.forEach(num => {
      frequency[num] = (frequency[num] || 0) + 1;
      maxFreq = Math.max(maxFreq, frequency[num]);
    });
    const modes = Object.entries(frequency)
      .filter(([, freq]) => freq === maxFreq && maxFreq > 1)
      .map(([num]) => parseFloat(num));

    // Variance & Standard Deviation
    const variance = sorted.reduce((acc, num) => acc + Math.pow(num - mean, 2), 0) / n;
    const stdDev = Math.sqrt(variance);

    // Range
    const range = sorted[n - 1] - sorted[0];

    // Quartiles
    const q1Index = Math.floor(n * 0.25);
    const q3Index = Math.floor(n * 0.75);
    const q1 = sorted[q1Index];
    const q3 = sorted[q3Index];
    const iqr = q3 - q1;

    return {
      count: n,
      sum,
      mean,
      median,
      modes: modes.length > 0 ? modes : null,
      min: sorted[0],
      max: sorted[n - 1],
      range,
      variance,
      stdDev,
      q1,
      q3,
      iqr,
    };
  }, [parsedNumbers]);

  const handleCopy = () => {
    if (!statistics) return;
    const text = Object.entries(statistics)
      .map(([key, value]) => {
        if (key === 'modes') {
          return `${key}: ${value ? (value as number[]).join(', ') : 'None'}`;
        }
        return `${key}: ${typeof value === 'number' ? value.toFixed(4) : value}`;
      })
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sampleDatasets = [
    { label: 'Test Scores', data: '85, 90, 78, 92, 88, 76, 95, 82, 89, 91' },
    { label: 'Temperatures', data: '72, 75, 68, 70, 73, 71, 69, 74, 76, 72' },
    { label: 'Sales Data', data: '120, 135, 142, 128, 156, 143, 138, 145, 152, 149' },
  ];

  const formatNumber = (num: number) => {
    return Number.isInteger(num) ? num.toString() : num.toFixed(4);
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-indigo-900/20' : 'bg-gradient-to-r from-white to-indigo-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-lg">
            <BarChart3 className="w-5 h-5 text-indigo-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.statisticsCalculator.statisticsCalculator', 'Statistics Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.statisticsCalculator.calculateMeanMedianModeAnd', 'Calculate mean, median, mode, and more')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.statisticsCalculator.contentLoadedFromYourConversation', 'Content loaded from your conversation')}</span>
          </div>
        )}

        {/* Input */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.statisticsCalculator.enterNumbersCommaSpaceOr', 'Enter Numbers (comma, space, or newline separated)')}
          </label>
          <textarea
            value={numbers}
            onChange={(e) => setNumbers(e.target.value)}
            placeholder={t('tools.statisticsCalculator.enterNumbers102030', 'Enter numbers: 10, 20, 30, 40, 50...')}
            rows={4}
            className={`w-full px-4 py-3 rounded-lg border resize-none font-mono ${
              isDark
                ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
          />
          <div className="flex justify-between items-center">
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {parsedNumbers.length} valid numbers
            </span>
            <button
              onClick={() => setNumbers('')}
              className={`text-sm flex items-center gap-1 ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Trash2 className="w-4 h-4" />
              {t('tools.statisticsCalculator.clear', 'Clear')}
            </button>
          </div>
        </div>

        {/* Sample Datasets */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.statisticsCalculator.trySampleData', 'Try Sample Data')}
          </label>
          <div className="flex flex-wrap gap-2">
            {sampleDatasets.map((dataset) => (
              <button
                key={dataset.label}
                onClick={() => setNumbers(dataset.data)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  isDark
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {dataset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {statistics && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.statisticsCalculator.statisticalAnalysis', 'Statistical Analysis')}
              </h4>
              <button
                onClick={handleCopy}
                className={`px-3 py-1.5 text-sm rounded-lg flex items-center gap-2 transition-colors ${
                  copied
                    ? 'bg-green-500 text-white'
                    : isDark
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? t('tools.statisticsCalculator.copied', 'Copied!') : t('tools.statisticsCalculator.copyAll', 'Copy All')}
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {/* Central Tendency */}
              <div className={`p-4 rounded-lg ${isDark ? 'bg-indigo-900/20 border-indigo-800' : 'bg-indigo-50 border-indigo-100'} border`}>
                <div className={`text-sm ${isDark ? 'text-indigo-300' : 'text-indigo-600'}`}>{t('tools.statisticsCalculator.meanAverage', 'Mean (Average)')}</div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {formatNumber(statistics.mean)}
                </div>
              </div>

              <div className={`p-4 rounded-lg ${isDark ? 'bg-purple-900/20 border-purple-800' : 'bg-purple-50 border-purple-100'} border`}>
                <div className={`text-sm ${isDark ? 'text-purple-300' : 'text-purple-600'}`}>{t('tools.statisticsCalculator.median', 'Median')}</div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {formatNumber(statistics.median)}
                </div>
              </div>

              <div className={`p-4 rounded-lg ${isDark ? 'bg-pink-900/20 border-pink-800' : 'bg-pink-50 border-pink-100'} border`}>
                <div className={`text-sm ${isDark ? 'text-pink-300' : 'text-pink-600'}`}>{t('tools.statisticsCalculator.mode', 'Mode')}</div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {statistics.modes ? statistics.modes.join(', ') : 'None'}
                </div>
              </div>

              {/* Spread */}
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.statisticsCalculator.standardDeviation', 'Standard Deviation')}</div>
                <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {formatNumber(statistics.stdDev)}
                </div>
              </div>

              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.statisticsCalculator.variance', 'Variance')}</div>
                <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {formatNumber(statistics.variance)}
                </div>
              </div>

              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.statisticsCalculator.range', 'Range')}</div>
                <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {formatNumber(statistics.range)}
                </div>
              </div>

              {/* Min/Max */}
              <div className={`p-4 rounded-lg ${isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-100'} border`}>
                <div className={`text-sm ${isDark ? 'text-green-300' : 'text-green-600'}`}>{t('tools.statisticsCalculator.minimum', 'Minimum')}</div>
                <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {formatNumber(statistics.min)}
                </div>
              </div>

              <div className={`p-4 rounded-lg ${isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-100'} border`}>
                <div className={`text-sm ${isDark ? 'text-red-300' : 'text-red-600'}`}>{t('tools.statisticsCalculator.maximum', 'Maximum')}</div>
                <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {formatNumber(statistics.max)}
                </div>
              </div>

              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.statisticsCalculator.sum', 'Sum')}</div>
                <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {formatNumber(statistics.sum)}
                </div>
              </div>

              {/* Quartiles */}
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.statisticsCalculator.q125th', 'Q1 (25th %)')}</div>
                <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {formatNumber(statistics.q1)}
                </div>
              </div>

              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.statisticsCalculator.q375th', 'Q3 (75th %)')}</div>
                <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {formatNumber(statistics.q3)}
                </div>
              </div>

              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.statisticsCalculator.iqr', 'IQR')}</div>
                <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {formatNumber(statistics.iqr)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <strong>{t('tools.statisticsCalculator.tip', 'Tip:')}</strong> Enter numbers separated by commas, spaces, or newlines.
            Great for analyzing test scores, sales data, survey results, and more.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StatisticsCalculatorTool;
