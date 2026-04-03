/**
 * Today List Generator
 *
 * Generates today-focused list components:
 * - ActivityListToday: Today's activities/tasks
 * - TodaysOrders: Today's orders
 * - UpcomingDepartures: Upcoming departures/shipments
 *
 * Features:
 * - Date-filtered data display
 * - Real-time updates
 * - Time-based sorting
 * - Quick actions
 * - Summary statistics
 * - Dark mode support
 */

import { snakeCase, pascalCase } from 'change-case';
import pluralize from 'pluralize';
import { formatFieldLabel } from '../utils/generator-helpers';

export interface TodayListItemConfig {
  title: string;
  subtitle?: string;
  time: string;
  status?: string;
  amount?: string;
  icon?: string;
  avatar?: string;
  badge?: string;
  priority?: string;
}

export interface TodayListOptions {
  componentName?: string;
  entity: string;
  displayName?: string;
  endpoint?: string;
  queryKey?: string;
  itemConfig: TodayListItemConfig;
  variant?: 'activities' | 'orders' | 'departures' | 'default';
  showSummary?: boolean;
  showFilters?: boolean;
  showActions?: boolean;
  refreshInterval?: number;
  emptyMessage?: string;
  viewRoute?: string;
  createRoute?: string;
  summaryFields?: { key: string; label: string; format?: 'number' | 'currency' | 'percent' }[];
}

/**
 * Generate a today list component
 */
export function generateTodayList(options: TodayListOptions): string {
  const {
    entity,
    itemConfig,
    variant = 'default',
    showSummary = true,
    showFilters = true,
    showActions = true,
    refreshInterval = 60000,
    emptyMessage,
  } = options;

  const tableName = snakeCase(pluralize.plural(entity));
  const componentName = options.componentName || pascalCase(entity) + 'TodayList';
  const displayName = options.displayName || formatFieldLabel(entity);
  const endpoint = options.endpoint || '/' + tableName + '/today';
  const queryKey = options.queryKey || tableName + '_today';
  const viewRoute = options.viewRoute || `/${tableName}/\${id}`;
  const createRoute = options.createRoute || `/${tableName}/new`;

  // Determine icons based on variant
  const variantIcons: Record<string, string[]> = {
    activities: ['Activity', 'CheckCircle', 'Clock', 'AlertCircle', 'Circle'],
    orders: ['ShoppingBag', 'Package', 'Truck', 'CheckCircle', 'DollarSign'],
    departures: ['Plane', 'Ship', 'Truck', 'Clock', 'MapPin', 'ArrowRight'],
    default: ['FileText', 'Clock', 'CheckCircle'],
  };

  const baseIcons = ['Plus', 'Loader2', 'MoreVertical', 'Eye', 'RefreshCw', 'Filter', 'Calendar'];
  const icons = [...new Set([...baseIcons, ...variantIcons[variant]])];

  const summaryFields = options.summaryFields || getSummaryFieldsForVariant(variant);

  return `import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ${icons.join(', ')} } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface ${componentName}Props {
  data?: any[];
  date?: Date;
  className?: string;
  onItemClick?: (item: any) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  data: propData,
  date = new Date(),
  className,
  onItemClick,
}) => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(date);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const dateStr = selectedDate.toISOString().split('T')[0];

  const { data: fetchedData, isLoading, refetch } = useQuery({
    queryKey: ['${queryKey}', dateStr],
    queryFn: async () => {
      try {
        const response = await api.get<any>(\`${endpoint}?date=\${dateStr}\`);
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch:', err);
        return [];
      }
    },
    enabled: !propData || propData.length === 0,
    refetchInterval: ${refreshInterval},
  });

  const allItems = propData && propData.length > 0 ? propData : (fetchedData || []);

  // Filter items by status
  const items = useMemo(() => {
    if (statusFilter === 'all') return allItems;
    return allItems.filter((item: any) => item.${itemConfig.status || 'status'}?.toLowerCase() === statusFilter);
  }, [allItems, statusFilter]);

  // Sort by time
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const timeA = new Date(a.${itemConfig.time}).getTime();
      const timeB = new Date(b.${itemConfig.time}).getTime();
      return timeA - timeB;
    });
  }, [items]);

  // Calculate summary
  const summary = useMemo(() => {
    const total = allItems.length;
    const completed = allItems.filter((i: any) => ['completed', 'delivered', 'departed'].includes(i.${itemConfig.status || 'status'}?.toLowerCase())).length;
    const pending = allItems.filter((i: any) => ['pending', 'scheduled', 'waiting'].includes(i.${itemConfig.status || 'status'}?.toLowerCase())).length;
    const inProgress = allItems.filter((i: any) => ['in_progress', 'processing', 'in_transit'].includes(i.${itemConfig.status || 'status'}?.toLowerCase())).length;
    ${itemConfig.amount ? `const totalAmount = allItems.reduce((sum: number, i: any) => sum + (parseFloat(i.${itemConfig.amount}) || 0), 0);` : ''}

    return {
      total,
      completed,
      pending,
      inProgress,
      ${itemConfig.amount ? 'totalAmount,' : ''}
    };
  }, [allItems]);

  const handleItemClick = (item: any) => {
    if (onItemClick) onItemClick(item);
    else navigate(\`${viewRoute.replace('${id}', '${item.id || item._id}')}\`);
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { color: string; icon: React.ReactNode }> = {
      pending: {
        color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
        icon: <Clock className="w-3 h-3" />,
      },
      scheduled: {
        color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        icon: <Calendar className="w-3 h-3" />,
      },
      in_progress: {
        color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
        icon: <Activity className="w-3 h-3" />,
      },
      processing: {
        color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
        icon: <Activity className="w-3 h-3" />,
      },
      completed: {
        color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        icon: <CheckCircle className="w-3 h-3" />,
      },
      delivered: {
        color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        icon: <CheckCircle className="w-3 h-3" />,
      },
      departed: {
        color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        icon: <ArrowRight className="w-3 h-3" />,
      },
      cancelled: {
        color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        icon: <AlertCircle className="w-3 h-3" />,
      },
    };
    return configs[status?.toLowerCase()] || configs.pending;
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      high: 'text-red-600 dark:text-red-400',
      urgent: 'text-red-600 dark:text-red-400',
      medium: 'text-yellow-600 dark:text-yellow-400',
      normal: 'text-blue-600 dark:text-blue-400',
      low: 'text-gray-600 dark:text-gray-400',
    };
    return colors[priority?.toLowerCase()] || colors.normal;
  };

  const formatTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatCurrency = (amount: number) => {
    return '$' + amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const isUpcoming = (dateTime: string) => {
    return new Date(dateTime) > new Date();
  };

  const getVariantIcon = () => {
    ${variant === 'activities' ? `return <Activity className="w-6 h-6 text-purple-600 dark:text-purple-400" />;` :
      variant === 'orders' ? `return <ShoppingBag className="w-6 h-6 text-blue-600 dark:text-blue-400" />;` :
      variant === 'departures' ? `return <Plane className="w-6 h-6 text-green-600 dark:text-green-400" />;` :
      `return <FileText className="w-6 h-6 text-gray-600 dark:text-gray-400" />;`}
  };

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center py-12', className)}>
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
            {getVariantIcon()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Today's ${displayName}s
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {selectedDate.toLocaleDateString(undefined, {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            title="Refresh"
          >
            <RefreshCw className="w-5 h-5 text-gray-500" />
          </button>
          <button
            onClick={() => navigate('${createRoute}')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add ${displayName}
          </button>
        </div>
      </div>

      ${showSummary ? `{/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary.total}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Completed</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{summary.completed}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">In Progress</p>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{summary.inProgress}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{summary.pending}</p>
        </div>
      </div>` : ''}

      ${showFilters ? `{/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {['all', 'pending', 'in_progress', 'completed'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
              statusFilter === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            )}
          >
            {status === 'all' ? 'All' : status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
          </button>
        ))}
      </div>` : ''}

      {/* List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {sortedItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
              {getVariantIcon()}
            </div>
            <p className="text-gray-500 dark:text-gray-400">
              ${emptyMessage || `No ${displayName.toLowerCase()}s for today`}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {sortedItems.map((item: any) => {
              const itemId = item.id || item._id;
              const statusConfig = getStatusConfig(item.${itemConfig.status || 'status'});
              const upcoming = isUpcoming(item.${itemConfig.time});

              return (
                <li
                  key={itemId}
                  className={cn(
                    'p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors',
                    upcoming && 'bg-blue-50/50 dark:bg-blue-900/10'
                  )}
                >
                  <div className="flex items-center gap-4">
                    {/* Time */}
                    <div className="flex-shrink-0 w-16 text-center">
                      <p className={cn(
                        'text-lg font-semibold',
                        upcoming ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'
                      )}>
                        {formatTime(item.${itemConfig.time})}
                      </p>
                      ${itemConfig.priority ? `{item.${itemConfig.priority} && (
                        <p className={cn('text-xs font-medium', getPriorityColor(item.${itemConfig.priority}))}>
                          {item.${itemConfig.priority}}
                        </p>
                      )}` : ''}
                    </div>

                    {/* Divider */}
                    <div className="w-px h-12 bg-gray-200 dark:bg-gray-700" />

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleItemClick(item)}
                          className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 truncate text-left"
                        >
                          {item.${itemConfig.title}}
                        </button>
                        <span className={cn(
                          'inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full',
                          statusConfig.color
                        )}>
                          {statusConfig.icon}
                          {item.${itemConfig.status || 'status'}}
                        </span>
                      </div>
                      ${itemConfig.subtitle ? `{item.${itemConfig.subtitle} && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate mt-1">
                          {item.${itemConfig.subtitle}}
                        </p>
                      )}` : ''}
                    </div>

                    ${itemConfig.amount ? `{/* Amount */}
                    {item.${itemConfig.amount} && (
                      <div className="flex-shrink-0 text-right">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(parseFloat(item.${itemConfig.amount}))}
                        </p>
                      </div>
                    )}` : ''}

                    ${showActions ? `{/* Actions */}
                    <div className="flex-shrink-0 relative" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setOpenMenu(openMenu === itemId ? null : itemId)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                      >
                        <MoreVertical className="w-4 h-4 text-gray-500" />
                      </button>
                      {openMenu === itemId && (
                        <div className="absolute right-0 top-10 z-10 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1">
                          <button
                            onClick={() => { handleItemClick(item); setOpenMenu(null); }}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                          >
                            <Eye className="w-4 h-4" /> View Details
                          </button>
                        </div>
                      )}
                    </div>` : ''}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Footer Stats */}
      ${itemConfig.amount && showSummary ? `{summary.totalAmount > 0 && (
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <span className="text-sm text-gray-600 dark:text-gray-400">Total Amount Today</span>
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            {formatCurrency(summary.totalAmount)}
          </span>
        </div>
      )}` : ''}
    </div>
  );
};

export default ${componentName};
`;
}

function getSummaryFieldsForVariant(variant: string) {
  const fields: Record<string, { key: string; label: string; format?: 'number' | 'currency' | 'percent' }[]> = {
    activities: [
      { key: 'total', label: 'Total' },
      { key: 'completed', label: 'Completed' },
      { key: 'inProgress', label: 'In Progress' },
      { key: 'pending', label: 'Pending' },
    ],
    orders: [
      { key: 'total', label: 'Orders' },
      { key: 'totalAmount', label: 'Revenue', format: 'currency' },
      { key: 'completed', label: 'Delivered' },
      { key: 'pending', label: 'Pending' },
    ],
    departures: [
      { key: 'total', label: 'Total' },
      { key: 'departed', label: 'Departed' },
      { key: 'scheduled', label: 'Scheduled' },
      { key: 'delayed', label: 'Delayed' },
    ],
    default: [
      { key: 'total', label: 'Total' },
      { key: 'completed', label: 'Completed' },
      { key: 'pending', label: 'Pending' },
    ],
  };
  return fields[variant] || fields.default;
}

/**
 * Generate ActivityListToday component
 */
export function generateActivityListToday(options?: Partial<TodayListOptions>): string {
  return generateTodayList({
    entity: 'activity',
    displayName: 'Activity',
    componentName: 'ActivityListToday',
    variant: 'activities',
    endpoint: '/activities/today',
    queryKey: 'activities_today',
    itemConfig: {
      title: 'title',
      subtitle: 'description',
      time: 'scheduled_at',
      status: 'status',
      priority: 'priority',
    },
    showSummary: true,
    showFilters: true,
    showActions: true,
    emptyMessage: 'No activities scheduled for today',
    ...options,
  });
}

/**
 * Generate TodaysOrders component
 */
export function generateTodaysOrders(options?: Partial<TodayListOptions>): string {
  return generateTodayList({
    entity: 'order',
    displayName: 'Order',
    componentName: 'TodaysOrders',
    variant: 'orders',
    endpoint: '/orders/today',
    queryKey: 'orders_today',
    itemConfig: {
      title: 'order_number',
      subtitle: 'customer_name',
      time: 'created_at',
      status: 'status',
      amount: 'total',
    },
    showSummary: true,
    showFilters: true,
    showActions: true,
    emptyMessage: 'No orders received today',
    ...options,
  });
}

/**
 * Generate UpcomingDepartures component
 */
export function generateUpcomingDepartures(options?: Partial<TodayListOptions>): string {
  return generateTodayList({
    entity: 'departure',
    displayName: 'Departure',
    componentName: 'UpcomingDepartures',
    variant: 'departures',
    endpoint: '/departures/upcoming',
    queryKey: 'departures_upcoming',
    itemConfig: {
      title: 'flight_number',
      subtitle: 'destination',
      time: 'departure_time',
      status: 'status',
    },
    showSummary: true,
    showFilters: true,
    showActions: true,
    emptyMessage: 'No upcoming departures',
    ...options,
  });
}
