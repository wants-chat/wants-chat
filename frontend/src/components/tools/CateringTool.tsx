'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  Utensils,
  Plus,
  Trash2,
  Edit2,
  Save,
  Calendar,
  Clock,
  Users,
  Search,
  Filter,
  X,
  DollarSign,
  CheckCircle2,
  XCircle,
  Sparkles,
  ChefHat,
  Coffee,
  Wine,
  Cake,
  Salad,
  Sandwich,
  UtensilsCrossed,
  Package,
  Truck,
  BarChart3,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import useToolData from '../../hooks/useToolData';
import { type ColumnConfig } from '../../lib/toolDataUtils';

interface CateringToolProps {
  uiConfig?: UIConfig;
}

// TypeScript interfaces
interface MenuItem {
  id: string;
  name: string;
  category: MenuCategory;
  description: string;
  pricePerPerson: number;
  minimumOrder: number;
  dietaryInfo: string[];
  ingredients: string;
  prepTime: number;
  isAvailable: boolean;
  createdAt: string;
}

interface CateringOrder {
  id: string;
  eventName: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  eventDate: string;
  eventTime: string;
  deliveryAddress: string;
  guestCount: number;
  menuItems: OrderMenuItem[];
  serviceType: ServiceType;
  status: OrderStatus;
  specialRequests: string;
  totalAmount: number;
  depositAmount: number;
  depositPaid: boolean;
  deliveryFee: number;
  staffCount: number;
  staffCost: number;
  createdAt: string;
}

interface OrderMenuItem {
  menuItemId: string;
  quantity: number;
  pricePerPerson: number;
  subtotal: number;
}

type MenuCategory = 'appetizers' | 'main-course' | 'sides' | 'desserts' | 'beverages' | 'breakfast' | 'lunch' | 'dinner' | 'snacks';
type ServiceType = 'delivery' | 'pickup' | 'full-service' | 'drop-off' | 'buffet';
type OrderStatus = 'inquiry' | 'quoted' | 'confirmed' | 'in-preparation' | 'ready' | 'delivered' | 'completed' | 'cancelled';
type TabType = 'orders' | 'menu' | 'analytics';

const MENU_CATEGORIES: { value: MenuCategory; label: string; icon: React.ReactNode }[] = [
  { value: 'appetizers', label: 'Appetizers', icon: <Salad className="w-4 h-4" /> },
  { value: 'main-course', label: 'Main Course', icon: <UtensilsCrossed className="w-4 h-4" /> },
  { value: 'sides', label: 'Sides', icon: <Package className="w-4 h-4" /> },
  { value: 'desserts', label: 'Desserts', icon: <Cake className="w-4 h-4" /> },
  { value: 'beverages', label: 'Beverages', icon: <Coffee className="w-4 h-4" /> },
  { value: 'breakfast', label: 'Breakfast', icon: <Sandwich className="w-4 h-4" /> },
  { value: 'lunch', label: 'Lunch', icon: <Utensils className="w-4 h-4" /> },
  { value: 'dinner', label: 'Dinner', icon: <Wine className="w-4 h-4" /> },
  { value: 'snacks', label: 'Snacks', icon: <Package className="w-4 h-4" /> },
];

const SERVICE_TYPES: { value: ServiceType; label: string }[] = [
  { value: 'delivery', label: 'Delivery Only' },
  { value: 'pickup', label: 'Pickup' },
  { value: 'drop-off', label: 'Drop-off & Setup' },
  { value: 'buffet', label: 'Buffet Service' },
  { value: 'full-service', label: 'Full Service (with Staff)' },
];

const ORDER_STATUSES: { value: OrderStatus; label: string; color: string }[] = [
  { value: 'inquiry', label: 'Inquiry', color: 'gray' },
  { value: 'quoted', label: 'Quoted', color: 'blue' },
  { value: 'confirmed', label: 'Confirmed', color: 'green' },
  { value: 'in-preparation', label: 'In Preparation', color: 'yellow' },
  { value: 'ready', label: 'Ready', color: 'purple' },
  { value: 'delivered', label: 'Delivered', color: 'teal' },
  { value: 'completed', label: 'Completed', color: 'gray' },
  { value: 'cancelled', label: 'Cancelled', color: 'red' },
];

const DIETARY_OPTIONS = [
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Dairy-Free',
  'Nut-Free',
  'Halal',
  'Kosher',
  'Low-Carb',
  'Organic',
];

// Column configurations for export
const menuColumns: ColumnConfig[] = [
  { key: 'id', header: 'Item ID', type: 'string' },
  { key: 'name', header: 'Name', type: 'string' },
  { key: 'category', header: 'Category', type: 'string' },
  { key: 'pricePerPerson', header: 'Price/Person', type: 'currency' },
  { key: 'minimumOrder', header: 'Min Order', type: 'number' },
  { key: 'dietaryInfo', header: 'Dietary Info', type: 'string', format: (v) => Array.isArray(v) ? v.join(', ') : v },
  { key: 'isAvailable', header: 'Available', type: 'boolean' },
];

const orderColumns: ColumnConfig[] = [
  { key: 'id', header: 'Order ID', type: 'string' },
  { key: 'eventName', header: 'Event', type: 'string' },
  { key: 'clientName', header: 'Client', type: 'string' },
  { key: 'eventDate', header: 'Date', type: 'date' },
  { key: 'guestCount', header: 'Guests', type: 'number' },
  { key: 'serviceType', header: 'Service', type: 'string' },
  { key: 'totalAmount', header: 'Total', type: 'currency' },
  { key: 'status', header: 'Status', type: 'string' },
];

// Generate sample data
const generateSampleMenuItems = (): MenuItem[] => [
  {
    id: 'menu-1',
    name: 'Gourmet Cheese Platter',
    category: 'appetizers',
    description: 'Assorted artisan cheeses with crackers and fruit',
    pricePerPerson: 12,
    minimumOrder: 10,
    dietaryInfo: ['Vegetarian', 'Gluten-Free'],
    ingredients: 'Brie, Cheddar, Gouda, grapes, crackers',
    prepTime: 30,
    isAvailable: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'menu-2',
    name: 'Grilled Salmon',
    category: 'main-course',
    description: 'Atlantic salmon with lemon herb butter',
    pricePerPerson: 28,
    minimumOrder: 15,
    dietaryInfo: ['Gluten-Free', 'Dairy-Free'],
    ingredients: 'Salmon, lemon, herbs, olive oil',
    prepTime: 45,
    isAvailable: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'menu-3',
    name: 'Chicken Marsala',
    category: 'main-course',
    description: 'Pan-seared chicken in marsala wine sauce',
    pricePerPerson: 22,
    minimumOrder: 15,
    dietaryInfo: [],
    ingredients: 'Chicken breast, marsala wine, mushrooms',
    prepTime: 40,
    isAvailable: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'menu-4',
    name: 'Garden Salad',
    category: 'sides',
    description: 'Fresh mixed greens with house vinaigrette',
    pricePerPerson: 8,
    minimumOrder: 10,
    dietaryInfo: ['Vegan', 'Gluten-Free'],
    ingredients: 'Mixed greens, tomatoes, cucumbers, vinaigrette',
    prepTime: 15,
    isAvailable: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'menu-5',
    name: 'Chocolate Mousse',
    category: 'desserts',
    description: 'Rich Belgian chocolate mousse',
    pricePerPerson: 10,
    minimumOrder: 15,
    dietaryInfo: ['Vegetarian', 'Gluten-Free'],
    ingredients: 'Dark chocolate, cream, eggs, sugar',
    prepTime: 60,
    isAvailable: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'menu-6',
    name: 'Coffee & Tea Service',
    category: 'beverages',
    description: 'Premium coffee and assorted teas',
    pricePerPerson: 5,
    minimumOrder: 20,
    dietaryInfo: ['Vegan'],
    ingredients: 'Coffee, assorted teas, sugar, cream',
    prepTime: 10,
    isAvailable: true,
    createdAt: new Date().toISOString(),
  },
];

const generateSampleOrders = (): CateringOrder[] => {
  const today = new Date();
  return [
    {
      id: 'order-1',
      eventName: 'Corporate Luncheon',
      clientName: 'ABC Corporation',
      clientEmail: 'events@abccorp.com',
      clientPhone: '+1 555-0101',
      eventDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      eventTime: '12:00',
      deliveryAddress: '123 Business Park Dr, Suite 500',
      guestCount: 50,
      menuItems: [
        { menuItemId: 'menu-1', quantity: 50, pricePerPerson: 12, subtotal: 600 },
        { menuItemId: 'menu-3', quantity: 50, pricePerPerson: 22, subtotal: 1100 },
        { menuItemId: 'menu-4', quantity: 50, pricePerPerson: 8, subtotal: 400 },
        { menuItemId: 'menu-6', quantity: 50, pricePerPerson: 5, subtotal: 250 },
      ],
      serviceType: 'buffet',
      status: 'confirmed',
      specialRequests: '5 vegetarian options needed',
      totalAmount: 2750,
      depositAmount: 825,
      depositPaid: true,
      deliveryFee: 100,
      staffCount: 3,
      staffCost: 300,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'order-2',
      eventName: 'Wedding Reception',
      clientName: 'Smith Family',
      clientEmail: 'bride@email.com',
      clientPhone: '+1 555-0102',
      eventDate: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      eventTime: '18:00',
      deliveryAddress: 'Grand Ballroom, 456 Event Center',
      guestCount: 150,
      menuItems: [
        { menuItemId: 'menu-1', quantity: 150, pricePerPerson: 12, subtotal: 1800 },
        { menuItemId: 'menu-2', quantity: 75, pricePerPerson: 28, subtotal: 2100 },
        { menuItemId: 'menu-3', quantity: 75, pricePerPerson: 22, subtotal: 1650 },
        { menuItemId: 'menu-5', quantity: 150, pricePerPerson: 10, subtotal: 1500 },
      ],
      serviceType: 'full-service',
      status: 'quoted',
      specialRequests: 'Bride has nut allergy',
      totalAmount: 8550,
      depositAmount: 2565,
      depositPaid: false,
      deliveryFee: 200,
      staffCount: 8,
      staffCost: 800,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'order-3',
      eventName: 'Birthday Party',
      clientName: 'Jane Doe',
      clientEmail: 'jane@email.com',
      clientPhone: '+1 555-0103',
      eventDate: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      eventTime: '14:00',
      deliveryAddress: '789 Home Street',
      guestCount: 25,
      menuItems: [
        { menuItemId: 'menu-1', quantity: 25, pricePerPerson: 12, subtotal: 300 },
        { menuItemId: 'menu-5', quantity: 25, pricePerPerson: 10, subtotal: 250 },
      ],
      serviceType: 'delivery',
      status: 'in-preparation',
      specialRequests: '',
      totalAmount: 600,
      depositAmount: 180,
      depositPaid: true,
      deliveryFee: 50,
      staffCount: 0,
      staffCost: 0,
      createdAt: new Date().toISOString(),
    },
  ];
};

export const CateringTool: React.FC<CateringToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Initialize hooks for menu items and orders with backend sync
  const menuData = useToolData<MenuItem>(
    'catering-menu',
    generateSampleMenuItems(),
    menuColumns,
    { autoSave: true }
  );

  const ordersData = useToolData<CateringOrder>(
    'catering-orders',
    generateSampleOrders(),
    orderColumns,
    { autoSave: true }
  );

  const menuItems = menuData.data;
  const orders = ordersData.data;

  // State
  const [activeTab, setActiveTab] = useState<TabType>('orders');
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [showMenuForm, setShowMenuForm] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  const [editingOrder, setEditingOrder] = useState<CateringOrder | null>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<MenuCategory | ''>('');
  const [filterStatus, setFilterStatus] = useState<OrderStatus | ''>('');

  // New menu item form
  const [newMenuItem, setNewMenuItem] = useState<Partial<MenuItem>>({
    name: '',
    category: 'main-course',
    description: '',
    pricePerPerson: 0,
    minimumOrder: 10,
    dietaryInfo: [],
    ingredients: '',
    prepTime: 30,
    isAvailable: true,
  });

  // New order form
  const [newOrder, setNewOrder] = useState<Partial<CateringOrder>>({
    eventName: '',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    eventDate: new Date().toISOString().split('T')[0],
    eventTime: '12:00',
    deliveryAddress: '',
    guestCount: 50,
    menuItems: [],
    serviceType: 'delivery',
    status: 'inquiry',
    specialRequests: '',
    depositPaid: false,
    deliveryFee: 0,
    staffCount: 0,
    staffCost: 0,
  });

  // Selected menu items for order
  const [selectedMenuItems, setSelectedMenuItems] = useState<Map<string, number>>(new Map());

  // Validation error states
  const [menuItemErrors, setMenuItemErrors] = useState<Record<string, string>>({});
  const [orderErrors, setOrderErrors] = useState<Record<string, string>>({});

  // Apply prefill data from uiConfig.params
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.eventName || params.clientName) {
        setNewOrder(prev => ({
          ...prev,
          eventName: params.eventName || prev.eventName,
          clientName: params.clientName || prev.clientName,
          clientEmail: params.email || prev.clientEmail,
          eventDate: params.date || prev.eventDate,
          guestCount: params.guestCount || prev.guestCount,
          deliveryAddress: params.address || prev.deliveryAddress,
        }));
        setShowOrderForm(true);
        setActiveTab('orders');
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Filtered menu items
  const filteredMenuItems = useMemo(() => {
    return menuItems.filter(item => {
      const matchesSearch = searchQuery === '' ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === '' || item.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [menuItems, searchQuery, filterCategory]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = searchQuery === '' ||
        order.eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.clientName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === '' || order.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, filterStatus]);

  // Analytics
  const analytics = useMemo(() => {
    const totalOrders = orders.length;
    const activeOrders = orders.filter(o => !['completed', 'cancelled'].includes(o.status)).length;
    const totalRevenue = orders
      .filter(o => ['confirmed', 'in-preparation', 'ready', 'delivered', 'completed'].includes(o.status))
      .reduce((sum, o) => sum + o.totalAmount, 0);
    const totalDeposits = orders
      .filter(o => o.depositPaid)
      .reduce((sum, o) => sum + o.depositAmount, 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / orders.filter(o => o.status !== 'cancelled').length : 0;
    const totalGuests = orders
      .filter(o => o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.guestCount, 0);

    // Popular items
    const itemCounts = new Map<string, number>();
    orders.forEach(order => {
      order.menuItems.forEach(item => {
        itemCounts.set(item.menuItemId, (itemCounts.get(item.menuItemId) || 0) + item.quantity);
      });
    });
    const popularItems = Array.from(itemCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id, count]) => ({
        item: menuItems.find(m => m.id === id),
        count,
      }));

    return {
      totalOrders,
      activeOrders,
      totalRevenue,
      totalDeposits,
      averageOrderValue,
      totalGuests,
      popularItems,
    };
  }, [orders, menuItems]);

  // Calculate order total
  const calculateOrderTotal = (items: Map<string, number>, guestCount: number, serviceType: ServiceType) => {
    let subtotal = 0;
    items.forEach((quantity, menuItemId) => {
      const item = menuItems.find(m => m.id === menuItemId);
      if (item) {
        subtotal += item.pricePerPerson * quantity;
      }
    });

    let deliveryFee = 0;
    let staffCost = 0;
    let staffCount = 0;

    switch (serviceType) {
      case 'delivery':
        deliveryFee = 50;
        break;
      case 'drop-off':
        deliveryFee = 75;
        break;
      case 'buffet':
        deliveryFee = 100;
        staffCount = Math.ceil(guestCount / 25);
        staffCost = staffCount * 100;
        break;
      case 'full-service':
        deliveryFee = 150;
        staffCount = Math.ceil(guestCount / 15);
        staffCost = staffCount * 100;
        break;
    }

    return {
      subtotal,
      deliveryFee,
      staffCount,
      staffCost,
      total: subtotal + deliveryFee + staffCost,
      deposit: Math.round((subtotal + deliveryFee + staffCost) * 0.3),
    };
  };

  // Validation functions
  const validateMenuItem = (): boolean => {
    const errors: Record<string, string> = {};
    if (!newMenuItem.name?.trim()) {
      errors.name = 'Item name is required';
    }
    setMenuItemErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateOrder = (): boolean => {
    const errors: Record<string, string> = {};
    if (!newOrder.eventName?.trim()) {
      errors.eventName = 'Event name is required';
    }
    if (!newOrder.clientName?.trim()) {
      errors.clientName = 'Client name is required';
    }
    if (selectedMenuItems.size === 0) {
      errors.menuItems = 'Please select at least one menu item';
    }
    setOrderErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // CRUD handlers for Menu Items
  const handleAddMenuItem = () => {
    if (!validateMenuItem()) return;

    const item: MenuItem = {
      id: `menu-${Date.now()}`,
      name: newMenuItem.name || '',
      category: (newMenuItem.category as MenuCategory) || 'main-course',
      description: newMenuItem.description || '',
      pricePerPerson: newMenuItem.pricePerPerson || 0,
      minimumOrder: newMenuItem.minimumOrder || 10,
      dietaryInfo: newMenuItem.dietaryInfo || [],
      ingredients: newMenuItem.ingredients || '',
      prepTime: newMenuItem.prepTime || 30,
      isAvailable: newMenuItem.isAvailable ?? true,
      createdAt: new Date().toISOString(),
    };

    menuData.addItem(item);
    setNewMenuItem({
      name: '',
      category: 'main-course',
      description: '',
      pricePerPerson: 0,
      minimumOrder: 10,
      dietaryInfo: [],
      ingredients: '',
      prepTime: 30,
      isAvailable: true,
    });
    setMenuItemErrors({});
    setShowMenuForm(false);
  };

  const handleUpdateMenuItem = () => {
    if (!editingMenuItem) return;
    menuData.updateItem(editingMenuItem.id, editingMenuItem);
    setEditingMenuItem(null);
  };

  const handleDeleteMenuItem = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Menu Item',
      message: 'Are you sure you want to delete this menu item?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger'
    });
    if (confirmed) {
      menuData.deleteItem(id);
    }
  };

  // CRUD handlers for Orders
  const handleAddOrder = () => {
    if (!validateOrder()) return;

    const orderMenuItems: OrderMenuItem[] = [];
    selectedMenuItems.forEach((quantity, menuItemId) => {
      const item = menuItems.find(m => m.id === menuItemId);
      if (item) {
        orderMenuItems.push({
          menuItemId,
          quantity,
          pricePerPerson: item.pricePerPerson,
          subtotal: item.pricePerPerson * quantity,
        });
      }
    });

    const totals = calculateOrderTotal(selectedMenuItems, newOrder.guestCount || 50, newOrder.serviceType as ServiceType || 'delivery');

    const order: CateringOrder = {
      id: `order-${Date.now()}`,
      eventName: newOrder.eventName || '',
      clientName: newOrder.clientName || '',
      clientEmail: newOrder.clientEmail || '',
      clientPhone: newOrder.clientPhone || '',
      eventDate: newOrder.eventDate || new Date().toISOString().split('T')[0],
      eventTime: newOrder.eventTime || '12:00',
      deliveryAddress: newOrder.deliveryAddress || '',
      guestCount: newOrder.guestCount || 50,
      menuItems: orderMenuItems,
      serviceType: (newOrder.serviceType as ServiceType) || 'delivery',
      status: 'inquiry',
      specialRequests: newOrder.specialRequests || '',
      totalAmount: totals.total,
      depositAmount: totals.deposit,
      depositPaid: false,
      deliveryFee: totals.deliveryFee,
      staffCount: totals.staffCount,
      staffCost: totals.staffCost,
      createdAt: new Date().toISOString(),
    };

    ordersData.addItem(order);
    setNewOrder({
      eventName: '',
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      eventDate: new Date().toISOString().split('T')[0],
      eventTime: '12:00',
      deliveryAddress: '',
      guestCount: 50,
      menuItems: [],
      serviceType: 'delivery',
      status: 'inquiry',
      specialRequests: '',
      depositPaid: false,
      deliveryFee: 0,
      staffCount: 0,
      staffCost: 0,
    });
    setSelectedMenuItems(new Map());
    setOrderErrors({});
    setShowOrderForm(false);
    setIsPrefilled(false);
  };

  const handleUpdateOrder = () => {
    if (!editingOrder) return;
    ordersData.updateItem(editingOrder.id, editingOrder);
    setEditingOrder(null);
  };

  const handleDeleteOrder = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Order',
      message: 'Are you sure you want to delete this order?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger'
    });
    if (confirmed) {
      ordersData.deleteItem(id);
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    const colors = {
      inquiry: isDark ? 'bg-gray-700/50 text-gray-400' : 'bg-gray-100 text-gray-800',
      quoted: isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-800',
      confirmed: isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800',
      'in-preparation': isDark ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-800',
      ready: isDark ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-800',
      delivered: isDark ? 'bg-teal-900/30 text-teal-400' : 'bg-teal-100 text-teal-800',
      completed: isDark ? 'bg-gray-700/50 text-gray-400' : 'bg-gray-100 text-gray-800',
      cancelled: isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800',
    };
    return colors[status] || colors.inquiry;
  };

  const toggleDietaryOption = (option: string, isEditing: boolean) => {
    if (isEditing && editingMenuItem) {
      const dietaryInfo = editingMenuItem.dietaryInfo.includes(option)
        ? editingMenuItem.dietaryInfo.filter(d => d !== option)
        : [...editingMenuItem.dietaryInfo, option];
      setEditingMenuItem({ ...editingMenuItem, dietaryInfo });
    } else {
      const dietaryInfo = (newMenuItem.dietaryInfo || []).includes(option)
        ? (newMenuItem.dietaryInfo || []).filter(d => d !== option)
        : [...(newMenuItem.dietaryInfo || []), option];
      setNewMenuItem({ ...newMenuItem, dietaryInfo });
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.catering.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.catering.cateringManagement', 'Catering Management')}
                </h1>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.catering.manageCateringOrdersAndMenu', 'Manage catering orders and menu items')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="catering" toolName="Catering" />

              <SyncStatus
                isSynced={menuData.isSynced && ordersData.isSynced}
                isSaving={menuData.isSaving || ordersData.isSaving}
                lastSaved={menuData.lastSaved || ordersData.lastSaved}
                syncError={menuData.syncError || ordersData.syncError}
                onForceSync={async () => {
                  await menuData.forceSync();
                  await ordersData.forceSync();
                  return true;
                }}
                theme={theme}
                showLabel={true}
                size="md"
              />
              <ExportDropdown
                onExportCSV={() => activeTab === 'menu'
                  ? menuData.exportCSV({ filename: 'catering-menu' })
                  : ordersData.exportCSV({ filename: 'catering-orders' })
                }
                onExportExcel={() => activeTab === 'menu'
                  ? menuData.exportExcel({ filename: 'catering-menu' })
                  : ordersData.exportExcel({ filename: 'catering-orders' })
                }
                onExportJSON={() => activeTab === 'menu'
                  ? menuData.exportJSON({ filename: 'catering-menu' })
                  : ordersData.exportJSON({ filename: 'catering-orders' })
                }
                onExportPDF={() => activeTab === 'menu'
                  ? menuData.exportPDF({ filename: 'catering-menu', title: 'Catering Menu' })
                  : ordersData.exportPDF({ filename: 'catering-orders', title: 'Catering Orders' })
                }
                onPrint={() => activeTab === 'menu'
                  ? menuData.print('Catering Menu')
                  : ordersData.print('Catering Orders')
                }
                onCopyToClipboard={() => activeTab === 'menu'
                  ? menuData.copyToClipboard('tab')
                  : ordersData.copyToClipboard('tab')
                }
                showImport={false}
                theme={theme}
              />
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'orders', label: 'Orders', icon: <Package className="w-4 h-4" /> },
              { id: 'menu', label: 'Menu', icon: <Utensils className="w-4 h-4" /> },
              { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#0D9488] text-white'
                    : isDark
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
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 shadow`}>
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                    <input
                      type="text"
                      placeholder={t('tools.catering.searchOrders', 'Search orders...')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as OrderStatus | '')}
                  className={`px-4 py-2 rounded-lg border ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="">{t('tools.catering.allStatus', 'All Status')}</option>
                  {ORDER_STATUSES.map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
                <button
                  onClick={() => setShowOrderForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.catering.newOrder', 'New Order')}
                </button>
              </div>
            </div>

            {/* Orders List */}
            <div className="space-y-4">
              {filteredOrders.map(order => (
                <div
                  key={order.id}
                  className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {order.eventName}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                          {ORDER_STATUSES.find(s => s.value === order.status)?.label}
                        </span>
                      </div>
                      <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        <div>
                          <span className="block text-xs opacity-70">{t('tools.catering.client', 'Client')}</span>
                          <span className="font-medium">{order.clientName}</span>
                        </div>
                        <div>
                          <span className="block text-xs opacity-70">{t('tools.catering.dateTime', 'Date & Time')}</span>
                          <span className="font-medium">
                            {new Date(order.eventDate).toLocaleDateString()} at {order.eventTime}
                          </span>
                        </div>
                        <div>
                          <span className="block text-xs opacity-70">{t('tools.catering.guests', 'Guests')}</span>
                          <span className="font-medium">{order.guestCount}</span>
                        </div>
                        <div>
                          <span className="block text-xs opacity-70">{t('tools.catering.service', 'Service')}</span>
                          <span className="font-medium">
                            {SERVICE_TYPES.find(s => s.value === order.serviceType)?.label}
                          </span>
                        </div>
                      </div>
                      <div className="mt-3">
                        <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.catering.menuItems', 'Menu Items:')}</span>
                        <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          {order.menuItems.map(item => {
                            const menuItem = menuItems.find(m => m.id === item.menuItemId);
                            return menuItem?.name;
                          }).filter(Boolean).join(', ')}
                        </span>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        ${order.totalAmount.toLocaleString()}
                      </p>
                      <p className={`text-xs ${order.depositPaid ? 'text-green-500' : isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        {order.depositPaid ? 'Deposit Paid' : `Deposit: $${order.depositAmount}`}
                      </p>
                      <div className="flex gap-1 mt-2 justify-end">
                        <button
                          onClick={() => setEditingOrder(order)}
                          className={`p-1.5 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                        >
                          <Edit2 className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                        </button>
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          className={`p-1.5 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredOrders.length === 0 && (
              <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{t('tools.catering.noOrdersFoundCreateYour', 'No orders found. Create your first catering order!')}</p>
              </div>
            )}
          </div>
        )}

        {/* Menu Tab */}
        {activeTab === 'menu' && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 shadow`}>
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                    <input
                      type="text"
                      placeholder={t('tools.catering.searchMenu', 'Search menu...')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                </div>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value as MenuCategory | '')}
                  className={`px-4 py-2 rounded-lg border ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="">{t('tools.catering.allCategories', 'All Categories')}</option>
                  {MENU_CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
                <button
                  onClick={() => setShowMenuForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.catering.addItem', 'Add Item')}
                </button>
              </div>
            </div>

            {/* Menu Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMenuItems.map(item => (
                <div
                  key={item.id}
                  className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        {MENU_CATEGORIES.find(c => c.value === item.category)?.icon}
                        <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {item.name}
                        </h3>
                      </div>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {item.description}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      item.isAvailable
                        ? isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'
                        : isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800'
                    }`}>
                      {item.isAvailable ? t('tools.catering.available', 'Available') : t('tools.catering.unavailable', 'Unavailable')}
                    </span>
                  </div>

                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} space-y-1`}>
                    <div className="flex justify-between">
                      <span>{t('tools.catering.pricePerPerson', 'Price per person:')}</span>
                      <span className="font-medium">${item.pricePerPerson}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('tools.catering.minimumOrder', 'Minimum order:')}</span>
                      <span>{item.minimumOrder} people</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('tools.catering.prepTime', 'Prep time:')}</span>
                      <span>{item.prepTime} min</span>
                    </div>
                  </div>

                  {item.dietaryInfo.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {item.dietaryInfo.map(diet => (
                        <span
                          key={diet}
                          className={`px-2 py-0.5 rounded-full text-xs ${
                            isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {diet}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => setEditingMenuItem(item)}
                      className={`flex-1 px-3 py-1.5 rounded text-sm ${
                        isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {t('tools.catering.edit', 'Edit')}
                    </button>
                    <button
                      onClick={() => handleDeleteMenuItem(item.id)}
                      className={`p-1.5 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredMenuItems.length === 0 && (
              <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <Utensils className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{t('tools.catering.noMenuItemsFoundAdd', 'No menu items found. Add your first menu item!')}</p>
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow`}>
                <div className="flex items-center gap-3 mb-2">
                  <Package className="w-5 h-5 text-[#0D9488]" />
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.catering.totalOrders', 'Total Orders')}</span>
                </div>
                <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {analytics.totalOrders}
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  {analytics.activeOrders} active
                </p>
              </div>

              <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow`}>
                <div className="flex items-center gap-3 mb-2">
                  <DollarSign className="w-5 h-5 text-green-500" />
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.catering.totalRevenue', 'Total Revenue')}</span>
                </div>
                <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  ${analytics.totalRevenue.toLocaleString()}
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  ${analytics.totalDeposits.toLocaleString()} in deposits
                </p>
              </div>

              <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow`}>
                <div className="flex items-center gap-3 mb-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.catering.totalGuestsServed', 'Total Guests Served')}</span>
                </div>
                <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {analytics.totalGuests}
                </p>
              </div>

              <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow`}>
                <div className="flex items-center gap-3 mb-2">
                  <BarChart3 className="w-5 h-5 text-purple-500" />
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.catering.avgOrderValue', 'Avg. Order Value')}</span>
                </div>
                <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  ${Math.round(analytics.averageOrderValue).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Popular Items */}
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow`}>
              <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.catering.mostPopularItems', 'Most Popular Items')}
              </h3>
              <div className="space-y-3">
                {analytics.popularItems.map(({ item, count }, index) => (
                  item && (
                    <div key={item.id} className="flex items-center gap-4">
                      <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-medium ${
                        isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {item.name}
                        </p>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {MENU_CATEGORIES.find(c => c.value === item.category)?.label}
                        </p>
                      </div>
                      <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {count} servings
                      </span>
                    </div>
                  )
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Menu Item Form Modal */}
        {(showMenuForm || editingMenuItem) && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto`}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {editingMenuItem ? t('tools.catering.editMenuItem', 'Edit Menu Item') : t('tools.catering.addMenuItem', 'Add Menu Item')}
                  </h2>
                  <button
                    onClick={() => {
                      setShowMenuForm(false);
                      setEditingMenuItem(null);
                    }}
                    className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  >
                    <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.catering.itemName', 'Item Name *')}
                    </label>
                    <input
                      type="text"
                      value={editingMenuItem?.name || newMenuItem.name}
                      onChange={(e) => {
                        if (editingMenuItem) {
                          setEditingMenuItem({ ...editingMenuItem, name: e.target.value });
                        } else {
                          setNewMenuItem({ ...newMenuItem, name: e.target.value });
                          if (menuItemErrors.name) setMenuItemErrors(prev => ({ ...prev, name: '' }));
                        }
                      }}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        menuItemErrors.name ? 'border-red-500' : isDark ? 'border-gray-600' : 'border-gray-300'
                      } ${isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}`}
                    />
                    {menuItemErrors.name && <p className="text-red-500 text-xs mt-1">{menuItemErrors.name}</p>}
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.catering.category', 'Category')}
                    </label>
                    <select
                      value={editingMenuItem?.category || newMenuItem.category}
                      onChange={(e) => editingMenuItem
                        ? setEditingMenuItem({ ...editingMenuItem, category: e.target.value as MenuCategory })
                        : setNewMenuItem({ ...newMenuItem, category: e.target.value as MenuCategory })
                      }
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      {MENU_CATEGORIES.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.catering.description', 'Description')}
                    </label>
                    <textarea
                      value={editingMenuItem?.description || newMenuItem.description}
                      onChange={(e) => editingMenuItem
                        ? setEditingMenuItem({ ...editingMenuItem, description: e.target.value })
                        : setNewMenuItem({ ...newMenuItem, description: e.target.value })
                      }
                      rows={2}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.catering.pricePerPerson2', 'Price per Person ($)')}
                      </label>
                      <input
                        type="number"
                        value={editingMenuItem?.pricePerPerson || newMenuItem.pricePerPerson}
                        onChange={(e) => editingMenuItem
                          ? setEditingMenuItem({ ...editingMenuItem, pricePerPerson: parseFloat(e.target.value) || 0 })
                          : setNewMenuItem({ ...newMenuItem, pricePerPerson: parseFloat(e.target.value) || 0 })
                        }
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.catering.minimumOrder2', 'Minimum Order')}
                      </label>
                      <input
                        type="number"
                        value={editingMenuItem?.minimumOrder || newMenuItem.minimumOrder}
                        onChange={(e) => editingMenuItem
                          ? setEditingMenuItem({ ...editingMenuItem, minimumOrder: parseInt(e.target.value) || 0 })
                          : setNewMenuItem({ ...newMenuItem, minimumOrder: parseInt(e.target.value) || 0 })
                        }
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.catering.dietaryOptions', 'Dietary Options')}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {DIETARY_OPTIONS.map(option => {
                        const isSelected = (editingMenuItem?.dietaryInfo || newMenuItem.dietaryInfo || []).includes(option);
                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() => toggleDietaryOption(option, !!editingMenuItem)}
                            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                              isSelected
                                ? 'bg-[#0D9488] text-white'
                                : isDark
                                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isAvailable"
                      checked={editingMenuItem?.isAvailable ?? newMenuItem.isAvailable ?? true}
                      onChange={(e) => editingMenuItem
                        ? setEditingMenuItem({ ...editingMenuItem, isAvailable: e.target.checked })
                        : setNewMenuItem({ ...newMenuItem, isAvailable: e.target.checked })
                      }
                      className="w-4 h-4 rounded"
                    />
                    <label htmlFor="isAvailable" className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.catering.availableForOrdering', 'Available for ordering')}
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => {
                      setShowMenuForm(false);
                      setEditingMenuItem(null);
                      setMenuItemErrors({});
                    }}
                    className={`px-4 py-2 rounded-lg ${
                      isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {t('tools.catering.cancel', 'Cancel')}
                  </button>
                  <button
                    onClick={editingMenuItem ? handleUpdateMenuItem : handleAddMenuItem}
                    className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90"
                  >
                    {editingMenuItem ? t('tools.catering.saveChanges', 'Save Changes') : t('tools.catering.addItem2', 'Add Item')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Order Form Modal */}
        {(showOrderForm || editingOrder) && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {editingOrder ? t('tools.catering.editOrder', 'Edit Order') : t('tools.catering.newCateringOrder', 'New Catering Order')}
                  </h2>
                  <button
                    onClick={() => {
                      setShowOrderForm(false);
                      setEditingOrder(null);
                      setSelectedMenuItems(new Map());
                      setOrderErrors({});
                      setIsPrefilled(false);
                    }}
                    className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  >
                    <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.catering.eventName', 'Event Name *')}
                    </label>
                    <input
                      type="text"
                      value={editingOrder?.eventName || newOrder.eventName}
                      onChange={(e) => {
                        if (editingOrder) {
                          setEditingOrder({ ...editingOrder, eventName: e.target.value });
                        } else {
                          setNewOrder({ ...newOrder, eventName: e.target.value });
                          if (orderErrors.eventName) setOrderErrors(prev => ({ ...prev, eventName: '' }));
                        }
                      }}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        orderErrors.eventName ? 'border-red-500' : isDark ? 'border-gray-600' : 'border-gray-300'
                      } ${isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}`}
                    />
                    {orderErrors.eventName && <p className="text-red-500 text-xs mt-1">{orderErrors.eventName}</p>}
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.catering.clientName', 'Client Name *')}
                    </label>
                    <input
                      type="text"
                      value={editingOrder?.clientName || newOrder.clientName}
                      onChange={(e) => {
                        if (editingOrder) {
                          setEditingOrder({ ...editingOrder, clientName: e.target.value });
                        } else {
                          setNewOrder({ ...newOrder, clientName: e.target.value });
                          if (orderErrors.clientName) setOrderErrors(prev => ({ ...prev, clientName: '' }));
                        }
                      }}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        orderErrors.clientName ? 'border-red-500' : isDark ? 'border-gray-600' : 'border-gray-300'
                      } ${isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}`}
                    />
                    {orderErrors.clientName && <p className="text-red-500 text-xs mt-1">{orderErrors.clientName}</p>}
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.catering.clientEmail', 'Client Email')}
                    </label>
                    <input
                      type="email"
                      value={editingOrder?.clientEmail || newOrder.clientEmail}
                      onChange={(e) => editingOrder
                        ? setEditingOrder({ ...editingOrder, clientEmail: e.target.value })
                        : setNewOrder({ ...newOrder, clientEmail: e.target.value })
                      }
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.catering.clientPhone', 'Client Phone')}
                    </label>
                    <input
                      type="tel"
                      value={editingOrder?.clientPhone || newOrder.clientPhone}
                      onChange={(e) => editingOrder
                        ? setEditingOrder({ ...editingOrder, clientPhone: e.target.value })
                        : setNewOrder({ ...newOrder, clientPhone: e.target.value })
                      }
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.catering.eventDate', 'Event Date')}
                    </label>
                    <input
                      type="date"
                      value={editingOrder?.eventDate || newOrder.eventDate}
                      onChange={(e) => editingOrder
                        ? setEditingOrder({ ...editingOrder, eventDate: e.target.value })
                        : setNewOrder({ ...newOrder, eventDate: e.target.value })
                      }
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.catering.eventTime', 'Event Time')}
                    </label>
                    <input
                      type="time"
                      value={editingOrder?.eventTime || newOrder.eventTime}
                      onChange={(e) => editingOrder
                        ? setEditingOrder({ ...editingOrder, eventTime: e.target.value })
                        : setNewOrder({ ...newOrder, eventTime: e.target.value })
                      }
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.catering.guestCount', 'Guest Count')}
                    </label>
                    <input
                      type="number"
                      value={editingOrder?.guestCount || newOrder.guestCount}
                      onChange={(e) => editingOrder
                        ? setEditingOrder({ ...editingOrder, guestCount: parseInt(e.target.value) || 0 })
                        : setNewOrder({ ...newOrder, guestCount: parseInt(e.target.value) || 0 })
                      }
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.catering.serviceType', 'Service Type')}
                    </label>
                    <select
                      value={editingOrder?.serviceType || newOrder.serviceType}
                      onChange={(e) => editingOrder
                        ? setEditingOrder({ ...editingOrder, serviceType: e.target.value as ServiceType })
                        : setNewOrder({ ...newOrder, serviceType: e.target.value as ServiceType })
                      }
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      {SERVICE_TYPES.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.catering.deliveryAddress', 'Delivery Address')}
                    </label>
                    <input
                      type="text"
                      value={editingOrder?.deliveryAddress || newOrder.deliveryAddress}
                      onChange={(e) => editingOrder
                        ? setEditingOrder({ ...editingOrder, deliveryAddress: e.target.value })
                        : setNewOrder({ ...newOrder, deliveryAddress: e.target.value })
                      }
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>

                  {!editingOrder && (
                    <div className="md:col-span-2">
                      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.catering.selectMenuItems', 'Select Menu Items *')}
                      </label>
                      {orderErrors.menuItems && <p className="text-red-500 text-xs mb-2">{orderErrors.menuItems}</p>}
                      <div className={`space-y-2 max-h-48 overflow-y-auto ${orderErrors.menuItems ? 'border border-red-500 rounded-lg p-2' : ''}`}>
                        {menuItems.filter(m => m.isAvailable).map(item => {
                          const quantity = selectedMenuItems.get(item.id) || 0;
                          return (
                            <div
                              key={item.id}
                              className={`flex items-center justify-between p-2 rounded ${
                                isDark ? 'bg-gray-700' : 'bg-gray-50'
                              }`}
                            >
                              <div>
                                <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                  {item.name}
                                </span>
                                <span className={`text-sm ml-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                  ${item.pricePerPerson}/person
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newMap = new Map(selectedMenuItems);
                                    if (quantity > 0) {
                                      if (quantity <= 1) {
                                        newMap.delete(item.id);
                                      } else {
                                        newMap.set(item.id, quantity - 1);
                                      }
                                    }
                                    setSelectedMenuItems(newMap);
                                  }}
                                  className={`w-8 h-8 rounded flex items-center justify-center ${
                                    isDark ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-700'
                                  }`}
                                >
                                  -
                                </button>
                                <span className={`w-12 text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                  {quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newMap = new Map(selectedMenuItems);
                                    newMap.set(item.id, quantity + (newOrder.guestCount || 50));
                                    setSelectedMenuItems(newMap);
                                    if (orderErrors.menuItems) setOrderErrors(prev => ({ ...prev, menuItems: '' }));
                                  }}
                                  className="w-8 h-8 rounded flex items-center justify-center bg-[#0D9488] text-white"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {editingOrder && (
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.catering.status', 'Status')}
                      </label>
                      <select
                        value={editingOrder.status}
                        onChange={(e) => setEditingOrder({ ...editingOrder, status: e.target.value as OrderStatus })}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        {ORDER_STATUSES.map(status => (
                          <option key={status.value} value={status.value}>{status.label}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="md:col-span-2">
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.catering.specialRequests', 'Special Requests')}
                    </label>
                    <textarea
                      value={editingOrder?.specialRequests || newOrder.specialRequests}
                      onChange={(e) => editingOrder
                        ? setEditingOrder({ ...editingOrder, specialRequests: e.target.value })
                        : setNewOrder({ ...newOrder, specialRequests: e.target.value })
                      }
                      rows={2}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => {
                      setShowOrderForm(false);
                      setEditingOrder(null);
                      setSelectedMenuItems(new Map());
                      setOrderErrors({});
                      setIsPrefilled(false);
                    }}
                    className={`px-4 py-2 rounded-lg ${
                      isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {t('tools.catering.cancel2', 'Cancel')}
                  </button>
                  <button
                    onClick={editingOrder ? handleUpdateOrder : handleAddOrder}
                    className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90"
                  >
                    {editingOrder ? t('tools.catering.saveChanges2', 'Save Changes') : t('tools.catering.createOrder', 'Create Order')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Confirm Dialog */}
        <ConfirmDialog />
      </div>
    </div>
  );
};

export default CateringTool;
