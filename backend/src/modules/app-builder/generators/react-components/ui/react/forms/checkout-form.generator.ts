import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateCheckoutForm = (
  resolved: ResolvedComponent,
  variant: 'multiStepCheckout' | 'paymentInformation' | 'checkout' | 'shoppingCart' | 'singleItemCheckout' = 'checkout'
) => {
  const dataSource = resolved.dataSource;
  const useLocalStorageCart = resolved.props?.useLocalStorageCart === true;
  const useSingleItemCheckout = resolved.props?.useSingleItemCheckout === true;

  // Get create order route from catalog actions (fully dynamic)
  // Convert hyphens to underscores to match backend route naming convention
  const createOrderAction = resolved.actions?.find((a: any) => a.type === 'create' && a.trigger === 'onSubmit');
  const createOrderRoute = createOrderAction?.serverFunction?.route?.replace('/api/v1/', '/').replace(/-/g, '_') || '/orders';
  const createOrderItemsRoute = '/order_items'; // Order items are typically created at /order_items

  // Get order schema from props (for food-delivery vs e-commerce vs event-ticketing field mappings)
  const orderSchema = resolved.props?.orderSchema || {};
  const orderItemSchema = resolved.props?.orderItemSchema || {};
  const cartItemFields = resolved.props?.cartItemFields || [];

  // Detect checkout type from props or entity
  const isEventTicketing = resolved.props?.isEventTicketing === true ||
                           resolved.data?.entity === 'orders' && resolved.props?.showOrderSummary === true;
  const isFoodDeliverySchema = !!orderSchema.restaurantIdField && !!orderSchema.itemsField;

  // Field name mappings with defaults based on checkout type
  const userIdField = orderSchema.userIdField || 'customer_id';
  const totalField = orderSchema.totalField || 'total_amount';
  const subtotalField = orderSchema.subtotalField || 'subtotal';

  // Event-ticketing uses service_fee, e-commerce uses tax_amount/shipping_amount
  const taxField = isEventTicketing ? null : (orderSchema.taxField || 'tax_amount');
  const deliveryFeeField = isEventTicketing ? 'service_fee' : (orderSchema.deliveryFeeField || 'shipping_amount');
  const tipField = orderSchema.tipField || 'tip';
  const addressField = isEventTicketing ? null : (orderSchema.addressField || 'shipping_address');
  const itemsField = orderSchema.itemsField || null;
  const restaurantIdField = orderSchema.restaurantIdField || null;

  // Order item field mappings - event-ticketing uses ticket_snapshot, e-commerce uses product_snapshot
  const menuItemIdField = isEventTicketing ? 'ticket_type_id' : (orderItemSchema.menuItemIdField || 'product_id');
  const snapshotField = isEventTicketing ? 'ticket_snapshot' : (orderItemSchema.snapshotField || 'product_snapshot');

  // Event-ticketing specific fields
  const eventIdField = isEventTicketing ? 'event_id' : null;
  
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
    // Checkout form specific defaults
    const checkoutDefaults: Record<string, string> = {
      placeOrderText: "'Place Order'",
      pageTitle: "'Checkout'",
      pageSubtitle: "'Complete your purchase'",
      billingTitle: "'Billing Details'",
      orderTitle: "'Your Order'",
      paymentTitle: "'Payment Method'",
      couponTitle: "'Have a Coupon Code?'",
      title: "'Checkout'",
      cartSubtitle: "'Review your items'",
      privacyPolicyText: "'I agree to the privacy policy'",
      couponDescription: "'Enter your coupon code below'",
      personalDetailsTitle: "'Personal Details'",
      shippingTitle: "'Shipping Information'",
      nextStepText: "'Continue'",
    };
    if (checkoutDefaults[fieldName]) {
      return `propData?.${fieldName} || ${checkoutDefaults[fieldName]}`;
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
    return `/${dataSource || 'checkout'}`;
  };

  const apiRoute = getApiRoute();

  const commonImports = `
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  ChevronDown,
  ChevronUp,
  Minus,
  Plus,
  X,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

// Shared type definitions
interface CheckoutProps {
  [key: string]: any; // Accept any prop for flexibility
  className?: string;
  title?: string;
  showShippingForm?: boolean;
  showBillingForm?: boolean;
  showPaymentMethod?: boolean;
  useLocalStorageCart?: boolean;
  mode?: string;
  onPost?: (postData: any) => Promise<any>;
  onSaveDraft?: (draftData: any) => Promise<any>;
}

interface CartItem {
  id: string;
  name: string;
  description?: string;
  color?: string;
  size?: string;
  quantity: number | string;
  price: number;
  image: string;
}

interface OrderItem {
  id: string;
  name: string;
  color?: string;
  size?: string;
  quantity?: string;
  price: number;
  image: string;
}

interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  mailingAddress: string;
  city: string;
  postCode: string;
  country: string;
  region: string;
}

interface BillingDetails {
  firstName: string;
  lastName: string;
  address: string;
  addressLine2: string;
  country: string;
  city: string;
  postcode: string;
  phone: string;
  additionalInfo: string;
}`;

  const variants = {
    multiStepCheckout: `
${commonImports}

const CheckoutComponent: React.FC<CheckoutProps> = ({
  ${dataName},
  entity = '${dataSource || 'orders'}',
  className,
  onPlaceOrder,
  onSubmit,
  onApplyCoupon,
  onNextStep,
  onSectionToggle
}) => {
  const queryClient = useQueryClient();

  // Order placement mutation
  const placeOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const response = await api.post<any>(\`/\${entity}\`, orderData);
      return response?.data || response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [entity] });
      if (onSubmit) onSubmit(data);
    },
    onError: (err: any) => {
      console.error('Order placement error:', err);
    },
  });

  const checkoutData = ${dataName} || {};

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [mailingAddress, setMailingAddress] = useState('');
  const [city, setCity] = useState('');
  const [postCode, setPostCode] = useState('');
  const [country, setCountry] = useState('');
  const [region, setRegion] = useState('');
  const [sameAddress, setSameAddress] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  
  const [personalDetailsExpanded, setPersonalDetailsExpanded] = useState(true);
  const [shippingExpanded, setShippingExpanded] = useState(false);
  const [paymentExpanded, setPaymentExpanded] = useState(false);

  const title = ${getField('title')};
  const cartSubtitle = ${getField('cartSubtitle')};
  const placeOrderText = ${getField('placeOrderText')};
  const privacyPolicyText = ${getField('privacyPolicyText')};
  const couponTitle = ${getField('couponTitle')};
  const couponDescription = ${getField('couponDescription')};
  const personalDetailsTitle = ${getField('personalDetailsTitle')};
  const shippingTitle = ${getField('shippingTitle')};
  const paymentTitle = ${getField('paymentTitle')};
  const nextStepText = ${getField('nextStepText')};
  const cartItems = ${getField('cartItems')};
  const subtotal = ${getField('subtotal')};
  const shippingCost = ${getField('shippingCost')};
  const discount = ${getField('discount')};
  const totalPayable = ${getField('totalPayable')};

  const handlePlaceOrder = () => {
    const orderData = {
      personalInfo: { firstName, lastName, email, phone, mailingAddress, city, postCode, country, region },
      sameAddress,
      cartItems,
      totals: { subtotal, shippingCost, discount, totalPayable }
    };

    if (onPlaceOrder) {
      onPlaceOrder(orderData);
    } else {
      placeOrderMutation.mutate(orderData);
    }
  };

  const handleApplyCoupon = () => {
    if (onApplyCoupon) {
      onApplyCoupon(couponCode);
    }
  };

  const handleNextStep = (currentStep: string) => {
    const stepData = { firstName, lastName, email, phone, mailingAddress, city, postCode, country, region };
    
    if (onNextStep) {
      onNextStep(currentStep, stepData);
    } else {
      console.log('Next step from:', currentStep, stepData);
    }

    if (currentStep === 'personal') {
      setPersonalDetailsExpanded(false);
      setShippingExpanded(true);
    } else if (currentStep === 'shipping') {
      setShippingExpanded(false);
      setPaymentExpanded(true);
    }
  };

  const handleSectionToggle = (section: string, currentState: boolean) => {
    const newState = !currentState;
    
    if (section === 'personal') {
      setPersonalDetailsExpanded(newState);
    } else if (section === 'shipping') {
      setShippingExpanded(newState);
    } else if (section === 'payment') {
      setPaymentExpanded(newState);
    }

    if (onSectionToggle) {
      onSectionToggle(section, newState);
    }
  };

  const ProductImage = ({ image }: { image: string }) => {
    const colorMap: { [key: string]: string } = {
      'jeans-pant': 'bg-blue-600',
      'circular-sienna': 'bg-gray-200',
      'black-tshirt': 'bg-gray-800'
    };

    return (
      <div className={cn("w-12 h-12 rounded flex items-center justify-center", colorMap[image] || 'bg-gray-200')}>
        <div className="w-6 h-4 bg-white bg-opacity-30 rounded"></div>
      </div>
    );
  };

  const SectionHeader = ({ 
    title, 
    isExpanded, 
    section
  }: { 
    title: string; 
    isExpanded: boolean; 
    section: string;
  }) => (
    <button
      onClick={() => handleSectionToggle(section, isExpanded)}
      className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
    >
      <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      {isExpanded ? (
        <ChevronUp className="w-5 h-5 text-gray-600" />
      ) : (
        <ChevronDown className="w-5 h-5 text-gray-600" />
      )}
    </button>
  );

  return (
    <div className={cn("min-h-screen bg-gray-50 p-4 lg:p-8", className)}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
            <p className="text-gray-600 text-sm mb-6">{cartSubtitle}</p>
            
            <div className="space-y-4 mb-6">
              {cartItems.map((item: CartItem) => (
                <div key={item.id} className="flex items-center space-x-4 p-3 border border-gray-100 rounded-lg">
                  <ProductImage image={item.image} />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-500">{item.description}</p>
                  </div>
                  <div className="text-lg font-medium">\${Number(item.price).toFixed(2)}</div>
                </div>
              ))}
            </div>

            <div className="space-y-2 mb-6 pt-6 border-t border-gray-200">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">\${subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping Cost (+)</span>
                <span className="font-medium">\${shippingCost}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Discount (-)</span>
                <span className="font-medium text-green-600">\${discount}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200 text-lg">
                <span className="font-medium">Total Payable</span>
                <span className="font-bold">\${totalPayable}</span>
              </div>
            </div>

            <Button 
              onClick={handlePlaceOrder}
              className="w-full mb-6 bg-blue-600 hover:bg-blue-700 h-12"
            >
              {placeOrderText}
            </Button>

            <div className="text-xs text-gray-500 mb-6">
              {privacyPolicyText}
            </div>

            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-2">{couponTitle}</h3>
              <p className="text-sm text-gray-500 mb-4">{couponDescription}</p>
              <div className="flex gap-3">
                <Input
                  placeholder="Coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={handleApplyCoupon}
                  className="bg-gray-800 hover:bg-gray-900"
                >
                  Apply
                </Button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            
            <div className="bg-white rounded-lg shadow-sm">
              <SectionHeader
                title={personalDetailsTitle}
                isExpanded={personalDetailsExpanded}
                section="personal"
              />
              
              {personalDetailsExpanded && (
                <div className="p-6 pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <Label htmlFor="first-name">First Name</Label>
                      <Input
                        id="first-name"
                        placeholder="First Name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="last-name">Last Name</Label>
                      <Input
                        id="last-name"
                        placeholder="Last Name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email-address">Email Address</Label>
                      <Input
                        id="email-address"
                        type="email"
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone-number">Phone</Label>
                      <Input
                        id="phone-number"
                        placeholder="Enter your Phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="mailing-address">Mailing Address</Label>
                      <Input
                        id="mailing-address"
                        placeholder="Mailing Address"
                        value={mailingAddress}
                        onChange={(e) => setMailingAddress(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        placeholder="City"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="post-code">Post Code</Label>
                      <Input
                        id="post-code"
                        placeholder="Post Code"
                        value={postCode}
                        onChange={(e) => setPostCode(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="country-select">Country</Label>
                      <Select value={country} onValueChange={setCountry}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Country" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="us">United States</SelectItem>
                          <SelectItem value="uk">United Kingdom</SelectItem>
                          <SelectItem value="ca">Canada</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="region-select">Region/State</Label>
                      <Select value={region} onValueChange={setRegion}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Option" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="california">California</SelectItem>
                          <SelectItem value="texas">Texas</SelectItem>
                          <SelectItem value="florida">Florida</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 mt-6">
                    <Checkbox
                      id="same-address"
                      checked={sameAddress}
                      onCheckedChange={(checked) => setSameAddress(checked as boolean)}
                    />
                    <Label htmlFor="same-address" className="cursor-pointer">
                      My delivery and mailing addresses are the same.
                    </Label>
                  </div>

                  <Button 
                    className="mt-6 bg-blue-600 hover:bg-blue-700"
                    onClick={() => handleNextStep('personal')}
                  >
                    {nextStepText}
                  </Button>
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-sm">
              <SectionHeader
                title={shippingTitle}
                isExpanded={shippingExpanded}
                section="shipping"
              />
              
              {shippingExpanded && (
                <div className="p-6 pt-4">
                  <p className="text-gray-600 mb-4">Shipping address form would go here...</p>
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => handleNextStep('shipping')}
                  >
                    {nextStepText}
                  </Button>
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-sm">
              <SectionHeader
                title={paymentTitle}
                isExpanded={paymentExpanded}
                section="payment"
              />
              
              {paymentExpanded && (
                <div className="p-6 pt-4">
                  <p className="text-gray-600 mb-4">Payment information form would go here...</p>
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={handlePlaceOrder}
                  >
                    Complete Order
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutComponent;
    `,

    paymentInformation: `
${commonImports}

const CheckoutComponent: React.FC<CheckoutProps> = ({
  ${dataName},
  entity = '${dataSource || 'orders'}',
  className,
  onConfirmPayment,
  onSubmit,
  onApplyCoupon
}) => {
  const queryClient = useQueryClient();

  // Payment confirmation mutation
  const confirmPaymentMutation = useMutation({
    mutationFn: async (paymentData: any) => {
      const response = await api.post<any>(\`/\${entity}\`, paymentData);
      return response?.data || response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [entity] });
      if (onSubmit) onSubmit(data);
    },
    onError: (err: any) => {
      console.error('Payment confirmation error:', err);
    },
  });

  const checkoutData = ${dataName} || {};

  const [fullName, setFullName] = useState('Mark Litho');
  const [email, setEmail] = useState('yourmail@gmail.com');
  const [cardholderName, setCardholderName] = useState('Cardholder Name');
  const [cardNumber, setCardNumber] = useState('0000 0000 0000 0000');
  const [expiryMonth, setExpiryMonth] = useState('MM');
  const [expiryYear, setExpiryYear] = useState('YYYY');
  const [cvc, setCvc] = useState('CVC/CVV');
  const [couponCode, setCouponCode] = useState('');

  const personalInfoTitle = ${getField('personalInfoTitle')};
  const paymentDetailsTitle = ${getField('paymentDetailsTitle')};
  const orderSummaryTitle = ${getField('orderSummaryTitle')};
  const confirmPaymentText = ${getField('confirmPaymentText')};
  const termsText = ${getField('termsText')};
  const couponTitle = ${getField('couponTitle')};
  const couponDescription = ${getField('couponDescription')};
  const orderItems = ${getField('orderItems')};
  const totalAmount = ${getField('totalAmount')};

  const handleConfirmPayment = () => {
    const paymentData = {
      personalInfo: { fullName, email },
      paymentInfo: { cardholderName, cardNumber, expiryMonth, expiryYear, cvc },
      orderItems,
      totalAmount
    };

    if (onConfirmPayment) {
      onConfirmPayment(paymentData);
    } else {
      confirmPaymentMutation.mutate(paymentData);
    }
  };

  const handleApplyCoupon = () => {
    if (onApplyCoupon) {
      onApplyCoupon(couponCode);
    }
  };

  const ProductImage = ({ image }: { image: string }) => {
    const imageMap: { [key: string]: { bg: string; icon: string } } = {
      'saas-template': { bg: 'bg-orange-100', icon: 'bg-orange-500' },
      'lindy-ui': { bg: 'bg-blue-100', icon: 'bg-blue-500' },
      'freelancer': { bg: 'bg-green-100', icon: 'bg-green-500' }
    };

    const config = imageMap[image] || { bg: 'bg-gray-100', icon: 'bg-gray-500' };

    return (
      <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center", config.bg)}>
        <div className={cn("w-6 h-6 rounded", config.icon)}></div>
      </div>
    );
  };

  return (
    <div className={cn("min-h-screen bg-gray-50 p-4 lg:p-8", className)}>
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">{personalInfoTitle}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="full-name">Full Name</Label>
                  <Input
                    id="full-name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">{paymentDetailsTitle}</h2>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-6 h-4 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">P</div>
                  </div>
                  <div>
                    <Label>Card</Label>
                    <div className="text-sm text-gray-600">PayPal</div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="cardholder-name">Cardholder Name</Label>
                  <Input
                    id="cardholder-name"
                    value={cardholderName}
                    onChange={(e) => setCardholderName(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="card-number">Card Number</Label>
                  <div className="relative">
                    <Input
                      id="card-number"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="mt-1 pr-20"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                      <div className="w-8 h-5 bg-blue-800 rounded text-white text-xs flex items-center justify-center">VISA</div>
                      <div className="w-8 h-5 bg-red-600 rounded text-white text-xs flex items-center justify-center">MC</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Expiration</Label>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <Select value={expiryMonth} onValueChange={setExpiryMonth}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="01">01</SelectItem>
                          <SelectItem value="02">02</SelectItem>
                          <SelectItem value="03">03</SelectItem>
                          <SelectItem value="04">04</SelectItem>
                          <SelectItem value="05">05</SelectItem>
                          <SelectItem value="06">06</SelectItem>
                          <SelectItem value="07">07</SelectItem>
                          <SelectItem value="08">08</SelectItem>
                          <SelectItem value="09">09</SelectItem>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="11">11</SelectItem>
                          <SelectItem value="12">12</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={expiryYear} onValueChange={setExpiryYear}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2024">2024</SelectItem>
                          <SelectItem value="2025">2025</SelectItem>
                          <SelectItem value="2026">2026</SelectItem>
                          <SelectItem value="2027">2027</SelectItem>
                          <SelectItem value="2028">2028</SelectItem>
                          <SelectItem value="2029">2029</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="cvc">CVC/CVV</Label>
                    <Input
                      id="cvc"
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-4">
                    {termsText}
                  </p>
                  <Button 
                    onClick={handleConfirmPayment}
                    className="w-full bg-blue-600 hover:bg-blue-700 h-12"
                  >
                    {confirmPaymentText}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-600 rounded-lg shadow-sm p-6 text-white h-fit">
            <h2 className="text-xl font-bold mb-6">{orderSummaryTitle}</h2>
            
            <div className="space-y-6 mb-8">
              {orderItems.map((item: OrderItem, index: number) => (
                <div key={item.id} className="flex items-start space-x-4">
                  <ProductImage image={item.image} />
                  <div className="flex-1">
                    <h3 className="font-medium text-sm leading-tight mb-1">{item.name}</h3>
                    <p className="text-blue-100 font-bold">\${Number(item.price).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-blue-500 pt-6 mb-8">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">Total Amount</span>
                <span className="text-2xl font-bold">\${totalAmount}</span>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">{couponTitle}</h3>
              <p className="text-sm text-gray-600 mb-4">{couponDescription}</p>
              <div className="flex gap-3">
                <Input
                  placeholder="Coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={handleApplyCoupon}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Apply
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutComponent;
    `,

    checkout: `
${commonImports}
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Package } from 'lucide-react';

const CheckoutComponent: React.FC<CheckoutProps> = ({
  ${dataName},
  entity = '${dataSource || 'orders'}',
  className,
  onPlaceOrder,
  onSubmit,
  onApplyCoupon,
  onPaymentMethodChange
}) => {
  const queryClient = useQueryClient();

  // Order placement mutation
  const placeOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const response = await api.post<any>(\`/\${entity}\`, orderData);
      return response?.data || response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [entity] });
      if (onSubmit) onSubmit(data);
    },
    onError: (err: any) => {
      console.error('Order placement error:', err);
    },
  });

  const checkoutData = ${dataName} || {};

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [postcode, setPostcode] = useState('');
  const [phone, setPhone] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [createAccount, setCreateAccount] = useState(false);
  const [shipDifferent, setShipDifferent] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash-on-delivery');

  const pageTitle = ${getField('pageTitle')};
  const pageSubtitle = ${getField('pageSubtitle')};
  const billingTitle = ${getField('billingTitle')};
  const orderTitle = ${getField('orderTitle')};
  const paymentTitle = ${getField('paymentTitle')};
  const couponTitle = ${getField('couponTitle')};
  const placeOrderText = ${getField('placeOrderText')};
  const orderItems = ${getField('orderItems')};
  const subtotal = ${getField('subtotal')};
  const shippingCost = ${getField('shippingCost')};
  const discount = ${getField('discount')};
  const totalPayable = ${getField('totalPayable')};

  // Determine if this is an event/ticket checkout (card payment only) or product checkout (COD + card)
  const isEventCheckout = ${dataName}?.isEventCheckout ?? true;

  const handlePlaceOrder = () => {
    const orderData = {
      billingDetails: { firstName, lastName, email, address, addressLine2, country, city, postcode, phone, additionalInfo },
      createAccount,
      shipDifferent,
      paymentMethod,
      cardDetails: paymentMethod === 'card-payment' ? { cardName, cardNumber, expiryMonth, expiryYear, cvv } : null,
      orderItems,
      totals: { subtotal, shippingCost, discount, totalPayable }
    };

    if (onPlaceOrder) {
      onPlaceOrder(orderData);
    } else {
      placeOrderMutation.mutate(orderData);
    }
  };

  const handleApplyCoupon = () => {
    if (onApplyCoupon) {
      onApplyCoupon(couponCode);
    }
  };

  const handlePaymentMethodChange = (method: string) => {
    setPaymentMethod(method);
    if (onPaymentMethodChange) {
      onPaymentMethodChange(method);
    }
  };

  // Card payment form state
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cvv, setCvv] = useState('');

  return (
    <div className={cn("min-h-screen bg-gray-50 p-4 lg:p-8", className)}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{pageTitle}</h1>
          <p className="text-gray-600">{pageSubtitle}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">{billingTitle}</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label htmlFor="first-name">First name*</Label>
                  <Input
                    id="first-name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="last-name">Last name*</Label>
                  <Input
                    id="last-name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label htmlFor="address">Address*</Label>
                  <Input
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="address-line-2">Address line 2</Label>
                  <Input
                    id="address-line-2"
                    value={addressLine2}
                    onChange={(e) => setAddressLine2(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label htmlFor="country">Country*</Label>
                  <Select value={country} onValueChange={setCountry}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="us">United States</SelectItem>
                      <SelectItem value="uk">United Kingdom</SelectItem>
                      <SelectItem value="ca">Canada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="city">City/Town*</Label>
                  <Input
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label htmlFor="postcode">Postcode / ZIP*</Label>
                  <Input
                    id="postcode"
                    value={postcode}
                    onChange={(e) => setPostcode(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone*</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="mb-6">
                <Label htmlFor="additional-info">Additional information</Label>
                <Textarea
                  id="additional-info"
                  placeholder="Notes about your order, e.g. special notes for delivery"
                  value={additionalInfo}
                  onChange={(e) => setAdditionalInfo(e.target.value)}
                  className="mt-1 h-24"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="create-account"
                    checked={createAccount}
                    onCheckedChange={(checked) => setCreateAccount(checked as boolean)}
                  />
                  <Label htmlFor="create-account" className="cursor-pointer">Create Account</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="ship-different"
                    checked={shipDifferent}
                    onCheckedChange={(checked) => setShipDifferent(checked as boolean)}
                  />
                  <Label htmlFor="ship-different" className="cursor-pointer">Ship to a different address?</Label>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">{couponTitle}</h3>
              <div className="flex gap-3">
                <Input
                  placeholder="Coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={handleApplyCoupon}
                  className="bg-gray-800 hover:bg-gray-900"
                >
                  Apply Code
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Order Summary Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">{orderTitle}</h2>

              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-4 pb-4 border-b border-gray-200 text-sm font-medium text-gray-500">
                  <div>Product</div>
                  <div className="text-right">Subtotal</div>
                </div>

                {orderItems.map((item: OrderItem, index: number) => (
                  <div key={item.id || index} className="flex items-center justify-between pb-4 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      {/* Dynamic Product Image */}
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/48?text=No+Image';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">{item.name}</h4>
                        <p className="text-xs text-gray-500">{item.quantity}</p>
                      </div>
                    </div>
                    <div className="text-sm font-medium">\${typeof item.price === 'number' ? Number(item.price).toFixed(2) : item.price}</div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>\${subtotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping Cost (+)</span>
                  <span>\${shippingCost}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Discount (-)</span>
                  <span className="text-green-600">\${discount}</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-gray-200 font-medium">
                  <span>Total Payable</span>
                  <span>\${totalPayable}</span>
                </div>
              </div>
            </div>

            {/* Payment Method Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">{paymentTitle}</h3>

              {/* Payment Options - Card only for events, COD + Card for products */}
              {isEventCheckout ? (
                /* Card Payment Only for Event Tickets */
                <div className="p-4 border border-blue-500 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-5 bg-blue-800 rounded text-white text-xs flex items-center justify-center font-bold">VISA</div>
                      <div className="w-8 h-5 bg-red-500 rounded text-white text-xs flex items-center justify-center font-bold">MC</div>
                    </div>
                    <div>
                      <div className="font-medium text-sm">Card Payment</div>
                      <p className="text-xs text-gray-500">Secure payment for your tickets</p>
                    </div>
                  </div>
                </div>
              ) : (
                /* Radio Button Payment Options for Products */
                <RadioGroup value={paymentMethod} onValueChange={handlePaymentMethodChange} className="space-y-3">
                  <div className={cn(
                    "flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors",
                    paymentMethod === 'cash-on-delivery' ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:bg-gray-50"
                  )}>
                    <RadioGroupItem value="cash-on-delivery" id="cash-on-delivery" />
                    <Label htmlFor="cash-on-delivery" className="cursor-pointer flex-1">
                      <div className="font-medium text-sm">Cash on Delivery</div>
                      <p className="text-xs text-gray-500">Pay when you receive your order</p>
                    </Label>
                  </div>

                  <div className={cn(
                    "flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors",
                    paymentMethod === 'card-payment' ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:bg-gray-50"
                  )}>
                    <RadioGroupItem value="card-payment" id="card-payment" />
                    <Label htmlFor="card-payment" className="cursor-pointer flex-1">
                      <div className="font-medium text-sm">Card Payment</div>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="w-8 h-5 bg-blue-800 rounded text-white text-xs flex items-center justify-center font-bold">VISA</div>
                        <div className="w-8 h-5 bg-red-500 rounded text-white text-xs flex items-center justify-center font-bold">MC</div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              )}

              {/* Card Payment Form - Show for events always, for products only when card selected */}
              {(isEventCheckout || paymentMethod === 'card-payment') && (
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                  <div>
                    <Label htmlFor="card-name" className="text-sm">Name on Card*</Label>
                    <Input
                      id="card-name"
                      placeholder="John Doe"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="card-number" className="text-sm">Card Number*</Label>
                    <Input
                      id="card-number"
                      placeholder="0000 0000 0000 0000"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <Label className="text-sm">Expiration Date*</Label>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <Select value={expiryMonth} onValueChange={setExpiryMonth}>
                          <SelectTrigger>
                            <SelectValue placeholder="MM" />
                          </SelectTrigger>
                          <SelectContent>
                            {['01','02','03','04','05','06','07','08','09','10','11','12'].map(m => (
                              <SelectItem key={m} value={m}>{m}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select value={expiryYear} onValueChange={setExpiryYear}>
                          <SelectTrigger>
                            <SelectValue placeholder="YYYY" />
                          </SelectTrigger>
                          <SelectContent>
                            {['2024','2025','2026','2027','2028','2029','2030'].map(y => (
                              <SelectItem key={y} value={y}>{y}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="cvv" className="text-sm">CVV*</Label>
                      <Input
                        id="cvv"
                        placeholder="123"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                        className="mt-1"
                        maxLength={4}
                      />
                    </div>
                  </div>
                </div>
              )}

              <Button
                onClick={handlePlaceOrder}
                className="w-full mt-6 bg-blue-600 hover:bg-blue-700 h-12"
              >
                {placeOrderText}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Page Wrapper Component with localStorage cart integration
const CheckoutPage: React.FC<CheckoutProps> = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Load cart from localStorage (support both 'checkout_items' for events and 'cart' for products)
  React.useEffect(() => {
    try {
      // First try checkout_items (event tickets)
      let stored = localStorage.getItem('checkout_items');
      if (stored) {
        const items = JSON.parse(stored);
        // Transform event ticket items to cart format
        const cartFormatItems = (Array.isArray(items) ? items : []).map((item: any) => ({
          productId: item.ticket_type_id || item.id,
          name: item.ticket_name || item.event_title || item.name,
          price: Number(item.price) || 0,
          quantity: item.quantity || 1,
          image: item.event_image || item.image || '',
          eventId: item.event_id,
          eventTitle: item.event_title,
          eventDate: item.event_date,
        }));
        setCartItems(cartFormatItems);
        return;
      }

      // Fallback to cart (products)
      stored = localStorage.getItem('cart');
      if (stored) {
        const cart = JSON.parse(stored);
        setCartItems(Array.isArray(cart) ? cart : []);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  }, []);

  // Detect if this is event checkout (has eventId in cart items)
  const isEventCheckout = cartItems.some(item => item.eventId);

  // Calculate totals - no shipping for events
  const subtotal = cartItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
  const shippingCost = isEventCheckout ? 0 : (subtotal > 0 ? 10 : 0);
  const discount = 0;
  const totalPayable = subtotal + shippingCost - discount;

  // Handle place order
  const handlePlaceOrder = async (orderData: any) => {
    // Check authentication
    const token = localStorage.getItem('auth_token');
    if (!token) {
      toast.error('Please log in to place an order');
      setTimeout(() => {
        navigate('/login?redirect=/checkout');
      }, 1500);
      return;
    }

    // Validate billing details
    const { billingDetails } = orderData;
    if (!billingDetails.firstName || !billingDetails.lastName || !billingDetails.address ||
        !billingDetails.city || !billingDetails.postcode || !billingDetails.phone) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setIsPlacingOrder(true);

    try {
      // Get user ID from token (decode JWT)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload.userId || payload.sub || payload.id;

      // Generate unique order ID and order number
      const orderId = crypto.randomUUID();
      const orderNumber = \`ORD-\${Date.now()}-\${Math.random().toString(36).substring(2, 11).toUpperCase()}\`;

      // Calculate totals for food-delivery schema
      const subtotalAmount = cartItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
      const taxAmount = subtotalAmount * 0.10; // 10% tax
      const deliveryFeeAmount = shippingCost;
      const tipAmount = 0;
      const calculatedTotal = subtotalAmount + taxAmount + deliveryFeeAmount + tipAmount;

      // Get restaurant_id from first cart item (for food-delivery)
      const restaurantId = cartItems[0]?.restaurant_id || cartItems[0]?.restaurantId || null;

      // Create order items JSON array for the items field (food-delivery schema)
      const orderItemsForField = cartItems.map(item => ({
        menu_item_id: item.productId || item.id,
        quantity: item.quantity,
        customizations: item.customizations || null,
        price: parseFloat(item.price),
        name: item.name,
        image: item.image
      }));

      // Detect if this is event ticketing (has eventId in cart items)
      const isEventCheckout = cartItems.some(item => item.eventId);

      // Create order object with dynamic schema
      let orderRequest: Record<string, any>;

      if (isEventCheckout) {
        // Event-ticketing schema
        orderRequest = {
          id: orderId,
          ${userIdField}: userId,
          order_number: orderNumber,
          subtotal: subtotalAmount.toString(),
          service_fee: '0',
          ${totalField}: calculatedTotal.toString(),
          status: 'pending',
          payment_status: 'pending',
          payment_method: orderData.paymentMethod || 'card',
          billing_name: \`\${billingDetails.firstName} \${billingDetails.lastName}\`,
          billing_email: billingDetails.email || '',
          billing_phone: billingDetails.phone || '',
        };
      } else ${isFoodDeliverySchema ? `{
        // Food-delivery schema
        orderRequest = {
          id: orderId,
          ${userIdField}: userId,
          order_number: orderNumber,
          ${restaurantIdField}: restaurantId,
          ${itemsField}: orderItemsForField,
          ${subtotalField}: subtotalAmount.toString(),
          ${deliveryFeeField}: deliveryFeeAmount.toString(),
          ${taxField}: taxAmount.toString(),
          ${tipField}: tipAmount.toString(),
          ${totalField}: calculatedTotal.toString(),
          ${addressField}: {
            name: \`\${billingDetails.firstName} \${billingDetails.lastName}\`,
            phone: billingDetails.phone,
            address: billingDetails.address,
            address2: billingDetails.addressLine2 || '',
            city: billingDetails.city,
            postcode: billingDetails.postcode,
            country: billingDetails.country || 'US',
            instructions: orderData.specialInstructions || '',
          },
          special_instructions: orderData.specialInstructions || null,
          status: 'pending',
          payment_status: 'pending',
          payment_method: orderData.paymentMethod || 'cash-on-delivery',
        };
      }` : `{
        // E-commerce schema
        orderRequest = {
          id: orderId,
          ${userIdField}: userId,
          order_number: orderNumber,
          ${totalField}: totalPayable.toString(),
          tax_amount: '0',
          shipping_amount: shippingCost.toString(),
          status: 'pending',
          payment_status: 'pending',
          payment_method: orderData.paymentMethod || 'cash-on-delivery',
          shipping_address: {
            name: \`\${billingDetails.firstName} \${billingDetails.lastName}\`,
            phone: billingDetails.phone,
            street: billingDetails.address,
            street2: billingDetails.addressLine2 || '',
            city: billingDetails.city,
            postcode: billingDetails.postcode,
            country: billingDetails.country || 'US',
          },
          billing_address: {
            name: \`\${billingDetails.firstName} \${billingDetails.lastName}\`,
            phone: billingDetails.phone,
            street: billingDetails.address,
            street2: billingDetails.addressLine2 || '',
            city: billingDetails.city,
            postcode: billingDetails.postcode,
            country: billingDetails.country || 'US',
          },
        };
      }`}

      // Prepare order items data with snapshots (for order_items table)
      const orderItemsData = cartItems.map(item => {
        const unitPrice = parseFloat(item.price);
        const totalPrice = unitPrice * item.quantity;

        if (isEventCheckout) {
          // Event-ticketing order items
          return {
            id: crypto.randomUUID(),
            order_id: orderId,
            event_id: item.eventId || null,
            ticket_type_id: item.productId || null,
            quantity: item.quantity,
            unit_price: unitPrice.toString(),
            total_price: totalPrice.toString(),
            ticket_snapshot: {
              ticket_type_id: item.productId,
              ticket_name: item.name,
              event_id: item.eventId,
              event_title: item.eventTitle,
              event_date: item.eventDate,
              price: item.price,
              image: item.image,
            },
          };
        }

        // E-commerce/Food-delivery order items
        return {
          id: crypto.randomUUID(),
          order_id: orderId,
          ${menuItemIdField}: item.productId || null,
          quantity: item.quantity,
          unit_price: unitPrice.toString(),
          total_price: totalPrice.toString(),
          customizations: item.customizations || null,
          ${snapshotField}: {
            id: item.productId,
            name: item.name,
            price: item.price,
            image: item.image,
          },
        };
      });

      // Create the order first - api.post throws on error, returns parsed JSON on success
      console.log('Creating order:', orderRequest);
      const orderResponse = await api.post<any>('${createOrderRoute}', orderRequest);
      console.log('Order response:', orderResponse);

      // Backend returns { success: true, data: {...} } format
      // The order was created successfully if we got here (api.post throws on error)
      // Use the orderId we generated since backend may not return the inserted record
      const createdOrderId = orderResponse?.data?.id || orderResponse?.id || orderId;
      console.log('Created order ID:', createdOrderId);

      // Create order items separately
      console.log('Creating order items:', orderItemsData);
      let itemsCreated = 0;
      for (const itemData of orderItemsData) {
        try {
          const itemResponse = await api.post('${createOrderItemsRoute}', itemData);
          console.log('Order item created:', itemResponse);
          itemsCreated++;
        } catch (itemError) {
          console.error('Failed to create order item:', itemData, itemError);
          // Continue trying to create other items
        }
      }

      console.log(\`Created \${itemsCreated} of \${orderItemsData.length} order items\`);

      // Clear cart from localStorage (both keys)
      localStorage.removeItem('checkout_items');
      localStorage.removeItem('cart');
      setCartItems([]);

      // Show success message
      toast.success('Order placed successfully!');

      // Redirect to orders page
      setTimeout(() => {
        navigate('/account/orders');
      }, 1500);

    } catch (error: any) {
      console.error('Error placing order:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to place order. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // Prepare checkout data
  const checkoutData = {
    pageTitle: 'Checkout',
    pageSubtitle: 'Complete your purchase',
    billingTitle: 'Billing Details',
    orderTitle: 'Your Order',
    paymentTitle: 'Payment Method',
    couponTitle: 'Have a Coupon Code?',
    placeOrderText: isPlacingOrder ? 'Processing...' : 'Place Order',
    orderItems: cartItems.map(item => ({
      id: item.productId,
      name: item.name,
      color: item.color || '',
      size: item.size || '',
      quantity: \`x\${item.quantity}\`,
      price: item.price * item.quantity,
      image: item.image || ''
    })),
    subtotal: subtotal.toFixed(2),
    shippingCost: shippingCost.toFixed(2),
    discount: discount.toFixed(2),
    totalPayable: totalPayable.toFixed(2)
  };

  // Empty cart check
  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Package className="w-16 h-16 text-gray-400" />
        <p className="text-xl text-gray-600">Your cart is empty</p>
        <Button onClick={() => navigate('/products')}>Continue Shopping</Button>
      </div>
    );
  }

  return <CheckoutComponent ${dataName}={checkoutData} onPlaceOrder={handlePlaceOrder} />;
};

export default ${useLocalStorageCart ? 'CheckoutPage' : 'CheckoutComponent'};
    `,

    // Single Item Checkout variant - for membership plans, subscriptions etc
    singleItemCheckout: `
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Package, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useParams, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface CheckoutPageProps {
  [key: string]: any;
  variant?: string;
  colorScheme?: string;
  title?: string;
  useLocalStorageCart?: boolean;
  useSingleItemCheckout?: boolean;
  itemEntity?: string;
  itemIdParam?: string;
  orderEntity?: string;
  orderItemEntity?: any;
  orderIdField?: string;
  itemNameField?: string;
  itemPriceField?: string;
  itemImageField?: any;
  showPlanSummary?: boolean;
  showPaymentForm?: boolean;
  submitButtonText?: string;
  cancelButtonText?: string;
  cancelButtonLink?: string;
  successRedirect?: string;
  data?: any;
  onPostClick?: (item: any) => void;
  onReadMore?: (itemId: string | number, item?: any) => void;
  onCategoryClick?: (category: string) => void;
  onAuthorClick?: (authorName: string) => void;
  onReadArticle?: (itemId: string | number, item?: any) => void;
}

const CheckoutPage: React.FC<CheckoutPageProps> = () => {
  const params = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [paymentMethod, setPaymentMethod] = useState('card-payment');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cvv, setCvv] = useState('');

  // Read config from props (passed from catalog)
  const itemIdParam = '${resolved.props?.itemIdParam || 'id'}';
  const itemEntity = '${resolved.props?.itemEntity || 'membership_plans'}';
  const orderEntity = '${resolved.props?.orderEntity || 'bookings'}';
  const orderIdField = '${resolved.props?.orderIdField || 'booking_reference'}';
  const bookingType = '${resolved.props?.bookingType || 'hotel'}';
  const itemNameField = '${resolved.props?.itemNameField || 'name'}';
  const itemPriceField = '${resolved.props?.itemPriceField || 'price'}';
  const successRedirect = '${resolved.props?.successRedirect || '/account/bookings'}';
  const cancelLink = '${resolved.props?.cancelButtonLink || '/'}';
  const cardPaymentOnly = ${resolved.props?.cardPaymentOnly === true ? 'true' : 'false'};

  // Get the item ID from URL params using the dynamic param name
  const id = params[itemIdParam] || params.id;

  // Fetch item details on mount
  React.useEffect(() => {
    const fetchItem = async () => {
      if (!id) {
        setError('No item ID provided');
        setLoading(false);
        return;
      }

      try {
        const response = await api.get<any>(\`/\${itemEntity}/\${id}\`);
        if (response?.success && response?.data) {
          setItem(response.data);
        } else if (response?.data) {
          setItem(response.data);
        } else {
          setError('Item not found');
        }
      } catch (err: any) {
        console.error('Error fetching item:', err);
        setError(err?.message || 'Failed to load item');
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  const handleSubmit = async () => {
    // Check authentication
    const token = localStorage.getItem('auth_token');
    if (!token) {
      toast.error('Please log in to continue');
      navigate('/login?redirect=' + window.location.pathname);
      return;
    }

    if (!item) {
      toast.error('No item selected');
      return;
    }

    setIsSubmitting(true);

    try {
      // Get user ID from token (same pattern as e-commerce checkout)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload.userId || payload.sub || payload.id;

      // Get item price
      const itemPrice = parseFloat(item[itemPriceField] || item.price || item.price_per_night || '0');

      const type = bookingType as string;
      let request: any;
      let successMessage = 'Booking confirmed successfully!';
      let redirectPath = successRedirect;

      if (type === 'subscription' || type === 'membership') {
        // Subscription/Membership checkout flow
        const subscriptionNumber = \`SUB-\${Date.now()}-\${Math.random().toString(36).substring(2, 8).toUpperCase()}\`;

        // Calculate subscription period dates
        const now = new Date();
        const periodEnd = new Date();

        // Determine billing cycle from plan
        const billingCycle = item.billing_period || item.billing_cycle || 'monthly';
        const durationMonths = item.duration_months || item.billing_period_months || 1;

        if (billingCycle === 'monthly') {
          periodEnd.setMonth(periodEnd.getMonth() + 1);
        } else if (billingCycle === 'yearly' || billingCycle === 'annual') {
          periodEnd.setFullYear(periodEnd.getFullYear() + 1);
        } else if (billingCycle === 'quarterly') {
          periodEnd.setMonth(periodEnd.getMonth() + 3);
        } else {
          // Use duration_months if no billing_cycle
          periodEnd.setMonth(periodEnd.getMonth() + durationMonths);
        }

        // Build request based on entity type
        // member_subscriptions (fitness-gym): simpler schema with start_date, end_date, plan_snapshot
        // subscriptions (subscription-membership): full schema with billing_cycle, current_period_*, etc.
        if (orderEntity === 'member_subscriptions') {
          // Fitness-gym style member_subscriptions schema
          request = {
            id: crypto.randomUUID(),
            subscription_number: subscriptionNumber,
            user_id: userId,
            plan_id: item.id,
            status: 'active',
            payment_status: 'paid',
            payment_method: paymentMethod,
            amount: itemPrice.toString(),
            start_date: now.toISOString().split('T')[0],
            end_date: periodEnd.toISOString().split('T')[0],
            plan_snapshot: JSON.stringify({
              plan_name: item[itemNameField] || item.name,
              price: itemPrice,
              duration_months: durationMonths,
            }),
            created_at: now.toISOString(),
            updated_at: now.toISOString(),
          };
        } else {
          // Full subscription-membership style subscriptions schema
          request = {
            id: crypto.randomUUID(),
            subscription_number: subscriptionNumber,
            user_id: userId,
            plan_id: item.id,
            status: 'active',
            billing_cycle: billingCycle,
            amount: itemPrice.toString(),
            currency: item.currency || 'USD',
            trial_ends_at: item.trial_days ? new Date(Date.now() + item.trial_days * 24 * 60 * 60 * 1000).toISOString() : null,
            current_period_start: now.toISOString(),
            current_period_end: periodEnd.toISOString(),
            next_billing_date: periodEnd.toISOString(),
            cancel_at_period_end: false,
            metadata: JSON.stringify({
              plan_name: item[itemNameField] || item.name,
              payment_method: paymentMethod,
            }),
            created_at: now.toISOString(),
            updated_at: now.toISOString(),
          };
        }

        successMessage = 'Subscription activated successfully!';
        redirectPath = successRedirect || '/member/subscription';

      } else {
        // Travel/Hotel/Activity booking flow (original logic)
        const bookingRef = \`BK-\${Date.now()}-\${Math.random().toString(36).substring(2, 8).toUpperCase()}\`;

        // Calculate dates
        const startDate = new Date();
        const endDate = new Date();
        if (type === 'hotel') {
          const nights = item.nights || item.duration_nights || 1;
          endDate.setDate(endDate.getDate() + nights);
        } else if (type === 'activity' || type === 'tour') {
          const days = item.duration_days || item.duration || 1;
          endDate.setDate(endDate.getDate() + days);
        }

        request = {
          id: crypto.randomUUID(),
          user_id: userId,
          booking_type: bookingType,
          [orderIdField]: bookingRef,
          provider_name: item.hotel_name || item.airline || item.name || 'Provider',
          location: item.location || item.destination || item.departure_city || '',
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          cost: itemPrice.toString(),
          currency: item.currency || 'USD',
          status: 'confirmed',
          payment_status: 'paid',
          payment_method: paymentMethod,
          details: JSON.stringify({
            item_id: item.id,
            item_name: item[itemNameField] || item.name,
            item_type: itemEntity,
          }),
        };
      }

      console.log('Creating record:', request);
      const response = await api.post<any>(\`/\${orderEntity}\`, request);
      console.log('Response:', response);

      const createdId = response?.data?.id || response?.id || request.id;

      // Invalidate related queries to ensure fresh data is fetched
      queryClient.invalidateQueries({ queryKey: [orderEntity] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });

      toast.success(successMessage);

      setTimeout(() => {
        navigate(redirectPath.includes(':id') ? redirectPath.replace(':id', createdId) : redirectPath);
      }, 1500);

    } catch (err: any) {
      console.error('Error creating booking:', err);
      const errorMsg = err?.message || 'Failed to complete booking';
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Package className="w-16 h-16 text-gray-400" />
        <p className="text-xl text-gray-600">{error || 'Item not found'}</p>
        <Button onClick={() => navigate(cancelLink)}>Go Back</Button>
      </div>
    );
  }

  const itemName = item[itemNameField] || item.name || 'Unknown Item';
  const itemPrice = parseFloat(item[itemPriceField] || item.price || '0');

  return (
    <div className={cn("min-h-screen bg-gray-50 p-4 lg:p-8")}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Purchase</h1>
          <p className="text-gray-600">Review your selection and complete payment</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary - Right Side on Desktop */}
          <div className="lg:col-span-1 order-first lg:order-last">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Your Order</h2>

              {/* Selected Plan/Item */}
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-4 pb-4 border-b border-gray-200 text-sm font-medium text-gray-500">
                  <div>Product</div>
                  <div className="text-right">Subtotal</div>
                </div>

                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-blue-100 flex-shrink-0 flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{itemName}</h4>
                      <p className="text-xs text-gray-500">
                        {item.duration_months ? \`\${item.duration_months} month(s)\` : 'Subscription'}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm font-medium">\${itemPrice.toFixed(2)}</div>
                </div>
              </div>

              {/* Features if available */}
              {item.features && item.features.length > 0 && (
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Includes:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {(Array.isArray(item.features) ? item.features : []).slice(0, 5).map((feature: string, idx: number) => (
                      <li key={idx} className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Totals */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>\${itemPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping Cost (+)</span>
                  <span>$0.00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Discount (-)</span>
                  <span className="text-green-600">$0.00</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-gray-200 font-medium text-lg">
                  <span>Total Payable</span>
                  <span>\${itemPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Form - Left Side */}
          <div className="lg:col-span-2 space-y-6">
            {/* Payment Method Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Payment Method</h3>

              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                <div className={cn(
                  "flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors",
                  paymentMethod === 'card-payment' ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:bg-gray-50"
                )}>
                  <RadioGroupItem value="card-payment" id="card-payment" />
                  <Label htmlFor="card-payment" className="cursor-pointer flex-1">
                    <div className="font-medium text-sm">Card Payment</div>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="w-8 h-5 bg-blue-800 rounded text-white text-xs flex items-center justify-center font-bold">VISA</div>
                      <div className="w-8 h-5 bg-red-500 rounded text-white text-xs flex items-center justify-center font-bold">MC</div>
                    </div>
                  </Label>
                </div>

                {/* Pay Later option - hidden for subscriptions/memberships */}
                {!cardPaymentOnly && (
                  <div className={cn(
                    "flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors",
                    paymentMethod === 'cash' ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:bg-gray-50"
                  )}>
                    <RadioGroupItem value="cash" id="cash" />
                    <Label htmlFor="cash" className="cursor-pointer flex-1">
                      <div className="font-medium text-sm">Pay Later</div>
                      <p className="text-xs text-gray-500">Pay at the location or on arrival</p>
                    </Label>
                  </div>
                )}
              </RadioGroup>

              {/* Card Payment Form */}
              {paymentMethod === 'card-payment' && (
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                  <div>
                    <Label htmlFor="card-name" className="text-sm">Name on Card*</Label>
                    <Input
                      id="card-name"
                      placeholder="John Doe"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="card-number" className="text-sm">Card Number*</Label>
                    <Input
                      id="card-number"
                      placeholder="0000 0000 0000 0000"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <Label className="text-sm">Expiration Date*</Label>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <Select value={expiryMonth} onValueChange={setExpiryMonth}>
                          <SelectTrigger>
                            <SelectValue placeholder="MM" />
                          </SelectTrigger>
                          <SelectContent>
                            {['01','02','03','04','05','06','07','08','09','10','11','12'].map(m => (
                              <SelectItem key={m} value={m}>{m}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select value={expiryYear} onValueChange={setExpiryYear}>
                          <SelectTrigger>
                            <SelectValue placeholder="YYYY" />
                          </SelectTrigger>
                          <SelectContent>
                            {['2024','2025','2026','2027','2028','2029','2030'].map(y => (
                              <SelectItem key={y} value={y}>{y}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="cvv" className="text-sm">CVV*</Label>
                      <Input
                        id="cvv"
                        placeholder="123"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                        className="mt-1"
                        maxLength={4}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-4 mt-6">
                <Button
                  variant="outline"
                  onClick={() => navigate(cancelLink)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Complete Purchase'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
    `,

    shoppingCart: `
${commonImports}

const CheckoutComponent: React.FC<CheckoutProps> = ({
  ${dataName},
  className,
  onPlaceOrder,
  onSubmit,
  onApplyCoupon,
  onQuantityChange,
  onRemoveItem,
  onPaymentMethodChange
}) => {
  // Fetch data using useQuery
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: [entity],
    queryFn: () => api.get<any>(\`${apiRoute}\`),
    enabled: !propData,
  });

  // Loading state
  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const checkoutData = propData || fetchedData || {};
  
  const initialCartItems = ${getField('cartItems')};
  
  const [cartItems, setCartItems] = useState<CartItem[]>(initialCartItems);
  const [couponCode, setCouponCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('credit-card');
  const [cardName, setCardName] = useState('Jhon deo');
  const [cardNumber, setCardNumber] = useState('0000 0000 0000 1248');
  const [expiryMonth, setExpiryMonth] = useState('05');
  const [expiryYear, setExpiryYear] = useState('2000');
  const [cvv, setCvv] = useState('248');

  const cartTitle = ${getField('cartTitle')};
  const paymentTitle = ${getField('paymentTitle')};
  const couponTitle = ${getField('couponTitle')};
  const couponDescription = ${getField('couponDescription')};
  const placeOrderText = ${getField('placeOrderText')};
  const paymentMethodTitle = ${getField('paymentMethodTitle')};
  
  const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const shippingCost = ${getField('shippingCost')};
  const discount = ${getField('discount')};
  const totalPayable = subtotal + shippingCost - discount;

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setCartItems(items => 
      items.map(item => 
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
    if (onQuantityChange) {
      onQuantityChange(id, newQuantity);
    }
  };

  const removeItem = (id: string) => {
    setCartItems(items => items.filter((item: any) => item.id !== id));
    if (onRemoveItem) {
      onRemoveItem(id);
    }
  };

  const handlePaymentMethodChange = (method: string) => {
    setPaymentMethod(method);
    if (onPaymentMethodChange) {
      onPaymentMethodChange(method);
    }
  };

  const handleApplyCoupon = () => {
    if (onApplyCoupon) {
      onApplyCoupon(couponCode);
    } else {
      console.log('Coupon applied:', couponCode);
    }
  };

  const handlePlaceOrder = () => {
    const orderData = {
      cartItems,
      paymentMethod,
      paymentDetails: paymentMethod === 'credit-card' ? { cardName, cardNumber, expiryMonth, expiryYear, cvv } : null,
      totals: { subtotal, shippingCost, discount, totalPayable }
    };

    if (onPlaceOrder) {
      onPlaceOrder(orderData);
    } else {
      console.log('Order placed:', orderData);
    }
  };

  const ProductImage = ({ image, name }: { image: string; name: string }) => {
    const colorMap: { [key: string]: string } = {
      'red-bag': 'bg-red-400',
      'orange-bag': 'bg-orange-400',
      'black-bag': 'bg-gray-800',
      'jeans-pant': 'bg-blue-600',
      'circular-sienna': 'bg-gray-200',
      'black-tshirt': 'bg-gray-800'
    };

    return (
      <div className={cn("w-16 h-16 rounded-lg flex items-center justify-center", colorMap[image] || 'bg-gray-200')}>
        <div className="w-10 h-8 bg-white bg-opacity-20 rounded"></div>
      </div>
    );
  };

  return (
    <div className={cn("min-h-screen bg-gray-50 p-4 lg:p-8", className)}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{cartTitle}</h2>
            
            <div className="hidden md:grid md:grid-cols-12 gap-4 pb-4 border-b border-gray-200 text-sm font-medium text-gray-500">
              <div className="col-span-6">Product</div>
              <div className="col-span-3 text-center">Quantity</div>
              <div className="col-span-2 text-center">Total Price</div>
              <div className="col-span-1"></div>
            </div>

            <div className="space-y-4 mt-4">
              {cartItems.map((item) => (
                <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border border-gray-100 rounded-lg">
                  <div className="col-span-1 md:col-span-6 flex items-center space-x-4">
                    <ProductImage image={item.image} name={item.name} />
                    <div>
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-500">Color: {item.color}</p>
                    </div>
                  </div>
                  
                  <div className="col-span-1 md:col-span-3 flex items-center justify-center space-x-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-8 h-8 p-0"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-8 h-8 p-0"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                  
                  <div className="col-span-1 md:col-span-2 flex items-center justify-center">
                    <span className="font-medium">\${Number(item.price).toFixed(2)}</span>
                  </div>
                  
                  <div className="col-span-1 md:col-span-1 flex items-center justify-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-8 h-8 p-0 text-gray-400 hover:text-red-500"
                      onClick={() => removeItem(item.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-2">{couponTitle}</h3>
              <p className="text-sm text-gray-500 mb-4">{couponDescription}</p>
              <div className="flex gap-3">
                <Input
                  placeholder="Coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={handleApplyCoupon}
                  className="bg-gray-800 hover:bg-gray-900"
                >
                  Apply
                </Button>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">\${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping Cost</span>
                <span className="font-medium">\${shippingCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Discount</span>
                <span className="font-medium text-green-600">-\${discount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-gray-200">
                <span className="text-lg font-medium">Total Payable</span>
                <span className="text-lg font-bold">\${totalPayable.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{paymentTitle}</h2>
            
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">{paymentMethodTitle}</h3>
              <RadioGroup value={paymentMethod} onValueChange={handlePaymentMethodChange}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="credit-card" id="credit-card" />
                  <Label htmlFor="credit-card">Credit Card</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="paypal" id="paypal" />
                  <Label htmlFor="paypal">Paypal</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cash-on-delivery" id="cash-on-delivery" />
                  <Label htmlFor="cash-on-delivery">Cash on delivery</Label>
                </div>
              </RadioGroup>
            </div>

            {paymentMethod === 'credit-card' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="card-name" className="text-sm font-medium text-gray-700">Name on Card:</Label>
                  <Input
                    id="card-name"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="card-number" className="text-sm font-medium text-gray-700">Card Number:</Label>
                  <Input
                    id="card-number"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Expiration Date:</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="MM"
                        value={expiryMonth}
                        onChange={(e) => setExpiryMonth(e.target.value)}
                      />
                      <Input
                        placeholder="YYYY"
                        value={expiryYear}
                        onChange={(e) => setExpiryYear(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="cvv" className="text-sm font-medium text-gray-700">CVV</Label>
                    <Input
                      id="cvv"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>
            )}

            <Button 
              onClick={handlePlaceOrder}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700 h-12"
            >
              {placeOrderText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutComponent;
    `
  };

  // If useSingleItemCheckout prop is set, use the single item checkout variant
  if (useSingleItemCheckout) {
    return variants.singleItemCheckout;
  }

  return variants[variant] || variants.checkout;
};
