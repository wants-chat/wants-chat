'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Check,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  AlertCircle,
  Bell,
  RefreshCw,
  Sparkles,
  Home,
  Building,
  Repeat,
  User,
  Phone,
  Mail,
  ClipboardList,
} from 'lucide-react';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CleaningScheduleToolProps {
  uiConfig?: UIConfig;
}

// Types
interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
}

interface Job {
  id: string;
  clientId: string;
  propertyAddress: string;
  propertyType: 'residential' | 'commercial' | 'industrial';
  serviceType: 'standard' | 'deep' | 'move-in' | 'move-out' | 'post-construction';
  frequency: 'one-time' | 'daily' | 'weekly' | 'bi-weekly' | 'monthly';
  scheduledDate: string;
  scheduledTime: string;
  estimatedDuration: number;
  assignedCrew: string[];
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'rescheduled';
  notes: string;
  priority: 'normal' | 'high' | 'urgent';
  createdAt: string;
  completedAt?: string;
}

interface CrewMember {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: 'cleaner' | 'supervisor' | 'team-lead';
  availability: string[];
  skills: string[];
}

// Column configurations for export
const JOB_COLUMNS: ColumnConfig[] = [
  { key: 'clientName', header: 'Client', type: 'string' },
  { key: 'propertyAddress', header: 'Address', type: 'string' },
  { key: 'propertyType', header: 'Property Type', type: 'string' },
  { key: 'serviceType', header: 'Service Type', type: 'string' },
  { key: 'frequency', header: 'Frequency', type: 'string' },
  { key: 'scheduledDate', header: 'Date', type: 'date' },
  { key: 'scheduledTime', header: 'Time', type: 'string' },
  { key: 'estimatedDuration', header: 'Duration (hrs)', type: 'number' },
  { key: 'assignedCrewNames', header: 'Assigned Crew', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'priority', header: 'Priority', type: 'string' },
];

const CLIENT_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Name', type: 'string' },
  { key: 'email', header: 'Email', type: 'string' },
  { key: 'phone', header: 'Phone', type: 'string' },
  { key: 'address', header: 'Address', type: 'string' },
  { key: 'notes', header: 'Notes', type: 'string' },
];

const CREW_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Name', type: 'string' },
  { key: 'phone', header: 'Phone', type: 'string' },
  { key: 'email', header: 'Email', type: 'string' },
  { key: 'role', header: 'Role', type: 'string' },
  { key: 'availability', header: 'Availability', type: 'string' },
  { key: 'skills', header: 'Skills', type: 'string' },
];

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatTime = (time: string) => {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

const getStatusColor = (status: Job['status'], theme: string) => {
  const colors: Record<Job['status'], string> = {
    scheduled: theme === 'dark' ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-800',
    'in-progress': theme === 'dark' ? 'bg-yellow-900/50 text-yellow-300' : 'bg-yellow-100 text-yellow-800',
    completed: theme === 'dark' ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-800',
    cancelled: theme === 'dark' ? 'bg-red-900/50 text-red-300' : 'bg-red-100 text-red-800',
    rescheduled: theme === 'dark' ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-800',
  };
  return colors[status];
};

const getPriorityColor = (priority: Job['priority'], theme: string) => {
  const colors: Record<Job['priority'], string> = {
    normal: theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700',
    high: theme === 'dark' ? 'bg-orange-900/50 text-orange-300' : 'bg-orange-100 text-orange-800',
    urgent: theme === 'dark' ? 'bg-red-900/50 text-red-300' : 'bg-red-100 text-red-800',
  };
  return colors[priority];
};

// Days of week for availability
const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Main Component
export const CleaningScheduleTool: React.FC<CleaningScheduleToolProps> = ({ uiConfig }) => {
  const [isPrefilled, setIsPrefilled] = useState(false);
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // useToolData hooks for backend sync
  const {
    data: jobs,
    addItem: addJobToBackend,
    updateItem: updateJobBackend,
    deleteItem: deleteJobBackend,
    isSynced: jobsSynced,
    isSaving: jobsSaving,
    lastSaved: jobsLastSaved,
    syncError: jobsSyncError,
    forceSync: forceJobsSync,
  } = useToolData<Job>('cleaning-schedule-jobs', [], JOB_COLUMNS);

  const {
    data: clients,
    addItem: addClientToBackend,
    updateItem: updateClientBackend,
    deleteItem: deleteClientBackend,
  } = useToolData<Client>('cleaning-schedule-clients', [], CLIENT_COLUMNS);

  const {
    data: crew,
    addItem: addCrewToBackend,
    updateItem: updateCrewBackend,
    deleteItem: deleteCrewBackend,
  } = useToolData<CrewMember>('cleaning-schedule-crew', [], CREW_COLUMNS);

  // Local UI State
  const [activeTab, setActiveTab] = useState<'schedule' | 'clients' | 'crew'>('schedule');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
  const [showJobForm, setShowJobForm] = useState(false);
  const [showClientForm, setShowClientForm] = useState(false);
  const [showCrewForm, setShowCrewForm] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [editingCrew, setEditingCrew] = useState<CrewMember | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  // Form states
  const [newJob, setNewJob] = useState<Partial<Job>>({
    clientId: '',
    propertyAddress: '',
    propertyType: 'residential',
    serviceType: 'standard',
    frequency: 'one-time',
    scheduledDate: new Date().toISOString().split('T')[0],
    scheduledTime: '09:00',
    estimatedDuration: 2,
    assignedCrew: [],
    status: 'scheduled',
    notes: '',
    priority: 'normal',
  });

  const [newClient, setNewClient] = useState<Partial<Client>>({
    name: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
  });

  const [newCrew, setNewCrew] = useState<Partial<CrewMember>>({
    name: '',
    phone: '',
    email: '',
    role: 'cleaner',
    availability: [],
    skills: [],
  });

  // Prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.client || params.address) {
        setNewJob({
          ...newJob,
          propertyAddress: params.address || '',
        });
        if (params.client) {
          setNewClient({
            ...newClient,
            name: params.client || '',
          });
        }
        setShowJobForm(true);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Get week dates
  const getWeekDates = (date: Date) => {
    const week = [];
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay() + 1);
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const weekDates = useMemo(() => getWeekDates(currentDate), [currentDate]);

  // Filter jobs
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const client = clients.find((c) => c.id === job.clientId);
      const searchMatch =
        searchTerm === '' ||
        job.propertyAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client?.name.toLowerCase().includes(searchTerm.toLowerCase());
      const statusMatch = filterStatus === 'all' || job.status === filterStatus;
      const priorityMatch = filterPriority === 'all' || job.priority === filterPriority;
      return searchMatch && statusMatch && priorityMatch;
    });
  }, [jobs, clients, searchTerm, filterStatus, filterPriority]);

  // Jobs for current week
  const weekJobs = useMemo(() => {
    const startDate = weekDates[0].toISOString().split('T')[0];
    const endDate = weekDates[6].toISOString().split('T')[0];
    return filteredJobs.filter((job) => job.scheduledDate >= startDate && job.scheduledDate <= endDate);
  }, [filteredJobs, weekDates]);

  // Today's jobs
  const todaysJobs = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return filteredJobs.filter((job) => job.scheduledDate === today);
  }, [filteredJobs]);

  // Upcoming jobs (next 7 days)
  const upcomingJobs = useMemo(() => {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    return filteredJobs.filter((job) => {
      const jobDate = new Date(job.scheduledDate);
      return jobDate >= today && jobDate <= nextWeek && job.status === 'scheduled';
    }).sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate));
  }, [filteredJobs]);

  // Add job
  const addJob = () => {
    if (!newJob.clientId || !newJob.propertyAddress || !newJob.scheduledDate) {
      setValidationMessage('Please fill in required fields');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const job: Job = {
      id: generateId(),
      clientId: newJob.clientId || '',
      propertyAddress: newJob.propertyAddress || '',
      propertyType: newJob.propertyType || 'residential',
      serviceType: newJob.serviceType || 'standard',
      frequency: newJob.frequency || 'one-time',
      scheduledDate: newJob.scheduledDate || '',
      scheduledTime: newJob.scheduledTime || '09:00',
      estimatedDuration: newJob.estimatedDuration || 2,
      assignedCrew: newJob.assignedCrew || [],
      status: newJob.status || 'scheduled',
      notes: newJob.notes || '',
      priority: newJob.priority || 'normal',
      createdAt: new Date().toISOString(),
    };

    addJobToBackend(job);
    setShowJobForm(false);
    resetJobForm();
  };

  // Update job
  const updateJob = () => {
    if (!editingJob) return;
    updateJobBackend(editingJob.id, editingJob);
    setEditingJob(null);
  };

  // Delete job
  const deleteJob = async (jobId: string) => {
    const confirmed = await confirm({
      title: 'Delete Job',
      message: 'Are you sure you want to delete this job?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteJobBackend(jobId);
    }
  };

  // Add client
  const addClient = () => {
    if (!newClient.name) {
      setValidationMessage('Please enter a client name');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const client: Client = {
      id: generateId(),
      name: newClient.name || '',
      email: newClient.email || '',
      phone: newClient.phone || '',
      address: newClient.address || '',
      notes: newClient.notes || '',
    };

    addClientToBackend(client);
    setShowClientForm(false);
    setNewClient({ name: '', email: '', phone: '', address: '', notes: '' });
  };

  // Add crew member
  const addCrewMember = () => {
    if (!newCrew.name) {
      setValidationMessage('Please enter a crew member name');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const member: CrewMember = {
      id: generateId(),
      name: newCrew.name || '',
      phone: newCrew.phone || '',
      email: newCrew.email || '',
      role: newCrew.role || 'cleaner',
      availability: newCrew.availability || [],
      skills: newCrew.skills || [],
    };

    addCrewToBackend(member);
    setShowCrewForm(false);
    setNewCrew({ name: '', phone: '', email: '', role: 'cleaner', availability: [], skills: [] });
  };

  // Reset form
  const resetJobForm = () => {
    setNewJob({
      clientId: '',
      propertyAddress: '',
      propertyType: 'residential',
      serviceType: 'standard',
      frequency: 'one-time',
      scheduledDate: new Date().toISOString().split('T')[0],
      scheduledTime: '09:00',
      estimatedDuration: 2,
      assignedCrew: [],
      status: 'scheduled',
      notes: '',
      priority: 'normal',
    });
  };

  // Navigate weeks
  const navigateWeek = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + direction * 7);
    setCurrentDate(newDate);
  };

  // Get jobs for a specific date
  const getJobsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return weekJobs.filter((job) => job.scheduledDate === dateStr);
  };

  // Export data preparation
  const prepareExportData = () => {
    return jobs.map((job) => {
      const client = clients.find((c) => c.id === job.clientId);
      const crewNames = job.assignedCrew
        .map((id) => crew.find((c) => c.id === id)?.name)
        .filter(Boolean)
        .join(', ');
      return {
        ...job,
        clientName: client?.name || 'Unknown',
        assignedCrewNames: crewNames,
      };
    });
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.cleaningSchedule.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
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
                  {t('tools.cleaningSchedule.cleaningSchedule', 'Cleaning Schedule')}
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.cleaningSchedule.manageCleaningJobsClientsAnd', 'Manage cleaning jobs, clients, and crew assignments')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="cleaning-schedule" toolName="Cleaning Schedule" />

              <SyncStatus
                isSynced={jobsSynced}
                isSaving={jobsSaving}
                lastSaved={jobsLastSaved}
                syncError={jobsSyncError}
                onForceSync={forceJobsSync}
                theme={theme}
                showLabel={true}
                size="md"
              />
              <ExportDropdown
                onExportCSV={() => exportToCSV(prepareExportData(), JOB_COLUMNS, { filename: 'cleaning-schedule' })}
                onExportExcel={() => exportToExcel(prepareExportData(), JOB_COLUMNS, { filename: 'cleaning-schedule' })}
                onExportJSON={() => exportToJSON(prepareExportData(), { filename: 'cleaning-schedule' })}
                onExportPDF={async () => {
                  await exportToPDF(prepareExportData(), JOB_COLUMNS, {
                    filename: 'cleaning-schedule',
                    title: 'Cleaning Schedule Report',
                    subtitle: `${jobs.length} jobs | ${clients.length} clients | ${crew.length} crew members`,
                  });
                }}
                onPrint={() => printData(prepareExportData(), JOB_COLUMNS, { title: 'Cleaning Schedule' })}
                onCopyToClipboard={async () => await copyUtil(prepareExportData(), JOB_COLUMNS, 'tab')}
                showImport={false}
                theme={theme}
              />
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'schedule', label: 'Schedule', icon: <Calendar className="w-4 h-4" /> },
              { id: 'clients', label: 'Clients', icon: <Users className="w-4 h-4" /> },
              { id: 'crew', label: 'Crew', icon: <User className="w-4 h-4" /> },
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

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <ClipboardList className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.cleaningSchedule.todaySJobs', 'Today\'s Jobs')}</p>
                  <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {todaysJobs.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Check className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.cleaningSchedule.completed', 'Completed')}</p>
                  <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {jobs.filter((j) => j.status === 'completed').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#0D9488]/20 rounded-lg">
                  <Users className="w-5 h-5 text-[#0D9488]" />
                </div>
                <div>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.cleaningSchedule.clients', 'Clients')}</p>
                  <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {clients.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <User className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.cleaningSchedule.crew', 'Crew')}</p>
                  <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {crew.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <div className="space-y-6">
            {/* Controls */}
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 shadow`}>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigateWeek(-1)}
                    className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {formatDate(weekDates[0].toISOString())} - {formatDate(weekDates[6].toISOString())}
                  </span>
                  <button
                    onClick={() => navigateWeek(1)}
                    className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder={t('tools.cleaningSchedule.searchJobs', 'Search jobs...')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`pl-9 pr-4 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className={`px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="all">{t('tools.cleaningSchedule.allStatus', 'All Status')}</option>
                    <option value="scheduled">{t('tools.cleaningSchedule.scheduled', 'Scheduled')}</option>
                    <option value="in-progress">{t('tools.cleaningSchedule.inProgress', 'In Progress')}</option>
                    <option value="completed">{t('tools.cleaningSchedule.completed2', 'Completed')}</option>
                    <option value="cancelled">{t('tools.cleaningSchedule.cancelled', 'Cancelled')}</option>
                  </select>
                  <button
                    onClick={() => setShowJobForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90"
                  >
                    <Plus className="w-4 h-4" />
                    {t('tools.cleaningSchedule.newJob', 'New Job')}
                  </button>
                </div>
              </div>
            </div>

            {/* Week View */}
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow overflow-hidden`}>
              <div className="grid grid-cols-7 border-b">
                {weekDates.map((date, index) => {
                  const isToday = date.toDateString() === new Date().toDateString();
                  return (
                    <div
                      key={index}
                      className={`p-3 text-center border-r last:border-r-0 ${
                        isToday ? 'bg-[#0D9488]/10' : ''
                      } ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}
                    >
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {DAYS_OF_WEEK[index]}
                      </p>
                      <p
                        className={`text-lg font-semibold ${
                          isToday ? 'text-[#0D9488]' : theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        {date.getDate()}
                      </p>
                    </div>
                  );
                })}
              </div>
              <div className="grid grid-cols-7 min-h-[400px]">
                {weekDates.map((date, index) => {
                  const dayJobs = getJobsForDate(date);
                  return (
                    <div
                      key={index}
                      className={`p-2 border-r last:border-r-0 ${
                        theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                      }`}
                    >
                      {dayJobs.map((job) => {
                        const client = clients.find((c) => c.id === job.clientId);
                        return (
                          <div
                            key={job.id}
                            onClick={() => setEditingJob(job)}
                            className={`mb-2 p-2 rounded-lg cursor-pointer text-xs ${getStatusColor(
                              job.status,
                              theme
                            )}`}
                          >
                            <p className="font-medium truncate">{formatTime(job.scheduledTime)}</p>
                            <p className="truncate">{client?.name || 'Unknown'}</p>
                            <p className="truncate opacity-75">{job.propertyAddress}</p>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Upcoming Jobs */}
            <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
              <CardHeader>
                <CardTitle className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                  {t('tools.cleaningSchedule.upcomingJobsNext7Days', 'Upcoming Jobs (Next 7 Days)')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingJobs.length === 0 ? (
                  <p className={`text-center py-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.cleaningSchedule.noUpcomingJobsScheduled', 'No upcoming jobs scheduled')}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {upcomingJobs.slice(0, 5).map((job) => {
                      const client = clients.find((c) => c.id === job.clientId);
                      return (
                        <div
                          key={job.id}
                          className={`flex items-center justify-between p-3 rounded-lg ${
                            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${getPriorityColor(job.priority, theme)}`}>
                              {job.propertyType === 'commercial' ? (
                                <Building className="w-4 h-4" />
                              ) : (
                                <Home className="w-4 h-4" />
                              )}
                            </div>
                            <div>
                              <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {client?.name || 'Unknown Client'}
                              </p>
                              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                {job.propertyAddress}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {formatDate(job.scheduledDate)}
                            </p>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              {formatTime(job.scheduledTime)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Clients Tab */}
        {activeTab === 'clients' && (
          <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{t('tools.cleaningSchedule.clients2', 'Clients')}</CardTitle>
              <button
                onClick={() => setShowClientForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90"
              >
                <Plus className="w-4 h-4" />
                {t('tools.cleaningSchedule.addClient', 'Add Client')}
              </button>
            </CardHeader>
            <CardContent>
              {clients.length === 0 ? (
                <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.cleaningSchedule.noClientsYetAddYour', 'No clients yet. Add your first client to get started.')}
                </p>
              ) : (
                <div className="space-y-3">
                  {clients.map((client) => (
                    <div
                      key={client.id}
                      className={`p-4 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {client.name}
                          </h3>
                          <div className="flex items-center gap-4 mt-1">
                            {client.email && (
                              <span className={`text-sm flex items-center gap-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                <Mail className="w-3 h-3" />
                                {client.email}
                              </span>
                            )}
                            {client.phone && (
                              <span className={`text-sm flex items-center gap-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                <Phone className="w-3 h-3" />
                                {client.phone}
                              </span>
                            )}
                          </div>
                          {client.address && (
                            <p className={`text-sm mt-1 flex items-center gap-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              <MapPin className="w-3 h-3" />
                              {client.address}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingClient(client)}
                            className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteClientBackend(client.id)}
                            className="p-2 rounded-lg text-red-500 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Crew Tab */}
        {activeTab === 'crew' && (
          <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{t('tools.cleaningSchedule.crewMembers', 'Crew Members')}</CardTitle>
              <button
                onClick={() => setShowCrewForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90"
              >
                <Plus className="w-4 h-4" />
                {t('tools.cleaningSchedule.addCrewMember', 'Add Crew Member')}
              </button>
            </CardHeader>
            <CardContent>
              {crew.length === 0 ? (
                <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.cleaningSchedule.noCrewMembersYetAdd', 'No crew members yet. Add your first crew member to get started.')}
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {crew.map((member) => (
                    <div
                      key={member.id}
                      className={`p-4 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-[#0D9488]/20 rounded-full">
                            <User className="w-5 h-5 text-[#0D9488]" />
                          </div>
                          <div>
                            <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {member.name}
                            </h3>
                            <p className={`text-sm capitalize ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              {member.role.replace('-', ' ')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setEditingCrew(member)}
                            className={`p-1 rounded ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteCrewBackend(member.id)}
                            className="p-1 rounded text-red-500 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-3 space-y-1">
                        {member.phone && (
                          <p className={`text-sm flex items-center gap-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            <Phone className="w-3 h-3" />
                            {member.phone}
                          </p>
                        )}
                        {member.email && (
                          <p className={`text-sm flex items-center gap-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            <Mail className="w-3 h-3" />
                            {member.email}
                          </p>
                        )}
                      </div>
                      {member.availability.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {member.availability.map((day) => (
                            <span
                              key={day}
                              className={`px-2 py-0.5 text-xs rounded ${
                                theme === 'dark' ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
                              }`}
                            >
                              {day.substring(0, 3)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Job Form Modal */}
        {showJobForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.cleaningSchedule.newCleaningJob', 'New Cleaning Job')}
                </h2>
                <button onClick={() => { setShowJobForm(false); resetJobForm(); }} className="p-2">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.cleaningSchedule.client', 'Client *')}
                  </label>
                  <select
                    value={newJob.clientId}
                    onChange={(e) => setNewJob({ ...newJob, clientId: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  >
                    <option value="">{t('tools.cleaningSchedule.selectAClient', 'Select a client')}</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>{client.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.cleaningSchedule.propertyAddress', 'Property Address *')}
                  </label>
                  <input
                    type="text"
                    value={newJob.propertyAddress}
                    onChange={(e) => setNewJob({ ...newJob, propertyAddress: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.cleaningSchedule.propertyType', 'Property Type')}
                    </label>
                    <select
                      value={newJob.propertyType}
                      onChange={(e) => setNewJob({ ...newJob, propertyType: e.target.value as Job['propertyType'] })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                    >
                      <option value="residential">{t('tools.cleaningSchedule.residential', 'Residential')}</option>
                      <option value="commercial">{t('tools.cleaningSchedule.commercial', 'Commercial')}</option>
                      <option value="industrial">{t('tools.cleaningSchedule.industrial', 'Industrial')}</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.cleaningSchedule.serviceType', 'Service Type')}
                    </label>
                    <select
                      value={newJob.serviceType}
                      onChange={(e) => setNewJob({ ...newJob, serviceType: e.target.value as Job['serviceType'] })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                    >
                      <option value="standard">{t('tools.cleaningSchedule.standard', 'Standard')}</option>
                      <option value="deep">{t('tools.cleaningSchedule.deepClean', 'Deep Clean')}</option>
                      <option value="move-in">{t('tools.cleaningSchedule.moveIn', 'Move-In')}</option>
                      <option value="move-out">{t('tools.cleaningSchedule.moveOut', 'Move-Out')}</option>
                      <option value="post-construction">{t('tools.cleaningSchedule.postConstruction', 'Post-Construction')}</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.cleaningSchedule.date', 'Date *')}
                    </label>
                    <input
                      type="date"
                      value={newJob.scheduledDate}
                      onChange={(e) => setNewJob({ ...newJob, scheduledDate: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.cleaningSchedule.time', 'Time')}
                    </label>
                    <input
                      type="time"
                      value={newJob.scheduledTime}
                      onChange={(e) => setNewJob({ ...newJob, scheduledTime: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.cleaningSchedule.frequency', 'Frequency')}
                    </label>
                    <select
                      value={newJob.frequency}
                      onChange={(e) => setNewJob({ ...newJob, frequency: e.target.value as Job['frequency'] })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                    >
                      <option value="one-time">{t('tools.cleaningSchedule.oneTime', 'One-Time')}</option>
                      <option value="daily">{t('tools.cleaningSchedule.daily', 'Daily')}</option>
                      <option value="weekly">{t('tools.cleaningSchedule.weekly', 'Weekly')}</option>
                      <option value="bi-weekly">{t('tools.cleaningSchedule.biWeekly', 'Bi-Weekly')}</option>
                      <option value="monthly">{t('tools.cleaningSchedule.monthly', 'Monthly')}</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.cleaningSchedule.priority', 'Priority')}
                    </label>
                    <select
                      value={newJob.priority}
                      onChange={(e) => setNewJob({ ...newJob, priority: e.target.value as Job['priority'] })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                    >
                      <option value="normal">{t('tools.cleaningSchedule.normal', 'Normal')}</option>
                      <option value="high">{t('tools.cleaningSchedule.high', 'High')}</option>
                      <option value="urgent">{t('tools.cleaningSchedule.urgent', 'Urgent')}</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.cleaningSchedule.estimatedDurationHours', 'Estimated Duration (hours)')}
                  </label>
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={newJob.estimatedDuration}
                    onChange={(e) => setNewJob({ ...newJob, estimatedDuration: parseFloat(e.target.value) })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.cleaningSchedule.assignCrew', 'Assign Crew')}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {crew.map((member) => (
                      <label key={member.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={newJob.assignedCrew?.includes(member.id)}
                          onChange={(e) => {
                            const current = newJob.assignedCrew || [];
                            if (e.target.checked) {
                              setNewJob({ ...newJob, assignedCrew: [...current, member.id] });
                            } else {
                              setNewJob({ ...newJob, assignedCrew: current.filter((id) => id !== member.id) });
                            }
                          }}
                          className="rounded"
                        />
                        <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{member.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.cleaningSchedule.notes', 'Notes')}
                  </label>
                  <textarea
                    value={newJob.notes}
                    onChange={(e) => setNewJob({ ...newJob, notes: e.target.value })}
                    rows={3}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <button
                    onClick={() => { setShowJobForm(false); resetJobForm(); }}
                    className={`px-4 py-2 rounded-lg ${
                      theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {t('tools.cleaningSchedule.cancel', 'Cancel')}
                  </button>
                  <button
                    onClick={addJob}
                    className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90"
                  >
                    {t('tools.cleaningSchedule.createJob', 'Create Job')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Client Form Modal */}
        {showClientForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 max-w-md w-full`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.cleaningSchedule.addClient2', 'Add Client')}
                </h2>
                <button onClick={() => setShowClientForm(false)} className="p-2">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.cleaningSchedule.name', 'Name *')}
                  </label>
                  <input
                    type="text"
                    value={newClient.name}
                    onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.cleaningSchedule.email', 'Email')}
                  </label>
                  <input
                    type="email"
                    value={newClient.email}
                    onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.cleaningSchedule.phone', 'Phone')}
                  </label>
                  <input
                    type="tel"
                    value={newClient.phone}
                    onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.cleaningSchedule.address', 'Address')}
                  </label>
                  <input
                    type="text"
                    value={newClient.address}
                    onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.cleaningSchedule.notes2', 'Notes')}
                  </label>
                  <textarea
                    value={newClient.notes}
                    onChange={(e) => setNewClient({ ...newClient, notes: e.target.value })}
                    rows={3}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <button
                    onClick={() => setShowClientForm(false)}
                    className={`px-4 py-2 rounded-lg ${
                      theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {t('tools.cleaningSchedule.cancel2', 'Cancel')}
                  </button>
                  <button
                    onClick={addClient}
                    className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90"
                  >
                    {t('tools.cleaningSchedule.addClient3', 'Add Client')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Crew Form Modal */}
        {showCrewForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 max-w-md w-full`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.cleaningSchedule.addCrewMember2', 'Add Crew Member')}
                </h2>
                <button onClick={() => setShowCrewForm(false)} className="p-2">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.cleaningSchedule.name2', 'Name *')}
                  </label>
                  <input
                    type="text"
                    value={newCrew.name}
                    onChange={(e) => setNewCrew({ ...newCrew, name: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.cleaningSchedule.role', 'Role')}
                  </label>
                  <select
                    value={newCrew.role}
                    onChange={(e) => setNewCrew({ ...newCrew, role: e.target.value as CrewMember['role'] })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  >
                    <option value="cleaner">{t('tools.cleaningSchedule.cleaner', 'Cleaner')}</option>
                    <option value="supervisor">{t('tools.cleaningSchedule.supervisor', 'Supervisor')}</option>
                    <option value="team-lead">{t('tools.cleaningSchedule.teamLead', 'Team Lead')}</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.cleaningSchedule.phone2', 'Phone')}
                  </label>
                  <input
                    type="tel"
                    value={newCrew.phone}
                    onChange={(e) => setNewCrew({ ...newCrew, phone: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.cleaningSchedule.email2', 'Email')}
                  </label>
                  <input
                    type="email"
                    value={newCrew.email}
                    onChange={(e) => setNewCrew({ ...newCrew, email: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.cleaningSchedule.availability', 'Availability')}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {DAYS_OF_WEEK.map((day) => (
                      <label key={day} className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={newCrew.availability?.includes(day)}
                          onChange={(e) => {
                            const current = newCrew.availability || [];
                            if (e.target.checked) {
                              setNewCrew({ ...newCrew, availability: [...current, day] });
                            } else {
                              setNewCrew({ ...newCrew, availability: current.filter((d) => d !== day) });
                            }
                          }}
                          className="rounded"
                        />
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          {day.substring(0, 3)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <button
                    onClick={() => setShowCrewForm(false)}
                    className={`px-4 py-2 rounded-lg ${
                      theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {t('tools.cleaningSchedule.cancel3', 'Cancel')}
                  </button>
                  <button
                    onClick={addCrewMember}
                    className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90"
                  >
                    {t('tools.cleaningSchedule.addCrewMember3', 'Add Crew Member')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow`}>
          <h3 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.cleaningSchedule.aboutThisTool', 'About This Tool')}
          </h3>
          <div className={`space-y-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            <p>
              Manage your cleaning business schedule with this comprehensive tool. Schedule cleaning jobs,
              manage clients, assign crew members, and track job completion status.
            </p>
            <p>
              All data is synced to your account for access across devices. Use the export feature to
              download reports in various formats.
            </p>
          </div>
        </div>

        {/* Validation Toast */}
        {validationMessage && (
          <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-40 animate-in fade-in slide-in-from-bottom-4">
            <AlertCircle className="w-4 h-4" />
            {validationMessage}
          </div>
        )}

        <ConfirmDialog />
      </div>
    </div>
  );
};

export default CleaningScheduleTool;
