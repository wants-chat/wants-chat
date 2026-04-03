/**
 * Florist Component Generators
 *
 * Generates florist-specific components:
 * - FloristStats: Dashboard stats for florist operations
 * - OrderFiltersFlorist: Order filtering for florist orders
 * - DeliveryListFlorist: Delivery list view
 * - DeliveryScheduleFlorist: Delivery schedule calendar
 * - PendingOrdersFlorist: Pending orders list
 * - CustomerProfileFlorist: Customer profile view for florist customers
 */

export interface FloristOptions {
  componentName?: string;
  endpoint?: string;
}

/**
 * Generate florist stats dashboard component
 */
export function generateFloristStats(options: FloristOptions = {}): string {
  const { componentName = 'FloristStats', endpoint = '/florist/stats' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, TrendingUp, TrendingDown, Flower2, ShoppingBag, DollarSign, Truck, Clock, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface ${componentName}Props {
  className?: string;
}

const statsConfig = [
  { key: 'todayOrders', label: "Today's Orders", icon: 'ShoppingBag', color: 'pink', type: 'number' },
  { key: 'todayRevenue', label: "Today's Revenue", icon: 'DollarSign', color: 'green', type: 'currency' },
  { key: 'pendingDeliveries', label: 'Pending Deliveries', icon: 'Truck', color: 'blue', type: 'number' },
  { key: 'arrangementsToday', label: 'Arrangements Today', icon: 'Flower2', color: 'purple', type: 'number' },
  { key: 'lowStockItems', label: 'Low Stock', icon: 'Package', color: 'yellow', type: 'number' },
  { key: 'scheduledOrders', label: 'Scheduled Orders', icon: 'Clock', color: 'orange', type: 'number' },
];

const colorClasses: Record<string, { bg: string; icon: string }> = {
  pink: { bg: 'bg-pink-100 dark:bg-pink-900/30', icon: 'text-pink-600 dark:text-pink-400' },
  green: { bg: 'bg-green-100 dark:bg-green-900/30', icon: 'text-green-600 dark:text-green-400' },
  blue: { bg: 'bg-blue-100 dark:bg-blue-900/30', icon: 'text-blue-600 dark:text-blue-400' },
  purple: { bg: 'bg-purple-100 dark:bg-purple-900/30', icon: 'text-purple-600 dark:text-purple-400' },
  yellow: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', icon: 'text-yellow-600 dark:text-yellow-400' },
  orange: { bg: 'bg-orange-100 dark:bg-orange-900/30', icon: 'text-orange-600 dark:text-orange-400' },
};

const iconMap: Record<string, React.FC<any>> = {
  ShoppingBag,
  DollarSign,
  Truck,
  Flower2,
  Package,
  Clock,
};

const ${componentName}: React.FC<${componentName}Props> = ({ className }) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['florist-stats'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${endpoint}');
        return response?.data || response || {};
      } catch (err) {
        console.error('Failed to fetch florist stats:', err);
        return {};
      }
    },
  });

  const formatValue = (value: any, type: string) => {
    if (value === undefined || value === null) return '-';
    if (type === 'currency') return '$' + Number(value).toLocaleString();
    if (type === 'percentage') return value + '%';
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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Florist Dashboard</h2>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Flower2 className="w-4 h-4" />
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statsConfig.map((stat) => {
          const Icon = iconMap[stat.icon] || Loader2;
          const colors = colorClasses[stat.color] || colorClasses.pink;
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
                {change !== undefined && (
                  <div className={cn(
                    'flex items-center gap-1 text-sm font-medium',
                    change >= 0 ? 'text-green-600' : 'text-red-600'
                  )}>
                    {change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {Math.abs(change)}%
                  </div>
                )}
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
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
 * Generate florist order filters component
 */
export function generateOrderFiltersFlorist(options: FloristOptions = {}): string {
  const { componentName = 'OrderFiltersFlorist' } = options;

  return `import React, { useState, useCallback } from 'react';
import { Search, X, Filter, ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterValues {
  search: string;
  status: string;
  orderType: string;
  deliveryDate: string;
  occasion: string;
}

interface ${componentName}Props {
  className?: string;
  values?: Partial<FilterValues>;
  onChange?: (filters: FilterValues) => void;
  onSearch?: (filters: FilterValues) => void;
}

const initialFilters: FilterValues = {
  search: '',
  status: '',
  orderType: '',
  deliveryDate: '',
  occasion: '',
};

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'designing', label: 'Designing' },
  { value: 'ready', label: 'Ready' },
  { value: 'out_for_delivery', label: 'Out for Delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

const orderTypeOptions = [
  { value: 'delivery', label: 'Delivery' },
  { value: 'pickup', label: 'Pickup' },
  { value: 'event', label: 'Event/Wedding' },
  { value: 'subscription', label: 'Subscription' },
];

const occasionOptions = [
  { value: 'birthday', label: 'Birthday' },
  { value: 'anniversary', label: 'Anniversary' },
  { value: 'sympathy', label: 'Sympathy' },
  { value: 'wedding', label: 'Wedding' },
  { value: 'valentines', label: "Valentine's Day" },
  { value: 'mothers_day', label: "Mother's Day" },
  { value: 'get_well', label: 'Get Well' },
  { value: 'thank_you', label: 'Thank You' },
  { value: 'other', label: 'Other' },
];

const ${componentName}: React.FC<${componentName}Props> = ({
  className,
  values: propValues,
  onChange,
  onSearch,
}) => {
  const [filters, setFilters] = useState<FilterValues>(initialFilters);
  const [expanded, setExpanded] = useState(true);

  const currentFilters = { ...filters, ...propValues };

  const updateFilter = useCallback((name: keyof FilterValues, value: any) => {
    const updated = { ...currentFilters, [name]: value };
    setFilters(updated);
    if (onChange) onChange(updated);
  }, [currentFilters, onChange]);

  const clearAll = useCallback(() => {
    setFilters(initialFilters);
    if (onChange) onChange(initialFilters);
    if (onSearch) onSearch(initialFilters);
  }, [onChange, onSearch]);

  const handleSearch = useCallback(() => {
    if (onSearch) onSearch(currentFilters);
  }, [currentFilters, onSearch]);

  const hasActiveFilters = currentFilters.search || currentFilters.status || currentFilters.orderType ||
    currentFilters.deliveryDate || currentFilters.occasion;

  return (
    <div className={cn('bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700', className)}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full p-4 text-left"
      >
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <span className="font-medium text-gray-900 dark:text-white">Order Filters</span>
          {hasActiveFilters && (
            <span className="px-2 py-0.5 text-xs bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400 rounded-full">
              Active
            </span>
          )}
        </div>
        {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>

      {expanded && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search Orders</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={currentFilters.search}
                  onChange={(e) => updateFilter('search', e.target.value)}
                  placeholder="Search by order #, customer name, recipient..."
                  className="w-full px-3 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                />
                {currentFilters.search && (
                  <button onClick={() => updateFilter('search', '')} className="absolute right-3 top-1/2 -translate-y-1/2">
                    <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
              <select
                value={currentFilters.status}
                onChange={(e) => updateFilter('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              >
                <option value="">All Statuses</option>
                {statusOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Order Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Order Type</label>
              <select
                value={currentFilters.orderType}
                onChange={(e) => updateFilter('orderType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              >
                <option value="">All Types</option>
                {orderTypeOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Occasion Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Occasion</label>
              <select
                value={currentFilters.occasion}
                onChange={(e) => updateFilter('occasion', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              >
                <option value="">All Occasions</option>
                {occasionOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Delivery Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Delivery Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={currentFilters.deliveryDate}
                  onChange={(e) => updateFilter('deliveryDate', e.target.value)}
                  className="w-full px-3 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={clearAll}
              disabled={!hasActiveFilters}
              className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white disabled:opacity-50"
            >
              Clear all filters
            </button>
            {onSearch && (
              <button
                onClick={handleSearch}
                className="inline-flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
              >
                <Search className="w-4 h-4" />
                Apply Filters
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}

/**
 * Generate florist delivery list component
 */
export function generateDeliveryListFlorist(options: FloristOptions = {}): string {
  const { componentName = 'DeliveryListFlorist', endpoint = '/florist/deliveries' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Loader2, Clock, MapPin, Phone, ChevronRight, Truck, CheckCircle, Flower2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface ${componentName}Props {
  className?: string;
  date?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ className, date }) => {
  const deliveryDate = date || new Date().toISOString().split('T')[0];

  const { data: deliveries = [], isLoading } = useQuery({
    queryKey: ['florist-deliveries', deliveryDate],
    queryFn: async () => {
      try {
        const response = await api.get<any>(\`${endpoint}?date=\${deliveryDate}\`);
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch deliveries:', err);
        return [];
      }
    },
  });

  const statusConfig: Record<string, { color: string; icon: React.FC<any> }> = {
    pending: { color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', icon: Clock },
    designing: { color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', icon: Flower2 },
    ready: { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: Flower2 },
    out_for_delivery: { color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', icon: Truck },
    delivered: { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle },
  };

  if (isLoading) {
    return (
      <div className={cn('flex justify-center py-8', className)}>
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className={cn('bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700', className)}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Truck className="w-5 h-5 text-pink-600" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Deliveries</h3>
          <span className="text-sm text-gray-500">
            {new Date(deliveryDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
        </div>
        <span className="px-2 py-1 bg-pink-100 text-pink-700 rounded-full text-sm font-medium">
          {deliveries.length} deliveries
        </span>
      </div>

      {deliveries.length > 0 ? (
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {deliveries.map((delivery: any) => {
            const status = statusConfig[delivery.status?.toLowerCase()] || statusConfig.pending;
            const StatusIcon = status.icon;

            return (
              <Link
                key={delivery.id}
                to={\`/florist/orders/\${delivery.order_id || delivery.id}\`}
                className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Flower2 className="w-6 h-6 text-pink-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900 dark:text-white">
                        #{delivery.order_number || delivery.id?.slice(-6)}
                      </p>
                      <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', status.color)}>
                        <StatusIcon className="w-3 h-3" />
                        {delivery.status?.replace('_', ' ') || 'Pending'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{delivery.recipient_name}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {delivery.delivery_time || 'Anytime'}
                      </span>
                      <span className="flex items-center gap-1 truncate max-w-[200px]">
                        <MapPin className="w-3 h-3" />
                        {delivery.delivery_address || delivery.address}
                      </span>
                    </div>
                    {delivery.recipient_phone && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                        <Phone className="w-3 h-3" />
                        {delivery.recipient_phone}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {delivery.arrangement_name || delivery.product_name || 'Custom Arrangement'}
                    </p>
                    <p className="text-xs text-gray-500">\${(delivery.total || 0).toFixed(2)}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="p-8 text-center text-gray-500">
          <Truck className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          No deliveries scheduled for this date
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}

/**
 * Generate florist delivery schedule component
 */
export function generateDeliveryScheduleFlorist(options: FloristOptions = {}): string {
  const { componentName = 'DeliveryScheduleFlorist', endpoint = '/florist/deliveries' } = options;

  return `import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Loader2, Truck, MapPin, Clock, Flower2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface ${componentName}Props {
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ className }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

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

  const { data: deliveries = [], isLoading } = useQuery({
    queryKey: ['florist-delivery-schedule', weekDays[0].toISOString(), weekDays[6].toISOString()],
    queryFn: async () => {
      try {
        const start = weekDays[0].toISOString().split('T')[0];
        const end = weekDays[6].toISOString().split('T')[0];
        const response = await api.get<any>(\`${endpoint}?start=\${start}&end=\${end}\`);
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch deliveries:', err);
        return [];
      }
    },
  });

  const getDeliveriesForDate = (date: Date) => {
    return deliveries.filter((d: any) => {
      const deliveryDate = new Date(d.delivery_date || d.date);
      return deliveryDate.toDateString() === date.toDateString();
    });
  };

  const isToday = (date: Date) => {
    return date.toDateString() === new Date().toDateString();
  };

  const timeSlots = ['8:00 AM', '10:00 AM', '12:00 PM', '2:00 PM', '4:00 PM', '6:00 PM'];

  const getDeliveriesForSlot = (date: Date, slot: string) => {
    const dayDeliveries = getDeliveriesForDate(date);
    return dayDeliveries.filter((d: any) => {
      const time = d.delivery_time || d.time || '';
      const slotHour = parseInt(slot);
      const deliveryHour = parseInt(time);
      return Math.abs(slotHour - deliveryHour) < 2 || (!time && slot === '12:00 PM');
    });
  };

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center py-12', className)}>
        <Loader2 className="w-8 h-8 animate-spin text-pink-600" />
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Delivery Schedule</h2>
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
        <div className="text-sm text-gray-500">
          {weekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weekDays[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 w-24">Time</th>
              {weekDays.map((day, idx) => {
                const dayDeliveries = getDeliveriesForDate(day);
                return (
                  <th key={idx} className={cn(
                    'py-3 px-2 text-center text-sm font-medium',
                    isToday(day) ? 'bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-400' : 'text-gray-500'
                  )}>
                    <div>{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day.getDay()]}</div>
                    <div className={cn(
                      'w-8 h-8 mx-auto flex items-center justify-center rounded-full text-sm mt-1',
                      isToday(day) && 'bg-pink-600 text-white'
                    )}>
                      {day.getDate()}
                    </div>
                    {dayDeliveries.length > 0 && (
                      <div className="text-xs text-pink-600 mt-1">{dayDeliveries.length} deliveries</div>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map((slot) => (
              <tr key={slot} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                <td className="py-2 px-4 text-sm text-gray-500 align-top">{slot}</td>
                {weekDays.map((day, idx) => {
                  const slotDeliveries = getDeliveriesForSlot(day, slot);
                  return (
                    <td key={idx} className={cn(
                      'py-2 px-2 align-top min-h-[60px]',
                      isToday(day) && 'bg-pink-50/50 dark:bg-pink-900/10'
                    )}>
                      {slotDeliveries.map((delivery: any) => (
                        <div
                          key={delivery.id}
                          className="px-2 py-1 mb-1 text-xs rounded border border-pink-200 bg-pink-50 text-pink-700 cursor-pointer hover:bg-pink-100"
                        >
                          <div className="font-medium truncate">{delivery.recipient_name}</div>
                          <div className="flex items-center gap-1 opacity-75 truncate">
                            <MapPin className="w-3 h-3 flex-shrink-0" />
                            {delivery.delivery_address?.split(',')[0] || 'TBD'}
                          </div>
                        </div>
                      ))}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

/**
 * Generate florist pending orders component
 */
export function generatePendingOrdersFlorist(options: FloristOptions = {}): string {
  const { componentName = 'PendingOrdersFlorist', endpoint = '/florist/orders' } = options;

  return `import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Loader2, Clock, Calendar, ChevronRight, Flower2, CheckCircle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface ${componentName}Props {
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ className }) => {
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['florist-pending-orders'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${endpoint}?status=pending,designing');
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch pending orders:', err);
        return [];
      }
    },
    refetchInterval: 30000,
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.put(\`${endpoint}/\${id}/status\`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['florist-pending-orders'] });
      toast.success('Order status updated');
    },
    onError: () => toast.error('Failed to update status'),
  });

  const isUrgent = (order: any) => {
    const deliveryDate = new Date(order.delivery_date || order.date);
    const now = new Date();
    const hoursUntil = (deliveryDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursUntil < 24;
  };

  if (isLoading) {
    return (
      <div className={cn('flex justify-center py-8', className)}>
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className={cn('bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700', className)}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flower2 className="w-5 h-5 text-pink-600" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Pending Orders</h3>
        </div>
        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
          {orders.length} pending
        </span>
      </div>

      {orders.length > 0 ? (
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {orders.map((order: any) => {
            const urgent = isUrgent(order);

            return (
              <div key={order.id} className={cn('p-4', urgent && 'bg-red-50 dark:bg-red-900/10')}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Link
                        to={\`/florist/orders/\${order.id}\`}
                        className="font-medium text-gray-900 dark:text-white hover:text-pink-600"
                      >
                        #{order.order_number || order.id?.slice(-6)}
                      </Link>
                      {urgent && (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                          <AlertTriangle className="w-3 h-3" />
                          Urgent
                        </span>
                      )}
                      <span className={\`px-2 py-0.5 rounded-full text-xs font-medium \${
                        order.status === 'designing' ? 'bg-purple-100 text-purple-700' : 'bg-yellow-100 text-yellow-700'
                      }\`}>
                        {order.status || 'Pending'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{order.customer_name} - {order.recipient_name || 'Same'}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(order.delivery_date || order.date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {order.delivery_time || 'Anytime'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">\${(order.total || 0).toFixed(2)}</p>
                    <p className="text-xs text-gray-500">{order.arrangement_name || order.product_name}</p>
                  </div>
                </div>

                {order.special_instructions && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 p-2 bg-gray-50 dark:bg-gray-900/50 rounded">
                    Note: {order.special_instructions}
                  </p>
                )}

                <div className="flex gap-2">
                  {order.status === 'pending' && (
                    <button
                      onClick={() => updateStatus.mutate({ id: order.id, status: 'designing' })}
                      disabled={updateStatus.isPending}
                      className="flex-1 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center gap-1 text-sm"
                    >
                      <Flower2 className="w-4 h-4" />
                      Start Designing
                    </button>
                  )}
                  {order.status === 'designing' && (
                    <button
                      onClick={() => updateStatus.mutate({ id: order.id, status: 'ready' })}
                      disabled={updateStatus.isPending}
                      className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-1 text-sm"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Mark Ready
                    </button>
                  )}
                  <Link
                    to={\`/florist/orders/\${order.id}\`}
                    className="py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-1 text-sm"
                  >
                    View <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-8 text-center text-gray-500">
          <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-300" />
          All caught up! No pending orders.
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}

/**
 * Generate florist customer profile component
 */
export function generateCustomerProfileFlorist(options: FloristOptions = {}): string {
  const { componentName = 'CustomerProfileFlorist', endpoint = '/florist/customers' } = options;

  return `import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Mail, Phone, MapPin, Calendar, ArrowLeft, Edit, Flower2, ShoppingBag, DollarSign, Heart, Gift, Clock } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: customer, isLoading } = useQuery({
    queryKey: ['florist-customer', id],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + id);
      return response?.data || response;
    },
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['florist-customer-orders', id],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + id + '/orders');
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !!id,
  });

  const { data: savedRecipients = [] } = useQuery({
    queryKey: ['florist-customer-recipients', id],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + id + '/recipients');
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Customer not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Link to="${endpoint}" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
          <ArrowLeft className="w-4 h-4" />
          Back to Customers
        </Link>
      </div>

      {/* Customer Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
                {customer.avatar_url ? (
                  <img src={customer.avatar_url} alt={customer.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-white">
                    {(customer.name || customer.first_name || '?').charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {customer.name || \`\${customer.first_name || ''} \${customer.last_name || ''}\`.trim()}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  {customer.is_subscriber && (
                    <span className="flex items-center gap-1 px-2 py-1 bg-pink-100 text-pink-700 rounded-full text-xs font-medium">
                      <Flower2 className="w-3 h-3" /> Subscriber
                    </span>
                  )}
                  {customer.is_vip && (
                    <span className="flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                      <Heart className="w-3 h-3 fill-current" /> VIP
                    </span>
                  )}
                </div>
              </div>
            </div>
            <Link
              to={\`${endpoint}/\${id}/edit\`}
              className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-gray-50 dark:bg-gray-900/50">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-2xl font-bold text-gray-900 dark:text-white">
              <ShoppingBag className="w-5 h-5 text-pink-600" />
              {customer.total_orders || orders.length || 0}
            </div>
            <p className="text-sm text-gray-500">Total Orders</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-2xl font-bold text-green-600">
              <DollarSign className="w-5 h-5" />
              {(customer.total_spent || 0).toLocaleString()}
            </div>
            <p className="text-sm text-gray-500">Total Spent</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-2xl font-bold text-purple-600">
              <Gift className="w-5 h-5" />
              {savedRecipients.length || 0}
            </div>
            <p className="text-sm text-gray-500">Saved Recipients</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-2xl font-bold text-blue-600">
              <Heart className="w-5 h-5" />
              {customer.loyalty_points || 0}
            </div>
            <p className="text-sm text-gray-500">Loyalty Points</p>
          </div>
        </div>

        {/* Contact & Preferences */}
        <div className="p-6 grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Contact Information</h3>
            {customer.email && (
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <Mail className="w-5 h-5 text-gray-400" />
                <a href={\`mailto:\${customer.email}\`} className="hover:text-pink-600">{customer.email}</a>
              </div>
            )}
            {customer.phone && (
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <Phone className="w-5 h-5 text-gray-400" />
                <a href={\`tel:\${customer.phone}\`} className="hover:text-pink-600">{customer.phone}</a>
              </div>
            )}
            {(customer.address || customer.city) && (
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <MapPin className="w-5 h-5 text-gray-400" />
                <span>{[customer.address, customer.city, customer.zip_code].filter(Boolean).join(', ')}</span>
              </div>
            )}
            {customer.created_at && (
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <Calendar className="w-5 h-5 text-gray-400" />
                <span>Customer since {new Date(customer.created_at).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Preferences</h3>
            {customer.favorite_flowers && customer.favorite_flowers.length > 0 && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Favorite Flowers</p>
                <div className="flex flex-wrap gap-2">
                  {customer.favorite_flowers.map((flower: string) => (
                    <span key={flower} className="px-2 py-1 bg-pink-100 text-pink-700 rounded-full text-xs">
                      {flower}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {customer.allergies && customer.allergies.length > 0 && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Allergies/Avoid</p>
                <div className="flex flex-wrap gap-2">
                  {customer.allergies.map((item: string) => (
                    <span key={item} className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {customer.preferred_style && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Preferred Style</p>
                <p className="text-gray-700 dark:text-gray-300">{customer.preferred_style}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Saved Recipients */}
      {savedRecipients.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-white">Saved Recipients</h3>
            <Link to={\`${endpoint}/\${id}/recipients\`} className="text-sm text-pink-600 hover:text-pink-700">
              Manage
            </Link>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {savedRecipients.slice(0, 5).map((recipient: any) => (
              <div key={recipient.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{recipient.name}</p>
                  <p className="text-sm text-gray-500">{recipient.relationship || 'Contact'}</p>
                </div>
                <div className="text-right text-sm text-gray-500">
                  <p>{recipient.address}</p>
                  {recipient.phone && <p>{recipient.phone}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Orders */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white">Order History</h3>
          <Link to={\`${endpoint}/\${id}/orders\`} className="text-sm text-pink-600 hover:text-pink-700">
            View All
          </Link>
        </div>
        {orders.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {orders.slice(0, 5).map((order: any) => (
              <Link
                key={order.id}
                to={\`/florist/orders/\${order.id}\`}
                className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    #{order.order_number || order.id?.slice(-6)}
                  </p>
                  <p className="text-sm text-gray-500">{order.arrangement_name || order.product_name}</p>
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" />
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-green-600">\${(order.total || 0).toFixed(2)}</p>
                  <span className={\`px-2 py-0.5 rounded-full text-xs font-medium \${
                    order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }\`}>
                    {order.status || 'Pending'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            No orders yet
          </div>
        )}
      </div>

      {/* Notes */}
      {customer.notes && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Notes</h3>
          <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{customer.notes}</p>
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}
