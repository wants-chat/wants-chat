'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Clock,
  DollarSign,
  Play,
  Pause,
  StopCircle,
  Plus,
  Trash2,
  Search,
  Filter,
  Calendar,
  User,
  Briefcase,
  FileText,
  Edit2,
  Save,
  X,
  ChevronDown,
  ChevronUp,
  Timer,
  TrendingUp,
  BarChart2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { UIConfig } from '../ContextualUI';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import useToolData from '../../hooks/useToolData';
import { type ColumnConfig } from '../../lib/toolDataUtils';

interface BillableHoursToolProps {
  uiConfig?: UIConfig;
}

// Types
type EntryStatus = 'draft' | 'submitted' | 'approved' | 'billed' | 'paid';
type ActivityType = 'research' | 'drafting' | 'review' | 'meeting' | 'court' | 'travel' | 'communication' | 'deposition' | 'negotiation' | 'other';

interface TimeEntry {
  id: string;
  // Case/Client Info
  caseNumber: string;
  caseName: string;
  clientName: string;
  // Time Info
  date: string;
  startTime?: string;
  endTime?: string;
  duration: number; // in minutes
  // Work Details
  activityType: ActivityType;
  description: string;
  internalNotes?: string;
  // Billing
  billingRate: number;
  amount: number;
  billable: boolean;
  status: EntryStatus;
  // Attorney
  attorney: string;
  // Metadata
  createdAt: string;
  updatedAt: string;
}

interface TimerState {
  isRunning: boolean;
  startTime: number | null;
  elapsed: number; // in seconds
  caseNumber: string;
  caseName: string;
  clientName: string;
  activityType: ActivityType;
  description: string;
}

// Constants
const STATUS_OPTIONS: { value: EntryStatus; label: string; color: string }[] = [
  { value: 'draft', label: 'Draft', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' },
  { value: 'submitted', label: 'Submitted', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  { value: 'approved', label: 'Approved', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  { value: 'billed', label: 'Billed', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
  { value: 'paid', label: 'Paid', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' },
];

const ACTIVITY_TYPE_OPTIONS: { value: ActivityType; label: string }[] = [
  { value: 'research', label: 'Legal Research' },
  { value: 'drafting', label: 'Document Drafting' },
  { value: 'review', label: 'Document Review' },
  { value: 'meeting', label: 'Client Meeting' },
  { value: 'court', label: 'Court Appearance' },
  { value: 'travel', label: 'Travel' },
  { value: 'communication', label: 'Communication' },
  { value: 'deposition', label: 'Deposition' },
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'other', label: 'Other' },
];

// Column configuration for exports
const TIME_ENTRY_COLUMNS: ColumnConfig[] = [
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'caseNumber', header: 'Case #', type: 'string' },
  { key: 'caseName', header: 'Case Name', type: 'string' },
  { key: 'clientName', header: 'Client', type: 'string' },
  { key: 'attorney', header: 'Attorney', type: 'string' },
  { key: 'activityType', header: 'Activity', type: 'string' },
  { key: 'description', header: 'Description', type: 'string' },
  { key: 'duration', header: 'Duration (hrs)', type: 'number' },
  { key: 'billingRate', header: 'Rate', type: 'currency' },
  { key: 'amount', header: 'Amount', type: 'currency' },
  { key: 'billable', header: 'Billable', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
];

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
};

const formatTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const minutesToDecimalHours = (minutes: number) => {
  return (minutes / 60).toFixed(2);
};

// Main Component
export const BillableHoursTool: React.FC<BillableHoursToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // useToolData hook for backend sync
  const {
    data: entries,
    addItem: addEntry,
    updateItem: updateEntry,
    deleteItem: deleteEntry,
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
  } = useToolData<TimeEntry>('billable-hours', [], TIME_ENTRY_COLUMNS);

  // Local UI state
  const [activeTab, setActiveTab] = useState<'entries' | 'timer' | 'new' | 'reports'>('entries');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<EntryStatus | 'all'>('all');
  const [filterDate, setFilterDate] = useState<'today' | 'week' | 'month' | 'all'>('all');
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // Timer state
  const [timer, setTimer] = useState<TimerState>({
    isRunning: false,
    startTime: null,
    elapsed: 0,
    caseNumber: '',
    caseName: '',
    clientName: '',
    activityType: 'research',
    description: '',
  });

  // New entry form state
  const [newEntry, setNewEntry] = useState<Partial<TimeEntry>>({
    caseNumber: '',
    caseName: '',
    clientName: '',
    date: new Date().toISOString().split('T')[0],
    duration: 0,
    activityType: 'research',
    description: '',
    internalNotes: '',
    billingRate: 350,
    billable: true,
    status: 'draft',
    attorney: '',
  });

  // Timer interval
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer.isRunning && timer.startTime) {
      interval = setInterval(() => {
        setTimer(prev => ({
          ...prev,
          elapsed: Math.floor((Date.now() - (prev.startTime || 0)) / 1000),
        }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer.isRunning, timer.startTime]);

  // Prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as any;
      if (params.caseNumber || params.caseName || params.clientName) {
        setNewEntry({
          ...newEntry,
          caseNumber: params.caseNumber || '',
          caseName: params.caseName || '',
          clientName: params.clientName || '',
          attorney: params.attorney || '',
        });
        setActiveTab('new');
      }
    }
  }, [uiConfig?.params]);

  // Filter entries
  const filteredEntries = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    return entries.filter(entry => {
      const entryDate = new Date(entry.date);
      const matchesSearch =
        entry.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.caseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.attorney.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || entry.status === filterStatus;

      let matchesDate = true;
      if (filterDate === 'today') matchesDate = entryDate >= today;
      else if (filterDate === 'week') matchesDate = entryDate >= weekAgo;
      else if (filterDate === 'month') matchesDate = entryDate >= monthAgo;

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [entries, searchTerm, filterStatus, filterDate]);

  // Statistics
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayEntries = entries.filter(e => e.date === today);
    const todayHours = todayEntries.reduce((sum, e) => sum + e.duration, 0) / 60;
    const todayBillable = todayEntries.filter(e => e.billable).reduce((sum, e) => sum + e.amount, 0);

    const thisWeek = new Date();
    thisWeek.setDate(thisWeek.getDate() - thisWeek.getDay());
    const weekStart = thisWeek.toISOString().split('T')[0];
    const weekEntries = entries.filter(e => e.date >= weekStart);
    const weekHours = weekEntries.reduce((sum, e) => sum + e.duration, 0) / 60;
    const weekBillable = weekEntries.filter(e => e.billable).reduce((sum, e) => sum + e.amount, 0);

    const pendingApproval = entries.filter(e => e.status === 'submitted').length;
    const unbilled = entries.filter(e => e.status === 'approved').reduce((sum, e) => sum + e.amount, 0);

    return { todayHours, todayBillable, weekHours, weekBillable, pendingApproval, unbilled };
  }, [entries]);

  // Handlers
  const handleStartTimer = () => {
    if (!timer.caseNumber || !timer.description) {
      setValidationMessage('Please enter case number and description');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }
    setTimer({
      ...timer,
      isRunning: true,
      startTime: Date.now(),
      elapsed: 0,
    });
  };

  const handlePauseTimer = () => {
    setTimer(prev => ({ ...prev, isRunning: false }));
  };

  const handleResumeTimer = () => {
    setTimer(prev => ({
      ...prev,
      isRunning: true,
      startTime: Date.now() - prev.elapsed * 1000,
    }));
  };

  const handleStopTimer = () => {
    if (timer.elapsed < 60) {
      setValidationMessage('Minimum time entry is 1 minute');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const duration = Math.ceil(timer.elapsed / 60); // Convert to minutes
    const billingRate = 350; // Default rate
    const amount = (duration / 60) * billingRate;

    const entry: TimeEntry = {
      id: generateId(),
      caseNumber: timer.caseNumber,
      caseName: timer.caseName,
      clientName: timer.clientName,
      date: new Date().toISOString().split('T')[0],
      duration,
      activityType: timer.activityType,
      description: timer.description,
      billingRate,
      amount,
      billable: true,
      status: 'draft',
      attorney: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addEntry(entry);
    setTimer({
      isRunning: false,
      startTime: null,
      elapsed: 0,
      caseNumber: '',
      caseName: '',
      clientName: '',
      activityType: 'research',
      description: '',
    });
    setActiveTab('entries');
  };

  const handleCreateEntry = () => {
    if (!newEntry.caseNumber || !newEntry.description || !newEntry.duration) {
      setValidationMessage('Please fill in all required fields');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const entry: TimeEntry = {
      id: generateId(),
      caseNumber: newEntry.caseNumber || '',
      caseName: newEntry.caseName || '',
      clientName: newEntry.clientName || '',
      date: newEntry.date || new Date().toISOString().split('T')[0],
      duration: newEntry.duration || 0,
      activityType: newEntry.activityType || 'research',
      description: newEntry.description || '',
      internalNotes: newEntry.internalNotes,
      billingRate: newEntry.billingRate || 350,
      amount: ((newEntry.duration || 0) / 60) * (newEntry.billingRate || 350),
      billable: newEntry.billable ?? true,
      status: newEntry.status || 'draft',
      attorney: newEntry.attorney || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addEntry(entry);
    setNewEntry({
      caseNumber: '',
      caseName: '',
      clientName: '',
      date: new Date().toISOString().split('T')[0],
      duration: 0,
      activityType: 'research',
      description: '',
      internalNotes: '',
      billingRate: 350,
      billable: true,
      status: 'draft',
      attorney: '',
    });
    setActiveTab('entries');
  };

  const handleUpdateEntry = (id: string, updates: Partial<TimeEntry>) => {
    const updatedAmount = updates.duration !== undefined || updates.billingRate !== undefined
      ? ((updates.duration ?? entries.find(e => e.id === id)?.duration ?? 0) / 60) *
        (updates.billingRate ?? entries.find(e => e.id === id)?.billingRate ?? 350)
      : undefined;

    updateEntry(id, {
      ...updates,
      ...(updatedAmount !== undefined && { amount: updatedAmount }),
      updatedAt: new Date().toISOString(),
    });
    setEditingEntry(null);
  };

  const handleDeleteEntry = async (id: string) => {
    const confirmed = await confirm({
      title: 'Confirm Deletion',
      message: 'Are you sure you want to delete this time entry?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteEntry(id);
    }
  };

  const getStatusColor = (status: EntryStatus) => {
    return STATUS_OPTIONS.find(s => s.value === status)?.color || '';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Validation Toast */}
      {validationMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-in">
          <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg px-4 py-3 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <p className="text-sm font-medium text-red-800 dark:text-red-200">{validationMessage}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t('tools.billableHours.billableHoursTracker', 'Billable Hours Tracker')}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('tools.billableHours.trackAndManageAttorneyTime', 'Track and manage attorney time entries')}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <WidgetEmbedButton toolSlug="billable-hours" toolName="Billable Hours" />

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
      <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Timer className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.todayHours.toFixed(1)}h</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('tools.billableHours.todaySHours', 'Today\'s Hours')}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.todayBillable)}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('tools.billableHours.todaySBillable', 'Today\'s Billable')}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <BarChart2 className="w-8 h-8 text-purple-500" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.weekHours.toFixed(1)}h</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('tools.billableHours.thisWeek', 'This Week')}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-8 h-8 text-orange-500" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.unbilled)}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('tools.billableHours.unbilled', 'Unbilled')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6">
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
          {[
            { id: 'entries', label: 'Time Entries', icon: FileText },
            { id: 'timer', label: 'Timer', icon: Timer },
            { id: 'new', label: 'Manual Entry', icon: Plus },
            { id: 'reports', label: 'Reports', icon: BarChart2 },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
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
        {/* Time Entries List */}
        {activeTab === 'entries' && (
          <div className="space-y-4">
            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder={t('tools.billableHours.searchEntries', 'Search entries...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as EntryStatus | 'all')}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">{t('tools.billableHours.allStatuses', 'All Statuses')}</option>
                {STATUS_OPTIONS.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
              <select
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">{t('tools.billableHours.allTime', 'All Time')}</option>
                <option value="today">{t('tools.billableHours.today', 'Today')}</option>
                <option value="week">{t('tools.billableHours.thisWeek2', 'This Week')}</option>
                <option value="month">{t('tools.billableHours.thisMonth', 'This Month')}</option>
              </select>
            </div>

            {/* Entries Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{t('tools.billableHours.date', 'Date')}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{t('tools.billableHours.case', 'Case')}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{t('tools.billableHours.client', 'Client')}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{t('tools.billableHours.activity', 'Activity')}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{t('tools.billableHours.description', 'Description')}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{t('tools.billableHours.duration', 'Duration')}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{t('tools.billableHours.amount', 'Amount')}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{t('tools.billableHours.status', 'Status')}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{t('tools.billableHours.actions', 'Actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredEntries.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                          {t('tools.billableHours.noTimeEntriesFoundStart', 'No time entries found. Start tracking your time!')}
                        </td>
                      </tr>
                    ) : (
                      filteredEntries.map(entry => (
                        <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{formatDate(entry.date)}</td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                            <div>{entry.caseNumber}</div>
                            <div className="text-xs text-gray-500">{entry.caseName}</div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{entry.clientName}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                            {ACTIVITY_TYPE_OPTIONS.find(a => a.value === entry.activityType)?.label}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 max-w-xs truncate">{entry.description}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-mono">
                            {minutesToDecimalHours(entry.duration)}h
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                            {entry.billable ? formatCurrency(entry.amount) : <span className="text-gray-400">N/B</span>}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(entry.status)}`}>
                              {STATUS_OPTIONS.find(s => s.value === entry.status)?.label}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setEditingEntry(entry)}
                                className="p-1 text-gray-400 hover:text-blue-600"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteEntry(entry.id)}
                                className="p-1 text-gray-400 hover:text-red-600"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Timer */}
        {activeTab === 'timer' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              {/* Timer Display */}
              <div className="text-center mb-8">
                <div className={`text-6xl font-mono font-bold ${timer.isRunning ? 'text-blue-600' : 'text-gray-900 dark:text-white'}`}>
                  {formatTime(timer.elapsed)}
                </div>
                {timer.isRunning && (
                  <p className="text-sm text-gray-500 mt-2">{t('tools.billableHours.recordingTime', 'Recording time...')}</p>
                )}
              </div>

              {/* Timer Controls */}
              <div className="flex justify-center gap-4 mb-8">
                {!timer.isRunning && timer.elapsed === 0 && (
                  <button
                    onClick={handleStartTimer}
                    className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <Play className="w-5 h-5" />
                    {t('tools.billableHours.start', 'Start')}
                  </button>
                )}
                {timer.isRunning && (
                  <button
                    onClick={handlePauseTimer}
                    className="flex items-center gap-2 px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                  >
                    <Pause className="w-5 h-5" />
                    {t('tools.billableHours.pause', 'Pause')}
                  </button>
                )}
                {!timer.isRunning && timer.elapsed > 0 && (
                  <>
                    <button
                      onClick={handleResumeTimer}
                      className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Play className="w-5 h-5" />
                      {t('tools.billableHours.resume', 'Resume')}
                    </button>
                    <button
                      onClick={handleStopTimer}
                      className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      <StopCircle className="w-5 h-5" />
                      {t('tools.billableHours.stopSave', 'Stop & Save')}
                    </button>
                  </>
                )}
              </div>

              {/* Timer Form */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.billableHours.caseNumber', 'Case Number *')}</label>
                    <input
                      type="text"
                      value={timer.caseNumber}
                      onChange={(e) => setTimer({ ...timer, caseNumber: e.target.value })}
                      disabled={timer.isRunning}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.billableHours.caseName', 'Case Name')}</label>
                    <input
                      type="text"
                      value={timer.caseName}
                      onChange={(e) => setTimer({ ...timer, caseName: e.target.value })}
                      disabled={timer.isRunning}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.billableHours.clientName', 'Client Name')}</label>
                    <input
                      type="text"
                      value={timer.clientName}
                      onChange={(e) => setTimer({ ...timer, clientName: e.target.value })}
                      disabled={timer.isRunning}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.billableHours.activityType', 'Activity Type')}</label>
                    <select
                      value={timer.activityType}
                      onChange={(e) => setTimer({ ...timer, activityType: e.target.value as ActivityType })}
                      disabled={timer.isRunning}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                    >
                      {ACTIVITY_TYPE_OPTIONS.map(a => (
                        <option key={a.value} value={a.value}>{a.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.billableHours.description2', 'Description *')}</label>
                  <textarea
                    value={timer.description}
                    onChange={(e) => setTimer({ ...timer, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Manual Entry Form */}
        {activeTab === 'new' && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">{t('tools.billableHours.createManualTimeEntry', 'Create Manual Time Entry')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.billableHours.date2', 'Date *')}</label>
                  <input
                    type="date"
                    value={newEntry.date}
                    onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                {/* Case Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.billableHours.caseNumber2', 'Case Number *')}</label>
                  <input
                    type="text"
                    value={newEntry.caseNumber}
                    onChange={(e) => setNewEntry({ ...newEntry, caseNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                {/* Case Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.billableHours.caseName2', 'Case Name')}</label>
                  <input
                    type="text"
                    value={newEntry.caseName}
                    onChange={(e) => setNewEntry({ ...newEntry, caseName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                {/* Client Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.billableHours.clientName2', 'Client Name')}</label>
                  <input
                    type="text"
                    value={newEntry.clientName}
                    onChange={(e) => setNewEntry({ ...newEntry, clientName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                {/* Activity Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.billableHours.activityType2', 'Activity Type')}</label>
                  <select
                    value={newEntry.activityType}
                    onChange={(e) => setNewEntry({ ...newEntry, activityType: e.target.value as ActivityType })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {ACTIVITY_TYPE_OPTIONS.map(a => (
                      <option key={a.value} value={a.value}>{a.label}</option>
                    ))}
                  </select>
                </div>
                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.billableHours.durationMinutes', 'Duration (minutes) *')}</label>
                  <input
                    type="number"
                    value={newEntry.duration}
                    onChange={(e) => setNewEntry({ ...newEntry, duration: parseInt(e.target.value) || 0 })}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                {/* Billing Rate */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.billableHours.billingRateHr', 'Billing Rate ($/hr)')}</label>
                  <input
                    type="number"
                    value={newEntry.billingRate}
                    onChange={(e) => setNewEntry({ ...newEntry, billingRate: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                {/* Attorney */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.billableHours.attorney', 'Attorney')}</label>
                  <input
                    type="text"
                    value={newEntry.attorney}
                    onChange={(e) => setNewEntry({ ...newEntry, attorney: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                {/* Billable */}
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    checked={newEntry.billable}
                    onChange={(e) => setNewEntry({ ...newEntry, billable: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('tools.billableHours.billable', 'Billable')}</label>
                </div>
                {/* Description */}
                <div className="md:col-span-2 lg:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.billableHours.description3', 'Description *')}</label>
                  <textarea
                    value={newEntry.description}
                    onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                {/* Internal Notes */}
                <div className="md:col-span-2 lg:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.billableHours.internalNotes', 'Internal Notes')}</label>
                  <textarea
                    value={newEntry.internalNotes}
                    onChange={(e) => setNewEntry({ ...newEntry, internalNotes: e.target.value })}
                    rows={2}
                    placeholder={t('tools.billableHours.notesNotShownToClient', 'Notes not shown to client...')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              {/* Amount Preview */}
              {newEntry.duration && newEntry.billingRate && newEntry.billable && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Amount: <span className="font-bold text-gray-900 dark:text-white">
                      {formatCurrency(((newEntry.duration || 0) / 60) * (newEntry.billingRate || 0))}
                    </span>
                    <span className="text-gray-500 ml-2">
                      ({minutesToDecimalHours(newEntry.duration || 0)} hrs x {formatCurrency(newEntry.billingRate || 0)}/hr)
                    </span>
                  </p>
                </div>
              )}
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setActiveTab('entries')}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  {t('tools.billableHours.cancel', 'Cancel')}
                </button>
                <button
                  onClick={handleCreateEntry}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.billableHours.createEntry', 'Create Entry')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reports */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('tools.billableHours.timeSummary', 'Time Summary')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">{t('tools.billableHours.thisWeek3', 'This Week')}</h3>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.weekHours.toFixed(1)} hours</p>
                  <p className="text-sm text-green-600">{formatCurrency(stats.weekBillable)} billable</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">{t('tools.billableHours.pendingApproval', 'Pending Approval')}</h3>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.pendingApproval} entries</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">{t('tools.billableHours.unbilledAmount', 'Unbilled Amount')}</h3>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.unbilled)}</p>
                </div>
              </div>
            </div>

            {/* By Activity Type */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('tools.billableHours.hoursByActivity', 'Hours by Activity')}</h2>
              <div className="space-y-3">
                {ACTIVITY_TYPE_OPTIONS.map(activity => {
                  const activityEntries = entries.filter(e => e.activityType === activity.value);
                  const hours = activityEntries.reduce((sum, e) => sum + e.duration, 0) / 60;
                  const amount = activityEntries.filter(e => e.billable).reduce((sum, e) => sum + e.amount, 0);
                  const maxHours = Math.max(...ACTIVITY_TYPE_OPTIONS.map(a =>
                    entries.filter(e => e.activityType === a.value).reduce((sum, e) => sum + e.duration, 0) / 60
                  ), 1);
                  const percentage = (hours / maxHours) * 100;

                  return (
                    <div key={activity.value}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700 dark:text-gray-300">{activity.label}</span>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {hours.toFixed(1)}h / {formatCurrency(amount)}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Entry Modal */}
      {editingEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('tools.billableHours.editTimeEntry', 'Edit Time Entry')}</h3>
              <button onClick={() => setEditingEntry(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.billableHours.durationMinutes2', 'Duration (minutes)')}</label>
                <input
                  type="number"
                  value={editingEntry.duration}
                  onChange={(e) => setEditingEntry({ ...editingEntry, duration: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.billableHours.status2', 'Status')}</label>
                <select
                  value={editingEntry.status}
                  onChange={(e) => setEditingEntry({ ...editingEntry, status: e.target.value as EntryStatus })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {STATUS_OPTIONS.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.billableHours.description4', 'Description')}</label>
                <textarea
                  value={editingEntry.description}
                  onChange={(e) => setEditingEntry({ ...editingEntry, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editingEntry.billable}
                  onChange={(e) => setEditingEntry({ ...editingEntry, billable: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('tools.billableHours.billable2', 'Billable')}</label>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setEditingEntry(null)}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                {t('tools.billableHours.cancel2', 'Cancel')}
              </button>
              <button
                onClick={() => handleUpdateEntry(editingEntry.id, editingEntry)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {t('tools.billableHours.saveChanges', 'Save Changes')}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog />
    </div>
  );
};

export default BillableHoursTool;
