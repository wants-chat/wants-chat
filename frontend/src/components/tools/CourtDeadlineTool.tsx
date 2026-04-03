'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  Calendar,
  Clock,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Plus,
  Trash2,
  Search,
  Filter,
  Edit2,
  Save,
  X,
  Bell,
  Briefcase,
  FileText,
  User,
  Gavel,
  ChevronDown,
  ChevronUp,
  CalendarDays,
  Timer,
  Flag,
  Scale,
} from 'lucide-react';
import { UIConfig } from '../ContextualUI';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import useToolData from '../../hooks/useToolData';
import { type ColumnConfig } from '../../lib/toolDataUtils';

interface CourtDeadlineToolProps {
  uiConfig?: UIConfig;
}

// Types
type DeadlineStatus = 'pending' | 'in-progress' | 'completed' | 'missed' | 'extended';
type DeadlineType = 'filing' | 'response' | 'discovery' | 'motion' | 'hearing' | 'trial' | 'appeal' | 'settlement' | 'mediation' | 'deposition' | 'other';
type Priority = 'low' | 'medium' | 'high' | 'critical';
type ReminderFrequency = 'none' | 'day-before' | '3-days' | 'week' | 'custom';

interface CourtDeadline {
  id: string;
  // Case Info
  caseNumber: string;
  caseName: string;
  clientName: string;
  courtName: string;
  // Deadline Details
  deadlineType: DeadlineType;
  title: string;
  description: string;
  dueDate: string;
  dueTime?: string;
  // Status & Priority
  status: DeadlineStatus;
  priority: Priority;
  // Assignment
  assignedTo: string;
  assignedBy: string;
  // Rules/Calculation
  calculatedFrom?: string; // e.g., "filing date"
  daysFromEvent?: number;
  courtRule?: string; // e.g., "FRCP 12(a)(1)(A)"
  // Extensions
  originalDueDate?: string;
  extensionReason?: string;
  extensionGrantedBy?: string;
  // Completion
  completedDate?: string;
  completedBy?: string;
  completionNotes?: string;
  // Reminders
  reminderFrequency: ReminderFrequency;
  customReminderDays?: number;
  remindersSent: number;
  lastReminderDate?: string;
  // Notes
  notes: string;
  // Metadata
  createdAt: string;
  updatedAt: string;
}

// Constants
const STATUS_OPTIONS: { value: DeadlineStatus; label: string; color: string }[] = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
  { value: 'in-progress', label: 'In Progress', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  { value: 'missed', label: 'Missed', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
  { value: 'extended', label: 'Extended', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
];

const DEADLINE_TYPE_OPTIONS: { value: DeadlineType; label: string }[] = [
  { value: 'filing', label: 'Court Filing' },
  { value: 'response', label: 'Response Due' },
  { value: 'discovery', label: 'Discovery Deadline' },
  { value: 'motion', label: 'Motion Deadline' },
  { value: 'hearing', label: 'Hearing Date' },
  { value: 'trial', label: 'Trial Date' },
  { value: 'appeal', label: 'Appeal Deadline' },
  { value: 'settlement', label: 'Settlement Conference' },
  { value: 'mediation', label: 'Mediation Date' },
  { value: 'deposition', label: 'Deposition' },
  { value: 'other', label: 'Other' },
];

const PRIORITY_OPTIONS: { value: Priority; label: string; color: string; bgColor: string }[] = [
  { value: 'low', label: 'Low', color: 'text-gray-500', bgColor: 'bg-gray-100 dark:bg-gray-700' },
  { value: 'medium', label: 'Medium', color: 'text-blue-500', bgColor: 'bg-blue-100 dark:bg-blue-900' },
  { value: 'high', label: 'High', color: 'text-orange-500', bgColor: 'bg-orange-100 dark:bg-orange-900' },
  { value: 'critical', label: 'Critical', color: 'text-red-500', bgColor: 'bg-red-100 dark:bg-red-900' },
];

const REMINDER_OPTIONS: { value: ReminderFrequency; label: string }[] = [
  { value: 'none', label: 'No Reminder' },
  { value: 'day-before', label: '1 Day Before' },
  { value: '3-days', label: '3 Days Before' },
  { value: 'week', label: '1 Week Before' },
  { value: 'custom', label: 'Custom' },
];

// Column configuration for exports
const DEADLINE_COLUMNS: ColumnConfig[] = [
  { key: 'dueDate', header: 'Due Date', type: 'date' },
  { key: 'caseNumber', header: 'Case #', type: 'string' },
  { key: 'caseName', header: 'Case Name', type: 'string' },
  { key: 'title', header: 'Deadline', type: 'string' },
  { key: 'deadlineType', header: 'Type', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'priority', header: 'Priority', type: 'string' },
  { key: 'assignedTo', header: 'Assigned To', type: 'string' },
  { key: 'courtName', header: 'Court', type: 'string' },
  { key: 'courtRule', header: 'Court Rule', type: 'string' },
];

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);

const formatDate = (dateString?: string) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatDateTime = (dateString: string, timeString?: string) => {
  const date = formatDate(dateString);
  if (!timeString) return date;
  return `${date} at ${timeString}`;
};

const getDaysUntil = (dateString: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(dateString);
  dueDate.setHours(0, 0, 0, 0);
  const diffTime = dueDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const getUrgencyLabel = (daysUntil: number) => {
  if (daysUntil < 0) return { label: 'Overdue', color: 'text-red-600 bg-red-100 dark:bg-red-900' };
  if (daysUntil === 0) return { label: 'Due Today', color: 'text-red-600 bg-red-100 dark:bg-red-900' };
  if (daysUntil === 1) return { label: 'Due Tomorrow', color: 'text-orange-600 bg-orange-100 dark:bg-orange-900' };
  if (daysUntil <= 3) return { label: `${daysUntil} days`, color: 'text-orange-600 bg-orange-100 dark:bg-orange-900' };
  if (daysUntil <= 7) return { label: `${daysUntil} days`, color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900' };
  return { label: `${daysUntil} days`, color: 'text-green-600 bg-green-100 dark:bg-green-900' };
};

// Main Component
export const CourtDeadlineTool: React.FC<CourtDeadlineToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // useToolData hook for backend sync
  const {
    data: deadlines,
    addItem: addDeadline,
    updateItem: updateDeadline,
    deleteItem: deleteDeadline,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    importCSV,
    importJSON,
    copyToClipboard,
    print,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<CourtDeadline>('court-deadlines', [], DEADLINE_COLUMNS);

  // Local UI state
  const [activeTab, setActiveTab] = useState<'upcoming' | 'all' | 'new' | 'calendar'>('upcoming');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<DeadlineStatus | 'all'>('all');
  const [filterType, setFilterType] = useState<DeadlineType | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<Priority | 'all'>('all');
  const [expandedDeadlineId, setExpandedDeadlineId] = useState<string | null>(null);
  const [editingDeadline, setEditingDeadline] = useState<CourtDeadline | null>(null);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as Record<string, any>;
      let hasChanges = false;

      // If editing from gallery, restore saved state
      if (params.isEditFromGallery) {
        setIsEditFromGallery(true);
        hasChanges = true;
        // Data is managed by useToolData hook automatically
      }

      if (params.deadlineType && DEADLINE_TYPE_OPTIONS.find(dt => dt.value === params.deadlineType)) {
        setFilterType(params.deadlineType);
        hasChanges = true;
      }
      if (params.status && STATUS_OPTIONS.find(s => s.value === params.status)) {
        setFilterStatus(params.status);
        hasChanges = true;
      }
      if (params.priority && PRIORITY_OPTIONS.find(p => p.value === params.priority)) {
        setFilterPriority(params.priority);
        hasChanges = true;
      }

      if (hasChanges) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // New deadline form state
  const [newDeadline, setNewDeadline] = useState<Partial<CourtDeadline>>({
    caseNumber: '',
    caseName: '',
    clientName: '',
    courtName: '',
    deadlineType: 'filing',
    title: '',
    description: '',
    dueDate: '',
    dueTime: '',
    status: 'pending',
    priority: 'medium',
    assignedTo: '',
    assignedBy: '',
    courtRule: '',
    reminderFrequency: 'week',
    remindersSent: 0,
    notes: '',
  });

  // Prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as any;
      if (params.caseNumber || params.caseName || params.dueDate) {
        setNewDeadline({
          ...newDeadline,
          caseNumber: params.caseNumber || '',
          caseName: params.caseName || '',
          clientName: params.clientName || '',
          courtName: params.courtName || '',
          dueDate: params.dueDate || '',
          title: params.title || '',
          deadlineType: params.deadlineType || 'filing',
        });
        setActiveTab('new');
      }
    }
  }, [uiConfig?.params]);

  // Filter deadlines
  const filteredDeadlines = useMemo(() => {
    let filtered = deadlines.filter(deadline => {
      const matchesSearch =
        deadline.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deadline.caseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deadline.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deadline.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deadline.assignedTo.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || deadline.status === filterStatus;
      const matchesType = filterType === 'all' || deadline.deadlineType === filterType;
      const matchesPriority = filterPriority === 'all' || deadline.priority === filterPriority;
      return matchesSearch && matchesStatus && matchesType && matchesPriority;
    });

    // Sort by due date
    filtered.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

    return filtered;
  }, [deadlines, searchTerm, filterStatus, filterType, filterPriority]);

  // Upcoming deadlines (next 30 days, not completed)
  const upcomingDeadlines = useMemo(() => {
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    return deadlines
      .filter(d => {
        if (['completed', 'missed'].includes(d.status)) return false;
        const dueDate = new Date(d.dueDate);
        return dueDate >= today && dueDate <= thirtyDaysFromNow;
      })
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [deadlines]);

  // Statistics
  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overdue = deadlines.filter(d => {
      if (['completed', 'missed'].includes(d.status)) return false;
      return new Date(d.dueDate) < today;
    }).length;

    const dueThisWeek = deadlines.filter(d => {
      if (['completed', 'missed'].includes(d.status)) return false;
      const dueDate = new Date(d.dueDate);
      const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      return dueDate >= today && dueDate <= weekFromNow;
    }).length;

    const critical = deadlines.filter(d => {
      if (['completed', 'missed'].includes(d.status)) return false;
      return d.priority === 'critical';
    }).length;

    const completed = deadlines.filter(d => d.status === 'completed').length;
    const completionRate = deadlines.length > 0 ? (completed / deadlines.length) * 100 : 0;

    return { overdue, dueThisWeek, critical, completed, completionRate };
  }, [deadlines]);

  // Calendar view data
  const calendarData = useMemo(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: { date: Date; deadlines: CourtDeadline[] }[] = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      const date = new Date(year, month, -startingDayOfWeek + i + 1);
      days.push({ date, deadlines: [] });
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split('T')[0];
      const dayDeadlines = deadlines.filter(d => d.dueDate === dateStr);
      days.push({ date, deadlines: dayDeadlines });
    }
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i);
      days.push({ date, deadlines: [] });
    }

    return { year, month, days };
  }, [deadlines]);

  // Handlers
  const handleCreateDeadline = () => {
    if (!newDeadline.caseNumber || !newDeadline.title || !newDeadline.dueDate) {
      setValidationMessage('Please fill in all required fields');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const deadline: CourtDeadline = {
      id: generateId(),
      caseNumber: newDeadline.caseNumber || '',
      caseName: newDeadline.caseName || '',
      clientName: newDeadline.clientName || '',
      courtName: newDeadline.courtName || '',
      deadlineType: newDeadline.deadlineType || 'filing',
      title: newDeadline.title || '',
      description: newDeadline.description || '',
      dueDate: newDeadline.dueDate || '',
      dueTime: newDeadline.dueTime,
      status: newDeadline.status || 'pending',
      priority: newDeadline.priority || 'medium',
      assignedTo: newDeadline.assignedTo || '',
      assignedBy: newDeadline.assignedBy || '',
      calculatedFrom: newDeadline.calculatedFrom,
      daysFromEvent: newDeadline.daysFromEvent,
      courtRule: newDeadline.courtRule,
      reminderFrequency: newDeadline.reminderFrequency || 'week',
      customReminderDays: newDeadline.customReminderDays,
      remindersSent: 0,
      notes: newDeadline.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addDeadline(deadline);
    setNewDeadline({
      caseNumber: '',
      caseName: '',
      clientName: '',
      courtName: '',
      deadlineType: 'filing',
      title: '',
      description: '',
      dueDate: '',
      dueTime: '',
      status: 'pending',
      priority: 'medium',
      assignedTo: '',
      assignedBy: '',
      courtRule: '',
      reminderFrequency: 'week',
      remindersSent: 0,
      notes: '',
    });
    setActiveTab('upcoming');
  };

  const handleUpdateDeadline = (id: string, updates: Partial<CourtDeadline>) => {
    updateDeadline(id, { ...updates, updatedAt: new Date().toISOString() });
    setEditingDeadline(null);
  };

  const handleCompleteDeadline = (id: string) => {
    updateDeadline(id, {
      status: 'completed',
      completedDate: new Date().toISOString().split('T')[0],
      completedBy: 'Current User',
      updatedAt: new Date().toISOString(),
    });
  };

  const handleDeleteDeadline = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Deadline',
      message: 'Are you sure you want to delete this deadline?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteDeadline(id);
    }
  };

  const getStatusColor = (status: DeadlineStatus) => {
    return STATUS_OPTIONS.find(s => s.value === status)?.color || '';
  };

  const getPriorityColor = (priority: Priority) => {
    return PRIORITY_OPTIONS.find(p => p.value === priority)?.color || '';
  };

  const getPriorityBgColor = (priority: Priority) => {
    return PRIORITY_OPTIONS.find(p => p.value === priority)?.bgColor || '';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
              <Gavel className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t('tools.courtDeadline.courtDeadlineTracker', 'Court Deadline Tracker')}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('tools.courtDeadline.trackAndManageCourtFiling', 'Track and manage court filing deadlines')}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <WidgetEmbedButton toolSlug="court-deadline" toolName="Court Deadline" />

            <SyncStatus
              isSynced={isSynced}
              isSaving={isSaving}
              lastSaved={lastSaved}
              syncError={syncError}
              onForceSync={forceSync}
              theme="light"
            />
            <ExportDropdown
              onExportCSV={exportCSV}
              onExportExcel={exportExcel}
              onExportJSON={exportJSON}
              onExportPDF={exportPDF}
              onPrint={print}
              onCopyToClipboard={copyToClipboard}
              onImportCSV={importCSV}
              onImportJSON={importJSON}
              theme="light"
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className={`rounded-lg p-4 border ${stats.overdue > 0 ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}>
          <div className="flex items-center gap-3">
            <AlertTriangle className={`w-8 h-8 ${stats.overdue > 0 ? 'text-red-500' : 'text-gray-400'}`} />
            <div>
              <p className={`text-2xl font-bold ${stats.overdue > 0 ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>{stats.overdue}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('tools.courtDeadline.overdue', 'Overdue')}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <CalendarDays className="w-8 h-8 text-orange-500" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.dueThisWeek}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('tools.courtDeadline.dueThisWeek', 'Due This Week')}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Flag className="w-8 h-8 text-red-500" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.critical}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('tools.courtDeadline.criticalPriority', 'Critical Priority')}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completed}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('tools.courtDeadline.completed', 'Completed')}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Scale className="w-8 h-8 text-purple-500" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completionRate.toFixed(0)}%</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('tools.courtDeadline.onTimeRate', 'On-Time Rate')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6">
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
          {[
            { id: 'upcoming', label: 'Upcoming', icon: Clock },
            { id: 'all', label: 'All Deadlines', icon: FileText },
            { id: 'calendar', label: 'Calendar', icon: Calendar },
            { id: 'new', label: 'Add Deadline', icon: Plus },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-red-500 text-red-600 dark:text-red-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Upcoming Deadlines */}
        {activeTab === 'upcoming' && (
          <div className="space-y-4">
            {upcomingDeadlines.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
                <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{t('tools.courtDeadline.noUpcomingDeadlines', 'No upcoming deadlines')}</h3>
                <p className="text-gray-500 dark:text-gray-400">{t('tools.courtDeadline.allCaughtUpNoDeadlines', 'All caught up! No deadlines in the next 30 days.')}</p>
              </div>
            ) : (
              upcomingDeadlines.map(deadline => {
                const daysUntil = getDaysUntil(deadline.dueDate);
                const urgency = getUrgencyLabel(daysUntil);

                return (
                  <div
                    key={deadline.id}
                    className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 ${
                      daysUntil <= 0 ? 'border-l-4 border-l-red-500' :
                      daysUntil <= 3 ? 'border-l-4 border-l-orange-500' :
                      daysUntil <= 7 ? 'border-l-4 border-l-yellow-500' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-0.5 text-xs font-medium rounded ${urgency.color}`}>
                            {urgency.label}
                          </span>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(deadline.status)}`}>
                            {STATUS_OPTIONS.find(s => s.value === deadline.status)?.label}
                          </span>
                          <span className={`text-sm font-medium ${getPriorityColor(deadline.priority)}`}>
                            {PRIORITY_OPTIONS.find(p => p.value === deadline.priority)?.label}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{deadline.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          {deadline.caseNumber} - {deadline.caseName}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDateTime(deadline.dueDate, deadline.dueTime)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Gavel className="w-4 h-4" />
                            {DEADLINE_TYPE_OPTIONS.find(t => t.value === deadline.deadlineType)?.label}
                          </span>
                          {deadline.assignedTo && (
                            <span className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              {deadline.assignedTo}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCompleteDeadline(deadline.id)}
                          className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/50 rounded-lg"
                          title={t('tools.courtDeadline.markComplete', 'Mark Complete')}
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setEditingDeadline(deadline)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteDeadline(deadline.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* All Deadlines */}
        {activeTab === 'all' && (
          <div className="space-y-4">
            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder={t('tools.courtDeadline.searchDeadlines', 'Search deadlines...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as DeadlineStatus | 'all')}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">{t('tools.courtDeadline.allStatuses', 'All Statuses')}</option>
                {STATUS_OPTIONS.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as DeadlineType | 'all')}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">{t('tools.courtDeadline.allTypes', 'All Types')}</option>
                {DEADLINE_TYPE_OPTIONS.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value as Priority | 'all')}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">{t('tools.courtDeadline.allPriorities', 'All Priorities')}</option>
                {PRIORITY_OPTIONS.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>

            {/* Deadlines Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{t('tools.courtDeadline.dueDate', 'Due Date')}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{t('tools.courtDeadline.deadline', 'Deadline')}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{t('tools.courtDeadline.case', 'Case')}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{t('tools.courtDeadline.type', 'Type')}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{t('tools.courtDeadline.priority', 'Priority')}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{t('tools.courtDeadline.status', 'Status')}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{t('tools.courtDeadline.assignedTo', 'Assigned To')}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{t('tools.courtDeadline.actions', 'Actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredDeadlines.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                          {t('tools.courtDeadline.noDeadlinesFoundAddA', 'No deadlines found. Add a new deadline to get started.')}
                        </td>
                      </tr>
                    ) : (
                      filteredDeadlines.map(deadline => {
                        const daysUntil = getDaysUntil(deadline.dueDate);
                        const urgency = getUrgencyLabel(daysUntil);

                        return (
                          <tr key={deadline.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-4 py-3">
                              <div className="text-sm text-gray-900 dark:text-white">{formatDate(deadline.dueDate)}</div>
                              {deadline.status !== 'completed' && deadline.status !== 'missed' && (
                                <span className={`text-xs px-1.5 py-0.5 rounded ${urgency.color}`}>
                                  {urgency.label}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{deadline.title}</td>
                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                              <div>{deadline.caseNumber}</div>
                              <div className="text-xs text-gray-500">{deadline.caseName}</div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                              {DEADLINE_TYPE_OPTIONS.find(t => t.value === deadline.deadlineType)?.label}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`text-sm font-medium ${getPriorityColor(deadline.priority)}`}>
                                {PRIORITY_OPTIONS.find(p => p.value === deadline.priority)?.label}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(deadline.status)}`}>
                                {STATUS_OPTIONS.find(s => s.value === deadline.status)?.label}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{deadline.assignedTo || '-'}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                {deadline.status !== 'completed' && (
                                  <button
                                    onClick={() => handleCompleteDeadline(deadline.id)}
                                    className="p-1 text-green-600 hover:text-green-700"
                                    title={t('tools.courtDeadline.complete', 'Complete')}
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </button>
                                )}
                                <button
                                  onClick={() => setEditingDeadline(deadline)}
                                  className="p-1 text-gray-400 hover:text-blue-600"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteDeadline(deadline.id)}
                                  className="p-1 text-gray-400 hover:text-red-600"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Calendar View */}
        {activeTab === 'calendar' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {new Date(calendarData.year, calendarData.month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="grid grid-cols-7 gap-1">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                  {day}
                </div>
              ))}
              {calendarData.days.map((day, index) => {
                const isToday = day.date.toDateString() === new Date().toDateString();
                const isCurrentMonth = day.date.getMonth() === calendarData.month;

                return (
                  <div
                    key={index}
                    className={`min-h-[80px] p-1 border border-gray-100 dark:border-gray-700 ${
                      isCurrentMonth ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900'
                    } ${isToday ? 'ring-2 ring-blue-500' : ''}`}
                  >
                    <div className={`text-sm ${isCurrentMonth ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                      {day.date.getDate()}
                    </div>
                    <div className="space-y-1 mt-1">
                      {day.deadlines.slice(0, 2).map(d => (
                        <div
                          key={d.id}
                          className={`text-xs px-1 py-0.5 rounded truncate ${getPriorityBgColor(d.priority)}`}
                          title={d.title}
                        >
                          {d.title}
                        </div>
                      ))}
                      {day.deadlines.length > 2 && (
                        <div className="text-xs text-gray-500">+{day.deadlines.length - 2} more</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* New Deadline Form */}
        {activeTab === 'new' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">{t('tools.courtDeadline.addNewDeadline', 'Add New Deadline')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Case Info */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.courtDeadline.caseNumber', 'Case Number *')}</label>
                <input
                  type="text"
                  value={newDeadline.caseNumber}
                  onChange={(e) => setNewDeadline({ ...newDeadline, caseNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.courtDeadline.caseName', 'Case Name')}</label>
                <input
                  type="text"
                  value={newDeadline.caseName}
                  onChange={(e) => setNewDeadline({ ...newDeadline, caseName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.courtDeadline.clientName', 'Client Name')}</label>
                <input
                  type="text"
                  value={newDeadline.clientName}
                  onChange={(e) => setNewDeadline({ ...newDeadline, clientName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.courtDeadline.courtName', 'Court Name')}</label>
                <input
                  type="text"
                  value={newDeadline.courtName}
                  onChange={(e) => setNewDeadline({ ...newDeadline, courtName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Deadline Details */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.courtDeadline.deadlineTitle', 'Deadline Title *')}</label>
                <input
                  type="text"
                  value={newDeadline.title}
                  onChange={(e) => setNewDeadline({ ...newDeadline, title: e.target.value })}
                  placeholder={t('tools.courtDeadline.eGResponseToMotion', 'e.g., Response to Motion')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.courtDeadline.deadlineType', 'Deadline Type')}</label>
                <select
                  value={newDeadline.deadlineType}
                  onChange={(e) => setNewDeadline({ ...newDeadline, deadlineType: e.target.value as DeadlineType })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {DEADLINE_TYPE_OPTIONS.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.courtDeadline.dueDate2', 'Due Date *')}</label>
                <input
                  type="date"
                  value={newDeadline.dueDate}
                  onChange={(e) => setNewDeadline({ ...newDeadline, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.courtDeadline.dueTime', 'Due Time')}</label>
                <input
                  type="time"
                  value={newDeadline.dueTime}
                  onChange={(e) => setNewDeadline({ ...newDeadline, dueTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.courtDeadline.priority2', 'Priority')}</label>
                <select
                  value={newDeadline.priority}
                  onChange={(e) => setNewDeadline({ ...newDeadline, priority: e.target.value as Priority })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {PRIORITY_OPTIONS.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.courtDeadline.assignedTo2', 'Assigned To')}</label>
                <input
                  type="text"
                  value={newDeadline.assignedTo}
                  onChange={(e) => setNewDeadline({ ...newDeadline, assignedTo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.courtDeadline.courtRule', 'Court Rule')}</label>
                <input
                  type="text"
                  value={newDeadline.courtRule}
                  onChange={(e) => setNewDeadline({ ...newDeadline, courtRule: e.target.value })}
                  placeholder={t('tools.courtDeadline.eGFrcp12A', 'e.g., FRCP 12(a)(1)(A)')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.courtDeadline.reminder', 'Reminder')}</label>
                <select
                  value={newDeadline.reminderFrequency}
                  onChange={(e) => setNewDeadline({ ...newDeadline, reminderFrequency: e.target.value as ReminderFrequency })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {REMINDER_OPTIONS.map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.courtDeadline.description', 'Description')}</label>
                <textarea
                  value={newDeadline.description}
                  onChange={(e) => setNewDeadline({ ...newDeadline, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              {/* Notes */}
              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.courtDeadline.notes', 'Notes')}</label>
                <textarea
                  value={newDeadline.notes}
                  onChange={(e) => setNewDeadline({ ...newDeadline, notes: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setActiveTab('upcoming')}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                {t('tools.courtDeadline.cancel', 'Cancel')}
              </button>
              <button
                onClick={handleCreateDeadline}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {t('tools.courtDeadline.addDeadline', 'Add Deadline')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Deadline Modal */}
      {editingDeadline && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('tools.courtDeadline.editDeadline', 'Edit Deadline')}</h3>
              <button onClick={() => setEditingDeadline(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.courtDeadline.title', 'Title')}</label>
                <input
                  type="text"
                  value={editingDeadline.title}
                  onChange={(e) => setEditingDeadline({ ...editingDeadline, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.courtDeadline.dueDate3', 'Due Date')}</label>
                <input
                  type="date"
                  value={editingDeadline.dueDate}
                  onChange={(e) => setEditingDeadline({ ...editingDeadline, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.courtDeadline.status2', 'Status')}</label>
                <select
                  value={editingDeadline.status}
                  onChange={(e) => setEditingDeadline({ ...editingDeadline, status: e.target.value as DeadlineStatus })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {STATUS_OPTIONS.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.courtDeadline.priority3', 'Priority')}</label>
                <select
                  value={editingDeadline.priority}
                  onChange={(e) => setEditingDeadline({ ...editingDeadline, priority: e.target.value as Priority })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {PRIORITY_OPTIONS.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.courtDeadline.assignedTo3', 'Assigned To')}</label>
                <input
                  type="text"
                  value={editingDeadline.assignedTo}
                  onChange={(e) => setEditingDeadline({ ...editingDeadline, assignedTo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.courtDeadline.notes2', 'Notes')}</label>
                <textarea
                  value={editingDeadline.notes}
                  onChange={(e) => setEditingDeadline({ ...editingDeadline, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setEditingDeadline(null)}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                {t('tools.courtDeadline.cancel2', 'Cancel')}
              </button>
              <button
                onClick={() => handleUpdateDeadline(editingDeadline.id, editingDeadline)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {t('tools.courtDeadline.saveChanges', 'Save Changes')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Validation Toast */}
      {validationMessage && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg animate-pulse">
          {validationMessage}
        </div>
      )}

      <ConfirmDialog />
    </div>
  );
};

export default CourtDeadlineTool;
