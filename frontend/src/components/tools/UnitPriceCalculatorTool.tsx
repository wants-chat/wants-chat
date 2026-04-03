import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Scale, Copy, Check, Plus, Trash2, Sparkles, Trophy } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface Product {
  id: string;
  name: string;
  price: string;
  quantity: string;
  unit: string;
}

interface UnitPriceCalculatorToolProps {
  uiConfig?: UIConfig;
}

export const UnitPriceCalculatorTool: React.FC<UnitPriceCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [products, setProducts] = useState<Product[]>([
    { id: '1', name: 'Product A', price: '5.99', quantity: '16', unit: 'oz' },
    { id: '2', name: 'Product B', price: '7.49', quantity: '24', unit: 'oz' },
  ]);
  const [copied, setCopied] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.numbers && params.numbers.length >= 2) {
        setProducts([
          { id: '1', name: 'Product A', price: params.numbers[0].toString(), quantity: params.numbers[1].toString(), unit: 'oz' },
          { id: '2', name: 'Product B', price: '', quantity: '', unit: 'oz' },
        ]);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const calculations = useMemo(() => {
    return products.map((product) => {
      const price = parseFloat(product.price) || 0;
      const quantity = parseFloat(product.quantity) || 0;
      const unitPrice = quantity > 0 ? price / quantity : 0;
      return {
        ...product,
        unitPrice,
        isValid: price > 0 && quantity > 0,
      };
    }).filter(p => p.isValid);
  }, [products]);

  const bestValue = useMemo(() => {
    if (calculations.length === 0) return null;
    return calculations.reduce((best, current) =>
      current.unitPrice < best.unitPrice ? current : best
    );
  }, [calculations]);

  const addProduct = () => {
    const newId = (products.length + 1).toString();
    setProducts([...products, { id: newId, name: `Product ${String.fromCharCode(64 + products.length + 1)}`, price: '', quantity: '', unit: 'oz' }]);
  };

  const removeProduct = (id: string) => {
    if (products.length > 2) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const updateProduct = (id: string, field: keyof Product, value: string) => {
    setProducts(products.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const handleCopy = () => {
    let text = 'Unit Price Comparison\n\n';
    calculations.forEach((calc) => {
      text += `${calc.name}: $${calc.price} for ${calc.quantity} ${calc.unit} = $${calc.unitPrice.toFixed(4)}/${calc.unit}`;
      if (bestValue && calc.id === bestValue.id) {
        text += ' (BEST VALUE)';
      }
      text += '\n';
    });
    if (bestValue) {
      text += `\nBest Value: ${bestValue.name} at $${bestValue.unitPrice.toFixed(4)}/${bestValue.unit}`;
    }
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const units = ['oz', 'lb', 'g', 'kg', 'ml', 'L', 'fl oz', 'gal', 'count', 'pack'];

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500/10 rounded-lg">
            <Scale className="w-5 h-5 text-teal-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.unitPriceCalculator.title')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.unitPriceCalculator.description')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-teal-500/10 rounded-xl border border-teal-500/20">
            <Sparkles className="w-4 h-4 text-teal-500" />
            <span className="text-sm text-teal-500 font-medium">{t('tools.unitPriceCalculator.valuesLoaded')}</span>
          </div>
        )}

        {/* Products */}
        <div className="space-y-4">
          {products.map((product, index) => (
            <div
              key={product.id}
              className={`p-4 rounded-lg border ${
                bestValue && product.id === bestValue.id
                  ? isDark ? 'bg-teal-900/20 border-teal-500' : 'bg-teal-50 border-teal-300'
                  : isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={product.name}
                    onChange={(e) => updateProduct(product.id, 'name', e.target.value)}
                    className={`text-sm font-medium bg-transparent border-none focus:outline-none ${isDark ? 'text-white' : 'text-gray-900'}`}
                    placeholder={`Product ${index + 1}`}
                  />
                  {bestValue && product.id === bestValue.id && (
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-teal-500 text-white text-xs rounded-full">
                      <Trophy className="w-3 h-3" /> {t('tools.unitPriceCalculator.bestValue')}
                    </span>
                  )}
                </div>
                {products.length > 2 && (
                  <button
                    onClick={() => removeProduct(product.id)}
                    className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-200 text-gray-500'}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.unitPriceCalculator.price')}</label>
                  <input
                    type="number"
                    value={product.price}
                    onChange={(e) => updateProduct(product.id, 'price', e.target.value)}
                    min="0"
                    step="0.01"
                    className={`w-full px-3 py-2 text-sm rounded-lg border ${
                      isDark ? 'bg-gray-900 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-1">
                  <label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.unitPriceCalculator.quantity')}</label>
                  <input
                    type="number"
                    value={product.quantity}
                    onChange={(e) => updateProduct(product.id, 'quantity', e.target.value)}
                    min="0"
                    step="0.01"
                    className={`w-full px-3 py-2 text-sm rounded-lg border ${
                      isDark ? 'bg-gray-900 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-1">
                  <label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.unitPriceCalculator.unit')}</label>
                  <select
                    value={product.unit}
                    onChange={(e) => updateProduct(product.id, 'unit', e.target.value)}
                    className={`w-full px-3 py-2 text-sm rounded-lg border ${
                      isDark ? 'bg-gray-900 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    {units.map((unit) => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Product Button */}
        <button
          onClick={addProduct}
          className={`w-full py-3 rounded-lg border-2 border-dashed flex items-center justify-center gap-2 transition-colors ${
            isDark
              ? 'border-gray-700 hover:border-teal-500 text-gray-400 hover:text-teal-500'
              : 'border-gray-300 hover:border-teal-500 text-gray-500 hover:text-teal-500'
          }`}
        >
          <Plus className="w-4 h-4" />
          {t('tools.unitPriceCalculator.addProduct')}
        </button>

        {/* Results */}
        {calculations.length > 0 && (
          <div className={`p-6 rounded-xl ${isDark ? 'bg-teal-900/20 border-teal-800' : 'bg-teal-50 border-teal-100'} border`}>
            <div className="flex items-center justify-between mb-4">
              <h4 className={`font-medium ${isDark ? 'text-teal-300' : 'text-teal-700'}`}>
                {t('tools.unitPriceCalculator.unitPriceComparison')}
              </h4>
              <button
                onClick={handleCopy}
                className={`px-3 py-1.5 text-sm rounded-lg flex items-center gap-2 transition-colors ${
                  copied ? 'bg-teal-500 text-white' : isDark ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-white hover:bg-gray-100 text-gray-700'
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? t('tools.unitPriceCalculator.copied') : t('tools.unitPriceCalculator.copy')}
              </button>
            </div>

            <div className="space-y-3">
              {calculations.sort((a, b) => a.unitPrice - b.unitPrice).map((calc, index) => (
                <div
                  key={calc.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    index === 0
                      ? isDark ? 'bg-teal-800/30' : 'bg-teal-100'
                      : isDark ? 'bg-gray-800' : 'bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${
                      index === 0
                        ? 'bg-teal-500 text-white'
                        : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {index + 1}
                    </span>
                    <div>
                      <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{calc.name}</div>
                      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        ${calc.price} for {calc.quantity} {calc.unit}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${index === 0 ? 'text-teal-500' : isDark ? 'text-white' : 'text-gray-900'}`}>
                      ${calc.unitPrice.toFixed(4)}
                    </div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      per {calc.unit}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {bestValue && calculations.length > 1 && (
              <div className={`mt-4 p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  <strong className="text-teal-500">{bestValue.name}</strong> offers the best value at{' '}
                  <strong className="text-teal-500">${bestValue.unitPrice.toFixed(4)}</strong> per {bestValue.unit}
                  {calculations.length > 1 && (
                    <>
                      , saving you{' '}
                      <strong className="text-teal-500">
                        {(((calculations[calculations.length - 1].unitPrice - bestValue.unitPrice) / calculations[calculations.length - 1].unitPrice) * 100).toFixed(1)}%
                      </strong>
                      {' '}compared to the most expensive option.
                    </>
                  )}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <strong>{t('tools.unitPriceCalculator.tip')}:</strong> {t('tools.unitPriceCalculator.tipText')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default UnitPriceCalculatorTool;
