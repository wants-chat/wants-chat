import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { Package, Plus, Search, Filter, Edit2, Trash2, Archive, AlertTriangle, TrendingUp, TrendingDown, ChevronDown, X, Save, BarChart3, Loader2 } from 'lucide-react';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';
import { api } from '../../lib/api';
import { useToolData } from '../../hooks/useToolData';

interface Product {
  id: string;
  name: string;
  sku: string;
  description?: string;
  category_id?: string;
  category_name?: string;
  unit_price: number;
  cost_price?: number;
  quantity: number;
  min_stock_level: number;
  max_stock_level?: number;
  unit_of_measure?: string;
  barcode?: string;
  status: 'active' | 'inactive' | 'discontinued';
  created_at: string;
  updated_at: string;
}

interface ProductCategory {
  id: string;
  name: string;
  description?: string;
}

interface InventoryAdjustment {
  quantity_change: number;
  adjustment_type: 'add' | 'remove' | 'set';
  reason: string;
  notes?: string;
}

interface UIConfig {
  prefillData?: {
    name?: string;
    sku?: string;
    description?: string;
    unit_price?: number;
    cost_price?: number;
    quantity?: number;
    min_stock_level?: number;
    category?: string;
    barcode?: string;
  };
}

interface InventoryManagerToolProps {
  config?: UIConfig;
}

// Column configuration for exports
const inventoryColumns: ColumnConfig[] = [
  { key: 'name', header: 'Product Name', type: 'string' },
  { key: 'sku', header: 'SKU', type: 'string' },
  { key: 'category_name', header: 'Category', type: 'string' },
  { key: 'unit_price', header: 'Unit Price', type: 'currency' },
  { key: 'cost_price', header: 'Cost Price', type: 'currency' },
  { key: 'quantity', header: 'Quantity', type: 'number' },
  { key: 'min_stock_level', header: 'Min Stock Level', type: 'number' },
  { key: 'unit_of_measure', header: 'Unit', type: 'string' },
  { key: 'barcode', header: 'Barcode', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'created_at', header: 'Created At', type: 'date' },
];

export function InventoryManagerTool({ config }: InventoryManagerToolProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // useToolData hook for products
  const {
    data: products,
    isLoading,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    addItem,
    updateItem,
    deleteItem,
    forceSync,
  } = useToolData<Product>('inventory-products', [], inventoryColumns);

  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showLowStock, setShowLowStock] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [showProductModal, setShowProductModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    category_id: '',
    unit_price: '',
    cost_price: '',
    quantity: '',
    min_stock_level: '10',
    max_stock_level: '',
    unit_of_measure: 'piece',
    barcode: '',
    status: 'active' as const,
  });

  const [adjustmentData, setAdjustmentData] = useState<InventoryAdjustment>({
    quantity_change: 0,
    adjustment_type: 'add',
    reason: 'restock',
    notes: '',
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
  });

  // Fetch categories on mount
  const fetchCategories = useCallback(async () => {
    try {
      const response = await api.get<{ items: ProductCategory[] }>('/business/product-categories');
      setCategories(response.items || []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      setCategories([]);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (config?.prefillData) {
      const prefill = config.prefillData;
      if (prefill.name || prefill.sku) {
        setFormData(prev => ({
          ...prev,
          name: prefill.name || prev.name,
          sku: prefill.sku || prev.sku,
          description: prefill.description || prev.description,
          unit_price: prefill.unit_price?.toString() || prev.unit_price,
          cost_price: prefill.cost_price?.toString() || prev.cost_price,
          quantity: prefill.quantity?.toString() || prev.quantity,
          min_stock_level: prefill.min_stock_level?.toString() || prev.min_stock_level,
          barcode: prefill.barcode || prev.barcode,
        }));
        setShowProductModal(true);
      }
    }
  }, [config?.prefillData]);

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.sku || !formData.unit_price) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      const payload = {
        name: formData.name,
        sku: formData.sku,
        description: formData.description || null,
        category_id: formData.category_id || null,
        unit_price: parseFloat(formData.unit_price),
        cost_price: formData.cost_price ? parseFloat(formData.cost_price) : null,
        quantity: parseInt(formData.quantity) || 0,
        min_stock_level: parseInt(formData.min_stock_level) || 10,
        max_stock_level: formData.max_stock_level ? parseInt(formData.max_stock_level) : null,
        unit_of_measure: formData.unit_of_measure,
        barcode: formData.barcode || null,
        status: formData.status,
      };

      if (editingProduct) {
        updateItem(editingProduct.id, payload);
        setSuccessMessage('Product updated successfully');
      } else {
        // Create a new product with generated ID
        const newProduct: Product = {
          id: `product-${Date.now()}`,
          ...payload,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as Product;
        addItem(newProduct);
        setSuccessMessage('Product created successfully');
      }

      setShowProductModal(false);
      resetForm();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save product');
    }
  };

  const handleAdjustInventory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingProduct) return;

    try {
      const quantityAdjustment = adjustmentData.adjustment_type === 'remove'
        ? -Math.abs(adjustmentData.quantity_change)
        : Math.abs(adjustmentData.quantity_change);

      const newQuantity = adjustingProduct.quantity + quantityAdjustment;

      updateItem(adjustingProduct.id, {
        quantity: newQuantity,
        updated_at: new Date().toISOString(),
      });

      setSuccessMessage('Inventory adjusted successfully');
      setShowAdjustModal(false);
      setAdjustingProduct(null);
      setAdjustmentData({
        quantity_change: 0,
        adjustment_type: 'add',
        reason: 'restock',
        notes: '',
      });
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to adjust inventory');
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.name) return;

    try {
      await api.post('/business/product-categories', categoryForm);
      setSuccessMessage('Category created successfully');
      setShowCategoryModal(false);
      setCategoryForm({ name: '', description: '' });
      fetchCategories();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to create category');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Product',
      message: 'Are you sure you want to delete this product? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });

    if (!confirmed) return;

    try {
      deleteItem(id);
      setSuccessMessage('Product deleted successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to delete product');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      sku: '',
      description: '',
      category_id: '',
      unit_price: '',
      cost_price: '',
      quantity: '',
      min_stock_level: '10',
      max_stock_level: '',
      unit_of_measure: 'piece',
      barcode: '',
      status: 'active',
    });
    setEditingProduct(null);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      description: product.description || '',
      category_id: product.category_id || '',
      unit_price: product.unit_price.toString(),
      cost_price: product.cost_price?.toString() || '',
      quantity: product.quantity.toString(),
      min_stock_level: product.min_stock_level.toString(),
      max_stock_level: product.max_stock_level?.toString() || '',
      unit_of_measure: product.unit_of_measure || 'piece',
      barcode: product.barcode || '',
      status: product.status,
    });
    setShowProductModal(true);
  };

  const openAdjustModal = (product: Product) => {
    setAdjustingProduct(product);
    setShowAdjustModal(true);
  };

  const getStockStatus = (product: Product) => {
    if (product.quantity <= 0) return { label: 'Out of Stock', color: 'text-red-400 bg-red-500/10' };
    if (product.quantity <= product.min_stock_level) return { label: 'Low Stock', color: 'text-yellow-400 bg-yellow-500/10' };
    if (product.max_stock_level && product.quantity >= product.max_stock_level) return { label: 'Overstocked', color: 'text-blue-400 bg-blue-500/10' };
    return { label: 'In Stock', color: 'text-green-400 bg-green-500/10' };
  };

  const stats = {
    totalProducts: products.length,
    lowStock: products.filter(p => p.quantity <= p.min_stock_level && p.quantity > 0).length,
    outOfStock: products.filter(p => p.quantity <= 0).length,
    totalValue: products.reduce((sum, p) => sum + (p.unit_price * p.quantity), 0),
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-white'} flex items-center justify-center`}>
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-white'} p-4 md:p-6`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500/20 rounded-xl">
              <Package className="w-8 h-8 text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{t('tools.inventoryManager.inventoryManager', 'Inventory Manager')}</h1>
              <p className="text-gray-400">{t('tools.inventoryManager.trackProductsAndStockLevels', 'Track products and stock levels')}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <WidgetEmbedButton toolSlug="inventory-manager" toolName="Inventory Manager" />

            <SyncStatus
              isSynced={isSynced}
              isSaving={isSaving}
              lastSaved={lastSaved}
              syncError={syncError}
              onForceSync={forceSync}
              theme="dark"
              showLabel={true}
              size="md"
            />
            <ExportDropdown
              onExportCSV={() => exportToCSV(products, inventoryColumns, { filename: 'inventory' })}
              onExportExcel={() => exportToExcel(products, inventoryColumns, { filename: 'inventory' })}
              onExportJSON={() => exportToJSON(products, { filename: 'inventory' })}
              onExportPDF={() => exportToPDF(products, inventoryColumns, { filename: 'inventory', title: 'Inventory Report' })}
              onPrint={() => printData(products, inventoryColumns, { title: 'Inventory Report' })}
              onCopyToClipboard={() => copyUtil(products, inventoryColumns)}
              disabled={products.length === 0}
              showImport={false}
              theme="dark"
            />
            <button
              onClick={() => setShowCategoryModal(true)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t('tools.inventoryManager.category3', 'Category')}
            </button>
            <button
              onClick={() => {
                resetForm();
                setShowProductModal(true);
              }}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t('tools.inventoryManager.addProduct', 'Add Product')}
            </button>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400">
            {successMessage}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
            <div className="flex items-center gap-2 text-gray-400 mb-1">
              <Package className="w-4 h-4" />
              <span className="text-sm">{t('tools.inventoryManager.totalProducts', 'Total Products')}</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.totalProducts}</p>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
            <div className="flex items-center gap-2 text-yellow-400 mb-1">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm">{t('tools.inventoryManager.lowStock', 'Low Stock')}</span>
            </div>
            <p className="text-2xl font-bold text-yellow-400">{stats.lowStock}</p>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
            <div className="flex items-center gap-2 text-red-400 mb-1">
              <Archive className="w-4 h-4" />
              <span className="text-sm">{t('tools.inventoryManager.outOfStock', 'Out of Stock')}</span>
            </div>
            <p className="text-2xl font-bold text-red-400">{stats.outOfStock}</p>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
            <div className="flex items-center gap-2 text-green-400 mb-1">
              <BarChart3 className="w-4 h-4" />
              <span className="text-sm">{t('tools.inventoryManager.totalValue', 'Total Value')}</span>
            </div>
            <p className="text-2xl font-bold text-green-400">${stats.totalValue.toLocaleString()}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('tools.inventoryManager.searchProducts', 'Search products...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
            >
              <option value="">{t('tools.inventoryManager.allCategories', 'All Categories')}</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
            >
              <option value="">{t('tools.inventoryManager.allStatus', 'All Status')}</option>
              <option value="active">{t('tools.inventoryManager.active', 'Active')}</option>
              <option value="inactive">{t('tools.inventoryManager.inactive', 'Inactive')}</option>
              <option value="discontinued">{t('tools.inventoryManager.discontinued', 'Discontinued')}</option>
            </select>
            <button
              onClick={() => setShowLowStock(!showLowStock)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                showLowStock
                  ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                  : 'bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              {t('tools.inventoryManager.lowStock2', 'Low Stock')}
            </button>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-400">{t('tools.inventoryManager.loadingProducts', 'Loading products...')}</div>
          ) : products.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{t('tools.inventoryManager.noProductsFound', 'No products found')}</p>
              <button
                onClick={() => setShowProductModal(true)}
                className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg"
              >
                {t('tools.inventoryManager.addYourFirstProduct', 'Add Your First Product')}
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left p-4 text-gray-400 font-medium">{t('tools.inventoryManager.product', 'Product')}</th>
                    <th className="text-left p-4 text-gray-400 font-medium">{t('tools.inventoryManager.sku', 'SKU')}</th>
                    <th className="text-left p-4 text-gray-400 font-medium">{t('tools.inventoryManager.category', 'Category')}</th>
                    <th className="text-right p-4 text-gray-400 font-medium">{t('tools.inventoryManager.price', 'Price')}</th>
                    <th className="text-right p-4 text-gray-400 font-medium">{t('tools.inventoryManager.quantity', 'Quantity')}</th>
                    <th className="text-center p-4 text-gray-400 font-medium">{t('tools.inventoryManager.status', 'Status')}</th>
                    <th className="text-right p-4 text-gray-400 font-medium">{t('tools.inventoryManager.actions', 'Actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => {
                    const stockStatus = getStockStatus(product);
                    return (
                      <tr key={product.id} className="border-b border-gray-700/50 hover:bg-gray-700/20">
                        <td className="p-4">
                          <div>
                            <p className="text-white font-medium">{product.name}</p>
                            {product.description && (
                              <p className="text-gray-400 text-sm truncate max-w-xs">{product.description}</p>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-gray-300 font-mono text-sm">{product.sku}</td>
                        <td className="p-4 text-gray-300">{product.category_name || '-'}</td>
                        <td className="p-4 text-right text-white">${product.unit_price.toFixed(2)}</td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-white font-medium">{product.quantity}</span>
                            <span className="text-gray-500 text-sm">/ {product.min_stock_level}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex justify-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}>
                              {stockStatus.label}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openAdjustModal(product)}
                              className="p-2 hover:bg-gray-700 rounded-lg text-blue-400 transition-colors"
                              title={t('tools.inventoryManager.adjustStock', 'Adjust Stock')}
                            >
                              <TrendingUp className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openEditModal(product)}
                              className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 transition-colors"
                              title={t('tools.inventoryManager.edit', 'Edit')}
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="p-2 hover:bg-gray-700 rounded-lg text-red-400 transition-colors"
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

        {/* Product Modal */}
        {showProductModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-700">
                <h2 className="text-xl font-semibold text-white">
                  {editingProduct ? t('tools.inventoryManager.editProduct', 'Edit Product') : t('tools.inventoryManager.addProduct2', 'Add Product')}
                </h2>
                <button
                  onClick={() => {
                    setShowProductModal(false);
                    resetForm();
                  }}
                  className="p-2 hover:bg-gray-700 rounded-lg text-gray-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmitProduct} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">{t('tools.inventoryManager.name', 'Name *')}</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">{t('tools.inventoryManager.sku2', 'SKU *')}</label>
                    <input
                      type="text"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">{t('tools.inventoryManager.description', 'Description')}</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">{t('tools.inventoryManager.category2', 'Category')}</label>
                    <select
                      value={formData.category_id}
                      onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="">{t('tools.inventoryManager.selectCategory', 'Select Category')}</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">{t('tools.inventoryManager.barcode', 'Barcode')}</label>
                    <input
                      type="text"
                      value={formData.barcode}
                      onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">{t('tools.inventoryManager.unitPrice', 'Unit Price *')}</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.unit_price}
                      onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">{t('tools.inventoryManager.costPrice', 'Cost Price')}</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.cost_price}
                      onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">{t('tools.inventoryManager.quantity2', 'Quantity')}</label>
                    <input
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">{t('tools.inventoryManager.unit', 'Unit')}</label>
                    <select
                      value={formData.unit_of_measure}
                      onChange={(e) => setFormData({ ...formData, unit_of_measure: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="piece">{t('tools.inventoryManager.piece', 'Piece')}</option>
                      <option value="kg">{t('tools.inventoryManager.kilogram', 'Kilogram')}</option>
                      <option value="lb">{t('tools.inventoryManager.pound', 'Pound')}</option>
                      <option value="liter">{t('tools.inventoryManager.liter', 'Liter')}</option>
                      <option value="gallon">{t('tools.inventoryManager.gallon', 'Gallon')}</option>
                      <option value="box">{t('tools.inventoryManager.box', 'Box')}</option>
                      <option value="pack">{t('tools.inventoryManager.pack', 'Pack')}</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">{t('tools.inventoryManager.minStockLevel', 'Min Stock Level')}</label>
                    <input
                      type="number"
                      value={formData.min_stock_level}
                      onChange={(e) => setFormData({ ...formData, min_stock_level: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">{t('tools.inventoryManager.maxStockLevel', 'Max Stock Level')}</label>
                    <input
                      type="number"
                      value={formData.max_stock_level}
                      onChange={(e) => setFormData({ ...formData, max_stock_level: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">{t('tools.inventoryManager.status2', 'Status')}</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="active">{t('tools.inventoryManager.active2', 'Active')}</option>
                      <option value="inactive">{t('tools.inventoryManager.inactive2', 'Inactive')}</option>
                      <option value="discontinued">{t('tools.inventoryManager.discontinued2', 'Discontinued')}</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowProductModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
                  >
                    {t('tools.inventoryManager.cancel', 'Cancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {editingProduct ? t('tools.inventoryManager.update', 'Update') : t('tools.inventoryManager.create', 'Create')} Product
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Adjust Inventory Modal */}
        {showAdjustModal && adjustingProduct && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl w-full max-w-md">
              <div className="flex items-center justify-between p-6 border-b border-gray-700">
                <h2 className="text-xl font-semibold text-white">{t('tools.inventoryManager.adjustInventory', 'Adjust Inventory')}</h2>
                <button
                  onClick={() => {
                    setShowAdjustModal(false);
                    setAdjustingProduct(null);
                  }}
                  className="p-2 hover:bg-gray-700 rounded-lg text-gray-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleAdjustInventory} className="p-6 space-y-4">
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <p className="text-white font-medium">{adjustingProduct.name}</p>
                  <p className="text-gray-400 text-sm">Current Stock: {adjustingProduct.quantity}</p>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">{t('tools.inventoryManager.adjustmentType', 'Adjustment Type')}</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setAdjustmentData({ ...adjustmentData, adjustment_type: 'add' })}
                      className={`flex-1 px-4 py-2 rounded-lg flex items-center justify-center gap-2 ${
                        adjustmentData.adjustment_type === 'add'
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : 'bg-gray-700 text-gray-400 border border-gray-600'
                      }`}
                    >
                      <TrendingUp className="w-4 h-4" />
                      {t('tools.inventoryManager.addStock', 'Add Stock')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdjustmentData({ ...adjustmentData, adjustment_type: 'remove' })}
                      className={`flex-1 px-4 py-2 rounded-lg flex items-center justify-center gap-2 ${
                        adjustmentData.adjustment_type === 'remove'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-gray-700 text-gray-400 border border-gray-600'
                      }`}
                    >
                      <TrendingDown className="w-4 h-4" />
                      {t('tools.inventoryManager.remove', 'Remove')}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">{t('tools.inventoryManager.quantity3', 'Quantity')}</label>
                  <input
                    type="number"
                    min="1"
                    value={adjustmentData.quantity_change}
                    onChange={(e) => setAdjustmentData({ ...adjustmentData, quantity_change: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">{t('tools.inventoryManager.reason', 'Reason')}</label>
                  <select
                    value={adjustmentData.reason}
                    onChange={(e) => setAdjustmentData({ ...adjustmentData, reason: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="restock">{t('tools.inventoryManager.restock', 'Restock')}</option>
                    <option value="sale">{t('tools.inventoryManager.sale', 'Sale')}</option>
                    <option value="return">{t('tools.inventoryManager.customerReturn', 'Customer Return')}</option>
                    <option value="damaged">{t('tools.inventoryManager.damagedSpoiled', 'Damaged/Spoiled')}</option>
                    <option value="theft">{t('tools.inventoryManager.theftLoss', 'Theft/Loss')}</option>
                    <option value="correction">{t('tools.inventoryManager.inventoryCorrection', 'Inventory Correction')}</option>
                    <option value="other">{t('tools.inventoryManager.other', 'Other')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">{t('tools.inventoryManager.notes', 'Notes')}</label>
                  <textarea
                    value={adjustmentData.notes}
                    onChange={(e) => setAdjustmentData({ ...adjustmentData, notes: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    placeholder={t('tools.inventoryManager.optionalNotes', 'Optional notes...')}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAdjustModal(false);
                      setAdjustingProduct(null);
                    }}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
                  >
                    {t('tools.inventoryManager.cancel2', 'Cancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg"
                  >
                    {t('tools.inventoryManager.applyAdjustment', 'Apply Adjustment')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Category Modal */}
        {showCategoryModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl w-full max-w-md">
              <div className="flex items-center justify-between p-6 border-b border-gray-700">
                <h2 className="text-xl font-semibold text-white">{t('tools.inventoryManager.addCategory', 'Add Category')}</h2>
                <button
                  onClick={() => setShowCategoryModal(false)}
                  className="p-2 hover:bg-gray-700 rounded-lg text-gray-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleCreateCategory} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">{t('tools.inventoryManager.name2', 'Name *')}</label>
                  <input
                    type="text"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">{t('tools.inventoryManager.description2', 'Description')}</label>
                  <textarea
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCategoryModal(false)}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
                  >
                    {t('tools.inventoryManager.cancel3', 'Cancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg"
                  >
                    {t('tools.inventoryManager.createCategory', 'Create Category')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <ConfirmDialog />
      </div>
    </div>
  );
}

export default InventoryManagerTool;
