/**
 * Cart Component Generator
 *
 * Generates a shopping cart component with quantity management,
 * item removal, and checkout navigation.
 */

export interface CartOptions {
  componentName?: string;
  showImages?: boolean;
  showShipping?: boolean;
  freeShippingThreshold?: number;
  checkoutPath?: string;
  productsPath?: string;
}

export function generateCart(options: CartOptions = {}): string {
  const {
    componentName = 'Cart',
    showImages = true,
    showShipping = true,
    freeShippingThreshold = 100,
    checkoutPath = '/checkout',
    productsPath = '/products',
  } = options;

  return `import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, ImageOff, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

function ${componentName}() {
  const navigate = useNavigate();
  const [items, setItems] = useState<CartItem[]>([]);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const loadCart = () => {
      try {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        setItems(cart);
      } catch {
        setItems([]);
      }
    };

    loadCart();

    // Listen for storage changes (if cart updated from another tab)
    window.addEventListener('storage', loadCart);
    return () => window.removeEventListener('storage', loadCart);
  }, []);

  const updateCart = (newItems: CartItem[]) => {
    setItems(newItems);
    localStorage.setItem('cart', JSON.stringify(newItems));
  };

  const updateQuantity = (productId: string, delta: number) => {
    const newItems = items.map(item => {
      if (item.productId === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    });
    updateCart(newItems);
  };

  const removeItem = (productId: string) => {
    const newItems = items.filter(item => item.productId !== productId);
    updateCart(newItems);
    toast.success('Item removed from cart');
  };

  const handleImageError = (productId: string) => {
    setImageErrors(prev => ({ ...prev, [productId]: true }));
  };

  const subtotal = items.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
  const shipping = ${showShipping} && subtotal < ${freeShippingThreshold} ? 9.99 : 0;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <ShoppingCart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Add some products to get started</p>
        <Link
          to="${productsPath}"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Shopping Cart</h1>
        <span className="text-gray-500">{items.length} item{items.length !== 1 ? 's' : ''}</span>
      </div>
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.productId} className="flex items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            ${showImages ? `<div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded overflow-hidden flex-shrink-0">
              {item.image && !imageErrors[item.productId] ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                  onError={() => handleImageError(item.productId)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageOff className="w-6 h-6 text-gray-400" />
                </div>
              )}
            </div>` : ''}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-white truncate">{item.name}</h3>
              <p className="text-blue-600 font-bold">\${(item.price || 0).toFixed(2)}</p>
            </div>
            <div className="flex items-center gap-1 border rounded-lg">
              <button
                onClick={() => updateQuantity(item.productId, -1)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-l-lg transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-10 text-center font-medium">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.productId, 1)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-r-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="text-right font-semibold text-gray-900 dark:text-white w-24">
              \${((item.price || 0) * item.quantity).toFixed(2)}
            </div>
            <button
              onClick={() => removeItem(item.productId)}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
      <div className="mt-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-gray-600 dark:text-gray-400">
            <span>Subtotal</span>
            <span>\${subtotal.toFixed(2)}</span>
          </div>
          ${showShipping ? `<div className="flex justify-between text-gray-600 dark:text-gray-400">
            <span>Shipping</span>
            <span>{shipping === 0 ? 'Free' : '\\$' + shipping.toFixed(2)}</span>
          </div>` : ''}
          <div className="border-t pt-2 flex justify-between text-xl font-bold text-gray-900 dark:text-white">
            <span>Total</span>
            <span>\${total.toFixed(2)}</span>
          </div>
        </div>
        <button
          onClick={() => navigate('${checkoutPath}')}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold transition-colors"
        >
          Proceed to Checkout
        </button>
        <Link
          to="${productsPath}"
          className="block text-center mt-4 text-blue-600 hover:text-blue-700 text-sm"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

export default ${componentName};
`;
}

export function generateMiniCart(options: { componentName?: string } = {}): string {
  const componentName = options.componentName || 'MiniCart';

  return `import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, X, Trash2 } from 'lucide-react';

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

function ${componentName}() {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const loadCart = () => {
      try {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        setItems(cart);
      } catch {
        setItems([]);
      }
    };

    loadCart();
    window.addEventListener('storage', loadCart);
    return () => window.removeEventListener('storage', loadCart);
  }, []);

  const total = items.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const removeItem = (productId: string) => {
    const newItems = items.filter(item => item.productId !== productId);
    setItems(newItems);
    localStorage.setItem('cart', JSON.stringify(newItems));
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
      >
        <ShoppingCart className="w-6 h-6" />
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
            {itemCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="font-semibold">Cart ({itemCount})</h3>
            <button onClick={() => setIsOpen(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {items.length === 0 ? (
              <p className="p-4 text-center text-gray-500">Cart is empty</p>
            ) : (
              items.map((item) => (
                <div key={item.productId} className="p-3 flex items-center gap-3 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-sm text-gray-500">{item.quantity} x \${item.price}</p>
                  </div>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="p-1 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
          {items.length > 0 && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between font-semibold mb-3">
                <span>Total</span>
                <span>\${total.toFixed(2)}</span>
              </div>
              <Link
                to="/cart"
                onClick={() => setIsOpen(false)}
                className="block w-full text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
              >
                View Cart
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ${componentName};
`;
}
