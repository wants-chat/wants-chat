'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  Clock,
  Plus,
  Trash2,
  Save,
  Edit,
  Calendar,
  DollarSign,
  User,
  Building2,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  Play,
  Pause,
  StopCircle,
  X,
  Sparkles,
  Timer,
  FileText,
  TrendingUp,
  Briefcase,
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
  copyToClipboard as copyUtil,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';

interface ConsultantTimeToolProps {
  uiConfig?: UIConfig;
}

import { useTheme } from '@/contexts/ThemeContext';

// Types
interface Consultant {
  id: string;
  name: string;
  email: string;
  role: string;
  hourlyRate: number;
  department: string;
}

interface Project {
  id: string;
  name: string;
  clientName: string;
  clientCompany: string;
  status: 'active' | 'completed' | 'on-hold';
  budgetHours: number;
  startDate: string;
  endDate: string;
}

interface TimeEntry {
  id: string;
  consultantId: string;
  consultantName: string;
  projectId: string;
  projectName: string;
  clientCompany: string;
  date: string;
  startTime: string;
  endTime: string;
  hours: number;
  description: string;
  taskCategory: 'meeting' | 'research' | 'analysis' | 'documentation' | 'implementation' | 'review' | 'travel' | 'admin';
  billable: boolean;
  status: 'draft' | 'submitted' | 'approved' | 'invoiced';
  hourlyRate: number;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

// Constants
const TASK_CATEGORIES = [
  { value: 'meeting', label: 'Client Meeting' },
  { value: 'research', label: 'Research' },
  { value: 'analysis', label: 'Analysis' },
  { value: 'documentation', label: 'Documentation' },
  { value: 'implementation', label: 'Implementation' },
  { value: 'review', label: 'Review' },
  { value: 'travel', label: 'Travel' },
  { value: 'admin', label: 'Administrative' },
];

const STATUS_COLORS = {
  draft: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-700 dark:text-gray-300', icon: Edit },
  submitted: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', icon: Clock },
  approved: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', icon: CheckCircle },
  invoiced: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400', icon: FileText },
};

const CATEGORY_COLORS: Record<string, string> = {
  meeting: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  research: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  analysis: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  documentation: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  implementation: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  review: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  travel: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  admin: 'bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-300',
};

// Column configuration for exports
const TIME_ENTRY_COLUMNS: ColumnConfig[] = [
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'consultantName', header: 'Consultant', type: 'string' },
  { key: 'projectName', header: 'Project', type: 'string' },
  { key: 'clientCompany', header: 'Client', type: 'string' },
  { key: 'hours', header: 'Hours', type: 'number' },
  { key: 'taskCategory', header: 'Category', type: 'string' },
  { key: 'description', header: 'Description', type: 'string' },
  { key: 'billable', header: 'Billable', type: 'boolean' },
  { key: 'totalAmount', header: 'Amount', type: 'currency' },
  { key: 'status', header: 'Status', type: 'string' },
];

const CONSULTANT_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Name', type: 'string' },
  { key: 'email', header: 'Email', type: 'string' },
  { key: 'role', header: 'Role', type: 'string' },
  { key: 'department', header: 'Department', type: 'string' },
  { key: 'hourlyRate', header: 'Hourly Rate', type: 'currency' },
];

const PROJECT_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Project Name', type: 'string' },
  { key: 'clientCompany', header: 'Client', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'budgetHours', header: 'Budget Hours', type: 'number' },
];

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString: string) => {
  if (!dateString) return 'Not set';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatTime = (timeString: string) => {
  if (!timeString) return '';
  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

const calculateHours = (startTime: string, endTime: string): number => {
  if (!startTime || !endTime) return 0;
  const [startHours, startMinutes] = startTime.split(':').map(Number);
  const [endHours, endMinutes] = endTime.split(':').map(Number);
  const startTotal = startHours * 60 + startMinutes;
  const endTotal = endHours * 60 + endMinutes;
  return Math.max(0, (endTotal - startTotal) / 60);
};

// Main Component
export const ConsultantTimeTool: React.FC<ConsultantTimeToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const [isPrefilled, setIsPrefilled] = useState(false);
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // useToolData hooks for backend sync
  const {
    data: timeEntries,
    addItem: addTimeEntryToBackend,
    updateItem: updateTimeEntryBackend,
    deleteItem: deleteTimeEntryBackend,
    isSynced: entriesSynced,
    isSaving: entriesSaving,
    lastSaved: entriesLastSaved,
    syncError: entriesSyncError,
    forceSync: forceEntriesSync,
  } = useToolData<TimeEntry>('consultant-time-entries', [], TIME_ENTRY_COLUMNS);

  const {
    data: consultants,
    addItem: addConsultantToBackend,
    deleteItem: deleteConsultantBackend,
  } = useToolData<Consultant>('consultant-consultants', [], CONSULTANT_COLUMNS);

  const {
    data: projects,
    addItem: addProjectToBackend,
    deleteItem: deleteProjectBackend,
  } = useToolData<Project>('consultant-projects', [], PROJECT_COLUMNS);

  // Local UI State
  const [activeTab, setActiveTab] = useState<'entries' | 'consultants' | 'projects' | 'reports'>('entries');
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [showConsultantForm, setShowConsultantForm] = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterConsultant, setFilterConsultant] = useState<string>('all');
  const [filterProject, setFilterProject] = useState<string>('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // Timer state
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerStartTime, setTimerStartTime] = useState<string>('');
  const [timerProject, setTimerProject] = useState<string>('');
  const [timerConsultant, setTimerConsultant] = useState<string>('');
  const [elapsedTime, setElapsedTime] = useState(0);

  // New entry form state
  const [newEntry, setNewEntry] = useState<Partial<TimeEntry>>({
    consultantId: '',
    projectId: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: '',
    hours: 0,
    description: '',
    taskCategory: 'meeting',
    billable: true,
    status: 'draft',
  });

  // New consultant form state
  const [newConsultant, setNewConsultant] = useState<Partial<Consultant>>({
    name: '',
    email: '',
    role: '',
    hourlyRate: 150,
    department: '',
  });

  // New project form state
  const [newProject, setNewProject] = useState<Partial<Project>>({
    name: '',
    clientName: '',
    clientCompany: '',
    status: 'active',
    budgetHours: 0,
    startDate: '',
    endDate: '',
  });

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params;
      if (params.project || params.client) {
        setNewProject({
          ...newProject,
          name: params.project || '',
          clientCompany: params.client || '',
        });
        setShowProjectForm(true);
        setIsPrefilled(true);
      }
      if (params.consultant) {
        setNewConsultant({
          ...newConsultant,
          name: params.consultant,
        });
        setShowConsultantForm(true);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Auto-calculate hours when times change
  useEffect(() => {
    if (newEntry.startTime && newEntry.endTime) {
      const hours = calculateHours(newEntry.startTime, newEntry.endTime);
      setNewEntry((prev) => ({ ...prev, hours: Math.round(hours * 100) / 100 }));
    }
  }, [newEntry.startTime, newEntry.endTime]);

  // Start timer
  const startTimer = () => {
    if (!timerConsultant || !timerProject) {
      setValidationMessage('Please select a consultant and project before starting the timer');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }
    setTimerStartTime(new Date().toTimeString().slice(0, 5));
    setIsTimerRunning(true);
    setElapsedTime(0);
  };

  // Stop timer and create entry
  const stopTimer = () => {
    setIsTimerRunning(false);
    const endTime = new Date().toTimeString().slice(0, 5);
    const hours = calculateHours(timerStartTime, endTime);
    const consultant = consultants.find((c) => c.id === timerConsultant);
    const project = projects.find((p) => p.id === timerProject);

    if (consultant && project && hours > 0) {
      const entry: TimeEntry = {
        id: generateId(),
        consultantId: timerConsultant,
        consultantName: consultant.name,
        projectId: timerProject,
        projectName: project.name,
        clientCompany: project.clientCompany,
        date: new Date().toISOString().split('T')[0],
        startTime: timerStartTime,
        endTime,
        hours: Math.round(hours * 100) / 100,
        description: '',
        taskCategory: 'meeting',
        billable: true,
        status: 'draft',
        hourlyRate: consultant.hourlyRate,
        totalAmount: Math.round(hours * consultant.hourlyRate),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      addTimeEntryToBackend(entry);
    }

    setTimerStartTime('');
    setElapsedTime(0);
  };

  // Format elapsed time
  const formatElapsedTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Add time entry
  const addTimeEntry = () => {
    if (!newEntry.consultantId || !newEntry.projectId || !newEntry.date) {
      setValidationMessage('Please select a consultant, project, and date');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const consultant = consultants.find((c) => c.id === newEntry.consultantId);
    const project = projects.find((p) => p.id === newEntry.projectId);
    const hours = newEntry.hours || 0;
    const hourlyRate = consultant?.hourlyRate || 0;

    const entry: TimeEntry = {
      id: generateId(),
      consultantId: newEntry.consultantId || '',
      consultantName: consultant?.name || '',
      projectId: newEntry.projectId || '',
      projectName: project?.name || '',
      clientCompany: project?.clientCompany || '',
      date: newEntry.date || '',
      startTime: newEntry.startTime || '',
      endTime: newEntry.endTime || '',
      hours,
      description: newEntry.description || '',
      taskCategory: newEntry.taskCategory || 'meeting',
      billable: newEntry.billable !== false,
      status: 'draft',
      hourlyRate,
      totalAmount: Math.round(hours * hourlyRate * (newEntry.billable !== false ? 1 : 0)),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addTimeEntryToBackend(entry);
    setShowEntryForm(false);
    resetEntryForm();
  };

  // Reset entry form
  const resetEntryForm = () => {
    setNewEntry({
      consultantId: '',
      projectId: '',
      date: new Date().toISOString().split('T')[0],
      startTime: '',
      endTime: '',
      hours: 0,
      description: '',
      taskCategory: 'meeting',
      billable: true,
      status: 'draft',
    });
  };

  // Add consultant
  const addConsultant = () => {
    if (!newConsultant.name || !newConsultant.hourlyRate) {
      setValidationMessage('Please enter consultant name and hourly rate');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const consultant: Consultant = {
      id: generateId(),
      name: newConsultant.name || '',
      email: newConsultant.email || '',
      role: newConsultant.role || '',
      hourlyRate: newConsultant.hourlyRate || 150,
      department: newConsultant.department || '',
    };

    addConsultantToBackend(consultant);
    setShowConsultantForm(false);
    setNewConsultant({ name: '', email: '', role: '', hourlyRate: 150, department: '' });
  };

  // Add project
  const addProject = () => {
    if (!newProject.name || !newProject.clientCompany) {
      setValidationMessage('Please enter project name and client');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const project: Project = {
      id: generateId(),
      name: newProject.name || '',
      clientName: newProject.clientName || '',
      clientCompany: newProject.clientCompany || '',
      status: 'active',
      budgetHours: newProject.budgetHours || 0,
      startDate: newProject.startDate || '',
      endDate: newProject.endDate || '',
    };

    addProjectToBackend(project);
    setShowProjectForm(false);
    setNewProject({ name: '', clientName: '', clientCompany: '', status: 'active', budgetHours: 0, startDate: '', endDate: '' });
  };

  // Delete time entry
  const deleteTimeEntry = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Time Entry',
      message: 'Are you sure you want to delete this time entry? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteTimeEntryBackend(id);
    }
  };

  // Update entry status
  const updateEntryStatus = (entryId: string, status: TimeEntry['status']) => {
    updateTimeEntryBackend(entryId, { status, updatedAt: new Date().toISOString() });
  };

  // Filtered entries
  const filteredEntries = useMemo(() => {
    return timeEntries.filter((entry) => {
      const matchesSearch =
        searchTerm === '' ||
        entry.consultantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || entry.status === filterStatus;
      const matchesConsultant = filterConsultant === 'all' || entry.consultantId === filterConsultant;
      const matchesProject = filterProject === 'all' || entry.projectId === filterProject;
      const matchesDateStart = !dateRange.start || entry.date >= dateRange.start;
      const matchesDateEnd = !dateRange.end || entry.date <= dateRange.end;
      return matchesSearch && matchesStatus && matchesConsultant && matchesProject && matchesDateStart && matchesDateEnd;
    });
  }, [timeEntries, searchTerm, filterStatus, filterConsultant, filterProject, dateRange]);

  // Stats
  const stats = useMemo(() => {
    const totalHours = timeEntries.reduce((sum, e) => sum + e.hours, 0);
    const billableHours = timeEntries.filter((e) => e.billable).reduce((sum, e) => sum + e.hours, 0);
    const totalRevenue = timeEntries.filter((e) => e.status === 'invoiced').reduce((sum, e) => sum + e.totalAmount, 0);
    const pendingRevenue = timeEntries.filter((e) => e.status !== 'invoiced' && e.billable).reduce((sum, e) => sum + e.totalAmount, 0);
    const utilizationRate = totalHours > 0 ? (billableHours / totalHours) * 100 : 0;
    return { totalHours, billableHours, totalRevenue, pendingRevenue, utilizationRate };
  }, [timeEntries]);

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.consultantTime.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.consultantTime.consultantTimeTracker', 'Consultant Time Tracker')}
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.consultantTime.trackBillableHoursAndGenerate', 'Track billable hours and generate invoices')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="consultant-time" toolName="Consultant Time" />

              <SyncStatus
                isSynced={entriesSynced}
                isSaving={entriesSaving}
                lastSaved={entriesLastSaved}
                syncError={entriesSyncError}
                onForceSync={forceEntriesSync}
                theme={theme}
                showLabel={true}
                size="md"
              />
              <ExportDropdown
                onExportCSV={() => {
                  exportToCSV(timeEntries, TIME_ENTRY_COLUMNS, { filename: 'time-entries' });
                }}
                onExportExcel={() => {
                  exportToExcel(timeEntries, TIME_ENTRY_COLUMNS, { filename: 'time-entries' });
                }}
                onExportJSON={() => {
                  exportToJSON(timeEntries, { filename: 'time-entries' });
                }}
                onExportPDF={async () => {
                  await exportToPDF(timeEntries, TIME_ENTRY_COLUMNS, {
                    filename: 'time-entries',
                    title: 'Consultant Time Report',
                    subtitle: `${stats.totalHours.toFixed(1)} hours | ${formatCurrency(stats.totalRevenue)} revenue`,
                  });
                }}
                onPrint={() => {
                  printData(timeEntries, TIME_ENTRY_COLUMNS, { title: 'Time Entries' });
                }}
                onCopyToClipboard={async () => {
                  return await copyUtil(timeEntries, TIME_ENTRY_COLUMNS, 'tab');
                }}
                showImport={false}
                theme={theme}
              />
            </div>
          </div>

          {/* Timer */}
          <div className={`p-4 rounded-lg mb-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Timer className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                <select
                  value={timerConsultant}
                  onChange={(e) => setTimerConsultant(e.target.value)}
                  disabled={isTimerRunning}
                  className={`px-3 py-2 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="">{t('tools.consultantTime.selectConsultant', 'Select Consultant')}</option>
                  {consultants.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <select
                  value={timerProject}
                  onChange={(e) => setTimerProject(e.target.value)}
                  disabled={isTimerRunning}
                  className={`px-3 py-2 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="">{t('tools.consultantTime.selectProject', 'Select Project')}</option>
                  {projects.filter((p) => p.status === 'active').map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-4">
                <span className={`text-2xl font-mono font-bold ${isTimerRunning ? 'text-[#0D9488]' : theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {formatElapsedTime(elapsedTime)}
                </span>
                {!isTimerRunning ? (
                  <button
                    onClick={startTimer}
                    className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7A6E] transition-colors"
                  >
                    <Play className="w-4 h-4" />
                    {t('tools.consultantTime.start', 'Start')}
                  </button>
                ) : (
                  <button
                    onClick={stopTimer}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <StopCircle className="w-4 h-4" />
                    {t('tools.consultantTime.stop', 'Stop')}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.consultantTime.totalHours', 'Total Hours')}</p>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stats.totalHours.toFixed(1)}</p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.consultantTime.billableHours', 'Billable Hours')}</p>
              <p className={`text-2xl font-bold text-green-600`}>{stats.billableHours.toFixed(1)}</p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.consultantTime.utilization', 'Utilization')}</p>
              <p className={`text-2xl font-bold ${stats.utilizationRate >= 70 ? 'text-green-600' : 'text-orange-600'}`}>{stats.utilizationRate.toFixed(0)}%</p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.consultantTime.invoiced', 'Invoiced')}</p>
              <p className={`text-2xl font-bold text-[#0D9488]`}>{formatCurrency(stats.totalRevenue)}</p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.consultantTime.pending', 'Pending')}</p>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(stats.pendingRevenue)}</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'entries', label: 'Time Entries', icon: <Clock className="w-4 h-4" /> },
              { id: 'consultants', label: 'Consultants', icon: <User className="w-4 h-4" /> },
              { id: 'projects', label: 'Projects', icon: <Briefcase className="w-4 h-4" /> },
              { id: 'reports', label: 'Reports', icon: <TrendingUp className="w-4 h-4" /> },
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

        {/* Entries Tab */}
        {activeTab === 'entries' && (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            {/* Filters */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex flex-wrap items-center gap-4">
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                  <input
                    type="text"
                    placeholder={t('tools.consultantTime.search', 'Search...')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`pl-10 pr-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className={`px-4 py-2 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="all">{t('tools.consultantTime.allStatus', 'All Status')}</option>
                  <option value="draft">{t('tools.consultantTime.draft', 'Draft')}</option>
                  <option value="submitted">{t('tools.consultantTime.submitted', 'Submitted')}</option>
                  <option value="approved">{t('tools.consultantTime.approved', 'Approved')}</option>
                  <option value="invoiced">{t('tools.consultantTime.invoiced2', 'Invoiced')}</option>
                </select>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className={`px-4 py-2 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
                <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>to</span>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className={`px-4 py-2 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              <button
                onClick={() => setShowEntryForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7A6E] transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t('tools.consultantTime.addEntry', 'Add Entry')}
              </button>
            </div>

            {/* Entries List */}
            <div className="space-y-3">
              {filteredEntries.length === 0 ? (
                <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{t('tools.consultantTime.noTimeEntriesFound', 'No time entries found')}</p>
                </div>
              ) : (
                filteredEntries.map((entry) => {
                  const StatusIcon = STATUS_COLORS[entry.status].icon;
                  return (
                    <div
                      key={entry.id}
                      className={`p-4 rounded-lg border ${
                        theme === 'dark' ? 'border-gray-700 hover:bg-gray-700/50' : 'border-gray-200 hover:bg-gray-50'
                      } transition-colors`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {formatDate(entry.date)}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${CATEGORY_COLORS[entry.taskCategory]}`}>
                              {TASK_CATEGORIES.find((c) => c.value === entry.taskCategory)?.label}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${STATUS_COLORS[entry.status].bg} ${STATUS_COLORS[entry.status].text}`}>
                              <StatusIcon className="w-3 h-3" />
                              {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                            </span>
                            {!entry.billable && (
                              <span className="px-2 py-0.5 rounded text-xs bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-gray-300">
                                {t('tools.consultantTime.nonBillable', 'Non-billable')}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-sm">
                            <span className={`flex items-center gap-1 font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              <User className="w-4 h-4" />
                              {entry.consultantName}
                            </span>
                            <span className={`flex items-center gap-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              <Briefcase className="w-4 h-4" />
                              {entry.projectName}
                            </span>
                            <span className={`flex items-center gap-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              <Building2 className="w-4 h-4" />
                              {entry.clientCompany}
                            </span>
                            {entry.startTime && entry.endTime && (
                              <span className={`flex items-center gap-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                <Clock className="w-4 h-4" />
                                {formatTime(entry.startTime)} - {formatTime(entry.endTime)}
                              </span>
                            )}
                          </div>
                          {entry.description && (
                            <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {entry.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {entry.hours.toFixed(1)}h
                            </p>
                            {entry.billable && (
                              <p className="text-sm text-[#0D9488] font-medium">
                                {formatCurrency(entry.totalAmount)}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {entry.status === 'draft' && (
                              <button
                                onClick={() => updateEntryStatus(entry.id, 'submitted')}
                                className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                title={t('tools.consultantTime.submit', 'Submit')}
                              >
                                <Clock className="w-4 h-4" />
                              </button>
                            )}
                            {entry.status === 'submitted' && (
                              <button
                                onClick={() => updateEntryStatus(entry.id, 'approved')}
                                className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                                title={t('tools.consultantTime.approve', 'Approve')}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => deleteTimeEntry(entry.id)}
                              className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Consultants Tab */}
        {activeTab === 'consultants' && (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Consultants ({consultants.length})
              </h2>
              <button
                onClick={() => setShowConsultantForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7A6E] transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t('tools.consultantTime.addConsultant', 'Add Consultant')}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {consultants.map((consultant) => {
                const consultantHours = timeEntries.filter((e) => e.consultantId === consultant.id).reduce((sum, e) => sum + e.hours, 0);
                const consultantRevenue = timeEntries.filter((e) => e.consultantId === consultant.id && e.billable).reduce((sum, e) => sum + e.totalAmount, 0);

                return (
                  <div
                    key={consultant.id}
                    className={`p-4 rounded-lg border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {consultant.name}
                        </h3>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {consultant.role || 'Consultant'}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteConsultantBackend(consultant.id)}
                        className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className={`text-sm space-y-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      <p>{formatCurrency(consultant.hourlyRate)}/hr</p>
                      <p>{consultantHours.toFixed(1)} hours logged</p>
                      <p className="text-[#0D9488] font-medium">{formatCurrency(consultantRevenue)} revenue</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Projects Tab */}
        {activeTab === 'projects' && (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Projects ({projects.length})
              </h2>
              <button
                onClick={() => setShowProjectForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7A6E] transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t('tools.consultantTime.addProject', 'Add Project')}
              </button>
            </div>

            <div className="space-y-4">
              {projects.map((project) => {
                const projectHours = timeEntries.filter((e) => e.projectId === project.id).reduce((sum, e) => sum + e.hours, 0);
                const budgetUsed = project.budgetHours > 0 ? (projectHours / project.budgetHours) * 100 : 0;

                return (
                  <div
                    key={project.id}
                    className={`p-4 rounded-lg border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {project.name}
                        </h3>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {project.clientCompany}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          project.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          project.status === 'completed' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                          'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300'
                        }`}>
                          {project.status}
                        </span>
                        <button
                          onClick={() => deleteProjectBackend(project.id)}
                          className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {project.budgetHours > 0 && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                            {projectHours.toFixed(1)} / {project.budgetHours} hours
                          </span>
                          <span className={`font-medium ${budgetUsed > 100 ? 'text-red-600' : budgetUsed > 80 ? 'text-orange-600' : 'text-green-600'}`}>
                            {budgetUsed.toFixed(0)}%
                          </span>
                        </div>
                        <div className={`h-2 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                          <div
                            className={`h-2 rounded-full ${budgetUsed > 100 ? 'bg-red-500' : budgetUsed > 80 ? 'bg-orange-500' : 'bg-green-500'}`}
                            style={{ width: `${Math.min(budgetUsed, 100)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <h2 className={`text-lg font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.consultantTime.timeRevenueReports', 'Time & Revenue Reports')}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* By Consultant */}
              <div>
                <h3 className={`font-medium mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.consultantTime.byConsultant', 'By Consultant')}</h3>
                <div className="space-y-3">
                  {consultants.map((consultant) => {
                    const hours = timeEntries.filter((e) => e.consultantId === consultant.id).reduce((sum, e) => sum + e.hours, 0);
                    const revenue = timeEntries.filter((e) => e.consultantId === consultant.id && e.billable).reduce((sum, e) => sum + e.totalAmount, 0);
                    return (
                      <div key={consultant.id} className={`flex items-center justify-between p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{consultant.name}</span>
                        <div className="text-right">
                          <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{hours.toFixed(1)}h</p>
                          <p className="text-sm text-[#0D9488]">{formatCurrency(revenue)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* By Project */}
              <div>
                <h3 className={`font-medium mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.consultantTime.byProject', 'By Project')}</h3>
                <div className="space-y-3">
                  {projects.map((project) => {
                    const hours = timeEntries.filter((e) => e.projectId === project.id).reduce((sum, e) => sum + e.hours, 0);
                    const revenue = timeEntries.filter((e) => e.projectId === project.id && e.billable).reduce((sum, e) => sum + e.totalAmount, 0);
                    return (
                      <div key={project.id} className={`flex items-center justify-between p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <div>
                          <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{project.name}</span>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{project.clientCompany}</p>
                        </div>
                        <div className="text-right">
                          <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{hours.toFixed(1)}h</p>
                          <p className="text-sm text-[#0D9488]">{formatCurrency(revenue)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* New Entry Form Modal */}
        {showEntryForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto`}>
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.consultantTime.newTimeEntry', 'New Time Entry')}
                  </h2>
                  <button onClick={() => setShowEntryForm(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.consultantTime.consultant', 'Consultant *')}
                    </label>
                    <select
                      value={newEntry.consultantId}
                      onChange={(e) => setNewEntry({ ...newEntry, consultantId: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="">{t('tools.consultantTime.select', 'Select...')}</option>
                      {consultants.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.consultantTime.project', 'Project *')}
                    </label>
                    <select
                      value={newEntry.projectId}
                      onChange={(e) => setNewEntry({ ...newEntry, projectId: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="">{t('tools.consultantTime.select2', 'Select...')}</option>
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.consultantTime.date', 'Date *')}
                    </label>
                    <input
                      type="date"
                      value={newEntry.date}
                      onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.consultantTime.startTime', 'Start Time')}
                    </label>
                    <input
                      type="time"
                      value={newEntry.startTime}
                      onChange={(e) => setNewEntry({ ...newEntry, startTime: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.consultantTime.endTime', 'End Time')}
                    </label>
                    <input
                      type="time"
                      value={newEntry.endTime}
                      onChange={(e) => setNewEntry({ ...newEntry, endTime: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.consultantTime.hours', 'Hours')}
                    </label>
                    <input
                      type="number"
                      step="0.25"
                      value={newEntry.hours}
                      onChange={(e) => setNewEntry({ ...newEntry, hours: parseFloat(e.target.value) || 0 })}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.consultantTime.category', 'Category')}
                    </label>
                    <select
                      value={newEntry.taskCategory}
                      onChange={(e) => setNewEntry({ ...newEntry, taskCategory: e.target.value as TimeEntry['taskCategory'] })}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      {TASK_CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.consultantTime.description', 'Description')}
                  </label>
                  <textarea
                    value={newEntry.description}
                    onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
                    rows={3}
                    placeholder={t('tools.consultantTime.whatDidYouWorkOn', 'What did you work on?')}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newEntry.billable}
                    onChange={(e) => setNewEntry({ ...newEntry, billable: e.target.checked })}
                    className="rounded text-[#0D9488]"
                  />
                  <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{t('tools.consultantTime.billable', 'Billable')}</span>
                </label>
              </div>
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                <button
                  onClick={() => setShowEntryForm(false)}
                  className={`px-4 py-2 rounded-lg ${
                    theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {t('tools.consultantTime.cancel', 'Cancel')}
                </button>
                <button
                  onClick={addTimeEntry}
                  className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7A6E] transition-colors"
                >
                  {t('tools.consultantTime.addEntry2', 'Add Entry')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* New Consultant Form Modal */}
        {showConsultantForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-md w-full`}>
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.consultantTime.addConsultant2', 'Add Consultant')}
                  </h2>
                  <button onClick={() => setShowConsultantForm(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.consultantTime.name', 'Name *')}
                  </label>
                  <input
                    type="text"
                    value={newConsultant.name}
                    onChange={(e) => setNewConsultant({ ...newConsultant, name: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.consultantTime.role', 'Role')}
                  </label>
                  <input
                    type="text"
                    value={newConsultant.role}
                    onChange={(e) => setNewConsultant({ ...newConsultant, role: e.target.value })}
                    placeholder={t('tools.consultantTime.eGSeniorConsultant', 'e.g., Senior Consultant')}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.consultantTime.hourlyRate', 'Hourly Rate ($) *')}
                  </label>
                  <input
                    type="number"
                    value={newConsultant.hourlyRate}
                    onChange={(e) => setNewConsultant({ ...newConsultant, hourlyRate: parseFloat(e.target.value) || 0 })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                <button
                  onClick={() => setShowConsultantForm(false)}
                  className={`px-4 py-2 rounded-lg ${
                    theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {t('tools.consultantTime.cancel2', 'Cancel')}
                </button>
                <button
                  onClick={addConsultant}
                  className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7A6E] transition-colors"
                >
                  {t('tools.consultantTime.addConsultant3', 'Add Consultant')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* New Project Form Modal */}
        {showProjectForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-md w-full`}>
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.consultantTime.addProject2', 'Add Project')}
                  </h2>
                  <button onClick={() => setShowProjectForm(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.consultantTime.projectName', 'Project Name *')}
                  </label>
                  <input
                    type="text"
                    value={newProject.name}
                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.consultantTime.clientCompany', 'Client Company *')}
                  </label>
                  <input
                    type="text"
                    value={newProject.clientCompany}
                    onChange={(e) => setNewProject({ ...newProject, clientCompany: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.consultantTime.budgetHours', 'Budget Hours')}
                  </label>
                  <input
                    type="number"
                    value={newProject.budgetHours}
                    onChange={(e) => setNewProject({ ...newProject, budgetHours: parseFloat(e.target.value) || 0 })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                <button
                  onClick={() => setShowProjectForm(false)}
                  className={`px-4 py-2 rounded-lg ${
                    theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {t('tools.consultantTime.cancel3', 'Cancel')}
                </button>
                <button
                  onClick={addProject}
                  className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7A6E] transition-colors"
                >
                  {t('tools.consultantTime.addProject3', 'Add Project')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Validation Message Toast */}
        {validationMessage && (
          <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-in fade-in slide-in-from-bottom-4">
            <AlertCircle className="w-4 h-4" />
            <span>{validationMessage}</span>
          </div>
        )}

        {/* Confirm Dialog */}
        <ConfirmDialog />
      </div>
    </div>
  );
};

export default ConsultantTimeTool;
