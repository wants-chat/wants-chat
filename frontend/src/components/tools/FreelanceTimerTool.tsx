'use client';
import { useTranslation } from 'react-i18next';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import {
  Play,
  Pause,
  Square,
  Plus,
  Trash2,
  Clock,
  DollarSign,
  Calendar,
  FileText,
  Settings,
  ChevronDown,
  ChevronUp,
  Edit2,
  Briefcase,
  Timer,
  Target,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useToolData } from '../../hooks/useToolData';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';

interface FreelanceTimerToolProps {
  uiConfig?: UIConfig;
}

// Types
interface Project {
  id: string;
  name: string;
  client: string;
  hourlyRate: number;
  budgetHours: number;
  color: string;
}

interface TimeEntry {
  id: string;
  projectId: string;
  startTime: Date;
  endTime: Date | null;
  duration: number; // in seconds
  notes: string;
  isBillable: boolean;
  isManual: boolean;
}

type TimesheetView = 'daily' | 'weekly' | 'monthly';
type RoundingOption = 'none' | '6min' | '15min';

const PROJECT_COLORS = [
  '#0D9488', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b',
  '#10b981', '#ef4444', '#6366f1', '#14b8a6', '#f97316',
];

// Column configurations for export
const projectColumns: ColumnConfig[] = [
  { key: 'id', header: 'Project ID', type: 'string' },
  { key: 'name', header: 'Project Name', type: 'string' },
  { key: 'client', header: 'Client', type: 'string' },
  { key: 'hourlyRate', header: 'Hourly Rate', type: 'currency' },
  { key: 'budgetHours', header: 'Budget Hours', type: 'number' },
  { key: 'color', header: 'Color', type: 'string' },
];

const timeEntryColumns: ColumnConfig[] = [
  { key: 'id', header: 'Entry ID', type: 'string' },
  { key: 'projectId', header: 'Project ID', type: 'string' },
  { key: 'startTime', header: 'Start Time', type: 'date' },
  { key: 'endTime', header: 'End Time', type: 'date' },
  { key: 'duration', header: 'Duration (seconds)', type: 'number' },
  { key: 'notes', header: 'Notes', type: 'string' },
  { key: 'isBillable', header: 'Billable', type: 'boolean' },
  { key: 'isManual', header: 'Manual Entry', type: 'boolean' },
];

export const FreelanceTimerTool = ({ uiConfig }: FreelanceTimerToolProps) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  // Initialize hooks for projects and time entries with backend sync
  const {
    data: projects,
    addItem: addProject,
    updateItem: updateProject,
    deleteItem: deleteProject,
    isSynced: projectsSynced,
    isSaving: projectsSaving,
    lastSaved: projectsLastSaved,
    syncError: projectsSyncError,
    forceSync: projectsForceSync,
  } = useToolData<Project>(
    'freelance-timer-projects',
    [],
    projectColumns,
    { autoSave: true }
  );

  const {
    data: timeEntries,
    addItem: addTimeEntry,
    updateItem: updateTimeEntry,
    deleteItem: deleteTimeEntry,
    isSynced: entriesSynced,
    isSaving: entriesSaving,
    lastSaved: entriesLastSaved,
    syncError: entriesSyncError,
    forceSync: entriesForceSync,
  } = useToolData<TimeEntry>(
    'freelance-timer-entries',
    [],
    timeEntryColumns,
    { autoSave: true }
  );

  // Combined sync status (both need to be synced for overall sync)
  const isSynced = projectsSynced && entriesSynced;
  const isSaving = projectsSaving || entriesSaving;
  const lastSaved = projectsLastSaved && entriesLastSaved
    ? new Date(projectsLastSaved) > new Date(entriesLastSaved) ? projectsLastSaved : entriesLastSaved
    : projectsLastSaved || entriesLastSaved;
  const syncError = projectsSyncError || entriesSyncError;
  const forceSync = () => {
    projectsForceSync();
    entriesForceSync();
  };

  // Local UI state
  const [activeEntryId, setActiveEntryId] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [pausedTime, setPausedTime] = useState(0);
  const [roundingOption, setRoundingOption] = useState<RoundingOption>('none');
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [timesheetView, setTimesheetView] = useState<TimesheetView>('daily');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [currentTime, setCurrentTime] = useState(0);
  const [entryNotes, setEntryNotes] = useState('');
  const [isBillable, setIsBillable] = useState(true);
  const intervalRef = useRef<number | null>(null);

  // Manual entry form state
  const [manualDate, setManualDate] = useState(new Date().toISOString().split('T')[0]);
  const [manualStartTime, setManualStartTime] = useState('09:00');
  const [manualEndTime, setManualEndTime] = useState('17:00');
  const [manualNotes, setManualNotes] = useState('');
  const [manualBillable, setManualBillable] = useState(true);
  const [manualProjectId, setManualProjectId] = useState('');

  // Project form state
  const [projectName, setProjectName] = useState('');
  const [projectClient, setProjectClient] = useState('');
  const [projectRate, setProjectRate] = useState(50);
  const [projectBudget, setProjectBudget] = useState(100);
  const [projectColor, setProjectColor] = useState(PROJECT_COLORS[0]);

  // Prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.projectName || params.client || params.rate) {
        if (params.projectName) setProjectName(params.projectName);
        if (params.client) setProjectClient(params.client);
        if (params.rate) setProjectRate(Number(params.rate));
        if (params.hours) setProjectBudget(Number(params.hours));
        setShowProjectForm(true);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Timer interval
  useEffect(() => {
    if (activeEntryId && !isPaused) {
      const activeEntry = timeEntries.find((e) => e.id === activeEntryId);
      if (activeEntry) {
        // Calculate elapsed time from the (possibly adjusted) start time
        const elapsed = Math.floor((Date.now() - new Date(activeEntry.startTime).getTime()) / 1000);
        setCurrentTime(elapsed);
      }

      intervalRef.current = window.setInterval(() => {
        setCurrentTime((prev) => prev + 1);
      }, 1000);
    } else if (!activeEntryId) {
      setCurrentTime(0);
      setPausedTime(0);
    }
    // When paused, don't reset currentTime - keep displaying the paused value

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [activeEntryId, isPaused, timeEntries]);

  // Helper functions
  const formatDuration = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatHours = (seconds: number): string => {
    const hours = seconds / 3600;
    return hours.toFixed(2);
  };

  const roundDuration = (seconds: number, option: RoundingOption): number => {
    if (option === 'none') return seconds;
    const interval = option === '6min' ? 360 : 900; // 6 min = 360s, 15 min = 900s
    return Math.ceil(seconds / interval) * interval;
  };

  const getProjectById = (id: string): Project | undefined => {
    return projects.find((p) => p.id === id);
  };

  const generateId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  // Project management
  const handleAddProject = () => {
    if (!projectName.trim()) return;

    const newProject: Project = {
      id: generateId(),
      name: projectName,
      client: projectClient,
      hourlyRate: projectRate,
      budgetHours: projectBudget,
      color: projectColor,
    };

    addProject(newProject);

    resetProjectForm();
    setShowProjectForm(false);
  };

  const handleUpdateProject = () => {
    if (!editingProject || !projectName.trim()) return;

    updateProject(editingProject.id, {
      name: projectName,
      client: projectClient,
      hourlyRate: projectRate,
      budgetHours: projectBudget,
      color: projectColor,
    });

    resetProjectForm();
    setEditingProject(null);
  };

  const handleDeleteProject = (id: string) => {
    deleteProject(id);
    // Also delete associated time entries
    timeEntries.forEach((entry) => {
      if (entry.projectId === id) {
        deleteTimeEntry(entry.id);
      }
    });
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setProjectName(project.name);
    setProjectClient(project.client);
    setProjectRate(project.hourlyRate);
    setProjectBudget(project.budgetHours);
    setProjectColor(project.color);
    setShowProjectForm(true);
  };

  const resetProjectForm = () => {
    setProjectName('');
    setProjectClient('');
    setProjectRate(50);
    setProjectBudget(100);
    setProjectColor(PROJECT_COLORS[0]);
  };

  // Timer controls
  const handleStartTimer = () => {
    if (!selectedProjectId) return;

    // If resuming from pause, adjust start time to account for paused duration
    if (activeEntryId && isPaused) {
      const activeEntry = timeEntries.find((e) => e.id === activeEntryId);
      if (activeEntry) {
        // Adjust startTime so that elapsed calculation: Date.now() - startTime = pausedTime
        const adjustedStartTime = new Date(Date.now() - pausedTime * 1000);
        updateTimeEntry(activeEntryId, {
          startTime: adjustedStartTime,
        });
      }
      setPausedTime(0);
      setIsPaused(false);
      return;
    }

    const newEntry: TimeEntry = {
      id: generateId(),
      projectId: selectedProjectId,
      startTime: new Date(),
      endTime: null,
      duration: 0,
      notes: entryNotes,
      isBillable,
      isManual: false,
    };

    addTimeEntry(newEntry);
    setActiveEntryId(newEntry.id);
    setIsPaused(false);
    setPausedTime(0);
  };

  const handlePauseTimer = () => {
    if (!activeEntryId) return;

    // Toggle pause state
    if (!isPaused) {
      // Pausing - save current time and stop the interval
      setPausedTime(currentTime);
      setIsPaused(true);
    } else {
      // Resuming - adjust the start time so elapsed calculation works correctly
      // Set startTime to (now - pausedTime) so that Date.now() - startTime = pausedTime
      const activeEntry = timeEntries.find((e) => e.id === activeEntryId);
      if (activeEntry) {
        const adjustedStartTime = new Date(Date.now() - pausedTime * 1000);
        updateTimeEntry(activeEntryId, {
          startTime: adjustedStartTime,
        });
      }
      setPausedTime(0); // Reset paused time since it's now accounted for in startTime
      setIsPaused(false);
    }
  };

  const handleStopTimer = () => {
    if (!activeEntryId) return;

    const now = new Date();
    const finalDuration = roundDuration(currentTime, roundingOption);

    updateTimeEntry(activeEntryId, {
      endTime: now,
      duration: finalDuration,
      notes: entryNotes,
    });

    setActiveEntryId(null);
    setIsPaused(false);
    setPausedTime(0);
    setEntryNotes('');
  };

  // Manual time entry
  const handleManualEntry = () => {
    if (!manualProjectId) return;

    const startDateTime = new Date(`${manualDate}T${manualStartTime}`);
    const endDateTime = new Date(`${manualDate}T${manualEndTime}`);

    if (endDateTime <= startDateTime) return;

    const duration = Math.floor((endDateTime.getTime() - startDateTime.getTime()) / 1000);

    const newEntry: TimeEntry = {
      id: generateId(),
      projectId: manualProjectId,
      startTime: startDateTime,
      endTime: endDateTime,
      duration: roundDuration(duration, roundingOption),
      notes: manualNotes,
      isBillable: manualBillable,
      isManual: true,
    };

    addTimeEntry(newEntry);

    setManualNotes('');
    setShowManualEntry(false);
  };

  const handleDeleteEntry = (id: string) => {
    deleteTimeEntry(id);
  };

  // Timesheet calculations
  const getDateRange = useMemo(() => {
    const start = new Date(selectedDate);
    const end = new Date(selectedDate);

    if (timesheetView === 'daily') {
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    } else if (timesheetView === 'weekly') {
      const day = start.getDay();
      start.setDate(start.getDate() - day);
      start.setHours(0, 0, 0, 0);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
    } else {
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(end.getMonth() + 1);
      end.setDate(0);
      end.setHours(23, 59, 59, 999);
    }

    return { start, end };
  }, [selectedDate, timesheetView]);

  const filteredEntries = useMemo(() => {
    const { start, end } = getDateRange;
    return timeEntries.filter((entry) => {
      const entryDate = new Date(entry.startTime);
      return entryDate >= start && entryDate <= end && entry.endTime !== null;
    });
  }, [timeEntries, getDateRange]);

  const totalStats = useMemo(() => {
    let totalSeconds = 0;
    let billableSeconds = 0;
    let nonBillableSeconds = 0;
    let totalEarnings = 0;

    filteredEntries.forEach((entry) => {
      const project = getProjectById(entry.projectId);
      totalSeconds += entry.duration;
      if (entry.isBillable) {
        billableSeconds += entry.duration;
        if (project) {
          totalEarnings += (entry.duration / 3600) * project.hourlyRate;
        }
      } else {
        nonBillableSeconds += entry.duration;
      }
    });

    return {
      totalHours: totalSeconds / 3600,
      billableHours: billableSeconds / 3600,
      nonBillableHours: nonBillableSeconds / 3600,
      totalEarnings,
    };
  }, [filteredEntries, projects]);

  const projectStats = useMemo(() => {
    const stats: Record<string, { totalSeconds: number; billableSeconds: number; earnings: number }> = {};

    projects.forEach((project) => {
      stats[project.id] = { totalSeconds: 0, billableSeconds: 0, earnings: 0 };
    });

    timeEntries.forEach((entry) => {
      if (entry.endTime && stats[entry.projectId]) {
        stats[entry.projectId].totalSeconds += entry.duration;
        if (entry.isBillable) {
          stats[entry.projectId].billableSeconds += entry.duration;
          const project = getProjectById(entry.projectId);
          if (project) {
            stats[entry.projectId].earnings += (entry.duration / 3600) * project.hourlyRate;
          }
        }
      }
    });

    return stats;
  }, [timeEntries, projects]);

  const formatDateRange = (): string => {
    const { start, end } = getDateRange;
    if (timesheetView === 'daily') {
      return start.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    } else if (timesheetView === 'weekly') {
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } else {
      return start.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    }
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    if (timesheetView === 'daily') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    } else if (timesheetView === 'weekly') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    setSelectedDate(newDate);
  };

  const activeProject = activeEntryId
    ? getProjectById(timeEntries.find((e) => e.id === activeEntryId)?.projectId || '')
    : null;

  // Combined columns for export with enriched time entry data
  const exportColumns: ColumnConfig[] = [
    { key: 'date', header: 'Date', type: 'date' },
    { key: 'projectName', header: 'Project', type: 'string' },
    { key: 'clientName', header: 'Client', type: 'string' },
    { key: 'startTime', header: 'Start Time', type: 'string' },
    { key: 'endTime', header: 'End Time', type: 'string' },
    { key: 'hours', header: 'Hours', type: 'number' },
    { key: 'isBillable', header: 'Billable', type: 'boolean' },
    { key: 'rate', header: 'Rate', type: 'currency' },
    { key: 'earnings', header: 'Earnings', type: 'currency' },
    { key: 'notes', header: 'Notes', type: 'string' },
  ];

  // Prepare export data with enriched project info
  const exportData = useMemo(() => {
    return filteredEntries.map((entry) => {
      const project = getProjectById(entry.projectId);
      const hours = entry.duration / 3600;
      const earnings = entry.isBillable && project ? hours * project.hourlyRate : 0;
      return {
        date: new Date(entry.startTime).toLocaleDateString(),
        projectName: project?.name || 'Unknown',
        clientName: project?.client || '',
        startTime: new Date(entry.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        endTime: entry.endTime ? new Date(entry.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
        hours: parseFloat(hours.toFixed(2)),
        isBillable: entry.isBillable,
        rate: project?.hourlyRate || 0,
        earnings: parseFloat(earnings.toFixed(2)),
        notes: entry.notes || '',
      };
    });
  }, [filteredEntries, projects]);

  // Export handlers
  const handleExportCSV = () => {
    exportToCSV(exportData, exportColumns, {
      filename: `timesheet-${timesheetView}-${selectedDate.toISOString().split('T')[0]}`,
    });
  };

  const handleExportExcel = () => {
    exportToExcel(exportData, exportColumns, {
      filename: `timesheet-${timesheetView}-${selectedDate.toISOString().split('T')[0]}`,
    });
  };

  const handleExportJSON = () => {
    exportToJSON(exportData, {
      filename: `timesheet-${timesheetView}-${selectedDate.toISOString().split('T')[0]}`,
    });
  };

  const handleExportPDF = async () => {
    await exportToPDF(exportData, exportColumns, {
      filename: `timesheet-${timesheetView}-${selectedDate.toISOString().split('T')[0]}`,
      title: 'Freelance Timesheet',
      subtitle: formatDateRange(),
    });
  };

  const handlePrint = () => {
    printData(exportData, exportColumns, {
      title: `Timesheet - ${formatDateRange()}`,
    });
  };

  const handleCopyToClipboard = async () => {
    return await copyUtil(exportData, exportColumns, 'tab');
  };

  return (
    <div className={`max-w-6xl mx-auto p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-[#0D9488]">
            <Timer className="w-6 h-6 text-white" />
          </div>
          <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.freelanceTimer.freelanceTimer', 'Freelance Timer')}
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <WidgetEmbedButton toolSlug="freelance-timer" toolName="Freelance Timer" />

          <SyncStatus
            isSynced={isSynced}
            isSaving={isSaving}
            lastSaved={lastSaved}
            syncError={syncError}
            onForceSync={forceSync}
            theme={theme}
          />
          <ExportDropdown
            onExportCSV={handleExportCSV}
            onExportExcel={handleExportExcel}
            onExportJSON={handleExportJSON}
            onExportPDF={handleExportPDF}
            onPrint={handlePrint}
            onCopyToClipboard={handleCopyToClipboard}
            showImport={false}
            theme={theme}
          />
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-lg transition-colors ${
              theme === 'dark' ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-200 text-gray-600'
            }`}
          >
            <Settings className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Prefill Indicator */}
      {isPrefilled && (
        <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
          <Sparkles className="w-4 h-4 text-[#0D9488]" />
          <span className="text-sm text-[#0D9488] font-medium">{t('tools.freelanceTimer.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <div className={`mb-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.freelanceTimer.settings', 'Settings')}
          </h3>
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.freelanceTimer.timeRounding', 'Time Rounding')}
              </label>
              <select
                value={roundingOption}
                onChange={(e) => setRoundingOption(e.target.value as RoundingOption)}
                className={`w-full px-3 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-600 border-gray-500 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="none">{t('tools.freelanceTimer.noRounding', 'No Rounding')}</option>
                <option value="6min">{t('tools.freelanceTimer.nearest6Minutes01', 'Nearest 6 minutes (0.1 hr)')}</option>
                <option value="15min">{t('tools.freelanceTimer.nearest15Minutes025', 'Nearest 15 minutes (0.25 hr)')}</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Timer & Projects */}
        <div className="lg:col-span-1 space-y-6">
          {/* Active Timer */}
          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              <Clock className="w-5 h-5 inline mr-2" />
              {t('tools.freelanceTimer.timer', 'Timer')}
            </h3>

            {/* Project Selection */}
            <div className="mb-4">
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.freelanceTimer.selectProject', 'Select Project')}
              </label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                disabled={!!activeEntryId}
                className={`w-full px-3 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-600 border-gray-500 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } ${activeEntryId ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <option value="">{t('tools.freelanceTimer.chooseAProject', 'Choose a project...')}</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name} ({project.client})
                  </option>
                ))}
              </select>
            </div>

            {/* Timer Display */}
            <div
              className={`text-center py-6 rounded-lg mb-4 ${theme === 'dark' ? 'bg-gray-600' : 'bg-white'}`}
              style={{ borderLeft: activeProject ? `4px solid ${activeProject.color}` : undefined }}
            >
              <div className={`text-5xl font-mono font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {formatDuration(currentTime)}
              </div>
              {activeProject && (
                <div className="mt-2 text-sm" style={{ color: activeProject.color }}>
                  {activeProject.name}
                </div>
              )}
            </div>

            {/* Billable Toggle */}
            <div className="flex items-center justify-between mb-4">
              <label className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.freelanceTimer.billable', 'Billable')}</label>
              <button
                onClick={() => setIsBillable(!isBillable)}
                disabled={!!activeEntryId}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  isBillable ? 'bg-[#0D9488]' : theme === 'dark' ? 'bg-gray-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    isBillable ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>

            {/* Notes */}
            <div className="mb-4">
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.freelanceTimer.notes2', 'Notes')}
              </label>
              <textarea
                value={entryNotes}
                onChange={(e) => setEntryNotes(e.target.value)}
                placeholder={t('tools.freelanceTimer.whatAreYouWorkingOn', 'What are you working on?')}
                rows={2}
                className={`w-full px-3 py-2 rounded-lg border resize-none ${
                  theme === 'dark'
                    ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>

            {/* Timer Controls */}
            <div className="flex gap-2">
              {!activeEntryId ? (
                <button
                  onClick={handleStartTimer}
                  disabled={!selectedProjectId}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                    selectedProjectId
                      ? t('tools.freelanceTimer.bg0d9488HoverBg0f766e', 'bg-[#0D9488] hover:bg-[#0F766E] text-white') : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Play className="w-5 h-5" />
                  {t('tools.freelanceTimer.start', 'Start')}
                </button>
              ) : (
                <>
                  <button
                    onClick={handlePauseTimer}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                      isPaused
                        ? t('tools.freelanceTimer.bg0d9488HoverBg0f766e2', 'bg-[#0D9488] hover:bg-[#0F766E] text-white') : 'bg-amber-500 hover:bg-amber-600 text-white'
                    }`}
                  >
                    {isPaused ? (
                      <>
                        <Play className="w-5 h-5" />
                        {t('tools.freelanceTimer.resume', 'Resume')}
                      </>
                    ) : (
                      <>
                        <Pause className="w-5 h-5" />
                        {t('tools.freelanceTimer.pause', 'Pause')}
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleStopTimer}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium bg-red-500 hover:bg-red-600 text-white transition-colors"
                  >
                    <Square className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Manual Entry Button */}
            <button
              onClick={() => setShowManualEntry(!showManualEntry)}
              className={`w-full mt-3 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-600 hover:bg-gray-500 text-gray-200'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              <FileText className="w-4 h-4" />
              {t('tools.freelanceTimer.manualEntry', 'Manual Entry')}
            </button>
          </div>

          {/* Manual Entry Form */}
          {showManualEntry && (
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.freelanceTimer.manualTimeEntry', 'Manual Time Entry')}
              </h3>
              <div className="space-y-3">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.freelanceTimer.project2', 'Project')}
                  </label>
                  <select
                    value={manualProjectId}
                    onChange={(e) => setManualProjectId(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="">{t('tools.freelanceTimer.chooseAProject2', 'Choose a project...')}</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.freelanceTimer.date2', 'Date')}
                  </label>
                  <input
                    type="date"
                    value={manualDate}
                    onChange={(e) => setManualDate(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.freelanceTimer.startTime', 'Start Time')}
                    </label>
                    <input
                      type="time"
                      value={manualStartTime}
                      onChange={(e) => setManualStartTime(e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-600 border-gray-500 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.freelanceTimer.endTime', 'End Time')}
                    </label>
                    <input
                      type="time"
                      value={manualEndTime}
                      onChange={(e) => setManualEndTime(e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-600 border-gray-500 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <label className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.freelanceTimer.billable2', 'Billable')}</label>
                  <button
                    onClick={() => setManualBillable(!manualBillable)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      manualBillable ? 'bg-[#0D9488]' : theme === 'dark' ? 'bg-gray-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        manualBillable ? 'left-7' : 'left-1'
                      }`}
                    />
                  </button>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.freelanceTimer.notes3', 'Notes')}
                  </label>
                  <textarea
                    value={manualNotes}
                    onChange={(e) => setManualNotes(e.target.value)}
                    rows={2}
                    className={`w-full px-3 py-2 rounded-lg border resize-none ${
                      theme === 'dark'
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <button
                  onClick={handleManualEntry}
                  disabled={!manualProjectId}
                  className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                    manualProjectId
                      ? t('tools.freelanceTimer.bg0d9488HoverBg0f766e3', 'bg-[#0D9488] hover:bg-[#0F766E] text-white') : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {t('tools.freelanceTimer.addEntry', 'Add Entry')}
                </button>
              </div>
            </div>
          )}

          {/* Projects List */}
          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                <Briefcase className="w-5 h-5 inline mr-2" />
                {t('tools.freelanceTimer.projects', 'Projects')}
              </h3>
              <button
                onClick={() => {
                  resetProjectForm();
                  setEditingProject(null);
                  setShowProjectForm(!showProjectForm);
                }}
                className="p-2 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Project Form */}
            {showProjectForm && (
              <div className={`mb-4 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-600' : 'bg-white'}`}>
                <h4 className={`text-sm font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {editingProject ? t('tools.freelanceTimer.editProject', 'Edit Project') : t('tools.freelanceTimer.newProject', 'New Project')}
                </h4>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder={t('tools.freelanceTimer.projectName', 'Project Name')}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-500 border-gray-400 text-white placeholder-gray-300'
                        : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                  <input
                    type="text"
                    value={projectClient}
                    onChange={(e) => setProjectClient(e.target.value)}
                    placeholder={t('tools.freelanceTimer.clientName', 'Client Name')}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-500 border-gray-400 text-white placeholder-gray-300'
                        : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={`block text-xs mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        {t('tools.freelanceTimer.hourlyRate', 'Hourly Rate ($)')}
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={projectRate}
                        onChange={(e) => setProjectRate(Number(e.target.value))}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-500 border-gray-400 text-white'
                            : 'bg-gray-50 border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-xs mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        {t('tools.freelanceTimer.budgetHrs', 'Budget (hrs)')}
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={projectBudget}
                        onChange={(e) => setProjectBudget(Number(e.target.value))}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-500 border-gray-400 text-white'
                            : 'bg-gray-50 border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={`block text-xs mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      {t('tools.freelanceTimer.color', 'Color')}
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {PROJECT_COLORS.map((color) => (
                        <button
                          key={color}
                          onClick={() => setProjectColor(color)}
                          className={`w-6 h-6 rounded-full transition-transform ${
                            projectColor === color ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={editingProject ? handleUpdateProject : handleAddProject}
                      className="flex-1 px-4 py-2 rounded-lg font-medium bg-[#0D9488] hover:bg-[#0F766E] text-white transition-colors"
                    >
                      {editingProject ? t('tools.freelanceTimer.update', 'Update') : t('tools.freelanceTimer.add', 'Add')}
                    </button>
                    <button
                      onClick={() => {
                        setShowProjectForm(false);
                        setEditingProject(null);
                        resetProjectForm();
                      }}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        theme === 'dark'
                          ? 'bg-gray-500 hover:bg-gray-400 text-white'
                          : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                      }`}
                    >
                      {t('tools.freelanceTimer.cancel', 'Cancel')}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Project Cards */}
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {projects.length === 0 ? (
                <p className={`text-sm text-center py-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.freelanceTimer.noProjectsYetAddOne', 'No projects yet. Add one to get started!')}
                </p>
              ) : (
                projects.map((project) => {
                  const stats = projectStats[project.id] || { totalSeconds: 0, billableSeconds: 0, earnings: 0 };
                  const usedHours = stats.totalSeconds / 3600;
                  const budgetPercent = project.budgetHours > 0 ? (usedHours / project.budgetHours) * 100 : 0;

                  return (
                    <div
                      key={project.id}
                      className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-600' : 'bg-white'}`}
                      style={{ borderLeft: `4px solid ${project.color}` }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {project.name}
                          </h4>
                          <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            {project.client}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEditProject(project)}
                            className={`p-1 rounded transition-colors ${
                              theme === 'dark' ? 'hover:bg-gray-500 text-gray-300' : 'hover:bg-gray-100 text-gray-500'
                            }`}
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteProject(project.id)}
                            className={`p-1 rounded transition-colors ${
                              theme === 'dark' ? 'hover:bg-gray-500 text-gray-300' : 'hover:bg-gray-100 text-gray-500'
                            }`}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                          ${project.hourlyRate}/hr
                        </span>
                        <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                          {usedHours.toFixed(1)} / {project.budgetHours}h
                        </span>
                      </div>
                      {/* Budget Progress Bar */}
                      <div className={`h-2 rounded-full ${theme === 'dark' ? 'bg-gray-500' : 'bg-gray-200'}`}>
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${Math.min(budgetPercent, 100)}%`,
                            backgroundColor: budgetPercent > 90 ? '#ef4444' : budgetPercent > 75 ? '#f59e0b' : project.color,
                          }}
                        />
                      </div>
                      <div className="mt-2 text-xs text-right" style={{ color: project.color }}>
                        ${stats.earnings.toFixed(2)} earned
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Timesheet */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Clock className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.freelanceTimer.totalHours', 'Total Hours')}</span>
              </div>
              <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {totalStats.totalHours.toFixed(1)}
              </div>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Target className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.freelanceTimer.billable3', 'Billable')}</span>
              </div>
              <div className="text-2xl font-bold text-[#0D9488]">{totalStats.billableHours.toFixed(1)}</div>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.freelanceTimer.nonBillable', 'Non-Billable')}</span>
              </div>
              <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                {totalStats.nonBillableHours.toFixed(1)}
              </div>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.freelanceTimer.earnings', 'Earnings')}</span>
              </div>
              <div className="text-2xl font-bold text-green-500">${totalStats.totalEarnings.toFixed(2)}</div>
            </div>
          </div>

          {/* Timesheet View Controls */}
          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Calendar className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.freelanceTimer.timesheet', 'Timesheet')}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                {/* View Toggle */}
                <div className={`flex rounded-lg ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'}`}>
                  {(['daily', 'weekly', 'monthly'] as TimesheetView[]).map((view) => (
                    <button
                      key={view}
                      onClick={() => setTimesheetView(view)}
                      className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
                        timesheetView === view
                          ? 'bg-[#0D9488] text-white'
                          : theme === 'dark'
                          ? 'text-gray-300 hover:bg-gray-500'
                          : 'text-gray-600 hover:bg-gray-300'
                      }`}
                    >
                      {view.charAt(0).toUpperCase() + view.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Date Navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => navigateDate('prev')}
                className={`p-2 rounded-lg transition-colors ${
                  theme === 'dark' ? 'hover:bg-gray-600 text-gray-300' : 'hover:bg-gray-200 text-gray-600'
                }`}
              >
                <ChevronUp className="w-5 h-5 rotate-[-90deg]" />
              </button>
              <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {formatDateRange()}
              </span>
              <button
                onClick={() => navigateDate('next')}
                className={`p-2 rounded-lg transition-colors ${
                  theme === 'dark' ? 'hover:bg-gray-600 text-gray-300' : 'hover:bg-gray-200 text-gray-600'
                }`}
              >
                <ChevronDown className="w-5 h-5 rotate-[-90deg]" />
              </button>
            </div>

            {/* Time Entries Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`text-left text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    <th className="pb-3 font-medium">{t('tools.freelanceTimer.project', 'Project')}</th>
                    <th className="pb-3 font-medium">{t('tools.freelanceTimer.date', 'Date')}</th>
                    <th className="pb-3 font-medium">{t('tools.freelanceTimer.time', 'Time')}</th>
                    <th className="pb-3 font-medium">{t('tools.freelanceTimer.duration', 'Duration')}</th>
                    <th className="pb-3 font-medium">{t('tools.freelanceTimer.billable4', 'Billable')}</th>
                    <th className="pb-3 font-medium">{t('tools.freelanceTimer.earnings2', 'Earnings')}</th>
                    <th className="pb-3 font-medium">{t('tools.freelanceTimer.notes', 'Notes')}</th>
                    <th className="pb-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody className={`text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                  {filteredEntries.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center">
                        <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                          {t('tools.freelanceTimer.noTimeEntriesForThis', 'No time entries for this period.')}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredEntries.map((entry) => {
                      const project = getProjectById(entry.projectId);
                      const hours = entry.duration / 3600;
                      const earnings = entry.isBillable && project ? hours * project.hourlyRate : 0;

                      return (
                        <tr key={entry.id} className={`border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <span
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: project?.color || '#888' }}
                              />
                              <span>{project?.name || 'Unknown'}</span>
                            </div>
                          </td>
                          <td className="py-3">{new Date(entry.startTime).toLocaleDateString()}</td>
                          <td className="py-3">
                            {new Date(entry.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                            {entry.endTime
                              ? new Date(entry.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                              : '-'}
                          </td>
                          <td className="py-3">{formatHours(entry.duration)}h</td>
                          <td className="py-3">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                entry.isBillable
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                  : 'bg-gray-100 text-gray-600 dark:bg-gray-600 dark:text-gray-300'
                              }`}
                            >
                              {entry.isBillable ? 'Yes' : 'No'}
                            </span>
                          </td>
                          <td className="py-3 text-green-500">${earnings.toFixed(2)}</td>
                          <td className="py-3 max-w-32 truncate">{entry.notes || '-'}</td>
                          <td className="py-3">
                            <button
                              onClick={() => handleDeleteEntry(entry.id)}
                              className={`p-1 rounded transition-colors ${
                                theme === 'dark' ? 'hover:bg-gray-600 text-gray-400' : 'hover:bg-gray-200 text-gray-500'
                              }`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Project Budget Overview */}
          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              <Target className="w-5 h-5 inline mr-2" />
              {t('tools.freelanceTimer.projectBudgetOverview', 'Project Budget Overview')}
            </h3>
            {projects.length === 0 ? (
              <p className={`text-sm text-center py-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('tools.freelanceTimer.addProjectsToSeeBudget', 'Add projects to see budget tracking.')}
              </p>
            ) : (
              <div className="space-y-4">
                {projects.map((project) => {
                  const stats = projectStats[project.id] || { totalSeconds: 0, billableSeconds: 0, earnings: 0 };
                  const usedHours = stats.totalSeconds / 3600;
                  const budgetPercent = project.budgetHours > 0 ? (usedHours / project.budgetHours) * 100 : 0;
                  const remainingHours = Math.max(0, project.budgetHours - usedHours);
                  const remainingBudget = remainingHours * project.hourlyRate;

                  return (
                    <div key={project.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: project.color }}
                          />
                          <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {project.name}
                          </span>
                        </div>
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                          {usedHours.toFixed(1)}h / {project.budgetHours}h ({budgetPercent.toFixed(0)}%)
                        </span>
                      </div>
                      <div className={`h-3 rounded-full ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'}`}>
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${Math.min(budgetPercent, 100)}%`,
                            backgroundColor: budgetPercent > 90 ? '#ef4444' : budgetPercent > 75 ? '#f59e0b' : project.color,
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                          {remainingHours.toFixed(1)}h remaining
                        </span>
                        <span className="text-green-500">${remainingBudget.toFixed(2)} remaining budget</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreelanceTimerTool;
