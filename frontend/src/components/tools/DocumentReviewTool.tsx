'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  FileSearch,
  FileText,
  Users,
  Calendar,
  Clock,
  Plus,
  Trash2,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  Edit2,
  Save,
  X,
  Tag,
  Flag,
  Eye,
  Download,
  Upload,
  Folder,
  CheckSquare,
  Square,
  BarChart3,
  Shield,
  Package,
  User,
  Briefcase,
  Scale,
  FolderOpen,
  TrendingUp,
  Activity,
  Pause,
  Play,
  ClipboardList,
  Send,
} from 'lucide-react';
import { UIConfig } from '../ContextualUI';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import { type ColumnConfig } from '../../lib/toolDataUtils';
import { useTheme } from '../../contexts/ThemeContext';

interface DocumentReviewToolProps {
  uiConfig?: UIConfig;
}

interface ValidationMessage {
  message: string;
  type: 'error' | 'success' | 'info';
}

// Types following the user's specification
interface Reviewer {
  id: string;
  name: string;
  email: string;
  role: 'first-level' | 'second-level' | 'qc' | 'privilege';
  assignedDocuments: number;
  reviewedDocuments: number;
  avgDocsPerHour: number;
}

interface ReviewBatch {
  id: string;
  batchNumber: number;
  documentCount: number;
  assignedTo: string;
  status: 'pending' | 'in-progress' | 'completed' | 'qc-pending';
  startDate?: string;
  completedDate?: string;
}

interface PrivilegeEntry {
  id: string;
  docId: string;
  privilegeType: 'attorney-client' | 'work-product' | 'joint-defense' | 'other';
  author: string;
  recipients: string[];
  date: string;
  subject: string;
  basisDescription: string;
}

interface Production {
  id: string;
  productionNumber: string;
  date: string;
  documentCount: number;
  pageCount: number;
  format: 'native' | 'tiff' | 'pdf';
  recipient: string;
  notes: string;
}

interface DocumentReviewProject {
  id: string;
  matterId: string;
  matterName: string;
  projectName: string;
  clientName: string;
  createdDate: string;
  dueDate: string;
  totalDocuments: number;
  reviewedDocuments: number;
  reviewers: Reviewer[];
  batches: ReviewBatch[];
  tags: string[];
  status: 'setup' | 'in-progress' | 'qc' | 'completed' | 'on-hold';
  privilegeLog: PrivilegeEntry[];
  productions: Production[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// Constants
const TOOL_ID = 'document-review';

const STATUS_OPTIONS: { value: DocumentReviewProject['status']; label: string; color: string }[] = [
  { value: 'setup', label: 'Setup', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
  { value: 'in-progress', label: 'In Progress', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { value: 'qc', label: 'Quality Control', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  { value: 'completed', label: 'Completed', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  { value: 'on-hold', label: 'On Hold', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
];

const BATCH_STATUS_OPTIONS: { value: ReviewBatch['status']; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'qc-pending', label: 'QC Pending' },
];

const REVIEWER_ROLES: { value: Reviewer['role']; label: string }[] = [
  { value: 'first-level', label: 'First Level' },
  { value: 'second-level', label: 'Second Level' },
  { value: 'qc', label: 'Quality Control' },
  { value: 'privilege', label: 'Privilege' },
];

const PRIVILEGE_TYPES: { value: PrivilegeEntry['privilegeType']; label: string }[] = [
  { value: 'attorney-client', label: 'Attorney-Client' },
  { value: 'work-product', label: 'Work Product' },
  { value: 'joint-defense', label: 'Joint Defense' },
  { value: 'other', label: 'Other' },
];

const PRODUCTION_FORMATS: { value: Production['format']; label: string }[] = [
  { value: 'native', label: 'Native' },
  { value: 'tiff', label: 'TIFF' },
  { value: 'pdf', label: 'PDF' },
];

// Column configuration for exports
const projectColumns: ColumnConfig[] = [
  { key: 'matterId', header: 'Matter ID', type: 'string' },
  { key: 'matterName', header: 'Matter Name', type: 'string' },
  { key: 'projectName', header: 'Project Name', type: 'string' },
  { key: 'clientName', header: 'Client', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'totalDocuments', header: 'Total Docs', type: 'number' },
  { key: 'reviewedDocuments', header: 'Reviewed', type: 'number' },
  { key: 'dueDate', header: 'Due Date', type: 'date' },
  { key: 'createdAt', header: 'Created', type: 'date' },
];

// Helper functions
const generateId = () => crypto.randomUUID();

const formatDate = (dateString?: string) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const createNewProject = (): DocumentReviewProject => ({
  id: generateId(),
  matterId: '',
  matterName: '',
  projectName: '',
  clientName: '',
  createdDate: new Date().toISOString().split('T')[0],
  dueDate: '',
  totalDocuments: 0,
  reviewedDocuments: 0,
  reviewers: [],
  batches: [],
  tags: [],
  status: 'setup',
  privilegeLog: [],
  productions: [],
  notes: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

// Main Component
export const DocumentReviewTool: React.FC<DocumentReviewToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [validationMessage, setValidationMessage] = useState<ValidationMessage | null>(null);

  const {
    data: projects,
    addItem: addProject,
    updateItem: updateProject,
    deleteItem: deleteProject,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    copyToClipboard,
    print,
    isLoading,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<DocumentReviewProject>(TOOL_ID, [], projectColumns);

  // UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<DocumentReviewProject['status'] | ''>('');
  const [showModal, setShowModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showReviewerModal, setShowReviewerModal] = useState(false);
  const [showPrivilegeModal, setShowPrivilegeModal] = useState(false);
  const [showProductionModal, setShowProductionModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<DocumentReviewProject | null>(null);
  const [editingProject, setEditingProject] = useState<DocumentReviewProject | null>(null);
  const [formData, setFormData] = useState<DocumentReviewProject>(createNewProject());
  const [activeTab, setActiveTab] = useState<'overview' | 'batches' | 'reviewers' | 'privilege' | 'productions'>('overview');
  const [newTag, setNewTag] = useState('');

  // Batch form state
  const [batchForm, setBatchForm] = useState<Omit<ReviewBatch, 'id'>>({
    batchNumber: 1,
    documentCount: 0,
    assignedTo: '',
    status: 'pending',
  });

  // Reviewer form state
  const [reviewerForm, setReviewerForm] = useState<Omit<Reviewer, 'id'>>({
    name: '',
    email: '',
    role: 'first-level',
    assignedDocuments: 0,
    reviewedDocuments: 0,
    avgDocsPerHour: 0,
  });

  // Privilege entry form state
  const [privilegeForm, setPrivilegeForm] = useState<Omit<PrivilegeEntry, 'id'>>({
    docId: '',
    privilegeType: 'attorney-client',
    author: '',
    recipients: [],
    date: new Date().toISOString().split('T')[0],
    subject: '',
    basisDescription: '',
  });
  const [newRecipient, setNewRecipient] = useState('');

  // Production form state
  const [productionForm, setProductionForm] = useState<Omit<Production, 'id'>>({
    productionNumber: '',
    date: new Date().toISOString().split('T')[0],
    documentCount: 0,
    pageCount: 0,
    format: 'pdf',
    recipient: '',
    notes: '',
  });

  // Statistics
  const stats = useMemo(() => {
    const active = projects.filter(p => p.status === 'in-progress');
    const completed = projects.filter(p => p.status === 'completed');
    const totalDocs = projects.reduce((sum, p) => sum + p.totalDocuments, 0);
    const reviewedDocs = projects.reduce((sum, p) => sum + p.reviewedDocuments, 0);
    const totalPrivileged = projects.reduce((sum, p) => sum + p.privilegeLog.length, 0);
    const totalProductions = projects.reduce((sum, p) => sum + p.productions.length, 0);

    return {
      total: projects.length,
      active: active.length,
      completed: completed.length,
      totalDocs,
      reviewedDocs,
      totalPrivileged,
      totalProductions,
      completionRate: totalDocs > 0 ? Math.round((reviewedDocs / totalDocs) * 100) : 0,
    };
  }, [projects]);

  // Filtered projects
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesSearch = searchQuery === '' ||
        project.matterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.matterId.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === '' || project.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [projects, searchQuery, filterStatus]);

  // Handlers
  const handleSave = () => {
    if (!formData.matterId || !formData.matterName || !formData.projectName) {
      setValidationMessage({
        message: 'Please fill in required fields (Matter ID, Matter Name, Project Name)',
        type: 'error'
      });
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    if (editingProject) {
      updateProject(formData.id, { ...formData, updatedAt: new Date().toISOString() });
    } else {
      addProject({ ...formData, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    setShowModal(false);
    setEditingProject(null);
    setFormData(createNewProject());
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Project',
      description: 'Are you sure you want to delete this project? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'destructive'
    });
    if (confirmed) {
      deleteProject(id);
      if (selectedProject?.id === id) setSelectedProject(null);
    }
  };

  const openEditModal = (project: DocumentReviewProject) => {
    setEditingProject(project);
    setFormData(project);
    setShowModal(true);
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, newTag.trim()] });
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
  };

  // Batch handlers
  const handleAddBatch = () => {
    if (!selectedProject) return;
    const batch: ReviewBatch = { ...batchForm, id: generateId() };
    const updated = {
      ...selectedProject,
      batches: [...selectedProject.batches, batch],
      updatedAt: new Date().toISOString(),
    };
    updateProject(selectedProject.id, updated);
    setSelectedProject(updated);
    setShowBatchModal(false);
    setBatchForm({ batchNumber: selectedProject.batches.length + 2, documentCount: 0, assignedTo: '', status: 'pending' });
  };

  const handleDeleteBatch = (batchId: string) => {
    if (!selectedProject) return;
    const updated = {
      ...selectedProject,
      batches: selectedProject.batches.filter(b => b.id !== batchId),
      updatedAt: new Date().toISOString(),
    };
    updateProject(selectedProject.id, updated);
    setSelectedProject(updated);
  };

  const handleUpdateBatchStatus = (batchId: string, status: ReviewBatch['status']) => {
    if (!selectedProject) return;
    const updated = {
      ...selectedProject,
      batches: selectedProject.batches.map(b =>
        b.id === batchId
          ? { ...b, status, ...(status === 'completed' ? { completedDate: new Date().toISOString() } : {}) }
          : b
      ),
      updatedAt: new Date().toISOString(),
    };
    updateProject(selectedProject.id, updated);
    setSelectedProject(updated);
  };

  // Reviewer handlers
  const handleAddReviewer = () => {
    if (!selectedProject || !reviewerForm.name) return;
    const reviewer: Reviewer = { ...reviewerForm, id: generateId() };
    const updated = {
      ...selectedProject,
      reviewers: [...selectedProject.reviewers, reviewer],
      updatedAt: new Date().toISOString(),
    };
    updateProject(selectedProject.id, updated);
    setSelectedProject(updated);
    setShowReviewerModal(false);
    setReviewerForm({ name: '', email: '', role: 'first-level', assignedDocuments: 0, reviewedDocuments: 0, avgDocsPerHour: 0 });
  };

  const handleDeleteReviewer = (reviewerId: string) => {
    if (!selectedProject) return;
    const updated = {
      ...selectedProject,
      reviewers: selectedProject.reviewers.filter(r => r.id !== reviewerId),
      updatedAt: new Date().toISOString(),
    };
    updateProject(selectedProject.id, updated);
    setSelectedProject(updated);
  };

  // Privilege log handlers
  const handleAddPrivilegeEntry = () => {
    if (!selectedProject || !privilegeForm.docId || !privilegeForm.subject) return;
    const entry: PrivilegeEntry = { ...privilegeForm, id: generateId() };
    const updated = {
      ...selectedProject,
      privilegeLog: [...selectedProject.privilegeLog, entry],
      updatedAt: new Date().toISOString(),
    };
    updateProject(selectedProject.id, updated);
    setSelectedProject(updated);
    setShowPrivilegeModal(false);
    setPrivilegeForm({
      docId: '',
      privilegeType: 'attorney-client',
      author: '',
      recipients: [],
      date: new Date().toISOString().split('T')[0],
      subject: '',
      basisDescription: '',
    });
  };

  const handleDeletePrivilegeEntry = (entryId: string) => {
    if (!selectedProject) return;
    const updated = {
      ...selectedProject,
      privilegeLog: selectedProject.privilegeLog.filter(e => e.id !== entryId),
      updatedAt: new Date().toISOString(),
    };
    updateProject(selectedProject.id, updated);
    setSelectedProject(updated);
  };

  const addRecipient = () => {
    if (newRecipient.trim() && !privilegeForm.recipients.includes(newRecipient.trim())) {
      setPrivilegeForm({ ...privilegeForm, recipients: [...privilegeForm.recipients, newRecipient.trim()] });
      setNewRecipient('');
    }
  };

  const removeRecipient = (recipient: string) => {
    setPrivilegeForm({ ...privilegeForm, recipients: privilegeForm.recipients.filter(r => r !== recipient) });
  };

  // Production handlers
  const handleAddProduction = () => {
    if (!selectedProject || !productionForm.productionNumber) return;
    const production: Production = { ...productionForm, id: generateId() };
    const updated = {
      ...selectedProject,
      productions: [...selectedProject.productions, production],
      updatedAt: new Date().toISOString(),
    };
    updateProject(selectedProject.id, updated);
    setSelectedProject(updated);
    setShowProductionModal(false);
    setProductionForm({
      productionNumber: '',
      date: new Date().toISOString().split('T')[0],
      documentCount: 0,
      pageCount: 0,
      format: 'pdf',
      recipient: '',
      notes: '',
    });
  };

  const handleDeleteProduction = (productionId: string) => {
    if (!selectedProject) return;
    const updated = {
      ...selectedProject,
      productions: selectedProject.productions.filter(p => p.id !== productionId),
      updatedAt: new Date().toISOString(),
    };
    updateProject(selectedProject.id, updated);
    setSelectedProject(updated);
  };

  // Get status badge
  const getStatusColor = (status: DocumentReviewProject['status']) => {
    const option = STATUS_OPTIONS.find(s => s.value === status);
    return option?.color || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  const getBatchStatusColor = (status: ReviewBatch['status']) => {
    switch (status) {
      case 'pending': return 'bg-gray-500/20 text-gray-400';
      case 'in-progress': return 'bg-blue-500/20 text-blue-400';
      case 'completed': return 'bg-green-500/20 text-green-400';
      case 'qc-pending': return 'bg-yellow-500/20 text-yellow-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getRoleColor = (role: Reviewer['role']) => {
    switch (role) {
      case 'first-level': return 'bg-blue-500/20 text-blue-400';
      case 'second-level': return 'bg-purple-500/20 text-purple-400';
      case 'qc': return 'bg-yellow-500/20 text-yellow-400';
      case 'privilege': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  // Styles
  const inputClass = `w-full px-3 py-2 rounded-lg border transition-colors ${
    theme === 'dark'
      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-cyan-500'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-cyan-500'
  } focus:outline-none focus:ring-2 focus:ring-cyan-500/20`;

  const labelClass = `block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`;

  const cardClass = `rounded-xl border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`;

  const buttonPrimary = `flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-lg transition-all font-medium shadow-lg shadow-amber-500/20`;

  const buttonSecondary = `flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium ${
    theme === 'dark'
      ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
  }`;

  const tabClass = (isActive: boolean) => `px-4 py-2 font-medium text-sm rounded-lg transition-colors ${
    isActive
      ? 'bg-amber-500/20 text-amber-400'
      : theme === 'dark' ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'
  }`;

  return (
    <div className={`max-w-7xl mx-auto p-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-xl">
            <FileSearch className="w-8 h-8 text-amber-500" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.documentReview.documentReview', 'Document Review')}
            </h1>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('tools.documentReview.manageLegalDocumentReviewAnd', 'Manage legal document review and privilege logs')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <WidgetEmbedButton toolSlug="document-review" toolName="Document Review" />

          <SyncStatus
            isSynced={isSynced}
            isSaving={isSaving}
            lastSaved={lastSaved}
            syncError={syncError}
            onForceSync={forceSync}
            theme={theme as 'light' | 'dark'}
            showLabel={true}
            size="md"
          />
          <ExportDropdown
            onExportCSV={() => exportCSV({ filename: 'document-review' })}
            onExportExcel={() => exportExcel({ filename: 'document-review' })}
            onExportJSON={() => exportJSON({ filename: 'document-review' })}
            onExportPDF={() => exportPDF({ filename: 'document-review', title: 'Document Review Projects' })}
            onPrint={() => print('Document Review Projects')}
            onCopyToClipboard={() => copyToClipboard('tab')}
            disabled={projects.length === 0}
            theme={theme as 'light' | 'dark'}
          />
          <button onClick={() => { setFormData(createNewProject()); setShowModal(true); }} className={buttonPrimary}>
            <Plus className="w-4 h-4" />
            {t('tools.documentReview.newProject', 'New Project')}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <Briefcase className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.documentReview.projects', 'Projects')}</p>
              <p className="text-xl font-bold text-amber-500">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Activity className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.documentReview.active', 'Active')}</p>
              <p className="text-xl font-bold text-blue-500">{stats.active}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.documentReview.complete', 'Complete')}</p>
              <p className="text-xl font-bold text-green-500">{stats.completed}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-3">
            <div className="p-2 bg-cyan-500/10 rounded-lg">
              <FileText className="w-5 h-5 text-cyan-500" />
            </div>
            <div>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.documentReview.totalDocs', 'Total Docs')}</p>
              <p className="text-xl font-bold text-cyan-500">{stats.totalDocs.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Eye className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.documentReview.reviewed', 'Reviewed')}</p>
              <p className="text-xl font-bold text-purple-500">{stats.reviewedDocs.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-3">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <Shield className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.documentReview.privileged', 'Privileged')}</p>
              <p className="text-xl font-bold text-red-500">{stats.totalPrivileged}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-3">
            <div className="p-2 bg-teal-500/10 rounded-lg">
              <Send className="w-5 h-5 text-teal-500" />
            </div>
            <div>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.documentReview.productions', 'Productions')}</p>
              <p className="text-xl font-bold text-teal-500">{stats.totalProductions}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-3">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.documentReview.progress', 'Progress')}</p>
              <p className="text-xl font-bold text-orange-500">{stats.completionRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={`${cardClass} p-4 mb-6`}>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('tools.documentReview.searchByMatterProjectOr', 'Search by matter, project, or client...')}
              className={`${inputClass} pl-10`}
            />
          </div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as any)} className={`${inputClass} w-full sm:w-48`}>
            <option value="">{t('tools.documentReview.allStatuses', 'All Statuses')}</option>
            {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project List */}
        <div className={`${cardClass} lg:col-span-1`}>
          <div className={`p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <h2 className="text-lg font-semibold">{t('tools.documentReview.reviewProjects', 'Review Projects')}</h2>
          </div>
          <div className="max-h-[600px] overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full mx-auto"></div>
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className={`p-8 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>{t('tools.documentReview.noProjectsFound', 'No projects found')}</p>
              </div>
            ) : (
              <div className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {filteredProjects.map(project => (
                  <div
                    key={project.id}
                    onClick={() => { setSelectedProject(project); setActiveTab('overview'); }}
                    className={`p-4 cursor-pointer transition-colors ${
                      selectedProject?.id === project.id
                        ? 'bg-amber-500/10 border-l-4 border-amber-500'
                        : theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{project.projectName}</p>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {project.clientName}
                        </p>
                        <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                          {project.matterId}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`inline-block px-2 py-0.5 text-xs rounded border ${getStatusColor(project.status)}`}>
                            {STATUS_OPTIONS.find(s => s.value === project.status)?.label}
                          </span>
                          <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                            {project.reviewedDocuments.toLocaleString()}/{project.totalDocuments.toLocaleString()} docs
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1 ml-2">
                        <button onClick={(e) => { e.stopPropagation(); openEditModal(project); }} className="p-1.5 hover:bg-gray-600 rounded">
                          <Edit2 className="w-4 h-4 text-gray-400" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(project.id); }} className="p-1.5 hover:bg-red-500/20 rounded">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Details Panel */}
        <div className={`${cardClass} lg:col-span-2`}>
          {selectedProject ? (
            <div>
              {/* Project Header */}
              <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold">{selectedProject.projectName}</h2>
                      <span className={`px-2 py-0.5 text-xs rounded border ${getStatusColor(selectedProject.status)}`}>
                        {STATUS_OPTIONS.find(s => s.value === selectedProject.status)?.label}
                      </span>
                    </div>
                    <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {selectedProject.matterName} | {selectedProject.clientName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Due: {formatDate(selectedProject.dueDate)}</p>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>{t('tools.documentReview.reviewProgress', 'Review Progress')}</span>
                    <span className="font-medium">
                      {selectedProject.totalDocuments > 0
                        ? Math.round((selectedProject.reviewedDocuments / selectedProject.totalDocuments) * 100)
                        : 0}%
                    </span>
                  </div>
                  <div className={`h-2 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all"
                      style={{
                        width: `${selectedProject.totalDocuments > 0
                          ? (selectedProject.reviewedDocuments / selectedProject.totalDocuments) * 100
                          : 0}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className={`p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex gap-2 overflow-x-auto`}>
                <button onClick={() => setActiveTab('overview')} className={tabClass(activeTab === 'overview')}>
                  <BarChart3 className="w-4 h-4 inline mr-1" /> Overview
                </button>
                <button onClick={() => setActiveTab('batches')} className={tabClass(activeTab === 'batches')}>
                  <Package className="w-4 h-4 inline mr-1" /> Batches ({selectedProject.batches.length})
                </button>
                <button onClick={() => setActiveTab('reviewers')} className={tabClass(activeTab === 'reviewers')}>
                  <Users className="w-4 h-4 inline mr-1" /> Reviewers ({selectedProject.reviewers.length})
                </button>
                <button onClick={() => setActiveTab('privilege')} className={tabClass(activeTab === 'privilege')}>
                  <Shield className="w-4 h-4 inline mr-1" /> Privilege Log ({selectedProject.privilegeLog.length})
                </button>
                <button onClick={() => setActiveTab('productions')} className={tabClass(activeTab === 'productions')}>
                  <Send className="w-4 h-4 inline mr-1" /> Productions ({selectedProject.productions.length})
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <p className="text-xs text-gray-400">{t('tools.documentReview.matterId', 'Matter ID')}</p>
                        <p className="font-medium">{selectedProject.matterId}</p>
                      </div>
                      <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <p className="text-xs text-gray-400">{t('tools.documentReview.totalDocuments', 'Total Documents')}</p>
                        <p className="font-medium">{selectedProject.totalDocuments.toLocaleString()}</p>
                      </div>
                      <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <p className="text-xs text-gray-400">{t('tools.documentReview.reviewed2', 'Reviewed')}</p>
                        <p className="font-medium">{selectedProject.reviewedDocuments.toLocaleString()}</p>
                      </div>
                      <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <p className="text-xs text-gray-400">{t('tools.documentReview.created', 'Created')}</p>
                        <p className="font-medium">{formatDate(selectedProject.createdDate)}</p>
                      </div>
                    </div>

                    {selectedProject.tags.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2">{t('tools.documentReview.tags', 'Tags')}</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedProject.tags.map((tag, i) => (
                            <span key={i} className={`px-3 py-1 text-sm rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedProject.notes && (
                      <div>
                        <h3 className="font-semibold mb-2">{t('tools.documentReview.notes', 'Notes')}</h3>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{selectedProject.notes}</p>
                      </div>
                    )}

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-blue-500/10 border-blue-500/30' : 'bg-blue-50 border-blue-200'}`}>
                        <div className="flex items-center gap-3">
                          <Package className="w-8 h-8 text-blue-500" />
                          <div>
                            <p className="text-2xl font-bold text-blue-500">{selectedProject.batches.length}</p>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.documentReview.activeBatches', 'Active Batches')}</p>
                          </div>
                        </div>
                      </div>
                      <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-purple-500/10 border-purple-500/30' : 'bg-purple-50 border-purple-200'}`}>
                        <div className="flex items-center gap-3">
                          <Users className="w-8 h-8 text-purple-500" />
                          <div>
                            <p className="text-2xl font-bold text-purple-500">{selectedProject.reviewers.length}</p>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.documentReview.teamMembers', 'Team Members')}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Batches Tab */}
                {activeTab === 'batches' && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold">{t('tools.documentReview.reviewBatches', 'Review Batches')}</h3>
                      <button onClick={() => { setBatchForm({ batchNumber: selectedProject.batches.length + 1, documentCount: 0, assignedTo: '', status: 'pending' }); setShowBatchModal(true); }} className={buttonPrimary}>
                        <Plus className="w-4 h-4" /> Add Batch
                      </button>
                    </div>
                    {selectedProject.batches.length === 0 ? (
                      <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.documentReview.noBatchesCreatedYet', 'No batches created yet')}</p>
                    ) : (
                      <div className="space-y-3">
                        {selectedProject.batches.map(batch => (
                          <div key={batch.id} className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="text-center">
                                  <p className="text-2xl font-bold text-amber-500">#{batch.batchNumber}</p>
                                </div>
                                <div>
                                  <p className="font-medium">{batch.documentCount.toLocaleString()} documents</p>
                                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Assigned to: {batch.assignedTo || 'Unassigned'}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <select
                                  value={batch.status}
                                  onChange={(e) => handleUpdateBatchStatus(batch.id, e.target.value as ReviewBatch['status'])}
                                  className={`${inputClass} w-36`}
                                >
                                  {BATCH_STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                                </select>
                                <button onClick={() => handleDeleteBatch(batch.id)} className="p-1.5 hover:bg-red-500/20 rounded">
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </button>
                              </div>
                            </div>
                            {batch.completedDate && (
                              <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                                Completed: {formatDate(batch.completedDate)}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Reviewers Tab */}
                {activeTab === 'reviewers' && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold">{t('tools.documentReview.reviewTeam', 'Review Team')}</h3>
                      <button onClick={() => setShowReviewerModal(true)} className={buttonPrimary}>
                        <Plus className="w-4 h-4" /> Add Reviewer
                      </button>
                    </div>
                    {selectedProject.reviewers.length === 0 ? (
                      <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.documentReview.noReviewersAssignedYet', 'No reviewers assigned yet')}</p>
                    ) : (
                      <div className="space-y-3">
                        {selectedProject.reviewers.map(reviewer => (
                          <div key={reviewer.id} className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'}`}>
                                  <User className="w-5 h-5 text-gray-400" />
                                </div>
                                <div>
                                  <p className="font-medium">{reviewer.name}</p>
                                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{reviewer.email}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className={`px-2 py-1 text-xs rounded ${getRoleColor(reviewer.role)}`}>
                                  {REVIEWER_ROLES.find(r => r.value === reviewer.role)?.label}
                                </span>
                                <div className="text-right">
                                  <p className="text-sm font-medium">{reviewer.reviewedDocuments}/{reviewer.assignedDocuments}</p>
                                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>{reviewer.avgDocsPerHour} docs/hr</p>
                                </div>
                                <button onClick={() => handleDeleteReviewer(reviewer.id)} className="p-1.5 hover:bg-red-500/20 rounded">
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Privilege Log Tab */}
                {activeTab === 'privilege' && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold">{t('tools.documentReview.privilegeLog', 'Privilege Log')}</h3>
                      <button onClick={() => setShowPrivilegeModal(true)} className={buttonPrimary}>
                        <Plus className="w-4 h-4" /> Add Entry
                      </button>
                    </div>
                    {selectedProject.privilegeLog.length === 0 ? (
                      <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.documentReview.noPrivilegeEntriesRecorded', 'No privilege entries recorded')}</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className={theme === 'dark' ? 'border-b border-gray-700' : 'border-b border-gray-200'}>
                              <th className="text-left py-2 px-2">{t('tools.documentReview.docId', 'Doc ID')}</th>
                              <th className="text-left py-2 px-2">{t('tools.documentReview.type', 'Type')}</th>
                              <th className="text-left py-2 px-2">{t('tools.documentReview.subject', 'Subject')}</th>
                              <th className="text-left py-2 px-2">{t('tools.documentReview.date', 'Date')}</th>
                              <th className="text-left py-2 px-2">{t('tools.documentReview.author', 'Author')}</th>
                              <th className="text-right py-2 px-2">{t('tools.documentReview.actions', 'Actions')}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedProject.privilegeLog.map(entry => (
                              <tr key={entry.id} className={theme === 'dark' ? 'border-b border-gray-700' : 'border-b border-gray-200'}>
                                <td className="py-2 px-2 font-mono text-xs">{entry.docId}</td>
                                <td className="py-2 px-2">
                                  <span className="px-2 py-0.5 text-xs rounded bg-red-500/20 text-red-400">
                                    {PRIVILEGE_TYPES.find(p => p.value === entry.privilegeType)?.label}
                                  </span>
                                </td>
                                <td className="py-2 px-2">{entry.subject}</td>
                                <td className="py-2 px-2">{formatDate(entry.date)}</td>
                                <td className="py-2 px-2">{entry.author}</td>
                                <td className="py-2 px-2 text-right">
                                  <button onClick={() => handleDeletePrivilegeEntry(entry.id)} className="p-1 hover:bg-red-500/20 rounded">
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* Productions Tab */}
                {activeTab === 'productions' && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold">{t('tools.documentReview.documentProductions', 'Document Productions')}</h3>
                      <button onClick={() => setShowProductionModal(true)} className={buttonPrimary}>
                        <Plus className="w-4 h-4" /> Add Production
                      </button>
                    </div>
                    {selectedProject.productions.length === 0 ? (
                      <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.documentReview.noProductionsRecorded', 'No productions recorded')}</p>
                    ) : (
                      <div className="space-y-3">
                        {selectedProject.productions.map(production => (
                          <div key={production.id} className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">{production.productionNumber}</p>
                                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {production.documentCount.toLocaleString()} docs | {production.pageCount.toLocaleString()} pages | {production.format.toUpperCase()}
                                </p>
                                <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                                  To: {production.recipient} | {formatDate(production.date)}
                                </p>
                              </div>
                              <button onClick={() => handleDeleteProduction(production.id)} className="p-1.5 hover:bg-red-500/20 rounded">
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </button>
                            </div>
                            {production.notes && (
                              <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{production.notes}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className={`flex flex-col items-center justify-center py-20 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              <FileSearch className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-lg font-medium">{t('tools.documentReview.selectAProject', 'Select a project')}</p>
              <p className="text-sm">{t('tools.documentReview.chooseAProjectToView', 'Choose a project to view details')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Project Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
            <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <h2 className="text-xl font-bold">{editingProject ? t('tools.documentReview.editProject', 'Edit Project') : t('tools.documentReview.newProject2', 'New Project')}</h2>
              <button onClick={() => { setShowModal(false); setEditingProject(null); }} className="p-2 hover:bg-gray-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.documentReview.matterId2', 'Matter ID *')}</label>
                  <input type="text" value={formData.matterId} onChange={(e) => setFormData({ ...formData, matterId: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.documentReview.matterName', 'Matter Name *')}</label>
                  <input type="text" value={formData.matterName} onChange={(e) => setFormData({ ...formData, matterName: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.documentReview.projectName', 'Project Name *')}</label>
                  <input type="text" value={formData.projectName} onChange={(e) => setFormData({ ...formData, projectName: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.documentReview.clientName', 'Client Name')}</label>
                  <input type="text" value={formData.clientName} onChange={(e) => setFormData({ ...formData, clientName: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.documentReview.createdDate', 'Created Date')}</label>
                  <input type="date" value={formData.createdDate} onChange={(e) => setFormData({ ...formData, createdDate: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.documentReview.dueDate', 'Due Date')}</label>
                  <input type="date" value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.documentReview.totalDocuments2', 'Total Documents')}</label>
                  <input type="number" min="0" value={formData.totalDocuments} onChange={(e) => setFormData({ ...formData, totalDocuments: parseInt(e.target.value) || 0 })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.documentReview.reviewedDocuments', 'Reviewed Documents')}</label>
                  <input type="number" min="0" value={formData.reviewedDocuments} onChange={(e) => setFormData({ ...formData, reviewedDocuments: parseInt(e.target.value) || 0 })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.documentReview.status', 'Status')}</label>
                  <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as any })} className={inputClass}>
                    {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className={labelClass}>{t('tools.documentReview.tags2', 'Tags')}</label>
                <div className="flex gap-2 mb-2">
                  <input type="text" value={newTag} onChange={(e) => setNewTag(e.target.value)} placeholder={t('tools.documentReview.addTag', 'Add tag')} className={inputClass} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())} />
                  <button type="button" onClick={addTag} className={buttonSecondary}><Plus className="w-4 h-4" /></button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, i) => (
                    <span key={i} className="px-3 py-1 text-sm rounded-full bg-amber-500/20 text-amber-400 flex items-center gap-1">
                      {tag} <button onClick={() => removeTag(tag)}><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className={labelClass}>{t('tools.documentReview.notes2', 'Notes')}</label>
                <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className={inputClass} rows={3} />
              </div>

              <div className={`flex justify-end gap-3 pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <button type="button" onClick={() => { setShowModal(false); setEditingProject(null); }} className={buttonSecondary}>{t('tools.documentReview.cancel', 'Cancel')}</button>
                <button type="button" onClick={handleSave} disabled={!formData.matterId || !formData.matterName || !formData.projectName} className={buttonPrimary}>
                  <Save className="w-4 h-4" /> Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Batch Modal */}
      {showBatchModal && selectedProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} w-full max-w-md`}>
            <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <h2 className="text-xl font-bold">{t('tools.documentReview.addBatch', 'Add Batch')}</h2>
              <button onClick={() => setShowBatchModal(false)} className="p-2 hover:bg-gray-700 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className={labelClass}>{t('tools.documentReview.batchNumber', 'Batch Number')}</label>
                <input type="number" min="1" value={batchForm.batchNumber} onChange={(e) => setBatchForm({ ...batchForm, batchNumber: parseInt(e.target.value) || 1 })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>{t('tools.documentReview.documentCount', 'Document Count')}</label>
                <input type="number" min="0" value={batchForm.documentCount} onChange={(e) => setBatchForm({ ...batchForm, documentCount: parseInt(e.target.value) || 0 })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>{t('tools.documentReview.assignedTo', 'Assigned To')}</label>
                <select value={batchForm.assignedTo} onChange={(e) => setBatchForm({ ...batchForm, assignedTo: e.target.value })} className={inputClass}>
                  <option value="">{t('tools.documentReview.selectReviewer', 'Select Reviewer')}</option>
                  {selectedProject.reviewers.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>{t('tools.documentReview.status2', 'Status')}</label>
                <select value={batchForm.status} onChange={(e) => setBatchForm({ ...batchForm, status: e.target.value as any })} className={inputClass}>
                  {BATCH_STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div className={`flex justify-end gap-3 pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <button type="button" onClick={() => setShowBatchModal(false)} className={buttonSecondary}>{t('tools.documentReview.cancel2', 'Cancel')}</button>
                <button type="button" onClick={handleAddBatch} className={buttonPrimary}><Save className="w-4 h-4" /> {t('tools.documentReview.addBatch2', 'Add Batch')}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Reviewer Modal */}
      {showReviewerModal && selectedProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} w-full max-w-md`}>
            <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <h2 className="text-xl font-bold">{t('tools.documentReview.addReviewer', 'Add Reviewer')}</h2>
              <button onClick={() => setShowReviewerModal(false)} className="p-2 hover:bg-gray-700 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className={labelClass}>{t('tools.documentReview.name', 'Name *')}</label>
                <input type="text" value={reviewerForm.name} onChange={(e) => setReviewerForm({ ...reviewerForm, name: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>{t('tools.documentReview.email', 'Email')}</label>
                <input type="email" value={reviewerForm.email} onChange={(e) => setReviewerForm({ ...reviewerForm, email: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>{t('tools.documentReview.role', 'Role')}</label>
                <select value={reviewerForm.role} onChange={(e) => setReviewerForm({ ...reviewerForm, role: e.target.value as any })} className={inputClass}>
                  {REVIEWER_ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.documentReview.assignedDocs', 'Assigned Docs')}</label>
                  <input type="number" min="0" value={reviewerForm.assignedDocuments} onChange={(e) => setReviewerForm({ ...reviewerForm, assignedDocuments: parseInt(e.target.value) || 0 })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.documentReview.avgDocsHour', 'Avg Docs/Hour')}</label>
                  <input type="number" min="0" step="0.1" value={reviewerForm.avgDocsPerHour} onChange={(e) => setReviewerForm({ ...reviewerForm, avgDocsPerHour: parseFloat(e.target.value) || 0 })} className={inputClass} />
                </div>
              </div>
              <div className={`flex justify-end gap-3 pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <button type="button" onClick={() => setShowReviewerModal(false)} className={buttonSecondary}>{t('tools.documentReview.cancel3', 'Cancel')}</button>
                <button type="button" onClick={handleAddReviewer} disabled={!reviewerForm.name} className={buttonPrimary}><Save className="w-4 h-4" /> {t('tools.documentReview.addReviewer2', 'Add Reviewer')}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Privilege Entry Modal */}
      {showPrivilegeModal && selectedProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} w-full max-w-lg`}>
            <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <h2 className="text-xl font-bold">{t('tools.documentReview.addPrivilegeEntry', 'Add Privilege Entry')}</h2>
              <button onClick={() => setShowPrivilegeModal(false)} className="p-2 hover:bg-gray-700 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.documentReview.documentId', 'Document ID *')}</label>
                  <input type="text" value={privilegeForm.docId} onChange={(e) => setPrivilegeForm({ ...privilegeForm, docId: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.documentReview.privilegeType', 'Privilege Type')}</label>
                  <select value={privilegeForm.privilegeType} onChange={(e) => setPrivilegeForm({ ...privilegeForm, privilegeType: e.target.value as any })} className={inputClass}>
                    {PRIVILEGE_TYPES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className={labelClass}>{t('tools.documentReview.subject2', 'Subject *')}</label>
                <input type="text" value={privilegeForm.subject} onChange={(e) => setPrivilegeForm({ ...privilegeForm, subject: e.target.value })} className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.documentReview.author2', 'Author')}</label>
                  <input type="text" value={privilegeForm.author} onChange={(e) => setPrivilegeForm({ ...privilegeForm, author: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.documentReview.date2', 'Date')}</label>
                  <input type="date" value={privilegeForm.date} onChange={(e) => setPrivilegeForm({ ...privilegeForm, date: e.target.value })} className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>{t('tools.documentReview.recipients', 'Recipients')}</label>
                <div className="flex gap-2 mb-2">
                  <input type="text" value={newRecipient} onChange={(e) => setNewRecipient(e.target.value)} placeholder={t('tools.documentReview.addRecipient', 'Add recipient')} className={inputClass} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRecipient())} />
                  <button type="button" onClick={addRecipient} className={buttonSecondary}><Plus className="w-4 h-4" /></button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {privilegeForm.recipients.map((r, i) => (
                    <span key={i} className="px-2 py-1 text-sm rounded bg-red-500/20 text-red-400 flex items-center gap-1">
                      {r} <button onClick={() => removeRecipient(r)}><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <label className={labelClass}>{t('tools.documentReview.basisDescription', 'Basis Description')}</label>
                <textarea value={privilegeForm.basisDescription} onChange={(e) => setPrivilegeForm({ ...privilegeForm, basisDescription: e.target.value })} className={inputClass} rows={3} />
              </div>
              <div className={`flex justify-end gap-3 pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <button type="button" onClick={() => setShowPrivilegeModal(false)} className={buttonSecondary}>{t('tools.documentReview.cancel4', 'Cancel')}</button>
                <button type="button" onClick={handleAddPrivilegeEntry} disabled={!privilegeForm.docId || !privilegeForm.subject} className={buttonPrimary}><Save className="w-4 h-4" /> {t('tools.documentReview.addEntry', 'Add Entry')}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Production Modal */}
      {showProductionModal && selectedProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} w-full max-w-md`}>
            <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <h2 className="text-xl font-bold">{t('tools.documentReview.addProduction', 'Add Production')}</h2>
              <button onClick={() => setShowProductionModal(false)} className="p-2 hover:bg-gray-700 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className={labelClass}>{t('tools.documentReview.productionNumber', 'Production Number *')}</label>
                <input type="text" value={productionForm.productionNumber} onChange={(e) => setProductionForm({ ...productionForm, productionNumber: e.target.value })} className={inputClass} placeholder={t('tools.documentReview.eGAbc00001', 'e.g., ABC00001')} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.documentReview.date3', 'Date')}</label>
                  <input type="date" value={productionForm.date} onChange={(e) => setProductionForm({ ...productionForm, date: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.documentReview.format', 'Format')}</label>
                  <select value={productionForm.format} onChange={(e) => setProductionForm({ ...productionForm, format: e.target.value as any })} className={inputClass}>
                    {PRODUCTION_FORMATS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.documentReview.documentCount2', 'Document Count')}</label>
                  <input type="number" min="0" value={productionForm.documentCount} onChange={(e) => setProductionForm({ ...productionForm, documentCount: parseInt(e.target.value) || 0 })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.documentReview.pageCount', 'Page Count')}</label>
                  <input type="number" min="0" value={productionForm.pageCount} onChange={(e) => setProductionForm({ ...productionForm, pageCount: parseInt(e.target.value) || 0 })} className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>{t('tools.documentReview.recipient', 'Recipient')}</label>
                <input type="text" value={productionForm.recipient} onChange={(e) => setProductionForm({ ...productionForm, recipient: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>{t('tools.documentReview.notes3', 'Notes')}</label>
                <textarea value={productionForm.notes} onChange={(e) => setProductionForm({ ...productionForm, notes: e.target.value })} className={inputClass} rows={2} />
              </div>
              <div className={`flex justify-end gap-3 pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <button type="button" onClick={() => setShowProductionModal(false)} className={buttonSecondary}>{t('tools.documentReview.cancel5', 'Cancel')}</button>
                <button type="button" onClick={handleAddProduction} disabled={!productionForm.productionNumber} className={buttonPrimary}><Save className="w-4 h-4" /> {t('tools.documentReview.addProduction2', 'Add Production')}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info */}
      <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <h3 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.documentReview.aboutDocumentReview', 'About Document Review')}</h3>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          Manage legal document review projects with batch assignments, reviewer tracking, privilege log management,
          and production tracking. Monitor progress across matters, track reviewer performance metrics, and maintain
          comprehensive privilege logs for eDiscovery compliance.
        </p>
      </div>

      {/* Validation Toast */}
      {validationMessage && (
        <div className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg ${
          validationMessage.type === 'error' ? 'bg-red-500/90 text-white' :
          validationMessage.type === 'success' ? 'bg-green-500/90 text-white' :
          'bg-blue-500/90 text-white'
        }`}>
          {validationMessage.message}
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog />
    </div>
  );
};

export default DocumentReviewTool;
