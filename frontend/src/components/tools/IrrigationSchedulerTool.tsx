'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Droplets,
  Plus,
  Trash2,
  Edit2,
  Search,
  Calendar,
  Clock,
  Sun,
  CloudRain,
  AlertTriangle,
  CheckCircle,
  X,
  Play,
  Pause,
  Settings,
  BarChart3,
  Thermometer
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { useToolData } from '../../hooks/useToolData';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { type ColumnConfig } from '../../lib/toolDataUtils';

interface IrrigationSchedulerToolProps {
  uiConfig?: UIConfig;
}

type IrrigationMethod = 'drip' | 'sprinkler' | 'flood' | 'center_pivot' | 'manual' | 'soaker_hose';
type ScheduleStatus = 'active' | 'paused' | 'completed' | 'skipped';
type Frequency = 'daily' | 'every_other_day' | 'twice_weekly' | 'weekly' | 'custom';
type ActiveTab = 'schedules' | 'zones' | 'history' | 'settings';

interface IrrigationSchedule {
  id: string;
  zoneName: string;
  fieldName: string;
  method: IrrigationMethod;
  frequency: Frequency;
  startTime: string;
  duration: number; // minutes
  waterAmount: number; // gallons
  cropType: string;
  soilMoistureTrigger: number; // percentage
  status: ScheduleStatus;
  nextRun: string;
  lastRun: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface IrrigationLog {
  id: string;
  scheduleId: string;
  zoneName: string;
  startTime: string;
  endTime: string;
  waterUsed: number;
  status: 'completed' | 'partial' | 'failed';
  notes: string;
}

const generateId = () => Math.random().toString(36).substring(2, 11);

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatTime = (timeString: string) => {
  if (!timeString) return '';
  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

const methodLabels: Record<IrrigationMethod, { name: string; efficiency: number }> = {
  drip: { name: 'Drip Irrigation', efficiency: 95 },
  sprinkler: { name: 'Sprinkler', efficiency: 75 },
  flood: { name: 'Flood/Furrow', efficiency: 60 },
  center_pivot: { name: 'Center Pivot', efficiency: 85 },
  manual: { name: 'Manual Watering', efficiency: 70 },
  soaker_hose: { name: 'Soaker Hose', efficiency: 90 }
};

const frequencyLabels: Record<Frequency, string> = {
  daily: 'Daily',
  every_other_day: 'Every Other Day',
  twice_weekly: 'Twice Weekly',
  weekly: 'Weekly',
  custom: 'Custom'
};

const statusColors: Record<ScheduleStatus, { bg: string; text: string }> = {
  active: { bg: 'bg-green-500/20', text: 'text-green-500' },
  paused: { bg: 'bg-amber-500/20', text: 'text-amber-500' },
  completed: { bg: 'bg-blue-500/20', text: 'text-blue-500' },
  skipped: { bg: 'bg-gray-500/20', text: 'text-gray-500' }
};

const scheduleColumns: ColumnConfig[] = [
  { key: 'zoneName', header: 'Zone', type: 'string' },
  { key: 'fieldName', header: 'Field', type: 'string' },
  { key: 'method', header: 'Method', type: 'string' },
  { key: 'frequency', header: 'Frequency', type: 'string' },
  { key: 'startTime', header: 'Start Time', type: 'string' },
  { key: 'duration', header: 'Duration (min)', type: 'number' },
  { key: 'waterAmount', header: 'Water (gal)', type: 'number' },
  { key: 'cropType', header: 'Crop', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'nextRun', header: 'Next Run', type: 'date' },
  { key: 'lastRun', header: 'Last Run', type: 'date' },
  { key: 'notes', header: 'Notes', type: 'string' }
];

const generateSampleSchedules = (): IrrigationSchedule[] => [
  {
    id: generateId(),
    zoneName: 'Zone A - North',
    fieldName: 'North Field',
    method: 'drip',
    frequency: 'daily',
    startTime: '06:00',
    duration: 45,
    waterAmount: 500,
    cropType: 'Tomatoes',
    soilMoistureTrigger: 40,
    status: 'active',
    nextRun: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
    lastRun: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    notes: 'Morning irrigation for vegetables',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: generateId(),
    zoneName: 'Zone B - South',
    fieldName: 'South Field',
    method: 'sprinkler',
    frequency: 'every_other_day',
    startTime: '05:30',
    duration: 60,
    waterAmount: 800,
    cropType: 'Corn',
    soilMoistureTrigger: 35,
    status: 'active',
    nextRun: new Date(Date.now() + 36 * 60 * 60 * 1000).toISOString(),
    lastRun: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Rotating sprinkler coverage',
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: generateId(),
    zoneName: 'Zone C - Orchard',
    fieldName: 'Orchard',
    method: 'drip',
    frequency: 'twice_weekly',
    startTime: '07:00',
    duration: 90,
    waterAmount: 1200,
    cropType: 'Apple Trees',
    soilMoistureTrigger: 45,
    status: 'paused',
    nextRun: '',
    lastRun: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Paused due to recent rainfall',
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export function IrrigationSchedulerTool({ uiConfig }: IrrigationSchedulerToolProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const {
    data: schedules,
    addItem: addSchedule,
    updateItem: updateSchedule,
    deleteItem: deleteSchedule,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    print,
    isLoading,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    forceSync
  } = useToolData<IrrigationSchedule>('irrigation-scheduler', generateSampleSchedules(), scheduleColumns);

  const [logs, setLogs] = useState<IrrigationLog[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('irrigation-logs');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('schedules');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ScheduleStatus | 'all'>('all');
  const [showAddForm, setShowAddForm] = useState(false);

  const [newSchedule, setNewSchedule] = useState<Omit<IrrigationSchedule, 'id' | 'createdAt' | 'updatedAt' | 'nextRun' | 'lastRun'>>({
    zoneName: '',
    fieldName: '',
    method: 'drip',
    frequency: 'daily',
    startTime: '06:00',
    duration: 30,
    waterAmount: 100,
    cropType: '',
    soilMoistureTrigger: 40,
    status: 'active',
    notes: ''
  });

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('irrigation-logs', JSON.stringify(logs));
    }
  }, [logs]);

  React.useEffect(() => {
    if (uiConfig?.params || (uiConfig as any)?.toolPrefillData) {
      const prefillData = (uiConfig as any)?.toolPrefillData || uiConfig?.params;
      if (prefillData?.zoneName) {
        setNewSchedule(prev => ({ ...prev, zoneName: prefillData.zoneName }));
        setShowAddForm(true);
      }
    }
  }, [uiConfig]);

  const filteredSchedules = useMemo(() => {
    return schedules.filter(s => {
      const matchesSearch = s.zoneName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.fieldName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.cropType.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [schedules, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    const activeSchedules = schedules.filter(s => s.status === 'active').length;
    const totalWaterDaily = schedules
      .filter(s => s.status === 'active' && s.frequency === 'daily')
      .reduce((sum, s) => sum + s.waterAmount, 0);
    const avgDuration = schedules.length > 0
      ? schedules.reduce((sum, s) => sum + s.duration, 0) / schedules.length
      : 0;

    return {
      totalSchedules: schedules.length,
      activeSchedules,
      totalWaterDaily,
      avgDuration
    };
  }, [schedules]);

  const handleAddSchedule = () => {
    if (!newSchedule.zoneName.trim()) return;

    const schedule: IrrigationSchedule = {
      ...newSchedule,
      id: generateId(),
      nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      lastRun: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    addSchedule(schedule);
    setNewSchedule({
      zoneName: '',
      fieldName: '',
      method: 'drip',
      frequency: 'daily',
      startTime: '06:00',
      duration: 30,
      waterAmount: 100,
      cropType: '',
      soilMoistureTrigger: 40,
      status: 'active',
      notes: ''
    });
    setShowAddForm(false);
  };

  const toggleScheduleStatus = (id: string, currentStatus: ScheduleStatus) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    updateSchedule(id, { status: newStatus, updatedAt: new Date().toISOString() });
  };

  const tabs = [
    { id: 'schedules' as ActiveTab, label: 'Schedules', icon: Calendar },
    { id: 'zones' as ActiveTab, label: 'Zones', icon: Droplets },
    { id: 'history' as ActiveTab, label: 'History', icon: Clock },
    { id: 'settings' as ActiveTab, label: 'Settings', icon: Settings }
  ];

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center h-64 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mr-3"></div>
        {t('tools.irrigationScheduler.loadingIrrigationData', 'Loading irrigation data...')}
      </div>
    );
  }

  return (
    <div className={`max-w-7xl mx-auto p-4 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isDark ? 'bg-cyan-500/20' : 'bg-cyan-100'}`}>
            <Droplets className="w-6 h-6 text-cyan-500" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.irrigationScheduler.irrigationScheduler', 'Irrigation Scheduler')}
            </h1>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.irrigationScheduler.manageWateringSchedulesForYour', 'Manage watering schedules for your fields')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <WidgetEmbedButton toolSlug="irrigation-scheduler" toolName="Irrigation Scheduler" />

          <SyncStatus
            isSynced={isSynced}
            isSaving={isSaving}
            lastSaved={lastSaved}
            error={syncError}
            onRetry={forceSync}
          />
          <ExportDropdown
            onExportCSV={exportCSV}
            onExportExcel={exportExcel}
            onExportJSON={exportJSON}
            onExportPDF={exportPDF}
            onPrint={print}
          />
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t('tools.irrigationScheduler.addSchedule', 'Add Schedule')}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
              <Calendar className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.irrigationScheduler.totalSchedules', 'Total Schedules')}</p>
              <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {stats.totalSchedules}
              </p>
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-green-500/20' : 'bg-green-100'}`}>
              <Play className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.irrigationScheduler.active', 'Active')}</p>
              <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {stats.activeSchedules}
              </p>
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-cyan-500/20' : 'bg-cyan-100'}`}>
              <Droplets className="w-5 h-5 text-cyan-500" />
            </div>
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.irrigationScheduler.dailyWater', 'Daily Water')}</p>
              <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {stats.totalWaterDaily.toLocaleString()} gal
              </p>
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-amber-500/20' : 'bg-amber-100'}`}>
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.irrigationScheduler.avgDuration', 'Avg Duration')}</p>
              <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {stats.avgDuration.toFixed(0)} min
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={`flex gap-1 p-1 rounded-lg mb-6 ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === tab.id
                ? 'bg-cyan-500 text-white'
                : isDark
                  ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-300'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Search and Filters */}
      {activeTab === 'schedules' && (
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
            <input
              type="text"
              placeholder={t('tools.irrigationScheduler.searchSchedules', 'Search schedules...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                isDark
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                  : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
              } focus:outline-none focus:ring-2 focus:ring-cyan-500`}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ScheduleStatus | 'all')}
            className={`px-4 py-2 rounded-lg border ${
              isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'
            }`}
          >
            <option value="all">{t('tools.irrigationScheduler.allStatus', 'All Status')}</option>
            <option value="active">{t('tools.irrigationScheduler.active2', 'Active')}</option>
            <option value="paused">{t('tools.irrigationScheduler.paused', 'Paused')}</option>
            <option value="completed">{t('tools.irrigationScheduler.completed', 'Completed')}</option>
          </select>
        </div>
      )}

      {/* Content */}
      {activeTab === 'schedules' && (
        <div className="space-y-4">
          {filteredSchedules.length === 0 ? (
            <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              <Droplets className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">{t('tools.irrigationScheduler.noSchedulesFound', 'No schedules found')}</p>
              <p className="text-sm">{t('tools.irrigationScheduler.addAnIrrigationScheduleTo', 'Add an irrigation schedule to get started')}</p>
            </div>
          ) : (
            filteredSchedules.map(schedule => (
              <div key={schedule.id} className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <Droplets className="w-5 h-5 text-cyan-500" />
                    </div>
                    <div>
                      <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {schedule.zoneName}
                      </h3>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {schedule.fieldName} - {schedule.cropType}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${statusColors[schedule.status].bg} ${statusColors[schedule.status].text}`}>
                      {schedule.status}
                    </span>
                    <button
                      onClick={() => toggleScheduleStatus(schedule.id, schedule.status)}
                      className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                    >
                      {schedule.status === 'active' ? (
                        <Pause className="w-4 h-4 text-amber-500" />
                      ) : (
                        <Play className="w-4 h-4 text-green-500" />
                      )}
                    </button>
                    <button
                      onClick={() => deleteSchedule(schedule.id)}
                      className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
                  <div>
                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.irrigationScheduler.method', 'Method')}</p>
                    <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {methodLabels[schedule.method].name}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.irrigationScheduler.frequency', 'Frequency')}</p>
                    <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {frequencyLabels[schedule.frequency]}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.irrigationScheduler.startTime', 'Start Time')}</p>
                    <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {formatTime(schedule.startTime)}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.irrigationScheduler.duration', 'Duration')}</p>
                    <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {schedule.duration} min
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.irrigationScheduler.waterAmount', 'Water Amount')}</p>
                    <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {schedule.waterAmount} gal
                    </p>
                  </div>
                </div>

                {schedule.nextRun && (
                  <div className={`mt-3 pt-3 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      Next Run: {formatDate(schedule.nextRun)} at {formatTime(schedule.startTime)}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'zones' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {schedules.map(schedule => (
            <div key={schedule.id} className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {schedule.zoneName}
                </h3>
                <span className={`w-3 h-3 rounded-full ${schedule.status === 'active' ? 'bg-green-500' : 'bg-amber-500'}`}></span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.irrigationScheduler.field', 'Field')}</span>
                  <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{schedule.fieldName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.irrigationScheduler.crop', 'Crop')}</span>
                  <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{schedule.cropType}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.irrigationScheduler.method2', 'Method')}</span>
                  <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{methodLabels[schedule.method].name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.irrigationScheduler.efficiency', 'Efficiency')}</span>
                  <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{methodLabels[schedule.method].efficiency}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'history' && (
        <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          {logs.length === 0 ? (
            <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">{t('tools.irrigationScheduler.noIrrigationHistory', 'No irrigation history')}</p>
              <p className="text-sm">{t('tools.irrigationScheduler.completedIrrigationRunsWillAppear', 'Completed irrigation runs will appear here')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map(log => (
                <div key={log.id} className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex justify-between items-center">
                    <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{log.zoneName}</span>
                    <span className={`text-sm ${log.status === 'completed' ? 'text-green-500' : 'text-amber-500'}`}>
                      {log.status}
                    </span>
                  </div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {formatDate(log.startTime)} - {log.waterUsed} gallons used
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'settings' && (
        <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <h3 className={`font-semibold text-lg mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.irrigationScheduler.irrigationSettings', 'Irrigation Settings')}
          </h3>
          <div className="space-y-4">
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.irrigationScheduler.weatherIntegration', 'Weather Integration')}
              </h4>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.irrigationScheduler.automaticallySkipIrrigationWhenRain', 'Automatically skip irrigation when rain is forecasted')}
              </p>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.irrigationScheduler.soilMoistureSensors', 'Soil Moisture Sensors')}
              </h4>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.irrigationScheduler.configureSoilMoistureThresholdsFor', 'Configure soil moisture thresholds for smart irrigation')}
              </p>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.irrigationScheduler.notifications', 'Notifications')}
              </h4>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.irrigationScheduler.getAlertsForIrrigationStart', 'Get alerts for irrigation start, completion, and issues')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Add Schedule Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} p-6`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.irrigationScheduler.addIrrigationSchedule', 'Add Irrigation Schedule')}
              </h2>
              <button onClick={() => setShowAddForm(false)} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.irrigationScheduler.zoneName', 'Zone Name *')}</label>
                  <input
                    type="text"
                    value={newSchedule.zoneName}
                    onChange={(e) => setNewSchedule(prev => ({ ...prev, zoneName: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                    placeholder={t('tools.irrigationScheduler.eGZoneANorth', 'e.g., Zone A - North')}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.irrigationScheduler.fieldName', 'Field Name')}</label>
                  <input
                    type="text"
                    value={newSchedule.fieldName}
                    onChange={(e) => setNewSchedule(prev => ({ ...prev, fieldName: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.irrigationScheduler.method3', 'Method')}</label>
                  <select
                    value={newSchedule.method}
                    onChange={(e) => setNewSchedule(prev => ({ ...prev, method: e.target.value as IrrigationMethod }))}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                  >
                    {Object.entries(methodLabels).map(([key, { name }]) => (
                      <option key={key} value={key}>{name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.irrigationScheduler.frequency2', 'Frequency')}</label>
                  <select
                    value={newSchedule.frequency}
                    onChange={(e) => setNewSchedule(prev => ({ ...prev, frequency: e.target.value as Frequency }))}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                  >
                    {Object.entries(frequencyLabels).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.irrigationScheduler.startTime2', 'Start Time')}</label>
                  <input
                    type="time"
                    value={newSchedule.startTime}
                    onChange={(e) => setNewSchedule(prev => ({ ...prev, startTime: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.irrigationScheduler.durationMin', 'Duration (min)')}</label>
                  <input
                    type="number"
                    value={newSchedule.duration}
                    onChange={(e) => setNewSchedule(prev => ({ ...prev, duration: parseInt(e.target.value) || 30 }))}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.irrigationScheduler.waterGallons', 'Water (gallons)')}</label>
                  <input
                    type="number"
                    value={newSchedule.waterAmount}
                    onChange={(e) => setNewSchedule(prev => ({ ...prev, waterAmount: parseInt(e.target.value) || 100 }))}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.irrigationScheduler.cropType', 'Crop Type')}</label>
                <input
                  type="text"
                  value={newSchedule.cropType}
                  onChange={(e) => setNewSchedule(prev => ({ ...prev, cropType: e.target.value }))}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                  placeholder={t('tools.irrigationScheduler.eGTomatoes', 'e.g., Tomatoes')}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.irrigationScheduler.notes', 'Notes')}</label>
                <textarea
                  value={newSchedule.notes}
                  onChange={(e) => setNewSchedule(prev => ({ ...prev, notes: e.target.value }))}
                  rows={2}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  onClick={() => setShowAddForm(false)}
                  className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'}`}
                >
                  {t('tools.irrigationScheduler.cancel', 'Cancel')}
                </button>
                <button
                  onClick={handleAddSchedule}
                  disabled={!newSchedule.zoneName.trim()}
                  className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 disabled:opacity-50"
                >
                  {t('tools.irrigationScheduler.addSchedule2', 'Add Schedule')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default IrrigationSchedulerTool;
