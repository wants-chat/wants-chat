'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Package,
  Plus,
  Trash2,
  Edit,
  X,
  Search,
  Filter,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  RefreshCw,
  BarChart3,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  Tag,
  Building,
  Phone,
  Mail,
  Calendar,
  History,
  Check,
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
  type ColumnConfig,
} from '../../lib/toolDataUtils';
import { useTheme } from '@/contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ProductInventorySalonToolProps {
  uiConfig?: UIConfig;
}

// Types
type ProductCategory = 'haircare' | 'skincare' | 'nailcare' | 'styling' | 'color' | 'tools' | 'supplies' | 'retail';

interface Product {
  id: string;
  sku: string;
  name: string;
  brand: string;
  category: ProductCategory;
  description: string;
  size: string;
  unit: string;
  costPrice: number;
  retailPrice: number;
  currentStock: number;
  minStock: number;
  maxStock: number;
  supplierId: string;
  location: string;
  isRetail: boolean;
  isActive: boolean;
  lastRestocked: string;
  createdAt: string;
  updatedAt: string;
}

interface Supplier {
  id: string;
  name: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  paymentTerms: string;
  leadTime: number; // days
  notes: string;
  isActive: boolean;
  createdAt: string;
}

interface StockTransaction {
  id: string;
  productId: string;
  type: 'restock' | 'usage' | 'sale' | 'adjustment' | 'return';
  quantity: number;
  unitCost?: number;
  notes: string;
  performedBy: string;
  createdAt: string;
}

interface PurchaseOrder {
  id: string;
  supplierId: string;
  items: { productId: string; quantity: number; unitCost: number }[];
  status: 'draft' | 'pending' | 'ordered' | 'received' | 'cancelled';
  totalAmount: number;
  expectedDate?: string;
  receivedDate?: string;
  notes: string;
  createdAt: string;
}

// Constants
const CATEGORIES: { id: ProductCategory; name: string; color: string }[] = [
  { id: 'haircare', name: 'Hair Care', color: 'purple' },
  { id: 'skincare', name: 'Skin Care', color: 'cyan' },
  { id: 'nailcare', name: 'Nail Care', color: 'pink' },
  { id: 'styling', name: 'Styling', color: 'indigo' },
  { id: 'color', name: 'Color', color: 'rose' },
  { id: 'tools', name: 'Tools', color: 'slate' },
  { id: 'supplies', name: 'Supplies', color: 'gray' },
  { id: 'retail', name: 'Retail', color: 'emerald' },
];

// Column configurations
const PRODUCT_COLUMNS: ColumnConfig[] = [
  { key: 'sku', header: 'SKU', type: 'string' },
  { key: 'name', header: 'Product Name', type: 'string' },
  { key: 'brand', header: 'Brand', type: 'string' },
  { key: 'category', header: 'Category', type: 'string' },
  { key: 'size', header: 'Size', type: 'string' },
  { key: 'costPrice', header: 'Cost Price', type: 'currency' },
  { key: 'retailPrice', header: 'Retail Price', type: 'currency' },
  { key: 'currentStock', header: 'Current Stock', type: 'number' },
  { key: 'minStock', header: 'Min Stock', type: 'number' },
  { key: 'location', header: 'Location', type: 'string' },
  { key: 'lastRestocked', header: 'Last Restocked', type: 'date' },
];

const SUPPLIER_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Supplier Name', type: 'string' },
  { key: 'contactName', header: 'Contact', type: 'string' },
  { key: 'email', header: 'Email', type: 'string' },
  { key: 'phone', header: 'Phone', type: 'string' },
  { key: 'paymentTerms', header: 'Payment Terms', type: 'string' },
  { key: 'leadTime', header: 'Lead Time (days)', type: 'number' },
];

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);
const generateSku = () => `SKU-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const getCategoryColor = (category: ProductCategory) => {
  const colorMap: Record<string, string> = {
    purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    cyan: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
    pink: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400',
    indigo: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
    rose: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400',
    slate: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300',
    gray: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    emerald: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  };
  const cat = CATEGORIES.find(c => c.id === category);
  return colorMap[cat?.color || 'gray'];
};

const getStockStatus = (product: Product) => {
  if (product.currentStock <= 0) return { status: 'out', color: 'text-red-600 bg-red-100 dark:bg-red-900/30' };
  if (product.currentStock <= product.minStock) return { status: 'low', color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30' };
  if (product.currentStock >= product.maxStock * 0.9) return { status: 'overstocked', color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' };
  return { status: 'ok', color: 'text-green-600 bg-green-100 dark:bg-green-900/30' };
};

// Sample data
const sampleSuppliers: Supplier[] = [
  {
    id: 'sup-1',
    name: 'Beauty Wholesale Co.',
    contactName: 'John Smith',
    email: 'orders@beautywholesale.com',
    phone: '(555) 111-2222',
    address: '123 Supply Street, Los Angeles, CA 90001',
    paymentTerms: 'Net 30',
    leadTime: 5,
    notes: 'Main supplier for professional haircare',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sup-2',
    name: 'Pro Salon Supplies',
    contactName: 'Sarah Wilson',
    email: 'sales@prosalonsupplies.com',
    phone: '(555) 333-4444',
    address: '456 Industry Ave, Chicago, IL 60601',
    paymentTerms: 'Net 15',
    leadTime: 3,
    notes: 'Best prices for color products',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

const sampleProducts: Product[] = [
  {
    id: generateId(),
    sku: 'SKU-HAR001',
    name: 'Professional Shampoo',
    brand: 'Redken',
    category: 'haircare',
    description: 'Color-safe shampoo for salon use',
    size: '1 Liter',
    unit: 'bottle',
    costPrice: 18.50,
    retailPrice: 28.00,
    currentStock: 12,
    minStock: 5,
    maxStock: 25,
    supplierId: 'sup-1',
    location: 'Shelf A1',
    isRetail: true,
    isActive: true,
    lastRestocked: '2024-01-10',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    sku: 'SKU-HAR002',
    name: 'Deep Conditioning Treatment',
    brand: 'Olaplex',
    category: 'haircare',
    description: 'Bond repair treatment',
    size: '500ml',
    unit: 'tube',
    costPrice: 32.00,
    retailPrice: 48.00,
    currentStock: 8,
    minStock: 4,
    maxStock: 15,
    supplierId: 'sup-1',
    location: 'Shelf A2',
    isRetail: true,
    isActive: true,
    lastRestocked: '2024-01-15',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    sku: 'SKU-COL001',
    name: 'Permanent Hair Color',
    brand: 'Wella',
    category: 'color',
    description: 'Professional permanent color - various shades',
    size: '60ml',
    unit: 'tube',
    costPrice: 8.50,
    retailPrice: 0,
    currentStock: 45,
    minStock: 20,
    maxStock: 100,
    supplierId: 'sup-2',
    location: 'Color Station',
    isRetail: false,
    isActive: true,
    lastRestocked: '2024-01-08',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    sku: 'SKU-COL002',
    name: 'Developer 20 Vol',
    brand: 'Wella',
    category: 'color',
    description: 'Cream developer for color',
    size: '1 Liter',
    unit: 'bottle',
    costPrice: 12.00,
    retailPrice: 0,
    currentStock: 3,
    minStock: 5,
    maxStock: 15,
    supplierId: 'sup-2',
    location: 'Color Station',
    isRetail: false,
    isActive: true,
    lastRestocked: '2024-01-05',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    sku: 'SKU-NAI001',
    name: 'Gel Polish Base Coat',
    brand: 'OPI',
    category: 'nailcare',
    description: 'Professional gel base coat',
    size: '15ml',
    unit: 'bottle',
    costPrice: 14.00,
    retailPrice: 22.00,
    currentStock: 6,
    minStock: 4,
    maxStock: 20,
    supplierId: 'sup-1',
    location: 'Nail Station',
    isRetail: true,
    isActive: true,
    lastRestocked: '2024-01-12',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    sku: 'SKU-SUP001',
    name: 'Disposable Capes',
    brand: 'SalonSupply',
    category: 'supplies',
    description: 'Single-use client capes',
    size: '100 pack',
    unit: 'pack',
    costPrice: 25.00,
    retailPrice: 0,
    currentStock: 0,
    minStock: 5,
    maxStock: 20,
    supplierId: 'sup-1',
    location: 'Storage Room',
    isRetail: false,
    isActive: true,
    lastRestocked: '2023-12-20',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const sampleTransactions: StockTransaction[] = [
  {
    id: generateId(),
    productId: sampleProducts[0].id,
    type: 'restock',
    quantity: 10,
    unitCost: 18.50,
    notes: 'Regular order',
    performedBy: 'Admin',
    createdAt: '2024-01-10T10:00:00Z',
  },
  {
    id: generateId(),
    productId: sampleProducts[0].id,
    type: 'sale',
    quantity: -2,
    notes: 'Retail sale',
    performedBy: 'Sarah',
    createdAt: '2024-01-18T14:30:00Z',
  },
];

// Main Component
export const ProductInventorySalonTool: React.FC<ProductInventorySalonToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  // useToolData hooks for backend sync
  const {
    data: products,
    addItem: addProduct,
    updateItem: updateProduct,
    deleteItem: deleteProduct,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<Product>('salon-products', sampleProducts, PRODUCT_COLUMNS);

  const {
    data: suppliers,
    addItem: addSupplier,
    updateItem: updateSupplier,
    deleteItem: deleteSupplier,
  } = useToolData<Supplier>('salon-suppliers', sampleSuppliers, SUPPLIER_COLUMNS);

  const {
    data: transactions,
    addItem: addTransaction,
  } = useToolData<StockTransaction>('salon-stock-transactions', sampleTransactions, []);

  // Local UI state
  const [activeTab, setActiveTab] = useState<'inventory' | 'suppliers' | 'transactions' | 'reorder'>('inventory');
  const [showProductForm, setShowProductForm] = useState(false);
  const [showSupplierForm, setShowSupplierForm] = useState(false);
  const [showAdjustmentForm, setShowAdjustmentForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStock, setFilterStock] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'stock' | 'value'>('name');

  // Product form state
  const [productForm, setProductForm] = useState({
    name: '',
    brand: '',
    category: 'haircare' as ProductCategory,
    description: '',
    size: '',
    unit: 'bottle',
    costPrice: 0,
    retailPrice: 0,
    currentStock: 0,
    minStock: 5,
    maxStock: 50,
    supplierId: '',
    location: '',
    isRetail: false,
  });

  // Supplier form state
  const [supplierForm, setSupplierForm] = useState({
    name: '',
    contactName: '',
    email: '',
    phone: '',
    address: '',
    paymentTerms: 'Net 30',
    leadTime: 5,
    notes: '',
  });

  // Adjustment form state
  const [adjustmentForm, setAdjustmentForm] = useState({
    type: 'adjustment' as StockTransaction['type'],
    quantity: 0,
    notes: '',
  });

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
      const stockStatus = getStockStatus(product);
      const matchesStock = filterStock === 'all' ||
        (filterStock === 'low' && stockStatus.status === 'low') ||
        (filterStock === 'out' && stockStatus.status === 'out') ||
        (filterStock === 'ok' && stockStatus.status === 'ok');
      return matchesSearch && matchesCategory && matchesStock && product.isActive;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'stock':
          return a.currentStock - b.currentStock;
        case 'value':
          return (b.currentStock * b.costPrice) - (a.currentStock * a.costPrice);
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  }, [products, searchTerm, filterCategory, filterStock, sortBy]);

  // Calculate stats
  const stats = useMemo(() => {
    const active = products.filter(p => p.isActive);
    const lowStock = active.filter(p => p.currentStock <= p.minStock && p.currentStock > 0);
    const outOfStock = active.filter(p => p.currentStock <= 0);
    const totalValue = active.reduce((sum, p) => sum + (p.currentStock * p.costPrice), 0);
    const retailValue = active.filter(p => p.isRetail).reduce((sum, p) => sum + (p.currentStock * p.retailPrice), 0);

    return {
      totalProducts: active.length,
      lowStock: lowStock.length,
      outOfStock: outOfStock.length,
      totalValue,
      retailValue,
    };
  }, [products]);

  // Get low stock items for reorder tab
  const reorderItems = useMemo(() => {
    return products.filter(p => p.isActive && p.currentStock <= p.minStock)
      .map(p => ({
        ...p,
        suggestedQty: p.maxStock - p.currentStock,
        supplier: suppliers.find(s => s.id === p.supplierId),
      }));
  }, [products, suppliers]);

  // Handle product form submission
  const handleProductSubmit = () => {
    const now = new Date().toISOString();
    const productData: Product = {
      id: editingProduct?.id || generateId(),
      sku: editingProduct?.sku || generateSku(),
      name: productForm.name,
      brand: productForm.brand,
      category: productForm.category,
      description: productForm.description,
      size: productForm.size,
      unit: productForm.unit,
      costPrice: productForm.costPrice,
      retailPrice: productForm.retailPrice,
      currentStock: productForm.currentStock,
      minStock: productForm.minStock,
      maxStock: productForm.maxStock,
      supplierId: productForm.supplierId,
      location: productForm.location,
      isRetail: productForm.isRetail,
      isActive: true,
      lastRestocked: editingProduct?.lastRestocked || now.split('T')[0],
      createdAt: editingProduct?.createdAt || now,
      updatedAt: now,
    };

    if (editingProduct) {
      updateProduct(productData);
    } else {
      addProduct(productData);
    }

    resetProductForm();
  };

  const resetProductForm = () => {
    setProductForm({
      name: '',
      brand: '',
      category: 'haircare',
      description: '',
      size: '',
      unit: 'bottle',
      costPrice: 0,
      retailPrice: 0,
      currentStock: 0,
      minStock: 5,
      maxStock: 50,
      supplierId: '',
      location: '',
      isRetail: false,
    });
    setShowProductForm(false);
    setEditingProduct(null);
  };

  const handleEditProduct = (product: Product) => {
    setProductForm({
      name: product.name,
      brand: product.brand,
      category: product.category,
      description: product.description,
      size: product.size,
      unit: product.unit,
      costPrice: product.costPrice,
      retailPrice: product.retailPrice,
      currentStock: product.currentStock,
      minStock: product.minStock,
      maxStock: product.maxStock,
      supplierId: product.supplierId,
      location: product.location,
      isRetail: product.isRetail,
    });
    setEditingProduct(product);
    setShowProductForm(true);
  };

  // Handle supplier form submission
  const handleSupplierSubmit = () => {
    const supplierData: Supplier = {
      id: editingSupplier?.id || generateId(),
      name: supplierForm.name,
      contactName: supplierForm.contactName,
      email: supplierForm.email,
      phone: supplierForm.phone,
      address: supplierForm.address,
      paymentTerms: supplierForm.paymentTerms,
      leadTime: supplierForm.leadTime,
      notes: supplierForm.notes,
      isActive: true,
      createdAt: editingSupplier?.createdAt || new Date().toISOString(),
    };

    if (editingSupplier) {
      updateSupplier(supplierData);
    } else {
      addSupplier(supplierData);
    }

    resetSupplierForm();
  };

  const resetSupplierForm = () => {
    setSupplierForm({
      name: '',
      contactName: '',
      email: '',
      phone: '',
      address: '',
      paymentTerms: 'Net 30',
      leadTime: 5,
      notes: '',
    });
    setShowSupplierForm(false);
    setEditingSupplier(null);
  };

  // Handle stock adjustment
  const handleAdjustmentSubmit = () => {
    if (!adjustingProduct) return;

    const transaction: StockTransaction = {
      id: generateId(),
      productId: adjustingProduct.id,
      type: adjustmentForm.type,
      quantity: adjustmentForm.type === 'usage' || adjustmentForm.type === 'sale'
        ? -Math.abs(adjustmentForm.quantity)
        : adjustmentForm.quantity,
      notes: adjustmentForm.notes,
      performedBy: 'Current User',
      createdAt: new Date().toISOString(),
    };

    addTransaction(transaction);

    // Update product stock
    const newStock = adjustingProduct.currentStock + transaction.quantity;
    updateProduct({
      ...adjustingProduct,
      currentStock: Math.max(0, newStock),
      lastRestocked: transaction.type === 'restock' ? new Date().toISOString().split('T')[0] : adjustingProduct.lastRestocked,
      updatedAt: new Date().toISOString(),
    });

    setAdjustmentForm({ type: 'adjustment', quantity: 0, notes: '' });
    setShowAdjustmentForm(false);
    setAdjustingProduct(null);
  };

  // Export handlers
  const handleExport = (format: 'csv' | 'excel' | 'json' | 'pdf') => {
    const exportData = products.map(p => ({
      ...p,
      stockValue: p.currentStock * p.costPrice,
    }));

    switch (format) {
      case 'csv':
        exportToCSV(exportData, PRODUCT_COLUMNS, 'salon-inventory');
        break;
      case 'excel':
        exportToExcel(exportData, PRODUCT_COLUMNS, 'salon-inventory');
        break;
      case 'json':
        exportToJSON(exportData, 'salon-inventory');
        break;
      case 'pdf':
        exportToPDF(exportData, PRODUCT_COLUMNS, 'Salon Product Inventory');
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Package className="w-6 h-6 text-purple-600" />
              {t('tools.productInventorySalon.productInventory', 'Product Inventory')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {t('tools.productInventorySalon.manageSalonProductsAndSupplies', 'Manage salon products and supplies')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <WidgetEmbedButton toolSlug="product-inventory-salon" toolName="Product Inventory Salon" />

            <SyncStatus
              isSynced={isSynced}
              isSaving={isSaving}
              lastSaved={lastSaved}
              error={syncError}
              onRetry={forceSync}
            />
            <ExportDropdown onExport={handleExport} />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Package className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('tools.productInventorySalon.totalProducts', 'Total Products')}</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.totalProducts}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <TrendingDown className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('tools.productInventorySalon.lowStock', 'Low Stock')}</p>
                  <p className="text-xl font-bold text-orange-600">{stats.lowStock}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('tools.productInventorySalon.outOfStock', 'Out of Stock')}</p>
                  <p className="text-xl font-bold text-red-600">{stats.outOfStock}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('tools.productInventorySalon.inventoryValue', 'Inventory Value')}</p>
                  <p className="text-xl font-bold text-green-600">{formatCurrency(stats.totalValue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                  <ShoppingCart className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('tools.productInventorySalon.retailValue', 'Retail Value')}</p>
                  <p className="text-xl font-bold text-emerald-600">{formatCurrency(stats.retailValue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          {[
            { id: 'inventory', label: 'Inventory', icon: Package },
            { id: 'suppliers', label: 'Suppliers', icon: Building },
            { id: 'transactions', label: 'Transactions', icon: History },
            { id: 'reorder', label: 'Reorder', icon: ShoppingCart, badge: reorderItems.length },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
          <div className="space-y-4">
            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder={t('tools.productInventorySalon.searchProducts', 'Search products...')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="all">{t('tools.productInventorySalon.allCategories', 'All Categories')}</option>
                    {CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  <select
                    value={filterStock}
                    onChange={(e) => setFilterStock(e.target.value)}
                    className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="all">{t('tools.productInventorySalon.allStockLevels', 'All Stock Levels')}</option>
                    <option value="ok">{t('tools.productInventorySalon.inStock', 'In Stock')}</option>
                    <option value="low">{t('tools.productInventorySalon.lowStock2', 'Low Stock')}</option>
                    <option value="out">{t('tools.productInventorySalon.outOfStock2', 'Out of Stock')}</option>
                  </select>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                    className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="name">{t('tools.productInventorySalon.sortByName', 'Sort by Name')}</option>
                    <option value="stock">{t('tools.productInventorySalon.sortByStockLevel', 'Sort by Stock Level')}</option>
                    <option value="value">{t('tools.productInventorySalon.sortByValue', 'Sort by Value')}</option>
                  </select>
                  <button
                    onClick={() => setShowProductForm(true)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    {t('tools.productInventorySalon.addProduct', 'Add Product')}
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map(product => {
                const stockInfo = getStockStatus(product);
                const supplier = suppliers.find(s => s.id === product.supplierId);
                return (
                  <Card key={product.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-xs text-gray-500 font-mono">{product.sku}</p>
                          <h3 className="font-medium text-gray-900 dark:text-white">{product.name}</h3>
                          <p className="text-sm text-gray-500">{product.brand}</p>
                        </div>
                        <span className={`px-2 py-0.5 text-xs rounded ${getCategoryColor(product.category)}`}>
                          {CATEGORIES.find(c => c.id === product.category)?.name}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-sm text-gray-500">{product.size}</p>
                          <p className="text-xs text-gray-400">{product.location}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900 dark:text-white">
                            {formatCurrency(product.costPrice)}
                          </p>
                          {product.isRetail && product.retailPrice > 0 && (
                            <p className="text-xs text-green-600">
                              Retail: {formatCurrency(product.retailPrice)}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-3">
                        <div className={`px-2 py-1 rounded text-sm font-medium ${stockInfo.color}`}>
                          Stock: {product.currentStock} / {product.maxStock}
                        </div>
                        <p className="text-xs text-gray-500">
                          Min: {product.minStock}
                        </p>
                      </div>

                      {product.currentStock <= product.minStock && (
                        <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded text-xs text-orange-600 mb-3 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          {product.currentStock <= 0 ? t('tools.productInventorySalon.outOfStock3', 'Out of stock!') : t('tools.productInventorySalon.lowStockReorderNeeded', 'Low stock - reorder needed')}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-3 border-t dark:border-gray-700">
                        <span className="text-xs text-gray-500">
                          {supplier?.name || 'No supplier'}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setAdjustingProduct(product);
                              setShowAdjustmentForm(true);
                            }}
                            className="p-1.5 text-gray-500 hover:text-purple-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                            title={t('tools.productInventorySalon.adjustStock', 'Adjust Stock')}
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteProduct(product.id)}
                            className="p-1.5 text-gray-500 hover:text-red-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Suppliers Tab */}
        {activeTab === 'suppliers' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                onClick={() => setShowSupplierForm(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {t('tools.productInventorySalon.addSupplier', 'Add Supplier')}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {suppliers.filter(s => s.isActive).map(supplier => (
                <Card key={supplier.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">{supplier.name}</h3>
                        <p className="text-sm text-gray-500">{supplier.contactName}</p>
                      </div>
                      <span className="px-2 py-0.5 text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded">
                        {t('tools.productInventorySalon.active', 'Active')}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Mail className="w-4 h-4" />
                        {supplier.email}
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Phone className="w-4 h-4" />
                        {supplier.phone}
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Calendar className="w-4 h-4" />
                        Lead time: {supplier.leadTime} days
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Tag className="w-4 h-4" />
                        {supplier.paymentTerms}
                      </div>
                    </div>
                    {supplier.notes && (
                      <p className="text-xs text-gray-500 mt-3 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        {supplier.notes}
                      </p>
                    )}
                    <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t dark:border-gray-700">
                      <button
                        onClick={() => {
                          setSupplierForm({
                            name: supplier.name,
                            contactName: supplier.contactName,
                            email: supplier.email,
                            phone: supplier.phone,
                            address: supplier.address,
                            paymentTerms: supplier.paymentTerms,
                            leadTime: supplier.leadTime,
                            notes: supplier.notes,
                          });
                          setEditingSupplier(supplier);
                          setShowSupplierForm(true);
                        }}
                        className="p-1.5 text-gray-500 hover:text-blue-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteSupplier(supplier.id)}
                        className="p-1.5 text-gray-500 hover:text-red-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <Card>
            <CardHeader>
              <CardTitle>{t('tools.productInventorySalon.stockTransactions', 'Stock Transactions')}</CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <p className="text-center text-gray-500 py-12">{t('tools.productInventorySalon.noTransactionsRecorded', 'No transactions recorded')}</p>
              ) : (
                <div className="space-y-3">
                  {transactions
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map(transaction => {
                      const product = products.find(p => p.id === transaction.productId);
                      return (
                        <div
                          key={transaction.id}
                          className="p-4 border rounded-lg dark:border-gray-700 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-lg ${
                              transaction.quantity > 0
                                ? 'bg-green-100 dark:bg-green-900/30'
                                : 'bg-red-100 dark:bg-red-900/30'
                            }`}>
                              {transaction.quantity > 0 ? (
                                <TrendingUp className={`w-5 h-5 ${transaction.quantity > 0 ? 'text-green-600' : 'text-red-600'}`} />
                              ) : (
                                <TrendingDown className="w-5 h-5 text-red-600" />
                              )}
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900 dark:text-white">
                                {product?.name || 'Unknown Product'}
                              </h3>
                              <p className="text-sm text-gray-500 capitalize">{transaction.type}</p>
                              {transaction.notes && (
                                <p className="text-xs text-gray-400">{transaction.notes}</p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-bold ${transaction.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {transaction.quantity > 0 ? '+' : ''}{transaction.quantity}
                            </p>
                            <p className="text-xs text-gray-500">{formatDate(transaction.createdAt)}</p>
                            <p className="text-xs text-gray-400">by {transaction.performedBy}</p>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Reorder Tab */}
        {activeTab === 'reorder' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                {t('tools.productInventorySalon.itemsNeedingReorder', 'Items Needing Reorder')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {reorderItems.length === 0 ? (
                <div className="text-center py-12">
                  <Check className="w-12 h-12 mx-auto text-green-500 mb-4" />
                  <p className="text-gray-500">{t('tools.productInventorySalon.allStockLevelsAreHealthy', 'All stock levels are healthy!')}</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b dark:border-gray-700">
                        <th className="text-left p-3 text-gray-600 dark:text-gray-400">{t('tools.productInventorySalon.product', 'Product')}</th>
                        <th className="text-center p-3 text-gray-600 dark:text-gray-400">{t('tools.productInventorySalon.current', 'Current')}</th>
                        <th className="text-center p-3 text-gray-600 dark:text-gray-400">{t('tools.productInventorySalon.min', 'Min')}</th>
                        <th className="text-center p-3 text-gray-600 dark:text-gray-400">{t('tools.productInventorySalon.suggestedQty', 'Suggested Qty')}</th>
                        <th className="text-left p-3 text-gray-600 dark:text-gray-400">{t('tools.productInventorySalon.supplier', 'Supplier')}</th>
                        <th className="text-right p-3 text-gray-600 dark:text-gray-400">{t('tools.productInventorySalon.estCost', 'Est. Cost')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reorderItems.map(item => (
                        <tr key={item.id} className="border-b dark:border-gray-700">
                          <td className="p-3">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                              <p className="text-xs text-gray-500">{item.brand} - {item.size}</p>
                            </div>
                          </td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-1 rounded text-sm ${
                              item.currentStock <= 0
                                ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                            }`}>
                              {item.currentStock}
                            </span>
                          </td>
                          <td className="p-3 text-center text-gray-600 dark:text-gray-400">
                            {item.minStock}
                          </td>
                          <td className="p-3 text-center font-medium text-purple-600">
                            {item.suggestedQty}
                          </td>
                          <td className="p-3 text-sm text-gray-600 dark:text-gray-400">
                            {item.supplier?.name || 'No supplier'}
                          </td>
                          <td className="p-3 text-right font-medium text-gray-900 dark:text-white">
                            {formatCurrency(item.suggestedQty * item.costPrice)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gray-50 dark:bg-gray-800">
                        <td colSpan={5} className="p-3 font-medium text-gray-900 dark:text-white">
                          {t('tools.productInventorySalon.totalReorderCost', 'Total Reorder Cost')}
                        </td>
                        <td className="p-3 text-right font-bold text-purple-600">
                          {formatCurrency(reorderItems.reduce((sum, item) => sum + (item.suggestedQty * item.costPrice), 0))}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Product Form Modal */}
        {showProductForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{editingProduct ? t('tools.productInventorySalon.editProduct', 'Edit Product') : t('tools.productInventorySalon.addProduct2', 'Add Product')}</span>
                  <button onClick={resetProductForm} className="text-gray-500 hover:text-gray-700">
                    <X className="w-5 h-5" />
                  </button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('tools.productInventorySalon.productName', 'Product Name *')}
                    </label>
                    <input
                      type="text"
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('tools.productInventorySalon.brand', 'Brand *')}
                    </label>
                    <input
                      type="text"
                      value={productForm.brand}
                      onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('tools.productInventorySalon.category', 'Category *')}
                    </label>
                    <select
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value as ProductCategory })}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('tools.productInventorySalon.supplier2', 'Supplier')}
                    </label>
                    <select
                      value={productForm.supplierId}
                      onChange={(e) => setProductForm({ ...productForm, supplierId: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="">{t('tools.productInventorySalon.selectSupplier', 'Select supplier')}</option>
                      {suppliers.filter(s => s.isActive).map(sup => (
                        <option key={sup.id} value={sup.id}>{sup.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('tools.productInventorySalon.size', 'Size')}
                    </label>
                    <input
                      type="text"
                      value={productForm.size}
                      onChange={(e) => setProductForm({ ...productForm, size: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder={t('tools.productInventorySalon.eG500ml1Liter', 'e.g., 500ml, 1 Liter')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('tools.productInventorySalon.location', 'Location')}
                    </label>
                    <input
                      type="text"
                      value={productForm.location}
                      onChange={(e) => setProductForm({ ...productForm, location: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder={t('tools.productInventorySalon.eGShelfA1', 'e.g., Shelf A1')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('tools.productInventorySalon.costPrice', 'Cost Price *')}
                    </label>
                    <input
                      type="number"
                      value={productForm.costPrice}
                      onChange={(e) => setProductForm({ ...productForm, costPrice: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('tools.productInventorySalon.retailPrice', 'Retail Price')}
                    </label>
                    <input
                      type="number"
                      value={productForm.retailPrice}
                      onChange={(e) => setProductForm({ ...productForm, retailPrice: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('tools.productInventorySalon.currentStock2', 'Current Stock')}
                    </label>
                    <input
                      type="number"
                      value={productForm.currentStock}
                      onChange={(e) => setProductForm({ ...productForm, currentStock: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('tools.productInventorySalon.minStockLevel', 'Min Stock Level')}
                    </label>
                    <input
                      type="number"
                      value={productForm.minStock}
                      onChange={(e) => setProductForm({ ...productForm, minStock: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('tools.productInventorySalon.maxStockLevel', 'Max Stock Level')}
                    </label>
                    <input
                      type="number"
                      value={productForm.maxStock}
                      onChange={(e) => setProductForm({ ...productForm, maxStock: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      min="0"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isRetail"
                      checked={productForm.isRetail}
                      onChange={(e) => setProductForm({ ...productForm, isRetail: e.target.checked })}
                      className="w-4 h-4 rounded"
                    />
                    <label htmlFor="isRetail" className="text-sm text-gray-700 dark:text-gray-300">
                      {t('tools.productInventorySalon.availableForRetailSale', 'Available for Retail Sale')}
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('tools.productInventorySalon.description', 'Description')}
                  </label>
                  <textarea
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    rows={2}
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={resetProductForm}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    {t('tools.productInventorySalon.cancel', 'Cancel')}
                  </button>
                  <button
                    onClick={handleProductSubmit}
                    disabled={!productForm.name || !productForm.brand}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                  >
                    {editingProduct ? t('tools.productInventorySalon.updateProduct', 'Update Product') : t('tools.productInventorySalon.addProduct3', 'Add Product')}
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Supplier Form Modal */}
        {showSupplierForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{editingSupplier ? t('tools.productInventorySalon.editSupplier', 'Edit Supplier') : t('tools.productInventorySalon.addSupplier2', 'Add Supplier')}</span>
                  <button onClick={resetSupplierForm} className="text-gray-500 hover:text-gray-700">
                    <X className="w-5 h-5" />
                  </button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('tools.productInventorySalon.supplierName', 'Supplier Name *')}
                  </label>
                  <input
                    type="text"
                    value={supplierForm.name}
                    onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('tools.productInventorySalon.contactName', 'Contact Name')}
                  </label>
                  <input
                    type="text"
                    value={supplierForm.contactName}
                    onChange={(e) => setSupplierForm({ ...supplierForm, contactName: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('tools.productInventorySalon.email', 'Email')}
                    </label>
                    <input
                      type="email"
                      value={supplierForm.email}
                      onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('tools.productInventorySalon.phone', 'Phone')}
                    </label>
                    <input
                      type="tel"
                      value={supplierForm.phone}
                      onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('tools.productInventorySalon.paymentTerms', 'Payment Terms')}
                    </label>
                    <select
                      value={supplierForm.paymentTerms}
                      onChange={(e) => setSupplierForm({ ...supplierForm, paymentTerms: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="COD">{t('tools.productInventorySalon.cod', 'COD')}</option>
                      <option value="Net 15">{t('tools.productInventorySalon.net15', 'Net 15')}</option>
                      <option value="Net 30">{t('tools.productInventorySalon.net30', 'Net 30')}</option>
                      <option value="Net 45">{t('tools.productInventorySalon.net45', 'Net 45')}</option>
                      <option value="Net 60">{t('tools.productInventorySalon.net60', 'Net 60')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('tools.productInventorySalon.leadTimeDays', 'Lead Time (days)')}
                    </label>
                    <input
                      type="number"
                      value={supplierForm.leadTime}
                      onChange={(e) => setSupplierForm({ ...supplierForm, leadTime: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      min="0"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('tools.productInventorySalon.notes', 'Notes')}
                  </label>
                  <textarea
                    value={supplierForm.notes}
                    onChange={(e) => setSupplierForm({ ...supplierForm, notes: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={resetSupplierForm}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    {t('tools.productInventorySalon.cancel2', 'Cancel')}
                  </button>
                  <button
                    onClick={handleSupplierSubmit}
                    disabled={!supplierForm.name}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                  >
                    {editingSupplier ? t('tools.productInventorySalon.updateSupplier', 'Update Supplier') : t('tools.productInventorySalon.addSupplier3', 'Add Supplier')}
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Stock Adjustment Modal */}
        {showAdjustmentForm && adjustingProduct && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Adjust Stock: {adjustingProduct.name}</span>
                  <button onClick={() => { setShowAdjustmentForm(false); setAdjustingProduct(null); }} className="text-gray-500 hover:text-gray-700">
                    <X className="w-5 h-5" />
                  </button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                  <p className="text-sm text-gray-500">{t('tools.productInventorySalon.currentStock', 'Current Stock')}</p>
                  <p className="text-2xl font-bold">{adjustingProduct.currentStock}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('tools.productInventorySalon.adjustmentType', 'Adjustment Type *')}
                  </label>
                  <select
                    value={adjustmentForm.type}
                    onChange={(e) => setAdjustmentForm({ ...adjustmentForm, type: e.target.value as StockTransaction['type'] })}
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="restock">{t('tools.productInventorySalon.restock', 'Restock (+)')}</option>
                    <option value="usage">{t('tools.productInventorySalon.usage', 'Usage (-)')}</option>
                    <option value="sale">{t('tools.productInventorySalon.sale', 'Sale (-)')}</option>
                    <option value="adjustment">{t('tools.productInventorySalon.adjustment', 'Adjustment (+/-)')}</option>
                    <option value="return">{t('tools.productInventorySalon.return', 'Return (+)')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('tools.productInventorySalon.quantity', 'Quantity *')}
                  </label>
                  <input
                    type="number"
                    value={adjustmentForm.quantity}
                    onChange={(e) => setAdjustmentForm({ ...adjustmentForm, quantity: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('tools.productInventorySalon.notes2', 'Notes')}
                  </label>
                  <input
                    type="text"
                    value={adjustmentForm.notes}
                    onChange={(e) => setAdjustmentForm({ ...adjustmentForm, notes: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder={t('tools.productInventorySalon.reasonForAdjustment', 'Reason for adjustment')}
                  />
                </div>
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-center">
                  <p className="text-sm text-gray-500">{t('tools.productInventorySalon.newStockLevel', 'New Stock Level')}</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {Math.max(0, adjustingProduct.currentStock + (
                      adjustmentForm.type === 'usage' || adjustmentForm.type === 'sale'
                        ? -Math.abs(adjustmentForm.quantity)
                        : adjustmentForm.quantity
                    ))}
                  </p>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={() => { setShowAdjustmentForm(false); setAdjustingProduct(null); }}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    {t('tools.productInventorySalon.cancel3', 'Cancel')}
                  </button>
                  <button
                    onClick={handleAdjustmentSubmit}
                    disabled={adjustmentForm.quantity === 0}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                  >
                    {t('tools.productInventorySalon.applyAdjustment', 'Apply Adjustment')}
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

export default ProductInventorySalonTool;
