/**
 * Banking Transfer Component Generators
 */

export interface TransferOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateTransferForm(options: TransferOptions = {}): string {
  const { componentName = 'TransferForm', endpoint = '/banking/transfers' } = options;

  return `import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Loader2, ArrowRight, ArrowLeftRight, Building2, Wallet, User, AlertCircle, CheckCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  account_number: string;
}

interface Beneficiary {
  id: string;
  name: string;
  bank_name?: string;
  account_number: string;
  is_favorite?: boolean;
}

type TransferType = 'internal' | 'external' | 'beneficiary';

const ${componentName}: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [transferType, setTransferType] = useState<TransferType>('internal');
  const [fromAccountId, setFromAccountId] = useState<string>('');
  const [toAccountId, setToAccountId] = useState<string>('');
  const [beneficiaryId, setBeneficiaryId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState('');
  const [scheduleDate, setScheduleDate] = useState<string>('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState<string>('monthly');

  const { data: accounts, isLoading: accountsLoading } = useQuery({
    queryKey: ['transfer-accounts'],
    queryFn: async () => {
      const response = await api.get<any>('/banking/accounts');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const { data: beneficiaries } = useQuery({
    queryKey: ['beneficiaries'],
    queryFn: async () => {
      const response = await api.get<any>('/banking/beneficiaries');
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: transferType === 'beneficiary',
  });

  const transferMutation = useMutation({
    mutationFn: (data: any) => api.post('${endpoint}', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfer-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['transfer-history'] });
      toast.success('Transfer initiated successfully!');
      navigate('/transfers');
    },
    onError: () => toast.error('Transfer failed. Please try again.'),
  });

  React.useEffect(() => {
    if (accounts && accounts.length > 0 && !fromAccountId) {
      setFromAccountId(accounts[0].id);
    }
  }, [accounts, fromAccountId]);

  const fromAccount = accounts?.find((a: Account) => a.id === fromAccountId);
  const toAccount = accounts?.find((a: Account) => a.id === toAccountId);
  const transferAmount = parseFloat(amount) || 0;
  const insufficientFunds = fromAccount && transferAmount > fromAccount.balance;
  const sameAccount = transferType === 'internal' && fromAccountId === toAccountId && fromAccountId !== '';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (insufficientFunds) {
      toast.error('Insufficient funds');
      return;
    }

    if (sameAccount) {
      toast.error('Cannot transfer to the same account');
      return;
    }

    transferMutation.mutate({
      type: transferType,
      from_account_id: fromAccountId,
      to_account_id: transferType === 'internal' ? toAccountId : undefined,
      beneficiary_id: transferType === 'beneficiary' ? beneficiaryId : undefined,
      amount: transferAmount,
      description,
      schedule_date: scheduleDate || undefined,
      is_recurring: isRecurring,
      frequency: isRecurring ? frequency : undefined,
    });
  };

  const getAvailableToAccounts = () => {
    return accounts?.filter((a: Account) => a.id !== fromAccountId) || [];
  };

  if (accountsLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transfer Money</h1>
        <p className="text-sm text-gray-500 mt-1">Send money between accounts or to others</p>
      </div>

      {/* Transfer Type Selector */}
      <div className="grid grid-cols-3 gap-2 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
        <button
          type="button"
          onClick={() => setTransferType('internal')}
          className={\`flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors \${
            transferType === 'internal'
              ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white'
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }\`}
        >
          <ArrowLeftRight className="w-4 h-4" />
          Between Accounts
        </button>
        <button
          type="button"
          onClick={() => setTransferType('beneficiary')}
          className={\`flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors \${
            transferType === 'beneficiary'
              ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white'
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }\`}
        >
          <User className="w-4 h-4" />
          To Beneficiary
        </button>
        <button
          type="button"
          onClick={() => setTransferType('external')}
          className={\`flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors \${
            transferType === 'external'
              ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white'
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }\`}
        >
          <Building2 className="w-4 h-4" />
          External Transfer
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* From Account */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            From Account
          </label>
          <div className="space-y-2">
            {accounts?.map((account: Account) => (
              <button
                key={account.id}
                type="button"
                onClick={() => setFromAccountId(account.id)}
                className={\`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-colors \${
                  fromAccountId === account.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }\`}
              >
                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <Wallet className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-gray-900 dark:text-white">{account.name}</p>
                  <p className="text-sm text-gray-500">•••• {account.account_number.slice(-4)}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-white">\${account.balance.toLocaleString()}</p>
                </div>
                {fromAccountId === account.id && (
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Transfer Direction Indicator */}
        <div className="flex justify-center">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
            <ArrowRight className="w-6 h-6 text-blue-600" />
          </div>
        </div>

        {/* To Account / Beneficiary */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          {transferType === 'internal' && (
            <>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                To Account
              </label>
              <div className="space-y-2">
                {getAvailableToAccounts().map((account: Account) => (
                  <button
                    key={account.id}
                    type="button"
                    onClick={() => setToAccountId(account.id)}
                    className={\`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-colors \${
                      toAccountId === account.id
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }\`}
                  >
                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      <Wallet className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-gray-900 dark:text-white">{account.name}</p>
                      <p className="text-sm text-gray-500">•••• {account.account_number.slice(-4)}</p>
                    </div>
                    {toAccountId === account.id && (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                  </button>
                ))}
                {getAvailableToAccounts().length === 0 && (
                  <p className="text-center text-gray-500 py-4">No other accounts available</p>
                )}
              </div>
            </>
          )}

          {transferType === 'beneficiary' && (
            <>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Select Beneficiary
              </label>
              <div className="space-y-2">
                {beneficiaries?.map((beneficiary: Beneficiary) => (
                  <button
                    key={beneficiary.id}
                    type="button"
                    onClick={() => setBeneficiaryId(beneficiary.id)}
                    className={\`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-colors \${
                      beneficiaryId === beneficiary.id
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }\`}
                  >
                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                      <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-gray-900 dark:text-white">{beneficiary.name}</p>
                      <p className="text-sm text-gray-500">
                        {beneficiary.bank_name} • •••• {beneficiary.account_number.slice(-4)}
                      </p>
                    </div>
                    {beneficiaryId === beneficiary.id && (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                  </button>
                ))}
                {(!beneficiaries || beneficiaries.length === 0) && (
                  <div className="text-center py-4">
                    <p className="text-gray-500 mb-2">No beneficiaries saved</p>
                    <a href="/beneficiaries/new" className="text-blue-600 hover:underline text-sm">
                      Add a beneficiary
                    </a>
                  </div>
                )}
              </div>
            </>
          )}

          {transferType === 'external' && (
            <>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Recipient Details
              </label>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Recipient Name"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
                <input
                  type="text"
                  placeholder="Bank Name"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Account Number"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="Routing Number"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Amount */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Amount
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-xl font-medium">$</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={\`w-full pl-10 pr-4 py-4 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-2xl font-bold text-center \${
                insufficientFunds
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
              }\`}
              placeholder="0.00"
            />
          </div>
          {insufficientFunds && (
            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              Insufficient funds. Available: \${fromAccount?.balance.toLocaleString()}
            </p>
          )}

          {/* Quick amounts */}
          <div className="flex gap-2 mt-3">
            {[50, 100, 250, 500].map((quickAmount) => (
              <button
                key={quickAmount}
                type="button"
                onClick={() => setAmount(quickAmount.toString())}
                className="flex-1 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-sm font-medium"
              >
                \${quickAmount}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description (Optional)
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What's this transfer for?"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>

        {/* Schedule */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Schedule Transfer (Optional)
            </label>
            <input
              type="date"
              value={scheduleDate}
              onChange={(e) => setScheduleDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="recurring"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-gray-300"
            />
            <label htmlFor="recurring" className="text-sm text-gray-700 dark:text-gray-300">
              Make this a recurring transfer
            </label>
          </div>

          {isRecurring && (
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="weekly">Weekly</option>
              <option value="biweekly">Every 2 weeks</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
            </select>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={
            transferMutation.isPending ||
            insufficientFunds ||
            transferAmount <= 0 ||
            !fromAccountId ||
            (transferType === 'internal' && !toAccountId) ||
            (transferType === 'beneficiary' && !beneficiaryId)
          }
          className="w-full py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium text-lg"
        >
          {transferMutation.isPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              Transfer \${transferAmount.toLocaleString()}
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateTransferHistory(options: TransferOptions = {}): string {
  const { componentName = 'TransferHistory', endpoint = '/banking/transfers' } = options;

  return `import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Loader2, Search, Filter, ArrowUpRight, ArrowDownLeft, ArrowLeftRight, Clock, CheckCircle, XCircle, Download, Plus } from 'lucide-react';
import { api } from '@/lib/api';

interface Transfer {
  id: string;
  type: 'internal' | 'external' | 'incoming';
  from_account_name?: string;
  to_account_name?: string;
  beneficiary_name?: string;
  amount: number;
  currency: string;
  description?: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  created_at: string;
  completed_at?: string;
  reference_number?: string;
}

const ${componentName}: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('30');

  const { data: transfers, isLoading } = useQuery({
    queryKey: ['transfer-history', statusFilter, typeFilter, dateRange],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (typeFilter !== 'all') params.append('type', typeFilter);
      params.append('days', dateRange);
      const response = await api.get<any>('${endpoint}?' + params.toString());
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const filteredTransfers = transfers?.filter((transfer: Transfer) => {
    const searchLower = search.toLowerCase();
    return (
      transfer.to_account_name?.toLowerCase().includes(searchLower) ||
      transfer.from_account_name?.toLowerCase().includes(searchLower) ||
      transfer.beneficiary_name?.toLowerCase().includes(searchLower) ||
      transfer.description?.toLowerCase().includes(searchLower) ||
      transfer.reference_number?.toLowerCase().includes(searchLower)
    );
  });

  const getTransferIcon = (type: string) => {
    switch (type) {
      case 'incoming':
        return <ArrowDownLeft className="w-5 h-5 text-green-600" />;
      case 'internal':
        return <ArrowLeftRight className="w-5 h-5 text-blue-600" />;
      default:
        return <ArrowUpRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />;
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed':
        return { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle };
      case 'pending':
        return { color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', icon: Clock };
      case 'failed':
        return { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: XCircle };
      case 'cancelled':
        return { color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400', icon: XCircle };
      default:
        return { color: 'bg-gray-100 text-gray-700', icon: Clock };
    }
  };

  // Calculate stats
  const totalSent = filteredTransfers?.filter((t: Transfer) => t.type !== 'incoming' && t.status === 'completed')
    .reduce((sum: number, t: Transfer) => sum + t.amount, 0) || 0;
  const totalReceived = filteredTransfers?.filter((t: Transfer) => t.type === 'incoming' && t.status === 'completed')
    .reduce((sum: number, t: Transfer) => sum + t.amount, 0) || 0;

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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transfer History</h1>
          <p className="text-sm text-gray-500 mt-1">View and track all your transfers</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300">
            <Download className="w-4 h-4" />
            Export
          </button>
          <Link
            to="/transfers/new"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Transfer
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <ArrowUpRight className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Sent</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">\${totalSent.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <ArrowDownLeft className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Received</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">\${totalReceived.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search transfers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          <option value="all">All Types</option>
          <option value="internal">Internal</option>
          <option value="external">External</option>
          <option value="incoming">Incoming</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          <option value="all">All Status</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="365">Last year</option>
        </select>
      </div>

      {/* Transfer List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredTransfers && filteredTransfers.length > 0 ? (
            filteredTransfers.map((transfer: Transfer) => {
              const statusConfig = getStatusConfig(transfer.status);
              const StatusIcon = statusConfig.icon;

              return (
                <Link
                  key={transfer.id}
                  to={\`/transfers/\${transfer.id}\`}
                  className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className={\`p-2 rounded-full \${
                    transfer.type === 'incoming' ? 'bg-green-100 dark:bg-green-900/30' :
                    transfer.type === 'internal' ? 'bg-blue-100 dark:bg-blue-900/30' :
                    'bg-gray-100 dark:bg-gray-700'
                  }\`}>
                    {getTransferIcon(transfer.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {transfer.type === 'incoming' ? (
                          <>From: {transfer.from_account_name || 'External'}</>
                        ) : transfer.type === 'internal' ? (
                          <>To: {transfer.to_account_name}</>
                        ) : (
                          <>To: {transfer.beneficiary_name || transfer.to_account_name}</>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                      <span className="capitalize">{transfer.type}</span>
                      {transfer.reference_number && (
                        <>
                          <span>•</span>
                          <span>Ref: {transfer.reference_number}</span>
                        </>
                      )}
                      {transfer.description && (
                        <>
                          <span>•</span>
                          <span className="truncate">{transfer.description}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={\`text-lg font-semibold \${
                      transfer.type === 'incoming' ? 'text-green-600' : 'text-gray-900 dark:text-white'
                    }\`}>
                      {transfer.type === 'incoming' ? '+' : '-'}\${transfer.amount.toLocaleString()}
                    </p>
                    <div className="flex items-center justify-end gap-2 mt-1">
                      <span className={\`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium \${statusConfig.color}\`}>
                        <StatusIcon className="w-3 h-3" />
                        {transfer.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(transfer.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="p-12 text-center text-gray-500">
              <ArrowLeftRight className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No transfers found</p>
              <p className="text-sm">Your transfer history will appear here</p>
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

export function generateBeneficiaryList(options: TransferOptions = {}): string {
  const { componentName = 'BeneficiaryList', endpoint = '/banking/beneficiaries' } = options;

  return `import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Loader2, Plus, Search, User, Building2, Star, Trash2, Edit2, MoreVertical, Send } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface Beneficiary {
  id: string;
  name: string;
  nickname?: string;
  bank_name: string;
  account_number: string;
  routing_number?: string;
  account_type: 'checking' | 'savings';
  is_favorite: boolean;
  last_transfer_date?: string;
  total_transferred?: number;
}

const ${componentName}: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const { data: beneficiaries, isLoading } = useQuery({
    queryKey: ['beneficiaries'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete('${endpoint}/' + id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beneficiaries'] });
      toast.success('Beneficiary removed');
    },
    onError: () => toast.error('Failed to remove beneficiary'),
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: (id: string) => api.put('${endpoint}/' + id + '/favorite', {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beneficiaries'] });
    },
  });

  const filteredBeneficiaries = beneficiaries?.filter((b: Beneficiary) => {
    const matchesSearch = b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.nickname?.toLowerCase().includes(search.toLowerCase()) ||
      b.bank_name.toLowerCase().includes(search.toLowerCase());
    const matchesFavorite = !showFavoritesOnly || b.is_favorite;
    return matchesSearch && matchesFavorite;
  });

  // Sort by favorites first, then by last transfer date
  const sortedBeneficiaries = filteredBeneficiaries?.sort((a: Beneficiary, b: Beneficiary) => {
    if (a.is_favorite && !b.is_favorite) return -1;
    if (!a.is_favorite && b.is_favorite) return 1;
    if (a.last_transfer_date && b.last_transfer_date) {
      return new Date(b.last_transfer_date).getTime() - new Date(a.last_transfer_date).getTime();
    }
    return 0;
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Beneficiaries</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your saved recipients for quick transfers</p>
        </div>
        <Link
          to="/beneficiaries/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Beneficiary</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search beneficiaries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
        <button
          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          className={\`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors \${
            showFavoritesOnly
              ? 'border-yellow-500 bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
              : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
          }\`}
        >
          <Star className={\`w-4 h-4 \${showFavoritesOnly ? 'fill-current' : ''}\`} />
          Favorites
        </button>
      </div>

      {/* Beneficiary List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {sortedBeneficiaries && sortedBeneficiaries.length > 0 ? (
            sortedBeneficiaries.map((beneficiary: Beneficiary) => (
              <div
                key={beneficiary.id}
                className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="relative">
                  <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full">
                    <User className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                  </div>
                  {beneficiary.is_favorite && (
                    <Star className="absolute -top-1 -right-1 w-4 h-4 text-yellow-500 fill-current" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900 dark:text-white truncate">{beneficiary.name}</p>
                    {beneficiary.nickname && (
                      <span className="text-sm text-gray-500">({beneficiary.nickname})</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                    <Building2 className="w-4 h-4" />
                    <span>{beneficiary.bank_name}</span>
                    <span>•</span>
                    <span className="capitalize">{beneficiary.account_type}</span>
                    <span>•</span>
                    <span>•••• {beneficiary.account_number.slice(-4)}</span>
                  </div>
                  {beneficiary.last_transfer_date && (
                    <p className="text-xs text-gray-400 mt-1">
                      Last transfer: {new Date(beneficiary.last_transfer_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    to={\`/transfers/new?beneficiary=\${beneficiary.id}\`}
                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    Send
                  </Link>
                  <button
                    onClick={() => toggleFavoriteMutation.mutate(beneficiary.id)}
                    className={\`p-2 rounded-lg transition-colors \${
                      beneficiary.is_favorite
                        ? 'text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                        : 'text-gray-400 hover:text-yellow-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }\`}
                  >
                    <Star className={\`w-5 h-5 \${beneficiary.is_favorite ? 'fill-current' : ''}\`} />
                  </button>
                  <Link
                    to={\`/beneficiaries/\${beneficiary.id}/edit\`}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    <Edit2 className="w-5 h-5" />
                  </Link>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to remove this beneficiary?')) {
                        deleteMutation.mutate(beneficiary.id);
                      }
                    }}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-gray-500">
              <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No beneficiaries found</p>
              <p className="text-sm mb-4">Add beneficiaries for quick and easy transfers</p>
              <Link
                to="/beneficiaries/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Beneficiary
              </Link>
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
