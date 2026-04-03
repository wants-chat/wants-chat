import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Wallet, Plane, Hotel, Utensils, Car, Ticket, ShoppingBag, PlusCircle, Trash2, PieChart, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';

interface BudgetCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  amount: number;
  color: string;
}

interface CustomExpense {
  id: string;
  name: string;
  amount: number;
}

const DEFAULT_CATEGORIES: Omit<BudgetCategory, 'amount'>[] = [
  { id: 'flights', name: 'Flights', icon: <Plane className="w-5 h-5" />, color: '#0D9488' },
  { id: 'accommodation', name: 'Accommodation', icon: <Hotel className="w-5 h-5" />, color: '#8B5CF6' },
  { id: 'food', name: 'Food & Dining', icon: <Utensils className="w-5 h-5" />, color: '#F59E0B' },
  { id: 'transport', name: 'Local Transport', icon: <Car className="w-5 h-5" />, color: '#3B82F6' },
  { id: 'activities', name: 'Activities & Tours', icon: <Ticket className="w-5 h-5" />, color: '#EC4899' },
  { id: 'shopping', name: 'Shopping', icon: <ShoppingBag className="w-5 h-5" />, color: '#10B981' },
];

interface VacationBudgetToolProps {
  uiConfig?: UIConfig;
}

export const VacationBudgetTool: React.FC<VacationBudgetToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [destination, setDestination] = useState<string>('');
  const [travelers, setTravelers] = useState<string>('2');
  const [nights, setNights] = useState<string>('7');
  const [totalBudget, setTotalBudget] = useState<string>('3000');
  const [currency, setCurrency] = useState<string>('USD');
  const [categories, setCategories] = useState<BudgetCategory[]>(
    DEFAULT_CATEGORIES.map(cat => ({ ...cat, amount: 0 }))
  );
  const [customExpenses, setCustomExpenses] = useState<CustomExpense[]>([]);
  const [newExpenseName, setNewExpenseName] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState('');
  const [isPrefilled, setIsPrefilled] = useState(false);

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as Record<string, any>;
      let hasChanges = false;

      if (params.destination) {
        setDestination(String(params.destination));
        hasChanges = true;
      }
      if (params.travelers || params.people) {
        setTravelers(String(params.travelers || params.people));
        hasChanges = true;
      }
      if (params.nights || params.days) {
        const val = params.nights || (params.days ? Number(params.days) - 1 : 0);
        setNights(String(val));
        hasChanges = true;
      }
      if (params.budget || params.totalBudget) {
        setTotalBudget(String(params.budget || params.totalBudget));
        hasChanges = true;
      }

      if (hasChanges) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const updateCategoryAmount = (id: string, amount: string) => {
    const value = parseFloat(amount) || 0;
    setCategories(prev =>
      prev.map(cat =>
        cat.id === id ? { ...cat, amount: value } : cat
      )
    );
  };

  const addCustomExpense = () => {
    if (!newExpenseName.trim() || !newExpenseAmount) return;
    setCustomExpenses(prev => [
      ...prev,
      {
        id: `custom-${Date.now()}`,
        name: newExpenseName.trim(),
        amount: parseFloat(newExpenseAmount) || 0,
      },
    ]);
    setNewExpenseName('');
    setNewExpenseAmount('');
  };

  const removeCustomExpense = (id: string) => {
    setCustomExpenses(prev => prev.filter(exp => exp.id !== id));
  };

  const calculations = useMemo(() => {
    const budget = parseFloat(totalBudget) || 0;
    const numTravelers = parseInt(travelers) || 1;
    const numNights = parseInt(nights) || 1;

    const categoryTotal = categories.reduce((sum, cat) => sum + cat.amount, 0);
    const customTotal = customExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalPlanned = categoryTotal + customTotal;

    const remaining = budget - totalPlanned;
    const perPerson = totalPlanned / numTravelers;
    const perDay = totalPlanned / (numNights + 1);
    const percentUsed = budget > 0 ? (totalPlanned / budget) * 100 : 0;

    // Category breakdown percentages
    const categoryBreakdown = categories.map(cat => ({
      ...cat,
      percentage: totalPlanned > 0 ? (cat.amount / totalPlanned) * 100 : 0,
    }));

    return {
      budget,
      totalPlanned,
      remaining,
      perPerson,
      perDay,
      percentUsed,
      categoryBreakdown,
      isOverBudget: remaining < 0,
    };
  }, [totalBudget, travelers, nights, categories, customExpenses]);

  const currencySymbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CAD: 'C$',
    AUD: 'A$',
  };

  const formatCurrency = (amount: number): string => {
    const symbol = currencySymbols[currency] || '$';
    return `${symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const suggestBudget = () => {
    const budget = parseFloat(totalBudget) || 3000;
    const suggested = {
      flights: budget * 0.30,
      accommodation: budget * 0.30,
      food: budget * 0.15,
      transport: budget * 0.08,
      activities: budget * 0.12,
      shopping: budget * 0.05,
    };
    setCategories(prev =>
      prev.map(cat => ({
        ...cat,
        amount: suggested[cat.id as keyof typeof suggested] || 0,
      }))
    );
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-4xl mx-auto">
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-[#0D9488] rounded-lg">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.vacationBudget.vacationBudgetPlanner', 'Vacation Budget Planner')}
              </h1>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.vacationBudget.planAndTrackYourTravel', 'Plan and track your travel expenses')}
              </p>
            </div>
          </div>

          {isPrefilled && (
            <div className="flex items-center gap-2 px-4 py-2 bg-teal-500/10 rounded-xl border border-teal-500/20 mb-4">
              <Sparkles className="w-4 h-4 text-teal-500" />
              <span className="text-sm text-teal-500 font-medium">{t('tools.vacationBudget.prefilledFromAiResponse', 'Prefilled from AI response')}</span>
            </div>
          )}

          <div className="space-y-6">
            {/* Trip Details */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.vacationBudget.destination', 'Destination')}
                </label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder={t('tools.vacationBudget.eGParisFrance', 'e.g., Paris, France')}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.vacationBudget.currency', 'Currency')}
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                >
                  <option value="USD">{t('tools.vacationBudget.usdUsDollar', 'USD - US Dollar')}</option>
                  <option value="EUR">{t('tools.vacationBudget.eurEuro', 'EUR - Euro')}</option>
                  <option value="GBP">{t('tools.vacationBudget.gbpBritishPound', 'GBP - British Pound')}</option>
                  <option value="CAD">{t('tools.vacationBudget.cadCanadianDollar', 'CAD - Canadian Dollar')}</option>
                  <option value="AUD">{t('tools.vacationBudget.audAustralianDollar', 'AUD - Australian Dollar')}</option>
                  <option value="JPY">{t('tools.vacationBudget.jpyJapaneseYen', 'JPY - Japanese Yen')}</option>
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.vacationBudget.numberOfTravelers', 'Number of Travelers')}
                </label>
                <input
                  type="number"
                  min="1"
                  value={travelers}
                  onChange={(e) => setTravelers(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.vacationBudget.numberOfNights', 'Number of Nights')}
                </label>
                <input
                  type="number"
                  min="1"
                  value={nights}
                  onChange={(e) => setNights(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.vacationBudget.totalBudget2', 'Total Budget')}
                </label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={totalBudget}
                  onChange={(e) => setTotalBudget(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
            </div>

            {/* Budget Overview */}
            <div className={`p-6 rounded-xl ${calculations.isOverBudget ? (isDark ? 'bg-red-900/30 border border-red-800' : 'bg-red-50 border border-red-200') : (isDark ? 'bg-teal-900/30 border border-teal-800' : 'bg-teal-50 border border-teal-200')}`}>
              <div className="grid md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.vacationBudget.totalBudget', 'Total Budget')}</div>
                  <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {formatCurrency(calculations.budget)}
                  </div>
                </div>
                <div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.vacationBudget.planned', 'Planned')}</div>
                  <div className="text-2xl font-bold text-[#0D9488]">
                    {formatCurrency(calculations.totalPlanned)}
                  </div>
                </div>
                <div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.vacationBudget.remaining', 'Remaining')}</div>
                  <div className={`text-2xl font-bold ${calculations.isOverBudget ? 'text-red-500' : 'text-green-500'}`}>
                    {formatCurrency(calculations.remaining)}
                  </div>
                </div>
                <div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.vacationBudget.budgetUsed', 'Budget Used')}</div>
                  <div className={`text-2xl font-bold ${calculations.percentUsed > 100 ? 'text-red-500' : isDark ? 'text-white' : 'text-gray-900'}`}>
                    {calculations.percentUsed.toFixed(0)}%
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <div className={`h-3 rounded-full ${isDark ? 'bg-gray-600' : 'bg-gray-300'}`}>
                  <div
                    className={`h-full rounded-full transition-all ${calculations.isOverBudget ? 'bg-red-500' : t('tools.vacationBudget.bg0d9488', 'bg-[#0D9488]')}`}
                    style={{ width: `${Math.min(calculations.percentUsed, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Suggest Budget Button */}
            <button
              onClick={suggestBudget}
              className={`w-full py-2 rounded-lg font-medium transition-colors ${
                isDark
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <PieChart className="w-4 h-4 inline mr-2" />
              {t('tools.vacationBudget.autoSuggestBudgetAllocation', 'Auto-suggest Budget Allocation')}
            </button>

            {/* Category Budgets */}
            <div className="space-y-4">
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.vacationBudget.expenseCategories', 'Expense Categories')}
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: `${category.color}20` }}
                      >
                        <div style={{ color: category.color }}>{category.icon}</div>
                      </div>
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {category.name}
                      </span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      step="50"
                      value={category.amount || ''}
                      onChange={(e) => updateCategoryAmount(category.id, e.target.value)}
                      placeholder="0.00"
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDark
                          ? 'bg-gray-600 border-gray-500 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                    {calculations.totalPlanned > 0 && category.amount > 0 && (
                      <div className="mt-2 flex items-center gap-2">
                        <div className={`flex-1 h-1.5 rounded-full ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`}>
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${calculations.categoryBreakdown.find(c => c.id === category.id)?.percentage || 0}%`,
                              backgroundColor: category.color,
                            }}
                          />
                        </div>
                        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {(calculations.categoryBreakdown.find(c => c.id === category.id)?.percentage || 0).toFixed(0)}%
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Expenses */}
            <div className="space-y-4">
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.vacationBudget.customExpenses', 'Custom Expenses')}
              </h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newExpenseName}
                  onChange={(e) => setNewExpenseName(e.target.value)}
                  placeholder={t('tools.vacationBudget.expenseName', 'Expense name')}
                  className={`flex-1 px-4 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
                <input
                  type="number"
                  value={newExpenseAmount}
                  onChange={(e) => setNewExpenseAmount(e.target.value)}
                  placeholder={t('tools.vacationBudget.amount', 'Amount')}
                  className={`w-32 px-4 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
                <button
                  onClick={addCustomExpense}
                  className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0F766E] transition-colors"
                >
                  <PlusCircle className="w-5 h-5" />
                </button>
              </div>
              {customExpenses.length > 0 && (
                <div className="space-y-2">
                  {customExpenses.map((expense) => (
                    <div
                      key={expense.id}
                      className={`flex items-center justify-between p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}
                    >
                      <span className={isDark ? 'text-gray-200' : 'text-gray-700'}>{expense.name}</span>
                      <div className="flex items-center gap-3">
                        <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {formatCurrency(expense.amount)}
                        </span>
                        <button
                          onClick={() => removeCustomExpense(expense.id)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Per Person / Per Day Stats */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'} text-center`}>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.vacationBudget.costPerPerson', 'Cost per Person')}</div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {formatCurrency(calculations.perPerson)}
                </div>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'} text-center`}>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.vacationBudget.costPerDay', 'Cost per Day')}</div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {formatCurrency(calculations.perDay)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VacationBudgetTool;
