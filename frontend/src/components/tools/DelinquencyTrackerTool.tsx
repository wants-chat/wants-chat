'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  AlertTriangle,
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
  Phone,
  Mail,
  BarChart3,
  TrendingUp,
  MessageSquare,
  History,
  ArrowDownRight,
} from 'lucide-react';
import { UIConfig } from '../ContextualUI';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import useToolData from '../../hooks/useToolData';
import { type ColumnConfig } from '../../lib/toolDataUtils';

interface DelinquencyTrackerToolProps {
  uiConfig?: UIConfig;
}

type DelinquencyStatus = 'current' | 'past_due_30' | 'past_due_60' | 'past_due_90' | 'default' | 'collections' | 'resolved';
type ContactResult = 'contacted' | 'no_answer' | 'wrong_number' | 'promise_to_pay' | 'refused' | 'payment_made';

interface ContactAttempt {
  id: string;
  date: string;
  method: 'phone' | 'email' | 'mail' | 'in_person';
  result: ContactResult;
  notes: string;
  nextAction?: string;
  nextContactDate?: string;
}

interface DelinquentAccount {
  id: string;
  accountNumber: string;
  loanNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  status: DelinquencyStatus;
  // Loan details
  originalBalance: number;
  currentBalance: number;
  paymentAmount: number;
  // Delinquency
  daysPastDue: number;
  amountPastDue: number;
  lastPaymentDate: string;
  lastPaymentAmount: number;
  missedPayments: number;
  // Collections
  assignedTo: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  contactAttempts: ContactAttempt[];
  promiseToPayDate?: string;
  promiseToPayAmount?: number;
  // Fees
  lateFees: number;
  collectionFees: number;
  // Notes
  notes: string;
  createdAt: string;
  updatedAt: string;
}

const STATUS_CONFIG: Record<DelinquencyStatus, { label: string; color: string; days: string }> = {
  current: { label: 'Current', color: 'bg-green-100 text-green-800', days: '0' },
  past_due_30: { label: '30 Days', color: 'bg-yellow-100 text-yellow-800', days: '1-30' },
  past_due_60: { label: '60 Days', color: 'bg-orange-100 text-orange-800', days: '31-60' },
  past_due_90: { label: '90 Days', color: 'bg-red-100 text-red-800', days: '61-90' },
  default: { label: 'Default', color: 'bg-red-200 text-red-900', days: '90+' },
  collections: { label: 'Collections', color: 'bg-purple-100 text-purple-800', days: '' },
  resolved: { label: 'Resolved', color: 'bg-gray-100 text-gray-800', days: '' },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  low: { label: 'Low', color: 'bg-gray-100 text-gray-700' },
  medium: { label: 'Medium', color: 'bg-blue-100 text-blue-700' },
  high: { label: 'High', color: 'bg-orange-100 text-orange-700' },
  critical: { label: 'Critical', color: 'bg-red-100 text-red-700' },
};

const CONTACT_RESULTS: { value: ContactResult; label: string }[] = [
  { value: 'contacted', label: 'Contacted' },
  { value: 'no_answer', label: 'No Answer' },
  { value: 'wrong_number', label: 'Wrong Number' },
  { value: 'promise_to_pay', label: 'Promise to Pay' },
  { value: 'refused', label: 'Refused' },
  { value: 'payment_made', label: 'Payment Made' },
];

const ACCOUNT_COLUMNS: ColumnConfig[] = [
  { key: 'accountNumber', header: 'Account #', type: 'string' },
  { key: 'customerName', header: 'Customer', type: 'string' },
  { key: 'daysPastDue', header: 'Days Past Due', type: 'number' },
  { key: 'amountPastDue', header: 'Amount Due', type: 'currency' },
  { key: 'currentBalance', header: 'Balance', type: 'currency' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'priority', header: 'Priority', type: 'string' },
  { key: 'assignedTo', header: 'Assigned To', type: 'string' },
];

const generateId = () => Math.random().toString(36).substring(2, 11);

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const getStatusFromDays = (days: number): DelinquencyStatus => {
  if (days <= 0) return 'current';
  if (days <= 30) return 'past_due_30';
  if (days <= 60) return 'past_due_60';
  if (days <= 90) return 'past_due_90';
  return 'default';
};

const getInitialFormState = (): Partial<DelinquentAccount> => ({
  accountNumber: '',
  loanNumber: '',
  customerName: '',
  customerPhone: '',
  customerEmail: '',
  status: 'past_due_30',
  originalBalance: 0,
  currentBalance: 0,
  paymentAmount: 0,
  daysPastDue: 0,
  amountPastDue: 0,
  lastPaymentDate: '',
  lastPaymentAmount: 0,
  missedPayments: 0,
  assignedTo: '',
  priority: 'medium',
  contactAttempts: [],
  lateFees: 0,
  collectionFees: 0,
  notes: '',
});

export const DelinquencyTrackerTool: React.FC<DelinquencyTrackerToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const {
    data: accounts,
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
  } = useToolData<DelinquentAccount>('delinquency-tracker', [], ACCOUNT_COLUMNS);

  const [activeTab, setActiveTab] = useState<'accounts' | 'new' | 'analytics'>('accounts');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<DelinquentAccount>>(getInitialFormState());
  const [showContactForm, setShowContactForm] = useState<string | null>(null);
  const [newContact, setNewContact] = useState<Partial<ContactAttempt>>({
    method: 'phone',
    result: 'no_answer',
    notes: '',
  });

  const filteredAccounts = useMemo(() => {
    return accounts.filter(acc => {
      const matchesSearch =
        acc.accountNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        acc.customerName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || acc.status === filterStatus;
      const matchesPriority = filterPriority === 'all' || acc.priority === filterPriority;
      return matchesSearch && matchesStatus && matchesPriority;
    }).sort((a, b) => b.daysPastDue - a.daysPastDue);
  }, [accounts, searchTerm, filterStatus, filterPriority]);

  const analytics = useMemo(() => {
    const activeDelinquent = accounts.filter(a => a.status !== 'current' && a.status !== 'resolved');
    const totalPastDue = activeDelinquent.reduce((sum, a) => sum + a.amountPastDue, 0);
    const totalBalance = activeDelinquent.reduce((sum, a) => sum + a.currentBalance, 0);
    const totalFees = activeDelinquent.reduce((sum, a) => sum + a.lateFees + a.collectionFees, 0);

    const byStatus: Record<string, number> = {};
    Object.keys(STATUS_CONFIG).forEach(status => {
      byStatus[status] = accounts.filter(a => a.status === status).length;
    });

    const avgDaysPastDue = activeDelinquent.length > 0
      ? activeDelinquent.reduce((sum, a) => sum + a.daysPastDue, 0) / activeDelinquent.length
      : 0;

    const promiseToPay = accounts.filter(a => a.promiseToPayDate && new Date(a.promiseToPayDate) >= new Date()).length;

    return {
      totalDelinquent: activeDelinquent.length,
      totalPastDue,
      totalBalance,
      totalFees,
      avgDaysPastDue,
      promiseToPay,
      byStatus,
    };
  }, [accounts]);

  const handleSubmit = () => {
    const now = new Date().toISOString();
    const status = formData.daysPastDue ? getStatusFromDays(formData.daysPastDue) : formData.status;

    if (editingId) {
      updateItem(editingId, { ...formData, status, updatedAt: now });
      setEditingId(null);
    } else {
      const newAccount: DelinquentAccount = {
        ...formData as DelinquentAccount,
        id: generateId(),
        status: status || 'past_due_30',
        contactAttempts: [],
        createdAt: now,
        updatedAt: now,
      };
      addItem(newAccount);
    }
    setFormData(getInitialFormState());
    setActiveTab('accounts');
  };

  const handleEdit = (acc: DelinquentAccount) => {
    setFormData(acc);
    setEditingId(acc.id);
    setActiveTab('new');
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Account',
      message: 'Are you sure you want to delete this delinquent account? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) deleteItem(id);
  };

  const handleAddContact = (accountId: string) => {
    const account = accounts.find(a => a.id === accountId);
    if (!account) return;

    const contact: ContactAttempt = {
      id: generateId(),
      date: new Date().toISOString(),
      method: newContact.method || 'phone',
      result: newContact.result || 'no_answer',
      notes: newContact.notes || '',
      nextAction: newContact.nextAction,
      nextContactDate: newContact.nextContactDate,
    };

    const updates: Partial<DelinquentAccount> = {
      contactAttempts: [...account.contactAttempts, contact],
      updatedAt: new Date().toISOString(),
    };

    if (newContact.result === 'promise_to_pay' && newContact.nextContactDate) {
      updates.promiseToPayDate = newContact.nextContactDate;
    }

    updateItem(accountId, updates);
    setShowContactForm(null);
    setNewContact({ method: 'phone', result: 'no_answer', notes: '' });
  };

  const handleStatusChange = (id: string, newStatus: DelinquencyStatus) => {
    updateItem(id, { status: newStatus, updatedAt: new Date().toISOString() });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{t('tools.delinquencyTracker.delinquencyTracker', 'Delinquency Tracker')}</h1>
              <p className="text-gray-500 text-sm">{t('tools.delinquencyTracker.trackAndManageDelinquentAccounts', 'Track and manage delinquent accounts')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <WidgetEmbedButton toolSlug="delinquency-tracker" toolName="Delinquency Tracker" />

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

        <div className="flex gap-2 border-b border-gray-200">
          {[
            { id: 'accounts', label: 'Delinquent Accounts', icon: <AlertTriangle className="w-4 h-4" /> },
            { id: 'new', label: 'Add Account', icon: <Plus className="w-4 h-4" /> },
            { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === tab.id ? 'border-red-500 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'accounts' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4 bg-white p-4 rounded-lg shadow-sm">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder={t('tools.delinquencyTracker.searchAccounts', 'Search accounts...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg">
              <option value="all">{t('tools.delinquencyTracker.allStatuses', 'All Statuses')}</option>
              {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
            <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg">
              <option value="all">{t('tools.delinquencyTracker.allPriorities', 'All Priorities')}</option>
              {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            {filteredAccounts.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <AlertTriangle className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">{t('tools.delinquencyTracker.noDelinquentAccounts', 'No delinquent accounts')}</h3>
                <button onClick={() => setActiveTab('new')} className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
                  <Plus className="w-4 h-4" />
                  {t('tools.delinquencyTracker.addAccount', 'Add Account')}
                </button>
              </div>
            ) : (
              filteredAccounts.map(acc => (
                <div key={acc.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-4 cursor-pointer hover:bg-gray-50" onClick={() => setExpandedId(expandedId === acc.id ? null : acc.id)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${acc.daysPastDue >= 90 ? 'bg-red-100' : acc.daysPastDue >= 60 ? 'bg-orange-100' : 'bg-yellow-100'}`}>
                          <AlertTriangle className={`w-5 h-5 ${acc.daysPastDue >= 90 ? 'text-red-600' : acc.daysPastDue >= 60 ? 'text-orange-600' : 'text-yellow-600'}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">{acc.accountNumber}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_CONFIG[acc.status].color}`}>
                              {STATUS_CONFIG[acc.status].label}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PRIORITY_CONFIG[acc.priority].color}`}>
                              {PRIORITY_CONFIG[acc.priority].label}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500">{acc.customerName}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-600">{acc.daysPastDue}</div>
                          <div className="text-xs text-gray-500">{t('tools.delinquencyTracker.daysPastDue', 'Days Past Due')}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-gray-900">{formatCurrency(acc.amountPastDue)}</div>
                          <div className="text-xs text-gray-500">{t('tools.delinquencyTracker.pastDue', 'Past Due')}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600">{formatCurrency(acc.currentBalance)}</div>
                          <div className="text-xs text-gray-500">{t('tools.delinquencyTracker.balance', 'Balance')}</div>
                        </div>
                        {expandedId === acc.id ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                      </div>
                    </div>
                  </div>

                  {expandedId === acc.id && (
                    <div className="border-t border-gray-200 p-4 bg-gray-50">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">{t('tools.delinquencyTracker.contactInfo', 'Contact Info')}</h4>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center gap-2"><Phone className="w-3 h-3" />{acc.customerPhone}</div>
                            <div className="flex items-center gap-2"><Mail className="w-3 h-3" />{acc.customerEmail}</div>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">{t('tools.delinquencyTracker.paymentHistory', 'Payment History')}</h4>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div>Last Payment: {acc.lastPaymentDate ? formatDate(acc.lastPaymentDate) : 'N/A'}</div>
                            <div>Amount: {formatCurrency(acc.lastPaymentAmount)}</div>
                            <div>Missed: {acc.missedPayments} payments</div>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">{t('tools.delinquencyTracker.fees', 'Fees')}</h4>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div>Late Fees: {formatCurrency(acc.lateFees)}</div>
                            <div>Collection Fees: {formatCurrency(acc.collectionFees)}</div>
                            <div className="font-medium">Total: {formatCurrency(acc.lateFees + acc.collectionFees)}</div>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">{t('tools.delinquencyTracker.assignment', 'Assignment')}</h4>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div>Assigned: {acc.assignedTo || 'Unassigned'}</div>
                            {acc.promiseToPayDate && (
                              <div className="text-green-600">
                                PTP: {formatDate(acc.promiseToPayDate)}
                              </div>
                            )}
                            <div>Contacts: {acc.contactAttempts.length}</div>
                          </div>
                        </div>
                      </div>

                      {/* Contact History */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium text-gray-700">{t('tools.delinquencyTracker.contactHistory', 'Contact History')}</h4>
                          <button
                            onClick={() => setShowContactForm(showContactForm === acc.id ? null : acc.id)}
                            className="flex items-center gap-1 px-2 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                          >
                            <Plus className="w-3 h-3" />
                            {t('tools.delinquencyTracker.logContact', 'Log Contact')}
                          </button>
                        </div>

                        {showContactForm === acc.id && (
                          <div className="mb-3 p-3 bg-white rounded-lg border border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                              <div>
                                <label className="block text-xs text-gray-600 mb-1">{t('tools.delinquencyTracker.method', 'Method')}</label>
                                <select
                                  value={newContact.method}
                                  onChange={(e) => setNewContact({ ...newContact, method: e.target.value as ContactAttempt['method'] })}
                                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                                >
                                  <option value="phone">{t('tools.delinquencyTracker.phone', 'Phone')}</option>
                                  <option value="email">{t('tools.delinquencyTracker.email', 'Email')}</option>
                                  <option value="mail">{t('tools.delinquencyTracker.mail', 'Mail')}</option>
                                  <option value="in_person">{t('tools.delinquencyTracker.inPerson', 'In Person')}</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs text-gray-600 mb-1">{t('tools.delinquencyTracker.result', 'Result')}</label>
                                <select
                                  value={newContact.result}
                                  onChange={(e) => setNewContact({ ...newContact, result: e.target.value as ContactResult })}
                                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                                >
                                  {CONTACT_RESULTS.map(r => (
                                    <option key={r.value} value={r.value}>{r.label}</option>
                                  ))}
                                </select>
                              </div>
                              <div className="md:col-span-2">
                                <label className="block text-xs text-gray-600 mb-1">{t('tools.delinquencyTracker.notes', 'Notes')}</label>
                                <input
                                  type="text"
                                  value={newContact.notes}
                                  onChange={(e) => setNewContact({ ...newContact, notes: e.target.value })}
                                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                                />
                              </div>
                            </div>
                            <div className="flex justify-end gap-2">
                              <button onClick={() => setShowContactForm(null)} className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded">{t('tools.delinquencyTracker.cancel', 'Cancel')}</button>
                              <button onClick={() => handleAddContact(acc.id)} className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600">{t('tools.delinquencyTracker.save', 'Save')}</button>
                            </div>
                          </div>
                        )}

                        {acc.contactAttempts.length > 0 && (
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {acc.contactAttempts.slice(-5).reverse().map(contact => (
                              <div key={contact.id} className="flex items-start gap-3 p-2 bg-white rounded border border-gray-100">
                                <History className="w-4 h-4 text-gray-400 mt-0.5" />
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 text-sm">
                                    <span className="font-medium capitalize">{contact.method}</span>
                                    <span className="text-gray-400">-</span>
                                    <span className="capitalize">{contact.result.replace('_', ' ')}</span>
                                    <span className="text-gray-400 text-xs">{formatDate(contact.date)}</span>
                                  </div>
                                  {contact.notes && <p className="text-xs text-gray-500 mt-0.5">{contact.notes}</p>}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">{t('tools.delinquencyTracker.status', 'Status:')}</span>
                          <select
                            value={acc.status}
                            onChange={(e) => handleStatusChange(acc.id, e.target.value as DelinquencyStatus)}
                            className="px-2 py-1 text-sm border border-gray-300 rounded-lg"
                          >
                            {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                              <option key={key} value={key}>{config.label}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleEdit(acc)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(acc.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'new' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">{editingId ? t('tools.delinquencyTracker.editAccount', 'Edit Account') : t('tools.delinquencyTracker.addDelinquentAccount', 'Add Delinquent Account')}</h2>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.delinquencyTracker.accountNumber', 'Account Number')}</label>
                <input type="text" value={formData.accountNumber || ''} onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.delinquencyTracker.loanNumber', 'Loan Number')}</label>
                <input type="text" value={formData.loanNumber || ''} onChange={(e) => setFormData({ ...formData, loanNumber: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.delinquencyTracker.customerName', 'Customer Name')}</label>
                <input type="text" value={formData.customerName || ''} onChange={(e) => setFormData({ ...formData, customerName: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.delinquencyTracker.phone2', 'Phone')}</label>
                <input type="tel" value={formData.customerPhone || ''} onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.delinquencyTracker.email2', 'Email')}</label>
                <input type="email" value={formData.customerEmail || ''} onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.delinquencyTracker.daysPastDue2', 'Days Past Due')}</label>
                <input type="number" value={formData.daysPastDue || ''} onChange={(e) => setFormData({ ...formData, daysPastDue: Number(e.target.value) })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.delinquencyTracker.amountPastDue', 'Amount Past Due')}</label>
                <input type="number" step="0.01" value={formData.amountPastDue || ''} onChange={(e) => setFormData({ ...formData, amountPastDue: Number(e.target.value) })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.delinquencyTracker.currentBalance', 'Current Balance')}</label>
                <input type="number" step="0.01" value={formData.currentBalance || ''} onChange={(e) => setFormData({ ...formData, currentBalance: Number(e.target.value) })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.delinquencyTracker.paymentAmount', 'Payment Amount')}</label>
                <input type="number" step="0.01" value={formData.paymentAmount || ''} onChange={(e) => setFormData({ ...formData, paymentAmount: Number(e.target.value) })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.delinquencyTracker.priority', 'Priority')}</label>
                <select value={formData.priority || 'medium'} onChange={(e) => setFormData({ ...formData, priority: e.target.value as DelinquentAccount['priority'] })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500">
                  {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                    <option key={key} value={key}>{config.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.delinquencyTracker.assignedTo', 'Assigned To')}</label>
                <input type="text" value={formData.assignedTo || ''} onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.delinquencyTracker.missedPayments', 'Missed Payments')}</label>
                <input type="number" value={formData.missedPayments || ''} onChange={(e) => setFormData({ ...formData, missedPayments: Number(e.target.value) })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.delinquencyTracker.notes2', 'Notes')}</label>
              <textarea value={formData.notes || ''} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500" />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button onClick={() => { setFormData(getInitialFormState()); setEditingId(null); }} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">{t('tools.delinquencyTracker.cancel2', 'Cancel')}</button>
              <button onClick={handleSubmit} className="flex items-center gap-2 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
                <Save className="w-4 h-4" />
                {editingId ? t('tools.delinquencyTracker.update', 'Update') : t('tools.delinquencyTracker.addAccount2', 'Add Account')}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-sm text-gray-500">{t('tools.delinquencyTracker.delinquentAccounts', 'Delinquent Accounts')}</div>
              <div className="text-2xl font-bold text-red-600">{analytics.totalDelinquent}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-sm text-gray-500">{t('tools.delinquencyTracker.totalPastDue', 'Total Past Due')}</div>
              <div className="text-2xl font-bold text-orange-600">{formatCurrency(analytics.totalPastDue)}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-sm text-gray-500">{t('tools.delinquencyTracker.totalFees', 'Total Fees')}</div>
              <div className="text-2xl font-bold text-yellow-600">{formatCurrency(analytics.totalFees)}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-sm text-gray-500">{t('tools.delinquencyTracker.avgDaysPastDue', 'Avg Days Past Due')}</div>
              <div className="text-2xl font-bold text-gray-900">{Math.round(analytics.avgDaysPastDue)}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('tools.delinquencyTracker.byStatus', 'By Status')}</h3>
              <div className="space-y-3">
                {Object.entries(STATUS_CONFIG).map(([key, config]) => {
                  const count = analytics.byStatus[key] || 0;
                  const pct = accounts.length > 0 ? (count / accounts.length) * 100 : 0;
                  return (
                    <div key={key} className="flex items-center gap-3">
                      <div className={`w-24 px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}>{config.label}</div>
                      <div className="flex-1 bg-gray-200 rounded-full h-3">
                        <div className="bg-red-500 h-3 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="w-10 text-right text-sm font-medium">{count}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('tools.delinquencyTracker.summary', 'Summary')}</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">{t('tools.delinquencyTracker.totalBalanceAtRisk', 'Total Balance at Risk')}</span>
                  <span className="font-bold text-gray-900">{formatCurrency(analytics.totalBalance)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                  <span className="text-green-700">{t('tools.delinquencyTracker.promiseToPay', 'Promise to Pay')}</span>
                  <span className="font-bold text-green-700">{analytics.promiseToPay}</span>
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

export default DelinquencyTrackerTool;
