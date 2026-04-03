import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Target, DollarSign, Calendar, TrendingUp, PiggyBank, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useToolData } from '../../hooks/useToolData';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { ExportDropdown } from '../ui/ExportDropdown';

interface SavingsGoalToolProps {
  uiConfig?: UIConfig;
}

interface SavingsGoalItem {
  id: string;
  goalAmount: number;
  currentSavings: number;
  monthlyContribution: number;
  interestRate: number;
  targetDate: string;
  createdAt: string;
  updatedAt: string;
}

const COLUMNS = [
  { key: 'goalAmount', header: 'Goal Amount', type: 'currency' as const },
  { key: 'currentSavings', header: 'Current Savings', type: 'currency' as const },
  { key: 'monthlyContribution', header: 'Monthly Contribution', type: 'currency' as const },
  { key: 'interestRate', header: 'Interest Rate (%)', type: 'number' as const },
  { key: 'targetDate', header: 'Target Date', type: 'string' as const },
  { key: 'createdAt', header: 'Created', type: 'date' as const },
];

export const SavingsGoalTool: React.FC<SavingsGoalToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [goalAmount, setGoalAmount] = useState(50000);
  const [currentSavings, setCurrentSavings] = useState(5000);
  const [monthlyContribution, setMonthlyContribution] = useState(500);
  const [interestRate, setInterestRate] = useState(5);
  const [targetDate, setTargetDate] = useState('');
  const [isPrefilled, setIsPrefilled] = useState(false);

  const {
    data: savedGoals,
    addItem,
    updateItem,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    importCSV,
    importJSON,
    copyToClipboard,
    print,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<SavingsGoalItem>('savings-goals', [], COLUMNS, {
    autoSave: true,
    autoSaveDelay: 2000,
  });

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.amount !== undefined) {
        setGoalAmount(params.amount);
        setIsPrefilled(true);
      }
      if (params.numbers && params.numbers.length > 0) {
        setGoalAmount(params.numbers[0]);
        if (params.numbers.length > 1) {
          setCurrentSavings(params.numbers[1]);
        }
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const calculations = useMemo(() => {
    const remaining = goalAmount - currentSavings;
    const monthlyRate = interestRate / 100 / 12;

    // Calculate months to reach goal with contributions and interest
    let balance = currentSavings;
    let months = 0;
    const maxMonths = 600; // 50 years max

    if (monthlyContribution > 0 || (currentSavings > 0 && interestRate > 0)) {
      while (balance < goalAmount && months < maxMonths) {
        balance = balance * (1 + monthlyRate) + monthlyContribution;
        months++;
      }
    }

    // Calculate required monthly to reach goal by target date
    let requiredMonthly = 0;
    if (targetDate) {
      const target = new Date(targetDate);
      const now = new Date();
      const monthsToTarget = Math.max(1,
        (target.getFullYear() - now.getFullYear()) * 12 +
        (target.getMonth() - now.getMonth())
      );

      if (monthlyRate > 0) {
        // PMT = (FV - PV * (1 + r)^n) / (((1 + r)^n - 1) / r)
        const compoundFactor = Math.pow(1 + monthlyRate, monthsToTarget);
        const fvCurrent = currentSavings * compoundFactor;
        const needed = goalAmount - fvCurrent;
        requiredMonthly = needed / ((compoundFactor - 1) / monthlyRate);
      } else {
        requiredMonthly = (goalAmount - currentSavings) / monthsToTarget;
      }
    }

    // Monthly breakdown for chart
    const monthlyData = [];
    balance = currentSavings;
    for (let m = 0; m <= Math.min(months, 120); m += Math.ceil(months / 12) || 1) {
      let tempBalance = currentSavings;
      for (let i = 0; i < m; i++) {
        tempBalance = tempBalance * (1 + monthlyRate) + monthlyContribution;
      }
      monthlyData.push({
        month: m,
        balance: tempBalance,
        contributions: currentSavings + monthlyContribution * m,
      });
    }

    const targetYear = Math.floor(months / 12);
    const targetMonth = months % 12;

    return {
      remaining,
      monthsToGoal: months,
      yearsToGoal: targetYear,
      monthsRemainder: targetMonth,
      requiredMonthly: Math.max(0, requiredMonthly),
      monthlyData,
      willReachGoal: months < maxMonths,
      totalContributions: currentSavings + monthlyContribution * months,
      totalInterest: goalAmount - (currentSavings + monthlyContribution * months),
    };
  }, [goalAmount, currentSavings, monthlyContribution, interestRate, targetDate]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const progressPercent = Math.min(100, (currentSavings / goalAmount) * 100);

  const handleSaveGoal = () => {
    const newGoal: SavingsGoalItem = {
      id: Date.now().toString(),
      goalAmount,
      currentSavings,
      monthlyContribution,
      interestRate,
      targetDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addItem(newGoal);
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-purple-900/20' : 'bg-gradient-to-r from-white to-purple-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Target className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.savingsGoal.savingsGoalCalculator', 'Savings Goal Calculator')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.savingsGoal.planAndTrackYourSavings', 'Plan and track your savings goals')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <WidgetEmbedButton toolSlug="savings-goal" toolName="Savings Goal" />

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
              onExportCSV={() => exportCSV()}
              onExportExcel={() => exportExcel()}
              onExportJSON={() => exportJSON()}
              onExportPDF={() => exportPDF()}
              onPrint={() => print('Savings Goals')}
              onCopyToClipboard={() => copyToClipboard('csv')}
              onImportCSV={importCSV}
              onImportJSON={importJSON}
              showImport={true}
              theme={theme}
            />
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.savingsGoal.valuesLoadedFromAiResponse', 'Values loaded from AI response')}</span>
          </div>
        )}

        {/* Progress Bar */}
        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex justify-between mb-2">
            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.savingsGoal.progress', 'Progress')}</span>
            <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {progressPercent.toFixed(1)}%
            </span>
          </div>
          <div className={`h-4 rounded-full overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {formatCurrency(currentSavings)}
            </span>
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {formatCurrency(goalAmount)}
            </span>
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Target className="w-4 h-4 inline mr-1" />
              {t('tools.savingsGoal.goalAmount', 'Goal Amount')}
            </label>
            <div className="relative">
              <DollarSign className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <input
                type="number"
                min="0"
                value={goalAmount}
                onChange={(e) => setGoalAmount(Number(e.target.value))}
                className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${
                  isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <PiggyBank className="w-4 h-4 inline mr-1" />
              {t('tools.savingsGoal.currentSavings', 'Current Savings')}
            </label>
            <div className="relative">
              <DollarSign className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <input
                type="number"
                min="0"
                value={currentSavings}
                onChange={(e) => setCurrentSavings(Number(e.target.value))}
                className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${
                  isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.savingsGoal.monthlyContribution', 'Monthly Contribution')}
            </label>
            <div className="relative">
              <DollarSign className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <input
                type="number"
                min="0"
                value={monthlyContribution}
                onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${
                  isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <TrendingUp className="w-4 h-4 inline mr-1" />
              {t('tools.savingsGoal.expectedReturn', 'Expected Return (%)')}
            </label>
            <input
              type="number"
              min="0"
              max="20"
              step="0.1"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className={`w-full px-4 py-2.5 rounded-lg border ${
                isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Calendar className="w-4 h-4 inline mr-1" />
              {t('tools.savingsGoal.targetDateOptional', 'Target Date (Optional)')}
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className={`w-full px-4 py-2.5 rounded-lg border ${
                isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleSaveGoal}
              className={`w-full px-4 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                isDark
                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                  : 'bg-purple-500 hover:bg-purple-600 text-white'
              }`}
            >
              {t('tools.savingsGoal.saveGoal', 'Save Goal')}
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-4 rounded-xl ${isDark ? 'bg-purple-900/20 border-purple-800' : 'bg-purple-50 border-purple-100'} border`}>
            <p className={`text-sm ${isDark ? 'text-purple-300' : 'text-purple-600'}`}>{t('tools.savingsGoal.amountRemaining', 'Amount Remaining')}</p>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {formatCurrency(calculations.remaining)}
            </p>
          </div>

          <div className={`p-4 rounded-xl ${isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-100'} border`}>
            <p className={`text-sm ${isDark ? 'text-green-300' : 'text-green-600'}`}>{t('tools.savingsGoal.timeToGoal', 'Time to Goal')}</p>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {calculations.willReachGoal ? (
                <>
                  {calculations.yearsToGoal > 0 && `${calculations.yearsToGoal}y `}
                  {calculations.monthsRemainder}m
                </>
              ) : (
                'N/A'
              )}
            </p>
          </div>

          <div className={`p-4 rounded-xl ${isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-100'} border`}>
            <p className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>{t('tools.savingsGoal.interestEarned', 'Interest Earned')}</p>
            <p className={`text-2xl font-bold text-green-500`}>
              {calculations.totalInterest > 0 ? formatCurrency(calculations.totalInterest) : '$0'}
            </p>
          </div>
        </div>

        {/* Target Date Calculation */}
        {targetDate && (
          <div className={`p-4 rounded-xl ${isDark ? 'bg-orange-900/20 border-orange-800' : 'bg-orange-50 border-orange-100'} border`}>
            <p className={`text-sm ${isDark ? 'text-orange-300' : 'text-orange-600'}`}>
              Required Monthly Savings to Reach Goal by {new Date(targetDate).toLocaleDateString()}
            </p>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {formatCurrency(calculations.requiredMonthly)}/month
            </p>
            {calculations.requiredMonthly > monthlyContribution && (
              <p className={`text-sm mt-1 ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>
                You need to increase your monthly contribution by {formatCurrency(calculations.requiredMonthly - monthlyContribution)}
              </p>
            )}
          </div>
        )}

        {/* Milestones */}
        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.savingsGoal.savingsMilestones', 'Savings Milestones')}</h4>
          <div className="grid grid-cols-4 gap-4">
            {[25, 50, 75, 100].map((percent) => {
              const milestone = (goalAmount * percent) / 100;
              const reached = currentSavings >= milestone;
              return (
                <div
                  key={percent}
                  className={`p-3 rounded-lg text-center ${
                    reached
                      ? 'bg-green-500/20 border border-green-500/50'
                      : isDark
                      ? 'bg-gray-700'
                      : 'bg-gray-200'
                  }`}
                >
                  <p className={`text-lg font-bold ${reached ? 'text-green-500' : isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {percent}%
                  </p>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {formatCurrency(milestone)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <strong>{t('tools.savingsGoal.tip', 'Tip:')}</strong> Automate your savings by setting up automatic transfers on payday. Even small increases in your monthly contribution can significantly reduce the time to reach your goal.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SavingsGoalTool;
