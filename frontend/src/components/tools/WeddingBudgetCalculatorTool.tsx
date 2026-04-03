import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Calculator, DollarSign, PieChart, Users, Sparkles, TrendingUp, AlertTriangle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface WeddingBudgetCalculatorToolProps {
  uiConfig?: UIConfig;
}

interface BudgetCategory {
  id: string;
  name: string;
  percentage: number;
  amount: number;
  typical: string;
}

const defaultCategories: Omit<BudgetCategory, 'amount'>[] = [
  { id: 'venue', name: 'Venue & Catering', percentage: 45, typical: '40-50%' },
  { id: 'photography', name: 'Photography & Video', percentage: 12, typical: '10-15%' },
  { id: 'music', name: 'Music & Entertainment', percentage: 8, typical: '5-10%' },
  { id: 'flowers', name: 'Flowers & Decor', percentage: 8, typical: '5-10%' },
  { id: 'attire', name: 'Attire & Beauty', percentage: 8, typical: '5-10%' },
  { id: 'stationery', name: 'Invitations & Stationery', percentage: 3, typical: '2-4%' },
  { id: 'cake', name: 'Wedding Cake', percentage: 3, typical: '2-4%' },
  { id: 'transportation', name: 'Transportation', percentage: 3, typical: '2-4%' },
  { id: 'rings', name: 'Wedding Rings', percentage: 3, typical: '2-4%' },
  { id: 'favors', name: 'Favors & Gifts', percentage: 2, typical: '1-3%' },
  { id: 'officiant', name: 'Officiant & Ceremony', percentage: 2, typical: '1-3%' },
  { id: 'miscellaneous', name: 'Miscellaneous', percentage: 3, typical: '3-5%' },
];

export const WeddingBudgetCalculatorTool: React.FC<WeddingBudgetCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  const [totalBudget, setTotalBudget] = useState<number>(30000);
  const [guestCount, setGuestCount] = useState<number>(100);
  const [categoryPercentages, setCategoryPercentages] = useState<Record<string, number>>(
    defaultCategories.reduce((acc, cat) => ({ ...acc, [cat.id]: cat.percentage }), {})
  );

  // Handle prefill data
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.amount) {
        setTotalBudget(params.amount);
        setIsPrefilled(true);
      }
      if (params.numbers && params.numbers.length > 0) {
        setTotalBudget(params.numbers[0]);
        if (params.numbers.length > 1) setGuestCount(params.numbers[1]);
        setIsPrefilled(true);
      }
      if (params.formData) {
        if (params.formData.budget) setTotalBudget(Number(params.formData.budget));
        if (params.formData.guests) setGuestCount(Number(params.formData.guests));
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const categories = useMemo(() => {
    return defaultCategories.map((cat) => ({
      ...cat,
      percentage: categoryPercentages[cat.id] ?? cat.percentage,
      amount: (totalBudget * (categoryPercentages[cat.id] ?? cat.percentage)) / 100,
    }));
  }, [totalBudget, categoryPercentages]);

  const calculations = useMemo(() => {
    const totalAllocated = Object.values(categoryPercentages).reduce((sum, p) => sum + p, 0);
    const perGuestCost = guestCount > 0 ? totalBudget / guestCount : 0;
    const venuePerPerson = guestCount > 0 ? (categories.find(c => c.id === 'venue')?.amount || 0) / guestCount : 0;

    return {
      totalAllocated,
      unallocated: 100 - totalAllocated,
      perGuestCost,
      venuePerPerson,
      isOverAllocated: totalAllocated > 100,
    };
  }, [categoryPercentages, totalBudget, guestCount, categories]);

  const handlePercentageChange = (categoryId: string, newPercentage: number) => {
    setCategoryPercentages((prev) => ({
      ...prev,
      [categoryId]: Math.max(0, Math.min(100, newPercentage)),
    }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const resetToDefaults = () => {
    setCategoryPercentages(
      defaultCategories.reduce((acc, cat) => ({ ...acc, [cat.id]: cat.percentage }), {})
    );
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-500/10 rounded-lg">
              <Calculator className="w-5 h-5 text-teal-500" />
            </div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.weddingBudgetCalculator.weddingBudgetCalculator', 'Wedding Budget Calculator')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.weddingBudgetCalculator.calculateAndAllocateYourWedding', 'Calculate and allocate your wedding budget')}</p>
            </div>
          </div>
          <button
            onClick={resetToDefaults}
            className={`px-3 py-1.5 text-sm rounded-lg ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
          >
            {t('tools.weddingBudgetCalculator.resetToDefaults', 'Reset to Defaults')}
          </button>
        </div>
      </div>

      {isPrefilled && (
        <div className={`mx-6 mt-4 p-3 rounded-lg flex items-center gap-2 ${isDark ? 'bg-teal-900/20 border border-teal-800' : 'bg-teal-50 border border-teal-200'}`}>
          <Sparkles className="w-4 h-4 text-teal-500" />
          <span className={`text-sm ${isDark ? 'text-teal-400' : 'text-teal-700'}`}>
            {t('tools.weddingBudgetCalculator.preFilledBasedOnYour', 'Pre-filled based on your request')}
          </span>
        </div>
      )}

      <div className="p-6 space-y-6">
        {/* Budget and Guest Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.weddingBudgetCalculator.totalWeddingBudget', 'Total Wedding Budget')}
            </label>
            <div className="relative">
              <DollarSign className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <input
                type="number"
                value={totalBudget}
                onChange={(e) => setTotalBudget(Math.max(0, parseFloat(e.target.value) || 0))}
                className={`w-full pl-10 pr-4 py-3 text-lg font-semibold rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500`}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.weddingBudgetCalculator.expectedGuestCount', 'Expected Guest Count')}
            </label>
            <div className="relative">
              <Users className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <input
                type="number"
                value={guestCount}
                onChange={(e) => setGuestCount(Math.max(1, parseInt(e.target.value) || 1))}
                className={`w-full pl-10 pr-4 py-3 text-lg font-semibold rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500`}
              />
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(totalBudget)}</div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.weddingBudgetCalculator.totalBudget', 'Total Budget')}</div>
          </div>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-teal-900/20' : 'bg-teal-50'}`}>
            <div className="text-xl font-bold text-teal-500">{formatCurrency(calculations.perGuestCost)}</div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.weddingBudgetCalculator.perGuest', 'Per Guest')}</div>
          </div>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
            <div className="text-xl font-bold text-blue-500">{formatCurrency(calculations.venuePerPerson)}</div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.weddingBudgetCalculator.venuePerson', 'Venue/Person')}</div>
          </div>
          <div className={`p-4 rounded-lg text-center ${calculations.isOverAllocated ? (isDark ? 'bg-red-900/20' : 'bg-red-50') : (isDark ? 'bg-green-900/20' : 'bg-green-50')}`}>
            <div className={`text-xl font-bold ${calculations.isOverAllocated ? 'text-red-500' : 'text-green-500'}`}>
              {calculations.totalAllocated.toFixed(1)}%
            </div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.weddingBudgetCalculator.allocated', 'Allocated')}</div>
          </div>
        </div>

        {/* Allocation Warning */}
        {calculations.isOverAllocated && (
          <div className={`p-3 rounded-lg flex items-center gap-2 ${isDark ? 'bg-red-900/20 text-red-400' : 'bg-red-50 text-red-700'}`}>
            <AlertTriangle className="w-5 h-5" />
            <span className="text-sm">Budget is over-allocated by {(calculations.totalAllocated - 100).toFixed(1)}%</span>
          </div>
        )}

        {/* Budget Allocation Bar */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-2 mb-3">
            <PieChart className="w-4 h-4 text-teal-500" />
            <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.weddingBudgetCalculator.budgetAllocation', 'Budget Allocation')}</span>
          </div>
          <div className="h-6 rounded-full overflow-hidden flex bg-gray-300">
            {categories.map((cat, idx) => (
              <div
                key={cat.id}
                style={{
                  width: `${cat.percentage}%`,
                  backgroundColor: `hsl(${160 + idx * 20}, 70%, ${isDark ? 45 : 50}%)`,
                }}
                title={`${cat.name}: ${cat.percentage}%`}
                className="transition-all"
              />
            ))}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="space-y-3">
          <h4 className={`font-medium flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <TrendingUp className="w-4 h-4 text-teal-500" />
            {t('tools.weddingBudgetCalculator.budgetCategories', 'Budget Categories')}
          </h4>
          <div className="grid gap-3">
            {categories.map((category, idx) => (
              <div key={category.id} className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: `hsl(${160 + idx * 20}, 70%, ${isDark ? 45 : 50}%)` }}
                    />
                    <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{category.name}</span>
                    <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>({category.typical})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={category.percentage}
                      onChange={(e) => handlePercentageChange(category.id, parseFloat(e.target.value) || 0)}
                      className={`w-16 px-2 py-1 text-sm text-center rounded border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                      min="0"
                      max="100"
                      step="0.5"
                    />
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className={`h-2 flex-1 rounded-full mr-4 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(category.percentage, 100)}%`,
                        backgroundColor: `hsl(${160 + idx * 20}, 70%, ${isDark ? 45 : 50}%)`,
                      }}
                    />
                  </div>
                  <span className={`font-semibold min-w-[100px] text-right ${isDark ? 'text-teal-400' : 'text-teal-600'}`}>
                    {formatCurrency(category.amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Reference */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-teal-50/50'}`}>
          <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.weddingBudgetCalculator.quickReference', 'Quick Reference')}</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            <div>
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.weddingBudgetCalculator.budgetPer50Guests', 'Budget per 50 guests:')}</span>
              <span className={`ml-2 font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {formatCurrency(totalBudget * (50 / guestCount))}
              </span>
            </div>
            <div>
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.weddingBudgetCalculator.budgetPer150Guests', 'Budget per 150 guests:')}</span>
              <span className={`ml-2 font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {formatCurrency(totalBudget * (150 / guestCount))}
              </span>
            </div>
            <div>
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.weddingBudgetCalculator.budgetPer200Guests', 'Budget per 200 guests:')}</span>
              <span className={`ml-2 font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {formatCurrency(totalBudget * (200 / guestCount))}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeddingBudgetCalculatorTool;
