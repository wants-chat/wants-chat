import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateOrderConfirmation = (
  resolved: ResolvedComponent,
  variant: 'detailed' | 'minimal' | 'withTracking' = 'detailed'
) => {
  const dataSource = resolved.dataSource;

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

  const variants = {
    detailed: `
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { CheckCircle, Package, MapPin, CreditCard, Download, ShoppingBag, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getVariantStyles, type DesignVariant, type ColorScheme } from '@/lib/design-variants';
import { UI_VARIANT, UI_COLOR_SCHEME } from '@/lib/ui-config';

interface OrderConfirmationProps {
  [key: string]: any;
  className?: string;
  variant?: DesignVariant;
  colorScheme?: ColorScheme;
}

export default function OrderConfirmation({ ${dataName}: initialData, className, variant = UI_VARIANT, colorScheme = UI_COLOR_SCHEME, onDownloadInvoice, onContinueShopping, onTrackOrder }: OrderConfirmationProps) {
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${dataName}', '${apiRoute}'],
    queryFn: () => api.get('${apiRoute}'),
    initialData,
  });

  const ${dataName} = fetchedData || initialData;

  if (isLoading && !${dataName}) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const styles = getVariantStyles(variant, colorScheme);
  const sourceData = ${dataName} || {};

  const orderNumber = ${getField('orderNumber')};
  const orderDate = ${getField('orderDate')};
  const orderStatus = ${getField('orderStatus')};
  const estimatedDelivery = ${getField('estimatedDelivery')};
  const customerEmail = ${getField('customerEmail')};
  const shippingAddress = ${getField('shippingAddress')};
  const paymentMethod = ${getField('paymentMethod')};
  const items = ${getField('items')};
  const subtotal = ${getField('subtotal')};
  const shipping = ${getField('shipping')};
  const tax = ${getField('tax')};
  const discount = ${getField('discount')};
  const total = ${getField('total')};

  const orderConfirmationTitle = ${getField('orderConfirmationTitle')};
  const thankYouMessage = ${getField('thankYouMessage')};
  const successMessage = ${getField('successMessage')};
  const emailSentMessage = ${getField('emailSentMessage')};
  const estimatedDeliveryMessage = ${getField('estimatedDeliveryMessage')};
  const orderDetailsTitle = ${getField('orderDetailsTitle')};
  const shippingDetailsTitle = ${getField('shippingDetailsTitle')};
  const paymentDetailsTitle = ${getField('paymentDetailsTitle')};
  const orderSummaryTitle = ${getField('orderSummaryTitle')};
  const downloadInvoiceButton = ${getField('downloadInvoiceButton')};
  const continueShoppingButton = ${getField('continueShoppingButton')};

  // Event handlers
  const handleDownloadInvoice = () => {
    console.log('Download invoice clicked');
    if (onDownloadInvoice) {
      onDownloadInvoice();
    } else {
      alert(\`Downloading invoice for order \${orderNumber}...\`);
    }
  };

  const handleContinueShopping = () => {
    console.log('Continue shopping clicked');
    if (onContinueShopping) {
      onContinueShopping();
    } else {
      alert('Redirecting to shop...');
    }
  };

  return (
    <div className={cn("min-h-screen", styles.background)}>
      <div className={cn("max-w-4xl mx-auto p-4 lg:p-8", className)}>
        {/* Success Header */}
        <div className="text-center mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mb-4 shadow-lg">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className={\`text-3xl font-bold mb-2 \${styles.title}\`}>{orderConfirmationTitle}</h1>
          <p className={\`text-lg mb-1 \${styles.subtitle}\`}>{thankYouMessage}</p>
          <p className={\`text-sm \${styles.subtitle}\`}>{successMessage}</p>
          <div className={cn(styles.badge, 'mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg')}>
            <span className={\`text-sm \${styles.text}\`}>{emailSentMessage}</span>
            <span className={\`text-sm font-bold \${styles.accent}\`}>{customerEmail}</span>
          </div>
        </div>

        {/* Order Number & Status */}
        <div className={cn(styles.card, 'mb-6 rounded-2xl shadow-xl p-6')}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className={\`text-sm mb-1 \${styles.subtitle}\`}>Order Number</p>
              <p className={\`text-xl font-bold \${styles.title}\`}>{orderNumber}</p>
            </div>
            <div>
              <p className={\`text-sm mb-1 \${styles.subtitle}\`}>Order Date</p>
              <p className={\`text-lg \${styles.title}\`}>{orderDate}</p>
            </div>
            <div>
              <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-lg px-4 py-2 shadow-lg rounded-lg font-medium">
                {orderStatus}
              </span>
            </div>
          </div>
          <div className={cn(styles.badge, 'mt-4 p-3 rounded-lg')}>
            <p className={\`text-sm \${styles.text}\`}>
              {estimatedDeliveryMessage} <span className="font-bold">{estimatedDelivery}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Shipping Address */}
          <div className={cn(styles.card, 'rounded-2xl shadow-xl')}>
            <div className="p-6">
              <h3 className={\`text-lg font-bold flex items-center gap-2 mb-4 \${styles.title}\`}>
                <MapPin className="w-5 h-5" />
                {shippingDetailsTitle}
              </h3>
              <div className={\`text-sm space-y-1 \${styles.text}\`}>
                <p className="font-bold">{shippingAddress.name}</p>
                <p>{shippingAddress.line1}</p>
                {shippingAddress.line2 && <p>{shippingAddress.line2}</p>}
                <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}</p>
                <p>{shippingAddress.country}</p>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className={cn(styles.card, 'rounded-2xl shadow-xl')}>
            <div className="p-6">
              <h3 className={\`text-lg font-bold flex items-center gap-2 mb-4 \${styles.title}\`}>
                <CreditCard className="w-5 h-5" />
                {paymentDetailsTitle}
              </h3>
              <div className={\`text-sm \${styles.text}\`}>
                <p className="font-bold mb-2">{paymentMethod}</p>
                <span className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 px-3 py-1 rounded-lg text-sm font-medium">
                  Paid
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className={cn(styles.card, 'mb-6 rounded-2xl shadow-xl')}>
          <div className="p-6">
            <h3 className={\`text-lg font-bold flex items-center gap-2 mb-4 \${styles.title}\`}>
              <Package className="w-5 h-5" />
              {orderSummaryTitle}
            </h3>
            <div className="space-y-4 mb-4">
              {items.map((item: any) => (
                <div key={item.id} className="flex items-center gap-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className={cn(styles.badge, 'w-16 h-16 rounded-lg object-cover')}
                  />
                  <div className="flex-1">
                    <h4 className={\`font-bold \${styles.title}\`}>{item.name}</h4>
                    <p className={\`text-sm \${styles.subtitle}\`}>Quantity: {item.quantity}</p>
                  </div>
                  <p className={\`font-bold \${styles.title}\`}>\${Number(item.price).toFixed(2)}</p>
                </div>
              ))}
            </div>

            <div className={\`border-t pt-4 space-y-2 \${styles.border}\`}>
              <div className="flex justify-between text-sm">
                <span className={styles.subtitle}>Subtotal</span>
                <span className={styles.title}>\${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className={styles.subtitle}>Shipping</span>
                <span className={styles.title}>\${shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className={styles.subtitle}>Tax</span>
                <span className={styles.title}>\${tax.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className={styles.subtitle}>Discount</span>
                  <span className="text-green-600 dark:text-green-400">-\${discount.toFixed(2)}</span>
                </div>
              )}
              <div className={\`flex justify-between text-lg font-bold pt-2 border-t \${styles.border}\`}>
                <span className={styles.title}>Total</span>
                <span className={styles.title}>\${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleDownloadInvoice}
            className={cn(styles.card, styles.cardHover, 'flex-1 px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2', styles.border)}
          >
            <Download className="w-4 h-4" />
            {downloadInvoiceButton}
          </button>
          <button
            onClick={handleContinueShopping}
            className={cn(styles.button, styles.buttonHover, 'flex-1 px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2')}
          >
            <ShoppingBag className="w-4 h-4" />
            {continueShoppingButton}
          </button>
        </div>
      </div>
    </div>
  );
}
    `,

    minimal: `
import { CheckCircle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getVariantStyles, type DesignVariant, type ColorScheme } from '@/lib/design-variants';
import { UI_VARIANT, UI_COLOR_SCHEME } from '@/lib/ui-config';

interface OrderConfirmationProps {
  [key: string]: any;
  className?: string;
  variant?: DesignVariant;
  colorScheme?: ColorScheme;
}

export default function OrderConfirmation({ ${dataName}, className, variant = UI_VARIANT, colorScheme = UI_COLOR_SCHEME, onContinueShopping, onViewOrder }: OrderConfirmationProps) {
  const styles = getVariantStyles(variant, colorScheme);
  const sourceData = ${dataName} || {};

  const orderNumber = ${getField('orderNumber')};
  const orderDate = ${getField('orderDate')};
  const customerEmail = ${getField('customerEmail')};
  const total = ${getField('total')};

  const orderConfirmationTitle = ${getField('orderConfirmationTitle')};
  const thankYouMessage = ${getField('thankYouMessage')};
  const emailSentMessage = ${getField('emailSentMessage')};
  const continueShoppingButton = ${getField('continueShoppingButton')};
  const viewOrderButton = ${getField('viewOrderButton')};

  // Event handlers
  const handleContinueShopping = () => {
    console.log('Continue shopping clicked');
    if (onContinueShopping) {
      onContinueShopping();
    } else {
      alert('Redirecting to shop...');
    }
  };

  const handleViewOrder = () => {
    console.log('View order clicked');
    if (onViewOrder) {
      onViewOrder();
    } else {
      alert(\`Viewing order \${orderNumber}...\`);
    }
  };

  return (
    <div className={cn("min-h-screen flex items-center justify-center p-4", styles.background)}>
      <div className={cn(styles.card, "max-w-md w-full rounded-2xl", className)}>
        <div className="p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full mb-6">
            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>

          <h1 className={\`text-2xl font-bold mb-2 \${styles.title}\`}>{orderConfirmationTitle}</h1>
          <p className={\`mb-6 \${styles.subtitle}\`}>{thankYouMessage}</p>

          <div className={cn(styles.badge, 'rounded-lg p-4 mb-6')}>
            <div className="flex justify-between items-center mb-3">
              <span className={\`text-sm \${styles.subtitle}\`}>Order Number</span>
              <span className={\`font-bold \${styles.title}\`}>{orderNumber}</span>
            </div>
            <div className="flex justify-between items-center mb-3">
              <span className={\`text-sm \${styles.subtitle}\`}>Order Date</span>
              <span className={\`font-bold \${styles.title}\`}>{orderDate}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className={\`text-sm \${styles.subtitle}\`}>Total Amount</span>
              <span className={\`font-bold text-lg \${styles.title}\`}>\${total.toFixed(2)}</span>
            </div>
          </div>

          <p className={\`text-sm mb-6 \${styles.subtitle}\`}>
            {emailSentMessage} <span className={\`font-bold \${styles.title}\`}>{customerEmail}</span>
          </p>

          <div className="space-y-3">
            <button
              onClick={handleViewOrder}
              className={cn(styles.button, styles.buttonHover, 'w-full px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2')}
            >
              {viewOrderButton}
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={handleContinueShopping}
              className={cn(styles.card, styles.cardHover, 'w-full px-6 py-3 rounded-lg font-medium transition-all', styles.border)}
            >
              {continueShoppingButton}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
    `,

    withTracking: `
import { useState } from 'react';
import { CheckCircle, Package, Truck, MapPin, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getVariantStyles, type DesignVariant, type ColorScheme } from '@/lib/design-variants';
import { UI_VARIANT, UI_COLOR_SCHEME } from '@/lib/ui-config';

interface OrderConfirmationProps {
  [key: string]: any;
  className?: string;
  variant?: DesignVariant;
  colorScheme?: ColorScheme;
}

export default function OrderConfirmation({ ${dataName}, className, variant = UI_VARIANT, colorScheme = UI_COLOR_SCHEME, onTrackOrder, onContinueShopping, onContactSupport }: OrderConfirmationProps) {
  const styles = getVariantStyles(variant, colorScheme);
  const sourceData = ${dataName} || {};

  const orderNumber = ${getField('orderNumber')};
  const orderDate = ${getField('orderDate')};
  const orderStatus = ${getField('orderStatus')};
  const trackingNumber = ${getField('trackingNumber')};
  const estimatedDelivery = ${getField('estimatedDelivery')};
  const shippingAddress = ${getField('shippingAddress')};
  const total = ${getField('total')};

  const orderConfirmationTitle = ${getField('orderConfirmationTitle')};
  const trackingTitle = ${getField('trackingTitle')};
  const shippingDetailsTitle = ${getField('shippingDetailsTitle')};
  const trackOrderButton = ${getField('trackOrderButton')};
  const continueShoppingButton = ${getField('continueShoppingButton')};
  const contactSupportButton = ${getField('contactSupportButton')};

  // Tracking steps
  const trackingSteps = [
    { id: 1, label: 'Order Confirmed', icon: CheckCircle2, completed: true, date: orderDate },
    { id: 2, label: 'Processing', icon: Package, completed: true, date: orderDate },
    { id: 3, label: 'Shipped', icon: Truck, completed: false, date: null },
    { id: 4, label: 'Delivered', icon: MapPin, completed: false, date: null }
  ];

  // Event handlers
  const handleTrackOrder = () => {
    console.log('Track order clicked');
    if (onTrackOrder) {
      onTrackOrder();
    } else {
      alert(\`Tracking order \${orderNumber}\\nTracking #: \${trackingNumber}\`);
    }
  };

  const handleContinueShopping = () => {
    console.log('Continue shopping clicked');
    if (onContinueShopping) {
      onContinueShopping();
    } else {
      alert('Redirecting to shop...');
    }
  };

  const handleContactSupport = () => {
    console.log('Contact support clicked');
    if (onContactSupport) {
      onContactSupport();
    } else {
      alert('Opening support chat...\\n\\nHow can we help you with your order?');
    }
  };

  return (
    <div className={cn("min-h-screen", styles.background)}>
      <div className={cn("max-w-4xl mx-auto p-4 lg:p-8", className)}>
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full mb-4">
            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h1 className={\`text-3xl font-bold mb-2 \${styles.title}\`}>{orderConfirmationTitle}</h1>
          <p className={\`text-lg \${styles.subtitle}\`}>Order #{orderNumber}</p>
        </div>

        {/* Order Info */}
        <div className={cn(styles.card, 'mb-6 rounded-2xl')}>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center md:text-left">
              <div>
                <p className={\`text-sm mb-1 \${styles.subtitle}\`}>Order Date</p>
                <p className={\`font-bold \${styles.title}\`}>{orderDate}</p>
              </div>
              <div>
                <p className={\`text-sm mb-1 \${styles.subtitle}\`}>Total Amount</p>
                <p className={\`font-bold \${styles.title}\`}>\${total.toFixed(2)}</p>
              </div>
              <div>
                <p className={\`text-sm mb-1 \${styles.subtitle}\`}>Status</p>
                <span className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 px-3 py-1 rounded-lg text-sm font-medium">
                  {orderStatus}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tracking Progress */}
        <div className={cn(styles.card, 'mb-6 rounded-2xl')}>
          <div className="p-6">
            <h3 className={\`text-xl font-bold mb-2 \${styles.title}\`}>{trackingTitle}</h3>
            <p className={\`text-sm mb-6 \${styles.subtitle}\`}>Tracking Number: {trackingNumber}</p>
            <div className="relative">
              {trackingSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={step.id} className="relative pb-8 last:pb-0">
                    {index < trackingSteps.length - 1 && (
                      <div className={cn(styles.badge, 'absolute left-5 top-10 h-full w-0.5')} />
                    )}
                    <div className="relative flex items-start">
                      <div
                        className={cn(
                          "flex items-center justify-center w-10 h-10 rounded-full",
                          step.completed
                            ? "bg-green-600 dark:bg-green-500"
                            : cn(styles.badge)
                        )}
                      >
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="ml-4 flex-1">
                        <p
                          className={cn(
                            "font-bold",
                            step.completed ? styles.title : styles.subtitle
                          )}
                        >
                          {step.label}
                        </p>
                        {step.date && (
                          <p className={\`text-sm \${styles.subtitle}\`}>{step.date}</p>
                        )}
                      </div>
                      {step.completed && (
                        <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-500" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className={cn(styles.badge, 'mt-6 p-4 rounded-lg')}>
              <p className={\`text-sm \${styles.text}\`}>
                Estimated delivery: <span className="font-bold">{estimatedDelivery}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        <div className={cn(styles.card, 'mb-6 rounded-2xl')}>
          <div className="p-6">
            <h3 className={\`text-lg font-bold flex items-center gap-2 mb-4 \${styles.title}\`}>
              <MapPin className="w-5 h-5" />
              {shippingDetailsTitle}
            </h3>
            <div className={\`text-sm space-y-1 \${styles.text}\`}>
              <p className="font-bold">{shippingAddress.name}</p>
              <p>{shippingAddress.line1}</p>
              {shippingAddress.line2 && <p>{shippingAddress.line2}</p>}
              <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}</p>
              <p>{shippingAddress.country}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={handleTrackOrder}
            className={cn(styles.button, styles.buttonHover, 'px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2')}
          >
            <Package className="w-4 h-4" />
            {trackOrderButton}
          </button>
          <button
            onClick={handleContinueShopping}
            className={cn(styles.card, styles.cardHover, 'px-6 py-3 rounded-lg font-medium transition-all', styles.border)}
          >
            {continueShoppingButton}
          </button>
          <button
            onClick={handleContactSupport}
            className={cn(styles.card, styles.cardHover, 'px-6 py-3 rounded-lg font-medium transition-all', styles.border)}
          >
            {contactSupportButton}
          </button>
        </div>
      </div>
    </div>
  );
}
    `
  };

  return variants[variant] || variants.detailed;
};
