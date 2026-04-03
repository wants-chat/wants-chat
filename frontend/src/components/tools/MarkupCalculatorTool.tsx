import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { TrendingUp, Copy, Check, ArrowRight, Sparkles, Info } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

type CalculationMode = 'markup_to_price' | 'price_to_markup';

interface MarkupCalculatorToolProps {
  uiConfig?: UIConfig;
}

export const MarkupCalculatorTool: React.FC<MarkupCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [mode, setMode] = useState<CalculationMode>('markup_to_price');
  const [cost, setCost] = useState('50');
  const [markupPercent, setMarkupPercent] = useState('40');
  const [sellingPrice, setSellingPrice] = useState('70');
  const [copied, setCopied] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.amount !== undefined) {
        setCost(params.amount.toString());
        setIsPrefilled(true);
      }
      if (params.numbers && params.numbers.length > 0) {
        setCost(params.numbers[0].toString());
        if (params.numbers.length > 1) {
          setMarkupPercent(params.numbers[1].toString());
        }
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const calculations = useMemo(() => {
    const costValue = parseFloat(cost) || 0;

    if (mode === 'markup_to_price') {
      const markup = parseFloat(markupPercent) || 0;
      const markupAmount = costValue * (markup / 100);
      const price = costValue + markupAmount;
      const margin = price > 0 ? (markupAmount / price) * 100 : 0;

      return {
        cost: costValue,
        markupPercent: markup,
        markupAmount,
        sellingPrice: price,
        grossMargin: margin,
        profit: markupAmount,
      };
    } else {
      const price = parseFloat(sellingPrice) || 0;
      const profit = price - costValue;
      const markupPercentCalc = costValue > 0 ? (profit / costValue) * 100 : 0;
      const margin = price > 0 ? (profit / price) * 100 : 0;

      return {
        cost: costValue,
        markupPercent: markupPercentCalc,
        markupAmount: profit,
        sellingPrice: price,
        grossMargin: margin,
        profit,
      };
    }
  }, [mode, cost, markupPercent, sellingPrice]);

  const handleCopy = () => {
    const text = `Markup Calculation
Cost: $${calculations.cost.toFixed(2)}
Markup: ${calculations.markupPercent.toFixed(2)}%
Markup Amount: $${calculations.markupAmount.toFixed(2)}
Selling Price: $${calculations.sellingPrice.toFixed(2)}
Gross Margin: ${calculations.grossMargin.toFixed(2)}%
Profit: $${calculations.profit.toFixed(2)}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const presetMarkups = [
    { label: 'Keystone (100%)', value: 100 },
    { label: 'Standard (50%)', value: 50 },
    { label: 'Low (25%)', value: 25 },
    { label: 'Premium (150%)', value: 150 },
    { label: 'Luxury (200%)', value: 200 },
  ];

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500/10 rounded-lg">
            <TrendingUp className="w-5 h-5 text-teal-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.markupCalculator.markupCalculator', 'Markup Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.markupCalculator.calculateMarkupPercentageAndSelling', 'Calculate markup percentage and selling price')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-teal-500/10 rounded-xl border border-teal-500/20">
            <Sparkles className="w-4 h-4 text-teal-500" />
            <span className="text-sm text-teal-500 font-medium">{t('tools.markupCalculator.valuesLoadedFromAiResponse', 'Values loaded from AI response')}</span>
          </div>
        )}

        {/* Mode Selector */}
        <div className="flex gap-2">
          {[
            { value: 'markup_to_price', label: 'Calculate Price', desc: 'From cost & markup %' },
            { value: 'price_to_markup', label: 'Calculate Markup', desc: 'From cost & price' },
          ].map((m) => (
            <button
              key={m.value}
              onClick={() => setMode(m.value as CalculationMode)}
              className={`flex-1 px-4 py-3 text-sm rounded-lg transition-colors ${
                mode === m.value
                  ? 'bg-teal-500 text-white'
                  : isDark
                  ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <div className="font-medium">{m.label}</div>
              <div className={`text-xs ${mode === m.value ? 'text-teal-100' : isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                {m.desc}
              </div>
            </button>
          ))}
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.markupCalculator.cost3', 'Cost ($)')}
            </label>
            <input
              type="number"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              min="0"
              step="0.01"
              className={`w-full px-4 py-3 rounded-lg border ${
                isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
          {mode === 'markup_to_price' ? (
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.markupCalculator.markup3', 'Markup (%)')}
              </label>
              <input
                type="number"
                value={markupPercent}
                onChange={(e) => setMarkupPercent(e.target.value)}
                min="0"
                step="0.1"
                className={`w-full px-4 py-3 rounded-lg border ${
                  isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>
          ) : (
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.markupCalculator.sellingPrice3', 'Selling Price ($)')}
              </label>
              <input
                type="number"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value)}
                min="0"
                step="0.01"
                className={`w-full px-4 py-3 rounded-lg border ${
                  isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>
          )}
        </div>

        {/* Preset Markups */}
        {mode === 'markup_to_price' && (
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.markupCalculator.commonMarkupPresets', 'Common Markup Presets')}
            </label>
            <div className="flex flex-wrap gap-2">
              {presetMarkups.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => setMarkupPercent(preset.value.toString())}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    parseFloat(markupPercent) === preset.value
                      ? 'bg-teal-500 text-white'
                      : isDark
                      ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Visual Breakdown */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center justify-center gap-4">
            <div className="text-center">
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.markupCalculator.cost', 'Cost')}</div>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                ${calculations.cost.toFixed(2)}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className={`text-xl font-bold text-teal-500`}>+{calculations.markupPercent.toFixed(0)}%</div>
              <ArrowRight className={`w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
            </div>
            <div className="text-center">
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.markupCalculator.sellingPrice', 'Selling Price')}</div>
              <div className={`text-2xl font-bold text-teal-500`}>
                ${calculations.sellingPrice.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className={`p-6 rounded-xl ${isDark ? 'bg-teal-900/20 border-teal-800' : 'bg-teal-50 border-teal-100'} border`}>
          <div className="flex items-center justify-between mb-4">
            <h4 className={`font-medium ${isDark ? 'text-teal-300' : 'text-teal-700'}`}>
              {t('tools.markupCalculator.markupAnalysis', 'Markup Analysis')}
            </h4>
            <button
              onClick={handleCopy}
              className={`px-3 py-1.5 text-sm rounded-lg flex items-center gap-2 transition-colors ${
                copied ? 'bg-teal-500 text-white' : isDark ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-white hover:bg-gray-100 text-gray-700'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? t('tools.markupCalculator.copied', 'Copied!') : t('tools.markupCalculator.copy', 'Copy')}
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.markupCalculator.markup', 'Markup %')}</div>
              <div className={`text-2xl font-bold text-teal-500`}>
                {calculations.markupPercent.toFixed(2)}%
              </div>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.markupCalculator.markupAmount', 'Markup Amount')}</div>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                ${calculations.markupAmount.toFixed(2)}
              </div>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.markupCalculator.grossMargin', 'Gross Margin')}</div>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {calculations.grossMargin.toFixed(2)}%
              </div>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.markupCalculator.cost2', 'Cost')}</div>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                ${calculations.cost.toFixed(2)}
              </div>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.markupCalculator.sellingPrice2', 'Selling Price')}</div>
              <div className={`text-2xl font-bold text-teal-500`}>
                ${calculations.sellingPrice.toFixed(2)}
              </div>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.markupCalculator.profit', 'Profit')}</div>
              <div className={`text-2xl font-bold ${calculations.profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                ${calculations.profit.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* Formulas */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <p><strong>{t('tools.markupCalculator.markup2', 'Markup %')}</strong> = (Price - Cost) / Cost x 100</p>
              <p><strong>{t('tools.markupCalculator.grossMargin2', 'Gross Margin %')}</strong> = (Price - Cost) / Price x 100</p>
              <p className="mt-2"><em>Markup is based on cost; Margin is based on selling price.</em></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarkupCalculatorTool;
