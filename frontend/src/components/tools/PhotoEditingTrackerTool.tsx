'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import {
  Camera,
  Plus,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle,
  Calendar,
  User,
  Image,
  BarChart3,
  Filter,
  SortAsc,
  Search,
  X,
  Target,
  TrendingUp,
  AlertCircle,
  CheckSquare,
  Square,
  Layers,
  Download,
  Upload,
  Archive,
  MessageSquare,
  Star,
  FolderOpen,
  Timer,
  Settings,
  Eye,
  RefreshCw,
  Package,
  Send,
  HardDrive,
  Flag,
  FileCheck,
  ListChecks,
  Loader2,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import type { ColumnConfig } from '../../lib/toolDataUtils';

// Types
type EditingStage = 'import' | 'cull' | 'select' | 'edit' | 'retouch' | 'export';
type ProjectStatus = 'not_started' | 'in_progress' | 'proofing' | 'revision' | 'completed' | 'delivered';
type ProjectPriority = 'low' | 'medium' | 'high' | 'urgent';
type ProofingStatus = 'not_sent' | 'pending' | 'approved' | 'changes_requested';
type BackupStatus = 'not_started' | 'in_progress' | 'completed';
type ViewMode = 'list' | 'dashboard';
type SortField = 'client' | 'priority' | 'deadline' | 'status';

interface StageCounts {
  import: number;
  cull: number;
  select: number;
  edit: number;
  retouch: number;
  export: number;
}

interface Preset {
  id: string;
  name: string;
  usedCount: number;
}

interface RevisionRequest {
  id: string;
  description: string;
  photoIds: string;
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: string;
  completedAt?: string;
}

interface DeliveryChecklist {
  watermarksRemoved: boolean;
  colorProfileConverted: boolean;
  resizedForWeb: boolean;
  metadataAdded: boolean;
  filenameFormatted: boolean;
  qualityChecked: boolean;
  clientNotified: boolean;
}

interface ClientFeedback {
  id: string;
  date: string;
  note: string;
  rating?: number;
}

interface PhotoProject {
  id: string;
  client: string;
  shootDate: string;
  totalPhotos: number;
  stageCounts: StageCounts;
  currentStage: EditingStage;
  status: ProjectStatus;
  priority: ProjectPriority;
  deadline: string;
  timeSpent: number; // in minutes
  presetsUsed: Preset[];
  proofingStatus: ProofingStatus;
  proofingLink?: string;
  revisionRequests: RevisionRequest[];
  deliveryChecklist: DeliveryChecklist;
  archiveStatus: BackupStatus;
  backupStatus: BackupStatus;
  clientFeedback: ClientFeedback[];
  notes: string;
  createdAt: string;
  expanded: boolean;
}

// Helper functions
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const formatDate = (dateString: string): string => {
  if (!dateString) return 'No date';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  return `${hours}h ${mins}m`;
};

const isOverdue = (dateString: string): boolean => {
  if (!dateString) return false;
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
};

const getDaysUntilDue = (dateString: string): number => {
  if (!dateString) return Infinity;
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffTime = date.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Configuration objects
const stageConfig: Record<EditingStage, { label: string; color: string; bgColor: string; darkBgColor: string; icon: React.ReactNode }> = {
  import: { label: 'Import', color: 'text-gray-600', bgColor: 'bg-gray-100', darkBgColor: 'bg-gray-700', icon: <Download className="w-4 h-4" /> },
  cull: { label: 'Cull', color: 'text-red-600', bgColor: 'bg-red-100', darkBgColor: 'bg-red-900/30', icon: <Trash2 className="w-4 h-4" /> },
  select: { label: 'Select', color: 'text-yellow-600', bgColor: 'bg-yellow-100', darkBgColor: 'bg-yellow-900/30', icon: <Star className="w-4 h-4" /> },
  edit: { label: 'Edit', color: 'text-blue-600', bgColor: 'bg-blue-100', darkBgColor: 'bg-blue-900/30', icon: <Edit2 className="w-4 h-4" /> },
  retouch: { label: 'Retouch', color: 'text-purple-600', bgColor: 'bg-purple-100', darkBgColor: 'bg-purple-900/30', icon: <Image className="w-4 h-4" /> },
  export: { label: 'Export', color: 'text-green-600', bgColor: 'bg-green-100', darkBgColor: 'bg-green-900/30', icon: <Upload className="w-4 h-4" /> },
};

const statusConfig: Record<ProjectStatus, { label: string; color: string; bgColor: string; darkBgColor: string }> = {
  not_started: { label: 'Not Started', color: 'text-gray-500', bgColor: 'bg-gray-100', darkBgColor: 'bg-gray-700' },
  in_progress: { label: 'In Progress', color: 'text-blue-600', bgColor: 'bg-blue-100', darkBgColor: 'bg-blue-900/30' },
  proofing: { label: 'Client Proofing', color: 'text-purple-600', bgColor: 'bg-purple-100', darkBgColor: 'bg-purple-900/30' },
  revision: { label: 'Revisions', color: 'text-orange-600', bgColor: 'bg-orange-100', darkBgColor: 'bg-orange-900/30' },
  completed: { label: 'Completed', color: 'text-green-600', bgColor: 'bg-green-100', darkBgColor: 'bg-green-900/30' },
  delivered: { label: 'Delivered', color: 'text-teal-600', bgColor: 'bg-teal-100', darkBgColor: 'bg-teal-900/30' },
};

const priorityConfig: Record<ProjectPriority, { label: string; color: string; bgColor: string; darkBgColor: string }> = {
  low: { label: 'Low', color: 'text-gray-500', bgColor: 'bg-gray-100', darkBgColor: 'bg-gray-700' },
  medium: { label: 'Medium', color: 'text-blue-600', bgColor: 'bg-blue-100', darkBgColor: 'bg-blue-900/30' },
  high: { label: 'High', color: 'text-orange-600', bgColor: 'bg-orange-100', darkBgColor: 'bg-orange-900/30' },
  urgent: { label: 'Urgent', color: 'text-red-600', bgColor: 'bg-red-100', darkBgColor: 'bg-red-900/30' },
};

const proofingStatusConfig: Record<ProofingStatus, { label: string; color: string; bgColor: string; darkBgColor: string }> = {
  not_sent: { label: 'Not Sent', color: 'text-gray-500', bgColor: 'bg-gray-100', darkBgColor: 'bg-gray-700' },
  pending: { label: 'Awaiting Review', color: 'text-yellow-600', bgColor: 'bg-yellow-100', darkBgColor: 'bg-yellow-900/30' },
  approved: { label: 'Approved', color: 'text-green-600', bgColor: 'bg-green-100', darkBgColor: 'bg-green-900/30' },
  changes_requested: { label: 'Changes Requested', color: 'text-orange-600', bgColor: 'bg-orange-100', darkBgColor: 'bg-orange-900/30' },
};

const backupStatusConfig: Record<BackupStatus, { label: string; color: string; bgColor: string; darkBgColor: string }> = {
  not_started: { label: 'Not Started', color: 'text-gray-500', bgColor: 'bg-gray-100', darkBgColor: 'bg-gray-700' },
  in_progress: { label: 'In Progress', color: 'text-blue-600', bgColor: 'bg-blue-100', darkBgColor: 'bg-blue-900/30' },
  completed: { label: 'Completed', color: 'text-green-600', bgColor: 'bg-green-100', darkBgColor: 'bg-green-900/30' },
};

// Column configuration for exports
const COLUMNS: ColumnConfig[] = [
  { key: 'client', header: 'Client', type: 'string' },
  { key: 'shootDate', header: 'Shoot Date', type: 'date' },
  { key: 'totalPhotos', header: 'Total Photos', type: 'number' },
  { key: 'currentStage', header: 'Current Stage', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'priority', header: 'Priority', type: 'string' },
  { key: 'deadline', header: 'Deadline', type: 'date' },
  { key: 'timeSpent', header: 'Time Spent (mins)', type: 'number' },
  { key: 'proofingStatus', header: 'Proofing Status', type: 'string' },
  { key: 'backupStatus', header: 'Backup Status', type: 'string' },
  { key: 'archiveStatus', header: 'Archive Status', type: 'string' },
  { key: 'notes', header: 'Notes', type: 'string' },
  { key: 'createdAt', header: 'Created At', type: 'date' },
];

const defaultDeliveryChecklist: DeliveryChecklist = {
  watermarksRemoved: false,
  colorProfileConverted: false,
  resizedForWeb: false,
  metadataAdded: false,
  filenameFormatted: false,
  qualityChecked: false,
  clientNotified: false,
};

const defaultStageCounts: StageCounts = {
  import: 0,
  cull: 0,
  select: 0,
  edit: 0,
  retouch: 0,
  export: 0,
};

interface PhotoEditingTrackerToolProps {
  uiConfig?: UIConfig;
}

export const PhotoEditingTrackerTool = ({
  uiConfig }: PhotoEditingTrackerToolProps) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Use the new useToolData hook for backend persistence
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
  } = useToolData<PhotoProject>('photo-editing-tracker', [], COLUMNS);

  // State
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');
  const [sortField, setSortField] = useState<SortField>('priority');
  const [sortAsc, setSortAsc] = useState(false);

  // Modal states
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [editingProject, setEditingProject] = useState<PhotoProject | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Timer state
  const [activeTimerProjectId, setActiveTimerProjectId] = useState<string | null>(null);
  const [timerStartTime, setTimerStartTime] = useState<number | null>(null);

  // Form states
  const [projectForm, setProjectForm] = useState({
    client: '',
    shootDate: '',
    totalPhotos: 0,
    deadline: '',
    priority: 'medium' as ProjectPriority,
    notes: '',
    proofingLink: '',
  });

  const [revisionForm, setRevisionForm] = useState({
    description: '',
    photoIds: '',
  });

  const [feedbackForm, setFeedbackForm] = useState({
    note: '',
    rating: 5,
  });

  const [timeForm, setTimeForm] = useState({
    hours: 0,
    minutes: 0,
  });

  // Apply prefill data from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      let hasChanges = false;

      if (params.clientName) {
        setProjectForm(prev => ({ ...prev, clientName: params.clientName as string }));
        hasChanges = true;
      }
      if (params.projectName) {
        setProjectForm(prev => ({ ...prev, name: params.projectName as string }));
        hasChanges = true;
      }

      if (hasChanges) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Timer effect
  useEffect(() => {
    let interval: number | null = null;
    if (activeTimerProjectId && timerStartTime) {
      interval = window.setInterval(() => {
        // Update every minute
        const elapsed = Math.floor((Date.now() - timerStartTime) / 60000);
        if (elapsed > 0) {
          const project = projects.find(p => p.id === activeTimerProjectId);
          if (project) {
            updateItem(activeTimerProjectId, { timeSpent: project.timeSpent + 1 });
          }
          setTimerStartTime(Date.now());
        }
      }, 60000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTimerProjectId, timerStartTime, projects, updateItem]);

  // Filtered and sorted projects
  const filteredProjects = useMemo(() => {
    let result = [...projects];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        p =>
          p.client.toLowerCase().includes(query) ||
          p.notes.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter(p => p.status === statusFilter);
    }

    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'client':
          comparison = a.client.localeCompare(b.client);
          break;
        case 'priority': {
          const priorityOrder: Record<ProjectPriority, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        }
        case 'deadline':
          comparison = new Date(a.deadline || '9999-12-31').getTime() - new Date(b.deadline || '9999-12-31').getTime();
          break;
        case 'status': {
          const statusOrder: Record<ProjectStatus, number> = {
            in_progress: 0, revision: 1, proofing: 2, not_started: 3, completed: 4, delivered: 5
          };
          comparison = statusOrder[a.status] - statusOrder[b.status];
          break;
        }
      }
      return sortAsc ? comparison : -comparison;
    });

    return result;
  }, [projects, searchQuery, statusFilter, sortField, sortAsc]);

  // Dashboard stats
  const dashboardStats = useMemo(() => {
    const totalProjects = projects.length;
    const inProgress = projects.filter(p => p.status === 'in_progress').length;
    const awaitingProofing = projects.filter(p => p.proofingStatus === 'pending').length;
    const pendingRevisions = projects.filter(p =>
      p.revisionRequests.some(r => r.status !== 'completed')
    ).length;
    const overdueProjects = projects.filter(p =>
      p.status !== 'completed' && p.status !== 'delivered' && isOverdue(p.deadline)
    ).length;
    const totalPhotos = projects.reduce((sum, p) => sum + p.totalPhotos, 0);
    const totalTimeSpent = projects.reduce((sum, p) => sum + p.timeSpent, 0);
    const completedProjects = projects.filter(p => p.status === 'completed' || p.status === 'delivered').length;
    const needsBackup = projects.filter(p =>
      (p.status === 'completed' || p.status === 'delivered') && p.backupStatus !== 'completed'
    ).length;

    return {
      totalProjects,
      inProgress,
      awaitingProofing,
      pendingRevisions,
      overdueProjects,
      totalPhotos,
      totalTimeSpent,
      completedProjects,
      needsBackup,
    };
  }, [projects]);

  // Project CRUD operations
  const handleSaveProject = () => {
    if (!projectForm.client.trim()) return;

    if (editingProject) {
      updateItem(editingProject.id, {
        client: projectForm.client,
        shootDate: projectForm.shootDate,
        totalPhotos: projectForm.totalPhotos,
        deadline: projectForm.deadline,
        priority: projectForm.priority,
        notes: projectForm.notes,
        proofingLink: projectForm.proofingLink,
      });
    } else {
      const newProject: PhotoProject = {
        id: generateId(),
        client: projectForm.client,
        shootDate: projectForm.shootDate,
        totalPhotos: projectForm.totalPhotos,
        stageCounts: { ...defaultStageCounts, import: projectForm.totalPhotos },
        currentStage: 'import',
        status: 'not_started',
        priority: projectForm.priority,
        deadline: projectForm.deadline,
        timeSpent: 0,
        presetsUsed: [],
        proofingStatus: 'not_sent',
        proofingLink: projectForm.proofingLink,
        revisionRequests: [],
        deliveryChecklist: { ...defaultDeliveryChecklist },
        archiveStatus: 'not_started',
        backupStatus: 'not_started',
        clientFeedback: [],
        notes: projectForm.notes,
        createdAt: new Date().toISOString(),
        expanded: false,
      };
      addItem(newProject);
    }

    setShowProjectModal(false);
    setEditingProject(null);
    resetProjectForm();
  };

  const handleEditProject = (project: PhotoProject) => {
    setEditingProject(project);
    setProjectForm({
      client: project.client,
      shootDate: project.shootDate,
      totalPhotos: project.totalPhotos,
      deadline: project.deadline,
      priority: project.priority,
      notes: project.notes,
      proofingLink: project.proofingLink || '',
    });
    setShowProjectModal(true);
  };

  const handleDeleteProject = async (projectId: string) => {
    const confirmed = await confirm({
      title: 'Delete Project',
      message: 'Are you sure you want to delete this project?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteItem(projectId);
      if (activeTimerProjectId === projectId) {
        setActiveTimerProjectId(null);
        setTimerStartTime(null);
      }
    }
  };

  const toggleProjectExpanded = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      updateItem(projectId, { expanded: !project.expanded });
    }
  };

  const resetProjectForm = () => {
    setProjectForm({
      client: '',
      shootDate: '',
      totalPhotos: 0,
      deadline: '',
      priority: 'medium',
      notes: '',
      proofingLink: '',
    });
  };

  // Stage operations
  const updateStageCount = (projectId: string, stage: EditingStage, count: number) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      const newStageCounts = { ...project.stageCounts, [stage]: Math.max(0, count) };
      updateItem(projectId, { stageCounts: newStageCounts });
    }
  };

  const updateCurrentStage = (projectId: string, stage: EditingStage) => {
    updateItem(projectId, { currentStage: stage, status: 'in_progress' });
  };

  const updateProjectStatus = (projectId: string, status: ProjectStatus) => {
    updateItem(projectId, { status });
  };

  // Timer operations
  const toggleTimer = (projectId: string) => {
    if (activeTimerProjectId === projectId) {
      // Stop timer
      if (timerStartTime) {
        const elapsed = Math.floor((Date.now() - timerStartTime) / 60000);
        if (elapsed > 0) {
          const project = projects.find(p => p.id === projectId);
          if (project) {
            updateItem(projectId, { timeSpent: project.timeSpent + elapsed });
          }
        }
      }
      setActiveTimerProjectId(null);
      setTimerStartTime(null);
    } else {
      // Start timer
      setActiveTimerProjectId(projectId);
      setTimerStartTime(Date.now());
    }
  };

  const addManualTime = (projectId: string) => {
    const totalMinutes = timeForm.hours * 60 + timeForm.minutes;
    if (totalMinutes > 0) {
      const project = projects.find(p => p.id === projectId);
      if (project) {
        updateItem(projectId, { timeSpent: project.timeSpent + totalMinutes });
      }
    }
    setShowTimeModal(false);
    setTimeForm({ hours: 0, minutes: 0 });
  };

  // Preset operations
  const addPreset = (projectId: string, presetName: string) => {
    if (!presetName.trim()) return;
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const existingPreset = project.presetsUsed.find(pr => pr.name.toLowerCase() === presetName.toLowerCase());
    if (existingPreset) {
      updateItem(projectId, {
        presetsUsed: project.presetsUsed.map(pr =>
          pr.id === existingPreset.id ? { ...pr, usedCount: pr.usedCount + 1 } : pr
        ),
      });
    } else {
      updateItem(projectId, {
        presetsUsed: [...project.presetsUsed, { id: generateId(), name: presetName, usedCount: 1 }],
      });
    }
  };

  // Proofing operations
  const updateProofingStatus = (projectId: string, status: ProofingStatus) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    updateItem(projectId, {
      proofingStatus: status,
      status: status === 'approved' ? 'completed' : status === 'changes_requested' ? 'revision' : project.status,
    });
  };

  // Revision operations
  const addRevisionRequest = (projectId: string) => {
    if (!revisionForm.description.trim()) return;
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const newRevision: RevisionRequest = {
      id: generateId(),
      description: revisionForm.description,
      photoIds: revisionForm.photoIds,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    updateItem(projectId, {
      revisionRequests: [...project.revisionRequests, newRevision],
      status: 'revision',
    });
    setShowRevisionModal(false);
    setRevisionForm({ description: '', photoIds: '' });
  };

  const updateRevisionStatus = (projectId: string, revisionId: string, status: 'pending' | 'in_progress' | 'completed') => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const updatedRevisions = project.revisionRequests.map(r =>
      r.id === revisionId
        ? { ...r, status, completedAt: status === 'completed' ? new Date().toISOString() : undefined }
        : r
    );
    const hasOpenRevisions = updatedRevisions.some(r => r.status !== 'completed');
    updateItem(projectId, {
      revisionRequests: updatedRevisions,
      status: hasOpenRevisions ? 'revision' : project.proofingStatus === 'approved' ? 'completed' : project.status,
    });
  };

  // Delivery checklist operations
  const toggleDeliveryChecklistItem = (projectId: string, item: keyof DeliveryChecklist) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      updateItem(projectId, {
        deliveryChecklist: { ...project.deliveryChecklist, [item]: !project.deliveryChecklist[item] },
      });
    }
  };

  // Backup/Archive operations
  const updateBackupStatus = (projectId: string, status: BackupStatus) => {
    updateItem(projectId, { backupStatus: status });
  };

  const updateArchiveStatus = (projectId: string, status: BackupStatus) => {
    updateItem(projectId, { archiveStatus: status });
  };

  // Feedback operations
  const addClientFeedback = (projectId: string) => {
    if (!feedbackForm.note.trim()) return;
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const newFeedback: ClientFeedback = {
      id: generateId(),
      date: new Date().toISOString(),
      note: feedbackForm.note,
      rating: feedbackForm.rating,
    };
    updateItem(projectId, {
      clientFeedback: [...project.clientFeedback, newFeedback],
    });
    setShowFeedbackModal(false);
    setFeedbackForm({ note: '', rating: 5 });
  };

  // Calculate project progress
  const getProjectProgress = (project: PhotoProject): number => {
    const stages: EditingStage[] = ['import', 'cull', 'select', 'edit', 'retouch', 'export'];
    const currentIndex = stages.indexOf(project.currentStage);
    const stageProgress = ((currentIndex + 1) / stages.length) * 100;

    // Adjust based on completion status
    if (project.status === 'delivered') return 100;
    if (project.status === 'completed') return 95;

    return Math.min(90, stageProgress);
  };

  // Get delivery checklist completion
  const getDeliveryChecklistProgress = (checklist: DeliveryChecklist): number => {
    const items = Object.values(checklist);
    const completed = items.filter(Boolean).length;
    return Math.round((completed / items.length) * 100);
  };

  // Render Dashboard View
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gradient-to-br from-blue-50 to-blue-100'}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-900/50' : 'bg-blue-200'}`}>
              <Camera className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {dashboardStats.totalProjects}
              </p>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.photoEditingTracker.totalProjects', 'Total Projects')}</p>
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gradient-to-br from-yellow-50 to-yellow-100'}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-yellow-900/50' : 'bg-yellow-200'}`}>
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {dashboardStats.inProgress}
              </p>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.photoEditingTracker.inProgress', 'In Progress')}</p>
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gradient-to-br from-purple-50 to-purple-100'}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-purple-900/50' : 'bg-purple-200'}`}>
              <Eye className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {dashboardStats.awaitingProofing}
              </p>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.photoEditingTracker.awaitingReview', 'Awaiting Review')}</p>
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gradient-to-br from-red-50 to-red-100'}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-red-900/50' : 'bg-red-200'}`}>
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {dashboardStats.overdueProjects}
              </p>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.photoEditingTracker.overdue', 'Overdue')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-white border border-gray-200'}`}>
          <div className="flex items-center gap-2 mb-2">
            <Image className="w-4 h-4 text-[#0D9488]" />
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.photoEditingTracker.totalPhotos', 'Total Photos')}</span>
          </div>
          <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {dashboardStats.totalPhotos.toLocaleString()}
          </p>
        </div>

        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-white border border-gray-200'}`}>
          <div className="flex items-center gap-2 mb-2">
            <Timer className="w-4 h-4 text-[#0D9488]" />
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.photoEditingTracker.timeSpent', 'Time Spent')}</span>
          </div>
          <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {formatTime(dashboardStats.totalTimeSpent)}
          </p>
        </div>

        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-white border border-gray-200'}`}>
          <div className="flex items-center gap-2 mb-2">
            <RefreshCw className="w-4 h-4 text-[#0D9488]" />
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.photoEditingTracker.revisions', 'Revisions')}</span>
          </div>
          <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {dashboardStats.pendingRevisions}
          </p>
        </div>

        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-white border border-gray-200'}`}>
          <div className="flex items-center gap-2 mb-2">
            <HardDrive className="w-4 h-4 text-[#0D9488]" />
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.photoEditingTracker.needsBackup', 'Needs Backup')}</span>
          </div>
          <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {dashboardStats.needsBackup}
          </p>
        </div>
      </div>

      {/* Priority Queue */}
      <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-white border border-gray-200'}`}>
        <div className="flex items-center gap-2 mb-4">
          <Flag className="w-5 h-5 text-[#0D9488]" />
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.photoEditingTracker.priorityQueue', 'Priority Queue')}
          </h3>
        </div>
        <div className="space-y-3">
          {projects
            .filter(p => p.status !== 'completed' && p.status !== 'delivered')
            .sort((a, b) => {
              const priorityOrder: Record<ProjectPriority, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
              return priorityOrder[a.priority] - priorityOrder[b.priority];
            })
            .slice(0, 5)
            .map(project => {
              const progress = getProjectProgress(project);
              const prioConfig = priorityConfig[project.priority];
              const isProjectOverdue = isOverdue(project.deadline);
              return (
                <div
                  key={project.id}
                  className={`p-3 rounded-lg ${isDark ? 'bg-gray-600' : 'bg-gray-50'} ${
                    isProjectOverdue ? 'ring-2 ring-red-500/50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${prioConfig.color} ${
                        isDark ? prioConfig.darkBgColor : prioConfig.bgColor
                      }`}>
                        {prioConfig.label}
                      </span>
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {project.client}
                      </span>
                    </div>
                    <span className={`text-xs ${isProjectOverdue ? 'text-red-500' : isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {isProjectOverdue ? 'Overdue' : `Due ${formatDate(project.deadline)}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`flex-1 h-2 rounded-full ${isDark ? 'bg-gray-500' : 'bg-gray-200'}`}>
                      <div
                        className="h-full bg-[#0D9488] rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {progress}%
                    </span>
                  </div>
                </div>
              );
            })}
          {projects.filter(p => p.status !== 'completed' && p.status !== 'delivered').length === 0 && (
            <p className={`text-center py-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {t('tools.photoEditingTracker.noActiveProjects', 'No active projects')}
            </p>
          )}
        </div>
      </div>

      {/* Batch Progress */}
      <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-white border border-gray-200'}`}>
        <div className="flex items-center gap-2 mb-4">
          <Layers className="w-5 h-5 text-[#0D9488]" />
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.photoEditingTracker.editingStageDistribution', 'Editing Stage Distribution')}
          </h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {(['import', 'cull', 'select', 'edit', 'retouch', 'export'] as EditingStage[]).map(stage => {
            const config = stageConfig[stage];
            const count = projects.filter(p =>
              p.currentStage === stage && p.status !== 'completed' && p.status !== 'delivered'
            ).length;
            return (
              <div
                key={stage}
                className={`p-3 rounded-lg text-center ${isDark ? config.darkBgColor : config.bgColor}`}
              >
                <div className={`flex justify-center mb-2 ${config.color}`}>
                  {config.icon}
                </div>
                <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {count}
                </p>
                <p className={`text-xs ${config.color}`}>{config.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // Render Project Item
  const renderProject = (project: PhotoProject) => {
    const statConfig = statusConfig[project.status];
    const prioConfig = priorityConfig[project.priority];
    const proofConfig = proofingStatusConfig[project.proofingStatus];
    const progress = getProjectProgress(project);
    const isProjectOverdue = project.status !== 'completed' && project.status !== 'delivered' && isOverdue(project.deadline);
    const daysUntil = getDaysUntilDue(project.deadline);
    const deliveryProgress = getDeliveryChecklistProgress(project.deliveryChecklist);
    const isTimerActive = activeTimerProjectId === project.id;

    return (
      <div
        key={project.id}
        className={`rounded-xl border overflow-hidden ${
          isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
        } ${isProjectOverdue ? 'ring-2 ring-red-500/50' : ''}`}
      >
        {/* Project Header */}
        <div
          className={`p-4 cursor-pointer ${isDark ? 'hover:bg-gray-600/50' : 'hover:bg-gray-50'}`}
          onClick={() => toggleProjectExpanded(project.id)}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <button className="mt-1">
                {project.expanded ? (
                  <ChevronDown className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                ) : (
                  <ChevronRight className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {project.client}
                  </h3>
                  {isTimerActive && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 animate-pulse">
                      <Timer className="w-3 h-3" />
                      {t('tools.photoEditingTracker.recording', 'Recording')}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${statConfig.color} ${
                    isDark ? statConfig.darkBgColor : statConfig.bgColor
                  }`}>
                    {statConfig.label}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${prioConfig.color} ${
                    isDark ? prioConfig.darkBgColor : prioConfig.bgColor
                  }`}>
                    {prioConfig.label}
                  </span>
                  <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
                    isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'
                  }`}>
                    <Image className="w-3 h-3" />
                    {project.totalPhotos} photos
                  </span>
                  {project.deadline && (
                    <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
                      isProjectOverdue
                        ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                        : daysUntil <= 3
                        ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400'
                        : isDark
                        ? 'bg-gray-600 text-gray-300'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      <Calendar className="w-3 h-3" />
                      {formatDate(project.deadline)}
                      {isProjectOverdue && ' (Overdue)'}
                    </span>
                  )}
                  <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
                    isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'
                  }`}>
                    <Timer className="w-3 h-3" />
                    {formatTime(project.timeSpent)}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
              <button
                onClick={() => toggleTimer(project.id)}
                className={`p-2 rounded-lg transition-colors ${
                  isTimerActive
                    ? 'bg-green-100 hover:bg-green-200 dark:bg-green-900/50 dark:hover:bg-green-900/70'
                    : isDark
                    ? 'hover:bg-gray-600'
                    : 'hover:bg-gray-100'
                }`}
                title={isTimerActive ? t('tools.photoEditingTracker.stopTimer', 'Stop timer') : t('tools.photoEditingTracker.startTimer', 'Start timer')}
              >
                <Timer className={`w-4 h-4 ${isTimerActive ? 'text-green-600' : isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              </button>
              <button
                onClick={() => handleEditProject(project)}
                className={`p-2 rounded-lg transition-colors ${
                  isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                }`}
              >
                <Edit2 className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              </button>
              <button
                onClick={() => handleDeleteProject(project.id)}
                className={`p-2 rounded-lg transition-colors ${
                  isDark ? 'hover:bg-red-900/50' : 'hover:bg-red-100'
                }`}
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-3 pl-8">
            <div className="flex items-center justify-between mb-1">
              <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('tools.photoEditingTracker.progress', 'Progress')}
              </span>
              <span className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {progress}%
              </span>
            </div>
            <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`}>
              <div
                className="h-full bg-[#0D9488] transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Expanded Content */}
        {project.expanded && (
          <div className={`border-t ${isDark ? 'border-gray-600 bg-gray-800/50' : 'border-gray-200 bg-gray-50'} p-4`}>
            <div className="space-y-6">
              {/* Editing Stages */}
              <div>
                <h4 className={`font-medium mb-3 flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <Layers className="w-4 h-4" />
                  {t('tools.photoEditingTracker.editingStages', 'Editing Stages')}
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {(['import', 'cull', 'select', 'edit', 'retouch', 'export'] as EditingStage[]).map(stage => {
                    const config = stageConfig[stage];
                    const isActive = project.currentStage === stage;
                    return (
                      <div
                        key={stage}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          isActive
                            ? 'border-[#0D9488] ring-2 ring-[#0D9488]/20'
                            : isDark
                            ? 'border-gray-600'
                            : 'border-gray-200'
                        } ${isDark ? config.darkBgColor : config.bgColor}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
                          <button
                            onClick={() => updateCurrentStage(project.id, stage)}
                            className={`p-1 rounded ${
                              isActive
                                ? 'bg-[#0D9488] text-white'
                                : isDark
                                ? 'hover:bg-gray-600'
                                : 'hover:bg-gray-200'
                            }`}
                          >
                            {isActive ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                          </button>
                        </div>
                        <input
                          type="number"
                          min="0"
                          value={project.stageCounts[stage]}
                          onChange={e => updateStageCount(project.id, stage, parseInt(e.target.value) || 0)}
                          className={`w-full px-2 py-1 rounded text-center text-sm ${
                            isDark
                              ? 'bg-gray-700 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          } border`}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Presets Used */}
              <div>
                <h4 className={`font-medium mb-3 flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <Settings className="w-4 h-4" />
                  {t('tools.photoEditingTracker.presetsUsed', 'Presets Used')}
                </h4>
                <div className="flex flex-wrap gap-2 mb-2">
                  {project.presetsUsed.map(preset => (
                    <span
                      key={preset.id}
                      className={`px-3 py-1 rounded-full text-sm ${
                        isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {preset.name} ({preset.usedCount}x)
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={t('tools.photoEditingTracker.addPreset', 'Add preset...')}
                    className={`flex-1 px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400'
                        : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'
                    }`}
                    onKeyPress={e => {
                      if (e.key === 'Enter') {
                        addPreset(project.id, (e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                  />
                </div>
              </div>

              {/* Client Proofing */}
              <div>
                <h4 className={`font-medium mb-3 flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <Eye className="w-4 h-4" />
                  {t('tools.photoEditingTracker.clientProofing2', 'Client Proofing')}
                </h4>
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-sm ${proofConfig.color} ${
                    isDark ? proofConfig.darkBgColor : proofConfig.bgColor
                  }`}>
                    {proofConfig.label}
                  </span>
                  <div className="flex gap-2">
                    {(['not_sent', 'pending', 'approved', 'changes_requested'] as ProofingStatus[]).map(status => (
                      <button
                        key={status}
                        onClick={() => updateProofingStatus(project.id, status)}
                        className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                          project.proofingStatus === status
                            ? 'bg-[#0D9488] text-white'
                            : isDark
                            ? 'bg-gray-600 hover:bg-gray-500 text-gray-300'
                            : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                        }`}
                      >
                        {proofingStatusConfig[status].label}
                      </button>
                    ))}
                  </div>
                </div>
                {project.proofingLink && (
                  <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Proofing link: {project.proofingLink}
                  </p>
                )}
              </div>

              {/* Revision Requests */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className={`font-medium flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    <RefreshCw className="w-4 h-4" />
                    Revision Requests ({project.revisionRequests.filter(r => r.status !== 'completed').length} pending)
                  </h4>
                  <button
                    onClick={() => {
                      setSelectedProjectId(project.id);
                      setShowRevisionModal(true);
                    }}
                    className="flex items-center gap-1 px-3 py-1 bg-[#0D9488] hover:bg-[#0B7C73] text-white text-sm rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    {t('tools.photoEditingTracker.add', 'Add')}
                  </button>
                </div>
                <div className="space-y-2">
                  {project.revisionRequests.map(revision => (
                    <div
                      key={revision.id}
                      className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-white'} border ${
                        isDark ? 'border-gray-600' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {revision.description}
                          </p>
                          {revision.photoIds && (
                            <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              Photos: {revision.photoIds}
                            </p>
                          )}
                          <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                            {formatDate(revision.createdAt)}
                          </p>
                        </div>
                        <select
                          value={revision.status}
                          onChange={e => updateRevisionStatus(project.id, revision.id, e.target.value as 'pending' | 'in_progress' | 'completed')}
                          className={`px-2 py-1 rounded text-sm ${
                            isDark
                              ? 'bg-gray-600 border-gray-500 text-white'
                              : 'bg-gray-100 border-gray-200 text-gray-900'
                          } border`}
                        >
                          <option value="pending">{t('tools.photoEditingTracker.pending', 'Pending')}</option>
                          <option value="in_progress">{t('tools.photoEditingTracker.inProgress2', 'In Progress')}</option>
                          <option value="completed">{t('tools.photoEditingTracker.completed', 'Completed')}</option>
                        </select>
                      </div>
                    </div>
                  ))}
                  {project.revisionRequests.length === 0 && (
                    <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      {t('tools.photoEditingTracker.noRevisionRequests', 'No revision requests')}
                    </p>
                  )}
                </div>
              </div>

              {/* Delivery Checklist */}
              <div>
                <h4 className={`font-medium mb-3 flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <FileCheck className="w-4 h-4" />
                  Final Delivery Checklist ({deliveryProgress}%)
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {(Object.entries(project.deliveryChecklist) as [keyof DeliveryChecklist, boolean][]).map(([key, value]) => {
                    const labels: Record<keyof DeliveryChecklist, string> = {
                      watermarksRemoved: 'Watermarks Removed',
                      colorProfileConverted: 'Color Profile',
                      resizedForWeb: 'Resized for Web',
                      metadataAdded: 'Metadata Added',
                      filenameFormatted: 'Filenames Formatted',
                      qualityChecked: 'Quality Checked',
                      clientNotified: 'Client Notified',
                    };
                    return (
                      <button
                        key={key}
                        onClick={() => toggleDeliveryChecklistItem(project.id, key)}
                        className={`flex items-center gap-2 p-2 rounded-lg text-sm transition-colors ${
                          value
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : isDark
                            ? 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {value ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                        {labels[key]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Archive/Backup Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className={`font-medium mb-3 flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    <Archive className="w-4 h-4" />
                    {t('tools.photoEditingTracker.archiveStatus', 'Archive Status')}
                  </h4>
                  <div className="flex gap-2">
                    {(['not_started', 'in_progress', 'completed'] as BackupStatus[]).map(status => (
                      <button
                        key={status}
                        onClick={() => updateArchiveStatus(project.id, status)}
                        className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                          project.archiveStatus === status
                            ? 'bg-[#0D9488] text-white'
                            : isDark
                            ? 'bg-gray-600 hover:bg-gray-500 text-gray-300'
                            : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                        }`}
                      >
                        {backupStatusConfig[status].label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className={`font-medium mb-3 flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    <HardDrive className="w-4 h-4" />
                    {t('tools.photoEditingTracker.backupStatus', 'Backup Status')}
                  </h4>
                  <div className="flex gap-2">
                    {(['not_started', 'in_progress', 'completed'] as BackupStatus[]).map(status => (
                      <button
                        key={status}
                        onClick={() => updateBackupStatus(project.id, status)}
                        className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                          project.backupStatus === status
                            ? 'bg-[#0D9488] text-white'
                            : isDark
                            ? 'bg-gray-600 hover:bg-gray-500 text-gray-300'
                            : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                        }`}
                      >
                        {backupStatusConfig[status].label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Time Tracking */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className={`font-medium flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    <Timer className="w-4 h-4" />
                    Time Spent: {formatTime(project.timeSpent)}
                  </h4>
                  <button
                    onClick={() => {
                      setSelectedProjectId(project.id);
                      setShowTimeModal(true);
                    }}
                    className="flex items-center gap-1 px-3 py-1 bg-[#0D9488] hover:bg-[#0B7C73] text-white text-sm rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    {t('tools.photoEditingTracker.addTime', 'Add Time')}
                  </button>
                </div>
              </div>

              {/* Client Feedback */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className={`font-medium flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    <MessageSquare className="w-4 h-4" />
                    {t('tools.photoEditingTracker.clientFeedback', 'Client Feedback')}
                  </h4>
                  <button
                    onClick={() => {
                      setSelectedProjectId(project.id);
                      setShowFeedbackModal(true);
                    }}
                    className="flex items-center gap-1 px-3 py-1 bg-[#0D9488] hover:bg-[#0B7C73] text-white text-sm rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    {t('tools.photoEditingTracker.add2', 'Add')}
                  </button>
                </div>
                <div className="space-y-2">
                  {project.clientFeedback.map(feedback => (
                    <div
                      key={feedback.id}
                      className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-white'} border ${
                        isDark ? 'border-gray-600' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <p className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {feedback.note}
                        </p>
                        {feedback.rating && (
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < feedback.rating!
                                    ? 'text-yellow-400 fill-yellow-400'
                                    : isDark
                                    ? 'text-gray-600'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                      <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        {formatDate(feedback.date)}
                      </p>
                    </div>
                  ))}
                  {project.clientFeedback.length === 0 && (
                    <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      {t('tools.photoEditingTracker.noFeedbackYet', 'No feedback yet')}
                    </p>
                  )}
                </div>
              </div>

              {/* Project Status */}
              <div>
                <h4 className={`font-medium mb-3 flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <Target className="w-4 h-4" />
                  {t('tools.photoEditingTracker.projectStatus', 'Project Status')}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(['not_started', 'in_progress', 'proofing', 'revision', 'completed', 'delivered'] as ProjectStatus[]).map(status => (
                    <button
                      key={status}
                      onClick={() => updateProjectStatus(project.id, status)}
                      className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                        project.status === status
                          ? 'bg-[#0D9488] text-white'
                          : isDark
                          ? 'bg-gray-600 hover:bg-gray-500 text-gray-300'
                          : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                      }`}
                    >
                      {statusConfig[status].label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render List View
  const renderListView = () => (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
            isDark ? 'text-gray-500' : 'text-gray-400'
          }`} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={t('tools.photoEditingTracker.searchProjects', 'Search projects...')}
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl border ${
              isDark
                ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400'
                : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'
            } focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`}
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as ProjectStatus | 'all')}
            className={`px-3 py-2.5 rounded-xl border ${
              isDark
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-200 text-gray-900'
            } focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`}
          >
            <option value="all">{t('tools.photoEditingTracker.allStatus', 'All Status')}</option>
            <option value="not_started">{t('tools.photoEditingTracker.notStarted', 'Not Started')}</option>
            <option value="in_progress">{t('tools.photoEditingTracker.inProgress3', 'In Progress')}</option>
            <option value="proofing">{t('tools.photoEditingTracker.clientProofing', 'Client Proofing')}</option>
            <option value="revision">{t('tools.photoEditingTracker.revisions2', 'Revisions')}</option>
            <option value="completed">{t('tools.photoEditingTracker.completed2', 'Completed')}</option>
            <option value="delivered">{t('tools.photoEditingTracker.delivered', 'Delivered')}</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <SortAsc className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          <select
            value={sortField}
            onChange={e => setSortField(e.target.value as SortField)}
            className={`px-3 py-2.5 rounded-xl border ${
              isDark
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-200 text-gray-900'
            } focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`}
          >
            <option value="priority">{t('tools.photoEditingTracker.priority', 'Priority')}</option>
            <option value="deadline">{t('tools.photoEditingTracker.deadline', 'Deadline')}</option>
            <option value="client">{t('tools.photoEditingTracker.client', 'Client')}</option>
            <option value="status">{t('tools.photoEditingTracker.status', 'Status')}</option>
          </select>
          <button
            onClick={() => setSortAsc(!sortAsc)}
            className={`p-2.5 rounded-xl border transition-colors ${
              isDark
                ? 'bg-gray-700 border-gray-600 hover:bg-gray-600 text-white'
                : 'bg-white border-gray-200 hover:bg-gray-100 text-gray-900'
            }`}
          >
            {sortAsc ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingUp className="w-4 h-4 transform rotate-180" />
            )}
          </button>
        </div>
      </div>

      {/* Projects List */}
      {filteredProjects.length === 0 ? (
        <div className={`text-center py-16 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          <Camera className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <h3 className={`text-lg font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            {searchQuery || statusFilter !== 'all' ? t('tools.photoEditingTracker.noMatchingProjects', 'No matching projects') : t('tools.photoEditingTracker.noProjectsYet', 'No projects yet')}
          </h3>
          <p className="text-sm mb-4">
            {searchQuery || statusFilter !== 'all'
              ? t('tools.photoEditingTracker.tryAdjustingYourFilters', 'Try adjusting your filters') : t('tools.photoEditingTracker.createYourFirstPhotoEditing', 'Create your first photo editing project')}
          </p>
          {!searchQuery && statusFilter === 'all' && (
            <button
              onClick={() => {
                setEditingProject(null);
                resetProjectForm();
                setShowProjectModal(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0B7C73] text-white rounded-xl transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t('tools.photoEditingTracker.createProject', 'Create Project')}
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredProjects.map(renderProject)}
        </div>
      )}
    </div>
  );

  // Project Modal
  const renderProjectModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className={`w-full max-w-lg rounded-2xl shadow-xl ${
        isDark ? 'bg-gray-800' : 'bg-white'
      } max-h-[90vh] overflow-y-auto`}>
        <div className={`flex items-center justify-between p-4 border-b ${
          isDark ? 'border-gray-700' : 'border-gray-200'
        } sticky top-0 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {editingProject ? t('tools.photoEditingTracker.editProject', 'Edit Project') : t('tools.photoEditingTracker.newProject2', 'New Project')}
          </h3>
          <button
            onClick={() => {
              setShowProjectModal(false);
              setEditingProject(null);
              resetProjectForm();
            }}
            className={`p-2 rounded-lg transition-colors ${
              isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}
          >
            <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.photoEditingTracker.clientName', 'Client Name *')}
            </label>
            <input
              type="text"
              value={projectForm.client}
              onChange={e => setProjectForm({ ...projectForm, client: e.target.value })}
              placeholder={t('tools.photoEditingTracker.enterClientName', 'Enter client name')}
              className={`w-full px-4 py-2.5 rounded-xl border ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400'
                  : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'
              } focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.photoEditingTracker.shootDate', 'Shoot Date')}
              </label>
              <input
                type="date"
                value={projectForm.shootDate}
                onChange={e => setProjectForm({ ...projectForm, shootDate: e.target.value })}
                className={`w-full px-4 py-2.5 rounded-xl border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-200 text-gray-900'
                } focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.photoEditingTracker.totalPhotos2', 'Total Photos')}
              </label>
              <input
                type="number"
                min="0"
                value={projectForm.totalPhotos}
                onChange={e => setProjectForm({ ...projectForm, totalPhotos: parseInt(e.target.value) || 0 })}
                className={`w-full px-4 py-2.5 rounded-xl border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-200 text-gray-900'
                } focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.photoEditingTracker.deadline2', 'Deadline')}
              </label>
              <input
                type="date"
                value={projectForm.deadline}
                onChange={e => setProjectForm({ ...projectForm, deadline: e.target.value })}
                className={`w-full px-4 py-2.5 rounded-xl border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-200 text-gray-900'
                } focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.photoEditingTracker.priority2', 'Priority')}
              </label>
              <select
                value={projectForm.priority}
                onChange={e => setProjectForm({ ...projectForm, priority: e.target.value as ProjectPriority })}
                className={`w-full px-4 py-2.5 rounded-xl border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-200 text-gray-900'
                } focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`}
              >
                <option value="low">{t('tools.photoEditingTracker.low', 'Low')}</option>
                <option value="medium">{t('tools.photoEditingTracker.medium', 'Medium')}</option>
                <option value="high">{t('tools.photoEditingTracker.high', 'High')}</option>
                <option value="urgent">{t('tools.photoEditingTracker.urgent', 'Urgent')}</option>
              </select>
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.photoEditingTracker.proofingLink', 'Proofing Link')}
            </label>
            <input
              type="url"
              value={projectForm.proofingLink}
              onChange={e => setProjectForm({ ...projectForm, proofingLink: e.target.value })}
              placeholder={t('tools.photoEditingTracker.https', 'https://...')}
              className={`w-full px-4 py-2.5 rounded-xl border ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400'
                  : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'
              } focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.photoEditingTracker.notes', 'Notes')}
            </label>
            <textarea
              value={projectForm.notes}
              onChange={e => setProjectForm({ ...projectForm, notes: e.target.value })}
              placeholder={t('tools.photoEditingTracker.projectNotes', 'Project notes...')}
              rows={3}
              className={`w-full px-4 py-2.5 rounded-xl border resize-none ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400'
                  : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'
              } focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`}
            />
          </div>
        </div>

        <div className={`flex justify-end gap-3 p-4 border-t ${
          isDark ? 'border-gray-700' : 'border-gray-200'
        } sticky bottom-0 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <button
            onClick={() => {
              setShowProjectModal(false);
              setEditingProject(null);
              resetProjectForm();
            }}
            className={`px-4 py-2 rounded-xl transition-colors ${
              isDark
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            {t('tools.photoEditingTracker.cancel', 'Cancel')}
          </button>
          <button
            onClick={handleSaveProject}
            disabled={!projectForm.client.trim()}
            className="px-4 py-2 bg-[#0D9488] hover:bg-[#0B7C73] text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {editingProject ? t('tools.photoEditingTracker.saveChanges', 'Save Changes') : t('tools.photoEditingTracker.createProject2', 'Create Project')}
          </button>
        </div>
      </div>
    </div>
  );

  // Revision Modal
  const renderRevisionModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className={`w-full max-w-md rounded-2xl shadow-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <div className={`flex items-center justify-between p-4 border-b ${
          isDark ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.photoEditingTracker.addRevisionRequest', 'Add Revision Request')}
          </h3>
          <button
            onClick={() => {
              setShowRevisionModal(false);
              setRevisionForm({ description: '', photoIds: '' });
            }}
            className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
          >
            <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.photoEditingTracker.description', 'Description *')}
            </label>
            <textarea
              value={revisionForm.description}
              onChange={e => setRevisionForm({ ...revisionForm, description: e.target.value })}
              placeholder={t('tools.photoEditingTracker.describeTheRevisionRequest', 'Describe the revision request...')}
              rows={3}
              className={`w-full px-4 py-2.5 rounded-xl border resize-none ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400'
                  : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'
              } focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.photoEditingTracker.photoIdsOptional', 'Photo IDs (optional)')}
            </label>
            <input
              type="text"
              value={revisionForm.photoIds}
              onChange={e => setRevisionForm({ ...revisionForm, photoIds: e.target.value })}
              placeholder={t('tools.photoEditingTracker.eGImg001Img', 'e.g., IMG_001, IMG_005')}
              className={`w-full px-4 py-2.5 rounded-xl border ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400'
                  : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'
              } focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`}
            />
          </div>
        </div>

        <div className={`flex justify-end gap-3 p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <button
            onClick={() => {
              setShowRevisionModal(false);
              setRevisionForm({ description: '', photoIds: '' });
            }}
            className={`px-4 py-2 rounded-xl transition-colors ${
              isDark
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            {t('tools.photoEditingTracker.cancel2', 'Cancel')}
          </button>
          <button
            onClick={() => selectedProjectId && addRevisionRequest(selectedProjectId)}
            disabled={!revisionForm.description.trim()}
            className="px-4 py-2 bg-[#0D9488] hover:bg-[#0B7C73] text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('tools.photoEditingTracker.addRevision', 'Add Revision')}
          </button>
        </div>
      </div>
    </div>
  );

  // Feedback Modal
  const renderFeedbackModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className={`w-full max-w-md rounded-2xl shadow-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <div className={`flex items-center justify-between p-4 border-b ${
          isDark ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.photoEditingTracker.addClientFeedback', 'Add Client Feedback')}
          </h3>
          <button
            onClick={() => {
              setShowFeedbackModal(false);
              setFeedbackForm({ note: '', rating: 5 });
            }}
            className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
          >
            <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.photoEditingTracker.feedbackNote', 'Feedback Note *')}
            </label>
            <textarea
              value={feedbackForm.note}
              onChange={e => setFeedbackForm({ ...feedbackForm, note: e.target.value })}
              placeholder={t('tools.photoEditingTracker.clientFeedback2', 'Client feedback...')}
              rows={3}
              className={`w-full px-4 py-2.5 rounded-xl border resize-none ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400'
                  : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'
              } focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.photoEditingTracker.rating', 'Rating')}
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(rating => (
                <button
                  key={rating}
                  onClick={() => setFeedbackForm({ ...feedbackForm, rating })}
                  className="p-1"
                >
                  <Star
                    className={`w-6 h-6 ${
                      rating <= feedbackForm.rating
                        ? 'text-yellow-400 fill-yellow-400'
                        : isDark
                        ? 'text-gray-600'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className={`flex justify-end gap-3 p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <button
            onClick={() => {
              setShowFeedbackModal(false);
              setFeedbackForm({ note: '', rating: 5 });
            }}
            className={`px-4 py-2 rounded-xl transition-colors ${
              isDark
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            {t('tools.photoEditingTracker.cancel3', 'Cancel')}
          </button>
          <button
            onClick={() => selectedProjectId && addClientFeedback(selectedProjectId)}
            disabled={!feedbackForm.note.trim()}
            className="px-4 py-2 bg-[#0D9488] hover:bg-[#0B7C73] text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('tools.photoEditingTracker.addFeedback', 'Add Feedback')}
          </button>
        </div>
      </div>
    </div>
  );

  // Time Modal
  const renderTimeModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className={`w-full max-w-sm rounded-2xl shadow-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <div className={`flex items-center justify-between p-4 border-b ${
          isDark ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.photoEditingTracker.addTimeManually', 'Add Time Manually')}
          </h3>
          <button
            onClick={() => {
              setShowTimeModal(false);
              setTimeForm({ hours: 0, minutes: 0 });
            }}
            className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
          >
            <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          </button>
        </div>

        <div className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.photoEditingTracker.hours', 'Hours')}
              </label>
              <input
                type="number"
                min="0"
                value={timeForm.hours}
                onChange={e => setTimeForm({ ...timeForm, hours: parseInt(e.target.value) || 0 })}
                className={`w-full px-4 py-2.5 rounded-xl border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-200 text-gray-900'
                } focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`}
              />
            </div>
            <div className="flex-1">
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.photoEditingTracker.minutes', 'Minutes')}
              </label>
              <input
                type="number"
                min="0"
                max="59"
                value={timeForm.minutes}
                onChange={e => setTimeForm({ ...timeForm, minutes: parseInt(e.target.value) || 0 })}
                className={`w-full px-4 py-2.5 rounded-xl border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-200 text-gray-900'
                } focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`}
              />
            </div>
          </div>
        </div>

        <div className={`flex justify-end gap-3 p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <button
            onClick={() => {
              setShowTimeModal(false);
              setTimeForm({ hours: 0, minutes: 0 });
            }}
            className={`px-4 py-2 rounded-xl transition-colors ${
              isDark
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            {t('tools.photoEditingTracker.cancel4', 'Cancel')}
          </button>
          <button
            onClick={() => selectedProjectId && addManualTime(selectedProjectId)}
            disabled={timeForm.hours === 0 && timeForm.minutes === 0}
            className="px-4 py-2 bg-[#0D9488] hover:bg-[#0B7C73] text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('tools.photoEditingTracker.addTime2', 'Add Time')}
          </button>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden flex items-center justify-center py-12`}>
        <Loader2 className="w-8 h-8 animate-spin text-[#0D9488]" />
      </div>
    );
  }

  return (
    <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`bg-gradient-to-r ${isDark ? t('tools.photoEditingTracker.fromGray800To0d9488', 'from-gray-800 to-[#0D9488]/20') : t('tools.photoEditingTracker.fromWhiteTo0d94885', 'from-white to-[#0D9488]/5')} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#0D9488]/10 rounded-lg">
              <Camera className="w-5 h-5 text-[#0D9488]" />
            </div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.photoEditingTracker.photoEditingTracker', 'Photo Editing Tracker')}
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('tools.photoEditingTracker.manageYourPhotoEditingWorkflow', 'Manage your photo editing workflow')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className={`flex rounded-lg p-1 ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'list'
                    ? 'bg-[#0D9488] text-white'
                    : isDark
                    ? 'text-gray-400 hover:text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <FolderOpen className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('dashboard')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'dashboard'
                    ? 'bg-[#0D9488] text-white'
                    : isDark
                    ? 'text-gray-400 hover:text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
              </button>
            </div>
            <ExportDropdown
              onExportCSV={handleExportCSV}
              onExportExcel={handleExportExcel}
              onExportJSON={handleExportJSON}
              onExportPDF={handleExportPDF}
              onCopyToClipboard={handleCopyClipboard}
              onPrint={handlePrint}
              showImport={false}
              theme={isDark ? 'dark' : 'light'}
            />
            <button
              onClick={() => {
                setEditingProject(null);
                resetProjectForm();
                setShowProjectModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0B7C73] text-white rounded-xl transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">{t('tools.photoEditingTracker.newProject', 'New Project')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {viewMode === 'dashboard' ? renderDashboard() : renderListView()}
      </div>

      {/* Modals */}
      {showProjectModal && renderProjectModal()}
      {showRevisionModal && renderRevisionModal()}
      {showFeedbackModal && renderFeedbackModal()}
      {showTimeModal && renderTimeModal()}
      <ConfirmDialog />
    </div>
  );
};

export default PhotoEditingTrackerTool;
