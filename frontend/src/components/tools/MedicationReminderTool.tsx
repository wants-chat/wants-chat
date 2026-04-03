import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  Pill,
  Clock,
  Plus,
  Trash2,
  Check,
  AlertTriangle,
  Calendar,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  History,
  UtensilsCrossed,
  Bell,
} from 'lucide-react';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData, type UseToolDataReturn } from '../../hooks/useToolData';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';
import { useTheme } from '../../contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

type Frequency = 'once_daily' | 'twice_daily' | 'three_times_daily' | 'four_times_daily' | 'weekly' | 'as_needed';

interface MedicationTime {
  time: string;
  taken: boolean;
  takenAt?: string;
}

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: Frequency;
  times: MedicationTime[];
  withFood: boolean;
  daysSupply: number;
  startDate: string;
  notes?: string;
  refillReminder: boolean;
  refillThreshold: number;
}

interface AdherenceRecord {
  date: string;
  medicationId: string;
  scheduled: number;
  taken: number;
}

// Column configuration for export
const MEDICATION_COLUMNS: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'name', header: 'Medication Name', type: 'string' },
  { key: 'dosage', header: 'Dosage', type: 'string' },
  { key: 'frequency', header: 'Frequency', type: 'string' },
  { key: 'times', header: 'Times', type: 'string' },
  { key: 'withFood', header: 'With Food', type: 'boolean' },
  { key: 'daysRemaining', header: 'Days Remaining', type: 'number' },
  { key: 'startDate', header: 'Start Date', type: 'date' },
  { key: 'notes', header: 'Notes', type: 'string' },
];

const FREQUENCY_OPTIONS: { value: Frequency; label: string; timesPerDay: number }[] = [
  { value: 'once_daily', label: 'Once Daily', timesPerDay: 1 },
  { value: 'twice_daily', label: 'Twice Daily', timesPerDay: 2 },
  { value: 'three_times_daily', label: 'Three Times Daily', timesPerDay: 3 },
  { value: 'four_times_daily', label: 'Four Times Daily', timesPerDay: 4 },
  { value: 'weekly', label: 'Weekly', timesPerDay: 1 },
  { value: 'as_needed', label: 'As Needed', timesPerDay: 0 },
];

const DEFAULT_TIMES: Record<Frequency, string[]> = {
  once_daily: ['08:00'],
  twice_daily: ['08:00', '20:00'],
  three_times_daily: ['08:00', '14:00', '20:00'],
  four_times_daily: ['08:00', '12:00', '16:00', '20:00'],
  weekly: ['08:00'],
  as_needed: [],
};

interface MedicationReminderToolProps {
  uiConfig?: UIConfig;
}

export const MedicationReminderTool = ({ uiConfig }: MedicationReminderToolProps) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Use the useToolData hook for backend sync
  const toolData = useToolData<Medication>(
    'medication-reminder',
    [],
    MEDICATION_COLUMNS,
    { autoSave: true, autoSaveDelay: 1000 }
  );

  const { data: medications, addItem, updateItem, deleteItem } = toolData;

  // Local state for adherence history (kept in localStorage)
  const [adherenceHistory, setAdherenceHistory] = useState<AdherenceRecord[]>(() => {
    const saved = localStorage.getItem('adherenceHistory');
    return saved ? JSON.parse(saved) : [];
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [expandedMed, setExpandedMed] = useState<string | null>(null);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: 'once_daily' as Frequency,
    times: ['08:00'],
    withFood: false,
    daysSupply: 30,
    notes: '',
    refillReminder: true,
    refillThreshold: 7,
  });

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params && !isPrefilled) {
      const params = uiConfig.params as ToolPrefillData & {
        medicationName?: string;
        dosage?: string;
        frequency?: string;
      };
      if (params.medicationName || params.dosage || params.frequency) {
        setFormData(prev => ({
          ...prev,
          name: params.medicationName || prev.name,
          dosage: params.dosage || prev.dosage,
          frequency: (params.frequency as Frequency) || prev.frequency,
        }));
        setShowAddForm(true);
      }
      setIsPrefilled(true);
    }
  }, [uiConfig?.params, isPrefilled]);

  useEffect(() => {
    localStorage.setItem('adherenceHistory', JSON.stringify(adherenceHistory));
  }, [adherenceHistory]);

  const resetForm = () => {
    setFormData({
      name: '',
      dosage: '',
      frequency: 'once_daily',
      times: ['08:00'],
      withFood: false,
      daysSupply: 30,
      notes: '',
      refillReminder: true,
      refillThreshold: 7,
    });
  };

  const handleFrequencyChange = (freq: Frequency) => {
    setFormData({
      ...formData,
      frequency: freq,
      times: [...DEFAULT_TIMES[freq]],
    });
  };

  const handleTimeChange = (index: number, value: string) => {
    const newTimes = [...formData.times];
    newTimes[index] = value;
    setFormData({ ...formData, times: newTimes });
  };

  const addMedication = useCallback(() => {
    if (!formData.name.trim() || !formData.dosage.trim()) {
      setValidationMessage('Please enter medication name and dosage');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const newMed: Medication = {
      id: Date.now().toString(),
      name: formData.name.trim(),
      dosage: formData.dosage.trim(),
      frequency: formData.frequency,
      times: formData.times.map((t) => ({ time: t, taken: false })),
      withFood: formData.withFood,
      daysSupply: formData.daysSupply,
      startDate: new Date().toISOString().split('T')[0],
      notes: formData.notes.trim() || undefined,
      refillReminder: formData.refillReminder,
      refillThreshold: formData.refillThreshold,
    };

    addItem(newMed);
    resetForm();
    setShowAddForm(false);
  }, [formData, addItem]);

  const deleteMedication = useCallback(async (id: string) => {
    const confirmed = await confirm({
      title: 'Confirm Action',
      message: 'Are you sure you want to delete this medication?',
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (!confirmed) return;
    deleteItem(id);
  }, [deleteItem, confirm]);

  const markAsTaken = useCallback((medId: string, timeIndex: number) => {
    const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const med = medications.find((m) => m.id === medId);

    if (med) {
      const newTimes = [...med.times];
      newTimes[timeIndex] = {
        ...newTimes[timeIndex],
        taken: true,
        takenAt: now,
      };
      updateItem(medId, { times: newTimes });
    }

    // Update adherence history
    const today = new Date().toISOString().split('T')[0];
    const existingRecord = adherenceHistory.find(
      (r) => r.date === today && r.medicationId === medId
    );

    if (existingRecord) {
      setAdherenceHistory(
        adherenceHistory.map((r) =>
          r.date === today && r.medicationId === medId
            ? { ...r, taken: r.taken + 1 }
            : r
        )
      );
    } else {
      setAdherenceHistory([
        ...adherenceHistory,
        {
          date: today,
          medicationId: medId,
          scheduled: med?.times.length || 0,
          taken: 1,
        },
      ]);
    }
  }, [medications, updateItem, adherenceHistory]);

  const resetDailyMedications = useCallback(() => {
    medications.forEach((med) => {
      updateItem(med.id, {
        times: med.times.map((t) => ({ ...t, taken: false, takenAt: undefined })),
      });
    });
  }, [medications, updateItem]);

  const getDaysRemaining = (med: Medication): number => {
    const startDate = new Date(med.startDate);
    const today = new Date();
    const daysPassed = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, med.daysSupply - daysPassed);
  };

  const getAdherencePercentage = (medId: string): number => {
    const records = adherenceHistory.filter((r) => r.medicationId === medId);
    if (records.length === 0) return 100;
    const totalScheduled = records.reduce((sum, r) => sum + r.scheduled, 0);
    const totalTaken = records.reduce((sum, r) => sum + r.taken, 0);
    return totalScheduled > 0 ? Math.round((totalTaken / totalScheduled) * 100) : 100;
  };

  const getTodaySchedule = (): { med: Medication; timeIndex: number; time: string; taken: boolean }[] => {
    const schedule: { med: Medication; timeIndex: number; time: string; taken: boolean }[] = [];
    medications.forEach((med) => {
      if (med.frequency !== 'as_needed') {
        med.times.forEach((t, idx) => {
          schedule.push({
            med,
            timeIndex: idx,
            time: t.time,
            taken: t.taken,
          });
        });
      }
    });
    return schedule.sort((a, b) => a.time.localeCompare(b.time));
  };

  // Export handlers using hook methods
  const handleExportCSV = useCallback(() => {
    toolData.exportCSV({ filename: 'medication-schedule' });
  }, [toolData]);

  const handleExportExcel = useCallback(() => {
    toolData.exportExcel({ filename: 'medication-schedule' });
  }, [toolData]);

  const handleExportJSON = useCallback(() => {
    toolData.exportJSON({ filename: 'medication-schedule' });
  }, [toolData]);

  const handleExportPDF = useCallback(async () => {
    await toolData.exportPDF({
      filename: 'medication-schedule',
      title: 'Medication Schedule',
      subtitle: `Generated on ${new Date().toLocaleDateString()}`,
    });
  }, [toolData]);

  const handlePrint = useCallback(() => {
    toolData.print('Medication Schedule');
  }, [toolData]);

  const handleCopyToClipboard = useCallback(async () => {
    return await toolData.copyToClipboard('tab');
  }, [toolData]);

  const todaySchedule = getTodaySchedule();
  const needsRefill = medications.filter(
    (m) => m.refillReminder && getDaysRemaining(m) <= m.refillThreshold
  );

  return (
    <>
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-[#0D9488] rounded-lg">
                  <Pill className="w-6 h-6 text-white" />
                </div>
                <div className="flex flex-col gap-1">
                  <CardTitle className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                    {t('tools.medicationReminder.medicationReminder', 'Medication Reminder')}
                  </CardTitle>
                  <WidgetEmbedButton toolSlug="medication-reminder" toolName="Medication Reminder" />

                  <SyncStatus
                    isSynced={toolData.isSynced}
                    isSaving={toolData.isSaving}
                    lastSaved={toolData.lastSaved}
                    syncError={toolData.syncError}
                    onForceSync={toolData.forceSync}
                    theme={theme}
                    showLabel={true}
                    size="sm"
                  />
                </div>
              </div>
              <div className="flex gap-2 items-center">
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className={`p-2 rounded-lg transition-colors ${
                    theme === 'dark'
                      ? 'hover:bg-gray-700 text-gray-300'
                      : 'hover:bg-gray-200 text-gray-600'
                  }`}
                  title={t('tools.medicationReminder.viewHistory', 'View History')}
                >
                  <History className="w-5 h-5" />
                </button>
                <button
                  onClick={resetDailyMedications}
                  className={`p-2 rounded-lg transition-colors ${
                    theme === 'dark'
                      ? 'hover:bg-gray-700 text-gray-300'
                      : 'hover:bg-gray-200 text-gray-600'
                  }`}
                  title={t('tools.medicationReminder.resetDailyStatus', 'Reset Daily Status')}
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
                <ExportDropdown
                  onExportCSV={handleExportCSV}
                  onExportExcel={handleExportExcel}
                  onExportJSON={handleExportJSON}
                  onExportPDF={handleExportPDF}
                  onPrint={handlePrint}
                  onCopyToClipboard={handleCopyToClipboard}
                  disabled={medications.length === 0}
                  showImport={false}
                  theme={theme}
                />
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Drug Interaction Warning */}
        <div
          className={`p-4 rounded-lg border ${
            theme === 'dark'
              ? 'bg-yellow-900/20 border-yellow-700 text-yellow-200'
              : 'bg-yellow-50 border-yellow-200 text-yellow-800'
          }`}
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-semibold mb-1">{t('tools.medicationReminder.drugInteractionWarning', 'Drug Interaction Warning')}</p>
              <p>
                This tool is for tracking purposes only. Always consult your healthcare provider or
                pharmacist about potential drug interactions before starting any new medication.
              </p>
            </div>
          </div>
        </div>

        {/* Refill Reminders */}
        {needsRefill.length > 0 && (
          <div
            className={`p-4 rounded-lg border ${
              theme === 'dark'
                ? 'bg-red-900/20 border-red-700 text-red-200'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            <div className="flex items-start gap-3">
              <Bell className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold mb-2">{t('tools.medicationReminder.refillReminders', 'Refill Reminders')}</p>
                <ul className="text-sm space-y-1">
                  {needsRefill.map((med) => (
                    <li key={med.id}>
                      <span className="font-medium">{med.name}</span> - {getDaysRemaining(med)} days
                      remaining
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Today's Schedule */}
        <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
          <CardHeader>
            <CardTitle className={`text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                {t('tools.medicationReminder.todaySSchedule', 'Today\'s Schedule')}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todaySchedule.length === 0 ? (
              <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('tools.medicationReminder.noMedicationsScheduledForToday', 'No medications scheduled for today. Add a medication to get started.')}
              </p>
            ) : (
              <div className="space-y-3">
                {todaySchedule.map((item, idx) => (
                  <div
                    key={`${item.med.id}-${idx}`}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      item.taken
                        ? theme === 'dark'
                          ? 'bg-green-900/20 border border-green-700'
                          : 'bg-green-50 border border-green-200'
                        : theme === 'dark'
                        ? 'bg-gray-700'
                        : 'bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          item.taken
                            ? 'bg-green-500'
                            : theme === 'dark'
                            ? 'bg-gray-600'
                            : 'bg-gray-300'
                        }`}
                      >
                        <Clock className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p
                          className={`font-medium ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}
                        >
                          {item.time} - {item.med.name}
                        </p>
                        <p
                          className={`text-sm ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}
                        >
                          {item.med.dosage}
                          {item.med.withFood && (
                            <span className="ml-2 inline-flex items-center gap-1">
                              <UtensilsCrossed className="w-3 h-3" /> with food
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    {!item.taken && (
                      <button
                        onClick={() => markAsTaken(item.med.id, item.timeIndex)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg text-sm transition-colors"
                      >
                        <Check className="w-4 h-4" />
                        {t('tools.medicationReminder.take', 'Take')}
                      </button>
                    )}
                    {item.taken && (
                      <span className="text-green-500 flex items-center gap-1 text-sm">
                        <Check className="w-4 h-4" />
                        {t('tools.medicationReminder.taken', 'Taken')}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Adherence History */}
        {showHistory && (
          <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
            <CardHeader>
              <CardTitle className={`text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.medicationReminder.adherenceHistory', 'Adherence History')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {medications.length === 0 ? (
                <p className={`text-center py-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.medicationReminder.noMedicationsToTrack', 'No medications to track.')}
                </p>
              ) : (
                <div className="space-y-3">
                  {medications.map((med) => {
                    const adherence = getAdherencePercentage(med.id);
                    return (
                      <div
                        key={med.id}
                        className={`p-3 rounded-lg ${
                          theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className={`font-medium ${
                              theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}
                          >
                            {med.name}
                          </span>
                          <span
                            className={`font-bold ${
                              adherence >= 80
                                ? 'text-green-500'
                                : adherence >= 50
                                ? 'text-yellow-500'
                                : 'text-red-500'
                            }`}
                          >
                            {adherence}%
                          </span>
                        </div>
                        <div
                          className={`w-full h-2 rounded-full ${
                            theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
                          }`}
                        >
                          <div
                            className={`h-full rounded-full transition-all ${
                              adherence >= 80
                                ? 'bg-green-500'
                                : adherence >= 50
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${adherence}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Medications List */}
        <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className={`text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.medicationReminder.myMedications', 'My Medications')}
              </CardTitle>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center gap-1 px-3 py-1.5 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg text-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t('tools.medicationReminder.addMedication', 'Add Medication')}
              </button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Add Medication Form */}
            {showAddForm && (
              <div
                className={`p-4 rounded-lg mb-4 ${
                  theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                }`}
              >
                <h3
                  className={`font-semibold mb-4 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {t('tools.medicationReminder.addNewMedication', 'Add New Medication')}
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label
                      className={`block text-sm font-medium mb-1 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      {t('tools.medicationReminder.medicationName', 'Medication Name *')}
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder={t('tools.medicationReminder.eGAspirin', 'e.g., Aspirin')}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                  <div>
                    <label
                      className={`block text-sm font-medium mb-1 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      {t('tools.medicationReminder.dosage', 'Dosage *')}
                    </label>
                    <input
                      type="text"
                      value={formData.dosage}
                      onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                      placeholder={t('tools.medicationReminder.eG100mg', 'e.g., 100mg')}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                  <div>
                    <label
                      className={`block text-sm font-medium mb-1 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      {t('tools.medicationReminder.frequency', 'Frequency')}
                    </label>
                    <select
                      value={formData.frequency}
                      onChange={(e) => handleFrequencyChange(e.target.value as Frequency)}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-600 border-gray-500 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    >
                      {FREQUENCY_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      className={`block text-sm font-medium mb-1 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      {t('tools.medicationReminder.daysSupply', 'Days Supply')}
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.daysSupply}
                      onChange={(e) =>
                        setFormData({ ...formData, daysSupply: parseInt(e.target.value) || 30 })
                      }
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-600 border-gray-500 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                </div>

                {/* Time inputs */}
                {formData.frequency !== 'as_needed' && (
                  <div className="mt-4">
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      {t('tools.medicationReminder.timeSToTake', 'Time(s) to Take')}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {formData.times.map((time, idx) => (
                        <input
                          key={idx}
                          type="time"
                          value={time}
                          onChange={(e) => handleTimeChange(idx, e.target.value)}
                          className={`px-3 py-2 rounded-lg border ${
                            theme === 'dark'
                              ? 'bg-gray-600 border-gray-500 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Additional options */}
                <div className="mt-4 space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.withFood}
                      onChange={(e) => setFormData({ ...formData, withFood: e.target.checked })}
                      className="w-4 h-4 rounded accent-[#0D9488]"
                    />
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                      {t('tools.medicationReminder.takeWithFood', 'Take with food')}
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.refillReminder}
                      onChange={(e) =>
                        setFormData({ ...formData, refillReminder: e.target.checked })
                      }
                      className="w-4 h-4 rounded accent-[#0D9488]"
                    />
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                      Enable refill reminders (
                      <input
                        type="number"
                        min="1"
                        max="30"
                        value={formData.refillThreshold}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            refillThreshold: parseInt(e.target.value) || 7,
                          })
                        }
                        className={`w-12 px-1 py-0.5 text-center rounded border ${
                          theme === 'dark'
                            ? 'bg-gray-600 border-gray-500 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />{' '}
                      days before)
                    </span>
                  </label>
                </div>

                {/* Notes */}
                <div className="mt-4">
                  <label
                    className={`block text-sm font-medium mb-1 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    {t('tools.medicationReminder.notesOptional', 'Notes (optional)')}
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder={t('tools.medicationReminder.anyAdditionalInstructions', 'Any additional instructions...')}
                    rows={2}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>

                {/* Form buttons */}
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={addMedication}
                    className="flex-1 bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    {t('tools.medicationReminder.addMedication2', 'Add Medication')}
                  </button>
                  <button
                    onClick={() => {
                      resetForm();
                      setShowAddForm(false);
                    }}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      theme === 'dark'
                        ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {t('tools.medicationReminder.cancel', 'Cancel')}
                  </button>
                </div>
              </div>
            )}

            {/* Medications list */}
            {medications.length === 0 ? (
              <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('tools.medicationReminder.noMedicationsAddedYetClick', 'No medications added yet. Click "Add Medication" to get started.')}
              </p>
            ) : (
              <div className="space-y-3">
                {medications.map((med) => {
                  const daysRemaining = getDaysRemaining(med);
                  const isExpanded = expandedMed === med.id;
                  const frequencyLabel =
                    FREQUENCY_OPTIONS.find((f) => f.value === med.frequency)?.label || med.frequency;

                  return (
                    <div
                      key={med.id}
                      className={`rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div
                        className="flex items-center justify-between p-4 cursor-pointer"
                        onClick={() => setExpandedMed(isExpanded ? null : med.id)}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-lg ${
                              daysRemaining <= med.refillThreshold
                                ? 'bg-red-500' : t('tools.medicationReminder.bg0d9488', 'bg-[#0D9488]')
                            }`}
                          >
                            <Pill className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p
                              className={`font-medium ${
                                theme === 'dark' ? 'text-white' : 'text-gray-900'
                              }`}
                            >
                              {med.name}
                            </p>
                            <p
                              className={`text-sm ${
                                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                              }`}
                            >
                              {med.dosage} - {frequencyLabel}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-sm ${
                              daysRemaining <= med.refillThreshold
                                ? 'text-red-500'
                                : theme === 'dark'
                                ? 'text-gray-400'
                                : 'text-gray-600'
                            }`}
                          >
                            {daysRemaining} days left
                          </span>
                          {isExpanded ? (
                            <ChevronUp
                              className={`w-5 h-5 ${
                                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                              }`}
                            />
                          ) : (
                            <ChevronDown
                              className={`w-5 h-5 ${
                                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                              }`}
                            />
                          )}
                        </div>
                      </div>

                      {isExpanded && (
                        <div
                          className={`px-4 pb-4 border-t ${
                            theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
                          }`}
                        >
                          <div className="pt-4 space-y-2">
                            <div className="flex items-center gap-2">
                              <Clock
                                className={`w-4 h-4 ${
                                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                }`}
                              />
                              <span
                                className={`text-sm ${
                                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                                }`}
                              >
                                Times: {med.times.map((t) => t.time).join(', ')}
                              </span>
                            </div>
                            {med.withFood && (
                              <div className="flex items-center gap-2">
                                <UtensilsCrossed
                                  className={`w-4 h-4 ${
                                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                  }`}
                                />
                                <span
                                  className={`text-sm ${
                                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                                  }`}
                                >
                                  {t('tools.medicationReminder.takeWithFood2', 'Take with food')}
                                </span>
                              </div>
                            )}
                            {med.notes && (
                              <p
                                className={`text-sm ${
                                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                }`}
                              >
                                Notes: {med.notes}
                              </p>
                            )}
                            <div className="pt-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteMedication(med.id);
                                }}
                                className="flex items-center gap-1 px-3 py-1.5 text-red-500 hover:bg-red-500/10 rounded-lg text-sm transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Section */}
        <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
          <CardContent className="pt-6">
            <div
              className={`p-4 rounded-lg ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
              }`}
            >
              <h3
                className={`font-semibold mb-2 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}
              >
                {t('tools.medicationReminder.tipsForMedicationAdherence', 'Tips for Medication Adherence')}
              </h3>
              <ul
                className={`text-sm space-y-1 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                <li>- Set alarms on your phone for medication times</li>
                <li>- Use a pill organizer to pre-sort your medications</li>
                <li>- Keep medications in a visible location</li>
                <li>- Associate taking medication with daily routines</li>
                <li>- Never adjust dosages without consulting your doctor</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    <ConfirmDialog />
    {validationMessage && (
      <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50">
        {validationMessage}
      </div>
    )}
    </>
  );
};

export default MedicationReminderTool;
