/**
 * Laundry Service Component Generators
 *
 * Generates components for laundry service management:
 * - LaundryStats: Dashboard statistics
 * - OrderFiltersLaundry: Order filtering interface
 * - OrderTimelineLaundry: Order status timeline
 * - CustomerProfileLaundry: Customer profile with order history
 */

export interface LaundryStatsOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateLaundryStats(options: LaundryStatsOptions = {}): string {
  const { componentName = 'LaundryStats', endpoint = '/laundry/stats' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Shirt, Package, Clock, DollarSign, Users, Truck, CheckCircle, AlertTriangle, Scale, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface ${componentName}Props {
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ className }) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['laundry-stats'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${endpoint}');
        return response?.data || response || {};
      } catch (err) {
        console.error('Failed to fetch stats:', err);
        return {};
      }
    },
  });

  const statCards = [
    { key: 'ordersToday', label: "Today's Orders", icon: Package, color: 'blue' },
    { key: 'ordersProcessing', label: 'Processing', icon: RefreshCw, color: 'yellow' },
    { key: 'readyForPickup', label: 'Ready for Pickup', icon: CheckCircle, color: 'green' },
    { key: 'pendingDelivery', label: 'Pending Delivery', icon: Truck, color: 'purple' },
    { key: 'totalWeight', label: 'Total Weight (lbs)', icon: Scale, color: 'indigo' },
    { key: 'activeCustomers', label: 'Active Customers', icon: Users, color: 'orange' },
    { key: 'revenueToday', label: "Today's Revenue", icon: DollarSign, color: 'emerald', type: 'currency' },
    { key: 'avgTurnaround', label: 'Avg Turnaround', icon: Clock, color: 'red', suffix: ' hrs' },
  ];

  const colorClasses: Record<string, { bg: string; icon: string }> = {
    blue: { bg: 'bg-blue-100 dark:bg-blue-900/30', icon: 'text-blue-600 dark:text-blue-400' },
    green: { bg: 'bg-green-100 dark:bg-green-900/30', icon: 'text-green-600 dark:text-green-400' },
    yellow: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', icon: 'text-yellow-600 dark:text-yellow-400' },
    orange: { bg: 'bg-orange-100 dark:bg-orange-900/30', icon: 'text-orange-600 dark:text-orange-400' },
    purple: { bg: 'bg-purple-100 dark:bg-purple-900/30', icon: 'text-purple-600 dark:text-purple-400' },
    indigo: { bg: 'bg-indigo-100 dark:bg-indigo-900/30', icon: 'text-indigo-600 dark:text-indigo-400' },
    emerald: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', icon: 'text-emerald-600 dark:text-emerald-400' },
    red: { bg: 'bg-red-100 dark:bg-red-900/30', icon: 'text-red-600 dark:text-red-400' },
  };

  const formatValue = (value: any, type?: string, suffix?: string) => {
    if (value === undefined || value === null) return '-';
    if (type === 'currency') return '$' + Number(value).toLocaleString();
    return Number(value).toLocaleString() + (suffix || '');
  };

  if (isLoading) {
    return (
      <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6', className)}>
        {[...Array(8)].map((_, i) => (
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
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6', className)}>
      {statCards.map((stat) => {
        const Icon = stat.icon;
        const colors = colorClasses[stat.color];
        const value = stats?.[stat.key];

        return (
          <div
            key={stat.key}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={cn('p-3 rounded-lg', colors.bg)}>
                <Icon className={cn('w-6 h-6', colors.icon)} />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {formatValue(value, stat.type, stat.suffix)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
          </div>
        );
      })}
    </div>
  );
};

export default ${componentName};
`;
}

export interface OrderFiltersLaundryOptions {
  componentName?: string;
}

export function generateOrderFiltersLaundry(options: OrderFiltersLaundryOptions = {}): string {
  const { componentName = 'OrderFiltersLaundry' } = options;

  return `import React from 'react';
import { Search, Filter, Calendar, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterState {
  search: string;
  status: string;
  serviceType: string;
  dateRange: string;
  sortBy: string;
}

interface ${componentName}Props {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  className?: string;
}

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'received', label: 'Received' },
  { value: 'processing', label: 'Processing' },
  { value: 'washing', label: 'Washing' },
  { value: 'drying', label: 'Drying' },
  { value: 'ironing', label: 'Ironing' },
  { value: 'ready', label: 'Ready for Pickup' },
  { value: 'out_for_delivery', label: 'Out for Delivery' },
  { value: 'completed', label: 'Completed' },
];

const serviceTypes = [
  { value: '', label: 'All Services' },
  { value: 'wash_fold', label: 'Wash & Fold' },
  { value: 'dry_clean', label: 'Dry Cleaning' },
  { value: 'iron_only', label: 'Iron Only' },
  { value: 'express', label: 'Express Service' },
  { value: 'alterations', label: 'Alterations' },
];

const dateRanges = [
  { value: '', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
];

const sortOptions = [
  { value: 'date_desc', label: 'Newest First' },
  { value: 'date_asc', label: 'Oldest First' },
  { value: 'status', label: 'By Status' },
  { value: 'customer', label: 'By Customer' },
  { value: 'total_desc', label: 'Highest Amount' },
];

const ${componentName}: React.FC<${componentName}Props> = ({ filters, onFilterChange, className }) => {
  const updateFilter = (key: keyof FilterState, value: string) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFilterChange({
      search: '',
      status: '',
      serviceType: '',
      dateRange: '',
      sortBy: 'date_desc',
    });
  };

  const hasActiveFilters = filters.search || filters.status || filters.serviceType || filters.dateRange;

  return (
    <div className={cn('bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4', className)}>
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search orders, customers..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          />
        </div>

        {/* Status Filter */}
        <select
          value={filters.status}
          onChange={(e) => updateFilter('status', e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>

        {/* Service Type Filter */}
        <select
          value={filters.serviceType}
          onChange={(e) => updateFilter('serviceType', e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
        >
          {serviceTypes.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>

        {/* Date Range Filter */}
        <select
          value={filters.dateRange}
          onChange={(e) => updateFilter('dateRange', e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
        >
          {dateRanges.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>

        {/* Sort */}
        <select
          value={filters.sortBy}
          onChange={(e) => updateFilter('sortBy', e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <X className="w-4 h-4" />
            Clear
          </button>
        )}
      </div>

      {/* Active Filter Tags */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mt-4">
          {filters.status && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm">
              Status: {statusOptions.find(o => o.value === filters.status)?.label}
              <button onClick={() => updateFilter('status', '')} className="hover:text-blue-900">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.serviceType && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-sm">
              Service: {serviceTypes.find(o => o.value === filters.serviceType)?.label}
              <button onClick={() => updateFilter('serviceType', '')} className="hover:text-purple-900">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.dateRange && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm">
              Date: {dateRanges.find(o => o.value === filters.dateRange)?.label}
              <button onClick={() => updateFilter('dateRange', '')} className="hover:text-green-900">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}

export interface OrderTimelineLaundryOptions {
  componentName?: string;
}

export function generateOrderTimelineLaundry(options: OrderTimelineLaundryOptions = {}): string {
  const { componentName = 'OrderTimelineLaundry' } = options;

  return `import React from 'react';
import { Package, RefreshCw, Droplets, Wind, Shirt, CheckCircle, Truck, Home, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimelineStep {
  status: string;
  label: string;
  timestamp?: string;
  completed: boolean;
  current: boolean;
}

interface ${componentName}Props {
  currentStatus: string;
  statusHistory?: Array<{ status: string; timestamp: string }>;
  className?: string;
}

const statusConfig: Record<string, { icon: any; label: string; color: string }> = {
  received: { icon: Package, label: 'Order Received', color: 'blue' },
  processing: { icon: RefreshCw, label: 'Processing', color: 'yellow' },
  washing: { icon: Droplets, label: 'Washing', color: 'cyan' },
  drying: { icon: Wind, label: 'Drying', color: 'orange' },
  ironing: { icon: Shirt, label: 'Ironing', color: 'purple' },
  ready: { icon: CheckCircle, label: 'Ready for Pickup', color: 'green' },
  out_for_delivery: { icon: Truck, label: 'Out for Delivery', color: 'indigo' },
  completed: { icon: Home, label: 'Completed', color: 'emerald' },
};

const statusOrder = ['received', 'processing', 'washing', 'drying', 'ironing', 'ready', 'out_for_delivery', 'completed'];

const ${componentName}: React.FC<${componentName}Props> = ({ currentStatus, statusHistory = [], className }) => {
  const currentIndex = statusOrder.indexOf(currentStatus);

  const getStatusTimestamp = (status: string) => {
    const entry = statusHistory.find(h => h.status === status);
    return entry?.timestamp;
  };

  const colorClasses: Record<string, { bg: string; border: string; text: string }> = {
    blue: { bg: 'bg-blue-500', border: 'border-blue-500', text: 'text-blue-600' },
    yellow: { bg: 'bg-yellow-500', border: 'border-yellow-500', text: 'text-yellow-600' },
    cyan: { bg: 'bg-cyan-500', border: 'border-cyan-500', text: 'text-cyan-600' },
    orange: { bg: 'bg-orange-500', border: 'border-orange-500', text: 'text-orange-600' },
    purple: { bg: 'bg-purple-500', border: 'border-purple-500', text: 'text-purple-600' },
    green: { bg: 'bg-green-500', border: 'border-green-500', text: 'text-green-600' },
    indigo: { bg: 'bg-indigo-500', border: 'border-indigo-500', text: 'text-indigo-600' },
    emerald: { bg: 'bg-emerald-500', border: 'border-emerald-500', text: 'text-emerald-600' },
  };

  return (
    <div className={cn('bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6', className)}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Order Progress</h3>

      <div className="relative">
        {/* Progress line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />
        <div
          className="absolute left-6 top-0 w-0.5 bg-green-500 transition-all duration-500"
          style={{ height: \`\${(currentIndex / (statusOrder.length - 1)) * 100}%\` }}
        />

        <div className="space-y-6">
          {statusOrder.map((status, index) => {
            const config = statusConfig[status];
            const Icon = config.icon;
            const colors = colorClasses[config.color];
            const isCompleted = index < currentIndex;
            const isCurrent = index === currentIndex;
            const timestamp = getStatusTimestamp(status);

            return (
              <div key={status} className="relative flex gap-4">
                <div className={cn(
                  'relative z-10 w-12 h-12 rounded-full border-2 flex items-center justify-center transition-colors',
                  isCompleted || isCurrent
                    ? \`\${colors.bg} border-transparent\`
                    : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'
                )}>
                  <Icon className={cn(
                    'w-5 h-5',
                    isCompleted || isCurrent ? 'text-white' : 'text-gray-400'
                  )} />
                </div>

                <div className="flex-1 pb-2">
                  <div className="flex items-center gap-3">
                    <p className={cn(
                      'font-medium',
                      isCurrent ? colors.text : isCompleted ? 'text-gray-900 dark:text-white' : 'text-gray-400'
                    )}>
                      {config.label}
                    </p>
                    {isCurrent && (
                      <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium rounded-full">
                        Current
                      </span>
                    )}
                  </div>
                  {timestamp && (
                    <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                      <Clock className="w-3 h-3" />
                      {new Date(timestamp).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export interface CustomerProfileLaundryOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateCustomerProfileLaundry(options: CustomerProfileLaundryOptions = {}): string {
  const { componentName = 'CustomerProfileLaundry', endpoint = '/laundry/customers' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Phone, Mail, MapPin, Package, Calendar, DollarSign, ArrowLeft, Edit, Loader2, Clock, Shirt, RefreshCw, Truck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface ${componentName}Props {
  customerId?: string;
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ customerId: propId, className }) => {
  const { id: paramId } = useParams();
  const navigate = useNavigate();
  const customerId = propId || paramId;

  const { data: customer, isLoading } = useQuery({
    queryKey: ['laundry-customer', customerId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${customerId}\`);
      return response?.data || response;
    },
    enabled: !!customerId,
  });

  const { data: orderHistory } = useQuery({
    queryKey: ['laundry-customer-orders', customerId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${customerId}/orders\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !!customerId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Customer not found</p>
      </div>
    );
  }

  const getStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'ready':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'processing':
      case 'washing':
      case 'drying':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(\`/orders/new?customer=\${customerId}\`)}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <Package className="w-4 h-4" />
            New Order
          </button>
          <button
            onClick={() => navigate(\`/customers/\${customerId}/edit\`)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
        </div>
      </div>

      {/* Customer Info Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
            <User className="w-10 h-10 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{customer.name}</h1>
              {customer.subscription && (
                <span className="px-3 py-1 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 text-sm font-medium rounded-full">
                  {customer.subscription} Plan
                </span>
              )}
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Phone className="w-4 h-4" />
                <span>{customer.phone || 'No phone'}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Mail className="w-4 h-4" />
                <span>{customer.email || 'No email'}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <MapPin className="w-4 h-4" />
                <span>{customer.address || 'No address'}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Truck className="w-4 h-4" />
                <span>{customer.delivery_preference || 'Pickup'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{customer.total_orders || 0}</div>
            <div className="text-sm text-gray-500">Total Orders</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">\${(customer.total_spent || 0).toLocaleString()}</div>
            <div className="text-sm text-gray-500">Total Spent</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{customer.loyalty_points || 0}</div>
            <div className="text-sm text-gray-500">Loyalty Points</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {customer.last_order ? new Date(customer.last_order).toLocaleDateString() : 'N/A'}
            </div>
            <div className="text-sm text-gray-500">Last Order</div>
          </div>
        </div>
      </div>

      {/* Preferences */}
      {customer.preferences && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Laundry Preferences</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {customer.preferences.detergent && (
              <div>
                <p className="text-sm text-gray-500">Detergent</p>
                <p className="font-medium text-gray-900 dark:text-white">{customer.preferences.detergent}</p>
              </div>
            )}
            {customer.preferences.fabric_softener && (
              <div>
                <p className="text-sm text-gray-500">Fabric Softener</p>
                <p className="font-medium text-gray-900 dark:text-white">{customer.preferences.fabric_softener}</p>
              </div>
            )}
            {customer.preferences.starch && (
              <div>
                <p className="text-sm text-gray-500">Starch Level</p>
                <p className="font-medium text-gray-900 dark:text-white">{customer.preferences.starch}</p>
              </div>
            )}
            {customer.preferences.fold_type && (
              <div>
                <p className="text-sm text-gray-500">Fold Type</p>
                <p className="font-medium text-gray-900 dark:text-white">{customer.preferences.fold_type}</p>
              </div>
            )}
          </div>
          {customer.preferences.special_instructions && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 mb-2">Special Instructions</p>
              <p className="text-gray-900 dark:text-white">{customer.preferences.special_instructions}</p>
            </div>
          )}
        </div>
      )}

      {/* Order History */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Order History</h2>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">View All</button>
        </div>
        {orderHistory && orderHistory.length > 0 ? (
          <div className="space-y-3">
            {orderHistory.slice(0, 5).map((order: any) => (
              <div
                key={order.id}
                onClick={() => navigate(\`/orders/\${order.id}\`)}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <Shirt className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Order #{order.order_number || order.id?.slice(-6)}
                    </p>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span>{new Date(order.created_at).toLocaleDateString()}</span>
                      <span>{order.item_count || order.items?.length || 0} items</span>
                      <span>{order.weight || 0} lbs</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900 dark:text-white">\${(order.total || 0).toFixed(2)}</p>
                  <span className={cn('text-xs px-2 py-0.5 rounded-full capitalize', getStatusStyle(order.status))}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Package className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
            <p className="text-gray-500">No order history</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}
