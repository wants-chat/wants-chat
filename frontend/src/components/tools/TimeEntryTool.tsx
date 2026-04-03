'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  Clock,
  User,
  Calendar,
  DollarSign,
  Plus,
  Trash2,
  Search,
  Filter,
  CheckCircle,
  Edit2,
  Save,
  X,
  Play,
  Pause,
  Square,
  FileText,
  Briefcase,
  Timer,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  BarChart3,
  Users,
  Settings,
  Copy,
  Check,
  RefreshCw,
  XCircle,
  PenTool,
  ListChecks,
  Eye,
  ArrowUpDown,
} from 'lucide-react';
import { UIConfig } from '../ContextualUI';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import useToolData from '../../hooks/useToolData';
import { type ColumnConfig } from '../../lib/toolDataUtils';
import { useTheme } from '../../contexts/ThemeContext';

interface TimeEntryToolProps {
  uiConfig?: UIConfig;
}

// Types
type EntryStatus = 'draft' | 'pending' | 'approved' | 'billed' | 'rejected' | 'written-off';
type ActivityCode = 'A101' | 'A102' | 'A103' | 'A104' | 'A105' | 'A106' | 'A107' | 'A108' | 'A109' | 'A110' | 'A111' | 'A112';
type TaskCode = 'L100' | 'L110' | 'L120' | 'L130' | 'L140' | 'L150' | 'L160' | 'L170' | 'L180' | 'L190' | 'L200' | 'L210';
type ViewMode = 'list' | 'daily' | 'weekly' | 'monthly';
type MinimumIncrement = 0.1 | 0.25 | 0.5 | 1.0;

interface Timekeeper {
  id: string;
  name: string;
  initials: string;
  title: string;
  rate: number;
  department: string;
  isActive: boolean;
}

interface Matter {
  id: string;
  number: string;
  name: string;
  clientName: string;
  clientNumber: string;
  practiceArea: string;
  billingType: 'hourly' | 'flat' | 'contingency' | 'hybrid';
  isActive: boolean;
}

interface NarrativeTemplate {
  id: string;
  name: string;
  text: string;
  activityCode: ActivityCode;
  category: string;
}

interface TimeEntry {
  id: string;
  // Matter Info
  matterId: string;
  matterNumber: string;
  matterName: string;
  clientName: string;
  clientNumber: string;
  // Timekeeper
  timekeeperId: string;
  timekeeperName: string;
  timekeeperInitials: string;
  timekeeperRate: number;
  // Time
  date: string;
  hours: number;
  minutes: number;
  totalHours: number;
  roundedHours: number;
  // Activity - UTBMS/LEDES Codes
  activityCode: ActivityCode;
  taskCode: TaskCode;
  description: string;
  // Billing
  billable: boolean;
  rate: number;
  originalAmount: number;
  writeDownAmount: number;
  writeDownReason: string;
  finalAmount: number;
  status: EntryStatus;
  // Timer
  timerStarted?: string;
  timerDuration?: number;
  // Block Billing
  isBlockEntry: boolean;
  blockEntries?: { description: string; hours: number }[];
  // Approval
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  // Metadata
  createdAt: string;
  updatedAt: string;
}

interface Settings {
  minimumIncrement: MinimumIncrement;
  defaultRate: number;
  defaultTimekeeperId: string;
  roundingRule: 'up' | 'down' | 'nearest';
  autoSaveTimer: boolean;
  requireDescription: boolean;
  requireMatter: boolean;
}

// UTBMS Activity Codes (LEDES)
const ACTIVITY_CODES: { value: ActivityCode; label: string; description: string }[] = [
  { value: 'A101', label: 'Plan and prepare for', description: 'Planning and preparation activities' },
  { value: 'A102', label: 'Research', description: 'Legal research' },
  { value: 'A103', label: 'Draft/revise', description: 'Drafting and revising documents' },
  { value: 'A104', label: 'Review/analyze', description: 'Review and analyze documents' },
  { value: 'A105', label: 'Communicate (in writing)', description: 'Written communications' },
  { value: 'A106', label: 'Communicate (orally)', description: 'Oral communications' },
  { value: 'A107', label: 'Appear for/attend', description: 'Appearances and attendance' },
  { value: 'A108', label: 'Manage data/files', description: 'Data and file management' },
  { value: 'A109', label: 'Other', description: 'Other legal activities' },
  { value: 'A110', label: 'Travel', description: 'Travel time' },
  { value: 'A111', label: 'Court appearance', description: 'Court appearances' },
  { value: 'A112', label: 'Deposition', description: 'Deposition attendance' },
];

// UTBMS Task Codes (LEDES)
const TASK_CODES: { value: TaskCode; label: string; phase: string }[] = [
  { value: 'L100', label: 'Case Assessment', phase: 'Pre-Trial' },
  { value: 'L110', label: 'Development of Strategy', phase: 'Pre-Trial' },
  { value: 'L120', label: 'Fact Investigation', phase: 'Pre-Trial' },
  { value: 'L130', label: 'Document Production', phase: 'Discovery' },
  { value: 'L140', label: 'Depositions', phase: 'Discovery' },
  { value: 'L150', label: 'Experts', phase: 'Discovery' },
  { value: 'L160', label: 'Motions Practice', phase: 'Trial Prep' },
  { value: 'L170', label: 'Trial Preparation', phase: 'Trial Prep' },
  { value: 'L180', label: 'Trial', phase: 'Trial' },
  { value: 'L190', label: 'Appeal', phase: 'Post-Trial' },
  { value: 'L200', label: 'ADR', phase: 'Alternative' },
  { value: 'L210', label: 'Settlement', phase: 'Resolution' },
];

const STATUS_OPTIONS: { value: EntryStatus; label: string; color: string; darkColor: string }[] = [
  { value: 'draft', label: 'Draft', color: 'bg-gray-100 text-gray-800', darkColor: 'bg-gray-700 text-gray-300' },
  { value: 'pending', label: 'Pending Review', color: 'bg-yellow-100 text-yellow-800', darkColor: 'bg-yellow-900/30 text-yellow-400' },
  { value: 'approved', label: 'Approved', color: 'bg-green-100 text-green-800', darkColor: 'bg-green-900/30 text-green-400' },
  { value: 'billed', label: 'Billed', color: 'bg-blue-100 text-blue-800', darkColor: 'bg-blue-900/30 text-blue-400' },
  { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-800', darkColor: 'bg-red-900/30 text-red-400' },
  { value: 'written-off', label: 'Written Off', color: 'bg-purple-100 text-purple-800', darkColor: 'bg-purple-900/30 text-purple-400' },
];

const MINIMUM_INCREMENTS: { value: MinimumIncrement; label: string }[] = [
  { value: 0.1, label: '6 minutes (0.1 hr)' },
  { value: 0.25, label: '15 minutes (0.25 hr)' },
  { value: 0.5, label: '30 minutes (0.5 hr)' },
  { value: 1.0, label: '60 minutes (1.0 hr)' },
];

// Default narrative templates
const DEFAULT_TEMPLATES: NarrativeTemplate[] = [
  { id: '1', name: 'Research Case Law', text: 'Research case law regarding [TOPIC]. Review relevant statutes and regulations.', activityCode: 'A102', category: 'Research' },
  { id: '2', name: 'Draft Motion', text: 'Draft [MOTION TYPE] motion. Research applicable legal standards and prepare supporting arguments.', activityCode: 'A103', category: 'Drafting' },
  { id: '3', name: 'Client Call', text: 'Telephone conference with [CLIENT] regarding [TOPIC]. Discuss case status and strategy.', activityCode: 'A106', category: 'Communication' },
  { id: '4', name: 'Document Review', text: 'Review and analyze [NUMBER] documents produced by [PARTY] for relevance and privilege.', activityCode: 'A104', category: 'Discovery' },
  { id: '5', name: 'Deposition Prep', text: 'Prepare for deposition of [WITNESS]. Review relevant documents and develop questioning strategy.', activityCode: 'A101', category: 'Depositions' },
  { id: '6', name: 'Court Appearance', text: 'Appear at [COURT] for [HEARING TYPE]. Present arguments on behalf of client.', activityCode: 'A111', category: 'Court' },
  { id: '7', name: 'Email Correspondence', text: 'Prepare and send correspondence to [RECIPIENT] regarding [TOPIC].', activityCode: 'A105', category: 'Communication' },
  { id: '8', name: 'Contract Review', text: 'Review [CONTRACT TYPE] agreement. Analyze terms and identify issues for negotiation.', activityCode: 'A104', category: 'Transactional' },
];

// Default timekeepers
const DEFAULT_TIMEKEEPERS: Timekeeper[] = [
  { id: 'tk1', name: 'John Smith', initials: 'JS', title: 'Partner', rate: 650, department: 'Litigation', isActive: true },
  { id: 'tk2', name: 'Sarah Johnson', initials: 'SJ', title: 'Senior Associate', rate: 450, department: 'Corporate', isActive: true },
  { id: 'tk3', name: 'Michael Chen', initials: 'MC', title: 'Associate', rate: 350, department: 'Litigation', isActive: true },
  { id: 'tk4', name: 'Emily Davis', initials: 'ED', title: 'Paralegal', rate: 175, department: 'Litigation', isActive: true },
];

// Default matters
const DEFAULT_MATTERS: Matter[] = [
  { id: 'm1', number: '2024-0001', name: 'Smith v. Jones', clientName: 'Smith Corporation', clientNumber: 'C001', practiceArea: 'Litigation', billingType: 'hourly', isActive: true },
  { id: 'm2', number: '2024-0002', name: 'Acme Merger', clientName: 'Acme Industries', clientNumber: 'C002', practiceArea: 'Corporate', billingType: 'hourly', isActive: true },
  { id: 'm3', number: '2024-0003', name: 'Estate of Williams', clientName: 'Williams Family', clientNumber: 'C003', practiceArea: 'Estate Planning', billingType: 'flat', isActive: true },
];

// Column configuration for exports
const ENTRY_COLUMNS: ColumnConfig[] = [
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'timekeeperName', header: 'Timekeeper', type: 'string' },
  { key: 'matterNumber', header: 'Matter #', type: 'string' },
  { key: 'matterName', header: 'Matter', type: 'string' },
  { key: 'clientName', header: 'Client', type: 'string' },
  { key: 'activityCode', header: 'Activity Code', type: 'string' },
  { key: 'taskCode', header: 'Task Code', type: 'string' },
  { key: 'description', header: 'Description', type: 'string' },
  { key: 'totalHours', header: 'Hours', type: 'number' },
  { key: 'roundedHours', header: 'Rounded Hours', type: 'number' },
  { key: 'rate', header: 'Rate', type: 'currency' },
  { key: 'originalAmount', header: 'Original Amount', type: 'currency' },
  { key: 'writeDownAmount', header: 'Write-Down', type: 'currency' },
  { key: 'finalAmount', header: 'Final Amount', type: 'currency' },
  { key: 'billable', header: 'Billable', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
];

// Helper functions
const generateId = () => crypto.randomUUID();

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatShortDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
};

const formatHours = (hours: number) => {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}:${m.toString().padStart(2, '0')}`;
};

const formatTimerDuration = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const roundToIncrement = (hours: number, increment: MinimumIncrement, rule: 'up' | 'down' | 'nearest'): number => {
  if (rule === 'up') {
    return Math.ceil(hours / increment) * increment;
  } else if (rule === 'down') {
    return Math.floor(hours / increment) * increment;
  } else {
    return Math.round(hours / increment) * increment;
  }
};

const getWeekDates = (date: Date): Date[] => {
  const start = new Date(date);
  start.setDate(date.getDate() - date.getDay());
  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    dates.push(d);
  }
  return dates;
};

const getMonthDates = (year: number, month: number): Date[] => {
  const dates: Date[] = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let i = 1; i <= daysInMonth; i++) {
    dates.push(new Date(year, month, i));
  }
  return dates;
};

// Main Component
export const TimeEntryTool: React.FC<TimeEntryToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
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
  } = useToolData<TimeEntry>('time-entries', [], ENTRY_COLUMNS);

  // Local state
  const [timekeepers] = useState<Timekeeper[]>(DEFAULT_TIMEKEEPERS);
  const [matters] = useState<Matter[]>(DEFAULT_MATTERS);
  const [templates] = useState<NarrativeTemplate[]>(DEFAULT_TEMPLATES);
  const [settings, setSettings] = useState<Settings>({
    minimumIncrement: 0.1,
    defaultRate: 350,
    defaultTimekeeperId: 'tk1',
    roundingRule: 'up',
    autoSaveTimer: true,
    requireDescription: true,
    requireMatter: true,
  });

  // UI state
  const [activeTab, setActiveTab] = useState<'list' | 'new' | 'timer' | 'analytics' | 'settings'>('list');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedEntry, setSelectedEntry] = useState<TimeEntry | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<EntryStatus | 'all'>('all');
  const [filterTimekeeper, setFilterTimekeeper] = useState<string>('all');
  const [filterMatter, setFilterMatter] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<'today' | 'week' | 'month' | 'all'>('all');
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
  const [showWriteDownModal, setShowWriteDownModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showBlockBillingModal, setShowBlockBillingModal] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Timer state
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerMatter, setTimerMatter] = useState<Matter | null>(null);
  const [timerTimekeeper, setTimerTimekeeper] = useState<Timekeeper | null>(null);
  const [timerDescription, setTimerDescription] = useState('');
  const [timerActivityCode, setTimerActivityCode] = useState<ActivityCode>('A109');
  const [timerTaskCode, setTimerTaskCode] = useState<TaskCode>('L100');

  // Block billing state
  const [blockEntries, setBlockEntries] = useState<{ description: string; hours: number }[]>([
    { description: '', hours: 0 },
  ]);

  // Write-down state
  const [writeDownEntry, setWriteDownEntry] = useState<TimeEntry | null>(null);
  const [writeDownAmount, setWriteDownAmount] = useState(0);
  const [writeDownReason, setWriteDownReason] = useState('');

  // New entry form state
  const [newEntry, setNewEntry] = useState<Partial<TimeEntry>>({
    matterId: '',
    matterNumber: '',
    matterName: '',
    clientName: '',
    clientNumber: '',
    timekeeperId: settings.defaultTimekeeperId,
    timekeeperName: '',
    timekeeperInitials: '',
    timekeeperRate: settings.defaultRate,
    date: new Date().toISOString().split('T')[0],
    hours: 0,
    minutes: 0,
    totalHours: 0,
    roundedHours: 0,
    activityCode: 'A109',
    taskCode: 'L100',
    description: '',
    billable: true,
    rate: settings.defaultRate,
    originalAmount: 0,
    writeDownAmount: 0,
    writeDownReason: '',
    finalAmount: 0,
    status: 'draft',
    isBlockEntry: false,
  });

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Update amounts when hours or rate change
  useEffect(() => {
    const totalHours = (newEntry.hours || 0) + (newEntry.minutes || 0) / 60;
    const roundedHours = roundToIncrement(totalHours, settings.minimumIncrement, settings.roundingRule);
    const originalAmount = roundedHours * (newEntry.rate || 0);
    const finalAmount = originalAmount - (newEntry.writeDownAmount || 0);
    setNewEntry((prev) => ({ ...prev, totalHours, roundedHours, originalAmount, finalAmount }));
  }, [newEntry.hours, newEntry.minutes, newEntry.rate, newEntry.writeDownAmount, settings.minimumIncrement, settings.roundingRule]);

  // Filtered entries
  const filteredEntries = useMemo(() => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    return entries
      .filter((entry) => {
        const matchesSearch =
          searchTerm === '' ||
          entry.matterNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entry.matterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entry.timekeeperName.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = filterStatus === 'all' || entry.status === filterStatus;
        const matchesTimekeeper = filterTimekeeper === 'all' || entry.timekeeperId === filterTimekeeper;
        const matchesMatter = filterMatter === 'all' || entry.matterId === filterMatter;

        let matchesDate = true;
        const entryDate = new Date(entry.date);
        if (filterDate === 'today') {
          matchesDate = entryDate.toDateString() === today.toDateString();
        } else if (filterDate === 'week') {
          matchesDate = entryDate >= startOfWeek;
        } else if (filterDate === 'month') {
          matchesDate = entryDate >= startOfMonth;
        }

        return matchesSearch && matchesStatus && matchesTimekeeper && matchesMatter && matchesDate;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [entries, searchTerm, filterStatus, filterTimekeeper, filterMatter, filterDate]);

  // Daily view entries
  const dailyEntries = useMemo(() => {
    const dateStr = currentDate.toISOString().split('T')[0];
    return entries.filter((e) => e.date === dateStr);
  }, [entries, currentDate]);

  // Weekly view entries grouped by day
  const weeklyEntries = useMemo(() => {
    const weekDates = getWeekDates(currentDate);
    const grouped: Record<string, TimeEntry[]> = {};
    weekDates.forEach((date) => {
      const dateStr = date.toISOString().split('T')[0];
      grouped[dateStr] = entries.filter((e) => e.date === dateStr);
    });
    return { dates: weekDates, entries: grouped };
  }, [entries, currentDate]);

  // Statistics
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayEntries = entries.filter((e) => e.date === today);
    const todayHours = todayEntries.reduce((sum, e) => sum + e.roundedHours, 0);
    const todayBillable = todayEntries.filter((e) => e.billable).reduce((sum, e) => sum + e.roundedHours, 0);
    const totalBillableAmount = entries.filter((e) => e.billable && e.status !== 'written-off').reduce((sum, e) => sum + e.finalAmount, 0);
    const totalWriteDowns = entries.reduce((sum, e) => sum + e.writeDownAmount, 0);
    const pending = entries.filter((e) => e.status === 'pending').length;
    const approved = entries.filter((e) => e.status === 'approved').length;
    const rejected = entries.filter((e) => e.status === 'rejected').length;

    // Weekly stats
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekEntries = entries.filter((e) => new Date(e.date) >= weekStart);
    const weekHours = weekEntries.reduce((sum, e) => sum + e.roundedHours, 0);
    const weekBillable = weekEntries.filter((e) => e.billable).reduce((sum, e) => sum + e.finalAmount, 0);

    // Monthly stats
    const monthStart = new Date();
    monthStart.setDate(1);
    const monthEntries = entries.filter((e) => new Date(e.date) >= monthStart);
    const monthHours = monthEntries.reduce((sum, e) => sum + e.roundedHours, 0);
    const monthBillable = monthEntries.filter((e) => e.billable).reduce((sum, e) => sum + e.finalAmount, 0);

    // Utilization
    const targetHours = 8 * 5 * 4; // 8 hours/day * 5 days/week * 4 weeks
    const utilization = (monthHours / targetHours) * 100;

    // By timekeeper
    const byTimekeeper = timekeepers.map((tk) => {
      const tkEntries = entries.filter((e) => e.timekeeperId === tk.id);
      return {
        ...tk,
        hours: tkEntries.reduce((sum, e) => sum + e.roundedHours, 0),
        amount: tkEntries.filter((e) => e.billable).reduce((sum, e) => sum + e.finalAmount, 0),
      };
    });

    return { todayHours, todayBillable, totalBillableAmount, totalWriteDowns, pending, approved, rejected, weekHours, weekBillable, monthHours, monthBillable, utilization, byTimekeeper };
  }, [entries, timekeepers]);

  // Handlers
  const handleCreateEntry = () => {
    if (settings.requireMatter && !newEntry.matterNumber) {
      setValidationMessage('Please select a matter');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }
    if (settings.requireDescription && !newEntry.description) {
      setValidationMessage('Please enter a description');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const entry: TimeEntry = {
      id: generateId(),
      matterId: newEntry.matterId || '',
      matterNumber: newEntry.matterNumber || '',
      matterName: newEntry.matterName || '',
      clientName: newEntry.clientName || '',
      clientNumber: newEntry.clientNumber || '',
      timekeeperId: newEntry.timekeeperId || '',
      timekeeperName: newEntry.timekeeperName || '',
      timekeeperInitials: newEntry.timekeeperInitials || '',
      timekeeperRate: newEntry.timekeeperRate || settings.defaultRate,
      date: newEntry.date || new Date().toISOString().split('T')[0],
      hours: newEntry.hours || 0,
      minutes: newEntry.minutes || 0,
      totalHours: newEntry.totalHours || 0,
      roundedHours: newEntry.roundedHours || 0,
      activityCode: newEntry.activityCode || 'A109',
      taskCode: newEntry.taskCode || 'L100',
      description: newEntry.description || '',
      billable: newEntry.billable !== false,
      rate: newEntry.rate || settings.defaultRate,
      originalAmount: newEntry.originalAmount || 0,
      writeDownAmount: 0,
      writeDownReason: '',
      finalAmount: newEntry.finalAmount || 0,
      status: 'draft',
      isBlockEntry: newEntry.isBlockEntry || false,
      blockEntries: newEntry.isBlockEntry ? blockEntries : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addEntry(entry);
    resetForm();
    setActiveTab('list');
  };

  const resetForm = () => {
    const defaultTimekeeper = timekeepers.find((tk) => tk.id === settings.defaultTimekeeperId);
    setNewEntry({
      matterId: '',
      matterNumber: '',
      matterName: '',
      clientName: '',
      clientNumber: '',
      timekeeperId: settings.defaultTimekeeperId,
      timekeeperName: defaultTimekeeper?.name || '',
      timekeeperInitials: defaultTimekeeper?.initials || '',
      timekeeperRate: defaultTimekeeper?.rate || settings.defaultRate,
      date: new Date().toISOString().split('T')[0],
      hours: 0,
      minutes: 0,
      totalHours: 0,
      roundedHours: 0,
      activityCode: 'A109',
      taskCode: 'L100',
      description: '',
      billable: true,
      rate: defaultTimekeeper?.rate || settings.defaultRate,
      originalAmount: 0,
      writeDownAmount: 0,
      writeDownReason: '',
      finalAmount: 0,
      status: 'draft',
      isBlockEntry: false,
    });
    setBlockEntries([{ description: '', hours: 0 }]);
  };

  const handleSelectMatter = (matterId: string) => {
    const matter = matters.find((m) => m.id === matterId);
    if (matter) {
      setNewEntry({
        ...newEntry,
        matterId: matter.id,
        matterNumber: matter.number,
        matterName: matter.name,
        clientName: matter.clientName,
        clientNumber: matter.clientNumber,
      });
    }
  };

  const handleSelectTimekeeper = (timekeeperId: string) => {
    const timekeeper = timekeepers.find((tk) => tk.id === timekeeperId);
    if (timekeeper) {
      setNewEntry({
        ...newEntry,
        timekeeperId: timekeeper.id,
        timekeeperName: timekeeper.name,
        timekeeperInitials: timekeeper.initials,
        timekeeperRate: timekeeper.rate,
        rate: timekeeper.rate,
      });
    }
  };

  const handleInsertTemplate = (template: NarrativeTemplate) => {
    setNewEntry({
      ...newEntry,
      description: template.text,
      activityCode: template.activityCode,
    });
    setShowTemplateModal(false);
  };

  const handleStartTimer = () => {
    if (!timerMatter) {
      setValidationMessage('Please select a matter');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }
    setIsTimerRunning(true);
  };

  const handlePauseTimer = () => {
    setIsTimerRunning(false);
  };

  const handleStopTimer = () => {
    setIsTimerRunning(false);
    const totalHours = timerSeconds / 3600;
    const roundedHours = roundToIncrement(totalHours, settings.minimumIncrement, settings.roundingRule);
    const rate = timerTimekeeper?.rate || settings.defaultRate;
    const originalAmount = roundedHours * rate;

    const entry: TimeEntry = {
      id: generateId(),
      matterId: timerMatter?.id || '',
      matterNumber: timerMatter?.number || '',
      matterName: timerMatter?.name || '',
      clientName: timerMatter?.clientName || '',
      clientNumber: timerMatter?.clientNumber || '',
      timekeeperId: timerTimekeeper?.id || '',
      timekeeperName: timerTimekeeper?.name || '',
      timekeeperInitials: timerTimekeeper?.initials || '',
      timekeeperRate: timerTimekeeper?.rate || settings.defaultRate,
      date: new Date().toISOString().split('T')[0],
      hours: Math.floor(totalHours),
      minutes: Math.round((totalHours - Math.floor(totalHours)) * 60),
      totalHours: parseFloat(totalHours.toFixed(4)),
      roundedHours,
      activityCode: timerActivityCode,
      taskCode: timerTaskCode,
      description: timerDescription || 'Timer entry',
      billable: true,
      rate,
      originalAmount,
      writeDownAmount: 0,
      writeDownReason: '',
      finalAmount: originalAmount,
      status: 'draft',
      isBlockEntry: false,
      timerDuration: timerSeconds,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addEntry(entry);
    setTimerSeconds(0);
    setTimerMatter(null);
    setTimerTimekeeper(null);
    setTimerDescription('');
    setActiveTab('list');
  };

  const handleDeleteEntry = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Time Entry',
      message: 'Are you sure you want to delete this time entry?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteEntry(id);
    }
  };

  const handleSubmitEntry = (id: string) => {
    updateEntry(id, { status: 'pending', updatedAt: new Date().toISOString() });
  };

  const handleApproveEntry = (id: string) => {
    updateEntry(id, {
      status: 'approved',
      approvedBy: 'Current User',
      approvedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  };

  const handleRejectEntry = (id: string, reason: string) => {
    updateEntry(id, {
      status: 'rejected',
      rejectedBy: 'Current User',
      rejectedAt: new Date().toISOString(),
      rejectionReason: reason,
      updatedAt: new Date().toISOString()
    });
  };

  const handleWriteDown = () => {
    if (!writeDownEntry) return;
    const newFinalAmount = writeDownEntry.originalAmount - writeDownAmount;
    updateEntry(writeDownEntry.id, {
      writeDownAmount,
      writeDownReason,
      finalAmount: Math.max(0, newFinalAmount),
      updatedAt: new Date().toISOString(),
    });
    setShowWriteDownModal(false);
    setWriteDownEntry(null);
    setWriteDownAmount(0);
    setWriteDownReason('');
  };

  const handleWriteOff = async (id: string) => {
    const confirmed = await confirm({
      title: 'Write Off Entry',
      message: 'Are you sure you want to write off this entry? This will set the final amount to $0.',
      confirmText: 'Write Off',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      const entry = entries.find((e) => e.id === id);
      if (entry) {
        updateEntry(id, {
          status: 'written-off',
          writeDownAmount: entry.originalAmount,
          finalAmount: 0,
          updatedAt: new Date().toISOString(),
        });
      }
    }
  };

  const openWriteDownModal = (entry: TimeEntry) => {
    setWriteDownEntry(entry);
    setWriteDownAmount(entry.writeDownAmount || 0);
    setWriteDownReason(entry.writeDownReason || '');
    setShowWriteDownModal(true);
  };

  const getStatusBadge = (status: EntryStatus) => {
    const option = STATUS_OPTIONS.find((s) => s.value === status);
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${isDark ? option?.darkColor : option?.color}`}>
        {option?.label}
      </span>
    );
  };

  // Styles
  const cardClass = `rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`;
  const inputClass = `w-full px-3 py-2 rounded-lg border transition-colors ${
    isDark
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-green-500'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-green-500'
  } focus:outline-none focus:ring-2 focus:ring-green-500/20`;
  const labelClass = `block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`;
  const buttonPrimary = `flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg transition-all font-medium shadow-lg shadow-green-500/20`;
  const buttonSecondary = `flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium ${
    isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
  }`;
  const tabClass = (active: boolean) => `flex-1 py-3 px-4 text-center font-medium transition-colors ${
    active
      ? isDark
        ? 'text-green-400 border-b-2 border-green-400 bg-green-900/20'
        : 'text-green-600 border-b-2 border-green-600 bg-green-50'
      : isDark
        ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
  }`;

  return (
    <div className={`min-h-screen p-6 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className={`${cardClass} p-6 mb-6`}>
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl ${isDark ? 'bg-green-900/30' : 'bg-green-100'}`}>
                <Clock className={`w-8 h-8 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.timeEntry.timeEntry', 'Time Entry')}</h1>
                <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.timeEntry.legalBillingAndTimeTracking', 'Legal billing and time tracking')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <WidgetEmbedButton toolSlug="time-entry" toolName="Time Entry" />

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
                onExportCSV={() => exportCSV({ filename: 'time-entries' })}
                onExportExcel={() => exportExcel({ filename: 'time-entries' })}
                onExportJSON={() => exportJSON({ filename: 'time-entries' })}
                onExportPDF={() => exportPDF({ filename: 'time-entries', title: 'Time Entry Report' })}
                onPrint={() => print('Time Entry Report')}
                onCopyToClipboard={() => copyToClipboard('tab')}
                onImportCSV={importCSV}
                onImportJSON={importJSON}
                disabled={entries.length === 0 && activeTab === 'list'}
                theme={isDark ? 'dark' : 'light'}
              />
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className={`rounded-lg p-4 ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.todayHours.toFixed(1)}h</div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.timeEntry.today', 'Today')}</div>
            </div>
            <div className={`rounded-lg p-4 ${isDark ? 'bg-green-900/30' : 'bg-green-50'}`}>
              <div className={`text-2xl font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>{stats.todayBillable.toFixed(1)}h</div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.timeEntry.billableToday', 'Billable Today')}</div>
            </div>
            <div className={`rounded-lg p-4 ${isDark ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
              <div className={`text-2xl font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{formatCurrency(stats.totalBillableAmount)}</div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.timeEntry.totalBillable', 'Total Billable')}</div>
            </div>
            <div className={`rounded-lg p-4 ${isDark ? 'bg-yellow-900/30' : 'bg-yellow-50'}`}>
              <div className={`text-2xl font-bold ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>{stats.pending}</div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.timeEntry.pending', 'Pending')}</div>
            </div>
            <div className={`rounded-lg p-4 ${isDark ? 'bg-red-900/30' : 'bg-red-50'}`}>
              <div className={`text-2xl font-bold ${isDark ? 'text-red-400' : 'text-red-600'}`}>{formatCurrency(stats.totalWriteDowns)}</div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.timeEntry.writeDowns', 'Write-Downs')}</div>
            </div>
            <div className={`rounded-lg p-4 ${isDark ? 'bg-purple-900/30' : 'bg-purple-50'}`}>
              <div className={`text-2xl font-bold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>{stats.utilization.toFixed(0)}%</div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.timeEntry.utilization', 'Utilization')}</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className={`${cardClass} mb-6 overflow-hidden`}>
          <div className={`flex border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <button onClick={() => setActiveTab('list')} className={tabClass(activeTab === 'list')}>
              <FileText className="w-4 h-4 inline mr-2" />
              {t('tools.timeEntry.entries', 'Entries')}
            </button>
            <button onClick={() => setActiveTab('new')} className={tabClass(activeTab === 'new')}>
              <Plus className="w-4 h-4 inline mr-2" />
              {t('tools.timeEntry.newEntry', 'New Entry')}
            </button>
            <button onClick={() => setActiveTab('timer')} className={tabClass(activeTab === 'timer')}>
              <Timer className="w-4 h-4 inline mr-2" />
              Timer
              {isTimerRunning && <span className="ml-2 w-2 h-2 bg-red-500 rounded-full inline-block animate-pulse" />}
            </button>
            <button onClick={() => setActiveTab('analytics')} className={tabClass(activeTab === 'analytics')}>
              <BarChart3 className="w-4 h-4 inline mr-2" />
              {t('tools.timeEntry.analytics', 'Analytics')}
            </button>
            <button onClick={() => setActiveTab('settings')} className={tabClass(activeTab === 'settings')}>
              <Settings className="w-4 h-4 inline mr-2" />
              {t('tools.timeEntry.settings', 'Settings')}
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'list' && (
          <div className={cardClass}>
            {/* View Mode & Filters */}
            <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex flex-col lg:flex-row gap-4">
                {/* View Mode Toggle */}
                <div className={`inline-flex rounded-lg p-1 ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  {(['list', 'daily', 'weekly', 'monthly'] as ViewMode[]).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode)}
                      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                        viewMode === mode
                          ? isDark ? 'bg-green-600 text-white' : 'bg-white text-green-600 shadow'
                          : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </button>
                  ))}
                </div>

                {/* Search */}
                <div className="flex-1 relative">
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                  <input
                    type="text"
                    placeholder={t('tools.timeEntry.searchEntries', 'Search entries...')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`${inputClass} pl-10`}
                  />
                </div>

                {/* Filters */}
                <select
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value as any)}
                  className={inputClass}
                  style={{ width: 'auto' }}
                >
                  <option value="all">{t('tools.timeEntry.allDates', 'All Dates')}</option>
                  <option value="today">{t('tools.timeEntry.today2', 'Today')}</option>
                  <option value="week">{t('tools.timeEntry.thisWeek', 'This Week')}</option>
                  <option value="month">{t('tools.timeEntry.thisMonth', 'This Month')}</option>
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as EntryStatus | 'all')}
                  className={inputClass}
                  style={{ width: 'auto' }}
                >
                  <option value="all">{t('tools.timeEntry.allStatuses', 'All Statuses')}</option>
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
                <select
                  value={filterTimekeeper}
                  onChange={(e) => setFilterTimekeeper(e.target.value)}
                  className={inputClass}
                  style={{ width: 'auto' }}
                >
                  <option value="all">{t('tools.timeEntry.allTimekeepers', 'All Timekeepers')}</option>
                  {timekeepers.map((tk) => (
                    <option key={tk.id} value={tk.id}>{tk.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Entry List / Views */}
            {viewMode === 'list' && (
              <div className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {filteredEntries.length === 0 ? (
                  <div className={`p-8 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <Clock className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                    <p>{t('tools.timeEntry.noTimeEntriesFound', 'No time entries found')}</p>
                  </div>
                ) : (
                  filteredEntries.map((entry) => (
                    <div key={entry.id} className={`p-4 transition-colors ${isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}`}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1 min-w-0">
                          <div className="text-center min-w-[60px]">
                            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {entry.roundedHours.toFixed(1)}
                            </div>
                            <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>hours</div>
                          </div>
                          <div className={`border-l pl-4 flex-1 min-w-0 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                            <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {entry.matterNumber} - {entry.matterName}
                            </div>
                            <div className={`text-sm truncate ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              {entry.description}
                            </div>
                            <div className={`flex items-center gap-2 mt-1 text-xs flex-wrap ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatShortDate(entry.date)}
                              </span>
                              <span>|</span>
                              <span>{entry.timekeeperInitials}</span>
                              <span>|</span>
                              <span>{ACTIVITY_CODES.find((a) => a.value === entry.activityCode)?.label}</span>
                              {entry.billable && (
                                <>
                                  <span>|</span>
                                  <span className="flex items-center gap-1">
                                    <DollarSign className="w-3 h-3" />
                                    {formatCurrency(entry.finalAmount)}
                                  </span>
                                </>
                              )}
                              {entry.writeDownAmount > 0 && (
                                <>
                                  <span>|</span>
                                  <span className="text-red-500 flex items-center gap-1">
                                    <TrendingDown className="w-3 h-3" />
                                    -{formatCurrency(entry.writeDownAmount)}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {!entry.billable && (
                            <span className={`px-2 py-1 rounded text-xs ${isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>
                              {t('tools.timeEntry.nonBillable', 'Non-Billable')}
                            </span>
                          )}
                          {getStatusBadge(entry.status)}
                          <div className="flex gap-1">
                            {entry.status === 'draft' && (
                              <button
                                onClick={() => handleSubmitEntry(entry.id)}
                                className={`p-1.5 rounded transition-colors ${isDark ? 'hover:bg-green-900/30 text-green-400' : 'hover:bg-green-50 text-green-600'}`}
                                title={t('tools.timeEntry.submitForReview', 'Submit for Review')}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
                            {entry.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleApproveEntry(entry.id)}
                                  className={`p-1.5 rounded transition-colors ${isDark ? 'hover:bg-green-900/30 text-green-400' : 'hover:bg-green-50 text-green-600'}`}
                                  title={t('tools.timeEntry.approve', 'Approve')}
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleRejectEntry(entry.id, 'Insufficient detail')}
                                  className={`p-1.5 rounded transition-colors ${isDark ? 'hover:bg-red-900/30 text-red-400' : 'hover:bg-red-50 text-red-600'}`}
                                  title={t('tools.timeEntry.reject', 'Reject')}
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </>
                            )}
                            {entry.billable && entry.status !== 'written-off' && (
                              <button
                                onClick={() => openWriteDownModal(entry)}
                                className={`p-1.5 rounded transition-colors ${isDark ? 'hover:bg-yellow-900/30 text-yellow-400' : 'hover:bg-yellow-50 text-yellow-600'}`}
                                title={t('tools.timeEntry.writeDown', 'Write Down')}
                              >
                                <TrendingDown className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteEntry(entry.id)}
                              className={`p-1.5 rounded transition-colors ${isDark ? 'hover:bg-red-900/30 text-red-400' : 'hover:bg-red-50 text-red-500'}`}
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {viewMode === 'daily' && (
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 1)))}
                    className={buttonSecondary}
                  >
                    <ChevronRight className="w-4 h-4 rotate-180" />
                  </button>
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {formatDate(currentDate.toISOString())}
                  </h3>
                  <button
                    onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 1)))}
                    className={buttonSecondary}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <div className={`rounded-lg p-4 mb-4 ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <div className="flex justify-between">
                    <span>{t('tools.timeEntry.totalHours', 'Total Hours:')}</span>
                    <span className="font-bold">{dailyEntries.reduce((sum, e) => sum + e.roundedHours, 0).toFixed(1)}h</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span>{t('tools.timeEntry.billableAmount', 'Billable Amount:')}</span>
                    <span className="font-bold">{formatCurrency(dailyEntries.filter(e => e.billable).reduce((sum, e) => sum + e.finalAmount, 0))}</span>
                  </div>
                </div>
                {dailyEntries.length === 0 ? (
                  <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.timeEntry.noEntriesForThisDay', 'No entries for this day')}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {dailyEntries.map((entry) => (
                      <div key={entry.id} className={`p-3 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-white border border-gray-200'}`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{entry.matterNumber}</div>
                            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{entry.description}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">{entry.roundedHours.toFixed(1)}h</div>
                            {entry.billable && <div className="text-sm text-green-500">{formatCurrency(entry.finalAmount)}</div>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {viewMode === 'weekly' && (
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 7)))}
                    className={buttonSecondary}
                  >
                    <ChevronRight className="w-4 h-4 rotate-180" /> Prev Week
                  </button>
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {formatShortDate(weeklyEntries.dates[0].toISOString())} - {formatShortDate(weeklyEntries.dates[6].toISOString())}
                  </h3>
                  <button
                    onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 7)))}
                    className={buttonSecondary}
                  >
                    Next Week <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {weeklyEntries.dates.map((date) => {
                    const dateStr = date.toISOString().split('T')[0];
                    const dayEntries = weeklyEntries.entries[dateStr] || [];
                    const dayHours = dayEntries.reduce((sum, e) => sum + e.roundedHours, 0);
                    const isToday = date.toDateString() === new Date().toDateString();
                    return (
                      <div
                        key={dateStr}
                        className={`p-3 rounded-lg text-center ${
                          isToday
                            ? isDark ? 'bg-green-900/30 border border-green-500' : 'bg-green-50 border border-green-300'
                            : isDark ? 'bg-gray-700/50' : 'bg-gray-50'
                        }`}
                      >
                        <div className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()]}
                        </div>
                        <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {date.getDate()}
                        </div>
                        <div className={`text-sm mt-2 ${dayHours >= 8 ? 'text-green-500' : isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {dayHours.toFixed(1)}h
                        </div>
                        <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                          {dayEntries.length} entries
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className={`mt-4 p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <div className="flex justify-between">
                    <span>{t('tools.timeEntry.weekTotal', 'Week Total:')}</span>
                    <span className="font-bold">{stats.weekHours.toFixed(1)}h</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span>{t('tools.timeEntry.weekBillable', 'Week Billable:')}</span>
                    <span className="font-bold">{formatCurrency(stats.weekBillable)}</span>
                  </div>
                </div>
              </div>
            )}

            {viewMode === 'monthly' && (
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
                    className={buttonSecondary}
                  >
                    <ChevronRight className="w-4 h-4 rotate-180" />
                  </button>
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h3>
                  <button
                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
                    className={buttonSecondary}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.timeEntry.totalHours2', 'Total Hours')}</div>
                      <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.monthHours.toFixed(1)}h</div>
                    </div>
                    <div>
                      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.timeEntry.billableRevenue', 'Billable Revenue')}</div>
                      <div className="text-2xl font-bold text-green-500">{formatCurrency(stats.monthBillable)}</div>
                    </div>
                    <div>
                      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.timeEntry.targetHours160', 'Target Hours (160)')}</div>
                      <div className={`text-2xl font-bold ${stats.monthHours >= 160 ? 'text-green-500' : 'text-yellow-500'}`}>
                        {((stats.monthHours / 160) * 100).toFixed(0)}%
                      </div>
                    </div>
                    <div>
                      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.timeEntry.utilization2', 'Utilization')}</div>
                      <div className={`text-2xl font-bold ${stats.utilization >= 80 ? 'text-green-500' : 'text-yellow-500'}`}>
                        {stats.utilization.toFixed(0)}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'new' && (
          <div className={`${cardClass} p-6`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.timeEntry.newTimeEntry', 'New Time Entry')}</h2>
              <div className="flex gap-2">
                <button onClick={() => setShowTemplateModal(true)} className={buttonSecondary}>
                  <FileText className="w-4 h-4" /> Templates
                </button>
                <button
                  onClick={() => setNewEntry({ ...newEntry, isBlockEntry: !newEntry.isBlockEntry })}
                  className={`${buttonSecondary} ${newEntry.isBlockEntry ? (isDark ? 'bg-green-900/30' : 'bg-green-100') : ''}`}
                >
                  <ListChecks className="w-4 h-4" /> Block Billing
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Matter Selection */}
              <div>
                <label className={labelClass}>Matter <span className="text-red-500">*</span></label>
                <select
                  value={newEntry.matterId || ''}
                  onChange={(e) => handleSelectMatter(e.target.value)}
                  className={inputClass}
                >
                  <option value="">{t('tools.timeEntry.selectMatter', 'Select Matter')}</option>
                  {matters.filter(m => m.isActive).map((m) => (
                    <option key={m.id} value={m.id}>{m.number} - {m.name}</option>
                  ))}
                </select>
              </div>

              {/* Timekeeper Selection */}
              <div>
                <label className={labelClass}>{t('tools.timeEntry.timekeeper', 'Timekeeper')}</label>
                <select
                  value={newEntry.timekeeperId || ''}
                  onChange={(e) => handleSelectTimekeeper(e.target.value)}
                  className={inputClass}
                >
                  <option value="">{t('tools.timeEntry.selectTimekeeper', 'Select Timekeeper')}</option>
                  {timekeepers.filter(tk => tk.isActive).map((tk) => (
                    <option key={tk.id} value={tk.id}>{tk.name} ({tk.title}) - ${tk.rate}/hr</option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className={labelClass}>{t('tools.timeEntry.date', 'Date')}</label>
                <input
                  type="date"
                  value={newEntry.date || ''}
                  onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
                  className={inputClass}
                />
              </div>

              {/* Hours */}
              <div>
                <label className={labelClass}>{t('tools.timeEntry.hours', 'Hours')}</label>
                <input
                  type="number"
                  min="0"
                  max="24"
                  value={newEntry.hours || 0}
                  onChange={(e) => setNewEntry({ ...newEntry, hours: parseInt(e.target.value) || 0 })}
                  className={inputClass}
                />
              </div>

              {/* Minutes */}
              <div>
                <label className={labelClass}>Minutes (in {settings.minimumIncrement * 60} min increments)</label>
                <select
                  value={newEntry.minutes || 0}
                  onChange={(e) => setNewEntry({ ...newEntry, minutes: parseInt(e.target.value) })}
                  className={inputClass}
                >
                  {Array.from({ length: Math.floor(60 / (settings.minimumIncrement * 60)) + 1 }, (_, i) => i * settings.minimumIncrement * 60).map((min) => (
                    <option key={min} value={min}>{min} ({(min / 60).toFixed(1)})</option>
                  ))}
                </select>
              </div>

              {/* Rate */}
              <div>
                <label className={labelClass}>{t('tools.timeEntry.rateHr', 'Rate ($/hr)')}</label>
                <input
                  type="number"
                  min="0"
                  value={newEntry.rate || settings.defaultRate}
                  onChange={(e) => setNewEntry({ ...newEntry, rate: parseFloat(e.target.value) || 0 })}
                  className={inputClass}
                />
              </div>

              {/* Activity Code (UTBMS) */}
              <div>
                <label className={labelClass}>{t('tools.timeEntry.activityCodeUtbms', 'Activity Code (UTBMS)')}</label>
                <select
                  value={newEntry.activityCode || 'A109'}
                  onChange={(e) => setNewEntry({ ...newEntry, activityCode: e.target.value as ActivityCode })}
                  className={inputClass}
                >
                  {ACTIVITY_CODES.map((code) => (
                    <option key={code.value} value={code.value}>{code.value} - {code.label}</option>
                  ))}
                </select>
              </div>

              {/* Task Code (LEDES) */}
              <div>
                <label className={labelClass}>{t('tools.timeEntry.taskCodeLedes', 'Task Code (LEDES)')}</label>
                <select
                  value={newEntry.taskCode || 'L100'}
                  onChange={(e) => setNewEntry({ ...newEntry, taskCode: e.target.value as TaskCode })}
                  className={inputClass}
                >
                  {TASK_CODES.map((code) => (
                    <option key={code.value} value={code.value}>{code.value} - {code.label} ({code.phase})</option>
                  ))}
                </select>
              </div>

              {/* Billable Toggle */}
              <div className="flex items-center pt-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newEntry.billable !== false}
                    onChange={(e) => setNewEntry({ ...newEntry, billable: e.target.checked })}
                    className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                  />
                  <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.timeEntry.billable', 'Billable')}</span>
                </label>
              </div>

              {/* Description */}
              <div className="md:col-span-3">
                <label className={labelClass}>Description <span className="text-red-500">*</span></label>
                <textarea
                  value={newEntry.description || ''}
                  onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
                  rows={3}
                  className={inputClass}
                  placeholder={t('tools.timeEntry.describeTheWorkPerformed', 'Describe the work performed...')}
                />
              </div>

              {/* Block Billing Entries */}
              {newEntry.isBlockEntry && (
                <div className="md:col-span-3">
                  <label className={labelClass}>{t('tools.timeEntry.blockBillingBreakdown', 'Block Billing Breakdown')}</label>
                  <div className="space-y-2">
                    {blockEntries.map((entry, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={entry.description}
                          onChange={(e) => {
                            const updated = [...blockEntries];
                            updated[index].description = e.target.value;
                            setBlockEntries(updated);
                          }}
                          placeholder={t('tools.timeEntry.taskDescription', 'Task description')}
                          className={`${inputClass} flex-1`}
                        />
                        <input
                          type="number"
                          value={entry.hours}
                          onChange={(e) => {
                            const updated = [...blockEntries];
                            updated[index].hours = parseFloat(e.target.value) || 0;
                            setBlockEntries(updated);
                          }}
                          placeholder={t('tools.timeEntry.hours2', 'Hours')}
                          min="0"
                          step="0.1"
                          className={`${inputClass} w-24`}
                        />
                        <button
                          onClick={() => setBlockEntries(blockEntries.filter((_, i) => i !== index))}
                          className="p-2 text-red-500 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => setBlockEntries([...blockEntries, { description: '', hours: 0 }])}
                      className={buttonSecondary}
                    >
                      <Plus className="w-4 h-4" /> Add Task
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Summary */}
            <div className={`rounded-lg p-4 mb-6 ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.timeEntry.actualTime', 'Actual Time')}</div>
                  <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {formatHours(newEntry.totalHours || 0)}
                  </div>
                </div>
                <div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.timeEntry.roundedTime', 'Rounded Time')}</div>
                  <div className="text-xl font-bold text-green-500">
                    {(newEntry.roundedHours || 0).toFixed(2)}h
                  </div>
                </div>
                <div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.timeEntry.rate', 'Rate')}</div>
                  <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    ${newEntry.rate || settings.defaultRate}/hr
                  </div>
                </div>
                <div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.timeEntry.amount', 'Amount')}</div>
                  <div className="text-xl font-bold text-blue-500">
                    {formatCurrency(newEntry.finalAmount || 0)}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4">
              <button onClick={resetForm} className={buttonSecondary}>
                {t('tools.timeEntry.reset', 'Reset')}
              </button>
              <button onClick={handleCreateEntry} className={buttonPrimary}>
                <Save className="w-4 h-4" /> Save Entry
              </button>
            </div>
          </div>
        )}

        {activeTab === 'timer' && (
          <div className={`${cardClass} p-6`}>
            <h2 className={`text-xl font-semibold text-center mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.timeEntry.timeTracker', 'Time Tracker')}
            </h2>

            {/* Timer Display */}
            <div className="text-center mb-8">
              <div className={`text-7xl font-mono font-bold mb-6 ${isTimerRunning ? 'text-green-500' : isDark ? 'text-white' : 'text-gray-900'}`}>
                {formatTimerDuration(timerSeconds)}
              </div>
              <div className="flex justify-center gap-4">
                {!isTimerRunning ? (
                  <button onClick={handleStartTimer} className="p-5 bg-green-600 text-white rounded-full hover:bg-green-700 shadow-lg transition-transform hover:scale-105">
                    <Play className="w-10 h-10" />
                  </button>
                ) : (
                  <button onClick={handlePauseTimer} className="p-5 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 shadow-lg transition-transform hover:scale-105">
                    <Pause className="w-10 h-10" />
                  </button>
                )}
                {timerSeconds > 0 && (
                  <button onClick={handleStopTimer} className="p-5 bg-red-600 text-white rounded-full hover:bg-red-700 shadow-lg transition-transform hover:scale-105">
                    <Square className="w-10 h-10" />
                  </button>
                )}
              </div>
              {timerSeconds > 0 && (
                <div className={`mt-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Rounded: {roundToIncrement(timerSeconds / 3600, settings.minimumIncrement, settings.roundingRule).toFixed(2)}h
                  ({formatCurrency(roundToIncrement(timerSeconds / 3600, settings.minimumIncrement, settings.roundingRule) * (timerTimekeeper?.rate || settings.defaultRate))})
                </div>
              )}
            </div>

            {/* Timer Details */}
            <div className="max-w-lg mx-auto space-y-4">
              <div>
                <label className={labelClass}>Matter <span className="text-red-500">*</span></label>
                <select
                  value={timerMatter?.id || ''}
                  onChange={(e) => setTimerMatter(matters.find(m => m.id === e.target.value) || null)}
                  className={inputClass}
                  disabled={isTimerRunning}
                >
                  <option value="">{t('tools.timeEntry.selectMatter2', 'Select Matter')}</option>
                  {matters.filter(m => m.isActive).map((m) => (
                    <option key={m.id} value={m.id}>{m.number} - {m.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>{t('tools.timeEntry.timekeeper2', 'Timekeeper')}</label>
                <select
                  value={timerTimekeeper?.id || ''}
                  onChange={(e) => setTimerTimekeeper(timekeepers.find(tk => tk.id === e.target.value) || null)}
                  className={inputClass}
                  disabled={isTimerRunning}
                >
                  <option value="">{t('tools.timeEntry.selectTimekeeper2', 'Select Timekeeper')}</option>
                  {timekeepers.filter(tk => tk.isActive).map((tk) => (
                    <option key={tk.id} value={tk.id}>{tk.name} - ${tk.rate}/hr</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.timeEntry.activityCode', 'Activity Code')}</label>
                  <select
                    value={timerActivityCode}
                    onChange={(e) => setTimerActivityCode(e.target.value as ActivityCode)}
                    className={inputClass}
                  >
                    {ACTIVITY_CODES.map((code) => (
                      <option key={code.value} value={code.value}>{code.value} - {code.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.timeEntry.taskCode', 'Task Code')}</label>
                  <select
                    value={timerTaskCode}
                    onChange={(e) => setTimerTaskCode(e.target.value as TaskCode)}
                    className={inputClass}
                  >
                    {TASK_CODES.map((code) => (
                      <option key={code.value} value={code.value}>{code.value}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className={labelClass}>{t('tools.timeEntry.description', 'Description')}</label>
                <textarea
                  value={timerDescription}
                  onChange={(e) => setTimerDescription(e.target.value)}
                  rows={2}
                  className={inputClass}
                  placeholder={t('tools.timeEntry.whatAreYouWorkingOn', 'What are you working on?')}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className={`${cardClass} p-6`}>
            <h2 className={`text-xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.timeEntry.billingAnalytics', 'Billing Analytics')}
            </h2>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.timeEntry.thisWeek2', 'This Week')}</div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.weekHours.toFixed(1)}h</div>
                <div className="text-green-500">{formatCurrency(stats.weekBillable)}</div>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.timeEntry.thisMonth2', 'This Month')}</div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.monthHours.toFixed(1)}h</div>
                <div className="text-green-500">{formatCurrency(stats.monthBillable)}</div>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.timeEntry.writeDowns2', 'Write-Downs')}</div>
                <div className="text-2xl font-bold text-red-500">{formatCurrency(stats.totalWriteDowns)}</div>
                <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  {((stats.totalWriteDowns / (stats.totalBillableAmount + stats.totalWriteDowns)) * 100 || 0).toFixed(1)}% of billed
                </div>
              </div>
            </div>

            {/* By Timekeeper */}
            <div className="mb-6">
              <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.timeEntry.byTimekeeper', 'By Timekeeper')}</h3>
              <div className="space-y-3">
                {stats.byTimekeeper.map((tk) => (
                  <div key={tk.id} className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-600'}`}>
                          {tk.initials}
                        </div>
                        <div>
                          <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{tk.name}</div>
                          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{tk.title}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{tk.hours.toFixed(1)}h</div>
                        <div className="text-green-500">{formatCurrency(tk.amount)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Status Breakdown */}
            <div>
              <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.timeEntry.entryStatus', 'Entry Status')}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-yellow-900/20' : 'bg-yellow-50'}`}>
                  <div className="text-3xl font-bold text-yellow-500">{stats.pending}</div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.timeEntry.pending2', 'Pending')}</div>
                </div>
                <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-green-900/20' : 'bg-green-50'}`}>
                  <div className="text-3xl font-bold text-green-500">{stats.approved}</div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.timeEntry.approved', 'Approved')}</div>
                </div>
                <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-red-900/20' : 'bg-red-50'}`}>
                  <div className="text-3xl font-bold text-red-500">{stats.rejected}</div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.timeEntry.rejected', 'Rejected')}</div>
                </div>
                <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
                  <div className="text-3xl font-bold text-blue-500">{entries.filter(e => e.status === 'billed').length}</div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.timeEntry.billed', 'Billed')}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className={`${cardClass} p-6`}>
            <h2 className={`text-xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.timeEntry.settings2', 'Settings')}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>{t('tools.timeEntry.minimumTimeIncrement', 'Minimum Time Increment')}</label>
                <select
                  value={settings.minimumIncrement}
                  onChange={(e) => setSettings({ ...settings, minimumIncrement: parseFloat(e.target.value) as MinimumIncrement })}
                  className={inputClass}
                >
                  {MINIMUM_INCREMENTS.map((inc) => (
                    <option key={inc.value} value={inc.value}>{inc.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>{t('tools.timeEntry.roundingRule', 'Rounding Rule')}</label>
                <select
                  value={settings.roundingRule}
                  onChange={(e) => setSettings({ ...settings, roundingRule: e.target.value as 'up' | 'down' | 'nearest' })}
                  className={inputClass}
                >
                  <option value="up">{t('tools.timeEntry.roundUp', 'Round Up')}</option>
                  <option value="down">{t('tools.timeEntry.roundDown', 'Round Down')}</option>
                  <option value="nearest">{t('tools.timeEntry.roundToNearest', 'Round to Nearest')}</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>{t('tools.timeEntry.defaultBillingRate', 'Default Billing Rate')}</label>
                <input
                  type="number"
                  value={settings.defaultRate}
                  onChange={(e) => setSettings({ ...settings, defaultRate: parseFloat(e.target.value) || 0 })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>{t('tools.timeEntry.defaultTimekeeper', 'Default Timekeeper')}</label>
                <select
                  value={settings.defaultTimekeeperId}
                  onChange={(e) => setSettings({ ...settings, defaultTimekeeperId: e.target.value })}
                  className={inputClass}
                >
                  {timekeepers.map((tk) => (
                    <option key={tk.id} value={tk.id}>{tk.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="requireDescription"
                  checked={settings.requireDescription}
                  onChange={(e) => setSettings({ ...settings, requireDescription: e.target.checked })}
                  className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                />
                <label htmlFor="requireDescription" className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.timeEntry.requireDescriptionForEntries', 'Require description for entries')}
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="requireMatter"
                  checked={settings.requireMatter}
                  onChange={(e) => setSettings({ ...settings, requireMatter: e.target.checked })}
                  className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                />
                <label htmlFor="requireMatter" className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.timeEntry.requireMatterSelection', 'Require matter selection')}
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Write-Down Modal */}
        {showWriteDownModal && writeDownEntry && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${cardClass} w-full max-w-md p-6`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.timeEntry.writeDownEntry', 'Write Down Entry')}</h3>
                <button onClick={() => setShowWriteDownModal(false)} className="p-1 hover:bg-gray-200 rounded">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.timeEntry.originalAmount', 'Original Amount')}</div>
                  <div className="text-xl font-bold">{formatCurrency(writeDownEntry.originalAmount)}</div>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.timeEntry.writeDownAmount', 'Write-Down Amount')}</label>
                  <input
                    type="number"
                    value={writeDownAmount}
                    onChange={(e) => setWriteDownAmount(parseFloat(e.target.value) || 0)}
                    max={writeDownEntry.originalAmount}
                    min={0}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.timeEntry.reason', 'Reason')}</label>
                  <textarea
                    value={writeDownReason}
                    onChange={(e) => setWriteDownReason(e.target.value)}
                    className={inputClass}
                    rows={2}
                    placeholder={t('tools.timeEntry.reasonForWriteDown', 'Reason for write-down...')}
                  />
                </div>
                <div className={`p-3 rounded-lg ${isDark ? 'bg-green-900/20' : 'bg-green-50'}`}>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.timeEntry.newAmount', 'New Amount')}</div>
                  <div className="text-xl font-bold text-green-500">{formatCurrency(Math.max(0, writeDownEntry.originalAmount - writeDownAmount))}</div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setShowWriteDownModal(false)} className={`${buttonSecondary} flex-1`}>{t('tools.timeEntry.cancel', 'Cancel')}</button>
                  <button onClick={handleWriteDown} className={`${buttonPrimary} flex-1`}>{t('tools.timeEntry.applyWriteDown', 'Apply Write-Down')}</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Template Modal */}
        {showTemplateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${cardClass} w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col`}>
              <div className={`p-4 border-b flex items-center justify-between ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.timeEntry.narrativeTemplates', 'Narrative Templates')}</h3>
                <button onClick={() => setShowTemplateModal(false)} className="p-1 hover:bg-gray-200 rounded">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <div className="grid gap-3">
                  {templates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handleInsertTemplate(template)}
                      className={`text-left p-4 rounded-lg transition-colors ${isDark ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{template.name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded ${isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
                          {template.activityCode}
                        </span>
                      </div>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{template.text}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Info Footer */}
        <div className={`mt-6 p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h3 className={`text-sm font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.timeEntry.aboutTimeEntry', 'About Time Entry')}</h3>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Track attorney time with UTBMS/LEDES compliant billing codes. Features include start/stop timer,
            block billing breakdown, configurable minimum increments, write-down tracking, and comprehensive
            billing analytics. Export entries for pre-billing review in multiple formats.
          </p>
        </div>
      </div>
      <ConfirmDialog />
    </div>
  );
};

export default TimeEntryTool;
