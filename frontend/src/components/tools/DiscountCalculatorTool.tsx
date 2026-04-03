import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Calculator, Tag, TrendingDown, Sparkles } from 'lucide-react';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface DiscountResult {
  originalPrice: number;
  discountPercent: number;
  discountAmount: number;
  finalPrice: number;
  savings: number;
}

interface DiscountCalculatorToolProps {
  uiConfig?: UIConfig;
}

export default function DiscountCalculatorTool({ uiConfig }: DiscountCalculatorToolProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [originalPrice, setOriginalPrice] = useState('');
  const [discountPercent, setDiscountPercent] = useState('');
  const [result, setResult] = useState<DiscountResult | null>(null);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.amount !== undefined) {
        setOriginalPrice(params.amount.toString());
        setIsPrefilled(true);
      }
      if (params.numbers && params.numbers.length > 0) {
        setOriginalPrice(params.numbers[0].toString());
        if (params.numbers.length > 1) {
          setDiscountPercent(params.numbers[1].toString());
        }
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const calculateDiscount = () => {
    const price = parseFloat(originalPrice);
    const discount = parseFloat(discountPercent);

    if (isNaN(price) || isNaN(discount)) {
      setValidationMessage('Please enter valid numbers');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    if (price <= 0) {
      setValidationMessage('Original price must be greater than 0');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    if (discount < 0 || discount > 100) {
      setValidationMessage('Discount percentage must be between 0 and 100');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const discountAmount = (price * discount) / 100;
    const finalPrice = price - discountAmount;

    setResult({
      originalPrice: price,
      discountPercent: discount,
      discountAmount: parseFloat(discountAmount.toFixed(2)),
      finalPrice: parseFloat(finalPrice.toFixed(2)),
      savings: parseFloat(discountAmount.toFixed(2))
    });
  };

  const reset = () => {
    setOriginalPrice('');
    setDiscountPercent('');
    setResult(null);
  };

  const setQuickDiscount = (percent: number) => {
    setDiscountPercent(percent.toString());
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-2xl mx-auto">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.discountCalculator.valuesLoadedFromAiResponse', 'Values loaded from AI response')}</span>
          </div>
        )}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-[#0D9488] rounded-lg">
              <Tag className="w-6 h-6 text-white" />
            </div>
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.discountCalculator.discountCalculator', 'Discount Calculator')}
            </h1>
          </div>

          {/* Input Fields */}
          <div className="space-y-4 mb-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.discountCalculator.originalPrice', 'Original Price ($)')}
              </label>
              <input
                type="number"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                placeholder={t('tools.discountCalculator.enterOriginalPrice', 'Enter original price')}
                step="0.01"
                min="0"
                className={`w-full px-4 py-3 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.discountCalculator.discountPercentage', 'Discount Percentage (%)')}
              </label>
              <input
                type="number"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(e.target.value)}
                placeholder={t('tools.discountCalculator.enterDiscountPercentage', 'Enter discount percentage')}
                step="0.1"
                min="0"
                max="100"
                className={`w-full px-4 py-3 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              />
            </div>

            {/* Quick Discount Buttons */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.discountCalculator.quickDiscount', 'Quick Discount')}
              </label>
              <div className="grid grid-cols-5 gap-2">
                {[10, 15, 20, 25, 30, 40, 50, 60, 70, 75].map((percent) => (
                  <button
                    key={percent}
                    onClick={() => setQuickDiscount(percent)}
                    className={`py-2 px-3 rounded-lg font-medium transition-colors ${
                      discountPercent === percent.toString()
                        ? 'bg-[#0D9488] text-white'
                        : theme === 'dark'
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {percent}%
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={calculateDiscount}
              className="flex-1 bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Calculator className="w-5 h-5" />
              {t('tools.discountCalculator.calculateDiscount', 'Calculate Discount')}
            </button>
            <button
              onClick={reset}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {t('tools.discountCalculator.reset', 'Reset')}
            </button>
          </div>

          {/* Result Display */}
          {result && (
            <div className="space-y-4">
              {/* Final Price - Main Display */}
              <div className={`p-6 rounded-lg border-l-4 border-green-500 ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-green-50'
              }`}>
                <div className="text-center">
                  <div className={`text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.discountCalculator.finalPrice', 'Final Price')}
                  </div>
                  <div className="text-5xl font-bold text-green-500 mb-2">
                    ${result.finalPrice.toFixed(2)}
                  </div>
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <TrendingDown className="w-5 h-5" />
                    <span className="font-semibold">
                      Save ${result.savings.toFixed(2)} ({result.discountPercent}% off)
                    </span>
                  </div>
                </div>
              </div>

              {/* Breakdown */}
              <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.discountCalculator.priceBreakdown', 'Price Breakdown')}
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                      {t('tools.discountCalculator.originalPrice2', 'Original Price:')}
                    </span>
                    <span className={`font-semibold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      ${result.originalPrice.toFixed(2)}
                    </span>
                  </div>
                  <div className={`border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`} />
                  <div className="flex justify-between items-center">
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                      Discount ({result.discountPercent}%):
                    </span>
                    <span className="font-semibold text-lg text-red-500">
                      -${result.discountAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className={`border-t-2 ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`} />
                  <div className="flex justify-between items-center">
                    <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {t('tools.discountCalculator.youPay', 'You Pay:')}
                    </span>
                    <span className="font-bold text-2xl text-green-500">
                      ${result.finalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Savings Highlight */}
              <div className={`p-4 rounded-lg text-center ${
                theme === 'dark' ? t('tools.discountCalculator.bg0d948820', 'bg-[#0D9488]20') : t('tools.discountCalculator.bg0d948815', 'bg-[#0D9488]15')
              } border-l-4 border-[#0D9488]`}>
                <div className="flex items-center justify-center gap-2">
                  <Tag className="w-5 h-5 text-[#0D9488]" />
                  <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    You save ${result.savings.toFixed(2)} with this discount!
                  </span>
                </div>
              </div>

              {/* Formula */}
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                  {t('tools.discountCalculator.calculation', 'Calculation:')}
                </div>
                <div className={`font-mono text-sm space-y-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  <div>Discount Amount = ${result.originalPrice.toFixed(2)} × {result.discountPercent}% = ${result.discountAmount.toFixed(2)}</div>
                  <div>Final Price = ${result.originalPrice.toFixed(2)} - ${result.discountAmount.toFixed(2)} = ${result.finalPrice.toFixed(2)}</div>
                </div>
              </div>
            </div>
          )}

          {/* Examples */}
          <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <h3 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.discountCalculator.examples', 'Examples')}
            </h3>
            <div className={`space-y-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              <p>• $100 with 20% discount = $80 (Save $20)</p>
              <p>• $50 with 30% discount = $35 (Save $15)</p>
              <p>• $200 with 15% discount = $170 (Save $30)</p>
              <p>• $75 with 50% discount = $37.50 (Save $37.50)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog />

      {/* Validation Message Toast */}
      {validationMessage && (
        <div className="fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg bg-red-500 text-white shadow-lg animate-in fade-in slide-in-from-bottom-2">
          {validationMessage}
        </div>
      )}
    </div>
  );
}
