/**
 * Checkout Component Generator
 *
 * Generates checkout form with shipping address and payment method selection.
 */

export interface CheckoutOptions {
  componentName?: string;
  successRedirectPath?: string;
  showPaymentOptions?: boolean;
  paymentMethods?: Array<{ value: string; label: string }>;
}

export function generateCheckout(options: CheckoutOptions = {}): string {
  const {
    componentName = 'Checkout',
    successRedirectPath = '/orders',
    showPaymentOptions = true,
    paymentMethods = [
      { value: 'card', label: 'Credit Card' },
      { value: 'paypal', label: 'PayPal' },
    ],
  } = options;

  const paymentOptionsJsx = paymentMethods
    .map(
      (method) => `            <label className="flex items-center gap-2">
              <input type="radio" name="payment" value="${method.value}" ${method.value === paymentMethods[0]?.value ? 'defaultChecked' : ''} />
              <span>${method.label}</span>
            </label>`,
    )
    .join('\n');

  return `import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const ${componentName}: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate order submission
    setTimeout(() => {
      localStorage.setItem('cart', '[]');
      toast.success('Order placed successfully!');
      navigate('${successRedirectPath}');
    }, 1500);
  };

  return (
    <div className="lg:col-span-3">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Checkout</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold mb-4">Shipping Address</h3>
          <div className="grid grid-cols-2 gap-4">
            <input type="text" placeholder="First Name" required className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" />
            <input type="text" placeholder="Last Name" required className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" />
            <input type="text" placeholder="Address" required className="col-span-2 px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" />
            <input type="text" placeholder="City" required className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" />
            <input type="text" placeholder="Postal Code" required className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" />
          </div>
        </div>
        ${showPaymentOptions ? `<div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold mb-4">Payment Method</h3>
          <div className="space-y-2">
${paymentOptionsJsx}
          </div>
        </div>` : ''}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50"
        >
          {isSubmitting ? 'Processing...' : 'Place Order'}
        </button>
      </form>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateOrderSummary(options: { componentName?: string } = {}): string {
  const componentName = options.componentName || 'OrderSummary';

  return `import React, { useState, useEffect } from 'react';

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

const ${componentName}: React.FC = () => {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    setItems(cart);
  }, []);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 100 ? 0 : 9.99;
  const total = subtotal + shipping;

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 h-fit">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Order Summary</h3>
      <div className="space-y-3 mb-4">
        {items.map((item) => (
          <div key={item.productId} className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">{item.name} x {item.quantity}</span>
            <span className="text-gray-900 dark:text-white">\${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>
      <div className="border-t border-gray-200 dark:border-gray-700 pt-3 space-y-2">
        <div className="flex justify-between text-gray-600 dark:text-gray-400">
          <span>Subtotal</span>
          <span>\${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-gray-600 dark:text-gray-400">
          <span>Shipping</span>
          <span>{shipping === 0 ? 'Free' : '\\$' + shipping.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
          <span>Total</span>
          <span>\${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}
