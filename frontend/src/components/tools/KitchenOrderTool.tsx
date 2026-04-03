'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
  ChefHat,
  Clock,
  AlertTriangle,
  CheckCircle,
  Play,
  Pause,
  Bell,
  Flame,
  Salad,
  IceCream,
  Utensils,
  Users,
  Timer,
  Volume2,
  VolumeX,
  Plus,
  Trash2,
  ArrowRight,
  BarChart3,
  RefreshCw,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import type { ColumnConfig } from '../../lib/toolDataUtils';

// Column configuration for export functionality
const ORDER_EXPORT_COLUMNS: ColumnConfig[] = [
  { key: 'id', header: 'Order ID', type: 'string' },
  { key: 'tableNumber', header: 'Table Number', type: 'number' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'priority', header: 'Priority', type: 'string' },
  { key: 'course', header: 'Course', type: 'number' },
  { key: 'items', header: 'Items', type: 'string', format: (items: OrderItem[]) => items.map(i => `${i.quantity}x ${i.name}`).join('; ') },
  { key: 'allergies', header: 'Allergies', type: 'string', format: (allergies: string[]) => allergies.join(', ') || 'None' },
  { key: 'receivedAt', header: 'Received At', type: 'date' },
  { key: 'startedAt', header: 'Started At', type: 'date' },
  { key: 'completedAt', header: 'Completed At', type: 'date' },
  { key: 'assignedStation', header: 'Assigned Station', type: 'string' },
  { key: 'holdForCourse', header: 'Hold For Course', type: 'boolean' },
];

interface KitchenOrderToolProps {
  uiConfig?: UIConfig;
}

// Types
type OrderStatus = 'new' | 'in-progress' | 'ready' | 'served';
type Priority = 'normal' | 'high' | 'rush';
type Station = 'grill' | 'fryer' | 'salad' | 'dessert';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  modifications: string[];
  station: Station;
}

interface Order {
  id: string;
  tableNumber: number;
  items: OrderItem[];
  allergies: string[];
  status: OrderStatus;
  priority: Priority;
  course: number;
  holdForCourse: boolean;
  receivedAt: string; // ISO string for serialization
  startedAt?: string;
  completedAt?: string;
  assignedStation?: Station;
}

interface CompletedOrderStats {
  orderId: string;
  prepTime: number; // in seconds
  completedAt: string; // ISO string for serialization
}

// Sample data generator
const generateSampleOrder = (id: number): Order => {
  const items: OrderItem[] = [];
  const stations: Station[] = ['grill', 'fryer', 'salad', 'dessert'];
  const menuItems = {
    grill: ['Ribeye Steak', 'Grilled Chicken', 'Burger', 'Salmon Fillet'],
    fryer: ['French Fries', 'Onion Rings', 'Fried Calamari', 'Chicken Wings'],
    salad: ['Caesar Salad', 'Garden Salad', 'Greek Salad', 'Coleslaw'],
    dessert: ['Chocolate Cake', 'Ice Cream', 'Cheesecake', 'Tiramisu'],
  };
  const modifications = ['No onions', 'Extra sauce', 'Well done', 'Gluten-free bun', 'No cheese', 'Extra crispy'];
  const allergies = ['Peanuts', 'Gluten', 'Dairy', 'Shellfish', 'Eggs', 'Soy'];

  const numItems = Math.floor(Math.random() * 3) + 1;
  for (let i = 0; i < numItems; i++) {
    const station = stations[Math.floor(Math.random() * stations.length)];
    const stationItems = menuItems[station];
    items.push({
      id: `item-${id}-${i}`,
      name: stationItems[Math.floor(Math.random() * stationItems.length)],
      quantity: Math.floor(Math.random() * 3) + 1,
      modifications: Math.random() > 0.5 ? [modifications[Math.floor(Math.random() * modifications.length)]] : [],
      station,
    });
  }

  const priorities: Priority[] = ['normal', 'normal', 'normal', 'high', 'rush'];
  const hasAllergy = Math.random() > 0.7;

  return {
    id: `ORD-${String(id).padStart(4, '0')}`,
    tableNumber: Math.floor(Math.random() * 20) + 1,
    items,
    allergies: hasAllergy ? [allergies[Math.floor(Math.random() * allergies.length)]] : [],
    status: 'new',
    priority: priorities[Math.floor(Math.random() * priorities.length)],
    course: Math.floor(Math.random() * 3) + 1,
    holdForCourse: Math.random() > 0.8,
    receivedAt: new Date(Date.now() - Math.floor(Math.random() * 600000)).toISOString(), // Within last 10 minutes
  };
};

export const KitchenOrderTool = ({ uiConfig }: KitchenOrderToolProps) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  // Use the useToolData hook for backend persistence
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
    copyToClipboard,
    print,
    isLoading,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<Order>('kitchen-order', [], ORDER_EXPORT_COLUMNS);

  const [completedStats, setCompletedStats] = useState<CompletedOrderStats[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedStation, setSelectedStation] = useState<Station | 'all'>('all');
  const [showStats, setShowStats] = useState(false);
  const [newOrderAlert, setNewOrderAlert] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const orderCounterRef = useRef(1);

  // Initialize with sample orders only if no data loaded from backend
  useEffect(() => {
    if (!isLoading && !initialized) {
      if (orders.length === 0) {
        // No orders from backend, generate sample orders
        const initialOrders: Order[] = [];
        for (let i = 0; i < 5; i++) {
          initialOrders.push(generateSampleOrder(orderCounterRef.current++));
        }
        setOrders(initialOrders);
      } else {
        // Update order counter based on existing orders
        const maxId = orders.reduce((max, order) => {
          const num = parseInt(order.id.replace('ORD-', '')) || 0;
          return Math.max(max, num);
        }, 0);
        orderCounterRef.current = maxId + 1;
      }
      setInitialized(true);
    }
  }, [isLoading, initialized, orders.length, setOrders]);

  // Audio setup
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSx+zPPTgjMGHm7A7+OZSA0PVKno77BdGAg+l9z0xnMpBSh5yPDajzwIDly47+mjUBELTKXk8LdmHwU2jtLzzHwvByd3xvDglEQKElyx6OypVxMLTKjm871rJAU5kdLy0H0xByJ0w/DglkUKE2Cy6vGpVxINS6ro9L1sJQU5ktPy0n4yByN1xPDhmEcLEl+y6/KqWhQMTqzo9L1tJgU6ktT00H4xByN0w/DglkUKEV6x6O6oVRMNTavm9L1sJQU5kdLyz30yByJ0w/DglUUJEV6w6e6oVRMNTavm9L1rJQU5kdLyz30yByJ0w/DglUUJEV6w6e6oVRMNTavm9L1rJQU5kdLyz30yByJ0w/DglUUJEV6w6e6oVRMNTavm9L1rJQU5kdLyz30yByJ0w/DglUUJEV6w6e6oVRMNTavm9L1rJQU5kdLyz30yByJ0w/DglUUJEV6w6e6oVRMNTavm9L1rJQU5kdLyz30yByJ0w/DglUUJEV6w6e6oVRMNTavm9L1rJQU5kdLyz30y';

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.content || params.title || params.description) {
        // For kitchen order tool, prefill just shows the indicator
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Simulate new orders arriving
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        addNewOrder();
      }
    }, 15000); // Check every 15 seconds

    return () => clearInterval(interval);
  }, [soundEnabled]);

  // Update time display every second
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const playNewOrderSound = () => {
    if (soundEnabled && audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
    setNewOrderAlert(true);
    setTimeout(() => setNewOrderAlert(false), 3000);
  };

  const addNewOrder = () => {
    const newOrder = generateSampleOrder(orderCounterRef.current++);
    addItem(newOrder);
    playNewOrderSound();
  };

  const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const updates: Partial<Order> = { status: newStatus };
    if (newStatus === 'in-progress' && !order.startedAt) {
      updates.startedAt = new Date().toISOString();
    }
    if (newStatus === 'ready' && !order.completedAt) {
      updates.completedAt = new Date().toISOString();
      // Add to stats
      if (order.startedAt) {
        const prepTime = Math.floor((new Date().getTime() - new Date(order.startedAt).getTime()) / 1000);
        setCompletedStats(prev => [
          ...prev,
          { orderId: order.id, prepTime, completedAt: new Date().toISOString() },
        ]);
      }
    }
    updateItem(orderId, updates);
  };

  const removeOrder = (orderId: string) => {
    deleteItem(orderId);
  };

  const assignStation = (orderId: string, station: Station) => {
    updateItem(orderId, { assignedStation: station });
  };

  const getWaitTime = (order: Order): number => {
    const now = new Date();
    return Math.floor((now.getTime() - new Date(order.receivedAt).getTime()) / 1000);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getUrgencyColor = (order: Order): string => {
    if (order.status === 'ready' || order.status === 'served') return 'green';
    const waitTime = getWaitTime(order);
    if (order.priority === 'rush' || waitTime > 900) return 'red'; // 15+ minutes
    if (order.priority === 'high' || waitTime > 600) return 'yellow'; // 10+ minutes
    return 'green';
  };

  const getUrgencyStyles = (urgency: string) => {
    switch (urgency) {
      case 'red':
        return {
          border: 'border-red-500',
          bg: theme === 'dark' ? 'bg-red-900/30' : 'bg-red-50',
          pulse: 'animate-pulse',
        };
      case 'yellow':
        return {
          border: 'border-yellow-500',
          bg: theme === 'dark' ? 'bg-yellow-900/30' : 'bg-yellow-50',
          pulse: '',
        };
      default:
        return {
          border: 'border-green-500',
          bg: theme === 'dark' ? 'bg-green-900/30' : 'bg-green-50',
          pulse: '',
        };
    }
  };

  const getStationIcon = (station: Station) => {
    switch (station) {
      case 'grill':
        return <Flame className="w-4 h-4" />;
      case 'fryer':
        return <Utensils className="w-4 h-4" />;
      case 'salad':
        return <Salad className="w-4 h-4" />;
      case 'dessert':
        return <IceCream className="w-4 h-4" />;
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'new':
        return <Bell className="w-4 h-4" />;
      case 'in-progress':
        return <Play className="w-4 h-4" />;
      case 'ready':
        return <CheckCircle className="w-4 h-4" />;
      case 'served':
        return <Users className="w-4 h-4" />;
    }
  };

  const filteredOrders = useMemo(() => {
    let filtered = orders;
    if (selectedStation !== 'all') {
      filtered = orders.filter(
        order =>
          order.assignedStation === selectedStation ||
          order.items.some(item => item.station === selectedStation)
      );
    }
    // Sort by priority and wait time
    return filtered.sort((a, b) => {
      const priorityOrder = { rush: 0, high: 1, normal: 2 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return new Date(a.receivedAt).getTime() - new Date(b.receivedAt).getTime();
    });
  }, [orders, selectedStation]);

  const ordersByStatus = useMemo(() => {
    return {
      new: filteredOrders.filter(o => o.status === 'new'),
      'in-progress': filteredOrders.filter(o => o.status === 'in-progress'),
      ready: filteredOrders.filter(o => o.status === 'ready'),
      served: filteredOrders.filter(o => o.status === 'served'),
    };
  }, [filteredOrders]);

  const averagePrepTime = useMemo(() => {
    if (completedStats.length === 0) return 0;
    const total = completedStats.reduce((sum, stat) => sum + stat.prepTime, 0);
    return Math.floor(total / completedStats.length);
  }, [completedStats]);

  const stations: Station[] = ['grill', 'fryer', 'salad', 'dessert'];

  // Loading state
  if (isLoading) {
    return (
      <div className={`max-w-7xl mx-auto p-4 md:p-6 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'} min-h-screen flex items-center justify-center`}>
        <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
      </div>
    );
  }

  return (
    <div className={`max-w-7xl mx-auto p-4 md:p-6 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'} min-h-screen`}>
      {/* Prefill Indicator */}
      {isPrefilled && (
        <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
          <Sparkles className="w-4 h-4 text-[#0D9488]" />
          <span className="text-sm text-[#0D9488] font-medium">{t('tools.kitchenOrder.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-lg ${newOrderAlert ? 'animate-bounce bg-red-500' : 'bg-teal-600'}`}>
            <ChefHat className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.kitchenOrder.kitchenOrderDisplay', 'Kitchen Order Display')}
            </h1>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {orders.length} active orders
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-lg transition-colors ${
              theme === 'dark'
                ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                : 'bg-white hover:bg-gray-100 text-gray-700'
            }`}
            title={soundEnabled ? t('tools.kitchenOrder.muteAlerts', 'Mute alerts') : t('tools.kitchenOrder.enableAlerts', 'Enable alerts')}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          {/* Stats Toggle */}
          <button
            onClick={() => setShowStats(!showStats)}
            className={`p-2 rounded-lg transition-colors ${
              showStats
                ? 'bg-teal-600 text-white'
                : theme === 'dark'
                ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                : 'bg-white hover:bg-gray-100 text-gray-700'
            }`}
            title={t('tools.kitchenOrder.viewStatistics', 'View statistics')}
          >
            <BarChart3 className="w-5 h-5" />
          </button>

          {/* Sync Status */}
          <WidgetEmbedButton toolSlug="kitchen-order" toolName="Kitchen Order" />

          <SyncStatus
            isSynced={isSynced}
            isSaving={isSaving}
            lastSaved={lastSaved}
            syncError={syncError}
            onForceSync={forceSync}
            theme={theme as 'light' | 'dark'}
            size="sm"
          />

          {/* Export Dropdown */}
          <ExportDropdown
            onExportCSV={() => exportCSV({ filename: 'kitchen-orders' })}
            onExportExcel={() => exportExcel({ filename: 'kitchen-orders' })}
            onExportJSON={() => exportJSON({ filename: 'kitchen-orders' })}
            onExportPDF={() => exportPDF({ filename: 'kitchen-orders', title: 'Kitchen Orders Report' })}
            onPrint={() => print('Kitchen Orders Report')}
            onCopyToClipboard={() => copyToClipboard('tab')}
            showImport={false}
            theme={theme as 'light' | 'dark'}
          />

          {/* Add Order Button */}
          <button
            onClick={addNewOrder}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">{t('tools.kitchenOrder.newOrder', 'New Order')}</span>
          </button>
        </div>
      </div>

      {/* Station Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setSelectedStation('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedStation === 'all'
              ? 'bg-teal-600 text-white'
              : theme === 'dark'
              ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          {t('tools.kitchenOrder.allStations', 'All Stations')}
        </button>
        {stations.map(station => (
          <button
            key={station}
            onClick={() => setSelectedStation(station)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
              selectedStation === station
                ? 'bg-teal-600 text-white'
                : theme === 'dark'
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {getStationIcon(station)}
            {station}
          </button>
        ))}
      </div>

      {/* Stats Panel */}
      {showStats && (
        <Card className={`mb-6 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <CardHeader className="pb-2">
            <CardTitle className={`text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.kitchenOrder.orderStatistics', 'Order Statistics')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.kitchenOrder.averagePrepTime', 'Average Prep Time')}
                </p>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {formatTime(averagePrepTime)}
                </p>
              </div>
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.kitchenOrder.ordersCompleted', 'Orders Completed')}
                </p>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {completedStats.length}
                </p>
              </div>
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.kitchenOrder.inProgress', 'In Progress')}
                </p>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {ordersByStatus['in-progress'].length}
                </p>
              </div>
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.kitchenOrder.rushOrders', 'Rush Orders')}
                </p>
                <p className={`text-2xl font-bold text-red-500`}>
                  {orders.filter(o => o.priority === 'rush').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Order Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* New Orders */}
        <div>
          <div className={`flex items-center gap-2 mb-3 px-2`}>
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <h2 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              New ({ordersByStatus.new.length})
            </h2>
          </div>
          <div className="space-y-3">
            {ordersByStatus.new.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                theme={theme}
                getWaitTime={getWaitTime}
                formatTime={formatTime}
                getUrgencyColor={getUrgencyColor}
                getUrgencyStyles={getUrgencyStyles}
                getStationIcon={getStationIcon}
                getStatusIcon={getStatusIcon}
                updateOrderStatus={updateOrderStatus}
                removeOrder={removeOrder}
                assignStation={assignStation}
                stations={stations}
              />
            ))}
          </div>
        </div>

        {/* In Progress */}
        <div>
          <div className={`flex items-center gap-2 mb-3 px-2`}>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <h2 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              In Progress ({ordersByStatus['in-progress'].length})
            </h2>
          </div>
          <div className="space-y-3">
            {ordersByStatus['in-progress'].map(order => (
              <OrderCard
                key={order.id}
                order={order}
                theme={theme}
                getWaitTime={getWaitTime}
                formatTime={formatTime}
                getUrgencyColor={getUrgencyColor}
                getUrgencyStyles={getUrgencyStyles}
                getStationIcon={getStationIcon}
                getStatusIcon={getStatusIcon}
                updateOrderStatus={updateOrderStatus}
                removeOrder={removeOrder}
                assignStation={assignStation}
                stations={stations}
              />
            ))}
          </div>
        </div>

        {/* Ready */}
        <div>
          <div className={`flex items-center gap-2 mb-3 px-2`}>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <h2 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Ready ({ordersByStatus.ready.length})
            </h2>
          </div>
          <div className="space-y-3">
            {ordersByStatus.ready.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                theme={theme}
                getWaitTime={getWaitTime}
                formatTime={formatTime}
                getUrgencyColor={getUrgencyColor}
                getUrgencyStyles={getUrgencyStyles}
                getStationIcon={getStationIcon}
                getStatusIcon={getStatusIcon}
                updateOrderStatus={updateOrderStatus}
                removeOrder={removeOrder}
                assignStation={assignStation}
                stations={stations}
              />
            ))}
          </div>
        </div>

        {/* Served */}
        <div>
          <div className={`flex items-center gap-2 mb-3 px-2`}>
            <div className="w-3 h-3 rounded-full bg-gray-500"></div>
            <h2 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Served ({ordersByStatus.served.length})
            </h2>
          </div>
          <div className="space-y-3">
            {ordersByStatus.served.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                theme={theme}
                getWaitTime={getWaitTime}
                formatTime={formatTime}
                getUrgencyColor={getUrgencyColor}
                getUrgencyStyles={getUrgencyStyles}
                getStationIcon={getStationIcon}
                getStatusIcon={getStatusIcon}
                updateOrderStatus={updateOrderStatus}
                removeOrder={removeOrder}
                assignStation={assignStation}
                stations={stations}
              />
            ))}
          </div>
        </div>
      </div>

      {/* New Order Alert Overlay */}
      {newOrderAlert && (
        <div className="fixed top-4 right-4 z-50 animate-bounce">
          <div className="bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
            <Bell className="w-5 h-5" />
            <span className="font-semibold">{t('tools.kitchenOrder.newOrder2', 'New Order!')}</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Order Card Component
interface OrderCardProps {
  order: Order;
  theme: string;
  getWaitTime: (order: Order) => number;
  formatTime: (seconds: number) => string;
  getUrgencyColor: (order: Order) => string;
  getUrgencyStyles: (urgency: string) => { border: string; bg: string; pulse: string };
  getStationIcon: (station: Station) => JSX.Element;
  getStatusIcon: (status: OrderStatus) => JSX.Element;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  removeOrder: (orderId: string) => void;
  assignStation: (orderId: string, station: Station) => void;
  stations: Station[];
}

const OrderCard = ({
  order,
  theme,
  getWaitTime,
  formatTime,
  getUrgencyColor,
  getUrgencyStyles,
  getStationIcon,
  getStatusIcon,
  updateOrderStatus,
  removeOrder,
  assignStation,
  stations,
}: OrderCardProps) => {
  const urgency = getUrgencyColor(order);
  const styles = getUrgencyStyles(urgency);
  const waitTime = getWaitTime(order);

  const getNextStatus = (current: OrderStatus): OrderStatus | null => {
    switch (current) {
      case 'new':
        return 'in-progress';
      case 'in-progress':
        return 'ready';
      case 'ready':
        return 'served';
      default:
        return null;
    }
  };

  const nextStatus = getNextStatus(order.status);

  return (
    <div
      className={`rounded-lg border-2 ${styles.border} ${styles.bg} ${styles.pulse} p-4 transition-all`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {order.id}
          </span>
          {order.priority === 'rush' && (
            <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded animate-pulse">
              {t('tools.kitchenOrder.rush', 'RUSH')}
            </span>
          )}
          {order.priority === 'high' && (
            <span className="px-2 py-0.5 bg-orange-500 text-white text-xs font-bold rounded">
              {t('tools.kitchenOrder.high', 'HIGH')}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Users className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
          <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            T{order.tableNumber}
          </span>
        </div>
      </div>

      {/* Time Info */}
      <div className="flex items-center gap-4 mb-3 text-sm">
        <div className="flex items-center gap-1">
          <Clock className={`w-4 h-4 ${urgency === 'red' ? 'text-red-500' : urgency === 'yellow' ? 'text-yellow-500' : 'text-green-500'}`} />
          <span className={`font-mono ${urgency === 'red' ? 'text-red-500 font-bold' : urgency === 'yellow' ? 'text-yellow-500' : theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            {formatTime(waitTime)}
          </span>
        </div>
        {order.startedAt && (
          <div className="flex items-center gap-1">
            <Timer className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
            <span className={`font-mono ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {formatTime(Math.floor((new Date().getTime() - new Date(order.startedAt).getTime()) / 1000))}
            </span>
          </div>
        )}
      </div>

      {/* Course Info */}
      {order.holdForCourse && (
        <div className={`flex items-center gap-1 mb-3 px-2 py-1 rounded text-sm ${
          theme === 'dark' ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-700'
        }`}>
          <Pause className="w-4 h-4" />
          <span>Hold for Course {order.course}</span>
        </div>
      )}

      {/* Allergies Warning */}
      {order.allergies.length > 0 && (
        <div className="flex items-center gap-2 mb-3 px-2 py-1 bg-red-100 dark:bg-red-900/50 rounded">
          <AlertTriangle className="w-4 h-4 text-red-500" />
          <span className="text-red-700 dark:text-red-300 text-sm font-semibold">
            ALLERGY: {order.allergies.join(', ')}
          </span>
        </div>
      )}

      {/* Items */}
      <div className="space-y-2 mb-3">
        {order.items.map(item => (
          <div key={item.id} className={`text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
            <div className="flex items-center gap-2">
              <span className={`px-1.5 py-0.5 rounded text-xs ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
              }`}>
                {item.quantity}x
              </span>
              <span className="font-medium">{item.name}</span>
              <span className={`ml-auto ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                {getStationIcon(item.station)}
              </span>
            </div>
            {item.modifications.length > 0 && (
              <div className={`ml-8 text-xs italic ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`}>
                {item.modifications.join(', ')}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Station Assignment */}
      {order.status === 'new' && (
        <div className="mb-3">
          <p className={`text-xs mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            {t('tools.kitchenOrder.assignToStation', 'Assign to station:')}
          </p>
          <div className="flex flex-wrap gap-1">
            {stations.map(station => (
              <button
                key={station}
                onClick={() => assignStation(order.id, station)}
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs capitalize transition-colors ${
                  order.assignedStation === station
                    ? 'bg-teal-600 text-white'
                    : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {getStationIcon(station)}
                {station}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        {nextStatus && (
          <button
            onClick={() => updateOrderStatus(order.id, nextStatus)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            {getStatusIcon(nextStatus)}
            <span className="capitalize">{nextStatus.replace('-', ' ')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
        {order.status === 'served' && (
          <button
            onClick={() => removeOrder(order.id)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            {t('tools.kitchenOrder.clear', 'Clear')}
          </button>
        )}
        {order.status !== 'served' && (
          <button
            onClick={() => {
              if (order.status === 'new') {
                updateOrderStatus(order.id, 'new');
              }
            }}
            className={`p-2 rounded-lg transition-colors ${
              theme === 'dark'
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
            title={t('tools.kitchenOrder.refresh', 'Refresh')}
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default KitchenOrderTool;
