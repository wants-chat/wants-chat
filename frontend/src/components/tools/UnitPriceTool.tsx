import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Scale, Plus, Trash2, Trophy, Calculator, Sparkles, Loader2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import type { ColumnConfig } from '../../lib/toolDataUtils';

interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
}

const units = [
  { value: 'oz', label: 'Ounces (oz)', category: 'weight' },
  { value: 'lb', label: 'Pounds (lb)', category: 'weight' },
  { value: 'g', label: 'Grams (g)', category: 'weight' },
  { value: 'kg', label: 'Kilograms (kg)', category: 'weight' },
  { value: 'ml', label: 'Milliliters (ml)', category: 'volume' },
  { value: 'l', label: 'Liters (L)', category: 'volume' },
  { value: 'fl_oz', label: 'Fluid Ounces (fl oz)', category: 'volume' },
  { value: 'gal', label: 'Gallons (gal)', category: 'volume' },
  { value: 'ct', label: 'Count (ct)', category: 'count' },
  { value: 'pk', label: 'Pack (pk)', category: 'count' },
  { value: 'ft', label: 'Feet (ft)', category: 'length' },
  { value: 'm', label: 'Meters (m)', category: 'length' },
  { value: 'sq_ft', label: 'Square Feet (sq ft)', category: 'area' },
];

// Conversion factors to base units (g, ml, ct, m, sq_m)
const conversions: Record<string, { base: string; factor: number }> = {
  oz: { base: 'g', factor: 28.3495 },
  lb: { base: 'g', factor: 453.592 },
  g: { base: 'g', factor: 1 },
  kg: { base: 'g', factor: 1000 },
  ml: { base: 'ml', factor: 1 },
  l: { base: 'ml', factor: 1000 },
  fl_oz: { base: 'ml', factor: 29.5735 },
  gal: { base: 'ml', factor: 3785.41 },
  ct: { base: 'ct', factor: 1 },
  pk: { base: 'ct', factor: 1 },
  ft: { base: 'm', factor: 0.3048 },
  m: { base: 'm', factor: 1 },
  sq_ft: { base: 'sq_m', factor: 0.0929 },
};

// Column configuration for persistence and exports
const COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Product Name', type: 'string' },
  { key: 'price', header: 'Price ($)', type: 'currency' },
  { key: 'quantity', header: 'Quantity', type: 'number' },
  { key: 'unit', header: 'Unit', type: 'string' },
];

interface UnitPriceToolProps {
  uiConfig?: UIConfig;
}

export const UnitPriceTool: React.FC<UnitPriceToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Default products for new users
  const defaultProducts: Product[] = [
    { id: '1', name: 'Product A', price: 4.99, quantity: 16, unit: 'oz' },
    { id: '2', name: 'Product B', price: 7.99, quantity: 32, unit: 'oz' },
  ];

  // Use the useToolData hook for backend persistence
  const {
    data: products,
    setData: setProducts,
    addItem,
    updateItem,
    deleteItem,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    importCSV,
    importJSON,
    copyToClipboard,
    print,
    isLoading,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<Product>('unit-price-calculator', defaultProducts, COLUMNS);

  const [isPrefilled, setIsPrefilled] = useState(false);

  // Prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.items && params.items.length > 0) {
        const newProducts = params.items.map((item: any, idx: number) => ({
          id: Date.now().toString() + idx,
          name: item.name || `Product ${String.fromCharCode(65 + idx)}`,
          price: item.price || 0,
          quantity: item.quantity || 0,
          unit: item.unit || 'oz',
        }));
        setProducts(newProducts);
        setIsPrefilled(true);
      }
      if (params.formData) {
        // Could have formData with products array
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const addProduct = () => {
    const newProduct: Product = {
      id: Date.now().toString(),
      name: `Product ${String.fromCharCode(65 + products.length)}`,
      price: 0,
      quantity: 0,
      unit: 'oz',
    };
    addItem(newProduct);
  };

  const removeProduct = (id: string) => {
    deleteItem(id);
  };

  const updateProduct = (id: string, field: keyof Product, value: any) => {
    updateItem(id, { [field]: value });
  };

  const calculateUnitPrice = (product: Product): number => {
    if (product.quantity <= 0) return Infinity;
    const conversion = conversions[product.unit];
    const baseQuantity = product.quantity * conversion.factor;
    return product.price / baseQuantity;
  };

  const productsWithUnitPrice = useMemo(() => {
    const grouped: Record<string, (Product & { unitPrice: number; baseUnit: string })[]> = {};

    products.forEach(p => {
      const conversion = conversions[p.unit];
      const baseUnit = conversion.base;
      const unitPrice = calculateUnitPrice(p);

      if (!grouped[baseUnit]) grouped[baseUnit] = [];
      grouped[baseUnit].push({ ...p, unitPrice, baseUnit });
    });

    return grouped;
  }, [products]);

  const findBestDeal = (items: (Product & { unitPrice: number })[]) => {
    if (items.length === 0) return null;
    return items.reduce((best, current) =>
      current.unitPrice < best.unitPrice ? current : best
    );
  };

  const formatUnitPrice = (price: number, baseUnit: string): string => {
    if (!isFinite(price)) return 'N/A';

    // Display in more readable units
    switch (baseUnit) {
      case 'g':
        if (price * 100 < 1) return `$${(price * 1000).toFixed(4)}/kg`;
        return `$${(price * 100).toFixed(4)}/100g`;
      case 'ml':
        if (price * 100 < 1) return `$${(price * 1000).toFixed(4)}/L`;
        return `$${(price * 100).toFixed(4)}/100ml`;
      case 'ct':
        return `$${price.toFixed(4)}/each`;
      case 'm':
        return `$${price.toFixed(4)}/m`;
      case 'sq_m':
        return `$${price.toFixed(4)}/sq m`;
      default:
        return `$${price.toFixed(4)}/${baseUnit}`;
    }
  };

  const getSavingsPercentage = (current: number, best: number): number => {
    if (!isFinite(current) || !isFinite(best) || best === 0) return 0;
    return ((current - best) / current) * 100;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      </div>
    );
  }

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-amber-900/20' : 'bg-gradient-to-r from-white to-amber-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <Scale className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.unitPrice.title')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.unitPrice.description')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <WidgetEmbedButton toolSlug="unit-price" toolName="Unit Price" />

            <SyncStatus
              isSynced={isSynced}
              isSaving={isSaving}
              lastSaved={lastSaved}
              syncError={syncError}
              onForceSync={forceSync}
              theme={isDark ? 'dark' : 'light'}
              size="sm"
            />
            <ExportDropdown
              onExportCSV={() => exportCSV({ filename: 'unit_price_comparison' })}
              onExportExcel={() => exportExcel({ filename: 'unit_price_comparison' })}
              onExportJSON={() => exportJSON({ filename: 'unit_price_comparison' })}
              onExportPDF={() => exportPDF({
                filename: 'unit_price_comparison',
                title: 'Unit Price Comparison',
                subtitle: 'Product price comparison by unit',
              })}
              onPrint={() => print('Unit Price Comparison')}
              onCopyToClipboard={() => copyToClipboard('tab')}
              onImportCSV={async (file) => { await importCSV(file); }}
              onImportJSON={async (file) => { await importJSON(file); }}
              disabled={products.length === 0}
              theme={isDark ? 'dark' : 'light'}
            />
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.unitPrice.contentLoaded')}</span>
          </div>
        )}

        {/* Products List */}
        <div className="space-y-4">
          {products.map((product, index) => (
            <div
              key={product.id}
              className={`p-4 rounded-xl border ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Name */}
                  <div className="space-y-1">
                    <label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.unitPrice.name')}</label>
                    <input
                      type="text"
                      value={product.name}
                      onChange={(e) => updateProduct(product.id, 'name', e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark
                          ? 'bg-gray-800 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>

                  {/* Price */}
                  <div className="space-y-1">
                    <label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.unitPrice.price')}</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={product.price || ''}
                      onChange={(e) => updateProduct(product.id, 'price', parseFloat(e.target.value) || 0)}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark
                          ? 'bg-gray-800 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>

                  {/* Quantity */}
                  <div className="space-y-1">
                    <label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.unitPrice.quantity')}</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={product.quantity || ''}
                      onChange={(e) => updateProduct(product.id, 'quantity', parseFloat(e.target.value) || 0)}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark
                          ? 'bg-gray-800 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>

                  {/* Unit */}
                  <div className="space-y-1">
                    <label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.unitPrice.unit')}</label>
                    <select
                      value={product.unit}
                      onChange={(e) => updateProduct(product.id, 'unit', e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark
                          ? 'bg-gray-800 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      {units.map((u) => (
                        <option key={u.value} value={u.value}>
                          {u.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  onClick={() => removeProduct(product.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-200 text-gray-500'
                  }`}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Product Button */}
        <button
          onClick={addProduct}
          className={`w-full py-3 rounded-xl border-2 border-dashed transition-colors flex items-center justify-center gap-2 ${
            isDark
              ? 'border-gray-600 hover:border-amber-500 hover:bg-amber-500/10 text-gray-400 hover:text-amber-400'
              : 'border-gray-300 hover:border-amber-500 hover:bg-amber-50 text-gray-500 hover:text-amber-600'
          }`}
        >
          <Plus className="w-5 h-5" />
          {t('tools.unitPrice.addProduct')}
        </button>

        {/* Results */}
        {Object.keys(productsWithUnitPrice).length > 0 && (
          <div className="space-y-4">
            <h4 className={`font-medium flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <Calculator className="w-5 h-5" />
              {t('tools.unitPrice.comparisonResults')}
            </h4>

            {Object.entries(productsWithUnitPrice).map(([baseUnit, items]) => {
              const bestDeal = findBestDeal(items);
              if (!bestDeal || items.length < 2) return null;

              return (
                <div key={baseUnit} className={`rounded-xl border overflow-hidden ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className={`px-4 py-2 text-sm font-medium ${isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                    {baseUnit === 'g' ? t('tools.unitPrice.weight') : baseUnit === 'ml' ? t('tools.unitPrice.volume') : baseUnit === 'ct' ? t('tools.unitPrice.count') : t('tools.unitPrice.other')} {t('tools.unitPrice.comparison')}
                  </div>
                  <div className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                    {items
                      .sort((a, b) => a.unitPrice - b.unitPrice)
                      .map((item, index) => {
                        const isBest = item.id === bestDeal.id;
                        const savings = getSavingsPercentage(item.unitPrice, bestDeal.unitPrice);

                        return (
                          <div
                            key={item.id}
                            className={`p-4 flex items-center justify-between ${
                              isBest
                                ? isDark ? 'bg-green-900/20' : 'bg-green-50'
                                : isDark ? 'bg-gray-900' : 'bg-white'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {isBest && (
                                <Trophy className="w-5 h-5 text-amber-500" />
                              )}
                              <div>
                                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                  {item.name}
                                </p>
                                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                  ${item.price.toFixed(2)} for {item.quantity} {item.unit}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`font-mono font-medium ${isBest ? 'text-green-500' : isDark ? 'text-white' : 'text-gray-900'}`}>
                                {formatUnitPrice(item.unitPrice, item.baseUnit)}
                              </p>
                              {!isBest && savings > 0 && (
                                <p className="text-sm text-red-500">
                                  {savings.toFixed(1)}% {t('tools.unitPrice.moreExpensive')}
                                </p>
                              )}
                              {isBest && (
                                <p className="text-sm text-green-500 font-medium">
                                  {t('tools.unitPrice.bestDeal')}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-amber-50'}`}>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-amber-800'}`}>
            <strong>{t('tools.unitPrice.tip')}:</strong> {t('tools.unitPrice.tipText')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default UnitPriceTool;
