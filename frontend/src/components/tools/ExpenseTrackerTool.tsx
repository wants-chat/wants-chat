import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Receipt,
  Plus,
  Search,
  Edit2,
  Trash2,
  Calendar,
  DollarSign,
  Tag,
  X,
  Save,
  Loader2,
  Filter,
  ChevronDown,
  TrendingUp,
  AlertCircle,
  Upload,
} from 'lucide-react';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { useToolData } from '../../hooks/useToolData';
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
import { api } from '../../lib/api';
import { UIConfig } from '../ContextualUI';

interface ExpenseCategory {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  budget_amount?: number;
}

interface Expense {
  id: string;
  description: string;
  amount: number;
  currency: string;
  category_id?: string;
  category_name?: string;
  category_color?: string;
  payment_method?: string;
  merchant?: string;
  expense_date: string;
  receipt_url?: string;
  status: 'pending' | 'approved' | 'rejected' | 'reimbursed';
  is_tax_deductible: boolean;
  notes?: string;
  created_at: string;
}

interface ExpenseTrackerToolProps {
  uiConfig?: UIConfig;
}

const paymentMethods = [
  { value: 'cash', label: 'Cash' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'debit_card', label: 'Debit Card' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'check', label: 'Check' },
  { value: 'paypal', label: 'PayPal' },
  { value: 'other', label: 'Other' },
];

const expenseStatuses = [
  { value: 'pending', label: 'Pending', color: 'yellow' },
  { value: 'approved', label: 'Approved', color: 'green' },
  { value: 'rejected', label: 'Rejected', color: 'red' },
  { value: 'reimbursed', label: 'Reimbursed', color: 'blue' },
];

// Column configuration for exports
const expenseColumns: ColumnConfig[] = [
  { key: 'description', header: 'Description', type: 'string' },
  { key: 'amount', header: 'Amount', type: 'currency' },
  { key: 'currency', header: 'Currency', type: 'string' },
  { key: 'category_name', header: 'Category', type: 'string' },
  { key: 'merchant', header: 'Merchant', type: 'string' },
  { key: 'payment_method', header: 'Payment Method', type: 'string' },
  { key: 'expense_date', header: 'Date', type: 'date' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'is_tax_deductible', header: 'Tax Deductible', type: 'boolean' },
  { key: 'notes', header: 'Notes', type: 'string' },
];

export const ExpenseTrackerTool: React.FC<ExpenseTrackerToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // useToolData hook for expenses with backend sync
  const {
    data: expenses,
    addItem,
    updateItem,
    deleteItem,
    isLoading: loading,
    isSaving: saving,
    isSynced,
    syncError,
    lastSaved,
    forceSync,
    exportCSV: exportExpensesCSV,
    exportExcel: exportExpensesExcel,
    exportJSON: exportExpensesJSON,
    exportPDF: exportExpensesPDF,
    print: printExpenses,
    copyToClipboard: copyExpensesToClipboard,
  } = useToolData<Expense>(
    'expense-tracker',
    [],
    expenseColumns
  );

  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  // Summary
  const [summary, setSummary] = useState({ total_amount: 0, count: 0 });

  // Form state
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    currency: 'USD',
    category_id: '',
    payment_method: 'cash',
    merchant: '',
    expense_date: new Date().toISOString().split('T')[0],
    status: 'pending' as Expense['status'],
    is_tax_deductible: false,
    notes: '',
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    color: '#0D9488',
    budget_amount: '',
  });

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await api.get('/business/expense-categories');
      setCategories(Array.isArray(response) ? response : []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Open modal for new expense
  const handleAddNew = () => {
    setEditingExpense(null);
    setFormData({
      description: '',
      amount: '',
      currency: 'USD',
      category_id: '',
      payment_method: 'cash',
      merchant: '',
      expense_date: new Date().toISOString().split('T')[0],
      status: 'pending',
      is_tax_deductible: false,
      notes: '',
    });
    setShowModal(true);
  };

  // Open modal for editing
  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData({
      description: expense.description,
      amount: expense.amount.toString(),
      currency: expense.currency,
      category_id: expense.category_id || '',
      payment_method: expense.payment_method || 'cash',
      merchant: expense.merchant || '',
      expense_date: expense.expense_date.split('T')[0],
      status: expense.status,
      is_tax_deductible: expense.is_tax_deductible,
      notes: expense.notes || '',
    });
    setShowModal(true);
  };

  // Save expense
  const handleSave = async () => {
    if (!formData.description.trim() || !formData.amount) {
      setError('Description and amount are required');
      return;
    }

    try {
      setError(null);

      const expenseData = {
        ...formData,
        amount: parseFloat(formData.amount),
        category_id: formData.category_id || null,
      };

      if (editingExpense) {
        // Update existing expense
        updateItem(editingExpense.id, expenseData);
      } else {
        // Add new expense with generated ID
        const newExpense: Expense = {
          ...expenseData,
          id: Date.now().toString(),
          created_at: new Date().toISOString(),
        };
        addItem(newExpense);
      }

      setShowModal(false);
    } catch (err: any) {
      setError(err.message || 'Failed to save expense');
    }
  };

  // Save category
  const handleSaveCategory = async () => {
    if (!categoryForm.name.trim()) {
      setError('Category name is required');
      return;
    }

    try {
      await api.post('/business/expense-categories', {
        name: categoryForm.name,
        color: categoryForm.color,
        budget_amount: categoryForm.budget_amount ? parseFloat(categoryForm.budget_amount) : null,
      });
      setShowCategoryModal(false);
      fetchCategories();
      setCategoryForm({ name: '', color: '#0D9488', budget_amount: '' });
    } catch (err: any) {
      setError(err.message || 'Failed to save category');
    }
  };

  // Delete expense
  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Expense',
      message: 'Are you sure you want to delete this expense?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });

    if (!confirmed) return;

    try {
      deleteItem(id);
    } catch (err: any) {
      setError(err.message || 'Failed to delete expense');
    }
  };

  const getStatusColor = (status: string) => {
    const statusObj = expenseStatuses.find(s => s.value === status);
    const colors: Record<string, string> = {
      yellow: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      green: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      red: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    };
    return colors[statusObj?.color || 'gray'];
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  };

  return (
    <div className={`rounded-xl shadow-sm border overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      {/* Header */}
      <div className={`px-6 py-4 border-b ${isDark ? 'bg-gray-800/50 border-gray-700' : t('tools.expenseTracker.bgGradientToRFrom', 'bg-gradient-to-r from-white to-[#0D9488]/5 border-gray-100')}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#0D9488]/10 rounded-lg">
              <Receipt className="w-5 h-5 text-[#0D9488]" />
            </div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.expenseTracker.expenseTracker', 'Expense Tracker')}
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('tools.expenseTracker.trackAndManageYourExpenses', 'Track and manage your expenses')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <WidgetEmbedButton toolSlug="expense-tracker" toolName="Expense Tracker" />

            <SyncStatus
              isSynced={isSynced}
              isSaving={saving}
              lastSaved={lastSaved}
              syncError={syncError}
              onForceSync={forceSync}
              theme={isDark ? 'dark' : 'light'}
              size="sm"
            />
            <ExportDropdown
              onExportCSV={() => exportExpensesCSV({ filename: 'expenses' })}
              onExportExcel={() => exportExpensesExcel({ filename: 'expenses' })}
              onExportJSON={() => exportExpensesJSON({ filename: 'expenses' })}
              onExportPDF={() => exportExpensesPDF({ filename: 'expenses', title: 'Expense Report' })}
              onPrint={() => printExpenses('Expense Report')}
              onCopyToClipboard={() => copyExpensesToClipboard('csv')}
              disabled={expenses.length === 0}
              showImport={false}
              theme={isDark ? 'dark' : 'light'}
            />
            <button
              onClick={() => setShowCategoryModal(true)}
              className={`flex items-center gap-2 px-3 py-2 border rounded-lg ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
            >
              <Tag className="w-4 h-4" />
              {t('tools.expenseTracker.categories', 'Categories')}
            </button>
            <button
              onClick={handleAddNew}
              className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t('tools.expenseTracker.addExpense', 'Add Expense')}
            </button>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className={`grid grid-cols-2 gap-4 p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-5 h-5 text-[#0D9488]" />
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.expenseTracker.totalExpenses', 'Total Expenses')}</p>
          </div>
          <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {formatCurrency(summary.total_amount)}
          </p>
        </div>
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.expenseTracker.transactions', 'Transactions')}</p>
          </div>
          <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {summary.count}
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="p-4 space-y-3">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <input
              type="text"
              placeholder={t('tools.expenseTracker.searchExpenses', 'Search expenses...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400' : 'bg-white border-gray-200 text-gray-900'}`}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
          >
            <Filter className="w-4 h-4" />
            Filters
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {showFilters && (
          <div className="flex gap-3">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className={`px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
            >
              <option value="">{t('tools.expenseTracker.allCategories', 'All Categories')}</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
            >
              <option value="">{t('tools.expenseTracker.allStatuses', 'All Statuses')}</option>
              {expenseStatuses.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mx-4 mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-600 dark:text-red-400">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Expense List */}
      <div className="px-4 pb-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#0D9488]" />
          </div>
        ) : expenses.length === 0 ? (
          <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            <Receipt className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>{t('tools.expenseTracker.noExpensesFound', 'No expenses found')}</p>
            <button onClick={handleAddNew} className="mt-2 text-[#0D9488] hover:underline">
              {t('tools.expenseTracker.addYourFirstExpense', 'Add your first expense')}
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {expenses.map((expense) => (
              <div
                key={expense.id}
                className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700/50 border-gray-600 hover:bg-gray-700' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'} transition-colors`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {expense.description}
                      </h4>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(expense.status)}`}>
                        {expenseStatuses.find(s => s.value === expense.status)?.label}
                      </span>
                    </div>
                    <div className={`flex flex-wrap gap-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      <span className="flex items-center gap-1 font-semibold text-[#0D9488]">
                        <DollarSign className="w-3 h-3" />
                        {formatCurrency(expense.amount, expense.currency)}
                      </span>
                      {expense.merchant && (
                        <span>{expense.merchant}</span>
                      )}
                      {expense.category_name && (
                        <span className="flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          {expense.category_name}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(expense.expense_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(expense)}
                      className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                    >
                      <Edit2 className="w-4 h-4 text-gray-500" />
                    </button>
                    <button
                      onClick={() => handleDelete(expense.id)}
                      className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Expense Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className={`w-full max-w-lg rounded-xl shadow-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {editingExpense ? t('tools.expenseTracker.editExpense', 'Edit Expense') : t('tools.expenseTracker.addExpense2', 'Add Expense')}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.expenseTracker.description', 'Description *')}
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                  placeholder={t('tools.expenseTracker.whatWasThisExpenseFor', 'What was this expense for?')}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.expenseTracker.amount', 'Amount *')}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.expenseTracker.date', 'Date')}
                  </label>
                  <input
                    type="date"
                    value={formData.expense_date}
                    onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.expenseTracker.category', 'Category')}
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                  >
                    <option value="">{t('tools.expenseTracker.selectCategory', 'Select category')}</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.expenseTracker.paymentMethod', 'Payment Method')}
                  </label>
                  <select
                    value={formData.payment_method}
                    onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                  >
                    {paymentMethods.map(m => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.expenseTracker.merchantVendor', 'Merchant/Vendor')}
                </label>
                <input
                  type="text"
                  value={formData.merchant}
                  onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                  placeholder={t('tools.expenseTracker.whereDidYouSpend', 'Where did you spend?')}
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_tax_deductible}
                    onChange={(e) => setFormData({ ...formData, is_tax_deductible: e.target.checked })}
                    className="w-4 h-4 rounded text-[#0D9488]"
                  />
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.expenseTracker.taxDeductible', 'Tax Deductible')}</span>
                </label>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.expenseTracker.notes', 'Notes')}
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  className={`w-full px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                />
              </div>
            </div>

            <div className={`flex justify-end gap-3 p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <button
                onClick={() => setShowModal(false)}
                className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                {t('tools.expenseTracker.cancel', 'Cancel')}
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? t('tools.expenseTracker.saving', 'Saving...') : t('tools.expenseTracker.save', 'Save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className={`w-full max-w-md rounded-xl shadow-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.expenseTracker.addCategory', 'Add Category')}
              </h3>
              <button onClick={() => setShowCategoryModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.expenseTracker.categoryName', 'Category Name *')}
                </label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                  placeholder={t('tools.expenseTracker.eGFoodTransportationOffice', 'e.g., Food, Transportation, Office')}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.expenseTracker.color', 'Color')}
                  </label>
                  <input
                    type="color"
                    value={categoryForm.color}
                    onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                    className="w-full h-10 rounded-lg cursor-pointer"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.expenseTracker.budgetOptional', 'Budget (Optional)')}
                  </label>
                  <input
                    type="number"
                    value={categoryForm.budget_amount}
                    onChange={(e) => setCategoryForm({ ...categoryForm, budget_amount: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                    placeholder={t('tools.expenseTracker.monthlyBudget', 'Monthly budget')}
                  />
                </div>
              </div>

              {/* Existing categories */}
              {categories.length > 0 && (
                <div>
                  <p className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.expenseTracker.existingCategories', 'Existing Categories:')}</p>
                  <div className="flex flex-wrap gap-2">
                    {categories.map(c => (
                      <span
                        key={c.id}
                        className={`px-3 py-1 text-sm rounded-full ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                        style={{ borderLeft: `3px solid ${c.color || '#0D9488'}` }}
                      >
                        {c.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className={`flex justify-end gap-3 p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <button
                onClick={() => setShowCategoryModal(false)}
                className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                {t('tools.expenseTracker.close', 'Close')}
              </button>
              <button
                onClick={handleSaveCategory}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Add Category
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog />
    </div>
  );
};

export default ExpenseTrackerTool;
