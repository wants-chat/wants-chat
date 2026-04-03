import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import {
  Clock,
  Plus,
  Play,
  Pause,
  Square,
  Edit2,
  Trash2,
  Search,
  Filter,
  ChevronDown,
  X,
  Save,
  Loader2,
  Calendar,
  Building2,
  FolderOpen,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Users,
  Briefcase,
  Timer,
  Sparkles,
} from 'lucide-react';
import { api } from '../../lib/api';
import { UIConfig } from '../ContextualUI';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';

// Interfaces
interface Client {
  id: string;
  name: string;
  email?: string;
  company_name?: string;
  hourly_rate?: number;
  status: 'active' | 'inactive';
  created_at: string;
}

interface Project {
  id: string;
  name: string;
  client_id: string;
  client_name?: string;
  description?: string;
  hourly_rate?: number;
  status: 'active' | 'completed' | 'on_hold';
  budget_hours?: number;
  created_at: string;
}

interface TimeEntry {
  id: string;
  project_id: string;
  project_name?: string;
  client_id?: string;
  client_name?: string;
  description: string;
  start_time: string;
  end_time?: string;
  duration_minutes: number;
  hourly_rate?: number;
  is_billable: boolean;
  is_running: boolean;
  created_at: string;
}

interface TimeTrackerToolProps {
  uiConfig?: UIConfig;
}

// Helper functions
const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

const formatTime = (date: Date): string => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString();
};

const calculateDuration = (start: string, end: string): number => {
  const startTime = new Date(start).getTime();
  const endTime = new Date(end).getTime();
  return Math.round((endTime - startTime) / 60000);
};

// Column configuration for export
const clientColumns: ColumnConfig[] = [
  { key: 'name', header: 'Name', type: 'string' },
  { key: 'email', header: 'Email', type: 'string' },
  { key: 'company_name', header: 'Company', type: 'string' },
  { key: 'hourly_rate', header: 'Hourly Rate', type: 'currency' },
  { key: 'status', header: 'Status', type: 'string' },
];

const projectColumns: ColumnConfig[] = [
  { key: 'name', header: 'Project Name', type: 'string' },
  { key: 'client_name', header: 'Client', type: 'string' },
  { key: 'description', header: 'Description', type: 'string' },
  { key: 'hourly_rate', header: 'Hourly Rate', type: 'currency' },
  { key: 'budget_hours', header: 'Budget Hours', type: 'number' },
  { key: 'status', header: 'Status', type: 'string' },
];

const timeEntryColumns: ColumnConfig[] = [
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'client_name', header: 'Client', type: 'string' },
  { key: 'project_name', header: 'Project', type: 'string' },
  { key: 'description', header: 'Description', type: 'string' },
  { key: 'duration', header: 'Duration', type: 'string' },
  { key: 'is_billable', header: 'Billable', type: 'boolean' },
  { key: 'amount', header: 'Amount', type: 'currency' },
];

export const TimeTrackerTool: React.FC<TimeTrackerToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  // Confirm dialog hook
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Backend sync with useToolData hooks
  const clientsHook = useToolData<Client>('time-tracker-clients', [], clientColumns);
  const projectsHook = useToolData<Project>('time-tracker-projects', [], projectColumns);
  const timeEntriesHook = useToolData<TimeEntry>('time-tracker-entries', [], timeEntryColumns);

  // Convenience aliases for data
  const clients = clientsHook.data;
  const projects = projectsHook.data;
  const timeEntries = timeEntriesHook.data;

  // State
  const [activeTab, setActiveTab] = useState<'timer' | 'entries' | 'clients' | 'projects'>('timer');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Data
  const [runningEntry, setRunningEntry] = useState<TimeEntry | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClient, setFilterClient] = useState('');
  const [filterProject, setFilterProject] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Timer state
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [timerDescription, setTimerDescription] = useState('');
  const [isBillable, setIsBillable] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Modal states
  const [showClientModal, setShowClientModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
  const [saving, setSaving] = useState(false);

  // Form data
  const [clientFormData, setClientFormData] = useState({
    name: '',
    email: '',
    company_name: '',
    hourly_rate: '',
  });

  const [projectFormData, setProjectFormData] = useState({
    name: '',
    client_id: '',
    description: '',
    hourly_rate: '',
    budget_hours: '',
  });

  const [entryFormData, setEntryFormData] = useState({
    project_id: '',
    description: '',
    start_time: '',
    end_time: '',
    is_billable: true,
  });

  // Check for running entry when timeEntries change
  useEffect(() => {
    const running = timeEntries.find((e: TimeEntry) => e.is_running);
    if (running) {
      setRunningEntry(running);
      const startTime = new Date(running.start_time).getTime();
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setTimerSeconds(elapsed);
      setSelectedProjectId(running.project_id);
      setTimerDescription(running.description);
      setIsBillable(running.is_billable);

      // Find client from project
      const project = projects.find(p => p.id === running.project_id);
      if (project) {
        setSelectedClientId(project.client_id);
      }
    }
  }, [timeEntries, projects]);

  // Handle prefill data
  useEffect(() => {
    if (uiConfig?.params || uiConfig?.prefillData) {
      const params = uiConfig.params || uiConfig.prefillData;
      if (params) {
        if (params.client_id) {
          setSelectedClientId(params.client_id);
        }
        if (params.project_id) {
          setSelectedProjectId(params.project_id);
        }
        if (params.description) {
          setTimerDescription(params.description);
        }
        setIsPrefilled(true);
      }
    }
  }, [uiConfig]);

  // Timer logic
  useEffect(() => {
    if (runningEntry) {
      timerRef.current = setInterval(() => {
        const startTime = new Date(runningEntry.start_time).getTime();
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setTimerSeconds(elapsed);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setTimerSeconds(0);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [runningEntry]);

  // Timer controls
  const startTimer = async () => {
    if (!selectedProjectId) {
      setError('Please select a project');
      return;
    }

    try {
      setSaving(true);
      const newEntry: TimeEntry = {
        id: `entry-${Date.now()}`,
        project_id: selectedProjectId,
        description: timerDescription || 'Time entry',
        start_time: new Date().toISOString(),
        duration_minutes: 0,
        hourly_rate: projects.find(p => p.id === selectedProjectId)?.hourly_rate,
        is_billable: isBillable,
        is_running: true,
        created_at: new Date().toISOString(),
      };

      timeEntriesHook.addItem(newEntry);
      setRunningEntry(newEntry);
      setSuccessMessage('Timer started');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to start timer');
    } finally {
      setSaving(false);
    }
  };

  const stopTimer = async () => {
    if (!runningEntry) return;

    try {
      setSaving(true);
      const endTime = new Date().toISOString();
      const duration = calculateDuration(runningEntry.start_time, endTime);

      timeEntriesHook.updateItem(runningEntry.id, {
        end_time: endTime,
        duration_minutes: duration,
        is_running: false,
      } as Partial<TimeEntry>);

      setRunningEntry(null);
      setTimerDescription('');
      setSuccessMessage('Timer stopped');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to stop timer');
    } finally {
      setSaving(false);
    }
  };

  // CRUD operations
  const handleSaveClient = async () => {
    if (!clientFormData.name.trim()) {
      setError('Client name is required');
      return;
    }

    try {
      setSaving(true);

      if (editingClient) {
        clientsHook.updateItem(editingClient.id, {
          name: clientFormData.name,
          email: clientFormData.email || undefined,
          company_name: clientFormData.company_name || undefined,
          hourly_rate: clientFormData.hourly_rate ? parseFloat(clientFormData.hourly_rate) : undefined,
        } as Partial<Client>);
        setSuccessMessage('Client updated successfully');
      } else {
        const newClient: Client = {
          id: `client-${Date.now()}`,
          name: clientFormData.name,
          email: clientFormData.email || undefined,
          company_name: clientFormData.company_name || undefined,
          hourly_rate: clientFormData.hourly_rate ? parseFloat(clientFormData.hourly_rate) : undefined,
          status: 'active',
          created_at: new Date().toISOString(),
        };
        clientsHook.addItem(newClient);
        setSuccessMessage('Client created successfully');
      }

      setShowClientModal(false);
      resetClientForm();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save client');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveProject = async () => {
    if (!projectFormData.name.trim()) {
      setError('Project name is required');
      return;
    }
    if (!projectFormData.client_id) {
      setError('Please select a client');
      return;
    }

    try {
      setSaving(true);
      const clientName = clients.find(c => c.id === projectFormData.client_id)?.name || '';

      if (editingProject) {
        projectsHook.updateItem(editingProject.id, {
          name: projectFormData.name,
          client_id: projectFormData.client_id,
          client_name: clientName,
          description: projectFormData.description || undefined,
          hourly_rate: projectFormData.hourly_rate ? parseFloat(projectFormData.hourly_rate) : undefined,
          budget_hours: projectFormData.budget_hours ? parseInt(projectFormData.budget_hours) : undefined,
        } as Partial<Project>);
        setSuccessMessage('Project updated successfully');
      } else {
        const newProject: Project = {
          id: `project-${Date.now()}`,
          name: projectFormData.name,
          client_id: projectFormData.client_id,
          client_name: clientName,
          description: projectFormData.description || undefined,
          hourly_rate: projectFormData.hourly_rate ? parseFloat(projectFormData.hourly_rate) : undefined,
          budget_hours: projectFormData.budget_hours ? parseInt(projectFormData.budget_hours) : undefined,
          status: 'active',
          created_at: new Date().toISOString(),
        };
        projectsHook.addItem(newProject);
        setSuccessMessage('Project created successfully');
      }

      setShowProjectModal(false);
      resetProjectForm();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save project');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEntry = async () => {
    if (!entryFormData.project_id) {
      setError('Please select a project');
      return;
    }
    if (!entryFormData.start_time || !entryFormData.end_time) {
      setError('Start and end time are required');
      return;
    }

    try {
      setSaving(true);
      const duration = calculateDuration(entryFormData.start_time, entryFormData.end_time);
      const project = projects.find(p => p.id === entryFormData.project_id);

      if (editingEntry) {
        timeEntriesHook.updateItem(editingEntry.id, {
          project_id: entryFormData.project_id,
          project_name: project?.name,
          client_id: project?.client_id,
          client_name: project?.client_name,
          description: entryFormData.description || 'Time entry',
          start_time: entryFormData.start_time,
          end_time: entryFormData.end_time,
          duration_minutes: duration,
          hourly_rate: project?.hourly_rate,
          is_billable: entryFormData.is_billable,
          is_running: false,
        } as Partial<TimeEntry>);
        setSuccessMessage('Time entry updated successfully');
      } else {
        const newEntry: TimeEntry = {
          id: `entry-${Date.now()}`,
          project_id: entryFormData.project_id,
          project_name: project?.name,
          client_id: project?.client_id,
          client_name: project?.client_name,
          description: entryFormData.description || 'Time entry',
          start_time: entryFormData.start_time,
          end_time: entryFormData.end_time,
          duration_minutes: duration,
          hourly_rate: project?.hourly_rate,
          is_billable: entryFormData.is_billable,
          is_running: false,
          created_at: new Date().toISOString(),
        };
        timeEntriesHook.addItem(newEntry);
        setSuccessMessage('Time entry created successfully');
      }

      setShowEntryModal(false);
      resetEntryForm();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save time entry');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClient = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Client',
      message: 'Are you sure you want to delete this client?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (!confirmed) return;

    try {
      clientsHook.deleteItem(id);
      setSuccessMessage('Client deleted successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to delete client');
    }
  };

  const handleDeleteProject = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Project',
      message: 'Are you sure you want to delete this project?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (!confirmed) return;

    try {
      projectsHook.deleteItem(id);
      setSuccessMessage('Project deleted successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to delete project');
    }
  };

  const handleDeleteEntry = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Time Entry',
      message: 'Are you sure you want to delete this time entry?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (!confirmed) return;

    try {
      timeEntriesHook.deleteItem(id);
      setSuccessMessage('Time entry deleted successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to delete time entry');
    }
  };

  // Form reset functions
  const resetClientForm = () => {
    setClientFormData({ name: '', email: '', company_name: '', hourly_rate: '' });
    setEditingClient(null);
  };

  const resetProjectForm = () => {
    setProjectFormData({ name: '', client_id: '', description: '', hourly_rate: '', budget_hours: '' });
    setEditingProject(null);
  };

  const resetEntryForm = () => {
    setEntryFormData({ project_id: '', description: '', start_time: '', end_time: '', is_billable: true });
    setEditingEntry(null);
  };

  // Edit handlers
  const openEditClient = (client: Client) => {
    setEditingClient(client);
    setClientFormData({
      name: client.name,
      email: client.email || '',
      company_name: client.company_name || '',
      hourly_rate: client.hourly_rate?.toString() || '',
    });
    setShowClientModal(true);
  };

  const openEditProject = (project: Project) => {
    setEditingProject(project);
    setProjectFormData({
      name: project.name,
      client_id: project.client_id,
      description: project.description || '',
      hourly_rate: project.hourly_rate?.toString() || '',
      budget_hours: project.budget_hours?.toString() || '',
    });
    setShowProjectModal(true);
  };

  const openEditEntry = (entry: TimeEntry) => {
    setEditingEntry(entry);
    setEntryFormData({
      project_id: entry.project_id,
      description: entry.description,
      start_time: entry.start_time,
      end_time: entry.end_time || '',
      is_billable: entry.is_billable,
    });
    setShowEntryModal(true);
  };

  // Export functionality - prepare data for export
  const getExportData = () => {
    return timeEntries.map(entry => ({
      date: entry.start_time,
      client_name: entry.client_name || 'N/A',
      project_name: entry.project_name || 'N/A',
      description: entry.description,
      duration: formatDuration(entry.duration_minutes),
      is_billable: entry.is_billable,
      amount: entry.is_billable && entry.hourly_rate
        ? (entry.duration_minutes / 60) * entry.hourly_rate
        : 0,
    }));
  };

  const handleExportCSV = () => {
    const result = exportToCSV(getExportData(), timeEntryColumns, { filename: 'time-entries' });
    if (result.success) {
      setSuccessMessage('CSV exported successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } else {
      setError(result.error || 'Failed to export CSV');
    }
  };

  const handleExportExcel = () => {
    const result = exportToExcel(getExportData(), timeEntryColumns, { filename: 'time-entries' });
    if (result.success) {
      setSuccessMessage('Excel file exported successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } else {
      setError(result.error || 'Failed to export Excel');
    }
  };

  const handleExportJSON = () => {
    const result = exportToJSON(getExportData(), { filename: 'time-entries' });
    if (result.success) {
      setSuccessMessage('JSON exported successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } else {
      setError(result.error || 'Failed to export JSON');
    }
  };

  const handleExportPDF = async () => {
    const result = await exportToPDF(getExportData(), timeEntryColumns, {
      filename: 'time-entries',
      title: 'Time Entries Report',
      subtitle: `Total Hours: ${totalHours.toFixed(1)} | Billable: ${billableHours.toFixed(1)}`,
      orientation: 'landscape',
    });
    if (result.success) {
      setSuccessMessage('PDF exported successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } else {
      setError(result.error || 'Failed to export PDF');
    }
  };

  const handlePrint = () => {
    printData(getExportData(), timeEntryColumns, { title: 'Time Entries Report' });
  };

  const handleCopyToClipboard = async (): Promise<boolean> => {
    const success = await copyUtil(getExportData(), timeEntryColumns);
    if (success) {
      setSuccessMessage('Copied to clipboard');
      setTimeout(() => setSuccessMessage(null), 3000);
    }
    return success;
  };

  // Calculate stats
  const totalHours = timeEntries.reduce((sum, e) => sum + e.duration_minutes, 0) / 60;
  const billableHours = timeEntries.filter(e => e.is_billable).reduce((sum, e) => sum + e.duration_minutes, 0) / 60;
  const totalBillable = timeEntries
    .filter(e => e.is_billable && e.hourly_rate)
    .reduce((sum, e) => sum + (e.duration_minutes / 60) * (e.hourly_rate || 0), 0);

  // Format timer display
  const formatTimerDisplay = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get filtered projects based on selected client
  const filteredProjects = selectedClientId
    ? projects.filter(p => p.client_id === selectedClientId)
    : projects;

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-white'} p-4 md:p-6`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500/20 rounded-xl">
              <Clock className="w-8 h-8 text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{t('tools.timeTracker.timeTracker', 'Time Tracker')}</h1>
              <p className="text-gray-400">{t('tools.timeTracker.trackBillableTimeForClients', 'Track billable time for clients and projects')}</p>
            </div>
          </div>
          <WidgetEmbedButton toolSlug="time-tracker" toolName="Time Tracker" />

          <SyncStatus
            isSynced={timeEntriesHook.isSynced}
            isSaving={timeEntriesHook.isSaving}
            lastSaved={timeEntriesHook.lastSaved}
            syncError={timeEntriesHook.syncError}
            onForceSync={timeEntriesHook.forceSync}
            theme="dark"
            showLabel={true}
          />
        </div>

        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 rounded-xl border border-purple-500/20">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-400 font-medium">{t('tools.timeTracker.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        {/* Messages */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
            <button onClick={() => setError(null)} className="ml-auto">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        {successMessage && (
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            {successMessage}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
            <div className="flex items-center gap-2 text-gray-400 mb-1">
              <Timer className="w-4 h-4" />
              <span className="text-sm">{t('tools.timeTracker.totalHours', 'Total Hours')}</span>
            </div>
            <p className="text-2xl font-bold text-white">{totalHours.toFixed(1)}h</p>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
            <div className="flex items-center gap-2 text-blue-400 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-sm">{t('tools.timeTracker.billableHours', 'Billable Hours')}</span>
            </div>
            <p className="text-2xl font-bold text-blue-400">{billableHours.toFixed(1)}h</p>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
            <div className="flex items-center gap-2 text-green-400 mb-1">
              <DollarSign className="w-4 h-4" />
              <span className="text-sm">{t('tools.timeTracker.billableAmount', 'Billable Amount')}</span>
            </div>
            <p className="text-2xl font-bold text-green-400">${totalBillable.toFixed(2)}</p>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
            <div className="flex items-center gap-2 text-purple-400 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm">{t('tools.timeTracker.activeProjects', 'Active Projects')}</span>
            </div>
            <p className="text-2xl font-bold text-purple-400">{projects.filter(p => p.status === 'active').length}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-700 pb-2 overflow-x-auto">
          {[
            { id: 'timer', label: 'Timer', icon: Play },
            { id: 'entries', label: 'Time Entries', icon: Clock },
            { id: 'clients', label: 'Clients', icon: Users },
            { id: 'projects', label: 'Projects', icon: Briefcase },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Timer Tab */}
        {activeTab === 'timer' && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <div className="text-center mb-6">
              <div className={`text-6xl font-mono font-bold mb-4 ${runningEntry ? 'text-purple-400' : 'text-white'}`}>
                {formatTimerDisplay(timerSeconds)}
              </div>
              {runningEntry && (
                <p className="text-gray-400">
                  Working on: {runningEntry.description}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm text-gray-400 mb-1">{t('tools.timeTracker.client', 'Client')}</label>
                <select
                  value={selectedClientId}
                  onChange={(e) => {
                    setSelectedClientId(e.target.value);
                    setSelectedProjectId('');
                  }}
                  disabled={!!runningEntry}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500 disabled:opacity-50"
                >
                  <option value="">{t('tools.timeTracker.selectClient', 'Select Client')}</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.name} {client.company_name && `(${client.company_name})`}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">{t('tools.timeTracker.project', 'Project *')}</label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  disabled={!!runningEntry}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500 disabled:opacity-50"
                >
                  <option value="">{t('tools.timeTracker.selectProject', 'Select Project')}</option>
                  {filteredProjects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm text-gray-400 mb-1">{t('tools.timeTracker.description', 'Description')}</label>
              <input
                type="text"
                value={timerDescription}
                onChange={(e) => setTimerDescription(e.target.value)}
                disabled={!!runningEntry}
                placeholder={t('tools.timeTracker.whatAreYouWorkingOn', 'What are you working on?')}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500 disabled:opacity-50"
              />
            </div>

            <div className="flex items-center justify-between mb-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isBillable}
                  onChange={(e) => setIsBillable(e.target.checked)}
                  disabled={!!runningEntry}
                  className="w-4 h-4 rounded border-gray-600 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-gray-300">{t('tools.timeTracker.billable', 'Billable')}</span>
              </label>
            </div>

            <div className="flex justify-center gap-4">
              {!runningEntry ? (
                <button
                  onClick={startTimer}
                  disabled={saving || !selectedProjectId}
                  className="flex items-center gap-2 px-8 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
                  Start Timer
                </button>
              ) : (
                <button
                  onClick={stopTimer}
                  disabled={saving}
                  className="flex items-center gap-2 px-8 py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Square className="w-5 h-5" />}
                  Stop Timer
                </button>
              )}
              <button
                onClick={() => {
                  resetEntryForm();
                  setShowEntryModal(true);
                }}
                className="flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5" />
                {t('tools.timeTracker.manualEntry', 'Manual Entry')}
              </button>
            </div>
          </div>
        )}

        {/* Time Entries Tab */}
        {activeTab === 'entries' && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('tools.timeTracker.searchEntries', 'Search entries...')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 hover:text-white"
              >
                <Filter className="w-4 h-4" />
                Filters
                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
              <ExportDropdown
                onExportCSV={handleExportCSV}
                onExportExcel={handleExportExcel}
                onExportJSON={handleExportJSON}
                onExportPDF={handleExportPDF}
                onPrint={handlePrint}
                onCopyToClipboard={handleCopyToClipboard}
                showImport={false}
                theme="dark"
                disabled={timeEntries.length === 0}
              />
              <button
                onClick={() => {
                  resetEntryForm();
                  setShowEntryModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg"
              >
                <Plus className="w-4 h-4" />
                {t('tools.timeTracker.addEntry', 'Add Entry')}
              </button>
            </div>

            {showFilters && (
              <div className="flex flex-wrap gap-4 p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">{t('tools.timeTracker.client2', 'Client')}</label>
                  <select
                    value={filterClient}
                    onChange={(e) => setFilterClient(e.target.value)}
                    className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  >
                    <option value="">{t('tools.timeTracker.allClients', 'All Clients')}</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">{t('tools.timeTracker.project2', 'Project')}</label>
                  <select
                    value={filterProject}
                    onChange={(e) => setFilterProject(e.target.value)}
                    className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  >
                    <option value="">{t('tools.timeTracker.allProjects', 'All Projects')}</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">{t('tools.timeTracker.from', 'From')}</label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">To</label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>
              </div>
            )}

            {/* Entries List */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
              {timeEntriesHook.isLoading ? (
                <div className="p-8 text-center text-gray-400">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto" />
                </div>
              ) : timeEntries.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{t('tools.timeTracker.noTimeEntriesFound', 'No time entries found')}</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-700">
                  {timeEntries.map(entry => (
                    <div key={entry.id} className="p-4 hover:bg-gray-700/20">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-white font-medium">{entry.description}</span>
                            {entry.is_running && (
                              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-500/20 text-green-400">
                                {t('tools.timeTracker.running', 'Running')}
                              </span>
                            )}
                            {entry.is_billable && (
                              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-500/20 text-blue-400">
                                {t('tools.timeTracker.billable3', 'Billable')}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(entry.start_time)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {entry.start_time && formatTime(new Date(entry.start_time))}
                              {entry.end_time && ` - ${formatTime(new Date(entry.end_time))}`}
                            </span>
                            {entry.project_name && (
                              <span className="flex items-center gap-1">
                                <FolderOpen className="w-3 h-3" />
                                {entry.project_name}
                              </span>
                            )}
                            {entry.client_name && (
                              <span className="flex items-center gap-1">
                                <Building2 className="w-3 h-3" />
                                {entry.client_name}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-white font-medium">{formatDuration(entry.duration_minutes)}</p>
                            {entry.is_billable && entry.hourly_rate && (
                              <p className="text-green-400 text-sm">
                                ${((entry.duration_minutes / 60) * entry.hourly_rate).toFixed(2)}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEditEntry(entry)}
                              className="p-2 hover:bg-gray-700 rounded-lg text-gray-400"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteEntry(entry.id)}
                              className="p-2 hover:bg-gray-700 rounded-lg text-red-400"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Clients Tab */}
        {activeTab === 'clients' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                onClick={() => {
                  resetClientForm();
                  setShowClientModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg"
              >
                <Plus className="w-4 h-4" />
                {t('tools.timeTracker.addClient', 'Add Client')}
              </button>
            </div>

            <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
              {clients.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{t('tools.timeTracker.noClientsFound', 'No clients found')}</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-700">
                  {clients.map(client => (
                    <div key={client.id} className="p-4 hover:bg-gray-700/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">{client.name}</p>
                          <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                            {client.company_name && (
                              <span className="flex items-center gap-1">
                                <Building2 className="w-3 h-3" />
                                {client.company_name}
                              </span>
                            )}
                            {client.email && <span>{client.email}</span>}
                            {client.hourly_rate && (
                              <span className="flex items-center gap-1">
                                <DollarSign className="w-3 h-3" />
                                ${client.hourly_rate}/hr
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditClient(client)}
                            className="p-2 hover:bg-gray-700 rounded-lg text-gray-400"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClient(client.id)}
                            className="p-2 hover:bg-gray-700 rounded-lg text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Projects Tab */}
        {activeTab === 'projects' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                onClick={() => {
                  resetProjectForm();
                  setShowProjectModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg"
              >
                <Plus className="w-4 h-4" />
                {t('tools.timeTracker.addProject', 'Add Project')}
              </button>
            </div>

            <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
              {projects.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{t('tools.timeTracker.noProjectsFound', 'No projects found')}</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-700">
                  {projects.map(project => (
                    <div key={project.id} className="p-4 hover:bg-gray-700/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-white font-medium">{project.name}</p>
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                              project.status === 'active' ? 'bg-green-500/20 text-green-400' :
                              project.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                              'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {project.status}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                            {project.client_name && (
                              <span className="flex items-center gap-1">
                                <Building2 className="w-3 h-3" />
                                {project.client_name}
                              </span>
                            )}
                            {project.hourly_rate && (
                              <span className="flex items-center gap-1">
                                <DollarSign className="w-3 h-3" />
                                ${project.hourly_rate}/hr
                              </span>
                            )}
                            {project.budget_hours && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {project.budget_hours}h budget
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditProject(project)}
                            className="p-2 hover:bg-gray-700 rounded-lg text-gray-400"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProject(project.id)}
                            className="p-2 hover:bg-gray-700 rounded-lg text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Client Modal */}
        {showClientModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl w-full max-w-md">
              <div className="flex items-center justify-between p-6 border-b border-gray-700">
                <h2 className="text-xl font-semibold text-white">
                  {editingClient ? t('tools.timeTracker.editClient', 'Edit Client') : t('tools.timeTracker.addClient2', 'Add Client')}
                </h2>
                <button
                  onClick={() => {
                    setShowClientModal(false);
                    resetClientForm();
                  }}
                  className="p-2 hover:bg-gray-700 rounded-lg text-gray-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">{t('tools.timeTracker.name', 'Name *')}</label>
                  <input
                    type="text"
                    value={clientFormData.name}
                    onChange={(e) => setClientFormData({ ...clientFormData, name: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    placeholder={t('tools.timeTracker.clientName', 'Client name')}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">{t('tools.timeTracker.email', 'Email')}</label>
                  <input
                    type="email"
                    value={clientFormData.email}
                    onChange={(e) => setClientFormData({ ...clientFormData, email: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    placeholder={t('tools.timeTracker.clientExampleCom', 'client@example.com')}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">{t('tools.timeTracker.company', 'Company')}</label>
                  <input
                    type="text"
                    value={clientFormData.company_name}
                    onChange={(e) => setClientFormData({ ...clientFormData, company_name: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    placeholder={t('tools.timeTracker.companyName', 'Company name')}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">{t('tools.timeTracker.hourlyRate', 'Hourly Rate ($)')}</label>
                  <input
                    type="number"
                    step="0.01"
                    value={clientFormData.hourly_rate}
                    onChange={(e) => setClientFormData({ ...clientFormData, hourly_rate: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 p-6 border-t border-gray-700">
                <button
                  onClick={() => {
                    setShowClientModal(false);
                    resetClientForm();
                  }}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
                >
                  {t('tools.timeTracker.cancel', 'Cancel')}
                </button>
                <button
                  onClick={handleSaveClient}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Project Modal */}
        {showProjectModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl w-full max-w-md">
              <div className="flex items-center justify-between p-6 border-b border-gray-700">
                <h2 className="text-xl font-semibold text-white">
                  {editingProject ? t('tools.timeTracker.editProject', 'Edit Project') : t('tools.timeTracker.addProject2', 'Add Project')}
                </h2>
                <button
                  onClick={() => {
                    setShowProjectModal(false);
                    resetProjectForm();
                  }}
                  className="p-2 hover:bg-gray-700 rounded-lg text-gray-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">{t('tools.timeTracker.name2', 'Name *')}</label>
                  <input
                    type="text"
                    value={projectFormData.name}
                    onChange={(e) => setProjectFormData({ ...projectFormData, name: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    placeholder={t('tools.timeTracker.projectName', 'Project name')}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">{t('tools.timeTracker.client3', 'Client *')}</label>
                  <select
                    value={projectFormData.client_id}
                    onChange={(e) => setProjectFormData({ ...projectFormData, client_id: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="">{t('tools.timeTracker.selectClient2', 'Select Client')}</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">{t('tools.timeTracker.description2', 'Description')}</label>
                  <textarea
                    value={projectFormData.description}
                    onChange={(e) => setProjectFormData({ ...projectFormData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    placeholder={t('tools.timeTracker.projectDescription', 'Project description')}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">{t('tools.timeTracker.hourlyRate2', 'Hourly Rate ($)')}</label>
                    <input
                      type="number"
                      step="0.01"
                      value={projectFormData.hourly_rate}
                      onChange={(e) => setProjectFormData({ ...projectFormData, hourly_rate: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">{t('tools.timeTracker.budgetHours', 'Budget (hours)')}</label>
                    <input
                      type="number"
                      value={projectFormData.budget_hours}
                      onChange={(e) => setProjectFormData({ ...projectFormData, budget_hours: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 p-6 border-t border-gray-700">
                <button
                  onClick={() => {
                    setShowProjectModal(false);
                    resetProjectForm();
                  }}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
                >
                  {t('tools.timeTracker.cancel2', 'Cancel')}
                </button>
                <button
                  onClick={handleSaveProject}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Time Entry Modal */}
        {showEntryModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl w-full max-w-md">
              <div className="flex items-center justify-between p-6 border-b border-gray-700">
                <h2 className="text-xl font-semibold text-white">
                  {editingEntry ? t('tools.timeTracker.editTimeEntry', 'Edit Time Entry') : t('tools.timeTracker.addTimeEntry', 'Add Time Entry')}
                </h2>
                <button
                  onClick={() => {
                    setShowEntryModal(false);
                    resetEntryForm();
                  }}
                  className="p-2 hover:bg-gray-700 rounded-lg text-gray-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">{t('tools.timeTracker.project3', 'Project *')}</label>
                  <select
                    value={entryFormData.project_id}
                    onChange={(e) => setEntryFormData({ ...entryFormData, project_id: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="">{t('tools.timeTracker.selectProject2', 'Select Project')}</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>
                        {project.name} {project.client_name && `(${project.client_name})`}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">{t('tools.timeTracker.description3', 'Description')}</label>
                  <input
                    type="text"
                    value={entryFormData.description}
                    onChange={(e) => setEntryFormData({ ...entryFormData, description: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    placeholder={t('tools.timeTracker.whatDidYouWorkOn', 'What did you work on?')}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">{t('tools.timeTracker.startTime', 'Start Time *')}</label>
                    <input
                      type="datetime-local"
                      value={entryFormData.start_time ? entryFormData.start_time.slice(0, 16) : ''}
                      onChange={(e) => setEntryFormData({ ...entryFormData, start_time: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">{t('tools.timeTracker.endTime', 'End Time *')}</label>
                    <input
                      type="datetime-local"
                      value={entryFormData.end_time ? entryFormData.end_time.slice(0, 16) : ''}
                      onChange={(e) => setEntryFormData({ ...entryFormData, end_time: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={entryFormData.is_billable}
                    onChange={(e) => setEntryFormData({ ...entryFormData, is_billable: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-600 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-gray-300">{t('tools.timeTracker.billable2', 'Billable')}</span>
                </label>
              </div>
              <div className="flex justify-end gap-3 p-6 border-t border-gray-700">
                <button
                  onClick={() => {
                    setShowEntryModal(false);
                    resetEntryForm();
                  }}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
                >
                  {t('tools.timeTracker.cancel3', 'Cancel')}
                </button>
                <button
                  onClick={handleSaveEntry}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Confirm Dialog */}
        <ConfirmDialog />
      </div>
    </div>
  );
};

export default TimeTrackerTool;
