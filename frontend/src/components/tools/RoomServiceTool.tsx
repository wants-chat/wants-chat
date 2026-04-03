'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ConciergeBell,
  Plus,
  Trash2,
  Edit2,
  Save,
  Search,
  X,
  Clock,
  User,
  Bed,
  Phone,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  ChefHat,
  Truck,
  Timer,
  Star,
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import useToolData from '../../hooks/useToolData';
import { type ColumnConfig } from '../../lib/toolDataUtils';

interface RoomServiceToolProps {
  uiConfig?: UIConfig;
}

interface RoomServiceOrder {
  id: string;
  roomNumber: string;
  guestName: string;
  orderType: OrderType;
  items: OrderItem[];
  specialInstructions: string;
  status: OrderStatus;
  priority: Priority;
  totalAmount: number;
  tipAmount: number;
  paymentMethod: PaymentMethod;
  orderedAt: string;
  estimatedDelivery: string;
  deliveredAt: string;
  assignedTo: string;
  rating: number;
  feedback: string;
  createdAt: string;
  updatedAt: string;
}

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  notes: string;
}

type OrderType = 'food' | 'beverage' | 'amenity' | 'laundry' | 'housekeeping' | 'maintenance' | 'other';
type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'on-the-way' | 'delivered' | 'cancelled';
type Priority = 'low' | 'normal' | 'high' | 'urgent';
type PaymentMethod = 'room-charge' | 'credit-card' | 'cash' | 'mobile-pay';

const ORDER_TYPES: { value: OrderType; label: string; icon: React.ReactNode }[] = [
  { value: 'food', label: 'Food', icon: <ChefHat className="w-4 h-4" /> },
  { value: 'beverage', label: 'Beverage', icon: <ConciergeBell className="w-4 h-4" /> },
  { value: 'amenity', label: 'Amenity', icon: <Star className="w-4 h-4" /> },
  { value: 'laundry', label: 'Laundry', icon: <ConciergeBell className="w-4 h-4" /> },
  { value: 'housekeeping', label: 'Housekeeping', icon: <ConciergeBell className="w-4 h-4" /> },
  { value: 'maintenance', label: 'Maintenance', icon: <ConciergeBell className="w-4 h-4" /> },
  { value: 'other', label: 'Other', icon: <ConciergeBell className="w-4 h-4" /> },
];

const ORDER_STATUSES: { value: OrderStatus; label: string; color: string }[] = [
  { value: 'pending', label: 'Pending', color: 'yellow' },
  { value: 'confirmed', label: 'Confirmed', color: 'blue' },
  { value: 'preparing', label: 'Preparing', color: 'purple' },
  { value: 'on-the-way', label: 'On the Way', color: 'cyan' },
  { value: 'delivered', label: 'Delivered', color: 'green' },
  { value: 'cancelled', label: 'Cancelled', color: 'red' },
];

const PRIORITIES: { value: Priority; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: 'gray' },
  { value: 'normal', label: 'Normal', color: 'blue' },
  { value: 'high', label: 'High', color: 'orange' },
  { value: 'urgent', label: 'Urgent', color: 'red' },
];

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'room-charge', label: 'Room Charge' },
  { value: 'credit-card', label: 'Credit Card' },
  { value: 'cash', label: 'Cash' },
  { value: 'mobile-pay', label: 'Mobile Pay' },
];

const orderColumns: ColumnConfig[] = [
  { key: 'id', header: 'Order ID', type: 'string' },
  { key: 'roomNumber', header: 'Room', type: 'string' },
  { key: 'guestName', header: 'Guest', type: 'string' },
  { key: 'orderType', header: 'Type', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'priority', header: 'Priority', type: 'string' },
  { key: 'totalAmount', header: 'Total', type: 'currency' },
  { key: 'assignedTo', header: 'Assigned To', type: 'string' },
  { key: 'orderedAt', header: 'Ordered At', type: 'date' },
  { key: 'deliveredAt', header: 'Delivered At', type: 'date' },
];

const generateSampleOrders = (): RoomServiceOrder[] => {
  const now = new Date();
  return [
    {
      id: 'RS-001',
      roomNumber: '412',
      guestName: 'John Smith',
      orderType: 'food',
      items: [
        { name: 'Club Sandwich', quantity: 1, price: 18.99, notes: 'No tomatoes' },
        { name: 'Caesar Salad', quantity: 1, price: 14.99, notes: '' },
        { name: 'Sparkling Water', quantity: 2, price: 4.99, notes: '' },
      ],
      specialInstructions: 'Please include extra napkins',
      status: 'preparing',
      priority: 'normal',
      totalAmount: 43.96,
      tipAmount: 8.79,
      paymentMethod: 'room-charge',
      orderedAt: new Date(now.getTime() - 20 * 60000).toISOString(),
      estimatedDelivery: new Date(now.getTime() + 15 * 60000).toISOString(),
      deliveredAt: '',
      assignedTo: 'Maria Rodriguez',
      rating: 0,
      feedback: '',
      createdAt: new Date(now.getTime() - 20 * 60000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'RS-002',
      roomNumber: '305',
      guestName: 'Emily Watson',
      orderType: 'beverage',
      items: [
        { name: 'Bottle of Red Wine', quantity: 1, price: 65.00, notes: 'Cabernet Sauvignon' },
        { name: 'Cheese Platter', quantity: 1, price: 24.99, notes: '' },
      ],
      specialInstructions: '',
      status: 'on-the-way',
      priority: 'high',
      totalAmount: 89.99,
      tipAmount: 18.00,
      paymentMethod: 'credit-card',
      orderedAt: new Date(now.getTime() - 30 * 60000).toISOString(),
      estimatedDelivery: new Date(now.getTime() + 5 * 60000).toISOString(),
      deliveredAt: '',
      assignedTo: 'Carlos Mendez',
      rating: 0,
      feedback: '',
      createdAt: new Date(now.getTime() - 30 * 60000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'RS-003',
      roomNumber: '518',
      guestName: 'Michael Chen',
      orderType: 'amenity',
      items: [
        { name: 'Extra Pillows', quantity: 2, price: 0, notes: 'Hypoallergenic' },
        { name: 'Extra Towels', quantity: 4, price: 0, notes: '' },
      ],
      specialInstructions: '',
      status: 'delivered',
      priority: 'normal',
      totalAmount: 0,
      tipAmount: 5.00,
      paymentMethod: 'cash',
      orderedAt: new Date(now.getTime() - 60 * 60000).toISOString(),
      estimatedDelivery: new Date(now.getTime() - 45 * 60000).toISOString(),
      deliveredAt: new Date(now.getTime() - 40 * 60000).toISOString(),
      assignedTo: 'Anna Lee',
      rating: 5,
      feedback: 'Very quick service!',
      createdAt: new Date(now.getTime() - 60 * 60000).toISOString(),
      updatedAt: new Date(now.getTime() - 40 * 60000).toISOString(),
    },
    {
      id: 'RS-004',
      roomNumber: '201',
      guestName: 'Sarah Johnson',
      orderType: 'laundry',
      items: [
        { name: 'Express Laundry - 5 Items', quantity: 1, price: 45.00, notes: 'Need by 6 PM' },
      ],
      specialInstructions: 'Wedding tomorrow, need items pressed',
      status: 'pending',
      priority: 'urgent',
      totalAmount: 45.00,
      tipAmount: 0,
      paymentMethod: 'room-charge',
      orderedAt: new Date(now.getTime() - 5 * 60000).toISOString(),
      estimatedDelivery: new Date(now.getTime() + 180 * 60000).toISOString(),
      deliveredAt: '',
      assignedTo: '',
      rating: 0,
      feedback: '',
      createdAt: new Date(now.getTime() - 5 * 60000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
};

export const RoomServiceTool: React.FC<RoomServiceToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const orderData = useToolData<RoomServiceOrder>(
    'room-service',
    generateSampleOrders(),
    orderColumns,
    { autoSave: true }
  );

  const orders = orderData.data;

  const [showForm, setShowForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState<RoomServiceOrder | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<OrderType | ''>('');
  const [filterStatus, setFilterStatus] = useState<OrderStatus | ''>('');
  const [selectedOrder, setSelectedOrder] = useState<RoomServiceOrder | null>(null);

  const [newOrder, setNewOrder] = useState<Partial<RoomServiceOrder>>({
    roomNumber: '',
    guestName: '',
    orderType: 'food',
    items: [],
    specialInstructions: '',
    status: 'pending',
    priority: 'normal',
    totalAmount: 0,
    tipAmount: 0,
    paymentMethod: 'room-charge',
    assignedTo: '',
  });

  const [newItem, setNewItem] = useState<OrderItem>({
    name: '',
    quantity: 1,
    price: 0,
    notes: '',
  });

  const handleAddOrder = () => {
    if (!newOrder.roomNumber || !newOrder.guestName) return;

    const now = new Date();
    const order: RoomServiceOrder = {
      id: `RS-${Date.now().toString().slice(-6)}`,
      roomNumber: newOrder.roomNumber || '',
      guestName: newOrder.guestName || '',
      orderType: newOrder.orderType as OrderType || 'food',
      items: newOrder.items || [],
      specialInstructions: newOrder.specialInstructions || '',
      status: 'pending',
      priority: newOrder.priority as Priority || 'normal',
      totalAmount: newOrder.totalAmount || 0,
      tipAmount: 0,
      paymentMethod: newOrder.paymentMethod as PaymentMethod || 'room-charge',
      orderedAt: now.toISOString(),
      estimatedDelivery: new Date(now.getTime() + 30 * 60000).toISOString(),
      deliveredAt: '',
      assignedTo: newOrder.assignedTo || '',
      rating: 0,
      feedback: '',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    orderData.addItem(order);
    resetNewOrder();
    setShowForm(false);
  };

  const handleUpdateOrder = () => {
    if (!editingOrder) return;
    orderData.updateItem(editingOrder.id, {
      ...editingOrder,
      updatedAt: new Date().toISOString(),
    });
    setEditingOrder(null);
  };

  const handleDeleteOrder = (id: string) => {
    orderData.deleteItem(id);
    if (selectedOrder?.id === id) setSelectedOrder(null);
  };

  const handleUpdateStatus = (order: RoomServiceOrder, newStatus: OrderStatus) => {
    const updates: Partial<RoomServiceOrder> = {
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };
    if (newStatus === 'delivered') {
      updates.deliveredAt = new Date().toISOString();
    }
    orderData.updateItem(order.id, updates);
  };

  const handleAddItem = () => {
    if (!newItem.name) return;
    const items = editingOrder ? [...editingOrder.items, newItem] : [...(newOrder.items || []), newItem];
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    if (editingOrder) {
      setEditingOrder({...editingOrder, items, totalAmount: total});
    } else {
      setNewOrder({...newOrder, items, totalAmount: total});
    }
    setNewItem({ name: '', quantity: 1, price: 0, notes: '' });
  };

  const handleRemoveItem = (index: number) => {
    if (editingOrder) {
      const items = editingOrder.items.filter((_, i) => i !== index);
      const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      setEditingOrder({...editingOrder, items, totalAmount: total});
    } else {
      const items = (newOrder.items || []).filter((_, i) => i !== index);
      const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      setNewOrder({...newOrder, items, totalAmount: total});
    }
  };

  const resetNewOrder = () => {
    setNewOrder({
      roomNumber: '',
      guestName: '',
      orderType: 'food',
      items: [],
      specialInstructions: '',
      status: 'pending',
      priority: 'normal',
      totalAmount: 0,
      tipAmount: 0,
      paymentMethod: 'room-charge',
      assignedTo: '',
    });
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = !searchQuery ||
        order.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = !filterType || order.orderType === filterType;
      const matchesStatus = !filterStatus || order.status === filterStatus;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [orders, searchQuery, filterType, filterStatus]);

  const stats = useMemo(() => {
    const activeOrders = orders.filter(o => !['delivered', 'cancelled'].includes(o.status));
    return {
      total: orders.length,
      active: activeOrders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      totalRevenue: orders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + o.totalAmount, 0),
    };
  }, [orders]);

  const getStatusColor = (status: OrderStatus) => {
    const statusObj = ORDER_STATUSES.find(s => s.value === status);
    const colors: Record<string, string> = {
      yellow: isDark ? 'bg-yellow-900/50 text-yellow-300' : 'bg-yellow-100 text-yellow-800',
      blue: isDark ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-800',
      purple: isDark ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-800',
      cyan: isDark ? 'bg-cyan-900/50 text-cyan-300' : 'bg-cyan-100 text-cyan-800',
      green: isDark ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-800',
      red: isDark ? 'bg-red-900/50 text-red-300' : 'bg-red-100 text-red-800',
    };
    return colors[statusObj?.color || 'gray'];
  };

  const getPriorityColor = (priority: Priority) => {
    const priorityObj = PRIORITIES.find(p => p.value === priority);
    const colors: Record<string, string> = {
      gray: isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800',
      blue: isDark ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-800',
      orange: isDark ? 'bg-orange-900/50 text-orange-300' : 'bg-orange-100 text-orange-800',
      red: isDark ? 'bg-red-900/50 text-red-300' : 'bg-red-100 text-red-800',
    };
    return colors[priorityObj?.color || 'gray'];
  };

  const getTimeAgo = (dateStr: string) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={`min-h-screen p-6 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <ConciergeBell className="w-7 h-7 text-purple-500" />
              {t('tools.roomService.roomServiceTracking', 'Room Service Tracking')}
            </h1>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.roomService.manageAndTrackHotelRoom', 'Manage and track hotel room service orders')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <WidgetEmbedButton toolSlug="room-service" toolName="Room Service" />

            <SyncStatus
              isSynced={orderData.isSynced}
              isSaving={orderData.isSaving}
              lastSaved={orderData.lastSaved}
              syncError={orderData.syncError}
              onForceSync={orderData.forceSync}
            />
            <ExportDropdown
              onExportCSV={() => orderData.exportCSV()}
              onExportExcel={() => orderData.exportExcel()}
              onExportJSON={() => orderData.exportJSON()}
              onExportPDF={() => orderData.exportPDF()}
              onCopy={() => orderData.copyToClipboard()}
              onPrint={() => orderData.print('Room Service Orders')}
            />
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t('tools.roomService.newOrder', 'New Order')}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.roomService.totalOrders', 'Total Orders')}</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.roomService.activeOrders', 'Active Orders')}</p>
            <p className="text-2xl font-bold text-purple-500">{stats.active}</p>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.roomService.pending', 'Pending')}</p>
            <p className="text-2xl font-bold text-yellow-500">{stats.pending}</p>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.roomService.todaySRevenue', 'Today\'s Revenue')}</p>
            <p className="text-2xl font-bold text-green-500">${stats.totalRevenue.toFixed(2)}</p>
          </div>
        </div>

        {/* Filters */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow mb-6`}>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('tools.roomService.searchByRoomGuestOr', 'Search by room, guest, or order ID...')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as OrderType | '')}
              className={`px-4 py-2 rounded-lg border ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="">{t('tools.roomService.allTypes', 'All Types')}</option>
              {ORDER_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as OrderStatus | '')}
              className={`px-4 py-2 rounded-lg border ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="">{t('tools.roomService.allStatuses', 'All Statuses')}</option>
              {ORDER_STATUSES.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Orders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrders.map(order => (
            <div
              key={order.id}
              className={`rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow overflow-hidden`}
            >
              <div className={`p-4 ${isDark ? 'bg-gray-700' : 'bg-gray-50'} flex justify-between items-start`}>
                <div>
                  <div className="flex items-center gap-2">
                    <Bed className="w-4 h-4 text-purple-500" />
                    <span className="font-bold">Room {order.roomNumber}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${getPriorityColor(order.priority)}`}>
                      {PRIORITIES.find(p => p.value === order.priority)?.label}
                    </span>
                  </div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{order.guestName}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                  {ORDER_STATUSES.find(s => s.value === order.status)?.label}
                </span>
              </div>

              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium capitalize">{order.orderType}</span>
                  <span className="text-xs text-gray-500">#{order.id}</span>
                </div>

                <div className={`space-y-1 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {order.items.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>{item.quantity}x {item.name}</span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <p className="text-xs text-gray-500">+{order.items.length - 3} more items</p>
                  )}
                </div>

                <div className="border-t mt-3 pt-3 flex justify-between items-center">
                  <span className="font-bold text-lg">${order.totalAmount.toFixed(2)}</span>
                  <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {getTimeAgo(order.orderedAt)}
                  </span>
                </div>

                {order.assignedTo && (
                  <p className={`text-xs mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Assigned to: {order.assignedTo}
                  </p>
                )}

                <div className="flex gap-2 mt-3 pt-3 border-t">
                  {order.status === 'pending' && (
                    <button
                      onClick={() => handleUpdateStatus(order, 'confirmed')}
                      className="flex-1 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                    >
                      {t('tools.roomService.confirm', 'Confirm')}
                    </button>
                  )}
                  {order.status === 'confirmed' && (
                    <button
                      onClick={() => handleUpdateStatus(order, 'preparing')}
                      className="flex-1 py-2 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
                    >
                      {t('tools.roomService.startPreparing', 'Start Preparing')}
                    </button>
                  )}
                  {order.status === 'preparing' && (
                    <button
                      onClick={() => handleUpdateStatus(order, 'on-the-way')}
                      className="flex-1 py-2 bg-cyan-600 text-white rounded text-sm hover:bg-cyan-700"
                    >
                      {t('tools.roomService.outForDelivery', 'Out for Delivery')}
                    </button>
                  )}
                  {order.status === 'on-the-way' && (
                    <button
                      onClick={() => handleUpdateStatus(order, 'delivered')}
                      className="flex-1 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                    >
                      {t('tools.roomService.markDelivered', 'Mark Delivered')}
                    </button>
                  )}
                  <button
                    onClick={() => setEditingOrder(order)}
                    className={`p-2 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteOrder(order.id)}
                    className="p-2 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredOrders.length === 0 && (
          <div className={`text-center py-12 ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow`}>
            <ConciergeBell className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.roomService.noOrdersFound', 'No orders found')}</p>
          </div>
        )}

        {/* Add/Edit Order Modal */}
        {(showForm || editingOrder) && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} p-6`}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">
                  {editingOrder ? t('tools.roomService.editOrder', 'Edit Order') : t('tools.roomService.newOrder2', 'New Order')}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingOrder(null);
                    resetNewOrder();
                  }}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.roomService.roomNumber', 'Room Number *')}</label>
                  <input
                    type="text"
                    value={editingOrder?.roomNumber || newOrder.roomNumber}
                    onChange={(e) => editingOrder
                      ? setEditingOrder({...editingOrder, roomNumber: e.target.value})
                      : setNewOrder({...newOrder, roomNumber: e.target.value})
                    }
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.roomService.guestName', 'Guest Name *')}</label>
                  <input
                    type="text"
                    value={editingOrder?.guestName || newOrder.guestName}
                    onChange={(e) => editingOrder
                      ? setEditingOrder({...editingOrder, guestName: e.target.value})
                      : setNewOrder({...newOrder, guestName: e.target.value})
                    }
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.roomService.orderType', 'Order Type')}</label>
                  <select
                    value={editingOrder?.orderType || newOrder.orderType}
                    onChange={(e) => editingOrder
                      ? setEditingOrder({...editingOrder, orderType: e.target.value as OrderType})
                      : setNewOrder({...newOrder, orderType: e.target.value as OrderType})
                    }
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    {ORDER_TYPES.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.roomService.priority', 'Priority')}</label>
                  <select
                    value={editingOrder?.priority || newOrder.priority}
                    onChange={(e) => editingOrder
                      ? setEditingOrder({...editingOrder, priority: e.target.value as Priority})
                      : setNewOrder({...newOrder, priority: e.target.value as Priority})
                    }
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    {PRIORITIES.map(p => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.roomService.paymentMethod', 'Payment Method')}</label>
                  <select
                    value={editingOrder?.paymentMethod || newOrder.paymentMethod}
                    onChange={(e) => editingOrder
                      ? setEditingOrder({...editingOrder, paymentMethod: e.target.value as PaymentMethod})
                      : setNewOrder({...newOrder, paymentMethod: e.target.value as PaymentMethod})
                    }
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    {PAYMENT_METHODS.map(m => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.roomService.assignedTo', 'Assigned To')}</label>
                  <input
                    type="text"
                    value={editingOrder?.assignedTo || newOrder.assignedTo}
                    onChange={(e) => editingOrder
                      ? setEditingOrder({...editingOrder, assignedTo: e.target.value})
                      : setNewOrder({...newOrder, assignedTo: e.target.value})
                    }
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                {/* Order Items */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">{t('tools.roomService.orderItems', 'Order Items')}</label>
                  <div className={`p-4 rounded-lg border ${isDark ? 'border-gray-600' : 'border-gray-300'}`}>
                    {/* Existing items */}
                    {(editingOrder?.items || newOrder.items || []).map((item, index) => (
                      <div key={index} className="flex items-center gap-2 mb-2">
                        <span className="flex-1">{item.quantity}x {item.name} - ${(item.price * item.quantity).toFixed(2)}</span>
                        <button
                          onClick={() => handleRemoveItem(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}

                    {/* Add new item */}
                    <div className="flex gap-2 mt-2">
                      <input
                        type="text"
                        placeholder={t('tools.roomService.itemName', 'Item name')}
                        value={newItem.name}
                        onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                        className={`flex-1 px-3 py-1 rounded border ${
                          isDark
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                      <input
                        type="number"
                        placeholder={t('tools.roomService.qty', 'Qty')}
                        min="1"
                        value={newItem.quantity}
                        onChange={(e) => setNewItem({...newItem, quantity: parseInt(e.target.value)})}
                        className={`w-16 px-3 py-1 rounded border ${
                          isDark
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                      <input
                        type="number"
                        placeholder={t('tools.roomService.price', 'Price')}
                        min="0"
                        step="0.01"
                        value={newItem.price}
                        onChange={(e) => setNewItem({...newItem, price: parseFloat(e.target.value)})}
                        className={`w-24 px-3 py-1 rounded border ${
                          isDark
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                      <button
                        onClick={handleAddItem}
                        className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">{t('tools.roomService.specialInstructions', 'Special Instructions')}</label>
                  <textarea
                    rows={2}
                    value={editingOrder?.specialInstructions || newOrder.specialInstructions}
                    onChange={(e) => editingOrder
                      ? setEditingOrder({...editingOrder, specialInstructions: e.target.value})
                      : setNewOrder({...newOrder, specialInstructions: e.target.value})
                    }
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div className="md:col-span-2 text-right">
                  <p className="text-xl font-bold">
                    Total: ${(editingOrder?.totalAmount || newOrder.totalAmount || 0).toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingOrder(null);
                    resetNewOrder();
                  }}
                  className={`px-4 py-2 rounded-lg ${
                    isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  {t('tools.roomService.cancel', 'Cancel')}
                </button>
                <button
                  onClick={editingOrder ? handleUpdateOrder : handleAddOrder}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {editingOrder ? t('tools.roomService.update', 'Update') : t('tools.roomService.create', 'Create')} Order
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomServiceTool;
