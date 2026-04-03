'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  Save,
  Search,
  X,
  RefreshCw,
  Clock,
  Bed,
  User,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import useToolData from '../../hooks/useToolData';
import { type ColumnConfig } from '../../lib/toolDataUtils';

interface HousekeepingScheduleToolProps {
  uiConfig?: UIConfig;
}

interface HousekeepingTask {
  id: string;
  roomNumber: string;
  taskType: TaskType;
  assignedTo: string;
  scheduledDate: string;
  scheduledTime: string;
  priority: Priority;
  status: TaskStatus;
  estimatedDuration: number;
  actualDuration: number;
  specialInstructions: string;
  supplies: string[];
  completedAt: string;
  notes: string;
  createdAt: string;
}

type TaskType = 'checkout-clean' | 'stayover' | 'deep-clean' | 'turndown' | 'inspection' | 'maintenance';
type Priority = 'urgent' | 'high' | 'normal' | 'low';
type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'skipped' | 'blocked';

const TASK_TYPES: { value: TaskType; label: string; duration: number }[] = [
  { value: 'checkout-clean', label: 'Checkout Clean', duration: 45 },
  { value: 'stayover', label: 'Stayover Service', duration: 20 },
  { value: 'deep-clean', label: 'Deep Clean', duration: 90 },
  { value: 'turndown', label: 'Turndown Service', duration: 15 },
  { value: 'inspection', label: 'Inspection', duration: 10 },
  { value: 'maintenance', label: 'Maintenance', duration: 30 },
];

const PRIORITIES: { value: Priority; label: string; color: string }[] = [
  { value: 'urgent', label: 'Urgent', color: 'red' },
  { value: 'high', label: 'High', color: 'orange' },
  { value: 'normal', label: 'Normal', color: 'blue' },
  { value: 'low', label: 'Low', color: 'gray' },
];

const TASK_STATUSES: { value: TaskStatus; label: string; color: string }[] = [
  { value: 'pending', label: 'Pending', color: 'yellow' },
  { value: 'in-progress', label: 'In Progress', color: 'blue' },
  { value: 'completed', label: 'Completed', color: 'green' },
  { value: 'skipped', label: 'Skipped', color: 'gray' },
  { value: 'blocked', label: 'Blocked', color: 'red' },
];

const housekeepingColumns: ColumnConfig[] = [
  { key: 'id', header: 'Task ID', type: 'string' },
  { key: 'roomNumber', header: 'Room', type: 'string' },
  { key: 'taskType', header: 'Task Type', type: 'string' },
  { key: 'assignedTo', header: 'Assigned To', type: 'string' },
  { key: 'scheduledDate', header: 'Date', type: 'date' },
  { key: 'scheduledTime', header: 'Time', type: 'string' },
  { key: 'priority', header: 'Priority', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'estimatedDuration', header: 'Est. Duration', type: 'number' },
];

const generateSampleTasks = (): HousekeepingTask[] => {
  const today = new Date().toISOString().split('T')[0];
  return [
    {
      id: 'HK-001',
      roomNumber: '201',
      taskType: 'checkout-clean',
      assignedTo: 'Maria Garcia',
      scheduledDate: today,
      scheduledTime: '10:00',
      priority: 'high',
      status: 'in-progress',
      estimatedDuration: 45,
      actualDuration: 0,
      specialInstructions: 'VIP checkout - extra attention needed',
      supplies: ['Fresh linens', 'Amenity kit premium'],
      completedAt: '',
      notes: '',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'HK-002',
      roomNumber: '305',
      taskType: 'stayover',
      assignedTo: 'James Wilson',
      scheduledDate: today,
      scheduledTime: '11:00',
      priority: 'normal',
      status: 'pending',
      estimatedDuration: 20,
      actualDuration: 0,
      specialInstructions: '',
      supplies: ['Towels', 'Toiletries'],
      completedAt: '',
      notes: '',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'HK-003',
      roomNumber: '102',
      taskType: 'deep-clean',
      assignedTo: 'Maria Garcia',
      scheduledDate: today,
      scheduledTime: '14:00',
      priority: 'normal',
      status: 'pending',
      estimatedDuration: 90,
      actualDuration: 0,
      specialInstructions: 'Carpet deep cleaning required',
      supplies: ['Carpet cleaner', 'Steam machine'],
      completedAt: '',
      notes: '',
      createdAt: new Date().toISOString(),
    },
  ];
};

export const HousekeepingScheduleTool: React.FC<HousekeepingScheduleToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const tasksData = useToolData<HousekeepingTask>(
    'housekeeping-tasks',
    generateSampleTasks(),
    housekeepingColumns,
    { autoSave: true }
  );

  const tasks = tasksData.data;

  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<HousekeepingTask | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<TaskStatus | ''>('');
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);

  const [newTask, setNewTask] = useState<Partial<HousekeepingTask>>({
    roomNumber: '',
    taskType: 'stayover',
    assignedTo: '',
    scheduledDate: new Date().toISOString().split('T')[0],
    scheduledTime: '09:00',
    priority: 'normal',
    status: 'pending',
    estimatedDuration: 20,
    specialInstructions: '',
    supplies: [],
    notes: '',
  });

  const handleAddTask = () => {
    if (!newTask.roomNumber || !newTask.assignedTo) return;

    const duration = TASK_TYPES.find(t => t.value === newTask.taskType)?.duration || 30;
    const task: HousekeepingTask = {
      id: `HK-${Date.now().toString().slice(-6)}`,
      roomNumber: newTask.roomNumber || '',
      taskType: newTask.taskType as TaskType || 'stayover',
      assignedTo: newTask.assignedTo || '',
      scheduledDate: newTask.scheduledDate || new Date().toISOString().split('T')[0],
      scheduledTime: newTask.scheduledTime || '09:00',
      priority: newTask.priority as Priority || 'normal',
      status: 'pending',
      estimatedDuration: newTask.estimatedDuration || duration,
      actualDuration: 0,
      specialInstructions: newTask.specialInstructions || '',
      supplies: newTask.supplies || [],
      completedAt: '',
      notes: newTask.notes || '',
      createdAt: new Date().toISOString(),
    };

    tasksData.addItem(task);
    setNewTask({
      roomNumber: '',
      taskType: 'stayover',
      assignedTo: '',
      scheduledDate: new Date().toISOString().split('T')[0],
      scheduledTime: '09:00',
      priority: 'normal',
      status: 'pending',
      estimatedDuration: 20,
      specialInstructions: '',
      supplies: [],
      notes: '',
    });
    setShowForm(false);
  };

  const handleUpdateTask = () => {
    if (!editingTask) return;
    tasksData.updateItem(editingTask.id, editingTask);
    setEditingTask(null);
  };

  const handleDeleteTask = useCallback(async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Task',
      message: 'Are you sure you want to delete this task? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      tasksData.deleteItem(id);
    }
  }, [confirm, tasksData]);

  const handleStatusChange = (id: string, status: TaskStatus) => {
    const updates: Partial<HousekeepingTask> = { status };
    if (status === 'completed') {
      updates.completedAt = new Date().toISOString();
    }
    tasksData.updateItem(id, updates);
  };

  const handleReset = useCallback(async () => {
    const confirmed = await confirm({
      title: 'Reset Tasks',
      message: 'Reset all tasks to sample data? This will overwrite all existing tasks.',
      confirmText: 'Reset',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      tasksData.resetToDefault(generateSampleTasks());
    }
  }, [confirm, tasksData]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!t.roomNumber.toLowerCase().includes(q) && !t.assignedTo.toLowerCase().includes(q)) return false;
      }
      if (filterStatus && t.status !== filterStatus) return false;
      if (filterDate && t.scheduledDate !== filterDate) return false;
      return true;
    });
  }, [tasks, searchQuery, filterStatus, filterDate]);

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayTasks = tasks.filter(t => t.scheduledDate === today);
    return {
      total: todayTasks.length,
      completed: todayTasks.filter(t => t.status === 'completed').length,
      inProgress: todayTasks.filter(t => t.status === 'in-progress').length,
      pending: todayTasks.filter(t => t.status === 'pending').length,
    };
  }, [tasks]);

  const inputClass = `w-full px-4 py-2.5 border ${isDark ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400' : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'} rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`;
  const cardClass = `p-4 rounded-xl ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`;

  const getStatusColor = (status: TaskStatus) => {
    const colors: Record<string, string> = {
      pending: isDark ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-700',
      'in-progress': isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700',
      completed: isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700',
      skipped: isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600',
      blocked: isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700',
    };
    return colors[status] || colors.pending;
  };

  const getPriorityColor = (priority: Priority) => {
    const colors: Record<string, string> = {
      urgent: 'text-red-500',
      high: 'text-orange-500',
      normal: 'text-blue-500',
      low: 'text-gray-500',
    };
    return colors[priority] || colors.normal;
  };

  const renderForm = (task: Partial<HousekeepingTask>, isEditing = false) => {
    const setData = isEditing
      ? (updates: Partial<HousekeepingTask>) => setEditingTask({ ...editingTask!, ...updates })
      : (updates: Partial<HousekeepingTask>) => setNewTask({ ...newTask, ...updates });

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.housekeepingSchedule.roomNumber', 'Room Number *')}</label>
            <input type="text" value={task.roomNumber || ''} onChange={(e) => setData({ roomNumber: e.target.value })} placeholder="e.g., 201" className={inputClass} />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.housekeepingSchedule.assignedTo', 'Assigned To *')}</label>
            <input type="text" value={task.assignedTo || ''} onChange={(e) => setData({ assignedTo: e.target.value })} placeholder={t('tools.housekeepingSchedule.staffName', 'Staff name')} className={inputClass} />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.housekeepingSchedule.taskType', 'Task Type')}</label>
            <select value={task.taskType || 'stayover'} onChange={(e) => { const type = TASK_TYPES.find(t => t.value === e.target.value); setData({ taskType: e.target.value as TaskType, estimatedDuration: type?.duration || 30 }); }} className={inputClass}>
              {TASK_TYPES.map(type => (<option key={type.value} value={type.value}>{type.label} ({type.duration}min)</option>))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.housekeepingSchedule.date', 'Date')}</label>
            <input type="date" value={task.scheduledDate || ''} onChange={(e) => setData({ scheduledDate: e.target.value })} className={inputClass} />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.housekeepingSchedule.time', 'Time')}</label>
            <input type="time" value={task.scheduledTime || ''} onChange={(e) => setData({ scheduledTime: e.target.value })} className={inputClass} />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.housekeepingSchedule.priority', 'Priority')}</label>
            <select value={task.priority || 'normal'} onChange={(e) => setData({ priority: e.target.value as Priority })} className={inputClass}>
              {PRIORITIES.map(p => (<option key={p.value} value={p.value}>{p.label}</option>))}
            </select>
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.housekeepingSchedule.durationMin', 'Duration (min)')}</label>
            <input type="number" value={task.estimatedDuration || 30} onChange={(e) => setData({ estimatedDuration: parseInt(e.target.value) || 30 })} min="5" className={inputClass} />
          </div>
        </div>

        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.housekeepingSchedule.specialInstructions', 'Special Instructions')}</label>
          <textarea value={task.specialInstructions || ''} onChange={(e) => setData({ specialInstructions: e.target.value })} placeholder={t('tools.housekeepingSchedule.anySpecialCleaningRequirements', 'Any special cleaning requirements...')} rows={2} className={inputClass} />
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className={cardClass}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488]/10 rounded-xl"><Sparkles className="w-6 h-6 text-[#0D9488]" /></div>
              <div>
                <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.housekeepingSchedule.housekeepingSchedule', 'Housekeeping Schedule')}</h1>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.housekeepingSchedule.manageRoomCleaningAndMaintenance', 'Manage room cleaning and maintenance tasks')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <WidgetEmbedButton toolSlug="housekeeping-schedule" toolName="Housekeeping Schedule" />

              <SyncStatus isSynced={tasksData.isSynced} isSaving={tasksData.isSaving} lastSaved={tasksData.lastSaved} syncError={tasksData.syncError} onForceSync={() => tasksData.forceSync()} theme={isDark ? 'dark' : 'light'} showLabel={true} size="sm" />
              <ExportDropdown onExportCSV={() => tasksData.exportCSV({ filename: 'housekeeping-schedule' })} onExportExcel={() => tasksData.exportExcel({ filename: 'housekeeping-schedule' })} onExportJSON={() => tasksData.exportJSON({ filename: 'housekeeping-schedule' })} onExportPDF={() => tasksData.exportPDF({ filename: 'housekeeping-schedule', title: 'Housekeeping Schedule' })} onPrint={() => tasksData.print('Housekeeping Schedule')} onCopyToClipboard={() => tasksData.copyToClipboard('tab')} theme={isDark ? 'dark' : 'light'} />
              <button onClick={handleReset} className={`px-4 py-2 rounded-lg flex items-center gap-2 text-red-500 ${isDark ? 'hover:bg-red-900/20' : 'hover:bg-red-50'}`}><RefreshCw className="w-4 h-4" />{t('tools.housekeepingSchedule.reset', 'Reset')}</button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={cardClass}><p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.housekeepingSchedule.todaySTasks', 'Today\'s Tasks')}</p><p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.total}</p></div>
          <div className={cardClass}><p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.housekeepingSchedule.completed', 'Completed')}</p><p className="text-2xl font-bold text-green-500">{stats.completed}</p></div>
          <div className={cardClass}><p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.housekeepingSchedule.inProgress', 'In Progress')}</p><p className="text-2xl font-bold text-blue-500">{stats.inProgress}</p></div>
          <div className={cardClass}><p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.housekeepingSchedule.pending', 'Pending')}</p><p className="text-2xl font-bold text-yellow-500">{stats.pending}</p></div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t('tools.housekeepingSchedule.searchTasks', 'Search tasks...')} className={`${inputClass} pl-10`} />
            </div>
          </div>
          <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className={`${inputClass} w-auto`} />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as TaskStatus | '')} className={`${inputClass} w-auto`}>
            <option value="">{t('tools.housekeepingSchedule.allStatuses', 'All Statuses')}</option>
            {TASK_STATUSES.map(s => (<option key={s.value} value={s.value}>{s.label}</option>))}
          </select>
          <button onClick={() => setShowForm(true)} className="px-4 py-2.5 bg-[#0D9488] text-white rounded-xl hover:bg-[#0B8276] flex items-center gap-2"><Plus className="w-5 h-5" />{t('tools.housekeepingSchedule.newTask', 'New Task')}</button>
        </div>

        {/* Forms */}
        {showForm && (
          <div className={cardClass}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.housekeepingSchedule.newTask2', 'New Task')}</h3>
              <button onClick={() => setShowForm(false)} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}><X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} /></button>
            </div>
            {renderForm(newTask)}
            <button onClick={handleAddTask} disabled={!newTask.roomNumber || !newTask.assignedTo} className="mt-4 w-full py-3 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] text-white font-medium rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"><Plus className="w-5 h-5" />{t('tools.housekeepingSchedule.addTask', 'Add Task')}</button>
          </div>
        )}

        {editingTask && (
          <div className={cardClass}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.housekeepingSchedule.editTask', 'Edit Task')}</h3>
              <button onClick={() => setEditingTask(null)} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}><X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} /></button>
            </div>
            {renderForm(editingTask, true)}
            <div className="flex gap-3 mt-4">
              <button onClick={handleUpdateTask} className="flex-1 py-3 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] text-white font-medium rounded-xl flex items-center justify-center gap-2"><Save className="w-5 h-5" />{t('tools.housekeepingSchedule.save', 'Save')}</button>
              <button onClick={() => setEditingTask(null)} className={`px-6 py-3 rounded-xl font-medium ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>{t('tools.housekeepingSchedule.cancel', 'Cancel')}</button>
            </div>
          </div>
        )}

        {/* Task List */}
        <div className="space-y-3">
          {filteredTasks.map(task => (
            <div key={task.id} className={cardClass}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Room {task.roomNumber}</h4>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(task.status)}`}>{TASK_STATUSES.find(s => s.value === task.status)?.label}</span>
                    <span className={`text-xs font-medium ${getPriorityColor(task.priority)}`}>{PRIORITIES.find(p => p.value === task.priority)?.label}</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div className="flex items-center gap-2"><Sparkles className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} /><span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{TASK_TYPES.find(t => t.value === task.taskType)?.label}</span></div>
                    <div className="flex items-center gap-2"><User className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} /><span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{task.assignedTo}</span></div>
                    <div className="flex items-center gap-2"><Clock className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} /><span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{task.scheduledTime} ({task.estimatedDuration}min)</span></div>
                  </div>
                  {task.specialInstructions && <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Note: {task.specialInstructions}</p>}
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {task.status === 'pending' && (<button onClick={() => handleStatusChange(task.id, 'in-progress')} className="p-2 rounded-lg text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/20" title={t('tools.housekeepingSchedule.start', 'Start')}><Clock className="w-4 h-4" /></button>)}
                  {task.status === 'in-progress' && (<button onClick={() => handleStatusChange(task.id, 'completed')} className="p-2 rounded-lg text-green-500 hover:bg-green-100 dark:hover:bg-green-900/20" title={t('tools.housekeepingSchedule.complete', 'Complete')}><CheckCircle className="w-4 h-4" /></button>)}
                  <button onClick={() => setEditingTask(task)} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}><Edit2 className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} /></button>
                  <button onClick={() => handleDeleteTask(task.id)} className="p-2 rounded-lg text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredTasks.length === 0 && (
          <div className={`text-center py-12 ${cardClass}`}>
            <Sparkles className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
            <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.housekeepingSchedule.noHousekeepingTasksFoundFor', 'No housekeeping tasks found for this date.')}</p>
          </div>
        )}
      </div>
      <ConfirmDialog />
    </div>
  );
};

export default HousekeepingScheduleTool;
