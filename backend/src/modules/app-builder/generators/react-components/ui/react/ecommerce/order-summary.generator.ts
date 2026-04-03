import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateOrderSummary = (resolved: ResolvedComponent): string => {
  const dataSource = resolved.dataSource;

  // Get API route for data fetching
  const getApiRoute = () => {
    if (resolved.actions && resolved.actions.length > 0) {
      const fetchAction = resolved.actions.find((a: any) => a.type === 'fetch');
      if (fetchAction?.serverFunction?.route) {
        return fetchAction.serverFunction.route.replace(/^\/api\/v1\//, '/');
      }
    }
    return `/${dataSource || 'orders'}`;
  };

  const apiRoute = getApiRoute();

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Package, MapPin, Calendar, CreditCard, Truck, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

interface Address {
  name?: string;
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

interface Order {
  id: string;
  status: string;
  date: string;
  total: number;
  items?: OrderItem[];
  shippingAddress?: Address;
  billingAddress?: Address;
  paymentMethod?: string;
  trackingNumber?: string;
}

interface OrderSummaryProps {
  order?: Order;
  orders?: any;
  showItems?: boolean;
  showAddress?: boolean;
  onViewDetails?: (order: Order) => void;
  onTrackOrder?: (orderId: string) => void;
  onEditOrder?: (order: Order) => void;
  onOrderView?: (order: Order) => void;
  onOrderClick?: (order: Order) => void;
  onUpdateOrderStatus?: (orderId: string, status: string) => void;
  className?: string;
  [key: string]: any;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  order: orderProp,
  orders: initialOrders,
  showItems = true,
  showAddress = true,
  onViewDetails,
  onTrackOrder,
  onUpdateOrderStatus,
  className
}) => {
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['orders', '${apiRoute}'],
    queryFn: () => api.get('${apiRoute}'),
    initialData: initialOrders,
  });

  const orders = fetchedData || initialOrders;

  if (isLoading && !orders && !orderProp) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Support both order (single) and orders (array) props
  const order = orderProp || (orders && orders[0]) || {} as Order;
  const getStatusColor = (status: string) => {
    if (!status) return 'bg-gray-100 text-gray-800 border-gray-200';
    const statusLower = status.toLowerCase();
    if (statusLower.includes('delivered') || statusLower.includes('completed')) {
      return 'bg-green-100 text-green-800 border-green-200';
    }
    if (statusLower.includes('pending') || statusLower.includes('processing')) {
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
    if (statusLower.includes('shipped') || statusLower.includes('transit')) {
      return 'bg-blue-100 text-blue-800 border-blue-200';
    }
    if (statusLower.includes('cancelled') || statusLower.includes('failed')) {
      return 'bg-red-100 text-red-800 border-red-200';
    }
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const formatPrice = (price: number) => {
    if (!price && price !== 0) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Card className={cn('w-full rounded-2xl shadow-xl border-gray-200/50 dark:border-gray-700', className)}>
      <CardHeader className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-900/50">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Order #{order.id}</CardTitle>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(order.date)}</span>
            </div>
          </div>
          <Badge className={\`\${getStatusColor(order.status)} shadow-lg\`}>
            {order.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Order Items */}
        {showItems && order.items && order.items.length > 0 && (
          <div>
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <Package className="w-4 h-4" />
              Items
            </h3>
            <div className="space-y-3">
              {order.items.map((item: any) => (
                <div key={item.id} className="flex items-center gap-3">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                  )}
                  <div className="flex-1">
                    <p className="font-bold">{item.name}</p>
                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                  </div>
                  <p className="font-bold">{formatPrice(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
            <Separator className="my-4" />
          </div>
        )}

        {/* Shipping Address */}
        {showAddress && order.shippingAddress && (
          <div>
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Shipping Address
            </h3>
            <div className="text-sm text-gray-600 space-y-1">
              {order.shippingAddress.name && <p className="font-bold text-gray-900">{order.shippingAddress.name}</p>}
              {order.shippingAddress.street && <p>{order.shippingAddress.street}</p>}
              <p>
                {order.shippingAddress.city && \`\${order.shippingAddress.city}, \`}
                {order.shippingAddress.state && \`\${order.shippingAddress.state} \`}
                {order.shippingAddress.zipCode}
              </p>
              {order.shippingAddress.country && <p>{order.shippingAddress.country}</p>}
            </div>
            <Separator className="my-4" />
          </div>
        )}

        {/* Payment Method */}
        {order.paymentMethod && (
          <div>
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Payment Method
            </h3>
            <p className="text-sm text-gray-600">{order.paymentMethod}</p>
            <Separator className="my-4" />
          </div>
        )}

        {/* Order Total */}
        <div className="flex items-center justify-between text-lg font-bold">
          <span>Total</span>
          <span>{formatPrice(order.total)}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {onViewDetails && (
            <Button
              onClick={() => onViewDetails(order)}
              className="flex-1"
              variant="outline"
            >
              View Details
            </Button>
          )}
          {onTrackOrder && order.trackingNumber && (
            <Button
              onClick={() => onTrackOrder(order.id)}
              className="flex-1"
            >
              <Truck className="w-4 h-4 mr-2" />
              Track Order
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderSummary;
  `.trim();
};