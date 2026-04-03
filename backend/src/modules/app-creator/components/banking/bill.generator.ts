/**
 * Banking Bill Component Generators
 */

export interface BillOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateBillList(options: BillOptions = {}): string {
  const { componentName = 'BillList', endpoint = '/banking/bills' } = options;

  return `import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Loader2, Plus, Search, Filter, Calendar, AlertCircle, CheckCircle, Clock, Zap, Home, Phone, Wifi, CreditCard, Droplets, Flame, MoreVertical } from 'lucide-react';
import { api } from '@/lib/api';

interface Bill {
  id: string;
  payee: string;
  category: string;
  amount: number;
  due_date: string;
  status: 'pending' | 'paid' | 'overdue' | 'scheduled';
  is_recurring: boolean;
  frequency?: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  auto_pay?: boolean;
  account_id?: string;
  last_paid?: string;
}

const ${componentName}: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [view, setView] = useState<'list' | 'calendar'>('list');

  const { data: bills, isLoading } = useQuery({
    queryKey: ['banking-bills', statusFilter],
    queryFn: async () => {
      const params = statusFilter !== 'all' ? '?status=' + statusFilter : '';
      const response = await api.get<any>('${endpoint}' + params);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const filteredBills = bills?.filter((bill: Bill) =>
    bill.payee.toLowerCase().includes(search.toLowerCase()) ||
    bill.category.toLowerCase().includes(search.toLowerCase())
  );

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, any> = {
      utilities: Zap,
      rent: Home,
      phone: Phone,
      internet: Wifi,
      credit_card: CreditCard,
      water: Droplets,
      gas: Flame,
    };
    return icons[category?.toLowerCase()] || CreditCard;
  };

  const getStatusConfig = (status: string, dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const daysUntilDue = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    switch (status) {
      case 'paid':
        return { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle, label: 'Paid' };
      case 'overdue':
        return { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: AlertCircle, label: 'Overdue' };
      case 'scheduled':
        return { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: Clock, label: 'Scheduled' };
      default:
        if (daysUntilDue <= 3 && daysUntilDue >= 0) {
          return { color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: AlertCircle, label: 'Due Soon' };
        }
        return { color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400', icon: Clock, label: 'Pending' };
    }
  };

  const formatDueDate = (date: string) => {
    const due = new Date(date);
    const today = new Date();
    const daysUntilDue = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilDue === 0) return 'Due today';
    if (daysUntilDue === 1) return 'Due tomorrow';
    if (daysUntilDue < 0) return \`\${Math.abs(daysUntilDue)} days overdue\`;
    if (daysUntilDue <= 7) return \`Due in \${daysUntilDue} days\`;
    return due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Calculate summary stats
  const totalDue = filteredBills?.filter((b: Bill) => b.status !== 'paid').reduce((sum: number, b: Bill) => sum + b.amount, 0) || 0;
  const overdueBills = filteredBills?.filter((b: Bill) => b.status === 'overdue').length || 0;
  const upcomingBills = filteredBills?.filter((b: Bill) => b.status === 'pending').length || 0;

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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bills & Payments</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your recurring bills and payments</p>
        </div>
        <Link
          to="/bills/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Bill</span>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 mb-1">Total Due</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">\${totalDue.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1">{upcomingBills} upcoming bills</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 mb-1">Overdue</p>
          <p className={\`text-2xl font-bold \${overdueBills > 0 ? 'text-red-600' : 'text-gray-900 dark:text-white'}\`}>
            {overdueBills} bills
          </p>
          {overdueBills > 0 && (
            <p className="text-xs text-red-500 mt-1">Requires immediate attention</p>
          )}
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 mb-1">Auto-Pay Active</p>
          <p className="text-2xl font-bold text-green-600">
            {bills?.filter((b: Bill) => b.auto_pay).length || 0}
          </p>
          <p className="text-xs text-gray-400 mt-1">Bills paid automatically</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search bills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="overdue">Overdue</option>
          <option value="scheduled">Scheduled</option>
          <option value="paid">Paid</option>
        </select>
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setView('list')}
            className={\`px-3 py-1.5 rounded-md text-sm font-medium transition-colors \${
              view === 'list' ? 'bg-white dark:bg-gray-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }\`}
          >
            List
          </button>
          <button
            onClick={() => setView('calendar')}
            className={\`px-3 py-1.5 rounded-md text-sm font-medium transition-colors \${
              view === 'calendar' ? 'bg-white dark:bg-gray-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }\`}
          >
            <Calendar className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bills List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredBills && filteredBills.length > 0 ? (
            filteredBills.map((bill: Bill) => {
              const CategoryIcon = getCategoryIcon(bill.category);
              const statusConfig = getStatusConfig(bill.status, bill.due_date);
              const StatusIcon = statusConfig.icon;

              return (
                <div
                  key={bill.id}
                  className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-xl">
                    <CategoryIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900 dark:text-white truncate">{bill.payee}</p>
                      {bill.is_recurring && (
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 rounded-full text-xs font-medium">
                          {bill.frequency}
                        </span>
                      )}
                      {bill.auto_pay && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-medium">
                          Auto-pay
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                      <span className="capitalize">{bill.category.replace('_', ' ')}</span>
                      <span>•</span>
                      <span className={\`\${bill.status === 'overdue' ? 'text-red-600 font-medium' : ''}\`}>
                        {formatDueDate(bill.due_date)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">\${bill.amount.toLocaleString()}</p>
                    <span className={\`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium \${statusConfig.color}\`}>
                      <StatusIcon className="w-3 h-3" />
                      {statusConfig.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {bill.status !== 'paid' && (
                      <Link
                        to={\`/bills/\${bill.id}/pay\`}
                        className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                      >
                        Pay
                      </Link>
                    )}
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center text-gray-500">
              <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No bills found</p>
              <p className="text-sm">Add a bill to start tracking your payments</p>
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

export function generateBillPaymentForm(options: BillOptions = {}): string {
  const { componentName = 'BillPaymentForm', endpoint = '/banking/bills' } = options;

  return `import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Loader2, ArrowLeft, Calendar, CreditCard, Building2, Wallet, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface Bill {
  id: string;
  payee: string;
  category: string;
  amount: number;
  due_date: string;
  account_number?: string;
}

interface PaymentAccount {
  id: string;
  name: string;
  type: string;
  balance: number;
  account_number: string;
}

const ${componentName}: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [memo, setMemo] = useState('');
  const [scheduleRecurring, setScheduleRecurring] = useState(false);

  const { data: bill, isLoading: billLoading } = useQuery({
    queryKey: ['bill', id],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + id);
      return response?.data || response;
    },
  });

  const { data: accounts, isLoading: accountsLoading } = useQuery({
    queryKey: ['payment-accounts'],
    queryFn: async () => {
      const response = await api.get<any>('/banking/accounts');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const paymentMutation = useMutation({
    mutationFn: (data: any) => api.post('${endpoint}/' + id + '/pay', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banking-bills'] });
      queryClient.invalidateQueries({ queryKey: ['bill', id] });
      queryClient.invalidateQueries({ queryKey: ['payment-accounts'] });
      toast.success('Payment successful!');
      navigate('/bills');
    },
    onError: () => toast.error('Payment failed. Please try again.'),
  });

  React.useEffect(() => {
    if (bill) {
      setAmount(bill.amount.toString());
    }
  }, [bill]);

  React.useEffect(() => {
    if (accounts && accounts.length > 0 && !selectedAccountId) {
      const primaryAccount = accounts.find((a: PaymentAccount) => a.type === 'checking') || accounts[0];
      setSelectedAccountId(primaryAccount.id);
    }
  }, [accounts, selectedAccountId]);

  const selectedAccount = accounts?.find((a: PaymentAccount) => a.id === selectedAccountId);
  const paymentAmount = parseFloat(amount) || 0;
  const insufficientFunds = selectedAccount && paymentAmount > selectedAccount.balance;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (insufficientFunds) {
      toast.error('Insufficient funds in selected account');
      return;
    }
    paymentMutation.mutate({
      account_id: selectedAccountId,
      amount: paymentAmount,
      payment_date: paymentDate,
      memo,
      schedule_recurring: scheduleRecurring,
    });
  };

  if (billLoading || accountsLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Bill not found</p>
        <Link to="/bills" className="text-blue-600 hover:underline mt-2 inline-block">
          Back to bills
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/bills"
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pay Bill</h1>
          <p className="text-sm text-gray-500">Make a payment to {bill.payee}</p>
        </div>
      </div>

      {/* Bill Summary */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm opacity-80">Payee</p>
            <p className="text-xl font-bold mt-1">{bill.payee}</p>
            {bill.account_number && (
              <p className="text-sm opacity-80 mt-2">Account: •••• {bill.account_number.slice(-4)}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-sm opacity-80">Amount Due</p>
            <p className="text-3xl font-bold mt-1">\${bill.amount.toLocaleString()}</p>
            <p className="text-sm opacity-80 mt-2 flex items-center gap-1 justify-end">
              <Calendar className="w-4 h-4" />
              Due {new Date(bill.due_date).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Payment Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-6">
        {/* From Account */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Pay From
          </label>
          <div className="space-y-2">
            {accounts?.map((account: PaymentAccount) => (
              <button
                key={account.id}
                type="button"
                onClick={() => setSelectedAccountId(account.id)}
                className={\`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-colors \${
                  selectedAccountId === account.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }\`}
              >
                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  {account.type === 'checking' ? (
                    <Building2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  ) : (
                    <Wallet className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  )}
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-gray-900 dark:text-white">{account.name}</p>
                  <p className="text-sm text-gray-500">•••• {account.account_number.slice(-4)}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-white">\${account.balance.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Available</p>
                </div>
                {selectedAccountId === account.id && (
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Payment Amount
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">$</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={\`w-full pl-8 pr-4 py-3 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-lg font-medium \${
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
              Insufficient funds in selected account
            </p>
          )}
          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onClick={() => setAmount(bill.amount.toString())}
              className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Full Amount
            </button>
            <button
              type="button"
              onClick={() => setAmount((bill.amount / 2).toFixed(2))}
              className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Half
            </button>
          </div>
        </div>

        {/* Payment Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Payment Date
          </label>
          <input
            type="date"
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>

        {/* Memo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Memo (Optional)
          </label>
          <input
            type="text"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="Add a note for this payment"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>

        {/* Schedule Recurring */}
        <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <input
            type="checkbox"
            id="schedule-recurring"
            checked={scheduleRecurring}
            onChange={(e) => setScheduleRecurring(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded border-gray-300 dark:border-gray-600"
          />
          <label htmlFor="schedule-recurring" className="text-sm text-gray-700 dark:text-gray-300">
            Set up automatic payments for this bill
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={paymentMutation.isPending || insufficientFunds || paymentAmount <= 0}
          className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
        >
          {paymentMutation.isPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              Pay \${paymentAmount.toLocaleString()}
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
