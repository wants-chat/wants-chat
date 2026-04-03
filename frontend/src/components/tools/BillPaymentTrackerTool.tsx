import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Receipt,
  DollarSign,
  AlertCircle,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Calendar,
  Tag,
  Clock,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Home,
  Zap,
  Shield,
  Sparkles,
  History,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useToolData } from '../../hooks/useToolData';

interface BillPaymentTrackerToolProps {
  uiConfig?: UIConfig;
}

interface Bill {
  id: string;
  name: string;
  payee: string;
  category: string;
  amount: number;
  dueDate: string;
  recurring: boolean;
  frequency: 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly' | 'one-time';
  status: 'pending' | 'paid' | 'overdue';
  paymentDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface BillCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface Payment {
  id: string;
  billId: string;
  billName: string;
  amount: number;
  paidDate: string;
  notes?: string;
}

const DEFAULT_CATEGORIES: BillCategory[] = [
  { id: 'utilities', name: 'Utilities', icon: 'zap', color: '#EAB308' },
  { id: 'rent', name: 'Rent/Mortgage', icon: 'home', color: '#3B82F6' },
  { id: 'insurance', name: 'Insurance', icon: 'shield', color: '#10B981' },
  { id: 'credit-card', name: 'Credit Card', icon: 'credit-card', color: '#EF4444' },
  { id: 'subscription', name: 'Subscriptions', icon: 'refresh-cw', color: '#8B5CF6' },
  { id: 'phone', name: 'Phone/Internet', icon: 'zap', color: '#06B6D4' },
  { id: 'loan', name: 'Loan', icon: 'dollar-sign', color: '#F97316' },
  { id: 'other', name: 'Other', icon: 'tag', color: '#6B7280' },
];

const FREQUENCY_OPTIONS = [
  { value: 'one-time', label: 'One-time' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
];

// Column configuration for exports
const BILL_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Bill Name', type: 'string' },
  { key: 'payee', header: 'Payee', type: 'string' },
  { key: 'category', header: 'Category', type: 'string' },
  { key: 'amount', header: 'Amount', type: 'currency' },
  { key: 'dueDate', header: 'Due Date', type: 'date' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'frequency', header: 'Frequency', type: 'string' },
  { key: 'recurring', header: 'Recurring', type: 'boolean' },
];

const PAYMENT_COLUMNS: ColumnConfig[] = [
  { key: 'billName', header: 'Bill', type: 'string' },
  { key: 'amount', header: 'Amount', type: 'currency' },
  { key: 'paidDate', header: 'Paid Date', type: 'date' },
  { key: 'notes', header: 'Notes', type: 'string' },
];

const getCategoryIcon = (iconName: string) => {
  const icons: Record<string, React.FC<{ className?: string }>> = {
    zap: Zap,
    home: Home,
    shield: Shield,
    'credit-card': CreditCard,
    'refresh-cw': RefreshCw,
    'dollar-sign': DollarSign,
    tag: Tag,
  };
  return icons[iconName] || Tag;
};

export const BillPaymentTrackerTool: React.FC<BillPaymentTrackerToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // useToolData hook for bills management
  const {
    data: bills,
    addItem: addBill,
    updateItem: updateBill,
    deleteItem: deleteBill,
    isLoading: billsLoading,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<Bill>('bill-payment-tracker', [], BILL_COLUMNS);

  // State
  const [categories, setCategories] = useState<BillCategory[]>(DEFAULT_CATEGORIES);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // UI State
  const [showBillModal, setShowBillModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);

  // Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    payee: '',
    category: 'utilities',
    amount: '',
    dueDate: new Date().toISOString().split('T')[0],
    recurring: false,
    frequency: 'monthly' as Bill['frequency'],
    notes: '',
  });

  const [newCategory, setNewCategory] = useState({ name: '', color: '#6B7280' });

  // Apply prefill data
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.amount || params.title || params.description) {
        setFormData((prev) => ({
          ...prev,
          name: params.title || prev.name,
          notes: params.description || prev.notes,
          amount: params.amount?.toString() || prev.amount,
        }));
        setShowBillModal(true);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Check for overdue bills and update when bills change
  useEffect(() => {
    updateOverdueBills();
  }, [bills]);

  const updateOverdueBills = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    bills.forEach((bill) => {
      if (bill.status === 'pending') {
        const dueDate = new Date(bill.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        if (dueDate < today) {
          updateBill(bill.id, { status: 'overdue', updatedAt: new Date().toISOString() });
        }
      }
    });
  };

  // CRUD Operations
  const handleAddBill = () => {
    if (!formData.name || !formData.amount || !formData.dueDate) {
      setError('Please fill in all required fields');
      return;
    }

    const newBill: Bill = {
      id: Date.now().toString(),
      name: formData.name,
      payee: formData.payee,
      category: formData.category,
      amount: parseFloat(formData.amount),
      dueDate: formData.dueDate,
      recurring: formData.recurring,
      frequency: formData.frequency,
      status: 'pending',
      notes: formData.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addBill(newBill);
    resetForm();
    setShowBillModal(false);
  };

  const handleUpdateBill = () => {
    if (!editingBill) return;

    updateBill(editingBill.id, {
      name: formData.name,
      payee: formData.payee,
      category: formData.category,
      amount: parseFloat(formData.amount),
      dueDate: formData.dueDate,
      recurring: formData.recurring,
      frequency: formData.frequency,
      notes: formData.notes,
      updatedAt: new Date().toISOString(),
    });

    resetForm();
    setShowBillModal(false);
    setEditingBill(null);
  };

  const handleDeleteBill = (billId: string) => {
    deleteBill(billId);
  };

  const handleMarkAsPaid = (bill: Bill) => {
    const paymentDate = new Date().toISOString();

    const payment: Payment = {
      id: Date.now().toString(),
      billId: bill.id,
      billName: bill.name,
      amount: bill.amount,
      paidDate: paymentDate,
      notes: `Payment for ${bill.name}`,
    };

    updateBill(bill.id, {
      status: 'paid',
      paymentDate,
      updatedAt: new Date().toISOString(),
    });

    setPayments([...payments, payment]);
  };

  const handleAddCategory = () => {
    if (!newCategory.name) return;

    const category: BillCategory = {
      id: Date.now().toString(),
      name: newCategory.name,
      icon: 'tag',
      color: newCategory.color,
    };

    const customCategories = categories.filter((c) => !DEFAULT_CATEGORIES.find((dc) => dc.id === c.id));
    const updatedCustomCategories = [...customCategories, category];
    setCategories([...DEFAULT_CATEGORIES, ...updatedCustomCategories]);
    setNewCategory({ name: '', color: '#6B7280' });
    setShowCategoryModal(false);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      payee: '',
      category: 'utilities',
      amount: '',
      dueDate: new Date().toISOString().split('T')[0],
      recurring: false,
      frequency: 'monthly',
      notes: '',
    });
    setError(null);
  };

  const openEditModal = (bill: Bill) => {
    setEditingBill(bill);
    setFormData({
      name: bill.name,
      payee: bill.payee,
      category: bill.category,
      amount: bill.amount.toString(),
      dueDate: bill.dueDate,
      recurring: bill.recurring,
      frequency: bill.frequency,
      notes: bill.notes || '',
    });
    setShowBillModal(true);
  };

  // Computed values
  const filteredBills = useMemo(() => {
    return bills.filter((bill) => {
      const matchesSearch =
        bill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bill.payee.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || bill.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || bill.category === categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [bills, searchQuery, statusFilter, categoryFilter]);

  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    const thisMonthBills = bills.filter((b) => {
      const dueDate = new Date(b.dueDate);
      return dueDate.getMonth() === thisMonth && dueDate.getFullYear() === thisYear;
    });

    const totalDueThisMonth = thisMonthBills.filter((b) => b.status !== 'paid').reduce((sum, b) => sum + b.amount, 0);
    const paidThisMonth = thisMonthBills.filter((b) => b.status === 'paid').reduce((sum, b) => sum + b.amount, 0);
    const overdueAmount = bills.filter((b) => b.status === 'overdue').reduce((sum, b) => sum + b.amount, 0);
    const overdueCount = bills.filter((b) => b.status === 'overdue').length;

    return { totalDueThisMonth, paidThisMonth, overdueAmount, overdueCount };
  }, [bills]);

  // Styles
  const cardClass = `rounded-xl ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`;
  const inputClass = `w-full px-4 py-2.5 rounded-lg border ${
    isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
  } focus:ring-2 focus:ring-red-500/50 focus:border-red-500 outline-none transition-all`;
  const buttonPrimary = 'px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-medium';
  const buttonSecondary = `px-4 py-2 rounded-lg border ${
    isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
  } transition-colors`;

  const getStatusColor = (status: Bill['status']) => {
    switch (status) {
      case 'paid':
        return 'text-green-500 bg-green-500/10';
      case 'overdue':
        return 'text-red-500 bg-red-500/10';
      default:
        return 'text-yellow-500 bg-yellow-500/10';
    }
  };

  const getStatusIcon = (status: Bill['status']) => {
    switch (status) {
      case 'paid':
        return CheckCircle2;
      case 'overdue':
        return AlertTriangle;
      default:
        return Clock;
    }
  };

  const getCategoryById = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId) || DEFAULT_CATEGORIES[DEFAULT_CATEGORIES.length - 1];
  };

  return (
    <div className="space-y-6">
      {/* Prefill Indicator */}
      {isPrefilled && (
        <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 rounded-xl border border-red-500/20">
          <Sparkles className="w-4 h-4 text-red-500" />
          <span className="text-sm text-red-500 font-medium">{t('tools.billPaymentTracker.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
        </div>
      )}

      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-orange-500 mb-4">
          <Receipt className="w-8 h-8 text-white" />
        </div>
        <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.billPaymentTracker.billPaymentTracker', 'Bill Payment Tracker')}</h2>
        <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.billPaymentTracker.trackYourBillsAndNever', 'Track your bills and never miss a payment')}</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`${cardClass} p-4`}>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-500/10 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.billPaymentTracker.dueThisMonth', 'Due This Month')}</p>
              <p className="text-xl font-bold text-yellow-500">${stats.totalDueThisMonth.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className={`${cardClass} p-4`}>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.billPaymentTracker.paidThisMonth', 'Paid This Month')}</p>
              <p className="text-xl font-bold text-green-500">${stats.paidThisMonth.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className={`${cardClass} p-4`}>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-500/10 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Overdue ({stats.overdueCount})</p>
              <p className="text-xl font-bold text-red-500">${stats.overdueAmount.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          <input
            type="text"
            placeholder={t('tools.billPaymentTracker.searchBills', 'Search bills...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`${inputClass} pl-10`}
          />
        </div>

        <button onClick={() => setShowFilters(!showFilters)} className={buttonSecondary}>
          <Filter className="w-4 h-4 inline mr-2" />
          Filters
          {showFilters ? <ChevronUp className="w-4 h-4 inline ml-2" /> : <ChevronDown className="w-4 h-4 inline ml-2" />}
        </button>

        <button onClick={() => setShowPaymentHistory(true)} className={buttonSecondary}>
          <History className="w-4 h-4 inline mr-2" />
          {t('tools.billPaymentTracker.history', 'History')}
        </button>

        <ExportDropdown
          onExportCSV={() => exportToCSV(filteredBills, BILL_COLUMNS, { filename: 'bills' })}
          onExportExcel={() => exportToExcel(filteredBills, BILL_COLUMNS, { filename: 'bills' })}
          onExportJSON={() => exportToJSON({ bills: filteredBills, payments }, { filename: 'bill-payment-data' })}
          onExportPDF={async () => {
            await exportToPDF(filteredBills, BILL_COLUMNS, {
              filename: 'bills',
              title: 'Bill Payment Report',
              subtitle: `Due: $${stats.totalDueThisMonth.toFixed(2)} | Paid: $${stats.paidThisMonth.toFixed(2)} | Overdue: $${stats.overdueAmount.toFixed(2)}`,
            });
          }}
          onPrint={() => printData(filteredBills, BILL_COLUMNS, { title: 'Bill Payment Report' })}
          onCopyToClipboard={() => copyUtil(filteredBills, BILL_COLUMNS, 'tab')}
          theme={isDark ? 'dark' : 'light'}
        />

        <button
          onClick={() => {
            resetForm();
            setEditingBill(null);
            setShowBillModal(true);
          }}
          className={buttonPrimary}
        >
          <Plus className="w-4 h-4 inline mr-2" />
          {t('tools.billPaymentTracker.addBill', 'Add Bill')}
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className={`${cardClass} p-4 flex flex-wrap gap-4`}>
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.billPaymentTracker.status', 'Status')}</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={inputClass}>
              <option value="all">{t('tools.billPaymentTracker.allStatuses', 'All Statuses')}</option>
              <option value="pending">{t('tools.billPaymentTracker.pending', 'Pending')}</option>
              <option value="paid">{t('tools.billPaymentTracker.paid', 'Paid')}</option>
              <option value="overdue">{t('tools.billPaymentTracker.overdue', 'Overdue')}</option>
            </select>
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.billPaymentTracker.category', 'Category')}</label>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className={inputClass}>
              <option value="all">{t('tools.billPaymentTracker.allCategories', 'All Categories')}</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={() => setShowCategoryModal(true)} className={buttonSecondary}>
              <Plus className="w-4 h-4 inline mr-1" />
              {t('tools.billPaymentTracker.newCategory', 'New Category')}
            </button>
          </div>
        </div>
      )}

      {/* Sync Status */}
      <div className="flex justify-end">
        <WidgetEmbedButton toolSlug="bill-payment-tracker" toolName="Bill Payment Tracker" />

        <SyncStatus
          isSynced={isSynced}
          isSaving={isSaving}
          lastSaved={lastSaved}
          syncError={syncError}
          onForceSync={forceSync}
          theme={isDark ? 'dark' : 'light'}
          showLabel={true}
          size="sm"
        />
      </div>

      {/* Bills List */}
      <div className="space-y-3">
        {billsLoading ? (
          <div className={`${cardClass} p-8 text-center`}>
            <RefreshCw className={`w-8 h-8 mx-auto animate-spin ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.billPaymentTracker.loadingBills', 'Loading bills...')}</p>
          </div>
        ) : filteredBills.length === 0 ? (
          <div className={`${cardClass} p-8 text-center`}>
            <Receipt className={`w-12 h-12 mx-auto ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
            <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {bills.length === 0 ? t('tools.billPaymentTracker.noBillsYetAddYour', 'No bills yet. Add your first bill!') : t('tools.billPaymentTracker.noBillsMatchYourFilters', 'No bills match your filters.')}
            </p>
          </div>
        ) : (
          filteredBills.map((bill) => {
            const category = getCategoryById(bill.category);
            const CategoryIcon = getCategoryIcon(category.icon);
            const StatusIcon = getStatusIcon(bill.status);

            return (
              <div
                key={bill.id}
                className={`${cardClass} p-4 ${bill.status === 'overdue' ? 'border-red-500/50 bg-red-500/5' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg" style={{ backgroundColor: `${category.color}20` }}>
                      <CategoryIcon className="w-5 h-5" style={{ color: category.color }} />
                    </div>
                    <div>
                      <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{bill.name}</h3>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {bill.payee} {bill.recurring && `(${bill.frequency})`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>${bill.amount.toFixed(2)}</p>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="w-3 h-3" />
                        <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                          {new Date(bill.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${getStatusColor(bill.status)}`}>
                      <StatusIcon className="w-3 h-3" />
                      <span className="text-xs font-medium capitalize">{bill.status}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      {bill.status !== 'paid' && (
                        <button
                          onClick={() => handleMarkAsPaid(bill)}
                          className="p-2 text-green-500 hover:bg-green-500/10 rounded-lg transition-colors"
                          title={t('tools.billPaymentTracker.markAsPaid', 'Mark as Paid')}
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => openEditModal(bill)}
                        className={`p-2 ${isDark ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'} rounded-lg transition-colors`}
                        title={t('tools.billPaymentTracker.edit', 'Edit')}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteBill(bill.id)}
                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {bill.notes && (
                  <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} pl-16`}>{bill.notes}</p>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add/Edit Bill Modal */}
      {showBillModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className={`w-full max-w-lg ${cardClass} p-6`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {editingBill ? t('tools.billPaymentTracker.editBill', 'Edit Bill') : t('tools.billPaymentTracker.addNewBill', 'Add New Bill')}
              </h3>
              <button
                onClick={() => {
                  setShowBillModal(false);
                  setEditingBill(null);
                  resetForm();
                }}
                className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">{error}</div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.billPaymentTracker.billName', 'Bill Name *')}
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={t('tools.billPaymentTracker.eGElectricBill', 'e.g., Electric Bill')}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.billPaymentTracker.payee', 'Payee')}</label>
                  <input
                    type="text"
                    value={formData.payee}
                    onChange={(e) => setFormData({ ...formData, payee: e.target.value })}
                    placeholder={t('tools.billPaymentTracker.eGPowerCompany', 'e.g., Power Company')}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.billPaymentTracker.category2', 'Category')}</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className={inputClass}
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.billPaymentTracker.amount', 'Amount *')}</label>
                  <div className="relative">
                    <DollarSign
                      className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                    />
                    <input
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      className={`${inputClass} pl-9`}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.billPaymentTracker.dueDate', 'Due Date *')}</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.billPaymentTracker.frequency', 'Frequency')}</label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value as Bill['frequency'] })}
                    className={inputClass}
                  >
                    {FREQUENCY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="recurring"
                  checked={formData.recurring}
                  onChange={(e) => setFormData({ ...formData, recurring: e.target.checked })}
                  className="w-4 h-4 text-red-500 rounded"
                />
                <label htmlFor="recurring" className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.billPaymentTracker.thisIsARecurringBill', 'This is a recurring bill')}
                </label>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.billPaymentTracker.notes', 'Notes')}</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder={t('tools.billPaymentTracker.addAnyNotes', 'Add any notes...')}
                  rows={3}
                  className={inputClass}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowBillModal(false);
                    setEditingBill(null);
                    resetForm();
                  }}
                  className={`flex-1 ${buttonSecondary}`}
                >
                  {t('tools.billPaymentTracker.cancel', 'Cancel')}
                </button>
                <button onClick={editingBill ? handleUpdateBill : handleAddBill} className={`flex-1 ${buttonPrimary}`}>
                  {editingBill ? t('tools.billPaymentTracker.updateBill', 'Update Bill') : t('tools.billPaymentTracker.addBill2', 'Add Bill')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className={`w-full max-w-sm ${cardClass} p-6`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.billPaymentTracker.addCategory', 'Add Category')}</h3>
              <button
                onClick={() => setShowCategoryModal(false)}
                className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.billPaymentTracker.categoryName', 'Category Name')}
                </label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  placeholder={t('tools.billPaymentTracker.eGGymMembership', 'e.g., Gym Membership')}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.billPaymentTracker.color', 'Color')}</label>
                <input
                  type="color"
                  value={newCategory.color}
                  onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                  className="w-full h-10 rounded-lg cursor-pointer"
                />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowCategoryModal(false)} className={`flex-1 ${buttonSecondary}`}>
                  {t('tools.billPaymentTracker.cancel2', 'Cancel')}
                </button>
                <button onClick={handleAddCategory} className={`flex-1 ${buttonPrimary}`}>
                  {t('tools.billPaymentTracker.addCategory2', 'Add Category')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment History Modal */}
      {showPaymentHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className={`w-full max-w-2xl max-h-[80vh] ${cardClass} p-6 overflow-hidden flex flex-col`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.billPaymentTracker.paymentHistory', 'Payment History')}</h3>
              <button
                onClick={() => setShowPaymentHistory(false)}
                className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3">
              {payments.length === 0 ? (
                <div className="text-center py-8">
                  <History className={`w-12 h-12 mx-auto ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                  <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.billPaymentTracker.noPaymentHistoryYet', 'No payment history yet.')}</p>
                </div>
              ) : (
                payments
                  .sort((a, b) => new Date(b.paidDate).getTime() - new Date(a.paidDate).getTime())
                  .map((payment) => (
                    <div key={payment.id} className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{payment.billName}</h4>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {new Date(payment.paidDate).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="font-bold text-green-500">${payment.amount.toFixed(2)}</span>
                      </div>
                    </div>
                  ))
              )}
            </div>

            <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
              <button onClick={() => setShowPaymentHistory(false)} className={`w-full ${buttonSecondary}`}>
                {t('tools.billPaymentTracker.close', 'Close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillPaymentTrackerTool;
