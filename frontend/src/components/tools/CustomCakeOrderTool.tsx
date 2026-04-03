'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  Cake,
  Plus,
  Trash2,
  Calendar,
  User,
  Phone,
  Mail,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Image,
  Palette,
  Layers,
  Star,
  FileText,
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
import { useTheme } from '@/contexts/ThemeContext';

interface CustomCakeOrderToolProps {
  uiConfig?: UIConfig;
}

// Types
type OrderStatus = 'pending' | 'confirmed' | 'in_progress' | 'ready' | 'delivered' | 'cancelled';
type CakeSize = '6inch' | '8inch' | '10inch' | '12inch' | 'tiered_2' | 'tiered_3' | 'sheet_quarter' | 'sheet_half' | 'sheet_full';
type CakeFlavor = 'vanilla' | 'chocolate' | 'red_velvet' | 'carrot' | 'lemon' | 'marble' | 'funfetti' | 'strawberry' | 'coconut' | 'custom';
type FillingType = 'buttercream' | 'cream_cheese' | 'ganache' | 'fruit' | 'mousse' | 'custard' | 'none';
type FrostingType = 'buttercream' | 'fondant' | 'whipped_cream' | 'cream_cheese' | 'ganache' | 'naked';

interface CakeOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  pickupDate: string;
  pickupTime: string;
  cakeSize: CakeSize;
  cakeFlavor: CakeFlavor;
  customFlavor?: string;
  filling: FillingType;
  frosting: FrostingType;
  decorationTheme: string;
  colorScheme: string;
  inscription: string;
  specialInstructions: string;
  imageReference?: string;
  servings: number;
  basePrice: number;
  decorationFee: number;
  rushFee: number;
  totalPrice: number;
  depositPaid: number;
  balanceDue: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  notes: string;
}

// Constants
const CAKE_SIZES: { value: CakeSize; label: string; servings: number; basePrice: number }[] = [
  { value: '6inch', label: '6" Round', servings: 12, basePrice: 45 },
  { value: '8inch', label: '8" Round', servings: 24, basePrice: 65 },
  { value: '10inch', label: '10" Round', servings: 38, basePrice: 85 },
  { value: '12inch', label: '12" Round', servings: 56, basePrice: 110 },
  { value: 'tiered_2', label: '2-Tier (6" + 8")', servings: 36, basePrice: 150 },
  { value: 'tiered_3', label: '3-Tier (6" + 8" + 10")', servings: 74, basePrice: 250 },
  { value: 'sheet_quarter', label: 'Quarter Sheet', servings: 24, basePrice: 55 },
  { value: 'sheet_half', label: 'Half Sheet', servings: 48, basePrice: 85 },
  { value: 'sheet_full', label: 'Full Sheet', servings: 96, basePrice: 140 },
];

const CAKE_FLAVORS: { value: CakeFlavor; label: string; upcharge: number }[] = [
  { value: 'vanilla', label: 'Vanilla', upcharge: 0 },
  { value: 'chocolate', label: 'Chocolate', upcharge: 0 },
  { value: 'red_velvet', label: 'Red Velvet', upcharge: 10 },
  { value: 'carrot', label: 'Carrot', upcharge: 10 },
  { value: 'lemon', label: 'Lemon', upcharge: 5 },
  { value: 'marble', label: 'Marble', upcharge: 5 },
  { value: 'funfetti', label: 'Funfetti', upcharge: 5 },
  { value: 'strawberry', label: 'Strawberry', upcharge: 8 },
  { value: 'coconut', label: 'Coconut', upcharge: 10 },
  { value: 'custom', label: 'Custom Flavor', upcharge: 15 },
];

const FILLING_TYPES: { value: FillingType; label: string; upcharge: number }[] = [
  { value: 'none', label: 'No Filling', upcharge: 0 },
  { value: 'buttercream', label: 'Buttercream', upcharge: 0 },
  { value: 'cream_cheese', label: 'Cream Cheese', upcharge: 5 },
  { value: 'ganache', label: 'Chocolate Ganache', upcharge: 10 },
  { value: 'fruit', label: 'Fresh Fruit', upcharge: 15 },
  { value: 'mousse', label: 'Mousse', upcharge: 12 },
  { value: 'custard', label: 'Custard', upcharge: 10 },
];

const FROSTING_TYPES: { value: FrostingType; label: string; upcharge: number }[] = [
  { value: 'buttercream', label: 'Buttercream', upcharge: 0 },
  { value: 'fondant', label: 'Fondant', upcharge: 25 },
  { value: 'whipped_cream', label: 'Whipped Cream', upcharge: 5 },
  { value: 'cream_cheese', label: 'Cream Cheese', upcharge: 8 },
  { value: 'ganache', label: 'Ganache', upcharge: 15 },
  { value: 'naked', label: 'Naked/Semi-Naked', upcharge: 0 },
];

const ORDER_STATUSES: { value: OrderStatus; label: string; color: string }[] = [
  { value: 'pending', label: 'Pending', color: 'yellow' },
  { value: 'confirmed', label: 'Confirmed', color: 'blue' },
  { value: 'in_progress', label: 'In Progress', color: 'purple' },
  { value: 'ready', label: 'Ready', color: 'green' },
  { value: 'delivered', label: 'Delivered', color: 'gray' },
  { value: 'cancelled', label: 'Cancelled', color: 'red' },
];

// Column configuration for exports
const ORDER_COLUMNS: ColumnConfig[] = [
  { key: 'orderNumber', header: 'Order #', type: 'string' },
  { key: 'customerName', header: 'Customer', type: 'string' },
  { key: 'customerPhone', header: 'Phone', type: 'string' },
  { key: 'pickupDate', header: 'Pickup Date', type: 'date' },
  { key: 'pickupTime', header: 'Pickup Time', type: 'string' },
  { key: 'cakeSize', header: 'Size', type: 'string' },
  { key: 'cakeFlavor', header: 'Flavor', type: 'string' },
  { key: 'decorationTheme', header: 'Theme', type: 'string' },
  { key: 'totalPrice', header: 'Total', type: 'currency' },
  { key: 'depositPaid', header: 'Deposit', type: 'currency' },
  { key: 'balanceDue', header: 'Balance', type: 'currency' },
  { key: 'status', header: 'Status', type: 'string' },
];

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);
const generateOrderNumber = () => `CK-${Date.now().toString(36).toUpperCase()}`;

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

// Main Component
export const CustomCakeOrderTool: React.FC<CustomCakeOrderToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [isPrefilled, setIsPrefilled] = useState(false);
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
  } = useToolData<CakeOrder>('bakery-cake-orders', [], ORDER_COLUMNS);

  // Local UI State
  const [activeTab, setActiveTab] = useState<'orders' | 'new' | 'calendar'>('orders');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // New order form state
  const [newOrder, setNewOrder] = useState<Partial<CakeOrder>>({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    pickupDate: '',
    pickupTime: '',
    cakeSize: '8inch',
    cakeFlavor: 'vanilla',
    filling: 'buttercream',
    frosting: 'buttercream',
    decorationTheme: '',
    colorScheme: '',
    inscription: '',
    specialInstructions: '',
    depositPaid: 0,
    notes: '',
  });

  // Calculate price based on selections
  const calculatePrice = (order: Partial<CakeOrder>) => {
    const size = CAKE_SIZES.find(s => s.value === order.cakeSize);
    const flavor = CAKE_FLAVORS.find(f => f.value === order.cakeFlavor);
    const filling = FILLING_TYPES.find(f => f.value === order.filling);
    const frosting = FROSTING_TYPES.find(f => f.value === order.frosting);

    const basePrice = size?.basePrice || 0;
    const flavorUpcharge = flavor?.upcharge || 0;
    const fillingUpcharge = filling?.upcharge || 0;
    const frostingUpcharge = frosting?.upcharge || 0;

    // Rush fee if order is within 48 hours
    let rushFee = 0;
    if (order.pickupDate) {
      const pickupDate = new Date(order.pickupDate);
      const now = new Date();
      const hoursUntilPickup = (pickupDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      if (hoursUntilPickup < 48) {
        rushFee = basePrice * 0.25; // 25% rush fee
      }
    }

    // Decoration fee based on complexity (simplified)
    const decorationFee = order.decorationTheme ? 20 : 0;

    const totalPrice = basePrice + flavorUpcharge + fillingUpcharge + frostingUpcharge + rushFee + decorationFee;
    const servings = size?.servings || 0;

    return { basePrice, decorationFee, rushFee, totalPrice, servings };
  };

  // Add new order
  const addOrder = () => {
    if (!newOrder.customerName || !newOrder.pickupDate || !newOrder.pickupTime) {
      setValidationMessage('Please fill in customer name, pickup date, and pickup time');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const pricing = calculatePrice(newOrder);

    const order: CakeOrder = {
      id: generateId(),
      orderNumber: generateOrderNumber(),
      customerName: newOrder.customerName || '',
      customerEmail: newOrder.customerEmail || '',
      customerPhone: newOrder.customerPhone || '',
      pickupDate: newOrder.pickupDate || '',
      pickupTime: newOrder.pickupTime || '',
      cakeSize: newOrder.cakeSize || '8inch',
      cakeFlavor: newOrder.cakeFlavor || 'vanilla',
      customFlavor: newOrder.customFlavor,
      filling: newOrder.filling || 'buttercream',
      frosting: newOrder.frosting || 'buttercream',
      decorationTheme: newOrder.decorationTheme || '',
      colorScheme: newOrder.colorScheme || '',
      inscription: newOrder.inscription || '',
      specialInstructions: newOrder.specialInstructions || '',
      servings: pricing.servings,
      basePrice: pricing.basePrice,
      decorationFee: pricing.decorationFee,
      rushFee: pricing.rushFee,
      totalPrice: pricing.totalPrice,
      depositPaid: newOrder.depositPaid || 0,
      balanceDue: pricing.totalPrice - (newOrder.depositPaid || 0),
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: newOrder.notes || '',
    };

    addOrderToBackend(order);
    setActiveTab('orders');
    setNewOrder({
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      pickupDate: '',
      pickupTime: '',
      cakeSize: '8inch',
      cakeFlavor: 'vanilla',
      filling: 'buttercream',
      frosting: 'buttercream',
      decorationTheme: '',
      colorScheme: '',
      inscription: '',
      specialInstructions: '',
      depositPaid: 0,
      notes: '',
    });
  };

  // Update order status
  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    updateOrderBackend(orderId, { status, updatedAt: new Date().toISOString() });
  };

  // Delete order
  const deleteOrder = async (orderId: string) => {
    const confirmed = await confirm({
      title: 'Delete Order',
      message: 'Are you sure you want to delete this order? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
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
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.decorationTheme.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, filterStatus]);

  // Orders by status for summary
  const ordersSummary = useMemo(() => {
    const pending = orders.filter(o => o.status === 'pending').length;
    const confirmed = orders.filter(o => o.status === 'confirmed').length;
    const inProgress = orders.filter(o => o.status === 'in_progress').length;
    const ready = orders.filter(o => o.status === 'ready').length;
    const totalRevenue = orders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + o.totalPrice, 0);
    const pendingBalance = orders.filter(o => o.status !== 'cancelled' && o.status !== 'delivered').reduce((sum, o) => sum + o.balanceDue, 0);

    return { pending, confirmed, inProgress, ready, totalRevenue, pendingBalance };
  }, [orders]);

  // Upcoming orders (next 7 days)
  const upcomingOrders = useMemo(() => {
    const now = new Date();
    const weekFromNow = new Date();
    weekFromNow.setDate(weekFromNow.getDate() + 7);

    return orders.filter((order) => {
      const pickupDate = new Date(order.pickupDate);
      return pickupDate >= now && pickupDate <= weekFromNow && order.status !== 'cancelled' && order.status !== 'delivered';
    }).sort((a, b) => new Date(a.pickupDate).getTime() - new Date(b.pickupDate).getTime());
  }, [orders]);

  const getStatusColor = (status: OrderStatus) => {
    const statusInfo = ORDER_STATUSES.find(s => s.value === status);
    const colors = {
      yellow: theme === 'dark' ? 'bg-yellow-900/30 text-yellow-400 border-yellow-700' : 'bg-yellow-100 text-yellow-800 border-yellow-300',
      blue: theme === 'dark' ? 'bg-blue-900/30 text-blue-400 border-blue-700' : 'bg-blue-100 text-blue-800 border-blue-300',
      purple: theme === 'dark' ? 'bg-purple-900/30 text-purple-400 border-purple-700' : 'bg-purple-100 text-purple-800 border-purple-300',
      green: theme === 'dark' ? 'bg-green-900/30 text-green-400 border-green-700' : 'bg-green-100 text-green-800 border-green-300',
      gray: theme === 'dark' ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-100 text-gray-800 border-gray-300',
      red: theme === 'dark' ? 'bg-red-900/30 text-red-400 border-red-700' : 'bg-red-100 text-red-800 border-red-300',
    };
    return colors[statusInfo?.color as keyof typeof colors] || colors.gray;
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.customCakeOrder.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <Cake className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.customCakeOrder.customCakeOrderManager', 'Custom Cake Order Manager')}
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.customCakeOrder.manageCustomCakeOrdersTrack', 'Manage custom cake orders, track production, and handle payments')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="custom-cake-order" toolName="Custom Cake Order" />

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
                onExportCSV={() => exportToCSV(orders, ORDER_COLUMNS, { filename: 'cake-orders' })}
                onExportExcel={() => exportToExcel(orders, ORDER_COLUMNS, { filename: 'cake-orders' })}
                onExportJSON={() => exportToJSON(orders, { filename: 'cake-orders' })}
                onExportPDF={async () => {
                  await exportToPDF(orders, ORDER_COLUMNS, {
                    filename: 'cake-orders',
                    title: 'Custom Cake Orders Report',
                    subtitle: `${orders.length} total orders`,
                  });
                }}
                onPrint={() => printData(orders, ORDER_COLUMNS, { title: 'Cake Orders' })}
                onCopyToClipboard={async () => await copyUtil(orders, ORDER_COLUMNS, 'tab')}
                showImport={false}
                theme={theme}
              />
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-4">
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{ordersSummary.pending}</div>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.customCakeOrder.pending', 'Pending')}</div>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{ordersSummary.confirmed}</div>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.customCakeOrder.confirmed', 'Confirmed')}</div>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{ordersSummary.inProgress}</div>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.customCakeOrder.inProgress', 'In Progress')}</div>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{ordersSummary.ready}</div>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.customCakeOrder.ready', 'Ready')}</div>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className={`text-2xl font-bold text-green-500`}>{formatCurrency(ordersSummary.totalRevenue)}</div>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.customCakeOrder.revenue', 'Revenue')}</div>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className={`text-2xl font-bold text-orange-500`}>{formatCurrency(ordersSummary.pendingBalance)}</div>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.customCakeOrder.balanceDue', 'Balance Due')}</div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'orders', label: 'All Orders', icon: <FileText className="w-4 h-4" /> },
              { id: 'new', label: 'New Order', icon: <Plus className="w-4 h-4" /> },
              { id: 'calendar', label: 'Upcoming', icon: <Calendar className="w-4 h-4" /> },
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

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            {/* Search and Filter */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                  <input
                    type="text"
                    placeholder={t('tools.customCakeOrder.searchByCustomerOrderOr', 'Search by customer, order #, or theme...')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className={`px-4 py-2 rounded-lg border ${
                  theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="all">{t('tools.customCakeOrder.allStatuses', 'All Statuses')}</option>
                {ORDER_STATUSES.map((status) => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>

            {/* Orders List */}
            <div className="space-y-4">
              {filteredOrders.length === 0 ? (
                <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Cake className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{t('tools.customCakeOrder.noOrdersFound', 'No orders found')}</p>
                </div>
              ) : (
                filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className={`border rounded-lg ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}
                  >
                    <div
                      className={`p-4 cursor-pointer ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
                      onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div>
                            <div className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {order.orderNumber}
                            </div>
                            <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {order.customerName}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {formatDate(order.pickupDate)} at {order.pickupTime}
                            </div>
                            <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {formatCurrency(order.totalPrice)}
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                            {ORDER_STATUSES.find(s => s.value === order.status)?.label}
                          </span>
                          {expandedOrderId === order.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </div>
                      </div>
                    </div>

                    {expandedOrderId === order.id && (
                      <div className={`p-4 border-t ${theme === 'dark' ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}>
                        <div className="grid md:grid-cols-3 gap-6">
                          {/* Cake Details */}
                          <div>
                            <h4 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.customCakeOrder.cakeDetails', 'Cake Details')}</h4>
                            <div className={`space-y-1 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                              <p><strong>{t('tools.customCakeOrder.size', 'Size:')}</strong> {CAKE_SIZES.find(s => s.value === order.cakeSize)?.label} ({order.servings} servings)</p>
                              <p><strong>{t('tools.customCakeOrder.flavor', 'Flavor:')}</strong> {CAKE_FLAVORS.find(f => f.value === order.cakeFlavor)?.label}</p>
                              <p><strong>{t('tools.customCakeOrder.filling', 'Filling:')}</strong> {FILLING_TYPES.find(f => f.value === order.filling)?.label}</p>
                              <p><strong>{t('tools.customCakeOrder.frosting', 'Frosting:')}</strong> {FROSTING_TYPES.find(f => f.value === order.frosting)?.label}</p>
                              {order.decorationTheme && <p><strong>{t('tools.customCakeOrder.theme', 'Theme:')}</strong> {order.decorationTheme}</p>}
                              {order.colorScheme && <p><strong>{t('tools.customCakeOrder.colors', 'Colors:')}</strong> {order.colorScheme}</p>}
                              {order.inscription && <p><strong>{t('tools.customCakeOrder.inscription', 'Inscription:')}</strong> "{order.inscription}"</p>}
                            </div>
                          </div>

                          {/* Customer Info */}
                          <div>
                            <h4 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.customCakeOrder.customer', 'Customer')}</h4>
                            <div className={`space-y-1 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                              <p className="flex items-center gap-2"><User className="w-4 h-4" /> {order.customerName}</p>
                              {order.customerPhone && <p className="flex items-center gap-2"><Phone className="w-4 h-4" /> {order.customerPhone}</p>}
                              {order.customerEmail && <p className="flex items-center gap-2"><Mail className="w-4 h-4" /> {order.customerEmail}</p>}
                            </div>
                            {order.specialInstructions && (
                              <div className="mt-3">
                                <p className={`font-medium text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.customCakeOrder.specialInstructions', 'Special Instructions:')}</p>
                                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{order.specialInstructions}</p>
                              </div>
                            )}
                          </div>

                          {/* Payment & Actions */}
                          <div>
                            <h4 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.customCakeOrder.payment', 'Payment')}</h4>
                            <div className={`space-y-1 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                              <p><strong>{t('tools.customCakeOrder.total', 'Total:')}</strong> {formatCurrency(order.totalPrice)}</p>
                              <p><strong>{t('tools.customCakeOrder.deposit', 'Deposit:')}</strong> {formatCurrency(order.depositPaid)}</p>
                              <p className="text-orange-500"><strong>{t('tools.customCakeOrder.balance', 'Balance:')}</strong> {formatCurrency(order.balanceDue)}</p>
                            </div>
                            <div className="mt-4 flex flex-wrap gap-2">
                              <select
                                value={order.status}
                                onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                                className={`px-3 py-1 text-sm rounded border ${
                                  theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                                }`}
                              >
                                {ORDER_STATUSES.map((status) => (
                                  <option key={status.value} value={status.value}>{status.label}</option>
                                ))}
                              </select>
                              <button
                                onClick={() => deleteOrder(order.id)}
                                className="p-1 text-red-500 hover:bg-red-100 rounded"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
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
        {activeTab === 'new' && (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <h2 className={`text-xl font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.customCakeOrder.createNewCakeOrder', 'Create New Cake Order')}
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Customer Information */}
              <div className="space-y-4">
                <h3 className={`font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.customCakeOrder.customerInformation', 'Customer Information')}</h3>
                <input
                  type="text"
                  placeholder={t('tools.customCakeOrder.customerName', 'Customer Name *')}
                  value={newOrder.customerName}
                  onChange={(e) => setNewOrder({ ...newOrder, customerName: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                />
                <input
                  type="tel"
                  placeholder={t('tools.customCakeOrder.phoneNumber', 'Phone Number')}
                  value={newOrder.customerPhone}
                  onChange={(e) => setNewOrder({ ...newOrder, customerPhone: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                />
                <input
                  type="email"
                  placeholder={t('tools.customCakeOrder.emailAddress', 'Email Address')}
                  value={newOrder.customerEmail}
                  onChange={(e) => setNewOrder({ ...newOrder, customerEmail: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.customCakeOrder.pickupDate', 'Pickup Date *')}</label>
                    <input
                      type="date"
                      value={newOrder.pickupDate}
                      onChange={(e) => setNewOrder({ ...newOrder, pickupDate: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.customCakeOrder.pickupTime', 'Pickup Time *')}</label>
                    <input
                      type="time"
                      value={newOrder.pickupTime}
                      onChange={(e) => setNewOrder({ ...newOrder, pickupTime: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Cake Details */}
              <div className="space-y-4">
                <h3 className={`font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.customCakeOrder.cakeDetails2', 'Cake Details')}</h3>
                <div>
                  <label className={`block text-sm mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.customCakeOrder.size2', 'Size')}</label>
                  <select
                    value={newOrder.cakeSize}
                    onChange={(e) => setNewOrder({ ...newOrder, cakeSize: e.target.value as CakeSize })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  >
                    {CAKE_SIZES.map((size) => (
                      <option key={size.value} value={size.value}>
                        {size.label} - {size.servings} servings ({formatCurrency(size.basePrice)})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.customCakeOrder.flavor2', 'Flavor')}</label>
                  <select
                    value={newOrder.cakeFlavor}
                    onChange={(e) => setNewOrder({ ...newOrder, cakeFlavor: e.target.value as CakeFlavor })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  >
                    {CAKE_FLAVORS.map((flavor) => (
                      <option key={flavor.value} value={flavor.value}>
                        {flavor.label} {flavor.upcharge > 0 ? `(+${formatCurrency(flavor.upcharge)})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.customCakeOrder.filling2', 'Filling')}</label>
                    <select
                      value={newOrder.filling}
                      onChange={(e) => setNewOrder({ ...newOrder, filling: e.target.value as FillingType })}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                    >
                      {FILLING_TYPES.map((filling) => (
                        <option key={filling.value} value={filling.value}>
                          {filling.label} {filling.upcharge > 0 ? `(+${formatCurrency(filling.upcharge)})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.customCakeOrder.frosting2', 'Frosting')}</label>
                    <select
                      value={newOrder.frosting}
                      onChange={(e) => setNewOrder({ ...newOrder, frosting: e.target.value as FrostingType })}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                    >
                      {FROSTING_TYPES.map((frosting) => (
                        <option key={frosting.value} value={frosting.value}>
                          {frosting.label} {frosting.upcharge > 0 ? `(+${formatCurrency(frosting.upcharge)})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Decoration */}
              <div className="space-y-4">
                <h3 className={`font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.customCakeOrder.decoration', 'Decoration')}</h3>
                <input
                  type="text"
                  placeholder={t('tools.customCakeOrder.decorationThemeEGBirthday', 'Decoration Theme (e.g., Birthday, Wedding)')}
                  value={newOrder.decorationTheme}
                  onChange={(e) => setNewOrder({ ...newOrder, decorationTheme: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                />
                <input
                  type="text"
                  placeholder={t('tools.customCakeOrder.colorScheme', 'Color Scheme')}
                  value={newOrder.colorScheme}
                  onChange={(e) => setNewOrder({ ...newOrder, colorScheme: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                />
                <input
                  type="text"
                  placeholder={t('tools.customCakeOrder.inscriptionEGHappyBirthday', 'Inscription (e.g., Happy Birthday!)')}
                  value={newOrder.inscription}
                  onChange={(e) => setNewOrder({ ...newOrder, inscription: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                />
                <textarea
                  placeholder={t('tools.customCakeOrder.specialInstructions2', 'Special Instructions')}
                  value={newOrder.specialInstructions}
                  onChange={(e) => setNewOrder({ ...newOrder, specialInstructions: e.target.value })}
                  rows={3}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                />
              </div>

              {/* Payment & Summary */}
              <div className="space-y-4">
                <h3 className={`font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.customCakeOrder.payment2', 'Payment')}</h3>
                <div>
                  <label className={`block text-sm mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.customCakeOrder.depositPaid', 'Deposit Paid')}</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={newOrder.depositPaid}
                    onChange={(e) => setNewOrder({ ...newOrder, depositPaid: parseFloat(e.target.value) || 0 })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>

                {/* Price Summary */}
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <h4 className={`font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.customCakeOrder.priceEstimate', 'Price Estimate')}</h4>
                  {(() => {
                    const pricing = calculatePrice(newOrder);
                    return (
                      <div className={`space-y-1 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        <div className="flex justify-between">
                          <span>{t('tools.customCakeOrder.basePrice', 'Base Price:')}</span>
                          <span>{formatCurrency(pricing.basePrice)}</span>
                        </div>
                        {pricing.decorationFee > 0 && (
                          <div className="flex justify-between">
                            <span>{t('tools.customCakeOrder.decorationFee', 'Decoration Fee:')}</span>
                            <span>{formatCurrency(pricing.decorationFee)}</span>
                          </div>
                        )}
                        {pricing.rushFee > 0 && (
                          <div className="flex justify-between text-orange-500">
                            <span>{t('tools.customCakeOrder.rushFee25', 'Rush Fee (25%):')}</span>
                            <span>{formatCurrency(pricing.rushFee)}</span>
                          </div>
                        )}
                        <div className={`flex justify-between font-semibold pt-2 border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}>
                          <span>{t('tools.customCakeOrder.total2', 'Total:')}</span>
                          <span>{formatCurrency(pricing.totalPrice)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t('tools.customCakeOrder.deposit2', 'Deposit:')}</span>
                          <span>{formatCurrency(newOrder.depositPaid || 0)}</span>
                        </div>
                        <div className="flex justify-between text-orange-500 font-medium">
                          <span>{t('tools.customCakeOrder.balanceDue2', 'Balance Due:')}</span>
                          <span>{formatCurrency(pricing.totalPrice - (newOrder.depositPaid || 0))}</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                <button
                  onClick={addOrder}
                  className="w-full py-3 bg-[#0D9488] text-white rounded-lg font-medium hover:bg-[#0B7C71] transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  {t('tools.customCakeOrder.createOrder', 'Create Order')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Calendar/Upcoming Tab */}
        {activeTab === 'calendar' && (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <h2 className={`text-xl font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.customCakeOrder.upcomingOrdersNext7Days', 'Upcoming Orders (Next 7 Days)')}
            </h2>

            {upcomingOrders.length === 0 ? (
              <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{t('tools.customCakeOrder.noUpcomingOrdersInThe', 'No upcoming orders in the next 7 days')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingOrders.map((order) => (
                  <div
                    key={order.id}
                    className={`p-4 rounded-lg border ${theme === 'dark' ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {formatDate(order.pickupDate)} at {order.pickupTime}
                        </div>
                        <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {order.orderNumber} - {order.customerName}
                        </div>
                        <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {CAKE_SIZES.find(s => s.value === order.cakeSize)?.label} {CAKE_FLAVORS.find(f => f.value === order.cakeFlavor)?.label}
                          {order.decorationTheme && ` - ${order.decorationTheme}`}
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                        {ORDER_STATUSES.find(s => s.value === order.status)?.label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Validation Message Toast */}
        {validationMessage && (
          <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{validationMessage}</span>
          </div>
        )}

        {/* Confirm Dialog */}
        <ConfirmDialog />
      </div>
    </div>
  );
};

export default CustomCakeOrderTool;
