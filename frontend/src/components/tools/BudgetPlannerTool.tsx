import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Wallet, Plus, Trash2, PieChart, AlertTriangle, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import {
  type ColumnConfig,
} from '../../lib/toolDataUtils';

interface BudgetPlannerToolProps {
  uiConfig?: UIConfig;
}

interface BudgetCategory {
  id: string;
  name: string;
  budgeted: number;
  spent: number;
  color: string;
}

const COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Category', type: 'string' },
  { key: 'budgeted', header: 'Budgeted', type: 'currency' },
  { key: 'spent', header: 'Spent', type: 'currency' },
  { key: 'remaining', header: 'Remaining', type: 'currency' },
  { key: 'percentUsed', header: '% Used', type: 'percent' },
];

const DEFAULT_CATEGORIES: BudgetCategory[] = [
  { id: '1', name: 'Housing', budgeted: 1500, spent: 1500, color: '#3B82F6' },
  { id: '2', name: 'Food', budgeted: 600, spent: 450, color: '#10B981' },
  { id: '3', name: 'Transportation', budgeted: 400, spent: 380, color: '#F59E0B' },
  { id: '4', name: 'Utilities', budgeted: 200, spent: 180, color: '#8B5CF6' },
  { id: '5', name: 'Entertainment', budgeted: 300, spent: 350, color: '#EC4899' },
  { id: '6', name: 'Savings', budgeted: 500, spent: 500, color: '#06B6D4' },
];

export const BudgetPlannerTool: React.FC<BudgetPlannerToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [income, setIncome] = useState('5000');

  // Use useToolData hook for categories with backend sync
  const {
    data: categories,
    addItem,
    updateItem,
    deleteItem,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    copyToClipboard,
    print: printData,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<BudgetCategory>(
    'budget-planner',
    DEFAULT_CATEGORIES,
    COLUMNS,
    {
      autoSave: true,
      autoSaveDelay: 1500,
    }
  );

  // Handle prefill data
  useEffect(() => {
    if (uiConfig?.prefillData) {
      const data = uiConfig.prefillData as ToolPrefillData;
      if (data.income) setIncome(data.income.toString());
      setIsPrefilled(true);
    }
  }, [uiConfig]);

  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#EF4444', '#84CC16'];

  const calculations = useMemo(() => {
    const incomeNum = parseFloat(income) || 0;
    const totalBudgeted = categories.reduce((sum, c) => sum + c.budgeted, 0);
    const totalSpent = categories.reduce((sum, c) => sum + c.spent, 0);
    const remaining = incomeNum - totalSpent;
    const unallocated = incomeNum - totalBudgeted;

    return { incomeNum, totalBudgeted, totalSpent, remaining, unallocated };
  }, [income, categories]);

  // Prepare export data with calculated fields
  const exportData = useMemo(() => {
    return categories.map((cat) => ({
      name: cat.name,
      budgeted: cat.budgeted,
      spent: cat.spent,
      remaining: cat.budgeted - cat.spent,
      percentUsed: cat.budgeted > 0 ? (cat.spent / cat.budgeted) * 100 : 0,
    }));
  }, [categories]);

  const addCategory = () => {
    const newColor = colors[categories.length % colors.length];
    addItem({
      id: Date.now().toString(),
      name: '',
      budgeted: 0,
      spent: 0,
      color: newColor,
    });
  };

  const updateCategory = (id: string, field: keyof BudgetCategory, value: string | number) => {
    const category = categories.find(c => c.id === id);
    if (category) {
      updateItem(id, { [field]: value });
    }
  };

  const removeCategory = (id: string) => {
    deleteItem(id);
  };

  const getPercentage = (value: number) => {
    return calculations.incomeNum > 0 ? ((value / calculations.incomeNum) * 100).toFixed(1) : '0';
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-violet-900/20' : 'bg-gradient-to-r from-white to-violet-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-violet-500/10 rounded-lg">
              <Wallet className="w-5 h-5 text-violet-500" />
            </div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.budgetPlanner.budgetPlanner', 'Budget Planner')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.budgetPlanner.planAndTrackYourMonthly', 'Plan and track your monthly budget')}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <WidgetEmbedButton toolSlug="budget-planner" toolName="Budget Planner" />

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
              onExportCSV={() => exportCSV({ filename: 'budget-plan' })}
              onExportExcel={() => exportExcel({ filename: 'budget-plan' })}
              onExportJSON={() => exportJSON({ filename: 'budget-plan' })}
              onExportPDF={async () => {
                await exportPDF({
                  filename: 'budget-plan',
                  title: 'Budget Plan',
                });
              }}
              onPrint={() => printData('Budget Plan')}
              onCopyToClipboard={() => copyToClipboard('tab')}
              theme={isDark ? 'dark' : 'light'}
            />
          </div>
        </div>
      </div>

      {isPrefilled && (
        <div className={`mx-6 mt-4 p-3 rounded-lg flex items-center gap-2 ${isDark ? 'bg-violet-900/20 border border-violet-800' : 'bg-violet-50 border border-violet-200'}`}>
          <Sparkles className="w-4 h-4 text-violet-500" />
          <span className={`text-sm ${isDark ? 'text-violet-400' : 'text-violet-700'}`}>
            {t('tools.budgetPlanner.preFilledBasedOnYour', 'Pre-filled based on your request')}
          </span>
        </div>
      )}

      <div className="p-6 space-y-6">
        {/* Income Input */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.budgetPlanner.monthlyIncome', 'Monthly Income')}</label>
          <input type="number" value={income} onChange={(e) => setIncome(e.target.value)} className={`w-full px-4 py-3 rounded-lg border text-xl ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`} />
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-3">
          <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>${calculations.incomeNum.toLocaleString()}</div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.budgetPlanner.income', 'Income')}</div>
          </div>
          <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
            <div className="text-lg font-bold text-blue-500">${calculations.totalBudgeted.toLocaleString()}</div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.budgetPlanner.budgeted', 'Budgeted')}</div>
          </div>
          <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-orange-900/20' : 'bg-orange-50'}`}>
            <div className="text-lg font-bold text-orange-500">${calculations.totalSpent.toLocaleString()}</div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.budgetPlanner.spent', 'Spent')}</div>
          </div>
          <div className={`p-3 rounded-lg text-center ${calculations.remaining >= 0 ? (isDark ? 'bg-green-900/20' : 'bg-green-50') : (isDark ? 'bg-red-900/20' : 'bg-red-50')}`}>
            <div className={`text-lg font-bold ${calculations.remaining >= 0 ? 'text-green-500' : 'text-red-500'}`}>${Math.abs(calculations.remaining).toLocaleString()}</div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{calculations.remaining >= 0 ? t('tools.budgetPlanner.remaining', 'Remaining') : t('tools.budgetPlanner.overBudget', 'Over Budget')}</div>
          </div>
        </div>

        {/* Warning */}
        {calculations.unallocated < 0 && (
          <div className={`p-3 rounded-lg flex items-center gap-2 ${isDark ? 'bg-yellow-900/20 text-yellow-400' : 'bg-yellow-50 text-yellow-700'}`}>
            <AlertTriangle className="w-5 h-5" />
            <span className="text-sm">You've budgeted ${Math.abs(calculations.unallocated).toLocaleString()} more than your income!</span>
          </div>
        )}

        {/* Budget Visual */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="h-8 rounded-full overflow-hidden flex">
            {categories.map((cat) => (
              <div key={cat.id} style={{ width: `${getPercentage(cat.budgeted)}%`, backgroundColor: cat.color }} title={`${cat.name}: ${getPercentage(cat.budgeted)}%`} />
            ))}
            {calculations.unallocated > 0 && (
              <div style={{ width: `${getPercentage(calculations.unallocated)}%` }} className={isDark ? 'bg-gray-700' : 'bg-gray-300'} title={`Unallocated: ${getPercentage(calculations.unallocated)}%`} />
            )}
          </div>
          <div className="flex flex-wrap gap-3 mt-3">
            {categories.map((cat) => (
              <span key={cat.id} className="flex items-center gap-1 text-xs">
                <span className="w-3 h-3 rounded" style={{ backgroundColor: cat.color }}></span>
                <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{cat.name}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-3">
          <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.budgetPlanner.budgetCategories', 'Budget Categories')}</h4>
          {categories.map((cat) => {
            const percentage = cat.budgeted > 0 ? (cat.spent / cat.budgeted) * 100 : 0;
            const isOverBudget = cat.spent > cat.budgeted;
            return (
              <div key={cat.id} className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="grid grid-cols-12 gap-2 items-center mb-2">
                  <input type="color" value={cat.color} onChange={(e) => updateCategory(cat.id, 'color', e.target.value)} className="col-span-1 w-8 h-8 rounded cursor-pointer" />
                  <input type="text" value={cat.name} onChange={(e) => updateCategory(cat.id, 'name', e.target.value)} placeholder={t('tools.budgetPlanner.category', 'Category')} className={`col-span-4 px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`} />
                  <input type="number" value={cat.budgeted} onChange={(e) => updateCategory(cat.id, 'budgeted', parseFloat(e.target.value) || 0)} placeholder={t('tools.budgetPlanner.budgeted2', 'Budgeted')} className={`col-span-3 px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`} />
                  <input type="number" value={cat.spent} onChange={(e) => updateCategory(cat.id, 'spent', parseFloat(e.target.value) || 0)} placeholder={t('tools.budgetPlanner.spent2', 'Spent')} className={`col-span-3 px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`} />
                  <button onClick={() => removeCategory(cat.id)} className={`col-span-1 p-2 rounded-lg ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-200 text-gray-500'}`}><Trash2 className="w-4 h-4" /></button>
                </div>
                <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <div className={`h-full transition-all ${isOverBudget ? 'bg-red-500' : ''}`} style={{ width: `${Math.min(percentage, 100)}%`, backgroundColor: isOverBudget ? undefined : cat.color }} />
                </div>
                <div className="flex justify-between mt-1 text-xs">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>${cat.spent} / ${cat.budgeted}</span>
                  <span className={isOverBudget ? 'text-red-500' : isDark ? 'text-gray-400' : 'text-gray-500'}>{percentage.toFixed(0)}%</span>
                </div>
              </div>
            );
          })}
          <button onClick={addCategory} className={`w-full py-2 rounded-lg border-2 border-dashed flex items-center justify-center gap-2 ${isDark ? 'border-gray-700 text-gray-400' : 'border-gray-300 text-gray-500'}`}><Plus className="w-4 h-4" /> {t('tools.budgetPlanner.addCategory', 'Add Category')}</button>
        </div>

        {/* 50/30/20 Rule */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>50/30/20 Rule Suggestion</h4>
          <div className="grid grid-cols-3 gap-3 text-center text-sm">
            <div><span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.budgetPlanner.needs50', 'Needs (50%)')}</span><br /><strong className={isDark ? 'text-white' : 'text-gray-900'}>${(calculations.incomeNum * 0.5).toLocaleString()}</strong></div>
            <div><span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.budgetPlanner.wants30', 'Wants (30%)')}</span><br /><strong className={isDark ? 'text-white' : 'text-gray-900'}>${(calculations.incomeNum * 0.3).toLocaleString()}</strong></div>
            <div><span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.budgetPlanner.savings20', 'Savings (20%)')}</span><br /><strong className={isDark ? 'text-white' : 'text-gray-900'}>${(calculations.incomeNum * 0.2).toLocaleString()}</strong></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetPlannerTool;
