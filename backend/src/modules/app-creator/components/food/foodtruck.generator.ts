/**
 * Food Truck Component Generators
 *
 * Generates food truck-specific components:
 * - FoodtruckStats: Dashboard stats for food truck operations
 * - ScheduleCalendarFoodtruck: Location schedule calendar
 * - OrderQueueFoodtruck: Live order queue for food truck
 */

export interface FoodtruckOptions {
  componentName?: string;
  endpoint?: string;
}

/**
 * Generate food truck stats dashboard component
 */
export function generateFoodtruckStats(options: FoodtruckOptions = {}): string {
  const { componentName = 'FoodtruckStats', endpoint = '/foodtruck/stats' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, TrendingUp, TrendingDown, MapPin, ShoppingBag, DollarSign, Users, Clock, Utensils } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface ${componentName}Props {
  className?: string;
}

const statsConfig = [
  { key: 'todaySales', label: "Today's Sales", icon: 'DollarSign', color: 'green', type: 'currency' },
  { key: 'ordersCompleted', label: 'Orders Completed', icon: 'ShoppingBag', color: 'blue', type: 'number' },
  { key: 'ordersInQueue', label: 'Orders in Queue', icon: 'Clock', color: 'yellow', type: 'number' },
  { key: 'avgWaitTime', label: 'Avg Wait Time', icon: 'Clock', color: 'purple', type: 'minutes' },
  { key: 'customersServed', label: 'Customers Served', icon: 'Users', color: 'orange', type: 'number' },
  { key: 'currentLocation', label: 'Current Stop', icon: 'MapPin', color: 'red', type: 'text' },
];

const colorClasses: Record<string, { bg: string; icon: string }> = {
  blue: { bg: 'bg-blue-100 dark:bg-blue-900/30', icon: 'text-blue-600 dark:text-blue-400' },
  green: { bg: 'bg-green-100 dark:bg-green-900/30', icon: 'text-green-600 dark:text-green-400' },
  yellow: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', icon: 'text-yellow-600 dark:text-yellow-400' },
  red: { bg: 'bg-red-100 dark:bg-red-900/30', icon: 'text-red-600 dark:text-red-400' },
  purple: { bg: 'bg-purple-100 dark:bg-purple-900/30', icon: 'text-purple-600 dark:text-purple-400' },
  orange: { bg: 'bg-orange-100 dark:bg-orange-900/30', icon: 'text-orange-600 dark:text-orange-400' },
};

const iconMap: Record<string, React.FC<any>> = {
  DollarSign,
  ShoppingBag,
  Clock,
  Users,
  MapPin,
  Utensils,
};

const ${componentName}: React.FC<${componentName}Props> = ({ className }) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['foodtruck-stats'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${endpoint}');
        return response?.data || response || {};
      } catch (err) {
        console.error('Failed to fetch food truck stats:', err);
        return {};
      }
    },
    refetchInterval: 30000,
  });

  const formatValue = (value: any, type: string) => {
    if (value === undefined || value === null) return '-';
    if (type === 'currency') return '$' + Number(value).toLocaleString();
    if (type === 'percentage') return value + '%';
    if (type === 'minutes') return value + ' min';
    if (type === 'text') return value || '-';
    return Number(value).toLocaleString();
  };

  if (isLoading) {
    return (
      <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6', className)}>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse">
            <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4" />
            <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Food Truck Dashboard</h2>
        <div className="flex items-center gap-3">
          {stats?.isOpen ? (
            <span className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Open for Business
            </span>
          ) : (
            <span className="flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
              <span className="w-2 h-2 bg-gray-400 rounded-full" />
              Closed
            </span>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statsConfig.map((stat) => {
          const Icon = iconMap[stat.icon] || Loader2;
          const colors = colorClasses[stat.color] || colorClasses.blue;
          const value = stats?.[stat.key];
          const change = stats?.[stat.key + 'Change'];

          return (
            <div
              key={stat.key}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={cn('p-3 rounded-lg', colors.bg)}>
                  <Icon className={cn('w-6 h-6', colors.icon)} />
                </div>
                {change !== undefined && stat.type !== 'text' && (
                  <div className={cn(
                    'flex items-center gap-1 text-sm font-medium',
                    change >= 0 ? 'text-green-600' : 'text-red-600'
                  )}>
                    {change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {Math.abs(change)}%
                  </div>
                )}
              </div>
              <div className={cn(
                'font-bold text-gray-900 dark:text-white mb-1',
                stat.type === 'text' ? 'text-xl' : 'text-3xl'
              )}>
                {formatValue(value, stat.type)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {stat.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

/**
 * Generate food truck schedule calendar component
 */
export function generateScheduleCalendarFoodtruck(options: FoodtruckOptions = {}): string {
  const { componentName = 'ScheduleCalendarFoodtruck', endpoint = '/foodtruck/schedule' } = options;

  return `import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Plus, MapPin, Clock, Loader2, X, Edit, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface ${componentName}Props {
  className?: string;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const ${componentName}: React.FC<${componentName}Props> = ({ className }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedStop, setSelectedStop] = useState<any | null>(null);
  const [view, setView] = useState<'month' | 'week'>('week');

  const { data: schedule = [], isLoading } = useQuery({
    queryKey: ['foodtruck-schedule'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${endpoint}');
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch schedule:', err);
        return [];
      }
    },
  });

  const deleteStop = useMutation({
    mutationFn: (id: string) => api.delete(\`${endpoint}/\${id}\`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['foodtruck-schedule'] });
      setSelectedStop(null);
      toast.success('Stop removed');
    },
    onError: () => toast.error('Failed to remove stop'),
  });

  const weekDays = useMemo(() => {
    const days: Date[] = [];
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  }, [currentDate]);

  const getStopsForDate = (date: Date) => {
    return schedule.filter((stop: any) => {
      const stopDate = new Date(stop.date || stop.scheduled_date);
      return stopDate.getFullYear() === date.getFullYear() &&
        stopDate.getMonth() === date.getMonth() &&
        stopDate.getDate() === date.getDate();
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getStopColor = (stop: any) => {
    if (stop.status === 'active') return 'bg-green-100 text-green-700 border-green-300';
    if (stop.status === 'cancelled') return 'bg-red-100 text-red-700 border-red-300';
    if (stop.is_recurring) return 'bg-blue-100 text-blue-700 border-blue-300';
    return 'bg-orange-100 text-orange-700 border-orange-300';
  };

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center py-12', className)}>
        <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
      </div>
    );
  }

  return (
    <>
      <div className={cn('space-y-4', className)}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Location Schedule</h2>
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  const newDate = new Date(currentDate);
                  newDate.setDate(newDate.getDate() - 7);
                  setCurrentDate(newDate);
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                This Week
              </button>
              <button
                onClick={() => {
                  const newDate = new Date(currentDate);
                  newDate.setDate(newDate.getDate() + 7);
                  setCurrentDate(newDate);
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
          <button
            onClick={() => navigate('/foodtruck/schedule/new')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            <Plus className="w-4 h-4" />
            Add Stop
          </button>
        </div>

        <div className="text-sm text-gray-500 mb-2">
          {weekDays[0].toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - {weekDays[6].toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
            {weekDays.map((day, idx) => {
              const dayStops = getStopsForDate(day);
              return (
                <div key={idx} className={cn(
                  'py-3 px-2 text-center border-r last:border-r-0 border-gray-200 dark:border-gray-700',
                  isToday(day) && 'bg-orange-50 dark:bg-orange-900/20'
                )}>
                  <div className="text-sm font-medium text-gray-500">{WEEKDAYS[day.getDay()]}</div>
                  <div className={cn(
                    'w-8 h-8 mx-auto flex items-center justify-center rounded-full text-sm mt-1',
                    isToday(day) && 'bg-orange-600 text-white'
                  )}>
                    {day.getDate()}
                  </div>
                  {dayStops.length > 0 && (
                    <div className="text-xs text-orange-600 mt-1">{dayStops.length} stop{dayStops.length > 1 ? 's' : ''}</div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-7 min-h-[300px]">
            {weekDays.map((day, idx) => {
              const dayStops = getStopsForDate(day);
              return (
                <div key={idx} className={cn(
                  'p-2 border-r last:border-r-0 border-gray-200 dark:border-gray-700',
                  isToday(day) && 'bg-orange-50/50 dark:bg-orange-900/10'
                )}>
                  {dayStops.map((stop: any) => (
                    <div
                      key={stop.id}
                      onClick={() => setSelectedStop(stop)}
                      className={cn(
                        'p-2 mb-2 rounded-lg border cursor-pointer hover:opacity-80 transition-opacity',
                        getStopColor(stop)
                      )}
                    >
                      <div className="flex items-center gap-1 text-xs font-medium">
                        <Clock className="w-3 h-3" />
                        {stop.start_time} - {stop.end_time}
                      </div>
                      <div className="flex items-center gap-1 text-xs mt-1 truncate">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        {stop.location_name || stop.address}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-green-500" />
            <span className="text-gray-600 dark:text-gray-400">Active</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-blue-500" />
            <span className="text-gray-600 dark:text-gray-400">Recurring</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-orange-500" />
            <span className="text-gray-600 dark:text-gray-400">One-time</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-red-500" />
            <span className="text-gray-600 dark:text-gray-400">Cancelled</span>
          </div>
        </div>
      </div>

      {selectedStop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSelectedStop(null)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {selectedStop.location_name || 'Location Stop'}
              </h3>
              <button onClick={() => setSelectedStop(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <MapPin className="w-4 h-4" />
                {selectedStop.address || selectedStop.location_name}
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <Clock className="w-4 h-4" />
                {new Date(selectedStop.date || selectedStop.scheduled_date).toLocaleDateString()} | {selectedStop.start_time} - {selectedStop.end_time}
              </div>
              {selectedStop.notes && (
                <p className="text-sm text-gray-600 dark:text-gray-400">{selectedStop.notes}</p>
              )}
              {selectedStop.expected_sales && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Expected Sales: \${selectedStop.expected_sales.toLocaleString()}
                </p>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { navigate(\`/foodtruck/schedule/\${selectedStop.id}/edit\`); setSelectedStop(null); }}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center justify-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => deleteStop.mutate(selectedStop.id)}
                disabled={deleteStop.isPending}
                className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setSelectedStop(null)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ${componentName};
`;
}

/**
 * Generate food truck order queue component
 */
export function generateOrderQueueFoodtruck(options: FoodtruckOptions = {}): string {
  const { componentName = 'OrderQueueFoodtruck', endpoint = '/foodtruck/orders' } = options;

  return `import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Clock, CheckCircle, XCircle, ChefHat, Bell, User, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface ${componentName}Props {
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ className }) => {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'pending' | 'preparing' | 'ready'>('all');

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['foodtruck-order-queue'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${endpoint}?status=pending,preparing,ready');
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
        return [];
      }
    },
    refetchInterval: 5000, // Poll every 5 seconds for live updates
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.put(\`${endpoint}/\${id}/status\`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['foodtruck-order-queue'] });
      toast.success('Order updated');
    },
    onError: () => toast.error('Failed to update order'),
  });

  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter((o: any) => o.status === filter);

  const pendingCount = orders.filter((o: any) => o.status === 'pending').length;
  const preparingCount = orders.filter((o: any) => o.status === 'preparing').length;
  const readyCount = orders.filter((o: any) => o.status === 'ready').length;

  const statusFlow = ['pending', 'preparing', 'ready', 'completed'];

  const getOrderAge = (createdAt: string) => {
    const minutes = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return \`\${minutes}m ago\`;
    return \`\${Math.floor(minutes / 60)}h \${minutes % 60}m ago\`;
  };

  const isOrderDelayed = (order: any) => {
    const minutes = Math.floor((Date.now() - new Date(order.created_at).getTime()) / 60000);
    if (order.status === 'pending' && minutes > 5) return true;
    if (order.status === 'preparing' && minutes > 15) return true;
    return false;
  };

  if (isLoading) {
    return (
      <div className={cn('flex justify-center py-12', className)}>
        <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Order Queue</h2>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
            <Clock className="w-4 h-4" />
            {pendingCount} pending
          </span>
          <span className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
            <ChefHat className="w-4 h-4" />
            {preparingCount} preparing
          </span>
          <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
            <Bell className="w-4 h-4" />
            {readyCount} ready
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(['all', 'pending', 'preparing', 'ready'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              filter === tab
                ? 'bg-orange-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            )}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {tab !== 'all' && (
              <span className="ml-2 text-xs opacity-75">
                ({tab === 'pending' ? pendingCount : tab === 'preparing' ? preparingCount : readyCount})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Orders Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order: any) => {
            const currentIndex = statusFlow.indexOf(order.status);
            const nextStatus = statusFlow[currentIndex + 1];
            const delayed = isOrderDelayed(order);

            return (
              <div
                key={order.id}
                className={cn(
                  'bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 p-4',
                  order.status === 'pending' && 'border-yellow-300',
                  order.status === 'preparing' && 'border-blue-300',
                  order.status === 'ready' && 'border-green-300 animate-pulse',
                  delayed && 'ring-2 ring-red-500'
                )}
              >
                {/* Order Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-gray-900 dark:text-white">
                        #{order.order_number || order.id?.slice(-4)}
                      </span>
                      {delayed && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                          Delayed
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {getOrderAge(order.created_at)}
                    </p>
                  </div>
                  <span className={cn(
                    'px-3 py-1 rounded-full text-sm font-medium',
                    order.status === 'pending' && 'bg-yellow-100 text-yellow-700',
                    order.status === 'preparing' && 'bg-blue-100 text-blue-700',
                    order.status === 'ready' && 'bg-green-100 text-green-700'
                  )}>
                    {order.status}
                  </span>
                </div>

                {/* Customer Info */}
                {order.customer_name && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                    <User className="w-4 h-4" />
                    {order.customer_name}
                  </div>
                )}

                {/* Order Items */}
                <div className="space-y-1 mb-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                  {order.items?.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-gray-700 dark:text-gray-300">
                        {item.quantity}x {item.name}
                      </span>
                      {item.modifications && (
                        <span className="text-xs text-gray-500 italic">({item.modifications})</span>
                      )}
                    </div>
                  )) || (
                    <p className="text-sm text-gray-500">{order.items_summary || 'Order items'}</p>
                  )}
                </div>

                {/* Order Total */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-500">Total</span>
                  <span className="text-lg font-bold text-green-600 flex items-center">
                    <DollarSign className="w-4 h-4" />
                    {(order.total || 0).toFixed(2)}
                  </span>
                </div>

                {/* Special Instructions */}
                {order.special_instructions && (
                  <div className="text-sm text-orange-600 bg-orange-50 dark:bg-orange-900/20 p-2 rounded mb-3">
                    Note: {order.special_instructions}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  {nextStatus && nextStatus !== 'completed' && (
                    <button
                      onClick={() => updateStatus.mutate({ id: order.id, status: nextStatus })}
                      disabled={updateStatus.isPending}
                      className={cn(
                        'flex-1 py-2 rounded-lg font-medium flex items-center justify-center gap-1',
                        nextStatus === 'preparing' && 'bg-blue-600 text-white hover:bg-blue-700',
                        nextStatus === 'ready' && 'bg-green-600 text-white hover:bg-green-700'
                      )}
                    >
                      {nextStatus === 'preparing' ? (
                        <><ChefHat className="w-4 h-4" /> Start</>
                      ) : (
                        <><Bell className="w-4 h-4" /> Ready</>
                      )}
                    </button>
                  )}
                  {order.status === 'ready' && (
                    <button
                      onClick={() => updateStatus.mutate({ id: order.id, status: 'completed' })}
                      disabled={updateStatus.isPending}
                      className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-1"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Complete
                    </button>
                  )}
                  <button
                    onClick={() => updateStatus.mutate({ id: order.id, status: 'cancelled' })}
                    disabled={updateStatus.isPending}
                    className="py-2 px-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full text-center py-12 text-gray-500">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-300" />
            No orders in queue
          </div>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}
