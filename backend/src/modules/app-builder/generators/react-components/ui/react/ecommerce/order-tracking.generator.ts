import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateOrderTracking = (
  resolved: ResolvedComponent,
  variant: 'timeline' | 'detailed' | 'minimal' = 'timeline'
) => {
  const dataSource = resolved.dataSource;

  // Get the resolved field names from the field resolver service
  const getField = (fieldName: string): string => {
    const mapping = resolved.fieldMappings.find(m => m.targetField === fieldName);
    if (mapping?.sourceField) {
      return `propData?.${mapping.sourceField}`;
    }
    // Return undefined/empty for missing data - let component handle gracefully
    // For ID fields
    if (fieldName === 'id' || fieldName.endsWith('Id')) {
      return `propData?.id || ${dataName}?._id`;
    }
    // For array fields
    if (fieldName.match(/items|steps|updates|timeline|list|array|images|products|users|orders|features|links|stats|statistics|metrics|categories|tags|members|avatars|methods|examples|reviews|comments|notifications|messages|events|courses|lessons|modules|posts|articles|videos|photos|data|results|activities|cards|testimonials|faqs|questions|answers|options|choices|variants|attributes|filters|transactions|invoices|payments|receipts|shipments|deliveries/i)) {
      return `propData?.${fieldName} || ([] as any[])`;
    }
    // For object fields
    if (fieldName.match(/address|metadata|config|settings|tracking|gallery/i)) {
      return `propData?.${fieldName} || ({} as any)`;
    }
    // For scalar values - return empty string as fallback
    return `propData?.${fieldName} || ''`;
  };

  // Parse data source for clean prop naming
  // Parse data source for clean prop naming (sanitize to camelCase)
  const sanitizeVariableName = (name: string): string => {
    // Replace dots and underscores with camelCase
    return name
      .split(/[._]/)
      .map((part, index) => {
        if (index === 0) {
          return part;
        }
        return part.charAt(0).toUpperCase() + part.slice(1);
      })
      .join('');
  };

  const getDataPath = () => {
    if (!dataSource || dataSource.trim() === '') return 'data';
    const parts = dataSource.split('.');
    const lastPart = parts[parts.length - 1];
    return lastPart ? sanitizeVariableName(lastPart) : 'data';
  };

  const dataName = getDataPath();

  // Get API route for data fetching
  const getApiRoute = () => {
    if (resolved.actions && resolved.actions.length > 0) {
      const fetchAction = resolved.actions.find((a: any) => a.type === 'fetch');
      if (fetchAction?.serverFunction?.route) {
        return fetchAction.serverFunction.route.replace(/^\/api\/v1\//, '/');
      }
    }
    return `/${dataSource || 'data'}`;
  };

  const apiRoute = getApiRoute();
  const entity = dataSource?.split('.').pop() || 'orders';

  const formatPrice = `(price: number | string) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numPrice);
  }`;

  const formatDate = `(dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }`;

  const formatTime = `(dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }`;

  const commonImports = `
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Package, Truck, MapPin, Clock, CheckCircle2, Circle, Phone, Download, ExternalLink, ChevronRight, Loader2 } from 'lucide-react';`;

  const commonStyles = `
    .tracking-container {
      @apply w-full max-w-5xl mx-auto;
    }

    .tracking-header {
      @apply mb-6;
    }

    .timeline-container {
      @apply relative;
    }

    .timeline-line {
      @apply absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200;
    }

    .timeline-item {
      @apply relative pl-12 pb-8 last:pb-0;
    }

    .timeline-icon {
      @apply absolute left-0 w-8 h-8 rounded-full flex items-center justify-center;
    }

    .timeline-icon.completed {
      @apply bg-green-500 text-white;
    }

    .timeline-icon.current {
      @apply bg-blue-500 text-white animate-pulse;
    }

    .timeline-icon.pending {
      @apply bg-gray-200 text-gray-400;
    }

    .status-card {
      @apply bg-gradient-to-r p-6 rounded-lg text-white;
    }

    .status-card.delivered {
      @apply from-green-500 to-green-600;
    }

    .status-card.outForDelivery {
      @apply from-blue-500 to-blue-600;
    }

    .status-card.shipped {
      @apply from-purple-500 to-purple-600;
    }

    .status-card.processing {
      @apply from-orange-500 to-orange-600;
    }

    .update-item {
      @apply flex gap-4 py-3 border-b last:border-b-0;
    }

    .update-marker {
      @apply w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0;
    }

    .item-thumbnail {
      @apply w-16 h-16 rounded-lg object-cover bg-gray-100;
    }
  `;

  const variants = {
    timeline: `
${commonImports}

interface OrderTrackingProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const OrderTracking: React.FC<OrderTrackingProps> = ({ ${dataName}: propData, className }) => {
  // Fetch data from API
  const { data: apiData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: () => api.get('${apiRoute}'),
  });

  const ${dataName} = propData || apiData;
  const trackingData = ${dataName} || {};
  const tracking = trackingData.tracking || ${getField('tracking')};

  // Show loading state
  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const orderNumber = ${getField('orderNumber')};
  const orderDate = ${getField('orderDate')};
  const trackingNumber = ${getField('trackingNumber')};
  const carrier = ${getField('carrier')};
  const carrierUrl = ${getField('carrierUrl')};
  const estimatedDelivery = ${getField('estimatedDelivery')};
  const currentStatus = ${getField('currentStatus')};
  const timeline = ${getField('timeline')} || [];
  const items = ${getField('items')} || [];
  const shippingAddress = ${getField('shippingAddress')} || {};

  const trackingNumberLabel = ${getField('trackingNumberLabel')};
  const carrierLabel = ${getField('carrierLabel')};
  const estimatedDeliveryLabel = ${getField('estimatedDeliveryLabel')};
  const orderNumberLabel = ${getField('orderNumberLabel')};
  const orderDateLabel = ${getField('orderDateLabel')};
  const shippingAddressLabel = ${getField('shippingAddressLabel')};
  const contactCarrierText = ${getField('contactCarrierText')};
  const viewOrderDetailsText = ${getField('viewOrderDetailsText')};

  const formatPrice = ${formatPrice};
  const formatDate = ${formatDate};
  const formatTime = ${formatTime};

  const getStatusClass = (status: string) => {
    const statusMap = {
      delivered: 'delivered',
      outForDelivery: 'outForDelivery',
      shipped: 'shipped',
      processing: 'processing'
    };
    return statusMap[status as keyof typeof statusMap] || 'processing';
  };

  const contactCarrier = () => {
    window.open(carrierUrl, '_blank');
  };

  const viewOrderDetails = () => {
    console.log('Viewing order details:', orderNumber);
  };

  return (
    <>
<div className="tracking-container p-6">
        {/* Status Card */}
        <Card className={\`status-card \${getStatusClass(currentStatus)} mb-6 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-top-4\`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2 drop-shadow-lg">
                  {timeline.find((t: any) => t.status === currentStatus)?.title || 'In Transit'}
                </h1>
                <p className="text-white/90 mb-4">
                  {timeline.find((t: any) => t.status === currentStatus)?.description}
                </p>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">{estimatedDeliveryLabel}: {formatDate(estimatedDelivery)}</span>
                </div>
              </div>
              <Truck className="w-16 h-16 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Timeline */}
          <div className="md:col-span-2">
            <Card className="rounded-2xl shadow-xl border-gray-200/50 dark:border-gray-700">
              <CardHeader>
                <CardTitle>Delivery Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="timeline-container">
                  <div className="timeline-line" />
                  {timeline.map((event: any, index: number) => {
                    const isCompleted = event.completed;
                    const isCurrent = event.status === currentStatus;
                    const isPending = !isCompleted && !isCurrent;

                    return (
                      <div key={event.id} className="timeline-item">
                        <div
                          className={\`timeline-icon \${
                            isCompleted ? 'completed' : isCurrent ? 'current' : 'pending'
                          }\`}
                        >
                          {isCompleted || isCurrent ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            <Circle className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold mb-1">{event.title}</h3>
                          <p className="text-sm text-gray-600 mb-1">{event.description}</p>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            {event.timestamp && (
                              <>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatTime(event.timestamp)}
                                </div>
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {event.location}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Details */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Order Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1">{orderNumberLabel}</p>
                  <p className="font-bold">{orderNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">{orderDateLabel}</p>
                  <p className="font-bold">{formatDate(orderDate)}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-xs text-gray-500 mb-1">{trackingNumberLabel}</p>
                  <p className="font-bold text-sm">{trackingNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">{carrierLabel}</p>
                  <p className="font-bold">{carrier}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-xs text-gray-500 mb-1">{shippingAddressLabel}</p>
                  <div className="text-sm">
                    <p className="font-bold">{shippingAddress.name}</p>
                    <p>{shippingAddress.street}</p>
                    <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.zip}</p>
                    <p>{shippingAddress.country}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Items ({items.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {items.map((item: any) => (
                  <div key={item.id} className="flex gap-3">
                    <img
                      src={item.image || '/api/placeholder/64/64'}
                      alt={item.name}
                      className="item-thumbnail"
                    />
                    <div className="flex-1">
                      <p className="font-bold text-sm">{item.name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      <p className="text-sm font-bold">{formatPrice(item.price)}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Button className="w-full" onClick={contactCarrier}>
              <Phone className="w-4 h-4 mr-2" />
              {contactCarrierText}
            </Button>
            <Button variant="outline" className="w-full" onClick={viewOrderDetails}>
              {viewOrderDetailsText}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderTracking;
    `,

    detailed: `
${commonImports}

interface OrderTrackingProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const OrderTracking: React.FC<OrderTrackingProps> = ({ ${dataName}: propData, className }) => {
  // Fetch data from API
  const { data: apiData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: () => api.get('${apiRoute}'),
  });

  const ${dataName} = propData || apiData;
  const trackingData = ${dataName} || {};
  const tracking = trackingData.tracking || ${getField('tracking')};

  const [showAllUpdates, setShowAllUpdates] = useState(false);

  // Show loading state
  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const orderNumber = ${getField('orderNumber')};
  const orderDate = ${getField('orderDate')};
  const trackingNumber = ${getField('trackingNumber')};
  const carrier = ${getField('carrier')};
  const estimatedDelivery = ${getField('estimatedDelivery')};
  const currentStatus = ${getField('currentStatus')};
  const timeline = ${getField('timeline')} || [];
  const updates = ${getField('updates')} || [];
  const items = ${getField('items')} || [];
  const shippingAddress = ${getField('shippingAddress')} || {};

  const trackingNumberLabel = ${getField('trackingNumberLabel')};
  const carrierLabel = ${getField('carrierLabel')};
  const estimatedDeliveryLabel = ${getField('estimatedDeliveryLabel')};
  const contactCarrierText = ${getField('contactCarrierText')};
  const downloadInvoiceText = ${getField('downloadInvoiceText')};

  const formatPrice = ${formatPrice};
  const formatDate = ${formatDate};
  const formatTime = ${formatTime};

  const displayedUpdates = showAllUpdates ? updates : updates.slice(0, 5);

  return (
    <>
<div className="tracking-container p-6">
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl mb-2">Order #{orderNumber}</CardTitle>
                <CardDescription>Placed on {formatDate(orderDate)}</CardDescription>
              </div>
              <Badge className="text-base px-4 py-2">
                {timeline.find((t: any) => t.status === currentStatus)?.title}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">{trackingNumberLabel}</p>
                <p className="font-bold">{trackingNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">{carrierLabel}</p>
                <p className="font-bold">{carrier}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">{estimatedDeliveryLabel}</p>
                <p className="font-bold">{formatDate(estimatedDelivery)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {/* Tracking Updates */}
            <Card>
              <CardHeader>
                <CardTitle>Tracking Updates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {displayedUpdates.map((update: any) => (
                    <div key={update.id} className="update-item">
                      <div className="update-marker" />
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <p className="font-bold">{update.description}</p>
                          <span className="text-xs text-gray-500">
                            {formatTime(update.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{update.location}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {updates.length > 5 && (
                  <Button
                    variant="ghost"
                    className="w-full mt-4"
                    onClick={() => setShowAllUpdates(!showAllUpdates)}
                  >
                    {showAllUpdates ? 'Show Less' : \`Show All (\${updates.length} updates)\`}
                    <ChevronRight className={\`w-4 h-4 ml-2 transition-transform \${showAllUpdates ? 'rotate-90' : ''}\`} />
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {items.map((item: any) => (
                    <div key={item.id} className="flex gap-4 pb-4 border-b last:border-b-0">
                      <img
                        src={item.image || '/api/placeholder/80/80'}
                        alt={item.name}
                        className="w-20 h-20 rounded-lg object-cover bg-gray-100"
                      />
                      <div className="flex-1">
                        <h3 className="font-bold mb-1">{item.name}</h3>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                        <p className="font-bold mt-2">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>
                      {formatPrice(items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0))}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Shipping Address</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  <p className="font-bold mb-1">{shippingAddress.name}</p>
                  <p>{shippingAddress.street}</p>
                  <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.zip}</p>
                  <p>{shippingAddress.country}</p>
                </div>
              </CardContent>
            </Card>

            <Button className="w-full">
              <Phone className="w-4 h-4 mr-2" />
              {contactCarrierText}
            </Button>
            <Button variant="outline" className="w-full">
              <Download className="w-4 h-4 mr-2" />
              {downloadInvoiceText}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderTracking;
    `,

    minimal: `
${commonImports}

interface OrderTrackingProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const OrderTracking: React.FC<OrderTrackingProps> = ({ ${dataName}: propData, className }) => {
  // Fetch data from API
  const { data: apiData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: () => api.get('${apiRoute}'),
  });

  const ${dataName} = propData || apiData;
  const trackingData = ${dataName} || {};
  const tracking = trackingData.tracking || ${getField('tracking')};

  // Show loading state
  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const orderNumber = ${getField('orderNumber')};
  const trackingNumber = ${getField('trackingNumber')};
  const carrier = ${getField('carrier')};
  const estimatedDelivery = ${getField('estimatedDelivery')};
  const currentStatus = ${getField('currentStatus')};
  const timeline = ${getField('timeline')} || [];

  const trackingNumberLabel = ${getField('trackingNumberLabel')};
  const estimatedDeliveryLabel = ${getField('estimatedDeliveryLabel')};
  const viewOrderDetailsText = ${getField('viewOrderDetailsText')};

  const formatDate = ${formatDate};

  const currentEvent = timeline.find((t: any) => t.status === currentStatus);
  const progressPercentage = (timeline.filter((t: any) => t.completed).length / timeline.length) * 100;

  return (
    <>
<Card className="max-w-2xl mx-auto m-6">
        <CardHeader>
          <CardTitle>Order Tracking</CardTitle>
          <CardDescription>Order #{orderNumber}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Status */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500 text-white mb-3">
              <Package className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold mb-2">{currentEvent?.title}</h2>
            <p className="text-gray-600">{currentEvent?.description}</p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-500"
                style={{ width: \`\${progressPercentage}%\` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>{timeline[0]?.title}</span>
              <span>{timeline[timeline.length - 1]?.title}</span>
            </div>
          </div>

          <Separator />

          {/* Tracking Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">{trackingNumberLabel}</p>
              <p className="font-bold text-sm">{trackingNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">{estimatedDeliveryLabel}</p>
              <p className="font-bold text-sm">{formatDate(estimatedDelivery)}</p>
            </div>
          </div>

          <Button className="w-full" variant="outline">
            {viewOrderDetailsText}
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </>
  );
};

export default OrderTracking;
    `
  };

  return variants[variant] || variants.timeline;
};
