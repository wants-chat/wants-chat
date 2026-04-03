'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  Package,
  Tag,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  Image as ImageIcon,
  Barcode,
  DollarSign,
  Layers,
  Archive,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  X,
  Grid,
  List,
  Upload,
  Copy,
  BarChart3,
  BoxSelect,
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

interface ProductCatalogToolProps {
  uiConfig?: UIConfig;
}

import { useTheme } from '@/contexts/ThemeContext';

// Types
type ProductStatus = 'active' | 'draft' | 'archived' | 'out_of_stock';

interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  quantity: number;
  attributes: Record<string, string>;
}

interface Product {
  id: string;
  name: string;
  description: string;
  sku: string;
  barcode: string;
  category: string;
  subcategory: string;
  brand: string;
  price: number;
  compareAtPrice?: number;
  cost: number;
  quantity: number;
  lowStockThreshold: number;
  weight?: number;
  weightUnit?: string;
  dimensions?: { length: number; width: number; height: number };
  images: string[];
  tags: string[];
  status: ProductStatus;
  variants: ProductVariant[];
  isFeatured: boolean;
  taxable: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Category {
  id: string;
  name: string;
  parentId?: string;
  productCount: number;
}

// Constants
const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat1', name: 'Electronics', productCount: 0 },
  { id: 'cat2', name: 'Clothing', productCount: 0 },
  { id: 'cat3', name: 'Home & Garden', productCount: 0 },
  { id: 'cat4', name: 'Sports & Outdoors', productCount: 0 },
  { id: 'cat5', name: 'Beauty & Personal Care', productCount: 0 },
  { id: 'cat6', name: 'Food & Beverages', productCount: 0 },
  { id: 'cat7', name: 'Toys & Games', productCount: 0 },
  { id: 'cat8', name: 'Books & Media', productCount: 0 },
];

const SAMPLE_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Wireless Bluetooth Headphones',
    description: 'High-quality wireless headphones with noise cancellation and 30-hour battery life.',
    sku: 'ELEC-WH-001',
    barcode: '123456789001',
    category: 'Electronics',
    subcategory: 'Audio',
    brand: 'TechSound',
    price: 129.99,
    compareAtPrice: 159.99,
    cost: 65.00,
    quantity: 45,
    lowStockThreshold: 10,
    weight: 0.5,
    weightUnit: 'lb',
    images: [],
    tags: ['wireless', 'bluetooth', 'headphones', 'audio'],
    status: 'active',
    variants: [],
    isFeatured: true,
    taxable: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'p2',
    name: 'Organic Cotton T-Shirt',
    description: '100% organic cotton t-shirt, comfortable and eco-friendly.',
    sku: 'CLO-TS-001',
    barcode: '123456789002',
    category: 'Clothing',
    subcategory: 'Tops',
    brand: 'EcoWear',
    price: 29.99,
    cost: 12.00,
    quantity: 120,
    lowStockThreshold: 20,
    weight: 0.3,
    weightUnit: 'lb',
    images: [],
    tags: ['organic', 'cotton', 't-shirt', 'sustainable'],
    status: 'active',
    variants: [
      { id: 'v1', name: 'Small', sku: 'CLO-TS-001-S', price: 29.99, quantity: 30, attributes: { size: 'S' } },
      { id: 'v2', name: 'Medium', sku: 'CLO-TS-001-M', price: 29.99, quantity: 40, attributes: { size: 'M' } },
      { id: 'v3', name: 'Large', sku: 'CLO-TS-001-L', price: 29.99, quantity: 50, attributes: { size: 'L' } },
    ],
    isFeatured: false,
    taxable: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const generateId = () => Math.random().toString(36).substring(2, 11);
const generateSKU = (category: string) => `${category.substring(0, 3).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
const generateBarcode = () => Math.random().toString().substring(2, 14);

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Column configurations for exports
const PRODUCT_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Product Name', type: 'string' },
  { key: 'sku', header: 'SKU', type: 'string' },
  { key: 'barcode', header: 'Barcode', type: 'string' },
  { key: 'category', header: 'Category', type: 'string' },
  { key: 'brand', header: 'Brand', type: 'string' },
  { key: 'price', header: 'Price', type: 'currency' },
  { key: 'cost', header: 'Cost', type: 'currency' },
  { key: 'quantity', header: 'Quantity', type: 'number' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'createdAt', header: 'Created', type: 'date' },
];

// Main Component
export const ProductCatalogTool: React.FC<ProductCatalogToolProps> = ({ uiConfig }) => {
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // useToolData hooks for backend sync
  const {
    data: products,
    addItem: addProductToBackend,
    updateItem: updateProductBackend,
    deleteItem: deleteProductBackend,
    isSynced: productsSynced,
    isSaving: productsSaving,
    lastSaved: productsLastSaved,
    syncError: productsSyncError,
    forceSync: forceProductsSync,
  } = useToolData<Product>('product-catalog', SAMPLE_PRODUCTS, PRODUCT_COLUMNS);

  const {
    data: categories,
    addItem: addCategoryToBackend,
    updateItem: updateCategoryBackend,
    deleteItem: deleteCategoryBackend,
  } = useToolData<Category>('product-categories', DEFAULT_CATEGORIES);

  // Local UI State
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'inventory' | 'analytics'>('products');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product>>({});
  const [newCategory, setNewCategory] = useState({ name: '' });

  // Prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      if (uiConfig.params.productName) {
        setEditingProduct((prev) => ({ ...prev, name: uiConfig.params!.productName }));
        setShowProductForm(true);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        searchTerm === '' ||
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.barcode.includes(searchTerm);
      const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
      const matchesStatus = filterStatus === 'all' || product.status === filterStatus;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, searchTerm, filterCategory, filterStatus]);

  // Low stock products
  const lowStockProducts = useMemo(() => {
    return products.filter((p) => p.quantity <= p.lowStockThreshold && p.status === 'active');
  }, [products]);

  // Analytics
  const analytics = useMemo(() => {
    const totalProducts = products.length;
    const activeProducts = products.filter((p) => p.status === 'active').length;
    const totalValue = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
    const totalCost = products.reduce((sum, p) => sum + (p.cost * p.quantity), 0);
    const averagePrice = totalProducts > 0 ? products.reduce((sum, p) => sum + p.price, 0) / totalProducts : 0;
    const featuredProducts = products.filter((p) => p.isFeatured).length;
    const outOfStock = products.filter((p) => p.quantity === 0).length;
    const categoryBreakdown = products.reduce((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalProducts,
      activeProducts,
      totalValue,
      totalCost,
      potentialProfit: totalValue - totalCost,
      averagePrice,
      featuredProducts,
      outOfStock,
      lowStock: lowStockProducts.length,
      categoryBreakdown,
    };
  }, [products, lowStockProducts]);

  // Save product
  const saveProduct = () => {
    if (!editingProduct.name || !editingProduct.price) {
      setValidationMessage('Please fill in required fields (Name, Price)');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const now = new Date().toISOString();

    if (editingProduct.id) {
      // Update existing
      updateProductBackend(editingProduct.id, {
        ...editingProduct,
        updatedAt: now,
      } as Product);
    } else {
      // Create new
      const newProduct: Product = {
        id: generateId(),
        name: editingProduct.name || '',
        description: editingProduct.description || '',
        sku: editingProduct.sku || generateSKU(editingProduct.category || 'GEN'),
        barcode: editingProduct.barcode || generateBarcode(),
        category: editingProduct.category || 'Uncategorized',
        subcategory: editingProduct.subcategory || '',
        brand: editingProduct.brand || '',
        price: editingProduct.price || 0,
        compareAtPrice: editingProduct.compareAtPrice,
        cost: editingProduct.cost || 0,
        quantity: editingProduct.quantity || 0,
        lowStockThreshold: editingProduct.lowStockThreshold || 10,
        weight: editingProduct.weight,
        weightUnit: editingProduct.weightUnit || 'lb',
        images: editingProduct.images || [],
        tags: editingProduct.tags || [],
        status: editingProduct.status || 'draft',
        variants: editingProduct.variants || [],
        isFeatured: editingProduct.isFeatured || false,
        taxable: editingProduct.taxable !== false,
        createdAt: now,
        updatedAt: now,
      };
      addProductToBackend(newProduct);
    }

    setShowProductForm(false);
    setEditingProduct({});
  };

  // Delete product
  const deleteProduct = async (productId: string) => {
    const confirmed = await confirm({
      title: 'Confirm Action',
      message: 'Are you sure you want to delete this product?',
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (!confirmed) return;
    deleteProductBackend(productId);
    if (selectedProduct?.id === productId) {
      setSelectedProduct(null);
    }
  };

  // Add category
  const addCategory = () => {
    if (!newCategory.name) {
      setValidationMessage('Please enter a category name');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const category: Category = {
      id: generateId(),
      name: newCategory.name,
      productCount: 0,
    };

    addCategoryToBackend(category);
    setShowCategoryForm(false);
    setNewCategory({ name: '' });
  };

  // Update product status
  const updateProductStatus = (productId: string, status: ProductStatus) => {
    updateProductBackend(productId, { status, updatedAt: new Date().toISOString() });
  };

  // Duplicate product
  const duplicateProduct = (product: Product) => {
    const duplicate: Product = {
      ...product,
      id: generateId(),
      name: `${product.name} (Copy)`,
      sku: generateSKU(product.category),
      barcode: generateBarcode(),
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addProductToBackend(duplicate);
  };

  const getStatusColor = (status: ProductStatus) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'archived':
        return 'bg-yellow-100 text-yellow-800';
      case 'out_of_stock':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.productCatalog.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
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
                  {t('tools.productCatalog.productCatalogTool', 'Product Catalog Tool')}
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.productCatalog.productCatalogManagementAndInventory', 'Product catalog management and inventory')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="product-catalog" toolName="Product Catalog" />

              <SyncStatus
                isSynced={productsSynced}
                isSaving={productsSaving}
                lastSaved={productsLastSaved}
                syncError={productsSyncError}
                onForceSync={forceProductsSync}
                theme={theme}
                showLabel={true}
                size="md"
              />
              <ExportDropdown
                onExportCSV={() => exportToCSV(products, PRODUCT_COLUMNS, 'product-catalog')}
                onExportExcel={() => exportToExcel(products, PRODUCT_COLUMNS, 'product-catalog')}
                onExportJSON={() => exportToJSON(products, 'product-catalog')}
                onExportPDF={() => exportToPDF(products, PRODUCT_COLUMNS, 'Product Catalog')}
                onCopy={() => copyUtil(products, PRODUCT_COLUMNS)}
                onPrint={() => printData(products, PRODUCT_COLUMNS, 'Product Catalog')}
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            {['products', 'categories', 'inventory', 'analytics'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as typeof activeTab)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-[#0D9488] text-white'
                    : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab === 'products' && <Package className="w-4 h-4 inline mr-2" />}
                {tab === 'categories' && <Layers className="w-4 h-4 inline mr-2" />}
                {tab === 'inventory' && <Archive className="w-4 h-4 inline mr-2" />}
                {tab === 'analytics' && <BarChart3 className="w-4 h-4 inline mr-2" />}
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4 flex-1">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t('tools.productCatalog.searchProductsByNameSku', 'Search products by name, SKU, or barcode...')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className={`px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="all">{t('tools.productCatalog.allCategories', 'All Categories')}</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className={`px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="all">{t('tools.productCatalog.allStatus', 'All Status')}</option>
                  <option value="active">{t('tools.productCatalog.active', 'Active')}</option>
                  <option value="draft">{t('tools.productCatalog.draft', 'Draft')}</option>
                  <option value="archived">{t('tools.productCatalog.archived', 'Archived')}</option>
                  <option value="out_of_stock">{t('tools.productCatalog.outOfStock', 'Out of Stock')}</option>
                </select>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <div className={`flex rounded-lg border ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-[#0D9488] text-white' : theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} rounded-l-lg`}
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-[#0D9488] text-white' : theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} rounded-r-lg`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
                <button
                  onClick={() => { setEditingProduct({}); setShowProductForm(true); }}
                  className="px-4 py-2 bg-[#0D9488] text-white rounded-lg font-medium hover:bg-[#0B7B6F]"
                >
                  <Plus className="w-4 h-4 inline mr-2" />
                  {t('tools.productCatalog.addProduct', 'Add Product')}
                </button>
              </div>
            </div>

            {/* Grid View */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className={`rounded-lg border overflow-hidden ${
                      theme === 'dark' ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className={`h-40 flex items-center justify-center ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-100'}`}>
                      {product.images.length > 0 ? (
                        <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                      ) : (
                        <ImageIcon className="w-12 h-12 text-gray-400" />
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className={`font-medium line-clamp-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {product.name}
                        </h3>
                        {product.isFeatured && (
                          <span className="text-yellow-500">
                            <TrendingUp className="w-4 h-4" />
                          </span>
                        )}
                      </div>
                      <p className={`text-sm mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        SKU: {product.sku}
                      </p>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[#0D9488] font-bold">{formatCurrency(product.price)}</span>
                        {product.compareAtPrice && (
                          <span className={`text-sm line-through ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                            {formatCurrency(product.compareAtPrice)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between mb-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                          {product.status.replace('_', ' ')}
                        </span>
                        <span className={`text-sm ${
                          product.quantity <= product.lowStockThreshold ? 'text-red-500' : theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          Stock: {product.quantity}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setEditingProduct(product); setShowProductForm(true); }}
                          className={`flex-1 py-2 rounded text-sm ${
                            theme === 'dark' ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <Edit2 className="w-3 h-3 inline mr-1" />
                          {t('tools.productCatalog.edit', 'Edit')}
                        </button>
                        <button
                          onClick={() => duplicateProduct(product)}
                          className={`p-2 rounded ${
                            theme === 'dark' ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteProduct(product.id)}
                          className="p-2 rounded bg-red-100 text-red-600 hover:bg-red-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                      <th className="text-left py-3 px-4">{t('tools.productCatalog.product', 'Product')}</th>
                      <th className="text-left py-3 px-4">{t('tools.productCatalog.sku', 'SKU')}</th>
                      <th className="text-left py-3 px-4">{t('tools.productCatalog.category', 'Category')}</th>
                      <th className="text-right py-3 px-4">{t('tools.productCatalog.price', 'Price')}</th>
                      <th className="text-right py-3 px-4">{t('tools.productCatalog.stock', 'Stock')}</th>
                      <th className="text-left py-3 px-4">{t('tools.productCatalog.status', 'Status')}</th>
                      <th className="text-left py-3 px-4">{t('tools.productCatalog.actions', 'Actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => (
                      <tr
                        key={product.id}
                        className={`border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded flex items-center justify-center ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-100'}`}>
                              {product.images.length > 0 ? (
                                <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover rounded" />
                              ) : (
                                <ImageIcon className="w-5 h-5 text-gray-400" />
                              )}
                            </div>
                            <div>
                              <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {product.name}
                              </p>
                              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                {product.brand}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {product.sku}
                        </td>
                        <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {product.category}
                        </td>
                        <td className={`py-3 px-4 text-right font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {formatCurrency(product.price)}
                        </td>
                        <td className={`py-3 px-4 text-right ${
                          product.quantity <= product.lowStockThreshold ? 'text-red-500' : theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {product.quantity}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                            {product.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => { setEditingProduct(product); setShowProductForm(true); }}
                              className="text-blue-500 hover:text-blue-600"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => duplicateProduct(product)}
                              className={theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-600'}
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteProduct(product.id)}
                              className="text-red-500 hover:text-red-600"
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

            {filteredProducts.length === 0 && (
              <p className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('tools.productCatalog.noProductsFound', 'No products found')}
              </p>
            )}
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.productCatalog.categories', 'Categories')}
              </h2>
              <button
                onClick={() => setShowCategoryForm(true)}
                className="px-4 py-2 bg-[#0D9488] text-white rounded-lg font-medium hover:bg-[#0B7B6F]"
              >
                <Plus className="w-4 h-4 inline mr-2" />
                {t('tools.productCatalog.addCategory', 'Add Category')}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => {
                const productCount = products.filter((p) => p.category === category.name).length;
                return (
                  <div
                    key={category.id}
                    className={`p-4 rounded-lg border ${
                      theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                        }`}>
                          <Layers className="w-5 h-5 text-[#0D9488]" />
                        </div>
                        <div>
                          <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {category.name}
                          </h3>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {productCount} products
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteCategoryBackend(category.id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            {/* Low Stock Alert */}
            {lowStockProducts.length > 0 && (
              <div className={`${theme === 'dark' ? 'bg-red-900/20' : 'bg-red-50'} rounded-lg p-4 border ${theme === 'dark' ? 'border-red-800' : 'border-red-200'}`}>
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <h3 className={`font-medium ${theme === 'dark' ? 'text-red-400' : 'text-red-700'}`}>
                    Low Stock Alert ({lowStockProducts.length} products)
                  </h3>
                </div>
                <div className="space-y-2">
                  {lowStockProducts.slice(0, 5).map((product) => (
                    <div key={product.id} className="flex items-center justify-between">
                      <span className={theme === 'dark' ? 'text-red-300' : 'text-red-600'}>{product.name}</span>
                      <span className={`font-medium ${theme === 'dark' ? 'text-red-400' : 'text-red-700'}`}>
                        {product.quantity} left (threshold: {product.lowStockThreshold})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
              <h2 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.productCatalog.inventoryOverview', 'Inventory Overview')}
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                      <th className="text-left py-3 px-4">{t('tools.productCatalog.product2', 'Product')}</th>
                      <th className="text-left py-3 px-4">{t('tools.productCatalog.sku2', 'SKU')}</th>
                      <th className="text-right py-3 px-4">{t('tools.productCatalog.inStock', 'In Stock')}</th>
                      <th className="text-right py-3 px-4">{t('tools.productCatalog.lowStockThreshold', 'Low Stock Threshold')}</th>
                      <th className="text-right py-3 px-4">{t('tools.productCatalog.inventoryValue', 'Inventory Value')}</th>
                      <th className="text-left py-3 px-4">{t('tools.productCatalog.status2', 'Status')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr
                        key={product.id}
                        className={`border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}
                      >
                        <td className={`py-3 px-4 font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {product.name}
                        </td>
                        <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {product.sku}
                        </td>
                        <td className={`py-3 px-4 text-right ${
                          product.quantity <= product.lowStockThreshold ? 'text-red-500 font-medium' : theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          {product.quantity}
                        </td>
                        <td className={`py-3 px-4 text-right ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {product.lowStockThreshold}
                        </td>
                        <td className={`py-3 px-4 text-right font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {formatCurrency(product.price * product.quantity)}
                        </td>
                        <td className="py-3 px-4">
                          {product.quantity === 0 ? (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              {t('tools.productCatalog.outOfStock3', 'Out of Stock')}
                            </span>
                          ) : product.quantity <= product.lowStockThreshold ? (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              {t('tools.productCatalog.lowStock', 'Low Stock')}
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {t('tools.productCatalog.inStock2', 'In Stock')}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.productCatalog.totalProducts', 'Total Products')}</p>
                  <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {analytics.totalProducts}
                  </p>
                </div>
              </div>
            </div>

            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.productCatalog.activeProducts', 'Active Products')}</p>
                  <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {analytics.activeProducts}
                  </p>
                </div>
              </div>
            </div>

            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.productCatalog.inventoryValue2', 'Inventory Value')}</p>
                  <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {formatCurrency(analytics.totalValue)}
                  </p>
                </div>
              </div>
            </div>

            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.productCatalog.lowStockItems', 'Low Stock Items')}</p>
                  <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {analytics.lowStock}
                  </p>
                </div>
              </div>
            </div>

            {/* Category Breakdown */}
            <div className={`md:col-span-2 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
              <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.productCatalog.productsByCategory', 'Products by Category')}
              </h3>
              <div className="space-y-3">
                {Object.entries(analytics.categoryBreakdown).map(([category, count]) => (
                  <div key={category}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{category}</span>
                      <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>{count} products</span>
                    </div>
                    <div className={`h-2 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <div
                        className="h-2 rounded-full bg-[#0D9488]"
                        style={{ width: `${(count / analytics.totalProducts) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Stats */}
            <div className={`md:col-span-2 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
              <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.productCatalog.financialOverview', 'Financial Overview')}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.productCatalog.totalInventoryCost', 'Total Inventory Cost')}</p>
                  <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {formatCurrency(analytics.totalCost)}
                  </p>
                </div>
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.productCatalog.potentialProfit', 'Potential Profit')}</p>
                  <p className="text-xl font-bold text-green-500">
                    {formatCurrency(analytics.potentialProfit)}
                  </p>
                </div>
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.productCatalog.averagePrice', 'Average Price')}</p>
                  <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {formatCurrency(analytics.averagePrice)}
                  </p>
                </div>
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.productCatalog.featuredProducts', 'Featured Products')}</p>
                  <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {analytics.featuredProducts}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Product Form Modal */}
        {showProductForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl p-6 w-full max-w-2xl m-4`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {editingProduct.id ? t('tools.productCatalog.editProduct', 'Edit Product') : t('tools.productCatalog.addNewProduct', 'Add New Product')}
                </h2>
                <button
                  onClick={() => { setShowProductForm(false); setEditingProduct({}); }}
                  className={theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-600'}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="max-h-[60vh] overflow-y-auto space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.productCatalog.productName', 'Product Name *')}
                    </label>
                    <input
                      type="text"
                      value={editingProduct.name || ''}
                      onChange={(e) => setEditingProduct((prev) => ({ ...prev, name: e.target.value }))}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>

                  <div className="col-span-2">
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.productCatalog.description', 'Description')}
                    </label>
                    <textarea
                      value={editingProduct.description || ''}
                      onChange={(e) => setEditingProduct((prev) => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.productCatalog.sku3', 'SKU')}
                    </label>
                    <input
                      type="text"
                      value={editingProduct.sku || ''}
                      onChange={(e) => setEditingProduct((prev) => ({ ...prev, sku: e.target.value }))}
                      placeholder={t('tools.productCatalog.autoGeneratedIfEmpty', 'Auto-generated if empty')}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.productCatalog.barcode', 'Barcode')}
                    </label>
                    <input
                      type="text"
                      value={editingProduct.barcode || ''}
                      onChange={(e) => setEditingProduct((prev) => ({ ...prev, barcode: e.target.value }))}
                      placeholder={t('tools.productCatalog.autoGeneratedIfEmpty2', 'Auto-generated if empty')}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.productCatalog.category2', 'Category')}
                    </label>
                    <select
                      value={editingProduct.category || ''}
                      onChange={(e) => setEditingProduct((prev) => ({ ...prev, category: e.target.value }))}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="">{t('tools.productCatalog.selectCategory', 'Select category')}</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.productCatalog.brand', 'Brand')}
                    </label>
                    <input
                      type="text"
                      value={editingProduct.brand || ''}
                      onChange={(e) => setEditingProduct((prev) => ({ ...prev, brand: e.target.value }))}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.productCatalog.price2', 'Price *')}
                    </label>
                    <input
                      type="number"
                      value={editingProduct.price || ''}
                      onChange={(e) => setEditingProduct((prev) => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                      step="0.01"
                      min="0"
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.productCatalog.compareAtPrice', 'Compare at Price')}
                    </label>
                    <input
                      type="number"
                      value={editingProduct.compareAtPrice || ''}
                      onChange={(e) => setEditingProduct((prev) => ({ ...prev, compareAtPrice: parseFloat(e.target.value) || undefined }))}
                      step="0.01"
                      min="0"
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.productCatalog.cost', 'Cost')}
                    </label>
                    <input
                      type="number"
                      value={editingProduct.cost || ''}
                      onChange={(e) => setEditingProduct((prev) => ({ ...prev, cost: parseFloat(e.target.value) || 0 }))}
                      step="0.01"
                      min="0"
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.productCatalog.quantity', 'Quantity')}
                    </label>
                    <input
                      type="number"
                      value={editingProduct.quantity || ''}
                      onChange={(e) => setEditingProduct((prev) => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                      min="0"
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.productCatalog.lowStockThreshold2', 'Low Stock Threshold')}
                    </label>
                    <input
                      type="number"
                      value={editingProduct.lowStockThreshold || 10}
                      onChange={(e) => setEditingProduct((prev) => ({ ...prev, lowStockThreshold: parseInt(e.target.value) || 10 }))}
                      min="0"
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.productCatalog.status3', 'Status')}
                    </label>
                    <select
                      value={editingProduct.status || 'draft'}
                      onChange={(e) => setEditingProduct((prev) => ({ ...prev, status: e.target.value as ProductStatus }))}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="draft">{t('tools.productCatalog.draft2', 'Draft')}</option>
                      <option value="active">{t('tools.productCatalog.active2', 'Active')}</option>
                      <option value="archived">{t('tools.productCatalog.archived2', 'Archived')}</option>
                      <option value="out_of_stock">{t('tools.productCatalog.outOfStock2', 'Out of Stock')}</option>
                    </select>
                  </div>

                  <div className="col-span-2 flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingProduct.isFeatured || false}
                        onChange={(e) => setEditingProduct((prev) => ({ ...prev, isFeatured: e.target.checked }))}
                        className="w-4 h-4 rounded border-gray-300 text-[#0D9488] focus:ring-[#0D9488]"
                      />
                      <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{t('tools.productCatalog.featuredProduct', 'Featured Product')}</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingProduct.taxable !== false}
                        onChange={(e) => setEditingProduct((prev) => ({ ...prev, taxable: e.target.checked }))}
                        className="w-4 h-4 rounded border-gray-300 text-[#0D9488] focus:ring-[#0D9488]"
                      />
                      <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{t('tools.productCatalog.taxable', 'Taxable')}</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => { setShowProductForm(false); setEditingProduct({}); }}
                  className={`flex-1 py-2 rounded-lg font-medium ${
                    theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {t('tools.productCatalog.cancel', 'Cancel')}
                </button>
                <button
                  onClick={saveProduct}
                  className="flex-1 py-2 bg-[#0D9488] text-white rounded-lg font-medium hover:bg-[#0B7B6F]"
                >
                  {editingProduct.id ? t('tools.productCatalog.updateProduct', 'Update Product') : t('tools.productCatalog.addProduct2', 'Add Product')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Category Modal */}
        {showCategoryForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl p-6 w-full max-w-md`}>
              <h2 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.productCatalog.addNewCategory', 'Add New Category')}
              </h2>

              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.productCatalog.categoryName', 'Category Name *')}
                </label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ name: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => { setShowCategoryForm(false); setNewCategory({ name: '' }); }}
                  className={`flex-1 py-2 rounded-lg font-medium ${
                    theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {t('tools.productCatalog.cancel2', 'Cancel')}
                </button>
                <button
                  onClick={addCategory}
                  className="flex-1 py-2 bg-[#0D9488] text-white rounded-lg font-medium hover:bg-[#0B7B6F]"
                >
                  {t('tools.productCatalog.addCategory2', 'Add Category')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    <ConfirmDialog />
    {validationMessage && (
      <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50">
        {validationMessage}
      </div>
    )}
    </>
  );
};

export default ProductCatalogTool;
