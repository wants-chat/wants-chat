'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FileText,
  Plus,
  Trash2,
  Save,
  Download,
  Edit,
  Calendar,
  Target,
  User,
  Building2,
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
  Filter,
  Eye,
  Copy,
  X,
  Sparkles,
  FolderOpen,
  ListChecks,
  AlertTriangle,
  Milestone,
} from 'lucide-react';
import { UIConfig } from '../ContextualUI';
import { useConfirmDialog } from '../ui/ConfirmDialog';
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

interface ProjectScopeToolProps {
  uiConfig?: UIConfig;
}

import { useTheme } from '@/contexts/ThemeContext';

// Types
interface Milestone {
  id: string;
  name: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'in-progress' | 'completed';
}

interface Requirement {
  id: string;
  category: 'functional' | 'technical' | 'business' | 'compliance';
  description: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'approved' | 'implemented';
}

interface Exclusion {
  id: string;
  description: string;
}

interface Assumption {
  id: string;
  description: string;
}

interface Risk {
  id: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  probability: 'high' | 'medium' | 'low';
  mitigation: string;
}

interface ProjectScope {
  id: string;
  projectName: string;
  clientName: string;
  clientCompany: string;
  projectManager: string;
  version: string;
  status: 'draft' | 'review' | 'approved' | 'active' | 'closed';
  overview: string;
  objectives: string[];
  inScope: string[];
  outOfScope: string[];
  milestones: Milestone[];
  requirements: Requirement[];
  assumptions: Assumption[];
  constraints: string[];
  risks: Risk[];
  acceptanceCriteria: string[];
  startDate: string;
  endDate: string;
  budget: number;
  approvedBy: string | null;
  approvedDate: string | null;
  createdAt: string;
  updatedAt: string;
}

// Constants
const STATUS_COLORS = {
  draft: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-700 dark:text-gray-300', icon: Edit },
  review: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', icon: Eye },
  approved: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', icon: CheckCircle },
  active: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', icon: Clock },
  closed: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400', icon: CheckCircle },
};

const PRIORITY_COLORS = {
  high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
};

// Column configuration for exports
const SCOPE_COLUMNS: ColumnConfig[] = [
  { key: 'projectName', header: 'Project Name', type: 'string' },
  { key: 'clientCompany', header: 'Client', type: 'string' },
  { key: 'projectManager', header: 'Project Manager', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'startDate', header: 'Start Date', type: 'date' },
  { key: 'endDate', header: 'End Date', type: 'date' },
  { key: 'budget', header: 'Budget', type: 'currency' },
  { key: 'version', header: 'Version', type: 'string' },
  { key: 'createdAt', header: 'Created', type: 'date' },
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
  if (!dateString) return 'Not set';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Main Component
export const ProjectScopeTool: React.FC<ProjectScopeToolProps> = ({ uiConfig }) => {
  const [isPrefilled, setIsPrefilled] = useState(false);
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // useToolData hooks for backend sync
  const {
    data: scopes,
    addItem: addScopeToBackend,
    updateItem: updateScopeBackend,
    deleteItem: deleteScopeBackend,
    isSynced: scopesSynced,
    isSaving: scopesSaving,
    lastSaved: scopesLastSaved,
    syncError: scopesSyncError,
    forceSync: forceScopesSync,
  } = useToolData<ProjectScope>('project-scopes', [], SCOPE_COLUMNS);

  // Local UI State
  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');
  const [selectedScope, setSelectedScope] = useState<ProjectScope | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // New scope form state
  const [newScope, setNewScope] = useState<Partial<ProjectScope>>({
    projectName: '',
    clientName: '',
    clientCompany: '',
    projectManager: '',
    version: '1.0',
    status: 'draft',
    overview: '',
    objectives: [''],
    inScope: [''],
    outOfScope: [''],
    milestones: [],
    requirements: [],
    assumptions: [{ id: generateId(), description: '' }],
    constraints: [''],
    risks: [],
    acceptanceCriteria: [''],
    startDate: '',
    endDate: '',
    budget: 0,
  });

  // Prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params;
      if (params.projectName || params.client) {
        setNewScope({
          ...newScope,
          projectName: params.projectName || '',
          clientName: params.clientContact || '',
          clientCompany: params.client || params.clientCompany || '',
          overview: params.description || '',
        });
        setActiveTab('create');
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Add list item helper
  const addListItem = (field: 'objectives' | 'inScope' | 'outOfScope' | 'constraints' | 'acceptanceCriteria') => {
    setNewScope({ ...newScope, [field]: [...(newScope[field] || []), ''] });
  };

  const updateListItem = (field: 'objectives' | 'inScope' | 'outOfScope' | 'constraints' | 'acceptanceCriteria', index: number, value: string) => {
    const updated = [...(newScope[field] || [])];
    updated[index] = value;
    setNewScope({ ...newScope, [field]: updated });
  };

  const removeListItem = (field: 'objectives' | 'inScope' | 'outOfScope' | 'constraints' | 'acceptanceCriteria', index: number) => {
    const updated = [...(newScope[field] || [])];
    updated.splice(index, 1);
    setNewScope({ ...newScope, [field]: updated });
  };

  // Add milestone
  const addMilestone = () => {
    const milestone: Milestone = {
      id: generateId(),
      name: '',
      description: '',
      dueDate: '',
      status: 'pending',
    };
    setNewScope({ ...newScope, milestones: [...(newScope.milestones || []), milestone] });
  };

  // Update milestone
  const updateMilestone = (index: number, field: keyof Milestone, value: string) => {
    const updated = [...(newScope.milestones || [])];
    updated[index] = { ...updated[index], [field]: value };
    setNewScope({ ...newScope, milestones: updated });
  };

  // Remove milestone
  const removeMilestone = (index: number) => {
    const updated = [...(newScope.milestones || [])];
    updated.splice(index, 1);
    setNewScope({ ...newScope, milestones: updated });
  };

  // Add requirement
  const addRequirement = () => {
    const requirement: Requirement = {
      id: generateId(),
      category: 'functional',
      description: '',
      priority: 'medium',
      status: 'pending',
    };
    setNewScope({ ...newScope, requirements: [...(newScope.requirements || []), requirement] });
  };

  // Add risk
  const addRisk = () => {
    const risk: Risk = {
      id: generateId(),
      description: '',
      impact: 'medium',
      probability: 'medium',
      mitigation: '',
    };
    setNewScope({ ...newScope, risks: [...(newScope.risks || []), risk] });
  };

  // Save scope
  const saveScope = () => {
    if (!newScope.projectName || !newScope.clientCompany) {
      setValidationMessage('Please enter project name and client');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const scope: ProjectScope = {
      id: generateId(),
      projectName: newScope.projectName || '',
      clientName: newScope.clientName || '',
      clientCompany: newScope.clientCompany || '',
      projectManager: newScope.projectManager || '',
      version: newScope.version || '1.0',
      status: 'draft',
      overview: newScope.overview || '',
      objectives: (newScope.objectives || []).filter((o) => o.trim()),
      inScope: (newScope.inScope || []).filter((s) => s.trim()),
      outOfScope: (newScope.outOfScope || []).filter((s) => s.trim()),
      milestones: (newScope.milestones || []).filter((m) => m.name.trim()),
      requirements: (newScope.requirements || []).filter((r) => r.description.trim()),
      assumptions: (newScope.assumptions || []).filter((a) => a.description.trim()),
      constraints: (newScope.constraints || []).filter((c) => c.trim()),
      risks: (newScope.risks || []).filter((r) => r.description.trim()),
      acceptanceCriteria: (newScope.acceptanceCriteria || []).filter((c) => c.trim()),
      startDate: newScope.startDate || '',
      endDate: newScope.endDate || '',
      budget: newScope.budget || 0,
      approvedBy: null,
      approvedDate: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addScopeToBackend(scope);
    resetForm();
    setActiveTab('list');
  };

  // Reset form
  const resetForm = () => {
    setNewScope({
      projectName: '',
      clientName: '',
      clientCompany: '',
      projectManager: '',
      version: '1.0',
      status: 'draft',
      overview: '',
      objectives: [''],
      inScope: [''],
      outOfScope: [''],
      milestones: [],
      requirements: [],
      assumptions: [{ id: generateId(), description: '' }],
      constraints: [''],
      risks: [],
      acceptanceCriteria: [''],
      startDate: '',
      endDate: '',
      budget: 0,
    });
  };

  // Delete scope
  const deleteScope = async (id: string) => {
    const confirmed = await confirm({
      title: 'Confirm Action',
      message: 'Are you sure you want to delete this project scope document?',
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (!confirmed) return;
    deleteScopeBackend(id);
  };

  // Update scope status
  const updateScopeStatus = (scopeId: string, status: ProjectScope['status']) => {
    const updates: Partial<ProjectScope> = {
      status,
      updatedAt: new Date().toISOString(),
    };
    if (status === 'approved') {
      updates.approvedDate = new Date().toISOString();
    }
    updateScopeBackend(scopeId, updates);
  };

  // Filtered scopes
  const filteredScopes = useMemo(() => {
    return scopes.filter((scope) => {
      const matchesSearch =
        searchTerm === '' ||
        scope.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        scope.clientCompany.toLowerCase().includes(searchTerm.toLowerCase()) ||
        scope.projectManager.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || scope.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [scopes, searchTerm, filterStatus]);

  // Stats
  const stats = useMemo(() => {
    const total = scopes.length;
    const draft = scopes.filter((s) => s.status === 'draft').length;
    const active = scopes.filter((s) => s.status === 'active').length;
    const approved = scopes.filter((s) => s.status === 'approved').length;
    const totalBudget = scopes.filter((s) => s.status === 'active' || s.status === 'approved').reduce((sum, s) => sum + s.budget, 0);
    return { total, draft, active, approved, totalBudget };
  }, [scopes]);

  return (
    <>
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.projectScope.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <FolderOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.projectScope.projectScopeManager', 'Project Scope Manager')}
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.projectScope.defineAndManageProjectScope', 'Define and manage project scope documentation')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="project-scope" toolName="Project Scope" />

              <SyncStatus
                isSynced={scopesSynced}
                isSaving={scopesSaving}
                lastSaved={scopesLastSaved}
                syncError={scopesSyncError}
                onForceSync={forceScopesSync}
                theme={theme}
                showLabel={true}
                size="md"
              />
              <ExportDropdown
                onExportCSV={() => {
                  exportToCSV(scopes, SCOPE_COLUMNS, { filename: 'project-scopes' });
                }}
                onExportExcel={() => {
                  exportToExcel(scopes, SCOPE_COLUMNS, { filename: 'project-scopes' });
                }}
                onExportJSON={() => {
                  exportToJSON(scopes, { filename: 'project-scopes' });
                }}
                onExportPDF={async () => {
                  await exportToPDF(scopes, SCOPE_COLUMNS, {
                    filename: 'project-scopes',
                    title: 'Project Scope Documents',
                    subtitle: `${scopes.length} projects | ${formatCurrency(stats.totalBudget)} total budget`,
                  });
                }}
                onPrint={() => {
                  printData(scopes, SCOPE_COLUMNS, { title: 'Project Scopes' });
                }}
                onCopyToClipboard={async () => {
                  return await copyUtil(scopes, SCOPE_COLUMNS, 'tab');
                }}
                showImport={false}
                theme={theme}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.projectScope.totalProjects', 'Total Projects')}</p>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stats.total}</p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.projectScope.drafts', 'Drafts')}</p>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stats.draft}</p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.projectScope.approved', 'Approved')}</p>
              <p className={`text-2xl font-bold text-green-600`}>{stats.approved}</p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.projectScope.active', 'Active')}</p>
              <p className={`text-2xl font-bold text-blue-600`}>{stats.active}</p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.projectScope.totalBudget', 'Total Budget')}</p>
              <p className={`text-2xl font-bold text-[#0D9488]`}>{formatCurrency(stats.totalBudget)}</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'list', label: 'Scope Documents', icon: <FileText className="w-4 h-4" /> },
              { id: 'create', label: 'Create New', icon: <Plus className="w-4 h-4" /> },
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

        {/* List Tab */}
        {activeTab === 'list' && (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            {/* Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                  <input
                    type="text"
                    placeholder={t('tools.projectScope.searchProjects', 'Search projects...')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`pl-10 pr-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
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
                  <option value="all">{t('tools.projectScope.allStatus', 'All Status')}</option>
                  <option value="draft">{t('tools.projectScope.draft', 'Draft')}</option>
                  <option value="review">{t('tools.projectScope.inReview', 'In Review')}</option>
                  <option value="approved">{t('tools.projectScope.approved2', 'Approved')}</option>
                  <option value="active">{t('tools.projectScope.active2', 'Active')}</option>
                  <option value="closed">{t('tools.projectScope.closed', 'Closed')}</option>
                </select>
              </div>
              <button
                onClick={() => setActiveTab('create')}
                className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7A6E] transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t('tools.projectScope.newScopeDocument', 'New Scope Document')}
              </button>
            </div>

            {/* Scopes List */}
            <div className="space-y-4">
              {filteredScopes.length === 0 ? (
                <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  <FolderOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{t('tools.projectScope.noProjectScopeDocumentsFound', 'No project scope documents found')}</p>
                  <button
                    onClick={() => setActiveTab('create')}
                    className="mt-4 text-[#0D9488] hover:underline"
                  >
                    {t('tools.projectScope.createYourFirstScopeDocument', 'Create your first scope document')}
                  </button>
                </div>
              ) : (
                filteredScopes.map((scope) => {
                  const StatusIcon = STATUS_COLORS[scope.status].icon;
                  const milestonesCount = scope.milestones.length;
                  const completedMilestones = scope.milestones.filter((m) => m.status === 'completed').length;
                  const requirementsCount = scope.requirements.length;
                  const risksCount = scope.risks.length;

                  return (
                    <div
                      key={scope.id}
                      className={`p-4 rounded-lg border ${
                        theme === 'dark' ? 'border-gray-700 hover:bg-gray-700/50' : 'border-gray-200 hover:bg-gray-50'
                      } transition-colors`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {scope.projectName}
                            </h3>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${theme === 'dark' ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
                              v{scope.version}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${STATUS_COLORS[scope.status].bg} ${STATUS_COLORS[scope.status].text}`}>
                              <StatusIcon className="w-3 h-3" />
                              {scope.status.charAt(0).toUpperCase() + scope.status.slice(1)}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-sm">
                            <span className={`flex items-center gap-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              <Building2 className="w-4 h-4" />
                              {scope.clientCompany}
                            </span>
                            <span className={`flex items-center gap-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              <User className="w-4 h-4" />
                              {scope.projectManager || 'No PM assigned'}
                            </span>
                            <span className={`flex items-center gap-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              <Calendar className="w-4 h-4" />
                              {formatDate(scope.startDate)} - {formatDate(scope.endDate)}
                            </span>
                            <span className={`flex items-center gap-1 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                              {formatCurrency(scope.budget)}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-4 mt-2 text-xs">
                            <span className={`flex items-center gap-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                              <Milestone className="w-3 h-3" />
                              {completedMilestones}/{milestonesCount} Milestones
                            </span>
                            <span className={`flex items-center gap-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                              <ListChecks className="w-3 h-3" />
                              {requirementsCount} Requirements
                            </span>
                            {risksCount > 0 && (
                              <span className={`flex items-center gap-1 ${theme === 'dark' ? 'text-orange-400' : 'text-orange-600'}`}>
                                <AlertTriangle className="w-3 h-3" />
                                {risksCount} Risks
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {scope.status === 'draft' && (
                            <button
                              onClick={() => updateScopeStatus(scope.id, 'review')}
                              className="p-2 text-yellow-600 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 rounded-lg transition-colors"
                              title={t('tools.projectScope.submitForReview', 'Submit for Review')}
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}
                          {scope.status === 'review' && (
                            <button
                              onClick={() => updateScopeStatus(scope.id, 'approved')}
                              className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                              title={t('tools.projectScope.approve', 'Approve')}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedScope(scope)}
                            className={`p-2 rounded-lg transition-colors ${
                              theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
                            }`}
                            title={t('tools.projectScope.viewDetails', 'View Details')}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteScope(scope.id)}
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

        {/* Create Tab */}
        {activeTab === 'create' && (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <h2 className={`text-xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.projectScope.createProjectScopeDocument', 'Create Project Scope Document')}
            </h2>

            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.projectScope.projectName', 'Project Name *')}
                  </label>
                  <input
                    type="text"
                    value={newScope.projectName}
                    onChange={(e) => setNewScope({ ...newScope, projectName: e.target.value })}
                    placeholder={t('tools.projectScope.eGErpSystemImplementation', 'e.g., ERP System Implementation')}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.projectScope.clientCompany', 'Client Company *')}
                  </label>
                  <input
                    type="text"
                    value={newScope.clientCompany}
                    onChange={(e) => setNewScope({ ...newScope, clientCompany: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.projectScope.clientContact', 'Client Contact')}
                  </label>
                  <input
                    type="text"
                    value={newScope.clientName}
                    onChange={(e) => setNewScope({ ...newScope, clientName: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.projectScope.projectManager', 'Project Manager')}
                  </label>
                  <input
                    type="text"
                    value={newScope.projectManager}
                    onChange={(e) => setNewScope({ ...newScope, projectManager: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>

              {/* Dates and Budget */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.projectScope.startDate', 'Start Date')}
                  </label>
                  <input
                    type="date"
                    value={newScope.startDate}
                    onChange={(e) => setNewScope({ ...newScope, startDate: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.projectScope.endDate', 'End Date')}
                  </label>
                  <input
                    type="date"
                    value={newScope.endDate}
                    onChange={(e) => setNewScope({ ...newScope, endDate: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.projectScope.budget', 'Budget ($)')}
                  </label>
                  <input
                    type="number"
                    value={newScope.budget}
                    onChange={(e) => setNewScope({ ...newScope, budget: parseFloat(e.target.value) || 0 })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>

              {/* Overview */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.projectScope.projectOverview', 'Project Overview')}
                </label>
                <textarea
                  value={newScope.overview}
                  onChange={(e) => setNewScope({ ...newScope, overview: e.target.value })}
                  rows={4}
                  placeholder={t('tools.projectScope.provideAHighLevelDescription', 'Provide a high-level description of the project...')}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>

              {/* Objectives */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.projectScope.projectObjectives', 'Project Objectives')}
                  </label>
                  <button
                    onClick={() => addListItem('objectives')}
                    className="text-sm text-[#0D9488] hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Objective
                  </button>
                </div>
                <div className="space-y-2">
                  {(newScope.objectives || []).map((obj, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={obj}
                        onChange={(e) => updateListItem('objectives', index, e.target.value)}
                        placeholder={`Objective ${index + 1}`}
                        className={`flex-1 px-4 py-2 rounded-lg border ${
                          theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                      <button
                        onClick={() => removeListItem('objectives', index)}
                        className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* In Scope */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.projectScope.inScope2', 'In Scope')}
                  </label>
                  <button
                    onClick={() => addListItem('inScope')}
                    className="text-sm text-[#0D9488] hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Item
                  </button>
                </div>
                <div className="space-y-2">
                  {(newScope.inScope || []).map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => updateListItem('inScope', index, e.target.value)}
                        placeholder={t('tools.projectScope.whatIsIncludedInThe', 'What is included in the project scope')}
                        className={`flex-1 px-4 py-2 rounded-lg border ${
                          theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                      <button
                        onClick={() => removeListItem('inScope', index)}
                        className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Out of Scope */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.projectScope.outOfScope2', 'Out of Scope')}
                  </label>
                  <button
                    onClick={() => addListItem('outOfScope')}
                    className="text-sm text-[#0D9488] hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Item
                  </button>
                </div>
                <div className="space-y-2">
                  {(newScope.outOfScope || []).map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => updateListItem('outOfScope', index, e.target.value)}
                        placeholder={t('tools.projectScope.whatIsNotIncludedIn', 'What is NOT included in the project scope')}
                        className={`flex-1 px-4 py-2 rounded-lg border ${
                          theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                      <button
                        onClick={() => removeListItem('outOfScope', index)}
                        className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Milestones */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.projectScope.projectMilestones', 'Project Milestones')}
                  </label>
                  <button
                    onClick={addMilestone}
                    className="text-sm text-[#0D9488] hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Milestone
                  </button>
                </div>
                <div className="space-y-3">
                  {(newScope.milestones || []).map((milestone, index) => (
                    <div key={milestone.id} className={`p-4 rounded-lg border ${theme === 'dark' ? 'border-gray-600 bg-gray-700/50' : 'border-gray-200 bg-gray-50'}`}>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <input
                          type="text"
                          value={milestone.name}
                          onChange={(e) => updateMilestone(index, 'name', e.target.value)}
                          placeholder={t('tools.projectScope.milestoneName', 'Milestone name')}
                          className={`px-4 py-2 rounded-lg border ${
                            theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        />
                        <input
                          type="date"
                          value={milestone.dueDate}
                          onChange={(e) => updateMilestone(index, 'dueDate', e.target.value)}
                          className={`px-4 py-2 rounded-lg border ${
                            theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        />
                        <div className="flex gap-2">
                          <select
                            value={milestone.status}
                            onChange={(e) => updateMilestone(index, 'status', e.target.value)}
                            className={`flex-1 px-4 py-2 rounded-lg border ${
                              theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          >
                            <option value="pending">{t('tools.projectScope.pending', 'Pending')}</option>
                            <option value="in-progress">{t('tools.projectScope.inProgress', 'In Progress')}</option>
                            <option value="completed">{t('tools.projectScope.completed', 'Completed')}</option>
                          </select>
                          <button
                            onClick={() => removeMilestone(index)}
                            className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={resetForm}
                  className={`px-4 py-2 rounded-lg ${
                    theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {t('tools.projectScope.reset', 'Reset')}
                </button>
                <button
                  onClick={saveScope}
                  className="px-6 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7A6E] transition-colors flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {t('tools.projectScope.saveScopeDocument', 'Save Scope Document')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Scope Detail Modal */}
        {selectedScope && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto`}>
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {selectedScope.projectName}
                    </h2>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Version {selectedScope.version} | {selectedScope.clientCompany}
                    </p>
                  </div>
                  <button onClick={() => setSelectedScope(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-6">
                {selectedScope.overview && (
                  <div>
                    <h3 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.projectScope.overview', 'Overview')}</h3>
                    <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{selectedScope.overview}</p>
                  </div>
                )}
                {selectedScope.objectives.length > 0 && (
                  <div>
                    <h3 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.projectScope.objectives', 'Objectives')}</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {selectedScope.objectives.map((obj, i) => (
                        <li key={i} className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{obj}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {selectedScope.inScope.length > 0 && (
                    <div>
                      <h3 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.projectScope.inScope', 'In Scope')}</h3>
                      <ul className="list-disc list-inside space-y-1">
                        {selectedScope.inScope.map((item, i) => (
                          <li key={i} className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {selectedScope.outOfScope.length > 0 && (
                    <div>
                      <h3 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.projectScope.outOfScope', 'Out of Scope')}</h3>
                      <ul className="list-disc list-inside space-y-1">
                        {selectedScope.outOfScope.map((item, i) => (
                          <li key={i} className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                {selectedScope.milestones.length > 0 && (
                  <div>
                    <h3 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.projectScope.milestones', 'Milestones')}</h3>
                    <div className="space-y-2">
                      {selectedScope.milestones.map((milestone) => (
                        <div key={milestone.id} className={`flex items-center justify-between p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                          <div>
                            <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{milestone.name}</p>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Due: {formatDate(milestone.dueDate)}</p>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs ${
                            milestone.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                            milestone.status === 'in-progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                            'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300'
                          }`}>
                            {milestone.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                <button
                  onClick={() => setSelectedScope(null)}
                  className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7A6E] transition-colors"
                >
                  {t('tools.projectScope.close', 'Close')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    <ConfirmDialog />
    {validationMessage && (
      <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50">
        {validationMessage}
      </div>
    )}
    </>
  );
};

export default ProjectScopeTool;
