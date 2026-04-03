import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Wallet,
  DollarSign,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Plus,
  Trash2,
  Edit2,
  X,
  Check,
  Calendar,
  AlertTriangle,
  Home,
  Car,
  Utensils,
  Zap,
  Heart,
  Film,
  ShoppingBag,
  CreditCard,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  Filter,
  BarChart3,
  Target,
  Award,
  Sparkles,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useToolData } from '../../hooks/useToolData';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { ExportDropdown } from '../ui/ExportDropdown';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';

interface BudgetDashboardToolProps {
  uiConfig?: UIConfig;
}

// Types
interface IncomeSource {
  id: string;
  name: string;
  amount: number;
  frequency: 'weekly' | 'bi-weekly' | 'monthly';
}

interface ExpenseCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  budgetLimit: number;
  isCustom: boolean;
}

interface Transaction {
  id: string;
  date: string;
  categoryId: string;
  description: string;
  amount: number;
  type: 'expense' | 'income';
}

interface BudgetData {
  id: string;
  type: 'budget-item';
  incomes: IncomeSource[];
  categories: ExpenseCategory[];
  transactions: Transaction[];
}

// Default categories
const defaultCategories: ExpenseCategory[] = [
  { id: 'housing', name: 'Housing', icon: 'Home', color: '#3B82F6', budgetLimit: 0, isCustom: false },
  { id: 'transportation', name: 'Transportation', icon: 'Car', color: '#8B5CF6', budgetLimit: 0, isCustom: false },
  { id: 'food', name: 'Food', icon: 'Utensils', color: '#F59E0B', budgetLimit: 0, isCustom: false },
  { id: 'utilities', name: 'Utilities', icon: 'Zap', color: '#10B981', budgetLimit: 0, isCustom: false },
  { id: 'healthcare', name: 'Healthcare', icon: 'Heart', color: '#EF4444', budgetLimit: 0, isCustom: false },
  { id: 'entertainment', name: 'Entertainment', icon: 'Film', color: '#EC4899', budgetLimit: 0, isCustom: false },
  { id: 'shopping', name: 'Shopping', icon: 'ShoppingBag', color: '#06B6D4', budgetLimit: 0, isCustom: false },
  { id: 'savings', name: 'Savings', icon: 'PiggyBank', color: '#22C55E', budgetLimit: 0, isCustom: false },
  { id: 'debt', name: 'Debt', icon: 'CreditCard', color: '#F97316', budgetLimit: 0, isCustom: false },
  { id: 'other', name: 'Other', icon: 'MoreHorizontal', color: '#6B7280', budgetLimit: 0, isCustom: false },
];

const iconMap: { [key: string]: React.ElementType } = {
  Home,
  Car,
  Utensils,
  Zap,
  Heart,
  Film,
  ShoppingBag,
  PiggyBank,
  CreditCard,
  MoreHorizontal,
  Wallet,
  Target,
};

const colorOptions = [
  '#3B82F6', '#8B5CF6', '#F59E0B', '#10B981', '#EF4444',
  '#EC4899', '#06B6D4', '#22C55E', '#F97316', '#6B7280',
  '#14B8A6', '#A855F7', '#84CC16', '#0EA5E9', '#D946EF',
];

const STORAGE_KEY = 'budget_dashboard_data';

const defaultBudgetData: BudgetData[] = [
  {
    id: 'main-budget',
    type: 'budget-item',
    incomes: [],
    categories: defaultCategories,
    transactions: [],
  },
];

// Column config for export/import (used by useToolData)
const budgetColumns = [
  { key: 'incomes', header: 'Incomes' },
  { key: 'categories', header: 'Categories' },
  { key: 'transactions', header: 'Transactions' },
];

// Column config for transaction export
const TRANSACTION_EXPORT_COLUMNS: ColumnConfig[] = [
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'description', header: 'Description', type: 'string' },
  { key: 'categoryName', header: 'Category', type: 'string' },
  { key: 'type', header: 'Type', type: 'string' },
  { key: 'amount', header: 'Amount', type: 'currency' },
];

export const BudgetDashboardTool: React.FC<BudgetDashboardToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Handle prefill data
  useEffect(() => {
    if (uiConfig?.prefillData) {
      setIsPrefilled(true);
    }
  }, [uiConfig]);

  // Use hook for backend sync with localStorage fallback
  const {
    data: budgetDataArray,
    updateItem,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<BudgetData>('budget-dashboard', defaultBudgetData, budgetColumns, {
    autoSave: true,
    autoSaveDelay: 1000,
  });

  // Get the main budget data (always use the first item)
  const data = budgetDataArray[0] || defaultBudgetData[0];

  const [activeTab, setActiveTab] = useState<'dashboard' | 'income' | 'budget' | 'transactions'>('dashboard');
  const [dateRange, setDateRange] = useState<'this-month' | 'last-month' | 'custom'>('this-month');
  const [customDateStart, setCustomDateStart] = useState('');
  const [customDateEnd, setCustomDateEnd] = useState('');

  // Modal states
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [editingIncome, setEditingIncome] = useState<IncomeSource | null>(null);
  const [editingCategory, setEditingCategory] = useState<ExpenseCategory | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Form states
  const [incomeForm, setIncomeForm] = useState({ name: '', amount: '', frequency: 'monthly' as const });
  const [categoryForm, setCategoryForm] = useState({ name: '', icon: 'Wallet', color: '#3B82F6', budgetLimit: '' });
  const [transactionForm, setTransactionForm] = useState({
    date: new Date().toISOString().split('T')[0],
    categoryId: '',
    description: '',
    amount: '',
    type: 'expense' as const,
  });

  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Calculate date range
  const getDateRange = useMemo(() => {
    const now = new Date();
    let start: Date;
    let end: Date;

    if (dateRange === 'this-month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } else if (dateRange === 'last-month') {
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end = new Date(now.getFullYear(), now.getMonth(), 0);
    } else {
      start = customDateStart ? new Date(customDateStart) : new Date(now.getFullYear(), now.getMonth(), 1);
      end = customDateEnd ? new Date(customDateEnd) : new Date();
    }

    return { start, end };
  }, [dateRange, customDateStart, customDateEnd]);

  // Filter transactions by date range
  const filteredTransactions = useMemo(() => {
    const { start, end } = getDateRange;
    return data.transactions.filter((t) => {
      const date = new Date(t.date);
      return date >= start && date <= end;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [data.transactions, getDateRange]);

  // Calculate total monthly income
  const totalMonthlyIncome = useMemo(() => {
    return data.incomes.reduce((total, income) => {
      let monthlyAmount = income.amount;
      if (income.frequency === 'weekly') {
        monthlyAmount = income.amount * 4.33;
      } else if (income.frequency === 'bi-weekly') {
        monthlyAmount = income.amount * 2.17;
      }
      return total + monthlyAmount;
    }, 0);
  }, [data.incomes]);

  // Calculate total expenses for the period
  const totalExpenses = useMemo(() => {
    return filteredTransactions
      .filter((t) => t.type === 'expense')
      .reduce((total, t) => total + t.amount, 0);
  }, [filteredTransactions]);

  // Calculate category spending
  const categorySpending = useMemo(() => {
    const spending: { [key: string]: number } = {};
    filteredTransactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        spending[t.categoryId] = (spending[t.categoryId] || 0) + t.amount;
      });
    return spending;
  }, [filteredTransactions]);

  // Calculate savings rate
  const savingsRate = useMemo(() => {
    if (totalMonthlyIncome === 0) return 0;
    const savings = totalMonthlyIncome - totalExpenses;
    return Math.max(0, (savings / totalMonthlyIncome) * 100);
  }, [totalMonthlyIncome, totalExpenses]);

  // Calculate budget health score (0-100)
  const budgetHealthScore = useMemo(() => {
    let score = 100;
    let categoriesWithBudget = 0;

    data.categories.forEach((cat) => {
      if (cat.budgetLimit > 0) {
        categoriesWithBudget++;
        const spent = categorySpending[cat.id] || 0;
        const percentage = (spent / cat.budgetLimit) * 100;

        if (percentage > 100) {
          score -= 15; // Over budget penalty
        } else if (percentage > 90) {
          score -= 5; // Near limit warning
        }
      }
    });

    // Bonus for savings rate
    if (savingsRate >= 20) score += 10;
    else if (savingsRate >= 10) score += 5;

    // Penalty for no budget set
    if (categoriesWithBudget === 0) score -= 20;

    return Math.max(0, Math.min(100, score));
  }, [data.categories, categorySpending, savingsRate]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Income handlers
  const handleAddIncome = () => {
    if (!incomeForm.name || !incomeForm.amount) return;

    const newIncome: IncomeSource = {
      id: editingIncome?.id || Date.now().toString(),
      name: incomeForm.name,
      amount: parseFloat(incomeForm.amount),
      frequency: incomeForm.frequency,
    };

    const updatedIncomes = editingIncome
      ? data.incomes.map((i) => (i.id === editingIncome.id ? newIncome : i))
      : [...data.incomes, newIncome];

    updateItem(data.id, { incomes: updatedIncomes });

    setShowIncomeModal(false);
    setEditingIncome(null);
    setIncomeForm({ name: '', amount: '', frequency: 'monthly' });
  };

  const handleDeleteIncome = (id: string) => {
    const updatedIncomes = data.incomes.filter((i) => i.id !== id);
    updateItem(data.id, { incomes: updatedIncomes });
  };

  // Category handlers
  const handleAddCategory = () => {
    if (!categoryForm.name) return;

    const newCategory: ExpenseCategory = {
      id: editingCategory?.id || Date.now().toString(),
      name: categoryForm.name,
      icon: categoryForm.icon,
      color: categoryForm.color,
      budgetLimit: parseFloat(categoryForm.budgetLimit) || 0,
      isCustom: editingCategory ? editingCategory.isCustom : true,
    };

    const updatedCategories = editingCategory
      ? data.categories.map((c) => (c.id === editingCategory.id ? newCategory : c))
      : [...data.categories, newCategory];

    updateItem(data.id, { categories: updatedCategories });

    setShowCategoryModal(false);
    setEditingCategory(null);
    setCategoryForm({ name: '', icon: 'Wallet', color: '#3B82F6', budgetLimit: '' });
  };

  const handleDeleteCategory = (id: string) => {
    const updatedCategories = data.categories.filter((c) => c.id !== id);
    const updatedTransactions = data.transactions.filter((t) => t.categoryId !== id);
    updateItem(data.id, { categories: updatedCategories, transactions: updatedTransactions });
  };

  const handleUpdateBudgetLimit = (categoryId: string, limit: number) => {
    const updatedCategories = data.categories.map((c) =>
      c.id === categoryId ? { ...c, budgetLimit: limit } : c
    );
    updateItem(data.id, { categories: updatedCategories });
  };

  // Transaction handlers
  const handleAddTransaction = () => {
    if (!transactionForm.categoryId || !transactionForm.amount || !transactionForm.date) return;

    const newTransaction: Transaction = {
      id: editingTransaction?.id || Date.now().toString(),
      date: transactionForm.date,
      categoryId: transactionForm.categoryId,
      description: transactionForm.description,
      amount: parseFloat(transactionForm.amount),
      type: transactionForm.type,
    };

    const updatedTransactions = editingTransaction
      ? data.transactions.map((t) =>
          t.id === editingTransaction.id ? newTransaction : t
        )
      : [...data.transactions, newTransaction];

    updateItem(data.id, { transactions: updatedTransactions });

    setShowTransactionModal(false);
    setEditingTransaction(null);
    setTransactionForm({
      date: new Date().toISOString().split('T')[0],
      categoryId: '',
      description: '',
      amount: '',
      type: 'expense',
    });
  };

  const handleDeleteTransaction = (id: string) => {
    const updatedTransactions = data.transactions.filter((t) => t.id !== id);
    updateItem(data.id, { transactions: updatedTransactions });
  };

  // Get category by ID
  const getCategoryById = (id: string) => {
    return data.categories.find((c) => c.id === id);
  };

  // Get icon component
  const getIconComponent = (iconName: string) => {
    return iconMap[iconName] || Wallet;
  };

  // Running balance
  const runningBalance = useMemo(() => {
    let balance = totalMonthlyIncome;
    return filteredTransactions.map((t) => {
      if (t.type === 'expense') {
        balance -= t.amount;
      } else {
        balance += t.amount;
      }
      return { ...t, balance };
    });
  }, [filteredTransactions, totalMonthlyIncome]);

  // Prepare export data with category names for better readability
  const exportData = useMemo(() => {
    return filteredTransactions.map((t) => {
      const category = getCategoryById(t.categoryId);
      return {
        date: t.date,
        description: t.description || category?.name || 'Transaction',
        categoryName: category?.name || 'Unknown',
        type: t.type,
        amount: t.amount,
      };
    });
  }, [filteredTransactions, data.categories]);

  const isDark = theme === 'dark';

  const cardBg = theme === 'dark' ? 'bg-gray-800' : 'bg-white';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
  const borderColor = theme === 'dark' ? 'border-gray-700' : 'border-gray-200';
  const inputBg = theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900';

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className={`${cardBg} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h1 className={`text-2xl font-bold ${textPrimary}`}>{t('tools.budgetDashboard.budgetDashboard', 'Budget Dashboard')}</h1>
                <p className={`text-sm ${textSecondary}`}>{t('tools.budgetDashboard.trackYourIncomeExpensesAnd', 'Track your income, expenses, and savings')}</p>
              </div>
              <div className="ml-4 flex items-center gap-3">
                <WidgetEmbedButton toolSlug="budget-dashboard" toolName="Budget Dashboard" />

                <SyncStatus
                  isSynced={isSynced}
                  isSaving={isSaving}
                  lastSaved={lastSaved}
                  syncError={syncError}
                  onForceSync={forceSync}
                  theme={theme}
                  showLabel={true}
                  size="sm"
                />
                <ExportDropdown
                  onExportCSV={() => exportToCSV(exportData, TRANSACTION_EXPORT_COLUMNS, { filename: 'budget-transactions' })}
                  onExportExcel={() => exportToExcel(exportData, TRANSACTION_EXPORT_COLUMNS, { filename: 'budget-transactions' })}
                  onExportJSON={() => exportToJSON(exportData, { filename: 'budget-transactions' })}
                  onExportPDF={async () => { await exportToPDF(exportData, TRANSACTION_EXPORT_COLUMNS, { filename: 'budget-transactions', title: 'Budget Transactions' }); }}
                  onPrint={() => printData(exportData, TRANSACTION_EXPORT_COLUMNS, { title: 'Budget Transactions' })}
                  onCopyToClipboard={() => copyUtil(exportData, TRANSACTION_EXPORT_COLUMNS, 'tab')}
                  showImport={false}
                  theme={isDark ? 'dark' : 'light'}
                />
              </div>
            </div>

            {/* Date Range Filter */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1">
                <Filter className={`w-4 h-4 ${textSecondary}`} />
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value as typeof dateRange)}
                  className={`px-3 py-2 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                >
                  <option value="this-month">{t('tools.budgetDashboard.thisMonth', 'This Month')}</option>
                  <option value="last-month">{t('tools.budgetDashboard.lastMonth', 'Last Month')}</option>
                  <option value="custom">{t('tools.budgetDashboard.customRange', 'Custom Range')}</option>
                </select>
              </div>

              {dateRange === 'custom' && (
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={customDateStart}
                    onChange={(e) => setCustomDateStart(e.target.value)}
                    className={`px-3 py-2 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                  <span className={textSecondary}>to</span>
                  <input
                    type="date"
                    value={customDateEnd}
                    onChange={(e) => setCustomDateEnd(e.target.value)}
                    className={`px-3 py-2 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {isPrefilled && (
          <div className={`p-3 rounded-lg flex items-center gap-2 ${theme === 'dark' ? 'bg-teal-900/20 border border-teal-800' : 'bg-teal-50 border border-teal-200'}`}>
            <Sparkles className="w-4 h-4 text-teal-500" />
            <span className={`text-sm ${theme === 'dark' ? 'text-teal-400' : 'text-teal-700'}`}>
              {t('tools.budgetDashboard.preFilledBasedOnYour', 'Pre-filled based on your request')}
            </span>
          </div>
        )}

        {/* Tabs */}
        <div className={`${cardBg} rounded-lg shadow-lg p-2 mb-6`}>
          <div className="flex flex-wrap gap-2">
            {(['dashboard', 'income', 'budget', 'transactions'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 min-w-[120px] py-3 px-4 rounded-lg font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-[#0D9488] text-white'
                    : theme === 'dark'
                    ? 'text-gray-300 hover:bg-gray-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Income */}
              <div className={`${cardBg} rounded-lg shadow-lg p-6`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  </div>
                  <span className={`text-xs font-medium ${textSecondary}`}>{t('tools.budgetDashboard.monthly', 'Monthly')}</span>
                </div>
                <div className={`text-2xl font-bold ${textPrimary}`}>
                  {formatCurrency(totalMonthlyIncome)}
                </div>
                <div className={`text-sm ${textSecondary}`}>{t('tools.budgetDashboard.totalIncome', 'Total Income')}</div>
              </div>

              {/* Total Expenses */}
              <div className={`${cardBg} rounded-lg shadow-lg p-6`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-red-500/20 rounded-lg">
                    <TrendingDown className="w-5 h-5 text-red-500" />
                  </div>
                  <span className={`text-xs font-medium ${textSecondary}`}>{t('tools.budgetDashboard.thisPeriod', 'This Period')}</span>
                </div>
                <div className={`text-2xl font-bold ${textPrimary}`}>
                  {formatCurrency(totalExpenses)}
                </div>
                <div className={`text-sm ${textSecondary}`}>{t('tools.budgetDashboard.totalExpenses', 'Total Expenses')}</div>
              </div>

              {/* Savings */}
              <div className={`${cardBg} rounded-lg shadow-lg p-6`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <PiggyBank className="w-5 h-5 text-blue-500" />
                  </div>
                  <span className={`text-xs font-medium ${savingsRate >= 20 ? 'text-green-500' : savingsRate >= 10 ? 'text-yellow-500' : 'text-red-500'}`}>
                    {savingsRate.toFixed(1)}%
                  </span>
                </div>
                <div className={`text-2xl font-bold ${totalMonthlyIncome - totalExpenses >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {formatCurrency(totalMonthlyIncome - totalExpenses)}
                </div>
                <div className={`text-sm ${textSecondary}`}>{t('tools.budgetDashboard.savingsRate', 'Savings Rate')}</div>
              </div>

              {/* Budget Health */}
              <div className={`${cardBg} rounded-lg shadow-lg p-6`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Award className="w-5 h-5 text-purple-500" />
                  </div>
                  <span className={`text-xs font-medium ${
                    budgetHealthScore >= 80 ? 'text-green-500' : budgetHealthScore >= 60 ? 'text-yellow-500' : 'text-red-500'
                  }`}>
                    {budgetHealthScore >= 80 ? 'Excellent' : budgetHealthScore >= 60 ? t('tools.budgetDashboard.good', 'Good') : t('tools.budgetDashboard.needsWork', 'Needs Work')}
                  </span>
                </div>
                <div className={`text-2xl font-bold ${textPrimary}`}>{budgetHealthScore}</div>
                <div className={`text-sm ${textSecondary}`}>{t('tools.budgetDashboard.healthScore', 'Health Score')}</div>
                <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      budgetHealthScore >= 80 ? 'bg-green-500' : budgetHealthScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${budgetHealthScore}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Category Breakdown */}
            <div className={`${cardBg} rounded-lg shadow-lg p-6`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-lg font-semibold ${textPrimary}`}>{t('tools.budgetDashboard.categoryBreakdown', 'Category Breakdown')}</h2>
                <BarChart3 className={`w-5 h-5 ${textSecondary}`} />
              </div>
              <div className="space-y-4">
                {data.categories
                  .filter((cat) => categorySpending[cat.id] || cat.budgetLimit > 0)
                  .sort((a, b) => (categorySpending[b.id] || 0) - (categorySpending[a.id] || 0))
                  .map((category) => {
                    const spent = categorySpending[category.id] || 0;
                    const percentage = category.budgetLimit > 0 ? (spent / category.budgetLimit) * 100 : 0;
                    const isOverBudget = percentage > 100;
                    const IconComponent = getIconComponent(category.icon);

                    return (
                      <div key={category.id}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div
                              className="p-2 rounded-lg"
                              style={{ backgroundColor: `${category.color}20` }}
                            >
                              <IconComponent className="w-4 h-4" style={{ color: category.color }} />
                            </div>
                            <span className={`font-medium ${textPrimary}`}>{category.name}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className={`font-semibold ${isOverBudget ? 'text-red-500' : textPrimary}`}>
                              {formatCurrency(spent)}
                            </span>
                            {category.budgetLimit > 0 && (
                              <span className={`text-sm ${textSecondary}`}>
                                / {formatCurrency(category.budgetLimit)}
                              </span>
                            )}
                            {isOverBudget && (
                              <AlertTriangle className="w-4 h-4 text-red-500" />
                            )}
                          </div>
                        </div>
                        {category.budgetLimit > 0 && (
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${isOverBudget ? 'bg-red-500' : 'bg-green-500'}`}
                              style={{ width: `${Math.min(percentage, 100)}%`, backgroundColor: isOverBudget ? undefined : category.color }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                {data.categories.filter((cat) => categorySpending[cat.id] || cat.budgetLimit > 0).length === 0 && (
                  <p className={`text-center py-8 ${textSecondary}`}>
                    {t('tools.budgetDashboard.noSpendingDataYetAdd', 'No spending data yet. Add transactions to see your breakdown.')}
                  </p>
                )}
              </div>
            </div>

            {/* Recent Transactions */}
            <div className={`${cardBg} rounded-lg shadow-lg p-6`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-lg font-semibold ${textPrimary}`}>{t('tools.budgetDashboard.recentTransactions', 'Recent Transactions')}</h2>
                <button
                  onClick={() => setActiveTab('transactions')}
                  className="text-[#0D9488] hover:underline text-sm"
                >
                  {t('tools.budgetDashboard.viewAll', 'View All')}
                </button>
              </div>
              <div className="space-y-3">
                {filteredTransactions.slice(0, 5).map((transaction) => {
                  const category = getCategoryById(transaction.categoryId);
                  const IconComponent = category ? getIconComponent(category.icon) : Wallet;

                  return (
                    <div
                      key={transaction.id}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="p-2 rounded-lg"
                          style={{ backgroundColor: `${category?.color || '#6B7280'}20` }}
                        >
                          <IconComponent className="w-4 h-4" style={{ color: category?.color || '#6B7280' }} />
                        </div>
                        <div>
                          <div className={`font-medium ${textPrimary}`}>
                            {transaction.description || category?.name || 'Transaction'}
                          </div>
                          <div className={`text-xs ${textSecondary}`}>
                            {new Date(transaction.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <span className={`font-semibold ${transaction.type === 'expense' ? 'text-red-500' : 'text-green-500'}`}>
                        {transaction.type === 'expense' ? '-' : '+'}{formatCurrency(transaction.amount)}
                      </span>
                    </div>
                  );
                })}
                {filteredTransactions.length === 0 && (
                  <p className={`text-center py-8 ${textSecondary}`}>
                    {t('tools.budgetDashboard.noTransactionsInThisPeriod', 'No transactions in this period.')}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Income Tab */}
        {activeTab === 'income' && (
          <div className={`${cardBg} rounded-lg shadow-lg p-6`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-lg font-semibold ${textPrimary}`}>{t('tools.budgetDashboard.incomeSources', 'Income Sources')}</h2>
              <button
                onClick={() => {
                  setEditingIncome(null);
                  setIncomeForm({ name: '', amount: '', frequency: 'monthly' });
                  setShowIncomeModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t('tools.budgetDashboard.addIncome', 'Add Income')}
              </button>
            </div>

            <div className="space-y-4">
              {data.incomes.map((income) => {
                let monthlyAmount = income.amount;
                if (income.frequency === 'weekly') {
                  monthlyAmount = income.amount * 4.33;
                } else if (income.frequency === 'bi-weekly') {
                  monthlyAmount = income.amount * 2.17;
                }

                return (
                  <div
                    key={income.id}
                    className={`flex items-center justify-between p-4 rounded-lg border ${borderColor}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-green-500/20 rounded-lg">
                        <DollarSign className="w-5 h-5 text-green-500" />
                      </div>
                      <div>
                        <div className={`font-medium ${textPrimary}`}>{income.name}</div>
                        <div className={`text-sm ${textSecondary}`}>
                          {formatCurrency(income.amount)} / {income.frequency}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className={`font-semibold text-green-500`}>
                          {formatCurrency(monthlyAmount)}
                        </div>
                        <div className={`text-xs ${textSecondary}`}>monthly</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingIncome(income);
                            setIncomeForm({
                              name: income.name,
                              amount: income.amount.toString(),
                              frequency: income.frequency,
                            });
                            setShowIncomeModal(true);
                          }}
                          className={`p-2 rounded-lg transition-colors ${
                            theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                          }`}
                        >
                          <Edit2 className={`w-4 h-4 ${textSecondary}`} />
                        </button>
                        <button
                          onClick={() => handleDeleteIncome(income.id)}
                          className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
              {data.incomes.length === 0 && (
                <p className={`text-center py-8 ${textSecondary}`}>
                  {t('tools.budgetDashboard.noIncomeSourcesAddedYet', 'No income sources added yet. Click "Add Income" to get started.')}
                </p>
              )}
            </div>

            {/* Total Monthly Income */}
            <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className="flex items-center justify-between">
                <span className={`font-medium ${textPrimary}`}>{t('tools.budgetDashboard.totalMonthlyIncome', 'Total Monthly Income')}</span>
                <span className="text-2xl font-bold text-green-500">
                  {formatCurrency(totalMonthlyIncome)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Budget Tab */}
        {activeTab === 'budget' && (
          <div className="space-y-6">
            <div className={`${cardBg} rounded-lg shadow-lg p-6`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-lg font-semibold ${textPrimary}`}>{t('tools.budgetDashboard.expenseCategories', 'Expense Categories')}</h2>
                <button
                  onClick={() => {
                    setEditingCategory(null);
                    setCategoryForm({ name: '', icon: 'Wallet', color: '#3B82F6', budgetLimit: '' });
                    setShowCategoryModal(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.budgetDashboard.addCategory', 'Add Category')}
                </button>
              </div>

              <div className="space-y-4">
                {data.categories.map((category) => {
                  const spent = categorySpending[category.id] || 0;
                  const percentage = category.budgetLimit > 0 ? (spent / category.budgetLimit) * 100 : 0;
                  const isOverBudget = percentage > 100;
                  const isExpanded = expandedCategories.has(category.id);
                  const IconComponent = getIconComponent(category.icon);

                  return (
                    <div
                      key={category.id}
                      className={`rounded-lg border ${borderColor} ${isOverBudget ? 'border-red-500' : ''}`}
                    >
                      <div
                        className={`flex items-center justify-between p-4 cursor-pointer ${
                          theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => {
                          const newExpanded = new Set(expandedCategories);
                          if (isExpanded) {
                            newExpanded.delete(category.id);
                          } else {
                            newExpanded.add(category.id);
                          }
                          setExpandedCategories(newExpanded);
                        }}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className="p-3 rounded-lg"
                            style={{ backgroundColor: `${category.color}20` }}
                          >
                            <IconComponent className="w-5 h-5" style={{ color: category.color }} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`font-medium ${textPrimary}`}>{category.name}</span>
                              {category.isCustom && (
                                <span className="px-2 py-0.5 text-xs bg-[#0D9488]/20 text-[#0D9488] rounded">
                                  {t('tools.budgetDashboard.custom', 'Custom')}
                                </span>
                              )}
                              {isOverBudget && (
                                <AlertTriangle className="w-4 h-4 text-red-500" />
                              )}
                            </div>
                            {category.budgetLimit > 0 && (
                              <div className={`text-sm ${textSecondary}`}>
                                {formatCurrency(spent)} of {formatCurrency(category.budgetLimit)} spent
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {category.budgetLimit > 0 && (
                            <div className="text-right">
                              <div className={`font-semibold ${isOverBudget ? 'text-red-500' : 'text-green-500'}`}>
                                {formatCurrency(category.budgetLimit - spent)}
                              </div>
                              <div className={`text-xs ${textSecondary}`}>remaining</div>
                            </div>
                          )}
                          {isExpanded ? (
                            <ChevronUp className={`w-5 h-5 ${textSecondary}`} />
                          ) : (
                            <ChevronDown className={`w-5 h-5 ${textSecondary}`} />
                          )}
                        </div>
                      </div>

                      {category.budgetLimit > 0 && (
                        <div className="px-4 pb-4">
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${isOverBudget ? 'bg-red-500' : ''}`}
                              style={{
                                width: `${Math.min(percentage, 100)}%`,
                                backgroundColor: isOverBudget ? undefined : category.color,
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {isExpanded && (
                        <div className={`p-4 border-t ${borderColor}`}>
                          <div className="flex flex-wrap items-center gap-4">
                            <div className="flex-1 min-w-[200px]">
                              <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>
                                {t('tools.budgetDashboard.budgetLimit', 'Budget Limit')}
                              </label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  value={category.budgetLimit || ''}
                                  onChange={(e) => handleUpdateBudgetLimit(category.id, parseFloat(e.target.value) || 0)}
                                  placeholder={t('tools.budgetDashboard.setBudgetLimit', 'Set budget limit')}
                                  className={`flex-1 px-4 py-2 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                                />
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingCategory(category);
                                  setCategoryForm({
                                    name: category.name,
                                    icon: category.icon,
                                    color: category.color,
                                    budgetLimit: category.budgetLimit.toString(),
                                  });
                                  setShowCategoryModal(true);
                                }}
                                className={`p-2 rounded-lg transition-colors ${
                                  theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
                                }`}
                              >
                                <Edit2 className={`w-4 h-4 ${textSecondary}`} />
                              </button>
                              {category.isCustom && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteCategory(category.id);
                                  }}
                                  className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className={`${cardBg} rounded-lg shadow-lg p-6`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-lg font-semibold ${textPrimary}`}>{t('tools.budgetDashboard.transactionLog', 'Transaction Log')}</h2>
              <button
                onClick={() => {
                  setEditingTransaction(null);
                  setTransactionForm({
                    date: new Date().toISOString().split('T')[0],
                    categoryId: data.categories[0]?.id || '',
                    description: '',
                    amount: '',
                    type: 'expense',
                  });
                  setShowTransactionModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t('tools.budgetDashboard.addTransaction', 'Add Transaction')}
              </button>
            </div>

            <div className="space-y-3">
              {runningBalance.map((transaction) => {
                const category = getCategoryById(transaction.categoryId);
                const IconComponent = category ? getIconComponent(category.icon) : Wallet;

                return (
                  <div
                    key={transaction.id}
                    className={`flex items-center justify-between p-4 rounded-lg border ${borderColor}`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="p-3 rounded-lg"
                        style={{ backgroundColor: `${category?.color || '#6B7280'}20` }}
                      >
                        <IconComponent className="w-5 h-5" style={{ color: category?.color || '#6B7280' }} />
                      </div>
                      <div>
                        <div className={`font-medium ${textPrimary}`}>
                          {transaction.description || category?.name || 'Transaction'}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-sm ${textSecondary}`}>
                            {new Date(transaction.date).toLocaleDateString()}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                          } ${textSecondary}`}>
                            {category?.name}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className={`font-semibold ${transaction.type === 'expense' ? 'text-red-500' : 'text-green-500'}`}>
                          {transaction.type === 'expense' ? '-' : '+'}{formatCurrency(transaction.amount)}
                        </div>
                        <div className={`text-xs ${textSecondary}`}>
                          Balance: {formatCurrency(transaction.balance)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingTransaction(transaction);
                            setTransactionForm({
                              date: transaction.date,
                              categoryId: transaction.categoryId,
                              description: transaction.description,
                              amount: transaction.amount.toString(),
                              type: transaction.type,
                            });
                            setShowTransactionModal(true);
                          }}
                          className={`p-2 rounded-lg transition-colors ${
                            theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                          }`}
                        >
                          <Edit2 className={`w-4 h-4 ${textSecondary}`} />
                        </button>
                        <button
                          onClick={() => handleDeleteTransaction(transaction.id)}
                          className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
              {filteredTransactions.length === 0 && (
                <p className={`text-center py-8 ${textSecondary}`}>
                  {t('tools.budgetDashboard.noTransactionsInThisPeriod2', 'No transactions in this period. Click "Add Transaction" to get started.')}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Income Modal */}
        {showIncomeModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${cardBg} rounded-lg shadow-xl w-full max-w-md p-6`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-lg font-semibold ${textPrimary}`}>
                  {editingIncome ? t('tools.budgetDashboard.editIncomeSource', 'Edit Income Source') : t('tools.budgetDashboard.addIncomeSource', 'Add Income Source')}
                </h3>
                <button
                  onClick={() => setShowIncomeModal(false)}
                  className={`p-2 rounded-lg transition-colors ${
                    theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <X className={`w-5 h-5 ${textSecondary}`} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>
                    {t('tools.budgetDashboard.incomeName', 'Income Name')}
                  </label>
                  <input
                    type="text"
                    value={incomeForm.name}
                    onChange={(e) => setIncomeForm({ ...incomeForm, name: e.target.value })}
                    placeholder={t('tools.budgetDashboard.eGSalaryFreelance', 'e.g., Salary, Freelance')}
                    className={`w-full px-4 py-3 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>
                    {t('tools.budgetDashboard.amount', 'Amount')}
                  </label>
                  <div className="relative">
                    <DollarSign className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${textSecondary}`} />
                    <input
                      type="number"
                      value={incomeForm.amount}
                      onChange={(e) => setIncomeForm({ ...incomeForm, amount: e.target.value })}
                      placeholder="0.00"
                      className={`w-full pl-10 pr-4 py-3 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>
                    {t('tools.budgetDashboard.frequency', 'Frequency')}
                  </label>
                  <select
                    value={incomeForm.frequency}
                    onChange={(e) => setIncomeForm({ ...incomeForm, frequency: e.target.value as typeof incomeForm.frequency })}
                    className={`w-full px-4 py-3 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  >
                    <option value="weekly">{t('tools.budgetDashboard.weekly', 'Weekly')}</option>
                    <option value="bi-weekly">{t('tools.budgetDashboard.biWeekly', 'Bi-weekly')}</option>
                    <option value="monthly">{t('tools.budgetDashboard.monthly2', 'Monthly')}</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowIncomeModal(false)}
                  className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                    theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {t('tools.budgetDashboard.cancel', 'Cancel')}
                </button>
                <button
                  onClick={handleAddIncome}
                  className="flex-1 py-3 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  {editingIncome ? t('tools.budgetDashboard.update', 'Update') : t('tools.budgetDashboard.add', 'Add')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Category Modal */}
        {showCategoryModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${cardBg} rounded-lg shadow-xl w-full max-w-md p-6`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-lg font-semibold ${textPrimary}`}>
                  {editingCategory ? t('tools.budgetDashboard.editCategory', 'Edit Category') : t('tools.budgetDashboard.addCustomCategory', 'Add Custom Category')}
                </h3>
                <button
                  onClick={() => setShowCategoryModal(false)}
                  className={`p-2 rounded-lg transition-colors ${
                    theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <X className={`w-5 h-5 ${textSecondary}`} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>
                    {t('tools.budgetDashboard.categoryName', 'Category Name')}
                  </label>
                  <input
                    type="text"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    placeholder={t('tools.budgetDashboard.eGSubscriptions', 'e.g., Subscriptions')}
                    className={`w-full px-4 py-3 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>
                    {t('tools.budgetDashboard.icon', 'Icon')}
                  </label>
                  <div className="grid grid-cols-6 gap-2">
                    {Object.keys(iconMap).map((iconName) => {
                      const IconComponent = iconMap[iconName];
                      return (
                        <button
                          key={iconName}
                          onClick={() => setCategoryForm({ ...categoryForm, icon: iconName })}
                          className={`p-3 rounded-lg border transition-colors ${
                            categoryForm.icon === iconName
                              ? 'border-[#0D9488] bg-[#0D9488]/20'
                              : borderColor
                          } ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                        >
                          <IconComponent className={`w-5 h-5 ${categoryForm.icon === iconName ? 'text-[#0D9488]' : textSecondary}`} />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>
                    {t('tools.budgetDashboard.color', 'Color')}
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color}
                        onClick={() => setCategoryForm({ ...categoryForm, color })}
                        className={`w-full h-10 rounded-lg border-2 transition-all ${
                          categoryForm.color === color ? 'border-white scale-110' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>
                    {t('tools.budgetDashboard.budgetLimitOptional', 'Budget Limit (Optional)')}
                  </label>
                  <div className="relative">
                    <DollarSign className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${textSecondary}`} />
                    <input
                      type="number"
                      value={categoryForm.budgetLimit}
                      onChange={(e) => setCategoryForm({ ...categoryForm, budgetLimit: e.target.value })}
                      placeholder="0.00"
                      className={`w-full pl-10 pr-4 py-3 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCategoryModal(false)}
                  className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                    theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {t('tools.budgetDashboard.cancel2', 'Cancel')}
                </button>
                <button
                  onClick={handleAddCategory}
                  className="flex-1 py-3 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  {editingCategory ? t('tools.budgetDashboard.update2', 'Update') : t('tools.budgetDashboard.add2', 'Add')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Transaction Modal */}
        {showTransactionModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${cardBg} rounded-lg shadow-xl w-full max-w-md p-6`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-lg font-semibold ${textPrimary}`}>
                  {editingTransaction ? t('tools.budgetDashboard.editTransaction', 'Edit Transaction') : t('tools.budgetDashboard.addTransaction2', 'Add Transaction')}
                </h3>
                <button
                  onClick={() => setShowTransactionModal(false)}
                  className={`p-2 rounded-lg transition-colors ${
                    theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <X className={`w-5 h-5 ${textSecondary}`} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>
                    {t('tools.budgetDashboard.type', 'Type')}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setTransactionForm({ ...transactionForm, type: 'expense' })}
                      className={`py-3 rounded-lg font-medium transition-colors ${
                        transactionForm.type === 'expense'
                          ? 'bg-red-500 text-white'
                          : theme === 'dark'
                          ? 'bg-gray-700 text-gray-300'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {t('tools.budgetDashboard.expense', 'Expense')}
                    </button>
                    <button
                      onClick={() => setTransactionForm({ ...transactionForm, type: 'income' })}
                      className={`py-3 rounded-lg font-medium transition-colors ${
                        transactionForm.type === 'income'
                          ? 'bg-green-500 text-white'
                          : theme === 'dark'
                          ? 'bg-gray-700 text-gray-300'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {t('tools.budgetDashboard.income', 'Income')}
                    </button>
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>
                    {t('tools.budgetDashboard.date', 'Date')}
                  </label>
                  <div className="relative">
                    <Calendar className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${textSecondary}`} />
                    <input
                      type="date"
                      value={transactionForm.date}
                      onChange={(e) => setTransactionForm({ ...transactionForm, date: e.target.value })}
                      className={`w-full pl-10 pr-4 py-3 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>
                    {t('tools.budgetDashboard.category', 'Category')}
                  </label>
                  <select
                    value={transactionForm.categoryId}
                    onChange={(e) => setTransactionForm({ ...transactionForm, categoryId: e.target.value })}
                    className={`w-full px-4 py-3 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  >
                    <option value="">{t('tools.budgetDashboard.selectCategory', 'Select category')}</option>
                    {data.categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>
                    {t('tools.budgetDashboard.description', 'Description')}
                  </label>
                  <input
                    type="text"
                    value={transactionForm.description}
                    onChange={(e) => setTransactionForm({ ...transactionForm, description: e.target.value })}
                    placeholder={t('tools.budgetDashboard.eGGroceryShopping', 'e.g., Grocery shopping')}
                    className={`w-full px-4 py-3 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>
                    {t('tools.budgetDashboard.amount2', 'Amount')}
                  </label>
                  <div className="relative">
                    <DollarSign className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${textSecondary}`} />
                    <input
                      type="number"
                      value={transactionForm.amount}
                      onChange={(e) => setTransactionForm({ ...transactionForm, amount: e.target.value })}
                      placeholder="0.00"
                      className={`w-full pl-10 pr-4 py-3 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowTransactionModal(false)}
                  className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                    theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {t('tools.budgetDashboard.cancel3', 'Cancel')}
                </button>
                <button
                  onClick={handleAddTransaction}
                  className="flex-1 py-3 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  {editingTransaction ? t('tools.budgetDashboard.update3', 'Update') : t('tools.budgetDashboard.add3', 'Add')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BudgetDashboardTool;
