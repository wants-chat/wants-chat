import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { GraduationCap, Plus, Trash2, Calculator, Target, Sparkles, Loader2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import type { ColumnConfig } from '../../lib/toolDataUtils';

interface Assignment {
  id: string;
  name: string;
  score: number;
  weight: number;
}

interface FinalGradeInputs {
  currentGrade: number;
  currentWeight: number;
  desiredGrade: number;
}

interface GradeCalculatorToolProps {
  uiConfig?: UIConfig;
  prefillData?: ToolPrefillData;
}

// Column configuration for export
const COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Assignment Name', type: 'string' },
  { key: 'score', header: 'Score (%)', type: 'number' },
  { key: 'weight', header: 'Weight (%)', type: 'number' },
];

const GradeCalculatorTool: React.FC<GradeCalculatorToolProps> = ({ uiConfig, prefillData }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Use the useToolData hook for backend persistence
  const {
    data: assignments,
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
  } = useToolData<Assignment>('grade-calculator', [], COLUMNS);

  // Apply prefill data
  useEffect(() => {
    if (prefillData?.params) {
      if (prefillData.params.currentGrade) {
        setFinalGradeInputs(prev => ({ ...prev, currentGrade: parseFloat(prefillData.params.currentGrade) }));
        setActiveTab('final');
      }
      if (prefillData.params.desiredGrade) {
        setFinalGradeInputs(prev => ({ ...prev, desiredGrade: parseFloat(prefillData.params.desiredGrade) }));
      }
      if (prefillData.params.currentWeight) {
        setFinalGradeInputs(prev => ({ ...prev, currentWeight: parseFloat(prefillData.params.currentWeight) }));
      }
      setIsPrefilled(true);
    }
  }, [prefillData]);

  const [newAssignment, setNewAssignment] = useState({
    name: '',
    score: 0,
    weight: 0,
  });

  const [finalGradeInputs, setFinalGradeInputs] = useState<FinalGradeInputs>({
    currentGrade: 80,
    currentWeight: 60,
    desiredGrade: 90,
  });

  const [activeTab, setActiveTab] = useState<'weighted' | 'final'>('weighted');

  // Calculate weighted average
  const { weightedAverage, totalWeight } = useMemo(() => {
    if (assignments.length === 0) {
      return { weightedAverage: 0, totalWeight: 0 };
    }

    const total = assignments.reduce((sum, a) => sum + a.weight, 0);
    if (total === 0) {
      return { weightedAverage: 0, totalWeight: 0 };
    }

    const weighted = assignments.reduce(
      (sum, a) => sum + (a.score * a.weight) / 100,
      0
    );
    const average = (weighted / total) * 100;

    return { weightedAverage: average, totalWeight: total };
  }, [assignments]);

  // Calculate required final exam score
  const requiredScore = useMemo(() => {
    const { currentGrade, currentWeight, desiredGrade } = finalGradeInputs;
    const remainingWeight = 100 - currentWeight;

    if (remainingWeight <= 0) {
      return null;
    }

    const required =
      (desiredGrade - (currentGrade * currentWeight) / 100) /
      (remainingWeight / 100);

    return required;
  }, [finalGradeInputs]);

  // Get letter grade
  const getLetterGrade = (score: number): { letter: string; color: string } => {
    if (score >= 90) {
      return {
        letter: 'A',
        color: isDark ? 'text-green-400' : 'text-green-600',
      };
    }
    if (score >= 80) {
      return { letter: 'B', color: isDark ? 'text-blue-400' : 'text-blue-600' };
    }
    if (score >= 70) {
      return {
        letter: 'C',
        color: isDark ? 'text-yellow-400' : 'text-yellow-600',
      };
    }
    if (score >= 60) {
      return {
        letter: 'D',
        color: isDark ? 'text-orange-400' : 'text-orange-600',
      };
    }
    return { letter: 'F', color: isDark ? 'text-red-400' : 'text-red-600' };
  };

  // Get letter grade background
  const getLetterGradeBg = (score: number): string => {
    if (score >= 90) {
      return isDark ? 'bg-green-900/30' : 'bg-green-100';
    }
    if (score >= 80) {
      return isDark ? 'bg-blue-900/30' : 'bg-blue-100';
    }
    if (score >= 70) {
      return isDark ? 'bg-yellow-900/30' : 'bg-yellow-100';
    }
    if (score >= 60) {
      return isDark ? 'bg-orange-900/30' : 'bg-orange-100';
    }
    return isDark ? 'bg-red-900/30' : 'bg-red-100';
  };

  const addAssignment = () => {
    if (!newAssignment.name.trim()) return;

    const assignment: Assignment = {
      id: Date.now().toString(),
      name: newAssignment.name,
      score: newAssignment.score,
      weight: newAssignment.weight,
    };

    addItem(assignment);
    setNewAssignment({ name: '', score: 0, weight: 0 });
  };

  const removeAssignment = (id: string) => {
    deleteItem(id);
  };

  const updateAssignment = (
    id: string,
    field: keyof Assignment,
    value: string | number
  ) => {
    updateItem(id, { [field]: value });
  };

  const currentGradeInfo = getLetterGrade(weightedAverage);

  // Loading state
  if (isLoading) {
    return (
      <div className={`min-h-screen p-4 md:p-6 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen p-4 md:p-6 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div
              className={`p-3 rounded-xl ${isDark ? 'bg-purple-900/30' : 'bg-purple-100'}`}
            >
              <GraduationCap
                className={`w-8 h-8 ${isDark ? 'text-purple-400' : 'text-purple-600'}`}
              />
            </div>
            <div>
              <h1
                className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
              >
                {t('tools.gradeCalculator.gradeCalculator', 'Grade Calculator')}
              </h1>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.gradeCalculator.calculateYourWeightedGradesAnd', 'Calculate your weighted grades and final exam requirements')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <WidgetEmbedButton toolSlug="grade-calculator" toolName="Grade Calculator" />

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
              onExportCSV={() => exportCSV({ filename: 'grades' })}
              onExportExcel={() => exportExcel({ filename: 'grades' })}
              onExportJSON={() => exportJSON({ filename: 'grades' })}
              onExportPDF={() => exportPDF({ filename: 'grades', title: 'Grade Report' })}
              onPrint={() => print('Grade Report')}
              onCopyToClipboard={() => copyToClipboard('tab')}
              onImportCSV={async (file) => { await importCSV(file); }}
              onImportJSON={async (file) => { await importJSON(file); }}
              disabled={assignments.length === 0}
              theme={isDark ? 'dark' : 'light'}
            />
          </div>
        </div>

        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className={`mt-4 flex items-center gap-2 text-sm ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
            <Sparkles className="w-4 h-4" />
            <span>{t('tools.gradeCalculator.preFilledFromYourRequest', 'Pre-filled from your request')}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div
          className={`flex gap-2 p-1 rounded-xl mb-6 ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}
        >
          <button
            onClick={() => setActiveTab('weighted')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium transition-all ${
              activeTab === 'weighted'
                ? isDark
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-purple-600 shadow'
                : isDark
                  ? 'text-gray-400 hover:text-white'
                  : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Calculator className="w-4 h-4" />
            {t('tools.gradeCalculator.weightedAverage', 'Weighted Average')}
          </button>
          <button
            onClick={() => setActiveTab('final')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium transition-all ${
              activeTab === 'final'
                ? isDark
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-purple-600 shadow'
                : isDark
                  ? 'text-gray-400 hover:text-white'
                  : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Target className="w-4 h-4" />
            {t('tools.gradeCalculator.finalGradeNeeded', 'Final Grade Needed')}
          </button>
        </div>

        {activeTab === 'weighted' ? (
          <>
            {/* Current Grade Display */}
            <div
              className={`p-6 rounded-2xl mb-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                  >
                    {t('tools.gradeCalculator.currentWeightedAverage', 'Current Weighted Average')}
                  </p>
                  <div className="flex items-baseline gap-3 mt-1">
                    <span
                      className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
                    >
                      {weightedAverage.toFixed(1)}%
                    </span>
                    <span
                      className={`text-2xl font-bold ${currentGradeInfo.color}`}
                    >
                      ({currentGradeInfo.letter})
                    </span>
                  </div>
                </div>
                <div
                  className={`w-24 h-24 rounded-full flex items-center justify-center ${getLetterGradeBg(weightedAverage)}`}
                >
                  <span className={`text-4xl font-bold ${currentGradeInfo.color}`}>
                    {currentGradeInfo.letter}
                  </span>
                </div>
              </div>

              {/* Weight Warning */}
              {totalWeight !== 100 && assignments.length > 0 && (
                <div
                  className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${
                    isDark
                      ? 'bg-yellow-900/30 text-yellow-400'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  <span className="text-lg">&#9888;</span>
                  <span className="text-sm">
                    Total weight is {totalWeight}% (should be 100%)
                  </span>
                </div>
              )}
            </div>

            {/* Letter Grade Scale */}
            <div
              className={`p-4 rounded-2xl mb-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
            >
              <h3
                className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
              >
                {t('tools.gradeCalculator.gradeScale', 'Grade Scale')}
              </h3>
              <div className="flex flex-wrap gap-2">
                {[
                  { letter: 'A', range: '90-100', color: 'green' },
                  { letter: 'B', range: '80-89', color: 'blue' },
                  { letter: 'C', range: '70-79', color: 'yellow' },
                  { letter: 'D', range: '60-69', color: 'orange' },
                  { letter: 'F', range: '<60', color: 'red' },
                ].map((grade) => (
                  <div
                    key={grade.letter}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                      isDark
                        ? `bg-${grade.color}-900/30 text-${grade.color}-400`
                        : `bg-${grade.color}-100 text-${grade.color}-700`
                    }`}
                    style={{
                      backgroundColor: isDark
                        ? grade.color === 'green'
                          ? 'rgba(34, 197, 94, 0.2)'
                          : grade.color === 'blue'
                            ? 'rgba(59, 130, 246, 0.2)'
                            : grade.color === 'yellow'
                              ? 'rgba(234, 179, 8, 0.2)'
                              : grade.color === 'orange'
                                ? 'rgba(249, 115, 22, 0.2)'
                                : 'rgba(239, 68, 68, 0.2)'
                        : grade.color === 'green'
                          ? 'rgb(220, 252, 231)'
                          : grade.color === 'blue'
                            ? 'rgb(219, 234, 254)'
                            : grade.color === 'yellow'
                              ? 'rgb(254, 249, 195)'
                              : grade.color === 'orange'
                                ? 'rgb(255, 237, 213)'
                                : 'rgb(254, 226, 226)',
                      color: isDark
                        ? grade.color === 'green'
                          ? 'rgb(74, 222, 128)'
                          : grade.color === 'blue'
                            ? 'rgb(96, 165, 250)'
                            : grade.color === 'yellow'
                              ? 'rgb(250, 204, 21)'
                              : grade.color === 'orange'
                                ? 'rgb(251, 146, 60)'
                                : 'rgb(248, 113, 113)'
                        : grade.color === 'green'
                          ? 'rgb(22, 163, 74)'
                          : grade.color === 'blue'
                            ? 'rgb(37, 99, 235)'
                            : grade.color === 'yellow'
                              ? 'rgb(202, 138, 4)'
                              : grade.color === 'orange'
                                ? 'rgb(234, 88, 12)'
                                : 'rgb(220, 38, 38)',
                    }}
                  >
                    <span className="font-bold">{grade.letter}</span>
                    <span className="text-sm opacity-80">{grade.range}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Add Assignment Form */}
            <div
              className={`p-4 rounded-2xl mb-4 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
            >
              <h3
                className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
              >
                {t('tools.gradeCalculator.addAssignment', 'Add Assignment')}
              </h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder={t('tools.gradeCalculator.assignmentName', 'Assignment name')}
                  value={newAssignment.name}
                  onChange={(e) =>
                    setNewAssignment({ ...newAssignment, name: e.target.value })
                  }
                  className={`flex-1 px-4 py-2.5 rounded-xl border transition-colors ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500'
                      : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-purple-500'
                  } outline-none`}
                />
                <div className="flex gap-3">
                  <div className="relative">
                    <input
                      type="number"
                      placeholder={t('tools.gradeCalculator.score', 'Score')}
                      min="0"
                      max="100"
                      value={newAssignment.score || ''}
                      onChange={(e) =>
                        setNewAssignment({
                          ...newAssignment,
                          score: parseFloat(e.target.value) || 0,
                        })
                      }
                      className={`w-24 px-4 py-2.5 rounded-xl border transition-colors ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500'
                          : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-purple-500'
                      } outline-none`}
                    />
                    <span
                      className={`absolute right-3 top-1/2 -translate-y-1/2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                    >
                      %
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder={t('tools.gradeCalculator.weight', 'Weight')}
                      min="0"
                      max="100"
                      value={newAssignment.weight || ''}
                      onChange={(e) =>
                        setNewAssignment({
                          ...newAssignment,
                          weight: parseFloat(e.target.value) || 0,
                        })
                      }
                      className={`w-24 px-4 py-2.5 rounded-xl border transition-colors ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500'
                          : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-purple-500'
                      } outline-none`}
                    />
                    <span
                      className={`absolute right-3 top-1/2 -translate-y-1/2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                    >
                      %
                    </span>
                  </div>
                  <button
                    onClick={addAssignment}
                    disabled={!newAssignment.name.trim()}
                    className={`px-4 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 ${
                      newAssignment.name.trim()
                        ? isDark
                          ? 'bg-purple-600 hover:bg-purple-700 text-white'
                          : 'bg-purple-600 hover:bg-purple-700 text-white'
                        : isDark
                          ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                    {t('tools.gradeCalculator.add', 'Add')}
                  </button>
                </div>
              </div>
            </div>

            {/* Assignments List */}
            <div
              className={`rounded-2xl overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
            >
              <div
                className={`px-4 py-3 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
              >
                <h3
                  className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}
                >
                  Assignments ({assignments.length})
                </h3>
              </div>

              {assignments.length === 0 ? (
                <div className="p-8 text-center">
                  <GraduationCap
                    className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-300'}`}
                  />
                  <p
                    className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                  >
                    {t('tools.gradeCalculator.noAssignmentsAddedYet', 'No assignments added yet')}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {assignments.map((assignment) => {
                    const gradeInfo = getLetterGrade(assignment.score);
                    return (
                      <div
                        key={assignment.id}
                        className={`p-4 flex flex-col sm:flex-row sm:items-center gap-3 ${
                          isDark ? 'hover:bg-gray-750' : 'hover:bg-gray-50'
                        } transition-colors`}
                      >
                        <input
                          type="text"
                          value={assignment.name}
                          onChange={(e) =>
                            updateAssignment(assignment.id, 'name', e.target.value)
                          }
                          className={`flex-1 px-3 py-2 rounded-lg border transition-colors ${
                            isDark
                              ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500'
                              : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-purple-500'
                          } outline-none`}
                        />
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={assignment.score}
                              onChange={(e) =>
                                updateAssignment(
                                  assignment.id,
                                  'score',
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className={`w-20 px-3 py-2 rounded-lg border transition-colors ${
                                isDark
                                  ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500'
                                  : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-purple-500'
                              } outline-none`}
                            />
                            <span
                              className={`absolute right-2 top-1/2 -translate-y-1/2 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                            >
                              %
                            </span>
                          </div>
                          <div className="relative">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={assignment.weight}
                              onChange={(e) =>
                                updateAssignment(
                                  assignment.id,
                                  'weight',
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className={`w-20 px-3 py-2 rounded-lg border transition-colors ${
                                isDark
                                  ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500'
                                  : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-purple-500'
                              } outline-none`}
                            />
                            <span
                              className={`absolute right-2 top-1/2 -translate-y-1/2 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                            >
                              wt
                            </span>
                          </div>
                          <span
                            className={`w-8 text-center font-bold ${gradeInfo.color}`}
                          >
                            {gradeInfo.letter}
                          </span>
                          <button
                            onClick={() => removeAssignment(assignment.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              isDark
                                ? 'hover:bg-red-900/30 text-gray-400 hover:text-red-400'
                                : 'hover:bg-red-100 text-gray-500 hover:text-red-600'
                            }`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        ) : (
          /* Final Grade Calculator Tab */
          <div
            className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
          >
            <h3
              className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}
            >
              {t('tools.gradeCalculator.calculateRequiredFinalScore', 'Calculate Required Final Score')}
            </h3>
            <p
              className={`text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
            >
              Find out what score you need on remaining assignments to achieve your
              desired grade.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                >
                  {t('tools.gradeCalculator.currentGrade', 'Current Grade (%)')}
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={finalGradeInputs.currentGrade}
                  onChange={(e) =>
                    setFinalGradeInputs({
                      ...finalGradeInputs,
                      currentGrade: parseFloat(e.target.value) || 0,
                    })
                  }
                  className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500'
                      : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-purple-500'
                  } outline-none`}
                />
              </div>
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                >
                  {t('tools.gradeCalculator.weightCompleted', 'Weight Completed (%)')}
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={finalGradeInputs.currentWeight}
                  onChange={(e) =>
                    setFinalGradeInputs({
                      ...finalGradeInputs,
                      currentWeight: parseFloat(e.target.value) || 0,
                    })
                  }
                  className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500'
                      : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-purple-500'
                  } outline-none`}
                />
              </div>
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                >
                  {t('tools.gradeCalculator.desiredFinalGrade', 'Desired Final Grade (%)')}
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={finalGradeInputs.desiredGrade}
                  onChange={(e) =>
                    setFinalGradeInputs({
                      ...finalGradeInputs,
                      desiredGrade: parseFloat(e.target.value) || 0,
                    })
                  }
                  className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500'
                      : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-purple-500'
                  } outline-none`}
                />
              </div>
            </div>

            {/* Result Display */}
            <div
              className={`p-6 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
            >
              <div className="flex items-center gap-3 mb-4">
                <Target
                  className={`w-6 h-6 ${isDark ? 'text-purple-400' : 'text-purple-600'}`}
                />
                <h4
                  className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}
                >
                  Required Score on Remaining {100 - finalGradeInputs.currentWeight}%
                </h4>
              </div>

              {requiredScore !== null ? (
                <>
                  {requiredScore <= 100 && requiredScore >= 0 ? (
                    <div className="text-center">
                      <span
                        className={`text-5xl font-bold ${getLetterGrade(requiredScore).color}`}
                      >
                        {requiredScore.toFixed(1)}%
                      </span>
                      <p
                        className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                      >
                        You need to score at least{' '}
                        <strong>{requiredScore.toFixed(1)}%</strong> on your
                        remaining work to achieve a{' '}
                        <strong>{finalGradeInputs.desiredGrade}%</strong> final
                        grade.
                      </p>
                      <div
                        className={`mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full ${getLetterGradeBg(requiredScore)}`}
                      >
                        <span
                          className={`font-bold ${getLetterGrade(requiredScore).color}`}
                        >
                          Required Grade: {getLetterGrade(requiredScore).letter}
                        </span>
                      </div>
                    </div>
                  ) : requiredScore > 100 ? (
                    <div className="text-center">
                      <span
                        className={`text-3xl font-bold ${isDark ? 'text-red-400' : 'text-red-600'}`}
                      >
                        {t('tools.gradeCalculator.notAchievable', 'Not Achievable')}
                      </span>
                      <p
                        className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                      >
                        You would need to score{' '}
                        <strong>{requiredScore.toFixed(1)}%</strong> which is not
                        possible. Consider adjusting your goal.
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <span
                        className={`text-3xl font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}
                      >
                        {t('tools.gradeCalculator.alreadyAchieved', 'Already Achieved!')}
                      </span>
                      <p
                        className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                      >
                        Even with a 0% on remaining work, you would still exceed
                        your goal!
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center">
                  <span
                    className={`text-xl ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                  >
                    {t('tools.gradeCalculator.noRemainingWorkToCalculate', 'No remaining work to calculate')}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export { GradeCalculatorTool };
export default GradeCalculatorTool;
