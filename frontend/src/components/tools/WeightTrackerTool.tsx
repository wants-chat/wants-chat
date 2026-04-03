import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Scale, Plus, Trash2, TrendingDown, TrendingUp, Calendar } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import useToolData from '../../hooks/useToolData';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { ExportDropdown } from '../ui/ExportDropdown';
import { ColumnConfig } from '../../lib/toolDataUtils';
import { useConfirmDialog } from '../ui/ConfirmDialog';

interface WeightEntry {
  id: string;
  date: string;
  weight: number;
  unit: 'kg' | 'lbs';
  notes?: string;
}

interface WeightTrackerToolProps {
  uiConfig?: UIConfig;
}

const COLUMNS: ColumnConfig[] = [
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'weight', header: 'Weight' },
  { key: 'unit', header: 'Unit' },
  { key: 'notes', header: 'Notes' },
];

export default function WeightTrackerTool({ uiConfig }: WeightTrackerToolProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newWeight, setNewWeight] = useState('');
  const [newUnit, setNewUnit] = useState<'kg' | 'lbs'>('kg');
  const [newNotes, setNewNotes] = useState('');
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const {
    data: entries,
    addItem,
    updateItem,
    deleteItem,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    recordCount,
  } = useToolData<WeightEntry>('weight-tracker', [], COLUMNS, {
    autoSave: true,
    autoSaveDelay: 1000,
  });

  // Apply prefill data from uiConfig
  React.useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.amount) {
        setNewWeight(params.amount.toString());
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (entries.length === 0) {
      return { current: 0, min: 0, max: 0, change: 0, trend: 'stable' as const };
    }

    const weights = entries.map(e => e.weight);
    const current = weights[0];
    const min = Math.min(...weights);
    const max = Math.max(...weights);
    const change = entries.length > 1 ? current - weights[weights.length - 1] : 0;
    const trend = change > 0 ? 'up' : change < 0 ? 'down' : 'stable';

    return { current, min, max, change, trend };
  }, [entries]);

  // Sort entries by date (newest first)
  const sortedEntries = [...entries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const handleAddEntry = () => {
    if (!newWeight.trim() || !newDate) {
      setValidationMessage('Please fill in all required fields');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const weight = parseFloat(newWeight);
    if (isNaN(weight) || weight <= 0) {
      setValidationMessage('Please enter a valid weight');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const newEntry: WeightEntry = {
      id: `weight-${Date.now()}`,
      date: newDate,
      weight,
      unit: newUnit,
      notes: newNotes || undefined,
    };

    addItem(newEntry);

    // Reset form
    setNewWeight('');
    setNewDate(new Date().toISOString().split('T')[0]);
    setNewNotes('');
  };

  const handleDeleteEntry = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Entry',
      message: 'Are you sure you want to delete this entry?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteItem(id);
    }
  };

  const handleExport = (format: 'csv' | 'excel' | 'json' | 'pdf') => {
    switch (format) {
      case 'csv':
        exportCSV({ filename: 'weight-tracker' });
        break;
      case 'excel':
        exportExcel({ filename: 'weight-tracker' });
        break;
      case 'json':
        exportJSON({ filename: 'weight-tracker' });
        break;
      case 'pdf':
        exportPDF({
          filename: 'weight-tracker',
          title: 'Weight Tracker',
          subtitle: 'Your weight tracking history',
        });
        break;
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <ConfirmDialog />
      {/* Validation Message Toast */}
      {validationMessage && (
        <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
          {validationMessage}
        </div>
      )}
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <Scale className="w-6 h-6 text-white" />
              </div>
              <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.weightTracker.weightTracker', 'Weight Tracker')}
              </h1>
            </div>
            <WidgetEmbedButton toolSlug="weight-tracker" toolName="Weight Tracker" />

            <SyncStatus
              isSynced={isSynced}
              isSaving={isSaving}
              lastSaved={lastSaved}
              syncError={syncError}
              onForceSync={forceSync}
              theme={theme}
              size="sm"
            />
          </div>

          {/* Prefill indicator */}
          {isPrefilled && (
            <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
              <span className="text-sm text-[#0D9488] font-medium">{t('tools.weightTracker.valueLoadedFromYourConversation', 'Value loaded from your conversation')}</span>
            </div>
          )}
        </div>

        {/* Statistics */}
        {entries.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4`}>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                {t('tools.weightTracker.current', 'Current')}
              </div>
              <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {stats.current.toFixed(1)}
              </div>
              <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                {entries[0].unit}
              </div>
            </div>

            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4`}>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                {t('tools.weightTracker.min', 'Min')}
              </div>
              <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {stats.min.toFixed(1)}
              </div>
              <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                {entries[0].unit}
              </div>
            </div>

            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4`}>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                {t('tools.weightTracker.max', 'Max')}
              </div>
              <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {stats.max.toFixed(1)}
              </div>
              <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                {entries[0].unit}
              </div>
            </div>

            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4`}>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                {t('tools.weightTracker.change', 'Change')}
              </div>
              <div className={`text-2xl font-bold flex items-center gap-1 ${
                stats.change > 0 ? 'text-red-500' : stats.change < 0 ? 'text-green-500' : 'text-gray-500'
              }`}>
                {stats.change > 0 ? (
                  <TrendingUp className="w-5 h-5" />
                ) : stats.change < 0 ? (
                  <TrendingDown className="w-5 h-5" />
                ) : null}
                {Math.abs(stats.change).toFixed(1)}
              </div>
              <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                {entries[0].unit}
              </div>
            </div>
          </div>
        )}

        {/* Add Entry Form */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6 mb-6`}>
          <h2 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.weightTracker.addWeightEntry', 'Add Weight Entry')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.weightTracker.date', 'Date')}
              </label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.weightTracker.weight', 'Weight')}
              </label>
              <input
                type="number"
                step="0.1"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                placeholder={t('tools.weightTracker.enterWeight', 'Enter weight')}
                className={`w-full px-4 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.weightTracker.unit', 'Unit')}
              </label>
              <select
                value={newUnit}
                onChange={(e) => setNewUnit(e.target.value as 'kg' | 'lbs')}
                className={`w-full px-4 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              >
                <option value="kg">{t('tools.weightTracker.kilogramsKg', 'Kilograms (kg)')}</option>
                <option value="lbs">{t('tools.weightTracker.poundsLbs', 'Pounds (lbs)')}</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.weightTracker.notes', 'Notes')}
              </label>
              <input
                type="text"
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                placeholder={t('tools.weightTracker.optionalNotes', 'Optional notes')}
                className={`w-full px-4 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              />
            </div>
          </div>

          <button
            onClick={handleAddEntry}
            className="w-full bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            {t('tools.weightTracker.addEntry', 'Add Entry')}
          </button>
        </div>

        {/* Export and Stats */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <ExportDropdown
            onExport={handleExport}
            formats={['csv', 'excel', 'json', 'pdf']}
            disabled={entries.length === 0}
          />
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 flex items-center gap-2`}>
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.weightTracker.totalEntries', 'Total Entries:')}
            </span>
            <span className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {recordCount}
            </span>
          </div>
        </div>

        {/* Entries List */}
        {sortedEntries.length > 0 ? (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow overflow-hidden`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}>
                  <tr>
                    <th className={`px-6 py-3 text-left text-sm font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.weightTracker.date2', 'Date')}
                    </th>
                    <th className={`px-6 py-3 text-left text-sm font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.weightTracker.weight2', 'Weight')}
                    </th>
                    <th className={`px-6 py-3 text-left text-sm font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.weightTracker.notes2', 'Notes')}
                    </th>
                    <th className={`px-6 py-3 text-left text-sm font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.weightTracker.action', 'Action')}
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {sortedEntries.map((entry) => (
                    <tr key={entry.id} className={theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                      <td className={`px-6 py-4 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-[#0D9488]" />
                          {new Date(entry.date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className={`px-6 py-4 text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {entry.weight} {entry.unit}
                      </td>
                      <td className={`px-6 py-4 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {entry.notes || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => handleDeleteEntry(entry.id)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                          title={t('tools.weightTracker.deleteEntry', 'Delete entry')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-12 text-center`}>
            <Scale className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
            <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.weightTracker.noWeightEntriesYetAdd', 'No weight entries yet. Add your first entry above to get started.')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
