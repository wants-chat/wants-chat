'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  Package,
  Plus,
  Trash2,
  Edit3,
  Search,
  Filter,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  Calendar,
  DollarSign,
  Scale,
  Warehouse,
  Sparkles,
} from 'lucide-react';
import { UIConfig } from '../ContextualUI';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import useToolData from '../../hooks/useToolData';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';
import { useTheme } from '@/contexts/ThemeContext';

interface IngredientInventoryToolProps {
  uiConfig?: UIConfig;
}

// Types
type IngredientCategory = 'flour' | 'sugar' | 'dairy' | 'eggs' | 'fats' | 'leavening' | 'flavorings' | 'fruits' | 'nuts' | 'chocolate' | 'other';
type MeasurementUnit = 'kg' | 'lb' | 'g' | 'oz' | 'L' | 'gal' | 'ml' | 'each' | 'dozen';
type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock' | 'on_order';

interface IngredientItem {
  id: string;
  name: string;
  category: IngredientCategory;
  sku: string;
  currentStock: number;
  unit: MeasurementUnit;
  minStock: number;
  maxStock: number;
  reorderPoint: number;
  reorderQuantity: number;
  costPerUnit: number;
  supplier: string;
  supplierSku?: string;
  location: string;
  expirationDate?: string;
  lastRestocked: string;
  status: StockStatus;
  isActive: boolean;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface StockTransaction {
  id: string;
  ingredientId: string;
  type: 'in' | 'out' | 'adjustment' | 'waste';
  quantity: number;
  reason: string;
  performedBy: string;
  date: string;
  notes?: string;
}

// Constants
const INGREDIENT_CATEGORIES: { value: IngredientCategory; label: string }[] = [
  { value: 'flour', label: 'Flour & Grains' },
  { value: 'sugar', label: 'Sugars & Sweeteners' },
  { value: 'dairy', label: 'Dairy Products' },
  { value: 'eggs', label: 'Eggs' },
  { value: 'fats', label: 'Fats & Oils' },
  { value: 'leavening', label: 'Leavening Agents' },
  { value: 'flavorings', label: 'Flavorings & Extracts' },
  { value: 'fruits', label: 'Fruits' },
  { value: 'nuts', label: 'Nuts & Seeds' },
  { value: 'chocolate', label: 'Chocolate & Cocoa' },
  { value: 'other', label: 'Other' },
];

const MEASUREMENT_UNITS: { value: MeasurementUnit; label: string }[] = [
  { value: 'kg', label: 'Kilograms (kg)' },
  { value: 'lb', label: 'Pounds (lb)' },
  { value: 'g', label: 'Grams (g)' },
  { value: 'oz', label: 'Ounces (oz)' },
  { value: 'L', label: 'Liters (L)' },
  { value: 'gal', label: 'Gallons (gal)' },
  { value: 'ml', label: 'Milliliters (ml)' },
  { value: 'each', label: 'Each' },
  { value: 'dozen', label: 'Dozen' },
];

const STOCK_STATUSES: { value: StockStatus; label: string; color: string }[] = [
  { value: 'in_stock', label: 'In Stock', color: 'green' },
  { value: 'low_stock', label: 'Low Stock', color: 'yellow' },
  { value: 'out_of_stock', label: 'Out of Stock', color: 'red' },
  { value: 'on_order', label: 'On Order', color: 'blue' },
];

// Column configuration for exports
const INVENTORY_COLUMNS: ColumnConfig[] = [
  { key: 'sku', header: 'SKU', type: 'string' },
  { key: 'name', header: 'Item Name', type: 'string' },
  { key: 'category', header: 'Category', type: 'string' },
  { key: 'currentStock', header: 'Stock', type: 'number' },
  { key: 'unit', header: 'Unit', type: 'string' },
  { key: 'minStock', header: 'Min Stock', type: 'number' },
  { key: 'reorderPoint', header: 'Reorder At', type: 'number' },
  { key: 'costPerUnit', header: 'Cost/Unit', type: 'currency' },
  { key: 'supplier', header: 'Supplier', type: 'string' },
  { key: 'location', header: 'Location', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
];

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);
const generateSku = (category: string) => `${category.substring(0, 3).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const getStockStatus = (current: number, min: number, reorderPoint: number): StockStatus => {
  if (current <= 0) return 'out_of_stock';
  if (current <= reorderPoint) return 'low_stock';
  return 'in_stock';
};

// Main Component
export const IngredientInventoryTool: React.FC<IngredientInventoryToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // useToolData hook for backend sync
  const {
    data: inventory,
    addItem: addItemToBackend,
    updateItem: updateItemBackend,
    deleteItem: deleteItemBackend,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<IngredientItem>('bakery-ingredient-inventory', [], INVENTORY_COLUMNS);

  const {
    data: transactions,
    addItem: addTransactionToBackend,
  } = useToolData<StockTransaction>('bakery-stock-transactions', [], []);

  // Local UI State
  const [activeTab, setActiveTab] = useState<'inventory' | 'new' | 'transactions' | 'reorder'>('inventory');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'stock' | 'category'>('name');
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<IngredientItem | null>(null);

  // New item form state
  const [newItem, setNewItem] = useState<Partial<IngredientItem>>({
    name: '',
    category: 'flour',
    currentStock: 0,
    unit: 'kg',
    minStock: 0,
    maxStock: 0,
    reorderPoint: 0,
    reorderQuantity: 0,
    costPerUnit: 0,
    supplier: '',
    location: '',
    notes: '',
  });

  // Adjustment state
  const [adjustment, setAdjustment] = useState({
    type: 'in' as 'in' | 'out' | 'adjustment' | 'waste',
    quantity: 0,
    reason: '',
    performedBy: 'Baker',
    notes: '',
  });

  // Add new item
  const addItem = () => {
    if (!newItem.name) {
      setValidationMessage('Please enter an item name');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const status = getStockStatus(
      newItem.currentStock || 0,
      newItem.minStock || 0,
      newItem.reorderPoint || 0
    );

    const item: IngredientItem = {
      id: generateId(),
      sku: generateSku(newItem.category || 'other'),
      name: newItem.name || '',
      category: newItem.category || 'other',
      currentStock: newItem.currentStock || 0,
      unit: newItem.unit || 'kg',
      minStock: newItem.minStock || 0,
      maxStock: newItem.maxStock || 0,
      reorderPoint: newItem.reorderPoint || 0,
      reorderQuantity: newItem.reorderQuantity || 0,
      costPerUnit: newItem.costPerUnit || 0,
      supplier: newItem.supplier || '',
      supplierSku: newItem.supplierSku,
      location: newItem.location || '',
      expirationDate: newItem.expirationDate,
      lastRestocked: new Date().toISOString(),
      status,
      isActive: true,
      notes: newItem.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addItemToBackend(item);
    setActiveTab('inventory');
    setNewItem({
      name: '',
      category: 'flour',
      currentStock: 0,
      unit: 'kg',
      minStock: 0,
      maxStock: 0,
      reorderPoint: 0,
      reorderQuantity: 0,
      costPerUnit: 0,
      supplier: '',
      location: '',
      notes: '',
    });
  };

  // Adjust stock
  const adjustStock = () => {
    if (!selectedItem || adjustment.quantity <= 0) {
      setValidationMessage('Please enter a valid quantity');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    let newStock = selectedItem.currentStock;
    switch (adjustment.type) {
      case 'in':
        newStock += adjustment.quantity;
        break;
      case 'out':
      case 'waste':
        newStock = Math.max(0, newStock - adjustment.quantity);
        break;
      case 'adjustment':
        newStock = adjustment.quantity;
        break;
    }

    const status = getStockStatus(newStock, selectedItem.minStock, selectedItem.reorderPoint);

    // Update item
    updateItemBackend(selectedItem.id, {
      currentStock: newStock,
      status,
      lastRestocked: adjustment.type === 'in' ? new Date().toISOString() : selectedItem.lastRestocked,
      updatedAt: new Date().toISOString(),
    });

    // Log transaction
    const transaction: StockTransaction = {
      id: generateId(),
      ingredientId: selectedItem.id,
      type: adjustment.type,
      quantity: adjustment.quantity,
      reason: adjustment.reason,
      performedBy: adjustment.performedBy,
      date: new Date().toISOString(),
      notes: adjustment.notes,
    };
    addTransactionToBackend(transaction);

    // Reset
    setShowAdjustModal(false);
    setSelectedItem(null);
    setAdjustment({
      type: 'in',
      quantity: 0,
      reason: '',
      performedBy: 'Baker',
      notes: '',
    });
  };

  // Delete item
  const deleteItem = async (itemId: string) => {
    const confirmed = await confirm({
      title: 'Delete Item',
      message: 'Are you sure you want to delete this item?',
      confirmText: 'Delete',
      variant: 'danger',
    });
    if (confirmed) {
      deleteItemBackend(itemId);
    }
  };

  // Filtered inventory
  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      const matchesSearch =
        searchTerm === '' ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.supplier.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
      const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
      return matchesSearch && matchesCategory && matchesStatus;
    }).sort((a, b) => {
      switch (sortBy) {
        case 'stock':
          return a.currentStock - b.currentStock;
        case 'category':
          return a.category.localeCompare(b.category);
        default:
          return a.name.localeCompare(b.name);
      }
    });
  }, [inventory, searchTerm, filterCategory, filterStatus, sortBy]);

  // Items needing reorder
  const reorderItems = useMemo(() => {
    return inventory.filter(item => item.currentStock <= item.reorderPoint && item.isActive);
  }, [inventory]);

  // Stats
  const stats = useMemo(() => {
    const totalItems = inventory.length;
    const lowStockCount = inventory.filter(i => i.status === 'low_stock').length;
    const outOfStockCount = inventory.filter(i => i.status === 'out_of_stock').length;
    const totalValue = inventory.reduce((sum, i) => sum + (i.currentStock * i.costPerUnit), 0);
    const reorderValue = reorderItems.reduce((sum, i) => sum + (i.reorderQuantity * i.costPerUnit), 0);

    return { totalItems, lowStockCount, outOfStockCount, totalValue, reorderValue };
  }, [inventory, reorderItems]);

  const getStatusColor = (status: StockStatus) => {
    const colors = {
      in_stock: theme === 'dark' ? 'bg-green-900/30 text-green-400 border-green-700' : 'bg-green-100 text-green-800 border-green-300',
      low_stock: theme === 'dark' ? 'bg-yellow-900/30 text-yellow-400 border-yellow-700' : 'bg-yellow-100 text-yellow-800 border-yellow-300',
      out_of_stock: theme === 'dark' ? 'bg-red-900/30 text-red-400 border-red-700' : 'bg-red-100 text-red-800 border-red-300',
      on_order: theme === 'dark' ? 'bg-blue-900/30 text-blue-400 border-blue-700' : 'bg-blue-100 text-blue-800 border-blue-300',
    };
    return colors[status];
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <ConfirmDialog />
      {/* Validation Message Toast */}
      {validationMessage && (
        <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
          {validationMessage}
        </div>
      )}
      <div className="max-w-7xl mx-auto">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.ingredientInventory.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.ingredientInventory.ingredientInventory', 'Ingredient Inventory')}
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.ingredientInventory.trackBakeryIngredientsStockLevels', 'Track bakery ingredients, stock levels, and reorder alerts')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="ingredient-inventory" toolName="Ingredient Inventory" />

              <SyncStatus
                isSynced={isSynced}
                isSaving={isSaving}
                lastSaved={lastSaved}
                syncError={syncError}
                onForceSync={forceSync}
                theme={theme}
                showLabel={true}
                size="md"
              />
              <ExportDropdown
                onExportCSV={() => exportToCSV(inventory, INVENTORY_COLUMNS, { filename: 'ingredient-inventory' })}
                onExportExcel={() => exportToExcel(inventory, INVENTORY_COLUMNS, { filename: 'ingredient-inventory' })}
                onExportJSON={() => exportToJSON(inventory, { filename: 'ingredient-inventory' })}
                onExportPDF={async () => {
                  await exportToPDF(inventory, INVENTORY_COLUMNS, {
                    filename: 'ingredient-inventory',
                    title: 'Bakery Ingredient Inventory',
                    subtitle: `${inventory.length} items - Total Value: ${formatCurrency(stats.totalValue)}`,
                  });
                }}
                onPrint={() => printData(inventory, INVENTORY_COLUMNS, { title: 'Ingredient Inventory' })}
                onCopyToClipboard={async () => await copyUtil(inventory, INVENTORY_COLUMNS, 'tab')}
                showImport={false}
                theme={theme}
              />
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stats.totalItems}</div>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.ingredientInventory.totalItems', 'Total Items')}</div>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className={`text-2xl font-bold text-yellow-500`}>{stats.lowStockCount}</div>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.ingredientInventory.lowStock', 'Low Stock')}</div>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className={`text-2xl font-bold text-red-500`}>{stats.outOfStockCount}</div>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.ingredientInventory.outOfStock', 'Out of Stock')}</div>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className={`text-2xl font-bold text-green-500`}>{formatCurrency(stats.totalValue)}</div>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.ingredientInventory.inventoryValue', 'Inventory Value')}</div>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className={`text-2xl font-bold text-orange-500`}>{formatCurrency(stats.reorderValue)}</div>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.ingredientInventory.reorderCost', 'Reorder Cost')}</div>
            </div>
          </div>

          {/* Low Stock Alert */}
          {reorderItems.length > 0 && (
            <div className={`mb-4 p-4 rounded-lg border ${theme === 'dark' ? 'bg-orange-900/20 border-orange-700' : 'bg-orange-50 border-orange-200'}`}>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                <span className={`font-medium ${theme === 'dark' ? 'text-orange-400' : 'text-orange-700'}`}>
                  {reorderItems.length} item{reorderItems.length > 1 ? 's' : ''} need{reorderItems.length === 1 ? 's' : ''} reordering
                </span>
              </div>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'inventory', label: 'Inventory', icon: <Package className="w-4 h-4" /> },
              { id: 'new', label: 'Add Item', icon: <Plus className="w-4 h-4" /> },
              { id: 'reorder', label: `Reorder (${reorderItems.length})`, icon: <ShoppingCart className="w-4 h-4" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#0D9488] text-white'
                    : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            {/* Search and Filter */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                  <input
                    type="text"
                    placeholder={t('tools.ingredientInventory.searchByNameSkuOr', 'Search by name, SKU, or supplier...')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className={`px-4 py-2 rounded-lg border ${
                  theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="all">{t('tools.ingredientInventory.allCategories', 'All Categories')}</option>
                {INGREDIENT_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className={`px-4 py-2 rounded-lg border ${
                  theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="all">{t('tools.ingredientInventory.allStatuses', 'All Statuses')}</option>
                {STOCK_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className={`px-4 py-2 rounded-lg border ${
                  theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="name">{t('tools.ingredientInventory.sortByName', 'Sort by Name')}</option>
                <option value="stock">{t('tools.ingredientInventory.sortByStock', 'Sort by Stock')}</option>
                <option value="category">{t('tools.ingredientInventory.sortByCategory', 'Sort by Category')}</option>
              </select>
            </div>

            {/* Inventory Table */}
            {filteredInventory.length === 0 ? (
              <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{t('tools.ingredientInventory.noInventoryItemsFound', 'No inventory items found')}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                      <th className={`text-left py-3 px-4 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.ingredientInventory.item', 'Item')}</th>
                      <th className={`text-left py-3 px-4 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.ingredientInventory.category', 'Category')}</th>
                      <th className={`text-right py-3 px-4 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.ingredientInventory.stock', 'Stock')}</th>
                      <th className={`text-right py-3 px-4 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.ingredientInventory.cost', 'Cost')}</th>
                      <th className={`text-left py-3 px-4 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.ingredientInventory.supplier', 'Supplier')}</th>
                      <th className={`text-left py-3 px-4 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.ingredientInventory.status', 'Status')}</th>
                      <th className={`text-right py-3 px-4 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.ingredientInventory.actions', 'Actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInventory.map((item) => (
                      <tr key={item.id} className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                        <td className="py-3 px-4">
                          <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{item.name}</div>
                          <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{item.sku}</div>
                        </td>
                        <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          {INGREDIENT_CATEGORIES.find(c => c.value === item.category)?.label}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {item.currentStock} {item.unit}
                          </div>
                          <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            Min: {item.minStock} / Reorder: {item.reorderPoint}
                          </div>
                        </td>
                        <td className={`py-3 px-4 text-right ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          {formatCurrency(item.costPerUnit)}/{item.unit}
                        </td>
                        <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          {item.supplier || '-'}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
                            {STOCK_STATUSES.find(s => s.value === item.status)?.label}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setSelectedItem(item);
                                setShowAdjustModal(true);
                              }}
                              className="p-1 text-blue-500 hover:bg-blue-100 rounded"
                              title={t('tools.ingredientInventory.adjustStock', 'Adjust Stock')}
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteItem(item.id)}
                              className="p-1 text-red-500 hover:bg-red-100 rounded"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Reorder Tab */}
        {activeTab === 'reorder' && (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <h2 className={`text-xl font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.ingredientInventory.itemsNeedingReorder', 'Items Needing Reorder')}
            </h2>

            {reorderItems.length === 0 ? (
              <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{t('tools.ingredientInventory.allItemsAreSufficientlyStocked', 'All items are sufficiently stocked')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reorderItems.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-lg border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {item.name}
                        </div>
                        <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {item.sku} - {item.supplier || 'No supplier'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-red-500 font-medium`}>
                          Current: {item.currentStock} {item.unit}
                        </div>
                        <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          Reorder Point: {item.reorderPoint} | Qty: {item.reorderQuantity}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {formatCurrency(item.reorderQuantity * item.costPerUnit)}
                        </div>
                        <button
                          onClick={() => {
                            setSelectedItem(item);
                            setAdjustment({ ...adjustment, type: 'in', quantity: item.reorderQuantity, reason: 'Restock order' });
                            setShowAdjustModal(true);
                          }}
                          className="text-sm text-[#0D9488] hover:underline"
                        >
                          {t('tools.ingredientInventory.markAsReceived', 'Mark as Received')}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <div className="flex items-center justify-between">
                    <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {t('tools.ingredientInventory.totalReorderCost', 'Total Reorder Cost:')}
                    </span>
                    <span className={`text-xl font-bold text-orange-500`}>
                      {formatCurrency(stats.reorderValue)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* New Item Tab */}
        {activeTab === 'new' && (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <h2 className={`text-xl font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.ingredientInventory.addNewIngredient', 'Add New Ingredient')}
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className={`font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.ingredientInventory.basicInformation', 'Basic Information')}</h3>
                <input
                  type="text"
                  placeholder={t('tools.ingredientInventory.itemName', 'Item Name *')}
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                />
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value as IngredientCategory })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                >
                  {INGREDIENT_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder={t('tools.ingredientInventory.currentStock', 'Current Stock')}
                    value={newItem.currentStock || ''}
                    onChange={(e) => setNewItem({ ...newItem, currentStock: parseFloat(e.target.value) || 0 })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                  <select
                    value={newItem.unit}
                    onChange={(e) => setNewItem({ ...newItem, unit: e.target.value as MeasurementUnit })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  >
                    {MEASUREMENT_UNITS.map((u) => (
                      <option key={u.value} value={u.value}>{u.label}</option>
                    ))}
                  </select>
                </div>
                <input
                  type="text"
                  placeholder={t('tools.ingredientInventory.storageLocation', 'Storage Location')}
                  value={newItem.location}
                  onChange={(e) => setNewItem({ ...newItem, location: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                />
              </div>

              {/* Stock Levels */}
              <div className="space-y-4">
                <h3 className={`font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.ingredientInventory.stockLevels', 'Stock Levels')}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.ingredientInventory.minStock', 'Min Stock')}</label>
                    <input
                      type="number"
                      min="0"
                      value={newItem.minStock || ''}
                      onChange={(e) => setNewItem({ ...newItem, minStock: parseFloat(e.target.value) || 0 })}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.ingredientInventory.maxStock', 'Max Stock')}</label>
                    <input
                      type="number"
                      min="0"
                      value={newItem.maxStock || ''}
                      onChange={(e) => setNewItem({ ...newItem, maxStock: parseFloat(e.target.value) || 0 })}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.ingredientInventory.reorderPoint', 'Reorder Point')}</label>
                    <input
                      type="number"
                      min="0"
                      value={newItem.reorderPoint || ''}
                      onChange={(e) => setNewItem({ ...newItem, reorderPoint: parseFloat(e.target.value) || 0 })}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.ingredientInventory.reorderQty', 'Reorder Qty')}</label>
                    <input
                      type="number"
                      min="0"
                      value={newItem.reorderQuantity || ''}
                      onChange={(e) => setNewItem({ ...newItem, reorderQuantity: parseFloat(e.target.value) || 0 })}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Supplier & Cost */}
              <div className="space-y-4">
                <h3 className={`font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.ingredientInventory.supplierCost', 'Supplier & Cost')}</h3>
                <input
                  type="text"
                  placeholder={t('tools.ingredientInventory.supplierName', 'Supplier Name')}
                  value={newItem.supplier}
                  onChange={(e) => setNewItem({ ...newItem, supplier: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                />
                <input
                  type="text"
                  placeholder={t('tools.ingredientInventory.supplierSku', 'Supplier SKU')}
                  value={newItem.supplierSku}
                  onChange={(e) => setNewItem({ ...newItem, supplierSku: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                />
                <div>
                  <label className={`block text-sm mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.ingredientInventory.costPerUnit', 'Cost per Unit')}</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={newItem.costPerUnit || ''}
                    onChange={(e) => setNewItem({ ...newItem, costPerUnit: parseFloat(e.target.value) || 0 })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
              </div>

              {/* Notes & Submit */}
              <div className="space-y-4">
                <h3 className={`font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.ingredientInventory.additionalInfo', 'Additional Info')}</h3>
                <div>
                  <label className={`block text-sm mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.ingredientInventory.expirationDate', 'Expiration Date')}</label>
                  <input
                    type="date"
                    value={newItem.expirationDate || ''}
                    onChange={(e) => setNewItem({ ...newItem, expirationDate: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
                <textarea
                  placeholder={t('tools.ingredientInventory.notes', 'Notes')}
                  value={newItem.notes}
                  onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                  rows={3}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                />
                <button
                  onClick={addItem}
                  className="w-full py-3 bg-[#0D9488] text-white rounded-lg font-medium hover:bg-[#0B7C71] transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  {t('tools.ingredientInventory.addItem', 'Add Item')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Adjust Stock Modal */}
        {showAdjustModal && selectedItem && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl p-6 w-full max-w-md mx-4`}>
              <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Adjust Stock: {selectedItem.name}
              </h3>
              <div className={`mb-4 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Current Stock: {selectedItem.currentStock} {selectedItem.unit}
              </div>
              <div className="space-y-4">
                <select
                  value={adjustment.type}
                  onChange={(e) => setAdjustment({ ...adjustment, type: e.target.value as typeof adjustment.type })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                >
                  <option value="in">{t('tools.ingredientInventory.stockInAdd', 'Stock In (Add)')}</option>
                  <option value="out">{t('tools.ingredientInventory.stockOutRemove', 'Stock Out (Remove)')}</option>
                  <option value="waste">{t('tools.ingredientInventory.wasteSpoilage', 'Waste/Spoilage')}</option>
                  <option value="adjustment">{t('tools.ingredientInventory.setExactQuantity', 'Set Exact Quantity')}</option>
                </select>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder={t('tools.ingredientInventory.quantity', 'Quantity')}
                  value={adjustment.quantity || ''}
                  onChange={(e) => setAdjustment({ ...adjustment, quantity: parseFloat(e.target.value) || 0 })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                />
                <input
                  type="text"
                  placeholder={t('tools.ingredientInventory.reason', 'Reason')}
                  value={adjustment.reason}
                  onChange={(e) => setAdjustment({ ...adjustment, reason: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowAdjustModal(false);
                      setSelectedItem(null);
                    }}
                    className={`flex-1 py-2 rounded-lg ${
                      theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {t('tools.ingredientInventory.cancel', 'Cancel')}
                  </button>
                  <button
                    onClick={adjustStock}
                    className="flex-1 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7C71]"
                  >
                    {t('tools.ingredientInventory.apply', 'Apply')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IngredientInventoryTool;
