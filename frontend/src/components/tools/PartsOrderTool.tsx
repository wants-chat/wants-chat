'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Package,
  ShoppingCart,
  Truck,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Search,
  Filter,
  DollarSign,
  Calendar,
  MapPin,
  Building,
  Box,
  Boxes,
  FileText,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { useConfirmDialog } from '../ui/ConfirmDialog';
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

interface PartsOrderToolProps {
  uiConfig?: UIConfig;
}

import { useTheme } from '@/contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Types
type PartCategory = 'hvac' | 'plumbing' | 'electrical' | 'appliance' | 'general';
type OrderStatus = 'pending' | 'ordered' | 'shipped' | 'delivered' | 'cancelled' | 'backordered';
type Priority = 'urgent' | 'high' | 'normal' | 'low';

interface Part {
  id: string;
  partNumber: string;
  name: string;
  category: PartCategory;
  description: string;
  unitPrice: number;
  stockQuantity: number;
  reorderLevel: number;
  supplierId: string;
  location: string;
  createdAt: string;
}

interface Supplier {
  id: string;
  name: string;
  contactName: string;
  phone: string;
  email: string;
  address: string;
  website: string;
  leadTime: number; // days
  notes: string;
  createdAt: string;
}

interface OrderItem {
  partId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface Order {
  id: string;
  orderNumber: string;
  supplierId: string;
  items: OrderItem[];
  status: OrderStatus;
  priority: Priority;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  orderDate: string;
  expectedDelivery: string;
  actualDelivery: string;
  trackingNumber: string;
  notes: string;
  jobReference: string;
  createdAt: string;
}

// Constants
const PART_CATEGORIES: { category: PartCategory; label: string }[] = [
  { category: 'hvac', label: 'HVAC' },
  { category: 'plumbing', label: 'Plumbing' },
  { category: 'electrical', label: 'Electrical' },
  { category: 'appliance', label: 'Appliance' },
  { category: 'general', label: 'General' },
];

const ORDER_STATUSES: { status: OrderStatus; label: string }[] = [
  { status: 'pending', label: 'Pending' },
  { status: 'ordered', label: 'Ordered' },
  { status: 'shipped', label: 'Shipped' },
  { status: 'delivered', label: 'Delivered' },
  { status: 'cancelled', label: 'Cancelled' },
  { status: 'backordered', label: 'Backordered' },
];

const PRIORITIES: { priority: Priority; label: string }[] = [
  { priority: 'urgent', label: 'Urgent' },
  { priority: 'high', label: 'High' },
  { priority: 'normal', label: 'Normal' },
  { priority: 'low', label: 'Low' },
];

// Column configurations for exports
const ORDER_COLUMNS: ColumnConfig[] = [
  { key: 'orderNumber', header: 'Order #', type: 'string' },
  { key: 'supplierName', header: 'Supplier', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'priority', header: 'Priority', type: 'string' },
  { key: 'itemCount', header: 'Items', type: 'number' },
  { key: 'total', header: 'Total', type: 'currency' },
  { key: 'orderDate', header: 'Order Date', type: 'date' },
  { key: 'expectedDelivery', header: 'Expected Delivery', type: 'date' },
  { key: 'trackingNumber', header: 'Tracking', type: 'string' },
  { key: 'jobReference', header: 'Job Ref', type: 'string' },
];

const INVENTORY_COLUMNS: ColumnConfig[] = [
  { key: 'partNumber', header: 'Part #', type: 'string' },
  { key: 'name', header: 'Name', type: 'string' },
  { key: 'category', header: 'Category', type: 'string' },
  { key: 'stockQuantity', header: 'In Stock', type: 'number' },
  { key: 'reorderLevel', header: 'Reorder Level', type: 'number' },
  { key: 'unitPrice', header: 'Unit Price', type: 'currency' },
  { key: 'supplierName', header: 'Supplier', type: 'string' },
  { key: 'location', header: 'Location', type: 'string' },
];

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);
const generateOrderNumber = () => `PO-${Date.now().toString(36).toUpperCase()}`;

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Main Component
export const PartsOrderTool: React.FC<PartsOrderToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // useToolData hooks for backend sync
  const {
    data: parts,
    addItem: addPartToBackend,
    updateItem: updatePartBackend,
    deleteItem: deletePartBackend,
    isSynced: partsSynced,
    isSaving: partsSaving,
    lastSaved: partsLastSaved,
    forceSync: forcePartsSync,
  } = useToolData<Part>('parts-inventory', [], INVENTORY_COLUMNS);

  const {
    data: suppliers,
    addItem: addSupplierToBackend,
    updateItem: updateSupplierBackend,
    deleteItem: deleteSupplierBackend,
    isSynced: suppliersSynced,
    isSaving: suppliersSaving,
    lastSaved: suppliersLastSaved,
    forceSync: forceSuppliersSync,
  } = useToolData<Supplier>('parts-suppliers', [], []);

  const {
    data: orders,
    addItem: addOrderToBackend,
    updateItem: updateOrderBackend,
    deleteItem: deleteOrderBackend,
    isSynced: ordersSynced,
    isSaving: ordersSaving,
    lastSaved: ordersLastSaved,
    forceSync: forceOrdersSync,
  } = useToolData<Order>('parts-orders', [], ORDER_COLUMNS);

  // Local UI State
  const [activeTab, setActiveTab] = useState<'orders' | 'inventory' | 'suppliers' | 'cart'>('orders');
  const [showNewOrderForm, setShowNewOrderForm] = useState(false);
  const [showNewPartForm, setShowNewPartForm] = useState(false);
  const [showNewSupplierForm, setShowNewSupplierForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');

  // Shopping cart state
  const [cartItems, setCartItems] = useState<OrderItem[]>([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('');
  const [cartPriority, setCartPriority] = useState<Priority>('normal');
  const [cartJobReference, setCartJobReference] = useState('');
  const [cartNotes, setCartNotes] = useState('');

  // Form states
  const [newPart, setNewPart] = useState<Partial<Part>>({
    partNumber: '',
    name: '',
    category: 'hvac',
    description: '',
    unitPrice: 0,
    stockQuantity: 0,
    reorderLevel: 5,
    location: '',
  });

  const [newSupplier, setNewSupplier] = useState<Partial<Supplier>>({
    name: '',
    contactName: '',
    phone: '',
    email: '',
    address: '',
    website: '',
    leadTime: 3,
    notes: '',
  });

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const supplier = suppliers.find((s) => s.id === order.supplierId);
      const matchesSearch =
        searchTerm === '' ||
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.jobReference.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [orders, suppliers, searchTerm, filterStatus]);

  // Filtered parts
  const filteredParts = useMemo(() => {
    return parts.filter((part) => {
      const matchesSearch =
        searchTerm === '' ||
        part.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        part.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || part.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [parts, searchTerm, filterCategory]);

  // Low stock parts
  const lowStockParts = useMemo(() => {
    return parts.filter((p) => p.stockQuantity <= p.reorderLevel);
  }, [parts]);

  // Stats
  const stats = useMemo(() => {
    const pending = orders.filter((o) => o.status === 'pending' || o.status === 'ordered');
    const shipped = orders.filter((o) => o.status === 'shipped');
    const totalValue = orders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.total, 0);

    return {
      pendingOrders: pending.length,
      inTransit: shipped.length,
      lowStock: lowStockParts.length,
      totalValue,
    };
  }, [orders, lowStockParts]);

  // Cart calculations
  const cartTotals = useMemo(() => {
    const subtotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const tax = subtotal * 0.08; // 8% tax
    const shipping = subtotal > 500 ? 0 : 25;
    const total = subtotal + tax + shipping;
    return { subtotal, tax, shipping, total };
  }, [cartItems]);

  // Add to cart
  const addToCart = (partId: string, quantity: number = 1) => {
    const part = parts.find((p) => p.id === partId);
    if (!part) return;

    const existingIndex = cartItems.findIndex((item) => item.partId === partId);
    if (existingIndex >= 0) {
      const updated = [...cartItems];
      updated[existingIndex].quantity += quantity;
      updated[existingIndex].totalPrice = updated[existingIndex].quantity * updated[existingIndex].unitPrice;
      setCartItems(updated);
    } else {
      setCartItems([
        ...cartItems,
        {
          partId,
          quantity,
          unitPrice: part.unitPrice,
          totalPrice: quantity * part.unitPrice,
        },
      ]);
    }
  };

  // Remove from cart
  const removeFromCart = (partId: string) => {
    setCartItems(cartItems.filter((item) => item.partId !== partId));
  };

  // Update cart item quantity
  const updateCartQuantity = (partId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(partId);
      return;
    }
    const updated = cartItems.map((item) =>
      item.partId === partId
        ? { ...item, quantity, totalPrice: quantity * item.unitPrice }
        : item
    );
    setCartItems(updated);
  };

  // Place order
  const placeOrder = () => {
    if (!selectedSupplierId || cartItems.length === 0) {
      setValidationMessage('Please select a supplier and add items to cart');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const supplier = suppliers.find((s) => s.id === selectedSupplierId);
    const expectedDelivery = new Date();
    expectedDelivery.setDate(expectedDelivery.getDate() + (supplier?.leadTime || 5));

    const order: Order = {
      id: generateId(),
      orderNumber: generateOrderNumber(),
      supplierId: selectedSupplierId,
      items: [...cartItems],
      status: 'pending',
      priority: cartPriority,
      subtotal: cartTotals.subtotal,
      tax: cartTotals.tax,
      shipping: cartTotals.shipping,
      total: cartTotals.total,
      orderDate: new Date().toISOString(),
      expectedDelivery: expectedDelivery.toISOString(),
      actualDelivery: '',
      trackingNumber: '',
      notes: cartNotes,
      jobReference: cartJobReference,
      createdAt: new Date().toISOString(),
    };

    addOrderToBackend(order);
    setCartItems([]);
    setSelectedSupplierId('');
    setCartPriority('normal');
    setCartJobReference('');
    setCartNotes('');
    setActiveTab('orders');
  };

  // Update order status
  const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    const updates: Partial<Order> = { status: newStatus };
    if (newStatus === 'delivered') {
      updates.actualDelivery = new Date().toISOString();
      // Update inventory
      const order = orders.find((o) => o.id === orderId);
      if (order) {
        order.items.forEach((item) => {
          const part = parts.find((p) => p.id === item.partId);
          if (part) {
            updatePartBackend(part.id, {
              stockQuantity: part.stockQuantity + item.quantity,
            });
          }
        });
      }
    }
    updateOrderBackend(orderId, updates);
  };

  // Add new part
  const addPart = () => {
    if (!newPart.partNumber || !newPart.name) {
      setValidationMessage('Please fill in required fields');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const part: Part = {
      id: generateId(),
      partNumber: newPart.partNumber || '',
      name: newPart.name || '',
      category: newPart.category || 'general',
      description: newPart.description || '',
      unitPrice: newPart.unitPrice || 0,
      stockQuantity: newPart.stockQuantity || 0,
      reorderLevel: newPart.reorderLevel || 5,
      supplierId: newPart.supplierId || '',
      location: newPart.location || '',
      createdAt: new Date().toISOString(),
    };

    addPartToBackend(part);
    setShowNewPartForm(false);
    setNewPart({
      partNumber: '',
      name: '',
      category: 'hvac',
      description: '',
      unitPrice: 0,
      stockQuantity: 0,
      reorderLevel: 5,
      location: '',
    });
  };

  // Add new supplier
  const addSupplier = () => {
    if (!newSupplier.name || !newSupplier.phone) {
      setValidationMessage('Please fill in required fields');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const supplier: Supplier = {
      id: generateId(),
      name: newSupplier.name || '',
      contactName: newSupplier.contactName || '',
      phone: newSupplier.phone || '',
      email: newSupplier.email || '',
      address: newSupplier.address || '',
      website: newSupplier.website || '',
      leadTime: newSupplier.leadTime || 3,
      notes: newSupplier.notes || '',
      createdAt: new Date().toISOString(),
    };

    addSupplierToBackend(supplier);
    setShowNewSupplierForm(false);
    setNewSupplier({
      name: '',
      contactName: '',
      phone: '',
      email: '',
      address: '',
      website: '',
      leadTime: 3,
      notes: '',
    });
  };

  // Get status color
  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return theme === 'dark' ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-700';
      case 'ordered':
        return theme === 'dark' ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700';
      case 'shipped':
        return theme === 'dark' ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-700';
      case 'delivered':
        return theme === 'dark' ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700';
      case 'cancelled':
        return theme === 'dark' ? 'bg-gray-900/30 text-gray-400' : 'bg-gray-100 text-gray-700';
      case 'backordered':
        return theme === 'dark' ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700';
      default:
        return theme === 'dark' ? 'bg-gray-900/30 text-gray-400' : 'bg-gray-100 text-gray-700';
    }
  };

  // Get priority color
  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500 text-white';
      case 'high':
        return 'bg-orange-500 text-white';
      case 'normal':
        return 'bg-blue-500 text-white';
      case 'low':
        return 'bg-gray-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  // Export handlers
  const handleExport = async (format: string) => {
    const exportData = filteredOrders.map((order) => {
      const supplier = suppliers.find((s) => s.id === order.supplierId);
      return {
        ...order,
        supplierName: supplier?.name || 'Unknown',
        itemCount: order.items.length,
      };
    });

    switch (format) {
      case 'csv':
        exportToCSV(exportData, ORDER_COLUMNS, 'parts-orders');
        break;
      case 'excel':
        await exportToExcel(exportData, ORDER_COLUMNS, 'parts-orders');
        break;
      case 'json':
        exportToJSON(exportData, 'parts-orders');
        break;
      case 'pdf':
        await exportToPDF(exportData, ORDER_COLUMNS, 'Parts Orders Report');
        break;
      case 'copy':
        await copyUtil(exportData, ORDER_COLUMNS);
        break;
      case 'print':
        printData(exportData, ORDER_COLUMNS, 'Parts Orders Report');
        break;
    }
  };

  return (
    <div className={`min-h-screen p-6 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.partsOrder.partsOrderingTracking', 'Parts Ordering & Tracking')}
          </h1>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            {t('tools.partsOrder.orderPartsAndTrackInventory', 'Order parts and track inventory levels')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <WidgetEmbedButton toolSlug="parts-order" toolName="Parts Order" />

          <SyncStatus
            isSynced={ordersSynced && partsSynced && suppliersSynced}
            isSaving={ordersSaving || partsSaving || suppliersSaving}
            lastSaved={ordersLastSaved}
            onForceSync={() => {
              forceOrdersSync();
              forcePartsSync();
              forceSuppliersSync();
            }}
          />
          <ExportDropdown onExport={handleExport} />
          {cartItems.length > 0 && (
            <button
              onClick={() => setActiveTab('cart')}
              className="px-4 py-2 rounded-lg bg-[#0D9488] text-white hover:bg-[#0F766E] flex items-center gap-2 relative"
            >
              <ShoppingCart className="w-4 h-4" />
              Cart
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {cartItems.length}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Clock className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {stats.pendingOrders}
                </p>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.partsOrder.pendingOrders', 'Pending Orders')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Truck className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {stats.inTransit}
                </p>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.partsOrder.inTransit', 'In Transit')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/20">
                <AlertCircle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {stats.lowStock}
                </p>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.partsOrder.lowStock', 'Low Stock')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <DollarSign className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {formatCurrency(stats.totalValue)}
                </p>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.partsOrder.totalOrders', 'Total Orders')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { id: 'orders', label: 'Orders', icon: <FileText className="w-4 h-4" /> },
          { id: 'inventory', label: 'Inventory', icon: <Boxes className="w-4 h-4" /> },
          { id: 'suppliers', label: 'Suppliers', icon: <Building className="w-4 h-4" /> },
          { id: 'cart', label: `Cart (${cartItems.length})`, icon: <ShoppingCart className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
              activeTab === tab.id
                ? 'bg-[#0D9488] text-white'
                : theme === 'dark'
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {/* Filters */}
          <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4">
                <div className="relative flex-1 min-w-[200px]">
                  <Search
                    className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  />
                  <input
                    type="text"
                    placeholder={t('tools.partsOrder.searchOrders', 'Search orders...')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full pl-9 pr-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className={`px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                >
                  <option value="all">{t('tools.partsOrder.allStatuses', 'All Statuses')}</option>
                  {ORDER_STATUSES.map((s) => (
                    <option key={s.status} value={s.status}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Orders List */}
          <div className="space-y-3">
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => {
                const supplier = suppliers.find((s) => s.id === order.supplierId);
                return (
                  <Card
                    key={order.id}
                    className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
                  >
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            <Package className="w-5 h-5 text-[#0D9488]" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {order.orderNumber}
                              </h3>
                              <span className={`px-2 py-0.5 text-xs rounded ${getPriorityColor(order.priority)}`}>
                                {order.priority}
                              </span>
                              <span className={`px-2 py-0.5 text-xs rounded ${getStatusColor(order.status)}`}>
                                {ORDER_STATUSES.find((s) => s.status === order.status)?.label}
                              </span>
                            </div>
                            <p className={`text-sm mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                              {supplier?.name} - {order.items.length} item(s)
                            </p>
                            <div className="flex flex-wrap items-center gap-4 text-sm">
                              <span className={`flex items-center gap-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                <Calendar className="w-3 h-3" />
                                Ordered: {formatDate(order.orderDate)}
                              </span>
                              <span className={`flex items-center gap-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                <Truck className="w-3 h-3" />
                                Expected: {formatDate(order.expectedDelivery)}
                              </span>
                              {order.trackingNumber && (
                                <span className={`flex items-center gap-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                  <ExternalLink className="w-3 h-3" />
                                  {order.trackingNumber}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {formatCurrency(order.total)}
                            </p>
                            {order.jobReference && (
                              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                Job: {order.jobReference}
                              </p>
                            )}
                          </div>
                          {order.status !== 'delivered' && order.status !== 'cancelled' && (
                            <select
                              value={order.status}
                              onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                              className={`px-3 py-1.5 text-sm rounded-lg border ${
                                theme === 'dark'
                                  ? 'bg-gray-700 border-gray-600 text-white'
                                  : 'bg-white border-gray-300 text-gray-900'
                              } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                            >
                              {ORDER_STATUSES.map((s) => (
                                <option key={s.status} value={s.status}>
                                  {s.label}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
                <CardContent className="py-12 text-center">
                  <Package className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-300'}`} />
                  <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.partsOrder.noOrdersFoundAddParts', 'No orders found. Add parts to cart to create an order!')}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Inventory Tab */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex gap-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search
                  className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}
                />
                <input
                  type="text"
                  placeholder={t('tools.partsOrder.searchParts', 'Search parts...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-9 pr-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className={`px-4 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              >
                <option value="all">{t('tools.partsOrder.allCategories', 'All Categories')}</option>
                {PART_CATEGORIES.map((c) => (
                  <option key={c.category} value={c.category}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => setShowNewPartForm(true)}
              className="px-4 py-2 rounded-lg bg-[#0D9488] text-white hover:bg-[#0F766E] flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {t('tools.partsOrder.addPart', 'Add Part')}
            </button>
          </div>

          {/* Low Stock Alert */}
          {lowStockParts.length > 0 && (
            <Card className={theme === 'dark' ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-200'}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <span className={`font-medium ${theme === 'dark' ? 'text-red-400' : 'text-red-700'}`}>
                    Low Stock Alert ({lowStockParts.length} items)
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {lowStockParts.slice(0, 5).map((part) => (
                    <span
                      key={part.id}
                      className={`px-2 py-1 text-xs rounded ${
                        theme === 'dark' ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {part.name} ({part.stockQuantity})
                    </span>
                  ))}
                  {lowStockParts.length > 5 && (
                    <span className={`px-2 py-1 text-xs ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>
                      +{lowStockParts.length - 5} more
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Parts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredParts.map((part) => {
              const supplier = suppliers.find((s) => s.id === part.supplierId);
              const isLowStock = part.stockQuantity <= part.reorderLevel;
              return (
                <Card
                  key={part.id}
                  className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} ${
                    isLowStock ? 'ring-2 ring-red-500' : ''
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {part.partNumber}
                        </p>
                        <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {part.name}
                        </h3>
                      </div>
                      <span
                        className={`px-2 py-0.5 text-xs rounded ${
                          theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {PART_CATEGORIES.find((c) => c.category === part.category)?.label}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex justify-between">
                        <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>{t('tools.partsOrder.inStock', 'In Stock:')}</span>
                        <span
                          className={`font-medium ${
                            isLowStock
                              ? 'text-red-500'
                              : theme === 'dark'
                              ? 'text-white'
                              : 'text-gray-900'
                          }`}
                        >
                          {part.stockQuantity}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>{t('tools.partsOrder.unitPrice', 'Unit Price:')}</span>
                        <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                          {formatCurrency(part.unitPrice)}
                        </span>
                      </div>
                      {part.location && (
                        <div className="flex justify-between">
                          <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>{t('tools.partsOrder.location', 'Location:')}</span>
                          <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{part.location}</span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => addToCart(part.id)}
                      className="w-full py-2 rounded-lg bg-[#0D9488] text-white hover:bg-[#0F766E] flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      {t('tools.partsOrder.addToCart', 'Add to Cart')}
                    </button>
                  </CardContent>
                </Card>
              );
            })}
            {filteredParts.length === 0 && (
              <Card className={`col-span-full ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <CardContent className="py-12 text-center">
                  <Boxes className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-300'}`} />
                  <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.partsOrder.noPartsFoundAddYour', 'No parts found. Add your first part!')}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Suppliers Tab */}
      {activeTab === 'suppliers' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowNewSupplierForm(true)}
              className="px-4 py-2 rounded-lg bg-[#0D9488] text-white hover:bg-[#0F766E] flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {t('tools.partsOrder.addSupplier', 'Add Supplier')}
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suppliers.map((supplier) => (
              <Card
                key={supplier.id}
                className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
              >
                <CardContent className="p-4">
                  <h3 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {supplier.name}
                  </h3>
                  <div className="space-y-2 text-sm">
                    {supplier.contactName && (
                      <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                        Contact: {supplier.contactName}
                      </p>
                    )}
                    <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>{supplier.phone}</p>
                    <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>{supplier.email}</p>
                    <div className="flex justify-between pt-2 border-t border-gray-700">
                      <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>{t('tools.partsOrder.leadTime', 'Lead Time:')}</span>
                      <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{supplier.leadTime} days</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {suppliers.length === 0 && (
              <Card className={`col-span-full ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <CardContent className="py-12 text-center">
                  <Building className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-300'}`} />
                  <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.partsOrder.noSuppliersYetAddYour', 'No suppliers yet. Add your first supplier!')}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Cart Tab */}
      {activeTab === 'cart' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
              <CardHeader>
                <CardTitle className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                  Shopping Cart ({cartItems.length} items)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {cartItems.length > 0 ? (
                  <div className="space-y-4">
                    {cartItems.map((item) => {
                      const part = parts.find((p) => p.id === item.partId);
                      if (!part) return null;
                      return (
                        <div
                          key={item.partId}
                          className={`p-4 rounded-lg flex items-center justify-between ${
                            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                          }`}
                        >
                          <div>
                            <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {part.name}
                            </p>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              {part.partNumber} - {formatCurrency(item.unitPrice)} each
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateCartQuantity(item.partId, item.quantity - 1)}
                                className={`w-8 h-8 rounded flex items-center justify-center ${
                                  theme === 'dark' ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-200 hover:bg-gray-300'
                                }`}
                              >
                                -
                              </button>
                              <span className={`w-12 text-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateCartQuantity(item.partId, item.quantity + 1)}
                                className={`w-8 h-8 rounded flex items-center justify-center ${
                                  theme === 'dark' ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-200 hover:bg-gray-300'
                                }`}
                              >
                                +
                              </button>
                            </div>
                            <p className={`w-24 text-right font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {formatCurrency(item.totalPrice)}
                            </p>
                            <button
                              onClick={() => removeFromCart(item.partId)}
                              className="p-2 text-red-500 hover:bg-red-500/10 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <ShoppingCart className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-300'}`} />
                    <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {t('tools.partsOrder.yourCartIsEmptyBrowse', 'Your cart is empty. Browse inventory to add parts!')}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-1">
            <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
              <CardHeader>
                <CardTitle className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{t('tools.partsOrder.orderSummary', 'Order Summary')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.partsOrder.supplier', 'Supplier *')}
                    </label>
                    <select
                      value={selectedSupplierId}
                      onChange={(e) => setSelectedSupplierId(e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    >
                      <option value="">{t('tools.partsOrder.selectSupplier', 'Select Supplier')}</option>
                      {suppliers.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.partsOrder.priority', 'Priority')}
                    </label>
                    <select
                      value={cartPriority}
                      onChange={(e) => setCartPriority(e.target.value as Priority)}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    >
                      {PRIORITIES.map((p) => (
                        <option key={p.priority} value={p.priority}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.partsOrder.jobReference', 'Job Reference')}
                    </label>
                    <input
                      type="text"
                      value={cartJobReference}
                      onChange={(e) => setCartJobReference(e.target.value)}
                      placeholder={t('tools.partsOrder.eGSc12345', 'e.g., SC-12345')}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                  <div className={`border-t pt-4 space-y-2 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex justify-between">
                      <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>{t('tools.partsOrder.subtotal', 'Subtotal:')}</span>
                      <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                        {formatCurrency(cartTotals.subtotal)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>{t('tools.partsOrder.tax8', 'Tax (8%):')}</span>
                      <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                        {formatCurrency(cartTotals.tax)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>{t('tools.partsOrder.shipping', 'Shipping:')}</span>
                      <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                        {cartTotals.shipping === 0 ? 'FREE' : formatCurrency(cartTotals.shipping)}
                      </span>
                    </div>
                    <div className={`flex justify-between pt-2 border-t font-bold ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                      <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{t('tools.partsOrder.total', 'Total:')}</span>
                      <span className="text-[#0D9488]">{formatCurrency(cartTotals.total)}</span>
                    </div>
                  </div>
                  <button
                    onClick={placeOrder}
                    disabled={cartItems.length === 0 || !selectedSupplierId}
                    className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 ${
                      cartItems.length > 0 && selectedSupplierId
                        ? t('tools.partsOrder.bg0d9488TextWhiteHover', 'bg-[#0D9488] text-white hover:bg-[#0F766E]') : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    }`}
                  >
                    <CheckCircle className="w-5 h-5" />
                    {t('tools.partsOrder.placeOrder', 'Place Order')}
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* New Part Modal */}
      {showNewPartForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className={`w-full max-w-lg ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <CardHeader>
              <CardTitle className={`flex items-center justify-between ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                <span>{t('tools.partsOrder.addNewPart', 'Add New Part')}</span>
                <button onClick={() => setShowNewPartForm(false)}>
                  <X className="w-5 h-5" />
                </button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.partsOrder.partNumber', 'Part Number *')}
                    </label>
                    <input
                      type="text"
                      value={newPart.partNumber}
                      onChange={(e) => setNewPart({ ...newPart, partNumber: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.partsOrder.category', 'Category')}
                    </label>
                    <select
                      value={newPart.category}
                      onChange={(e) => setNewPart({ ...newPart, category: e.target.value as PartCategory })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    >
                      {PART_CATEGORIES.map((c) => (
                        <option key={c.category} value={c.category}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.partsOrder.name', 'Name *')}
                  </label>
                  <input
                    type="text"
                    value={newPart.name}
                    onChange={(e) => setNewPart({ ...newPart, name: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.partsOrder.unitPrice2', 'Unit Price')}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={newPart.unitPrice}
                      onChange={(e) => setNewPart({ ...newPart, unitPrice: parseFloat(e.target.value) || 0 })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.partsOrder.stockQty', 'Stock Qty')}
                    </label>
                    <input
                      type="number"
                      value={newPart.stockQuantity}
                      onChange={(e) => setNewPart({ ...newPart, stockQuantity: parseInt(e.target.value) || 0 })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.partsOrder.reorderLevel', 'Reorder Level')}
                    </label>
                    <input
                      type="number"
                      value={newPart.reorderLevel}
                      onChange={(e) => setNewPart({ ...newPart, reorderLevel: parseInt(e.target.value) || 0 })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.partsOrder.location2', 'Location')}
                  </label>
                  <input
                    type="text"
                    value={newPart.location}
                    onChange={(e) => setNewPart({ ...newPart, location: e.target.value })}
                    placeholder={t('tools.partsOrder.eGShelfA1', 'e.g., Shelf A-1')}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={() => setShowNewPartForm(false)}
                    className={`px-4 py-2 rounded-lg ${
                      theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {t('tools.partsOrder.cancel', 'Cancel')}
                  </button>
                  <button
                    onClick={addPart}
                    className="px-4 py-2 rounded-lg bg-[#0D9488] text-white hover:bg-[#0F766E]"
                  >
                    {t('tools.partsOrder.addPart2', 'Add Part')}
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* New Supplier Modal */}
      {showNewSupplierForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className={`w-full max-w-lg ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <CardHeader>
              <CardTitle className={`flex items-center justify-between ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                <span>{t('tools.partsOrder.addNewSupplier', 'Add New Supplier')}</span>
                <button onClick={() => setShowNewSupplierForm(false)}>
                  <X className="w-5 h-5" />
                </button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.partsOrder.companyName', 'Company Name *')}
                  </label>
                  <input
                    type="text"
                    value={newSupplier.name}
                    onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.partsOrder.contactName', 'Contact Name')}
                    </label>
                    <input
                      type="text"
                      value={newSupplier.contactName}
                      onChange={(e) => setNewSupplier({ ...newSupplier, contactName: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.partsOrder.phone', 'Phone *')}
                    </label>
                    <input
                      type="tel"
                      value={newSupplier.phone}
                      onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.partsOrder.email', 'Email')}
                  </label>
                  <input
                    type="email"
                    value={newSupplier.email}
                    onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.partsOrder.website', 'Website')}
                    </label>
                    <input
                      type="url"
                      value={newSupplier.website}
                      onChange={(e) => setNewSupplier({ ...newSupplier, website: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.partsOrder.leadTimeDays', 'Lead Time (days)')}
                    </label>
                    <input
                      type="number"
                      value={newSupplier.leadTime}
                      onChange={(e) => setNewSupplier({ ...newSupplier, leadTime: parseInt(e.target.value) || 3 })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={() => setShowNewSupplierForm(false)}
                    className={`px-4 py-2 rounded-lg ${
                      theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {t('tools.partsOrder.cancel2', 'Cancel')}
                  </button>
                  <button
                    onClick={addSupplier}
                    className="px-4 py-2 rounded-lg bg-[#0D9488] text-white hover:bg-[#0F766E]"
                  >
                    {t('tools.partsOrder.addSupplier2', 'Add Supplier')}
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Validation Toast */}
      {validationMessage && (
        <div className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg z-50 max-w-sm ${
          theme === 'dark'
            ? 'bg-red-900/90 text-red-100 border border-red-700'
            : 'bg-red-100 text-red-900 border border-red-300'
        }`}>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{validationMessage}</p>
          </div>
        </div>
      )}

      <ConfirmDialog />
    </div>
  );
};

export default PartsOrderTool;
