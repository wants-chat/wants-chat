'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import {
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Search,
  Filter,
  CheckCircle2,
  Circle,
  Calendar,
  AlertCircle,
  Flag,
  Clock,
  Tag,
  Sparkles,
} from 'lucide-react';
import { ExportDropdown } from '../ui/ExportDropdown';
import { type ColumnConfig } from '../../lib/toolDataUtils';

// Types
interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  category?: string;
  dueDate?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

type TabType = 'all' | 'pending' | 'in-progress' | 'completed';

// Export column configuration for tasks data
const taskExportColumns: ColumnConfig[] = [
  { key: 'title', header: 'Task Title', type: 'string' },
  { key: 'description', header: 'Description', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'priority', header: 'Priority', type: 'string' },
  { key: 'category', header: 'Category', type: 'string' },
  { key: 'dueDate', header: 'Due Date', type: 'date' },
  { key: 'createdAt', header: 'Created', type: 'date' },
];

// Generate sample data
const generateSampleData = (): Task[] => {
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  return [
    {
      id: 'task-1',
      title: 'Review project requirements',
      description: 'Review and understand all project requirements',
      status: 'completed',
      priority: 'high',
      category: 'Planning',
      dueDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      tags: ['project', 'review'],
      createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'task-2',
      title: 'Design database schema',
      description: 'Create and design the database schema',
      status: 'in-progress',
      priority: 'high',
      category: 'Development',
      dueDate: tomorrow,
      tags: ['database', 'design'],
      createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: 'task-3',
      title: 'Write API documentation',
      description: 'Document all API endpoints and parameters',
      status: 'pending',
      priority: 'medium',
      category: 'Documentation',
      dueDate: nextWeek,
      tags: ['api', 'documentation'],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
  ];
};

interface TaskManagerToolProps {
  uiConfig?: UIConfig;
}

export const TaskManagerTool: React.FC<TaskManagerToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Initialize default data
  const defaultTasks = generateSampleData();

  // Use useToolData hook for backend sync
  const {
    data: tasks,
    addItem: addTask,
    updateItem: updateTask,
    deleteItem: deleteTask,
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
  } = useToolData<Task>('task-manager', defaultTasks, taskExportColumns, {
    autoSave: true,
    autoSaveDelay: 1000,
    onSync: () => {},
  });

  // State
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Form state
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    status: 'pending' as Task['status'],
    priority: 'medium' as Task['priority'],
    category: '',
    dueDate: '',
    tags: [] as string[],
  });

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.title) {
        setTaskForm(prev => ({
          ...prev,
          title: params.title || prev.title,
          description: params.description || prev.description,
        }));
        setShowTaskForm(true);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Task handlers
  const handleSaveTask = () => {
    if (!taskForm.title.trim()) return;

    const now = new Date().toISOString();
    const newTask: Task = {
      id: editingTask?.id || `task-${Date.now()}`,
      ...taskForm,
      tags: taskForm.tags,
      createdAt: editingTask?.createdAt || now,
      updatedAt: now,
    };

    if (editingTask) {
      updateTask(editingTask.id, newTask);
    } else {
      addTask(newTask);
    }

    resetTaskForm();
  };

  const resetTaskForm = () => {
    setTaskForm({
      title: '',
      description: '',
      status: 'pending',
      priority: 'medium',
      category: '',
      dueDate: '',
      tags: [],
    });
    setEditingTask(null);
    setShowTaskForm(false);
  };

  const handleEditTask = (task: Task) => {
    setTaskForm({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      category: task.category || '',
      dueDate: task.dueDate || '',
      tags: task.tags || [],
    });
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const handleToggleStatus = (task: Task) => {
    const nextStatus: Task['status'] =
      task.status === 'pending' ? 'in-progress' :
      task.status === 'in-progress' ? 'completed' :
      'pending';

    updateTask(task.id, { status: nextStatus });
  };

  const handleDeleteTask = (id: string) => {
    deleteTask(id);
  };

  // Export handlers
  const handleExportCSV = () => {
    exportCSV({ filename: 'tasks' });
  };

  const handleExportExcel = () => {
    exportExcel({ filename: 'tasks' });
  };

  const handleExportJSON = () => {
    exportJSON({ filename: 'tasks' });
  };

  const handleExportPDF = async () => {
    await exportPDF({
      filename: 'tasks',
      title: 'Task Manager Report',
      subtitle: `Total Tasks: ${tasks.length}`,
      orientation: 'portrait',
    });
  };

  const handlePrint = () => {
    print('Task Manager Report');
  };

  const handleCopyToClipboard = async () => {
    return await copyToClipboard('tab');
  };

  // Filters
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Status filter
      if (activeTab !== 'all' && task.status !== activeTab) {
        return false;
      }

      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        if (!task.title.toLowerCase().includes(search) &&
            !task.description?.toLowerCase().includes(search)) {
          return false;
        }
      }

      // Priority filter
      if (priorityFilter !== 'all' && task.priority !== priorityFilter) {
        return false;
      }

      // Category filter
      if (categoryFilter !== 'all' && task.category !== categoryFilter) {
        return false;
      }

      return true;
    });
  }, [tasks, activeTab, searchTerm, priorityFilter, categoryFilter]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(tasks.map(t => t.category).filter(Boolean));
    return Array.from(cats);
  }, [tasks]);

  // Stats
  const stats = useMemo(() => {
    return {
      total: tasks.length,
      completed: tasks.filter(t => t.status === 'completed').length,
      inProgress: tasks.filter(t => t.status === 'in-progress').length,
      pending: tasks.filter(t => t.status === 'pending').length,
      highPriority: tasks.filter(t => t.priority === 'high').length,
    };
  }, [tasks]);

  // Styles
  const cardBg = isDark ? 'bg-gray-800' : 'bg-white';
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-500';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';
  const inputBg = isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900';
  const hoverBg = isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50';

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-green-500';
    }
  };

  const getPriorityBg = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return isDark ? 'bg-red-500/10' : 'bg-red-50';
      case 'medium':
        return isDark ? 'bg-yellow-500/10' : 'bg-yellow-50';
      case 'low':
        return isDark ? 'bg-green-500/10' : 'bg-green-50';
    }
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-500';
      case 'in-progress':
        return 'text-blue-500';
      case 'pending':
        return 'text-gray-500';
    }
  };

  const getStatusBg = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return isDark ? 'bg-green-500/10' : 'bg-green-50';
      case 'in-progress':
        return isDark ? 'bg-blue-500/10' : 'bg-blue-50';
      case 'pending':
        return isDark ? 'bg-gray-600/10' : 'bg-gray-50';
    }
  };

  return (
    <div className={`space-y-6 ${cardBg} rounded-lg`}>
      {/* Header with Sync Status */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-6">
        <div>
          <h1 className={`text-3xl font-bold ${textPrimary}`}>{t('tools.taskManager.taskManager', 'Task Manager')}</h1>
          <p className={textSecondary}>{t('tools.taskManager.organizeAndTrackYourTasks', 'Organize and track your tasks efficiently')}</p>
        </div>
        <div className="flex items-center gap-3">
          <WidgetEmbedButton toolSlug="task-manager" toolName="Task Manager" />

          <SyncStatus
            isSynced={isSynced}
            isSaving={isSaving}
            lastSaved={lastSaved}
            syncError={syncError}
            onForceSync={forceSync}
            theme={isDark ? 'dark' : 'light'}
            showLabel={true}
          />
          <ExportDropdown
            onExportCSV={handleExportCSV}
            onExportExcel={handleExportExcel}
            onExportJSON={handleExportJSON}
            onExportPDF={handleExportPDF}
            onPrint={handlePrint}
            onCopyToClipboard={handleCopyToClipboard}
            disabled={tasks.length === 0}
            showImport={false}
            theme={isDark ? 'dark' : 'light'}
          />
        </div>
      </div>

      {/* Prefill Indicator */}
      {isPrefilled && (
        <div className="flex items-center gap-2 px-4 py-2 mb-6 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
          <Sparkles className="w-4 h-4 text-emerald-500" />
          <span className="text-sm text-emerald-500 font-medium">{t('tools.taskManager.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 px-4 sm:px-6">
        <Card className={`${cardBg} ${borderColor} border`}>
          <CardContent className="p-4">
            <div className={`text-2xl font-bold ${textPrimary}`}>{stats.total}</div>
            <div className={`text-sm ${textSecondary}`}>{t('tools.taskManager.totalTasks', 'Total Tasks')}</div>
          </CardContent>
        </Card>
        <Card className={`${cardBg} ${borderColor} border`}>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-500">{stats.completed}</div>
            <div className={`text-sm ${textSecondary}`}>{t('tools.taskManager.completed', 'Completed')}</div>
          </CardContent>
        </Card>
        <Card className={`${cardBg} ${borderColor} border`}>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-500">{stats.inProgress}</div>
            <div className={`text-sm ${textSecondary}`}>{t('tools.taskManager.inProgress', 'In Progress')}</div>
          </CardContent>
        </Card>
        <Card className={`${cardBg} ${borderColor} border`}>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-500">{stats.pending}</div>
            <div className={`text-sm ${textSecondary}`}>{t('tools.taskManager.pending', 'Pending')}</div>
          </CardContent>
        </Card>
        <Card className={`${cardBg} ${borderColor} border`}>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-500">{stats.highPriority}</div>
            <div className={`text-sm ${textSecondary}`}>{t('tools.taskManager.highPriority', 'High Priority')}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs and Filters */}
      <div className="px-4 sm:px-6 space-y-4">
        <div className={`flex flex-wrap gap-2 border-b ${borderColor} pb-4`}>
          {(['all', 'pending', 'in-progress', 'completed'] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg transition-colors capitalize ${
                activeTab === tab
                  ? 'bg-emerald-500 text-white'
                  : `${textSecondary} ${hoverBg}`
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <Search className={`w-4 h-4 ${textSecondary}`} />
            <input
              type="text"
              placeholder={t('tools.taskManager.searchTasks', 'Search tasks...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`flex-1 px-3 py-2 rounded-lg border ${inputBg}`}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className={`px-3 py-2 rounded-lg border ${inputBg}`}
            >
              <option value="all">{t('tools.taskManager.allPriorities', 'All Priorities')}</option>
              <option value="high">{t('tools.taskManager.high', 'High')}</option>
              <option value="medium">{t('tools.taskManager.medium', 'Medium')}</option>
              <option value="low">{t('tools.taskManager.low', 'Low')}</option>
            </select>

            {categories.length > 0 && (
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className={`px-3 py-2 rounded-lg border ${inputBg}`}
              >
                <option value="all">{t('tools.taskManager.allCategories', 'All Categories')}</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={() => setShowTaskForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t('tools.taskManager.addTask', 'Add Task')}
            </button>
          </div>
        </div>
      </div>

      {/* Task Form Modal */}
      {showTaskForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className={`${cardBg} max-w-2xl w-full`}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className={textPrimary}>
                {editingTask ? t('tools.taskManager.editTask', 'Edit Task') : t('tools.taskManager.addNewTask', 'Add New Task')}
              </CardTitle>
              <button
                onClick={resetTaskForm}
                className={`${textSecondary} hover:${textPrimary}`}
              >
                <X className="w-5 h-5" />
              </button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${textPrimary}`}>
                  {t('tools.taskManager.title', 'Title *')}
                </label>
                <input
                  type="text"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder={t('tools.taskManager.taskTitle', 'Task title')}
                  className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${textPrimary}`}>
                  {t('tools.taskManager.description', 'Description')}
                </label>
                <textarea
                  value={taskForm.description}
                  onChange={(e) => setTaskForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder={t('tools.taskManager.taskDescription', 'Task description')}
                  className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${textPrimary}`}>
                    {t('tools.taskManager.status', 'Status')}
                  </label>
                  <select
                    value={taskForm.status}
                    onChange={(e) => setTaskForm(prev => ({ ...prev, status: e.target.value as Task['status'] }))}
                    className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                  >
                    <option value="pending">{t('tools.taskManager.pending2', 'Pending')}</option>
                    <option value="in-progress">{t('tools.taskManager.inProgress2', 'In Progress')}</option>
                    <option value="completed">{t('tools.taskManager.completed2', 'Completed')}</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${textPrimary}`}>
                    {t('tools.taskManager.priority', 'Priority')}
                  </label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm(prev => ({ ...prev, priority: e.target.value as Task['priority'] }))}
                    className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                  >
                    <option value="low">{t('tools.taskManager.low2', 'Low')}</option>
                    <option value="medium">{t('tools.taskManager.medium2', 'Medium')}</option>
                    <option value="high">{t('tools.taskManager.high2', 'High')}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${textPrimary}`}>
                    {t('tools.taskManager.category', 'Category')}
                  </label>
                  <input
                    type="text"
                    value={taskForm.category}
                    onChange={(e) => setTaskForm(prev => ({ ...prev, category: e.target.value }))}
                    placeholder={t('tools.taskManager.eGWorkPersonal', 'e.g., Work, Personal')}
                    className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${textPrimary}`}>
                    {t('tools.taskManager.dueDate', 'Due Date')}
                  </label>
                  <input
                    type="date"
                    value={taskForm.dueDate}
                    onChange={(e) => setTaskForm(prev => ({ ...prev, dueDate: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={handleSaveTask}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {editingTask ? t('tools.taskManager.updateTask', 'Update Task') : t('tools.taskManager.addTask2', 'Add Task')}
                </button>
                <button
                  onClick={resetTaskForm}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border ${borderColor} ${textSecondary} hover:${hoverBg}`}
                >
                  <X className="w-4 h-4" />
                  {t('tools.taskManager.cancel', 'Cancel')}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Task List */}
      <div className="px-4 sm:px-6 pb-6">
        {filteredTasks.length === 0 ? (
          <div className={`text-center py-12 rounded-lg border-2 border-dashed ${borderColor}`}>
            <AlertCircle className={`w-12 h-12 ${textSecondary} mx-auto mb-4`} />
            <p className={`text-lg font-medium ${textPrimary}`}>{t('tools.taskManager.noTasksFound', 'No tasks found')}</p>
            <p className={`${textSecondary}`}>
              {tasks.length === 0 ? t('tools.taskManager.createANewTaskTo', 'Create a new task to get started') : t('tools.taskManager.noTasksMatchYourFilters', 'No tasks match your filters')}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTasks.map((task) => (
              <Card
                key={task.id}
                className={`${cardBg} ${borderColor} border cursor-pointer transition-all hover:shadow-md`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Status Button */}
                    <button
                      onClick={() => handleToggleStatus(task)}
                      className={`mt-1 flex-shrink-0 ${getStatusColor(task.status)}`}
                    >
                      {task.status === 'completed' ? (
                        <CheckCircle2 className="w-6 h-6" />
                      ) : (
                        <Circle className="w-6 h-6" />
                      )}
                    </button>

                    {/* Task Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <h3
                          className={`text-lg font-semibold ${
                            task.status === 'completed'
                              ? textSecondary + ' line-through'
                              : textPrimary
                          }`}
                        >
                          {task.title}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded ${getPriorityBg(
                              task.priority
                            )} ${getPriorityColor(task.priority)}`}
                          >
                            <Flag className="w-3 h-3" />
                            {task.priority}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded ${getStatusBg(
                              task.status
                            )} ${getStatusColor(task.status)}`}
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            {task.status.replace('-', ' ')}
                          </span>
                        </div>
                      </div>

                      {task.description && (
                        <p className={`mt-2 ${textSecondary} text-sm`}>{task.description}</p>
                      )}

                      <div className="flex flex-wrap gap-4 mt-3">
                        {task.category && (
                          <div className="flex items-center gap-1 text-sm">
                            <Tag className={`w-3 h-3 ${textSecondary}`} />
                            <span className={textSecondary}>{task.category}</span>
                          </div>
                        )}
                        {task.dueDate && (
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className={`w-3 h-3 ${textSecondary}`} />
                            <span className={textSecondary}>
                              {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-sm">
                          <Clock className={`w-3 h-3 ${textSecondary}`} />
                          <span className={textSecondary}>
                            {new Date(task.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleEditTask(task)}
                        className={`p-2 rounded-lg ${hoverBg} text-blue-500 transition-colors`}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className={`p-2 rounded-lg ${hoverBg} text-red-500 transition-colors`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskManagerTool;
