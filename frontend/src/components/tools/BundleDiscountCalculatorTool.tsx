import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Gift, Copy, Check, Plus, Trash2, Sparkles, Package, Tag } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface BundleItem {
  id: string;
  name: string;
  price: string;
  quantity: string;
}

interface BundleDiscountCalculatorToolProps {
  uiConfig?: UIConfig;
}

export const BundleDiscountCalculatorTool: React.FC<BundleDiscountCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [items, setItems] = useState<BundleItem[]>([
    { id: '1', name: 'Product A', price: '29.99', quantity: '1' },
    { id: '2', name: 'Product B', price: '19.99', quantity: '2' },
    { id: '3', name: 'Product C', price: '14.99', quantity: '1' },
  ]);
  const [bundleDiscount, setBundleDiscount] = useState('15');
  const [bundlePrice, setBundlePrice] = useState('');
  const [useCustomPrice, setUseCustomPrice] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.amount !== undefined) {
        setItems([
          { id: '1', name: 'Product', price: params.amount.toString(), quantity: '1' },
        ]);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const calculations = useMemo(() => {
    let totalRegularPrice = 0;
    let totalItems = 0;

    const breakdown = items.map((item) => {
      const price = parseFloat(item.price) || 0;
      const qty = parseInt(item.quantity) || 0;
      const subtotal = price * qty;
      totalRegularPrice += subtotal;
      totalItems += qty;
      return {
        ...item,
        subtotal,
      };
    });

    let finalBundlePrice: number;
    let effectiveDiscount: number;

    if (useCustomPrice && bundlePrice) {
      finalBundlePrice = parseFloat(bundlePrice) || 0;
      effectiveDiscount = totalRegularPrice > 0 ? ((totalRegularPrice - finalBundlePrice) / totalRegularPrice) * 100 : 0;
    } else {
      const discount = parseFloat(bundleDiscount) || 0;
      finalBundlePrice = totalRegularPrice * (1 - discount / 100);
      effectiveDiscount = discount;
    }

    const totalSavings = totalRegularPrice - finalBundlePrice;
    const pricePerItem = totalItems > 0 ? finalBundlePrice / totalItems : 0;

    return {
      breakdown,
      totalRegularPrice,
      totalItems,
      bundlePrice: finalBundlePrice,
      effectiveDiscount,
      totalSavings,
      pricePerItem,
    };
  }, [items, bundleDiscount, bundlePrice, useCustomPrice]);

  const addItem = () => {
    const newId = Date.now().toString();
    setItems([...items, { id: newId, name: `Product ${String.fromCharCode(64 + items.length + 1)}`, price: '', quantity: '1' }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(i => i.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof BundleItem, value: string) => {
    setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  const handleCopy = () => {
    let text = `Bundle Pricing Summary

Items in Bundle:\n`;
    calculations.breakdown.forEach((item) => {
      text += `- ${item.name} x${item.quantity}: $${item.subtotal.toFixed(2)}\n`;
    });
    text += `
Regular Price: $${calculations.totalRegularPrice.toFixed(2)}
Bundle Discount: ${calculations.effectiveDiscount.toFixed(1)}%
Bundle Price: $${calculations.bundlePrice.toFixed(2)}
Total Savings: $${calculations.totalSavings.toFixed(2)}
Price Per Item: $${calculations.pricePerItem.toFixed(2)}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const presetDiscounts = [
    { label: '10%', value: 10 },
    { label: '15%', value: 15 },
    { label: '20%', value: 20 },
    { label: '25%', value: 25 },
    { label: '30%', value: 30 },
  ];

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500/10 rounded-lg">
            <Gift className="w-5 h-5 text-teal-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.bundleDiscountCalculator.bundleDiscountCalculator', 'Bundle Discount Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.bundleDiscountCalculator.calculateBundlePricingAndSavings', 'Calculate bundle pricing and savings')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-teal-500/10 rounded-xl border border-teal-500/20">
            <Sparkles className="w-4 h-4 text-teal-500" />
            <span className="text-sm text-teal-500 font-medium">{t('tools.bundleDiscountCalculator.valuesLoadedFromAiResponse', 'Values loaded from AI response')}</span>
          </div>
        )}

        {/* Bundle Items */}
        <div className="space-y-3">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Package className="w-4 h-4 inline-block mr-1" />
            {t('tools.bundleDiscountCalculator.bundleItems', 'Bundle Items')}
          </label>

          {items.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}
            >
              <div className="flex items-center justify-between mb-3">
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                  className={`text-sm font-medium bg-transparent border-none focus:outline-none ${isDark ? 'text-white' : 'text-gray-900'}`}
                  placeholder={t('tools.bundleDiscountCalculator.productName', 'Product name')}
                />
                {items.length > 1 && (
                  <button
                    onClick={() => removeItem(item.id)}
                    className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-200 text-gray-500'}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-1">
                  <label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.bundleDiscountCalculator.price', 'Price ($)')}</label>
                  <input
                    type="number"
                    value={item.price}
                    onChange={(e) => updateItem(item.id, 'price', e.target.value)}
                    min="0"
                    step="0.01"
                    className={`w-full px-3 py-2 text-sm rounded-lg border ${
                      isDark ? 'bg-gray-900 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-1">
                  <label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.bundleDiscountCalculator.qty', 'Qty')}</label>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateItem(item.id, 'quantity', e.target.value)}
                    min="1"
                    step="1"
                    className={`w-full px-3 py-2 text-sm rounded-lg border ${
                      isDark ? 'bg-gray-900 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="1"
                  />
                </div>
              </div>
              {parseFloat(item.price) > 0 && parseInt(item.quantity) > 0 && (
                <div className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Subtotal: ${((parseFloat(item.price) || 0) * (parseInt(item.quantity) || 0)).toFixed(2)}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add Item Button */}
        <button
          onClick={addItem}
          className={`w-full py-3 rounded-lg border-2 border-dashed flex items-center justify-center gap-2 transition-colors ${
            isDark
              ? 'border-gray-700 hover:border-teal-500 text-gray-400 hover:text-teal-500'
              : 'border-gray-300 hover:border-teal-500 text-gray-500 hover:text-teal-500'
          }`}
        >
          <Plus className="w-4 h-4" />
          {t('tools.bundleDiscountCalculator.addItemToBundle', 'Add Item to Bundle')}
        </button>

        {/* Discount Settings */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-2 mb-3">
            <Tag className="w-4 h-4 text-teal-500" />
            <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.bundleDiscountCalculator.bundleDiscount', 'Bundle Discount')}</span>
          </div>

          <div className="flex items-center gap-4 mb-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={!useCustomPrice}
                onChange={() => setUseCustomPrice(false)}
                className="text-teal-500"
              />
              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.bundleDiscountCalculator.percentageOff', 'Percentage off')}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={useCustomPrice}
                onChange={() => setUseCustomPrice(true)}
                className="text-teal-500"
              />
              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.bundleDiscountCalculator.setBundlePrice', 'Set bundle price')}</span>
            </label>
          </div>

          {!useCustomPrice ? (
            <div className="space-y-3">
              <input
                type="number"
                value={bundleDiscount}
                onChange={(e) => setBundleDiscount(e.target.value)}
                min="0"
                max="100"
                step="1"
                className={`w-full px-4 py-3 rounded-lg border ${
                  isDark ? 'bg-gray-900 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
                placeholder={t('tools.bundleDiscountCalculator.enterDiscount', 'Enter discount %')}
              />
              <div className="flex flex-wrap gap-2">
                {presetDiscounts.map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => setBundleDiscount(preset.value.toString())}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                      parseFloat(bundleDiscount) === preset.value
                        ? 'bg-teal-500 text-white'
                        : isDark
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <input
              type="number"
              value={bundlePrice}
              onChange={(e) => setBundlePrice(e.target.value)}
              min="0"
              step="0.01"
              className={`w-full px-4 py-3 rounded-lg border ${
                isDark ? 'bg-gray-900 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
              placeholder={t('tools.bundleDiscountCalculator.enterBundlePrice', 'Enter bundle price')}
            />
          )}
        </div>

        {/* Results */}
        <div className={`p-6 rounded-xl ${isDark ? 'bg-teal-900/20 border-teal-800' : 'bg-teal-50 border-teal-100'} border`}>
          <div className="flex items-center justify-between mb-4">
            <h4 className={`font-medium ${isDark ? 'text-teal-300' : 'text-teal-700'}`}>
              {t('tools.bundleDiscountCalculator.bundleSummary', 'Bundle Summary')}
            </h4>
            <button
              onClick={handleCopy}
              className={`px-3 py-1.5 text-sm rounded-lg flex items-center gap-2 transition-colors ${
                copied ? 'bg-teal-500 text-white' : isDark ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-white hover:bg-gray-100 text-gray-700'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? t('tools.bundleDiscountCalculator.copied', 'Copied!') : t('tools.bundleDiscountCalculator.copy', 'Copy')}
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                Regular Price ({calculations.totalItems} items)
              </span>
              <span className={`text-lg font-medium line-through ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                ${calculations.totalRegularPrice.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                {t('tools.bundleDiscountCalculator.bundleDiscount2', 'Bundle Discount')}
              </span>
              <span className="text-lg font-medium text-red-500">
                -{calculations.effectiveDiscount.toFixed(1)}%
              </span>
            </div>

            <div className={`pt-4 border-t ${isDark ? 'border-gray-700' : 'border-teal-200'}`}>
              <div className="flex justify-between items-center mb-2">
                <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.bundleDiscountCalculator.bundlePrice', 'Bundle Price')}</span>
                <span className={`text-3xl font-bold text-teal-500`}>
                  ${calculations.bundlePrice.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.bundleDiscountCalculator.youSave', 'You Save')}</span>
                <span className="text-lg font-medium text-green-500">
                  ${calculations.totalSavings.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.bundleDiscountCalculator.perItemAverage', 'Per Item Average')}</span>
                <span className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  ${calculations.pricePerItem.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Marketing Tip */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <strong>{t('tools.bundleDiscountCalculator.marketingTip', 'Marketing Tip:')}</strong> Bundles with 15-25% discounts often perform best - enough savings to attract
            customers without significantly hurting margins. Consider "Buy 2 Get 1 Free" style bundles for higher perceived value.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BundleDiscountCalculatorTool;
