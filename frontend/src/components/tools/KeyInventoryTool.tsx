'use client';

import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import useToolData from '../../hooks/useToolData';
import type { ColumnConfig } from '../../lib/toolDataUtils';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  Key,
  Package,
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  RefreshCw,
  Loader2,
  ShoppingCart,
  Tag,
  Box,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowUpDown,
  DollarSign,
  Warehouse,
  ClipboardList,
  Archive,
  AlertCircle
} from 'lucide-react';

// Types
type KeyCategory = 'residential' | 'commercial' | 'automotive' | 'high_security' | 'padlock' | 'specialty';
type KeyBrand = 'kwikset' | 'schlage' | 'yale' | 'medeco' | 'mul_t_lock' | 'assa' | 'generic' | 'other';

interface KeyBlank {
  id: string;
  sku: string;
  name: string;
  category: KeyCategory;
  brand: KeyBrand;
  keyway: string;
  quantity: number;
  minStock: number;
  maxStock: number;
  unitCost: number;
  sellingPrice: number;
  location: string;
  supplier: string;
  lastOrdered?: string;
  lastUsed?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface InventoryTransaction {
  id: string;
  keyBlankId: string;
  keyBlankName: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  reason: string;
  jobNumber?: string;
  createdAt: string;
  createdBy: string;
}

interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplier: string;
  items: { keyBlankId: string; keyBlankName: string; quantity: number; unitCost: number }[];
  totalCost: number;
  status: 'draft' | 'ordered' | 'received' | 'cancelled';
  orderedAt?: string;
  receivedAt?: string;
  notes?: string;
  createdAt: string;
}

// Category and brand configurations
const CATEGORIES: { type: KeyCategory; label: string; color: string }[] = [
  { type: 'residential', label: 'Residential', color: 'bg-blue-100 text-blue-700' },
  { type: 'commercial', label: 'Commercial', color: 'bg-purple-100 text-purple-700' },
  { type: 'automotive', label: 'Automotive', color: 'bg-green-100 text-green-700' },
  { type: 'high_security', label: 'High Security', color: 'bg-red-100 text-red-700' },
  { type: 'padlock', label: 'Padlock', color: 'bg-orange-100 text-orange-700' },
  { type: 'specialty', label: 'Specialty', color: 'bg-teal-100 text-teal-700' },
];

const BRANDS: { type: KeyBrand; label: string }[] = [
  { type: 'kwikset', label: 'Kwikset' },
  { type: 'schlage', label: 'Schlage' },
  { type: 'yale', label: 'Yale' },
  { type: 'medeco', label: 'Medeco' },
  { type: 'mul_t_lock', label: 'Mul-T-Lock' },
  { type: 'assa', label: 'ASSA' },
  { type: 'generic', label: 'Generic' },
  { type: 'other', label: 'Other' },
];

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);
const generateSKU = (category: string, brand: string) => {
  const prefix = category.substring(0, 3).toUpperCase();
  const brandCode = brand.substring(0, 2).toUpperCase();
  const num = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}-${brandCode}-${num}`;
};
const generatePONumber = () => `PO-${Date.now().toString(36).toUpperCase()}`;

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Column configuration for exports
const COLUMNS: ColumnConfig[] = [
  { key: 'sku', header: 'SKU', type: 'string' },
  { key: 'name', header: 'Name', type: 'string' },
  { key: 'category', header: 'Category', type: 'string' },
  { key: 'brand', header: 'Brand', type: 'string' },
  { key: 'keyway', header: 'Keyway', type: 'string' },
  { key: 'quantity', header: 'Quantity', type: 'number' },
  { key: 'minStock', header: 'Min Stock', type: 'number' },
  { key: 'maxStock', header: 'Max Stock', type: 'number' },
  { key: 'unitCost', header: 'Unit Cost', type: 'currency' },
  { key: 'sellingPrice', header: 'Selling Price', type: 'currency' },
  { key: 'location', header: 'Location', type: 'string' },
  { key: 'supplier', header: 'Supplier', type: 'string' },
  { key: 'isActive', header: 'Active', type: 'boolean' },
  { key: 'lastOrdered', header: 'Last Ordered', type: 'date' },
  { key: 'lastUsed', header: 'Last Used', type: 'date' },
];

interface KeyInventoryToolProps {
  uiConfig?: UIConfig;
}

export function KeyInventoryTool({
  uiConfig }: KeyInventoryToolProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Use the useToolData hook for backend persistence
  const {
    data: keyBlanks,
    setData: setKeyBlanks,
    addItem: addKeyBlank,
    updateItem: updateKeyBlank,
    deleteItem: deleteKeyBlank,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    copyToClipboard,
    print,
    isLoading,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<KeyBlank>('key-inventory', [], COLUMNS);

  // State
  const [activeTab, setActiveTab] = useState<'inventory' | 'add' | 'transactions' | 'orders' | 'reports'>('inventory');
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [selectedKeyBlank, setSelectedKeyBlank] = useState<KeyBlank | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<KeyCategory | 'all'>('all');
  const [brandFilter, setBrandFilter] = useState<KeyBrand | 'all'>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');

  // Form state for new key blank
  const [newKeyBlank, setNewKeyBlank] = useState<Partial<KeyBlank>>({
    category: 'residential',
    brand: 'kwikset',
    quantity: 0,
    minStock: 10,
    maxStock: 100,
    unitCost: 0,
    sellingPrice: 0,
    isActive: true,
  });

  // Adjustment modal state
  const [adjustmentModal, setAdjustmentModal] = useState<{
    isOpen: boolean;
    keyBlank: KeyBlank | null;
    type: 'in' | 'out' | 'adjustment';
    quantity: number;
    reason: string;
    jobNumber: string;
  }>({
    isOpen: false,
    keyBlank: null,
    type: 'out',
    quantity: 1,
    reason: '',
    jobNumber: '',
  });

  // Load transactions and orders from localStorage
  useEffect(() => {
    const savedTransactions = localStorage.getItem('key_inventory_transactions');
    const savedOrders = localStorage.getItem('key_inventory_orders');
    if (savedTransactions) {
      try {
        setTransactions(JSON.parse(savedTransactions));
      } catch (e) {
        console.error('Failed to load transactions:', e);
      }
    }
    if (savedOrders) {
      try {
        setPurchaseOrders(JSON.parse(savedOrders));
      } catch (e) {
        console.error('Failed to load orders:', e);
      }
    }
  }, []);

  // Save transactions and orders to localStorage
  useEffect(() => {
    localStorage.setItem('key_inventory_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('key_inventory_orders', JSON.stringify(purchaseOrders));
  }, [purchaseOrders]);

  // Filtered and sorted key blanks
  const filteredKeyBlanks = useMemo(() => {
    return keyBlanks
      .filter(kb => {
        const matchesSearch = searchQuery === '' ||
          kb.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          kb.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
          kb.keyway.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || kb.category === categoryFilter;
        const matchesBrand = brandFilter === 'all' || kb.brand === brandFilter;
        const matchesStock = stockFilter === 'all' ||
          (stockFilter === 'low' && kb.quantity <= kb.minStock && kb.quantity > 0) ||
          (stockFilter === 'out' && kb.quantity === 0);
        return matchesSearch && matchesCategory && matchesBrand && matchesStock && kb.isActive;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [keyBlanks, searchQuery, categoryFilter, brandFilter, stockFilter]);

  // Stats
  const stats = useMemo(() => {
    const active = keyBlanks.filter(kb => kb.isActive);
    const lowStock = active.filter(kb => kb.quantity <= kb.minStock && kb.quantity > 0);
    const outOfStock = active.filter(kb => kb.quantity === 0);
    const totalValue = active.reduce((sum, kb) => sum + kb.quantity * kb.unitCost, 0);
    const totalRetailValue = active.reduce((sum, kb) => sum + kb.quantity * kb.sellingPrice, 0);

    return {
      totalItems: active.length,
      totalQuantity: active.reduce((sum, kb) => sum + kb.quantity, 0),
      lowStock: lowStock.length,
      outOfStock: outOfStock.length,
      totalValue,
      totalRetailValue,
      potentialProfit: totalRetailValue - totalValue,
    };
  }, [keyBlanks]);

  // Create new key blank
  const createKeyBlank = () => {
    if (!newKeyBlank.name || !newKeyBlank.keyway) {
      setValidationMessage('Please fill in required fields: Name and Keyway');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const keyBlank: KeyBlank = {
      id: generateId(),
      sku: generateSKU(newKeyBlank.category || 'residential', newKeyBlank.brand || 'generic'),
      name: newKeyBlank.name || '',
      category: newKeyBlank.category || 'residential',
      brand: newKeyBlank.brand || 'generic',
      keyway: newKeyBlank.keyway || '',
      quantity: newKeyBlank.quantity || 0,
      minStock: newKeyBlank.minStock || 10,
      maxStock: newKeyBlank.maxStock || 100,
      unitCost: newKeyBlank.unitCost || 0,
      sellingPrice: newKeyBlank.sellingPrice || 0,
      location: newKeyBlank.location || '',
      supplier: newKeyBlank.supplier || '',
      notes: newKeyBlank.notes,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addKeyBlank(keyBlank);
    resetForm();
    setActiveTab('inventory');
  };

  // Reset form
  const resetForm = () => {
    setNewKeyBlank({
      category: 'residential',
      brand: 'kwikset',
      quantity: 0,
      minStock: 10,
      maxStock: 100,
      unitCost: 0,
      sellingPrice: 0,
      isActive: true,
    });
    setIsEditing(false);
    setSelectedKeyBlank(null);
  };

  // Adjust inventory
  const adjustInventory = () => {
    if (!adjustmentModal.keyBlank || adjustmentModal.quantity <= 0) return;

    const kb = adjustmentModal.keyBlank;
    let newQuantity = kb.quantity;

    if (adjustmentModal.type === 'in') {
      newQuantity += adjustmentModal.quantity;
    } else if (adjustmentModal.type === 'out') {
      newQuantity = Math.max(0, newQuantity - adjustmentModal.quantity);
    } else {
      newQuantity = adjustmentModal.quantity;
    }

    // Create transaction
    const transaction: InventoryTransaction = {
      id: generateId(),
      keyBlankId: kb.id,
      keyBlankName: kb.name,
      type: adjustmentModal.type,
      quantity: adjustmentModal.quantity,
      previousQuantity: kb.quantity,
      newQuantity,
      reason: adjustmentModal.reason || (adjustmentModal.type === 'out' ? 'Used on job' : 'Stock received'),
      jobNumber: adjustmentModal.jobNumber,
      createdAt: new Date().toISOString(),
      createdBy: 'Current User',
    };

    setTransactions(prev => [transaction, ...prev]);

    // Update key blank
    updateKeyBlank(kb.id, {
      quantity: newQuantity,
      lastUsed: adjustmentModal.type === 'out' ? new Date().toISOString() : kb.lastUsed,
      updatedAt: new Date().toISOString(),
    });

    // Close modal
    setAdjustmentModal({
      isOpen: false,
      keyBlank: null,
      type: 'out',
      quantity: 1,
      reason: '',
      jobNumber: '',
    });
  };

  // Card styles
  const cardClass = isDark
    ? 'bg-gray-800 border-gray-700'
    : 'bg-white border-gray-200';

  const inputClass = isDark
    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500';

  return (
    <div className={`min-h-screen p-4 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Key className="w-6 h-6 text-yellow-500" />
              {t('tools.keyInventory.keyBlankInventory', 'Key Blank Inventory')}
            </h1>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.keyInventory.manageKeyBlanksStockLevels', 'Manage key blanks, stock levels, and orders')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <WidgetEmbedButton toolSlug="key-inventory" toolName="Key Inventory" />

            <SyncStatus
              isSynced={isSynced}
              isSaving={isSaving}
              lastSaved={lastSaved}
              error={syncError}
              onRetry={forceSync}
            />
            <ExportDropdown
              onExportCSV={exportCSV}
              onExportExcel={exportExcel}
              onExportJSON={exportJSON}
              onExportPDF={exportPDF}
              onCopy={copyToClipboard}
              onPrint={print}
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
          <Card className={cardClass}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.keyInventory.totalItems', 'Total Items')}</p>
                  <p className="text-xl font-bold">{stats.totalItems}</p>
                </div>
                <Package className="w-6 h-6 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className={cardClass}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.keyInventory.totalQty', 'Total Qty')}</p>
                  <p className="text-xl font-bold">{stats.totalQuantity.toLocaleString()}</p>
                </div>
                <Box className="w-6 h-6 text-purple-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className={cardClass}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.keyInventory.lowStock', 'Low Stock')}</p>
                  <p className="text-xl font-bold text-orange-500">{stats.lowStock}</p>
                </div>
                <AlertTriangle className="w-6 h-6 text-orange-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className={cardClass}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.keyInventory.outOfStock', 'Out of Stock')}</p>
                  <p className="text-xl font-bold text-red-500">{stats.outOfStock}</p>
                </div>
                <AlertCircle className="w-6 h-6 text-red-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className={cardClass}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.keyInventory.costValue', 'Cost Value')}</p>
                  <p className="text-xl font-bold">{formatCurrency(stats.totalValue)}</p>
                </div>
                <DollarSign className="w-6 h-6 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className={cardClass}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.keyInventory.retailValue', 'Retail Value')}</p>
                  <p className="text-xl font-bold">{formatCurrency(stats.totalRetailValue)}</p>
                </div>
                <TrendingUp className="w-6 h-6 text-cyan-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className={cardClass}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.keyInventory.profitMargin', 'Profit Margin')}</p>
                  <p className="text-xl font-bold text-green-600">{formatCurrency(stats.potentialProfit)}</p>
                </div>
                <BarChart3 className="w-6 h-6 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {(['inventory', 'add', 'transactions', 'orders', 'reports'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? 'bg-yellow-600 text-white'
                  : isDark
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab === 'inventory' && <Package className="w-4 h-4 inline mr-2" />}
              {tab === 'add' && <Plus className="w-4 h-4 inline mr-2" />}
              {tab === 'transactions' && <ArrowUpDown className="w-4 h-4 inline mr-2" />}
              {tab === 'orders' && <ShoppingCart className="w-4 h-4 inline mr-2" />}
              {tab === 'reports' && <BarChart3 className="w-4 h-4 inline mr-2" />}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t('tools.keyInventory.searchByNameSkuKeyway', 'Search by name, SKU, keyway...')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 rounded-lg border ${inputClass}`}
                  />
                </div>
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as KeyCategory | 'all')}
                className={`px-4 py-2 rounded-lg border ${inputClass}`}
              >
                <option value="all">{t('tools.keyInventory.allCategories', 'All Categories')}</option>
                {CATEGORIES.map(cat => (
                  <option key={cat.type} value={cat.type}>{cat.label}</option>
                ))}
              </select>

              <select
                value={brandFilter}
                onChange={(e) => setBrandFilter(e.target.value as KeyBrand | 'all')}
                className={`px-4 py-2 rounded-lg border ${inputClass}`}
              >
                <option value="all">{t('tools.keyInventory.allBrands', 'All Brands')}</option>
                {BRANDS.map(brand => (
                  <option key={brand.type} value={brand.type}>{brand.label}</option>
                ))}
              </select>

              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value as 'all' | 'low' | 'out')}
                className={`px-4 py-2 rounded-lg border ${inputClass}`}
              >
                <option value="all">{t('tools.keyInventory.allStockLevels', 'All Stock Levels')}</option>
                <option value="low">{t('tools.keyInventory.lowStock2', 'Low Stock')}</option>
                <option value="out">{t('tools.keyInventory.outOfStock2', 'Out of Stock')}</option>
              </select>
            </div>

            {/* Inventory List */}
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
              </div>
            ) : filteredKeyBlanks.length === 0 ? (
              <Card className={cardClass}>
                <CardContent className="p-12 text-center">
                  <Key className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                    {t('tools.keyInventory.noKeyBlanksFound', 'No key blanks found')}
                  </p>
                  <button
                    onClick={() => setActiveTab('add')}
                    className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                  >
                    {t('tools.keyInventory.addKeyBlank', 'Add Key Blank')}
                  </button>
                </CardContent>
              </Card>
            ) : (
              <div className="overflow-x-auto">
                <table className={`w-full border-collapse ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                  <thead>
                    <tr className={isDark ? 'bg-gray-800' : 'bg-gray-100'}>
                      <th className="px-4 py-3 text-left text-sm font-medium">{t('tools.keyInventory.sku', 'SKU')}</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">{t('tools.keyInventory.name', 'Name')}</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">{t('tools.keyInventory.category', 'Category')}</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">{t('tools.keyInventory.brand', 'Brand')}</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">{t('tools.keyInventory.keyway', 'Keyway')}</th>
                      <th className="px-4 py-3 text-center text-sm font-medium">{t('tools.keyInventory.qty', 'Qty')}</th>
                      <th className="px-4 py-3 text-right text-sm font-medium">{t('tools.keyInventory.cost', 'Cost')}</th>
                      <th className="px-4 py-3 text-right text-sm font-medium">{t('tools.keyInventory.price', 'Price')}</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">{t('tools.keyInventory.location', 'Location')}</th>
                      <th className="px-4 py-3 text-center text-sm font-medium">{t('tools.keyInventory.actions', 'Actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredKeyBlanks.map(kb => {
                      const isLow = kb.quantity <= kb.minStock && kb.quantity > 0;
                      const isOut = kb.quantity === 0;
                      const categoryConfig = CATEGORIES.find(c => c.type === kb.category);

                      return (
                        <tr
                          key={kb.id}
                          className={`border-b ${isDark ? 'border-gray-700 hover:bg-gray-700/50' : 'border-gray-200 hover:bg-gray-50'}`}
                        >
                          <td className="px-4 py-3 font-mono text-sm">{kb.sku}</td>
                          <td className="px-4 py-3 font-medium">{kb.name}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-xs ${categoryConfig?.color}`}>
                              {categoryConfig?.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">{BRANDS.find(b => b.type === kb.brand)?.label}</td>
                          <td className="px-4 py-3 text-sm font-mono">{kb.keyway}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`font-bold ${isOut ? 'text-red-500' : isLow ? 'text-orange-500' : ''}`}>
                              {kb.quantity}
                            </span>
                            <span className="text-gray-400 text-sm"> / {kb.maxStock}</span>
                          </td>
                          <td className="px-4 py-3 text-right text-sm">{formatCurrency(kb.unitCost)}</td>
                          <td className="px-4 py-3 text-right text-sm font-medium">{formatCurrency(kb.sellingPrice)}</td>
                          <td className="px-4 py-3 text-sm">{kb.location}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => setAdjustmentModal({
                                  isOpen: true,
                                  keyBlank: kb,
                                  type: 'out',
                                  quantity: 1,
                                  reason: '',
                                  jobNumber: '',
                                })}
                                className="p-1.5 text-orange-500 hover:bg-orange-100 rounded"
                                title={t('tools.keyInventory.removeStock2', 'Remove Stock')}
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setAdjustmentModal({
                                  isOpen: true,
                                  keyBlank: kb,
                                  type: 'in',
                                  quantity: 1,
                                  reason: '',
                                  jobNumber: '',
                                })}
                                className="p-1.5 text-green-500 hover:bg-green-100 rounded"
                                title={t('tools.keyInventory.addStock', 'Add Stock')}
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setNewKeyBlank(kb);
                                  setIsEditing(true);
                                  setActiveTab('add');
                                }}
                                className="p-1.5 text-blue-500 hover:bg-blue-100 rounded"
                                title={t('tools.keyInventory.edit', 'Edit')}
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={async () => {
                                  const confirmed = await confirm({
                                    title: 'Delete Key Blank',
                                    message: 'Are you sure you want to delete this item?',
                                    confirmText: 'Delete',
                                    cancelText: 'Cancel',
                                    variant: 'danger'
                                  });
                                  if (confirmed) {
                                    deleteKeyBlank(kb.id);
                                  }
                                }}
                                className="p-1.5 text-red-500 hover:bg-red-100 rounded"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Add Key Blank Tab */}
        {activeTab === 'add' && (
          <Card className={cardClass}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {isEditing ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                {isEditing ? t('tools.keyInventory.editKeyBlank', 'Edit Key Blank') : t('tools.keyInventory.addNewKeyBlank', 'Add New Key Blank')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="font-medium mb-4">{t('tools.keyInventory.basicInformation', 'Basic Information')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('tools.keyInventory.name2', 'Name *')}</label>
                    <input
                      type="text"
                      value={newKeyBlank.name || ''}
                      onChange={(e) => setNewKeyBlank({ ...newKeyBlank, name: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${inputClass}`}
                      placeholder={t('tools.keyInventory.kw1KeyBlank', 'KW1 Key Blank')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">{t('tools.keyInventory.category2', 'Category')}</label>
                    <select
                      value={newKeyBlank.category || 'residential'}
                      onChange={(e) => setNewKeyBlank({ ...newKeyBlank, category: e.target.value as KeyCategory })}
                      className={`w-full px-4 py-2 rounded-lg border ${inputClass}`}
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat.type} value={cat.type}>{cat.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">{t('tools.keyInventory.brand2', 'Brand')}</label>
                    <select
                      value={newKeyBlank.brand || 'generic'}
                      onChange={(e) => setNewKeyBlank({ ...newKeyBlank, brand: e.target.value as KeyBrand })}
                      className={`w-full px-4 py-2 rounded-lg border ${inputClass}`}
                    >
                      {BRANDS.map(brand => (
                        <option key={brand.type} value={brand.type}>{brand.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">{t('tools.keyInventory.keyway2', 'Keyway *')}</label>
                    <input
                      type="text"
                      value={newKeyBlank.keyway || ''}
                      onChange={(e) => setNewKeyBlank({ ...newKeyBlank, keyway: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${inputClass}`}
                      placeholder={t('tools.keyInventory.kw1', 'KW1')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">{t('tools.keyInventory.location2', 'Location')}</label>
                    <input
                      type="text"
                      value={newKeyBlank.location || ''}
                      onChange={(e) => setNewKeyBlank({ ...newKeyBlank, location: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${inputClass}`}
                      placeholder={t('tools.keyInventory.drawerA1', 'Drawer A-1')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">{t('tools.keyInventory.supplier', 'Supplier')}</label>
                    <input
                      type="text"
                      value={newKeyBlank.supplier || ''}
                      onChange={(e) => setNewKeyBlank({ ...newKeyBlank, supplier: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${inputClass}`}
                      placeholder={t('tools.keyInventory.keySupplyCo', 'Key Supply Co.')}
                    />
                  </div>
                </div>
              </div>

              {/* Stock Levels */}
              <div>
                <h3 className="font-medium mb-4">{t('tools.keyInventory.stockLevels', 'Stock Levels')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('tools.keyInventory.currentQuantity', 'Current Quantity')}</label>
                    <input
                      type="number"
                      min="0"
                      value={newKeyBlank.quantity || 0}
                      onChange={(e) => setNewKeyBlank({ ...newKeyBlank, quantity: parseInt(e.target.value) || 0 })}
                      className={`w-full px-4 py-2 rounded-lg border ${inputClass}`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">{t('tools.keyInventory.minStockReorderPoint', 'Min Stock (Reorder Point)')}</label>
                    <input
                      type="number"
                      min="0"
                      value={newKeyBlank.minStock || 10}
                      onChange={(e) => setNewKeyBlank({ ...newKeyBlank, minStock: parseInt(e.target.value) || 0 })}
                      className={`w-full px-4 py-2 rounded-lg border ${inputClass}`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">{t('tools.keyInventory.maxStock', 'Max Stock')}</label>
                    <input
                      type="number"
                      min="0"
                      value={newKeyBlank.maxStock || 100}
                      onChange={(e) => setNewKeyBlank({ ...newKeyBlank, maxStock: parseInt(e.target.value) || 0 })}
                      className={`w-full px-4 py-2 rounded-lg border ${inputClass}`}
                    />
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div>
                <h3 className="font-medium mb-4">{t('tools.keyInventory.pricing', 'Pricing')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('tools.keyInventory.unitCost', 'Unit Cost')}</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={newKeyBlank.unitCost || 0}
                      onChange={(e) => setNewKeyBlank({ ...newKeyBlank, unitCost: parseFloat(e.target.value) || 0 })}
                      className={`w-full px-4 py-2 rounded-lg border ${inputClass}`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">{t('tools.keyInventory.sellingPrice', 'Selling Price')}</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={newKeyBlank.sellingPrice || 0}
                      onChange={(e) => setNewKeyBlank({ ...newKeyBlank, sellingPrice: parseFloat(e.target.value) || 0 })}
                      className={`w-full px-4 py-2 rounded-lg border ${inputClass}`}
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.keyInventory.notes', 'Notes')}</label>
                <textarea
                  value={newKeyBlank.notes || ''}
                  onChange={(e) => setNewKeyBlank({ ...newKeyBlank, notes: e.target.value })}
                  rows={3}
                  className={`w-full px-4 py-2 rounded-lg border ${inputClass}`}
                  placeholder={t('tools.keyInventory.additionalNotes', 'Additional notes...')}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <button
                  onClick={isEditing ? () => {
                    if (newKeyBlank.id) {
                      updateKeyBlank(newKeyBlank.id, {
                        ...newKeyBlank,
                        updatedAt: new Date().toISOString(),
                      } as Partial<KeyBlank>);
                    }
                    resetForm();
                    setActiveTab('inventory');
                  } : createKeyBlank}
                  className="flex-1 px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-medium"
                >
                  {isEditing ? <Save className="w-4 h-4 inline mr-2" /> : <Plus className="w-4 h-4 inline mr-2" />}
                  {isEditing ? t('tools.keyInventory.saveChanges', 'Save Changes') : t('tools.keyInventory.addKeyBlank2', 'Add Key Blank')}
                </button>
                <button
                  onClick={resetForm}
                  className={`px-6 py-3 rounded-lg font-medium ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                >
                  {t('tools.keyInventory.cancel', 'Cancel')}
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <Card className={cardClass}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowUpDown className="w-5 h-5" />
                {t('tools.keyInventory.transactionHistory', 'Transaction History')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <p className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.keyInventory.noTransactionsRecordedYet', 'No transactions recorded yet')}
                </p>
              ) : (
                <div className="space-y-3">
                  {transactions.slice(0, 50).map(tx => (
                    <div
                      key={tx.id}
                      className={`p-3 rounded-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {tx.type === 'in' ? (
                            <div className="p-2 bg-green-100 rounded-full">
                              <Plus className="w-4 h-4 text-green-600" />
                            </div>
                          ) : tx.type === 'out' ? (
                            <div className="p-2 bg-red-100 rounded-full">
                              <Minus className="w-4 h-4 text-red-600" />
                            </div>
                          ) : (
                            <div className="p-2 bg-blue-100 rounded-full">
                              <RefreshCw className="w-4 h-4 text-blue-600" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{tx.keyBlankName}</p>
                            <p className="text-sm text-gray-400">
                              {tx.type === 'in' ? 'Added' : tx.type === 'out' ? t('tools.keyInventory.removed', 'Removed') : t('tools.keyInventory.adjusted', 'Adjusted')} {tx.quantity} units
                              {tx.jobNumber && ` - Job #${tx.jobNumber}`}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-mono text-sm">
                            {tx.previousQuantity} → {tx.newQuantity}
                          </p>
                          <p className="text-xs text-gray-400">{formatDate(tx.createdAt)}</p>
                        </div>
                      </div>
                      {tx.reason && (
                        <p className="text-sm text-gray-400 mt-2 pl-12">{tx.reason}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <Card className={cardClass}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                {t('tools.keyInventory.purchaseOrders', 'Purchase Orders')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.keyInventory.purchaseOrderManagementComingSoon', 'Purchase order management coming soon')}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <Card className={cardClass}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                {t('tools.keyInventory.inventoryReports', 'Inventory Reports')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <h4 className="font-medium mb-4">{t('tools.keyInventory.stockByCategory', 'Stock by Category')}</h4>
                  {CATEGORIES.map(cat => {
                    const catItems = keyBlanks.filter(kb => kb.category === cat.type);
                    const catQty = catItems.reduce((sum, kb) => sum + kb.quantity, 0);
                    return (
                      <div key={cat.type} className="flex justify-between py-2 border-b border-gray-600/20 last:border-0">
                        <span>{cat.label}</span>
                        <span className="font-mono">{catQty.toLocaleString()}</span>
                      </div>
                    );
                  })}
                </div>

                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <h4 className="font-medium mb-4">{t('tools.keyInventory.stockByBrand', 'Stock by Brand')}</h4>
                  {BRANDS.map(brand => {
                    const brandItems = keyBlanks.filter(kb => kb.brand === brand.type);
                    const brandQty = brandItems.reduce((sum, kb) => sum + kb.quantity, 0);
                    if (brandQty === 0) return null;
                    return (
                      <div key={brand.type} className="flex justify-between py-2 border-b border-gray-600/20 last:border-0">
                        <span>{brand.label}</span>
                        <span className="font-mono">{brandQty.toLocaleString()}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Adjustment Modal */}
        {adjustmentModal.isOpen && adjustmentModal.keyBlank && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className={`${cardClass} w-full max-w-md`}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {adjustmentModal.type === 'in' ? 'Add Stock' : adjustmentModal.type === 'out' ? t('tools.keyInventory.removeStock', 'Remove Stock') : t('tools.keyInventory.adjustStock', 'Adjust Stock')}
                  <button onClick={() => setAdjustmentModal({ ...adjustmentModal, isOpen: false })} className="p-1 hover:bg-gray-100 rounded">
                    <X className="w-5 h-5" />
                  </button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-medium">{adjustmentModal.keyBlank.name}</p>
                  <p className="text-sm text-gray-400">Current Stock: {adjustmentModal.keyBlank.quantity}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.keyInventory.type', 'Type')}</label>
                  <div className="flex gap-2">
                    {(['in', 'out', 'adjustment'] as const).map(type => (
                      <button
                        key={type}
                        onClick={() => setAdjustmentModal({ ...adjustmentModal, type })}
                        className={`flex-1 px-3 py-2 rounded-lg border text-sm font-medium ${
                          adjustmentModal.type === type
                            ? type === 'in' ? 'bg-green-600 text-white border-green-600'
                              : type === 'out' ? 'bg-red-600 text-white border-red-600'
                                : 'bg-blue-600 text-white border-blue-600'
                            : isDark ? 'border-gray-600' : 'border-gray-300'
                        }`}
                      >
                        {type === 'in' ? 'Add' : type === 'out' ? t('tools.keyInventory.remove', 'Remove') : t('tools.keyInventory.setTo', 'Set To')}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.keyInventory.quantity', 'Quantity')}</label>
                  <input
                    type="number"
                    min="1"
                    value={adjustmentModal.quantity}
                    onChange={(e) => setAdjustmentModal({ ...adjustmentModal, quantity: parseInt(e.target.value) || 1 })}
                    className={`w-full px-4 py-2 rounded-lg border ${inputClass}`}
                  />
                </div>

                {adjustmentModal.type === 'out' && (
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('tools.keyInventory.jobNumberOptional', 'Job Number (Optional)')}</label>
                    <input
                      type="text"
                      value={adjustmentModal.jobNumber}
                      onChange={(e) => setAdjustmentModal({ ...adjustmentModal, jobNumber: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${inputClass}`}
                      placeholder={t('tools.keyInventory.job12345', 'JOB-12345')}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.keyInventory.reasonOptional', 'Reason (Optional)')}</label>
                  <input
                    type="text"
                    value={adjustmentModal.reason}
                    onChange={(e) => setAdjustmentModal({ ...adjustmentModal, reason: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${inputClass}`}
                    placeholder={t('tools.keyInventory.reasonForAdjustment', 'Reason for adjustment')}
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={adjustInventory}
                    className={`flex-1 px-4 py-2 text-white rounded-lg ${
                      adjustmentModal.type === 'in' ? 'bg-green-600 hover:bg-green-700'
                        : adjustmentModal.type === 'out' ? 'bg-red-600 hover:bg-red-700'
                          : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {t('tools.keyInventory.confirm', 'Confirm')}
                  </button>
                  <button
                    onClick={() => setAdjustmentModal({ ...adjustmentModal, isOpen: false })}
                    className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}
                  >
                    {t('tools.keyInventory.cancel2', 'Cancel')}
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      <ConfirmDialog />
      {validationMessage && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50">
          {validationMessage}
        </div>
      )}
    </div>
  );
}

export default KeyInventoryTool;
