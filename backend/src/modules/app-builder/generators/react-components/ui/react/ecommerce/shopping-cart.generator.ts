import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateShoppingCart = (
  resolved: ResolvedComponent,
  variant: 'shoppingCartTable' | 'shoppingCartSidebar' | 'shoppingCartCards' | 'shoppingCartWithStock' = 'shoppingCartTable'
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
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Minus, Plus, Trash2, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getVariantStyles, type DesignVariant, type ColorScheme } from '@/lib/design-variants';
import { UI_VARIANT, UI_COLOR_SCHEME } from '@/lib/ui-config';
import { toast } from 'sonner';`;

  const variants = {
    shoppingCartTable: `
${commonImports}

interface CartItem {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  image: string;
}

interface ShoppingCartProps {
  ${dataName}?: any;
  className?: string;
  variant?: DesignVariant;
  colorScheme?: ColorScheme;
  onCheckout?: (data: any) => void;
  [key: string]: any;
}

const ShoppingCartComponent: React.FC<ShoppingCartProps> = ({
  ${dataName},
  className,
  variant = UI_VARIANT,
  colorScheme = UI_COLOR_SCHEME,
  onCheckout
}) => {
  const queryClient = useQueryClient();
  const styles = getVariantStyles(variant, colorScheme);
  const cartData = ${dataName} || {};

  // Mutation for checkout
  const checkoutMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const response = await api.post<any>('/orders', orderData);
      return response?.data || response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order placed successfully!');
      if (onCheckout) onCheckout(data);
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to place order');
    },
  });

  const [items, setItems] = useState<CartItem[]>(${getField('cartItemsTable')});
  const [couponCode, setCouponCode] = useState('');

  const title = ${getField('title')};
  const couponTitle = ${getField('couponTitle')};
  const couponDescription = ${getField('couponDescription')};
  const couponPlaceholder = ${getField('couponPlaceholder')};
  const applyButton = ${getField('applyButton')};
  const totalLabel = ${getField('totalLabel')};
  const deliveryLabel = ${getField('deliveryLabel')};
  const discountLabel = ${getField('discountLabel')};
  const subtotalLabel = ${getField('subtotalLabel')};
  const checkoutButtonText = ${getField('checkoutButtonText')};
  const productLabel = ${getField('productLabel')};
  const priceLabel = ${getField('priceLabel')};
  const quantityLabel = ${getField('quantityLabel')};
  const removeButton = ${getField('removeButton')};
  const delivery = ${getField('delivery')};
  const discount = ${getField('discount')};

  // Event handlers
  const handleProductClick = (item: CartItem) => {
    console.log('Product clicked:', item);
    alert(\`View product details\\n\${item.name}\\n\${item.description}\`);
  };

  const updateQuantity = (id: string, delta: number) => {
    setItems(items =>
      items.map(item =>
        item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
      )
    );
    console.log(\`Quantity updated for item \${id}, delta: \${delta}\`);
  };

  const removeItem = (id: string) => {
    const item = items.find(i => i.id === id);
    console.log('Item removed:', item);
    setItems(items => items.filter((item: any) => item.id !== id));
    alert(\`\${item?.name} removed from cart\`);
  };

  const handleApplyCoupon = () => {
    console.log('Coupon applied:', couponCode);
    if (couponCode.trim()) {
      alert(\`Coupon "\${couponCode}" applied!\\nDiscount will be calculated at checkout.\`);
    } else {
      alert('Please enter a coupon code');
    }
  };

  const handleCheckout = () => {
    // Use mutation to place order via API
    checkoutMutation.mutate({
      items: items.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
        price: item.price
      })),
      subtotal: subtotal,
      delivery: delivery,
      discount: discount,
      total: total
    });
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal + delivery - discount;

  return (
    <div className={cn("min-h-screen p-4 lg:p-8", styles.background, className)}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className={\`text-5xl font-extrabold mb-3 \${styles.title}\`}>
            {title}
          </h1>
          <p className={\`text-lg font-medium \${styles.subtitle}\`}>
            {items.length} {items.length === 1 ? 'item' : 'items'} ready for checkout
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className={cn(styles.card, 'rounded-2xl shadow-xl overflow-hidden')}>
              {/* Table Header */}
              <div className={cn('hidden md:grid md:grid-cols-12 gap-4 p-6 border-b font-semibold', styles.badge, styles.border, styles.title)}>
                <div className="col-span-5">{productLabel}</div>
                <div className="col-span-2 text-center">{priceLabel}</div>
                <div className="col-span-3 text-center">{quantityLabel}</div>
                <div className="col-span-2 text-center">{removeButton}</div>
              </div>

              {/* Cart Items */}
              <div className={\`divide-y \${styles.border}\`}>
                {items.map((item) => (
                  <div key={item.id} className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                      <div className="md:col-span-5 flex items-center space-x-4">
                        <div className="relative group">
                          <img
                            src={item.image}
                            alt={item.name}
                            className={cn(styles.card, 'w-24 h-24 rounded-xl flex-shrink-0 object-cover cursor-pointer hover:scale-105 transition-all duration-300 shadow-md hover:shadow-xl')}
                            onClick={() => handleProductClick(item)}
                          />
                        </div>
                        <div
                          className={\`cursor-pointer transition-all duration-200 \${styles.text}\`}
                          onClick={() => handleProductClick(item)}
                        >
                          <h3 className={\`font-semibold text-lg \${styles.title}\`}>{item.name}</h3>
                          <p className={\`text-sm mt-1 \${styles.subtitle}\`}>{item.description}</p>
                        </div>
                      </div>

                      <div className="md:col-span-2 text-center">
                        <span className={\`text-lg font-medium \${styles.title}\`}>\${Number(item.price).toFixed(2)}</span>
                      </div>

                      <div className="md:col-span-3 flex justify-center">
                        <div className={cn(styles.badge, 'flex items-center space-x-2 rounded-full p-1')}>
                          <button
                            className={cn(styles.card, styles.cardHover, 'w-9 h-9 p-0 rounded-full flex items-center justify-center transition-all duration-200')}
                            onClick={() => updateQuantity(item.id, -1)}
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className={\`w-14 text-center font-semibold text-lg \${styles.title}\`}>{item.quantity}</span>
                          <button
                            className={cn(styles.card, styles.cardHover, 'w-9 h-9 p-0 rounded-full flex items-center justify-center transition-all duration-200')}
                            onClick={() => updateQuantity(item.id, 1)}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="md:col-span-2 flex justify-center">
                        <button
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full w-10 h-10 p-0 transition-all duration-200 hover:scale-110 flex items-center justify-center"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="space-y-6">
            {/* Coupon */}
            <div className={cn(styles.card, 'rounded-2xl shadow-xl p-6')}>
              <h3 className={\`text-xl font-bold mb-2 \${styles.title}\`}>{couponTitle}</h3>
              <p className={\`text-sm mb-4 \${styles.subtitle}\`}>{couponDescription}</p>
              <div className="flex gap-3">
                <Input
                  placeholder={couponPlaceholder}
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
                  className="flex-1 rounded-xl transition-all duration-200"
                />
                <button
                  className={cn(styles.button, styles.buttonHover, 'shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl px-6')}
                  onClick={handleApplyCoupon}
                >
                  {applyButton}
                </button>
              </div>
            </div>

            {/* Total */}
            <div className={cn(styles.card, 'rounded-2xl shadow-2xl p-6')}>
              <h3 className={\`text-xl font-bold mb-6 \${styles.title}\`}>{totalLabel}</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className={styles.subtitle}>{totalLabel}</span>
                  <span className={\`font-medium \${styles.title}\`}>\${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className={styles.subtitle}>{deliveryLabel}</span>
                  <span className={\`font-medium \${styles.title}\`}>\${delivery.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className={styles.subtitle}>{discountLabel}</span>
                  <span className={\`font-medium \${styles.title}\`}>-\${discount.toFixed(2)}</span>
                </div>
                <div className={\`pt-3 border-t \${styles.border}\`}>
                  <div className="flex justify-between text-lg">
                    <span className={\`font-medium \${styles.title}\`}>{subtotalLabel}</span>
                    <span className={\`font-bold \${styles.title}\`}>\${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <button
                className={cn(styles.button, styles.buttonHover, 'w-full mt-6 h-14 text-lg font-bold shadow-2xl transition-all duration-300 rounded-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed')}
                onClick={handleCheckout}
                disabled={checkoutMutation.isPending || items.length === 0}
              >
                {checkoutMutation.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </span>
                ) : (
                  checkoutButtonText
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShoppingCartComponent;
export { ShoppingCartComponent as ShoppingCart };
    `,

    shoppingCartSidebar: `
${commonImports}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface ShoppingCartProps {
  ${dataName}?: any;
  className?: string;
  variant?: DesignVariant;
  colorScheme?: ColorScheme;
  isOpen?: boolean;
  onClose?: () => void;
  onCheckout?: (data: any) => void;
  [key: string]: any;
}

const ShoppingCartComponent: React.FC<ShoppingCartProps> = ({
  ${dataName},
  className,
  variant = UI_VARIANT,
  colorScheme = UI_COLOR_SCHEME,
  isOpen = true,
  onClose,
  onCheckout
}) => {
  const queryClient = useQueryClient();
  const styles = getVariantStyles(variant, colorScheme);
  const cartData = ${dataName} || {};

  // Mutation for checkout
  const checkoutMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const response = await api.post<any>('/orders', orderData);
      return response?.data || response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order placed successfully!');
      if (onCheckout) onCheckout(data);
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to place order');
    },
  });

  const [items, setItems] = useState<CartItem[]>(${getField('cartItemsSidebar')});

  const title = ${getField('title')};
  const subtotalLabel = ${getField('subtotalLabel')};
  const checkoutButtonText = ${getField('checkoutButtonText')};
  const editButton = ${getField('editButton')};
  const removeButton = ${getField('removeButton')};
  const quantityLabel = ${getField('quantityLabel')};

  // Event handlers
  const handleProductClick = (item: CartItem) => {
    console.log('Product clicked:', item);
    alert(\`\${item.name}\\nPrice: $\${item.price}\\nQuantity: \${item.quantity}\`);
  };

  const handleEdit = (item: CartItem) => {
    console.log('Edit clicked:', item);
    alert(\`Edit \${item.name}\\nModify quantity, color, or size\`);
  };

  const handleRemove = (item: CartItem) => {
    console.log('Remove clicked:', item);
    setItems(items => items.filter(i => i.id !== item.id));
    alert(\`\${item.name} removed from cart\`);
  };

  const handleCheckout = () => {
    // Use mutation to place order via API
    checkoutMutation.mutate({
      items: items.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
        price: item.price
      })),
      subtotal: subtotal
    });
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className={cn("relative", className)}>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-900/50 dark:bg-black/70 z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed right-0 top-0 h-full w-full sm:w-[450px] shadow-2xl z-50 transform transition-transform duration-300",
        styles.card,
        isOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className={\`flex items-center justify-between p-6 border-b \${styles.border}\`}>
            <h2 className={\`text-2xl font-bold \${styles.title}\`}>{title}</h2>
            <button
              onClick={onClose}
              className={cn(styles.cardHover, 'w-8 h-8 flex items-center justify-center rounded-lg transition-colors')}
            >
              <X className={\`w-5 h-5 \${styles.subtitle}\`} />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {items.map((item) => (
              <div key={item.id} className="flex gap-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className={cn(styles.badge, 'w-24 h-24 rounded-lg flex-shrink-0 object-cover cursor-pointer hover:opacity-80 transition-opacity')}
                  onClick={() => handleProductClick(item)}
                />
                <div className="flex-1">
                  <h3
                    className={\`font-medium mb-1 cursor-pointer transition-colors \${styles.title}\`}
                    onClick={() => handleProductClick(item)}
                  >
                    {item.name}
                  </h3>
                  <p className={\`text-sm mb-3 \${styles.subtitle}\`}>{quantityLabel}: {item.quantity}</p>
                  <div className="flex gap-2">
                    <button
                      className={cn(styles.card, styles.cardHover, 'h-8 px-3 rounded-lg text-sm transition-all')}
                      onClick={() => handleEdit(item)}
                    >
                      {editButton}
                    </button>
                    <button
                      className={cn(styles.card, styles.cardHover, 'h-8 px-3 rounded-lg text-sm transition-all')}
                      onClick={() => handleRemove(item)}
                    >
                      {removeButton}
                    </button>
                  </div>
                </div>
                <div className={\`text-lg font-bold \${styles.title}\`}>
                  \${item.price}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className={\`border-t p-6 \${styles.border}\`}>
            <div className="flex justify-between items-center mb-4">
              <span className={\`text-lg \${styles.subtitle}\`}>{subtotalLabel}:</span>
              <span className={\`text-2xl font-bold \${styles.title}\`}>\${subtotal}</span>
            </div>
            <button
              className={cn(styles.button, styles.buttonHover, 'w-full h-12 text-base rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed')}
              onClick={handleCheckout}
              disabled={checkoutMutation.isPending || items.length === 0}
            >
              {checkoutMutation.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </span>
              ) : (
                checkoutButtonText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShoppingCartComponent;
export { ShoppingCartComponent as ShoppingCart };
    `,

    shoppingCartCards: `
${commonImports}

interface CartItem {
  id: string;
  name: string;
  description: string;
  color: string;
  price: number;
  quantity: number;
  image: string;
}

interface ShoppingCartProps {
  ${dataName}?: any;
  className?: string;
  variant?: DesignVariant;
  colorScheme?: ColorScheme;
  onCheckout?: (data: any) => void;
  [key: string]: any;
}

const ShoppingCartComponent: React.FC<ShoppingCartProps> = ({
  ${dataName},
  className,
  variant = UI_VARIANT,
  colorScheme = UI_COLOR_SCHEME,
  onCheckout
}) => {
  const queryClient = useQueryClient();
  const styles = getVariantStyles(variant, colorScheme);
  const cartData = ${dataName} || {};

  // Mutation for checkout
  const checkoutMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const response = await api.post<any>('/orders', orderData);
      return response?.data || response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order placed successfully!');
      if (onCheckout) onCheckout(data);
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to place order');
    },
  });

  const [items, setItems] = useState<CartItem[]>(${getField('cartItemsCards')});
  const [couponCode, setCouponCode] = useState('');

  const title = ${getField('title')};
  const couponLabel = ${getField('couponLabel')};
  const subtotalLabel = ${getField('subtotalLabel')};
  const subtotalDescription = ${getField('subtotalDescription')};
  const checkoutButtonText = ${getField('checkoutButtonText')};
  const securedPaymentText = ${getField('securedPaymentText')};
  const colorLabel = ${getField('colorLabel')};
  const quantityLabel = ${getField('quantityLabel')};
  const applyButton = ${getField('applyButton')};
  const colorOptions = ${getField('colorOptions')};

  // Event handlers
  const handleProductClick = (item: CartItem) => {
    console.log('Product clicked:', item);
    alert(\`\${item.name}\\n\${item.description}\\nPrice: $\${Number(item.price).toFixed(2)}\`);
  };

  const handleColorChange = (itemId: string, newColor: string) => {
    console.log(\`Color changed for item \${itemId}: \${newColor}\`);
    setItems(items =>
      items.map(item =>
        item.id === itemId ? { ...item, color: newColor } : item
      )
    );
  };

  const updateQuantity = (id: string, delta: number) => {
    setItems(items =>
      items.map(item =>
        item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
      )
    );
    console.log(\`Quantity updated for item \${id}, delta: \${delta}\`);
  };

  const handleApplyCoupon = () => {
    console.log('Coupon applied:', couponCode);
    if (couponCode.trim()) {
      alert(\`Coupon "\${couponCode}" applied!\\nDiscount will be calculated at checkout.\`);
    } else {
      alert('Please enter a coupon code');
    }
  };

  const handleCheckout = () => {
    // Use mutation to place order via API
    checkoutMutation.mutate({
      items: items.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
        color: item.color
      })),
      subtotal: subtotal
    });
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className={cn("min-h-screen p-4 lg:p-8", styles.background, className)}>
      <div className="max-w-6xl mx-auto">
        <h1 className={\`text-4xl font-bold mb-8 \${styles.title}\`}>{title}</h1>

        <div className="space-y-6">
          {/* Cart Items */}
          {items.map((item) => (
            <div key={item.id} className={cn(styles.card, 'rounded-lg shadow-sm p-6')}>
              <div className="flex flex-col md:flex-row gap-6">
                <img
                  src={item.image}
                  alt={item.name}
                  className={cn(styles.badge, 'w-full md:w-48 h-48 rounded-lg flex-shrink-0 object-cover cursor-pointer hover:opacity-80 transition-opacity')}
                  onClick={() => handleProductClick(item)}
                />

                <div className="flex-1 space-y-4">
                  <div>
                    <h3
                      className={\`text-2xl font-bold mb-2 cursor-pointer transition-colors \${styles.title}\`}
                      onClick={() => handleProductClick(item)}
                    >
                      {item.name}
                    </h3>
                    <p className={styles.subtitle}>{item.description}</p>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <label className={\`text-sm mb-2 block \${styles.subtitle}\`}>{colorLabel}</label>
                      <Select
                        value={item.color}
                        onValueChange={(value) => handleColorChange(item.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {colorOptions.map((color: string) => (
                            <SelectItem key={color} value={color}>
                              {color}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className={\`text-sm mb-2 block \${styles.subtitle}\`}>{quantityLabel}</label>
                      <div className="flex items-center space-x-3">
                        <button
                          className={cn(styles.card, styles.cardHover, 'w-8 h-8 p-0 rounded-lg flex items-center justify-center transition-all')}
                          onClick={() => updateQuantity(item.id, -1)}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className={\`w-12 text-center \${styles.title}\`}>{item.quantity}</span>
                        <button
                          className={cn(styles.card, styles.cardHover, 'w-8 h-8 p-0 rounded-lg flex items-center justify-center transition-all')}
                          onClick={() => updateQuantity(item.id, 1)}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={\`text-3xl font-bold \${styles.title}\`}>{Number(item.price).toFixed(2)}\$</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Coupon and Checkout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={cn(styles.card, 'rounded-lg shadow-sm p-6')}>
              <label className={\`mb-4 block \${styles.subtitle}\`}>{couponLabel}</label>
              <div className="flex gap-3">
                <Input
                  placeholder={couponLabel}
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
                  className="flex-1"
                />
                <button
                  className={cn(styles.button, styles.buttonHover, 'px-8 rounded-lg font-bold transition-all')}
                  onClick={handleApplyCoupon}
                >
                  {applyButton}
                </button>
              </div>
            </div>

            <div className={cn(styles.card, 'rounded-lg shadow-sm p-6 space-y-4')}>
              <div className="flex justify-between text-xl">
                <span className={\`font-medium \${styles.title}\`}>{subtotalLabel}</span>
                <span className={\`font-bold \${styles.title}\`}>{subtotal.toFixed(2)}\$</span>
              </div>
              <p className={\`text-sm \${styles.subtitle}\`}>{subtotalDescription}</p>
              <button
                className={cn(styles.button, styles.buttonHover, 'w-full h-12 text-base rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed')}
                onClick={handleCheckout}
                disabled={checkoutMutation.isPending || items.length === 0}
              >
                {checkoutMutation.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </span>
                ) : (
                  checkoutButtonText
                )}
              </button>
              <div>
                <p className={\`text-sm mb-3 \${styles.subtitle}\`}>{securedPaymentText}</p>
                <div className="flex items-center space-x-4">
                  <div className={\`font-bold text-sm \${styles.accent}\`}>PayPal</div>
                  <div className={\`font-bold text-sm \${styles.accent}\`}>VISA</div>
                  <div className={\`font-bold text-sm \${styles.accent}\`}>MC</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShoppingCartComponent;
export { ShoppingCartComponent as ShoppingCart };
    `,

    shoppingCartWithStock: `
${commonImports}

interface CartItem {
  id: string;
  name: string;
  color: string;
  size: string;
  price: number;
  quantity: number;
  inStock: boolean;
  image: string;
}

interface ShoppingCartProps {
  ${dataName}?: any;
  className?: string;
  variant?: DesignVariant;
  colorScheme?: ColorScheme;
  onCheckout?: (data: any) => void;
  [key: string]: any;
}

const ShoppingCartComponent: React.FC<ShoppingCartProps> = ({
  ${dataName},
  className,
  variant = UI_VARIANT,
  colorScheme = UI_COLOR_SCHEME,
  onCheckout
}) => {
  const queryClient = useQueryClient();
  const styles = getVariantStyles(variant, colorScheme);
  const cartData = ${dataName} || {};

  // Mutation for checkout
  const checkoutMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const response = await api.post<any>('/orders', orderData);
      return response?.data || response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order placed successfully!');
      if (onCheckout) onCheckout(data);
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to place order');
    },
  });

  const [items, setItems] = useState<CartItem[]>(${getField('cartItemsStock')});
  const [couponCode, setCouponCode] = useState('');

  const title = ${getField('title')};
  const couponPrompt = ${getField('couponPrompt')};
  const checkoutButtonText = ${getField('checkoutButtonText')};
  const freeShippingThreshold = ${getField('freeShippingThreshold')};
  const shippingCost = ${getField('shippingCost')};
  const discount = ${getField('discount')};
  const subtotalLabel = ${getField('subtotalLabel')};
  const shippingLabel = ${getField('shippingLabel')};
  const discountLabel = ${getField('discountLabel')};
  const estimatedTotalLabel = ${getField('estimatedTotalLabel')};
  const colorLabel = ${getField('colorLabel')};
  const sizeLabel = ${getField('sizeLabel')};
  const quantityLabel = ${getField('quantityLabel')};
  const eachLabel = ${getField('eachLabel')};
  const inStockText = ${getField('inStockText')};
  const editButton = ${getField('editButton')};
  const removeButton = ${getField('removeButton')};
  const submitButton = ${getField('submitButton')};

  // Event handlers
  const handleProductClick = (item: CartItem) => {
    console.log('Product clicked:', item);
    alert(\`\${item.name}\\nColor: \${item.color}\\nSize: \${item.size}\\nPrice: $\${Number(item.price).toFixed(2)}\`);
  };

  const handleEdit = (item: CartItem) => {
    console.log('Edit clicked:', item);
    alert(\`Edit \${item.name}\\nModify color, size, or quantity\`);
  };

  const handleRemove = (item: CartItem) => {
    console.log('Remove clicked:', item);
    setItems(items => items.filter(i => i.id !== item.id));
    alert(\`\${item.name} removed from cart\`);
  };

  const updateQuantity = (id: string, newQuantity: number) => {
    setItems(items =>
      items.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
    console.log(\`Quantity updated for item \${id}: \${newQuantity}\`);
  };

  const handleApplyCoupon = () => {
    console.log('Coupon submitted:', couponCode);
    if (couponCode.trim()) {
      alert(\`Coupon "\${couponCode}" submitted!\\nVerifying discount...\`);
    } else {
      alert('Please enter a coupon code');
    }
  };

  const handleCheckout = () => {
    // Use mutation to place order via API
    checkoutMutation.mutate({
      items: items.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
        color: item.color,
        size: item.size
      })),
      subtotal: subtotal,
      shipping: shippingCost,
      discount: discount,
      total: estimatedTotal
    });
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const estimatedTotal = subtotal + shippingCost - discount;
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  return (
    <div className={cn("min-h-screen p-4 lg:p-8", styles.background, className)}>
      <div className="max-w-6xl mx-auto">
        <h1 className={\`text-4xl font-bold mb-8 \${styles.title}\`}>{title}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {items.map((item) => (
              <div key={item.id} className={\`border-b pb-6 \${styles.border}\`}>
                <div className="flex gap-6">
                  <img
                    src={item.image}
                    alt={item.name}
                    className={cn(styles.badge, 'w-48 h-48 rounded-lg flex-shrink-0 object-cover cursor-pointer hover:opacity-80 transition-opacity')}
                    onClick={() => handleProductClick(item)}
                  />

                  <div className="flex-1">
                    <h3
                      className={\`text-xl font-bold mb-1 cursor-pointer transition-colors \${styles.title}\`}
                      onClick={() => handleProductClick(item)}
                    >
                      {item.name}
                    </h3>
                    <div className={\`text-sm mb-1 \${styles.subtitle}\`}>{colorLabel}: {item.color}</div>
                    <div className={\`text-sm mb-3 \${styles.subtitle}\`}>{sizeLabel}: {item.size}</div>
                    {item.inStock && (
                      <div className="text-sm text-green-600 dark:text-green-400 font-medium mb-4">{inStockText}</div>
                    )}

                    <div className="flex gap-3 mb-4">
                      <button
                        className={cn(styles.card, styles.cardHover, 'px-4 py-2 rounded-lg text-sm font-medium transition-all')}
                        onClick={() => handleEdit(item)}
                      >
                        {editButton}
                      </button>
                      <button
                        className={cn(styles.card, styles.cardHover, 'px-4 py-2 rounded-lg text-sm font-medium transition-all')}
                        onClick={() => handleRemove(item)}
                      >
                        {removeButton}
                      </button>
                    </div>
                  </div>

                  <div className="text-right space-y-4">
                    <div>
                      <div className={\`text-sm mb-2 \${styles.subtitle}\`}>{eachLabel}</div>
                      <div className={\`text-2xl font-bold \${styles.title}\`}>\${Number(item.price).toFixed(2)}</div>
                    </div>

                    <div>
                      <div className={\`text-sm mb-2 \${styles.subtitle}\`}>{quantityLabel}</div>
                      <Select
                        value={item.quantity.toString()}
                        onValueChange={(value) => updateQuantity(item.id, parseInt(value))}
                      >
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                            <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="space-y-6">
            {/* Coupon */}
            <div className={cn(styles.card, 'rounded-lg p-6')}>
              <h3 className={\`text-lg font-bold mb-4 \${styles.title}\`}>{couponPrompt}</h3>
              <div className="flex gap-2">
                <Input
                  placeholder={couponPrompt}
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
                  className="flex-1"
                />
                <button
                  className={cn(styles.button, styles.buttonHover, 'px-6 rounded-lg font-bold transition-all')}
                  onClick={handleApplyCoupon}
                >
                  {submitButton}
                </button>
              </div>
            </div>

            {/* Totals */}
            <div className={cn(styles.card, 'rounded-lg p-6 space-y-4')}>
              <div className="flex justify-between">
                <span className={styles.subtitle}>{subtotalLabel}</span>
                <span className={\`font-medium \${styles.title}\`}>\${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className={styles.subtitle}>{shippingLabel}</span>
                <span className={\`font-medium \${styles.title}\`}>\${shippingCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className={styles.subtitle}>{discountLabel}</span>
                <span className={\`font-medium \${styles.title}\`}>\${discount.toFixed(2)}</span>
              </div>
              <div className={\`pt-4 border-t \${styles.border}\`}>
                <div className="flex justify-between text-lg">
                  <span className={\`font-bold \${styles.title}\`}>{estimatedTotalLabel}</span>
                  <span className={\`font-bold \${styles.title}\`}>\${estimatedTotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                className={cn(styles.button, styles.buttonHover, 'w-full h-12 text-base rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed')}
                onClick={handleCheckout}
                disabled={checkoutMutation.isPending || items.length === 0}
              >
                {checkoutMutation.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </span>
                ) : (
                  checkoutButtonText
                )}
              </button>

              {amountToFreeShipping > 0 && (
                <p className={\`text-center text-sm \${styles.subtitle}\`}>
                  You're <span className={\`font-bold \${styles.accent}\`}>\${amountToFreeShipping.toFixed(2)}</span> away from free shipping!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShoppingCartComponent;
    `
  };

  return variants[variant] || variants.shoppingCartTable;
};