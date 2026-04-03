/**
 * Nursery/Garden Center Component Generators
 *
 * Generates nursery-specific components:
 * - NurseryStats: Dashboard stats for nursery operations
 * - PlantListFeatured: Featured plants list
 * - OrderListRecentNursery: Recent orders list for nursery
 */

export interface NurseryOptions {
  componentName?: string;
  endpoint?: string;
}

/**
 * Generate nursery stats dashboard component
 */
export function generateNurseryStats(options: NurseryOptions = {}): string {
  const { componentName = 'NurseryStats', endpoint = '/nursery/stats' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, TrendingUp, TrendingDown, Leaf, ShoppingBag, DollarSign, Package, Droplets, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface ${componentName}Props {
  className?: string;
}

const statsConfig = [
  { key: 'todaySales', label: "Today's Sales", icon: 'DollarSign', color: 'green', type: 'currency' },
  { key: 'todayOrders', label: "Today's Orders", icon: 'ShoppingBag', color: 'blue', type: 'number' },
  { key: 'plantsInStock', label: 'Plants in Stock', icon: 'Leaf', color: 'emerald', type: 'number' },
  { key: 'lowStockItems', label: 'Low Stock Items', icon: 'Package', color: 'yellow', type: 'number' },
  { key: 'plantsNeedingWater', label: 'Need Watering', icon: 'Droplets', color: 'cyan', type: 'number' },
  { key: 'greenhouseTemp', label: 'Greenhouse Temp', icon: 'Sun', color: 'orange', type: 'temp' },
];

const colorClasses: Record<string, { bg: string; icon: string }> = {
  blue: { bg: 'bg-blue-100 dark:bg-blue-900/30', icon: 'text-blue-600 dark:text-blue-400' },
  green: { bg: 'bg-green-100 dark:bg-green-900/30', icon: 'text-green-600 dark:text-green-400' },
  yellow: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', icon: 'text-yellow-600 dark:text-yellow-400' },
  emerald: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', icon: 'text-emerald-600 dark:text-emerald-400' },
  cyan: { bg: 'bg-cyan-100 dark:bg-cyan-900/30', icon: 'text-cyan-600 dark:text-cyan-400' },
  orange: { bg: 'bg-orange-100 dark:bg-orange-900/30', icon: 'text-orange-600 dark:text-orange-400' },
};

const iconMap: Record<string, React.FC<any>> = {
  DollarSign,
  ShoppingBag,
  Leaf,
  Package,
  Droplets,
  Sun,
};

const ${componentName}: React.FC<${componentName}Props> = ({ className }) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['nursery-stats'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${endpoint}');
        return response?.data || response || {};
      } catch (err) {
        console.error('Failed to fetch nursery stats:', err);
        return {};
      }
    },
  });

  const formatValue = (value: any, type: string) => {
    if (value === undefined || value === null) return '-';
    if (type === 'currency') return '$' + Number(value).toLocaleString();
    if (type === 'percentage') return value + '%';
    if (type === 'temp') return value + '\u00B0F';
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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Nursery Dashboard</h2>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Leaf className="w-4 h-4 text-green-600" />
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statsConfig.map((stat) => {
          const Icon = iconMap[stat.icon] || Loader2;
          const colors = colorClasses[stat.color] || colorClasses.green;
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
                {change !== undefined && stat.type !== 'temp' && (
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
 * Generate featured plants list component
 */
export function generatePlantListFeatured(options: NurseryOptions = {}): string {
  const { componentName = 'PlantListFeatured', endpoint = '/nursery/plants/featured' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Loader2, Leaf, Sun, Droplets, ChevronRight, Tag, Star, Thermometer } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface ${componentName}Props {
  className?: string;
  limit?: number;
}

const ${componentName}: React.FC<${componentName}Props> = ({ className, limit = 8 }) => {
  const { data: plants = [], isLoading } = useQuery({
    queryKey: ['nursery-featured-plants', limit],
    queryFn: async () => {
      try {
        const response = await api.get<any>(\`${endpoint}?limit=\${limit}\`);
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch featured plants:', err);
        return [];
      }
    },
  });

  const getLightLabel = (light: string) => {
    const labels: Record<string, { text: string; color: string }> = {
      'full_sun': { text: 'Full Sun', color: 'text-yellow-600' },
      'partial_sun': { text: 'Partial Sun', color: 'text-orange-500' },
      'partial_shade': { text: 'Partial Shade', color: 'text-blue-500' },
      'full_shade': { text: 'Full Shade', color: 'text-gray-500' },
    };
    return labels[light?.toLowerCase()] || { text: light || 'Various', color: 'text-gray-500' };
  };

  const getWaterLabel = (water: string) => {
    const labels: Record<string, { text: string; color: string }> = {
      'low': { text: 'Low Water', color: 'text-amber-600' },
      'moderate': { text: 'Moderate', color: 'text-blue-500' },
      'high': { text: 'High Water', color: 'text-cyan-600' },
    };
    return labels[water?.toLowerCase()] || { text: water || 'Moderate', color: 'text-blue-500' };
  };

  if (isLoading) {
    return (
      <div className={cn('flex justify-center py-12', className)}>
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Featured Plants</h2>
        <Link to="/nursery/plants" className="text-sm text-green-600 hover:text-green-700 flex items-center gap-1">
          View All <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {plants.length > 0 ? (
          plants.map((plant: any) => {
            const light = getLightLabel(plant.light_requirement || plant.sunlight);
            const water = getWaterLabel(plant.water_requirement || plant.watering);

            return (
              <Link
                key={plant.id}
                to={\`/nursery/plants/\${plant.id}\`}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow group"
              >
                <div className="aspect-square bg-gray-100 dark:bg-gray-700 relative overflow-hidden">
                  {plant.image_url ? (
                    <img
                      src={plant.image_url}
                      alt={plant.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Leaf className="w-12 h-12 text-green-300" />
                    </div>
                  )}
                  {plant.is_new && (
                    <span className="absolute top-2 left-2 px-2 py-1 bg-green-600 text-white text-xs font-medium rounded">
                      New
                    </span>
                  )}
                  {plant.on_sale && (
                    <span className="absolute top-2 right-2 px-2 py-1 bg-red-600 text-white text-xs font-medium rounded">
                      Sale
                    </span>
                  )}
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{plant.name}</h3>
                      {plant.botanical_name && (
                        <p className="text-xs text-gray-500 italic">{plant.botanical_name}</p>
                      )}
                    </div>
                    {plant.rating && (
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm">{plant.rating}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 mb-3 text-xs">
                    <span className={\`flex items-center gap-1 \${light.color}\`}>
                      <Sun className="w-3 h-3" />
                      {light.text}
                    </span>
                    <span className={\`flex items-center gap-1 \${water.color}\`}>
                      <Droplets className="w-3 h-3" />
                      {water.text}
                    </span>
                  </div>

                  {plant.hardiness_zone && (
                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                      <Thermometer className="w-3 h-3" />
                      Zone {plant.hardiness_zone}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {plant.sale_price && plant.sale_price < plant.price ? (
                        <>
                          <span className="text-lg font-bold text-green-600">\${plant.sale_price.toFixed(2)}</span>
                          <span className="text-sm text-gray-400 line-through">\${plant.price.toFixed(2)}</span>
                        </>
                      ) : (
                        <span className="text-lg font-bold text-green-600">\${(plant.price || 0).toFixed(2)}</span>
                      )}
                    </div>
                    {plant.stock !== undefined && plant.stock <= 5 && plant.stock > 0 && (
                      <span className="text-xs text-orange-600">Only {plant.stock} left</span>
                    )}
                    {plant.stock === 0 && (
                      <span className="text-xs text-red-600">Out of stock</span>
                    )}
                  </div>

                  {plant.sizes && plant.sizes.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {plant.sizes.slice(0, 3).map((size: string) => (
                        <span key={size} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-xs rounded">
                          {size}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            );
          })
        ) : (
          <div className="col-span-full text-center py-12 text-gray-500">
            <Leaf className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            No featured plants available
          </div>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

/**
 * Generate recent nursery orders list component
 */
export function generateOrderListRecentNursery(options: NurseryOptions = {}): string {
  const { componentName = 'OrderListRecentNursery', endpoint = '/nursery/orders' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Loader2, Clock, ChevronRight, Leaf, Package, Truck, CheckCircle, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface ${componentName}Props {
  className?: string;
  limit?: number;
}

const ${componentName}: React.FC<${componentName}Props> = ({ className, limit = 10 }) => {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['nursery-orders-recent', limit],
    queryFn: async () => {
      try {
        const response = await api.get<any>(\`${endpoint}?limit=\${limit}&sort=created_at:desc\`);
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
        return [];
      }
    },
    refetchInterval: 30000,
  });

  const statusConfig: Record<string, { color: string; icon: React.FC<any>; label: string }> = {
    pending: { color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', icon: Clock, label: 'Pending' },
    processing: { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: Package, label: 'Processing' },
    ready: { color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', icon: Leaf, label: 'Ready for Pickup' },
    shipped: { color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', icon: Truck, label: 'Shipped' },
    delivered: { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle, label: 'Delivered' },
    picked_up: { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle, label: 'Picked Up' },
    cancelled: { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: Clock, label: 'Cancelled' },
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
          <Leaf className="w-5 h-5 text-green-600" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Recent Orders</h3>
        </div>
        <Link to="/nursery/orders" className="text-sm text-green-600 hover:text-green-700">
          View All
        </Link>
      </div>

      {orders.length > 0 ? (
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {orders.map((order: any) => {
            const status = statusConfig[order.status?.toLowerCase()] || statusConfig.pending;
            const StatusIcon = status.icon;

            return (
              <Link
                key={order.id}
                to={\`/nursery/orders/\${order.id}\`}
                className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <Leaf className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900 dark:text-white">
                        Order #{order.order_number || order.id?.slice(-8)}
                      </p>
                      <span className={\`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium \${status.color}\`}>
                        <StatusIcon className="w-3 h-3" />
                        {status.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {order.customer_name || 'Guest'} - {order.items_count || order.items?.length || 0} plants
                    </p>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(order.created_at).toLocaleDateString()}
                      </span>
                      {order.fulfillment_type && (
                        <span className="flex items-center gap-1">
                          {order.fulfillment_type === 'delivery' ? <Truck className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                          {order.fulfillment_type === 'delivery' ? 'Delivery' : 'Pickup'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-medium text-green-600">\${(order.total || 0).toFixed(2)}</p>
                    {order.plants_summary && (
                      <p className="text-xs text-gray-500 max-w-[150px] truncate">{order.plants_summary}</p>
                    )}
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="p-8 text-center text-gray-500">
          <Leaf className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          No recent orders
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}
