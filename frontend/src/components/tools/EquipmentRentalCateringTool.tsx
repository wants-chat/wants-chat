'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  Package,
  Plus,
  Trash2,
  Save,
  Edit2,
  Search,
  Calendar,
  DollarSign,
  Truck,
  CheckCircle,
  AlertCircle,
  X,
  Box,
  ClipboardList,
  ArrowLeft,
  ArrowRight,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  FileText,
} from 'lucide-react';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
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

interface EquipmentRentalCateringToolProps {
  uiConfig?: UIConfig;
}
import { useTheme } from '@/contexts/ThemeContext';

// Types
type EquipmentCategory = 'tables' | 'chairs' | 'linens' | 'tableware' | 'cooking' | 'serving' | 'beverage' | 'display' | 'lighting' | 'other';
type RentalStatus = 'available' | 'reserved' | 'out' | 'returned' | 'maintenance' | 'damaged';
type OrderStatus = 'pending' | 'confirmed' | 'delivered' | 'active' | 'picked-up' | 'completed' | 'cancelled';

interface EquipmentItem {
  id: string;
  name: string;
  category: EquipmentCategory;
  description: string;
  dailyRate: number;
  weeklyRate: number;
  quantity: number;
  availableQty: number;
  condition: 'excellent' | 'good' | 'fair' | 'needs-repair';
  dimensions?: string;
  color?: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface RentalOrder {
  id: string;
  orderNumber: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  eventName: string;
  eventDate: string;
  deliveryDate: string;
  deliveryTime: string;
  deliveryAddress: string;
  pickupDate: string;
  pickupTime: string;
  items: RentalOrderItem[];
  subtotal: number;
  deliveryFee: number;
  damageDeposit: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  depositPaid: number;
  balanceDue: number;
  status: OrderStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface RentalOrderItem {
  equipmentId: string;
  equipmentName: string;
  quantity: number;
  dailyRate: number;
  days: number;
  subtotal: number;
}

// Constants
const EQUIPMENT_CATEGORIES: { category: EquipmentCategory; label: string; icon: string }[] = [
  { category: 'tables', label: 'Tables', icon: '🪑' },
  { category: 'chairs', label: 'Chairs', icon: '🪑' },
  { category: 'linens', label: 'Linens', icon: '🧵' },
  { category: 'tableware', label: 'Tableware', icon: '🍽️' },
  { category: 'cooking', label: 'Cooking Equipment', icon: '🍳' },
  { category: 'serving', label: 'Serving Equipment', icon: '🥄' },
  { category: 'beverage', label: 'Beverage Service', icon: '🥤' },
  { category: 'display', label: 'Display & Decor', icon: '🎨' },
  { category: 'lighting', label: 'Lighting', icon: '💡' },
  { category: 'other', label: 'Other', icon: '📦' },
];

const SAMPLE_EQUIPMENT: EquipmentItem[] = [
  { id: 'eq-1', name: '60" Round Table', category: 'tables', description: 'Seats 8-10 guests', dailyRate: 15, weeklyRate: 60, quantity: 50, availableQty: 45, condition: 'excellent', dimensions: '60" diameter x 30" height', notes: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'eq-2', name: '6ft Banquet Table', category: 'tables', description: 'Seats 6-8 guests', dailyRate: 12, weeklyRate: 48, quantity: 40, availableQty: 38, condition: 'excellent', dimensions: '72" x 30" x 30"', notes: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'eq-3', name: 'Chiavari Chair (Gold)', category: 'chairs', description: 'Elegant gold chiavari chair', dailyRate: 8, weeklyRate: 32, quantity: 200, availableQty: 180, condition: 'excellent', color: 'Gold', notes: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'eq-4', name: 'Folding Chair (White)', category: 'chairs', description: 'Standard white folding chair', dailyRate: 3, weeklyRate: 12, quantity: 300, availableQty: 280, condition: 'good', color: 'White', notes: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'eq-5', name: 'White Linen Tablecloth (120")', category: 'linens', description: 'Floor-length for 60" round', dailyRate: 12, weeklyRate: 48, quantity: 60, availableQty: 55, condition: 'excellent', color: 'White', notes: 'Professional laundering required', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'eq-6', name: 'Dinner Plate (10")', category: 'tableware', description: 'Classic white porcelain', dailyRate: 0.75, weeklyRate: 3, quantity: 500, availableQty: 480, condition: 'good', notes: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'eq-7', name: 'Chafing Dish (8qt)', category: 'serving', description: 'Stainless steel with fuel holders', dailyRate: 25, weeklyRate: 100, quantity: 30, availableQty: 28, condition: 'excellent', notes: 'Fuel cans not included', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'eq-8', name: 'Beverage Dispenser (3gal)', category: 'beverage', description: 'Glass with spigot', dailyRate: 15, weeklyRate: 60, quantity: 20, availableQty: 18, condition: 'excellent', notes: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

const DEFAULT_DELIVERY_FEE = 75;
const DEFAULT_DAMAGE_DEPOSIT = 200;
const DEFAULT_TAX_RATE = 0.08;

// Column configurations
const EQUIPMENT_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Name', type: 'string' },
  { key: 'category', header: 'Category', type: 'string' },
  { key: 'dailyRate', header: 'Daily Rate', type: 'currency' },
  { key: 'weeklyRate', header: 'Weekly Rate', type: 'currency' },
  { key: 'quantity', header: 'Total Qty', type: 'number' },
  { key: 'availableQty', header: 'Available', type: 'number' },
  { key: 'condition', header: 'Condition', type: 'string' },
];

const ORDER_COLUMNS: ColumnConfig[] = [
  { key: 'orderNumber', header: 'Order #', type: 'string' },
  { key: 'clientName', header: 'Client', type: 'string' },
  { key: 'eventName', header: 'Event', type: 'string' },
  { key: 'eventDate', header: 'Event Date', type: 'date' },
  { key: 'deliveryDate', header: 'Delivery', type: 'date' },
  { key: 'pickupDate', header: 'Pickup', type: 'date' },
  { key: 'total', header: 'Total', type: 'currency' },
  { key: 'status', header: 'Status', type: 'string' },
];

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);
const generateOrderNumber = () => `RNT-${Date.now().toString(36).toUpperCase()}`;

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const calculateRentalDays = (delivery: string, pickup: string): number => {
  const d1 = new Date(delivery);
  const d2 = new Date(pickup);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
};

// Main Component
export const EquipmentRentalCateringTool: React.FC<EquipmentRentalCateringToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const [isPrefilled, setIsPrefilled] = useState(false);
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // useToolData hooks for backend sync
  const {
    data: equipment,
    addItem: addEquipmentToBackend,
    updateItem: updateEquipmentBackend,
    deleteItem: deleteEquipmentBackend,
    isSynced: equipmentSynced,
    isSaving: equipmentSaving,
    lastSaved: equipmentLastSaved,
    syncError: equipmentSyncError,
    forceSync: forceEquipmentSync,
  } = useToolData<EquipmentItem>('catering-equipment', SAMPLE_EQUIPMENT, EQUIPMENT_COLUMNS);

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
  } = useToolData<RentalOrder>('catering-rental-orders', [], ORDER_COLUMNS);

  // Local UI State
  const [activeTab, setActiveTab] = useState<'orders' | 'inventory' | 'new-order'>('orders');
  const [showEquipmentForm, setShowEquipmentForm] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<EquipmentItem | null>(null);
  const [editingOrder, setEditingOrder] = useState<RentalOrder | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Equipment form state
  const [equipmentForm, setEquipmentForm] = useState<Partial<EquipmentItem>>({
    name: '',
    category: 'tables',
    description: '',
    dailyRate: 0,
    weeklyRate: 0,
    quantity: 1,
    availableQty: 1,
    condition: 'excellent',
    dimensions: '',
    color: '',
    notes: '',
  });

  // Order form state
  const [orderForm, setOrderForm] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    eventName: '',
    eventDate: '',
    deliveryDate: '',
    deliveryTime: '09:00',
    deliveryAddress: '',
    pickupDate: '',
    pickupTime: '17:00',
    notes: '',
  });

  const [selectedItems, setSelectedItems] = useState<RentalOrderItem[]>([]);

  // Prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.eventName || params.client) {
        setOrderForm(prev => ({
          ...prev,
          clientName: params.client || '',
          eventName: params.eventName || '',
          eventDate: params.eventDate || '',
          deliveryAddress: params.eventLocation || '',
        }));
        setActiveTab('new-order');
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Calculate order totals
  const calculateOrderTotals = () => {
    const subtotal = selectedItems.reduce((sum, item) => sum + item.subtotal, 0);
    const taxAmount = subtotal * DEFAULT_TAX_RATE;
    const total = subtotal + DEFAULT_DELIVERY_FEE + DEFAULT_DAMAGE_DEPOSIT + taxAmount;

    return { subtotal, deliveryFee: DEFAULT_DELIVERY_FEE, damageDeposit: DEFAULT_DAMAGE_DEPOSIT, taxAmount, total };
  };

  // Add item to order
  const addItemToOrder = (eq: EquipmentItem, quantity: number = 1) => {
    const days = orderForm.deliveryDate && orderForm.pickupDate
      ? calculateRentalDays(orderForm.deliveryDate, orderForm.pickupDate)
      : 1;

    const existingIndex = selectedItems.findIndex(item => item.equipmentId === eq.id);

    if (existingIndex >= 0) {
      const updated = [...selectedItems];
      updated[existingIndex].quantity += quantity;
      updated[existingIndex].days = days;
      updated[existingIndex].subtotal = updated[existingIndex].quantity * eq.dailyRate * days;
      setSelectedItems(updated);
    } else {
      setSelectedItems([...selectedItems, {
        equipmentId: eq.id,
        equipmentName: eq.name,
        quantity,
        dailyRate: eq.dailyRate,
        days,
        subtotal: quantity * eq.dailyRate * days,
      }]);
    }
  };

  // Update item quantity
  const updateItemQuantity = (equipmentId: string, quantity: number) => {
    if (quantity <= 0) {
      setSelectedItems(selectedItems.filter(item => item.equipmentId !== equipmentId));
    } else {
      setSelectedItems(selectedItems.map(item =>
        item.equipmentId === equipmentId
          ? { ...item, quantity, subtotal: quantity * item.dailyRate * item.days }
          : item
      ));
    }
  };

  // Remove item from order
  const removeItemFromOrder = (equipmentId: string) => {
    setSelectedItems(selectedItems.filter(item => item.equipmentId !== equipmentId));
  };

  // Update rental days when dates change
  useEffect(() => {
    if (orderForm.deliveryDate && orderForm.pickupDate) {
      const days = calculateRentalDays(orderForm.deliveryDate, orderForm.pickupDate);
      setSelectedItems(items => items.map(item => ({
        ...item,
        days,
        subtotal: item.quantity * item.dailyRate * days,
      })));
    }
  }, [orderForm.deliveryDate, orderForm.pickupDate]);

  // Save equipment
  const saveEquipment = () => {
    if (!equipmentForm.name || !equipmentForm.category) {
      setValidationMessage('Please fill in required fields');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const item: EquipmentItem = {
      id: editingEquipment?.id || generateId(),
      name: equipmentForm.name || '',
      category: equipmentForm.category as EquipmentCategory,
      description: equipmentForm.description || '',
      dailyRate: equipmentForm.dailyRate || 0,
      weeklyRate: equipmentForm.weeklyRate || 0,
      quantity: equipmentForm.quantity || 1,
      availableQty: equipmentForm.availableQty || 1,
      condition: equipmentForm.condition as EquipmentItem['condition'] || 'excellent',
      dimensions: equipmentForm.dimensions,
      color: equipmentForm.color,
      notes: equipmentForm.notes || '',
      createdAt: editingEquipment?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (editingEquipment) {
      updateEquipmentBackend(item.id, item);
    } else {
      addEquipmentToBackend(item);
    }

    resetEquipmentForm();
  };

  // Reset equipment form
  const resetEquipmentForm = () => {
    setShowEquipmentForm(false);
    setEditingEquipment(null);
    setEquipmentForm({
      name: '',
      category: 'tables',
      description: '',
      dailyRate: 0,
      weeklyRate: 0,
      quantity: 1,
      availableQty: 1,
      condition: 'excellent',
      dimensions: '',
      color: '',
      notes: '',
    });
  };

  // Save order
  const saveOrder = () => {
    if (!orderForm.clientName || !orderForm.eventDate || !orderForm.deliveryDate || selectedItems.length === 0) {
      setValidationMessage('Please fill in required fields and add at least one item');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const totals = calculateOrderTotals();

    const order: RentalOrder = {
      id: editingOrder?.id || generateId(),
      orderNumber: editingOrder?.orderNumber || generateOrderNumber(),
      clientName: orderForm.clientName,
      clientEmail: orderForm.clientEmail,
      clientPhone: orderForm.clientPhone,
      eventName: orderForm.eventName,
      eventDate: orderForm.eventDate,
      deliveryDate: orderForm.deliveryDate,
      deliveryTime: orderForm.deliveryTime,
      deliveryAddress: orderForm.deliveryAddress,
      pickupDate: orderForm.pickupDate,
      pickupTime: orderForm.pickupTime,
      items: selectedItems,
      subtotal: totals.subtotal,
      deliveryFee: totals.deliveryFee,
      damageDeposit: totals.damageDeposit,
      taxRate: DEFAULT_TAX_RATE,
      taxAmount: totals.taxAmount,
      total: totals.total,
      depositPaid: 0,
      balanceDue: totals.total,
      status: editingOrder?.status || 'pending',
      notes: orderForm.notes,
      createdAt: editingOrder?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (editingOrder) {
      updateOrderBackend(order.id, order);
    } else {
      addOrderToBackend(order);
    }

    resetOrderForm();
    setActiveTab('orders');
  };

  // Reset order form
  const resetOrderForm = () => {
    setEditingOrder(null);
    setOrderForm({
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      eventName: '',
      eventDate: '',
      deliveryDate: '',
      deliveryTime: '09:00',
      deliveryAddress: '',
      pickupDate: '',
      pickupTime: '17:00',
      notes: '',
    });
    setSelectedItems([]);
  };

  // Update order status
  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    updateOrderBackend(orderId, { status, updatedAt: new Date().toISOString() });
  };

  // Delete order
  const deleteOrder = async (orderId: string) => {
    const confirmed = await confirm({
      title: 'Confirm Deletion',
      message: 'Are you sure you want to delete this order?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteOrderBackend(orderId);
    }
  };

  // Filtered data
  const filteredEquipment = useMemo(() => {
    return equipment.filter(item => {
      const matchesSearch = searchTerm === '' ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [equipment, searchTerm, filterCategory]);

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = searchTerm === '' ||
        order.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, filterStatus]);

  // Stats
  const stats = useMemo(() => {
    const totalItems = equipment.reduce((sum, e) => sum + e.quantity, 0);
    const availableItems = equipment.reduce((sum, e) => sum + e.availableQty, 0);
    const activeOrders = orders.filter(o => ['confirmed', 'delivered', 'active'].includes(o.status)).length;
    const pendingRevenue = orders.filter(o => o.status !== 'cancelled' && o.status !== 'completed')
      .reduce((sum, o) => sum + o.balanceDue, 0);
    return { totalItems, availableItems, activeOrders, pendingRevenue };
  }, [equipment, orders]);

  const orderTotals = calculateOrderTotals();

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.equipmentRentalCatering.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
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
                  {t('tools.equipmentRentalCatering.equipmentRental', 'Equipment Rental')}
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.equipmentRentalCatering.manageCateringEquipmentRentalsAnd', 'Manage catering equipment rentals and inventory')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="equipment-rental-catering" toolName="Equipment Rental Catering" />

              <SyncStatus
                isSynced={equipmentSynced && ordersSynced}
                isSaving={equipmentSaving || ordersSaving}
                lastSaved={equipmentLastSaved || ordersLastSaved}
                syncError={equipmentSyncError || ordersSyncError}
                onForceSync={() => { forceEquipmentSync(); forceOrdersSync(); }}
                theme={theme}
                showLabel={true}
                size="md"
              />
              <ExportDropdown
                onExportCSV={() => exportToCSV(orders, ORDER_COLUMNS, { filename: 'rental-orders' })}
                onExportExcel={() => exportToExcel(orders, ORDER_COLUMNS, { filename: 'rental-orders' })}
                onExportJSON={() => exportToJSON(orders, { filename: 'rental-orders' })}
                onExportPDF={async () => {
                  await exportToPDF(orders, ORDER_COLUMNS, {
                    filename: 'rental-orders',
                    title: 'Equipment Rental Orders',
                  });
                }}
                onPrint={() => printData(orders, ORDER_COLUMNS, { title: 'Rental Orders' })}
                onCopyToClipboard={async () => await copyUtil(orders, ORDER_COLUMNS, 'tab')}
                showImport={false}
                theme={theme}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.equipmentRentalCatering.totalInventory', 'Total Inventory')}</p>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stats.totalItems}</p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.equipmentRentalCatering.available', 'Available')}</p>
              <p className={`text-2xl font-bold text-green-500`}>{stats.availableItems}</p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.equipmentRentalCatering.activeOrders', 'Active Orders')}</p>
              <p className={`text-2xl font-bold text-blue-500`}>{stats.activeOrders}</p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.equipmentRentalCatering.pendingRevenue', 'Pending Revenue')}</p>
              <p className={`text-2xl font-bold text-[#0D9488]`}>{formatCurrency(stats.pendingRevenue)}</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'orders', label: 'Orders', icon: <ClipboardList className="w-4 h-4" /> },
              { id: 'inventory', label: 'Inventory', icon: <Box className="w-4 h-4" /> },
              { id: 'new-order', label: 'New Order', icon: <Plus className="w-4 h-4" /> },
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
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                  <input
                    type="text"
                    placeholder={t('tools.equipmentRentalCatering.searchOrders', 'Search orders...')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`pl-10 pr-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className={`px-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                >
                  <option value="all">{t('tools.equipmentRentalCatering.allStatus', 'All Status')}</option>
                  <option value="pending">{t('tools.equipmentRentalCatering.pending', 'Pending')}</option>
                  <option value="confirmed">{t('tools.equipmentRentalCatering.confirmed', 'Confirmed')}</option>
                  <option value="delivered">{t('tools.equipmentRentalCatering.delivered', 'Delivered')}</option>
                  <option value="active">{t('tools.equipmentRentalCatering.active', 'Active')}</option>
                  <option value="picked-up">{t('tools.equipmentRentalCatering.pickedUp', 'Picked Up')}</option>
                  <option value="completed">{t('tools.equipmentRentalCatering.completed', 'Completed')}</option>
                  <option value="cancelled">{t('tools.equipmentRentalCatering.cancelled', 'Cancelled')}</option>
                </select>
              </div>
              <button
                onClick={() => { resetOrderForm(); setActiveTab('new-order'); }}
                className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90"
              >
                <Plus className="w-4 h-4" />
                {t('tools.equipmentRentalCatering.newOrder', 'New Order')}
              </button>
            </div>

            {/* Orders List */}
            <div className="space-y-4">
              {filteredOrders.length === 0 ? (
                <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  <ClipboardList className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{t('tools.equipmentRentalCatering.noOrdersFoundCreateYour', 'No orders found. Create your first rental order!')}</p>
                </div>
              ) : (
                filteredOrders.map(order => (
                  <div key={order.id} className={`p-4 border rounded-lg ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{order.orderNumber}</p>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            order.status === 'completed' ? 'bg-green-100 text-green-700' :
                            order.status === 'active' ? 'bg-blue-100 text-blue-700' :
                            order.status === 'delivered' ? 'bg-purple-100 text-purple-700' :
                            order.status === 'confirmed' ? 'bg-cyan-100 text-cyan-700' :
                            order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('-', ' ')}
                          </span>
                        </div>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {order.clientName} | {order.eventName}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-[#0D9488]">{formatCurrency(order.total)}</p>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          Event: {formatDate(order.eventDate)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mb-3 text-sm">
                      <span className={`flex items-center gap-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        <Truck className="w-4 h-4" />
                        Delivery: {formatDate(order.deliveryDate)}
                      </span>
                      <span className={`flex items-center gap-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        <ArrowLeft className="w-4 h-4" />
                        Pickup: {formatDate(order.pickupDate)}
                      </span>
                      <span className={`flex items-center gap-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        <Box className="w-4 h-4" />
                        {order.items.length} items
                      </span>
                    </div>

                    <div className="flex justify-end gap-2">
                      {order.status === 'pending' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'confirmed')}
                          className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                        >
                          <CheckCircle className="w-3 h-3" />
                          {t('tools.equipmentRentalCatering.confirm', 'Confirm')}
                        </button>
                      )}
                      {order.status === 'confirmed' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'delivered')}
                          className="flex items-center gap-1 px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 text-sm"
                        >
                          <Truck className="w-3 h-3" />
                          {t('tools.equipmentRentalCatering.markDelivered', 'Mark Delivered')}
                        </button>
                      )}
                      {order.status === 'delivered' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'active')}
                          className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                        >
                          <CheckCircle className="w-3 h-3" />
                          {t('tools.equipmentRentalCatering.markActive', 'Mark Active')}
                        </button>
                      )}
                      {order.status === 'active' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'picked-up')}
                          className="flex items-center gap-1 px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 text-sm"
                        >
                          <ArrowLeft className="w-3 h-3" />
                          {t('tools.equipmentRentalCatering.markPickedUp', 'Mark Picked Up')}
                        </button>
                      )}
                      {order.status === 'picked-up' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'completed')}
                          className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                        >
                          <CheckCircle className="w-3 h-3" />
                          {t('tools.equipmentRentalCatering.complete', 'Complete')}
                        </button>
                      )}
                      <button
                        onClick={() => deleteOrder(order.id)}
                        className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                  <input
                    type="text"
                    placeholder={t('tools.equipmentRentalCatering.searchEquipment', 'Search equipment...')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`pl-10 pr-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </div>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className={`px-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                >
                  <option value="all">{t('tools.equipmentRentalCatering.allCategories', 'All Categories')}</option>
                  {EQUIPMENT_CATEGORIES.map(cat => (
                    <option key={cat.category} value={cat.category}>{cat.label}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => setShowEquipmentForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90"
              >
                <Plus className="w-4 h-4" />
                {t('tools.equipmentRentalCatering.addEquipment', 'Add Equipment')}
              </button>
            </div>

            {/* Equipment Form Modal */}
            {showEquipmentForm && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-md w-full`}>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {editingEquipment ? t('tools.equipmentRentalCatering.editEquipment', 'Edit Equipment') : t('tools.equipmentRentalCatering.addEquipment2', 'Add Equipment')}
                      </h2>
                      <button onClick={resetEquipmentForm} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg">
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.equipmentRentalCatering.name', 'Name *')}</label>
                        <input
                          type="text"
                          value={equipmentForm.name}
                          onChange={(e) => setEquipmentForm({ ...equipmentForm, name: e.target.value })}
                          className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.equipmentRentalCatering.category', 'Category')}</label>
                        <select
                          value={equipmentForm.category}
                          onChange={(e) => setEquipmentForm({ ...equipmentForm, category: e.target.value as EquipmentCategory })}
                          className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                        >
                          {EQUIPMENT_CATEGORIES.map(cat => (
                            <option key={cat.category} value={cat.category}>{cat.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.equipmentRentalCatering.description', 'Description')}</label>
                        <textarea
                          value={equipmentForm.description}
                          onChange={(e) => setEquipmentForm({ ...equipmentForm, description: e.target.value })}
                          rows={2}
                          className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.equipmentRentalCatering.dailyRate', 'Daily Rate')}</label>
                          <input
                            type="number"
                            value={equipmentForm.dailyRate}
                            onChange={(e) => setEquipmentForm({ ...equipmentForm, dailyRate: parseFloat(e.target.value) || 0 })}
                            step="0.01"
                            min="0"
                            className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                          />
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.equipmentRentalCatering.weeklyRate', 'Weekly Rate')}</label>
                          <input
                            type="number"
                            value={equipmentForm.weeklyRate}
                            onChange={(e) => setEquipmentForm({ ...equipmentForm, weeklyRate: parseFloat(e.target.value) || 0 })}
                            step="0.01"
                            min="0"
                            className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                          />
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.equipmentRentalCatering.totalQty', 'Total Qty')}</label>
                          <input
                            type="number"
                            value={equipmentForm.quantity}
                            onChange={(e) => setEquipmentForm({ ...equipmentForm, quantity: parseInt(e.target.value) || 1 })}
                            min="1"
                            className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                          />
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.equipmentRentalCatering.availableQty', 'Available Qty')}</label>
                          <input
                            type="number"
                            value={equipmentForm.availableQty}
                            onChange={(e) => setEquipmentForm({ ...equipmentForm, availableQty: parseInt(e.target.value) || 1 })}
                            min="0"
                            className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                          />
                        </div>
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.equipmentRentalCatering.condition', 'Condition')}</label>
                        <select
                          value={equipmentForm.condition}
                          onChange={(e) => setEquipmentForm({ ...equipmentForm, condition: e.target.value as EquipmentItem['condition'] })}
                          className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                        >
                          <option value="excellent">{t('tools.equipmentRentalCatering.excellent', 'Excellent')}</option>
                          <option value="good">{t('tools.equipmentRentalCatering.good', 'Good')}</option>
                          <option value="fair">{t('tools.equipmentRentalCatering.fair', 'Fair')}</option>
                          <option value="needs-repair">{t('tools.equipmentRentalCatering.needsRepair', 'Needs Repair')}</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                      <button onClick={resetEquipmentForm} className={`px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}>
                        {t('tools.equipmentRentalCatering.cancel', 'Cancel')}
                      </button>
                      <button onClick={saveEquipment} className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90">
                        <Save className="w-4 h-4" />
                        {editingEquipment ? t('tools.equipmentRentalCatering.update', 'Update') : t('tools.equipmentRentalCatering.add', 'Add')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Equipment Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEquipment.map(item => (
                <div key={item.id} className={`p-4 border rounded-lg ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{item.name}</h3>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {EQUIPMENT_CATEGORIES.find(c => c.category === item.category)?.icon} {EQUIPMENT_CATEGORIES.find(c => c.category === item.category)?.label}
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      item.condition === 'excellent' ? 'bg-green-100 text-green-700' :
                      item.condition === 'good' ? 'bg-blue-100 text-blue-700' :
                      item.condition === 'fair' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {item.condition}
                    </span>
                  </div>
                  <p className={`text-sm mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{item.description}</p>
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <span className="text-[#0D9488] font-semibold">{formatCurrency(item.dailyRate)}</span>
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>/day</span>
                    </div>
                    <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      <span className="text-green-500 font-medium">{item.availableQty}</span>/{item.quantity} available
                    </div>
                  </div>
                  <div className="flex justify-end gap-1">
                    <button
                      onClick={() => { setEditingEquipment(item); setEquipmentForm({ ...item }); setShowEquipmentForm(true); }}
                      className={`p-1 rounded ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteEquipmentBackend(item.id)}
                      className="p-1 rounded hover:bg-red-100 text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* New Order Tab */}
        {activeTab === 'new-order' && (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <h2 className={`text-xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.equipmentRentalCatering.createRentalOrder', 'Create Rental Order')}</h2>

            <div className="grid grid-cols-3 gap-6">
              {/* Order Details */}
              <div className="col-span-1 space-y-4">
                <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.equipmentRentalCatering.orderDetails', 'Order Details')}</h3>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.equipmentRentalCatering.clientName', 'Client Name *')}</label>
                  <input
                    type="text"
                    value={orderForm.clientName}
                    onChange={(e) => setOrderForm({ ...orderForm, clientName: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.equipmentRentalCatering.email', 'Email')}</label>
                  <input
                    type="email"
                    value={orderForm.clientEmail}
                    onChange={(e) => setOrderForm({ ...orderForm, clientEmail: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.equipmentRentalCatering.phone', 'Phone')}</label>
                  <input
                    type="tel"
                    value={orderForm.clientPhone}
                    onChange={(e) => setOrderForm({ ...orderForm, clientPhone: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.equipmentRentalCatering.eventName', 'Event Name')}</label>
                  <input
                    type="text"
                    value={orderForm.eventName}
                    onChange={(e) => setOrderForm({ ...orderForm, eventName: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.equipmentRentalCatering.eventDate', 'Event Date *')}</label>
                  <input
                    type="date"
                    value={orderForm.eventDate}
                    onChange={(e) => setOrderForm({ ...orderForm, eventDate: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.equipmentRentalCatering.deliveryDate', 'Delivery Date *')}</label>
                    <input
                      type="date"
                      value={orderForm.deliveryDate}
                      onChange={(e) => setOrderForm({ ...orderForm, deliveryDate: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.equipmentRentalCatering.time', 'Time')}</label>
                    <input
                      type="time"
                      value={orderForm.deliveryTime}
                      onChange={(e) => setOrderForm({ ...orderForm, deliveryTime: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.equipmentRentalCatering.pickupDate', 'Pickup Date')}</label>
                    <input
                      type="date"
                      value={orderForm.pickupDate}
                      onChange={(e) => setOrderForm({ ...orderForm, pickupDate: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.equipmentRentalCatering.time2', 'Time')}</label>
                    <input
                      type="time"
                      value={orderForm.pickupTime}
                      onChange={(e) => setOrderForm({ ...orderForm, pickupTime: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.equipmentRentalCatering.deliveryAddress', 'Delivery Address')}</label>
                  <textarea
                    value={orderForm.deliveryAddress}
                    onChange={(e) => setOrderForm({ ...orderForm, deliveryAddress: e.target.value })}
                    rows={2}
                    className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </div>
              </div>

              {/* Equipment Selection */}
              <div className="col-span-1">
                <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.equipmentRentalCatering.selectEquipment', 'Select Equipment')}</h3>
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {equipment.filter(e => e.availableQty > 0).map(item => (
                    <div
                      key={item.id}
                      onClick={() => addItemToOrder(item)}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        theme === 'dark' ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'
                      } ${selectedItems.some(i => i.equipmentId === item.id) ? 'border-[#0D9488] bg-[#0D9488]/10' : ''}`}
                    >
                      <div className="flex justify-between">
                        <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{item.name}</span>
                        <span className="text-[#0D9488]">{formatCurrency(item.dailyRate)}/day</span>
                      </div>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {item.availableQty} available
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Selected Items & Summary */}
              <div className="col-span-1">
                <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.equipmentRentalCatering.orderSummary', 'Order Summary')}</h3>

                <div className="space-y-2 mb-4 max-h-[300px] overflow-y-auto">
                  {selectedItems.length === 0 ? (
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.equipmentRentalCatering.noItemsSelected', 'No items selected')}</p>
                  ) : (
                    selectedItems.map(item => (
                      <div key={item.equipmentId} className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <div className="flex justify-between items-start mb-2">
                          <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{item.equipmentName}</span>
                          <button onClick={() => removeItemFromOrder(item.equipmentId)} className="text-red-500">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateItemQuantity(item.equipmentId, item.quantity - 1)}
                              className={`w-6 h-6 rounded ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'}`}
                            >
                              -
                            </button>
                            <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{item.quantity}</span>
                            <button
                              onClick={() => updateItemQuantity(item.equipmentId, item.quantity + 1)}
                              className={`w-6 h-6 rounded ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'}`}
                            >
                              +
                            </button>
                          </div>
                          <span className="text-[#0D9488]">{formatCurrency(item.subtotal)}</span>
                        </div>
                        <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {item.days} day(s) x {formatCurrency(item.dailyRate)}/day
                        </p>
                      </div>
                    ))
                  )}
                </div>

                {/* Totals */}
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>{t('tools.equipmentRentalCatering.subtotal', 'Subtotal')}</span>
                      <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{formatCurrency(orderTotals.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>{t('tools.equipmentRentalCatering.deliveryFee', 'Delivery Fee')}</span>
                      <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{formatCurrency(orderTotals.deliveryFee)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>{t('tools.equipmentRentalCatering.damageDeposit', 'Damage Deposit')}</span>
                      <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{formatCurrency(orderTotals.damageDeposit)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>{t('tools.equipmentRentalCatering.tax8', 'Tax (8%)')}</span>
                      <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{formatCurrency(orderTotals.taxAmount)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{t('tools.equipmentRentalCatering.total', 'Total')}</span>
                      <span className="text-[#0D9488]">{formatCurrency(orderTotals.total)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={resetOrderForm}
                    className={`flex-1 px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                  >
                    {t('tools.equipmentRentalCatering.cancel2', 'Cancel')}
                  </button>
                  <button
                    onClick={saveOrder}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90"
                  >
                    <Save className="w-4 h-4" />
                    {t('tools.equipmentRentalCatering.createOrder', 'Create Order')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Validation Toast */}
        {validationMessage && (
          <div className="fixed bottom-4 left-4 right-4 max-w-sm mx-auto bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span>{validationMessage}</span>
          </div>
        )}

        <ConfirmDialog />
      </div>
    </div>
  );
};

export default EquipmentRentalCateringTool;
