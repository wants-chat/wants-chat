import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Truck, Copy, Check, Sparkles, Target, ShoppingCart, Gift, Plus, Trash2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface CartItem {
  id: string;
  name: string;
  price: string;
}

interface ShippingThresholdToolProps {
  uiConfig?: UIConfig;
}

export const ShippingThresholdTool: React.FC<ShippingThresholdToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [cartItems, setCartItems] = useState<CartItem[]>([
    { id: '1', name: 'Item 1', price: '24.99' },
    { id: '2', name: 'Item 2', price: '15.50' },
  ]);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState('50');
  const [shippingCost, setShippingCost] = useState('7.99');
  const [copied, setCopied] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.amount !== undefined) {
        setCartItems([{ id: '1', name: 'Cart Total', price: params.amount.toString() }]);
        setIsPrefilled(true);
      }
      if (params.numbers && params.numbers.length > 0) {
        setCartItems([{ id: '1', name: 'Cart Total', price: params.numbers[0].toString() }]);
        if (params.numbers.length > 1) {
          setFreeShippingThreshold(params.numbers[1].toString());
        }
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const calculations = useMemo(() => {
    const threshold = parseFloat(freeShippingThreshold) || 0;
    const shipping = parseFloat(shippingCost) || 0;

    const cartTotal = cartItems.reduce((sum, item) => {
      return sum + (parseFloat(item.price) || 0);
    }, 0);

    const amountNeeded = Math.max(0, threshold - cartTotal);
    const qualifiesForFreeShipping = cartTotal >= threshold;
    const progressPercent = threshold > 0 ? Math.min(100, (cartTotal / threshold) * 100) : 0;

    // Calculate if it's worth adding more
    const addingWorthIt = amountNeeded > 0 && amountNeeded < shipping;

    // Total with/without free shipping
    const totalWithShipping = cartTotal + shipping;
    const savingsWithFreeShipping = qualifiesForFreeShipping ? shipping : 0;

    // Suggested add amount (between amount needed and amount needed + 10)
    const suggestedAddMin = amountNeeded;
    const suggestedAddMax = amountNeeded + 10;

    return {
      cartTotal,
      threshold,
      shipping,
      amountNeeded,
      qualifiesForFreeShipping,
      progressPercent,
      addingWorthIt,
      totalWithShipping,
      savingsWithFreeShipping,
      suggestedAddMin,
      suggestedAddMax,
    };
  }, [cartItems, freeShippingThreshold, shippingCost]);

  const addItem = () => {
    const newId = Date.now().toString();
    setCartItems([...cartItems, { id: newId, name: `Item ${cartItems.length + 1}`, price: '' }]);
  };

  const removeItem = (id: string) => {
    if (cartItems.length > 1) {
      setCartItems(cartItems.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof CartItem, value: string) => {
    setCartItems(cartItems.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleCopy = () => {
    let text = `Free Shipping Calculator

Cart Total: $${calculations.cartTotal.toFixed(2)}
Free Shipping Threshold: $${calculations.threshold.toFixed(2)}
Standard Shipping: $${calculations.shipping.toFixed(2)}

`;
    if (calculations.qualifiesForFreeShipping) {
      text += `You qualify for FREE shipping! Saving $${calculations.shipping.toFixed(2)}`;
    } else {
      text += `Amount needed for free shipping: $${calculations.amountNeeded.toFixed(2)}
Progress: ${calculations.progressPercent.toFixed(1)}%`;
    }
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const commonThresholds = [
    { store: 'Amazon Prime', threshold: 35 },
    { store: 'Target', threshold: 35 },
    { store: 'Walmart', threshold: 35 },
    { store: 'Best Buy', threshold: 35 },
    { store: 'Costco', threshold: 75 },
    { store: 'Sephora', threshold: 50 },
  ];

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500/10 rounded-lg">
            <Truck className="w-5 h-5 text-teal-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.shippingThreshold.shippingThresholdCalculator', 'Shipping Threshold Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.shippingThreshold.calculateAmountNeededForFree', 'Calculate amount needed for free shipping')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-teal-500/10 rounded-xl border border-teal-500/20">
            <Sparkles className="w-4 h-4 text-teal-500" />
            <span className="text-sm text-teal-500 font-medium">{t('tools.shippingThreshold.valuesLoadedFromAiResponse', 'Values loaded from AI response')}</span>
          </div>
        )}

        {/* Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Target className="w-4 h-4 inline-block mr-1" />
              {t('tools.shippingThreshold.freeShippingThreshold', 'Free Shipping Threshold ($)')}
            </label>
            <input
              type="number"
              value={freeShippingThreshold}
              onChange={(e) => setFreeShippingThreshold(e.target.value)}
              min="0"
              step="0.01"
              className={`w-full px-4 py-3 rounded-lg border ${
                isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.shippingThreshold.standardShippingCost', 'Standard Shipping Cost ($)')}
            </label>
            <input
              type="number"
              value={shippingCost}
              onChange={(e) => setShippingCost(e.target.value)}
              min="0"
              step="0.01"
              className={`w-full px-4 py-3 rounded-lg border ${
                isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
        </div>

        {/* Quick Threshold Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.shippingThreshold.commonStoreThresholds', 'Common Store Thresholds')}
          </label>
          <div className="flex flex-wrap gap-2">
            {commonThresholds.map((store) => (
              <button
                key={store.store}
                onClick={() => setFreeShippingThreshold(store.threshold.toString())}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  parseFloat(freeShippingThreshold) === store.threshold
                    ? 'bg-teal-500 text-white'
                    : isDark
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {store.store} (${store.threshold})
              </button>
            ))}
          </div>
        </div>

        {/* Cart Items */}
        <div className="space-y-3">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <ShoppingCart className="w-4 h-4 inline-block mr-1" />
            {t('tools.shippingThreshold.yourCart', 'Your Cart')}
          </label>

          {cartItems.map((item) => (
            <div
              key={item.id}
              className={`flex items-center gap-3 p-3 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}
            >
              <input
                type="text"
                value={item.name}
                onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                className={`flex-1 text-sm bg-transparent border-none focus:outline-none ${isDark ? 'text-white' : 'text-gray-900'}`}
                placeholder={t('tools.shippingThreshold.itemName', 'Item name')}
              />
              <div className="flex items-center gap-2">
                <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>$</span>
                <input
                  type="number"
                  value={item.price}
                  onChange={(e) => updateItem(item.id, 'price', e.target.value)}
                  min="0"
                  step="0.01"
                  className={`w-24 px-3 py-2 text-sm rounded-lg border ${
                    isDark ? 'bg-gray-900 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="0.00"
                />
                {cartItems.length > 1 && (
                  <button
                    onClick={() => removeItem(item.id)}
                    className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-200 text-gray-500'}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}

          <button
            onClick={addItem}
            className={`w-full py-2 rounded-lg border-2 border-dashed flex items-center justify-center gap-2 transition-colors ${
              isDark
                ? 'border-gray-700 hover:border-teal-500 text-gray-400 hover:text-teal-500'
                : 'border-gray-300 hover:border-teal-500 text-gray-500 hover:text-teal-500'
            }`}
          >
            <Plus className="w-4 h-4" />
            {t('tools.shippingThreshold.addItem', 'Add Item')}
          </button>
        </div>

        {/* Progress Bar */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.shippingThreshold.progressToFreeShipping', 'Progress to Free Shipping')}
            </span>
            <span className={`text-sm font-bold ${calculations.qualifiesForFreeShipping ? 'text-green-500' : 'text-teal-500'}`}>
              {calculations.progressPercent.toFixed(1)}%
            </span>
          </div>
          <div className={`w-full h-4 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                calculations.qualifiesForFreeShipping ? 'bg-green-500' : 'bg-teal-500'
              }`}
              style={{ width: `${calculations.progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>$0</span>
            <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              ${calculations.threshold.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Results */}
        <div className={`p-6 rounded-xl ${
          calculations.qualifiesForFreeShipping
            ? isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-100'
            : isDark ? 'bg-teal-900/20 border-teal-800' : 'bg-teal-50 border-teal-100'
        } border`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {calculations.qualifiesForFreeShipping ? (
                <Gift className="w-5 h-5 text-green-500" />
              ) : (
                <Truck className="w-5 h-5 text-teal-500" />
              )}
              <h4 className={`font-medium ${
                calculations.qualifiesForFreeShipping
                  ? isDark ? 'text-green-300' : 'text-green-700'
                  : isDark ? 'text-teal-300' : 'text-teal-700'
              }`}>
                {calculations.qualifiesForFreeShipping ? t('tools.shippingThreshold.freeShippingUnlocked', 'Free Shipping Unlocked!') : t('tools.shippingThreshold.shippingStatus', 'Shipping Status')}
              </h4>
            </div>
            <button
              onClick={handleCopy}
              className={`px-3 py-1.5 text-sm rounded-lg flex items-center gap-2 transition-colors ${
                copied ? 'bg-teal-500 text-white' : isDark ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-white hover:bg-gray-100 text-gray-700'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? t('tools.shippingThreshold.copied', 'Copied!') : t('tools.shippingThreshold.copy', 'Copy')}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.shippingThreshold.cartTotal', 'Cart Total')}</div>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                ${calculations.cartTotal.toFixed(2)}
              </div>
            </div>
            {calculations.qualifiesForFreeShipping ? (
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.shippingThreshold.youSave', 'You Save')}</div>
                <div className="text-2xl font-bold text-green-500">
                  ${calculations.shipping.toFixed(2)}
                </div>
              </div>
            ) : (
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.shippingThreshold.addToCart', 'Add to Cart')}</div>
                <div className="text-2xl font-bold text-teal-500">
                  ${calculations.amountNeeded.toFixed(2)}
                </div>
              </div>
            )}
          </div>

          {!calculations.qualifiesForFreeShipping && (
            <div className={`mt-4 p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              {calculations.addingWorthIt ? (
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  <strong className="text-green-500">{t('tools.shippingThreshold.worthIt', 'Worth it!')}</strong> Add just ${calculations.amountNeeded.toFixed(2)} to save ${calculations.shipping.toFixed(2)} on shipping.
                  Look for items between <strong>${calculations.suggestedAddMin.toFixed(2)}</strong> and <strong>${calculations.suggestedAddMax.toFixed(2)}</strong>.
                </p>
              ) : (
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  You need ${calculations.amountNeeded.toFixed(2)} more for free shipping. Since shipping is only ${calculations.shipping.toFixed(2)},
                  it might be better to just pay for shipping unless you need more items.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Order Total Comparison */}
        {!calculations.qualifiesForFreeShipping && (
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.shippingThreshold.orderTotalComparison', 'Order Total Comparison')}
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.shippingThreshold.payShipping', 'Pay Shipping')}</div>
                <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  ${calculations.totalWithShipping.toFixed(2)}
                </div>
                <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  Cart + ${calculations.shipping.toFixed(2)} shipping
                </div>
              </div>
              <div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.shippingThreshold.getFreeShipping', 'Get Free Shipping')}</div>
                <div className={`text-lg font-bold text-teal-500`}>
                  ${calculations.threshold.toFixed(2)}
                </div>
                <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  Add ${calculations.amountNeeded.toFixed(2)} more
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShippingThresholdTool;
