import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Receipt, Copy, Check, MapPin, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface SalesTaxCalculatorToolProps {
  uiConfig?: UIConfig;
}

export const SalesTaxCalculatorTool: React.FC<SalesTaxCalculatorToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [subtotal, setSubtotal] = useState('100');
  const [taxRate, setTaxRate] = useState('8.25');
  const [copied, setCopied] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.amount !== undefined) {
        setSubtotal(params.amount.toString());
        setIsPrefilled(true);
      }
      if (params.numbers && params.numbers.length > 0) {
        setSubtotal(params.numbers[0].toString());
        if (params.numbers.length > 1) {
          setTaxRate(params.numbers[1].toString());
        }
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const calculations = useMemo(() => {
    const sub = parseFloat(subtotal) || 0;
    const rate = parseFloat(taxRate) || 0;

    const taxAmount = sub * (rate / 100);
    const total = sub + taxAmount;

    return {
      subtotal: sub,
      taxRate: rate,
      taxAmount,
      total,
    };
  }, [subtotal, taxRate]);

  const handleCopy = () => {
    const text = `Sales Tax Calculation
Subtotal: $${calculations.subtotal.toFixed(2)}
Tax Rate: ${calculations.taxRate}%
Tax Amount: $${calculations.taxAmount.toFixed(2)}
Total: $${calculations.total.toFixed(2)}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const commonRates = [
    { state: 'California', rate: 7.25 },
    { state: 'Texas', rate: 6.25 },
    { state: 'New York', rate: 4.0 },
    { state: 'Florida', rate: 6.0 },
    { state: 'Illinois', rate: 6.25 },
    { state: 'Pennsylvania', rate: 6.0 },
    { state: 'Washington', rate: 6.5 },
    { state: 'Oregon', rate: 0 },
  ];

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500/10 rounded-lg">
            <Receipt className="w-5 h-5 text-teal-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.salesTaxCalculator.salesTaxCalculator', 'Sales Tax Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.salesTaxCalculator.calculateSalesTaxOnPurchases', 'Calculate sales tax on purchases')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-teal-500/10 rounded-xl border border-teal-500/20">
            <Sparkles className="w-4 h-4 text-teal-500" />
            <span className="text-sm text-teal-500 font-medium">{t('tools.salesTaxCalculator.valuesLoadedFromAiResponse', 'Values loaded from AI response')}</span>
          </div>
        )}

        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.salesTaxCalculator.subtotal2', 'Subtotal ($)')}
            </label>
            <input
              type="number"
              value={subtotal}
              onChange={(e) => setSubtotal(e.target.value)}
              min="0"
              step="0.01"
              className={`w-full px-4 py-3 rounded-lg border ${
                isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
              placeholder={t('tools.salesTaxCalculator.enterAmountBeforeTax', 'Enter amount before tax')}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.salesTaxCalculator.taxRate', 'Tax Rate (%)')}
            </label>
            <input
              type="number"
              value={taxRate}
              onChange={(e) => setTaxRate(e.target.value)}
              min="0"
              max="100"
              step="0.01"
              className={`w-full px-4 py-3 rounded-lg border ${
                isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
              placeholder={t('tools.salesTaxCalculator.enterTaxRate', 'Enter tax rate')}
            />
          </div>
        </div>

        {/* Quick Rate Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <MapPin className="w-4 h-4 inline-block mr-1" />
            {t('tools.salesTaxCalculator.quickSelectStateRate', 'Quick Select State Rate')}
          </label>
          <div className="flex flex-wrap gap-2">
            {commonRates.map((item) => (
              <button
                key={item.state}
                onClick={() => setTaxRate(item.rate.toString())}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  parseFloat(taxRate) === item.rate
                    ? 'bg-teal-500 text-white'
                    : isDark
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {item.state} ({item.rate}%)
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className={`p-6 rounded-xl ${isDark ? 'bg-teal-900/20 border-teal-800' : 'bg-teal-50 border-teal-100'} border`}>
          <div className="flex items-center justify-between mb-4">
            <h4 className={`font-medium ${isDark ? 'text-teal-300' : 'text-teal-700'}`}>
              {t('tools.salesTaxCalculator.taxBreakdown', 'Tax Breakdown')}
            </h4>
            <button
              onClick={handleCopy}
              className={`px-3 py-1.5 text-sm rounded-lg flex items-center gap-2 transition-colors ${
                copied ? 'bg-teal-500 text-white' : isDark ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-white hover:bg-gray-100 text-gray-700'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? t('tools.salesTaxCalculator.copied', 'Copied!') : t('tools.salesTaxCalculator.copy', 'Copy')}
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>{t('tools.salesTaxCalculator.subtotal', 'Subtotal')}</span>
              <span className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                ${calculations.subtotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                Tax ({calculations.taxRate}%)
              </span>
              <span className={`text-lg font-medium text-teal-500`}>
                +${calculations.taxAmount.toFixed(2)}
              </span>
            </div>
            <div className={`pt-4 border-t ${isDark ? 'border-gray-700' : 'border-teal-200'}`}>
              <div className="flex justify-between items-center">
                <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.salesTaxCalculator.total', 'Total')}</span>
                <span className={`text-3xl font-bold text-teal-500`}>
                  ${calculations.total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <strong>{t('tools.salesTaxCalculator.note', 'Note:')}</strong> Sales tax rates vary by state, county, and city. The rates shown are base state rates only.
            Your actual rate may be higher due to local taxes. Some items may be exempt from sales tax.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SalesTaxCalculatorTool;
