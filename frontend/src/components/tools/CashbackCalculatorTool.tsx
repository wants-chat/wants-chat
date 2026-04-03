import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Wallet, Copy, Check, Plus, Trash2, Sparkles, CreditCard, PiggyBank } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface Purchase {
  id: string;
  name: string;
  amount: string;
  cashbackRate: string;
}

interface CashbackCalculatorToolProps {
  uiConfig?: UIConfig;
}

export const CashbackCalculatorTool: React.FC<CashbackCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [purchases, setPurchases] = useState<Purchase[]>([
    { id: '1', name: 'Groceries', amount: '150', cashbackRate: '3' },
    { id: '2', name: 'Gas', amount: '60', cashbackRate: '5' },
    { id: '3', name: 'Online Shopping', amount: '200', cashbackRate: '2' },
  ]);
  const [copied, setCopied] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.amount !== undefined) {
        setPurchases([
          { id: '1', name: 'Purchase', amount: params.amount.toString(), cashbackRate: '2' },
        ]);
        setIsPrefilled(true);
      }
      if (params.numbers && params.numbers.length > 0) {
        setPurchases([
          { id: '1', name: 'Purchase', amount: params.numbers[0].toString(), cashbackRate: params.numbers.length > 1 ? params.numbers[1].toString() : '2' },
        ]);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const calculations = useMemo(() => {
    let totalSpent = 0;
    let totalCashback = 0;

    const breakdown = purchases.map((purchase) => {
      const amount = parseFloat(purchase.amount) || 0;
      const rate = parseFloat(purchase.cashbackRate) || 0;
      const cashback = amount * (rate / 100);

      totalSpent += amount;
      totalCashback += cashback;

      return {
        ...purchase,
        cashback,
        effectiveRate: rate,
      };
    });

    const effectiveRate = totalSpent > 0 ? (totalCashback / totalSpent) * 100 : 0;
    const netCost = totalSpent - totalCashback;

    return {
      breakdown,
      totalSpent,
      totalCashback,
      effectiveRate,
      netCost,
    };
  }, [purchases]);

  const addPurchase = () => {
    const newId = Date.now().toString();
    setPurchases([...purchases, { id: newId, name: 'New Purchase', amount: '', cashbackRate: '1' }]);
  };

  const removePurchase = (id: string) => {
    if (purchases.length > 1) {
      setPurchases(purchases.filter(p => p.id !== id));
    }
  };

  const updatePurchase = (id: string, field: keyof Purchase, value: string) => {
    setPurchases(purchases.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const handleCopy = () => {
    let text = `Cashback Savings Summary
Total Spent: $${calculations.totalSpent.toFixed(2)}

Breakdown:\n`;
    calculations.breakdown.forEach((item) => {
      text += `- ${item.name}: $${parseFloat(item.amount).toFixed(2)} @ ${item.effectiveRate}% = $${item.cashback.toFixed(2)} cashback\n`;
    });
    text += `
Total Cashback: $${calculations.totalCashback.toFixed(2)}
Effective Rate: ${calculations.effectiveRate.toFixed(2)}%
Net Cost: $${calculations.netCost.toFixed(2)}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const commonCards = [
    { name: 'Standard', rate: 1 },
    { name: 'Groceries', rate: 3 },
    { name: 'Gas', rate: 5 },
    { name: 'Dining', rate: 4 },
    { name: 'Travel', rate: 5 },
    { name: 'Online', rate: 2 },
  ];

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500/10 rounded-lg">
            <Wallet className="w-5 h-5 text-teal-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.cashbackCalculator.cashbackCalculator', 'Cashback Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.cashbackCalculator.calculateYourCashbackSavings', 'Calculate your cashback savings')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-teal-500/10 rounded-xl border border-teal-500/20">
            <Sparkles className="w-4 h-4 text-teal-500" />
            <span className="text-sm text-teal-500 font-medium">{t('tools.cashbackCalculator.valuesLoadedFromAiResponse', 'Values loaded from AI response')}</span>
          </div>
        )}

        {/* Quick Rate Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <CreditCard className="w-4 h-4 inline-block mr-1" />
            {t('tools.cashbackCalculator.commonCashbackRates', 'Common Cashback Rates')}
          </label>
          <div className="flex flex-wrap gap-2">
            {commonCards.map((card) => (
              <span
                key={card.name}
                className={`px-3 py-1.5 text-sm rounded-lg ${
                  isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
                }`}
              >
                {card.name}: {card.rate}%
              </span>
            ))}
          </div>
        </div>

        {/* Purchases */}
        <div className="space-y-3">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.cashbackCalculator.yourPurchases', 'Your Purchases')}
          </label>

          {purchases.map((purchase) => (
            <div
              key={purchase.id}
              className={`p-4 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}
            >
              <div className="flex items-center justify-between mb-3">
                <input
                  type="text"
                  value={purchase.name}
                  onChange={(e) => updatePurchase(purchase.id, 'name', e.target.value)}
                  className={`text-sm font-medium bg-transparent border-none focus:outline-none ${isDark ? 'text-white' : 'text-gray-900'}`}
                  placeholder={t('tools.cashbackCalculator.purchaseName', 'Purchase name')}
                />
                {purchases.length > 1 && (
                  <button
                    onClick={() => removePurchase(purchase.id)}
                    className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-200 text-gray-500'}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.cashbackCalculator.amount', 'Amount ($)')}</label>
                  <input
                    type="number"
                    value={purchase.amount}
                    onChange={(e) => updatePurchase(purchase.id, 'amount', e.target.value)}
                    min="0"
                    step="0.01"
                    className={`w-full px-3 py-2 text-sm rounded-lg border ${
                      isDark ? 'bg-gray-900 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-1">
                  <label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.cashbackCalculator.cashbackRate', 'Cashback Rate (%)')}</label>
                  <input
                    type="number"
                    value={purchase.cashbackRate}
                    onChange={(e) => updatePurchase(purchase.id, 'cashbackRate', e.target.value)}
                    min="0"
                    max="100"
                    step="0.1"
                    className={`w-full px-3 py-2 text-sm rounded-lg border ${
                      isDark ? 'bg-gray-900 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="1"
                  />
                </div>
              </div>
              {parseFloat(purchase.amount) > 0 && (
                <div className={`mt-2 text-sm ${isDark ? 'text-teal-400' : 'text-teal-600'}`}>
                  Cashback: ${((parseFloat(purchase.amount) || 0) * ((parseFloat(purchase.cashbackRate) || 0) / 100)).toFixed(2)}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add Purchase Button */}
        <button
          onClick={addPurchase}
          className={`w-full py-3 rounded-lg border-2 border-dashed flex items-center justify-center gap-2 transition-colors ${
            isDark
              ? 'border-gray-700 hover:border-teal-500 text-gray-400 hover:text-teal-500'
              : 'border-gray-300 hover:border-teal-500 text-gray-500 hover:text-teal-500'
          }`}
        >
          <Plus className="w-4 h-4" />
          {t('tools.cashbackCalculator.addPurchase', 'Add Purchase')}
        </button>

        {/* Results */}
        <div className={`p-6 rounded-xl ${isDark ? 'bg-teal-900/20 border-teal-800' : 'bg-teal-50 border-teal-100'} border`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <PiggyBank className="w-5 h-5 text-teal-500" />
              <h4 className={`font-medium ${isDark ? 'text-teal-300' : 'text-teal-700'}`}>
                {t('tools.cashbackCalculator.cashbackSummary', 'Cashback Summary')}
              </h4>
            </div>
            <button
              onClick={handleCopy}
              className={`px-3 py-1.5 text-sm rounded-lg flex items-center gap-2 transition-colors ${
                copied ? 'bg-teal-500 text-white' : isDark ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-white hover:bg-gray-100 text-gray-700'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? t('tools.cashbackCalculator.copied', 'Copied!') : t('tools.cashbackCalculator.copy', 'Copy')}
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.cashbackCalculator.totalSpent', 'Total Spent')}</div>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                ${calculations.totalSpent.toFixed(2)}
              </div>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.cashbackCalculator.totalCashback', 'Total Cashback')}</div>
              <div className={`text-2xl font-bold text-teal-500`}>
                ${calculations.totalCashback.toFixed(2)}
              </div>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.cashbackCalculator.effectiveRate', 'Effective Rate')}</div>
              <div className={`text-2xl font-bold text-teal-500`}>
                {calculations.effectiveRate.toFixed(2)}%
              </div>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.cashbackCalculator.netCost', 'Net Cost')}</div>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                ${calculations.netCost.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* Yearly Projection */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.cashbackCalculator.yearlyProjection', 'Yearly Projection')}
          </h4>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            If you maintain this spending pattern monthly, you could earn approximately{' '}
            <strong className="text-teal-500">${(calculations.totalCashback * 12).toFixed(2)}</strong>{' '}
            in cashback per year!
          </p>
        </div>
      </div>
    </div>
  );
};

export default CashbackCalculatorTool;
