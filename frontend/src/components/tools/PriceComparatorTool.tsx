import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ShoppingCart, Plus, Trash2, ArrowUpDown, Tag, Sparkles, Loader2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useToolData } from '../../hooks/useToolData';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import type { ColumnConfig } from '../../lib/toolDataUtils';

interface PriceComparatorToolProps {
  uiConfig?: UIConfig;
}

interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
  store: string;
}

// Column configuration for exports
const COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Product', type: 'string' },
  { key: 'store', header: 'Store', type: 'string' },
  { key: 'price', header: 'Price', type: 'currency' },
  { key: 'quantity', header: 'Quantity', type: 'number' },
  { key: 'unit', header: 'Unit', type: 'string' },
  { key: 'pricePerUnit', header: 'Price Per Unit', type: 'number', format: (v) => `$${v.toFixed(3)}` },
];

export const PriceComparatorTool: React.FC<PriceComparatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

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
  } = useToolData<Product>('price-comparator', [], COLUMNS);

  const [sortBy, setSortBy] = useState<'pricePerUnit' | 'totalPrice' | 'name'>('pricePerUnit');

  // Handle prefill from conversation
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.amount) {
        // Would prefill price if applicable
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const units = ['g', 'kg', 'oz', 'lb', 'ml', 'l', 'count', 'pack'];

  const calculatePricePerUnit = (price: number, quantity: number): number => {
    return quantity > 0 ? price / quantity : 0;
  };

  const sortedProducts = useMemo(() => {
    return [...products].sort((a, b) => {
      switch (sortBy) {
        case 'pricePerUnit':
          return calculatePricePerUnit(a.price, a.quantity) - calculatePricePerUnit(b.price, b.quantity);
        case 'totalPrice':
          return a.price - b.price;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
  }, [products, sortBy]);

  const groupedByName = useMemo(() => {
    const groups: Record<string, Product[]> = {};
    sortedProducts.forEach((p) => {
      const key = p.name.toLowerCase();
      if (!groups[key]) groups[key] = [];
      groups[key].push(p);
    });
    return groups;
  }, [sortedProducts]);

  const getBestDeal = (items: Product[]): string => {
    if (items.length < 2) return '';
    const best = items.reduce((prev, curr) =>
      calculatePricePerUnit(curr.price, curr.quantity) < calculatePricePerUnit(prev.price, prev.quantity) ? curr : prev
    );
    return best.id;
  };

  const addProduct = () => {
    const newProduct: Product = {
      id: Date.now().toString(),
      name: '',
      price: 0,
      quantity: 1,
      unit: 'count',
      store: '',
    };
    addItem(newProduct);
  };

  const handleUpdateProduct = (id: string, field: keyof Product, value: string | number) => {
    updateItem(id, { [field]: value });
  };

  const removeProduct = (id: string) => {
    deleteItem(id);
  };

  const totalSavings = useMemo(() => {
    let savings = 0;
    Object.values(groupedByName).forEach((items) => {
      if (items.length >= 2) {
        const pricesPerUnit = items.map((i) => calculatePricePerUnit(i.price, i.quantity));
        const min = Math.min(...pricesPerUnit);
        const max = Math.max(...pricesPerUnit);
        savings += (max - min) * items[0].quantity;
      }
    });
    return savings;
  }, [groupedByName]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    );
  }

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-pink-900/20' : 'bg-gradient-to-r from-white to-pink-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-500/10 rounded-lg"><ShoppingCart className="w-5 h-5 text-pink-500" /></div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.priceComparator.priceComparator', 'Price Comparator')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.priceComparator.compareUnitPricesAcrossStores', 'Compare unit prices across stores')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <WidgetEmbedButton toolSlug="price-comparator" toolName="Price Comparator" />

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
              onExportCSV={() => exportCSV({ filename: 'price_comparison' })}
              onExportExcel={() => exportExcel({ filename: 'price_comparison' })}
              onExportJSON={() => exportJSON({ filename: 'price_comparison' })}
              onExportPDF={() => exportPDF({ filename: 'price_comparison', title: 'Price Comparison Report' })}
              onPrint={() => print('Price Comparison Report')}
              onCopyToClipboard={() => copyToClipboard('tab')}
              onImportCSV={async (file) => { await importCSV(file); }}
              onImportJSON={async (file) => { await importJSON(file); }}
              theme={isDark ? 'dark' : 'light'}
              disabled={products.length === 0}
            />
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-pink-500/10 rounded-xl border border-pink-500/20">
            <Sparkles className="w-4 h-4 text-pink-500" />
            <span className="text-sm text-pink-500 font-medium">{t('tools.priceComparator.dataLoadedFromYourConversation', 'Data loaded from your conversation')}</span>
          </div>
        )}

        {/* Summary Card */}
        {totalSavings > 0 && (
          <div className={`p-4 rounded-xl ${isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'} border`}>
            <div className="flex items-center gap-2">
              <Tag className="w-5 h-5 text-green-500" />
              <span className={`font-medium ${isDark ? 'text-green-400' : 'text-green-700'}`}>
                Potential savings: ${totalSavings.toFixed(2)} by choosing best deals
              </span>
            </div>
          </div>
        )}

        {/* Sort Options */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.priceComparator.sortBy', 'Sort by:')}</span>
          <div className="flex gap-2">
            {[
              { key: 'pricePerUnit', label: 'Price/Unit' },
              { key: 'totalPrice', label: 'Total Price' },
              { key: 'name', label: 'Name' },
            ].map((option) => (
              <button
                key={option.key}
                onClick={() => setSortBy(option.key as typeof sortBy)}
                className={`px-3 py-1.5 rounded-lg text-sm ${sortBy === option.key ? 'bg-pink-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Products Table */}
        <div className="space-y-3">
          <div className="grid grid-cols-12 gap-2 text-xs font-medium px-2">
            <div className={`col-span-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.priceComparator.product', 'Product')}</div>
            <div className={`col-span-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.priceComparator.store', 'Store')}</div>
            <div className={`col-span-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.priceComparator.price', 'Price')}</div>
            <div className={`col-span-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.priceComparator.quantity', 'Quantity')}</div>
            <div className={`col-span-2 text-pink-500`}>{t('tools.priceComparator.perUnit', 'Per Unit')}</div>
            <div className="col-span-1"></div>
          </div>

          {sortedProducts.map((product) => {
            const pricePerUnit = calculatePricePerUnit(product.price, product.quantity);
            const group = groupedByName[product.name.toLowerCase()];
            const isBestDeal = group && group.length > 1 && getBestDeal(group) === product.id;

            return (
              <div
                key={product.id}
                className={`grid grid-cols-12 gap-2 items-center p-2 rounded-lg ${isBestDeal ? (isDark ? 'bg-green-900/20 ring-1 ring-green-500' : 'bg-green-50 ring-1 ring-green-300') : isDark ? 'bg-gray-800' : 'bg-gray-50'}`}
              >
                <input
                  type="text"
                  value={product.name}
                  onChange={(e) => handleUpdateProduct(product.id, 'name', e.target.value)}
                  placeholder={t('tools.priceComparator.product2', 'Product')}
                  className={`col-span-3 px-2 py-2 rounded-lg border text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
                <input
                  type="text"
                  value={product.store}
                  onChange={(e) => handleUpdateProduct(product.id, 'store', e.target.value)}
                  placeholder={t('tools.priceComparator.store2', 'Store')}
                  className={`col-span-2 px-2 py-2 rounded-lg border text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
                <div className="col-span-2 flex items-center">
                  <span className={`${isDark ? 'text-gray-400' : 'text-gray-500'} mr-1`}>$</span>
                  <input
                    type="number"
                    value={product.price || ''}
                    onChange={(e) => handleUpdateProduct(product.id, 'price', parseFloat(e.target.value) || 0)}
                    className={`w-full px-2 py-2 rounded-lg border text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div className="col-span-2 flex gap-1">
                  <input
                    type="number"
                    value={product.quantity || ''}
                    onChange={(e) => handleUpdateProduct(product.id, 'quantity', parseFloat(e.target.value) || 0)}
                    className={`w-16 px-2 py-2 rounded-lg border text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                  <select
                    value={product.unit}
                    onChange={(e) => handleUpdateProduct(product.id, 'unit', e.target.value)}
                    className={`flex-1 px-1 py-2 rounded-lg border text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  >
                    {units.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
                <div className={`col-span-2 px-2 py-2 rounded-lg text-center font-medium ${isBestDeal ? 'bg-green-500 text-white' : isDark ? 'bg-pink-900/30 text-pink-400' : 'bg-pink-100 text-pink-700'}`}>
                  ${pricePerUnit.toFixed(3)}/{product.unit}
                </div>
                <button
                  onClick={() => removeProduct(product.id)}
                  className={`col-span-1 p-2 rounded-lg ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-200 text-gray-500'}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}

          <button
            onClick={addProduct}
            className={`w-full py-2 rounded-lg border-2 border-dashed flex items-center justify-center gap-2 ${isDark ? 'border-gray-700 text-gray-400 hover:border-gray-600' : 'border-gray-300 text-gray-500 hover:border-gray-400'}`}
          >
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>

        {/* Comparison Summary by Product */}
        {Object.keys(groupedByName).length > 0 && (
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
            <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.priceComparator.comparisonSummary', 'Comparison Summary')}</h4>
            <div className="space-y-2">
              {Object.entries(groupedByName).map(([name, items]) => {
                if (items.length < 2) return null;
                const bestId = getBestDeal(items);
                const best = items.find((i) => i.id === bestId);
                if (!best) return null;
                return (
                  <div key={name} className={`flex justify-between items-center text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    <span className="capitalize">{name}</span>
                    <span className="text-green-500">
                      Best: {best.store} (${calculatePricePerUnit(best.price, best.quantity).toFixed(3)}/{best.unit})
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <strong>{t('tools.priceComparator.tip', 'Tip:')}</strong> Compare products with the same name to find the best deal. Green highlighting shows the best price per unit.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PriceComparatorTool;
