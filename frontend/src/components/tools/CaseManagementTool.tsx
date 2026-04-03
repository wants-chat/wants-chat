'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  Briefcase,
  Scale,
  User,
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
  FileText,
  DollarSign,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Tag,
  FolderOpen,
  Gavel,
  Building2,
  Phone,
  Mail,
  MapPin,
  Hash,
} from 'lucide-react';
import { UIConfig } from '../ContextualUI';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import useToolData from '../../hooks/useToolData';
import { type ColumnConfig } from '../../lib/toolDataUtils';

interface CaseManagementToolProps {
  uiConfig?: UIConfig;
}

// Types
type CaseStatus = 'intake' | 'active' | 'discovery' | 'trial-prep' | 'trial' | 'appeal' | 'closed' | 'settled';
type CaseType = 'civil' | 'criminal' | 'family' | 'corporate' | 'real-estate' | 'immigration' | 'bankruptcy' | 'personal-injury' | 'employment' | 'intellectual-property' | 'other';
type Priority = 'low' | 'medium' | 'high' | 'urgent';
type BillingType = 'hourly' | 'contingency' | 'flat-fee' | 'retainer' | 'pro-bono';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  type: 'individual' | 'business';
  companyName?: string;
}

interface LegalCase {
  id: string;
  caseNumber: string;
  caseName: string;
  // Client Info
  clientId: string;
  clientName: string;
  opposingParty: string;
  opposingCounsel?: string;
  // Case Details
  caseType: CaseType;
  status: CaseStatus;
  priority: Priority;
  description: string;
  // Court Info
  courtName?: string;
  courtCaseNumber?: string;
  judgeName?: string;
  jurisdiction?: string;
  // Team
  leadAttorney: string;
  assignedAttorneys: string[];
  paralegal?: string;
  // Dates
  openDate: string;
  statueOfLimitations?: string;
  nextDeadline?: string;
  nextHearing?: string;
  trialDate?: string;
  closeDate?: string;
  // Billing
  billingType: BillingType;
  billingRate?: number;
  contingencyPercent?: number;
  retainerAmount?: number;
  totalBilled: number;
  totalPaid: number;
  // Notes
  notes: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface CaseActivity {
  id: string;
  caseId: string;
  type: 'note' | 'filing' | 'hearing' | 'deadline' | 'billing' | 'communication';
  description: string;
  date: string;
  createdBy: string;
  createdAt: string;
}

// Constants
const STATUS_OPTIONS: { value: CaseStatus; label: string; color: string }[] = [
  { value: 'intake', label: 'Intake', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' },
  { value: 'active', label: 'Active', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  { value: 'discovery', label: 'Discovery', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
  { value: 'trial-prep', label: 'Trial Prep', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
  { value: 'trial', label: 'Trial', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
  { value: 'appeal', label: 'Appeal', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
  { value: 'closed', label: 'Closed', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
  { value: 'settled', label: 'Settled', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
];

const CASE_TYPE_OPTIONS: { value: CaseType; label: string }[] = [
  { value: 'civil', label: 'Civil Litigation' },
  { value: 'criminal', label: 'Criminal Defense' },
  { value: 'family', label: 'Family Law' },
  { value: 'corporate', label: 'Corporate Law' },
  { value: 'real-estate', label: 'Real Estate' },
  { value: 'immigration', label: 'Immigration' },
  { value: 'bankruptcy', label: 'Bankruptcy' },
  { value: 'personal-injury', label: 'Personal Injury' },
  { value: 'employment', label: 'Employment Law' },
  { value: 'intellectual-property', label: 'Intellectual Property' },
  { value: 'other', label: 'Other' },
];

const PRIORITY_OPTIONS: { value: Priority; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: 'text-gray-500' },
  { value: 'medium', label: 'Medium', color: 'text-blue-500' },
  { value: 'high', label: 'High', color: 'text-orange-500' },
  { value: 'urgent', label: 'Urgent', color: 'text-red-500' },
];

const BILLING_TYPE_OPTIONS: { value: BillingType; label: string }[] = [
  { value: 'hourly', label: 'Hourly' },
  { value: 'contingency', label: 'Contingency' },
  { value: 'flat-fee', label: 'Flat Fee' },
  { value: 'retainer', label: 'Retainer' },
  { value: 'pro-bono', label: 'Pro Bono' },
];

// Column configuration for exports
const CASE_COLUMNS: ColumnConfig[] = [
  { key: 'caseNumber', header: 'Case #', type: 'string' },
  { key: 'caseName', header: 'Case Name', type: 'string' },
  { key: 'clientName', header: 'Client', type: 'string' },
  { key: 'caseType', header: 'Type', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'priority', header: 'Priority', type: 'string' },
  { key: 'leadAttorney', header: 'Lead Attorney', type: 'string' },
  { key: 'courtName', header: 'Court', type: 'string' },
  { key: 'openDate', header: 'Opened', type: 'date' },
  { key: 'nextDeadline', header: 'Next Deadline', type: 'date' },
  { key: 'billingType', header: 'Billing', type: 'string' },
  { key: 'totalBilled', header: 'Total Billed', type: 'currency' },
];

const CLIENT_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Name', type: 'string' },
  { key: 'type', header: 'Type', type: 'string' },
  { key: 'email', header: 'Email', type: 'string' },
  { key: 'phone', header: 'Phone', type: 'string' },
  { key: 'address', header: 'Address', type: 'string' },
  { key: 'companyName', header: 'Company', type: 'string' },
];

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);

const formatDate = (dateString?: string) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const generateCaseNumber = () => {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${year}-${random}`;
};

// Main Component
export const CaseManagementTool: React.FC<CaseManagementToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // useToolData hooks for backend sync
  const {
    data: cases,
    addItem: addCase,
    updateItem: updateCase,
    deleteItem: deleteCase,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    importCSV,
    importJSON,
    copyToClipboard,
    print,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<LegalCase>('legal-cases', [], CASE_COLUMNS);

  const {
    data: clients,
    addItem: addClient,
    updateItem: updateClient,
    deleteItem: deleteClient,
    isSynced: clientsSynced,
    isSaving: clientsSaving,
    lastSaved: clientsLastSaved,
    syncError: clientsSyncError,
    forceSync: forceClientsSync,
  } = useToolData<Client>('legal-clients', [], CLIENT_COLUMNS);

  const {
    data: activities,
    addItem: addActivity,
    deleteItem: deleteActivity,
  } = useToolData<CaseActivity>('legal-case-activities', [], []);

  // Local UI state
  const [activeTab, setActiveTab] = useState<'cases' | 'clients' | 'new-case' | 'new-client'>('cases');
  const [selectedCase, setSelectedCase] = useState<LegalCase | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<CaseStatus | 'all'>('all');
  const [filterType, setFilterType] = useState<CaseType | 'all'>('all');
  const [expandedCaseId, setExpandedCaseId] = useState<string | null>(null);
  const [editingCase, setEditingCase] = useState<LegalCase | null>(null);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // New case form state
  const [newCase, setNewCase] = useState<Partial<LegalCase>>({
    caseNumber: generateCaseNumber(),
    caseName: '',
    clientId: '',
    clientName: '',
    opposingParty: '',
    opposingCounsel: '',
    caseType: 'civil',
    status: 'intake',
    priority: 'medium',
    description: '',
    courtName: '',
    courtCaseNumber: '',
    judgeName: '',
    jurisdiction: '',
    leadAttorney: '',
    assignedAttorneys: [],
    paralegal: '',
    openDate: new Date().toISOString().split('T')[0],
    billingType: 'hourly',
    billingRate: 350,
    totalBilled: 0,
    totalPaid: 0,
    notes: '',
    tags: [],
  });

  // New client form state
  const [newClient, setNewClient] = useState<Partial<Client>>({
    name: '',
    email: '',
    phone: '',
    address: '',
    type: 'individual',
    companyName: '',
  });

  // Prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as any;
      if (params.caseName || params.caseNumber || params.clientName) {
        setNewCase({
          ...newCase,
          caseName: params.caseName || '',
          caseNumber: params.caseNumber || generateCaseNumber(),
          clientName: params.clientName || '',
          caseType: params.caseType || 'civil',
        });
        setActiveTab('new-case');
      }
    }
  }, [uiConfig?.params]);

  // Filter and search cases
  const filteredCases = useMemo(() => {
    return cases.filter(c => {
      const matchesSearch =
        c.caseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.leadAttorney.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
      const matchesType = filterType === 'all' || c.caseType === filterType;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [cases, searchTerm, filterStatus, filterType]);

  // Statistics
  const stats = useMemo(() => {
    const active = cases.filter(c => !['closed', 'settled'].includes(c.status)).length;
    const urgent = cases.filter(c => c.priority === 'urgent').length;
    const totalBilled = cases.reduce((sum, c) => sum + c.totalBilled, 0);
    const totalOutstanding = cases.reduce((sum, c) => sum + (c.totalBilled - c.totalPaid), 0);
    const upcomingDeadlines = cases.filter(c => {
      if (!c.nextDeadline) return false;
      const deadline = new Date(c.nextDeadline);
      const now = new Date();
      const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 7;
    }).length;
    return { active, urgent, totalBilled, totalOutstanding, upcomingDeadlines };
  }, [cases]);

  // Handlers
  const handleCreateCase = () => {
    if (!newCase.caseName || !newCase.clientName || !newCase.leadAttorney) {
      setValidationMessage('Please fill in all required fields');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const legalCase: LegalCase = {
      id: generateId(),
      caseNumber: newCase.caseNumber || generateCaseNumber(),
      caseName: newCase.caseName || '',
      clientId: newCase.clientId || '',
      clientName: newCase.clientName || '',
      opposingParty: newCase.opposingParty || '',
      opposingCounsel: newCase.opposingCounsel,
      caseType: newCase.caseType || 'civil',
      status: newCase.status || 'intake',
      priority: newCase.priority || 'medium',
      description: newCase.description || '',
      courtName: newCase.courtName,
      courtCaseNumber: newCase.courtCaseNumber,
      judgeName: newCase.judgeName,
      jurisdiction: newCase.jurisdiction,
      leadAttorney: newCase.leadAttorney || '',
      assignedAttorneys: newCase.assignedAttorneys || [],
      paralegal: newCase.paralegal,
      openDate: newCase.openDate || new Date().toISOString().split('T')[0],
      statueOfLimitations: newCase.statueOfLimitations,
      nextDeadline: newCase.nextDeadline,
      nextHearing: newCase.nextHearing,
      trialDate: newCase.trialDate,
      billingType: newCase.billingType || 'hourly',
      billingRate: newCase.billingRate,
      contingencyPercent: newCase.contingencyPercent,
      retainerAmount: newCase.retainerAmount,
      totalBilled: 0,
      totalPaid: 0,
      notes: newCase.notes || '',
      tags: newCase.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addCase(legalCase);
    setNewCase({
      caseNumber: generateCaseNumber(),
      caseName: '',
      clientId: '',
      clientName: '',
      opposingParty: '',
      caseType: 'civil',
      status: 'intake',
      priority: 'medium',
      description: '',
      leadAttorney: '',
      assignedAttorneys: [],
      openDate: new Date().toISOString().split('T')[0],
      billingType: 'hourly',
      billingRate: 350,
      totalBilled: 0,
      totalPaid: 0,
      notes: '',
      tags: [],
    });
    setActiveTab('cases');
  };

  const handleCreateClient = () => {
    if (!newClient.name || !newClient.email) {
      setValidationMessage('Please fill in all required fields');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const client: Client = {
      id: generateId(),
      name: newClient.name || '',
      email: newClient.email || '',
      phone: newClient.phone || '',
      address: newClient.address || '',
      type: newClient.type || 'individual',
      companyName: newClient.companyName,
    };

    addClient(client);
    setNewClient({
      name: '',
      email: '',
      phone: '',
      address: '',
      type: 'individual',
      companyName: '',
    });
    setActiveTab('clients');
  };

  const handleUpdateCase = (id: string, updates: Partial<LegalCase>) => {
    updateCase(id, { ...updates, updatedAt: new Date().toISOString() });
    if (editingCase?.id === id) {
      setEditingCase(null);
    }
  };

  const handleDeleteCase = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Case',
      message: 'Are you sure you want to delete this case? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteCase(id);
    }
  };

  const getStatusColor = (status: CaseStatus) => {
    return STATUS_OPTIONS.find(s => s.value === status)?.color || '';
  };

  const getPriorityColor = (priority: Priority) => {
    return PRIORITY_OPTIONS.find(p => p.value === priority)?.color || '';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
              <Scale className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t('tools.caseManagement.caseManagement', 'Case Management')}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('tools.caseManagement.legalCaseTrackingAndManagement', 'Legal case tracking and management')}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <WidgetEmbedButton toolSlug="case-management" toolName="Case Management" />

            <SyncStatus
              isSynced={isSynced && clientsSynced}
              isSaving={isSaving || clientsSaving}
              lastSaved={lastSaved || clientsLastSaved}
              syncError={syncError || clientsSyncError}
              onForceSync={() => { forceSync(); forceClientsSync(); }}
              theme="light"
            />
            <ExportDropdown
              onExportCSV={exportCSV}
              onExportExcel={exportExcel}
              onExportJSON={exportJSON}
              onExportPDF={exportPDF}
              onPrint={print}
              onCopyToClipboard={copyToClipboard}
              onImportCSV={importCSV}
              onImportJSON={importJSON}
              theme="light"
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Briefcase className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.active}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('tools.caseManagement.activeCases', 'Active Cases')}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-red-500" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.urgent}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('tools.caseManagement.urgentPriority', 'Urgent Priority')}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8 text-orange-500" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.upcomingDeadlines}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('tools.caseManagement.deadlines7Days', 'Deadlines (7 days)')}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.totalBilled)}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('tools.caseManagement.totalBilled', 'Total Billed')}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-purple-500" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{clients.length}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('tools.caseManagement.totalClients', 'Total Clients')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6">
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
          {[
            { id: 'cases', label: 'Cases', icon: Briefcase },
            { id: 'clients', label: 'Clients', icon: Users },
            { id: 'new-case', label: 'New Case', icon: Plus },
            { id: 'new-client', label: 'New Client', icon: Plus },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Cases List */}
        {activeTab === 'cases' && (
          <div className="space-y-4">
            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder={t('tools.caseManagement.searchCases', 'Search cases...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as CaseStatus | 'all')}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">{t('tools.caseManagement.allStatuses', 'All Statuses')}</option>
                {STATUS_OPTIONS.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as CaseType | 'all')}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">{t('tools.caseManagement.allTypes', 'All Types')}</option>
                {CASE_TYPE_OPTIONS.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            {/* Cases Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{t('tools.caseManagement.case', 'Case #')}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{t('tools.caseManagement.caseName', 'Case Name')}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{t('tools.caseManagement.client', 'Client')}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{t('tools.caseManagement.type', 'Type')}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{t('tools.caseManagement.status', 'Status')}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{t('tools.caseManagement.priority', 'Priority')}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{t('tools.caseManagement.leadAttorney', 'Lead Attorney')}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{t('tools.caseManagement.nextDeadline', 'Next Deadline')}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{t('tools.caseManagement.actions', 'Actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredCases.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                          {t('tools.caseManagement.noCasesFoundCreateA', 'No cases found. Create a new case to get started.')}
                        </td>
                      </tr>
                    ) : (
                      filteredCases.map(legalCase => (
                        <React.Fragment key={legalCase.id}>
                          <tr
                            className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                            onClick={() => setExpandedCaseId(expandedCaseId === legalCase.id ? null : legalCase.id)}
                          >
                            <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-white">{legalCase.caseNumber}</td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{legalCase.caseName}</td>
                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{legalCase.clientName}</td>
                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                              {CASE_TYPE_OPTIONS.find(t => t.value === legalCase.caseType)?.label}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(legalCase.status)}`}>
                                {STATUS_OPTIONS.find(s => s.value === legalCase.status)?.label}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`text-sm font-medium ${getPriorityColor(legalCase.priority)}`}>
                                {PRIORITY_OPTIONS.find(p => p.value === legalCase.priority)?.label}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{legalCase.leadAttorney}</td>
                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                              {legalCase.nextDeadline ? formatDate(legalCase.nextDeadline) : '-'}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={(e) => { e.stopPropagation(); setExpandedCaseId(expandedCaseId === legalCase.id ? null : legalCase.id); }}
                                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                >
                                  {expandedCaseId === legalCase.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleDeleteCase(legalCase.id); }}
                                  className="p-1 text-red-400 hover:text-red-600"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                          {expandedCaseId === legalCase.id && (
                            <tr>
                              <td colSpan={9} className="px-4 py-4 bg-gray-50 dark:bg-gray-700">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div>
                                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">{t('tools.caseManagement.caseDetails', 'Case Details')}</h4>
                                    <div className="space-y-1 text-sm">
                                      <p><span className="text-gray-500">{t('tools.caseManagement.court', 'Court:')}</span> {legalCase.courtName || 'N/A'}</p>
                                      <p><span className="text-gray-500">{t('tools.caseManagement.courtCase', 'Court Case #:')}</span> {legalCase.courtCaseNumber || 'N/A'}</p>
                                      <p><span className="text-gray-500">{t('tools.caseManagement.judge', 'Judge:')}</span> {legalCase.judgeName || 'N/A'}</p>
                                      <p><span className="text-gray-500">{t('tools.caseManagement.opposingParty', 'Opposing Party:')}</span> {legalCase.opposingParty}</p>
                                      <p><span className="text-gray-500">{t('tools.caseManagement.opposingCounsel', 'Opposing Counsel:')}</span> {legalCase.opposingCounsel || 'N/A'}</p>
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">{t('tools.caseManagement.dates', 'Dates')}</h4>
                                    <div className="space-y-1 text-sm">
                                      <p><span className="text-gray-500">{t('tools.caseManagement.opened', 'Opened:')}</span> {formatDate(legalCase.openDate)}</p>
                                      <p><span className="text-gray-500">{t('tools.caseManagement.statuteOfLimitations', 'Statute of Limitations:')}</span> {formatDate(legalCase.statueOfLimitations)}</p>
                                      <p><span className="text-gray-500">{t('tools.caseManagement.nextHearing', 'Next Hearing:')}</span> {formatDate(legalCase.nextHearing)}</p>
                                      <p><span className="text-gray-500">{t('tools.caseManagement.trialDate', 'Trial Date:')}</span> {formatDate(legalCase.trialDate)}</p>
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">{t('tools.caseManagement.billing', 'Billing')}</h4>
                                    <div className="space-y-1 text-sm">
                                      <p><span className="text-gray-500">{t('tools.caseManagement.type2', 'Type:')}</span> {BILLING_TYPE_OPTIONS.find(b => b.value === legalCase.billingType)?.label}</p>
                                      {legalCase.billingType === 'hourly' && <p><span className="text-gray-500">{t('tools.caseManagement.rate', 'Rate:')}</span> {formatCurrency(legalCase.billingRate || 0)}/hr</p>}
                                      {legalCase.billingType === 'contingency' && <p><span className="text-gray-500">{t('tools.caseManagement.contingency', 'Contingency:')}</span> {legalCase.contingencyPercent}%</p>}
                                      <p><span className="text-gray-500">{t('tools.caseManagement.totalBilled2', 'Total Billed:')}</span> {formatCurrency(legalCase.totalBilled)}</p>
                                      <p><span className="text-gray-500">{t('tools.caseManagement.totalPaid', 'Total Paid:')}</span> {formatCurrency(legalCase.totalPaid)}</p>
                                      <p><span className="text-gray-500">{t('tools.caseManagement.outstanding', 'Outstanding:')}</span> {formatCurrency(legalCase.totalBilled - legalCase.totalPaid)}</p>
                                    </div>
                                  </div>
                                </div>
                                {legalCase.description && (
                                  <div className="mt-4">
                                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">{t('tools.caseManagement.description', 'Description')}</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">{legalCase.description}</p>
                                  </div>
                                )}
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Clients List */}
        {activeTab === 'clients' && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{t('tools.caseManagement.name', 'Name')}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{t('tools.caseManagement.type3', 'Type')}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{t('tools.caseManagement.email', 'Email')}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{t('tools.caseManagement.phone', 'Phone')}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{t('tools.caseManagement.company', 'Company')}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{t('tools.caseManagement.cases', 'Cases')}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{t('tools.caseManagement.actions2', 'Actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {clients.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                          {t('tools.caseManagement.noClientsFoundAddA', 'No clients found. Add a new client to get started.')}
                        </td>
                      </tr>
                    ) : (
                      clients.map(client => {
                        const clientCases = cases.filter(c => c.clientId === client.id || c.clientName === client.name);
                        return (
                          <tr key={client.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{client.name}</td>
                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 capitalize">{client.type}</td>
                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{client.email}</td>
                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{client.phone}</td>
                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{client.companyName || '-'}</td>
                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{clientCases.length}</td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => deleteClient(client.id)}
                                className="p-1 text-red-400 hover:text-red-600"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* New Case Form */}
        {activeTab === 'new-case' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">{t('tools.caseManagement.createNewCase', 'Create New Case')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Case Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.caseManagement.caseNumber', 'Case Number')}</label>
                <input
                  type="text"
                  value={newCase.caseNumber}
                  onChange={(e) => setNewCase({ ...newCase, caseNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              {/* Case Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.caseManagement.caseName2', 'Case Name *')}</label>
                <input
                  type="text"
                  value={newCase.caseName}
                  onChange={(e) => setNewCase({ ...newCase, caseName: e.target.value })}
                  placeholder={t('tools.caseManagement.eGSmithVJones', 'e.g., Smith v. Jones')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              {/* Client Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.caseManagement.clientName', 'Client Name *')}</label>
                <input
                  type="text"
                  value={newCase.clientName}
                  onChange={(e) => setNewCase({ ...newCase, clientName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              {/* Opposing Party */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.caseManagement.opposingParty2', 'Opposing Party')}</label>
                <input
                  type="text"
                  value={newCase.opposingParty}
                  onChange={(e) => setNewCase({ ...newCase, opposingParty: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              {/* Case Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.caseManagement.caseType', 'Case Type')}</label>
                <select
                  value={newCase.caseType}
                  onChange={(e) => setNewCase({ ...newCase, caseType: e.target.value as CaseType })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {CASE_TYPE_OPTIONS.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.caseManagement.status2', 'Status')}</label>
                <select
                  value={newCase.status}
                  onChange={(e) => setNewCase({ ...newCase, status: e.target.value as CaseStatus })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {STATUS_OPTIONS.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.caseManagement.priority2', 'Priority')}</label>
                <select
                  value={newCase.priority}
                  onChange={(e) => setNewCase({ ...newCase, priority: e.target.value as Priority })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {PRIORITY_OPTIONS.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
              {/* Lead Attorney */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.caseManagement.leadAttorney2', 'Lead Attorney *')}</label>
                <input
                  type="text"
                  value={newCase.leadAttorney}
                  onChange={(e) => setNewCase({ ...newCase, leadAttorney: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              {/* Court Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.caseManagement.courtName', 'Court Name')}</label>
                <input
                  type="text"
                  value={newCase.courtName}
                  onChange={(e) => setNewCase({ ...newCase, courtName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              {/* Billing Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.caseManagement.billingType', 'Billing Type')}</label>
                <select
                  value={newCase.billingType}
                  onChange={(e) => setNewCase({ ...newCase, billingType: e.target.value as BillingType })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {BILLING_TYPE_OPTIONS.map(b => (
                    <option key={b.value} value={b.value}>{b.label}</option>
                  ))}
                </select>
              </div>
              {/* Billing Rate */}
              {newCase.billingType === 'hourly' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.caseManagement.hourlyRate', 'Hourly Rate ($)')}</label>
                  <input
                    type="number"
                    value={newCase.billingRate}
                    onChange={(e) => setNewCase({ ...newCase, billingRate: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              )}
              {/* Open Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.caseManagement.openDate', 'Open Date')}</label>
                <input
                  type="date"
                  value={newCase.openDate}
                  onChange={(e) => setNewCase({ ...newCase, openDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              {/* Description */}
              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.caseManagement.description2', 'Description')}</label>
                <textarea
                  value={newCase.description}
                  onChange={(e) => setNewCase({ ...newCase, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setActiveTab('cases')}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                {t('tools.caseManagement.cancel', 'Cancel')}
              </button>
              <button
                onClick={handleCreateCase}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {t('tools.caseManagement.createCase', 'Create Case')}
              </button>
            </div>
          </div>
        )}

        {/* New Client Form */}
        {activeTab === 'new-client' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">{t('tools.caseManagement.addNewClient', 'Add New Client')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Client Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.caseManagement.clientType', 'Client Type')}</label>
                <select
                  value={newClient.type}
                  onChange={(e) => setNewClient({ ...newClient, type: e.target.value as 'individual' | 'business' })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="individual">{t('tools.caseManagement.individual', 'Individual')}</option>
                  <option value="business">{t('tools.caseManagement.business', 'Business')}</option>
                </select>
              </div>
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {newClient.type === 'business' ? t('tools.caseManagement.contactName', 'Contact Name') : t('tools.caseManagement.fullName', 'Full Name')} *
                </label>
                <input
                  type="text"
                  value={newClient.name}
                  onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              {/* Company Name */}
              {newClient.type === 'business' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.caseManagement.companyName', 'Company Name')}</label>
                  <input
                    type="text"
                    value={newClient.companyName}
                    onChange={(e) => setNewClient({ ...newClient, companyName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              )}
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.caseManagement.email2', 'Email *')}</label>
                <input
                  type="email"
                  value={newClient.email}
                  onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.caseManagement.phone2', 'Phone')}</label>
                <input
                  type="tel"
                  value={newClient.phone}
                  onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              {/* Address */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.caseManagement.address', 'Address')}</label>
                <input
                  type="text"
                  value={newClient.address}
                  onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setActiveTab('clients')}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                {t('tools.caseManagement.cancel2', 'Cancel')}
              </button>
              <button
                onClick={handleCreateClient}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {t('tools.caseManagement.addClient', 'Add Client')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog />

      {/* Validation Toast */}
      {validationMessage && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2 z-50">
          <AlertCircle className="w-5 h-5" />
          <span>{validationMessage}</span>
        </div>
      )}
    </div>
  );
};

export default CaseManagementTool;
