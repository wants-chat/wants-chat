'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  Receipt,
  Plus,
  Trash2,
  Calendar,
  TrendingUp,
  TrendingDown,
  Zap,
  Droplet,
  Flame,
  Wifi,
  DollarSign,
  BarChart3,
  Clock,
  AlertTriangle,
  CheckCircle,
  Edit2,
  FileText,
  Filter,
  Download,
} from 'lucide-react';
import { UIConfig } from '../ContextualUI';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import useToolData from '../../hooks/useToolData';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';
import { useTheme } from '@/contexts/ThemeContext';

interface UtilityBillToolProps {
  uiConfig?: UIConfig;
}

type UtilityType = 'electric' | 'gas' | 'water' | 'internet' | 'trash' | 'sewer' | 'other';
type PaymentStatus = 'pending' | 'paid' | 'overdue' | 'scheduled';

interface UtilityBill {
  id: string;
  utilityType: UtilityType;
  provider: string;
  accountNumber: string;
  billingPeriodStart: string;
  billingPeriodEnd: string;
  dueDate: string;
  amount: number;
  usage: number;
  usageUnit: string;
  previousBalance: number;
  lateFee: number;
  taxes: number;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  paymentDate: string | null;
  paymentMethod: string;
  confirmationNumber: string;
  notes: string;
  createdAt: string;
}

interface UtilityAccount {
  id: string;
  utilityType: UtilityType;
  provider: string;
  accountNumber: string;
  serviceAddress: string;
  billingAddress: string;
  autopay: boolean;
  paperless: boolean;
  customerServicePhone: string;
  website: string;
  notes: string;
  createdAt: string;
}

const UTILITY_TYPE_CONFIG = {
  electric: {
    label: 'Electric',
    icon: Zap,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
    defaultUnit: 'kWh',
  },
  gas: {
    label: 'Gas',
    icon: Flame,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    defaultUnit: 'therms',
  },
  water: {
    label: 'Water',
    icon: Droplet,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    defaultUnit: 'gallons',
  },
  internet: {
    label: 'Internet',
    icon: Wifi,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    defaultUnit: 'GB',
  },
  trash: {
    label: 'Trash',
    icon: Receipt,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    defaultUnit: 'service',
  },
  sewer: {
    label: 'Sewer',
    icon: Droplet,
    color: 'text-teal-500',
    bgColor: 'bg-teal-500/10',
    defaultUnit: 'gallons',
  },
  other: {
    label: 'Other',
    icon: FileText,
    color: 'text-gray-500',
    bgColor: 'bg-gray-500/10',
    defaultUnit: 'units',
  },
};

const PAYMENT_STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'text-yellow-500', bgColor: 'bg-yellow-500/10' },
  paid: { label: 'Paid', color: 'text-green-500', bgColor: 'bg-green-500/10' },
  overdue: { label: 'Overdue', color: 'text-red-500', bgColor: 'bg-red-500/10' },
  scheduled: { label: 'Scheduled', color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
};

// Column configurations for exports
const BILL_COLUMNS: ColumnConfig[] = [
  { key: 'utilityType', header: 'Utility', type: 'string' },
  { key: 'provider', header: 'Provider', type: 'string' },
  { key: 'billingPeriodStart', header: 'Period Start', type: 'date' },
  { key: 'billingPeriodEnd', header: 'Period End', type: 'date' },
  { key: 'dueDate', header: 'Due Date', type: 'date' },
  { key: 'amount', header: 'Amount', type: 'currency' },
  { key: 'usage', header: 'Usage', type: 'number' },
  { key: 'usageUnit', header: 'Unit', type: 'string' },
  { key: 'totalAmount', header: 'Total', type: 'currency' },
  { key: 'paymentStatus', header: 'Status', type: 'string' },
];

const ACCOUNT_COLUMNS: ColumnConfig[] = [
  { key: 'utilityType', header: 'Utility', type: 'string' },
  { key: 'provider', header: 'Provider', type: 'string' },
  { key: 'accountNumber', header: 'Account #', type: 'string' },
  { key: 'serviceAddress', header: 'Service Address', type: 'string' },
  { key: 'autopay', header: 'Autopay', type: 'string' },
  { key: 'customerServicePhone', header: 'Phone', type: 'string' },
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
    maximumFractionDigits: 2,
  }).format(amount);
};

const formatNumber = (num: number, decimals = 0) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
};

const isOverdue = (dueDate: string, status: PaymentStatus): boolean => {
  if (status === 'paid') return false;
  return new Date(dueDate) < new Date();
};

export const UtilityBillTool: React.FC<UtilityBillToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // useToolData hooks for backend sync
  const {
    data: bills,
    addItem: addBillToBackend,
    updateItem: updateBillBackend,
    deleteItem: deleteBillBackend,
    isSynced: billsSynced,
    isSaving: billsSaving,
    lastSaved: billsLastSaved,
    syncError: billsSyncError,
    forceSync: forceBillsSync,
  } = useToolData<UtilityBill>('utility-bills', [], BILL_COLUMNS);

  const {
    data: accounts,
    addItem: addAccountToBackend,
    updateItem: updateAccountBackend,
    deleteItem: deleteAccountBackend,
    isSynced: accountsSynced,
    isSaving: accountsSaving,
    lastSaved: accountsLastSaved,
    syncError: accountsSyncError,
    forceSync: forceAccountsSync,
  } = useToolData<UtilityAccount>('utility-accounts', [], ACCOUNT_COLUMNS);

  // Local UI State
  const [activeTab, setActiveTab] = useState<'bills' | 'accounts' | 'analytics'>('bills');
  const [showBillForm, setShowBillForm] = useState(false);
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [filterType, setFilterType] = useState<UtilityType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<PaymentStatus | 'all'>('all');
  const [dateRange, setDateRange] = useState<'month' | 'quarter' | 'year' | 'all'>('year');
  const [editingBillId, setEditingBillId] = useState<string | null>(null);

  // Form states
  const [newBill, setNewBill] = useState<Partial<UtilityBill>>({
    utilityType: 'electric',
    provider: '',
    accountNumber: '',
    billingPeriodStart: '',
    billingPeriodEnd: '',
    dueDate: '',
    amount: 0,
    usage: 0,
    usageUnit: 'kWh',
    previousBalance: 0,
    lateFee: 0,
    taxes: 0,
    paymentStatus: 'pending',
    paymentDate: null,
    paymentMethod: '',
    confirmationNumber: '',
    notes: '',
  });

  const [newAccount, setNewAccount] = useState<Partial<UtilityAccount>>({
    utilityType: 'electric',
    provider: '',
    accountNumber: '',
    serviceAddress: '',
    billingAddress: '',
    autopay: false,
    paperless: false,
    customerServicePhone: '',
    website: '',
    notes: '',
  });

  // Filter and sort bills
  const filteredBills = useMemo(() => {
    let result = [...bills];

    // Filter by type
    if (filterType !== 'all') {
      result = result.filter(b => b.utilityType === filterType);
    }

    // Filter by status
    if (filterStatus !== 'all') {
      result = result.filter(b => b.paymentStatus === filterStatus);
    }

    // Filter by date range
    const now = new Date();
    if (dateRange !== 'all') {
      const cutoff = new Date();
      if (dateRange === 'month') cutoff.setMonth(cutoff.getMonth() - 1);
      else if (dateRange === 'quarter') cutoff.setMonth(cutoff.getMonth() - 3);
      else if (dateRange === 'year') cutoff.setFullYear(cutoff.getFullYear() - 1);

      result = result.filter(b => new Date(b.billingPeriodEnd) >= cutoff);
    }

    // Sort by due date (most recent first)
    return result.sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
  }, [bills, filterType, filterStatus, dateRange]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalPaid = bills.filter(b => b.paymentStatus === 'paid').reduce((acc, b) => acc + b.totalAmount, 0);
    const totalPending = bills.filter(b => b.paymentStatus === 'pending' || b.paymentStatus === 'scheduled')
      .reduce((acc, b) => acc + b.totalAmount, 0);
    const totalOverdue = bills.filter(b => b.paymentStatus === 'overdue' || isOverdue(b.dueDate, b.paymentStatus))
      .reduce((acc, b) => acc + b.totalAmount, 0);

    // Calculate by utility type
    const byType: Record<UtilityType, { total: number; count: number; avgMonthly: number }> = {
      electric: { total: 0, count: 0, avgMonthly: 0 },
      gas: { total: 0, count: 0, avgMonthly: 0 },
      water: { total: 0, count: 0, avgMonthly: 0 },
      internet: { total: 0, count: 0, avgMonthly: 0 },
      trash: { total: 0, count: 0, avgMonthly: 0 },
      sewer: { total: 0, count: 0, avgMonthly: 0 },
      other: { total: 0, count: 0, avgMonthly: 0 },
    };

    bills.forEach(bill => {
      byType[bill.utilityType].total += bill.totalAmount;
      byType[bill.utilityType].count += 1;
    });

    Object.keys(byType).forEach(type => {
      const t = type as UtilityType;
      if (byType[t].count > 0) {
        byType[t].avgMonthly = byType[t].total / byType[t].count;
      }
    });

    // Monthly trend
    const monthlyTotals: Record<string, number> = {};
    bills.forEach(bill => {
      const month = bill.billingPeriodEnd.substring(0, 7);
      monthlyTotals[month] = (monthlyTotals[month] || 0) + bill.totalAmount;
    });

    const monthKeys = Object.keys(monthlyTotals).sort();
    const avgMonthly = monthKeys.length > 0
      ? Object.values(monthlyTotals).reduce((a, b) => a + b, 0) / monthKeys.length
      : 0;

    return {
      totalPaid,
      totalPending,
      totalOverdue,
      byType,
      avgMonthly,
      monthlyTotals,
      billCount: bills.length,
      overdueCount: bills.filter(b => b.paymentStatus === 'overdue' || isOverdue(b.dueDate, b.paymentStatus)).length,
    };
  }, [bills]);

  // Upcoming bills (next 30 days)
  const upcomingBills = useMemo(() => {
    const now = new Date();
    const thirtyDays = new Date();
    thirtyDays.setDate(thirtyDays.getDate() + 30);

    return bills
      .filter(b => {
        const dueDate = new Date(b.dueDate);
        return b.paymentStatus !== 'paid' && dueDate >= now && dueDate <= thirtyDays;
      })
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [bills]);

  // Add bill
  const addBill = () => {
    if (!newBill.provider || !newBill.dueDate) {
      setValidationMessage('Please enter provider and due date');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const baseAmount = newBill.amount || 0;
    const totalAmount = baseAmount + (newBill.previousBalance || 0) + (newBill.lateFee || 0) + (newBill.taxes || 0);

    const bill: UtilityBill = {
      id: generateId(),
      utilityType: newBill.utilityType || 'electric',
      provider: newBill.provider || '',
      accountNumber: newBill.accountNumber || '',
      billingPeriodStart: newBill.billingPeriodStart || '',
      billingPeriodEnd: newBill.billingPeriodEnd || '',
      dueDate: newBill.dueDate || '',
      amount: baseAmount,
      usage: newBill.usage || 0,
      usageUnit: newBill.usageUnit || UTILITY_TYPE_CONFIG[newBill.utilityType || 'electric'].defaultUnit,
      previousBalance: newBill.previousBalance || 0,
      lateFee: newBill.lateFee || 0,
      taxes: newBill.taxes || 0,
      totalAmount,
      paymentStatus: newBill.paymentStatus || 'pending',
      paymentDate: newBill.paymentDate || null,
      paymentMethod: newBill.paymentMethod || '',
      confirmationNumber: newBill.confirmationNumber || '',
      notes: newBill.notes || '',
      createdAt: new Date().toISOString(),
    };

    addBillToBackend(bill);
    setShowBillForm(false);
    resetBillForm();
  };

  const resetBillForm = () => {
    setNewBill({
      utilityType: 'electric',
      provider: '',
      accountNumber: '',
      billingPeriodStart: '',
      billingPeriodEnd: '',
      dueDate: '',
      amount: 0,
      usage: 0,
      usageUnit: 'kWh',
      previousBalance: 0,
      lateFee: 0,
      taxes: 0,
      paymentStatus: 'pending',
      paymentDate: null,
      paymentMethod: '',
      confirmationNumber: '',
      notes: '',
    });
  };

  // Mark bill as paid
  const markAsPaid = (billId: string) => {
    updateBillBackend(billId, {
      paymentStatus: 'paid',
      paymentDate: new Date().toISOString().split('T')[0],
    });
  };

  // Delete bill
  const deleteBill = async (billId: string) => {
    const confirmed = await confirm('Are you sure you want to delete this bill?');
    if (confirmed) {
      deleteBillBackend(billId);
    }
  };

  // Add account
  const addAccount = () => {
    if (!newAccount.provider || !newAccount.accountNumber) {
      setValidationMessage('Please enter provider and account number');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const account: UtilityAccount = {
      id: generateId(),
      utilityType: newAccount.utilityType || 'electric',
      provider: newAccount.provider || '',
      accountNumber: newAccount.accountNumber || '',
      serviceAddress: newAccount.serviceAddress || '',
      billingAddress: newAccount.billingAddress || '',
      autopay: newAccount.autopay || false,
      paperless: newAccount.paperless || false,
      customerServicePhone: newAccount.customerServicePhone || '',
      website: newAccount.website || '',
      notes: newAccount.notes || '',
      createdAt: new Date().toISOString(),
    };

    addAccountToBackend(account);
    setShowAccountForm(false);
    setNewAccount({
      utilityType: 'electric',
      provider: '',
      accountNumber: '',
      serviceAddress: '',
      billingAddress: '',
      autopay: false,
      paperless: false,
      customerServicePhone: '',
      website: '',
      notes: '',
    });
  };

  // Delete account
  const deleteAccount = async (accountId: string) => {
    const confirmed = await confirm('Are you sure you want to delete this account?');
    if (confirmed) {
      deleteAccountBackend(accountId);
    }
  };

  const isSynced = billsSynced && accountsSynced;
  const isSaving = billsSaving || accountsSaving;

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <Receipt className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.utilityBill.utilityBillManager', 'Utility Bill Manager')}
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.utilityBill.trackAndManageAllYour', 'Track and manage all your utility bills')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="utility-bill" toolName="Utility Bill" />

              <SyncStatus
                isSynced={isSynced}
                isSaving={isSaving}
                lastSaved={billsLastSaved || accountsLastSaved}
                syncError={billsSyncError || accountsSyncError}
                onForceSync={() => { forceBillsSync(); forceAccountsSync(); }}
                theme={theme}
                showLabel={true}
                size="md"
              />
              <ExportDropdown
                onExportCSV={() => exportToCSV(filteredBills, BILL_COLUMNS, 'utility-bills')}
                onExportExcel={() => exportToExcel(filteredBills, BILL_COLUMNS, 'utility-bills')}
                onExportJSON={() => exportToJSON({ bills, accounts }, 'utility-data')}
                onExportPDF={() => exportToPDF(filteredBills, BILL_COLUMNS, 'Utility Bills')}
                onCopy={() => copyUtil(filteredBills, BILL_COLUMNS)}
                onPrint={() => printData(filteredBills, BILL_COLUMNS, 'Utility Bills')}
                theme={theme}
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            {['bills', 'accounts', 'analytics'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as typeof activeTab)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-[#0D9488] text-white'
                    : theme === 'dark'
                    ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Overdue Alert */}
        {stats.overdueCount > 0 && (
          <div className={`mb-6 p-4 rounded-lg border-l-4 border-red-500 ${
            theme === 'dark' ? 'bg-red-900/20' : 'bg-red-50'
          }`}>
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              <div>
                <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {stats.overdueCount} Overdue Bill{stats.overdueCount !== 1 ? 's' : ''}
                </h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Total overdue: {formatCurrency(stats.totalOverdue)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4`}>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.utilityBill.paid', 'Paid')}</span>
            </div>
            <p className={`text-2xl font-bold text-green-500`}>
              {formatCurrency(stats.totalPaid)}
            </p>
          </div>
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4`}>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <Clock className="w-5 h-5 text-yellow-500" />
              </div>
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.utilityBill.pending', 'Pending')}</span>
            </div>
            <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {formatCurrency(stats.totalPending)}
            </p>
          </div>
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4`}>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-red-500/10">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.utilityBill.overdue', 'Overdue')}</span>
            </div>
            <p className={`text-2xl font-bold text-red-500`}>
              {formatCurrency(stats.totalOverdue)}
            </p>
          </div>
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4`}>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <BarChart3 className="w-5 h-5 text-blue-500" />
              </div>
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.utilityBill.avgMonthly', 'Avg. Monthly')}</span>
            </div>
            <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {formatCurrency(stats.avgMonthly)}
            </p>
          </div>
        </div>

        {/* Upcoming Bills */}
        {upcomingBills.length > 0 && activeTab === 'bills' && (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4 mb-6`}>
            <h3 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.utilityBill.upcomingDueDates', 'Upcoming Due Dates')}
            </h3>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {upcomingBills.slice(0, 5).map((bill) => {
                const config = UTILITY_TYPE_CONFIG[bill.utilityType];
                const UtilityIcon = config.icon;
                const daysUntil = Math.ceil((new Date(bill.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

                return (
                  <div
                    key={bill.id}
                    className={`flex-shrink-0 p-3 rounded-lg border ${
                      daysUntil <= 3
                        ? theme === 'dark' ? 'bg-red-900/20 border-red-500/30' : 'bg-red-50 border-red-200'
                        : theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <UtilityIcon className={`w-4 h-4 ${config.color}`} />
                      <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {bill.provider}
                      </span>
                    </div>
                    <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {formatCurrency(bill.totalAmount)}
                    </p>
                    <p className={`text-sm ${daysUntil <= 3 ? 'text-red-500' : theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Due in {daysUntil} day{daysUntil !== 1 ? 's' : ''}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Bills Tab */}
        {activeTab === 'bills' && (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as UtilityType | 'all')}
                  className={`px-3 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="all">{t('tools.utilityBill.allUtilities', 'All Utilities')}</option>
                  {Object.entries(UTILITY_TYPE_CONFIG).map(([key, config]) => (
                    <option key={key} value={key}>{config.label}</option>
                  ))}
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as PaymentStatus | 'all')}
                  className={`px-3 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="all">{t('tools.utilityBill.allStatus', 'All Status')}</option>
                  <option value="pending">{t('tools.utilityBill.pending2', 'Pending')}</option>
                  <option value="paid">{t('tools.utilityBill.paid2', 'Paid')}</option>
                  <option value="overdue">{t('tools.utilityBill.overdue2', 'Overdue')}</option>
                  <option value="scheduled">{t('tools.utilityBill.scheduled', 'Scheduled')}</option>
                </select>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value as typeof dateRange)}
                  className={`px-3 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="month">{t('tools.utilityBill.lastMonth', 'Last Month')}</option>
                  <option value="quarter">{t('tools.utilityBill.lastQuarter', 'Last Quarter')}</option>
                  <option value="year">{t('tools.utilityBill.lastYear', 'Last Year')}</option>
                  <option value="all">{t('tools.utilityBill.allTime', 'All Time')}</option>
                </select>
              </div>
              <button
                onClick={() => setShowBillForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90"
              >
                <Plus className="w-4 h-4" />
                {t('tools.utilityBill.addBill', 'Add Bill')}
              </button>
            </div>

            {/* Add Bill Form */}
            {showBillForm && (
              <div className={`mb-6 p-4 rounded-lg border ${
                theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
              }`}>
                <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.utilityBill.addNewBill', 'Add New Bill')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <select
                    value={newBill.utilityType}
                    onChange={(e) => {
                      const type = e.target.value as UtilityType;
                      setNewBill({
                        ...newBill,
                        utilityType: type,
                        usageUnit: UTILITY_TYPE_CONFIG[type].defaultUnit
                      });
                    }}
                    className={`px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    {Object.entries(UTILITY_TYPE_CONFIG).map(([key, config]) => (
                      <option key={key} value={key}>{config.label}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder={t('tools.utilityBill.provider', 'Provider')}
                    value={newBill.provider}
                    onChange={(e) => setNewBill({ ...newBill, provider: e.target.value })}
                    className={`px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                  <input
                    type="text"
                    placeholder={t('tools.utilityBill.accountNumber', 'Account Number')}
                    value={newBill.accountNumber}
                    onChange={(e) => setNewBill({ ...newBill, accountNumber: e.target.value })}
                    className={`px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                  <input
                    type="date"
                    placeholder={t('tools.utilityBill.dueDate', 'Due Date')}
                    value={newBill.dueDate}
                    onChange={(e) => setNewBill({ ...newBill, dueDate: e.target.value })}
                    className={`px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                  <input
                    type="date"
                    placeholder={t('tools.utilityBill.billingPeriodStart', 'Billing Period Start')}
                    value={newBill.billingPeriodStart}
                    onChange={(e) => setNewBill({ ...newBill, billingPeriodStart: e.target.value })}
                    className={`px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                  <input
                    type="date"
                    placeholder={t('tools.utilityBill.billingPeriodEnd', 'Billing Period End')}
                    value={newBill.billingPeriodEnd}
                    onChange={(e) => setNewBill({ ...newBill, billingPeriodEnd: e.target.value })}
                    className={`px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                  <input
                    type="number"
                    placeholder={t('tools.utilityBill.amount', 'Amount ($)')}
                    value={newBill.amount || ''}
                    onChange={(e) => setNewBill({ ...newBill, amount: parseFloat(e.target.value) || 0 })}
                    className={`px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                  <input
                    type="number"
                    placeholder={`Usage (${newBill.usageUnit})`}
                    value={newBill.usage || ''}
                    onChange={(e) => setNewBill({ ...newBill, usage: parseFloat(e.target.value) || 0 })}
                    className={`px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                  <input
                    type="number"
                    placeholder={t('tools.utilityBill.previousBalance', 'Previous Balance ($)')}
                    value={newBill.previousBalance || ''}
                    onChange={(e) => setNewBill({ ...newBill, previousBalance: parseFloat(e.target.value) || 0 })}
                    className={`px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                  <input
                    type="number"
                    placeholder={t('tools.utilityBill.taxes', 'Taxes ($)')}
                    value={newBill.taxes || ''}
                    onChange={(e) => setNewBill({ ...newBill, taxes: parseFloat(e.target.value) || 0 })}
                    className={`px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    onClick={() => { setShowBillForm(false); resetBillForm(); }}
                    className={`px-4 py-2 rounded-lg ${
                      theme === 'dark' ? 'text-gray-300 hover:bg-gray-600' : 'text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {t('tools.utilityBill.cancel', 'Cancel')}
                  </button>
                  <button
                    onClick={addBill}
                    className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90"
                  >
                    {t('tools.utilityBill.addBill2', 'Add Bill')}
                  </button>
                </div>
              </div>
            )}

            {/* Bills List */}
            {filteredBills.length === 0 ? (
              <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <Receipt className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{t('tools.utilityBill.noBillsFound', 'No bills found')}</p>
                <p className="text-sm mt-2">{t('tools.utilityBill.addYourUtilityBillsTo', 'Add your utility bills to start tracking')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredBills.map((bill) => {
                  const config = UTILITY_TYPE_CONFIG[bill.utilityType];
                  const statusConfig = PAYMENT_STATUS_CONFIG[bill.paymentStatus];
                  const UtilityIcon = config.icon;
                  const isOverdueNow = isOverdue(bill.dueDate, bill.paymentStatus);

                  return (
                    <div
                      key={bill.id}
                      className={`p-4 rounded-lg border ${
                        isOverdueNow
                          ? theme === 'dark' ? 'bg-red-900/10 border-red-500/30' : 'bg-red-50 border-red-200'
                          : theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg ${config.bgColor}`}>
                            <UtilityIcon className={`w-5 h-5 ${config.color}`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {bill.provider}
                              </h4>
                              <span className={`px-2 py-0.5 text-xs rounded-full ${statusConfig.bgColor} ${statusConfig.color}`}>
                                {isOverdueNow && bill.paymentStatus !== 'paid' ? 'Overdue' : statusConfig.label}
                              </span>
                            </div>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {config.label} | Due: {formatDate(bill.dueDate)}
                              {bill.usage > 0 && ` | Usage: ${formatNumber(bill.usage)} ${bill.usageUnit}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {formatCurrency(bill.totalAmount)}
                            </p>
                            {bill.paymentDate && (
                              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                Paid: {formatDate(bill.paymentDate)}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {bill.paymentStatus !== 'paid' && (
                              <button
                                onClick={() => markAsPaid(bill.id)}
                                className="p-2 text-green-500 hover:bg-green-500/10 rounded-lg"
                                title={t('tools.utilityBill.markAsPaid', 'Mark as Paid')}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => deleteBill(bill.id)}
                              className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Accounts Tab */}
        {activeTab === 'accounts' && (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.utilityBill.utilityAccounts', 'Utility Accounts')}
              </h2>
              <button
                onClick={() => setShowAccountForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90"
              >
                <Plus className="w-4 h-4" />
                {t('tools.utilityBill.addAccount', 'Add Account')}
              </button>
            </div>

            {/* Add Account Form */}
            {showAccountForm && (
              <div className={`mb-6 p-4 rounded-lg border ${
                theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
              }`}>
                <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.utilityBill.addUtilityAccount', 'Add Utility Account')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <select
                    value={newAccount.utilityType}
                    onChange={(e) => setNewAccount({ ...newAccount, utilityType: e.target.value as UtilityType })}
                    className={`px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    {Object.entries(UTILITY_TYPE_CONFIG).map(([key, config]) => (
                      <option key={key} value={key}>{config.label}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder={t('tools.utilityBill.providerName', 'Provider Name')}
                    value={newAccount.provider}
                    onChange={(e) => setNewAccount({ ...newAccount, provider: e.target.value })}
                    className={`px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                  <input
                    type="text"
                    placeholder={t('tools.utilityBill.accountNumber2', 'Account Number')}
                    value={newAccount.accountNumber}
                    onChange={(e) => setNewAccount({ ...newAccount, accountNumber: e.target.value })}
                    className={`px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                  <input
                    type="text"
                    placeholder={t('tools.utilityBill.serviceAddress', 'Service Address')}
                    value={newAccount.serviceAddress}
                    onChange={(e) => setNewAccount({ ...newAccount, serviceAddress: e.target.value })}
                    className={`px-3 py-2 rounded-lg border md:col-span-2 ${
                      theme === 'dark'
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                  <input
                    type="text"
                    placeholder={t('tools.utilityBill.customerServicePhone', 'Customer Service Phone')}
                    value={newAccount.customerServicePhone}
                    onChange={(e) => setNewAccount({ ...newAccount, customerServicePhone: e.target.value })}
                    className={`px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                  <input
                    type="text"
                    placeholder={t('tools.utilityBill.website', 'Website')}
                    value={newAccount.website}
                    onChange={(e) => setNewAccount({ ...newAccount, website: e.target.value })}
                    className={`px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                  <div className="flex items-center gap-4">
                    <label className={`flex items-center gap-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      <input
                        type="checkbox"
                        checked={newAccount.autopay}
                        onChange={(e) => setNewAccount({ ...newAccount, autopay: e.target.checked })}
                        className="rounded"
                      />
                      {t('tools.utilityBill.autopay', 'Autopay')}
                    </label>
                    <label className={`flex items-center gap-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      <input
                        type="checkbox"
                        checked={newAccount.paperless}
                        onChange={(e) => setNewAccount({ ...newAccount, paperless: e.target.checked })}
                        className="rounded"
                      />
                      {t('tools.utilityBill.paperless', 'Paperless')}
                    </label>
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    onClick={() => setShowAccountForm(false)}
                    className={`px-4 py-2 rounded-lg ${
                      theme === 'dark' ? 'text-gray-300 hover:bg-gray-600' : 'text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {t('tools.utilityBill.cancel2', 'Cancel')}
                  </button>
                  <button
                    onClick={addAccount}
                    className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90"
                  >
                    {t('tools.utilityBill.addAccount2', 'Add Account')}
                  </button>
                </div>
              </div>
            )}

            {/* Accounts List */}
            {accounts.length === 0 ? (
              <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{t('tools.utilityBill.noAccountsConfigured', 'No accounts configured')}</p>
                <p className="text-sm mt-2">{t('tools.utilityBill.addYourUtilityAccountsFor', 'Add your utility accounts for quick reference')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {accounts.map((account) => {
                  const config = UTILITY_TYPE_CONFIG[account.utilityType];
                  const UtilityIcon = config.icon;
                  const accountBills = bills.filter(b => b.accountNumber === account.accountNumber);
                  const totalSpent = accountBills.reduce((acc, b) => acc + b.totalAmount, 0);

                  return (
                    <div
                      key={account.id}
                      className={`p-4 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${config.bgColor}`}>
                            <UtilityIcon className={`w-5 h-5 ${config.color}`} />
                          </div>
                          <div>
                            <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {account.provider}
                            </h4>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {config.label} | #{account.accountNumber}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => deleteAccount(account.id)}
                          className="p-1 text-red-500 hover:bg-red-500/10 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className={`space-y-1 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {account.serviceAddress && <p>{account.serviceAddress}</p>}
                        {account.customerServicePhone && <p>Phone: {account.customerServicePhone}</p>}
                        <div className="flex gap-3 pt-2">
                          {account.autopay && (
                            <span className="px-2 py-0.5 text-xs rounded-full bg-green-500/10 text-green-500">
                              {t('tools.utilityBill.autopay2', 'Autopay')}
                            </span>
                          )}
                          {account.paperless && (
                            <span className="px-2 py-0.5 text-xs rounded-full bg-blue-500/10 text-blue-500">
                              {t('tools.utilityBill.paperless2', 'Paperless')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <h2 className={`text-lg font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.utilityBill.spendingAnalytics', 'Spending Analytics')}
            </h2>

            {/* Spending by Utility Type */}
            <div className="mb-8">
              <h3 className={`font-medium mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.utilityBill.spendingByUtility', 'Spending by Utility')}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(UTILITY_TYPE_CONFIG).map(([type, config]) => {
                  const data = stats.byType[type as UtilityType];
                  if (data.count === 0) return null;
                  const UtilityIcon = config.icon;

                  return (
                    <div
                      key={type}
                      className={`p-4 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <UtilityIcon className={`w-4 h-4 ${config.color}`} />
                        <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {config.label}
                        </span>
                      </div>
                      <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {formatCurrency(data.total)}
                      </p>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Avg: {formatCurrency(data.avgMonthly)}/bill
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Monthly Totals */}
            {Object.keys(stats.monthlyTotals).length > 0 && (
              <div>
                <h3 className={`font-medium mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.utilityBill.monthlyTotals', 'Monthly Totals')}
                </h3>
                <div className="space-y-2">
                  {Object.entries(stats.monthlyTotals)
                    .sort((a, b) => b[0].localeCompare(a[0]))
                    .slice(0, 12)
                    .map(([month, total]) => {
                      const [year, monthNum] = month.split('-');
                      const monthName = new Date(parseInt(year), parseInt(monthNum) - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

                      return (
                        <div
                          key={month}
                          className={`flex items-center justify-between p-3 rounded-lg ${
                            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                          }`}
                        >
                          <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                            {monthName}
                          </span>
                          <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {formatCurrency(total)}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {bills.length === 0 && (
              <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <BarChart3 className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p>{t('tools.utilityBill.noDataAvailableForAnalysis', 'No data available for analysis')}</p>
                <p className="text-sm mt-2">{t('tools.utilityBill.addBillsToSeeSpending', 'Add bills to see spending analytics')}</p>
              </div>
            )}
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

export default UtilityBillTool;
