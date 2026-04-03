import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { TrendingUp, Copy, Check, ArrowRightLeft, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

type CalculationMode = 'margin' | 'markup' | 'revenue';

interface ProfitMarginToolProps {
  uiConfig?: UIConfig;
}

export const ProfitMarginTool: React.FC<ProfitMarginToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [mode, setMode] = useState<CalculationMode>('margin');
  const [revenue, setRevenue] = useState('1000');
  const [cost, setCost] = useState('700');
  const [profit, setProfit] = useState('300');
  const [marginPercent, setMarginPercent] = useState('30');
  const [copied, setCopied] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.amount !== undefined) {
        setRevenue(params.amount.toString());
        setIsPrefilled(true);
      }
      if (params.numbers && params.numbers.length > 0) {
        setRevenue(params.numbers[0].toString());
        if (params.numbers.length > 1) {
          setCost(params.numbers[1].toString());
        }
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const calculations = useMemo(() => {
    const rev = parseFloat(revenue) || 0;
    const c = parseFloat(cost) || 0;
    const p = parseFloat(profit) || 0;
    const m = parseFloat(marginPercent) || 0;

    if (mode === 'margin') {
      // Given revenue and cost, calculate profit, margin, and markup
      const calculatedProfit = rev - c;
      const grossMargin = rev > 0 ? (calculatedProfit / rev) * 100 : 0;
      const markup = c > 0 ? (calculatedProfit / c) * 100 : 0;

      return {
        revenue: rev,
        cost: c,
        profit: calculatedProfit,
        grossMargin,
        markup,
        netMargin: grossMargin, // Simplified
      };
    } else if (mode === 'markup') {
      // Given cost and markup %, calculate selling price
      const markupAmount = c * (m / 100);
      const sellingPrice = c + markupAmount;
      const grossMargin = sellingPrice > 0 ? (markupAmount / sellingPrice) * 100 : 0;

      return {
        revenue: sellingPrice,
        cost: c,
        profit: markupAmount,
        grossMargin,
        markup: m,
        netMargin: grossMargin,
      };
    } else {
      // Given cost and desired margin %, calculate revenue needed
      const neededRevenue = m < 100 ? c / (1 - m / 100) : 0;
      const calculatedProfit = neededRevenue - c;
      const markup = c > 0 ? (calculatedProfit / c) * 100 : 0;

      return {
        revenue: neededRevenue,
        cost: c,
        profit: calculatedProfit,
        grossMargin: m,
        markup,
        netMargin: m,
      };
    }
  }, [mode, revenue, cost, profit, marginPercent]);

  const handleCopy = () => {
    const text = `Profit Analysis
Revenue: $${calculations.revenue.toFixed(2)}
Cost: $${calculations.cost.toFixed(2)}
Profit: $${calculations.profit.toFixed(2)}
Gross Margin: ${calculations.grossMargin.toFixed(2)}%
Markup: ${calculations.markup.toFixed(2)}%`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getMarginColor = (margin: number) => {
    if (margin >= 30) return 'text-green-500';
    if (margin >= 15) return 'text-yellow-500';
    if (margin >= 0) return 'text-orange-500';
    return 'text-red-500';
  };

  const industryBenchmarks = [
    { industry: 'Software/SaaS', margin: '70-90%' },
    { industry: 'Retail', margin: '25-50%' },
    { industry: 'Manufacturing', margin: '10-25%' },
    { industry: 'Food Service', margin: '3-9%' },
    { industry: 'E-commerce', margin: '10-20%' },
    { industry: 'Healthcare', margin: '15-20%' },
  ];

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-green-900/20' : 'bg-gradient-to-r from-white to-green-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-500/10 rounded-lg">
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.profitMargin.profitMarginCalculator', 'Profit Margin Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.profitMargin.calculateProfitMarginsAndMarkup', 'Calculate profit margins and markup')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.profitMargin.valuesLoadedFromAiResponse', 'Values loaded from AI response')}</span>
          </div>
        )}

        {/* Mode Selector */}
        <div className="flex gap-2">
          {[
            { value: 'margin', label: 'Calculate Margin' },
            { value: 'markup', label: 'From Markup %' },
            { value: 'revenue', label: 'Target Margin' },
          ].map((m) => (
            <button
              key={m.value}
              onClick={() => setMode(m.value as CalculationMode)}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                mode === m.value
                  ? 'bg-green-500 text-white'
                  : isDark
                  ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mode === 'margin' && (
            <>
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.profitMargin.revenueSellingPrice', 'Revenue / Selling Price ($)')}
                </label>
                <input
                  type="number"
                  value={revenue}
                  onChange={(e) => setRevenue(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.profitMargin.cost2', 'Cost ($)')}
                </label>
                <input
                  type="number"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
            </>
          )}

          {mode === 'markup' && (
            <>
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.profitMargin.cost3', 'Cost ($)')}
                </label>
                <input
                  type="number"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.profitMargin.markup3', 'Markup (%)')}
                </label>
                <input
                  type="number"
                  value={marginPercent}
                  onChange={(e) => setMarginPercent(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
            </>
          )}

          {mode === 'revenue' && (
            <>
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.profitMargin.cost4', 'Cost ($)')}
                </label>
                <input
                  type="number"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.profitMargin.targetMargin', 'Target Margin (%)')}
                </label>
                <input
                  type="number"
                  value={marginPercent}
                  onChange={(e) => setMarginPercent(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
            </>
          )}
        </div>

        {/* Results */}
        <div className={`p-6 rounded-xl ${isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-100'} border`}>
          <div className="flex items-center justify-between mb-4">
            <h4 className={`font-medium ${isDark ? 'text-green-300' : 'text-green-700'}`}>
              {t('tools.profitMargin.profitAnalysis', 'Profit Analysis')}
            </h4>
            <button
              onClick={handleCopy}
              className={`px-3 py-1.5 text-sm rounded-lg flex items-center gap-2 transition-colors ${
                copied ? 'bg-green-500 text-white' : isDark ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-white hover:bg-gray-100 text-gray-700'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? t('tools.profitMargin.copied', 'Copied!') : t('tools.profitMargin.copy', 'Copy')}
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.profitMargin.revenue', 'Revenue')}</div>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                ${calculations.revenue.toFixed(2)}
              </div>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.profitMargin.cost', 'Cost')}</div>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                ${calculations.cost.toFixed(2)}
              </div>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.profitMargin.profit', 'Profit')}</div>
              <div className={`text-2xl font-bold ${calculations.profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                ${calculations.profit.toFixed(2)}
              </div>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.profitMargin.grossMargin', 'Gross Margin')}</div>
              <div className={`text-2xl font-bold ${getMarginColor(calculations.grossMargin)}`}>
                {calculations.grossMargin.toFixed(2)}%
              </div>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.profitMargin.markup', 'Markup')}</div>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {calculations.markup.toFixed(2)}%
              </div>
            </div>
          </div>
        </div>

        {/* Margin vs Markup Explanation */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-2 mb-2">
            <ArrowRightLeft className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.profitMargin.marginVsMarkup', 'Margin vs Markup')}</span>
          </div>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <strong>{t('tools.profitMargin.margin', 'Margin')}</strong> = Profit ÷ Revenue (percentage of selling price)<br/>
            <strong>{t('tools.profitMargin.markup2', 'Markup')}</strong> = Profit ÷ Cost (percentage added to cost)
          </p>
        </div>

        {/* Industry Benchmarks */}
        <div className="space-y-3">
          <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.profitMargin.industryBenchmarks', 'Industry Benchmarks')}
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {industryBenchmarks.map((b) => (
              <div
                key={b.industry}
                className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}
              >
                <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {b.industry}
                </div>
                <div className={`text-sm text-green-500`}>{b.margin}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfitMarginTool;
