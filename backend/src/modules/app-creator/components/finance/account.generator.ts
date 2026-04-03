/**
 * Account Component Generators
 */

export interface AccountOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateAccountOverview(options: AccountOptions = {}): string {
  const { componentName = 'AccountOverview', endpoint = '/accounts' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, TrendingUp, TrendingDown, DollarSign, CreditCard, Wallet, PiggyBank } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const { data: overview, isLoading } = useQuery({
    queryKey: ['account-overview'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/overview');
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
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white">
        <p className="text-sm opacity-80">Total Balance</p>
        <p className="text-4xl font-bold mt-1">\${overview?.total_balance?.toLocaleString() || '0.00'}</p>
        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-1 text-sm">
            <TrendingUp className="w-4 h-4" />
            <span>\${overview?.income?.toLocaleString() || '0'} income</span>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <TrendingDown className="w-4 h-4" />
            <span>\${overview?.expenses?.toLocaleString() || '0'} expenses</span>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Wallet className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Savings</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">\${overview?.savings?.toLocaleString() || '0'}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <CreditCard className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Credit Used</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">\${overview?.credit_used?.toLocaleString() || '0'}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <PiggyBank className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Investments</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">\${overview?.investments?.toLocaleString() || '0'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateAccountCards(options: AccountOptions = {}): string {
  const { componentName = 'AccountCards', endpoint = '/accounts' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Loader2, CreditCard, Building2, Wallet, Plus } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const { data: accounts, isLoading } = useQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const getAccountIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'credit': return CreditCard;
      case 'savings': return Wallet;
      default: return Building2;
    }
  };

  const getAccountColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'credit': return 'from-red-500 to-pink-500';
      case 'savings': return 'from-green-500 to-emerald-500';
      default: return 'from-blue-500 to-indigo-500';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Accounts</h2>
        <button className="flex items-center gap-2 text-purple-600 hover:text-purple-700 text-sm font-medium">
          <Plus className="w-4 h-4" />
          Add Account
        </button>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts && accounts.length > 0 ? (
          accounts.map((account: any) => {
            const Icon = getAccountIcon(account.type);
            return (
              <Link
                key={account.id}
                to={\`/accounts/\${account.id}\`}
                className={\`bg-gradient-to-br \${getAccountColor(account.type)} rounded-xl p-5 text-white hover:shadow-lg transition-shadow\`}
              >
                <div className="flex items-start justify-between mb-6">
                  <Icon className="w-8 h-8 opacity-80" />
                  <span className="text-xs opacity-80 uppercase">{account.type}</span>
                </div>
                <p className="text-2xl font-bold">\${account.balance?.toLocaleString() || '0.00'}</p>
                <p className="text-sm opacity-80 mt-1">{account.name}</p>
                {account.account_number && (
                  <p className="text-xs opacity-60 mt-2">•••• {account.account_number.slice(-4)}</p>
                )}
              </Link>
            );
          })
        ) : (
          <div className="col-span-full text-center py-8 text-gray-500">No accounts found</div>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateTransactionList(options: AccountOptions = {}): string {
  const { componentName = 'TransactionList', endpoint = '/transactions' } = options;

  return `import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, ArrowUpRight, ArrowDownLeft, Search, Filter, Download } from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  accountId?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ accountId }) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const { data: transactions, isLoading } = useQuery({
    queryKey: ['transactions', accountId, filter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (accountId) params.append('account_id', accountId);
      if (filter !== 'all') params.append('type', filter);
      const url = '${endpoint}' + (params.toString() ? '?' + params.toString() : '');
      const response = await api.get<any>(url);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const filteredTransactions = transactions?.filter((tx: any) =>
    tx.description?.toLowerCase().includes(search.toLowerCase()) ||
    tx.merchant?.toLowerCase().includes(search.toLowerCase())
  );

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
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
            >
              <option value="all">All</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
              <option value="transfer">Transfer</option>
            </select>
            <button className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
              <Download className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {filteredTransactions && filteredTransactions.length > 0 ? (
          filteredTransactions.map((tx: any) => (
            <div key={tx.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <div className="flex items-center gap-4">
                <div className={\`p-2 rounded-full \${
                  tx.type === 'income' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
                }\`}>
                  {tx.type === 'income' ? (
                    <ArrowDownLeft className="w-5 h-5 text-green-600" />
                  ) : (
                    <ArrowUpRight className="w-5 h-5 text-red-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white truncate">{tx.description || tx.merchant}</p>
                  <p className="text-sm text-gray-500">{tx.category}</p>
                </div>
                <div className="text-right">
                  <p className={\`font-semibold \${
                    tx.type === 'income' ? 'text-green-600' : 'text-gray-900 dark:text-white'
                  }\`}>
                    {tx.type === 'income' ? '+' : '-'}\${Math.abs(tx.amount).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">{new Date(tx.date).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-gray-500">No transactions found</div>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}
