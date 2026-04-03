'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FileText,
  Calendar,
  DollarSign,
  Clock,
  Plus,
  Trash2,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Building2,
  User,
  FileCheck,
  Upload,
  Download,
  ExternalLink,
  Target,
  Sparkles,
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

interface GrantApplicationToolProps {
  uiConfig?: UIConfig;
}
import { useTheme } from '@/contexts/ThemeContext';

// Types
type GrantStatus = 'draft' | 'in_progress' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'closed';
type GrantType = 'federal' | 'state' | 'foundation' | 'corporate' | 'community';
type Priority = 'high' | 'medium' | 'low';

interface GrantApplication {
  id: string;
  title: string;
  funder: string;
  funderType: GrantType;
  amount: number;
  deadline: string;
  status: GrantStatus;
  priority: Priority;
  program: string;
  contactName: string;
  contactEmail: string;
  description: string;
  requirements: string[];
  matchingRequired: boolean;
  matchingAmount: number;
  submittedAt: string | null;
  decisionDate: string | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface Task {
  id: string;
  grantId: string;
  title: string;
  description: string;
  assignee: string;
  dueDate: string;
  completed: boolean;
  createdAt: string;
}

interface Document {
  id: string;
  grantId: string;
  name: string;
  type: string;
  required: boolean;
  uploaded: boolean;
  uploadedAt: string | null;
  notes: string;
  createdAt: string;
}

interface Funder {
  id: string;
  name: string;
  type: GrantType;
  website: string;
  contactName: string;
  contactEmail: string;
  focusAreas: string[];
  avgGrantSize: number;
  notes: string;
  createdAt: string;
}

// Constants
const GRANT_TYPES: { value: GrantType; label: string }[] = [
  { value: 'federal', label: 'Federal' },
  { value: 'state', label: 'State/Local' },
  { value: 'foundation', label: 'Foundation' },
  { value: 'corporate', label: 'Corporate' },
  { value: 'community', label: 'Community' },
];

const FOCUS_AREAS = [
  'Education',
  'Healthcare',
  'Environment',
  'Arts & Culture',
  'Social Services',
  'Youth Development',
  'Senior Services',
  'Housing',
  'Food Security',
  'Economic Development',
  'Research',
  'Capacity Building',
];

const DOCUMENT_TYPES = [
  '501(c)(3) Letter',
  'Form 990',
  'Board List',
  'Organizational Budget',
  'Project Budget',
  'Logic Model',
  'Work Plan',
  'Letters of Support',
  'Financial Statements',
  'Insurance Certificate',
  'Audit Report',
  'Annual Report',
];

// Column configurations for exports
const GRANT_COLUMNS: ColumnConfig[] = [
  { key: 'title', header: 'Grant Title', type: 'string' },
  { key: 'funder', header: 'Funder', type: 'string' },
  { key: 'amount', header: 'Amount', type: 'currency' },
  { key: 'deadline', header: 'Deadline', type: 'date' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'priority', header: 'Priority', type: 'string' },
  { key: 'program', header: 'Program', type: 'string' },
];

const TASK_COLUMNS: ColumnConfig[] = [
  { key: 'title', header: 'Task', type: 'string' },
  { key: 'assignee', header: 'Assignee', type: 'string' },
  { key: 'dueDate', header: 'Due Date', type: 'date' },
  { key: 'completed', header: 'Status', type: 'boolean' },
];

const FUNDER_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Name', type: 'string' },
  { key: 'type', header: 'Type', type: 'string' },
  { key: 'avgGrantSize', header: 'Avg Grant Size', type: 'currency' },
  { key: 'contactName', header: 'Contact', type: 'string' },
  { key: 'contactEmail', header: 'Email', type: 'string' },
];

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const getDaysUntil = (dateString: string) => {
  if (!dateString) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadline = new Date(dateString);
  deadline.setHours(0, 0, 0, 0);
  return Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

// Main Component
export const GrantApplicationTool: React.FC<GrantApplicationToolProps> = ({ uiConfig }) => {
  const [isPrefilled, setIsPrefilled] = useState(false);
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // useToolData hooks for backend sync
  const {
    data: grants,
    addItem: addGrantToBackend,
    updateItem: updateGrantBackend,
    deleteItem: deleteGrantBackend,
    isSynced: grantsSynced,
    isSaving: grantsSaving,
    lastSaved: grantsLastSaved,
    syncError: grantsSyncError,
    forceSync: forceGrantsSync,
  } = useToolData<GrantApplication>('grant-applications', [], GRANT_COLUMNS);

  const {
    data: tasks,
    addItem: addTaskToBackend,
    updateItem: updateTaskBackend,
    deleteItem: deleteTaskBackend,
  } = useToolData<Task>('grant-tasks', [], TASK_COLUMNS);

  const {
    data: documents,
    addItem: addDocumentToBackend,
    updateItem: updateDocumentBackend,
    deleteItem: deleteDocumentBackend,
  } = useToolData<Document>('grant-documents', [], []);

  const {
    data: funders,
    addItem: addFunderToBackend,
    updateItem: updateFunderBackend,
    deleteItem: deleteFunderBackend,
  } = useToolData<Funder>('grant-funders', [], FUNDER_COLUMNS);

  // Local UI State
  const [activeTab, setActiveTab] = useState<'applications' | 'pipeline' | 'funders' | 'calendar' | 'reports'>('applications');
  const [showGrantForm, setShowGrantForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showFunderForm, setShowFunderForm] = useState(false);
  const [selectedGrantId, setSelectedGrantId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  // Form state
  const [newGrant, setNewGrant] = useState<Partial<GrantApplication>>({
    title: '',
    funder: '',
    funderType: 'foundation',
    amount: 0,
    deadline: '',
    status: 'draft',
    priority: 'medium',
    program: '',
    contactName: '',
    contactEmail: '',
    description: '',
    requirements: [],
    matchingRequired: false,
    matchingAmount: 0,
    notes: '',
  });

  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: '',
    description: '',
    assignee: '',
    dueDate: '',
    completed: false,
  });

  const [newFunder, setNewFunder] = useState<Partial<Funder>>({
    name: '',
    type: 'foundation',
    website: '',
    contactName: '',
    contactEmail: '',
    focusAreas: [],
    avgGrantSize: 0,
    notes: '',
  });

  // Prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as any;
      if (params.grantTitle || params.title) {
        setNewGrant({
          ...newGrant,
          title: params.grantTitle || params.title || '',
          funder: params.funder || '',
          amount: parseFloat(params.amount) || 0,
          deadline: params.deadline || '',
        });
        setShowGrantForm(true);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Add new grant
  const addGrant = () => {
    if (!newGrant.title || !newGrant.funder) {
      setValidationMessage('Please enter grant title and funder name');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const grant: GrantApplication = {
      id: generateId(),
      title: newGrant.title || '',
      funder: newGrant.funder || '',
      funderType: newGrant.funderType || 'foundation',
      amount: newGrant.amount || 0,
      deadline: newGrant.deadline || '',
      status: newGrant.status || 'draft',
      priority: newGrant.priority || 'medium',
      program: newGrant.program || '',
      contactName: newGrant.contactName || '',
      contactEmail: newGrant.contactEmail || '',
      description: newGrant.description || '',
      requirements: newGrant.requirements || [],
      matchingRequired: newGrant.matchingRequired || false,
      matchingAmount: newGrant.matchingAmount || 0,
      submittedAt: null,
      decisionDate: null,
      notes: newGrant.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addGrantToBackend(grant);

    // Add default document checklist
    DOCUMENT_TYPES.slice(0, 5).forEach(docType => {
      const doc: Document = {
        id: generateId(),
        grantId: grant.id,
        name: docType,
        type: docType,
        required: true,
        uploaded: false,
        uploadedAt: null,
        notes: '',
        createdAt: new Date().toISOString(),
      };
      addDocumentToBackend(doc);
    });

    setShowGrantForm(false);
    setNewGrant({
      title: '',
      funder: '',
      funderType: 'foundation',
      amount: 0,
      deadline: '',
      status: 'draft',
      priority: 'medium',
      program: '',
      contactName: '',
      contactEmail: '',
      description: '',
      requirements: [],
      matchingRequired: false,
      matchingAmount: 0,
      notes: '',
    });
  };

  // Add new task
  const addTask = () => {
    if (!newTask.title || !selectedGrantId) {
      setValidationMessage('Please enter task title');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const task: Task = {
      id: generateId(),
      grantId: selectedGrantId,
      title: newTask.title || '',
      description: newTask.description || '',
      assignee: newTask.assignee || '',
      dueDate: newTask.dueDate || '',
      completed: false,
      createdAt: new Date().toISOString(),
    };

    addTaskToBackend(task);
    setShowTaskForm(false);
    setNewTask({
      title: '',
      description: '',
      assignee: '',
      dueDate: '',
      completed: false,
    });
  };

  // Add new funder
  const addFunder = () => {
    if (!newFunder.name) {
      setValidationMessage('Please enter funder name');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const funder: Funder = {
      id: generateId(),
      name: newFunder.name || '',
      type: newFunder.type || 'foundation',
      website: newFunder.website || '',
      contactName: newFunder.contactName || '',
      contactEmail: newFunder.contactEmail || '',
      focusAreas: newFunder.focusAreas || [],
      avgGrantSize: newFunder.avgGrantSize || 0,
      notes: newFunder.notes || '',
      createdAt: new Date().toISOString(),
    };

    addFunderToBackend(funder);
    setShowFunderForm(false);
    setNewFunder({
      name: '',
      type: 'foundation',
      website: '',
      contactName: '',
      contactEmail: '',
      focusAreas: [],
      avgGrantSize: 0,
      notes: '',
    });
  };

  // Update grant status
  const updateGrantStatus = (grantId: string, status: GrantStatus) => {
    const updates: Partial<GrantApplication> = {
      status,
      updatedAt: new Date().toISOString(),
    };

    if (status === 'submitted') {
      updates.submittedAt = new Date().toISOString();
    }

    updateGrantBackend(grantId, updates);
  };

  // Toggle document uploaded
  const toggleDocumentUploaded = (docId: string) => {
    const doc = documents.find(d => d.id === docId);
    if (doc) {
      updateDocumentBackend(docId, {
        uploaded: !doc.uploaded,
        uploadedAt: !doc.uploaded ? new Date().toISOString() : null,
      });
    }
  };

  // Toggle task completed
  const toggleTaskCompleted = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      updateTaskBackend(taskId, { completed: !task.completed });
    }
  };

  // Delete functions
  const deleteGrant = useCallback(async (grantId: string) => {
    const confirmed = await confirm({
      title: 'Delete Grant',
      message: 'Are you sure? This will delete all associated tasks and documents.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger'
    });

    if (confirmed) {
      deleteGrantBackend(grantId);
      tasks.filter(t => t.grantId === grantId).forEach(t => deleteTaskBackend(t.id));
      documents.filter(d => d.grantId === grantId).forEach(d => deleteDocumentBackend(d.id));
      if (selectedGrantId === grantId) setSelectedGrantId(null);
    }
  }, [confirm, tasks, documents, deleteGrantBackend, deleteTaskBackend, deleteDocumentBackend, selectedGrantId]);

  // Analytics
  const analytics = useMemo(() => {
    const submitted = grants.filter(g => ['submitted', 'under_review'].includes(g.status));
    const approved = grants.filter(g => g.status === 'approved');
    const pending = grants.filter(g => ['draft', 'in_progress'].includes(g.status));
    const totalRequested = submitted.reduce((sum, g) => sum + g.amount, 0);
    const totalAwarded = approved.reduce((sum, g) => sum + g.amount, 0);

    const upcomingDeadlines = grants
      .filter(g => g.deadline && ['draft', 'in_progress'].includes(g.status))
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
      .slice(0, 5);

    const successRate = submitted.length > 0
      ? (approved.length / (approved.length + grants.filter(g => g.status === 'rejected').length)) * 100
      : 0;

    return {
      totalGrants: grants.length,
      pendingGrants: pending.length,
      submittedGrants: submitted.length,
      approvedGrants: approved.length,
      totalRequested,
      totalAwarded,
      successRate,
      upcomingDeadlines,
    };
  }, [grants]);

  // Filtered grants
  const filteredGrants = useMemo(() => {
    return grants.filter(grant => {
      const matchesSearch = searchTerm === '' ||
        grant.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        grant.funder.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || grant.status === filterStatus;
      const matchesType = filterType === 'all' || grant.funderType === filterType;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [grants, searchTerm, filterStatus, filterType]);

  // Selected grant
  const selectedGrant = selectedGrantId ? grants.find(g => g.id === selectedGrantId) : null;
  const grantTasks = selectedGrantId ? tasks.filter(t => t.grantId === selectedGrantId) : [];
  const grantDocuments = selectedGrantId ? documents.filter(d => d.grantId === selectedGrantId) : [];

  const getStatusColor = (status: GrantStatus) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      case 'in_progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'submitted': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'under_review': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'closed': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.grantApplication.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-500 rounded-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.grantApplication.grantApplicationTracker', 'Grant Application Tracker')}
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.grantApplication.trackApplicationsManageDeadlinesAnd', 'Track applications, manage deadlines, and monitor success')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="grant-application" toolName="Grant Application" />

              <SyncStatus
                isSynced={grantsSynced}
                isSaving={grantsSaving}
                lastSaved={grantsLastSaved}
                syncError={grantsSyncError}
                onForceSync={forceGrantsSync}
                theme={theme}
                showLabel={true}
                size="md"
              />
              <ExportDropdown
                onExportCSV={() => exportToCSV(filteredGrants, 'grants', GRANT_COLUMNS)}
                onExportExcel={() => exportToExcel(filteredGrants, 'grants', GRANT_COLUMNS)}
                onExportJSON={() => exportToJSON(filteredGrants, 'grants')}
                onExportPDF={() => exportToPDF(filteredGrants, 'Grant Applications', GRANT_COLUMNS)}
                onCopy={() => copyUtil(filteredGrants)}
                onPrint={() => printData(filteredGrants, 'Grant Applications', GRANT_COLUMNS)}
                theme={theme}
              />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-2 mb-1">
                <FileText className="w-4 h-4 text-blue-500" />
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.grantApplication.inProgress', 'In Progress')}</span>
              </div>
              <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {analytics.pendingGrants}
              </p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-green-500" />
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.grantApplication.requested', 'Requested')}</span>
              </div>
              <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {formatCurrency(analytics.totalRequested)}
              </p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-4 h-4 text-purple-500" />
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.grantApplication.awarded', 'Awarded')}</span>
              </div>
              <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {formatCurrency(analytics.totalAwarded)}
              </p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-4 h-4 text-orange-500" />
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.grantApplication.successRate', 'Success Rate')}</span>
              </div>
              <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {analytics.successRate.toFixed(0)}%
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {(['applications', 'pipeline', 'funders', 'calendar', 'reports'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab
                    ? 'bg-indigo-500 text-white'
                    : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Applications Tab */}
          {activeTab === 'applications' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Grant List */}
              <div className="lg:col-span-2">
                <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                  <div className="flex gap-2 flex-1">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder={t('tools.grantApplication.searchGrants', 'Search grants...')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
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
                      <option value="all">{t('tools.grantApplication.allStatus', 'All Status')}</option>
                      <option value="draft">{t('tools.grantApplication.draft', 'Draft')}</option>
                      <option value="in_progress">{t('tools.grantApplication.inProgress2', 'In Progress')}</option>
                      <option value="submitted">{t('tools.grantApplication.submitted', 'Submitted')}</option>
                      <option value="under_review">{t('tools.grantApplication.underReview', 'Under Review')}</option>
                      <option value="approved">{t('tools.grantApplication.approved', 'Approved')}</option>
                      <option value="rejected">{t('tools.grantApplication.rejected', 'Rejected')}</option>
                    </select>
                  </div>
                  <button
                    onClick={() => setShowGrantForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    {t('tools.grantApplication.addGrant', 'Add Grant')}
                  </button>
                </div>

                {/* Grant List */}
                <div className="space-y-3">
                  {filteredGrants.length === 0 ? (
                    <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>{t('tools.grantApplication.noGrantsFoundAddYour', 'No grants found. Add your first grant application to get started.')}</p>
                    </div>
                  ) : (
                    filteredGrants.map((grant) => {
                      const daysUntil = getDaysUntil(grant.deadline);
                      return (
                        <div
                          key={grant.id}
                          onClick={() => setSelectedGrantId(grant.id)}
                          className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                            selectedGrantId === grant.id
                              ? theme === 'dark'
                                ? 'bg-indigo-900/30 border-indigo-500'
                                : 'bg-indigo-50 border-indigo-500'
                              : theme === 'dark'
                              ? 'bg-gray-700 border-gray-600 hover:border-gray-500'
                              : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                  {grant.title}
                                </h4>
                                <AlertCircle className={`w-4 h-4 ${getPriorityColor(grant.priority)}`} />
                              </div>
                              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                {grant.funder}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {formatCurrency(grant.amount)}
                              </p>
                              <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(grant.status)}`}>
                                {grant.status.replace('_', ' ')}
                              </span>
                            </div>
                          </div>
                          {grant.deadline && (
                            <div className={`mt-2 flex items-center gap-1 text-sm ${
                              daysUntil !== null && daysUntil <= 7
                                ? 'text-red-500'
                                : daysUntil !== null && daysUntil <= 14
                                ? 'text-yellow-500'
                                : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              <Calendar className="w-3 h-3" />
                              Due: {formatDate(grant.deadline)}
                              {daysUntil !== null && daysUntil >= 0 && (
                                <span className="ml-1">({daysUntil} days)</span>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Grant Detail */}
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                {selectedGrant ? (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {selectedGrant.title}
                      </h3>
                      <button
                        onClick={() => deleteGrant(selectedGrant.id)}
                        className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {t('tools.grantApplication.status', 'Status')}
                        </label>
                        <select
                          value={selectedGrant.status}
                          onChange={(e) => updateGrantStatus(selectedGrant.id, e.target.value as GrantStatus)}
                          className={`w-full mt-1 px-3 py-2 rounded-lg border ${
                            theme === 'dark'
                              ? 'bg-gray-600 border-gray-500 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        >
                          <option value="draft">{t('tools.grantApplication.draft2', 'Draft')}</option>
                          <option value="in_progress">{t('tools.grantApplication.inProgress3', 'In Progress')}</option>
                          <option value="submitted">{t('tools.grantApplication.submitted2', 'Submitted')}</option>
                          <option value="under_review">{t('tools.grantApplication.underReview2', 'Under Review')}</option>
                          <option value="approved">{t('tools.grantApplication.approved2', 'Approved')}</option>
                          <option value="rejected">{t('tools.grantApplication.rejected2', 'Rejected')}</option>
                          <option value="closed">{t('tools.grantApplication.closed', 'Closed')}</option>
                        </select>
                      </div>

                      {/* Tasks */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {t('tools.grantApplication.tasks', 'Tasks')}
                          </label>
                          <button
                            onClick={() => setShowTaskForm(true)}
                            className="text-indigo-500 hover:text-indigo-600 text-sm"
                          >
                            {t('tools.grantApplication.add', '+ Add')}
                          </button>
                        </div>
                        <div className="space-y-2">
                          {grantTasks.map((task) => (
                            <div
                              key={task.id}
                              className={`flex items-center gap-2 p-2 rounded ${
                                theme === 'dark' ? 'bg-gray-600' : 'bg-white'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={task.completed}
                                onChange={() => toggleTaskCompleted(task.id)}
                                className="rounded"
                              />
                              <span className={`flex-1 text-sm ${
                                task.completed
                                  ? 'line-through text-gray-500'
                                  : theme === 'dark' ? 'text-white' : 'text-gray-900'
                              }`}>
                                {task.title}
                              </span>
                            </div>
                          ))}
                          {grantTasks.length === 0 && (
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                              {t('tools.grantApplication.noTasksYet', 'No tasks yet')}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Documents */}
                      <div>
                        <label className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {t('tools.grantApplication.documents', 'Documents')}
                        </label>
                        <div className="space-y-2 mt-2">
                          {grantDocuments.map((doc) => (
                            <div
                              key={doc.id}
                              className={`flex items-center gap-2 p-2 rounded ${
                                theme === 'dark' ? 'bg-gray-600' : 'bg-white'
                              }`}
                            >
                              <button
                                onClick={() => toggleDocumentUploaded(doc.id)}
                                className={doc.uploaded ? 'text-green-500' : 'text-gray-400'}
                              >
                                {doc.uploaded ? <CheckCircle className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
                              </button>
                              <span className={`flex-1 text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {doc.name}
                              </span>
                              {doc.required && (
                                <span className="text-xs text-red-500">{t('tools.grantApplication.required', 'Required')}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    <FileCheck className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>{t('tools.grantApplication.selectAGrantToView', 'Select a grant to view details')}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Pipeline Tab */}
          {activeTab === 'pipeline' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {['draft', 'in_progress', 'submitted', 'approved'].map((status) => {
                const statusGrants = grants.filter(g => g.status === status);
                return (
                  <div key={status} className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <h4 className={`font-medium mb-3 capitalize ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {status.replace('_', ' ')} ({statusGrants.length})
                    </h4>
                    <div className="space-y-2">
                      {statusGrants.map((grant) => (
                        <div
                          key={grant.id}
                          className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-600' : 'bg-white'}`}
                        >
                          <p className={`font-medium text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {grant.title}
                          </p>
                          <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            {formatCurrency(grant.amount)}
                          </p>
                        </div>
                      ))}
                      {statusGrants.length === 0 && (
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                          {t('tools.grantApplication.noGrants', 'No grants')}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Funders Tab */}
          {activeTab === 'funders' && (
            <div>
              <div className="flex justify-end mb-6">
                <button
                  onClick={() => setShowFunderForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.grantApplication.addFunder', 'Add Funder')}
                </button>
              </div>

              <div className="space-y-3">
                {funders.length === 0 ? (
                  <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>{t('tools.grantApplication.noFundersYetAddFunders', 'No funders yet. Add funders to track potential grant sources.')}</p>
                  </div>
                ) : (
                  funders.map((funder) => (
                    <div
                      key={funder.id}
                      className={`p-4 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {funder.name}
                          </h4>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {GRANT_TYPES.find(t => t.value === funder.type)?.label} | Avg: {formatCurrency(funder.avgGrantSize)}
                          </p>
                        </div>
                        <button
                          onClick={() => deleteFunderBackend(funder.id)}
                          className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      {funder.focusAreas.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {funder.focusAreas.map((area) => (
                            <span
                              key={area}
                              className={`px-2 py-0.5 text-xs rounded-full ${
                                theme === 'dark' ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
                              }`}
                            >
                              {area}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Calendar Tab */}
          {activeTab === 'calendar' && (
            <div>
              <h3 className={`text-lg font-medium mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.grantApplication.upcomingDeadlines', 'Upcoming Deadlines')}
              </h3>
              <div className="space-y-3">
                {analytics.upcomingDeadlines.map((grant) => {
                  const daysUntil = getDaysUntil(grant.deadline);
                  return (
                    <div
                      key={grant.id}
                      className={`p-4 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {grant.title}
                          </h4>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {grant.funder}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`font-medium ${
                            daysUntil !== null && daysUntil <= 7 ? 'text-red-500' :
                            daysUntil !== null && daysUntil <= 14 ? 'text-yellow-500' :
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}>
                            {formatDate(grant.deadline)}
                          </p>
                          {daysUntil !== null && (
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days`}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {analytics.upcomingDeadlines.length === 0 && (
                  <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>{t('tools.grantApplication.noUpcomingDeadlines', 'No upcoming deadlines')}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h4 className={`font-medium mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.grantApplication.byFunderType', 'By Funder Type')}
                </h4>
                <div className="space-y-3">
                  {GRANT_TYPES.map((type) => {
                    const typeGrants = grants.filter(g => g.funderType === type.value);
                    const total = typeGrants.reduce((sum, g) => sum + g.amount, 0);
                    return (
                      <div key={type.value} className="flex justify-between items-center">
                        <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{type.label}</span>
                        <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {formatCurrency(total)} ({typeGrants.length})
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h4 className={`font-medium mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.grantApplication.byStatus', 'By Status')}
                </h4>
                <div className="space-y-3">
                  {['draft', 'in_progress', 'submitted', 'under_review', 'approved', 'rejected'].map((status) => {
                    const statusGrants = grants.filter(g => g.status === status);
                    const total = statusGrants.reduce((sum, g) => sum + g.amount, 0);
                    return (
                      <div key={status} className="flex justify-between items-center">
                        <span className={`capitalize ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          {status.replace('_', ' ')}
                        </span>
                        <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {formatCurrency(total)} ({statusGrants.length})
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Grant Form Modal */}
        {showGrantForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto`}>
              <h3 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.grantApplication.addNewGrantApplication', 'Add New Grant Application')}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.grantApplication.grantTitle', 'Grant Title *')}
                  </label>
                  <input
                    type="text"
                    value={newGrant.title}
                    onChange={(e) => setNewGrant({ ...newGrant, title: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.grantApplication.funderName', 'Funder Name *')}
                    </label>
                    <input
                      type="text"
                      value={newGrant.funder}
                      onChange={(e) => setNewGrant({ ...newGrant, funder: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.grantApplication.funderType', 'Funder Type')}
                    </label>
                    <select
                      value={newGrant.funderType}
                      onChange={(e) => setNewGrant({ ...newGrant, funderType: e.target.value as GrantType })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      {GRANT_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.grantApplication.amount', 'Amount')}
                    </label>
                    <input
                      type="number"
                      value={newGrant.amount || ''}
                      onChange={(e) => setNewGrant({ ...newGrant, amount: parseFloat(e.target.value) || 0 })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      min="0"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.grantApplication.deadline', 'Deadline')}
                    </label>
                    <input
                      type="date"
                      value={newGrant.deadline}
                      onChange={(e) => setNewGrant({ ...newGrant, deadline: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.grantApplication.priority', 'Priority')}
                    </label>
                    <select
                      value={newGrant.priority}
                      onChange={(e) => setNewGrant({ ...newGrant, priority: e.target.value as Priority })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="high">{t('tools.grantApplication.high', 'High')}</option>
                      <option value="medium">{t('tools.grantApplication.medium', 'Medium')}</option>
                      <option value="low">{t('tools.grantApplication.low', 'Low')}</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.grantApplication.program', 'Program')}
                    </label>
                    <input
                      type="text"
                      value={newGrant.program}
                      onChange={(e) => setNewGrant({ ...newGrant, program: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.grantApplication.description', 'Description')}
                  </label>
                  <textarea
                    value={newGrant.description}
                    onChange={(e) => setNewGrant({ ...newGrant, description: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowGrantForm(false)}
                  className={`flex-1 px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {t('tools.grantApplication.cancel', 'Cancel')}
                </button>
                <button
                  onClick={addGrant}
                  className="flex-1 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
                >
                  {t('tools.grantApplication.addGrant2', 'Add Grant')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Task Form Modal */}
        {showTaskForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-full max-w-md`}>
              <h3 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.grantApplication.addTask', 'Add Task')}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.grantApplication.taskTitle', 'Task Title *')}
                  </label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.grantApplication.assignee', 'Assignee')}
                  </label>
                  <input
                    type="text"
                    value={newTask.assignee}
                    onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.grantApplication.dueDate', 'Due Date')}
                  </label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowTaskForm(false)}
                  className={`flex-1 px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {t('tools.grantApplication.cancel2', 'Cancel')}
                </button>
                <button
                  onClick={addTask}
                  className="flex-1 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
                >
                  {t('tools.grantApplication.addTask2', 'Add Task')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Funder Form Modal */}
        {showFunderForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto`}>
              <h3 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.grantApplication.addFunder2', 'Add Funder')}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.grantApplication.name', 'Name *')}
                  </label>
                  <input
                    type="text"
                    value={newFunder.name}
                    onChange={(e) => setNewFunder({ ...newFunder, name: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.grantApplication.type', 'Type')}
                  </label>
                  <select
                    value={newFunder.type}
                    onChange={(e) => setNewFunder({ ...newFunder, type: e.target.value as GrantType })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    {GRANT_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.grantApplication.averageGrantSize', 'Average Grant Size')}
                  </label>
                  <input
                    type="number"
                    value={newFunder.avgGrantSize || ''}
                    onChange={(e) => setNewFunder({ ...newFunder, avgGrantSize: parseFloat(e.target.value) || 0 })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    min="0"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.grantApplication.focusAreas', 'Focus Areas')}
                  </label>
                  <div className="flex flex-wrap gap-2 p-2 border rounded-lg max-h-32 overflow-y-auto">
                    {FOCUS_AREAS.map((area) => (
                      <button
                        key={area}
                        type="button"
                        onClick={() => {
                          const areas = newFunder.focusAreas || [];
                          if (areas.includes(area)) {
                            setNewFunder({ ...newFunder, focusAreas: areas.filter(a => a !== area) });
                          } else {
                            setNewFunder({ ...newFunder, focusAreas: [...areas, area] });
                          }
                        }}
                        className={`px-2 py-1 text-xs rounded-full ${
                          newFunder.focusAreas?.includes(area)
                            ? 'bg-indigo-500 text-white'
                            : theme === 'dark'
                            ? 'bg-gray-600 text-gray-300'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {area}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowFunderForm(false)}
                  className={`flex-1 px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {t('tools.grantApplication.cancel3', 'Cancel')}
                </button>
                <button
                  onClick={addFunder}
                  className="flex-1 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
                >
                  {t('tools.grantApplication.addFunder3', 'Add Funder')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Validation Message Toast */}
        {validationMessage && (
          <div className="fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-in fade-in slide-in-from-bottom-4">
            <AlertCircle className="w-5 h-5" />
            <span>{validationMessage}</span>
          </div>
        )}

        <ConfirmDialog />
      </div>
    </div>
  );
};

export default GrantApplicationTool;
