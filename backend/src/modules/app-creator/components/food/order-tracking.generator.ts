/**
 * Order Tracking Component Generator
 */

export interface OrderTrackingOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateOrderTracking(options: OrderTrackingOptions = {}): string {
  const { componentName = 'OrderTracking', endpoint = '/orders' } = options;

  return `import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, CheckCircle, Clock, Truck, Home, ChefHat, Package } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: order, isLoading } = useQuery({
    queryKey: ['order-tracking', id],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + id);
      return response?.data || response;
    },
    refetchInterval: 30000, // Poll every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const steps = [
    { key: 'confirmed', label: 'Order Confirmed', icon: CheckCircle },
    { key: 'preparing', label: 'Preparing', icon: ChefHat },
    { key: 'ready', label: 'Ready', icon: Package },
    { key: 'on_the_way', label: 'On the Way', icon: Truck },
    { key: 'delivered', label: 'Delivered', icon: Home },
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === order?.status) || 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Order #{order?.order_number || id}</h2>
          {order?.estimated_time && (
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <Clock className="w-4 h-4" />
              Estimated: {order.estimated_time}
            </p>
          )}
        </div>
        <span className={\`px-3 py-1 rounded-full text-sm font-medium \${
          order?.status === 'delivered'
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
        }\`}>
          {order?.status?.replace('_', ' ') || 'Processing'}
        </span>
      </div>

      <div className="relative">
        {steps.map((step, index) => {
          const isCompleted = index <= currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const Icon = step.icon;

          return (
            <div key={step.key} className="flex items-start gap-4 pb-8 last:pb-0">
              <div className="flex flex-col items-center">
                <div className={\`w-10 h-10 rounded-full flex items-center justify-center \${
                  isCompleted
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-600'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-400'
                } \${isCurrent ? 'ring-2 ring-green-600 ring-offset-2 dark:ring-offset-gray-800' : ''}\`}>
                  <Icon className="w-5 h-5" />
                </div>
                {index < steps.length - 1 && (
                  <div className={\`w-0.5 h-8 mt-2 \${isCompleted ? 'bg-green-300' : 'bg-gray-200 dark:bg-gray-700'}\`} />
                )}
              </div>
              <div className="pt-2">
                <p className={\`font-medium \${isCompleted ? 'text-gray-900 dark:text-white' : 'text-gray-400'}\`}>
                  {step.label}
                </p>
                {isCurrent && order?.status_message && (
                  <p className="text-sm text-gray-500 mt-1">{order.status_message}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {order?.driver && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="font-medium text-gray-900 dark:text-white mb-3">Your Driver</h3>
          <div className="flex items-center gap-4">
            {order.driver.avatar_url ? (
              <img src={order.driver.avatar_url} alt={order.driver.name} className="w-12 h-12 rounded-full" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <Truck className="w-6 h-6 text-gray-400" />
              </div>
            )}
            <div>
              <p className="font-medium text-gray-900 dark:text-white">{order.driver.name}</p>
              {order.driver.phone && (
                <a href={\`tel:\${order.driver.phone}\`} className="text-sm text-blue-600">
                  {order.driver.phone}
                </a>
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

export function generateOrderList(options: OrderTrackingOptions = {}): string {
  const { componentName = 'OrderList', endpoint = '/orders' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Loader2, Clock, ChevronRight, ShoppingBag } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    confirmed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    preparing: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    ready: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    on_the_way: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
    delivered: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">My Orders</h2>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {orders && orders.length > 0 ? (
          orders.map((order: any) => (
            <Link
              key={order.id}
              to={\`/orders/\${order.id}\`}
              className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Order #{order.order_number || order.id}
                  </p>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    {order.items_count || order.items?.length || 0} items • \${order.total?.toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={\`px-3 py-1 rounded-full text-xs font-medium \${statusColors[order.status] || statusColors.pending}\`}>
                  {order.status?.replace('_', ' ') || 'Pending'}
                </span>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </Link>
          ))
        ) : (
          <div className="p-8 text-center text-gray-500">
            <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            No orders yet
          </div>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateOrderQueue(options: OrderTrackingOptions = {}): string {
  const { componentName = 'OrderQueue', endpoint = '/orders' } = options;

  return `import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Clock, CheckCircle, XCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

const ${componentName}: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['order-queue'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}?status=pending,confirmed,preparing');
      return Array.isArray(response) ? response : (response?.data || []);
    },
    refetchInterval: 10000,
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.put(\`${endpoint}/\${id}/status\`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order-queue'] });
      toast.success('Order status updated');
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const statusFlow = ['confirmed', 'preparing', 'ready', 'on_the_way', 'delivered'];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Order Queue</h2>
        <span className="text-sm text-gray-500">{orders?.length || 0} active orders</span>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {orders && orders.length > 0 ? (
          orders.map((order: any) => {
            const currentIndex = statusFlow.indexOf(order.status);
            const nextStatus = statusFlow[currentIndex + 1];

            return (
              <div key={order.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Order #{order.order_number || order.id}
                    </p>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(order.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-full text-xs font-medium">
                    {order.status?.replace('_', ' ')}
                  </span>
                </div>
                <div className="space-y-1 mb-3">
                  {order.items?.map((item: any, i: number) => (
                    <p key={i} className="text-sm text-gray-600 dark:text-gray-400">
                      {item.quantity}x {item.name}
                    </p>
                  ))}
                </div>
                <div className="flex gap-2">
                  {nextStatus && (
                    <button
                      onClick={() => updateStatus.mutate({ id: order.id, status: nextStatus })}
                      disabled={updateStatus.isPending}
                      className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-1"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Mark as {nextStatus.replace('_', ' ')}
                    </button>
                  )}
                  <button
                    onClick={() => updateStatus.mutate({ id: order.id, status: 'cancelled' })}
                    className="py-2 px-4 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center text-gray-500">
            No pending orders
          </div>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}
