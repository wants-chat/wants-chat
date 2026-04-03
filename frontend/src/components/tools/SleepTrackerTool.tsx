'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Moon,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  Clock,
  Heart,
  TrendingUp,
  BarChart3,
  Download,
  Search,
  Filter,
  Save,
  X,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useToolData } from '../../hooks/useToolData';
import type { ColumnConfig } from '../../lib/toolDataUtils';

// ============ INTERFACES ============
interface SleepTrackerToolProps {
  uiConfig?: UIConfig;
}

interface SleepRecord {
  id: string;
  date: string;
  bedTime: string;
  wakeTime: string;
  duration: number; // in minutes
  quality: 'poor' | 'fair' | 'good' | 'excellent';
  notes?: string;
  sleepCycles?: number;
  deepSleep?: number; // in minutes
  lightSleep?: number; // in minutes
  remSleep?: number; // in minutes
  createdAt: string;
}

type ActiveTab = 'overview' | 'add-sleep' | 'history' | 'analytics';

// ============ COLUMN CONFIGURATION ============
const SLEEP_COLUMNS: ColumnConfig[] = [
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'bedTime', header: 'Bed Time', type: 'string' },
  { key: 'wakeTime', header: 'Wake Time', type: 'string' },
  { key: 'duration', header: 'Duration (mins)', type: 'number' },
  { key: 'quality', header: 'Quality', type: 'string' },
  { key: 'sleepCycles', header: 'Cycles', type: 'number' },
  { key: 'notes', header: 'Notes', type: 'string' },
];

// ============ HELPER FUNCTIONS ============
const generateId = () => Math.random().toString(36).substring(2, 11);

const getCurrentDate = () => new Date().toISOString().split('T')[0];

const getQualityColor = (quality: string): string => {
  switch (quality) {
    case 'excellent':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'good':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'fair':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'poor':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};

const getQualityIcon = (quality: string) => {
  switch (quality) {
    case 'excellent':
      return <CheckCircle2 className="w-4 h-4" />;
    case 'good':
      return <CheckCircle2 className="w-4 h-4" />;
    case 'fair':
      return <AlertCircle className="w-4 h-4" />;
    case 'poor':
      return <AlertCircle className="w-4 h-4" />;
    default:
      return null;
  }
};

const calculateSleepDuration = (bedTime: string, wakeTime: string): number => {
  const [bedHours, bedMins] = bedTime.split(':').map(Number);
  const [wakeHours, wakeMins] = wakeTime.split(':').map(Number);

  let bedTotalMins = bedHours * 60 + bedMins;
  let wakeTotalMins = wakeHours * 60 + wakeMins;

  // If wake time is earlier than bed time, add 24 hours
  if (wakeTotalMins < bedTotalMins) {
    wakeTotalMins += 24 * 60;
  }

  return wakeTotalMins - bedTotalMins;
};

const calculateSleepCycles = (duration: number): number => {
  return Math.round(duration / 90);
};

// ============ MAIN COMPONENT ============
export const SleepTrackerTool: React.FC<SleepTrackerToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Use the useToolData hook for backend persistence
  const {
    data: sleepRecords,
    setData: setSleepRecords,
    addItem: addSleepRecord,
    updateItem: updateSleepRecord,
    deleteItem: deleteSleepRecord,
    exportCSV: exportSleepCSV,
    exportExcel: exportSleepExcel,
    exportJSON: exportSleepJSON,
    exportPDF: exportSleepPDF,
    copyToClipboard: copySleepToClipboard,
    print: printSleepData,
    isLoading,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<SleepRecord>('sleep-tracker-records', [], SLEEP_COLUMNS);

  // State
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');

  // Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchDate, setSearchDate] = useState('');
  const [filterQuality, setFilterQuality] = useState<string>('');

  // Form data
  const [formData, setFormData] = useState<Omit<SleepRecord, 'id' | 'createdAt'>>({
    date: getCurrentDate(),
    bedTime: '22:00',
    wakeTime: '06:00',
    duration: 480,
    quality: 'good',
    notes: '',
    sleepCycles: 5,
  });

  // ============ EFFECTS ============
  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params && !isPrefilled) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.date) {
        setFormData(prev => ({
          ...prev,
          date: params.date,
        }));
      }
      setIsPrefilled(true);
    }
  }, [uiConfig?.params, isPrefilled]);

  // ============ HANDLERS ============
  const handleAddRecord = useCallback(() => {
    const duration = calculateSleepDuration(formData.bedTime, formData.wakeTime);
    const cycles = calculateSleepCycles(duration);

    const newRecord: SleepRecord = {
      id: editingId || generateId(),
      date: formData.date,
      bedTime: formData.bedTime,
      wakeTime: formData.wakeTime,
      duration,
      quality: formData.quality as 'poor' | 'fair' | 'good' | 'excellent',
      notes: formData.notes,
      sleepCycles: cycles,
      createdAt: new Date().toISOString(),
    };

    if (editingId) {
      updateSleepRecord(editingId, newRecord);
      setEditingId(null);
    } else {
      addSleepRecord(newRecord);
    }

    setFormData({
      date: getCurrentDate(),
      bedTime: '22:00',
      wakeTime: '06:00',
      duration: 480,
      quality: 'good',
      notes: '',
      sleepCycles: 5,
    });
    setShowAddForm(false);
  }, [formData, editingId, addSleepRecord, updateSleepRecord]);

  const handleEditRecord = useCallback((record: SleepRecord) => {
    setFormData({
      date: record.date,
      bedTime: record.bedTime,
      wakeTime: record.wakeTime,
      duration: record.duration,
      quality: record.quality,
      notes: record.notes,
      sleepCycles: record.sleepCycles,
    });
    setEditingId(record.id);
    setShowAddForm(true);
  }, []);

  const handleDeleteRecord = useCallback(async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Sleep Record',
      message: 'Are you sure you want to delete this sleep record?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteSleepRecord(id);
    }
  }, [deleteSleepRecord, confirm]);

  const handleCancel = useCallback(() => {
    setShowAddForm(false);
    setEditingId(null);
    setFormData({
      date: getCurrentDate(),
      bedTime: '22:00',
      wakeTime: '06:00',
      duration: 480,
      quality: 'good',
      notes: '',
      sleepCycles: 5,
    });
  }, []);

  // ============ COMPUTED VALUES ============
  const filteredRecords = useMemo(() => {
    return sleepRecords.filter(record => {
      const matchesDate = !searchDate || record.date === searchDate;
      const matchesQuality = !filterQuality || record.quality === filterQuality;
      return matchesDate && matchesQuality;
    });
  }, [sleepRecords, searchDate, filterQuality]);

  const averageSleep = useMemo(() => {
    if (filteredRecords.length === 0) return 0;
    const total = filteredRecords.reduce((sum, record) => sum + record.duration, 0);
    return Math.round(total / filteredRecords.length);
  }, [filteredRecords]);

  const averageQuality = useMemo(() => {
    if (filteredRecords.length === 0) return 0;
    const qualityScore: Record<string, number> = {
      poor: 1,
      fair: 2,
      good: 3,
      excellent: 4,
    };
    const total = filteredRecords.reduce((sum, record) => sum + (qualityScore[record.quality] || 0), 0);
    return (total / filteredRecords.length).toFixed(1);
  }, [filteredRecords]);

  const totalNights = useMemo(() => filteredRecords.length, [filteredRecords]);

  const bestNight = useMemo(() => {
    if (filteredRecords.length === 0) return null;
    return filteredRecords.reduce((best, current) =>
      current.duration > best.duration ? current : best
    );
  }, [filteredRecords]);

  // ============ RENDER ============
  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Moon className={`w-8 h-8 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.sleepTracker.sleepTracker', 'Sleep Tracker')}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <WidgetEmbedButton toolSlug="sleep-tracker" toolName="Sleep Tracker" />

          <SyncStatus
            isSynced={isSynced}
            isSaving={isSaving}
            lastSaved={lastSaved}
            syncError={syncError}
            onForceSync={forceSync}
            theme={isDark ? 'dark' : 'light'}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        {(['overview', 'add-sleep', 'history', 'analytics'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? isDark
                  ? 'border-blue-500 text-blue-400'
                  : 'border-blue-600 text-blue-600'
                : isDark
                  ? 'border-transparent text-gray-400 hover:text-gray-300'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'overview' && 'Overview'}
            {tab === 'add-sleep' && 'Add Sleep'}
            {tab === 'history' && 'History'}
            {tab === 'analytics' && 'Analytics'}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Nights */}
            <div
              className={`p-4 rounded-lg border ${
                isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.sleepTracker.totalNights', 'Total Nights')}
                  </p>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {totalNights}
                  </p>
                </div>
                <Calendar className={`w-8 h-8 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
              </div>
            </div>

            {/* Average Sleep */}
            <div
              className={`p-4 rounded-lg border ${
                isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.sleepTracker.avgSleep', 'Avg Sleep')}
                  </p>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {Math.floor(averageSleep / 60)}h {averageSleep % 60}m
                  </p>
                </div>
                <Clock className={`w-8 h-8 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
              </div>
            </div>

            {/* Quality Score */}
            <div
              className={`p-4 rounded-lg border ${
                isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.sleepTracker.avgQuality', 'Avg Quality')}
                  </p>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {averageQuality}/4
                  </p>
                </div>
                <Heart className={`w-8 h-8 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
              </div>
            </div>

            {/* Best Night */}
            <div
              className={`p-4 rounded-lg border ${
                isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.sleepTracker.bestNight', 'Best Night')}
                  </p>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {bestNight ? `${Math.floor(bestNight.duration / 60)}h` : '—'}
                  </p>
                </div>
                <TrendingUp className={`w-8 h-8 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              setShowAddForm(true);
              setActiveTab('add-sleep');
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            {t('tools.sleepTracker.logSleep', 'Log Sleep')}
          </button>
        </div>
      )}

      {/* Add Sleep Tab */}
      {activeTab === 'add-sleep' && (
        <div
          className={`p-6 rounded-lg border ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
          }`}
        >
          <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {editingId ? t('tools.sleepTracker.editSleepRecord', 'Edit Sleep Record') : t('tools.sleepTracker.logSleep2', 'Log Sleep')}
          </h2>

          <div className="space-y-4">
            {/* Date */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.sleepTracker.date', 'Date')}
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>

            {/* Bed Time */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.sleepTracker.bedTime', 'Bed Time')}
              </label>
              <input
                type="time"
                value={formData.bedTime}
                onChange={(e) => setFormData({ ...formData, bedTime: e.target.value })}
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>

            {/* Wake Time */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.sleepTracker.wakeTime', 'Wake Time')}
              </label>
              <input
                type="time"
                value={formData.wakeTime}
                onChange={(e) => setFormData({ ...formData, wakeTime: e.target.value })}
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>

            {/* Quality */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.sleepTracker.sleepQuality', 'Sleep Quality')}
              </label>
              <select
                value={formData.quality}
                onChange={(e) => setFormData({ ...formData, quality: e.target.value })}
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="poor">{t('tools.sleepTracker.poor', 'Poor')}</option>
                <option value="fair">{t('tools.sleepTracker.fair', 'Fair')}</option>
                <option value="good">{t('tools.sleepTracker.good', 'Good')}</option>
                <option value="excellent">{t('tools.sleepTracker.excellent', 'Excellent')}</option>
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.sleepTracker.notes', 'Notes')}
              </label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder={t('tools.sleepTracker.anyNotesAboutYourSleep', 'Any notes about your sleep...')}
                rows={3}
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                }`}
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleAddRecord}
                disabled={isSaving}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : editingId ? t('tools.sleepTracker.update', 'Update') : t('tools.sleepTracker.add', 'Add')}
              </button>
              <button
                onClick={handleCancel}
                className={`flex-1 font-medium py-2 rounded-lg transition-colors ${
                  isDark
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                }`}
              >
                {t('tools.sleepTracker.cancel', 'Cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <input
                type="date"
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
                placeholder={t('tools.sleepTracker.filterByDate', 'Filter by date')}
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDark
                    ? 'bg-gray-800 border-gray-700 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>
            <select
              value={filterQuality}
              onChange={(e) => setFilterQuality(e.target.value)}
              className={`px-3 py-2 rounded-lg border ${
                isDark
                  ? 'bg-gray-800 border-gray-700 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="">{t('tools.sleepTracker.allQualities', 'All Qualities')}</option>
              <option value="poor">{t('tools.sleepTracker.poor2', 'Poor')}</option>
              <option value="fair">{t('tools.sleepTracker.fair2', 'Fair')}</option>
              <option value="good">{t('tools.sleepTracker.good2', 'Good')}</option>
              <option value="excellent">{t('tools.sleepTracker.excellent2', 'Excellent')}</option>
            </select>
          </div>

          {/* Records Table */}
          {filteredRecords.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
              <table className="w-full">
                <thead>
                  <tr className={isDark ? 'bg-gray-800' : 'bg-gray-50'}>
                    <th className={`px-4 py-3 text-left text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.sleepTracker.date2', 'Date')}
                    </th>
                    <th className={`px-4 py-3 text-left text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.sleepTracker.bedTime2', 'Bed Time')}
                    </th>
                    <th className={`px-4 py-3 text-left text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.sleepTracker.wakeTime2', 'Wake Time')}
                    </th>
                    <th className={`px-4 py-3 text-left text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.sleepTracker.duration', 'Duration')}
                    </th>
                    <th className={`px-4 py-3 text-left text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.sleepTracker.quality', 'Quality')}
                    </th>
                    <th className={`px-4 py-3 text-left text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.sleepTracker.actions', 'Actions')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((record) => (
                    <tr
                      key={record.id}
                      className={`border-t ${isDark ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-200 hover:bg-gray-50'}`}
                    >
                      <td className={`px-4 py-3 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {new Date(record.date).toLocaleDateString()}
                      </td>
                      <td className={`px-4 py-3 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {record.bedTime}
                      </td>
                      <td className={`px-4 py-3 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {record.wakeTime}
                      </td>
                      <td className={`px-4 py-3 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {Math.floor(record.duration / 60)}h {record.duration % 60}m
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getQualityColor(record.quality)}`}>
                          {getQualityIcon(record.quality)}
                          {record.quality.charAt(0).toUpperCase() + record.quality.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm flex gap-2">
                        <button
                          onClick={() => handleEditRecord(record)}
                          className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900 rounded transition-colors"
                          title={t('tools.sleepTracker.edit', 'Edit')}
                        >
                          <Edit2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </button>
                        <button
                          onClick={() => handleDeleteRecord(record.id)}
                          className="p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div
              className={`text-center py-8 rounded-lg border ${
                isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
              }`}
            >
              <Moon className={`w-12 h-12 mx-auto mb-2 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
              <p className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {t('tools.sleepTracker.noSleepRecordsFound', 'No sleep records found')}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sleep Quality Distribution */}
            <div
              className={`p-6 rounded-lg border ${
                isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
              }`}
            >
              <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.sleepTracker.qualityDistribution', 'Quality Distribution')}
              </h3>
              <div className="space-y-2">
                {['excellent', 'good', 'fair', 'poor'].map(quality => {
                  const count = filteredRecords.filter(r => r.quality === quality).length;
                  const percentage = filteredRecords.length > 0 ? (count / filteredRecords.length) * 100 : 0;
                  return (
                    <div key={quality}>
                      <div className="flex justify-between mb-1">
                        <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          {quality.charAt(0).toUpperCase() + quality.slice(1)}
                        </span>
                        <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {count}
                        </span>
                      </div>
                      <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                        <div
                          className={`h-full transition-all ${
                            quality === 'excellent'
                              ? 'bg-green-500'
                              : quality === 'good'
                                ? 'bg-blue-500'
                                : quality === 'fair'
                                  ? 'bg-yellow-500'
                                  : 'bg-red-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sleep Duration Trends */}
            <div
              className={`p-6 rounded-lg border ${
                isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
              }`}
            >
              <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.sleepTracker.recentSleepDuration', 'Recent Sleep Duration')}
              </h3>
              <div className="space-y-2">
                {filteredRecords.slice(-5).reverse().map(record => (
                  <div key={record.id} className="flex items-center gap-2">
                    <span className={`text-sm w-20 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <div className={`flex-1 h-6 rounded-full overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <div
                        className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
                        style={{ width: `${(record.duration / 600) * 100}%` }}
                      />
                    </div>
                    <span className={`text-sm font-medium w-16 text-right ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {Math.floor(record.duration / 60)}h
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Export Options */}
          <div className="flex gap-3">
            <ExportDropdown
              onExportCSV={() => exportSleepCSV()}
              onExportExcel={() => exportSleepExcel()}
              onExportJSON={() => exportSleepJSON()}
              onExportPDF={() => exportSleepPDF()}
              onCopyToClipboard={() => copySleepToClipboard()}
              onPrint={() => printSleepData()}
              label="Export Sleep Data"
            />
          </div>
        </div>
      )}
      <ConfirmDialog />
    </div>
  );
};

export default SleepTrackerTool;
