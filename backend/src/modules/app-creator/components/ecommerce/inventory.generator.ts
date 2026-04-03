/**
 * Inventory Component Generators for Ecommerce
 *
 * Generates inventory management components:
 * - LowStockAlerts: Alert panel for low stock items
 * - StockLevels: Stock level visualization
 * - InventoryFilters: Filter component for inventory
 * - InventoryReport: Summary report of inventory status
 */

export interface LowStockAlertsOptions {
  componentName?: string;
  threshold?: number;
  endpoint?: string;
  showActions?: boolean;
  showLastUpdated?: boolean;
}

/**
 * Generate a LowStockAlerts component
 */
export function generateLowStockAlerts(options: LowStockAlertsOptions = {}): string {
  const {
    componentName = 'LowStockAlerts',
    threshold = 10,
    endpoint = '/products/low-stock',
    showActions = true,
    showLastUpdated = true,
  } = options;

  return `import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AlertTriangle,
  Package,
  TrendingDown,
  ExternalLink,
  RefreshCw,
  Bell,
  BellOff,
  Loader2,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface LowStockProduct {
  id: string;
  name: string;
  sku?: string;
  image?: string;
  stock_quantity: number;
  reorder_level?: number;
  category?: string;
  updated_at?: string;
}

interface ${componentName}Props {
  className?: string;
  threshold?: number;
  products?: LowStockProduct[];
  onReorder?: (product: LowStockProduct) => void;
  onDismiss?: (productId: string) => void;
  onViewProduct?: (product: LowStockProduct) => void;
  maxItems?: number;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  className,
  threshold = ${threshold},
  products: propProducts,
  onReorder,
  onDismiss,
  onViewProduct,
  maxItems = 10,
}) => {
  const [expanded, setExpanded] = useState(true);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const { data: fetchedProducts = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: ['low-stock-products', threshold],
    queryFn: async () => {
      try {
        const response = await api.get<any>(\`${endpoint}?threshold=\${threshold}\`);
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch low stock products:', err);
        return [];
      }
    },
    enabled: !propProducts || propProducts.length === 0,
    refetchInterval: 60000, // Refresh every minute
  });

  const allProducts = propProducts && propProducts.length > 0 ? propProducts : fetchedProducts;
  const products = allProducts
    .filter((p: LowStockProduct) => !dismissedIds.has(p.id))
    .slice(0, maxItems);

  const handleDismiss = (productId: string) => {
    setDismissedIds(prev => new Set([...prev, productId]));
    if (onDismiss) onDismiss(productId);
  };

  const handleReorder = (product: LowStockProduct) => {
    if (onReorder) {
      onReorder(product);
    } else {
      toast.success(\`Reorder initiated for \${product.name}\`);
    }
  };

  const getStockSeverity = (quantity: number, reorderLevel?: number) => {
    const level = reorderLevel || threshold;
    if (quantity === 0) return 'critical';
    if (quantity <= level * 0.5) return 'high';
    return 'medium';
  };

  const severityColors = {
    critical: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
    high: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800',
    medium: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
  };

  if (isLoading) {
    return (
      <div className={cn("bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6", className)}>
        <div className="flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className={cn("bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6", className)}>
        <div className="flex items-center gap-3 text-green-600 dark:text-green-400">
          <Package className="w-6 h-6" />
          <div>
            <h3 className="font-semibold">All Stock Levels OK</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">No products below threshold of {threshold} units</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2"
        >
          <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Low Stock Alerts
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {products.length} product{products.length !== 1 ? 's' : ''} below threshold
            </p>
          </div>
          {expanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400 ml-2" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400 ml-2" />
          )}
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setNotificationsEnabled(!notificationsEnabled)}
            className={cn(
              "p-2 rounded-lg transition-colors",
              notificationsEnabled
                ? "text-blue-600 bg-blue-50 dark:bg-blue-900/20"
                : "text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            )}
            title={notificationsEnabled ? "Notifications enabled" : "Notifications disabled"}
          >
            {notificationsEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
          </button>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <RefreshCw className={cn("w-4 h-4", isFetching && "animate-spin")} />
          </button>
        </div>
      </div>

      {/* Products List */}
      {expanded && (
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {products.map((product: LowStockProduct) => {
            const severity = getStockSeverity(product.stock_quantity, product.reorder_level);

            return (
              <div
                key={product.id}
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {/* Product Image */}
                  <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 overflow-hidden flex-shrink-0">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-900 dark:text-white truncate">
                        {product.name}
                      </h4>
                      {product.sku && (
                        <span className="text-xs text-gray-400">#{product.sku}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={cn(
                        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border",
                        severityColors[severity]
                      )}>
                        <TrendingDown className="w-3 h-3" />
                        {product.stock_quantity} left
                      </span>
                      {product.category && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {product.category}
                        </span>
                      )}
                      ${showLastUpdated ? `{product.updated_at && (
                        <span className="text-xs text-gray-400">
                          Updated {new Date(product.updated_at).toLocaleDateString()}
                        </span>
                      )}` : ''}
                    </div>
                  </div>

                  ${showActions ? `{/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleReorder(product)}
                      className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    >
                      Reorder
                    </button>
                    {onViewProduct && (
                      <button
                        onClick={() => onViewProduct(product)}
                        className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDismiss(product.id)}
                      className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>` : ''}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer */}
      {expanded && allProducts.length > maxItems && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-center">
          <button className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium">
            View all {allProducts.length} low stock products
          </button>
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}

export interface StockLevelsOptions {
  componentName?: string;
  showPercentage?: boolean;
  showValue?: boolean;
  variant?: 'bar' | 'circle' | 'badge';
}

/**
 * Generate a StockLevels visualization component
 */
export function generateStockLevels(options: StockLevelsOptions = {}): string {
  const {
    componentName = 'StockLevels',
    showPercentage = true,
    showValue = true,
    variant = 'bar',
  } = options;

  return `import React from 'react';
import { Package, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StockItem {
  id: string;
  name: string;
  sku?: string;
  stock_quantity: number;
  max_stock?: number;
  reorder_level?: number;
  status?: 'in_stock' | 'low_stock' | 'out_of_stock';
}

interface ${componentName}Props {
  item?: StockItem;
  quantity?: number;
  maxQuantity?: number;
  reorderLevel?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'bar' | 'circle' | 'badge';
  showLabel?: boolean;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  item,
  quantity: propQuantity,
  maxQuantity: propMaxQuantity = 100,
  reorderLevel: propReorderLevel = 10,
  className,
  size = 'md',
  variant = '${variant}',
  showLabel = true,
}) => {
  const quantity = item?.stock_quantity ?? propQuantity ?? 0;
  const maxQuantity = item?.max_stock ?? propMaxQuantity;
  const reorderLevel = item?.reorder_level ?? propReorderLevel;

  const percentage = Math.min((quantity / maxQuantity) * 100, 100);

  const getStatus = () => {
    if (item?.status) return item.status;
    if (quantity === 0) return 'out_of_stock';
    if (quantity <= reorderLevel) return 'low_stock';
    return 'in_stock';
  };

  const status = getStatus();

  const statusConfig = {
    in_stock: {
      color: 'bg-green-500',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      textColor: 'text-green-700 dark:text-green-400',
      borderColor: 'border-green-200 dark:border-green-800',
      label: 'In Stock',
      icon: TrendingUp,
    },
    low_stock: {
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
      textColor: 'text-yellow-700 dark:text-yellow-400',
      borderColor: 'border-yellow-200 dark:border-yellow-800',
      label: 'Low Stock',
      icon: AlertTriangle,
    },
    out_of_stock: {
      color: 'bg-red-500',
      bgColor: 'bg-red-100 dark:bg-red-900/30',
      textColor: 'text-red-700 dark:text-red-400',
      borderColor: 'border-red-200 dark:border-red-800',
      label: 'Out of Stock',
      icon: TrendingDown,
    },
  };

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  const sizeClasses = {
    sm: { bar: 'h-1.5', circle: 'w-8 h-8', text: 'text-xs' },
    md: { bar: 'h-2', circle: 'w-12 h-12', text: 'text-sm' },
    lg: { bar: 'h-3', circle: 'w-16 h-16', text: 'text-base' },
  };

  if (variant === 'badge') {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border font-medium",
          config.bgColor,
          config.textColor,
          config.borderColor,
          sizeClasses[size].text,
          className
        )}
      >
        <StatusIcon className="w-3.5 h-3.5" />
        {showLabel && <span>{config.label}</span>}
        ${showValue ? `<span className="font-bold">({quantity})</span>` : ''}
      </span>
    );
  }

  if (variant === 'circle') {
    const circumference = 2 * Math.PI * 40;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className={cn("relative inline-flex items-center justify-center", sizeClasses[size].circle, className)}>
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="50%"
            cy="50%"
            r="40%"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-gray-200 dark:text-gray-700"
          />
          <circle
            cx="50%"
            cy="50%"
            r="40%"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={cn(
              status === 'in_stock' && 'text-green-500',
              status === 'low_stock' && 'text-yellow-500',
              status === 'out_of_stock' && 'text-red-500'
            )}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          ${showPercentage ? `<span className={cn("font-bold", sizeClasses[size].text)}>
            {Math.round(percentage)}%
          </span>` : `<span className={cn("font-bold", sizeClasses[size].text)}>
            {quantity}
          </span>`}
        </div>
      </div>
    );
  }

  // Bar variant (default)
  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5">
            <StatusIcon className={cn("w-4 h-4", config.textColor)} />
            <span className={cn("font-medium", config.textColor, sizeClasses[size].text)}>
              {config.label}
            </span>
          </div>
          <span className={cn("text-gray-600 dark:text-gray-400", sizeClasses[size].text)}>
            ${showValue ? `{quantity} / {maxQuantity}` : `{Math.round(percentage)}%`}
          </span>
        </div>
      )}
      <div className={cn("w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden", sizeClasses[size].bar)}>
        <div
          className={cn("h-full rounded-full transition-all duration-500", config.color)}
          style={{ width: \`\${percentage}%\` }}
        />
      </div>
      {!showLabel && (
        <div className={cn("flex items-center justify-between mt-1", sizeClasses[size].text)}>
          ${showPercentage ? `<span className="text-gray-500 dark:text-gray-400">{Math.round(percentage)}%</span>` : ''}
          ${showValue ? `<span className="text-gray-600 dark:text-gray-400">{quantity} units</span>` : ''}
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}

export interface InventoryFiltersOptions {
  componentName?: string;
  showSearch?: boolean;
  showCategories?: boolean;
  showStatus?: boolean;
  showStockRange?: boolean;
  categoriesEndpoint?: string;
}

/**
 * Generate an InventoryFilters component
 */
export function generateInventoryFilters(options: InventoryFiltersOptions = {}): string {
  const {
    componentName = 'InventoryFilters',
    showSearch = true,
    showCategories = true,
    showStatus = true,
    showStockRange = true,
    categoriesEndpoint = '/categories',
  } = options;

  return `import React, { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  X,
  Filter,
  SlidersHorizontal,
  Package,
  AlertTriangle,
  XCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface InventoryFilterValues {
  search: string;
  category: string;
  status: 'all' | 'in_stock' | 'low_stock' | 'out_of_stock';
  stockRange: { min: number; max: number };
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface ${componentName}Props {
  className?: string;
  values?: Partial<InventoryFilterValues>;
  onChange?: (filters: InventoryFilterValues) => void;
  onApply?: (filters: InventoryFilterValues) => void;
  layout?: 'horizontal' | 'vertical';
}

const initialFilters: InventoryFilterValues = {
  search: '',
  category: '',
  status: 'all',
  stockRange: { min: 0, max: 1000 },
  sortBy: 'name',
  sortOrder: 'asc',
};

const ${componentName}: React.FC<${componentName}Props> = ({
  className,
  values: propValues,
  onChange,
  onApply,
  layout = 'horizontal',
}) => {
  const [filters, setFilters] = useState<InventoryFilterValues>(initialFilters);

  const currentFilters = { ...filters, ...propValues };

  ${showCategories ? `// Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['inventory-categories'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${categoriesEndpoint}');
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        return [];
      }
    },
  });` : ''}

  const updateFilter = useCallback(<K extends keyof InventoryFilterValues>(key: K, value: InventoryFilterValues[K]) => {
    const updated = { ...currentFilters, [key]: value };
    setFilters(updated);
    if (onChange) onChange(updated);
  }, [currentFilters, onChange]);

  const clearAll = useCallback(() => {
    setFilters(initialFilters);
    if (onChange) onChange(initialFilters);
  }, [onChange]);

  const handleApply = useCallback(() => {
    if (onApply) onApply(currentFilters);
  }, [currentFilters, onApply]);

  const hasActiveFilters =
    currentFilters.search ||
    currentFilters.category ||
    currentFilters.status !== 'all' ||
    currentFilters.stockRange.min > 0 ||
    currentFilters.stockRange.max < 1000;

  const statusOptions = [
    { value: 'all', label: 'All Status', icon: Filter },
    { value: 'in_stock', label: 'In Stock', icon: Package },
    { value: 'low_stock', label: 'Low Stock', icon: AlertTriangle },
    { value: 'out_of_stock', label: 'Out of Stock', icon: XCircle },
  ];

  const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'stock_quantity', label: 'Stock Level' },
    { value: 'updated_at', label: 'Last Updated' },
    { value: 'sku', label: 'SKU' },
  ];

  const isHorizontal = layout === 'horizontal';

  return (
    <div className={cn(
      "bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4",
      className
    )}>
      <div className={cn(
        "gap-4",
        isHorizontal ? "flex flex-wrap items-end" : "space-y-4"
      )}>
        ${showSearch ? `{/* Search */}
        <div className={cn(isHorizontal ? "flex-1 min-w-[200px]" : "w-full")}>
          {!isHorizontal && (
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search
            </label>
          )}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={currentFilters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              placeholder="Search products, SKU..."
              className="w-full px-3 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-blue-500"
            />
            {currentFilters.search && (
              <button
                onClick={() => updateFilter('search', '')}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
        </div>` : ''}

        ${showCategories ? `{/* Category */}
        <div className={cn(isHorizontal ? "min-w-[150px]" : "w-full")}>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Category
          </label>
          <select
            value={currentFilters.category}
            onChange={(e) => updateFilter('category', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            {categories.map((cat: any) => (
              <option key={cat.id || cat._id} value={cat.id || cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>` : ''}

        ${showStatus ? `{/* Status */}
        <div className={cn(isHorizontal ? "min-w-[150px]" : "w-full")}>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Status
          </label>
          <div className={cn(isHorizontal ? "" : "flex flex-wrap gap-2")}>
            {isHorizontal ? (
              <select
                value={currentFilters.status}
                onChange={(e) => updateFilter('status', e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-blue-500"
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            ) : (
              statusOptions.map((opt) => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.value}
                    onClick={() => updateFilter('status', opt.value as any)}
                    className={cn(
                      "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors",
                      currentFilters.status === opt.value
                        ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                        : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {opt.label}
                  </button>
                );
              })
            )}
          </div>
        </div>` : ''}

        ${showStockRange ? `{/* Stock Range */}
        <div className={cn(isHorizontal ? "min-w-[200px]" : "w-full")}>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Stock Range
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={currentFilters.stockRange.min}
              onChange={(e) => updateFilter('stockRange', {
                ...currentFilters.stockRange,
                min: Number(e.target.value)
              })}
              placeholder="Min"
              min={0}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-gray-400">-</span>
            <input
              type="number"
              value={currentFilters.stockRange.max}
              onChange={(e) => updateFilter('stockRange', {
                ...currentFilters.stockRange,
                max: Number(e.target.value)
              })}
              placeholder="Max"
              min={0}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>` : ''}

        {/* Sort */}
        <div className={cn(isHorizontal ? "min-w-[180px]" : "w-full")}>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Sort By
          </label>
          <div className="flex gap-2">
            <select
              value={currentFilters.sortBy}
              onChange={(e) => updateFilter('sortBy', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-blue-500"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <button
              onClick={() => updateFilter('sortOrder', currentFilters.sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              title={currentFilters.sortOrder === 'asc' ? 'Ascending' : 'Descending'}
            >
              <SlidersHorizontal className={cn(
                "w-4 h-4 transition-transform",
                currentFilters.sortOrder === 'desc' && "rotate-180"
              )} />
            </button>
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
        {onApply && (
          <button
            onClick={handleApply}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Filter className="w-4 h-4" />
            Apply Filters
          </button>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export interface InventoryReportOptions {
  componentName?: string;
  showChart?: boolean;
  showTopProducts?: boolean;
  showCategories?: boolean;
  endpoint?: string;
}

/**
 * Generate an InventoryReport summary component
 */
export function generateInventoryReport(options: InventoryReportOptions = {}): string {
  const {
    componentName = 'InventoryReport',
    showChart = true,
    showTopProducts = true,
    showCategories = true,
    endpoint = '/inventory/report',
  } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Package,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  DollarSign,
  BarChart3,
  Loader2,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface InventoryStats {
  total_products: number;
  total_value: number;
  in_stock_count: number;
  low_stock_count: number;
  out_of_stock_count: number;
  average_stock_level: number;
  change_from_last_month?: number;
  top_products?: Array<{
    id: string;
    name: string;
    stock_quantity: number;
    value: number;
  }>;
  categories?: Array<{
    id: string;
    name: string;
    product_count: number;
    total_stock: number;
  }>;
}

interface ${componentName}Props {
  className?: string;
  stats?: InventoryStats;
  compact?: boolean;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  className,
  stats: propStats,
  compact = false,
}) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['inventory-report'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${endpoint}');
        return response?.data || response;
      } catch (err) {
        console.error('Failed to fetch inventory report:', err);
        return null;
      }
    },
    enabled: !propStats,
    initialData: propStats,
  });

  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center py-12", className)}>
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className={cn("text-center py-12", className)}>
        <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">No inventory data</h3>
      </div>
    );
  }

  const percentChange = stats.change_from_last_month || 0;
  const isPositive = percentChange >= 0;

  const StatCard = ({
    icon: Icon,
    label,
    value,
    subValue,
    color
  }: {
    icon: React.ElementType;
    label: string;
    value: string | number;
    subValue?: string;
    color: string;
  }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center gap-3">
        <div className={cn("p-2 rounded-lg", color)}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          {subValue && (
            <p className="text-xs text-gray-400 mt-0.5">{subValue}</p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className={cn("space-y-6", className)}>
      {/* Summary Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Inventory Overview</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Current stock levels and value
          </p>
        </div>
        <div className={cn(
          "flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium",
          isPositive
            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
            : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
        )}>
          {isPositive ? (
            <ArrowUpRight className="w-4 h-4" />
          ) : (
            <ArrowDownRight className="w-4 h-4" />
          )}
          {Math.abs(percentChange)}% from last month
        </div>
      </div>

      {/* Stats Grid */}
      <div className={cn(
        "grid gap-4",
        compact ? "grid-cols-2 md:grid-cols-4" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
      )}>
        <StatCard
          icon={Package}
          label="Total Products"
          value={stats.total_products?.toLocaleString() || 0}
          color="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
        />
        <StatCard
          icon={DollarSign}
          label="Total Value"
          value={\`$\${(stats.total_value || 0).toLocaleString()}\`}
          color="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
        />
        <StatCard
          icon={AlertTriangle}
          label="Low Stock"
          value={stats.low_stock_count || 0}
          subValue="Items need reorder"
          color="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400"
        />
        <StatCard
          icon={TrendingDown}
          label="Out of Stock"
          value={stats.out_of_stock_count || 0}
          subValue="Items unavailable"
          color="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
        />
      </div>

      ${showChart ? `{/* Stock Distribution */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Stock Distribution</h3>
        <div className="flex items-center gap-4">
          <div className="flex-1 h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex">
            <div
              className="h-full bg-green-500"
              style={{
                width: \`\${(stats.in_stock_count / stats.total_products) * 100}%\`
              }}
            />
            <div
              className="h-full bg-yellow-500"
              style={{
                width: \`\${(stats.low_stock_count / stats.total_products) * 100}%\`
              }}
            />
            <div
              className="h-full bg-red-500"
              style={{
                width: \`\${(stats.out_of_stock_count / stats.total_products) * 100}%\`
              }}
            />
          </div>
        </div>
        <div className="flex items-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              In Stock ({stats.in_stock_count})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Low Stock ({stats.low_stock_count})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Out of Stock ({stats.out_of_stock_count})
            </span>
          </div>
        </div>
      </div>` : ''}

      <div className={cn("grid gap-6", showTopProducts && showCategories ? "md:grid-cols-2" : "")}>
        ${showTopProducts ? `{/* Top Products */}
        {stats.top_products && stats.top_products.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Top Stocked Products</h3>
            <div className="space-y-3">
              {stats.top_products.slice(0, 5).map((product, index) => (
                <div key={product.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-400">
                      {index + 1}
                    </span>
                    <span className="text-gray-900 dark:text-white">{product.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900 dark:text-white">{product.stock_quantity} units</p>
                    <p className="text-xs text-gray-500">\${product.value.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}` : ''}

        ${showCategories ? `{/* Categories */}
        {stats.categories && stats.categories.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Stock by Category</h3>
            <div className="space-y-3">
              {stats.categories.slice(0, 5).map((category) => (
                <div key={category.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-900 dark:text-white">{category.name}</span>
                    <span className="text-sm text-gray-500">{category.total_stock} units</span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{
                        width: \`\${(category.total_stock / (stats.total_products || 1)) * 100}%\`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}` : ''}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}
