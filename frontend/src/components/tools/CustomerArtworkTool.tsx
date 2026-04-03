'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Image,
  Plus,
  Trash2,
  Search,
  Upload,
  Download,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  FileText,
  Folder,
  Eye,
  Edit2,
  X,
  Sparkles,
  Send,
  MessageSquare,
  Link,
  Copy,
  FolderOpen,
  File,
  ImageIcon,
  FileWarning,
  RefreshCw,
  Filter,
  Loader2,
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

interface CustomerArtworkToolProps {
  uiConfig?: UIConfig;
}

// Types
type ArtworkStatus = 'pending' | 'received' | 'review' | 'approved' | 'rejected' | 'revision_needed';
type FileType = 'pdf' | 'ai' | 'eps' | 'psd' | 'jpg' | 'png' | 'tiff' | 'svg' | 'other';
type IssueType = 'resolution' | 'color_mode' | 'bleed' | 'fonts' | 'size' | 'format' | 'other';

interface ArtworkIssue {
  id: string;
  type: IssueType;
  description: string;
  severity: 'warning' | 'error';
  resolved: boolean;
}

interface ArtworkComment {
  id: string;
  author: string;
  text: string;
  timestamp: string;
  internal: boolean;
}

interface ArtworkFile {
  id: string;
  fileName: string;
  fileType: FileType;
  fileSize: number;
  uploadedAt: string;
  uploadedBy: string;
  version: number;
  url: string;
}

interface CustomerArtwork {
  id: string;
  artworkId: string;
  jobNumber: string;
  customerName: string;
  customerEmail: string;
  projectName: string;
  description: string;
  status: ArtworkStatus;
  files: ArtworkFile[];
  currentVersion: number;
  issues: ArtworkIssue[];
  comments: ArtworkComment[];
  specifications: {
    width: number;
    height: number;
    unit: 'inches' | 'mm' | 'cm';
    dpi: number;
    colorMode: 'CMYK' | 'RGB' | 'Grayscale';
    bleed: number;
  };
  dueDate: string;
  assignedTo: string;
  createdAt: string;
  updatedAt: string;
  approvedAt: string | null;
  approvedBy: string | null;
}

// Constants
const ARTWORK_STATUSES: { status: ArtworkStatus; label: string; color: string; icon: React.ReactNode }[] = [
  { status: 'pending', label: 'Pending', color: 'bg-gray-500', icon: <Clock className="w-4 h-4" /> },
  { status: 'received', label: 'Received', color: 'bg-blue-500', icon: <Upload className="w-4 h-4" /> },
  { status: 'review', label: 'In Review', color: 'bg-purple-500', icon: <Eye className="w-4 h-4" /> },
  { status: 'approved', label: 'Approved', color: 'bg-green-500', icon: <CheckCircle className="w-4 h-4" /> },
  { status: 'rejected', label: 'Rejected', color: 'bg-red-500', icon: <XCircle className="w-4 h-4" /> },
  { status: 'revision_needed', label: 'Revision Needed', color: 'bg-orange-500', icon: <RefreshCw className="w-4 h-4" /> },
];

const FILE_TYPES: { type: FileType; label: string; icon: string }[] = [
  { type: 'pdf', label: 'PDF', icon: 'file-text' },
  { type: 'ai', label: 'Illustrator', icon: 'pen-tool' },
  { type: 'eps', label: 'EPS', icon: 'file' },
  { type: 'psd', label: 'Photoshop', icon: 'layers' },
  { type: 'jpg', label: 'JPEG', icon: 'image' },
  { type: 'png', label: 'PNG', icon: 'image' },
  { type: 'tiff', label: 'TIFF', icon: 'image' },
  { type: 'svg', label: 'SVG', icon: 'code' },
  { type: 'other', label: 'Other', icon: 'file' },
];

const ISSUE_TYPES: { type: IssueType; label: string }[] = [
  { type: 'resolution', label: 'Low Resolution' },
  { type: 'color_mode', label: 'Wrong Color Mode' },
  { type: 'bleed', label: 'Missing Bleed' },
  { type: 'fonts', label: 'Font Issues' },
  { type: 'size', label: 'Wrong Size' },
  { type: 'format', label: 'Wrong Format' },
  { type: 'other', label: 'Other Issue' },
];

// Column configuration for exports
const ARTWORK_COLUMNS: ColumnConfig[] = [
  { key: 'artworkId', header: 'Artwork ID', type: 'string' },
  { key: 'jobNumber', header: 'Job #', type: 'string' },
  { key: 'customerName', header: 'Customer', type: 'string' },
  { key: 'projectName', header: 'Project', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'currentVersion', header: 'Version', type: 'number' },
  { key: 'dueDate', header: 'Due Date', type: 'date' },
  { key: 'assignedTo', header: 'Assigned To', type: 'string' },
  { key: 'createdAt', header: 'Created', type: 'date' },
];

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);
const generateArtworkId = () => `ART-${Date.now().toString().slice(-6)}`;

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

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
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Main Component
export const CustomerArtworkTool: React.FC<CustomerArtworkToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);

  // useToolData hook for backend sync
  const {
    data: artworks,
    addItem: addArtworkToBackend,
    updateItem: updateArtworkBackend,
    deleteItem: deleteArtworkBackend,
    isLoading,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<CustomerArtwork>('customer-artwork', [], ARTWORK_COLUMNS);

  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // Local UI State
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'review' | 'approved'>('all');
  const [showArtworkForm, setShowArtworkForm] = useState(false);
  const [editingArtwork, setEditingArtwork] = useState<CustomerArtwork | null>(null);
  const [selectedArtwork, setSelectedArtwork] = useState<CustomerArtwork | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isInternalComment, setIsInternalComment] = useState(false);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as Record<string, any>;
      let hasChanges = false;

      // If editing from gallery, restore saved state
      if (params.isEditFromGallery) {
        setIsEditFromGallery(true);
        hasChanges = true;
        // Data is managed by useToolData hook automatically
      }

      if (params.status && ARTWORK_STATUSES.find(s => s.status === params.status)) {
        setFilterStatus(params.status);
        hasChanges = true;
      }
      if (params.tab && ['all', 'pending', 'review', 'approved'].includes(params.tab)) {
        setActiveTab(params.tab);
        hasChanges = true;
      }

      if (hasChanges) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // New artwork form state
  const [newArtwork, setNewArtwork] = useState<Partial<CustomerArtwork>>({
    jobNumber: '',
    customerName: '',
    customerEmail: '',
    projectName: '',
    description: '',
    specifications: {
      width: 0,
      height: 0,
      unit: 'inches',
      dpi: 300,
      colorMode: 'CMYK',
      bleed: 0.125,
    },
    dueDate: '',
    assignedTo: '',
  });

  // Handle prefill from uiConfig
  React.useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params;
      if (params.customerName || params.projectName || params.jobNumber) {
        setNewArtwork({
          ...newArtwork,
          jobNumber: params.jobNumber || '',
          customerName: params.customerName || '',
          customerEmail: params.customerEmail || '',
          projectName: params.projectName || '',
          description: params.description || '',
        });
        setShowArtworkForm(true);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Add new artwork request
  const addArtwork = () => {
    if (!newArtwork.customerName || !newArtwork.projectName) {
      setValidationMessage('Please fill in required fields (Customer Name, Project Name)');
      setTimeout(() => setValidationMessage(null), 4000);
      return;
    }

    const artwork: CustomerArtwork = {
      id: generateId(),
      artworkId: generateArtworkId(),
      jobNumber: newArtwork.jobNumber || '',
      customerName: newArtwork.customerName || '',
      customerEmail: newArtwork.customerEmail || '',
      projectName: newArtwork.projectName || '',
      description: newArtwork.description || '',
      status: 'pending',
      files: [],
      currentVersion: 0,
      issues: [],
      comments: [],
      specifications: newArtwork.specifications || {
        width: 0,
        height: 0,
        unit: 'inches',
        dpi: 300,
        colorMode: 'CMYK',
        bleed: 0.125,
      },
      dueDate: newArtwork.dueDate || '',
      assignedTo: newArtwork.assignedTo || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      approvedAt: null,
      approvedBy: null,
    };

    addArtworkToBackend(artwork);
    resetForm();
  };

  // Upload file (simulated)
  const uploadFile = (artworkId: string, fileName: string, fileType: FileType, fileSize: number) => {
    const artwork = artworks.find((a) => a.id === artworkId);
    if (!artwork) return;

    const newVersion = artwork.currentVersion + 1;
    const file: ArtworkFile = {
      id: generateId(),
      fileName,
      fileType,
      fileSize,
      uploadedAt: new Date().toISOString(),
      uploadedBy: 'Current User',
      version: newVersion,
      url: `#file-${newVersion}`,
    };

    updateArtworkBackend(artworkId, {
      files: [...artwork.files, file],
      currentVersion: newVersion,
      status: artwork.status === 'pending' ? 'received' : artwork.status,
      updatedAt: new Date().toISOString(),
    });

    if (selectedArtwork?.id === artworkId) {
      setSelectedArtwork({
        ...selectedArtwork,
        files: [...selectedArtwork.files, file],
        currentVersion: newVersion,
        status: selectedArtwork.status === 'pending' ? 'received' : selectedArtwork.status,
      });
    }

    setShowUploadModal(false);
  };

  // Add issue to artwork
  const addIssue = (artworkId: string, type: IssueType, description: string, severity: 'warning' | 'error') => {
    const artwork = artworks.find((a) => a.id === artworkId);
    if (!artwork) return;

    const issue: ArtworkIssue = {
      id: generateId(),
      type,
      description,
      severity,
      resolved: false,
    };

    updateArtworkBackend(artworkId, {
      issues: [...artwork.issues, issue],
      status: 'revision_needed',
      updatedAt: new Date().toISOString(),
    });

    if (selectedArtwork?.id === artworkId) {
      setSelectedArtwork({
        ...selectedArtwork,
        issues: [...selectedArtwork.issues, issue],
        status: 'revision_needed',
      });
    }
  };

  // Resolve issue
  const resolveIssue = (artworkId: string, issueId: string) => {
    const artwork = artworks.find((a) => a.id === artworkId);
    if (!artwork) return;

    const updatedIssues = artwork.issues.map((issue) =>
      issue.id === issueId ? { ...issue, resolved: true } : issue
    );

    updateArtworkBackend(artworkId, {
      issues: updatedIssues,
      updatedAt: new Date().toISOString(),
    });

    if (selectedArtwork?.id === artworkId) {
      setSelectedArtwork({
        ...selectedArtwork,
        issues: updatedIssues,
      });
    }
  };

  // Add comment
  const addComment = (artworkId: string, text: string, internal: boolean) => {
    const artwork = artworks.find((a) => a.id === artworkId);
    if (!artwork) return;

    const comment: ArtworkComment = {
      id: generateId(),
      author: 'Current User',
      text,
      timestamp: new Date().toISOString(),
      internal,
    };

    updateArtworkBackend(artworkId, {
      comments: [...artwork.comments, comment],
      updatedAt: new Date().toISOString(),
    });

    if (selectedArtwork?.id === artworkId) {
      setSelectedArtwork({
        ...selectedArtwork,
        comments: [...selectedArtwork.comments, comment],
      });
    }

    setNewComment('');
  };

  // Update artwork status
  const updateStatus = (artworkId: string, status: ArtworkStatus) => {
    const updates: Partial<CustomerArtwork> = {
      status,
      updatedAt: new Date().toISOString(),
    };

    if (status === 'approved') {
      updates.approvedAt = new Date().toISOString();
      updates.approvedBy = 'Current User';
    }

    updateArtworkBackend(artworkId, updates);

    if (selectedArtwork?.id === artworkId) {
      setSelectedArtwork({
        ...selectedArtwork,
        ...updates,
      } as CustomerArtwork);
    }
  };

  // Delete artwork
  const deleteArtwork = async (artworkId: string) => {
    const confirmed = await confirm({
      title: 'Delete Artwork',
      message: 'Are you sure you want to delete this artwork?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteArtworkBackend(artworkId);
      if (selectedArtwork?.id === artworkId) {
        setSelectedArtwork(null);
      }
    }
  };

  // Reset form
  const resetForm = () => {
    setNewArtwork({
      jobNumber: '',
      customerName: '',
      customerEmail: '',
      projectName: '',
      description: '',
      specifications: {
        width: 0,
        height: 0,
        unit: 'inches',
        dpi: 300,
        colorMode: 'CMYK',
        bleed: 0.125,
      },
      dueDate: '',
      assignedTo: '',
    });
    setShowArtworkForm(false);
    setEditingArtwork(null);
  };

  // Filtered artworks
  const filteredArtworks = useMemo(() => {
    let filtered = artworks;

    if (activeTab === 'pending') {
      filtered = artworks.filter((a) => ['pending', 'received'].includes(a.status));
    } else if (activeTab === 'review') {
      filtered = artworks.filter((a) => ['review', 'revision_needed'].includes(a.status));
    } else if (activeTab === 'approved') {
      filtered = artworks.filter((a) => a.status === 'approved');
    }

    return filtered.filter((artwork) => {
      const matchesSearch =
        searchTerm === '' ||
        artwork.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        artwork.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        artwork.artworkId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        artwork.jobNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || artwork.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [artworks, searchTerm, filterStatus, activeTab]);

  // Analytics
  const analytics = useMemo(() => {
    const total = artworks.length;
    const pending = artworks.filter((a) => ['pending', 'received'].includes(a.status)).length;
    const inReview = artworks.filter((a) => ['review', 'revision_needed'].includes(a.status)).length;
    const approved = artworks.filter((a) => a.status === 'approved').length;
    const withIssues = artworks.filter((a) => a.issues.some((i) => !i.resolved)).length;

    return { total, pending, inReview, approved, withIssues };
  }, [artworks]);

  const getStatusBadge = (status: ArtworkStatus) => {
    const statusInfo = ARTWORK_STATUSES.find((s) => s.status === status);
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white ${statusInfo?.color || 'bg-gray-500'}`}>
        {statusInfo?.icon}
        {statusInfo?.label || status}
      </span>
    );
  };

  const getFileIcon = (fileType: FileType) => {
    switch (fileType) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-500" />;
      case 'ai':
      case 'eps':
      case 'psd':
        return <File className="w-5 h-5 text-orange-500" />;
      case 'jpg':
      case 'png':
      case 'tiff':
        return <ImageIcon className="w-5 h-5 text-blue-500" />;
      case 'svg':
        return <File className="w-5 h-5 text-purple-500" />;
      default:
        return <File className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <>
      <ConfirmDialog />
      {validationMessage && (
        <div className="fixed top-4 right-4 z-[100] bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-top-2">
          <AlertTriangle className="w-5 h-5" />
          <span>{validationMessage}</span>
          <button
            onClick={() => setValidationMessage(null)}
            className="ml-2 hover:bg-red-600 rounded p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
        <div className="max-w-7xl mx-auto">
          {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.customerArtwork.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <Image className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.customerArtwork.customerArtworkManager', 'Customer Artwork Manager')}
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.customerArtwork.manageArtworkFilesReviewQuality', 'Manage artwork files, review quality, and track approvals')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="customer-artwork" toolName="Customer Artwork" />

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
                onExportCSV={() => exportToCSV(artworks, ARTWORK_COLUMNS, { filename: 'customer-artwork' })}
                onExportExcel={() => exportToExcel(artworks, ARTWORK_COLUMNS, { filename: 'customer-artwork' })}
                onExportJSON={() => exportToJSON(artworks, { filename: 'customer-artwork' })}
                onExportPDF={async () => {
                  await exportToPDF(artworks, ARTWORK_COLUMNS, {
                    filename: 'customer-artwork',
                    title: 'Customer Artwork Report',
                    subtitle: `${artworks.length} total | ${analytics.approved} approved`,
                  });
                }}
                onPrint={() => printData(artworks, ARTWORK_COLUMNS, { title: 'Customer Artwork' })}
                onCopyToClipboard={async () => await copyUtil(artworks, ARTWORK_COLUMNS, 'tab')}
                showImport={false}
                theme={theme}
              />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.customerArtwork.total', 'Total')}</p>
              <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{analytics.total}</p>
            </div>
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.customerArtwork.pending', 'Pending')}</p>
              <p className={`text-xl font-bold text-gray-500`}>{analytics.pending}</p>
            </div>
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.customerArtwork.inReview', 'In Review')}</p>
              <p className={`text-xl font-bold text-purple-500`}>{analytics.inReview}</p>
            </div>
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.customerArtwork.approved', 'Approved')}</p>
              <p className={`text-xl font-bold text-green-500`}>{analytics.approved}</p>
            </div>
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.customerArtwork.withIssues', 'With Issues')}</p>
              <p className={`text-xl font-bold text-orange-500`}>{analytics.withIssues}</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'All Artwork', icon: <Folder className="w-4 h-4" /> },
              { id: 'pending', label: 'Pending', icon: <Clock className="w-4 h-4" /> },
              { id: 'review', label: 'In Review', icon: <Eye className="w-4 h-4" /> },
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

        {/* Filters & Actions */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4 mb-6`}>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type="text"
                  placeholder={t('tools.customerArtwork.searchArtwork', 'Search artwork...')}
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
              <option value="all">{t('tools.customerArtwork.allStatuses', 'All Statuses')}</option>
              {ARTWORK_STATUSES.map((s) => (
                <option key={s.status} value={s.status}>{s.label}</option>
              ))}
            </select>
            <button
              onClick={() => setShowArtworkForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t('tools.customerArtwork.newArtworkRequest', 'New Artwork Request')}
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-12 text-center`}>
            <Loader2 className={`w-12 h-12 mx-auto mb-4 animate-spin ${theme === 'dark' ? t('tools.customerArtwork.text0d9488', 'text-[#0D9488]') : t('tools.customerArtwork.text0d94882', 'text-[#0D9488]')}`} />
            <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.customerArtwork.loadingArtwork', 'Loading artwork...')}</p>
          </div>
        )}

        {/* Artwork Grid */}
        {!isLoading && filteredArtworks.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredArtworks.map((artwork) => (
              <div
                key={artwork.id}
                className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4 cursor-pointer hover:shadow-xl transition-shadow`}
                onClick={() => setSelectedArtwork(artwork)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className={`font-mono text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {artwork.artworkId}
                    </p>
                    <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {artwork.projectName}
                    </h3>
                  </div>
                  {getStatusBadge(artwork.status)}
                </div>

                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} space-y-1 mb-3`}>
                  <p>{artwork.customerName}</p>
                  {artwork.jobNumber && <p>Job: {artwork.jobNumber}</p>}
                  <p>Version {artwork.currentVersion} | {artwork.files.length} files</p>
                </div>

                {artwork.issues.filter((i) => !i.resolved).length > 0 && (
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                    <span className={`text-sm ${theme === 'dark' ? 'text-orange-400' : 'text-orange-600'}`}>
                      {artwork.issues.filter((i) => !i.resolved).length} unresolved issues
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                  <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                    {formatDate(artwork.createdAt)}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteArtwork(artwork.id);
                      }}
                      className={`p-1.5 rounded ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredArtworks.length === 0 && (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-12 text-center`}>
            <FolderOpen className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-300'}`} />
            <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.customerArtwork.noArtworkFound', 'No artwork found')}</p>
            <button
              onClick={() => setShowArtworkForm(true)}
              className="mt-4 text-[#0D9488] hover:underline"
            >
              {t('tools.customerArtwork.createYourFirstArtworkRequest', 'Create your first artwork request')}
            </button>
          </div>
        )}

        {/* Artwork Form Modal */}
        {showArtworkForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto`}>
              <div className={`sticky top-0 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.customerArtwork.newArtworkRequest2', 'New Artwork Request')}
                  </h2>
                  <button onClick={resetForm} className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <input
                  type="text"
                  placeholder={t('tools.customerArtwork.jobNumber', 'Job Number')}
                  value={newArtwork.jobNumber}
                  onChange={(e) => setNewArtwork({ ...newArtwork, jobNumber: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
                <input
                  type="text"
                  placeholder={t('tools.customerArtwork.customerName', 'Customer Name *')}
                  value={newArtwork.customerName}
                  onChange={(e) => setNewArtwork({ ...newArtwork, customerName: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
                <input
                  type="email"
                  placeholder={t('tools.customerArtwork.customerEmail', 'Customer Email')}
                  value={newArtwork.customerEmail}
                  onChange={(e) => setNewArtwork({ ...newArtwork, customerEmail: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
                <input
                  type="text"
                  placeholder={t('tools.customerArtwork.projectName', 'Project Name *')}
                  value={newArtwork.projectName}
                  onChange={(e) => setNewArtwork({ ...newArtwork, projectName: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
                <textarea
                  placeholder={t('tools.customerArtwork.description', 'Description')}
                  value={newArtwork.description}
                  onChange={(e) => setNewArtwork({ ...newArtwork, description: e.target.value })}
                  rows={3}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />

                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.customerArtwork.specifications2', 'Specifications')}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="number"
                      placeholder={t('tools.customerArtwork.width', 'Width')}
                      value={newArtwork.specifications?.width || ''}
                      onChange={(e) => setNewArtwork({
                        ...newArtwork,
                        specifications: { ...newArtwork.specifications!, width: parseFloat(e.target.value) || 0 }
                      })}
                      className={`px-3 py-2 rounded-lg border text-sm ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                    />
                    <input
                      type="number"
                      placeholder={t('tools.customerArtwork.height', 'Height')}
                      value={newArtwork.specifications?.height || ''}
                      onChange={(e) => setNewArtwork({
                        ...newArtwork,
                        specifications: { ...newArtwork.specifications!, height: parseFloat(e.target.value) || 0 }
                      })}
                      className={`px-3 py-2 rounded-lg border text-sm ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                    />
                    <select
                      value={newArtwork.specifications?.unit}
                      onChange={(e) => setNewArtwork({
                        ...newArtwork,
                        specifications: { ...newArtwork.specifications!, unit: e.target.value as 'inches' | 'mm' | 'cm' }
                      })}
                      className={`px-3 py-2 rounded-lg border text-sm ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="inches">{t('tools.customerArtwork.inches', 'Inches')}</option>
                      <option value="mm">MM</option>
                      <option value="cm">CM</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    <input
                      type="number"
                      placeholder={t('tools.customerArtwork.dpi', 'DPI')}
                      value={newArtwork.specifications?.dpi || ''}
                      onChange={(e) => setNewArtwork({
                        ...newArtwork,
                        specifications: { ...newArtwork.specifications!, dpi: parseInt(e.target.value) || 300 }
                      })}
                      className={`px-3 py-2 rounded-lg border text-sm ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                    />
                    <select
                      value={newArtwork.specifications?.colorMode}
                      onChange={(e) => setNewArtwork({
                        ...newArtwork,
                        specifications: { ...newArtwork.specifications!, colorMode: e.target.value as 'CMYK' | 'RGB' | 'Grayscale' }
                      })}
                      className={`px-3 py-2 rounded-lg border text-sm ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="CMYK">{t('tools.customerArtwork.cmyk', 'CMYK')}</option>
                      <option value="RGB">RGB</option>
                      <option value="Grayscale">{t('tools.customerArtwork.grayscale', 'Grayscale')}</option>
                    </select>
                    <input
                      type="number"
                      step="0.125"
                      placeholder={t('tools.customerArtwork.bleed', 'Bleed')}
                      value={newArtwork.specifications?.bleed || ''}
                      onChange={(e) => setNewArtwork({
                        ...newArtwork,
                        specifications: { ...newArtwork.specifications!, bleed: parseFloat(e.target.value) || 0 }
                      })}
                      className={`px-3 py-2 rounded-lg border text-sm ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.customerArtwork.dueDate', 'Due Date')}</label>
                    <input
                      type="date"
                      value={newArtwork.dueDate}
                      onChange={(e) => setNewArtwork({ ...newArtwork, dueDate: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.customerArtwork.assignedTo', 'Assigned To')}</label>
                    <input
                      type="text"
                      placeholder={t('tools.customerArtwork.designerName', 'Designer name')}
                      value={newArtwork.assignedTo}
                      onChange={(e) => setNewArtwork({ ...newArtwork, assignedTo: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                    />
                  </div>
                </div>
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
                    {t('tools.customerArtwork.cancel', 'Cancel')}
                  </button>
                  <button
                    onClick={addArtwork}
                    className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90"
                  >
                    {t('tools.customerArtwork.createRequest', 'Create Request')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Artwork Detail Modal */}
        {selectedArtwork && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto`}>
              <div className={`sticky top-0 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {selectedArtwork.projectName}
                    </h2>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {selectedArtwork.artworkId} | {selectedArtwork.customerName}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedArtwork(null)}
                    className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Status and Actions */}
                <div className="flex items-center justify-between">
                  {getStatusBadge(selectedArtwork.status)}
                  <div className="flex items-center gap-2">
                    {selectedArtwork.status === 'received' && (
                      <button
                        onClick={() => updateStatus(selectedArtwork.id, 'review')}
                        className="px-3 py-1.5 bg-purple-500 text-white rounded-lg hover:bg-purple-600 text-sm"
                      >
                        {t('tools.customerArtwork.startReview', 'Start Review')}
                      </button>
                    )}
                    {selectedArtwork.status === 'review' && (
                      <>
                        <button
                          onClick={() => updateStatus(selectedArtwork.id, 'revision_needed')}
                          className="px-3 py-1.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm"
                        >
                          {t('tools.customerArtwork.requestRevision', 'Request Revision')}
                        </button>
                        <button
                          onClick={() => updateStatus(selectedArtwork.id, 'approved')}
                          className="px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
                        >
                          {t('tools.customerArtwork.approve', 'Approve')}
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setShowUploadModal(true)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm ${
                        theme === 'dark'
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <Upload className="w-4 h-4" />
                      {t('tools.customerArtwork.upload', 'Upload')}
                    </button>
                  </div>
                </div>

                {/* Specifications */}
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <h3 className={`font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.customerArtwork.specifications', 'Specifications')}</h3>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>{t('tools.customerArtwork.size', 'Size:')}</span>
                      <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                        {selectedArtwork.specifications.width} x {selectedArtwork.specifications.height} {selectedArtwork.specifications.unit}
                      </span>
                    </div>
                    <div>
                      <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>{t('tools.customerArtwork.resolution', 'Resolution:')}</span>
                      <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{selectedArtwork.specifications.dpi} DPI</span>
                    </div>
                    <div>
                      <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>{t('tools.customerArtwork.color', 'Color:')}</span>
                      <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{selectedArtwork.specifications.colorMode}</span>
                    </div>
                  </div>
                </div>

                {/* Files */}
                {selectedArtwork.files.length > 0 && (
                  <div>
                    <h3 className={`font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Files ({selectedArtwork.files.length})
                    </h3>
                    <div className="space-y-2">
                      {selectedArtwork.files.map((file) => (
                        <div
                          key={file.id}
                          className={`flex items-center justify-between p-3 rounded-lg ${
                            theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {getFileIcon(file.fileType)}
                            <div>
                              <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {file.fileName}
                              </p>
                              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                v{file.version} | {formatFileSize(file.fileSize)} | {formatDateTime(file.uploadedAt)}
                              </p>
                            </div>
                          </div>
                          <button className={`p-2 rounded ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}>
                            <Download className="w-4 h-4 text-[#0D9488]" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Issues */}
                {selectedArtwork.issues.length > 0 && (
                  <div>
                    <h3 className={`font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Issues ({selectedArtwork.issues.filter((i) => !i.resolved).length} unresolved)
                    </h3>
                    <div className="space-y-2">
                      {selectedArtwork.issues.map((issue) => (
                        <div
                          key={issue.id}
                          className={`flex items-center justify-between p-3 rounded-lg ${
                            issue.resolved
                              ? theme === 'dark' ? 'bg-green-900/20' : 'bg-green-50'
                              : issue.severity === 'error'
                              ? theme === 'dark' ? 'bg-red-900/20' : 'bg-red-50'
                              : theme === 'dark' ? 'bg-orange-900/20' : 'bg-orange-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {issue.resolved ? (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : issue.severity === 'error' ? (
                              <XCircle className="w-5 h-5 text-red-500" />
                            ) : (
                              <AlertTriangle className="w-5 h-5 text-orange-500" />
                            )}
                            <div>
                              <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {ISSUE_TYPES.find((t) => t.type === issue.type)?.label}
                              </p>
                              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                {issue.description}
                              </p>
                            </div>
                          </div>
                          {!issue.resolved && (
                            <button
                              onClick={() => resolveIssue(selectedArtwork.id, issue.id)}
                              className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                            >
                              {t('tools.customerArtwork.resolve', 'Resolve')}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Comments */}
                <div>
                  <h3 className={`font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.customerArtwork.comments', 'Comments')}</h3>
                  <div className="space-y-3 mb-4">
                    {selectedArtwork.comments.map((comment) => (
                      <div
                        key={comment.id}
                        className={`p-3 rounded-lg ${
                          comment.internal
                            ? theme === 'dark' ? 'bg-yellow-900/20 border border-yellow-700' : 'bg-yellow-50 border border-yellow-200'
                            : theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {comment.author}
                          </span>
                          {comment.internal && (
                            <span className="text-xs px-2 py-0.5 bg-yellow-500 text-white rounded">{t('tools.customerArtwork.internal', 'Internal')}</span>
                          )}
                          <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                            {formatDateTime(comment.timestamp)}
                          </span>
                        </div>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{comment.text}</p>
                      </div>
                    ))}
                  </div>

                  {/* Add Comment */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder={t('tools.customerArtwork.addAComment', 'Add a comment...')}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className={`flex-1 px-4 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                    />
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isInternalComment}
                        onChange={(e) => setIsInternalComment(e.target.checked)}
                        className="w-4 h-4 rounded text-[#0D9488]"
                      />
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.customerArtwork.internal2', 'Internal')}</span>
                    </label>
                    <button
                      onClick={() => {
                        if (newComment.trim()) {
                          addComment(selectedArtwork.id, newComment, isInternalComment);
                        }
                      }}
                      className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Upload Modal */}
        {showUploadModal && selectedArtwork && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl w-full max-w-md p-6`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.customerArtwork.uploadFile', 'Upload File')}</h3>
                <button onClick={() => setShowUploadModal(false)} className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className={`p-8 border-2 border-dashed rounded-lg text-center ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}>
                <Upload className={`w-10 h-10 mx-auto mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.customerArtwork.dragAndDropFilesHere', 'Drag and drop files here')}
                </p>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.customerArtwork.orClickToBrowse', 'or click to browse')}
                </p>
                <button
                  onClick={() => uploadFile(selectedArtwork.id, `artwork_v${selectedArtwork.currentVersion + 1}.pdf`, 'pdf', 2500000)}
                  className="mt-4 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90"
                >
                  {t('tools.customerArtwork.simulateUpload', 'Simulate Upload')}
                </button>
              </div>

              <p className={`text-xs mt-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                {t('tools.customerArtwork.supportedFormatsPdfAiEps', 'Supported formats: PDF, AI, EPS, PSD, JPG, PNG, TIFF, SVG')}
              </p>
            </div>
          </div>
        )}
        </div>
      </div>
    </>
  );
};

export default CustomerArtworkTool;
