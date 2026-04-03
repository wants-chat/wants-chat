'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Calculator,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Loader2,
  DollarSign,
  Percent,
  TrendingUp,
  AlertTriangle,
  Package,
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UIConfig } from '../ContextualUI';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { useToolData } from '../../hooks/useToolData';
import type { ColumnConfig } from '../../lib/toolDataUtils';

interface FoodCostCalculatorToolProps {
  uiConfig?: UIConfig;
}

interface FoodCostItem {
  id: string;
  itemName: string;
  category: string;
  totalFoodCost: number;
  portionCount: number;
  costPerPortion: number;
  sellingPrice: number;
  foodCostPercentage: number;
  grossProfit: number;
  markupPercentage: number;
  targetFoodCost: number;
  suggestedPrice: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

const CATEGORIES = ['Appetizers', 'Entrees', 'Sides', 'Desserts', 'Beverages', 'Specials', 'Catering'];

const FOOD_COST_COLUMNS: ColumnConfig[] = [
  { key: 'itemName', header: 'Item Name', type: 'string' },
  { key: 'category', header: 'Category', type: 'string' },
  { key: 'totalFoodCost', header: 'Total Food Cost', type: 'currency' },
  { key: 'portionCount', header: 'Portions', type: 'number' },
  { key: 'costPerPortion', header: 'Cost/Portion', type: 'currency' },
  { key: 'sellingPrice', header: 'Selling Price', type: 'currency' },
  { key: 'foodCostPercentage', header: 'Food Cost %', type: 'percentage' },
  { key: 'grossProfit', header: 'Gross Profit', type: 'currency' },
];

export const FoodCostCalculatorTool: React.FC<FoodCostCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const {
    data: items,
    setData: setItems,
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
  } = useToolData<FoodCostItem>('food-cost-calculator', [], FOOD_COST_COLUMNS);

  const [showAddForm, setShowAddForm] = useState(true);
  const [editingItem, setEditingItem] = useState<FoodCostItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [targetFoodCostGlobal, setTargetFoodCostGlobal] = useState(30);

  const [newItem, setNewItem] = useState({
    itemName: '',
    category: 'Entrees',
    totalFoodCost: 0,
    portionCount: 1,
    sellingPrice: 0,
    targetFoodCost: 30,
    notes: '',
  });

  const calculateMetrics = (totalCost: number, portions: number, price: number, target: number) => {
    const costPerPortion = portions > 0 ? totalCost / portions : 0;
    const foodCostPercentage = price > 0 ? (costPerPortion / price) * 100 : 0;
    const grossProfit = price - costPerPortion;
    const markupPercentage = costPerPortion > 0 ? ((price - costPerPortion) / costPerPortion) * 100 : 0;
    const suggestedPrice = target > 0 ? costPerPortion / (target / 100) : 0;

    return { costPerPortion, foodCostPercentage, grossProfit, markupPercentage, suggestedPrice };
  };

  const filteredItems = useMemo(() => {
    if (selectedCategory === 'all') return items;
    return items.filter((item) => item.category === selectedCategory);
  }, [items, selectedCategory]);

  const stats = useMemo(() => {
    const totalRevenue = items.reduce((sum, item) => sum + (item.sellingPrice * item.portionCount), 0);
    const totalCost = items.reduce((sum, item) => sum + item.totalFoodCost, 0);
    const totalProfit = items.reduce((sum, item) => sum + (item.grossProfit * item.portionCount), 0);
    const avgFoodCost = totalRevenue > 0 ? (totalCost / totalRevenue) * 100 : 0;
    const itemsAboveTarget = items.filter((item) => item.foodCostPercentage > item.targetFoodCost).length;

    return { totalRevenue, totalCost, totalProfit, avgFoodCost, itemsAboveTarget };
  }, [items]);

  const handleAddItem = () => {
    if (!newItem.itemName) return;

    const metrics = calculateMetrics(
      newItem.totalFoodCost,
      newItem.portionCount,
      newItem.sellingPrice,
      newItem.targetFoodCost
    );

    const item: FoodCostItem = {
      id: `cost-${Date.now()}`,
      itemName: newItem.itemName,
      category: newItem.category,
      totalFoodCost: newItem.totalFoodCost,
      portionCount: newItem.portionCount,
      costPerPortion: metrics.costPerPortion,
      sellingPrice: newItem.sellingPrice,
      foodCostPercentage: metrics.foodCostPercentage,
      grossProfit: metrics.grossProfit,
      markupPercentage: metrics.markupPercentage,
      targetFoodCost: newItem.targetFoodCost,
      suggestedPrice: metrics.suggestedPrice,
      notes: newItem.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addItem(item);
    setNewItem({
      itemName: '',
      category: 'Entrees',
      totalFoodCost: 0,
      portionCount: 1,
      sellingPrice: 0,
      targetFoodCost: targetFoodCostGlobal,
      notes: '',
    });
  };

  const handleUpdateItem = () => {
    if (!editingItem) return;

    const metrics = calculateMetrics(
      editingItem.totalFoodCost,
      editingItem.portionCount,
      editingItem.sellingPrice,
      editingItem.targetFoodCost
    );

    updateItem(editingItem.id, {
      ...editingItem,
      costPerPortion: metrics.costPerPortion,
      foodCostPercentage: metrics.foodCostPercentage,
      grossProfit: metrics.grossProfit,
      markupPercentage: metrics.markupPercentage,
      suggestedPrice: metrics.suggestedPrice,
      updatedAt: new Date().toISOString(),
    });
    setEditingItem(null);
  };

  const handleReset = async () => {
    const confirmed = await confirm({
      title: 'Confirm',
      message: 'Are you sure you want to clear all items?',
      confirmText: 'Yes',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      setItems([]);
    }
  };

  const previewMetrics = useMemo(() => {
    if (!newItem.totalFoodCost || !newItem.portionCount) return null;
    return calculateMetrics(
      newItem.totalFoodCost,
      newItem.portionCount,
      newItem.sellingPrice,
      newItem.targetFoodCost
    );
  }, [newItem]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#0D9488]" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-[#0D9488]/10 rounded-xl">
                  <Calculator className="w-6 h-6 text-[#0D9488]" />
                </div>
                <div>
                  <CardTitle className={isDark ? 'text-white' : 'text-gray-900'}>
                    {t('tools.foodCostCalculator.foodCostCalculator', 'Food Cost Calculator')}
                  </CardTitle>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.foodCostCalculator.calculateFoodCostsPricingAnd', 'Calculate food costs, pricing, and profit margins')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <WidgetEmbedButton toolSlug="food-cost-calculator" toolName="Food Cost Calculator" />

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
                  onExportCSV={() => exportCSV({ filename: 'food-cost' })}
                  onExportExcel={() => exportExcel({ filename: 'food-cost' })}
                  onExportJSON={() => exportJSON({ filename: 'food-cost' })}
                  onExportPDF={() => exportPDF({
                    filename: 'food-cost',
                    title: 'Food Cost Analysis',
                    subtitle: `${items.length} items`,
                  })}
                  onPrint={() => print('Food Cost Analysis')}
                  onCopyToClipboard={() => copyToClipboard('tab')}
                  onImportCSV={async (file) => { await importCSV(file); }}
                  onImportJSON={async (file) => { await importJSON(file); }}
                  theme={isDark ? 'dark' : 'light'}
                  disabled={items.length === 0}
                />
                <button
                  onClick={handleReset}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-red-500 ${
                    isDark ? 'hover:bg-red-900/20' : 'hover:bg-red-50'
                  }`}
                >
                  <RefreshCw className="w-4 h-4" />
                  {t('tools.foodCostCalculator.reset', 'Reset')}
                </button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.foodCostCalculator.totalRevenue', 'Total Revenue')}</div>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              ${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.foodCostCalculator.totalFoodCost', 'Total Food Cost')}</div>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              ${stats.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.foodCostCalculator.totalProfit', 'Total Profit')}</div>
            <div className="text-2xl font-bold text-green-500">
              ${stats.totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.foodCostCalculator.avgFoodCost', 'Avg Food Cost %')}</div>
            <div className={`text-2xl font-bold ${stats.avgFoodCost > 35 ? 'text-red-500' : 'text-green-500'}`}>
              {stats.avgFoodCost.toFixed(1)}%
            </div>
          </div>
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.foodCostCalculator.aboveTarget', 'Above Target')}</div>
            <div className={`text-2xl font-bold ${stats.itemsAboveTarget > 0 ? 'text-red-500' : 'text-green-500'}`}>
              {stats.itemsAboveTarget}
            </div>
          </div>
        </div>

        {/* Target Setting */}
        <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
          <CardContent className="py-4">
            <div className="flex items-center gap-4 flex-wrap">
              <Percent className="w-5 h-5 text-[#0D9488]" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.foodCostCalculator.targetFoodCost', 'Target Food Cost %:')}
              </span>
              <input
                type="number"
                value={targetFoodCostGlobal}
                onChange={(e) => setTargetFoodCostGlobal(parseFloat(e.target.value) || 30)}
                min="1"
                max="100"
                step="0.5"
                className={`w-20 px-3 py-1 border ${
                  isDark
                    ? 'border-gray-600 bg-gray-700 text-white'
                    : 'border-gray-200 bg-white text-gray-900'
                } rounded-lg text-center`}
              />
              <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                {t('tools.foodCostCalculator.industryStandard2835', '(Industry standard: 28-35%)')}
              </span>
              <div className="flex-1 min-w-[200px]">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className={`w-full px-4 py-2 border ${
                    isDark
                      ? 'border-gray-600 bg-gray-700 text-white'
                      : 'border-gray-200 bg-white text-gray-900'
                  } rounded-lg`}
                >
                  <option value="all">{t('tools.foodCostCalculator.allCategories', 'All Categories')}</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calculator Form */}
          <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
            <CardHeader>
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setShowAddForm(!showAddForm)}
              >
                <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <Plus className="w-5 h-5 text-[#0D9488]" />
                  {t('tools.foodCostCalculator.calculateFoodCost', 'Calculate Food Cost')}
                </CardTitle>
                {showAddForm ? (
                  <ChevronUp className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                ) : (
                  <ChevronDown className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                )}
              </div>
            </CardHeader>
            {showAddForm && (
              <CardContent className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.foodCostCalculator.itemName', 'Item Name *')}
                  </label>
                  <input
                    type="text"
                    value={newItem.itemName}
                    onChange={(e) => setNewItem({ ...newItem, itemName: e.target.value })}
                    placeholder={t('tools.foodCostCalculator.eGGrilledChicken', 'e.g., Grilled Chicken')}
                    className={`w-full px-4 py-2 border ${
                      isDark
                        ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400'
                        : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'
                    } rounded-lg`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.foodCostCalculator.category', 'Category')}
                  </label>
                  <select
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                    className={`w-full px-4 py-2 border ${
                      isDark
                        ? 'border-gray-600 bg-gray-700 text-white'
                        : 'border-gray-200 bg-white text-gray-900'
                    } rounded-lg`}
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.foodCostCalculator.totalFoodCost2', 'Total Food Cost ($)')}
                    </label>
                    <input
                      type="number"
                      value={newItem.totalFoodCost || ''}
                      onChange={(e) => setNewItem({ ...newItem, totalFoodCost: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className={`w-full px-4 py-2 border ${
                        isDark
                          ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400'
                          : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'
                      } rounded-lg`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.foodCostCalculator.portions', 'Portions')}
                    </label>
                    <input
                      type="number"
                      value={newItem.portionCount || ''}
                      onChange={(e) => setNewItem({ ...newItem, portionCount: parseInt(e.target.value) || 1 })}
                      placeholder="1"
                      min="1"
                      className={`w-full px-4 py-2 border ${
                        isDark
                          ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400'
                          : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'
                      } rounded-lg`}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.foodCostCalculator.sellingPrice', 'Selling Price ($)')}
                    </label>
                    <input
                      type="number"
                      value={newItem.sellingPrice || ''}
                      onChange={(e) => setNewItem({ ...newItem, sellingPrice: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className={`w-full px-4 py-2 border ${
                        isDark
                          ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400'
                          : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'
                      } rounded-lg`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.foodCostCalculator.targetCost', 'Target Cost %')}
                    </label>
                    <input
                      type="number"
                      value={newItem.targetFoodCost}
                      onChange={(e) => setNewItem({ ...newItem, targetFoodCost: parseFloat(e.target.value) || 30 })}
                      placeholder="30"
                      min="1"
                      max="100"
                      className={`w-full px-4 py-2 border ${
                        isDark
                          ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400'
                          : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'
                      } rounded-lg`}
                    />
                  </div>
                </div>

                {/* Live Preview */}
                {previewMetrics && (
                  <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {t('tools.foodCostCalculator.calculatedResults', 'Calculated Results')}
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.foodCostCalculator.costPortion', 'Cost/Portion:')}</span>
                        <span className={isDark ? 'text-white' : 'text-gray-900'}>
                          ${previewMetrics.costPerPortion.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.foodCostCalculator.foodCost', 'Food Cost %:')}</span>
                        <span className={previewMetrics.foodCostPercentage > newItem.targetFoodCost ? 'text-red-500' : 'text-green-500'}>
                          {previewMetrics.foodCostPercentage.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.foodCostCalculator.grossProfit', 'Gross Profit:')}</span>
                        <span className="text-green-500">${previewMetrics.grossProfit.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.foodCostCalculator.markup', 'Markup:')}</span>
                        <span className={isDark ? 'text-white' : 'text-gray-900'}>
                          {previewMetrics.markupPercentage.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between col-span-2 pt-2 border-t border-gray-300 dark:border-gray-600">
                        <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.foodCostCalculator.suggestedPrice', 'Suggested Price:')}</span>
                        <span className="text-[#0D9488] font-medium">
                          ${previewMetrics.suggestedPrice.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleAddItem}
                  disabled={!newItem.itemName}
                  className="w-full py-3 px-6 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] hover:from-[#2DD4BF] hover:to-[#0D9488] text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  {t('tools.foodCostCalculator.saveCalculation', 'Save Calculation')}
                </button>
              </CardContent>
            )}
          </Card>

          {/* Items List */}
          <div className="lg:col-span-2">
            <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <Package className="w-5 h-5 text-[#0D9488]" />
                  Food Cost Items ({filteredItems.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredItems.length === 0 ? (
                  <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <Calculator className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>{t('tools.foodCostCalculator.noItemsCalculated', 'No items calculated')}</p>
                    <p className="text-sm mt-1">{t('tools.foodCostCalculator.useTheCalculatorToAdd', 'Use the calculator to add items')}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredItems.map((item) => (
                      <div
                        key={item.id}
                        className={`p-4 rounded-xl border ${
                          item.foodCostPercentage > item.targetFoodCost
                            ? 'border-red-500 bg-red-50 dark:bg-red-900/10'
                            : isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {item.itemName}
                              </span>
                              {item.foodCostPercentage > item.targetFoodCost && (
                                <span className="px-2 py-0.5 rounded text-xs bg-red-100 text-red-600 dark:bg-red-900/30 flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3" />
                                  {t('tools.foodCostCalculator.aboveTarget2', 'Above Target')}
                                </span>
                              )}
                              <span className={`text-xs px-2 py-0.5 rounded ${isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
                                {item.category}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                              <div>
                                <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.foodCostCalculator.costPortion2', 'Cost/Portion:')}</span>
                                <span className={isDark ? 'text-white' : 'text-gray-900'}>${item.costPerPortion.toFixed(2)}</span>
                              </div>
                              <div>
                                <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.foodCostCalculator.price', 'Price:')}</span>
                                <span className={isDark ? 'text-white' : 'text-gray-900'}>${item.sellingPrice.toFixed(2)}</span>
                              </div>
                              <div>
                                <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.foodCostCalculator.foodCost2', 'Food Cost:')}</span>
                                <span className={item.foodCostPercentage > item.targetFoodCost ? 'text-red-500' : 'text-green-500'}>
                                  {item.foodCostPercentage.toFixed(1)}%
                                </span>
                              </div>
                              <div>
                                <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.foodCostCalculator.profit', 'Profit:')}</span>
                                <span className="text-green-500">${item.grossProfit.toFixed(2)}</span>
                              </div>
                            </div>
                            {item.foodCostPercentage > item.targetFoodCost && (
                              <div className="mt-2 text-xs text-[#0D9488]">
                                <TrendingUp className="w-3 h-3 inline mr-1" />
                                Suggested price: ${item.suggestedPrice.toFixed(2)} to meet {item.targetFoodCost}% target
                              </div>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => setEditingItem(item)}
                              className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteItem(item.id)}
                              className="p-2 rounded-lg text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Edit Modal */}
        {editingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <Card className={`w-full max-w-md ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className={isDark ? 'text-white' : 'text-gray-900'}>
                    Edit {editingItem.itemName}
                  </CardTitle>
                  <button onClick={() => setEditingItem(null)}>
                    <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.foodCostCalculator.itemName2', 'Item Name')}
                  </label>
                  <input
                    type="text"
                    value={editingItem.itemName}
                    onChange={(e) => setEditingItem({ ...editingItem, itemName: e.target.value })}
                    className={`w-full px-4 py-2 border ${
                      isDark
                        ? 'border-gray-600 bg-gray-700 text-white'
                        : 'border-gray-200 bg-white text-gray-900'
                    } rounded-lg`}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.foodCostCalculator.totalFoodCost3', 'Total Food Cost')}
                    </label>
                    <input
                      type="number"
                      value={editingItem.totalFoodCost}
                      onChange={(e) => setEditingItem({ ...editingItem, totalFoodCost: parseFloat(e.target.value) || 0 })}
                      min="0"
                      step="0.01"
                      className={`w-full px-4 py-2 border ${
                        isDark
                          ? 'border-gray-600 bg-gray-700 text-white'
                          : 'border-gray-200 bg-white text-gray-900'
                      } rounded-lg`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.foodCostCalculator.portions2', 'Portions')}
                    </label>
                    <input
                      type="number"
                      value={editingItem.portionCount}
                      onChange={(e) => setEditingItem({ ...editingItem, portionCount: parseInt(e.target.value) || 1 })}
                      min="1"
                      className={`w-full px-4 py-2 border ${
                        isDark
                          ? 'border-gray-600 bg-gray-700 text-white'
                          : 'border-gray-200 bg-white text-gray-900'
                      } rounded-lg`}
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.foodCostCalculator.sellingPrice2', 'Selling Price')}
                  </label>
                  <input
                    type="number"
                    value={editingItem.sellingPrice}
                    onChange={(e) => setEditingItem({ ...editingItem, sellingPrice: parseFloat(e.target.value) || 0 })}
                    min="0"
                    step="0.01"
                    className={`w-full px-4 py-2 border ${
                      isDark
                        ? 'border-gray-600 bg-gray-700 text-white'
                        : 'border-gray-200 bg-white text-gray-900'
                    } rounded-lg`}
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleUpdateItem}
                    className="flex-1 py-3 px-6 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] text-white font-medium rounded-xl flex items-center justify-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    {t('tools.foodCostCalculator.save', 'Save')}
                  </button>
                  <button
                    onClick={() => setEditingItem(null)}
                    className={`px-6 py-3 rounded-xl font-medium ${
                      isDark
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {t('tools.foodCostCalculator.cancel', 'Cancel')}
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      <ConfirmDialog />
    </div>
  );
};

export default FoodCostCalculatorTool;
