'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  Package,
  Plus,
  Trash2,
  Save,
  Edit,
  Calendar,
  DollarSign,
  User,
  Building2,
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
  Filter,
  Eye,
  X,
  Sparkles,
  FileText,
  TrendingUp,
  Briefcase,
  Upload,
  Download,
  CheckSquare,
  AlertTriangle,
  ArrowRight,
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

interface DeliverableTrackerToolProps {
  uiConfig?: UIConfig;
}

import { useTheme } from '@/contexts/ThemeContext';

// Types
interface Project {
  id: string;
  name: string;
  clientName: string;
  clientCompany: string;
  status: 'active' | 'completed' | 'on-hold';
  startDate: string;
  endDate: string;
}

interface Deliverable {
  id: string;
  projectId: string;
  projectName: string;
  clientCompany: string;
  name: string;
  description: string;
  category: 'document' | 'presentation' | 'report' | 'software' | 'training' | 'analysis' | 'other';
  status: 'not-started' | 'in-progress' | 'under-review' | 'revision' | 'approved' | 'delivered';
  priority: 'high' | 'medium' | 'low';
  assignee: string;
  dueDate: string;
  completedDate: string | null;
  estimatedHours: number;
  actualHours: number;
  progress: number;
  dependencies: string[];
  attachments: string[];
  comments: Comment[];
  milestoneId: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Comment {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}

interface Milestone {
  id: string;
  projectId: string;
  name: string;
  dueDate: string;
  status: 'pending' | 'completed';
}

// Constants
const CATEGORIES = [
  { value: 'document', label: 'Document', icon: '📄' },
  { value: 'presentation', label: 'Presentation', icon: '📊' },
  { value: 'report', label: 'Report', icon: '📑' },
  { value: 'software', label: 'Software/Code', icon: '💻' },
  { value: 'training', label: 'Training Material', icon: '📚' },
  { value: 'analysis', label: 'Analysis', icon: '📈' },
  { value: 'other', label: 'Other', icon: '📦' },
];

const STATUS_FLOW = ['not-started', 'in-progress', 'under-review', 'revision', 'approved', 'delivered'];

const STATUS_COLORS = {
  'not-started': { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-700 dark:text-gray-300', icon: Clock },
  'in-progress': { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', icon: ArrowRight },
  'under-review': { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', icon: Eye },
  'revision': { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400', icon: Edit },
  'approved': { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', icon: CheckCircle },
  'delivered': { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400', icon: Package },
};

const PRIORITY_COLORS = {
  high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
};

// Column configuration for exports
const DELIVERABLE_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Deliverable', type: 'string' },
  { key: 'projectName', header: 'Project', type: 'string' },
  { key: 'clientCompany', header: 'Client', type: 'string' },
  { key: 'category', header: 'Category', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'priority', header: 'Priority', type: 'string' },
  { key: 'assignee', header: 'Assignee', type: 'string' },
  { key: 'dueDate', header: 'Due Date', type: 'date' },
  { key: 'progress', header: 'Progress', type: 'number' },
  { key: 'estimatedHours', header: 'Est. Hours', type: 'number' },
  { key: 'actualHours', header: 'Actual Hours', type: 'number' },
];

const PROJECT_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Project Name', type: 'string' },
  { key: 'clientCompany', header: 'Client', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'startDate', header: 'Start Date', type: 'date' },
  { key: 'endDate', header: 'End Date', type: 'date' },
];

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);

const formatDate = (dateString: string) => {
  if (!dateString) return 'Not set';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const getDaysUntilDue = (dueDate: string) => {
  if (!dueDate) return null;
  const due = new Date(dueDate);
  const today = new Date();
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Main Component
export const DeliverableTrackerTool: React.FC<DeliverableTrackerToolProps> = ({ uiConfig }) => {
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // useToolData hooks for backend sync
  const {
    data: deliverables,
    addItem: addDeliverableToBackend,
    updateItem: updateDeliverableBackend,
    deleteItem: deleteDeliverableBackend,
    isSynced: deliverablesSynced,
    isSaving: deliverablesSaving,
    lastSaved: deliverablesLastSaved,
    syncError: deliverablesSyncError,
    forceSync: forceDeliverablesSync,
  } = useToolData<Deliverable>('deliverable-tracker-items', [], DELIVERABLE_COLUMNS);

  const {
    data: projects,
    addItem: addProjectToBackend,
    deleteItem: deleteProjectBackend,
  } = useToolData<Project>('deliverable-tracker-projects', [], PROJECT_COLUMNS);

  // Local UI State
  const [activeTab, setActiveTab] = useState<'deliverables' | 'projects' | 'kanban' | 'timeline'>('deliverables');
  const [showDeliverableForm, setShowDeliverableForm] = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [selectedDeliverable, setSelectedDeliverable] = useState<Deliverable | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterProject, setFilterProject] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  // New deliverable form state
  const [newDeliverable, setNewDeliverable] = useState<Partial<Deliverable>>({
    projectId: '',
    name: '',
    description: '',
    category: 'document',
    status: 'not-started',
    priority: 'medium',
    assignee: '',
    dueDate: '',
    estimatedHours: 0,
    progress: 0,
    dependencies: [],
    attachments: [],
    comments: [],
  });

  // New project form state
  const [newProject, setNewProject] = useState<Partial<Project>>({
    name: '',
    clientName: '',
    clientCompany: '',
    status: 'active',
    startDate: '',
    endDate: '',
  });

  // Prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params && !isPrefilled) {
      const params = uiConfig.params as Record<string, any>;

      // Handle gallery edit mode
      if (params.isEditFromGallery) {
        if (params.newDeliverable) {
          setNewDeliverable(params.newDeliverable);
        } else {
          if (params.deliverable || params.name) {
            setNewDeliverable(prev => ({
              ...prev,
              name: params.deliverable || params.name || '',
              description: params.description || '',
              category: params.category || 'document',
              dueDate: params.dueDate || '',
              priority: params.priority || 'medium',
              assignee: params.assignee || '',
              projectId: params.projectId || '',
              estimatedHours: params.estimatedHours || 0,
            }));
          }
        }
        if (params.newProject) {
          setNewProject(params.newProject);
        }
        if (params.activeTab) setActiveTab(params.activeTab);
        setShowDeliverableForm(true);
        setIsEditFromGallery(true);
        setIsPrefilled(true);
      } else {
        // Regular prefill from AI
        if (params.deliverable || params.name) {
          setNewDeliverable({
            ...newDeliverable,
            name: params.deliverable || params.name || '',
            description: params.description || '',
            category: params.category || 'document',
            dueDate: params.dueDate || '',
          });
          setShowDeliverableForm(true);
          setIsPrefilled(true);
        }
        if (params.project) {
          setNewProject({
            ...newProject,
            name: params.project,
            clientCompany: params.client || '',
          });
          setShowProjectForm(true);
          setIsPrefilled(true);
        }
      }
    }
  }, [uiConfig?.params, isPrefilled]);

  // Add deliverable
  const addDeliverable = () => {
    if (!newDeliverable.projectId || !newDeliverable.name) {
      setValidationMessage('Please select a project and enter a deliverable name');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const project = projects.find((p) => p.id === newDeliverable.projectId);
    const deliverable: Deliverable = {
      id: generateId(),
      projectId: newDeliverable.projectId || '',
      projectName: project?.name || '',
      clientCompany: project?.clientCompany || '',
      name: newDeliverable.name || '',
      description: newDeliverable.description || '',
      category: newDeliverable.category || 'document',
      status: 'not-started',
      priority: newDeliverable.priority || 'medium',
      assignee: newDeliverable.assignee || '',
      dueDate: newDeliverable.dueDate || '',
      completedDate: null,
      estimatedHours: newDeliverable.estimatedHours || 0,
      actualHours: 0,
      progress: 0,
      dependencies: newDeliverable.dependencies || [],
      attachments: [],
      comments: [],
      milestoneId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addDeliverableToBackend(deliverable);

    // Call onSaveCallback if provided (for gallery edit mode)
    const params = uiConfig?.params as Record<string, any>;
    if (params?.onSaveCallback && typeof params.onSaveCallback === 'function') {
      params.onSaveCallback();
    }

    setShowDeliverableForm(false);
    resetDeliverableForm();
  };

  // Reset deliverable form
  const resetDeliverableForm = () => {
    setNewDeliverable({
      projectId: '',
      name: '',
      description: '',
      category: 'document',
      status: 'not-started',
      priority: 'medium',
      assignee: '',
      dueDate: '',
      estimatedHours: 0,
      progress: 0,
      dependencies: [],
      attachments: [],
      comments: [],
    });
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
      startDate: newProject.startDate || '',
      endDate: newProject.endDate || '',
    };

    addProjectToBackend(project);
    setShowProjectForm(false);
    setNewProject({ name: '', clientName: '', clientCompany: '', status: 'active', startDate: '', endDate: '' });
  };

  // Delete deliverable
  const deleteDeliverable = async (id: string) => {
    const confirmed = await confirm({
      title: 'Confirm',
      message: 'Are you sure you want to delete this deliverable?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteDeliverableBackend(id);
    }
  };

  // Update deliverable status
  const updateDeliverableStatus = (deliverableId: string, status: Deliverable['status']) => {
    const updates: Partial<Deliverable> = {
      status,
      updatedAt: new Date().toISOString(),
    };
    if (status === 'delivered') {
      updates.completedDate = new Date().toISOString();
      updates.progress = 100;
    }
    updateDeliverableBackend(deliverableId, updates);
  };

  // Update deliverable progress
  const updateDeliverableProgress = (deliverableId: string, progress: number) => {
    updateDeliverableBackend(deliverableId, {
      progress: Math.min(100, Math.max(0, progress)),
      updatedAt: new Date().toISOString(),
    });
  };

  // Get next status in flow
  const getNextStatus = (currentStatus: Deliverable['status']): Deliverable['status'] | null => {
    const currentIndex = STATUS_FLOW.indexOf(currentStatus);
    if (currentIndex < STATUS_FLOW.length - 1) {
      return STATUS_FLOW[currentIndex + 1] as Deliverable['status'];
    }
    return null;
  };

  // Filtered deliverables
  const filteredDeliverables = useMemo(() => {
    return deliverables.filter((deliverable) => {
      const matchesSearch =
        searchTerm === '' ||
        deliverable.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deliverable.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deliverable.assignee.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || deliverable.status === filterStatus;
      const matchesProject = filterProject === 'all' || deliverable.projectId === filterProject;
      const matchesPriority = filterPriority === 'all' || deliverable.priority === filterPriority;
      return matchesSearch && matchesStatus && matchesProject && matchesPriority;
    });
  }, [deliverables, searchTerm, filterStatus, filterProject, filterPriority]);

  // Stats
  const stats = useMemo(() => {
    const total = deliverables.length;
    const notStarted = deliverables.filter((d) => d.status === 'not-started').length;
    const inProgress = deliverables.filter((d) => d.status === 'in-progress' || d.status === 'under-review' || d.status === 'revision').length;
    const delivered = deliverables.filter((d) => d.status === 'delivered').length;
    const overdue = deliverables.filter((d) => {
      const days = getDaysUntilDue(d.dueDate);
      return days !== null && days < 0 && d.status !== 'delivered';
    }).length;
    const avgProgress = total > 0 ? deliverables.reduce((sum, d) => sum + d.progress, 0) / total : 0;
    return { total, notStarted, inProgress, delivered, overdue, avgProgress };
  }, [deliverables]);

  // Group deliverables by status for Kanban
  const kanbanColumns = useMemo(() => {
    const columns: Record<string, Deliverable[]> = {};
    STATUS_FLOW.forEach((status) => {
      columns[status] = filteredDeliverables.filter((d) => d.status === status);
    });
    return columns;
  }, [filteredDeliverables]);

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.deliverableTracker.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.deliverableTracker.deliverableTracker', 'Deliverable Tracker')}
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.deliverableTracker.trackAndManageProjectDeliverables', 'Track and manage project deliverables')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="deliverable-tracker" toolName="Deliverable Tracker" />

              <SyncStatus
                isSynced={deliverablesSynced}
                isSaving={deliverablesSaving}
                lastSaved={deliverablesLastSaved}
                syncError={deliverablesSyncError}
                onForceSync={forceDeliverablesSync}
                theme={theme}
                showLabel={true}
                size="md"
              />
              <ExportDropdown
                onExportCSV={() => {
                  exportToCSV(deliverables, DELIVERABLE_COLUMNS, { filename: 'deliverables' });
                }}
                onExportExcel={() => {
                  exportToExcel(deliverables, DELIVERABLE_COLUMNS, { filename: 'deliverables' });
                }}
                onExportJSON={() => {
                  exportToJSON(deliverables, { filename: 'deliverables' });
                }}
                onExportPDF={async () => {
                  await exportToPDF(deliverables, DELIVERABLE_COLUMNS, {
                    filename: 'deliverables',
                    title: 'Deliverables Report',
                    subtitle: `${deliverables.length} deliverables | ${stats.delivered} completed`,
                  });
                }}
                onPrint={() => {
                  printData(deliverables, DELIVERABLE_COLUMNS, { title: 'Deliverables' });
                }}
                onCopyToClipboard={async () => {
                  return await copyUtil(deliverables, DELIVERABLE_COLUMNS, 'tab');
                }}
                showImport={false}
                theme={theme}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-4">
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.deliverableTracker.total', 'Total')}</p>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stats.total}</p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.deliverableTracker.notStarted', 'Not Started')}</p>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stats.notStarted}</p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.deliverableTracker.inProgress', 'In Progress')}</p>
              <p className={`text-2xl font-bold text-blue-600`}>{stats.inProgress}</p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.deliverableTracker.delivered', 'Delivered')}</p>
              <p className={`text-2xl font-bold text-green-600`}>{stats.delivered}</p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.deliverableTracker.overdue', 'Overdue')}</p>
              <p className={`text-2xl font-bold ${stats.overdue > 0 ? 'text-red-600' : theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stats.overdue}</p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.deliverableTracker.avgProgress', 'Avg Progress')}</p>
              <p className={`text-2xl font-bold text-[#0D9488]`}>{stats.avgProgress.toFixed(0)}%</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'deliverables', label: 'List View', icon: <FileText className="w-4 h-4" /> },
              { id: 'kanban', label: 'Kanban Board', icon: <CheckSquare className="w-4 h-4" /> },
              { id: 'projects', label: 'Projects', icon: <Briefcase className="w-4 h-4" /> },
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

        {/* List View */}
        {activeTab === 'deliverables' && (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            {/* Filters */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex flex-wrap items-center gap-4">
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                  <input
                    type="text"
                    placeholder={t('tools.deliverableTracker.searchDeliverables', 'Search deliverables...')}
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
                  <option value="all">{t('tools.deliverableTracker.allStatus', 'All Status')}</option>
                  {STATUS_FLOW.map((status) => (
                    <option key={status} value={status}>{status.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}</option>
                  ))}
                </select>
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className={`px-4 py-2 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="all">{t('tools.deliverableTracker.allPriority', 'All Priority')}</option>
                  <option value="high">{t('tools.deliverableTracker.high', 'High')}</option>
                  <option value="medium">{t('tools.deliverableTracker.medium', 'Medium')}</option>
                  <option value="low">{t('tools.deliverableTracker.low', 'Low')}</option>
                </select>
                <select
                  value={filterProject}
                  onChange={(e) => setFilterProject(e.target.value)}
                  className={`px-4 py-2 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="all">{t('tools.deliverableTracker.allProjects', 'All Projects')}</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => setShowDeliverableForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7A6E] transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t('tools.deliverableTracker.addDeliverable', 'Add Deliverable')}
              </button>
            </div>

            {/* Deliverables List */}
            <div className="space-y-3">
              {filteredDeliverables.length === 0 ? (
                <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{t('tools.deliverableTracker.noDeliverablesFound', 'No deliverables found')}</p>
                </div>
              ) : (
                filteredDeliverables.map((deliverable) => {
                  const StatusIcon = STATUS_COLORS[deliverable.status].icon;
                  const daysUntilDue = getDaysUntilDue(deliverable.dueDate);
                  const isOverdue = daysUntilDue !== null && daysUntilDue < 0 && deliverable.status !== 'delivered';
                  const categoryInfo = CATEGORIES.find((c) => c.value === deliverable.category);

                  return (
                    <div
                      key={deliverable.id}
                      className={`p-4 rounded-lg border ${
                        theme === 'dark' ? 'border-gray-700 hover:bg-gray-700/50' : 'border-gray-200 hover:bg-gray-50'
                      } ${isOverdue ? 'border-l-4 border-l-red-500' : ''} transition-colors`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-lg">{categoryInfo?.icon}</span>
                            <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {deliverable.name}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${STATUS_COLORS[deliverable.status].bg} ${STATUS_COLORS[deliverable.status].text}`}>
                              <StatusIcon className="w-3 h-3" />
                              {deliverable.status.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${PRIORITY_COLORS[deliverable.priority]}`}>
                              {deliverable.priority}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-sm">
                            <span className={`flex items-center gap-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              <Briefcase className="w-4 h-4" />
                              {deliverable.projectName}
                            </span>
                            <span className={`flex items-center gap-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              <Building2 className="w-4 h-4" />
                              {deliverable.clientCompany}
                            </span>
                            {deliverable.assignee && (
                              <span className={`flex items-center gap-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                <User className="w-4 h-4" />
                                {deliverable.assignee}
                              </span>
                            )}
                            <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-600 font-medium' : theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              <Calendar className="w-4 h-4" />
                              {formatDate(deliverable.dueDate)}
                              {daysUntilDue !== null && deliverable.status !== 'delivered' && (
                                <span className={`ml-1 ${daysUntilDue < 0 ? 'text-red-600' : daysUntilDue <= 3 ? 'text-orange-600' : ''}`}>
                                  ({daysUntilDue < 0 ? `${Math.abs(daysUntilDue)}d overdue` : daysUntilDue === 0 ? 'Due today' : `${daysUntilDue}d left`})
                                </span>
                              )}
                            </span>
                          </div>
                          {/* Progress bar */}
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>{t('tools.deliverableTracker.progress', 'Progress')}</span>
                              <span className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{deliverable.progress}%</span>
                            </div>
                            <div className={`h-2 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                              <div
                                className={`h-2 rounded-full transition-all ${
                                  deliverable.progress === 100 ? 'bg-green-500' : t('tools.deliverableTracker.bg0d9488', 'bg-[#0D9488]')
                                }`}
                                style={{ width: `${deliverable.progress}%` }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          {getNextStatus(deliverable.status) && (
                            <button
                              onClick={() => updateDeliverableStatus(deliverable.id, getNextStatus(deliverable.status)!)}
                              className="p-2 text-[#0D9488] hover:bg-[#0D9488]/10 rounded-lg transition-colors"
                              title={`Move to ${getNextStatus(deliverable.status)?.replace('-', ' ')}`}
                            >
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedDeliverable(deliverable)}
                            className={`p-2 rounded-lg transition-colors ${
                              theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
                            }`}
                            title={t('tools.deliverableTracker.viewDetails', 'View Details')}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteDeliverable(deliverable.id)}
                            className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Kanban View */}
        {activeTab === 'kanban' && (
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-4 min-w-max">
              {STATUS_FLOW.map((status) => {
                const StatusIcon = STATUS_COLORS[status as keyof typeof STATUS_COLORS].icon;
                const items = kanbanColumns[status] || [];

                return (
                  <div
                    key={status}
                    className={`w-72 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}
                  >
                    <div className={`p-3 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <StatusIcon className={`w-4 h-4 ${STATUS_COLORS[status as keyof typeof STATUS_COLORS].text}`} />
                          <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {status.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                          </span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-xs ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
                          {items.length}
                        </span>
                      </div>
                    </div>
                    <div className="p-2 space-y-2 max-h-[60vh] overflow-y-auto">
                      {items.map((deliverable) => {
                        const daysUntilDue = getDaysUntilDue(deliverable.dueDate);
                        const isOverdue = daysUntilDue !== null && daysUntilDue < 0;

                        return (
                          <div
                            key={deliverable.id}
                            className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} shadow-sm cursor-pointer hover:shadow-md transition-shadow`}
                            onClick={() => setSelectedDeliverable(deliverable)}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <span className={`px-2 py-0.5 rounded text-xs font-medium ${PRIORITY_COLORS[deliverable.priority]}`}>
                                {deliverable.priority}
                              </span>
                              <span className="text-sm">{CATEGORIES.find((c) => c.value === deliverable.category)?.icon}</span>
                            </div>
                            <h4 className={`font-medium text-sm mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {deliverable.name}
                            </h4>
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {deliverable.projectName}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <span className={`text-xs ${isOverdue ? 'text-red-600' : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                {formatDate(deliverable.dueDate)}
                              </span>
                              <div className={`h-1 w-12 rounded-full ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'}`}>
                                <div
                                  className="h-1 rounded-full bg-[#0D9488]"
                                  style={{ width: `${deliverable.progress}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
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
                {t('tools.deliverableTracker.addProject', 'Add Project')}
              </button>
            </div>

            <div className="space-y-4">
              {projects.map((project) => {
                const projectDeliverables = deliverables.filter((d) => d.projectId === project.id);
                const completedCount = projectDeliverables.filter((d) => d.status === 'delivered').length;
                const totalCount = projectDeliverables.length;
                const overallProgress = totalCount > 0 ? projectDeliverables.reduce((sum, d) => sum + d.progress, 0) / totalCount : 0;

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
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                        {completedCount}/{totalCount} deliverables completed
                      </span>
                      <span className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {overallProgress.toFixed(0)}% overall
                      </span>
                    </div>
                    <div className={`h-2 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <div
                        className="h-2 rounded-full bg-[#0D9488]"
                        style={{ width: `${overallProgress}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* New Deliverable Form Modal */}
        {showDeliverableForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto`}>
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.deliverableTracker.newDeliverable', 'New Deliverable')}
                  </h2>
                  <button onClick={() => setShowDeliverableForm(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.deliverableTracker.project', 'Project *')}
                  </label>
                  <select
                    value={newDeliverable.projectId}
                    onChange={(e) => setNewDeliverable({ ...newDeliverable, projectId: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="">{t('tools.deliverableTracker.selectProject', 'Select project...')}</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.deliverableTracker.deliverableName', 'Deliverable Name *')}
                  </label>
                  <input
                    type="text"
                    value={newDeliverable.name}
                    onChange={(e) => setNewDeliverable({ ...newDeliverable, name: e.target.value })}
                    placeholder={t('tools.deliverableTracker.eGFinalReport', 'e.g., Final Report')}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.deliverableTracker.description2', 'Description')}
                  </label>
                  <textarea
                    value={newDeliverable.description}
                    onChange={(e) => setNewDeliverable({ ...newDeliverable, description: e.target.value })}
                    rows={3}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.deliverableTracker.category', 'Category')}
                    </label>
                    <select
                      value={newDeliverable.category}
                      onChange={(e) => setNewDeliverable({ ...newDeliverable, category: e.target.value as Deliverable['category'] })}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value}>{cat.icon} {cat.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.deliverableTracker.priority', 'Priority')}
                    </label>
                    <select
                      value={newDeliverable.priority}
                      onChange={(e) => setNewDeliverable({ ...newDeliverable, priority: e.target.value as Deliverable['priority'] })}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="high">{t('tools.deliverableTracker.high2', 'High')}</option>
                      <option value="medium">{t('tools.deliverableTracker.medium2', 'Medium')}</option>
                      <option value="low">{t('tools.deliverableTracker.low2', 'Low')}</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.deliverableTracker.assignee2', 'Assignee')}
                    </label>
                    <input
                      type="text"
                      value={newDeliverable.assignee}
                      onChange={(e) => setNewDeliverable({ ...newDeliverable, assignee: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.deliverableTracker.dueDate2', 'Due Date')}
                    </label>
                    <input
                      type="date"
                      value={newDeliverable.dueDate}
                      onChange={(e) => setNewDeliverable({ ...newDeliverable, dueDate: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.deliverableTracker.estimatedHours2', 'Estimated Hours')}
                  </label>
                  <input
                    type="number"
                    value={newDeliverable.estimatedHours}
                    onChange={(e) => setNewDeliverable({ ...newDeliverable, estimatedHours: parseFloat(e.target.value) || 0 })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                <button
                  onClick={() => setShowDeliverableForm(false)}
                  className={`px-4 py-2 rounded-lg ${
                    theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {t('tools.deliverableTracker.cancel', 'Cancel')}
                </button>
                <button
                  onClick={addDeliverable}
                  className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7A6E] transition-colors"
                >
                  {t('tools.deliverableTracker.addDeliverable2', 'Add Deliverable')}
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
                    {t('tools.deliverableTracker.addProject2', 'Add Project')}
                  </h2>
                  <button onClick={() => setShowProjectForm(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.deliverableTracker.projectName', 'Project Name *')}
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
                    {t('tools.deliverableTracker.clientCompany', 'Client Company *')}
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.deliverableTracker.startDate', 'Start Date')}
                    </label>
                    <input
                      type="date"
                      value={newProject.startDate}
                      onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.deliverableTracker.endDate', 'End Date')}
                    </label>
                    <input
                      type="date"
                      value={newProject.endDate}
                      onChange={(e) => setNewProject({ ...newProject, endDate: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                <button
                  onClick={() => setShowProjectForm(false)}
                  className={`px-4 py-2 rounded-lg ${
                    theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {t('tools.deliverableTracker.cancel2', 'Cancel')}
                </button>
                <button
                  onClick={addProject}
                  className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7A6E] transition-colors"
                >
                  {t('tools.deliverableTracker.addProject3', 'Add Project')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Deliverable Detail Modal */}
        {selectedDeliverable && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{CATEGORIES.find((c) => c.value === selectedDeliverable.category)?.icon}</span>
                    <div>
                      <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {selectedDeliverable.name}
                      </h2>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {selectedDeliverable.projectName} - {selectedDeliverable.clientCompany}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedDeliverable(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex flex-wrap gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[selectedDeliverable.status].bg} ${STATUS_COLORS[selectedDeliverable.status].text}`}>
                    {selectedDeliverable.status.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                  </span>
                  <span className={`px-3 py-1 rounded text-sm font-medium ${PRIORITY_COLORS[selectedDeliverable.priority]}`}>
                    {selectedDeliverable.priority} priority
                  </span>
                </div>

                {selectedDeliverable.description && (
                  <div>
                    <h3 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.deliverableTracker.description', 'Description')}</h3>
                    <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{selectedDeliverable.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.deliverableTracker.assignee', 'Assignee')}</p>
                    <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {selectedDeliverable.assignee || 'Unassigned'}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.deliverableTracker.dueDate', 'Due Date')}</p>
                    <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {formatDate(selectedDeliverable.dueDate)}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.deliverableTracker.estimatedHours', 'Estimated Hours')}</p>
                    <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {selectedDeliverable.estimatedHours}h
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.deliverableTracker.actualHours', 'Actual Hours')}</p>
                    <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {selectedDeliverable.actualHours}h
                    </p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className={`text-sm font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.deliverableTracker.progress2', 'Progress')}</h3>
                    <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{selectedDeliverable.progress}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={selectedDeliverable.progress}
                    onChange={(e) => updateDeliverableProgress(selectedDeliverable.id, parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-between">
                <div className="flex gap-2">
                  {getNextStatus(selectedDeliverable.status) && (
                    <button
                      onClick={() => {
                        updateDeliverableStatus(selectedDeliverable.id, getNextStatus(selectedDeliverable.status)!);
                        setSelectedDeliverable(null);
                      }}
                      className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7A6E] transition-colors flex items-center gap-2"
                    >
                      <ArrowRight className="w-4 h-4" />
                      Move to {getNextStatus(selectedDeliverable.status)?.replace('-', ' ')}
                    </button>
                  )}
                </div>
                <button
                  onClick={() => setSelectedDeliverable(null)}
                  className={`px-4 py-2 rounded-lg ${
                    theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {t('tools.deliverableTracker.close', 'Close')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Validation Toast */}
        {validationMessage && (
          <div className="fixed bottom-4 right-4 px-4 py-3 rounded-lg bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 shadow-lg z-50 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {validationMessage}
          </div>
        )}

        <ConfirmDialog />
      </div>
    </div>
  );
};

export default DeliverableTrackerTool;
