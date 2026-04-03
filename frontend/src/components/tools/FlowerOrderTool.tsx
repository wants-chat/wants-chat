'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import useToolData from '../../hooks/useToolData';
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
import {
  Flower2,
  Package,
  Truck,
  Calendar,
  Clock,
  User,
  Phone,
  MapPin,
  DollarSign,
  Plus,
  Trash2,
  Edit,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  XCircle,
  Eye,
  Printer,
  Sparkles,
} from 'lucide-react';

// Types
interface FlowerArrangement {
  id: string;
  type: string;
  description: string;
  color: string;
  size: 'small' | 'medium' | 'large' | 'extra_large' | 'custom';
  price: number;
  quantity: number;
}

interface FlowerOrder {
  id: string;
  orderNumber: string;
  caseNumber: string;
  deceasedName: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'ready' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  // Order Details
  arrangements: FlowerArrangement[];
  // Orderer Information
  orderedBy: string;
  ordererPhone: string;
  ordererEmail: string;
  relationship: string;
  // Delivery Information
  deliveryDate: string;
  deliveryTime: string;
  deliveryLocation: string;
  deliveryAddress: string;
  deliveryInstructions: string;
  // Florist Information
  floristName: string;
  floristPhone: string;
  floristConfirmed: boolean;
  // Card
  cardMessage: string;
  cardSignature: string;
  // Financial
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  paymentMethod: string;
  // Notes
  notes: string;
}

// Column configuration for export
const orderColumns: ColumnConfig[] = [
  { key: 'orderNumber', header: 'Order #', type: 'string' },
  { key: 'caseNumber', header: 'Case #', type: 'string' },
  { key: 'deceasedName', header: 'Deceased', type: 'string' },
  { key: 'orderedBy', header: 'Ordered By', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'deliveryDate', header: 'Delivery Date', type: 'date' },
  { key: 'total', header: 'Total', type: 'currency' },
  { key: 'paymentStatus', header: 'Payment', type: 'string' },
];

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300', icon: Clock },
  confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300', icon: CheckCircle },
  in_progress: { label: 'In Progress', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300', icon: Package },
  ready: { label: 'Ready', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', icon: CheckCircle },
  delivered: { label: 'Delivered', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300', icon: Truck },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300', icon: XCircle },
};

const paymentStatusConfig = {
  pending: { label: 'Pending', color: 'text-yellow-600' },
  paid: { label: 'Paid', color: 'text-green-600' },
  refunded: { label: 'Refunded', color: 'text-red-600' },
};

const arrangementTypes = [
  'Standing Spray',
  'Casket Spray',
  'Sympathy Basket',
  'Heart Standing',
  'Cross Standing',
  'Wreath',
  'Urn Arrangement',
  'Floor Basket',
  'Altar Arrangement',
  'Plant',
  'Custom Arrangement',
];

const sizeLabels = {
  small: 'Small',
  medium: 'Medium',
  large: 'Large',
  extra_large: 'Extra Large',
  custom: 'Custom',
};

const generateOrderNumber = () => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 9000) + 1000;
  return `FO-${year}${month}-${random}`;
};

const createEmptyOrder = (): FlowerOrder => ({
  id: crypto.randomUUID(),
  orderNumber: generateOrderNumber(),
  caseNumber: '',
  deceasedName: '',
  status: 'pending',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  arrangements: [],
  orderedBy: '',
  ordererPhone: '',
  ordererEmail: '',
  relationship: '',
  deliveryDate: '',
  deliveryTime: '',
  deliveryLocation: '',
  deliveryAddress: '',
  deliveryInstructions: '',
  floristName: '',
  floristPhone: '',
  floristConfirmed: false,
  cardMessage: '',
  cardSignature: '',
  subtotal: 0,
  deliveryFee: 0,
  tax: 0,
  total: 0,
  paymentStatus: 'pending',
  paymentMethod: '',
  notes: '',
});

const createEmptyArrangement = (): FlowerArrangement => ({
  id: crypto.randomUUID(),
  type: 'Standing Spray',
  description: '',
  color: '',
  size: 'medium',
  price: 0,
  quantity: 1,
});

interface FlowerOrderToolProps {
  uiConfig?: UIConfig;
}

export const FlowerOrderTool: React.FC<FlowerOrderToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'details' | 'arrangements' | 'delivery' | 'card'>('details');
  const [showArrangementForm, setShowArrangementForm] = useState(false);

  // Initialize useToolData hook for backend persistence
  const {
    data: orders,
    updateItem,
    addItem,
    deleteItem,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<FlowerOrder>(
    'flower-orders',
    [],
    orderColumns,
    { autoSave: true }
  );

  // Apply prefill data from uiConfig.params
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.deceasedName || params.name || params.caseNumber) {
        const newOrder = createEmptyOrder();
        newOrder.deceasedName = params.deceasedName || params.name || '';
        if (params.caseNumber) newOrder.caseNumber = params.caseNumber;
        if (params.orderedBy) newOrder.orderedBy = params.orderedBy;
        if (params.phone) newOrder.ordererPhone = params.phone;
        addItem(newOrder);
        setSelectedOrderId(newOrder.id);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchesSearch = searchTerm === '' ||
        o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.deceasedName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.orderedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.caseNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  const selectedOrder = orders.find(o => o.id === selectedOrderId);

  // Calculate totals
  const calculateTotals = (arrangements: FlowerArrangement[], deliveryFee: number, taxRate: number = 0.0825) => {
    const subtotal = arrangements.reduce((sum, a) => sum + (a.price * a.quantity), 0);
    const tax = subtotal * taxRate;
    const total = subtotal + deliveryFee + tax;
    return { subtotal, tax, total };
  };

  // Order operations
  const handleCreateOrder = () => {
    const newOrder = createEmptyOrder();
    addItem(newOrder);
    setSelectedOrderId(newOrder.id);
  };

  const handleUpdateOrder = (updates: Partial<FlowerOrder>) => {
    if (!selectedOrder) return;

    let finalUpdates = { ...updates };

    // Recalculate totals if arrangements or delivery fee changed
    if (updates.arrangements || updates.deliveryFee !== undefined) {
      const arrangements = updates.arrangements || selectedOrder.arrangements;
      const deliveryFee = updates.deliveryFee ?? selectedOrder.deliveryFee;
      const { subtotal, tax, total } = calculateTotals(arrangements, deliveryFee);
      finalUpdates = { ...finalUpdates, subtotal, tax, total };
    }

    updateItem(selectedOrder.id, {
      ...selectedOrder,
      ...finalUpdates,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleDeleteOrder = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Order',
      message: 'Are you sure you want to delete this order? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteItem(id);
      if (selectedOrderId === id) setSelectedOrderId(null);
    }
  };

  // Arrangement operations
  const handleAddArrangement = (arrangement: FlowerArrangement) => {
    if (!selectedOrder) return;
    const newArrangements = [...selectedOrder.arrangements, arrangement];
    handleUpdateOrder({ arrangements: newArrangements });
    setShowArrangementForm(false);
  };

  const handleUpdateArrangement = (arrangementId: string, updates: Partial<FlowerArrangement>) => {
    if (!selectedOrder) return;
    const newArrangements = selectedOrder.arrangements.map(a =>
      a.id === arrangementId ? { ...a, ...updates } : a
    );
    handleUpdateOrder({ arrangements: newArrangements });
  };

  const handleDeleteArrangement = (arrangementId: string) => {
    if (!selectedOrder) return;
    const newArrangements = selectedOrder.arrangements.filter(a => a.id !== arrangementId);
    handleUpdateOrder({ arrangements: newArrangements });
  };

  // Export data
  const getExportData = () => {
    return orders.map(o => ({
      orderNumber: o.orderNumber,
      caseNumber: o.caseNumber,
      deceasedName: o.deceasedName,
      orderedBy: o.orderedBy,
      status: statusConfig[o.status].label,
      deliveryDate: o.deliveryDate,
      total: o.total,
      paymentStatus: paymentStatusConfig[o.paymentStatus].label,
    }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString();
  };

  // Stats
  const todayOrders = orders.filter(o => {
    const today = new Date().toISOString().split('T')[0];
    return o.deliveryDate === today;
  }).length;

  const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'confirmed').length;
  const totalRevenue = orders.filter(o => o.paymentStatus === 'paid').reduce((sum, o) => sum + o.total, 0);

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Flower2 className="w-7 h-7 text-pink-500" />
              Flower Order Tracking
              {isPrefilled && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Auto-filled
                </span>
              )}
            </h1>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.flowerOrder.trackAndManageSympathyFlower', 'Track and manage sympathy flower orders')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <WidgetEmbedButton toolSlug="flower-order" toolName="Flower Order" />

            <SyncStatus
              isSynced={isSynced}
              isSaving={isSaving}
              lastSaved={lastSaved}
              error={syncError}
              onRetry={forceSync}
            />
            <ExportDropdown
              data={getExportData()}
              columns={orderColumns}
              filename="flower-orders"
              onExportCSV={() => exportToCSV(getExportData(), orderColumns, 'flower-orders')}
              onExportExcel={() => exportToExcel(getExportData(), orderColumns, 'flower-orders')}
              onExportJSON={() => exportToJSON(getExportData(), 'flower-orders')}
              onExportPDF={() => exportToPDF(getExportData(), orderColumns, 'flower-orders', 'Flower Orders')}
              onCopy={() => copyUtil(getExportData(), orderColumns)}
              onPrint={() => printData(getExportData(), orderColumns, 'Flower Orders')}
            />
            <button
              onClick={handleCreateOrder}
              className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
            >
              <Plus className="w-4 h-4" />
              {t('tools.flowerOrder.newOrder', 'New Order')}
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <p className="text-sm text-gray-500">{t('tools.flowerOrder.totalOrders', 'Total Orders')}</p>
            <p className="text-2xl font-bold">{orders.length}</p>
          </div>
          <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <p className="text-sm text-gray-500">{t('tools.flowerOrder.todaySDeliveries', 'Today\'s Deliveries')}</p>
            <p className="text-2xl font-bold text-blue-600">{todayOrders}</p>
          </div>
          <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <p className="text-sm text-gray-500">{t('tools.flowerOrder.pending', 'Pending')}</p>
            <p className="text-2xl font-bold text-yellow-600">{pendingOrders}</p>
          </div>
          <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <p className="text-sm text-gray-500">{t('tools.flowerOrder.totalRevenue', 'Total Revenue')}</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('tools.flowerOrder.searchOrders', 'Search orders...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
              }`}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${
              theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
            }`}
          >
            <option value="all">{t('tools.flowerOrder.allStatuses', 'All Statuses')}</option>
            {Object.entries(statusConfig).map(([key, val]) => (
              <option key={key} value={key}>{val.label}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Orders List */}
          <div className={`rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-semibold">Orders ({filteredOrders.length})</h2>
            </div>
            <div className="max-h-[600px] overflow-y-auto">
              {filteredOrders.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <Flower2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>{t('tools.flowerOrder.noOrdersFound', 'No orders found')}</p>
                  <button onClick={handleCreateOrder} className="mt-2 text-pink-600 hover:underline text-sm">
                    {t('tools.flowerOrder.createYourFirstOrder', 'Create your first order')}
                  </button>
                </div>
              ) : (
                filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    onClick={() => setSelectedOrderId(order.id)}
                    className={`p-4 border-b cursor-pointer transition-colors ${
                      selectedOrderId === order.id
                        ? theme === 'dark' ? 'bg-pink-900/20' : 'bg-pink-50'
                        : theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                    } ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{order.orderNumber}</p>
                        <p className="text-sm text-gray-500">{order.deceasedName || 'No name'}</p>
                        <p className="text-xs text-gray-400">From: {order.orderedBy || 'Unknown'}</p>
                      </div>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${statusConfig[order.status].color}`}>
                        {statusConfig[order.status].label}
                      </span>
                    </div>
                    <div className="mt-2 flex justify-between text-sm">
                      <span className="text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {formatDate(order.deliveryDate)}
                      </span>
                      <span className="font-medium">{formatCurrency(order.total)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Order Details */}
          <div className={`lg:col-span-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            {selectedOrder ? (
              <>
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <div>
                    <h2 className="font-semibold text-lg">{selectedOrder.orderNumber}</h2>
                    <p className="text-sm text-gray-500">For: {selectedOrder.deceasedName || 'N/A'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedOrder.status}
                      onChange={(e) => handleUpdateOrder({ status: e.target.value as FlowerOrder['status'] })}
                      className={`text-sm px-3 py-1.5 rounded border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                      }`}
                    >
                      {Object.entries(statusConfig).map(([key, val]) => (
                        <option key={key} value={key}>{val.label}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleDeleteOrder(selectedOrder.id)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 dark:border-gray-700">
                  <div className="flex">
                    {(['details', 'arrangements', 'delivery', 'card'] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-3 text-sm font-medium capitalize border-b-2 transition-colors ${
                          activeTab === tab
                            ? 'border-pink-500 text-pink-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 max-h-[500px] overflow-y-auto">
                  {activeTab === 'details' && (
                    <div className="space-y-6">
                      {/* Order Information */}
                      <div>
                        <h3 className="font-medium mb-3 flex items-center gap-2">
                          <Package className="w-4 h-4" /> Order Information
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm text-gray-500 mb-1">{t('tools.flowerOrder.caseNumber', 'Case Number')}</label>
                            <input
                              type="text"
                              value={selectedOrder.caseNumber}
                              onChange={(e) => handleUpdateOrder({ caseNumber: e.target.value })}
                              placeholder={t('tools.flowerOrder.eGFh20241234', 'e.g., FH-2024-1234')}
                              className={`w-full px-3 py-2 rounded-lg border ${
                                theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                              }`}
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-500 mb-1">{t('tools.flowerOrder.deceasedName', 'Deceased Name')}</label>
                            <input
                              type="text"
                              value={selectedOrder.deceasedName}
                              onChange={(e) => handleUpdateOrder({ deceasedName: e.target.value })}
                              className={`w-full px-3 py-2 rounded-lg border ${
                                theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                              }`}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Orderer Information */}
                      <div>
                        <h3 className="font-medium mb-3 flex items-center gap-2">
                          <User className="w-4 h-4" /> Orderer Information
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm text-gray-500 mb-1">{t('tools.flowerOrder.orderedBy', 'Ordered By')}</label>
                            <input
                              type="text"
                              value={selectedOrder.orderedBy}
                              onChange={(e) => handleUpdateOrder({ orderedBy: e.target.value })}
                              className={`w-full px-3 py-2 rounded-lg border ${
                                theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                              }`}
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-500 mb-1">{t('tools.flowerOrder.relationship', 'Relationship')}</label>
                            <input
                              type="text"
                              value={selectedOrder.relationship}
                              onChange={(e) => handleUpdateOrder({ relationship: e.target.value })}
                              placeholder={t('tools.flowerOrder.eGFriendColleague', 'e.g., Friend, Colleague')}
                              className={`w-full px-3 py-2 rounded-lg border ${
                                theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                              }`}
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-500 mb-1">{t('tools.flowerOrder.phone', 'Phone')}</label>
                            <input
                              type="tel"
                              value={selectedOrder.ordererPhone}
                              onChange={(e) => handleUpdateOrder({ ordererPhone: e.target.value })}
                              className={`w-full px-3 py-2 rounded-lg border ${
                                theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                              }`}
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-500 mb-1">{t('tools.flowerOrder.email', 'Email')}</label>
                            <input
                              type="email"
                              value={selectedOrder.ordererEmail}
                              onChange={(e) => handleUpdateOrder({ ordererEmail: e.target.value })}
                              className={`w-full px-3 py-2 rounded-lg border ${
                                theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                              }`}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Financial Summary */}
                      <div>
                        <h3 className="font-medium mb-3 flex items-center gap-2">
                          <DollarSign className="w-4 h-4" /> Financial Summary
                        </h3>
                        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-500">{t('tools.flowerOrder.subtotal', 'Subtotal')}</span>
                              <span>{formatCurrency(selectedOrder.subtotal)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">{t('tools.flowerOrder.deliveryFee', 'Delivery Fee')}</span>
                              <input
                                type="number"
                                value={selectedOrder.deliveryFee}
                                onChange={(e) => handleUpdateOrder({ deliveryFee: parseFloat(e.target.value) || 0 })}
                                className={`w-24 text-right px-2 py-1 rounded border ${
                                  theme === 'dark' ? 'bg-gray-600 border-gray-500' : 'bg-white border-gray-300'
                                }`}
                              />
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">{t('tools.flowerOrder.tax', 'Tax')}</span>
                              <span>{formatCurrency(selectedOrder.tax)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-300 dark:border-gray-600">
                              <span>{t('tools.flowerOrder.total', 'Total')}</span>
                              <span>{formatCurrency(selectedOrder.total)}</span>
                            </div>
                          </div>
                          <div className="mt-4 flex items-center gap-4">
                            <select
                              value={selectedOrder.paymentStatus}
                              onChange={(e) => handleUpdateOrder({ paymentStatus: e.target.value as FlowerOrder['paymentStatus'] })}
                              className={`px-3 py-1.5 rounded border ${
                                theme === 'dark' ? 'bg-gray-600 border-gray-500' : 'bg-white border-gray-300'
                              }`}
                            >
                              {Object.entries(paymentStatusConfig).map(([key, val]) => (
                                <option key={key} value={key}>{val.label}</option>
                              ))}
                            </select>
                            <input
                              type="text"
                              value={selectedOrder.paymentMethod}
                              onChange={(e) => handleUpdateOrder({ paymentMethod: e.target.value })}
                              placeholder={t('tools.flowerOrder.paymentMethod', 'Payment method')}
                              className={`flex-1 px-3 py-1.5 rounded border ${
                                theme === 'dark' ? 'bg-gray-600 border-gray-500' : 'bg-white border-gray-300'
                              }`}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'arrangements' && (
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-medium">Arrangements ({selectedOrder.arrangements.length})</h3>
                        <button
                          onClick={() => setShowArrangementForm(true)}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-pink-600 text-white rounded-lg hover:bg-pink-700"
                        >
                          <Plus className="w-4 h-4" /> Add Arrangement
                        </button>
                      </div>

                      {showArrangementForm && (
                        <ArrangementForm
                          onSubmit={handleAddArrangement}
                          onCancel={() => setShowArrangementForm(false)}
                          theme={theme}
                        />
                      )}

                      <div className="space-y-3">
                        {selectedOrder.arrangements.length === 0 ? (
                          <p className="text-center text-gray-500 py-8">{t('tools.flowerOrder.noArrangementsAdded', 'No arrangements added')}</p>
                        ) : (
                          selectedOrder.arrangements.map((arr) => (
                            <div
                              key={arr.id}
                              className={`p-4 rounded-lg border ${
                                theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                              }`}
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium">{arr.type}</p>
                                  <p className="text-sm text-gray-500">
                                    {sizeLabels[arr.size]}{arr.color ? ` - ${arr.color}` : ''}
                                  </p>
                                  {arr.description && (
                                    <p className="text-sm text-gray-400 mt-1">{arr.description}</p>
                                  )}
                                </div>
                                <div className="text-right">
                                  <p className="font-medium">{formatCurrency(arr.price)}</p>
                                  <p className="text-sm text-gray-500">Qty: {arr.quantity}</p>
                                </div>
                              </div>
                              <div className="flex justify-end mt-2">
                                <button
                                  onClick={() => handleDeleteArrangement(arr.id)}
                                  className="text-xs text-red-600 hover:underline"
                                >
                                  {t('tools.flowerOrder.remove', 'Remove')}
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === 'delivery' && (
                    <div className="space-y-6">
                      {/* Delivery Details */}
                      <div>
                        <h3 className="font-medium mb-3 flex items-center gap-2">
                          <Truck className="w-4 h-4" /> Delivery Details
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm text-gray-500 mb-1">{t('tools.flowerOrder.deliveryDate', 'Delivery Date')}</label>
                            <input
                              type="date"
                              value={selectedOrder.deliveryDate}
                              onChange={(e) => handleUpdateOrder({ deliveryDate: e.target.value })}
                              className={`w-full px-3 py-2 rounded-lg border ${
                                theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                              }`}
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-500 mb-1">{t('tools.flowerOrder.deliveryTime', 'Delivery Time')}</label>
                            <input
                              type="time"
                              value={selectedOrder.deliveryTime}
                              onChange={(e) => handleUpdateOrder({ deliveryTime: e.target.value })}
                              className={`w-full px-3 py-2 rounded-lg border ${
                                theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                              }`}
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-500 mb-1">{t('tools.flowerOrder.location', 'Location')}</label>
                            <input
                              type="text"
                              value={selectedOrder.deliveryLocation}
                              onChange={(e) => handleUpdateOrder({ deliveryLocation: e.target.value })}
                              placeholder={t('tools.flowerOrder.eGChapelViewingRoom', 'e.g., Chapel, Viewing Room')}
                              className={`w-full px-3 py-2 rounded-lg border ${
                                theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                              }`}
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-500 mb-1">{t('tools.flowerOrder.address', 'Address')}</label>
                            <input
                              type="text"
                              value={selectedOrder.deliveryAddress}
                              onChange={(e) => handleUpdateOrder({ deliveryAddress: e.target.value })}
                              className={`w-full px-3 py-2 rounded-lg border ${
                                theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                              }`}
                            />
                          </div>
                          <div className="col-span-2">
                            <label className="block text-sm text-gray-500 mb-1">{t('tools.flowerOrder.deliveryInstructions', 'Delivery Instructions')}</label>
                            <textarea
                              value={selectedOrder.deliveryInstructions}
                              onChange={(e) => handleUpdateOrder({ deliveryInstructions: e.target.value })}
                              placeholder={t('tools.flowerOrder.specialInstructionsForDelivery', 'Special instructions for delivery...')}
                              className={`w-full px-3 py-2 rounded-lg border resize-none ${
                                theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                              }`}
                              rows={2}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Florist Information */}
                      <div>
                        <h3 className="font-medium mb-3 flex items-center gap-2">
                          <Flower2 className="w-4 h-4" /> Florist Information
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm text-gray-500 mb-1">{t('tools.flowerOrder.floristName', 'Florist Name')}</label>
                            <input
                              type="text"
                              value={selectedOrder.floristName}
                              onChange={(e) => handleUpdateOrder({ floristName: e.target.value })}
                              className={`w-full px-3 py-2 rounded-lg border ${
                                theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                              }`}
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-500 mb-1">{t('tools.flowerOrder.floristPhone', 'Florist Phone')}</label>
                            <input
                              type="tel"
                              value={selectedOrder.floristPhone}
                              onChange={(e) => handleUpdateOrder({ floristPhone: e.target.value })}
                              className={`w-full px-3 py-2 rounded-lg border ${
                                theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                              }`}
                            />
                          </div>
                          <div className="col-span-2">
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={selectedOrder.floristConfirmed}
                                onChange={(e) => handleUpdateOrder({ floristConfirmed: e.target.checked })}
                                className="rounded"
                              />
                              <span className="text-sm">{t('tools.flowerOrder.orderConfirmedWithFlorist', 'Order confirmed with florist')}</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'card' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">{t('tools.flowerOrder.cardMessage', 'Card Message')}</label>
                        <textarea
                          value={selectedOrder.cardMessage}
                          onChange={(e) => handleUpdateOrder({ cardMessage: e.target.value })}
                          placeholder={t('tools.flowerOrder.messageToAppearOnThe', 'Message to appear on the card...')}
                          className={`w-full px-3 py-2 rounded-lg border resize-none ${
                            theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                          }`}
                          rows={6}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">{t('tools.flowerOrder.signature', 'Signature')}</label>
                        <input
                          type="text"
                          value={selectedOrder.cardSignature}
                          onChange={(e) => handleUpdateOrder({ cardSignature: e.target.value })}
                          placeholder={t('tools.flowerOrder.eGWithLoveThe', 'e.g., With love, The Smith Family')}
                          className={`w-full px-3 py-2 rounded-lg border ${
                            theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                          }`}
                        />
                      </div>

                      {/* Preview */}
                      {(selectedOrder.cardMessage || selectedOrder.cardSignature) && (
                        <div className={`p-6 rounded-lg border-2 border-dashed ${
                          theme === 'dark' ? 'bg-gray-700 border-gray-500' : 'bg-white border-gray-300'
                        }`}>
                          <p className="text-center text-sm text-gray-500 mb-2">{t('tools.flowerOrder.cardPreview', 'Card Preview')}</p>
                          <div className="text-center italic">
                            <p className="whitespace-pre-wrap">{selectedOrder.cardMessage}</p>
                            {selectedOrder.cardSignature && (
                              <p className="mt-4 font-medium">{selectedOrder.cardSignature}</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <Flower2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">{t('tools.flowerOrder.selectAnOrderToView', 'Select an order to view details')}</p>
                <p className="text-sm mt-1">{t('tools.flowerOrder.orCreateANewOrder', 'or create a new order to get started')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <ConfirmDialog />
    </div>
  );
};

// Arrangement Form
const ArrangementForm: React.FC<{
  onSubmit: (arrangement: FlowerArrangement) => void;
  onCancel: () => void;
  theme: string;
}> = ({ onSubmit, onCancel, theme }) => {
  const [arr, setArr] = useState<FlowerArrangement>(createEmptyArrangement());

  return (
    <div className={`p-4 mb-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
      <h4 className="font-medium mb-3">{t('tools.flowerOrder.newArrangement', 'New Arrangement')}</h4>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-500">{t('tools.flowerOrder.type', 'Type')}</label>
          <select
            value={arr.type}
            onChange={(e) => setArr({ ...arr, type: e.target.value })}
            className={`w-full mt-1 px-3 py-2 rounded border ${
              theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'
            }`}
          >
            {arrangementTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500">{t('tools.flowerOrder.size', 'Size')}</label>
          <select
            value={arr.size}
            onChange={(e) => setArr({ ...arr, size: e.target.value as FlowerArrangement['size'] })}
            className={`w-full mt-1 px-3 py-2 rounded border ${
              theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'
            }`}
          >
            {Object.entries(sizeLabels).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500">{t('tools.flowerOrder.color', 'Color')}</label>
          <input
            type="text"
            value={arr.color}
            onChange={(e) => setArr({ ...arr, color: e.target.value })}
            placeholder={t('tools.flowerOrder.eGWhitePinkMixed', 'e.g., White, Pink, Mixed')}
            className={`w-full mt-1 px-3 py-2 rounded border ${
              theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'
            }`}
          />
        </div>
        <div>
          <label className="text-xs text-gray-500">{t('tools.flowerOrder.price', 'Price')}</label>
          <input
            type="number"
            value={arr.price}
            onChange={(e) => setArr({ ...arr, price: parseFloat(e.target.value) || 0 })}
            className={`w-full mt-1 px-3 py-2 rounded border ${
              theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'
            }`}
          />
        </div>
        <div className="col-span-2">
          <label className="text-xs text-gray-500">{t('tools.flowerOrder.descriptionOptional', 'Description (Optional)')}</label>
          <input
            type="text"
            value={arr.description}
            onChange={(e) => setArr({ ...arr, description: e.target.value })}
            placeholder={t('tools.flowerOrder.additionalDetails', 'Additional details...')}
            className={`w-full mt-1 px-3 py-2 rounded border ${
              theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'
            }`}
          />
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <button onClick={onCancel} className="px-3 py-1.5 text-sm text-gray-500">{t('tools.flowerOrder.cancel', 'Cancel')}</button>
        <button
          onClick={() => arr.price > 0 && onSubmit(arr)}
          className="px-3 py-1.5 text-sm bg-pink-600 text-white rounded hover:bg-pink-700"
        >
          {t('tools.flowerOrder.addArrangement', 'Add Arrangement')}
        </button>
      </div>
    </div>
  );
};

export default FlowerOrderTool;
