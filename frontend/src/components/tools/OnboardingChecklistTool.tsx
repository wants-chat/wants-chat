'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  ClipboardList,
  CheckCircle,
  Circle,
  Clock,
  User,
  Calendar,
  Mail,
  Plus,
  Trash2,
  Edit,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Building2,
  Briefcase,
  UserPlus,
  FileText,
  Settings,
  Send,
  Copy,
  XCircle,
  ArrowRight,
  Play,
  Pause,
} from 'lucide-react';
import { UIConfig } from '../ContextualUI';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import useToolData from '../../hooks/useToolData';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';

interface OnboardingChecklistToolProps {
  uiConfig?: UIConfig;
}

import { useTheme } from '@/contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Types
type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'blocked';
type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
type TaskCategory = 'documentation' | 'it-setup' | 'training' | 'hr-admin' | 'team-intro' | 'workspace' | 'other';
type OnboardingStatus = 'not-started' | 'in-progress' | 'completed' | 'on-hold';

interface OnboardingTask {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  assignedTo: string;
  completedDate: string | null;
  notes: string;
  order: number;
}

interface NewHireOnboarding {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  department: string;
  position: string;
  manager: string;
  startDate: string;
  status: OnboardingStatus;
  tasks: OnboardingTask[];
  progress: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// Constants
const TASK_CATEGORIES: { value: TaskCategory; label: string; icon: any }[] = [
  { value: 'documentation', label: 'Documentation', icon: FileText },
  { value: 'it-setup', label: 'IT Setup', icon: Settings },
  { value: 'training', label: 'Training', icon: ClipboardList },
  { value: 'hr-admin', label: 'HR/Admin', icon: Building2 },
  { value: 'team-intro', label: 'Team Introductions', icon: User },
  { value: 'workspace', label: 'Workspace', icon: Briefcase },
  { value: 'other', label: 'Other', icon: Circle },
];

const TASK_STATUSES: { value: TaskStatus; label: string; color: string }[] = [
  { value: 'pending', label: 'Pending', color: 'gray' },
  { value: 'in-progress', label: 'In Progress', color: 'blue' },
  { value: 'completed', label: 'Completed', color: 'green' },
  { value: 'blocked', label: 'Blocked', color: 'red' },
];

const TASK_PRIORITIES: { value: TaskPriority; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: 'gray' },
  { value: 'medium', label: 'Medium', color: 'yellow' },
  { value: 'high', label: 'High', color: 'orange' },
  { value: 'urgent', label: 'Urgent', color: 'red' },
];

const ONBOARDING_STATUSES: { value: OnboardingStatus; label: string; color: string }[] = [
  { value: 'not-started', label: 'Not Started', color: 'gray' },
  { value: 'in-progress', label: 'In Progress', color: 'blue' },
  { value: 'completed', label: 'Completed', color: 'green' },
  { value: 'on-hold', label: 'On Hold', color: 'yellow' },
];

const DEFAULT_TASKS: Partial<OnboardingTask>[] = [
  { title: 'Complete new hire paperwork', category: 'documentation', priority: 'high', description: 'Fill out tax forms, emergency contacts, and employment documents' },
  { title: 'Set up email account', category: 'it-setup', priority: 'high', description: 'Create company email and configure mail client' },
  { title: 'Issue laptop and equipment', category: 'it-setup', priority: 'high', description: 'Provision and configure laptop, monitor, keyboard, etc.' },
  { title: 'Set up access badges and building access', category: 'workspace', priority: 'high', description: 'Create security badge and configure building access' },
  { title: 'Add to company software systems', category: 'it-setup', priority: 'medium', description: 'Add to Slack, project management, CRM, etc.' },
  { title: 'Review company handbook and policies', category: 'training', priority: 'medium', description: 'Read through employee handbook and company policies' },
  { title: 'Complete benefits enrollment', category: 'hr-admin', priority: 'high', description: 'Select health insurance, 401k, and other benefits' },
  { title: 'Meet with manager for goals discussion', category: 'team-intro', priority: 'medium', description: '1:1 meeting to discuss role expectations and goals' },
  { title: 'Team introduction meeting', category: 'team-intro', priority: 'medium', description: 'Meet with immediate team members' },
  { title: 'Department orientation', category: 'training', priority: 'medium', description: 'Overview of department structure and processes' },
  { title: 'Set up workspace and desk', category: 'workspace', priority: 'low', description: 'Organize desk, supplies, and workspace' },
  { title: 'Complete required training modules', category: 'training', priority: 'high', description: 'Complete mandatory compliance and safety training' },
];

// Column configuration for exports
const ONBOARDING_COLUMNS: ColumnConfig[] = [
  { key: 'employeeName', header: 'Employee Name', type: 'string' },
  { key: 'employeeEmail', header: 'Email', type: 'string' },
  { key: 'department', header: 'Department', type: 'string' },
  { key: 'position', header: 'Position', type: 'string' },
  { key: 'manager', header: 'Manager', type: 'string' },
  { key: 'startDate', header: 'Start Date', type: 'date' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'progress', header: 'Progress (%)', type: 'number' },
];

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const getDaysUntil = (dateString: string) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffTime = date.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

const calculateProgress = (tasks: OnboardingTask[]) => {
  if (tasks.length === 0) return 0;
  const completed = tasks.filter((t) => t.status === 'completed').length;
  return Math.round((completed / tasks.length) * 100);
};

// Main Component
export const OnboardingChecklistTool: React.FC<OnboardingChecklistToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // useToolData hook for backend sync
  const {
    data: onboardings,
    addItem: addOnboardingToBackend,
    updateItem: updateOnboardingBackend,
    deleteItem: deleteOnboardingBackend,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<NewHireOnboarding>('onboarding-checklist', [], ONBOARDING_COLUMNS);

  // Local UI State
  const [viewMode, setViewMode] = useState<'list' | 'detail' | 'create'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedOnboarding, setSelectedOnboarding] = useState<NewHireOnboarding | null>(null);
  const [editingOnboarding, setEditingOnboarding] = useState<NewHireOnboarding | null>(null);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  // New onboarding form state
  const [newOnboarding, setNewOnboarding] = useState<Partial<NewHireOnboarding>>({
    employeeName: '',
    employeeEmail: '',
    department: '',
    position: '',
    manager: '',
    startDate: new Date().toISOString().split('T')[0],
    status: 'not-started',
    tasks: [],
    notes: '',
  });

  // Task form state
  const [newTask, setNewTask] = useState<Partial<OnboardingTask>>({
    title: '',
    description: '',
    category: 'other',
    status: 'pending',
    priority: 'medium',
    dueDate: '',
    assignedTo: '',
    notes: '',
  });

  // Filter onboardings
  const filteredOnboardings = useMemo(() => {
    return onboardings.filter((onboarding) => {
      const matchesSearch =
        onboarding.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        onboarding.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        onboarding.position.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || onboarding.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [onboardings, searchTerm, filterStatus]);

  // Analytics
  const analytics = useMemo(() => {
    const total = onboardings.length;
    const inProgress = onboardings.filter((o) => o.status === 'in-progress').length;
    const completed = onboardings.filter((o) => o.status === 'completed').length;
    const startingThisWeek = onboardings.filter((o) => {
      const days = getDaysUntil(o.startDate);
      return days !== null && days >= 0 && days <= 7;
    }).length;

    const avgProgress =
      onboardings.length > 0
        ? Math.round(onboardings.reduce((sum, o) => sum + o.progress, 0) / onboardings.length)
        : 0;

    return { total, inProgress, completed, startingThisWeek, avgProgress };
  }, [onboardings]);

  // Add default tasks
  const addDefaultTasks = () => {
    const tasks = DEFAULT_TASKS.map((task, idx) => ({
      id: generateId(),
      title: task.title || '',
      description: task.description || '',
      category: task.category || 'other',
      status: 'pending' as TaskStatus,
      priority: task.priority || 'medium',
      dueDate: '',
      assignedTo: '',
      completedDate: null,
      notes: '',
      order: idx,
    }));
    setNewOnboarding((prev) => ({ ...prev, tasks }));
  };

  // Add task
  const addTask = () => {
    if (!newTask.title) {
      setValidationMessage('Please enter a task title');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const task: OnboardingTask = {
      id: generateId(),
      title: newTask.title || '',
      description: newTask.description || '',
      category: newTask.category || 'other',
      status: newTask.status || 'pending',
      priority: newTask.priority || 'medium',
      dueDate: newTask.dueDate || '',
      assignedTo: newTask.assignedTo || '',
      completedDate: null,
      notes: newTask.notes || '',
      order: (newOnboarding.tasks?.length || 0),
    };

    setNewOnboarding((prev) => ({
      ...prev,
      tasks: [...(prev.tasks || []), task],
    }));

    setNewTask({
      title: '',
      description: '',
      category: 'other',
      status: 'pending',
      priority: 'medium',
      dueDate: '',
      assignedTo: '',
      notes: '',
    });
  };

  // Save onboarding
  const saveOnboarding = () => {
    if (!newOnboarding.employeeName || !newOnboarding.employeeEmail) {
      setValidationMessage('Please fill in required fields (Employee Name, Email)');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const progress = calculateProgress(newOnboarding.tasks || []);

    const onboarding: NewHireOnboarding = {
      id: editingOnboarding?.id || generateId(),
      employeeId: editingOnboarding?.employeeId || generateId(),
      employeeName: newOnboarding.employeeName || '',
      employeeEmail: newOnboarding.employeeEmail || '',
      department: newOnboarding.department || '',
      position: newOnboarding.position || '',
      manager: newOnboarding.manager || '',
      startDate: newOnboarding.startDate || new Date().toISOString().split('T')[0],
      status: progress === 100 ? 'completed' : progress > 0 ? 'in-progress' : 'not-started',
      tasks: newOnboarding.tasks || [],
      progress,
      notes: newOnboarding.notes || '',
      createdAt: editingOnboarding?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (editingOnboarding) {
      updateOnboardingBackend(onboarding.id, onboarding);
    } else {
      addOnboardingToBackend(onboarding);
    }

    resetForm();
    setViewMode('list');
  };

  const resetForm = () => {
    setNewOnboarding({
      employeeName: '',
      employeeEmail: '',
      department: '',
      position: '',
      manager: '',
      startDate: new Date().toISOString().split('T')[0],
      status: 'not-started',
      tasks: [],
      notes: '',
    });
    setEditingOnboarding(null);
    setNewTask({
      title: '',
      description: '',
      category: 'other',
      status: 'pending',
      priority: 'medium',
      dueDate: '',
      assignedTo: '',
      notes: '',
    });
  };

  const editOnboarding = (onboarding: NewHireOnboarding) => {
    setEditingOnboarding(onboarding);
    setNewOnboarding(onboarding);
    setViewMode('create');
  };

  const viewOnboardingDetail = (onboarding: NewHireOnboarding) => {
    setSelectedOnboarding(onboarding);
    setViewMode('detail');
  };

  const deleteOnboarding = async (onboardingId: string) => {
    const confirmed = await confirm({
      title: 'Confirm Action',
      message: 'Are you sure you want to delete this onboarding?',
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (!confirmed) return;
    deleteOnboardingBackend(onboardingId);
    if (selectedOnboarding?.id === onboardingId) {
      setSelectedOnboarding(null);
      setViewMode('list');
    }
  };

  const updateTaskStatus = (onboarding: NewHireOnboarding, taskId: string, newStatus: TaskStatus) => {
    const updatedTasks = onboarding.tasks.map((task) =>
      task.id === taskId
        ? {
            ...task,
            status: newStatus,
            completedDate: newStatus === 'completed' ? new Date().toISOString() : null,
          }
        : task
    );

    const progress = calculateProgress(updatedTasks);

    const updatedOnboarding = {
      ...onboarding,
      tasks: updatedTasks,
      progress,
      status: progress === 100 ? ('completed' as OnboardingStatus) : progress > 0 ? ('in-progress' as OnboardingStatus) : onboarding.status,
      updatedAt: new Date().toISOString(),
    };

    updateOnboardingBackend(onboarding.id, updatedOnboarding);

    if (selectedOnboarding?.id === onboarding.id) {
      setSelectedOnboarding(updatedOnboarding);
    }
  };

  const getStatusColor = (status: OnboardingStatus | TaskStatus) => {
    const colors: Record<string, string> = {
      gray: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
      blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      green: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      red: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };

    const allStatuses = [...ONBOARDING_STATUSES, ...TASK_STATUSES];
    const statusConfig = allStatuses.find((s) => s.value === status);
    return colors[statusConfig?.color || 'gray'];
  };

  const getPriorityColor = (priority: TaskPriority) => {
    const priorityConfig = TASK_PRIORITIES.find((p) => p.value === priority);
    const colors: Record<string, string> = {
      gray: 'text-gray-500',
      yellow: 'text-yellow-500',
      orange: 'text-orange-500',
      red: 'text-red-500',
    };
    return colors[priorityConfig?.color || 'gray'];
  };

  // Export handlers
  const handleExport = (format: string) => {
    const exportData = filteredOnboardings.map((o) => ({
      ...o,
      tasksCompleted: o.tasks.filter((t) => t.status === 'completed').length,
      totalTasks: o.tasks.length,
    }));

    switch (format) {
      case 'csv':
        exportToCSV(exportData, ONBOARDING_COLUMNS, 'onboardings');
        break;
      case 'excel':
        exportToExcel(exportData, ONBOARDING_COLUMNS, 'onboardings');
        break;
      case 'json':
        exportToJSON(exportData, 'onboardings');
        break;
      case 'pdf':
        exportToPDF(exportData, ONBOARDING_COLUMNS, 'Employee Onboarding Report');
        break;
      case 'print':
        printData(exportData, ONBOARDING_COLUMNS, 'Employee Onboarding Report');
        break;
    }
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <ClipboardList className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t('tools.onboardingChecklist.onboardingChecklist', 'Onboarding Checklist')}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('tools.onboardingChecklist.manageNewHireOnboarding', 'Manage new hire onboarding')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <WidgetEmbedButton toolSlug="onboarding-checklist" toolName="Onboarding Checklist" />

            <SyncStatus
              isSynced={isSynced}
              isSaving={isSaving}
              lastSaved={lastSaved}
              error={syncError}
              onRetry={forceSync}
            />
            <ExportDropdown onExport={handleExport} />
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => {
              setViewMode('list');
              setSelectedOnboarding(null);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'list'
                ? 'bg-orange-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {t('tools.onboardingChecklist.allOnboardings', 'All Onboardings')}
          </button>
          {viewMode === 'detail' && selectedOnboarding && (
            <button
              className="px-4 py-2 rounded-lg text-sm font-medium bg-orange-600 text-white"
            >
              {selectedOnboarding.employeeName}
            </button>
          )}
          <button
            onClick={() => {
              resetForm();
              setViewMode('create');
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'create'
                ? 'bg-orange-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {editingOnboarding ? t('tools.onboardingChecklist.editOnboarding', 'Edit Onboarding') : t('tools.onboardingChecklist.newOnboarding2', 'New Onboarding')}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {viewMode === 'list' && (
          <div className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Card>
                <CardContent className="p-3">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.total}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('tools.onboardingChecklist.total', 'Total')}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{analytics.inProgress}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('tools.onboardingChecklist.inProgress', 'In Progress')}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{analytics.completed}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('tools.onboardingChecklist.completed', 'Completed')}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">{analytics.startingThisWeek}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('tools.onboardingChecklist.startingThisWeek', 'Starting This Week')}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">{analytics.avgProgress}%</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('tools.onboardingChecklist.avgProgress', 'Avg Progress')}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('tools.onboardingChecklist.searchOnboardings', 'Search onboardings...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">{t('tools.onboardingChecklist.allStatuses', 'All Statuses')}</option>
                {ONBOARDING_STATUSES.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Onboarding List */}
            {filteredOnboardings.length === 0 ? (
              <div className="text-center py-12">
                <UserPlus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{t('tools.onboardingChecklist.noOnboardingsFound', 'No onboardings found')}</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  {onboardings.length === 0
                    ? t('tools.onboardingChecklist.createYourFirstOnboardingChecklist', 'Create your first onboarding checklist to get started.') : t('tools.onboardingChecklist.tryAdjustingYourSearchOr', 'Try adjusting your search or filters.')}
                </p>
                <button
                  onClick={() => setViewMode('create')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.onboardingChecklist.newOnboarding', 'New Onboarding')}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredOnboardings.map((onboarding) => {
                  const daysUntilStart = getDaysUntil(onboarding.startDate);
                  return (
                    <Card key={onboarding.id} className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => viewOnboardingDetail(onboarding)}>
                      <div className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                              <span className="text-lg font-medium text-orange-600 dark:text-orange-300">
                                {onboarding.employeeName.split(' ').map((n) => n[0]).join('')}
                              </span>
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                  {onboarding.employeeName}
                                </h3>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(onboarding.status)}`}>
                                  {ONBOARDING_STATUSES.find((s) => s.value === onboarding.status)?.label}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                {onboarding.position} - {onboarding.department}
                              </p>
                              <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 dark:text-gray-400">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  Starts {formatDate(onboarding.startDate)}
                                  {daysUntilStart !== null && daysUntilStart >= 0 && daysUntilStart <= 7 && (
                                    <span className="text-orange-600 dark:text-orange-400">
                                      ({daysUntilStart === 0 ? 'Today' : `in ${daysUntilStart} days`})
                                    </span>
                                  )}
                                </span>
                                <span className="flex items-center gap-1">
                                  <User className="w-4 h-4" />
                                  Manager: {onboarding.manager || 'Not assigned'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">{onboarding.progress}%</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {onboarding.tasks.filter((t) => t.status === 'completed').length}/{onboarding.tasks.length} tasks
                            </div>
                            <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-2">
                              <div
                                className="h-full bg-orange-500 rounded-full transition-all"
                                style={{ width: `${onboarding.progress}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {viewMode === 'detail' && selectedOnboarding && (
          <div className="space-y-4">
            {/* Employee Info Card */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                      <span className="text-2xl font-medium text-orange-600 dark:text-orange-300">
                        {selectedOnboarding.employeeName.split(' ').map((n) => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {selectedOnboarding.employeeName}
                      </h2>
                      <p className="text-gray-600 dark:text-gray-300">
                        {selectedOnboarding.position} - {selectedOnboarding.department}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {selectedOnboarding.employeeEmail}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Starts {formatDate(selectedOnboarding.startDate)}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {selectedOnboarding.manager}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        editOnboarding(selectedOnboarding);
                      }}
                      className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteOnboarding(selectedOnboarding.id);
                      }}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900 rounded"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('tools.onboardingChecklist.progress', 'Progress')}</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{selectedOnboarding.progress}%</span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full">
                    <div
                      className="h-full bg-orange-500 rounded-full transition-all"
                      style={{ width: `${selectedOnboarding.progress}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Task Categories */}
            {TASK_CATEGORIES.map((category) => {
              const categoryTasks = selectedOnboarding.tasks.filter((t) => t.category === category.value);
              if (categoryTasks.length === 0) return null;

              const CategoryIcon = category.icon;
              const completedCount = categoryTasks.filter((t) => t.status === 'completed').length;

              return (
                <Card key={category.value}>
                  <CardHeader className="py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CategoryIcon className="w-5 h-5 text-gray-500" />
                        <CardTitle className="text-base">{category.label}</CardTitle>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {completedCount}/{categoryTasks.length} completed
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {categoryTasks.map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                        >
                          <button
                            onClick={() =>
                              updateTaskStatus(
                                selectedOnboarding,
                                task.id,
                                task.status === 'completed' ? 'pending' : 'completed'
                              )
                            }
                            className="flex-shrink-0"
                          >
                            {task.status === 'completed' ? (
                              <CheckCircle className="w-6 h-6 text-green-500" />
                            ) : task.status === 'in-progress' ? (
                              <Clock className="w-6 h-6 text-blue-500" />
                            ) : task.status === 'blocked' ? (
                              <AlertCircle className="w-6 h-6 text-red-500" />
                            ) : (
                              <Circle className="w-6 h-6 text-gray-400" />
                            )}
                          </button>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-medium ${
                                task.status === 'completed'
                                  ? 'text-gray-500 line-through'
                                  : 'text-gray-900 dark:text-white'
                              }`}>
                                {task.title}
                              </span>
                              <span className={`text-xs ${getPriorityColor(task.priority)}`}>
                                {TASK_PRIORITIES.find((p) => p.value === task.priority)?.label}
                              </span>
                            </div>
                            {task.description && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {task.description}
                              </p>
                            )}
                          </div>
                          <select
                            value={task.status}
                            onChange={(e) => updateTaskStatus(selectedOnboarding, task.id, e.target.value as TaskStatus)}
                            onClick={(e) => e.stopPropagation()}
                            className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          >
                            {TASK_STATUSES.map((status) => (
                              <option key={status.value} value={status.value}>
                                {status.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {viewMode === 'create' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{editingOnboarding ? t('tools.onboardingChecklist.editOnboarding2', 'Edit Onboarding') : t('tools.onboardingChecklist.newEmployeeOnboarding', 'New Employee Onboarding')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Employee Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('tools.onboardingChecklist.employeeName', 'Employee Name *')}
                    </label>
                    <input
                      type="text"
                      value={newOnboarding.employeeName}
                      onChange={(e) => setNewOnboarding({ ...newOnboarding, employeeName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('tools.onboardingChecklist.email', 'Email *')}
                    </label>
                    <input
                      type="email"
                      value={newOnboarding.employeeEmail}
                      onChange={(e) => setNewOnboarding({ ...newOnboarding, employeeEmail: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('tools.onboardingChecklist.department', 'Department')}
                    </label>
                    <input
                      type="text"
                      value={newOnboarding.department}
                      onChange={(e) => setNewOnboarding({ ...newOnboarding, department: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('tools.onboardingChecklist.position', 'Position')}
                    </label>
                    <input
                      type="text"
                      value={newOnboarding.position}
                      onChange={(e) => setNewOnboarding({ ...newOnboarding, position: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('tools.onboardingChecklist.manager', 'Manager')}
                    </label>
                    <input
                      type="text"
                      value={newOnboarding.manager}
                      onChange={(e) => setNewOnboarding({ ...newOnboarding, manager: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('tools.onboardingChecklist.startDate', 'Start Date')}
                    </label>
                    <input
                      type="date"
                      value={newOnboarding.startDate}
                      onChange={(e) => setNewOnboarding({ ...newOnboarding, startDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('tools.onboardingChecklist.notes', 'Notes')}
                  </label>
                  <textarea
                    value={newOnboarding.notes}
                    onChange={(e) => setNewOnboarding({ ...newOnboarding, notes: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder={t('tools.onboardingChecklist.additionalNotesAboutTheOnboarding', 'Additional notes about the onboarding...')}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Tasks Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{t('tools.onboardingChecklist.onboardingTasks', 'Onboarding Tasks')}</CardTitle>
                  {!editingOnboarding && (
                    <button
                      onClick={addDefaultTasks}
                      className="px-3 py-1.5 text-sm bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 rounded-lg hover:bg-orange-200 dark:hover:bg-orange-800"
                    >
                      {t('tools.onboardingChecklist.addDefaultTasks', 'Add Default Tasks')}
                    </button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add Task Form */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="md:col-span-2">
                    <input
                      type="text"
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder={t('tools.onboardingChecklist.taskTitle', 'Task title')}
                    />
                  </div>
                  <select
                    value={newTask.category}
                    onChange={(e) => setNewTask({ ...newTask, category: e.target.value as TaskCategory })}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {TASK_CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={addTask}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Task List */}
                {newOnboarding.tasks && newOnboarding.tasks.length > 0 && (
                  <div className="space-y-2">
                    {newOnboarding.tasks.map((task, idx) => {
                      const CategoryIcon = TASK_CATEGORIES.find((c) => c.value === task.category)?.icon || Circle;
                      return (
                        <div
                          key={task.id}
                          className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                        >
                          <CategoryIcon className="w-5 h-5 text-gray-400" />
                          <div className="flex-1">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {task.title}
                            </span>
                            <span className="ml-2 text-xs text-gray-500">
                              {TASK_CATEGORIES.find((c) => c.value === task.category)?.label}
                            </span>
                          </div>
                          <button
                            onClick={() =>
                              setNewOnboarding({
                                ...newOnboarding,
                                tasks: newOnboarding.tasks?.filter((_, i) => i !== idx),
                              })
                            }
                            className="text-red-500 hover:text-red-700"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={saveOnboarding}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
              >
                {editingOnboarding ? t('tools.onboardingChecklist.updateOnboarding', 'Update Onboarding') : t('tools.onboardingChecklist.createOnboarding', 'Create Onboarding')}
              </button>
              <button
                onClick={() => {
                  resetForm();
                  setViewMode('list');
                }}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                {t('tools.onboardingChecklist.cancel', 'Cancel')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingChecklistTool;
