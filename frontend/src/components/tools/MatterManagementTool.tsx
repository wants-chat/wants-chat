'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  Briefcase,
  User,
  Calendar,
  DollarSign,
  Plus,
  Trash2,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  Edit2,
  Save,
  X,
  Clock,
  FileText,
  Users,
  Target,
  TrendingUp,
  Building,
  Scale,
} from 'lucide-react';
import { UIConfig } from '../ContextualUI';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import useToolData from '../../hooks/useToolData';
import { type ColumnConfig } from '../../lib/toolDataUtils';

interface MatterManagementToolProps {
  uiConfig?: UIConfig;
}

// Types
type MatterType = 'litigation' | 'transactional' | 'advisory' | 'regulatory' | 'ip' | 'employment' | 'real-estate' | 'corporate' | 'other';
type MatterStatus = 'active' | 'pending' | 'on-hold' | 'closed' | 'archived';
type BillingType = 'hourly' | 'flat-fee' | 'contingency' | 'hybrid' | 'pro-bono';
type Priority = 'urgent' | 'high' | 'medium' | 'low';

interface Matter {
  id: string;
  // Matter Info
  matterNumber: string;
  matterName: string;
  description: string;
  matterType: MatterType;
  practiceArea: string;
  // Client Info
  clientId: string;
  clientName: string;
  clientContact: string;
  clientEmail: string;
  clientPhone: string;
  // Team
  leadAttorney: string;
  originatingAttorney: string;
  teamMembers: string[];
  // Status & Dates
  status: MatterStatus;
  priority: Priority;
  openDate: string;
  closeDate?: string;
  statuteOfLimitations?: string;
  // Billing
  billingType: BillingType;
  hourlyRate?: number;
  flatFee?: number;
  contingencyPercent?: number;
  retainerAmount?: number;
  budgetAmount?: number;
  billedAmount: number;
  collectedAmount: number;
  // Opposing
  opposingParty?: string;
  opposingCounsel?: string;
  opposingCounselFirm?: string;
  // Court
  courtName?: string;
  caseNumber?: string;
  judgeName?: string;
  // Notes
  notes?: string;
  // Metadata
  createdAt: string;
  updatedAt: string;
}

// Constants
const MATTER_TYPES: { value: MatterType; label: string }[] = [
  { value: 'litigation', label: 'Litigation' },
  { value: 'transactional', label: 'Transactional' },
  { value: 'advisory', label: 'Advisory' },
  { value: 'regulatory', label: 'Regulatory' },
  { value: 'ip', label: 'Intellectual Property' },
  { value: 'employment', label: 'Employment' },
  { value: 'real-estate', label: 'Real Estate' },
  { value: 'corporate', label: 'Corporate' },
  { value: 'other', label: 'Other' },
];

const STATUS_OPTIONS: { value: MatterStatus; label: string; color: string }[] = [
  { value: 'active', label: 'Active', color: 'bg-green-100 text-green-800' },
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'on-hold', label: 'On Hold', color: 'bg-orange-100 text-orange-800' },
  { value: 'closed', label: 'Closed', color: 'bg-gray-100 text-gray-800' },
  { value: 'archived', label: 'Archived', color: 'bg-gray-100 text-gray-600' },
];

const BILLING_TYPES: { value: BillingType; label: string }[] = [
  { value: 'hourly', label: 'Hourly' },
  { value: 'flat-fee', label: 'Flat Fee' },
  { value: 'contingency', label: 'Contingency' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'pro-bono', label: 'Pro Bono' },
];

const PRIORITY_OPTIONS: { value: Priority; label: string; color: string }[] = [
  { value: 'urgent', label: 'Urgent', color: 'text-red-600 bg-red-50' },
  { value: 'high', label: 'High', color: 'text-orange-600 bg-orange-50' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-600 bg-yellow-50' },
  { value: 'low', label: 'Low', color: 'text-green-600 bg-green-50' },
];

// Column configuration for exports
const MATTER_COLUMNS: ColumnConfig[] = [
  { key: 'matterNumber', header: 'Matter #', type: 'string' },
  { key: 'matterName', header: 'Matter Name', type: 'string' },
  { key: 'clientName', header: 'Client', type: 'string' },
  { key: 'matterType', header: 'Type', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'leadAttorney', header: 'Lead Attorney', type: 'string' },
  { key: 'billingType', header: 'Billing Type', type: 'string' },
  { key: 'budgetAmount', header: 'Budget', type: 'currency' },
  { key: 'billedAmount', header: 'Billed', type: 'currency' },
  { key: 'collectedAmount', header: 'Collected', type: 'currency' },
  { key: 'openDate', header: 'Open Date', type: 'date' },
];

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);
const generateMatterNumber = () => `M-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;

const formatDate = (dateString?: string) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatCurrency = (amount?: number) => {
  if (!amount && amount !== 0) return '-';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount);
};

// Main Component
export const MatterManagementTool: React.FC<MatterManagementToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // useToolData hook for backend sync
  const {
    data: matters,
    addItem: addMatter,
    updateItem: updateMatter,
    deleteItem: deleteMatter,
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
  } = useToolData<Matter>('legal-matters', [], MATTER_COLUMNS);

  // Local UI state
  const [activeTab, setActiveTab] = useState<'list' | 'new' | 'details'>('list');
  const [selectedMatter, setSelectedMatter] = useState<Matter | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<MatterStatus | 'all'>('all');
  const [filterType, setFilterType] = useState<MatterType | 'all'>('all');

  // New matter form state
  const [newMatter, setNewMatter] = useState<Partial<Matter>>({
    matterNumber: generateMatterNumber(),
    matterName: '',
    description: '',
    matterType: 'litigation',
    practiceArea: '',
    clientId: '',
    clientName: '',
    clientContact: '',
    clientEmail: '',
    clientPhone: '',
    leadAttorney: '',
    originatingAttorney: '',
    teamMembers: [],
    status: 'active',
    priority: 'medium',
    openDate: new Date().toISOString().split('T')[0],
    billingType: 'hourly',
    billedAmount: 0,
    collectedAmount: 0,
  });

  // Team member input
  const [newTeamMember, setNewTeamMember] = useState('');

  // Filtered matters
  const filteredMatters = useMemo(() => {
    return matters.filter((matter) => {
      const matchesSearch =
        searchTerm === '' ||
        matter.matterNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        matter.matterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        matter.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        matter.leadAttorney.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = filterStatus === 'all' || matter.status === filterStatus;
      const matchesType = filterType === 'all' || matter.matterType === filterType;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [matters, searchTerm, filterStatus, filterType]);

  // Statistics
  const stats = useMemo(() => {
    const total = matters.length;
    const active = matters.filter((m) => m.status === 'active').length;
    const totalBilled = matters.reduce((sum, m) => sum + m.billedAmount, 0);
    const totalCollected = matters.reduce((sum, m) => sum + m.collectedAmount, 0);
    const outstanding = totalBilled - totalCollected;

    return { total, active, totalBilled, totalCollected, outstanding };
  }, [matters]);

  // Handlers
  const handleCreateMatter = () => {
    if (!newMatter.matterName || !newMatter.clientName) {
      setValidationMessage('Please fill in required fields (Matter Name, Client Name)');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const matter: Matter = {
      id: generateId(),
      matterNumber: newMatter.matterNumber || generateMatterNumber(),
      matterName: newMatter.matterName || '',
      description: newMatter.description || '',
      matterType: newMatter.matterType || 'other',
      practiceArea: newMatter.practiceArea || '',
      clientId: newMatter.clientId || generateId(),
      clientName: newMatter.clientName || '',
      clientContact: newMatter.clientContact || '',
      clientEmail: newMatter.clientEmail || '',
      clientPhone: newMatter.clientPhone || '',
      leadAttorney: newMatter.leadAttorney || '',
      originatingAttorney: newMatter.originatingAttorney || '',
      teamMembers: newMatter.teamMembers || [],
      status: newMatter.status || 'active',
      priority: newMatter.priority || 'medium',
      openDate: newMatter.openDate || new Date().toISOString().split('T')[0],
      closeDate: newMatter.closeDate,
      statuteOfLimitations: newMatter.statuteOfLimitations,
      billingType: newMatter.billingType || 'hourly',
      hourlyRate: newMatter.hourlyRate,
      flatFee: newMatter.flatFee,
      contingencyPercent: newMatter.contingencyPercent,
      retainerAmount: newMatter.retainerAmount,
      budgetAmount: newMatter.budgetAmount,
      billedAmount: newMatter.billedAmount || 0,
      collectedAmount: newMatter.collectedAmount || 0,
      opposingParty: newMatter.opposingParty,
      opposingCounsel: newMatter.opposingCounsel,
      opposingCounselFirm: newMatter.opposingCounselFirm,
      courtName: newMatter.courtName,
      caseNumber: newMatter.caseNumber,
      judgeName: newMatter.judgeName,
      notes: newMatter.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addMatter(matter);
    resetForm();
    setActiveTab('list');
  };

  const resetForm = () => {
    setNewMatter({
      matterNumber: generateMatterNumber(),
      matterName: '',
      description: '',
      matterType: 'litigation',
      practiceArea: '',
      clientId: '',
      clientName: '',
      clientContact: '',
      clientEmail: '',
      clientPhone: '',
      leadAttorney: '',
      originatingAttorney: '',
      teamMembers: [],
      status: 'active',
      priority: 'medium',
      openDate: new Date().toISOString().split('T')[0],
      billingType: 'hourly',
      billedAmount: 0,
      collectedAmount: 0,
    });
    setNewTeamMember('');
  };

  const handleAddTeamMember = () => {
    if (newTeamMember.trim() && !newMatter.teamMembers?.includes(newTeamMember.trim())) {
      setNewMatter({
        ...newMatter,
        teamMembers: [...(newMatter.teamMembers || []), newTeamMember.trim()],
      });
      setNewTeamMember('');
    }
  };

  const handleRemoveTeamMember = (member: string) => {
    setNewMatter({
      ...newMatter,
      teamMembers: newMatter.teamMembers?.filter((m) => m !== member) || [],
    });
  };

  const handleDeleteMatter = async (id: string) => {
    const confirmed = await confirm({
      title: 'Confirm Action',
      message: 'Are you sure you want to delete this matter?',
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (!confirmed) return;
    deleteMatter(id);
    if (selectedMatter?.id === id) {
      setSelectedMatter(null);
      setActiveTab('list');
    }
  };

  const getStatusBadge = (status: MatterStatus) => {
    const option = STATUS_OPTIONS.find((s) => s.value === status);
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${option?.color}`}>
        {option?.label}
      </span>
    );
  };

  const getPriorityBadge = (priority: Priority) => {
    const option = PRIORITY_OPTIONS.find((p) => p.value === priority);
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${option?.color}`}>
        {option?.label}
      </span>
    );
  };

  return (
    <>
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Briefcase className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{t('tools.matterManagement.matterManagement', 'Matter Management')}</h1>
                <p className="text-gray-600">{t('tools.matterManagement.manageLegalMattersAndCases', 'Manage legal matters and cases')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="matter-management" toolName="Matter Management" />

              <SyncStatus
                isSynced={isSynced}
                isSaving={isSaving}
                lastSaved={lastSaved}
                syncError={syncError}
                onForceSync={forceSync}
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
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">{t('tools.matterManagement.totalMatters', 'Total Matters')}</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              <div className="text-sm text-gray-600">{t('tools.matterManagement.active', 'Active')}</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">{formatCurrency(stats.totalBilled)}</div>
              <div className="text-sm text-gray-600">{t('tools.matterManagement.totalBilled', 'Total Billed')}</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalCollected)}</div>
              <div className="text-sm text-gray-600">{t('tools.matterManagement.collected', 'Collected')}</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-orange-600">{formatCurrency(stats.outstanding)}</div>
              <div className="text-sm text-gray-600">{t('tools.matterManagement.outstanding', 'Outstanding')}</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('list')}
              className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                activeTab === 'list'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Briefcase className="w-4 h-4 inline mr-2" />
              {t('tools.matterManagement.allMatters', 'All Matters')}
            </button>
            <button
              onClick={() => setActiveTab('new')}
              className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                activeTab === 'new'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Plus className="w-4 h-4 inline mr-2" />
              {t('tools.matterManagement.newMatter2', 'New Matter')}
            </button>
            {selectedMatter && (
              <button
                onClick={() => setActiveTab('details')}
                className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                  activeTab === 'details'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <FileText className="w-4 h-4 inline mr-2" />
                {t('tools.matterManagement.details', 'Details')}
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        {activeTab === 'list' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            {/* Search and Filters */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder={t('tools.matterManagement.searchByMatterNameClient', 'Search by matter #, name, client, or attorney...')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as MatterStatus | 'all')}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">{t('tools.matterManagement.allStatuses', 'All Statuses')}</option>
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as MatterType | 'all')}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">{t('tools.matterManagement.allTypes', 'All Types')}</option>
                  {MATTER_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Matter List */}
            <div className="divide-y divide-gray-200">
              {filteredMatters.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Briefcase className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>{t('tools.matterManagement.noMattersFound', 'No matters found')}</p>
                </div>
              ) : (
                filteredMatters.map((matter) => (
                  <div
                    key={matter.id}
                    className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => {
                      setSelectedMatter(matter);
                      setActiveTab('details');
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div>
                          <div className="font-medium text-gray-900">{matter.matterName}</div>
                          <div className="text-sm text-gray-500">
                            {matter.matterNumber} | {matter.clientName}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">{matter.leadAttorney}</div>
                          <div className="text-xs text-gray-500">{formatDate(matter.openDate)}</div>
                        </div>
                        {getPriorityBadge(matter.priority)}
                        {getStatusBadge(matter.status)}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteMatter(matter.id);
                          }}
                          className="p-1 text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'new' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('tools.matterManagement.newMatter', 'New Matter')}</h2>

            {/* Matter Info */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600" />
                {t('tools.matterManagement.matterInformation', 'Matter Information')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.matterManagement.matterNumber', 'Matter Number')}</label>
                  <input
                    type="text"
                    value={newMatter.matterNumber || ''}
                    onChange={(e) => setNewMatter({ ...newMatter, matterNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Matter Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newMatter.matterName || ''}
                    onChange={(e) => setNewMatter({ ...newMatter, matterName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.matterManagement.matterType', 'Matter Type')}</label>
                  <select
                    value={newMatter.matterType || 'litigation'}
                    onChange={(e) => setNewMatter({ ...newMatter, matterType: e.target.value as MatterType })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {MATTER_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.matterManagement.priority', 'Priority')}</label>
                  <select
                    value={newMatter.priority || 'medium'}
                    onChange={(e) => setNewMatter({ ...newMatter, priority: e.target.value as Priority })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {PRIORITY_OPTIONS.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.matterManagement.practiceArea', 'Practice Area')}</label>
                  <input
                    type="text"
                    value={newMatter.practiceArea || ''}
                    onChange={(e) => setNewMatter({ ...newMatter, practiceArea: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.matterManagement.description', 'Description')}</label>
                  <textarea
                    value={newMatter.description || ''}
                    onChange={(e) => setNewMatter({ ...newMatter, description: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Client Info */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                {t('tools.matterManagement.clientInformation', 'Client Information')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Client Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newMatter.clientName || ''}
                    onChange={(e) => setNewMatter({ ...newMatter, clientName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.matterManagement.contactPerson', 'Contact Person')}</label>
                  <input
                    type="text"
                    value={newMatter.clientContact || ''}
                    onChange={(e) => setNewMatter({ ...newMatter, clientContact: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.matterManagement.email', 'Email')}</label>
                  <input
                    type="email"
                    value={newMatter.clientEmail || ''}
                    onChange={(e) => setNewMatter({ ...newMatter, clientEmail: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.matterManagement.phone', 'Phone')}</label>
                  <input
                    type="tel"
                    value={newMatter.clientPhone || ''}
                    onChange={(e) => setNewMatter({ ...newMatter, clientPhone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Team */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                {t('tools.matterManagement.legalTeam', 'Legal Team')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.matterManagement.leadAttorney', 'Lead Attorney')}</label>
                  <input
                    type="text"
                    value={newMatter.leadAttorney || ''}
                    onChange={(e) => setNewMatter({ ...newMatter, leadAttorney: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.matterManagement.originatingAttorney', 'Originating Attorney')}</label>
                  <input
                    type="text"
                    value={newMatter.originatingAttorney || ''}
                    onChange={(e) => setNewMatter({ ...newMatter, originatingAttorney: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('tools.matterManagement.teamMembers', 'Team Members')}</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {newMatter.teamMembers?.map((member) => (
                    <span
                      key={member}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {member}
                      <button onClick={() => handleRemoveTeamMember(member)} className="hover:text-blue-600">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTeamMember}
                    onChange={(e) => setNewTeamMember(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTeamMember()}
                    placeholder={t('tools.matterManagement.addTeamMember', 'Add team member...')}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <button onClick={handleAddTeamMember} className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Billing */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-blue-600" />
                {t('tools.matterManagement.billing', 'Billing')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.matterManagement.billingType', 'Billing Type')}</label>
                  <select
                    value={newMatter.billingType || 'hourly'}
                    onChange={(e) => setNewMatter({ ...newMatter, billingType: e.target.value as BillingType })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {BILLING_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                {newMatter.billingType === 'hourly' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.matterManagement.hourlyRate', 'Hourly Rate')}</label>
                    <input
                      type="number"
                      value={newMatter.hourlyRate || ''}
                      onChange={(e) => setNewMatter({ ...newMatter, hourlyRate: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder={t('tools.matterManagement.0Hr', '$0/hr')}
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.matterManagement.retainer', 'Retainer')}</label>
                  <input
                    type="number"
                    value={newMatter.retainerAmount || ''}
                    onChange={(e) => setNewMatter({ ...newMatter, retainerAmount: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="$0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.matterManagement.budget', 'Budget')}</label>
                  <input
                    type="number"
                    value={newMatter.budgetAmount || ''}
                    onChange={(e) => setNewMatter({ ...newMatter, budgetAmount: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="$0"
                  />
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                {t('tools.matterManagement.dates', 'Dates')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.matterManagement.openDate', 'Open Date')}</label>
                  <input
                    type="date"
                    value={newMatter.openDate || ''}
                    onChange={(e) => setNewMatter({ ...newMatter, openDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.matterManagement.statuteOfLimitations', 'Statute of Limitations')}</label>
                  <input
                    type="date"
                    value={newMatter.statuteOfLimitations || ''}
                    onChange={(e) => setNewMatter({ ...newMatter, statuteOfLimitations: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-4">
              <button onClick={resetForm} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                {t('tools.matterManagement.reset', 'Reset')}
              </button>
              <button
                onClick={handleCreateMatter}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {t('tools.matterManagement.createMatter', 'Create Matter')}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'details' && selectedMatter && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{selectedMatter.matterName}</h2>
                <p className="text-gray-500">{selectedMatter.matterNumber}</p>
              </div>
              <div className="flex items-center gap-2">
                {getPriorityBadge(selectedMatter.priority)}
                {getStatusBadge(selectedMatter.status)}
              </div>
            </div>

            {/* Status Update */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('tools.matterManagement.updateStatus', 'Update Status')}</label>
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map((status) => (
                  <button
                    key={status.value}
                    onClick={() => updateMatter(selectedMatter.id, { status: status.value, updatedAt: new Date().toISOString() })}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                      selectedMatter.status === status.value
                        ? status.color + ' ring-2 ring-offset-2 ring-gray-400'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {t('tools.matterManagement.client', 'Client')}
                </h3>
                <div className="text-gray-600">{selectedMatter.clientName}</div>
                {selectedMatter.clientContact && <div className="text-gray-600">Contact: {selectedMatter.clientContact}</div>}
                {selectedMatter.clientEmail && <div className="text-gray-600">{selectedMatter.clientEmail}</div>}
                {selectedMatter.clientPhone && <div className="text-gray-600">{selectedMatter.clientPhone}</div>}
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {t('tools.matterManagement.legalTeam2', 'Legal Team')}
                </h3>
                <div className="text-gray-600">
                  <span className="font-medium">{t('tools.matterManagement.lead', 'Lead:')}</span> {selectedMatter.leadAttorney}
                </div>
                {selectedMatter.originatingAttorney && (
                  <div className="text-gray-600">
                    <span className="font-medium">{t('tools.matterManagement.originating', 'Originating:')}</span> {selectedMatter.originatingAttorney}
                  </div>
                )}
                {selectedMatter.teamMembers && selectedMatter.teamMembers.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {selectedMatter.teamMembers.map((member) => (
                      <span key={member} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                        {member}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  {t('tools.matterManagement.billing2', 'Billing')}
                </h3>
                <div className="text-gray-600">
                  <span className="font-medium">{t('tools.matterManagement.type', 'Type:')}</span> {BILLING_TYPES.find((t) => t.value === selectedMatter.billingType)?.label}
                </div>
                {selectedMatter.budgetAmount && (
                  <div className="text-gray-600">
                    <span className="font-medium">{t('tools.matterManagement.budget2', 'Budget:')}</span> {formatCurrency(selectedMatter.budgetAmount)}
                  </div>
                )}
                <div className="text-gray-600">
                  <span className="font-medium">{t('tools.matterManagement.billed', 'Billed:')}</span> {formatCurrency(selectedMatter.billedAmount)}
                </div>
                <div className="text-gray-600">
                  <span className="font-medium">{t('tools.matterManagement.collected2', 'Collected:')}</span> {formatCurrency(selectedMatter.collectedAmount)}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {t('tools.matterManagement.dates2', 'Dates')}
                </h3>
                <div className="text-gray-600">
                  <span className="font-medium">{t('tools.matterManagement.opened', 'Opened:')}</span> {formatDate(selectedMatter.openDate)}
                </div>
                {selectedMatter.statuteOfLimitations && (
                  <div className="text-gray-600">
                    <span className="font-medium">{t('tools.matterManagement.sol', 'SOL:')}</span> {formatDate(selectedMatter.statuteOfLimitations)}
                  </div>
                )}
              </div>
            </div>

            {selectedMatter.description && (
              <div className="mt-6">
                <h3 className="font-medium text-gray-900 mb-2">{t('tools.matterManagement.description2', 'Description')}</h3>
                <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">{selectedMatter.description}</p>
              </div>
            )}
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

export default MatterManagementTool;
