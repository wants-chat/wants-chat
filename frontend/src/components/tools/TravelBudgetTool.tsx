import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Plus, Trash2, PieChart, AlertTriangle, Sparkles, TrendingUp } from 'lucide-react';
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

interface TravelBudgetToolProps {
  uiConfig?: UIConfig;
}

interface TravelExpense {
  id: string;
  category: string;
  description: string;
  estimatedCost: number;
  actualCost: number;
  currency: string;
  color: string;
}

const COLUMNS: ColumnConfig[] = [
  { key: 'category', header: 'Category', type: 'string' },
  { key: 'description', header: 'Description', type: 'string' },
  { key: 'estimatedCost', header: 'Estimated', type: 'currency' },
  { key: 'actualCost', header: 'Actual', type: 'currency' },
  { key: 'difference', header: 'Difference', type: 'currency' },
];

const DEFAULT_EXPENSES: TravelExpense[] = [
  { id: '1', category: 'Flights', description: 'Round trip flights', estimatedCost: 800, actualCost: 0, currency: 'USD', color: '#3B82F6' },
  { id: '2', category: 'Accommodation', description: 'Hotel or airbnb (7 nights)', estimatedCost: 1050, actualCost: 0, currency: 'USD', color: '#10B981' },
  { id: '3', category: 'Food & Dining', description: 'Meals and dining', estimatedCost: 350, actualCost: 0, currency: 'USD', color: '#F59E0B' },
  { id: '4', category: 'Activities', description: 'Tours and experiences', estimatedCost: 400, actualCost: 0, currency: 'USD', color: '#8B5CF6' },
  { id: '5', category: 'Transportation', description: 'Local transport and taxi', estimatedCost: 200, actualCost: 0, currency: 'USD', color: '#EC4899' },
  { id: '6', category: 'Miscellaneous', description: 'Souvenirs and extras', estimatedCost: 200, actualCost: 0, currency: 'USD', color: '#06B6D4' },
];

export const TravelBudgetTool: React.FC<TravelBudgetToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [destination, setDestination] = useState('Destination');
  const [tripDates, setTripDates] = useState('');
  const [totalBudget, setTotalBudget] = useState('3500');

  // Use useToolData hook for expenses with backend sync
  const {
    data: expenses,
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
  } = useToolData<TravelExpense>(
    'travel-budget',
    DEFAULT_EXPENSES,
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
      if (data.destination) setDestination(data.destination.toString());
      if (data.tripDates) setTripDates(data.tripDates.toString());
      if (data.totalBudget) setTotalBudget(data.totalBudget.toString());
      setIsPrefilled(true);
    }
  }, [uiConfig]);

  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#EF4444', '#84CC16'];

  const calculations = useMemo(() => {
    const budgetNum = parseFloat(totalBudget) || 0;
    const totalEstimated = expenses.reduce((sum, e) => sum + e.estimatedCost, 0);
    const totalActual = expenses.reduce((sum, e) => sum + e.actualCost, 0);
    const remaining = budgetNum - totalActual;
    const variance = totalEstimated - totalActual;

    return { budgetNum, totalEstimated, totalActual, remaining, variance };
  }, [totalBudget, expenses]);

  // Prepare export data with calculated fields
  const exportData = useMemo(() => {
    return expenses.map((exp) => ({
      category: exp.category,
      description: exp.description,
      estimatedCost: exp.estimatedCost,
      actualCost: exp.actualCost,
      difference: exp.estimatedCost - exp.actualCost,
      currency: exp.currency,
    }));
  }, [expenses]);

  const addExpense = () => {
    const newColor = colors[expenses.length % colors.length];
    addItem({
      id: Date.now().toString(),
      category: '',
      description: '',
      estimatedCost: 0,
      actualCost: 0,
      currency: 'USD',
      color: newColor,
    });
  };

  const updateExpense = (id: string, field: keyof TravelExpense, value: string | number) => {
    const expense = expenses.find(e => e.id === id);
    if (expense) {
      updateItem(id, { [field]: value });
    }
  };

  const removeExpense = (id: string) => {
    deleteItem(id);
  };

  const getPercentage = (value: number) => {
    return calculations.budgetNum > 0 ? ((value / calculations.budgetNum) * 100).toFixed(1) : '0';
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-cyan-900/20' : 'bg-gradient-to-r from-white to-cyan-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/10 rounded-lg">
              <MapPin className="w-5 h-5 text-cyan-500" />
            </div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.travelBudget.travelBudgetPlanner', 'Travel Budget Planner')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.travelBudget.planAndTrackYourTravel', 'Plan and track your travel expenses')}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <WidgetEmbedButton toolSlug="travel-budget" toolName="Travel Budget" />

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
              onExportCSV={() => exportCSV({ filename: 'travel-budget' })}
              onExportExcel={() => exportExcel({ filename: 'travel-budget' })}
              onExportJSON={() => exportJSON({ filename: 'travel-budget' })}
              onExportPDF={async () => {
                await exportPDF({
                  filename: 'travel-budget',
                  title: 'Travel Budget Plan',
                });
              }}
              onPrint={() => printData('Travel Budget Plan')}
              onCopyToClipboard={() => copyToClipboard('tab')}
              theme={isDark ? 'dark' : 'light'}
            />
          </div>
        </div>
      </div>

      {isPrefilled && (
        <div className={`mx-6 mt-4 p-3 rounded-lg flex items-center gap-2 ${isDark ? 'bg-cyan-900/20 border border-cyan-800' : 'bg-cyan-50 border border-cyan-200'}`}>
          <Sparkles className="w-4 h-4 text-cyan-500" />
          <span className={`text-sm ${isDark ? 'text-cyan-400' : 'text-cyan-700'}`}>
            {t('tools.travelBudget.preFilledBasedOnYour', 'Pre-filled based on your request')}
          </span>
        </div>
      )}

      <div className="p-6 space-y-6">
        {/* Trip Information */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.travelBudget.destination', 'Destination')}</label>
            <input type="text" value={destination} onChange={(e) => setDestination(e.target.value)} className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`} />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.travelBudget.tripDates', 'Trip Dates')}</label>
            <input type="text" value={tripDates} onChange={(e) => setTripDates(e.target.value)} placeholder={t('tools.travelBudget.eGJul18', 'e.g., Jul 1 - 8, 2024')} className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`} />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.travelBudget.totalBudget', 'Total Budget')}</label>
            <input type="number" value={totalBudget} onChange={(e) => setTotalBudget(e.target.value)} className={`w-full px-4 py-2 rounded-lg border text-lg font-semibold ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`} />
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-3">
          <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>${calculations.budgetNum.toLocaleString()}</div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.travelBudget.totalBudget2', 'Total Budget')}</div>
          </div>
          <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
            <div className="text-lg font-bold text-blue-500">${calculations.totalEstimated.toLocaleString()}</div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.travelBudget.estimated', 'Estimated')}</div>
          </div>
          <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-orange-900/20' : 'bg-orange-50'}`}>
            <div className="text-lg font-bold text-orange-500">${calculations.totalActual.toLocaleString()}</div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.travelBudget.actual', 'Actual')}</div>
          </div>
          <div className={`p-3 rounded-lg text-center ${calculations.remaining >= 0 ? (isDark ? 'bg-green-900/20' : 'bg-green-50') : (isDark ? 'bg-red-900/20' : 'bg-red-50')}`}>
            <div className={`text-lg font-bold ${calculations.remaining >= 0 ? 'text-green-500' : 'text-red-500'}`}>${Math.abs(calculations.remaining).toLocaleString()}</div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{calculations.remaining >= 0 ? t('tools.travelBudget.remaining', 'Remaining') : t('tools.travelBudget.overBudget', 'Over Budget')}</div>
          </div>
        </div>

        {/* Variance Alert */}
        {calculations.totalActual > calculations.totalEstimated && (
          <div className={`p-3 rounded-lg flex items-center gap-2 ${isDark ? 'bg-yellow-900/20 text-yellow-400' : 'bg-yellow-50 text-yellow-700'}`}>
            <AlertTriangle className="w-5 h-5" />
            <span className="text-sm">You've spent ${Math.abs(calculations.totalActual - calculations.totalEstimated).toLocaleString()} more than estimated!</span>
          </div>
        )}

        {/* Budget Visual */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="h-8 rounded-full overflow-hidden flex">
            {expenses.map((exp) => (
              <div key={exp.id} style={{ width: `${getPercentage(exp.estimatedCost)}%`, backgroundColor: exp.color }} title={`${exp.category}: ${getPercentage(exp.estimatedCost)}%`} />
            ))}
            {calculations.budgetNum - calculations.totalEstimated > 0 && (
              <div style={{ width: `${getPercentage(calculations.budgetNum - calculations.totalEstimated)}%` }} className={isDark ? 'bg-gray-700' : 'bg-gray-300'} title={`Unallocated: ${getPercentage(calculations.budgetNum - calculations.totalEstimated)}%`} />
            )}
          </div>
          <div className="flex flex-wrap gap-3 mt-3">
            {expenses.map((exp) => (
              <span key={exp.id} className="flex items-center gap-1 text-xs">
                <span className="w-3 h-3 rounded" style={{ backgroundColor: exp.color }}></span>
                <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{exp.category}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Expenses */}
        <div className="space-y-3">
          <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.travelBudget.tripExpenses', 'Trip Expenses')}</h4>
          {expenses.map((exp) => {
            const percentageOfBudget = calculations.budgetNum > 0 ? (exp.actualCost / calculations.budgetNum) * 100 : 0;
            const isOver = exp.actualCost > exp.estimatedCost;
            return (
              <div key={exp.id} className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="grid grid-cols-12 gap-2 items-center mb-2">
                  <input type="color" value={exp.color} onChange={(e) => updateExpense(exp.id, 'color', e.target.value)} className="col-span-1 w-8 h-8 rounded cursor-pointer" />
                  <input type="text" value={exp.category} onChange={(e) => updateExpense(exp.id, 'category', e.target.value)} placeholder={t('tools.travelBudget.category', 'Category')} className={`col-span-2 px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`} />
                  <input type="text" value={exp.description} onChange={(e) => updateExpense(exp.id, 'description', e.target.value)} placeholder={t('tools.travelBudget.description', 'Description')} className={`col-span-3 px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`} />
                  <input type="number" value={exp.estimatedCost} onChange={(e) => updateExpense(exp.id, 'estimatedCost', parseFloat(e.target.value) || 0)} placeholder={t('tools.travelBudget.estimated2', 'Estimated')} className={`col-span-2 px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`} />
                  <input type="number" value={exp.actualCost} onChange={(e) => updateExpense(exp.id, 'actualCost', parseFloat(e.target.value) || 0)} placeholder={t('tools.travelBudget.actual2', 'Actual')} className={`col-span-2 px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`} />
                  <button onClick={() => removeExpense(exp.id)} className={`col-span-1 p-2 rounded-lg ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-200 text-gray-500'}`}><Trash2 className="w-4 h-4" /></button>
                </div>
                <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <div className={`h-full transition-all ${isOver ? 'bg-red-500' : ''}`} style={{ width: `${Math.min(percentageOfBudget, 100)}%`, backgroundColor: isOver ? undefined : exp.color }} />
                </div>
                <div className="flex justify-between mt-1 text-xs">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>${exp.actualCost} / ${exp.estimatedCost}</span>
                  <span className={isOver ? 'text-red-500' : isDark ? 'text-gray-400' : 'text-gray-500'}>{((exp.actualCost / exp.estimatedCost) * 100 || 0).toFixed(0)}%</span>
                </div>
              </div>
            );
          })}
          <button onClick={addExpense} className={`w-full py-2 rounded-lg border-2 border-dashed flex items-center justify-center gap-2 ${isDark ? 'border-gray-700 text-gray-400 hover:bg-gray-800' : 'border-gray-300 text-gray-500 hover:bg-gray-50'}`}><Plus className="w-4 h-4" /> {t('tools.travelBudget.addExpense', 'Add Expense')}</button>
        </div>

        {/* Budget Breakdown */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <TrendingUp className="w-4 h-4" />
            {t('tools.travelBudget.budgetBreakdown', 'Budget Breakdown')}
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.travelBudget.totalEstimated', 'Total Estimated:')}</span>
              <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>${calculations.totalEstimated.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.travelBudget.totalActual', 'Total Actual:')}</span>
              <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>${calculations.totalActual.toLocaleString()}</span>
            </div>
            <div className={`border-t pt-2 flex justify-between ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.travelBudget.variance', 'Variance:')}</span>
              <span className={`font-semibold ${calculations.variance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {calculations.variance >= 0 ? '+' : '-'}${Math.abs(calculations.variance).toLocaleString()}
              </span>
            </div>
            <div className={`border-t pt-2 flex justify-between text-base ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <span className={isDark ? 'text-gray-200' : 'text-gray-700'}>{t('tools.travelBudget.remainingBudget', 'Remaining Budget:')}</span>
              <span className={`font-bold ${calculations.remaining >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                ${Math.abs(calculations.remaining).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TravelBudgetTool;
