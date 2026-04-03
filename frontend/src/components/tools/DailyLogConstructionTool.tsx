'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  ClipboardList,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Calendar,
  Clock,
  Cloud,
  Sun,
  CloudRain,
  CloudSnow,
  Wind,
  Thermometer,
  Users,
  HardHat,
  Truck,
  Camera,
  FileText,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle,
  Sparkles,
} from 'lucide-react';
import { UIConfig } from '../ContextualUI';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import useToolData from '../../hooks/useToolData';
import { useTheme } from '@/contexts/ThemeContext';
import { type ColumnConfig } from '../../lib/toolDataUtils';

interface DailyLogConstructionToolProps {
  uiConfig?: UIConfig;
}

// Types
type WeatherCondition = 'sunny' | 'cloudy' | 'partly-cloudy' | 'rainy' | 'stormy' | 'snowy' | 'windy' | 'foggy';
type WorkStatus = 'on-schedule' | 'ahead' | 'behind' | 'delayed';

interface CrewMember {
  id: string;
  name: string;
  role: string;
  hoursWorked: number;
  overtime: number;
}

interface EquipmentEntry {
  id: string;
  name: string;
  hoursUsed: number;
  status: 'active' | 'idle' | 'maintenance' | 'breakdown';
  notes: string;
}

interface DeliveryEntry {
  id: string;
  supplier: string;
  materials: string;
  quantity: string;
  receivedBy: string;
  time: string;
}

interface WorkEntry {
  id: string;
  location: string;
  description: string;
  percentComplete: number;
  notes: string;
}

interface IncidentEntry {
  id: string;
  type: 'injury' | 'near-miss' | 'property-damage' | 'environmental' | 'other';
  description: string;
  severity: 'minor' | 'moderate' | 'serious';
  reportedBy: string;
  actionTaken: string;
}

interface DailyLog {
  id: string;
  projectName: string;
  projectNumber: string;
  date: string;
  preparedBy: string;
  superintendent: string;
  weather: {
    condition: WeatherCondition;
    temperatureHigh: number;
    temperatureLow: number;
    precipitation: number;
    windSpeed: number;
    workableDay: boolean;
  };
  workStatus: WorkStatus;
  crew: CrewMember[];
  totalManHours: number;
  equipment: EquipmentEntry[];
  deliveries: DeliveryEntry[];
  workPerformed: WorkEntry[];
  incidents: IncidentEntry[];
  visitors: string;
  inspections: string;
  delays: string;
  notes: string;
  photos: string[];
  createdAt: string;
  updatedAt: string;
}

// Constants
const WEATHER_CONDITIONS: { condition: WeatherCondition; label: string; icon: React.FC<any> }[] = [
  { condition: 'sunny', label: 'Sunny', icon: Sun },
  { condition: 'cloudy', label: 'Cloudy', icon: Cloud },
  { condition: 'partly-cloudy', label: 'Partly Cloudy', icon: Cloud },
  { condition: 'rainy', label: 'Rainy', icon: CloudRain },
  { condition: 'stormy', label: 'Stormy', icon: CloudRain },
  { condition: 'snowy', label: 'Snowy', icon: CloudSnow },
  { condition: 'windy', label: 'Windy', icon: Wind },
  { condition: 'foggy', label: 'Foggy', icon: Cloud },
];

const CREW_ROLES = [
  'Superintendent',
  'Foreman',
  'Journeyman',
  'Apprentice',
  'Laborer',
  'Operator',
  'Electrician',
  'Plumber',
  'Carpenter',
  'Mason',
  'Ironworker',
  'Safety Officer',
];

// Column configuration for exports
const LOG_COLUMNS: ColumnConfig[] = [
  { key: 'projectName', header: 'Project Name', type: 'string' },
  { key: 'projectNumber', header: 'Project #', type: 'string' },
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'preparedBy', header: 'Prepared By', type: 'string' },
  { key: 'totalManHours', header: 'Man Hours', type: 'number' },
  { key: 'workStatus', header: 'Status', type: 'string' },
  { key: 'createdAt', header: 'Created', type: 'date' },
];

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);

const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const getStatusColor = (status: WorkStatus, isDark: boolean) => {
  const colors = {
    'on-schedule': isDark ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-700',
    'ahead': isDark ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-700',
    'behind': isDark ? 'bg-yellow-900 text-yellow-300' : 'bg-yellow-100 text-yellow-700',
    'delayed': isDark ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-700',
  };
  return colors[status];
};

// Main Component
export const DailyLogConstructionTool: React.FC<DailyLogConstructionToolProps> = ({ uiConfig }) => {
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // useToolData hook for backend sync
  const {
    data: logs,
    addItem: addLogToBackend,
    updateItem: updateLogBackend,
    deleteItem: deleteLogBackend,
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
  } = useToolData<DailyLog>('daily-construction-logs', [], LOG_COLUMNS);

  // Local UI State
  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>('weather');

  // Form state
  const [formData, setFormData] = useState<Partial<DailyLog>>({
    projectName: '',
    projectNumber: '',
    date: new Date().toISOString().split('T')[0],
    preparedBy: '',
    superintendent: '',
    weather: {
      condition: 'sunny',
      temperatureHigh: 75,
      temperatureLow: 55,
      precipitation: 0,
      windSpeed: 5,
      workableDay: true,
    },
    workStatus: 'on-schedule',
    crew: [],
    totalManHours: 0,
    equipment: [],
    deliveries: [],
    workPerformed: [],
    incidents: [],
    visitors: '',
    inspections: '',
    delays: '',
    notes: '',
    photos: [],
  });

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params;
      setFormData((prev) => ({
        ...prev,
        projectName: params.projectName || params.project || '',
        projectNumber: params.projectNumber || '',
        date: params.date || new Date().toISOString().split('T')[0],
      }));
      setActiveTab('create');
      setIsPrefilled(true);
    }
  }, [uiConfig?.params]);

  // Calculate total man hours
  const calculateManHours = (crew: CrewMember[]) => {
    return crew.reduce((total, member) => total + member.hoursWorked + member.overtime, 0);
  };

  // Add crew member
  const addCrewMember = () => {
    const member: CrewMember = {
      id: generateId(),
      name: '',
      role: 'Laborer',
      hoursWorked: 8,
      overtime: 0,
    };
    const updatedCrew = [...(formData.crew || []), member];
    setFormData((prev) => ({
      ...prev,
      crew: updatedCrew,
      totalManHours: calculateManHours(updatedCrew),
    }));
  };

  // Update crew member
  const updateCrewMember = (id: string, updates: Partial<CrewMember>) => {
    const updatedCrew = (formData.crew || []).map((member) =>
      member.id === id ? { ...member, ...updates } : member
    );
    setFormData((prev) => ({
      ...prev,
      crew: updatedCrew,
      totalManHours: calculateManHours(updatedCrew),
    }));
  };

  // Remove crew member
  const removeCrewMember = (id: string) => {
    const updatedCrew = (formData.crew || []).filter((member) => member.id !== id);
    setFormData((prev) => ({
      ...prev,
      crew: updatedCrew,
      totalManHours: calculateManHours(updatedCrew),
    }));
  };

  // Add equipment
  const addEquipment = () => {
    const equipment: EquipmentEntry = {
      id: generateId(),
      name: '',
      hoursUsed: 0,
      status: 'active',
      notes: '',
    };
    setFormData((prev) => ({
      ...prev,
      equipment: [...(prev.equipment || []), equipment],
    }));
  };

  // Add delivery
  const addDelivery = () => {
    const delivery: DeliveryEntry = {
      id: generateId(),
      supplier: '',
      materials: '',
      quantity: '',
      receivedBy: '',
      time: '',
    };
    setFormData((prev) => ({
      ...prev,
      deliveries: [...(prev.deliveries || []), delivery],
    }));
  };

  // Add work entry
  const addWorkEntry = () => {
    const work: WorkEntry = {
      id: generateId(),
      location: '',
      description: '',
      percentComplete: 0,
      notes: '',
    };
    setFormData((prev) => ({
      ...prev,
      workPerformed: [...(prev.workPerformed || []), work],
    }));
  };

  // Add incident
  const addIncident = () => {
    const incident: IncidentEntry = {
      id: generateId(),
      type: 'near-miss',
      description: '',
      severity: 'minor',
      reportedBy: '',
      actionTaken: '',
    };
    setFormData((prev) => ({
      ...prev,
      incidents: [...(prev.incidents || []), incident],
    }));
  };

  // Save log
  const saveLog = () => {
    if (!formData.projectName || !formData.date) {
      setValidationMessage('Please fill in required fields (Project Name, Date)');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const now = new Date().toISOString();
    const log: DailyLog = {
      id: selectedLogId || generateId(),
      projectName: formData.projectName || '',
      projectNumber: formData.projectNumber || '',
      date: formData.date || now.split('T')[0],
      preparedBy: formData.preparedBy || '',
      superintendent: formData.superintendent || '',
      weather: formData.weather || {
        condition: 'sunny',
        temperatureHigh: 75,
        temperatureLow: 55,
        precipitation: 0,
        windSpeed: 5,
        workableDay: true,
      },
      workStatus: formData.workStatus || 'on-schedule',
      crew: formData.crew || [],
      totalManHours: formData.totalManHours || 0,
      equipment: formData.equipment || [],
      deliveries: formData.deliveries || [],
      workPerformed: formData.workPerformed || [],
      incidents: formData.incidents || [],
      visitors: formData.visitors || '',
      inspections: formData.inspections || '',
      delays: formData.delays || '',
      notes: formData.notes || '',
      photos: formData.photos || [],
      createdAt: selectedLogId ? logs.find((l) => l.id === selectedLogId)?.createdAt || now : now,
      updatedAt: now,
    };

    if (selectedLogId) {
      updateLogBackend(selectedLogId, log);
    } else {
      addLogToBackend(log);
    }

    resetForm();
    setActiveTab('list');
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      projectName: '',
      projectNumber: '',
      date: new Date().toISOString().split('T')[0],
      preparedBy: '',
      superintendent: '',
      weather: {
        condition: 'sunny',
        temperatureHigh: 75,
        temperatureLow: 55,
        precipitation: 0,
        windSpeed: 5,
        workableDay: true,
      },
      workStatus: 'on-schedule',
      crew: [],
      totalManHours: 0,
      equipment: [],
      deliveries: [],
      workPerformed: [],
      incidents: [],
      visitors: '',
      inspections: '',
      delays: '',
      notes: '',
      photos: [],
    });
    setSelectedLogId(null);
    setIsPrefilled(false);
    setActiveSection('weather');
  };

  // Edit log
  const editLog = (log: DailyLog) => {
    setFormData(log);
    setSelectedLogId(log.id);
    setActiveTab('create');
  };

  // Delete log
  const deleteLog = useCallback(async (logId: string) => {
    const confirmed = await confirm({
      title: 'Delete Daily Log',
      message: 'Are you sure you want to delete this daily log?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteLogBackend(logId);
    }
  }, [confirm, deleteLogBackend]);

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch =
        searchTerm === '' ||
        log.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.projectNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || log.workStatus === filterStatus;
      return matchesSearch && matchesStatus;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [logs, searchTerm, filterStatus]);

  // Stats
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const thisWeek = logs.filter((l) => {
      const logDate = new Date(l.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return logDate >= weekAgo;
    });

    return {
      totalLogs: logs.length,
      thisWeekLogs: thisWeek.length,
      totalManHours: thisWeek.reduce((sum, l) => sum + l.totalManHours, 0),
      incidents: thisWeek.reduce((sum, l) => sum + l.incidents.length, 0),
    };
  }, [logs]);

  const isDark = theme === 'dark';
  const cardBg = isDark ? 'bg-gray-800' : 'bg-white';
  const cardBorder = isDark ? 'border-gray-700' : 'border-gray-200';
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const inputBg = isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300';

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.dailyLogConstruction.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <div className={`${cardBg} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <ClipboardList className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${textPrimary}`}>
                  {t('tools.dailyLogConstruction.dailyConstructionLog', 'Daily Construction Log')}
                </h1>
                <p className={`text-sm ${textSecondary}`}>
                  {t('tools.dailyLogConstruction.recordDailySiteActivitiesCrew', 'Record daily site activities, crew, weather, and work progress')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="daily-log-construction" toolName="Daily Log Construction" />

              <SyncStatus
                isSynced={isSynced}
                isSaving={isSaving}
                lastSaved={lastSaved}
                syncError={syncError}
                onForceSync={forceSync}
                theme={theme}
                showLabel={true}
                size="md"
              />
              <ExportDropdown
                onExportCSV={() => exportCSV()}
                onExportExcel={() => exportExcel()}
                onExportJSON={() => exportJSON()}
                onExportPDF={() => exportPDF({ title: 'Daily Construction Logs' })}
                onCopyToClipboard={() => copyToClipboard()}
                onPrint={() => print('Daily Construction Logs')}
                theme={theme}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className="flex items-center gap-2 mb-1">
                <FileText className="w-4 h-4 text-blue-500" />
                <span className={`text-xs ${textSecondary}`}>{t('tools.dailyLogConstruction.totalLogs', 'Total Logs')}</span>
              </div>
              <p className={`text-xl font-bold ${textPrimary}`}>{stats.totalLogs}</p>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-green-500" />
                <span className={`text-xs ${textSecondary}`}>{t('tools.dailyLogConstruction.thisWeek', 'This Week')}</span>
              </div>
              <p className={`text-xl font-bold ${textPrimary}`}>{stats.thisWeekLogs}</p>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-purple-500" />
                <span className={`text-xs ${textSecondary}`}>{t('tools.dailyLogConstruction.manHoursWeek', 'Man Hours (Week)')}</span>
              </div>
              <p className={`text-xl font-bold ${textPrimary}`}>{stats.totalManHours}</p>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                <span className={`text-xs ${textSecondary}`}>{t('tools.dailyLogConstruction.incidentsWeek', 'Incidents (Week)')}</span>
              </div>
              <p className={`text-xl font-bold ${textPrimary}`}>{stats.incidents}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-gray-700 pb-3">
            {[
              { id: 'list', label: 'All Logs', icon: FileText },
              { id: 'create', label: selectedLogId ? t('tools.dailyLogConstruction.editLog', 'Edit Log') : t('tools.dailyLogConstruction.newLog', 'New Log'), icon: Plus },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => {
                  if (id === 'create' && !selectedLogId) resetForm();
                  setActiveTab(id as any);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === id
                    ? 'bg-[#0D9488] text-white'
                    : `${textSecondary} hover:bg-gray-700`
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* List Tab */}
        {activeTab === 'list' && (
          <div className={`${cardBg} rounded-lg shadow-lg p-6`}>
            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${textSecondary}`} />
                  <input
                    type="text"
                    placeholder={t('tools.dailyLogConstruction.searchByProject', 'Search by project...')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 rounded-lg border ${inputBg} ${textPrimary}`}
                  />
                </div>
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className={`px-4 py-2 rounded-lg border ${inputBg} ${textPrimary}`}
              >
                <option value="all">{t('tools.dailyLogConstruction.allStatus', 'All Status')}</option>
                <option value="on-schedule">{t('tools.dailyLogConstruction.onSchedule', 'On Schedule')}</option>
                <option value="ahead">{t('tools.dailyLogConstruction.ahead', 'Ahead')}</option>
                <option value="behind">{t('tools.dailyLogConstruction.behind', 'Behind')}</option>
                <option value="delayed">{t('tools.dailyLogConstruction.delayed', 'Delayed')}</option>
              </select>
            </div>

            {/* Logs List */}
            <div className="space-y-4">
              {filteredLogs.length === 0 ? (
                <div className={`text-center py-12 ${textSecondary}`}>
                  <ClipboardList className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{t('tools.dailyLogConstruction.noDailyLogsFoundCreate', 'No daily logs found. Create your first log to get started.')}</p>
                </div>
              ) : (
                filteredLogs.map((log) => (
                  <div key={log.id} className={`border ${cardBorder} rounded-lg overflow-hidden`}>
                    <div
                      className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      onClick={() => setExpandedLogId(expandedLogId === log.id ? null : log.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            {expandedLogId === log.id ? (
                              <ChevronUp className={`w-5 h-5 ${textSecondary}`} />
                            ) : (
                              <ChevronDown className={`w-5 h-5 ${textSecondary}`} />
                            )}
                            <Calendar className={`w-5 h-5 ${textSecondary}`} />
                          </div>
                          <div>
                            <h3 className={`font-semibold ${textPrimary}`}>{formatDate(log.date)}</h3>
                            <p className={`text-sm ${textSecondary}`}>
                              {log.projectName} {log.projectNumber && `(#${log.projectNumber})`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className={`font-medium ${textPrimary}`}>{log.totalManHours} hrs</p>
                            <p className={`text-sm ${textSecondary}`}>{log.crew.length} crew</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(log.workStatus, isDark)}`}>
                            {log.workStatus.replace('-', ' ').charAt(0).toUpperCase() + log.workStatus.slice(1).replace('-', ' ')}
                          </span>
                          {!log.weather.workableDay && (
                            <CloudRain className="w-5 h-5 text-blue-500" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {expandedLogId === log.id && (
                      <div className={`border-t ${cardBorder} p-4 ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className={`text-xs ${textSecondary}`}>{t('tools.dailyLogConstruction.weather', 'Weather')}</p>
                            <p className={`font-medium ${textPrimary}`}>
                              {log.weather.condition} ({log.weather.temperatureLow}-{log.weather.temperatureHigh}F)
                            </p>
                          </div>
                          <div>
                            <p className={`text-xs ${textSecondary}`}>{t('tools.dailyLogConstruction.preparedBy', 'Prepared By')}</p>
                            <p className={`font-medium ${textPrimary}`}>{log.preparedBy || '-'}</p>
                          </div>
                          <div>
                            <p className={`text-xs ${textSecondary}`}>{t('tools.dailyLogConstruction.equipment', 'Equipment')}</p>
                            <p className={`font-medium ${textPrimary}`}>{log.equipment.length} units</p>
                          </div>
                          <div>
                            <p className={`text-xs ${textSecondary}`}>{t('tools.dailyLogConstruction.deliveries', 'Deliveries')}</p>
                            <p className={`font-medium ${textPrimary}`}>{log.deliveries.length}</p>
                          </div>
                        </div>

                        {log.delays && (
                          <div className={`p-3 rounded-lg ${isDark ? 'bg-yellow-900/20' : 'bg-yellow-50'} mb-4`}>
                            <p className={`text-sm font-medium ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>
                              Delays: {log.delays}
                            </p>
                          </div>
                        )}

                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => editLog(log)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700"
                          >
                            <Edit2 className="w-4 h-4" />
                            {t('tools.dailyLogConstruction.edit', 'Edit')}
                          </button>
                          <button
                            onClick={() => deleteLog(log.id)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Create/Edit Tab */}
        {activeTab === 'create' && (
          <div className={`${cardBg} rounded-lg shadow-lg p-6`}>
            <h2 className={`text-xl font-bold ${textPrimary} mb-6`}>
              {selectedLogId ? t('tools.dailyLogConstruction.editDailyLog', 'Edit Daily Log') : t('tools.dailyLogConstruction.newDailyLog', 'New Daily Log')}
            </h2>

            {/* Project Info */}
            <div className="mb-6">
              <h3 className={`text-lg font-semibold ${textPrimary} mb-4`}>{t('tools.dailyLogConstruction.projectInformation', 'Project Information')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${textSecondary} mb-1`}>{t('tools.dailyLogConstruction.projectName', 'Project Name *')}</label>
                  <input
                    type="text"
                    value={formData.projectName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, projectName: e.target.value }))}
                    className={`w-full px-4 py-2 rounded-lg border ${inputBg} ${textPrimary}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${textSecondary} mb-1`}>{t('tools.dailyLogConstruction.project', 'Project #')}</label>
                  <input
                    type="text"
                    value={formData.projectNumber}
                    onChange={(e) => setFormData((prev) => ({ ...prev, projectNumber: e.target.value }))}
                    className={`w-full px-4 py-2 rounded-lg border ${inputBg} ${textPrimary}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${textSecondary} mb-1`}>{t('tools.dailyLogConstruction.date', 'Date *')}</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                    className={`w-full px-4 py-2 rounded-lg border ${inputBg} ${textPrimary}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${textSecondary} mb-1`}>{t('tools.dailyLogConstruction.workStatus', 'Work Status')}</label>
                  <select
                    value={formData.workStatus}
                    onChange={(e) => setFormData((prev) => ({ ...prev, workStatus: e.target.value as WorkStatus }))}
                    className={`w-full px-4 py-2 rounded-lg border ${inputBg} ${textPrimary}`}
                  >
                    <option value="on-schedule">{t('tools.dailyLogConstruction.onSchedule2', 'On Schedule')}</option>
                    <option value="ahead">{t('tools.dailyLogConstruction.ahead2', 'Ahead')}</option>
                    <option value="behind">{t('tools.dailyLogConstruction.behind2', 'Behind')}</option>
                    <option value="delayed">{t('tools.dailyLogConstruction.delayed2', 'Delayed')}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section Tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
              {[
                { id: 'weather', label: 'Weather', icon: Sun },
                { id: 'crew', label: 'Crew', icon: Users },
                { id: 'equipment', label: 'Equipment', icon: Truck },
                { id: 'work', label: 'Work Performed', icon: HardHat },
                { id: 'deliveries', label: 'Deliveries', icon: Truck },
                { id: 'incidents', label: 'Incidents', icon: AlertTriangle },
                { id: 'notes', label: 'Notes', icon: FileText },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveSection(id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeSection === id
                      ? 'bg-[#0D9488] text-white'
                      : `${isDark ? 'bg-gray-700' : 'bg-gray-100'} ${textSecondary} hover:bg-gray-200 dark:hover:bg-gray-600`
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>

            {/* Weather Section */}
            {activeSection === 'weather' && (
              <div className="space-y-4">
                <h3 className={`text-lg font-semibold ${textPrimary}`}>{t('tools.dailyLogConstruction.weatherConditions', 'Weather Conditions')}</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${textSecondary} mb-1`}>{t('tools.dailyLogConstruction.condition', 'Condition')}</label>
                    <select
                      value={formData.weather?.condition}
                      onChange={(e) => setFormData((prev) => ({
                        ...prev,
                        weather: { ...prev.weather!, condition: e.target.value as WeatherCondition }
                      }))}
                      className={`w-full px-4 py-2 rounded-lg border ${inputBg} ${textPrimary}`}
                    >
                      {WEATHER_CONDITIONS.map((w) => (
                        <option key={w.condition} value={w.condition}>{w.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${textSecondary} mb-1`}>{t('tools.dailyLogConstruction.highTempF', 'High Temp (F)')}</label>
                    <input
                      type="number"
                      value={formData.weather?.temperatureHigh}
                      onChange={(e) => setFormData((prev) => ({
                        ...prev,
                        weather: { ...prev.weather!, temperatureHigh: Number(e.target.value) }
                      }))}
                      className={`w-full px-4 py-2 rounded-lg border ${inputBg} ${textPrimary}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${textSecondary} mb-1`}>{t('tools.dailyLogConstruction.lowTempF', 'Low Temp (F)')}</label>
                    <input
                      type="number"
                      value={formData.weather?.temperatureLow}
                      onChange={(e) => setFormData((prev) => ({
                        ...prev,
                        weather: { ...prev.weather!, temperatureLow: Number(e.target.value) }
                      }))}
                      className={`w-full px-4 py-2 rounded-lg border ${inputBg} ${textPrimary}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${textSecondary} mb-1`}>{t('tools.dailyLogConstruction.windMph', 'Wind (mph)')}</label>
                    <input
                      type="number"
                      value={formData.weather?.windSpeed}
                      onChange={(e) => setFormData((prev) => ({
                        ...prev,
                        weather: { ...prev.weather!, windSpeed: Number(e.target.value) }
                      }))}
                      className={`w-full px-4 py-2 rounded-lg border ${inputBg} ${textPrimary}`}
                    />
                  </div>
                  <div className="flex items-end">
                    <label className={`flex items-center gap-2 ${textPrimary}`}>
                      <input
                        type="checkbox"
                        checked={formData.weather?.workableDay}
                        onChange={(e) => setFormData((prev) => ({
                          ...prev,
                          weather: { ...prev.weather!, workableDay: e.target.checked }
                        }))}
                        className="w-4 h-4 rounded"
                      />
                      {t('tools.dailyLogConstruction.workableDay', 'Workable Day')}
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Crew Section */}
            {activeSection === 'crew' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className={`text-lg font-semibold ${textPrimary}`}>
                    Crew ({formData.crew?.length || 0}) - Total: {formData.totalManHours} hrs
                  </h3>
                  <button
                    onClick={addCrewMember}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0D9488] text-white text-sm hover:bg-[#0B7C72]"
                  >
                    <Plus className="w-4 h-4" />
                    {t('tools.dailyLogConstruction.addMember', 'Add Member')}
                  </button>
                </div>
                <div className="space-y-2">
                  {(formData.crew || []).map((member) => (
                    <div key={member.id} className={`grid grid-cols-5 gap-2 p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <input
                        type="text"
                        placeholder={t('tools.dailyLogConstruction.name', 'Name')}
                        value={member.name}
                        onChange={(e) => updateCrewMember(member.id, { name: e.target.value })}
                        className={`px-3 py-2 rounded-lg border ${inputBg} ${textPrimary} text-sm`}
                      />
                      <select
                        value={member.role}
                        onChange={(e) => updateCrewMember(member.id, { role: e.target.value })}
                        className={`px-3 py-2 rounded-lg border ${inputBg} ${textPrimary} text-sm`}
                      >
                        {CREW_ROLES.map((role) => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        placeholder={t('tools.dailyLogConstruction.hours', 'Hours')}
                        value={member.hoursWorked}
                        onChange={(e) => updateCrewMember(member.id, { hoursWorked: Number(e.target.value) })}
                        className={`px-3 py-2 rounded-lg border ${inputBg} ${textPrimary} text-sm`}
                      />
                      <input
                        type="number"
                        placeholder="OT"
                        value={member.overtime}
                        onChange={(e) => updateCrewMember(member.id, { overtime: Number(e.target.value) })}
                        className={`px-3 py-2 rounded-lg border ${inputBg} ${textPrimary} text-sm`}
                      />
                      <button
                        onClick={() => removeCrewMember(member.id)}
                        className="px-3 py-2 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Equipment Section */}
            {activeSection === 'equipment' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className={`text-lg font-semibold ${textPrimary}`}>{t('tools.dailyLogConstruction.equipment2', 'Equipment')}</h3>
                  <button
                    onClick={addEquipment}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0D9488] text-white text-sm hover:bg-[#0B7C72]"
                  >
                    <Plus className="w-4 h-4" />
                    {t('tools.dailyLogConstruction.addEquipment', 'Add Equipment')}
                  </button>
                </div>
                <div className="space-y-2">
                  {(formData.equipment || []).map((eq, idx) => (
                    <div key={eq.id} className={`grid grid-cols-5 gap-2 p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <input
                        type="text"
                        placeholder={t('tools.dailyLogConstruction.equipmentName', 'Equipment Name')}
                        value={eq.name}
                        onChange={(e) => {
                          const updated = [...(formData.equipment || [])];
                          updated[idx] = { ...eq, name: e.target.value };
                          setFormData((prev) => ({ ...prev, equipment: updated }));
                        }}
                        className={`px-3 py-2 rounded-lg border ${inputBg} ${textPrimary} text-sm`}
                      />
                      <input
                        type="number"
                        placeholder={t('tools.dailyLogConstruction.hours2', 'Hours')}
                        value={eq.hoursUsed}
                        onChange={(e) => {
                          const updated = [...(formData.equipment || [])];
                          updated[idx] = { ...eq, hoursUsed: Number(e.target.value) };
                          setFormData((prev) => ({ ...prev, equipment: updated }));
                        }}
                        className={`px-3 py-2 rounded-lg border ${inputBg} ${textPrimary} text-sm`}
                      />
                      <select
                        value={eq.status}
                        onChange={(e) => {
                          const updated = [...(formData.equipment || [])];
                          updated[idx] = { ...eq, status: e.target.value as any };
                          setFormData((prev) => ({ ...prev, equipment: updated }));
                        }}
                        className={`px-3 py-2 rounded-lg border ${inputBg} ${textPrimary} text-sm`}
                      >
                        <option value="active">{t('tools.dailyLogConstruction.active', 'Active')}</option>
                        <option value="idle">{t('tools.dailyLogConstruction.idle', 'Idle')}</option>
                        <option value="maintenance">{t('tools.dailyLogConstruction.maintenance', 'Maintenance')}</option>
                        <option value="breakdown">{t('tools.dailyLogConstruction.breakdown', 'Breakdown')}</option>
                      </select>
                      <input
                        type="text"
                        placeholder={t('tools.dailyLogConstruction.notes', 'Notes')}
                        value={eq.notes}
                        onChange={(e) => {
                          const updated = [...(formData.equipment || [])];
                          updated[idx] = { ...eq, notes: e.target.value };
                          setFormData((prev) => ({ ...prev, equipment: updated }));
                        }}
                        className={`px-3 py-2 rounded-lg border ${inputBg} ${textPrimary} text-sm`}
                      />
                      <button
                        onClick={() => {
                          const updated = (formData.equipment || []).filter((e) => e.id !== eq.id);
                          setFormData((prev) => ({ ...prev, equipment: updated }));
                        }}
                        className="px-3 py-2 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Work Performed Section */}
            {activeSection === 'work' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className={`text-lg font-semibold ${textPrimary}`}>{t('tools.dailyLogConstruction.workPerformed', 'Work Performed')}</h3>
                  <button
                    onClick={addWorkEntry}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0D9488] text-white text-sm hover:bg-[#0B7C72]"
                  >
                    <Plus className="w-4 h-4" />
                    {t('tools.dailyLogConstruction.addWorkEntry', 'Add Work Entry')}
                  </button>
                </div>
                <div className="space-y-2">
                  {(formData.workPerformed || []).map((work, idx) => (
                    <div key={work.id} className={`grid grid-cols-5 gap-2 p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <input
                        type="text"
                        placeholder={t('tools.dailyLogConstruction.location', 'Location')}
                        value={work.location}
                        onChange={(e) => {
                          const updated = [...(formData.workPerformed || [])];
                          updated[idx] = { ...work, location: e.target.value };
                          setFormData((prev) => ({ ...prev, workPerformed: updated }));
                        }}
                        className={`px-3 py-2 rounded-lg border ${inputBg} ${textPrimary} text-sm`}
                      />
                      <input
                        type="text"
                        placeholder={t('tools.dailyLogConstruction.description', 'Description')}
                        value={work.description}
                        onChange={(e) => {
                          const updated = [...(formData.workPerformed || [])];
                          updated[idx] = { ...work, description: e.target.value };
                          setFormData((prev) => ({ ...prev, workPerformed: updated }));
                        }}
                        className={`col-span-2 px-3 py-2 rounded-lg border ${inputBg} ${textPrimary} text-sm`}
                      />
                      <input
                        type="number"
                        placeholder={t('tools.dailyLogConstruction.complete', '% Complete')}
                        value={work.percentComplete}
                        onChange={(e) => {
                          const updated = [...(formData.workPerformed || [])];
                          updated[idx] = { ...work, percentComplete: Number(e.target.value) };
                          setFormData((prev) => ({ ...prev, workPerformed: updated }));
                        }}
                        className={`px-3 py-2 rounded-lg border ${inputBg} ${textPrimary} text-sm`}
                      />
                      <button
                        onClick={() => {
                          const updated = (formData.workPerformed || []).filter((w) => w.id !== work.id);
                          setFormData((prev) => ({ ...prev, workPerformed: updated }));
                        }}
                        className="px-3 py-2 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Deliveries Section */}
            {activeSection === 'deliveries' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className={`text-lg font-semibold ${textPrimary}`}>{t('tools.dailyLogConstruction.materialDeliveries', 'Material Deliveries')}</h3>
                  <button
                    onClick={addDelivery}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0D9488] text-white text-sm hover:bg-[#0B7C72]"
                  >
                    <Plus className="w-4 h-4" />
                    {t('tools.dailyLogConstruction.addDelivery', 'Add Delivery')}
                  </button>
                </div>
                <div className="space-y-2">
                  {(formData.deliveries || []).map((del, idx) => (
                    <div key={del.id} className={`grid grid-cols-6 gap-2 p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <input
                        type="text"
                        placeholder={t('tools.dailyLogConstruction.supplier', 'Supplier')}
                        value={del.supplier}
                        onChange={(e) => {
                          const updated = [...(formData.deliveries || [])];
                          updated[idx] = { ...del, supplier: e.target.value };
                          setFormData((prev) => ({ ...prev, deliveries: updated }));
                        }}
                        className={`px-3 py-2 rounded-lg border ${inputBg} ${textPrimary} text-sm`}
                      />
                      <input
                        type="text"
                        placeholder={t('tools.dailyLogConstruction.materials', 'Materials')}
                        value={del.materials}
                        onChange={(e) => {
                          const updated = [...(formData.deliveries || [])];
                          updated[idx] = { ...del, materials: e.target.value };
                          setFormData((prev) => ({ ...prev, deliveries: updated }));
                        }}
                        className={`px-3 py-2 rounded-lg border ${inputBg} ${textPrimary} text-sm`}
                      />
                      <input
                        type="text"
                        placeholder={t('tools.dailyLogConstruction.qty', 'Qty')}
                        value={del.quantity}
                        onChange={(e) => {
                          const updated = [...(formData.deliveries || [])];
                          updated[idx] = { ...del, quantity: e.target.value };
                          setFormData((prev) => ({ ...prev, deliveries: updated }));
                        }}
                        className={`px-3 py-2 rounded-lg border ${inputBg} ${textPrimary} text-sm`}
                      />
                      <input
                        type="text"
                        placeholder={t('tools.dailyLogConstruction.receivedBy', 'Received By')}
                        value={del.receivedBy}
                        onChange={(e) => {
                          const updated = [...(formData.deliveries || [])];
                          updated[idx] = { ...del, receivedBy: e.target.value };
                          setFormData((prev) => ({ ...prev, deliveries: updated }));
                        }}
                        className={`px-3 py-2 rounded-lg border ${inputBg} ${textPrimary} text-sm`}
                      />
                      <input
                        type="time"
                        value={del.time}
                        onChange={(e) => {
                          const updated = [...(formData.deliveries || [])];
                          updated[idx] = { ...del, time: e.target.value };
                          setFormData((prev) => ({ ...prev, deliveries: updated }));
                        }}
                        className={`px-3 py-2 rounded-lg border ${inputBg} ${textPrimary} text-sm`}
                      />
                      <button
                        onClick={() => {
                          const updated = (formData.deliveries || []).filter((d) => d.id !== del.id);
                          setFormData((prev) => ({ ...prev, deliveries: updated }));
                        }}
                        className="px-3 py-2 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Incidents Section */}
            {activeSection === 'incidents' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className={`text-lg font-semibold ${textPrimary}`}>{t('tools.dailyLogConstruction.safetyIncidents', 'Safety Incidents')}</h3>
                  <button
                    onClick={addIncident}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0D9488] text-white text-sm hover:bg-[#0B7C72]"
                  >
                    <Plus className="w-4 h-4" />
                    {t('tools.dailyLogConstruction.reportIncident', 'Report Incident')}
                  </button>
                </div>
                <div className="space-y-2">
                  {(formData.incidents || []).map((inc, idx) => (
                    <div key={inc.id} className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'} space-y-2`}>
                      <div className="grid grid-cols-4 gap-2">
                        <select
                          value={inc.type}
                          onChange={(e) => {
                            const updated = [...(formData.incidents || [])];
                            updated[idx] = { ...inc, type: e.target.value as any };
                            setFormData((prev) => ({ ...prev, incidents: updated }));
                          }}
                          className={`px-3 py-2 rounded-lg border ${inputBg} ${textPrimary} text-sm`}
                        >
                          <option value="near-miss">{t('tools.dailyLogConstruction.nearMiss', 'Near Miss')}</option>
                          <option value="injury">{t('tools.dailyLogConstruction.injury', 'Injury')}</option>
                          <option value="property-damage">{t('tools.dailyLogConstruction.propertyDamage', 'Property Damage')}</option>
                          <option value="environmental">{t('tools.dailyLogConstruction.environmental', 'Environmental')}</option>
                          <option value="other">{t('tools.dailyLogConstruction.other', 'Other')}</option>
                        </select>
                        <select
                          value={inc.severity}
                          onChange={(e) => {
                            const updated = [...(formData.incidents || [])];
                            updated[idx] = { ...inc, severity: e.target.value as any };
                            setFormData((prev) => ({ ...prev, incidents: updated }));
                          }}
                          className={`px-3 py-2 rounded-lg border ${inputBg} ${textPrimary} text-sm`}
                        >
                          <option value="minor">{t('tools.dailyLogConstruction.minor', 'Minor')}</option>
                          <option value="moderate">{t('tools.dailyLogConstruction.moderate', 'Moderate')}</option>
                          <option value="serious">{t('tools.dailyLogConstruction.serious', 'Serious')}</option>
                        </select>
                        <input
                          type="text"
                          placeholder={t('tools.dailyLogConstruction.reportedBy', 'Reported By')}
                          value={inc.reportedBy}
                          onChange={(e) => {
                            const updated = [...(formData.incidents || [])];
                            updated[idx] = { ...inc, reportedBy: e.target.value };
                            setFormData((prev) => ({ ...prev, incidents: updated }));
                          }}
                          className={`px-3 py-2 rounded-lg border ${inputBg} ${textPrimary} text-sm`}
                        />
                        <button
                          onClick={() => {
                            const updated = (formData.incidents || []).filter((i) => i.id !== inc.id);
                            setFormData((prev) => ({ ...prev, incidents: updated }));
                          }}
                          className="px-3 py-2 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <textarea
                        placeholder={t('tools.dailyLogConstruction.description2', 'Description')}
                        value={inc.description}
                        onChange={(e) => {
                          const updated = [...(formData.incidents || [])];
                          updated[idx] = { ...inc, description: e.target.value };
                          setFormData((prev) => ({ ...prev, incidents: updated }));
                        }}
                        className={`w-full px-3 py-2 rounded-lg border ${inputBg} ${textPrimary} text-sm`}
                        rows={2}
                      />
                      <textarea
                        placeholder={t('tools.dailyLogConstruction.actionTaken', 'Action Taken')}
                        value={inc.actionTaken}
                        onChange={(e) => {
                          const updated = [...(formData.incidents || [])];
                          updated[idx] = { ...inc, actionTaken: e.target.value };
                          setFormData((prev) => ({ ...prev, incidents: updated }));
                        }}
                        className={`w-full px-3 py-2 rounded-lg border ${inputBg} ${textPrimary} text-sm`}
                        rows={2}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes Section */}
            {activeSection === 'notes' && (
              <div className="space-y-4">
                <h3 className={`text-lg font-semibold ${textPrimary}`}>{t('tools.dailyLogConstruction.additionalInformation', 'Additional Information')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${textSecondary} mb-1`}>{t('tools.dailyLogConstruction.preparedBy2', 'Prepared By')}</label>
                    <input
                      type="text"
                      value={formData.preparedBy}
                      onChange={(e) => setFormData((prev) => ({ ...prev, preparedBy: e.target.value }))}
                      className={`w-full px-4 py-2 rounded-lg border ${inputBg} ${textPrimary}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${textSecondary} mb-1`}>{t('tools.dailyLogConstruction.superintendent', 'Superintendent')}</label>
                    <input
                      type="text"
                      value={formData.superintendent}
                      onChange={(e) => setFormData((prev) => ({ ...prev, superintendent: e.target.value }))}
                      className={`w-full px-4 py-2 rounded-lg border ${inputBg} ${textPrimary}`}
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${textSecondary} mb-1`}>{t('tools.dailyLogConstruction.visitors', 'Visitors')}</label>
                  <input
                    type="text"
                    value={formData.visitors}
                    onChange={(e) => setFormData((prev) => ({ ...prev, visitors: e.target.value }))}
                    className={`w-full px-4 py-2 rounded-lg border ${inputBg} ${textPrimary}`}
                    placeholder={t('tools.dailyLogConstruction.namesOfSiteVisitors', 'Names of site visitors')}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${textSecondary} mb-1`}>{t('tools.dailyLogConstruction.inspections', 'Inspections')}</label>
                  <input
                    type="text"
                    value={formData.inspections}
                    onChange={(e) => setFormData((prev) => ({ ...prev, inspections: e.target.value }))}
                    className={`w-full px-4 py-2 rounded-lg border ${inputBg} ${textPrimary}`}
                    placeholder={t('tools.dailyLogConstruction.anyInspectionsConducted', 'Any inspections conducted')}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${textSecondary} mb-1`}>{t('tools.dailyLogConstruction.delays', 'Delays')}</label>
                  <textarea
                    value={formData.delays}
                    onChange={(e) => setFormData((prev) => ({ ...prev, delays: e.target.value }))}
                    className={`w-full px-4 py-2 rounded-lg border ${inputBg} ${textPrimary}`}
                    rows={2}
                    placeholder={t('tools.dailyLogConstruction.anyDelaysEncountered', 'Any delays encountered...')}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${textSecondary} mb-1`}>{t('tools.dailyLogConstruction.generalNotes', 'General Notes')}</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                    className={`w-full px-4 py-2 rounded-lg border ${inputBg} ${textPrimary}`}
                    rows={4}
                    placeholder={t('tools.dailyLogConstruction.additionalNotes', 'Additional notes...')}
                  />
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4 mt-8">
              <button
                onClick={saveLog}
                className="flex items-center gap-2 px-6 py-3 rounded-lg bg-[#0D9488] text-white font-medium hover:bg-[#0B7C72]"
              >
                <Save className="w-5 h-5" />
                {selectedLogId ? t('tools.dailyLogConstruction.updateLog', 'Update Log') : t('tools.dailyLogConstruction.saveLog', 'Save Log')}
              </button>
              <button
                onClick={() => {
                  resetForm();
                  setActiveTab('list');
                }}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg border ${cardBorder} ${textSecondary} font-medium hover:bg-gray-100 dark:hover:bg-gray-700`}
              >
                <X className="w-5 h-5" />
                {t('tools.dailyLogConstruction.cancel', 'Cancel')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog />

      {/* Validation Message Toast */}
      {validationMessage && (
        <div className="fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg bg-red-500 text-white shadow-lg animate-in fade-in slide-in-from-bottom-2">
          {validationMessage}
        </div>
      )}
    </div>
  );
};

export default DailyLogConstructionTool;
