/**
 * Bakery Component Generators
 *
 * Generates bakery-specific components:
 * - BakeryStats: Dashboard stats for bakery operations
 * - OrderFiltersBakery: Order filtering for bakery orders
 * - CustomerProfileBakery: Customer profile view for bakery customers
 */

export interface BakeryOptions {
  componentName?: string;
  endpoint?: string;
}

/**
 * Generate bakery stats dashboard component
 */
export function generateBakeryStats(options: BakeryOptions = {}): string {
  const { componentName = 'BakeryStats', endpoint = '/bakery/stats' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, TrendingUp, TrendingDown, Cake, ShoppingBag, DollarSign, Users, Clock, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface ${componentName}Props {
  className?: string;
}

const statsConfig = [
  { key: 'todayOrders', label: "Today's Orders", icon: 'ShoppingBag', color: 'blue', type: 'number' },
  { key: 'todayRevenue', label: "Today's Revenue", icon: 'DollarSign', color: 'green', type: 'currency' },
  { key: 'pendingOrders', label: 'Pending Orders', icon: 'Clock', color: 'yellow', type: 'number' },
  { key: 'activeCustomers', label: 'Active Customers', icon: 'Users', color: 'purple', type: 'number' },
  { key: 'itemsBaked', label: 'Items Baked Today', icon: 'Cake', color: 'orange', type: 'number' },
  { key: 'lowStockItems', label: 'Low Stock Items', icon: 'Package', color: 'red', type: 'number' },
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
  ShoppingBag,
  DollarSign,
  Clock,
  Users,
  Cake,
  Package,
};

const ${componentName}: React.FC<${componentName}Props> = ({ className }) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['bakery-stats'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${endpoint}');
        return response?.data || response || {};
      } catch (err) {
        console.error('Failed to fetch bakery stats:', err);
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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Bakery Dashboard</h2>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          Last updated: {new Date().toLocaleTimeString()}
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
 * Generate bakery order filters component
 */
export function generateOrderFiltersBakery(options: BakeryOptions = {}): string {
  const { componentName = 'OrderFiltersBakery' } = options;

  return `import React, { useState, useCallback } from 'react';
import { Search, X, Filter, ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterValues {
  search: string;
  status: string;
  orderType: string;
  dateRange: { start: string; end: string };
  category: string;
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
  dateRange: { start: '', end: '' },
  category: '',
};

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'preparing', label: 'Preparing' },
  { value: 'ready', label: 'Ready for Pickup' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const orderTypeOptions = [
  { value: 'custom', label: 'Custom Order' },
  { value: 'standard', label: 'Standard Order' },
  { value: 'wholesale', label: 'Wholesale' },
  { value: 'catering', label: 'Catering' },
];

const categoryOptions = [
  { value: 'bread', label: 'Bread' },
  { value: 'cakes', label: 'Cakes' },
  { value: 'pastries', label: 'Pastries' },
  { value: 'cookies', label: 'Cookies' },
  { value: 'specialty', label: 'Specialty Items' },
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
    currentFilters.category || currentFilters.dateRange?.start || currentFilters.dateRange?.end;

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
            <span className="px-2 py-0.5 text-xs bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 rounded-full">
              Active
            </span>
          )}
        </div>
        {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>

      {expanded && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search Orders</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={currentFilters.search}
                  onChange={(e) => updateFilter('search', e.target.value)}
                  placeholder="Search by order #, customer name..."
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

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
              <select
                value={currentFilters.category}
                onChange={(e) => updateFilter('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              >
                <option value="">All Categories</option>
                {categoryOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Date Range */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date Range</label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={currentFilters.dateRange?.start || ''}
                    onChange={(e) => updateFilter('dateRange', { ...currentFilters.dateRange, start: e.target.value })}
                    className="w-full px-3 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <span className="text-gray-500">to</span>
                <div className="relative flex-1">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={currentFilters.dateRange?.end || ''}
                    onChange={(e) => updateFilter('dateRange', { ...currentFilters.dateRange, end: e.target.value })}
                    className="w-full px-3 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  />
                </div>
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
                className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
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
 * Generate bakery customer profile component
 */
export function generateCustomerProfileBakery(options: BakeryOptions = {}): string {
  const { componentName = 'CustomerProfileBakery', endpoint = '/bakery/customers' } = options;

  return `import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Mail, Phone, MapPin, Calendar, ArrowLeft, Edit, Cake, ShoppingBag, DollarSign, Star, Clock, Heart } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: customer, isLoading } = useQuery({
    queryKey: ['bakery-customer', id],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + id);
      return response?.data || response;
    },
  });

  const { data: orders } = useQuery({
    queryKey: ['bakery-customer-orders', id],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + id + '/orders');
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

  const recentOrders = orders?.slice(0, 5) || [];

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
              <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center">
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
                {customer.membership_level && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className={\`px-2 py-1 rounded-full text-xs font-medium \${
                      customer.membership_level === 'gold' ? 'bg-yellow-100 text-yellow-700' :
                      customer.membership_level === 'silver' ? 'bg-gray-100 text-gray-700' :
                      'bg-orange-100 text-orange-700'
                    }\`}>
                      {customer.membership_level.charAt(0).toUpperCase() + customer.membership_level.slice(1)} Member
                    </span>
                    {customer.is_vip && (
                      <span className="flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                        <Star className="w-3 h-3 fill-current" /> VIP
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
            <Link
              to={\`${endpoint}/\${id}/edit\`}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2"
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
              <ShoppingBag className="w-5 h-5 text-blue-600" />
              {customer.total_orders || 0}
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
            <div className="flex items-center justify-center gap-1 text-2xl font-bold text-orange-600">
              <Cake className="w-5 h-5" />
              {customer.favorite_items_count || 0}
            </div>
            <p className="text-sm text-gray-500">Favorites</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-2xl font-bold text-purple-600">
              <Heart className="w-5 h-5" />
              {customer.loyalty_points || 0}
            </div>
            <p className="text-sm text-gray-500">Loyalty Points</p>
          </div>
        </div>

        {/* Contact Information */}
        <div className="p-6 grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Contact Information</h3>
            {customer.email && (
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <Mail className="w-5 h-5 text-gray-400" />
                <a href={\`mailto:\${customer.email}\`} className="hover:text-orange-600">{customer.email}</a>
              </div>
            )}
            {customer.phone && (
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <Phone className="w-5 h-5 text-gray-400" />
                <a href={\`tel:\${customer.phone}\`} className="hover:text-orange-600">{customer.phone}</a>
              </div>
            )}
            {(customer.address || customer.city) && (
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <MapPin className="w-5 h-5 text-gray-400" />
                <span>{[customer.address, customer.city, customer.zip_code].filter(Boolean).join(', ')}</span>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Preferences</h3>
            {customer.dietary_restrictions && customer.dietary_restrictions.length > 0 && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Dietary Restrictions</p>
                <div className="flex flex-wrap gap-2">
                  {customer.dietary_restrictions.map((restriction: string) => (
                    <span key={restriction} className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                      {restriction}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {customer.favorite_products && customer.favorite_products.length > 0 && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Favorite Products</p>
                <div className="flex flex-wrap gap-2">
                  {customer.favorite_products.map((product: string) => (
                    <span key={product} className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs">
                      {product}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {customer.created_at && (
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <Calendar className="w-5 h-5 text-gray-400" />
                <span>Customer since {new Date(customer.created_at).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white">Recent Orders</h3>
          <Link to={\`${endpoint}/\${id}/orders\`} className="text-sm text-orange-600 hover:text-orange-700">
            View All
          </Link>
        </div>
        {recentOrders.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {recentOrders.map((order: any) => (
              <div key={order.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Order #{order.order_number || order.id}</p>
                  <p className="text-sm text-gray-500 flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-green-600">\${order.total?.toFixed(2)}</p>
                  <span className={\`px-2 py-1 rounded-full text-xs font-medium \${
                    order.status === 'completed' ? 'bg-green-100 text-green-700' :
                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }\`}>
                    {order.status}
                  </span>
                </div>
              </div>
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
