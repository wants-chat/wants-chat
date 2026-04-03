'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  Flower2,
  Plus,
  Trash2,
  Save,
  Calendar,
  User,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  Package,
  Palette,
  FileText,
  Phone,
  Mail,
  MapPin,
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

interface FlowerArrangementToolProps {
  uiConfig?: UIConfig;
}

import { useTheme } from '@/contexts/ThemeContext';

// Types
type ArrangementStyle = 'bouquet' | 'centerpiece' | 'wreath' | 'corsage' | 'boutonniere' | 'vase' | 'basket' | 'custom';
type OrderStatus = 'pending' | 'in_progress' | 'ready' | 'delivered' | 'cancelled';
type Occasion = 'wedding' | 'birthday' | 'anniversary' | 'sympathy' | 'congratulations' | 'holiday' | 'everyday' | 'corporate';

interface ArrangementOrder {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  deliveryAddress: string;
  arrangementStyle: ArrangementStyle;
  occasion: Occasion;
  flowers: FlowerItem[];
  colors: string[];
  size: 'small' | 'medium' | 'large' | 'extra-large';
  specialInstructions: string;
  cardMessage: string;
  price: number;
  deposit: number;
  status: OrderStatus;
  orderDate: string;
  deliveryDate: string;
  deliveryTime: string;
  createdAt: string;
  updatedAt: string;
}

interface FlowerItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

// Constants
const ARRANGEMENT_STYLES: { value: ArrangementStyle; label: string }[] = [
  { value: 'bouquet', label: 'Bouquet' },
  { value: 'centerpiece', label: 'Centerpiece' },
  { value: 'wreath', label: 'Wreath' },
  { value: 'corsage', label: 'Corsage' },
  { value: 'boutonniere', label: 'Boutonniere' },
  { value: 'vase', label: 'Vase Arrangement' },
  { value: 'basket', label: 'Basket Arrangement' },
  { value: 'custom', label: 'Custom Design' },
];

const OCCASIONS: { value: Occasion; label: string }[] = [
  { value: 'wedding', label: 'Wedding' },
  { value: 'birthday', label: 'Birthday' },
  { value: 'anniversary', label: 'Anniversary' },
  { value: 'sympathy', label: 'Sympathy' },
  { value: 'congratulations', label: 'Congratulations' },
  { value: 'holiday', label: 'Holiday' },
  { value: 'everyday', label: 'Everyday' },
  { value: 'corporate', label: 'Corporate Event' },
];

const ORDER_STATUSES: { value: OrderStatus; label: string; color: string }[] = [
  { value: 'pending', label: 'Pending', color: 'yellow' },
  { value: 'in_progress', label: 'In Progress', color: 'blue' },
  { value: 'ready', label: 'Ready', color: 'green' },
  { value: 'delivered', label: 'Delivered', color: 'gray' },
  { value: 'cancelled', label: 'Cancelled', color: 'red' },
];

const POPULAR_FLOWERS = [
  { name: 'Roses', unitPrice: 4.50 },
  { name: 'Tulips', unitPrice: 3.00 },
  { name: 'Lilies', unitPrice: 5.00 },
  { name: 'Sunflowers', unitPrice: 4.00 },
  { name: 'Carnations', unitPrice: 2.50 },
  { name: 'Orchids', unitPrice: 8.00 },
  { name: 'Hydrangeas', unitPrice: 6.00 },
  { name: 'Peonies', unitPrice: 7.50 },
  { name: 'Daisies', unitPrice: 2.00 },
  { name: 'Baby\'s Breath', unitPrice: 1.50 },
  { name: 'Eucalyptus', unitPrice: 3.50 },
  { name: 'Greenery', unitPrice: 2.00 },
];

const SIZE_PRICING = {
  small: 1.0,
  medium: 1.5,
  large: 2.0,
  'extra-large': 2.5,
};

// Column configurations for exports
const ORDER_COLUMNS: ColumnConfig[] = [
  { key: 'customerName', header: 'Customer', type: 'string' },
  { key: 'customerPhone', header: 'Phone', type: 'string' },
  { key: 'arrangementStyle', header: 'Style', type: 'string' },
  { key: 'occasion', header: 'Occasion', type: 'string' },
  { key: 'size', header: 'Size', type: 'string' },
  { key: 'price', header: 'Price', type: 'currency' },
  { key: 'deposit', header: 'Deposit', type: 'currency' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'orderDate', header: 'Order Date', type: 'date' },
  { key: 'deliveryDate', header: 'Delivery Date', type: 'date' },
  { key: 'deliveryTime', header: 'Delivery Time', type: 'string' },
];

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Main Component
export const FlowerArrangementTool: React.FC<FlowerArrangementToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const [isPrefilled, setIsPrefilled] = useState(false);
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // useToolData hook for backend sync
  const {
    data: orders,
    addItem: addOrderToBackend,
    updateItem: updateOrderBackend,
    deleteItem: deleteOrderBackend,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<ArrangementOrder>('florist-arrangements', [], ORDER_COLUMNS);

  // Local UI State
  const [activeTab, setActiveTab] = useState<'orders' | 'new-order'>('orders');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterOccasion, setFilterOccasion] = useState<string>('all');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // New order form state
  const [newOrder, setNewOrder] = useState<Partial<ArrangementOrder>>({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    deliveryAddress: '',
    arrangementStyle: 'bouquet',
    occasion: 'everyday',
    flowers: [],
    colors: [],
    size: 'medium',
    specialInstructions: '',
    cardMessage: '',
    price: 0,
    deposit: 0,
    status: 'pending',
    orderDate: new Date().toISOString().split('T')[0],
    deliveryDate: '',
    deliveryTime: '',
  });

  const [newFlower, setNewFlower] = useState({ name: '', quantity: 1, unitPrice: 0 });
  const [newColor, setNewColor] = useState('');

  // Prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params;
      if (params.customerName || params.customer || params.client) {
        setNewOrder((prev) => ({
          ...prev,
          customerName: params.customerName || params.customer || params.client || '',
          customerPhone: params.phone || params.customerPhone || '',
          customerEmail: params.email || params.customerEmail || '',
          deliveryAddress: params.address || params.deliveryAddress || '',
          occasion: params.occasion || 'everyday',
          arrangementStyle: params.style || params.arrangementStyle || 'bouquet',
        }));
        setActiveTab('new-order');
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Calculate order price
  const calculateOrderPrice = useMemo(() => {
    const flowersTotal = newOrder.flowers?.reduce((sum, flower) => {
      return sum + (flower.quantity * flower.unitPrice);
    }, 0) || 0;

    const sizeMultiplier = SIZE_PRICING[newOrder.size || 'medium'];
    const basePrice = flowersTotal * sizeMultiplier;

    // Add arrangement fee based on style
    let arrangementFee = 15; // Base fee
    if (newOrder.arrangementStyle === 'wreath') arrangementFee = 30;
    if (newOrder.arrangementStyle === 'custom') arrangementFee = 50;
    if (newOrder.arrangementStyle === 'centerpiece') arrangementFee = 25;

    return basePrice + arrangementFee;
  }, [newOrder.flowers, newOrder.size, newOrder.arrangementStyle]);

  // Add flower to order
  const addFlowerToOrder = () => {
    if (!newFlower.name || newFlower.quantity < 1) return;

    const flower: FlowerItem = {
      id: generateId(),
      name: newFlower.name,
      quantity: newFlower.quantity,
      unitPrice: newFlower.unitPrice,
    };

    setNewOrder((prev) => ({
      ...prev,
      flowers: [...(prev.flowers || []), flower],
    }));

    setNewFlower({ name: '', quantity: 1, unitPrice: 0 });
  };

  // Remove flower from order
  const removeFlowerFromOrder = (flowerId: string) => {
    setNewOrder((prev) => ({
      ...prev,
      flowers: prev.flowers?.filter((f) => f.id !== flowerId) || [],
    }));
  };

  // Add color
  const addColor = () => {
    if (!newColor || newOrder.colors?.includes(newColor)) return;
    setNewOrder((prev) => ({
      ...prev,
      colors: [...(prev.colors || []), newColor],
    }));
    setNewColor('');
  };

  // Remove color
  const removeColor = (color: string) => {
    setNewOrder((prev) => ({
      ...prev,
      colors: prev.colors?.filter((c) => c !== color) || [],
    }));
  };

  // Submit new order
  const submitOrder = () => {
    if (!newOrder.customerName || !newOrder.deliveryDate) {
      setValidationMessage('Please fill in customer name and delivery date');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const order: ArrangementOrder = {
      id: generateId(),
      customerName: newOrder.customerName || '',
      customerPhone: newOrder.customerPhone || '',
      customerEmail: newOrder.customerEmail || '',
      deliveryAddress: newOrder.deliveryAddress || '',
      arrangementStyle: newOrder.arrangementStyle || 'bouquet',
      occasion: newOrder.occasion || 'everyday',
      flowers: newOrder.flowers || [],
      colors: newOrder.colors || [],
      size: newOrder.size || 'medium',
      specialInstructions: newOrder.specialInstructions || '',
      cardMessage: newOrder.cardMessage || '',
      price: calculateOrderPrice,
      deposit: newOrder.deposit || 0,
      status: 'pending',
      orderDate: newOrder.orderDate || new Date().toISOString(),
      deliveryDate: newOrder.deliveryDate || '',
      deliveryTime: newOrder.deliveryTime || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addOrderToBackend(order);

    // Reset form
    setNewOrder({
      customerName: '',
      customerPhone: '',
      customerEmail: '',
      deliveryAddress: '',
      arrangementStyle: 'bouquet',
      occasion: 'everyday',
      flowers: [],
      colors: [],
      size: 'medium',
      specialInstructions: '',
      cardMessage: '',
      price: 0,
      deposit: 0,
      status: 'pending',
      orderDate: new Date().toISOString().split('T')[0],
      deliveryDate: '',
      deliveryTime: '',
    });

    setActiveTab('orders');
  };

  // Update order status
  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    updateOrderBackend(orderId, { status, updatedAt: new Date().toISOString() });
  };

  // Delete order
  const deleteOrder = async (orderId: string) => {
    const confirmed = await confirm({
      title: 'Confirm',
      message: 'Are you sure you want to delete this order?',
      confirmText: 'Yes',
      cancelText: 'Cancel',
      variant: 'danger'
    });
    if (confirmed) {
      deleteOrderBackend(orderId);
    }
  };

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        searchTerm === '' ||
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerPhone.includes(searchTerm);
      const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
      const matchesOccasion = filterOccasion === 'all' || order.occasion === filterOccasion;
      return matchesSearch && matchesStatus && matchesOccasion;
    });
  }, [orders, searchTerm, filterStatus, filterOccasion]);

  // Statistics
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayOrders = orders.filter((o) => o.deliveryDate === today);
    const pendingOrders = orders.filter((o) => o.status === 'pending' || o.status === 'in_progress');
    const totalRevenue = orders.filter((o) => o.status === 'delivered').reduce((sum, o) => sum + o.price, 0);

    return {
      totalOrders: orders.length,
      todayDeliveries: todayOrders.length,
      pendingOrders: pendingOrders.length,
      totalRevenue,
    };
  }, [orders]);

  const getStatusColor = (status: OrderStatus) => {
    const statusConfig = ORDER_STATUSES.find((s) => s.value === status);
    const colorMap: Record<string, string> = {
      yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      green: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      gray: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      red: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    };
    return colorMap[statusConfig?.color || 'gray'];
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Validation Message Toast */}
        {validationMessage && (
          <div className="fixed top-4 left-4 right-4 max-w-md z-50">
            <div className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg ${
              theme === 'dark'
                ? 'bg-red-900/30 border border-red-500/50 text-red-400'
                : 'bg-red-100 border border-red-300 text-red-700'
            }`}>
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>{validationMessage}</p>
            </div>
          </div>
        )}

        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-pink-500/10 rounded-xl border border-pink-500/20">
            <Sparkles className="w-4 h-4 text-pink-500" />
            <span className="text-sm text-pink-500 font-medium">{t('tools.flowerArrangement.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-pink-500 rounded-lg">
                <Flower2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.flowerArrangement.flowerArrangementOrders', 'Flower Arrangement Orders')}
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.flowerArrangement.manageCustomFloralArrangementOrders', 'Manage custom floral arrangement orders')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="flower-arrangement" toolName="Flower Arrangement" />

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
                onExportCSV={() => exportToCSV(orders, ORDER_COLUMNS, { filename: 'flower-arrangements' })}
                onExportExcel={() => exportToExcel(orders, ORDER_COLUMNS, { filename: 'flower-arrangements' })}
                onExportJSON={() => exportToJSON(orders, { filename: 'flower-arrangements' })}
                onExportPDF={async () => {
                  await exportToPDF(orders, ORDER_COLUMNS, {
                    filename: 'flower-arrangements',
                    title: 'Flower Arrangement Orders',
                    subtitle: `${orders.length} orders`,
                  });
                }}
                onPrint={() => printData(orders, ORDER_COLUMNS, { title: 'Flower Arrangement Orders' })}
                onCopyToClipboard={async () => await copyUtil(orders, ORDER_COLUMNS, 'tab')}
                showImport={false}
                theme={theme}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.flowerArrangement.totalOrders', 'Total Orders')}</p>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stats.totalOrders}</p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.flowerArrangement.todaySDeliveries', 'Today\'s Deliveries')}</p>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stats.todayDeliveries}</p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.flowerArrangement.pending', 'Pending')}</p>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stats.pendingOrders}</p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.flowerArrangement.revenue', 'Revenue')}</p>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(stats.totalRevenue)}</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'orders', label: 'Orders', icon: <Package className="w-4 h-4" /> },
              { id: 'new-order', label: 'New Order', icon: <Plus className="w-4 h-4" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-pink-500 text-white'
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

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                  <input
                    type="text"
                    placeholder={t('tools.flowerArrangement.searchByCustomerNameOr', 'Search by customer name or phone...')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>
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
                <option value="all">{t('tools.flowerArrangement.allStatuses', 'All Statuses')}</option>
                {ORDER_STATUSES.map((status) => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
              <select
                value={filterOccasion}
                onChange={(e) => setFilterOccasion(e.target.value)}
                className={`px-4 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="all">{t('tools.flowerArrangement.allOccasions', 'All Occasions')}</option>
                {OCCASIONS.map((occasion) => (
                  <option key={occasion.value} value={occasion.value}>{occasion.label}</option>
                ))}
              </select>
            </div>

            {/* Orders List */}
            <div className="space-y-4">
              {filteredOrders.length === 0 ? (
                <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Flower2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{t('tools.flowerArrangement.noOrdersFound', 'No orders found')}</p>
                </div>
              ) : (
                filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className={`border rounded-lg overflow-hidden ${
                      theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                    }`}
                  >
                    <div
                      className={`p-4 cursor-pointer ${theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}`}
                      onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg">
                            <Flower2 className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                          </div>
                          <div>
                            <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {order.customerName}
                            </h3>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {ARRANGEMENT_STYLES.find((s) => s.value === order.arrangementStyle)?.label} - {order.size}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {formatCurrency(order.price)}
                            </p>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              Delivery: {formatDate(order.deliveryDate)}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {ORDER_STATUSES.find((s) => s.value === order.status)?.label}
                          </span>
                          {expandedOrderId === order.id ? (
                            <ChevronUp className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                          ) : (
                            <ChevronDown className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {expandedOrderId === order.id && (
                      <div className={`p-4 border-t ${theme === 'dark' ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-gray-50'}`}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.flowerArrangement.contact', 'Contact')}</p>
                            <p className={`flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              <Phone className="w-4 h-4" /> {order.customerPhone || 'N/A'}
                            </p>
                            <p className={`flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              <Mail className="w-4 h-4" /> {order.customerEmail || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.flowerArrangement.delivery', 'Delivery')}</p>
                            <p className={`flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              <MapPin className="w-4 h-4" /> {order.deliveryAddress || 'Pickup'}
                            </p>
                            <p className={`flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              <Clock className="w-4 h-4" /> {order.deliveryTime || 'Anytime'}
                            </p>
                          </div>
                          <div>
                            <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.flowerArrangement.occasion', 'Occasion')}</p>
                            <p className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {OCCASIONS.find((o) => o.value === order.occasion)?.label}
                            </p>
                          </div>
                        </div>

                        {/* Flowers */}
                        {order.flowers.length > 0 && (
                          <div className="mb-4">
                            <p className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.flowerArrangement.flowers', 'Flowers')}</p>
                            <div className="flex flex-wrap gap-2">
                              {order.flowers.map((flower) => (
                                <span
                                  key={flower.id}
                                  className={`px-3 py-1 rounded-full text-sm ${
                                    theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'
                                  }`}
                                >
                                  {flower.name} x{flower.quantity}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Colors */}
                        {order.colors.length > 0 && (
                          <div className="mb-4">
                            <p className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.flowerArrangement.colors', 'Colors')}</p>
                            <div className="flex flex-wrap gap-2">
                              {order.colors.map((color) => (
                                <span
                                  key={color}
                                  className="px-3 py-1 rounded-full text-sm"
                                  style={{ backgroundColor: color, color: '#fff', textShadow: '0 0 2px rgba(0,0,0,0.5)' }}
                                >
                                  {color}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Special Instructions */}
                        {order.specialInstructions && (
                          <div className="mb-4">
                            <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.flowerArrangement.specialInstructions', 'Special Instructions')}</p>
                            <p className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{order.specialInstructions}</p>
                          </div>
                        )}

                        {/* Card Message */}
                        {order.cardMessage && (
                          <div className="mb-4">
                            <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.flowerArrangement.cardMessage', 'Card Message')}</p>
                            <p className={`italic ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>"{order.cardMessage}"</p>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-wrap gap-2 mt-4">
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                            className={`px-3 py-1 rounded-lg text-sm border ${
                              theme === 'dark'
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          >
                            {ORDER_STATUSES.map((status) => (
                              <option key={status.value} value={status.value}>{status.label}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => deleteOrder(order.id)}
                            className="px-3 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-lg text-sm hover:bg-red-200 dark:hover:bg-red-900/50 flex items-center gap-1"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* New Order Tab */}
        {activeTab === 'new-order' && (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <h2 className={`text-xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.flowerArrangement.createNewOrder', 'Create New Order')}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Customer Info */}
              <div className="space-y-4">
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.flowerArrangement.customerInformation', 'Customer Information')}
                </h3>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.flowerArrangement.customerName', 'Customer Name *')}
                  </label>
                  <input
                    type="text"
                    value={newOrder.customerName}
                    onChange={(e) => setNewOrder({ ...newOrder, customerName: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.flowerArrangement.phone', 'Phone')}
                  </label>
                  <input
                    type="tel"
                    value={newOrder.customerPhone}
                    onChange={(e) => setNewOrder({ ...newOrder, customerPhone: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.flowerArrangement.email', 'Email')}
                  </label>
                  <input
                    type="email"
                    value={newOrder.customerEmail}
                    onChange={(e) => setNewOrder({ ...newOrder, customerEmail: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.flowerArrangement.deliveryAddress', 'Delivery Address')}
                  </label>
                  <textarea
                    value={newOrder.deliveryAddress}
                    onChange={(e) => setNewOrder({ ...newOrder, deliveryAddress: e.target.value })}
                    rows={2}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>

              {/* Arrangement Details */}
              <div className="space-y-4">
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.flowerArrangement.arrangementDetails', 'Arrangement Details')}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.flowerArrangement.style', 'Style')}
                    </label>
                    <select
                      value={newOrder.arrangementStyle}
                      onChange={(e) => setNewOrder({ ...newOrder, arrangementStyle: e.target.value as ArrangementStyle })}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      {ARRANGEMENT_STYLES.map((style) => (
                        <option key={style.value} value={style.value}>{style.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.flowerArrangement.size', 'Size')}
                    </label>
                    <select
                      value={newOrder.size}
                      onChange={(e) => setNewOrder({ ...newOrder, size: e.target.value as 'small' | 'medium' | 'large' | 'extra-large' })}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="small">{t('tools.flowerArrangement.small', 'Small')}</option>
                      <option value="medium">{t('tools.flowerArrangement.medium', 'Medium')}</option>
                      <option value="large">{t('tools.flowerArrangement.large', 'Large')}</option>
                      <option value="extra-large">{t('tools.flowerArrangement.extraLarge', 'Extra Large')}</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.flowerArrangement.occasion2', 'Occasion')}
                  </label>
                  <select
                    value={newOrder.occasion}
                    onChange={(e) => setNewOrder({ ...newOrder, occasion: e.target.value as Occasion })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    {OCCASIONS.map((occasion) => (
                      <option key={occasion.value} value={occasion.value}>{occasion.label}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.flowerArrangement.deliveryDate', 'Delivery Date *')}
                    </label>
                    <input
                      type="date"
                      value={newOrder.deliveryDate}
                      onChange={(e) => setNewOrder({ ...newOrder, deliveryDate: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.flowerArrangement.deliveryTime', 'Delivery Time')}
                    </label>
                    <input
                      type="time"
                      value={newOrder.deliveryTime}
                      onChange={(e) => setNewOrder({ ...newOrder, deliveryTime: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Flowers Selection */}
            <div className="mt-6">
              <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.flowerArrangement.flowers2', 'Flowers')}
              </h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {POPULAR_FLOWERS.map((flower) => (
                  <button
                    key={flower.name}
                    onClick={() => setNewFlower({ name: flower.name, quantity: 1, unitPrice: flower.unitPrice })}
                    className={`px-3 py-1 rounded-full text-sm ${
                      newFlower.name === flower.name
                        ? 'bg-pink-500 text-white'
                        : theme === 'dark'
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {flower.name} ({formatCurrency(flower.unitPrice)})
                  </button>
                ))}
              </div>
              <div className="flex gap-4 items-end mb-4">
                <div className="flex-1">
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.flowerArrangement.flowerName', 'Flower Name')}
                  </label>
                  <input
                    type="text"
                    value={newFlower.name}
                    onChange={(e) => setNewFlower({ ...newFlower, name: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div className="w-24">
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.flowerArrangement.qty', 'Qty')}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newFlower.quantity}
                    onChange={(e) => setNewFlower({ ...newFlower, quantity: parseInt(e.target.value) || 1 })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div className="w-28">
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.flowerArrangement.price', 'Price')}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newFlower.unitPrice}
                    onChange={(e) => setNewFlower({ ...newFlower, unitPrice: parseFloat(e.target.value) || 0 })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <button
                  onClick={addFlowerToOrder}
                  className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.flowerArrangement.add', 'Add')}
                </button>
              </div>

              {/* Selected Flowers */}
              {newOrder.flowers && newOrder.flowers.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {newOrder.flowers.map((flower) => (
                    <span
                      key={flower.id}
                      className={`px-3 py-1 rounded-full text-sm flex items-center gap-2 ${
                        theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'
                      }`}
                    >
                      {flower.name} x{flower.quantity} ({formatCurrency(flower.quantity * flower.unitPrice)})
                      <button
                        onClick={() => removeFlowerFromOrder(flower.id)}
                        className="hover:text-red-500"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Colors */}
            <div className="mt-6">
              <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.flowerArrangement.colorPreferences', 'Color Preferences')}
              </h3>
              <div className="flex gap-4 items-end mb-4">
                <div className="flex-1">
                  <input
                    type="color"
                    value={newColor || '#ff69b4'}
                    onChange={(e) => setNewColor(e.target.value)}
                    className="w-12 h-10 rounded cursor-pointer"
                  />
                </div>
                <button
                  onClick={addColor}
                  className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.flowerArrangement.addColor', 'Add Color')}
                </button>
              </div>
              {newOrder.colors && newOrder.colors.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {newOrder.colors.map((color) => (
                    <span
                      key={color}
                      className="px-3 py-1 rounded-full text-sm flex items-center gap-2 text-white"
                      style={{ backgroundColor: color }}
                    >
                      {color}
                      <button onClick={() => removeColor(color)} className="hover:text-gray-200">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Additional Details */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.flowerArrangement.specialInstructions2', 'Special Instructions')}
                </label>
                <textarea
                  value={newOrder.specialInstructions}
                  onChange={(e) => setNewOrder({ ...newOrder, specialInstructions: e.target.value })}
                  rows={3}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder={t('tools.flowerArrangement.anySpecialRequestsOrNotes', 'Any special requests or notes...')}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.flowerArrangement.cardMessage2', 'Card Message')}
                </label>
                <textarea
                  value={newOrder.cardMessage}
                  onChange={(e) => setNewOrder({ ...newOrder, cardMessage: e.target.value })}
                  rows={3}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder={t('tools.flowerArrangement.messageToIncludeWithThe', 'Message to include with the arrangement...')}
                />
              </div>
            </div>

            {/* Deposit */}
            <div className="mt-6">
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.flowerArrangement.depositAmount', 'Deposit Amount')}
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={newOrder.deposit}
                onChange={(e) => setNewOrder({ ...newOrder, deposit: parseFloat(e.target.value) || 0 })}
                className={`w-48 px-4 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>

            {/* Price Summary */}
            <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className="flex justify-between items-center">
                <span className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.flowerArrangement.estimatedTotal', 'Estimated Total:')}
                </span>
                <span className={`text-2xl font-bold text-pink-500`}>
                  {formatCurrency(calculateOrderPrice)}
                </span>
              </div>
              {newOrder.deposit && newOrder.deposit > 0 && (
                <div className="flex justify-between items-center mt-2">
                  <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.flowerArrangement.balanceDue', 'Balance Due:')}
                  </span>
                  <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {formatCurrency(calculateOrderPrice - (newOrder.deposit || 0))}
                  </span>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="mt-6">
              <button
                onClick={submitOrder}
                className="w-full px-6 py-3 bg-pink-500 text-white rounded-lg font-semibold hover:bg-pink-600 flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                {t('tools.flowerArrangement.createOrder', 'Create Order')}
              </button>
            </div>
          </div>
        )}
      </div>
      <ConfirmDialog />
    </div>
  );
};

export default FlowerArrangementTool;
