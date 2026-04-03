'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ListOrdered,
  Plus,
  Trash2,
  Search,
  Clock,
  CheckCircle,
  AlertCircle,
  Play,
  Pause,
  ArrowUp,
  ArrowDown,
  Filter,
  Calendar,
  User,
  Printer,
  Settings,
  RotateCcw,
  X,
  Sparkles,
  Eye,
  Edit2,
  MoveVertical,
  Timer,
  Zap,
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

interface ProductionQueueToolProps {
  uiConfig?: UIConfig;
}

// Types
type QueueStatus = 'queued' | 'setup' | 'printing' | 'finishing' | 'quality_check' | 'completed' | 'on_hold' | 'cancelled';
type WorkstationType = 'large_format' | 'small_format' | 'cutting' | 'finishing' | 'lamination' | 'assembly';
type Priority = 'low' | 'normal' | 'high' | 'rush';

interface ProductionItem {
  id: string;
  jobNumber: string;
  orderNumber: string;
  customerName: string;
  productName: string;
  description: string;
  workstation: WorkstationType;
  priority: Priority;
  status: QueueStatus;
  quantity: number;
  estimatedTime: number; // minutes
  actualTime: number; // minutes
  assignedTo: string;
  dueDate: string;
  position: number;
  notes: string;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Workstation {
  type: WorkstationType;
  name: string;
  icon: string;
  currentJob: string | null;
  status: 'idle' | 'running' | 'maintenance';
}

// Constants
const WORKSTATIONS: { type: WorkstationType; name: string }[] = [
  { type: 'large_format', name: 'Large Format Printer' },
  { type: 'small_format', name: 'Small Format Printer' },
  { type: 'cutting', name: 'Cutting Station' },
  { type: 'finishing', name: 'Finishing Station' },
  { type: 'lamination', name: 'Lamination' },
  { type: 'assembly', name: 'Assembly' },
];

const QUEUE_STATUSES: { status: QueueStatus; label: string; color: string }[] = [
  { status: 'queued', label: 'Queued', color: 'bg-gray-500' },
  { status: 'setup', label: 'Setup', color: 'bg-yellow-500' },
  { status: 'printing', label: 'Printing', color: 'bg-blue-500' },
  { status: 'finishing', label: 'Finishing', color: 'bg-purple-500' },
  { status: 'quality_check', label: 'Quality Check', color: 'bg-cyan-500' },
  { status: 'completed', label: 'Completed', color: 'bg-green-500' },
  { status: 'on_hold', label: 'On Hold', color: 'bg-orange-500' },
  { status: 'cancelled', label: 'Cancelled', color: 'bg-red-500' },
];

const PRIORITIES: { priority: Priority; label: string; color: string }[] = [
  { priority: 'low', label: 'Low', color: 'bg-gray-400' },
  { priority: 'normal', label: 'Normal', color: 'bg-blue-400' },
  { priority: 'high', label: 'High', color: 'bg-orange-400' },
  { priority: 'rush', label: 'Rush', color: 'bg-red-500' },
];

// Column configuration for exports
const QUEUE_COLUMNS: ColumnConfig[] = [
  { key: 'position', header: '#', type: 'number' },
  { key: 'jobNumber', header: 'Job #', type: 'string' },
  { key: 'customerName', header: 'Customer', type: 'string' },
  { key: 'productName', header: 'Product', type: 'string' },
  { key: 'workstation', header: 'Workstation', type: 'string' },
  { key: 'priority', header: 'Priority', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'quantity', header: 'Qty', type: 'number' },
  { key: 'estimatedTime', header: 'Est. Time (min)', type: 'number' },
  { key: 'dueDate', header: 'Due Date', type: 'date' },
  { key: 'assignedTo', header: 'Assigned To', type: 'string' },
];

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);

const formatTime = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  return `${hours}h ${mins}m`;
};

const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

const formatDateTime = (dateString: string) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Main Component
export const ProductionQueueTool: React.FC<ProductionQueueToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // useToolData hook for backend sync
  const {
    data: queue,
    addItem: addItemToBackend,
    updateItem: updateItemBackend,
    deleteItem: deleteItemBackend,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<ProductionItem>('production-queue', [], QUEUE_COLUMNS);

  // Local UI State
  const [activeView, setActiveView] = useState<'list' | 'kanban' | 'schedule'>('list');
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItem, setEditingItem] = useState<ProductionItem | null>(null);
  const [selectedItem, setSelectedItem] = useState<ProductionItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterWorkstation, setFilterWorkstation] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  // New item form state
  const [newItem, setNewItem] = useState<Partial<ProductionItem>>({
    jobNumber: '',
    orderNumber: '',
    customerName: '',
    productName: '',
    description: '',
    workstation: 'large_format',
    priority: 'normal',
    quantity: 1,
    estimatedTime: 30,
    dueDate: '',
    assignedTo: '',
    notes: '',
  });

  // Handle prefill from uiConfig
  React.useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params;
      if (params.jobNumber || params.customerName || params.productName) {
        setNewItem({
          ...newItem,
          jobNumber: params.jobNumber || '',
          customerName: params.customerName || '',
          productName: params.productName || '',
          workstation: params.workstation || 'large_format',
          quantity: params.quantity || 1,
        });
        setShowItemForm(true);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Add new item to queue
  const addItem = () => {
    if (!newItem.productName) {
      setValidationMessage('Please enter a product name');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const maxPosition = queue.length > 0 ? Math.max(...queue.map((q) => q.position)) : 0;

    const item: ProductionItem = {
      id: generateId(),
      jobNumber: newItem.jobNumber || `JOB-${Date.now().toString().slice(-6)}`,
      orderNumber: newItem.orderNumber || '',
      customerName: newItem.customerName || '',
      productName: newItem.productName || '',
      description: newItem.description || '',
      workstation: newItem.workstation || 'large_format',
      priority: newItem.priority || 'normal',
      status: 'queued',
      quantity: newItem.quantity || 1,
      estimatedTime: newItem.estimatedTime || 30,
      actualTime: 0,
      assignedTo: newItem.assignedTo || '',
      dueDate: newItem.dueDate || '',
      position: maxPosition + 1,
      notes: newItem.notes || '',
      startedAt: null,
      completedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addItemToBackend(item);
    resetForm();
  };

  // Update item
  const updateItem = () => {
    if (!editingItem) return;

    const updatedItem: ProductionItem = {
      ...editingItem,
      ...newItem,
      updatedAt: new Date().toISOString(),
    } as ProductionItem;

    updateItemBackend(editingItem.id, updatedItem);
    resetForm();
  };

  // Delete item
  const deleteItem = async (itemId: string) => {
    const confirmed = await confirm({
      title: 'Confirm Action',
      message: 'Are you sure you want to remove this item from the queue?',
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (!confirmed) return;
    deleteItemBackend(itemId);
    if (selectedItem?.id === itemId) {
      setSelectedItem(null);
    }
  };

  // Update item status
  const updateStatus = (itemId: string, status: QueueStatus) => {
    const updates: Partial<ProductionItem> = {
      status,
      updatedAt: new Date().toISOString(),
    };

    if (status === 'printing' || status === 'setup') {
      updates.startedAt = new Date().toISOString();
    }
    if (status === 'completed') {
      updates.completedAt = new Date().toISOString();
    }

    updateItemBackend(itemId, updates);
  };

  // Move item in queue
  const moveItem = (itemId: string, direction: 'up' | 'down') => {
    const sortedQueue = [...queue].sort((a, b) => a.position - b.position);
    const currentIndex = sortedQueue.findIndex((item) => item.id === itemId);

    if (direction === 'up' && currentIndex > 0) {
      const prevItem = sortedQueue[currentIndex - 1];
      const currentItem = sortedQueue[currentIndex];
      updateItemBackend(currentItem.id, { position: prevItem.position });
      updateItemBackend(prevItem.id, { position: currentItem.position });
    } else if (direction === 'down' && currentIndex < sortedQueue.length - 1) {
      const nextItem = sortedQueue[currentIndex + 1];
      const currentItem = sortedQueue[currentIndex];
      updateItemBackend(currentItem.id, { position: nextItem.position });
      updateItemBackend(nextItem.id, { position: currentItem.position });
    }
  };

  // Reset form
  const resetForm = () => {
    setNewItem({
      jobNumber: '',
      orderNumber: '',
      customerName: '',
      productName: '',
      description: '',
      workstation: 'large_format',
      priority: 'normal',
      quantity: 1,
      estimatedTime: 30,
      dueDate: '',
      assignedTo: '',
      notes: '',
    });
    setShowItemForm(false);
    setEditingItem(null);
  };

  // Start editing
  const startEdit = (item: ProductionItem) => {
    setEditingItem(item);
    setNewItem({ ...item });
    setShowItemForm(true);
  };

  // Filtered and sorted queue
  const filteredQueue = useMemo(() => {
    return queue
      .filter((item) => {
        const matchesSearch =
          searchTerm === '' ||
          item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.jobNumber.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesWorkstation = filterWorkstation === 'all' || item.workstation === filterWorkstation;
        const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
        const matchesPriority = filterPriority === 'all' || item.priority === filterPriority;
        return matchesSearch && matchesWorkstation && matchesStatus && matchesPriority;
      })
      .sort((a, b) => {
        // Priority order: rush > high > normal > low
        const priorityOrder = { rush: 0, high: 1, normal: 2, low: 3 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return a.position - b.position;
      });
  }, [queue, searchTerm, filterWorkstation, filterStatus, filterPriority]);

  // Analytics
  const analytics = useMemo(() => {
    const activeItems = queue.filter((q) => !['completed', 'cancelled'].includes(q.status));
    const inProgress = queue.filter((q) => ['setup', 'printing', 'finishing'].includes(q.status)).length;
    const queued = queue.filter((q) => q.status === 'queued').length;
    const completedToday = queue.filter((q) => {
      if (!q.completedAt) return false;
      const completed = new Date(q.completedAt);
      const today = new Date();
      return completed.toDateString() === today.toDateString();
    }).length;
    const totalEstimatedTime = activeItems.reduce((sum, q) => sum + q.estimatedTime, 0);
    const rushJobs = activeItems.filter((q) => q.priority === 'rush').length;

    return { activeItems: activeItems.length, inProgress, queued, completedToday, totalEstimatedTime, rushJobs };
  }, [queue]);

  // Group by workstation for kanban view
  const queueByWorkstation = useMemo(() => {
    const grouped: Record<WorkstationType, ProductionItem[]> = {
      large_format: [],
      small_format: [],
      cutting: [],
      finishing: [],
      lamination: [],
      assembly: [],
    };

    filteredQueue.forEach((item) => {
      if (grouped[item.workstation]) {
        grouped[item.workstation].push(item);
      }
    });

    return grouped;
  }, [filteredQueue]);

  const getStatusBadge = (status: QueueStatus) => {
    const statusInfo = QUEUE_STATUSES.find((s) => s.status === status);
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${statusInfo?.color || 'bg-gray-500'}`}>
        {statusInfo?.label || status}
      </span>
    );
  };

  const getPriorityBadge = (priority: Priority) => {
    const priorityInfo = PRIORITIES.find((p) => p.priority === priority);
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${priorityInfo?.color || 'bg-gray-400'}`}>
        {priorityInfo?.label || priority}
      </span>
    );
  };

  return (
    <>
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.productionQueue.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <ListOrdered className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.productionQueue.productionQueue', 'Production Queue')}
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.productionQueue.manageProductionWorkflowAndJob', 'Manage production workflow and job scheduling')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="production-queue" toolName="Production Queue" />

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
                onExportCSV={() => exportToCSV(queue, QUEUE_COLUMNS, { filename: 'production-queue' })}
                onExportExcel={() => exportToExcel(queue, QUEUE_COLUMNS, { filename: 'production-queue' })}
                onExportJSON={() => exportToJSON(queue, { filename: 'production-queue' })}
                onExportPDF={async () => {
                  await exportToPDF(queue, QUEUE_COLUMNS, {
                    filename: 'production-queue',
                    title: 'Production Queue',
                    subtitle: `${analytics.activeItems} active items`,
                  });
                }}
                onPrint={() => printData(queue, QUEUE_COLUMNS, { title: 'Production Queue' })}
                onCopyToClipboard={async () => await copyUtil(queue, QUEUE_COLUMNS, 'tab')}
                showImport={false}
                theme={theme}
              />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-4">
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.productionQueue.inQueue', 'In Queue')}</p>
              <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{analytics.queued}</p>
            </div>
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.productionQueue.inProgress', 'In Progress')}</p>
              <p className={`text-xl font-bold text-blue-500`}>{analytics.inProgress}</p>
            </div>
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.productionQueue.completedToday', 'Completed Today')}</p>
              <p className={`text-xl font-bold text-green-500`}>{analytics.completedToday}</p>
            </div>
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.productionQueue.rushJobs', 'Rush Jobs')}</p>
              <p className={`text-xl font-bold text-red-500`}>{analytics.rushJobs}</p>
            </div>
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.productionQueue.estTimeLeft', 'Est. Time Left')}</p>
              <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{formatTime(analytics.totalEstimatedTime)}</p>
            </div>
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.productionQueue.activeItems', 'Active Items')}</p>
              <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{analytics.activeItems}</p>
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'list', label: 'List View', icon: <ListOrdered className="w-4 h-4" /> },
              { id: 'kanban', label: 'Kanban', icon: <Settings className="w-4 h-4" /> },
            ].map((view) => (
              <button
                key={view.id}
                onClick={() => setActiveView(view.id as typeof activeView)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeView === view.id
                    ? 'bg-[#0D9488] text-white'
                    : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {view.icon}
                {view.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filters & Actions */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4 mb-6`}>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type="text"
                  placeholder={t('tools.productionQueue.searchQueue', 'Search queue...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
                />
              </div>
            </div>
            <select
              value={filterWorkstation}
              onChange={(e) => setFilterWorkstation(e.target.value)}
              className={`px-4 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">{t('tools.productionQueue.allWorkstations', 'All Workstations')}</option>
              {WORKSTATIONS.map((w) => (
                <option key={w.type} value={w.type}>{w.name}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`px-4 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">{t('tools.productionQueue.allStatuses', 'All Statuses')}</option>
              {QUEUE_STATUSES.map((s) => (
                <option key={s.status} value={s.status}>{s.label}</option>
              ))}
            </select>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className={`px-4 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">{t('tools.productionQueue.allPriorities', 'All Priorities')}</option>
              {PRIORITIES.map((p) => (
                <option key={p.priority} value={p.priority}>{p.label}</option>
              ))}
            </select>
            <button
              onClick={() => setShowItemForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t('tools.productionQueue.addToQueue', 'Add to Queue')}
            </button>
          </div>
        </div>

        {/* List View */}
        {activeView === 'list' && (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg overflow-hidden`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`border-b ${theme === 'dark' ? 'border-gray-700 bg-gray-700/50' : 'border-gray-200 bg-gray-50'}`}>
                    <th className={`text-left py-3 px-4 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>#</th>
                    <th className={`text-left py-3 px-4 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.productionQueue.job', 'Job')}</th>
                    <th className={`text-left py-3 px-4 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.productionQueue.customer', 'Customer')}</th>
                    <th className={`text-left py-3 px-4 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.productionQueue.product', 'Product')}</th>
                    <th className={`text-left py-3 px-4 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.productionQueue.workstation', 'Workstation')}</th>
                    <th className={`text-left py-3 px-4 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.productionQueue.priority', 'Priority')}</th>
                    <th className={`text-left py-3 px-4 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.productionQueue.status', 'Status')}</th>
                    <th className={`text-left py-3 px-4 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.productionQueue.time', 'Time')}</th>
                    <th className={`text-left py-3 px-4 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.productionQueue.due', 'Due')}</th>
                    <th className={`text-left py-3 px-4 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.productionQueue.actions', 'Actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQueue.map((item, index) => (
                    <tr
                      key={item.id}
                      className={`border-b ${theme === 'dark' ? 'border-gray-700 hover:bg-gray-700/50' : 'border-gray-200 hover:bg-gray-50'} ${
                        item.priority === 'rush' ? (theme === 'dark' ? 'bg-red-900/10' : 'bg-red-50') : ''
                      }`}
                    >
                      <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        <div className="flex items-center gap-1">
                          <span>{index + 1}</span>
                          <div className="flex flex-col">
                            <button
                              onClick={() => moveItem(item.id, 'up')}
                              className={`p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${index === 0 ? 'opacity-30' : ''}`}
                              disabled={index === 0}
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => moveItem(item.id, 'down')}
                              className={`p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${index === filteredQueue.length - 1 ? 'opacity-30' : ''}`}
                              disabled={index === filteredQueue.length - 1}
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className={`py-3 px-4 font-mono text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {item.jobNumber}
                      </td>
                      <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        {item.customerName || '-'}
                      </td>
                      <td className={`py-3 px-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {item.productName}
                        <span className={`ml-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          x{item.quantity}
                        </span>
                      </td>
                      <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        {WORKSTATIONS.find((w) => w.type === item.workstation)?.name}
                      </td>
                      <td className="py-3 px-4">{getPriorityBadge(item.priority)}</td>
                      <td className="py-3 px-4">{getStatusBadge(item.status)}</td>
                      <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        <div className="flex items-center gap-1">
                          <Timer className="w-4 h-4" />
                          {formatTime(item.estimatedTime)}
                        </div>
                      </td>
                      <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        {formatDate(item.dueDate)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          {item.status === 'queued' && (
                            <button
                              onClick={() => updateStatus(item.id, 'setup')}
                              className="p-1.5 rounded bg-blue-500 text-white hover:bg-blue-600"
                              title={t('tools.productionQueue.start', 'Start')}
                            >
                              <Play className="w-3 h-3" />
                            </button>
                          )}
                          {item.status === 'printing' && (
                            <button
                              onClick={() => updateStatus(item.id, 'on_hold')}
                              className="p-1.5 rounded bg-orange-500 text-white hover:bg-orange-600"
                              title={t('tools.productionQueue.pause', 'Pause')}
                            >
                              <Pause className="w-3 h-3" />
                            </button>
                          )}
                          <button
                            onClick={() => startEdit(item)}
                            className={`p-1.5 rounded ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}
                            title={t('tools.productionQueue.edit', 'Edit')}
                          >
                            <Edit2 className="w-4 h-4 text-[#0D9488]" />
                          </button>
                          <button
                            onClick={() => deleteItem(item.id)}
                            className={`p-1.5 rounded ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}
                            title={t('tools.productionQueue.remove', 'Remove')}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredQueue.length === 0 && (
                <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  <ListOrdered className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{t('tools.productionQueue.noItemsInQueue', 'No items in queue')}</p>
                  <button
                    onClick={() => setShowItemForm(true)}
                    className="mt-4 text-[#0D9488] hover:underline"
                  >
                    {t('tools.productionQueue.addYourFirstItem', 'Add your first item')}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Kanban View */}
        {activeView === 'kanban' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {WORKSTATIONS.map((workstation) => (
              <div
                key={workstation.type}
                className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {workstation.name}
                  </h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                    {queueByWorkstation[workstation.type].length}
                  </span>
                </div>

                <div className="space-y-3">
                  {queueByWorkstation[workstation.type].map((item) => (
                    <div
                      key={item.id}
                      className={`p-3 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'
                      } ${item.priority === 'rush' ? 'border-l-4 border-l-red-500' : ''}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className={`font-mono text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {item.jobNumber}
                        </span>
                        {getPriorityBadge(item.priority)}
                      </div>
                      <p className={`font-medium text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {item.productName}
                      </p>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {item.customerName || 'No customer'}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        {getStatusBadge(item.status)}
                        <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {formatTime(item.estimatedTime)}
                        </span>
                      </div>
                    </div>
                  ))}
                  {queueByWorkstation[workstation.type].length === 0 && (
                    <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                      <p className="text-sm">{t('tools.productionQueue.noItems', 'No items')}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Item Modal */}
        {showItemForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto`}>
              <div className={`sticky top-0 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {editingItem ? t('tools.productionQueue.editQueueItem', 'Edit Queue Item') : t('tools.productionQueue.addToQueue2', 'Add to Queue')}
                  </h2>
                  <button onClick={resetForm} className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder={t('tools.productionQueue.jobNumber', 'Job Number')}
                    value={newItem.jobNumber}
                    onChange={(e) => setNewItem({ ...newItem, jobNumber: e.target.value })}
                    className={`px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                  <input
                    type="text"
                    placeholder={t('tools.productionQueue.orderNumber', 'Order Number')}
                    value={newItem.orderNumber}
                    onChange={(e) => setNewItem({ ...newItem, orderNumber: e.target.value })}
                    className={`px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>
                <input
                  type="text"
                  placeholder={t('tools.productionQueue.customerName', 'Customer Name')}
                  value={newItem.customerName}
                  onChange={(e) => setNewItem({ ...newItem, customerName: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
                <input
                  type="text"
                  placeholder={t('tools.productionQueue.productName', 'Product Name *')}
                  value={newItem.productName}
                  onChange={(e) => setNewItem({ ...newItem, productName: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
                <div className="grid grid-cols-2 gap-4">
                  <select
                    value={newItem.workstation}
                    onChange={(e) => setNewItem({ ...newItem, workstation: e.target.value as WorkstationType })}
                    className={`px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    {WORKSTATIONS.map((w) => (
                      <option key={w.type} value={w.type}>{w.name}</option>
                    ))}
                  </select>
                  <select
                    value={newItem.priority}
                    onChange={(e) => setNewItem({ ...newItem, priority: e.target.value as Priority })}
                    className={`px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p.priority} value={p.priority}>{p.label}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.productionQueue.quantity', 'Quantity')}</label>
                    <input
                      type="number"
                      value={newItem.quantity}
                      onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.productionQueue.estTimeMinutes', 'Est. Time (minutes)')}</label>
                    <input
                      type="number"
                      value={newItem.estimatedTime}
                      onChange={(e) => setNewItem({ ...newItem, estimatedTime: parseInt(e.target.value) || 30 })}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.productionQueue.dueDate', 'Due Date')}</label>
                    <input
                      type="date"
                      value={newItem.dueDate}
                      onChange={(e) => setNewItem({ ...newItem, dueDate: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.productionQueue.assignedTo', 'Assigned To')}</label>
                    <input
                      type="text"
                      placeholder={t('tools.productionQueue.staffName', 'Staff name')}
                      value={newItem.assignedTo}
                      onChange={(e) => setNewItem({ ...newItem, assignedTo: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                    />
                  </div>
                </div>
                <textarea
                  placeholder={t('tools.productionQueue.notes', 'Notes')}
                  value={newItem.notes}
                  onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                  rows={2}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>

              <div className={`sticky bottom-0 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-6 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={resetForm}
                    className={`px-4 py-2 rounded-lg ${
                      theme === 'dark'
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {t('tools.productionQueue.cancel', 'Cancel')}
                  </button>
                  <button
                    onClick={editingItem ? updateItem : addItem}
                    className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90"
                  >
                    {editingItem ? t('tools.productionQueue.update', 'Update') : t('tools.productionQueue.addToQueue3', 'Add to Queue')}
                  </button>
                </div>
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

export default ProductionQueueTool;
