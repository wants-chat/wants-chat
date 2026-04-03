import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dumbbell,
  Plus,
  Trash2,
  Calendar,
  Clock,
  Flame,
  Target,
  TrendingUp,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import {
  type ColumnConfig,
} from '../../lib/toolDataUtils';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { useToolData } from '../../hooks/useToolData';
import { useConfirmDialog } from '../ui/ConfirmDialog';

interface WorkoutLog {
  id: string;
  date: string;
  exerciseName: string;
  sets: number;
  reps: number;
  weight: number;
  duration?: number;
  caloriesBurned?: number;
  notes: string;
  muscleGroup: string;
}

interface WorkoutLogToolProps {
  uiConfig?: UIConfig;
}

// Column configuration for exports
const COLUMNS: ColumnConfig[] = [
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'exerciseName', header: 'Exercise', type: 'string' },
  { key: 'muscleGroup', header: 'Muscle Group', type: 'string' },
  { key: 'sets', header: 'Sets', type: 'number' },
  { key: 'reps', header: 'Reps', type: 'number' },
  { key: 'weight', header: 'Weight (lbs)', type: 'number' },
  { key: 'duration', header: 'Duration (min)', type: 'number' },
  { key: 'caloriesBurned', header: 'Calories Burned', type: 'number' },
  { key: 'notes', header: 'Notes', type: 'string' },
];

const MUSCLE_GROUPS = [
  'Chest',
  'Back',
  'Shoulders',
  'Arms',
  'Legs',
  'Core',
  'Cardio',
  'Full Body',
];

export const WorkoutLogTool: React.FC<WorkoutLogToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Initialize useToolData hook for backend sync
  const {
    data: logs,
    addItem,
    deleteItem,
    updateItem,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    importCSV,
    copyToClipboard,
    print,
    clearData,
  } = useToolData<WorkoutLog>('workout-log', [], COLUMNS);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<WorkoutLog>>({
    date: new Date().toISOString().split('T')[0],
    exerciseName: '',
    sets: 1,
    reps: 10,
    weight: 0,
    duration: undefined,
    caloriesBurned: undefined,
    notes: '',
    muscleGroup: 'Full Body',
  });

  const [filterMuscleGroup, setFilterMuscleGroup] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');


  // Calculate statistics
  const stats = useMemo(() => {
    const totalWorkouts = logs.length;
    const totalWeight = logs.reduce((sum, log) => sum + (log.weight || 0) * (log.sets || 1) * (log.reps || 1), 0);
    const totalCalories = logs.reduce((sum, log) => sum + (log.caloriesBurned || 0), 0);
    const totalDuration = logs.reduce((sum, log) => sum + (log.duration || 0), 0);

    // Find max weight per exercise
    const maxWeights: Record<string, number> = {};
    logs.forEach(log => {
      const key = log.exerciseName;
      maxWeights[key] = Math.max(maxWeights[key] || 0, log.weight || 0);
    });

    return {
      totalWorkouts,
      totalWeight: Math.round(totalWeight),
      totalCalories: Math.round(totalCalories),
      totalDuration: Math.round(totalDuration),
      maxWeights,
      uniqueExercises: new Set(logs.map(l => l.exerciseName)).size,
    };
  }, [logs]);

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesMuscle = !filterMuscleGroup || log.muscleGroup === filterMuscleGroup;
      const matchesSearch = !searchTerm ||
        log.exerciseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.notes.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesMuscle && matchesSearch;
    });
  }, [logs, filterMuscleGroup, searchTerm]);

  // Handle form submission
  const handleAddWorkout = () => {
    if (!formData.exerciseName || !formData.date) {
      setValidationMessage('Please fill in exercise name and date');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const newLog: WorkoutLog = {
      id: Date.now().toString(),
      date: formData.date,
      exerciseName: formData.exerciseName,
      sets: formData.sets || 1,
      reps: formData.reps || 10,
      weight: formData.weight || 0,
      duration: formData.duration,
      caloriesBurned: formData.caloriesBurned,
      notes: formData.notes || '',
      muscleGroup: formData.muscleGroup || 'Full Body',
    };

    addItem(newLog);

    // Reset form
    setFormData({
      date: new Date().toISOString().split('T')[0],
      exerciseName: '',
      sets: 1,
      reps: 10,
      weight: 0,
      duration: undefined,
      caloriesBurned: undefined,
      notes: '',
      muscleGroup: 'Full Body',
    });
    setShowForm(false);
  };

  const handleDeleteLog = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Workout Log',
      message: 'Are you sure you want to delete this workout log?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteItem(id);
    }
  };

  const handleExport = async (format: 'csv' | 'excel' | 'json' | 'pdf') => {
    try {
      switch (format) {
        case 'csv':
          exportCSV();
          break;
        case 'excel':
          exportExcel();
          break;
        case 'json':
          exportJSON();
          break;
        case 'pdf':
          await exportPDF();
          break;
      }
    } catch (error) {
      console.error(`Failed to export as ${format}:`, error);
      setValidationMessage(`Failed to export as ${format}`);
      setTimeout(() => setValidationMessage(null), 3000);
    }
  };

  const handleImport = async (format: 'csv' | 'json') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = format === 'csv' ? '.csv' : '.json';

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          if (format === 'csv') {
            const result = await importCSV(file);
            if (result.success) {
              setValidationMessage(`Imported ${result.rowCount} workout logs`);
              setTimeout(() => setValidationMessage(null), 3000);
            } else {
              setValidationMessage(`Import failed: ${result.errors?.join(', ')}`);
              setTimeout(() => setValidationMessage(null), 3000);
            }
          }
        } catch (error) {
          console.error(`Failed to import ${format}:`, error);
          setValidationMessage(`Failed to import ${format}`);
          setTimeout(() => setValidationMessage(null), 3000);
        }
      }
    };

    input.click();
  };

  return (
    <div className={`space-y-6 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
      <ConfirmDialog />
      {/* Validation Message Toast */}
      {validationMessage && (
        <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
          {validationMessage}
        </div>
      )}
      {/* Header */}
      <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gradient-to-r from-blue-50 to-purple-50'} border ${isDark ? 'border-gray-700' : 'border-blue-100'}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg ${isDark ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
              <Dumbbell className={isDark ? 'text-blue-400' : 'text-blue-600'} size={24} />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.workoutLog.workoutLog', 'Workout Log')}</h1>
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.workoutLog.trackYourExercisesAndProgress', 'Track your exercises and progress')}</p>
            </div>
          </div>
          <WidgetEmbedButton toolSlug="workout-log" toolName="Workout Log" />

          <SyncStatus
            isSynced={isSynced}
            isSaving={isSaving}
            lastSaved={lastSaved}
            syncError={syncError}
            onForceSync={forceSync}
            theme={theme}
          />
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-2 mb-2">
            <Dumbbell size={18} className={isDark ? 'text-blue-400' : 'text-blue-600'} />
            <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.workoutLog.totalWorkouts', 'Total Workouts')}</span>
          </div>
          <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.totalWorkouts}</p>
        </div>

        <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-2 mb-2">
            <Target size={18} className={isDark ? 'text-green-400' : 'text-green-600'} />
            <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.workoutLog.uniqueExercises', 'Unique Exercises')}</span>
          </div>
          <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.uniqueExercises}</p>
        </div>

        <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-2 mb-2">
            <Flame size={18} className={isDark ? 'text-orange-400' : 'text-orange-600'} />
            <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.workoutLog.totalCalories', 'Total Calories')}</span>
          </div>
          <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.totalCalories}</p>
        </div>

        <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-2 mb-2">
            <Clock size={18} className={isDark ? 'text-purple-400' : 'text-purple-600'} />
            <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.workoutLog.totalDuration', 'Total Duration')}</span>
          </div>
          <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.totalDuration} min</p>
        </div>

        <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={18} className={isDark ? 'text-pink-400' : 'text-pink-600'} />
            <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.workoutLog.totalWeight', 'Total Weight')}</span>
          </div>
          <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.totalWeight} lbs</p>
        </div>
      </div>

      {/* Controls */}
      <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center`}>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setShowForm(!showForm)}
            className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${
              isDark
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <Plus size={18} />
            {t('tools.workoutLog.addWorkout', 'Add Workout')}
          </button>

          <input
            type="text"
            placeholder={t('tools.workoutLog.searchExercises', 'Search exercises...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              isDark
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
          />

          <select
            value={filterMuscleGroup || ''}
            onChange={(e) => setFilterMuscleGroup(e.target.value || null)}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              isDark
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="">{t('tools.workoutLog.allMuscleGroups', 'All Muscle Groups')}</option>
            {MUSCLE_GROUPS.map(group => (
              <option key={group} value={group}>{group}</option>
            ))}
          </select>
        </div>

        <ExportDropdown
          onExport={handleExport}
          onImport={handleImport}
          onCopyToClipboard={() => copyToClipboard('csv')}
          onPrint={() => print('Workout Log')}
          theme={theme}
        />
      </div>

      {/* Add Workout Form */}
      {showForm && (
        <div className={`p-6 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <h2 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.workoutLog.addNewWorkout', 'Add New Workout')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.workoutLog.date', 'Date')}
              </label>
              <input
                type="date"
                value={formData.date || ''}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.workoutLog.exerciseName', 'Exercise Name')}
              </label>
              <input
                type="text"
                placeholder={t('tools.workoutLog.eGBenchPress', 'e.g., Bench Press')}
                value={formData.exerciseName || ''}
                onChange={(e) => setFormData({ ...formData, exerciseName: e.target.value })}
                className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.workoutLog.muscleGroup', 'Muscle Group')}
              </label>
              <select
                value={formData.muscleGroup || 'Full Body'}
                onChange={(e) => setFormData({ ...formData, muscleGroup: e.target.value })}
                className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                {MUSCLE_GROUPS.map(group => (
                  <option key={group} value={group}>{group}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.workoutLog.sets', 'Sets')}
              </label>
              <input
                type="number"
                min="1"
                value={formData.sets || 1}
                onChange={(e) => setFormData({ ...formData, sets: parseInt(e.target.value) || 1 })}
                className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.workoutLog.reps', 'Reps')}
              </label>
              <input
                type="number"
                min="1"
                value={formData.reps || 10}
                onChange={(e) => setFormData({ ...formData, reps: parseInt(e.target.value) || 10 })}
                className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.workoutLog.weightLbs', 'Weight (lbs)')}
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={formData.weight || 0}
                onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) || 0 })}
                className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.workoutLog.durationMin', 'Duration (min)')}
              </label>
              <input
                type="number"
                min="0"
                value={formData.duration || ''}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value ? parseInt(e.target.value) : undefined })}
                className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.workoutLog.caloriesBurned', 'Calories Burned')}
              </label>
              <input
                type="number"
                min="0"
                value={formData.caloriesBurned || ''}
                onChange={(e) => setFormData({ ...formData, caloriesBurned: e.target.value ? parseInt(e.target.value) : undefined })}
                className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.workoutLog.notes', 'Notes')}
              </label>
              <input
                type="text"
                placeholder={t('tools.workoutLog.addNotes', 'Add notes...')}
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>
          </div>

          <div className="flex gap-2 mt-6">
            <button
              onClick={handleAddWorkout}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                isDark
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {t('tools.workoutLog.saveWorkout', 'Save Workout')}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                isDark
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
              }`}
            >
              {t('tools.workoutLog.cancel', 'Cancel')}
            </button>
          </div>
        </div>
      )}

      {/* Workout Logs List */}
      <div className="space-y-4">
        {filteredLogs.length > 0 ? (
          filteredLogs.map(log => (
            <div
              key={log.id}
              className={`p-4 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} hover:shadow-md transition-shadow`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-1">
                  <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {log.exerciseName}
                  </h3>
                  <div className="flex flex-wrap gap-4 mt-2">
                    <span className={`text-sm flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      <Calendar size={14} />
                      {new Date(log.date).toLocaleDateString()}
                    </span>
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {log.muscleGroup}
                    </span>
                    <span className={`text-sm font-medium ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                      {log.sets} sets × {log.reps} reps @ {log.weight} lbs
                    </span>
                    {log.duration && (
                      <span className={`text-sm flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        <Clock size={14} />
                        {log.duration} min
                      </span>
                    )}
                    {log.caloriesBurned && (
                      <span className={`text-sm flex items-center gap-1 ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>
                        <Flame size={14} />
                        {log.caloriesBurned} cal
                      </span>
                    )}
                  </div>
                  {log.notes && (
                    <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {log.notes}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteLog(log.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    isDark
                      ? 'hover:bg-red-900/30 text-red-400'
                      : 'hover:bg-red-100 text-red-600'
                  }`}
                  title={t('tools.workoutLog.deleteWorkout', 'Delete workout')}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className={`p-8 rounded-lg border text-center ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <Dumbbell size={32} className={`mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              {logs.length === 0 ? t('tools.workoutLog.noWorkoutLogsYetStart', 'No workout logs yet. Start by adding your first workout!') : t('tools.workoutLog.noWorkoutsMatchYourFilters', 'No workouts match your filters.')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkoutLogTool;
