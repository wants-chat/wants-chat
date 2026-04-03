'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  MapPin,
  Clock,
  User,
  Plus,
  Trash2,
  Save,
  Edit2,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  Navigation,
  Footprints,
  Shield,
  Camera,
  FileText,
  Play,
  Pause,
  Square,
  Sparkles,
  X,
} from 'lucide-react';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import useToolData from '../../hooks/useToolData';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';

interface PatrolLogToolProps {
  uiConfig?: UIConfig;
}
import { useTheme } from '@/contexts/ThemeContext';

// Types
type PatrolStatus = 'pending' | 'in-progress' | 'completed' | 'missed' | 'incident';
type CheckpointStatus = 'pending' | 'checked' | 'skipped' | 'issue';

interface Checkpoint {
  id: string;
  name: string;
  location: string;
  order: number;
  requiredActions: string[];
}

interface CheckpointLog {
  checkpointId: string;
  status: CheckpointStatus;
  checkedAt: string;
  notes: string;
  photoTaken: boolean;
}

interface PatrolRoute {
  id: string;
  name: string;
  description: string;
  checkpoints: Checkpoint[];
  estimatedDuration: number; // minutes
  frequency: 'hourly' | 'every-2-hours' | 'every-4-hours' | 'daily' | 'custom';
  isActive: boolean;
}

interface PatrolLog {
  id: string;
  routeId: string;
  guardId: string;
  guardName: string;
  status: PatrolStatus;
  startTime: string;
  endTime: string;
  checkpointLogs: CheckpointLog[];
  notes: string;
  incidentReported: boolean;
  incidentId: string;
  createdAt: string;
}

// Column definitions for exports
const PATROL_LOG_COLUMNS: ColumnConfig[] = [
  { key: 'guardName', header: 'Guard' },
  { key: 'routeName', header: 'Route' },
  { key: 'status', header: 'Status' },
  { key: 'startTime', header: 'Start Time' },
  { key: 'endTime', header: 'End Time' },
  { key: 'checkpointsCompleted', header: 'Checkpoints' },
  { key: 'incidentReported', header: 'Incident' },
  { key: 'notes', header: 'Notes' },
];

// Helper function to generate unique IDs
const generateId = () => `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export function PatrolLogTool({ uiConfig }: PatrolLogToolProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Use useToolData hook for backend sync
  const {
    data: routes,
    addItem: addRouteToBackend,
    updateItem: updateRouteBackend,
    deleteItem: deleteRouteBackend,
  } = useToolData<PatrolRoute>('patrol-routes', [], []);

  const {
    data: patrolLogs,
    addItem: addPatrolLogToBackend,
    updateItem: updatePatrolLogBackend,
    deleteItem: deletePatrolLogBackend,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<PatrolLog>('patrol-logs', [], PATROL_LOG_COLUMNS);

  // Local UI State
  const [activeTab, setActiveTab] = useState<'logs' | 'routes' | 'active'>('logs');
  const [showRouteForm, setShowRouteForm] = useState(false);
  const [showPatrolForm, setShowPatrolForm] = useState(false);
  const [activePatrol, setActivePatrol] = useState<PatrolLog | null>(null);
  const [selectedLog, setSelectedLog] = useState<PatrolLog | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // New route form state
  const [newRoute, setNewRoute] = useState<Partial<PatrolRoute>>({
    name: '',
    description: '',
    checkpoints: [],
    estimatedDuration: 30,
    frequency: 'hourly',
    isActive: true,
  });

  // New checkpoint form state
  const [showCheckpointForm, setShowCheckpointForm] = useState(false);
  const [newCheckpoint, setNewCheckpoint] = useState<Partial<Checkpoint>>({
    name: '',
    location: '',
    order: 1,
    requiredActions: [],
  });
  const [newAction, setNewAction] = useState('');

  // Prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.routeName || params.guardName) {
        if (params.routeName) {
          setNewRoute({
            ...newRoute,
            name: params.routeName || '',
            description: params.description || '',
          });
          setShowRouteForm(true);
          setActiveTab('routes');
        }
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Add route
  const addRoute = () => {
    if (!newRoute.name) {
      setValidationMessage('Please enter a route name');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const route: PatrolRoute = {
      id: generateId(),
      name: newRoute.name || '',
      description: newRoute.description || '',
      checkpoints: newRoute.checkpoints || [],
      estimatedDuration: newRoute.estimatedDuration || 30,
      frequency: newRoute.frequency as PatrolRoute['frequency'] || 'hourly',
      isActive: newRoute.isActive !== false,
    };

    addRouteToBackend(route);
    setShowRouteForm(false);
    setNewRoute({
      name: '',
      description: '',
      checkpoints: [],
      estimatedDuration: 30,
      frequency: 'hourly',
      isActive: true,
    });
  };

  // Add checkpoint to route
  const addCheckpoint = () => {
    if (!newCheckpoint.name) return;

    const checkpoint: Checkpoint = {
      id: generateId(),
      name: newCheckpoint.name || '',
      location: newCheckpoint.location || '',
      order: (newRoute.checkpoints?.length || 0) + 1,
      requiredActions: newCheckpoint.requiredActions || [],
    };

    setNewRoute({
      ...newRoute,
      checkpoints: [...(newRoute.checkpoints || []), checkpoint],
    });
    setNewCheckpoint({
      name: '',
      location: '',
      order: 1,
      requiredActions: [],
    });
    setShowCheckpointForm(false);
  };

  // Remove checkpoint
  const removeCheckpoint = (checkpointId: string) => {
    setNewRoute({
      ...newRoute,
      checkpoints: (newRoute.checkpoints || []).filter((c) => c.id !== checkpointId),
    });
  };

  // Add action to checkpoint
  const addAction = () => {
    if (!newAction.trim()) return;
    setNewCheckpoint({
      ...newCheckpoint,
      requiredActions: [...(newCheckpoint.requiredActions || []), newAction.trim()],
    });
    setNewAction('');
  };

  // Start patrol
  const startPatrol = (routeId: string, guardName: string) => {
    const route = routes.find((r) => r.id === routeId);
    if (!route) return;

    const patrol: PatrolLog = {
      id: generateId(),
      routeId,
      guardId: generateId(),
      guardName,
      status: 'in-progress',
      startTime: new Date().toISOString(),
      endTime: '',
      checkpointLogs: route.checkpoints.map((cp) => ({
        checkpointId: cp.id,
        status: 'pending',
        checkedAt: '',
        notes: '',
        photoTaken: false,
      })),
      notes: '',
      incidentReported: false,
      incidentId: '',
      createdAt: new Date().toISOString(),
    };

    addPatrolLogToBackend(patrol);
    setActivePatrol(patrol);
    setActiveTab('active');
    setShowPatrolForm(false);
  };

  // Check checkpoint
  const checkCheckpoint = (checkpointId: string, status: CheckpointStatus, notes: string = '') => {
    if (!activePatrol) return;

    const updatedCheckpointLogs = activePatrol.checkpointLogs.map((log) =>
      log.checkpointId === checkpointId
        ? { ...log, status, checkedAt: new Date().toISOString(), notes }
        : log
    );

    const updatedPatrol = {
      ...activePatrol,
      checkpointLogs: updatedCheckpointLogs,
    };

    updatePatrolLogBackend(activePatrol.id, updatedPatrol);
    setActivePatrol(updatedPatrol);
  };

  // Complete patrol
  const completePatrol = (notes: string = '') => {
    if (!activePatrol) return;

    const hasIncident = activePatrol.checkpointLogs.some((log) => log.status === 'issue');
    const allCompleted = activePatrol.checkpointLogs.every(
      (log) => log.status === 'checked' || log.status === 'skipped'
    );

    updatePatrolLogBackend(activePatrol.id, {
      status: hasIncident ? 'incident' : allCompleted ? 'completed' : 'completed',
      endTime: new Date().toISOString(),
      notes,
      incidentReported: hasIncident,
    });

    setActivePatrol(null);
    setActiveTab('logs');
  };

  // Get filtered logs
  const filteredLogs = useMemo(() => {
    return patrolLogs.filter((log) => {
      const route = routes.find((r) => r.id === log.routeId);
      const matchesSearch =
        searchTerm === '' ||
        log.guardName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (route?.name.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = filterStatus === 'all' || log.status === filterStatus;
      const matchesDate = log.startTime.startsWith(selectedDate);
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [patrolLogs, routes, searchTerm, filterStatus, selectedDate]);

  // Stats
  const stats = useMemo(() => {
    const todayLogs = patrolLogs.filter((log) => log.startTime.startsWith(selectedDate));
    return {
      total: todayLogs.length,
      completed: todayLogs.filter((l) => l.status === 'completed').length,
      inProgress: todayLogs.filter((l) => l.status === 'in-progress').length,
      incidents: todayLogs.filter((l) => l.incidentReported).length,
      routes: routes.filter((r) => r.isActive).length,
    };
  }, [patrolLogs, routes, selectedDate]);

  // Prepare export data
  const getExportData = () => {
    return filteredLogs.map((log) => {
      const route = routes.find((r) => r.id === log.routeId);
      const completedCheckpoints = log.checkpointLogs.filter((c) => c.status === 'checked').length;
      const totalCheckpoints = log.checkpointLogs.length;
      return {
        ...log,
        routeName: route?.name || 'Unknown',
        checkpointsCompleted: `${completedCheckpoints}/${totalCheckpoints}`,
        incidentReported: log.incidentReported ? 'Yes' : 'No',
      };
    });
  };

  return (
    <>
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.patrolLog.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500 rounded-lg">
                <Footprints className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.patrolLog.patrolLogTool', 'Patrol Log Tool')}
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.patrolLog.trackAndManageSecurityPatrol', 'Track and manage security patrol activities')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="patrol-log" toolName="Patrol Log" />

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
                onExportCSV={() => exportToCSV(getExportData(), PATROL_LOG_COLUMNS, 'patrol-logs')}
                onExportExcel={() => exportToExcel(getExportData(), PATROL_LOG_COLUMNS, 'patrol-logs')}
                onExportJSON={() => exportToJSON(getExportData(), 'patrol-logs')}
                onExportPDF={() => exportToPDF(getExportData(), PATROL_LOG_COLUMNS, 'Patrol Logs')}
                onCopy={() => copyUtil(getExportData(), PATROL_LOG_COLUMNS)}
                onPrint={() => printData(getExportData(), PATROL_LOG_COLUMNS, 'Patrol Logs')}
                theme={theme}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
            {[
              { label: 'Total Patrols', value: stats.total, color: 'bg-blue-500' },
              { label: 'Completed', value: stats.completed, color: 'bg-green-500' },
              { label: 'In Progress', value: stats.inProgress, color: 'bg-yellow-500' },
              { label: 'Incidents', value: stats.incidents, color: 'bg-red-500' },
              { label: 'Active Routes', value: stats.routes, color: 'bg-purple-500' },
            ].map((stat) => (
              <div
                key={stat.label}
                className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-3`}
              >
                <div className={`w-2 h-2 rounded-full ${stat.color} mb-1`} />
                <div className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {stat.value}
                </div>
                <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
            {(['logs', 'routes', 'active'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 font-medium capitalize transition-colors ${
                  activeTab === tab
                    ? 'text-blue-500 border-b-2 border-blue-500'
                    : theme === 'dark'
                    ? 'text-gray-400 hover:text-gray-300'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {tab === 'active' ? 'Active Patrol' : tab}
                {tab === 'active' && activePatrol && (
                  <span className="ml-2 w-2 h-2 bg-green-500 rounded-full inline-block animate-pulse" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Logs Tab */}
        {activeTab === 'logs' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 shadow`}>
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder={t('tools.patrolLog.searchPatrols', 'Search patrols...')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                </div>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className={`px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className={`px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="all">{t('tools.patrolLog.allStatus', 'All Status')}</option>
                  <option value="completed">{t('tools.patrolLog.completed', 'Completed')}</option>
                  <option value="in-progress">{t('tools.patrolLog.inProgress', 'In Progress')}</option>
                  <option value="incident">{t('tools.patrolLog.withIncident', 'With Incident')}</option>
                  <option value="missed">{t('tools.patrolLog.missed', 'Missed')}</option>
                </select>
                <button
                  onClick={() => setShowPatrolForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Play className="w-4 h-4" />
                  {t('tools.patrolLog.startPatrol', 'Start Patrol')}
                </button>
              </div>
            </div>

            {/* Logs List */}
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow overflow-hidden`}>
              {filteredLogs.length === 0 ? (
                <div className="p-8 text-center">
                  <Footprints className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                  <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.patrolLog.noPatrolLogsFound', 'No patrol logs found')}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredLogs.map((log) => {
                    const route = routes.find((r) => r.id === log.routeId);
                    const completedCheckpoints = log.checkpointLogs.filter((c) => c.status === 'checked').length;
                    const totalCheckpoints = log.checkpointLogs.length;
                    return (
                      <div
                        key={log.id}
                        className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                        onClick={() => setSelectedLog(log)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-blue-500/10 rounded-lg">
                              <User className="w-5 h-5 text-blue-500" />
                            </div>
                            <div>
                              <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {log.guardName}
                              </div>
                              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                <Navigation className="w-3 h-3 inline mr-1" />
                                {route?.name || 'Unknown Route'}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                {completedCheckpoints}/{totalCheckpoints} checkpoints
                              </div>
                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-xs px-2 py-0.5 rounded-full ${
                                    log.status === 'completed'
                                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                      : log.status === 'in-progress'
                                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                      : log.status === 'incident'
                                      ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                                  }`}
                                >
                                  {log.status}
                                </span>
                                {log.incidentReported && (
                                  <AlertCircle className="w-4 h-4 text-red-500" />
                                )}
                              </div>
                            </div>
                            <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {new Date(log.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Routes Tab */}
        {activeTab === 'routes' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Patrol Routes ({routes.length})
              </h2>
              <button
                onClick={() => setShowRouteForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t('tools.patrolLog.addRoute', 'Add Route')}
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {routes.map((route) => (
                <div
                  key={route.id}
                  className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 shadow`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/10 rounded-full">
                        <Navigation className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {route.name}
                        </div>
                        <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {route.checkpoints.length} checkpoints
                        </div>
                      </div>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        route.isActive
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                      }`}
                    >
                      {route.isActive ? t('tools.patrolLog.active', 'Active') : t('tools.patrolLog.inactive', 'Inactive')}
                    </span>
                  </div>
                  {route.description && (
                    <p className={`text-sm mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {route.description}
                    </p>
                  )}
                  <div className={`text-sm space-y-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    <div>
                      <Clock className="w-3 h-3 inline mr-1" />
                      {route.estimatedDuration} mins | {route.frequency}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => {
                        setNewRoute({
                          ...route,
                          name: `${route.name} (Copy)`,
                        });
                        setShowRouteForm(true);
                      }}
                      className={`flex-1 py-1 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} hover:bg-gray-100 dark:hover:bg-gray-700 rounded`}
                    >
                      {t('tools.patrolLog.duplicate', 'Duplicate')}
                    </button>
                    <button
                      onClick={() => deleteRouteBackend(route.id)}
                      className="flex-1 py-1 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active Patrol Tab */}
        {activeTab === 'active' && (
          <div className="space-y-6">
            {activePatrol ? (
              <>
                {/* Active Patrol Header */}
                <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-green-500 rounded-lg">
                        <Play className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {t('tools.patrolLog.patrolInProgress', 'Patrol In Progress')}
                        </h2>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {routes.find((r) => r.id === activePatrol.routeId)?.name} | {activePatrol.guardName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Started: {new Date(activePatrol.startTime).toLocaleTimeString()}
                      </div>
                      <button
                        onClick={() => completePatrol()}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                      >
                        <CheckCircle className="w-4 h-4" />
                        {t('tools.patrolLog.completePatrol', 'Complete Patrol')}
                      </button>
                    </div>
                  </div>

                  {/* Checkpoint Progress */}
                  <div className="relative pt-4">
                    <div className="flex justify-between mb-2">
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {t('tools.patrolLog.progress', 'Progress')}
                      </span>
                      <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {activePatrol.checkpointLogs.filter((c) => c.status !== 'pending').length}/
                        {activePatrol.checkpointLogs.length}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all"
                        style={{
                          width: `${
                            (activePatrol.checkpointLogs.filter((c) => c.status !== 'pending').length /
                              activePatrol.checkpointLogs.length) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Checkpoints List */}
                <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow overflow-hidden`}>
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {activePatrol.checkpointLogs.map((log, index) => {
                      const route = routes.find((r) => r.id === activePatrol.routeId);
                      const checkpoint = route?.checkpoints.find((c) => c.id === log.checkpointId);
                      return (
                        <div key={log.checkpointId} className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                  log.status === 'checked'
                                    ? 'bg-green-500 text-white'
                                    : log.status === 'issue'
                                    ? 'bg-red-500 text-white'
                                    : log.status === 'skipped'
                                    ? 'bg-gray-500 text-white'
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                }`}
                              >
                                {log.status === 'checked' ? (
                                  <CheckCircle className="w-4 h-4" />
                                ) : log.status === 'issue' ? (
                                  <AlertCircle className="w-4 h-4" />
                                ) : (
                                  index + 1
                                )}
                              </div>
                              <div>
                                <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                  {checkpoint?.name || 'Unknown Checkpoint'}
                                </div>
                                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                  <MapPin className="w-3 h-3 inline mr-1" />
                                  {checkpoint?.location || 'No location'}
                                </div>
                              </div>
                            </div>
                            {log.status === 'pending' ? (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => checkCheckpoint(log.checkpointId, 'checked')}
                                  className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                                >
                                  {t('tools.patrolLog.check', 'Check')}
                                </button>
                                <button
                                  onClick={() => checkCheckpoint(log.checkpointId, 'issue', 'Issue reported')}
                                  className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                                >
                                  {t('tools.patrolLog.issue', 'Issue')}
                                </button>
                                <button
                                  onClick={() => checkCheckpoint(log.checkpointId, 'skipped')}
                                  className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                                >
                                  {t('tools.patrolLog.skip', 'Skip')}
                                </button>
                              </div>
                            ) : (
                              <div className="text-right">
                                <span
                                  className={`text-xs px-2 py-1 rounded-full ${
                                    log.status === 'checked'
                                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                      : log.status === 'issue'
                                      ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                                  }`}
                                >
                                  {log.status}
                                </span>
                                {log.checkedAt && (
                                  <div className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {new Date(log.checkedAt).toLocaleTimeString()}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-8 shadow text-center`}>
                <Footprints className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                <p className={`mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.patrolLog.noActivePatrolStartA', 'No active patrol. Start a new patrol to begin tracking.')}
                </p>
                <button
                  onClick={() => setShowPatrolForm(true)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  {t('tools.patrolLog.startPatrol2', 'Start Patrol')}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Add Route Modal */}
        {showRouteForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-full max-w-2xl my-8`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.patrolLog.addPatrolRoute', 'Add Patrol Route')}
                </h3>
                <button onClick={() => setShowRouteForm(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.patrolLog.routeName', 'Route Name *')}
                  </label>
                  <input
                    type="text"
                    value={newRoute.name}
                    onChange={(e) => setNewRoute({ ...newRoute, name: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.patrolLog.description', 'Description')}
                  </label>
                  <textarea
                    value={newRoute.description}
                    onChange={(e) => setNewRoute({ ...newRoute, description: e.target.value })}
                    rows={2}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.patrolLog.estimatedDurationMins', 'Estimated Duration (mins)')}
                    </label>
                    <input
                      type="number"
                      min="5"
                      value={newRoute.estimatedDuration}
                      onChange={(e) => setNewRoute({ ...newRoute, estimatedDuration: parseInt(e.target.value) || 30 })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.patrolLog.frequency', 'Frequency')}
                    </label>
                    <select
                      value={newRoute.frequency}
                      onChange={(e) => setNewRoute({ ...newRoute, frequency: e.target.value as PatrolRoute['frequency'] })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="hourly">{t('tools.patrolLog.hourly', 'Hourly')}</option>
                      <option value="every-2-hours">{t('tools.patrolLog.every2Hours', 'Every 2 Hours')}</option>
                      <option value="every-4-hours">{t('tools.patrolLog.every4Hours', 'Every 4 Hours')}</option>
                      <option value="daily">{t('tools.patrolLog.daily', 'Daily')}</option>
                      <option value="custom">{t('tools.patrolLog.custom', 'Custom')}</option>
                    </select>
                  </div>
                </div>

                {/* Checkpoints */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Checkpoints ({newRoute.checkpoints?.length || 0})
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowCheckpointForm(true)}
                      className="text-sm text-blue-500 hover:underline"
                    >
                      {t('tools.patrolLog.addCheckpoint', '+ Add Checkpoint')}
                    </button>
                  </div>
                  {(newRoute.checkpoints || []).map((cp, idx) => (
                    <div
                      key={cp.id}
                      className={`flex items-center justify-between p-3 mb-2 rounded ${
                        theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm`}>
                          {idx + 1}
                        </span>
                        <div>
                          <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {cp.name}
                          </div>
                          {cp.location && (
                            <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {cp.location}
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeCheckpoint(cp.id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowRouteForm(false)}
                  className={`flex-1 py-2 rounded-lg border ${
                    theme === 'dark' ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-700'
                  }`}
                >
                  {t('tools.patrolLog.cancel', 'Cancel')}
                </button>
                <button
                  onClick={addRoute}
                  className="flex-1 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  {t('tools.patrolLog.addRoute2', 'Add Route')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Checkpoint Modal */}
        {showCheckpointForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-full max-w-md`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.patrolLog.addCheckpoint2', 'Add Checkpoint')}
                </h3>
                <button onClick={() => setShowCheckpointForm(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.patrolLog.name', 'Name *')}
                  </label>
                  <input
                    type="text"
                    value={newCheckpoint.name}
                    onChange={(e) => setNewCheckpoint({ ...newCheckpoint, name: e.target.value })}
                    placeholder={t('tools.patrolLog.eGMainEntrance', 'e.g., Main Entrance')}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.patrolLog.location', 'Location')}
                  </label>
                  <input
                    type="text"
                    value={newCheckpoint.location}
                    onChange={(e) => setNewCheckpoint({ ...newCheckpoint, location: e.target.value })}
                    placeholder={t('tools.patrolLog.eGBuildingAFloor', 'e.g., Building A, Floor 1')}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCheckpointForm(false)}
                  className={`flex-1 py-2 rounded-lg border ${
                    theme === 'dark' ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-700'
                  }`}
                >
                  {t('tools.patrolLog.cancel2', 'Cancel')}
                </button>
                <button
                  onClick={addCheckpoint}
                  className="flex-1 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  {t('tools.patrolLog.addCheckpoint3', 'Add Checkpoint')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Start Patrol Modal */}
        {showPatrolForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-full max-w-md`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.patrolLog.startPatrol3', 'Start Patrol')}
                </h3>
                <button onClick={() => setShowPatrolForm(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target as HTMLFormElement);
                  const routeId = formData.get('routeId') as string;
                  const guardName = formData.get('guardName') as string;
                  if (routeId && guardName) {
                    startPatrol(routeId, guardName);
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.patrolLog.selectRoute', 'Select Route *')}
                  </label>
                  <select
                    name="routeId"
                    required
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="">{t('tools.patrolLog.selectARoute', 'Select a route')}</option>
                    {routes.filter((r) => r.isActive).map((route) => (
                      <option key={route.id} value={route.id}>
                        {route.name} ({route.checkpoints.length} checkpoints)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.patrolLog.guardName', 'Guard Name *')}
                  </label>
                  <input
                    type="text"
                    name="guardName"
                    required
                    placeholder={t('tools.patrolLog.enterYourName', 'Enter your name')}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowPatrolForm(false)}
                    className={`flex-1 py-2 rounded-lg border ${
                      theme === 'dark' ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-700'
                    }`}
                  >
                    {t('tools.patrolLog.cancel3', 'Cancel')}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    {t('tools.patrolLog.startPatrol4', 'Start Patrol')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
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
}

export default PatrolLogTool;
