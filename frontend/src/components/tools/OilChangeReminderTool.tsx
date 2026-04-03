import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Car, Droplets, Calendar, Bell, History, Info, Plus, Trash2, AlertTriangle, CheckCircle, Sparkles, Loader2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import type { ColumnConfig } from '../../lib/toolDataUtils';

type OilType = 'conventional' | 'synthetic' | 'blend' | 'highMileage';

interface OilConfig {
  name: string;
  intervalMiles: number;
  intervalMonths: number;
  description: string;
}

interface ServiceRecord {
  id: string;
  date: string;
  mileage: number;
  oilType: OilType;
  notes: string;
}

interface Reminder {
  id: string;
  type: 'mileage' | 'date';
  value: number | string;
  enabled: boolean;
}

interface OilChangeReminderToolProps {
  uiConfig?: UIConfig;
  prefillData?: ToolPrefillData;
}

// Oil type configurations - defined outside component for use in COLUMNS
const oilTypes: Record<OilType, OilConfig> = {
  conventional: {
    name: 'Conventional',
    intervalMiles: 3000,
    intervalMonths: 3,
    description: 'Standard oil, requires frequent changes',
  },
  synthetic: {
    name: 'Full Synthetic',
    intervalMiles: 7500,
    intervalMonths: 12,
    description: 'Premium protection, longer intervals',
  },
  blend: {
    name: 'Synthetic Blend',
    intervalMiles: 5000,
    intervalMonths: 6,
    description: 'Balance of performance and value',
  },
  highMileage: {
    name: 'High Mileage',
    intervalMiles: 5000,
    intervalMonths: 6,
    description: 'For vehicles with 75,000+ miles',
  },
};

// Column configuration for exports - defined outside component
const COLUMNS: ColumnConfig[] = [
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'mileage', header: 'Mileage', type: 'number' },
  { key: 'oilType', header: 'Oil Type', type: 'string', format: (value: OilType) => oilTypes[value]?.name || value },
  { key: 'notes', header: 'Notes', type: 'string' },
];

export const OilChangeReminderTool: React.FC<OilChangeReminderToolProps> = ({ uiConfig, prefillData }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Use the useToolData hook for backend persistence
  const {
    data: serviceHistory,
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
    isLoading,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<ServiceRecord>('oil-change-reminder', [], COLUMNS);

  const [activeTab, setActiveTab] = useState<'calculator' | 'history' | 'reminders'>('calculator');
  const [lastChangeDate, setLastChangeDate] = useState(new Date().toISOString().split('T')[0]);
  const [lastChangeMileage, setLastChangeMileage] = useState('50000');
  const [currentMileage, setCurrentMileage] = useState('52500');
  const [oilType, setOilType] = useState<OilType>('synthetic');
  const [customIntervalMiles, setCustomIntervalMiles] = useState('');
  const [customIntervalMonths, setCustomIntervalMonths] = useState('');

  const [reminders, setReminders] = useState<Reminder[]>([
    { id: '1', type: 'mileage', value: 500, enabled: true },
    { id: '2', type: 'date', value: '7', enabled: true },
  ]);

  const [newRecordDate, setNewRecordDate] = useState('');
  const [newRecordMileage, setNewRecordMileage] = useState('');
  const [newRecordNotes, setNewRecordNotes] = useState('');
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    const params = uiConfig?.params || prefillData?.params;
    if (params) {
      if (params.mileage !== undefined) {
        setCurrentMileage(String(params.mileage));
        setIsPrefilled(true);
      }
      if (params.lastMileage !== undefined) {
        setLastChangeMileage(String(params.lastMileage));
        setIsPrefilled(true);
      }
      if (params.oilType && ['conventional', 'synthetic', 'blend', 'highMileage'].includes(params.oilType)) {
        setOilType(params.oilType as OilType);
        setIsPrefilled(true);
      }
      const textContent = params.text || params.content || '';
      if (textContent && !params.mileage) {
        const mileageMatch = textContent.match(/(\d{1,3}(?:,?\d{3})*)\s*(?:miles?|mi)/i);
        if (mileageMatch) {
          setCurrentMileage(mileageMatch[1].replace(/,/g, ''));
          setIsPrefilled(true);
        }
      }
    }
  }, [uiConfig?.params, prefillData?.params]);

  const config = oilTypes[oilType];
  const intervalMiles = customIntervalMiles ? parseInt(customIntervalMiles) : config.intervalMiles;
  const intervalMonths = customIntervalMonths ? parseInt(customIntervalMonths) : config.intervalMonths;

  const calculations = useMemo(() => {
    const lastDate = new Date(lastChangeDate);
    const lastMileage = parseInt(lastChangeMileage) || 0;
    const current = parseInt(currentMileage) || 0;

    // Calculate next due date and mileage
    const nextDueDate = new Date(lastDate);
    nextDueDate.setMonth(nextDueDate.getMonth() + intervalMonths);
    const nextDueMileage = lastMileage + intervalMiles;

    // Calculate miles and days remaining
    const milesRemaining = nextDueMileage - current;
    const today = new Date();
    const daysRemaining = Math.ceil((nextDueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    // Calculate percentage used
    const milesDriven = current - lastMileage;
    const mileageProgress = Math.min((milesDriven / intervalMiles) * 100, 100);

    const daysSinceChange = Math.ceil((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    const totalDays = intervalMonths * 30;
    const timeProgress = Math.min((daysSinceChange / totalDays) * 100, 100);

    // Determine status
    let status: 'good' | 'warning' | 'overdue' = 'good';
    if (milesRemaining <= 0 || daysRemaining <= 0) {
      status = 'overdue';
    } else if (milesRemaining <= 500 || daysRemaining <= 7) {
      status = 'warning';
    }

    return {
      nextDueDate: nextDueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      nextDueMileage: nextDueMileage.toLocaleString(),
      milesRemaining: Math.max(0, milesRemaining).toLocaleString(),
      daysRemaining: Math.max(0, daysRemaining),
      mileageProgress,
      timeProgress,
      status,
      milesDriven: milesDriven.toLocaleString(),
    };
  }, [lastChangeDate, lastChangeMileage, currentMileage, intervalMiles, intervalMonths]);

  const addServiceRecord = () => {
    if (!newRecordDate || !newRecordMileage) return;

    const newRecord: ServiceRecord = {
      id: Date.now().toString(),
      date: newRecordDate,
      mileage: parseInt(newRecordMileage),
      oilType: oilType,
      notes: newRecordNotes,
    };

    addItem(newRecord);
    setNewRecordDate('');
    setNewRecordMileage('');
    setNewRecordNotes('');
    setShowAddRecord(false);
  };

  const deleteServiceRecord = (id: string) => {
    deleteItem(id);
  };

  const toggleReminder = (id: string) => {
    setReminders(reminders.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)));
  };

  const getStatusColor = (status: 'good' | 'warning' | 'overdue') => {
    switch (status) {
      case 'good':
        return 'text-green-500';
      case 'warning':
        return 'text-amber-500';
      case 'overdue':
        return 'text-red-500';
    }
  };

  const getStatusBg = (status: 'good' | 'warning' | 'overdue') => {
    switch (status) {
      case 'good':
        return isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200';
      case 'warning':
        return isDark ? 'bg-amber-900/20 border-amber-800' : 'bg-amber-50 border-amber-200';
      case 'overdue':
        return isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200';
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-blue-900/20' : 'bg-gradient-to-r from-white to-blue-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg"><Car className="w-5 h-5 text-blue-500" /></div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.oilChangeReminder.oilChangeReminder', 'Oil Change Reminder')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.oilChangeReminder.trackIntervalsAndNeverMiss', 'Track intervals and never miss a service')}</p>
            </div>
          </div>
          <WidgetEmbedButton toolSlug="oil-change-reminder" toolName="Oil Change Reminder" />

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
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.oilChangeReminder.valuesLoadedFromAiResponse', 'Values loaded from AI response')}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('calculator')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm flex items-center justify-center gap-2 ${activeTab === 'calculator' ? 'bg-blue-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
          >
            <Droplets className="w-4 h-4" />
            {t('tools.oilChangeReminder.calculator', 'Calculator')}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm flex items-center justify-center gap-2 ${activeTab === 'history' ? 'bg-blue-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
          >
            <History className="w-4 h-4" />
            {t('tools.oilChangeReminder.history', 'History')}
          </button>
          <button
            onClick={() => setActiveTab('reminders')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm flex items-center justify-center gap-2 ${activeTab === 'reminders' ? 'bg-blue-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
          >
            <Bell className="w-4 h-4" />
            {t('tools.oilChangeReminder.reminders', 'Reminders')}
          </button>
        </div>

        {/* Calculator Tab */}
        {activeTab === 'calculator' && (
          <>
            {/* Oil Type Selection */}
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(oilTypes) as OilType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setOilType(type)}
                  className={`py-2 px-3 rounded-lg text-sm ${oilType === type ? 'bg-blue-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                >
                  {oilTypes[type].name}
                </button>
              ))}
            </div>

            {/* Oil Type Info */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'} border`}>
              <div className="flex items-center justify-between mb-2">
                <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{config.name}</h4>
                <span className="text-blue-500 font-bold">{config.intervalMiles.toLocaleString()} mi / {config.intervalMonths} mo</span>
              </div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {config.description}
              </p>
            </div>

            {/* Custom Intervals */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.oilChangeReminder.customMilesInterval', 'Custom Miles Interval')}
                </label>
                <input
                  type="number"
                  value={customIntervalMiles}
                  onChange={(e) => setCustomIntervalMiles(e.target.value)}
                  placeholder={config.intervalMiles.toString()}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.oilChangeReminder.customMonthsInterval', 'Custom Months Interval')}
                </label>
                <input
                  type="number"
                  value={customIntervalMonths}
                  onChange={(e) => setCustomIntervalMonths(e.target.value)}
                  placeholder={config.intervalMonths.toString()}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
            </div>

            {/* Last Oil Change Info */}
            <div className="space-y-4">
              <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.oilChangeReminder.lastOilChange', 'Last Oil Change')}</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    <Calendar className="w-4 h-4 inline mr-1" />
                    {t('tools.oilChangeReminder.date2', 'Date')}
                  </label>
                  <input
                    type="date"
                    value={lastChangeDate}
                    onChange={(e) => setLastChangeDate(e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div className="space-y-2">
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    <Car className="w-4 h-4 inline mr-1" />
                    {t('tools.oilChangeReminder.mileage2', 'Mileage')}
                  </label>
                  <input
                    type="number"
                    value={lastChangeMileage}
                    onChange={(e) => setLastChangeMileage(e.target.value)}
                    placeholder={t('tools.oilChangeReminder.enterMileage', 'Enter mileage')}
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
              </div>
            </div>

            {/* Current Mileage */}
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.oilChangeReminder.currentOdometerReading', 'Current Odometer Reading')}
              </label>
              <input
                type="number"
                value={currentMileage}
                onChange={(e) => setCurrentMileage(e.target.value)}
                placeholder={t('tools.oilChangeReminder.enterCurrentMileage', 'Enter current mileage')}
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>

            {/* Status Banner */}
            <div className={`p-4 rounded-lg border ${getStatusBg(calculations.status)}`}>
              <div className="flex items-center gap-3">
                {calculations.status === 'good' && <CheckCircle className="w-6 h-6 text-green-500" />}
                {calculations.status === 'warning' && <AlertTriangle className="w-6 h-6 text-amber-500" />}
                {calculations.status === 'overdue' && <AlertTriangle className="w-6 h-6 text-red-500" />}
                <div>
                  <h4 className={`font-medium ${getStatusColor(calculations.status)}`}>
                    {calculations.status === 'good' && 'Oil Change Not Due Yet'}
                    {calculations.status === 'warning' && 'Oil Change Due Soon'}
                    {calculations.status === 'overdue' && 'Oil Change Overdue!'}
                  </h4>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {calculations.milesDriven} miles driven since last change
                  </p>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.oilChangeReminder.nextDueDate', 'Next Due Date')}</span>
                </div>
                <div className="text-2xl font-bold text-blue-500">{calculations.nextDueDate}</div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {calculations.daysRemaining} days remaining
                </div>
                <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${calculations.timeProgress > 80 ? 'bg-amber-500' : 'bg-blue-500'}`}
                    style={{ width: `${calculations.timeProgress}%` }}
                  />
                </div>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Car className="w-4 h-4 text-green-500" />
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.oilChangeReminder.nextDueMileage', 'Next Due Mileage')}</span>
                </div>
                <div className="text-2xl font-bold text-green-500">{calculations.nextDueMileage}</div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {calculations.milesRemaining} miles remaining
                </div>
                <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${calculations.mileageProgress > 80 ? 'bg-amber-500' : 'bg-green-500'}`}
                    style={{ width: `${calculations.mileageProgress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
              <div className="flex items-start gap-2">
                <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <strong>{t('tools.oilChangeReminder.tips', 'Tips:')}</strong>
                  <ul className="mt-1 space-y-1">
                    <li>- Synthetic oil lasts longer but costs more upfront</li>
                    <li>- Check your owner's manual for manufacturer recommendations</li>
                    <li>- Severe driving conditions may require shorter intervals</li>
                    <li>- Always replace the oil filter during an oil change</li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <>
            <div className="flex items-center justify-between">
              <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.oilChangeReminder.serviceHistory', 'Service History')}</h4>
              <div className="flex items-center gap-2">
                <ExportDropdown
                  onExportCSV={() => exportCSV({ filename: 'oil-change-history' })}
                  onExportExcel={() => exportExcel({ filename: 'oil-change-history' })}
                  onExportJSON={() => exportJSON({ filename: 'oil-change-history' })}
                  onExportPDF={() => exportPDF({ filename: 'oil-change-history', title: 'Oil Change Service History' })}
                  onPrint={() => print('Oil Change Service History')}
                  onCopyToClipboard={() => copyToClipboard('tab')}
                  onImportCSV={async (file) => { await importCSV(file); }}
                  onImportJSON={async (file) => { await importJSON(file); }}
                  disabled={serviceHistory.length === 0}
                  theme={isDark ? 'dark' : 'light'}
                />
                <button
                  onClick={() => setShowAddRecord(!showAddRecord)}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg text-sm"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.oilChangeReminder.addRecord', 'Add Record')}
                </button>
              </div>
            </div>

            {/* Add Record Form */}
            {showAddRecord && (
              <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.oilChangeReminder.date', 'Date')}</label>
                    <input
                      type="date"
                      value={newRecordDate}
                      onChange={(e) => setNewRecordDate(e.target.value)}
                      className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.oilChangeReminder.mileage', 'Mileage')}</label>
                    <input
                      type="number"
                      value={newRecordMileage}
                      onChange={(e) => setNewRecordMileage(e.target.value)}
                      placeholder={t('tools.oilChangeReminder.enterMileage2', 'Enter mileage')}
                      className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.oilChangeReminder.notes', 'Notes')}</label>
                  <input
                    type="text"
                    value={newRecordNotes}
                    onChange={(e) => setNewRecordNotes(e.target.value)}
                    placeholder={t('tools.oilChangeReminder.eGFullSyntheticFilter', 'e.g., Full synthetic, filter replaced')}
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={addServiceRecord}
                    className="flex-1 py-2 bg-blue-500 text-white rounded-lg text-sm"
                  >
                    {t('tools.oilChangeReminder.saveRecord', 'Save Record')}
                  </button>
                  <button
                    onClick={() => setShowAddRecord(false)}
                    className={`flex-1 py-2 rounded-lg text-sm ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
                  >
                    {t('tools.oilChangeReminder.cancel', 'Cancel')}
                  </button>
                </div>
              </div>
            )}

            {/* History List */}
            <div className="space-y-3">
              {serviceHistory.length === 0 ? (
                <div className={`p-8 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>{t('tools.oilChangeReminder.noServiceRecordsYet', 'No service records yet')}</p>
                  <p className="text-sm">{t('tools.oilChangeReminder.addYourFirstOilChange', 'Add your first oil change record above')}</p>
                </div>
              ) : (
                serviceHistory.map((record) => (
                  <div
                    key={record.id}
                    className={`p-4 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          <span className={`text-sm px-2 py-0.5 rounded ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
                            {oilTypes[record.oilType].name}
                          </span>
                        </div>
                        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {record.mileage.toLocaleString()} miles
                        </div>
                        {record.notes && (
                          <div className={`text-sm mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                            {record.notes}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => deleteServiceRecord(record.id)}
                        className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-200 text-gray-500'}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* Reminders Tab */}
        {activeTab === 'reminders' && (
          <>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'} border`}>
              <div className="flex items-center gap-2 mb-2">
                <Bell className="w-5 h-5 text-blue-500" />
                <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.oilChangeReminder.reminderSettings', 'Reminder Settings')}</h4>
              </div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.oilChangeReminder.getNotifiedBeforeYourNext', 'Get notified before your next oil change is due')}
              </p>
            </div>

            <div className="space-y-4">
              <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.oilChangeReminder.mileageReminder', 'Mileage Reminder')}</h5>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('tools.oilChangeReminder.notifyWhen500MilesRemaining', 'Notify when 500 miles remaining')}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleReminder('1')}
                    className={`w-12 h-6 rounded-full transition-colors ${reminders.find((r) => r.id === '1')?.enabled ? 'bg-blue-500' : isDark ? 'bg-gray-600' : 'bg-gray-300'}`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white shadow transform transition-transform ${reminders.find((r) => r.id === '1')?.enabled ? 'translate-x-6' : 'translate-x-0.5'}`}
                    />
                  </button>
                </div>
              </div>

              <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.oilChangeReminder.dateReminder', 'Date Reminder')}</h5>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('tools.oilChangeReminder.notify7DaysBeforeDue', 'Notify 7 days before due date')}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleReminder('2')}
                    className={`w-12 h-6 rounded-full transition-colors ${reminders.find((r) => r.id === '2')?.enabled ? 'bg-blue-500' : isDark ? 'bg-gray-600' : 'bg-gray-300'}`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white shadow transform transition-transform ${reminders.find((r) => r.id === '2')?.enabled ? 'translate-x-6' : 'translate-x-0.5'}`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Current Status */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <h5 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.oilChangeReminder.currentStatus', 'Current Status')}</h5>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.oilChangeReminder.nextDueDate2', 'Next due date:')}</span>
                  <span className={isDark ? 'text-white' : 'text-gray-900'}>{calculations.nextDueDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.oilChangeReminder.nextDueMileage2', 'Next due mileage:')}</span>
                  <span className={isDark ? 'text-white' : 'text-gray-900'}>{calculations.nextDueMileage} mi</span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.oilChangeReminder.daysRemaining', 'Days remaining:')}</span>
                  <span className={getStatusColor(calculations.status)}>{calculations.daysRemaining} days</span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.oilChangeReminder.milesRemaining', 'Miles remaining:')}</span>
                  <span className={getStatusColor(calculations.status)}>{calculations.milesRemaining} mi</span>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
              <div className="flex items-start gap-2">
                <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <strong>{t('tools.oilChangeReminder.note', 'Note:')}</strong> Reminders are stored locally. Enable browser notifications for best experience.
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OilChangeReminderTool;
