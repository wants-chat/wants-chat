import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Percent, Copy, Check, ArrowUpDown, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

type CalculationMode = 'add' | 'remove' | 'extract';

interface VATCalculatorToolProps {
  uiConfig?: UIConfig;
}

export const VATCalculatorTool: React.FC<VATCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [mode, setMode] = useState<CalculationMode>('add');
  const [amount, setAmount] = useState('100');
  const [vatRate, setVatRate] = useState('20');
  const [copied, setCopied] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.amount !== undefined) {
        setAmount(params.amount.toString());
        setIsPrefilled(true);
      }
      if (params.numbers && params.numbers.length > 0) {
        setAmount(params.numbers[0].toString());
        if (params.numbers.length > 1) {
          setVatRate(params.numbers[1].toString());
        }
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const calculations = useMemo(() => {
    const amt = parseFloat(amount) || 0;
    const rate = parseFloat(vatRate) || 0;

    if (mode === 'add') {
      // Add VAT to net amount
      const vatAmount = amt * (rate / 100);
      const grossAmount = amt + vatAmount;
      return {
        netAmount: amt,
        vatAmount,
        grossAmount,
        effectiveRate: rate,
      };
    } else if (mode === 'remove') {
      // Remove VAT from gross amount
      const netAmount = amt / (1 + rate / 100);
      const vatAmount = amt - netAmount;
      return {
        netAmount,
        vatAmount,
        grossAmount: amt,
        effectiveRate: rate,
      };
    } else {
      // Extract VAT (same as remove, different presentation)
      const netAmount = amt / (1 + rate / 100);
      const vatAmount = amt - netAmount;
      return {
        netAmount,
        vatAmount,
        grossAmount: amt,
        effectiveRate: rate,
      };
    }
  }, [amount, vatRate, mode]);

  const handleCopy = () => {
    const text = `VAT Calculation (${mode === 'add' ? 'VAT Added' : 'VAT Removed'})
Net Amount (excl. VAT): $${calculations.netAmount.toFixed(2)}
VAT (${calculations.effectiveRate}%): $${calculations.vatAmount.toFixed(2)}
Gross Amount (incl. VAT): $${calculations.grossAmount.toFixed(2)}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const commonRates = [
    { country: 'UK', rate: 20 },
    { country: 'Germany', rate: 19 },
    { country: 'France', rate: 20 },
    { country: 'Italy', rate: 22 },
    { country: 'Spain', rate: 21 },
    { country: 'Netherlands', rate: 21 },
    { country: 'Sweden', rate: 25 },
    { country: 'Ireland', rate: 23 },
  ];

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500/10 rounded-lg">
            <Percent className="w-5 h-5 text-teal-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.vatCalculator.title')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.vatCalculator.description')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-teal-500/10 rounded-xl border border-teal-500/20">
            <Sparkles className="w-4 h-4 text-teal-500" />
            <span className="text-sm text-teal-500 font-medium">{t('tools.vatCalculator.valuesLoaded')}</span>
          </div>
        )}

        {/* Mode Selector */}
        <div className="flex gap-2">
          {[
            { value: 'add', label: t('tools.vatCalculator.addVat'), desc: t('tools.vatCalculator.netToGross') },
            { value: 'remove', label: t('tools.vatCalculator.removeVat'), desc: t('tools.vatCalculator.grossToNet') },
            { value: 'extract', label: t('tools.vatCalculator.extractVat'), desc: t('tools.vatCalculator.findVat') },
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
              {mode === 'add' ? t('tools.vatCalculator.netAmount') : t('tools.vatCalculator.grossAmount')} ($)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="0.01"
              className={`w-full px-4 py-3 rounded-lg border ${
                isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.vatCalculator.vatRate')}
            </label>
            <input
              type="number"
              value={vatRate}
              onChange={(e) => setVatRate(e.target.value)}
              min="0"
              max="100"
              step="0.1"
              className={`w-full px-4 py-3 rounded-lg border ${
                isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
        </div>

        {/* Quick Rate Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.vatCalculator.commonRates')}
          </label>
          <div className="flex flex-wrap gap-2">
            {commonRates.map((item) => (
              <button
                key={item.country}
                onClick={() => setVatRate(item.rate.toString())}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  parseFloat(vatRate) === item.rate
                    ? 'bg-teal-500 text-white'
                    : isDark
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {item.country} ({item.rate}%)
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className={`p-6 rounded-xl ${isDark ? 'bg-teal-900/20 border-teal-800' : 'bg-teal-50 border-teal-100'} border`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-5 h-5 text-teal-500" />
              <h4 className={`font-medium ${isDark ? 'text-teal-300' : 'text-teal-700'}`}>
                {t('tools.vatCalculator.vatBreakdown')}
              </h4>
            </div>
            <button
              onClick={handleCopy}
              className={`px-3 py-1.5 text-sm rounded-lg flex items-center gap-2 transition-colors ${
                copied ? 'bg-teal-500 text-white' : isDark ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-white hover:bg-gray-100 text-gray-700'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? t('tools.vatCalculator.copied') : t('tools.vatCalculator.copy')}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.vatCalculator.netAmountExcl')}</div>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                ${calculations.netAmount.toFixed(2)}
              </div>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>VAT ({calculations.effectiveRate}%)</div>
              <div className={`text-2xl font-bold text-teal-500`}>
                ${calculations.vatAmount.toFixed(2)}
              </div>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.vatCalculator.grossAmountIncl')}</div>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                ${calculations.grossAmount.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* Formula */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.vatCalculator.formulas')}
          </h4>
          <div className={`text-sm font-mono space-y-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <div><strong>{t('tools.vatCalculator.addVatFormula')}:</strong> Gross = Net x (1 + VAT%/100)</div>
            <div><strong>{t('tools.vatCalculator.removeVatFormula')}:</strong> Net = Gross / (1 + VAT%/100)</div>
            <div><strong>{t('tools.vatCalculator.vatAmountFormula')}:</strong> VAT = Gross - Net</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VATCalculatorTool;
