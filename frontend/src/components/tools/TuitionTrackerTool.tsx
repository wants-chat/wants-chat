import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, DollarSign, Calendar, User, CreditCard, FileText, Check, X, Clock, AlertCircle, Edit2, Trash2, Download, TrendingUp, Send, Loader2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useToolData } from '../../hooks/useToolData';
import type { ColumnConfig } from '../../lib/toolDataUtils';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { ExportDropdown } from '../ui/ExportDropdown';
import { useConfirmDialog } from '../ui/ConfirmDialog';

interface Child {
  id: string;
  name: string;
  classroom: string;
  parentName: string;
  parentEmail: string;
}

interface TuitionPayment {
  id: string;
  childId: string;
  childName: string;
  parentName: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  paymentMethod?: 'cash' | 'check' | 'card' | 'ach' | 'other';
  checkNumber?: string;
  transactionId?: string;
  status: 'pending' | 'paid' | 'overdue' | 'partial' | 'waived';
  type: 'tuition' | 'registration' | 'supplies' | 'late-fee' | 'activity' | 'other';
  period: string; // e.g., "January 2024" or "Week of 01/01"
  notes?: string;
  invoiceSent: boolean;
  reminderSent: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FeeSchedule {
  id: string;
  name: string;
  amount: number;
  frequency: 'weekly' | 'biweekly' | 'monthly' | 'yearly' | 'one-time';
  description: string;
}

const defaultChildren: Child[] = [
  { id: '1', name: 'Emma Johnson', classroom: 'Butterflies', parentName: 'Sarah Johnson', parentEmail: 'sarah@email.com' },
  { id: '2', name: 'Liam Smith', classroom: 'Butterflies', parentName: 'Mike Smith', parentEmail: 'mike@email.com' },
  { id: '3', name: 'Olivia Brown', classroom: 'Ladybugs', parentName: 'Lisa Brown', parentEmail: 'lisa@email.com' },
];

const defaultFeeSchedules: FeeSchedule[] = [
  { id: '1', name: 'Full-Time Tuition', amount: 1200, frequency: 'monthly', description: 'Full-time childcare (5 days/week)' },
  { id: '2', name: 'Part-Time Tuition', amount: 800, frequency: 'monthly', description: 'Part-time childcare (3 days/week)' },
  { id: '3', name: 'Registration Fee', amount: 150, frequency: 'yearly', description: 'Annual registration fee' },
  { id: '4', name: 'Activity Fee', amount: 50, frequency: 'monthly', description: 'Arts, crafts, and field trips' },
  { id: '5', name: 'Late Pickup Fee', amount: 15, frequency: 'one-time', description: 'Per 15 minutes after closing' },
];

export const TuitionTrackerTool: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const COLUMNS: ColumnConfig[] = [
    { key: 'childName', header: 'Child Name' },
    { key: 'parentName', header: 'Parent Name' },
    { key: 'amount', header: 'Amount' },
    { key: 'dueDate', header: 'Due Date' },
    { key: 'status', header: 'Status' },
    { key: 'type', header: 'Type' },
    { key: 'period', header: 'Period' },
  ];

  const {
    data: payments,
    isLoading,
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
  } = useToolData<TuitionPayment>('tuition-tracker', [], COLUMNS);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  const [children] = useState<Child[]>(defaultChildren);
  const [feeSchedules] = useState<FeeSchedule[]>(defaultFeeSchedules);
  const [activeTab, setActiveTab] = useState<'payments' | 'schedule' | 'reports'>('payments');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingPayment, setEditingPayment] = useState<TuitionPayment | null>(null);

  const [formData, setFormData] = useState({
    childId: '',
    amount: 0,
    dueDate: '',
    type: 'tuition' as TuitionPayment['type'],
    period: '',
    notes: '',
  });

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.childName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.parentName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
    const matchesType = filterType === 'all' || payment.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const calculateStats = () => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    const monthlyPayments = payments.filter(p => {
      const date = new Date(p.dueDate);
      return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
    });

    const collected = monthlyPayments
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + p.amount, 0);

    const outstanding = monthlyPayments
      .filter(p => p.status === 'pending' || p.status === 'overdue')
      .reduce((sum, p) => sum + p.amount, 0);

    const overdue = payments.filter(p => p.status === 'overdue').length;

    return { collected, outstanding, overdue, total: collected + outstanding };
  };

  const stats = calculateStats();

  const resetForm = () => {
    setFormData({
      childId: '',
      amount: 0,
      dueDate: '',
      type: 'tuition',
      period: '',
      notes: '',
    });
    setEditingPayment(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const child = children.find(c => c.id === formData.childId);
    if (!child) return;

    const paymentData = {
      childId: formData.childId,
      childName: child.name,
      parentName: child.parentName,
      amount: formData.amount,
      dueDate: formData.dueDate,
      type: formData.type,
      period: formData.period,
      notes: formData.notes,
      status: 'pending' as const,
      invoiceSent: false,
      reminderSent: false,
      updatedAt: new Date().toISOString(),
    };

    if (editingPayment) {
      await updateItem(editingPayment.id, paymentData);
    } else {
      await addItem({
        ...paymentData,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      });
    }
    resetForm();
  };

  const handleEdit = (payment: TuitionPayment) => {
    setFormData({
      childId: payment.childId,
      amount: payment.amount,
      dueDate: payment.dueDate,
      type: payment.type,
      period: payment.period,
      notes: payment.notes || '',
    });
    setEditingPayment(payment);
    setShowForm(true);
  };

  const handleMarkPaid = async (payment: TuitionPayment, method: TuitionPayment['paymentMethod']) => {
    await updateItem(payment.id, {
      status: 'paid',
      paidDate: new Date().toISOString().split('T')[0],
      paymentMethod: method,
    });
  };

  const handleSendInvoice = async (payment: TuitionPayment) => {
    await updateItem(payment.id, { invoiceSent: true });
    // In real app, would trigger email here
  };

  const handleSendReminder = async (payment: TuitionPayment) => {
    await updateItem(payment.id, { reminderSent: true });
    // In real app, would trigger email here
  };

  const getStatusColor = (status: TuitionPayment['status']) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      paid: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      overdue: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      partial: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      waived: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    };
    return colors[status];
  };

  const getTypeLabel = (type: TuitionPayment['type']) => {
    const labels = {
      tuition: 'Tuition',
      registration: 'Registration',
      supplies: 'Supplies',
      'late-fee': 'Late Fee',
      activity: 'Activity Fee',
      other: 'Other',
    };
    return labels[type];
  };

  const exportColumns: ColumnConfig[] = [
    { key: 'childName', header: 'Child Name', selected: true },
    { key: 'parentName', header: 'Parent Name', selected: true },
    { key: 'amount', header: 'Amount', selected: true },
    { key: 'type', header: 'Type', selected: true },
    { key: 'period', header: 'Period', selected: true },
    { key: 'dueDate', header: 'Due Date', selected: true },
    { key: 'status', header: 'Status', selected: true },
    { key: 'paidDate', header: 'Paid Date', selected: true },
  ];

  // Check for overdue payments
  React.useEffect(() => {
    const checkOverdue = async () => {
      const today = new Date().toISOString().split('T')[0];
      for (const payment of payments) {
        if (payment.status === 'pending' && payment.dueDate < today) {
          await updateItem(payment.id, { status: 'overdue' });
        }
      }
    };
    checkOverdue();
  }, [payments]);

  return (
    <div className={`min-h-screen p-6 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <DollarSign className="w-7 h-7 text-green-500" />
            {t('tools.tuitionTracker.tuitionTracker', 'Tuition Tracker')}
          </h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {t('tools.tuitionTracker.manageTuitionPaymentsFeesAnd', 'Manage tuition payments, fees, and billing')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <WidgetEmbedButton toolSlug="tuition-tracker" toolName="Tuition Tracker" />

          <SyncStatus isSaving={isSaving} lastSynced={lastSynced} />
          <ExportDropdown
            data={filteredPayments}
            filename="tuition-payments"
            columns={exportColumns}
          />
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t('tools.tuitionTracker.addPayment', 'Add Payment')}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className={`rounded-xl p-4 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.tuitionTracker.collectedThisMonth', 'Collected This Month')}</span>
          </div>
          <div className="text-2xl font-bold text-green-500">${stats.collected.toLocaleString()}</div>
        </div>
        <div className={`rounded-xl p-4 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-yellow-500" />
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.tuitionTracker.outstanding', 'Outstanding')}</span>
          </div>
          <div className="text-2xl font-bold text-yellow-500">${stats.outstanding.toLocaleString()}</div>
        </div>
        <div className={`rounded-xl p-4 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.tuitionTracker.overdue', 'Overdue')}</span>
          </div>
          <div className="text-2xl font-bold text-red-500">{stats.overdue}</div>
        </div>
        <div className={`rounded-xl p-4 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-blue-500" />
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.tuitionTracker.expectedTotal', 'Expected Total')}</span>
          </div>
          <div className="text-2xl font-bold text-blue-500">${stats.total.toLocaleString()}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(['payments', 'schedule', 'reports'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-medium capitalize ${
              activeTab === tab
                ? 'bg-green-600 text-white'
                : isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'payments' && (
        <>
          {/* Search & Filters */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <input
                type="text"
                placeholder={t('tools.tuitionTracker.searchByChildOrParent', 'Search by child or parent name...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`px-4 py-2 rounded-lg border ${
                isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}
            >
              <option value="all">{t('tools.tuitionTracker.allStatus', 'All Status')}</option>
              <option value="pending">{t('tools.tuitionTracker.pending', 'Pending')}</option>
              <option value="paid">{t('tools.tuitionTracker.paid', 'Paid')}</option>
              <option value="overdue">{t('tools.tuitionTracker.overdue2', 'Overdue')}</option>
              <option value="partial">{t('tools.tuitionTracker.partial', 'Partial')}</option>
              <option value="waived">{t('tools.tuitionTracker.waived', 'Waived')}</option>
            </select>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className={`px-4 py-2 rounded-lg border ${
                isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}
            >
              <option value="all">{t('tools.tuitionTracker.allTypes', 'All Types')}</option>
              <option value="tuition">{t('tools.tuitionTracker.tuition', 'Tuition')}</option>
              <option value="registration">{t('tools.tuitionTracker.registration', 'Registration')}</option>
              <option value="supplies">{t('tools.tuitionTracker.supplies', 'Supplies')}</option>
              <option value="late-fee">{t('tools.tuitionTracker.lateFee', 'Late Fee')}</option>
              <option value="activity">{t('tools.tuitionTracker.activityFee', 'Activity Fee')}</option>
              <option value="other">{t('tools.tuitionTracker.other', 'Other')}</option>
            </select>
          </div>

          {/* Payments List */}
          {isLoading ? (
            <div className="text-center py-12">{t('tools.tuitionTracker.loadingPayments', 'Loading payments...')}</div>
          ) : filteredPayments.length === 0 ? (
            <div className={`text-center py-12 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <DollarSign className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">{t('tools.tuitionTracker.noPaymentsFound', 'No payments found')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('tools.tuitionTracker.addAPaymentToStart', 'Add a payment to start tracking tuition')}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPayments.map(payment => (
                <div
                  key={payment.id}
                  className={`rounded-xl p-4 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-lg">
                        {payment.childName.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold">{payment.childName}</h3>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {payment.parentName} • {getTypeLabel(payment.type)} • {payment.period}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-xl font-bold">${payment.amount.toLocaleString()}</div>
                        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          Due: {new Date(payment.dueDate).toLocaleDateString()}
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(payment.status)}`}>
                        {payment.status}
                      </span>
                    </div>
                  </div>

                  <div className={`flex items-center justify-between mt-4 pt-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex items-center gap-4 text-sm">
                      {payment.invoiceSent && (
                        <span className="flex items-center gap-1 text-blue-500">
                          <FileText className="w-4 h-4" />
                          {t('tools.tuitionTracker.invoiceSent', 'Invoice sent')}
                        </span>
                      )}
                      {payment.reminderSent && (
                        <span className="flex items-center gap-1 text-yellow-500">
                          <Send className="w-4 h-4" />
                          {t('tools.tuitionTracker.reminderSent', 'Reminder sent')}
                        </span>
                      )}
                      {payment.paidDate && (
                        <span className="flex items-center gap-1 text-green-500">
                          <Check className="w-4 h-4" />
                          Paid on {new Date(payment.paidDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {payment.status !== 'paid' && (
                        <>
                          {!payment.invoiceSent && (
                            <button
                              onClick={() => handleSendInvoice(payment)}
                              className={`px-3 py-1 text-sm rounded-lg ${
                                isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                              }`}
                            >
                              {t('tools.tuitionTracker.sendInvoice', 'Send Invoice')}
                            </button>
                          )}
                          {!payment.reminderSent && payment.status === 'overdue' && (
                            <button
                              onClick={() => handleSendReminder(payment)}
                              className="px-3 py-1 text-sm rounded-lg bg-yellow-500 text-white hover:bg-yellow-600"
                            >
                              {t('tools.tuitionTracker.sendReminder', 'Send Reminder')}
                            </button>
                          )}
                          <div className="relative group">
                            <button className="px-3 py-1 text-sm rounded-lg bg-green-500 text-white hover:bg-green-600">
                              {t('tools.tuitionTracker.markPaid', 'Mark Paid')}
                            </button>
                            <div className={`absolute right-0 top-full mt-1 py-2 rounded-lg shadow-lg hidden group-hover:block z-10 ${
                              isDark ? 'bg-gray-700' : 'bg-white'
                            }`}>
                              {(['cash', 'check', 'card', 'ach'] as const).map(method => (
                                <button
                                  key={method}
                                  onClick={() => handleMarkPaid(payment, method)}
                                  className={`block w-full px-4 py-2 text-left text-sm capitalize ${
                                    isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                                  }`}
                                >
                                  {method}
                                </button>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                      <button
                        onClick={() => handleEdit(payment)}
                        className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={async () => {
                          const confirmed = await confirm({
                            title: 'Delete Payment',
                            message: 'Are you sure you want to delete this payment?',
                            confirmText: 'Delete',
                            cancelText: 'Cancel',
                            variant: 'danger'
                          });
                          if (confirmed) {
                            deleteItem(payment.id);
                          }
                        }}
                        className="p-2 text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'schedule' && (
        <div className={`rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <h2 className="text-lg font-semibold mb-4">{t('tools.tuitionTracker.feeSchedule', 'Fee Schedule')}</h2>
          <div className="space-y-4">
            {feeSchedules.map(fee => (
              <div
                key={fee.id}
                className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{fee.name}</h3>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {fee.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-green-500">${fee.amount}</div>
                    <div className={`text-sm capitalize ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {fee.frequency}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className={`rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <h2 className="text-lg font-semibold mb-4">{t('tools.tuitionTracker.paymentSummaryByChild', 'Payment Summary by Child')}</h2>
            <div className="space-y-3">
              {children.map(child => {
                const childPayments = payments.filter(p => p.childId === child.id);
                const totalDue = childPayments.reduce((sum, p) => sum + p.amount, 0);
                const totalPaid = childPayments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);

                return (
                  <div
                    key={child.id}
                    className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{child.name}</span>
                      <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {child.classroom}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Paid: ${totalPaid.toLocaleString()}</span>
                      <span>Total: ${totalDue.toLocaleString()}</span>
                    </div>
                    <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${totalDue > 0 ? (totalPaid / totalDue) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className={`rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <h2 className="text-lg font-semibold mb-4">{t('tools.tuitionTracker.collectionRate', 'Collection Rate')}</h2>
            <div className="text-center py-8">
              <div className="text-5xl font-bold text-green-500">
                {stats.total > 0 ? Math.round((stats.collected / stats.total) * 100) : 0}%
              </div>
              <div className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('tools.tuitionTracker.thisMonthSCollectionRate', 'This Month\'s Collection Rate')}
              </div>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="flex justify-between mb-2">
                <span>{t('tools.tuitionTracker.collected', 'Collected')}</span>
                <span className="font-medium text-green-500">${stats.collected.toLocaleString()}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>{t('tools.tuitionTracker.outstanding2', 'Outstanding')}</span>
                <span className="font-medium text-yellow-500">${stats.outstanding.toLocaleString()}</span>
              </div>
              <div className={`flex justify-between pt-2 border-t ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
                <span className="font-medium">{t('tools.tuitionTracker.totalExpected', 'Total Expected')}</span>
                <span className="font-bold">${stats.total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-lg rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} p-6`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">
                {editingPayment ? t('tools.tuitionTracker.editPayment', 'Edit Payment') : t('tools.tuitionTracker.addPayment2', 'Add Payment')}
              </h2>
              <button onClick={resetForm} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">{t('tools.tuitionTracker.child', 'Child *')}</label>
                <select
                  value={formData.childId}
                  onChange={(e) => setFormData(prev => ({ ...prev, childId: e.target.value }))}
                  required
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <option value="">{t('tools.tuitionTracker.selectChild', 'Select child...')}</option>
                  {children.map(child => (
                    <option key={child.id} value={child.id}>{child.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">{t('tools.tuitionTracker.amount', 'Amount *')}</label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                    required
                    min="0"
                    step="0.01"
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t('tools.tuitionTracker.dueDate', 'Due Date *')}</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                    required
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">{t('tools.tuitionTracker.type', 'Type *')}</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as TuitionPayment['type'] }))}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <option value="tuition">{t('tools.tuitionTracker.tuition2', 'Tuition')}</option>
                    <option value="registration">{t('tools.tuitionTracker.registration2', 'Registration')}</option>
                    <option value="supplies">{t('tools.tuitionTracker.supplies2', 'Supplies')}</option>
                    <option value="late-fee">{t('tools.tuitionTracker.lateFee2', 'Late Fee')}</option>
                    <option value="activity">{t('tools.tuitionTracker.activityFee2', 'Activity Fee')}</option>
                    <option value="other">{t('tools.tuitionTracker.other2', 'Other')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t('tools.tuitionTracker.period', 'Period *')}</label>
                  <input
                    type="text"
                    value={formData.period}
                    onChange={(e) => setFormData(prev => ({ ...prev, period: e.target.value }))}
                    required
                    placeholder={t('tools.tuitionTracker.eGJanuary2024', 'e.g., January 2024')}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">{t('tools.tuitionTracker.notes', 'Notes')}</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={2}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                  }`}
                />
              </div>

              {/* Quick Add from Fee Schedule */}
              <div>
                <label className="block text-sm font-medium mb-2">{t('tools.tuitionTracker.quickAddFromFeeSchedule', 'Quick Add from Fee Schedule')}</label>
                <div className="flex flex-wrap gap-2">
                  {feeSchedules.map(fee => (
                    <button
                      key={fee.id}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, amount: fee.amount, type: 'tuition' }))}
                      className={`px-3 py-1 text-sm rounded-lg ${
                        isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {fee.name} (${fee.amount})
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className={`flex-1 py-2 rounded-lg border ${
                    isDark ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {t('tools.tuitionTracker.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : editingPayment ? t('tools.tuitionTracker.update', 'Update') : t('tools.tuitionTracker.addPayment3', 'Add Payment')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <ConfirmDialog />
    </div>
  );
};

export default TuitionTrackerTool;
