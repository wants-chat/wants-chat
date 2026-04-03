/**
 * Order & Inventory Component Generators
 *
 * Components for order management, inventory tracking, and fulfillment.
 */

export interface OrdersOptions {
  componentName?: string;
  title?: string;
  endpoint?: string;
}

// Order Filters Component
export function generateOrderFilters(options: OrdersOptions = {}): string {
  return `import React, { useState } from 'react';
import { Search, Filter, Calendar } from 'lucide-react';

interface OrderFilters {
  search: string;
  status: string;
  dateRange: { start: string; end: string };
  sortBy: string;
}

interface OrderFiltersProps {
  onFilter?: (filters: OrderFilters) => void;
}

export default function OrderFilters({ onFilter }: OrderFiltersProps) {
  const [filters, setFilters] = useState<OrderFilters>({
    search: '',
    status: 'all',
    dateRange: { start: '', end: '' },
    sortBy: 'newest'
  });

  const handleChange = (key: keyof OrderFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilter?.(newFilters);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search orders by ID, customer..."
          value={filters.search}
          onChange={(e) => handleChange('search', e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
          <select
            value={filters.status}
            onChange={(e) => handleChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">From Date</label>
          <input
            type="date"
            value={filters.dateRange.start}
            onChange={(e) => handleChange('dateRange', { ...filters.dateRange, start: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">To Date</label>
          <input
            type="date"
            value={filters.dateRange.end}
            onChange={(e) => handleChange('dateRange', { ...filters.dateRange, end: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sort By</label>
          <select
            value={filters.sortBy}
            onChange={(e) => handleChange('sortBy', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Amount</option>
            <option value="lowest">Lowest Amount</option>
          </select>
        </div>
      </div>
    </div>
  );
}`;
}

// Order Filters Bakery Component
export function generateOrderFiltersBakery(options: OrdersOptions = {}): string {
  return `import React, { useState } from 'react';
import { Search, Filter, Calendar, Cake } from 'lucide-react';

interface BakeryOrderFilters {
  search: string;
  category: string;
  status: string;
  pickupDate: string;
}

interface OrderFiltersBakeryProps {
  onFilter?: (filters: BakeryOrderFilters) => void;
}

export default function OrderFiltersBakery({ onFilter }: OrderFiltersBakeryProps) {
  const [filters, setFilters] = useState<BakeryOrderFilters>({
    search: '',
    category: 'all',
    status: 'all',
    pickupDate: ''
  });

  const handleChange = (key: keyof BakeryOrderFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilter?.(newFilters);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search orders..."
          value={filters.search}
          onChange={(e) => handleChange('search', e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
          <select
            value={filters.category}
            onChange={(e) => handleChange('category', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
          >
            <option value="all">All Items</option>
            <option value="cakes">Cakes</option>
            <option value="pastries">Pastries</option>
            <option value="bread">Bread</option>
            <option value="cookies">Cookies</option>
            <option value="custom">Custom Orders</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
          <select
            value={filters.status}
            onChange={(e) => handleChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="preparing">Preparing</option>
            <option value="ready">Ready for Pickup</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pickup Date</label>
          <input
            type="date"
            value={filters.pickupDate}
            onChange={(e) => handleChange('pickupDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
          />
        </div>
      </div>
    </div>
  );
}`;
}

// Order Filters Florist Component
export function generateOrderFiltersFlorist(options: OrdersOptions = {}): string {
  return `import React, { useState } from 'react';
import { Search, Flower, Calendar, Truck } from 'lucide-react';

interface FloristOrderFilters {
  search: string;
  orderType: string;
  status: string;
  deliveryDate: string;
  occasion: string;
}

interface OrderFiltersFloristProps {
  onFilter?: (filters: FloristOrderFilters) => void;
}

export default function OrderFiltersFlorist({ onFilter }: OrderFiltersFloristProps) {
  const [filters, setFilters] = useState<FloristOrderFilters>({
    search: '',
    orderType: 'all',
    status: 'all',
    deliveryDate: '',
    occasion: 'all'
  });

  const handleChange = (key: keyof FloristOrderFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilter?.(newFilters);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search orders..."
          value={filters.search}
          onChange={(e) => handleChange('search', e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
          <select
            value={filters.orderType}
            onChange={(e) => handleChange('orderType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
          >
            <option value="all">All Types</option>
            <option value="delivery">Delivery</option>
            <option value="pickup">Pickup</option>
            <option value="event">Event</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
          <select
            value={filters.status}
            onChange={(e) => handleChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="preparing">Preparing</option>
            <option value="out-for-delivery">Out for Delivery</option>
            <option value="delivered">Delivered</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Delivery Date</label>
          <input
            type="date"
            value={filters.deliveryDate}
            onChange={(e) => handleChange('deliveryDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Occasion</label>
          <select
            value={filters.occasion}
            onChange={(e) => handleChange('occasion', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
          >
            <option value="all">All Occasions</option>
            <option value="birthday">Birthday</option>
            <option value="anniversary">Anniversary</option>
            <option value="wedding">Wedding</option>
            <option value="funeral">Sympathy</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>
    </div>
  );
}`;
}

// Order Header Component
export function generateOrderHeader(options: OrdersOptions = {}): string {
  return `import React from 'react';
import { Package, Calendar, User, MapPin, CreditCard, ArrowLeft } from 'lucide-react';

interface OrderHeaderProps {
  order: {
    id: string;
    status: string;
    date: string;
    customer: { name: string; email: string; phone: string };
    shippingAddress: string;
    paymentMethod: string;
    total: number;
  };
  onBack?: () => void;
}

export default function OrderHeader({ order, onBack }: OrderHeaderProps) {
  const statusColors: Record<string, string> = {
    'pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    'processing': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'shipped': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    'delivered': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'cancelled': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          {onBack && (
            <button onClick={onBack} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <Package className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Order #{order.id}</h1>
                <span className={\`inline-block mt-1 px-3 py-1 rounded-full text-sm font-medium \${statusColors[order.status] || statusColors.pending}\`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500 dark:text-gray-400">Order Total</div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">\${order.total.toFixed(2)}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Order Date</div>
              <div className="font-medium text-gray-900 dark:text-white">
                {new Date(order.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Customer</div>
              <div className="font-medium text-gray-900 dark:text-white">{order.customer.name}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">{order.customer.email}</div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <MapPin className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Shipping Address</div>
              <div className="font-medium text-gray-900 dark:text-white">{order.shippingAddress}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}`;
}

// Order Items Component
export function generateOrderItems(options: OrdersOptions = {}): string {
  return `import React from 'react';
import { Package } from 'lucide-react';

interface OrderItem {
  id: string;
  name: string;
  image?: string;
  quantity: number;
  price: number;
  variant?: string;
  sku?: string;
}

interface OrderItemsProps {
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

export default function OrderItems({ items, subtotal, shipping, tax, total }: OrderItemsProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="p-4 border-b dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Package className="w-5 h-5" />
          Order Items ({items.length})
        </h2>
      </div>

      <div className="divide-y dark:divide-gray-700">
        {items.map((item) => (
          <div key={item.id} className="p-4 flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              {item.image ? (
                <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
              ) : (
                <Package className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <div className="flex-1">
              <div className="font-medium text-gray-900 dark:text-white">{item.name}</div>
              {item.variant && (
                <div className="text-sm text-gray-500 dark:text-gray-400">{item.variant}</div>
              )}
              {item.sku && (
                <div className="text-xs text-gray-400 dark:text-gray-500">SKU: {item.sku}</div>
              )}
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500 dark:text-gray-400">Qty</div>
              <div className="font-medium text-gray-900 dark:text-white">{item.quantity}</div>
            </div>
            <div className="text-right min-w-[80px]">
              <div className="font-medium text-gray-900 dark:text-white">\${(item.price * item.quantity).toFixed(2)}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">\${item.price.toFixed(2)} each</div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-gray-50 dark:bg-gray-700/50 space-y-2">
        <div className="flex justify-between text-gray-600 dark:text-gray-300">
          <span>Subtotal</span>
          <span>\${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-gray-600 dark:text-gray-300">
          <span>Shipping</span>
          <span>\${shipping.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-gray-600 dark:text-gray-300">
          <span>Tax</span>
          <span>\${tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white pt-2 border-t dark:border-gray-600">
          <span>Total</span>
          <span>\${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}`;
}

// Order List Ready Component
export function generateOrderListReady(options: OrdersOptions = {}): string {
  return `import React, { useState, useEffect } from 'react';
import { Package, Clock, User, CheckCircle } from 'lucide-react';

interface ReadyOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  items: number;
  readyTime: string;
  pickupType: 'pickup' | 'delivery';
  notes?: string;
}

export default function OrderListReady() {
  const [orders, setOrders] = useState<ReadyOrder[]>([]);

  useEffect(() => {
    setOrders([
      { id: '1', orderNumber: 'ORD-001', customerName: 'John Smith', items: 3, readyTime: '10 min ago', pickupType: 'pickup', notes: 'Called - on the way' },
      { id: '2', orderNumber: 'ORD-002', customerName: 'Sarah Johnson', items: 2, readyTime: '15 min ago', pickupType: 'delivery' },
      { id: '3', orderNumber: 'ORD-003', customerName: 'Mike Wilson', items: 5, readyTime: '5 min ago', pickupType: 'pickup' },
      { id: '4', orderNumber: 'ORD-004', customerName: 'Emily Davis', items: 1, readyTime: '20 min ago', pickupType: 'pickup', notes: 'VIP customer' }
    ]);
  }, []);

  const markAsCompleted = (id: string) => {
    setOrders(orders.filter(o => o.id !== id));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="p-4 border-b dark:border-gray-700 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-500" />
          Ready for Pickup/Delivery
        </h2>
        <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
          {orders.length} orders
        </span>
      </div>

      <div className="divide-y dark:divide-gray-700">
        {orders.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            No orders ready at the moment
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={\`p-2 rounded-lg \${order.pickupType === 'pickup' ? 'bg-blue-100 dark:bg-blue-900' : 'bg-purple-100 dark:bg-purple-900'}\`}>
                    <Package className={\`w-5 h-5 \${order.pickupType === 'pickup' ? 'text-blue-600 dark:text-blue-400' : 'text-purple-600 dark:text-purple-400'}\`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 dark:text-white">{order.orderNumber}</span>
                      <span className={\`px-2 py-0.5 text-xs rounded-full \${
                        order.pickupType === 'pickup'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                      }\`}>
                        {order.pickupType}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {order.customerName}
                      </span>
                      <span>{order.items} items</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-sm text-orange-600 dark:text-orange-400">
                      <Clock className="w-3 h-3" />
                      Ready {order.readyTime}
                    </div>
                    {order.notes && (
                      <div className="mt-2 text-sm bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded">
                        {order.notes}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => markAsCompleted(order.id)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                >
                  Complete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}`;
}

// Inventory Filters Component
export function generateInventoryFilters(options: OrdersOptions = {}): string {
  return `import React, { useState } from 'react';
import { Search, Filter, Package } from 'lucide-react';

interface InventoryFilters {
  search: string;
  category: string;
  stockLevel: string;
  warehouse: string;
}

interface InventoryFiltersProps {
  onFilter?: (filters: InventoryFilters) => void;
}

export default function InventoryFilters({ onFilter }: InventoryFiltersProps) {
  const [filters, setFilters] = useState<InventoryFilters>({
    search: '',
    category: 'all',
    stockLevel: 'all',
    warehouse: 'all'
  });

  const handleChange = (key: keyof InventoryFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilter?.(newFilters);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search products by name or SKU..."
          value={filters.search}
          onChange={(e) => handleChange('search', e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
          <select
            value={filters.category}
            onChange={(e) => handleChange('category', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
          >
            <option value="all">All Categories</option>
            <option value="electronics">Electronics</option>
            <option value="clothing">Clothing</option>
            <option value="home">Home & Garden</option>
            <option value="food">Food & Beverage</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stock Level</label>
          <select
            value={filters.stockLevel}
            onChange={(e) => handleChange('stockLevel', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
          >
            <option value="all">All Levels</option>
            <option value="in-stock">In Stock</option>
            <option value="low-stock">Low Stock</option>
            <option value="out-of-stock">Out of Stock</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Warehouse</label>
          <select
            value={filters.warehouse}
            onChange={(e) => handleChange('warehouse', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
          >
            <option value="all">All Warehouses</option>
            <option value="main">Main Warehouse</option>
            <option value="west">West Coast</option>
            <option value="east">East Coast</option>
          </select>
        </div>
      </div>
    </div>
  );
}`;
}

// Low Stock Alert Component
export function generateLowStockAlert(options: OrdersOptions = {}): string {
  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, Package, ArrowRight, TrendingDown } from 'lucide-react';

interface LowStockItem {
  id: string;
  name: string;
  sku: string;
  currentStock: number;
  reorderPoint: number;
  category: string;
  lastRestocked: string;
}

export default function LowStockAlert() {
  const { data: items, isLoading } = useQuery({
    queryKey: ['low-stock-items'],
    queryFn: async () => ([
      { id: '1', name: 'Wireless Earbuds Pro', sku: 'WEP-001', currentStock: 5, reorderPoint: 20, category: 'Electronics', lastRestocked: '2024-01-01' },
      { id: '2', name: 'USB-C Cable 2m', sku: 'USB-C2M', currentStock: 12, reorderPoint: 50, category: 'Accessories', lastRestocked: '2024-01-10' },
      { id: '3', name: 'Laptop Stand', sku: 'LS-PRO', currentStock: 3, reorderPoint: 15, category: 'Electronics', lastRestocked: '2023-12-20' },
      { id: '4', name: 'Phone Case - Black', sku: 'PC-BLK', currentStock: 8, reorderPoint: 30, category: 'Accessories', lastRestocked: '2024-01-05' }
    ] as LowStockItem[])
  });

  if (isLoading) return <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg h-48" />;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="p-4 border-b dark:border-gray-700 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-500" />
          Low Stock Alert
        </h2>
        <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded-full text-sm font-medium">
          {items?.length || 0} items
        </span>
      </div>

      <div className="divide-y dark:divide-gray-700">
        {items?.map((item) => {
          const stockPercent = (item.currentStock / item.reorderPoint) * 100;
          const isCritical = stockPercent < 25;

          return (
            <div key={item.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={\`p-2 rounded-lg \${isCritical ? 'bg-red-100 dark:bg-red-900' : 'bg-orange-100 dark:bg-orange-900'}\`}>
                    <Package className={\`w-5 h-5 \${isCritical ? 'text-red-600 dark:text-red-400' : 'text-orange-600 dark:text-orange-400'}\`} />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">{item.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">SKU: {item.sku}</div>
                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      Last restocked: {new Date(item.lastRestocked).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={\`text-2xl font-bold \${isCritical ? 'text-red-600 dark:text-red-400' : 'text-orange-600 dark:text-orange-400'}\`}>
                    {item.currentStock}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    of {item.reorderPoint} min
                  </div>
                </div>
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Stock Level</span>
                  <span>{stockPercent.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={\`h-2 rounded-full \${isCritical ? 'bg-red-500' : 'bg-orange-500'}\`}
                    style={{ width: \`\${Math.min(stockPercent, 100)}%\` }}
                  />
                </div>
              </div>
              <button className="mt-3 w-full py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center gap-2">
                Reorder Now
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}`;
}

// Today's Orders Component
export function generateTodaysOrders(options: OrdersOptions = {}): string {
  return `import React, { useState, useEffect } from 'react';
import { ShoppingBag, Clock, DollarSign, Package, TrendingUp } from 'lucide-react';

interface TodayOrder {
  id: string;
  orderNumber: string;
  customer: string;
  items: number;
  total: number;
  time: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
}

export default function TodaysOrders() {
  const [orders, setOrders] = useState<TodayOrder[]>([]);
  const [stats, setStats] = useState({ total: 0, revenue: 0, pending: 0, completed: 0 });

  useEffect(() => {
    const mockOrders: TodayOrder[] = [
      { id: '1', orderNumber: 'ORD-101', customer: 'John Smith', items: 3, total: 89.99, time: '10:30 AM', status: 'completed' },
      { id: '2', orderNumber: 'ORD-102', customer: 'Sarah Johnson', items: 1, total: 45.00, time: '11:15 AM', status: 'completed' },
      { id: '3', orderNumber: 'ORD-103', customer: 'Mike Wilson', items: 5, total: 156.50, time: '12:00 PM', status: 'processing' },
      { id: '4', orderNumber: 'ORD-104', customer: 'Emily Davis', items: 2, total: 78.00, time: '1:30 PM', status: 'pending' },
      { id: '5', orderNumber: 'ORD-105', customer: 'Chris Brown', items: 4, total: 234.00, time: '2:45 PM', status: 'pending' }
    ];
    setOrders(mockOrders);
    setStats({
      total: mockOrders.length,
      revenue: mockOrders.reduce((sum, o) => sum + o.total, 0),
      pending: mockOrders.filter(o => o.status === 'pending').length,
      completed: mockOrders.filter(o => o.status === 'completed').length
    });
  }, []);

  const statusColors: Record<string, string> = {
    'pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    'processing': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'completed': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'cancelled': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <ShoppingBag className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Total Orders</div>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">\${stats.revenue.toFixed(2)}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Revenue</div>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pending}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Pending</div>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completed}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Completed</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-4 border-b dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Today's Orders</h2>
        </div>
        <div className="divide-y dark:divide-gray-700">
          {orders.map((order) => (
            <div key={order.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <Package className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">{order.orderNumber}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{order.customer} • {order.items} items</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="font-medium text-gray-900 dark:text-white">\${order.total.toFixed(2)}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{order.time}</div>
                </div>
                <span className={\`px-2 py-1 text-xs rounded-full \${statusColors[order.status]}\`}>
                  {order.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}`;
}
