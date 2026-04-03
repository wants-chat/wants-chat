import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Heart, DollarSign, PieChart, Plus, Trash2, Sparkles, Loader2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import type { ColumnConfig } from '../../lib/toolDataUtils';

interface ExpenseItem {
  id: string;
  name: string;
  amount: number;
  categoryId: string;
  categoryName: string;
}

interface BudgetCategory {
  id: string;
  name: string;
  defaultPercentage: number;
  percentage: number;
  expenses: Omit<ExpenseItem, 'categoryId' | 'categoryName'>[];
}

const defaultCategories: Omit<BudgetCategory, 'expenses'>[] = [
  { id: 'venue', name: 'Venue', defaultPercentage: 45, percentage: 45 },
  { id: 'catering', name: 'Catering', defaultPercentage: 30, percentage: 30 },
  { id: 'photography', name: 'Photography', defaultPercentage: 12, percentage: 12 },
  { id: 'flowers', name: 'Flowers & Decor', defaultPercentage: 7, percentage: 7 },
  { id: 'music', name: 'Music/DJ', defaultPercentage: 7, percentage: 7 },
  { id: 'attire', name: 'Attire', defaultPercentage: 7, percentage: 7 },
  { id: 'invitations', name: 'Invitations', defaultPercentage: 2, percentage: 2 },
  { id: 'cake', name: 'Cake', defaultPercentage: 2, percentage: 2 },
];

// Column configuration for exports
const COLUMNS: ColumnConfig[] = [
  { key: 'categoryName', header: 'Category', type: 'string' },
  { key: 'name', header: 'Expense Name', type: 'string' },
  { key: 'amount', header: 'Amount', type: 'currency' },
];

interface WeddingBudgetToolProps {
  uiConfig?: UIConfig;
}

export const WeddingBudgetTool: React.FC<WeddingBudgetToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Use the useToolData hook for backend persistence of expenses
  const {
    data: expenses,
    setData: setExpenses,
    addItem: addExpense,
    deleteItem: deleteExpense,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    importCSV,
    importJSON,
    copyToClipboard,
    print,
    isLoading,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<ExpenseItem>('wedding-budget', [], COLUMNS);

  const [totalBudget, setTotalBudget] = useState<number>(25000);
  const [categoryPercentages, setCategoryPercentages] = useState<Record<string, number>>(
    defaultCategories.reduce((acc, cat) => ({ ...acc, [cat.id]: cat.percentage }), {})
  );
  const [newExpenseInputs, setNewExpenseInputs] = useState<Record<string, { name: string; amount: string }>>({});
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Build categories from expenses and percentages
  const categories = useMemo(() => {
    return defaultCategories.map((cat) => ({
      ...cat,
      percentage: categoryPercentages[cat.id] ?? cat.defaultPercentage,
      expenses: expenses
        .filter((exp) => exp.categoryId === cat.id)
        .map((exp) => ({ id: exp.id, name: exp.name, amount: exp.amount })),
    }));
  }, [expenses, categoryPercentages]);

  // Prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.amount) {
        setTotalBudget(params.amount);
        setIsPrefilled(true);
      }
      if (params.numbers && params.numbers.length > 0) {
        setTotalBudget(params.numbers[0]);
        setIsPrefilled(true);
      }
      if (params.formData) {
        if (params.formData.totalBudget) setTotalBudget(Number(params.formData.totalBudget));
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const summary = useMemo(() => {
    let totalAllocated = 0;
    let totalSpent = 0;

    categories.forEach((cat) => {
      totalAllocated += (totalBudget * cat.percentage) / 100;
      totalSpent += cat.expenses.reduce((sum, exp) => sum + exp.amount, 0);
    });

    return {
      totalBudget,
      totalAllocated,
      totalSpent,
      remaining: totalBudget - totalSpent,
      overBudget: totalSpent > totalBudget,
    };
  }, [totalBudget, categories]);

  const getCategoryData = (category: BudgetCategory) => {
    const allocated = (totalBudget * category.percentage) / 100;
    const spent = category.expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const remaining = allocated - spent;
    const progressPercent = allocated > 0 ? Math.min((spent / allocated) * 100, 100) : 0;
    const isOverBudget = spent > allocated;

    return { allocated, spent, remaining, progressPercent, isOverBudget };
  };

  const handlePercentageChange = (categoryId: string, newPercentage: number) => {
    setCategoryPercentages((prev) => ({
      ...prev,
      [categoryId]: Math.max(0, Math.min(100, newPercentage)),
    }));
  };

  const handleAddExpense = (categoryId: string) => {
    const input = newExpenseInputs[categoryId];
    if (!input?.name || !input?.amount || parseFloat(input.amount) <= 0) return;

    const category = defaultCategories.find((c) => c.id === categoryId);
    const newExpense: ExpenseItem = {
      id: `${categoryId}-${Date.now()}`,
      name: input.name,
      amount: parseFloat(input.amount),
      categoryId: categoryId,
      categoryName: category?.name || categoryId,
    };

    addExpense(newExpense);

    setNewExpenseInputs((prev) => ({
      ...prev,
      [categoryId]: { name: '', amount: '' },
    }));
  };

  const handleRemoveExpense = (categoryId: string, expenseId: string) => {
    deleteExpense(expenseId);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={`min-h-screen p-4 md:p-6 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-6xl mx-auto flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-4 md:p-6 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-6xl mx-auto">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.weddingBudget.contentLoadedFromYourConversation', 'Content loaded from your conversation')}</span>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-full ${isDark ? 'bg-pink-500/20' : 'bg-pink-100'}`}>
              <Heart className={`w-8 h-8 ${isDark ? 'text-pink-400' : 'text-pink-500'}`} />
            </div>
            <div>
              <h1 className={`text-2xl md:text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.weddingBudget.weddingBudgetPlanner', 'Wedding Budget Planner')}
              </h1>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.weddingBudget.planYourPerfectDayWithin', 'Plan your perfect day within your budget')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <WidgetEmbedButton toolSlug="wedding-budget" toolName="Wedding Budget" />

            <SyncStatus
              isSynced={isSynced}
              isSaving={isSaving}
              lastSaved={lastSaved}
              syncError={syncError}
              onForceSync={forceSync}
              theme={isDark ? 'dark' : 'light'}
              size="sm"
            />
            <ExportDropdown
              onExportCSV={() => exportCSV({ filename: 'wedding_budget' })}
              onExportExcel={() => exportExcel({ filename: 'wedding_budget' })}
              onExportJSON={() => exportJSON({ filename: 'wedding_budget' })}
              onExportPDF={() => exportPDF({
                filename: 'wedding_budget',
                title: 'Wedding Budget Report',
                subtitle: `Total Budget: ${formatCurrency(totalBudget)} | Spent: ${formatCurrency(summary.totalSpent)} | Remaining: ${formatCurrency(summary.remaining)}`,
              })}
              onPrint={() => print('Wedding Budget Report')}
              onCopyToClipboard={() => copyToClipboard('tab')}
              onImportCSV={async (file) => { await importCSV(file); }}
              onImportJSON={async (file) => { await importJSON(file); }}
              theme={isDark ? 'dark' : 'light'}
            />
          </div>
        </div>

        {/* Total Budget Input */}
        <div className={`rounded-xl p-6 mb-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            {t('tools.weddingBudget.totalWeddingBudget', 'Total Wedding Budget')}
          </label>
          <div className="relative">
            <DollarSign
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}
            />
            <input
              type="number"
              value={totalBudget}
              onChange={(e) => setTotalBudget(Math.max(0, parseFloat(e.target.value) || 0))}
              className={`w-full pl-10 pr-4 py-3 text-xl font-semibold rounded-lg border ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-pink-500'
                  : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-pink-500'
              } focus:outline-none focus:ring-2 focus:ring-pink-500/20`}
              placeholder={t('tools.weddingBudget.enterYourTotalBudget', 'Enter your total budget')}
            />
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className={`rounded-xl p-4 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <p className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('tools.weddingBudget.totalBudget', 'Total Budget')}
            </p>
            <p className={`text-lg md:text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {formatCurrency(summary.totalBudget)}
            </p>
          </div>
          <div className={`rounded-xl p-4 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <p className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('tools.weddingBudget.totalAllocated', 'Total Allocated')}
            </p>
            <p className={`text-lg md:text-xl font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
              {formatCurrency(summary.totalAllocated)}
            </p>
          </div>
          <div className={`rounded-xl p-4 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <p className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('tools.weddingBudget.totalSpent', 'Total Spent')}
            </p>
            <p
              className={`text-lg md:text-xl font-bold ${
                summary.overBudget
                  ? isDark
                    ? 'text-red-400'
                    : 'text-red-600'
                  : isDark
                  ? 'text-green-400'
                  : 'text-green-600'
              }`}
            >
              {formatCurrency(summary.totalSpent)}
            </p>
          </div>
          <div className={`rounded-xl p-4 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <p className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('tools.weddingBudget.remaining2', 'Remaining')}
            </p>
            <p
              className={`text-lg md:text-xl font-bold ${
                summary.remaining < 0
                  ? isDark
                    ? 'text-red-400'
                    : 'text-red-600'
                  : isDark
                  ? 'text-emerald-400'
                  : 'text-emerald-600'
              }`}
            >
              {formatCurrency(summary.remaining)}
            </p>
          </div>
        </div>

        {/* Over Budget Alert */}
        {summary.overBudget && (
          <div
            className={`rounded-xl p-4 mb-6 border ${
              isDark ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50 border-red-200'
            }`}
          >
            <p className={`font-medium ${isDark ? 'text-red-400' : 'text-red-700'}`}>
              Warning: You are over budget by {formatCurrency(summary.totalSpent - summary.totalBudget)}!
            </p>
          </div>
        )}

        {/* Category Breakdown */}
        <div className={`rounded-xl p-6 mb-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <div className="flex items-center gap-2 mb-4">
            <PieChart className={`w-5 h-5 ${isDark ? 'text-pink-400' : 'text-pink-500'}`} />
            <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.weddingBudget.budgetCategories', 'Budget Categories')}
            </h2>
          </div>

          <div className="space-y-4">
            {categories.map((category) => {
              const data = getCategoryData(category);
              const expenseInput = newExpenseInputs[category.id] || { name: '', amount: '' };

              return (
                <div
                  key={category.id}
                  className={`rounded-lg p-4 border ${
                    isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  {/* Category Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {category.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={category.percentage}
                        onChange={(e) =>
                          handlePercentageChange(category.id, parseFloat(e.target.value) || 0)
                        }
                        className={`w-16 px-2 py-1 text-sm rounded border text-center ${
                          isDark
                            ? 'bg-gray-600 border-gray-500 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-pink-500/20`}
                        min="0"
                        max="100"
                      />
                      <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>%</span>
                    </div>
                  </div>

                  {/* Budget Info */}
                  <div className="grid grid-cols-3 gap-2 mb-3 text-sm">
                    <div>
                      <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.weddingBudget.allocated', 'Allocated')}</p>
                      <p className={`font-medium ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                        {formatCurrency(data.allocated)}
                      </p>
                    </div>
                    <div>
                      <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.weddingBudget.spent', 'Spent')}</p>
                      <p
                        className={`font-medium ${
                          data.isOverBudget
                            ? isDark
                              ? 'text-red-400'
                              : 'text-red-600'
                            : isDark
                            ? 'text-white'
                            : 'text-gray-900'
                        }`}
                      >
                        {formatCurrency(data.spent)}
                      </p>
                    </div>
                    <div>
                      <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.weddingBudget.remaining', 'Remaining')}</p>
                      <p
                        className={`font-medium ${
                          data.remaining < 0
                            ? isDark
                              ? 'text-red-400'
                              : 'text-red-600'
                            : isDark
                            ? 'text-green-400'
                            : 'text-green-600'
                        }`}
                      >
                        {formatCurrency(data.remaining)}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className={`h-2 rounded-full mb-3 ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`}>
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        data.isOverBudget
                          ? isDark
                            ? 'bg-red-500'
                            : 'bg-red-500'
                          : data.progressPercent > 80
                          ? isDark
                            ? 'bg-yellow-500'
                            : 'bg-yellow-500'
                          : isDark
                          ? 'bg-pink-500'
                          : 'bg-pink-500'
                      }`}
                      style={{ width: `${Math.min(data.progressPercent, 100)}%` }}
                    />
                  </div>

                  {/* Over Budget Alert for Category */}
                  {data.isOverBudget && (
                    <div
                      className={`text-xs px-2 py-1 rounded mb-3 ${
                        isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700'
                      }`}
                    >
                      Over budget by {formatCurrency(Math.abs(data.remaining))}
                    </div>
                  )}

                  {/* Expense Items */}
                  {category.expenses.length > 0 && (
                    <div className="mb-3 space-y-2">
                      {category.expenses.map((expense) => (
                        <div
                          key={expense.id}
                          className={`flex items-center justify-between px-3 py-2 rounded ${
                            isDark ? 'bg-gray-600' : 'bg-white'
                          }`}
                        >
                          <span className={`text-sm ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                            {expense.name}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {formatCurrency(expense.amount)}
                            </span>
                            <button
                              onClick={() => handleRemoveExpense(category.id, expense.id)}
                              className={`p-1 rounded hover:bg-red-500/20 transition-colors ${
                                isDark ? 'text-red-400' : 'text-red-500'
                              }`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Expense Form */}
                  <div className="flex flex-wrap gap-2">
                    <input
                      type="text"
                      placeholder={t('tools.weddingBudget.expenseName', 'Expense name')}
                      value={expenseInput.name}
                      onChange={(e) =>
                        setNewExpenseInputs((prev) => ({
                          ...prev,
                          [category.id]: { ...expenseInput, name: e.target.value },
                        }))
                      }
                      className={`flex-1 min-w-[120px] px-3 py-2 text-sm rounded border ${
                        isDark
                          ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } focus:outline-none focus:ring-2 focus:ring-pink-500/20`}
                    />
                    <input
                      type="number"
                      placeholder={t('tools.weddingBudget.amount', 'Amount')}
                      value={expenseInput.amount}
                      onChange={(e) =>
                        setNewExpenseInputs((prev) => ({
                          ...prev,
                          [category.id]: { ...expenseInput, amount: e.target.value },
                        }))
                      }
                      className={`w-24 px-3 py-2 text-sm rounded border ${
                        isDark
                          ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } focus:outline-none focus:ring-2 focus:ring-pink-500/20`}
                      min="0"
                    />
                    <button
                      onClick={() => handleAddExpense(category.id)}
                      className={`px-3 py-2 rounded font-medium text-sm flex items-center gap-1 transition-colors ${
                        isDark
                          ? 'bg-pink-500 hover:bg-pink-600 text-white'
                          : 'bg-pink-500 hover:bg-pink-600 text-white'
                      }`}
                    >
                      <Plus className="w-4 h-4" />
                      {t('tools.weddingBudget.add', 'Add')}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Typical Percentages Guide */}
        <div className={`rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.weddingBudget.typicalWeddingBudgetPercentages', 'Typical Wedding Budget Percentages')}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className={`font-medium ${isDark ? 'text-pink-400' : 'text-pink-600'}`}>{t('tools.weddingBudget.venue', 'Venue')}</p>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>40-50%</p>
            </div>
            <div>
              <p className={`font-medium ${isDark ? 'text-pink-400' : 'text-pink-600'}`}>{t('tools.weddingBudget.catering', 'Catering')}</p>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>25-35%</p>
            </div>
            <div>
              <p className={`font-medium ${isDark ? 'text-pink-400' : 'text-pink-600'}`}>{t('tools.weddingBudget.photography', 'Photography')}</p>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>10-15%</p>
            </div>
            <div>
              <p className={`font-medium ${isDark ? 'text-pink-400' : 'text-pink-600'}`}>{t('tools.weddingBudget.flowersDecor', 'Flowers & Decor')}</p>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>5-10%</p>
            </div>
            <div>
              <p className={`font-medium ${isDark ? 'text-pink-400' : 'text-pink-600'}`}>{t('tools.weddingBudget.musicDj', 'Music/DJ')}</p>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>5-10%</p>
            </div>
            <div>
              <p className={`font-medium ${isDark ? 'text-pink-400' : 'text-pink-600'}`}>{t('tools.weddingBudget.attire', 'Attire')}</p>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>5-10%</p>
            </div>
            <div>
              <p className={`font-medium ${isDark ? 'text-pink-400' : 'text-pink-600'}`}>{t('tools.weddingBudget.invitations', 'Invitations')}</p>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>2-3%</p>
            </div>
            <div>
              <p className={`font-medium ${isDark ? 'text-pink-400' : 'text-pink-600'}`}>{t('tools.weddingBudget.cake', 'Cake')}</p>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>2-3%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeddingBudgetTool;
