'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  SprayCan,
  Plus,
  Trash2,
  Edit2,
  Save,
  Search,
  X,
  Clock,
  User,
  Bed,
  CheckCircle2,
  AlertCircle,
  XCircle,
  RefreshCw,
  Calendar,
  Filter,
  LayoutGrid,
  List,
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import useToolData from '../../hooks/useToolData';
import { type ColumnConfig } from '../../lib/toolDataUtils';

interface HousekeepingToolProps {
  uiConfig?: UIConfig;
}

interface HousekeepingTask {
  id: string;
  roomNumber: string;
  floor: number;
  roomType: RoomType;
  taskType: TaskType;
  status: TaskStatus;
  priority: Priority;
  assignedTo: string;
  scheduledDate: string;
  scheduledTime: string;
  startedAt: string;
  completedAt: string;
  estimatedDuration: number;
  actualDuration: number;
  inspectedBy: string;
  inspectionStatus: InspectionStatus;
  notes: string;
  checklistItems: ChecklistItem[];
  supplies: string[];
  issues: string[];
  createdAt: string;
  updatedAt: string;
}

interface ChecklistItem {
  id: string;
  name: string;
  completed: boolean;
}

type RoomType = 'standard' | 'deluxe' | 'suite' | 'penthouse' | 'family';
type TaskType = 'checkout-clean' | 'stayover' | 'deep-clean' | 'turndown' | 'touch-up' | 'inspection';
type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'on-hold' | 'cancelled';
type Priority = 'low' | 'normal' | 'high' | 'urgent';
type InspectionStatus = 'not-inspected' | 'passed' | 'failed' | 'needs-attention';

const ROOM_TYPES: { value: RoomType; label: string }[] = [
  { value: 'standard', label: 'Standard' },
  { value: 'deluxe', label: 'Deluxe' },
  { value: 'suite', label: 'Suite' },
  { value: 'penthouse', label: 'Penthouse' },
  { value: 'family', label: 'Family Room' },
];

const TASK_TYPES: { value: TaskType; label: string; duration: number }[] = [
  { value: 'checkout-clean', label: 'Checkout Clean', duration: 45 },
  { value: 'stayover', label: 'Stayover Service', duration: 25 },
  { value: 'deep-clean', label: 'Deep Clean', duration: 90 },
  { value: 'turndown', label: 'Turndown Service', duration: 15 },
  { value: 'touch-up', label: 'Touch-Up', duration: 10 },
  { value: 'inspection', label: 'Inspection', duration: 15 },
];

const TASK_STATUSES: { value: TaskStatus; label: string; color: string }[] = [
  { value: 'pending', label: 'Pending', color: 'yellow' },
  { value: 'in-progress', label: 'In Progress', color: 'blue' },
  { value: 'completed', label: 'Completed', color: 'green' },
  { value: 'on-hold', label: 'On Hold', color: 'orange' },
  { value: 'cancelled', label: 'Cancelled', color: 'gray' },
];

const PRIORITIES: { value: Priority; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: 'gray' },
  { value: 'normal', label: 'Normal', color: 'blue' },
  { value: 'high', label: 'High', color: 'orange' },
  { value: 'urgent', label: 'Urgent', color: 'red' },
];

const INSPECTION_STATUSES: { value: InspectionStatus; label: string; color: string }[] = [
  { value: 'not-inspected', label: 'Not Inspected', color: 'gray' },
  { value: 'passed', label: 'Passed', color: 'green' },
  { value: 'failed', label: 'Failed', color: 'red' },
  { value: 'needs-attention', label: 'Needs Attention', color: 'yellow' },
];

const DEFAULT_CHECKLIST: ChecklistItem[] = [
  { id: '1', name: 'Make bed with fresh linens', completed: false },
  { id: '2', name: 'Vacuum carpet/floors', completed: false },
  { id: '3', name: 'Clean bathroom', completed: false },
  { id: '4', name: 'Dust all surfaces', completed: false },
  { id: '5', name: 'Replace towels', completed: false },
  { id: '6', name: 'Restock amenities', completed: false },
  { id: '7', name: 'Empty trash', completed: false },
  { id: '8', name: 'Clean mirrors', completed: false },
  { id: '9', name: 'Check minibar', completed: false },
  { id: '10', name: 'Check all lights work', completed: false },
];

const taskColumns: ColumnConfig[] = [
  { key: 'id', header: 'Task ID', type: 'string' },
  { key: 'roomNumber', header: 'Room', type: 'string' },
  { key: 'floor', header: 'Floor', type: 'number' },
  { key: 'taskType', header: 'Task Type', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'priority', header: 'Priority', type: 'string' },
  { key: 'assignedTo', header: 'Assigned To', type: 'string' },
  { key: 'scheduledDate', header: 'Date', type: 'date' },
  { key: 'scheduledTime', header: 'Time', type: 'string' },
  { key: 'inspectionStatus', header: 'Inspection', type: 'string' },
];

const generateSampleTasks = (): HousekeepingTask[] => {
  const today = new Date().toISOString().split('T')[0];
  return [
    {
      id: 'HK-001',
      roomNumber: '412',
      floor: 4,
      roomType: 'deluxe',
      taskType: 'checkout-clean',
      status: 'in-progress',
      priority: 'high',
      assignedTo: 'Maria Garcia',
      scheduledDate: today,
      scheduledTime: '10:00',
      startedAt: new Date(Date.now() - 20 * 60000).toISOString(),
      completedAt: '',
      estimatedDuration: 45,
      actualDuration: 0,
      inspectedBy: '',
      inspectionStatus: 'not-inspected',
      notes: 'VIP guest checking in at 2 PM',
      checklistItems: DEFAULT_CHECKLIST.map((item, idx) => ({...item, completed: idx < 5})),
      supplies: ['Fresh linens', 'Towels', 'Toiletries', 'Minibar restock'],
      issues: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'HK-002',
      roomNumber: '305',
      floor: 3,
      roomType: 'standard',
      taskType: 'stayover',
      status: 'pending',
      priority: 'normal',
      assignedTo: 'Carlos Mendez',
      scheduledDate: today,
      scheduledTime: '11:00',
      startedAt: '',
      completedAt: '',
      estimatedDuration: 25,
      actualDuration: 0,
      inspectedBy: '',
      inspectionStatus: 'not-inspected',
      notes: 'Guest requested late service - after 11 AM',
      checklistItems: DEFAULT_CHECKLIST.map(item => ({...item})),
      supplies: ['Towels', 'Toiletries'],
      issues: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'HK-003',
      roomNumber: '518',
      floor: 5,
      roomType: 'suite',
      taskType: 'checkout-clean',
      status: 'completed',
      priority: 'normal',
      assignedTo: 'Anna Lee',
      scheduledDate: today,
      scheduledTime: '09:00',
      startedAt: new Date(Date.now() - 90 * 60000).toISOString(),
      completedAt: new Date(Date.now() - 45 * 60000).toISOString(),
      estimatedDuration: 45,
      actualDuration: 45,
      inspectedBy: 'John Supervisor',
      inspectionStatus: 'passed',
      notes: '',
      checklistItems: DEFAULT_CHECKLIST.map(item => ({...item, completed: true})),
      supplies: ['Fresh linens', 'Towels', 'Toiletries', 'Flowers'],
      issues: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'HK-004',
      roomNumber: '201',
      floor: 2,
      roomType: 'standard',
      taskType: 'deep-clean',
      status: 'pending',
      priority: 'urgent',
      assignedTo: 'Maria Garcia',
      scheduledDate: today,
      scheduledTime: '14:00',
      startedAt: '',
      completedAt: '',
      estimatedDuration: 90,
      actualDuration: 0,
      inspectedBy: '',
      inspectionStatus: 'not-inspected',
      notes: 'Guest reported stains on carpet - needs extra attention',
      checklistItems: DEFAULT_CHECKLIST.map(item => ({...item})),
      supplies: ['Fresh linens', 'Carpet cleaner', 'Steam cleaner'],
      issues: ['Carpet stains reported'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'HK-005',
      roomNumber: '602',
      floor: 6,
      roomType: 'penthouse',
      taskType: 'turndown',
      status: 'pending',
      priority: 'high',
      assignedTo: 'Carlos Mendez',
      scheduledDate: today,
      scheduledTime: '18:00',
      startedAt: '',
      completedAt: '',
      estimatedDuration: 15,
      actualDuration: 0,
      inspectedBy: '',
      inspectionStatus: 'not-inspected',
      notes: 'VIP Suite - Leave chocolates and rose petals',
      checklistItems: [
        { id: '1', name: 'Turn down bed', completed: false },
        { id: '2', name: 'Close curtains', completed: false },
        { id: '3', name: 'Place chocolates', completed: false },
        { id: '4', name: 'Fresh towels', completed: false },
        { id: '5', name: 'Dim lighting', completed: false },
      ],
      supplies: ['Chocolates', 'Rose petals', 'Fresh towels'],
      issues: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
};

export const HousekeepingTool: React.FC<HousekeepingToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const taskData = useToolData<HousekeepingTask>(
    'housekeeping',
    generateSampleTasks(),
    taskColumns,
    { autoSave: true }
  );

  const tasks = taskData.data;

  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<HousekeepingTask | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<TaskStatus | ''>('');
  const [filterFloor, setFilterFloor] = useState<number | ''>('');
  const [filterType, setFilterType] = useState<TaskType | ''>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [newTask, setNewTask] = useState<Partial<HousekeepingTask>>({
    roomNumber: '',
    floor: 1,
    roomType: 'standard',
    taskType: 'stayover',
    status: 'pending',
    priority: 'normal',
    assignedTo: '',
    scheduledDate: new Date().toISOString().split('T')[0],
    scheduledTime: '09:00',
    notes: '',
    checklistItems: [...DEFAULT_CHECKLIST],
    supplies: [],
    issues: [],
  });

  const handleAddTask = () => {
    if (!newTask.roomNumber) return;

    const taskType = TASK_TYPES.find(t => t.value === newTask.taskType);
    const task: HousekeepingTask = {
      id: `HK-${Date.now().toString().slice(-6)}`,
      roomNumber: newTask.roomNumber || '',
      floor: newTask.floor || 1,
      roomType: newTask.roomType as RoomType || 'standard',
      taskType: newTask.taskType as TaskType || 'stayover',
      status: 'pending',
      priority: newTask.priority as Priority || 'normal',
      assignedTo: newTask.assignedTo || '',
      scheduledDate: newTask.scheduledDate || new Date().toISOString().split('T')[0],
      scheduledTime: newTask.scheduledTime || '09:00',
      startedAt: '',
      completedAt: '',
      estimatedDuration: taskType?.duration || 30,
      actualDuration: 0,
      inspectedBy: '',
      inspectionStatus: 'not-inspected',
      notes: newTask.notes || '',
      checklistItems: newTask.checklistItems || [...DEFAULT_CHECKLIST],
      supplies: newTask.supplies || [],
      issues: newTask.issues || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    taskData.addItem(task);
    resetNewTask();
    setShowForm(false);
  };

  const handleUpdateTask = () => {
    if (!editingTask) return;
    taskData.updateItem(editingTask.id, {
      ...editingTask,
      updatedAt: new Date().toISOString(),
    });
    setEditingTask(null);
  };

  const handleDeleteTask = (id: string) => {
    taskData.deleteItem(id);
  };

  const handleStartTask = (task: HousekeepingTask) => {
    taskData.updateItem(task.id, {
      status: 'in-progress',
      startedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  };

  const handleCompleteTask = (task: HousekeepingTask) => {
    const startTime = new Date(task.startedAt).getTime();
    const duration = Math.round((Date.now() - startTime) / 60000);
    taskData.updateItem(task.id, {
      status: 'completed',
      completedAt: new Date().toISOString(),
      actualDuration: duration,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleToggleChecklistItem = (task: HousekeepingTask, itemId: string) => {
    const updatedChecklist = task.checklistItems.map(item =>
      item.id === itemId ? {...item, completed: !item.completed} : item
    );
    taskData.updateItem(task.id, {
      checklistItems: updatedChecklist,
      updatedAt: new Date().toISOString(),
    });
  };

  const resetNewTask = () => {
    setNewTask({
      roomNumber: '',
      floor: 1,
      roomType: 'standard',
      taskType: 'stayover',
      status: 'pending',
      priority: 'normal',
      assignedTo: '',
      scheduledDate: new Date().toISOString().split('T')[0],
      scheduledTime: '09:00',
      notes: '',
      checklistItems: [...DEFAULT_CHECKLIST],
      supplies: [],
      issues: [],
    });
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = !searchQuery ||
        task.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.assignedTo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = !filterStatus || task.status === filterStatus;
      const matchesFloor = !filterFloor || task.floor === filterFloor;
      const matchesType = !filterType || task.taskType === filterType;
      return matchesSearch && matchesStatus && matchesFloor && matchesType;
    });
  }, [tasks, searchQuery, filterStatus, filterFloor, filterType]);

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

  const floors = useMemo(() => {
    const uniqueFloors = [...new Set(tasks.map(t => t.floor))];
    return uniqueFloors.sort((a, b) => a - b);
  }, [tasks]);

  const getStatusColor = (status: TaskStatus) => {
    const statusObj = TASK_STATUSES.find(s => s.value === status);
    const colors: Record<string, string> = {
      yellow: isDark ? 'bg-yellow-900/50 text-yellow-300' : 'bg-yellow-100 text-yellow-800',
      blue: isDark ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-800',
      green: isDark ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-800',
      orange: isDark ? 'bg-orange-900/50 text-orange-300' : 'bg-orange-100 text-orange-800',
      gray: isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800',
    };
    return colors[statusObj?.color || 'gray'];
  };

  const getPriorityColor = (priority: Priority) => {
    const priorityObj = PRIORITIES.find(p => p.value === priority);
    const colors: Record<string, string> = {
      gray: isDark ? 'border-gray-600' : 'border-gray-300',
      blue: 'border-blue-500',
      orange: 'border-orange-500',
      red: 'border-red-500',
    };
    return colors[priorityObj?.color || 'gray'];
  };

  const getCompletionPercentage = (task: HousekeepingTask) => {
    const total = task.checklistItems.length;
    const completed = task.checklistItems.filter(i => i.completed).length;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  return (
    <div className={`min-h-screen p-6 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <SprayCan className="w-7 h-7 text-teal-500" />
              {t('tools.housekeeping.housekeepingManagement', 'Housekeeping Management')}
            </h1>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.housekeeping.manageHousekeepingTasksAndRoom', 'Manage housekeeping tasks and room cleaning schedules')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <WidgetEmbedButton toolSlug="housekeeping" toolName="Housekeeping" />

            <SyncStatus
              isSynced={taskData.isSynced}
              isSaving={taskData.isSaving}
              lastSaved={taskData.lastSaved}
              syncError={taskData.syncError}
              onForceSync={taskData.forceSync}
            />
            <ExportDropdown
              onExportCSV={() => taskData.exportCSV()}
              onExportExcel={() => taskData.exportExcel()}
              onExportJSON={() => taskData.exportJSON()}
              onExportPDF={() => taskData.exportPDF()}
              onCopy={() => taskData.copyToClipboard()}
              onPrint={() => taskData.print('Housekeeping Tasks')}
            />
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t('tools.housekeeping.addTask', 'Add Task')}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.housekeeping.todaySTasks', 'Today\'s Tasks')}</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.housekeeping.completed', 'Completed')}</p>
            <p className="text-2xl font-bold text-green-500">{stats.completed}</p>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.housekeeping.inProgress', 'In Progress')}</p>
            <p className="text-2xl font-bold text-blue-500">{stats.inProgress}</p>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.housekeeping.pending', 'Pending')}</p>
            <p className="text-2xl font-bold text-yellow-500">{stats.pending}</p>
          </div>
        </div>

        {/* Filters */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow mb-6`}>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('tools.housekeeping.searchByRoomStaffOr', 'Search by room, staff, or task ID...')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as TaskStatus | '')}
              className={`px-4 py-2 rounded-lg border ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="">{t('tools.housekeeping.allStatuses', 'All Statuses')}</option>
              {TASK_STATUSES.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <select
              value={filterFloor}
              onChange={(e) => setFilterFloor(e.target.value ? parseInt(e.target.value) : '')}
              className={`px-4 py-2 rounded-lg border ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="">{t('tools.housekeeping.allFloors', 'All Floors')}</option>
              {floors.map(f => (
                <option key={f} value={f}>Floor {f}</option>
              ))}
            </select>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as TaskType | '')}
              className={`px-4 py-2 rounded-lg border ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="">{t('tools.housekeeping.allTypes', 'All Types')}</option>
              {TASK_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            <div className="flex gap-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-teal-600 text-white' : isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-teal-600 text-white' : isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Tasks Display */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTasks.map(task => (
              <div
                key={task.id}
                className={`rounded-lg border-l-4 ${getPriorityColor(task.priority)} ${isDark ? 'bg-gray-800' : 'bg-white'} shadow overflow-hidden`}
              >
                <div className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Bed className="w-4 h-4 text-teal-500" />
                        <span className="font-bold">Room {task.roomNumber}</span>
                      </div>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Floor {task.floor} - {ROOM_TYPES.find(r => r.value === task.roomType)?.label}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                      {TASK_STATUSES.find(s => s.value === task.status)?.label}
                    </span>
                  </div>

                  <div className="mb-3">
                    <p className="font-medium">{TASK_TYPES.find(t => t.value === task.taskType)?.label}</p>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Assigned: {task.assignedTo || 'Unassigned'}
                    </p>
                    <div className="flex items-center gap-2 text-sm mt-1">
                      <Clock className="w-3 h-3" />
                      <span>{task.scheduledTime}</span>
                      <span className="text-gray-500">({task.estimatedDuration} min)</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span>{t('tools.housekeeping.checklistProgress', 'Checklist Progress')}</span>
                      <span>{getCompletionPercentage(task)}%</span>
                    </div>
                    <div className={`h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <div
                        className="h-full rounded-full bg-teal-500 transition-all"
                        style={{ width: `${getCompletionPercentage(task)}%` }}
                      />
                    </div>
                  </div>

                  {task.notes && (
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} mb-3`}>
                      {task.notes}
                    </p>
                  )}

                  {task.issues.length > 0 && (
                    <div className="mb-3">
                      {task.issues.map((issue, idx) => (
                        <span key={idx} className="inline-block px-2 py-1 text-xs bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 rounded mr-1 mb-1">
                          {issue}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2 pt-3 border-t">
                    {task.status === 'pending' && (
                      <button
                        onClick={() => handleStartTask(task)}
                        className="flex-1 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                      >
                        {t('tools.housekeeping.start', 'Start')}
                      </button>
                    )}
                    {task.status === 'in-progress' && (
                      <button
                        onClick={() => handleCompleteTask(task)}
                        className="flex-1 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                      >
                        {t('tools.housekeeping.complete', 'Complete')}
                      </button>
                    )}
                    <button
                      onClick={() => setEditingTask(task)}
                      className={`p-2 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-2 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={`rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow overflow-hidden`}>
            <table className="w-full">
              <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase">{t('tools.housekeeping.room', 'Room')}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase">{t('tools.housekeeping.task', 'Task')}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase">{t('tools.housekeeping.assigned', 'Assigned')}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase">{t('tools.housekeeping.time', 'Time')}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase">{t('tools.housekeeping.status', 'Status')}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase">{t('tools.housekeeping.progress', 'Progress')}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase">{t('tools.housekeeping.actions', 'Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredTasks.map(task => (
                  <tr key={task.id} className={isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                    <td className="px-4 py-4">
                      <div className="font-medium">Room {task.roomNumber}</div>
                      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Floor {task.floor}</div>
                    </td>
                    <td className="px-4 py-4">{TASK_TYPES.find(t => t.value === task.taskType)?.label}</td>
                    <td className="px-4 py-4">{task.assignedTo || 'Unassigned'}</td>
                    <td className="px-4 py-4">{task.scheduledTime}</td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                        {TASK_STATUSES.find(s => s.value === task.status)?.label}
                      </span>
                    </td>
                    <td className="px-4 py-4">{getCompletionPercentage(task)}%</td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingTask(task)}
                          className={`p-1 rounded ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filteredTasks.length === 0 && (
          <div className={`text-center py-12 ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow`}>
            <SprayCan className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.housekeeping.noTasksFound', 'No tasks found')}</p>
          </div>
        )}

        {/* Add/Edit Task Modal */}
        {(showForm || editingTask) && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} p-6`}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">
                  {editingTask ? t('tools.housekeeping.editTask', 'Edit Task') : t('tools.housekeeping.addTask2', 'Add Task')}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingTask(null);
                    resetNewTask();
                  }}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.housekeeping.roomNumber', 'Room Number *')}</label>
                  <input
                    type="text"
                    value={editingTask?.roomNumber || newTask.roomNumber}
                    onChange={(e) => editingTask
                      ? setEditingTask({...editingTask, roomNumber: e.target.value})
                      : setNewTask({...newTask, roomNumber: e.target.value})
                    }
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.housekeeping.floor', 'Floor')}</label>
                  <input
                    type="number"
                    min="1"
                    value={editingTask?.floor || newTask.floor}
                    onChange={(e) => editingTask
                      ? setEditingTask({...editingTask, floor: parseInt(e.target.value)})
                      : setNewTask({...newTask, floor: parseInt(e.target.value)})
                    }
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.housekeeping.roomType', 'Room Type')}</label>
                  <select
                    value={editingTask?.roomType || newTask.roomType}
                    onChange={(e) => editingTask
                      ? setEditingTask({...editingTask, roomType: e.target.value as RoomType})
                      : setNewTask({...newTask, roomType: e.target.value as RoomType})
                    }
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    {ROOM_TYPES.map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.housekeeping.taskType', 'Task Type')}</label>
                  <select
                    value={editingTask?.taskType || newTask.taskType}
                    onChange={(e) => editingTask
                      ? setEditingTask({...editingTask, taskType: e.target.value as TaskType})
                      : setNewTask({...newTask, taskType: e.target.value as TaskType})
                    }
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    {TASK_TYPES.map(t => (
                      <option key={t.value} value={t.value}>{t.label} ({t.duration} min)</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.housekeeping.priority', 'Priority')}</label>
                  <select
                    value={editingTask?.priority || newTask.priority}
                    onChange={(e) => editingTask
                      ? setEditingTask({...editingTask, priority: e.target.value as Priority})
                      : setNewTask({...newTask, priority: e.target.value as Priority})
                    }
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    {PRIORITIES.map(p => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.housekeeping.assignedTo', 'Assigned To')}</label>
                  <input
                    type="text"
                    value={editingTask?.assignedTo || newTask.assignedTo}
                    onChange={(e) => editingTask
                      ? setEditingTask({...editingTask, assignedTo: e.target.value})
                      : setNewTask({...newTask, assignedTo: e.target.value})
                    }
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.housekeeping.scheduledDate', 'Scheduled Date')}</label>
                  <input
                    type="date"
                    value={editingTask?.scheduledDate || newTask.scheduledDate}
                    onChange={(e) => editingTask
                      ? setEditingTask({...editingTask, scheduledDate: e.target.value})
                      : setNewTask({...newTask, scheduledDate: e.target.value})
                    }
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.housekeeping.scheduledTime', 'Scheduled Time')}</label>
                  <input
                    type="time"
                    value={editingTask?.scheduledTime || newTask.scheduledTime}
                    onChange={(e) => editingTask
                      ? setEditingTask({...editingTask, scheduledTime: e.target.value})
                      : setNewTask({...newTask, scheduledTime: e.target.value})
                    }
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">{t('tools.housekeeping.notes', 'Notes')}</label>
                  <textarea
                    rows={3}
                    value={editingTask?.notes || newTask.notes}
                    onChange={(e) => editingTask
                      ? setEditingTask({...editingTask, notes: e.target.value})
                      : setNewTask({...newTask, notes: e.target.value})
                    }
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                {/* Checklist for editing */}
                {editingTask && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">{t('tools.housekeeping.checklist', 'Checklist')}</label>
                    <div className={`p-4 rounded-lg border ${isDark ? 'border-gray-600' : 'border-gray-300'} max-h-48 overflow-y-auto`}>
                      {editingTask.checklistItems.map(item => (
                        <label key={item.id} className="flex items-center gap-2 py-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={item.completed}
                            onChange={() => handleToggleChecklistItem(editingTask, item.id)}
                            className="w-4 h-4 rounded"
                          />
                          <span className={item.completed ? 'line-through text-gray-500' : ''}>{item.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingTask(null);
                    resetNewTask();
                  }}
                  className={`px-4 py-2 rounded-lg ${
                    isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  {t('tools.housekeeping.cancel', 'Cancel')}
                </button>
                <button
                  onClick={editingTask ? handleUpdateTask : handleAddTask}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {editingTask ? t('tools.housekeeping.update', 'Update') : t('tools.housekeeping.create', 'Create')} Task
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HousekeepingTool;
