import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateOrderDetailsView = (
  resolved: ResolvedComponent,
  variant: 'detailed' | 'receipt' | 'tracking' = 'detailed'
) => {
  const dataSource = resolved.dataSource;

  return `import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Calendar, Package, MapPin, CreditCard, Truck, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface OrderDetailsViewProps {
  [key: string]: any;
  data?: any;
  entity?: string;
  className?: string;
}

export default function OrderDetailsView({ data, entity, className }: OrderDetailsViewProps) {
  const navigate = useNavigate();
  const order = data || {};

  // Helper to parse JSON if it's a string
  const parseJSON = (value: any) => {
    if (!value) return {};
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return {};
      }
    }
    return value;
  };

  // Extract order ID first for fetching items
  const id = order.id || order._id;

  // Fetch order items separately
  const { data: orderItemsData, isLoading: itemsLoading } = useQuery({
    queryKey: ['order_items', id],
    queryFn: async () => {
      if (!id) return [];
      try {
        const response = await api.get<any>(\`/order_items?order_id=\${id}&limit=100\`);
        console.log('Order items response:', response);
        // Handle different response formats
        const items = response?.data || response || [];
        // Parse product_snapshot if it's a string
        return (Array.isArray(items) ? items : []).map((item: any) => ({
          ...item,
          product_snapshot: parseJSON(item.product_snapshot)
        }));
      } catch (error) {
        console.error('Failed to fetch order items:', error);
        return [];
      }
    },
    enabled: !!id
  });

  // Combine order items from props or fetched data
  const items = useMemo(() => {
    const rawItems = order.items || order.order_items || orderItemsData || [];
    // Ensure product_snapshot is parsed for all items
    return (Array.isArray(rawItems) ? rawItems : []).map((item: any) => ({
      ...item,
      product_snapshot: parseJSON(item.product_snapshot)
    }));
  }, [order.items, order.order_items, orderItemsData]);

  // Calculate subtotal from items dynamically
  const calculatedSubtotal = useMemo(() => {
    return items.reduce((sum: number, item: any) => {
      const total = parseFloat(item.total_price) ||
                    (parseFloat(item.unit_price || item.product_snapshot?.price || 0) * (item.quantity || 1));
      return sum + total;
    }, 0);
  }, [items]);

  // Extract ecommerce order fields
  const orderNumber = order.order_number || \`#\${id?.slice(-8) || 'N/A'}\`;
  const createdAt = order.created_at || order.date || order.order_date;
  const status = order.status || 'pending';
  const totalAmount = parseFloat(order.total_amount) || parseFloat(order.total) || 0;
  const subtotal = parseFloat(order.subtotal) || calculatedSubtotal || totalAmount;
  const taxAmount = parseFloat(order.tax_amount) || 0;
  const shippingAmount = parseFloat(order.shipping_amount) || 0;
  const shippingAddress = parseJSON(order.shipping_address);
  const billingAddress = parseJSON(order.billing_address);
  const paymentStatus = order.payment_status || 'pending';
  const paymentMethod = order.payment_method || 'N/A';

  // Calculate final total if not provided
  const finalTotal = totalAmount || (subtotal + taxAmount + shippingAmount);

  const getStatusColor = (status: string) => {
    const normalized = status.toLowerCase();
    switch (normalized) {
      case 'confirmed':
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    }
  };

  const formatPrice = (price: number | string) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(numPrice)) return price;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(numPrice);
  };

  const formatDate = (date: string) => {
    if (!date) return '';
    try {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return date;
    }
  };

  const formatAddress = (address: any) => {
    if (typeof address === 'string') return address;
    if (!address) return 'N/A';

    // Handle our address format: name, phone, street, street2, city, postcode, country
    const name = address.name;
    const phone = address.phone;
    const street = address.street || address.address_line1;
    const street2 = address.street2 || address.address_line2;
    const city = address.city;
    const state = address.state;
    const postcode = address.postcode || address.zip || address.postal_code;
    const country = address.country;

    const addressParts = [street, street2, city, state, postcode, country].filter(Boolean);

    let result = '';
    if (name) result += name + '\\n';
    if (phone) result += 'Phone: ' + phone + '\\n';
    if (addressParts.length > 0) result += addressParts.join(', ');

    return result || 'N/A';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className={cn("max-w-6xl mx-auto p-4 lg:p-8", className)}>
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4 dark:text-gray-300"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Orders
          </Button>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Order {orderNumber}
              </h1>
              {createdAt && (
                <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Placed on {formatDate(createdAt)}
                </p>
              )}
            </div>
            <Badge className={cn("self-start md:self-center text-base px-4 py-2 capitalize h-fit", getStatusColor(status))}>
              {status}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Order Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items Card */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="dark:text-white flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Order Items {items.length > 0 ? \`(\${items.length})\` : ''}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {itemsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                    <span className="ml-2 text-gray-500">Loading items...</span>
                  </div>
                ) : items.length > 0 ? (
                  <div className="space-y-4">
                    {items.map((item: any, index: number) => {
                      const itemId = item.id || item._id || index;
                      // Get product/ticket info from snapshot (support both product_snapshot and ticket_snapshot)
                      const productSnapshot = parseJSON(item.product_snapshot) || {};
                      const ticketSnapshot = parseJSON(item.ticket_snapshot) || {};
                      const snapshot = Object.keys(ticketSnapshot).length > 0 ? ticketSnapshot : productSnapshot;
                      const isTicket = Object.keys(ticketSnapshot).length > 0;

                      // For tickets: use ticket_name, for products: use name
                      const productName = isTicket
                        ? (ticketSnapshot.ticket_name || ticketSnapshot.event_title || item.name || 'Ticket')
                        : (snapshot.name || item.product_name || item.name || 'Product');
                      const quantity = parseInt(item.quantity) || 1;
                      const unitPrice = parseFloat(item.unit_price) || parseFloat(snapshot.price) || parseFloat(item.price) || 0;
                      const itemTotal = parseFloat(item.total_price) || (unitPrice * quantity);
                      const image = snapshot.image || item.image_url || item.image;

                      // Event info for tickets
                      const eventTitle = ticketSnapshot.event_title;
                      const eventDate = ticketSnapshot.event_date;

                      return (
                        <div key={itemId} className="flex gap-4 pb-4 border-b last:border-b-0 dark:border-gray-700">
                          {/* Product Image */}
                          <div className="w-20 h-20 flex-shrink-0 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                            {image ? (
                              <img
                                src={image}
                                alt={productName}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                  (e.target as HTMLImageElement).parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center"><svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg></div>';
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-8 h-8 text-gray-400" />
                              </div>
                            )}
                          </div>
                          {/* Product/Ticket Details */}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 dark:text-white truncate">{productName}</h4>
                            {isTicket && eventTitle && (
                              <p className="text-sm text-blue-600 dark:text-blue-400">{eventTitle}</p>
                            )}
                            {isTicket && eventDate && (
                              <p className="text-xs text-gray-500 mt-1">{formatDate(eventDate)}</p>
                            )}
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              Qty: {quantity} × {formatPrice(unitPrice)}
                            </p>
                            {snapshot.sku && (
                              <p className="text-xs text-gray-500 mt-1">SKU: {snapshot.sku}</p>
                            )}
                          </div>
                          {/* Item Total */}
                          <div className="text-right flex-shrink-0">
                            <p className="font-bold text-lg text-gray-900 dark:text-white">{formatPrice(itemTotal)}</p>
                          </div>
                        </div>
                      );
                    })}

                    {/* Items Subtotal */}
                    <div className="pt-4 border-t dark:border-gray-700">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-700 dark:text-gray-300">Items Subtotal</span>
                        <span className="font-bold text-gray-900 dark:text-white">{formatPrice(calculatedSubtotal)}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-600 dark:text-gray-400 text-center py-8">No items in this order</p>
                )}
              </CardContent>
            </Card>

            {/* Shipping Address Card */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="dark:text-white flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                {shippingAddress && Object.keys(shippingAddress).length > 0 ? (
                  <div className="space-y-2">
                    {shippingAddress.name && (
                      <p className="font-semibold text-gray-900 dark:text-white">{shippingAddress.name}</p>
                    )}
                    {shippingAddress.phone && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Phone: {shippingAddress.phone}
                      </p>
                    )}
                    <p className="text-gray-700 dark:text-gray-300">
                      {[
                        shippingAddress.street,
                        shippingAddress.street2,
                        shippingAddress.city,
                        shippingAddress.state,
                        shippingAddress.postcode,
                        shippingAddress.country
                      ].filter(Boolean).join(', ')}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 italic">No shipping address provided</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Order Summary */}
          <div className="space-y-6">
            {/* Order Summary Card */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="dark:text-white">Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Subtotal ({items.length} items)</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Tax</span>
                    <span>{taxAmount > 0 ? formatPrice(taxAmount) : '$0.00'}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Truck className="w-4 h-4" />
                      Shipping
                    </span>
                    <span>{shippingAmount > 0 ? formatPrice(shippingAmount) : 'Free'}</span>
                  </div>
                  <div className="border-t dark:border-gray-700 pt-3 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">Total</span>
                      <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {formatPrice(finalTotal)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Information Card */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="dark:text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Payment Method</span>
                  <span className="font-semibold text-gray-900 dark:text-white capitalize flex items-center gap-2">
                    {paymentMethod === 'cash-on-delivery' && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                        COD
                      </span>
                    )}
                    {paymentMethod === 'card-payment' && (
                      <span className="inline-flex items-center gap-1">
                        <span className="w-6 h-4 bg-blue-800 rounded text-white text-[8px] flex items-center justify-center font-bold">VISA</span>
                        Card
                      </span>
                    )}
                    {paymentMethod !== 'cash-on-delivery' && paymentMethod !== 'card-payment' && (
                      paymentMethod.replace(/-/g, ' ')
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Payment Status</span>
                  <Badge className={cn("capitalize", getStatusColor(paymentStatus))}>
                    {paymentStatus}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Order Status</span>
                  <Badge className={cn("capitalize", getStatusColor(status))}>
                    {status}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Billing Address Card */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="dark:text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Billing Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                {billingAddress && Object.keys(billingAddress).length > 0 ? (
                  <div className="space-y-2 text-sm">
                    {billingAddress.name && (
                      <p className="font-semibold text-gray-900 dark:text-white">{billingAddress.name}</p>
                    )}
                    {billingAddress.phone && (
                      <p className="text-gray-600 dark:text-gray-400">
                        Phone: {billingAddress.phone}
                      </p>
                    )}
                    <p className="text-gray-700 dark:text-gray-300">
                      {[
                        billingAddress.street,
                        billingAddress.street2,
                        billingAddress.city,
                        billingAddress.state,
                        billingAddress.postcode,
                        billingAddress.country
                      ].filter(Boolean).join(', ')}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 italic text-sm">Same as shipping address</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}`;
};
