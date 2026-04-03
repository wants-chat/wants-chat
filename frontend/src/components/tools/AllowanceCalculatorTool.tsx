import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Wallet, Calculator, TrendingUp, Star, DollarSign, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
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

type CalculationMethod = 'per-age' | 'flat-rate' | 'chore-based';
type Frequency = 'weekly' | 'bi-weekly' | 'monthly';

interface ChoreItem {
  name: string;
  value: number;
  completed: boolean;
}

const DEFAULT_CHORES: ChoreItem[] = [
  { name: 'Make bed daily', value: 2, completed: false },
  { name: 'Clean room', value: 5, completed: false },
  { name: 'Do dishes', value: 3, completed: false },
  { name: 'Take out trash', value: 2, completed: false },
  { name: 'Walk the dog', value: 4, completed: false },
  { name: 'Mow lawn', value: 10, completed: false },
  { name: 'Vacuum house', value: 5, completed: false },
  { name: 'Laundry', value: 5, completed: false },
];

const NATIONAL_AVERAGES: Record<string, number> = {
  '4-6': 4.5,
  '7-9': 7.5,
  '10-12': 10.5,
  '13-15': 15,
  '16-18': 20,
};

const AGE_SUGGESTIONS: Record<string, string[]> = {
  '4-6': [
    'Focus on simple chores like picking up toys',
    'Use visual charts to track progress',
    'Introduce the concept of saving with a piggy bank',
    'Keep allowance simple and consistent',
  ],
  '7-9': [
    'Introduce three jars: Save, Spend, Share',
    'Start teaching about short-term savings goals',
    'Consider matching savings contributions',
    'Allow small purchase decisions',
  ],
  '10-12': [
    'Open a savings account with parental oversight',
    'Teach comparison shopping',
    'Introduce budgeting basics',
    'Discuss wants vs. needs',
  ],
  '13-15': [
    'Encourage part-time work or side jobs',
    'Teach about compound interest',
    'Introduce investment concepts',
    'Allow more financial independence',
  ],
  '16-18': [
    'Open a checking account',
    'Teach about credit and debt',
    'Discuss college/career financial planning',
    'Practice real-world budgeting',
  ],
};

interface AllowanceCalculatorToolProps {
  uiConfig?: UIConfig;
}

// Define columns for export functionality
const COLUMNS: ColumnConfig[] = [
  { key: 'field', header: 'Field', type: 'string' },
  { key: 'value', header: 'Value', type: 'string' },
];

// Helper type for export data
interface ExportData {
  field: string;
  value: string;
}

export const AllowanceCalculatorTool: React.FC<AllowanceCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [childAge, setChildAge] = useState<number>(10);
  const [calculationMethod, setCalculationMethod] = useState<CalculationMethod>('per-age');
  const [flatRate, setFlatRate] = useState<number>(10);
  const [frequency, setFrequency] = useState<Frequency>('weekly');
  const [chores, setChores] = useState<ChoreItem[]>(DEFAULT_CHORES);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Apply prefill data from uiConfig.params
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      let hasPrefill = false;

      if (params.numbers && params.numbers.length >= 1) {
        setChildAge(params.numbers[0]);
        hasPrefill = true;
      }
      if (params.amount) {
        setFlatRate(params.amount);
        setCalculationMethod('flat-rate');
        hasPrefill = true;
      }

      setIsPrefilled(hasPrefill);
    }
  }, [uiConfig?.params]);

  const getAgeGroup = (age: number): string => {
    if (age >= 4 && age <= 6) return '4-6';
    if (age >= 7 && age <= 9) return '7-9';
    if (age >= 10 && age <= 12) return '10-12';
    if (age >= 13 && age <= 15) return '13-15';
    return '16-18';
  };

  const weeklyAllowance = useMemo(() => {
    switch (calculationMethod) {
      case 'per-age':
        return childAge;
      case 'flat-rate':
        if (frequency === 'weekly') return flatRate;
        if (frequency === 'bi-weekly') return flatRate / 2;
        return flatRate / 4.33;
      case 'chore-based':
        return chores.filter((c) => c.completed).reduce((sum, c) => sum + c.value, 0);
      default:
        return 0;
    }
  }, [calculationMethod, childAge, flatRate, frequency, chores]);

  const displayAllowance = useMemo(() => {
    switch (frequency) {
      case 'weekly':
        return weeklyAllowance;
      case 'bi-weekly':
        return weeklyAllowance * 2;
      case 'monthly':
        return weeklyAllowance * 4.33;
      default:
        return weeklyAllowance;
    }
  }, [weeklyAllowance, frequency]);

  const annualProjection = weeklyAllowance * 52;

  const savingsBreakdown = useMemo(() => {
    const amount = displayAllowance;
    return {
      save: amount * 0.3,
      spend: amount * 0.3,
      share: amount * 0.2,
      invest: amount * 0.2,
    };
  }, [displayAllowance]);

  const ageGroup = getAgeGroup(childAge);
  const nationalAverage = NATIONAL_AVERAGES[ageGroup] || 10;
  const suggestions = AGE_SUGGESTIONS[ageGroup] || AGE_SUGGESTIONS['10-12'];

  const toggleChore = (index: number) => {
    setChores((prev) =>
      prev.map((chore, i) => (i === index ? { ...chore, completed: !chore.completed } : chore))
    );
  };

  const frequencyLabel = frequency === 'weekly' ? 'week' : frequency === 'bi-weekly' ? '2 weeks' : 'month';

  // Prepare export data
  const exportData: ExportData[] = [
    { field: "Child's Age", value: String(childAge) },
    { field: 'Calculation Method', value: calculationMethod },
    { field: 'Payment Frequency', value: frequency },
    calculationMethod === 'flat-rate' ? { field: 'Flat Rate', value: `$${flatRate.toFixed(2)}` } : null,
    { field: 'Calculated Allowance', value: `$${displayAllowance.toFixed(2)} per ${frequencyLabel}` },
    { field: 'Annual Projection', value: `$${annualProjection.toFixed(2)}` },
    { field: 'National Average (Ages ' + ageGroup + ')', value: `$${nationalAverage.toFixed(2)}/week` },
    { field: 'Recommended Save (30%)', value: `$${savingsBreakdown.save.toFixed(2)}` },
    { field: 'Recommended Spend (30%)', value: `$${savingsBreakdown.spend.toFixed(2)}` },
    { field: 'Recommended Share (20%)', value: `$${savingsBreakdown.share.toFixed(2)}` },
    { field: 'Recommended Invest (20%)', value: `$${savingsBreakdown.invest.toFixed(2)}` },
  ].filter((item): item is ExportData => item !== null);

  // Export handlers
  const handleExportCSV = () => {
    exportToCSV(exportData, COLUMNS, { filename: 'allowance-calculator' });
  };

  const handleExportExcel = () => {
    exportToExcel(exportData, COLUMNS, { filename: 'allowance-calculator' });
  };

  const handleExportJSON = () => {
    exportToJSON(exportData, { filename: 'allowance-calculator' });
  };

  const handleExportPDF = async () => {
    await exportToPDF(exportData, COLUMNS, {
      filename: 'allowance-calculator',
      title: 'Allowance Calculator Report',
      subtitle: `Age ${childAge} - ${calculationMethod.replace('-', ' ')} method`,
    });
  };

  const handlePrint = () => {
    printData(exportData, COLUMNS, { title: 'Allowance Calculator Report' });
  };

  const handleCopyToClipboard = async () => {
    return await copyUtil(exportData, COLUMNS, 'tab');
  };

  return (
    <div
      className={`min-h-screen p-4 md:p-6 ${
        isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
      }`}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div
              className={`p-3 rounded-xl ${
                isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600'
              }`}
            >
              <Wallet className="w-8 h-8" />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.allowanceCalculator.allowanceCalculator', 'Allowance Calculator')}
              </h1>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.allowanceCalculator.calculateTheRightAllowanceFor', 'Calculate the right allowance for your child')}
              </p>
            </div>
          </div>
          <ExportDropdown
            onExportCSV={handleExportCSV}
            onExportExcel={handleExportExcel}
            onExportJSON={handleExportJSON}
            onExportPDF={handleExportPDF}
            onPrint={handlePrint}
            onCopyToClipboard={handleCopyToClipboard}
            showImport={false}
            theme={isDark ? 'dark' : 'light'}
          />
        </div>

        {/* Prefill indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-6 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.allowanceCalculator.valuesLoadedFromYourConversation', 'Values loaded from your conversation')}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="space-y-6">
            {/* Child's Age */}
            <div
              className={`p-5 rounded-xl ${
                isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
              }`}
            >
              <label
                className={`block text-sm font-medium mb-3 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                {t('tools.allowanceCalculator.childSAge', 'Child\'s Age')}
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="4"
                  max="18"
                  value={childAge}
                  onChange={(e) => setChildAge(parseInt(e.target.value))}
                  className="flex-1 h-2 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  style={{
                    background: isDark
                      ? `linear-gradient(to right, #10b981 0%, #10b981 ${((childAge - 4) / 14) * 100}%, #374151 ${((childAge - 4) / 14) * 100}%, #374151 100%)`
                      : `linear-gradient(to right, #10b981 0%, #10b981 ${((childAge - 4) / 14) * 100}%, #d1d5db ${((childAge - 4) / 14) * 100}%, #d1d5db 100%)`,
                  }}
                />
                <span
                  className={`text-2xl font-bold min-w-[3rem] text-center ${
                    isDark ? 'text-emerald-400' : 'text-emerald-600'
                  }`}
                >
                  {childAge}
                </span>
              </div>
            </div>

            {/* Calculation Method */}
            <div
              className={`p-5 rounded-xl ${
                isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
              }`}
            >
              <label
                className={`block text-sm font-medium mb-3 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                {t('tools.allowanceCalculator.calculationMethod', 'Calculation Method')}
              </label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { value: 'per-age', label: 'Per Age', desc: '$1 per year of age/week' },
                  { value: 'flat-rate', label: 'Flat Rate', desc: 'Fixed amount' },
                  { value: 'chore-based', label: 'Chore-Based', desc: 'Per completed chore' },
                ].map((method) => (
                  <button
                    key={method.value}
                    onClick={() => setCalculationMethod(method.value as CalculationMethod)}
                    className={`p-3 rounded-lg text-left transition-all ${
                      calculationMethod === method.value
                        ? isDark
                          ? 'bg-emerald-500/20 border-2 border-emerald-500'
                          : 'bg-emerald-50 border-2 border-emerald-500'
                        : isDark
                          ? 'bg-gray-700 border-2 border-transparent hover:bg-gray-600'
                          : 'bg-gray-100 border-2 border-transparent hover:bg-gray-200'
                    }`}
                  >
                    <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {method.label}
                    </div>
                    <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {method.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Flat Rate Input */}
            {calculationMethod === 'flat-rate' && (
              <div
                className={`p-5 rounded-xl ${
                  isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
                }`}
              >
                <label
                  className={`block text-sm font-medium mb-3 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}
                >
                  {t('tools.allowanceCalculator.flatRateAmount', 'Flat Rate Amount')}
                </label>
                <div className="relative">
                  <DollarSign
                    className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                      isDark ? 'text-gray-500' : 'text-gray-400'
                    }`}
                  />
                  <input
                    type="number"
                    min="1"
                    max="200"
                    value={flatRate}
                    onChange={(e) => setFlatRate(parseFloat(e.target.value) || 0)}
                    className={`w-full pl-10 pr-4 py-3 rounded-lg text-lg font-semibold ${
                      isDark
                        ? 'bg-gray-700 border border-gray-600 text-white'
                        : 'bg-gray-50 border border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>
            )}

            {/* Chore Checklist */}
            {calculationMethod === 'chore-based' && (
              <div
                className={`p-5 rounded-xl ${
                  isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
                }`}
              >
                <label
                  className={`block text-sm font-medium mb-3 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}
                >
                  {t('tools.allowanceCalculator.weeklyChores', 'Weekly Chores')}
                </label>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {chores.map((chore, index) => (
                    <button
                      key={index}
                      onClick={() => toggleChore(index)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                        chore.completed
                          ? isDark
                            ? 'bg-emerald-500/20 border border-emerald-500/50'
                            : 'bg-emerald-50 border border-emerald-300'
                          : isDark
                            ? 'bg-gray-700 border border-gray-600 hover:bg-gray-600'
                            : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center ${
                            chore.completed
                              ? 'bg-emerald-500 text-white'
                              : isDark
                                ? 'bg-gray-600 border-2 border-gray-500'
                                : 'bg-white border-2 border-gray-300'
                          }`}
                        >
                          {chore.completed && <Star className="w-3 h-3" />}
                        </div>
                        <span
                          className={`${
                            chore.completed
                              ? isDark
                                ? 'text-emerald-400'
                                : 'text-emerald-700'
                              : isDark
                                ? 'text-gray-300'
                                : 'text-gray-700'
                          }`}
                        >
                          {chore.name}
                        </span>
                      </div>
                      <span
                        className={`font-semibold ${
                          isDark ? 'text-emerald-400' : 'text-emerald-600'
                        }`}
                      >
                        ${chore.value}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Frequency */}
            <div
              className={`p-5 rounded-xl ${
                isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
              }`}
            >
              <label
                className={`block text-sm font-medium mb-3 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                {t('tools.allowanceCalculator.paymentFrequency', 'Payment Frequency')}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'weekly', label: 'Weekly' },
                  { value: 'bi-weekly', label: 'Bi-Weekly' },
                  { value: 'monthly', label: 'Monthly' },
                ].map((freq) => (
                  <button
                    key={freq.value}
                    onClick={() => setFrequency(freq.value as Frequency)}
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                      frequency === freq.value
                        ? isDark
                          ? 'bg-emerald-500 text-white'
                          : 'bg-emerald-500 text-white'
                        : isDark
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {freq.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {/* Main Result */}
            <div
              className={`p-6 rounded-xl ${
                isDark
                  ? 'bg-gradient-to-br from-emerald-900/50 to-emerald-800/30 border border-emerald-700/50'
                  : 'bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-4">
                <Calculator className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                <span className={`font-medium ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>
                  {t('tools.allowanceCalculator.calculatedAllowance', 'Calculated Allowance')}
                </span>
              </div>
              <div className="text-center">
                <div
                  className={`text-5xl font-bold mb-1 ${
                    isDark ? 'text-emerald-400' : 'text-emerald-600'
                  }`}
                >
                  ${displayAllowance.toFixed(2)}
                </div>
                <div className={`text-sm ${isDark ? 'text-emerald-300/70' : 'text-emerald-700/70'}`}>
                  per {frequencyLabel}
                </div>
              </div>
              <div
                className={`mt-4 pt-4 border-t ${
                  isDark ? 'border-emerald-700/50' : 'border-emerald-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.allowanceCalculator.annualProjection', 'Annual Projection')}
                  </span>
                  <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    ${annualProjection.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* National Average Comparison */}
            <div
              className={`p-5 rounded-xl ${
                isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                <span className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                  {t('tools.allowanceCalculator.nationalAverageComparison', 'National Average Comparison')}
                </span>
              </div>
              <div className="flex items-center justify-between mb-3">
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Ages {ageGroup} average
                </span>
                <span className={`font-semibold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                  ${nationalAverage.toFixed(2)}/week
                </span>
              </div>
              <div className="relative h-4 rounded-full overflow-hidden">
                <div
                  className={`absolute inset-0 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}
                />
                <div
                  className={`absolute left-0 top-0 h-full rounded-full ${
                    weeklyAllowance >= nationalAverage ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                  style={{
                    width: `${Math.min((weeklyAllowance / (nationalAverage * 2)) * 100, 100)}%`,
                  }}
                />
                <div
                  className="absolute top-0 h-full w-0.5 bg-blue-500"
                  style={{ left: '50%' }}
                />
              </div>
              <div className="flex justify-between mt-2">
                <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>$0</span>
                <span className={`text-xs ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                  Average: ${nationalAverage}
                </span>
                <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  ${(nationalAverage * 2).toFixed(0)}
                </span>
              </div>
              <p
                className={`mt-3 text-sm ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                {weeklyAllowance >= nationalAverage
                  ? `Your allowance is ${((weeklyAllowance / nationalAverage - 1) * 100).toFixed(0)}% above the national average.`
                  : `Your allowance is ${((1 - weeklyAllowance / nationalAverage) * 100).toFixed(0)}% below the national average.`}
              </p>
            </div>

            {/* Savings Recommendations */}
            <div
              className={`p-5 rounded-xl ${
                isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-4">
                <Wallet className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                <span className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                  {t('tools.allowanceCalculator.recommendedSplit', 'Recommended Split')}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Save', value: savingsBreakdown.save, color: 'emerald', percent: 30 },
                  { label: 'Spend', value: savingsBreakdown.spend, color: 'blue', percent: 30 },
                  { label: 'Share', value: savingsBreakdown.share, color: 'pink', percent: 20 },
                  { label: 'Invest', value: savingsBreakdown.invest, color: 'amber', percent: 20 },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`p-3 rounded-lg ${
                      isDark ? 'bg-gray-700/50' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {item.label} ({item.percent}%)
                      </span>
                    </div>
                    <div
                      className={`text-lg font-semibold ${
                        item.color === 'emerald'
                          ? isDark
                            ? 'text-emerald-400'
                            : 'text-emerald-600'
                          : item.color === 'blue'
                            ? isDark
                              ? 'text-blue-400'
                              : 'text-blue-600'
                            : item.color === 'pink'
                              ? isDark
                                ? 'text-pink-400'
                                : 'text-pink-600'
                              : isDark
                                ? 'text-amber-400'
                                : 'text-amber-600'
                      }`}
                    >
                      ${item.value.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Age-Appropriate Suggestions */}
            <div
              className={`p-5 rounded-xl ${
                isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-4">
                <Star className={`w-5 h-5 ${isDark ? 'text-amber-400' : 'text-amber-500'}`} />
                <span className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                  Age-Appropriate Tips (Ages {ageGroup})
                </span>
              </div>
              <ul className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    className={`flex items-start gap-2 text-sm ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    <span
                      className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                        isDark ? 'bg-amber-400' : 'bg-amber-500'
                      }`}
                    />
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllowanceCalculatorTool;
