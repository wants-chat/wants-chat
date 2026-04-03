/**
 * Custom Order Component Generators for Ecommerce
 *
 * Generates custom order management components:
 * - CustomOrderList: Customizable order list with advanced features
 */

export interface CustomOrderListOptions {
  componentName?: string;
  endpoint?: string;
  columns?: Array<{
    key: string;
    label: string;
    sortable?: boolean;
    width?: string;
  }>;
  showStatusBadges?: boolean;
  showCustomerInfo?: boolean;
  showItemPreview?: boolean;
  showQuickActions?: boolean;
  enableRowSelection?: boolean;
  enableInlineEdit?: boolean;
  showExport?: boolean;
  defaultSort?: { key: string; order: 'asc' | 'desc' };
}

/**
 * Generate a CustomOrderList component with advanced features
 */
export function generateCustomOrderList(options: CustomOrderListOptions = {}): string {
  const {
    componentName = 'CustomOrderList',
    endpoint = '/orders',
    columns = [
      { key: 'order_number', label: 'Order #', sortable: true },
      { key: 'customer', label: 'Customer', sortable: true },
      { key: 'status', label: 'Status', sortable: true },
      { key: 'items', label: 'Items', sortable: false },
      { key: 'total', label: 'Total', sortable: true },
      { key: 'created_at', label: 'Date', sortable: true },
    ],
    showStatusBadges = true,
    showCustomerInfo = true,
    showItemPreview = true,
    showQuickActions = true,
    enableRowSelection = true,
    enableInlineEdit = false,
    showExport = true,
    defaultSort = { key: 'created_at', order: 'desc' },
  } = options;

  return `import React, { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  Download,
  Trash2,
  Edit2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Filter,
  RefreshCw,
  FileSpreadsheet,
  Mail,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  image?: string;
}

interface Order {
  id: string;
  order_number?: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status?: 'paid' | 'pending' | 'failed' | 'refunded';
  total: number;
  item_count: number;
  items?: OrderItem[];
  created_at: string;
  updated_at?: string;
  customer?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  shipping_address?: {
    city: string;
    country: string;
  };
  notes?: string;
}

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
}

interface ${componentName}Props {
  className?: string;
  filters?: Record<string, any>;
  onOrderClick?: (order: Order) => void;
  onBulkAction?: (action: string, orderIds: string[]) => void;
  customColumns?: Column[];
  renderCell?: (column: string, order: Order) => React.ReactNode;
  pageSize?: number;
}

const defaultColumns: Column[] = ${JSON.stringify(columns, null, 2)};

const ${componentName}: React.FC<${componentName}Props> = ({
  className,
  filters: propFilters = {},
  onOrderClick,
  onBulkAction,
  customColumns,
  renderCell,
  pageSize = 10,
}) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const columns = customColumns || defaultColumns;

  // State
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<string>('${defaultSort.key}');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('${defaultSort.order}');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<Order>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Build query params
  const queryParams = useMemo(() => ({
    page: String(page),
    limit: String(pageSize),
    sortBy: sortKey,
    sortOrder,
    ...propFilters,
  }), [page, pageSize, sortKey, sortOrder, propFilters]);

  // Fetch orders
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['custom-orders', queryParams],
    queryFn: async () => {
      try {
        const params = new URLSearchParams(queryParams);
        const response = await api.get<any>(\`${endpoint}?\${params}\`);
        return {
          orders: Array.isArray(response) ? response : (response?.data || []),
          total: response?.total || 0,
          totalPages: response?.totalPages || Math.ceil((response?.total || 0) / pageSize),
        };
      } catch (err) {
        console.error('Failed to fetch orders:', err);
        return { orders: [], total: 0, totalPages: 1 };
      }
    },
  });

  const orders = data?.orders || [];
  const totalPages = data?.totalPages || 1;
  const totalOrders = data?.total || 0;

  // Update order mutation
  ${enableInlineEdit ? `const updateOrderMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Order> }) => {
      await api.put(\`${endpoint}/\${id}\`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-orders'] });
      toast.success('Order updated');
      setEditingId(null);
      setEditValues({});
    },
    onError: () => {
      toast.error('Failed to update order');
    },
  });` : ''}

  // Delete order mutation
  const deleteOrderMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(\`${endpoint}/\${id}\`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-orders'] });
      toast.success('Order deleted');
    },
    onError: () => {
      toast.error('Failed to delete order');
    },
  });

  // Status config
  const statusConfig = {
    pending: { icon: Clock, color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30' },
    processing: { icon: Package, color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' },
    shipped: { icon: Truck, color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30' },
    delivered: { icon: CheckCircle2, color: 'text-green-600 bg-green-100 dark:bg-green-900/30' },
    cancelled: { icon: XCircle, color: 'text-red-600 bg-red-100 dark:bg-red-900/30' },
  };

  const paymentStatusConfig = {
    paid: 'text-green-600 bg-green-100 dark:bg-green-900/30',
    pending: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30',
    failed: 'text-red-600 bg-red-100 dark:bg-red-900/30',
    refunded: 'text-gray-600 bg-gray-100 dark:bg-gray-700',
  };

  // Handlers
  const handleSort = useCallback((key: string) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
    setPage(1);
  }, [sortKey, sortOrder]);

  const handleOrderClick = useCallback((order: Order) => {
    if (onOrderClick) {
      onOrderClick(order);
    } else {
      navigate(\`/orders/\${order.id}\`);
    }
  }, [onOrderClick, navigate]);

  ${enableRowSelection ? `const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === orders.length && orders.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(orders.map((o: Order) => o.id)));
    }
  }, [selectedIds.size, orders]);

  const handleBulkAction = useCallback((action: string) => {
    if (onBulkAction) {
      onBulkAction(action, Array.from(selectedIds));
    } else {
      toast.success(\`\${action} action for \${selectedIds.size} orders\`);
    }
    setSelectedIds(new Set());
  }, [selectedIds, onBulkAction]);` : ''}

  ${enableInlineEdit ? `const startEdit = useCallback((order: Order) => {
    setEditingId(order.id);
    setEditValues({ status: order.status, notes: order.notes });
    setOpenMenuId(null);
  }, []);

  const saveEdit = useCallback(() => {
    if (editingId && Object.keys(editValues).length > 0) {
      updateOrderMutation.mutate({ id: editingId, updates: editValues });
    }
  }, [editingId, editValues, updateOrderMutation]);

  const cancelEdit = useCallback(() => {
    setEditingId(null);
    setEditValues({});
  }, []);` : ''}

  ${showExport ? `const handleExport = useCallback(async (format: 'csv' | 'excel') => {
    try {
      const params = new URLSearchParams(propFilters);
      const response = await api.get(\`${endpoint}/export?\${params}&format=\${format}\`);
      toast.success(\`Export started (\${format.toUpperCase()})\`);
    } catch (err) {
      toast.error('Export failed');
    }
  }, [propFilters]);` : ''}

  // Render cell content
  const renderCellContent = useCallback((column: string, order: Order) => {
    // Custom render function
    if (renderCell) {
      const custom = renderCell(column, order);
      if (custom !== undefined) return custom;
    }

    switch (column) {
      case 'order_number':
        return (
          <span className="font-medium text-gray-900 dark:text-white">
            #{order.order_number || order.id.slice(0, 8)}
          </span>
        );

      case 'customer':
        ${showCustomerInfo ? `return order.customer ? (
          <div className="flex items-center gap-2">
            {order.customer.avatar ? (
              <img
                src={order.customer.avatar}
                alt={order.customer.name}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {order.customer.name.charAt(0)}
                </span>
              </div>
            )}
            <div>
              <p className="font-medium text-gray-900 dark:text-white">{order.customer.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{order.customer.email}</p>
            </div>
          </div>
        ) : (
          <span className="text-gray-400">Guest</span>
        );` : `return order.customer?.name || 'Guest';`}

      case 'status':
        ${showStatusBadges ? `{
          const status = statusConfig[order.status];
          const StatusIcon = status?.icon || Package;

          ${enableInlineEdit ? `if (editingId === order.id) {
            return (
              <select
                value={editValues.status || order.status}
                onChange={(e) => setEditValues({ ...editValues, status: e.target.value as any })}
                className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                onClick={(e) => e.stopPropagation()}
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            );
          }` : ''}

          return (
            <span className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
              status?.color || 'text-gray-600 bg-gray-100'
            )}>
              <StatusIcon className="w-3.5 h-3.5" />
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
          );
        }` : `return order.status;`}

      case 'payment_status':
        return (
          <span className={cn(
            "px-2 py-0.5 rounded text-xs font-medium",
            paymentStatusConfig[order.payment_status || 'pending']
          )}>
            {(order.payment_status || 'pending').charAt(0).toUpperCase() + (order.payment_status || 'pending').slice(1)}
          </span>
        );

      case 'items':
        ${showItemPreview ? `return (
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {(order.items || []).slice(0, 3).map((item, i) => (
                <div
                  key={item.id || i}
                  className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 border-2 border-white dark:border-gray-800 overflow-hidden"
                >
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <Package className="w-4 h-4 m-2 text-gray-400" />
                  )}
                </div>
              ))}
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {order.item_count} item{order.item_count !== 1 ? 's' : ''}
            </span>
          </div>
        );` : `return order.item_count + ' item' + (order.item_count !== 1 ? 's' : '');`}

      case 'total':
        return (
          <span className="font-medium text-gray-900 dark:text-white">
            \${order.total.toFixed(2)}
          </span>
        );

      case 'created_at':
      case 'updated_at':
        const date = order[column];
        return date ? (
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {new Date(date).toLocaleDateString()}
          </span>
        ) : '-';

      case 'shipping':
        return order.shipping_address ? (
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {order.shipping_address.city}, {order.shipping_address.country}
          </span>
        ) : '-';

      default:
        return (order as any)[column] || '-';
    }
  }, [renderCell${enableInlineEdit ? ', editingId, editValues' : ''}]);

  // Loading state
  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center py-12", className)}>
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {totalOrders} order{totalOrders !== 1 ? 's' : ''}
          </span>
          ${enableRowSelection ? `{selectedIds.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                {selectedIds.size} selected
              </span>
              <button
                onClick={() => handleBulkAction('export')}
                className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                Export
              </button>
              <button
                onClick={() => handleBulkAction('print')}
                className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                Print
              </button>
              <button
                onClick={() => handleBulkAction('email')}
                className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                Email
              </button>
            </div>
          )}` : ''}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <RefreshCw className={cn("w-4 h-4", isFetching && "animate-spin")} />
          </button>
          ${showExport ? `<div className="relative">
            <button
              onClick={() => handleExport('csv')}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>` : ''}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">No orders found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Try adjusting your filters or check back later.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    ${enableRowSelection ? `<th className="w-12 px-4 py-3">
                      <button
                        onClick={toggleSelectAll}
                        className={cn(
                          "w-5 h-5 rounded border flex items-center justify-center transition-colors",
                          selectedIds.size === orders.length && orders.length > 0
                            ? "bg-blue-600 border-blue-600"
                            : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
                        )}
                      >
                        {selectedIds.size === orders.length && orders.length > 0 && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </button>
                    </th>` : ''}
                    {columns.map((col) => (
                      <th
                        key={col.key}
                        className={cn(
                          "px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider",
                          col.sortable && "cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
                        )}
                        style={{ width: col.width }}
                        onClick={() => col.sortable && handleSort(col.key)}
                      >
                        <div className="flex items-center gap-1">
                          {col.label}
                          {col.sortable && (
                            sortKey === col.key ? (
                              sortOrder === 'asc' ? (
                                <ArrowUp className="w-3.5 h-3.5" />
                              ) : (
                                <ArrowDown className="w-3.5 h-3.5" />
                              )
                            ) : (
                              <ArrowUpDown className="w-3.5 h-3.5 opacity-50" />
                            )
                          )}
                        </div>
                      </th>
                    ))}
                    ${showQuickActions ? `<th className="w-12"></th>` : ''}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {orders.map((order: Order) => (
                    <tr
                      key={order.id}
                      className={cn(
                        "hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors",
                        ${enableRowSelection ? `selectedIds.has(order.id) && "bg-blue-50 dark:bg-blue-900/10",` : ''}
                        ${enableInlineEdit ? `editingId === order.id ? "cursor-default" : "cursor-pointer"` : '"cursor-pointer"'}
                      )}
                      onClick={() => ${enableInlineEdit ? `editingId !== order.id && ` : ''}handleOrderClick(order)}
                    >
                      ${enableRowSelection ? `<td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => toggleSelect(order.id)}
                          className={cn(
                            "w-5 h-5 rounded border flex items-center justify-center transition-colors",
                            selectedIds.has(order.id)
                              ? "bg-blue-600 border-blue-600"
                              : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
                          )}
                        >
                          {selectedIds.has(order.id) && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </button>
                      </td>` : ''}
                      {columns.map((col) => (
                        <td key={col.key} className="px-4 py-4">
                          {renderCellContent(col.key, order)}
                        </td>
                      ))}
                      ${showQuickActions ? `<td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                        ${enableInlineEdit ? `{editingId === order.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={saveEdit}
                              disabled={updateOrderMutation.isPending}
                              className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                            >
                              {updateOrderMutation.isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Check className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (` : ''}
                          <div className="relative">
                            <button
                              onClick={() => setOpenMenuId(openMenuId === order.id ? null : order.id)}
                              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                            {openMenuId === order.id && (
                              <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-20">
                                <button
                                  onClick={() => {
                                    handleOrderClick(order);
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                                >
                                  <Eye className="w-4 h-4" />
                                  View Details
                                </button>
                                ${enableInlineEdit ? `<button
                                  onClick={() => startEdit(order)}
                                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                                >
                                  <Edit2 className="w-4 h-4" />
                                  Quick Edit
                                </button>` : ''}
                                <button
                                  onClick={() => {
                                    toast.success('Invoice printed');
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                                >
                                  <Printer className="w-4 h-4" />
                                  Print Invoice
                                </button>
                                <button
                                  onClick={() => {
                                    toast.success('Email sent');
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                                >
                                  <Mail className="w-4 h-4" />
                                  Send Email
                                </button>
                                <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
                                <button
                                  onClick={() => {
                                    if (confirm('Delete this order?')) {
                                      deleteOrderMutation.mutate(order.id);
                                    }
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        ${enableInlineEdit ? `)}` : ''}
                      </td>` : ''}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, totalOrders)} of {totalOrders}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        pageNum = i + 1;
                      } else if (page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={cn(
                            "w-8 h-8 text-sm font-medium rounded-lg transition-colors",
                            page === pageNum
                              ? "bg-blue-600 text-white"
                              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          )}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}
