'use client';
import { useTranslation } from 'react-i18next';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Calendar,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Flag,
  AlertTriangle,
  CloudRain,
  Users,
  BarChart3,
  Clock,
  CheckCircle2,
  Circle,
  ArrowRight,
  Layers,
  Target,
  Save,
  FolderOpen,
  Sparkles,
} from 'lucide-react';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
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
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import useToolData from '../../hooks/useToolData';

interface ProjectTimelineToolProps {
  uiConfig?: UIConfig;
}

// Types
interface Task {
  id: string;
  name: string;
  phase: Phase;
  startDate: string;
  duration: number;
  dependencies: string[];
  resource: string;
  progress: number;
  isMilestone: boolean;
  weatherBuffer: number;
  notes: string;
}

interface Project {
  id: string;
  name: string;
  startDate: string;
  tasks: Task[];
  createdAt: string;
  updatedAt: string;
}

type Phase = 'design' | 'permits' | 'foundation' | 'framing' | 'mep' | 'finish';

interface DelayImpact {
  taskId: string;
  taskName: string;
  originalEnd: string;
  newEnd: string;
  delayDays: number;
  affectedTasks: string[];
}

// Constants
const PHASES: { value: Phase; label: string; color: string }[] = [
  { value: 'design', label: 'Design', color: '#3B82F6' },
  { value: 'permits', label: 'Permits', color: '#8B5CF6' },
  { value: 'foundation', label: 'Foundation', color: '#F59E0B' },
  { value: 'framing', label: 'Framing', color: '#10B981' },
  { value: 'mep', label: 'MEP (Mechanical/Electrical/Plumbing)', color: '#EF4444' },
  { value: 'finish', label: 'Finish', color: '#EC4899' },
];

const RESOURCES = [
  'General Contractor',
  'Architect',
  'Structural Engineer',
  'Electrician',
  'Plumber',
  'HVAC Technician',
  'Framing Crew',
  'Concrete Crew',
  'Roofing Crew',
  'Drywall Crew',
  'Painting Crew',
  'Flooring Crew',
  'Landscaping Crew',
  'Inspector',
  'Unassigned',
];

const STORAGE_KEY = 'project-timeline-data';

// Column configuration for exports
const TASK_EXPORT_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Task Name', type: 'string' },
  { key: 'phase', header: 'Phase', type: 'string' },
  { key: 'startDate', header: 'Start Date', type: 'date' },
  { key: 'endDate', header: 'End Date', type: 'date' },
  { key: 'duration', header: 'Duration (days)', type: 'number' },
  { key: 'weatherBuffer', header: 'Weather Buffer (days)', type: 'number' },
  { key: 'resource', header: 'Resource', type: 'string' },
  { key: 'progress', header: 'Progress (%)', type: 'number' },
  { key: 'isMilestone', header: 'Milestone', type: 'boolean' },
  { key: 'isCritical', header: 'Critical Path', type: 'boolean' },
  { key: 'dependencies', header: 'Dependencies', type: 'string' },
  { key: 'notes', header: 'Notes', type: 'string' },
];

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);

// Extend Task interface to include id for useToolData compatibility
interface TaskWithId extends Task {
  id: string;
}

// Extend Project interface to include id for useToolData compatibility
interface ProjectWithId extends Project {
  id: string;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const addDays = (dateString: string, days: number): string => {
  const date = new Date(dateString);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

const daysBetween = (start: string, end: string): number => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  return Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
};

const getEndDate = (task: Task): string => {
  return addDays(task.startDate, task.duration + task.weatherBuffer - 1);
};

const getPhaseColor = (phase: Phase): string => {
  return PHASES.find((p) => p.value === phase)?.color || '#6B7280';
};

export const ProjectTimelineTool = ({ uiConfig }: ProjectTimelineToolProps) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const printRef = useRef<HTMLDivElement>(null);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Use useToolData hook for projects management with backend sync
  const {
    data: projects,
    addItem: addProject,
    updateItem: updateProject,
    deleteItem: deleteProject,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<ProjectWithId>('project-timeline', [], TASK_EXPORT_COLUMNS, {
    autoSave: true,
    autoSaveDelay: 2000,
  });

  // UI State
  const [currentProject, setCurrentProject] = useState<ProjectWithId | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedPhaseFilter, setSelectedPhaseFilter] = useState<Phase | 'all'>('all');
  const [viewMode, setViewMode] = useState<'gantt' | 'list' | 'analysis'>('gantt');
  const [timelineScale, setTimelineScale] = useState<'day' | 'week' | 'month'>('week');
  const [showDelayAnalysis, setShowDelayAnalysis] = useState(false);
  const [delayTaskId, setDelayTaskId] = useState<string>('');
  const [delayDays, setDelayDays] = useState<number>(0);
  const [delayImpact, setDelayImpact] = useState<DelayImpact | null>(null);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectStartDate, setNewProjectStartDate] = useState('');

  // Task form state
  const [taskForm, setTaskForm] = useState({
    name: '',
    phase: 'design' as Phase,
    startDate: '',
    duration: 1,
    dependencies: [] as string[],
    resource: 'Unassigned',
    progress: 0,
    isMilestone: false,
    weatherBuffer: 0,
    notes: '',
  });

  // Prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.projectName || params.title) {
        setNewProjectName(params.projectName || params.title || '');
        setNewProjectStartDate(new Date().toISOString().split('T')[0]);
        setShowProjectForm(true);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Calculate critical path
  const criticalPath = useMemo(() => {
    if (!currentProject || currentProject.tasks.length === 0) return [];

    const tasks = currentProject.tasks;
    const taskMap = new Map(tasks.map((t) => [t.id, t]));

    // Calculate early start and early finish for each task
    const earlyStart = new Map<string, number>();
    const earlyFinish = new Map<string, number>();
    const lateStart = new Map<string, number>();
    const lateFinish = new Map<string, number>();

    const projectStart = new Date(currentProject.startDate).getTime();

    // Forward pass
    const sortedTasks = [...tasks].sort((a, b) => {
      const aStart = new Date(a.startDate).getTime();
      const bStart = new Date(b.startDate).getTime();
      return aStart - bStart;
    });

    sortedTasks.forEach((task) => {
      let maxPredFinish = 0;
      task.dependencies.forEach((depId) => {
        const depTask = taskMap.get(depId);
        if (depTask) {
          const depFinish = earlyFinish.get(depId) || 0;
          maxPredFinish = Math.max(maxPredFinish, depFinish);
        }
      });

      const taskStart = daysBetween(
        currentProject.startDate,
        task.startDate
      );
      const es = Math.max(taskStart, maxPredFinish);
      earlyStart.set(task.id, es);
      earlyFinish.set(task.id, es + task.duration + task.weatherBuffer);
    });

    // Find project end
    let projectEnd = 0;
    tasks.forEach((task) => {
      const ef = earlyFinish.get(task.id) || 0;
      projectEnd = Math.max(projectEnd, ef);
    });

    // Backward pass
    [...sortedTasks].reverse().forEach((task) => {
      const successors = tasks.filter((t) => t.dependencies.includes(task.id));
      let minSuccStart = projectEnd;

      successors.forEach((succ) => {
        const succLS = lateStart.get(succ.id);
        if (succLS !== undefined) {
          minSuccStart = Math.min(minSuccStart, succLS);
        }
      });

      const lf = successors.length === 0 ? projectEnd : minSuccStart;
      lateFinish.set(task.id, lf);
      lateStart.set(task.id, lf - task.duration - task.weatherBuffer);
    });

    // Find critical path (tasks with zero slack)
    const critical: string[] = [];
    tasks.forEach((task) => {
      const es = earlyStart.get(task.id) || 0;
      const ls = lateStart.get(task.id) || 0;
      const slack = ls - es;
      if (slack === 0) {
        critical.push(task.id);
      }
    });

    return critical;
  }, [currentProject]);

  // Timeline calculations
  const timelineData = useMemo(() => {
    if (!currentProject || currentProject.tasks.length === 0) {
      return { startDate: new Date(), endDate: new Date(), totalDays: 30, weeks: [] };
    }

    const tasks = currentProject.tasks;
    let minDate = new Date(currentProject.startDate);
    let maxDate = new Date(currentProject.startDate);

    tasks.forEach((task) => {
      const taskStart = new Date(task.startDate);
      const taskEnd = new Date(getEndDate(task));
      if (taskStart < minDate) minDate = taskStart;
      if (taskEnd > maxDate) maxDate = taskEnd;
    });

    // Add buffer
    minDate.setDate(minDate.getDate() - 7);
    maxDate.setDate(maxDate.getDate() + 14);

    const totalDays = daysBetween(minDate.toISOString().split('T')[0], maxDate.toISOString().split('T')[0]);

    // Generate weeks
    const weeks: { start: Date; end: Date; label: string }[] = [];
    const current = new Date(minDate);
    while (current <= maxDate) {
      const weekStart = new Date(current);
      const weekEnd = new Date(current);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weeks.push({
        start: weekStart,
        end: weekEnd,
        label: `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
      });
      current.setDate(current.getDate() + 7);
    }

    return { startDate: minDate, endDate: maxDate, totalDays, weeks };
  }, [currentProject]);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    if (!currentProject) return [];
    return currentProject.tasks.filter(
      (task) => selectedPhaseFilter === 'all' || task.phase === selectedPhaseFilter
    );
  }, [currentProject, selectedPhaseFilter]);

  // Handlers
  const createProject = () => {
    if (!newProjectName || !newProjectStartDate) return;

    const project: ProjectWithId = {
      id: generateId(),
      name: newProjectName,
      startDate: newProjectStartDate,
      tasks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addProject(project);
    setCurrentProject(project);
    setShowProjectForm(false);
    setNewProjectName('');
    setNewProjectStartDate('');
  };

  const handleDeleteProject = async (projectId: string) => {
    const confirmed = await confirm({
      title: 'Delete Project',
      message: 'Are you sure you want to delete this project?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (!confirmed) return;
    deleteProject(projectId);
    if (currentProject?.id === projectId) {
      setCurrentProject(null);
    }
  };

  const addTask = () => {
    if (!currentProject || !taskForm.name || !taskForm.startDate) return;

    const newTask: Task = {
      id: generateId(),
      ...taskForm,
    };

    const updatedProject = {
      ...currentProject,
      tasks: [...currentProject.tasks, newTask],
      updatedAt: new Date().toISOString(),
    };

    setCurrentProject(updatedProject);
    updateProject(currentProject.id, { tasks: updatedProject.tasks, updatedAt: updatedProject.updatedAt });
    resetTaskForm();
    setShowTaskForm(false);
  };

  const updateTaskHandler = () => {
    if (!currentProject || !editingTask || !taskForm.name || !taskForm.startDate) return;

    const updatedTask: Task = {
      ...editingTask,
      ...taskForm,
    };

    const updatedProject = {
      ...currentProject,
      tasks: currentProject.tasks.map((t) => (t.id === editingTask.id ? updatedTask : t)),
      updatedAt: new Date().toISOString(),
    };

    setCurrentProject(updatedProject);
    updateProject(currentProject.id, { tasks: updatedProject.tasks, updatedAt: updatedProject.updatedAt });
    setEditingTask(null);
    resetTaskForm();
    setShowTaskForm(false);
  };

  const deleteTaskHandler = async (taskId: string) => {
    if (!currentProject) return;
    const confirmed = await confirm({
      title: 'Delete Task',
      message: 'Are you sure you want to delete this task?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (!confirmed) return;

    const updatedProject = {
      ...currentProject,
      tasks: currentProject.tasks.filter((t) => t.id !== taskId),
      updatedAt: new Date().toISOString(),
    };

    // Remove from dependencies
    updatedProject.tasks = updatedProject.tasks.map((t) => ({
      ...t,
      dependencies: t.dependencies.filter((d) => d !== taskId),
    }));

    setCurrentProject(updatedProject);
    updateProject(currentProject.id, { tasks: updatedProject.tasks, updatedAt: updatedProject.updatedAt });
  };

  const updateTaskProgress = (taskId: string, progress: number) => {
    if (!currentProject) return;

    const updatedProject = {
      ...currentProject,
      tasks: currentProject.tasks.map((t) =>
        t.id === taskId ? { ...t, progress: Math.min(100, Math.max(0, progress)) } : t
      ),
      updatedAt: new Date().toISOString(),
    };

    setCurrentProject(updatedProject);
    updateProject(currentProject.id, { tasks: updatedProject.tasks, updatedAt: updatedProject.updatedAt });
  };

  const resetTaskForm = () => {
    setTaskForm({
      name: '',
      phase: 'design',
      startDate: currentProject?.startDate || '',
      duration: 1,
      dependencies: [],
      resource: 'Unassigned',
      progress: 0,
      isMilestone: false,
      weatherBuffer: 0,
      notes: '',
    });
  };

  const startEditTask = (task: Task) => {
    setEditingTask(task);
    setTaskForm({
      name: task.name,
      phase: task.phase,
      startDate: task.startDate,
      duration: task.duration,
      dependencies: task.dependencies,
      resource: task.resource,
      progress: task.progress,
      isMilestone: task.isMilestone,
      weatherBuffer: task.weatherBuffer,
      notes: task.notes,
    });
    setShowTaskForm(true);
  };

  const analyzeDelay = () => {
    if (!currentProject || !delayTaskId || delayDays <= 0) return;

    const task = currentProject.tasks.find((t) => t.id === delayTaskId);
    if (!task) return;

    const originalEnd = getEndDate(task);
    const newEnd = addDays(originalEnd, delayDays);

    // Find affected tasks (tasks that depend on this task)
    const affected: string[] = [];
    const findAffected = (taskId: string) => {
      currentProject.tasks.forEach((t) => {
        if (t.dependencies.includes(taskId) && !affected.includes(t.id)) {
          affected.push(t.id);
          findAffected(t.id);
        }
      });
    };
    findAffected(task.id);

    setDelayImpact({
      taskId: task.id,
      taskName: task.name,
      originalEnd,
      newEnd,
      delayDays,
      affectedTasks: affected,
    });
  };

  // Calculate task position for Gantt chart
  const getTaskPosition = (task: Task) => {
    const taskStart = new Date(task.startDate);
    const daysFromStart = daysBetween(
      timelineData.startDate.toISOString().split('T')[0],
      task.startDate
    );
    const totalDuration = task.duration + task.weatherBuffer;
    const left = (daysFromStart / timelineData.totalDays) * 100;
    const width = (totalDuration / timelineData.totalDays) * 100;
    return { left: Math.max(0, left), width: Math.max(1, width) };
  };

  // Project statistics
  const projectStats = useMemo(() => {
    if (!currentProject || currentProject.tasks.length === 0) {
      return {
        totalTasks: 0,
        completedTasks: 0,
        overallProgress: 0,
        totalDuration: 0,
        weatherBufferDays: 0,
        byPhase: {},
        byResource: {},
      };
    }

    const tasks = currentProject.tasks;
    const completedTasks = tasks.filter((t) => t.progress === 100).length;
    const overallProgress =
      tasks.reduce((sum, t) => sum + t.progress, 0) / tasks.length;
    const totalDuration = tasks.reduce((sum, t) => sum + t.duration, 0);
    const weatherBufferDays = tasks.reduce((sum, t) => sum + t.weatherBuffer, 0);

    const byPhase: Record<string, { count: number; progress: number }> = {};
    const byResource: Record<string, { count: number; tasks: string[] }> = {};

    tasks.forEach((task) => {
      if (!byPhase[task.phase]) {
        byPhase[task.phase] = { count: 0, progress: 0 };
      }
      byPhase[task.phase].count++;
      byPhase[task.phase].progress += task.progress;

      if (!byResource[task.resource]) {
        byResource[task.resource] = { count: 0, tasks: [] };
      }
      byResource[task.resource].count++;
      byResource[task.resource].tasks.push(task.name);
    });

    Object.keys(byPhase).forEach((phase) => {
      byPhase[phase].progress = byPhase[phase].progress / byPhase[phase].count;
    });

    return {
      totalTasks: tasks.length,
      completedTasks,
      overallProgress,
      totalDuration,
      weatherBufferDays,
      byPhase,
      byResource,
    };
  }, [currentProject]);

  // Prepare export data with computed fields
  const exportData = useMemo(() => {
    if (!currentProject) return [];
    return currentProject.tasks.map((task) => {
      const dependencyNames = task.dependencies
        .map((d) => currentProject.tasks.find((t) => t.id === d)?.name)
        .filter(Boolean)
        .join(', ');
      return {
        name: task.name,
        phase: PHASES.find((p) => p.value === task.phase)?.label || task.phase,
        startDate: task.startDate,
        endDate: getEndDate(task),
        duration: task.duration,
        weatherBuffer: task.weatherBuffer,
        resource: task.resource,
        progress: task.progress,
        isMilestone: task.isMilestone,
        isCritical: criticalPath.includes(task.id),
        dependencies: dependencyNames,
        notes: task.notes,
      };
    });
  }, [currentProject, criticalPath]);

  // Export handlers
  const handleExportCSV = () => {
    if (!currentProject) return;
    exportToCSV(exportData, TASK_EXPORT_COLUMNS, {
      filename: `${currentProject.name.replace(/\s+/g, '_')}_timeline`,
    });
  };

  const handleExportExcel = () => {
    if (!currentProject) return;
    exportToExcel(exportData, TASK_EXPORT_COLUMNS, {
      filename: `${currentProject.name.replace(/\s+/g, '_')}_timeline`,
    });
  };

  const handleExportJSON = () => {
    if (!currentProject) return;
    exportToJSON(exportData, {
      filename: `${currentProject.name.replace(/\s+/g, '_')}_timeline`,
    });
  };

  const handleExportPDF = async () => {
    if (!currentProject) return;
    await exportToPDF(exportData, TASK_EXPORT_COLUMNS, {
      filename: `${currentProject.name.replace(/\s+/g, '_')}_timeline`,
      title: currentProject.name,
      subtitle: `Project Timeline - Started: ${formatDate(currentProject.startDate)}`,
      orientation: 'landscape',
    });
  };

  const handleCopyToClipboard = async () => {
    if (!currentProject) return false;
    return await copyUtil(exportData, TASK_EXPORT_COLUMNS);
  };

  const handlePrintData = () => {
    if (!currentProject) return;
    printData(exportData, TASK_EXPORT_COLUMNS, {
      title: `${currentProject.name} - Project Timeline`,
    });
  };

  return (
    <div
      className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4 print:bg-white print:py-0`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.projectTimeline.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <div
          className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6 print:shadow-none`}
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg print:hidden">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1
                  className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                >
                  {t('tools.projectTimeline.constructionProjectTimeline', 'Construction Project Timeline')}
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.projectTimeline.ganttChartProjectManagement', 'Gantt Chart & Project Management')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 print:hidden">
              {/* Sync Status */}
              <WidgetEmbedButton toolSlug="project-timeline" toolName="Project Timeline" />

              <SyncStatus
                isSynced={isSynced}
                isSaving={isSaving}
                lastSaved={lastSaved}
                syncError={syncError}
                onForceSync={forceSync}
                theme={theme}
                size="sm"
              />
              {currentProject && currentProject.tasks.length > 0 && (
                <ExportDropdown
                  onExportCSV={handleExportCSV}
                  onExportExcel={handleExportExcel}
                  onExportJSON={handleExportJSON}
                  onExportPDF={handleExportPDF}
                  onPrint={handlePrintData}
                  onCopyToClipboard={handleCopyToClipboard}
                  showImport={false}
                  theme={theme}
                />
              )}
            </div>
          </div>
        </div>

        {/* Project Selection / Creation */}
        {!currentProject && (
          <div
            className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}
          >
            <div className="flex items-center justify-between mb-4">
              <h2
                className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
              >
                {t('tools.projectTimeline.yourProjects', 'Your Projects')}
              </h2>
              <button
                onClick={() => setShowProjectForm(true)}
                className="flex items-center gap-2 bg-[#0D9488] hover:bg-[#0F766E] text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t('tools.projectTimeline.newProject', 'New Project')}
              </button>
            </div>

            {showProjectForm && (
              <div
                className={`mb-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}
              >
                <h3
                  className={`font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                >
                  {t('tools.projectTimeline.createNewProject', 'Create New Project')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label
                      className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
                    >
                      {t('tools.projectTimeline.projectName', 'Project Name')}
                    </label>
                    <input
                      type="text"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      placeholder={t('tools.projectTimeline.eGNewHomeConstruction', 'e.g., New Home Construction')}
                      className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                  <div>
                    <label
                      className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
                    >
                      {t('tools.projectTimeline.startDate', 'Start Date')}
                    </label>
                    <input
                      type="date"
                      value={newProjectStartDate}
                      onChange={(e) => setNewProjectStartDate(e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={createProject}
                    className="bg-[#0D9488] hover:bg-[#0F766E] text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    {t('tools.projectTimeline.createProject', 'Create Project')}
                  </button>
                  <button
                    onClick={() => {
                      setShowProjectForm(false);
                      setNewProjectName('');
                      setNewProjectStartDate('');
                    }}
                    className={`px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-600 hover:bg-gray-500 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
                  >
                    {t('tools.projectTimeline.cancel', 'Cancel')}
                  </button>
                </div>
              </div>
            )}

            {projects.length === 0 ? (
              <div className="text-center py-12">
                <FolderOpen
                  className={`w-16 h-16 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`}
                />
                <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.projectTimeline.noProjectsYetCreateYour', 'No projects yet. Create your first project to get started.')}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${theme === 'dark' ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}
                    onClick={() => setCurrentProject(project)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3
                          className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                        >
                          {project.name}
                        </h3>
                        <p
                          className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}
                        >
                          Start: {formatDate(project.startDate)}
                        </p>
                        <p
                          className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}
                        >
                          Tasks: {project.tasks.length}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteProject(project.id);
                        }}
                        className={`p-1.5 rounded ${theme === 'dark' ? 'hover:bg-gray-500 text-gray-400' : 'hover:bg-gray-200 text-gray-500'}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Main Content - When project is selected */}
        {currentProject && (
          <>
            {/* Project Header Bar */}
            <div
              className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4 mb-6 print:hidden`}
            >
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setCurrentProject(null)}
                    className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <h2
                      className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                    >
                      {currentProject.name}
                    </h2>
                    <p
                      className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}
                    >
                      Started: {formatDate(currentProject.startDate)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* View Mode Tabs */}
                  <div
                    className={`flex rounded-lg overflow-hidden ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}
                  >
                    {(['gantt', 'list', 'analysis'] as const).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setViewMode(mode)}
                        className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${viewMode === mode ? 'bg-[#0D9488] text-white' : theme === 'dark' ? 'text-gray-300 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-200'}`}
                      >
                        {mode === 'gantt' ? 'Gantt Chart' : mode === 'list' ? t('tools.projectTimeline.listView', 'List View') : t('tools.projectTimeline.analysis', 'Analysis')}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      resetTaskForm();
                      setEditingTask(null);
                      setShowTaskForm(true);
                    }}
                    className="flex items-center gap-2 bg-[#0D9488] hover:bg-[#0F766E] text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    {t('tools.projectTimeline.addTask', 'Add Task')}
                  </button>
                </div>
              </div>
            </div>

            {/* Print Header */}
            <div className="hidden print:block mb-6">
              <h2 className="text-2xl font-bold">{currentProject.name}</h2>
              <p className="text-gray-600">
                Project Start: {formatDate(currentProject.startDate)} | Generated:{' '}
                {formatDate(new Date().toISOString().split('T')[0])}
              </p>
            </div>

            {/* Task Form Modal */}
            {showTaskForm && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 print:hidden">
                <div
                  className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}
                >
                  <div
                    className={`p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}
                  >
                    <h3
                      className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                    >
                      {editingTask ? t('tools.projectTimeline.editTask', 'Edit Task') : t('tools.projectTimeline.addNewTask', 'Add New Task')}
                    </h3>
                  </div>
                  <div className="p-4 space-y-4">
                    {/* Task Name */}
                    <div>
                      <label
                        className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
                      >
                        {t('tools.projectTimeline.taskName', 'Task Name *')}
                      </label>
                      <input
                        type="text"
                        value={taskForm.name}
                        onChange={(e) => setTaskForm({ ...taskForm, name: e.target.value })}
                        placeholder={t('tools.projectTimeline.eGPourFoundation', 'e.g., Pour Foundation')}
                        className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      />
                    </div>

                    {/* Phase */}
                    <div>
                      <label
                        className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
                      >
                        {t('tools.projectTimeline.phase', 'Phase')}
                      </label>
                      <select
                        value={taskForm.phase}
                        onChange={(e) => setTaskForm({ ...taskForm, phase: e.target.value as Phase })}
                        className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      >
                        {PHASES.map((phase) => (
                          <option key={phase.value} value={phase.value}>
                            {phase.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Dates and Duration */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label
                          className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
                        >
                          {t('tools.projectTimeline.startDate2', 'Start Date *')}
                        </label>
                        <input
                          type="date"
                          value={taskForm.startDate}
                          onChange={(e) => setTaskForm({ ...taskForm, startDate: e.target.value })}
                          className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                        />
                      </div>
                      <div>
                        <label
                          className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
                        >
                          {t('tools.projectTimeline.durationDays', 'Duration (days)')}
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={taskForm.duration}
                          onChange={(e) =>
                            setTaskForm({ ...taskForm, duration: parseInt(e.target.value) || 1 })
                          }
                          className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                        />
                      </div>
                    </div>

                    {/* Weather Buffer and Progress */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label
                          className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
                        >
                          <CloudRain className="w-4 h-4 inline mr-1" />
                          {t('tools.projectTimeline.weatherBufferDays', 'Weather Buffer (days)')}
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={taskForm.weatherBuffer}
                          onChange={(e) =>
                            setTaskForm({ ...taskForm, weatherBuffer: parseInt(e.target.value) || 0 })
                          }
                          className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                        />
                      </div>
                      <div>
                        <label
                          className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
                        >
                          {t('tools.projectTimeline.progress', 'Progress (%)')}
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={taskForm.progress}
                          onChange={(e) =>
                            setTaskForm({
                              ...taskForm,
                              progress: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)),
                            })
                          }
                          className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                        />
                      </div>
                    </div>

                    {/* Resource */}
                    <div>
                      <label
                        className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
                      >
                        <Users className="w-4 h-4 inline mr-1" />
                        {t('tools.projectTimeline.resourceSubcontractor', 'Resource / Subcontractor')}
                      </label>
                      <select
                        value={taskForm.resource}
                        onChange={(e) => setTaskForm({ ...taskForm, resource: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      >
                        {RESOURCES.map((resource) => (
                          <option key={resource} value={resource}>
                            {resource}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Dependencies */}
                    <div>
                      <label
                        className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
                      >
                        {t('tools.projectTimeline.dependenciesTasksThatMustComplete', 'Dependencies (tasks that must complete first)')}
                      </label>
                      <div
                        className={`max-h-32 overflow-y-auto border rounded-lg p-2 ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                      >
                        {currentProject.tasks
                          .filter((t) => t.id !== editingTask?.id)
                          .map((task) => (
                            <label
                              key={task.id}
                              className={`flex items-center gap-2 p-1 cursor-pointer hover:bg-opacity-50 ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}
                            >
                              <input
                                type="checkbox"
                                checked={taskForm.dependencies.includes(task.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setTaskForm({
                                      ...taskForm,
                                      dependencies: [...taskForm.dependencies, task.id],
                                    });
                                  } else {
                                    setTaskForm({
                                      ...taskForm,
                                      dependencies: taskForm.dependencies.filter((d) => d !== task.id),
                                    });
                                  }
                                }}
                                className="rounded border-gray-300 text-[#0D9488] focus:ring-[#0D9488]"
                              />
                              <span
                                className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
                              >
                                {task.name}
                              </span>
                            </label>
                          ))}
                        {currentProject.tasks.length === 0 ||
                        (currentProject.tasks.length === 1 && editingTask) ? (
                          <p
                            className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}
                          >
                            {t('tools.projectTimeline.noOtherTasksAvailable', 'No other tasks available')}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    {/* Milestone */}
                    <div>
                      <label
                        className={`flex items-center gap-2 cursor-pointer ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
                      >
                        <input
                          type="checkbox"
                          checked={taskForm.isMilestone}
                          onChange={(e) =>
                            setTaskForm({ ...taskForm, isMilestone: e.target.checked })
                          }
                          className="rounded border-gray-300 text-[#0D9488] focus:ring-[#0D9488]"
                        />
                        <Flag className="w-4 h-4" />
                        <span className="text-sm font-medium">{t('tools.projectTimeline.markAsMilestone', 'Mark as Milestone')}</span>
                      </label>
                    </div>

                    {/* Notes */}
                    <div>
                      <label
                        className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
                      >
                        {t('tools.projectTimeline.notes', 'Notes')}
                      </label>
                      <textarea
                        value={taskForm.notes}
                        onChange={(e) => setTaskForm({ ...taskForm, notes: e.target.value })}
                        rows={3}
                        placeholder={t('tools.projectTimeline.additionalNotes', 'Additional notes...')}
                        className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      />
                    </div>
                  </div>
                  <div
                    className={`p-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex justify-end gap-2`}
                  >
                    <button
                      onClick={() => {
                        setShowTaskForm(false);
                        setEditingTask(null);
                        resetTaskForm();
                      }}
                      className={`px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
                    >
                      {t('tools.projectTimeline.cancel2', 'Cancel')}
                    </button>
                    <button
                      onClick={editingTask ? updateTaskHandler : addTask}
                      className="bg-[#0D9488] hover:bg-[#0F766E] text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                    >
                      {editingTask ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      {editingTask ? t('tools.projectTimeline.updateTask', 'Update Task') : t('tools.projectTimeline.addTask2', 'Add Task')}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Phase Filter */}
            <div
              className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4 mb-6 print:hidden`}
            >
              <div className="flex items-center gap-4 flex-wrap">
                <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.projectTimeline.filterByPhase', 'Filter by Phase:')}
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedPhaseFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${selectedPhaseFilter === 'all' ? 'bg-[#0D9488] text-white' : theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    {t('tools.projectTimeline.allPhases', 'All Phases')}
                  </button>
                  {PHASES.map((phase) => (
                    <button
                      key={phase.value}
                      onClick={() => setSelectedPhaseFilter(phase.value)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${selectedPhaseFilter === phase.value ? 'text-white' : theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                      style={
                        selectedPhaseFilter === phase.value ? { backgroundColor: phase.color } : {}
                      }
                    >
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: phase.color }}
                      />
                      {phase.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Gantt Chart View */}
            {viewMode === 'gantt' && (
              <div
                ref={printRef}
                className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6 overflow-x-auto print:shadow-none`}
              >
                {filteredTasks.length === 0 ? (
                  <div className="text-center py-12">
                    <Layers
                      className={`w-16 h-16 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`}
                    />
                    <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('tools.projectTimeline.noTasksYetAddYour', 'No tasks yet. Add your first task to see the Gantt chart.')}
                    </p>
                  </div>
                ) : (
                  <div className="min-w-[800px]">
                    {/* Timeline Header */}
                    <div className="flex mb-4">
                      <div className="w-64 flex-shrink-0" />
                      <div className="flex-1 flex">
                        {timelineData.weeks.map((week, idx) => (
                          <div
                            key={idx}
                            className={`flex-1 text-center text-xs font-medium py-2 border-l ${theme === 'dark' ? 'text-gray-400 border-gray-700' : 'text-gray-600 border-gray-200'}`}
                          >
                            {week.label}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Tasks */}
                    {filteredTasks.map((task) => {
                      const position = getTaskPosition(task);
                      const isCritical = criticalPath.includes(task.id);

                      return (
                        <div
                          key={task.id}
                          className={`flex items-center mb-2 py-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
                        >
                          {/* Task Info */}
                          <div className="w-64 flex-shrink-0 pr-4">
                            <div className="flex items-center gap-2">
                              {task.isMilestone && (
                                <Flag className="w-4 h-4 text-amber-500" />
                              )}
                              <span
                                className={`text-sm font-medium truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                                title={task.name}
                              >
                                {task.name}
                              </span>
                              {isCritical && (
                                <span className="px-1.5 py-0.5 text-xs bg-red-500 text-white rounded">
                                  {t('tools.projectTimeline.critical', 'Critical')}
                                </span>
                              )}
                            </div>
                            <div
                              className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}
                            >
                              {task.resource}
                            </div>
                          </div>

                          {/* Gantt Bar */}
                          <div className="flex-1 relative h-8">
                            {/* Grid lines */}
                            <div className="absolute inset-0 flex">
                              {timelineData.weeks.map((_, idx) => (
                                <div
                                  key={idx}
                                  className={`flex-1 border-l ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}
                                />
                              ))}
                            </div>

                            {/* Task bar */}
                            <div
                              className={`absolute top-1 h-6 rounded cursor-pointer transition-all ${isCritical ? 'ring-2 ring-red-500 ring-offset-2' : ''} ${theme === 'dark' ? 'ring-offset-gray-800' : 'ring-offset-white'}`}
                              style={{
                                left: `${position.left}%`,
                                width: `${position.width}%`,
                                backgroundColor: getPhaseColor(task.phase),
                              }}
                              onClick={() => startEditTask(task)}
                              title={`${task.name}\n${formatDate(task.startDate)} - ${formatDate(getEndDate(task))}\nProgress: ${task.progress}%`}
                            >
                              {/* Progress fill */}
                              <div
                                className="h-full rounded bg-white/30"
                                style={{ width: `${task.progress}%` }}
                              />

                              {/* Weather buffer indicator */}
                              {task.weatherBuffer > 0 && (
                                <div
                                  className="absolute top-0 right-0 h-full bg-blue-400/50 rounded-r flex items-center justify-center"
                                  style={{
                                    width: `${(task.weatherBuffer / (task.duration + task.weatherBuffer)) * 100}%`,
                                  }}
                                >
                                  <CloudRain className="w-3 h-3 text-white" />
                                </div>
                              )}

                              {/* Milestone marker */}
                              {task.isMilestone && (
                                <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-amber-500 rotate-45" />
                              )}
                            </div>
                          </div>

                          {/* Progress & Actions */}
                          <div className="w-32 flex-shrink-0 pl-4 flex items-center gap-2 print:hidden">
                            <span
                              className={`text-sm font-medium ${task.progress === 100 ? 'text-green-500' : theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}
                            >
                              {task.progress}%
                            </span>
                            <button
                              onClick={() => startEditTask(task)}
                              className={`p-1 rounded ${theme === 'dark' ? 'hover:bg-gray-600 text-gray-400' : 'hover:bg-gray-200 text-gray-500'}`}
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteTaskHandler(task.id)}
                              className={`p-1 rounded hover:bg-red-500/10 text-red-500`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {/* Legend */}
                    <div
                      className={`mt-6 pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}
                    >
                      <div className="flex flex-wrap items-center gap-4 text-xs">
                        <span
                          className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
                        >
                          {t('tools.projectTimeline.legend', 'Legend:')}
                        </span>
                        {PHASES.map((phase) => (
                          <div key={phase.value} className="flex items-center gap-1">
                            <span
                              className="w-3 h-3 rounded"
                              style={{ backgroundColor: phase.color }}
                            />
                            <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                              {phase.label}
                            </span>
                          </div>
                        ))}
                        <div className="flex items-center gap-1">
                          <CloudRain className="w-3 h-3 text-blue-400" />
                          <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                            {t('tools.projectTimeline.weatherBuffer', 'Weather Buffer')}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-amber-500 rotate-45" />
                          <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                            {t('tools.projectTimeline.milestone', 'Milestone')}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded border-2 border-red-500" />
                          <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                            {t('tools.projectTimeline.criticalPath', 'Critical Path')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
              <div
                className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}
              >
                {filteredTasks.length === 0 ? (
                  <div className="text-center py-12">
                    <Layers
                      className={`w-16 h-16 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`}
                    />
                    <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('tools.projectTimeline.noTasksYetAddYour2', 'No tasks yet. Add your first task.')}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredTasks.map((task) => {
                      const isCritical = criticalPath.includes(task.id);
                      const dependencyNames = task.dependencies
                        .map((d) => currentProject.tasks.find((t) => t.id === d)?.name)
                        .filter(Boolean);

                      return (
                        <div
                          key={task.id}
                          className={`p-4 rounded-lg border ${isCritical ? 'border-red-500' : theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              {task.isMilestone && <Flag className="w-4 h-4 text-amber-500" />}
                              <h4
                                className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                              >
                                {task.name}
                              </h4>
                              <span
                                className="px-2 py-0.5 text-xs rounded text-white"
                                style={{ backgroundColor: getPhaseColor(task.phase) }}
                              >
                                {PHASES.find((p) => p.value === task.phase)?.label}
                              </span>
                              {isCritical && (
                                <span className="px-2 py-0.5 text-xs bg-red-500 text-white rounded">
                                  {t('tools.projectTimeline.criticalPath2', 'Critical Path')}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => startEditTask(task)}
                                className={`p-1.5 rounded ${theme === 'dark' ? 'hover:bg-gray-600 text-gray-400' : 'hover:bg-gray-200 text-gray-500'}`}
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteTask(task.id)}
                                className="p-1.5 rounded hover:bg-red-500/10 text-red-500"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                            <div>
                              <span
                                className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}
                              >
                                {t('tools.projectTimeline.startDate3', 'Start Date')}
                              </span>
                              <p
                                className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}
                              >
                                {formatDate(task.startDate)}
                              </p>
                            </div>
                            <div>
                              <span
                                className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}
                              >
                                {t('tools.projectTimeline.endDate', 'End Date')}
                              </span>
                              <p
                                className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}
                              >
                                {formatDate(getEndDate(task))}
                              </p>
                            </div>
                            <div>
                              <span
                                className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}
                              >
                                {t('tools.projectTimeline.duration', 'Duration')}
                              </span>
                              <p
                                className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}
                              >
                                {task.duration} days{' '}
                                {task.weatherBuffer > 0 && (
                                  <span className="text-blue-400">
                                    (+{task.weatherBuffer} buffer)
                                  </span>
                                )}
                              </p>
                            </div>
                            <div>
                              <span
                                className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}
                              >
                                {t('tools.projectTimeline.resource', 'Resource')}
                              </span>
                              <p
                                className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}
                              >
                                {task.resource}
                              </p>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="mb-3">
                            <div className="flex items-center justify-between mb-1">
                              <span
                                className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}
                              >
                                {t('tools.projectTimeline.progress2', 'Progress')}
                              </span>
                              <span
                                className={`text-sm font-medium ${task.progress === 100 ? 'text-green-500' : theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
                              >
                                {task.progress}%
                              </span>
                            </div>
                            <div
                              className={`h-2 rounded-full ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'}`}
                            >
                              <div
                                className={`h-full rounded-full transition-all ${task.progress === 100 ? 'bg-green-500' : t('tools.projectTimeline.bg0d9488', 'bg-[#0D9488]')}`}
                                style={{ width: `${task.progress}%` }}
                              />
                            </div>
                            <div className="flex gap-2 mt-2">
                              {[0, 25, 50, 75, 100].map((p) => (
                                <button
                                  key={p}
                                  onClick={() => updateTaskProgress(task.id, p)}
                                  className={`px-2 py-1 text-xs rounded transition-colors ${task.progress === p ? 'bg-[#0D9488] text-white' : theme === 'dark' ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                                >
                                  {p}%
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Dependencies */}
                          {dependencyNames.length > 0 && (
                            <div className="mb-2">
                              <span
                                className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}
                              >
                                {t('tools.projectTimeline.dependsOn', 'Depends on:')}
                              </span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {dependencyNames.map((name, idx) => (
                                  <span
                                    key={idx}
                                    className={`px-2 py-0.5 text-xs rounded ${theme === 'dark' ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
                                  >
                                    {name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Notes */}
                          {task.notes && (
                            <div>
                              <span
                                className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}
                              >
                                {t('tools.projectTimeline.notes2', 'Notes:')}
                              </span>
                              <p
                                className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}
                              >
                                {task.notes}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Analysis View */}
            {viewMode === 'analysis' && (
              <div className="space-y-6">
                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div
                    className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/10 rounded-lg">
                        <BarChart3 className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <p
                          className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}
                        >
                          {t('tools.projectTimeline.totalTasks', 'Total Tasks')}
                        </p>
                        <p
                          className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                        >
                          {projectStats.totalTasks}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-500/10 rounded-lg">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      </div>
                      <div>
                        <p
                          className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}
                        >
                          {t('tools.projectTimeline.completed', 'Completed')}
                        </p>
                        <p
                          className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                        >
                          {projectStats.completedTasks}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#0D9488]/10 rounded-lg">
                        <Target className="w-5 h-5 text-[#0D9488]" />
                      </div>
                      <div>
                        <p
                          className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}
                        >
                          {t('tools.projectTimeline.overallProgress', 'Overall Progress')}
                        </p>
                        <p
                          className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                        >
                          {projectStats.overallProgress.toFixed(0)}%
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-500/10 rounded-lg">
                        <Clock className="w-5 h-5 text-amber-500" />
                      </div>
                      <div>
                        <p
                          className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}
                        >
                          {t('tools.projectTimeline.totalDuration', 'Total Duration')}
                        </p>
                        <p
                          className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                        >
                          {projectStats.totalDuration} days
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Phase Progress */}
                <div
                  className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}
                >
                  <h3
                    className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                  >
                    {t('tools.projectTimeline.progressByPhase', 'Progress by Phase')}
                  </h3>
                  <div className="space-y-4">
                    {PHASES.map((phase) => {
                      const phaseData = projectStats.byPhase[phase.value];
                      if (!phaseData) return null;

                      return (
                        <div key={phase.value}>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span
                                className="w-3 h-3 rounded"
                                style={{ backgroundColor: phase.color }}
                              />
                              <span
                                className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
                              >
                                {phase.label}
                              </span>
                              <span
                                className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}
                              >
                                ({phaseData.count} tasks)
                              </span>
                            </div>
                            <span
                              className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
                            >
                              {phaseData.progress.toFixed(0)}%
                            </span>
                          </div>
                          <div
                            className={`h-2 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}
                          >
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${phaseData.progress}%`,
                                backgroundColor: phase.color,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Resource Allocation */}
                <div
                  className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}
                >
                  <h3
                    className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                  >
                    <Users className="w-5 h-5 inline mr-2" />
                    {t('tools.projectTimeline.resourceAllocation', 'Resource Allocation')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(projectStats.byResource).map(([resource, data]) => (
                      <div
                        key={resource}
                        className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                          >
                            {resource}
                          </span>
                          <span
                            className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}
                          >
                            {data.count} tasks
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {data.tasks.slice(0, 3).map((task, idx) => (
                            <span
                              key={idx}
                              className={`text-xs px-2 py-0.5 rounded ${theme === 'dark' ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
                            >
                              {task}
                            </span>
                          ))}
                          {data.tasks.length > 3 && (
                            <span
                              className={`text-xs px-2 py-0.5 rounded ${theme === 'dark' ? 'bg-gray-600 text-gray-400' : 'bg-gray-200 text-gray-500'}`}
                            >
                              +{data.tasks.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Critical Path */}
                <div
                  className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}
                >
                  <h3
                    className={`text-lg font-semibold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                  >
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    {t('tools.projectTimeline.criticalPath3', 'Critical Path')}
                  </h3>
                  {criticalPath.length === 0 ? (
                    <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                      {t('tools.projectTimeline.noCriticalPathIdentifiedAdd', 'No critical path identified. Add more tasks with dependencies.')}
                    </p>
                  ) : (
                    <div className="flex flex-wrap items-center gap-2">
                      {criticalPath.map((taskId, idx) => {
                        const task = currentProject.tasks.find((t) => t.id === taskId);
                        if (!task) return null;
                        return (
                          <div key={taskId} className="flex items-center gap-2">
                            <span
                              className={`px-3 py-1.5 rounded-lg font-medium ${theme === 'dark' ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700'}`}
                            >
                              {task.name}
                            </span>
                            {idx < criticalPath.length - 1 && (
                              <ArrowRight
                                className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Delay Impact Analysis */}
                <div
                  className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}
                >
                  <h3
                    className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                  >
                    {t('tools.projectTimeline.delayImpactAnalysis', 'Delay Impact Analysis')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label
                        className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
                      >
                        {t('tools.projectTimeline.selectTask', 'Select Task')}
                      </label>
                      <select
                        value={delayTaskId}
                        onChange={(e) => {
                          setDelayTaskId(e.target.value);
                          setDelayImpact(null);
                        }}
                        className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      >
                        <option value="">{t('tools.projectTimeline.chooseATask', 'Choose a task...')}</option>
                        {currentProject.tasks.map((task) => (
                          <option key={task.id} value={task.id}>
                            {task.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label
                        className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
                      >
                        {t('tools.projectTimeline.delayDays', 'Delay (days)')}
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={delayDays}
                        onChange={(e) => {
                          setDelayDays(parseInt(e.target.value) || 0);
                          setDelayImpact(null);
                        }}
                        className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={analyzeDelay}
                        disabled={!delayTaskId || delayDays <= 0}
                        className="w-full bg-[#0D9488] hover:bg-[#0F766E] disabled:bg-gray-500 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        {t('tools.projectTimeline.analyzeImpact', 'Analyze Impact')}
                      </button>
                    </div>
                  </div>

                  {delayImpact && (
                    <div
                      className={`p-4 rounded-lg border-l-4 border-amber-500 ${theme === 'dark' ? 'bg-amber-500/10' : 'bg-amber-50'}`}
                    >
                      <h4
                        className={`font-medium mb-2 ${theme === 'dark' ? 'text-amber-400' : 'text-amber-800'}`}
                      >
                        Impact Report: {delayImpact.taskName}
                      </h4>
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <span
                            className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}
                          >
                            {t('tools.projectTimeline.originalEndDate', 'Original End Date')}
                          </span>
                          <p
                            className={`font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}
                          >
                            {formatDate(delayImpact.originalEnd)}
                          </p>
                        </div>
                        <div>
                          <span
                            className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}
                          >
                            {t('tools.projectTimeline.newEndDate', 'New End Date')}
                          </span>
                          <p
                            className={`font-medium text-red-500`}
                          >
                            {formatDate(delayImpact.newEnd)}
                          </p>
                        </div>
                      </div>
                      {delayImpact.affectedTasks.length > 0 ? (
                        <div>
                          <span
                            className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}
                          >
                            Affected Tasks ({delayImpact.affectedTasks.length}):
                          </span>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {delayImpact.affectedTasks.map((taskId) => {
                              const task = currentProject.tasks.find((t) => t.id === taskId);
                              return (
                                <span
                                  key={taskId}
                                  className={`px-2 py-1 text-sm rounded ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
                                >
                                  {task?.name}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <p
                          className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}
                        >
                          {t('tools.projectTimeline.noOtherTasksWillBe', 'No other tasks will be affected by this delay.')}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Weather Buffer Summary */}
                <div
                  className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}
                >
                  <h3
                    className={`text-lg font-semibold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                  >
                    <CloudRain className="w-5 h-5 text-blue-500" />
                    {t('tools.projectTimeline.weatherBufferSummary', 'Weather Buffer Summary')}
                  </h3>
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-blue-500/10' : 'bg-blue-50'}`}
                    >
                      <p className={`text-3xl font-bold text-blue-500`}>
                        {projectStats.weatherBufferDays}
                      </p>
                      <p
                        className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}
                      >
                        {t('tools.projectTimeline.totalBufferDays', 'Total buffer days')}
                      </p>
                    </div>
                    <p
                      className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}
                    >
                      Weather buffers account for potential delays due to rain, extreme temperatures,
                      or other weather conditions that may affect outdoor construction work.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Info Section */}
        <div
          className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 print:hidden`}
        >
          <h3
            className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
          >
            {t('tools.projectTimeline.aboutProjectTimelineTool', 'About Project Timeline Tool')}
          </h3>
          <div
            className={`space-y-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
          >
            <p>
              This construction project timeline tool helps you manage and visualize your building
              projects:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>{t('tools.projectTimeline.createTasksOrganizedByConstruction', 'Create tasks organized by construction phases (Design, Permits, Foundation, etc.)')}</li>
              <li>{t('tools.projectTimeline.setDependenciesBetweenTasksTo', 'Set dependencies between tasks to establish proper sequencing')}</li>
              <li>{t('tools.projectTimeline.trackProgressWithPercentageCompletion', 'Track progress with percentage completion')}</li>
              <li>{t('tools.projectTimeline.addWeatherBufferDaysTo', 'Add weather buffer days to account for potential weather delays')}</li>
              <li>{t('tools.projectTimeline.visualizeYourProjectWithAn', 'Visualize your project with an interactive Gantt chart')}</li>
              <li>{t('tools.projectTimeline.identifyTheCriticalPathTo', 'Identify the critical path to understand which tasks affect the project end date')}</li>
              <li>{t('tools.projectTimeline.analyzeTheImpactOfPotential', 'Analyze the impact of potential delays before they happen')}</li>
              <li>{t('tools.projectTimeline.assignResourcesAndSubcontractorsTo', 'Assign resources and subcontractors to each task')}</li>
              <li>{t('tools.projectTimeline.printOrExportYourTimeline', 'Print or export your timeline for meetings and documentation')}</li>
            </ul>
            <p className="text-xs mt-4 opacity-70">
              {t('tools.projectTimeline.allDataIsSavedLocally', 'All data is saved locally in your browser and persists between sessions.')}
            </p>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:block {
            display: block !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:bg-white {
            background-color: white !important;
          }
          .print\\:py-0 {
            padding-top: 0 !important;
            padding-bottom: 0 !important;
          }
        }
      `}</style>

      <ConfirmDialog />
    </div>
  );
};

export default ProjectTimelineTool;
