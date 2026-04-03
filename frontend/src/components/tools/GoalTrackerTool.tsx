import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Target, Plus, Trash2, Edit2, Check, X, TrendingUp, Sparkles, Loader2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useToolData } from '../../hooks/useToolData';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import type { ColumnConfig } from '../../lib/toolDataUtils';

interface GoalTrackerToolProps {
  uiConfig?: UIConfig;
  prefillData?: ToolPrefillData;
}

interface Goal {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
  category: string;
  deadline?: string;
  createdAt: string;
}

const categories = [
  { value: 'health', label: 'Health & Fitness', color: 'green' },
  { value: 'finance', label: 'Finance', color: 'blue' },
  { value: 'career', label: 'Career', color: 'purple' },
  { value: 'personal', label: 'Personal', color: 'pink' },
  { value: 'education', label: 'Education', color: 'orange' },
  { value: 'other', label: 'Other', color: 'gray' },
];

// Column configuration for exports
const COLUMNS: ColumnConfig[] = [
  { key: 'title', header: 'Goal', type: 'string' },
  { key: 'category', header: 'Category', type: 'string' },
  { key: 'current', header: 'Current', type: 'number' },
  { key: 'target', header: 'Target', type: 'number' },
  { key: 'unit', header: 'Unit', type: 'string' },
  { key: 'progress', header: 'Progress %', type: 'number', format: (v) => `${v}%` },
  { key: 'deadline', header: 'Deadline', type: 'date' },
  { key: 'createdAt', header: 'Created', type: 'date' },
];

export const GoalTrackerTool: React.FC<GoalTrackerToolProps> = ({ uiConfig, prefillData }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Use the new useToolData hook for backend persistence
  const {
    data: goals,
    setData: setGoals,
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
  } = useToolData<Goal>('goal-tracker', [], COLUMNS);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    target: '',
    current: '',
    unit: '',
    category: 'personal',
    deadline: '',
  });

  // Apply prefill data
  useEffect(() => {
    if (prefillData?.params) {
      if (prefillData.params.title) {
        setFormData(prev => ({ ...prev, title: prefillData.params.title }));
        setShowForm(true);
      }
      if (prefillData.params.category) {
        setFormData(prev => ({ ...prev, category: prefillData.params.category }));
      }
      setIsPrefilled(true);
    }
  }, [prefillData]);

  const resetForm = () => {
    setFormData({
      title: '',
      target: '',
      current: '',
      unit: '',
      category: 'personal',
      deadline: '',
    });
    setShowForm(false);
    setEditingId(null);
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.target) return;

    if (editingId) {
      updateItem(editingId, {
        title: formData.title,
        target: parseFloat(formData.target) || 0,
        current: parseFloat(formData.current) || 0,
        unit: formData.unit,
        category: formData.category,
        deadline: formData.deadline || undefined,
      });
    } else {
      const newGoal: Goal = {
        id: Date.now().toString(),
        title: formData.title,
        target: parseFloat(formData.target) || 0,
        current: parseFloat(formData.current) || 0,
        unit: formData.unit,
        category: formData.category,
        deadline: formData.deadline || undefined,
        createdAt: new Date().toISOString(),
      };
      addItem(newGoal);
    }
    resetForm();
  };

  const editGoal = (goal: Goal) => {
    setFormData({
      title: goal.title,
      target: goal.target.toString(),
      current: goal.current.toString(),
      unit: goal.unit,
      category: goal.category,
      deadline: goal.deadline || '',
    });
    setEditingId(goal.id);
    setShowForm(true);
  };

  const handleDeleteGoal = (id: string) => {
    deleteItem(id);
  };

  const updateProgress = (id: string, delta: number) => {
    const goal = goals.find(g => g.id === id);
    if (goal) {
      updateItem(id, {
        current: Math.max(0, Math.min(goal.target, goal.current + delta))
      });
    }
  };

  const getCategoryColor = (category: string) => {
    const cat = categories.find(c => c.value === category);
    return cat?.color || 'gray';
  };

  const getColorClasses = (color: string, type: 'bg' | 'text' | 'border') => {
    const colors: Record<string, Record<string, string>> = {
      green: { bg: 'bg-green-500', text: 'text-green-500', border: 'border-green-500' },
      blue: { bg: 'bg-blue-500', text: 'text-blue-500', border: 'border-blue-500' },
      purple: { bg: 'bg-purple-500', text: 'text-purple-500', border: 'border-purple-500' },
      pink: { bg: 'bg-pink-500', text: 'text-pink-500', border: 'border-pink-500' },
      orange: { bg: 'bg-orange-500', text: 'text-orange-500', border: 'border-orange-500' },
      gray: { bg: 'bg-gray-500', text: 'text-gray-500', border: 'border-gray-500' },
    };
    return colors[color]?.[type] || colors.gray[type];
  };

  // Calculate stats
  const { completedGoals, totalProgress } = useMemo(() => {
    const completed = goals.filter(g => g.current >= g.target).length;
    const avgProgress = goals.length > 0
      ? goals.reduce((sum, g) => sum + (g.current / g.target) * 100, 0) / goals.length
      : 0;
    return { completedGoals: completed, totalProgress: avgProgress };
  }, [goals]);

  // Prepare data for export with progress calculation
  const exportableGoals = useMemo(() =>
    goals.map(g => ({
      ...g,
      progress: Math.round((g.current / g.target) * 100)
    })),
    [goals]
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-indigo-900/20' : 'bg-gradient-to-r from-white to-indigo-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 rounded-lg">
              <Target className="w-5 h-5 text-indigo-500" />
            </div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.goalTracker.goalTracker', 'Goal Tracker')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.goalTracker.trackYourProgressTowardsGoals', 'Track your progress towards goals')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <WidgetEmbedButton toolSlug="goal-tracker" toolName="Goal Tracker" />

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
              onExportCSV={() => exportCSV({ filename: 'goals' })}
              onExportExcel={() => exportExcel({ filename: 'goals' })}
              onExportJSON={() => exportJSON({ filename: 'goals' })}
              onExportPDF={() => exportPDF({
                filename: 'goals',
                title: 'Goal Tracker Report',
                subtitle: `${completedGoals} of ${goals.length} goals completed`
              })}
              onPrint={() => print('Goal Tracker')}
              onCopyToClipboard={() => copyToClipboard('tab')}
              onImportCSV={async (file) => { await importCSV(file); }}
              onImportJSON={async (file) => { await importJSON(file); }}
              theme={isDark ? 'dark' : 'light'}
            />
            <button
              onClick={() => { resetForm(); setShowForm(true); }}
              className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t('tools.goalTracker.addGoal', 'Add Goal')}
            </button>
          </div>
        </div>
      </div>

      {/* Prefill Indicator */}
      {isPrefilled && (
        <div className={`mx-6 mt-4 flex items-center gap-2 text-sm ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
          <Sparkles className="w-4 h-4" />
          <span>{t('tools.goalTracker.preFilledFromYourRequest', 'Pre-filled from your request')}</span>
        </div>
      )}

      <div className="p-6 space-y-6">
        {/* Overview Stats */}
        {goals.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {goals.length}
              </div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.goalTracker.totalGoals', 'Total Goals')}</div>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-green-900/20' : 'bg-green-50'}`}>
              <div className="text-2xl font-bold text-green-500">
                {completedGoals}
              </div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.goalTracker.completed', 'Completed')}</div>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-indigo-900/20' : 'bg-indigo-50'}`}>
              <div className="text-2xl font-bold text-indigo-500">
                {totalProgress.toFixed(0)}%
              </div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.goalTracker.avgProgress', 'Avg Progress')}</div>
            </div>
          </div>
        )}

        {/* Add/Edit Form */}
        {showForm && (
          <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
            <h4 className={`font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {editingId ? t('tools.goalTracker.editGoal', 'Edit Goal') : t('tools.goalTracker.newGoal', 'New Goal')}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder={t('tools.goalTracker.goalTitleEGRead', 'Goal title (e.g., Read 12 books)')}
                className={`px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              />
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className={`px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={formData.current}
                  onChange={(e) => setFormData({ ...formData, current: e.target.value })}
                  placeholder={t('tools.goalTracker.current', 'Current')}
                  className={`flex-1 px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                />
                <span className={`flex items-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>/</span>
                <input
                  type="number"
                  value={formData.target}
                  onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                  placeholder={t('tools.goalTracker.target', 'Target')}
                  className={`flex-1 px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                />
              </div>
              <input
                type="text"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                placeholder={t('tools.goalTracker.unitEGBooksKm', 'Unit (e.g., books, km, $)')}
                className={`px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              />
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className={`px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              />
              <div className="flex gap-2 md:col-span-2">
                <button
                  onClick={handleSubmit}
                  className="px-6 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  {editingId ? t('tools.goalTracker.update', 'Update') : t('tools.goalTracker.create', 'Create')}
                </button>
                <button
                  onClick={resetForm}
                  className={`px-6 py-2 rounded-lg ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Goals List */}
        <div className="space-y-4">
          {goals.map(goal => {
            const progress = (goal.current / goal.target) * 100;
            const isComplete = goal.current >= goal.target;
            const color = getCategoryColor(goal.category);

            return (
              <div
                key={goal.id}
                className={`p-4 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {categories.find(c => c.value === goal.category)?.label}
                      </span>
                      {isComplete && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-green-500/20 text-green-500">
                          {t('tools.goalTracker.complete', '✓ Complete')}
                        </span>
                      )}
                    </div>
                    <h4 className={`font-medium mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {goal.title}
                    </h4>
                    {goal.deadline && (
                      <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        Due: {new Date(goal.deadline).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => editGoal(goal)}
                      className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteGoal(goal.id)}
                      className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                      {goal.current} / {goal.target} {goal.unit}
                    </span>
                    <span className={getColorClasses(color, 'text')}>
                      {progress.toFixed(0)}%
                    </span>
                  </div>
                  <div className={`h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div
                      className={`h-2 rounded-full transition-all ${getColorClasses(color, 'bg')}`}
                      style={{ width: `${Math.min(100, progress)}%` }}
                    />
                  </div>
                </div>

                {/* Quick Update Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => updateProgress(goal.id, -1)}
                    className={`px-3 py-1 text-sm rounded-lg ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                  >
                    -1
                  </button>
                  <button
                    onClick={() => updateProgress(goal.id, 1)}
                    className={`px-3 py-1 text-sm rounded-lg ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                  >
                    +1
                  </button>
                  <button
                    onClick={() => updateProgress(goal.id, 5)}
                    className={`px-3 py-1 text-sm rounded-lg ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                  >
                    +5
                  </button>
                  <button
                    onClick={() => updateProgress(goal.id, 10)}
                    className={`px-3 py-1 text-sm rounded-lg ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                  >
                    +10
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {goals.length === 0 && !showForm && (
          <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>{t('tools.goalTracker.noGoalsYetAddYour', 'No goals yet. Add your first goal to start tracking!')}</p>
          </div>
        )}

        {/* Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <strong>{t('tools.goalTracker.tip', 'Tip:')}</strong> Break big goals into smaller milestones. Track daily, weekly, or
            monthly progress to stay motivated!
          </p>
        </div>
      </div>
    </div>
  );
};

export default GoalTrackerTool;
