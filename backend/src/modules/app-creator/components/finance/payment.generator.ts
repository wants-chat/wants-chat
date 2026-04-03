/**
 * Payment Component Generators
 */

export interface PaymentOptions {
  componentName?: string;
  endpoint?: string;
}

export function generatePaymentForm(options: PaymentOptions = {}): string {
  const { componentName = 'PaymentForm', endpoint = '/payments' } = options;

  return `import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Loader2, CreditCard, Lock } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface ${componentName}Props {
  amount: number;
  description?: string;
  onSuccess?: () => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({ amount, description, onSuccess }) => {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [name, setName] = useState('');

  const paymentMutation = useMutation({
    mutationFn: (data: any) => api.post('${endpoint}', data),
    onSuccess: () => {
      toast.success('Payment successful!');
      onSuccess?.();
    },
    onError: () => toast.error('Payment failed'),
  });

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : value;
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    paymentMutation.mutate({
      amount,
      card_number: cardNumber.replace(/\\s/g, ''),
      expiry,
      cvc,
      name,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Payment Details</h2>
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <Lock className="w-4 h-4" />
          Secure
        </div>
      </div>

      {description && (
        <p className="text-gray-500 mb-4">{description}</p>
      )}

      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 mb-6">
        <p className="text-sm text-gray-500">Amount to pay</p>
        <p className="text-3xl font-bold text-purple-600">\${amount.toFixed(2)}</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Card Number</label>
          <div className="relative">
            <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              required
              maxLength={19}
              placeholder="1234 5678 9012 3456"
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expiry Date</label>
            <input
              type="text"
              required
              maxLength={5}
              placeholder="MM/YY"
              value={expiry}
              onChange={(e) => setExpiry(formatExpiry(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CVC</label>
            <input
              type="text"
              required
              maxLength={4}
              placeholder="123"
              value={cvc}
              onChange={(e) => setCvc(e.target.value.replace(/\\D/g, ''))}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cardholder Name</label>
          <input
            type="text"
            required
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={paymentMutation.isPending}
        className="w-full mt-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {paymentMutation.isPending ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            <Lock className="w-4 h-4" />
            Pay \${amount.toFixed(2)}
          </>
        )}
      </button>

      <p className="text-xs text-gray-500 text-center mt-4">
        Your payment is secured with SSL encryption
      </p>
    </form>
  );
};

export default ${componentName};
`;
}

export function generatePaymentMethods(options: PaymentOptions = {}): string {
  const { componentName = 'PaymentMethods', endpoint = '/payment-methods' } = options;

  return `import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, CreditCard, Plus, Trash2, Star, CheckCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

const ${componentName}: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: methods, isLoading } = useQuery({
    queryKey: ['payment-methods'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete('${endpoint}/' + id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
      toast.success('Payment method removed');
    },
  });

  const setDefaultMutation = useMutation({
    mutationFn: (id: string) => api.put('${endpoint}/' + id + '/default', {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
      toast.success('Default payment method updated');
    },
  });

  const getCardBrand = (brand: string) => {
    const brands: Record<string, string> = {
      visa: '💳 Visa',
      mastercard: '💳 Mastercard',
      amex: '💳 Amex',
      discover: '💳 Discover',
    };
    return brands[brand?.toLowerCase()] || '💳 Card';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Payment Methods</h2>
        <button className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium text-sm">
          <Plus className="w-4 h-4" />
          Add New
        </button>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {methods && methods.length > 0 ? (
          methods.map((method: any) => (
            <div key={method.id} className="p-4 flex items-center gap-4">
              <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <CreditCard className="w-6 h-6 text-gray-500" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 dark:text-white">{getCardBrand(method.brand)}</span>
                  {method.is_default && (
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs">
                      <CheckCircle className="w-3 h-3" />
                      Default
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">•••• •••• •••• {method.last4}</p>
                <p className="text-xs text-gray-400">Expires {method.exp_month}/{method.exp_year}</p>
              </div>
              <div className="flex gap-2">
                {!method.is_default && (
                  <button
                    onClick={() => setDefaultMutation.mutate(method.id)}
                    className="p-2 text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg"
                    title="Set as default"
                  >
                    <Star className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => deleteMutation.mutate(method.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-gray-500">
            <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            No payment methods saved
          </div>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generatePaymentHistory(options: PaymentOptions = {}): string {
  const { componentName = 'PaymentHistory', endpoint = '/payments' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, CheckCircle, XCircle, Clock, Download, Receipt } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const { data: payments, isLoading } = useQuery({
    queryKey: ['payments'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'succeeded':
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Payment History</h2>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {payments && payments.length > 0 ? (
          payments.map((payment: any) => (
            <div key={payment.id} className="p-4 flex items-center gap-4">
              {getStatusIcon(payment.status)}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-white truncate">{payment.description || 'Payment'}</p>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <span>{new Date(payment.created_at).toLocaleDateString()}</span>
                  {payment.method && <span>•••• {payment.method.last4}</span>}
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900 dark:text-white">\${payment.amount?.toLocaleString()}</p>
                <p className={\`text-xs \${
                  payment.status === 'succeeded' ? 'text-green-600' :
                  payment.status === 'failed' ? 'text-red-600' :
                  'text-yellow-600'
                }\`}>
                  {payment.status}
                </p>
              </div>
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <Receipt className="w-4 h-4" />
              </button>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-gray-500">
            <Receipt className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            No payments yet
          </div>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}
