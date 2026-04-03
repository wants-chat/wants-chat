import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Package, Copy, Check, ArrowRight, Sparkles, Info, Layers } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

type CalculationMode = 'retail_to_wholesale' | 'wholesale_to_retail';

interface WholesalePriceCalculatorToolProps {
  uiConfig?: UIConfig;
}

export const WholesalePriceCalculatorTool: React.FC<WholesalePriceCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [mode, setMode] = useState<CalculationMode>('retail_to_wholesale');
  const [retailPrice, setRetailPrice] = useState('100');
  const [wholesaleDiscount, setWholesaleDiscount] = useState('50');
  const [quantity, setQuantity] = useState('100');
  const [copied, setCopied] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.amount !== undefined) {
        setRetailPrice(params.amount.toString());
        setIsPrefilled(true);
      }
      if (params.numbers && params.numbers.length > 0) {
        setRetailPrice(params.numbers[0].toString());
        if (params.numbers.length > 1) {
          setWholesaleDiscount(params.numbers[1].toString());
        }
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const calculations = useMemo(() => {
    const retail = parseFloat(retailPrice) || 0;
    const discount = parseFloat(wholesaleDiscount) || 0;
    const qty = parseInt(quantity) || 1;

    const wholesalePrice = retail * (1 - discount / 100);
    const savingsPerUnit = retail - wholesalePrice;
    const totalRetail = retail * qty;
    const totalWholesale = wholesalePrice * qty;
    const totalSavings = totalRetail - totalWholesale;

    // Suggested retail markup from wholesale
    const suggestedMarkup = wholesalePrice > 0 ? ((retail - wholesalePrice) / wholesalePrice) * 100 : 0;

    return {
      retailPrice: retail,
      wholesalePrice,
      discount,
      savingsPerUnit,
      quantity: qty,
      totalRetail,
      totalWholesale,
      totalSavings,
      suggestedMarkup,
    };
  }, [retailPrice, wholesaleDiscount, quantity]);

  const handleCopy = () => {
    const text = `Wholesale Price Calculation
Retail Price: $${calculations.retailPrice.toFixed(2)}
Wholesale Discount: ${calculations.discount}%
Wholesale Price: $${calculations.wholesalePrice.toFixed(2)}
Savings Per Unit: $${calculations.savingsPerUnit.toFixed(2)}

Bulk Order (${calculations.quantity} units):
Total Retail Value: $${calculations.totalRetail.toFixed(2)}
Total Wholesale Cost: $${calculations.totalWholesale.toFixed(2)}
Total Savings: $${calculations.totalSavings.toFixed(2)}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const discountTiers = [
    { label: '30% off', value: 30, tier: 'Small Bulk' },
    { label: '40% off', value: 40, tier: 'Medium Bulk' },
    { label: '50% off', value: 50, tier: 'Standard Wholesale' },
    { label: '60% off', value: 60, tier: 'Large Volume' },
    { label: '70% off', value: 70, tier: 'Distributor' },
  ];

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500/10 rounded-lg">
            <Package className="w-5 h-5 text-teal-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.wholesalePriceCalculator.wholesalePriceCalculator', 'Wholesale Price Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.wholesalePriceCalculator.calculateWholesalePricingFromRetail', 'Calculate wholesale pricing from retail')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-teal-500/10 rounded-xl border border-teal-500/20">
            <Sparkles className="w-4 h-4 text-teal-500" />
            <span className="text-sm text-teal-500 font-medium">{t('tools.wholesalePriceCalculator.valuesLoadedFromAiResponse', 'Values loaded from AI response')}</span>
          </div>
        )}

        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.wholesalePriceCalculator.retailPrice', 'Retail Price ($)')}
            </label>
            <input
              type="number"
              value={retailPrice}
              onChange={(e) => setRetailPrice(e.target.value)}
              min="0"
              step="0.01"
              className={`w-full px-4 py-3 rounded-lg border ${
                isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.wholesalePriceCalculator.wholesaleDiscount', 'Wholesale Discount (%)')}
            </label>
            <input
              type="number"
              value={wholesaleDiscount}
              onChange={(e) => setWholesaleDiscount(e.target.value)}
              min="0"
              max="100"
              step="1"
              className={`w-full px-4 py-3 rounded-lg border ${
                isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Layers className="w-4 h-4 inline-block mr-1" />
              {t('tools.wholesalePriceCalculator.quantity', 'Quantity')}
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="1"
              step="1"
              className={`w-full px-4 py-3 rounded-lg border ${
                isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
        </div>

        {/* Discount Tiers */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.wholesalePriceCalculator.commonWholesaleDiscountTiers', 'Common Wholesale Discount Tiers')}
          </label>
          <div className="flex flex-wrap gap-2">
            {discountTiers.map((tier) => (
              <button
                key={tier.value}
                onClick={() => setWholesaleDiscount(tier.value.toString())}
                className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                  parseFloat(wholesaleDiscount) === tier.value
                    ? 'bg-teal-500 text-white'
                    : isDark
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <div className="font-medium">{tier.label}</div>
                <div className={`text-xs ${parseFloat(wholesaleDiscount) === tier.value ? 'text-teal-100' : isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  {tier.tier}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Visual Comparison */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center justify-center gap-6">
            <div className="text-center">
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.wholesalePriceCalculator.retail', 'Retail')}</div>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                ${calculations.retailPrice.toFixed(2)}
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div className={`text-lg font-bold text-red-500`}>-{calculations.discount}%</div>
              <ArrowRight className={`w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
            </div>
            <div className="text-center">
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.wholesalePriceCalculator.wholesale', 'Wholesale')}</div>
              <div className={`text-2xl font-bold text-teal-500`}>
                ${calculations.wholesalePrice.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className={`p-6 rounded-xl ${isDark ? 'bg-teal-900/20 border-teal-800' : 'bg-teal-50 border-teal-100'} border`}>
          <div className="flex items-center justify-between mb-4">
            <h4 className={`font-medium ${isDark ? 'text-teal-300' : 'text-teal-700'}`}>
              {t('tools.wholesalePriceCalculator.pricingSummary', 'Pricing Summary')}
            </h4>
            <button
              onClick={handleCopy}
              className={`px-3 py-1.5 text-sm rounded-lg flex items-center gap-2 transition-colors ${
                copied ? 'bg-teal-500 text-white' : isDark ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-white hover:bg-gray-100 text-gray-700'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? t('tools.wholesalePriceCalculator.copied', 'Copied!') : t('tools.wholesalePriceCalculator.copy', 'Copy')}
            </button>
          </div>

          {/* Per Unit */}
          <div className="mb-4">
            <h5 className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.wholesalePriceCalculator.perUnit', 'Per Unit')}</h5>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.wholesalePriceCalculator.retail2', 'Retail')}</div>
                <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  ${calculations.retailPrice.toFixed(2)}
                </div>
              </div>
              <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.wholesalePriceCalculator.wholesale2', 'Wholesale')}</div>
                <div className={`text-lg font-bold text-teal-500`}>
                  ${calculations.wholesalePrice.toFixed(2)}
                </div>
              </div>
              <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.wholesalePriceCalculator.savings', 'Savings')}</div>
                <div className={`text-lg font-bold text-green-500`}>
                  ${calculations.savingsPerUnit.toFixed(2)}
                </div>
              </div>
              <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.wholesalePriceCalculator.suggestedMarkup', 'Suggested Markup')}</div>
                <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {calculations.suggestedMarkup.toFixed(0)}%
                </div>
              </div>
            </div>
          </div>

          {/* Bulk Order */}
          <div>
            <h5 className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Bulk Order ({calculations.quantity} units)
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.wholesalePriceCalculator.totalRetailValue', 'Total Retail Value')}</div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  ${calculations.totalRetail.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.wholesalePriceCalculator.totalWholesaleCost', 'Total Wholesale Cost')}</div>
                <div className={`text-2xl font-bold text-teal-500`}>
                  ${calculations.totalWholesale.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.wholesalePriceCalculator.totalSavings', 'Total Savings')}</div>
                <div className={`text-2xl font-bold text-green-500`}>
                  ${calculations.totalSavings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <p><strong>{t('tools.wholesalePriceCalculator.keystonePricing', 'Keystone pricing:')}</strong> {t('tools.wholesalePriceCalculator.a50WholesaleDiscountAllows', 'A 50% wholesale discount allows retailers to double the wholesale price to set retail (100% markup).')}</p>
              <p className="mt-1">{t('tools.wholesalePriceCalculator.wholesaleDiscountsTypicallyRangeFrom', 'Wholesale discounts typically range from 30-70% off retail depending on volume and industry.')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WholesalePriceCalculatorTool;
