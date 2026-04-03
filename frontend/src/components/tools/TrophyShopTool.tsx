'use client';

import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import type { ColumnConfig } from '../../lib/toolDataUtils';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  Trophy,
  Award,
  Medal,
  Ribbon,
  Users,
  Calendar,
  Clock,
  Package,
  DollarSign,
  Truck,
  RotateCcw,
  PieChart,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  AlertCircle,
  Building2,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Zap,
  Eye,
  CheckCircle2,
  XCircle,
  FileText,
  Sparkles,
  Loader2,
} from 'lucide-react';

// Types
interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  isCorporate: boolean;
  corporateName?: string;
  discount?: number;
  createdAt: string;
}

interface Order {
  id: string;
  customerId: string;
  awardType: 'trophy' | 'plaque' | 'medal' | 'ribbon';
  size: 'small' | 'medium' | 'large' | 'extra-large';
  engravingText: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  isRush: boolean;
  rushFee: number;
  status: 'pending' | 'engraving' | 'proof-sent' | 'proof-approved' | 'production' | 'ready' | 'delivered';
  proofApproved: boolean;
  proofSentAt?: string;
  proofApprovedAt?: string;
  deliveryType: 'pickup' | 'delivery';
  scheduledDate: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  leagueId?: string;
  seasonId?: string;
}

interface InventoryItem {
  id: string;
  type: 'base' | 'figure' | 'plate' | 'medal-blank' | 'ribbon-roll';
  name: string;
  sku: string;
  quantity: number;
  reorderLevel: number;
  unitCost: number;
  supplier: string;
  lastRestocked: string;
}

interface League {
  id: string;
  name: string;
  sport: string;
  contactName: string;
  contactEmail: string;
  seasons: Season[];
}

interface Season {
  id: string;
  name: string;
  year: string;
  orderCount: number;
  totalRevenue: number;
}

interface EngravingQueueItem {
  orderId: string;
  customerName: string;
  text: string;
  awardType: string;
  priority: 'normal' | 'rush';
  dueDate: string;
  status: 'queued' | 'in-progress' | 'completed';
}

// Constants
const AWARD_TYPES = [
  { value: 'trophy', label: 'Trophy', icon: Trophy },
  { value: 'plaque', label: 'Plaque', icon: Award },
  { value: 'medal', label: 'Medal', icon: Medal },
  { value: 'ribbon', label: 'Ribbon', icon: Ribbon },
];

const SIZES = [
  { value: 'small', label: 'Small', priceMultiplier: 1 },
  { value: 'medium', label: 'Medium', priceMultiplier: 1.5 },
  { value: 'large', label: 'Large', priceMultiplier: 2 },
  { value: 'extra-large', label: 'Extra Large', priceMultiplier: 3 },
];

const BASE_PRICES: Record<string, number> = {
  trophy: 25,
  plaque: 20,
  medal: 8,
  ribbon: 3,
};

const RUSH_FEE_PERCENTAGE = 0.5;

const ORDER_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'yellow' },
  { value: 'engraving', label: 'In Engraving', color: 'blue' },
  { value: 'proof-sent', label: 'Proof Sent', color: 'purple' },
  { value: 'proof-approved', label: 'Proof Approved', color: 'indigo' },
  { value: 'production', label: 'In Production', color: 'orange' },
  { value: 'ready', label: 'Ready', color: 'green' },
  { value: 'delivered', label: 'Delivered', color: 'gray' },
];

// Export columns configuration for orders (primary synced data)
const ORDERS_COLUMNS: ColumnConfig[] = [
  { key: 'id', header: 'Order ID', type: 'string' },
  { key: 'customerName', header: 'Customer', type: 'string' },
  { key: 'awardType', header: 'Award Type', type: 'string' },
  { key: 'size', header: 'Size', type: 'string' },
  { key: 'engravingText', header: 'Engraving Text', type: 'string' },
  { key: 'quantity', header: 'Quantity', type: 'number' },
  { key: 'unitPrice', header: 'Unit Price', type: 'currency' },
  { key: 'totalPrice', header: 'Total Price', type: 'currency' },
  { key: 'isRush', header: 'Rush Order', type: 'boolean' },
  { key: 'rushFee', header: 'Rush Fee', type: 'currency' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'deliveryType', header: 'Delivery Type', type: 'string' },
  { key: 'scheduledDate', header: 'Scheduled Date', type: 'date' },
  { key: 'proofApproved', header: 'Proof Approved', type: 'boolean' },
  { key: 'createdAt', header: 'Created At', type: 'date' },
  { key: 'notes', header: 'Notes', type: 'string' },
];

// Storage keys for localStorage fallback (for non-synced secondary data)
const CUSTOMERS_STORAGE_KEY = 'trophy-shop-customers';
const INVENTORY_STORAGE_KEY = 'trophy-shop-inventory';
const LEAGUES_STORAGE_KEY = 'trophy-shop-leagues';

// Helper functions
const generateId = () => Math.random().toString(36).substr(2, 9);

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

interface TrophyShopToolProps {
  uiConfig?: UIConfig;
}

export const TrophyShopTool: React.FC<TrophyShopToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.text || params.content || params.name) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Use the useToolData hook for orders (primary synced data)
  const {
    data: orders,
    setData: setOrders,
    addItem: addOrder,
    updateItem: updateOrder,
    deleteItem: deleteOrder,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    importCSV,
    importJSON,
    copyToClipboard,
    print,
    isLoading,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<Order>('trophy-shop', [], ORDERS_COLUMNS);

  // State for other data (localStorage only)
  const [activeTab, setActiveTab] = useState<'orders' | 'customers' | 'inventory' | 'engraving' | 'leagues' | 'analytics'>('orders');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);

  // Form states
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [showInventoryForm, setShowInventoryForm] = useState(false);
  const [showLeagueForm, setShowLeagueForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Filter states
  const [orderFilter, setOrderFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showRushOnly, setShowRushOnly] = useState(false);

  // Order form state
  const [orderForm, setOrderForm] = useState({
    customerId: '',
    awardType: 'trophy' as Order['awardType'],
    size: 'medium' as Order['size'],
    engravingText: '',
    quantity: 1,
    isRush: false,
    deliveryType: 'pickup' as Order['deliveryType'],
    scheduledDate: '',
    notes: '',
    leagueId: '',
    seasonId: '',
  });

  // Customer form state
  const [customerForm, setCustomerForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    isCorporate: false,
    corporateName: '',
    discount: 0,
  });

  // Inventory form state
  const [inventoryForm, setInventoryForm] = useState({
    type: 'base' as InventoryItem['type'],
    name: '',
    sku: '',
    quantity: 0,
    reorderLevel: 10,
    unitCost: 0,
    supplier: '',
  });

  // League form state
  const [leagueForm, setLeagueForm] = useState({
    name: '',
    sport: '',
    contactName: '',
    contactEmail: '',
  });

  // Load customers, inventory, leagues from localStorage (orders are handled by useToolData hook)
  useEffect(() => {
    try {
      const savedCustomers = localStorage.getItem(CUSTOMERS_STORAGE_KEY);
      if (savedCustomers) setCustomers(JSON.parse(savedCustomers));

      const savedInventory = localStorage.getItem(INVENTORY_STORAGE_KEY);
      if (savedInventory) setInventory(JSON.parse(savedInventory));

      const savedLeagues = localStorage.getItem(LEAGUES_STORAGE_KEY);
      if (savedLeagues) setLeagues(JSON.parse(savedLeagues));
    } catch (e) {
      console.error('Failed to load data from localStorage:', e);
    }
  }, []);

  // Save customers to localStorage
  useEffect(() => {
    localStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(customers));
  }, [customers]);

  // Save inventory to localStorage
  useEffect(() => {
    localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(inventory));
  }, [inventory]);

  // Save leagues to localStorage
  useEffect(() => {
    localStorage.setItem(LEAGUES_STORAGE_KEY, JSON.stringify(leagues));
  }, [leagues]);

  // Calculate price
  const calculatePrice = (awardType: string, size: string, quantity: number, isRush: boolean, discount: number = 0) => {
    const basePrice = BASE_PRICES[awardType] || 25;
    const sizeMultiplier = SIZES.find(s => s.value === size)?.priceMultiplier || 1;
    const subtotal = basePrice * sizeMultiplier * quantity;
    const rushFee = isRush ? subtotal * RUSH_FEE_PERCENTAGE : 0;
    const discountAmount = subtotal * (discount / 100);
    return {
      unitPrice: basePrice * sizeMultiplier,
      subtotal,
      rushFee,
      discountAmount,
      total: subtotal + rushFee - discountAmount,
    };
  };

  // Filtered orders
  const filteredOrders = useMemo(() => {
    let result = [...orders];

    if (orderFilter !== 'all') {
      result = result.filter(o => o.status === orderFilter);
    }

    if (showRushOnly) {
      result = result.filter(o => o.isRush);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(o => {
        const customer = customers.find(c => c.id === o.customerId);
        return (
          o.engravingText.toLowerCase().includes(term) ||
          customer?.name.toLowerCase().includes(term) ||
          o.id.includes(term)
        );
      });
    }

    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders, orderFilter, showRushOnly, searchTerm, customers]);

  // Engraving queue
  const engravingQueue = useMemo((): EngravingQueueItem[] => {
    return orders
      .filter(o => o.status === 'pending' || o.status === 'engraving')
      .map(o => {
        const customer = customers.find(c => c.id === o.customerId);
        return {
          orderId: o.id,
          customerName: customer?.name || 'Unknown',
          text: o.engravingText,
          awardType: o.awardType,
          priority: o.isRush ? 'rush' : 'normal',
          dueDate: o.scheduledDate,
          status: o.status === 'engraving' ? 'in-progress' : 'queued',
        };
      })
      .sort((a, b) => {
        if (a.priority === 'rush' && b.priority !== 'rush') return -1;
        if (b.priority === 'rush' && a.priority !== 'rush') return 1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });
  }, [orders, customers]);

  // Low inventory items
  const lowInventoryItems = useMemo(() => {
    return inventory.filter(item => item.quantity <= item.reorderLevel);
  }, [inventory]);

  // Analytics
  const analytics = useMemo(() => {
    const now = new Date();
    const thisMonth = orders.filter(o => {
      const orderDate = new Date(o.createdAt);
      return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
    });

    const byCategory = AWARD_TYPES.reduce((acc, type) => {
      const typeOrders = orders.filter(o => o.awardType === type.value);
      acc[type.value] = {
        count: typeOrders.length,
        revenue: typeOrders.reduce((sum, o) => sum + o.totalPrice, 0),
      };
      return acc;
    }, {} as Record<string, { count: number; revenue: number }>);

    return {
      totalOrders: orders.length,
      pendingOrders: orders.filter(o => o.status !== 'delivered').length,
      thisMonthOrders: thisMonth.length,
      thisMonthRevenue: thisMonth.reduce((sum, o) => sum + o.totalPrice, 0),
      totalRevenue: orders.reduce((sum, o) => sum + o.totalPrice, 0),
      rushOrders: orders.filter(o => o.isRush).length,
      byCategory,
      corporateOrders: orders.filter(o => {
        const customer = customers.find(c => c.id === o.customerId);
        return customer?.isCorporate;
      }).length,
    };
  }, [orders, customers]);

  // Prepare data for export (enriched with customer names)
  const exportData = useMemo(() => {
    return filteredOrders.map(order => {
      const customer = customers.find(c => c.id === order.customerId);
      return {
        ...order,
        customerName: customer?.name || 'Unknown',
      };
    });
  }, [filteredOrders, customers]);

  // Export handlers using useToolData hook's export functions
  const handleExportCSV = () => {
    exportCSV({ filename: 'trophy-shop-orders' });
  };

  const handleExportExcel = () => {
    exportExcel({ filename: 'trophy-shop-orders' });
  };

  const handleExportJSON = () => {
    exportJSON({ filename: 'trophy-shop-orders' });
  };

  const handleExportPDF = async () => {
    await exportPDF({
      filename: 'trophy-shop-orders',
      title: 'Trophy Shop Orders',
      subtitle: `${orders.length} orders`,
      orientation: 'landscape',
    });
  };

  const handlePrint = () => {
    print('Trophy Shop Orders');
  };

  const handleCopyToClipboard = async () => {
    return await copyToClipboard('tab');
  };

  // Handlers
  const handleAddOrder = () => {
    const customer = customers.find(c => c.id === orderForm.customerId);
    const pricing = calculatePrice(
      orderForm.awardType,
      orderForm.size,
      orderForm.quantity,
      orderForm.isRush,
      customer?.discount || 0
    );

    const newOrder: Order = {
      id: generateId(),
      customerId: orderForm.customerId,
      awardType: orderForm.awardType,
      size: orderForm.size,
      engravingText: orderForm.engravingText,
      quantity: orderForm.quantity,
      unitPrice: pricing.unitPrice,
      totalPrice: pricing.total,
      isRush: orderForm.isRush,
      rushFee: pricing.rushFee,
      status: 'pending',
      proofApproved: false,
      deliveryType: orderForm.deliveryType,
      scheduledDate: orderForm.scheduledDate,
      notes: orderForm.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      leagueId: orderForm.leagueId || undefined,
      seasonId: orderForm.seasonId || undefined,
    };

    addOrder(newOrder);
    resetOrderForm();
    setShowOrderForm(false);
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    const updates: Partial<Order> = {
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };
    if (newStatus === 'proof-sent') {
      updates.proofSentAt = new Date().toISOString();
    }
    if (newStatus === 'proof-approved') {
      updates.proofApproved = true;
      updates.proofApprovedAt = new Date().toISOString();
    }
    updateOrder(orderId, updates);
  };

  const handleDeleteOrder = async (orderId: string) => {
    const confirmed = await confirm({
      title: 'Delete Order',
      message: 'Are you sure you want to delete this order?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteOrder(orderId);
    }
  };

  const handleAddCustomer = () => {
    const newCustomer: Customer = {
      id: generateId(),
      ...customerForm,
      createdAt: new Date().toISOString(),
    };
    setCustomers([...customers, newCustomer]);
    resetCustomerForm();
    setShowCustomerForm(false);
  };

  const handleAddInventoryItem = () => {
    const newItem: InventoryItem = {
      id: generateId(),
      ...inventoryForm,
      lastRestocked: new Date().toISOString(),
    };
    setInventory([...inventory, newItem]);
    resetInventoryForm();
    setShowInventoryForm(false);
  };

  const handleUpdateInventoryQuantity = (itemId: string, change: number) => {
    setInventory(inventory.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          quantity: Math.max(0, item.quantity + change),
          lastRestocked: change > 0 ? new Date().toISOString() : item.lastRestocked,
        };
      }
      return item;
    }));
  };

  const handleAddLeague = () => {
    const newLeague: League = {
      id: generateId(),
      ...leagueForm,
      seasons: [],
    };
    setLeagues([...leagues, newLeague]);
    resetLeagueForm();
    setShowLeagueForm(false);
  };

  const handleAddSeason = (leagueId: string, seasonName: string, year: string) => {
    setLeagues(leagues.map(l => {
      if (l.id === leagueId) {
        return {
          ...l,
          seasons: [
            ...l.seasons,
            {
              id: generateId(),
              name: seasonName,
              year,
              orderCount: 0,
              totalRevenue: 0,
            },
          ],
        };
      }
      return l;
    }));
  };

  // Reset form functions
  const resetOrderForm = () => {
    setOrderForm({
      customerId: '',
      awardType: 'trophy',
      size: 'medium',
      engravingText: '',
      quantity: 1,
      isRush: false,
      deliveryType: 'pickup',
      scheduledDate: '',
      notes: '',
      leagueId: '',
      seasonId: '',
    });
    setEditingOrder(null);
  };

  const resetCustomerForm = () => {
    setCustomerForm({
      name: '',
      email: '',
      phone: '',
      address: '',
      isCorporate: false,
      corporateName: '',
      discount: 0,
    });
    setEditingCustomer(null);
  };

  const resetInventoryForm = () => {
    setInventoryForm({
      type: 'base',
      name: '',
      sku: '',
      quantity: 0,
      reorderLevel: 10,
      unitCost: 0,
      supplier: '',
    });
  };

  const resetLeagueForm = () => {
    setLeagueForm({
      name: '',
      sport: '',
      contactName: '',
      contactEmail: '',
    });
  };

  // Price preview for order form
  const pricePreview = useMemo(() => {
    if (!orderForm.customerId) return null;
    const customer = customers.find(c => c.id === orderForm.customerId);
    return calculatePrice(
      orderForm.awardType,
      orderForm.size,
      orderForm.quantity,
      orderForm.isRush,
      customer?.discount || 0
    );
  }, [orderForm, customers]);

  // Render helpers
  const getStatusColor = (status: string) => {
    const statusConfig = ORDER_STATUSES.find(s => s.value === status);
    const colorMap: Record<string, string> = {
      yellow: isDark ? 'bg-yellow-900/50 text-yellow-300' : 'bg-yellow-100 text-yellow-800',
      blue: isDark ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-800',
      purple: isDark ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-800',
      indigo: isDark ? 'bg-indigo-900/50 text-indigo-300' : 'bg-indigo-100 text-indigo-800',
      orange: isDark ? 'bg-orange-900/50 text-orange-300' : 'bg-orange-100 text-orange-800',
      green: isDark ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-800',
      gray: isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800',
    };
    return colorMap[statusConfig?.color || 'gray'];
  };

  const inputClasses = `w-full px-4 py-2 rounded-lg border ${
    isDark
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]`;

  const selectClasses = `w-full px-4 py-2 rounded-lg border ${
    isDark
      ? 'bg-gray-700 border-gray-600 text-white'
      : 'bg-white border-gray-300 text-gray-900'
  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]`;

  const buttonPrimary = 'flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] hover:from-[#2DD4BF] hover:to-[#0D9488] text-white rounded-lg transition-all font-medium shadow-lg shadow-[#0D9488]/20';

  const buttonSecondary = `px-4 py-2 rounded-lg transition-colors font-medium ${
    isDark
      ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
  }`;

  // Loading state
  if (isLoading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-[#0D9488]" />
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.trophyShop.trophyShopManager', 'Trophy Shop Manager')}
                </h1>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.trophyShop.manageOrdersInventoryAndCustomer', 'Manage orders, inventory, and customer accounts')}
                </p>
              </div>
            </div>

            {/* Sync Status and Prefill Indicator */}
            <div className="flex items-center gap-4">
              <WidgetEmbedButton toolSlug="trophy-shop" toolName="Trophy Shop" />

              <SyncStatus
                isSynced={isSynced}
                isSaving={isSaving}
                lastSaved={lastSaved}
                syncError={syncError}
                onForceSync={forceSync}
                theme={isDark ? 'dark' : 'light'}
                size="sm"
              />
              {isPrefilled && (
                <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
                  <Sparkles className="w-4 h-4 text-[#0D9488]" />
                  <span className="text-sm text-[#0D9488] font-medium">{t('tools.trophyShop.contentLoadedFromAiResponse', 'Content loaded from AI response')}</span>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="flex gap-4 flex-wrap">
              <div className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.trophyShop.pending', 'Pending')}</div>
                <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {analytics.pendingOrders}
                </div>
              </div>
              <div className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.trophyShop.thisMonth', 'This Month')}</div>
                <div className={`text-xl font-bold text-[#0D9488]`}>
                  {formatCurrency(analytics.thisMonthRevenue)}
                </div>
              </div>
              {lowInventoryItems.length > 0 && (
                <div className="px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/50">
                  <div className="text-xs text-red-400">{t('tools.trophyShop.lowStock', 'Low Stock')}</div>
                  <div className="text-xl font-bold text-red-400">
                    {lowInventoryItems.length} items
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 mt-6 flex-wrap">
            {[
              { id: 'orders', label: 'Orders', icon: FileText },
              { id: 'customers', label: 'Customers', icon: Users },
              { id: 'inventory', label: 'Inventory', icon: Package },
              { id: 'engraving', label: 'Engraving Queue', icon: Edit2 },
              { id: 'leagues', label: 'Leagues', icon: Trophy },
              { id: 'analytics', label: 'Analytics', icon: PieChart },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#0D9488] text-white'
                    : isDark
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {/* Actions Bar */}
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4`}>
              <div className="flex flex-wrap gap-4 items-center justify-between">
                <div className="flex gap-3 flex-wrap items-center">
                  <div className="relative">
                    <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    <input
                      type="text"
                      placeholder={t('tools.trophyShop.searchOrders', 'Search orders...')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`pl-10 pr-4 py-2 rounded-lg border ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                  <select
                    value={orderFilter}
                    onChange={(e) => setOrderFilter(e.target.value)}
                    className={selectClasses}
                    style={{ width: 'auto' }}
                  >
                    <option value="all">{t('tools.trophyShop.allStatus', 'All Status')}</option>
                    {ORDER_STATUSES.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                  <label className={`flex items-center gap-2 cursor-pointer ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    <input
                      type="checkbox"
                      checked={showRushOnly}
                      onChange={(e) => setShowRushOnly(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-[#0D9488] focus:ring-[#0D9488]"
                    />
                    <Zap className="w-4 h-4 text-orange-500" />
                    {t('tools.trophyShop.rushOnly', 'Rush Only')}
                  </label>
                </div>
                <div className="flex gap-3 items-center">
                  <ExportDropdown
                    onExportCSV={handleExportCSV}
                    onExportExcel={handleExportExcel}
                    onExportJSON={handleExportJSON}
                    onExportPDF={handleExportPDF}
                    onPrint={handlePrint}
                    onCopyToClipboard={handleCopyToClipboard}
                    onImportCSV={async (file) => { await importCSV(file); }}
                    onImportJSON={async (file) => { await importJSON(file); }}
                    theme={isDark ? 'dark' : 'light'}
                    disabled={orders.length === 0}
                  />
                  <button onClick={() => setShowOrderForm(true)} className={buttonPrimary}>
                    <Plus className="w-4 h-4" />
                    {t('tools.trophyShop.newOrder', 'New Order')}
                  </button>
                </div>
              </div>
            </div>

            {/* Order Form Modal */}
            {showOrderForm && (
              <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
                <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {editingOrder ? t('tools.trophyShop.editOrder', 'Edit Order') : t('tools.trophyShop.newOrder2', 'New Order')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                      {t('tools.trophyShop.customer', 'Customer *')}
                    </label>
                    <select
                      value={orderForm.customerId}
                      onChange={(e) => setOrderForm({ ...orderForm, customerId: e.target.value })}
                      className={selectClasses}
                    >
                      <option value="">{t('tools.trophyShop.selectCustomer', 'Select customer...')}</option>
                      {customers.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name} {c.isCorporate && `(${c.corporateName})`}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                      {t('tools.trophyShop.awardType', 'Award Type *')}
                    </label>
                    <select
                      value={orderForm.awardType}
                      onChange={(e) => setOrderForm({ ...orderForm, awardType: e.target.value as Order['awardType'] })}
                      className={selectClasses}
                    >
                      {AWARD_TYPES.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                      {t('tools.trophyShop.size', 'Size *')}
                    </label>
                    <select
                      value={orderForm.size}
                      onChange={(e) => setOrderForm({ ...orderForm, size: e.target.value as Order['size'] })}
                      className={selectClasses}
                    >
                      {SIZES.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                      {t('tools.trophyShop.quantity2', 'Quantity *')}
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={orderForm.quantity}
                      onChange={(e) => setOrderForm({ ...orderForm, quantity: parseInt(e.target.value) || 1 })}
                      className={inputClasses}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                      {t('tools.trophyShop.engravingText', 'Engraving Text *')}
                    </label>
                    <input
                      type="text"
                      value={orderForm.engravingText}
                      onChange={(e) => setOrderForm({ ...orderForm, engravingText: e.target.value })}
                      placeholder={t('tools.trophyShop.enterTextToBeEngraved', 'Enter text to be engraved...')}
                      className={inputClasses}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                      {t('tools.trophyShop.deliveryType', 'Delivery Type')}
                    </label>
                    <select
                      value={orderForm.deliveryType}
                      onChange={(e) => setOrderForm({ ...orderForm, deliveryType: e.target.value as Order['deliveryType'] })}
                      className={selectClasses}
                    >
                      <option value="pickup">{t('tools.trophyShop.pickup', 'Pickup')}</option>
                      <option value="delivery">{t('tools.trophyShop.delivery', 'Delivery')}</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                      {t('tools.trophyShop.scheduledDate', 'Scheduled Date')}
                    </label>
                    <input
                      type="date"
                      value={orderForm.scheduledDate}
                      onChange={(e) => setOrderForm({ ...orderForm, scheduledDate: e.target.value })}
                      className={inputClasses}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                      {t('tools.trophyShop.leagueOptional', 'League (Optional)')}
                    </label>
                    <select
                      value={orderForm.leagueId}
                      onChange={(e) => setOrderForm({ ...orderForm, leagueId: e.target.value, seasonId: '' })}
                      className={selectClasses}
                    >
                      <option value="">{t('tools.trophyShop.noLeague', 'No league')}</option>
                      {leagues.map(l => (
                        <option key={l.id} value={l.id}>{l.name}</option>
                      ))}
                    </select>
                  </div>
                  {orderForm.leagueId && (
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                        {t('tools.trophyShop.season', 'Season')}
                      </label>
                      <select
                        value={orderForm.seasonId}
                        onChange={(e) => setOrderForm({ ...orderForm, seasonId: e.target.value })}
                        className={selectClasses}
                      >
                        <option value="">{t('tools.trophyShop.selectSeason', 'Select season...')}</option>
                        {leagues.find(l => l.id === orderForm.leagueId)?.seasons.map(s => (
                          <option key={s.id} value={s.id}>{s.name} ({s.year})</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div className="md:col-span-2 lg:col-span-3">
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                      {t('tools.trophyShop.notes', 'Notes')}
                    </label>
                    <textarea
                      value={orderForm.notes}
                      onChange={(e) => setOrderForm({ ...orderForm, notes: e.target.value })}
                      placeholder={t('tools.trophyShop.additionalNotes', 'Additional notes...')}
                      rows={2}
                      className={inputClasses}
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <label className={`flex items-center gap-2 cursor-pointer ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      <input
                        type="checkbox"
                        checked={orderForm.isRush}
                        onChange={(e) => setOrderForm({ ...orderForm, isRush: e.target.checked })}
                        className="w-4 h-4 rounded border-gray-300 text-[#0D9488] focus:ring-[#0D9488]"
                      />
                      <Zap className="w-4 h-4 text-orange-500" />
                      {t('tools.trophyShop.rushOrder50', 'Rush Order (+50%)')}
                    </label>
                  </div>
                </div>

                {/* Price Preview */}
                {pricePreview && (
                  <div className={`mt-4 p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.trophyShop.priceBreakdown', 'Price Breakdown')}</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.trophyShop.unitPrice', 'Unit Price:')}</span>
                        <span className={isDark ? 'text-white' : 'text-gray-900'}>{formatCurrency(pricePreview.unitPrice)}</span>
                      </div>
                      <div>
                        <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.trophyShop.subtotal', 'Subtotal:')}</span>
                        <span className={isDark ? 'text-white' : 'text-gray-900'}>{formatCurrency(pricePreview.subtotal)}</span>
                      </div>
                      {pricePreview.rushFee > 0 && (
                        <div>
                          <span className="text-orange-500">{t('tools.trophyShop.rushFee', 'Rush Fee:')}</span>
                          <span className="text-orange-500">+{formatCurrency(pricePreview.rushFee)}</span>
                        </div>
                      )}
                      {pricePreview.discountAmount > 0 && (
                        <div>
                          <span className="text-green-500">{t('tools.trophyShop.discount', 'Discount:')}</span>
                          <span className="text-green-500">-{formatCurrency(pricePreview.discountAmount)}</span>
                        </div>
                      )}
                      <div className="col-span-2 md:col-span-4 pt-2 border-t border-gray-600">
                        <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.trophyShop.total', 'Total:')}</span>
                        <span className="font-bold text-[#0D9488] text-lg">{formatCurrency(pricePreview.total)}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleAddOrder}
                    disabled={!orderForm.customerId || !orderForm.engravingText}
                    className={`${buttonPrimary} disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <Check className="w-4 h-4" />
                    {editingOrder ? t('tools.trophyShop.updateOrder', 'Update Order') : t('tools.trophyShop.createOrder', 'Create Order')}
                  </button>
                  <button
                    onClick={() => {
                      setShowOrderForm(false);
                      resetOrderForm();
                    }}
                    className={buttonSecondary}
                  >
                    {t('tools.trophyShop.cancel', 'Cancel')}
                  </button>
                </div>
              </div>
            )}

            {/* Orders List */}
            <div className="space-y-4">
              {filteredOrders.length === 0 ? (
                <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-8 text-center`}>
                  <FileText className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                  <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.trophyShop.noOrdersFound', 'No orders found')}</p>
                </div>
              ) : (
                filteredOrders.map(order => {
                  const customer = customers.find(c => c.id === order.customerId);
                  const AwardIcon = AWARD_TYPES.find(t => t.value === order.awardType)?.icon || Trophy;

                  return (
                    <div
                      key={order.id}
                      className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4`}
                    >
                      <div className="flex flex-wrap gap-4 items-start justify-between">
                        <div className="flex gap-4 items-start">
                          <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            <AwardIcon className="w-6 h-6 text-[#0D9488]" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                #{order.id.toUpperCase()}
                              </h4>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                {ORDER_STATUSES.find(s => s.value === order.status)?.label}
                              </span>
                              {order.isRush && (
                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-500/20 text-orange-500 flex items-center gap-1">
                                  <Zap className="w-3 h-3" />
                                  {t('tools.trophyShop.rush', 'Rush')}
                                </span>
                              )}
                              {order.proofApproved && (
                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-500 flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" />
                                  {t('tools.trophyShop.proofOk', 'Proof OK')}
                                </span>
                              )}
                            </div>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              {customer?.name || 'Unknown Customer'} {customer?.isCorporate && `- ${customer.corporateName}`}
                            </p>
                            <p className={`text-sm mt-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              "{order.engravingText}"
                            </p>
                            <div className={`flex gap-4 mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              <span>{SIZES.find(s => s.value === order.size)?.label} {AWARD_TYPES.find(t => t.value === order.awardType)?.label}</span>
                              <span>Qty: {order.quantity}</span>
                              <span>{order.deliveryType === 'pickup' ? t('tools.trophyShop.pickup2', 'Pickup') : t('tools.trophyShop.delivery2', 'Delivery')}: {order.scheduledDate ? formatDate(order.scheduledDate) : 'TBD'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="text-xl font-bold text-[#0D9488]">
                            {formatCurrency(order.totalPrice)}
                          </div>
                          <div className="flex gap-2">
                            <select
                              value={order.status}
                              onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as Order['status'])}
                              className={`text-sm px-2 py-1 rounded border ${
                                isDark
                                  ? 'bg-gray-700 border-gray-600 text-white'
                                  : 'bg-white border-gray-300 text-gray-900'
                              }`}
                            >
                              {ORDER_STATUSES.map(s => (
                                <option key={s.value} value={s.value}>{s.label}</option>
                              ))}
                            </select>
                            <button
                              onClick={() => handleDeleteOrder(order.id)}
                              className={`p-2 rounded-lg transition-colors ${
                                isDark
                                  ? 'hover:bg-red-900/50 text-red-400'
                                  : 'hover:bg-red-100 text-red-600'
                              }`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Customers Tab */}
        {activeTab === 'customers' && (
          <div className="space-y-6">
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4`}>
              <div className="flex justify-between items-center">
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Customers ({customers.length})
                </h3>
                <button onClick={() => setShowCustomerForm(true)} className={buttonPrimary}>
                  <Plus className="w-4 h-4" />
                  {t('tools.trophyShop.addCustomer', 'Add Customer')}
                </button>
              </div>
            </div>

            {/* Customer Form */}
            {showCustomerForm && (
              <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
                <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {editingCustomer ? t('tools.trophyShop.editCustomer', 'Edit Customer') : t('tools.trophyShop.addCustomer2', 'Add Customer')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                      {t('tools.trophyShop.name', 'Name *')}
                    </label>
                    <input
                      type="text"
                      value={customerForm.name}
                      onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                      className={inputClasses}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                      {t('tools.trophyShop.email', 'Email')}
                    </label>
                    <input
                      type="email"
                      value={customerForm.email}
                      onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                      className={inputClasses}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                      {t('tools.trophyShop.phone', 'Phone')}
                    </label>
                    <input
                      type="tel"
                      value={customerForm.phone}
                      onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                      className={inputClasses}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                      {t('tools.trophyShop.address', 'Address')}
                    </label>
                    <input
                      type="text"
                      value={customerForm.address}
                      onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })}
                      className={inputClasses}
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <label className={`flex items-center gap-2 cursor-pointer ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      <input
                        type="checkbox"
                        checked={customerForm.isCorporate}
                        onChange={(e) => setCustomerForm({ ...customerForm, isCorporate: e.target.checked })}
                        className="w-4 h-4 rounded border-gray-300 text-[#0D9488] focus:ring-[#0D9488]"
                      />
                      <Building2 className="w-4 h-4" />
                      {t('tools.trophyShop.corporateAccount', 'Corporate Account')}
                    </label>
                  </div>
                  {customerForm.isCorporate && (
                    <>
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                          {t('tools.trophyShop.companyName', 'Company Name')}
                        </label>
                        <input
                          type="text"
                          value={customerForm.corporateName}
                          onChange={(e) => setCustomerForm({ ...customerForm, corporateName: e.target.value })}
                          className={inputClasses}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                          {t('tools.trophyShop.discount2', 'Discount (%)')}
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={customerForm.discount}
                          onChange={(e) => setCustomerForm({ ...customerForm, discount: parseInt(e.target.value) || 0 })}
                          className={inputClasses}
                        />
                      </div>
                    </>
                  )}
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleAddCustomer}
                    disabled={!customerForm.name}
                    className={`${buttonPrimary} disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <Check className="w-4 h-4" />
                    {editingCustomer ? t('tools.trophyShop.update', 'Update') : t('tools.trophyShop.addCustomer3', 'Add Customer')}
                  </button>
                  <button
                    onClick={() => {
                      setShowCustomerForm(false);
                      resetCustomerForm();
                    }}
                    className={buttonSecondary}
                  >
                    {t('tools.trophyShop.cancel2', 'Cancel')}
                  </button>
                </div>
              </div>
            )}

            {/* Customers List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {customers.map(customer => {
                const customerOrders = orders.filter(o => o.customerId === customer.id);
                const totalSpent = customerOrders.reduce((sum, o) => sum + o.totalPrice, 0);

                return (
                  <div
                    key={customer.id}
                    className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${
                          customer.isCorporate
                            ? 'bg-purple-500/20 text-purple-500'
                            : isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {customer.isCorporate ? <Building2 className="w-5 h-5" /> : <Users className="w-5 h-5" />}
                        </div>
                        <div>
                          <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {customer.name}
                          </h4>
                          {customer.isCorporate && (
                            <p className={`text-sm ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                              {customer.corporateName}
                            </p>
                          )}
                        </div>
                      </div>
                      {customer.discount && customer.discount > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-500">
                          {customer.discount}% off
                        </span>
                      )}
                    </div>
                    <div className={`mt-3 space-y-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {customer.email && <p>{customer.email}</p>}
                      {customer.phone && <p>{customer.phone}</p>}
                    </div>
                    <div className={`mt-3 pt-3 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} flex justify-between`}>
                      <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                        {customerOrders.length} orders
                      </span>
                      <span className="text-[#0D9488] font-medium">
                        {formatCurrency(totalSpent)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4`}>
              <div className="flex justify-between items-center">
                <div>
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Inventory ({inventory.length} items)
                  </h3>
                  {lowInventoryItems.length > 0 && (
                    <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-4 h-4" />
                      {lowInventoryItems.length} items need reordering
                    </p>
                  )}
                </div>
                <button onClick={() => setShowInventoryForm(true)} className={buttonPrimary}>
                  <Plus className="w-4 h-4" />
                  {t('tools.trophyShop.addItem', 'Add Item')}
                </button>
              </div>
            </div>

            {/* Inventory Form */}
            {showInventoryForm && (
              <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
                <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.trophyShop.addInventoryItem', 'Add Inventory Item')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                      {t('tools.trophyShop.type', 'Type *')}
                    </label>
                    <select
                      value={inventoryForm.type}
                      onChange={(e) => setInventoryForm({ ...inventoryForm, type: e.target.value as InventoryItem['type'] })}
                      className={selectClasses}
                    >
                      <option value="base">{t('tools.trophyShop.trophyBase', 'Trophy Base')}</option>
                      <option value="figure">{t('tools.trophyShop.trophyFigure', 'Trophy Figure')}</option>
                      <option value="plate">{t('tools.trophyShop.engravingPlate', 'Engraving Plate')}</option>
                      <option value="medal-blank">{t('tools.trophyShop.medalBlank', 'Medal Blank')}</option>
                      <option value="ribbon-roll">{t('tools.trophyShop.ribbonRoll', 'Ribbon Roll')}</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                      {t('tools.trophyShop.name2', 'Name *')}
                    </label>
                    <input
                      type="text"
                      value={inventoryForm.name}
                      onChange={(e) => setInventoryForm({ ...inventoryForm, name: e.target.value })}
                      className={inputClasses}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                      {t('tools.trophyShop.sku2', 'SKU *')}
                    </label>
                    <input
                      type="text"
                      value={inventoryForm.sku}
                      onChange={(e) => setInventoryForm({ ...inventoryForm, sku: e.target.value })}
                      className={inputClasses}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                      {t('tools.trophyShop.quantity3', 'Quantity')}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={inventoryForm.quantity}
                      onChange={(e) => setInventoryForm({ ...inventoryForm, quantity: parseInt(e.target.value) || 0 })}
                      className={inputClasses}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                      {t('tools.trophyShop.reorderLevel', 'Reorder Level')}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={inventoryForm.reorderLevel}
                      onChange={(e) => setInventoryForm({ ...inventoryForm, reorderLevel: parseInt(e.target.value) || 0 })}
                      className={inputClasses}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                      {t('tools.trophyShop.unitCost2', 'Unit Cost ($)')}
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={inventoryForm.unitCost}
                      onChange={(e) => setInventoryForm({ ...inventoryForm, unitCost: parseFloat(e.target.value) || 0 })}
                      className={inputClasses}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                      {t('tools.trophyShop.supplier', 'Supplier')}
                    </label>
                    <input
                      type="text"
                      value={inventoryForm.supplier}
                      onChange={(e) => setInventoryForm({ ...inventoryForm, supplier: e.target.value })}
                      className={inputClasses}
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleAddInventoryItem}
                    disabled={!inventoryForm.name || !inventoryForm.sku}
                    className={`${buttonPrimary} disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <Check className="w-4 h-4" />
                    {t('tools.trophyShop.addItem2', 'Add Item')}
                  </button>
                  <button
                    onClick={() => {
                      setShowInventoryForm(false);
                      resetInventoryForm();
                    }}
                    className={buttonSecondary}
                  >
                    {t('tools.trophyShop.cancel3', 'Cancel')}
                  </button>
                </div>
              </div>
            )}

            {/* Inventory List */}
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg overflow-hidden`}>
              <table className="w-full">
                <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
                  <tr>
                    <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.trophyShop.item', 'Item')}</th>
                    <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.trophyShop.sku', 'SKU')}</th>
                    <th className={`px-4 py-3 text-center text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.trophyShop.quantity', 'Quantity')}</th>
                    <th className={`px-4 py-3 text-center text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.trophyShop.reorderAt', 'Reorder At')}</th>
                    <th className={`px-4 py-3 text-right text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.trophyShop.unitCost', 'Unit Cost')}</th>
                    <th className={`px-4 py-3 text-center text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.trophyShop.actions', 'Actions')}</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {inventory.map(item => {
                    const isLow = item.quantity <= item.reorderLevel;

                    return (
                      <tr key={item.id} className={isLow ? (isDark ? 'bg-red-900/20' : 'bg-red-50') : ''}>
                        <td className={`px-4 py-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          <div className="flex items-center gap-2">
                            <Package className={`w-4 h-4 ${isLow ? 'text-red-500' : t('tools.trophyShop.text0d9488', 'text-[#0D9488]')}`} />
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{item.type}</p>
                            </div>
                          </div>
                        </td>
                        <td className={`px-4 py-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{item.sku}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`font-medium ${isLow ? 'text-red-500' : isDark ? 'text-white' : 'text-gray-900'}`}>
                            {item.quantity}
                          </span>
                        </td>
                        <td className={`px-4 py-3 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {item.reorderLevel}
                        </td>
                        <td className={`px-4 py-3 text-right ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          {formatCurrency(item.unitCost)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-center gap-1">
                            <button
                              onClick={() => handleUpdateInventoryQuantity(item.id, -1)}
                              disabled={item.quantity === 0}
                              className={`p-1 rounded ${
                                isDark
                                  ? 'hover:bg-gray-600 text-gray-400 disabled:text-gray-600'
                                  : 'hover:bg-gray-200 text-gray-600 disabled:text-gray-300'
                              } disabled:cursor-not-allowed`}
                            >
                              <ChevronDown className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleUpdateInventoryQuantity(item.id, 1)}
                              className={`p-1 rounded ${
                                isDark
                                  ? 'hover:bg-gray-600 text-gray-400'
                                  : 'hover:bg-gray-200 text-gray-600'
                              }`}
                            >
                              <ChevronUp className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleUpdateInventoryQuantity(item.id, 10)}
                              className={`p-1 rounded text-xs font-medium ${
                                isDark
                                  ? t('tools.trophyShop.hoverBgGray600Text', 'hover:bg-gray-600 text-[#0D9488]') : t('tools.trophyShop.hoverBgGray200Text', 'hover:bg-gray-200 text-[#0D9488]')
                              }`}
                            >
                              +10
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {inventory.length === 0 && (
                <div className={`p-8 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.trophyShop.noInventoryItemsYet', 'No inventory items yet')}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Engraving Queue Tab */}
        {activeTab === 'engraving' && (
          <div className="space-y-6">
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4`}>
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Engraving Queue ({engravingQueue.length} items)
              </h3>
            </div>

            <div className="space-y-4">
              {engravingQueue.length === 0 ? (
                <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-8 text-center`}>
                  <Edit2 className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                  <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.trophyShop.noItemsInEngravingQueue', 'No items in engraving queue')}</p>
                </div>
              ) : (
                engravingQueue.map((item, index) => (
                  <div
                    key={item.orderId}
                    className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4 ${
                      item.priority === 'rush' ? 'border-l-4 border-orange-500' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          item.status === 'in-progress'
                            ? 'bg-blue-500 text-white'
                            : isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {item.customerName}
                            </h4>
                            {item.priority === 'rush' && (
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-500/20 text-orange-500 flex items-center gap-1">
                                <Zap className="w-3 h-3" />
                                {t('tools.trophyShop.rush2', 'Rush')}
                              </span>
                            )}
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              item.status === 'in-progress'
                                ? 'bg-blue-500/20 text-blue-500'
                                : isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {item.status === 'in-progress' ? t('tools.trophyShop.inProgress', 'In Progress') : t('tools.trophyShop.queued', 'Queued')}
                            </span>
                          </div>
                          <p className={`text-lg mt-1 font-mono ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            "{item.text}"
                          </p>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {item.awardType} - Due: {item.dueDate ? formatDate(item.dueDate) : 'TBD'}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {item.status === 'queued' && (
                          <button
                            onClick={() => handleUpdateOrderStatus(item.orderId, 'engraving')}
                            className={buttonPrimary}
                          >
                            {t('tools.trophyShop.startEngraving', 'Start Engraving')}
                          </button>
                        )}
                        {item.status === 'in-progress' && (
                          <button
                            onClick={() => handleUpdateOrderStatus(item.orderId, 'proof-sent')}
                            className={buttonPrimary}
                          >
                            {t('tools.trophyShop.sendProof', 'Send Proof')}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Leagues Tab */}
        {activeTab === 'leagues' && (
          <div className="space-y-6">
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4`}>
              <div className="flex justify-between items-center">
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Sports Leagues & Seasons ({leagues.length})
                </h3>
                <button onClick={() => setShowLeagueForm(true)} className={buttonPrimary}>
                  <Plus className="w-4 h-4" />
                  {t('tools.trophyShop.addLeague', 'Add League')}
                </button>
              </div>
            </div>

            {/* League Form */}
            {showLeagueForm && (
              <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
                <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.trophyShop.addLeague2', 'Add League')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                      {t('tools.trophyShop.leagueName', 'League Name *')}
                    </label>
                    <input
                      type="text"
                      value={leagueForm.name}
                      onChange={(e) => setLeagueForm({ ...leagueForm, name: e.target.value })}
                      placeholder={t('tools.trophyShop.eGCityYouthSoccer', 'e.g., City Youth Soccer League')}
                      className={inputClasses}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                      {t('tools.trophyShop.sport', 'Sport *')}
                    </label>
                    <input
                      type="text"
                      value={leagueForm.sport}
                      onChange={(e) => setLeagueForm({ ...leagueForm, sport: e.target.value })}
                      placeholder={t('tools.trophyShop.eGSoccerBaseballBasketball', 'e.g., Soccer, Baseball, Basketball')}
                      className={inputClasses}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                      {t('tools.trophyShop.contactName', 'Contact Name')}
                    </label>
                    <input
                      type="text"
                      value={leagueForm.contactName}
                      onChange={(e) => setLeagueForm({ ...leagueForm, contactName: e.target.value })}
                      className={inputClasses}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                      {t('tools.trophyShop.contactEmail', 'Contact Email')}
                    </label>
                    <input
                      type="email"
                      value={leagueForm.contactEmail}
                      onChange={(e) => setLeagueForm({ ...leagueForm, contactEmail: e.target.value })}
                      className={inputClasses}
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleAddLeague}
                    disabled={!leagueForm.name || !leagueForm.sport}
                    className={`${buttonPrimary} disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <Check className="w-4 h-4" />
                    {t('tools.trophyShop.addLeague3', 'Add League')}
                  </button>
                  <button
                    onClick={() => {
                      setShowLeagueForm(false);
                      resetLeagueForm();
                    }}
                    className={buttonSecondary}
                  >
                    {t('tools.trophyShop.cancel4', 'Cancel')}
                  </button>
                </div>
              </div>
            )}

            {/* Leagues List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {leagues.map(league => {
                const leagueOrders = orders.filter(o => o.leagueId === league.id);
                const totalRevenue = leagueOrders.reduce((sum, o) => sum + o.totalPrice, 0);

                return (
                  <div
                    key={league.id}
                    className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {league.name}
                        </h4>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {league.sport}
                        </p>
                      </div>
                      <div className={`px-2 py-1 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <span className="text-[#0D9488] font-medium text-sm">{formatCurrency(totalRevenue)}</span>
                      </div>
                    </div>

                    {league.contactName && (
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} mb-3`}>
                        Contact: {league.contactName} {league.contactEmail && `(${league.contactEmail})`}
                      </p>
                    )}

                    <div className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} pt-3`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          Seasons ({league.seasons.length})
                        </span>
                        <button
                          onClick={() => {
                            const name = prompt('Season name (e.g., Spring Season):');
                            const year = prompt('Year:');
                            if (name && year) {
                              handleAddSeason(league.id, name, year);
                            }
                          }}
                          className={`text-sm ${isDark ? t('tools.trophyShop.text0d9488HoverText2dd4bf', 'text-[#0D9488] hover:text-[#2DD4BF]') : t('tools.trophyShop.text0d9488HoverText0f766e', 'text-[#0D9488] hover:text-[#0F766E]')}`}
                        >
                          {t('tools.trophyShop.addSeason', '+ Add Season')}
                        </button>
                      </div>
                      <div className="space-y-2">
                        {league.seasons.map(season => {
                          const seasonOrders = orders.filter(o => o.seasonId === season.id);
                          return (
                            <div
                              key={season.id}
                              className={`flex items-center justify-between text-sm p-2 rounded ${
                                isDark ? 'bg-gray-700' : 'bg-gray-100'
                              }`}
                            >
                              <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                                {season.name} ({season.year})
                              </span>
                              <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                                {seasonOrders.length} orders
                              </span>
                            </div>
                          );
                        })}
                        {league.seasons.length === 0 && (
                          <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                            {t('tools.trophyShop.noSeasonsAddedYet', 'No seasons added yet')}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {leagues.length === 0 && (
                <div className={`col-span-2 ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-8 text-center`}>
                  <Trophy className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                  <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.trophyShop.noLeaguesAddedYet', 'No leagues added yet')}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4`}>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-[#0D9488]/20">
                    <DollarSign className="w-6 h-6 text-[#0D9488]" />
                  </div>
                  <div>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.trophyShop.totalRevenue', 'Total Revenue')}</p>
                    <p className="text-2xl font-bold text-[#0D9488]">{formatCurrency(analytics.totalRevenue)}</p>
                  </div>
                </div>
              </div>
              <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4`}>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-blue-500/20">
                    <FileText className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.trophyShop.totalOrders', 'Total Orders')}</p>
                    <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{analytics.totalOrders}</p>
                  </div>
                </div>
              </div>
              <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4`}>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-orange-500/20">
                    <Zap className="w-6 h-6 text-orange-500" />
                  </div>
                  <div>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.trophyShop.rushOrders', 'Rush Orders')}</p>
                    <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{analytics.rushOrders}</p>
                  </div>
                </div>
              </div>
              <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4`}>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-purple-500/20">
                    <Building2 className="w-6 h-6 text-purple-500" />
                  </div>
                  <div>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.trophyShop.corporateOrders', 'Corporate Orders')}</p>
                    <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{analytics.corporateOrders}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Revenue by Category */}
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
              <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.trophyShop.revenueByCategory', 'Revenue by Category')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {AWARD_TYPES.map(type => {
                  const data = analytics.byCategory[type.value];
                  const Icon = type.icon;

                  return (
                    <div
                      key={type.value}
                      className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <Icon className="w-5 h-5 text-[#0D9488]" />
                        <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {type.label}s
                        </span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-2xl font-bold text-[#0D9488]">
                          {formatCurrency(data?.revenue || 0)}
                        </p>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {data?.count || 0} orders
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* This Month Stats */}
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
              <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.trophyShop.thisMonth2', 'This Month')}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.trophyShop.orders', 'Orders')}</p>
                  <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {analytics.thisMonthOrders}
                  </p>
                </div>
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.trophyShop.revenue', 'Revenue')}</p>
                  <p className="text-3xl font-bold text-[#0D9488]">
                    {formatCurrency(analytics.thisMonthRevenue)}
                  </p>
                </div>
              </div>
            </div>

            {/* Reorder Tracking */}
            {lowInventoryItems.length > 0 && (
              <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
                <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  {t('tools.trophyShop.itemsNeedingReorder', 'Items Needing Reorder')}
                </h3>
                <div className="space-y-3">
                  {lowInventoryItems.map(item => (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        isDark ? 'bg-red-900/20' : 'bg-red-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <RotateCcw className="w-4 h-4 text-red-500" />
                        <div>
                          <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {item.name}
                          </p>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {item.supplier}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-red-500 font-medium">{item.quantity} left</p>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          Reorder at {item.reorderLevel}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Info Section */}
        <div className={`mt-6 ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
          <h3 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.trophyShop.aboutTrophyShopManager', 'About Trophy Shop Manager')}
          </h3>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            A comprehensive management tool for trophy and awards shops. Track orders, manage inventory,
            handle rush orders, approve proofs, manage corporate accounts, and track sports league seasons.
            All data is automatically saved to your browser's local storage.
          </p>
        </div>
      </div>
      <ConfirmDialog />
    </div>
  );
};

export default TrophyShopTool;
