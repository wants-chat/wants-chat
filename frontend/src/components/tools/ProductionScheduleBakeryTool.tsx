'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Utensils,
  Timer,
  Users,
  Flame,
  Refrigerator,
  ClipboardList,
  Play,
  Pause,
  Check,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { UIConfig } from '../ContextualUI';
import { useConfirmDialog } from '../ui/ConfirmDialog';
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
import { useTheme } from '@/contexts/ThemeContext';

interface ProductionScheduleBakeryToolProps {
  uiConfig?: UIConfig;
}

// Types
type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'delayed' | 'cancelled';
type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
type ProductCategory = 'bread' | 'pastry' | 'cake' | 'cookies' | 'specialty' | 'seasonal';
type Equipment = 'mixer' | 'oven_1' | 'oven_2' | 'proofer' | 'sheeter' | 'fryer' | 'freezer' | 'display';

interface ProductionTask {
  id: string;
  productName: string;
  category: ProductCategory;
  quantity: number;
  unit: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  prepTime: number; // in minutes
  bakeTime: number; // in minutes
  coolingTime: number; // in minutes
  equipmentNeeded: Equipment[];
  assignedTo: string;
  priority: TaskPriority;
  status: TaskStatus;
  batchNumber: string;
  linkedOrderId?: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

interface Staff {
  id: string;
  name: string;
  role: 'baker' | 'pastry_chef' | 'assistant' | 'decorator';
  available: boolean;
}

// Constants
const PRODUCT_CATEGORIES: { value: ProductCategory; label: string }[] = [
  { value: 'bread', label: 'Bread & Rolls' },
  { value: 'pastry', label: 'Pastries' },
  { value: 'cake', label: 'Cakes' },
  { value: 'cookies', label: 'Cookies & Bars' },
  { value: 'specialty', label: 'Specialty Items' },
  { value: 'seasonal', label: 'Seasonal' },
];

const TASK_STATUSES: { value: TaskStatus; label: string; color: string }[] = [
  { value: 'pending', label: 'Pending', color: 'gray' },
  { value: 'in_progress', label: 'In Progress', color: 'blue' },
  { value: 'completed', label: 'Completed', color: 'green' },
  { value: 'delayed', label: 'Delayed', color: 'yellow' },
  { value: 'cancelled', label: 'Cancelled', color: 'red' },
];

const TASK_PRIORITIES: { value: TaskPriority; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: 'gray' },
  { value: 'medium', label: 'Medium', color: 'blue' },
  { value: 'high', label: 'High', color: 'orange' },
  { value: 'urgent', label: 'Urgent', color: 'red' },
];

const EQUIPMENT_OPTIONS: { value: Equipment; label: string; icon: string }[] = [
  { value: 'mixer', label: 'Stand Mixer', icon: 'mixer' },
  { value: 'oven_1', label: 'Oven #1', icon: 'oven' },
  { value: 'oven_2', label: 'Oven #2', icon: 'oven' },
  { value: 'proofer', label: 'Proofer', icon: 'proofer' },
  { value: 'sheeter', label: 'Dough Sheeter', icon: 'sheeter' },
  { value: 'fryer', label: 'Fryer', icon: 'fryer' },
  { value: 'freezer', label: 'Freezer', icon: 'freezer' },
  { value: 'display', label: 'Display Case', icon: 'display' },
];

const DEFAULT_STAFF: Staff[] = [
  { id: '1', name: 'Maria Garcia', role: 'baker', available: true },
  { id: '2', name: 'James Chen', role: 'pastry_chef', available: true },
  { id: '3', name: 'Sofia Williams', role: 'assistant', available: true },
  { id: '4', name: 'Alex Thompson', role: 'decorator', available: true },
];

// Column configuration for exports
const TASK_COLUMNS: ColumnConfig[] = [
  { key: 'batchNumber', header: 'Batch #', type: 'string' },
  { key: 'productName', header: 'Product', type: 'string' },
  { key: 'category', header: 'Category', type: 'string' },
  { key: 'quantity', header: 'Qty', type: 'number' },
  { key: 'unit', header: 'Unit', type: 'string' },
  { key: 'scheduledDate', header: 'Date', type: 'date' },
  { key: 'startTime', header: 'Start', type: 'string' },
  { key: 'endTime', header: 'End', type: 'string' },
  { key: 'assignedTo', header: 'Assigned To', type: 'string' },
  { key: 'priority', header: 'Priority', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
];

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);
const generateBatchNumber = () => `BK-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

const calculateEndTime = (startTime: string, prepTime: number, bakeTime: number, coolingTime: number) => {
  const [hours, minutes] = startTime.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + prepTime + bakeTime + coolingTime;
  const endHours = Math.floor(totalMinutes / 60) % 24;
  const endMinutes = totalMinutes % 60;
  return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
};

// Main Component
export const ProductionScheduleBakeryTool: React.FC<ProductionScheduleBakeryToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // useToolData hook for backend sync
  const {
    data: tasks,
    addItem: addTaskToBackend,
    updateItem: updateTaskBackend,
    deleteItem: deleteTaskBackend,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<ProductionTask>('bakery-production-schedule', [], TASK_COLUMNS);

  // Local UI State
  const [activeTab, setActiveTab] = useState<'schedule' | 'new' | 'timeline'>('schedule');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  // New task form state
  const [newTask, setNewTask] = useState<Partial<ProductionTask>>({
    productName: '',
    category: 'bread',
    quantity: 1,
    unit: 'loaves',
    scheduledDate: selectedDate,
    startTime: '05:00',
    prepTime: 30,
    bakeTime: 45,
    coolingTime: 30,
    equipmentNeeded: [],
    assignedTo: '',
    priority: 'medium',
    notes: '',
  });

  // Add new task
  const addTask = () => {
    if (!newTask.productName || !newTask.scheduledDate || !newTask.startTime) {
      setValidationMessage('Please fill in product name, date, and start time');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const endTime = calculateEndTime(
      newTask.startTime || '05:00',
      newTask.prepTime || 0,
      newTask.bakeTime || 0,
      newTask.coolingTime || 0
    );

    const task: ProductionTask = {
      id: generateId(),
      productName: newTask.productName || '',
      category: newTask.category || 'bread',
      quantity: newTask.quantity || 1,
      unit: newTask.unit || 'items',
      scheduledDate: newTask.scheduledDate || selectedDate,
      startTime: newTask.startTime || '05:00',
      endTime,
      prepTime: newTask.prepTime || 0,
      bakeTime: newTask.bakeTime || 0,
      coolingTime: newTask.coolingTime || 0,
      equipmentNeeded: newTask.equipmentNeeded || [],
      assignedTo: newTask.assignedTo || '',
      priority: newTask.priority || 'medium',
      status: 'pending',
      batchNumber: generateBatchNumber(),
      notes: newTask.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addTaskToBackend(task);
    setActiveTab('schedule');
    setNewTask({
      productName: '',
      category: 'bread',
      quantity: 1,
      unit: 'loaves',
      scheduledDate: selectedDate,
      startTime: '05:00',
      prepTime: 30,
      bakeTime: 45,
      coolingTime: 30,
      equipmentNeeded: [],
      assignedTo: '',
      priority: 'medium',
      notes: '',
    });
  };

  // Update task status
  const updateTaskStatus = (taskId: string, status: TaskStatus) => {
    const updates: Partial<ProductionTask> = {
      status,
      updatedAt: new Date().toISOString(),
    };
    if (status === 'completed') {
      updates.completedAt = new Date().toISOString();
    }
    updateTaskBackend(taskId, updates);
  };

  // Delete task
  const deleteTask = async (taskId: string) => {
    const confirmed = await confirm({
      title: 'Confirm Action',
      message: 'Are you sure you want to delete this task?',
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (!confirmed) return;
    deleteTaskBackend(taskId);
  };

  // Toggle equipment selection
  const toggleEquipment = (equipment: Equipment) => {
    const current = newTask.equipmentNeeded || [];
    if (current.includes(equipment)) {
      setNewTask({ ...newTask, equipmentNeeded: current.filter(e => e !== equipment) });
    } else {
      setNewTask({ ...newTask, equipmentNeeded: [...current, equipment] });
    }
  };

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesDate = task.scheduledDate === selectedDate;
      const matchesSearch =
        searchTerm === '' ||
        task.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.batchNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
      const matchesCategory = filterCategory === 'all' || task.category === filterCategory;
      return matchesDate && matchesSearch && matchesStatus && matchesCategory;
    }).sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [tasks, selectedDate, searchTerm, filterStatus, filterCategory]);

  // All tasks for selected date (for timeline)
  const dayTasks = useMemo(() => {
    return tasks.filter(task => task.scheduledDate === selectedDate)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [tasks, selectedDate]);

  // Summary stats
  const daySummary = useMemo(() => {
    const dayItems = tasks.filter(t => t.scheduledDate === selectedDate);
    const pending = dayItems.filter(t => t.status === 'pending').length;
    const inProgress = dayItems.filter(t => t.status === 'in_progress').length;
    const completed = dayItems.filter(t => t.status === 'completed').length;
    const delayed = dayItems.filter(t => t.status === 'delayed').length;
    const totalItems = dayItems.reduce((sum, t) => sum + t.quantity, 0);

    return { total: dayItems.length, pending, inProgress, completed, delayed, totalItems };
  }, [tasks, selectedDate]);

  const getStatusColor = (status: TaskStatus) => {
    const statusInfo = TASK_STATUSES.find(s => s.value === status);
    const colors = {
      gray: theme === 'dark' ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-100 text-gray-800 border-gray-300',
      blue: theme === 'dark' ? 'bg-blue-900/30 text-blue-400 border-blue-700' : 'bg-blue-100 text-blue-800 border-blue-300',
      green: theme === 'dark' ? 'bg-green-900/30 text-green-400 border-green-700' : 'bg-green-100 text-green-800 border-green-300',
      yellow: theme === 'dark' ? 'bg-yellow-900/30 text-yellow-400 border-yellow-700' : 'bg-yellow-100 text-yellow-800 border-yellow-300',
      red: theme === 'dark' ? 'bg-red-900/30 text-red-400 border-red-700' : 'bg-red-100 text-red-800 border-red-300',
    };
    return colors[statusInfo?.color as keyof typeof colors] || colors.gray;
  };

  const getPriorityColor = (priority: TaskPriority) => {
    const colors = {
      low: theme === 'dark' ? 'text-gray-400' : 'text-gray-500',
      medium: theme === 'dark' ? 'text-blue-400' : 'text-blue-600',
      high: theme === 'dark' ? 'text-orange-400' : 'text-orange-600',
      urgent: theme === 'dark' ? 'text-red-400' : 'text-red-600',
    };
    return colors[priority];
  };

  return (
    <>
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.productionScheduleBakery.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.productionScheduleBakery.bakeryProductionSchedule', 'Bakery Production Schedule')}
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.productionScheduleBakery.planAndTrackDailyBakery', 'Plan and track daily bakery production tasks')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="production-schedule-bakery" toolName="Production Schedule Bakery" />

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
                onExportCSV={() => exportToCSV(tasks, TASK_COLUMNS, { filename: 'production-schedule' })}
                onExportExcel={() => exportToExcel(tasks, TASK_COLUMNS, { filename: 'production-schedule' })}
                onExportJSON={() => exportToJSON(tasks, { filename: 'production-schedule' })}
                onExportPDF={async () => {
                  await exportToPDF(tasks, TASK_COLUMNS, {
                    filename: 'production-schedule',
                    title: 'Bakery Production Schedule',
                    subtitle: `${formatDate(selectedDate)} - ${daySummary.total} tasks`,
                  });
                }}
                onPrint={() => printData(dayTasks, TASK_COLUMNS, { title: `Production Schedule - ${formatDate(selectedDate)}` })}
                onCopyToClipboard={async () => await copyUtil(dayTasks, TASK_COLUMNS, 'tab')}
                showImport={false}
                theme={theme}
              />
            </div>
          </div>

          {/* Date Selection */}
          <div className="flex items-center gap-4 mb-4">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className={`px-4 py-2 rounded-lg border ${
                theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              }`}
            />
            <button
              onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
              className={`px-3 py-2 rounded-lg text-sm ${
                theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t('tools.productionScheduleBakery.today', 'Today')}
            </button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-4">
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{daySummary.total}</div>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.productionScheduleBakery.totalTasks', 'Total Tasks')}</div>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{daySummary.pending}</div>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.productionScheduleBakery.pending', 'Pending')}</div>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className={`text-2xl font-bold text-blue-500`}>{daySummary.inProgress}</div>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.productionScheduleBakery.inProgress', 'In Progress')}</div>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className={`text-2xl font-bold text-green-500`}>{daySummary.completed}</div>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.productionScheduleBakery.completed', 'Completed')}</div>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className={`text-2xl font-bold text-yellow-500`}>{daySummary.delayed}</div>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.productionScheduleBakery.delayed', 'Delayed')}</div>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{daySummary.totalItems}</div>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.productionScheduleBakery.totalItems', 'Total Items')}</div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'schedule', label: 'Task List', icon: <ClipboardList className="w-4 h-4" /> },
              { id: 'timeline', label: 'Timeline', icon: <Clock className="w-4 h-4" /> },
              { id: 'new', label: 'Add Task', icon: <Plus className="w-4 h-4" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#0D9488] text-white'
                    : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            {/* Search and Filter */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                  <input
                    type="text"
                    placeholder={t('tools.productionScheduleBakery.searchByProductOrBatch', 'Search by product or batch #...')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className={`px-4 py-2 rounded-lg border ${
                  theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="all">{t('tools.productionScheduleBakery.allStatuses', 'All Statuses')}</option>
                {TASK_STATUSES.map((status) => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className={`px-4 py-2 rounded-lg border ${
                  theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="all">{t('tools.productionScheduleBakery.allCategories', 'All Categories')}</option>
                {PRODUCT_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            {/* Tasks List */}
            <div className="space-y-4">
              {filteredTasks.length === 0 ? (
                <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No tasks scheduled for {formatDate(selectedDate)}</p>
                </div>
              ) : (
                filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`border rounded-lg ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}
                  >
                    <div
                      className={`p-4 cursor-pointer ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
                      onClick={() => setExpandedTaskId(expandedTaskId === task.id ? null : task.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`text-sm font-mono ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            {task.startTime} - {task.endTime}
                          </div>
                          <div>
                            <div className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} ${getPriorityColor(task.priority)}`}>
                              {task.productName}
                            </div>
                            <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {task.quantity} {task.unit} - {task.batchNumber}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {task.assignedTo && (
                            <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {task.assignedTo}
                            </span>
                          )}
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                            {TASK_STATUSES.find(s => s.value === task.status)?.label}
                          </span>
                          {expandedTaskId === task.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </div>
                      </div>
                    </div>

                    {expandedTaskId === task.id && (
                      <div className={`p-4 border-t ${theme === 'dark' ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}>
                        <div className="grid md:grid-cols-3 gap-6">
                          {/* Time Details */}
                          <div>
                            <h4 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.productionScheduleBakery.timeBreakdown', 'Time Breakdown')}</h4>
                            <div className={`space-y-1 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                              <p className="flex items-center gap-2"><Timer className="w-4 h-4" /> Prep: {task.prepTime} min</p>
                              <p className="flex items-center gap-2"><Flame className="w-4 h-4" /> Bake: {task.bakeTime} min</p>
                              <p className="flex items-center gap-2"><Refrigerator className="w-4 h-4" /> Cool: {task.coolingTime} min</p>
                              <p className="font-medium pt-2">Total: {task.prepTime + task.bakeTime + task.coolingTime} min</p>
                            </div>
                          </div>

                          {/* Equipment */}
                          <div>
                            <h4 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.productionScheduleBakery.equipmentNeeded', 'Equipment Needed')}</h4>
                            <div className="flex flex-wrap gap-2">
                              {task.equipmentNeeded.map((eq) => (
                                <span
                                  key={eq}
                                  className={`px-2 py-1 text-xs rounded ${
                                    theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                                  }`}
                                >
                                  {EQUIPMENT_OPTIONS.find(e => e.value === eq)?.label}
                                </span>
                              ))}
                              {task.equipmentNeeded.length === 0 && (
                                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.productionScheduleBakery.noneSpecified', 'None specified')}</span>
                              )}
                            </div>
                            {task.notes && (
                              <div className="mt-3">
                                <p className={`font-medium text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.productionScheduleBakery.notes', 'Notes:')}</p>
                                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{task.notes}</p>
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div>
                            <h4 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.productionScheduleBakery.actions', 'Actions')}</h4>
                            <div className="flex flex-wrap gap-2">
                              {task.status === 'pending' && (
                                <button
                                  onClick={() => updateTaskStatus(task.id, 'in_progress')}
                                  className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                                >
                                  <Play className="w-3 h-3" /> Start
                                </button>
                              )}
                              {task.status === 'in_progress' && (
                                <>
                                  <button
                                    onClick={() => updateTaskStatus(task.id, 'completed')}
                                    className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                                  >
                                    <Check className="w-3 h-3" /> Complete
                                  </button>
                                  <button
                                    onClick={() => updateTaskStatus(task.id, 'delayed')}
                                    className="flex items-center gap-1 px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600"
                                  >
                                    <Pause className="w-3 h-3" /> Delay
                                  </button>
                                </>
                              )}
                              {task.status === 'delayed' && (
                                <button
                                  onClick={() => updateTaskStatus(task.id, 'in_progress')}
                                  className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                                >
                                  <RotateCcw className="w-3 h-3" /> Resume
                                </button>
                              )}
                              <button
                                onClick={() => deleteTask(task.id)}
                                className="p-1 text-red-500 hover:bg-red-100 rounded"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Timeline Tab */}
        {activeTab === 'timeline' && (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <h2 className={`text-xl font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Daily Timeline - {formatDate(selectedDate)}
            </h2>

            {dayTasks.length === 0 ? (
              <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{t('tools.productionScheduleBakery.noTasksScheduled', 'No tasks scheduled')}</p>
              </div>
            ) : (
              <div className="relative">
                {/* Time axis */}
                <div className="absolute left-0 top-0 bottom-0 w-20 border-r border-gray-300 dark:border-gray-600">
                  {Array.from({ length: 18 }, (_, i) => i + 4).map((hour) => (
                    <div
                      key={hour}
                      className={`h-12 text-right pr-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}
                    >
                      {String(hour).padStart(2, '0')}:00
                    </div>
                  ))}
                </div>

                {/* Tasks */}
                <div className="ml-24 relative" style={{ height: `${18 * 48}px` }}>
                  {dayTasks.map((task) => {
                    const [startHour, startMin] = task.startTime.split(':').map(Number);
                    const [endHour, endMin] = task.endTime.split(':').map(Number);
                    const startOffset = ((startHour - 4) * 60 + startMin) * (48 / 60);
                    const duration = ((endHour - startHour) * 60 + (endMin - startMin)) * (48 / 60);

                    const bgColor = {
                      pending: theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300',
                      in_progress: theme === 'dark' ? 'bg-blue-600' : 'bg-blue-400',
                      completed: theme === 'dark' ? 'bg-green-600' : 'bg-green-400',
                      delayed: theme === 'dark' ? 'bg-yellow-600' : 'bg-yellow-400',
                      cancelled: theme === 'dark' ? 'bg-red-600' : 'bg-red-400',
                    };

                    return (
                      <div
                        key={task.id}
                        className={`absolute left-0 right-4 rounded px-2 py-1 ${bgColor[task.status]} text-white text-sm overflow-hidden`}
                        style={{ top: `${startOffset}px`, height: `${Math.max(duration, 24)}px` }}
                      >
                        <div className="font-medium truncate">{task.productName}</div>
                        <div className="text-xs opacity-80 truncate">{task.quantity} {task.unit}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* New Task Tab */}
        {activeTab === 'new' && (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <h2 className={`text-xl font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.productionScheduleBakery.addProductionTask', 'Add Production Task')}
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Product Details */}
              <div className="space-y-4">
                <h3 className={`font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.productionScheduleBakery.productDetails', 'Product Details')}</h3>
                <input
                  type="text"
                  placeholder={t('tools.productionScheduleBakery.productName', 'Product Name *')}
                  value={newTask.productName}
                  onChange={(e) => setNewTask({ ...newTask, productName: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                />
                <select
                  value={newTask.category}
                  onChange={(e) => setNewTask({ ...newTask, category: e.target.value as ProductCategory })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                >
                  {PRODUCT_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    min="1"
                    placeholder={t('tools.productionScheduleBakery.quantity', 'Quantity')}
                    value={newTask.quantity}
                    onChange={(e) => setNewTask({ ...newTask, quantity: parseInt(e.target.value) || 1 })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                  <input
                    type="text"
                    placeholder={t('tools.productionScheduleBakery.unitLoavesPcsEtc', 'Unit (loaves, pcs, etc.)')}
                    value={newTask.unit}
                    onChange={(e) => setNewTask({ ...newTask, unit: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
              </div>

              {/* Schedule */}
              <div className="space-y-4">
                <h3 className={`font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.productionScheduleBakery.schedule', 'Schedule')}</h3>
                <input
                  type="date"
                  value={newTask.scheduledDate}
                  onChange={(e) => setNewTask({ ...newTask, scheduledDate: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                />
                <input
                  type="time"
                  value={newTask.startTime}
                  onChange={(e) => setNewTask({ ...newTask, startTime: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                />
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-sm mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.productionScheduleBakery.prepMin', 'Prep (min)')}</label>
                    <input
                      type="number"
                      min="0"
                      value={newTask.prepTime}
                      onChange={(e) => setNewTask({ ...newTask, prepTime: parseInt(e.target.value) || 0 })}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.productionScheduleBakery.bakeMin', 'Bake (min)')}</label>
                    <input
                      type="number"
                      min="0"
                      value={newTask.bakeTime}
                      onChange={(e) => setNewTask({ ...newTask, bakeTime: parseInt(e.target.value) || 0 })}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.productionScheduleBakery.coolMin', 'Cool (min)')}</label>
                    <input
                      type="number"
                      min="0"
                      value={newTask.coolingTime}
                      onChange={(e) => setNewTask({ ...newTask, coolingTime: parseInt(e.target.value) || 0 })}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Equipment & Assignment */}
              <div className="space-y-4">
                <h3 className={`font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.productionScheduleBakery.equipmentNeeded2', 'Equipment Needed')}</h3>
                <div className="flex flex-wrap gap-2">
                  {EQUIPMENT_OPTIONS.map((eq) => (
                    <button
                      key={eq.value}
                      onClick={() => toggleEquipment(eq.value)}
                      className={`px-3 py-1 rounded text-sm transition-colors ${
                        newTask.equipmentNeeded?.includes(eq.value)
                          ? 'bg-[#0D9488] text-white'
                          : theme === 'dark'
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {eq.label}
                    </button>
                  ))}
                </div>

                <select
                  value={newTask.assignedTo}
                  onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                >
                  <option value="">{t('tools.productionScheduleBakery.assignTo', 'Assign to...')}</option>
                  {DEFAULT_STAFF.map((staff) => (
                    <option key={staff.id} value={staff.name}>{staff.name} ({staff.role})</option>
                  ))}
                </select>
              </div>

              {/* Priority & Notes */}
              <div className="space-y-4">
                <h3 className={`font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.productionScheduleBakery.priorityNotes', 'Priority & Notes')}</h3>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as TaskPriority })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                >
                  {TASK_PRIORITIES.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
                <textarea
                  placeholder={t('tools.productionScheduleBakery.notes2', 'Notes')}
                  value={newTask.notes}
                  onChange={(e) => setNewTask({ ...newTask, notes: e.target.value })}
                  rows={3}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                />

                <button
                  onClick={addTask}
                  className="w-full py-3 bg-[#0D9488] text-white rounded-lg font-medium hover:bg-[#0B7C71] transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  {t('tools.productionScheduleBakery.addTask', 'Add Task')}
                </button>
              </div>
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
};

export default ProductionScheduleBakeryTool;
