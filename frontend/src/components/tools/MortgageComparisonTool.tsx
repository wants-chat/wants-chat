'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Calculator,
  Home,
  DollarSign,
  Percent,
  Calendar,
  Plus,
  Trash2,
  TrendingUp,
  BarChart3,
  ArrowRight,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Scale,
  PiggyBank,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import { useToolData } from '../../hooks/useToolData';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import type { ColumnConfig } from '../../lib/toolDataUtils';

interface MortgageComparisonToolProps {
  uiConfig?: UIConfig;
}

interface MortgageOption {
  id: string;
  name: string;
  loanAmount: string;
  interestRate: string;
  loanTermYears: string;
  points: string;
  fees: string;
  extraMonthlyPayment: string;
}

interface MortgageResult {
  id: string;
  name: string;
  loanAmount: number;
  interestRate: number;
  loanTermYears: number;
  points: number;
  fees: number;
  pointsCost: number;
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  totalCost: number;
  effectiveRate: number;
  extraMonthlyPayment: number;
  extraPaymentMonths: number;
  extraPaymentSavings: number;
  amortizationSchedule: AmortizationRow[];
}

interface AmortizationRow {
  month: number;
  year: number;
  payment: number;
  principal: number;
  interest: number;
  extraPayment: number;
  balance: number;
  totalPrincipal: number;
  totalInterest: number;
}

interface BreakEvenResult {
  optionId: string;
  monthsToBreakEven: number;
  yearsToBreakEven: number;
  monthlySavings: number;
}

type ViewMode = 'comparison' | 'refinance';

const defaultMortgage = (): MortgageOption => ({
  id: Date.now().toString(),
  name: '',
  loanAmount: '',
  interestRate: '',
  loanTermYears: '30',
  points: '0',
  fees: '0',
  extraMonthlyPayment: '0',
});

// Column configuration for export
const COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Option Name', type: 'string' },
  { key: 'loanAmount', header: 'Loan Amount', type: 'currency' },
  { key: 'interestRate', header: 'Interest Rate (%)', type: 'number' },
  { key: 'loanTermYears', header: 'Term (Years)', type: 'number' },
  { key: 'points', header: 'Points', type: 'number' },
  { key: 'fees', header: 'Fees', type: 'currency' },
  { key: 'pointsCost', header: 'Points Cost', type: 'currency' },
  { key: 'monthlyPayment', header: 'Monthly Payment', type: 'currency' },
  { key: 'totalPayment', header: 'Total Payment', type: 'currency' },
  { key: 'totalInterest', header: 'Total Interest', type: 'currency' },
  { key: 'totalCost', header: 'Total Cost', type: 'currency' },
  { key: 'effectiveRate', header: 'Effective Rate (%)', type: 'number' },
  { key: 'extraMonthlyPayment', header: 'Extra Monthly Payment', type: 'currency' },
  { key: 'extraPaymentMonths', header: 'Months Saved', type: 'number' },
  { key: 'extraPaymentSavings', header: 'Interest Savings', type: 'currency' },
];

// Default mortgages for initial state
const DEFAULT_MORTGAGES: MortgageOption[] = [
  { ...defaultMortgage(), id: '1', name: 'Option 1' },
  { ...defaultMortgage(), id: '2', name: 'Option 2' },
];

export const MortgageComparisonTool: React.FC<MortgageComparisonToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [viewMode, setViewMode] = useState<ViewMode>('comparison');

  // Use the useToolData hook for backend persistence
  const {
    data: mortgages,
    setData: setMortgages,
    addItem,
    updateItem,
    deleteItem,
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
  } = useToolData<MortgageOption>('mortgage-comparison', DEFAULT_MORTGAGES, COLUMNS);

  const [expandedAmortization, setExpandedAmortization] = useState<string | null>(null);
  const [showYearlyView, setShowYearlyView] = useState(true);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [currentMortgage, setCurrentMortgage] = useState<MortgageOption>({
    ...defaultMortgage(),
    id: '0',
    name: 'Current Mortgage',
  });
  const [remainingBalance, setRemainingBalance] = useState('');
  const [remainingYears, setRemainingYears] = useState('');

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params && !isLoading) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.amount || params.total) {
        // Update the first mortgage with the prefilled amount
        if (mortgages.length > 0) {
          updateItem(mortgages[0].id, {
            loanAmount: (params.amount || params.total)?.toString() || mortgages[0].loanAmount
          });
        }
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params, isLoading]);

  const addMortgage = () => {
    if (mortgages.length < 4) {
      const newMortgage: MortgageOption = {
        ...defaultMortgage(),
        id: Date.now().toString(),
        name: `Option ${mortgages.length + 1}`,
      };
      addItem(newMortgage);
    }
  };

  const removeMortgage = (id: string) => {
    if (mortgages.length > 2) {
      deleteItem(id);
    }
  };

  const updateMortgage = (id: string, field: keyof MortgageOption, value: string) => {
    updateItem(id, { [field]: value });
  };

  const calculateAmortization = (
    principal: number,
    monthlyRate: number,
    monthlyPayment: number,
    totalMonths: number,
    extraPayment: number = 0
  ): AmortizationRow[] => {
    const schedule: AmortizationRow[] = [];
    let balance = principal;
    let totalPrincipalPaid = 0;
    let totalInterestPaid = 0;

    for (let month = 1; month <= totalMonths && balance > 0; month++) {
      const interestPayment = balance * monthlyRate;
      let principalPayment = monthlyPayment - interestPayment;
      let extra = Math.min(extraPayment, balance - principalPayment);

      if (principalPayment + extra > balance) {
        principalPayment = balance;
        extra = 0;
      }

      balance -= principalPayment + extra;
      if (balance < 0) balance = 0;

      totalPrincipalPaid += principalPayment + extra;
      totalInterestPaid += interestPayment;

      schedule.push({
        month,
        year: Math.ceil(month / 12),
        payment: monthlyPayment,
        principal: principalPayment,
        interest: interestPayment,
        extraPayment: extra,
        balance,
        totalPrincipal: totalPrincipalPaid,
        totalInterest: totalInterestPaid,
      });
    }

    return schedule;
  };

  const results: MortgageResult[] = useMemo(() => {
    return mortgages
      .map((mortgage) => {
        const loanAmount = parseFloat(mortgage.loanAmount) || 0;
        const interestRate = parseFloat(mortgage.interestRate) || 0;
        const loanTermYears = parseInt(mortgage.loanTermYears) || 0;
        const points = parseFloat(mortgage.points) || 0;
        const fees = parseFloat(mortgage.fees) || 0;
        const extraMonthlyPayment = parseFloat(mortgage.extraMonthlyPayment) || 0;

        if (loanAmount <= 0 || interestRate < 0 || loanTermYears <= 0) {
          return null;
        }

        const monthlyRate = interestRate / 100 / 12;
        const totalMonths = loanTermYears * 12;
        const pointsCost = (points / 100) * loanAmount;

        let monthlyPayment: number;
        if (monthlyRate === 0) {
          monthlyPayment = loanAmount / totalMonths;
        } else {
          monthlyPayment =
            (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths))) /
            (Math.pow(1 + monthlyRate, totalMonths) - 1);
        }

        const amortizationSchedule = calculateAmortization(
          loanAmount,
          monthlyRate,
          monthlyPayment,
          totalMonths,
          extraMonthlyPayment
        );

        const actualMonths = amortizationSchedule.length;
        const totalInterest = amortizationSchedule[actualMonths - 1]?.totalInterest || 0;
        const totalPayment = loanAmount + totalInterest;
        const totalCost = totalPayment + pointsCost + fees;

        // Calculate effective rate including points
        const effectiveRate =
          points > 0 ? interestRate - points * 0.25 : interestRate;

        // Calculate savings from extra payments
        const regularAmortization = calculateAmortization(
          loanAmount,
          monthlyRate,
          monthlyPayment,
          totalMonths,
          0
        );
        const extraPaymentSavings =
          regularAmortization[regularAmortization.length - 1]?.totalInterest -
            totalInterest || 0;

        return {
          id: mortgage.id,
          name: mortgage.name,
          loanAmount,
          interestRate,
          loanTermYears,
          points,
          fees,
          pointsCost,
          monthlyPayment,
          totalPayment,
          totalInterest,
          totalCost,
          effectiveRate,
          extraMonthlyPayment,
          extraPaymentMonths: totalMonths - actualMonths,
          extraPaymentSavings,
          amortizationSchedule,
        };
      })
      .filter((r): r is MortgageResult => r !== null);
  }, [mortgages]);

  const breakEvenAnalysis: BreakEvenResult[] = useMemo(() => {
    if (results.length < 2) return [];

    const baseOption = results[0];
    return results.slice(1).map((option) => {
      const monthlySavings = baseOption.monthlyPayment - option.monthlyPayment;
      const upfrontDifference =
        option.pointsCost + option.fees - (baseOption.pointsCost + baseOption.fees);

      if (monthlySavings <= 0 || upfrontDifference <= 0) {
        return {
          optionId: option.id,
          monthsToBreakEven: 0,
          yearsToBreakEven: 0,
          monthlySavings,
        };
      }

      const monthsToBreakEven = Math.ceil(upfrontDifference / monthlySavings);
      return {
        optionId: option.id,
        monthsToBreakEven,
        yearsToBreakEven: monthsToBreakEven / 12,
        monthlySavings,
      };
    });
  }, [results]);

  const refinanceResult = useMemo(() => {
    if (viewMode !== 'refinance') return null;

    const balance = parseFloat(remainingBalance) || 0;
    const years = parseFloat(remainingYears) || 0;
    const currentRate = parseFloat(currentMortgage.interestRate) || 0;

    if (balance <= 0 || years <= 0 || currentRate <= 0) return null;

    const currentMonthlyRate = currentRate / 100 / 12;
    const currentMonths = years * 12;

    let currentMonthlyPayment: number;
    if (currentMonthlyRate === 0) {
      currentMonthlyPayment = balance / currentMonths;
    } else {
      currentMonthlyPayment =
        (balance * (currentMonthlyRate * Math.pow(1 + currentMonthlyRate, currentMonths))) /
        (Math.pow(1 + currentMonthlyRate, currentMonths) - 1);
    }

    const currentTotalPayment = currentMonthlyPayment * currentMonths;
    const currentTotalInterest = currentTotalPayment - balance;

    return {
      currentMonthlyPayment,
      currentTotalPayment,
      currentTotalInterest,
      remainingBalance: balance,
      remainingYears: years,
    };
  }, [viewMode, remainingBalance, remainingYears, currentMortgage.interestRate]);

  const bestOption = useMemo(() => {
    if (results.length === 0) return null;
    return results.reduce((best, current) =>
      current.totalCost < best.totalCost ? current : best
    );
  }, [results]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatCurrencyDetailed = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const reset = () => {
    setMortgages([
      { ...defaultMortgage(), id: '1', name: 'Option 1' },
      { ...defaultMortgage(), id: '2', name: 'Option 2' },
    ]);
    setExpandedAmortization(null);
    setCurrentMortgage({ ...defaultMortgage(), id: '0', name: 'Current Mortgage' });
    setRemainingBalance('');
    setRemainingYears('');
  };

  const getYearlyAmortization = (schedule: AmortizationRow[]) => {
    const yearly: AmortizationRow[] = [];
    let currentYear = 1;
    let yearlyPrincipal = 0;
    let yearlyInterest = 0;
    let yearlyExtra = 0;

    schedule.forEach((row, index) => {
      yearlyPrincipal += row.principal;
      yearlyInterest += row.interest;
      yearlyExtra += row.extraPayment;

      if (row.year > currentYear || index === schedule.length - 1) {
        yearly.push({
          ...row,
          month: currentYear * 12,
          year: currentYear,
          principal: yearlyPrincipal,
          interest: yearlyInterest,
          extraPayment: yearlyExtra,
          balance: schedule[Math.min(currentYear * 12 - 1, schedule.length - 1)]?.balance || 0,
        });
        currentYear = row.year;
        yearlyPrincipal = row.principal;
        yearlyInterest = row.interest;
        yearlyExtra = row.extraPayment;
      }
    });

    return yearly;
  };

  const inputClasses = `w-full px-4 py-3 rounded-lg border ${
    theme === 'dark'
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`;

  const labelClasses = `block text-sm font-medium mb-2 ${
    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
  }`;

  // Loading state
  if (isLoading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="flex items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#0D9488]" />
          <span className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.mortgageComparison.loadingMortgageData', 'Loading mortgage data...')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.mortgageComparison.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <Scale className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.mortgageComparison.mortgageComparisonTool', 'Mortgage Comparison Tool')}
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.mortgageComparison.compareUpTo4Mortgage', 'Compare up to 4 mortgage options side by side')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <WidgetEmbedButton toolSlug="mortgage-comparison" toolName="Mortgage Comparison" />

              <SyncStatus
                isSynced={isSynced}
                isSaving={isSaving}
                lastSaved={lastSaved}
                syncError={syncError}
                onForceSync={forceSync}
                theme={isDark ? 'dark' : 'light'}
                size="sm"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('comparison')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    viewMode === 'comparison'
                      ? 'bg-[#0D9488] text-white'
                      : theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {t('tools.mortgageComparison.comparison', 'Comparison')}
                </button>
                <button
                  onClick={() => setViewMode('refinance')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    viewMode === 'refinance'
                      ? 'bg-[#0D9488] text-white'
                      : theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {t('tools.mortgageComparison.refinance', 'Refinance')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Refinance Current Mortgage Section */}
        {viewMode === 'refinance' && (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
            <h2 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.mortgageComparison.currentMortgageDetails', 'Current Mortgage Details')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={labelClasses}>{t('tools.mortgageComparison.remainingBalance', 'Remaining Balance ($)')}</label>
                <div className="relative">
                  <DollarSign
                    className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  />
                  <input
                    type="number"
                    value={remainingBalance}
                    onChange={(e) => setRemainingBalance(e.target.value)}
                    placeholder={t('tools.mortgageComparison.enterRemainingBalance', 'Enter remaining balance')}
                    className={`${inputClasses} pl-11`}
                  />
                </div>
              </div>
              <div>
                <label className={labelClasses}>{t('tools.mortgageComparison.currentInterestRate', 'Current Interest Rate (%)')}</label>
                <div className="relative">
                  <Percent
                    className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  />
                  <input
                    type="number"
                    value={currentMortgage.interestRate}
                    onChange={(e) =>
                      setCurrentMortgage({ ...currentMortgage, interestRate: e.target.value })
                    }
                    placeholder={t('tools.mortgageComparison.enterRate', 'Enter rate')}
                    step="0.01"
                    className={`${inputClasses} pl-11`}
                  />
                </div>
              </div>
              <div>
                <label className={labelClasses}>{t('tools.mortgageComparison.remainingYears', 'Remaining Years')}</label>
                <div className="relative">
                  <Calendar
                    className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  />
                  <input
                    type="number"
                    value={remainingYears}
                    onChange={(e) => setRemainingYears(e.target.value)}
                    placeholder={t('tools.mortgageComparison.enterYears', 'Enter years')}
                    className={`${inputClasses} pl-11`}
                  />
                </div>
              </div>
            </div>
            {refinanceResult && (
              <div className={`mt-4 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('tools.mortgageComparison.currentMonthlyPayment', 'Current Monthly Payment')}
                    </p>
                    <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {formatCurrencyDetailed(refinanceResult.currentMonthlyPayment)}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('tools.mortgageComparison.remainingInterest', 'Remaining Interest')}
                    </p>
                    <p className="text-xl font-bold text-orange-500">
                      {formatCurrency(refinanceResult.currentTotalInterest)}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('tools.mortgageComparison.totalRemaining', 'Total Remaining')}
                    </p>
                    <p className="text-xl font-bold text-green-500">
                      {formatCurrency(refinanceResult.currentTotalPayment)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Mortgage Options Input */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          {mortgages.map((mortgage, index) => (
            <div
              key={mortgage.id}
              className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4 ${
                bestOption?.id === mortgage.id ? 'ring-2 ring-green-500' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <input
                  type="text"
                  value={mortgage.name}
                  onChange={(e) => updateMortgage(mortgage.id, 'name', e.target.value)}
                  className={`text-lg font-semibold bg-transparent border-none outline-none ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}
                  placeholder={`Option ${index + 1}`}
                />
                {mortgages.length > 2 && (
                  <button
                    onClick={() => removeMortgage(mortgage.id)}
                    className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <label className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.mortgageComparison.loanAmount', 'Loan Amount ($)')}
                  </label>
                  <div className="relative">
                    <DollarSign
                      className={`absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}
                    />
                    <input
                      type="number"
                      value={mortgage.loanAmount}
                      onChange={(e) => updateMortgage(mortgage.id, 'loanAmount', e.target.value)}
                      placeholder="300,000"
                      className={`w-full pl-8 pr-3 py-2 text-sm rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.mortgageComparison.interestRate', 'Interest Rate (%)')}
                  </label>
                  <input
                    type="number"
                    value={mortgage.interestRate}
                    onChange={(e) => updateMortgage(mortgage.id, 'interestRate', e.target.value)}
                    placeholder="6.5"
                    step="0.01"
                    className={`w-full px-3 py-2 text-sm rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>

                <div>
                  <label className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.mortgageComparison.loanTermYears', 'Loan Term (Years)')}
                  </label>
                  <div className="grid grid-cols-4 gap-1">
                    {[15, 20, 25, 30].map((years) => (
                      <button
                        key={years}
                        onClick={() => updateMortgage(mortgage.id, 'loanTermYears', years.toString())}
                        className={`py-1 px-2 text-xs rounded font-medium transition-colors ${
                          mortgage.loanTermYears === years.toString()
                            ? 'bg-[#0D9488] text-white'
                            : theme === 'dark'
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {years}Y
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('tools.mortgageComparison.points', 'Points')}
                    </label>
                    <input
                      type="number"
                      value={mortgage.points}
                      onChange={(e) => updateMortgage(mortgage.id, 'points', e.target.value)}
                      placeholder="0"
                      step="0.125"
                      className={`w-full px-3 py-2 text-sm rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                  <div>
                    <label className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('tools.mortgageComparison.fees', 'Fees ($)')}
                    </label>
                    <input
                      type="number"
                      value={mortgage.fees}
                      onChange={(e) => updateMortgage(mortgage.id, 'fees', e.target.value)}
                      placeholder="0"
                      className={`w-full px-3 py-2 text-sm rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.mortgageComparison.extraMonthlyPayment', 'Extra Monthly Payment ($)')}
                  </label>
                  <div className="relative">
                    <PiggyBank
                      className={`absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}
                    />
                    <input
                      type="number"
                      value={mortgage.extraMonthlyPayment}
                      onChange={(e) =>
                        updateMortgage(mortgage.id, 'extraMonthlyPayment', e.target.value)
                      }
                      placeholder="0"
                      className={`w-full pl-8 pr-3 py-2 text-sm rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}

          {mortgages.length < 4 && (
            <button
              onClick={addMortgage}
              className={`flex flex-col items-center justify-center min-h-[300px] rounded-lg border-2 border-dashed transition-colors ${
                theme === 'dark'
                  ? 'border-gray-700 hover:border-gray-600 text-gray-400 hover:text-gray-300'
                  : 'border-gray-300 hover:border-gray-400 text-gray-500 hover:text-gray-600'
              }`}
            >
              <Plus className="w-8 h-8 mb-2" />
              <span className="font-medium">{t('tools.mortgageComparison.addOption', 'Add Option')}</span>
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={reset}
            className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              theme === 'dark'
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <RefreshCw className="w-5 h-5" />
            {t('tools.mortgageComparison.resetAll', 'Reset All')}
          </button>
          {results.length > 0 && (
            <ExportDropdown
              onExportCSV={() => exportCSV({ filename: 'mortgage-comparison' })}
              onExportExcel={() => exportExcel({ filename: 'mortgage-comparison' })}
              onExportJSON={() => exportJSON({ filename: 'mortgage-comparison' })}
              onExportPDF={() => exportPDF({
                filename: 'mortgage-comparison',
                title: 'Mortgage Comparison Report',
                subtitle: `Comparing ${results.length} mortgage options`,
                orientation: 'landscape',
              })}
              onPrint={() => print('Mortgage Comparison Report')}
              onCopyToClipboard={() => copyToClipboard('tab')}
              onImportCSV={async (file) => { await importCSV(file); }}
              onImportJSON={async (file) => { await importJSON(file); }}
              theme={isDark ? 'dark' : 'light'}
            />
          )}
        </div>

        {/* Results Comparison */}
        {results.length > 0 && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
              {results.map((result) => (
                <div
                  key={result.id}
                  className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4 ${
                    bestOption?.id === result.id ? 'ring-2 ring-green-500' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {result.name}
                    </h3>
                    {bestOption?.id === result.id && (
                      <span className="px-2 py-1 text-xs font-medium bg-green-500 text-white rounded">
                        {t('tools.mortgageComparison.best', 'Best')}
                      </span>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="text-center p-3 rounded-lg bg-[#0D9488]/10">
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {t('tools.mortgageComparison.monthlyPayment', 'Monthly Payment')}
                      </p>
                      <p className="text-2xl font-bold text-[#0D9488]">
                        {formatCurrencyDetailed(result.monthlyPayment)}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {t('tools.mortgageComparison.totalInterest', 'Total Interest')}
                        </p>
                        <p className="text-sm font-semibold text-orange-500">
                          {formatCurrency(result.totalInterest)}
                        </p>
                      </div>
                      <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {t('tools.mortgageComparison.totalCost', 'Total Cost')}
                        </p>
                        <p className="text-sm font-semibold text-green-500">
                          {formatCurrency(result.totalCost)}
                        </p>
                      </div>
                    </div>

                    {result.pointsCost > 0 && (
                      <div className={`p-2 rounded-lg text-center ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {t('tools.mortgageComparison.pointsCost', 'Points Cost')}
                        </p>
                        <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {formatCurrency(result.pointsCost)}
                        </p>
                      </div>
                    )}

                    {result.extraMonthlyPayment > 0 && (
                      <div className="p-2 rounded-lg bg-purple-500/10 text-center">
                        <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {t('tools.mortgageComparison.extraPaymentSavings', 'Extra Payment Savings')}
                        </p>
                        <p className="text-sm font-semibold text-purple-500">
                          {formatCurrency(result.extraPaymentSavings)}
                        </p>
                        <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {result.extraPaymentMonths} months early
                        </p>
                      </div>
                    )}

                    <button
                      onClick={() =>
                        setExpandedAmortization(
                          expandedAmortization === result.id ? null : result.id
                        )
                      }
                      className={`w-full py-2 px-3 text-sm rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                        theme === 'dark'
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {expandedAmortization === result.id ? (
                        <>
                          <ChevronUp className="w-4 h-4" />
                          {t('tools.mortgageComparison.hideSchedule', 'Hide Schedule')}
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4" />
                          {t('tools.mortgageComparison.viewSchedule', 'View Schedule')}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Break-Even Analysis */}
            {breakEvenAnalysis.length > 0 && breakEvenAnalysis.some((b) => b.monthsToBreakEven > 0) && (
              <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
                <h2 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  <TrendingUp className="w-5 h-5 text-[#0D9488]" />
                  {t('tools.mortgageComparison.breakEvenAnalysisForPoints', 'Break-Even Analysis for Points')}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {breakEvenAnalysis
                    .filter((b) => b.monthsToBreakEven > 0)
                    .map((analysis) => {
                      const option = results.find((r) => r.id === analysis.optionId);
                      return (
                        <div
                          key={analysis.optionId}
                          className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}
                        >
                          <h3 className={`font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {option?.name} vs {results[0]?.name}
                          </h3>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                                {t('tools.mortgageComparison.breakEven', 'Break-even:')}
                              </span>
                              <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {analysis.monthsToBreakEven} months ({analysis.yearsToBreakEven.toFixed(1)} years)
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                                {t('tools.mortgageComparison.monthlySavings', 'Monthly Savings:')}
                              </span>
                              <span className="font-semibold text-green-500">
                                {formatCurrencyDetailed(analysis.monthlySavings)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Refinance Comparison */}
            {viewMode === 'refinance' && refinanceResult && results.length > 0 && (
              <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
                <h2 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  <RefreshCw className="w-5 h-5 text-[#0D9488]" />
                  {t('tools.mortgageComparison.refinanceComparison', 'Refinance Comparison')}
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                        <th className={`py-3 px-4 text-left ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          {t('tools.mortgageComparison.metric', 'Metric')}
                        </th>
                        <th className={`py-3 px-4 text-right ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          {t('tools.mortgageComparison.currentMortgage', 'Current Mortgage')}
                        </th>
                        {results.map((result) => (
                          <th
                            key={result.id}
                            className={`py-3 px-4 text-right ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
                          >
                            {result.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                        <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          {t('tools.mortgageComparison.monthlyPayment2', 'Monthly Payment')}
                        </td>
                        <td className={`py-3 px-4 text-right font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {formatCurrencyDetailed(refinanceResult.currentMonthlyPayment)}
                        </td>
                        {results.map((result) => {
                          const diff = result.monthlyPayment - refinanceResult.currentMonthlyPayment;
                          return (
                            <td key={result.id} className="py-3 px-4 text-right">
                              <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {formatCurrencyDetailed(result.monthlyPayment)}
                              </span>
                              <br />
                              <span className={`text-sm ${diff < 0 ? 'text-green-500' : 'text-red-500'}`}>
                                ({diff < 0 ? '' : '+'}
                                {formatCurrencyDetailed(diff)})
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                      <tr className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                        <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          {t('tools.mortgageComparison.totalInterest2', 'Total Interest')}
                        </td>
                        <td className={`py-3 px-4 text-right font-semibold text-orange-500`}>
                          {formatCurrency(refinanceResult.currentTotalInterest)}
                        </td>
                        {results.map((result) => {
                          const diff = result.totalInterest - refinanceResult.currentTotalInterest;
                          return (
                            <td key={result.id} className="py-3 px-4 text-right">
                              <span className="font-semibold text-orange-500">
                                {formatCurrency(result.totalInterest)}
                              </span>
                              <br />
                              <span className={`text-sm ${diff < 0 ? 'text-green-500' : 'text-red-500'}`}>
                                ({diff < 0 ? '' : '+'}
                                {formatCurrency(diff)})
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                      <tr>
                        <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          {t('tools.mortgageComparison.totalCost2', 'Total Cost')}
                        </td>
                        <td className={`py-3 px-4 text-right font-semibold text-green-500`}>
                          {formatCurrency(refinanceResult.currentTotalPayment)}
                        </td>
                        {results.map((result) => {
                          const totalWithFees = result.totalCost;
                          const diff = totalWithFees - refinanceResult.currentTotalPayment;
                          return (
                            <td key={result.id} className="py-3 px-4 text-right">
                              <span className="font-semibold text-green-500">
                                {formatCurrency(totalWithFees)}
                              </span>
                              <br />
                              <span className={`text-sm ${diff < 0 ? 'text-green-500' : 'text-red-500'}`}>
                                ({diff < 0 ? '' : '+'}
                                {formatCurrency(diff)})
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Visual Chart - Principal vs Interest */}
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
              <h2 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                <BarChart3 className="w-5 h-5 text-[#0D9488]" />
                {t('tools.mortgageComparison.principalVsInterestOverTime', 'Principal vs Interest Over Time')}
              </h2>
              <div className="space-y-6">
                {results.map((result) => (
                  <div key={result.id}>
                    <h3 className={`font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {result.name}
                    </h3>
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {t('tools.mortgageComparison.principal', 'Principal')}
                          </span>
                          <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            {formatCurrency(result.loanAmount)} (
                            {((result.loanAmount / result.totalCost) * 100).toFixed(1)}%)
                          </span>
                        </div>
                        <div className={`w-full rounded-full h-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                          <div
                            className="bg-green-500 h-4 rounded-full transition-all duration-500"
                            style={{ width: `${(result.loanAmount / result.totalCost) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {t('tools.mortgageComparison.interest', 'Interest')}
                          </span>
                          <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            {formatCurrency(result.totalInterest)} (
                            {((result.totalInterest / result.totalCost) * 100).toFixed(1)}%)
                          </span>
                        </div>
                        <div className={`w-full rounded-full h-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                          <div
                            className="bg-orange-500 h-4 rounded-full transition-all duration-500"
                            style={{ width: `${(result.totalInterest / result.totalCost) * 100}%` }}
                          />
                        </div>
                      </div>
                      {(result.pointsCost > 0 || result.fees > 0) && (
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {t('tools.mortgageComparison.pointsFees', 'Points & Fees')}
                            </span>
                            <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                              {formatCurrency(result.pointsCost + result.fees)} (
                              {(((result.pointsCost + result.fees) / result.totalCost) * 100).toFixed(1)}%)
                            </span>
                          </div>
                          <div className={`w-full rounded-full h-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                            <div
                              className="bg-purple-500 h-4 rounded-full transition-all duration-500"
                              style={{
                                width: `${((result.pointsCost + result.fees) / result.totalCost) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Amortization Schedule */}
            {expandedAmortization && (
              <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Amortization Schedule - {results.find((r) => r.id === expandedAmortization)?.name}
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowYearlyView(false)}
                      className={`px-3 py-1 text-sm rounded-lg font-medium transition-colors ${
                        !showYearlyView
                          ? 'bg-[#0D9488] text-white'
                          : theme === 'dark'
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {t('tools.mortgageComparison.monthly', 'Monthly')}
                    </button>
                    <button
                      onClick={() => setShowYearlyView(true)}
                      className={`px-3 py-1 text-sm rounded-lg font-medium transition-colors ${
                        showYearlyView
                          ? 'bg-[#0D9488] text-white'
                          : theme === 'dark'
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {t('tools.mortgageComparison.yearly', 'Yearly')}
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto max-h-96">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0">
                      <tr className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <th className={`py-2 px-3 text-left ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          {showYearlyView ? t('tools.mortgageComparison.year', 'Year') : t('tools.mortgageComparison.month', 'Month')}
                        </th>
                        <th className={`py-2 px-3 text-right ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          {t('tools.mortgageComparison.principal2', 'Principal')}
                        </th>
                        <th className={`py-2 px-3 text-right ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          {t('tools.mortgageComparison.interest2', 'Interest')}
                        </th>
                        {results.find((r) => r.id === expandedAmortization)?.extraMonthlyPayment! > 0 && (
                          <th className={`py-2 px-3 text-right ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            {t('tools.mortgageComparison.extra', 'Extra')}
                          </th>
                        )}
                        <th className={`py-2 px-3 text-right ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          {t('tools.mortgageComparison.balance', 'Balance')}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const result = results.find((r) => r.id === expandedAmortization);
                        if (!result) return null;
                        const schedule = showYearlyView
                          ? getYearlyAmortization(result.amortizationSchedule)
                          : result.amortizationSchedule;
                        return schedule.map((row, index) => (
                          <tr
                            key={index}
                            className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} ${
                              !showYearlyView && row.month % 12 === 0
                                ? theme === 'dark'
                                  ? 'bg-gray-700/50'
                                  : 'bg-gray-100'
                                : ''
                            }`}
                          >
                            <td className={`py-2 px-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                              {showYearlyView ? `Year ${row.year}` : row.month}
                            </td>
                            <td className={`py-2 px-3 text-right ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                              {formatCurrencyDetailed(row.principal)}
                            </td>
                            <td className={`py-2 px-3 text-right ${theme === 'dark' ? 'text-orange-400' : 'text-orange-600'}`}>
                              {formatCurrencyDetailed(row.interest)}
                            </td>
                            {result.extraMonthlyPayment > 0 && (
                              <td className={`py-2 px-3 text-right ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`}>
                                {formatCurrencyDetailed(row.extraPayment)}
                              </td>
                            )}
                            <td className={`py-2 px-3 text-right font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {formatCurrency(row.balance)}
                            </td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {/* Info Section */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
          <h3 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.mortgageComparison.aboutThisTool', 'About This Tool')}
          </h3>
          <div className={`space-y-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            <p>
              <strong>{t('tools.mortgageComparison.compareMortgages', 'Compare Mortgages:')}</strong> Enter details for up to 4 different mortgage options to see side-by-side comparisons of monthly payments, total interest, and overall costs.
            </p>
            <p>
              <strong>{t('tools.mortgageComparison.pointsAnalysis', 'Points Analysis:')}</strong> Mortgage points (also called discount points) are fees paid directly to the lender at closing in exchange for a reduced interest rate. Each point typically costs 1% of the loan amount.
            </p>
            <p>
              <strong>{t('tools.mortgageComparison.breakEvenAnalysis', 'Break-Even Analysis:')}</strong> Shows how long it takes for the monthly savings from a lower rate to offset the upfront cost of points.
            </p>
            <p>
              <strong>{t('tools.mortgageComparison.extraPayments', 'Extra Payments:')}</strong> See how making additional monthly payments can reduce your loan term and save on interest.
            </p>
            <p>
              <strong>{t('tools.mortgageComparison.refinanceMode', 'Refinance Mode:')}</strong> Compare your current mortgage against potential refinancing options to see if refinancing makes financial sense.
            </p>
            <p className="text-xs mt-2 italic">
              {t('tools.mortgageComparison.noteThisCalculatorProvidesEstimates', 'Note: This calculator provides estimates only and does not include property taxes, homeowner\'s insurance, PMI, or HOA fees.')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MortgageComparisonTool;
