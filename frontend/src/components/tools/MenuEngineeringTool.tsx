'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BarChart3,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Loader2,
  TrendingUp,
  TrendingDown,
  Star,
  DollarSign,
  ShoppingCart,
  Target,
  AlertTriangle,
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UIConfig } from '../ContextualUI';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import type { ColumnConfig } from '../../lib/toolDataUtils';

interface MenuEngineeringToolProps {
  uiConfig?: UIConfig;
}

type MenuCategory = 'star' | 'plowhorse' | 'puzzle' | 'dog';

interface MenuItem {
  id: string;
  name: string;
  category: string;
  menuPrice: number;
  foodCost: number;
  quantitySold: number;
  popularity: number;
  contributionMargin: number;
  foodCostPercentage: number;
  menuCategory: MenuCategory;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

const MENU_CATEGORY_CONFIG: Record<MenuCategory, { label: string; description: string; color: string; bgColor: string; action: string }> = {
  star: {
    label: 'Star',
    description: 'High popularity, high profit',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    action: 'Promote heavily'
  },
  plowhorse: {
    label: 'Plowhorse',
    description: 'High popularity, low profit',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    action: 'Increase price or reduce cost'
  },
  puzzle: {
    label: 'Puzzle',
    description: 'Low popularity, high profit',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    action: 'Promote more, reposition on menu'
  },
  dog: {
    label: 'Dog',
    description: 'Low popularity, low profit',
    color: 'text-red-600',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    action: 'Consider removing or reimagining'
  },
};

const FOOD_CATEGORIES = ['Appetizers', 'Entrees', 'Sides', 'Desserts', 'Beverages', 'Specials'];

const MENU_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Item Name', type: 'string' },
  { key: 'category', header: 'Category', type: 'string' },
  { key: 'menuPrice', header: 'Menu Price', type: 'currency' },
  { key: 'foodCost', header: 'Food Cost', type: 'currency' },
  { key: 'quantitySold', header: 'Qty Sold', type: 'number' },
  { key: 'contributionMargin', header: 'Contribution Margin', type: 'currency' },
  { key: 'foodCostPercentage', header: 'Food Cost %', type: 'percentage' },
  { key: 'menuCategory', header: 'Classification', type: 'string' },
];

export const MenuEngineeringTool: React.FC<MenuEngineeringToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const {
    data: menuItems,
    setData: setMenuItems,
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
  } = useToolData<MenuItem>('menu-engineering', [], MENU_COLUMNS);

  const [showAddForm, setShowAddForm] = useState(true);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedClassification, setSelectedClassification] = useState<string>('all');

  const [newItem, setNewItem] = useState<Partial<MenuItem>>({
    name: '',
    category: 'Entrees',
    menuPrice: 0,
    foodCost: 0,
    quantitySold: 0,
    notes: '',
  });

  // Calculate menu engineering metrics
  const calculateMetrics = (items: MenuItem[]) => {
    const totalSold = items.reduce((sum, item) => sum + item.quantitySold, 0);
    const avgPopularity = totalSold / items.length || 0;
    const avgContributionMargin = items.reduce((sum, item) => sum + item.contributionMargin, 0) / items.length || 0;

    return items.map((item) => {
      const isHighPopularity = item.quantitySold >= avgPopularity;
      const isHighProfit = item.contributionMargin >= avgContributionMargin;

      let menuCategory: MenuCategory;
      if (isHighPopularity && isHighProfit) menuCategory = 'star';
      else if (isHighPopularity && !isHighProfit) menuCategory = 'plowhorse';
      else if (!isHighPopularity && isHighProfit) menuCategory = 'puzzle';
      else menuCategory = 'dog';

      return { ...item, menuCategory };
    });
  };

  const processedItems = useMemo(() => {
    const itemsWithMargins = menuItems.map((item) => ({
      ...item,
      contributionMargin: item.menuPrice - item.foodCost,
      foodCostPercentage: item.menuPrice > 0 ? (item.foodCost / item.menuPrice) * 100 : 0,
      popularity: item.quantitySold,
    }));
    return calculateMetrics(itemsWithMargins);
  }, [menuItems]);

  const filteredItems = useMemo(() => {
    return processedItems.filter((item) => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesClassification = selectedClassification === 'all' || item.menuCategory === selectedClassification;
      return matchesCategory && matchesClassification;
    });
  }, [processedItems, selectedCategory, selectedClassification]);

  const stats = useMemo(() => {
    const stars = processedItems.filter((i) => i.menuCategory === 'star').length;
    const plowhorses = processedItems.filter((i) => i.menuCategory === 'plowhorse').length;
    const puzzles = processedItems.filter((i) => i.menuCategory === 'puzzle').length;
    const dogs = processedItems.filter((i) => i.menuCategory === 'dog').length;
    const totalRevenue = processedItems.reduce((sum, i) => sum + (i.menuPrice * i.quantitySold), 0);
    const totalCost = processedItems.reduce((sum, i) => sum + (i.foodCost * i.quantitySold), 0);
    const totalProfit = totalRevenue - totalCost;
    const avgFoodCost = totalRevenue > 0 ? (totalCost / totalRevenue) * 100 : 0;

    return { stars, plowhorses, puzzles, dogs, totalRevenue, totalCost, totalProfit, avgFoodCost };
  }, [processedItems]);

  const handleAddItem = () => {
    if (!newItem.name || !newItem.menuPrice) return;

    const contributionMargin = (newItem.menuPrice || 0) - (newItem.foodCost || 0);
    const foodCostPercentage = (newItem.menuPrice || 0) > 0
      ? ((newItem.foodCost || 0) / (newItem.menuPrice || 0)) * 100
      : 0;

    const item: MenuItem = {
      id: `menu-${Date.now()}`,
      name: newItem.name || '',
      category: newItem.category || 'Entrees',
      menuPrice: newItem.menuPrice || 0,
      foodCost: newItem.foodCost || 0,
      quantitySold: newItem.quantitySold || 0,
      popularity: newItem.quantitySold || 0,
      contributionMargin,
      foodCostPercentage,
      menuCategory: 'dog', // Will be recalculated
      notes: newItem.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addItem(item);
    setNewItem({
      name: '',
      category: 'Entrees',
      menuPrice: 0,
      foodCost: 0,
      quantitySold: 0,
      notes: '',
    });
  };

  const handleUpdateItem = () => {
    if (!editingItem) return;
    const contributionMargin = editingItem.menuPrice - editingItem.foodCost;
    const foodCostPercentage = editingItem.menuPrice > 0
      ? (editingItem.foodCost / editingItem.menuPrice) * 100
      : 0;

    updateItem(editingItem.id, {
      ...editingItem,
      contributionMargin,
      foodCostPercentage,
      popularity: editingItem.quantitySold,
      updatedAt: new Date().toISOString(),
    });
    setEditingItem(null);
  };

  const handleReset = async () => {
    const confirmed = await confirm({
      title: 'Clear All Menu Items',
      message: 'Are you sure you want to clear all menu items? This action cannot be undone.',
      confirmText: 'Clear All',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      setMenuItems([]);
    }
  };

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
                  <BarChart3 className="w-6 h-6 text-[#0D9488]" />
                </div>
                <div>
                  <CardTitle className={isDark ? 'text-white' : 'text-gray-900'}>
                    {t('tools.menuEngineering.menuEngineeringAnalysis', 'Menu Engineering Analysis')}
                  </CardTitle>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.menuEngineering.analyzeMenuItemProfitabilityAnd', 'Analyze menu item profitability and popularity')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <WidgetEmbedButton toolSlug="menu-engineering" toolName="Menu Engineering" />

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
                  onExportCSV={() => exportCSV({ filename: 'menu-engineering' })}
                  onExportExcel={() => exportExcel({ filename: 'menu-engineering' })}
                  onExportJSON={() => exportJSON({ filename: 'menu-engineering' })}
                  onExportPDF={() => exportPDF({
                    filename: 'menu-engineering',
                    title: 'Menu Engineering Analysis',
                    subtitle: `${menuItems.length} items analyzed`,
                  })}
                  onPrint={() => print('Menu Engineering Analysis')}
                  onCopyToClipboard={() => copyToClipboard('tab')}
                  onImportCSV={async (file) => { await importCSV(file); }}
                  onImportJSON={async (file) => { await importJSON(file); }}
                  theme={isDark ? 'dark' : 'light'}
                  disabled={menuItems.length === 0}
                />
                <button
                  onClick={handleReset}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-red-500 ${
                    isDark ? 'hover:bg-red-900/20' : 'hover:bg-red-50'
                  }`}
                >
                  <RefreshCw className="w-4 h-4" />
                  {t('tools.menuEngineering.reset', 'Reset')}
                </button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Menu Matrix Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(MENU_CATEGORY_CONFIG).map(([key, config]) => {
            const count = stats[key === 'star' ? 'stars' : key === 'plowhorse' ? 'plowhorses' : key === 'puzzle' ? 'puzzles' : 'dogs'];
            return (
              <div
                key={key}
                onClick={() => setSelectedClassification(selectedClassification === key ? 'all' : key)}
                className={`p-4 rounded-xl cursor-pointer transition-all ${config.bgColor} border-2 ${
                  selectedClassification === key ? t('tools.menuEngineering.border0d9488', 'border-[#0D9488]') : 'border-transparent'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`font-bold ${config.color}`}>{config.label}</span>
                  {key === 'star' && <Star className="w-5 h-5 text-yellow-500" />}
                </div>
                <div className={`text-3xl font-bold ${config.color}`}>{count}</div>
                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                  {config.description}
                </div>
              </div>
            );
          })}
        </div>

        {/* Financial Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.menuEngineering.totalRevenue', 'Total Revenue')}</div>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              ${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.menuEngineering.totalFoodCost', 'Total Food Cost')}</div>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              ${stats.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.menuEngineering.totalProfit', 'Total Profit')}</div>
            <div className={`text-2xl font-bold text-green-500`}>
              ${stats.totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.menuEngineering.avgFoodCost', 'Avg Food Cost %')}</div>
            <div className={`text-2xl font-bold ${stats.avgFoodCost > 35 ? 'text-red-500' : 'text-green-500'}`}>
              {stats.avgFoodCost.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
          <CardContent className="py-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.menuEngineering.category', 'Category')}
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className={`w-full px-4 py-2 border ${
                    isDark
                      ? 'border-gray-600 bg-gray-700 text-white'
                      : 'border-gray-200 bg-white text-gray-900'
                  } rounded-lg`}
                >
                  <option value="all">{t('tools.menuEngineering.allCategories', 'All Categories')}</option>
                  {FOOD_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.menuEngineering.classification', 'Classification')}
                </label>
                <select
                  value={selectedClassification}
                  onChange={(e) => setSelectedClassification(e.target.value)}
                  className={`w-full px-4 py-2 border ${
                    isDark
                      ? 'border-gray-600 bg-gray-700 text-white'
                      : 'border-gray-200 bg-white text-gray-900'
                  } rounded-lg`}
                >
                  <option value="all">{t('tools.menuEngineering.allClassifications', 'All Classifications')}</option>
                  {Object.entries(MENU_CATEGORY_CONFIG).map(([key, config]) => (
                    <option key={key} value={key}>{config.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add Item Form */}
          <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
            <CardHeader>
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setShowAddForm(!showAddForm)}
              >
                <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <Plus className="w-5 h-5 text-[#0D9488]" />
                  {t('tools.menuEngineering.addMenuItem', 'Add Menu Item')}
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
                    {t('tools.menuEngineering.itemName', 'Item Name *')}
                  </label>
                  <input
                    type="text"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    placeholder={t('tools.menuEngineering.eGGrilledSalmon', 'e.g., Grilled Salmon')}
                    className={`w-full px-4 py-2 border ${
                      isDark
                        ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400'
                        : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'
                    } rounded-lg`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.menuEngineering.category2', 'Category')}
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
                    {FOOD_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.menuEngineering.menuPrice', 'Menu Price ($) *')}
                    </label>
                    <input
                      type="number"
                      value={newItem.menuPrice || ''}
                      onChange={(e) => setNewItem({ ...newItem, menuPrice: parseFloat(e.target.value) || 0 })}
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
                      {t('tools.menuEngineering.foodCost2', 'Food Cost ($)')}
                    </label>
                    <input
                      type="number"
                      value={newItem.foodCost || ''}
                      onChange={(e) => setNewItem({ ...newItem, foodCost: parseFloat(e.target.value) || 0 })}
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
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.menuEngineering.quantitySoldPeriod', 'Quantity Sold (period)')}
                  </label>
                  <input
                    type="number"
                    value={newItem.quantitySold || ''}
                    onChange={(e) => setNewItem({ ...newItem, quantitySold: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                    min="0"
                    className={`w-full px-4 py-2 border ${
                      isDark
                        ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400'
                        : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'
                    } rounded-lg`}
                  />
                </div>
                {newItem.menuPrice && newItem.foodCost ? (
                  <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <div className="flex justify-between text-sm">
                      <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.menuEngineering.contributionMargin', 'Contribution Margin:')}</span>
                      <span className="font-medium text-green-500">${((newItem.menuPrice || 0) - (newItem.foodCost || 0)).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.menuEngineering.foodCost', 'Food Cost %:')}</span>
                      <span className={`font-medium ${((newItem.foodCost || 0) / (newItem.menuPrice || 1)) * 100 > 35 ? 'text-red-500' : 'text-green-500'}`}>
                        {(((newItem.foodCost || 0) / (newItem.menuPrice || 1)) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ) : null}
                <button
                  onClick={handleAddItem}
                  disabled={!newItem.name || !newItem.menuPrice}
                  className="w-full py-3 px-6 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] hover:from-[#2DD4BF] hover:to-[#0D9488] text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  {t('tools.menuEngineering.addItem', 'Add Item')}
                </button>
              </CardContent>
            )}
          </Card>

          {/* Menu Items List */}
          <div className="lg:col-span-2">
            <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <BarChart3 className="w-5 h-5 text-[#0D9488]" />
                  Menu Items ({filteredItems.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredItems.length === 0 ? (
                  <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>{t('tools.menuEngineering.noMenuItemsFound', 'No menu items found')}</p>
                    <p className="text-sm mt-1">{t('tools.menuEngineering.addItemsToAnalyzeYour', 'Add items to analyze your menu')}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredItems.map((item) => {
                      const categoryConfig = MENU_CATEGORY_CONFIG[item.menuCategory];
                      return (
                        <div
                          key={item.id}
                          className={`p-4 rounded-xl border ${
                            isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                  {item.name}
                                </span>
                                <span className={`px-2 py-0.5 rounded text-xs ${categoryConfig.color} ${categoryConfig.bgColor}`}>
                                  {categoryConfig.label}
                                </span>
                                <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {item.category}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                                <div>
                                  <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.menuEngineering.price', 'Price:')}</span>
                                  <span className={isDark ? 'text-white' : 'text-gray-900'}>${item.menuPrice.toFixed(2)}</span>
                                </div>
                                <div>
                                  <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.menuEngineering.cost', 'Cost:')}</span>
                                  <span className={isDark ? 'text-white' : 'text-gray-900'}>${item.foodCost.toFixed(2)}</span>
                                </div>
                                <div>
                                  <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.menuEngineering.margin', 'Margin:')}</span>
                                  <span className="text-green-500">${item.contributionMargin.toFixed(2)}</span>
                                </div>
                                <div>
                                  <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.menuEngineering.sold', 'Sold:')}</span>
                                  <span className={isDark ? 'text-white' : 'text-gray-900'}>{item.quantitySold}</span>
                                </div>
                              </div>
                              <div className={`mt-2 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                <Target className="w-3 h-3 inline mr-1" />
                                Recommendation: {categoryConfig.action}
                              </div>
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
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <ConfirmDialog />

        {/* Edit Modal */}
        {editingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <Card className={`w-full max-w-md ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className={isDark ? 'text-white' : 'text-gray-900'}>
                    Edit {editingItem.name}
                  </CardTitle>
                  <button onClick={() => setEditingItem(null)}>
                    <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.menuEngineering.itemName2', 'Item Name')}
                  </label>
                  <input
                    type="text"
                    value={editingItem.name}
                    onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
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
                      {t('tools.menuEngineering.menuPrice2', 'Menu Price ($)')}
                    </label>
                    <input
                      type="number"
                      value={editingItem.menuPrice}
                      onChange={(e) => setEditingItem({ ...editingItem, menuPrice: parseFloat(e.target.value) || 0 })}
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
                      {t('tools.menuEngineering.foodCost3', 'Food Cost ($)')}
                    </label>
                    <input
                      type="number"
                      value={editingItem.foodCost}
                      onChange={(e) => setEditingItem({ ...editingItem, foodCost: parseFloat(e.target.value) || 0 })}
                      min="0"
                      step="0.01"
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
                    {t('tools.menuEngineering.quantitySold', 'Quantity Sold')}
                  </label>
                  <input
                    type="number"
                    value={editingItem.quantitySold}
                    onChange={(e) => setEditingItem({ ...editingItem, quantitySold: parseInt(e.target.value) || 0 })}
                    min="0"
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
                    {t('tools.menuEngineering.save', 'Save')}
                  </button>
                  <button
                    onClick={() => setEditingItem(null)}
                    className={`px-6 py-3 rounded-xl font-medium ${
                      isDark
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {t('tools.menuEngineering.cancel', 'Cancel')}
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuEngineeringTool;
