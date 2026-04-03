/**
 * Jeweler Generator
 *
 * Generates jeweler/jewelry business related components:
 * - JewelerStats: Dashboard stats for jewelry business
 */

import { pascalCase, snakeCase } from 'change-case';

export interface JewelerStatsOptions {
  componentName?: string;
  endpoint?: string;
  queryKey?: string;
  showInventory?: boolean;
  showSales?: boolean;
  showOrders?: boolean;
  showCustomers?: boolean;
  showRepairs?: boolean;
  showAppraisals?: boolean;
}

/**
 * Generate a JewelerStats component
 */
export function generateJewelerStats(options: JewelerStatsOptions = {}): string {
  const {
    componentName = 'JewelerStats',
    endpoint = '/jeweler/stats',
    queryKey = 'jeweler-stats',
    showInventory = true,
    showSales = true,
    showOrders = true,
    showCustomers = true,
    showRepairs = true,
    showAppraisals = true,
  } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Gem,
  DollarSign,
  ShoppingBag,
  Users,
  Wrench,
  FileText,
  TrendingUp,
  TrendingDown,
  Package,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface JewelerStatsData {
  // Inventory
  totalInventoryItems?: number;
  totalInventoryValue?: number;
  lowStockItems?: number;
  newArrivals?: number;

  // Sales
  totalSales?: number;
  salesChange?: number;
  todaySales?: number;
  monthlyRevenue?: number;
  revenueChange?: number;

  // Orders
  totalOrders?: number;
  pendingOrders?: number;
  completedOrders?: number;
  customOrders?: number;

  // Customers
  totalCustomers?: number;
  newCustomers?: number;
  returningCustomers?: number;
  vipCustomers?: number;

  // Repairs
  activeRepairs?: number;
  completedRepairs?: number;
  pendingPickup?: number;

  // Appraisals
  pendingAppraisals?: number;
  completedAppraisals?: number;
}

interface ${componentName}Props {
  stats?: JewelerStatsData;
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  stats: propStats,
  className,
}) => {
  const navigate = useNavigate();

  const { data: fetchedStats, isLoading } = useQuery({
    queryKey: ['${queryKey}'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${endpoint}');
        return response?.data || response || {};
      } catch (err) {
        console.error('Failed to fetch jeweler stats:', err);
        return {};
      }
    },
    enabled: !propStats,
  });

  const stats = propStats || fetchedStats || {};

  const formatCurrency = (value?: number) => {
    if (value === undefined) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value?: number) => {
    if (value === undefined) return '0';
    return value.toLocaleString();
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
    <div className={cn('space-y-6', className)}>
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        ${showInventory ? `{/* Inventory Card */}
        <div
          onClick={() => navigate('/inventory')}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Gem className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {formatNumber(stats.totalInventoryItems)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Total Inventory Items
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="text-purple-600 dark:text-purple-400">
              {formatCurrency(stats.totalInventoryValue)} value
            </span>
            {stats.lowStockItems !== undefined && stats.lowStockItems > 0 && (
              <span className="flex items-center gap-1 text-orange-600">
                <AlertCircle className="w-3 h-3" />
                {stats.lowStockItems} low stock
              </span>
            )}
          </div>
        </div>` : ''}

        ${showSales ? `{/* Sales Card */}
        <div
          onClick={() => navigate('/sales')}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            {stats.revenueChange !== undefined && (
              <div className={cn(
                'flex items-center gap-1 text-sm font-medium',
                stats.revenueChange >= 0 ? 'text-green-600' : 'text-red-600'
              )}>
                {stats.revenueChange >= 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                {Math.abs(stats.revenueChange)}%
              </div>
            )}
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {formatCurrency(stats.monthlyRevenue)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Monthly Revenue
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="text-green-600 dark:text-green-400">
              {formatCurrency(stats.todaySales)} today
            </span>
            <span className="text-gray-500">
              {formatNumber(stats.totalSales)} total sales
            </span>
          </div>
        </div>` : ''}

        ${showOrders ? `{/* Orders Card */}
        <div
          onClick={() => navigate('/orders')}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <ShoppingBag className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {formatNumber(stats.pendingOrders)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Pending Orders
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1 text-blue-600">
              <Package className="w-3 h-3" />
              {formatNumber(stats.customOrders)} custom
            </span>
            <span className="flex items-center gap-1 text-green-600">
              <CheckCircle className="w-3 h-3" />
              {formatNumber(stats.completedOrders)} completed
            </span>
          </div>
        </div>` : ''}

        ${showCustomers ? `{/* Customers Card */}
        <div
          onClick={() => navigate('/customers')}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Users className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-orange-600 transition-colors" />
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {formatNumber(stats.totalCustomers)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Total Customers
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="text-green-600">
              +{formatNumber(stats.newCustomers)} new
            </span>
            <span className="flex items-center gap-1 text-yellow-600">
              <Gem className="w-3 h-3" />
              {formatNumber(stats.vipCustomers)} VIP
            </span>
          </div>
        </div>` : ''}
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        ${showRepairs ? `{/* Repairs Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Repairs</h3>
              </div>
              <button
                onClick={() => navigate('/repairs')}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                View All
              </button>
            </div>
          </div>
          <div className="p-4 grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full mx-auto mb-2">
                <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatNumber(stats.activeRepairs)}
              </div>
              <div className="text-xs text-gray-500">Active</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full mx-auto mb-2">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatNumber(stats.completedRepairs)}
              </div>
              <div className="text-xs text-gray-500">Completed</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full mx-auto mb-2">
                <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatNumber(stats.pendingPickup)}
              </div>
              <div className="text-xs text-gray-500">Pending Pickup</div>
            </div>
          </div>
        </div>` : ''}

        ${showAppraisals ? `{/* Appraisals Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Appraisals</h3>
              </div>
              <button
                onClick={() => navigate('/appraisals')}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                View All
              </button>
            </div>
          </div>
          <div className="p-4 grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg">
              <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                {formatNumber(stats.pendingAppraisals)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Pending</div>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/10 rounded-lg">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {formatNumber(stats.completedAppraisals)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Completed</div>
            </div>
          </div>
        </div>` : ''}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

/**
 * Generate jeweler components for a specific domain
 */
export function generateJewelerComponents(domain: string = 'jeweler'): { stats: string } {
  const pascalDomain = pascalCase(domain);

  return {
    stats: generateJewelerStats({
      componentName: `${pascalDomain}Stats`,
    }),
  };
}
