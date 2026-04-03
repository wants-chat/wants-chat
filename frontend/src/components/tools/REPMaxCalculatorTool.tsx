import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Dumbbell, TrendingUp, Calculator, Info, Shield, Target, History, Trash2, Sparkles, Loader2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import type { ColumnConfig } from '../../lib/toolDataUtils';
import { useConfirmDialog } from '../ui/ConfirmDialog';

interface REPMaxCalculatorToolProps {
  uiConfig?: UIConfig;
}

type LiftType = 'bench' | 'squat' | 'deadlift' | 'ohp' | 'row' | 'custom';
type UnitSystem = 'kg' | 'lbs';

interface OneRepMaxResult {
  brzycki: number;
  epley: number;
  lander: number;
  average: number;
}

interface PercentageChartEntry {
  reps: number;
  percentage: number;
  weight: number;
}

interface LiftHistory {
  id: string;
  date: string;
  liftType: LiftType;
  liftName: string;
  weight: number;
  reps: number;
  oneRepMax: number;
  unit: UnitSystem;
}

const LIFT_PRESETS: Record<LiftType, { name: string; description: string }> = {
  bench: { name: 'Bench Press', description: 'Chest, shoulders, triceps' },
  squat: { name: 'Back Squat', description: 'Quads, glutes, core' },
  deadlift: { name: 'Deadlift', description: 'Full posterior chain' },
  ohp: { name: 'Overhead Press', description: 'Shoulders, triceps' },
  row: { name: 'Barbell Row', description: 'Back, biceps' },
  custom: { name: 'Custom Lift', description: 'Enter your own lift' },
};

const REP_PERCENTAGES = [
  { reps: 1, percentage: 100 },
  { reps: 2, percentage: 95 },
  { reps: 3, percentage: 93 },
  { reps: 4, percentage: 90 },
  { reps: 5, percentage: 87 },
  { reps: 6, percentage: 85 },
  { reps: 7, percentage: 83 },
  { reps: 8, percentage: 80 },
  { reps: 10, percentage: 75 },
  { reps: 12, percentage: 70 },
  { reps: 15, percentage: 65 },
  { reps: 20, percentage: 60 },
];

// Column configuration for export and sync
const COLUMNS: ColumnConfig[] = [
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'liftName', header: 'Lift', type: 'string' },
  { key: 'liftType', header: 'Lift Type', type: 'string' },
  { key: 'weight', header: 'Weight', type: 'number' },
  { key: 'unit', header: 'Unit', type: 'string' },
  { key: 'reps', header: 'Reps', type: 'number' },
  { key: 'oneRepMax', header: 'Est. 1RM', type: 'number' },
];

// 1RM Calculation Formulas
const calculateBrzycki = (weight: number, reps: number): number => {
  if (reps === 1) return weight;
  return weight * (36 / (37 - reps));
};

const calculateEpley = (weight: number, reps: number): number => {
  if (reps === 1) return weight;
  return weight * (1 + reps / 30);
};

const calculateLander = (weight: number, reps: number): number => {
  if (reps === 1) return weight;
  return (100 * weight) / (101.3 - 2.67123 * reps);
};

export function REPMaxCalculatorTool({ uiConfig }: REPMaxCalculatorToolProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [liftType, setLiftType] = useState<LiftType>('bench');
  const [customLiftName, setCustomLiftName] = useState('');
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [unit, setUnit] = useState<UnitSystem>('lbs');
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Use the useToolData hook for backend persistence
  const {
    data: history,
    addItem,
    deleteItem,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    importCSV,
    importJSON,
    copyToClipboard,
    print,
    clearData,
    isLoading,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<LiftHistory>('1rm-calculator', [], COLUMNS);

  // Handle prefill from conversation
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.amount) {
        setWeight(params.amount.toString());
        setIsPrefilled(true);
      }
      if (params.numbers && params.numbers.length >= 2) {
        setWeight(params.numbers[0].toString());
        setReps(params.numbers[1].toString());
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);
  const [result, setResult] = useState<OneRepMaxResult | null>(null);
  const [percentageChart, setPercentageChart] = useState<PercentageChartEntry[]>([]);
  const [showFormulas, setShowFormulas] = useState(false);
  const [showSafety, setShowSafety] = useState(false);
  const [activeTab, setActiveTab] = useState<'calculator' | 'history'>('calculator');

  const calculate = () => {
    const weightNum = parseFloat(weight);
    const repsNum = parseInt(reps);

    if (isNaN(weightNum) || isNaN(repsNum)) {
      setValidationMessage('Please enter valid weight and reps');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    if (weightNum <= 0) {
      setValidationMessage('Weight must be greater than 0');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    if (repsNum < 1 || repsNum > 30) {
      setValidationMessage('Reps must be between 1 and 30');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const brzycki = calculateBrzycki(weightNum, repsNum);
    const epley = calculateEpley(weightNum, repsNum);
    const lander = calculateLander(weightNum, repsNum);
    const average = (brzycki + epley + lander) / 3;

    const newResult: OneRepMaxResult = {
      brzycki: parseFloat(brzycki.toFixed(1)),
      epley: parseFloat(epley.toFixed(1)),
      lander: parseFloat(lander.toFixed(1)),
      average: parseFloat(average.toFixed(1)),
    };

    setResult(newResult);

    // Generate percentage chart
    const chart: PercentageChartEntry[] = REP_PERCENTAGES.map((entry) => ({
      reps: entry.reps,
      percentage: entry.percentage,
      weight: parseFloat(((average * entry.percentage) / 100).toFixed(1)),
    }));

    setPercentageChart(chart);
  };

  const saveToHistory = () => {
    if (!result) return;

    const liftName = liftType === 'custom' ? customLiftName || 'Custom Lift' : LIFT_PRESETS[liftType].name;

    const newEntry: LiftHistory = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      liftType,
      liftName,
      weight: parseFloat(weight),
      reps: parseInt(reps),
      oneRepMax: result.average,
      unit,
    };

    addItem(newEntry);
  };

  const deleteHistoryEntry = (id: string) => {
    deleteItem(id);
  };

  const clearHistory = async () => {
    const confirmed = await confirm({
      title: 'Clear History',
      message: 'Are you sure you want to clear all history? This action cannot be undone.',
      confirmText: 'Clear All',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      clearData();
    }
  };

  const reset = () => {
    setWeight('');
    setReps('');
    setResult(null);
    setPercentageChart([]);
  };

  const getProgressiveOverloadSuggestions = () => {
    if (!result) return null;

    const suggestions = [
      {
        title: 'Add Weight',
        description: `Try ${result.average > 100 ? '5' : '2.5'} ${unit} more on your working sets`,
        target: parseFloat((result.average * 0.75 + (result.average > 100 ? 5 : 2.5)).toFixed(1)),
      },
      {
        title: 'Add Reps',
        description: 'Add 1-2 reps to your current working weight before increasing',
        target: null,
      },
      {
        title: 'Add Sets',
        description: 'Add an extra set at your current weight/reps',
        target: null,
      },
    ];

    return suggestions;
  };

  const convertWeight = (value: number, from: UnitSystem, to: UnitSystem): number => {
    if (from === to) return value;
    if (from === 'kg' && to === 'lbs') return value * 2.20462;
    return value / 2.20462;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-[#0D9488]" />
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-4xl mx-auto">
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
          {/* Header */}
          <div className="flex items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <Dumbbell className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.rEPMaxCalculator.1rmCalculator', '1RM Calculator')}
                </h1>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.rEPMaxCalculator.calculateYourOneRepMax', 'Calculate your one-rep max and track progress')}
                </p>
              </div>
            </div>
            <WidgetEmbedButton toolSlug="r-e-p-max-calculator" toolName="R E P Max Calculator" />

            <SyncStatus
              isSynced={isSynced}
              isSaving={isSaving}
              lastSaved={lastSaved}
              syncError={syncError}
              onForceSync={forceSync}
              theme={isDark ? 'dark' : 'light'}
              size="sm"
            />
          </div>

          {/* Prefill Indicator */}
          {isPrefilled && (
            <div className="flex items-center gap-2 px-4 py-2 mb-6 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
              <Sparkles className="w-4 h-4 text-[#0D9488]" />
              <span className="text-sm text-[#0D9488] font-medium">{t('tools.rEPMaxCalculator.contentLoadedFromYourConversation', 'Content loaded from your conversation')}</span>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab('calculator')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'calculator'
                  ? 'bg-[#0D9488] text-white'
                  : isDark
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <Calculator className="w-4 h-4" />
              {t('tools.rEPMaxCalculator.calculator', 'Calculator')}
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'history'
                  ? 'bg-[#0D9488] text-white'
                  : isDark
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <History className="w-4 h-4" />
              History ({history.length})
            </button>
          </div>

          {activeTab === 'calculator' ? (
            <>
              {/* Unit System Toggle */}
              <div className="mb-6">
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.rEPMaxCalculator.unitSystem', 'Unit System')}
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setUnit('lbs')}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                      unit === 'lbs'
                        ? 'bg-[#0D9488] text-white'
                        : isDark
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {t('tools.rEPMaxCalculator.poundsLbs', 'Pounds (lbs)')}
                  </button>
                  <button
                    onClick={() => setUnit('kg')}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                      unit === 'kg'
                        ? 'bg-[#0D9488] text-white'
                        : isDark
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {t('tools.rEPMaxCalculator.kilogramsKg', 'Kilograms (kg)')}
                  </button>
                </div>
              </div>

              {/* Lift Type Selection */}
              <div className="mb-6">
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.rEPMaxCalculator.selectLift', 'Select Lift')}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(LIFT_PRESETS) as LiftType[]).map((lift) => (
                    <button
                      key={lift}
                      onClick={() => setLiftType(lift)}
                      className={`py-3 px-4 rounded-lg font-medium transition-colors text-left ${
                        liftType === lift
                          ? 'bg-[#0D9488] text-white'
                          : isDark
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      <div className="font-semibold text-sm">{LIFT_PRESETS[lift].name}</div>
                      <div className={`text-xs ${liftType === lift ? 'text-white/70' : isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {LIFT_PRESETS[lift].description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Lift Name */}
              {liftType === 'custom' && (
                <div className="mb-4">
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.rEPMaxCalculator.customLiftName', 'Custom Lift Name')}
                  </label>
                  <input
                    type="text"
                    value={customLiftName}
                    onChange={(e) => setCustomLiftName(e.target.value)}
                    placeholder={t('tools.rEPMaxCalculator.enterLiftName', 'Enter lift name')}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
              )}

              {/* Input Fields */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Weight Lifted ({unit})
                  </label>
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder={`Enter weight in ${unit}`}
                    step="0.5"
                    min="0"
                    className={`w-full px-4 py-3 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.rEPMaxCalculator.repsPerformed', 'Reps Performed')}
                  </label>
                  <input
                    type="number"
                    value={reps}
                    onChange={(e) => setReps(e.target.value)}
                    placeholder={t('tools.rEPMaxCalculator.enterReps130', 'Enter reps (1-30)')}
                    min="1"
                    max="30"
                    className={`w-full px-4 py-3 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
              </div>

              {/* Quick Rep Buttons */}
              <div className="mb-6">
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.rEPMaxCalculator.quickRepSelection', 'Quick Rep Selection')}
                </label>
                <div className="flex flex-wrap gap-2">
                  {[1, 3, 5, 6, 8, 10, 12, 15].map((rep) => (
                    <button
                      key={rep}
                      onClick={() => setReps(rep.toString())}
                      className={`py-2 px-4 rounded-lg font-medium transition-colors ${
                        reps === rep.toString()
                          ? 'bg-[#0D9488] text-white'
                          : isDark
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {rep}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mb-6">
                <button
                  onClick={calculate}
                  className="flex-1 bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Calculator className="w-5 h-5" />
                  {t('tools.rEPMaxCalculator.calculate1rm', 'Calculate 1RM')}
                </button>
                <button
                  onClick={reset}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    isDark
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {t('tools.rEPMaxCalculator.reset', 'Reset')}
                </button>
              </div>

              {/* Results Display */}
              {result && (
                <div className="space-y-4">
                  {/* Main Result */}
                  <div
                    className={`p-6 rounded-lg border-l-4 border-[#0D9488] ${
                      isDark ? 'bg-gray-700' : t('tools.rEPMaxCalculator.bg0d948810', 'bg-[#0D9488]/10')
                    }`}
                  >
                    <div className="text-center">
                      <div className={`text-sm font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {t('tools.rEPMaxCalculator.estimatedOneRepMaxAverage', 'Estimated One-Rep Max (Average)')}
                      </div>
                      <div className="text-5xl font-bold text-[#0D9488] mb-2">
                        {result.average} {unit}
                      </div>
                      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Based on {weight} {unit} x {reps} reps
                      </div>
                    </div>
                  </div>

                  {/* Formula Results */}
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <h3 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {t('tools.rEPMaxCalculator.resultsByFormula', 'Results by Formula')}
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {result.brzycki}
                        </div>
                        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.rEPMaxCalculator.brzycki', 'Brzycki')}</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {result.epley}
                        </div>
                        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.rEPMaxCalculator.epley', 'Epley')}</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {result.lander}
                        </div>
                        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.rEPMaxCalculator.lander', 'Lander')}</div>
                      </div>
                    </div>
                  </div>

                  {/* Save to History Button */}
                  <button
                    onClick={saveToHistory}
                    className={`w-full py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                      isDark
                        ? 'bg-gray-700 text-white hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                    }`}
                  >
                    <TrendingUp className="w-5 h-5" />
                    {t('tools.rEPMaxCalculator.saveToHistory', 'Save to History')}
                  </button>

                  {/* Percentage Chart */}
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <h3 className={`font-semibold mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      <Target className="w-5 h-5" />
                      {t('tools.rEPMaxCalculator.weightForRepRanges', 'Weight for Rep Ranges')}
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {percentageChart.map((entry) => (
                        <div
                          key={entry.reps}
                          className={`p-3 rounded-lg text-center ${
                            isDark ? 'bg-gray-800' : 'bg-white'
                          }`}
                        >
                          <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {entry.reps} rep{entry.reps > 1 ? 's' : ''} ({entry.percentage}%)
                          </div>
                          <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {entry.weight} {unit}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Progressive Overload Suggestions */}
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <h3 className={`font-semibold mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      <TrendingUp className="w-5 h-5 text-[#0D9488]" />
                      {t('tools.rEPMaxCalculator.progressiveOverloadSuggestions', 'Progressive Overload Suggestions')}
                    </h3>
                    <div className="space-y-3">
                      {getProgressiveOverloadSuggestions()?.map((suggestion, index) => (
                        <div
                          key={index}
                          className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}
                        >
                          <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {suggestion.title}
                          </div>
                          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {suggestion.description}
                          </div>
                          {suggestion.target && (
                            <div className="text-sm text-[#0D9488] font-semibold mt-1">
                              Target: {suggestion.target} {unit}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Formula Explanation */}
              <button
                onClick={() => setShowFormulas(!showFormulas)}
                className={`w-full mt-4 flex items-center justify-between p-4 rounded-lg ${
                  isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                } transition-colors`}
              >
                <div className="flex items-center gap-2">
                  <Info className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.rEPMaxCalculator.1rmFormulasExplained', '1RM Formulas Explained')}
                  </span>
                </div>
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                  {showFormulas ? '-' : '+'}
                </span>
              </button>

              {showFormulas && (
                <div className={`mt-2 p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <div className={`text-sm space-y-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    <div>
                      <p className="font-semibold">{t('tools.rEPMaxCalculator.brzyckiFormula', 'Brzycki Formula:')}</p>
                      <p className="font-mono">1RM = Weight x (36 / (37 - Reps))</p>
                      <p className="text-xs mt-1">{t('tools.rEPMaxCalculator.mostAccurateFor110', 'Most accurate for 1-10 reps')}</p>
                    </div>
                    <div>
                      <p className="font-semibold">{t('tools.rEPMaxCalculator.epleyFormula', 'Epley Formula:')}</p>
                      <p className="font-mono">1RM = Weight x (1 + Reps/30)</p>
                      <p className="text-xs mt-1">{t('tools.rEPMaxCalculator.goodGeneralFormula', 'Good general formula')}</p>
                    </div>
                    <div>
                      <p className="font-semibold">{t('tools.rEPMaxCalculator.landerFormula', 'Lander Formula:')}</p>
                      <p className="font-mono">1RM = (100 x Weight) / (101.3 - 2.67123 x Reps)</p>
                      <p className="text-xs mt-1">{t('tools.rEPMaxCalculator.alternativeCalculationMethod', 'Alternative calculation method')}</p>
                    </div>
                    <p className="text-xs mt-3">
                      Note: These formulas provide estimates. Actual 1RM may vary based on individual factors,
                      training experience, and form quality.
                    </p>
                  </div>
                </div>
              )}

              {/* Safety Recommendations */}
              <button
                onClick={() => setShowSafety(!showSafety)}
                className={`w-full mt-4 flex items-center justify-between p-4 rounded-lg ${
                  isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                } transition-colors`}
              >
                <div className="flex items-center gap-2">
                  <Shield className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.rEPMaxCalculator.safetyRecommendations', 'Safety Recommendations')}
                  </span>
                </div>
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                  {showSafety ? '-' : '+'}
                </span>
              </button>

              {showSafety && (
                <div className={`mt-2 p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <div className={`text-sm space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    <p className="flex items-start gap-2">
                      <span className="text-[#0D9488] font-bold">1.</span>
                      {t('tools.rEPMaxCalculator.alwaysWarmUpThoroughlyBefore', 'Always warm up thoroughly before attempting heavy lifts')}
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="text-[#0D9488] font-bold">2.</span>
                      {t('tools.rEPMaxCalculator.useASpotterWhenTesting', 'Use a spotter when testing true 1RM, especially for bench press and squat')}
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="text-[#0D9488] font-bold">3.</span>
                      {t('tools.rEPMaxCalculator.donTAttempt1rmTests', 'Don\'t attempt 1RM tests too frequently - once every 4-8 weeks is sufficient')}
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="text-[#0D9488] font-bold">4.</span>
                      {t('tools.rEPMaxCalculator.useSafetyBarsOrPins', 'Use safety bars or pins in a power rack when lifting alone')}
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="text-[#0D9488] font-bold">5.</span>
                      {t('tools.rEPMaxCalculator.prioritizeProperFormOverWeight', 'Prioritize proper form over weight - bad form increases injury risk')}
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="text-[#0D9488] font-bold">6.</span>
                      {t('tools.rEPMaxCalculator.listenToYourBodyStop', 'Listen to your body - stop if you feel pain or excessive strain')}
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="text-[#0D9488] font-bold">7.</span>
                      {t('tools.rEPMaxCalculator.useEstimatesFrom35', 'Use estimates from 3-5 rep maxes for safer progression planning')}
                    </p>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* History Tab */
            <div>
              {history.length > 0 ? (
                <>
                  <div className="flex justify-end gap-2 mb-4">
                    <ExportDropdown
                      onExportCSV={() => exportCSV({ filename: '1rm-history' })}
                      onExportExcel={() => exportExcel({ filename: '1rm-history' })}
                      onExportJSON={() => exportJSON({ filename: '1rm-history' })}
                      onExportPDF={() => exportPDF({ filename: '1rm-history', title: '1RM Calculator History' })}
                      onPrint={() => print('1RM Calculator History')}
                      onCopyToClipboard={() => copyToClipboard('tab')}
                      onImportCSV={async (file) => { await importCSV(file); }}
                      onImportJSON={async (file) => { await importJSON(file); }}
                      theme={isDark ? 'dark' : 'light'}
                      disabled={history.length === 0}
                    />
                    <button
                      onClick={clearHistory}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                        isDark
                          ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50'
                          : 'bg-red-100 text-red-600 hover:bg-red-200'
                      }`}
                    >
                      <Trash2 className="w-4 h-4" />
                      {t('tools.rEPMaxCalculator.clearAll', 'Clear All')}
                    </button>
                  </div>
                  <div className="space-y-3">
                    {history.map((entry) => (
                      <div
                        key={entry.id}
                        className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {entry.liftName}
                            </div>
                            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {new Date(entry.date).toLocaleDateString()} at{' '}
                              {new Date(entry.date).toLocaleTimeString()}
                            </div>
                            <div className={`text-sm mt-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              {entry.weight} {entry.unit} x {entry.reps} reps
                            </div>
                          </div>
                          <div className="text-right flex items-start gap-2">
                            <div>
                              <div className="text-2xl font-bold text-[#0D9488]">
                                {entry.oneRepMax} {entry.unit}
                              </div>
                              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                {t('tools.rEPMaxCalculator.est1rm', 'Est. 1RM')}
                              </div>
                            </div>
                            <button
                              onClick={() => deleteHistoryEntry(entry.id)}
                              className={`p-2 rounded-lg transition-colors ${
                                isDark
                                  ? 'hover:bg-gray-600 text-gray-400'
                                  : 'hover:bg-gray-200 text-gray-500'
                              }`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">{t('tools.rEPMaxCalculator.noHistoryYet', 'No history yet')}</p>
                  <p className="text-sm">{t('tools.rEPMaxCalculator.calculateYour1rmAndSave', 'Calculate your 1RM and save it to track your progress over time')}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <ConfirmDialog />
    </div>
  );
}

export default REPMaxCalculatorTool;
