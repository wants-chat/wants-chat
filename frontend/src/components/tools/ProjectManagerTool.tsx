import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Folder,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Save,
  Loader2,
  Filter,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  DollarSign,
  Calendar,
  Clock,
  CheckSquare,
  Users,
  Building2,
  PlayCircle,
  PauseCircle,
  CheckCircle2,
  XCircle,
  Circle,
  Flag,
  ListTodo,
  BarChart3,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { api } from '../../lib/api';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import type { ColumnConfig } from '../../lib/toolDataUtils';

// Interfaces
interface Project {
  id: string;
  name: string;
  client_id?: string;
  client_name?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  budget?: number;
  status: 'not_started' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
  progress?: number;
  created_at: string;
  updated_at?: string;
}

interface Task {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  due_date?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  assigned_to?: string;
  created_at: string;
  updated_at?: string;
}

interface Customer {
  id: string;
  name: string;
  email?: string;
  company?: string;
}

interface ProjectManagerToolProps {
  uiConfig?: UIConfig;
}

// Status configurations
const projectStatuses = [
  { value: 'not_started', label: 'Not Started', icon: Circle, color: 'gray' },
  { value: 'in_progress', label: 'In Progress', icon: PlayCircle, color: 'blue' },
  { value: 'on_hold', label: 'On Hold', icon: PauseCircle, color: 'yellow' },
  { value: 'completed', label: 'Completed', icon: CheckCircle2, color: 'green' },
  { value: 'cancelled', label: 'Cancelled', icon: XCircle, color: 'red' },
];

const taskStatuses = [
  { value: 'pending', label: 'Pending', color: 'gray' },
  { value: 'in_progress', label: 'In Progress', color: 'blue' },
  { value: 'completed', label: 'Completed', color: 'green' },
  { value: 'cancelled', label: 'Cancelled', color: 'red' },
];

const taskPriorities = [
  { value: 'low', label: 'Low', color: 'gray' },
  { value: 'medium', label: 'Medium', color: 'blue' },
  { value: 'high', label: 'High', color: 'orange' },
  { value: 'urgent', label: 'Urgent', color: 'red' },
];

// Column configuration for export - must be defined before component
const COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Project Name', type: 'string' },
  { key: 'client_name', header: 'Client', type: 'string' },
  { key: 'description', header: 'Description', type: 'string' },
  { key: 'status', header: 'Status', type: 'string', format: (value) => {
    const status = projectStatuses.find(s => s.value === value);
    return status?.label || value || '';
  }},
  { key: 'budget', header: 'Budget', type: 'currency' },
  { key: 'start_date', header: 'Start Date', type: 'date' },
  { key: 'end_date', header: 'End Date', type: 'date' },
  { key: 'progress', header: 'Progress (%)', type: 'number' },
  { key: 'created_at', header: 'Created At', type: 'date' },
];

export const ProjectManagerTool: React.FC<ProjectManagerToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Use the useToolData hook for backend persistence
  const {
    data: projects,
    setData: setProjects,
    addItem,
    updateItem,
    deleteItem,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    importCSV,
    importJSON,
    copyToClipboard,
    print,
    isLoading,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<Project>('project-manager', [], COLUMNS);

  // Local UI states
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  // Modal states
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Task states
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [savingTask, setSavingTask] = useState(false);

  // Customer list for client selection
  const [customers, setCustomers] = useState<Customer[]>([]);

  // Expanded project for viewing tasks
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);

  // Form states
  const [projectFormData, setProjectFormData] = useState({
    name: '',
    client_id: '',
    description: '',
    start_date: '',
    end_date: '',
    budget: 0,
    status: 'not_started' as Project['status'],
  });

  const [taskFormData, setTaskFormData] = useState({
    title: '',
    description: '',
    due_date: '',
    priority: 'medium' as Task['priority'],
    status: 'pending' as Task['status'],
    assigned_to: '',
  });

  // Calculate stats from projects data using useMemo
  const stats = useMemo(() => {
    const total = projects.length;
    const active = projects.filter((p: Project) => p.status === 'in_progress').length;
    const completed = projects.filter((p: Project) => p.status === 'completed').length;
    const totalBudget = projects.reduce((sum: number, p: Project) => sum + (p.budget || 0), 0);
    return { total, active, completed, totalBudget };
  }, [projects]);

  // Filter projects based on search and status
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesSearch = !searchQuery ||
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (project.client_name && project.client_name.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus = !filterStatus || project.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [projects, searchQuery, filterStatus]);

  // Fetch customers for client dropdown
  const fetchCustomers = async () => {
    try {
      const response = await api.get('/business/customers?limit=100');
      const customerItems = response.items || response || [];
      setCustomers(customerItems);
    } catch (err: any) {
      console.error('Failed to load customers:', err);
      setCustomers([]);
    }
  };

  // Fetch tasks for a project
  const fetchTasks = async (projectId: string) => {
    try {
      setLoadingTasks(true);
      const response = await api.get(`/business/tasks?project_id=${projectId}`);
      const taskItems = response.items || response || [];
      setTasks(taskItems);
    } catch (err: any) {
      console.error('Failed to load tasks:', err);
      setTasks([]);
    } finally {
      setLoadingTasks(false);
    }
  };

  // Load customers on mount
  useEffect(() => {
    fetchCustomers();
  }, []);

  // Handle prefill data from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.projectName || params.title || params.description || params.client || params.amount) {
        setProjectFormData({
          name: params.projectName || params.title || '',
          client_id: '',
          description: params.description || '',
          start_date: '',
          end_date: '',
          budget: params.amount || 0,
          status: 'not_started',
        });
        setShowProjectModal(true);
      }
    }
  }, [uiConfig?.params]);

  // Toggle expanded project to view tasks
  const toggleProjectTasks = (project: Project) => {
    if (expandedProjectId === project.id) {
      setExpandedProjectId(null);
      setSelectedProject(null);
      setTasks([]);
    } else {
      setExpandedProjectId(project.id);
      setSelectedProject(project);
      fetchTasks(project.id);
    }
  };

  // Open project modal for new project
  const handleAddProject = () => {
    setEditingProject(null);
    setProjectFormData({
      name: '',
      client_id: '',
      description: '',
      start_date: '',
      end_date: '',
      budget: 0,
      status: 'not_started',
    });
    setShowProjectModal(true);
  };

  // Open project modal for editing
  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setProjectFormData({
      name: project.name,
      client_id: project.client_id || '',
      description: project.description || '',
      start_date: project.start_date || '',
      end_date: project.end_date || '',
      budget: project.budget || 0,
      status: project.status,
    });
    setShowProjectModal(true);
  };

  // Save project
  const handleSaveProject = () => {
    if (!projectFormData.name.trim()) {
      setError('Project name is required');
      return;
    }

    setError(null);

    if (editingProject) {
      // Update existing project
      updateItem(editingProject.id, {
        name: projectFormData.name,
        client_id: projectFormData.client_id || undefined,
        client_name: customers.find(c => c.id === projectFormData.client_id)?.name,
        description: projectFormData.description || undefined,
        start_date: projectFormData.start_date || undefined,
        end_date: projectFormData.end_date || undefined,
        budget: projectFormData.budget || 0,
        status: projectFormData.status,
        updated_at: new Date().toISOString(),
      });
    } else {
      // Create new project
      const newProject: Project = {
        id: Date.now().toString(),
        name: projectFormData.name,
        client_id: projectFormData.client_id || undefined,
        client_name: customers.find(c => c.id === projectFormData.client_id)?.name,
        description: projectFormData.description || undefined,
        start_date: projectFormData.start_date || undefined,
        end_date: projectFormData.end_date || undefined,
        budget: projectFormData.budget || 0,
        status: projectFormData.status,
        progress: 0,
        created_at: new Date().toISOString(),
      };
      addItem(newProject);
    }

    setShowProjectModal(false);
  };

  // Delete project
  const handleDeleteProject = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Project',
      message: 'Are you sure you want to delete this project? All tasks will also be deleted.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (!confirmed) return;

    deleteItem(id);
    if (expandedProjectId === id) {
      setExpandedProjectId(null);
      setSelectedProject(null);
      setTasks([]);
    }
  };

  // Open task modal for new task
  const handleAddTask = (project: Project) => {
    setSelectedProject(project);
    setEditingTask(null);
    setTaskFormData({
      title: '',
      description: '',
      due_date: '',
      priority: 'medium',
      status: 'pending',
      assigned_to: '',
    });
    setShowTaskModal(true);
  };

  // Open task modal for editing
  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setTaskFormData({
      title: task.title,
      description: task.description || '',
      due_date: task.due_date || '',
      priority: task.priority,
      status: task.status,
      assigned_to: task.assigned_to || '',
    });
    setShowTaskModal(true);
  };

  // Save task
  const handleSaveTask = async () => {
    if (!taskFormData.title.trim()) {
      setError('Task title is required');
      return;
    }

    try {
      setSavingTask(true);
      setError(null);

      if (editingTask) {
        await api.put(`/business/tasks/${editingTask.id}`, taskFormData);
      } else if (selectedProject) {
        await api.post('/business/tasks', {
          ...taskFormData,
          project_id: selectedProject.id,
        });
      }

      setShowTaskModal(false);
      if (selectedProject) {
        fetchTasks(selectedProject.id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save task');
    } finally {
      setSavingTask(false);
    }
  };

  // Delete task
  const handleDeleteTask = async (taskId: string) => {
    const confirmed = await confirm({
      title: 'Delete Task',
      message: 'Are you sure you want to delete this task?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (!confirmed) return;

    try {
      await api.delete(`/business/tasks/${taskId}`);
      if (selectedProject) {
        fetchTasks(selectedProject.id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete task');
    }
  };

  // Helper functions
  const getStatusColor = (status: string, type: 'project' | 'task' = 'project') => {
    const statuses = type === 'project' ? projectStatuses : taskStatuses;
    const statusObj = statuses.find(s => s.value === status);
    const colorMap: Record<string, string> = {
      gray: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
      blue: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
      yellow: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      green: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      red: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      orange: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    };
    return colorMap[statusObj?.color || 'gray'] || colorMap.gray;
  };

  const getPriorityColor = (priority: string) => {
    const priorityObj = taskPriorities.find(p => p.value === priority);
    const colorMap: Record<string, string> = {
      gray: 'text-gray-500',
      blue: 'text-blue-500',
      orange: 'text-orange-500',
      red: 'text-red-500',
    };
    return colorMap[priorityObj?.color || 'gray'] || colorMap.gray;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Calculate project progress based on tasks
  const calculateProgress = (projectId: string) => {
    if (expandedProjectId !== projectId) return 0;
    if (tasks.length === 0) return 0;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    return Math.round((completedTasks / tasks.length) * 100);
  };

  return (
    <div className={`rounded-xl shadow-sm border overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      {/* Header */}
      <div className={`px-6 py-4 border-b ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gradient-to-r from-white to-violet-50 border-gray-100'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-violet-500/10 rounded-lg">
              <Folder className="w-5 h-5 text-violet-500" />
            </div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.projectManager.projectManager', 'Project Manager')}
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('tools.projectManager.manageYourProjectsAndTasks', 'Manage your projects and tasks')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <WidgetEmbedButton toolSlug="project-manager" toolName="Project Manager" />

            <SyncStatus
              isSynced={isSynced}
              isSaving={isSaving}
              lastSaved={lastSaved}
              syncError={syncError}
              onForceSync={forceSync}
              theme={isDark ? 'dark' : 'light'}
              size="sm"
            />
            <ExportDropdown
              onExportCSV={() => exportCSV({ filename: 'projects' })}
              onExportExcel={() => exportExcel({ filename: 'projects' })}
              onExportJSON={() => exportJSON({ filename: 'projects' })}
              onExportPDF={() => exportPDF({
                filename: 'projects',
                title: 'Projects Report',
                subtitle: `Total: ${projects.length} projects`
              })}
              onPrint={() => print('Projects Report')}
              onCopyToClipboard={() => copyToClipboard('tab')}
              onImportCSV={async (file) => { await importCSV(file); }}
              onImportJSON={async (file) => { await importJSON(file); }}
              disabled={projects.length === 0}
              theme={isDark ? 'dark' : 'light'}
            />
            <button
              onClick={handleAddProject}
              className="flex items-center gap-2 px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t('tools.projectManager.newProject', 'New Project')}
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className={`grid grid-cols-4 gap-4 p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-violet-500" />
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.total}</p>
          </div>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.projectManager.totalProjects', 'Total Projects')}</p>
        </div>
        <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-2">
            <PlayCircle className="w-4 h-4 text-blue-500" />
            <p className="text-2xl font-bold text-blue-500">{stats.active}</p>
          </div>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.projectManager.inProgress', 'In Progress')}</p>
        </div>
        <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <p className="text-2xl font-bold text-emerald-500">{stats.completed}</p>
          </div>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.projectManager.completed', 'Completed')}</p>
        </div>
        <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-violet-500" />
            <p className="text-2xl font-bold text-violet-500">{formatCurrency(stats.totalBudget)}</p>
          </div>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.projectManager.totalBudget', 'Total Budget')}</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="p-4 space-y-3">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <input
              type="text"
              placeholder={t('tools.projectManager.searchProjects', 'Search projects...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400' : 'bg-white border-gray-200 text-gray-900'}`}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
          >
            <Filter className="w-4 h-4" />
            Filters
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {showFilters && (
          <div className="flex gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
            >
              <option value="">{t('tools.projectManager.allStatuses', 'All Statuses')}</option>
              {projectStatuses.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mx-4 mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-600 dark:text-red-400">
          <AlertCircle className="w-4 h-4" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Project List */}
      <div className="px-4 pb-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            <Folder className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>{projects.length === 0 ? t('tools.projectManager.noProjectsFound', 'No projects found') : t('tools.projectManager.noProjectsMatchYourFilters', 'No projects match your filters')}</p>
            <button onClick={handleAddProject} className="mt-2 text-violet-500 hover:underline">
              {t('tools.projectManager.createYourFirstProject', 'Create your first project')}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredProjects.map((project) => (
              <div key={project.id}>
                {/* Project Card */}
                <div
                  className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'} transition-colors`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <button
                          onClick={() => toggleProjectTasks(project)}
                          className={`p-1 rounded ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                        >
                          <ChevronRight className={`w-4 h-4 transition-transform ${expandedProjectId === project.id ? 'rotate-90' : ''} ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                        </button>
                        <Folder className="w-4 h-4 text-violet-500" />
                        <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {project.name}
                        </h4>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                          {projectStatuses.find(s => s.value === project.status)?.label}
                        </span>
                      </div>

                      {project.description && (
                        <p className={`text-sm mb-2 ml-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {project.description}
                        </p>
                      )}

                      <div className={`flex flex-wrap gap-4 text-sm ml-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {project.client_name && (
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3 h-3" /> {project.client_name}
                          </span>
                        )}
                        {project.start_date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {formatDate(project.start_date)}
                            {project.end_date && ` - ${formatDate(project.end_date)}`}
                          </span>
                        )}
                        {project.budget && project.budget > 0 && (
                          <span className="flex items-center gap-1 text-violet-500">
                            <DollarSign className="w-3 h-3" /> {formatCurrency(project.budget)}
                          </span>
                        )}
                      </div>

                      {/* Progress Bar */}
                      {expandedProjectId === project.id && tasks.length > 0 && (
                        <div className="mt-3 ml-8">
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              {t('tools.projectManager.progress', 'Progress')}
                            </span>
                            <span className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              {calculateProgress(project.id)}%
                            </span>
                          </div>
                          <div className={`w-full h-2 rounded-full ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`}>
                            <div
                              className="h-2 rounded-full bg-violet-500 transition-all duration-300"
                              style={{ width: `${calculateProgress(project.id)}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAddTask(project)}
                        className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                        title={t('tools.projectManager.addTask', 'Add Task')}
                      >
                        <ListTodo className="w-4 h-4 text-violet-500" />
                      </button>
                      <button
                        onClick={() => handleEditProject(project)}
                        className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                      >
                        <Edit2 className="w-4 h-4 text-gray-500" />
                      </button>
                      <button
                        onClick={() => handleDeleteProject(project.id)}
                        className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Task List (Expanded) */}
                {expandedProjectId === project.id && (
                  <div className={`ml-8 mt-2 p-3 rounded-lg border ${isDark ? 'bg-gray-900/50 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <h5 className={`text-sm font-medium flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        <CheckSquare className="w-4 h-4" />
                        Tasks ({tasks.length})
                      </h5>
                      <button
                        onClick={() => handleAddTask(project)}
                        className="flex items-center gap-1 px-2 py-1 text-xs text-violet-500 hover:bg-violet-500/10 rounded"
                      >
                        <Plus className="w-3 h-3" /> Add Task
                      </button>
                    </div>

                    {loadingTasks ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="w-5 h-5 animate-spin text-violet-500" />
                      </div>
                    ) : tasks.length === 0 ? (
                      <p className={`text-sm text-center py-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        {t('tools.projectManager.noTasksYetAddYour', 'No tasks yet. Add your first task.')}
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {tasks.map((task) => (
                          <div
                            key={task.id}
                            className={`p-3 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <Flag className={`w-3 h-3 ${getPriorityColor(task.priority)}`} />
                                  <span className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {task.title}
                                  </span>
                                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(task.status, 'task')}`}>
                                    {taskStatuses.find(s => s.value === task.status)?.label}
                                  </span>
                                </div>
                                {task.description && (
                                  <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {task.description}
                                  </p>
                                )}
                                <div className={`flex gap-3 mt-1 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                  {task.due_date && (
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" /> {formatDate(task.due_date)}
                                    </span>
                                  )}
                                  {task.assigned_to && (
                                    <span className="flex items-center gap-1">
                                      <Users className="w-3 h-3" /> {task.assigned_to}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleEditTask(task)}
                                  className={`p-1 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
                                >
                                  <Edit2 className="w-3 h-3 text-gray-500" />
                                </button>
                                <button
                                  onClick={() => handleDeleteTask(task.id)}
                                  className={`p-1 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
                                >
                                  <Trash2 className="w-3 h-3 text-red-500" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Project Modal */}
      {showProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-lg rounded-xl shadow-2xl ${isDark ? 'bg-gray-800' : 'bg-white'}`} style={{ opacity: 1 }}>
            <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} rounded-t-xl`}>
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {editingProject ? t('tools.projectManager.editProject', 'Edit Project') : t('tools.projectManager.newProject2', 'New Project')}
              </h3>
              <button onClick={() => setShowProjectModal(false)} className={`p-1 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              </button>
            </div>

            <div className={`p-4 space-y-4 max-h-[60vh] overflow-y-auto ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.projectManager.projectName', 'Project Name *')}
                </label>
                <input
                  type="text"
                  value={projectFormData.name}
                  onChange={(e) => setProjectFormData({ ...projectFormData, name: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                  placeholder={t('tools.projectManager.enterProjectName', 'Enter project name')}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.projectManager.client', 'Client')}
                </label>
                <select
                  value={projectFormData.client_id}
                  onChange={(e) => setProjectFormData({ ...projectFormData, client_id: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                >
                  <option value="">{t('tools.projectManager.selectClient', 'Select client')}</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.projectManager.description', 'Description')}
                </label>
                <textarea
                  value={projectFormData.description}
                  onChange={(e) => setProjectFormData({ ...projectFormData, description: e.target.value })}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                  placeholder={t('tools.projectManager.projectDescription', 'Project description')}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.projectManager.startDate', 'Start Date')}
                  </label>
                  <input
                    type="date"
                    value={projectFormData.start_date}
                    onChange={(e) => setProjectFormData({ ...projectFormData, start_date: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.projectManager.endDate', 'End Date')}
                  </label>
                  <input
                    type="date"
                    value={projectFormData.end_date}
                    onChange={(e) => setProjectFormData({ ...projectFormData, end_date: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.projectManager.budget', 'Budget')}
                  </label>
                  <div className="relative">
                    <DollarSign className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    <input
                      type="number"
                      value={projectFormData.budget}
                      onChange={(e) => setProjectFormData({ ...projectFormData, budget: parseFloat(e.target.value) || 0 })}
                      className={`w-full pl-9 pr-3 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                      placeholder="0"
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.projectManager.status', 'Status')}
                  </label>
                  <select
                    value={projectFormData.status}
                    onChange={(e) => setProjectFormData({ ...projectFormData, status: e.target.value as Project['status'] })}
                    className={`w-full px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                  >
                    {projectStatuses.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className={`flex justify-end gap-3 p-4 border-t rounded-b-xl ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
              <button
                onClick={() => setShowProjectModal(false)}
                className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                {t('tools.projectManager.cancel', 'Cancel')}
              </button>
              <button
                onClick={handleSaveProject}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {isSaving ? t('tools.projectManager.saving', 'Saving...') : t('tools.projectManager.saveProject', 'Save Project')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-lg rounded-xl shadow-2xl ${isDark ? 'bg-gray-800' : 'bg-white'}`} style={{ opacity: 1 }}>
            <div className={`flex items-center justify-between p-4 border-b rounded-t-xl ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
              <div>
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {editingTask ? t('tools.projectManager.editTask', 'Edit Task') : t('tools.projectManager.newTask', 'New Task')}
                </h3>
                {selectedProject && (
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Project: {selectedProject.name}
                  </p>
                )}
              </div>
              <button onClick={() => setShowTaskModal(false)} className={`p-1 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              </button>
            </div>

            <div className={`p-4 space-y-4 max-h-[60vh] overflow-y-auto ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.projectManager.taskTitle', 'Task Title *')}
                </label>
                <input
                  type="text"
                  value={taskFormData.title}
                  onChange={(e) => setTaskFormData({ ...taskFormData, title: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                  placeholder={t('tools.projectManager.enterTaskTitle', 'Enter task title')}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.projectManager.description2', 'Description')}
                </label>
                <textarea
                  value={taskFormData.description}
                  onChange={(e) => setTaskFormData({ ...taskFormData, description: e.target.value })}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                  placeholder={t('tools.projectManager.taskDescription', 'Task description')}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.projectManager.dueDate', 'Due Date')}
                  </label>
                  <input
                    type="date"
                    value={taskFormData.due_date}
                    onChange={(e) => setTaskFormData({ ...taskFormData, due_date: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.projectManager.assignedTo', 'Assigned To')}
                  </label>
                  <input
                    type="text"
                    value={taskFormData.assigned_to}
                    onChange={(e) => setTaskFormData({ ...taskFormData, assigned_to: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                    placeholder={t('tools.projectManager.assigneeName', 'Assignee name')}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.projectManager.priority', 'Priority')}
                  </label>
                  <select
                    value={taskFormData.priority}
                    onChange={(e) => setTaskFormData({ ...taskFormData, priority: e.target.value as Task['priority'] })}
                    className={`w-full px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                  >
                    {taskPriorities.map(p => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.projectManager.status2', 'Status')}
                  </label>
                  <select
                    value={taskFormData.status}
                    onChange={(e) => setTaskFormData({ ...taskFormData, status: e.target.value as Task['status'] })}
                    className={`w-full px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                  >
                    {taskStatuses.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className={`flex justify-end gap-3 p-4 border-t rounded-b-xl ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
              <button
                onClick={() => setShowTaskModal(false)}
                className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                {t('tools.projectManager.cancel2', 'Cancel')}
              </button>
              <button
                onClick={handleSaveTask}
                disabled={savingTask}
                className="flex items-center gap-2 px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 disabled:opacity-50"
              >
                {savingTask ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {savingTask ? t('tools.projectManager.saving2', 'Saving...') : t('tools.projectManager.saveTask', 'Save Task')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog />
    </div>
  );
};

export default ProjectManagerTool;
