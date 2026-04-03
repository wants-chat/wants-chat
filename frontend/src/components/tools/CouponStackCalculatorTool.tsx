import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Ticket, Copy, Check, Plus, Trash2, Sparkles, ArrowDown, Percent, DollarSign } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface Coupon {
  id: string;
  type: 'percent' | 'fixed';
  value: string;
  name: string;
}

interface CouponStackCalculatorToolProps {
  uiConfig?: UIConfig;
}

export const CouponStackCalculatorTool: React.FC<CouponStackCalculatorToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [originalPrice, setOriginalPrice] = useState('100');
  const [coupons, setCoupons] = useState<Coupon[]>([
    { id: '1', type: 'percent', value: '20', name: 'First Coupon' },
    { id: '2', type: 'fixed', value: '10', name: 'Second Coupon' },
  ]);
  const [copied, setCopied] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.amount !== undefined) {
        setOriginalPrice(params.amount.toString());
        setIsPrefilled(true);
      }
      if (params.numbers && params.numbers.length > 0) {
        setOriginalPrice(params.numbers[0].toString());
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const calculations = useMemo(() => {
    let currentPrice = parseFloat(originalPrice) || 0;
    const original = currentPrice;
    const steps: { name: string; discount: number; priceAfter: number; type: string }[] = [];

    coupons.forEach((coupon) => {
      const value = parseFloat(coupon.value) || 0;
      let discount = 0;

      if (coupon.type === 'percent') {
        discount = currentPrice * (value / 100);
      } else {
        discount = Math.min(value, currentPrice);
      }

      currentPrice = Math.max(0, currentPrice - discount);

      steps.push({
        name: coupon.name,
        discount,
        priceAfter: currentPrice,
        type: coupon.type === 'percent' ? `${value}%` : `$${value}`,
      });
    });

    const totalSavings = original - currentPrice;
    const savingsPercent = original > 0 ? (totalSavings / original) * 100 : 0;

    return {
      originalPrice: original,
      finalPrice: currentPrice,
      totalSavings,
      savingsPercent,
      steps,
    };
  }, [originalPrice, coupons]);

  const addCoupon = () => {
    const newId = Date.now().toString();
    setCoupons([...coupons, { id: newId, type: 'percent', value: '10', name: `Coupon ${coupons.length + 1}` }]);
  };

  const removeCoupon = (id: string) => {
    if (coupons.length > 1) {
      setCoupons(coupons.filter(c => c.id !== id));
    }
  };

  const updateCoupon = (id: string, field: keyof Coupon, value: string) => {
    setCoupons(coupons.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const moveCoupon = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === coupons.length - 1)) return;
    const newCoupons = [...coupons];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newCoupons[index], newCoupons[newIndex]] = [newCoupons[newIndex], newCoupons[index]];
    setCoupons(newCoupons);
  };

  const handleCopy = () => {
    let text = `Coupon Stack Calculation
Original Price: $${calculations.originalPrice.toFixed(2)}

`;
    calculations.steps.forEach((step, index) => {
      text += `${index + 1}. ${step.name} (${step.type}): -$${step.discount.toFixed(2)} = $${step.priceAfter.toFixed(2)}\n`;
    });
    text += `
Final Price: $${calculations.finalPrice.toFixed(2)}
Total Savings: $${calculations.totalSavings.toFixed(2)} (${calculations.savingsPercent.toFixed(1)}%)`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500/10 rounded-lg">
            <Ticket className="w-5 h-5 text-teal-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.couponStackCalculator.couponStackCalculator', 'Coupon Stack Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.couponStackCalculator.stackMultipleCouponsToMaximize', 'Stack multiple coupons to maximize savings')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-teal-500/10 rounded-xl border border-teal-500/20">
            <Sparkles className="w-4 h-4 text-teal-500" />
            <span className="text-sm text-teal-500 font-medium">{t('tools.couponStackCalculator.valuesLoadedFromAiResponse', 'Values loaded from AI response')}</span>
          </div>
        )}

        {/* Original Price */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.couponStackCalculator.originalPrice2', 'Original Price ($)')}
          </label>
          <input
            type="number"
            value={originalPrice}
            onChange={(e) => setOriginalPrice(e.target.value)}
            min="0"
            step="0.01"
            className={`w-full px-4 py-3 rounded-lg border text-lg font-semibold ${
              isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
            }`}
          />
        </div>

        {/* Coupons */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.couponStackCalculator.couponsAppliedInOrder', 'Coupons (Applied in Order)')}
            </label>
            <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {t('tools.couponStackCalculator.dragOrUseArrowsTo', 'Drag or use arrows to reorder')}
            </span>
          </div>

          {coupons.map((coupon, index) => (
            <div key={coupon.id}>
              <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-center gap-3 mb-3">
                  <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold bg-teal-500 text-white`}>
                    {index + 1}
                  </span>
                  <input
                    type="text"
                    value={coupon.name}
                    onChange={(e) => updateCoupon(coupon.id, 'name', e.target.value)}
                    className={`flex-1 text-sm font-medium bg-transparent border-none focus:outline-none ${isDark ? 'text-white' : 'text-gray-900'}`}
                    placeholder={t('tools.couponStackCalculator.couponName', 'Coupon name')}
                  />
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => moveCoupon(index, 'up')}
                      disabled={index === 0}
                      className={`p-1 rounded transition-colors ${
                        index === 0 ? 'opacity-30 cursor-not-allowed' : isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                      }`}
                    >
                      <ArrowDown className={`w-4 h-4 rotate-180 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    </button>
                    <button
                      onClick={() => moveCoupon(index, 'down')}
                      disabled={index === coupons.length - 1}
                      className={`p-1 rounded transition-colors ${
                        index === coupons.length - 1 ? 'opacity-30 cursor-not-allowed' : isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                      }`}
                    >
                      <ArrowDown className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    </button>
                    {coupons.length > 1 && (
                      <button
                        onClick={() => removeCoupon(coupon.id)}
                        className={`p-1 rounded transition-colors ${isDark ? 'hover:bg-red-900/30 text-red-400' : 'hover:bg-red-50 text-red-500'}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <div className="flex rounded-lg overflow-hidden border ${isDark ? 'border-gray-600' : 'border-gray-300'}">
                      <button
                        onClick={() => updateCoupon(coupon.id, 'type', 'percent')}
                        className={`flex-1 px-3 py-2 flex items-center justify-center gap-1 text-sm transition-colors ${
                          coupon.type === 'percent'
                            ? 'bg-teal-500 text-white'
                            : isDark ? 'bg-gray-700 text-gray-300' : 'bg-white text-gray-700'
                        }`}
                      >
                        <Percent className="w-4 h-4" /> %
                      </button>
                      <button
                        onClick={() => updateCoupon(coupon.id, 'type', 'fixed')}
                        className={`flex-1 px-3 py-2 flex items-center justify-center gap-1 text-sm transition-colors ${
                          coupon.type === 'fixed'
                            ? 'bg-teal-500 text-white'
                            : isDark ? 'bg-gray-700 text-gray-300' : 'bg-white text-gray-700'
                        }`}
                      >
                        <DollarSign className="w-4 h-4" /> $
                      </button>
                    </div>
                  </div>
                  <input
                    type="number"
                    value={coupon.value}
                    onChange={(e) => updateCoupon(coupon.id, 'value', e.target.value)}
                    min="0"
                    step={coupon.type === 'percent' ? '1' : '0.01'}
                    max={coupon.type === 'percent' ? '100' : undefined}
                    className={`w-24 px-3 py-2 text-sm rounded-lg border ${
                      isDark ? 'bg-gray-900 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder={t('tools.couponStackCalculator.value', 'Value')}
                  />
                </div>
              </div>
              {index < coupons.length - 1 && (
                <div className="flex justify-center py-1">
                  <ArrowDown className={`w-4 h-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add Coupon Button */}
        <button
          onClick={addCoupon}
          className={`w-full py-3 rounded-lg border-2 border-dashed flex items-center justify-center gap-2 transition-colors ${
            isDark
              ? 'border-gray-700 hover:border-teal-500 text-gray-400 hover:text-teal-500'
              : 'border-gray-300 hover:border-teal-500 text-gray-500 hover:text-teal-500'
          }`}
        >
          <Plus className="w-4 h-4" />
          {t('tools.couponStackCalculator.addAnotherCoupon', 'Add Another Coupon')}
        </button>

        {/* Results */}
        <div className={`p-6 rounded-xl ${isDark ? 'bg-teal-900/20 border-teal-800' : 'bg-teal-50 border-teal-100'} border`}>
          <div className="flex items-center justify-between mb-4">
            <h4 className={`font-medium ${isDark ? 'text-teal-300' : 'text-teal-700'}`}>
              {t('tools.couponStackCalculator.calculationBreakdown', 'Calculation Breakdown')}
            </h4>
            <button
              onClick={handleCopy}
              className={`px-3 py-1.5 text-sm rounded-lg flex items-center gap-2 transition-colors ${
                copied ? 'bg-teal-500 text-white' : isDark ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-white hover:bg-gray-100 text-gray-700'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? t('tools.couponStackCalculator.copied', 'Copied!') : t('tools.couponStackCalculator.copy', 'Copy')}
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>{t('tools.couponStackCalculator.originalPrice', 'Original Price')}</span>
              <span className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                ${calculations.originalPrice.toFixed(2)}
              </span>
            </div>

            {calculations.steps.map((step, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                  {index + 1}. {step.name} ({step.type})
                </span>
                <span className="text-lg font-medium text-red-500">
                  -${step.discount.toFixed(2)}
                </span>
              </div>
            ))}

            <div className={`pt-4 border-t ${isDark ? 'border-gray-700' : 'border-teal-200'}`}>
              <div className="flex justify-between items-center mb-2">
                <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.couponStackCalculator.finalPrice', 'Final Price')}</span>
                <span className={`text-3xl font-bold text-teal-500`}>
                  ${calculations.finalPrice.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.couponStackCalculator.totalSavings', 'Total Savings')}</span>
                <span className={`text-lg font-medium text-green-500`}>
                  ${calculations.totalSavings.toFixed(2)} ({calculations.savingsPercent.toFixed(1)}% off)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <strong>{t('tools.couponStackCalculator.proTip', 'Pro Tip:')}</strong> Apply percentage-based coupons first on higher prices, then use fixed-amount
            coupons. This typically maximizes your total savings!
          </p>
        </div>
      </div>
    </div>
  );
};

export default CouponStackCalculatorTool;
