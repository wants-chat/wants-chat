import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Target, Copy, Check, TrendingUp, TrendingDown, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface ROICalculatorToolProps {
  uiConfig?: UIConfig;
}

export const ROICalculatorTool: React.FC<ROICalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [initialInvestment, setInitialInvestment] = useState('10000');
  const [finalValue, setFinalValue] = useState('15000');
  const [years, setYears] = useState('3');
  const [copied, setCopied] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.amount !== undefined) {
        setInitialInvestment(params.amount.toString());
        setIsPrefilled(true);
      }
      if (params.numbers && params.numbers.length > 0) {
        setInitialInvestment(params.numbers[0].toString());
        if (params.numbers.length > 1) {
          setFinalValue(params.numbers[1].toString());
        }
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const calculations = useMemo(() => {
    const initial = parseFloat(initialInvestment) || 0;
    const final = parseFloat(finalValue) || 0;
    const duration = parseFloat(years) || 1;

    const netGain = final - initial;
    const roi = initial > 0 ? (netGain / initial) * 100 : 0;

    // Annualized ROI (CAGR)
    const annualizedRoi = initial > 0 && duration > 0
      ? (Math.pow(final / initial, 1 / duration) - 1) * 100
      : 0;

    // Simple annual return
    const simpleAnnualReturn = roi / duration;

    // Break-even analysis
    const breakEvenRoi = initial > 0 ? (initial / final) * 100 : 0;

    return {
      initial,
      final,
      netGain,
      roi,
      annualizedRoi,
      simpleAnnualReturn,
      isPositive: netGain >= 0,
      percentageGain: roi,
      duration,
    };
  }, [initialInvestment, finalValue, years]);

  const handleCopy = () => {
    const text = `ROI Analysis
Initial Investment: $${calculations.initial.toLocaleString()}
Final Value: $${calculations.final.toLocaleString()}
Net Gain/Loss: $${calculations.netGain.toLocaleString()}
ROI: ${calculations.roi.toFixed(2)}%
Time Period: ${calculations.duration} years
Annualized ROI (CAGR): ${calculations.annualizedRoi.toFixed(2)}%`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const presets = [
    { label: 'Savings Account', roi: 4 },
    { label: 'Bonds', roi: 5 },
    { label: 'S&P 500 Avg', roi: 10 },
    { label: 'Real Estate', roi: 8 },
    { label: 'Crypto (Volatile)', roi: 50 },
  ];

  const applyPreset = (expectedRoi: number) => {
    const initial = parseFloat(initialInvestment) || 10000;
    const duration = parseFloat(years) || 3;
    const estimatedFinal = initial * Math.pow(1 + expectedRoi / 100, duration);
    setFinalValue(estimatedFinal.toFixed(2));
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-blue-900/20' : 'bg-gradient-to-r from-white to-blue-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Target className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.rOICalculator.roiCalculator', 'ROI Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.rOICalculator.calculateReturnOnInvestmentAnd', 'Calculate return on investment and CAGR')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.rOICalculator.valuesLoadedFromAiResponse', 'Values loaded from AI response')}</span>
          </div>
        )}

        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.rOICalculator.initialInvestment', 'Initial Investment ($)')}
            </label>
            <input
              type="number"
              value={initialInvestment}
              onChange={(e) => setInitialInvestment(e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border ${
                isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.rOICalculator.finalValue', 'Final Value ($)')}
            </label>
            <input
              type="number"
              value={finalValue}
              onChange={(e) => setFinalValue(e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border ${
                isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.rOICalculator.timePeriodYears', 'Time Period (Years)')}
            </label>
            <input
              type="number"
              min="0.1"
              step="0.5"
              value={years}
              onChange={(e) => setYears(e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border ${
                isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
        </div>

        {/* Presets */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.rOICalculator.simulateReturnsBasedOnInitial', 'Simulate Returns (Based on Initial + Years)')}
          </label>
          <div className="flex flex-wrap gap-2">
            {presets.map((preset) => (
              <button
                key={preset.label}
                onClick={() => applyPreset(preset.roi)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  isDark
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {preset.label} (~{preset.roi}%/yr)
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className={`p-6 rounded-xl ${
          calculations.isPositive
            ? isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-100'
            : isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-100'
        } border`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {calculations.isPositive ? (
                <TrendingUp className="w-5 h-5 text-green-500" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-500" />
              )}
              <h4 className={`font-medium ${
                calculations.isPositive
                  ? isDark ? 'text-green-300' : 'text-green-700'
                  : isDark ? 'text-red-300' : 'text-red-700'
              }`}>
                {t('tools.rOICalculator.roiAnalysis', 'ROI Analysis')}
              </h4>
            </div>
            <button
              onClick={handleCopy}
              className={`px-3 py-1.5 text-sm rounded-lg flex items-center gap-2 transition-colors ${
                copied ? 'bg-green-500 text-white' : isDark ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-white hover:bg-gray-100 text-gray-700'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? t('tools.rOICalculator.copied', 'Copied!') : t('tools.rOICalculator.copy', 'Copy')}
            </button>
          </div>

          <div className="text-center mb-6">
            <div className={`text-sm ${calculations.isPositive ? isDark ? 'text-green-300' : 'text-green-600' : isDark ? 'text-red-300' : 'text-red-600'}`}>
              {t('tools.rOICalculator.totalRoi', 'Total ROI')}
            </div>
            <div className={`text-5xl font-bold ${calculations.isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {calculations.roi >= 0 ? '+' : ''}{calculations.roi.toFixed(2)}%
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.rOICalculator.netGainLoss', 'Net Gain/Loss')}</div>
              <div className={`text-xl font-bold ${calculations.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {calculations.netGain >= 0 ? '+' : ''}${calculations.netGain.toLocaleString()}
              </div>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.rOICalculator.annualizedCagr', 'Annualized (CAGR)')}</div>
              <div className={`text-xl font-bold ${calculations.annualizedRoi >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {calculations.annualizedRoi >= 0 ? '+' : ''}{calculations.annualizedRoi.toFixed(2)}%
              </div>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.rOICalculator.simpleAnnual', 'Simple Annual')}</div>
              <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {calculations.simpleAnnualReturn.toFixed(2)}%/yr
              </div>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.rOICalculator.finalInitial', 'Final/Initial')}</div>
              <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {calculations.initial > 0 ? (calculations.final / calculations.initial).toFixed(2) : 0}x
              </div>
            </div>
          </div>
        </div>

        {/* ROI Formula */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.rOICalculator.formulasUsed', 'Formulas Used')}
          </h4>
          <div className={`text-sm font-mono space-y-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <div><strong>{t('tools.rOICalculator.roi', 'ROI')}</strong> = (Final - Initial) / Initial × 100</div>
            <div><strong>{t('tools.rOICalculator.cagr', 'CAGR')}</strong> = (Final / Initial)^(1/years) - 1 × 100</div>
          </div>
        </div>

        {/* Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
          <p className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
            <strong>{t('tools.rOICalculator.tip', 'Tip:')}</strong> CAGR (Compound Annual Growth Rate) is more accurate for multi-year investments
            as it accounts for compounding. Use it to compare investments of different durations.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ROICalculatorTool;
