import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Heart, Activity, Clock, TrendingUp, AlertCircle, Plus, Trash2, TrendingDown, Minus, Sparkles } from 'lucide-react';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  type ColumnConfig,
} from '../../lib/toolDataUtils';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useToolData } from '../../hooks/useToolData';

interface BloodPressureReading {
  id: string;
  systolic: number;
  diastolic: number;
  pulse: number;
  dateTime: string;
  notes: string;
}

type Classification = 'Normal' | 'Elevated' | 'High Stage 1' | 'High Stage 2' | 'Crisis';

interface ClassificationInfo {
  label: Classification;
  color: string;
  bgColor: string;
  borderColor: string;
}

const getClassification = (systolic: number, diastolic: number, isDark: boolean): ClassificationInfo => {
  if (systolic > 180 || diastolic > 120) {
    return {
      label: 'Crisis',
      color: isDark ? 'text-red-400' : 'text-red-600',
      bgColor: isDark ? 'bg-red-900/30' : 'bg-red-100',
      borderColor: isDark ? 'border-red-700' : 'border-red-300',
    };
  }
  if (systolic >= 140 || diastolic >= 90) {
    return {
      label: 'High Stage 2',
      color: isDark ? 'text-red-400' : 'text-red-500',
      bgColor: isDark ? 'bg-red-900/20' : 'bg-red-50',
      borderColor: isDark ? 'border-red-800' : 'border-red-200',
    };
  }
  if ((systolic >= 130 && systolic <= 139) || (diastolic >= 80 && diastolic <= 89)) {
    return {
      label: 'High Stage 1',
      color: isDark ? 'text-orange-400' : 'text-orange-600',
      bgColor: isDark ? 'bg-orange-900/20' : 'bg-orange-50',
      borderColor: isDark ? 'border-orange-800' : 'border-orange-200',
    };
  }
  if (systolic >= 120 && systolic <= 129 && diastolic < 80) {
    return {
      label: 'Elevated',
      color: isDark ? 'text-yellow-400' : 'text-yellow-600',
      bgColor: isDark ? 'bg-yellow-900/20' : 'bg-yellow-50',
      borderColor: isDark ? 'border-yellow-800' : 'border-yellow-200',
    };
  }
  return {
    label: 'Normal',
    color: isDark ? 'text-green-400' : 'text-green-600',
    bgColor: isDark ? 'bg-green-900/20' : 'bg-green-50',
    borderColor: isDark ? 'border-green-800' : 'border-green-200',
  };
};

interface BloodPressureLogToolProps {
  uiConfig?: UIConfig;
}

// Column configuration for exports
const COLUMNS: ColumnConfig[] = [
  { key: 'dateTime', header: 'Date & Time', type: 'date' },
  { key: 'systolic', header: 'Systolic (mmHg)', type: 'number' },
  { key: 'diastolic', header: 'Diastolic (mmHg)', type: 'number' },
  { key: 'pulse', header: 'Pulse (bpm)', type: 'number' },
  { key: 'classification', header: 'Classification', type: 'string' },
  { key: 'notes', header: 'Notes', type: 'string' },
];

export const BloodPressureLogTool: React.FC<BloodPressureLogToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { ConfirmDialog } = useConfirmDialog();

  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // Initialize useToolData hook for backend sync
  const {
    data: readings,
    addItem,
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
    copyToClipboard,
    print,
  } = useToolData<BloodPressureReading>('blood-pressure-log', [], COLUMNS);

  const [systolic, setSystolic] = useState<string>('');
  const [diastolic, setDiastolic] = useState<string>('');
  const [pulse, setPulse] = useState<string>('');
  const [dateTime, setDateTime] = useState<string>(new Date().toISOString().slice(0, 16));
  const [notes, setNotes] = useState<string>('');
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params && !isPrefilled) {
      const params = uiConfig.params as ToolPrefillData & {
        systolic?: number | string;
        diastolic?: number | string;
        pulse?: number | string;
      };
      if (params.systolic) setSystolic(String(params.systolic));
      if (params.diastolic) setDiastolic(String(params.diastolic));
      if (params.pulse) setPulse(String(params.pulse));
      setIsPrefilled(true);
    }
  }, [uiConfig?.params, isPrefilled]);

  // Handle prefill from gallery edit (uiConfig.params)
  useEffect(() => {
    const params = uiConfig?.params as Record<string, any>;
    if (params?.isEditFromGallery) {
      // Restore form state from saved params
      if (params.systolic) setSystolic(String(params.systolic));
      if (params.diastolic) setDiastolic(String(params.diastolic));
      if (params.pulse) setPulse(String(params.pulse));
      if (params.notes) setNotes(params.notes);
      if (params.dateTime) setDateTime(params.dateTime);
      setIsEditFromGallery(true);
    }
  }, [uiConfig?.params]);

  const averages = useMemo(() => {
    if (readings.length === 0) return null;
    const avgSystolic = Math.round(readings.reduce((sum, r) => sum + r.systolic, 0) / readings.length);
    const avgDiastolic = Math.round(readings.reduce((sum, r) => sum + r.diastolic, 0) / readings.length);
    const avgPulse = Math.round(readings.reduce((sum, r) => sum + r.pulse, 0) / readings.length);
    return { systolic: avgSystolic, diastolic: avgDiastolic, pulse: avgPulse };
  }, [readings]);

  const trend = useMemo(() => {
    if (readings.length < 3) return 'stable';
    const recent = readings.slice(0, 3);
    const older = readings.slice(3, 6);
    if (older.length === 0) return 'stable';

    const recentAvg = recent.reduce((sum, r) => sum + r.systolic, 0) / recent.length;
    const olderAvg = older.reduce((sum, r) => sum + r.systolic, 0) / older.length;
    const diff = recentAvg - olderAvg;

    if (diff < -5) return 'improving';
    if (diff > 5) return 'worsening';
    return 'stable';
  }, [readings]);

  // Prepare export data with classification
  const exportDataWithClassification = useMemo(() => {
    return readings.map((reading) => ({
      ...reading,
      classification: getClassification(reading.systolic, reading.diastolic, false).label,
    }));
  }, [readings]);

  const handleAddReading = () => {
    const sys = parseInt(systolic);
    const dia = parseInt(diastolic);
    const pul = parseInt(pulse);

    if (isNaN(sys) || isNaN(dia) || isNaN(pul)) {
      setValidationMessage('Please enter valid numbers for all fields');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    if (sys < 50 || sys > 250 || dia < 30 || dia > 150 || pul < 30 || pul > 220) {
      setValidationMessage('Please enter values within realistic ranges');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const newReading: BloodPressureReading = {
      id: Date.now().toString(),
      systolic: sys,
      diastolic: dia,
      pulse: pul,
      dateTime,
      notes,
    };

    // Use hook's addItem method for automatic backend sync
    addItem(newReading);
    setSystolic('');
    setDiastolic('');
    setPulse('');
    setNotes('');
    setDateTime(new Date().toISOString().slice(0, 16));

    // Call onSaveCallback if editing from gallery
    const params = uiConfig?.params as Record<string, any>;
    if (params?.onSaveCallback && typeof params.onSaveCallback === 'function') {
      params.onSaveCallback();
    }
  };

  const formatDateTime = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'improving':
        return <TrendingDown className={isDark ? 'text-green-400' : 'text-green-600'} size={20} />;
      case 'worsening':
        return <TrendingUp className={isDark ? 'text-red-400' : 'text-red-600'} size={20} />;
      default:
        return <Minus className={isDark ? 'text-gray-400' : 'text-gray-600'} size={20} />;
    }
  };

  const getTrendLabel = () => {
    switch (trend) {
      case 'improving':
        return { text: 'Improving', color: isDark ? 'text-green-400' : 'text-green-600' };
      case 'worsening':
        return { text: 'Worsening', color: isDark ? 'text-red-400' : 'text-red-600' };
      default:
        return { text: 'Stable', color: isDark ? 'text-gray-400' : 'text-gray-600' };
    }
  };

  return (
    <div className={`min-h-screen p-6 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${isDark ? 'bg-red-900/30' : 'bg-red-100'}`}>
              <Heart className={isDark ? 'text-red-400' : 'text-red-600'} size={28} />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.bloodPressureLog.bloodPressureLog', 'Blood Pressure Log')}
              </h1>
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                {t('tools.bloodPressureLog.trackAndMonitorYourBlood', 'Track and monitor your blood pressure readings')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <WidgetEmbedButton toolSlug="blood-pressure-log" toolName="Blood Pressure Log" />

            <SyncStatus
              isSynced={isSynced}
              isSaving={isSaving}
              lastSaved={lastSaved}
              syncError={syncError}
              onForceSync={forceSync}
              theme={isDark ? 'dark' : 'light'}
              showLabel={true}
              size="md"
            />
            {readings.length > 0 && (
              <ExportDropdown
                onExportCSV={() => exportCSV({ filename: 'blood-pressure-log' })}
                onExportExcel={() => exportExcel({ filename: 'blood-pressure-log' })}
                onExportJSON={() => exportJSON({ filename: 'blood-pressure-log' })}
                onExportPDF={async () => {
                  await exportPDF({
                    filename: 'blood-pressure-log',
                    title: 'Blood Pressure Log',
                    subtitle: `${readings.length} reading${readings.length !== 1 ? 's' : ''} recorded`,
                  });
                }}
                onPrint={() => print('Blood Pressure Log')}
                onCopyToClipboard={() => copyToClipboard('tab')}
                showImport={false}
                theme={isDark ? 'dark' : 'light'}
              />
            )}
          </div>
        </div>

        {/* Prefill indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.bloodPressureLog.valuesLoadedFromYourConversation', 'Values loaded from your conversation')}</span>
          </div>
        )}

        {/* Classification Guide */}
        <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <h3 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            <AlertCircle size={16} />
            {t('tools.bloodPressureLog.ahaBloodPressureGuidelines', 'AHA Blood Pressure Guidelines')}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
            <div className={`p-2 rounded-lg text-center ${isDark ? 'bg-green-900/20 border border-green-800' : 'bg-green-50 border border-green-200'}`}>
              <div className={`font-semibold ${isDark ? 'text-green-400' : 'text-green-600'}`}>{t('tools.bloodPressureLog.normal', 'Normal')}</div>
              <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>&lt;120 / &lt;80</div>
            </div>
            <div className={`p-2 rounded-lg text-center ${isDark ? 'bg-yellow-900/20 border border-yellow-800' : 'bg-yellow-50 border border-yellow-200'}`}>
              <div className={`font-semibold ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>{t('tools.bloodPressureLog.elevated', 'Elevated')}</div>
              <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>120-129 / &lt;80</div>
            </div>
            <div className={`p-2 rounded-lg text-center ${isDark ? 'bg-orange-900/20 border border-orange-800' : 'bg-orange-50 border border-orange-200'}`}>
              <div className={`font-semibold ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>{t('tools.bloodPressureLog.highStage1', 'High Stage 1')}</div>
              <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>130-139 / 80-89</div>
            </div>
            <div className={`p-2 rounded-lg text-center ${isDark ? 'bg-red-900/20 border border-red-800' : 'bg-red-50 border border-red-200'}`}>
              <div className={`font-semibold ${isDark ? 'text-red-400' : 'text-red-500'}`}>{t('tools.bloodPressureLog.highStage2', 'High Stage 2')}</div>
              <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>&ge;140 / &ge;90</div>
            </div>
            <div className={`p-2 rounded-lg text-center ${isDark ? 'bg-red-900/30 border border-red-700' : 'bg-red-100 border border-red-300'}`}>
              <div className={`font-semibold ${isDark ? 'text-red-400' : 'text-red-600'}`}>{t('tools.bloodPressureLog.crisis', 'Crisis')}</div>
              <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>&gt;180 / &gt;120</div>
            </div>
          </div>
        </div>

        {/* Input Form */}
        <div className={`p-6 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.bloodPressureLog.addNewReading', 'Add New Reading')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.bloodPressureLog.systolicMmhg', 'Systolic (mmHg)')}
              </label>
              <input
                type="number"
                value={systolic}
                onChange={(e) => setSystolic(e.target.value)}
                placeholder="120"
                className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.bloodPressureLog.diastolicMmhg', 'Diastolic (mmHg)')}
              </label>
              <input
                type="number"
                value={diastolic}
                onChange={(e) => setDiastolic(e.target.value)}
                placeholder="80"
                className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.bloodPressureLog.pulseBpm', 'Pulse (bpm)')}
              </label>
              <input
                type="number"
                value={pulse}
                onChange={(e) => setPulse(e.target.value)}
                placeholder="72"
                className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.bloodPressureLog.dateTime', 'Date & Time')}
              </label>
              <input
                type="datetime-local"
                value={dateTime}
                onChange={(e) => setDateTime(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>
            <div className="md:col-span-2">
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.bloodPressureLog.notesOptional', 'Notes (optional)')}
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t('tools.bloodPressureLog.eGAfterExerciseFeeling', 'e.g., After exercise, feeling stressed...')}
                className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>
          </div>
          <button
            onClick={handleAddReading}
            className={`mt-4 flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all ${
              isDark
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
          >
            <Plus size={20} />
            {t('tools.bloodPressureLog.addReading', 'Add Reading')}
          </button>
        </div>

        {/* Statistics */}
        {readings.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Averages */}
            <div className={`p-6 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <Activity size={20} />
                {t('tools.bloodPressureLog.averageReadings', 'Average Readings')}
              </h3>
              {averages && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.bloodPressureLog.bloodPressure', 'Blood Pressure')}</span>
                    <span className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {averages.systolic}/{averages.diastolic} mmHg
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.bloodPressureLog.pulse', 'Pulse')}</span>
                    <span className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {averages.pulse} bpm
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.bloodPressureLog.classification', 'Classification')}</span>
                    <span className={`font-semibold ${getClassification(averages.systolic, averages.diastolic, isDark).color}`}>
                      {getClassification(averages.systolic, averages.diastolic, isDark).label}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Trend */}
            <div className={`p-6 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <TrendingUp size={20} />
                {t('tools.bloodPressureLog.trendAnalysis', 'Trend Analysis')}
              </h3>
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  {getTrendIcon()}
                </div>
                <div>
                  <div className={`text-2xl font-bold ${getTrendLabel().color}`}>
                    {getTrendLabel().text}
                  </div>
                  <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                    {readings.length < 3
                      ? t('tools.bloodPressureLog.needMoreReadingsForTrend', 'Need more readings for trend analysis') : t('tools.bloodPressureLog.basedOnRecentVsOlder', 'Based on recent vs older readings')}
                  </div>
                </div>
              </div>
              <div className={`mt-4 text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                Total readings: {readings.length}
              </div>
            </div>
          </div>
        )}

        {/* Readings List */}
        <div className={`p-6 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Clock size={20} />
            {t('tools.bloodPressureLog.recentReadings', 'Recent Readings')}
          </h3>
          {readings.length === 0 ? (
            <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              <Heart size={48} className="mx-auto mb-4 opacity-50" />
              <p>{t('tools.bloodPressureLog.noReadingsRecordedYet', 'No readings recorded yet')}</p>
              <p className="text-sm mt-1">{t('tools.bloodPressureLog.addYourFirstBloodPressure', 'Add your first blood pressure reading above')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {readings.map((reading) => {
                const classification = getClassification(reading.systolic, reading.diastolic, isDark);
                return (
                  <div
                    key={reading.id}
                    className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${classification.bgColor} border ${classification.borderColor}`}>
                        <Heart className={classification.color} size={24} />
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <span className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {reading.systolic}/{reading.diastolic}
                          </span>
                          <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.bloodPressureLog.mmhg', 'mmHg')}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${classification.bgColor} ${classification.color} border ${classification.borderColor}`}>
                            {classification.label}
                          </span>
                        </div>
                        <div className={`flex items-center gap-4 mt-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          <span className="flex items-center gap-1">
                            <Activity size={14} />
                            {reading.pulse} bpm
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {formatDateTime(reading.dateTime)}
                          </span>
                        </div>
                        {reading.notes && (
                          <div className={`mt-2 text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                            {reading.notes}
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteItem(reading.id)}
                      className={`p-2 rounded-lg transition-all ${
                        isDark
                          ? 'hover:bg-red-900/30 text-gray-400 hover:text-red-400'
                          : 'hover:bg-red-50 text-gray-400 hover:text-red-500'
                      }`}
                      title={t('tools.bloodPressureLog.deleteReading', 'Delete reading')}
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Validation Toast */}
        {validationMessage && (
          <div className={`fixed top-4 right-4 p-4 rounded-lg border flex items-center gap-3 ${
            isDark
              ? 'bg-red-900/30 border-red-800 text-red-400'
              : 'bg-red-50 border-red-200 text-red-600'
          }`}>
            <AlertCircle size={20} />
            <span>{validationMessage}</span>
          </div>
        )}
      </div>
      <ConfirmDialog />
    </div>
  );
};

export default BloodPressureLogTool;
