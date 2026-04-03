'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Heart,
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
  Package,
  Flower2,
  FileText,
  Phone,
  Mail,
  MapPin,
  Users,
  Camera,
  Sparkles,
  Edit2,
  MessageSquare,
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
import { useConfirmDialog } from '../ui/ConfirmDialog';

interface WeddingFloristToolProps {
  uiConfig?: UIConfig;
}

import { useTheme } from '@/contexts/ThemeContext';

// Types
type WeddingStatus = 'inquiry' | 'proposal_sent' | 'booked' | 'in_progress' | 'completed' | 'cancelled';
type PaymentStatus = 'pending' | 'deposit_paid' | 'partially_paid' | 'paid_in_full';

interface WeddingOrder {
  id: string;
  // Couple Info
  bride: string;
  groom: string;
  email: string;
  phone: string;
  weddingDate: string;
  weddingTime: string;
  venue: string;
  venueAddress: string;
  ceremonyVenue?: string;
  receptionVenue?: string;
  // Wedding Details
  guestCount: number;
  colorScheme: string[];
  weddingStyle: string;
  // Floral Items
  items: WeddingFloralItem[];
  // Pricing
  subtotal: number;
  discount: number;
  deliveryFee: number;
  setupFee: number;
  total: number;
  deposit: number;
  depositPaid: number;
  balance: number;
  // Status
  status: WeddingStatus;
  paymentStatus: PaymentStatus;
  // Notes & Timeline
  consultationDate?: string;
  consultationNotes: string;
  designNotes: string;
  timeline: TimelineEvent[];
  // Meta
  referralSource?: string;
  createdAt: string;
  updatedAt: string;
}

interface WeddingFloralItem {
  id: string;
  category: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  flowers: string[];
  notes: string;
}

interface TimelineEvent {
  id: string;
  date: string;
  event: string;
  completed: boolean;
  notes?: string;
}

// Constants
const WEDDING_STATUSES: { value: WeddingStatus; label: string; color: string }[] = [
  { value: 'inquiry', label: 'Inquiry', color: 'gray' },
  { value: 'proposal_sent', label: 'Proposal Sent', color: 'blue' },
  { value: 'booked', label: 'Booked', color: 'green' },
  { value: 'in_progress', label: 'In Progress', color: 'yellow' },
  { value: 'completed', label: 'Completed', color: 'purple' },
  { value: 'cancelled', label: 'Cancelled', color: 'red' },
];

const PAYMENT_STATUSES: { value: PaymentStatus; label: string; color: string }[] = [
  { value: 'pending', label: 'Pending', color: 'gray' },
  { value: 'deposit_paid', label: 'Deposit Paid', color: 'blue' },
  { value: 'partially_paid', label: 'Partially Paid', color: 'yellow' },
  { value: 'paid_in_full', label: 'Paid in Full', color: 'green' },
];

const FLORAL_CATEGORIES = [
  { id: 'bridal', label: 'Bridal Party' },
  { id: 'ceremony', label: 'Ceremony' },
  { id: 'reception', label: 'Reception' },
  { id: 'decor', label: 'Decor & Accents' },
  { id: 'other', label: 'Other' },
];

const WEDDING_FLORAL_ITEMS = [
  // Bridal Party
  { category: 'bridal', name: 'Bridal Bouquet', basePrice: 175 },
  { category: 'bridal', name: 'Bridesmaid Bouquet', basePrice: 75 },
  { category: 'bridal', name: 'Maid of Honor Bouquet', basePrice: 95 },
  { category: 'bridal', name: 'Flower Girl Basket', basePrice: 45 },
  { category: 'bridal', name: 'Groom Boutonniere', basePrice: 20 },
  { category: 'bridal', name: 'Groomsmen Boutonniere', basePrice: 15 },
  { category: 'bridal', name: 'Father Boutonniere', basePrice: 15 },
  { category: 'bridal', name: 'Mother Corsage', basePrice: 35 },
  { category: 'bridal', name: 'Grandmother Corsage', basePrice: 30 },
  { category: 'bridal', name: 'Hair Flowers', basePrice: 45 },
  // Ceremony
  { category: 'ceremony', name: 'Altar Arrangement', basePrice: 150 },
  { category: 'ceremony', name: 'Arch/Arbor Flowers', basePrice: 350 },
  { category: 'ceremony', name: 'Aisle Markers', basePrice: 25 },
  { category: 'ceremony', name: 'Pew Decorations', basePrice: 20 },
  { category: 'ceremony', name: 'Unity Candle Arrangement', basePrice: 65 },
  // Reception
  { category: 'reception', name: 'Tall Centerpiece', basePrice: 125 },
  { category: 'reception', name: 'Low Centerpiece', basePrice: 75 },
  { category: 'reception', name: 'Sweetheart Table Arrangement', basePrice: 150 },
  { category: 'reception', name: 'Head Table Garland', basePrice: 200 },
  { category: 'reception', name: 'Cake Flowers', basePrice: 85 },
  { category: 'reception', name: 'Guest Book Table', basePrice: 55 },
  { category: 'reception', name: 'Bar Arrangement', basePrice: 65 },
  { category: 'reception', name: 'Cocktail Centerpiece', basePrice: 45 },
  // Decor
  { category: 'decor', name: 'Garland (per foot)', basePrice: 25 },
  { category: 'decor', name: 'Loose Flower Petals', basePrice: 35 },
  { category: 'decor', name: 'Candle Rings', basePrice: 25 },
  { category: 'decor', name: 'Wreath', basePrice: 125 },
];

const WEDDING_STYLES = [
  'Classic/Traditional',
  'Romantic',
  'Rustic/Country',
  'Modern/Contemporary',
  'Bohemian',
  'Garden/Outdoor',
  'Beach/Coastal',
  'Vintage',
  'Glamorous',
  'Minimalist',
];

// Column configurations for exports
const ORDER_COLUMNS: ColumnConfig[] = [
  { key: 'bride', header: 'Bride', type: 'string' },
  { key: 'groom', header: 'Groom', type: 'string' },
  { key: 'email', header: 'Email', type: 'string' },
  { key: 'phone', header: 'Phone', type: 'string' },
  { key: 'weddingDate', header: 'Wedding Date', type: 'date' },
  { key: 'venue', header: 'Venue', type: 'string' },
  { key: 'guestCount', header: 'Guests', type: 'number' },
  { key: 'total', header: 'Total', type: 'currency' },
  { key: 'depositPaid', header: 'Deposit Paid', type: 'currency' },
  { key: 'balance', header: 'Balance', type: 'currency' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'paymentStatus', header: 'Payment', type: 'string' },
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
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Main Component
export const WeddingFloristTool: React.FC<WeddingFloristToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const [isPrefilled, setIsPrefilled] = useState(false);
  const { theme } = useTheme();
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirmDialog();

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
  } = useToolData<WeddingOrder>('florist-weddings', [], ORDER_COLUMNS);

  // Local UI State
  const [activeTab, setActiveTab] = useState<'orders' | 'new-order' | 'calendar'>('orders');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);

  // New order form state
  const [newOrder, setNewOrder] = useState<Partial<WeddingOrder>>({
    bride: '',
    groom: '',
    email: '',
    phone: '',
    weddingDate: '',
    weddingTime: '',
    venue: '',
    venueAddress: '',
    guestCount: 100,
    colorScheme: [],
    weddingStyle: 'Romantic',
    items: [],
    subtotal: 0,
    discount: 0,
    deliveryFee: 100,
    setupFee: 150,
    total: 0,
    deposit: 0,
    depositPaid: 0,
    balance: 0,
    status: 'inquiry',
    paymentStatus: 'pending',
    consultationNotes: '',
    designNotes: '',
    timeline: [],
  });

  const [newItem, setNewItem] = useState<Partial<WeddingFloralItem>>({
    category: 'bridal',
    name: '',
    description: '',
    quantity: 1,
    unitPrice: 0,
    flowers: [],
    notes: '',
  });

  const [newColor, setNewColor] = useState('#ff69b4');

  // Prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params;
      if (params.bride || params.groom || params.couple) {
        const couple = params.couple?.split('&') || [];
        setNewOrder((prev) => ({
          ...prev,
          bride: params.bride || couple[0]?.trim() || '',
          groom: params.groom || couple[1]?.trim() || '',
          email: params.email || '',
          phone: params.phone || '',
          weddingDate: params.weddingDate || params.date || '',
          venue: params.venue || '',
          guestCount: params.guestCount || params.guests || 100,
          weddingStyle: params.style || 'Romantic',
        }));
        setActiveTab('new-order');
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Calculate totals
  const calculateTotals = (items: WeddingFloralItem[], discount: number, deliveryFee: number, setupFee: number) => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const total = subtotal - discount + deliveryFee + setupFee;
    const depositAmount = Math.round(total * 0.5); // 50% deposit
    return { subtotal, total, deposit: depositAmount };
  };

  // Add item to order
  const addItemToOrder = () => {
    if (!newItem.name) return;

    const item: WeddingFloralItem = {
      id: generateId(),
      category: newItem.category || 'other',
      name: newItem.name || '',
      description: newItem.description || '',
      quantity: newItem.quantity || 1,
      unitPrice: newItem.unitPrice || 0,
      total: (newItem.quantity || 1) * (newItem.unitPrice || 0),
      flowers: newItem.flowers || [],
      notes: newItem.notes || '',
    };

    const updatedItems = [...(newOrder.items || []), item];
    const { subtotal, total, deposit } = calculateTotals(
      updatedItems,
      newOrder.discount || 0,
      newOrder.deliveryFee || 100,
      newOrder.setupFee || 150
    );

    setNewOrder((prev) => ({
      ...prev,
      items: updatedItems,
      subtotal,
      total,
      deposit,
      balance: total - (prev.depositPaid || 0),
    }));

    setNewItem({
      category: 'bridal',
      name: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
      flowers: [],
      notes: '',
    });
  };

  // Remove item from order
  const removeItemFromOrder = (itemId: string) => {
    const updatedItems = newOrder.items?.filter((i) => i.id !== itemId) || [];
    const { subtotal, total, deposit } = calculateTotals(
      updatedItems,
      newOrder.discount || 0,
      newOrder.deliveryFee || 100,
      newOrder.setupFee || 150
    );

    setNewOrder((prev) => ({
      ...prev,
      items: updatedItems,
      subtotal,
      total,
      deposit,
      balance: total - (prev.depositPaid || 0),
    }));
  };

  // Add color
  const addColor = () => {
    if (newOrder.colorScheme?.includes(newColor)) return;
    setNewOrder((prev) => ({
      ...prev,
      colorScheme: [...(prev.colorScheme || []), newColor],
    }));
  };

  // Remove color
  const removeColor = (color: string) => {
    setNewOrder((prev) => ({
      ...prev,
      colorScheme: prev.colorScheme?.filter((c) => c !== color) || [],
    }));
  };

  // Submit new order
  const submitOrder = () => {
    if (!newOrder.bride || !newOrder.groom || !newOrder.weddingDate) {
      setValidationMessage('Please fill in bride name, groom name, and wedding date');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const { subtotal, total, deposit } = calculateTotals(
      newOrder.items || [],
      newOrder.discount || 0,
      newOrder.deliveryFee || 100,
      newOrder.setupFee || 150
    );

    const order: WeddingOrder = {
      id: generateId(),
      bride: newOrder.bride || '',
      groom: newOrder.groom || '',
      email: newOrder.email || '',
      phone: newOrder.phone || '',
      weddingDate: newOrder.weddingDate || '',
      weddingTime: newOrder.weddingTime || '',
      venue: newOrder.venue || '',
      venueAddress: newOrder.venueAddress || '',
      ceremonyVenue: newOrder.ceremonyVenue,
      receptionVenue: newOrder.receptionVenue,
      guestCount: newOrder.guestCount || 100,
      colorScheme: newOrder.colorScheme || [],
      weddingStyle: newOrder.weddingStyle || 'Romantic',
      items: newOrder.items || [],
      subtotal,
      discount: newOrder.discount || 0,
      deliveryFee: newOrder.deliveryFee || 100,
      setupFee: newOrder.setupFee || 150,
      total,
      deposit,
      depositPaid: newOrder.depositPaid || 0,
      balance: total - (newOrder.depositPaid || 0),
      status: newOrder.status || 'inquiry',
      paymentStatus: newOrder.paymentStatus || 'pending',
      consultationDate: newOrder.consultationDate,
      consultationNotes: newOrder.consultationNotes || '',
      designNotes: newOrder.designNotes || '',
      timeline: newOrder.timeline || [],
      referralSource: newOrder.referralSource,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addOrderToBackend(order);

    // Reset form
    setNewOrder({
      bride: '',
      groom: '',
      email: '',
      phone: '',
      weddingDate: '',
      weddingTime: '',
      venue: '',
      venueAddress: '',
      guestCount: 100,
      colorScheme: [],
      weddingStyle: 'Romantic',
      items: [],
      subtotal: 0,
      discount: 0,
      deliveryFee: 100,
      setupFee: 150,
      total: 0,
      deposit: 0,
      depositPaid: 0,
      balance: 0,
      status: 'inquiry',
      paymentStatus: 'pending',
      consultationNotes: '',
      designNotes: '',
      timeline: [],
    });

    setActiveTab('orders');
  };

  // Update order status
  const updateOrderStatus = (orderId: string, status: WeddingStatus) => {
    updateOrderBackend(orderId, { status, updatedAt: new Date().toISOString() });
  };

  // Update payment status
  const updatePaymentStatus = (orderId: string, paymentStatus: PaymentStatus) => {
    updateOrderBackend(orderId, { paymentStatus, updatedAt: new Date().toISOString() });
  };

  // Delete order
  const deleteOrder = async (orderId: string) => {
    const confirmed = await confirm({
      title: 'Delete Wedding Order',
      message: 'Are you sure you want to delete this wedding order?',
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
        `${order.bride} ${order.groom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.venue.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, filterStatus]);

  // Upcoming weddings (sorted by date)
  const upcomingWeddings = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return orders
      .filter((o) => o.weddingDate >= today && o.status !== 'cancelled' && o.status !== 'completed')
      .sort((a, b) => a.weddingDate.localeCompare(b.weddingDate));
  }, [orders]);

  // Statistics
  const stats = useMemo(() => {
    const bookedOrders = orders.filter((o) => o.status === 'booked' || o.status === 'in_progress');
    const totalRevenue = orders.filter((o) => o.status === 'completed').reduce((sum, o) => sum + o.total, 0);
    const pendingRevenue = bookedOrders.reduce((sum, o) => sum + o.balance, 0);
    const depositsReceived = orders.reduce((sum, o) => sum + o.depositPaid, 0);

    return {
      totalOrders: orders.length,
      bookedWeddings: bookedOrders.length,
      upcomingCount: upcomingWeddings.length,
      totalRevenue,
      pendingRevenue,
      depositsReceived,
    };
  }, [orders, upcomingWeddings]);

  const getStatusColor = (status: WeddingStatus) => {
    const statusConfig = WEDDING_STATUSES.find((s) => s.value === status);
    const colorMap: Record<string, string> = {
      gray: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      green: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      red: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    };
    return colorMap[statusConfig?.color || 'gray'];
  };

  const getPaymentStatusColor = (status: PaymentStatus) => {
    const statusConfig = PAYMENT_STATUSES.find((s) => s.value === status);
    const colorMap: Record<string, string> = {
      gray: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      green: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    };
    return colorMap[statusConfig?.color || 'gray'];
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <ConfirmDialog />
      {/* Validation Message Toast */}
      {validationMessage && (
        <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
          {validationMessage}
        </div>
      )}
      <div className="max-w-7xl mx-auto">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-pink-500/10 rounded-xl border border-pink-500/20">
            <Sparkles className="w-4 h-4 text-pink-500" />
            <span className="text-sm text-pink-500 font-medium">{t('tools.weddingFlorist.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-pink-500 rounded-lg">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.weddingFlorist.weddingFlowers', 'Wedding Flowers')}
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.weddingFlorist.manageWeddingFloralOrdersAnd', 'Manage wedding floral orders and consultations')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="wedding-florist" toolName="Wedding Florist" />

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
                onExportCSV={() => exportToCSV(orders, ORDER_COLUMNS, { filename: 'wedding-orders' })}
                onExportExcel={() => exportToExcel(orders, ORDER_COLUMNS, { filename: 'wedding-orders' })}
                onExportJSON={() => exportToJSON(orders, { filename: 'wedding-orders' })}
                onExportPDF={async () => {
                  await exportToPDF(orders, ORDER_COLUMNS, {
                    filename: 'wedding-orders',
                    title: 'Wedding Flower Orders',
                    subtitle: `${orders.length} orders`,
                  });
                }}
                onPrint={() => printData(orders, ORDER_COLUMNS, { title: 'Wedding Flower Orders' })}
                onCopyToClipboard={async () => await copyUtil(orders, ORDER_COLUMNS, 'tab')}
                showImport={false}
                theme={theme}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-4">
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.weddingFlorist.totalOrders', 'Total Orders')}</p>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stats.totalOrders}</p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.weddingFlorist.booked', 'Booked')}</p>
              <p className={`text-2xl font-bold text-green-500`}>{stats.bookedWeddings}</p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.weddingFlorist.upcoming', 'Upcoming')}</p>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stats.upcomingCount}</p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.weddingFlorist.revenue', 'Revenue')}</p>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(stats.totalRevenue)}</p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.weddingFlorist.pending', 'Pending')}</p>
              <p className={`text-2xl font-bold text-yellow-500`}>{formatCurrency(stats.pendingRevenue)}</p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.weddingFlorist.deposits', 'Deposits')}</p>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(stats.depositsReceived)}</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'orders', label: 'All Orders', icon: <Package className="w-4 h-4" /> },
              { id: 'new-order', label: 'New Wedding', icon: <Plus className="w-4 h-4" /> },
              { id: 'calendar', label: 'Calendar', icon: <Calendar className="w-4 h-4" /> },
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
                    placeholder={t('tools.weddingFlorist.searchByCoupleNameVenue', 'Search by couple name, venue, or email...')}
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
                <option value="all">{t('tools.weddingFlorist.allStatuses', 'All Statuses')}</option>
                {WEDDING_STATUSES.map((status) => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>

            {/* Orders List */}
            <div className="space-y-4">
              {filteredOrders.length === 0 ? (
                <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{t('tools.weddingFlorist.noWeddingOrdersFound', 'No wedding orders found')}</p>
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
                            <Heart className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                          </div>
                          <div>
                            <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {order.bride} & {order.groom}
                            </h3>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {formatDate(order.weddingDate)} - {order.venue}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {formatCurrency(order.total)}
                            </p>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              Balance: {formatCurrency(order.balance)}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {WEDDING_STATUSES.find((s) => s.value === order.status)?.label}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                            {PAYMENT_STATUSES.find((s) => s.value === order.paymentStatus)?.label}
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
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.weddingFlorist.contact', 'Contact')}</p>
                            <p className={`flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              <Phone className="w-4 h-4" /> {order.phone || 'N/A'}
                            </p>
                            <p className={`flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              <Mail className="w-4 h-4" /> {order.email || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.weddingFlorist.weddingDetails', 'Wedding Details')}</p>
                            <p className={`flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              <Users className="w-4 h-4" /> {order.guestCount} guests
                            </p>
                            <p className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              Style: {order.weddingStyle}
                            </p>
                          </div>
                          <div>
                            <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.weddingFlorist.venue', 'Venue')}</p>
                            <p className={`flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              <MapPin className="w-4 h-4" /> {order.venue}
                            </p>
                            {order.venueAddress && (
                              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                {order.venueAddress}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Color Scheme */}
                        {order.colorScheme.length > 0 && (
                          <div className="mb-4">
                            <p className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.weddingFlorist.colorScheme', 'Color Scheme')}</p>
                            <div className="flex flex-wrap gap-2">
                              {order.colorScheme.map((color) => (
                                <span
                                  key={color}
                                  className="w-8 h-8 rounded-full border-2 border-white shadow"
                                  style={{ backgroundColor: color }}
                                  title={color}
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Floral Items */}
                        {order.items.length > 0 && (
                          <div className="mb-4">
                            <p className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.weddingFlorist.floralItems', 'Floral Items')}</p>
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                    <th className="text-left py-2">{t('tools.weddingFlorist.item', 'Item')}</th>
                                    <th className="text-left py-2">{t('tools.weddingFlorist.category', 'Category')}</th>
                                    <th className="text-right py-2">{t('tools.weddingFlorist.qty', 'Qty')}</th>
                                    <th className="text-right py-2">{t('tools.weddingFlorist.price', 'Price')}</th>
                                    <th className="text-right py-2">{t('tools.weddingFlorist.total', 'Total')}</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {order.items.map((item) => (
                                    <tr key={item.id} className={`border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                                      <td className={`py-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{item.name}</td>
                                      <td className={`py-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                        {FLORAL_CATEGORIES.find((c) => c.id === item.category)?.label}
                                      </td>
                                      <td className={`py-2 text-right ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{item.quantity}</td>
                                      <td className={`py-2 text-right ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(item.unitPrice)}</td>
                                      <td className={`py-2 text-right font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(item.total)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                                <tfoot className={`border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}>
                                  <tr>
                                    <td colSpan={4} className={`py-2 text-right ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.weddingFlorist.subtotal', 'Subtotal')}</td>
                                    <td className={`py-2 text-right font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(order.subtotal)}</td>
                                  </tr>
                                  {order.discount > 0 && (
                                    <tr>
                                      <td colSpan={4} className={`py-2 text-right ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.weddingFlorist.discount', 'Discount')}</td>
                                      <td className={`py-2 text-right font-medium text-green-500`}>-{formatCurrency(order.discount)}</td>
                                    </tr>
                                  )}
                                  <tr>
                                    <td colSpan={4} className={`py-2 text-right ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.weddingFlorist.deliverySetup', 'Delivery & Setup')}</td>
                                    <td className={`py-2 text-right font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(order.deliveryFee + order.setupFee)}</td>
                                  </tr>
                                  <tr>
                                    <td colSpan={4} className={`py-2 text-right font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.weddingFlorist.total2', 'Total')}</td>
                                    <td className={`py-2 text-right font-bold text-pink-500`}>{formatCurrency(order.total)}</td>
                                  </tr>
                                </tfoot>
                              </table>
                            </div>
                          </div>
                        )}

                        {/* Notes */}
                        {(order.consultationNotes || order.designNotes) && (
                          <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {order.consultationNotes && (
                              <div>
                                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.weddingFlorist.consultationNotes', 'Consultation Notes')}</p>
                                <p className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{order.consultationNotes}</p>
                              </div>
                            )}
                            {order.designNotes && (
                              <div>
                                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.weddingFlorist.designNotes', 'Design Notes')}</p>
                                <p className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{order.designNotes}</p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-wrap gap-2 mt-4">
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value as WeddingStatus)}
                            className={`px-3 py-1 rounded-lg text-sm border ${
                              theme === 'dark'
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          >
                            {WEDDING_STATUSES.map((status) => (
                              <option key={status.value} value={status.value}>{status.label}</option>
                            ))}
                          </select>
                          <select
                            value={order.paymentStatus}
                            onChange={(e) => updatePaymentStatus(order.id, e.target.value as PaymentStatus)}
                            className={`px-3 py-1 rounded-lg text-sm border ${
                              theme === 'dark'
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          >
                            {PAYMENT_STATUSES.map((status) => (
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
              {t('tools.weddingFlorist.newWeddingOrder', 'New Wedding Order')}
            </h2>

            {/* Couple Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.weddingFlorist.coupleInformation', 'Couple Information')}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.weddingFlorist.bride', 'Bride *')}
                    </label>
                    <input
                      type="text"
                      value={newOrder.bride}
                      onChange={(e) => setNewOrder({ ...newOrder, bride: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.weddingFlorist.groom', 'Groom *')}
                    </label>
                    <input
                      type="text"
                      value={newOrder.groom}
                      onChange={(e) => setNewOrder({ ...newOrder, groom: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.weddingFlorist.email', 'Email')}
                  </label>
                  <input
                    type="email"
                    value={newOrder.email}
                    onChange={(e) => setNewOrder({ ...newOrder, email: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.weddingFlorist.phone', 'Phone')}
                  </label>
                  <input
                    type="tel"
                    value={newOrder.phone}
                    onChange={(e) => setNewOrder({ ...newOrder, phone: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>

              {/* Wedding Details */}
              <div className="space-y-4">
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.weddingFlorist.weddingDetails2', 'Wedding Details')}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.weddingFlorist.weddingDate', 'Wedding Date *')}
                    </label>
                    <input
                      type="date"
                      value={newOrder.weddingDate}
                      onChange={(e) => setNewOrder({ ...newOrder, weddingDate: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.weddingFlorist.ceremonyTime', 'Ceremony Time')}
                    </label>
                    <input
                      type="time"
                      value={newOrder.weddingTime}
                      onChange={(e) => setNewOrder({ ...newOrder, weddingTime: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.weddingFlorist.venue2', 'Venue')}
                  </label>
                  <input
                    type="text"
                    value={newOrder.venue}
                    onChange={(e) => setNewOrder({ ...newOrder, venue: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.weddingFlorist.guestCount', 'Guest Count')}
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={newOrder.guestCount}
                      onChange={(e) => setNewOrder({ ...newOrder, guestCount: parseInt(e.target.value) || 0 })}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.weddingFlorist.weddingStyle', 'Wedding Style')}
                    </label>
                    <select
                      value={newOrder.weddingStyle}
                      onChange={(e) => setNewOrder({ ...newOrder, weddingStyle: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      {WEDDING_STYLES.map((style) => (
                        <option key={style} value={style}>{style}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Color Scheme */}
            <div className="mb-6">
              <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.weddingFlorist.colorScheme2', 'Color Scheme')}
              </h3>
              <div className="flex gap-4 items-center mb-4">
                <input
                  type="color"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  className="w-12 h-10 rounded cursor-pointer"
                />
                <button
                  onClick={addColor}
                  className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.weddingFlorist.addColor', 'Add Color')}
                </button>
              </div>
              {newOrder.colorScheme && newOrder.colorScheme.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {newOrder.colorScheme.map((color) => (
                    <div
                      key={color}
                      className="flex items-center gap-2 px-3 py-1 rounded-full text-white"
                      style={{ backgroundColor: color }}
                    >
                      {color}
                      <button onClick={() => removeColor(color)} className="hover:text-gray-200">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Floral Items */}
            <div className="mb-6">
              <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.weddingFlorist.floralItems2', 'Floral Items')}
              </h3>

              {/* Quick Add Buttons */}
              <div className="mb-4">
                {FLORAL_CATEGORIES.map((category) => (
                  <div key={category.id} className="mb-3">
                    <p className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {category.label}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {WEDDING_FLORAL_ITEMS.filter((i) => i.category === category.id).map((item) => (
                        <button
                          key={item.name}
                          onClick={() => setNewItem({
                            ...newItem,
                            category: item.category,
                            name: item.name,
                            unitPrice: item.basePrice,
                          })}
                          className={`px-3 py-1 rounded-full text-sm ${
                            newItem.name === item.name
                              ? 'bg-pink-500 text-white'
                              : theme === 'dark'
                              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {item.name} ({formatCurrency(item.basePrice)})
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Item Form */}
              <div className="flex gap-4 items-end mb-4">
                <div className="flex-1">
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.weddingFlorist.itemName', 'Item Name')}
                  </label>
                  <input
                    type="text"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div className="w-24">
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.weddingFlorist.qty3', 'Qty')}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div className="w-28">
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.weddingFlorist.price3', 'Price')}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newItem.unitPrice}
                    onChange={(e) => setNewItem({ ...newItem, unitPrice: parseFloat(e.target.value) || 0 })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <button
                  onClick={addItemToOrder}
                  className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.weddingFlorist.add', 'Add')}
                </button>
              </div>

              {/* Items List */}
              {newOrder.items && newOrder.items.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        <th className="text-left py-2">{t('tools.weddingFlorist.item2', 'Item')}</th>
                        <th className="text-left py-2">{t('tools.weddingFlorist.category2', 'Category')}</th>
                        <th className="text-right py-2">{t('tools.weddingFlorist.qty2', 'Qty')}</th>
                        <th className="text-right py-2">{t('tools.weddingFlorist.price2', 'Price')}</th>
                        <th className="text-right py-2">{t('tools.weddingFlorist.total3', 'Total')}</th>
                        <th className="w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {newOrder.items.map((item) => (
                        <tr key={item.id} className={`border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                          <td className={`py-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{item.name}</td>
                          <td className={`py-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {FLORAL_CATEGORIES.find((c) => c.id === item.category)?.label}
                          </td>
                          <td className={`py-2 text-right ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{item.quantity}</td>
                          <td className={`py-2 text-right ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(item.unitPrice)}</td>
                          <td className={`py-2 text-right font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(item.total)}</td>
                          <td className="py-2">
                            <button
                              onClick={() => removeItemFromOrder(item.id)}
                              className="text-red-500 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Fees and Total */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.weddingFlorist.feesDiscounts', 'Fees & Discounts')}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.weddingFlorist.deliveryFee', 'Delivery Fee')}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={newOrder.deliveryFee}
                      onChange={(e) => {
                        const deliveryFee = parseFloat(e.target.value) || 0;
                        const { subtotal, total, deposit } = calculateTotals(
                          newOrder.items || [],
                          newOrder.discount || 0,
                          deliveryFee,
                          newOrder.setupFee || 150
                        );
                        setNewOrder({ ...newOrder, deliveryFee, subtotal, total, deposit, balance: total - (newOrder.depositPaid || 0) });
                      }}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.weddingFlorist.setupFee', 'Setup Fee')}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={newOrder.setupFee}
                      onChange={(e) => {
                        const setupFee = parseFloat(e.target.value) || 0;
                        const { subtotal, total, deposit } = calculateTotals(
                          newOrder.items || [],
                          newOrder.discount || 0,
                          newOrder.deliveryFee || 100,
                          setupFee
                        );
                        setNewOrder({ ...newOrder, setupFee, subtotal, total, deposit, balance: total - (newOrder.depositPaid || 0) });
                      }}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.weddingFlorist.discount3', 'Discount')}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newOrder.discount}
                    onChange={(e) => {
                      const discount = parseFloat(e.target.value) || 0;
                      const { subtotal, total, deposit } = calculateTotals(
                        newOrder.items || [],
                        discount,
                        newOrder.deliveryFee || 100,
                        newOrder.setupFee || 150
                      );
                      setNewOrder({ ...newOrder, discount, subtotal, total, deposit, balance: total - (newOrder.depositPaid || 0) });
                    }}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>

              {/* Price Summary */}
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.weddingFlorist.orderSummary', 'Order Summary')}
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.weddingFlorist.subtotal2', 'Subtotal:')}</span>
                    <span className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(newOrder.subtotal || 0)}</span>
                  </div>
                  {(newOrder.discount || 0) > 0 && (
                    <div className="flex justify-between">
                      <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.weddingFlorist.discount2', 'Discount:')}</span>
                      <span className="text-green-500">-{formatCurrency(newOrder.discount || 0)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.weddingFlorist.deliverySetup2', 'Delivery & Setup:')}</span>
                    <span className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{formatCurrency((newOrder.deliveryFee || 0) + (newOrder.setupFee || 0))}</span>
                  </div>
                  <div className={`flex justify-between pt-2 border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}>
                    <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.weddingFlorist.total4', 'Total:')}</span>
                    <span className="font-bold text-pink-500">{formatCurrency(newOrder.total || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>50% Deposit:</span>
                    <span className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(newOrder.deposit || 0)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.weddingFlorist.consultationNotes2', 'Consultation Notes')}
                </label>
                <textarea
                  value={newOrder.consultationNotes}
                  onChange={(e) => setNewOrder({ ...newOrder, consultationNotes: e.target.value })}
                  rows={3}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.weddingFlorist.designNotes2', 'Design Notes')}
                </label>
                <textarea
                  value={newOrder.designNotes}
                  onChange={(e) => setNewOrder({ ...newOrder, designNotes: e.target.value })}
                  rows={3}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-6">
              <button
                onClick={submitOrder}
                className="w-full px-6 py-3 bg-pink-500 text-white rounded-lg font-semibold hover:bg-pink-600 flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                {t('tools.weddingFlorist.createWeddingOrder', 'Create Wedding Order')}
              </button>
            </div>
          </div>
        )}

        {/* Calendar Tab */}
        {activeTab === 'calendar' && (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <h2 className={`text-xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.weddingFlorist.upcomingWeddings', 'Upcoming Weddings')}
            </h2>

            {upcomingWeddings.length === 0 ? (
              <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{t('tools.weddingFlorist.noUpcomingWeddingsScheduled', 'No upcoming weddings scheduled')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingWeddings.map((wedding) => (
                  <div
                    key={wedding.id}
                    className={`p-4 rounded-lg border ${
                      theme === 'dark' ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-center p-3 bg-pink-100 dark:bg-pink-900/30 rounded-lg">
                          <p className="text-2xl font-bold text-pink-600 dark:text-pink-400">
                            {new Date(wedding.weddingDate).getDate()}
                          </p>
                          <p className="text-sm text-pink-600 dark:text-pink-400">
                            {new Date(wedding.weddingDate).toLocaleDateString('en-US', { month: 'short' })}
                          </p>
                        </div>
                        <div>
                          <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {wedding.bride} & {wedding.groom}
                          </h3>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {wedding.venue} {wedding.weddingTime && `at ${wedding.weddingTime}`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {formatCurrency(wedding.total)}
                        </p>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(wedding.status)}`}>
                          {WEDDING_STATUSES.find((s) => s.value === wedding.status)?.label}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WeddingFloristTool;
