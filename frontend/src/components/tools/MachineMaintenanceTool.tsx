'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Settings,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Save,
  Loader2,
  Filter,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Wrench,
  Calendar,
  Activity,
  AlertCircle,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import ExportDropdown from '../ui/ExportDropdown';
import SyncStatus from '../ui/SyncStatus';
import { useToolData } from '../../hooks/useToolData';
import { useConfirmDialog } from '../ui/ConfirmDialog';
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
interface MaintenanceTask {
  id: string;
  machine_id: string;
  machine_name: string;
  task_type: 'preventive' | 'corrective' | 'predictive' | 'emergency';
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'scheduled' | 'in-progress' | 'completed' | 'overdue' | 'cancelled';
  assigned_to: string;
  scheduled_date: string;
  completed_date?: string;
  estimated_hours: number;
  actual_hours?: number;
  parts_used?: string;
  cost?: number;
  next_due_date?: string;
  frequency?: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

interface MachineMaintenanceToolProps {
  uiConfig?: any;
}

// Status configurations
const taskStatuses = [
  { value: 'scheduled', label: 'Scheduled', icon: Calendar, color: 'gray' },
  { value: 'in-progress', label: 'In Progress', icon: Wrench, color: 'blue' },
  { value: 'completed', label: 'Completed', icon: CheckCircle2, color: 'green' },
  { value: 'overdue', label: 'Overdue', icon: AlertCircle, color: 'red' },
  { value: 'cancelled', label: 'Cancelled', icon: X, color: 'gray' },
];

const taskTypes = [
  { value: 'preventive', label: 'Preventive', color: 'blue' },
  { value: 'corrective', label: 'Corrective', color: 'orange' },
  { value: 'predictive', label: 'Predictive', color: 'purple' },
  { value: 'emergency', label: 'Emergency', color: 'red' },
];

const priorityLevels = [
  { value: 'low', label: 'Low', color: 'gray' },
  { value: 'medium', label: 'Medium', color: 'blue' },
  { value: 'high', label: 'High', color: 'orange' },
  { value: 'critical', label: 'Critical', color: 'red' },
];

// Column configuration for exports
const maintenanceColumns: ColumnConfig[] = [
  { key: 'machine_name', header: 'Machine', type: 'string' },
  { key: 'title', header: 'Task', type: 'string' },
  { key: 'task_type', header: 'Type', type: 'string' },
  { key: 'priority', header: 'Priority', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'assigned_to', header: 'Assigned To', type: 'string' },
  { key: 'scheduled_date', header: 'Scheduled', type: 'date' },
  { key: 'completed_date', header: 'Completed', type: 'date' },
  { key: 'estimated_hours', header: 'Est. Hours', type: 'number' },
  { key: 'actual_hours', header: 'Actual Hours', type: 'number' },
  { key: 'cost', header: 'Cost', type: 'currency' },
];

// Generate sample data
const generateSampleData = (): MaintenanceTask[] => {
  return [
    {
      id: 'mt-001',
      machine_id: 'CNC-001',
      machine_name: 'CNC Milling Machine #1',
      task_type: 'preventive',
      title: 'Quarterly Lubrication',
      description: 'Lubricate all moving parts and check oil levels',
      priority: 'medium',
      status: 'scheduled',
      assigned_to: 'John Tech',
      scheduled_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      estimated_hours: 2,
      frequency: 'Quarterly',
      next_due_date: new Date(Date.now() + 92 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      created_at: new Date().toISOString(),
    },
    {
      id: 'mt-002',
      machine_id: 'LATHE-002',
      machine_name: 'Lathe Machine #2',
      task_type: 'corrective',
      title: 'Spindle Bearing Replacement',
      description: 'Replace worn spindle bearings causing vibration',
      priority: 'high',
      status: 'in-progress',
      assigned_to: 'Mike Mechanic',
      scheduled_date: new Date().toISOString().split('T')[0],
      estimated_hours: 6,
      parts_used: 'Spindle Bearing Set (2x)',
      cost: 450,
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'mt-003',
      machine_id: 'PRESS-003',
      machine_name: 'Hydraulic Press #3',
      task_type: 'preventive',
      title: 'Annual Safety Inspection',
      description: 'Complete safety inspection and certification',
      priority: 'critical',
      status: 'overdue',
      assigned_to: 'Safety Team',
      scheduled_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      estimated_hours: 4,
      frequency: 'Annual',
      created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'mt-004',
      machine_id: 'WELD-001',
      machine_name: 'Welding Robot #1',
      task_type: 'predictive',
      title: 'Motor Vibration Analysis',
      description: 'Analyze motor vibration patterns for early failure detection',
      priority: 'medium',
      status: 'completed',
      assigned_to: 'Tech Team',
      scheduled_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      completed_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      estimated_hours: 2,
      actual_hours: 2.5,
      notes: 'Vibration levels within acceptable range',
      created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];
};

// Generate unique ID
const generateId = (prefix: string): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const MachineMaintenanceTool: React.FC<MachineMaintenanceToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Use tool data hook for backend sync
  const {
    data: tasks,
    setData: setTasks,
    isLoading: loading,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    addItem,
    updateItem,
    deleteItem,
    forceSync,
  } = useToolData<MaintenanceTask>('machine-maintenance', generateSampleData(), maintenanceColumns, {
    autoSave: true,
    autoSaveDelay: 1000,
  });

  // UI states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');
  const [filterPriority, setFilterPriority] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<MaintenanceTask | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    machine_id: '',
    machine_name: '',
    task_type: 'preventive' as MaintenanceTask['task_type'],
    title: '',
    description: '',
    priority: 'medium' as MaintenanceTask['priority'],
    status: 'scheduled' as MaintenanceTask['status'],
    assigned_to: '',
    scheduled_date: new Date().toISOString().split('T')[0],
    completed_date: '',
    estimated_hours: 1,
    actual_hours: 0,
    parts_used: '',
    cost: 0,
    frequency: '',
    notes: '',
  });

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = !searchQuery ||
      task.machine_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.assigned_to.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !filterStatus || task.status === filterStatus;
    const matchesType = !filterType || task.task_type === filterType;
    const matchesPriority = !filterPriority || task.priority === filterPriority;
    return matchesSearch && matchesStatus && matchesType && matchesPriority;
  });

  // Stats
  const stats = {
    total: tasks.length,
    scheduled: tasks.filter(t => t.status === 'scheduled').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    overdue: tasks.filter(t => t.status === 'overdue').length,
    totalCost: tasks.reduce((sum, t) => sum + (t.cost || 0), 0),
    totalHours: tasks.reduce((sum, t) => sum + (t.actual_hours || t.estimated_hours), 0),
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingTask) {
        updateItem(editingTask.id, {
          ...formData,
          updated_at: new Date().toISOString(),
        });
      } else {
        const newTask: MaintenanceTask = {
          id: generateId('mt'),
          ...formData,
          created_at: new Date().toISOString(),
        };
        addItem(newTask);
      }

      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving task:', error);
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      machine_id: '',
      machine_name: '',
      task_type: 'preventive',
      title: '',
      description: '',
      priority: 'medium',
      status: 'scheduled',
      assigned_to: '',
      scheduled_date: new Date().toISOString().split('T')[0],
      completed_date: '',
      estimated_hours: 1,
      actual_hours: 0,
      parts_used: '',
      cost: 0,
      frequency: '',
      notes: '',
    });
    setEditingTask(null);
  };

  const openEditModal = (task: MaintenanceTask) => {
    setEditingTask(task);
    setFormData({
      machine_id: task.machine_id,
      machine_name: task.machine_name,
      task_type: task.task_type,
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      status: task.status,
      assigned_to: task.assigned_to,
      scheduled_date: task.scheduled_date,
      completed_date: task.completed_date || '',
      estimated_hours: task.estimated_hours,
      actual_hours: task.actual_hours || 0,
      parts_used: task.parts_used || '',
      cost: task.cost || 0,
      frequency: task.frequency || '',
      notes: task.notes || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Maintenance Task',
      message: 'Are you sure you want to delete this maintenance task? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteItem(id);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      scheduled: 'bg-gray-500/20 text-gray-400',
      'in-progress': 'bg-blue-500/20 text-blue-400',
      completed: 'bg-green-500/20 text-green-400',
      overdue: 'bg-red-500/20 text-red-400',
      cancelled: 'bg-gray-500/20 text-gray-400',
    };
    return colors[status] || colors.scheduled;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      preventive: 'bg-blue-500/20 text-blue-400',
      corrective: 'bg-orange-500/20 text-orange-400',
      predictive: 'bg-purple-500/20 text-purple-400',
      emergency: 'bg-red-500/20 text-red-400',
    };
    return colors[type] || colors.preventive;
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'bg-gray-500/20 text-gray-400',
      medium: 'bg-blue-500/20 text-blue-400',
      high: 'bg-orange-500/20 text-orange-400',
      critical: 'bg-red-500/20 text-red-400',
    };
    return colors[priority] || colors.medium;
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} p-4 md:p-6`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 ${isDark ? 'bg-orange-500/20' : 'bg-orange-100'} rounded-xl`}>
              <Settings className={`w-8 h-8 ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.machineMaintenance.machineMaintenance', 'Machine Maintenance')}</h1>
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.machineMaintenance.trackAndScheduleEquipmentMaintenance', 'Track and schedule equipment maintenance')}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <WidgetEmbedButton toolSlug="machine-maintenance" toolName="Machine Maintenance" />

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
              onExportCSV={() => exportToCSV(tasks, maintenanceColumns, { filename: 'machine-maintenance' })}
              onExportExcel={() => exportToExcel(tasks, maintenanceColumns, { filename: 'machine-maintenance' })}
              onExportJSON={() => exportToJSON(tasks, { filename: 'machine-maintenance' })}
              onExportPDF={() => exportToPDF(tasks, maintenanceColumns, { filename: 'machine-maintenance', title: 'Machine Maintenance Log' })}
              onPrint={() => printData(tasks, maintenanceColumns, { title: 'Machine Maintenance Log' })}
              onCopyToClipboard={() => copyUtil(tasks, maintenanceColumns)}
              disabled={tasks.length === 0}
              showImport={false}
              theme={isDark ? 'dark' : 'light'}
            />
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t('tools.machineMaintenance.newTask', 'New Task')}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <div className="flex items-center gap-2 mb-2">
              <Wrench className="w-5 h-5 text-orange-500" />
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.machineMaintenance.total', 'Total')}</span>
            </div>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.total}</p>
          </div>
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-gray-500" />
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.machineMaintenance.scheduled', 'Scheduled')}</span>
            </div>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.scheduled}</p>
          </div>
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-5 h-5 text-blue-500" />
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.machineMaintenance.inProgress', 'In Progress')}</span>
            </div>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.inProgress}</p>
          </div>
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.machineMaintenance.completed', 'Completed')}</span>
            </div>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.completed}</p>
          </div>
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.machineMaintenance.overdue', 'Overdue')}</span>
            </div>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.overdue}</p>
          </div>
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-purple-500" />
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.machineMaintenance.totalHours', 'Total Hours')}</span>
            </div>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.totalHours.toFixed(1)}</p>
          </div>
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.machineMaintenance.totalCost', 'Total Cost')}</span>
            </div>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>${stats.totalCost.toLocaleString()}</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={t('tools.machineMaintenance.searchMaintenanceTasks', 'Search maintenance tasks...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-orange-500`}
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
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className={`px-4 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                }`}
              >
                <option value="">{t('tools.machineMaintenance.allStatuses', 'All Statuses')}</option>
                {taskStatuses.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className={`px-4 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                }`}
              >
                <option value="">{t('tools.machineMaintenance.allTypes', 'All Types')}</option>
                {taskTypes.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className={`px-4 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                }`}
              >
                <option value="">{t('tools.machineMaintenance.allPriorities', 'All Priorities')}</option>
                {priorityLevels.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Tasks Table */}
        <div className={`rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
                <tr>
                  <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.machineMaintenance.machine', 'Machine')}</th>
                  <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.machineMaintenance.task', 'Task')}</th>
                  <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.machineMaintenance.type', 'Type')}</th>
                  <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.machineMaintenance.priority', 'Priority')}</th>
                  <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.machineMaintenance.scheduled2', 'Scheduled')}</th>
                  <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.machineMaintenance.assigned', 'Assigned')}</th>
                  <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.machineMaintenance.status', 'Status')}</th>
                  <th className={`px-4 py-3 text-right text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.machineMaintenance.actions', 'Actions')}</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {filteredTasks.map((task) => (
                  <tr key={task.id} className={isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}>
                    <td className="px-4 py-3">
                      <div className={isDark ? 'text-white' : 'text-gray-900'}>{task.machine_name}</div>
                      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{task.machine_id}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className={isDark ? 'text-white' : 'text-gray-900'}>{task.title}</div>
                      {task.description && (
                        <div className={`text-sm truncate max-w-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{task.description}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(task.task_type)}`}>
                        {taskTypes.find(t => t.value === task.task_type)?.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                        {priorityLevels.find(p => p.value === task.priority)?.label}
                      </span>
                    </td>
                    <td className={`px-4 py-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {new Date(task.scheduled_date).toLocaleDateString()}
                    </td>
                    <td className={`px-4 py-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{task.assigned_to}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                        {taskStatuses.find(s => s.value === task.status)?.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(task)}
                          className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}
                        >
                          <Edit2 className="w-4 h-4 text-blue-500" />
                        </button>
                        <button
                          onClick={() => handleDelete(task.id)}
                          className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredTasks.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center">
                      <Settings className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                      <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.machineMaintenance.noMaintenanceTasksFound', 'No maintenance tasks found')}</p>
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
                  {editingTask ? t('tools.machineMaintenance.editMaintenanceTask', 'Edit Maintenance Task') : t('tools.machineMaintenance.newMaintenanceTask', 'New Maintenance Task')}
                </h2>
                <button onClick={() => setShowModal(false)} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.machineMaintenance.machineId', 'Machine ID *')}</label>
                    <input
                      type="text"
                      required
                      value={formData.machine_id}
                      onChange={(e) => setFormData({ ...formData, machine_id: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                      placeholder={t('tools.machineMaintenance.cnc001', 'CNC-001')}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.machineMaintenance.machineName', 'Machine Name *')}</label>
                    <input
                      type="text"
                      required
                      value={formData.machine_name}
                      onChange={(e) => setFormData({ ...formData, machine_name: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.machineMaintenance.taskTitle', 'Task Title *')}</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.machineMaintenance.taskType', 'Task Type')}</label>
                    <select
                      value={formData.task_type}
                      onChange={(e) => setFormData({ ...formData, task_type: e.target.value as MaintenanceTask['task_type'] })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    >
                      {taskTypes.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.machineMaintenance.priority2', 'Priority')}</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value as MaintenanceTask['priority'] })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    >
                      {priorityLevels.map(p => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.machineMaintenance.status2', 'Status')}</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as MaintenanceTask['status'] })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    >
                      {taskStatuses.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.machineMaintenance.assignedTo', 'Assigned To *')}</label>
                    <input
                      type="text"
                      required
                      value={formData.assigned_to}
                      onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.machineMaintenance.scheduledDate', 'Scheduled Date *')}</label>
                    <input
                      type="date"
                      required
                      value={formData.scheduled_date}
                      onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.machineMaintenance.completedDate', 'Completed Date')}</label>
                    <input
                      type="date"
                      value={formData.completed_date}
                      onChange={(e) => setFormData({ ...formData, completed_date: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.machineMaintenance.estimatedHours', 'Estimated Hours')}</label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={formData.estimated_hours}
                      onChange={(e) => setFormData({ ...formData, estimated_hours: parseFloat(e.target.value) || 0 })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.machineMaintenance.actualHours', 'Actual Hours')}</label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={formData.actual_hours}
                      onChange={(e) => setFormData({ ...formData, actual_hours: parseFloat(e.target.value) || 0 })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.machineMaintenance.cost', 'Cost ($)')}</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.cost}
                      onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.machineMaintenance.frequency', 'Frequency')}</label>
                    <input
                      type="text"
                      value={formData.frequency}
                      onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                      placeholder={t('tools.machineMaintenance.eGWeeklyMonthlyQuarterly', 'e.g., Weekly, Monthly, Quarterly')}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.machineMaintenance.description', 'Description')}</label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.machineMaintenance.partsUsed', 'Parts Used')}</label>
                  <input
                    type="text"
                    value={formData.parts_used}
                    onChange={(e) => setFormData({ ...formData, parts_used: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    placeholder={t('tools.machineMaintenance.listPartsUsed', 'List parts used')}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.machineMaintenance.notes', 'Notes')}</label>
                  <textarea
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'}`}
                  >
                    {t('tools.machineMaintenance.cancel', 'Cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {editingTask ? t('tools.machineMaintenance.update', 'Update') : t('tools.machineMaintenance.create', 'Create')} Task
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      <ConfirmDialog />
    </div>
  );
};

export default MachineMaintenanceTool;
