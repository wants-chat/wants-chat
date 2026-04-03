import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateOrderReview = (
  resolved: ResolvedComponent,
  variant: 'summary' | 'detailed' | 'editable' = 'summary'
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

  const commonImports = `
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { MapPin, CreditCard, Package, Check, Edit, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';`;

  const variants = {
    summary: `
${commonImports}

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
}

interface Address {
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

interface PaymentMethod {
  type: string;
  last4: string;
  brand: string;
  expiry: string;
}

interface OrderReviewProps {
  ${dataName}?: any;
  className?: string;
  onPlaceOrder?: () => void;
}

const OrderReviewComponent: React.FC<OrderReviewProps> = ({
  ${dataName}: initialData,
  className,
  onPlaceOrder
}) => {
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${dataName}', '${apiRoute}'],
    queryFn: () => api.get('${apiRoute}'),
    initialData,
  });

  const ${dataName} = fetchedData || initialData;

  const [termsAccepted, setTermsAccepted] = useState(false);

  if (isLoading && !${dataName}) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const sourceData = ${dataName} || {};

  const reviewTitle = ${getField('reviewTitle')};
  const orderSummaryTitle = ${getField('orderSummaryTitle')};
  const shippingTitle = ${getField('shippingTitle')};
  const paymentTitle = ${getField('paymentTitle')};
  const placeOrderButton = ${getField('placeOrderButton')};
  const subtotalLabel = ${getField('subtotalLabel')};
  const shippingLabel = ${getField('shippingLabel')};
  const taxLabel = ${getField('taxLabel')};
  const discountLabel = ${getField('discountLabel')};
  const totalLabel = ${getField('totalLabel')};
  const termsLabel = ${getField('termsLabel')};
  const orderItems = ${getField('orderItems')};
  const shippingAddress = ${getField('shippingAddress')};
  const paymentMethod = ${getField('paymentMethod')};
  const subtotal = ${getField('subtotal')};
  const shipping = ${getField('shipping')};
  const tax = ${getField('tax')};
  const discount = ${getField('discount')};

  const total = subtotal + shipping + tax - discount;

  // Event handlers
  const handlePlaceOrder = () => {
    if (!termsAccepted) {
      alert('Please accept the terms and conditions');
      return;
    }

    console.log('Order placed', { orderItems, shippingAddress, paymentMethod, total });

    if (onPlaceOrder) {
      onPlaceOrder();
    }

    alert(\`Order placed successfully!\\nTotal: $\${total.toFixed(2)}\\nOrder confirmation will be sent to your email.\`);
  };

  return (
    <div className={cn("max-w-4xl mx-auto py-8 px-4", className)}>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        {reviewTitle}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Package className="w-5 h-5" />
              {orderSummaryTitle}
            </h2>
            <div className="space-y-4">
              {orderItems.map((item: OrderItem) => (
                <div key={item.id} className="flex gap-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 dark:text-white">{item.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 dark:text-white">
                      \${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              {shippingTitle}
            </h2>
            <div className="text-gray-600 dark:text-gray-400">
              <p className="font-bold text-gray-900 dark:text-white">{shippingAddress.name}</p>
              <p>{shippingAddress.street}</p>
              <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.zip}</p>
              <p>{shippingAddress.country}</p>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              {paymentTitle}
            </h2>
            <div className="text-gray-600 dark:text-gray-400">
              <p className="font-bold text-gray-900 dark:text-white">
                {paymentMethod.brand} ending in {paymentMethod.last4}
              </p>
              <p>Expires {paymentMethod.expiry}</p>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm sticky top-8">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
              Order Total
            </h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">{subtotalLabel}</span>
                <span className="font-bold text-gray-900 dark:text-white">\${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">{shippingLabel}</span>
                <span className="font-bold text-green-600 dark:text-green-400">
                  {shipping === 0 ? 'Free' : \`$\${shipping.toFixed(2)}\`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">{taxLabel}</span>
                <span className="font-bold text-gray-900 dark:text-white">\${tax.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600 dark:text-green-400">
                  <span>{discountLabel}</span>
                  <span className="font-bold">-\${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">{totalLabel}</span>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    \${total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="mb-6">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={termsAccepted}
                  onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                />
                <label htmlFor="terms" className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                  {termsLabel}
                </label>
              </div>
            </div>

            {/* Place Order Button */}
            <Button
              onClick={handlePlaceOrder}
              disabled={!termsAccepted}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-base font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {placeOrderButton}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderReviewComponent;
    `,

    detailed: `
${commonImports}

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
}

interface Address {
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

interface PaymentMethod {
  type: string;
  last4: string;
  brand: string;
  expiry: string;
}

interface OrderReviewProps {
  ${dataName}?: any;
  className?: string;
  onPlaceOrder?: () => void;
}

const OrderReviewComponent: React.FC<OrderReviewProps> = ({
  ${dataName}: initialData,
  className,
  onPlaceOrder
}) => {
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${dataName}', '${apiRoute}'],
    queryFn: () => api.get('${apiRoute}'),
    initialData,
  });

  const ${dataName} = fetchedData || initialData;

  const [termsAccepted, setTermsAccepted] = useState(false);

  if (isLoading && !${dataName}) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const sourceData = ${dataName} || {};

  const reviewTitle = ${getField('reviewTitle')};
  const orderSummaryTitle = ${getField('orderSummaryTitle')};
  const shippingTitle = ${getField('shippingTitle')};
  const billingTitle = ${getField('billingTitle')};
  const paymentTitle = ${getField('paymentTitle')};
  const placeOrderButton = ${getField('placeOrderButton')};
  const subtotalLabel = ${getField('subtotalLabel')};
  const shippingLabel = ${getField('shippingLabel')};
  const taxLabel = ${getField('taxLabel')};
  const discountLabel = ${getField('discountLabel')};
  const totalLabel = ${getField('totalLabel')};
  const termsText = ${getField('termsText')};
  const estimatedDeliveryMessage = ${getField('estimatedDeliveryMessage')};
  const orderItems = ${getField('orderItems')};
  const shippingAddress = ${getField('shippingAddress')};
  const billingAddress = ${getField('billingAddress')};
  const paymentMethod = ${getField('paymentMethod')};
  const subtotal = ${getField('subtotal')};
  const shipping = ${getField('shipping')};
  const tax = ${getField('tax')};
  const discount = ${getField('discount')};

  const total = subtotal + shipping + tax - discount;

  const handlePlaceOrder = () => {
    if (!termsAccepted) {
      alert('Please accept the terms and conditions');
      return;
    }

    console.log('Order placed');
    if (onPlaceOrder) {
      onPlaceOrder();
    }
    alert(\`Order confirmed!\\nTotal: $\${total.toFixed(2)}\`);
  };

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4", className)}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          {reviewTitle}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Items */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                {orderSummaryTitle}
              </h2>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {orderItems.map((item: OrderItem) => (
                  <div key={item.id} className="py-4 flex gap-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 dark:text-white">{item.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Quantity: {item.quantity} × \${Number(item.price).toFixed(2)}
                      </p>
                      <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                        {estimatedDeliveryMessage}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        \${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Addresses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  {shippingTitle}
                </h3>
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <p className="font-bold text-gray-900 dark:text-white">{shippingAddress.name}</p>
                  <p>{shippingAddress.street}</p>
                  <p>{shippingAddress.city}, {shippingAddress.state}</p>
                  <p>{shippingAddress.zip}</p>
                  <p>{shippingAddress.country}</p>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  {billingTitle}
                </h3>
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <p className="font-bold text-gray-900 dark:text-white">{billingAddress.name}</p>
                  <p>{billingAddress.street}</p>
                  <p>{billingAddress.city}, {billingAddress.state}</p>
                  <p>{billingAddress.zip}</p>
                  <p>{billingAddress.country}</p>
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-green-600 dark:text-green-400" />
                {paymentTitle}
              </h3>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">
                    {paymentMethod.brand} •••• {paymentMethod.last4}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Expires {paymentMethod.expiry}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Order Total
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{subtotalLabel}</span>
                  <span className="font-bold text-gray-900 dark:text-white">\${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{shippingLabel}</span>
                  <span className="font-bold text-green-600 dark:text-green-400">
                    {shipping === 0 ? 'Free' : \`$\${shipping.toFixed(2)}\`}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{taxLabel}</span>
                  <span className="font-bold text-gray-900 dark:text-white">\${tax.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                    <span>{discountLabel}</span>
                    <span className="font-bold">-\${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-gray-900 dark:text-white">{totalLabel}</span>
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">
                      \${total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-xs text-blue-800 dark:text-blue-200">
                  {termsText}
                </p>
              </div>

              <div className="mb-6">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms-detailed"
                    checked={termsAccepted}
                    onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                  />
                  <label htmlFor="terms-detailed" className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                    I agree to the terms and conditions
                  </label>
                </div>
              </div>

              <Button
                onClick={handlePlaceOrder}
                disabled={!termsAccepted}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-base font-bold disabled:opacity-50"
              >
                <Check className="w-5 h-5 mr-2" />
                {placeOrderButton}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderReviewComponent;
    `,

    editable: `
${commonImports}

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
}

interface Address {
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

interface PaymentMethod {
  type: string;
  last4: string;
  brand: string;
  expiry: string;
}

interface OrderReviewProps {
  ${dataName}?: any;
  className?: string;
  onPlaceOrder?: () => void;
  onEditShipping?: () => void;
  onEditPayment?: () => void;
}

const OrderReviewComponent: React.FC<OrderReviewProps> = ({
  ${dataName}: initialData,
  className,
  onPlaceOrder,
  onEditShipping,
  onEditPayment
}) => {
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${dataName}', '${apiRoute}'],
    queryFn: () => api.get('${apiRoute}'),
    initialData,
  });

  const ${dataName} = fetchedData || initialData;

  const [termsAccepted, setTermsAccepted] = useState(false);

  if (isLoading && !${dataName}) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const sourceData = ${dataName} || {};

  const reviewTitle = ${getField('reviewTitle')};
  const orderSummaryTitle = ${getField('orderSummaryTitle')};
  const shippingTitle = ${getField('shippingTitle')};
  const paymentTitle = ${getField('paymentTitle')};
  const editButton = ${getField('editButton')};
  const placeOrderButton = ${getField('placeOrderButton')};
  const subtotalLabel = ${getField('subtotalLabel')};
  const shippingLabel = ${getField('shippingLabel')};
  const taxLabel = ${getField('taxLabel')};
  const totalLabel = ${getField('totalLabel')};
  const termsLabel = ${getField('termsLabel')};
  const orderItems = ${getField('orderItems')};
  const shippingAddress = ${getField('shippingAddress')};
  const paymentMethod = ${getField('paymentMethod')};
  const subtotal = ${getField('subtotal')};
  const shipping = ${getField('shipping')};
  const tax = ${getField('tax')};

  const total = subtotal + shipping + tax;

  const handleEditShipping = () => {
    console.log('Edit shipping clicked');
    if (onEditShipping) {
      onEditShipping();
    }
    alert('Edit shipping address');
  };

  const handleEditPayment = () => {
    console.log('Edit payment clicked');
    if (onEditPayment) {
      onEditPayment();
    }
    alert('Edit payment method');
  };

  const handlePlaceOrder = () => {
    if (!termsAccepted) {
      alert('Please accept the terms and conditions');
      return;
    }

    console.log('Order placed');
    if (onPlaceOrder) {
      onPlaceOrder();
    }
    alert(\`Order confirmed!\\nTotal: $\${total.toFixed(2)}\`);
  };

  return (
    <div className={cn("min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4", className)}>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          {reviewTitle}
        </h1>

        <div className="space-y-6">
          {/* Order Items */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              {orderSummaryTitle}
            </h2>
            <div className="space-y-4">
              {orderItems.map((item: OrderItem) => (
                <div key={item.id} className="flex gap-4 items-center">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 dark:text-white">{item.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    \${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping & Payment Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Shipping */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  {shippingTitle}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEditShipping}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  {editButton}
                </Button>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <p className="font-bold text-gray-900 dark:text-white">{shippingAddress.name}</p>
                <p>{shippingAddress.street}</p>
                <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.zip}</p>
              </div>
            </div>

            {/* Payment */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-green-600 dark:text-green-400" />
                  {paymentTitle}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEditPayment}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  {editButton}
                </Button>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p className="font-bold text-gray-900 dark:text-white">
                  {paymentMethod.brand} •••• {paymentMethod.last4}
                </p>
                <p>Exp: {paymentMethod.expiry}</p>
              </div>
            </div>
          </div>

          {/* Final Summary */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 rounded-xl p-6 text-white">
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span>{subtotalLabel}</span>
                <span className="font-bold">\${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>{shippingLabel}</span>
                <span className="font-bold">
                  {shipping === 0 ? 'Free' : \`$\${shipping.toFixed(2)}\`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>{taxLabel}</span>
                <span className="font-bold">\${tax.toFixed(2)}</span>
              </div>
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold">{totalLabel}</span>
                  <span className="text-3xl font-bold">\${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms-editable"
                  checked={termsAccepted}
                  onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                  className="border-white data-[state=checked]:bg-white data-[state=checked]:text-blue-600"
                />
                <label htmlFor="terms-editable" className="text-sm cursor-pointer">
                  {termsLabel}
                </label>
              </div>
            </div>

            <Button
              onClick={handlePlaceOrder}
              disabled={!termsAccepted}
              className="w-full h-12 bg-white text-blue-600 hover:bg-gray-100 dark:bg-white dark:text-blue-600 dark:hover:bg-gray-100 text-base font-bold disabled:opacity-50"
            >
              <Check className="w-5 h-5 mr-2" />
              {placeOrderButton}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderReviewComponent;
    `
  };

  return variants[variant] || variants.summary;
};
