'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  MapPin,
  User,
  Phone,
  Mail,
  Search,
  Filter,
  Eye,
  Printer,
  RefreshCw,
  Box,
  ClipboardCheck,
  Navigation,
  BarChart3,
  Calendar,
  X,
  ChevronRight,
  PackageCheck,
  PackageX,
  Timer,
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

interface OrderFulfillmentToolProps {
  uiConfig?: UIConfig;
}

import { useTheme } from '@/contexts/ThemeContext';

// Types
type OrderStatus = 'pending' | 'processing' | 'picking' | 'packing' | 'shipped' | 'delivered' | 'cancelled';
type ShippingMethod = 'standard' | 'express' | 'overnight' | 'pickup';
type FulfillmentPriority = 'low' | 'normal' | 'high' | 'urgent';

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  quantityPicked: number;
  price: number;
  weight: number;
  location: string;
}

interface ShippingAddress {
  name: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  email: string;
}

interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  priority: FulfillmentPriority;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  shippingMethod: ShippingMethod;
  trackingNumber?: string;
  carrier?: string;
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  notes?: string;
  specialInstructions?: string;
  orderDate: string;
  promisedDate: string;
  shippedDate?: string;
  deliveredDate?: string;
  assignedTo?: string;
  pickedAt?: string;
  packedAt?: string;
  weight?: number;
  packageCount?: number;
}

interface FulfillmentStats {
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  averageFulfillmentTime: number;
  onTimeDeliveryRate: number;
}

// Constants
const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bgColor: string; icon: React.ReactNode }> = {
  pending: { label: 'Pending', color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: <Clock className="w-4 h-4" /> },
  processing: { label: 'Processing', color: 'text-blue-600', bgColor: 'bg-blue-100', icon: <RefreshCw className="w-4 h-4" /> },
  picking: { label: 'Picking', color: 'text-purple-600', bgColor: 'bg-purple-100', icon: <Box className="w-4 h-4" /> },
  packing: { label: 'Packing', color: 'text-indigo-600', bgColor: 'bg-indigo-100', icon: <Package className="w-4 h-4" /> },
  shipped: { label: 'Shipped', color: 'text-cyan-600', bgColor: 'bg-cyan-100', icon: <Truck className="w-4 h-4" /> },
  delivered: { label: 'Delivered', color: 'text-green-600', bgColor: 'bg-green-100', icon: <CheckCircle className="w-4 h-4" /> },
  cancelled: { label: 'Cancelled', color: 'text-red-600', bgColor: 'bg-red-100', icon: <PackageX className="w-4 h-4" /> },
};

const PRIORITY_CONFIG: Record<FulfillmentPriority, { label: string; color: string; bgColor: string }> = {
  low: { label: 'Low', color: 'text-gray-600', bgColor: 'bg-gray-100' },
  normal: { label: 'Normal', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  high: { label: 'High', color: 'text-orange-600', bgColor: 'bg-orange-100' },
  urgent: { label: 'Urgent', color: 'text-red-600', bgColor: 'bg-red-100' },
};

const SHIPPING_METHODS: Record<ShippingMethod, { label: string; days: string }> = {
  standard: { label: 'Standard Shipping', days: '5-7 days' },
  express: { label: 'Express Shipping', days: '2-3 days' },
  overnight: { label: 'Overnight Shipping', days: '1 day' },
  pickup: { label: 'Store Pickup', days: 'Same day' },
};

const CARRIERS = ['UPS', 'FedEx', 'USPS', 'DHL', 'Local Courier'];

// Sample orders
const SAMPLE_ORDERS: Order[] = [
  {
    id: 'o1',
    orderNumber: 'ORD-2024-001',
    status: 'pending',
    priority: 'normal',
    items: [
      { id: 'i1', productId: 'p1', productName: 'Wireless Headphones', sku: 'WH-001', quantity: 2, quantityPicked: 0, price: 129.99, weight: 0.5, location: 'A-1-01' },
      { id: 'i2', productId: 'p2', productName: 'Phone Case', sku: 'PC-001', quantity: 1, quantityPicked: 0, price: 29.99, weight: 0.1, location: 'B-2-03' },
    ],
    shippingAddress: {
      name: 'John Smith',
      address1: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA',
      phone: '555-0123',
      email: 'john@email.com',
    },
    shippingMethod: 'standard',
    subtotal: 289.97,
    shippingCost: 9.99,
    tax: 24.00,
    total: 323.96,
    orderDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    promisedDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'o2',
    orderNumber: 'ORD-2024-002',
    status: 'processing',
    priority: 'high',
    items: [
      { id: 'i3', productId: 'p3', productName: 'Laptop Stand', sku: 'LS-001', quantity: 1, quantityPicked: 0, price: 79.99, weight: 2.0, location: 'C-1-02' },
    ],
    shippingAddress: {
      name: 'Sarah Johnson',
      company: 'Tech Corp',
      address1: '456 Business Ave',
      address2: 'Suite 100',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102',
      country: 'USA',
      phone: '555-0456',
      email: 'sarah@techcorp.com',
    },
    shippingMethod: 'express',
    subtotal: 79.99,
    shippingCost: 14.99,
    tax: 6.80,
    total: 101.78,
    orderDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    promisedDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    assignedTo: 'Mike W.',
  },
];

const generateId = () => Math.random().toString(36).substring(2, 11);
const generateTrackingNumber = () => `TRK${Date.now().toString(36).toUpperCase()}`;

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

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Column configurations for exports
const ORDER_COLUMNS: ColumnConfig[] = [
  { key: 'orderNumber', header: 'Order #', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'priority', header: 'Priority', type: 'string' },
  { key: 'shippingAddress.name', header: 'Customer', type: 'string' },
  { key: 'shippingMethod', header: 'Shipping', type: 'string' },
  { key: 'total', header: 'Total', type: 'currency' },
  { key: 'orderDate', header: 'Order Date', type: 'date' },
  { key: 'promisedDate', header: 'Promised Date', type: 'date' },
  { key: 'trackingNumber', header: 'Tracking #', type: 'string' },
];

// Main Component
export const OrderFulfillmentTool: React.FC<OrderFulfillmentToolProps> = ({ uiConfig }) => {
  const [isPrefilled, setIsPrefilled] = useState(false);
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // useToolData hooks for backend sync
  const {
    data: orders,
    addItem: addOrderToBackend,
    updateItem: updateOrderBackend,
    deleteItem: deleteOrderBackend,
    isSynced: ordersSynced,
    isSaving: ordersSaving,
    lastSaved: ordersLastSaved,
    syncError: ordersSyncError,
    forceSync: forceOrdersSync,
  } = useToolData<Order>('fulfillment-orders', SAMPLE_ORDERS, ORDER_COLUMNS);

  // Local UI State
  const [activeTab, setActiveTab] = useState<'queue' | 'picking' | 'shipping' | 'analytics'>('queue');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showShipModal, setShowShipModal] = useState(false);
  const [shipmentDetails, setShipmentDetails] = useState({
    carrier: '',
    trackingNumber: '',
    weight: 0,
    packageCount: 1,
  });

  // Prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      if (uiConfig.params.orderNumber) {
        const order = orders.find((o) => o.orderNumber === uiConfig.params!.orderNumber);
        if (order) {
          setSelectedOrder(order);
          setShowOrderDetails(true);
          setIsPrefilled(true);
        }
      }
    }
  }, [uiConfig?.params, orders]);

  // Filter orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        searchTerm === '' ||
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.shippingAddress.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.trackingNumber?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
      const matchesPriority = filterPriority === 'all' || order.priority === filterPriority;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [orders, searchTerm, filterStatus, filterPriority]);

  // Orders by status for queue view
  const ordersByStatus = useMemo(() => {
    return {
      pending: filteredOrders.filter((o) => o.status === 'pending'),
      processing: filteredOrders.filter((o) => o.status === 'processing'),
      picking: filteredOrders.filter((o) => o.status === 'picking'),
      packing: filteredOrders.filter((o) => o.status === 'packing'),
      shipped: filteredOrders.filter((o) => o.status === 'shipped'),
    };
  }, [filteredOrders]);

  // Analytics
  const stats = useMemo((): FulfillmentStats => {
    const statusCounts = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const deliveredOrders = orders.filter((o) => o.status === 'delivered');
    const onTimeDeliveries = deliveredOrders.filter((o) => {
      if (!o.deliveredDate) return false;
      return new Date(o.deliveredDate) <= new Date(o.promisedDate);
    });

    return {
      pending: statusCounts.pending || 0,
      processing: (statusCounts.processing || 0) + (statusCounts.picking || 0) + (statusCounts.packing || 0),
      shipped: statusCounts.shipped || 0,
      delivered: statusCounts.delivered || 0,
      cancelled: statusCounts.cancelled || 0,
      averageFulfillmentTime: 2.5, // hours - would calculate from actual data
      onTimeDeliveryRate: deliveredOrders.length > 0 ? (onTimeDeliveries.length / deliveredOrders.length) * 100 : 100,
    };
  }, [orders]);

  // Update order status
  const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    const updates: Partial<Order> = { status: newStatus };

    if (newStatus === 'picking') {
      updates.pickedAt = new Date().toISOString();
    } else if (newStatus === 'packing') {
      updates.packedAt = new Date().toISOString();
    }

    updateOrderBackend(orderId, updates);
  };

  // Mark item as picked
  const markItemPicked = (orderId: string, itemId: string, quantity: number) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    const updatedItems = order.items.map((item) =>
      item.id === itemId ? { ...item, quantityPicked: Math.min(item.quantity, item.quantityPicked + quantity) } : item
    );

    updateOrderBackend(orderId, { items: updatedItems });

    // Check if all items are picked
    const allPicked = updatedItems.every((item) => item.quantityPicked >= item.quantity);
    if (allPicked && order.status === 'picking') {
      updateOrderBackend(orderId, { status: 'packing', items: updatedItems, packedAt: new Date().toISOString() });
    }
  };

  // Ship order
  const shipOrder = () => {
    if (!selectedOrder || !shipmentDetails.carrier || !shipmentDetails.trackingNumber) {
      setValidationMessage('Please fill in carrier and tracking number');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    updateOrderBackend(selectedOrder.id, {
      status: 'shipped',
      carrier: shipmentDetails.carrier,
      trackingNumber: shipmentDetails.trackingNumber,
      weight: shipmentDetails.weight,
      packageCount: shipmentDetails.packageCount,
      shippedDate: new Date().toISOString(),
    });

    setShowShipModal(false);
    setShowOrderDetails(false);
    setShipmentDetails({ carrier: '', trackingNumber: '', weight: 0, packageCount: 1 });
  };

  // Mark as delivered
  const markDelivered = (orderId: string) => {
    updateOrderBackend(orderId, {
      status: 'delivered',
      deliveredDate: new Date().toISOString(),
    });
  };

  // Cancel order
  const cancelOrder = async (orderId: string) => {
    const confirmed = await confirm({
      title: 'Confirm Action',
      message: 'Are you sure you want to cancel this order?',
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (!confirmed) return;
    updateOrderBackend(orderId, { status: 'cancelled' });
  };

  // Check if order is late
  const isOrderLate = (order: Order) => {
    if (['delivered', 'cancelled'].includes(order.status)) return false;
    return new Date() > new Date(order.promisedDate);
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.orderFulfillment.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.orderFulfillment.orderFulfillmentTool', 'Order Fulfillment Tool')}
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.orderFulfillment.orderProcessingPickingPackingAnd', 'Order processing, picking, packing, and shipping')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="order-fulfillment" toolName="Order Fulfillment" />

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
                onExportCSV={() => exportToCSV(orders, ORDER_COLUMNS, 'fulfillment-orders')}
                onExportExcel={() => exportToExcel(orders, ORDER_COLUMNS, 'fulfillment-orders')}
                onExportJSON={() => exportToJSON(orders, 'fulfillment-orders')}
                onExportPDF={() => exportToPDF(orders, ORDER_COLUMNS, 'Fulfillment Orders')}
                onCopy={() => copyUtil(orders, ORDER_COLUMNS)}
                onPrint={() => printData(orders, ORDER_COLUMNS, 'Fulfillment Orders')}
              />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-yellow-900/20' : 'bg-yellow-50'}`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-700'}`}>{t('tools.orderFulfillment.pending', 'Pending')}</p>
              <p className="text-2xl font-bold text-yellow-500">{stats.pending}</p>
            </div>
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-blue-400' : 'text-blue-700'}`}>{t('tools.orderFulfillment.processing', 'Processing')}</p>
              <p className="text-2xl font-bold text-blue-500">{stats.processing}</p>
            </div>
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-cyan-900/20' : 'bg-cyan-50'}`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-700'}`}>{t('tools.orderFulfillment.shipped', 'Shipped')}</p>
              <p className="text-2xl font-bold text-cyan-500">{stats.shipped}</p>
            </div>
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-green-900/20' : 'bg-green-50'}`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-green-400' : 'text-green-700'}`}>{t('tools.orderFulfillment.delivered', 'Delivered')}</p>
              <p className="text-2xl font-bold text-green-500">{stats.delivered}</p>
            </div>
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-purple-900/20' : 'bg-purple-50'}`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-purple-400' : 'text-purple-700'}`}>{t('tools.orderFulfillment.onTimeRate', 'On-Time Rate')}</p>
              <p className="text-2xl font-bold text-purple-500">{stats.onTimeDeliveryRate.toFixed(0)}%</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            {['queue', 'picking', 'shipping', 'analytics'].map((tab) => (
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
                {tab === 'queue' && <ClipboardCheck className="w-4 h-4 inline mr-2" />}
                {tab === 'picking' && <Box className="w-4 h-4 inline mr-2" />}
                {tab === 'shipping' && <Truck className="w-4 h-4 inline mr-2" />}
                {tab === 'analytics' && <BarChart3 className="w-4 h-4 inline mr-2" />}
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4 mb-6`}>
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={t('tools.orderFulfillment.searchOrdersByNumberCustomer', 'Search orders by number, customer, or tracking...')}
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
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`px-4 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">{t('tools.orderFulfillment.allStatus', 'All Status')}</option>
              {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className={`px-4 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">{t('tools.orderFulfillment.allPriority', 'All Priority')}</option>
              {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Queue Tab */}
        {activeTab === 'queue' && (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                    <th className="text-left py-3 px-4">{t('tools.orderFulfillment.order', 'Order')}</th>
                    <th className="text-left py-3 px-4">{t('tools.orderFulfillment.customer', 'Customer')}</th>
                    <th className="text-left py-3 px-4">{t('tools.orderFulfillment.items', 'Items')}</th>
                    <th className="text-left py-3 px-4">{t('tools.orderFulfillment.shipping', 'Shipping')}</th>
                    <th className="text-left py-3 px-4">{t('tools.orderFulfillment.priority', 'Priority')}</th>
                    <th className="text-left py-3 px-4">{t('tools.orderFulfillment.status', 'Status')}</th>
                    <th className="text-left py-3 px-4">{t('tools.orderFulfillment.promised', 'Promised')}</th>
                    <th className="text-left py-3 px-4">{t('tools.orderFulfillment.actions', 'Actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      className={`border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} ${
                        isOrderLate(order) ? theme === 'dark' ? 'bg-red-900/10' : 'bg-red-50' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div>
                          <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {order.orderNumber}
                          </p>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {formatDate(order.orderDate)}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <p className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                          {order.shippingAddress.name}
                        </p>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {order.shippingAddress.city}, {order.shippingAddress.state}
                        </p>
                      </td>
                      <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {order.items.length} items
                      </td>
                      <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {SHIPPING_METHODS[order.shippingMethod].label}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${PRIORITY_CONFIG[order.priority].bgColor} ${PRIORITY_CONFIG[order.priority].color}`}>
                          {PRIORITY_CONFIG[order.priority].label}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${STATUS_CONFIG[order.status].bgColor} ${STATUS_CONFIG[order.status].color}`}>
                          {STATUS_CONFIG[order.status].icon}
                          {STATUS_CONFIG[order.status].label}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          {isOrderLate(order) && <AlertCircle className="w-4 h-4 text-red-500" />}
                          <span className={isOrderLate(order) ? 'text-red-500 font-medium' : theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                            {formatDate(order.promisedDate)}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => { setSelectedOrder(order); setShowOrderDetails(true); }}
                            className="p-2 rounded bg-blue-100 text-blue-600 hover:bg-blue-200"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {order.status === 'pending' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'processing')}
                              className="p-2 rounded bg-green-100 text-green-600 hover:bg-green-200"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredOrders.length === 0 && (
                <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.orderFulfillment.noOrdersFound', 'No orders found')}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Picking Tab */}
        {activeTab === 'picking' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Orders to Pick */}
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
              <h2 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.orderFulfillment.ordersReadyForPicking', 'Orders Ready for Picking')}
              </h2>
              <div className="space-y-3">
                {[...ordersByStatus.processing, ...ordersByStatus.picking].map((order) => (
                  <div
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedOrder?.id === order.id
                        ? 'border-[#0D9488] bg-[#0D9488]/10'
                        : theme === 'dark'
                        ? 'border-gray-700 hover:border-gray-600'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {order.orderNumber}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${PRIORITY_CONFIG[order.priority].bgColor} ${PRIORITY_CONFIG[order.priority].color}`}>
                        {PRIORITY_CONFIG[order.priority].label}
                      </span>
                    </div>
                    <p className={`text-sm mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {order.items.length} items - {order.shippingAddress.name}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs ${STATUS_CONFIG[order.status].bgColor} ${STATUS_CONFIG[order.status].color}`}>
                        {STATUS_CONFIG[order.status].label}
                      </span>
                      {order.assignedTo && (
                        <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                          Assigned: {order.assignedTo}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {ordersByStatus.processing.length === 0 && ordersByStatus.picking.length === 0 && (
                  <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.orderFulfillment.noOrdersReadyForPicking', 'No orders ready for picking')}
                  </p>
                )}
              </div>
            </div>

            {/* Pick List */}
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
              <h2 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.orderFulfillment.pickList', 'Pick List')}
              </h2>
              {selectedOrder ? (
                <div>
                  <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {selectedOrder.orderNumber}
                    </p>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Ship to: {selectedOrder.shippingAddress.name}
                    </p>
                  </div>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item) => (
                      <div
                        key={item.id}
                        className={`p-3 rounded-lg ${
                          item.quantityPicked >= item.quantity
                            ? theme === 'dark' ? 'bg-green-900/20' : 'bg-green-50'
                            : theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {item.productName}
                            </p>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              SKU: {item.sku} | Location: {item.location}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={`font-medium ${
                              item.quantityPicked >= item.quantity ? 'text-green-500' : theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}>
                              {item.quantityPicked}/{item.quantity}
                            </p>
                          </div>
                        </div>
                        {item.quantityPicked < item.quantity && (
                          <button
                            onClick={() => markItemPicked(selectedOrder.id, item.id, 1)}
                            className="w-full py-2 bg-[#0D9488] text-white rounded font-medium hover:bg-[#0B7B6F]"
                          >
                            {t('tools.orderFulfillment.pickItem', 'Pick Item')}
                          </button>
                        )}
                        {item.quantityPicked >= item.quantity && (
                          <div className="flex items-center gap-2 justify-center text-green-500">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm font-medium">{t('tools.orderFulfillment.picked', 'Picked')}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  {selectedOrder.status === 'processing' && (
                    <button
                      onClick={() => updateOrderStatus(selectedOrder.id, 'picking')}
                      className="w-full mt-4 py-2 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600"
                    >
                      {t('tools.orderFulfillment.startPicking', 'Start Picking')}
                    </button>
                  )}
                </div>
              ) : (
                <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.orderFulfillment.selectAnOrderToView', 'Select an order to view pick list')}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Shipping Tab */}
        {activeTab === 'shipping' && (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <h2 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.orderFulfillment.readyToShip', 'Ready to Ship')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ordersByStatus.packing.map((order) => (
                <div
                  key={order.id}
                  className={`p-4 rounded-lg border ${
                    theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {order.orderNumber}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${PRIORITY_CONFIG[order.priority].bgColor} ${PRIORITY_CONFIG[order.priority].color}`}>
                      {PRIORITY_CONFIG[order.priority].label}
                    </span>
                  </div>
                  <div className={`mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    <p className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4" />
                      {order.shippingAddress.name}
                    </p>
                    <p className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4" />
                      {order.shippingAddress.city}, {order.shippingAddress.state}
                    </p>
                    <p className="flex items-center gap-2 text-sm">
                      <Truck className="w-4 h-4" />
                      {SHIPPING_METHODS[order.shippingMethod].label}
                    </p>
                  </div>
                  <div className={`flex items-center justify-between mb-3 pt-3 border-t ${
                    theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                  }`}>
                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                      {order.items.length} items
                    </span>
                    <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {formatCurrency(order.total)}
                    </span>
                  </div>
                  <button
                    onClick={() => { setSelectedOrder(order); setShowShipModal(true); }}
                    className="w-full py-2 bg-[#0D9488] text-white rounded-lg font-medium hover:bg-[#0B7B6F]"
                  >
                    <Truck className="w-4 h-4 inline mr-2" />
                    {t('tools.orderFulfillment.shipOrder', 'Ship Order')}
                  </button>
                </div>
              ))}
              {ordersByStatus.packing.length === 0 && (
                <p className={`col-span-full text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.orderFulfillment.noOrdersReadyToShip', 'No orders ready to ship')}
                </p>
              )}
            </div>

            {/* Recently Shipped */}
            <h2 className={`text-lg font-semibold mt-8 mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.orderFulfillment.recentlyShipped', 'Recently Shipped')}
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                    <th className="text-left py-3 px-4">{t('tools.orderFulfillment.order2', 'Order')}</th>
                    <th className="text-left py-3 px-4">{t('tools.orderFulfillment.customer2', 'Customer')}</th>
                    <th className="text-left py-3 px-4">{t('tools.orderFulfillment.carrier', 'Carrier')}</th>
                    <th className="text-left py-3 px-4">{t('tools.orderFulfillment.tracking', 'Tracking')}</th>
                    <th className="text-left py-3 px-4">{t('tools.orderFulfillment.shipped2', 'Shipped')}</th>
                    <th className="text-left py-3 px-4">{t('tools.orderFulfillment.actions2', 'Actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {ordersByStatus.shipped.map((order) => (
                    <tr
                      key={order.id}
                      className={`border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}
                    >
                      <td className={`py-3 px-4 font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {order.orderNumber}
                      </td>
                      <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {order.shippingAddress.name}
                      </td>
                      <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {order.carrier || '-'}
                      </td>
                      <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {order.trackingNumber || '-'}
                      </td>
                      <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {order.shippedDate ? formatDateTime(order.shippedDate) : '-'}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => markDelivered(order.id)}
                          className="text-green-500 hover:text-green-600 text-sm font-medium"
                        >
                          {t('tools.orderFulfillment.markDelivered', 'Mark Delivered')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.orderFulfillment.totalOrders', 'Total Orders')}</p>
                  <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {orders.length}
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
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.orderFulfillment.fulfilledToday', 'Fulfilled Today')}</p>
                  <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {orders.filter((o) =>
                      o.shippedDate && new Date(o.shippedDate).toDateString() === new Date().toDateString()
                    ).length}
                  </p>
                </div>
              </div>
            </div>

            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Timer className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.orderFulfillment.avgFulfillmentTime', 'Avg. Fulfillment Time')}</p>
                  <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {stats.averageFulfillmentTime}h
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
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.orderFulfillment.lateOrders', 'Late Orders')}</p>
                  <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {orders.filter(isOrderLate).length}
                  </p>
                </div>
              </div>
            </div>

            {/* Status Breakdown */}
            <div className={`md:col-span-2 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
              <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.orderFulfillment.ordersByStatus', 'Orders by Status')}
              </h3>
              <div className="space-y-3">
                {Object.entries(STATUS_CONFIG).map(([status, config]) => {
                  const count = orders.filter((o) => o.status === status).length;
                  const percentage = orders.length > 0 ? (count / orders.length) * 100 : 0;
                  return (
                    <div key={status}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className={config.color}>{config.icon}</span>
                          <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{config.label}</span>
                        </div>
                        <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>{count} orders</span>
                      </div>
                      <div className={`h-2 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                        <div
                          className={`h-2 rounded-full ${config.bgColor.replace('bg-', 'bg-')}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Shipping Method Breakdown */}
            <div className={`md:col-span-2 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
              <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.orderFulfillment.ordersByShippingMethod', 'Orders by Shipping Method')}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(SHIPPING_METHODS).map(([method, config]) => {
                  const count = orders.filter((o) => o.shippingMethod === method).length;
                  return (
                    <div
                      key={method}
                      className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}
                    >
                      <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{config.label}</p>
                      <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{count}</p>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{config.days}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Order Details Modal */}
        {showOrderDetails && selectedOrder && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl p-6 w-full max-w-2xl m-4`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Order Details - {selectedOrder.orderNumber}
                </h2>
                <button
                  onClick={() => setShowOrderDetails(false)}
                  className={theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-600'}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className={`font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.orderFulfillment.shippingAddress', 'Shipping Address')}
                  </h3>
                  <div className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                    <p>{selectedOrder.shippingAddress.name}</p>
                    {selectedOrder.shippingAddress.company && <p>{selectedOrder.shippingAddress.company}</p>}
                    <p>{selectedOrder.shippingAddress.address1}</p>
                    {selectedOrder.shippingAddress.address2 && <p>{selectedOrder.shippingAddress.address2}</p>}
                    <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}</p>
                    <p>{selectedOrder.shippingAddress.phone}</p>
                    <p>{selectedOrder.shippingAddress.email}</p>
                  </div>
                </div>
                <div>
                  <h3 className={`font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.orderFulfillment.orderInfo', 'Order Info')}
                  </h3>
                  <div className={`space-y-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    <p>Status: <span className={`px-2 py-0.5 rounded text-xs ${STATUS_CONFIG[selectedOrder.status].bgColor} ${STATUS_CONFIG[selectedOrder.status].color}`}>{STATUS_CONFIG[selectedOrder.status].label}</span></p>
                    <p>Priority: <span className={`px-2 py-0.5 rounded text-xs ${PRIORITY_CONFIG[selectedOrder.priority].bgColor} ${PRIORITY_CONFIG[selectedOrder.priority].color}`}>{PRIORITY_CONFIG[selectedOrder.priority].label}</span></p>
                    <p>Shipping: {SHIPPING_METHODS[selectedOrder.shippingMethod].label}</p>
                    <p>Order Date: {formatDateTime(selectedOrder.orderDate)}</p>
                    <p>Promised: {formatDate(selectedOrder.promisedDate)}</p>
                    {selectedOrder.trackingNumber && <p>Tracking: {selectedOrder.trackingNumber}</p>}
                  </div>
                </div>
              </div>

              <h3 className={`font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.orderFulfillment.items2', 'Items')}
              </h3>
              <div className={`border rounded-lg overflow-hidden mb-4 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <table className="w-full">
                  <thead className={theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}>
                    <tr className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                      <th className="text-left py-2 px-4">{t('tools.orderFulfillment.product', 'Product')}</th>
                      <th className="text-left py-2 px-4">{t('tools.orderFulfillment.sku', 'SKU')}</th>
                      <th className="text-right py-2 px-4">{t('tools.orderFulfillment.qty', 'Qty')}</th>
                      <th className="text-right py-2 px-4">{t('tools.orderFulfillment.price', 'Price')}</th>
                      <th className="text-right py-2 px-4">{t('tools.orderFulfillment.total', 'Total')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items.map((item) => (
                      <tr key={item.id} className={`border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                        <td className={`py-2 px-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{item.productName}</td>
                        <td className={`py-2 px-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{item.sku}</td>
                        <td className={`py-2 px-4 text-right ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{item.quantity}</td>
                        <td className={`py-2 px-4 text-right ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{formatCurrency(item.price)}</td>
                        <td className={`py-2 px-4 text-right font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(item.price * item.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className={`flex justify-end ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                <div className="w-48">
                  <div className="flex justify-between mb-1">
                    <span>{t('tools.orderFulfillment.subtotal', 'Subtotal:')}</span>
                    <span>{formatCurrency(selectedOrder.subtotal)}</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span>{t('tools.orderFulfillment.shipping2', 'Shipping:')}</span>
                    <span>{formatCurrency(selectedOrder.shippingCost)}</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span>{t('tools.orderFulfillment.tax', 'Tax:')}</span>
                    <span>{formatCurrency(selectedOrder.tax)}</span>
                  </div>
                  <div className={`flex justify-between font-bold pt-2 border-t ${theme === 'dark' ? 'border-gray-700 text-white' : 'border-gray-200 text-gray-900'}`}>
                    <span>{t('tools.orderFulfillment.total2', 'Total:')}</span>
                    <span>{formatCurrency(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                {selectedOrder.status === 'packing' && (
                  <button
                    onClick={() => { setShowOrderDetails(false); setShowShipModal(true); }}
                    className="flex-1 py-2 bg-[#0D9488] text-white rounded-lg font-medium hover:bg-[#0B7B6F]"
                  >
                    <Truck className="w-4 h-4 inline mr-2" />
                    {t('tools.orderFulfillment.shipOrder2', 'Ship Order')}
                  </button>
                )}
                {!['delivered', 'cancelled', 'shipped'].includes(selectedOrder.status) && (
                  <button
                    onClick={() => { cancelOrder(selectedOrder.id); setShowOrderDetails(false); }}
                    className="px-4 py-2 bg-red-100 text-red-600 rounded-lg font-medium hover:bg-red-200"
                  >
                    {t('tools.orderFulfillment.cancelOrder', 'Cancel Order')}
                  </button>
                )}
                <button
                  onClick={() => setShowOrderDetails(false)}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {t('tools.orderFulfillment.close', 'Close')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Ship Modal */}
        {showShipModal && selectedOrder && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl p-6 w-full max-w-md`}>
              <h2 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Ship Order - {selectedOrder.orderNumber}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.orderFulfillment.carrier2', 'Carrier *')}
                  </label>
                  <select
                    value={shipmentDetails.carrier}
                    onChange={(e) => setShipmentDetails((prev) => ({ ...prev, carrier: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="">{t('tools.orderFulfillment.selectCarrier', 'Select carrier')}</option>
                    {CARRIERS.map((carrier) => (
                      <option key={carrier} value={carrier}>{carrier}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.orderFulfillment.trackingNumber', 'Tracking Number *')}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={shipmentDetails.trackingNumber}
                      onChange={(e) => setShipmentDetails((prev) => ({ ...prev, trackingNumber: e.target.value }))}
                      className={`flex-1 px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                    <button
                      onClick={() => setShipmentDetails((prev) => ({ ...prev, trackingNumber: generateTrackingNumber() }))}
                      className={`px-3 py-2 rounded-lg ${
                        theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {t('tools.orderFulfillment.generate', 'Generate')}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.orderFulfillment.weightLbs', 'Weight (lbs)')}
                    </label>
                    <input
                      type="number"
                      value={shipmentDetails.weight || ''}
                      onChange={(e) => setShipmentDetails((prev) => ({ ...prev, weight: parseFloat(e.target.value) || 0 }))}
                      step="0.1"
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
                      {t('tools.orderFulfillment.packageCount', 'Package Count')}
                    </label>
                    <input
                      type="number"
                      value={shipmentDetails.packageCount}
                      onChange={(e) => setShipmentDetails((prev) => ({ ...prev, packageCount: parseInt(e.target.value) || 1 }))}
                      min="1"
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => { setShowShipModal(false); setShipmentDetails({ carrier: '', trackingNumber: '', weight: 0, packageCount: 1 }); }}
                  className={`flex-1 py-2 rounded-lg font-medium ${
                    theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {t('tools.orderFulfillment.cancel', 'Cancel')}
                </button>
                <button
                  onClick={shipOrder}
                  className="flex-1 py-2 bg-[#0D9488] text-white rounded-lg font-medium hover:bg-[#0B7B6F]"
                >
                  <Truck className="w-4 h-4 inline mr-2" />
                  {t('tools.orderFulfillment.shipOrder3', 'Ship Order')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderFulfillmentTool;
