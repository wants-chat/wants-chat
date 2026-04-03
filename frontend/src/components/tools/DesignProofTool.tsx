'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FileCheck,
  Plus,
  Trash2,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  User,
  MessageSquare,
  Upload,
  Eye,
  Edit2,
  X,
  Sparkles,
  Send,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Image as ImageIcon,
  FileText,
  Calendar,
} from 'lucide-react';
import { UIConfig } from '../ContextualUI';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
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

interface DesignProofToolProps {
  uiConfig?: UIConfig;
}

// Types
type ProofStatus = 'pending_upload' | 'pending_review' | 'revision_requested' | 'approved' | 'rejected';
type RevisionPriority = 'low' | 'normal' | 'high' | 'urgent';

interface ProofComment {
  id: string;
  author: string;
  text: string;
  x?: number;
  y?: number;
  timestamp: string;
  resolved: boolean;
}

interface ProofRevision {
  id: string;
  version: number;
  uploadedAt: string;
  uploadedBy: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  comments: ProofComment[];
  status: ProofStatus;
}

interface DesignProof {
  id: string;
  proofNumber: string;
  jobNumber: string;
  customerName: string;
  customerEmail: string;
  projectName: string;
  description: string;
  currentVersion: number;
  revisions: ProofRevision[];
  status: ProofStatus;
  priority: RevisionPriority;
  dueDate: string;
  assignedDesigner: string;
  createdAt: string;
  updatedAt: string;
  approvedAt: string | null;
  approvedBy: string | null;
  internalNotes: string;
}

// Constants
const PROOF_STATUSES: { status: ProofStatus; label: string; color: string; icon: React.ReactNode }[] = [
  { status: 'pending_upload', label: 'Pending Upload', color: 'bg-gray-500', icon: <Upload className="w-4 h-4" /> },
  { status: 'pending_review', label: 'Pending Review', color: 'bg-blue-500', icon: <Clock className="w-4 h-4" /> },
  { status: 'revision_requested', label: 'Revision Requested', color: 'bg-orange-500', icon: <RotateCcw className="w-4 h-4" /> },
  { status: 'approved', label: 'Approved', color: 'bg-green-500', icon: <CheckCircle className="w-4 h-4" /> },
  { status: 'rejected', label: 'Rejected', color: 'bg-red-500', icon: <XCircle className="w-4 h-4" /> },
];

const PRIORITIES: { priority: RevisionPriority; label: string; color: string }[] = [
  { priority: 'low', label: 'Low', color: 'bg-gray-400' },
  { priority: 'normal', label: 'Normal', color: 'bg-blue-400' },
  { priority: 'high', label: 'High', color: 'bg-orange-400' },
  { priority: 'urgent', label: 'Urgent', color: 'bg-red-500' },
];

// Column configuration for exports
const PROOF_COLUMNS: ColumnConfig[] = [
  { key: 'proofNumber', header: 'Proof #', type: 'string' },
  { key: 'jobNumber', header: 'Job #', type: 'string' },
  { key: 'customerName', header: 'Customer', type: 'string' },
  { key: 'projectName', header: 'Project', type: 'string' },
  { key: 'currentVersion', header: 'Version', type: 'number' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'priority', header: 'Priority', type: 'string' },
  { key: 'dueDate', header: 'Due Date', type: 'date' },
  { key: 'assignedDesigner', header: 'Designer', type: 'string' },
  { key: 'createdAt', header: 'Created', type: 'date' },
  { key: 'approvedAt', header: 'Approved', type: 'date' },
];

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);
const generateProofNumber = () => `PRF-${Date.now().toString().slice(-6)}`;

const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatDateTime = (dateString: string) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Main Component
export const DesignProofTool: React.FC<DesignProofToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // useToolData hook for backend sync
  const {
    data: proofs,
    addItem: addProofToBackend,
    updateItem: updateProofBackend,
    deleteItem: deleteProofBackend,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<DesignProof>('design-proofs', [], PROOF_COLUMNS);

  // Local UI State
  const [activeTab, setActiveTab] = useState<'proofs' | 'pending' | 'approved'>('proofs');
  const [showProofForm, setShowProofForm] = useState(false);
  const [editingProof, setEditingProof] = useState<DesignProof | null>(null);
  const [selectedProof, setSelectedProof] = useState<DesignProof | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [newComment, setNewComment] = useState('');

  // New proof form state
  const [newProof, setNewProof] = useState<Partial<DesignProof>>({
    jobNumber: '',
    customerName: '',
    customerEmail: '',
    projectName: '',
    description: '',
    priority: 'normal',
    dueDate: '',
    assignedDesigner: '',
    internalNotes: '',
  });

  // Handle prefill from uiConfig
  React.useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params;
      if (params.customerName || params.projectName || params.jobNumber) {
        setNewProof({
          ...newProof,
          jobNumber: params.jobNumber || '',
          customerName: params.customerName || '',
          customerEmail: params.customerEmail || '',
          projectName: params.projectName || '',
          description: params.description || '',
        });
        setShowProofForm(true);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Add new proof
  const addProof = () => {
    if (!newProof.customerName || !newProof.projectName) {
      setValidationMessage('Please fill in required fields (Customer Name, Project Name)');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const proof: DesignProof = {
      id: generateId(),
      proofNumber: generateProofNumber(),
      jobNumber: newProof.jobNumber || '',
      customerName: newProof.customerName || '',
      customerEmail: newProof.customerEmail || '',
      projectName: newProof.projectName || '',
      description: newProof.description || '',
      currentVersion: 0,
      revisions: [],
      status: 'pending_upload',
      priority: newProof.priority || 'normal',
      dueDate: newProof.dueDate || '',
      assignedDesigner: newProof.assignedDesigner || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      approvedAt: null,
      approvedBy: null,
      internalNotes: newProof.internalNotes || '',
    };

    addProofToBackend(proof);
    resetForm();
  };

  // Upload new revision
  const uploadRevision = (proofId: string, fileName: string, fileType: string) => {
    const proof = proofs.find((p) => p.id === proofId);
    if (!proof) return;

    const newVersion = proof.currentVersion + 1;
    const revision: ProofRevision = {
      id: generateId(),
      version: newVersion,
      uploadedAt: new Date().toISOString(),
      uploadedBy: 'Current User', // Would come from auth context
      fileUrl: `#upload-${newVersion}`,
      fileName,
      fileType,
      comments: [],
      status: 'pending_review',
    };

    updateProofBackend(proofId, {
      revisions: [...proof.revisions, revision],
      currentVersion: newVersion,
      status: 'pending_review',
      updatedAt: new Date().toISOString(),
    });

    if (selectedProof?.id === proofId) {
      setSelectedProof({
        ...selectedProof,
        revisions: [...selectedProof.revisions, revision],
        currentVersion: newVersion,
        status: 'pending_review',
      });
    }
  };

  // Add comment to revision
  const addComment = (proofId: string, revisionId: string, text: string) => {
    const proof = proofs.find((p) => p.id === proofId);
    if (!proof) return;

    const updatedRevisions = proof.revisions.map((rev) => {
      if (rev.id === revisionId) {
        return {
          ...rev,
          comments: [
            ...rev.comments,
            {
              id: generateId(),
              author: 'Current User',
              text,
              timestamp: new Date().toISOString(),
              resolved: false,
            },
          ],
        };
      }
      return rev;
    });

    updateProofBackend(proofId, {
      revisions: updatedRevisions,
      updatedAt: new Date().toISOString(),
    });

    if (selectedProof?.id === proofId) {
      setSelectedProof({
        ...selectedProof,
        revisions: updatedRevisions,
      });
    }
  };

  // Update proof status
  const updateProofStatus = (proofId: string, status: ProofStatus, approvedBy?: string) => {
    const updates: Partial<DesignProof> = {
      status,
      updatedAt: new Date().toISOString(),
    };

    if (status === 'approved') {
      updates.approvedAt = new Date().toISOString();
      updates.approvedBy = approvedBy || 'Current User';
    }

    updateProofBackend(proofId, updates);

    if (selectedProof?.id === proofId) {
      setSelectedProof({
        ...selectedProof,
        ...updates,
      } as DesignProof);
    }
  };

  // Request revision
  const requestRevision = (proofId: string) => {
    updateProofStatus(proofId, 'revision_requested');
  };

  // Approve proof
  const approveProof = (proofId: string) => {
    updateProofStatus(proofId, 'approved', 'Current User');
  };

  // Delete proof
  const deleteProof = async (proofId: string) => {
    const confirmed = await confirm({
      title: 'Delete Proof',
      message: 'Are you sure you want to delete this proof? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteProofBackend(proofId);
      if (selectedProof?.id === proofId) {
        setSelectedProof(null);
      }
    }
  };

  // Reset form
  const resetForm = () => {
    setNewProof({
      jobNumber: '',
      customerName: '',
      customerEmail: '',
      projectName: '',
      description: '',
      priority: 'normal',
      dueDate: '',
      assignedDesigner: '',
      internalNotes: '',
    });
    setShowProofForm(false);
    setEditingProof(null);
  };

  // Filtered proofs
  const filteredProofs = useMemo(() => {
    let filtered = proofs;

    if (activeTab === 'pending') {
      filtered = proofs.filter((p) => ['pending_upload', 'pending_review', 'revision_requested'].includes(p.status));
    } else if (activeTab === 'approved') {
      filtered = proofs.filter((p) => p.status === 'approved');
    }

    return filtered.filter((proof) => {
      const matchesSearch =
        searchTerm === '' ||
        proof.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proof.proofNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proof.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proof.jobNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || proof.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [proofs, searchTerm, filterStatus, activeTab]);

  // Analytics
  const analytics = useMemo(() => {
    const totalProofs = proofs.length;
    const pendingReview = proofs.filter((p) => p.status === 'pending_review').length;
    const revisionRequested = proofs.filter((p) => p.status === 'revision_requested').length;
    const approved = proofs.filter((p) => p.status === 'approved').length;
    const avgRevisions = proofs.length > 0 ? Math.round(proofs.reduce((sum, p) => sum + p.currentVersion, 0) / proofs.length * 10) / 10 : 0;

    return { totalProofs, pendingReview, revisionRequested, approved, avgRevisions };
  }, [proofs]);

  const getStatusBadge = (status: ProofStatus) => {
    const statusInfo = PROOF_STATUSES.find((s) => s.status === status);
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white ${statusInfo?.color || 'bg-gray-500'}`}>
        {statusInfo?.icon}
        {statusInfo?.label || status}
      </span>
    );
  };

  const getPriorityBadge = (priority: RevisionPriority) => {
    const priorityInfo = PRIORITIES.find((p) => p.priority === priority);
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${priorityInfo?.color || 'bg-gray-400'}`}>
        {priorityInfo?.label || priority}
      </span>
    );
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.designProof.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <FileCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.designProof.designProofApproval', 'Design Proof Approval')}
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.designProof.manageDesignProofsTrackRevisions', 'Manage design proofs, track revisions, and collect approvals')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="design-proof" toolName="Design Proof" />

              <SyncStatus
                isSynced={isSynced}
                isSaving={isSaving}
                lastSaved={lastSaved}
                syncError={syncError}
                onForceSync={forceSync}
                theme={theme}
                showLabel={true}
                size="md"
              />
              <ExportDropdown
                onExportCSV={() => exportToCSV(proofs, PROOF_COLUMNS, { filename: 'design-proofs' })}
                onExportExcel={() => exportToExcel(proofs, PROOF_COLUMNS, { filename: 'design-proofs' })}
                onExportJSON={() => exportToJSON(proofs, { filename: 'design-proofs' })}
                onExportPDF={async () => {
                  await exportToPDF(proofs, PROOF_COLUMNS, {
                    filename: 'design-proofs',
                    title: 'Design Proofs Report',
                    subtitle: `${proofs.length} proofs | ${analytics.approved} approved`,
                  });
                }}
                onPrint={() => printData(proofs, PROOF_COLUMNS, { title: 'Design Proofs' })}
                onCopyToClipboard={async () => await copyUtil(proofs, PROOF_COLUMNS, 'tab')}
                showImport={false}
                theme={theme}
              />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.designProof.totalProofs', 'Total Proofs')}</p>
              <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{analytics.totalProofs}</p>
            </div>
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.designProof.pendingReview', 'Pending Review')}</p>
              <p className={`text-xl font-bold text-blue-500`}>{analytics.pendingReview}</p>
            </div>
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.designProof.revisions', 'Revisions')}</p>
              <p className={`text-xl font-bold text-orange-500`}>{analytics.revisionRequested}</p>
            </div>
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.designProof.approved', 'Approved')}</p>
              <p className={`text-xl font-bold text-green-500`}>{analytics.approved}</p>
            </div>
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.designProof.avgRevisions', 'Avg Revisions')}</p>
              <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{analytics.avgRevisions}</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'proofs', label: 'All Proofs', icon: <FileCheck className="w-4 h-4" /> },
              { id: 'pending', label: 'Pending', icon: <Clock className="w-4 h-4" /> },
              { id: 'approved', label: 'Approved', icon: <CheckCircle className="w-4 h-4" /> },
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

        {/* Proofs List */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
          {/* Search and Filters */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type="text"
                  placeholder={t('tools.designProof.searchProofs', 'Search proofs...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
                />
              </div>
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`px-4 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">{t('tools.designProof.allStatuses', 'All Statuses')}</option>
              {PROOF_STATUSES.map((s) => (
                <option key={s.status} value={s.status}>{s.label}</option>
              ))}
            </select>
            <button
              onClick={() => setShowProofForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t('tools.designProof.newProof', 'New Proof')}
            </button>
          </div>

          {/* Proofs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProofs.map((proof) => (
              <div
                key={proof.id}
                className={`p-4 rounded-lg border ${
                  theme === 'dark' ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'
                } hover:shadow-md transition-shadow cursor-pointer`}
                onClick={() => setSelectedProof(proof)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className={`font-mono text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {proof.proofNumber}
                    </p>
                    <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {proof.projectName}
                    </h3>
                  </div>
                  {getStatusBadge(proof.status)}
                </div>

                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} space-y-1`}>
                  <p className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {proof.customerName}
                  </p>
                  {proof.jobNumber && (
                    <p className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Job: {proof.jobNumber}
                    </p>
                  )}
                  <p className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    Version {proof.currentVersion}
                  </p>
                  {proof.dueDate && (
                    <p className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Due: {formatDate(proof.dueDate)}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
                  <div className="flex items-center gap-2">
                    {getPriorityBadge(proof.priority)}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteProof(proof.id);
                      }}
                      className={`p-1.5 rounded ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredProofs.length === 0 && (
            <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              <FileCheck className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{t('tools.designProof.noDesignProofsFound', 'No design proofs found')}</p>
              <button
                onClick={() => setShowProofForm(true)}
                className="mt-4 text-[#0D9488] hover:underline"
              >
                {t('tools.designProof.createYourFirstProof', 'Create your first proof')}
              </button>
            </div>
          )}
        </div>

        {/* Proof Form Modal */}
        {showProofForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto`}>
              <div className={`sticky top-0 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {editingProof ? t('tools.designProof.editProof', 'Edit Proof') : t('tools.designProof.newDesignProof', 'New Design Proof')}
                  </h2>
                  <button onClick={resetForm} className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <input
                  type="text"
                  placeholder={t('tools.designProof.jobNumberOptional', 'Job Number (optional)')}
                  value={newProof.jobNumber}
                  onChange={(e) => setNewProof({ ...newProof, jobNumber: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
                <input
                  type="text"
                  placeholder={t('tools.designProof.customerName', 'Customer Name *')}
                  value={newProof.customerName}
                  onChange={(e) => setNewProof({ ...newProof, customerName: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
                <input
                  type="email"
                  placeholder={t('tools.designProof.customerEmail', 'Customer Email')}
                  value={newProof.customerEmail}
                  onChange={(e) => setNewProof({ ...newProof, customerEmail: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
                <input
                  type="text"
                  placeholder={t('tools.designProof.projectName', 'Project Name *')}
                  value={newProof.projectName}
                  onChange={(e) => setNewProof({ ...newProof, projectName: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
                <textarea
                  placeholder={t('tools.designProof.description2', 'Description')}
                  value={newProof.description}
                  onChange={(e) => setNewProof({ ...newProof, description: e.target.value })}
                  rows={3}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.designProof.priority', 'Priority')}</label>
                    <select
                      value={newProof.priority}
                      onChange={(e) => setNewProof({ ...newProof, priority: e.target.value as RevisionPriority })}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      {PRIORITIES.map((p) => (
                        <option key={p.priority} value={p.priority}>{p.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.designProof.dueDate', 'Due Date')}</label>
                    <input
                      type="date"
                      value={newProof.dueDate}
                      onChange={(e) => setNewProof({ ...newProof, dueDate: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                </div>
                <input
                  type="text"
                  placeholder={t('tools.designProof.assignedDesigner', 'Assigned Designer')}
                  value={newProof.assignedDesigner}
                  onChange={(e) => setNewProof({ ...newProof, assignedDesigner: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
                <textarea
                  placeholder={t('tools.designProof.internalNotes', 'Internal Notes')}
                  value={newProof.internalNotes}
                  onChange={(e) => setNewProof({ ...newProof, internalNotes: e.target.value })}
                  rows={2}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>

              <div className={`sticky bottom-0 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-6 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={resetForm}
                    className={`px-4 py-2 rounded-lg ${
                      theme === 'dark'
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {t('tools.designProof.cancel', 'Cancel')}
                  </button>
                  <button
                    onClick={addProof}
                    className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90"
                  >
                    {t('tools.designProof.createProof', 'Create Proof')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Proof Details Modal */}
        {selectedProof && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto`}>
              <div className={`sticky top-0 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {selectedProof.projectName}
                    </h2>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {selectedProof.proofNumber} | {selectedProof.customerName}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedProof(null)}
                    className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Status and Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusBadge(selectedProof.status)}
                    {getPriorityBadge(selectedProof.priority)}
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Version {selectedProof.currentVersion}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedProof.status === 'pending_review' && (
                      <>
                        <button
                          onClick={() => requestRevision(selectedProof.id)}
                          className="flex items-center gap-2 px-3 py-1.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm"
                        >
                          <RotateCcw className="w-4 h-4" />
                          {t('tools.designProof.requestRevision', 'Request Revision')}
                        </button>
                        <button
                          onClick={() => approveProof(selectedProof.id)}
                          className="flex items-center gap-2 px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
                        >
                          <CheckCircle className="w-4 h-4" />
                          {t('tools.designProof.approve', 'Approve')}
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Proof Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.designProof.customer', 'Customer')}</p>
                    <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{selectedProof.customerName}</p>
                    {selectedProof.customerEmail && (
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{selectedProof.customerEmail}</p>
                    )}
                  </div>
                  {selectedProof.jobNumber && (
                    <div>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.designProof.jobNumber', 'Job Number')}</p>
                      <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{selectedProof.jobNumber}</p>
                    </div>
                  )}
                  <div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.designProof.designer', 'Designer')}</p>
                    <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{selectedProof.assignedDesigner || 'Unassigned'}</p>
                  </div>
                  <div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.designProof.dueDate2', 'Due Date')}</p>
                    <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{selectedProof.dueDate ? formatDate(selectedProof.dueDate) : 'Not set'}</p>
                  </div>
                  {selectedProof.approvedAt && (
                    <div>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.designProof.approved2', 'Approved')}</p>
                      <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {formatDateTime(selectedProof.approvedAt)} by {selectedProof.approvedBy}
                      </p>
                    </div>
                  )}
                </div>

                {selectedProof.description && (
                  <div>
                    <p className={`text-sm mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.designProof.description', 'Description')}</p>
                    <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{selectedProof.description}</p>
                  </div>
                )}

                {/* Upload New Revision */}
                {(selectedProof.status === 'pending_upload' || selectedProof.status === 'revision_requested') && (
                  <div className={`p-4 rounded-lg border-2 border-dashed ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}>
                    <div className="text-center">
                      <Upload className={`w-8 h-8 mx-auto mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                      <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.designProof.uploadNewVersion', 'Upload New Version')}</p>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {t('tools.designProof.dragAndDropOrClick', 'Drag and drop or click to upload')}
                      </p>
                      <button
                        onClick={() => uploadRevision(selectedProof.id, `design_v${selectedProof.currentVersion + 1}.pdf`, 'application/pdf')}
                        className="mt-3 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90 text-sm"
                      >
                        <Upload className="w-4 h-4 inline mr-2" />
                        {t('tools.designProof.uploadFile', 'Upload File')}
                      </button>
                    </div>
                  </div>
                )}

                {/* Revision History */}
                {selectedProof.revisions.length > 0 && (
                  <div>
                    <h3 className={`font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.designProof.revisionHistory', 'Revision History')}</h3>
                    <div className="space-y-3">
                      {selectedProof.revisions.slice().reverse().map((revision) => (
                        <div
                          key={revision.id}
                          className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                Version {revision.version}
                              </span>
                              <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                {formatDateTime(revision.uploadedAt)}
                              </span>
                            </div>
                            <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {revision.fileName}
                            </span>
                          </div>

                          {revision.comments.length > 0 && (
                            <div className="mt-3 space-y-2">
                              {revision.comments.map((comment) => (
                                <div key={comment.id} className={`pl-4 border-l-2 ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}>
                                  <div className="flex items-center gap-2">
                                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                      {comment.author}
                                    </span>
                                    <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                                      {formatDateTime(comment.timestamp)}
                                    </span>
                                  </div>
                                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{comment.text}</p>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Add Comment */}
                          <div className="mt-3 flex gap-2">
                            <input
                              type="text"
                              placeholder={t('tools.designProof.addAComment', 'Add a comment...')}
                              className={`flex-1 px-3 py-1.5 text-sm rounded-lg border ${
                                theme === 'dark'
                                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                              }`}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  const target = e.target as HTMLInputElement;
                                  if (target.value.trim()) {
                                    addComment(selectedProof.id, revision.id, target.value);
                                    target.value = '';
                                  }
                                }
                              }}
                            />
                            <button
                              onClick={(e) => {
                                const input = (e.target as HTMLElement).parentElement?.querySelector('input');
                                if (input && input.value.trim()) {
                                  addComment(selectedProof.id, revision.id, input.value);
                                  input.value = '';
                                }
                              }}
                              className="px-3 py-1.5 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Confirm Dialog */}
        <ConfirmDialog />

        {/* Validation Toast */}
        {validationMessage && (
          <div className="fixed bottom-4 right-4 px-4 py-3 bg-amber-500 text-white rounded-lg shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-200 z-50">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-medium">{validationMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DesignProofTool;
