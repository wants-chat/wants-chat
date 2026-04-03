import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateCartFullPage = (
  resolved: ResolvedComponent,
  variant: 'table' | 'cards' | 'enhanced' = 'table'
) => {
  const dataSource = resolved.dataSource;
  const useLocalStorageCart = resolved.props?.useLocalStorageCart === true;

  const getField = (fieldName: string): string => {
    const mapping = resolved.fieldMappings.find(m => m.targetField === fieldName);
    if (mapping?.sourceField) {
      return `propData?.${mapping.sourceField}`;
    }
    // Return undefined/empty for missing data - let component handle gracefully
    // For ID fields
    if (fieldName === 'id' || fieldName.endsWith('Id')) {
      return `propData?.id || propData?._id`;
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

  // Get API routes from serverFunction for cart operations (similar to form generator)
  const getCartApiRoutes = () => {
    if (!resolved.actions || resolved.actions.length === 0) {
      return { fetch: null, update: null, delete: null };
    }

    const fetchAction = resolved.actions.find(
      action => action.type === 'fetch' && action.trigger === 'onLoad' && action.serverFunction
    );
    const updateAction = resolved.actions.find(
      action => action.type === 'update' && action.serverFunction
    );
    const deleteAction = resolved.actions.find(
      action => action.type === 'delete' && action.serverFunction
    );

    // Remove /api/v1/ prefix if present since api client adds it
    return {
      fetch: fetchAction?.serverFunction?.route?.replace(/^\/api\/v1\//, '') || null,
      update: updateAction?.serverFunction?.route?.replace(/^\/api\/v1\//, '') || null,
      delete: deleteAction?.serverFunction?.route?.replace(/^\/api\/v1\//, '') || null
    };
  };

  const cartApiRoutes = getCartApiRoutes();
  // Use localStorage if explicitly set, otherwise fallback to API if routes exist
  const useApiForCart = !useLocalStorageCart && !!(cartApiRoutes.fetch || cartApiRoutes.update || cartApiRoutes.delete);

  const commonImports = `
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Minus, Plus, Trash2, ShoppingBag, Tag, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';${useApiForCart ? `
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';` : ''}`;

  const variants = {
    table: `
${commonImports}

interface CartItem {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  image: string;
  restaurant_id?: string | null;
}

interface CartFullPageProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const CartFullPageComponent: React.FC<CartFullPageProps> = ({
  ${dataName}: propData,
  className
}) => {
  ${useApiForCart ? `const queryClient = useQueryClient();
  const [promoCode, setPromoCode] = useState('');

  // Fetch cart from API
  const { data: apiCartData, isLoading, refetch } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const response = await api.get<any>('${cartApiRoutes.fetch}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: true
  });

  // Update cart item quantity
  const updateQuantityMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      const route = '${cartApiRoutes.update}'.replace(':itemId', itemId);
      return api.patch<any>(route, { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Cart updated');
    },
    onError: () => {
      toast.error('Failed to update cart');
    }
  });

  // Delete cart item
  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const route = '${cartApiRoutes.delete}'.replace(':itemId', itemId);
      return api.delete<any>(route);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Item removed from cart');
    },
    onError: () => {
      toast.error('Failed to remove item');
    }
  });

  // Transform API data to cart items
  const cartItems = React.useMemo(() => {
    if (!apiCartData || !Array.isArray(apiCartData)) return [];
    return apiCartData.map((item: any) => ({
      id: item.id,
      name: item.menu_item?.name || item.name || 'Item',
      description: item.menu_item?.description || item.description || '',
      price: parseFloat(item.unit_price || item.price || 0),
      quantity: item.quantity || 1,
      image: item.menu_item?.cover_image || item.image || ''
    }));
  }, [apiCartData]);` : `const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [promoCode, setPromoCode] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('cart');
      if (stored) {
        const parsedCart = JSON.parse(stored);
        const transformedItems = parsedCart.map((item: any) => ({
          id: item.productId || item.id,
          name: item.name,
          description: item.description || '',
          price: parseFloat(item.price),
          quantity: item.quantity,
          image: item.image,
          restaurant_id: item.restaurant_id || item.restaurantId || null
        }));
        setCartItems(transformedItems);
      }
      setIsInitialized(true);
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      setIsInitialized(true);
    }
  }, []);

  // Auto-sync to localStorage (only after initial load)
  useEffect(() => {
    if (!isInitialized) return; // Don't save on initial mount

    try {
      const cartData = cartItems.map(item => ({
        productId: item.id,
        name: item.name,
        description: item.description,
        price: item.price.toString(),
        quantity: item.quantity,
        image: item.image,
        restaurant_id: item.restaurant_id || null
      }));
      localStorage.setItem('cart', JSON.stringify(cartData));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [cartItems, isInitialized]);`}

  const title = ${getField('title')} || 'Shopping Cart';
  const checkoutButton = ${getField('checkoutButton')} || 'Proceed to Checkout';
  const continueShoppingButton = ${getField('continueShoppingButton')} || 'Continue Shopping';
  const promoCodeLabel = ${getField('promoCodeLabel')} || 'Promo Code';
  const applyButton = ${getField('applyButton')} || 'Apply';
  const subtotalLabel = ${getField('subtotalLabel')} || 'Subtotal';
  const shippingLabel = ${getField('shippingLabel')} || 'Shipping';
  const taxLabel = ${getField('taxLabel')} || 'Tax';
  const totalLabel = ${getField('totalLabel')} || 'Total';
  const productLabel = ${getField('productLabel')} || 'Product';
  const priceLabel = ${getField('priceLabel')} || 'Price';
  const quantityLabel = ${getField('quantityLabel')} || 'Quantity';
  const totalPriceLabel = ${getField('totalPriceLabel')} || 'Total';
  const removeButton = ${getField('removeButton')} || 'Remove';
  const shippingMessage = ${getField('shippingMessage')} || 'Calculated at checkout';
  const taxMessage = ${getField('taxMessage')} || 'Calculated at checkout';

  // Event handlers
  const navigate = useNavigate();

  const handleProductClick = (item: CartItem) => {
    console.log('Product clicked:', item);
    toast.info(\`\${item.name} - $\${Number(item.price).toFixed(2)}\`);
  };

  const updateQuantity = (id: string, delta: number) => {
    ${useApiForCart ? `const item = cartItems.find(i => i.id === id);
    if (item) {
      const newQuantity = Math.max(1, item.quantity + delta);
      updateQuantityMutation.mutate({ itemId: id, quantity: newQuantity });
    }` : `setCartItems(items =>
      items.map(item =>
        item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
      )
    );`}
  };

  const removeItem = (id: string) => {
    ${useApiForCart ? `deleteItemMutation.mutate(id);` : `const item = cartItems.find(i => i.id === id);
    setCartItems(items => items.filter((item: any) => item.id !== id));
    toast.success(\`\${item?.name} removed from cart\`);`}
  };

  const handleApplyPromo = () => {
    if (promoCode.trim()) {
      toast.success(\`Promo code "\${promoCode}" applied!\`);
    } else {
      toast.error('Please enter a promo code');
    }
  };

  const handleContinueShopping = () => {
    navigate('/products');
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty!');
      return;
    }
    navigate('/checkout');
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = cartItems.length > 0 ? (${getField('shipping')} || 5.99) : 0;
  const tax = cartItems.length > 0 ? (${getField('tax')} || 8.50) : 0;

  ${useApiForCart ? `if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }` : ''}

  return (
    <div className={cn("min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950/20 py-12 px-4 sm:px-6 lg:px-8", className)}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-6xl font-extrabold bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 dark:from-white dark:via-blue-200 dark:to-white bg-clip-text text-transparent mb-4">{title}</h1>
          <p className="mt-4 text-xl text-gray-600 dark:text-gray-400 font-medium">
            <span className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full">
              {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
            </span>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Cart Items Table */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-3xl shadow-2xl overflow-hidden border-2 border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm">
              {/* Table Header */}
              <div className="hidden md:grid md:grid-cols-12 gap-4 px-8 py-6 bg-gradient-to-r from-blue-50 via-purple-50/50 to-blue-50 dark:from-blue-900/20 dark:via-purple-900/10 dark:to-blue-900/20 border-b-2 border-gray-200 dark:border-gray-700">
                <div className="col-span-6 text-sm font-medium text-gray-700 dark:text-gray-300">{productLabel}</div>
                <div className="col-span-2 text-sm font-medium text-gray-700 dark:text-gray-300 text-center">{priceLabel}</div>
                <div className="col-span-2 text-sm font-medium text-gray-700 dark:text-gray-300 text-center">{quantityLabel}</div>
                <div className="col-span-2 text-sm font-medium text-gray-700 dark:text-gray-300 text-center">{totalPriceLabel}</div>
              </div>

              {/* Cart Items */}
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {cartItems.length === 0 ? (
                  <div className="p-12 text-center">
                    <ShoppingCart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Your cart is empty</h3>
                    <p className="text-gray-600 mb-6">Add some products to get started!</p>
                    <Button onClick={handleContinueShopping}>Start Shopping</Button>
                  </div>
                ) : cartItems.map((item) => (
                  <div key={item.id} className="p-8 hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-purple-50/20 dark:hover:from-blue-900/10 dark:hover:to-purple-900/5 transition-all duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                      {/* Product Info */}
                      <div className="md:col-span-6 flex items-center space-x-5">
                        <div className="relative group">
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-sm"></div>
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-28 h-28 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-2xl flex-shrink-0 object-cover cursor-pointer hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl border border-gray-200 dark:border-gray-600"
                            onClick={() => handleProductClick(item)}
                          />
                        </div>
                        <div className="flex-1">
                          <h3
                            className="font-medium text-gray-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            onClick={() => handleProductClick(item)}
                          >
                            {item.name}
                          </h3>
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{item.description}</p>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="mt-2 text-sm text-red-500 hover:text-red-700 dark:hover:text-red-400"
                          >
                            {removeButton}
                          </button>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="md:col-span-2 text-center">
                        <span className="text-lg font-medium text-gray-900 dark:text-white">\${Number(item.price).toFixed(2)}</span>
                      </div>

                      {/* Quantity */}
                      <div className="md:col-span-2 flex justify-center">
                        <div className="flex items-center space-x-3">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-8 h-8 p-0 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                            onClick={() => updateQuantity(item.id, -1)}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="w-12 text-center text-gray-900 dark:text-white">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-8 h-8 p-0 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                            onClick={() => updateQuantity(item.id, 1)}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Total */}
                      <div className="md:col-span-2 text-center">
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          \${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Continue Shopping */}
            <div className="mt-6">
              <Button
                variant="outline"
                className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                onClick={handleContinueShopping}
              >
                {continueShoppingButton}
              </Button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 sticky top-8 border border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Order Summary</h2>

              {/* Promo Code */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {promoCodeLabel}
                </label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleApplyPromo()}
                    className="flex-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                  />
                  <Button
                    variant="outline"
                    className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                    onClick={handleApplyPromo}
                  >
                    {applyButton}
                  </Button>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 pb-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">{subtotalLabel}</span>
                  <span className="font-medium text-gray-900 dark:text-white">\${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">{shippingLabel}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{cartItems.length > 0 ? shippingMessage : '$0.00'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">{taxLabel}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{cartItems.length > 0 ? taxMessage : '$0.00'}</span>
                </div>
              </div>

              {/* Total */}
              <div className="pt-6 pb-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">{totalLabel}</span>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    \${(subtotal + shipping + tax).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <Button
                className="w-full h-14 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white text-base font-bold shadow-lg hover:shadow-2xl transition-all focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                onClick={handleCheckout}
              >
                {checkoutButton}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartFullPageComponent;
    `,

    cards: `
${commonImports}

interface CartItem {
  id: string;
  name: string;
  description: string;
  color: string;
  size: string;
  price: number;
  quantity: number;
  image: string;
  restaurant_id?: string | null;
}

interface CartFullPageProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const CartFullPageComponent: React.FC<CartFullPageProps> = ({
  ${dataName}: propData,
  className
}) => {
  const cartData = propData || {};

  const [cartItems, setCartItems] = useState<CartItem[]>(${getField('cartItemsCards')});
  const [promoCode, setPromoCode] = useState('');
  const [selectedShipping, setSelectedShipping] = useState('standard');

  const title = ${getField('title')};
  const checkoutButton = ${getField('checkoutButton')};
  const continueShoppingButton = ${getField('continueShoppingButton')};
  const updateCartButton = ${getField('updateCartButton')};
  const promoCodeLabel = ${getField('promoCodeLabel')};
  const applyButton = ${getField('applyButton')};
  const subtotalLabel = ${getField('subtotalLabel')};
  const shippingLabel = ${getField('shippingLabel')};
  const totalLabel = ${getField('totalLabel')};
  const quantityLabel = ${getField('quantityLabel')};
  const shippingOptions = ${getField('shippingOptions')};

  // Event handlers
  const handleProductClick = (item: CartItem) => {
    console.log('Product clicked:', item);
    alert(\`\${item.name}\\n\${item.description}\\nColor: \${item.color}\\nSize: \${item.size}\`);
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

  const handleApplyPromo = () => {
    console.log('Promo code applied:', promoCode);
    if (promoCode.trim()) {
      alert(\`Promo code "\${promoCode}" applied!\`);
    } else {
      alert('Please enter a promo code');
    }
  };

  const navigate = useNavigate();

  const handleUpdateCart = () => {
    console.log('Cart updated:', cartItems);
    alert('Cart updated successfully!');
  };

  const handleCheckout = () => {
    const selectedShippingOption = shippingOptions.find((opt: any) => opt.id === selectedShipping);
    const total = subtotal + (selectedShippingOption?.price || 0);
    console.log('Checkout clicked', { cartItems, selectedShipping, total });
    if (cartItems.length === 0) {
      alert('Your cart is empty!');
      return;
    }
    navigate('/checkout');
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const selectedShippingOption = shippingOptions.find((opt: any) => opt.id === selectedShipping);
  const shippingCost = selectedShippingOption?.price || 0;

  return (
    <div className={cn("min-h-screen bg-white dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8", className)}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">{title}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {cartItems.map((item) => (
              <div key={item.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                <div className="flex flex-col sm:flex-row gap-6">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full sm:w-40 h-40 bg-gray-100 dark:bg-gray-700 rounded-lg flex-shrink-0 object-cover cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => handleProductClick(item)}
                  />

                  <div className="flex-1 space-y-4">
                    <div>
                      <h3
                        className="text-xl font-semibold text-gray-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        onClick={() => handleProductClick(item)}
                      >
                        {item.name}
                      </h3>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                      <div className="mt-2 flex gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <span>Color: {item.color}</span>
                        <span>Size: {item.size}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm text-gray-600 dark:text-gray-400 block mb-2">{quantityLabel}</label>
                        <div className="flex items-center space-x-3">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-8 h-8 p-0 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                            onClick={() => updateQuantity(item.id, -1)}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="w-12 text-center text-gray-900 dark:text-white">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-8 h-8 p-0 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                            onClick={() => updateQuantity(item.id, 1)}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          \${(item.price * item.quantity).toFixed(2)}
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="mt-2 text-sm text-red-500 hover:text-red-700 dark:hover:text-red-400 flex items-center gap-1"
                        >
                          <Trash2 className="w-4 h-4" />
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="flex gap-4">
              <Button
                variant="outline"
                className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                onClick={handleUpdateCart}
              >
                {updateCartButton}
              </Button>
              <Button
                variant="outline"
                className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                {continueShoppingButton}
              </Button>
            </div>
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 sticky top-8 space-y-6">
              {/* Promo Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Tag className="w-4 h-4 inline mr-2" />
                  {promoCodeLabel}
                </label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleApplyPromo()}
                    className="flex-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  <Button
                    variant="outline"
                    className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                    onClick={handleApplyPromo}
                  >
                    {applyButton}
                  </Button>
                </div>
              </div>

              {/* Shipping Estimate */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {shippingLabel}
                </label>
                <Select value={selectedShipping} onValueChange={setSelectedShipping}>
                  <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                    {shippingOptions.map((option: any) => (
                      <SelectItem key={option.id} value={option.id} className="dark:text-white dark:focus:bg-gray-600">
                        {option.name} - {option.price === 0 ? 'Free' : \`$\${option.price}\`} ({option.days})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Totals */}
              <div className="space-y-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">{subtotalLabel}</span>
                  <span className="font-medium text-gray-900 dark:text-white">\${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">{shippingLabel}</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {shippingCost === 0 ? 'Free' : \`$\${shippingCost.toFixed(2)}\`}
                  </span>
                </div>
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">{totalLabel}</span>
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      \${(subtotal + shippingCost).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <Button
                className="w-full h-14 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white text-base font-bold shadow-lg hover:shadow-2xl transition-all focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                onClick={handleCheckout}
              >
                {checkoutButton}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartFullPageComponent;
    `,

    enhanced: `
${commonImports}

interface CartItem {
  id: string;
  name: string;
  description: string;
  brand: string;
  sku: string;
  price: number;
  originalPrice: number;
  quantity: number;
  inStock: boolean;
  estimatedDelivery: string;
  image: string;
  restaurant_id?: string | null;
}

interface CartFullPageProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const CartFullPageComponent: React.FC<CartFullPageProps> = ({
  ${dataName}: propData,
  className
}) => {
  const cartData = propData || {};

  const [cartItems, setCartItems] = useState<CartItem[]>(${getField('cartItemsEnhanced')});
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [selectedShipping, setSelectedShipping] = useState('standard');

  const title = ${getField('title')};
  const checkoutButton = ${getField('checkoutButton')};
  const continueShoppingButton = ${getField('continueShoppingButton')};
  const clearCartButton = ${getField('clearCartButton')};
  const promoCodeLabel = ${getField('promoCodeLabel')};
  const applyButton = ${getField('applyButton')};
  const subtotalLabel = ${getField('subtotalLabel')};
  const shippingLabel = ${getField('shippingLabel')};
  const discountLabel = ${getField('discountLabel')};
  const totalLabel = ${getField('totalLabel')};
  const quantityLabel = ${getField('quantityLabel')};
  const shippingOptions = ${getField('shippingOptions')};

  // Event handlers
  const handleProductClick = (item: CartItem) => {
    console.log('Product clicked:', item);
    alert(\`\${item.name}\\nBrand: \${item.brand}\\nSKU: \${item.sku}\\nPrice: $\${Number(item.price).toFixed(2)}\`);
  };

  const updateQuantity = (id: string, newQuantity: number) => {
    setCartItems(items =>
      items.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
    console.log(\`Quantity updated for item \${id}: \${newQuantity}\`);
  };

  const removeItem = (id: string) => {
    const item = cartItems.find(i => i.id === id);
    console.log('Item removed:', item);
    setCartItems(items => items.filter((item: any) => item.id !== id));
    alert(\`\${item?.name} removed from cart\`);
  };

  const handleClearCart = () => {
    console.log('Clear cart clicked');
    if (confirm('Are you sure you want to clear your cart?')) {
      setCartItems([]);
      alert('Cart cleared!');
    }
  };

  const navigate = useNavigate();

  const handleApplyPromo = () => {
    console.log('Promo code applied:', promoCode);
    if (promoCode.trim()) {
      setPromoApplied(true);
      alert(\`Promo code "\${promoCode}" applied!\\n10% discount activated.\`);
    } else {
      alert('Please enter a promo code');
    }
  };

  const handleCheckout = () => {
    const selectedShippingOption = shippingOptions.find((opt: any) => opt.id === selectedShipping);
    const total = subtotal + (selectedShippingOption?.price || 0) - discount;
    console.log('Checkout clicked', { cartItems, selectedShipping, total });
    if (cartItems.length === 0) {
      alert('Your cart is empty!');
      return;
    }
    navigate('/checkout');
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const savings = cartItems.reduce((sum, item) => sum + (item.originalPrice - item.price) * item.quantity, 0);
  const discount = promoApplied ? subtotal * 0.1 : 0;
  const selectedShippingOption = shippingOptions.find((opt: any) => opt.id === selectedShipping);
  const shippingCost = selectedShippingOption?.price || 0;

  return (
    <div className={cn("min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4 sm:px-6 lg:px-8", className)}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
            </p>
          </div>
          {cartItems.length > 0 && (
            <Button
              variant="outline"
              className="text-red-500 border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
              onClick={handleClearCart}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {clearCartButton}
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex gap-6">
                  <div className="relative">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-32 h-32 bg-gray-100 dark:bg-gray-700 rounded-lg flex-shrink-0 object-cover cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => handleProductClick(item)}
                    />
                    {item.originalPrice > item.price && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                        SALE
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div>
                        <h3
                          className="text-lg font-semibold text-gray-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          onClick={() => handleProductClick(item)}
                        >
                          {item.name}
                        </h3>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                        <div className="mt-2 flex gap-4 text-xs text-gray-500 dark:text-gray-400">
                          <span>Brand: {item.brand}</span>
                          <span>SKU: {item.sku}</span>
                        </div>
                        <div className="mt-2">
                          {item.inStock ? (
                            <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                              In Stock - Est. delivery: {item.estimatedDelivery}
                            </span>
                          ) : (
                            <span className="text-xs text-red-600 dark:text-red-400 font-medium">Out of Stock</span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div>
                        <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">{quantityLabel}</label>
                        <Select
                          value={item.quantity.toString()}
                          onValueChange={(value) => updateQuantity(item.id, parseInt(value))}
                        >
                          <SelectTrigger className="w-20 h-9 bg-white dark:border-gray-600 text-gray-900">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white dark:border-gray-600">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                              <SelectItem key={num} value={num.toString()} className="text-gray-900 focus:bg-gray-100">{num}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          \${(item.price * item.quantity).toFixed(2)}
                        </div>
                        {item.originalPrice > item.price && (
                          <div className="text-sm text-gray-500 dark:text-gray-400 line-through">
                            \${(item.originalPrice * item.quantity).toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <Button
              variant="outline"
              className="w-full sm:w-auto dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              {continueShoppingButton}
            </Button>
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm sticky top-8 space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Order Summary</h2>

              {/* Promo Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {promoCodeLabel}
                </label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleApplyPromo()}
                    className="flex-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    disabled={promoApplied}
                  />
                  <Button
                    variant={promoApplied ? "default" : "outline"}
                    className={promoApplied ? "bg-green-600 hover:bg-green-700" : "dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"}
                    onClick={handleApplyPromo}
                    disabled={promoApplied}
                  >
                    {promoApplied ? '✓' : applyButton}
                  </Button>
                </div>
              </div>

              {/* Shipping */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {shippingLabel}
                </label>
                <Select value={selectedShipping} onValueChange={setSelectedShipping}>
                  <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                    {shippingOptions.map((option: any) => (
                      <SelectItem key={option.id} value={option.id} className="dark:text-white dark:focus:bg-gray-600">
                        {option.name} - {option.price === 0 ? 'Free' : \`$\${option.price}\`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Totals */}
              <div className="space-y-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">{subtotalLabel}</span>
                  <span className="font-medium text-gray-900 dark:text-white">\${subtotal.toFixed(2)}</span>
                </div>
                {savings > 0 && (
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span>You saved</span>
                    <span className="font-medium">-\${savings.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">{shippingLabel}</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {shippingCost === 0 ? 'Free' : \`$\${shippingCost.toFixed(2)}\`}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span>{discountLabel} (10%)</span>
                    <span className="font-medium">-\${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">{totalLabel}</span>
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      \${(subtotal + shippingCost - discount).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <Button
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-base font-semibold"
                onClick={handleCheckout}
                disabled={cartItems.length === 0}
              >
                {checkoutButton}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartFullPageComponent;
    `
  };

  return variants[variant] || variants.table;
};
