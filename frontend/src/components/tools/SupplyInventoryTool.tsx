'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  Package,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Search,
  Filter,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  ShoppingCart,
  BarChart3,
  Box,
  Droplets,
  Sparkles,
  RefreshCw,
  DollarSign,
  Calendar,
  Printer,
  Download,
} from 'lucide-react';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SupplyInventoryToolProps {
  uiConfig?: UIConfig;
}

// Types
interface Supply {
  id: string;
  name: string;
  category: string;
  sku: string;
  quantity: number;
  unit: string;
  minStock: number;
  maxStock: number;
  unitCost: number;
  supplier: string;
  location: string;
  lastRestocked: string;
  expirationDate?: string;
  notes: string;
  createdAt: string;
}

interface InventoryTransaction {
  id: string;
  supplyId: string;
  type: 'restock' | 'usage' | 'adjustment' | 'disposal';
  quantity: number;
  date: string;
  notes: string;
  performedBy: string;
}

interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  notes: string;
}

// Supply categories
const SUPPLY_CATEGORIES = [
  'Cleaning Chemicals',
  'Disinfectants',
  'Paper Products',
  'Trash Bags',
  'Mops & Brooms',
  'Cloths & Wipes',
  'Equipment',
  'Safety Gear',
  'Air Fresheners',
  'Specialty Products',
  'Other',
];

const UNITS = ['units', 'bottles', 'gallons', 'liters', 'boxes', 'cases', 'rolls', 'bags', 'packs', 'pairs'];

// Column configurations for export
const SUPPLY_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Name', type: 'string' },
  { key: 'category', header: 'Category', type: 'string' },
  { key: 'sku', header: 'SKU', type: 'string' },
  { key: 'quantity', header: 'Quantity', type: 'number' },
  { key: 'unit', header: 'Unit', type: 'string' },
  { key: 'minStock', header: 'Min Stock', type: 'number' },
  { key: 'maxStock', header: 'Max Stock', type: 'number' },
  { key: 'unitCost', header: 'Unit Cost', type: 'currency' },
  { key: 'totalValue', header: 'Total Value', type: 'currency' },
  { key: 'supplier', header: 'Supplier', type: 'string' },
  { key: 'location', header: 'Location', type: 'string' },
  { key: 'lastRestocked', header: 'Last Restocked', type: 'date' },
  { key: 'status', header: 'Status', type: 'string' },
];

const TRANSACTION_COLUMNS: ColumnConfig[] = [
  { key: 'supplyName', header: 'Supply', type: 'string' },
  { key: 'type', header: 'Type', type: 'string' },
  { key: 'quantity', header: 'Quantity', type: 'number' },
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'performedBy', header: 'Performed By', type: 'string' },
  { key: 'notes', header: 'Notes', type: 'string' },
];

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const getStockStatus = (supply: Supply) => {
  if (supply.quantity <= 0) return 'out-of-stock';
  if (supply.quantity <= supply.minStock) return 'low-stock';
  if (supply.quantity >= supply.maxStock) return 'overstocked';
  return 'in-stock';
};

const getStockStatusColor = (status: string, theme: string) => {
  const colors: Record<string, string> = {
    'out-of-stock': theme === 'dark' ? 'bg-red-900/50 text-red-300' : 'bg-red-100 text-red-800',
    'low-stock': theme === 'dark' ? 'bg-yellow-900/50 text-yellow-300' : 'bg-yellow-100 text-yellow-800',
    'overstocked': theme === 'dark' ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-800',
    'in-stock': theme === 'dark' ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-800',
  };
  return colors[status] || colors['in-stock'];
};

// Main Component
export const SupplyInventoryTool: React.FC<SupplyInventoryToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const [isPrefilled, setIsPrefilled] = useState(false);
  const { theme } = useTheme();
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // useToolData hooks for backend sync
  const {
    data: supplies,
    addItem: addSupplyToBackend,
    updateItem: updateSupplyBackend,
    deleteItem: deleteSupplyBackend,
    isSynced: suppliesSynced,
    isSaving: suppliesSaving,
    lastSaved: suppliesLastSaved,
    syncError: suppliesSyncError,
    forceSync: forceSuppliesSync,
  } = useToolData<Supply>('supply-inventory-items', [], SUPPLY_COLUMNS);

  const {
    data: transactions,
    addItem: addTransactionToBackend,
    deleteItem: deleteTransactionBackend,
  } = useToolData<InventoryTransaction>('supply-inventory-transactions', [], TRANSACTION_COLUMNS);

  const {
    data: suppliers,
    addItem: addSupplierToBackend,
    updateItem: updateSupplierBackend,
    deleteItem: deleteSupplierBackend,
  } = useToolData<Supplier>('supply-inventory-suppliers', [], []);

  // Local UI State
  const [activeTab, setActiveTab] = useState<'inventory' | 'transactions' | 'suppliers' | 'reports'>('inventory');
  const [showSupplyForm, setShowSupplyForm] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showSupplierForm, setShowSupplierForm] = useState(false);
  const [editingSupply, setEditingSupply] = useState<Supply | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');

  // Form states
  const [newSupply, setNewSupply] = useState<Partial<Supply>>({
    name: '',
    category: 'Cleaning Chemicals',
    sku: '',
    quantity: 0,
    unit: 'units',
    minStock: 5,
    maxStock: 50,
    unitCost: 0,
    supplier: '',
    location: '',
    notes: '',
  });

  const [newTransaction, setNewTransaction] = useState<Partial<InventoryTransaction>>({
    supplyId: '',
    type: 'restock',
    quantity: 0,
    notes: '',
    performedBy: '',
  });

  const [newSupplier, setNewSupplier] = useState<Partial<Supplier>>({
    name: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    notes: '',
  });

  // Prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.item || params.product) {
        setNewSupply({
          ...newSupply,
          name: params.item || params.product || '',
        });
        setShowSupplyForm(true);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Filter and sort supplies
  const filteredSupplies = useMemo(() => {
    return supplies
      .filter((supply) => {
        const matchesSearch =
          searchTerm === '' ||
          supply.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          supply.sku.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'all' || supply.category === filterCategory;
        const matchesStatus = filterStatus === 'all' || getStockStatus(supply) === filterStatus;
        return matchesSearch && matchesCategory && matchesStatus;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'name':
            return a.name.localeCompare(b.name);
          case 'quantity':
            return a.quantity - b.quantity;
          case 'value':
            return b.quantity * b.unitCost - a.quantity * a.unitCost;
          case 'category':
            return a.category.localeCompare(b.category);
          default:
            return 0;
        }
      });
  }, [supplies, searchTerm, filterCategory, filterStatus, sortBy]);

  // Statistics
  const stats = useMemo(() => {
    const totalItems = supplies.length;
    const totalValue = supplies.reduce((sum, s) => sum + s.quantity * s.unitCost, 0);
    const lowStockItems = supplies.filter((s) => getStockStatus(s) === 'low-stock').length;
    const outOfStockItems = supplies.filter((s) => getStockStatus(s) === 'out-of-stock').length;
    const categories = new Set(supplies.map((s) => s.category)).size;

    return { totalItems, totalValue, lowStockItems, outOfStockItems, categories };
  }, [supplies]);

  // Add supply
  const addSupply = () => {
    if (!newSupply.name) {
      setValidationMessage('Please enter a supply name');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const supply: Supply = {
      id: generateId(),
      name: newSupply.name || '',
      category: newSupply.category || 'Other',
      sku: newSupply.sku || generateId().toUpperCase(),
      quantity: newSupply.quantity || 0,
      unit: newSupply.unit || 'units',
      minStock: newSupply.minStock || 5,
      maxStock: newSupply.maxStock || 50,
      unitCost: newSupply.unitCost || 0,
      supplier: newSupply.supplier || '',
      location: newSupply.location || '',
      lastRestocked: new Date().toISOString(),
      expirationDate: newSupply.expirationDate,
      notes: newSupply.notes || '',
      createdAt: new Date().toISOString(),
    };

    addSupplyToBackend(supply);
    setShowSupplyForm(false);
    resetSupplyForm();
  };

  // Update supply
  const updateSupply = () => {
    if (!editingSupply) return;
    updateSupplyBackend(editingSupply.id, editingSupply);
    setEditingSupply(null);
  };

  // Delete supply
  const deleteSupply = async (supplyId: string) => {
    const confirmed = await confirm({
      title: 'Confirm Action',
      message: 'Are you sure you want to delete this supply item?',
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (!confirmed) return;
    deleteSupplyBackend(supplyId);
  };

  // Add transaction
  const addTransaction = () => {
    if (!newTransaction.supplyId || !newTransaction.quantity) {
      setValidationMessage('Please select a supply and enter a quantity');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const supply = supplies.find((s) => s.id === newTransaction.supplyId);
    if (!supply) return;

    // Create transaction
    const transaction: InventoryTransaction = {
      id: generateId(),
      supplyId: newTransaction.supplyId || '',
      type: newTransaction.type || 'restock',
      quantity: newTransaction.quantity || 0,
      date: new Date().toISOString(),
      notes: newTransaction.notes || '',
      performedBy: newTransaction.performedBy || '',
    };

    addTransactionToBackend(transaction);

    // Update supply quantity
    let newQuantity = supply.quantity;
    if (transaction.type === 'restock') {
      newQuantity += transaction.quantity;
    } else if (transaction.type === 'usage' || transaction.type === 'disposal') {
      newQuantity = Math.max(0, newQuantity - transaction.quantity);
    } else if (transaction.type === 'adjustment') {
      newQuantity = transaction.quantity;
    }

    updateSupplyBackend(supply.id, {
      quantity: newQuantity,
      lastRestocked: transaction.type === 'restock' ? new Date().toISOString() : supply.lastRestocked,
    });

    setShowTransactionForm(false);
    resetTransactionForm();
  };

  // Add supplier
  const addSupplier = () => {
    if (!newSupplier.name) {
      setValidationMessage('Please enter a supplier name');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const supplier: Supplier = {
      id: generateId(),
      name: newSupplier.name || '',
      email: newSupplier.email || '',
      phone: newSupplier.phone || '',
      address: newSupplier.address || '',
      website: newSupplier.website || '',
      notes: newSupplier.notes || '',
    };

    addSupplierToBackend(supplier);
    setShowSupplierForm(false);
    setNewSupplier({ name: '', email: '', phone: '', address: '', website: '', notes: '' });
  };

  // Reset forms
  const resetSupplyForm = () => {
    setNewSupply({
      name: '',
      category: 'Cleaning Chemicals',
      sku: '',
      quantity: 0,
      unit: 'units',
      minStock: 5,
      maxStock: 50,
      unitCost: 0,
      supplier: '',
      location: '',
      notes: '',
    });
  };

  const resetTransactionForm = () => {
    setNewTransaction({
      supplyId: '',
      type: 'restock',
      quantity: 0,
      notes: '',
      performedBy: '',
    });
  };

  // Export data preparation
  const prepareExportData = () => {
    return supplies.map((supply) => ({
      ...supply,
      totalValue: supply.quantity * supply.unitCost,
      status: getStockStatus(supply),
    }));
  };

  // Reorder list
  const reorderList = useMemo(() => {
    return supplies.filter((s) => getStockStatus(s) === 'low-stock' || getStockStatus(s) === 'out-of-stock');
  }, [supplies]);

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.supplyInventory.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
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
                  {t('tools.supplyInventory.supplyInventory', 'Supply Inventory')}
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.supplyInventory.trackCleaningSuppliesManageStock', 'Track cleaning supplies, manage stock levels, and reorder alerts')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="supply-inventory" toolName="Supply Inventory" />

              <SyncStatus
                isSynced={suppliesSynced}
                isSaving={suppliesSaving}
                lastSaved={suppliesLastSaved}
                syncError={suppliesSyncError}
                onForceSync={forceSuppliesSync}
                theme={theme}
                showLabel={true}
                size="md"
              />
              <ExportDropdown
                onExportCSV={() => exportToCSV(prepareExportData(), SUPPLY_COLUMNS, { filename: 'supply-inventory' })}
                onExportExcel={() => exportToExcel(prepareExportData(), SUPPLY_COLUMNS, { filename: 'supply-inventory' })}
                onExportJSON={() => exportToJSON(prepareExportData(), { filename: 'supply-inventory' })}
                onExportPDF={async () => {
                  await exportToPDF(prepareExportData(), SUPPLY_COLUMNS, {
                    filename: 'supply-inventory',
                    title: 'Supply Inventory Report',
                    subtitle: `${stats.totalItems} items | Total Value: ${formatCurrency(stats.totalValue)}`,
                  });
                }}
                onPrint={() => printData(prepareExportData(), SUPPLY_COLUMNS, { title: 'Supply Inventory' })}
                onCopyToClipboard={async () => await copyUtil(prepareExportData(), SUPPLY_COLUMNS, 'tab')}
                showImport={false}
                theme={theme}
              />
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'inventory', label: 'Inventory', icon: <Box className="w-4 h-4" /> },
              { id: 'transactions', label: 'Transactions', icon: <RefreshCw className="w-4 h-4" /> },
              { id: 'suppliers', label: 'Suppliers', icon: <ShoppingCart className="w-4 h-4" /> },
              { id: 'reports', label: 'Reports', icon: <BarChart3 className="w-4 h-4" /> },
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

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Box className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.supplyInventory.totalItems', 'Total Items')}</p>
                  <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {stats.totalItems}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <DollarSign className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.supplyInventory.totalValue', 'Total Value')}</p>
                  <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {formatCurrency(stats.totalValue)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <TrendingDown className="w-5 h-5 text-yellow-500" />
                </div>
                <div>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.supplyInventory.lowStock', 'Low Stock')}</p>
                  <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {stats.lowStockItems}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.supplyInventory.outOfStock', 'Out of Stock')}</p>
                  <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {stats.outOfStockItems}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Droplets className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.supplyInventory.categories', 'Categories')}</p>
                  <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {stats.categories}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Low Stock Alert */}
        {reorderList.length > 0 && (
          <div className={`${theme === 'dark' ? 'bg-yellow-900/30' : 'bg-yellow-50'} border ${theme === 'dark' ? 'border-yellow-700' : 'border-yellow-200'} rounded-lg p-4 mb-6`}>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className={`w-5 h-5 ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`} />
              <span className={`font-semibold ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-800'}`}>
                {reorderList.length} item{reorderList.length > 1 ? 's' : ''} need reordering
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {reorderList.slice(0, 5).map((supply) => (
                <span
                  key={supply.id}
                  className={`px-2 py-1 rounded text-sm ${
                    getStockStatus(supply) === 'out-of-stock'
                      ? theme === 'dark' ? 'bg-red-900/50 text-red-300' : 'bg-red-100 text-red-800'
                      : theme === 'dark' ? 'bg-yellow-900/50 text-yellow-300' : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {supply.name} ({supply.quantity} {supply.unit})
                </span>
              ))}
              {reorderList.length > 5 && (
                <span className={`px-2 py-1 text-sm ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-700'}`}>
                  +{reorderList.length - 5} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            {/* Controls */}
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 shadow`}>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder={t('tools.supplyInventory.searchSupplies', 'Search supplies...')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`pl-9 pr-4 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className={`px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="all">{t('tools.supplyInventory.allCategories', 'All Categories')}</option>
                    {SUPPLY_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className={`px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="all">{t('tools.supplyInventory.allStatus', 'All Status')}</option>
                    <option value="in-stock">{t('tools.supplyInventory.inStock', 'In Stock')}</option>
                    <option value="low-stock">{t('tools.supplyInventory.lowStock2', 'Low Stock')}</option>
                    <option value="out-of-stock">{t('tools.supplyInventory.outOfStock2', 'Out of Stock')}</option>
                    <option value="overstocked">{t('tools.supplyInventory.overstocked', 'Overstocked')}</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowTransactionForm(true)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                      theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    <RefreshCw className="w-4 h-4" />
                    {t('tools.supplyInventory.logTransaction', 'Log Transaction')}
                  </button>
                  <button
                    onClick={() => setShowSupplyForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90"
                  >
                    <Plus className="w-4 h-4" />
                    {t('tools.supplyInventory.addSupply', 'Add Supply')}
                  </button>
                </div>
              </div>
            </div>

            {/* Supply List */}
            <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
              <CardContent className="p-0">
                {filteredSupplies.length === 0 ? (
                  <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.supplyInventory.noSuppliesFoundAddYour', 'No supplies found. Add your first supply item to get started.')}
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className={theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}>
                          <th className={`px-4 py-3 text-left text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            {t('tools.supplyInventory.item', 'Item')}
                          </th>
                          <th className={`px-4 py-3 text-left text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            {t('tools.supplyInventory.category', 'Category')}
                          </th>
                          <th className={`px-4 py-3 text-center text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            {t('tools.supplyInventory.quantity', 'Quantity')}
                          </th>
                          <th className={`px-4 py-3 text-center text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            {t('tools.supplyInventory.status', 'Status')}
                          </th>
                          <th className={`px-4 py-3 text-right text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            {t('tools.supplyInventory.unitCost', 'Unit Cost')}
                          </th>
                          <th className={`px-4 py-3 text-right text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            {t('tools.supplyInventory.value', 'Value')}
                          </th>
                          <th className={`px-4 py-3 text-center text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            {t('tools.supplyInventory.actions', 'Actions')}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredSupplies.map((supply) => {
                          const status = getStockStatus(supply);
                          return (
                            <tr key={supply.id} className={theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}>
                              <td className="px-4 py-3">
                                <div>
                                  <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    {supply.name}
                                  </p>
                                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                    SKU: {supply.sku}
                                  </p>
                                </div>
                              </td>
                              <td className={`px-4 py-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                {supply.category}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                  {supply.quantity}
                                </span>
                                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {' '}{supply.unit}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStockStatusColor(status, theme)}`}>
                                  {status.replace('-', ' ').toUpperCase()}
                                </span>
                              </td>
                              <td className={`px-4 py-3 text-right ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                {formatCurrency(supply.unitCost)}
                              </td>
                              <td className={`px-4 py-3 text-right font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {formatCurrency(supply.quantity * supply.unitCost)}
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    onClick={() => setEditingSupply(supply)}
                                    className={`p-1.5 rounded ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                                    title={t('tools.supplyInventory.edit', 'Edit')}
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => deleteSupply(supply.id)}
                                    className="p-1.5 rounded text-red-500 hover:bg-red-500/10"
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
              </CardContent>
            </Card>
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                {t('tools.supplyInventory.inventoryTransactions', 'Inventory Transactions')}
              </CardTitle>
              <button
                onClick={() => setShowTransactionForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90"
              >
                <Plus className="w-4 h-4" />
                {t('tools.supplyInventory.logTransaction2', 'Log Transaction')}
              </button>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.supplyInventory.noTransactionsRecordedYet', 'No transactions recorded yet.')}
                </p>
              ) : (
                <div className="space-y-3">
                  {transactions.slice().reverse().map((transaction) => {
                    const supply = supplies.find((s) => s.id === transaction.supplyId);
                    return (
                      <div
                        key={transaction.id}
                        className={`p-4 rounded-lg border ${
                          theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${
                              transaction.type === 'restock' ? 'bg-green-500/20' :
                              transaction.type === 'usage' ? 'bg-blue-500/20' :
                              transaction.type === 'disposal' ? 'bg-red-500/20' :
                              'bg-yellow-500/20'
                            }`}>
                              {transaction.type === 'restock' ? (
                                <TrendingUp className={`w-4 h-4 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} />
                              ) : transaction.type === 'usage' ? (
                                <TrendingDown className={`w-4 h-4 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                              ) : (
                                <Trash2 className={`w-4 h-4 ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`} />
                              )}
                            </div>
                            <div>
                              <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {supply?.name || 'Unknown Item'}
                              </p>
                              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}: {transaction.quantity} {supply?.unit}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                              {formatDate(transaction.date)}
                            </p>
                            {transaction.performedBy && (
                              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                by {transaction.performedBy}
                              </p>
                            )}
                          </div>
                        </div>
                        {transaction.notes && (
                          <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            {transaction.notes}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Suppliers Tab */}
        {activeTab === 'suppliers' && (
          <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                {t('tools.supplyInventory.suppliers', 'Suppliers')}
              </CardTitle>
              <button
                onClick={() => setShowSupplierForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90"
              >
                <Plus className="w-4 h-4" />
                {t('tools.supplyInventory.addSupplier', 'Add Supplier')}
              </button>
            </CardHeader>
            <CardContent>
              {suppliers.length === 0 ? (
                <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.supplyInventory.noSuppliersAddedYet', 'No suppliers added yet.')}
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {suppliers.map((supplier) => (
                    <div
                      key={supplier.id}
                      className={`p-4 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {supplier.name}
                          </h3>
                          {supplier.phone && (
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              {supplier.phone}
                            </p>
                          )}
                          {supplier.email && (
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              {supplier.email}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => deleteSupplierBackend(supplier.id)}
                          className="p-1 rounded text-red-500 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
              <CardHeader>
                <CardTitle className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                  {t('tools.supplyInventory.inventoryByCategory', 'Inventory by Category')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {SUPPLY_CATEGORIES.filter((cat) => supplies.some((s) => s.category === cat)).map((category) => {
                    const categorySupplies = supplies.filter((s) => s.category === category);
                    const totalValue = categorySupplies.reduce((sum, s) => sum + s.quantity * s.unitCost, 0);
                    const totalItems = categorySupplies.length;
                    return (
                      <div key={category} className="flex items-center justify-between">
                        <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                          {category}
                        </span>
                        <div className="text-right">
                          <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {formatCurrency(totalValue)}
                          </span>
                          <span className={`text-sm ml-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            ({totalItems} items)
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
              <CardHeader>
                <CardTitle className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                  {t('tools.supplyInventory.reorderList', 'Reorder List')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {reorderList.length === 0 ? (
                  <p className={`text-center py-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.supplyInventory.allItemsAreStockedAdequately', 'All items are stocked adequately')}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {reorderList.map((supply) => (
                      <div
                        key={supply.id}
                        className={`flex items-center justify-between p-2 rounded ${
                          theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                        }`}
                      >
                        <div>
                          <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {supply.name}
                          </p>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            Current: {supply.quantity} | Min: {supply.minStock}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          getStockStatusColor(getStockStatus(supply), theme)
                        }`}>
                          Need {supply.minStock - supply.quantity}+
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Supply Form Modal */}
        {showSupplyForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.supplyInventory.addSupplyItem', 'Add Supply Item')}
                </h2>
                <button onClick={() => { setShowSupplyForm(false); resetSupplyForm(); }} className="p-2">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.supplyInventory.name', 'Name *')}
                  </label>
                  <input
                    type="text"
                    value={newSupply.name}
                    onChange={(e) => setNewSupply({ ...newSupply, name: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.supplyInventory.category2', 'Category')}
                    </label>
                    <select
                      value={newSupply.category}
                      onChange={(e) => setNewSupply({ ...newSupply, category: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                    >
                      {SUPPLY_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.supplyInventory.sku', 'SKU')}
                    </label>
                    <input
                      type="text"
                      value={newSupply.sku}
                      onChange={(e) => setNewSupply({ ...newSupply, sku: e.target.value })}
                      placeholder={t('tools.supplyInventory.autoGeneratedIfEmpty', 'Auto-generated if empty')}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.supplyInventory.quantity2', 'Quantity')}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={newSupply.quantity}
                      onChange={(e) => setNewSupply({ ...newSupply, quantity: parseInt(e.target.value) || 0 })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.supplyInventory.unit', 'Unit')}
                    </label>
                    <select
                      value={newSupply.unit}
                      onChange={(e) => setNewSupply({ ...newSupply, unit: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                    >
                      {UNITS.map((unit) => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.supplyInventory.unitCost2', 'Unit Cost')}
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={newSupply.unitCost}
                      onChange={(e) => setNewSupply({ ...newSupply, unitCost: parseFloat(e.target.value) || 0 })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.supplyInventory.minStockLevel', 'Min Stock Level')}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={newSupply.minStock}
                      onChange={(e) => setNewSupply({ ...newSupply, minStock: parseInt(e.target.value) || 0 })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.supplyInventory.maxStockLevel', 'Max Stock Level')}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={newSupply.maxStock}
                      onChange={(e) => setNewSupply({ ...newSupply, maxStock: parseInt(e.target.value) || 0 })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.supplyInventory.supplier', 'Supplier')}
                    </label>
                    <input
                      type="text"
                      value={newSupply.supplier}
                      onChange={(e) => setNewSupply({ ...newSupply, supplier: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.supplyInventory.location', 'Location')}
                    </label>
                    <input
                      type="text"
                      value={newSupply.location}
                      onChange={(e) => setNewSupply({ ...newSupply, location: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.supplyInventory.notes', 'Notes')}
                  </label>
                  <textarea
                    value={newSupply.notes}
                    onChange={(e) => setNewSupply({ ...newSupply, notes: e.target.value })}
                    rows={2}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <button
                    onClick={() => { setShowSupplyForm(false); resetSupplyForm(); }}
                    className={`px-4 py-2 rounded-lg ${
                      theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {t('tools.supplyInventory.cancel', 'Cancel')}
                  </button>
                  <button
                    onClick={addSupply}
                    className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90"
                  >
                    {t('tools.supplyInventory.addSupply2', 'Add Supply')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Transaction Form Modal */}
        {showTransactionForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 max-w-md w-full`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.supplyInventory.logInventoryTransaction', 'Log Inventory Transaction')}
                </h2>
                <button onClick={() => { setShowTransactionForm(false); resetTransactionForm(); }} className="p-2">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.supplyInventory.supplyItem', 'Supply Item *')}
                  </label>
                  <select
                    value={newTransaction.supplyId}
                    onChange={(e) => setNewTransaction({ ...newTransaction, supplyId: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  >
                    <option value="">{t('tools.supplyInventory.selectASupply', 'Select a supply')}</option>
                    {supplies.map((supply) => (
                      <option key={supply.id} value={supply.id}>
                        {supply.name} (Current: {supply.quantity} {supply.unit})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.supplyInventory.transactionType', 'Transaction Type')}
                  </label>
                  <select
                    value={newTransaction.type}
                    onChange={(e) => setNewTransaction({ ...newTransaction, type: e.target.value as InventoryTransaction['type'] })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  >
                    <option value="restock">{t('tools.supplyInventory.restockAdd', 'Restock (Add)')}</option>
                    <option value="usage">{t('tools.supplyInventory.usageRemove', 'Usage (Remove)')}</option>
                    <option value="disposal">{t('tools.supplyInventory.disposalRemove', 'Disposal (Remove)')}</option>
                    <option value="adjustment">{t('tools.supplyInventory.adjustmentSet', 'Adjustment (Set)')}</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.supplyInventory.quantity3', 'Quantity *')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newTransaction.quantity}
                    onChange={(e) => setNewTransaction({ ...newTransaction, quantity: parseInt(e.target.value) || 0 })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.supplyInventory.performedBy', 'Performed By')}
                  </label>
                  <input
                    type="text"
                    value={newTransaction.performedBy}
                    onChange={(e) => setNewTransaction({ ...newTransaction, performedBy: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.supplyInventory.notes2', 'Notes')}
                  </label>
                  <textarea
                    value={newTransaction.notes}
                    onChange={(e) => setNewTransaction({ ...newTransaction, notes: e.target.value })}
                    rows={2}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <button
                    onClick={() => { setShowTransactionForm(false); resetTransactionForm(); }}
                    className={`px-4 py-2 rounded-lg ${
                      theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {t('tools.supplyInventory.cancel2', 'Cancel')}
                  </button>
                  <button
                    onClick={addTransaction}
                    className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90"
                  >
                    {t('tools.supplyInventory.logTransaction3', 'Log Transaction')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Supplier Form Modal */}
        {showSupplierForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 max-w-md w-full`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.supplyInventory.addSupplier2', 'Add Supplier')}
                </h2>
                <button onClick={() => setShowSupplierForm(false)} className="p-2">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.supplyInventory.name2', 'Name *')}
                  </label>
                  <input
                    type="text"
                    value={newSupplier.name}
                    onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.supplyInventory.email', 'Email')}
                  </label>
                  <input
                    type="email"
                    value={newSupplier.email}
                    onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.supplyInventory.phone', 'Phone')}
                  </label>
                  <input
                    type="tel"
                    value={newSupplier.phone}
                    onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.supplyInventory.address', 'Address')}
                  </label>
                  <input
                    type="text"
                    value={newSupplier.address}
                    onChange={(e) => setNewSupplier({ ...newSupplier, address: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <button
                    onClick={() => setShowSupplierForm(false)}
                    className={`px-4 py-2 rounded-lg ${
                      theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {t('tools.supplyInventory.cancel3', 'Cancel')}
                  </button>
                  <button
                    onClick={addSupplier}
                    className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90"
                  >
                    {t('tools.supplyInventory.addSupplier3', 'Add Supplier')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow`}>
          <h3 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.supplyInventory.aboutThisTool', 'About This Tool')}
          </h3>
          <div className={`space-y-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            <p>
              Track your cleaning supply inventory with ease. Monitor stock levels, get reorder alerts,
              log transactions, and manage your suppliers all in one place.
            </p>
            <p>
              {t('tools.supplyInventory.allDataIsSyncedTo', 'All data is synced to your account. Export reports for inventory audits or accounting purposes.')}
            </p>
          </div>
        </div>
      </div>
      <ConfirmDialog />
      {validationMessage && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50">
          {validationMessage}
        </div>
      )}
    </div>
  );
};

export default SupplyInventoryTool;
