'use client';

import React, { useState, useMemo } from 'react';
import {
  CalendarClock,
  DollarSign,
  Calendar,
  FileText,
  Plus,
  Trash2,
  Edit2,
  Save,
  Search,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  User,
  Building2,
  BarChart3,
  Bell,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Send,
  Pause,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { UIConfig } from '../ContextualUI';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import useToolData from '../../hooks/useToolData';
import { type ColumnConfig } from '../../lib/toolDataUtils';

interface PaymentSchedulerToolProps {
  uiConfig?: UIConfig;
}

type PaymentStatus = 'scheduled' | 'pending' | 'completed' | 'failed' | 'cancelled' | 'on_hold';
type PaymentFrequency = 'one_time' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'annually';
type PaymentType = 'loan_payment' | 'mortgage' | 'line_of_credit' | 'credit_card' | 'other';

interface ScheduledPayment {
  id: string;
  paymentNumber: string;
  accountNumber: string;
  customerName: string;
  paymentType: PaymentType;
  status: PaymentStatus;
  // Payment details
  amount: number;
  principalAmount: number;
  interestAmount: number;
  feeAmount: number;
  // Schedule
  frequency: PaymentFrequency;
  scheduledDate: string;
  processedDate?: string;
  nextPaymentDate?: string;
  // Recurring
  isRecurring: boolean;
  remainingPayments?: number;
  totalPayments?: number;
  // Account
  fromAccount: string;
  toAccount: string;
  // Processing
  confirmationNumber?: string;
  failureReason?: string;
  retryCount: number;
  // Notes
  notes: string;
  createdAt: string;
  updatedAt: string;
}

const PAYMENT_TYPES: { value: PaymentType; label: string }[] = [
  { value: 'loan_payment', label: 'Loan Payment' },
  { value: 'mortgage', label: 'Mortgage' },
  { value: 'line_of_credit', label: 'Line of Credit' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'other', label: 'Other' },
];

const FREQUENCY_OPTIONS: { value: PaymentFrequency; label: string }[] = [
  { value: 'one_time', label: 'One Time' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'annually', label: 'Annually' },
];

const STATUS_CONFIG: Record<PaymentStatus, { label: string; color: string; icon: React.ReactNode }> = {
  scheduled: { label: 'Scheduled', color: 'bg-blue-100 text-blue-800', icon: <Calendar className="w-4 h-4" /> },
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="w-4 h-4" /> },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-800', icon: <CheckCircle className="w-4 h-4" /> },
  failed: { label: 'Failed', color: 'bg-red-100 text-red-800', icon: <XCircle className="w-4 h-4" /> },
  cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-800', icon: <XCircle className="w-4 h-4" /> },
  on_hold: { label: 'On Hold', color: 'bg-orange-100 text-orange-800', icon: <Pause className="w-4 h-4" /> },
};

const PAYMENT_COLUMNS: ColumnConfig[] = [
  { key: 'paymentNumber', header: 'Payment #', type: 'string' },
  { key: 'accountNumber', header: 'Account', type: 'string' },
  { key: 'customerName', header: 'Customer', type: 'string' },
  { key: 'paymentType', header: 'Type', type: 'string' },
  { key: 'amount', header: 'Amount', type: 'currency' },
  { key: 'frequency', header: 'Frequency', type: 'string' },
  { key: 'scheduledDate', header: 'Scheduled', type: 'date' },
  { key: 'status', header: 'Status', type: 'string' },
];

const generateId = () => Math.random().toString(36).substring(2, 11);
const generatePaymentNumber = () => `PAY-${Date.now().toString().slice(-8)}`;

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const isUpcoming = (date: string): boolean => {
  const paymentDate = new Date(date);
  const today = new Date();
  const threeDaysFromNow = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);
  return paymentDate >= today && paymentDate <= threeDaysFromNow;
};

const isOverdue = (date: string, status: PaymentStatus): boolean => {
  if (status === 'completed' || status === 'cancelled') return false;
  return new Date(date) < new Date();
};

const getInitialFormState = (): Partial<ScheduledPayment> => ({
  accountNumber: '',
  customerName: '',
  paymentType: 'loan_payment',
  status: 'scheduled',
  amount: 0,
  principalAmount: 0,
  interestAmount: 0,
  feeAmount: 0,
  frequency: 'monthly',
  scheduledDate: '',
  fromAccount: '',
  toAccount: '',
  isRecurring: false,
  retryCount: 0,
  notes: '',
});

export const PaymentSchedulerTool: React.FC<PaymentSchedulerToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const {
    data: payments,
    addItem,
    updateItem,
    deleteItem,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    importCSV,
    importJSON,
    copyToClipboard,
    print,
  } = useToolData<ScheduledPayment>('payment-scheduler', [], PAYMENT_COLUMNS);

  const { confirm, ConfirmDialog } = useConfirmDialog();

  const [activeTab, setActiveTab] = useState<'payments' | 'new' | 'analytics'>('payments');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<ScheduledPayment>>(getInitialFormState());

  const filteredPayments = useMemo(() => {
    return payments.filter(pmt => {
      const matchesSearch =
        pmt.paymentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pmt.accountNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pmt.customerName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || pmt.status === filterStatus;
      const matchesType = filterType === 'all' || pmt.paymentType === filterType;
      return matchesSearch && matchesStatus && matchesType;
    }).sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());
  }, [payments, searchTerm, filterStatus, filterType]);

  const analytics = useMemo(() => {
    const scheduled = payments.filter(p => p.status === 'scheduled');
    const completed = payments.filter(p => p.status === 'completed');
    const failed = payments.filter(p => p.status === 'failed');
    const upcoming = payments.filter(p => p.status === 'scheduled' && isUpcoming(p.scheduledDate));
    const overdue = payments.filter(p => isOverdue(p.scheduledDate, p.status));

    const totalScheduled = scheduled.reduce((sum, p) => sum + p.amount, 0);
    const totalCompleted = completed.reduce((sum, p) => sum + p.amount, 0);

    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    const thisMonthPayments = payments.filter(p => {
      const date = new Date(p.scheduledDate);
      return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
    });
    const monthlyTotal = thisMonthPayments.reduce((sum, p) => sum + p.amount, 0);

    return {
      totalScheduled: scheduled.length,
      totalCompleted: completed.length,
      totalFailed: failed.length,
      upcomingCount: upcoming.length,
      overdueCount: overdue.length,
      scheduledAmount: totalScheduled,
      completedAmount: totalCompleted,
      monthlyTotal,
    };
  }, [payments]);

  const handleSubmit = () => {
    const now = new Date().toISOString();

    if (editingId) {
      updateItem(editingId, { ...formData, updatedAt: now });
      setEditingId(null);
    } else {
      const newPayment: ScheduledPayment = {
        ...formData as ScheduledPayment,
        id: generateId(),
        paymentNumber: generatePaymentNumber(),
        createdAt: now,
        updatedAt: now,
      };
      addItem(newPayment);
    }
    setFormData(getInitialFormState());
    setActiveTab('payments');
  };

  const handleEdit = (pmt: ScheduledPayment) => {
    setFormData(pmt);
    setEditingId(pmt.id);
    setActiveTab('new');
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Confirm',
      message: 'Delete this payment?',
      confirmText: 'Yes',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteItem(id);
    }
  };

  const handleStatusChange = (id: string, newStatus: PaymentStatus) => {
    const updates: Partial<ScheduledPayment> = {
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };
    if (newStatus === 'completed') {
      updates.processedDate = new Date().toISOString();
      updates.confirmationNumber = `CNF-${Date.now().toString().slice(-10)}`;
    }
    updateItem(id, updates);
  };

  const handleProcessPayment = (id: string) => {
    handleStatusChange(id, 'completed');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-100 rounded-lg">
              <CalendarClock className="w-6 h-6 text-cyan-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{t('tools.paymentScheduler.paymentScheduler', 'Payment Scheduler')}</h1>
              <p className="text-gray-500 text-sm">{t('tools.paymentScheduler.scheduleAndManageLoanPayments', 'Schedule and manage loan payments')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <WidgetEmbedButton toolSlug="payment-scheduler" toolName="Payment Scheduler" />

            <SyncStatus isSynced={isSynced} isSaving={isSaving} lastSaved={lastSaved} syncError={syncError} onForceSync={forceSync} />
            <ExportDropdown
              onExportCSV={exportCSV}
              onExportExcel={exportExcel}
              onExportJSON={exportJSON}
              onExportPDF={exportPDF}
              onPrint={print}
              onCopyToClipboard={copyToClipboard}
              onImportCSV={async (file) => { await importCSV(file); }}
              onImportJSON={async (file) => { await importJSON(file); }}
            />
          </div>
        </div>

        {/* Alerts */}
        {(analytics.upcomingCount > 0 || analytics.overdueCount > 0) && (
          <div className="flex gap-4 mb-4">
            {analytics.upcomingCount > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                <Bell className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-blue-700">{analytics.upcomingCount} payments due in next 3 days</span>
              </div>
            )}
            {analytics.overdueCount > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-700">{analytics.overdueCount} overdue payments</span>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2 border-b border-gray-200">
          {[
            { id: 'payments', label: 'Payments', icon: <Calendar className="w-4 h-4" /> },
            { id: 'new', label: 'Schedule Payment', icon: <Plus className="w-4 h-4" /> },
            { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === tab.id ? 'border-cyan-500 text-cyan-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'payments' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4 bg-white p-4 rounded-lg shadow-sm">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder={t('tools.paymentScheduler.searchPayments', 'Search payments...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg">
              <option value="all">{t('tools.paymentScheduler.allStatuses', 'All Statuses')}</option>
              {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg">
              <option value="all">{t('tools.paymentScheduler.allTypes', 'All Types')}</option>
              {PAYMENT_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            {filteredPayments.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <CalendarClock className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">{t('tools.paymentScheduler.noPaymentsScheduled', 'No payments scheduled')}</h3>
                <button onClick={() => setActiveTab('new')} className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600">
                  <Plus className="w-4 h-4" />
                  {t('tools.paymentScheduler.schedulePayment', 'Schedule Payment')}
                </button>
              </div>
            ) : (
              filteredPayments.map(pmt => {
                const overdue = isOverdue(pmt.scheduledDate, pmt.status);
                const upcoming = isUpcoming(pmt.scheduledDate) && pmt.status === 'scheduled';

                return (
                  <div key={pmt.id} className={`bg-white rounded-lg shadow-sm border overflow-hidden ${overdue ? 'border-red-300' : upcoming ? 'border-blue-300' : 'border-gray-200'}`}>
                    <div className="p-4 cursor-pointer hover:bg-gray-50" onClick={() => setExpandedId(expandedId === pmt.id ? null : pmt.id)}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg ${overdue ? 'bg-red-50' : upcoming ? 'bg-blue-50' : 'bg-cyan-50'}`}>
                            <DollarSign className={`w-5 h-5 ${overdue ? 'text-red-600' : upcoming ? 'text-blue-600' : 'text-cyan-600'}`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">{pmt.paymentNumber}</span>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_CONFIG[pmt.status].color}`}>
                                {STATUS_CONFIG[pmt.status].label}
                              </span>
                              {pmt.isRecurring && (
                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                  <RefreshCw className="w-3 h-3 inline mr-1" />
                                  {t('tools.paymentScheduler.recurring', 'Recurring')}
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">{pmt.customerName} - {pmt.accountNumber}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <div className="font-medium text-gray-900">{formatCurrency(pmt.amount)}</div>
                            <div className="text-xs text-gray-500">{formatDate(pmt.scheduledDate)}</div>
                          </div>
                          {pmt.status === 'scheduled' && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleProcessPayment(pmt.id); }}
                              className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600"
                            >
                              <Send className="w-3 h-3" />
                              {t('tools.paymentScheduler.process', 'Process')}
                            </button>
                          )}
                          {expandedId === pmt.id ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                        </div>
                      </div>
                    </div>

                    {expandedId === pmt.id && (
                      <div className="border-t border-gray-200 p-4 bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">{t('tools.paymentScheduler.paymentBreakdown', 'Payment Breakdown')}</h4>
                            <div className="space-y-1 text-sm text-gray-600">
                              <div className="flex justify-between">
                                <span>{t('tools.paymentScheduler.principal', 'Principal:')}</span>
                                <span>{formatCurrency(pmt.principalAmount)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>{t('tools.paymentScheduler.interest', 'Interest:')}</span>
                                <span>{formatCurrency(pmt.interestAmount)}</span>
                              </div>
                              {pmt.feeAmount > 0 && (
                                <div className="flex justify-between">
                                  <span>{t('tools.paymentScheduler.fees', 'Fees:')}</span>
                                  <span>{formatCurrency(pmt.feeAmount)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">{t('tools.paymentScheduler.accounts', 'Accounts')}</h4>
                            <div className="space-y-1 text-sm text-gray-600">
                              <div>From: {pmt.fromAccount}</div>
                              <div>To: {pmt.toAccount}</div>
                            </div>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">{t('tools.paymentScheduler.schedule', 'Schedule')}</h4>
                            <div className="space-y-1 text-sm text-gray-600">
                              <div>Frequency: {FREQUENCY_OPTIONS.find(f => f.value === pmt.frequency)?.label}</div>
                              {pmt.isRecurring && pmt.remainingPayments && (
                                <div>Remaining: {pmt.remainingPayments} of {pmt.totalPayments}</div>
                              )}
                              {pmt.nextPaymentDate && (
                                <div>Next: {formatDate(pmt.nextPaymentDate)}</div>
                              )}
                            </div>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">{t('tools.paymentScheduler.processing', 'Processing')}</h4>
                            <div className="space-y-1 text-sm text-gray-600">
                              {pmt.processedDate && <div>Processed: {formatDate(pmt.processedDate)}</div>}
                              {pmt.confirmationNumber && <div>Conf #: {pmt.confirmationNumber}</div>}
                              {pmt.failureReason && <div className="text-red-600">Error: {pmt.failureReason}</div>}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">{t('tools.paymentScheduler.status', 'Status:')}</span>
                            <select
                              value={pmt.status}
                              onChange={(e) => handleStatusChange(pmt.id, e.target.value as PaymentStatus)}
                              className="px-2 py-1 text-sm border border-gray-300 rounded-lg"
                            >
                              {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                                <option key={key} value={key}>{config.label}</option>
                              ))}
                            </select>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => handleEdit(pmt)} className="p-2 text-cyan-600 hover:bg-cyan-50 rounded-lg">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(pmt.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {activeTab === 'new' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">{editingId ? t('tools.paymentScheduler.editPayment', 'Edit Payment') : t('tools.paymentScheduler.schedulePayment2', 'Schedule Payment')}</h2>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.paymentScheduler.accountNumber', 'Account Number')}</label>
                <input type="text" value={formData.accountNumber || ''} onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.paymentScheduler.customerName', 'Customer Name')}</label>
                <input type="text" value={formData.customerName || ''} onChange={(e) => setFormData({ ...formData, customerName: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.paymentScheduler.paymentType', 'Payment Type')}</label>
                <select value={formData.paymentType || ''} onChange={(e) => setFormData({ ...formData, paymentType: e.target.value as PaymentType })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500">
                  {PAYMENT_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.paymentScheduler.frequency', 'Frequency')}</label>
                <select value={formData.frequency || ''} onChange={(e) => setFormData({ ...formData, frequency: e.target.value as PaymentFrequency })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500">
                  {FREQUENCY_OPTIONS.map(f => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.paymentScheduler.scheduledDate', 'Scheduled Date')}</label>
                <input type="date" value={formData.scheduledDate || ''} onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.paymentScheduler.totalAmount', 'Total Amount')}</label>
                <input type="number" step="0.01" value={formData.amount || ''} onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.paymentScheduler.principal2', 'Principal')}</label>
                <input type="number" step="0.01" value={formData.principalAmount || ''} onChange={(e) => setFormData({ ...formData, principalAmount: Number(e.target.value) })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.paymentScheduler.interest2', 'Interest')}</label>
                <input type="number" step="0.01" value={formData.interestAmount || ''} onChange={(e) => setFormData({ ...formData, interestAmount: Number(e.target.value) })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.paymentScheduler.fees2', 'Fees')}</label>
                <input type="number" step="0.01" value={formData.feeAmount || ''} onChange={(e) => setFormData({ ...formData, feeAmount: Number(e.target.value) })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.paymentScheduler.fromAccount', 'From Account')}</label>
                <input type="text" value={formData.fromAccount || ''} onChange={(e) => setFormData({ ...formData, fromAccount: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.paymentScheduler.toAccount', 'To Account')}</label>
                <input type="text" value={formData.toAccount || ''} onChange={(e) => setFormData({ ...formData, toAccount: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500" />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isRecurring || false}
                  onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                  className="w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
                />
                <span className="text-sm text-gray-700">{t('tools.paymentScheduler.recurringPayment', 'Recurring payment')}</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.paymentScheduler.notes', 'Notes')}</label>
              <textarea value={formData.notes || ''} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500" />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button onClick={() => { setFormData(getInitialFormState()); setEditingId(null); }} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">{t('tools.paymentScheduler.cancel', 'Cancel')}</button>
              <button onClick={handleSubmit} className="flex items-center gap-2 px-6 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600">
                <Save className="w-4 h-4" />
                {editingId ? t('tools.paymentScheduler.update', 'Update') : t('tools.paymentScheduler.schedule2', 'Schedule')}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-sm text-gray-500">{t('tools.paymentScheduler.scheduled', 'Scheduled')}</div>
              <div className="text-2xl font-bold text-blue-600">{analytics.totalScheduled}</div>
              <div className="text-xs text-gray-500">{formatCurrency(analytics.scheduledAmount)}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-sm text-gray-500">{t('tools.paymentScheduler.completed', 'Completed')}</div>
              <div className="text-2xl font-bold text-green-600">{analytics.totalCompleted}</div>
              <div className="text-xs text-gray-500">{formatCurrency(analytics.completedAmount)}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-sm text-gray-500">{t('tools.paymentScheduler.failed', 'Failed')}</div>
              <div className="text-2xl font-bold text-red-600">{analytics.totalFailed}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-sm text-gray-500">{t('tools.paymentScheduler.thisMonth', 'This Month')}</div>
              <div className="text-2xl font-bold text-cyan-600">{formatCurrency(analytics.monthlyTotal)}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('tools.paymentScheduler.statusSummary', 'Status Summary')}</h3>
              <div className="space-y-3">
                {Object.entries(STATUS_CONFIG).map(([key, config]) => {
                  const count = payments.filter(p => p.status === key).length;
                  const pct = payments.length > 0 ? (count / payments.length) * 100 : 0;
                  return (
                    <div key={key} className="flex items-center gap-3">
                      <div className={`w-28 px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}>{config.label}</div>
                      <div className="flex-1 bg-gray-200 rounded-full h-3">
                        <div className="bg-cyan-500 h-3 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="w-10 text-right text-sm font-medium">{count}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('tools.paymentScheduler.alerts', 'Alerts')}</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <span className="text-blue-700">{t('tools.paymentScheduler.upcoming3Days', 'Upcoming (3 days)')}</span>
                  <span className="font-bold text-blue-700">{analytics.upcomingCount}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-200">
                  <span className="text-red-700">{t('tools.paymentScheduler.overdue', 'Overdue')}</span>
                  <span className="font-bold text-red-700">{analytics.overdueCount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <ConfirmDialog />
    </div>
  );
};

export default PaymentSchedulerTool;
