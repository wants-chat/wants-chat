/**
 * Optics Generator
 *
 * Generates optics/optician business related components:
 * - LensOrderListPending: List of pending lens orders
 * - CustomerPrescriptionsOptician: Customer prescription management
 */

import { pascalCase, snakeCase } from 'change-case';
import pluralize from 'pluralize';

export interface LensOrderListPendingOptions {
  componentName?: string;
  endpoint?: string;
  queryKey?: string;
  showCustomer?: boolean;
  showPrescription?: boolean;
  showStatus?: boolean;
  showActions?: boolean;
  maxItems?: number;
}

export interface CustomerPrescriptionsOpticianOptions {
  componentName?: string;
  endpoint?: string;
  queryKey?: string;
  showHistory?: boolean;
  showExpiry?: boolean;
  showActions?: boolean;
}

/**
 * Generate a LensOrderListPending component
 */
export function generateLensOrderListPending(options: LensOrderListPendingOptions = {}): string {
  const {
    componentName = 'LensOrderListPending',
    endpoint = '/lens-orders/pending',
    queryKey = 'lens-orders-pending',
    showCustomer = true,
    showPrescription = true,
    showStatus = true,
    showActions = true,
    maxItems = 20,
  } = options;

  return `import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Eye,
  Glasses,
  User,
  Clock,
  Calendar,
  CheckCircle,
  AlertCircle,
  Package,
  Phone,
  Mail,
  MoreVertical,
  Loader2,
  X,
  FileText,
  Printer,
  Send,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface LensOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  prescriptionId?: string;

  // Lens Details
  lensType: string;
  lensCoating?: string;
  frameType?: string;
  frameBrand?: string;

  // Prescription
  rightSphere?: number;
  rightCylinder?: number;
  rightAxis?: number;
  rightAdd?: number;
  leftSphere?: number;
  leftCylinder?: number;
  leftAxis?: number;
  leftAdd?: number;
  pd?: number;

  // Order Info
  status: 'pending' | 'processing' | 'lab' | 'quality_check' | 'ready' | 'delivered' | 'cancelled';
  priority: 'normal' | 'urgent' | 'rush';
  orderedAt: string;
  promisedDate?: string;
  estimatedDate?: string;
  notes?: string;
  total?: number;
}

interface ${componentName}Props {
  orders?: LensOrder[];
  className?: string;
  onOrderClick?: (order: LensOrder) => void;
  onViewAll?: () => void;
}

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  pending: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400' },
  processing: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400' },
  lab: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400' },
  quality_check: { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-700 dark:text-indigo-400' },
  ready: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400' },
  delivered: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-700 dark:text-gray-300' },
  cancelled: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400' },
};

const PRIORITY_STYLES: Record<string, string> = {
  normal: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  urgent: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  rush: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const ${componentName}: React.FC<${componentName}Props> = ({
  orders: propOrders,
  className,
  onOrderClick,
  onViewAll,
}) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<LensOrder | null>(null);

  const { data: fetchedOrders, isLoading } = useQuery({
    queryKey: ['${queryKey}'],
    queryFn: async () => {
      try {
        const response = await api.get<any>(\`${endpoint}?limit=${maxItems}\`);
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch pending lens orders:', err);
        return [];
      }
    },
    enabled: !propOrders,
    refetchInterval: 60000, // Refresh every minute
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await api.put(\`/lens-orders/\${id}/status\`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['${queryKey}'] });
    },
  });

  const orders = propOrders || fetchedOrders || [];

  const handleStatusUpdate = (orderId: string, status: string) => {
    updateStatusMutation.mutate({ id: orderId, status });
    setOpenMenu(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const formatPrescription = (order: LensOrder) => {
    const parts = [];
    if (order.rightSphere !== undefined) {
      parts.push(\`OD: \${order.rightSphere >= 0 ? '+' : ''}\${order.rightSphere}\`);
    }
    if (order.leftSphere !== undefined) {
      parts.push(\`OS: \${order.leftSphere >= 0 ? '+' : ''}\${order.leftSphere}\`);
    }
    return parts.join(' / ') || 'N/A';
  };

  const isOverdue = (promisedDate?: string) => {
    if (!promisedDate) return false;
    return new Date(promisedDate) < new Date();
  };

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center py-12', className)}>
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className={cn('bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8', className)}>
        <div className="text-center">
          <Glasses className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No pending lens orders</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={cn('bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700', className)}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Glasses className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Pending Lens Orders</h3>
              <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 text-xs font-medium rounded-full">
                {orders.length}
              </span>
            </div>
            {onViewAll && (
              <button
                onClick={onViewAll}
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                View All
              </button>
            )}
          </div>
        </div>

        {/* Orders List */}
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {orders.map((order: LensOrder) => (
            <div
              key={order.id}
              className={cn(
                'p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors',
                isOverdue(order.promisedDate) && 'bg-red-50 dark:bg-red-900/10'
              )}
            >
              <div className="flex items-start gap-4">
                {/* Order Icon */}
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Eye className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>

                {/* Order Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      onClick={() => onOrderClick?.(order) || navigate(\`/lens-orders/\${order.id}\`)}
                      className="font-medium text-gray-900 dark:text-white cursor-pointer hover:text-blue-600"
                    >
                      #{order.orderNumber}
                    </span>
                    ${showStatus ? `<span className={cn('px-2 py-0.5 text-xs font-medium rounded-full capitalize', STATUS_STYLES[order.status]?.bg, STATUS_STYLES[order.status]?.text)}>
                      {order.status.replace('_', ' ')}
                    </span>` : ''}
                    {order.priority !== 'normal' && (
                      <span className={cn('px-2 py-0.5 text-xs font-medium rounded-full uppercase', PRIORITY_STYLES[order.priority])}>
                        {order.priority}
                      </span>
                    )}
                    {isOverdue(order.promisedDate) && (
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-xs font-medium rounded-full flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Overdue
                      </span>
                    )}
                  </div>

                  ${showCustomer ? `<div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <User className="w-4 h-4" />
                    <span>{order.customerName}</span>
                    {order.customerPhone && (
                      <>
                        <span className="text-gray-300">|</span>
                        <Phone className="w-3 h-3" />
                        <span>{order.customerPhone}</span>
                      </>
                    )}
                  </div>` : ''}

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Glasses className="w-4 h-4" />
                      {order.lensType}
                      {order.lensCoating && \` + \${order.lensCoating}\`}
                    </span>
                    ${showPrescription ? `<span className="flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      {formatPrescription(order)}
                    </span>` : ''}
                  </div>

                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Ordered: {formatDate(order.orderedAt)}
                    </span>
                    {order.promisedDate && (
                      <span className={cn(
                        'flex items-center gap-1',
                        isOverdue(order.promisedDate) && 'text-red-600 font-medium'
                      )}>
                        <Clock className="w-3 h-3" />
                        Due: {formatDate(order.promisedDate)}
                      </span>
                    )}
                  </div>
                </div>

                ${showActions ? `{/* Actions */}
                <div className="flex items-center gap-2">
                  {order.status === 'pending' && (
                    <button
                      onClick={() => handleStatusUpdate(order.id, 'processing')}
                      className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                    >
                      Start
                    </button>
                  )}
                  {order.status === 'processing' && (
                    <button
                      onClick={() => handleStatusUpdate(order.id, 'lab')}
                      className="px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700"
                    >
                      Send to Lab
                    </button>
                  )}
                  {order.status === 'quality_check' && (
                    <button
                      onClick={() => handleStatusUpdate(order.id, 'ready')}
                      className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                    >
                      Mark Ready
                    </button>
                  )}
                  <div className="relative">
                    <button
                      onClick={() => setOpenMenu(openMenu === order.id ? null : order.id)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                    >
                      <MoreVertical className="w-4 h-4 text-gray-500" />
                    </button>
                    {openMenu === order.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(null)} />
                        <div className="absolute right-0 top-10 z-20 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1">
                          <button
                            onClick={() => { setSelectedOrder(order); setOpenMenu(null); }}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                          >
                            <Eye className="w-4 h-4" /> View Details
                          </button>
                          <button
                            onClick={() => { window.print(); setOpenMenu(null); }}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                          >
                            <Printer className="w-4 h-4" /> Print Order
                          </button>
                          <button
                            onClick={() => { /* Send notification */ setOpenMenu(null); }}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                          >
                            <Send className="w-4 h-4" /> Notify Customer
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>` : ''}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSelectedOrder(null)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Order #{selectedOrder.orderNumber}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{selectedOrder.customerName}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Right Eye (OD)</h4>
                  <div className="space-y-1 text-sm">
                    <p>SPH: {selectedOrder.rightSphere ?? 'N/A'}</p>
                    <p>CYL: {selectedOrder.rightCylinder ?? 'N/A'}</p>
                    <p>AXIS: {selectedOrder.rightAxis ?? 'N/A'}</p>
                    <p>ADD: {selectedOrder.rightAdd ?? 'N/A'}</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Left Eye (OS)</h4>
                  <div className="space-y-1 text-sm">
                    <p>SPH: {selectedOrder.leftSphere ?? 'N/A'}</p>
                    <p>CYL: {selectedOrder.leftCylinder ?? 'N/A'}</p>
                    <p>AXIS: {selectedOrder.leftAxis ?? 'N/A'}</p>
                    <p>ADD: {selectedOrder.leftAdd ?? 'N/A'}</p>
                  </div>
                </div>
              </div>
              {selectedOrder.pd && (
                <p className="text-sm"><strong>PD:</strong> {selectedOrder.pd}mm</p>
              )}
              <p className="text-sm"><strong>Lens Type:</strong> {selectedOrder.lensType}</p>
              {selectedOrder.lensCoating && (
                <p className="text-sm"><strong>Coating:</strong> {selectedOrder.lensCoating}</p>
              )}
              {selectedOrder.notes && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Notes</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{selectedOrder.notes}</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { navigate(\`/lens-orders/\${selectedOrder.id}\`); setSelectedOrder(null); }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                View Full Details
              </button>
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ${componentName};
`;
}

/**
 * Generate a CustomerPrescriptionsOptician component
 */
export function generateCustomerPrescriptionsOptician(options: CustomerPrescriptionsOpticianOptions = {}): string {
  const {
    componentName = 'CustomerPrescriptionsOptician',
    endpoint = '/prescriptions',
    queryKey = 'customer-prescriptions',
    showHistory = true,
    showExpiry = true,
    showActions = true,
  } = options;

  return `import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Eye,
  FileText,
  Calendar,
  Clock,
  Plus,
  Edit2,
  Printer,
  Download,
  AlertTriangle,
  CheckCircle,
  MoreVertical,
  User,
  Loader2,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface Prescription {
  id: string;
  customerId: string;
  customerName?: string;
  optometristName?: string;
  examinationDate: string;
  expiryDate?: string;

  // Right Eye (OD)
  rightSphere?: number;
  rightCylinder?: number;
  rightAxis?: number;
  rightAdd?: number;
  rightPrism?: number;
  rightBase?: string;
  rightVa?: string;

  // Left Eye (OS)
  leftSphere?: number;
  leftCylinder?: number;
  leftAxis?: number;
  leftAdd?: number;
  leftPrism?: number;
  leftBase?: string;
  leftVa?: string;

  // Additional
  pd?: number;
  pdRight?: number;
  pdLeft?: number;
  notes?: string;
  recommendations?: string;
  isActive: boolean;
  createdAt: string;
}

interface ${componentName}Props {
  prescriptions?: Prescription[];
  customerId?: string;
  className?: string;
  onPrescriptionClick?: (prescription: Prescription) => void;
  onAddNew?: () => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  prescriptions: propPrescriptions,
  customerId: propCustomerId,
  className,
  onPrescriptionClick,
  onAddNew,
}) => {
  const { id: paramId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const customerId = propCustomerId || paramId;

  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);

  const { data: fetchedPrescriptions, isLoading } = useQuery({
    queryKey: ['${queryKey}', customerId],
    queryFn: async () => {
      try {
        const url = customerId ? \`${endpoint}?customerId=\${customerId}\` : '${endpoint}';
        const response = await api.get<any>(url);
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch prescriptions:', err);
        return [];
      }
    },
    enabled: !propPrescriptions,
  });

  const prescriptions = propPrescriptions || fetchedPrescriptions || [];

  const isExpired = (expiryDate?: string) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  const isExpiringSoon = (expiryDate?: string) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    return expiry > now && expiry <= thirtyDaysFromNow;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatValue = (value?: number, prefix?: string) => {
    if (value === undefined || value === null) return '-';
    const sign = value >= 0 ? '+' : '';
    return \`\${prefix || ''}\${sign}\${value.toFixed(2)}\`;
  };

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center py-12', className)}>
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <>
      <div className={cn('space-y-4', className)}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Prescriptions</h2>
          </div>
          ${showActions ? `{onAddNew && (
            <button
              onClick={onAddNew}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              New Prescription
            </button>
          )}` : ''}
        </div>

        {/* Prescriptions List */}
        {prescriptions.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No prescriptions on file</p>
            ${showActions ? `{onAddNew && (
              <button
                onClick={onAddNew}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                Add First Prescription
              </button>
            )}` : ''}
          </div>
        ) : (
          <div className="space-y-4">
            {prescriptions.map((prescription: Prescription, index: number) => {
              const expired = isExpired(prescription.expiryDate);
              const expiringSoon = isExpiringSoon(prescription.expiryDate);

              return (
                <div
                  key={prescription.id}
                  className={cn(
                    'bg-white dark:bg-gray-800 rounded-xl shadow-sm border overflow-hidden',
                    expired
                      ? 'border-red-200 dark:border-red-800'
                      : expiringSoon
                        ? 'border-yellow-200 dark:border-yellow-800'
                        : 'border-gray-200 dark:border-gray-700',
                    index === 0 && prescription.isActive && 'ring-2 ring-blue-500'
                  )}
                >
                  {/* Card Header */}
                  <div className={cn(
                    'px-4 py-3 flex items-center justify-between',
                    expired
                      ? 'bg-red-50 dark:bg-red-900/20'
                      : expiringSoon
                        ? 'bg-yellow-50 dark:bg-yellow-900/20'
                        : index === 0 && prescription.isActive
                          ? 'bg-blue-50 dark:bg-blue-900/20'
                          : 'bg-gray-50 dark:bg-gray-800/50'
                  )}>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {formatDate(prescription.examinationDate)}
                        </span>
                      </div>
                      {index === 0 && prescription.isActive && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs font-medium rounded-full">
                          Current
                        </span>
                      )}
                      {expired && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-xs font-medium rounded-full flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Expired
                        </span>
                      )}
                      {expiringSoon && !expired && (
                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 text-xs font-medium rounded-full flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Expiring Soon
                        </span>
                      )}
                    </div>

                    ${showActions ? `<div className="flex items-center gap-2">
                      <button
                        onClick={() => window.print()}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                        title="Print"
                      >
                        <Printer className="w-4 h-4 text-gray-500" />
                      </button>
                      <div className="relative">
                        <button
                          onClick={() => setOpenMenu(openMenu === prescription.id ? null : prescription.id)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                        >
                          <MoreVertical className="w-4 h-4 text-gray-500" />
                        </button>
                        {openMenu === prescription.id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(null)} />
                            <div className="absolute right-0 top-10 z-20 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1">
                              <button
                                onClick={() => { setSelectedPrescription(prescription); setOpenMenu(null); }}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                              >
                                <Eye className="w-4 h-4" /> View Full Details
                              </button>
                              <button
                                onClick={() => { navigate(\`/prescriptions/\${prescription.id}/edit\`); setOpenMenu(null); }}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                              >
                                <Edit2 className="w-4 h-4" /> Edit
                              </button>
                              <button
                                onClick={() => setOpenMenu(null)}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                              >
                                <Download className="w-4 h-4" /> Download PDF
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>` : ''}
                  </div>

                  {/* Prescription Details */}
                  <div className="p-4">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-gray-500 border-b border-gray-200 dark:border-gray-700">
                            <th className="pb-2 font-medium">Eye</th>
                            <th className="pb-2 font-medium">SPH</th>
                            <th className="pb-2 font-medium">CYL</th>
                            <th className="pb-2 font-medium">AXIS</th>
                            <th className="pb-2 font-medium">ADD</th>
                            <th className="pb-2 font-medium">VA</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-gray-100 dark:border-gray-700/50">
                            <td className="py-2 font-medium text-gray-900 dark:text-white">OD (R)</td>
                            <td className="py-2">{formatValue(prescription.rightSphere)}</td>
                            <td className="py-2">{formatValue(prescription.rightCylinder)}</td>
                            <td className="py-2">{prescription.rightAxis ?? '-'}</td>
                            <td className="py-2">{formatValue(prescription.rightAdd)}</td>
                            <td className="py-2">{prescription.rightVa || '-'}</td>
                          </tr>
                          <tr>
                            <td className="py-2 font-medium text-gray-900 dark:text-white">OS (L)</td>
                            <td className="py-2">{formatValue(prescription.leftSphere)}</td>
                            <td className="py-2">{formatValue(prescription.leftCylinder)}</td>
                            <td className="py-2">{prescription.leftAxis ?? '-'}</td>
                            <td className="py-2">{formatValue(prescription.leftAdd)}</td>
                            <td className="py-2">{prescription.leftVa || '-'}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-600 dark:text-gray-400">
                      {(prescription.pd || prescription.pdRight) && (
                        <span>
                          <strong>PD:</strong>{' '}
                          {prescription.pdRight && prescription.pdLeft
                            ? \`\${prescription.pdRight}/\${prescription.pdLeft}mm\`
                            : \`\${prescription.pd}mm\`}
                        </span>
                      )}
                      ${showExpiry ? `{prescription.expiryDate && (
                        <span className={cn(
                          expired && 'text-red-600',
                          expiringSoon && !expired && 'text-yellow-600'
                        )}>
                          <strong>Expires:</strong> {formatDate(prescription.expiryDate)}
                        </span>
                      )}` : ''}
                      {prescription.optometristName && (
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {prescription.optometristName}
                        </span>
                      )}
                    </div>

                    {prescription.notes && (
                      <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <strong>Notes:</strong> {prescription.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Full Prescription Modal */}
      {selectedPrescription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSelectedPrescription(null)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Prescription Details
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Examination Date: {formatDate(selectedPrescription.examinationDate)}
                </p>
              </div>
              <button onClick={() => setSelectedPrescription(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Full prescription table and details */}
              <div className="grid grid-cols-2 gap-6">
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Right Eye (OD)</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Sphere:</strong> {formatValue(selectedPrescription.rightSphere)}</p>
                    <p><strong>Cylinder:</strong> {formatValue(selectedPrescription.rightCylinder)}</p>
                    <p><strong>Axis:</strong> {selectedPrescription.rightAxis ?? 'N/A'}</p>
                    <p><strong>Add:</strong> {formatValue(selectedPrescription.rightAdd)}</p>
                    <p><strong>Visual Acuity:</strong> {selectedPrescription.rightVa || 'N/A'}</p>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Left Eye (OS)</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Sphere:</strong> {formatValue(selectedPrescription.leftSphere)}</p>
                    <p><strong>Cylinder:</strong> {formatValue(selectedPrescription.leftCylinder)}</p>
                    <p><strong>Axis:</strong> {selectedPrescription.leftAxis ?? 'N/A'}</p>
                    <p><strong>Add:</strong> {formatValue(selectedPrescription.leftAdd)}</p>
                    <p><strong>Visual Acuity:</strong> {selectedPrescription.leftVa || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {selectedPrescription.recommendations && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Recommendations</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{selectedPrescription.recommendations}</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setSelectedPrescription(null)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ${componentName};
`;
}

/**
 * Generate optics components for a specific domain
 */
export function generateOpticsComponents(domain: string = 'optics'): { lensOrders: string; prescriptions: string } {
  const pascalDomain = pascalCase(domain);

  return {
    lensOrders: generateLensOrderListPending({
      componentName: `${pascalDomain}LensOrderListPending`,
    }),
    prescriptions: generateCustomerPrescriptionsOptician({
      componentName: `${pascalDomain}CustomerPrescriptions`,
    }),
  };
}
