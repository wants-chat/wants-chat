'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Calendar,
  Clock,
  Plus,
  Edit2,
  Trash2,
  X,
  Search,
  Filter,
  Wrench,
  CheckCircle,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '@/services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import useToolData from '@/hooks/useToolData';
import {
  type ColumnConfig,
} from '@/lib/toolDataUtils';

// Types
interface MaintenanceTask {
  id: string;
  title: string;
  description: string;
  category: MaintenanceCategory;
  dueDate: string; // YYYY-MM-DD
  status: MaintenanceStatus;
  priority: MaintenancePriority;
  assignedTo: string;
  estimatedCost: number;
  actualCost?: number;
  notes: string;
  createdAt: string;
  completedAt?: string;
}

type MaintenanceCategory = 'equipment' | 'building' | 'vehicle' | 'software' | 'other';
type MaintenanceStatus = 'pending' | 'in-progress' | 'completed' | 'overdue';
type MaintenancePriority = 'low' | 'medium' | 'high' | 'critical';

interface MaintenanceSchedulerToolProps {
  uiConfig?: UIConfig;
}

// Constants
const CATEGORY_OPTIONS: { value: MaintenanceCategory; label: string; color: string }[] = [
  { value: 'equipment', label: 'Equipment', color: 'bg-blue-500' },
  { value: 'building', label: 'Building', color: 'bg-purple-500' },
  { value: 'vehicle', label: 'Vehicle', color: 'bg-green-500' },
  { value: 'software', label: 'Software', color: 'bg-orange-500' },
  { value: 'other', label: 'Other', color: 'bg-gray-500' },
];

const STATUS_OPTIONS: { value: MaintenanceStatus; label: string; color: string; icon: any }[] = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-500', icon: AlertCircle },
  { value: 'in-progress', label: 'In Progress', color: 'bg-blue-500', icon: Clock },
  { value: 'completed', label: 'Completed', color: 'bg-green-500', icon: CheckCircle },
  { value: 'overdue', label: 'Overdue', color: 'bg-red-500', icon: AlertCircle },
];

const PRIORITY_OPTIONS: { value: MaintenancePriority; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: 'text-green-600' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
  { value: 'high', label: 'High', color: 'text-orange-600' },
  { value: 'critical', label: 'Critical', color: 'text-red-600' },
];

// Column configuration for exports
const MAINTENANCE_COLUMNS: ColumnConfig[] = [
  { key: 'title', header: 'Title', type: 'string' },
  { key: 'description', header: 'Description', type: 'string' },
  { key: 'category', header: 'Category', type: 'string' },
  { key: 'dueDate', header: 'Due Date', type: 'date' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'priority', header: 'Priority', type: 'string' },
  { key: 'assignedTo', header: 'Assigned To', type: 'string' },
  { key: 'estimatedCost', header: 'Estimated Cost', type: 'number' },
  { key: 'actualCost', header: 'Actual Cost', type: 'number' },
  { key: 'notes', header: 'Notes', type: 'string' },
];

const generateId = (): string => {
  return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

const isOverdue = (dueDate: string, status: MaintenanceStatus): boolean => {
  if (status === 'completed' || status === 'overdue') return false;
  return new Date(dueDate) < new Date();
};

export const MaintenanceSchedulerTool: React.FC<MaintenanceSchedulerToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Use useToolData hook for backend sync
  const {
    data: tasks,
    addItem,
    updateItem,
    deleteItem,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<MaintenanceTask>(
    'maintenance-scheduler',
    [],
    MAINTENANCE_COLUMNS,
    { autoSave: true, autoSaveDelay: 1000 }
  );

  // Local UI state
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<MaintenanceTask | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<MaintenanceCategory | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<MaintenanceStatus | 'all'>('all');
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<MaintenanceTask>>({
    title: '',
    description: '',
    category: 'equipment',
    dueDate: new Date().toISOString().split('T')[0],
    status: 'pending',
    priority: 'medium',
    assignedTo: '',
    estimatedCost: 0,
    actualCost: undefined,
    notes: '',
  });

  // Handle prefill from uiConfig
  React.useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.title || params.description) {
        setFormData(prev => ({
          ...prev,
          title: params.title || prev.title,
          description: params.description || prev.description,
        }));
        setShowModal(true);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = searchQuery === '' ||
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.assignedTo.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = categoryFilter === 'all' || task.category === categoryFilter;
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [tasks, searchQuery, categoryFilter, statusFilter]);

  // Calculate stats
  const stats = useMemo(() => {
    return {
      total: tasks.length,
      pending: tasks.filter(t => t.status === 'pending').length,
      inProgress: tasks.filter(t => t.status === 'in-progress').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      overdue: tasks.filter(t => t.status === 'overdue').length,
      totalCost: tasks.reduce((sum, t) => sum + (t.actualCost || t.estimatedCost || 0), 0),
    };
  }, [tasks]);

  // CRUD operations
  const handleSave = async () => {
    if (!formData.title || !formData.dueDate) {
      setValidationMessage('Please fill in required fields');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const taskData: MaintenanceTask = {
      id: editingTask?.id || generateId(),
      title: formData.title || '',
      description: formData.description || '',
      category: formData.category as MaintenanceCategory,
      dueDate: formData.dueDate || '',
      status: formData.status as MaintenanceStatus,
      priority: formData.priority as MaintenancePriority,
      assignedTo: formData.assignedTo || '',
      estimatedCost: formData.estimatedCost || 0,
      actualCost: formData.actualCost,
      notes: formData.notes || '',
      createdAt: editingTask?.createdAt || new Date().toISOString(),
      completedAt: formData.status === 'completed' ? new Date().toISOString() : editingTask?.completedAt,
    };

    if (editingTask) {
      // Update existing task
      updateItem(editingTask.id, taskData);
    } else {
      // Add new task
      addItem(taskData);
    }

    resetForm();
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Task',
      message: 'Are you sure you want to delete this task?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteItem(id);
    }
  };

  const handleEdit = (task: MaintenanceTask) => {
    setEditingTask(task);
    setFormData(task);
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'equipment',
      dueDate: new Date().toISOString().split('T')[0],
      status: 'pending',
      priority: 'medium',
      assignedTo: '',
      estimatedCost: 0,
      actualCost: undefined,
      notes: '',
    });
    setEditingTask(null);
    setShowModal(false);
    setIsPrefilled(false);
  };

  const openNewTask = () => {
    setEditingTask(null);
    setFormData({
      title: '',
      description: '',
      category: 'equipment',
      dueDate: new Date().toISOString().split('T')[0],
      status: 'pending',
      priority: 'medium',
      assignedTo: '',
      estimatedCost: 0,
      notes: '',
    });
    setShowModal(true);
  };

  // Render task card
  const renderTaskCard = (task: MaintenanceTask) => {
    const statusConfig = STATUS_OPTIONS.find(s => s.value === task.status) || STATUS_OPTIONS[0];
    const StatusIcon = statusConfig.icon;
    const categoryConfig = CATEGORY_OPTIONS.find(c => c.value === task.category) || CATEGORY_OPTIONS[0];
    const priorityConfig = PRIORITY_OPTIONS.find(p => p.value === task.priority) || PRIORITY_OPTIONS[0];

    return (
      <div
        key={task.id}
        className={`p-4 rounded-lg border transition-all hover:shadow-md cursor-pointer ${
          isDark ? 'bg-gray-700 border-gray-600 hover:bg-gray-650' : 'bg-white border-gray-200 hover:bg-gray-50'
        }`}
        onClick={() => handleEdit(task)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className={`font-semibold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {task.title}
              </p>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-white ${statusConfig.color}`}>
                <StatusIcon className="w-3 h-3" />
                {statusConfig.label}
              </span>
            </div>
            {task.description && (
              <p className={`text-sm truncate ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {task.description}
              </p>
            )}
            <div className="flex flex-wrap gap-3 mt-2 text-sm">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                  {formatDate(task.dueDate)}
                </span>
              </div>
              <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs ${categoryConfig.color} text-white`}>
                {categoryConfig.label}
              </div>
              <span className={`text-xs font-semibold ${priorityConfig.color}`}>
                {PRIORITY_OPTIONS.find(p => p.value === task.priority)?.label}
              </span>
              {task.assignedTo && (
                <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Assigned: {task.assignedTo}
                </span>
              )}
            </div>
            {(task.estimatedCost || task.actualCost) && (
              <div className="flex gap-3 mt-2 text-sm">
                {task.estimatedCost > 0 && (
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                    Est: ${task.estimatedCost.toFixed(2)}
                  </span>
                )}
                {task.actualCost && task.actualCost > 0 && (
                  <span className={isDark ? 'text-green-400' : 'text-green-600'}>
                    Actual: ${task.actualCost.toFixed(2)}
                  </span>
                )}
              </div>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(task.id);
            }}
            className={`p-2 rounded-lg transition-colors ${
              isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
            }`}
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-6 px-4`}>
      {/* Validation Message Toast */}
      {validationMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-3 bg-red-500 text-white rounded-lg shadow-lg animate-fade-in">
          {validationMessage}
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
            <Sparkles className="w-4 h-4 text-cyan-500" />
            <span className="text-sm text-cyan-500 font-medium">{t('tools.maintenanceScheduler.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-xl">
                <Wrench className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.maintenanceScheduler.maintenanceScheduler', 'Maintenance Scheduler')}
                </h1>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.maintenanceScheduler.trackAndManageMaintenanceTasks', 'Track and manage maintenance tasks efficiently')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Sync Status */}
              <WidgetEmbedButton toolSlug="maintenance-scheduler" toolName="Maintenance Scheduler" />

              <SyncStatus
                isSynced={isSynced}
                isSaving={isSaving}
                lastSaved={lastSaved}
                syncError={syncError}
                onForceSync={forceSync}
                theme={isDark ? 'dark' : 'light'}
                showLabel={true}
              />

              {/* Export Options */}
              <ExportDropdown
                onExportCSV={() => exportCSV({ filename: 'maintenance-tasks' })}
                onExportExcel={() => exportExcel({ filename: 'maintenance-tasks' })}
                onExportJSON={() => exportJSON({ filename: 'maintenance-tasks' })}
                onExportPDF={async () => {
                  await exportPDF({
                    filename: 'maintenance-tasks',
                    title: 'Maintenance Tasks',
                    subtitle: `Total: ${filteredTasks.length} tasks`,
                  });
                }}
                onPrint={() => {
                  // Print is handled by export utils
                }}
                onCopyToClipboard={async () => {
                  // Copy to clipboard handled by export utils
                }}
                theme={isDark ? 'dark' : 'light'}
              />

              {/* New Task Button */}
              <button
                onClick={openNewTask}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-lg font-medium flex items-center gap-2 hover:from-cyan-600 hover:to-teal-600 transition-all shadow-lg shadow-cyan-500/20"
              >
                <Plus className="w-5 h-5" />
                {t('tools.maintenanceScheduler.newTask', 'New Task')}
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.maintenanceScheduler.totalTasks', 'Total Tasks')}</p>
            <p className="text-2xl font-bold text-cyan-500">{stats.total}</p>
          </div>
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.maintenanceScheduler.pending', 'Pending')}</p>
            <p className="text-2xl font-bold text-yellow-500">{stats.pending}</p>
          </div>
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.maintenanceScheduler.inProgress', 'In Progress')}</p>
            <p className="text-2xl font-bold text-blue-500">{stats.inProgress}</p>
          </div>
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.maintenanceScheduler.completed', 'Completed')}</p>
            <p className="text-2xl font-bold text-green-500">{stats.completed}</p>
          </div>
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.maintenanceScheduler.totalCost', 'Total Cost')}</p>
            <p className="text-2xl font-bold text-teal-500">${stats.totalCost.toFixed(0)}</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-3 items-end">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type="text"
                  placeholder={t('tools.maintenanceScheduler.searchTasks', 'Search tasks...')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400'
                      : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'
                  } focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none`}
                />
              </div>

              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as MaintenanceCategory | 'all')}
                className={`px-4 py-2 rounded-lg border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-200 text-gray-900'
                } focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none`}
              >
                <option value="all">{t('tools.maintenanceScheduler.allCategories', 'All Categories')}</option>
                {CATEGORY_OPTIONS.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as MaintenanceStatus | 'all')}
                className={`px-4 py-2 rounded-lg border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-200 text-gray-900'
                } focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none`}
              >
                <option value="all">{t('tools.maintenanceScheduler.allStatus', 'All Status')}</option>
                {STATUS_OPTIONS.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tasks Grid */}
        <div className="grid gap-4">
          {filteredTasks.length === 0 ? (
            <div className={`p-12 text-center rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
              <Wrench className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
              <p className={`text-lg font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('tools.maintenanceScheduler.noMaintenanceTasksFound', 'No maintenance tasks found')}
              </p>
              <p className={`text-sm mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                {t('tools.maintenanceScheduler.createYourFirstTaskTo', 'Create your first task to get started')}
              </p>
            </div>
          ) : (
            filteredTasks.map(task => renderTaskCard(task))
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`w-full max-w-2xl rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-2xl max-h-[90vh] overflow-y-auto`}>
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {editingTask ? t('tools.maintenanceScheduler.editTask', 'Edit Task') : t('tools.maintenanceScheduler.newTask2', 'New Task')}
                  </h2>
                  <button
                    onClick={resetForm}
                    className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  >
                    <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {/* Title */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.maintenanceScheduler.title', 'Title *')}
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder={t('tools.maintenanceScheduler.taskTitle', 'Task title')}
                    className={`w-full px-4 py-2.5 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400'
                        : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'
                    } focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none`}
                  />
                </div>

                {/* Description */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.maintenanceScheduler.description', 'Description')}
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder={t('tools.maintenanceScheduler.taskDescription', 'Task description')}
                    rows={3}
                    className={`w-full px-4 py-2.5 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400'
                        : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'
                    } focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none resize-none`}
                  />
                </div>

                {/* Category and Priority */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.maintenanceScheduler.category', 'Category')}
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as MaintenanceCategory })}
                      className={`w-full px-4 py-2.5 rounded-lg border ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-200 text-gray-900'
                      } focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none`}
                    >
                      {CATEGORY_OPTIONS.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.maintenanceScheduler.priority', 'Priority')}
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value as MaintenancePriority })}
                      className={`w-full px-4 py-2.5 rounded-lg border ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-200 text-gray-900'
                      } focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none`}
                    >
                      {PRIORITY_OPTIONS.map(p => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Due Date and Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.maintenanceScheduler.dueDate', 'Due Date *')}
                    </label>
                    <input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-lg border ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-200 text-gray-900'
                      } focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.maintenanceScheduler.status', 'Status')}
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as MaintenanceStatus })}
                      className={`w-full px-4 py-2.5 rounded-lg border ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-200 text-gray-900'
                      } focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none`}
                    >
                      {STATUS_OPTIONS.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Assigned To */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.maintenanceScheduler.assignedTo', 'Assigned To')}
                  </label>
                  <input
                    type="text"
                    value={formData.assignedTo}
                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                    placeholder={t('tools.maintenanceScheduler.teamMemberName', 'Team member name')}
                    className={`w-full px-4 py-2.5 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400'
                        : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'
                    } focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none`}
                  />
                </div>

                {/* Costs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.maintenanceScheduler.estimatedCost', 'Estimated Cost')}
                    </label>
                    <input
                      type="number"
                      value={formData.estimatedCost}
                      onChange={(e) => setFormData({ ...formData, estimatedCost: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                      className={`w-full px-4 py-2.5 rounded-lg border ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400'
                          : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'
                      } focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.maintenanceScheduler.actualCost', 'Actual Cost')}
                    </label>
                    <input
                      type="number"
                      value={formData.actualCost || ''}
                      onChange={(e) => setFormData({ ...formData, actualCost: e.target.value ? parseFloat(e.target.value) : undefined })}
                      placeholder="0.00"
                      className={`w-full px-4 py-2.5 rounded-lg border ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400'
                          : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'
                      } focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none`}
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.maintenanceScheduler.notes', 'Notes')}
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder={t('tools.maintenanceScheduler.additionalNotes', 'Additional notes...')}
                    rows={2}
                    className={`w-full px-4 py-2.5 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400'
                        : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'
                    } focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none resize-none`}
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                {editingTask && (
                  <button
                    onClick={() => {
                      handleDelete(editingTask.id);
                      resetForm();
                    }}
                    className="px-4 py-2 text-red-500 hover:bg-red-500/10 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                )}
                <div className={`flex items-center gap-3 ${!editingTask ? 'ml-auto' : ''}`}>
                  <button
                    onClick={resetForm}
                    className={`px-4 py-2 rounded-lg font-medium ${
                      isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {t('tools.maintenanceScheduler.cancel', 'Cancel')}
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={!formData.title || !formData.dueDate}
                    className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-lg font-medium flex items-center gap-2 hover:from-cyan-600 hover:to-teal-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {editingTask ? t('tools.maintenanceScheduler.update', 'Update') : t('tools.maintenanceScheduler.create', 'Create')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <ConfirmDialog />
      </div>
    </div>
  );
};

export default MaintenanceSchedulerTool;
