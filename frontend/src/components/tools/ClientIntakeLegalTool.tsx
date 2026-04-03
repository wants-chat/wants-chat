'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  UserPlus,
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  Calendar,
  FileText,
  Plus,
  Trash2,
  Search,
  Edit2,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Clock,
  DollarSign,
  Briefcase,
  Scale,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Send,
  ClipboardList,
  Shield,
} from 'lucide-react';
import { UIConfig } from '../ContextualUI';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import useToolData from '../../hooks/useToolData';
import { type ColumnConfig } from '../../lib/toolDataUtils';

interface ClientIntakeLegalToolProps {
  uiConfig?: UIConfig;
}

// Types
type IntakeStatus = 'new' | 'in-progress' | 'pending-docs' | 'conflict-check' | 'approved' | 'rejected' | 'converted';
type ClientType = 'individual' | 'business' | 'government' | 'nonprofit';
type ReferralSource = 'website' | 'referral' | 'advertising' | 'social-media' | 'directory' | 'repeat-client' | 'other';
type MatterType = 'civil' | 'criminal' | 'family' | 'corporate' | 'real-estate' | 'immigration' | 'bankruptcy' | 'personal-injury' | 'employment' | 'intellectual-property' | 'estate-planning' | 'other';

interface ClientIntake {
  id: string;
  // Status & Tracking
  status: IntakeStatus;
  intakeDate: string;
  assignedTo: string;
  // Client Info
  clientType: ClientType;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  altPhone?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  dateOfBirth?: string;
  ssn?: string; // Last 4 only
  // Business Info (if applicable)
  companyName?: string;
  companyType?: string;
  ein?: string;
  // Matter Info
  matterType: MatterType;
  matterDescription: string;
  opposingParty?: string;
  incidentDate?: string;
  statueOfLimitations?: string;
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  // Conflict Check
  conflictCheckCompleted: boolean;
  conflictCheckDate?: string;
  conflictCheckBy?: string;
  conflictNotes?: string;
  // Referral
  referralSource: ReferralSource;
  referralName?: string;
  howHeard?: string;
  // Financial
  estimatedValue?: number;
  consultationFee?: number;
  consultationPaid: boolean;
  // Documents
  documentsReceived: string[];
  documentsNeeded: string[];
  // Notes
  initialNotes: string;
  internalNotes?: string;
  // Follow-up
  nextFollowUp?: string;
  followUpNotes?: string;
  // Metadata
  createdAt: string;
  updatedAt: string;
}

interface IntakeNote {
  id: string;
  intakeId: string;
  note: string;
  createdBy: string;
  createdAt: string;
}

// Constants
const STATUS_OPTIONS: { value: IntakeStatus; label: string; color: string }[] = [
  { value: 'new', label: 'New Intake', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  { value: 'in-progress', label: 'In Progress', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
  { value: 'pending-docs', label: 'Pending Documents', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
  { value: 'conflict-check', label: 'Conflict Check', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
  { value: 'approved', label: 'Approved', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
  { value: 'converted', label: 'Converted to Client', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' },
];

const CLIENT_TYPE_OPTIONS: { value: ClientType; label: string }[] = [
  { value: 'individual', label: 'Individual' },
  { value: 'business', label: 'Business' },
  { value: 'government', label: 'Government' },
  { value: 'nonprofit', label: 'Non-Profit' },
];

const MATTER_TYPE_OPTIONS: { value: MatterType; label: string }[] = [
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
  { value: 'estate-planning', label: 'Estate Planning' },
  { value: 'other', label: 'Other' },
];

const REFERRAL_SOURCE_OPTIONS: { value: ReferralSource; label: string }[] = [
  { value: 'website', label: 'Website' },
  { value: 'referral', label: 'Client Referral' },
  { value: 'advertising', label: 'Advertising' },
  { value: 'social-media', label: 'Social Media' },
  { value: 'directory', label: 'Legal Directory' },
  { value: 'repeat-client', label: 'Repeat Client' },
  { value: 'other', label: 'Other' },
];

const URGENCY_OPTIONS: { value: string; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: 'text-gray-500' },
  { value: 'medium', label: 'Medium', color: 'text-blue-500' },
  { value: 'high', label: 'High', color: 'text-orange-500' },
  { value: 'urgent', label: 'Urgent', color: 'text-red-500' },
];

const COMMON_DOCUMENTS = [
  'Photo ID',
  'Proof of Address',
  'Contract/Agreement',
  'Correspondence',
  'Police Report',
  'Medical Records',
  'Financial Documents',
  'Court Documents',
  'Insurance Policy',
  'Photos/Evidence',
];

// Column configuration for exports
const INTAKE_COLUMNS: ColumnConfig[] = [
  { key: 'intakeDate', header: 'Intake Date', type: 'date' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'firstName', header: 'First Name', type: 'string' },
  { key: 'lastName', header: 'Last Name', type: 'string' },
  { key: 'email', header: 'Email', type: 'string' },
  { key: 'phone', header: 'Phone', type: 'string' },
  { key: 'clientType', header: 'Client Type', type: 'string' },
  { key: 'matterType', header: 'Matter Type', type: 'string' },
  { key: 'urgency', header: 'Urgency', type: 'string' },
  { key: 'assignedTo', header: 'Assigned To', type: 'string' },
  { key: 'referralSource', header: 'Referral Source', type: 'string' },
  { key: 'conflictCheckCompleted', header: 'Conflict Cleared', type: 'string' },
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

const formatCurrency = (amount?: number) => {
  if (amount === undefined) return '-';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Main Component
export const ClientIntakeLegalTool: React.FC<ClientIntakeLegalToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  // useToolData hooks for backend sync
  const {
    data: intakes,
    addItem: addIntake,
    updateItem: updateIntake,
    deleteItem: deleteIntake,
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
  } = useToolData<ClientIntake>('legal-client-intakes', [], INTAKE_COLUMNS);

  const {
    data: notes,
    addItem: addNote,
    deleteItem: deleteNote,
  } = useToolData<IntakeNote>('legal-intake-notes', [], []);

  // Local UI state
  const [activeTab, setActiveTab] = useState<'list' | 'new' | 'view'>('list');
  const [selectedIntake, setSelectedIntake] = useState<ClientIntake | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<IntakeStatus | 'all'>('all');
  const [filterMatterType, setFilterMatterType] = useState<MatterType | 'all'>('all');
  const [expandedIntakeId, setExpandedIntakeId] = useState<string | null>(null);

  // New intake form state
  const [newIntake, setNewIntake] = useState<Partial<ClientIntake>>({
    status: 'new',
    intakeDate: new Date().toISOString().split('T')[0],
    assignedTo: '',
    clientType: 'individual',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    matterType: 'civil',
    matterDescription: '',
    urgency: 'medium',
    conflictCheckCompleted: false,
    referralSource: 'website',
    consultationPaid: false,
    documentsReceived: [],
    documentsNeeded: [],
    initialNotes: '',
  });

  // New note state
  const [newNote, setNewNote] = useState('');

  // Dialog and validation state
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // Prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as any;
      if (params.firstName || params.lastName || params.email || params.phone) {
        setNewIntake({
          ...newIntake,
          firstName: params.firstName || '',
          lastName: params.lastName || '',
          email: params.email || '',
          phone: params.phone || '',
          matterType: params.matterType || 'civil',
        });
        setActiveTab('new');
      }
    }
  }, [uiConfig?.params]);

  // Filter intakes
  const filteredIntakes = useMemo(() => {
    return intakes.filter(intake => {
      const fullName = `${intake.firstName} ${intake.lastName}`.toLowerCase();
      const matchesSearch =
        fullName.includes(searchTerm.toLowerCase()) ||
        intake.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        intake.phone.includes(searchTerm) ||
        intake.matterDescription.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || intake.status === filterStatus;
      const matchesMatter = filterMatterType === 'all' || intake.matterType === filterMatterType;
      return matchesSearch && matchesStatus && matchesMatter;
    });
  }, [intakes, searchTerm, filterStatus, filterMatterType]);

  // Statistics
  const stats = useMemo(() => {
    const newCount = intakes.filter(i => i.status === 'new').length;
    const inProgress = intakes.filter(i => ['in-progress', 'pending-docs', 'conflict-check'].includes(i.status)).length;
    const needsFollowUp = intakes.filter(i => {
      if (!i.nextFollowUp) return false;
      return new Date(i.nextFollowUp) <= new Date();
    }).length;
    const converted = intakes.filter(i => i.status === 'converted').length;
    const conversionRate = intakes.length > 0 ? (converted / intakes.length) * 100 : 0;
    return { newCount, inProgress, needsFollowUp, converted, conversionRate };
  }, [intakes]);

  // Handlers
  const handleCreateIntake = () => {
    if (!newIntake.firstName || !newIntake.lastName || !newIntake.email || !newIntake.matterDescription) {
      setValidationMessage('Please fill in all required fields');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const intake: ClientIntake = {
      id: generateId(),
      status: newIntake.status || 'new',
      intakeDate: newIntake.intakeDate || new Date().toISOString().split('T')[0],
      assignedTo: newIntake.assignedTo || '',
      clientType: newIntake.clientType || 'individual',
      firstName: newIntake.firstName || '',
      lastName: newIntake.lastName || '',
      email: newIntake.email || '',
      phone: newIntake.phone || '',
      altPhone: newIntake.altPhone,
      address: newIntake.address || '',
      city: newIntake.city || '',
      state: newIntake.state || '',
      zipCode: newIntake.zipCode || '',
      dateOfBirth: newIntake.dateOfBirth,
      ssn: newIntake.ssn,
      companyName: newIntake.companyName,
      companyType: newIntake.companyType,
      ein: newIntake.ein,
      matterType: newIntake.matterType || 'civil',
      matterDescription: newIntake.matterDescription || '',
      opposingParty: newIntake.opposingParty,
      incidentDate: newIntake.incidentDate,
      statueOfLimitations: newIntake.statueOfLimitations,
      urgency: newIntake.urgency || 'medium',
      conflictCheckCompleted: newIntake.conflictCheckCompleted || false,
      conflictCheckDate: newIntake.conflictCheckDate,
      conflictCheckBy: newIntake.conflictCheckBy,
      conflictNotes: newIntake.conflictNotes,
      referralSource: newIntake.referralSource || 'website',
      referralName: newIntake.referralName,
      howHeard: newIntake.howHeard,
      estimatedValue: newIntake.estimatedValue,
      consultationFee: newIntake.consultationFee,
      consultationPaid: newIntake.consultationPaid || false,
      documentsReceived: newIntake.documentsReceived || [],
      documentsNeeded: newIntake.documentsNeeded || [],
      initialNotes: newIntake.initialNotes || '',
      internalNotes: newIntake.internalNotes,
      nextFollowUp: newIntake.nextFollowUp,
      followUpNotes: newIntake.followUpNotes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addIntake(intake);
    setNewIntake({
      status: 'new',
      intakeDate: new Date().toISOString().split('T')[0],
      assignedTo: '',
      clientType: 'individual',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      matterType: 'civil',
      matterDescription: '',
      urgency: 'medium',
      conflictCheckCompleted: false,
      referralSource: 'website',
      consultationPaid: false,
      documentsReceived: [],
      documentsNeeded: [],
      initialNotes: '',
    });
    setActiveTab('list');
  };

  const handleUpdateIntake = (id: string, updates: Partial<ClientIntake>) => {
    updateIntake(id, { ...updates, updatedAt: new Date().toISOString() });
  };

  const handleDeleteIntake = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Intake',
      message: 'Are you sure you want to delete this intake?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteIntake(id);
      if (selectedIntake?.id === id) {
        setSelectedIntake(null);
        setActiveTab('list');
      }
    }
  };

  const handleAddNote = (intakeId: string) => {
    if (!newNote.trim()) return;

    const note: IntakeNote = {
      id: generateId(),
      intakeId,
      note: newNote,
      createdBy: 'Current User',
      createdAt: new Date().toISOString(),
    };

    addNote(note);
    setNewNote('');
  };

  const getStatusColor = (status: IntakeStatus) => {
    return STATUS_OPTIONS.find(s => s.value === status)?.color || '';
  };

  const getUrgencyColor = (urgency: string) => {
    return URGENCY_OPTIONS.find(u => u.value === urgency)?.color || '';
  };

  const toggleDocument = (doc: string, type: 'received' | 'needed') => {
    const field = type === 'received' ? 'documentsReceived' : 'documentsNeeded';
    const current = newIntake[field] || [];
    if (current.includes(doc)) {
      setNewIntake({ ...newIntake, [field]: current.filter(d => d !== doc) });
    } else {
      setNewIntake({ ...newIntake, [field]: [...current, doc] });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <UserPlus className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t('tools.clientIntakeLegal.legalClientIntake', 'Legal Client Intake')}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('tools.clientIntakeLegal.manageNewClientIntakeForms', 'Manage new client intake forms and screening')}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <WidgetEmbedButton toolSlug="client-intake-legal" toolName="Client Intake Legal" />

            <SyncStatus
              isSynced={isSynced}
              isSaving={isSaving}
              lastSaved={lastSaved}
              syncError={syncError}
              onForceSync={forceSync}
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
            <UserPlus className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.newCount}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('tools.clientIntakeLegal.newIntakes', 'New Intakes')}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-yellow-500" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.inProgress}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('tools.clientIntakeLegal.inProgress', 'In Progress')}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-8 h-8 text-red-500" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.needsFollowUp}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('tools.clientIntakeLegal.needsFollowUp', 'Needs Follow-up')}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.converted}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('tools.clientIntakeLegal.converted', 'Converted')}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Scale className="w-8 h-8 text-purple-500" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.conversionRate.toFixed(0)}%</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('tools.clientIntakeLegal.conversionRate', 'Conversion Rate')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6">
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
          {[
            { id: 'list', label: 'All Intakes', icon: ClipboardList },
            { id: 'new', label: 'New Intake', icon: Plus },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-green-500 text-green-600 dark:text-green-400'
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
        {/* Intakes List */}
        {activeTab === 'list' && (
          <div className="space-y-4">
            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder={t('tools.clientIntakeLegal.searchIntakes', 'Search intakes...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as IntakeStatus | 'all')}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">{t('tools.clientIntakeLegal.allStatuses', 'All Statuses')}</option>
                {STATUS_OPTIONS.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
              <select
                value={filterMatterType}
                onChange={(e) => setFilterMatterType(e.target.value as MatterType | 'all')}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">{t('tools.clientIntakeLegal.allMatterTypes', 'All Matter Types')}</option>
                {MATTER_TYPE_OPTIONS.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>

            {/* Intakes Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{t('tools.clientIntakeLegal.date', 'Date')}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{t('tools.clientIntakeLegal.name', 'Name')}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{t('tools.clientIntakeLegal.contact', 'Contact')}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{t('tools.clientIntakeLegal.matterType', 'Matter Type')}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{t('tools.clientIntakeLegal.urgency', 'Urgency')}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{t('tools.clientIntakeLegal.status', 'Status')}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{t('tools.clientIntakeLegal.conflict', 'Conflict')}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{t('tools.clientIntakeLegal.actions', 'Actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredIntakes.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                          {t('tools.clientIntakeLegal.noIntakesFoundCreateA', 'No intakes found. Create a new intake to get started.')}
                        </td>
                      </tr>
                    ) : (
                      filteredIntakes.map(intake => (
                        <React.Fragment key={intake.id}>
                          <tr
                            className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                            onClick={() => setExpandedIntakeId(expandedIntakeId === intake.id ? null : intake.id)}
                          >
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{formatDate(intake.intakeDate)}</td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                              {intake.firstName} {intake.lastName}
                              {intake.companyName && (
                                <span className="block text-xs text-gray-500">{intake.companyName}</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                              <div className="flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {intake.email}
                              </div>
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Phone className="w-3 h-3" />
                                {intake.phone}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                              {MATTER_TYPE_OPTIONS.find(m => m.value === intake.matterType)?.label}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`text-sm font-medium ${getUrgencyColor(intake.urgency)}`}>
                                {URGENCY_OPTIONS.find(u => u.value === intake.urgency)?.label}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(intake.status)}`}>
                                {STATUS_OPTIONS.find(s => s.value === intake.status)?.label}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              {intake.conflictCheckCompleted ? (
                                <CheckCircle className="w-5 h-5 text-green-500" />
                              ) : (
                                <AlertCircle className="w-5 h-5 text-yellow-500" />
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={(e) => { e.stopPropagation(); setExpandedIntakeId(expandedIntakeId === intake.id ? null : intake.id); }}
                                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                >
                                  {expandedIntakeId === intake.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleDeleteIntake(intake.id); }}
                                  className="p-1 text-red-400 hover:text-red-600"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                          {expandedIntakeId === intake.id && (
                            <tr>
                              <td colSpan={8} className="px-4 py-4 bg-gray-50 dark:bg-gray-700">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div>
                                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">{t('tools.clientIntakeLegal.clientDetails', 'Client Details')}</h4>
                                    <div className="space-y-1 text-sm">
                                      <p><span className="text-gray-500">{t('tools.clientIntakeLegal.type', 'Type:')}</span> {CLIENT_TYPE_OPTIONS.find(c => c.value === intake.clientType)?.label}</p>
                                      <p><span className="text-gray-500">{t('tools.clientIntakeLegal.address', 'Address:')}</span> {intake.address}, {intake.city}, {intake.state} {intake.zipCode}</p>
                                      {intake.dateOfBirth && <p><span className="text-gray-500">{t('tools.clientIntakeLegal.dob', 'DOB:')}</span> {formatDate(intake.dateOfBirth)}</p>}
                                      <p><span className="text-gray-500">{t('tools.clientIntakeLegal.referral', 'Referral:')}</span> {REFERRAL_SOURCE_OPTIONS.find(r => r.value === intake.referralSource)?.label}</p>
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">{t('tools.clientIntakeLegal.matterDetails', 'Matter Details')}</h4>
                                    <div className="space-y-1 text-sm">
                                      <p><span className="text-gray-500">{t('tools.clientIntakeLegal.opposingParty', 'Opposing Party:')}</span> {intake.opposingParty || 'N/A'}</p>
                                      <p><span className="text-gray-500">{t('tools.clientIntakeLegal.incidentDate', 'Incident Date:')}</span> {formatDate(intake.incidentDate)}</p>
                                      <p><span className="text-gray-500">{t('tools.clientIntakeLegal.statuteOfLimitations', 'Statute of Limitations:')}</span> {formatDate(intake.statueOfLimitations)}</p>
                                      <p><span className="text-gray-500">{t('tools.clientIntakeLegal.estValue', 'Est. Value:')}</span> {formatCurrency(intake.estimatedValue)}</p>
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">{t('tools.clientIntakeLegal.statusActions', 'Status Actions')}</h4>
                                    <div className="space-y-2">
                                      <select
                                        value={intake.status}
                                        onChange={(e) => handleUpdateIntake(intake.id, { status: e.target.value as IntakeStatus })}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                                      >
                                        {STATUS_OPTIONS.map(s => (
                                          <option key={s.value} value={s.value}>{s.label}</option>
                                        ))}
                                      </select>
                                      {!intake.conflictCheckCompleted && (
                                        <button
                                          onClick={() => handleUpdateIntake(intake.id, {
                                            conflictCheckCompleted: true,
                                            conflictCheckDate: new Date().toISOString().split('T')[0],
                                          })}
                                          className="w-full px-3 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                                        >
                                          {t('tools.clientIntakeLegal.markConflictCleared', 'Mark Conflict Cleared')}
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                {intake.matterDescription && (
                                  <div className="mt-4">
                                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">{t('tools.clientIntakeLegal.matterDescription', 'Matter Description')}</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">{intake.matterDescription}</p>
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

        {/* New Intake Form */}
        {activeTab === 'new' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">{t('tools.clientIntakeLegal.newClientIntake', 'New Client Intake')}</h2>

            {/* Client Type Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('tools.clientIntakeLegal.clientType', 'Client Type')}</label>
              <div className="flex gap-4">
                {CLIENT_TYPE_OPTIONS.map(type => (
                  <button
                    key={type.value}
                    onClick={() => setNewIntake({ ...newIntake, clientType: type.value })}
                    className={`px-4 py-2 rounded-lg border ${
                      newIntake.clientType === type.value
                        ? 'border-green-500 bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-200'
                        : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Personal Info */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.clientIntakeLegal.firstName', 'First Name *')}</label>
                <input
                  type="text"
                  value={newIntake.firstName}
                  onChange={(e) => setNewIntake({ ...newIntake, firstName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.clientIntakeLegal.lastName', 'Last Name *')}</label>
                <input
                  type="text"
                  value={newIntake.lastName}
                  onChange={(e) => setNewIntake({ ...newIntake, lastName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.clientIntakeLegal.email', 'Email *')}</label>
                <input
                  type="email"
                  value={newIntake.email}
                  onChange={(e) => setNewIntake({ ...newIntake, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.clientIntakeLegal.phone', 'Phone *')}</label>
                <input
                  type="tel"
                  value={newIntake.phone}
                  onChange={(e) => setNewIntake({ ...newIntake, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.clientIntakeLegal.intakeDate', 'Intake Date')}</label>
                <input
                  type="date"
                  value={newIntake.intakeDate}
                  onChange={(e) => setNewIntake({ ...newIntake, intakeDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.clientIntakeLegal.assignedTo', 'Assigned To')}</label>
                <input
                  type="text"
                  value={newIntake.assignedTo}
                  onChange={(e) => setNewIntake({ ...newIntake, assignedTo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Business Info */}
              {newIntake.clientType === 'business' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.clientIntakeLegal.companyName', 'Company Name')}</label>
                    <input
                      type="text"
                      value={newIntake.companyName}
                      onChange={(e) => setNewIntake({ ...newIntake, companyName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.clientIntakeLegal.companyType', 'Company Type')}</label>
                    <input
                      type="text"
                      value={newIntake.companyType}
                      onChange={(e) => setNewIntake({ ...newIntake, companyType: e.target.value })}
                      placeholder={t('tools.clientIntakeLegal.llcCorpEtc', 'LLC, Corp, etc.')}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </>
              )}

              {/* Address */}
              <div className="md:col-span-2 lg:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.clientIntakeLegal.address2', 'Address')}</label>
                  <input
                    type="text"
                    value={newIntake.address}
                    onChange={(e) => setNewIntake({ ...newIntake, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.clientIntakeLegal.city', 'City')}</label>
                  <input
                    type="text"
                    value={newIntake.city}
                    onChange={(e) => setNewIntake({ ...newIntake, city: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.clientIntakeLegal.state', 'State')}</label>
                    <input
                      type="text"
                      value={newIntake.state}
                      onChange={(e) => setNewIntake({ ...newIntake, state: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.clientIntakeLegal.zip', 'ZIP')}</label>
                    <input
                      type="text"
                      value={newIntake.zipCode}
                      onChange={(e) => setNewIntake({ ...newIntake, zipCode: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Matter Info */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.clientIntakeLegal.matterType2', 'Matter Type *')}</label>
                <select
                  value={newIntake.matterType}
                  onChange={(e) => setNewIntake({ ...newIntake, matterType: e.target.value as MatterType })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {MATTER_TYPE_OPTIONS.map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.clientIntakeLegal.urgency2', 'Urgency')}</label>
                <select
                  value={newIntake.urgency}
                  onChange={(e) => setNewIntake({ ...newIntake, urgency: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {URGENCY_OPTIONS.map(u => (
                    <option key={u.value} value={u.value}>{u.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.clientIntakeLegal.referralSource', 'Referral Source')}</label>
                <select
                  value={newIntake.referralSource}
                  onChange={(e) => setNewIntake({ ...newIntake, referralSource: e.target.value as ReferralSource })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {REFERRAL_SOURCE_OPTIONS.map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.clientIntakeLegal.opposingParty2', 'Opposing Party')}</label>
                <input
                  type="text"
                  value={newIntake.opposingParty}
                  onChange={(e) => setNewIntake({ ...newIntake, opposingParty: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.clientIntakeLegal.incidentDate2', 'Incident Date')}</label>
                <input
                  type="date"
                  value={newIntake.incidentDate}
                  onChange={(e) => setNewIntake({ ...newIntake, incidentDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.clientIntakeLegal.statuteOfLimitations2', 'Statute of Limitations')}</label>
                <input
                  type="date"
                  value={newIntake.statueOfLimitations}
                  onChange={(e) => setNewIntake({ ...newIntake, statueOfLimitations: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Matter Description */}
              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.clientIntakeLegal.matterDescription2', 'Matter Description *')}</label>
                <textarea
                  value={newIntake.matterDescription}
                  onChange={(e) => setNewIntake({ ...newIntake, matterDescription: e.target.value })}
                  rows={4}
                  placeholder={t('tools.clientIntakeLegal.describeTheLegalMatterIn', 'Describe the legal matter in detail...')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Initial Notes */}
              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.clientIntakeLegal.initialNotes', 'Initial Notes')}</label>
                <textarea
                  value={newIntake.initialNotes}
                  onChange={(e) => setNewIntake({ ...newIntake, initialNotes: e.target.value })}
                  rows={3}
                  placeholder={t('tools.clientIntakeLegal.additionalNotesFromIntakeCall', 'Additional notes from intake call...')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Documents Checklist */}
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{t('tools.clientIntakeLegal.documentsNeeded', 'Documents Needed')}</h3>
              <div className="flex flex-wrap gap-2">
                {COMMON_DOCUMENTS.map(doc => (
                  <button
                    key={doc}
                    onClick={() => toggleDocument(doc, 'needed')}
                    className={`px-3 py-1 text-sm rounded-full border ${
                      newIntake.documentsNeeded?.includes(doc)
                        ? 'border-green-500 bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-200'
                        : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    {doc}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setActiveTab('list')}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                {t('tools.clientIntakeLegal.cancel', 'Cancel')}
              </button>
              <button
                onClick={handleCreateIntake}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {t('tools.clientIntakeLegal.createIntake', 'Create Intake')}
              </button>
            </div>
          </div>
        )}

        {/* Validation Message Toast */}
        {validationMessage && (
          <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50">
            <AlertCircle className="w-5 h-5" />
            <span>{validationMessage}</span>
          </div>
        )}
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog />
    </div>
  );
};

export default ClientIntakeLegalTool;
