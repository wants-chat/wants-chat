import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plane, Plus, Trash2, MapPin, Calendar, DollarSign, PieChart, Sparkles, TrendingUp, AlertTriangle, Palmtree } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface HoneymoonBudgetToolProps {
  uiConfig?: UIConfig;
}

interface HoneymoonExpense {
  id: string;
  category: string;
  description: string;
  estimatedCost: number;
  actualCost: number;
  paid: boolean;
  dueDate: string;
  notes: string;
}

const defaultCategories = [
  { name: 'Flights', icon: 'plane', defaultPercent: 25 },
  { name: 'Accommodation', icon: 'bed', defaultPercent: 35 },
  { name: 'Activities & Tours', icon: 'camera', defaultPercent: 15 },
  { name: 'Food & Dining', icon: 'utensils', defaultPercent: 12 },
  { name: 'Transportation', icon: 'car', defaultPercent: 5 },
  { name: 'Shopping & Souvenirs', icon: 'gift', defaultPercent: 5 },
  { name: 'Travel Insurance', icon: 'shield', defaultPercent: 3 },
];

export const HoneymoonBudgetTool: React.FC<HoneymoonBudgetToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  const [totalBudget, setTotalBudget] = useState<number>(5000);
  const [destination, setDestination] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [currency, setCurrency] = useState<string>('USD');
  const [expenses, setExpenses] = useState<HoneymoonExpense[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newExpense, setNewExpense] = useState<Omit<HoneymoonExpense, 'id'>>({
    category: 'Flights',
    description: '',
    estimatedCost: 0,
    actualCost: 0,
    paid: false,
    dueDate: '',
    notes: '',
  });

  // Handle prefill data
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.amount) {
        setTotalBudget(params.amount);
        setIsPrefilled(true);
      }
      if (params.destination) {
        setDestination(params.destination.toString());
        setIsPrefilled(true);
      }
      if (params.numbers && params.numbers.length > 0) {
        setTotalBudget(params.numbers[0]);
        setIsPrefilled(true);
      }
      if (params.formData) {
        if (params.formData.budget) setTotalBudget(Number(params.formData.budget));
        if (params.formData.destination) setDestination(params.formData.destination.toString());
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const tripDuration = useMemo(() => {
    if (!startDate || !endDate) return null;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : null;
  }, [startDate, endDate]);

  const calculations = useMemo(() => {
    const totalEstimated = expenses.reduce((sum, e) => sum + e.estimatedCost, 0);
    const totalActual = expenses.reduce((sum, e) => sum + e.actualCost, 0);
    const totalPaid = expenses.filter((e) => e.paid).reduce((sum, e) => sum + e.actualCost, 0);
    const remaining = totalBudget - totalActual;
    const unallocated = totalBudget - totalEstimated;
    const dailyBudget = tripDuration ? totalBudget / tripDuration : 0;

    // Category breakdown
    const categoryTotals: Record<string, { estimated: number; actual: number }> = {};
    expenses.forEach((exp) => {
      if (!categoryTotals[exp.category]) {
        categoryTotals[exp.category] = { estimated: 0, actual: 0 };
      }
      categoryTotals[exp.category].estimated += exp.estimatedCost;
      categoryTotals[exp.category].actual += exp.actualCost;
    });

    return { totalEstimated, totalActual, totalPaid, remaining, unallocated, dailyBudget, categoryTotals };
  }, [expenses, totalBudget, tripDuration]);

  const handleAddExpense = () => {
    if (!newExpense.description.trim()) return;
    const expense: HoneymoonExpense = {
      ...newExpense,
      id: `expense-${Date.now()}`,
    };
    setExpenses((prev) => [...prev, expense]);
    setNewExpense({
      category: 'Flights',
      description: '',
      estimatedCost: 0,
      actualCost: 0,
      paid: false,
      dueDate: '',
      notes: '',
    });
    setShowAddForm(false);
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  const handleUpdateExpense = (id: string, updates: Partial<HoneymoonExpense>) => {
    setExpenses((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getCategoryColor = (category: string, index: number) => {
    const colors = ['#0D9488', '#3B82F6', '#8B5CF6', '#F59E0B', '#EC4899', '#10B981', '#EF4444'];
    return colors[index % colors.length];
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-500/10 rounded-lg">
              <Palmtree className="w-5 h-5 text-teal-500" />
            </div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.honeymoonBudget.honeymoonBudgetPlanner', 'Honeymoon Budget Planner')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.honeymoonBudget.planAndTrackYourHoneymoon', 'Plan and track your honeymoon expenses')}</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-3 py-1.5 text-sm rounded-lg flex items-center gap-1 bg-teal-500 hover:bg-teal-600 text-white"
          >
            <Plus className="w-4 h-4" /> Add Expense
          </button>
        </div>
      </div>

      {isPrefilled && (
        <div className={`mx-6 mt-4 p-3 rounded-lg flex items-center gap-2 ${isDark ? 'bg-teal-900/20 border border-teal-800' : 'bg-teal-50 border border-teal-200'}`}>
          <Sparkles className="w-4 h-4 text-teal-500" />
          <span className={`text-sm ${isDark ? 'text-teal-400' : 'text-teal-700'}`}>
            {t('tools.honeymoonBudget.preFilledBasedOnYour', 'Pre-filled based on your request')}
          </span>
        </div>
      )}

      <div className="p-6 space-y-6">
        {/* Trip Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <DollarSign className="w-4 h-4 inline mr-1" /> Total Budget
            </label>
            <input
              type="number"
              value={totalBudget}
              onChange={(e) => setTotalBudget(Math.max(0, parseFloat(e.target.value) || 0))}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <MapPin className="w-4 h-4 inline mr-1" /> Destination
            </label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder={t('tools.honeymoonBudget.eGMaldives', 'e.g., Maldives')}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Calendar className="w-4 h-4 inline mr-1" /> Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Calendar className="w-4 h-4 inline mr-1" /> End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(totalBudget)}</div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.honeymoonBudget.totalBudget', 'Total Budget')}</div>
          </div>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
            <div className="text-xl font-bold text-blue-500">{formatCurrency(calculations.totalEstimated)}</div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.honeymoonBudget.estimated', 'Estimated')}</div>
          </div>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-teal-900/20' : 'bg-teal-50'}`}>
            <div className="text-xl font-bold text-teal-500">{formatCurrency(calculations.totalPaid)}</div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.honeymoonBudget.paid', 'Paid')}</div>
          </div>
          <div className={`p-4 rounded-lg text-center ${calculations.remaining >= 0 ? (isDark ? 'bg-green-900/20' : 'bg-green-50') : (isDark ? 'bg-red-900/20' : 'bg-red-50')}`}>
            <div className={`text-xl font-bold ${calculations.remaining >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {formatCurrency(Math.abs(calculations.remaining))}
            </div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{calculations.remaining >= 0 ? t('tools.honeymoonBudget.remaining', 'Remaining') : t('tools.honeymoonBudget.overBudget', 'Over Budget')}</div>
          </div>
          {tripDuration && (
            <>
              <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-purple-900/20' : 'bg-purple-50'}`}>
                <div className="text-xl font-bold text-purple-500">{tripDuration}</div>
                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.honeymoonBudget.days', 'Days')}</div>
              </div>
              <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-orange-900/20' : 'bg-orange-50'}`}>
                <div className="text-xl font-bold text-orange-500">{formatCurrency(calculations.dailyBudget)}</div>
                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.honeymoonBudget.perDay', 'Per Day')}</div>
              </div>
            </>
          )}
        </div>

        {/* Budget Warning */}
        {calculations.remaining < 0 && (
          <div className={`p-3 rounded-lg flex items-center gap-2 ${isDark ? 'bg-red-900/20 text-red-400' : 'bg-red-50 text-red-700'}`}>
            <AlertTriangle className="w-5 h-5" />
            <span className="text-sm">You're over budget by {formatCurrency(Math.abs(calculations.remaining))}!</span>
          </div>
        )}

        {/* Budget Allocation Bar */}
        {expenses.length > 0 && (
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-3">
              <PieChart className="w-4 h-4 text-teal-500" />
              <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.honeymoonBudget.budgetAllocation', 'Budget Allocation')}</span>
            </div>
            <div className="h-6 rounded-full overflow-hidden flex bg-gray-300">
              {Object.entries(calculations.categoryTotals).map(([category, data], idx) => {
                const percent = totalBudget > 0 ? (data.estimated / totalBudget) * 100 : 0;
                if (percent <= 0) return null;
                return (
                  <div
                    key={category}
                    style={{
                      width: `${percent}%`,
                      backgroundColor: getCategoryColor(category, idx),
                    }}
                    title={`${category}: ${percent.toFixed(1)}%`}
                    className="transition-all"
                  />
                );
              })}
            </div>
            <div className="flex flex-wrap gap-3 mt-3">
              {Object.entries(calculations.categoryTotals).map(([category, data], idx) => (
                <span key={category} className="flex items-center gap-1 text-xs">
                  <span
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: getCategoryColor(category, idx) }}
                  />
                  <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{category}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Add Expense Form */}
        {showAddForm && (
          <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
            <h4 className={`font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.honeymoonBudget.addExpense', 'Add Expense')}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <select
                value={newExpense.category}
                onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                className={`px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              >
                {defaultCategories.map((cat) => (
                  <option key={cat.name} value={cat.name}>{cat.name}</option>
                ))}
              </select>
              <input
                type="text"
                value={newExpense.description}
                onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                placeholder={t('tools.honeymoonBudget.description', 'Description *')}
                className={`px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              />
              <input
                type="number"
                value={newExpense.estimatedCost}
                onChange={(e) => setNewExpense({ ...newExpense, estimatedCost: parseFloat(e.target.value) || 0 })}
                placeholder={t('tools.honeymoonBudget.estimatedCost', 'Estimated Cost')}
                className={`px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              />
              <input
                type="number"
                value={newExpense.actualCost}
                onChange={(e) => setNewExpense({ ...newExpense, actualCost: parseFloat(e.target.value) || 0 })}
                placeholder={t('tools.honeymoonBudget.actualCost', 'Actual Cost')}
                className={`px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              />
              <input
                type="date"
                value={newExpense.dueDate}
                onChange={(e) => setNewExpense({ ...newExpense, dueDate: e.target.value })}
                className={`px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              />
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="paid"
                  checked={newExpense.paid}
                  onChange={(e) => setNewExpense({ ...newExpense, paid: e.target.checked })}
                  className="w-4 h-4 text-teal-500"
                />
                <label htmlFor="paid" className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.honeymoonBudget.alreadyPaid', 'Already Paid')}</label>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={handleAddExpense} className="px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-600 text-white font-medium">
                {t('tools.honeymoonBudget.addExpense2', 'Add Expense')}
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
              >
                {t('tools.honeymoonBudget.cancel', 'Cancel')}
              </button>
            </div>
          </div>
        )}

        {/* Expenses List */}
        <div className="space-y-3">
          {expenses.length === 0 ? (
            <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              <Plane className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>{t('tools.honeymoonBudget.noExpensesAddedYetClick', 'No expenses added yet. Click "Add Expense" to start planning.')}</p>
            </div>
          ) : (
            <>
              <h4 className={`font-medium flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <TrendingUp className="w-4 h-4 text-teal-500" />
                Expenses ({expenses.length})
              </h4>
              {expenses.map((expense, idx) => {
                const variance = expense.estimatedCost - expense.actualCost;
                return (
                  <div
                    key={expense.id}
                    className={`p-4 rounded-lg border-l-4 ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}
                    style={{ borderLeftColor: getCategoryColor(expense.category, defaultCategories.findIndex((c) => c.name === expense.category)) }}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{expense.description}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
                            {expense.category}
                          </span>
                          {expense.paid && (
                            <span className={`text-xs px-2 py-0.5 rounded-full ${isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'}`}>
                              {t('tools.honeymoonBudget.paid2', 'Paid')}
                            </span>
                          )}
                        </div>
                        <div className={`text-sm flex flex-wrap items-center gap-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          <span>Est: {formatCurrency(expense.estimatedCost)}</span>
                          <span>Actual: {formatCurrency(expense.actualCost)}</span>
                          {expense.actualCost > 0 && (
                            <span className={variance >= 0 ? 'text-green-500' : 'text-red-500'}>
                              {variance >= 0 ? t('tools.honeymoonBudget.under', 'Under') : t('tools.honeymoonBudget.over', 'Over')}: {formatCurrency(Math.abs(variance))}
                            </span>
                          )}
                          {expense.dueDate && <span>Due: {expense.dueDate}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={expense.paid}
                          onChange={(e) => handleUpdateExpense(expense.id, { paid: e.target.checked })}
                          className="w-4 h-4 text-teal-500"
                        />
                        <button
                          onClick={() => handleDeleteExpense(expense.id)}
                          className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-200 text-gray-500'}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* Recommended Budget Allocation */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-teal-50/50'}`}>
          <h5 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.honeymoonBudget.recommendedBudgetAllocation', 'Recommended Budget Allocation')}</h5>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            {defaultCategories.slice(0, 4).map((cat) => (
              <div key={cat.name}>
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{cat.name}</span>
                <div className="flex items-center gap-2">
                  <span className={`font-medium ${isDark ? 'text-teal-400' : 'text-teal-600'}`}>{cat.defaultPercent}%</span>
                  <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>
                    ({formatCurrency(totalBudget * cat.defaultPercent / 100)})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HoneymoonBudgetTool;
