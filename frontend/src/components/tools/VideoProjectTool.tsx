'use client';

import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Video,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Loader2,
  Filter,
  ChevronDown,
  Clock,
  AlertCircle,
  PlayCircle,
  CheckCircle2,
  PauseCircle,
  XCircle,
  Circle,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  type ColumnConfig,
} from '../../lib/toolDataUtils';

// ============ INTERFACES ============
interface VideoProject {
  id: string;
  title: string;
  description?: string;
  status: 'planning' | 'in_production' | 'in_review' | 'completed' | 'archived';
  duration?: number; // in minutes
  format?: 'short' | 'medium' | 'long' | 'shorts' | 'reel';
  platform?: string; // YouTube, TikTok, Instagram, etc.
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  createdAt: string;
}

interface VideoProjectToolProps {
  uiConfig?: UIConfig;
}

// Status configurations
const videoStatuses = [
  { value: 'planning', label: 'Planning', icon: Circle, color: 'gray' },
  { value: 'in_production', label: 'In Production', icon: PlayCircle, color: 'blue' },
  { value: 'in_review', label: 'In Review', icon: PauseCircle, color: 'yellow' },
  { value: 'completed', label: 'Completed', icon: CheckCircle2, color: 'green' },
  { value: 'archived', label: 'Archived', icon: XCircle, color: 'red' },
];

const videoPriorities = [
  { value: 'low', label: 'Low', color: 'gray' },
  { value: 'medium', label: 'Medium', color: 'blue' },
  { value: 'high', label: 'High', color: 'orange' },
  { value: 'urgent', label: 'Urgent', color: 'red' },
];

const videoFormats = [
  { value: 'short', label: 'Short (< 1 min)' },
  { value: 'medium', label: 'Medium (1-5 min)' },
  { value: 'long', label: 'Long (5+ min)' },
  { value: 'shorts', label: 'Shorts (15-60s)' },
  { value: 'reel', label: 'Reel (15-30s)' },
];

const platforms = [
  'YouTube',
  'TikTok',
  'Instagram',
  'Facebook',
  'LinkedIn',
  'Vimeo',
  'Custom',
];

// Column configurations for export
const PROJECT_COLUMNS: ColumnConfig[] = [
  { key: 'title', header: 'Project Title', type: 'string' },
  { key: 'description', header: 'Description', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'format', header: 'Format', type: 'string' },
  { key: 'platform', header: 'Platform', type: 'string' },
  { key: 'duration', header: 'Duration (min)', type: 'number' },
  { key: 'priority', header: 'Priority', type: 'string' },
  { key: 'dueDate', header: 'Due Date', type: 'date' },
  { key: 'createdAt', header: 'Created', type: 'date' },
];

// ============ HELPER FUNCTIONS ============
const generateId = () => Math.random().toString(36).substring(2, 11);

const formatDate = (dateString?: string) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// ============ COMPONENT ============
export const VideoProjectTool: React.FC<VideoProjectToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [validationMessage, setValidationMessage] = React.useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // UI states
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filterStatus, setFilterStatus] = React.useState<string>('');
  const [showFilters, setShowFilters] = React.useState(false);
  const [showModal, setShowModal] = React.useState(false);
  const [editingProject, setEditingProject] = React.useState<VideoProject | null>(null);

  // Form states
  const [formData, setFormData] = React.useState({
    title: '',
    description: '',
    status: 'planning' as VideoProject['status'],
    duration: '',
    format: '',
    platform: '',
    priority: 'medium' as VideoProject['priority'],
    dueDate: '',
  });

  // Use the useToolData hook for backend sync
  const {
    data: projects,
    addItem,
    updateItem,
    deleteItem,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    isLoading,
  } = useToolData<VideoProject>('video-projects', [], PROJECT_COLUMNS);

  // Handle prefill data from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.title || params.projectName) {
        setFormData({
          ...formData,
          title: params.title || params.projectName || '',
          description: params.description || '',
        });
        setShowModal(true);
      }
    }
  }, [uiConfig?.params]);

  // Filter projects based on search and status
  const filteredProjects = React.useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch =
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (project.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      const matchesStatus = filterStatus ? project.status === filterStatus : true;
      return matchesSearch && matchesStatus;
    });
  }, [projects, searchQuery, filterStatus]);

  // Calculate stats
  const stats = React.useMemo(() => {
    return {
      total: projects.length,
      inProduction: projects.filter((p) => p.status === 'in_production').length,
      completed: projects.filter((p) => p.status === 'completed').length,
      urgent: projects.filter((p) => p.priority === 'urgent').length,
    };
  }, [projects]);

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      status: 'planning',
      duration: '',
      format: '',
      platform: '',
      priority: 'medium',
      dueDate: '',
    });
    setEditingProject(null);
  };

  // Open modal for new project
  const handleAddProject = () => {
    resetForm();
    setShowModal(true);
  };

  // Open modal for editing
  const handleEditProject = (project: VideoProject) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      description: project.description || '',
      status: project.status,
      duration: project.duration ? project.duration.toString() : '',
      format: project.format || '',
      platform: project.platform || '',
      priority: project.priority,
      dueDate: project.dueDate || '',
    });
    setShowModal(true);
  };

  // Save project
  const handleSaveProject = () => {
    if (!formData.title.trim()) {
      setValidationMessage('Project title is required');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const newProject: VideoProject = {
      id: editingProject?.id || generateId(),
      title: formData.title,
      description: formData.description,
      status: formData.status,
      duration: formData.duration ? parseInt(formData.duration) : undefined,
      format: formData.format || undefined,
      platform: formData.platform || undefined,
      priority: formData.priority,
      dueDate: formData.dueDate || undefined,
      createdAt: editingProject?.createdAt || new Date().toISOString(),
    };

    if (editingProject) {
      updateItem(editingProject.id, newProject);
    } else {
      addItem(newProject);
    }

    setShowModal(false);
    resetForm();
  };

  // Delete project
  const handleDeleteProject = async (id: string) => {
    const confirmed = await confirm('Are you sure you want to delete this video project?');
    if (confirmed) {
      deleteItem(id);
    }
  };

  // Helper functions
  const getStatusColor = (status: string) => {
    const statusObj = videoStatuses.find((s) => s.value === status);
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
    const priorityObj = videoPriorities.find((p) => p.value === priority);
    const colorMap: Record<string, string> = {
      gray: 'text-gray-500',
      blue: 'text-blue-500',
      orange: 'text-orange-500',
      red: 'text-red-500',
    };
    return colorMap[priorityObj?.color || 'gray'] || colorMap.gray;
  };

  return (
    <div
      className={`rounded-xl shadow-sm border overflow-hidden ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}
    >
      <ConfirmDialog />
      {validationMessage && (
        <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
          {validationMessage}
        </div>
      )}
      {/* Header */}
      <div
        className={`px-6 py-4 border-b ${
          isDark
            ? 'bg-gray-800/50 border-gray-700'
            : 'bg-gradient-to-r from-white to-violet-50 border-gray-100'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-violet-500/10 rounded-lg">
              <Video className="w-5 h-5 text-violet-500" />
            </div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.videoProject.videoProjectManager', 'Video Project Manager')}
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('tools.videoProject.manageYourVideoProductionProjects', 'Manage your video production projects')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <WidgetEmbedButton toolSlug="video-project" toolName="Video Project" />

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
              onExportCSV={() => exportCSV()}
              onExportExcel={() => exportExcel()}
              onExportJSON={() => exportJSON()}
              onExportPDF={() => exportPDF()}
              disabled={projects.length === 0}
              showImport={false}
              theme={isDark ? 'dark' : 'light'}
            />
            <button
              onClick={handleAddProject}
              className="flex items-center gap-2 px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t('tools.videoProject.newProject', 'New Project')}
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div
        className={`grid grid-cols-4 gap-4 p-4 border-b ${
          isDark ? 'border-gray-700' : 'border-gray-100'
        }`}
      >
        <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-2">
            <Video className="w-4 h-4 text-violet-500" />
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {stats.total}
            </p>
          </div>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.videoProject.totalProjects', 'Total Projects')}</p>
        </div>
        <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-2">
            <PlayCircle className="w-4 h-4 text-blue-500" />
            <p className="text-2xl font-bold text-blue-500">{stats.inProduction}</p>
          </div>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.videoProject.inProduction', 'In Production')}</p>
        </div>
        <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <p className="text-2xl font-bold text-emerald-500">{stats.completed}</p>
          </div>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.videoProject.completed', 'Completed')}</p>
        </div>
        <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <p className="text-2xl font-bold text-red-500">{stats.urgent}</p>
          </div>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.videoProject.urgent', 'Urgent')}</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="p-4 space-y-3">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search
              className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}
            />
            <input
              type="text"
              placeholder={t('tools.videoProject.searchProjects', 'Search projects...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400'
                  : 'bg-white border-gray-200 text-gray-900'
              }`}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg ${
              isDark
                ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                : 'border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
            <ChevronDown
              className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`}
            />
          </button>
        </div>

        {showFilters && (
          <div className="flex gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`px-3 py-2 border rounded-lg ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-200 text-gray-900'
              }`}
            >
              <option value="">{t('tools.videoProject.allStatuses', 'All Statuses')}</option>
              {videoStatuses.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Project List */}
      <div className="px-4 pb-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            <Video className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>{projects.length === 0 ? t('tools.videoProject.noProjectsYet', 'No projects yet') : t('tools.videoProject.noProjectsMatchYourSearch', 'No projects match your search')}</p>
            <button onClick={handleAddProject} className="mt-2 text-violet-500 hover:underline">
              {t('tools.videoProject.createYourFirstProject', 'Create your first project')}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className={`p-4 rounded-lg border ${
                  isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'
                } transition-colors`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Video className="w-4 h-4 text-violet-500" />
                      <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {project.title}
                      </h4>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                        {videoStatuses.find((s) => s.value === project.status)?.label}
                      </span>
                    </div>

                    {project.description && (
                      <p
                        className={`text-sm mb-2 ml-6 ${
                          isDark ? 'text-gray-400' : 'text-gray-500'
                        }`}
                      >
                        {project.description}
                      </p>
                    )}

                    <div
                      className={`flex flex-wrap gap-4 text-sm ml-6 ${
                        isDark ? 'text-gray-400' : 'text-gray-500'
                      }`}
                    >
                      {project.platform && <span>{project.platform}</span>}
                      {project.format && <span>{videoFormats.find((f) => f.value === project.format)?.label}</span>}
                      {project.duration && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {project.duration} min
                        </span>
                      )}
                      {project.dueDate && <span>Due: {formatDate(project.dueDate)}</span>}
                      <span className={`font-medium ${getPriorityColor(project.priority)}`}>
                        {videoPriorities.find((p) => p.value === project.priority)?.label} Priority
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditProject(project)}
                      className={`p-2 rounded-lg ${
                        isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
                      }`}
                    >
                      <Edit2 className="w-4 h-4 text-gray-500" />
                    </button>
                    <button
                      onClick={() => handleDeleteProject(project.id)}
                      className={`p-2 rounded-lg ${
                        isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
                      }`}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Project Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div
            className={`w-full max-w-2xl rounded-xl shadow-xl ${
              isDark ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            <div
              className={`flex items-center justify-between p-4 border-b ${
                isDark ? 'border-gray-700' : 'border-gray-200'
              }`}
            >
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {editingProject ? t('tools.videoProject.editProject', 'Edit Project') : t('tools.videoProject.newVideoProject', 'New Video Project')}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}
                >
                  {t('tools.videoProject.projectTitle', 'Project Title *')}
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-200 text-gray-900'
                  }`}
                  placeholder={t('tools.videoProject.enterProjectTitle', 'Enter project title')}
                />
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}
                >
                  {t('tools.videoProject.description', 'Description')}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-200 text-gray-900'
                  }`}
                  placeholder={t('tools.videoProject.projectDescription', 'Project description')}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    {t('tools.videoProject.format', 'Format')}
                  </label>
                  <select
                    value={formData.format}
                    onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-200 text-gray-900'
                    }`}
                  >
                    <option value="">{t('tools.videoProject.selectFormat', 'Select format')}</option>
                    {videoFormats.map((f) => (
                      <option key={f.value} value={f.value}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    {t('tools.videoProject.platform', 'Platform')}
                  </label>
                  <select
                    value={formData.platform}
                    onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-200 text-gray-900'
                    }`}
                  >
                    <option value="">{t('tools.videoProject.selectPlatform', 'Select platform')}</option>
                    {platforms.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    {t('tools.videoProject.durationMinutes', 'Duration (minutes)')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-200 text-gray-900'
                    }`}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    {t('tools.videoProject.dueDate', 'Due Date')}
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-200 text-gray-900'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    {t('tools.videoProject.status', 'Status')}
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as VideoProject['status'] })}
                    className={`w-full px-3 py-2 border rounded-lg ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-200 text-gray-900'
                    }`}
                  >
                    {videoStatuses.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    {t('tools.videoProject.priority', 'Priority')}
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as VideoProject['priority'] })}
                    className={`w-full px-3 py-2 border rounded-lg ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-200 text-gray-900'
                    }`}
                  >
                    {videoPriorities.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div
              className={`flex justify-end gap-3 p-4 border-t ${
                isDark ? 'border-gray-700' : 'border-gray-200'
              }`}
            >
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className={`px-4 py-2 rounded-lg ${
                  isDark
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t('tools.videoProject.cancel', 'Cancel')}
              </button>
              <button
                onClick={handleSaveProject}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {isSaving ? t('tools.videoProject.saving', 'Saving...') : t('tools.videoProject.saveProject', 'Save Project')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoProjectTool;
