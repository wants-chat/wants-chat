'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  Printer,
  Package,
  DollarSign,
  Calendar,
  User,
  Plus,
  Trash2,
  Edit2,
  Search,
  Filter,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  Image,
  Mail,
  Phone,
  MapPin,
  FileText,
  Sparkles,
  ShoppingCart,
  CreditCard,
  Download,
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

interface PrintOrderToolProps {
  uiConfig?: UIConfig;
}

// Types
type OrderStatus = 'pending' | 'processing' | 'printing' | 'quality-check' | 'shipped' | 'delivered' | 'cancelled';
type PrintSize = '4x6' | '5x7' | '8x10' | '11x14' | '16x20' | '20x30' | '24x36' | 'custom';
type PrintType = 'photo' | 'canvas' | 'metal' | 'acrylic' | 'poster' | 'framed' | 'album' | 'card';
type PrintFinish = 'glossy' | 'matte' | 'luster' | 'metallic' | 'satin';

interface PrintItem {
  id: string;
  photoId: string;
  photoName: string;
  printType: PrintType;
  size: PrintSize;
  customSize?: { width: number; height: number };
  finish: PrintFinish;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes: string;
}

interface PrintOrder {
  id: string;
  orderNumber: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  shippingZip: string;
  items: PrintItem[];
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  discount: number;
  total: number;
  status: OrderStatus;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  paymentMethod: string;
  rushOrder: boolean;
  rushFee: number;
  notes: string;
  trackingNumber: string;
  estimatedDelivery: string | null;
  orderedAt: string;
  shippedAt: string | null;
  deliveredAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// Constants
const PRINT_SIZES: { value: PrintSize; label: string }[] = [
  { value: '4x6', label: '4x6"' },
  { value: '5x7', label: '5x7"' },
  { value: '8x10', label: '8x10"' },
  { value: '11x14', label: '11x14"' },
  { value: '16x20', label: '16x20"' },
  { value: '20x30', label: '20x30"' },
  { value: '24x36', label: '24x36"' },
  { value: 'custom', label: 'Custom Size' },
];

const PRINT_TYPES: { value: PrintType; label: string; basePrice: number }[] = [
  { value: 'photo', label: 'Photo Print', basePrice: 5 },
  { value: 'canvas', label: 'Canvas', basePrice: 75 },
  { value: 'metal', label: 'Metal Print', basePrice: 100 },
  { value: 'acrylic', label: 'Acrylic', basePrice: 125 },
  { value: 'poster', label: 'Poster', basePrice: 15 },
  { value: 'framed', label: 'Framed Print', basePrice: 125 },
  { value: 'album', label: 'Album', basePrice: 200 },
  { value: 'card', label: 'Cards (set)', basePrice: 25 },
];

const FINISHES: { value: PrintFinish; label: string }[] = [
  { value: 'glossy', label: 'Glossy' },
  { value: 'matte', label: 'Matte' },
  { value: 'luster', label: 'Luster' },
  { value: 'metallic', label: 'Metallic' },
  { value: 'satin', label: 'Satin' },
];

const STATUS_COLORS: Record<OrderStatus, { bg: string; text: string }> = {
  pending: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-300' },
  processing: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300' },
  printing: { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-700 dark:text-indigo-300' },
  'quality-check': { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300' },
  shipped: { bg: 'bg-cyan-100 dark:bg-cyan-900/30', text: 'text-cyan-700 dark:text-cyan-300' },
  delivered: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300' },
  cancelled: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300' },
};

// Column configurations for exports
const ORDER_COLUMNS: ColumnConfig[] = [
  { key: 'orderNumber', header: 'Order #', type: 'string' },
  { key: 'clientName', header: 'Client', type: 'string' },
  { key: 'clientEmail', header: 'Email', type: 'string' },
  { key: 'total', header: 'Total', type: 'currency' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'paymentStatus', header: 'Payment', type: 'string' },
  { key: 'rushOrder', header: 'Rush', type: 'string' },
  { key: 'orderedAt', header: 'Order Date', type: 'date' },
  { key: 'trackingNumber', header: 'Tracking', type: 'string' },
];

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);

const generateOrderNumber = () => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `PRT-${year}${month}-${random}`;
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const getSizeMultiplier = (size: PrintSize): number => {
  const multipliers: Record<PrintSize, number> = {
    '4x6': 1,
    '5x7': 1.5,
    '8x10': 2.5,
    '11x14': 4,
    '16x20': 6,
    '20x30': 10,
    '24x36': 15,
    'custom': 5,
  };
  return multipliers[size];
};

// Main Component
export const PrintOrderTool: React.FC<PrintOrderToolProps> = ({ uiConfig }) => {
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // useToolData hooks for backend sync
  const {
    data: orders,
    addItem: addOrder,
    updateItem: updateOrder,
    deleteItem: deleteOrder,
    isSynced: ordersSynced,
    isSaving: ordersSaving,
    lastSaved: ordersLastSaved,
    syncError: ordersSyncError,
    forceSync: forceOrdersSync,
  } = useToolData<PrintOrder>('print-orders', [], ORDER_COLUMNS);

  // Local UI State
  const [activeTab, setActiveTab] = useState<'orders' | 'create' | 'pricing'>('orders');
  const [selectedOrder, setSelectedOrder] = useState<PrintOrder | null>(null);
  const [editingOrder, setEditingOrder] = useState<PrintOrder | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // New order form state
  const [newOrder, setNewOrder] = useState<Partial<PrintOrder>>({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    shippingAddress: '',
    shippingCity: '',
    shippingState: '',
    shippingZip: '',
    items: [],
    subtotal: 0,
    shippingCost: 0,
    taxAmount: 0,
    discount: 0,
    total: 0,
    status: 'pending',
    paymentStatus: 'pending',
    paymentMethod: '',
    rushOrder: false,
    rushFee: 0,
    notes: '',
    trackingNumber: '',
    estimatedDelivery: null,
  });

  // Current item being added
  const [currentItem, setCurrentItem] = useState<Partial<PrintItem>>({
    photoName: '',
    printType: 'photo',
    size: '8x10',
    finish: 'luster',
    quantity: 1,
    notes: '',
  });

  // Prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params;
      if (params.clientName || params.photoName) {
        setNewOrder({
          ...newOrder,
          clientName: params.clientName || '',
          clientEmail: params.clientEmail || '',
        });
        if (params.photoName) {
          setCurrentItem({
            ...currentItem,
            photoName: params.photoName,
            printType: params.printType || 'photo',
            size: params.size || '8x10',
          });
        }
        setActiveTab('create');
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Calculate item price
  const calculateItemPrice = (item: Partial<PrintItem>): number => {
    const printType = PRINT_TYPES.find(t => t.value === item.printType);
    const basePrice = printType?.basePrice || 5;
    const sizeMultiplier = getSizeMultiplier(item.size as PrintSize || '8x10');
    const quantity = item.quantity || 1;
    return basePrice * sizeMultiplier * quantity;
  };

  // Recalculate totals
  const recalculateTotals = (items: PrintItem[], rushOrder: boolean = false) => {
    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const rushFee = rushOrder ? subtotal * 0.25 : 0;
    const shippingCost = subtotal > 100 ? 0 : 9.95;
    const taxAmount = subtotal * 0.08; // 8% tax
    const total = subtotal + rushFee + shippingCost + taxAmount - (newOrder.discount || 0);

    setNewOrder(prev => ({
      ...prev,
      subtotal,
      rushFee,
      shippingCost,
      taxAmount,
      total,
    }));
  };

  // Add item to order
  const addItemToOrder = () => {
    if (!currentItem.photoName) {
      setValidationMessage('Please enter a photo name');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const totalPrice = calculateItemPrice(currentItem);
    const item: PrintItem = {
      id: generateId(),
      photoId: generateId(),
      photoName: currentItem.photoName || '',
      printType: currentItem.printType as PrintType || 'photo',
      size: currentItem.size as PrintSize || '8x10',
      finish: currentItem.finish as PrintFinish || 'luster',
      quantity: currentItem.quantity || 1,
      unitPrice: totalPrice / (currentItem.quantity || 1),
      totalPrice,
      notes: currentItem.notes || '',
    };

    const updatedItems = [...(newOrder.items || []), item];
    setNewOrder(prev => ({ ...prev, items: updatedItems }));
    recalculateTotals(updatedItems, newOrder.rushOrder);

    // Reset current item
    setCurrentItem({
      photoName: '',
      printType: 'photo',
      size: '8x10',
      finish: 'luster',
      quantity: 1,
      notes: '',
    });
  };

  // Remove item from order
  const removeItemFromOrder = (itemId: string) => {
    const updatedItems = (newOrder.items || []).filter(item => item.id !== itemId);
    setNewOrder(prev => ({ ...prev, items: updatedItems }));
    recalculateTotals(updatedItems, newOrder.rushOrder);
  };

  // Submit order
  const handleSubmitOrder = () => {
    if (!newOrder.clientName || !newOrder.clientEmail) {
      setValidationMessage('Please enter client name and email');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    if (!newOrder.items || newOrder.items.length === 0) {
      setValidationMessage('Please add at least one item to the order');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const order: PrintOrder = {
      id: generateId(),
      orderNumber: generateOrderNumber(),
      clientId: generateId(),
      clientName: newOrder.clientName || '',
      clientEmail: newOrder.clientEmail || '',
      clientPhone: newOrder.clientPhone || '',
      shippingAddress: newOrder.shippingAddress || '',
      shippingCity: newOrder.shippingCity || '',
      shippingState: newOrder.shippingState || '',
      shippingZip: newOrder.shippingZip || '',
      items: newOrder.items || [],
      subtotal: newOrder.subtotal || 0,
      shippingCost: newOrder.shippingCost || 0,
      taxAmount: newOrder.taxAmount || 0,
      discount: newOrder.discount || 0,
      total: newOrder.total || 0,
      status: 'pending',
      paymentStatus: 'pending',
      paymentMethod: newOrder.paymentMethod || '',
      rushOrder: newOrder.rushOrder || false,
      rushFee: newOrder.rushFee || 0,
      notes: newOrder.notes || '',
      trackingNumber: '',
      estimatedDelivery: null,
      orderedAt: new Date().toISOString(),
      shippedAt: null,
      deliveredAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addOrder(order);
    resetOrderForm();
    setActiveTab('orders');
  };

  // Update order status
  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    const updates: Partial<PrintOrder> = {
      status,
      updatedAt: new Date().toISOString(),
    };

    if (status === 'shipped') {
      updates.shippedAt = new Date().toISOString();
    } else if (status === 'delivered') {
      updates.deliveredAt = new Date().toISOString();
    }

    updateOrder(orderId, updates);
  };

  // Reset form
  const resetOrderForm = () => {
    setNewOrder({
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      shippingAddress: '',
      shippingCity: '',
      shippingState: '',
      shippingZip: '',
      items: [],
      subtotal: 0,
      shippingCost: 0,
      taxAmount: 0,
      discount: 0,
      total: 0,
      status: 'pending',
      paymentStatus: 'pending',
      paymentMethod: '',
      rushOrder: false,
      rushFee: 0,
      notes: '',
      trackingNumber: '',
      estimatedDelivery: null,
    });
  };

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = searchTerm === '' ||
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.clientEmail.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, filterStatus]);

  // Stats
  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = orders.filter(o => {
      const orderDate = new Date(o.orderedAt);
      return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
    });

    return {
      totalOrders: orders.length,
      pendingOrders: orders.filter(o => o.status === 'pending' || o.status === 'processing').length,
      inProduction: orders.filter(o => o.status === 'printing' || o.status === 'quality-check').length,
      shipped: orders.filter(o => o.status === 'shipped').length,
      thisMonthRevenue: thisMonth.reduce((sum, o) => sum + o.total, 0),
      unpaidOrders: orders.filter(o => o.paymentStatus === 'pending').length,
    };
  }, [orders]);

  return (
    <>
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.printOrder.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <Printer className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.printOrder.printOrderManager', 'Print Order Manager')}
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.printOrder.managePhotoPrintOrdersAnd', 'Manage photo print orders and fulfillment')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="print-order" toolName="Print Order" />

              <SyncStatus
                isSynced={ordersSynced}
                isSaving={ordersSaving}
                lastSaved={ordersLastSaved}
                syncError={ordersSyncError}
                onForceSync={forceOrdersSync}
                theme={theme}
                showLabel={true}
                size="md"
              />
              <ExportDropdown
                onExportCSV={() => exportToCSV(filteredOrders, ORDER_COLUMNS, 'print-orders')}
                onExportExcel={() => exportToExcel(filteredOrders, ORDER_COLUMNS, 'print-orders')}
                onExportJSON={() => exportToJSON(filteredOrders, 'print-orders')}
                onExportPDF={() => exportToPDF(filteredOrders, ORDER_COLUMNS, 'Print Orders Report', 'print-orders')}
                onCopy={() => copyUtil(filteredOrders, ORDER_COLUMNS)}
                onPrint={() => printData(filteredOrders, ORDER_COLUMNS, 'Print Orders Report')}
                theme={theme}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.printOrder.totalOrders', 'Total Orders')}</p>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stats.totalOrders}</p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.printOrder.pending', 'Pending')}</p>
              <p className={`text-2xl font-bold text-yellow-500`}>{stats.pendingOrders}</p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.printOrder.inProduction', 'In Production')}</p>
              <p className={`text-2xl font-bold text-blue-500`}>{stats.inProduction}</p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.printOrder.shipped', 'Shipped')}</p>
              <p className={`text-2xl font-bold text-cyan-500`}>{stats.shipped}</p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.printOrder.monthRevenue', 'Month Revenue')}</p>
              <p className={`text-2xl font-bold text-green-500`}>{formatCurrency(stats.thisMonthRevenue)}</p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.printOrder.unpaid', 'Unpaid')}</p>
              <p className={`text-2xl font-bold text-red-500`}>{stats.unpaidOrders}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg mb-6`}>
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {['orders', 'create', 'pricing'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as typeof activeTab)}
                className={`flex-1 px-4 py-3 text-sm font-medium capitalize ${
                  activeTab === tab
                    ? 'border-b-2 border-[#0D9488] text-[#0D9488]'
                    : theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab === 'create' ? 'Create Order' : tab}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div>
                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <input
                    type="text"
                    placeholder={t('tools.printOrder.searchOrders', 'Search orders...')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`flex-1 px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className={`px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  >
                    <option value="all">{t('tools.printOrder.allStatus', 'All Status')}</option>
                    <option value="pending">{t('tools.printOrder.pending2', 'Pending')}</option>
                    <option value="processing">{t('tools.printOrder.processing', 'Processing')}</option>
                    <option value="printing">{t('tools.printOrder.printing', 'Printing')}</option>
                    <option value="quality-check">{t('tools.printOrder.qualityCheck', 'Quality Check')}</option>
                    <option value="shipped">{t('tools.printOrder.shipped2', 'Shipped')}</option>
                    <option value="delivered">{t('tools.printOrder.delivered', 'Delivered')}</option>
                    <option value="cancelled">{t('tools.printOrder.cancelled', 'Cancelled')}</option>
                  </select>
                </div>

                {/* Orders List */}
                <div className="space-y-4">
                  {filteredOrders.length === 0 ? (
                    <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>{t('tools.printOrder.noOrdersFoundCreateYour', 'No orders found. Create your first print order!')}</p>
                    </div>
                  ) : (
                    filteredOrders.map((order) => (
                      <div
                        key={order.id}
                        className={`p-4 rounded-lg border ${
                          theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-lg ${STATUS_COLORS[order.status].bg}`}>
                              <Package className={`w-5 h-5 ${STATUS_COLORS[order.status].text}`} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                  {order.orderNumber}
                                </h3>
                                {order.rushOrder && (
                                  <span className="px-2 py-0.5 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 rounded text-xs">
                                    {t('tools.printOrder.rush', 'RUSH')}
                                  </span>
                                )}
                              </div>
                              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                {order.clientName} - {order.items.length} items
                              </p>
                              <div className="flex items-center gap-4 mt-2 text-sm">
                                <span className={`flex items-center gap-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                  <Calendar className="w-4 h-4" />
                                  {formatDate(order.orderedAt)}
                                </span>
                                {order.trackingNumber && (
                                  <span className={`flex items-center gap-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                    <Truck className="w-4 h-4" />
                                    {order.trackingNumber}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {formatCurrency(order.total)}
                              </p>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                                order.paymentStatus === 'paid'
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                  : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                              }`}>
                                {order.paymentStatus}
                              </span>
                            </div>
                            <select
                              value={order.status}
                              onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                              className={`px-3 py-1 rounded text-xs ${STATUS_COLORS[order.status].bg} ${STATUS_COLORS[order.status].text} border-0`}
                            >
                              <option value="pending">{t('tools.printOrder.pending3', 'Pending')}</option>
                              <option value="processing">{t('tools.printOrder.processing2', 'Processing')}</option>
                              <option value="printing">{t('tools.printOrder.printing2', 'Printing')}</option>
                              <option value="quality-check">{t('tools.printOrder.qualityCheck2', 'Quality Check')}</option>
                              <option value="shipped">{t('tools.printOrder.shipped3', 'Shipped')}</option>
                              <option value="delivered">{t('tools.printOrder.delivered2', 'Delivered')}</option>
                              <option value="cancelled">{t('tools.printOrder.cancelled2', 'Cancelled')}</option>
                            </select>
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                            >
                              <FileText className="w-4 h-4" />
                            </button>
                            <button
                              onClick={async () => {
                                const confirmed = await confirm({
                                  title: 'Confirm Delete',
                                  message: 'Delete this order?',
                                  confirmText: 'Delete',
                                  cancelText: 'Cancel',
                                  variant: 'danger',
                                });
                                if (!confirmed) return;
                                deleteOrder(order.id);
                              }}
                              className="p-2 rounded-lg hover:bg-red-100 text-red-500"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Create Order Tab */}
            {activeTab === 'create' && (
              <div className="space-y-6">
                {/* Client Info */}
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <h3 className={`font-medium mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.printOrder.clientInformation', 'Client Information')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.printOrder.clientName', 'Client Name *')}
                      </label>
                      <input
                        type="text"
                        value={newOrder.clientName}
                        onChange={(e) => setNewOrder({ ...newOrder, clientName: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.printOrder.email', 'Email *')}
                      </label>
                      <input
                        type="email"
                        value={newOrder.clientEmail}
                        onChange={(e) => setNewOrder({ ...newOrder, clientEmail: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.printOrder.phone', 'Phone')}
                      </label>
                      <input
                        type="tel"
                        value={newOrder.clientPhone}
                        onChange={(e) => setNewOrder({ ...newOrder, clientPhone: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <h3 className={`font-medium mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.printOrder.shippingAddress', 'Shipping Address')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.printOrder.address', 'Address')}
                      </label>
                      <input
                        type="text"
                        value={newOrder.shippingAddress}
                        onChange={(e) => setNewOrder({ ...newOrder, shippingAddress: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.printOrder.city', 'City')}
                      </label>
                      <input
                        type="text"
                        value={newOrder.shippingCity}
                        onChange={(e) => setNewOrder({ ...newOrder, shippingCity: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'
                        }`}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          {t('tools.printOrder.state', 'State')}
                        </label>
                        <input
                          type="text"
                          value={newOrder.shippingState}
                          onChange={(e) => setNewOrder({ ...newOrder, shippingState: e.target.value })}
                          className={`w-full px-3 py-2 rounded-lg border ${
                            theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'
                          }`}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          {t('tools.printOrder.zip', 'ZIP')}
                        </label>
                        <input
                          type="text"
                          value={newOrder.shippingZip}
                          onChange={(e) => setNewOrder({ ...newOrder, shippingZip: e.target.value })}
                          className={`w-full px-3 py-2 rounded-lg border ${
                            theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Add Items */}
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <h3 className={`font-medium mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.printOrder.addPrintItems', 'Add Print Items')}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-4">
                    <div className="md:col-span-2">
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.printOrder.photoName', 'Photo Name')}
                      </label>
                      <input
                        type="text"
                        value={currentItem.photoName}
                        onChange={(e) => setCurrentItem({ ...currentItem, photoName: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.printOrder.type', 'Type')}
                      </label>
                      <select
                        value={currentItem.printType}
                        onChange={(e) => setCurrentItem({ ...currentItem, printType: e.target.value as PrintType })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'
                        }`}
                      >
                        {PRINT_TYPES.map(t => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.printOrder.size', 'Size')}
                      </label>
                      <select
                        value={currentItem.size}
                        onChange={(e) => setCurrentItem({ ...currentItem, size: e.target.value as PrintSize })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'
                        }`}
                      >
                        {PRINT_SIZES.map(s => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.printOrder.qty', 'Qty')}
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={currentItem.quantity}
                        onChange={(e) => setCurrentItem({ ...currentItem, quantity: parseInt(e.target.value) })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'
                        }`}
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={addItemToOrder}
                        className="w-full px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90"
                      >
                        {t('tools.printOrder.add', 'Add')}
                      </button>
                    </div>
                  </div>

                  {/* Items List */}
                  {newOrder.items && newOrder.items.length > 0 && (
                    <div className="space-y-2 mt-4">
                      {newOrder.items.map((item) => (
                        <div
                          key={item.id}
                          className={`flex items-center justify-between p-3 rounded-lg ${
                            theme === 'dark' ? 'bg-gray-600' : 'bg-white'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <Image className="w-5 h-5 opacity-50" />
                            <div>
                              <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {item.photoName}
                              </p>
                              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                {PRINT_TYPES.find(t => t.value === item.printType)?.label} - {item.size} - {item.finish} x {item.quantity}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {formatCurrency(item.totalPrice)}
                            </span>
                            <button
                              onClick={() => removeItemFromOrder(item.id)}
                              className="p-1 hover:bg-red-100 rounded text-red-500"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Order Summary */}
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {t('tools.printOrder.orderSummary', 'Order Summary')}
                    </h3>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newOrder.rushOrder}
                        onChange={(e) => {
                          setNewOrder({ ...newOrder, rushOrder: e.target.checked });
                          recalculateTotals(newOrder.items || [], e.target.checked);
                        }}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.printOrder.rushOrder25', 'Rush Order (+25%)')}
                      </span>
                    </label>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>{t('tools.printOrder.subtotal', 'Subtotal')}</span>
                      <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{formatCurrency(newOrder.subtotal || 0)}</span>
                    </div>
                    {newOrder.rushFee && newOrder.rushFee > 0 && (
                      <div className="flex justify-between text-red-500">
                        <span>{t('tools.printOrder.rushFee', 'Rush Fee')}</span>
                        <span>{formatCurrency(newOrder.rushFee)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>{t('tools.printOrder.shipping', 'Shipping')}</span>
                      <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                        {newOrder.shippingCost === 0 ? 'FREE' : formatCurrency(newOrder.shippingCost || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>{t('tools.printOrder.tax', 'Tax')}</span>
                      <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{formatCurrency(newOrder.taxAmount || 0)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-600">
                      <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.printOrder.total', 'Total')}</span>
                      <span className={`font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {formatCurrency(newOrder.total || 0)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Submit */}
                <div className="flex justify-end gap-3">
                  <button
                    onClick={resetOrderForm}
                    className={`px-4 py-2 rounded-lg ${
                      theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    {t('tools.printOrder.clear', 'Clear')}
                  </button>
                  <button
                    onClick={handleSubmitOrder}
                    className="px-6 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90"
                  >
                    {t('tools.printOrder.createOrder', 'Create Order')}
                  </button>
                </div>
              </div>
            )}

            {/* Pricing Tab */}
            {activeTab === 'pricing' && (
              <div>
                <h3 className={`font-medium mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.printOrder.printPricingGuide', 'Print Pricing Guide')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {PRINT_TYPES.map((type) => (
                    <div
                      key={type.value}
                      className={`p-4 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {type.label}
                      </h4>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Starting at {formatCurrency(type.basePrice)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Order Detail Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            } p-6`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Order {selectedOrder.orderNumber}
                </h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  &times;
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {selectedOrder.clientName}
                    </p>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {selectedOrder.clientEmail}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm capitalize ${STATUS_COLORS[selectedOrder.status].bg} ${STATUS_COLORS[selectedOrder.status].text}`}>
                    {selectedOrder.status.replace('-', ' ')}
                  </span>
                </div>

                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <h4 className={`font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.printOrder.items', 'Items')}</h4>
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex justify-between py-2 border-b last:border-0 border-gray-200 dark:border-gray-600">
                      <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                        {item.photoName} - {item.size} {item.printType} x{item.quantity}
                      </span>
                      <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {formatCurrency(item.totalPrice)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-600">
                  <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.printOrder.total2', 'Total')}</span>
                  <span className={`font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {formatCurrency(selectedOrder.total)}
                  </span>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90"
                >
                  {t('tools.printOrder.close', 'Close')}
                </button>
              </div>
            </div>
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
    </>
  );
};

export default PrintOrderTool;
