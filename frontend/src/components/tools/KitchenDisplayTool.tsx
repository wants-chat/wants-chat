'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ChefHat,
  Plus,
  Trash2,
  Clock,
  X,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Loader2,
  Check,
  AlertTriangle,
  Timer,
  Flame,
  Bell,
  Users,
  ClipboardList,
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UIConfig } from '../ContextualUI';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { useToolData } from '../../hooks/useToolData';
import type { ColumnConfig } from '../../lib/toolDataUtils';

interface KitchenDisplayToolProps {
  uiConfig?: UIConfig;
}

type OrderStatus = 'new' | 'in-progress' | 'ready' | 'completed' | 'cancelled';
type OrderPriority = 'normal' | 'rush' | 'vip';

interface OrderItem {
  name: string;
  quantity: number;
  modifications: string;
  completed: boolean;
}

interface KitchenOrder {
  id: string;
  orderNumber: string;
  tableNumber: string;
  serverName: string;
  items: OrderItem[];
  status: OrderStatus;
  priority: OrderPriority;
  orderTime: string;
  startedAt: string;
  completedAt: string;
  specialInstructions: string;
  courseNumber: number;
  createdAt: string;
  updatedAt: string;
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bgColor: string; borderColor: string }> = {
  new: { label: 'New', color: 'text-red-600', bgColor: 'bg-red-100 dark:bg-red-900/30', borderColor: 'border-red-500' },
  'in-progress': { label: 'Cooking', color: 'text-yellow-600', bgColor: 'bg-yellow-100 dark:bg-yellow-900/30', borderColor: 'border-yellow-500' },
  ready: { label: 'Ready', color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-900/30', borderColor: 'border-green-500' },
  completed: { label: 'Served', color: 'text-gray-600', bgColor: 'bg-gray-100 dark:bg-gray-700', borderColor: 'border-gray-500' },
  cancelled: { label: 'Cancelled', color: 'text-gray-400', bgColor: 'bg-gray-100 dark:bg-gray-700', borderColor: 'border-gray-400' },
};

const PRIORITY_CONFIG: Record<OrderPriority, { label: string; color: string; icon: any }> = {
  normal: { label: 'Normal', color: 'text-gray-500', icon: null },
  rush: { label: 'RUSH', color: 'text-orange-500', icon: Timer },
  vip: { label: 'VIP', color: 'text-purple-500', icon: Users },
};

const KITCHEN_COLUMNS: ColumnConfig[] = [
  { key: 'orderNumber', header: 'Order #', type: 'string' },
  { key: 'tableNumber', header: 'Table', type: 'string' },
  { key: 'serverName', header: 'Server', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'priority', header: 'Priority', type: 'string' },
  { key: 'orderTime', header: 'Order Time', type: 'string' },
  { key: 'items', header: 'Items', type: 'string', format: (v) => Array.isArray(v) ? v.map((i: OrderItem) => `${i.quantity}x ${i.name}`).join(', ') : '' },
];

export const KitchenDisplayTool: React.FC<KitchenDisplayToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const {
    data: orders,
    setData: setOrders,
    addItem,
    updateItem,
    deleteItem,
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
  } = useToolData<KitchenOrder>('kitchen-display', [], KITCHEN_COLUMNS);

  const [showAddForm, setShowAddForm] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterStatus, setFilterStatus] = useState<string>('active');

  const [newOrder, setNewOrder] = useState<Partial<KitchenOrder>>({
    orderNumber: '',
    tableNumber: '',
    serverName: '',
    items: [],
    priority: 'normal',
    specialInstructions: '',
    courseNumber: 1,
  });
  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState(1);
  const [newItemMods, setNewItemMods] = useState('');

  const filteredOrders = useMemo(() => {
    if (filterStatus === 'active') {
      return orders.filter((o) => o.status === 'new' || o.status === 'in-progress' || o.status === 'ready');
    }
    if (filterStatus === 'all') return orders;
    return orders.filter((o) => o.status === filterStatus);
  }, [orders, filterStatus]);

  const stats = useMemo(() => {
    const newOrders = orders.filter((o) => o.status === 'new').length;
    const cooking = orders.filter((o) => o.status === 'in-progress').length;
    const ready = orders.filter((o) => o.status === 'ready').length;
    const completed = orders.filter((o) => o.status === 'completed').length;

    const activeOrders = orders.filter((o) => o.status === 'new' || o.status === 'in-progress');
    let avgWaitTime = 0;
    if (activeOrders.length > 0) {
      const totalWait = activeOrders.reduce((sum, o) => {
        const orderTime = new Date(o.orderTime).getTime();
        const now = Date.now();
        return sum + (now - orderTime) / 60000;
      }, 0);
      avgWaitTime = Math.round(totalWait / activeOrders.length);
    }

    return { newOrders, cooking, ready, completed, avgWaitTime };
  }, [orders]);

  const getOrderTime = (orderTime: string) => {
    if (!orderTime) return '';
    const time = new Date(orderTime);
    const now = new Date();
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    return diffMins;
  };

  const getTimeColor = (mins: number) => {
    if (mins < 10) return 'text-green-500';
    if (mins < 20) return 'text-yellow-500';
    return 'text-red-500';
  };

  const handleAddItem = () => {
    if (!newItemName) return;
    const items = newOrder.items || [];
    items.push({
      name: newItemName,
      quantity: newItemQty,
      modifications: newItemMods,
      completed: false,
    });
    setNewOrder({ ...newOrder, items });
    setNewItemName('');
    setNewItemQty(1);
    setNewItemMods('');
  };

  const handleRemoveItem = (index: number) => {
    const items = [...(newOrder.items || [])];
    items.splice(index, 1);
    setNewOrder({ ...newOrder, items });
  };

  const handleAddOrder = () => {
    if (!newOrder.orderNumber || !newOrder.items?.length) return;

    const order: KitchenOrder = {
      id: `order-${Date.now()}`,
      orderNumber: newOrder.orderNumber || '',
      tableNumber: newOrder.tableNumber || '',
      serverName: newOrder.serverName || '',
      items: newOrder.items || [],
      status: 'new',
      priority: newOrder.priority as OrderPriority || 'normal',
      orderTime: new Date().toISOString(),
      startedAt: '',
      completedAt: '',
      specialInstructions: newOrder.specialInstructions || '',
      courseNumber: newOrder.courseNumber || 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addItem(order);
    setNewOrder({
      orderNumber: '',
      tableNumber: '',
      serverName: '',
      items: [],
      priority: 'normal',
      specialInstructions: '',
      courseNumber: 1,
    });
    setShowAddForm(false);
  };

  const handleStartCooking = (id: string) => {
    updateItem(id, {
      status: 'in-progress',
      startedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  };

  const handleMarkReady = (id: string) => {
    updateItem(id, {
      status: 'ready',
      completedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  };

  const handleComplete = (id: string) => {
    updateItem(id, {
      status: 'completed',
      updatedAt: new Date().toISOString(),
    });
  };

  const handleToggleItemComplete = (orderId: string, itemIndex: number) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;
    const items = [...order.items];
    items[itemIndex] = { ...items[itemIndex], completed: !items[itemIndex].completed };
    updateItem(orderId, { items, updatedAt: new Date().toISOString() });
  };

  const handleBumpOrder = (id: string) => {
    const order = orders.find((o) => o.id === id);
    if (!order) return;

    if (order.status === 'new') {
      handleStartCooking(id);
    } else if (order.status === 'in-progress') {
      handleMarkReady(id);
    } else if (order.status === 'ready') {
      handleComplete(id);
    }
  };

  const handleReset = async () => {
    const confirmed = await confirm({
      title: 'Clear Completed Orders',
      message: 'Clear all completed and cancelled orders?',
      confirmText: 'Clear',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      const activeOrders = orders.filter((o) => o.status !== 'completed' && o.status !== 'cancelled');
      setOrders(activeOrders);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#0D9488]" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-[#0D9488]/10 rounded-xl">
                  <ChefHat className="w-6 h-6 text-[#0D9488]" />
                </div>
                <div>
                  <CardTitle className={isDark ? 'text-white' : 'text-gray-900'}>
                    {t('tools.kitchenDisplay.kitchenDisplaySystem', 'Kitchen Display System')}
                  </CardTitle>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.kitchenDisplay.realTimeKitchenOrderManagement', 'Real-time kitchen order management')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <WidgetEmbedButton toolSlug="kitchen-display" toolName="Kitchen Display" />

                <SyncStatus
                  isSynced={isSynced}
                  isSaving={isSaving}
                  lastSaved={lastSaved}
                  syncError={syncError}
                  onForceSync={forceSync}
                  theme={isDark ? 'dark' : 'light'}
                  size="sm"
                />
                <button
                  onClick={() => setShowAddForm(true)}
                  className="px-4 py-2 bg-[#0D9488] text-white rounded-lg flex items-center gap-2 hover:bg-[#0D9488]/90"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.kitchenDisplay.newOrder', 'New Order')}
                </button>
                <ExportDropdown
                  onExportCSV={() => exportCSV({ filename: 'kitchen-orders' })}
                  onExportExcel={() => exportExcel({ filename: 'kitchen-orders' })}
                  onExportJSON={() => exportJSON({ filename: 'kitchen-orders' })}
                  onExportPDF={() => exportPDF({
                    filename: 'kitchen-orders',
                    title: 'Kitchen Orders',
                    subtitle: `${orders.length} orders`,
                  })}
                  onPrint={() => print('Kitchen Orders')}
                  onCopyToClipboard={() => copyToClipboard('tab')}
                  onImportCSV={async (file) => { await importCSV(file); }}
                  onImportJSON={async (file) => { await importJSON(file); }}
                  theme={isDark ? 'dark' : 'light'}
                  disabled={orders.length === 0}
                />
                <button
                  onClick={handleReset}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-red-500 ${
                    isDark ? 'hover:bg-red-900/20' : 'hover:bg-red-50'
                  }`}
                >
                  <RefreshCw className="w-4 h-4" />
                  {t('tools.kitchenDisplay.clearDone', 'Clear Done')}
                </button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className={`p-4 rounded-xl border-l-4 border-red-500 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="text-sm text-red-500">{t('tools.kitchenDisplay.newOrders', 'New Orders')}</div>
            <div className="text-3xl font-bold text-red-600">{stats.newOrders}</div>
          </div>
          <div className={`p-4 rounded-xl border-l-4 border-yellow-500 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="text-sm text-yellow-500">{t('tools.kitchenDisplay.cooking', 'Cooking')}</div>
            <div className="text-3xl font-bold text-yellow-600">{stats.cooking}</div>
          </div>
          <div className={`p-4 rounded-xl border-l-4 border-green-500 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="text-sm text-green-500">{t('tools.kitchenDisplay.ready', 'Ready')}</div>
            <div className="text-3xl font-bold text-green-600">{stats.ready}</div>
          </div>
          <div className={`p-4 rounded-xl border-l-4 border-gray-500 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.kitchenDisplay.completed', 'Completed')}</div>
            <div className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.completed}</div>
          </div>
          <div className={`p-4 rounded-xl border-l-4 border-[#0D9488] ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.kitchenDisplay.avgWait', 'Avg Wait')}</div>
            <div className="text-3xl font-bold text-[#0D9488]">{stats.avgWaitTime}m</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          {['active', 'new', 'in-progress', 'ready', 'completed', 'all'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${
                filterStatus === status
                  ? 'bg-[#0D9488] text-white'
                  : isDark
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {status === 'in-progress' ? 'Cooking' : status}
            </button>
          ))}
        </div>

        {/* Orders Grid */}
        {filteredOrders.length === 0 ? (
          <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
            <CardContent className="py-12">
              <div className={`text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <ChefHat className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>{t('tools.kitchenDisplay.noOrdersToDisplay', 'No orders to display')}</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredOrders
              .sort((a, b) => {
                const priorityOrder = { vip: 0, rush: 1, normal: 2 };
                if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
                  return priorityOrder[a.priority] - priorityOrder[b.priority];
                }
                return new Date(a.orderTime).getTime() - new Date(b.orderTime).getTime();
              })
              .map((order) => {
                const statusConfig = STATUS_CONFIG[order.status];
                const priorityConfig = PRIORITY_CONFIG[order.priority];
                const waitTime = getOrderTime(order.orderTime);
                const PriorityIcon = priorityConfig.icon;

                return (
                  <div
                    key={order.id}
                    onClick={() => handleBumpOrder(order.id)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all hover:scale-[1.02] ${statusConfig.borderColor} ${
                      isDark ? 'bg-gray-800' : 'bg-white'
                    } ${order.priority === 'rush' ? 'animate-pulse' : ''}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          #{order.orderNumber}
                        </span>
                        {order.priority !== 'normal' && (
                          <span className={`px-2 py-1 rounded text-xs font-bold ${priorityConfig.color} ${
                            order.priority === 'rush' ? 'bg-orange-100 dark:bg-orange-900/30' : 'bg-purple-100 dark:bg-purple-900/30'
                          }`}>
                            {PriorityIcon && <PriorityIcon className="w-3 h-3 inline mr-1" />}
                            {priorityConfig.label}
                          </span>
                        )}
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color} ${statusConfig.bgColor}`}>
                        {statusConfig.label}
                      </span>
                    </div>

                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-3`}>
                      <div className="flex justify-between">
                        <span>Table {order.tableNumber || 'N/A'}</span>
                        <span>{order.serverName}</span>
                      </div>
                      {order.courseNumber > 1 && (
                        <div className="text-[#0D9488]">Course {order.courseNumber}</div>
                      )}
                    </div>

                    <div className="space-y-2 mb-3">
                      {order.items.map((item, idx) => (
                        <div
                          key={idx}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleItemComplete(order.id, idx);
                          }}
                          className={`flex items-start gap-2 p-2 rounded ${
                            item.completed
                              ? 'bg-green-100 dark:bg-green-900/20 line-through opacity-50'
                              : isDark ? 'bg-gray-700' : 'bg-gray-100'
                          }`}
                        >
                          <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {item.quantity}x
                          </span>
                          <div className="flex-1">
                            <div className={isDark ? 'text-white' : 'text-gray-900'}>{item.name}</div>
                            {item.modifications && (
                              <div className="text-xs text-orange-500">{item.modifications}</div>
                            )}
                          </div>
                          {item.completed && <Check className="w-4 h-4 text-green-500" />}
                        </div>
                      ))}
                    </div>

                    {order.specialInstructions && (
                      <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded text-sm text-yellow-700 dark:text-yellow-400 mb-3">
                        <AlertTriangle className="w-3 h-3 inline mr-1" />
                        {order.specialInstructions}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div className={`flex items-center gap-1 ${getTimeColor(waitTime)}`}>
                        <Clock className="w-4 h-4" />
                        <span className="font-medium">{waitTime}m</span>
                      </div>
                      <div className="flex gap-1">
                        {order.status === 'new' && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleStartCooking(order.id); }}
                            className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-medium hover:bg-yellow-200"
                          >
                            <Flame className="w-3 h-3 inline mr-1" />
                            {t('tools.kitchenDisplay.start', 'Start')}
                          </button>
                        )}
                        {order.status === 'in-progress' && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleMarkReady(order.id); }}
                            className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium hover:bg-green-200"
                          >
                            <Bell className="w-3 h-3 inline mr-1" />
                            {t('tools.kitchenDisplay.ready2', 'Ready')}
                          </button>
                        )}
                        {order.status === 'ready' && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleComplete(order.id); }}
                            className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium hover:bg-gray-200"
                          >
                            <Check className="w-3 h-3 inline mr-1" />
                            {t('tools.kitchenDisplay.done', 'Done')}
                          </button>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteItem(order.id); }}
                          className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}

        {/* Add Order Modal */}
        {showAddForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <Card className={`w-full max-w-lg max-h-[90vh] overflow-y-auto ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className={isDark ? 'text-white' : 'text-gray-900'}>
                    {t('tools.kitchenDisplay.newKitchenOrder', 'New Kitchen Order')}
                  </CardTitle>
                  <button onClick={() => setShowAddForm(false)}>
                    <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.kitchenDisplay.order', 'Order # *')}
                    </label>
                    <input
                      type="text"
                      value={newOrder.orderNumber}
                      onChange={(e) => setNewOrder({ ...newOrder, orderNumber: e.target.value })}
                      placeholder="e.g., 101"
                      className={`w-full px-4 py-2 border ${
                        isDark
                          ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400'
                          : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'
                      } rounded-lg`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.kitchenDisplay.table', 'Table #')}
                    </label>
                    <input
                      type="text"
                      value={newOrder.tableNumber}
                      onChange={(e) => setNewOrder({ ...newOrder, tableNumber: e.target.value })}
                      placeholder="e.g., T5"
                      className={`w-full px-4 py-2 border ${
                        isDark
                          ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400'
                          : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'
                      } rounded-lg`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.kitchenDisplay.server', 'Server')}
                    </label>
                    <input
                      type="text"
                      value={newOrder.serverName}
                      onChange={(e) => setNewOrder({ ...newOrder, serverName: e.target.value })}
                      placeholder={t('tools.kitchenDisplay.serverName', 'Server name')}
                      className={`w-full px-4 py-2 border ${
                        isDark
                          ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400'
                          : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'
                      } rounded-lg`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.kitchenDisplay.priority', 'Priority')}
                    </label>
                    <select
                      value={newOrder.priority}
                      onChange={(e) => setNewOrder({ ...newOrder, priority: e.target.value as OrderPriority })}
                      className={`w-full px-4 py-2 border ${
                        isDark
                          ? 'border-gray-600 bg-gray-700 text-white'
                          : 'border-gray-200 bg-white text-gray-900'
                      } rounded-lg`}
                    >
                      <option value="normal">{t('tools.kitchenDisplay.normal', 'Normal')}</option>
                      <option value="rush">{t('tools.kitchenDisplay.rush', 'Rush')}</option>
                      <option value="vip">{t('tools.kitchenDisplay.vip', 'VIP')}</option>
                    </select>
                  </div>
                </div>

                {/* Add Items */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.kitchenDisplay.items', 'Items *')}
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="number"
                      value={newItemQty}
                      onChange={(e) => setNewItemQty(parseInt(e.target.value) || 1)}
                      min="1"
                      className={`w-16 px-2 py-2 border ${
                        isDark
                          ? 'border-gray-600 bg-gray-700 text-white'
                          : 'border-gray-200 bg-white text-gray-900'
                      } rounded-lg text-center`}
                    />
                    <input
                      type="text"
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      placeholder={t('tools.kitchenDisplay.itemName', 'Item name')}
                      className={`flex-1 px-4 py-2 border ${
                        isDark
                          ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400'
                          : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'
                      } rounded-lg`}
                    />
                    <button
                      onClick={handleAddItem}
                      disabled={!newItemName}
                      className="px-4 py-2 bg-[#0D9488] text-white rounded-lg disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={newItemMods}
                    onChange={(e) => setNewItemMods(e.target.value)}
                    placeholder={t('tools.kitchenDisplay.modificationsOptional', 'Modifications (optional)')}
                    className={`w-full px-4 py-2 border ${
                      isDark
                        ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400'
                        : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'
                    } rounded-lg text-sm`}
                  />

                  {/* Items list */}
                  {newOrder.items && newOrder.items.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {newOrder.items.map((item, idx) => (
                        <div
                          key={idx}
                          className={`flex items-center justify-between p-2 rounded ${
                            isDark ? 'bg-gray-700' : 'bg-gray-100'
                          }`}
                        >
                          <div>
                            <span className="font-medium">{item.quantity}x {item.name}</span>
                            {item.modifications && (
                              <span className="text-xs text-orange-500 ml-2">({item.modifications})</span>
                            )}
                          </div>
                          <button
                            onClick={() => handleRemoveItem(idx)}
                            className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 p-1 rounded"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.kitchenDisplay.specialInstructions', 'Special Instructions')}
                  </label>
                  <textarea
                    value={newOrder.specialInstructions}
                    onChange={(e) => setNewOrder({ ...newOrder, specialInstructions: e.target.value })}
                    placeholder={t('tools.kitchenDisplay.allergiesPreferencesEtc', 'Allergies, preferences, etc.')}
                    rows={2}
                    className={`w-full px-4 py-2 border ${
                      isDark
                        ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400'
                        : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'
                    } rounded-lg resize-none`}
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleAddOrder}
                    disabled={!newOrder.orderNumber || !newOrder.items?.length}
                    className="flex-1 py-3 px-6 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] text-white font-medium rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <ClipboardList className="w-5 h-5" />
                    {t('tools.kitchenDisplay.sendToKitchen', 'Send to Kitchen')}
                  </button>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className={`px-6 py-3 rounded-xl font-medium ${
                      isDark
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {t('tools.kitchenDisplay.cancel', 'Cancel')}
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        <ConfirmDialog />
      </div>
    </div>
  );
};

export default KitchenDisplayTool;
