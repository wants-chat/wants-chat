'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  Wallet,
  User,
  Calendar,
  DollarSign,
  Plus,
  Trash2,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  ArrowUpCircle,
  ArrowDownCircle,
  Save,
  X,
  FileText,
  Building,
  CreditCard,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
} from 'lucide-react';
import { UIConfig } from '../ContextualUI';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import useToolData from '../../hooks/useToolData';
import { type ColumnConfig } from '../../lib/toolDataUtils';

interface TrustAccountToolProps {
  uiConfig?: UIConfig;
}

// Types
type TransactionType = 'deposit' | 'disbursement' | 'transfer' | 'fee' | 'refund' | 'interest';
type TransactionStatus = 'pending' | 'cleared' | 'voided' | 'reconciled';

interface TrustAccount {
  id: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
  balance: number;
  availableBalance: number;
  createdAt: string;
}

interface ClientLedger {
  id: string;
  accountId: string;
  clientId: string;
  clientName: string;
  matterNumber: string;
  matterName: string;
  balance: number;
  createdAt: string;
}

interface TrustTransaction {
  id: string;
  accountId: string;
  ledgerId: string;
  // Transaction Details
  transactionType: TransactionType;
  amount: number;
  date: string;
  checkNumber?: string;
  referenceNumber?: string;
  payee?: string;
  payor?: string;
  description: string;
  // Client/Matter
  clientName: string;
  matterNumber: string;
  matterName: string;
  // Status
  status: TransactionStatus;
  clearedDate?: string;
  reconciledDate?: string;
  reconciledBy?: string;
  // Balance
  runningBalance: number;
  // Metadata
  createdAt: string;
  updatedAt: string;
}

// Constants
const TRANSACTION_TYPES: { value: TransactionType; label: string; icon: React.ReactNode; isCredit: boolean }[] = [
  { value: 'deposit', label: 'Deposit', icon: <ArrowDownCircle className="w-4 h-4 text-green-600" />, isCredit: true },
  { value: 'disbursement', label: 'Disbursement', icon: <ArrowUpCircle className="w-4 h-4 text-red-600" />, isCredit: false },
  { value: 'transfer', label: 'Transfer', icon: <CreditCard className="w-4 h-4 text-blue-600" />, isCredit: false },
  { value: 'fee', label: 'Fee', icon: <DollarSign className="w-4 h-4 text-orange-600" />, isCredit: false },
  { value: 'refund', label: 'Refund', icon: <ArrowDownCircle className="w-4 h-4 text-purple-600" />, isCredit: true },
  { value: 'interest', label: 'Interest', icon: <TrendingUp className="w-4 h-4 text-green-600" />, isCredit: true },
];

const STATUS_OPTIONS: { value: TransactionStatus; label: string; color: string }[] = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'cleared', label: 'Cleared', color: 'bg-green-100 text-green-800' },
  { value: 'voided', label: 'Voided', color: 'bg-red-100 text-red-800' },
  { value: 'reconciled', label: 'Reconciled', color: 'bg-blue-100 text-blue-800' },
];

// Column configuration for exports
const TRANSACTION_COLUMNS: ColumnConfig[] = [
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'transactionType', header: 'Type', type: 'string' },
  { key: 'checkNumber', header: 'Check #', type: 'string' },
  { key: 'clientName', header: 'Client', type: 'string' },
  { key: 'matterNumber', header: 'Matter #', type: 'string' },
  { key: 'description', header: 'Description', type: 'string' },
  { key: 'amount', header: 'Amount', type: 'currency' },
  { key: 'runningBalance', header: 'Balance', type: 'currency' },
  { key: 'status', header: 'Status', type: 'string' },
];

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
};

// Main Component
export const TrustAccountTool: React.FC<TrustAccountToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // useToolData hooks for backend sync
  const {
    data: transactions,
    addItem: addTransaction,
    updateItem: updateTransaction,
    deleteItem: deleteTransaction,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    importCSV,
    importJSON,
    copyToClipboard,
    print,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<TrustTransaction>('trust-transactions', [], TRANSACTION_COLUMNS);

  const {
    data: ledgers,
    addItem: addLedger,
    updateItem: updateLedger,
  } = useToolData<ClientLedger>('trust-ledgers', [], []);

  // Local UI state
  const [activeTab, setActiveTab] = useState<'transactions' | 'ledgers' | 'new'>('transactions');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<TransactionType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<TransactionStatus | 'all'>('all');

  // Account info (would typically come from settings)
  const [accountInfo] = useState({
    accountName: 'IOLTA Trust Account',
    accountNumber: '****4567',
    bankName: 'First National Bank',
  });

  // New transaction form state
  const [newTransaction, setNewTransaction] = useState<Partial<TrustTransaction>>({
    transactionType: 'deposit',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    clientName: '',
    matterNumber: '',
    matterName: '',
    description: '',
    status: 'pending',
  });

  // Calculate total balance
  const totalBalance = useMemo(() => {
    return transactions.reduce((sum, t) => {
      if (t.status === 'voided') return sum;
      const type = TRANSACTION_TYPES.find((tt) => tt.value === t.transactionType);
      return type?.isCredit ? sum + t.amount : sum - t.amount;
    }, 0);
  }, [transactions]);

  // Client ledger balances
  const clientBalances = useMemo(() => {
    const balances: Record<string, { clientName: string; matterNumber: string; balance: number }> = {};
    transactions
      .filter((t) => t.status !== 'voided')
      .forEach((t) => {
        const key = `${t.clientName}-${t.matterNumber}`;
        if (!balances[key]) {
          balances[key] = { clientName: t.clientName, matterNumber: t.matterNumber, balance: 0 };
        }
        const type = TRANSACTION_TYPES.find((tt) => tt.value === t.transactionType);
        if (type?.isCredit) {
          balances[key].balance += t.amount;
        } else {
          balances[key].balance -= t.amount;
        }
      });
    return Object.values(balances).sort((a, b) => b.balance - a.balance);
  }, [transactions]);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => {
        const matchesSearch =
          searchTerm === '' ||
          t.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.matterNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.checkNumber?.includes(searchTerm);

        const matchesType = filterType === 'all' || t.transactionType === filterType;
        const matchesStatus = filterStatus === 'all' || t.status === filterStatus;

        return matchesSearch && matchesType && matchesStatus;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, searchTerm, filterType, filterStatus]);

  // Statistics
  const stats = useMemo(() => {
    const pending = transactions.filter((t) => t.status === 'pending').length;
    const depositsThisMonth = transactions
      .filter((t) => {
        const date = new Date(t.date);
        const now = new Date();
        return (
          date.getMonth() === now.getMonth() &&
          date.getFullYear() === now.getFullYear() &&
          t.transactionType === 'deposit' &&
          t.status !== 'voided'
        );
      })
      .reduce((sum, t) => sum + t.amount, 0);
    const disbursementsThisMonth = transactions
      .filter((t) => {
        const date = new Date(t.date);
        const now = new Date();
        return (
          date.getMonth() === now.getMonth() &&
          date.getFullYear() === now.getFullYear() &&
          t.transactionType === 'disbursement' &&
          t.status !== 'voided'
        );
      })
      .reduce((sum, t) => sum + t.amount, 0);
    const clientCount = new Set(transactions.map((t) => t.clientName)).size;

    return { pending, depositsThisMonth, disbursementsThisMonth, clientCount };
  }, [transactions]);

  // Handlers
  const handleCreateTransaction = () => {
    if (!newTransaction.clientName || !newTransaction.amount || !newTransaction.description) {
      setValidationMessage('Please fill in required fields (Client Name, Amount, Description)');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    // Calculate running balance
    const type = TRANSACTION_TYPES.find((tt) => tt.value === newTransaction.transactionType);
    const adjustedAmount = type?.isCredit ? newTransaction.amount : -newTransaction.amount!;
    const newBalance = totalBalance + adjustedAmount;

    const transaction: TrustTransaction = {
      id: generateId(),
      accountId: 'main',
      ledgerId: generateId(),
      transactionType: newTransaction.transactionType || 'deposit',
      amount: newTransaction.amount || 0,
      date: newTransaction.date || new Date().toISOString().split('T')[0],
      checkNumber: newTransaction.checkNumber,
      referenceNumber: newTransaction.referenceNumber,
      payee: newTransaction.payee,
      payor: newTransaction.payor,
      description: newTransaction.description || '',
      clientName: newTransaction.clientName || '',
      matterNumber: newTransaction.matterNumber || '',
      matterName: newTransaction.matterName || '',
      status: 'pending',
      runningBalance: newBalance,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addTransaction(transaction);
    resetForm();
    setActiveTab('transactions');
  };

  const resetForm = () => {
    setNewTransaction({
      transactionType: 'deposit',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      clientName: '',
      matterNumber: '',
      matterName: '',
      description: '',
      status: 'pending',
    });
  };

  const handleClearTransaction = (id: string) => {
    updateTransaction(id, {
      status: 'cleared',
      clearedDate: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  };

  const handleVoidTransaction = async (id: string) => {
    const confirmed = await confirm('Are you sure you want to void this transaction?');
    if (confirmed) {
      updateTransaction(id, {
        status: 'voided',
        updatedAt: new Date().toISOString(),
      });
    }
  };

  const getStatusBadge = (status: TransactionStatus) => {
    const option = STATUS_OPTIONS.find((s) => s.value === status);
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${option?.color}`}>
        {option?.label}
      </span>
    );
  };

  const getTransactionIcon = (type: TransactionType) => {
    return TRANSACTION_TYPES.find((t) => t.value === type)?.icon;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-100 rounded-xl">
                <Wallet className="w-8 h-8 text-emerald-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{t('tools.trustAccount.trustAccount', 'Trust Account')}</h1>
                <p className="text-gray-600">{t('tools.trustAccount.manageIoltaTrustAccountTransactions', 'Manage IOLTA/Trust account transactions')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="trust-account" toolName="Trust Account" />

              <SyncStatus
                isSynced={isSynced}
                isSaving={isSaving}
                lastSaved={lastSaved}
                syncError={syncError}
                onForceSync={forceSync}
              />
              <ExportDropdown
                onExportCSV={exportCSV}
                onExportExcel={exportExcel}
                onExportJSON={exportJSON}
                onExportPDF={exportPDF}
                onPrint={print}
                onCopyToClipboard={copyToClipboard}
                onImportCSV={importCSV}
                onImportJSON={importJSON}
              />
            </div>
          </div>

          {/* Account Info */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg mb-4">
            <Building className="w-6 h-6 text-gray-500" />
            <div>
              <div className="font-medium text-gray-900">{accountInfo.accountName}</div>
              <div className="text-sm text-gray-500">
                {accountInfo.bankName} | Account: {accountInfo.accountNumber}
              </div>
            </div>
            <div className="ml-auto text-right">
              <div className="text-sm text-gray-500">{t('tools.trustAccount.currentBalance', 'Current Balance')}</div>
              <div className={`text-2xl font-bold ${totalBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(totalBalance)}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.depositsThisMonth)}</div>
              <div className="text-sm text-gray-600">{t('tools.trustAccount.depositsMtd', 'Deposits (MTD)')}</div>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-red-600">{formatCurrency(stats.disbursementsThisMonth)}</div>
              <div className="text-sm text-gray-600">{t('tools.trustAccount.disbursementsMtd', 'Disbursements (MTD)')}</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-gray-600">{t('tools.trustAccount.pending', 'Pending')}</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.clientCount}</div>
              <div className="text-sm text-gray-600">{t('tools.trustAccount.clientLedgers', 'Client Ledgers')}</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('transactions')}
              className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                activeTab === 'transactions'
                  ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              {t('tools.trustAccount.transactions', 'Transactions')}
            </button>
            <button
              onClick={() => setActiveTab('ledgers')}
              className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                activeTab === 'ledgers'
                  ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <User className="w-4 h-4 inline mr-2" />
              {t('tools.trustAccount.clientLedgers2', 'Client Ledgers')}
            </button>
            <button
              onClick={() => setActiveTab('new')}
              className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                activeTab === 'new'
                  ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Plus className="w-4 h-4 inline mr-2" />
              {t('tools.trustAccount.newTransaction', 'New Transaction')}
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'transactions' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            {/* Search and Filters */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder={t('tools.trustAccount.searchByClientMatterOr', 'Search by client, matter, or check #...')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as TransactionType | 'all')}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="all">{t('tools.trustAccount.allTypes', 'All Types')}</option>
                  {TRANSACTION_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as TransactionStatus | 'all')}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="all">{t('tools.trustAccount.allStatuses', 'All Statuses')}</option>
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Transaction List */}
            <div className="divide-y divide-gray-200">
              {filteredTransactions.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Wallet className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>{t('tools.trustAccount.noTransactionsFound', 'No transactions found')}</p>
                </div>
              ) : (
                filteredTransactions.map((transaction) => {
                  const type = TRANSACTION_TYPES.find((t) => t.value === transaction.transactionType);
                  return (
                    <div key={transaction.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            {getTransactionIcon(transaction.transactionType)}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {transaction.clientName}
                              {transaction.matterNumber && ` - ${transaction.matterNumber}`}
                            </div>
                            <div className="text-sm text-gray-500">{transaction.description}</div>
                            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                              <Calendar className="w-3 h-3" />
                              {formatDate(transaction.date)}
                              {transaction.checkNumber && (
                                <>
                                  <span className="mx-1">|</span>
                                  Check #{transaction.checkNumber}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className={`font-bold ${type?.isCredit ? 'text-green-600' : 'text-red-600'}`}>
                              {type?.isCredit ? '+' : '-'}{formatCurrency(transaction.amount)}
                            </div>
                            <div className="text-xs text-gray-500">
                              Bal: {formatCurrency(transaction.runningBalance)}
                            </div>
                          </div>
                          {getStatusBadge(transaction.status)}
                          <div className="flex items-center gap-1">
                            {transaction.status === 'pending' && (
                              <button
                                onClick={() => handleClearTransaction(transaction.id)}
                                className="p-1 text-green-600 hover:bg-green-50 rounded"
                                title={t('tools.trustAccount.markAsCleared', 'Mark as Cleared')}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
                            {transaction.status !== 'voided' && (
                              <button
                                onClick={() => handleVoidTransaction(transaction.id)}
                                className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
                                title={t('tools.trustAccount.voidTransaction', 'Void Transaction')}
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {activeTab === 'ledgers' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">{t('tools.trustAccount.clientLedgerBalances', 'Client Ledger Balances')}</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {clientBalances.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>{t('tools.trustAccount.noClientLedgersFound', 'No client ledgers found')}</p>
                </div>
              ) : (
                clientBalances.map((ledger, idx) => (
                  <div key={idx} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-gray-100 rounded-full">
                          <User className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{ledger.clientName}</div>
                          {ledger.matterNumber && (
                            <div className="text-sm text-gray-500">Matter: {ledger.matterNumber}</div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className={`text-xl font-bold ${ledger.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(ledger.balance)}
                        </div>
                        {ledger.balance < 0 && (
                          <AlertTriangle className="w-5 h-5 text-red-500" title={t('tools.trustAccount.negativeBalance', 'Negative Balance')} />
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'new' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('tools.trustAccount.newTrustTransaction', 'New Trust Transaction')}</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.trustAccount.transactionType', 'Transaction Type')}</label>
                <select
                  value={newTransaction.transactionType || 'deposit'}
                  onChange={(e) => setNewTransaction({ ...newTransaction, transactionType: e.target.value as TransactionType })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                >
                  {TRANSACTION_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newTransaction.amount || ''}
                  onChange={(e) => setNewTransaction({ ...newTransaction, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.trustAccount.date', 'Date')}</label>
                <input
                  type="date"
                  value={newTransaction.date || ''}
                  onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newTransaction.clientName || ''}
                  onChange={(e) => setNewTransaction({ ...newTransaction, clientName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.trustAccount.matterNumber', 'Matter Number')}</label>
                <input
                  type="text"
                  value={newTransaction.matterNumber || ''}
                  onChange={(e) => setNewTransaction({ ...newTransaction, matterNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.trustAccount.matterName', 'Matter Name')}</label>
                <input
                  type="text"
                  value={newTransaction.matterName || ''}
                  onChange={(e) => setNewTransaction({ ...newTransaction, matterName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              {newTransaction.transactionType === 'disbursement' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.trustAccount.checkNumber', 'Check Number')}</label>
                    <input
                      type="text"
                      value={newTransaction.checkNumber || ''}
                      onChange={(e) => setNewTransaction({ ...newTransaction, checkNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.trustAccount.payee', 'Payee')}</label>
                    <input
                      type="text"
                      value={newTransaction.payee || ''}
                      onChange={(e) => setNewTransaction({ ...newTransaction, payee: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </>
              )}
              {newTransaction.transactionType === 'deposit' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.trustAccount.payor', 'Payor')}</label>
                  <input
                    type="text"
                    value={newTransaction.payor || ''}
                    onChange={(e) => setNewTransaction({ ...newTransaction, payor: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.trustAccount.referenceNumber', 'Reference Number')}</label>
                <input
                  type="text"
                  value={newTransaction.referenceNumber || ''}
                  onChange={(e) => setNewTransaction({ ...newTransaction, referenceNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={newTransaction.description || ''}
                  onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  placeholder={t('tools.trustAccount.describeTheTransaction', 'Describe the transaction...')}
                />
              </div>
            </div>

            {/* Preview */}
            {newTransaction.amount && newTransaction.amount > 0 && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="text-gray-600">
                    {TRANSACTION_TYPES.find((t) => t.value === newTransaction.transactionType)?.isCredit
                      ? t('tools.trustAccount.deposit', 'Deposit') : t('tools.trustAccount.disbursement', 'Disbursement')}{' '}
                    Amount:
                  </div>
                  <div
                    className={`text-xl font-bold ${
                      TRANSACTION_TYPES.find((t) => t.value === newTransaction.transactionType)?.isCredit
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {TRANSACTION_TYPES.find((t) => t.value === newTransaction.transactionType)?.isCredit ? '+' : '-'}
                    {formatCurrency(newTransaction.amount)}
                  </div>
                </div>
              </div>
            )}

            {/* Submit */}
            <div className="flex justify-end gap-4">
              <button onClick={resetForm} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                {t('tools.trustAccount.reset', 'Reset')}
              </button>
              <button
                onClick={handleCreateTransaction}
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {t('tools.trustAccount.recordTransaction', 'Record Transaction')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog />

      {/* Validation Message Toast */}
      {validationMessage && (
        <div className="fixed bottom-4 right-4 z-50 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
          {validationMessage}
        </div>
      )}
    </div>
  );
};

export default TrustAccountTool;
