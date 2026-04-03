'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Clock,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Save,
  Loader2,
  Filter,
  ChevronDown,
  AlertTriangle,
  Zap,
  Settings,
  Users,
  Package,
  BarChart3,
  Timer,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import ExportDropdown from '../ui/ExportDropdown';
import SyncStatus from '../ui/SyncStatus';
import { useToolData } from '../../hooks/useToolData';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';

// Interfaces
interface DowntimeEvent {
  id: string;
  machine_id: string;
  machine_name: string;
  work_center: string;
  downtime_type: 'planned' | 'unplanned' | 'breakdown' | 'changeover' | 'maintenance';
  reason_code: string;
  reason_detail: string;
  start_time: string;
  end_time?: string;
  duration_minutes: number;
  production_loss?: number;
  operator?: string;
  shift: 'day' | 'evening' | 'night';
  root_cause?: string;
  corrective_action?: string;
  parts_affected?: number;
  cost_impact?: number;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

interface DowntimeLogToolProps {
  uiConfig?: any;
}

// Configuration
const downtimeTypes = [
  { value: 'planned', label: 'Planned', color: 'blue' },
  { value: 'unplanned', label: 'Unplanned', color: 'orange' },
  { value: 'breakdown', label: 'Breakdown', color: 'red' },
  { value: 'changeover', label: 'Changeover', color: 'purple' },
  { value: 'maintenance', label: 'Maintenance', color: 'green' },
];

const reasonCodes = [
  { code: 'EQ-001', label: 'Equipment Failure' },
  { code: 'EQ-002', label: 'Power Outage' },
  { code: 'EQ-003', label: 'Tooling Issue' },
  { code: 'MT-001', label: 'Scheduled Maintenance' },
  { code: 'MT-002', label: 'Emergency Repair' },
  { code: 'OP-001', label: 'Operator Error' },
  { code: 'OP-002', label: 'No Operator Available' },
  { code: 'MAT-001', label: 'Material Shortage' },
  { code: 'MAT-002', label: 'Wrong Material' },
  { code: 'QC-001', label: 'Quality Hold' },
  { code: 'CH-001', label: 'Product Changeover' },
  { code: 'OT-001', label: 'Other' },
];

const shifts = [
  { value: 'day', label: 'Day Shift (6AM-2PM)' },
  { value: 'evening', label: 'Evening Shift (2PM-10PM)' },
  { value: 'night', label: 'Night Shift (10PM-6AM)' },
];

// Column configuration for exports
const downtimeColumns: ColumnConfig[] = [
  { key: 'machine_name', header: 'Machine', type: 'string' },
  { key: 'work_center', header: 'Work Center', type: 'string' },
  { key: 'downtime_type', header: 'Type', type: 'string' },
  { key: 'reason_code', header: 'Reason Code', type: 'string' },
  { key: 'reason_detail', header: 'Reason', type: 'string' },
  { key: 'start_time', header: 'Start', type: 'date' },
  { key: 'end_time', header: 'End', type: 'date' },
  { key: 'duration_minutes', header: 'Duration (min)', type: 'number' },
  { key: 'shift', header: 'Shift', type: 'string' },
  { key: 'operator', header: 'Operator', type: 'string' },
  { key: 'cost_impact', header: 'Cost Impact', type: 'currency' },
];

// Generate sample data
const generateSampleData = (): DowntimeEvent[] => {
  const now = new Date();
  return [
    {
      id: 'dt-001',
      machine_id: 'CNC-001',
      machine_name: 'CNC Milling Machine #1',
      work_center: 'Machining',
      downtime_type: 'breakdown',
      reason_code: 'EQ-001',
      reason_detail: 'Spindle motor overheating',
      start_time: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
      end_time: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      duration_minutes: 120,
      production_loss: 50,
      operator: 'John Smith',
      shift: 'day',
      root_cause: 'Cooling system failure',
      corrective_action: 'Replaced coolant pump',
      parts_affected: 50,
      cost_impact: 2500,
      created_at: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'dt-002',
      machine_id: 'PRESS-002',
      machine_name: 'Hydraulic Press #2',
      work_center: 'Forming',
      downtime_type: 'changeover',
      reason_code: 'CH-001',
      reason_detail: 'Product changeover for new batch',
      start_time: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(),
      end_time: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString(),
      duration_minutes: 60,
      operator: 'Mike Johnson',
      shift: 'day',
      parts_affected: 0,
      cost_impact: 500,
      notes: 'Standard changeover procedure',
      created_at: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'dt-003',
      machine_id: 'LATHE-003',
      machine_name: 'Lathe Machine #3',
      work_center: 'Turning',
      downtime_type: 'maintenance',
      reason_code: 'MT-001',
      reason_detail: 'Scheduled preventive maintenance',
      start_time: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
      end_time: new Date(now.getTime() - 20 * 60 * 60 * 1000).toISOString(),
      duration_minutes: 240,
      operator: 'Maintenance Team',
      shift: 'night',
      corrective_action: 'Completed PM checklist',
      cost_impact: 300,
      created_at: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
    },
  ];
};

// Generate unique ID
const generateId = (prefix: string): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const DowntimeLogTool: React.FC<DowntimeLogToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Use tool data hook for backend sync
  const {
    data: events,
    setData: setEvents,
    isLoading: loading,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    addItem,
    updateItem,
    deleteItem,
    forceSync,
  } = useToolData<DowntimeEvent>('downtime-log', generateSampleData(), downtimeColumns, {
    autoSave: true,
    autoSaveDelay: 1000,
  });

  // UI states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('');
  const [filterShift, setFilterShift] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<DowntimeEvent | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    machine_id: '',
    machine_name: '',
    work_center: '',
    downtime_type: 'unplanned' as DowntimeEvent['downtime_type'],
    reason_code: '',
    reason_detail: '',
    start_time: new Date().toISOString().slice(0, 16),
    end_time: '',
    duration_minutes: 0,
    production_loss: 0,
    operator: '',
    shift: 'day' as DowntimeEvent['shift'],
    root_cause: '',
    corrective_action: '',
    parts_affected: 0,
    cost_impact: 0,
    notes: '',
  });

  // Filter events
  const filteredEvents = events.filter(event => {
    const matchesSearch = !searchQuery ||
      event.machine_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.reason_detail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.reason_code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !filterType || event.downtime_type === filterType;
    const matchesShift = !filterShift || event.shift === filterShift;
    return matchesSearch && matchesType && matchesShift;
  });

  // Stats
  const stats = {
    totalEvents: events.length,
    totalMinutes: events.reduce((sum, e) => sum + e.duration_minutes, 0),
    totalHours: Math.round(events.reduce((sum, e) => sum + e.duration_minutes, 0) / 60 * 10) / 10,
    unplanned: events.filter(e => e.downtime_type === 'unplanned' || e.downtime_type === 'breakdown').length,
    totalCost: events.reduce((sum, e) => sum + (e.cost_impact || 0), 0),
    avgDuration: events.length > 0 ? Math.round(events.reduce((sum, e) => sum + e.duration_minutes, 0) / events.length) : 0,
  };

  // Calculate duration
  const calculateDuration = (start: string, end: string): number => {
    if (!start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    return Math.max(0, Math.round((endDate.getTime() - startDate.getTime()) / 60000));
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const duration = formData.end_time
        ? calculateDuration(formData.start_time, formData.end_time)
        : formData.duration_minutes;

      if (editingEvent) {
        updateItem(editingEvent.id, {
          ...formData,
          duration_minutes: duration,
          updated_at: new Date().toISOString(),
        });
      } else {
        const newEvent: DowntimeEvent = {
          id: generateId('dt'),
          ...formData,
          duration_minutes: duration,
          created_at: new Date().toISOString(),
        };
        addItem(newEvent);
      }

      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving event:', error);
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      machine_id: '',
      machine_name: '',
      work_center: '',
      downtime_type: 'unplanned',
      reason_code: '',
      reason_detail: '',
      start_time: new Date().toISOString().slice(0, 16),
      end_time: '',
      duration_minutes: 0,
      production_loss: 0,
      operator: '',
      shift: 'day',
      root_cause: '',
      corrective_action: '',
      parts_affected: 0,
      cost_impact: 0,
      notes: '',
    });
    setEditingEvent(null);
  };

  const openEditModal = (event: DowntimeEvent) => {
    setEditingEvent(event);
    setFormData({
      machine_id: event.machine_id,
      machine_name: event.machine_name,
      work_center: event.work_center,
      downtime_type: event.downtime_type,
      reason_code: event.reason_code,
      reason_detail: event.reason_detail,
      start_time: event.start_time.slice(0, 16),
      end_time: event.end_time?.slice(0, 16) || '',
      duration_minutes: event.duration_minutes,
      production_loss: event.production_loss || 0,
      operator: event.operator || '',
      shift: event.shift,
      root_cause: event.root_cause || '',
      corrective_action: event.corrective_action || '',
      parts_affected: event.parts_affected || 0,
      cost_impact: event.cost_impact || 0,
      notes: event.notes || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Confirm Delete',
      message: 'Are you sure you want to delete this downtime event?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteItem(id);
    }
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      planned: 'bg-blue-500/20 text-blue-400',
      unplanned: 'bg-orange-500/20 text-orange-400',
      breakdown: 'bg-red-500/20 text-red-400',
      changeover: 'bg-purple-500/20 text-purple-400',
      maintenance: 'bg-green-500/20 text-green-400',
    };
    return colors[type] || colors.unplanned;
  };

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <Loader2 className="w-8 h-8 animate-spin text-red-500" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} p-4 md:p-6`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 ${isDark ? 'bg-red-500/20' : 'bg-red-100'} rounded-xl`}>
              <Clock className={`w-8 h-8 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.downtimeLog.downtimeLog', 'Downtime Log')}</h1>
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.downtimeLog.trackEquipmentDowntimeAndLosses', 'Track equipment downtime and losses')}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <WidgetEmbedButton toolSlug="downtime-log" toolName="Downtime Log" />

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
            <ExportDropdown
              onExportCSV={() => exportToCSV(events, downtimeColumns, { filename: 'downtime-log' })}
              onExportExcel={() => exportToExcel(events, downtimeColumns, { filename: 'downtime-log' })}
              onExportJSON={() => exportToJSON(events, { filename: 'downtime-log' })}
              onExportPDF={() => exportToPDF(events, downtimeColumns, { filename: 'downtime-log', title: 'Downtime Log Report' })}
              onPrint={() => printData(events, downtimeColumns, { title: 'Downtime Log Report' })}
              onCopyToClipboard={() => copyUtil(events, downtimeColumns)}
              disabled={events.length === 0}
              showImport={false}
              theme={isDark ? 'dark' : 'light'}
            />
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t('tools.downtimeLog.logDowntime', 'Log Downtime')}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.downtimeLog.events', 'Events')}</span>
            </div>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.totalEvents}</p>
          </div>
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <div className="flex items-center gap-2 mb-2">
              <Timer className="w-5 h-5 text-orange-500" />
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.downtimeLog.totalHours', 'Total Hours')}</span>
            </div>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.totalHours}</p>
          </div>
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.downtimeLog.unplanned', 'Unplanned')}</span>
            </div>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.unplanned}</p>
          </div>
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-5 h-5 text-blue-500" />
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.downtimeLog.avgDuration', 'Avg Duration')}</span>
            </div>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatDuration(stats.avgDuration)}</p>
          </div>
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm col-span-2`}>
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.downtimeLog.totalCostImpact', 'Total Cost Impact')}</span>
            </div>
            <p className={`text-2xl font-bold text-red-500`}>${stats.totalCost.toLocaleString()}</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={t('tools.downtimeLog.searchDowntimeEvents', 'Search downtime events...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-red-500`}
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${
                isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 flex flex-wrap gap-4">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className={`px-4 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                }`}
              >
                <option value="">{t('tools.downtimeLog.allTypes', 'All Types')}</option>
                {downtimeTypes.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              <select
                value={filterShift}
                onChange={(e) => setFilterShift(e.target.value)}
                className={`px-4 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                }`}
              >
                <option value="">{t('tools.downtimeLog.allShifts', 'All Shifts')}</option>
                {shifts.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Events Table */}
        <div className={`rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
                <tr>
                  <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.downtimeLog.machine', 'Machine')}</th>
                  <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.downtimeLog.type', 'Type')}</th>
                  <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.downtimeLog.reason', 'Reason')}</th>
                  <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.downtimeLog.startTime', 'Start Time')}</th>
                  <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.downtimeLog.duration', 'Duration')}</th>
                  <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.downtimeLog.shift', 'Shift')}</th>
                  <th className={`px-4 py-3 text-right text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.downtimeLog.cost', 'Cost')}</th>
                  <th className={`px-4 py-3 text-right text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.downtimeLog.actions', 'Actions')}</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {filteredEvents.map((event) => (
                  <tr key={event.id} className={isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}>
                    <td className="px-4 py-3">
                      <div className={isDark ? 'text-white' : 'text-gray-900'}>{event.machine_name}</div>
                      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{event.work_center}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(event.downtime_type)}`}>
                        {downtimeTypes.find(t => t.value === event.downtime_type)?.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className={isDark ? 'text-white' : 'text-gray-900'}>{event.reason_detail}</div>
                      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{event.reason_code}</div>
                    </td>
                    <td className={`px-4 py-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {new Date(event.start_time).toLocaleString()}
                    </td>
                    <td className={`px-4 py-3 font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {formatDuration(event.duration_minutes)}
                    </td>
                    <td className={`px-4 py-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {shifts.find(s => s.value === event.shift)?.label.split(' ')[0]}
                    </td>
                    <td className={`px-4 py-3 text-right ${event.cost_impact ? 'text-red-500' : (isDark ? 'text-gray-400' : 'text-gray-500')}`}>
                      {event.cost_impact ? `$${event.cost_impact.toLocaleString()}` : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(event)}
                          className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}
                        >
                          <Edit2 className="w-4 h-4 text-blue-500" />
                        </button>
                        <button
                          onClick={() => handleDelete(event.id)}
                          className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredEvents.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center">
                      <Clock className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                      <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.downtimeLog.noDowntimeEventsFound', 'No downtime events found')}</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
              <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {editingEvent ? t('tools.downtimeLog.editDowntimeEvent', 'Edit Downtime Event') : t('tools.downtimeLog.logDowntimeEvent', 'Log Downtime Event')}
                </h2>
                <button onClick={() => setShowModal(false)} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.downtimeLog.machineId', 'Machine ID *')}</label>
                    <input
                      type="text"
                      required
                      value={formData.machine_id}
                      onChange={(e) => setFormData({ ...formData, machine_id: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.downtimeLog.machineName', 'Machine Name *')}</label>
                    <input
                      type="text"
                      required
                      value={formData.machine_name}
                      onChange={(e) => setFormData({ ...formData, machine_name: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.downtimeLog.workCenter', 'Work Center *')}</label>
                    <input
                      type="text"
                      required
                      value={formData.work_center}
                      onChange={(e) => setFormData({ ...formData, work_center: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.downtimeLog.downtimeType', 'Downtime Type')}</label>
                    <select
                      value={formData.downtime_type}
                      onChange={(e) => setFormData({ ...formData, downtime_type: e.target.value as DowntimeEvent['downtime_type'] })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    >
                      {downtimeTypes.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.downtimeLog.reasonCode', 'Reason Code *')}</label>
                    <select
                      required
                      value={formData.reason_code}
                      onChange={(e) => {
                        const selected = reasonCodes.find(r => r.code === e.target.value);
                        setFormData({
                          ...formData,
                          reason_code: e.target.value,
                          reason_detail: selected?.label || formData.reason_detail,
                        });
                      }}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    >
                      <option value="">{t('tools.downtimeLog.selectReason', 'Select reason...')}</option>
                      {reasonCodes.map(r => (
                        <option key={r.code} value={r.code}>{r.code} - {r.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.downtimeLog.shift2', 'Shift')}</label>
                    <select
                      value={formData.shift}
                      onChange={(e) => setFormData({ ...formData, shift: e.target.value as DowntimeEvent['shift'] })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    >
                      {shifts.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.downtimeLog.startTime2', 'Start Time *')}</label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.start_time}
                      onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.downtimeLog.endTime', 'End Time')}</label>
                    <input
                      type="datetime-local"
                      value={formData.end_time}
                      onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.downtimeLog.operator', 'Operator')}</label>
                    <input
                      type="text"
                      value={formData.operator}
                      onChange={(e) => setFormData({ ...formData, operator: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.downtimeLog.costImpact', 'Cost Impact ($)')}</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.cost_impact}
                      onChange={(e) => setFormData({ ...formData, cost_impact: parseFloat(e.target.value) || 0 })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.downtimeLog.reasonDetail', 'Reason Detail')}</label>
                  <input
                    type="text"
                    value={formData.reason_detail}
                    onChange={(e) => setFormData({ ...formData, reason_detail: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.downtimeLog.rootCause', 'Root Cause')}</label>
                  <textarea
                    rows={2}
                    value={formData.root_cause}
                    onChange={(e) => setFormData({ ...formData, root_cause: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.downtimeLog.correctiveAction', 'Corrective Action')}</label>
                  <textarea
                    rows={2}
                    value={formData.corrective_action}
                    onChange={(e) => setFormData({ ...formData, corrective_action: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'}`}
                  >
                    {t('tools.downtimeLog.cancel', 'Cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {editingEvent ? t('tools.downtimeLog.update', 'Update') : t('tools.downtimeLog.log', 'Log')} Event
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        <ConfirmDialog />
      </div>
    </div>
  );
};

export default DowntimeLogTool;
