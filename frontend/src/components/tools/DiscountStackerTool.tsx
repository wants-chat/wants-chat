import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Percent, Plus, Trash2, Calculator, ArrowRight, Sparkles, Loader2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import type { ColumnConfig } from '../../lib/toolDataUtils';

interface Discount {
  id: string;
  type: 'percent' | 'fixed';
  value: number;
  name: string;
}

interface DiscountStackerToolProps {
  uiConfig?: UIConfig;
  prefillData?: ToolPrefillData;
}

// Column configuration for exports and syncing
const COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Discount Name', type: 'string' },
  { key: 'type', header: 'Type', type: 'string' },
  { key: 'value', header: 'Value', type: 'number' },
];

// Default discounts for initial state
const DEFAULT_DISCOUNTS: Discount[] = [
  { id: '1', type: 'percent', value: 20, name: 'Store Sale' },
  { id: '2', type: 'percent', value: 10, name: 'Member Discount' },
  { id: '3', type: 'fixed', value: 5, name: 'Coupon' },
];

export const DiscountStackerTool: React.FC<DiscountStackerToolProps> = ({ uiConfig, prefillData }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [originalPrice, setOriginalPrice] = useState('100');
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [stackingMethod, setStackingMethod] = useState<'sequential' | 'combined'>('sequential');

  // Use the useToolData hook for backend persistence
  const {
    data: discounts,
    setData: setDiscounts,
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
  } = useToolData<Discount>('discount-stacker', DEFAULT_DISCOUNTS, COLUMNS);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params && !isPrefilled) {
      const params = uiConfig.params as ToolPrefillData & {
        originalPrice?: string;
        stackingMethod?: 'sequential' | 'combined';
      };
      if (params.originalPrice) setOriginalPrice(params.originalPrice);
      if (params.stackingMethod) setStackingMethod(params.stackingMethod);
      setIsPrefilled(true);
    }
  }, [uiConfig?.params, isPrefilled]);

  // Handle prefill from props
  useEffect(() => {
    if (prefillData?.params) {
      if (prefillData.params.originalPrice) {
        setOriginalPrice(prefillData.params.originalPrice);
      }
      if (prefillData.params.stackingMethod) {
        setStackingMethod(prefillData.params.stackingMethod);
      }
      setIsPrefilled(true);
    }
  }, [prefillData]);

  const calculations = useMemo(() => {
    const price = parseFloat(originalPrice) || 0;
    let finalPrice = price;
    const steps: { description: string; price: number; savings: number }[] = [];

    if (stackingMethod === 'sequential') {
      // Apply discounts one by one
      discounts.forEach((discount) => {
        const beforePrice = finalPrice;
        if (discount.type === 'percent') {
          const reduction = finalPrice * (discount.value / 100);
          finalPrice -= reduction;
          steps.push({
            description: `${discount.name}: ${discount.value}% off`,
            price: finalPrice,
            savings: reduction,
          });
        } else {
          finalPrice -= discount.value;
          if (finalPrice < 0) finalPrice = 0;
          steps.push({
            description: `${discount.name}: $${discount.value} off`,
            price: finalPrice,
            savings: Math.min(discount.value, beforePrice),
          });
        }
      });
    } else {
      // Combined: add all percentages, then apply once
      const totalPercent = discounts
        .filter((d) => d.type === 'percent')
        .reduce((sum, d) => sum + d.value, 0);
      const totalFixed = discounts
        .filter((d) => d.type === 'fixed')
        .reduce((sum, d) => sum + d.value, 0);

      if (totalPercent > 0) {
        const reduction = price * (totalPercent / 100);
        finalPrice -= reduction;
        steps.push({
          description: `Combined ${totalPercent}% off`,
          price: finalPrice,
          savings: reduction,
        });
      }

      if (totalFixed > 0) {
        const reduction = Math.min(totalFixed, finalPrice);
        finalPrice -= reduction;
        if (finalPrice < 0) finalPrice = 0;
        steps.push({
          description: `Fixed discounts: $${totalFixed} off`,
          price: finalPrice,
          savings: reduction,
        });
      }
    }

    const totalSavings = price - finalPrice;
    const savingsPercent = price > 0 ? (totalSavings / price) * 100 : 0;

    return { steps, finalPrice, totalSavings, savingsPercent };
  }, [originalPrice, discounts, stackingMethod]);

  // Add a new discount using hook's addItem
  const handleAddDiscount = () => {
    addItem({
      id: Date.now().toString(),
      type: 'percent',
      value: 10,
      name: 'New Discount',
    });
  };

  // Update a discount using hook's updateItem
  const handleUpdateDiscount = (id: string, field: keyof Discount, value: string | number) => {
    updateItem(id, { [field]: value });
  };

  // Remove a discount using hook's deleteItem
  const handleRemoveDiscount = (id: string) => {
    deleteItem(id);
  };

  const presets = [
    { name: 'Black Friday', discounts: [{ type: 'percent' as const, value: 30, name: 'Black Friday Sale' }] },
    { name: 'Member + Coupon', discounts: [{ type: 'percent' as const, value: 15, name: 'Member' }, { type: 'fixed' as const, value: 10, name: 'Coupon' }] },
    { name: 'Triple Stack', discounts: [{ type: 'percent' as const, value: 20, name: 'Sale' }, { type: 'percent' as const, value: 10, name: 'Email' }, { type: 'percent' as const, value: 5, name: 'App' }] },
  ];

  const applyPreset = (preset: typeof presets[0]) => {
    setDiscounts(preset.discounts.map((d, i) => ({ ...d, id: Date.now().toString() + i })));
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-purple-900/20' : 'bg-gradient-to-r from-white to-purple-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg"><Percent className="w-5 h-5 text-purple-500" /></div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.discountStacker.discountStacker', 'Discount Stacker')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.discountStacker.calculateStackedDiscountsAndSavings', 'Calculate stacked discounts and savings')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <WidgetEmbedButton toolSlug="discount-stacker" toolName="Discount Stacker" />

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
              onExportCSV={() => exportCSV({ filename: 'discount-stacker' })}
              onExportExcel={() => exportExcel({ filename: 'discount-stacker' })}
              onExportJSON={() => exportJSON({ filename: 'discount-stacker' })}
              onExportPDF={() => exportPDF({
                filename: 'discount-stacker',
                title: 'Discount Stacker Results',
                subtitle: `Original: $${parseFloat(originalPrice || '0').toFixed(2)} | Final: $${calculations.finalPrice.toFixed(2)} | Saved: $${calculations.totalSavings.toFixed(2)} (${calculations.savingsPercent.toFixed(1)}%)`
              })}
              onPrint={() => print('Discount Stacker')}
              onCopyToClipboard={() => copyToClipboard('tab')}
              onImportCSV={async (file) => { await importCSV(file); }}
              onImportJSON={async (file) => { await importJSON(file); }}
              theme={isDark ? 'dark' : 'light'}
              disabled={discounts.length === 0}
            />
          </div>
        </div>
      </div>

      {/* Prefill indicator */}
      {isPrefilled && (
        <div className="mx-6 mt-4 flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
          <Sparkles className="w-4 h-4 text-[#0D9488]" />
          <span className="text-sm text-[#0D9488] font-medium">{t('tools.discountStacker.settingsLoadedFromYourConversation', 'Settings loaded from your conversation')}</span>
        </div>
      )}

      <div className="p-6 space-y-6">
        {/* Original Price */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.discountStacker.originalPrice', 'Original Price')}</label>
          <div className="relative">
            <span className={`absolute left-4 top-1/2 -translate-y-1/2 text-xl ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>$</span>
            <input
              type="number"
              value={originalPrice}
              onChange={(e) => setOriginalPrice(e.target.value)}
              className={`w-full pl-10 pr-4 py-4 text-2xl rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
        </div>

        {/* Stacking Method */}
        <div className="flex gap-2">
          <button
            onClick={() => setStackingMethod('sequential')}
            className={`flex-1 py-2 rounded-lg text-sm ${stackingMethod === 'sequential' ? 'bg-purple-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
          >
            {t('tools.discountStacker.sequentialOneByOne', 'Sequential (One by One)')}
          </button>
          <button
            onClick={() => setStackingMethod('combined')}
            className={`flex-1 py-2 rounded-lg text-sm ${stackingMethod === 'combined' ? 'bg-purple-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
          >
            {t('tools.discountStacker.combinedAddTogether', 'Combined (Add Together)')}
          </button>
        </div>

        {/* Presets */}
        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => (
            <button
              key={preset.name}
              onClick={() => applyPreset(preset)}
              className={`px-3 py-1.5 rounded-lg text-sm ${isDark ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
            >
              {preset.name}
            </button>
          ))}
        </div>

        {/* Discounts */}
        <div className="space-y-3">
          <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.discountStacker.discounts', 'Discounts')}</h4>
          {discounts.map((discount, idx) => (
            <div key={discount.id} className={`flex gap-2 items-center p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isDark ? 'bg-purple-900/50 text-purple-400' : 'bg-purple-100 text-purple-600'}`}>
                {idx + 1}
              </span>
              <input
                type="text"
                value={discount.name}
                onChange={(e) => handleUpdateDiscount(discount.id, 'name', e.target.value)}
                placeholder={t('tools.discountStacker.name', 'Name')}
                className={`flex-1 px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
              <select
                value={discount.type}
                onChange={(e) => handleUpdateDiscount(discount.id, 'type', e.target.value)}
                className={`px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              >
                <option value="percent">%</option>
                <option value="fixed">$</option>
              </select>
              <input
                type="number"
                value={discount.value}
                onChange={(e) => handleUpdateDiscount(discount.id, 'value', parseFloat(e.target.value) || 0)}
                className={`w-20 px-3 py-2 rounded-lg border text-sm text-center ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
              <button
                onClick={() => handleRemoveDiscount(discount.id)}
                className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-200 text-gray-500'}`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button
            onClick={handleAddDiscount}
            className={`w-full py-2 rounded-lg border-2 border-dashed flex items-center justify-center gap-2 ${isDark ? 'border-gray-700 text-gray-400' : 'border-gray-300 text-gray-500'}`}
          >
            <Plus className="w-4 h-4" /> Add Discount
          </button>
        </div>

        {/* Calculation Steps */}
        {calculations.steps.length > 0 && (
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-3">
              <Calculator className="w-4 h-4 text-purple-500" />
              <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.discountStacker.calculationBreakdown', 'Calculation Breakdown')}</h4>
            </div>
            <div className="space-y-2">
              <div className={`flex justify-between text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <span>{t('tools.discountStacker.originalPrice2', 'Original Price')}</span>
                <span className="font-mono">${parseFloat(originalPrice || '0').toFixed(2)}</span>
              </div>
              {calculations.steps.map((step, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <ArrowRight className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                  <div className={`flex-1 flex justify-between text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    <span>{step.description}</span>
                    <span className="font-mono">
                      <span className="text-green-500">-${step.savings.toFixed(2)}</span>
                      <span className="mx-2">=</span>
                      ${step.price.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Final Price */}
        <div className={`p-6 rounded-xl text-center ${isDark ? 'bg-purple-900/20 border-purple-800' : 'bg-purple-50 border-purple-200'} border`}>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.discountStacker.finalPrice', 'Final Price')}</div>
          <div className="text-5xl font-bold text-purple-500 my-2">
            ${calculations.finalPrice.toFixed(2)}
          </div>
          <div className="flex justify-center gap-4 text-sm">
            <span className="text-green-500">
              Save ${calculations.totalSavings.toFixed(2)}
            </span>
            <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              ({calculations.savingsPercent.toFixed(1)}% off)
            </span>
          </div>
        </div>

        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <strong>{t('tools.discountStacker.sequential', 'Sequential:')}</strong> Discounts are applied one after another (common in most stores).
            <strong> {t('tools.discountStacker.combined', 'Combined:')}</strong> All percentages are added together first (sometimes allowed with coupons).
          </p>
        </div>
      </div>
    </div>
  );
};

export default DiscountStackerTool;
