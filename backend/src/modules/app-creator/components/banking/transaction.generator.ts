/**
 * Banking Transaction Component Generators
 */

export interface TransactionOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateTransactionTable(options: TransactionOptions = {}): string {
  const { componentName = 'TransactionTable', endpoint = '/banking/transactions' } = options;

  return `import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Loader2, Search, Download, ArrowUpRight, ArrowDownLeft, ChevronLeft, ChevronRight, ExternalLink, Receipt, MoreVertical } from 'lucide-react';
import { api } from '@/lib/api';

interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  currency: string;
  description: string;
  merchant?: string;
  category: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  account_id: string;
  account_name?: string;
  reference_number?: string;
  balance_after?: number;
}

interface TransactionTableProps {
  accountId?: string;
}

const ${componentName}: React.FC<TransactionTableProps> = ({ accountId }) => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const pageSize = 20;

  const { data, isLoading } = useQuery({
    queryKey: ['transactions', accountId, page, sortBy, sortOrder],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (accountId) params.append('account_id', accountId);
      params.append('page', page.toString());
      params.append('limit', pageSize.toString());
      params.append('sort_by', sortBy);
      params.append('sort_order', sortOrder);
      const response = await api.get<any>('${endpoint}?' + params.toString());
      return response;
    },
  });

  const transactions = Array.isArray(data) ? data : (data?.data || []);
  const totalPages = data?.total_pages || 1;
  const totalCount = data?.total || transactions.length;

  const filteredTransactions = transactions.filter((tx: Transaction) => {
    const searchLower = search.toLowerCase();
    return (
      tx.description?.toLowerCase().includes(searchLower) ||
      tx.merchant?.toLowerCase().includes(searchLower) ||
      tx.category?.toLowerCase().includes(searchLower) ||
      tx.reference_number?.toLowerCase().includes(searchLower)
    );
  });

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      food: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      shopping: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
      transport: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      utilities: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      entertainment: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      health: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      income: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      transfer: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    };
    return colors[category?.toLowerCase()] || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400';
  };

  const handleSort = (field: 'date' | 'amount') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const exportTransactions = () => {
    // Create CSV content
    const headers = ['Date', 'Description', 'Category', 'Amount', 'Type', 'Status', 'Reference'];
    const rows = filteredTransactions.map((tx: Transaction) => [
      new Date(tx.date).toLocaleDateString(),
      tx.description || tx.merchant || '',
      tx.category,
      tx.amount,
      tx.type,
      tx.status,
      tx.reference_number || '',
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transactions.csv';
    a.click();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
        <button
          onClick={exportTransactions}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
        >
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('date')}
                    className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200"
                  >
                    Date
                    {sortBy === 'date' && (
                      <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('amount')}
                    className="flex items-center gap-1 ml-auto hover:text-gray-700 dark:hover:text-gray-200"
                  >
                    Amount
                    {sortBy === 'amount' && (
                      <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Balance
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">

                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((tx: Transaction) => (
                  <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(tx.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className={\`p-2 rounded-full \${
                          tx.type === 'credit' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-700'
                        }\`}>
                          {tx.type === 'credit' ? (
                            <ArrowDownLeft className="w-4 h-4 text-green-600" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4 text-gray-500" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-xs">
                            {tx.description || tx.merchant}
                          </p>
                          {tx.reference_number && (
                            <p className="text-xs text-gray-500">Ref: {tx.reference_number}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={\`inline-flex px-2 py-1 rounded-full text-xs font-medium \${getCategoryColor(tx.category)}\`}>
                        {tx.category}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right">
                      <p className={\`text-sm font-semibold \${
                        tx.type === 'credit' ? 'text-green-600' : 'text-gray-900 dark:text-white'
                      }\`}>
                        {tx.type === 'credit' ? '+' : '-'}{formatCurrency(Math.abs(tx.amount), tx.currency)}
                      </p>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right">
                      {tx.balance_after !== undefined && (
                        <p className="text-sm text-gray-500">
                          {formatCurrency(tx.balance_after, tx.currency)}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <span className={\`inline-flex px-2 py-1 rounded-full text-xs font-medium \${
                        tx.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        tx.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }\`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right">
                      <Link
                        to={\`/transactions/\${tx.id}\`}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg inline-block"
                      >
                        <Receipt className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                    No transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, totalCount)} of {totalCount} transactions
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateTransactionFilters(options: TransactionOptions = {}): string {
  const { componentName = 'TransactionFilters', endpoint = '/banking/transactions' } = options;

  return `import React, { useState } from 'react';
import { Filter, X, Calendar, DollarSign, Tag, Building2 } from 'lucide-react';

interface FilterState {
  dateFrom?: string;
  dateTo?: string;
  minAmount?: string;
  maxAmount?: string;
  type?: 'all' | 'credit' | 'debit';
  category?: string;
  status?: 'all' | 'completed' | 'pending' | 'failed';
  accountId?: string;
}

interface Account {
  id: string;
  name: string;
}

interface ${componentName}Props {
  accounts?: Account[];
  categories?: string[];
  onFilterChange: (filters: FilterState) => void;
  initialFilters?: FilterState;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  accounts = [],
  categories = ['Food', 'Shopping', 'Transport', 'Utilities', 'Entertainment', 'Health', 'Income', 'Transfer', 'Other'],
  onFilterChange,
  initialFilters = {},
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  const updateFilter = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  const applyFilters = () => {
    onFilterChange(filters);
    setIsOpen(false);
  };

  const clearFilters = () => {
    const clearedFilters: FilterState = {};
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const activeFilterCount = Object.values(filters).filter(v => v && v !== 'all').length;

  const quickDateFilters = [
    { label: 'Today', getValue: () => {
      const today = new Date().toISOString().split('T')[0];
      return { dateFrom: today, dateTo: today };
    }},
    { label: 'Last 7 days', getValue: () => {
      const today = new Date();
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      return { dateFrom: weekAgo.toISOString().split('T')[0], dateTo: today.toISOString().split('T')[0] };
    }},
    { label: 'Last 30 days', getValue: () => {
      const today = new Date();
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      return { dateFrom: monthAgo.toISOString().split('T')[0], dateTo: today.toISOString().split('T')[0] };
    }},
    { label: 'This month', getValue: () => {
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      return { dateFrom: firstDay.toISOString().split('T')[0], dateTo: today.toISOString().split('T')[0] };
    }},
  ];

  return (
    <div className="relative">
      {/* Filter Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={\`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors \${
          activeFilterCount > 0
            ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
            : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
        }\`}
      >
        <Filter className="w-4 h-4" />
        Filters
        {activeFilterCount > 0 && (
          <span className="px-1.5 py-0.5 bg-blue-600 text-white text-xs rounded-full">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* Filter Panel */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-white">Filter Transactions</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="p-4 space-y-6 max-h-[60vh] overflow-y-auto">
            {/* Date Range */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar className="w-4 h-4" />
                Date Range
              </label>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <input
                  type="date"
                  value={filters.dateFrom || ''}
                  onChange={(e) => updateFilter('dateFrom', e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                  placeholder="From"
                />
                <input
                  type="date"
                  value={filters.dateTo || ''}
                  onChange={(e) => updateFilter('dateTo', e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                  placeholder="To"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {quickDateFilters.map((qf) => (
                  <button
                    key={qf.label}
                    onClick={() => {
                      const dates = qf.getValue();
                      updateFilter('dateFrom', dates.dateFrom);
                      updateFilter('dateTo', dates.dateTo);
                    }}
                    className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    {qf.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Amount Range */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <DollarSign className="w-4 h-4" />
                Amount Range
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={filters.minAmount || ''}
                    onChange={(e) => updateFilter('minAmount', e.target.value)}
                    className="w-full pl-7 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                    placeholder="Min"
                  />
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={filters.maxAmount || ''}
                    onChange={(e) => updateFilter('maxAmount', e.target.value)}
                    className="w-full pl-7 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                    placeholder="Max"
                  />
                </div>
              </div>
            </div>

            {/* Transaction Type */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Transaction Type
              </label>
              <div className="flex gap-2">
                {(['all', 'credit', 'debit'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => updateFilter('type', type)}
                    className={\`flex-1 py-2 rounded-lg text-sm font-medium transition-colors \${
                      (filters.type || 'all') === type
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }\`}
                  >
                    {type === 'all' ? 'All' : type === 'credit' ? 'Income' : 'Expense'}
                  </button>
                ))}
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Tag className="w-4 h-4" />
                Category
              </label>
              <select
                value={filters.category || ''}
                onChange={(e) => updateFilter('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat.toLowerCase()}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Account */}
            {accounts.length > 0 && (
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Building2 className="w-4 h-4" />
                  Account
                </label>
                <select
                  value={filters.accountId || ''}
                  onChange={(e) => updateFilter('accountId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                >
                  <option value="">All Accounts</option>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>{account.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Status */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Status
              </label>
              <select
                value={filters.status || 'all'}
                onChange={(e) => updateFilter('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium"
            >
              Clear All
            </button>
            <button
              onClick={applyFilters}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default ${componentName};
`;
}
