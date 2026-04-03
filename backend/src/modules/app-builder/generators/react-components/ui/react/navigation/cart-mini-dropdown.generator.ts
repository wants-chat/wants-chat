import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateCartMiniDropdown = (
  resolved: ResolvedComponent,
  variant: 'dropdown' | 'flyout' | 'sidebar' = 'dropdown'
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
    return `/${dataSource || 'cart'}`;
  };

  const apiRoute = getApiRoute();

  // Derive entity name for query key
  const entity = dataSource ? dataSource.split('.').pop() || 'cart' : 'cart';

  const commonImports = `
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { X, ShoppingCart, Minus, Plus, Trash2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';`;

  const variants = {
    dropdown: `
${commonImports}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface CartMiniDropdownProps {
  ${dataName}?: any;
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

const CartMiniDropdownComponent: React.FC<CartMiniDropdownProps> = ({
  ${dataName}: propData,
  className,
  isOpen = true,
  onClose
}) => {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response);
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};

  const cartData = ${dataName} || {};

  const [cartItems, setCartItems] = useState<CartItem[]>(${getField('cartItemsDropdown')});

  const title = ${getField('title')};
  const subtotalLabel = ${getField('subtotalLabel')};
  const viewCartButton = ${getField('viewCartButton')};
  const checkoutButton = ${getField('checkoutButton')};
  const emptyTitle = ${getField('emptyTitle')};
  const emptyMessage = ${getField('emptyMessage')};
  const continueShoppingButton = ${getField('continueShoppingButton')};
  const itemCountLabel = ${getField('itemCountLabel')};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Event handlers
  const handleProductClick = (item: CartItem) => {
    console.log('Product clicked:', item);
    alert(\`\${item.name}\\nPrice: $\${Number(item.price).toFixed(2)}\\nQuantity: \${item.quantity}\`);
  };

  const removeItem = (id: string) => {
    const item = cartItems.find(i => i.id === id);
    console.log('Item removed:', item);
    setCartItems(items => items.filter((item: any) => item.id !== id));
    alert(\`\${item?.name} removed from cart\`);
  };

  const handleViewCart = () => {
    console.log('View cart clicked');
    alert('Navigating to full cart page...');
  };

  const handleCheckout = () => {
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    console.log('Quick checkout clicked', { cartItems, subtotal });
    alert(\`Quick Checkout\\nSubtotal: $\${subtotal.toFixed(2)}\\nItems: \${cartItems.length}\`);
  };

  const handleContinueShopping = () => {
    console.log('Continue shopping clicked');
    if (onClose) onClose();
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-transparent z-40"
        onClick={onClose}
      />

      {/* Dropdown */}
      <div className={cn(
        "absolute right-0 top-full mt-3 w-96 bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-2xl z-50 border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-xl",
        className
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/10 dark:to-purple-900/10 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                {title}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">{itemCount} {itemCountLabel}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 hover:scale-110"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Cart Items or Empty State */}
        {cartItems.length === 0 ? (
          <div className="p-8 text-center">
            <ShoppingCart className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{emptyTitle}</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{emptyMessage}</p>
            <Button
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              onClick={handleContinueShopping}
            >
              {continueShoppingButton}
            </Button>
          </div>
        ) : (
          <>
            {/* Items List */}
            <div className="max-h-80 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {cartItems.map((item) => (
                <div key={item.id} className="flex gap-3 group p-3 rounded-xl hover:bg-gray-100/80 dark:hover:bg-gray-700/50 transition-all duration-200">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-400 rounded-xl opacity-0 group-hover:opacity-15 transition-opacity duration-300"></div>
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-18 h-18 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-xl flex-shrink-0 object-cover cursor-pointer hover:scale-105 transition-all duration-300 shadow-md"
                      onClick={() => handleProductClick(item)}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4
                      className="font-medium text-sm text-gray-900 dark:text-white truncate cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      onClick={() => handleProductClick(item)}
                    >
                      {item.name}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Qty: {item.quantity}
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      \${Number(item.price).toFixed(2)}
                    </p>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="self-start opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4 text-red-500 hover:text-red-700" />
                  </button>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-5 space-y-4 bg-gradient-to-b from-gray-50/50 to-white dark:from-gray-800/50 dark:to-gray-900 rounded-b-2xl">
              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl">
                <span className="font-semibold text-gray-700 dark:text-gray-300">{subtotalLabel}</span>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">\${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 rounded-xl transition-all duration-200"
                  onClick={handleViewCart}
                >
                  {viewCartButton}
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-500 dark:to-blue-600 shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl"
                  onClick={handleCheckout}
                >
                  {checkoutButton}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default CartMiniDropdownComponent;
    `,

    flyout: `
${commonImports}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  variant?: string;
  image: string;
}

interface CartMiniDropdownProps {
  ${dataName}?: any;
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

const CartMiniDropdownComponent: React.FC<CartMiniDropdownProps> = ({
  ${dataName}: propData,
  className,
  isOpen = true,
  onClose
}) => {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response);
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};

  const cartData = ${dataName} || {};

  const [cartItems, setCartItems] = useState<CartItem[]>(${getField('cartItemsFlyout')});

  const title = ${getField('title')};
  const subtotalLabel = ${getField('subtotalLabel')};
  const viewCartButton = ${getField('viewCartButton')};
  const checkoutButton = ${getField('checkoutButton')};
  const emptyTitle = ${getField('emptyTitle')};
  const emptyMessage = ${getField('emptyMessage')};
  const continueShoppingButton = ${getField('continueShoppingButton')};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Event handlers
  const handleProductClick = (item: CartItem) => {
    console.log('Product clicked:', item);
    alert(\`\${item.name}\${item.variant ? '\\n' + item.variant : ''}\\nPrice: $\${Number(item.price).toFixed(2)}\`);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCartItems(items =>
      items.map(item =>
        item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
      )
    );
    console.log(\`Quantity updated for item \${id}, delta: \${delta}\`);
  };

  const removeItem = (id: string) => {
    const item = cartItems.find(i => i.id === id);
    console.log('Item removed:', item);
    setCartItems(items => items.filter((item: any) => item.id !== id));
    alert(\`\${item?.name} removed from cart\`);
  };

  const handleViewCart = () => {
    console.log('View cart clicked');
    alert('Navigating to full cart page...');
  };

  const handleCheckout = () => {
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    console.log('Checkout clicked', { cartItems, subtotal });
    alert(\`Proceeding to checkout\\nSubtotal: $\${subtotal.toFixed(2)}\`);
  };

  const handleContinueShopping = () => {
    console.log('Continue shopping clicked');
    if (onClose) onClose();
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-900 dark:bg-black bg-opacity-50 dark:bg-opacity-70 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Flyout Panel */}
      <div className={cn(
        "fixed right-0 top-0 h-full w-full sm:w-[450px] bg-white dark:bg-gray-800 shadow-2xl z-50 transform transition-transform duration-300",
        isOpen ? "translate-x-0" : "translate-x-full",
        className
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Cart Items or Empty State */}
          {cartItems.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8">
              <ShoppingCart className="w-20 h-20 text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{emptyTitle}</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6 text-center">{emptyMessage}</p>
              <Button
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                onClick={handleContinueShopping}
              >
                {continueShoppingButton}
              </Button>
            </div>
          ) : (
            <>
              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4 pb-6 border-b border-gray-200 dark:border-gray-700 last:border-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-lg flex-shrink-0 object-cover cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => handleProductClick(item)}
                    />
                    <div className="flex-1">
                      <h3
                        className="font-medium text-gray-900 dark:text-white mb-1 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        onClick={() => handleProductClick(item)}
                      >
                        {item.name}
                      </h3>
                      {item.variant && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{item.variant}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-7 h-7 p-0 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                            onClick={() => updateQuantity(item.id, -1)}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-8 text-center text-sm text-gray-900 dark:text-white">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-7 h-7 p-0 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                            onClick={() => updateQuantity(item.id, 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      \${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 dark:border-gray-700 p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium text-gray-700 dark:text-gray-300">{subtotalLabel}:</span>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">\${subtotal.toFixed(2)}</span>
                </div>
                <div className="space-y-2">
                  <Button
                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                    onClick={handleCheckout}
                  >
                    {checkoutButton}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full h-12 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                    onClick={handleViewCart}
                  >
                    {viewCartButton}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default CartMiniDropdownComponent;
    `,

    sidebar: `
${commonImports}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  variant?: string;
  image: string;
}

interface CartMiniDropdownProps {
  ${dataName}?: any;
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

const CartMiniDropdownComponent: React.FC<CartMiniDropdownProps> = ({
  ${dataName}: propData,
  className,
  isOpen = true,
  onClose
}) => {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response);
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};

  const cartData = ${dataName} || {};

  const [cartItems, setCartItems] = useState<CartItem[]>(${getField('cartItemsSidebar')});

  const title = ${getField('title')};
  const subtotalLabel = ${getField('subtotalLabel')};
  const viewCartButton = ${getField('viewCartButton')};
  const checkoutButton = ${getField('checkoutButton')};
  const emptyTitle = ${getField('emptyTitle')};
  const emptyMessage = ${getField('emptyMessage')};
  const continueShoppingButton = ${getField('continueShoppingButton')};
  const removeButton = ${getField('removeButton')};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Event handlers
  const handleProductClick = (item: CartItem) => {
    console.log('Product clicked:', item);
    alert(\`\${item.name}\${item.variant ? '\\n' + item.variant : ''}\\nPrice: $\${Number(item.price).toFixed(2)}\`);
  };

  const removeItem = (id: string) => {
    const item = cartItems.find(i => i.id === id);
    console.log('Item removed:', item);
    setCartItems(items => items.filter((item: any) => item.id !== id));
    alert(\`\${item?.name} removed from cart\`);
  };

  const handleViewCart = () => {
    console.log('View cart clicked');
    alert('Navigating to full cart page...');
  };

  const handleCheckout = () => {
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    console.log('Checkout clicked', { cartItems, subtotal });
    alert(\`Proceeding to checkout\\nSubtotal: $\${subtotal.toFixed(2)}\`);
  };

  const handleContinueShopping = () => {
    console.log('Continue shopping clicked');
    if (onClose) onClose();
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-900 dark:bg-black bg-opacity-50 dark:bg-opacity-70 z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed right-0 top-0 h-full w-full sm:w-96 bg-white dark:bg-gray-800 shadow-2xl z-50 transform transition-all duration-300",
        isOpen ? "translate-x-0" : "translate-x-full",
        className
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-800">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">{itemCount} items</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Cart Items or Empty State */}
          {cartItems.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8">
              <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                <ShoppingCart className="w-12 h-12 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{emptyTitle}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 text-center">{emptyMessage}</p>
              <Button
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                onClick={handleContinueShopping}
              >
                {continueShoppingButton}
              </Button>
            </div>
          ) : (
            <>
              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                  {cartItems.map((item: any, index: number) => (
                    <div
                      key={item.id}
                      className="flex gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="relative">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-20 h-20 bg-gray-100 dark:bg-gray-600 rounded-lg flex-shrink-0 object-cover cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => handleProductClick(item)}
                        />
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center font-medium">
                          {item.quantity}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4
                          className="font-medium text-sm text-gray-900 dark:text-white truncate cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          onClick={() => handleProductClick(item)}
                        >
                          {item.name}
                        </h4>
                        {item.variant && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.variant}</p>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-sm font-bold text-gray-900 dark:text-white">
                            \${(item.price * item.quantity).toFixed(2)}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                            onClick={() => removeItem(item.id)}
                          >
                            {removeButton}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-800/50">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-base font-medium text-gray-700 dark:text-gray-300">{subtotalLabel}</span>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">\${subtotal.toFixed(2)}</span>
                </div>
                <div className="space-y-2">
                  <Button
                    className="w-full h-11 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 font-semibold"
                    onClick={handleCheckout}
                  >
                    {checkoutButton}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full h-11 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                    onClick={handleViewCart}
                  >
                    {viewCartButton}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default CartMiniDropdownComponent;
    `
  };

  return variants[variant] || variants.dropdown;
};
