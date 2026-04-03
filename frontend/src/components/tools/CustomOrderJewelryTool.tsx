'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Sparkles,
  Plus,
  Trash2,
  Search,
  User,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  Edit,
  X,
  ChevronDown,
  ChevronUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Package,
  Ruler,
  FileText,
  Palette,
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
import { useConfirmDialog } from '../ui/ConfirmDialog';

interface CustomOrderJewelryToolProps {
  uiConfig?: UIConfig;
}

// Types
type OrderStatus = 'quote' | 'approved' | 'design' | 'production' | 'quality_check' | 'ready' | 'delivered' | 'cancelled';
type OrderType = 'new_design' | 'modification' | 'resize' | 'remount' | 'duplicate' | 'family_piece';

interface CustomOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  orderType: OrderType;
  status: OrderStatus;
  itemType: string;
  description: string;
  designNotes: string;
  metalType: string;
  metalPurity: string;
  metalWeight: number;
  stones: OrderStone[];
  fingerSize: string;
  dimensions: string;
  engraving: string;
  estimatedCost: number;
  materialCost: number;
  laborCost: number;
  finalPrice: number;
  depositAmount: number;
  depositPaid: boolean;
  balanceDue: number;
  priority: 'standard' | 'rush' | 'urgent';
  orderDate: string;
  estimatedCompletion: string;
  actualCompletion: string;
  customerApprovedDesign: boolean;
  designApprovalDate: string;
  notes: string;
  attachments: string[];
  createdAt: string;
  updatedAt: string;
}

interface OrderStone {
  id: string;
  type: string;
  shape: string;
  size: string;
  quality: string;
  source: 'customer_provided' | 'purchased' | 'in_stock';
  cost: number;
  notes: string;
}

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  createdAt: string;
}

// Constants
const ORDER_TYPES: { type: OrderType; label: string }[] = [
  { type: 'new_design', label: 'New Design' },
  { type: 'modification', label: 'Modification' },
  { type: 'resize', label: 'Resize' },
  { type: 'remount', label: 'Remount' },
  { type: 'duplicate', label: 'Duplicate/Copy' },
  { type: 'family_piece', label: 'Family/Heirloom' },
];

const STATUS_OPTIONS: { status: OrderStatus; label: string; color: string }[] = [
  { status: 'quote', label: 'Quote Pending', color: 'bg-gray-500' },
  { status: 'approved', label: 'Approved', color: 'bg-blue-500' },
  { status: 'design', label: 'In Design', color: 'bg-purple-500' },
  { status: 'production', label: 'In Production', color: 'bg-yellow-500' },
  { status: 'quality_check', label: 'Quality Check', color: 'bg-indigo-500' },
  { status: 'ready', label: 'Ready for Pickup', color: 'bg-green-500' },
  { status: 'delivered', label: 'Delivered', color: 'bg-gray-600' },
  { status: 'cancelled', label: 'Cancelled', color: 'bg-red-500' },
];

const METAL_TYPES = ['Yellow Gold', 'White Gold', 'Rose Gold', 'Platinum', 'Palladium', 'Silver', 'Two-Tone', 'Tri-Color'];
const METAL_PURITIES = ['10K', '14K', '18K', '22K', '24K', '950 Platinum', '925 Silver', '900 Palladium'];
const ITEM_TYPES = ['Ring', 'Necklace', 'Pendant', 'Earrings', 'Bracelet', 'Brooch', 'Cufflinks', 'Tiara', 'Watch', 'Other'];

// Column configurations for exports
const ORDER_COLUMNS: ColumnConfig[] = [
  { key: 'orderNumber', header: 'Order #', type: 'string' },
  { key: 'customerName', header: 'Customer', type: 'string' },
  { key: 'itemType', header: 'Item Type', type: 'string' },
  { key: 'orderType', header: 'Order Type', type: 'string' },
  { key: 'finalPrice', header: 'Price', type: 'currency' },
  { key: 'depositAmount', header: 'Deposit', type: 'currency' },
  { key: 'balanceDue', header: 'Balance', type: 'currency' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'orderDate', header: 'Order Date', type: 'date' },
  { key: 'estimatedCompletion', header: 'Est. Completion', type: 'date' },
];

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);
const generateOrderNumber = () => `CO-${Date.now().toString(36).toUpperCase()}`;

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
};

const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Main Component
export const CustomOrderJewelryTool: React.FC<CustomOrderJewelryToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
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
  } = useToolData<CustomOrder>('custom-jewelry-orders', [], ORDER_COLUMNS);

  const {
    data: customers,
    addItem: addCustomerToBackend,
    deleteItem: deleteCustomerBackend,
  } = useToolData<Customer>('custom-order-customers', [], []);

  // Local UI State
  const [activeTab, setActiveTab] = useState<'orders' | 'customers'>('orders');
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState<CustomOrder | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [showStoneModal, setShowStoneModal] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // New order form state
  const [newOrder, setNewOrder] = useState<Partial<CustomOrder>>({
    customerId: '',
    orderType: 'new_design',
    itemType: 'Ring',
    description: '',
    designNotes: '',
    metalType: 'Yellow Gold',
    metalPurity: '14K',
    metalWeight: 0,
    stones: [],
    fingerSize: '',
    dimensions: '',
    engraving: '',
    estimatedCost: 0,
    materialCost: 0,
    laborCost: 0,
    depositAmount: 0,
    priority: 'standard',
    estimatedCompletion: '',
    notes: '',
  });

  // New stone state
  const [newStone, setNewStone] = useState<Partial<OrderStone>>({
    type: 'Diamond',
    shape: 'Round',
    size: '',
    quality: '',
    source: 'purchased',
    cost: 0,
    notes: '',
  });

  // New customer form state
  const [newCustomer, setNewCustomer] = useState<Partial<Customer>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
  });

  // Add stone to order
  const addStone = () => {
    const stone: OrderStone = {
      id: generateId(),
      type: newStone.type || 'Diamond',
      shape: newStone.shape || 'Round',
      size: newStone.size || '',
      quality: newStone.quality || '',
      source: newStone.source || 'purchased',
      cost: newStone.cost || 0,
      notes: newStone.notes || '',
    };

    setNewOrder({
      ...newOrder,
      stones: [...(newOrder.stones || []), stone],
    });

    setNewStone({
      type: 'Diamond',
      shape: 'Round',
      size: '',
      quality: '',
      source: 'purchased',
      cost: 0,
      notes: '',
    });
    setShowStoneModal(false);
  };

  // Remove stone from order
  const removeStone = (stoneId: string) => {
    setNewOrder({
      ...newOrder,
      stones: (newOrder.stones || []).filter((s) => s.id !== stoneId),
    });
  };

  // Calculate totals
  const calculateTotals = (order: Partial<CustomOrder>) => {
    const stoneCost = (order.stones || []).reduce((sum, s) => sum + s.cost, 0);
    const estimatedCost = (order.materialCost || 0) + (order.laborCost || 0) + stoneCost;
    return { estimatedCost, stoneCost };
  };

  // Add new order
  const addOrder = () => {
    if (!newOrder.customerId || !newOrder.description) {
      setValidationMessage('Please select a customer and enter a description');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const { estimatedCost } = calculateTotals(newOrder);
    const finalPrice = newOrder.estimatedCost || estimatedCost;
    const balanceDue = finalPrice - (newOrder.depositAmount || 0);

    const order: CustomOrder = {
      id: generateId(),
      orderNumber: generateOrderNumber(),
      customerId: newOrder.customerId || '',
      orderType: newOrder.orderType || 'new_design',
      status: 'quote',
      itemType: newOrder.itemType || 'Ring',
      description: newOrder.description || '',
      designNotes: newOrder.designNotes || '',
      metalType: newOrder.metalType || 'Yellow Gold',
      metalPurity: newOrder.metalPurity || '14K',
      metalWeight: newOrder.metalWeight || 0,
      stones: newOrder.stones || [],
      fingerSize: newOrder.fingerSize || '',
      dimensions: newOrder.dimensions || '',
      engraving: newOrder.engraving || '',
      estimatedCost: estimatedCost,
      materialCost: newOrder.materialCost || 0,
      laborCost: newOrder.laborCost || 0,
      finalPrice: finalPrice,
      depositAmount: newOrder.depositAmount || 0,
      depositPaid: false,
      balanceDue: balanceDue,
      priority: newOrder.priority || 'standard',
      orderDate: new Date().toISOString(),
      estimatedCompletion: newOrder.estimatedCompletion || '',
      actualCompletion: '',
      customerApprovedDesign: false,
      designApprovalDate: '',
      notes: newOrder.notes || '',
      attachments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addOrderToBackend(order);
    setShowOrderForm(false);
    resetOrderForm();
  };

  // Update order
  const updateOrder = () => {
    if (!editingOrder) return;

    const balanceDue = editingOrder.finalPrice - (editingOrder.depositPaid ? editingOrder.depositAmount : 0);

    const updates = {
      ...editingOrder,
      balanceDue,
      updatedAt: new Date().toISOString(),
    };

    if (editingOrder.status === 'delivered' && !editingOrder.actualCompletion) {
      updates.actualCompletion = new Date().toISOString();
    }

    updateOrderBackend(editingOrder.id, updates);
    setEditingOrder(null);
  };

  // Delete order
  const deleteOrder = useCallback(async (orderId: string) => {
    const confirmed = await confirm({
      title: 'Confirm Delete',
      message: 'Are you sure you want to delete this custom order?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteOrderBackend(orderId);
    }
  }, [confirm, deleteOrderBackend]);

  // Add new customer
  const addCustomer = () => {
    if (!newCustomer.firstName || !newCustomer.lastName) {
      setValidationMessage('Please enter customer first and last name');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const customer: Customer = {
      id: generateId(),
      firstName: newCustomer.firstName || '',
      lastName: newCustomer.lastName || '',
      email: newCustomer.email || '',
      phone: newCustomer.phone || '',
      address: newCustomer.address || '',
      createdAt: new Date().toISOString(),
    };

    addCustomerToBackend(customer);
    setShowCustomerForm(false);
    setNewCustomer({ firstName: '', lastName: '', email: '', phone: '', address: '' });
  };

  // Delete customer
  const deleteCustomer = useCallback(async (customerId: string) => {
    const hasOrders = orders.some((o) => o.customerId === customerId);
    if (hasOrders) {
      setValidationMessage('Cannot delete customer with existing orders');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }
    const confirmed = await confirm({
      title: 'Confirm Delete',
      message: 'Are you sure you want to delete this customer?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteCustomerBackend(customerId);
    }
  }, [confirm, deleteCustomerBackend, orders]);

  // Reset order form
  const resetOrderForm = () => {
    setNewOrder({
      customerId: '',
      orderType: 'new_design',
      itemType: 'Ring',
      description: '',
      designNotes: '',
      metalType: 'Yellow Gold',
      metalPurity: '14K',
      metalWeight: 0,
      stones: [],
      fingerSize: '',
      dimensions: '',
      engraving: '',
      estimatedCost: 0,
      materialCost: 0,
      laborCost: 0,
      depositAmount: 0,
      priority: 'standard',
      estimatedCompletion: '',
      notes: '',
    });
  };

  // Get customer name
  const getCustomerName = (customerId: string) => {
    const customer = customers.find((c) => c.id === customerId);
    return customer ? `${customer.firstName} ${customer.lastName}` : 'Unknown';
  };

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const customer = customers.find((c) => c.id === order.customerId);
      const customerName = customer ? `${customer.firstName} ${customer.lastName}`.toLowerCase() : '';
      const matchesSearch =
        searchTerm === '' ||
        customerName.includes(searchTerm.toLowerCase()) ||
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [orders, customers, searchTerm, filterStatus]);

  // Stats
  const stats = useMemo(() => {
    const activeOrders = orders.filter((o) => !['delivered', 'cancelled'].includes(o.status));
    const inProduction = orders.filter((o) => o.status === 'production');
    const readyForPickup = orders.filter((o) => o.status === 'ready');
    const totalRevenue = orders.filter((o) => o.status === 'delivered').reduce((sum, o) => sum + o.finalPrice, 0);
    const pendingPayments = orders.reduce((sum, o) => sum + o.balanceDue, 0);

    return { activeOrders: activeOrders.length, inProduction: inProduction.length, readyForPickup: readyForPickup.length, totalRevenue, pendingPayments };
  }, [orders]);

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.customOrderJewelry.customJewelryOrders', 'Custom Jewelry Orders')}
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.customOrderJewelry.manageCustomDesignOrdersModifications', 'Manage custom design orders, modifications, and special requests')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="custom-order-jewelry" toolName="Custom Order Jewelry" />

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
                onExportCSV={() => {
                  const exportData = orders.map((o) => ({
                    ...o,
                    customerName: getCustomerName(o.customerId),
                  }));
                  exportToCSV(exportData, ORDER_COLUMNS, { filename: 'custom-jewelry-orders' });
                }}
                onExportExcel={() => {
                  const exportData = orders.map((o) => ({
                    ...o,
                    customerName: getCustomerName(o.customerId),
                  }));
                  exportToExcel(exportData, ORDER_COLUMNS, { filename: 'custom-jewelry-orders' });
                }}
                onExportJSON={() => {
                  const exportData = orders.map((o) => ({
                    ...o,
                    customerName: getCustomerName(o.customerId),
                  }));
                  exportToJSON(exportData, { filename: 'custom-jewelry-orders' });
                }}
                onExportPDF={async () => {
                  const exportData = orders.map((o) => ({
                    ...o,
                    customerName: getCustomerName(o.customerId),
                  }));
                  await exportToPDF(exportData, ORDER_COLUMNS, {
                    filename: 'custom-jewelry-orders',
                    title: 'Custom Jewelry Orders Report',
                    subtitle: `${orders.length} total orders`,
                  });
                }}
                onPrint={() => {
                  const exportData = orders.map((o) => ({
                    ...o,
                    customerName: getCustomerName(o.customerId),
                  }));
                  printData(exportData, ORDER_COLUMNS, { title: 'Custom Jewelry Orders' });
                }}
                onCopyToClipboard={async () => {
                  const exportData = orders.map((o) => ({
                    ...o,
                    customerName: getCustomerName(o.customerId),
                  }));
                  return await copyUtil(exportData, ORDER_COLUMNS, 'tab');
                }}
                showImport={false}
                theme={theme}
              />
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'orders', label: 'Orders', icon: <FileText className="w-4 h-4" /> },
              { id: 'customers', label: 'Customers', icon: <User className="w-4 h-4" /> },
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.customOrderJewelry.activeOrders', 'Active Orders')}</p>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {stats.activeOrders}
                </p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.customOrderJewelry.inProduction', 'In Production')}</p>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {stats.inProduction}
                </p>
              </div>
              <Package className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.customOrderJewelry.readyForPickup', 'Ready for Pickup')}</p>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {stats.readyForPickup}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.customOrderJewelry.totalRevenue', 'Total Revenue')}</p>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {formatCurrency(stats.totalRevenue)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-[#0D9488]" />
            </div>
          </div>
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.customOrderJewelry.pendingPayments', 'Pending Payments')}</p>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {formatCurrency(stats.pendingPayments)}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                  <input
                    type="text"
                    placeholder={t('tools.customOrderJewelry.searchOrders', 'Search orders...')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`pl-10 pr-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className={`px-4 py-2 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
                >
                  <option value="all">{t('tools.customOrderJewelry.allStatus', 'All Status')}</option>
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.status} value={opt.status}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => setShowOrderForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7C73] transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t('tools.customOrderJewelry.newOrder', 'New Order')}
              </button>
            </div>

            {/* Orders List */}
            <div className="space-y-4">
              {filteredOrders.length === 0 ? (
                <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{t('tools.customOrderJewelry.noCustomOrdersFound', 'No custom orders found')}</p>
                </div>
              ) : (
                filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className={`border rounded-lg p-4 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {order.orderNumber}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full text-white ${
                              STATUS_OPTIONS.find((s) => s.status === order.status)?.color || 'bg-gray-500'
                            }`}>
                              {STATUS_OPTIONS.find((s) => s.status === order.status)?.label}
                            </span>
                            {order.priority === 'rush' && (
                              <span className="px-2 py-1 text-xs rounded-full bg-orange-500 text-white">{t('tools.customOrderJewelry.rush', 'Rush')}</span>
                            )}
                            {order.priority === 'urgent' && (
                              <span className="px-2 py-1 text-xs rounded-full bg-red-500 text-white">{t('tools.customOrderJewelry.urgent', 'Urgent')}</span>
                            )}
                          </div>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {getCustomerName(order.customerId)} - {order.itemType}: {order.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {formatCurrency(order.finalPrice)}
                          </p>
                          {order.balanceDue > 0 && (
                            <p className={`text-xs text-orange-500`}>
                              Due: {formatCurrency(order.balanceDue)}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                            className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                          >
                            {expandedOrderId === order.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => setEditingOrder(order)}
                            className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                          >
                            <Edit className="w-4 h-4 text-blue-500" />
                          </button>
                          <button
                            onClick={() => deleteOrder(order.id)}
                            className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {expandedOrderId === order.id && (
                      <div className={`mt-4 pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.customOrderJewelry.orderType', 'Order Type')}</p>
                            <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {ORDER_TYPES.find((t) => t.type === order.orderType)?.label}
                            </p>
                          </div>
                          <div>
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.customOrderJewelry.metal', 'Metal')}</p>
                            <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {order.metalPurity} {order.metalType}
                            </p>
                          </div>
                          <div>
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.customOrderJewelry.orderDate', 'Order Date')}</p>
                            <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {formatDate(order.orderDate)}
                            </p>
                          </div>
                          <div>
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.customOrderJewelry.estCompletion', 'Est. Completion')}</p>
                            <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {formatDate(order.estimatedCompletion)}
                            </p>
                          </div>
                        </div>

                        {order.fingerSize && (
                          <div className="mb-4">
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.customOrderJewelry.ringSize', 'Ring Size')}</p>
                            <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{order.fingerSize}</p>
                          </div>
                        )}

                        {order.engraving && (
                          <div className="mb-4">
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.customOrderJewelry.engraving', 'Engraving')}</p>
                            <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{order.engraving}</p>
                          </div>
                        )}

                        {/* Stones */}
                        {order.stones.length > 0 && (
                          <div className="mb-4">
                            <p className={`text-xs mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.customOrderJewelry.stones', 'Stones')}</p>
                            <div className="space-y-2">
                              {order.stones.map((stone) => (
                                <div key={stone.id} className={`p-2 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                  <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    {stone.size} {stone.shape} {stone.type}
                                  </span>
                                  <span className={`ml-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                    ({stone.source.replace('_', ' ')})
                                  </span>
                                  {stone.cost > 0 && (
                                    <span className={`ml-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                      {formatCurrency(stone.cost)}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Cost Breakdown */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.customOrderJewelry.materialCost', 'Material Cost')}</p>
                            <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {formatCurrency(order.materialCost)}
                            </p>
                          </div>
                          <div>
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.customOrderJewelry.laborCost', 'Labor Cost')}</p>
                            <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {formatCurrency(order.laborCost)}
                            </p>
                          </div>
                          <div>
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.customOrderJewelry.deposit', 'Deposit')}</p>
                            <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {formatCurrency(order.depositAmount)}
                              {order.depositPaid ? (
                                <span className="ml-2 text-xs text-green-500">{t('tools.customOrderJewelry.paid', 'Paid')}</span>
                              ) : (
                                <span className="ml-2 text-xs text-orange-500">{t('tools.customOrderJewelry.unpaid', 'Unpaid')}</span>
                              )}
                            </p>
                          </div>
                          <div>
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.customOrderJewelry.balanceDue', 'Balance Due')}</p>
                            <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {formatCurrency(order.balanceDue)}
                            </p>
                          </div>
                        </div>

                        {order.designNotes && (
                          <div className="mb-4">
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.customOrderJewelry.designNotes', 'Design Notes')}</p>
                            <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{order.designNotes}</p>
                          </div>
                        )}

                        {order.notes && (
                          <div>
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.customOrderJewelry.notes', 'Notes')}</p>
                            <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{order.notes}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Customers Tab */}
        {activeTab === 'customers' && (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.customOrderJewelry.customers', 'Customers')}</h2>
              <button
                onClick={() => setShowCustomerForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7C73] transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t('tools.customOrderJewelry.addCustomer2', 'Add Customer')}
              </button>
            </div>

            <div className="space-y-4">
              {customers.length === 0 ? (
                <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{t('tools.customOrderJewelry.noCustomersFound', 'No customers found')}</p>
                </div>
              ) : (
                customers.map((customer) => (
                  <div
                    key={customer.id}
                    className={`border rounded-lg p-4 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {customer.firstName} {customer.lastName}
                        </p>
                        <div className="flex items-center gap-4 mt-1">
                          {customer.email && (
                            <span className={`flex items-center gap-1 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              <Mail className="w-3 h-3" /> {customer.email}
                            </span>
                          )}
                          {customer.phone && (
                            <span className={`flex items-center gap-1 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              <Phone className="w-3 h-3" /> {customer.phone}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {orders.filter((o) => o.customerId === customer.id).length} orders
                        </span>
                        <button
                          onClick={() => deleteCustomer(customer.id)}
                          className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* New Order Modal */}
        {showOrderForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.customOrderJewelry.newCustomOrder', 'New Custom Order')}</h2>
                <button onClick={() => { setShowOrderForm(false); resetOrderForm(); }}>
                  <X className={`w-6 h-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.customOrderJewelry.customer', 'Customer *')}
                  </label>
                  <select
                    value={newOrder.customerId}
                    onChange={(e) => setNewOrder({ ...newOrder, customerId: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="">{t('tools.customOrderJewelry.selectCustomer', 'Select Customer')}</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.customOrderJewelry.orderType2', 'Order Type')}
                  </label>
                  <select
                    value={newOrder.orderType}
                    onChange={(e) => setNewOrder({ ...newOrder, orderType: e.target.value as OrderType })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    {ORDER_TYPES.map((t) => (
                      <option key={t.type} value={t.type}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.customOrderJewelry.itemType', 'Item Type')}
                  </label>
                  <select
                    value={newOrder.itemType}
                    onChange={(e) => setNewOrder({ ...newOrder, itemType: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    {ITEM_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.customOrderJewelry.priority', 'Priority')}
                  </label>
                  <select
                    value={newOrder.priority}
                    onChange={(e) => setNewOrder({ ...newOrder, priority: e.target.value as 'standard' | 'rush' | 'urgent' })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="standard">{t('tools.customOrderJewelry.standard', 'Standard')}</option>
                    <option value="rush">{t('tools.customOrderJewelry.rush25', 'Rush (+25%)')}</option>
                    <option value="urgent">{t('tools.customOrderJewelry.urgent50', 'Urgent (+50%)')}</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.customOrderJewelry.description', 'Description *')}
                  </label>
                  <textarea
                    value={newOrder.description}
                    onChange={(e) => setNewOrder({ ...newOrder, description: e.target.value })}
                    rows={2}
                    placeholder={t('tools.customOrderJewelry.describeTheCustomPiece', 'Describe the custom piece...')}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.customOrderJewelry.metalType', 'Metal Type')}
                  </label>
                  <select
                    value={newOrder.metalType}
                    onChange={(e) => setNewOrder({ ...newOrder, metalType: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    {METAL_TYPES.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.customOrderJewelry.metalPurity', 'Metal Purity')}
                  </label>
                  <select
                    value={newOrder.metalPurity}
                    onChange={(e) => setNewOrder({ ...newOrder, metalPurity: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    {METAL_PURITIES.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.customOrderJewelry.ringSize2', 'Ring Size')}
                  </label>
                  <input
                    type="text"
                    value={newOrder.fingerSize}
                    onChange={(e) => setNewOrder({ ...newOrder, fingerSize: e.target.value })}
                    placeholder="e.g., 7, 7.5"
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.customOrderJewelry.engraving2', 'Engraving')}
                  </label>
                  <input
                    type="text"
                    value={newOrder.engraving}
                    onChange={(e) => setNewOrder({ ...newOrder, engraving: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                {/* Stones Section */}
                <div className="md:col-span-2">
                  <div className="flex items-center justify-between mb-2">
                    <label className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.customOrderJewelry.stones2', 'Stones')}
                    </label>
                    <button
                      onClick={() => setShowStoneModal(true)}
                      className="text-sm text-[#0D9488] hover:text-[#0B7C73]"
                    >
                      {t('tools.customOrderJewelry.addStone2', '+ Add Stone')}
                    </button>
                  </div>
                  {(newOrder.stones || []).length > 0 ? (
                    <div className="space-y-2">
                      {(newOrder.stones || []).map((stone) => (
                        <div key={stone.id} className={`flex items-center justify-between p-2 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                          <span className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {stone.size} {stone.shape} {stone.type} ({stone.source.replace('_', ' ')})
                            {stone.cost > 0 && ` - ${formatCurrency(stone.cost)}`}
                          </span>
                          <button onClick={() => removeStone(stone.id)} className="text-red-500 hover:text-red-600">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.customOrderJewelry.noStonesAdded', 'No stones added')}</p>
                  )}
                </div>

                {/* Costs */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.customOrderJewelry.materialCost2', 'Material Cost')}
                  </label>
                  <input
                    type="number"
                    value={newOrder.materialCost}
                    onChange={(e) => setNewOrder({ ...newOrder, materialCost: parseFloat(e.target.value) || 0 })}
                    step="0.01"
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.customOrderJewelry.laborCost2', 'Labor Cost')}
                  </label>
                  <input
                    type="number"
                    value={newOrder.laborCost}
                    onChange={(e) => setNewOrder({ ...newOrder, laborCost: parseFloat(e.target.value) || 0 })}
                    step="0.01"
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.customOrderJewelry.depositAmount', 'Deposit Amount')}
                  </label>
                  <input
                    type="number"
                    value={newOrder.depositAmount}
                    onChange={(e) => setNewOrder({ ...newOrder, depositAmount: parseFloat(e.target.value) || 0 })}
                    step="0.01"
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.customOrderJewelry.estCompletionDate', 'Est. Completion Date')}
                  </label>
                  <input
                    type="date"
                    value={newOrder.estimatedCompletion}
                    onChange={(e) => setNewOrder({ ...newOrder, estimatedCompletion: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.customOrderJewelry.designNotes2', 'Design Notes')}
                  </label>
                  <textarea
                    value={newOrder.designNotes}
                    onChange={(e) => setNewOrder({ ...newOrder, designNotes: e.target.value })}
                    rows={3}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => { setShowOrderForm(false); resetOrderForm(); }}
                  className={`px-4 py-2 rounded-lg ${
                    theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {t('tools.customOrderJewelry.cancel', 'Cancel')}
                </button>
                <button
                  onClick={addOrder}
                  className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7C73] transition-colors"
                >
                  {t('tools.customOrderJewelry.createOrder', 'Create Order')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Stone Modal */}
        {showStoneModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-md w-full p-6`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.customOrderJewelry.addStone', 'Add Stone')}</h2>
                <button onClick={() => setShowStoneModal(false)}>
                  <X className={`w-6 h-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.customOrderJewelry.stoneType', 'Stone Type')}
                  </label>
                  <input
                    type="text"
                    value={newStone.type}
                    onChange={(e) => setNewStone({ ...newStone, type: e.target.value })}
                    placeholder={t('tools.customOrderJewelry.eGDiamond', 'e.g., Diamond')}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.customOrderJewelry.shape', 'Shape')}
                  </label>
                  <input
                    type="text"
                    value={newStone.shape}
                    onChange={(e) => setNewStone({ ...newStone, shape: e.target.value })}
                    placeholder={t('tools.customOrderJewelry.eGRound', 'e.g., Round')}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.customOrderJewelry.size', 'Size')}
                  </label>
                  <input
                    type="text"
                    value={newStone.size}
                    onChange={(e) => setNewStone({ ...newStone, size: e.target.value })}
                    placeholder={t('tools.customOrderJewelry.eG15ct', 'e.g., 1.5ct')}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.customOrderJewelry.source', 'Source')}
                  </label>
                  <select
                    value={newStone.source}
                    onChange={(e) => setNewStone({ ...newStone, source: e.target.value as 'customer_provided' | 'purchased' | 'in_stock' })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="purchased">{t('tools.customOrderJewelry.purchased', 'Purchased')}</option>
                    <option value="in_stock">{t('tools.customOrderJewelry.inStock', 'In Stock')}</option>
                    <option value="customer_provided">{t('tools.customOrderJewelry.customerProvided', 'Customer Provided')}</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.customOrderJewelry.cost', 'Cost')}
                  </label>
                  <input
                    type="number"
                    value={newStone.cost}
                    onChange={(e) => setNewStone({ ...newStone, cost: parseFloat(e.target.value) || 0 })}
                    step="0.01"
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div className="col-span-2">
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.customOrderJewelry.notes2', 'Notes')}
                  </label>
                  <input
                    type="text"
                    value={newStone.notes}
                    onChange={(e) => setNewStone({ ...newStone, notes: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowStoneModal(false)}
                  className={`px-4 py-2 rounded-lg ${
                    theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {t('tools.customOrderJewelry.cancel2', 'Cancel')}
                </button>
                <button
                  onClick={addStone}
                  className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7C73] transition-colors"
                >
                  {t('tools.customOrderJewelry.addStone3', 'Add Stone')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Order Modal */}
        {editingOrder && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Edit Order - {editingOrder.orderNumber}
                </h2>
                <button onClick={() => setEditingOrder(null)}>
                  <X className={`w-6 h-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.customOrderJewelry.status', 'Status')}
                  </label>
                  <select
                    value={editingOrder.status}
                    onChange={(e) => setEditingOrder({ ...editingOrder, status: e.target.value as OrderStatus })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.status} value={opt.status}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.customOrderJewelry.priority2', 'Priority')}
                  </label>
                  <select
                    value={editingOrder.priority}
                    onChange={(e) => setEditingOrder({ ...editingOrder, priority: e.target.value as 'standard' | 'rush' | 'urgent' })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="standard">{t('tools.customOrderJewelry.standard2', 'Standard')}</option>
                    <option value="rush">{t('tools.customOrderJewelry.rush2', 'Rush')}</option>
                    <option value="urgent">{t('tools.customOrderJewelry.urgent2', 'Urgent')}</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.customOrderJewelry.finalPrice', 'Final Price')}
                  </label>
                  <input
                    type="number"
                    value={editingOrder.finalPrice}
                    onChange={(e) => setEditingOrder({ ...editingOrder, finalPrice: parseFloat(e.target.value) || 0 })}
                    step="0.01"
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.customOrderJewelry.depositPaid', 'Deposit Paid')}
                  </label>
                  <select
                    value={editingOrder.depositPaid ? 'yes' : 'no'}
                    onChange={(e) => setEditingOrder({ ...editingOrder, depositPaid: e.target.value === 'yes' })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="no">{t('tools.customOrderJewelry.no', 'No')}</option>
                    <option value="yes">{t('tools.customOrderJewelry.yes', 'Yes')}</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.customOrderJewelry.notes3', 'Notes')}
                  </label>
                  <textarea
                    value={editingOrder.notes}
                    onChange={(e) => setEditingOrder({ ...editingOrder, notes: e.target.value })}
                    rows={3}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setEditingOrder(null)}
                  className={`px-4 py-2 rounded-lg ${
                    theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {t('tools.customOrderJewelry.cancel3', 'Cancel')}
                </button>
                <button
                  onClick={updateOrder}
                  className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7C73] transition-colors"
                >
                  {t('tools.customOrderJewelry.saveChanges', 'Save Changes')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Customer Form Modal */}
        {showCustomerForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-md w-full p-6`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.customOrderJewelry.addCustomer', 'Add Customer')}</h2>
                <button onClick={() => setShowCustomerForm(false)}>
                  <X className={`w-6 h-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.customOrderJewelry.firstName', 'First Name *')}
                    </label>
                    <input
                      type="text"
                      value={newCustomer.firstName}
                      onChange={(e) => setNewCustomer({ ...newCustomer, firstName: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.customOrderJewelry.lastName', 'Last Name *')}
                    </label>
                    <input
                      type="text"
                      value={newCustomer.lastName}
                      onChange={(e) => setNewCustomer({ ...newCustomer, lastName: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.customOrderJewelry.email', 'Email')}
                  </label>
                  <input
                    type="email"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.customOrderJewelry.phone', 'Phone')}
                  </label>
                  <input
                    type="tel"
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowCustomerForm(false)}
                  className={`px-4 py-2 rounded-lg ${
                    theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {t('tools.customOrderJewelry.cancel4', 'Cancel')}
                </button>
                <button
                  onClick={addCustomer}
                  className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7C73] transition-colors"
                >
                  {t('tools.customOrderJewelry.addCustomer3', 'Add Customer')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Validation Toast */}
        {validationMessage && (
          <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg z-50 max-w-sm">
            {validationMessage}
          </div>
        )}

        {/* Confirm Dialog */}
        <ConfirmDialog />
      </div>
    </div>
  );
};

export default CustomOrderJewelryTool;
