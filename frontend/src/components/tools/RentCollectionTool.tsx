'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DollarSign,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Search,
  Calendar,
  Building,
  User,
  CheckCircle,
  AlertTriangle,
  Clock,
  XCircle,
  TrendingUp,
  CreditCard,
  Receipt,
  Send,
  Bell,
} from 'lucide-react';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { useToolData } from '../../hooks/useToolData';
import { useTheme } from '@/contexts/ThemeContext';
import { type ColumnConfig } from '../../lib/toolDataUtils';

interface RentPayment {
  id: string;
  tenantName: string;
  tenantEmail?: string;
  tenantPhone?: string;
  propertyAddress: string;
  unitNumber?: string;
  rentAmount: number;
  dueDate: string;
  paymentDate?: string;
  amountPaid?: number;
  paymentMethod?: 'cash' | 'check' | 'bank_transfer' | 'credit_card' | 'venmo' | 'zelle' | 'paypal' | 'other';
  status: 'pending' | 'paid' | 'partial' | 'late' | 'overdue' | 'waived';
  lateFee?: number;
  lateFeeApplied?: boolean;
  leaseStartDate?: string;
  leaseEndDate?: string;
  checkNumber?: string;
  transactionId?: string;
  reminderSent?: boolean;
  reminderDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const columns: ColumnConfig[] = [
  { key: 'tenantName', header: 'Tenant', type: 'string' },
  { key: 'propertyAddress', header: 'Property', type: 'string' },
  { key: 'unitNumber', header: 'Unit', type: 'string' },
  { key: 'rentAmount', header: 'Rent Due', type: 'currency' },
  { key: 'dueDate', header: 'Due Date', type: 'date' },
  { key: 'amountPaid', header: 'Amount Paid', type: 'currency' },
  { key: 'status', header: 'Status', type: 'string' },
];

const PAYMENT_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'text-amber-500 bg-amber-500/10' },
  { value: 'paid', label: 'Paid', color: 'text-green-500 bg-green-500/10' },
  { value: 'partial', label: 'Partial', color: 'text-blue-500 bg-blue-500/10' },
  { value: 'late', label: 'Late', color: 'text-orange-500 bg-orange-500/10' },
  { value: 'overdue', label: 'Overdue', color: 'text-red-500 bg-red-500/10' },
  { value: 'waived', label: 'Waived', color: 'text-gray-500 bg-gray-500/10' },
];

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'check', label: 'Check' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'venmo', label: 'Venmo' },
  { value: 'zelle', label: 'Zelle' },
  { value: 'paypal', label: 'PayPal' },
  { value: 'other', label: 'Other' },
];

export const RentCollectionTool: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const {
    data: payments,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    addItem,
    updateItem,
    deleteItem,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    copyToClipboard,
    print,
    forceSync,
  } = useToolData<RentPayment>('rent-collection', [], columns);

  const [showModal, setShowModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState<RentPayment | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [monthFilter, setMonthFilter] = useState<string>('current');
  const [showRecordPaymentModal, setShowRecordPaymentModal] = useState(false);
  const [selectedPaymentForRecord, setSelectedPaymentForRecord] = useState<RentPayment | null>(null);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  const [form, setForm] = useState<Partial<RentPayment>>({
    tenantName: '',
    propertyAddress: '',
    rentAmount: 0,
    dueDate: new Date().toISOString().split('T')[0],
    status: 'pending',
  });

  const [recordPaymentForm, setRecordPaymentForm] = useState({
    amountPaid: 0,
    paymentMethod: 'bank_transfer' as RentPayment['paymentMethod'],
    paymentDate: new Date().toISOString().split('T')[0],
    checkNumber: '',
    transactionId: '',
  });

  const getMonthRange = (filter: string) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    switch (filter) {
      case 'current':
        return { start: new Date(year, month, 1), end: new Date(year, month + 1, 0) };
      case 'last':
        return { start: new Date(year, month - 1, 1), end: new Date(year, month, 0) };
      case 'next':
        return { start: new Date(year, month + 1, 1), end: new Date(year, month + 2, 0) };
      default:
        return null;
    }
  };

  const filteredPayments = useMemo(() => {
    return payments.filter(payment => {
      const matchesSearch = !searchQuery ||
        payment.tenantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.propertyAddress.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;

      const monthRange = getMonthRange(monthFilter);
      let matchesMonth = true;
      if (monthRange) {
        const dueDate = new Date(payment.dueDate);
        matchesMonth = dueDate >= monthRange.start && dueDate <= monthRange.end;
      }

      return matchesSearch && matchesStatus && matchesMonth;
    });
  }, [payments, searchQuery, statusFilter, monthFilter]);

  const stats = useMemo(() => {
    const monthRange = getMonthRange('current');
    const currentMonthPayments = monthRange
      ? payments.filter(p => {
          const dueDate = new Date(p.dueDate);
          return dueDate >= monthRange.start && dueDate <= monthRange.end;
        })
      : payments;

    const totalDue = currentMonthPayments.reduce((sum, p) => sum + p.rentAmount, 0);
    const totalCollected = currentMonthPayments
      .filter(p => p.status === 'paid' || p.status === 'partial')
      .reduce((sum, p) => sum + (p.amountPaid || 0), 0);
    const pendingCount = currentMonthPayments.filter(p => p.status === 'pending' || p.status === 'late').length;
    const overdueCount = currentMonthPayments.filter(p => p.status === 'overdue').length;
    const overdueAmount = currentMonthPayments
      .filter(p => p.status === 'overdue' || p.status === 'late')
      .reduce((sum, p) => sum + (p.rentAmount - (p.amountPaid || 0)), 0);
    const collectionRate = totalDue > 0 ? Math.round((totalCollected / totalDue) * 100) : 0;

    return { totalDue, totalCollected, pendingCount, overdueCount, overdueAmount, collectionRate };
  }, [payments]);

  const handleSubmit = () => {
    if (!form.tenantName || !form.propertyAddress || !form.rentAmount) return;

    const now = new Date().toISOString();

    if (editingPayment) {
      updateItem(editingPayment.id, { ...form, updatedAt: now });
    } else {
      const newPayment: RentPayment = {
        id: `rent-${Date.now()}`,
        tenantName: form.tenantName || '',
        tenantEmail: form.tenantEmail,
        tenantPhone: form.tenantPhone,
        propertyAddress: form.propertyAddress || '',
        unitNumber: form.unitNumber,
        rentAmount: form.rentAmount || 0,
        dueDate: form.dueDate || now.split('T')[0],
        status: form.status || 'pending',
        lateFee: form.lateFee,
        leaseStartDate: form.leaseStartDate,
        leaseEndDate: form.leaseEndDate,
        notes: form.notes,
        createdAt: now,
        updatedAt: now,
      };
      addItem(newPayment);
    }
    resetForm();
    setShowModal(false);
    setEditingPayment(null);
  };

  const handleRecordPayment = () => {
    if (!selectedPaymentForRecord) return;

    const totalPaid = (selectedPaymentForRecord.amountPaid || 0) + recordPaymentForm.amountPaid;
    const rentDue = selectedPaymentForRecord.rentAmount + (selectedPaymentForRecord.lateFeeApplied ? (selectedPaymentForRecord.lateFee || 0) : 0);

    let newStatus: RentPayment['status'] = selectedPaymentForRecord.status;
    if (totalPaid >= rentDue) {
      newStatus = 'paid';
    } else if (totalPaid > 0) {
      newStatus = 'partial';
    }

    updateItem(selectedPaymentForRecord.id, {
      amountPaid: totalPaid,
      paymentDate: recordPaymentForm.paymentDate,
      paymentMethod: recordPaymentForm.paymentMethod,
      checkNumber: recordPaymentForm.checkNumber || undefined,
      transactionId: recordPaymentForm.transactionId || undefined,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    });

    setShowRecordPaymentModal(false);
    setSelectedPaymentForRecord(null);
    setRecordPaymentForm({
      amountPaid: 0,
      paymentMethod: 'bank_transfer',
      paymentDate: new Date().toISOString().split('T')[0],
      checkNumber: '',
      transactionId: '',
    });
  };

  const handleSendReminder = (payment: RentPayment) => {
    updateItem(payment.id, {
      reminderSent: true,
      reminderDate: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setValidationMessage(`Reminder sent to ${payment.tenantName} at ${payment.tenantEmail || 'no email provided'}`);
    setTimeout(() => setValidationMessage(null), 3000);
  };

  const handleApplyLateFee = (payment: RentPayment) => {
    if (payment.lateFeeApplied) return;
    const lateFee = payment.lateFee || Math.round(payment.rentAmount * 0.05); // Default 5% late fee
    updateItem(payment.id, {
      lateFee,
      lateFeeApplied: true,
      status: payment.status === 'pending' ? 'late' : payment.status,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Rent Record',
      message: 'Are you sure you want to delete this rent record? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteItem(id);
    }
  };

  const resetForm = () => {
    setForm({
      tenantName: '',
      propertyAddress: '',
      rentAmount: 0,
      dueDate: new Date().toISOString().split('T')[0],
      status: 'pending',
    });
  };

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    return Math.floor((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const cardClass = `rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`;
  const inputClass = `w-full px-4 py-2.5 border rounded-lg outline-none transition-all focus:ring-2 focus:ring-green-500/20 focus:border-green-500 ${
    isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white text-gray-900'
  }`;
  const labelClass = `block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`;
  const buttonPrimary = 'px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-medium rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-green-500/20';
  const buttonSecondary = `px-4 py-2.5 rounded-lg font-medium transition-colors ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`;

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} p-6`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className={cardClass}>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-lg">
                  <DollarSign className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.rentCollection.rentCollection', 'Rent Collection')}
                  </h1>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.rentCollection.trackAndCollectRentPayments', 'Track and collect rent payments from tenants')}
                  </p>
                </div>
              </div>
              <WidgetEmbedButton toolSlug="rent-collection" toolName="Rent Collection" />

              <SyncStatus isSynced={isSynced} isSaving={isSaving} lastSaved={lastSaved} syncError={syncError} onForceSync={forceSync} theme={isDark ? 'dark' : 'light'} />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className={`${cardClass} p-4`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.rentCollection.totalDue', 'Total Due')}</p>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>${stats.totalDue.toLocaleString()}</p>
          </div>
          <div className={`${cardClass} p-4`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.rentCollection.collected', 'Collected')}</p>
            <p className="text-2xl font-bold text-green-500">${stats.totalCollected.toLocaleString()}</p>
          </div>
          <div className={`${cardClass} p-4`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.rentCollection.collectionRate', 'Collection Rate')}</p>
            <p className={`text-2xl font-bold ${stats.collectionRate >= 90 ? 'text-green-500' : stats.collectionRate >= 70 ? 'text-amber-500' : 'text-red-500'}`}>{stats.collectionRate}%</p>
          </div>
          <div className={`${cardClass} p-4`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.rentCollection.pending', 'Pending')}</p>
            <p className="text-2xl font-bold text-amber-500">{stats.pendingCount}</p>
          </div>
          <div className={`${cardClass} p-4`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.rentCollection.overdue', 'Overdue')}</p>
            <p className="text-2xl font-bold text-red-500">{stats.overdueCount}</p>
          </div>
          <div className={`${cardClass} p-4`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.rentCollection.overdueAmount', 'Overdue Amount')}</p>
            <p className="text-2xl font-bold text-red-500">${stats.overdueAmount.toLocaleString()}</p>
          </div>
        </div>

        {/* Filters */}
        <div className={cardClass}>
          <div className="p-4 flex flex-wrap gap-3 items-center justify-between">
            <div className="flex gap-3 items-center flex-wrap">
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <input type="text" placeholder={t('tools.rentCollection.searchTenantsOrProperties', 'Search tenants or properties...')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className={`${inputClass} pl-10 w-64`} />
              </div>
              <select value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)} className={inputClass}>
                <option value="current">{t('tools.rentCollection.thisMonth', 'This Month')}</option>
                <option value="last">{t('tools.rentCollection.lastMonth', 'Last Month')}</option>
                <option value="next">{t('tools.rentCollection.nextMonth', 'Next Month')}</option>
                <option value="all">{t('tools.rentCollection.allTime', 'All Time')}</option>
              </select>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={inputClass}>
                <option value="all">{t('tools.rentCollection.allStatus', 'All Status')}</option>
                {PAYMENT_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <ExportDropdown
                onExportCSV={() => exportCSV({ filename: 'rent-collection' })}
                onExportExcel={() => exportExcel({ filename: 'rent-collection' })}
                onExportJSON={() => exportJSON({ filename: 'rent-collection' })}
                onExportPDF={async () => { await exportPDF({ filename: 'rent-collection', title: 'Rent Collection Report' }); }}
                onPrint={() => print('Rent Collection Report')}
                onCopyToClipboard={() => copyToClipboard()}
                disabled={payments.length === 0}
                theme={isDark ? 'dark' : 'light'}
              />
              <button onClick={() => setShowModal(true)} className={buttonPrimary}>
                <Plus className="w-4 h-4" />
                {t('tools.rentCollection.addRentDue', 'Add Rent Due')}
              </button>
            </div>
          </div>
        </div>

        {/* Payments List */}
        <div className="space-y-3">
          {filteredPayments.map(payment => {
            const statusInfo = PAYMENT_STATUSES.find(s => s.value === payment.status);
            const daysUntilDue = getDaysUntilDue(payment.dueDate);
            const isOverdue = daysUntilDue < 0 && payment.status !== 'paid' && payment.status !== 'waived';
            const balance = payment.rentAmount + (payment.lateFeeApplied ? (payment.lateFee || 0) : 0) - (payment.amountPaid || 0);

            return (
              <div key={payment.id} className={`${cardClass} p-4 ${isOverdue ? 'ring-2 ring-red-500' : ''}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`p-3 rounded-lg ${isOverdue ? 'bg-red-500/10' : isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <User className={`w-5 h-5 ${isOverdue ? 'text-red-500' : 'text-green-500'}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{payment.tenantName}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo?.color}`}>{statusInfo?.label}</span>
                        {payment.lateFeeApplied && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium text-orange-500 bg-orange-500/10">{t('tools.rentCollection.lateFeeApplied', 'Late Fee Applied')}</span>
                        )}
                      </div>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        <Building className="w-3.5 h-3.5 inline mr-1" />
                        {payment.propertyAddress}
                        {payment.unitNumber && ` - Unit ${payment.unitNumber}`}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                          <Calendar className="w-3.5 h-3.5 inline mr-1" />
                          Due: {new Date(payment.dueDate).toLocaleDateString()}
                        </span>
                        {daysUntilDue !== 0 && payment.status !== 'paid' && (
                          <span className={daysUntilDue < 0 ? 'text-red-500' : daysUntilDue <= 3 ? 'text-amber-500' : 'text-green-500'}>
                            {daysUntilDue < 0 ? `${Math.abs(daysUntilDue)} days overdue` : `${daysUntilDue} days left`}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-6">
                      <div>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.rentCollection.rentDue', 'Rent Due')}</p>
                        <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          ${payment.rentAmount.toLocaleString()}
                          {payment.lateFeeApplied && payment.lateFee && (
                            <span className="text-sm text-orange-500 ml-1">(+${payment.lateFee})</span>
                          )}
                        </p>
                      </div>
                      <div>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.rentCollection.paid', 'Paid')}</p>
                        <p className="text-lg font-bold text-green-500">${(payment.amountPaid || 0).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.rentCollection.balance', 'Balance')}</p>
                        <p className={`text-lg font-bold ${balance > 0 ? 'text-red-500' : 'text-green-500'}`}>
                          ${balance.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`flex gap-2 mt-3 pt-3 border-t ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                  {payment.status !== 'paid' && payment.status !== 'waived' && (
                    <>
                      <button
                        onClick={() => { setSelectedPaymentForRecord(payment); setRecordPaymentForm({ ...recordPaymentForm, amountPaid: balance }); setShowRecordPaymentModal(true); }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg ${isDark ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                      >
                        <CreditCard className="w-4 h-4" />
                        {t('tools.rentCollection.recordPayment2', 'Record Payment')}
                      </button>
                      {!payment.lateFeeApplied && daysUntilDue < 0 && (
                        <button
                          onClick={() => handleApplyLateFee(payment)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg ${isDark ? 'bg-orange-500/10 text-orange-400 hover:bg-orange-500/20' : 'bg-orange-50 text-orange-600 hover:bg-orange-100'}`}
                        >
                          <AlertTriangle className="w-4 h-4" />
                          {t('tools.rentCollection.applyLateFee', 'Apply Late Fee')}
                        </button>
                      )}
                      <button
                        onClick={() => handleSendReminder(payment)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg ${isDark ? 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
                      >
                        <Bell className="w-4 h-4" />
                        {t('tools.rentCollection.sendReminder', 'Send Reminder')}
                      </button>
                    </>
                  )}
                  <div className="flex-1" />
                  <button
                    onClick={() => { setEditingPayment(payment); setForm(payment); setShowModal(true); }}
                    className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  >
                    <Edit2 className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  </button>
                  <button onClick={() => handleDelete(payment.id)} className="p-2 rounded-lg hover:bg-red-500/10">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredPayments.length === 0 && (
          <div className={`${cardClass} text-center py-12`}>
            <DollarSign className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
            <p className={`text-lg font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.rentCollection.noRentRecordsFound', 'No rent records found')}</p>
            <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.rentCollection.addRentDueEntriesTo', 'Add rent due entries to start tracking collections')}</p>
          </div>
        )}

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className={`${cardClass} w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
              <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {editingPayment ? t('tools.rentCollection.editRentEntry', 'Edit Rent Entry') : t('tools.rentCollection.addRentDue2', 'Add Rent Due')}
                </h2>
                <button onClick={() => { setShowModal(false); setEditingPayment(null); resetForm(); }} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                  <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className={labelClass}>{t('tools.rentCollection.tenantName', 'Tenant Name *')}</label>
                    <input type="text" value={form.tenantName || ''} onChange={(e) => setForm({ ...form, tenantName: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.rentCollection.tenantEmail', 'Tenant Email')}</label>
                    <input type="email" value={form.tenantEmail || ''} onChange={(e) => setForm({ ...form, tenantEmail: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.rentCollection.tenantPhone', 'Tenant Phone')}</label>
                    <input type="tel" value={form.tenantPhone || ''} onChange={(e) => setForm({ ...form, tenantPhone: e.target.value })} className={inputClass} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className={labelClass}>{t('tools.rentCollection.propertyAddress', 'Property Address *')}</label>
                    <input type="text" value={form.propertyAddress || ''} onChange={(e) => setForm({ ...form, propertyAddress: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.rentCollection.unitNumber', 'Unit Number')}</label>
                    <input type="text" value={form.unitNumber || ''} onChange={(e) => setForm({ ...form, unitNumber: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.rentCollection.rentAmount', 'Rent Amount ($) *')}</label>
                    <input type="number" value={form.rentAmount || ''} onChange={(e) => setForm({ ...form, rentAmount: parseFloat(e.target.value) || 0 })} min="0" className={inputClass} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.rentCollection.dueDate', 'Due Date *')}</label>
                    <input type="date" value={form.dueDate || ''} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.rentCollection.lateFee', 'Late Fee ($)')}</label>
                    <input type="number" value={form.lateFee || ''} onChange={(e) => setForm({ ...form, lateFee: parseFloat(e.target.value) || undefined })} min="0" className={inputClass} placeholder={t('tools.rentCollection.default5OfRent', 'Default: 5% of rent')} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.rentCollection.leaseStartDate', 'Lease Start Date')}</label>
                    <input type="date" value={form.leaseStartDate || ''} onChange={(e) => setForm({ ...form, leaseStartDate: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.rentCollection.leaseEndDate', 'Lease End Date')}</label>
                    <input type="date" value={form.leaseEndDate || ''} onChange={(e) => setForm({ ...form, leaseEndDate: e.target.value })} className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.rentCollection.notes', 'Notes')}</label>
                  <textarea value={form.notes || ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} className={inputClass} />
                </div>
              </div>
              <div className={`flex justify-end gap-3 p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <button onClick={() => { setShowModal(false); setEditingPayment(null); resetForm(); }} className={buttonSecondary}>{t('tools.rentCollection.cancel', 'Cancel')}</button>
                <button onClick={handleSubmit} disabled={!form.tenantName || !form.propertyAddress || !form.rentAmount} className={`${buttonPrimary} disabled:opacity-50`}>
                  <Save className="w-4 h-4" />
                  {editingPayment ? t('tools.rentCollection.update', 'Update') : t('tools.rentCollection.add', 'Add')} Entry
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Record Payment Modal */}
        {showRecordPaymentModal && selectedPaymentForRecord && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className={`${cardClass} w-full max-w-md`}>
              <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.rentCollection.recordPayment', 'Record Payment')}</h2>
                <button onClick={() => { setShowRecordPaymentModal(false); setSelectedPaymentForRecord(null); }} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                  <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedPaymentForRecord.tenantName}</p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{selectedPaymentForRecord.propertyAddress}</p>
                  <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Balance Due: <span className="font-semibold text-red-500">
                      ${(selectedPaymentForRecord.rentAmount + (selectedPaymentForRecord.lateFeeApplied ? (selectedPaymentForRecord.lateFee || 0) : 0) - (selectedPaymentForRecord.amountPaid || 0)).toLocaleString()}
                    </span>
                  </p>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.rentCollection.paymentAmount', 'Payment Amount ($) *')}</label>
                  <input type="number" value={recordPaymentForm.amountPaid || ''} onChange={(e) => setRecordPaymentForm({ ...recordPaymentForm, amountPaid: parseFloat(e.target.value) || 0 })} min="0" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.rentCollection.paymentDate', 'Payment Date *')}</label>
                  <input type="date" value={recordPaymentForm.paymentDate} onChange={(e) => setRecordPaymentForm({ ...recordPaymentForm, paymentDate: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.rentCollection.paymentMethod', 'Payment Method')}</label>
                  <select value={recordPaymentForm.paymentMethod} onChange={(e) => setRecordPaymentForm({ ...recordPaymentForm, paymentMethod: e.target.value as RentPayment['paymentMethod'] })} className={inputClass}>
                    {PAYMENT_METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                </div>
                {recordPaymentForm.paymentMethod === 'check' && (
                  <div>
                    <label className={labelClass}>{t('tools.rentCollection.checkNumber', 'Check Number')}</label>
                    <input type="text" value={recordPaymentForm.checkNumber} onChange={(e) => setRecordPaymentForm({ ...recordPaymentForm, checkNumber: e.target.value })} className={inputClass} />
                  </div>
                )}
                {['bank_transfer', 'venmo', 'zelle', 'paypal'].includes(recordPaymentForm.paymentMethod || '') && (
                  <div>
                    <label className={labelClass}>{t('tools.rentCollection.transactionId', 'Transaction ID')}</label>
                    <input type="text" value={recordPaymentForm.transactionId} onChange={(e) => setRecordPaymentForm({ ...recordPaymentForm, transactionId: e.target.value })} className={inputClass} />
                  </div>
                )}
              </div>
              <div className={`flex justify-end gap-3 p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <button onClick={() => { setShowRecordPaymentModal(false); setSelectedPaymentForRecord(null); }} className={buttonSecondary}>{t('tools.rentCollection.cancel2', 'Cancel')}</button>
                <button onClick={handleRecordPayment} disabled={!recordPaymentForm.amountPaid} className={`${buttonPrimary} disabled:opacity-50`}>
                  <CheckCircle className="w-4 h-4" />
                  {t('tools.rentCollection.recordPayment3', 'Record Payment')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Validation Toast */}
        {validationMessage && (
          <div className="fixed bottom-4 right-4 z-50 p-4 rounded-lg bg-green-500 text-white shadow-lg animate-in fade-in slide-in-from-bottom-3 duration-200">
            {validationMessage}
          </div>
        )}

        {/* Confirm Dialog */}
        <ConfirmDialog />
      </div>
    </div>
  );
};

export default RentCollectionTool;
