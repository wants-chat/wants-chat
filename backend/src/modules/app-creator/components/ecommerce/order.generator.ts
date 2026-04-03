/**
 * Order Component Generators for Ecommerce
 *
 * Generates order management components:
 * - OrderHeader: Header for order detail pages
 * - OrderItems: List of items in an order
 * - OrderFilters: Filter component for orders
 * - OrderListReady: Pre-configured order list
 * - OrderQueue: Queue view for order processing
 */

export interface OrderHeaderOptions {
  componentName?: string;
  showActions?: boolean;
  showTimeline?: boolean;
  showPaymentInfo?: boolean;
  showShippingInfo?: boolean;
}

/**
 * Generate an OrderHeader component
 */
export function generateOrderHeader(options: OrderHeaderOptions = {}): string {
  const {
    componentName = 'OrderHeader',
    showActions = true,
    showTimeline = true,
    showPaymentInfo = true,
    showShippingInfo = true,
  } = options;

  return `import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowLeft,
  Printer,
  Download,
  RefreshCw,
  CreditCard,
  MapPin,
  User,
  Mail,
  Phone,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Order {
  id: string;
  order_number?: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  subtotal?: number;
  tax?: number;
  shipping_cost?: number;
  discount?: number;
  created_at: string;
  updated_at?: string;
  estimated_delivery?: string;
  tracking_number?: string;
  payment_method?: string;
  payment_status?: 'paid' | 'pending' | 'failed' | 'refunded';
  customer?: {
    name: string;
    email: string;
    phone?: string;
  };
  shipping_address?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
}

interface ${componentName}Props {
  order: Order;
  className?: string;
  onRefund?: () => void;
  onCancel?: () => void;
  onResend?: () => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  order,
  className,
  onRefund,
  onCancel,
  onResend,
}) => {
  const navigate = useNavigate();

  const statusConfig = {
    pending: {
      icon: Clock,
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
      label: 'Pending',
    },
    processing: {
      icon: Package,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      label: 'Processing',
    },
    shipped: {
      icon: Truck,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
      label: 'Shipped',
    },
    delivered: {
      icon: CheckCircle2,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      label: 'Delivered',
    },
    cancelled: {
      icon: XCircle,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900/30',
      label: 'Cancelled',
    },
  };

  const paymentStatusConfig = {
    paid: { color: 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400', label: 'Paid' },
    pending: { color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400', label: 'Pending' },
    failed: { color: 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400', label: 'Failed' },
    refunded: { color: 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-400', label: 'Refunded' },
  };

  const status = statusConfig[order.status];
  const StatusIcon = status.icon;
  const paymentStatus = paymentStatusConfig[order.payment_status || 'pending'];

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadInvoice = () => {
    toast.success('Invoice download started');
  };

  const orderDate = new Date(order.created_at);

  ${showTimeline ? `const timelineSteps = [
    { key: 'pending', label: 'Order Placed', icon: Clock },
    { key: 'processing', label: 'Processing', icon: Package },
    { key: 'shipped', label: 'Shipped', icon: Truck },
    { key: 'delivered', label: 'Delivered', icon: CheckCircle2 },
  ];

  const currentStepIndex = timelineSteps.findIndex(s => s.key === order.status);` : ''}

  return (
    <div className={cn("bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700", className)}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Order #{order.order_number || order.id}
                </h1>
                <span className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium",
                  status.bgColor,
                  status.color
                )}>
                  <StatusIcon className="w-4 h-4" />
                  {status.label}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1 text-sm text-gray-500 dark:text-gray-400">
                <Calendar className="w-4 h-4" />
                <span>Placed on {orderDate.toLocaleDateString()} at {orderDate.toLocaleTimeString()}</span>
              </div>
            </div>
          </div>

          ${showActions ? `<div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
            <button
              onClick={handleDownloadInvoice}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Invoice
            </button>
            {order.status !== 'cancelled' && order.status !== 'delivered' && onCancel && (
              <button
                onClick={onCancel}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
              >
                <XCircle className="w-4 h-4" />
                Cancel Order
              </button>
            )}
          </div>` : ''}
        </div>

        ${showTimeline ? `{/* Timeline */}
        {order.status !== 'cancelled' && (
          <div className="mt-8">
            <div className="flex items-center justify-between">
              {timelineSteps.map((step, index) => {
                const StepIcon = step.icon;
                const isActive = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;

                return (
                  <React.Fragment key={step.key}>
                    <div className="flex flex-col items-center">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors",
                        isCurrent
                          ? "bg-blue-600 border-blue-600 text-white"
                          : isActive
                            ? "bg-green-500 border-green-500 text-white"
                            : "border-gray-300 dark:border-gray-600 text-gray-400"
                      )}>
                        <StepIcon className="w-5 h-5" />
                      </div>
                      <span className={cn(
                        "mt-2 text-xs font-medium",
                        isActive ? "text-gray-900 dark:text-white" : "text-gray-400"
                      )}>
                        {step.label}
                      </span>
                    </div>
                    {index < timelineSteps.length - 1 && (
                      <div className={cn(
                        "flex-1 h-1 mx-2 rounded",
                        index < currentStepIndex
                          ? "bg-green-500"
                          : "bg-gray-200 dark:bg-gray-700"
                      )} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}` : ''}
      </div>

      {/* Content */}
      <div className="p-6 grid md:grid-cols-3 gap-6">
        ${showPaymentInfo ? `{/* Payment Info */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Payment Information
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-500 dark:text-gray-400">Method</span>
              <span className="text-gray-900 dark:text-white capitalize">
                {order.payment_method || 'Credit Card'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500 dark:text-gray-400">Status</span>
              <span className={cn(
                "px-2 py-0.5 rounded text-xs font-medium",
                paymentStatus.color
              )}>
                {paymentStatus.label}
              </span>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2 space-y-1">
              {order.subtotal && (
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
                  <span className="text-gray-900 dark:text-white">\${order.subtotal.toFixed(2)}</span>
                </div>
              )}
              {order.shipping_cost !== undefined && (
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Shipping</span>
                  <span className="text-gray-900 dark:text-white">
                    {order.shipping_cost === 0 ? 'Free' : \`$\${order.shipping_cost.toFixed(2)}\`}
                  </span>
                </div>
              )}
              {order.tax && (
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Tax</span>
                  <span className="text-gray-900 dark:text-white">\${order.tax.toFixed(2)}</span>
                </div>
              )}
              {order.discount && (
                <div className="flex justify-between text-green-600 dark:text-green-400">
                  <span>Discount</span>
                  <span>-\${order.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-lg pt-2 border-t border-gray-200 dark:border-gray-700">
                <span className="text-gray-900 dark:text-white">Total</span>
                <span className="text-gray-900 dark:text-white">\${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>` : ''}

        ${showShippingInfo ? `{/* Shipping Info */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Shipping Address
          </h3>
          {order.shipping_address ? (
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <p className="font-medium text-gray-900 dark:text-white">{order.customer?.name}</p>
              <p>{order.shipping_address.line1}</p>
              {order.shipping_address.line2 && <p>{order.shipping_address.line2}</p>}
              <p>
                {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}
              </p>
              <p>{order.shipping_address.country}</p>
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">No shipping address provided</p>
          )}
          {order.tracking_number && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">Tracking Number</p>
              <p className="font-mono text-blue-600 dark:text-blue-400">{order.tracking_number}</p>
            </div>
          )}
          {order.estimated_delivery && (
            <div className="mt-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">Estimated Delivery</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {new Date(order.estimated_delivery).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>` : ''}

        {/* Customer Info */}
        {order.customer && (
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <User className="w-4 h-4" />
              Customer Information
            </h3>
            <div className="text-sm space-y-2">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <User className="w-4 h-4" />
                <span>{order.customer.name}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Mail className="w-4 h-4" />
                <a href={\`mailto:\${order.customer.email}\`} className="text-blue-600 dark:text-blue-400 hover:underline">
                  {order.customer.email}
                </a>
              </div>
              {order.customer.phone && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Phone className="w-4 h-4" />
                  <a href={\`tel:\${order.customer.phone}\`} className="text-blue-600 dark:text-blue-400 hover:underline">
                    {order.customer.phone}
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export interface OrderItemsOptions {
  componentName?: string;
  showImages?: boolean;
  showSku?: boolean;
  editable?: boolean;
}

/**
 * Generate an OrderItems component
 */
export function generateOrderItems(options: OrderItemsOptions = {}): string {
  const {
    componentName = 'OrderItems',
    showImages = true,
    showSku = true,
    editable = false,
  } = options;

  return `import React from 'react';
import { Link } from 'react-router-dom';
import { Package, ExternalLink${editable ? ', Trash2, Plus, Minus' : ''} } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OrderItem {
  id: string;
  product_id: string;
  name: string;
  sku?: string;
  image?: string;
  quantity: number;
  price: number;
  total: number;
  variant?: string;
  options?: Record<string, string>;
}

interface ${componentName}Props {
  items: OrderItem[];
  className?: string;
  ${editable ? `onUpdateQuantity?: (itemId: string, quantity: number) => void;
  onRemoveItem?: (itemId: string) => void;` : ''}
}

const ${componentName}: React.FC<${componentName}Props> = ({
  items,
  className,
  ${editable ? `onUpdateQuantity,
  onRemoveItem,` : ''}
}) => {
  if (items.length === 0) {
    return (
      <div className={cn("text-center py-8", className)}>
        <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-gray-500 dark:text-gray-400">No items in this order</p>
      </div>
    );
  }

  return (
    <div className={cn("bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden", className)}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white">
          Order Items ({items.length})
        </h3>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {items.map((item) => (
          <div key={item.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            <div className="flex items-center gap-4">
              ${showImages ? `{/* Image */}
              <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-700 overflow-hidden flex-shrink-0">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-6 h-6 text-gray-400" />
                  </div>
                )}
              </div>` : ''}

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Link
                    to={\`/products/\${item.product_id}\`}
                    className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {item.name}
                  </Link>
                  <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                </div>
                ${showSku ? `{item.sku && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">SKU: {item.sku}</p>
                )}` : ''}
                {item.variant && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">Variant: {item.variant}</p>
                )}
                {item.options && Object.keys(item.options).length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {Object.entries(item.options).map(([key, value]) => (
                      <span
                        key={key}
                        className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded"
                      >
                        {key}: {value}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Quantity */}
              <div className="text-center">
                ${editable ? `{onUpdateQuantity ? (
                  <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                    <button
                      onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-l-lg transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-10 text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-r-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Qty</p>
                    <p className="font-medium text-gray-900 dark:text-white">{item.quantity}</p>
                  </>
                )}` : `<>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Qty</p>
                  <p className="font-medium text-gray-900 dark:text-white">{item.quantity}</p>
                </>`}
              </div>

              {/* Price */}
              <div className="text-right min-w-[80px]">
                <p className="text-sm text-gray-500 dark:text-gray-400">\${item.price.toFixed(2)} each</p>
                <p className="font-semibold text-gray-900 dark:text-white">\${item.total.toFixed(2)}</p>
              </div>

              ${editable ? `{onRemoveItem && (
                <button
                  onClick={() => onRemoveItem(item.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}` : ''}
            </div>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <span className="font-medium text-gray-700 dark:text-gray-300">
            {items.reduce((sum, item) => sum + item.quantity, 0)} items
          </span>
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            Total: \${items.reduce((sum, item) => sum + item.total, 0).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export interface OrderFiltersOptions {
  componentName?: string;
  showDateRange?: boolean;
  showPaymentStatus?: boolean;
  showSearch?: boolean;
}

/**
 * Generate an OrderFilters component
 */
export function generateOrderFilters(options: OrderFiltersOptions = {}): string {
  const {
    componentName = 'OrderFilters',
    showDateRange = true,
    showPaymentStatus = true,
    showSearch = true,
  } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  Search,
  X,
  Filter,
  Calendar,
  Package,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  CreditCard
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface OrderFilterValues {
  search: string;
  status: string;
  paymentStatus: string;
  dateRange: { start: string; end: string };
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface ${componentName}Props {
  className?: string;
  values?: Partial<OrderFilterValues>;
  onChange?: (filters: OrderFilterValues) => void;
  onApply?: (filters: OrderFilterValues) => void;
}

const initialFilters: OrderFilterValues = {
  search: '',
  status: '',
  paymentStatus: '',
  dateRange: { start: '', end: '' },
  sortBy: 'created_at',
  sortOrder: 'desc',
};

const ${componentName}: React.FC<${componentName}Props> = ({
  className,
  values: propValues,
  onChange,
  onApply,
}) => {
  const [filters, setFilters] = useState<OrderFilterValues>(initialFilters);

  const currentFilters = { ...filters, ...propValues };

  const updateFilter = useCallback(<K extends keyof OrderFilterValues>(key: K, value: OrderFilterValues[K]) => {
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
    currentFilters.status ||
    currentFilters.paymentStatus ||
    currentFilters.dateRange.start ||
    currentFilters.dateRange.end;

  const orderStatuses = [
    { value: '', label: 'All Statuses', icon: Filter },
    { value: 'pending', label: 'Pending', icon: Clock },
    { value: 'processing', label: 'Processing', icon: Package },
    { value: 'shipped', label: 'Shipped', icon: Truck },
    { value: 'delivered', label: 'Delivered', icon: CheckCircle2 },
    { value: 'cancelled', label: 'Cancelled', icon: XCircle },
  ];

  const paymentStatuses = [
    { value: '', label: 'All Payments' },
    { value: 'paid', label: 'Paid' },
    { value: 'pending', label: 'Pending' },
    { value: 'failed', label: 'Failed' },
    { value: 'refunded', label: 'Refunded' },
  ];

  const sortOptions = [
    { value: 'created_at', label: 'Date' },
    { value: 'total', label: 'Total' },
    { value: 'status', label: 'Status' },
    { value: 'order_number', label: 'Order #' },
  ];

  return (
    <div className={cn(
      "bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4",
      className
    )}>
      <div className="flex flex-wrap items-end gap-4">
        ${showSearch ? `{/* Search */}
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={currentFilters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              placeholder="Search orders, customers..."
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

        {/* Status */}
        <div className="min-w-[150px]">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Order Status
          </label>
          <select
            value={currentFilters.status}
            onChange={(e) => updateFilter('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-blue-500"
          >
            {orderStatuses.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        ${showPaymentStatus ? `{/* Payment Status */}
        <div className="min-w-[150px]">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Payment Status
          </label>
          <select
            value={currentFilters.paymentStatus}
            onChange={(e) => updateFilter('paymentStatus', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-blue-500"
          >
            {paymentStatuses.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>` : ''}

        ${showDateRange ? `{/* Date Range */}
        <div className="min-w-[280px]">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Date Range
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={currentFilters.dateRange.start}
                onChange={(e) => updateFilter('dateRange', {
                  ...currentFilters.dateRange,
                  start: e.target.value
                })}
                className="w-full px-3 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <span className="text-gray-400">to</span>
            <div className="relative flex-1">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={currentFilters.dateRange.end}
                onChange={(e) => updateFilter('dateRange', {
                  ...currentFilters.dateRange,
                  end: e.target.value
                })}
                className="w-full px-3 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>` : ''}

        {/* Sort */}
        <div className="min-w-[120px]">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Sort By
          </label>
          <div className="flex gap-1">
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
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
            >
              {currentFilters.sortOrder === 'asc' ? '↑' : '↓'}
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

export interface OrderListReadyOptions {
  componentName?: string;
  endpoint?: string;
  showPagination?: boolean;
  showBulkActions?: boolean;
}

/**
 * Generate an OrderListReady component
 */
export function generateOrderListReady(options: OrderListReadyOptions = {}): string {
  const {
    componentName = 'OrderListReady',
    endpoint = '/orders',
    showPagination = true,
    showBulkActions = true,
  } = options;

  return `import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  MoreHorizontal,
  Eye,
  Printer,
  RefreshCw,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface Order {
  id: string;
  order_number?: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  item_count: number;
  created_at: string;
  customer?: {
    name: string;
    email: string;
  };
}

interface ${componentName}Props {
  className?: string;
  filters?: Record<string, any>;
  onOrderClick?: (order: Order) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  className,
  filters = {},
  onOrderClick,
}) => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['orders', page, filters],
    queryFn: async () => {
      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: '10',
          ...filters,
        });
        const response = await api.get<any>(\`${endpoint}?\${params}\`);
        return {
          orders: Array.isArray(response) ? response : (response?.data || []),
          total: response?.total || 0,
          totalPages: response?.totalPages || 1,
        };
      } catch (err) {
        console.error('Failed to fetch orders:', err);
        return { orders: [], total: 0, totalPages: 1 };
      }
    },
  });

  const orders = data?.orders || [];
  const totalPages = data?.totalPages || 1;

  const statusConfig = {
    pending: { icon: Clock, color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30' },
    processing: { icon: Package, color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' },
    shipped: { icon: Truck, color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30' },
    delivered: { icon: CheckCircle2, color: 'text-green-600 bg-green-100 dark:bg-green-900/30' },
    cancelled: { icon: XCircle, color: 'text-red-600 bg-red-100 dark:bg-red-900/30' },
  };

  const handleOrderClick = (order: Order) => {
    if (onOrderClick) {
      onOrderClick(order);
    } else {
      navigate(\`/orders/\${order.id}\`);
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === orders.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(orders.map((o: Order) => o.id)));
    }
  };

  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center py-12", className)}>
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className={cn("text-center py-12", className)}>
        <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">No orders found</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Orders will appear here when customers place them.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden", className)}>
      ${showBulkActions ? `{/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
          <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
            {selectedIds.size} order{selectedIds.size !== 1 ? 's' : ''} selected
          </span>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 text-sm font-medium text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors">
              Export
            </button>
            <button className="px-3 py-1.5 text-sm font-medium text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors">
              Print Labels
            </button>
          </div>
        </div>
      )}` : ''}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <tr>
              ${showBulkActions ? `<th className="w-12 px-4 py-3">
                <button
                  onClick={toggleSelectAll}
                  className={cn(
                    "w-5 h-5 rounded border flex items-center justify-center transition-colors",
                    selectedIds.size === orders.length && orders.length > 0
                      ? "bg-blue-600 border-blue-600"
                      : "border-gray-300 dark:border-gray-600"
                  )}
                >
                  {selectedIds.size === orders.length && orders.length > 0 && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </button>
              </th>` : ''}
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Order</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Items</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
              <th className="w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {orders.map((order: Order) => {
              const status = statusConfig[order.status];
              const StatusIcon = status.icon;

              return (
                <tr
                  key={order.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                  onClick={() => handleOrderClick(order)}
                >
                  ${showBulkActions ? `<td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => toggleSelect(order.id)}
                      className={cn(
                        "w-5 h-5 rounded border flex items-center justify-center transition-colors",
                        selectedIds.has(order.id)
                          ? "bg-blue-600 border-blue-600"
                          : "border-gray-300 dark:border-gray-600"
                      )}
                    >
                      {selectedIds.has(order.id) && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </button>
                  </td>` : ''}
                  <td className="px-4 py-4">
                    <span className="font-medium text-gray-900 dark:text-white">
                      #{order.order_number || order.id.slice(0, 8)}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    {order.customer ? (
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{order.customer.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{order.customer.email}</p>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <span className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                      status.color
                    )}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-gray-600 dark:text-gray-400">
                    {order.item_count} item{order.item_count !== 1 ? 's' : ''}
                  </td>
                  <td className="px-4 py-4 font-medium text-gray-900 dark:text-white">
                    \${order.total.toFixed(2)}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                    <div className="relative">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === order.id ? null : order.id)}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                      {openMenuId === order.id && (
                        <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10">
                          <button
                            onClick={() => handleOrderClick(order)}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            View Details
                          </button>
                          <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2">
                            <Printer className="w-4 h-4" />
                            Print Invoice
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      ${showPagination ? `{/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}` : ''}
    </div>
  );
};

export default ${componentName};
`;
}

export interface OrderQueueOptions {
  componentName?: string;
  endpoint?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

/**
 * Generate an OrderQueue component for processing orders
 */
export function generateOrderQueue(options: OrderQueueOptions = {}): string {
  const {
    componentName = 'OrderQueue',
    endpoint = '/orders',
    autoRefresh = true,
    refreshInterval = 30000,
  } = options;

  return `import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Package,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Loader2,
  RefreshCw,
  Timer,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface QueueOrder {
  id: string;
  order_number?: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  item_count: number;
  created_at: string;
  priority?: 'high' | 'normal' | 'low';
  customer?: {
    name: string;
  };
}

interface ${componentName}Props {
  className?: string;
  onProcessOrder?: (order: QueueOrder) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  className,
  onProcessOrder,
}) => {
  const queryClient = useQueryClient();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const { data: orders = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: ['order-queue'],
    queryFn: async () => {
      try {
        const response = await api.get<any>(\`${endpoint}?status=pending,processing&sort=created_at&order=asc\`);
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch order queue:', err);
        return [];
      }
    },
    ${autoRefresh ? `refetchInterval: ${refreshInterval},` : ''}
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await api.put(\`${endpoint}/\${id}/status\`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order-queue'] });
      toast.success('Order status updated');
    },
    onError: () => {
      toast.error('Failed to update order status');
    },
  });

  const handleProcess = async (order: QueueOrder) => {
    if (onProcessOrder) {
      onProcessOrder(order);
      return;
    }

    setProcessingId(order.id);
    try {
      if (order.status === 'pending') {
        await updateStatusMutation.mutateAsync({ id: order.id, status: 'processing' });
      } else if (order.status === 'processing') {
        await updateStatusMutation.mutateAsync({ id: order.id, status: 'shipped' });
      }
    } finally {
      setProcessingId(null);
    }
  };

  const getWaitTime = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diff = now.getTime() - created.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return \`\${hours}h \${minutes % 60}m\`;
    }
    return \`\${minutes}m\`;
  };

  const priorityConfig = {
    high: { color: 'text-red-600 bg-red-100 dark:bg-red-900/30', label: 'High' },
    normal: { color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30', label: 'Normal' },
    low: { color: 'text-gray-600 bg-gray-100 dark:bg-gray-700', label: 'Low' },
  };

  const pendingOrders = orders.filter((o: QueueOrder) => o.status === 'pending');
  const processingOrders = orders.filter((o: QueueOrder) => o.status === 'processing');

  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center py-12", className)}>
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Order Queue</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {orders.length} order{orders.length !== 1 ? 's' : ''} awaiting processing
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <RefreshCw className={cn("w-4 h-4", isFetching && "animate-spin")} />
          Refresh
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <CheckCircle2 className="mx-auto h-12 w-12 text-green-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Queue is Empty</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            All orders have been processed. Great job!
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Pending Column */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Pending</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{pendingOrders.length} orders</p>
              </div>
            </div>

            <div className="space-y-3">
              {pendingOrders.map((order: QueueOrder) => {
                const priority = priorityConfig[order.priority || 'normal'];

                return (
                  <div
                    key={order.id}
                    className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-white">
                          #{order.order_number || order.id.slice(0, 8)}
                        </span>
                        {order.priority && order.priority !== 'normal' && (
                          <span className={cn(
                            "px-2 py-0.5 rounded text-xs font-medium",
                            priority.color
                          )}>
                            {priority.label}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                        <Timer className="w-3.5 h-3.5" />
                        <span>{getWaitTime(order.created_at)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {order.customer?.name || 'Guest'}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {order.item_count} item{order.item_count !== 1 ? 's' : ''} - \${order.total.toFixed(2)}
                        </p>
                      </div>
                      <button
                        onClick={() => handleProcess(order)}
                        disabled={processingId === order.id}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {processingId === order.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            Start
                            <ChevronRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Processing Column */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Processing</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{processingOrders.length} orders</p>
              </div>
            </div>

            <div className="space-y-3">
              {processingOrders.map((order: QueueOrder) => (
                <div
                  key={order.id}
                  className="bg-white dark:bg-gray-800 rounded-xl border-2 border-blue-200 dark:border-blue-800 p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-gray-900 dark:text-white">
                      #{order.order_number || order.id.slice(0, 8)}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium text-blue-600 bg-blue-100 dark:bg-blue-900/30">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      In Progress
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {order.customer?.name || 'Guest'}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {order.item_count} item{order.item_count !== 1 ? 's' : ''} - \${order.total.toFixed(2)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleProcess(order)}
                      disabled={processingId === order.id}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {processingId === order.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Truck className="w-4 h-4" />
                          Ship
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}

              {processingOrders.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No orders in progress</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}
