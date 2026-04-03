/**
 * Food Cart Component Generator
 */

export interface FoodCartOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateCartPreview(options: FoodCartOptions = {}): string {
  const componentName = options.componentName || 'CartPreview';

  return `import React from 'react';
import { ShoppingBag, Plus, Minus, Trash2, X } from 'lucide-react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
  notes?: string;
}

interface ${componentName}Props {
  items: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
  onCheckout: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  items,
  onUpdateQuantity,
  onRemove,
  onCheckout,
  isOpen,
  onClose,
}) => {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-gray-800 h-full shadow-xl flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Your Order ({items.length})
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {items.length > 0 ? (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
                  {item.image_url && (
                    <img src={item.image_url} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
                  )}
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">{item.name}</h4>
                    <p className="text-sm text-green-600 font-medium">\${(item.price * item.quantity).toFixed(2)}</p>
                    {item.notes && <p className="text-xs text-gray-500 mt-1">{item.notes}</p>}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => onUpdateQuantity(item.id, Math.max(0, item.quantity - 1))}
                        className="p-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        className="p-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onRemove(item.id)}
                        className="ml-auto p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              Your cart is empty
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="text-gray-900 dark:text-white">\${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tax</span>
                <span className="text-gray-900 dark:text-white">\${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg pt-2 border-t border-gray-200 dark:border-gray-700">
                <span className="text-gray-900 dark:text-white">Total</span>
                <span className="text-green-600">\${total.toFixed(2)}</span>
              </div>
            </div>
            <button
              onClick={onCheckout}
              className="w-full py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateCheckoutForm(options: FoodCartOptions = {}): string {
  const { componentName = 'FoodCheckoutForm', endpoint = '/orders' } = options;

  return `import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Loader2, MapPin, Phone, User, CreditCard, Clock } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface ${componentName}Props {
  items: any[];
  total: number;
}

const ${componentName}: React.FC<${componentName}Props> = ({ items, total }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    delivery_instructions: '',
    payment_method: 'card',
    order_type: 'delivery',
  });

  const createOrder = useMutation({
    mutationFn: (data: any) => api.post('${endpoint}', { ...data, items, total }),
    onSuccess: (response: any) => {
      toast.success('Order placed successfully!');
      navigate('/orders/' + (response?.data?.id || response?.id));
    },
    onError: () => toast.error('Failed to place order'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createOrder.mutate(formData);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Checkout</h2>

      <div className="flex gap-4 mb-6">
        {['delivery', 'pickup'].map((type) => (
          <button
            key={type}
            onClick={() => setFormData({ ...formData, order_type: type })}
            className={\`flex-1 py-3 rounded-lg font-medium transition-colors \${
              formData.order_type === type
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }\`}
          >
            {type === 'delivery' ? '🚗 Delivery' : '🏪 Pickup'}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <User className="w-4 h-4 inline mr-1" /> Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Phone className="w-4 h-4 inline mr-1" /> Phone *
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
            required
          />
        </div>
        {formData.order_type === 'delivery' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" /> Delivery Address *
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent resize-none"
                rows={2}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Delivery Instructions
              </label>
              <input
                type="text"
                value={formData.delivery_instructions}
                onChange={(e) => setFormData({ ...formData, delivery_instructions: e.target.value })}
                placeholder="e.g., Ring doorbell, leave at door"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
              />
            </div>
          </>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <CreditCard className="w-4 h-4 inline mr-1" /> Payment Method
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'card', label: '💳 Card' },
              { id: 'cash', label: '💵 Cash' },
            ].map((method) => (
              <button
                key={method.id}
                type="button"
                onClick={() => setFormData({ ...formData, payment_method: method.id })}
                className={\`p-3 rounded-lg border transition-colors \${
                  formData.payment_method === method.id
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                    : 'border-gray-300 dark:border-gray-600'
                }\`}
              >
                {method.label}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between text-lg font-semibold mb-4">
            <span>Total</span>
            <span className="text-green-600">\${total.toFixed(2)}</span>
          </div>
          <button
            type="submit"
            disabled={createOrder.isPending}
            className="w-full py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {createOrder.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              'Place Order'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateOrderConfirmation(options: FoodCartOptions = {}): string {
  const { componentName = 'OrderConfirmation', endpoint = '/orders' } = options;

  return `import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, CheckCircle, Clock, MapPin, Phone } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + id);
      return response?.data || response;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto text-center">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Order Confirmed!</h1>
        <p className="text-gray-500 mb-2">Order #{order?.order_number || id}</p>

        {order?.estimated_time && (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-full mb-6">
            <Clock className="w-4 h-4" />
            Estimated: {order.estimated_time}
          </div>
        )}

        {order && (
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">Order Details</h3>
            <div className="space-y-2 text-sm">
              {order.items?.map((item: any, i: number) => (
                <div key={i} className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    {item.quantity}x {item.name}
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    \${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex justify-between font-semibold">
                <span>Total</span>
                <span className="text-green-600">\${order.total?.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <Link
            to="/orders"
            className="flex-1 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            View Orders
          </Link>
          <Link
            to={\`/orders/\${id}/track\`}
            className="flex-1 py-2 px-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Track Order
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}
