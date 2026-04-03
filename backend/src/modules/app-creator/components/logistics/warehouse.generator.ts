/**
 * Warehouse Component Generators
 *
 * Generates warehouse management and inventory components.
 */

export interface WarehouseOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateWarehouseStats(options: WarehouseOptions = {}): string {
  const { componentName = 'WarehouseStats', endpoint = '/warehouse' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Package, Truck, AlertTriangle, TrendingUp, TrendingDown, Clock, CheckCircle, BarChart3 } from 'lucide-react';
import { api } from '@/lib/api';

interface Stats {
  total_inventory: number;
  inventory_change: number;
  pending_orders: number;
  orders_change: number;
  low_stock_items: number;
  receiving_today: number;
  shipping_today: number;
  utilization_percent: number;
}

interface ${componentName}Props {
  warehouseId?: string;
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  warehouseId,
  className = '',
}) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['warehouse-stats', warehouseId],
    queryFn: async () => {
      const url = warehouseId ? \`${endpoint}/\${warehouseId}/stats\` : '${endpoint}/stats';
      const response = await api.get<any>(url);
      return response?.data || response;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Inventory',
      value: stats?.total_inventory?.toLocaleString() || '0',
      change: stats?.inventory_change || 0,
      icon: Package,
      color: 'bg-blue-500',
    },
    {
      label: 'Pending Orders',
      value: stats?.pending_orders?.toLocaleString() || '0',
      change: stats?.orders_change || 0,
      icon: Clock,
      color: 'bg-orange-500',
    },
    {
      label: 'Low Stock Items',
      value: stats?.low_stock_items?.toLocaleString() || '0',
      change: null,
      icon: AlertTriangle,
      color: 'bg-red-500',
      alert: (stats?.low_stock_items || 0) > 0,
    },
    {
      label: 'Receiving Today',
      value: stats?.receiving_today?.toLocaleString() || '0',
      change: null,
      icon: Truck,
      color: 'bg-green-500',
    },
    {
      label: 'Shipping Today',
      value: stats?.shipping_today?.toLocaleString() || '0',
      change: null,
      icon: CheckCircle,
      color: 'bg-purple-500',
    },
    {
      label: 'Utilization',
      value: \`\${stats?.utilization_percent || 0}%\`,
      change: null,
      icon: BarChart3,
      color: 'bg-cyan-500',
      progress: stats?.utilization_percent || 0,
    },
  ];

  return (
    <div className={\`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 \${className}\`}>
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className={\`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 \${stat.alert ? 'ring-2 ring-red-500' : ''}\`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={\`w-10 h-10 rounded-lg flex items-center justify-center \${stat.color}\`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              {stat.change !== null && (
                <div className={\`flex items-center text-sm \${stat.change >= 0 ? 'text-green-600' : 'text-red-600'}\`}>
                  {stat.change >= 0 ? (
                    <TrendingUp className="w-4 h-4 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 mr-1" />
                  )}
                  {Math.abs(stat.change)}%
                </div>
              )}
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{stat.label}</p>
            {stat.progress !== undefined && (
              <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={\`h-2 rounded-full \${stat.progress > 90 ? 'bg-red-500' : stat.progress > 70 ? 'bg-orange-500' : 'bg-green-500'}\`}
                  style={{ width: \`\${stat.progress}%\` }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ${componentName};
`;
}

export function generateOrderListWarehouse(options: WarehouseOptions = {}): string {
  const { componentName = 'OrderListWarehouse', endpoint = '/warehouse/orders' } = options;

  return `import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Package, Clock, User, MapPin, ChevronRight, CheckCircle, AlertCircle, Printer } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface Order {
  id: string;
  order_number: string;
  status: 'pending' | 'picking' | 'packing' | 'ready' | 'shipped';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  customer_name: string;
  shipping_address: string;
  items_count: number;
  created_at: string;
  due_date?: string;
}

interface ${componentName}Props {
  warehouseId?: string;
  status?: string;
  onSelectOrder?: (order: Order) => void;
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  warehouseId,
  status,
  onSelectOrder,
  className = '',
}) => {
  const queryClient = useQueryClient();
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

  const { data: orders, isLoading } = useQuery({
    queryKey: ['warehouse-orders', warehouseId, status],
    queryFn: async () => {
      let url = '${endpoint}';
      const params = new URLSearchParams();
      if (warehouseId) params.append('warehouse_id', warehouseId);
      if (status) params.append('status', status);
      if (params.toString()) url += '?' + params.toString();
      const response = await api.get<any>(url);
      return Array.isArray(response) ? response : (response?.data || []);
    },
    refetchInterval: 30000,
  });

  const updateStatus = useMutation({
    mutationFn: ({ orderId, newStatus }: { orderId: string; newStatus: string }) =>
      api.put(\`${endpoint}/\${orderId}/status\`, { status: newStatus }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouse-orders'] });
      toast.success('Order status updated');
    },
  });

  const priorityColors: Record<string, string> = {
    urgent: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-300',
    high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-300',
    normal: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-300',
    low: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400 border-gray-300',
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    picking: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    packing: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    ready: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    shipped: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400',
  };

  const statusFlow = ['pending', 'picking', 'packing', 'ready', 'shipped'];

  const toggleSelect = (orderId: string) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className={\`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 \${className}\`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Package className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Orders</h2>
          <span className="text-sm text-gray-500">({orders?.length || 0})</span>
        </div>
        {selectedOrders.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">{selectedOrders.length} selected</span>
            <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Printer className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[600px] overflow-y-auto">
        {orders && orders.length > 0 ? (
          orders.map((order: Order) => {
            const currentIndex = statusFlow.indexOf(order.status);
            const nextStatus = statusFlow[currentIndex + 1];
            const overdue = isOverdue(order.due_date);

            return (
              <div
                key={order.id}
                className={\`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors \${selectedOrders.includes(order.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''}\`}
              >
                <div className="flex items-start gap-4">
                  <input
                    type="checkbox"
                    checked={selectedOrders.includes(order.id)}
                    onChange={() => toggleSelect(order.id)}
                    className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />

                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => onSelectOrder?.(order)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 dark:text-white">
                            #{order.order_number}
                          </span>
                          <span className={\`px-2 py-0.5 text-xs font-medium rounded border \${priorityColors[order.priority]}\`}>
                            {order.priority}
                          </span>
                          {overdue && (
                            <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                              <AlertCircle className="w-3 h-3" />
                              Overdue
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {order.customer_name}
                          </span>
                          <span className="flex items-center gap-1">
                            <Package className="w-3 h-3" />
                            {order.items_count} items
                          </span>
                        </div>
                      </div>
                      <span className={\`px-3 py-1 rounded-full text-xs font-medium \${statusColors[order.status]}\`}>
                        {order.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{order.shipping_address}</span>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(order.created_at).toLocaleDateString()}
                        </span>
                        {order.due_date && (
                          <span className={\`flex items-center gap-1 \${overdue ? 'text-red-500' : ''}\`}>
                            Due: {new Date(order.due_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      {nextStatus && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateStatus.mutate({ orderId: order.id, newStatus: nextStatus });
                          }}
                          disabled={updateStatus.isPending}
                          className="flex items-center gap-1 px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                        >
                          <CheckCircle className="w-3 h-3" />
                          {nextStatus}
                        </button>
                      )}
                    </div>
                  </div>

                  <ChevronRight className="w-5 h-5 text-gray-400 mt-1" />
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            No orders found
          </div>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateStockLevels(options: WarehouseOptions = {}): string {
  const { componentName = 'StockLevels', endpoint = '/warehouse/inventory' } = options;

  return `import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Package, AlertTriangle, TrendingDown, TrendingUp, Search, Filter } from 'lucide-react';
import { api } from '@/lib/api';

interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  quantity: number;
  min_quantity: number;
  max_quantity: number;
  location: string;
  zone: string;
  last_updated: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'overstock';
}

interface ${componentName}Props {
  warehouseId?: string;
  showFilters?: boolean;
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  warehouseId,
  showFilters = true,
  className = '',
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [zoneFilter, setZoneFilter] = useState<string>('');

  const { data: inventory, isLoading } = useQuery({
    queryKey: ['stock-levels', warehouseId, statusFilter, zoneFilter],
    queryFn: async () => {
      let url = '${endpoint}';
      const params = new URLSearchParams();
      if (warehouseId) params.append('warehouse_id', warehouseId);
      if (statusFilter) params.append('status', statusFilter);
      if (zoneFilter) params.append('zone', zoneFilter);
      if (params.toString()) url += '?' + params.toString();
      const response = await api.get<any>(url);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const statusColors: Record<string, string> = {
    in_stock: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    low_stock: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    out_of_stock: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    overstock: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  };

  const zones = [...new Set(inventory?.map((item: InventoryItem) => item.zone) || [])];

  const filteredInventory = inventory?.filter((item: InventoryItem) => {
    if (search && !item.name.toLowerCase().includes(search.toLowerCase()) && !item.sku.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    return true;
  }) || [];

  const getStockPercentage = (item: InventoryItem) => {
    return Math.min(100, Math.round((item.quantity / item.max_quantity) * 100));
  };

  const getProgressColor = (item: InventoryItem) => {
    const pct = getStockPercentage(item);
    if (item.quantity <= item.min_quantity) return 'bg-red-500';
    if (pct > 90) return 'bg-blue-500';
    if (pct < 30) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const lowStockCount = inventory?.filter((i: InventoryItem) => i.status === 'low_stock' || i.status === 'out_of_stock').length || 0;

  return (
    <div className={\`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 \${className}\`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Package className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Stock Levels</h2>
          </div>
          {lowStockCount > 0 && (
            <span className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full text-sm">
              <AlertTriangle className="w-4 h-4" />
              {lowStockCount} items need attention
            </span>
          )}
        </div>

        {showFilters && (
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by SKU or name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="in_stock">In Stock</option>
              <option value="low_stock">Low Stock</option>
              <option value="out_of_stock">Out of Stock</option>
              <option value="overstock">Overstock</option>
            </select>
            <select
              value={zoneFilter}
              onChange={(e) => setZoneFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Zones</option>
              {zones.map((zone: string) => (
                <option key={zone} value={zone}>Zone {zone}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Product</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">SKU</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Location</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Stock Level</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredInventory.length > 0 ? (
              filteredInventory.map((item: InventoryItem) => (
                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-4 py-4">
                    <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-gray-500 font-mono">{item.sku}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-gray-500">
                      Zone {item.zone} - {item.location}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="w-32">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="font-medium text-gray-900 dark:text-white">{item.quantity}</span>
                        <span className="text-gray-400">/ {item.max_quantity}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={\`h-2 rounded-full \${getProgressColor(item)}\`}
                          style={{ width: \`\${getStockPercentage(item)}%\` }}
                        />
                      </div>
                      {item.quantity <= item.min_quantity && (
                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                          <TrendingDown className="w-3 h-3" />
                          Below min ({item.min_quantity})
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={\`px-3 py-1 rounded-full text-xs font-medium \${statusColors[item.status]}\`}>
                      {item.status.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  No inventory items found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateReceivingForm(options: WarehouseOptions = {}): string {
  const { componentName = 'ReceivingForm', endpoint = '/warehouse/receiving' } = options;

  return `import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Package, Plus, Minus, Barcode, Truck, Calendar, User, X, Check, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface ReceivingItem {
  sku: string;
  name: string;
  expected_quantity: number;
  received_quantity: number;
  damaged_quantity: number;
  location?: string;
}

interface ReceivingFormData {
  po_number: string;
  supplier: string;
  carrier: string;
  tracking_number: string;
  received_date: string;
  received_by: string;
  items: ReceivingItem[];
  notes: string;
}

interface ${componentName}Props {
  onSuccess?: () => void;
  onCancel?: () => void;
  purchaseOrder?: any;
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  onSuccess,
  onCancel,
  purchaseOrder,
  className = '',
}) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<ReceivingFormData>({
    po_number: purchaseOrder?.po_number || '',
    supplier: purchaseOrder?.supplier || '',
    carrier: '',
    tracking_number: '',
    received_date: new Date().toISOString().split('T')[0],
    received_by: '',
    items: purchaseOrder?.items?.map((item: any) => ({
      sku: item.sku,
      name: item.name,
      expected_quantity: item.quantity,
      received_quantity: item.quantity,
      damaged_quantity: 0,
      location: '',
    })) || [],
    notes: '',
  });

  const submitReceiving = useMutation({
    mutationFn: (data: ReceivingFormData) => api.post('${endpoint}', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouse-receiving'] });
      queryClient.invalidateQueries({ queryKey: ['stock-levels'] });
      toast.success('Receiving completed successfully');
      onSuccess?.();
    },
    onError: () => {
      toast.error('Failed to submit receiving');
    },
  });

  const updateItem = (index: number, field: keyof ReceivingItem, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        { sku: '', name: '', expected_quantity: 0, received_quantity: 0, damaged_quantity: 0, location: '' },
      ],
    });
  };

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitReceiving.mutate(formData);
  };

  const totalExpected = formData.items.reduce((sum, item) => sum + item.expected_quantity, 0);
  const totalReceived = formData.items.reduce((sum, item) => sum + item.received_quantity, 0);
  const totalDamaged = formData.items.reduce((sum, item) => sum + item.damaged_quantity, 0);

  return (
    <form onSubmit={handleSubmit} className={\`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 \${className}\`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Package className="w-5 h-5 text-blue-600" />
          Receiving Form
        </h2>
      </div>

      <div className="p-6 space-y-6">
        {/* Header Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              PO Number
            </label>
            <input
              type="text"
              value={formData.po_number}
              onChange={(e) => setFormData({ ...formData, po_number: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              placeholder="PO-12345"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Supplier
            </label>
            <input
              type="text"
              value={formData.supplier}
              onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              placeholder="Supplier name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Received Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={formData.received_date}
                onChange={(e) => setFormData({ ...formData, received_date: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Carrier
            </label>
            <div className="relative">
              <Truck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={formData.carrier}
                onChange={(e) => setFormData({ ...formData, carrier: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                placeholder="Carrier name"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tracking Number
            </label>
            <div className="relative">
              <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={formData.tracking_number}
                onChange={(e) => setFormData({ ...formData, tracking_number: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                placeholder="Tracking number"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Received By
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={formData.received_by}
                onChange={(e) => setFormData({ ...formData, received_by: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                placeholder="Your name"
                required
              />
            </div>
          </div>
        </div>

        {/* Items */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Items
            </label>
            <button
              type="button"
              onClick={addItem}
              className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
            >
              <Plus className="w-4 h-4" />
              Add Item
            </button>
          </div>

          <div className="space-y-3">
            {formData.items.map((item, index) => (
              <div key={index} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">SKU</label>
                    <input
                      type="text"
                      value={item.sku}
                      onChange={(e) => updateItem(index, 'sku', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="SKU"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs text-gray-500 mb-1">Name</label>
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => updateItem(index, 'name', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Product name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Received</label>
                    <input
                      type="number"
                      min="0"
                      value={item.received_quantity}
                      onChange={(e) => updateItem(index, 'received_quantity', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Damaged</label>
                    <input
                      type="number"
                      min="0"
                      value={item.damaged_quantity}
                      onChange={(e) => updateItem(index, 'damaged_quantity', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 dark:text-white mb-3">Summary</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalExpected}</p>
              <p className="text-sm text-gray-500">Expected</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{totalReceived}</p>
              <p className="text-sm text-gray-500">Received</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{totalDamaged}</p>
              <p className="text-sm text-gray-500">Damaged</p>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            placeholder="Additional notes..."
          />
        </div>
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={submitReceiving.isPending || formData.items.length === 0}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {submitReceiving.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Check className="w-4 h-4" />
          )}
          Complete Receiving
        </button>
      </div>
    </form>
  );
};

export default ${componentName};
`;
}

export function generateReceivingList(options: WarehouseOptions = {}): string {
  const { componentName = 'ReceivingList', endpoint = '/warehouse/receiving' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Loader2, Package, Clock, User, Truck, ChevronRight, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';

interface ReceivingRecord {
  id: string;
  po_number: string;
  supplier: string;
  carrier: string;
  tracking_number?: string;
  received_date: string;
  received_by: string;
  status: 'pending' | 'in_progress' | 'completed' | 'issue';
  items_count: number;
  total_received: number;
  total_expected: number;
}

interface ${componentName}Props {
  warehouseId?: string;
  limit?: number;
  onSelectRecord?: (record: ReceivingRecord) => void;
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  warehouseId,
  limit,
  onSelectRecord,
  className = '',
}) => {
  const { data: records, isLoading } = useQuery({
    queryKey: ['receiving-list', warehouseId, limit],
    queryFn: async () => {
      let url = '${endpoint}';
      const params = new URLSearchParams();
      if (warehouseId) params.append('warehouse_id', warehouseId);
      if (limit) params.append('limit', limit.toString());
      if (params.toString()) url += '?' + params.toString();
      const response = await api.get<any>(url);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    issue: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };

  const statusIcons: Record<string, React.ElementType> = {
    pending: Clock,
    in_progress: Package,
    completed: CheckCircle,
    issue: AlertCircle,
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className={\`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 \${className}\`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Truck className="w-5 h-5 text-green-600" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Receiving</h2>
        </div>
        <Link
          to="/warehouse/receiving"
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          View All
        </Link>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {records && records.length > 0 ? (
          records.map((record: ReceivingRecord) => {
            const StatusIcon = statusIcons[record.status] || Clock;
            const receivingRate = record.total_expected > 0
              ? Math.round((record.total_received / record.total_expected) * 100)
              : 0;

            return (
              <div
                key={record.id}
                onClick={() => onSelectRecord?.(record)}
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {record.po_number}
                      </span>
                      <span className={\`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium \${statusColors[record.status]}\`}>
                        <StatusIcon className="w-3 h-3" />
                        {record.status.replace('_', ' ')}
                      </span>
                    </div>

                    <p className="text-sm text-gray-500 mb-2">{record.supplier}</p>

                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(record.received_date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {record.received_by}
                      </span>
                      <span className="flex items-center gap-1">
                        <Package className="w-3 h-3" />
                        {record.items_count} items
                      </span>
                    </div>

                    {record.status !== 'completed' && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                          <span>Receiving Progress</span>
                          <span>{record.total_received} / {record.total_expected}</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className={\`h-2 rounded-full \${receivingRate === 100 ? 'bg-green-500' : 'bg-blue-500'}\`}
                            style={{ width: \`\${receivingRate}%\` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <ChevronRight className="w-5 h-5 text-gray-400 ml-4" />
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center text-gray-500">
            <Truck className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            No receiving records found
          </div>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}
