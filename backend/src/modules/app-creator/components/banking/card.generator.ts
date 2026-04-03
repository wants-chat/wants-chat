/**
 * Banking Card Component Generators
 */

export interface CardOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateCardDetail(options: CardOptions = {}): string {
  const { componentName = 'CardDetail', endpoint = '/banking/cards' } = options;

  return `import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { Loader2, ArrowLeft, CreditCard, Lock, Unlock, Snowflake, RefreshCw, Eye, EyeOff, Copy, Check, Settings, AlertTriangle, Shield } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface CardDetails {
  id: string;
  card_number: string;
  card_holder: string;
  type: 'debit' | 'credit' | 'prepaid';
  brand: string;
  expiry_month: string;
  expiry_year: string;
  cvv?: string;
  status: 'active' | 'frozen' | 'blocked' | 'expired';
  credit_limit?: number;
  available_credit?: number;
  current_balance?: number;
  billing_date?: number;
  minimum_payment?: number;
  rewards_points?: number;
  is_virtual?: boolean;
}

interface Transaction {
  id: string;
  merchant: string;
  amount: number;
  date: string;
  status: string;
  category: string;
}

const ${componentName}: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [showCardNumber, setShowCardNumber] = useState(false);
  const [showCvv, setShowCvv] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const { data: card, isLoading } = useQuery({
    queryKey: ['card', id],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + id);
      return response?.data || response;
    },
  });

  const { data: transactions } = useQuery({
    queryKey: ['card-transactions', id],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + id + '/transactions?limit=5');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const freezeMutation = useMutation({
    mutationFn: () => api.post('${endpoint}/' + id + '/freeze', {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['card', id] });
      toast.success('Card frozen successfully');
    },
    onError: () => toast.error('Failed to freeze card'),
  });

  const unfreezeMutation = useMutation({
    mutationFn: () => api.post('${endpoint}/' + id + '/unfreeze', {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['card', id] });
      toast.success('Card unfrozen successfully');
    },
    onError: () => toast.error('Failed to unfreeze card'),
  });

  const copyToClipboard = async (text: string, type: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    toast.success(\`\${type} copied\`);
    setTimeout(() => setCopied(null), 2000);
  };

  const formatCardNumber = (number: string, show: boolean) => {
    if (!show) return '•••• •••• •••• ' + number.slice(-4);
    return number.replace(/(.{4})/g, '$1 ').trim();
  };

  const getBrandLogo = (brand: string) => {
    const logos: Record<string, string> = {
      visa: '/brands/visa.svg',
      mastercard: '/brands/mastercard.svg',
      amex: '/brands/amex.svg',
    };
    return logos[brand?.toLowerCase()];
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'active':
        return { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: Shield };
      case 'frozen':
        return { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: Snowflake };
      case 'blocked':
        return { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: Lock };
      case 'expired':
        return { color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400', icon: AlertTriangle };
      default:
        return { color: 'bg-gray-100 text-gray-700', icon: CreditCard };
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!card) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Card not found</p>
        <Link to="/cards" className="text-blue-600 hover:underline mt-2 inline-block">
          Back to cards
        </Link>
      </div>
    );
  }

  const statusConfig = getStatusConfig(card.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/cards"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Card Details</h1>
            <p className="text-sm text-gray-500 capitalize">{card.type} Card</p>
          </div>
        </div>
        <div className={\`flex items-center gap-2 px-3 py-1.5 rounded-full \${statusConfig.color}\`}>
          <StatusIcon className="w-4 h-4" />
          <span className="text-sm font-medium capitalize">{card.status}</span>
        </div>
      </div>

      {/* Card Visual */}
      <div className={\`relative rounded-2xl p-6 text-white overflow-hidden \${
        card.type === 'credit' ? 'bg-gradient-to-br from-purple-600 to-indigo-700' :
        card.type === 'prepaid' ? 'bg-gradient-to-br from-amber-500 to-orange-600' :
        'bg-gradient-to-br from-gray-800 to-gray-900'
      }\`}>
        {card.status === 'frozen' && (
          <div className="absolute inset-0 bg-blue-500/30 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center">
              <Snowflake className="w-12 h-12 mx-auto mb-2" />
              <p className="font-medium">Card Frozen</p>
            </div>
          </div>
        )}

        <div className="flex items-start justify-between mb-8">
          <div>
            {card.is_virtual && (
              <span className="px-2 py-1 bg-white/20 rounded-full text-xs font-medium">Virtual</span>
            )}
          </div>
          <div className="text-right">
            <p className="text-sm opacity-80 uppercase">{card.brand}</p>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-2">
            <p className="text-xl font-mono tracking-wider">{formatCardNumber(card.card_number, showCardNumber)}</p>
            <button
              onClick={() => setShowCardNumber(!showCardNumber)}
              className="p-1 hover:bg-white/20 rounded"
            >
              {showCardNumber ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            <button
              onClick={() => copyToClipboard(card.card_number, 'Card number')}
              className="p-1 hover:bg-white/20 rounded"
            >
              {copied === 'Card number' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs opacity-80 mb-1">Card Holder</p>
            <p className="font-medium">{card.card_holder}</p>
          </div>
          <div className="text-center">
            <p className="text-xs opacity-80 mb-1">Expires</p>
            <p className="font-medium">{card.expiry_month}/{card.expiry_year}</p>
          </div>
          <div>
            <p className="text-xs opacity-80 mb-1">CVV</p>
            <div className="flex items-center gap-1">
              <p className="font-medium">{showCvv ? card.cvv : '•••'}</p>
              <button
                onClick={() => setShowCvv(!showCvv)}
                className="p-1 hover:bg-white/20 rounded"
              >
                {showCvv ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {card.status === 'frozen' ? (
          <button
            onClick={() => unfreezeMutation.mutate()}
            disabled={unfreezeMutation.isPending}
            className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-500 transition-colors"
          >
            {unfreezeMutation.isPending ? (
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            ) : (
              <Unlock className="w-6 h-6 text-blue-600" />
            )}
            <span className="text-sm font-medium text-gray-900 dark:text-white">Unfreeze</span>
          </button>
        ) : (
          <button
            onClick={() => freezeMutation.mutate()}
            disabled={freezeMutation.isPending}
            className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-500 transition-colors"
          >
            {freezeMutation.isPending ? (
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            ) : (
              <Snowflake className="w-6 h-6 text-blue-600" />
            )}
            <span className="text-sm font-medium text-gray-900 dark:text-white">Freeze</span>
          </button>
        )}
        <Link
          to={\`/cards/\${id}/limits\`}
          className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-500 transition-colors"
        >
          <Settings className="w-6 h-6 text-purple-600" />
          <span className="text-sm font-medium text-gray-900 dark:text-white">Limits</span>
        </Link>
        <Link
          to={\`/cards/\${id}/pin\`}
          className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-500 transition-colors"
        >
          <Lock className="w-6 h-6 text-green-600" />
          <span className="text-sm font-medium text-gray-900 dark:text-white">Change PIN</span>
        </Link>
        <Link
          to={\`/cards/\${id}/replace\`}
          className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-500 transition-colors"
        >
          <RefreshCw className="w-6 h-6 text-orange-600" />
          <span className="text-sm font-medium text-gray-900 dark:text-white">Replace</span>
        </Link>
      </div>

      {/* Credit Card Specific Info */}
      {card.type === 'credit' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Credit Summary</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Credit Limit</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                \${card.credit_limit?.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Available Credit</p>
              <p className="text-2xl font-bold text-green-600">
                \${card.available_credit?.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Current Balance</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                \${card.current_balance?.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500">Credit Utilization</span>
              <span className="font-medium">
                {((card.current_balance || 0) / (card.credit_limit || 1) * 100).toFixed(0)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={\`h-2 rounded-full \${
                  ((card.current_balance || 0) / (card.credit_limit || 1)) > 0.7 ? 'bg-red-500' : 'bg-green-500'
                }\`}
                style={{ width: \`\${Math.min(((card.current_balance || 0) / (card.credit_limit || 1)) * 100, 100)}%\` }}
              />
            </div>
          </div>
          {card.billing_date && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between">
              <div>
                <p className="text-sm text-gray-500">Next billing date</p>
                <p className="font-medium text-gray-900 dark:text-white">Day {card.billing_date} of each month</p>
              </div>
              {card.minimum_payment && (
                <div className="text-right">
                  <p className="text-sm text-gray-500">Minimum payment</p>
                  <p className="font-medium text-gray-900 dark:text-white">\${card.minimum_payment}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Recent Transactions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Transactions</h2>
          <Link to={\`/cards/\${id}/transactions\`} className="text-sm text-blue-600 hover:underline">
            View all
          </Link>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {transactions && transactions.length > 0 ? (
            transactions.map((tx: Transaction) => (
              <div key={tx.id} className="p-4 flex items-center gap-4">
                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                  <CreditCard className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white truncate">{tx.merchant}</p>
                  <p className="text-sm text-gray-500">{tx.category}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-white">-\${tx.amount.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">{new Date(tx.date).toLocaleDateString()}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">No transactions yet</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateCardList(options: CardOptions = {}): string {
  const { componentName = 'CardList', endpoint = '/banking/cards' } = options;

  return `import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Loader2, Plus, CreditCard, Snowflake, Lock, AlertTriangle, Shield, MoreVertical, Eye, EyeOff } from 'lucide-react';
import { api } from '@/lib/api';

interface Card {
  id: string;
  card_number: string;
  card_holder: string;
  type: 'debit' | 'credit' | 'prepaid';
  brand: string;
  expiry_month: string;
  expiry_year: string;
  status: 'active' | 'frozen' | 'blocked' | 'expired';
  credit_limit?: number;
  current_balance?: number;
  is_virtual?: boolean;
}

const ${componentName}: React.FC = () => {
  const [showNumbers, setShowNumbers] = useState(false);

  const { data: cards, isLoading } = useQuery({
    queryKey: ['banking-cards'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'active':
        return { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: Shield, label: 'Active' };
      case 'frozen':
        return { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: Snowflake, label: 'Frozen' };
      case 'blocked':
        return { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: Lock, label: 'Blocked' };
      case 'expired':
        return { color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400', icon: AlertTriangle, label: 'Expired' };
      default:
        return { color: 'bg-gray-100 text-gray-700', icon: CreditCard, label: status };
    }
  };

  const getCardGradient = (type: string, brand: string) => {
    if (type === 'credit') return 'from-purple-600 to-indigo-700';
    if (type === 'prepaid') return 'from-amber-500 to-orange-600';
    if (brand?.toLowerCase() === 'visa') return 'from-blue-600 to-blue-800';
    if (brand?.toLowerCase() === 'mastercard') return 'from-red-600 to-orange-600';
    return 'from-gray-700 to-gray-900';
  };

  const formatCardNumber = (number: string) => {
    if (!showNumbers) return '•••• •••• •••• ' + number.slice(-4);
    return number.replace(/(.{4})/g, '$1 ').trim();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Cards</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your debit and credit cards</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNumbers(!showNumbers)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title={showNumbers ? 'Hide card numbers' : 'Show card numbers'}
          >
            {showNumbers ? <Eye className="w-5 h-5 text-gray-600 dark:text-gray-400" /> : <EyeOff className="w-5 h-5 text-gray-600 dark:text-gray-400" />}
          </button>
          <Link
            to="/cards/new"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Card</span>
          </Link>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards && cards.length > 0 ? (
          cards.map((card: Card) => {
            const statusConfig = getStatusConfig(card.status);
            const StatusIcon = statusConfig.icon;

            return (
              <Link
                key={card.id}
                to={\`/cards/\${card.id}\`}
                className="group block"
              >
                <div className={\`relative rounded-2xl p-5 text-white bg-gradient-to-br \${getCardGradient(card.type, card.brand)} hover:shadow-xl transition-all duration-200 hover:scale-[1.02]\`}>
                  {/* Frozen overlay */}
                  {card.status === 'frozen' && (
                    <div className="absolute inset-0 rounded-2xl bg-blue-500/30 backdrop-blur-[2px] flex items-center justify-center">
                      <Snowflake className="w-8 h-8 opacity-80" />
                    </div>
                  )}

                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-2">
                      {card.is_virtual && (
                        <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs font-medium">Virtual</span>
                      )}
                      <span className={\`px-2 py-0.5 rounded-full text-xs font-medium \${statusConfig.color}\`}>
                        {statusConfig.label}
                      </span>
                    </div>
                    <p className="text-sm font-medium opacity-80 uppercase">{card.brand}</p>
                  </div>

                  {/* Card Number */}
                  <p className="text-lg font-mono tracking-wider mb-4 opacity-90">
                    {formatCardNumber(card.card_number)}
                  </p>

                  {/* Footer */}
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-xs opacity-60 mb-1">Card Holder</p>
                      <p className="text-sm font-medium">{card.card_holder}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs opacity-60 mb-1">Expires</p>
                      <p className="text-sm font-medium">{card.expiry_month}/{card.expiry_year}</p>
                    </div>
                  </div>

                  {/* Credit card balance */}
                  {card.type === 'credit' && card.current_balance !== undefined && (
                    <div className="mt-4 pt-4 border-t border-white/20">
                      <div className="flex justify-between text-sm">
                        <span className="opacity-80">Balance</span>
                        <span className="font-medium">\${card.current_balance.toLocaleString()}</span>
                      </div>
                      {card.credit_limit && (
                        <div className="mt-2">
                          <div className="w-full bg-white/20 rounded-full h-1.5">
                            <div
                              className="h-1.5 rounded-full bg-white"
                              style={{ width: \`\${Math.min((card.current_balance / card.credit_limit) * 100, 100)}%\` }}
                            />
                          </div>
                          <p className="text-xs opacity-60 mt-1">\${card.credit_limit.toLocaleString()} limit</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Card type label below */}
                <div className="mt-3 flex items-center justify-between px-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">{card.type} Card</p>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      // Handle menu
                    }}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                  >
                    <MoreVertical className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </Link>
            );
          })
        ) : (
          <div className="col-span-full text-center py-12 text-gray-500">
            <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No cards yet</p>
            <p className="text-sm mb-4">Add a debit or credit card to get started</p>
            <Link
              to="/cards/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Card
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}
