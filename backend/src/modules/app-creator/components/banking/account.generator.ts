/**
 * Banking Account Component Generators
 */

export interface AccountOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateAccountBalanceCards(options: AccountOptions = {}): string {
  const { componentName = 'AccountBalanceCards', endpoint = '/banking/accounts' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Loader2, Wallet, CreditCard, PiggyBank, TrendingUp, TrendingDown, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';

interface Account {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit' | 'investment';
  balance: number;
  currency: string;
  account_number: string;
  is_primary?: boolean;
  change_percent?: number;
}

const ${componentName}: React.FC = () => {
  const [showBalances, setShowBalances] = React.useState(true);

  const { data: accounts, isLoading } = useQuery({
    queryKey: ['banking-accounts'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const totalBalance = accounts?.reduce((sum: number, acc: Account) => {
    return sum + (acc.type === 'credit' ? -acc.balance : acc.balance);
  }, 0) || 0;

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'savings': return PiggyBank;
      case 'credit': return CreditCard;
      case 'investment': return TrendingUp;
      default: return Wallet;
    }
  };

  const getAccountGradient = (type: string) => {
    switch (type) {
      case 'savings': return 'from-emerald-500 to-teal-600';
      case 'credit': return 'from-rose-500 to-pink-600';
      case 'investment': return 'from-violet-500 to-purple-600';
      default: return 'from-blue-500 to-indigo-600';
    }
  };

  const formatBalance = (amount: number, currency: string = 'USD') => {
    if (!showBalances) return '****';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Total Balance Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-300">Total Net Worth</p>
          <button
            onClick={() => setShowBalances(!showBalances)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            {showBalances ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
          </button>
        </div>
        <p className="text-4xl font-bold">{formatBalance(totalBalance)}</p>
        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-2 text-sm text-emerald-400">
            <TrendingUp className="w-4 h-4" />
            <span>+2.5% this month</span>
          </div>
        </div>
      </div>

      {/* Account Cards Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts && accounts.length > 0 ? (
          accounts.map((account: Account) => {
            const Icon = getAccountIcon(account.type);
            return (
              <Link
                key={account.id}
                to={\`/accounts/\${account.id}\`}
                className={\`bg-gradient-to-br \${getAccountGradient(account.type)} rounded-xl p-5 text-white hover:shadow-xl hover:scale-[1.02] transition-all duration-200\`}
              >
                <div className="flex items-start justify-between mb-8">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Icon className="w-6 h-6" />
                  </div>
                  {account.is_primary && (
                    <span className="px-2 py-1 bg-white/20 rounded-full text-xs font-medium">Primary</span>
                  )}
                </div>
                <p className="text-2xl font-bold mb-1">
                  {formatBalance(account.balance, account.currency)}
                </p>
                <p className="text-sm opacity-80 mb-2">{account.name}</p>
                <div className="flex items-center justify-between">
                  <p className="text-xs opacity-60">
                    {showBalances ? \`•••• \${account.account_number?.slice(-4)}\` : '•••• ••••'}
                  </p>
                  {account.change_percent !== undefined && (
                    <div className={\`flex items-center gap-1 text-xs \${account.change_percent >= 0 ? 'text-white' : 'text-red-200'}\`}>
                      {account.change_percent >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      <span>{Math.abs(account.change_percent)}%</span>
                    </div>
                  )}
                </div>
              </Link>
            );
          })
        ) : (
          <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
            <Wallet className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No accounts found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateAccountDetail(options: AccountOptions = {}): string {
  const { componentName = 'AccountDetail', endpoint = '/banking/accounts' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { Loader2, ArrowLeft, Download, Share2, Settings, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownLeft, Copy, Check } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface AccountDetails {
  id: string;
  name: string;
  type: string;
  balance: number;
  available_balance: number;
  currency: string;
  account_number: string;
  routing_number?: string;
  interest_rate?: number;
  opened_date: string;
  last_activity: string;
  status: 'active' | 'inactive' | 'frozen';
}

interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  category: string;
  date: string;
  status: string;
}

const ${componentName}: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [copied, setCopied] = React.useState(false);

  const { data: account, isLoading: accountLoading } = useQuery({
    queryKey: ['account', id],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + id);
      return response?.data || response;
    },
  });

  const { data: transactions, isLoading: txLoading } = useQuery({
    queryKey: ['account-transactions', id],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + id + '/transactions?limit=10');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const copyAccountNumber = async () => {
    if (account?.account_number) {
      await navigator.clipboard.writeText(account.account_number);
      setCopied(true);
      toast.success('Account number copied');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (accountLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!account) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Account not found</p>
        <Link to="/accounts" className="text-blue-600 hover:underline mt-2 inline-block">
          Back to accounts
        </Link>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: account.currency || 'USD',
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/accounts"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{account.name}</h1>
            <p className="text-sm text-gray-500 capitalize">{account.type} Account</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            <Download className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            <Share2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm opacity-80 mb-1">Current Balance</p>
            <p className="text-4xl font-bold">{formatCurrency(account.balance)}</p>
            <p className="text-sm opacity-80 mt-2">
              Available: {formatCurrency(account.available_balance)}
            </p>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="opacity-80">Account Number</span>
              <button
                onClick={copyAccountNumber}
                className="flex items-center gap-2 hover:bg-white/10 px-2 py-1 rounded transition-colors"
              >
                <span>•••• {account.account_number?.slice(-4)}</span>
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            {account.routing_number && (
              <div className="flex items-center justify-between text-sm">
                <span className="opacity-80">Routing Number</span>
                <span>{account.routing_number}</span>
              </div>
            )}
            {account.interest_rate && (
              <div className="flex items-center justify-between text-sm">
                <span className="opacity-80">Interest Rate</span>
                <span>{account.interest_rate}% APY</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link
          to="/transfers/new"
          className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
        >
          <ArrowUpRight className="w-6 h-6 text-blue-600" />
          <span className="text-sm font-medium text-gray-900 dark:text-white">Transfer</span>
        </Link>
        <Link
          to="/bills/pay"
          className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
        >
          <ArrowDownLeft className="w-6 h-6 text-green-600" />
          <span className="text-sm font-medium text-gray-900 dark:text-white">Pay Bill</span>
        </Link>
        <Link
          to={\`/accounts/\${id}/statements\`}
          className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
        >
          <Download className="w-6 h-6 text-purple-600" />
          <span className="text-sm font-medium text-gray-900 dark:text-white">Statements</span>
        </Link>
        <Link
          to={\`/accounts/\${id}/settings\`}
          className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
        >
          <Settings className="w-6 h-6 text-gray-600" />
          <span className="text-sm font-medium text-gray-900 dark:text-white">Settings</span>
        </Link>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Transactions</h2>
          <Link to={\`/accounts/\${id}/transactions\`} className="text-sm text-blue-600 hover:underline">
            View all
          </Link>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {txLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : transactions && transactions.length > 0 ? (
            transactions.map((tx: Transaction) => (
              <div key={tx.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <div className={\`p-2 rounded-full \${
                  tx.type === 'credit' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
                }\`}>
                  {tx.type === 'credit' ? (
                    <ArrowDownLeft className="w-5 h-5 text-green-600" />
                  ) : (
                    <ArrowUpRight className="w-5 h-5 text-red-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white truncate">{tx.description}</p>
                  <p className="text-sm text-gray-500">{tx.category}</p>
                </div>
                <div className="text-right">
                  <p className={\`font-semibold \${tx.type === 'credit' ? 'text-green-600' : 'text-gray-900 dark:text-white'}\`}>
                    {tx.type === 'credit' ? '+' : '-'}{formatCurrency(Math.abs(tx.amount))}
                  </p>
                  <p className="text-xs text-gray-500">{new Date(tx.date).toLocaleDateString()}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">No recent transactions</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateAccountList(options: AccountOptions = {}): string {
  const { componentName = 'AccountList', endpoint = '/banking/accounts' } = options;

  return `import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Loader2, Plus, Search, Filter, Wallet, CreditCard, PiggyBank, TrendingUp, MoreVertical, Eye, EyeOff } from 'lucide-react';
import { api } from '@/lib/api';

interface Account {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit' | 'investment';
  balance: number;
  currency: string;
  account_number: string;
  institution?: string;
  status: 'active' | 'inactive' | 'frozen';
  is_primary?: boolean;
}

const ${componentName}: React.FC = () => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showBalances, setShowBalances] = useState(true);

  const { data: accounts, isLoading } = useQuery({
    queryKey: ['banking-accounts-list'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const filteredAccounts = accounts?.filter((account: Account) => {
    const matchesSearch = account.name.toLowerCase().includes(search.toLowerCase()) ||
      account.institution?.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || account.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'savings': return PiggyBank;
      case 'credit': return CreditCard;
      case 'investment': return TrendingUp;
      default: return Wallet;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'inactive': return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400';
      case 'frozen': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    if (!showBalances) return '****';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Accounts</h1>
          <p className="text-sm text-gray-500 mt-1">Manage all your bank accounts</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowBalances(!showBalances)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title={showBalances ? 'Hide balances' : 'Show balances'}
          >
            {showBalances ? <Eye className="w-5 h-5 text-gray-600 dark:text-gray-400" /> : <EyeOff className="w-5 h-5 text-gray-600 dark:text-gray-400" />}
          </button>
          <Link
            to="/accounts/link"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Link Account</span>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search accounts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          <option value="all">All Types</option>
          <option value="checking">Checking</option>
          <option value="savings">Savings</option>
          <option value="credit">Credit</option>
          <option value="investment">Investment</option>
        </select>
      </div>

      {/* Account List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredAccounts && filteredAccounts.length > 0 ? (
            filteredAccounts.map((account: Account) => {
              const Icon = getAccountIcon(account.type);
              return (
                <Link
                  key={account.id}
                  to={\`/accounts/\${account.id}\`}
                  className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-xl">
                    <Icon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900 dark:text-white truncate">{account.name}</p>
                      {account.is_primary && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-xs font-medium">
                          Primary
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                      <span className="capitalize">{account.type}</span>
                      {account.institution && (
                        <>
                          <span>•</span>
                          <span>{account.institution}</span>
                        </>
                      )}
                      <span>•</span>
                      <span>•••• {account.account_number?.slice(-4)}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={\`text-lg font-semibold \${account.type === 'credit' ? 'text-red-600' : 'text-gray-900 dark:text-white'}\`}>
                      {account.type === 'credit' && account.balance > 0 ? '-' : ''}{formatCurrency(account.balance, account.currency)}
                    </p>
                    <span className={\`inline-block px-2 py-0.5 rounded-full text-xs font-medium \${getStatusColor(account.status)}\`}>
                      {account.status}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      // Handle menu
                    }}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    <MoreVertical className="w-5 h-5 text-gray-400" />
                  </button>
                </Link>
              );
            })
          ) : (
            <div className="p-12 text-center text-gray-500">
              <Wallet className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No accounts found</p>
              <p className="text-sm">Link a bank account to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}
